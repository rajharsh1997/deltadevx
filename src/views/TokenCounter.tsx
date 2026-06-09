import React, { useState, useEffect, useCallback, useRef } from 'react'
import { encode } from 'gpt-tokenizer'

interface TokenCounterProps {
    isDark: boolean
}

type ModelKey = 'gpt-4o' | 'claude-sonnet-4-5' | 'claude-sonnet-4-6' | 'claude-opus-4' | 'deepseek-v4-flash' | 'gemini-2-5-pro'

interface ModelInfo {
    label: string
    provider: string
    inputPer1M: number
    outputPer1M: number
    context: string
    badge?: string
}

const MODELS: Record<ModelKey, ModelInfo> = {
    'gpt-4o':            { label: 'GPT-4o',              provider: 'OpenAI',    inputPer1M: 2.50,  outputPer1M: 10.00, context: '128k' },
    'claude-sonnet-4-5': { label: 'Claude Sonnet 4.5',   provider: 'Anthropic', inputPer1M: 3.00,  outputPer1M: 15.00, context: '200k' },
    'claude-sonnet-4-6': { label: 'Claude Sonnet 4.6',   provider: 'Anthropic', inputPer1M: 3.00,  outputPer1M: 15.00, context: '200k', badge: 'Latest' },
    'claude-opus-4':     { label: 'Claude Opus 4',       provider: 'Anthropic', inputPer1M: 15.00, outputPer1M: 75.00, context: '200k', badge: 'Power' },
    'deepseek-v4-flash': { label: 'DeepSeek V4 Flash',   provider: 'DeepSeek',  inputPer1M: 0.15,  outputPer1M: 0.60,  context: '128k', badge: 'Budget' },
    'gemini-2-5-pro':    { label: 'Gemini 2.5 Pro',      provider: 'Google',    inputPer1M: 1.25,  outputPer1M: 10.00, context: '1M',   badge: 'Long ctx' },
}

const PROVIDER_COLORS: Record<string, string> = {
    'OpenAI':    '#10a37f',
    'Anthropic': '#d4810a',
    'DeepSeek':  '#4f6ef7',
    'Google':    '#ea4335',
}

function formatCost(usd: number): string {
    if (usd === 0) return '—'
    if (usd < 0.000001) return '< $0.000001'
    if (usd < 0.0001) return `$${usd.toFixed(6)}`
    if (usd < 0.01)   return `$${usd.toFixed(4)}`
    return `$${usd.toFixed(4)}`
}

/* ─── Stat Card ───────────────────────────────────────────────────────────── */
const StatCard: React.FC<{ label: string; value: string | number; accent?: boolean; isDark: boolean; sub?: string }> = ({
    label, value, accent, isDark, sub
}) => (
    <div className={`flex flex-col gap-1 px-5 py-4 rounded-xl border flex-1 min-w-[110px]
        ${isDark ? 'bg-[#12121f] border-[#2a2a45]' : 'bg-white border-[#e5e7eb]'}`}>
        <span className={`text-[10px] font-mono font-semibold tracking-widest uppercase ${isDark ? 'text-[#6b7280]' : 'text-[#6b7280]'}`}>
            {label}
        </span>
        <span className={`text-2xl font-bold font-mono tabular-nums leading-none ${accent ? 'text-[#4f6ef7]' : isDark ? 'text-[#e8e8f0]' : 'text-[#111827]'}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {sub && <span className={`text-[10px] font-mono ${isDark ? 'text-[#6b7280]' : 'text-[#9ca3af]'}`}>{sub}</span>}
    </div>
)

/* ─── Main View ───────────────────────────────────────────────────────────── */
const EXAMPLE_TEXT = `The attention mechanism in transformers allows the model to dynamically weigh the importance of different tokens in the input when generating each output token. This is the core innovation that made large language models at scale possible.

For each position in the sequence, attention computes a weighted sum of value vectors, where the weights are determined by the dot-product similarity between the query and key vectors — scaled by the square root of the key dimension to stabilize gradients.

Multi-head attention runs this process in parallel across H heads, allowing the model to jointly attend to information from different representation subspaces at different positions.`

const TokenCounter: React.FC<TokenCounterProps> = ({ isDark }) => {
    const [text, setText] = useState('')
    const [tokens, setTokens] = useState(0)
    const [selectedModel, setSelectedModel] = useState<ModelKey>('claude-sonnet-4-6')

    useEffect(() => {
        if (!text) { setTokens(0); return }
        try { setTokens(encode(text).length) } catch { setTokens(0) }
    }, [text])

    const wordCount  = text.trim() ? text.trim().split(/\s+/).length : 0
    const charCount  = text.length
    const lineCount  = text ? text.split('\n').length : 0

    const handleExample = useCallback(() => setText(EXAMPLE_TEXT), [])
    const handleClear   = useCallback(() => setText(''), [])

    const copyBtnRef = useRef<HTMLButtonElement>(null)
    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(text)
        if (copyBtnRef.current) {
            copyBtnRef.current.textContent = 'Copied!'
            setTimeout(() => { if (copyBtnRef.current) copyBtnRef.current.textContent = 'Copy Text' }, 1500)
        }
    }, [text])

    const btnBase = `px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer border`
    const btnSec  = isDark
        ? 'bg-[#1e1e35] hover:bg-[#252545] text-[#9595b4] border-[#2a2a45]'
        : 'bg-white hover:bg-[#f3f4f6] text-[#374151] border-[#e5e7eb]'

    return (
        <div className="flex flex-col min-h-full gap-5 p-6 min-w-[680px] text-[#e8e8f0]">
            {/* Stats row */}
            <div className="flex gap-3 flex-wrap">
                <StatCard label="Tokens"     value={tokens}    accent isDark={isDark} sub="cl100k_base" />
                <StatCard label="Characters" value={charCount} isDark={isDark} />
                <StatCard label="Words"      value={wordCount} isDark={isDark} />
                <StatCard label="Lines"      value={lineCount} isDark={isDark} />
            </div>

            {/* Textarea */}
            <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center justify-between">
                    <label className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${isDark ? 'text-[#6b7280]' : 'text-[#6b7280]'}`}>
                        Input Text
                    </label>
                    <div className="flex gap-2">
                        <button id="token-example-btn" onClick={handleExample} className={`${btnBase} ${btnSec}`}>Load Example</button>
                        {text && <button ref={copyBtnRef} id="token-copy-btn" onClick={handleCopy} className={`${btnBase} ${btnSec}`}>Copy Text</button>}
                        <button id="token-clear-btn" onClick={handleClear}
                            className={`${btnBase} ${isDark ? 'bg-[#1e1e35] hover:bg-[#252545] text-[#6b7280] border-[#2a2a45]' : 'bg-white hover:bg-[#f3f4f6] text-[#9ca3af] border-[#e5e7eb]'}`}>
                            Clear
                        </button>
                    </div>
                </div>
                <textarea
                    id="token-input"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Paste or type text to count tokens…"
                    spellCheck={false}
                    className={`flex-1 min-h-[200px] resize-none w-full p-3 rounded-md border font-mono text-[13px] leading-[1.6] transition-colors duration-150
                        focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
                        ${isDark
                            ? 'bg-[#12121f] border-[#2a2a45] text-[#e8e8f0] placeholder-[#6b7280]'
                            : 'bg-white border-[#e5e7eb] text-[#111827] placeholder-[#6b7280]'
                        }`}
                />
                <p className={`text-[11px] font-mono ${isDark ? 'text-[#6b7280]' : 'text-[#9ca3af]'}`}>
                    Uses cl100k_base encoding (GPT-4 / Claude compatible) — runs fully offline, no API calls
                </p>
            </div>

            {/* Cost reference table */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <label className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${isDark ? 'text-[#6b7280]' : 'text-[#6b7280]'}`}>
                        Cost Reference <span className={`normal-case tracking-normal font-normal ml-1 ${isDark ? 'text-[#6b7280]' : 'text-[#9ca3af]'}`}>(click a row to highlight)</span>
                    </label>
                    <span className={`text-[11px] font-mono ${isDark ? 'text-[#6b7280]' : 'text-[#9ca3af]'}`}>
                        {tokens > 0 ? `${tokens.toLocaleString()} input tokens` : 'enter text to see cost'}
                    </span>
                </div>
                <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-[#2a2a45]' : 'border-[#e5e7eb]'}`}>
                    {/* Header */}
                    <div className={`grid font-mono text-[10.5px] font-semibold tracking-wider uppercase px-4 py-2.5 border-b
                        ${isDark ? 'bg-[#0e0e18] border-[#2a2a45] text-[#4b5563]' : 'bg-[#f9fafb] border-[#e5e7eb] text-[#9ca3af]'}`}
                        style={{ gridTemplateColumns: '1fr 80px 80px 90px 90px 100px' }}>
                        <span>Model</span>
                        <span className="text-right">Provider</span>
                        <span className="text-right">Context</span>
                        <span className="text-right">Input /1M</span>
                        <span className="text-right">Output /1M</span>
                        <span className="text-right">Est. Input Cost</span>
                    </div>
                    {(Object.entries(MODELS) as [ModelKey, ModelInfo][]).map(([key, m], i, arr) => {
                        const inputCost = (tokens / 1_000_000) * m.inputPer1M
                        const isSelected = key === selectedModel
                        const providerColor = PROVIDER_COLORS[m.provider] || '#6b7280'
                        return (
                            <button
                                key={key}
                                id={`token-model-${key}`}
                                onClick={() => setSelectedModel(key)}
                                className={`w-full grid text-left font-mono text-[12px] px-4 py-3 transition-all duration-150 cursor-pointer
                                    ${i < arr.length - 1 ? isDark ? 'border-b border-[#1a1a2e]' : 'border-b border-[#f3f4f6]' : ''}
                                    ${isSelected
                                        ? isDark ? 'bg-[#4f6ef712]' : 'bg-[#eff2ff]'
                                        : isDark ? 'bg-[#12121f] hover:bg-[#1a1a2e]' : 'bg-white hover:bg-[#f9fafb]'
                                    }`}
                                style={{ gridTemplateColumns: '1fr 80px 80px 90px 90px 100px' }}
                            >
                                {/* Model name */}
                                <span className="flex items-center gap-2 min-w-0">
                                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#4f6ef7] inline-block shrink-0" />}
                                    <span className={`truncate ${isSelected ? isDark ? 'text-[#a5b4fc]' : 'text-[#4338ca]' : isDark ? 'text-[#e8e8f0]' : 'text-[#111827]'}`}>
                                        {m.label}
                                    </span>
                                    {m.badge && (
                                        <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-sans font-semibold"
                                            style={{ background: providerColor + '22', color: providerColor }}>
                                            {m.badge}
                                        </span>
                                    )}
                                </span>
                                {/* Provider */}
                                <span className="text-right text-[10.5px]" style={{ color: providerColor + 'cc' }}>
                                    {m.provider}
                                </span>
                                {/* Context */}
                                <span className={`text-right ${isDark ? 'text-[#9ca3af]' : 'text-[#6b7280]'}`}>{m.context}</span>
                                {/* Input */}
                                <span className={`text-right ${isDark ? 'text-[#9ca3af]' : 'text-[#6b7280]'}`}>${m.inputPer1M.toFixed(2)}</span>
                                {/* Output */}
                                <span className={`text-right ${isDark ? 'text-[#9ca3af]' : 'text-[#6b7280]'}`}>${m.outputPer1M.toFixed(2)}</span>
                                {/* Cost */}
                                <span className={`text-right font-semibold tabular-nums ${tokens > 0 ? isDark ? 'text-[#4f6ef7]' : 'text-[#4338ca]' : isDark ? 'text-[#6b7280]' : 'text-[#9ca3af]'}`}>
                                    {formatCost(inputCost)}
                                </span>
                            </button>
                        )
                    })}
                </div>
                <p className={`text-[10.5px] font-mono ${isDark ? 'text-[#6b7280]' : 'text-[#9ca3af]'}`}>
                    Prices are approximate estimates for input tokens only. Always verify current pricing on provider websites.
                </p>
            </div>
        </div>
    )
}

export default TokenCounter
