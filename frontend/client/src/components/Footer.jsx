import { Link } from "react-router-dom";

import "./Footer.css";

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-shell">
                <div className="footer-brand">
                    <strong>
                        <span className="material-symbols-outlined">
                            explore
                        </span>
                        TravelGo
                    </strong>
                    <p>
                        Transformamos tus suenos de viaje en experiencias memorables. Tu agencia de confianza para aventuras completas.
                    </p>

                    <div className="footer-social">
                        <a href="#top" aria-label="Sitio web">
                            <span className="material-symbols-outlined">
                                public
                            </span>
                        </a>
                        <a href="#top" aria-label="Fotos">
                            <span className="material-symbols-outlined">
                                camera
                            </span>
                        </a>
                        <a href="#top" aria-label="Correo">
                            <span className="material-symbols-outlined">
                                alternate_email
                            </span>
                        </a>
                    </div>
                </div>

                <div className="footer-column">
                    <h3>
                        Explora
                    </h3>
                    <Link to="/">
                        Inicio
                    </Link>
                    <Link to="/tours">
                        Paquetes
                    </Link>
                    <Link to="/dashboard">
                        Dashboard
                    </Link>
                </div>

                <div className="footer-column">
                    <h3>
                        Soporte
                    </h3>
                    <Link to="/reservations">
                        Mis viajes
                    </Link>
                    <Link to="/profile">
                        Perfil
                    </Link>
                    <span>
                        Politicas
                    </span>
                    <span>
                        Ayuda 24/7
                    </span>
                </div>

                <div className="footer-newsletter">
                    <h3>
                        Newsletter
                    </h3>
                    <p>
                        Recibe ofertas exclusivas y guias de viaje seleccionadas.
                    </p>
                    <form
                        onSubmit={(event) => event.preventDefault()}
                    >
                        <input
                            type="email"
                            placeholder="Email"
                            aria-label="Email newsletter"
                        />
                        <button type="submit" aria-label="Unirse">
                            <span className="material-symbols-outlined">
                                send
                            </span>
                        </button>
                    </form>
                </div>
            </div>

            <div className="footer-bottom">
                <span>
                    2026 TravelGo Tour Agency. All rights reserved.
                </span>
                <span>
                    Professional travel curation and secure bookings.
                </span>
            </div>
        </footer>
    );
};

export default Footer;
