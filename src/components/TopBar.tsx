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
    'text-diff': {
        title: 'Text Diff',
        subtitle: 'Compare two plain-text documents and visualize line-by-line differences',
    },
    'sql-tool': {
        title: 'SQL Tool',
        subtitle: 'Format raw SQL or visually build SELECT queries with a live preview',
    },
    'regex-tester': {
        title: 'Regex Tester',
        subtitle: 'Test regular expressions with live match highlighting and capture group display',
    },
    'token-counter': {
        title: 'Token Counter',
        subtitle: 'Count LLM tokens using cl100k_base encoding with model cost reference',
    },
    'base64': {
        title: 'Base64 Encoder/Decoder',
        subtitle: 'Encode or decode strings and files using Base64',
    },
    'time-schedule': {
        title: 'Time & Schedule',
        subtitle: 'Convert timestamps, parse CRON expressions, and calculate durations',
    },
    'network-tools': {
        title: 'Network Tools',
        subtitle: 'Calculate CIDR subnets, build cURL requests, and lookup HTTP status codes',
    },
    'fake-data': {
        title: 'Fake Data Generator',
        subtitle: 'Generate mock data for testing: JSON, CSV, names, emails, UUIDs, and more',
    },
    'unix-perms': {
        title: 'UNIX Permissions',
        subtitle: 'Calculate file permissions, view symbolic modes, and generate chmod commands',
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
            ${isDark ? 'text-[#6b7280]' : 'text-[#6b7280]'}
          `}
                >
                    {meta.subtitle}
                </p>
            </div>
        </div>
    )
}

export default TopBar
