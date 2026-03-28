export type Stage = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface StageConfig {
  stage: Stage;
  titleHebrew: string;
  requiredFile: 'Teenager.java' | 'Main.java' | null;
  actionPrompt: string; // Explicit instruction shown in the checklist header
  modalTitle: string;
  modalBody: string;
  modalCode?: string;
  modalButtonText: string;
}

export const STAGE_CONFIGS: Record<Stage, StageConfig> = {
  1: {
    stage: 1,
    titleHebrew: 'שלב 1: בניית השרטוט',
    requiredFile: 'Teenager.java',
    actionPrompt: 'הוסף שדות למחלקה על ידי סימון ✓ בלוח הבחירה למטה',
    modalTitle: '🏗️ שלב 1: בניית השרטוט (Blueprint)',
    modalBody:
      'כשמתכנתים בג\'אווה, לא מתחילים ישר ליצור — מתחילים עם תכנון.\n\n' +
      'מחלקה (class) היא כמו שרטוט אדריכלי: היא מגדירה מה יהיה לכל מתבגר — אבל עדיין לא יצרנו מתבגר אמיתי.\n\n' +
      'בשלב הזה נגדיר את השדות — המידע שכל מתבגר יחזיק. שים לב למילה private — אנחנו מגנים על הנתונים!\n\n' +
      '💾 טיפ: בכל שלב תוכל ללחוץ על ⬇ הורד קבצים כדי לשמור את הקוד ולהמשיך בסביבת הפיתוח שלך.',
    modalCode: 'private int energy;',
    modalButtonText: '!הבנתי, בואו נבנה',
  },
  2: {
    stage: 2,
    titleHebrew: 'שלב 2: פעולות פנימיות',
    requiredFile: 'Teenager.java',
    actionPrompt: 'הוסף פעולות פנימיות על ידי סימון ✓ בלוח הבחירה למטה',
    modalTitle: '🎮 שלב 2: הוספת פעולות פנימיות',
    modalBody:
      'שדות מגדירים מה המתבגר יודע — אבל מה הוא יכול לעשות?\n\n' +
      'פעולה פנימית היא פיסת קוד שמשנה את מצב האובייקט. לדוגמה, study() מפחיתה אנרגיה ומעלה ממוצע — כמו בחיים האמיתיים!\n\n' +
      'בשלב הזה נוסיף לפחות שתי פעולות פנימיות למחלקה שלנו.',
    modalCode: 'public void study() {\n    energy -= 15;\n    gpa += 2.0;\n}',
    modalButtonText: '!הבנתי, בואו נוסיף פעולות',
  },
  3: {
    stage: 3,
    titleHebrew: 'שלב 3: קונסטרקטור',
    requiredFile: 'Teenager.java',
    actionPrompt: 'הוסף קונסטרקטור על ידי סימון ✓ בלוח הבחירה למטה',
    modalTitle: '🔧 שלב 3: הקונסטרקטור',
    modalBody:
      'כשיוצרים אובייקט חדש עם new Teenager(), ג\'אווה צריכה לדעת: מה הערכים ההתחלתיים?\n\n' +
      'זה תפקיד הקונסטרקטור — פעולה מיוחדת שנקראת אוטומטית בעת יצירת אובייקט.\n\n' +
      'בלעדיו, כל שדה מקבל ערך ברירת מחדל. עם קונסטרקטור, אתה שולט על נקודת ההתחלה.',
    modalCode: 'public Teenager() {\n    energy = 100;\n    happiness = 80;\n}',
    modalButtonText: '!הבנתי, בואו נגדיר התחלה',
  },
  4: {
    stage: 4,
    titleHebrew: 'שלב 4: toString()',
    requiredFile: 'Teenager.java',
    actionPrompt: 'הוסף את הפעולה toString() על ידי סימון ✓ בלוח הבחירה למטה',
    modalTitle: '🖨️ שלב 4: toString()',
    modalBody:
      'מה קורה כשכותבים System.out.println(t1)? ג\'אווה לא יודעת "להדפיס מתבגר" — אלא אם כן נלמד אותה.\n\n' +
      'הפעולה toString() היא אמנה בין האובייקט לשאר ג\'אווה: "כשמישהו ירצה להמיר אותי למחרוזת, כך אני נראה."\n\n' +
      'ברגע שנגדיר אותה, System.out.println(t1) יעבוד אוטומטית!',
    modalCode: 'public String toString() {\n    return "energy=" + energy;\n}',
    modalButtonText: '!הבנתי, בואו נגדיר ייצוג',
  },
  5: {
    stage: 5,
    titleHebrew: 'שלב 5: הולדת אובייקט',
    requiredFile: 'Main.java',
    actionPrompt: 'כתוב ב-Main.java: Teenager t1 = new Teenager(); — ואז לחץ Run',
    modalTitle: '✨ שלב 5: הולדת אובייקט!',
    modalBody:
      'השרטוט מוכן לחלוטין! עכשיו מגיע הרגע המרגש — יצירת אובייקט אמיתי.\n\n' +
      'נעבור לקובץ Main.java ונשתמש במילה הקסומה new. ברגע שנריץ את הקוד, מתבגר חי יופיע על המסך — עם כל הערכים שהגדרנו בקונסטרקטור.',
    modalCode: 'Teenager t1 = new Teenager();',
    modalButtonText: '!הבנתי, בואו ניצור מתבגר',
  },
  6: {
    stage: 6,
    titleHebrew: 'שלב 6: אינטראקציה',
    requiredFile: 'Main.java',
    actionPrompt: 'כתוב קריאה לפעולה פנימית, הדפס לפני ואחרי, ואז לחץ Run',
    modalTitle: '🎬 שלב 6: אינטראקציה עם האובייקט',
    modalBody:
      'יש לנו מתבגר חי! הגיע הזמן לתקשר איתו — לקרוא לפעולות הפנימיות ולראות איך המצב משתנה.\n\n' +
      'הטריק החשוב: נדפיס את המצב לפני ואחרי הפעולה — כדי לראות בבירור שהאובייקט השתנה.\n\n' +
      'זה בדיוק מה שמבדיל אובייקט חי מנתון סטטי!',
    modalCode: 'System.out.println(t1);\nt1.study();\nSystem.out.println(t1);',
    modalButtonText: '!הבנתי, בואו נפעיל פעולות',
  },
  7: {
    stage: 7,
    titleHebrew: 'שלב 7: אנקפסולציה',
    requiredFile: 'Main.java',
    actionPrompt: 'נסה לכתוב גישה ישירה לשדה: t1.energy = 50; — ואז לחץ Run',
    modalTitle: '🔒 שלב 7: אנקפסולציה — הכוח של private',
    modalBody:
      'זוכר שהגדרנו את כל השדות כ-private? עכשיו ננסה לגשת אליהם ישירות מ-Main.java.\n\n' +
      'הקומפיילר של ג\'אווה יסרב — וזה בדיוק מה שרצינו! המילה private יוצרת חומה סביב הנתונים.\n\n' +
      'רק הפעולות הפנימיות של המחלקה יכולות לשנות אותם. זהו עיקרון האנקפסולציה — אחד מעמודי היסוד של תכנות מונחה עצמים.\n\n' +
      '💾 טיפ: לאחר שתסיים, תוכל להוריד את הקבצים (כפתור ⬇ בחלק העליון) ולהמשיך לתכנת בסביבת הפיתוח שלך!',
    modalCode: 't1.energy = 50; // ← הקומפיילר יגיד לא!',
    modalButtonText: '!הבנתי, ננסה לשבור את הכלל',
  },
};
