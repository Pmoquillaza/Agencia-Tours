import { useCallback, useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookingSteps from "../components/BookingSteps";

import { getTourById } from "../services/tourService";

import "./TourDetail.css";

const TourDetail = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const [tour, setTour] = useState(null);

    const [cantidadPersonas, setCantidadPersonas] =
        useState(1);

    const [dias, setDias] = useState(1);
    const [travelStyle, setTravelStyle] = useState("balanceado");
    const [openDay, setOpenDay] = useState(1);

    const loadTour = useCallback(async () => {

        try {

            const data =
                await getTourById(id);

            setTour(data);

        } catch {

            alert("Error cargando tour");

        }

    }, [id]);

    useEffect(() => {

        loadTour();

    }, [loadTour]);

    const handleContinue = () => {

        localStorage.setItem(
            "reservationData",
            JSON.stringify({
                ...tour,
                cantidad_personas:
                    Number(cantidadPersonas),
                dias: Number(dias),
                estilo_viaje: travelStyle
            })
        );

        navigate("/transport-selection");

    };

    const pricePerPerson = Number(tour?.precio || 0);
    const tourDuration = Number(tour?.duracion || tour?.duracion_dias || tour?.dias || 1);
    const total = pricePerPerson *
        Number(cantidadPersonas || 1) *
        Number(dias || 1);
    const serviceFee = Math.round(total * 0.05);
    const finalTotal = total + serviceFee;
    const itineraryDays = Array.from(
        { length: Math.max(Number(dias || tourDuration || 1), 1) },
        (_, index) => index + 1
    );

    if (!tour) {

        return (

            <div className="detail-page">

                <Navbar />

                <h1 className="loading-text">
                    Cargando...
                </h1>

            </div>

        );

    }

    return (

        <div className="detail-page">

            <Navbar />

            <div className="detail-container">

                <div className="detail-steps">
                    <BookingSteps current="tour" />
                </div>

                <div className="detail-tour-card">

                    <div className="detail-media">
                        <img
                            src={
                                tour.imagen ||
                                "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"
                            }
                            alt={tour.titulo || "Tour"}
                        />

                        <span>
                            Tour destacado
                        </span>
                    </div>

                    <div className="detail-tour-info">

                        <p className="eyebrow">
                            Detalle del paquete
                        </p>

                        <h1>
                            {tour.titulo}
                        </h1>

                        <div className="detail-facts">
                            <span>
                                <span className="material-symbols-outlined">
                                    location_on
                                </span>
                                {tour.destino}
                            </span>
                            <span>
                                <span className="material-symbols-outlined">
                                    calendar_today
                                </span>
                                {tourDuration} dias
                            </span>
                            <span>
                                <span className="material-symbols-outlined">
                                    group
                                </span>
                                {tour.cupos} cupos
                            </span>
                        </div>

                        <p>
                            {tour.descripcion}
                        </p>

                        <h2>
                            S/{tour.precio}
                        </h2>

                        <div className="detail-highlights">
                            <span>
                                <span className="material-symbols-outlined">
                                    travel_explore
                                </span>
                                Guia local
                            </span>
                            <span>
                                <span className="material-symbols-outlined">
                                    support_agent
                                </span>
                                Asistencia 24/7
                            </span>
                            <span>
                                <span className="material-symbols-outlined">
                                    verified
                                </span>
                                Reserva flexible
                            </span>
                        </div>

                    </div>

                </div>

                <div className="itinerary-panel panel">

                    <div className="itinerary-header">
                        <div>
                            <p className="eyebrow">
                                Plan interactivo
                            </p>
                            <h2>
                                Itinerario sugerido
                            </h2>
                        </div>
                        <span>
                            {dias} dias
                        </span>
                    </div>

                    <div className="itinerary-list">
                        {itineraryDays.map((day) => (
                            <button
                                type="button"
                                key={day}
                                className={`itinerary-item ${openDay === day ? "active" : ""}`}
                                onClick={() =>
                                    setOpenDay(openDay === day ? 0 : day)
                                }
                            >
                                <div>
                                    <strong>
                                        Dia {day}
                                    </strong>
                                    <span>
                                        {day === 1
                                            ? "Llegada, bienvenida y primera experiencia"
                                            : "Actividades guiadas, tiempo libre y recomendaciones"}
                                    </span>
                                </div>
                                <small>
                                    {openDay === day ? "Ocultar" : "Ver"}
                                </small>
                            </button>
                        ))}
                    </div>

                </div>

                <div className="detail-config-card">

                    <h2>
                        Configurar reserva
                    </h2>

                    <div className="style-selector">
                        <p>
                            Ritmo del viaje
                        </p>

                        {["relajado", "balanceado", "aventura"].map((style) => (
                            <button
                                type="button"
                                key={style}
                                className={travelStyle === style ? "active" : ""}
                                onClick={() => setTravelStyle(style)}
                            >
                                {style}
                            </button>
                        ))}
                    </div>

                    <div className="detail-input-group">

                        <label>
                            Cantidad de personas
                        </label>

                        <input
                            type="number"
                            min="1"
                            max={tour.cupos || 20}
                            value={cantidadPersonas}
                            onChange={(e) =>
                                setCantidadPersonas(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    <div className="detail-input-group">

                        <label>
                            Dias
                        </label>

                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={dias}
                            onChange={(e) =>
                                setDias(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    <div className="live-summary">
                        <div>
                            <span>
                                Base
                            </span>
                            <strong>
                                S/ {total.toFixed(2)}
                            </strong>
                        </div>
                        <div>
                            <span>
                                Gestion de reserva
                            </span>
                            <strong>
                                S/ {serviceFee.toFixed(2)}
                            </strong>
                        </div>
                        <div className="summary-total">
                            <span>
                                Total estimado
                            </span>
                            <strong>
                                S/ {finalTotal.toFixed(2)}
                            </strong>
                        </div>
                    </div>

                    <button
                        className="detail-continue-btn"
                        onClick={handleContinue}
                    >
                        Continuar
                        <span className="material-symbols-outlined">
                            arrow_forward
                        </span>
                    </button>

                </div>

            </div>

            <Footer />

        </div>

    );

};

export default TourDetail;
