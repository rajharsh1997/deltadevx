import React from 'react'
import logoUrl from '../assets/logo.png'
export type View = 'json-diff' | 'jwt-decoder'

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
        <path d="M8 6h13" />
        <path d="M8 12h13" />
        <path d="M8 18h13" />
        <path d="M3 6l.01 0" />
        <path d="M3 12l.01 0" />
        <path d="M3 18l.01 0" />
        <line x1="16" y1="3" x2="20" y2="7" />
        <line x1="20" y1="3" x2="16" y2="7" />
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
              ${isDark ? 'text-[#9595b4]' : 'text-[#6b7280]'}
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
                                        ? 'text-[#6565908a] hover:bg-[#1a1a2e] hover:text-[#9595b4]'
                                        : 'text-[#6b7280] hover:bg-[#e9eaf0] hover:text-[#374151]'
                                }
              `}
                            style={{
                                color: isActive
                                    ? isDark ? '#e8e8f0' : '#1a1a2e'
                                    : isDark ? '#6b7280' : '#6b7280',
                            }}
                        >
                            <span
                                className="shrink-0"
                                style={{ color: isActive ? '#4f6ef7' : 'inherit' }}
                            >
                                <Icon />
                            </span>
                            <span className="font-mono text-[12.5px] tracking-wide">{label}</span>
                            {isActive && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4f6ef7] shrink-0" />
                            )}
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
                            ? 'text-[#6b7280] hover:bg-[#1a1a2e] hover:text-[#9595b4]'
                            : 'text-[#9ca3af] hover:bg-[#e9eaf0] hover:text-[#6b7280]'
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
