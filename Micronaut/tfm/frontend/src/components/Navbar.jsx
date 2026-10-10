import { NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-icon">B</div>
          <div>
            <div className="brand-title">Backend Benchmark</div>
            <div className="brand-subtitle">Micronaut vs Spring Boot</div>
          </div>
        </div>

        <div className="navbar-links">
          <NavLink className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} to="/">
            Dashboard
          </NavLink>
          <NavLink className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} to="/comparison">
            Comparación
          </NavLink>
          <NavLink className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} to="/results">
            Resultados
          </NavLink>
          <NavLink className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} to="/api-data">
            API
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
