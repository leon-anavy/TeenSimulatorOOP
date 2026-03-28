import type {
  Token, FieldDef, MethodDef, ConstructorDef,
  BodyStatement, ConditionExpr, ParamDef, JavaType, AccessModifier,
  ParseError, TeenagerParseResult,
} from './types';
import { tokenize } from './tokenizer';

const JAVA_TYPES: JavaType[] = ['int', 'double', 'boolean', 'String', 'void'];

/** Consume a brace-matched block starting at the current `{`. Safe even if braces are unclosed. */
function skipBlock(cursor: TokenCursor): void {
  if (!cursor.at('LBRACE')) return;
  cursor.consume(); // opening {
  let depth = 1;
  while (!cursor.done() && depth > 0) {
    const t = cursor.consume();
    if (t.type === 'LBRACE') depth++;
    if (t.type === 'RBRACE') depth--;
  }
}
const SUPPORTED_FIELDS = new Set(['energy', 'happiness', 'gpa', 'phoneBattery', 'isHungry']);

function isJavaType(v: string): v is JavaType {
  return JAVA_TYPES.includes(v as JavaType);
}

class TokenCursor {
  pos = 0;
  tokens: Token[];
  constructor(tokens: Token[]) { this.tokens = tokens; }

  peek(offset = 0): Token | null {
    return this.tokens[this.pos + offset] ?? null;
  }
  consume(): Token {
    return this.tokens[this.pos++];
  }
  at(type: string, value?: string): boolean {
    const t = this.peek();
    if (!t) return false;
    if (t.type !== type) return false;
    if (value !== undefined && t.value !== value) return false;
    return true;
  }
  expect(type: string, value?: string): Token | null {
    if (this.at(type, value)) return this.consume();
    return null;
  }
  currentLine(): number {
    return this.peek()?.line ?? 0;
  }
  done(): boolean {
    return this.pos >= this.tokens.length;
  }
}

function parseLiteral(cursor: TokenCursor): number | boolean | string | null {
  const t = cursor.peek();
  if (!t) return null;
  if (t.type === 'LITERAL_INT') { cursor.consume(); return parseInt(t.value, 10); }
  if (t.type === 'LITERAL_DOUBLE') { cursor.consume(); return parseFloat(t.value); }
  if (t.type === 'LITERAL_BOOL') { cursor.consume(); return t.value === 'true'; }
  if (t.type === 'LITERAL_STRING') { cursor.consume(); return t.value.slice(1, -1); }
  // negative number: MINUS LITERAL_INT
  if (t.type === 'MINUS') {
    const next = cursor.peek(1);
    if (next?.type === 'LITERAL_INT') {
      cursor.consume(); cursor.consume();
      return -parseInt(next.value, 10);
    }
    if (next?.type === 'LITERAL_DOUBLE') {
      cursor.consume(); cursor.consume();
      return -parseFloat(next.value);
    }
  }
  return null;
}

function parseBodyStatements(cursor: TokenCursor, fieldNames: Set<string>): BodyStatement[] {
  const stmts: BodyStatement[] = [];

  while (!cursor.done() && !cursor.at('RBRACE')) {
    // if block
    if (cursor.at('KEYWORD', 'if')) {
      cursor.consume(); // if
      cursor.expect('LPAREN');
      const left = cursor.peek();
      if (left?.type === 'IDENTIFIER') {
        cursor.consume();
        const op = cursor.peek();
        if (op?.type === 'COMPARISON') {
          cursor.consume();
          const right = parseLiteral(cursor) ?? 0;
          cursor.expect('RPAREN');
          cursor.expect('LBRACE');
          const body = parseBodyStatements(cursor, fieldNames);
          cursor.expect('RBRACE');
          const cond: ConditionExpr = { left: left.value, op: op.value as ConditionExpr['op'], right };
          stmts.push({ kind: 'IF_BLOCK', condition: cond, body });
          continue;
        }
      }
      // skip malformed if
      let depth = 1;
      while (!cursor.done() && depth > 0) {
        const t = cursor.consume();
        if (t.type === 'LBRACE') depth++;
        if (t.type === 'RBRACE') depth--;
      }
      continue;
    }

    // return statement — skip
    if (cursor.at('KEYWORD', 'return')) {
      while (!cursor.done() && !cursor.at('SEMICOLON')) cursor.consume();
      cursor.expect('SEMICOLON');
      continue;
    }

    // this.field = value  OR  field = value  OR  field += value  OR  field -= value
    let target: string | null = null;

    if (cursor.at('KEYWORD', 'this') && cursor.peek(1)?.type === 'DOT') {
      cursor.consume(); cursor.consume(); // this .
    }

    const ident = cursor.peek();
    if (ident?.type === 'IDENTIFIER' && fieldNames.has(ident.value)) {
      cursor.consume();
      target = ident.value;
    } else if (ident?.type === 'IDENTIFIER') {
      cursor.consume();
      // skip unknown statement
      while (!cursor.done() && !cursor.at('SEMICOLON') && !cursor.at('LBRACE') && !cursor.at('RBRACE')) cursor.consume();
      if (cursor.at('LBRACE')) skipBlock(cursor);
      else cursor.expect('SEMICOLON');
      continue;
    } else {
      // skip anything else
      if (!cursor.done()) cursor.consume();
      continue;
    }

    if (cursor.at('COMPOUND_ASSIGN')) {
      const op = cursor.consume();
      const val = parseLiteral(cursor);
      cursor.expect('SEMICOLON');
      if (target && val !== null && typeof val === 'number') {
        stmts.push({ kind: 'COMPOUND_ASSIGN', field: target, op: op.value as '+=' | '-=', value: val });
      }
      continue;
    }

    if (cursor.at('ASSIGN')) {
      cursor.consume();
      const val = parseLiteral(cursor);
      cursor.expect('SEMICOLON');
      if (target && val !== null) {
        stmts.push({ kind: 'ASSIGN', field: target, value: val });
      }
      continue;
    }

    // skip
    while (!cursor.done() && !cursor.at('SEMICOLON') && !cursor.at('RBRACE')) cursor.consume();
    cursor.expect('SEMICOLON');
  }

  return stmts;
}

export function parseTeenager(source: string): TeenagerParseResult {
  const tokens = tokenize(source);
  const cursor = new TokenCursor(tokens);
  const errors: ParseError[] = [];

  // expect: public class <Name> {
  cursor.expect('KEYWORD', 'public');
  cursor.expect('KEYWORD', 'class');
  const classNameTok = cursor.expect('IDENTIFIER');
  if (!classNameTok) {
    return { schema: null, errors: [{ kind: 'SYNTAX_ERROR', message: 'חסר שם מחלקה', line: 1 }] };
  }
  const className = classNameTok.value;
  cursor.expect('LBRACE');

  const fields: FieldDef[] = [];
  const methods: MethodDef[] = [];
  let constructor: ConstructorDef | null = null;
  const fieldNames = new Set<string>();

  while (!cursor.done() && !cursor.at('RBRACE')) {
    // access modifier
    const accessTok = cursor.peek();
    if (!accessTok) break;
    if (accessTok.type !== 'KEYWORD' || (accessTok.value !== 'public' && accessTok.value !== 'private')) {
      // hint: field without access modifier
      if (isJavaType(accessTok.value)) {
        errors.push({
          kind: 'PRIVATE_MODIFIER_MISSING',
          message: `שדה בשורה ${accessTok.line} חסר מגדיר גישה. האם התכוונת ל-private?`,
          line: accessTok.line,
          suggestion: 'private',
        });
      }
      // skip line or block
      while (!cursor.done() && !cursor.at('SEMICOLON') && !cursor.at('LBRACE') && !cursor.at('RBRACE')) cursor.consume();
      if (cursor.at('LBRACE')) skipBlock(cursor);
      else cursor.expect('SEMICOLON');
      continue;
    }
    cursor.consume();
    const accessModifier = accessTok.value as AccessModifier;

    // type or class name (constructor)
    const typeTok = cursor.peek();
    if (!typeTok) break;

    // constructor: public ClassName ( ... ) { ... }
    if (typeTok.type === 'IDENTIFIER' && typeTok.value === className) {
      cursor.consume();
      cursor.expect('LPAREN');
      const params = parseParams(cursor);
      cursor.expect('RPAREN');
      cursor.expect('LBRACE');
      const body = parseBodyStatements(cursor, fieldNames);
      cursor.expect('RBRACE');
      constructor = { params, bodyStatements: body };
      continue;
    }

    // method or field: need a type
    if (!isJavaType(typeTok.value)) {
      while (!cursor.done() && !cursor.at('SEMICOLON') && !cursor.at('LBRACE') && !cursor.at('RBRACE')) cursor.consume();
      if (cursor.at('LBRACE')) skipBlock(cursor);
      else if (cursor.at('SEMICOLON')) cursor.consume();
      continue;
    }
    cursor.consume();
    const javaType = typeTok.value as JavaType;

    const nameTok = cursor.expect('IDENTIFIER');
    if (!nameTok) continue;
    const memberName = nameTok.value;

    // method: name ( params ) { body }
    if (cursor.at('LPAREN')) {
      cursor.consume();
      const params = parseParams(cursor);
      cursor.expect('RPAREN');
      cursor.expect('LBRACE');
      const body = parseBodyStatements(cursor, fieldNames);
      cursor.expect('RBRACE');
      methods.push({ name: memberName, returnType: javaType, accessModifier, params, bodyStatements: body });
      continue;
    }

    // field: name ; OR name = literal ;
    // Block unsupported field names — they have no visual representation
    if (!SUPPORTED_FIELDS.has(memberName)) {
      errors.push({
        kind: 'UNSUPPORTED_FIELD',
        message: `השדה "${memberName}" אינו נתמך בסימולציה. השתמש באחד מהשמות: energy, happiness, gpa, phoneBattery, isHungry`,
        line: nameTok.line,
        suggestion: 'השתמש בלוח הבחירה בצד ימין כדי להוסיף שדות נתמכים',
      });
      while (!cursor.done() && !cursor.at('SEMICOLON') && !cursor.at('RBRACE')) cursor.consume();
      cursor.expect('SEMICOLON');
      continue;
    }
    fieldNames.add(memberName);
    let initializer: number | boolean | string | null | undefined = undefined;
    if (cursor.at('ASSIGN')) {
      cursor.consume();
      initializer = parseLiteral(cursor);
    }
    cursor.expect('SEMICOLON');
    fields.push({ name: memberName, javaType, accessModifier, initializer });
  }

  return {
    schema: { className, fields, constructor, methods },
    errors,
  };
}

function parseParams(cursor: TokenCursor): ParamDef[] {
  const params: ParamDef[] = [];
  while (!cursor.done() && !cursor.at('RPAREN')) {
    const typeTok = cursor.peek();
    if (!typeTok || !isJavaType(typeTok.value)) break;
    cursor.consume();
    const nameTok = cursor.expect('IDENTIFIER');
    if (nameTok) params.push({ name: nameTok.value, javaType: typeTok.value as JavaType });
    if (cursor.peek()?.value === ',') cursor.consume();
  }
  return params;
}
