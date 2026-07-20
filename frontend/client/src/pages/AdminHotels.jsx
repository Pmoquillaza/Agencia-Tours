import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

import {
    createHotel,
    deleteHotel,
    getHotels,
    updateHotel
} from "../services/hotelService";

import "./AdminTours.css";

const emptyForm = {
    nombre: "",
    ciudad: "",
    estrellas: "",
    descripcion: "",
    precio_por_noche: ""
};

const getMessage = (response) => {
    if (typeof response !== "string") {
        return "Operacion realizada correctamente";
    }

    return response.match(
        /<message>\s*([\s\S]*?)\s*<\/message>/
    )?.[1] || "Operacion realizada correctamente";
};

const getErrorMessage = (error) => {
    const data = error.response?.data;

    if (typeof data === "string") {
        return data.match(
            /<message>\s*([\s\S]*?)\s*<\/message>/
        )?.[1] || data;
    }

    return data?.message || "No se pudo completar la operacion";
};

const AdminHotels = () => {
    const { user } = useAuth();

    const [hotels, setHotels] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const isAdmin = user?.rol === "admin";

    const averageNightPrice = hotels.length
        ? Math.round(
            hotels.reduce(
                (sum, hotel) => sum + Number(hotel.precio_por_noche || 0),
                0
            ) / hotels.length
        )
        : 0;

    const cityCount = new Set(
        hotels.map((hotel) => String(hotel.ciudad || "").trim()).filter(Boolean)
    ).size;

    const premiumHotels = hotels.filter(
        (hotel) => Number(hotel.estrellas || 0) >= 4
    ).length;

    const loadHotels = async () => {
        try {
            setHotels(await getHotels());
        } catch (error) {
            setMessage(getErrorMessage(error));
        }
    };

    useEffect(() => {
        if (isAdmin) {
            loadHotels();
        }
    }, [isAdmin]);

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const handleEdit = (hotel) => {
        setEditingId(hotel.id);
        setForm({
            nombre: hotel.nombre || "",
            ciudad: hotel.ciudad || "",
            estrellas: hotel.estrellas || "",
            descripcion: hotel.descripcion || "",
            precio_por_noche: hotel.precio_por_noche || ""
        });
        setMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);

            const response = editingId
                ? await updateHotel(editingId, form)
                : await createHotel(form);

            setMessage(getMessage(response));
            resetForm();
            await loadHotels();
        } catch (error) {
            setMessage(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Deseas eliminar este hotel?")) {
            return;
        }

        try {
            setLoading(true);
            setMessage(getMessage(await deleteHotel(id)));
            await loadHotels();
        } catch (error) {
            setMessage(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-tours-page">
            <Navbar />

            <div className="page-shell">
                {!isAdmin && (
                    <div className="empty-state panel">
                        Solo un administrador puede gestionar hospedajes.
                    </div>
                )}

                {isAdmin && (
                    <>
                        <div className="page-header">
                            <div>
                                <p className="eyebrow">Administracion</p>
                                <h1 className="page-title">
                                    Gestion de hospedajes
                                </h1>
                                <p className="page-subtitle">
                                    Crea, edita o elimina hoteles disponibles para las reservas.
                                </p>
                            </div>
                        </div>

                        <div className="admin-layout">
                            <form
                                className="admin-form panel"
                                onSubmit={handleSubmit}
                            >
                                <h2>
                                    {editingId
                                        ? "Editar hotel"
                                        : "Crear hotel"}
                                </h2>

                                <div className="admin-form-grid">
                                    <label>
                                        Nombre
                                        <input
                                            name="nombre"
                                            value={form.nombre}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>

                                    <label>
                                        Ciudad
                                        <input
                                            name="ciudad"
                                            value={form.ciudad}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>

                                    <label>
                                        Estrellas
                                        <input
                                            type="number"
                                            min="1"
                                            max="5"
                                            name="estrellas"
                                            value={form.estrellas}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>

                                    <label>
                                        Precio por noche
                                        <input
                                            type="number"
                                            min="1"
                                            name="precio_por_noche"
                                            value={form.precio_por_noche}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>

                                    <label className="admin-form-wide">
                                        Descripcion
                                        <input
                                            name="descripcion"
                                            value={form.descripcion}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>
                                </div>

                                <div className="admin-actions">
                                    <button
                                        className="primary-btn"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Guardando..."
                                            : editingId
                                                ? "Guardar cambios"
                                                : "Crear hotel"}
                                    </button>

                                    {editingId && (
                                        <button
                                            className="secondary-btn"
                                            type="button"
                                            onClick={resetForm}
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>

                                {message && (
                                    <p className="admin-message">
                                        {message}
                                    </p>
                                )}
                            </form>

                            <div className="admin-table panel">
                                <div className="admin-kpis">
                                    <article>
                                        <span className="material-symbols-outlined">
                                            hotel
                                        </span>
                                        <p>Hoteles</p>
                                        <strong>{hotels.length}</strong>
                                    </article>

                                    <article>
                                        <span className="material-symbols-outlined">
                                            location_city
                                        </span>
                                        <p>Ciudades</p>
                                        <strong>{cityCount}</strong>
                                    </article>

                                    <article>
                                        <span className="material-symbols-outlined">
                                            stars
                                        </span>
                                        <p>Premium</p>
                                        <strong>{premiumHotels}</strong>
                                    </article>

                                    <article>
                                        <span className="material-symbols-outlined">
                                            payments
                                        </span>
                                        <p>Noche prom.</p>
                                        <strong>S/{averageNightPrice}</strong>
                                    </article>
                                </div>

                                <h2>Hoteles registrados</h2>

                                <div className="admin-table-scroll">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Hotel</th>
                                                <th>Ciudad</th>
                                                <th>Estrellas</th>
                                                <th>Precio</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {hotels.map((hotel) => (
                                                <tr key={hotel.id}>
                                                    <td>{hotel.nombre}</td>
                                                    <td>{hotel.ciudad}</td>
                                                    <td>{hotel.estrellas}</td>
                                                    <td>S/{hotel.precio_por_noche}</td>
                                                    <td>
                                                        <div className="table-actions">
                                                            <button
                                                                className="secondary-btn"
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEdit(hotel)
                                                                }
                                                            >
                                                                Editar
                                                            </button>

                                                            <button
                                                                className="danger-btn"
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDelete(hotel.id)
                                                                }
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default AdminHotels;
