import type { MainStatement, ParseError, SymbolTable } from '../parser/types';

export function validateStatements(
  statements: MainStatement[],
  symbolTable: SymbolTable,
  knownInstances: Set<string>
): ParseError[] {
  const errors: ParseError[] = [];

  for (const stmt of statements) {
    if (stmt.kind === 'INSTANTIATE') {
      // Nothing special — just note that this variable is now known
      knownInstances.add(stmt.varName);
      continue;
    }

    if (stmt.kind === 'METHOD_CALL') {
      if (!knownInstances.has(stmt.varName)) {
        errors.push({
          kind: 'UNDEFINED_VARIABLE',
          message: `שורה ${stmt.line}: המשתנה "${stmt.varName}" לא הוגדר. צור אובייקט קודם עם: Teenager ${stmt.varName} = new Teenager();`,
          line: stmt.line,
        });
        continue;
      }
      if (!symbolTable.publicMethods.has(stmt.methodName)) {
        errors.push({
          kind: 'UNDEFINED_METHOD',
          message: `שורה ${stmt.line}: המתודה "${stmt.methodName}" לא קיימת ב-Teenager. בדוק את השם או הגדר את המתודה ב-Teenager.java.`,
          line: stmt.line,
        });
        continue;
      }
      // Arity check
      const methodDef = symbolTable.publicMethods.get(stmt.methodName)!;
      if (stmt.args.length !== methodDef.params.length) {
        const expected = methodDef.params.length;
        const got = stmt.args.length;
        errors.push({
          kind: 'WRONG_ARG_COUNT',
          message: `שורה ${stmt.line}: המתודה "${stmt.methodName}" מצפה ל-${expected} פרמטר${expected !== 1 ? 'ים' : ''}, אך קיבלה ${got}.`,
          line: stmt.line,
          suggestion: expected === 0
            ? `קרא למתודה בלי ארגומנטים: ${stmt.varName}.${stmt.methodName}()`
            : `ספק ${expected} ארגומנט${expected !== 1 ? 'ים' : ''}: ${methodDef.params.map(p => `${p.javaType} ${p.name}`).join(', ')}`,
        });
      }
      continue;
    }

    if (stmt.kind === 'FIELD_WRITE') {
      if (!knownInstances.has(stmt.varName)) {
        errors.push({
          kind: 'UNDEFINED_VARIABLE',
          message: `שורה ${stmt.line}: המשתנה "${stmt.varName}" לא הוגדר.`,
          line: stmt.line,
        });
        continue;
      }
      if (symbolTable.privateFields.has(stmt.fieldName)) {
        errors.push({
          kind: 'ENCAPSULATION_VIOLATION',
          message: `שורה ${stmt.line}: ניסית לגשת ישירות לשדה הפרטי "${stmt.fieldName}". זהו עיקרון האנקפסולציה!`,
          line: stmt.line,
          suggestion: `השתמש בפונקציה ציבורית (setter)`,
        });
      }
      continue;
    }

    if (stmt.kind === 'PRINT' && stmt.arg.kind === 'field_access') {
      if (symbolTable.privateFields.has(stmt.arg.fieldName)) {
        errors.push({
          kind: 'ENCAPSULATION_VIOLATION',
          message: `שורה ${stmt.line}: ניסית לגשת ישירות לשדה הפרטי "${stmt.arg.fieldName}" דרך println. זהו עיקרון האנקפסולציה!`,
          line: stmt.line,
          suggestion: `השתמש ב-toString() כדי להדפיס את האובייקט`,
        });
      }
      continue;
    }
  }

  return errors;
}
