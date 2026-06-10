import React, { useState, useEffect } from 'react'
import { sectionLabel } from '../utils/styles'

type Mode = 'timestamp' | 'cron'

/* ─── Timestamp Converter ─────────────────────────────────────────────────── */
const TimestampConverter: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const [tsInput, setTsInput] = useState('')
    const [dateText, setDateText] = useState('')
    const [dateError, setDateError] = useState('')
    const [now, setNow] = useState(Date.now())
    const [copiedKey, setCopiedKey] = useState<string | null>(null)
    const paused = React.useRef(false)

    // Live clock — paused while any input is focused to avoid disrupting native pickers
    useEffect(() => {
        const id = setInterval(() => { if (!paused.current) setNow(Date.now()) }, 1000)
        return () => clearInterval(id)
    }, [])

    const nowSec = Math.floor(now / 1000)

    // Resolve timestamp from input (supports seconds and milliseconds)
    const resolvedDate: Date | null = (() => {
        if (!tsInput) return null
        const n = Number(tsInput.trim())
        if (isNaN(n)) return null
        // Heuristic: if > 1e12 treat as ms, otherwise seconds
        return new Date(n > 1e12 ? n : n * 1000)
    })()

    // Resolve date from text input (YYYY-MM-DD HH:mm)
    const dateFromInput: Date | null = (() => {
        if (!dateText.trim()) return null
        const m = dateText.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?$/)
        if (!m) return null
        const d = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4] ?? '00'}:${m[5] ?? '00'}:00`)
        return isNaN(d.getTime()) ? null : d
    })()

    const activeDate = resolvedDate ?? dateFromInput

    const formats: { label: string; key: string; value: string }[] = activeDate
        ? [
            { key: 'unix_s', label: 'Unix (seconds)', value: String(Math.floor(activeDate.getTime() / 1000)) },
            { key: 'unix_ms', label: 'Unix (milliseconds)', value: String(activeDate.getTime()) },
            { key: 'iso', label: 'ISO 8601', value: activeDate.toISOString() },
            { key: 'utc', label: 'UTC String', value: activeDate.toUTCString() },
            { key: 'local', label: 'Local String', value: activeDate.toLocaleString() },
            { key: 'date', label: 'Date Only', value: activeDate.toLocaleDateString() },
            { key: 'time', label: 'Time Only', value: activeDate.toLocaleTimeString() },
            { key: 'rel', label: 'Relative', value: relativeTime(activeDate) },
        ]
        : []

    function relativeTime(d: Date): string {
        const diff = Math.floor((Date.now() - d.getTime()) / 1000)
        if (Math.abs(diff) < 5) return 'just now'
        const abs = Math.abs(diff)
        const suffix = diff > 0 ? 'ago' : 'from now'
        if (abs < 60) return `${abs}s ${suffix}`
        if (abs < 3600) return `${Math.floor(abs / 60)}m ${suffix}`
        if (abs < 86400) return `${Math.floor(abs / 3600)}h ${suffix}`
        if (abs < 2592000) return `${Math.floor(abs / 86400)}d ${suffix}`
        if (abs < 31536000) return `${Math.floor(abs / 2592000)}mo ${suffix}`
        return `${Math.floor(abs / 31536000)}y ${suffix}`
    }

    const copy = (key: string, value: string) => {
        navigator.clipboard.writeText(value)
        setCopiedKey(key)
        setTimeout(() => setCopiedKey(null), 1500)
    }

    const useNow = () => {
        setTsInput(String(nowSec))
        setDateText('')
    }

    const clearAll = () => {
        setTsInput('')
        setDateText('')
        setDateError('')
    }

    const inputCls = `w-full p-3 rounded-md border font-mono text-[13px] transition-colors duration-150
        focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
        ${isDark ? 'bg-[#12121f] border-[#2a2a45] text-[#c5c5d8] placeholder-[#6b7280]'
            : 'bg-white border-[#d1d5db] text-[#111827] placeholder-[#6b7280]'}`

    const btnSecondary = `px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer border
        ${isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#9595b4] hover:bg-[#252545]'
            : 'bg-white border-[#d1d5db] text-[#374151] font-semibold hover:bg-[#f3f4f6]'}`

    const label = (text: string) => (
        <label className={sectionLabel(isDark)}>
            {text}
        </label>
    )

    return (
        <div className="flex flex-col gap-5 flex-1">
            {/* Live clock banner */}
            <div className={`flex items-center justify-between px-4 py-3 rounded-lg border ${isDark ? 'bg-[#0e0e18] border-[#2a2a45]' : 'bg-[#f3f4f6] border-[#e5e7eb]'}`}>
                <span className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}>Current Time</span>
                <div className="flex items-center gap-6">
                    <span className={`font-mono text-[13px] ${isDark ? 'text-[#c5c5d8]' : 'text-[#111827]'}`}>{new Date(now).toUTCString()}</span>
                    <span className={`font-mono text-[13px] ${isDark ? 'text-[#4f6ef7]' : 'text-[#4f6ef7]'}`}>{nowSec}</span>
                    <button onClick={useNow} className={btnSecondary}>Use Now</button>
                </div>
            </div>

            {/* Inputs */}
            <div className="flex gap-4">
                <div className="flex flex-col flex-1 gap-2">
                    {label('Unix Timestamp')}
                    <input
                        type="number"
                        value={tsInput}
                        onChange={e => { setTsInput(e.target.value); setDateText('') }}
                        placeholder="e.g. 1893456000"
                        className={inputCls}
                    />
                </div>
                <div className={`flex items-center pt-5 font-mono text-lg ${isDark ? 'text-[#2a2a45]' : 'text-[#d1d5db]'}`}>↔</div>
                <div className="flex flex-col flex-1 gap-2">
                    {label('Date & Time')}
                    <input
                        type="text"
                        value={dateText}
                        onChange={e => {
                            const v = e.target.value
                            setDateText(v)
                            setTsInput('')
                            if (v && !v.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?$/)) {
                                setDateError('Format: YYYY-MM-DD or YYYY-MM-DD HH:mm')
                            } else {
                                setDateError('')
                            }
                        }}
                        placeholder="YYYY-MM-DD or YYYY-MM-DD HH:mm"
                        spellCheck={false}
                        className={`${inputCls}${dateError ? (isDark ? ' border-red-700' : ' border-red-400') : ''}`}
                    />
                    {dateError && <span className={`text-[11px] font-mono ${isDark ? 'text-red-400' : 'text-red-600'}`}>{dateError}</span>}
                </div>
                {(tsInput || dateText) && (
                    <div className="flex items-end pb-0.5">
                        <button onClick={clearAll} className={btnSecondary}>Clear</button>
                    </div>
                )}
            </div>

            {/* Formats output */}
            {formats.length > 0 ? (
                <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-[#2a2a45]' : 'border-[#e5e7eb]'}`}>
                    {formats.map(({ key, label: lbl, value }, i) => (
                        <div
                            key={key}
                            className={`flex items-center justify-between px-4 py-3 gap-4
                                ${i % 2 === 0
                                    ? isDark ? 'bg-[#0e0e18]' : 'bg-white'
                                    : isDark ? 'bg-[#12121f]' : 'bg-[#f9fafb]'}
                                ${i < formats.length - 1 ? isDark ? 'border-b border-[#1e1e35]' : 'border-b border-[#e5e7eb]' : ''}`}
                        >
                            <span className={`text-[11px] font-mono font-semibold w-[160px] shrink-0 ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}>
                                {lbl}
                            </span>
                            <span className={`flex-1 font-mono text-[13px] ${isDark ? 'text-[#c5c5d8]' : 'text-[#111827]'}`}>
                                {value}
                            </span>
                            <button
                                onClick={() => copy(key, value)}
                                className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-mono transition-all duration-150 cursor-pointer border
                                    ${copiedKey === key
                                        ? 'bg-[#4f6ef7] border-[#4f6ef7] text-white'
                                        : isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#9595b4] hover:bg-[#252545]'
                                            : 'bg-white border-[#d1d5db] text-[#374151] font-semibold hover:bg-[#f3f4f6]'}`}
                            >
                                {copiedKey === key ? '✓' : 'Copy'}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={`flex-1 flex items-center justify-center rounded-lg border ${isDark ? 'bg-[#0d0d1a] border-[#2a2a45]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
                    <p className={`text-[13px] font-mono ${isDark ? 'text-[#6b7280]' : 'text-[#6b7280]'}`}>
                        Enter a Unix timestamp or Enter a date above
                    </p>
                </div>
            )}
        </div>
    )
}

/* ─── Cron Parser ─────────────────────────────────────────────────────────── */

// ── helpers ──────────────────────────────────────────────────────────────────
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type CronField = { min: number; max: number; names?: string[] }
const FIELDS: CronField[] = [
    { min: 0, max: 59 },           // minute
    { min: 0, max: 23 },           // hour
    { min: 1, max: 31 },           // day-of-month
    { min: 1, max: 12, names: MONTHS_SHORT }, // month
    { min: 0, max: 6, names: DAYS_SHORT },   // day-of-week
]

function expandField(expr: string, field: CronField): number[] | string {
    const { min, max, names } = field
    const all = Array.from({ length: max - min + 1 }, (_, i) => i + min)

    if (expr === '*') return all

    const result: number[] = []
    for (const part of expr.split(',')) {
        // step: */n or start-end/n
        const stepMatch = part.match(/^(\*|\d+(?:-\d+)?)\/(\d+)$/)
        if (stepMatch) {
            const step = parseInt(stepMatch[2])
            if (step === 0) return `Step of 0 is invalid`
            const [rangeStart, rangeEnd] = stepMatch[1] === '*'
                ? [min, max]
                : stepMatch[1].split('-').map(Number)
            for (let v = rangeStart; v <= rangeEnd; v += step) result.push(v)
            continue
        }
        // range: n-m
        const rangeMatch = part.match(/^(\d+)-(\d+)$/)
        if (rangeMatch) {
            const [a, b] = [parseInt(rangeMatch[1]), parseInt(rangeMatch[2])]
            if (a > b) return `Invalid range ${a}-${b}`
            for (let v = a; v <= b; v++) result.push(v)
            continue
        }
        // named month/day
        if (names) {
            const idx = names.findIndex(n => n.toLowerCase() === part.toLowerCase())
            if (idx !== -1) { result.push(idx + min); continue }
        }
        // literal
        const v = parseInt(part)
        if (isNaN(v)) return `Unknown value "${part}"`
        if (v < min || v > max) return `Value ${v} out of range [${min}-${max}]`
        result.push(v)
    }
    return [...new Set(result)].sort((a, b) => a - b)
}

function describeCron(parts: string[]): string {
    const [min, hr, dom, mon, dow] = parts

    const fmtTime = (m: number | number[], h: number | number[]): string => {
        const hh = Array.isArray(h) ? h : [h]
        const mm = Array.isArray(m) ? m : [m]
        return hh.map(h => `${String(h).padStart(2, '0')}:${mm.map(m => String(m).padStart(2, '0')).join(',')}`).join(', ')
    }

    const minuteVals = expandField(min, FIELDS[0])
    const hourVals = expandField(hr, FIELDS[1])
    const domVals = expandField(dom, FIELDS[2])
    const monVals = expandField(mon, FIELDS[3])
    const dowVals = expandField(dow, FIELDS[4])

    if (typeof minuteVals === 'string') return `Error in minute: ${minuteVals}`
    if (typeof hourVals === 'string') return `Error in hour: ${hourVals}`
    if (typeof domVals === 'string') return `Error in day-of-month: ${domVals}`
    if (typeof monVals === 'string') return `Error in month: ${monVals}`
    if (typeof dowVals === 'string') return `Error in day-of-week: ${dowVals}`

    const isEvery = (expr: string) => expr === '*'
    const isStep = (expr: string) => expr.includes('/')

    // minute description
    let minDesc = ''
    if (isEvery(min)) minDesc = 'every minute'
    else if (isStep(min) && min.startsWith('*/')) minDesc = `every ${min.split('/')[1]} minutes`
    else if (minuteVals.length === 1) minDesc = `at minute ${minuteVals[0]}`
    else minDesc = `at minutes ${minuteVals.join(', ')}`

    // hour description
    let hrDesc = ''
    if (isEvery(hr)) hrDesc = ''
    else if (isStep(hr) && hr.startsWith('*/')) hrDesc = ` every ${hr.split('/')[1]} hours`
    else if (hourVals.length === 1) hrDesc = ` at ${fmtTime(minuteVals, hourVals[0])}`
    else hrDesc = ` at ${fmtTime(minuteVals, hourVals)}`

    // month description
    let monDesc = ''
    if (!isEvery(mon)) {
        const names = monVals.map(v => MONTHS_LONG[v - 1])
        monDesc = ` in ${names.join(', ')}`
    }

    // day description
    let dayDesc = ''
    if (!isEvery(dow) && !isEvery(dom)) {
        const dowNames = dowVals.map(v => DAYS_LONG[v])
        dayDesc = ` on day ${domVals.join(', ')} of month or ${dowNames.join(', ')}`
    } else if (!isEvery(dow)) {
        const dowNames = dowVals.map(v => DAYS_LONG[v])
        dayDesc = ` on ${dowNames.join(', ')}`
    } else if (!isEvery(dom)) {
        dayDesc = ` on day ${domVals.join(', ')} of the month`
    }

    return `Runs ${minDesc}${hrDesc}${dayDesc}${monDesc}`
}

function nextExecutions(parts: string[], count = 8): Date[] {
    const minuteVals = expandField(parts[0], FIELDS[0])
    const hourVals = expandField(parts[1], FIELDS[1])
    const domVals = expandField(parts[2], FIELDS[2])
    const monVals = expandField(parts[3], FIELDS[3])
    const dowVals = expandField(parts[4], FIELDS[4])

    if (
        typeof minuteVals === 'string' || typeof hourVals === 'string' ||
        typeof domVals === 'string' || typeof monVals === 'string' ||
        typeof dowVals === 'string'
    ) return []

    const results: Date[] = []
    const cursor = new Date()
    cursor.setSeconds(0, 0)
    cursor.setMinutes(cursor.getMinutes() + 1) // start from next minute

    let safety = 0
    while (results.length < count && safety++ < 527040 /* max 1 year of minutes */) {
        const mo = cursor.getMonth() + 1 // 1-12
        const dom = cursor.getDate()
        const dow = cursor.getDay()
        const hr = cursor.getHours()
        const mn = cursor.getMinutes()

        const domMatch = (parts[2] === '*' && parts[4] === '*')
            ? true
            : (parts[2] !== '*' && parts[4] !== '*')
                ? (domVals.includes(dom) || dowVals.includes(dow))
                : (parts[2] !== '*' ? domVals.includes(dom) : dowVals.includes(dow))

        if (
            monVals.includes(mo) &&
            domMatch &&
            hourVals.includes(hr) &&
            minuteVals.includes(mn)
        ) {
            results.push(new Date(cursor))
        }
        cursor.setMinutes(cursor.getMinutes() + 1)
    }
    return results
}

const CRON_EXAMPLES = [
    { label: 'Every minute', value: '* * * * *' },
    { label: 'Every 5 minutes', value: '*/5 * * * *' },
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Daily at midnight', value: '0 0 * * *' },
    { label: 'Daily at 9 AM', value: '0 9 * * *' },
    { label: 'Every weekday at 9 AM', value: '0 9 * * 1-5' },
    { label: 'Weekly (Sun midnight)', value: '0 0 * * 0' },
    { label: 'Monthly (1st at noon)', value: '0 12 1 * *' },
]

const CronParser: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const [expr, setExpr] = useState('*/5 * * * *')

    const parts = expr.trim().split(/\s+/)
    const isValid = parts.length === 5

    const description = isValid ? describeCron(parts) : null
    const isError = description?.startsWith('Error')
    const nexts = isValid && !isError ? nextExecutions(parts) : []

    const inputCls = `w-full p-3 rounded-md border font-mono text-[15px] tracking-wider transition-colors duration-150
        focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
        ${isDark ? 'bg-[#12121f] border-[#2a2a45] text-[#c5c5d8] placeholder-[#6b7280]'
            : 'bg-white border-[#d1d5db] text-[#111827] placeholder-[#6b7280]'}`

    const fieldNames = ['minute', 'hour', 'day', 'month', 'weekday']

    return (
        <div className="flex flex-col gap-5 flex-1">
            {/* Expression input */}
            <div className="flex flex-col gap-2">
                <label className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${isDark ? 'text-[#d1d5db]' : 'text-[#111827]'}`}>
                    Cron Expression
                </label>
                <input
                    value={expr}
                    onChange={e => setExpr(e.target.value)}
                    placeholder="* * * * *"
                    spellCheck={false}
                    className={inputCls}
                />
                {/* Field labels */}
                <div className="flex px-3 gap-0">
                    {fieldNames.map((name) => (
                        <div key={name} className={`flex-1 text-[10px] font-mono uppercase tracking-widest text-center ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}>
                            {name}
                        </div>
                    ))}
                </div>
            </div>

            {/* Description */}
            {description && (
                <div className={`px-4 py-3 rounded-lg border text-[13px] font-sans ${isError
                        ? isDark ? 'bg-red-950/30 border-red-900/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
                        : isDark ? 'bg-[#0e1e35] border-[#1a3a5e] text-[#93c5fd]' : 'bg-[#eff6ff] border-[#bfdbfe] text-[#1e40af]'
                    }`}>
                    {description}
                </div>
            )}
            {!isValid && expr.trim() && (
                <div className={`px-4 py-3 rounded-lg border text-[13px] font-sans ${isDark ? 'bg-red-950/30 border-red-900/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    A cron expression must have exactly 5 fields (got {parts.length})
                </div>
            )}

            <div className="flex gap-4 flex-1 min-h-0">
                {/* Next executions */}
                {nexts.length > 0 && (
                    <div className="flex flex-col flex-1 gap-2">
                        <label className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${isDark ? 'text-[#d1d5db]' : 'text-[#111827]'}`}>
                            Next {nexts.length} Executions
                        </label>
                        <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-[#2a2a45]' : 'border-[#e5e7eb]'}`}>
                            {nexts.map((d, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center justify-between px-4 py-2.5 gap-4
                                        ${i % 2 === 0
                                            ? isDark ? 'bg-[#0e0e18]' : 'bg-white'
                                            : isDark ? 'bg-[#12121f]' : 'bg-[#f9fafb]'}
                                        ${i < nexts.length - 1 ? isDark ? 'border-b border-[#1e1e35]' : 'border-b border-[#e5e7eb]' : ''}`}
                                >
                                    <span className={`text-[11px] font-mono w-5 shrink-0 ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}>
                                        #{i + 1}
                                    </span>
                                    <span className={`flex-1 font-mono text-[13px] ${isDark ? 'text-[#c5c5d8]' : 'text-[#111827]'}`}>
                                        {d.toLocaleString()}
                                    </span>
                                    <span className={`text-[11px] font-mono ${isDark ? 'text-[#4f6ef7]' : 'text-[#4f6ef7]'}`}>
                                        {d.toISOString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Examples */}
                <div className="flex flex-col gap-2 w-[240px] shrink-0">
                    <label className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${isDark ? 'text-[#d1d5db]' : 'text-[#111827]'}`}>
                        Common Expressions
                    </label>
                    <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-[#2a2a45]' : 'border-[#e5e7eb]'}`}>
                        {CRON_EXAMPLES.map((ex, i) => (
                            <button
                                key={i}
                                onClick={() => setExpr(ex.value)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 gap-3 text-left transition-colors duration-150 cursor-pointer
                                    ${expr === ex.value
                                        ? isDark ? 'bg-[#252545]' : 'bg-[#eff6ff]'
                                        : i % 2 === 0
                                            ? isDark ? 'bg-[#0e0e18] hover:bg-[#1a1a2e]' : 'bg-white hover:bg-[#f3f4f6]'
                                            : isDark ? 'bg-[#12121f] hover:bg-[#1a1a2e]' : 'bg-[#f9fafb] hover:bg-[#f3f4f6]'}
                                    ${i < CRON_EXAMPLES.length - 1 ? isDark ? 'border-b border-[#1e1e35]' : 'border-b border-[#e5e7eb]' : ''}`}
                            >
                                <span className={`text-[12px] font-sans ${isDark ? 'text-[#c5c5d8]' : 'text-[#374151]'}`}>{ex.label}</span>
                                <span className={`text-[11px] font-mono shrink-0 ${expr === ex.value ? 'text-[#4f6ef7]' : isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}>{ex.value}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ─── Main view ───────────────────────────────────────────────────────────── */
export default function TimeSchedule({ isDark }: { isDark: boolean }) {
    const [mode, setMode] = useState<Mode>('timestamp')

    const tabs: { id: Mode; label: string }[] = [
        { id: 'timestamp', label: 'Timestamp' },
        { id: 'cron', label: 'Cron Parser' },
    ]
    const activeIndex = tabs.findIndex(t => t.id === mode)

    return (
        <div className={`flex flex-col min-h-full gap-4 p-6 min-w-[720px] ${isDark ? 'text-[#d1d5db]' : 'text-[#1f2937]'}`}>
            {/* Segmented control */}
            <div className={`relative flex items-center p-1 rounded-xl w-fit
                ${isDark ? 'bg-[#0e0e18]/80 backdrop-blur-xl border border-white/5 shadow-inner'
                    : 'bg-[#e5e7eb]/70 backdrop-blur-xl border border-black/[0.04] shadow-inner'}`}>

                <div
                    className={`absolute top-1 bottom-1 w-[130px] rounded-lg transition-transform duration-300 ease-out ring-1 ring-[#22c55e]/60
                        ${isDark ? 'bg-[#2a2a45] border border-white/10 shadow-sm shadow-[#22c55e]/10' : 'bg-white border border-[#22c55e]/40 shadow-[0_2px_8px_rgba(34,197,94,0.12)]'}`}
                    style={{ transform: `translateX(${activeIndex * 100}%)` }}
                />
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setMode(t.id)}
                        className={`relative z-10 w-[130px] py-1.5 text-[13px] font-semibold font-sans tracking-wide transition-colors duration-300 cursor-pointer text-center
                            ${mode === t.id
                                ? isDark ? 'text-[#4ade80]' : 'text-[#15803d]'
                                : isDark ? 'text-[#6b7280] hover:text-[#9595b4]' : 'text-[#4b5563] hover:text-[#111827]'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {mode === 'timestamp' && <TimestampConverter isDark={isDark} />}
            {mode === 'cron' && <CronParser isDark={isDark} />}
        </div>
    )
}
