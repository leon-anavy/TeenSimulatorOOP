import { useState, useRef, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    code: `    public void study() {\n        this.energy -= 15;\n        this.gpa += 2.0;\n    }`,
  },
  {
    name: 'sleep',
    labelHe: '😴 sleep() — שינה',
    code: `    public void sleep() {\n        this.energy = 100;\n        this.happiness += 5;\n    }`,
  },
  {
    name: 'eat',
    labelHe: '🍕 eat() — אכילה',
    code: `    public void eat() {\n        this.isHungry = false;\n        this.energy += 20;\n    }`,
  },
  {
    name: 'playGames',
    labelHe: '🎮 playGames() — משחקים',
    code: `    public void playGames() {\n        this.happiness += 25;\n        this.energy -= 20;\n    }`,
  },
  {
    name: 'talkToFriends',
    labelHe: '📱 talkToFriends() — חברים',
    code: `    public void talkToFriends() {\n        this.happiness += 10;\n        this.phoneBattery -= 10;\n    }`,
  },
];

// ─── Getter / Setter templates ────────────────────────────────────────────────

interface AccessorTemplate {
  fieldName: string;
  type: 'getter' | 'setter';
  methodName: string;
  code: string;
  labelHe: string;
}

const ACCESSOR_TEMPLATES: AccessorTemplate[] = [
  {
    fieldName: 'energy', type: 'getter', methodName: 'getEnergy',
    labelHe: '↩ getEnergy() — קרא אנרגיה',
    code: `    public int getEnergy() {\n        return this.energy;\n    }`,
  },
  {
    fieldName: 'energy', type: 'setter', methodName: 'setEnergy',
    labelHe: '✏ setEnergy(int) — הגדר אנרגיה',
    code: `    public void setEnergy(int energy) {\n        this.energy = energy;\n    }`,
  },
  {
    fieldName: 'happiness', type: 'getter', methodName: 'getHappiness',
    labelHe: '↩ getHappiness() — קרא אושר',
    code: `    public int getHappiness() {\n        return this.happiness;\n    }`,
  },
  {
    fieldName: 'happiness', type: 'setter', methodName: 'setHappiness',
    labelHe: '✏ setHappiness(int) — הגדר אושר',
    code: `    public void setHappiness(int happiness) {\n        this.happiness = happiness;\n    }`,
  },
  {
    fieldName: 'gpa', type: 'getter', methodName: 'getGpa',
    labelHe: '↩ getGpa() — קרא ממוצע',
    code: `    public double getGpa() {\n        return this.gpa;\n    }`,
  },
  {
    fieldName: 'gpa', type: 'setter', methodName: 'setGpa',
    labelHe: '✏ setGpa(double) — הגדר ממוצע',
    code: `    public void setGpa(double gpa) {\n        this.gpa = gpa;\n    }`,
  },
  {
    fieldName: 'phoneBattery', type: 'getter', methodName: 'getPhoneBattery',
    labelHe: '↩ getPhoneBattery() — קרא סוללה',
    code: `    public int getPhoneBattery() {\n        return this.phoneBattery;\n    }`,
  },
  {
    fieldName: 'phoneBattery', type: 'setter', methodName: 'setPhoneBattery',
    labelHe: '✏ setPhoneBattery(int) — הגדר סוללה',
    code: `    public void setPhoneBattery(int phoneBattery) {\n        this.phoneBattery = phoneBattery;\n    }`,
  },
  {
    fieldName: 'isHungry', type: 'getter', methodName: 'isHungry',
    labelHe: '↩ isHungry() — בדוק רעב',
    code: `    public boolean isHungry() {\n        return this.isHungry;\n    }`,
  },
  {
    fieldName: 'isHungry', type: 'setter', methodName: 'setHungry',
    labelHe: '✏ setHungry(boolean) — הגדר רעב',
    code: `    public void setHungry(boolean hungry) {\n        this.isHungry = hungry;\n    }`,
  },
];

const ACCESSOR_TOAST_ADD: Record<string, string> = {
  getEnergy:       '↩ getEnergy() נוסף — מחזיר את ערך השדה energy',
  setEnergy:       '✏ setEnergy() נוסף — מאפשר לשנות את energy מבחוץ',
  getHappiness:    '↩ getHappiness() נוסף — מחזיר את ערך השדה happiness',
  setHappiness:    '✏ setHappiness() נוסף — מאפשר לשנות את happiness מבחוץ',
  getGpa:          '↩ getGpa() נוסף — מחזיר את ערך השדה gpa',
  setGpa:          '✏ setGpa() נוסף — מאפשר לשנות את gpa מבחוץ',
  getPhoneBattery: '↩ getPhoneBattery() נוסף — מחזיר את ערך השדה phoneBattery',
  setPhoneBattery: '✏ setPhoneBattery() נוסף — מאפשר לשנות את phoneBattery מבחוץ',
  isHungry:        '↩ isHungry() נוסף — מחזיר true/false לשדה isHungry',
  setHungry:       '✏ setHungry() נוסף — מאפשר לשנות את isHungry מבחוץ',
};

// ─── toString builder ─────────────────────────────────────────────────────────

function buildToStringCode(schema: ClassSchema | null): string {
  const fields = schema?.fields ?? [];
  if (fields.length === 0) {
    return `    public String toString() {\n        return "Teenager []";\n    }`;
  }
  const parts = fields.map((f, i) => {
    const prefix = i === 0 ? `"Teenager [${f.name}=" + this.${f.name}` : `", ${f.name}=" + this.${f.name}`;
    return prefix;
  });
  const returnExpr = parts.join('\n                + ') + '\n                + "]"';
  return `    public String toString() {\n        return ${returnExpr};\n    }`;
}

// ─── Constructor helper ───────────────────────────────────────────────────────

// ─── Toast messages ───────────────────────────────────────────────────────────

const FIELD_TOAST_ADD: Record<string, string> = {
  energy:       '⚡ שדה energy נוסף — private int energy מאחסן אנרגיה שלמה',
  happiness:    '😊 שדה happiness נוסף — private int happiness מאחסן רמת אושר',
  gpa:          '📚 שדה gpa נוסף — private double gpa מאחסן ממוצע עשרוני',
  phoneBattery: '🔋 שדה phoneBattery נוסף — private int phoneBattery מאחסן % סוללה',
  isHungry:     '🍕 שדה isHungry נוסף — private boolean isHungry — אמת או שקר בלבד',
};

const METHOD_TOAST_ADD: Record<string, string> = {
  study:         '📖 study() נוספה — energy יורד ב-15, gpa עולה ב-2.0',
  sleep:         '😴 sleep() נוספה — energy חוזר ל-100, happiness עולה ב-5',
  eat:           '🍕 eat() נוספה — isHungry = false, energy עולה ב-20',
  playGames:     '🎮 playGames() נוספה — happiness עולה ב-25, energy יורד ב-20',
  talkToFriends: '📱 talkToFriends() נוספה — happiness עולה ב-10, phoneBattery יורד',
  toString:      '🔤 toString() נוספה — System.out.println(t1) יעבוד אוטומטית!',
};

// ─── Method → required fields ─────────────────────────────────────────────────

const METHOD_REQUIRES: Record<string, string[]> = {
  study:         ['energy', 'gpa'],
  sleep:         ['energy', 'happiness'],
  eat:           ['isHungry', 'energy'],
  playGames:     ['happiness', 'energy'],
  talkToFriends: ['happiness', 'phoneBattery'],
  toString:      ['energy', 'happiness'],
};

const FIELD_LABEL: Record<string, string> = {
  energy:       'energy ⚡',
  happiness:    'happiness 😊',
  gpa:          'gpa 📚',
  phoneBattery: 'phoneBattery 🔋',
  isHungry:     'isHungry 🍕',
};

const FIELD_DEFAULTS: Record<string, string> = {
  energy: '100',
  happiness: '80',
  gpa: '90.0',
  phoneBattery: '50',
  isHungry: 'false',
};

function buildDefaultConstructorCode(schema: ClassSchema | null): string {
  const fields = schema?.fields.filter((f) => f.name in FIELD_DEFAULTS) ?? [];
  if (fields.length === 0) {
    return `    public Teenager() {\n        this.energy = 100;\n    }`;
  }
  const assignments = fields.map((f) => `        this.${f.name} = ${FIELD_DEFAULTS[f.name]};`).join('\n');
  return `    public Teenager() {\n${assignments}\n    }`;
}

function buildParamConstructorCode(schema: ClassSchema | null): string {
  const fields = schema?.fields.filter((f) => f.name in FIELD_DEFAULTS) ?? [];
  if (fields.length === 0) {
    return `    public Teenager(int energy) {\n        this.energy = energy;\n    }`;
  }
  const PARAM_TYPES: Record<string, string> = {
    energy: 'int', happiness: 'int', gpa: 'double', phoneBattery: 'int', isHungry: 'boolean',
  };
  const paramList = fields.map((f) => `${PARAM_TYPES[f.name] ?? 'int'} ${f.name}`).join(', ');
  const assignments = fields.map((f) => `        this.${f.name} = ${f.name};`).join('\n');
  return `    public Teenager(${paramList}) {\n${assignments}\n    }`;
}

function removeConstructorBySignature(code: string, hasParams: boolean): string {
  if (hasParams) {
    // Remove parameterized constructor: public Teenager(<params>) { ... }
    return code.replace(/\s*public Teenager\([^)]+\)\s*\{[^}]*\}/, '');
  } else {
    // Remove default constructor: public Teenager() { ... }
    return code.replace(/\s*public Teenager\(\)\s*\{[^}]*\}/, '');
  }
}

// ─── Code insertion helpers ───────────────────────────────────────────────────

function insertIntoClass(code: string, snippet: string): string {
  // Scan backwards past trailing whitespace to find the class closing brace
  let i = code.length - 1;
  while (i >= 0 && (code[i] === '\n' || code[i] === '\r' || code[i] === ' ' || code[i] === '\t')) i--;
  if (i < 0 || code[i] !== '}') return code + '\n' + snippet;
  return code.slice(0, i) + snippet + '\n' + code.slice(i);
}

function removeFromClass(code: string, snippet: string): string {
  // Match the exact snippet with its leading newline (as inserted by insertIntoClass)
  const target = '\n' + snippet;
  const idx = code.indexOf(target);
  if (idx !== -1) return code.slice(0, idx) + code.slice(idx + target.length);
  return code;
}

// ─── PickerSection sub-component ─────────────────────────────────────────────

function PickerSection({
  id, label, collapsed, onToggle, children,
}: {
  id: string;
  label: string;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  children: ReactNode;
}) {
  const isCollapsed = collapsed.has(id);
  return (
    <div className="picker-section">
      <button className="picker-section-header" onClick={() => onToggle(id)}>
        <span className="picker-section-label">{label}</span>
        <span className="picker-section-chevron">{isCollapsed ? '▶' : '▼'}</span>
      </button>
      {!isCollapsed && children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AttributePicker() {
  const classSchema = useAppStore((s) => s.classSchema);
  const currentStage = useAppStore((s) => s.currentStage);
  const teenagerCode = useAppStore((s) => s.teenagerCode);
  const setTeenagerCode = useAppStore((s) => s.setTeenagerCode);
  const [open, setOpen] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleSection = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3000);
  }

  const definedFieldNames = new Set(classSchema?.fields.map((f) => f.name) ?? []);
  const definedMethodNames = new Set(classSchema?.methods.map((m) => m.name) ?? []);
  const hasConstructor = (classSchema?.constructor ?? null) !== null;
  // Detect which constructor variant is present by inspecting params
  const hasDefaultConstructor = hasConstructor && (classSchema?.constructor?.params.length ?? 0) === 0;
  const hasParamConstructor = hasConstructor && (classSchema?.constructor?.params.length ?? 0) > 0;

  function toggleField(tpl: FieldTemplate) {
    if (definedFieldNames.has(tpl.name)) {
      setTeenagerCode(removeFromClass(teenagerCode, tpl.declaration));
      showToast(`✗ שדה ${tpl.name} הוסר מהשרטוט`);
    } else {
      setTeenagerCode(insertIntoClass(teenagerCode, tpl.declaration + '\n'));
      showToast(FIELD_TOAST_ADD[tpl.name] ?? `✓ שדה ${tpl.name} נוסף`);
    }
  }

  function toggleMethod(tpl: MethodTemplate) {
    if (definedMethodNames.has(tpl.name)) {
      setTeenagerCode(removeFromClass(teenagerCode, tpl.code));
      showToast(`✗ ${tpl.name}() הוסרה מהשרטוט`);
      return;
    }
    // Validate required fields exist before adding
    const required = METHOD_REQUIRES[tpl.name] ?? [];
    const missing = required.filter((f) => !definedFieldNames.has(f));
    if (missing.length > 0) {
      const missingLabels = missing.map((f) => FIELD_LABEL[f] ?? f).join(', ');
      showToast(`⚠️ לא ניתן להוסיף ${tpl.name}() — חסרים שדות: ${missingLabels}`);
      return;
    }
    setTeenagerCode(insertIntoClass(teenagerCode, '\n' + tpl.code + '\n'));
    showToast(METHOD_TOAST_ADD[tpl.name] ?? `✓ ${tpl.name}() נוספה`);
  }

  function toggleAccessor(tpl: AccessorTemplate) {
    if (definedMethodNames.has(tpl.methodName)) {
      setTeenagerCode(removeFromClass(teenagerCode, tpl.code));
      showToast(`✗ ${tpl.methodName}() הוסר`);
    } else {
      setTeenagerCode(insertIntoClass(teenagerCode, '\n' + tpl.code + '\n'));
      showToast(ACCESSOR_TOAST_ADD[tpl.methodName] ?? `✓ ${tpl.methodName}() נוסף`);
    }
  }

  function toggleDefaultConstructor() {
    if (hasDefaultConstructor) {
      setTeenagerCode(removeConstructorBySignature(teenagerCode, false));
      showToast('✗ קונסטרקטור ברירת מחדל הוסר');
    } else {
      if (hasParamConstructor) {
        showToast('⚠️ כבר יש קונסטרקטור עם פרמטרים — הסר אותו קודם');
        return;
      }
      const snippet = buildDefaultConstructorCode(classSchema);
      setTeenagerCode(insertIntoClass(teenagerCode, '\n' + snippet + '\n'));
      showToast('🔧 קונסטרקטור ברירת מחדל נוסף — ערכים קבועים לכל אובייקט חדש');
    }
  }

  function toggleParamConstructor() {
    if (hasParamConstructor) {
      setTeenagerCode(removeConstructorBySignature(teenagerCode, true));
      showToast('✗ קונסטרקטור עם פרמטרים הוסר');
    } else {
      if (hasDefaultConstructor) {
        showToast('⚠️ כבר יש קונסטרקטור ברירת מחדל — הסר אותו קודם');
        return;
      }
      const snippet = buildParamConstructorCode(classSchema);
      setTeenagerCode(insertIntoClass(teenagerCode, '\n' + snippet + '\n'));
      showToast('🔧 קונסטרקטור עם פרמטרים נוסף — ניתן להעביר ערכים בעת יצירת אובייקט');
    }
  }

  const behavioralMethods = METHOD_TEMPLATES;
  const hasToString = definedMethodNames.has('toString');;

  return (
    <>
    <AnimatePresence>
      {toastMsg && (
        <motion.div
          className="picker-toast"
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          dir="rtl"
        >
          {toastMsg}
        </motion.div>
      )}
    </AnimatePresence>
    <div className="attribute-picker">
      <button className="picker-header" onClick={() => setOpen((o) => !o)}>
        <span>🎛️ לוח הגדרות המחלקה</span>
        <span className="picker-toggle">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="picker-body">
          {/* Fields */}
          <PickerSection id="fields" label="שדות — מה המתבגר מחזיק" collapsed={collapsed} onToggle={toggleSection}>
            {FIELD_TEMPLATES.map((tpl) => {
              const checked = definedFieldNames.has(tpl.name);
              return (
                <label key={tpl.name} className={`picker-item ${checked ? 'checked' : ''}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggleField(tpl)} />
                  <span className="picker-label">{tpl.labelHe}</span>
                  <code className="picker-code">private</code>
                </label>
              );
            })}
          </PickerSection>

          {/* Constructor — shown from stage 3 */}
          {currentStage >= 3 && (
            <PickerSection id="constructor" label="קונסטרקטור — ערכים התחלתיים" collapsed={collapsed} onToggle={toggleSection}>
              <label className={`picker-item ${hasDefaultConstructor ? 'checked' : ''} ${hasParamConstructor ? 'unavailable' : ''}`}>
                <input type="checkbox" checked={hasDefaultConstructor} onChange={toggleDefaultConstructor} />
                <span className="picker-label">🔧 Teenager() — ברירת מחדל</span>
              </label>
              <label className={`picker-item ${hasParamConstructor ? 'checked' : ''} ${hasDefaultConstructor ? 'unavailable' : ''}`}>
                <input type="checkbox" checked={hasParamConstructor} onChange={toggleParamConstructor} />
                <span className="picker-label">🔧 Teenager(שדות...) — עם פרמטרים</span>
              </label>
            </PickerSection>
          )}

          {/* Behavioral methods — shown from stage 2 */}
          {currentStage >= 2 && (
            <PickerSection id="methods" label="פעולות פנימיות — מה המתבגר עושה" collapsed={collapsed} onToggle={toggleSection}>
              {behavioralMethods.map((tpl) => {
                const checked = definedMethodNames.has(tpl.name);
                const missing = (METHOD_REQUIRES[tpl.name] ?? []).filter((f) => !definedFieldNames.has(f));
                const unavailable = !checked && missing.length > 0;
                return (
                  <label
                    key={tpl.name}
                    className={`picker-item ${checked ? 'checked' : ''} ${unavailable ? 'unavailable' : ''}`}
                    title={unavailable ? `דרושים שדות: ${missing.map((f) => FIELD_LABEL[f] ?? f).join(', ')}` : ''}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggleMethod(tpl)} />
                    <span className="picker-label">{tpl.labelHe}</span>
                    {unavailable && <span className="picker-missing">🔒</span>}
                  </label>
                );
              })}
            </PickerSection>
          )}

          {/* Getters & Setters — shown from stage 2 */}
          {currentStage >= 2 && (
            <PickerSection id="accessors" label="גטרים וסטרים — גישה מבוקרת לשדות" collapsed={collapsed} onToggle={toggleSection}>
              {ACCESSOR_TEMPLATES.map((tpl) => {
                const checked = definedMethodNames.has(tpl.methodName);
                const fieldAvailable = definedFieldNames.has(tpl.fieldName);
                return (
                  <label
                    key={tpl.methodName}
                    className={`picker-item ${checked ? 'checked' : ''} ${!fieldAvailable ? 'unavailable' : ''}`}
                    title={!fieldAvailable ? `דרוש שדה: ${tpl.fieldName}` : ''}
                  >
                    <input type="checkbox" checked={checked} onChange={() => fieldAvailable && toggleAccessor(tpl)} />
                    <span className="picker-label">{tpl.labelHe}</span>
                    {!fieldAvailable && <span className="picker-missing">🔒</span>}
                  </label>
                );
              })}
            </PickerSection>
          )}

          {/* toString — shown from stage 4 */}
          {currentStage >= 4 && (
            <PickerSection id="tostring" label="ייצוג טקסטואלי" collapsed={collapsed} onToggle={toggleSection}>
              <label className={`picker-item ${hasToString ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={hasToString}
                  onChange={() => {
                    if (hasToString) {
                      const updated = teenagerCode.replace(/\n\s+public String toString\(\)\s*\{[^}]*\}/, '');
                      setTeenagerCode(updated);
                      showToast('✗ toString() הוסרה מהשרטוט');
                    } else {
                      const snippet = buildToStringCode(classSchema);
                      setTeenagerCode(insertIntoClass(teenagerCode, '\n' + snippet + '\n'));
                      showToast('🔤 toString() נוספה — System.out.println(t1) יעבוד אוטומטית!');
                    }
                  }}
                />
                <span className="picker-label">🔤 toString() — ייצוג טקסטואלי</span>
              </label>
            </PickerSection>
          )}
        </div>
      )}
    </div>
    </>
  );
}
