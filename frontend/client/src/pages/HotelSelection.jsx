import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookingSteps from "../components/BookingSteps";
import { getHotels } from "../services/hotelService";

import {
    createReservation
} from "../services/reservationService";

import "./HotelSelection.css";

const normalizeText = (value) =>
    String(value || "")
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

const HotelSelection = () => {

    const navigate = useNavigate();

    const [hotels, setHotels] = useState([]);

    const [selectedHotel, setSelectedHotel] =
        useState(null);

    const [minStars, setMinStars] = useState(0);

    const reservationData = useMemo(() => {
        const savedReservation = localStorage.getItem("reservationData");
        return savedReservation ? JSON.parse(savedReservation) : null;
    }, []);

    const loadHotels = useCallback(async () => {

        try {

            const data = await getHotels();
            const normalizedHotels = (data || []).map((hotel) => ({
                ...hotel,
                nombre:
                    hotel.nombre ||
                    `Hotel seleccionado ${reservationData?.destino || ""}`,
                ciudad:
                    hotel.ciudad ||
                    reservationData?.destino ||
                    "Destino",
                estrellas:
                    Number(hotel.estrellas || 0) > 0
                        ? Number(hotel.estrellas)
                        : 4,
                descripcion:
                    hotel.descripcion ||
                    "Alojamiento recomendado por su ubicacion, comodidad y relacion precio-servicio.",
                precio_por_noche:
                    Number(hotel.precio_por_noche || 0) > 0
                        ? Number(hotel.precio_por_noche)
                        : 180,
                imagen:
                    hotel.imagen ||
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop"
            }));

            const filtered = normalizedHotels.filter(
                (hotel) =>
                    normalizeText(hotel.ciudad) ===
                    normalizeText(reservationData?.destino)
            );

            const defaultHotel = {
                id: "default-hotel",
                nombre: `Hotel Turistico ${reservationData?.destino || ""}`,
                ciudad: reservationData?.destino,
                estrellas: 4,
                descripcion:
                    "Alojamiento recomendado para completar tu reserva.",
                precio_por_noche: 180,
                imagen:
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop"
            };

            setHotels(
                filtered.length > 0
                    ? filtered
                    : [defaultHotel]
            );

        } catch {

            setHotels([
                {
                    id: "default-hotel",
                    nombre: `Hotel Turistico ${reservationData?.destino || ""}`,
                    ciudad: reservationData?.destino,
                    estrellas: 4,
                    descripcion:
                        "Alojamiento recomendado para completar tu reserva.",
                    precio_por_noche: 180,
                    imagen:
                        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop"
                }
            ]);

        }

    }, [reservationData?.destino]);

    useEffect(() => {

        if (!reservationData) {

            alert(
                "No existe reserva activa"
            );

            navigate("/tours");

            return;

        }

        loadHotels();

    }, [loadHotels, navigate, reservationData]);

    const visibleHotels = useMemo(() => {
        return hotels.filter((hotel) =>
            Number(hotel.estrellas || 0) >= Number(minStars)
        );
    }, [hotels, minStars]);

    const hotelTotal = useMemo(() => {
        return Number(selectedHotel?.precio_por_noche || 0) *
            Number(reservationData?.dias || 1);
    }, [selectedHotel?.precio_por_noche, reservationData?.dias]);

    const handleContinue = async () => {

        try {

            if (!selectedHotel) {

                alert(
                    "Selecciona un hotel"
                );

                return;

            }

            if (!reservationData) {

                alert(
                    "No existe informacion de reserva"
                );

                return;

            }

            const cantidadPersonas =
                Number(
                    reservationData?.cantidad_personas
                ) || 1;

            localStorage.setItem(
                "hotelData",
                JSON.stringify(selectedHotel)
            );

            const transportData = JSON.parse(
                localStorage.getItem("transportData") || "{}"
            );

            const nuevaReserva =
                await createReservation({

                    tour_id:
                        reservationData.id,

                    cantidad_personas:
                        cantidadPersonas,

                    tipo_transporte:
                        reservationData?.tipo_transporte ||
                        "vuelo",

                    hotel: true,

                    dias:
                        Number(
                            reservationData?.dias
                        ) || 1,

                    transport_id:
                        String(transportData?.id || "").startsWith("default-")
                            ? null
                            : transportData?.id,

                    hotel_id:
                        String(selectedHotel?.id || "").startsWith("default-")
                            ? null
                            : selectedHotel?.id,

                    precio_transporte_unitario:
                        Number(transportData?.precio || 0),

                    precio_hotel_noche:
                        Number(selectedHotel?.precio_por_noche || 0),

                    transport_nombre:
                        transportData?.aerolinea ||
                        "Transporte seleccionado",

                    hotel_nombre:
                        selectedHotel?.nombre ||
                        "Hospedaje seleccionado"

                });

            const reservationId =
                nuevaReserva.reservation_id;

            if (!reservationId) {

                alert(
                    "La reserva no devolvio ID"
                );

                return;

            }

            localStorage.setItem(
                "reservationData",
                JSON.stringify({
                    ...reservationData,
                    reservation_id: reservationId,
                    subtotal: nuevaReserva.subtotal,
                    impuesto: nuevaReserva.impuesto,
                    precio_tour: nuevaReserva.precio_tour,
                    precio_transporte: nuevaReserva.precio_transporte,
                    precio_hotel: nuevaReserva.precio_hotel,
                    total: nuevaReserva.total
                })
            );

            navigate(
                `/travelers/${reservationId}`
            );

        } catch {

            alert(
                "Error creando reserva"
            );

        }

    };

    return (

        <div className="hotel-page">

            <Navbar />

            <div className="hotel-container">

                <BookingSteps current="hotel" />

                <div className="page-header">

                    <div>

                        <p className="eyebrow">
                            Paso 3
                        </p>

                        <h1 className="hotel-title">
                            Seleccionar hotel
                        </h1>

                        <p className="page-subtitle">
                            Elige una estadia acorde al viaje. Puedes comparar estrellas, precio por noche y servicios incluidos.
                        </p>

                    </div>

                </div>

                <div className="hotel-layout">

                    <section>

                <div className="hotel-destination info-strip">

                    <div>

                        <h2>
                            Ciudad seleccionada
                        </h2>

                        <p>
                            {reservationData?.destino}
                        </p>

                    </div>

                </div>

                <div className="hotel-filter panel">
                    <div>
                        <label htmlFor="hotel-stars">
                            Estrellas minimas
                        </label>

                        <select
                            id="hotel-stars"
                            value={minStars}
                            onChange={(event) =>
                                setMinStars(Number(event.target.value))
                            }
                        >
                            <option value="0">
                                Todas
                            </option>
                            <option value="3">
                                3 estrellas
                            </option>
                            <option value="4">
                                4 estrellas
                            </option>
                            <option value="5">
                                5 estrellas
                            </option>
                        </select>
                    </div>

                    <span className="pill">
                        {visibleHotels.length} opciones disponibles
                    </span>
                </div>

                <div className="hotel-grid">

                    {visibleHotels.map((hotel) => (

                        <div
                            key={hotel.id}
                            className={`hotel-card ${
                                selectedHotel?.id ===
                                hotel.id
                                    ? "selected-hotel"
                                    : ""
                            }`}
                        >

                            <img
                                src={
                                    hotel.imagen ||
                                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop"
                                }
                                alt={hotel.nombre || "Hotel"}
                            />

                            <div className="hotel-card-body">

                                <h2>
                                    {hotel.nombre}
                                </h2>

                                <div className="hotel-stars">
                                    {"*".repeat(Number(hotel.estrellas || 4))}
                                </div>

                                <p>
                                    <strong>Ciudad:</strong>{" "}
                                    {hotel.ciudad}
                                </p>

                                <p>
                                    <strong>Estrellas:</strong>{" "}
                                    {hotel.estrellas || 5}
                                </p>

                                <p>
                                    <strong>Descripcion:</strong>{" "}
                                    {hotel.descripcion ||
                                        "Hotel premium"}
                                </p>

                                <div className="hotel-amenities">
                                    <span>
                                        Desayuno
                                    </span>
                                    <span>
                                        Wifi
                                    </span>
                                    <span>
                                        Asistencia
                                    </span>
                                </div>

                                <p className="hotel-price">
                                    S/
                                    {hotel.precio_por_noche || 350}
                                    <span>
                                        /noche
                                    </span>
                                </p>

                                <button
                                    onClick={() =>
                                        setSelectedHotel(
                                            hotel
                                        )
                                    }
                                >

                                    {selectedHotel?.id ===
                                    hotel.id
                                        ? "Seleccionado"
                                        : "Seleccionar"}

                                </button>

                            </div>

                        </div>

                    ))}

                </div>

                <button
                    className="hotel-continue-btn"
                    onClick={handleContinue}
                    disabled={!selectedHotel}
                >
                    Continuar
                </button>

                    </section>

                    <aside className="hotel-summary panel">
                        <p className="eyebrow">
                            Resumen de estadia
                        </p>

                        <h2>
                            {selectedHotel?.nombre || "Selecciona un hotel"}
                        </h2>

                        <div className="hotel-summary-row">
                            <span>
                                Destino
                            </span>
                            <strong>
                                {reservationData?.destino}
                            </strong>
                        </div>

                        <div className="hotel-summary-row">
                            <span>
                                Noches
                            </span>
                            <strong>
                                {reservationData?.dias || 1}
                            </strong>
                        </div>

                        <div className="hotel-summary-row">
                            <span>
                                Precio noche
                            </span>
                            <strong>
                                S/ {selectedHotel?.precio_por_noche || 0}
                            </strong>
                        </div>

                        <div className="hotel-summary-total">
                            <span>
                                Hospedaje estimado
                            </span>
                            <strong>
                                S/ {hotelTotal.toFixed(2)}
                            </strong>
                        </div>
                    </aside>

                </div>

            </div>

            <Footer />

        </div>

    );

};

export default HotelSelection;
