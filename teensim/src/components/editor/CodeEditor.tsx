import Editor from '@monaco-editor/react';
import { useAppStore } from '../../store/useAppStore';
import type * as Monaco from 'monaco-editor';
import './CodeEditor.css';

const PSEUDO_JAVA_TOKENS: Monaco.languages.IMonarchLanguage = {
  keywords: ['public', 'private', 'class', 'void', 'new', 'return', 'if', 'else', 'this'],
  typeKeywords: ['int', 'double', 'boolean', 'String'],
  operators: ['=', '+=', '-=', '==', '>', '<', '>=', '<='],
  tokenizer: {
    root: [
      [/[a-zA-Z_$][\w$]*/, {
        cases: {
          '@keywords': 'keyword',
          '@typeKeywords': 'type',
          '@default': 'identifier',
        },
      }],
      [/\/\/.*$/, 'comment'],
      [/"[^"]*"/, 'string'],
      [/\d+\.\d+/, 'number.float'],
      [/\d+/, 'number'],
      [/[;,.{}()\[\]]/, 'delimiter'],
    ],
  },
};

export function CodeEditor() {
  const activeFile = useAppStore((s) => s.activeFile);
  const teenagerCode = useAppStore((s) => s.teenagerCode);
  const mainCode = useAppStore((s) => s.mainCode);
  const setTeenagerCode = useAppStore((s) => s.setTeenagerCode);
  const setMainCode = useAppStore((s) => s.setMainCode);
  const editorReadOnly = useAppStore((s) => s.editorReadOnly);
  const viewingStage = useAppStore((s) => s.viewingStage);
  const currentStage = useAppStore((s) => s.currentStage);
  const setEditorReadOnly = useAppStore((s) => s.setEditorReadOnly);

  const value = activeFile === 'Teenager.java' ? teenagerCode : mainCode;
  const onChange = activeFile === 'Teenager.java' ? setTeenagerCode : setMainCode;

  // Editor is read-only only on current Teenager.java stages (not reviewing, not Main.java)
  const isReadOnly =
    editorReadOnly &&
    activeFile === 'Teenager.java' &&
    viewingStage === currentStage;

  function handleEditorWillMount(monaco: typeof Monaco) {
    if (!monaco.languages.getLanguages().find((l) => l.id === 'pseudo-java')) {
      monaco.languages.register({ id: 'pseudo-java' });
      monaco.languages.setMonarchTokensProvider('pseudo-java', PSEUDO_JAVA_TOKENS);
      monaco.languages.setLanguageConfiguration('pseudo-java', {
        brackets: [['{', '}'], ['(', ')']],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
        ],
        comments: { lineComment: '//' },
      });
    }
  }

  return (
    <div className="code-editor-wrapper">
      {isReadOnly && (
        <div className="editor-readonly-bar" dir="rtl">
          <span className="readonly-icon">🔒</span>
          <span>השתמש בלוח הבחירה לצד ימין להוספת תכונות</span>
          <button
            className="readonly-unlock-btn"
            onClick={() => setEditorReadOnly(false)}
            title="פתח את העורך לעריכה חופשית"
          >
            ✏️ ערוך ידנית
          </button>
        </div>
      )}
      <Editor
        key={activeFile}
        height="100%"
        language="pseudo-java"
        value={value}
        onChange={(v) => onChange(v ?? '')}
        beforeMount={handleEditorWillMount}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          tabSize: 4,
          wordWrap: 'on',
          padding: { top: 12 },
          readOnly: isReadOnly,
          // Subtle visual cue when locked
          renderValidationDecorations: isReadOnly ? 'off' : 'on',
        }}
      />
    </div>
  );
}
