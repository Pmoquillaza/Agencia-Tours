import { useEffect, useState } from "react";

import {
    useParams,
    useNavigate
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookingSteps from "../components/BookingSteps";

import {
    createTraveler
} from "../services/travelerService";

import {
    getReservationById
} from "../services/reservationService";

import "./Travelers.css";

const Travelers = () => {

    const { reservationId } = useParams();

    const navigate = useNavigate();

    const [reservation, setReservation] =
        useState(null);

    const [currentTraveler, setCurrentTraveler] =
        useState(1);

    const [loading, setLoading] =
        useState(true);

    const [traveler, setTraveler] =
        useState({

            nombres: "",

            apellidos: "",

            documento: "",

            fecha_nacimiento: "",

            genero: "",

            telefono: ""

        });

    const [protection, setProtection] =
        useState("comprehensive");

    useEffect(() => {

        const fetchReservation = async () => {

            try {

                const data =
                    await getReservationById(
                        reservationId
                    );

                setReservation(data);

            } catch {

                alert(
                    "Error obteniendo reserva"
                );

            } finally {

                setLoading(false);

            }

        };

        fetchReservation();

    }, [reservationId]);

    const handleChange = (e) => {

        setTraveler({

            ...traveler,

            [e.target.name]:
                e.target.value

        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await createTraveler({

                reservation_id:
                    reservationId,

                ...traveler

            });

            const totalTravelers =
                reservation.cantidad_personas;

            if (
                currentTraveler <
                totalTravelers
            ) {

                const faltan =
                    totalTravelers -
                    currentTraveler;

                alert(
                    `Viajero registrado. Faltan ${faltan} viajero(s)`
                );

                setCurrentTraveler(
                    currentTraveler + 1
                );

                setTraveler({

                    nombres: "",

                    apellidos: "",

                    documento: "",

                    fecha_nacimiento: "",

                    genero: "",

                    telefono: ""

                });

            } else {

                alert(
                    "Todos los viajeros fueron registrados"
                );

                navigate(
                    `/payment/${reservationId}`
                );

            }

        } catch {

            alert(
                "Error registrando viajero"
            );

        }

    };

    if (loading) {

        return (

            <>

                <Navbar />

                <div className="page-shell">
                    <div className="empty-state panel">
                        Cargando...
                    </div>
                </div>

            </>

        );

    }

    const totalTravelers =
        reservation?.cantidad_personas || 1;

    return (

        <>

            <Navbar />

            <div className="travelers-page">

                <div className="travelers-container">

                    <BookingSteps current="travelers" />

                    <h1 className="travelers-title">
                        Datos del viajero
                    </h1>

                    <p className="travelers-subtitle">
                        Completa la informacion de los pasajeros.
                    </p>

                    <div className="traveler-setup-grid">
                        <section className="traveler-setup-card panel">
                            <h2>
                                Cuantas personas viajan?
                            </h2>
                            <p>
                                Generamos un formulario por cada participante registrado en la reserva.
                            </p>

                            <div className="traveler-counter">
                                <button type="button" disabled>
                                    -
                                </button>
                                <strong>
                                    {totalTravelers}
                                </strong>
                                <button type="button" disabled>
                                    +
                                </button>
                            </div>
                        </section>

                        <section className="traveler-setup-card panel">
                            <div className="travel-protection-title">
                                <span className="material-symbols-outlined">
                                    shield
                                </span>
                                <div>
                                    <h2>
                                        Proteccion de viaje
                                    </h2>
                                    <p>
                                        85% de viajeros agregan cobertura para viajar con tranquilidad.
                                    </p>
                                </div>
                            </div>

                            <label className={`insurance-option ${protection === "comprehensive" ? "active" : ""}`}>
                                <input
                                    type="radio"
                                    name="protection"
                                    checked={protection === "comprehensive"}
                                    onChange={() => setProtection("comprehensive")}
                                />
                                <span>
                                    Plan integral
                                </span>
                                <strong>
                                    S/ 45.00
                                </strong>
                                <small>
                                    Cobertura medica, cancelacion y equipaje.
                                </small>
                            </label>

                            <label className={`insurance-option ${protection === "none" ? "active" : ""}`}>
                                <input
                                    type="radio"
                                    name="protection"
                                    checked={protection === "none"}
                                    onChange={() => setProtection("none")}
                                />
                                <span>
                                    Sin seguro
                                </span>
                                <strong>
                                    S/ 0.00
                                </strong>
                                <small>
                                    Continuar bajo responsabilidad del viajero.
                                </small>
                            </label>
                        </section>
                    </div>

                    <progress
                        className="traveler-progress"
                        value={currentTraveler}
                        max={totalTravelers}
                        aria-label="Progreso de registro de viajeros"
                    />

                    <div className="travelers-layout">

                    <form
                        onSubmit={handleSubmit}
                        className="traveler-card"
                    >

                        <h2>
                            Viajero {currentTraveler} de {totalTravelers}
                        </h2>

                        <p className="traveler-note">
                            Usa los datos tal como aparecen en el documento de identidad.
                        </p>

                        <div className="form-group">

                            <label>
                                Nombres
                            </label>

                            <input
                                type="text"
                                name="nombres"
                                value={traveler.nombres}
                                onChange={handleChange}
                                placeholder="Ingrese nombres"
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Apellidos
                            </label>

                            <input
                                type="text"
                                name="apellidos"
                                value={traveler.apellidos}
                                onChange={handleChange}
                                placeholder="Ingrese apellidos"
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Documento
                            </label>

                            <input
                                type="text"
                                name="documento"
                                value={traveler.documento}
                                onChange={handleChange}
                                placeholder="DNI o Pasaporte"
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Fecha de nacimiento
                            </label>

                            <input
                                type="date"
                                name="fecha_nacimiento"
                                value={traveler.fecha_nacimiento}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Genero
                            </label>

                            <select
                                name="genero"
                                value={traveler.genero}
                                onChange={handleChange}
                                required
                            >

                                <option value="">
                                    Seleccione genero
                                </option>

                                <option value="Masculino">
                                    Masculino
                                </option>

                                <option value="Femenino">
                                    Femenino
                                </option>

                            </select>

                        </div>

                        <div className="form-group">

                            <label>
                                Telefono
                            </label>

                            <input
                                type="text"
                                name="telefono"
                                value={traveler.telefono}
                                onChange={handleChange}
                                placeholder="999999999"
                                required
                            />

                        </div>

                        <button
                            type="submit"
                            className="pay-button"
                        >

                            {currentTraveler <
                            totalTravelers
                                ? "Guardar y continuar"
                                : "Ir al pago"}

                        </button>

                    </form>

                    <aside className="traveler-help panel">
                        <p className="eyebrow">
                            Perfil de usuario
                        </p>

                        <h2>
                            Informacion segura
                        </h2>

                        <p>
                            Estos datos se asocian a la reserva para validar pasajeros, emitir comprobantes y continuar al pago.
                        </p>

                        <div className="traveler-checklist">
                            <span>
                                Documento vigente
                            </span>
                            <span>
                                Telefono de contacto
                            </span>
                            <span>
                                Datos completos
                            </span>
                        </div>
                    </aside>

                    </div>

                </div>

            </div>

            <Footer />

        </>

    );

};

export default Travelers;
