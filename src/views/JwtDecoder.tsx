import React, { useState, useCallback } from 'react'
import { decodeJWT, formatDate, timeFromNow, type DecodedJWT } from '../utils/jwtDecode'

/* ─────────────────────────── JSON Pretty Display ────────────────────────── */
interface JsonDisplayProps {
    data: Record<string, unknown>
    isDark: boolean
    timestampKeys?: string[]
    isExpired?: boolean
}

function syntaxHighlight(json: string, isDark: boolean): React.ReactNode[] {
    const tokens = json.split(
        /("(?:[^"\\]|\\.)*"(?:\s*:)?|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g
    )

    return tokens.map((token, i) => {
        if (!token) return null

        if (/^"[^"]*":$/.test(token)) {
            // Property key
            return (
                <span key={i} className={isDark ? 'text-[#7b94fa]' : 'text-[#4f6ef7]'}>
                    {token}
                </span>
            )
        } else if (/^"/.test(token)) {
            // String value
            return (
                <span key={i} className={isDark ? 'text-[#86efac]' : 'text-[#16a34a]'}>
                    {token}
                </span>
            )
        } else if (token === 'true' || token === 'false') {
            return (
                <span key={i} className={isDark ? 'text-[#fb923c]' : 'text-[#ea580c]'}>
                    {token}
                </span>
            )
        } else if (token === 'null') {
            return (
                <span key={i} className={isDark ? 'text-[#f87171]' : 'text-[#dc2626]'}>
                    {token}
                </span>
            )
        } else if (/^-?\d/.test(token)) {
            return (
                <span key={i} className={isDark ? 'text-[#fcd34d]' : 'text-[#b45309]'}>
                    {token}
                </span>
            )
        }
        return <span key={i} className={isDark ? 'text-[#c5c5d8]' : 'text-[#374151]'}>{token}</span>
    })
}

const JsonDisplay: React.FC<JsonDisplayProps> = ({
    data,
    isDark,
    timestampKeys = ['exp', 'iat', 'nbf'],
    isExpired = false,
}) => {
    const jsonStr = JSON.stringify(data, null, 2)
    const lines = jsonStr.split('\n')

    // Find which lines contain timestamp keys
    const timestampLineMap: Record<number, { key: string; ts: number }> = {}
    lines.forEach((line, idx) => {
        for (const key of timestampKeys) {
            const match = line.match(new RegExp(`"${key}":\\s*(-?\\d+)`))
            if (match) {
                timestampLineMap[idx] = { key, ts: parseInt(match[1], 10) }
            }
        }
    })

    const highlightedLines = lines.map((line) => {
        return syntaxHighlight(line, isDark)
    })

    return (
        <div
            className={`
        font-mono text-[12.5px] leading-[1.65] overflow-auto
        rounded-lg border h-full
        ${isDark ? 'bg-[#12121f] border-[#2a2a45]' : 'bg-[#f9fafb] border-[#e5e7eb]'}
      `}
        >
            <div className="p-4">
                {lines.map((_, lineIdx) => (
                    <div key={lineIdx}>
                        <div className="flex">
                            {/* Line number */}
                            <span
                                className={`shrink-0 w-8 text-right mr-4 select-none text-[11px] mt-0.5
                  ${isDark ? 'text-[#3d3d6b]' : 'text-[#d1d5db]'}`}
                            >
                                {lineIdx + 1}
                            </span>
                            {/* Content */}
                            <span className="flex-1 whitespace-pre-wrap break-all">
                                {highlightedLines[lineIdx]}
                            </span>
                        </div>

                        {/* Timestamp annotation */}
                        {timestampLineMap[lineIdx] && (() => {
                            const { key, ts } = timestampLineMap[lineIdx]
                            const date = new Date(ts * 1000)
                            const isThisExpired = key === 'exp' && isExpired
                            return (
                                <div className="flex ml-12 my-0.5">
                                    <span
                                        className={`
                      inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-sans
                      ${isThisExpired
                                                ? 'bg-red-900/30 border border-red-800/40 text-red-400'
                                                : isDark
                                                    ? 'bg-[#1e1e35] border border-[#2a2a45] text-[#6b7280]'
                                                    : 'bg-[#f3f4f6] border border-[#e5e7eb] text-[#9ca3af]'
                                            }
                    `}
                                    >
                                        <span>🕐</span>
                                        <span>{formatDate(date)}</span>
                                        <span className={isDark ? 'text-[#3d3d6b]' : 'text-[#d1d5db]'}>·</span>
                                        <span className={isThisExpired ? 'text-red-400' : ''}>
                                            {timeFromNow(date)}
                                        </span>
                                        {isThisExpired && (
                                            <span className="font-semibold text-red-400">EXPIRED</span>
                                        )}
                                    </span>
                                </div>
                            )
                        })()}
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ─────────────────────────── Column Card ────────────────────────────────── */
interface ColumnCardProps {
    title: string
    children: React.ReactNode
    isDark: boolean
    badge?: React.ReactNode
}

const ColumnCard: React.FC<ColumnCardProps> = ({ title, children, isDark, badge }) => (
    <div className="flex flex-col flex-1 min-h-0 gap-2">
        <div className="flex items-center gap-2 shrink-0">
            <span
                className={`text-[11px] font-mono font-semibold tracking-widest uppercase
          ${isDark ? 'text-[#4b5563]' : 'text-[#9ca3af]'}`}
            >
                {title}
            </span>
            {badge}
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
            {children}
        </div>
    </div>
)

/* ─────────────────────────── Main JWT Decoder View ─────────────────────── */
interface JwtDecoderProps {
    isDark: boolean
}

const EXAMPLE_JWT =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MDAwMDAwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

const JwtDecoder: React.FC<JwtDecoderProps> = ({ isDark }) => {
    const [token, setToken] = useState('')
    const [decoded, setDecoded] = useState<DecodedJWT | null>(null)
    const [error, setError] = useState('')

    const handleDecode = useCallback(() => {
        const t = token.trim()
        if (!t) {
            setError('Please paste a JWT token to decode.')
            setDecoded(null)
            return
        }
        try {
            const result = decodeJWT(t)
            setDecoded(result)
            setError('')
        } catch (e) {
            setError((e as Error).message)
            setDecoded(null)
        }
    }, [token])

    const handleClear = useCallback(() => {
        setToken('')
        setDecoded(null)
        setError('')
    }, [])

    const loadExample = useCallback(() => {
        setToken(EXAMPLE_JWT)
        setDecoded(null)
        setError('')
    }, [])

    return (
        <div className="flex flex-col h-full gap-4 p-6 overflow-hidden">
            {/* Token input */}
            <div className="flex flex-col gap-2 shrink-0">
                <label
                    className={`text-[11px] font-mono font-semibold tracking-widest uppercase
            ${isDark ? 'text-[#4b5563]' : 'text-[#9ca3af]'}`}
                >
                    JWT Token
                </label>
                <textarea
                    id="jwt-input"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    rows={4}
                    spellCheck={false}
                    placeholder="Paste your JWT token here... (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
                    className={`
            w-full resize-none rounded-lg border p-3
            font-mono text-[12.5px] leading-relaxed
            transition-colors duration-150
            placeholder-[#3d3d6b]
            focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
            ${isDark
                            ? 'bg-[#12121f] border-[#2a2a45] text-[#c5c5d8]'
                            : 'bg-white border-[#e5e7eb] text-[#374151]'
                        }
          `}
                />
                {error && (
                    <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-red-900/30 border border-red-800/40 text-red-400 text-xs font-mono">
                        <span className="shrink-0 mt-0.5">⚠</span>
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
                <button
                    id="decode-btn"
                    onClick={handleDecode}
                    className="
            px-5 py-2 rounded-lg text-sm font-semibold font-mono
            bg-[#4f6ef7] hover:bg-[#3d5ce5] active:bg-[#3350d4]
            text-white transition-all duration-150
            shadow-lg shadow-[#4f6ef730]
            cursor-pointer
          "
                >
                    Decode
                </button>
                <button
                    id="example-btn"
                    onClick={loadExample}
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
                    id="jwt-clear-btn"
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

                {/* Expired warning badge */}
                {decoded?.isExpired && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-900/30 border border-red-800/40 text-red-400 text-xs font-mono font-semibold ml-2 animate-fade-in">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
                        TOKEN EXPIRED
                    </span>
                )}
                {decoded && !decoded.isExpired && decoded.expiresAt && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-900/30 border border-emerald-800/40 text-emerald-400 text-xs font-mono animate-fade-in">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                        Valid Token
                    </span>
                )}
            </div>

            {/* Decoded panels */}
            {decoded && (
                <div className="flex gap-4 flex-1 min-h-0 animate-fade-in">
                    {/* Header */}
                    <ColumnCard title="Header" isDark={isDark}>
                        <JsonDisplay data={decoded.header} isDark={isDark} timestampKeys={[]} />
                    </ColumnCard>

                    {/* Payload */}
                    <ColumnCard
                        title="Payload"
                        isDark={isDark}
                    >
                        <JsonDisplay
                            data={decoded.payload as Record<string, unknown>}
                            isDark={isDark}
                            timestampKeys={['exp', 'iat', 'nbf']}
                            isExpired={decoded.isExpired}
                        />
                    </ColumnCard>

                    {/* Signature */}
                    <ColumnCard title="Signature" isDark={isDark}>
                        <div
                            className={`
                h-full overflow-auto rounded-lg border p-4 flex flex-col gap-4
                ${isDark ? 'bg-[#12121f] border-[#2a2a45]' : 'bg-[#f9fafb] border-[#e5e7eb]'}
              `}
                        >
                            <div>
                                <div
                                    className={`text-[10.5px] font-mono uppercase tracking-wider mb-2
                    ${isDark ? 'text-[#3d3d6b]' : 'text-[#d1d5db]'}`}
                                >
                                    Raw Signature
                                </div>
                                <div
                                    className={`
                    font-mono text-[11.5px] break-all leading-relaxed
                    ${isDark ? 'text-[#7b94fa]' : 'text-[#4f6ef7]'}
                  `}
                                >
                                    {decoded.signature}
                                </div>
                            </div>

                            <div
                                className={`
                  mt-auto p-3 rounded-lg border text-[11.5px] font-sans leading-relaxed
                  ${isDark
                                        ? 'bg-[#1a1a2e] border-[#2a2a45] text-[#4b5563]'
                                        : 'bg-[#f3f4f6] border-[#e5e7eb] text-[#9ca3af]'
                                    }
                `}
                            >
                                <div className="flex items-start gap-2">
                                    <span className="text-amber-500 shrink-0">⚠</span>
                                    <span>
                                        Signature verification requires the secret key and is <strong>not</strong> performed here.
                                        This tool only decodes — it does not validate the token's authenticity.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </ColumnCard>
                </div>
            )}

            {/* Empty state */}
            {!decoded && !error && (
                <div
                    className={`
            flex-1 flex items-center justify-center rounded-xl border-2 border-dashed
            ${isDark ? 'border-[#1e1e35] text-[#2a2a45]' : 'border-[#e5e7eb] text-[#d1d5db]'}
          `}
                >
                    <div className="text-center font-mono text-sm space-y-2">
                        <div className="text-4xl">🔐</div>
                        <div className={isDark ? 'text-[#3d3d6b]' : 'text-[#d1d5db]'}>
                            Paste a JWT token above and click <strong>Decode</strong>
                        </div>
                        <div className={`text-xs ${isDark ? 'text-[#2a2a45]' : 'text-[#e5e7eb]'}`}>
                            or click &quot;Load Example&quot; to try with a sample token
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default JwtDecoder
