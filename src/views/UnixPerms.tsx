import React, { useState, useCallback } from 'react'
import { sectionLabel } from '../utils/styles'

interface UnixPermsProps {
    isDark: boolean
}

type PermissionRole = 'owner' | 'group' | 'public'
type PermissionType = 'read' | 'write' | 'execute'

const ROLES: { id: PermissionRole; label: string }[] = [
    { id: 'owner', label: 'Owner (User)' },
    { id: 'group', label: 'Group' },
    { id: 'public', label: 'Public (Others)' },
]

const PERMS: { id: PermissionType; label: string; value: number; char: string }[] = [
    { id: 'read', label: 'Read', value: 4, char: 'r' },
    { id: 'write', label: 'Write', value: 2, char: 'w' },
    { id: 'execute', label: 'Execute', value: 1, char: 'x' },
]

const EXAMPLES = [
    { label: '644 Standard File', octal: '644' },
    { label: '755 Standard Executable', octal: '755' },
    { label: '600 Private File', octal: '600' },
    { label: '777 Open to All', octal: '777' },
]

export default function UnixPerms({ isDark }: UnixPermsProps) {
    const [perms, setPerms] = useState<Record<PermissionRole, Set<PermissionType>>>({
        owner: new Set(['read', 'write']),
        group: new Set(['read']),
        public: new Set(['read']),
    })
    
    const [octalInput, setOctalInput] = useState('644')
    const [copied, setCopied] = useState(false)

    // Calculate Octal from state
    const calculateOctal = useCallback((state: Record<PermissionRole, Set<PermissionType>>) => {
        return ROLES.map(({ id }) => {
            let sum = 0
            if (state[id].has('read')) sum += 4
            if (state[id].has('write')) sum += 2
            if (state[id].has('execute')) sum += 1
            return sum.toString()
        }).join('')
    }, [])

    // Apply Octal to state
    const applyOctal = useCallback((octalStr: string) => {
        if (!/^[0-7]{3}$/.test(octalStr)) return
        
        const newState = {
            owner: new Set<PermissionType>(),
            group: new Set<PermissionType>(),
            public: new Set<PermissionType>()
        }
        
        const chars = octalStr.split('')
        ROLES.forEach(({ id }, i) => {
            const val = parseInt(chars[i] || '0', 10)
            if (val & 4) newState[id].add('read')
            if (val & 2) newState[id].add('write')
            if (val & 1) newState[id].add('execute')
        })
        
        setPerms(newState)
    }, [])

    // Update state when checkboxes are clicked
    const togglePerm = (role: PermissionRole, perm: PermissionType) => {
        setPerms(prev => {
            const next = { ...prev, [role]: new Set(prev[role]) }
            next[role].has(perm) ? next[role].delete(perm) : next[role].add(perm)
            const newOctal = calculateOctal(next)
            setOctalInput(newOctal)
            return next
        })
    }

    // Handle typing in the Octal field
    const handleOctalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-7]/g, '').slice(0, 3)
        setOctalInput(val)
        if (val.length === 3) {
            applyOctal(val)
        }
    }

    const symbolic = ROLES.map(({ id }) => {
        const r = perms[id].has('read') ? 'r' : '-'
        const w = perms[id].has('write') ? 'w' : '-'
        const x = perms[id].has('execute') ? 'x' : '-'
        return `${r}${w}${x}`
    }).join('')

    const chmodCommand = `chmod ${calculateOctal(perms)} <file>`

    const handleCopy = () => {
        navigator.clipboard.writeText(chmodCommand)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    // Human readable translation
    const describePerms = () => {
        const desc = ROLES.map(({ id, label }) => {
            const p = perms[id]
            if (p.size === 0) return `${label.split(' ')[0]} has no access.`
            if (p.size === 3) return `${label.split(' ')[0]} has full access.`
            
            const actions = []
            if (p.has('read')) actions.push('read')
            if (p.has('write')) actions.push('write')
            if (p.has('execute')) actions.push('execute')
            return `${label.split(' ')[0]} can ${actions.join(' and ')}.`
        })
        return desc.join(' ')
    }

    return (
        <div className={`flex flex-col min-h-full gap-5 p-6 min-w-[720px] ${isDark ? 'text-[#d1d5db]' : 'text-[#1f2937]'}`}>
            
            <div className="flex gap-5 flex-1 min-h-0">
                {/* Left side: Calculator Matrix */}
                <div className="flex flex-col gap-4 flex-[2] min-w-0">
                    <label className={sectionLabel(isDark)}>Permission Matrix</label>
                    
                    <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-[#2a2a45] bg-[#0e0e18]' : 'border-[#e5e7eb] bg-white'}`}>
                        {/* Header */}
                        <div className={`flex items-center px-4 py-3 border-b ${isDark ? 'border-[#1e1e35] bg-[#12121f]' : 'border-[#e5e7eb] bg-[#f9fafb]'}`}>
                            <div className="w-[140px] shrink-0"></div>
                            <div className="flex flex-1 justify-between px-6">
                                {PERMS.map(p => (
                                    <div key={p.id} className={`w-[80px] text-center text-[11px] font-mono font-semibold tracking-widest uppercase ${isDark ? 'text-[#6b7280]' : 'text-[#4b5563]'}`}>
                                        {p.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rows */}
                        <div className="flex flex-col">
                            {ROLES.map((role, i) => (
                                <div key={role.id} className={`flex items-center px-4 py-4
                                    ${i < ROLES.length - 1 ? isDark ? 'border-b border-[#1e1e35]' : 'border-b border-[#e5e7eb]' : ''}
                                    ${isDark ? 'hover:bg-[#1a1a2e]' : 'hover:bg-[#f3f4f6]'} transition-colors duration-150`}>
                                    
                                    <div className="w-[140px] shrink-0 font-medium text-[13px]">
                                        {role.label}
                                    </div>
                                    
                                    <div className="flex flex-1 justify-between px-6">
                                        {PERMS.map(perm => {
                                            const isActive = perms[role.id].has(perm.id)
                                            return (
                                                <div key={perm.id} className="w-[80px] flex justify-center">
                                                    <button
                                                        onClick={() => togglePerm(role.id, perm.id)}
                                                        className={`w-6 h-6 rounded flex items-center justify-center transition-all duration-150 cursor-pointer border
                                                            ${isActive 
                                                                ? 'bg-[#4f6ef7] border-[#4f6ef7] text-white shadow shadow-[#4f6ef730]' 
                                                                : isDark 
                                                                    ? 'bg-[#1e1e35] border-[#2a2a45] hover:border-[#4f6ef7] text-transparent' 
                                                                    : 'bg-white border-[#d1d5db] hover:border-[#4f6ef7] text-transparent'}`}
                                                    >
                                                        {isActive && (
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Presets */}
                    <div className="flex flex-col gap-2 mt-2">
                        <label className={sectionLabel(isDark)}>Quick Examples</label>
                        <div className="flex flex-wrap gap-2">
                            {EXAMPLES.map((ex, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setOctalInput(ex.octal); applyOctal(ex.octal); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer border
                                        ${isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#9595b4] hover:bg-[#252545]' : 'bg-white border-[#d1d5db] text-[#374151] hover:bg-[#f3f4f6]'}`}
                                >
                                    <span className={isDark ? 'text-[#c5c5d8]' : 'text-[#111827]'}>{ex.octal}</span>
                                    <span className="ml-2 opacity-70">{ex.label.split(' ').slice(1).join(' ')}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right side: Outputs */}
                <div className="flex flex-col gap-5 flex-[1] min-w-0">
                    
                    {/* Octal & Symbolic */}
                    <div className="flex flex-col gap-2">
                        <label className={sectionLabel(isDark)}>Octal Output</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={octalInput}
                                onChange={handleOctalChange}
                                maxLength={3}
                                className={`w-[80px] p-3 rounded-xl border text-center font-mono text-2xl tracking-widest font-bold transition-colors duration-150
                                    focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
                                    ${isDark ? 'bg-[#12121f] border-[#2a2a45] text-[#c5c5d8]' : 'bg-white border-[#d1d5db] text-[#111827]'}`}
                            />
                            <div className={`flex-1 p-3 rounded-xl border flex items-center justify-center font-mono text-xl tracking-[0.2em] transition-colors duration-150
                                ${isDark ? 'bg-[#12121f] border-[#2a2a45] text-[#86efac]' : 'bg-[#f0fdf4] border-[#bbf7d0] text-[#16a34a]'}`}>
                                {symbolic}
                            </div>
                        </div>
                    </div>

                    {/* Result Card */}
                    <div className="flex flex-col gap-2 mt-2">
                        <label className={sectionLabel(isDark)}>Command & Translation</label>
                        <div className={`flex flex-col gap-3 rounded-xl border p-4 transition-colors duration-150
                            ${isDark ? 'bg-[#0e0e18] border-[#2a2a45]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
                            
                            <div className={`px-3 py-2.5 rounded-md border font-mono text-[13px] flex items-center justify-between
                                ${isDark ? 'bg-[#12121f] border-[#2a2a45]' : 'bg-white border-[#d1d5db]'}`}>
                                <span className={isDark ? 'text-[#c5c5d8]' : 'text-[#111827]'}>
                                    <span className="text-[#4f6ef7] font-semibold mr-2">chmod</span>
                                    {calculateOctal(perms)} {'<file>'}
                                </span>
                                <button onClick={handleCopy}
                                    className={`px-2.5 py-1 rounded text-[10.5px] font-semibold uppercase tracking-wider transition-colors cursor-pointer border
                                        ${isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#9595b4] hover:bg-[#252545]' : 'bg-[#f3f4f6] border-[#e5e7eb] text-[#4b5563] hover:bg-[#e5e7eb]'}`}>
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>

                            <div className={`text-[12.5px] leading-relaxed p-1 ${isDark ? 'text-[#9ca3af]' : 'text-[#4b5563]'}`}>
                                {describePerms()}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    )
}
