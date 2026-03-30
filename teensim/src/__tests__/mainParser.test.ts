import { describe, it, expect } from 'vitest';
import { parseMain } from '../parser/mainParser';
import type { SymbolTable } from '../parser/types';

const PRIVATE_SYMBOL_TABLE: SymbolTable = {
  privateFields: new Set(['energy', 'happiness', 'gpa', 'phoneBattery', 'isHungry']),
  publicFields: new Set(),
  publicMethods: new Map(),
  privateMethods: new Map(),
  fieldTypes: new Map(),
};

describe('parseMain', () => {
  it('parses instantiation statement', () => {
    const { statements, errors } = parseMain('Teenager t1 = new Teenager();', null);
    expect(errors).toHaveLength(0);
    expect(statements).toHaveLength(1);
    expect(statements[0].kind).toBe('INSTANTIATE');
    if (statements[0].kind === 'INSTANTIATE') {
      expect(statements[0].varName).toBe('t1');
      expect(statements[0].className).toBe('Teenager');
    }
  });

  it('parses method call statement', () => {
    const { statements, errors } = parseMain('t1.study();', null);
    expect(errors).toHaveLength(0);
    expect(statements).toHaveLength(1);
    expect(statements[0].kind).toBe('METHOD_CALL');
    if (statements[0].kind === 'METHOD_CALL') {
      expect(statements[0].varName).toBe('t1');
      expect(statements[0].methodName).toBe('study');
    }
  });

  it('parses System.out.println statement', () => {
    const { statements } = parseMain('System.out.println(t1);', null);
    const print = statements.find((s) => s.kind === 'PRINT');
    expect(print).toBeDefined();
  });

  it('reports ENCAPSULATION_VIOLATION for private field write', () => {
    const { errors } = parseMain('t1.energy = 50;', PRIVATE_SYMBOL_TABLE);
    const err = errors.find((e) => e.kind === 'ENCAPSULATION_VIOLATION');
    expect(err).toBeDefined();
  });

  it('does not report error for field write when no symbolTable', () => {
    const { errors } = parseMain('t1.energy = 50;', null);
    expect(errors.filter((e) => e.kind === 'ENCAPSULATION_VIOLATION')).toHaveLength(0);
  });

  it('parses multiple statements in sequence', () => {
    const code = 'Teenager t1 = new Teenager();\nt1.study();\nSystem.out.println(t1);';
    const { statements } = parseMain(code, null);
    expect(statements.map((s) => s.kind)).toEqual(['INSTANTIATE', 'METHOD_CALL', 'PRINT']);
  });
});
