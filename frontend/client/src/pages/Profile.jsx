import { useEffect, useState } from "react";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
    getProfile,
    updateProfile
} from "../services/authService";

import "./Profile.css";

const cleanDisplayValue = (value) => {
    const normalized = String(value ?? "").trim();

    if (
        !normalized ||
        ["undefined", "null", "nan"].includes(normalized.toLowerCase())
    ) {
        return "";
    }

    return normalized;
};

const Profile = () => {
    const { user, updateUser } = useAuth();

    const [form, setForm] = useState({
        nombre: user?.nombre || "",
        apellido: cleanDisplayValue(user?.apellido),
        telefono: cleanDisplayValue(user?.telefono),
        documento: cleanDisplayValue(user?.documento)
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await getProfile();
                const profile = response.usuario;

                setForm({
                    nombre: cleanDisplayValue(profile.nombre),
                    apellido: cleanDisplayValue(profile.apellido),
                    telefono: cleanDisplayValue(profile.telefono),
                    documento: cleanDisplayValue(profile.documento)
                });

                updateUser(profile);
            } catch {
                setMessage("No se pudo cargar el perfil");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [updateUser]);

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setMessage("");

            const payload = {
                nombre: cleanDisplayValue(form.nombre),
                apellido: cleanDisplayValue(form.apellido),
                telefono: cleanDisplayValue(form.telefono),
                documento: cleanDisplayValue(form.documento)
            };

            const response = await updateProfile(payload);

            updateUser(response.usuario);
            setForm({
                nombre: cleanDisplayValue(response.usuario.nombre),
                apellido: cleanDisplayValue(response.usuario.apellido),
                telefono: cleanDisplayValue(response.usuario.telefono),
                documento: cleanDisplayValue(response.usuario.documento)
            });
            setMessage("Perfil actualizado correctamente");
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "No se pudo actualizar el perfil"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="profile-page">
            <Navbar />

            <main className="page-shell">
                <div className="page-header">
                    <div>
                        <p className="eyebrow">
                            Perfil de usuario
                        </p>

                        <h1 className="page-title">
                            Mi cuenta
                        </h1>

                        <p className="page-subtitle">
                            Actualiza tus datos personales para que tus reservas, viajeros y confirmaciones tengan informacion correcta.
                        </p>
                    </div>
                </div>

                <div className="profile-layout">
                    <aside className="profile-summary panel">
                        <div className="profile-avatar">
                            {(form.nombre || "U").slice(0, 1)}
                        </div>

                        <h2>
                            {form.nombre || "Usuario"} {form.apellido}
                        </h2>

                        <p>
                            {user?.correo || user?.email}
                        </p>

                        <div className="profile-status">
                            <span>
                                Rol
                            </span>
                            <strong>
                                {user?.rol || "cliente"}
                            </strong>
                        </div>

                        <div className="profile-status">
                            <span>
                                Estado
                            </span>
                            <strong>
                                {user?.estado || "activo"}
                            </strong>
                        </div>
                    </aside>

                    <form
                        className="profile-form panel"
                        onSubmit={handleSubmit}
                    >
                        <div className="profile-form-header">
                            <div>
                                <p className="eyebrow">
                                    Datos personales
                                </p>

                                <h2>
                                    Informacion del titular
                                </h2>
                            </div>

                            <span className="status-pill confirmed">
                                Verificado
                            </span>
                        </div>

                        {loading ? (
                            <div className="empty-state">
                                Cargando perfil...
                            </div>
                        ) : (
                            <div className="profile-grid">
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
                                    Apellido
                                    <input
                                        name="apellido"
                                        value={form.apellido}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>

                                <label>
                                    Telefono
                                    <input
                                        name="telefono"
                                        value={form.telefono}
                                        onChange={handleChange}
                                        placeholder="999999999"
                                    />
                                </label>

                                <label>
                                    Documento
                                    <input
                                        name="documento"
                                        value={form.documento}
                                        onChange={handleChange}
                                        placeholder="DNI o pasaporte"
                                    />
                                </label>
                            </div>
                        )}

                        <div className="profile-note">
                            <strong>
                                Seguridad
                            </strong>
                            <span>
                                El correo y rol no se editan desde este panel para mantener control de acceso y auditoria.
                            </span>
                        </div>

                        {message && (
                            <p className="profile-message">
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="primary-btn"
                            disabled={saving || loading}
                        >
                            {saving
                                ? "Guardando..."
                                : "Guardar cambios"}
                        </button>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Profile;
