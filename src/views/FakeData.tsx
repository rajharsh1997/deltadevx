import React, { useState } from 'react'

export default function FakeData({ isDark }: { isDark: boolean }) {
    const [rows, setRows] = useState('10')
    const [format, setFormat] = useState('json')

    const inputCls = `w-full p-2.5 rounded-md border font-mono text-[13px] transition-colors duration-150
        focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
        ${isDark ? 'bg-[#12121f] border-[#2a2a45] text-[#c5c5d8] placeholder-[#6b7280]'
            : 'bg-white border-[#d1d5db] text-[#111827] placeholder-[#6b7280]'}`

    const selectCls = `w-full px-2.5 py-2.5 rounded-md border font-mono text-[13px] transition-colors duration-150 cursor-pointer
        focus:outline-none focus:ring-1 focus:ring-[#4f6ef7]
        ${isDark ? 'bg-[#1e1e35] border-[#2a2a45] text-[#9595b4]' : 'bg-white border-[#d1d5db] text-[#111827]'}`

    return (
        <div className={`flex gap-6 min-h-full p-6 min-w-[720px] ${isDark ? 'text-[#d1d5db]' : 'text-[#1f2937]'}`}>
            <div className="w-[300px] shrink-0 flex flex-col gap-5 overflow-y-auto pr-2">
                <div>
                    <label className={`text-[11px] font-mono font-semibold tracking-widest uppercase mb-2 block ${isDark ? 'text-[#6b7280]' : 'text-[#1f2937]'}`}>Format</label>
                    <select value={format} onChange={e => setFormat(e.target.value)} className={selectCls}>
                        <option value="json">JSON</option>
                        <option value="csv">CSV</option>
                        <option value="sql">SQL Insert</option>
                    </select>
                </div>
                <div>
                    <label className={`text-[11px] font-mono font-semibold tracking-widest uppercase mb-2 block ${isDark ? 'text-[#6b7280]' : 'text-[#1f2937]'}`}>Rows</label>
                    <input type="number" min="1" max="1000" value={rows} onChange={e => setRows(e.target.value)} className={inputCls} />
                </div>
                <div>
                    <button className="w-full px-5 py-2.5 rounded-lg text-sm font-semibold font-mono bg-[#4f6ef7] hover:bg-[#3d5ce5] text-white transition-all duration-150 shadow-lg shadow-[#4f6ef730] cursor-pointer">
                        Generate Data
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-2 min-w-0">
                <label className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${isDark ? 'text-[#6b7280]' : 'text-[#1f2937]'}`}>Output</label>
                <div className={`flex-1 rounded-md border flex items-center justify-center ${isDark ? 'bg-[#0d0d1a] border-[#2a2a45]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
                    <p className={`text-[13px] font-mono ${isDark ? 'text-[#6b7280]' : 'text-[#6b7280]'}`}>
                        Fake Data Generator coming soon...
                    </p>
                </div>
            </div>
        </div>
    )
}
