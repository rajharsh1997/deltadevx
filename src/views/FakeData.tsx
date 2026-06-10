import { useState, useRef } from 'react'

/* ─── Random Data Tables ─────────────────────────────────────────────────── */
const FIRST = ['Alice','Bob','Carlos','Diana','Ethan','Fiona','George','Hannah','Ivan','Julia','Kevin','Laura','Miguel','Nina','Oscar','Paula','Quinn','Rachel','Sam','Tina','Uma','Victor','Wendy','Xander','Yara','Zach']
const LAST  = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Martinez','Wilson','Anderson','Taylor','Thomas','Moore','Jackson','White','Harris','Martin','Thompson','Lee','Walker','Hall','Allen','Young','King']
const DOMAINS = ['gmail.com','yahoo.com','outlook.com','icloud.com','proton.me','example.com','dev.io']
const COMPANIES = ['Acme Corp','Blue Horizon','ClearPath','DataBridge','EchoWave','FluxTech','Gridline','Helix','IronSoft','Jumpstart','Keystone','Luminary','NexGen','Opaque','Pinnacle']
const CITIES = ['New York','London','Tokyo','Berlin','Paris','Sydney','Toronto','Mumbai','Singapore','Dubai','São Paulo','Seoul','Amsterdam','Stockholm','Oslo']
const COUNTRIES = ['USA','UK','Japan','Germany','France','Australia','Canada','India','Singapore','UAE','Brazil','South Korea','Netherlands','Sweden','Norway']
const STATUSES = ['active','inactive','pending','suspended','verified']
const LOREM = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'.split(' ')

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const pad = (n: number) => String(n).padStart(2, '0')
const randDate = () => {
    const y = randInt(2018, 2025), m = randInt(1, 12), d = randInt(1, 28)
    return `${y}-${pad(m)}-${pad(d)}`
}
const randPhone = () => `+1-${randInt(200,999)}-${randInt(100,999)}-${randInt(1000,9999)}`
const randUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
})
const randIP = () => Array.from({ length: 4 }, () => randInt(1, 254)).join('.')
const randLorem = (words: number) => Array.from({ length: words }, () => pick(LOREM)).join(' ')

type FieldType = 'id'|'uuid'|'first_name'|'last_name'|'full_name'|'email'|'phone'|'company'|'city'|'country'|'status'|'date'|'age'|'salary'|'ip'|'bio'

const FIELD_OPTIONS: { value: FieldType; label: string }[] = [
    { value: 'id',         label: 'ID (number)' },
    { value: 'uuid',       label: 'UUID' },
    { value: 'first_name', label: 'First Name' },
    { value: 'last_name',  label: 'Last Name' },
    { value: 'full_name',  label: 'Full Name' },
    { value: 'email',      label: 'Email' },
    { value: 'phone',      label: 'Phone' },
    { value: 'company',    label: 'Company' },
    { value: 'city',       label: 'City' },
    { value: 'country',    label: 'Country' },
    { value: 'status',     label: 'Status' },
    { value: 'date',       label: 'Date' },
    { value: 'age',        label: 'Age' },
    { value: 'salary',     label: 'Salary' },
    { value: 'ip',         label: 'IP Address' },
    { value: 'bio',        label: 'Bio (lorem)' },
]

function generateValue(type: FieldType, idx: number): string | number {
    switch (type) {
        case 'id':         return idx + 1
        case 'uuid':       return randUUID()
        case 'first_name': return pick(FIRST)
        case 'last_name':  return pick(LAST)
        case 'full_name':  return `${pick(FIRST)} ${pick(LAST)}`
        case 'email': { const f = pick(FIRST).toLowerCase(), l = pick(LAST).toLowerCase(); return `${f}.${l}@${pick(DOMAINS)}` }
        case 'phone':      return randPhone()
        case 'company':    return pick(COMPANIES)
        case 'city':       return pick(CITIES)
        case 'country':    return pick(COUNTRIES)
        case 'status':     return pick(STATUSES)
        case 'date':       return randDate()
        case 'age':        return randInt(18, 65)
        case 'salary':     return randInt(40, 200) * 1000
        case 'ip':         return randIP()
        case 'bio':        return randLorem(randInt(8, 16))
    }
}

function generateJSON(fields: Field[], rows: number): string {
    const data = Array.from({ length: rows }, (_, i) => {
        const obj: Record<string, string | number> = {}
        fields.forEach(f => { obj[f.name || f.type] = generateValue(f.type, i) })
        return obj
    })
    return JSON.stringify(data, null, 2)
}

function generateCSV(fields: Field[], rows: number): string {
    const headers = fields.map(f => f.name || f.type).join(',')
    const rowLines = Array.from({ length: rows }, (_, i) =>
        fields.map(f => {
            const v = generateValue(f.type, i)
            const s = String(v)
            return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
        }).join(',')
    )
    return [headers, ...rowLines].join('\n')
}

/* ─── Component ──────────────────────────────────────────────────────────── */
type Field = { id: number; type: FieldType; name: string }
type Format = 'json' | 'csv'

export default function FakeData({ isDark }: { isDark: boolean }) {
    const [fields, setFields] = useState<Field[]>([
        { id: 1, type: 'id',        name: 'id' },
        { id: 2, type: 'full_name', name: 'name' },
        { id: 3, type: 'email',     name: 'email' },
        { id: 4, type: 'company',   name: 'company' },
    ])
    const [rows, setRows]     = useState(10)
    const [format, setFormat] = useState<Format>('json')
    const [output, setOutput] = useState('')
    const [copied, setCopied] = useState(false)
    const nextId = useRef(5)

    const addField = () => {
        setFields(f => [...f, { id: nextId.current++, type: 'full_name', name: '' }])
    }
    const updateField = (id: number, key: 'type' | 'name', val: string) =>
        setFields(f => f.map(ff => ff.id === id
            ? { ...ff, [key]: val, ...(key === 'type' && !ff.name ? { name: val } : {}) }
            : ff))
    const removeField = (id: number) => setFields(f => f.filter(ff => ff.id !== id))

    const generate = () => {
        const n = Math.max(1, Math.min(rows, 1000))
        setOutput(format === 'json' ? generateJSON(fields, n) : generateCSV(fields, n))
    }

    const copyOutput = () => {
        if (!output) return
        navigator.clipboard.writeText(output)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const download = () => {
        if (!output) return
        const blob = new Blob([output], { type: format === 'json' ? 'application/json' : 'text/csv' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `fake-data.${format}`
        a.click()
    }

    const inputCls = `w-full p-2.5 rounded-md border font-mono text-[13px] transition-colors duration-150
        focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
        ${isDark ? 'bg-[#12121f] border-[#2a2a45] text-[#c5c5d8] placeholder-[#6b7280]'
            : 'bg-white border-[#d1d5db] text-[#111827] placeholder-[#6b7280]'}`

    const selectCls = `px-2.5 py-2 rounded-md border font-mono text-[13px] transition-colors duration-150 cursor-pointer
        focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
        ${isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#9595b4]' : 'bg-white border-[#d1d5db] text-[#111827]'}`

    const labelCls = `text-[11px] font-mono font-semibold tracking-widest uppercase ${isDark ? 'text-[#6b7280]' : 'text-[#1f2937]'}`

    const btnSecondary = `px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer border
        ${isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#9595b4] hover:bg-[#252545]'
            : 'bg-white border-[#d1d5db] text-[#374151] font-semibold hover:bg-[#f3f4f6]'}`

    return (
        <div className={`flex gap-6 min-h-full p-6 min-w-[900px] ${isDark ? 'text-[#d1d5db]' : 'text-[#1f2937]'}`}>
            {/* Left: Config */}
            <div className="w-[340px] shrink-0 flex flex-col gap-4 overflow-y-auto pr-2">
                {/* Format + Rows */}
                <div className="flex gap-3">
                    <div className="flex flex-col gap-1.5 flex-1">
                        <label className={labelCls}>Format</label>
                        <select value={format} onChange={e => setFormat(e.target.value as Format)}
                            style={{ colorScheme: isDark ? 'dark' : 'light' }}
                            className={`${selectCls} w-full`}>
                            <option value="json">JSON</option>
                            <option value="csv">CSV</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5 w-[90px]">
                        <label className={labelCls}>Rows</label>
                        <input type="number" min={1} max={1000} value={rows}
                            onChange={e => setRows(Number(e.target.value))}
                            className={inputCls} />
                    </div>
                </div>

                {/* Fields */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className={labelCls}>Fields</label>
                        <button onClick={addField} className={btnSecondary}>+ Add Field</button>
                    </div>
                    {fields.map(f => (
                        <div key={f.id} className="flex gap-2 items-center">
                            <select value={f.type}
                                onChange={e => updateField(f.id, 'type', e.target.value)}
                                style={{ colorScheme: isDark ? 'dark' : 'light' }}
                                className={`${selectCls} flex-1`}>
                                {FIELD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <input value={f.name}
                                onChange={e => updateField(f.id, 'name', e.target.value)}
                                placeholder="key name"
                                className={`${inputCls} w-[100px]`} />
                            <button onClick={() => removeField(f.id)}
                                className={`shrink-0 px-2 py-2 rounded-md border text-[11px] cursor-pointer transition-all
                                    ${isDark ? 'border-[#2a2a45] text-[#6b7280] hover:text-red-400 hover:border-red-800'
                                             : 'border-[#d1d5db] text-[#6b7280] hover:text-red-600 hover:border-red-300'}`}>✕</button>
                        </div>
                    ))}
                </div>

                {/* Generate button */}
                <button onClick={generate}
                    className="w-full px-5 py-2.5 rounded-lg text-sm font-semibold font-mono bg-[#4f6ef7] hover:bg-[#3d5ce5] text-white transition-all duration-150 shadow-lg shadow-[#4f6ef730] cursor-pointer">
                    Generate {rows} Rows
                </button>
            </div>

            {/* Right: Output */}
            <div className="flex flex-col flex-1 gap-2 min-w-0">
                <div className="flex items-center justify-between">
                    <label className={labelCls}>Output</label>
                    {output && (
                        <div className="flex gap-2">
                            <button onClick={copyOutput} className={btnSecondary}>{copied ? '✓ Copied' : 'Copy'}</button>
                            <button onClick={download} className={btnSecondary}>Download .{format}</button>
                        </div>
                    )}
                </div>
                <div className={`flex-1 rounded-md border overflow-auto ${isDark ? 'bg-[#0d0d1a] border-[#2a2a45]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
                    {output ? (
                        <pre className={`p-4 font-mono text-[12px] leading-[1.6] whitespace-pre ${isDark ? 'text-[#c5c5d8]' : 'text-[#111827]'}`}>
                            {output}
                        </pre>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[200px]">
                            <p className={`text-[13px] font-mono ${isDark ? 'text-[#6b7280]' : 'text-[#6b7280]'}`}>
                                Configure fields and click Generate
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
