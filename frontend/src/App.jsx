import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

function App() {
  const [count, setCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex justify-center space-x-8 mb-8">
              <a href="https://vite.dev" target="_blank">
                <img src={viteLogo} className="logo" alt="Vite logo" />
              </a>
              <a href="https://react.dev" target="_blank">
                <img src={reactLogo} className="logo react" alt="React logo" />
              </a>
            </div>
            <h1 className="text-4xl font-bold mb-8">Vite + React</h1>
            <div className="card">
              <button onClick={() => setCount((count) => count + 1)}>
                count is {count}
              </button>
              <p>
                Edit <code>src/App.jsx</code> and save to test HMR
              </p>
            </div>
            <p className="read-the-docs">
              Click on the Vite and React logos to learn more
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App
