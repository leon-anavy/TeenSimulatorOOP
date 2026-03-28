import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { STAGE_CONFIGS } from '../../constants/stageConfig';
import type { Stage } from '../../constants/stageConfig';
import type { ClassSchema } from '../../parser/types';
import { KNOWN_METHODS } from '../../constants/methodEffects';
import './TaskChecklist.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Strip single-line Java comments so hint text in comments doesn't satisfy conditions
function stripComments(code: string): string {
  return code.replace(/\/\/[^\n]*/g, '');
}

// ─── Task definitions ─────────────────────────────────────────────────────────

interface TaskDef {
  label: string;
  hint?: string;
  done: boolean;
}

interface ConditionParams {
  classSchema: ClassSchema | null;
  mainCode: string;
  instancesCreated: boolean;
  methodsRan: boolean;
  encapsulationViolation: boolean;
}

function getTasksForStage(stage: Stage, p: ConditionParams): TaskDef[] {
  const code = stripComments(p.mainCode);
  const privateCount = p.classSchema?.fields.filter((f) => f.accessModifier === 'private').length ?? 0;
  const publicMethodCount = p.classSchema?.methods.filter((m) => m.accessModifier === 'public' && m.name !== 'toString').length ?? 0;
  const hasConstructor = (p.classSchema?.constructor ?? null) !== null;
  const constructorHasBody = (p.classSchema?.constructor?.bodyStatements.length ?? 0) >= 1;
  const hasToString = p.classSchema?.methods.some(
    (m) => m.name === 'toString' && m.returnType === 'String' && m.accessModifier === 'public'
  ) ?? false;
  const mainHasNew = /new Teenager\(\)/.test(code);
  const mainHasMethodCall = KNOWN_METHODS.some((m) => code.includes(m + '()'));
  const printlnCount = (code.match(/System\.out\.println/g) ?? []).length;
  const mainHasDirectWrite = /\bt\w+\.\s*(?:energy|happiness|gpa|phoneBattery|isHungry)\s*=(?!=)/.test(code);

  switch (stage) {
    case 1:
      return [
        { label: 'בחר שדה ראשון מלוח הבחירה', done: privateCount >= 1 },
        { label: 'בחר שדה שני (דרושים לפחות 2)', hint: 'כל שדה מוגדר כ-private — מוגן!', done: privateCount >= 2 },
      ];
    case 2:
      return [
        { label: 'בחר פעולה פנימית ראשונה מלוח הבחירה', done: publicMethodCount >= 1 },
        { label: 'בחר פעולה פנימית שנייה (דרושות לפחות 2)', hint: '2 פעולות נדרשות להמשיך', done: publicMethodCount >= 2 },
      ];
    case 3:
      return [
        { label: 'בחר "קונסטרקטור" מלוח הבחירה למטה', done: hasConstructor },
        { label: 'ודא שהקונסטרקטור כולל ערכים התחלתיים', hint: 'לדוגמה: energy = 100;', done: hasConstructor && constructorHasBody },
      ];
    case 4:
      return [
        { label: 'בחר "toString()" מלוח הבחירה למטה', hint: 'תמצא אותה בסעיף ייצוג טקסטואלי', done: hasToString },
      ];
    case 5:
      return [
        { label: 'כתוב ב-Main.java: Teenager t1 = new Teenager();', hint: 'השתמש במילה new ליצירת אובייקט', done: mainHasNew },
        { label: 'לחץ על כפתור Run ➤', hint: 'המתבגר יופיע בזיכרון!', done: p.instancesCreated },
      ];
    case 6:
      return [
        { label: 'קרא לפעולה פנימית, לדוגמה: t1.study();', hint: 'כל הפעולות שהגדרת זמינות', done: mainHasMethodCall },
        { label: 'הדפס System.out.println(t1); פעמיים — לפני ואחרי', hint: 'כדי לראות את השינוי בפועל', done: printlnCount >= 2 },
        { label: 'לחץ על כפתור Run ➤', done: p.methodsRan },
      ];
    case 7:
      return [
        { label: 'כתוב ב-Main.java: t1.energy = 50;', hint: 'גישה ישירה לשדה פרטי', done: mainHasDirectWrite },
        { label: 'לחץ Run ➤ וקרא את שגיאת הקומפיילר', hint: 'השגיאה היא השיעור!', done: p.encapsulationViolation },
      ];
  }
}

// ─── TaskItem ─────────────────────────────────────────────────────────────────

function TaskItem({ index, task, active }: { index: number; task: TaskDef; active: boolean }) {
  const prevDone = useRef(task.done);
  const justCompleted = task.done && !prevDone.current;
  prevDone.current = task.done;

  return (
    <motion.div
      className={`task-item ${task.done ? 'done' : ''} ${active && !task.done ? 'active' : ''}`}
      animate={justCompleted ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <div className={`task-check ${task.done ? 'checked' : ''}`}>
        <AnimatePresence>
          {task.done && (
            <motion.span
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              ✓
            </motion.span>
          )}
        </AnimatePresence>
        {!task.done && <span className="task-number">{index + 1}</span>}
      </div>
      <div className="task-text-block">
        <div className="task-label">{task.label}</div>
        {task.hint && !task.done && (
          <div className="task-hint">💡 {task.hint}</div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TaskChecklist() {
  const viewingStage = useAppStore((s) => s.viewingStage);
  const currentStage = useAppStore((s) => s.currentStage);
  const classSchema = useAppStore((s) => s.classSchema);
  const mainCode = useAppStore((s) => s.mainCode);
  const instancesCreated = useAppStore((s) => s.instancesCreated);
  const methodsRan = useAppStore((s) => s.methodsRan);
  const encapsulationViolation = useAppStore((s) => s.encapsulationViolation);
  const setEditorReadOnly = useAppStore((s) => s.setEditorReadOnly);
  const activeFile = useAppStore((s) => s.activeFile);

  const isReviewing = viewingStage < currentStage;
  const config = STAGE_CONFIGS[viewingStage];

  const tasks = getTasksForStage(viewingStage, {
    classSchema, mainCode, instancesCreated, methodsRan, encapsulationViolation,
  });

  const allDone = tasks.every((t) => t.done);
  const activeTaskIndex = tasks.findIndex((t) => !t.done);

  // Show manual-edit suggestion whenever checklist is fully complete on a Teenager.java stage
  const showManualEditPrompt = allDone && viewingStage <= 4 && activeFile === 'Teenager.java';

  return (
    <div className="task-checklist">
      <AnimatePresence mode="wait">
        <motion.div
          key={viewingStage}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
        >
          {/* Action prompt — explicit instruction banner */}
          {!isReviewing && !allDone && (
            <div className="action-prompt" dir="rtl">
              <span className="action-prompt-icon">👉</span>
              <span>{config.actionPrompt}</span>
            </div>
          )}

          <div className="checklist-header" dir="rtl">
            <span className="checklist-title">{config.titleHebrew}</span>
            {isReviewing && <span className="reviewing-tag">חזרה</span>}
          </div>

          <div className="checklist-tasks" dir="rtl">
            {tasks.map((task, i) => (
              <TaskItem key={i} index={i} task={task} active={i === activeTaskIndex} />
            ))}
          </div>

          {/* Stage complete banner */}
          <AnimatePresence>
            {allDone && (
              <motion.div
                className="stage-complete-banner"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                dir="rtl"
              >
                🎉 {isReviewing ? 'שלב הושלם!' : 'כל המשימות הושלמו!'}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Manual edit suggestion — appears during 3-second pending phase */}
          <AnimatePresence>
            {showManualEditPrompt && (
              <motion.div
                className="manual-edit-prompt"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                dir="rtl"
              >
                <div className="manual-edit-text">
                  💡 <strong>רוצה לנסות?</strong> ערוך את הקוד ישירות בעורך — שנה ערכים, הוסף שורות, ותראה מה קורה!
                </div>
                <button
                  className="manual-edit-btn"
                  onClick={() => setEditorReadOnly(false)}
                >
                  ✏️ ערוך ידנית
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
