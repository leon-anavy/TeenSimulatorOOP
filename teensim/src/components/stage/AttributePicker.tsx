import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
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
    labelHe: '📖 study()',
    code: `    public void study() {\n        energy -= 15;\n        gpa += 2.0;\n    }`,
  },
  {
    name: 'sleep',
    labelHe: '😴 sleep()',
    code: `    public void sleep() {\n        energy = 100;\n        happiness += 5;\n    }`,
  },
  {
    name: 'eat',
    labelHe: '🍕 eat()',
    code: `    public void eat() {\n        isHungry = false;\n        energy += 20;\n    }`,
  },
  {
    name: 'playGames',
    labelHe: '🎮 playGames()',
    code: `    public void playGames() {\n        happiness += 25;\n        energy -= 20;\n    }`,
  },
  {
    name: 'talkToFriends',
    labelHe: '📱 talkToFriends()',
    code: `    public void talkToFriends() {\n        happiness += 10;\n        phoneBattery -= 10;\n    }`,
  },
  {
    name: 'toString',
    labelHe: '🔤 toString()',
    code: `    public String toString() {\n        return "Teenager [energy=" + energy + ", happiness=" + happiness + "]";\n    }`,
  },
];

// ─── Code insertion helpers ───────────────────────────────────────────────────

function insertIntoClass(code: string, snippet: string): string {
  // Find the last closing brace and insert before it
  const lastBrace = code.lastIndexOf('}');
  if (lastBrace === -1) return code + '\n' + snippet;
  return code.slice(0, lastBrace) + snippet + '\n' + code.slice(lastBrace);
}

function removeFromClass(code: string, snippet: string): string {
  // Remove the exact snippet (trimmed lines match)
  const lines = snippet.split('\n');
  let result = code;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Find and remove the line (with any leading whitespace)
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

  return (
    <div className="attribute-picker">
      <button className="picker-header" onClick={() => setOpen((o) => !o)}>
        <span>🎛️ בחר שדות ומתודות</span>
        <span className="picker-toggle">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="picker-body">
          <div className="picker-section">
            <div className="picker-section-label">שדות (Fields)</div>
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

          {currentStage >= 2 && (
            <div className="picker-section">
              <div className="picker-section-label">מתודות (Methods)</div>
              {METHOD_TEMPLATES.map((tpl) => {
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
        </div>
      )}
    </div>
  );
}
