import type { MainStatement } from '../parser/types';

// Injected into Teenager.java so we can read field values after each operation.
// Uses string concatenation (not JSON library) to stay compatible with basic Java.
const STATE_REPORTER_METHOD = `
    public String getTeenSimState() {
        return "{\\"energy\\":" + energy
            + ",\\"happiness\\":" + happiness
            + ",\\"gpa\\":" + gpa
            + ",\\"phoneBattery\\":" + phoneBattery
            + ",\\"isHungry\\":" + isHungry + "}";
    }`;

export function instrumentTeenager(code: string): string {
  // Inject before the last closing brace of the class
  const lastBrace = code.lastIndexOf('}');
  if (lastBrace === -1) return code + '\n' + STATE_REPORTER_METHOD + '\n}';
  return code.slice(0, lastBrace) + STATE_REPORTER_METHOD + '\n' + code.slice(lastBrace);
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
