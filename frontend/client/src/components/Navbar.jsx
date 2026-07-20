import "./Navbar.css";

import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const isAdmin = user?.rol === "admin";

    const handleLogout = () => {
        setMenuOpen(false);
        logout();
        navigate("/login");
    };

    return (

        <>

        <nav className="navbar">

            <Link
                to="/"
                className="logo"
            >
                <span className="material-symbols-outlined brand-icon">
                    explore
                </span>
                <strong>
                    TravelGo
                </strong>
            </Link>

            <button
                type="button"
                className="menu-toggle"
                aria-label="Abrir menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
            >
                <span />
                <span />
                <span />
            </button>

            <div className={`nav-links ${menuOpen ? "open" : ""}`}>

                <NavLink to="/" onClick={() => setMenuOpen(false)}>
                    Inicio
                </NavLink>

                <NavLink to="/tours" onClick={() => setMenuOpen(false)}>
                    Paquetes
                </NavLink>

                <NavLink to="/reservations" onClick={() => setMenuOpen(false)}>
                    Mis viajes
                </NavLink>

                <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>
                    Dashboard
                </NavLink>

                {user && (
                    <NavLink to="/profile" onClick={() => setMenuOpen(false)}>
                        Perfil
                    </NavLink>
                )}

                {isAdmin && (
                    <>
                        <span className="nav-divider">
                            Admin
                        </span>

                        <NavLink to="/admin/tours" onClick={() => setMenuOpen(false)}>
                            Tours
                        </NavLink>

                        <NavLink to="/admin/hotels" onClick={() => setMenuOpen(false)}>
                            Hoteles
                        </NavLink>

                        <NavLink to="/admin/transports" onClick={() => setMenuOpen(false)}>
                            Transportes
                        </NavLink>
                    </>
                )}

            </div>

            <div className="nav-profile">
                <div>
                    <span>
                        {user?.nombre || "Invitado"}
                    </span>
                    <small>
                        {isAdmin
                            ? "Administrador"
                            : user?.email || "Explorando"}
                    </small>
                </div>

                {user ? (
                    <button
                        type="button"
                        onClick={handleLogout}
                    >
                        Salir
                    </button>
                ) : (
                    <NavLink to="/login" onClick={() => setMenuOpen(false)}>
                        Ingresar
                    </NavLink>
                )}
            </div>

        </nav>

        <nav className="mobile-bottom-nav" aria-label="Navegacion movil">
            <NavLink to="/">
                <span className="material-symbols-outlined">
                    home
                </span>
                <small>
                    Inicio
                </small>
            </NavLink>

            <NavLink to="/tours">
                <span className="material-symbols-outlined">
                    explore
                </span>
                <small>
                    Explorar
                </small>
            </NavLink>

            <NavLink to="/reservations">
                <span className="material-symbols-outlined">
                    confirmation_number
                </span>
                <small>
                    Viajes
                </small>
            </NavLink>

            <NavLink to="/profile">
                <span className="material-symbols-outlined">
                    account_circle
                </span>
                <small>
                    Perfil
                </small>
            </NavLink>
        </nav>

        </>

    );

};

export default Navbar;
