import { useState } from 'react'
import Sidebar, { type View } from './components/Sidebar'
import TopBar from './components/TopBar'
import JsonDiff from './views/JsonDiff'
import JwtDecoder from './views/JwtDecoder'
import TextDiff from './views/TextDiff'
import SqlTool from './views/SqlTool'
import RegexTester from './views/RegexTester'
import TokenCounter from './views/TokenCounter'
import Base64 from './views/Base64'
import TimeSchedule from './views/TimeSchedule'
import NetworkTools from './views/NetworkTools'
import FakeData from './views/FakeData'

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
          {activeView === 'text-diff' && <TextDiff isDark={isDark} />}
          {activeView === 'sql-tool' && <SqlTool isDark={isDark} />}
          {activeView === 'regex-tester' && <RegexTester isDark={isDark} />}
          {activeView === 'token-counter' && <TokenCounter isDark={isDark} />}
          {activeView === 'base64' && <Base64 isDark={isDark} />}
          {activeView === 'time-schedule' && <TimeSchedule isDark={isDark} />}
          {activeView === 'network-tools' && <NetworkTools isDark={isDark} />}
          {activeView === 'fake-data' && <FakeData isDark={isDark} />}
        </main>
      </div>
    </div>
  )
}

export default App
