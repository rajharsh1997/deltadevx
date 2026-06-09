import React, { useState, useCallback, useRef } from 'react'
import { format as sqlFormat } from 'sql-formatter'
import { nlToSQL, type NLResult } from '../utils/nlToSQL'

interface SqlToolProps {
    isDark: boolean
}

type Dialect = 'sql' | 'mysql' | 'postgresql' | 'sqlite' | 'tsql'
type Mode = 'formatter' | 'builder' | 'nl'
type Operator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'IS NULL' | 'IS NOT NULL'
type JoinType = 'INNER JOIN' | 'LEFT JOIN' | 'RIGHT JOIN' | 'FULL JOIN' | 'CROSS JOIN'

interface WhereRow {
    id: number
    field: string
    op: Operator
    value: string
}

interface JoinRow {
    id: number
    type: JoinType
    table: string
    alias: string
    on: string
}

interface Column {
    id: number
    name: string
}

const DIALECTS: { value: Dialect; label: string }[] = [
    { value: 'sql', label: 'Generic SQL' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'sqlite', label: 'SQLite' },
    { value: 'tsql', label: 'T-SQL' },
]

const OPERATORS: Operator[] = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN', 'IS NULL', 'IS NOT NULL']
const JOIN_TYPES: JoinType[] = ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN']

const EXAMPLE_SQL = `SELECT u.id, u.name, u.email, o.total, o.created_at FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.active = 1 AND o.total > 100 ORDER BY o.created_at DESC LIMIT 50;`

/* ─── Formatted SQL Panel ─────────────────────────────────────────────────── */
const SqlDisplay: React.FC<{ sql: string; isDark: boolean }> = ({ sql, isDark }) => (
    <div className={`rounded-md border overflow-auto flex-1 min-h-[200px] ${isDark ? 'bg-[#0d0d1a] border-[#2a2a45]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
        <pre className={`p-4 font-mono text-[13px] leading-[1.7] whitespace-pre ${isDark ? 'text-[#c5c5d8]' : 'text-[#374151]'}`}>
            {sql || <span className={isDark ? 'text-[#3d3d6b]' : 'text-[#d1d5db]'}>Formatted SQL will appear here…</span>}
        </pre>
    </div>
)

/* ─── SQL Keyword Highlight (simple) ─────────────────────────────────────── */
function applyKeywordColor(sql: string, isDark: boolean): React.ReactNode[] {
    const keywords = /\b(SELECT|FROM|WHERE|LEFT|RIGHT|INNER|OUTER|FULL|CROSS|JOIN|ON|AND|OR|NOT|IN|IS|NULL|ORDER BY|GROUP BY|HAVING|LIMIT|OFFSET|INSERT INTO|VALUES|UPDATE|SET|DELETE|AS|DISTINCT|UNIQUE|COUNT|SUM|AVG|MIN|MAX|CASE|WHEN|THEN|ELSE|END|ASC|DESC)\b/gi
    const parts: React.ReactNode[] = []
    let last = 0
    let m: RegExpExecArray | null
    let i = 0
    const reg = new RegExp(keywords.source, 'gi')
    while ((m = reg.exec(sql)) !== null) {
        if (m.index > last) parts.push(<span key={`t${i++}`}>{sql.slice(last, m.index)}</span>)
        parts.push(<span key={`k${i++}`} className={isDark ? 'text-[#4f6ef7] font-semibold' : 'text-[#4338ca] font-semibold'}>{m[0]}</span>)
        last = m.index + m[0].length
    }
    if (last < sql.length) parts.push(<span key="tail">{sql.slice(last)}</span>)
    return parts
}

/* ─── SQL Formatter Panel ─────────────────────────────────────────────────── */
const FormatterPanel: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [dialect, setDialect] = useState<Dialect>('postgresql')
    const [error, setError] = useState('')
    const copyRef = useRef<HTMLButtonElement>(null)

    const handleFormat = useCallback(() => {
        if (!input.trim()) return
        try {
            const formatted = sqlFormat(input, { language: dialect, tabWidth: 2, keywordCase: 'upper' })
            setOutput(formatted)
            setError('')
        } catch (e) {
            setError((e as Error).message)
        }
    }, [input, dialect])

    const handleExample = useCallback(() => {
        setInput(EXAMPLE_SQL)
        setOutput('')
        setError('')
    }, [])

    const handleClear = useCallback(() => {
        setInput('')
        setOutput('')
        setError('')
    }, [])

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(output)
        if (copyRef.current) {
            copyRef.current.textContent = 'Copied!'
            setTimeout(() => { if (copyRef.current) copyRef.current.textContent = 'Copy SQL' }, 1500)
        }
    }, [output])

    const inputCls = `w-full p-3 rounded-md border font-mono text-[13px] leading-[1.6] transition-colors duration-150 resize-none
        focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
        ${isDark ? 'bg-[#12121f] border-[#2a2a45] text-[#c5c5d8] placeholder-[#3d3d6b]'
            : 'bg-white border-[#e5e7eb] text-[#374151] placeholder-[#d1d5db]'}`

    const btnSecondary = isDark
        ? 'bg-[#1e1e35] hover:bg-[#252545] text-[#9595b4] border border-[#2a2a45]'
        : 'bg-white hover:bg-[#f3f4f6] text-[#374151] border border-[#e5e7eb]'

    return (
        <div className="flex flex-col gap-4 flex-1">
            {/* Dialect + actions */}
            <div className="flex items-center gap-3 flex-wrap">
                <select
                    id="sql-dialect-select"
                    value={dialect}
                    onChange={e => setDialect(e.target.value as Dialect)}
                    className={`px-3 py-2 rounded-lg border text-[13px] font-mono transition-colors duration-150 cursor-pointer
                        focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
                        ${isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#9595b4]' : 'bg-white border-[#e5e7eb] text-[#374151]'}`}
                >
                    {DIALECTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                <button id="sql-format-btn" onClick={handleFormat}
                    className="px-5 py-2 rounded-lg text-sm font-semibold font-mono bg-[#4f6ef7] hover:bg-[#3d5ce5] text-white transition-all duration-150 shadow-lg shadow-[#4f6ef730] cursor-pointer">
                    Format SQL
                </button>
                <button id="sql-example-btn" onClick={handleExample} className={`px-4 py-2 rounded-lg text-sm font-medium font-mono transition-all duration-150 cursor-pointer ${btnSecondary}`}>
                    Load Example
                </button>
                <button id="sql-formatter-clear-btn" onClick={handleClear}
                    className={`px-4 py-2 rounded-lg text-sm font-medium font-mono transition-all duration-150 cursor-pointer
                        ${isDark ? 'bg-[#1e1e35] hover:bg-[#252545] text-[#6b7280] border border-[#2a2a45]' : 'bg-white hover:bg-[#f3f4f6] text-[#9ca3af] border border-[#e5e7eb]'}`}>
                    Clear
                </button>
                {output && (
                    <button ref={copyRef} id="sql-copy-btn" onClick={handleCopy} className={`px-4 py-2 rounded-lg text-sm font-medium font-mono transition-all duration-150 cursor-pointer ml-auto ${btnSecondary}`}>
                        Copy SQL
                    </button>
                )}
            </div>

            {error && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-red-900/30 border border-red-800/40 text-red-400 text-xs font-mono">
                    <span className="shrink-0">⚠</span><span>{error}</span>
                </div>
            )}

            <div className="flex gap-4 flex-1">
                <div className="flex flex-col flex-1 min-w-0 gap-2">
                    <label className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}>Raw SQL</label>
                    <textarea id="sql-input" value={input} onChange={e => setInput(e.target.value)}
                        placeholder="Paste your SQL query here…" spellCheck={false}
                        className={`${inputCls} flex-1 min-h-[300px]`} />
                </div>
                <div className="flex flex-col flex-1 min-w-0 gap-2">
                    <label className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}>Formatted Output</label>
                    <SqlDisplay sql={output} isDark={isDark} />
                </div>
            </div>
        </div>
    )
}

/* ─── Visual Builder Panel ────────────────────────────────────────────────── */
let _nextId = 1
const nextId = () => _nextId++

const BuilderPanel: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const [schema, setSchema] = useState('')
    const [table, setTable] = useState('')
    const [columns, setColumns] = useState<Column[]>([{ id: nextId(), name: '*' }])
    const [joins, setJoins] = useState<JoinRow[]>([])
    const [where, setWhere] = useState<WhereRow[]>([])
    const [orderField, setOrderField] = useState('')
    const [orderDir, setOrderDir] = useState<'ASC' | 'DESC'>('DESC')
    const [limit, setLimit] = useState('')
    const [distinct, setDistinct] = useState(false)
    const [groupBy, setGroupBy] = useState('')
    const [having, setHaving] = useState('')
    const [dialect, setDialect] = useState<Dialect>('postgresql')
    const copyRef = useRef<HTMLButtonElement>(null)

    const addColumn = () => setColumns(c => [...c, { id: nextId(), name: '' }])
    const removeColumn = (id: number) => setColumns(c => c.filter(col => col.id !== id))
    const updateColumn = (id: number, name: string) => setColumns(c => c.map(col => col.id === id ? { ...col, name } : col))

    const addJoin = () => setJoins(j => [...j, { id: nextId(), type: 'LEFT JOIN', table: '', alias: '', on: '' }])
    const removeJoin = (id: number) => setJoins(j => j.filter(r => r.id !== id))
    const updateJoin = (id: number, patch: Partial<JoinRow>) =>
        setJoins(j => j.map(r => r.id === id ? { ...r, ...patch } : r))

    const addWhere = () => setWhere(w => [...w, { id: nextId(), field: '', op: '=', value: '' }])
    const removeWhere = (id: number) => setWhere(w => w.filter(r => r.id !== id))
    const updateWhere = (id: number, patch: Partial<WhereRow>) =>
        setWhere(w => w.map(r => r.id === id ? { ...r, ...patch } : r))

    // Build raw SQL
    const rawSQL = (() => {
        if (!table.trim()) return ''

        const tableRef = schema.trim() ? `${schema.trim()}.${table.trim()}` : table.trim()

        let cols = columns.filter(c => c.name.trim()).map(c => c.name.trim()).join(', ') || '*'
        if (distinct) cols = 'DISTINCT ' + cols

        let sql = `SELECT ${cols} FROM ${tableRef}`

        // JOINs
        for (const j of joins) {
            if (j.table.trim() && j.on.trim()) {
                const alias = j.alias.trim() ? ` ${j.alias.trim()}` : ''
                sql += ` ${j.type} ${j.table.trim()}${alias} ON ${j.on.trim()}`
            }
        }

        // WHERE
        const validWhere = where.filter(r => r.field.trim())
        if (validWhere.length > 0) {
            const clauses = validWhere.map(r => {
                if (r.op === 'IS NULL' || r.op === 'IS NOT NULL') return `${r.field.trim()} ${r.op}`
                if (r.op === 'LIKE') return `${r.field.trim()} LIKE '${r.value}'`
                if (r.op === 'IN') return `${r.field.trim()} IN (${r.value.trim()})`
                return `${r.field.trim()} ${r.op} ${r.value.trim() ? isNaN(Number(r.value)) ? `'${r.value}'` : r.value : 'NULL'}`
            })
            sql += ` WHERE ${clauses.join(' AND ')}`
        }

        // GROUP BY
        if (groupBy.trim()) sql += ` GROUP BY ${groupBy.trim()}`
        if (having.trim()) sql += ` HAVING ${having.trim()}`

        // ORDER BY
        if (orderField.trim()) sql += ` ORDER BY ${orderField.trim()} ${orderDir}`
        if (limit.trim() && !isNaN(Number(limit))) sql += ` LIMIT ${limit.trim()}`
        return sql
    })()

    const formattedPreview = (() => {
        if (!rawSQL) return ''
        try { return sqlFormat(rawSQL, { language: dialect, tabWidth: 2, keywordCase: 'upper' }) } catch { return rawSQL }
    })()

    const handleCopy = () => {
        navigator.clipboard.writeText(formattedPreview)
        if (copyRef.current) {
            copyRef.current.textContent = 'Copied!'
            setTimeout(() => { if (copyRef.current) copyRef.current.textContent = 'Copy SQL' }, 1500)
        }
    }

    const inputCls = `px-2.5 py-1.5 rounded-md border font-mono text-[12px] transition-colors duration-150
        focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
        ${isDark ? 'bg-[#12121f] border-[#2a2a45] text-[#c5c5d8] placeholder-[#3d3d6b]'
            : 'bg-white border-[#e5e7eb] text-[#374151] placeholder-[#d1d5db]'}`

    const selectCls = `px-2.5 py-1.5 rounded-md border font-mono text-[12px] transition-colors duration-150 cursor-pointer
        focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
        ${isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#9595b4]' : 'bg-white border-[#e5e7eb] text-[#374151]'}`

    const sectionLabel = `text-[10.5px] font-mono font-semibold tracking-widest uppercase mb-2 ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`
    const addBtn = `px-3 py-1 rounded-md text-[11px] font-mono cursor-pointer transition-all duration-150 border
        ${isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#6b7280] hover:text-[#9595b4]' : 'bg-white border-[#e5e7eb] text-[#9ca3af] hover:text-[#374151]'}`
    const removeBtn = `shrink-0 w-6 h-6 flex items-center justify-center rounded font-bold text-[13px] transition-all cursor-pointer
        ${isDark ? 'text-[#4b5563] hover:text-[#f87171] hover:bg-[#331a1a]' : 'text-[#d1d5db] hover:text-[#dc2626] hover:bg-[#fee2e2]'}`

    return (
        <div className="flex gap-6 flex-1 min-h-0">
            {/* Form */}
            <div className={`flex flex-col gap-5 w-[420px] shrink-0 overflow-y-auto pr-2`}>
                {/* Dialect */}
                <div>
                    <div className={sectionLabel}>Dialect</div>
                    <select id="builder-dialect" value={dialect} onChange={e => setDialect(e.target.value as Dialect)} className={`${selectCls} w-full`}>
                        {DIALECTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                </div>

                {/* Schema + Table */}
                <div>
                    <div className={sectionLabel}>Table</div>
                    <div className="flex gap-2">
                        <input id="builder-schema" type="text" value={schema} onChange={e => setSchema(e.target.value)}
                            placeholder="schema (optional)" className={`${inputCls} w-[120px]`} />
                        <span className={`flex items-center font-mono text-[13px] ${isDark ? 'text-[#4b5563]' : 'text-[#9ca3af]'}`}>.</span>
                        <input id="builder-table" type="text" value={table} onChange={e => setTable(e.target.value)}
                            placeholder="users" className={`${inputCls} flex-1`} />
                    </div>
                </div>

                {/* Columns */}
                <div>
                    <div className={`${sectionLabel} flex items-center justify-between`}>
                        <span>Columns</span>
                        <button id="builder-add-col" onClick={addColumn} className={addBtn}>+ Add</button>
                    </div>
                    <div className="flex flex-col gap-2">
                        {columns.map((col, i) => (
                            <div key={col.id} className="flex items-center gap-2">
                                <input type="text" value={col.name} onChange={e => updateColumn(col.id, e.target.value)}
                                    placeholder={i === 0 ? '* (all)' : 'column_name'}
                                    className={`${inputCls} flex-1`} />
                                {columns.length > 1 && (
                                    <button onClick={() => removeColumn(col.id)} className={removeBtn}>×</button>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* DISTINCT toggle */}
                    <label className={`flex items-center gap-2 mt-2 cursor-pointer ${isDark ? 'text-[#9595b4]' : 'text-[#6b7280]'}`}>
                        <input type="checkbox" checked={distinct} onChange={e => setDistinct(e.target.checked)}
                            className="accent-[#4f6ef7] cursor-pointer" />
                        <span className="text-[11px] font-mono font-semibold tracking-widest uppercase">DISTINCT</span>
                    </label>
                </div>

                {/* JOINs */}
                <div>
                    <div className={`${sectionLabel} flex items-center justify-between`}>
                        <span>JOINs</span>
                        <button id="builder-add-join" onClick={addJoin} className={addBtn}>+ Add</button>
                    </div>
                    {joins.length === 0 && (
                        <p className={`text-[11px] font-mono ${isDark ? 'text-[#3d3d6b]' : 'text-[#d1d5db]'}`}>No JOINs — single-table query</p>
                    )}
                    <div className="flex flex-col gap-2">
                        {joins.map(j => (
                            <div key={j.id} className={`p-2 rounded-md border ${isDark ? 'border-[#2a2a45] bg-[#0d0d1a]/50' : 'border-[#e5e7eb] bg-white/50'}`}>
                                <select value={j.type} onChange={e => updateJoin(j.id, { type: e.target.value as JoinType })} className={`${selectCls} w-full mb-1.5`}>
                                    {JOIN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <input type="text" value={j.table} onChange={e => updateJoin(j.id, { table: e.target.value })}
                                        placeholder="table" className={`${inputCls} flex-1`} />
                                    <span className={`text-[10px] font-mono ${isDark ? 'text-[#4b5563]' : 'text-[#9ca3af]'}`}>AS</span>
                                    <input type="text" value={j.alias} onChange={e => updateJoin(j.id, { alias: e.target.value })}
                                        placeholder="alias" className={`${inputCls} w-[70px]`} />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className={`text-[10px] font-mono ${isDark ? 'text-[#4b5563]' : 'text-[#9ca3af]'}`}>ON</span>
                                    <input type="text" value={j.on} onChange={e => updateJoin(j.id, { on: e.target.value })}
                                        placeholder="u.id = o.user_id" className={`${inputCls} flex-1`} />
                                    <button onClick={() => removeJoin(j.id)} className={removeBtn}>×</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* WHERE */}
                <div>
                    <div className={`${sectionLabel} flex items-center justify-between`}>
                        <span>WHERE Conditions</span>
                        <button id="builder-add-where" onClick={addWhere} className={addBtn}>+ Add</button>
                    </div>
                    {where.length === 0 && (
                        <p className={`text-[11px] font-mono ${isDark ? 'text-[#3d3d6b]' : 'text-[#d1d5db]'}`}>No conditions — all rows returned</p>
                    )}
                    <div className="flex flex-col gap-2">
                        {where.map(r => (
                            <div key={r.id} className="flex items-center gap-1.5 flex-wrap">
                                <input type="text" value={r.field} onChange={e => updateWhere(r.id, { field: e.target.value })}
                                    placeholder="field" className={`${inputCls} w-[90px]`} />
                                <select value={r.op} onChange={e => updateWhere(r.id, { op: e.target.value as Operator })} className={`${selectCls} flex-1`}>
                                    {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                                {r.op !== 'IS NULL' && r.op !== 'IS NOT NULL' && (
                                    <input type="text" value={r.value} onChange={e => updateWhere(r.id, { value: e.target.value })}
                                        placeholder="value" className={`${inputCls} w-[90px]`} />
                                )}
                                <button onClick={() => removeWhere(r.id)} className={removeBtn}>×</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* GROUP BY + HAVING */}
                <div>
                    <div className={sectionLabel}>GROUP BY</div>
                    <input id="builder-group-by" type="text" value={groupBy} onChange={e => setGroupBy(e.target.value)}
                        placeholder="category_id, status" className={`${inputCls} w-full`} />
                    {groupBy.trim() && (
                        <>
                            <div className={`${sectionLabel} mt-3`}>HAVING</div>
                            <input id="builder-having" type="text" value={having} onChange={e => setHaving(e.target.value)}
                                placeholder="COUNT(*) > 5" className={`${inputCls} w-full`} />
                        </>
                    )}
                </div>

                {/* ORDER BY */}
                <div>
                    <div className={sectionLabel}>ORDER BY</div>
                    <div className="flex gap-2">
                        <input id="builder-order-field" type="text" value={orderField} onChange={e => setOrderField(e.target.value)}
                            placeholder="created_at" className={`${inputCls} flex-1`} />
                        <select id="builder-order-dir" value={orderDir} onChange={e => setOrderDir(e.target.value as 'ASC' | 'DESC')} className={selectCls}>
                            <option value="DESC">DESC</option>
                            <option value="ASC">ASC</option>
                        </select>
                    </div>
                </div>

                {/* LIMIT */}
                <div>
                    <div className={sectionLabel}>LIMIT</div>
                    <input id="builder-limit" type="number" min="1" value={limit} onChange={e => setLimit(e.target.value)}
                        placeholder="100" className={`${inputCls} w-full`} />
                </div>
            </div>

            {/* Preview */}
            <div className="flex flex-col flex-1 min-w-0 gap-2">
                <div className="flex items-center justify-between">
                    <label className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}>
                        SQL Preview
                    </label>
                    {formattedPreview && (
                        <button ref={copyRef} id="builder-copy-btn" onClick={handleCopy}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer border
                                ${isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#9595b4] hover:bg-[#252545]' : 'bg-white border-[#e5e7eb] text-[#374151] hover:bg-[#f3f4f6]'}`}>
                            Copy SQL
                        </button>
                    )}
                </div>
                <div className={`flex-1 rounded-md border overflow-auto ${isDark ? 'bg-[#0d0d1a] border-[#2a2a45]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
                    <pre className={`p-4 font-mono text-[13px] leading-[1.7] whitespace-pre`}>
                        {formattedPreview
                            ? applyKeywordColor(formattedPreview, isDark)
                            : <span className={isDark ? 'text-[#3d3d6b]' : 'text-[#d1d5db]'}>Fill in a table name to start building your query…</span>}
                    </pre>
                </div>
            </div>
        </div>
    )
}

/* ─── Natural Language Panel ──────────────────────────────────────────────── */
const NLPanel: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const [input, setInput] = useState('')
    const [result, setResult] = useState<NLResult | null>(null)
    const [copied, setCopied] = useState(false)

    const handleTranslate = useCallback(() => {
        if (!input.trim()) return
        const res = nlToSQL(input)
        setResult(res)
    }, [input])

    const handleClear = useCallback(() => {
        setInput('')
        setResult(null)
    }, [])

    const handleCopy = useCallback(() => {
        if (!result?.sql) return
        navigator.clipboard.writeText(result.sql)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }, [result])

    // Example NL queries
    const examples = [
        'Show all users',
        'Get top 10 orders by total desc',
        'Count users by status where active is true',
        'List name email from orders where total > 100 order by created_at desc limit 20',
        'Find customers in New York with 5 recent orders',
        'Show distinct cities from users table',
    ]

    const loadExample = (ex: string) => {
        setInput(ex)
        setResult(null)
    }

    const inputCls = `w-full p-3 rounded-md border font-mono text-[13px] leading-[1.6] transition-colors duration-150 resize-none
        focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
        ${isDark ? 'bg-[#12121f] border-[#2a2a45] text-[#c5c5d8] placeholder-[#3d3d6b]'
            : 'bg-white border-[#e5e7eb] text-[#374151] placeholder-[#d1d5db]'}`

    const btnSecondary = isDark
        ? 'bg-[#1e1e35] hover:bg-[#252545] text-[#9595b4] border border-[#2a2a45]'
        : 'bg-white hover:bg-[#f3f4f6] text-[#374151] border border-[#e5e7eb]'

    const confidenceColor = (c: string) => {
        if (c === 'high') return 'text-green-400'
        if (c === 'medium') return 'text-yellow-400'
        return 'text-red-400'
    }

    return (
        <div className="flex flex-col gap-4 flex-1">
            {/* Examples */}
            <div className={`flex flex-wrap gap-1.5`}>
                {examples.map((ex, i) => (
                    <button key={i} onClick={() => loadExample(ex)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all duration-150 cursor-pointer border
                            ${isDark ? 'bg-[#12121f] border-[#2a2a45] text-[#6b7280] hover:text-[#9595b4] hover:border-[#4f6ef7]'
                                : 'bg-white border-[#e5e7eb] text-[#9ca3af] hover:text-[#374151] hover:border-[#4f6ef7]'}`}>
                        {ex}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div className="flex gap-4 flex-1">
                <div className="flex flex-col flex-1 min-w-0 gap-2">
                    <label className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}>
                        Describe your query in plain English
                    </label>
                    <textarea id="nl-input" value={input} onChange={e => setInput(e.target.value)}
                        placeholder='e.g. "Show me all users who signed up last month ordered by date"'
                        spellCheck={false}
                        className={`${inputCls} flex-1 min-h-[250px]`} />
                    <div className="flex items-center gap-3">
                        <button id="nl-translate-btn" onClick={handleTranslate}
                            className="px-5 py-2 rounded-lg text-sm font-semibold font-mono bg-[#4f6ef7] hover:bg-[#3d5ce5] text-white transition-all duration-150 shadow-lg shadow-[#4f6ef730] cursor-pointer">
                            Generate SQL
                        </button>
                        <button id="nl-clear-btn" onClick={handleClear} className={`px-4 py-2 rounded-lg text-sm font-medium font-mono transition-all duration-150 cursor-pointer ${btnSecondary}`}>
                            Clear
                        </button>
                    </div>
                </div>

                {/* Result */}
                <div className="flex flex-col flex-1 min-w-0 gap-2">
                    <div className="flex items-center justify-between">
                        <label className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}>
                            Generated SQL
                        </label>
                        {result?.sql && (
                            <button id="nl-copy-btn" onClick={handleCopy}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer border
                                    ${isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#9595b4] hover:bg-[#252545]' : 'bg-white border-[#e5e7eb] text-[#374151] hover:bg-[#f3f4f6]'}`}>
                                {copied ? 'Copied!' : 'Copy SQL'}
                            </button>
                        )}
                    </div>
                    {result ? (
                        <div className="flex flex-col gap-3 flex-1">
                            <div className={`flex-1 rounded-md border overflow-auto ${isDark ? 'bg-[#0d0d1a] border-[#2a2a45]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
                                <pre className={`p-4 font-mono text-[13px] leading-[1.7] whitespace-pre`}>
                                    {applyKeywordColor(result.sql, isDark)}
                                </pre>
                            </div>
                            {/* Confidence & notes */}
                            <div className="flex items-center gap-3">
                                <span className={`text-[11px] font-mono font-semibold ${confidenceColor(result.confidence)}`}>
                                    ● {result.confidence.toUpperCase()} confidence
                                </span>
                            </div>
                            {result.notes.length > 0 && (
                                <div className={`p-3 rounded-md border text-[12px] font-mono leading-[1.6] ${isDark ? 'bg-[#12121f] border-[#2a2a45] text-[#9595b4]' : 'bg-[#f9fafb] border-[#e5e7eb] text-[#6b7280]'}`}>
                                    {result.notes.map((n, i) => <div key={i}>• {n}</div>)}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={`flex-1 rounded-md border overflow-auto flex items-center justify-center ${isDark ? 'bg-[#0d0d1a] border-[#2a2a45]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
                            <p className={`text-[13px] font-mono ${isDark ? 'text-[#3d3d6b]' : 'text-[#d1d5db]'}`}>
                                Type a description above and click "Generate SQL"
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ─── Main View ───────────────────────────────────────────────────────────── */
const SqlTool: React.FC<SqlToolProps> = ({ isDark }) => {
    const [mode, setMode] = useState<Mode>('formatter')

    const tabBtn = (m: Mode, label: string) => (
        <button
            id={`sql-tab-${m}`}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-mono font-medium transition-all duration-150 cursor-pointer
                ${mode === m
                    ? 'bg-[#4f6ef7] text-white shadow shadow-[#4f6ef730]'
                    : isDark ? 'text-[#6b7280] hover:text-[#9595b4]' : 'text-[#9ca3af] hover:text-[#374151]'}`}
        >
            {label}
        </button>
    )

    return (
        <div className="flex flex-col min-h-full gap-4 p-6 min-w-[900px] text-[#d1d5db]">
            {/* Mode tabs */}
            <div className={`flex items-center gap-1 p-1 rounded-xl w-fit ${isDark ? 'bg-[#0e0e18]' : 'bg-[#f3f4f6]'}`}>
                {tabBtn('formatter', 'SQL Formatter')}
                {tabBtn('builder', 'Visual Builder')}
                {tabBtn('nl', 'Natural Language')}
            </div>

            {mode === 'formatter' && <FormatterPanel isDark={isDark} />}
            {mode === 'builder' && <BuilderPanel isDark={isDark} />}
            {mode === 'nl' && <NLPanel isDark={isDark} />}
        </div>
    )
}

export default SqlTool
