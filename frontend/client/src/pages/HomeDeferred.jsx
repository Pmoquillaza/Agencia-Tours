import { Link } from "react-router-dom";

import Footer from "../components/Footer";
import Icon from "../components/Icon";

import "./HomeDeferred.css";

const featuredPackages = [
    {
        name: "Paraiso en las Maldivas",
        destination: "Maldivas, Asia",
        price: "S/ 2,499",
        rating: "4.9",
        reviews: "128",
        badge: "Cancelacion gratis",
        image: "/images/maldives.webp"
    },
    {
        name: "Aventura Alpina Premium",
        destination: "Zermatt, Suiza",
        price: "S/ 3,150",
        rating: "5.0",
        reviews: "95",
        badge: "Mas vendido",
        image: "/images/alps.webp"
    },
    {
        name: "Esencia de Japon",
        destination: "Tokio, Japon",
        price: "S/ 1,890",
        rating: "4.8",
        reviews: "210",
        badge: "Cultural",
        image: "/images/japan.webp"
    }
];

const agencyHighlights = [
    {
        value: "24/7",
        label: "Soporte durante el viaje"
    },
    {
        value: "5 pasos",
        label: "Reserva guiada completa"
    },
    {
        value: "100%",
        label: "Pago y confirmacion segura"
    }
];

const travelModules = [
    {
        title: "Experiencias seleccionadas",
        text: "Paquetes con itinerario, cupos, precio y servicios complementarios listos para comparar.",
        icon: "compass"
    },
    {
        title: "Transporte coordinado",
        text: "Opciones por avion o bus segun destino, capacidad y presupuesto del viajero.",
        icon: "plane"
    },
    {
        title: "Hoteles recomendados",
        text: "Alojamientos asociados al destino con informacion clara de precio, ciudad y categoria.",
        icon: "bed"
    },
    {
        title: "Confirmacion profesional",
        text: "Pago seguro, reserva confirmada y correo automatico con el resumen de compra.",
        icon: "shield"
    }
];

const galleryDestinations = [
    {
        name: "Paris, Francia",
        size: "large",
        image: "/images/paris.webp"
    },
    {
        name: "Santorini",
        image: "/images/santorini.webp"
    },
    {
        name: "Cusco",
        image: "/images/cusco.webp"
    },
    {
        name: "Barrera de Coral",
        size: "wide",
        image: "/images/coral.webp"
    }
];

const reviews = [
    {
        name: "Mariana R.",
        text: "La reserva fue clara de inicio a fin. Me gusto poder elegir transporte, hotel y pagar sin perder el avance."
    },
    {
        name: "Carlos V.",
        text: "El dashboard y el correo de confirmacion hicieron que el viaje se sintiera organizado y profesional."
    }
];

const HomeDeferred = () => (
    <>
        <section className="home-section home-value-strip">
            {agencyHighlights.map((highlight) => (
                <div key={highlight.label}>
                    <strong>
                        {highlight.value}
                    </strong>
                    <span>
                        {highlight.label}
                    </span>
                </div>
            ))}
        </section>

        <section className="home-section">
            <div className="home-section-heading">
                <div>
                    <p className="eyebrow">
                        Beneficios
                    </p>
                    <h2>
                        Por que viajar con TravelGo
                    </h2>
                    <p>
                        Servicio premium disenado para que solo te preocupes de disfrutar el camino.
                    </p>
                </div>
            </div>

            <div className="home-module-grid">
                {travelModules.map((module) => (
                    <article
                        className="home-module-card"
                        key={module.title}
                    >
                        <span className="icon-chip">
                            <Icon name={module.icon} />
                        </span>
                        <strong>
                            {module.title}
                        </strong>
                        <p>
                            {module.text}
                        </p>
                    </article>
                ))}
            </div>
        </section>

        <section className="home-section home-packages">
            <div className="home-section-heading">
                <div>
                    <p className="eyebrow">
                        Paquetes destacados
                    </p>
                    <h2>
                        Selecciones exclusivas de temporada
                    </h2>
                    <p>
                        Paquetes curados para viajeros que buscan itinerarios completos y confiables.
                    </p>
                </div>

                <Link
                    to="/tours"
                    className="ghost-btn"
                >
                    Ver catalogo
                </Link>
            </div>

            <div className="home-package-grid">
                {featuredPackages.map((item) => (
                    <article
                        className="home-package-card"
                        key={item.name}
                    >
                        <div className="package-image">
                            <img
                                src={item.image}
                                alt={item.name}
                                width="720"
                                height="540"
                                loading="lazy"
                                decoding="async"
                            />
                            <span>
                                {item.badge}
                            </span>
                        </div>
                        <div className="package-body">
                            <div className="package-location">
                                <Icon name="pin" />
                                {item.destination}
                            </div>
                            <h3>
                                {item.name}
                            </h3>
                            <div className="package-rating">
                                <Icon name="star" />
                                <strong>
                                    {item.rating}
                                </strong>
                                <small>
                                    ({item.reviews} resenas)
                                </small>
                            </div>
                            <div className="package-footer">
                                <div>
                                    <span>
                                        Desde
                                    </span>
                                    <strong>
                                        {item.price}
                                    </strong>
                                </div>
                                <Link to="/tours">
                                    Explorar
                                </Link>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>

        <section className="home-section">
            <div className="home-section-heading center">
                <div>
                    <h2>
                        Destinos que inspiran
                    </h2>
                </div>
            </div>

            <div className="home-destination-grid">
                {galleryDestinations.map((destinationItem) => (
                    <Link
                        to={`/tours?destination=${destinationItem.name}`}
                        className={`home-destination-card ${destinationItem.size || ""}`}
                        key={destinationItem.name}
                    >
                        <img
                            src={destinationItem.image}
                            alt={destinationItem.name}
                            width={destinationItem.size === "large" ? "960" : "720"}
                            height="720"
                            loading="lazy"
                            decoding="async"
                        />
                        <span>
                            {destinationItem.label || "Destino premium"}
                        </span>
                        <strong>
                            {destinationItem.name}
                        </strong>
                    </Link>
                ))}
            </div>
        </section>

        <section className="home-section home-reviews">
            <div className="home-section-heading">
                <div>
                    <p className="eyebrow">
                        Viajeros felices
                    </p>
                    <h2>
                        Reservas claras, viajes tranquilos
                    </h2>
                </div>
            </div>

            <div className="home-review-grid">
                {reviews.map((review) => (
                    <article key={review.name}>
                        <Icon name="quote" />
                        <p>
                            {review.text}
                        </p>
                        <strong>
                            {review.name}
                        </strong>
                    </article>
                ))}
            </div>
        </section>

        <Footer />
    </>
);

export default HomeDeferred;
