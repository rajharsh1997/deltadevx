import React, { useState, useCallback, useRef } from 'react'
import * as Diff from 'diff'

interface TextDiffProps {
    isDark: boolean
}

type LineType = 'added' | 'removed' | 'unchanged' | 'empty'

interface DiffLine {
    type: LineType
    content: string
    lineNum: number
}

function computeTextDiff(a: string, b: string): { left: DiffLine[]; right: DiffLine[]; hasDiff: boolean } {
    const changes = Diff.diffLines(a, b, { newlineIsToken: false })
    const left: DiffLine[] = []
    const right: DiffLine[] = []
    let leftNum = 1
    let rightNum = 1
    let hasDiff = false

    for (const part of changes) {
        const lines = part.value.split('\n')
        if (lines[lines.length - 1] === '') lines.pop()

        if (part.removed) {
            hasDiff = true
            for (const ln of lines) {
                left.push({ type: 'removed', content: ln, lineNum: leftNum++ })
                right.push({ type: 'empty', content: '', lineNum: 0 })
            }
        } else if (part.added) {
            hasDiff = true
            for (const ln of lines) {
                left.push({ type: 'empty', content: '', lineNum: 0 })
                right.push({ type: 'added', content: ln, lineNum: rightNum++ })
            }
        } else {
            for (const ln of lines) {
                left.push({ type: 'unchanged', content: ln, lineNum: leftNum++ })
                right.push({ type: 'unchanged', content: ln, lineNum: rightNum++ })
            }
        }
    }

    return { left, right, hasDiff }
}

/* ─── Diff Panel ──────────────────────────────────────────────────────────── */
const DiffPanel: React.FC<{ lines: DiffLine[]; isDark: boolean; label: string }> = ({ lines, isDark, label }) => (
    <div className="flex flex-col flex-1 min-w-0 gap-1">
        <div className={`text-[10.75px] font-mono font-semibold tracking-wider px-1 ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}>
            {label}
        </div>
        <div className={`flex-1 font-mono text-[12.5px] leading-[1.6] rounded-md border overflow-auto ${isDark ? 'bg-[#12121f] border-[#2a2a45]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
            {lines.map((line, idx) => (
                <div
                    key={idx}
                    className={`flex items-stretch min-h-[24px] ${
                        line.type === 'added'
                            ? isDark ? 'bg-[#1a3320]' : 'bg-[#d1fae5]'
                            : line.type === 'removed'
                                ? isDark ? 'bg-[#331a1a]' : 'bg-[#fee2e2]'
                                : line.type === 'empty'
                                    ? isDark ? 'bg-[#0e0e1a]' : 'bg-[#f3f4f6]'
                                    : ''
                    }`}
                >
                    {/* Gutter */}
                    <div className={`shrink-0 w-10 flex items-center justify-end pr-3 text-[11px] select-none border-r
                        ${isDark ? 'text-[#6b7280] border-[#2a2a45]' : 'text-[#d1d5db] border-[#e5e7eb]'}
                        ${line.type === 'added' ? isDark ? 'bg-[#153020] border-[#1d4731]' : 'bg-[#bbf7d0] border-[#6ee7b7]'
                            : line.type === 'removed' ? isDark ? 'bg-[#2a1010] border-[#5b1c1c]' : 'bg-[#fecaca] border-[#fca5a5]'
                            : line.type === 'empty' ? isDark ? 'bg-[#0a0a14]' : 'bg-[#eeeff2]'
                            : ''}`}
                    >
                        {line.type !== 'empty' && line.lineNum > 0 ? line.lineNum : ''}
                    </div>
                    {/* Prefix */}
                    <div className={`shrink-0 w-5 flex items-center justify-center text-[11px] font-bold select-none
                        ${line.type === 'added' ? isDark ? 'text-[#4ade80]' : 'text-[#16a34a]'
                            : line.type === 'removed' ? isDark ? 'text-[#f87171]' : 'text-[#dc2626]'
                            : 'text-transparent'}`}
                    >
                        {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ''}
                    </div>
                    {/* Content */}
                    <div className={`flex-1 px-2 whitespace-pre overflow-hidden text-ellipsis
                        ${line.type === 'added' ? isDark ? 'text-[#86efac]' : 'text-[#15803d]'
                            : line.type === 'removed' ? isDark ? 'text-[#fca5a5]' : 'text-[#b91c1c]'
                            : line.type === 'empty' ? 'text-transparent select-none'
                            : isDark ? 'text-[#c5c5d8]' : 'text-[#374151]'}`}
                    >
                        {line.type === 'empty' ? ' ' : line.content}
                    </div>
                </div>
            ))}
        </div>
    </div>
)

/* ─── Text Editor ─────────────────────────────────────────────────────────── */
const TextEditor: React.FC<{ label: string; value: string; onChange: (v: string) => void; isDark: boolean; placeholder?: string }> = ({
    label, value, onChange, isDark, placeholder
}) => (
    <div className="flex flex-col flex-1 min-w-0 gap-2">
        <label className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}>
            {label}
        </label>
        <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            className={`flex-1 w-full min-h-[220px] resize-none p-3 rounded-md border font-mono text-[13px] leading-[1.6] transition-colors duration-150
                focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
                ${isDark
                    ? 'bg-[#12121f] border-[#2a2a45] text-[#c5c5d8] placeholder-[#6b7280]'
                    : 'bg-[#f9fafb] border-[#e5e7eb] text-[#374151] placeholder-[#9ca3af]'
                }`}
        />
    </div>
)

/* ─── Examples ────────────────────────────────────────────────────────────── */
const EXAMPLE_A = `function greet(name) {
  const message = "Hello, " + name;
  console.log(message);
  return message;
}

const result = greet("World");`

const EXAMPLE_B = `function greet(name, greeting = "Hello") {
  const message = \`\${greeting}, \${name}!\`;
  console.log(message);
  return { message, name };
}

const result = greet("World", "Hey");
console.log(result);`

/* ─── Main View ───────────────────────────────────────────────────────────── */
const TextDiff: React.FC<TextDiffProps> = ({ isDark }) => {
    const [inputA, setInputA] = useState('')
    const [inputB, setInputB] = useState('')
    const [diffResult, setDiffResult] = useState<{ left: DiffLine[]; right: DiffLine[]; hasDiff: boolean } | null>(null)
    const [noDiff, setNoDiff] = useState(false)

    const handleCompare = useCallback(() => {
        const result = computeTextDiff(inputA, inputB)
        setDiffResult(result)
        setNoDiff(!result.hasDiff)
    }, [inputA, inputB])

    const handleExample = useCallback(() => {
        setInputA(EXAMPLE_A)
        setInputB(EXAMPLE_B)
        setDiffResult(null)
        setNoDiff(false)
    }, [])

    const handleClear = useCallback(() => {
        setInputA('')
        setInputB('')
        setDiffResult(null)
        setNoDiff(false)
    }, [])

    const copyRef = useRef<HTMLButtonElement>(null)
    const handleCopyDiff = useCallback(() => {
        if (!diffResult) return
        const lines = diffResult.left.map((l, i) => {
            const r = diffResult.right[i]
            if (l.type === 'removed') return `- ${l.content}`
            if (r.type === 'added') return `+ ${r.content}`
            return `  ${l.content}`
        })
        navigator.clipboard.writeText(lines.join('\n'))
        if (copyRef.current) {
            copyRef.current.textContent = 'Copied!'
            setTimeout(() => { if (copyRef.current) copyRef.current.textContent = 'Copy Diff' }, 1500)
        }
    }, [diffResult])

    const btnBase = `px-4 py-2 rounded-lg text-sm font-medium font-mono transition-all duration-150 cursor-pointer`
    const btnSecondary = isDark
        ? 'bg-[#1e1e35] hover:bg-[#252545] text-[#9595b4] border border-[#2a2a45]'
        : 'bg-white hover:bg-[#f3f4f6] text-[#374151] border border-[#e5e7eb]'

    return (
        <div className="flex flex-col min-h-full gap-4 p-6 min-w-[800px] text-[#d1d5db]">
            {/* Input panels */}
            <div className="flex gap-4">
                <TextEditor label="Text A" value={inputA} onChange={setInputA} isDark={isDark} placeholder="Paste original text here…" />
                <TextEditor label="Text B" value={inputB} onChange={setInputB} isDark={isDark} placeholder="Paste modified text here…" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
                <button id="text-diff-compare-btn" onClick={handleCompare}
                    className="px-5 py-2 rounded-lg text-sm font-semibold font-mono bg-[#4f6ef7] hover:bg-[#3d5ce5] active:bg-[#3350d4] text-white transition-all duration-150 shadow-lg shadow-[#4f6ef730] cursor-pointer">
                    Compare
                </button>
                <button id="text-diff-example-btn" onClick={handleExample} className={`${btnBase} ${btnSecondary}`}>Load Example</button>
                <button id="text-diff-clear-btn" onClick={handleClear} className={`${btnBase} ${isDark ? 'bg-[#1e1e35] hover:bg-[#252545] text-[#6b7280] border border-[#2a2a45]' : 'bg-white hover:bg-[#f3f4f6] text-[#9ca3af] border border-[#e5e7eb]'}`}>Clear</button>
                {diffResult && (
                    <button ref={copyRef} id="text-diff-copy-btn" onClick={handleCopyDiff} className={`${btnBase} ${btnSecondary} ml-auto`}>Copy Diff</button>
                )}
            </div>

            {/* Result */}
            {diffResult && (
                <div className="flex flex-col flex-1 gap-2">
                    <div className="flex items-center gap-3 shrink-0">
                        <label className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}>
                            Comparison Result
                        </label>
                        {noDiff ? (
                            <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border ${isDark ? 'bg-emerald-900/30 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full inline-block ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                                No differences found
                            </span>
                        ) : (
                            <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border ${isDark ? 'bg-amber-900/30 border-amber-800/40 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full inline-block ${isDark ? 'bg-amber-400' : 'bg-amber-500'}`} />
                                Differences detected
                            </span>
                        )}
                    </div>
                    <div className="flex gap-4 flex-1">
                        <DiffPanel lines={diffResult.left} isDark={isDark} label="A — Base" />
                        <DiffPanel lines={diffResult.right} isDark={isDark} label="B — Modified" />
                    </div>
                </div>
            )}
        </div>
    )
}

export default TextDiff
