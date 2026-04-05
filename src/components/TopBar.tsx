import React from 'react'
import type { View } from './Sidebar'

interface TopBarProps {
    activeView: View
    isDark: boolean
}

const viewMeta: Record<View, { title: string; subtitle: string }> = {
    'json-diff': {
        title: 'JSON Diff',
        subtitle: 'Compare and visualize differences between two JSON documents',
    },
    'jwt-decoder': {
        title: 'JWT Decoder',
        subtitle: 'Decode and inspect JSON Web Tokens — header, payload, and signature',
    },
}

const TopBar: React.FC<TopBarProps> = ({ activeView, isDark }) => {
    const meta = viewMeta[activeView]

    return (
        <div
            className={`
        flex items-center px-8 py-5 border-b shrink-0
        ${isDark ? 'border-[#1e1e35]' : 'border-[#e5e7eb]'}
      `}
        >
            <div>
                <h1
                    className={`
            text-xl font-bold tracking-tight font-mono
            ${isDark ? 'text-white' : 'text-[#0f0f1a]'}
          `}
                >
                    {meta.title}
                </h1>
                <p
                    className={`
            text-xs mt-0.5 font-sans
            ${isDark ? 'text-[#4b5563]' : 'text-[#9ca3af]'}
          `}
                >
                    {meta.subtitle}
                </p>
            </div>
        </div>
    )
}

export default TopBar
