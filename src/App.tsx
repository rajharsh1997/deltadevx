import { useState } from 'react'
import Sidebar, { type View } from './components/Sidebar'
import TopBar from './components/TopBar'
import JsonDiff from './views/JsonDiff'
import JwtDecoder from './views/JwtDecoder'

function App() {
  const [activeView, setActiveView] = useState<View>('json-diff')
  const [isDark, setIsDark] = useState(true)

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return next
    })
  }

  return (
    <div
      className="flex h-screen w-screen overflow-x-auto overflow-y-hidden transition-colors duration-200"
      style={{
        backgroundColor: isDark ? '#0f0f1a' : '#f9fafb',
      }}
    >
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar activeView={activeView} isDark={isDark} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {activeView === 'json-diff' && <JsonDiff isDark={isDark} />}
          {activeView === 'jwt-decoder' && <JwtDecoder isDark={isDark} />}
        </main>
      </div>
    </div>
  )
}

export default App
