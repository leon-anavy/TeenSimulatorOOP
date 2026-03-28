# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TeenSim** is a web-based pedagogical tool for teaching 10th-grade OOP concepts in Java via an interactive "Teenager Simulator." Students define classes, instantiate objects, and call methods while watching a visual avatar react in real time.

The app is fully implemented and deployed at **https://leon-anavy.github.io/TeenSimulatorOOP/** via GitHub Pages (Actions workflow on push to `master`). All code lives in `teensim/`.

## Tech Stack

- **Frontend:** React 18 + TypeScript (`verbatimModuleSyntax`, `erasableSyntaxOnly`)
- **State Management:** Zustand with immer middleware (`teensim/src/store/useAppStore.ts`)
- **Code Editor:** Monaco Editor (`@monaco-editor/react`) with custom `pseudo-java` language
- **Animations:** Framer Motion
- **Language:** Hebrew UI (audience: Israeli 10th graders)
- **Build:** Vite (`teensim/`)

## Deploy Workflow

**After every code change, automatically:**
1. `cd teensim && npm run build` — verify build passes
2. `cd .. && git add -A && git commit -m "<message>\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>" && git push origin master`

Do not ask for confirmation or a commit message. GitHub Actions deploys to GitHub Pages automatically on push.

## Architecture

### Dual-Pane Layout
Left pane: Monaco Editor with two file tabs (`Teenager.java`, `Main.java`). Right pane: simulation workspace (avatar, status bars, Object Inspector, console output). The active tab drives which rendering mode is shown.

### Two Rendering Modes (Contextual Visualizer)
| Active Tab | Mode | Display |
|---|---|---|
| `Teenager.java` | Blueprint View | Technical X-ray: fields mapped to visual elements |
| `Main.java` | Simulation View | Live world where instantiated objects act and update |

### Multi-File Pseudo-Java Interpreter
- **Teenager.java** defines the class (fields, constructor, methods)
- **Main.java** writes client code (instantiation via `new`, method calls)
- A **Symbol Table** is built from Teenager.java and used to validate Main.java
- A **Validation Layer** blocks illegal access (e.g., direct writes to `private` fields from Main.java)

### Runtime State
- **Instance Registry** — JS object holding all instantiated `Teenager` objects and their current field values
- **Action Dispatcher** — applies method effects to instance state
- **Virtual Memory** — state persists across code edits (not reset on each keystroke)
- **Object Inspector** — live JSON tree showing all instances and their properties

### 7-Stage Learning Progression
| Stage | File | Concept |
|---|---|---|
| 1 | Teenager.java | Define ≥2 `private` fields via AttributePicker |
| 2 | Teenager.java | Add ≥2 public methods |
| 3 | Teenager.java | Add constructor with initial values |
| 4 | Teenager.java | Add `toString()` |
| 5 | Main.java | Instantiate with `new`, press Run |
| 6 | Main.java | Call a method, print before/after, press Run |
| 7 | Main.java | Attempt direct field access → encapsulation error |

### Teenager Attributes & Method Effects
| Attribute | Type | Initial |
|---|---|---|
| `energy` | int | 100 |
| `happiness` | int | 80 |
| `gpa` | double | 90.0 |
| `phoneBattery` | int | 50 |
| `isHungry` | boolean | false |

| Method | State Delta |
|---|---|
| `study()` | energy -= 15, gpa += 2.0 |
| `sleep()` | energy = 100, happiness += 5 |
| `eat()` | isHungry = false, energy += 20 |
| `playGames()` | happiness += 25, energy -= 20 |
| `talkToFriends()` | happiness += 10, phoneBattery -= 10 |

## Data Flow

```
Edit Teenager.java → build Symbol Table (ClassSchema)
Edit Main.java     → validate against ClassSchema
  new keyword      → create entry in Instance Registry (VirtualMemory)
  method call      → Action Dispatcher updates instance state
                   → Simulation View re-renders avatar/bars
                   → Object Inspector reflects new state
```
