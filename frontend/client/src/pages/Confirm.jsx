import { Link, useSearchParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import BookingSteps from "../components/BookingSteps";
import Footer from "../components/Footer";

import "./Confirm.css";

export default function Confirm() {
    const [searchParams] = useSearchParams();
    const reservationId = searchParams.get("reservation");
    const notificationStatus =
        searchParams.get("notification") || "sent";

    const reservationData = JSON.parse(
        localStorage.getItem("reservationData") || "{}"
    );
    const transportData = JSON.parse(
        localStorage.getItem("transportData") || "{}"
    );
    const hotelData = JSON.parse(
        localStorage.getItem("hotelData") || "{}"
    );

    const code = reservationId
        ? `TG-${reservationId.slice(0, 8).toUpperCase()}`
        : "TG-CONFIRMADA";
    const calculatedBaseTotal =
        Number(reservationData?.precio || 0) *
        Number(reservationData?.cantidad_personas || 1) *
        Number(reservationData?.dias || 1);
    const calculatedTransportTotal =
        Number(transportData?.precio || 0) *
        Number(transportData?.cantidad || reservationData?.cantidad_personas || 1);
    const calculatedHotelTotal =
        Number(hotelData?.precio_por_noche || 0) *
        Number(reservationData?.dias || 1);
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
    const estimatedTotal =
        baseTotal + transportTotal + hotelTotal;
    const tripImage =
        reservationData?.imagen ||
        reservationData?.image ||
        hotelData?.imagen ||
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop";

    return (
        <>
            <Navbar />

            <main className="confirm-page">
                <div className="confirm-shell">
                    <BookingSteps current="payment" />

                    <section className="confirm-success">
                        <div className="confirm-mark">
                            <span className="material-symbols-outlined">
                                check_circle
                            </span>
                        </div>

                        <h1>
                            Reserva confirmada
                        </h1>

                        <p>
                            Todo esta listo para tu proxima aventura. Enviamos los detalles y el comprobante a tu correo electronico.
                        </p>

                        <div className="confirm-code">
                            <span>
                                Codigo de reserva
                            </span>
                            <strong>
                                {code}
                            </strong>
                        </div>
                    </section>

                    <section className="confirm-bento">
                        <article className="confirm-itinerary panel">
                            <div className="confirm-trip-image">
                                <img
                                    src={tripImage}
                                    alt={reservationData?.titulo || reservationData?.nombre || "Viaje confirmado"}
                                />
                                <div>
                                    <span>
                                        Tour destacado
                                    </span>
                                    <h2>
                                        {reservationData?.titulo || reservationData?.nombre || "Viaje confirmado"}
                                    </h2>
                                </div>
                            </div>

                            <div className="confirm-detail-grid">
                                <div>
                                    <span className="material-symbols-outlined">
                                        location_on
                                    </span>
                                    <small>
                                        Destino
                                    </small>
                                    <strong>
                                        {reservationData?.destino || "Destino seleccionado"}
                                    </strong>
                                </div>
                                <div>
                                    <span className="material-symbols-outlined">
                                        calendar_today
                                    </span>
                                    <small>
                                        Duracion
                                    </small>
                                    <strong>
                                        {reservationData?.dias || 1} dia(s)
                                    </strong>
                                </div>
                                <div>
                                    <span className="material-symbols-outlined">
                                        group
                                    </span>
                                    <small>
                                        Viajeros
                                    </small>
                                    <strong>
                                        {reservationData?.cantidad_personas || 1}
                                    </strong>
                                </div>
                                <div>
                                    <span className="material-symbols-outlined">
                                        flight_takeoff
                                    </span>
                                    <small>
                                        Transporte
                                    </small>
                                    <strong>
                                        {transportData?.aerolinea || "Incluido"}
                                    </strong>
                                </div>
                                <div>
                                    <span className="material-symbols-outlined">
                                        hotel
                                    </span>
                                    <small>
                                        Alojamiento
                                    </small>
                                    <strong>
                                        {hotelData?.nombre || "Por confirmar"}
                                    </strong>
                                </div>
                                <div>
                                    <span className="material-symbols-outlined">
                                        mail
                                    </span>
                                    <small>
                                        Notificacion
                                    </small>
                                    <strong>
                                        {notificationStatus === "sent"
                                            ? "Correo enviado"
                                            : "Correo en revision"}
                                    </strong>
                                </div>
                            </div>
                        </article>

                        <aside className="confirm-payment panel">
                            <h2>
                                Resumen de pago
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
                            <div className="confirm-total">
                                <span>
                                    Total pagado
                                </span>
                                <strong>
                                    S/ {estimatedTotal.toFixed(2)}
                                </strong>
                            </div>

                            <div className="confirm-secure">
                                <span className="material-symbols-outlined">
                                    verified_user
                                </span>
                                Pago seguro registrado correctamente.
                            </div>
                        </aside>
                    </section>

                    <section className="confirm-actions">
                        <Link
                            to="/reservations"
                            className="primary-btn"
                        >
                            <span className="material-symbols-outlined">
                                receipt_long
                            </span>
                            Ver mi reserva
                        </Link>

                        <Link
                            to="/tours"
                            className="secondary-btn"
                        >
                            <span className="material-symbols-outlined">
                                map
                            </span>
                            Nuevo viaje
                        </Link>

                        <button
                            type="button"
                            className="ghost-btn"
                            onClick={() => window.print()}
                        >
                            <span className="material-symbols-outlined">
                                print
                            </span>
                            Imprimir
                        </button>
                    </section>

                    <section className="confirm-next panel">
                        <h2>
                            Que sigue ahora
                        </h2>
                        <ol>
                            <li>
                                Revisa tu bandeja de entrada para encontrar el comprobante digital.
                            </li>
                            <li>
                                Guarda el codigo de reserva para seguimiento y soporte.
                            </li>
                            <li>
                                Ingresa a Mis viajes cuando quieras revisar el estado de tu itinerario.
                            </li>
                        </ol>
                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}
