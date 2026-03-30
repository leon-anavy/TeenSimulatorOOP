import { describe, it, expect } from 'vitest';
import { tokenize } from '../parser/tokenizer';

describe('tokenize', () => {
  it('returns empty array for empty string', () => {
    expect(tokenize('')).toEqual([]);
  });

  it('strips line comments', () => {
    const tokens = tokenize('// this is a comment\nint');
    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toMatchObject({ type: 'KEYWORD', value: 'int' });
  });

  it('strips block comments', () => {
    const tokens = tokenize('/* block */ int');
    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toMatchObject({ type: 'KEYWORD', value: 'int' });
  });

  it('tokenizes class declaration', () => {
    const tokens = tokenize('public class Teenager {');
    expect(tokens.map((t) => t.type)).toEqual(['KEYWORD', 'KEYWORD', 'IDENTIFIER', 'LBRACE']);
    expect(tokens[0].value).toBe('public');
    expect(tokens[1].value).toBe('class');
    expect(tokens[2].value).toBe('Teenager');
  });

  it('tokenizes private field declaration', () => {
    const tokens = tokenize('private int energy;');
    expect(tokens.map((t) => t.type)).toEqual(['KEYWORD', 'KEYWORD', 'IDENTIFIER', 'SEMICOLON']);
  });

  it('tokenizes compound assignment', () => {
    const tokens = tokenize('energy += 15;');
    expect(tokens.map((t) => t.type)).toEqual(['IDENTIFIER', 'COMPOUND_ASSIGN', 'LITERAL_INT', 'SEMICOLON']);
    expect(tokens[1].value).toBe('+=');
    expect(tokens[2].value).toBe('15');
  });

  it('tokenizes string literal as single token', () => {
    const tokens = tokenize('"hello world"');
    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toMatchObject({ type: 'LITERAL_STRING', value: '"hello world"' });
  });

  it('tokenizes boolean literals', () => {
    const t = tokenize('true false');
    expect(t[0]).toMatchObject({ type: 'LITERAL_BOOL', value: 'true' });
    expect(t[1]).toMatchObject({ type: 'LITERAL_BOOL', value: 'false' });
  });

  it('tokenizes double literal', () => {
    const t = tokenize('90.0');
    expect(t[0]).toMatchObject({ type: 'LITERAL_DOUBLE', value: '90.0' });
  });

  it('tokenizes integer literal', () => {
    const t = tokenize('42');
    expect(t[0]).toMatchObject({ type: 'LITERAL_INT', value: '42' });
  });

  it('tokenizes comparison operators', () => {
    const t = tokenize('> < >= <= ==');
    expect(t.map((tok) => tok.value)).toEqual(['>', '<', '>=', '<=', '==']);
    expect(t.every((tok) => tok.type === 'COMPARISON')).toBe(true);
  });

  it('tracks line numbers', () => {
    const t = tokenize('int\nenergy');
    expect(t[0].line).toBe(1);
    expect(t[1].line).toBe(2);
  });
});
