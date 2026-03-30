# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TeenSim** is a React-based interactive Java OOP educational simulator for 10th-grade Israeli students. Students define a `Teenager` class, instantiate objects, and call methods while watching a visual avatar respond in real time. The entire UI is in Hebrew (RTL).

**Live:** https://leon-anavy.github.io/TeenSimulatorOOP/
**Repo:** https://github.com/leon-anavy/TeenSimulatorOOP
**Author:** Leon Anavy — leon.anavy@reali.org.il — הריאלי העברי בחיפה

---

## Deploy Workflow

**After every code change, automatically run:**
```bash
cd /Users/leonanavy/TeenSimulatorOOP && bash deploy.sh "<commit message>"
```

`deploy.sh` builds, commits (with Co-Authored-By line), and pushes to `master`. GitHub Actions then deploys to GitHub Pages automatically. Do NOT ask for confirmation or a commit message — write one and pass it as the argument.

**Dev server:** `cd teensim && npm run dev` → http://localhost:5173

---

## Tech Stack

- **React 19 + TypeScript 5.9** (`verbatimModuleSyntax`, `erasableSyntaxOnly` — all type imports must use `import type`)
- **Zustand 5 + Immer** — all app state in `src/store/useAppStore.ts`
- **Monaco Editor** (`@monaco-editor/react`) — custom `pseudo-java` language; use `key={activeFile}` to force remount on tab switch
- **Framer Motion 12** — AnimatePresence, motion, spring transitions throughout
- **Vite 8** with `base: '/TeenSimulatorOOP/'`

---

## Architecture

### Dual-Pane Layout (AppShell.tsx)

**Left pane:** File tabs (Teenager.java / Main.java) → Monaco editor → Run/Reset buttons
**Right pane:** TaskChecklist → [AttributePicker + VisualizerPane side-by-side] → ObjectInspector → ConsolePanel

The picker and visualizer sit in a `.picker-visualizer-row` flex row so the avatar is always visible alongside the checkboxes.

### Two Files, Two Modes

| Active tab | Visualizer mode | Purpose |
|---|---|---|
| `Teenager.java` | Blueprint View | X-ray of class structure; AttributePicker visible |
| `Main.java` | Simulation View | Live instances; AttributePicker hidden |

### State Store (src/store/useAppStore.ts)

All state lives here. Key fields:

| Field | Type | Purpose |
|---|---|---|
| `activeFile` | `'Teenager.java' \| 'Main.java'` | Which editor tab is open |
| `teenagerCode` / `mainCode` | string | Editor contents |
| `classSchema` | `ClassSchema \| null` | Parsed Teenager.java structure |
| `symbolTable` | `SymbolTable \| null` | Built from classSchema for validation |
| `parseErrors` | `ParseError[]` | Errors with Hebrew messages |
| `instances` | `Record<string, TeenagerInstance>` | All live objects |
| `currentStage` | `Stage` (1–7) | Highest stage reached |
| `viewingStage` | `Stage` | Which stage checklist is shown (for review) |
| `pendingLevelComplete` | boolean | 3-second delay phase before overlay |
| `showLevelComplete` | boolean | LevelComplete overlay visible |
| `levelCompleteForStage` | `Stage \| null` | Which stage completed |
| `isModuleComplete` | boolean | true after stage 7 encapsulation triggered |
| `editorReadOnly` | boolean | Locks Monaco on Teenager stages until checklist done |
| `mainTabUnlocked` | boolean | True at stage 5+ |
| `executionMode` | `'java' \| 'local'` | Judge0 vs. local interpreter |
| `instancesCreated` / `methodsRan` / `encapsulationViolation` | boolean | Task completion flags for checklist |
| `consoleEntries` | `ConsoleEntry[]` | log/error/success/system output |

Key actions: `advanceStage(to)`, `triggerLevelComplete()`, `dismissLevelComplete(goNext)`, `completeModule()`, `addInstance(varName)`, `updateInstanceState(varName, state)`, `setRunResult({...})`, `jumpToMain()`, `setEditorReadOnly(v)`, `appendConsole(kind, msg, suggestion?)`.

### 7-Stage Learning Progression

| Stage | File | Concept | Auto-advance condition |
|---|---|---|---|
| 1 | Teenager.java | Define ≥2 `private` fields | `useParseTeenager`: ≥2 private fields |
| 2 | Teenager.java | Add ≥2 public methods | `useParseTeenager`: ≥2 public methods |
| 3 | Teenager.java | Add constructor with body | `useParseTeenager`: constructor + ≥1 body stmt |
| 4 | Teenager.java | Add `toString()` | `useParseTeenager`: public String toString() |
| 5 | Main.java | Instantiate with `new`, press Run | `useRunMain`: instancesCreated=true |
| 6 | Main.java | Call method, print before/after, Run | `useRunMain`: methodsRan=true |
| 7 | Main.java | Attempt direct field access → error | `useRunMain`: encapsulationViolation=true |

**Stage advance flow:** `advanceStage(n)` → sets `pendingLevelComplete=true` → 3s timer → `triggerLevelComplete()` → overlay appears → student clicks Next → `dismissLevelComplete(true)` → `viewingStage` advances → `StageModal` shows for new stage.

### Parser System (src/parser/)

- **tokenizer.ts** — `tokenize(source): Token[]`
- **teenagerParser.ts** — `parseTeenager(source): TeenagerParseResult` → `ClassSchema`
  - Only 5 supported field names: `energy`, `happiness`, `gpa`, `phoneBattery`, `isHungry`
  - `skipBlock(cursor)` helper prevents infinite loops on mismatched braces
- **mainParser.ts** — `parseMain(source, symbolTable): MainParseResult` → `MainStatement[]`
  - Detects ENCAPSULATION_VIOLATION during parse (direct write to private field)
- **symbolTable.ts** — `buildSymbolTable(schema): SymbolTable`

**ClassSchema:**
```ts
{ className, fields: FieldDef[], constructor: ConstructorDef | null, methods: MethodDef[] }
```

**MainStatement kinds:** `INSTANTIATE`, `METHOD_CALL`, `FIELD_WRITE`, `FIELD_READ`, `PRINT`

### Engine (src/engine/)

- **interpreter.ts** — `executeMain(statements, symbolTable, existingInstances)` — local execution
- **bodyRunner.ts** — `runBodyStatement()` — executes ASSIGN, COMPOUND_ASSIGN, IF_BLOCK
- **validator.ts** — `validateStatements()` — undefined vars/methods, wrong arg count
- **javaExecutor.ts** — `executeWithJava()` — Judge0 CE backend (language_id=62), falls back to local
- **codeInstrumenter.ts** — injects `getTeenSimState()` + `__TS__|new|varName|{...}` reporters

### Hooks (src/hooks/)

- **useParseTeenager.ts** — debounced (300ms) Teenager.java parser; handles stages 1→2→3→4→5
- **useRunMain.ts** — Run button handler; tries Java executor, falls back to local; handles stages 5→6→7→complete

### Method Effects (src/constants/methodEffects.ts)

```ts
DEFAULT_STATE = { energy: 100, happiness: 80, gpa: 90.0, phoneBattery: 50, isHungry: false }

study():         energy -= 15, gpa += 2.0
sleep():         energy = 100, happiness += 5
eat():           isHungry = false, energy += 20
playGames():     happiness += 25, energy -= 20
talkToFriends(): happiness += 10, phoneBattery -= 10
```

### AttributePicker (src/components/stage/AttributePicker.tsx)

Checkbox-based GUI for stages 1–4. Inserts/removes code snippets from Teenager.java.

**METHOD_REQUIRES** — dependency table (prevents adding method if required fields missing):
```ts
study:         ['energy', 'gpa']
sleep:         ['energy', 'happiness']
eat:           ['isHungry', 'energy']
playGames:     ['happiness', 'energy']
talkToFriends: ['happiness', 'phoneBattery']
toString:      ['energy', 'happiness']
```
Methods with unmet deps are dimmed (opacity 0.45) with 🔒 icon; clicking shows a blocking toast.

**Sections shown by stage:**
- Stage 1+: Fields
- Stage 2+: Methods (behavioral)
- Stage 3+: Constructor
- Stage 4+: toString

### Stage Config (src/constants/stageConfig.ts)

Each `StageConfig` has: `stage`, `titleHebrew`, `requiredFile`, `actionPrompt`, `modalTitle`, `modalBody`, `modalCode?`, `modalButtonText`.

### Component Map

| Component | Purpose |
|---|---|
| `WelcomeScreen` | Full-screen onboarding; explains two-file structure; z-index 2000 |
| `StageModal` | Per-stage intro modal; resets on `viewingStage` change; z-index 1000 |
| `LevelComplete` | Stage completion overlay with 3s delay; has download button; z-index 1500 |
| `TaskChecklist` | Stage-specific task list with animated checkmarks |
| `AttributePicker` | Field/method checkbox picker with dependency validation |
| `VisualizerPane` | Switches between BlueprintView (Teenager.java) and SimulationView (Main.java) |
| `BlueprintView` | X-ray of class structure |
| `SimulationView` | Live room with instantiated Teenager avatars |
| `AvatarBase` | Emoji-based avatar driven by instance state |
| `StatusBars` | Visual bars for energy, happiness, gpa, phoneBattery, hunger |
| `ObjectInspector` | JSON tree of all live instances |
| `ConsolePanel` | log/error/success/system output pane |
| `CodeEditor` | Monaco editor with pseudo-java highlighting; `key={activeFile}` forces remount |
| `FileTabs` | Tab switcher; Main.java locked until stage 5 |
| `RunButton` | Run (▶), Reset (↺), Mode toggle (☕/⚡) — visible on Main.java only |

### Download Feature

`handleDownload()` in `AppShell.tsx` (via `useDownload` hook) downloads `Teenager.java` and (if unlocked) `Main.java` as blobs. Also exposed in every `LevelComplete` card and as a dedicated toolbar row between FileTabs and the editor.

---

## Key Patterns & Gotchas

- **`editorReadOnly`** is only enforced when `activeFile === 'Teenager.java' && viewingStage === currentStage`. Reviewing old stages and Main.java are always editable.
- **`viewingStage` vs `currentStage`**: `advanceStage` moves `currentStage` but NOT `viewingStage`. Only `dismissLevelComplete(true)` advances `viewingStage`.
- **`skipBlock(cursor)`** in teenagerParser — critical for preventing infinite loops when user types `{` without closing it.
- **`key={activeFile}`** on Monaco Editor — required to force remount when switching tabs, otherwise the editor caches wrong content.
- **`stripComments(code)`** in TaskChecklist — strips `// comments` before condition checks to prevent false positives from hint text.
- **Encapsulation violations are educational** — they are NOT hard errors. The interpreter allows execution to proceed; the error is logged to console for the student to read.
- **Fallback execution**: if Judge0 fails (network/auth), execution falls back to local interpreter silently.
