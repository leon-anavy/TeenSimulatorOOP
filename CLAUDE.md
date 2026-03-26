# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TeenSim** is a web-based pedagogical tool for teaching 10th-grade OOP concepts in Java via an interactive "Teenager Simulator." Students define classes, instantiate objects, and call methods while watching a visual avatar react in real time.

This repository currently contains specification documents only — no implementation files exist yet. The specs fully define the architecture to be built.

## Specification Documents

- **Technical Specification.md** — Core architecture, UI/UX layout, multi-file pseudo-Java interpreter design, contextual visualizer engine, and API/data flow
- **Functional Logic.md** — Cross-file compiler engine, runtime state management, stage transition logic, and Object Inspector behavior
- **Content Library.md** — Mapping of Java class attributes and methods to visual assets and animations
- **Pedagogical Script.md** — Instructional text (in Hebrew), required actions per stage, and student feedback messages

## Planned Tech Stack

- **Frontend:** React + TypeScript
- **State Management:** Zustand or Redux
- **Code Editor:** Monaco Editor (with custom pseudo-Java syntax highlighting)
- **Language:** Hebrew UI (primary audience: Israeli 10th graders)

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

### 4-Stage Learning Progression
| Stage | File | Concept | Unlock Condition |
|---|---|---|---|
| 1: Blueprint | Teenager.java | Define `private` fields | ≥2 fields defined |
| 2: Birth | Main.java | `new` keyword / instantiation | Avatar appears with animation |
| 3: Interaction | Main.java | Method calls, state change | Console opens, animations play |
| 4: Encapsulation | Both | Access modifiers, getters/setters | Error triggered on private field access |

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
