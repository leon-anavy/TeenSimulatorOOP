import type { PedagogicalErrorKind } from '../parser/types';

export const ERROR_MESSAGES: Record<PedagogicalErrorKind, string> = {
  ENCAPSULATION_VIOLATION:
    'ניסית לגשת ישירות לשדה פרטי מחוץ למחלקה. זהו עיקרון האנקפסולציה — רק המחלקה עצמה יכולה לשנות את הנתונים שלה!',
  UNDEFINED_METHOD:
    'קראת למתודה שלא קיימת במחלקה. בדוק את שם המתודה או הגדר אותה ב-Teenager.java.',
  UNDEFINED_VARIABLE:
    'ניסית להשתמש במשתנה שלא יצרת. צור אובייקט קודם עם new Teenager().',
  TYPE_MISMATCH:
    'הערך שהכנסת לא תואם את הסוג של השדה. בדוק את סוג הנתונים.',
  METHOD_IN_MAIN:
    'הגדרת מתודה ב-Main.java. מתודות מוגדרות בתוך המחלקה בקובץ Teenager.java.',
  CLASS_DEFINITION_IN_MAIN:
    'הגדרת מחלקה ב-Main.java. המחלקה שייכת לקובץ Teenager.java.',
  MISSING_SEMICOLON:
    'חסר נקודה-פסיק (;) בסוף שורת קוד.',
  PRIVATE_MODIFIER_MISSING:
    'שדה מוגדר ללא מגדיר גישה. הוסף private לפני הסוג.',
  WRONG_ARG_COUNT:
    'מספר הפרמטרים שהעברת לא תואם את הגדרת המתודה.',
  UNSUPPORTED_FIELD:
    'שם השדה אינו נתמך בסימולציה. השתמש באחד מהשמות: energy, happiness, gpa, phoneBattery, isHungry.',
  SYNTAX_ERROR:
    'שגיאת תחביר. בדוק את הקוד ונסה שוב.',
};
