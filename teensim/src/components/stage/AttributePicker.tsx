import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { ClassSchema } from '../../parser/types';
import './AttributePicker.css';

// ─── Field templates ──────────────────────────────────────────────────────────

interface FieldTemplate {
  name: string;
  declaration: string;
  labelHe: string;
}

const FIELD_TEMPLATES: FieldTemplate[] = [
  { name: 'energy',       declaration: '    private int energy;',       labelHe: '⚡ אנרגיה (int)' },
  { name: 'happiness',    declaration: '    private int happiness;',     labelHe: '😊 אושר (int)' },
  { name: 'gpa',          declaration: '    private double gpa;',        labelHe: '📚 ממוצע (double)' },
  { name: 'phoneBattery', declaration: '    private int phoneBattery;',  labelHe: '🔋 פלאפון (int)' },
  { name: 'isHungry',     declaration: '    private boolean isHungry;',  labelHe: '🍕 רעב (boolean)' },
];

// ─── Method templates ─────────────────────────────────────────────────────────

interface MethodTemplate {
  name: string;
  code: string;
  labelHe: string;
}

const METHOD_TEMPLATES: MethodTemplate[] = [
  {
    name: 'study',
    labelHe: '📖 study() — לימוד',
    code: `    public void study() {\n        energy -= 15;\n        gpa += 2.0;\n    }`,
  },
  {
    name: 'sleep',
    labelHe: '😴 sleep() — שינה',
    code: `    public void sleep() {\n        energy = 100;\n        happiness += 5;\n    }`,
  },
  {
    name: 'eat',
    labelHe: '🍕 eat() — אכילה',
    code: `    public void eat() {\n        isHungry = false;\n        energy += 20;\n    }`,
  },
  {
    name: 'playGames',
    labelHe: '🎮 playGames() — משחקים',
    code: `    public void playGames() {\n        happiness += 25;\n        energy -= 20;\n    }`,
  },
  {
    name: 'talkToFriends',
    labelHe: '📱 talkToFriends() — חברים',
    code: `    public void talkToFriends() {\n        happiness += 10;\n        phoneBattery -= 10;\n    }`,
  },
  {
    name: 'toString',
    labelHe: '🔤 toString() — ייצוג טקסטואלי',
    code: `    public String toString() {\n        return "Teenager [energy=" + energy + ", happiness=" + happiness + "]";\n    }`,
  },
];

// ─── Constructor helper ───────────────────────────────────────────────────────

const FIELD_DEFAULTS: Record<string, string> = {
  energy: '100',
  happiness: '80',
  gpa: '90.0',
  phoneBattery: '50',
  isHungry: 'false',
};

function buildConstructorCode(schema: ClassSchema | null): string {
  const fields = schema?.fields.filter((f) => f.name in FIELD_DEFAULTS) ?? [];
  if (fields.length === 0) {
    return `    public Teenager() {\n        energy = 100;\n    }`;
  }
  const assignments = fields.map((f) => `        ${f.name} = ${FIELD_DEFAULTS[f.name]};`).join('\n');
  return `    public Teenager() {\n${assignments}\n    }`;
}

function removeConstructor(code: string): string {
  return code.replace(/\s*public Teenager\(\)\s*\{[^}]*\}/, '');
}

// ─── Code insertion helpers ───────────────────────────────────────────────────

function insertIntoClass(code: string, snippet: string): string {
  const lastBrace = code.lastIndexOf('}');
  if (lastBrace === -1) return code + '\n' + snippet;
  return code.slice(0, lastBrace) + snippet + '\n' + code.slice(lastBrace);
}

function removeFromClass(code: string, snippet: string): string {
  const lines = snippet.split('\n');
  let result = code;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    result = result.replace(new RegExp(`[ \\t]*${escapeRegex(trimmed)}\\n?`, ''), '');
  }
  return result;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AttributePicker() {
  const classSchema = useAppStore((s) => s.classSchema);
  const currentStage = useAppStore((s) => s.currentStage);
  const teenagerCode = useAppStore((s) => s.teenagerCode);
  const setTeenagerCode = useAppStore((s) => s.setTeenagerCode);
  const [open, setOpen] = useState(true);

  const definedFieldNames = new Set(classSchema?.fields.map((f) => f.name) ?? []);
  const definedMethodNames = new Set(classSchema?.methods.map((m) => m.name) ?? []);
  const hasConstructor = (classSchema?.constructor ?? null) !== null;

  function toggleField(tpl: FieldTemplate) {
    if (definedFieldNames.has(tpl.name)) {
      setTeenagerCode(removeFromClass(teenagerCode, tpl.declaration));
    } else {
      setTeenagerCode(insertIntoClass(teenagerCode, tpl.declaration + '\n'));
    }
  }

  function toggleMethod(tpl: MethodTemplate) {
    if (definedMethodNames.has(tpl.name)) {
      setTeenagerCode(removeFromClass(teenagerCode, tpl.code));
    } else {
      setTeenagerCode(insertIntoClass(teenagerCode, '\n' + tpl.code + '\n'));
    }
  }

  function toggleConstructor() {
    if (hasConstructor) {
      setTeenagerCode(removeConstructor(teenagerCode));
    } else {
      const snippet = buildConstructorCode(classSchema);
      setTeenagerCode(insertIntoClass(teenagerCode, '\n' + snippet + '\n'));
    }
  }

  // Separate toString from the behavioral methods
  const behavioralMethods = METHOD_TEMPLATES.filter((m) => m.name !== 'toString');
  const toStringTemplate = METHOD_TEMPLATES.find((m) => m.name === 'toString')!;

  return (
    <div className="attribute-picker">
      <button className="picker-header" onClick={() => setOpen((o) => !o)}>
        <span>🎛️ לוח הגדרות המחלקה</span>
        <span className="picker-toggle">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="picker-body">
          {/* Fields */}
          <div className="picker-section">
            <div className="picker-section-label">שדות — מה המתבגר מחזיק</div>
            {FIELD_TEMPLATES.map((tpl) => {
              const checked = definedFieldNames.has(tpl.name);
              return (
                <label key={tpl.name} className={`picker-item ${checked ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleField(tpl)}
                  />
                  <span className="picker-label">{tpl.labelHe}</span>
                  <code className="picker-code">private</code>
                </label>
              );
            })}
          </div>

          {/* Constructor — shown from stage 3 */}
          {currentStage >= 3 && (
            <div className="picker-section">
              <div className="picker-section-label">קונסטרקטור — ערכים התחלתיים</div>
              <label className={`picker-item ${hasConstructor ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={hasConstructor}
                  onChange={toggleConstructor}
                />
                <span className="picker-label">🔧 קונסטרקטור Teenager()</span>
              </label>
            </div>
          )}

          {/* Behavioral methods — shown from stage 2 */}
          {currentStage >= 2 && (
            <div className="picker-section">
              <div className="picker-section-label">פעולות פנימיות — מה המתבגר עושה</div>
              {behavioralMethods.map((tpl) => {
                const checked = definedMethodNames.has(tpl.name);
                return (
                  <label key={tpl.name} className={`picker-item ${checked ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMethod(tpl)}
                    />
                    <span className="picker-label">{tpl.labelHe}</span>
                  </label>
                );
              })}
            </div>
          )}

          {/* toString — shown from stage 4 */}
          {currentStage >= 4 && (
            <div className="picker-section">
              <div className="picker-section-label">ייצוג טקסטואלי</div>
              {(() => {
                const checked = definedMethodNames.has(toStringTemplate.name);
                return (
                  <label className={`picker-item ${checked ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMethod(toStringTemplate)}
                    />
                    <span className="picker-label">{toStringTemplate.labelHe}</span>
                  </label>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
