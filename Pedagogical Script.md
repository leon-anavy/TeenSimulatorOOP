# **TeenSim Pedagogical Script: Instructions & Text Assets**

This file contains the UI strings and instructional logic for the student.

## **UI General Strings**

* **App Title:** TeenSim: Master OOP  
* **Tab 1 Name:** Teenager.java (Class Definition)  
* **Tab 2 Name:** Main.java (Simulation Runner)  
* **Console Header:** System Output / Compiler Errors

## **Stage 1: The Blueprint (Defining State)**

* **Instruction (Hebrew):** "ברוכים הבאים ל-TeenSim\! בואו נתחיל מהבסיס. מחלקה (Class) היא כמו תבנית. הגדירו בתוך המחלקה Teenager שני משתנים (Fields): energy ו-name. אל תשכחו להשתמש במילה private כדי לשמור על המידע מוגן\!"  
* **Required Action:** Define at least two private fields.  
* **Hint:** private int energy;

## **Stage 2: The Birth (Instantiation)**

* **Instruction (Hebrew):** "עכשיו כשיש לנו תבנית, בואו ניצור בן נוער אמיתי\! עברו לכרטיסיית Main.java והשתמשו במילת המפתח new כדי ליצור אובייקט חדש בשם t1."  
* **Required Action:** Teenager t1 \= new Teenager();  
* **Success Feedback:** "מזל טוב\! ה'עצם' (Object) הראשון שלכם נוצר בזיכרון והופיע בעולם\!"

## **Stage 3: Adding Behavior (Methods)**

* **Instruction (Hebrew):** "הדמות שלנו קפואה\! בואו ניתן לה חיים. חזרו ל-Teenager.java והוסיפו פעולה (Method) בשם study. בתוך הפעולה, הקטינו את האנרגיה ב-10. לאחר מכן, קראו לפעולה ב-Main."  
* **Required Action:** public void study() { energy \-= 10; } and t1.study(); in Main.

## **Stage 4: Encapsulation & Logic**

* **Instruction (Hebrew):** "אי אפשר ללמוד כשאין אנרגיה\! הוסיפו תנאי if בתוך הפעולה study שבודק אם האנרגיה גדולה מ-0. נסו גם לשנות את האנרגיה ישירות מה-Main וראו מה קורה (ספוילר: זה ייחסם\!)."  
* **Feedback for Private Access Violation:** "עצור\! ניסית לגשת למשתנה private מחוץ למחלקה. זהו עקרון ה'כמיסה' (Encapsulation) – רק הפעולות של המחלקה יכולות לשנות את הנתונים שלה."