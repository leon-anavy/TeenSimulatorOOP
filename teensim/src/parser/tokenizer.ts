import type { Token, TokenType } from './types';

const KEYWORDS = new Set([
  'public', 'private', 'class', 'void', 'new', 'return', 'if', 'else',
  'int', 'double', 'boolean', 'String', 'true', 'false', 'this',
]);

const COMPOUND_ASSIGN = new Set(['+=', '-=', '*=', '/=']);
const COMPARISONS = new Set(['>', '<', '>=', '<=', '==', '!=']);

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let line = 1;
  let lineStart = 0;

  while (i < source.length) {
    const ch = source[i];

    // Newline
    if (ch === '\n') { line++; lineStart = i + 1; i++; continue; }

    // Whitespace
    if (/\s/.test(ch)) { i++; continue; }

    // Line comment
    if (ch === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') i++;
      continue;
    }

    // Block comment
    if (ch === '/' && source[i + 1] === '*') {
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) {
        if (source[i] === '\n') { line++; lineStart = i + 1; }
        i++;
      }
      i += 2;
      continue;
    }

    const col = i - lineStart;

    // String literal
    if (ch === '"') {
      let str = '"';
      i++;
      while (i < source.length && source[i] !== '"') { str += source[i++]; }
      str += '"';
      i++;
      tokens.push({ type: 'LITERAL_STRING', value: str, line, col });
      continue;
    }

    // Number literal
    if (/[0-9]/.test(ch) || (ch === '-' && /[0-9]/.test(source[i + 1] ?? ''))) {
      let num = ch;
      i++;
      while (i < source.length && /[0-9.]/.test(source[i])) { num += source[i++]; }
      const type: TokenType = num.includes('.') ? 'LITERAL_DOUBLE' : 'LITERAL_INT';
      tokens.push({ type, value: num, line, col });
      continue;
    }

    // Compound assign or comparison (two-char)
    if (i + 1 < source.length) {
      const two = source[i] + source[i + 1];
      if (COMPOUND_ASSIGN.has(two)) {
        tokens.push({ type: 'COMPOUND_ASSIGN', value: two, line, col });
        i += 2; continue;
      }
      if (COMPARISONS.has(two)) {
        tokens.push({ type: 'COMPARISON', value: two, line, col });
        i += 2; continue;
      }
    }

    // Single-char comparison
    if (ch === '>' || ch === '<') {
      tokens.push({ type: 'COMPARISON', value: ch, line, col });
      i++; continue;
    }

    // Single-char tokens
    if (ch === '=') { tokens.push({ type: 'ASSIGN', value: '=', line, col }); i++; continue; }
    if (ch === ';') { tokens.push({ type: 'SEMICOLON', value: ';', line, col }); i++; continue; }
    if (ch === '{') { tokens.push({ type: 'LBRACE', value: '{', line, col }); i++; continue; }
    if (ch === '}') { tokens.push({ type: 'RBRACE', value: '}', line, col }); i++; continue; }
    if (ch === '(') { tokens.push({ type: 'LPAREN', value: '(', line, col }); i++; continue; }
    if (ch === ')') { tokens.push({ type: 'RPAREN', value: ')', line, col }); i++; continue; }
    if (ch === '.') { tokens.push({ type: 'DOT', value: '.', line, col }); i++; continue; }
    if (ch === '+') { tokens.push({ type: 'PLUS', value: '+', line, col }); i++; continue; }
    if (ch === '-') { tokens.push({ type: 'MINUS', value: '-', line, col }); i++; continue; }

    // Identifier or keyword
    if (/[a-zA-Z_$]/.test(ch)) {
      let word = '';
      while (i < source.length && /[a-zA-Z0-9_$]/.test(source[i])) { word += source[i++]; }
      if (word === 'true' || word === 'false') {
        tokens.push({ type: 'LITERAL_BOOL', value: word, line, col });
      } else if (KEYWORDS.has(word)) {
        tokens.push({ type: 'KEYWORD', value: word, line, col });
      } else {
        tokens.push({ type: 'IDENTIFIER', value: word, line, col });
      }
      continue;
    }

    // Unknown
    tokens.push({ type: 'UNKNOWN', value: ch, line, col });
    i++;
  }

  return tokens;
}
