import React, { useState } from 'react'

type Mode = 'cidr' | 'curl' | 'http'

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
                
                <div 
                    className={`absolute top-1 bottom-1 w-[160px] rounded-lg transition-transform duration-300 ease-out
                        ${isDark ? 'bg-[#2a2a45] border border-white/10 shadow-sm' : 'bg-white border border-black/[0.04] shadow-[0_2px_8px_rgba(0,0,0,0.08)]'}`}
                    style={{ transform: `translateX(${activeIndex * 100}%)` }}
                />

                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setMode(t.id)}
                        className={`relative z-10 w-[160px] py-1.5 text-[13px] font-semibold font-sans tracking-wide transition-colors duration-300 cursor-pointer text-center
                            ${mode === t.id
                                ? isDark ? 'text-white' : 'text-gray-900'
                                : isDark ? 'text-[#6b7280] hover:text-[#9595b4]' : 'text-[#4b5563] hover:text-[#111827]'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className={`flex-1 flex flex-col items-center justify-center rounded-md border ${isDark ? 'bg-[#0d0d1a] border-[#2a2a45]' : 'bg-[#f9fafb] border-[#e5e7eb]'}`}>
                <p className={`text-[13px] font-mono ${isDark ? 'text-[#6b7280]' : 'text-[#6b7280]'}`}>
                    {mode === 'cidr' ? 'CIDR Calculator coming soon...' : 
                     mode === 'curl' ? 'cURL Builder coming soon...' : 
                     'HTTP Status Reference coming soon...'}
                </p>
            </div>
        </div>
    )
}
