import React from 'react'
import logoUrl from '../assets/logo.png'
export type View = 'json-diff' | 'jwt-decoder' | 'text-diff' | 'sql-tool' | 'regex-tester' | 'token-counter' | 'base64' | 'time-schedule' | 'network-tools' | 'fake-data' | 'unix-perms'

interface SidebarProps {
    activeView: View
    onViewChange: (view: View) => void
    isDark: boolean
    onToggleTheme: () => void
}

const JsonDiffIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M7 5l-5 7 5 7" />
        <path d="M17 5l5 7-5 7" />
        <line x1="11" y1="3" x2="13" y2="21" />
    </svg>
)

const JwtIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
    </svg>
)

const TextDiffIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16M4 12h8M4 18h12" />
        <path d="M15 15l4 4m0-4l-4 4" />
    </svg>
)

const SqlIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
    </svg>
)

const RegexIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2" />
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
)

const TokenIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
    </svg>
)


const Base64Icon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
        <path d="M14 2v6h6" />
        <path d="M2 15h10" />
        <path d="M6 11v8" />
    </svg>
)

const TimeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
)

const NetworkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
)

const FakeDataIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <circle cx="15.5" cy="15.5" r="1.5" />
    </svg>
)

const UnixIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
)

const SunIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
)

const MoonIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
)

const navItems: { id: View; label: string; Icon: React.FC }[] = [
    { id: 'json-diff', label: 'JSON Diff', Icon: JsonDiffIcon },
    { id: 'jwt-decoder', label: 'JWT Decoder', Icon: JwtIcon },
    { id: 'text-diff', label: 'Text Diff', Icon: TextDiffIcon },
    { id: 'sql-tool', label: 'SQL Tool', Icon: SqlIcon },
    { id: 'regex-tester', label: 'RegEx', Icon: RegexIcon },
    { id: 'token-counter', label: 'Tokens', Icon: TokenIcon },
    { id: 'base64', label: 'Base64', Icon: Base64Icon },
    { id: 'time-schedule', label: 'Time & Cron', Icon: TimeIcon },
    { id: 'network-tools', label: 'Network', Icon: NetworkIcon },
    { id: 'fake-data', label: 'Fake Data', Icon: FakeDataIcon },
    { id: 'unix-perms', label: 'UNIX Perms', Icon: UnixIcon },
]

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isDark, onToggleTheme }) => {
    return (
        <aside
            className={`
        flex flex-col w-[170px] min-w-[170px] h-full
        border-r
        ${isDark
                    ? 'bg-[#0c0c18] border-[#1e1e35]'
                    : 'bg-[#f3f4f6] border-[#e5e7eb]'
                }
        transition-colors duration-200
      `}
        >
            {/* App name */}
            <div
                className={`
          px-5 pt-6 pb-4
          border-b
          ${isDark ? 'border-[#1e1e35]' : 'border-[#e5e7eb]'}
        `}
            >
                <div className="flex items-center gap-2.5">
                    {/* Logo mark */}
                    <img
                        src={logoUrl}
                        alt="DeltaDevX Logo"
                        className="w-7 h-7 shrink-0 object-contain rounded-full shadow-sm"
                    />
                    <span
                        className={`
              text-[11px] font-bold tracking-[0.2em] font-mono uppercase
              ${isDark ? 'text-[#b0b0cf]' : 'text-[#4b5563]'}
            `}
                    >
                        DeltaDevX
                    </span>
                </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-3 pt-4 space-y-1">
                {navItems.map(({ id, label, Icon }) => {
                    const isActive = activeView === id
                    return (
                        <button
                            key={id}
                            id={`nav-${id}`}
                            onClick={() => onViewChange(id)}
                            className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-150 cursor-pointer
                ${isActive
                                    ? isDark
                                        ? 'bg-[#252545] text-white shadow-sm'
                                        : 'bg-white text-[#1a1a2e] shadow-sm border border-[#e5e7eb]'
                                    : isDark
                                        ? 'text-[#8a8ab0] hover:bg-[#1a1a2e] hover:text-[#c5c5e0]'
                                        : 'text-[#6b7280] hover:bg-[#e9eaf0] hover:text-[#374151]'
                                }
              `}
                            style={{
                                color: isActive
                                    ? isDark ? '#e8e8f0' : '#1a1a2e'
                                    : isDark ? '#9ca3af' : '#6b7280',
                            }}
                        >
                            <span
                                className="shrink-0"
                                style={{ color: isActive ? '#4f6ef7' : 'inherit' }}
                            >
                                <Icon />
                            </span>
                            <span className="font-mono text-[12.5px] tracking-wide">{label}</span>
                        </button>
                    )
                })}
            </nav>

            {/* Bottom — Offline indicator + theme toggle */}
            <div
                className={`
          px-4 py-4 border-t space-y-3
          ${isDark ? 'border-[#1e1e35]' : 'border-[#e5e7eb]'}
        `}
            >
                {/* Theme toggle */}
                <button
                    id="theme-toggle"
                    onClick={onToggleTheme}
                    className={`
            w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs
            transition-all duration-150 cursor-pointer
            ${isDark
                            ? 'text-[#9ca3af] hover:bg-[#1a1a2e] hover:text-[#c5c5e0]'
                            : 'text-[#6b7280] hover:bg-[#e9eaf0] hover:text-[#374151]'
                        }
          `}
                >
                    <span>{isDark ? <SunIcon /> : <MoonIcon />}</span>
                    <span className="font-mono">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
