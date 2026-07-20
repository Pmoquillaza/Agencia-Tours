import { useEffect, useMemo, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

import {
    cancelReservation,
    getReservations
} from "../services/reservationService";

import "./Reservations.css";

const Reservations = () => {

    const [reservations, setReservations] =
        useState([]);

    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("todos");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");

    const loadReservations = async () => {

        try {

            setLoading(true);

            const data =
                await getReservations();

            setReservations(data || []);

        } catch {
            setReservations([]);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadReservations();

    }, []);

    const filteredReservations = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return reservations.filter((reservation) =>
            (
                statusFilter === "todos" ||
                String(reservation.estado || "").toLowerCase() === statusFilter
            ) &&
            (
                String(reservation.id).includes(normalizedQuery) ||
                String(reservation.estado || "")
                    .toLowerCase()
                    .includes(normalizedQuery)
            )
        );
    }, [reservations, query, statusFilter]);

    const totalAmount = useMemo(() => {
        return reservations.reduce(
            (sum, reservation) =>
                sum + Number(reservation.total || 0),
            0
        );
    }, [reservations]);

    const pendingCount = useMemo(() => {
        return reservations.filter(
            (reservation) =>
                String(reservation.estado || "").toLowerCase() === "pendiente"
        ).length;
    }, [reservations]);

    const confirmedCount = useMemo(() => {
        return reservations.filter(
            (reservation) =>
                String(reservation.estado || "").toLowerCase() === "confirmada"
        ).length;
    }, [reservations]);

    const statusOptions = useMemo(() => {
        const statuses = reservations
            .map((reservation) =>
                String(reservation.estado || "pendiente").toLowerCase()
            )
            .filter(Boolean);

        return ["todos", ...new Set(statuses)];
    }, [reservations]);

    const getNextStep = (reservation) => {
        const registeredTravelers =
            Number(reservation.viajeros_registrados || 0);
        const requiredTravelers =
            Number(reservation.cantidad_personas || 1);

        if (String(reservation.estado || "").toLowerCase() !== "pendiente") {
            return null;
        }

        if (registeredTravelers < requiredTravelers) {
            return {
                to: `/travelers/${reservation.id}`,
                label: "Completar viajeros"
            };
        }

        return {
            to: `/payment/${reservation.id}`,
            label: "Continuar pago"
        };
    };

    const getStatusClass = (status) => {
        const normalizedStatus = String(status || "").toLowerCase();

        if (normalizedStatus === "confirmada") {
            return "confirmed";
        }

        if (normalizedStatus === "cancelada") {
            return "cancelled";
        }

        return "pending";
    };

    const handleCancel = async (reservationId) => {
        const shouldCancel = window.confirm(
            "Deseas cancelar esta reserva pendiente y liberar los cupos?"
        );

        if (!shouldCancel) {
            return;
        }

        try {
            setActionLoading(reservationId);

            await cancelReservation(
                reservationId,
                "Cancelada desde Mis reservas"
            );

            await loadReservations();

        } catch {
            alert("No se pudo cancelar la reserva");
        } finally {
            setActionLoading("");
        }
    };

    return (

        <div className="reservations-page">

            <Navbar />

            <div className="page-shell">

                <div className="page-header">

                    <div>

                        <p className="eyebrow">
                            Viajes y reservas
                        </p>

                        <h1 className="page-title">
                            Mis reservas
                        </h1>

                        <p className="page-subtitle">
                            Gestiona tus viajes, completa reservas pendientes y continua el pago desde un panel claro y seguro.
                        </p>

                    </div>

                </div>

                <div className="reservation-metrics">
                    <div className="panel">
                        <span>
                            Reservas
                        </span>
                        <strong>
                            {reservations.length}
                        </strong>
                    </div>

                    <div className="panel">
                        <span>
                            Pendientes
                        </span>
                        <strong>
                            {pendingCount}
                        </strong>
                    </div>

                    <div className="panel">
                        <span>
                            Confirmadas
                        </span>
                        <strong>
                            {confirmedCount}
                        </strong>
                    </div>

                    <div className="panel">
                        <span>
                            Importe registrado
                        </span>
                        <strong>
                            S/ {totalAmount.toFixed(2)}
                        </strong>
                    </div>

                    <div className="panel">
                        <span>
                            Resultado filtrado
                        </span>
                        <strong>
                            {filteredReservations.length}
                        </strong>
                    </div>

                    <div className="panel reservation-search">
                        <label htmlFor="reservation-search">
                            Buscar
                        </label>
                        <input
                            id="reservation-search"
                            type="search"
                            value={query}
                            onChange={(event) =>
                                setQuery(event.target.value)
                            }
                            placeholder="ID o estado"
                        />
                    </div>
                </div>

                <section className="reservations-hero panel">
                    <div>
                        <p className="eyebrow">
                            Centro de viaje
                        </p>
                        <h2>
                            Continua tus reservas pendientes sin volver a empezar.
                        </h2>
                        <p>
                            Si una reserva esta pendiente, puedes completar pasajeros o ir directamente al pago segun el avance registrado.
                        </p>
                    </div>

                    <Link
                        to="/tours"
                        className="primary-btn"
                    >
                        Crear nueva reserva
                    </Link>
                </section>

                <div className="reservation-tabs">
                    {statusOptions.map((status) => (
                        <button
                            type="button"
                            key={status}
                            className={statusFilter === status ? "active" : ""}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status === "todos" ? "Todas" : status}
                        </button>
                    ))}
                </div>

                <div className="reservations-list">

                    {loading && (
                        <div className="empty-state panel">
                            Cargando reservas...
                        </div>
                    )}

                    {!loading && filteredReservations.map((reservation) => {
                        const nextStep = getNextStep(reservation);
                        const travelersProgress =
                            `${reservation.viajeros_registrados || 0}/${reservation.cantidad_personas || 1}`;

                        return (

                        <div
                            key={reservation.id}
                            className="reservation-card panel"
                        >

                            <div className="reservation-main">

                                <span className="reservation-code">
                                    Reserva
                                </span>

                                <h2>
                                    #{String(reservation.id).slice(0, 8)}
                                </h2>

                                <p>
                                    {reservation.tour || "Tour reservado"}
                                    {reservation.destino
                                        ? ` - ${reservation.destino}`
                                        : ""}
                                </p>

                                <div className="reservation-meta">

                                    <span>
                                        Personas: {reservation.cantidad_personas}
                                    </span>

                                    <span>
                                        Viajeros: {travelersProgress}
                                    </span>

                                    <span>
                                        Transporte: {reservation.tipo_transporte || "No definido"}
                                    </span>

                                    <span className={`status-pill ${getStatusClass(reservation.estado)}`}>
                                        {reservation.estado}
                                    </span>

                                </div>

                            </div>

                            <div className="reservation-timeline">
                                {["Creada", "Viajeros", "Pago"].map((step, index) => (
                                    <span
                                        key={step}
                                        className={
                                            index === 0 ||
                                            (
                                                index === 1 &&
                                                Number(reservation.viajeros_registrados || 0) >=
                                                Number(reservation.cantidad_personas || 1)
                                            ) ||
                                            String(reservation.estado || "").toLowerCase() === "confirmada"
                                                ? "active"
                                                : ""
                                        }
                                    >
                                        {step}
                                    </span>
                                ))}
                            </div>

                            <div className="reservation-total">
                                <span>
                                    Total
                                </span>
                                <strong>
                                    S/ {reservation.total || 0}
                                </strong>
                                <small>
                                    Incluye servicios
                                </small>
                            </div>

                            <div className="reservation-actions">
                                {nextStep && (
                                    <Link
                                        to={nextStep.to}
                                        className="primary-btn"
                                    >
                                        {nextStep.label}
                                    </Link>
                                )}

                                {String(reservation.estado || "").toLowerCase() === "pendiente" && (
                                    <button
                                        type="button"
                                        className="secondary-btn"
                                        onClick={() => handleCancel(reservation.id)}
                                        disabled={actionLoading === reservation.id}
                                    >
                                        {actionLoading === reservation.id
                                            ? "Cancelando..."
                                            : "Cancelar"}
                                    </button>
                                )}

                                <Link
                                    to="/tours"
                                    className="ghost-btn"
                                >
                                    Nuevo tour
                                </Link>
                            </div>

                        </div>

                        );
                    })}

                    {!loading && filteredReservations.length === 0 && (

                        <div className="empty-state panel">
                            No hay reservas para mostrar.
                        </div>

                    )}

                </div>

            </div>

            <Footer />

        </div>

    );

};

export default Reservations;
