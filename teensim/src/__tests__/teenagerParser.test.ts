import { describe, it, expect } from 'vitest';
import { parseTeenager } from '../parser/teenagerParser';

const MINIMAL = `public class Teenager {
}`;

const TWO_FIELDS = `public class Teenager {
  private int energy;
  private boolean isHungry;
}`;

const WITH_CONSTRUCTOR = `public class Teenager {
  private int energy;
  public Teenager() {
    energy = 100;
  }
}`;

const WITH_METHOD = `public class Teenager {
  private int energy;
  private double gpa;
  public void study() {
    energy -= 15;
    gpa += 2;
  }
}`;

const WITH_TOSTRING = `public class Teenager {
  private int energy;
  public String toString() {
    return "energy: " + energy;
  }
}`;

const FIELD_WITHOUT_PRIVATE = `public class Teenager {
  int energy;
}`;

const UNSUPPORTED_FIELD = `public class Teenager {
  private int money;
}`;

describe('parseTeenager', () => {
  it('parses minimal valid class with no fields', () => {
    const { schema, errors } = parseTeenager(MINIMAL);
    expect(schema).not.toBeNull();
    expect(schema?.className).toBe('Teenager');
    expect(schema?.fields).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('parses two private fields correctly', () => {
    const { schema } = parseTeenager(TWO_FIELDS);
    expect(schema?.fields).toHaveLength(2);
    expect(schema?.fields[0].name).toBe('energy');
    expect(schema?.fields[0].javaType).toBe('int');
    expect(schema?.fields[0].accessModifier).toBe('private');
    expect(schema?.fields[1].name).toBe('isHungry');
    expect(schema?.fields[1].javaType).toBe('boolean');
  });

  it('reports PRIVATE_MODIFIER_MISSING for field without access modifier', () => {
    const { errors } = parseTeenager(FIELD_WITHOUT_PRIVATE);
    const err = errors.find((e) => e.kind === 'PRIVATE_MODIFIER_MISSING');
    expect(err).toBeDefined();
  });

  it('reports UNSUPPORTED_FIELD for unknown field name', () => {
    const { errors } = parseTeenager(UNSUPPORTED_FIELD);
    const err = errors.find((e) => e.kind === 'UNSUPPORTED_FIELD');
    expect(err).toBeDefined();
  });

  it('parses constructor with body statements', () => {
    const { schema } = parseTeenager(WITH_CONSTRUCTOR);
    expect(schema?.constructor).not.toBeNull();
    expect(schema?.constructor?.bodyStatements.length).toBeGreaterThanOrEqual(1);
  });

  it('parses public method with name, returnType, and body', () => {
    const { schema } = parseTeenager(WITH_METHOD);
    const method = schema?.methods.find((m) => m.name === 'study');
    expect(method).toBeDefined();
    expect(method?.returnType).toBe('void');
    expect(method?.accessModifier).toBe('public');
    expect(method?.bodyStatements.length).toBeGreaterThanOrEqual(1);
  });

  it('parses toString method with correct signature', () => {
    const { schema } = parseTeenager(WITH_TOSTRING);
    const ts = schema?.methods.find((m) => m.name === 'toString');
    expect(ts).toBeDefined();
    expect(ts?.returnType).toBe('String');
    expect(ts?.accessModifier).toBe('public');
  });

  it('does not loop infinitely on unclosed brace', () => {
    // Should return gracefully without hanging
    const result = parseTeenager('public class Teenager {');
    expect(result).toBeDefined();
  });
});
