import React, { useRef, useEffect, useState, useCallback } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { EditorState } from '@codemirror/state'
import { computeDiff, formatJSON, type DiffLine } from '../utils/jsonDiff'

/* ─────────────────────────── Light Theme ─────────────────────────────────── */

// Syntax highlighting for JSON in light mode — overrides the default highlight
// style (which can show string/number tokens in odd colours).
const lightSyntax = HighlightStyle.define([
    { tag: tags.keyword, color: '#7c3aed' },            // true / false / null
    { tag: tags.string, color: '#059669' },              // "string values"
    { tag: tags.number, color: '#2563eb' },              // numeric values
    { tag: tags.bool, color: '#7c3aed' },                // booleans
    { tag: tags.null, color: '#7c3aed' },                // null
    { tag: tags.punctuation, color: '#6b7280' },         // { } [ ] , :
    { tag: tags.propertyName, color: '#d97706' },        // JSON keys
    { tag: tags.separator, color: '#9ca3af' },           // , :
    { tag: tags.bracket, color: '#6b7280' },             // [ ]
    { tag: tags.brace, color: '#6b7280' },               // { }
])

const lightTheme = EditorView.theme(
    {
        '&': {
            backgroundColor: '#f9fafb',
            color: '#1a1a2e',
        },
        '.cm-gutters': {
            backgroundColor: '#f3f4f6 !important',
            borderRight: '1px solid #e5e7eb !important',
            color: '#9ca3af !important',
        },
        '.cm-lineNumbers .cm-gutterElement': {
            color: '#d1d5db !important',
        },
        '.cm-activeLine': {
            backgroundColor: '#f3f4f620 !important',
        },
        '.cm-selectionBackground': {
            backgroundColor: '#4f6ef730 !important',
        },
        '.cm-cursor': {
            borderLeftColor: '#1a1a2e !important',
        },
    },
    { dark: false }
)

/* ─────────────────────────── Editor Component ────────────────────────────── */
interface CodeEditorProps {
    value: string
    onChange: (value: string) => void
    isDark: boolean
    placeholder?: string
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, isDark, placeholder }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const viewRef = useRef<EditorView | null>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const startState = EditorState.create({
            doc: value,
            extensions: [
                basicSetup,
                json(),
                EditorView.lineWrapping,
                isDark ? oneDark : lightTheme,
                isDark ? [] : syntaxHighlighting(lightSyntax),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        onChange(update.state.doc.toString())
                    }
                }),
                EditorView.theme({
                    '&': { flex: '1 1 0%', minHeight: '300px' },
                    '.cm-scroller': { overflowX: 'hidden', overflowY: 'hidden', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '13px' },
                }),
                placeholder
                    ? EditorView.contentAttributes.of({ 'data-placeholder': placeholder } as Record<string, string>)
                    : [],
            ],
        })

        const view = new EditorView({
            state: startState,
            parent: containerRef.current,
        })
        viewRef.current = view

        return () => {
            view.destroy()
            viewRef.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDark])

    // Sync external value changes (e.g. from format/clear)
    useEffect(() => {
        const view = viewRef.current
        if (!view) return
        const current = view.state.doc.toString()
        if (current !== value) {
            view.dispatch({
                changes: { from: 0, to: current.length, insert: value },
            })
        }
    }, [value])

    return (
        <div
            ref={containerRef}
            className={`
        flex flex-col flex-1 w-full overflow-hidden
        rounded-md border
        ${isDark ? 'border-[#2a2a45]' : 'border-[#e5e7eb]'}
      `}
        />
    )
}

/* ─────────────────────────── Diff Panel ─────────────────────────────────── */
interface DiffPanelProps {
    lines: DiffLine[]
    isDark: boolean
    searchTerm?: string
}

const DiffPanel: React.FC<DiffPanelProps> = ({ lines, isDark, searchTerm = '' }) => {
    // Find which lines contain the search term (for highlighting)
    const matchingLines = new Set<number>()
    if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase()
        lines.forEach((line, idx) => {
            if (line.content.toLowerCase().includes(searchLower)) {
                matchingLines.add(idx)
            }
        })
    }
    return (
        <div
            className={`
        flex-1 font-mono text-[12.5px] leading-[1.6]
        rounded-md border
        ${isDark ? 'bg-[#12121f] border-[#2a2a45]' : 'bg-[#f9fafb] border-[#e5e7eb]'}
      `}
        >
            <div className="min-w-0">
                {lines.map((line, idx) => (
                    <div
                        key={idx}
                        className={`flex items-stretch min-h-[24px] ${line.type === 'added'
                            ? isDark ? 'bg-[#1a3320]' : 'bg-[#d1fae5]'
                            : line.type === 'removed'
                                ? isDark ? 'bg-[#331a1a]' : 'bg-[#fee2e2]'
                                : line.type === 'empty'
                                    ? isDark ? 'bg-[#0e0e1a]' : 'bg-[#f3f4f6]'
                                    : matchingLines.has(idx) ? (isDark ? 'bg-[#2d3a4f]' : 'bg-amber-200') : ''
                            }`}
                    >
                        {/* Line number gutter */}
                        <div
                            className={`
                shrink-0 w-10 flex items-center justify-end pr-3 text-[11px] select-none
                border-r
                ${isDark ? 'text-[#3d3d6b] border-[#2a2a45]' : 'text-[#d1d5db] border-[#e5e7eb]'}
                ${line.type === 'added'
                                    ? isDark ? 'bg-[#153020] border-[#1d4731]' : 'bg-[#bbf7d0] border-[#6ee7b7]'
                                    : line.type === 'removed'
                                        ? isDark ? 'bg-[#2a1010] border-[#5b1c1c]' : 'bg-[#fecaca] border-[#fca5a5]'
                                        : line.type === 'empty'
                                            ? isDark ? 'bg-[#0a0a14]' : 'bg-[#eeeff2]'
                                            : ''
                                }
              `}
                        >
                            {line.type !== 'empty' && line.lineNum > 0 ? line.lineNum : ''}
                        </div>

                        {/* Prefix (+/-) */}
                        <div
                            className={`
                shrink-0 w-5 flex items-center justify-center text-[11px] font-bold select-none
                ${line.type === 'added'
                                    ? isDark ? 'text-[#4ade80]' : 'text-[#16a34a]'
                                    : line.type === 'removed'
                                        ? isDark ? 'text-[#f87171]' : 'text-[#dc2626]'
                                        : isDark ? 'text-transparent' : 'text-transparent'
                                }
              `}
                        >
                            {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ''}
                        </div>

                        {/* Content */}
                        <div
                            className={`
                flex-1 px-2 py-0 whitespace-pre overflow-hidden text-ellipsis
                ${line.type === 'added'
                                    ? isDark ? 'text-[#86efac]' : 'text-[#15803d]'
                                    : line.type === 'removed'
                                        ? isDark ? 'text-[#fca5a5]' : 'text-[#b91c1c]'
                                        : line.type === 'empty'
                                            ? 'text-transparent select-none'
                                            : matchingLines.has(idx) ? (isDark ? 'text-[#fef08a] font-semibold' : 'text-[#451a03] font-semibold') : (isDark ? 'text-[#c5c5d8]' : 'text-[#374151]')
                                }
              `}
                        >
                            {line.type === 'empty' ? ' ' : line.content}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ─────────────────────────── Main View ──────────────────────────────────── */
interface JsonDiffProps {
    isDark: boolean
}

const PLACEHOLDER_A = `{
  "id": 101,
  "name": "Project Alpha",
  "version": "1.0.3",
  "active": true
}`

const PLACEHOLDER_B = `{
  "id": 101,
  "name": "Project Beta",
  "version": "1.0.4",
  "active": false
}`

const EXAMPLE_JSON_A = `{
  "user": {
    "id": "usr_8f3k2p",
    "name": "John Doe",
    "email": "john_doe@example.com",
    "role": "admin",
    "active": true,
    "plan": "pro",
    "createdAt": "2024-01-15T08:30:00Z",
    "preferences": {
      "theme": "dark",
      "language": "en",
      "notifications": true
    }
  }
}`

const EXAMPLE_JSON_B = `{
  "user": {
    "id": "usr_8f3k2p",
    "name": "John Doe",
    "email": "john@company.com",
    "role": "owner",
    "active": true,
    "plan": "enterprise",
    "createdAt": "2024-01-15T08:30:00Z",
    "preferences": {
      "theme": "light",
      "language": "en",
      "notifications": false
    }
  }
}`

const JsonDiff: React.FC<JsonDiffProps> = ({ isDark }) => {
    const [inputA, setInputA] = useState('')
    const [inputB, setInputB] = useState('')
    const [errorA, setErrorA] = useState('')
    const [errorB, setErrorB] = useState('')
    const [diffResult, setDiffResult] = useState<{
        leftLines: DiffLine[]
        rightLines: DiffLine[]
        hasDiff: boolean
    } | null>(null)
    const [noDiffMsg, setNoDiffMsg] = useState(false)
    const [diffSearch, setDiffSearch] = useState('')
    const diffSearchRef = useRef<HTMLInputElement>(null)

    const handleFormat = useCallback(() => {
        const resultA = formatJSON(inputA)
        const resultB = formatJSON(inputB)

        if (resultA.error) setErrorA(`Format error: ${resultA.error}`)
        else { setErrorA(''); setInputA(resultA.formatted) }

        if (resultB.error) setErrorB(`Format error: ${resultB.error}`)
        else { setErrorB(''); setInputB(resultB.formatted) }
    }, [inputA, inputB])

    const handleCompare = useCallback(() => {
        let valid = true

        try {
            JSON.parse(inputA || '{}')
            setErrorA('')
        } catch (e) {
            setErrorA((e as Error).message)
            valid = false
        }

        try {
            JSON.parse(inputB || '{}')
            setErrorB('')
        } catch (e) {
            setErrorB((e as Error).message)
            valid = false
        }

        if (!valid) return

        try {
            const result = computeDiff(inputA || '{}', inputB || '{}')
            setDiffResult(result)
            setNoDiffMsg(!result.hasDiff)
            setDiffSearch('')
        } catch (e) {
            setErrorA((e as Error).message)
        }
    }, [inputA, inputB])

    const handleLoadExample = useCallback(() => {
        setInputA(EXAMPLE_JSON_A)
        setInputB(EXAMPLE_JSON_B)
        setErrorA('')
        setErrorB('')
        setDiffResult(null)
        setNoDiffMsg(false)
        setDiffSearch('')
    }, [])

    const handleClear = useCallback(() => {
        setInputA('')
        setInputB('')
        setErrorA('')
        setErrorB('')
        setDiffResult(null)
        setNoDiffMsg(false)
        setDiffSearch('')
    }, [])

    // Ctrl+F / Cmd+F focuses the diff search input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                if (diffSearchRef.current) {
                    e.preventDefault()
                    diffSearchRef.current.focus()
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <div className="flex flex-col min-h-full gap-4 p-6 min-w-[800px] text-[#d1d5db]">
            {/* Input panels */}
            <div className="flex gap-4">
                {/* Left editor */}
                <div className="flex flex-col flex-1 min-w-0 gap-2">
                    <label
                        className={`text-[11px] font-mono font-semibold tracking-widest uppercase
              ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}
                    >
                        JSON Input A
                    </label>
                    <div className="flex-1 flex flex-col">
                        <CodeEditor
                            value={inputA}
                            onChange={setInputA}
                            isDark={isDark}
                            placeholder={PLACEHOLDER_A}
                        />
                    </div>
                    {errorA && (
                        <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-red-900/30 border border-red-800/40 text-red-400 text-xs font-mono">
                            <span className="shrink-0 mt-0.5">⚠</span>
                            <span>{errorA}</span>
                        </div>
                    )}
                </div>

                {/* Right editor */}
                <div className="flex flex-col flex-1 min-w-0 gap-2">
                    <label
                        className={`text-[11px] font-mono font-semibold tracking-widest uppercase
              ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}
                    >
                        JSON Input B
                    </label>
                    <div className="flex-1 flex flex-col">
                        <CodeEditor
                            value={inputB}
                            onChange={setInputB}
                            isDark={isDark}
                            placeholder={PLACEHOLDER_B}
                        />
                    </div>
                    {errorB && (
                        <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-red-900/30 border border-red-800/40 text-red-400 text-xs font-mono">
                            <span className="shrink-0 mt-0.5">⚠</span>
                            <span>{errorB}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 shrink-0">
                <button
                    id="compare-btn"
                    onClick={handleCompare}
                    className="
            px-5 py-2 rounded-lg text-sm font-semibold font-mono
            bg-[#4f6ef7] hover:bg-[#3d5ce5] active:bg-[#3350d4]
            text-white transition-all duration-150
            shadow-lg shadow-[#4f6ef730]
            cursor-pointer
          "
                >
                    Compare JSONs
                </button>
                <button
                    id="format-btn"
                    onClick={handleFormat}
                    className={`
            px-4 py-2 rounded-lg text-sm font-medium font-mono
            transition-all duration-150 cursor-pointer
            ${isDark
                            ? 'bg-[#1e1e35] hover:bg-[#252545] text-[#9595b4] border border-[#2a2a45]'
                            : 'bg-white hover:bg-[#f3f4f6] text-[#374151] border border-[#e5e7eb]'
                        }
          `}
                >
                    Format JSON
                </button>
                <button
                    id="example-btn"
                    onClick={handleLoadExample}
                    className={`
            px-4 py-2 rounded-lg text-sm font-medium font-mono
            transition-all duration-150 cursor-pointer
            ${isDark
                            ? 'bg-[#1e1e35] hover:bg-[#252545] text-[#9595b4] border border-[#2a2a45]'
                            : 'bg-white hover:bg-[#f3f4f6] text-[#374151] border border-[#e5e7eb]'
                        }
          `}
                >
                    Load Example
                </button>
                <button
                    id="clear-btn"
                    onClick={handleClear}
                    className={`
            px-4 py-2 rounded-lg text-sm font-medium font-mono
            transition-all duration-150 cursor-pointer
            ${isDark
                            ? 'bg-[#1e1e35] hover:bg-[#252545] text-[#6b7280] border border-[#2a2a45]'
                            : 'bg-white hover:bg-[#f3f4f6] text-[#9ca3af] border border-[#e5e7eb]'
                        }
          `}
                >
                    Clear
                </button>
            </div>

            {/* Diff result */}
            {diffResult && (
                <div className="flex flex-col flex-1 gap-2 animate-fade-in">
                    <div className="flex items-center gap-3 shrink-0">
                        <label
                            className={`text-[11px] font-mono font-semibold tracking-widest uppercase
                ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}
                        >
                            Comparison Result
                        </label>
                        {noDiffMsg && (
                            <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border
                ${isDark
                                    ? 'bg-emerald-900/30 border-emerald-800/40 text-emerald-400'
                                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full inline-block ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                                No differences found
                            </span>
                        )}
                        {!noDiffMsg && diffResult.hasDiff && (
                            <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border
                ${isDark
                                    ? 'bg-amber-900/30 border-amber-800/40 text-amber-400'
                                    : 'bg-amber-50 border-amber-200 text-amber-700'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full inline-block ${isDark ? 'bg-amber-400' : 'bg-amber-500'}`} />
                                Differences detected
                            </span>
                        )}
                    </div>

                    {/* Search input */}
                    <input
                        ref={diffSearchRef}
                        type="text"
                        placeholder="Search to highlight matches..."
                        value={diffSearch}
                        onChange={(e) => setDiffSearch(e.target.value)}
                        className={`
                    w-full px-3 py-2 rounded-lg border text-[12px] font-mono
                    transition-colors duration-150 shrink-0
                    ${isDark ? 'placeholder-[#6b7280]' : 'placeholder-[#9ca3af]'}
                    focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
                    ${isDark
                                ? 'bg-[#12121f] border-[#2a2a45] text-[#c5c5d8]'
                                : 'bg-white border-[#e5e7eb] text-[#374151]'
                            }
                  `}
                    />

                    <div className="flex gap-4">
                        {/* Left diff — A */}
                        <div className="flex flex-col flex-1 min-w-0 gap-1">
                            <div className={`text-[10.75px] font-mono font-semibold tracking-wider px-1
                ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}>
                                A — Base
                            </div>
                            <div className="flex-1 flex flex-col">
                                <DiffPanel lines={diffResult.leftLines} isDark={isDark} searchTerm={diffSearch} />
                            </div>
                        </div>

                        {/* Right diff — B */}
                        <div className="flex flex-col flex-1 min-w-0 gap-1">
                            <div className={`text-[10.75px] font-mono font-semibold tracking-wider px-1
                ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}>
                                B — Modified
                            </div>
                            <div className="flex-1 flex flex-col">
                                <DiffPanel lines={diffResult.rightLines} isDark={isDark} searchTerm={diffSearch} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default JsonDiff
