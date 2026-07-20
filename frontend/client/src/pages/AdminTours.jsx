import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { useAuth } from "../context/AuthContext";

import {
    createTour,
    deleteTour,
    getTours,
    updateTour
} from "../services/tourService";

import "./AdminTours.css";

const emptyForm = {
    titulo: "",
    destino: "",
    descripcion: "",
    precio: "",
    duracion: "",
    cupos: ""
};

const getResponseMessage = (response) => {

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

const AdminTours = () => {

    const { user } = useAuth();

    const [tours, setTours] = useState([]);

    const [form, setForm] = useState(emptyForm);

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");

    const isAdmin = user?.rol === "admin";

    const averagePrice = tours.length
        ? Math.round(
            tours.reduce(
                (sum, tour) => sum + Number(tour.precio || 0),
                0
            ) / tours.length
        )
        : 0;

    const totalSeats = tours.reduce(
        (sum, tour) => sum + Number(tour.cupos || 0),
        0
    );

    const destinationCount = new Set(
        tours.map((tour) => String(tour.destino || "").trim()).filter(Boolean)
    ).size;

    const loadTours = async () => {

        try {

            const data = await getTours();

            setTours(data);

        } catch (error) {

            setMessage(getErrorMessage(error));

        }

    };

    useEffect(() => {

        if (isAdmin) {

            loadTours();

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

    const handleEdit = (tour) => {

        setEditingId(tour.id);

        setForm({
            titulo: tour.titulo || "",
            destino: tour.destino || "",
            descripcion: tour.descripcion || "",
            precio: tour.precio || "",
            duracion: tour.duracion || "",
            cupos: tour.cupos || ""
        });

        setMessage("");

    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            setLoading(true);

            const response = editingId
                ? await updateTour(editingId, form)
                : await createTour(form);

            setMessage(getResponseMessage(response));

            resetForm();

            await loadTours();

        } catch (error) {

            setMessage(getErrorMessage(error));

        } finally {

            setLoading(false);

        }

    };

    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Deseas eliminar este tour?"
        );

        if (!confirmDelete) {

            return;

        }

        try {

            setLoading(true);

            const response = await deleteTour(id);

            setMessage(getResponseMessage(response));

            if (editingId === id) {

                resetForm();

            }

            await loadTours();

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
                        Solo un administrador puede gestionar tours.
                    </div>

                )}

                {isAdmin && (

                    <>

                <div className="page-header">

                    <div>

                        <p className="eyebrow">
                            Administracion
                        </p>

                        <h1 className="page-title">
                            Gestion de tours
                        </h1>

                        <p className="page-subtitle">
                            Crea, edita o elimina tours. Cada operacion queda registrada en auditoria.
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
                                ? "Editar tour"
                                : "Crear tour"}
                        </h2>

                        <div className="admin-form-grid">

                            <label>
                                Nombre
                                <input
                                    name="titulo"
                                    value={form.titulo}
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
                                Duracion
                                <input
                                    type="number"
                                    min="1"
                                    name="duracion"
                                    value={form.duracion}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                Cupos
                                <input
                                    type="number"
                                    min="1"
                                    name="cupos"
                                    value={form.cupos}
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
                                        : "Crear tour"}
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
                                    travel_explore
                                </span>
                                <p>Paquetes</p>
                                <strong>{tours.length}</strong>
                            </article>

                            <article>
                                <span className="material-symbols-outlined">
                                    location_on
                                </span>
                                <p>Destinos</p>
                                <strong>{destinationCount}</strong>
                            </article>

                            <article>
                                <span className="material-symbols-outlined">
                                    group
                                </span>
                                <p>Cupos</p>
                                <strong>{totalSeats}</strong>
                            </article>

                            <article>
                                <span className="material-symbols-outlined">
                                    payments
                                </span>
                                <p>Precio prom.</p>
                                <strong>S/{averagePrice}</strong>
                            </article>
                        </div>

                        <h2>
                            Tours registrados
                        </h2>

                        <div className="admin-table-scroll">

                            <table>

                                <thead>
                                    <tr>
                                        <th>Tour</th>
                                        <th>Destino</th>
                                        <th>Precio</th>
                                        <th>Cupos</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {tours.map((tour) => (

                                        <tr key={tour.id}>
                                            <td>{tour.titulo}</td>
                                            <td>{tour.destino}</td>
                                            <td>S/{tour.precio}</td>
                                            <td>{tour.cupos}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="secondary-btn"
                                                        type="button"
                                                        onClick={() =>
                                                            handleEdit(tour)
                                                        }
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        className="danger-btn"
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(tour.id)
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

export default AdminTours;
