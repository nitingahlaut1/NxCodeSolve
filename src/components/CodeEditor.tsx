'use client';

import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { SupportedLanguage } from '@/types';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: SupportedLanguage;
  theme: 'dark' | 'light';
  onRunCode?: () => void;
  onSubmitCode?: () => void;
}

const MONACO_LANG_MAP: Record<SupportedLanguage, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  cpp: 'cpp',
  java: 'java'
};

const DSA_EXTRA_TYPES = `
/**
 * Singly-linked list node definition for DSA problems.
 */
declare class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null);
}

/**
 * Generic Node definition for Doubly Linked Lists / Multilevel Lists.
 */
declare class Node {
  val: number;
  data: number;
  next: Node | null;
  prev?: Node | null;
  bottom?: Node | null;
  random?: Node | null;
  child?: Node | null;
  constructor(
    val?: number,
    next?: Node | null,
    prev?: Node | null,
    bottom?: Node | null,
    random?: Node | null,
    child?: Node | null
  );
}

/**
 * Binary tree node definition.
 */
declare class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null);
}
`;

export default function CodeEditor({
  code,
  onChange,
  language,
  theme,
  onRunCode,
  onSubmitCode
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom dark theme matching NxCodeSolve aesthetics
    monaco.editor.defineTheme('nxcodesolve-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '38bdf8', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'fb923c' },
        { token: 'type', foreground: 'c084fc' },
        { token: 'function', foreground: 'facc15' },
        { token: 'variable', foreground: 'f1f5f9' },
        { token: 'operator', foreground: '38bdf8' }
      ],
      colors: {
        'editor.background': '#090d16',
        'editor.foreground': '#f1f5f9',
        'editor.lineHighlightBackground': '#131c2e',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#38bdf8',
        'editorIndentGuide.background1': '#1e293b',
        'editorIndentGuide.activeBackground1': '#38bdf8',
        'editor.selectionBackground': '#1e3a8a80',
        'editor.inactiveSelectionBackground': '#1e3a8a40',
        'editorBracketMatch.background': '#1e3a8a60',
        'editorBracketMatch.border': '#38bdf8',
        'editorSuggestWidget.background': '#0f172a',
        'editorSuggestWidget.border': '#1e293b',
        'editorSuggestWidget.foreground': '#f1f5f9',
        'editorSuggestWidget.selectedBackground': '#1e293b',
        'editorSuggestWidget.highlightForeground': '#38bdf8'
      }
    });

    // Define custom light theme
    monaco.editor.defineTheme('nxcodesolve-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '0284c7', fontStyle: 'bold' },
        { token: 'string', foreground: '059669' },
        { token: 'number', foreground: 'ea580c' },
        { token: 'type', foreground: '7c3aed' },
        { token: 'function', foreground: 'd97706' },
        { token: 'variable', foreground: '0f172a' }
      ],
      colors: {
        'editor.background': '#f8fafc',
        'editor.foreground': '#0f172a',
        'editor.lineHighlightBackground': '#f1f5f9',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#0284c7',
        'editorIndentGuide.background1': '#e2e8f0',
        'editorIndentGuide.activeBackground1': '#0284c7',
        'editor.selectionBackground': '#bae6fd80',
        'editorSuggestWidget.background': '#ffffff',
        'editorSuggestWidget.border': '#cbd5e1',
        'editorSuggestWidget.foreground': '#0f172a',
        'editorSuggestWidget.selectedBackground': '#f1f5f9',
        'editorSuggestWidget.highlightForeground': '#0284c7'
      }
    });

    // Configure JavaScript and TypeScript compiler options & definitions
    try {
      if (monaco.languages?.typescript) {
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false
        });
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false
        });

        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTextFiles: true,
          allowJs: true
        });
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTextFiles: true,
          allowJs: true
        });

        // Add DSA class declarations (ListNode, Node, TreeNode)
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
          DSA_EXTRA_TYPES,
          'ts:dsa-globals.d.ts'
        );
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          DSA_EXTRA_TYPES,
          'ts:dsa-globals.d.ts'
        );
      }
    } catch (e) {
      console.warn('Could not inject extra TypeScript declarations', e);
    }

    // Set initial theme
    monaco.editor.setTheme(theme === 'dark' ? 'nxcodesolve-dark' : 'nxcodesolve-light');

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRunCode) onRunCode();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      if (onSubmitCode) onSubmitCode();
    });
  };

  // Sync theme changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === 'dark' ? 'nxcodesolve-dark' : 'nxcodesolve-light');
    }
  }, [theme]);

  const monacoLang = MONACO_LANG_MAP[language] || 'javascript';

  return (
    <div className="monaco-editor-shell w-full h-full relative" style={{ height: '100%', width: '100%', minHeight: '260px' }}>
      <Editor
        height="100%"
        width="100%"
        language={monacoLang}
        value={code}
        theme={theme === 'dark' ? 'nxcodesolve-dark' : 'nxcodesolve-light'}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex h-full w-full items-center justify-center bg-[#090d16] text-sky-400 font-mono text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
              Initializing NxCodeSolve IDE...
            </div>
          </div>
        }
        options={{
          fontSize: 14,
          fontFamily: 'Fira Code, JetBrains Mono, Menlo, Monaco, Consolas, "Courier New", monospace',
          fontLigatures: true,
          lineNumbers: 'on',
          lineNumbersMinChars: 3,
          lineDecorationsWidth: 6,
          roundedSelection: true,
          scrollBeyondLastLine: false,
          readOnly: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          // Auto-closing brackets and quotes
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoClosingDelete: 'always',
          autoClosingOvertype: 'always',
          autoSurround: 'languageDefined',
          bracketPairColorization: {
            enabled: true
          },
          guides: {
            bracketPairs: true,
            indentation: true
          },
          // Autocompletion & Recommendations
          suggestOnTriggerCharacters: true,
          quickSuggestions: {
            other: 'on',
            comments: 'on',
            strings: 'on'
          },
          wordBasedSuggestions: 'allDocuments',
          parameterHints: {
            enabled: true
          },
          tabCompletion: 'on',
          acceptSuggestionOnEnter: 'on',
          suggest: {
            showWords: true,
            showFunctions: true,
            showKeywords: true,
            showSnippets: true,
            showVariables: true,
            showClasses: true,
            showInterfaces: true,
            showMethods: true,
            showProperties: true,
            showValues: true,
            preview: true
          },
          // Smooth aesthetics
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          minimap: {
            enabled: false
          },
          padding: {
            top: 12,
            bottom: 12
          },
          renderLineHighlight: 'all',
          renderWhitespace: 'selection',
          contextmenu: true,
          formatOnType: true,
          formatOnPaste: true
        }}
      />
    </div>
  );
}
