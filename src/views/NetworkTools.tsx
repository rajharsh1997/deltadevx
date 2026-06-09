import React, { useState, useMemo } from 'react'

type Mode = 'cidr' | 'curl' | 'http'

/* ─── Shared styles helper ───────────────────────────────────────────────── */
const useStyles = (isDark: boolean) => ({
    inputCls: `w-full p-2.5 rounded-md border font-mono text-[13px] transition-colors duration-150
        focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
        ${isDark ? 'bg-[#12121f] border-[#2a2a45] text-[#c5c5d8] placeholder-[#6b7280]'
            : 'bg-white border-[#d1d5db] text-[#111827] placeholder-[#6b7280]'}`,
    selectCls: `w-full px-2.5 py-2.5 rounded-md border font-mono text-[13px] transition-colors duration-150 cursor-pointer
        focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
        ${isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#9595b4]' : 'bg-white border-[#d1d5db] text-[#111827]'}`,
    label: (text: string) => (
        <label className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${isDark ? 'text-[#6b7280]' : 'text-[#1f2937]'}`}>{text}</label>
    ),
    btnSecondary: `px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer border
        ${isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#9595b4] hover:bg-[#252545]'
            : 'bg-white border-[#d1d5db] text-[#374151] font-semibold hover:bg-[#f3f4f6]'}`,
    card: `rounded-lg border overflow-hidden ${isDark ? 'border-[#2a2a45]' : 'border-[#e5e7eb]'}`,
    row: (i: number, total: number) =>
        `flex items-center justify-between px-4 py-3 gap-4
        ${i % 2 === 0 ? isDark ? 'bg-[#0e0e18]' : 'bg-white' : isDark ? 'bg-[#12121f]' : 'bg-[#f9fafb]'}
        ${i < total - 1 ? isDark ? 'border-b border-[#1e1e35]' : 'border-b border-[#f3f4f6]' : ''}`,
})

/* ─── CIDR Calculator ────────────────────────────────────────────────────── */
function parseCIDR(cidr: string): Record<string, string> | string {
    const m = cidr.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/)
    if (!m) return 'Enter a valid CIDR (e.g. 192.168.1.0/24)'
    const [, a, b, c, d, prefix] = m.map(Number)
    if ([a, b, c, d].some(o => o > 255) || prefix > 32) return 'Invalid IP or prefix length'

    const ip = (a << 24) | (b << 16) | (c << 8) | d
    const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
    const network = (ip & mask) >>> 0
    const broadcast = (network | ~mask) >>> 0
    const firstHost = prefix < 31 ? network + 1 : network
    const lastHost = prefix < 31 ? broadcast - 1 : broadcast
    const hosts = prefix >= 31 ? Math.pow(2, 32 - prefix) : Math.pow(2, 32 - prefix) - 2

    const toIPStr = (n: number) => [(n >> 24) & 255, (n >> 16) & 255, (n >> 8) & 255, n & 255].join('.')
    const toBinary = (n: number) => [(n >> 24) & 255, (n >> 16) & 255, (n >> 8) & 255, n & 255]
        .map(o => o.toString(2).padStart(8, '0')).join('.')

    return {
        'Network Address':   toIPStr(network),
        'Broadcast Address': toIPStr(broadcast),
        'Subnet Mask':       toIPStr(mask),
        'Wildcard Mask':     toIPStr(~mask >>> 0),
        'First Host':        toIPStr(firstHost),
        'Last Host':         toIPStr(lastHost),
        'Usable Hosts':      hosts.toLocaleString(),
        'IP Class':          a < 128 ? 'A' : a < 192 ? 'B' : a < 224 ? 'C' : 'D/E',
        'Network (binary)':  toBinary(network),
        'Mask (binary)':     toBinary(mask),
    }
}

const CIDRCalc: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const [input, setInput] = useState('192.168.1.0/24')
    const [copied, setCopied] = useState<string | null>(null)
    const s = useStyles(isDark)
    const result = useMemo(() => parseCIDR(input), [input])

    const copy = (k: string, v: string) => {
        navigator.clipboard.writeText(v)
        setCopied(k)
        setTimeout(() => setCopied(null), 1500)
    }

    return (
        <div className="flex flex-col gap-4 flex-1">
            <div className="flex flex-col gap-2">
                {s.label('CIDR Notation')}
                <input value={input} onChange={e => setInput(e.target.value)}
                    placeholder="192.168.1.0/24" spellCheck={false} className={s.inputCls} />
            </div>
            {typeof result === 'string' ? (
                <div className={`px-4 py-3 rounded-lg border text-[13px] font-mono
                    ${isDark ? 'bg-red-950/30 border-red-900/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {result}
                </div>
            ) : (
                <div className={s.card}>
                    {Object.entries(result).map(([k, v], i, arr) => (
                        <div key={k} className={s.row(i, arr.length)}>
                            <span className={`text-[11px] font-mono font-semibold w-[180px] shrink-0 ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}>{k}</span>
                            <span className={`flex-1 font-mono text-[13px] ${isDark ? 'text-[#c5c5d8]' : 'text-[#111827]'}`}>{v}</span>
                            <button onClick={() => copy(k, v)}
                                className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-mono border cursor-pointer transition-all
                                    ${copied === k ? 'bg-[#4f6ef7] border-[#4f6ef7] text-white'
                                        : isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#9595b4] hover:bg-[#252545]'
                                                 : 'bg-white border-[#d1d5db] text-[#374151] font-semibold hover:bg-[#f3f4f6]'}`}>
                                {copied === k ? '✓' : 'Copy'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

/* ─── cURL Builder ───────────────────────────────────────────────────────── */
type Header = { id: number; key: string; value: string }
type AuthMode = 'none' | 'bearer' | 'basic'
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

const CurlBuilder: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const [method, setMethod] = useState('GET')
    const [url, setUrl] = useState('https://api.example.com/users')
    const [headers, setHeaders] = useState<Header[]>([{ id: 1, key: 'Content-Type', value: 'application/json' }])
    const [body, setBody] = useState('')
    const [auth, setAuth] = useState<AuthMode>('none')
    const [authVal, setAuthVal] = useState('')
    const [authUser, setAuthUser] = useState('')
    const [copied, setCopied] = useState(false)
    const s = useStyles(isDark)
    let nextId = React.useRef(2)

    const curl = useMemo(() => {
        const parts = [`curl -X ${method}`]
        if (auth === 'bearer' && authVal) parts.push(`  -H "Authorization: Bearer ${authVal}"`)
        if (auth === 'basic' && authUser && authVal) parts.push(`  -H "Authorization: Basic $(echo -n '${authUser}:${authVal}' | base64)"`)
        headers.filter(h => h.key).forEach(h => parts.push(`  -H "${h.key}: ${h.value}"`))
        if (body && ['POST', 'PUT', 'PATCH'].includes(method)) parts.push(`  -d '${body}'`)
        parts.push(`  "${url}"`)
        return parts.join(' \\\n')
    }, [method, url, headers, body, auth, authVal, authUser])

    const addHeader = () => {
        setHeaders(h => [...h, { id: nextId.current++, key: '', value: '' }])
    }
    const updateHeader = (id: number, field: 'key' | 'value', val: string) =>
        setHeaders(h => h.map(hh => hh.id === id ? { ...hh, [field]: val } : hh))
    const removeHeader = (id: number) => setHeaders(h => h.filter(hh => hh.id !== id))

    const copy = () => {
        navigator.clipboard.writeText(curl)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const methodColor: Record<string, string> = {
        GET: 'text-[#34d399]', POST: 'text-[#60a5fa]', PUT: 'text-[#f59e0b]',
        PATCH: 'text-[#a78bfa]', DELETE: 'text-[#f87171]', HEAD: 'text-[#6b7280]', OPTIONS: 'text-[#6b7280]'
    }

    return (
        <div className="flex gap-5 flex-1 min-h-0">
            {/* Left panel */}
            <div className="flex flex-col gap-4 w-[380px] shrink-0 overflow-y-auto pr-1">
                <div className="flex gap-2">
                    <div className="flex flex-col gap-1.5 w-[110px] shrink-0">
                        {s.label('Method')}
                        <select value={method} onChange={e => setMethod(e.target.value)} style={{ colorScheme: isDark ? 'dark' : 'light' }} className={s.selectCls}>
                            {METHODS.map(m => <option key={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                        {s.label('URL')}
                        <input value={url} onChange={e => setUrl(e.target.value)}
                            placeholder="https://..." spellCheck={false} className={s.inputCls} />
                    </div>
                </div>

                {/* Auth */}
                <div className="flex flex-col gap-2">
                    {s.label('Auth')}
                    <select value={auth} onChange={e => setAuth(e.target.value as AuthMode)} style={{ colorScheme: isDark ? 'dark' : 'light' }} className={s.selectCls}>
                        <option value="none">None</option>
                        <option value="bearer">Bearer Token</option>
                        <option value="basic">Basic Auth</option>
                    </select>
                    {auth === 'bearer' && (
                        <input value={authVal} onChange={e => setAuthVal(e.target.value)}
                            placeholder="Token" className={s.inputCls} />
                    )}
                    {auth === 'basic' && (
                        <div className="flex gap-2">
                            <input value={authUser} onChange={e => setAuthUser(e.target.value)}
                                placeholder="Username" className={s.inputCls} />
                            <input value={authVal} onChange={e => setAuthVal(e.target.value)}
                                placeholder="Password" type="password" className={s.inputCls} />
                        </div>
                    )}
                </div>

                {/* Headers */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        {s.label('Headers')}
                        <button onClick={addHeader} className={s.btnSecondary}>+ Add</button>
                    </div>
                    {headers.map(h => (
                        <div key={h.id} className="flex gap-2 items-center">
                            <input value={h.key} onChange={e => updateHeader(h.id, 'key', e.target.value)}
                                placeholder="Key" className={s.inputCls} />
                            <input value={h.value} onChange={e => updateHeader(h.id, 'value', e.target.value)}
                                placeholder="Value" className={s.inputCls} />
                            <button onClick={() => removeHeader(h.id)}
                                className={`shrink-0 px-2 py-2 rounded-md border text-[11px] cursor-pointer transition-all
                                    ${isDark ? 'border-[#2a2a45] text-[#6b7280] hover:text-red-400 hover:border-red-800'
                                             : 'border-[#d1d5db] text-[#6b7280] hover:text-red-600 hover:border-red-300'}`}>✕</button>
                        </div>
                    ))}
                </div>

                {/* Body */}
                {['POST', 'PUT', 'PATCH'].includes(method) && (
                    <div className="flex flex-col gap-2">
                        {s.label('Request Body')}
                        <textarea value={body} onChange={e => setBody(e.target.value)}
                            placeholder='{"key": "value"}' rows={5} spellCheck={false}
                            className={`${s.inputCls} resize-none leading-[1.6]`} />
                    </div>
                )}
            </div>

            {/* Output */}
            <div className="flex flex-col flex-1 gap-2 min-w-0">
                <div className="flex items-center justify-between">
                    {s.label('Generated cURL')}
                    <button onClick={copy} className={s.btnSecondary}>{copied ? '✓ Copied' : 'Copy'}</button>
                </div>
                <div className={`flex-1 rounded-md border overflow-auto ${isDark ? 'bg-[#0d0d1a] border-[#2a2a45]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
                    <pre className="p-4 text-[13px] leading-[1.8] whitespace-pre font-mono">
                        {curl.split('\n').map((line, i) => {
                            const isMeta = line.startsWith('  -')
                            const isUrl  = i === curl.split('\n').length - 1
                            return (
                                <span key={i}>
                                    {i === 0 ? (
                                        <><span className={isDark ? 'text-[#a5b4fc]' : 'text-[#4f46e5]'}>curl</span>
                                        <span className={isDark ? 'text-[#6b7280]' : 'text-[#9ca3af]'}> -X </span>
                                        <span className={methodColor[method] ?? 'text-[#c5c5d8]'}>{method}</span></>
                                    ) : isUrl ? (
                                        <span className={isDark ? 'text-[#34d399]' : 'text-[#059669]'}>{line}</span>
                                    ) : isMeta ? (
                                        <span className={isDark ? 'text-[#c5c5d8]' : 'text-[#374151]'}>{line}</span>
                                    ) : (
                                        <span>{line}</span>
                                    )}
                                    {'\n'}
                                </span>
                            )
                        })}
                    </pre>
                </div>
            </div>
        </div>
    )
}

/* ─── HTTP Status Reference ──────────────────────────────────────────────── */
const HTTP_STATUSES = [
    // 1xx
    { code: 100, name: 'Continue', desc: 'The server has received the request headers and the client should proceed.' },
    { code: 101, name: 'Switching Protocols', desc: 'The requester has asked the server to switch protocols.' },
    { code: 102, name: 'Processing', desc: 'A WebDAV request may contain many sub-requests, this code is a hint.' },
    // 2xx
    { code: 200, name: 'OK', desc: 'Standard response for successful HTTP requests.' },
    { code: 201, name: 'Created', desc: 'The request has been fulfilled, resulting in a new resource being created.' },
    { code: 202, name: 'Accepted', desc: 'The request has been accepted for processing, but the processing is not complete.' },
    { code: 204, name: 'No Content', desc: 'The server successfully processed the request, but is not returning any content.' },
    { code: 206, name: 'Partial Content', desc: 'The server is delivering only part of the resource due to a range header.' },
    // 3xx
    { code: 301, name: 'Moved Permanently', desc: 'This and all future requests should be directed to the given URI.' },
    { code: 302, name: 'Found', desc: 'The resource was found but temporarily resides under a different URI.' },
    { code: 304, name: 'Not Modified', desc: 'Indicates that the resource has not been modified since the version specified.' },
    { code: 307, name: 'Temporary Redirect', desc: 'The request should be repeated with another URI; future requests should still use the original URI.' },
    { code: 308, name: 'Permanent Redirect', desc: 'All future requests should be directed to the given URI.' },
    // 4xx
    { code: 400, name: 'Bad Request', desc: 'The server cannot process the request due to a client error.' },
    { code: 401, name: 'Unauthorized', desc: 'Authentication is required and has failed or has not yet been provided.' },
    { code: 403, name: 'Forbidden', desc: 'The server understood the request but refuses to authorize it.' },
    { code: 404, name: 'Not Found', desc: 'The requested resource could not be found.' },
    { code: 405, name: 'Method Not Allowed', desc: 'A request method is not supported for the requested resource.' },
    { code: 408, name: 'Request Timeout', desc: 'The server timed out waiting for the request.' },
    { code: 409, name: 'Conflict', desc: 'Indicates a request conflict with the current state of the target resource.' },
    { code: 410, name: 'Gone', desc: 'The resource requested was previously in use but is no longer available.' },
    { code: 413, name: 'Payload Too Large', desc: 'The request is larger than the server is willing or able to process.' },
    { code: 422, name: 'Unprocessable Entity', desc: 'The request was well-formed but was unable to be followed due to semantic errors.' },
    { code: 429, name: 'Too Many Requests', desc: 'The user has sent too many requests in a given amount of time.' },
    // 5xx
    { code: 500, name: 'Internal Server Error', desc: 'A generic error message when an unexpected condition was encountered.' },
    { code: 501, name: 'Not Implemented', desc: 'The server does not recognize the request method.' },
    { code: 502, name: 'Bad Gateway', desc: 'The server was acting as a gateway and received an invalid response.' },
    { code: 503, name: 'Service Unavailable', desc: 'The server cannot handle the request — temporarily overloaded or down.' },
    { code: 504, name: 'Gateway Timeout', desc: 'The server was acting as a gateway and did not receive a timely response.' },
]

function statusColor(code: number, isDark: boolean): string {
    if (code < 200) return isDark ? 'text-[#6b7280]  bg-[#1e1e35]' : 'text-[#4b5563]  bg-[#f3f4f6]'
    if (code < 300) return isDark ? 'text-[#34d399]  bg-[#052e16]/50' : 'text-[#065f46]  bg-[#dcfce7]'
    if (code < 400) return isDark ? 'text-[#60a5fa]  bg-[#1e3a5f]/50' : 'text-[#1e40af]  bg-[#dbeafe]'
    if (code < 500) return isDark ? 'text-[#f59e0b]  bg-[#451a03]/50' : 'text-[#92400e]  bg-[#fef3c7]'
    return isDark ? 'text-[#f87171]  bg-[#450a0a]/50' : 'text-[#991b1b]  bg-[#fee2e2]'
}

const HttpStatus: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const [search, setSearch] = useState('')
    const s = useStyles(isDark)

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return HTTP_STATUSES.filter(s =>
            String(s.code).includes(q) || s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)
        )
    }, [search])

    const groups = useMemo(() => {
        const g: Record<string, typeof filtered> = {}
        filtered.forEach(s => {
            const cat = `${Math.floor(s.code / 100)}xx`
            if (!g[cat]) g[cat] = []
            g[cat].push(s)
        })
        return g
    }, [filtered])

    const catLabel: Record<string, string> = {
        '1xx': 'Informational', '2xx': 'Success', '3xx': 'Redirection',
        '4xx': 'Client Errors', '5xx': 'Server Errors'
    }

    return (
        <div className="flex flex-col gap-4 flex-1 min-h-0">
            {s.label('Search')}
            <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by code, name, or description…" className={s.inputCls} />
            <div className="flex flex-col gap-5 overflow-y-auto flex-1 pr-1">
                {Object.entries(groups).map(([cat, statuses]) => (
                    <div key={cat} className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <span className={`text-[11px] font-mono font-bold tracking-widest uppercase ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}>
                                {cat} — {catLabel[cat]}
                            </span>
                            <div className={`flex-1 h-px ${isDark ? 'bg-[#2a2a45]' : 'bg-[#e5e7eb]'}`} />
                        </div>
                        <div className={s.card}>
                            {statuses.map((st, i) => (
                                <div key={st.code} className={s.row(i, statuses.length)}>
                                    <span className={`shrink-0 text-[12px] font-mono font-bold px-2 py-0.5 rounded ${statusColor(st.code, isDark)}`}>
                                        {st.code}
                                    </span>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className={`font-semibold text-[13px] font-sans ${isDark ? 'text-[#c5c5d8]' : 'text-[#111827]'}`}>{st.name}</span>
                                        <span className={`text-[12px] font-sans mt-0.5 ${isDark ? 'text-[#6b7280]' : 'text-[#6b7280]'}`}>{st.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ─── Main view ──────────────────────────────────────────────────────────── */
export default function NetworkTools({ isDark }: { isDark: boolean }) {
    const [mode, setMode] = useState<Mode>('cidr')
    const tabs: { id: Mode; label: string }[] = [
        { id: 'cidr', label: 'CIDR Calculator' },
        { id: 'curl', label: 'cURL Builder' },
        { id: 'http', label: 'HTTP Status' },
    ]
    const activeIndex = tabs.findIndex(t => t.id === mode)

    return (
        <div className={`flex flex-col min-h-full gap-4 p-6 min-w-[900px] ${isDark ? 'text-[#d1d5db]' : 'text-[#1f2937]'}`}>
            <div className={`relative flex items-center p-1 rounded-xl w-fit
                ${isDark ? 'bg-[#0e0e18]/80 backdrop-blur-xl border border-white/5 shadow-inner'
                         : 'bg-[#e5e7eb]/70 backdrop-blur-xl border border-black/[0.04] shadow-inner'}`}>
                <div className={`absolute top-1 bottom-1 w-[160px] rounded-lg transition-transform duration-300 ease-out
                    ${isDark ? 'bg-[#2a2a45] border border-white/10 shadow-sm' : 'bg-white border border-black/[0.04] shadow-[0_2px_8px_rgba(0,0,0,0.08)]'}`}
                    style={{ transform: `translateX(${activeIndex * 100}%)` }} />
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setMode(t.id)}
                        className={`relative z-10 w-[160px] py-1.5 text-[13px] font-semibold font-sans tracking-wide transition-colors duration-300 cursor-pointer text-center
                            ${mode === t.id
                                ? isDark ? 'text-white' : 'text-gray-900'
                                : isDark ? 'text-[#6b7280] hover:text-[#9595b4]' : 'text-[#4b5563] hover:text-[#111827]'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {mode === 'cidr' && <CIDRCalc isDark={isDark} />}
            {mode === 'curl' && <CurlBuilder isDark={isDark} />}
            {mode === 'http' && <HttpStatus isDark={isDark} />}
        </div>
    )
}
