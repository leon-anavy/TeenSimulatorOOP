import type { MainStatement, MainParseResult, ParseError, PrintArg, SymbolTable } from './types';
import { tokenize } from './tokenizer';

export function parseMain(source: string, symbolTable: SymbolTable | null): MainParseResult {
  const tokens = tokenize(source);
  const statements: MainStatement[] = [];
  const errors: ParseError[] = [];

  let i = 0;
  const peek = (offset = 0) => tokens[i + offset] ?? null;
  const consume = () => tokens[i++];

  // Skip class wrapper if student wrote "class Main { public static void main ... { ... } }"
  // We parse the inner statements regardless.

  while (i < tokens.length) {
    const t = peek();
    if (!t) break;

    // Skip class/method wrappers
    if (t.type === 'KEYWORD' && (t.value === 'class' || t.value === 'public' || t.value === 'private')) {
      // public class Main { ... }  or  public static void main(...) {
      // skip until we find a simple statement or end
      // heuristic: if next tokens match "void <name> (...)" it's a method def → skip it
      const ahead1 = peek(1);
      if (
        (t.value === 'public' && ahead1?.value === 'class') ||
        (t.value === 'public' && ahead1?.value === 'static') ||
        (t.value === 'public' && ahead1?.value === 'void') ||
        (t.value === 'class')
      ) {
        // Look for the opening brace and skip it (we parse inside)
        while (i < tokens.length && peek()?.type !== 'LBRACE' && peek()?.type !== 'SEMICOLON') consume();
        if (peek()?.type === 'LBRACE') consume(); // consume the opening brace
        continue;
      }
      // lone "public" or "private" before a type — likely class member
      if (ahead1 && (ahead1.value === 'int' || ahead1.value === 'double' || ahead1.value === 'boolean' || ahead1.value === 'String')) {
        // field definition in Main — pedagogical error
        errors.push({
          kind: 'METHOD_IN_MAIN',
          message: `שורה ${t.line}: הגדרת שדות שייכת לקובץ Teenager.java, לא ל-Main.java`,
          line: t.line,
        });
        while (i < tokens.length && peek()?.type !== 'SEMICOLON') consume();
        consume(); // semicolon
        continue;
      }
      consume();
      continue;
    }

    // Skip closing braces (from class/method wrappers)
    if (t.type === 'RBRACE') { consume(); continue; }
    if (t.type === 'SEMICOLON') { consume(); continue; }

    // Teenager t1 = new Teenager();
    // <Identifier> <Identifier> = new <Identifier> ( ) ;
    if (
      t.type === 'IDENTIFIER' &&
      peek(1)?.type === 'IDENTIFIER' &&
      peek(2)?.type === 'ASSIGN' &&
      peek(3)?.type === 'KEYWORD' && peek(3)?.value === 'new' &&
      peek(4)?.type === 'IDENTIFIER'
    ) {
      const className = t.value;
      const varName = peek(1)!.value;
      const line = t.line;
      consume(); consume(); consume(); consume(); // type varName = new
      consume(); // ClassName
      consume(); // (
      consume(); // )
      consume(); // ;
      statements.push({ kind: 'INSTANTIATE', varName, className, line });
      continue;
    }

    // System.out.println(expr);
    if (
      t.type === 'IDENTIFIER' && t.value === 'System' &&
      peek(1)?.type === 'DOT' &&
      peek(2)?.value === 'out' &&
      peek(3)?.type === 'DOT' &&
      peek(4)?.value === 'println' &&
      peek(5)?.type === 'LPAREN'
    ) {
      const line = t.line;
      consume(); consume(); consume(); consume(); consume(); consume(); // System . out . println (
      let arg: PrintArg = { kind: 'raw', text: '' };
      const argTok = peek();
      if (argTok?.type === 'LITERAL_STRING') {
        arg = { kind: 'literal', value: argTok.value.slice(1, -1) }; consume();
      } else if (argTok?.type === 'LITERAL_INT') {
        arg = { kind: 'literal', value: parseInt(argTok.value, 10) }; consume();
      } else if (argTok?.type === 'LITERAL_DOUBLE') {
        arg = { kind: 'literal', value: parseFloat(argTok.value) }; consume();
      } else if (argTok?.type === 'LITERAL_BOOL') {
        arg = { kind: 'literal', value: argTok.value === 'true' }; consume();
      } else if (argTok?.type === 'IDENTIFIER' && peek(1)?.type === 'DOT' && peek(2)?.type === 'IDENTIFIER') {
        arg = { kind: 'field_access', varName: argTok.value, fieldName: peek(2)!.value };
        consume(); consume(); consume();
      } else if (argTok?.type === 'IDENTIFIER') {
        arg = { kind: 'raw', text: argTok.value }; consume();
      }
      while (i < tokens.length && peek()?.type !== 'RPAREN') consume();
      if (peek()?.type === 'RPAREN') consume();
      if (peek()?.type === 'SEMICOLON') consume();
      statements.push({ kind: 'PRINT', arg, line });
      continue;
    }

    // t1.study(); — METHOD_CALL or FIELD_WRITE
    if (
      t.type === 'IDENTIFIER' &&
      peek(1)?.type === 'DOT' &&
      peek(2)?.type === 'IDENTIFIER'
    ) {
      const varName = t.value;
      const memberName = peek(2)!.value;
      const line = t.line;

      // method call: varName . method ( args... ) ;
      if (peek(3)?.type === 'LPAREN') {
        consume(); consume(); consume(); consume(); // varName . method (
        // Parse arguments
        const args: (number | boolean | string)[] = [];
        while (i < tokens.length && peek()?.type !== 'RPAREN') {
          const argTok = peek();
          if (!argTok) break;
          if (argTok.type === 'LITERAL_INT') { args.push(parseInt(argTok.value, 10)); consume(); }
          else if (argTok.type === 'LITERAL_DOUBLE') { args.push(parseFloat(argTok.value)); consume(); }
          else if (argTok.type === 'LITERAL_BOOL') { args.push(argTok.value === 'true'); consume(); }
          else if (argTok.type === 'LITERAL_STRING') { args.push(argTok.value.slice(1, -1)); consume(); }
          else if (argTok.type === 'MINUS') {
            const next = peek(1);
            if (next?.type === 'LITERAL_INT') { args.push(-parseInt(next.value, 10)); consume(); consume(); }
            else if (next?.type === 'LITERAL_DOUBLE') { args.push(-parseFloat(next.value)); consume(); consume(); }
            else consume();
          } else consume();
          if (peek()?.value === ',') consume();
        }
        consume(); // )
        consume(); // ;
        statements.push({ kind: 'METHOD_CALL', varName, methodName: memberName, args, line });
        continue;
      }

      // field write: varName . field = value ;
      if (peek(3)?.type === 'ASSIGN' || peek(3)?.type === 'COMPOUND_ASSIGN') {
        consume(); consume(); consume(); consume(); // varName . field = or +=
        // value
        let value: unknown = null;
        const vt = peek();
        if (vt?.type === 'LITERAL_INT') { value = parseInt(vt.value, 10); consume(); }
        else if (vt?.type === 'LITERAL_DOUBLE') { value = parseFloat(vt.value); consume(); }
        else if (vt?.type === 'LITERAL_BOOL') { value = vt.value === 'true'; consume(); }
        else if (vt?.type === 'LITERAL_STRING') { value = vt.value.slice(1, -1); consume(); }
        while (i < tokens.length && peek()?.type !== 'SEMICOLON') consume();
        consume(); // ;

        // Check if it's a private field — report encapsulation error now (before validation pass)
        if (symbolTable && symbolTable.privateFields.has(memberName)) {
          errors.push({
            kind: 'ENCAPSULATION_VIOLATION',
            message: `שורה ${line}: ניסית לגשת ישירות לשדה הפרטי "${memberName}" מבחוץ. זהו עיקרון האנקפסולציה — רק המחלקה עצמה יכולה לשנות את הנתונים שלה!`,
            line,
            suggestion: `השתמש בפונקציה ציבורית (setter) כמו set${memberName.charAt(0).toUpperCase() + memberName.slice(1)}()`,
          });
        } else {
          statements.push({ kind: 'FIELD_WRITE', varName, fieldName: memberName, value, line });
        }
        continue;
      }

      // field read: varName . field ;
      if (peek(3)?.type === 'SEMICOLON') {
        consume(); consume(); consume(); consume(); // varName . field ;
        statements.push({ kind: 'FIELD_READ', varName, fieldName: memberName, line });
        continue;
      }
    }

    // skip anything else
    consume();
  }

  return { statements, errors };
}
