import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookingSteps from "../components/BookingSteps";
import { Link } from "react-router-dom";

import "./ReservationSummary.css";

const ReservationSummary = () => {
    const reservationData = JSON.parse(
        localStorage.getItem("reservationData") || "{}"
    );

    const transportData = JSON.parse(
        localStorage.getItem("transportData") || "{}"
    );

    const hotelData = JSON.parse(
        localStorage.getItem("hotelData") || "{}"
    );

    const people = Number(reservationData?.cantidad_personas || 1);
    const days = Number(reservationData?.dias || 1);
    const calculatedBaseTotal = Number(reservationData?.precio || 0) * people * days;
    const calculatedTransportTotal =
        Number(transportData?.precio || 0) *
        Number(transportData?.cantidad || people);
    const calculatedHotelTotal = Number(hotelData?.precio_por_noche || 0) * days;
    const baseTotal =
        Number(reservationData?.precio_tour || 0) > 0
            ? Number(reservationData.precio_tour)
            : calculatedBaseTotal;
    const transportTotal =
        Number(reservationData?.precio_transporte || 0) > 0
            ? Number(reservationData.precio_transporte)
            : calculatedTransportTotal;
    const hotelTotal =
        Number(reservationData?.precio_hotel || 0) > 0
            ? Number(reservationData.precio_hotel)
            : calculatedHotelTotal;
    const taxes = Number(reservationData?.impuesto || 0);
    const total = baseTotal + transportTotal + hotelTotal + taxes;
    const savedReservationId =
        reservationData?.reservation_id ||
        reservationData?.id_reserva;

    const tripImage =
        reservationData?.imagen ||
        hotelData?.imagen ||
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop";

    return (
        <div className="summary-page">
            <Navbar />

            <main className="summary-shell">
                <BookingSteps current="payment" />

                <h1>
                    Review Your Booking
                </h1>

                <section className="summary-layout">
                    <div className="summary-main">
                        <article className="summary-package panel">
                            <img
                                src={tripImage}
                                alt={reservationData?.titulo || reservationData?.nombre || "Reserva"}
                            />

                            <div>
                                <p className="eyebrow">
                                    Package Details
                                </p>
                                <h2>
                                    {reservationData?.titulo || reservationData?.nombre || "Reserva turistica"}
                                </h2>
                                <p>
                                    {reservationData?.descripcion || "Experiencia seleccionada con servicios conectados para completar tu viaje."}
                                </p>

                                <div className="summary-chip-row">
                                    <span>
                                        <span className="material-symbols-outlined">
                                            location_on
                                        </span>
                                        {reservationData?.destino || "Destino"}
                                    </span>
                                    <span>
                                        <span className="material-symbols-outlined">
                                            calendar_today
                                        </span>
                                        {days} dias
                                    </span>
                                    <span>
                                        <span className="material-symbols-outlined">
                                            group
                                        </span>
                                        {people} viajero(s)
                                    </span>
                                </div>
                            </div>
                        </article>

                        <div className="summary-service-grid">
                            <article className="panel">
                                <span className="summary-icon material-symbols-outlined">
                                    hotel
                                </span>
                                <h2>
                                    {hotelData?.nombre || "Hotel pendiente"}
                                </h2>
                                <p>
                                    {hotelData?.ciudad || reservationData?.destino || "Ciudad pendiente"}
                                </p>
                                <strong>
                                    S/ {Number(hotelData?.precio_por_noche || 0).toFixed(2)} / noche
                                </strong>
                            </article>

                            <article className="panel">
                                <span className="summary-icon material-symbols-outlined">
                                    flight_takeoff
                                </span>
                                <h2>
                                    {transportData?.aerolinea || "Transporte pendiente"}
                                </h2>
                                <p>
                                    {transportData?.origen || "Origen"} - {transportData?.destino || reservationData?.destino || "Destino"}
                                </p>
                                <strong>
                                    S/ {Number(transportData?.precio || 0).toFixed(2)} / persona
                                </strong>
                            </article>
                        </div>

                        <article className="summary-travelers panel">
                            <div>
                                <p className="eyebrow">
                                    Traveler Information
                                </p>
                                <h2>
                                    Pasajeros registrados
                                </h2>
                            </div>

                            <div className="summary-traveler-list">
                                {Array.from({ length: people }, (_, index) => (
                                    <div key={index}>
                                        <span>
                                            {index + 1}
                                        </span>
                                        <strong>
                                            Viajero {index + 1}
                                        </strong>
                                        <small>
                                            Datos validados en el siguiente paso
                                        </small>
                                    </div>
                                ))}
                            </div>
                        </article>
                    </div>

                    <aside className="summary-price panel">
                        <h2>
                            Price Breakdown
                        </h2>

                        <div>
                            <span>
                                Tour
                            </span>
                            <strong>
                                S/ {baseTotal.toFixed(2)}
                            </strong>
                        </div>
                        <div>
                            <span>
                                Transporte
                            </span>
                            <strong>
                                S/ {transportTotal.toFixed(2)}
                            </strong>
                        </div>
                        <div>
                            <span>
                                Hospedaje
                            </span>
                            <strong>
                                S/ {hotelTotal.toFixed(2)}
                            </strong>
                        </div>
                        <div>
                            <span>
                                Tasas e impuestos
                            </span>
                            <strong>
                                S/ {taxes.toFixed(2)}
                            </strong>
                        </div>
                        <div className="summary-total-row">
                            <span>
                                Total
                            </span>
                            <strong>
                                S/ {total.toFixed(2)}
                            </strong>
                        </div>

                        <Link
                            to={savedReservationId ? `/payment/${savedReservationId}` : "/tours"}
                            className="primary-btn"
                        >
                            <span className="material-symbols-outlined">
                                payments
                            </span>
                            {savedReservationId
                                ? "Continue to Payment"
                                : "Elegir paquete"}
                        </Link>
                    </aside>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default ReservationSummary;
