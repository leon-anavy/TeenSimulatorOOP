import { describe, it, expect } from 'vitest';
import { parseTeenager } from '../parser/teenagerParser';
import { parseMain } from '../parser/mainParser';
import { buildSymbolTable } from '../parser/symbolTable';
import { runBodyStatement } from '../engine/bodyRunner';

const TEENAGER_SOURCE = `
public class Teenager {
  private int energy;
  private double gpa;
  private int happiness;
  private int phoneBattery;
  private boolean isHungry;

  public Teenager() {
    energy = 100;
    gpa = 90;
    happiness = 80;
    phoneBattery = 50;
    isHungry = false;
  }

  public void study() {
    energy -= 15;
    gpa += 2;
  }

  public void sleep() {
    energy = 100;
    happiness += 5;
  }

  public String toString() {
    return "energy=" + energy;
  }
}
`;

describe('Pipeline integration', () => {
  it('parses Teenager.java cleanly with no errors', () => {
    const { schema, errors } = parseTeenager(TEENAGER_SOURCE);
    expect(errors).toHaveLength(0);
    expect(schema?.fields).toHaveLength(5);
    expect(schema?.constructor).not.toBeNull();
    expect(schema?.methods.find((m) => m.name === 'study')).toBeDefined();
    expect(schema?.methods.find((m) => m.name === 'toString')).toBeDefined();
  });

  it('buildSymbolTable puts all fields in privateFields', () => {
    const { schema } = parseTeenager(TEENAGER_SOURCE);
    const table = buildSymbolTable(schema!);
    expect(table.privateFields.has('energy')).toBe(true);
    expect(table.privateFields.has('gpa')).toBe(true);
    expect(table.publicFields.size).toBe(0);
    expect(table.publicMethods.has('study')).toBe(true);
  });

  it('parseMain detects encapsulation violation against symbolTable', () => {
    const { schema } = parseTeenager(TEENAGER_SOURCE);
    const table = buildSymbolTable(schema!);
    const { errors } = parseMain('t1.energy = 50;', table);
    expect(errors.find((e) => e.kind === 'ENCAPSULATION_VIOLATION')).toBeDefined();
  });

  it('parseMain accepts method calls without errors', () => {
    const { schema } = parseTeenager(TEENAGER_SOURCE);
    const table = buildSymbolTable(schema!);
    const { statements, errors } = parseMain(
      'Teenager t1 = new Teenager();\nt1.study();\nSystem.out.println(t1);',
      table
    );
    expect(errors).toHaveLength(0);
    expect(statements.map((s) => s.kind)).toEqual(['INSTANTIATE', 'METHOD_CALL', 'PRINT']);
  });

  it('study method body statements can be run to produce correct state delta', () => {
    const { schema } = parseTeenager(TEENAGER_SOURCE);
    const studyMethod = schema?.methods.find((m) => m.name === 'study');
    expect(studyMethod).toBeDefined();

    // Simulate running the study method body
    const state: Record<string, unknown> = { energy: 100, gpa: 90 };
    for (const stmt of studyMethod!.bodyStatements) {
      runBodyStatement(state, stmt);
    }
    expect(state.energy).toBe(85);
    expect(state.gpa).toBe(92);
  });
});
