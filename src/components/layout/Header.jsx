import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/header.css'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo">
          <img src="/logo-ddm.svg" alt="Cata Cervezas DDM" className="header__logo-img" />
        </Link>

        <nav className="header__nav">
          <NavLink to="/">Cervezas</NavLink>
          {user ? (
            <>
              <NavLink to="/admin" className="header__admin-btn">Admin</NavLink>
              <button className="header__logout-btn" onClick={logout}>
                Salir
              </button>
            </>
          ) : (
            <NavLink to="/login">Admin</NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
