import React, { useState, useCallback, useEffect, useRef } from 'react'
import { sectionLabel } from '../utils/styles'
import { generateRegex, GENERATOR_EXAMPLES } from '../utils/regexGen'

interface RegexTesterProps { isDark: boolean }
interface MatchInfo { index: number; fullMatch: string; groups: { key: string; value: string }[] }

/* ─── Highlighted Text ────────────────────────────────────────────────────── */
const HighlightedText: React.FC<{ text: string; pattern: string; flags: string; isDark: boolean }> = ({ text, pattern, flags, isDark }) => {
    if (!pattern || !text) return (
        <pre className={`font-mono text-[13px] leading-[1.6] whitespace-pre-wrap break-words ${isDark ? 'text-[#c5c5d8]' : 'text-[#111827]'}`}>
            <span className="text-[#6b7280]">Your test string will appear here with matches highlighted…</span>
        </pre>
    )
    let regex: RegExp
    try { regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g') }
    catch { return <pre className="font-mono text-[13px] text-red-400 whitespace-pre-wrap">{text}</pre> }

    const parts: React.ReactNode[] = []
    let lastIndex = 0; let match: RegExpExecArray | null; let n = 0
    while ((match = regex.exec(text)) !== null && n++ < 500) {
        if (match.index > lastIndex) parts.push(<span key={`t${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>)
        parts.push(
            <mark key={`m${match.index}-${n}`}
                className={`rounded px-[1px] font-semibold ${isDark ? 'bg-[#4f6ef740] text-[#a5b4fc]' : 'bg-[#4f6ef720] text-[#4338ca]'}`}
                style={{ outline: isDark ? '1px solid #4f6ef760' : '1px solid #4f6ef740' }}>
                {match[0]}
            </mark>
        )
        lastIndex = match.index + match[0].length
        if (!flags.includes('g')) break
        if (match[0].length === 0) regex.lastIndex++
    }
    if (lastIndex < text.length) parts.push(<span key="tail">{text.slice(lastIndex)}</span>)
    return <pre className={`font-mono text-[13px] leading-[1.6] whitespace-pre-wrap break-words ${isDark ? 'text-[#c5c5d8]' : 'text-[#111827]'}`}>{parts}</pre>
}

/* ─── Flag Toggle ─────────────────────────────────────────────────────────── */
const FlagToggle: React.FC<{ flag: string; label: string; active: boolean; onToggle: () => void; isDark: boolean }> = ({ flag, label, active, onToggle, isDark }) => (
    <button id={`regex-flag-${flag}`} onClick={onToggle}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-mono transition-all duration-150 cursor-pointer border
            ${active ? 'bg-[#4f6ef7] border-[#4f6ef7] text-white shadow shadow-[#4f6ef730]'
                : isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#9595b4] hover:border-[#4f6ef7] hover:text-[#c5c5d8]'
                : 'bg-white border-[#d1d5db] text-[#111827] hover:border-[#4f6ef7] hover:bg-[#f8fafc]'}`}>
        <span className={`font-bold ${active ? 'text-white' : 'text-[#4f6ef7]'}`}>{flag}</span>
        <span>{label}</span>
    </button>
)

/* ─── Constants ───────────────────────────────────────────────────────────── */
const MODES = ['test', 'generate'] as const
type ViewMode = typeof MODES[number]
const EXAMPLE_PATTERN = '(\\d{4})-(\\d{2})-(\\d{2})'
const EXAMPLE_TEXT = `Invoice date: 2024-01-15\nOrder placed: 2023-11-30\nDelivery: 2024-02-08\nInvalid: 24-1-5`

/* ─── Main View ───────────────────────────────────────────────────────────── */
const RegexTester: React.FC<RegexTesterProps> = ({ isDark }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('test')

    // Test mode state
    const [pattern, setPattern] = useState('')
    const [testStr, setTestStr] = useState('')
    const [flags, setFlags] = useState<Set<string>>(new Set(['g']))
    const [matches, setMatches] = useState<MatchInfo[]>([])
    const [error, setError] = useState('')

    // Generate mode state
    const [genDescription, setGenDescription] = useState('')
    const [genResult, setGenResult] = useState<ReturnType<typeof generateRegex>>(null)
    const [genError, setGenError] = useState('')
    const [genCopied, setGenCopied] = useState(false)

    const toggleFlag = (f: string) => setFlags(prev => { const n = new Set(prev); n.has(f) ? n.delete(f) : n.add(f); return n })
    const flagStr = ['g', 'i', 'm', 's'].filter(f => flags.has(f)).join('')

    useEffect(() => {
        if (!pattern || !testStr) { setMatches([]); setError(''); return }
        try {
            const regex = new RegExp(pattern, flagStr.includes('g') ? flagStr : flagStr + 'g')
            const found: MatchInfo[] = []; let m: RegExpExecArray | null; let safety = 0
            while ((m = regex.exec(testStr)) !== null && safety++ < 500) {
                const groups: { key: string; value: string }[] = []
                if (m.groups) { for (const [k, v] of Object.entries(m.groups)) groups.push({ key: k, value: v ?? '' }) }
                else m.slice(1).forEach((g, i) => groups.push({ key: `Group ${i + 1}`, value: g ?? '' }))
                found.push({ index: m.index, fullMatch: m[0], groups })
                if (!flagStr.includes('g')) break
                if (m[0].length === 0) regex.lastIndex++
            }
            setMatches(found); setError('')
        } catch (e) { setError((e as Error).message); setMatches([]) }
    }, [pattern, testStr, flagStr])

    const handleExample = useCallback(() => { setPattern(EXAMPLE_PATTERN); setTestStr(EXAMPLE_TEXT); setFlags(new Set(['g'])) }, [])
    const handleClear = useCallback(() => { setPattern(''); setTestStr(''); setMatches([]); setError('') }, [])

    const copyBtnRef = useRef<HTMLButtonElement>(null)
    const copyPattern = () => {
        navigator.clipboard.writeText(`/${pattern}/${flagStr}`)
        if (copyBtnRef.current) { copyBtnRef.current.textContent = 'Copied!'; setTimeout(() => { if (copyBtnRef.current) copyBtnRef.current.textContent = 'Copy Pattern' }, 1500) }
    }

    const handleGenerate = () => {
        const result = generateRegex(genDescription)
        if (result) { setGenResult(result); setGenError('') }
        else setGenError('No pattern found for that description. Try: "email", "URL", "UUID", "phone number", etc.')
    }

    const handleUseInTester = () => {
        if (!genResult) return
        setPattern(genResult.pattern)
        const newFlags = new Set(genResult.flags.split('').filter(f => ['g','i','m','s'].includes(f)))
        if (newFlags.size === 0) newFlags.add('g')
        setFlags(newFlags)
        setViewMode('test')
    }

    const handleCopyGen = () => {
        if (!genResult) return
        navigator.clipboard.writeText(`/${genResult.pattern}/${genResult.flags}`)
        setGenCopied(true)
        setTimeout(() => setGenCopied(false), 1500)
    }

    const inputCls = `w-full px-3 py-2.5 rounded-md border font-mono text-[13px] transition-colors duration-150
        focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
        ${isDark ? 'bg-[#12121f] border-[#2a2a45] text-[#c5c5d8] placeholder-[#6b7280]'
            : 'bg-white border-[#d1d5db] text-[#111827] placeholder-[#6b7280]'}`

    const btnSec = `px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer border
        ${isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#9595b4] hover:bg-[#252545]' : 'bg-white border-[#d1d5db] text-[#374151] hover:bg-[#f3f4f6]'}`

    return (
        <div className={`flex flex-col min-h-full gap-5 p-6 min-w-[720px] ${isDark ? 'text-[#d1d5db]' : 'text-[#1f2937]'}`}>

            {/* ── Segmented control ── */}
            <div className={`relative flex items-center p-1 rounded-xl w-fit
                ${isDark ? 'bg-[#0e0e18]/80 backdrop-blur-xl border border-white/5 shadow-inner'
                         : 'bg-[#e5e7eb]/70 backdrop-blur-xl border border-black/[0.04] shadow-inner'}`}>
                <div className={`absolute top-1 bottom-1 w-[110px] rounded-lg transition-transform duration-300 ease-out ring-1 ring-[#22c55e]/60
                    ${isDark ? 'bg-[#2a2a45] border border-white/10 shadow-sm shadow-[#22c55e]/10'
                             : 'bg-white border border-[#22c55e]/40 shadow-[0_2px_8px_rgba(34,197,94,0.12)]'}`}
                    style={{ transform: `translateX(${MODES.indexOf(viewMode) * 100}%)` }} />
                {MODES.map(m => (
                    <button key={m} onClick={() => setViewMode(m)}
                        className={`relative z-10 w-[110px] py-1.5 text-[13px] font-semibold font-sans tracking-wide transition-colors duration-300 cursor-pointer text-center capitalize
                            ${viewMode === m
                                ? isDark ? 'text-[#4ade80]' : 'text-[#15803d]'
                                : isDark ? 'text-[#6b7280] hover:text-[#9595b4]' : 'text-[#4b5563] hover:text-[#111827]'}`}>
                        {m}
                    </button>
                ))}
            </div>

            {/* ── TEST MODE ── */}
            {viewMode === 'test' && (<>
                {/* Pattern row */}
                <div className="flex flex-col gap-2">
                    <label className={sectionLabel(isDark)}>Regex Pattern</label>
                    <div className={`flex items-center rounded-md border overflow-hidden transition-colors duration-150
                        ${isDark ? 'bg-[#12121f] border-[#2a2a45]' : 'bg-white border-[#d1d5db]'}
                        focus-within:ring-1 focus-within:ring-[#4f6ef7]`}>
                        <span className="px-3 py-2.5 font-mono text-lg select-none text-[#4f6ef7]">/</span>
                        <input id="regex-pattern-input" type="text" value={pattern}
                            onChange={e => setPattern(e.target.value)} placeholder="Enter pattern…" spellCheck={false}
                            className={`flex-1 py-2.5 font-mono text-[13px] bg-transparent focus:outline-none
                                ${isDark ? 'text-[#c5c5d8] placeholder-[#6b7280]' : 'text-[#111827] placeholder-[#6b7280]'}`} />
                        <span className="px-1 font-mono text-lg select-none text-[#4f6ef7]">/</span>
                        <span className={`pr-3 font-mono text-[13px] min-w-[28px] ${isDark ? 'text-[#a5b4fc]' : 'text-[#4f6ef7]'}`}>{flagStr}</span>
                    </div>

                    {/* Flags + actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {[['g','global'],['i','case-insensitive'],['m','multiline'],['s','dotAll']].map(([f,lbl]) => (
                            <FlagToggle key={f} flag={f} label={lbl} active={flags.has(f)} onToggle={() => toggleFlag(f)} isDark={isDark} />
                        ))}
                        <div className="ml-auto flex gap-2">
                            <button id="regex-example-btn" onClick={handleExample} className={btnSec}>Load Example</button>
                            {pattern && <button ref={copyBtnRef} id="regex-copy-btn" onClick={copyPattern} className={btnSec}>Copy Pattern</button>}
                            <button id="regex-clear-btn" onClick={handleClear}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer border
                                    ${isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#6b7280] hover:bg-[#252545]' : 'bg-white border-[#d1d5db] text-[#9ca3af] hover:bg-[#f3f4f6]'}`}>
                                Clear
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-red-900/30 border border-red-800/40 text-red-400 text-xs font-mono">
                            <span className="shrink-0 mt-0.5">⚠</span><span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Test string + preview */}
                <div className="flex gap-4 flex-1 min-h-0">
                    <div className="flex flex-col flex-1 min-w-0 gap-2">
                        <label className={sectionLabel(isDark)}>Test String</label>
                        <textarea id="regex-test-input" value={testStr} onChange={e => setTestStr(e.target.value)}
                            placeholder="Enter test string…" spellCheck={false}
                            className={`${inputCls} flex-1 resize-none min-h-[200px]`} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 gap-2">
                        <div className="flex items-center justify-between">
                            <label className={sectionLabel(isDark)}>Match Preview</label>
                            {matches.length > 0 && (
                                <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border
                                    ${isDark ? 'bg-[#4f6ef720] border-[#4f6ef740] text-[#a5b4fc]' : 'bg-[#eff2ff] border-[#c7d2fe] text-[#4338ca]'}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#4f6ef7] inline-block" />
                                    {matches.length} match{matches.length !== 1 ? 'es' : ''}
                                </span>
                            )}
                        </div>
                        <div className={`flex-1 min-h-[200px] p-3 rounded-md border overflow-auto ${isDark ? 'bg-[#12121f] border-[#2a2a45]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
                            <HighlightedText text={testStr} pattern={pattern} flags={flagStr} isDark={isDark} />
                        </div>
                    </div>
                </div>

                {/* Match list */}
                {matches.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <label className={sectionLabel(isDark)}>Matches</label>
                        <div className={`rounded-md border overflow-hidden ${isDark ? 'border-[#2a2a45]' : 'border-[#e5e7eb]'}`}>
                            {matches.map((m, i) => (
                                <div key={i} className={`flex items-start gap-4 px-4 py-3 font-mono text-[12px]
                                    ${i % 2 === 0 ? isDark ? 'bg-[#12121f]' : 'bg-white' : isDark ? 'bg-[#0e0e18]' : 'bg-[#f9fafb]'}
                                    ${i < matches.length - 1 ? isDark ? 'border-b border-[#1e1e35]' : 'border-b border-[#e5e7eb]' : ''}`}>
                                    <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded font-bold ${isDark ? 'bg-[#1e1e35] text-[#6b7280]' : 'bg-[#f3f4f6] text-[#4b5563]'}`}>
                                        #{i + 1}
                                    </span>
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <span className={`${isDark ? 'text-[#a5b4fc]' : 'text-[#4338ca]'} font-semibold`}>"{m.fullMatch}"</span>
                                            <span className={`text-[11px] ${isDark ? 'text-[#4b5563]' : 'text-[#6b7280]'}`}>@ index {m.index}</span>
                                        </div>
                                        {m.groups.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {m.groups.map((g, gi) => (
                                                    <span key={gi} className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border
                                                        ${isDark ? 'bg-[#1a1a2e] border-[#2a2a45] text-[#9595b4]' : 'bg-[#f3f4f6] border-[#d1d5db] text-[#4b5563]'}`}>
                                                        <span className="text-[#6b7280]">{g.key}:</span>
                                                        <span className={isDark ? 'text-[#c5c5d8]' : 'text-[#111827]'}>"{g.value}"</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>)}

            {/* ── GENERATE MODE ── */}
            {viewMode === 'generate' && (
                <div className="flex gap-5 flex-1 min-h-0">
                    {/* Left: input + result */}
                    <div className="flex flex-col flex-1 gap-4 min-w-0">
                        {/* Description input */}
                        <div className="flex flex-col gap-2">
                            <label className={sectionLabel(isDark)}>Describe Your Pattern</label>
                            <div className="flex gap-2">
                                <input
                                    id="regex-gen-input"
                                    type="text"
                                    value={genDescription}
                                    onChange={e => setGenDescription(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                                    placeholder='e.g. "email address", "UUID", "phone number"…'
                                    spellCheck={false}
                                    className={`${inputCls} flex-1`}
                                />
                                <button
                                    id="regex-gen-btn"
                                    onClick={handleGenerate}
                                    className="px-5 py-2.5 rounded-md text-sm font-semibold font-mono bg-[#4f6ef7] hover:bg-[#3d5ce5] text-white transition-all duration-150 cursor-pointer shadow-lg shadow-[#4f6ef730] shrink-0">
                                    Generate
                                </button>
                            </div>
                            <p className={`text-[11px] font-mono ${isDark ? 'text-[#6b7280]' : 'text-[#9ca3af]'}`}>
                                Describe what you want to match in plain English. Press Enter or click Generate.
                            </p>
                        </div>

                        {/* Error */}
                        {genError && (
                            <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-red-900/30 border border-red-800/40 text-red-400 text-xs font-mono">
                                <span className="shrink-0 mt-0.5">⚠</span><span>{genError}</span>
                            </div>
                        )}

                        {/* Result card */}
                        {genResult && (
                            <div className={`flex flex-col gap-3 rounded-xl border p-5 transition-all duration-200
                                ${isDark ? 'bg-[#0e0e18] border-[#2a2a45]' : 'bg-white border-[#e5e7eb]'}`}>
                                <div className="flex items-center justify-between gap-3">
                                    <label className={sectionLabel(isDark)}>Generated Pattern</label>
                                    <div className="flex gap-2">
                                        <button onClick={handleCopyGen}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer border
                                                ${isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#9595b4] hover:bg-[#252545]' : 'bg-white border-[#d1d5db] text-[#374151] hover:bg-[#f3f4f6]'}`}>
                                            {genCopied ? '✓ Copied' : 'Copy'}
                                        </button>
                                        <button
                                            id="regex-use-in-tester-btn"
                                            onClick={handleUseInTester}
                                            className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-150 cursor-pointer border bg-[#22c55e]/10 border-[#22c55e]/40 text-[#15803d] hover:bg-[#22c55e]/20 dark:text-[#4ade80]">
                                            Use in Tester
                                        </button>
                                    </div>
                                </div>

                                {/* Pattern display */}
                                <div className={`flex items-center gap-1 px-3 py-2.5 rounded-md border font-mono text-[13px] overflow-x-auto
                                    ${isDark ? 'bg-[#12121f] border-[#2a2a45]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
                                    <span className="text-[#4f6ef7] shrink-0">/</span>
                                    <span className={`${isDark ? 'text-[#86efac]' : 'text-[#15803d]'} break-all`}>{genResult.pattern}</span>
                                    <span className="text-[#4f6ef7] shrink-0">/</span>
                                    <span className={`${isDark ? 'text-[#a5b4fc]' : 'text-[#4f6ef7]'} shrink-0`}>{genResult.flags}</span>
                                </div>

                                {/* Meta */}
                                <div className="flex flex-col gap-1.5">
                                    <div className={`flex items-start gap-2 text-[12px] ${isDark ? 'text-[#9ca3af]' : 'text-[#4b5563]'}`}>
                                        <span className={`shrink-0 font-mono font-semibold text-[10px] tracking-widest uppercase mt-0.5 ${isDark ? 'text-[#6b7280]' : 'text-[#9ca3af]'}`}>What it matches</span>
                                        <span>{genResult.description}</span>
                                    </div>
                                    <div className={`flex items-start gap-2 text-[12px] ${isDark ? 'text-[#9ca3af]' : 'text-[#4b5563]'}`}>
                                        <span className={`shrink-0 font-mono font-semibold text-[10px] tracking-widest uppercase mt-0.5 ${isDark ? 'text-[#6b7280]' : 'text-[#9ca3af]'}`}>Example</span>
                                        <code className={`font-mono ${isDark ? 'text-[#c5c5d8]' : 'text-[#111827]'}`}>{genResult.example}</code>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: quick picks */}
                    <div className="flex flex-col gap-2 w-[220px] shrink-0">
                        <label className={sectionLabel(isDark)}>Quick Examples</label>
                        <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-[#2a2a45]' : 'border-[#e5e7eb]'}`}>
                            {GENERATOR_EXAMPLES.map((ex, i) => (
                                <button key={i}
                                    onClick={() => { setGenDescription(ex); const r = generateRegex(ex); if (r) { setGenResult(r); setGenError('') } }}
                                    className={`w-full text-left px-3 py-2.5 text-[12px] font-sans transition-colors duration-150 cursor-pointer
                                        ${genDescription === ex
                                            ? isDark ? 'bg-[#252545] text-[#d1d5db]' : 'bg-[#eff6ff] text-[#1e40af]'
                                            : i % 2 === 0
                                                ? isDark ? 'bg-[#0e0e18] hover:bg-[#1a1a2e] text-[#9ca3af]' : 'bg-white hover:bg-[#f3f4f6] text-[#374151]'
                                                : isDark ? 'bg-[#12121f] hover:bg-[#1a1a2e] text-[#9ca3af]' : 'bg-[#f9fafb] hover:bg-[#f3f4f6] text-[#374151]'}
                                        ${i < GENERATOR_EXAMPLES.length - 1 ? isDark ? 'border-b border-[#1e1e35]' : 'border-b border-[#e5e7eb]' : ''}`}>
                                    {ex}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RegexTester
