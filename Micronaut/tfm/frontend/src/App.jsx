import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Navbar from './components/Navbar'
import Comparison from './pages/Comparison'
import Dashboard from './pages/Dashboard'
import ApiData from './pages/ApiData'
import Results from './pages/Results'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/comparison" element={<Comparison />} />
          <Route path="/results" element={<Results />} />
          <Route path="/api-data" element={<ApiData />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
