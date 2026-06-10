import React, { useState } from 'react'
import { sectionLabel } from '../utils/styles'

const EXAMPLE_ENCODE = `{"user":"john_doe","role":"admin","exp":1893456000}`
const EXAMPLE_DECODE = `eyJ1c2VyIjoiam9obl9kb2UiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE4OTM0NTYwMDB9`

export default function Base64({ isDark }: { isDark: boolean }) {
    const [input, setInput] = useState('')
    const [mode, setMode] = useState<'encode' | 'decode'>('encode')
    const [copied, setCopied] = useState(false)

    const output = React.useMemo(() => {
        if (!input) return ''
        try {
            return mode === 'encode' ? btoa(unescape(encodeURIComponent(input))) : decodeURIComponent(escape(atob(input)))
        } catch {
            return '⚠ Invalid input for selected mode'
        }
    }, [input, mode])

    const handleExample = () => {
        setInput(mode === 'encode' ? EXAMPLE_ENCODE : EXAMPLE_DECODE)
    }

    const handleCopy = () => {
        if (!output) return
        navigator.clipboard.writeText(output)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const inputCls = `w-full p-3 rounded-md border font-mono text-[13px] leading-[1.6] transition-colors duration-150 resize-none
        focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
        ${isDark ? 'bg-[#12121f] border-[#2a2a45] text-[#c5c5d8] placeholder-[#6b7280]'
            : 'bg-white border-[#d1d5db] text-[#111827] placeholder-[#6b7280]'}`

    const btnSecondary = `px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer border
        ${isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#9595b4] hover:bg-[#252545]'
            : 'bg-white border-[#d1d5db] text-[#374151] font-semibold hover:bg-[#f3f4f6]'}`

    return (
        <div className={`flex flex-col min-h-full gap-4 p-6 min-w-[720px] ${isDark ? 'text-[#d1d5db]' : 'text-[#1f2937]'}`}>
            {/* Row 1: Segmented control */}
            <div className={`relative flex items-center p-1 rounded-xl w-fit
                ${isDark ? 'bg-[#0e0e18]/80 backdrop-blur-xl border border-white/5 shadow-inner' 
                         : 'bg-[#e5e7eb]/70 backdrop-blur-xl border border-black/[0.04] shadow-inner'}`}>
                
                <div 
                    className={`absolute top-1 bottom-1 w-[110px] rounded-lg transition-transform duration-300 ease-out ring-1 ring-[#22c55e]/60
                        ${isDark ? 'bg-[#2a2a45] border border-white/10 shadow-sm shadow-[#22c55e]/10' : 'bg-white border border-[#22c55e]/40 shadow-[0_2px_8px_rgba(34,197,94,0.12)]'}`}
                    style={{ transform: `translateX(${mode === 'encode' ? 0 : 100}%)` }}
                />
                {(['encode', 'decode'] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`relative z-10 w-[110px] py-1.5 text-[13px] font-semibold font-sans tracking-wide transition-colors duration-300 cursor-pointer text-center capitalize
                            ${mode === m
                                ? isDark ? 'text-[#4ade80]' : 'text-[#15803d]'
                                : isDark ? 'text-[#6b7280] hover:text-[#9595b4]' : 'text-[#4b5563] hover:text-[#111827]'
                            }`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {/* Row 2: Action buttons */}
            <div className="flex items-center gap-2">
                <button id="base64-example-btn" onClick={handleExample} className={btnSecondary}>
                    Load Example
                </button>
                {output && (
                    <button id="base64-copy-btn" onClick={handleCopy} className={btnSecondary}>
                        {copied ? '✓ Copied' : 'Copy Output'}
                    </button>
                )}
                {input && (
                    <button id="base64-clear-btn" onClick={() => setInput('')} className={btnSecondary}>
                        Clear
                    </button>
                )}
            </div>

            {/* Editor row */}
            <div className="flex gap-4 flex-1">
                <div className="flex flex-col flex-1 gap-2">
                    <label className={sectionLabel(isDark)}>Input</label>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={mode === 'encode' ? 'Paste text or JSON to encode…' : 'Paste Base64 string to decode…'}
                        className={`${inputCls} flex-1`}
                        spellCheck={false}
                    />
                </div>
                <div className="flex flex-col flex-1 gap-2">
                    <label className={sectionLabel(isDark)}>Output</label>
                    <textarea
                        value={output}
                        readOnly
                        placeholder="Result will appear here…"
                        className={`${inputCls} flex-1`}
                        spellCheck={false}
                    />
                </div>
            </div>
        </div>
    )
}
