import { describe, it, expect } from 'vitest';
import { runBodyStatement } from '../engine/bodyRunner';
import type { BodyStatement } from '../parser/types';

describe('runBodyStatement', () => {
  it('ASSIGN: sets field to given value', () => {
    const state: Record<string, unknown> = { energy: 100 };
    const stmt: BodyStatement = { kind: 'ASSIGN', field: 'energy', value: 50 };
    runBodyStatement(state, stmt);
    expect(state.energy).toBe(50);
  });

  it('ASSIGN: does nothing for unknown field', () => {
    const state: Record<string, unknown> = { energy: 100 };
    const stmt: BodyStatement = { kind: 'ASSIGN', field: 'money', value: 999 };
    runBodyStatement(state, stmt);
    expect(state.money).toBeUndefined();
  });

  it('COMPOUND_ASSIGN +=: adds value to field', () => {
    const state: Record<string, unknown> = { gpa: 90 };
    const stmt: BodyStatement = { kind: 'COMPOUND_ASSIGN', field: 'gpa', op: '+=', value: 2 };
    runBodyStatement(state, stmt);
    expect(state.gpa).toBe(92);
  });

  it('COMPOUND_ASSIGN -=: subtracts value from field', () => {
    const state: Record<string, unknown> = { energy: 100 };
    const stmt: BodyStatement = { kind: 'COMPOUND_ASSIGN', field: 'energy', op: '-=', value: 15 };
    runBodyStatement(state, stmt);
    expect(state.energy).toBe(85);
  });

  it('IF_BLOCK: executes body when condition is true', () => {
    const state: Record<string, unknown> = { energy: 30 };
    const innerStmt: BodyStatement = { kind: 'ASSIGN', field: 'energy', value: 0 };
    const stmt: BodyStatement = {
      kind: 'IF_BLOCK',
      condition: { left: 'energy', op: '<', right: 50 },
      body: [innerStmt],
    };
    runBodyStatement(state, stmt);
    expect(state.energy).toBe(0);
  });

  it('IF_BLOCK: skips body when condition is false', () => {
    const state: Record<string, unknown> = { energy: 80 };
    const innerStmt: BodyStatement = { kind: 'ASSIGN', field: 'energy', value: 0 };
    const stmt: BodyStatement = {
      kind: 'IF_BLOCK',
      condition: { left: 'energy', op: '<', right: 50 },
      body: [innerStmt],
    };
    runBodyStatement(state, stmt);
    expect(state.energy).toBe(80);
  });

  describe('evaluateCondition operators', () => {
    function testOp(op: '>' | '<' | '>=' | '<=' | '==', stateVal: number, condVal: number, expected: boolean) {
      const state: Record<string, unknown> = { energy: stateVal };
      const stmt: BodyStatement = {
        kind: 'IF_BLOCK',
        condition: { left: 'energy', op, right: condVal },
        body: [{ kind: 'ASSIGN', field: 'energy', value: -1 }],
      };
      runBodyStatement(state, stmt);
      expect(state.energy).toBe(expected ? -1 : stateVal);
    }

    it('> true', () => testOp('>', 80, 50, true));
    it('> false', () => testOp('>', 30, 50, false));
    it('< true', () => testOp('<', 30, 50, true));
    it('< false', () => testOp('<', 80, 50, false));
    it('>= equal', () => testOp('>=', 50, 50, true));
    it('<= equal', () => testOp('<=', 50, 50, true));
    it('== equal', () => testOp('==', 50, 50, true));
    it('== not equal', () => testOp('==', 40, 50, false));
  });
});
