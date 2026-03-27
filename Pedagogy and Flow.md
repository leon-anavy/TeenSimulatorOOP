# TeenSim — Pedagogy & Flow Document

## Overview

**TeenSim** is an interactive, browser-based learning environment for teaching Object-Oriented Programming concepts to 10th-grade students. The primary language of instruction is **Hebrew (RTL)**. Students write real Java code in a Monaco editor and immediately see a visual avatar — a "teenager" — react to their code in real time.

The core pedagogical philosophy is **learn by doing**: students never read about a concept in isolation. Every OOP concept is introduced only when the student performs the action that requires it, and the consequence is always immediately visible.

---

## Target Audience

- 10th grade Israeli students (approximately age 15–16)
- First exposure to OOP — may have some prior procedural programming experience
- Hebrew is the primary language of instruction; Java is the target language
- No local Java installation required — everything runs in the browser

---

## Architecture Overview (Pedagogically Relevant)

### Dual-Pane Layout

| Left Pane | Right Pane |
|---|---|
| Monaco code editor | Instructions, visualizer, inspector, console |
| Two file tabs: `Teenager.java` / `Main.java` | Active content changes by stage and file |
| Run + Reset buttons (Main.java only) | AttributePicker (Teenager.java only) |

### Two Rendering Modes

The active file tab determines what is shown in the visualizer:

| Active File | Mode | What the Student Sees |
|---|---|---|
| `Teenager.java` | **Blueprint View** | A technical X-ray of the avatar with field annotations arranged around it; method pills listed below; parse errors shown inline |
| `Main.java` | **Simulation View** | A bedroom scene where instantiated objects appear as living characters with animated reactions |

This dual-mode design forces students to mentally separate **class definition** (the blueprint) from **object instantiation** (the living world). They physically switch files and the entire visual metaphor changes.

---

## The 7-Stage Learning Progression

The application guides students through 7 sequential stages. Each stage unlocks only when its completion condition is met — progress cannot be skipped (except via the developer Quick Start button). Students can navigate back to review any previously completed stage without losing progress.

---

### Stage 1 — Blueprint: Define Private Fields
**File:** `Teenager.java`
**Visual Mode:** Blueprint View
**Pedagogical Concept:** Class definition, fields, access modifiers

**What the student does:**
Adds at least 2 `private` fields to the `Teenager` class using the AttributePicker checkboxes or by typing directly in the editor.

**Available fields:**
| Field | Type | Initial Default | Visual Role |
|---|---|---|---|
| `energy` | `int` | 100 | Avatar eye state, face energy |
| `happiness` | `int` | 80 | Avatar smile expression |
| `gpa` | `double` | 90.0 | Status bar |
| `phoneBattery` | `int` | 50 | Phone icon on avatar's arm |
| `isHungry` | `boolean` | false | Stomach visual |

**Advancement condition:**
Parsed automatically (300ms debounce after typing): `≥ 2 fields with accessModifier === 'private'`

**Enforcement:**
- Only the 5 fields above are accepted — any other name triggers a parse error and the field is **not added** to the schema: *"השדה X אינו נתמך בסימולציה"*
- Fields written without `private` trigger: *"שדה בשורה N חסר מגדיר גישה. האם התכוונת ל-private?"*

**Supporting UI:**
An expandable "למה private?" (Why private?) section in the instruction card explains:
- `private` → only the class itself can access the field
- `public` → any external code can modify the data directly — dangerous!
- Teaser: *"In stage 7 you'll see what happens when the rule is broken"*

**Key teaching moment:**
The Blueprint View renders field annotations around the avatar's body as the student types — the schema is live. Students see the class "filling up" as they add fields, making the metaphor of a blueprint concrete.

---

### Stage 2 — Define Methods
**File:** `Teenager.java`
**Visual Mode:** Blueprint View
**Pedagogical Concept:** Methods as behaviors, method body, state mutation

**What the student does:**
Adds at least 1 `public void` method to the class. The AttributePicker now shows both the Fields section and a Methods section.

**Available methods and their effect on state:**
| Method | State Delta | Animation |
|---|---|---|
| `study()` | `energy -= 15`, `gpa += 2.0` | Books flying |
| `sleep()` | `energy = 100`, `happiness += 5` | Zzz bubbles |
| `eat()` | `isHungry = false`, `energy += 20` | Pizza slice |
| `playGames()` | `happiness += 25`, `energy -= 20` | Controller |
| `talkToFriends()` | `happiness += 10`, `phoneBattery -= 10` | Chat bubbles |

**Advancement condition:**
`≥ 1 method with accessModifier === 'public'`

**Key teaching moment:**
Each method has a body that modifies specific fields. Students see their custom method body appear in the Blueprint's "Methods" pill list. The connection between a method signature and its effect on fields is made concrete before any object exists.

---

### Stage 3 — Constructor
**File:** `Teenager.java`
**Visual Mode:** Blueprint View
**Pedagogical Concept:** Constructor, initial state, object identity

**What the student does:**
Adds a constructor (`public Teenager() { ... }`) that sets initial values for the fields. The constructor body can use assignment statements like `energy = 80;`.

**Advancement condition:**
`classSchema.constructor !== null` (constructor parsed successfully)

**Key teaching moment:**
Without a constructor explanation, students have no reason why objects "start" with any particular values. The constructor makes explicit that every object begins with values that the programmer chooses. The hint: `public Teenager() { energy = 80; happiness = 70; }`

---

### Stage 4 — toString()
**File:** `Teenager.java`
**Visual Mode:** Blueprint View
**Pedagogical Concept:** Special methods, object representation, method overriding (preview)

**What the student does:**
Adds a `public String toString()` method via the AttributePicker checkbox. The default template provided is:
```java
public String toString() {
    return "Teenager [energy=" + energy + ", happiness=" + happiness + "]";
}
```

**Advancement condition:**
A method named `toString` with `returnType === 'String'` and `accessModifier === 'public'` exists in the schema.

**Key teaching moment:**
Students learn that `System.out.println(t1)` doesn't print an address — it calls `toString()` automatically. This is their first encounter with Java's convention of overriding a standard method. The instruction card explains: *"In the future, when we write System.out.println(t1), Java will automatically call toString()!"*

**Enforcement:**
`System.out.println(t1.energy)` — accessing a private field via println — is blocked with an encapsulation error and a suggestion to use `toString()` instead. This prepares the student for Stage 7.

---

### Stage 5 — Instantiation: Birth of an Object
**File:** `Main.java` (newly unlocked)
**Visual Mode:** Simulation View
**Pedagogical Concept:** Instantiation, the `new` keyword, heap allocation (conceptually)

**What the student does:**
Switches to `Main.java` (the tab blinks when first unlocked) and writes:
```java
Teenager t1 = new Teenager();
```
Then clicks **Run**.

**Advancement condition (runtime):**
At least one `INSTANTIATE` statement executes successfully (either via real Java execution or local interpreter fallback) — `instancesCreated === true` after run.

**What happens on success:**
- The Simulation View comes alive: the bedroom scene appears
- A `Teenager` card animates into existence with a spring entrance
- The Object Inspector ("Memory View") appears showing the instance's field values
- Console logs: *'אובייקט "t1" נוצר בזיכרון! 🎉'*
- The `Main.java` tab stops blinking

**Key teaching moment:**
The transition from Blueprint View to Simulation View is the primary "aha moment" of the application. The student has been looking at a static X-ray diagram; now a living character appears. The instructor can explain: the class was the blueprint, `new` creates a real thing from that blueprint.

**Object Inspector (Memory View):**
Shows only the fields the student actually defined (filtered to `classSchema.fields`). Displays current values of each field, formatted by type (booleans show `true`/`false`, doubles show one decimal place).

---

### Stage 6 — Interaction: Calling Methods
**File:** `Main.java`
**Visual Mode:** Simulation View
**Pedagogical Concept:** Method calls, state change, object behavior, `System.out.println`

**What the student does:**
Calls a method on the object and optionally prints it:
```java
t1.study();
System.out.println(t1);
```
Then clicks **Run**.

**Advancement condition (runtime):**
At least one method call ran successfully — `methodsRan === true`.

**What happens on success:**
- The avatar plays the method's animation (e.g. books flying for `study()`)
- Field values in the Object Inspector update to reflect the new state
- The avatar's expression and visual state change (e.g. lower energy → droopy eyes)
- `System.out.println(t1)` invokes `toString()` and prints the result to console
- Console logs: *'t1.study() הופעל בהצלחה'*

**Supported console operations:**
- `System.out.println("literal string")` → prints string
- `System.out.println(42)` → prints number
- `System.out.println(t1)` → invokes toString(), prints result
- `System.out.println(t1.fieldName)` → **blocked** if field is private (encapsulation violation)

**Validation (local mode):**
- Method called on undefined variable → *"המשתנה X לא הוגדר. צור אובייקט קודם"*
- Method not defined in class → *"המתודה X לא קיימת ב-Teenager"*
- Wrong number of arguments → *"המתודה X מצפה ל-N פרמטרים, אך קיבלה M"*

**Multiple instances:**
Up to 3 instances can coexist in the simulation. Each appears as its own card with its own avatar, status bars, and state.

---

### Stage 7 — Encapsulation
**File:** `Main.java`
**Visual Mode:** Simulation View
**Pedagogical Concept:** Encapsulation, access control, the consequence of `private`

**What the student does:**
Attempts to directly access a private field from outside the class:
```java
t1.energy = 50;
```
Then clicks **Run**.

**What happens:**
In **Java mode** (real execution):
- The Java compiler returns a compile error: *"energy has private access in Teenager"*
- The app translates this to Hebrew: *"ניסית לגשת לשדה הפרטי 'energy' — זהו עיקרון האנקפסולציה!"*

In **local mode** (interpreter):
- The validator catches the direct field write before execution
- Error message shown in console with encapsulation explanation

**Key teaching moment:**
This is the payoff of everything. Students have been using `private` since stage 1 without fully understanding the consequence. Now they see the compiler itself enforcing the rule. The error is not a failure — it is the lesson. Instructors should celebrate this error with students.

**Suggestion shown alongside the error:**
*"Use a public function (setter) like setEnergy()"* — previewing the next natural topic after this module (getters/setters).

---

## Supporting UI Elements

### AttributePicker (Fields & Methods Panel)

Visible **only when `Teenager.java` is active** (Blueprint View). Collapsible panel in the right pane.

- **Fields section** (always visible in Blueprint mode): 5 checkboxes, each inserting/removing the exact field declaration from the editor
- **Methods section** (visible from Stage 2 onward): 6 checkboxes (5 behavioral methods + `toString()`), each inserting/removing a complete method with a canonical body

Check state is **derived** from the current `classSchema` — not stored separately. This means if a student manually edits or deletes a method, the checkbox unchecks automatically.

Code insertion: finds the last `}` in the file and inserts before it. Code removal: regex line-by-line match.

---

### Stage Navigation (Header Dots)

7 numbered dots in the header represent the 7 stages:
- **Active** (bright blue): current stage
- **Done** (green, shows ✓): completed stage
- **Locked** (dim, not clickable): not yet reached

Clicking a completed stage dot switches the instruction panel to review that stage's content and switches the file tab to that stage's required file. **Progress is never reset** — `currentStage` and `viewingStage` are separate. A "Reviewing" badge appears when looking back at a past stage.

---

### Object Inspector (Memory View)

Shows only after the first object is created. Displays a JSON-like tree of all live instances with their current field values. Only fields the student defined are shown (filtered by `classSchema.fields`). Updates live after every Run.

---

### Console Panel

Appears after Main.java is unlocked. Shows four types of entries:
| Icon | Kind | Meaning |
|---|---|---|
| `▶` | system | App messages (running, mode warnings) |
| `✓` | success | Object created successfully |
| `›` | log | Output from `System.out.println` or method calls |
| `✗` | error | Compiler errors, validation errors, encapsulation violations |

Error entries include a **💡 suggestion line** when relevant (e.g., "Use toString() to print the object").

---

## Execution Modes

### Java Mode (Default — ☕ Java)

Uses the **Judge0 CE** public code execution API. Sends a merged single-file submission (Teenager class made non-public so both classes can coexist in one file). Before submission, the code is instrumented:

1. A `getTeenSimState()` method is injected into the Teenager class, generating a JSON string of **only the fields the student actually defined**
2. After each `new Teenager()` call, a `System.out.println("__TS__|new|varName|" + varName.getTeenSimState())` line is injected
3. After each method call, a `System.out.println("__TS__|call|methodName|varName|" + varName.getTeenSimState())` line is injected
4. Output is parsed: `__TS__` lines update the Zustand store; all other lines go to the console

This means students get **real Java compiler errors** with real line numbers, real semantics for any Java they write (loops, conditionals, complex expressions), and real `toString()` output.

### Local Mode (Fallback — ⚡ Local)

A hand-written TypeScript interpreter that handles a subset of Java:
- Field assignments and compound assignments (`+=`, `-=`)
- `if` blocks with simple comparisons
- Method calls with argument passing
- `System.out.println` with literals and field access

Activates automatically if the Judge0 API is unreachable (network timeout, auth failure). The mode toggle button in the run bar allows manual switching.

---

## Data Flow Summary

```
Student edits Teenager.java
    ↓ (300ms debounce)
teenagerParser.ts → ClassSchema
    → BlueprintView updates (fields, methods annotated around avatar)
    → AttributePicker check state updates
    → Stage 1→4 advancement checks run

Student clicks Run (Main.java active)
    ↓
[Java mode]
    javaExecutor.ts
    → instrumentTeenager(code, fieldNames) → injects getTeenSimState()
    → instrumentMain(code, statements) → injects __TS__ reporters
    → mergeForSingleFile(teenager, main) → one compilable file
    → POST to Judge0 CE API
    → Poll for result (~2–4 seconds)
    → Parse stdout: __TS__ lines → updateInstanceState()
    → Parse compile_output → Hebrew error messages

[Local mode]
    mainParser.ts → MainStatement[]
    → validator.ts → ParseError[] (encapsulation, arity, undefined vars)
    → interpreter.ts → executes statements, updates store

In both modes:
    → Zustand store updated (instances, consoleEntries)
    → SimulationView re-renders (avatar expression, status bars)
    → ObjectInspector re-renders (field values)
    → ConsolePanel appends entries
    → Stage 5→6→7 advancement checks run
```

---

## Pedagogical Sequence Summary

| Stage | Concept | Trigger | Payoff |
|---|---|---|---|
| 1 | `private` fields | Type 2 fields | Blueprint X-ray fills up |
| 2 | Methods as behaviors | Add 1 method | Method pills appear in blueprint |
| 3 | Constructor = initial state | Add constructor | Object will have meaningful starting values |
| 4 | `toString()` = representation | Add toString | Printing an object works naturally |
| 5 | `new` = instantiation | Write `new Teenager()` + Run | Avatar appears in bedroom |
| 6 | Method calls = state change | Call a method + Run | Avatar reacts, values update |
| 7 | `private` = enforced | Try direct field write | Compiler error explains why |

The arc moves from **static definition** (what a Teenager *is*) to **dynamic behavior** (what a Teenager *does*) to **access enforcement** (what a Teenager *protects*). By the end, every element of a basic OOP class — fields, constructor, methods, toString, encapsulation — has been encountered in a context that made it feel necessary rather than arbitrary.

---

## Known Gaps and Future Pedagogy Topics

The current module ends at Stage 7. Natural continuations:

1. **Getters and Setters** — the encapsulation error at Stage 7 naturally prompts "so how DO I access the field?" — setters/getters answer this
2. **Multiple constructors / overloading** — students could explore `new Teenager(50)` to set initial energy
3. **Inheritance** — a `Student extends Teenager` class could be a natural next module
4. **Arrays / Collections** — `Teenager[]` of students, demonstrated visually with multiple avatar cards
5. **Interfaces** — an `IBehavior` interface defining what methods a Teenager must have
