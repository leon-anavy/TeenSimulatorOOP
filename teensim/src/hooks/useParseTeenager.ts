import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { parseTeenager } from '../parser/teenagerParser';
import { buildSymbolTable } from '../parser/symbolTable';

const DEBOUNCE_MS = 300;

export function useParseTeenager() {
  const teenagerCode = useAppStore((s) => s.teenagerCode);
  const setClassSchema = useAppStore((s) => s.setClassSchema);
  const setParseErrors = useAppStore((s) => s.setParseErrors);
  const clearSchema = useAppStore((s) => s.clearSchema);
  const advanceStage = useAppStore((s) => s.advanceStage);
  const currentStage = useAppStore((s) => s.currentStage);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const result = parseTeenager(teenagerCode);
      if (result.errors.length > 0) setParseErrors(result.errors);
      if (result.schema) {
        const table = buildSymbolTable(result.schema);
        setClassSchema(result.schema, table);

        // Stage 1 → 2: at least 2 private fields
        if (currentStage === 1) {
          const privateCount = result.schema.fields.filter((f) => f.accessModifier === 'private').length;
          if (privateCount >= 2) advanceStage(2);
        }

        // Stage 2 → 3: at least 2 public methods (פעולות פנימיות)
        if (currentStage === 2) {
          const publicMethodCount = result.schema.methods.filter((m) => m.accessModifier === 'public').length;
          if (publicMethodCount >= 2) advanceStage(3);
        }

        // Stage 3 → 4: constructor defined
        if (currentStage === 3) {
          if (result.schema.constructor !== null) advanceStage(4);
        }

        // Stage 4 → 5: toString() defined with public String return type
        if (currentStage === 4) {
          const hasToString = result.schema.methods.some(
            (m) => m.name === 'toString' && m.returnType === 'String' && m.accessModifier === 'public'
          );
          if (hasToString) advanceStage(5);
        }
      } else {
        clearSchema();
      }
    }, DEBOUNCE_MS);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [teenagerCode]); // eslint-disable-line react-hooks/exhaustive-deps
}
