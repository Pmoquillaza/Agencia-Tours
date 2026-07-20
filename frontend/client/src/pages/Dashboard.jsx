import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { getReservations } from "../services/reservationService";

import "./Dashboard.css";

const destinationIdeas = [
    {
        name: "Cusco",
        label: "Cultura andina",
        image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1200&auto=format&fit=crop"
    },
    {
        name: "Arequipa",
        label: "Ciudad y naturaleza",
        image: "https://images.unsplash.com/photo-1590602390121-9c2ec384a764?q=80&w=1200&auto=format&fit=crop"
    },
    {
        name: "Puno",
        label: "Lago y tradicion",
        image: "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=1200&auto=format&fit=crop"
    }
];

const adminModules = [
    {
        title: "Paquetes",
        text: "Actualiza destinos, precios, cupos e imagenes publicadas.",
        to: "/admin/tours",
        icon: "travel_explore"
    },
    {
        title: "Hospedajes",
        text: "Mantiene hoteles recomendados, tarifas por noche y categorias.",
        to: "/admin/hotels",
        icon: "hotel"
    },
    {
        title: "Transportes",
        text: "Gestiona rutas por vuelo o bus, capacidad y precios.",
        to: "/admin/transports",
        icon: "flight_takeoff"
    }
];

const Dashboard = () => {
    const { user, logout } = useAuth();
    const isAdmin = user?.rol === "admin";
    const [reservations, setReservations] = useState([]);
    const [loadingReservations, setLoadingReservations] =
        useState(true);
    const [reservationError, setReservationError] = useState("");

    const savedReservation = localStorage.getItem("reservationData");
    const transportData = localStorage.getItem("transportData");
    const hotelData = localStorage.getItem("hotelData");

    const draftReservation = savedReservation
        ? JSON.parse(savedReservation)
        : null;
    const selectedTransport = transportData
        ? JSON.parse(transportData)
        : null;
    const selectedHotel = hotelData
        ? JSON.parse(hotelData)
        : null;

    useEffect(() => {
        const loadReservations = async () => {
            try {
                setLoadingReservations(true);
                setReservationError("");
                setReservations(await getReservations());
            } catch (error) {
                setReservationError(
                    error.response?.data?.message ||
                    "No pudimos cargar tus reservas"
                );
            } finally {
                setLoadingReservations(false);
            }
        };

        loadReservations();
    }, []);

    const metrics = useMemo(() => {
        const pending = reservations.filter(
            (reservation) =>
                String(reservation.estado || "").toLowerCase() ===
                "pendiente"
        ).length;
        const confirmed = reservations.filter(
            (reservation) =>
                String(reservation.estado || "").toLowerCase() ===
                "confirmada"
        ).length;
        const total = reservations.reduce(
            (sum, reservation) =>
                sum + Number(reservation.total || 0),
            0
        );

        return {
            pending,
            confirmed,
            total
        };
    }, [reservations]);

    const latestReservation = reservations[0];
    const activeTrip = draftReservation || latestReservation;

    const journeySteps = [
        {
            label: "Destino",
            icon: "explore",
            done: Boolean(draftReservation || latestReservation)
        },
        {
            label: "Transporte",
            icon: "flight_takeoff",
            done: Boolean(selectedTransport)
        },
        {
            label: "Hotel",
            icon: "hotel",
            done: Boolean(selectedHotel)
        },
        {
            label: "Viajeros",
            icon: "group",
            done:
                Number(latestReservation?.viajeros_registrados || 0) >=
                Number(latestReservation?.cantidad_personas || 1)
        },
        {
            label: "Pago",
            icon: "credit_card",
            done:
                String(latestReservation?.estado || "").toLowerCase() ===
                "confirmada"
        }
    ];

    const continueTo = draftReservation
        ? "/transport-selection"
        : latestReservation?.estado === "pendiente"
            ? `/travelers/${latestReservation.id}`
            : "/tours";

    const continueLabel = draftReservation
        ? "Continuar reserva"
        : latestReservation?.estado === "pendiente"
            ? "Completar viaje"
            : "Nueva reserva";

    return (
        <div className="dashboard-page">
            <Navbar />

            <main className="dashboard-shell">
                <section className="dashboard-welcome">
                    <div>
                        <p className="eyebrow">
                            Dashboard
                        </p>
                        <h1>
                            Bienvenido, {user?.nombre || "viajero"}
                        </h1>
                        <p>
                            Gestiona tus viajes, revisa reservas activas y continua tu compra desde un panel claro y profesional.
                        </p>
                    </div>

                    <Link
                        to="/tours"
                        className="primary-btn"
                    >
                        <span className="material-symbols-outlined">
                            add
                        </span>
                        Nueva reserva
                    </Link>
                </section>

                <section className="dashboard-metrics">
                    <div>
                        <span>
                            Reservas
                        </span>
                        <strong>
                            {loadingReservations
                                ? "..."
                                : reservations.length}
                        </strong>
                    </div>
                    <div>
                        <span>
                            Pendientes
                        </span>
                        <strong>
                            {metrics.pending}
                        </strong>
                    </div>
                    <div>
                        <span>
                            Confirmadas
                        </span>
                        <strong>
                            {metrics.confirmed}
                        </strong>
                    </div>
                    <div>
                        <span>
                            Total reservado
                        </span>
                        <strong>
                            S/ {metrics.total.toFixed(0)}
                        </strong>
                    </div>
                </section>

                {reservationError && (
                    <section className="dashboard-alert">
                        {reservationError}. Puedes seguir explorando experiencias mientras se actualiza tu historial.
                    </section>
                )}

                <section className="dashboard-bento">
                    <div className="dashboard-main-column">
                        <article className="upcoming-card panel">
                            <div className="upcoming-image">
                                <img
                                    src={
                                        activeTrip?.imagen ||
                                        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
                                    }
                                    alt={activeTrip?.titulo || "Proximo viaje"}
                                />
                            </div>

                            <div className="upcoming-content">
                                <div className="trip-card-header">
                                    <div>
                                        <p className="eyebrow">
                                            Proximo viaje
                                        </p>
                                        <h2>
                                            {activeTrip?.titulo ||
                                                activeTrip?.tour ||
                                                activeTrip?.nombre ||
                                                "Empieza una nueva experiencia"}
                                        </h2>
                                    </div>
                                    <span>
                                        {activeTrip?.destino || "Destino abierto"}
                                    </span>
                                </div>

                                <p>
                                    {activeTrip
                                        ? "Tienes una experiencia preparada. Revisa los servicios seleccionados y completa los pasos pendientes para asegurar la reserva."
                                        : "Compara destinos, elige el paquete ideal y avanza por una reserva guiada con transporte, hotel, viajeros y pago."}
                                </p>

                                <div className="journey-progress">
                                    {journeySteps.map((step) => (
                                        <div
                                            className={step.done ? "done" : ""}
                                            key={step.label}
                                        >
                                            <span className="material-symbols-outlined">
                                                {step.done ? "check" : step.icon}
                                            </span>
                                            <strong>
                                                {step.label}
                                            </strong>
                                        </div>
                                    ))}
                                </div>

                                <div className="trip-actions">
                                    <Link
                                        to={continueTo}
                                        className="primary-btn"
                                    >
                                        {continueLabel}
                                    </Link>
                                    <Link
                                        to="/reservations"
                                        className="secondary-btn"
                                    >
                                        Ver reservas
                                    </Link>
                                </div>
                            </div>
                        </article>

                        <article className="history-card panel">
                            <div className="section-heading">
                                <div>
                                    <p className="eyebrow">
                                        Historial
                                    </p>
                                    <h2>
                                        Reservas recientes
                                    </h2>
                                </div>
                                <Link
                                    to="/reservations"
                                    className="ghost-btn"
                                >
                                    Ver todo
                                </Link>
                            </div>

                            <div className="dashboard-history-list">
                                {reservations.slice(0, 4).map((reservation) => (
                                    <div key={reservation.id}>
                                        <span className={`status-pill ${
                                            String(reservation.estado || "").toLowerCase() === "confirmada"
                                                ? "confirmed"
                                                : "pending"
                                        }`}>
                                            {reservation.estado || "pendiente"}
                                        </span>
                                        <strong>
                                            {reservation.tour || `Reserva #${String(reservation.id).slice(0, 8)}`}
                                        </strong>
                                        <small>
                                            {reservation.cantidad_personas || 1} viajero(s)
                                        </small>
                                        <b>
                                            S/ {Number(reservation.total || 0).toFixed(0)}
                                        </b>
                                    </div>
                                ))}

                                {!loadingReservations && reservations.length === 0 && (
                                    <div className="dashboard-empty-row">
                                        Aun no tienes reservas registradas.
                                    </div>
                                )}
                            </div>
                        </article>
                    </div>

                    <aside className="dashboard-side-column">
                        <article className="quick-actions-card panel">
                            <h2>
                                Acciones rapidas
                            </h2>

                            <Link to="/tours">
                                <span className="material-symbols-outlined">
                                    search
                                </span>
                                Buscar experiencias
                            </Link>
                            <Link to="/reservations">
                                <span className="material-symbols-outlined">
                                    confirmation_number
                                </span>
                                Mis viajes
                            </Link>
                            <Link to="/profile">
                                <span className="material-symbols-outlined">
                                    person
                                </span>
                                Datos del viajero
                            </Link>
                            <button
                                type="button"
                                onClick={logout}
                            >
                                <span className="material-symbols-outlined">
                                    logout
                                </span>
                                Cerrar sesion
                            </button>
                        </article>

                        <article className="membership-card">
                            <span className="material-symbols-outlined">
                                workspace_premium
                            </span>
                            <h2>
                                Explorer Plus
                            </h2>
                            <p>
                                Completa mas reservas para desbloquear beneficios y descuentos en experiencias seleccionadas.
                            </p>
                            <div>
                                <span />
                            </div>
                            <small>
                                Progreso de beneficios
                            </small>
                        </article>

                        <article className="recommendations-card panel">
                            <h2>
                                Recomendado para ti
                            </h2>

                            {destinationIdeas.map((destination) => (
                                <Link
                                    to={`/tours?destination=${destination.name}`}
                                    key={destination.name}
                                >
                                    <img
                                        src={destination.image}
                                        alt={destination.name}
                                    />
                                    <div>
                                        <strong>
                                            {destination.name}
                                        </strong>
                                        <span>
                                            {destination.label}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </article>
                    </aside>
                </section>

                {isAdmin && (
                    <section className="admin-operations">
                        <div className="section-heading">
                            <div>
                                <p className="eyebrow">
                                    Gestion comercial
                                </p>
                                <h2>
                                    Modulos administrativos
                                </h2>
                            </div>
                        </div>

                        <div className="admin-module-grid">
                            {adminModules.map((module) => (
                                <Link
                                    to={module.to}
                                    key={module.title}
                                >
                                    <span className="material-symbols-outlined">
                                        {module.icon}
                                    </span>
                                    <strong>
                                        {module.title}
                                    </strong>
                                    <p>
                                        {module.text}
                                    </p>
                                    <small>
                                        Administrar
                                    </small>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;
