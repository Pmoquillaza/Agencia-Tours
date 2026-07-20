import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookingSteps from "../components/BookingSteps";
import { getFlights } from "../services/flightService";

import "./TransportSelection.css";

const normalizeText = (value) =>
    String(value || "")
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

const normalizeTransportType = (value) => {
    const normalized = normalizeText(value);

    if (["avion", "vuelo", "flight"].includes(normalized)) {
        return "vuelo";
    }

    return normalized;
};

const TransportSelection = () => {

    const navigate = useNavigate();

    const [transportType, setTransportType] =
        useState("vuelo");

    const [flights, setFlights] = useState([]);

    const [selectedFlight, setSelectedFlight] =
        useState(null);

    const [cantidad, setCantidad] = useState(1);

    const reservation = useMemo(() => {
        const savedReservation = localStorage.getItem("reservationData");
        return savedReservation ? JSON.parse(savedReservation) : null;
    }, []);

    const loadFlights = useCallback(async () => {

        try {

            const data = await getFlights();
            const availableTransports = Array.isArray(data)
                ? data
                : [];
            const selectedDestination = normalizeText(
                reservation?.destino
            );

            const matchesTransportType = (flight) => {
                return normalizeTransportType(flight.tipo) ===
                    transportType;
            };

            const matchesDestination = (flight) => {
                return normalizeText(flight.destino) ===
                    selectedDestination;
            };

            const byDestination = availableTransports.filter(
                (flight) =>
                    flight?.activo !== false &&
                    matchesTransportType(flight) &&
                    matchesDestination(flight)
            );

            const fallbackTransport = {
                id: `default-${transportType}`,
                origen:
                    transportType === "vuelo"
                        ? "Aeropuerto principal"
                        : "Terminal terrestre",
                destino: reservation?.destino,
                aerolinea:
                    transportType === "vuelo"
                        ? `Vuelo TravelGo a ${reservation?.destino}`
                        : `Bus TravelGo a ${reservation?.destino}`,
                tipo: transportType,
                precio:
                    transportType === "vuelo"
                        ? Number(reservation?.precio_vuelo || 180)
                        : Number(reservation?.precio_bus || 60)
            };

            setFlights(
                byDestination.length > 0
                    ? byDestination
                    : [fallbackTransport]
            );

        } catch {

            setFlights([
                {
                    id: `default-${transportType}`,
                    origen:
                        transportType === "vuelo"
                            ? "Aeropuerto principal"
                            : "Terminal terrestre",
                    destino: reservation?.destino,
                    aerolinea:
                        transportType === "vuelo"
                            ? `Vuelo TravelGo a ${reservation?.destino}`
                            : `Bus TravelGo a ${reservation?.destino}`,
                    tipo: transportType,
                    precio:
                        transportType === "vuelo"
                            ? Number(reservation?.precio_vuelo || 180)
                            : Number(reservation?.precio_bus || 60)
                }
            ]);

        }

    }, [
        reservation?.destino,
        reservation?.precio_bus,
        reservation?.precio_vuelo,
        transportType
    ]);

    useEffect(() => {
        if (reservation?.cantidad_personas) {
            setCantidad(Number(reservation.cantidad_personas));
        }
    }, [reservation?.cantidad_personas]);

    useEffect(() => {
        if (reservation) {
            setSelectedFlight(null);
            loadFlights();
        }
    }, [reservation, loadFlights]);

    const estimatedTransportTotal = useMemo(() => {
        return Number(selectedFlight?.precio || 0) *
            Number(cantidad || 1);
    }, [selectedFlight?.precio, cantidad]);

    const handleContinue = () => {

        if (!selectedFlight) {

            alert("Selecciona un transporte");

            return;

        }

        localStorage.setItem(
            "transportData",
            JSON.stringify({
                ...selectedFlight,
                cantidad
            })
        );

        const updatedReservation = {

            ...reservation,

            cantidad_personas: Number(cantidad),

            tipo_transporte: transportType

        };

        localStorage.setItem(
            "reservationData",
            JSON.stringify(updatedReservation)
        );

        navigate("/hotel-selection");

    };

    if (!reservation) {

        return (

            <div className="transport-page">

                <Navbar />

                <div className="transport-container">

                    <div className="empty-state panel">
                        Debes seleccionar un tour primero
                    </div>

                </div>

            </div>

        );

    }

    return (

        <div className="transport-page">

            <Navbar />

            <div className="transport-container">

                <BookingSteps current="transport" />

                <div className="page-header">

                    <div>

                        <p className="eyebrow">
                            Paso 2
                        </p>

                        <h1 className="transport-title">
                            Seleccionar transporte
                        </h1>

                        <p className="page-subtitle">
                            Compara opciones para llegar a {reservation.destino} y elige la alternativa que mejor encaja con tu viaje.
                        </p>

                    </div>

                </div>

                <div className="transport-layout">

                    <section>

                <div className="transport-destination info-strip">

                    <div>

                        <h2>
                            Destino seleccionado
                        </h2>

                        <p>
                            {reservation.destino}
                        </p>

                    </div>

                </div>

                <div className="transport-tabs">
                    {[
                        ["vuelo", "Avion", "Mas rapido"],
                        ["bus", "Bus", "Mas economico"]
                    ].map(([id, label, hint]) => (
                        <button
                            type="button"
                            key={id}
                            className={transportType === id ? "active" : ""}
                            onClick={() => setTransportType(id)}
                        >
                            <strong>
                                {label}
                            </strong>
                            <span>
                                {hint}
                            </span>
                        </button>
                    ))}

                </div>

                <div className="transport-grid">

                    {flights.map((flight) => (

                        <div
                            key={flight.id}
                            className={`transport-card ${
                                selectedFlight?.id ===
                                flight.id
                                    ? "selected-card"
                                    : ""
                            }`}
                        >

                            <div className="transport-card-body">
                                <div className="transport-card-head">
                                    <span className="transport-icon material-symbols-outlined">
                                        {transportType === "vuelo"
                                            ? "flight_takeoff"
                                            : "directions_bus"}
                                    </span>
                                    <div>
                                        <span>
                                            Desde
                                        </span>
                                        <strong>
                                            S/ {flight.precio}
                                        </strong>
                                    </div>
                                </div>

                                <h2>
                                    {flight.aerolinea}
                                </h2>

                                <div className="transport-benefits">
                                    <span>
                                        Equipaje incluido
                                    </span>
                                    <span>
                                        Confirmacion inmediata
                                    </span>
                                </div>

                                <p>
                                    <strong>Origen:</strong>{" "}
                                    {flight.origen}
                                </p>

                                <p>
                                    <strong>Destino:</strong>{" "}
                                    {flight.destino}
                                </p>

                                <p>
                                    <strong>Tipo:</strong>{" "}
                                    {flight.tipo}
                                </p>

                                <p className="transport-price">
                                    S/{flight.precio}
                                    <span>
                                        /persona
                                    </span>
                                </p>

                                <button
                                    onClick={() =>
                                        setSelectedFlight(
                                            flight
                                        )
                                    }
                                >

                                    {selectedFlight?.id ===
                                    flight.id
                                        ? "Seleccionado"
                                        : "Seleccionar"}

                                </button>

                            </div>

                        </div>

                    ))}

                </div>

                <div className="transport-input-container">

                    <label>
                        Cantidad de pasajes
                    </label>

                    <input
                        type="number"
                        min="1"
                        max={reservation?.cupos || 20}
                        value={cantidad}
                        onChange={(e) =>
                            setCantidad(
                                e.target.value
                            )
                        }
                    />

                </div>

                <button
                    className="continue-btn"
                    onClick={handleContinue}
                    disabled={!selectedFlight}
                >
                    Continuar
                </button>

                    </section>

                    <aside className="reservation-aside panel">
                        <p className="eyebrow">
                            Tu seleccion
                        </p>

                        <h2>
                            {reservation.titulo || reservation.nombre}
                        </h2>

                        <div className="aside-row">
                            <span>
                                Destino
                            </span>
                            <strong>
                                {reservation.destino}
                            </strong>
                        </div>

                        <div className="aside-row">
                            <span>
                                Pasajeros
                            </span>
                            <strong>
                                {cantidad}
                            </strong>
                        </div>

                        <div className="aside-row">
                            <span>
                                Transporte
                            </span>
                            <strong>
                                {selectedFlight?.aerolinea || "Por elegir"}
                            </strong>
                        </div>

                        <div className="aside-total">
                            <span>
                                Transporte estimado
                            </span>
                            <strong>
                                S/ {estimatedTransportTotal.toFixed(2)}
                            </strong>
                        </div>
                    </aside>

                </div>

            </div>

            <Footer />

        </div>

    );

};

export default TransportSelection;
