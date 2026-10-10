import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Navbar from './components/Navbar'
import Comparison from './pages/Comparison'
import Crud from './pages/Crud'
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
          <Route path="/crud" element={<Crud />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
