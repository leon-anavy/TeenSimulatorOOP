import type { MainStatement } from '../parser/types';

// Generates getTeenSimState() using only fields the student actually declared.
function buildStateReporter(fieldNames: string[]): string {
  if (fieldNames.length === 0) {
    return `\n    public String getTeenSimState() { return "{}"; }`;
  }
  const pairs = fieldNames.map(
    (f, i) => (i === 0 ? `"{\\"${f}\\":" + ${f}` : `+ ",\\"${f}\\":" + ${f}`)
  );
  return (
    `\n    public String getTeenSimState() {\n` +
    `        return ${pairs.join('\n            ')} + "}";\n` +
    `    }`
  );
}

export function instrumentTeenager(code: string, fieldNames: string[]): string {
  const method = buildStateReporter(fieldNames);
  const lastBrace = code.lastIndexOf('}');
  if (lastBrace === -1) return code + '\n' + method + '\n}';
  return code.slice(0, lastBrace) + method + '\n' + code.slice(lastBrace);
}

/**
 * Merge Teenager.java + Main.java into a single source file for single-file
 * executors (e.g. Judge0). Makes Teenager class non-public so Java allows
 * two classes in one file.
 */
export function mergeForSingleFile(teenagerCode: string, mainCode: string): string {
  const singleFileTeenager = teenagerCode.replace(
    /\bpublic\s+(class\s+Teenager\b)/,
    '$1'
  );
  return singleFileTeenager + '\n\n' + mainCode;
}

export function instrumentMain(code: string, statements: MainStatement[]): string {
  const lines = code.split('\n');

  // Build a list of (0-based lineIndex, text to insert after that line).
  // Sort descending so splicing doesn't shift subsequent indices.
  const injections: Array<{ lineIndex: number; text: string }> = [];

  for (const stmt of statements) {
    const lineIndex = stmt.line - 1; // parser lines are 1-based
    if (stmt.kind === 'INSTANTIATE') {
      injections.push({
        lineIndex,
        text: `        System.out.println("__TS__|new|${stmt.varName}|" + ${stmt.varName}.getTeenSimState());`,
      });
    } else if (stmt.kind === 'METHOD_CALL') {
      injections.push({
        lineIndex,
        text: `        System.out.println("__TS__|call|${stmt.methodName}|${stmt.varName}|" + ${stmt.varName}.getTeenSimState());`,
      });
    }
  }

  injections.sort((a, b) => b.lineIndex - a.lineIndex);

  for (const { lineIndex, text } of injections) {
    lines.splice(lineIndex + 1, 0, text);
  }

  return lines.join('\n');
}
