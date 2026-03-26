// ─── Tokens ──────────────────────────────────────────────────────────────────

export type TokenType =
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'ASSIGN'
  | 'COMPOUND_ASSIGN'
  | 'LITERAL_INT'
  | 'LITERAL_DOUBLE'
  | 'LITERAL_BOOL'
  | 'LITERAL_STRING'
  | 'SEMICOLON'
  | 'LBRACE'
  | 'RBRACE'
  | 'LPAREN'
  | 'RPAREN'
  | 'DOT'
  | 'COMPARISON'
  | 'PLUS'
  | 'MINUS'
  | 'UNKNOWN';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  col: number;
}

// ─── Class Schema (output of Teenager.java parser) ───────────────────────────

export type JavaType = 'int' | 'double' | 'boolean' | 'String' | 'void';
export type AccessModifier = 'private' | 'public';

export interface FieldDef {
  name: string;
  javaType: JavaType;
  accessModifier: AccessModifier;
  initializer?: number | boolean | string | null;
}

export type BodyStatement =
  | { kind: 'ASSIGN'; field: string; value: number | boolean | string }
  | { kind: 'COMPOUND_ASSIGN'; field: string; op: '+=' | '-='; value: number }
  | { kind: 'IF_BLOCK'; condition: ConditionExpr; body: BodyStatement[] };

export interface ConditionExpr {
  left: string;
  op: '>' | '<' | '>=' | '<=' | '==';
  right: number | boolean | string;
}

export interface ParamDef {
  name: string;
  javaType: JavaType;
}

export interface MethodDef {
  name: string;
  returnType: JavaType;
  accessModifier: AccessModifier;
  params: ParamDef[];
  bodyStatements: BodyStatement[];
}

export interface ConstructorDef {
  params: ParamDef[];
  bodyStatements: BodyStatement[];
}

export interface ClassSchema {
  className: string;
  fields: FieldDef[];
  constructor: ConstructorDef | null;
  methods: MethodDef[];
}

// ─── Symbol Table ─────────────────────────────────────────────────────────────

export interface SymbolTable {
  privateFields: Set<string>;
  publicFields: Set<string>;
  publicMethods: Map<string, MethodDef>;
  privateMethods: Map<string, MethodDef>;
  fieldTypes: Map<string, JavaType>;
}

// ─── Main.java statement list ─────────────────────────────────────────────────

export type PrintArg =
  | { kind: 'literal'; value: string | number | boolean }
  | { kind: 'field_access'; varName: string; fieldName: string }
  | { kind: 'raw'; text: string };

export type MainStatement =
  | { kind: 'INSTANTIATE'; varName: string; className: string; line: number }
  | { kind: 'METHOD_CALL'; varName: string; methodName: string; args: (number | boolean | string)[]; line: number }
  | { kind: 'FIELD_WRITE'; varName: string; fieldName: string; value: unknown; line: number }
  | { kind: 'FIELD_READ'; varName: string; fieldName: string; line: number }
  | { kind: 'PRINT'; arg: PrintArg; line: number };

export type PedagogicalErrorKind =
  | 'ENCAPSULATION_VIOLATION'
  | 'UNDEFINED_METHOD'
  | 'UNDEFINED_VARIABLE'
  | 'TYPE_MISMATCH'
  | 'METHOD_IN_MAIN'
  | 'CLASS_DEFINITION_IN_MAIN'
  | 'MISSING_SEMICOLON'
  | 'PRIVATE_MODIFIER_MISSING'
  | 'WRONG_ARG_COUNT'
  | 'UNSUPPORTED_FIELD'
  | 'SYNTAX_ERROR';

export interface ParseError {
  kind: PedagogicalErrorKind;
  message: string;
  line: number;
  suggestion?: string;
}

export interface MainParseResult {
  statements: MainStatement[];
  errors: ParseError[];
}

export interface TeenagerParseResult {
  schema: ClassSchema | null;
  errors: ParseError[];
}
