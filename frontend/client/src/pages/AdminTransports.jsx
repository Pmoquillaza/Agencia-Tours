import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

import {
    createFlight,
    deleteFlight,
    getFlights,
    updateFlight
} from "../services/flightService";

import "./AdminTours.css";

const emptyForm = {
    origen: "",
    destino: "",
    aerolinea: "",
    tipo: "vuelo",
    fecha_salida: "",
    fecha_llegada: "",
    precio: "",
    capacidad: ""
};

const normalizeTransportType = (type) => {
    const normalized = String(type || "").toLowerCase();

    return ["avion", "avi\u00f3n", "vuelo"].includes(normalized)
        ? "vuelo"
        : "bus";
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

const AdminTransports = () => {
    const { user } = useAuth();

    const [transports, setTransports] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const isAdmin = user?.rol === "admin";

    const flightCount = transports.filter(
        (transport) => normalizeTransportType(transport.tipo) === "vuelo"
    ).length;

    const busCount = transports.filter(
        (transport) => normalizeTransportType(transport.tipo) === "bus"
    ).length;

    const totalCapacity = transports.reduce(
        (sum, transport) => sum + Number(transport.capacidad || 0),
        0
    );

    const averagePrice = transports.length
        ? Math.round(
            transports.reduce(
                (sum, transport) => sum + Number(transport.precio || 0),
                0
            ) / transports.length
        )
        : 0;

    const loadTransports = async () => {
        try {
            setTransports(await getFlights());
        } catch (error) {
            setMessage(getErrorMessage(error));
        }
    };

    useEffect(() => {
        if (isAdmin) {
            loadTransports();
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

    const handleEdit = (transport) => {
        setEditingId(transport.id);
        setForm({
            origen: transport.origen || "",
            destino: transport.destino || "",
            aerolinea: transport.aerolinea || "",
            tipo: normalizeTransportType(transport.tipo),
            fecha_salida: transport.fecha_salida || "",
            fecha_llegada: transport.fecha_llegada || "",
            precio: transport.precio || "",
            capacidad: transport.capacidad || ""
        });
        setMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);

            const response = editingId
                ? await updateFlight(editingId, form)
                : await createFlight(form);

            setMessage(getMessage(response));
            resetForm();
            await loadTransports();
        } catch (error) {
            setMessage(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Deseas eliminar este transporte?")) {
            return;
        }

        try {
            setLoading(true);
            setMessage(getMessage(await deleteFlight(id)));
            await loadTransports();
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
                        Solo un administrador puede gestionar transportes.
                    </div>
                )}

                {isAdmin && (
                    <>
                        <div className="page-header">
                            <div>
                                <p className="eyebrow">Administracion</p>
                                <h1 className="page-title">
                                    Gestion de transportes
                                </h1>
                                <p className="page-subtitle">
                                    Administra opciones de vuelo y bus para los paquetes turisticos.
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
                                        ? "Editar transporte"
                                        : "Crear transporte"}
                                </h2>

                                <div className="admin-form-grid">
                                    <label>
                                        Origen
                                        <input
                                            name="origen"
                                            value={form.origen}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>

                                    <label>
                                        Destino
                                        <input
                                            name="destino"
                                            value={form.destino}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>

                                    <label>
                                        Empresa
                                        <input
                                            name="aerolinea"
                                            value={form.aerolinea}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>

                                    <label>
                                        Tipo
                                        <select
                                            name="tipo"
                                            value={form.tipo}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="vuelo">
                                                Vuelo
                                            </option>
                                            <option value="bus">
                                                Bus
                                            </option>
                                        </select>
                                    </label>

                                    <label>
                                        Fecha salida
                                        <input
                                            type="date"
                                            name="fecha_salida"
                                            value={form.fecha_salida}
                                            onChange={handleChange}
                                        />
                                    </label>

                                    <label>
                                        Fecha llegada
                                        <input
                                            type="date"
                                            name="fecha_llegada"
                                            value={form.fecha_llegada}
                                            onChange={handleChange}
                                        />
                                    </label>

                                    <label>
                                        Precio
                                        <input
                                            type="number"
                                            min="1"
                                            name="precio"
                                            value={form.precio}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>

                                    <label>
                                        Capacidad
                                        <input
                                            type="number"
                                            min="1"
                                            name="capacidad"
                                            value={form.capacidad}
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
                                                : "Crear transporte"}
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
                                            flight_takeoff
                                        </span>
                                        <p>Vuelos</p>
                                        <strong>{flightCount}</strong>
                                    </article>

                                    <article>
                                        <span className="material-symbols-outlined">
                                            directions_bus
                                        </span>
                                        <p>Buses</p>
                                        <strong>{busCount}</strong>
                                    </article>

                                    <article>
                                        <span className="material-symbols-outlined">
                                            airline_seat_recline_normal
                                        </span>
                                        <p>Capacidad</p>
                                        <strong>{totalCapacity}</strong>
                                    </article>

                                    <article>
                                        <span className="material-symbols-outlined">
                                            payments
                                        </span>
                                        <p>Precio prom.</p>
                                        <strong>S/{averagePrice}</strong>
                                    </article>
                                </div>

                                <h2>Transportes registrados</h2>

                                <div className="admin-table-scroll">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Empresa</th>
                                                <th>Tipo</th>
                                                <th>Ruta</th>
                                                <th>Precio</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {transports.map((transport) => (
                                                <tr key={transport.id}>
                                                    <td>{transport.aerolinea}</td>
                                                    <td>{transport.tipo}</td>
                                                    <td>
                                                        {transport.origen} - {transport.destino}
                                                    </td>
                                                    <td>S/{transport.precio}</td>
                                                    <td>
                                                        <div className="table-actions">
                                                            <button
                                                                className="secondary-btn"
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEdit(transport)
                                                                }
                                                            >
                                                                Editar
                                                            </button>

                                                            <button
                                                                className="danger-btn"
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDelete(transport.id)
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

export default AdminTransports;
