export type Stage = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface StageConfig {
  stage: Stage;
  titleHebrew: string;
  instructionHebrew: string;
  hintHebrew: string;
  requiredFile: 'Teenager.java' | 'Main.java' | null;
}

export const STAGE_CONFIGS: Record<Stage, StageConfig> = {
  1: {
    stage: 1,
    titleHebrew: 'שלב 1: בניית השרטוט (Blueprint)',
    instructionHebrew:
      'ברוכים הבאים! בשלב זה נגדיר את תבנית המחלקה Teenager.\n\n' +
      'השתמש בלוח הבחירה למטה כדי להוסיף שדות — או הקלד ישירות בעורך.\n\n' +
      'השדות הנתמכים: energy, happiness, gpa, phoneBattery, isHungry\n\n' +
      'הגדר לפחות 2 שדות עם מגדיר הגישה private כדי להמשיך.',
    hintHebrew: 'private int energy;   ← שימי לב למילה private',
    requiredFile: 'Teenager.java',
  },
  2: {
    stage: 2,
    titleHebrew: 'שלב 2: הגדרת פעולות (Methods)',
    instructionHebrew:
      'מעולה! עכשיו הוסף לפחות מתודה אחת למחלקה שלך.\n\n' +
      'מתודה היא פעולה שהאובייקט יכול לבצע.\n\n' +
      'השתמש בלוח הבחירה כדי להוסיף מתודות — כל מתודה כוללת גוף קוד שמשנה את השדות.',
    hintHebrew: 'public void study() { energy -= 15; gpa += 2.0; }',
    requiredFile: 'Teenager.java',
  },
  3: {
    stage: 3,
    titleHebrew: 'שלב 3: קונסטרקטור (Constructor)',
    instructionHebrew:
      'כל הכבוד! עכשיו הוסף קונסטרקטור למחלקה שלך.\n\n' +
      'קונסטרקטור הוא פונקציה מיוחדת שנקראת אוטומטית כשיוצרים אובייקט חדש.\n\n' +
      'הוא מגדיר את הערכים ההתחלתיים של השדות.',
    hintHebrew: 'public Teenager() { energy = 80; happiness = 70; }',
    requiredFile: 'Teenager.java',
  },
  4: {
    stage: 4,
    titleHebrew: 'שלב 4: toString()',
    instructionHebrew:
      'מצוין! עכשיו הוסף מתודת toString() למחלקה שלך.\n\n' +
      'toString() היא מתודה מיוחדת המחזירה תיאור טקסטואלי של האובייקט.\n\n' +
      'בעתיד, כשנכתוב System.out.println(t1) — Java תקרא אוטומטית ל-toString()!\n\n' +
      'הוסף אותה דרך לוח הבחירה.',
    hintHebrew: 'public String toString() { return "Teenager [energy=" + energy + "]"; }',
    requiredFile: 'Teenager.java',
  },
  5: {
    stage: 5,
    titleHebrew: 'שלב 5: הולדת אובייקט',
    instructionHebrew:
      'מעולה! השרטוט מוכן. עכשיו עבור לקובץ Main.java וצור מתבגר חדש בעזרת המילה new.',
    hintHebrew: 'לדוגמה: Teenager t1 = new Teenager();',
    requiredFile: 'Main.java',
  },
  6: {
    stage: 6,
    titleHebrew: 'שלב 6: אינטראקציה',
    instructionHebrew:
      'כל הכבוד! המתבגר נוצר! עכשיו הפעל עליו פעולה — קרא לאחת מהמתודות שלו.\n\n' +
      'תוכל גם לכתוב System.out.println(t1) כדי להדפיס את האובייקט!',
    hintHebrew: 'לדוגמה: t1.study(); או System.out.println(t1);',
    requiredFile: 'Main.java',
  },
  7: {
    stage: 7,
    titleHebrew: 'שלב 7: אנקפסולציה',
    instructionHebrew:
      'עכשיו ננסה משהו — נסה לגשת ישירות לשדה פרטי מ-Main.java.\n' +
      'ראה מה קורה כשמנסים לשבור את כללי האנקפסולציה!',
    hintHebrew: 'נסה לכתוב: t1.energy = 50; ולחץ Run',
    requiredFile: 'Main.java',
  },
};
