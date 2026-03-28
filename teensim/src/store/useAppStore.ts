import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ClassSchema, SymbolTable, ParseError } from '../parser/types';
import type { TeenagerState, MethodName } from '../constants/methodEffects';
import { DEFAULT_STATE } from '../constants/methodEffects';
import { DEFAULT_TEENAGER_CODE, DEFAULT_MAIN_CODE, FULL_TEENAGER_CODE } from '../constants/defaultCode';
import type { Stage } from '../constants/stageConfig';
import { runBodyStatement } from '../engine/bodyRunner';

// ─── Instance ─────────────────────────────────────────────────────────────────

export interface TeenagerInstance {
  id: string; // varName e.g. "t1"
  state: TeenagerState;
  activeAnimation: MethodName | null;
  createdAt: number;
}

// ─── Console ──────────────────────────────────────────────────────────────────

export type ConsoleEntryKind = 'log' | 'error' | 'success' | 'system';

export interface ConsoleEntry {
  id: string;
  kind: ConsoleEntryKind;
  message: string;
  timestamp: number;
  suggestion?: string;
}

// ─── Full Store ───────────────────────────────────────────────────────────────

interface AppState {
  // Editor
  activeFile: 'Teenager.java' | 'Main.java';
  teenagerCode: string;
  mainCode: string;

  // Schema
  classSchema: ClassSchema | null;
  symbolTable: SymbolTable | null;
  parseErrors: ParseError[];

  // Instances
  instances: Record<string, TeenagerInstance>;

  // Stage
  currentStage: Stage;
  viewingStage: Stage;
  mainTabUnlocked: boolean;
  mainTabBlinking: boolean;
  consoleVisible: boolean;

  // Welcome screen
  welcomeCompleted: boolean;

  // Level complete screen
  pendingLevelComplete: boolean;  // 3-second delay before overlay appears
  showLevelComplete: boolean;
  levelCompleteForStage: Stage | null;
  isModuleComplete: boolean; // True after stage 7 encapsulation is triggered

  // Editor lock
  editorReadOnly: boolean; // True until checklist complete or user unlocks

  // Execution
  executionMode: 'java' | 'local';
  isExecuting: boolean;

  // Run results (for task checklist)
  instancesCreated: boolean;
  methodsRan: boolean;
  encapsulationViolation: boolean;

  // Console
  consoleEntries: ConsoleEntry[];
}

interface AppActions {
  setActiveFile: (f: 'Teenager.java' | 'Main.java') => void;
  setTeenagerCode: (code: string) => void;
  setMainCode: (code: string) => void;
  setClassSchema: (schema: ClassSchema, table: SymbolTable) => void;
  setParseErrors: (errors: ParseError[]) => void;
  clearSchema: () => void;

  addInstance: (varName: string) => void;
  updateInstanceState: (varName: string, newState: TeenagerState) => void;
  setAnimation: (varName: string, anim: MethodName | null) => void;
  resetInstances: () => void;

  advanceStage: (to: Stage) => void;
  setViewingStage: (s: Stage) => void;
  stopMainTabBlinking: () => void;
  setExecutionMode: (mode: 'java' | 'local') => void;
  setIsExecuting: (v: boolean) => void;
  setRunResult: (r: { instancesCreated: boolean; methodsRan: boolean; encapsulationViolation: boolean }) => void;
  jumpToMain: () => void;

  setWelcomeCompleted: () => void;
  triggerLevelComplete: () => void;
  dismissLevelComplete: (goNext: boolean) => void;
  completeModule: () => void;
  setEditorReadOnly: (v: boolean) => void;

  appendConsole: (kind: ConsoleEntryKind, message: string, suggestion?: string) => void;
  clearConsole: () => void;
}

let entryCounter = 0;

export const useAppStore = create<AppState & AppActions>()(
  immer((set) => ({
    // ── Initial State ──
    activeFile: 'Teenager.java',
    teenagerCode: DEFAULT_TEENAGER_CODE,
    mainCode: DEFAULT_MAIN_CODE,

    classSchema: null,
    symbolTable: null,
    parseErrors: [],

    instances: {},

    currentStage: 1,
    viewingStage: 1,
    mainTabUnlocked: false,
    mainTabBlinking: false,
    consoleVisible: false,

    welcomeCompleted: false,

    pendingLevelComplete: false,
    showLevelComplete: false,
    levelCompleteForStage: null,
    isModuleComplete: false,

    editorReadOnly: true,

    executionMode: 'java',
    isExecuting: false,

    instancesCreated: false,
    methodsRan: false,
    encapsulationViolation: false,

    consoleEntries: [],

    // ── Actions ──
    setActiveFile: (f) => set((s) => { s.activeFile = f; }),
    setTeenagerCode: (code) => set((s) => { s.teenagerCode = code; }),
    setMainCode: (code) => set((s) => { s.mainCode = code; }),

    setClassSchema: (schema, table) =>
      set((s) => { s.classSchema = schema; s.symbolTable = table; s.parseErrors = []; }),

    setParseErrors: (errors) => set((s) => { s.parseErrors = errors; }),
    clearSchema: () => set((s) => { s.classSchema = null; s.symbolTable = null; }),

    addInstance: (varName) =>
      set((s) => {
        if (Object.keys(s.instances).length >= 3) return;
        s.instances[varName] = {
          id: varName,
          state: computeInitialState(s.classSchema),
          activeAnimation: null,
          createdAt: Date.now(),
        };
      }),

    updateInstanceState: (varName, newState) =>
      set((s) => {
        if (!s.instances[varName]) return;
        s.instances[varName].state = newState;
      }),

    setAnimation: (varName, anim) =>
      set((s) => {
        if (!s.instances[varName]) return;
        s.instances[varName].activeAnimation = anim;
      }),

    resetInstances: () => set((s) => { s.instances = {}; }),

    // advanceStage: starts 3s pending phase, then LevelComplete overlay appears.
    // viewingStage stays at completed stage so student sees checklist before overlay.
    advanceStage: (to) =>
      set((s) => {
        if (to <= s.currentStage) return;
        s.levelCompleteForStage = s.currentStage;
        s.pendingLevelComplete = true;
        s.showLevelComplete = false;
        s.currentStage = to;
        // viewingStage intentionally NOT changed here — LevelComplete handles it
        if (to === 5) {
          s.mainTabUnlocked = true;
          s.mainTabBlinking = true;
        }
        if (to >= 5) {
          s.consoleVisible = true;
        }
      }),

    setViewingStage: (stage) => set((s) => { s.viewingStage = stage; }),

    stopMainTabBlinking: () => set((s) => { s.mainTabBlinking = false; }),

    setExecutionMode: (mode) => set((s) => { s.executionMode = mode; }),
    setIsExecuting: (v) => set((s) => { s.isExecuting = v; }),
    setRunResult: (r) => set((s) => {
      s.instancesCreated = r.instancesCreated;
      s.methodsRan = r.methodsRan;
      s.encapsulationViolation = r.encapsulationViolation;
    }),

    jumpToMain: () => set((s) => {
      s.teenagerCode = FULL_TEENAGER_CODE;
      s.currentStage = 5;
      s.viewingStage = 5;
      s.mainTabUnlocked = true;
      s.mainTabBlinking = false;
      s.consoleVisible = true;
      s.activeFile = 'Main.java';
      s.instances = {};
      s.consoleEntries = [];
      s.welcomeCompleted = true;
      s.showLevelComplete = false;
      s.editorReadOnly = false; // Main.java is always editable
    }),

    setWelcomeCompleted: () => set((s) => { s.welcomeCompleted = true; }),

    triggerLevelComplete: () =>
      set((s) => {
        s.pendingLevelComplete = false;
        s.showLevelComplete = true;
      }),

    // goNext=true → advance viewingStage to currentStage (triggers stage modal for new stage)
    // goNext=false → stay on levelCompleteForStage (viewingStage unchanged, review mode)
    dismissLevelComplete: (goNext) =>
      set((s) => {
        s.showLevelComplete = false;
        if (goNext) {
          s.viewingStage = s.currentStage;
          // Re-lock editor for new Teenager.java stages (1-4)
          if (s.currentStage <= 4) s.editorReadOnly = true;
        }
      }),

    completeModule: () =>
      set((s) => {
        s.levelCompleteForStage = 7;
        s.isModuleComplete = true;
        s.pendingLevelComplete = true;
        s.showLevelComplete = false;
      }),

    setEditorReadOnly: (v) => set((s) => { s.editorReadOnly = v; }),

    appendConsole: (kind, message, suggestion) =>
      set((s) => {
        s.consoleEntries.push({
          id: String(++entryCounter),
          kind,
          message,
          suggestion,
          timestamp: Date.now(),
        });
      }),

    clearConsole: () => set((s) => { s.consoleEntries = []; }),
  }))
);

function computeInitialState(schema: ClassSchema | null): TeenagerState {
  const state = { ...DEFAULT_STATE };
  if (!schema) return state;
  const s = state as unknown as Record<string, unknown>;

  // Apply field-level initializers
  for (const field of schema.fields) {
    if (field.initializer !== undefined && field.initializer !== null) {
      if (field.name in state) s[field.name] = field.initializer;
    }
  }

  // Apply constructor body (overrides field initializers)
  if (schema.constructor) {
    for (const stmt of schema.constructor.bodyStatements) {
      runBodyStatement(s, stmt);
    }
  }

  return state;
}
