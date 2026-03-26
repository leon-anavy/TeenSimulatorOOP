import type { BodyStatement, ConditionExpr } from '../parser/types';

/**
 * Executes a single parsed body statement against a mutable state object.
 * `params` holds any method parameter bindings (name → value).
 */
export function runBodyStatement(
  state: Record<string, unknown>,
  stmt: BodyStatement,
  params: Record<string, unknown> = {}
): void {
  if (stmt.kind === 'ASSIGN') {
    if (stmt.field in state) state[stmt.field] = stmt.value;
  } else if (stmt.kind === 'COMPOUND_ASSIGN') {
    if (stmt.field in state) {
      const cur = state[stmt.field] as number;
      const rhs = resolveValue(stmt.value, params);
      state[stmt.field] = stmt.op === '+=' ? cur + (rhs as number) : cur - (rhs as number);
    }
  } else if (stmt.kind === 'IF_BLOCK') {
    if (evaluateCondition(state, stmt.condition, params)) {
      for (const child of stmt.body) runBodyStatement(state, child, params);
    }
  }
}

function resolveValue(value: unknown, params: Record<string, unknown>): unknown {
  if (typeof value === 'string' && value in params) return params[value];
  return value;
}

function evaluateCondition(
  state: Record<string, unknown>,
  cond: ConditionExpr,
  params: Record<string, unknown>
): boolean {
  const left = (cond.left in state ? state[cond.left] : params[cond.left]) as number;
  const right = resolveValue(cond.right, params) as number;
  switch (cond.op) {
    case '>':  return left > right;
    case '<':  return left < right;
    case '>=': return left >= right;
    case '<=': return left <= right;
    case '==': return left === right;
    default:   return false;
  }
}
