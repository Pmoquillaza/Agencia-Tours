import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
    registerUser,
    verifyAuthCode
} from "../services/authService";

import "./Register.css";
import Footer from "../components/Footer";

const Register = () => {

    const navigate = useNavigate();

    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationPending, setVerificationPending] = useState(false);
    const [pendingEmail, setPendingEmail] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setStatusMessage("");

            if (
                !nombre.trim() ||
                !apellido.trim() ||
                !email.trim() ||
                password.length < 6
            ) {
                alert(
                    "Completa nombre, apellido, correo y una contrasena de al menos 6 caracteres"
                );
                return;
            }

            const response = await registerUser({
                nombre,
                apellido,
                email,
                password
            });

            if (response?.requires_verification) {
                setPendingEmail(response.correo || email);
                setVerificationPending(true);
                setStatusMessage(
                    response.message ||
                    "Te enviamos un codigo de verificacion al correo."
                );
                return;
            }

            alert("Usuario registrado correctamente");
            navigate("/login");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Error registrando usuario"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setStatusMessage("");

            const response = await verifyAuthCode({
                email: pendingEmail || email,
                code: verificationCode,
                purpose: "registro"
            });

            alert(
                response?.message ||
                "Correo verificado correctamente"
            );

            navigate("/login");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "No se pudo verificar el codigo"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="auth-page">
                <header className="auth-topbar">
                    <button
                        type="button"
                        className="auth-brand"
                        onClick={() => navigate("/")}
                    >
                        <span className="material-symbols-outlined">
                            explore
                        </span>
                        <strong>
                            TravelGo
                        </strong>
                    </button>

                    <button
                        type="button"
                        className="auth-toplink"
                        onClick={() => navigate("/login")}
                    >
                        Iniciar sesion
                    </button>
                </header>

                <div className="register-page">
                    <section className="register-intro">
                        <span>
                            Nueva cuenta
                        </span>
                        <h1>
                            Crea tu perfil TravelGo y empieza a reservar experiencias completas.
                        </h1>
                        <p>
                            Tu cuenta permite guardar reservas, pasajeros y avanzar por el flujo de compra con mayor seguridad.
                        </p>
                    </section>

                    <form
                        className="register-card"
                        onSubmit={verificationPending ? handleVerifyCode : handleRegister}
                    >
                        <p className="eyebrow">
                            Registro
                        </p>

                        <h1>
                            Crear cuenta
                        </h1>

                        <div className="auth-tabs" aria-label="Autenticacion">
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                            >
                                <span className="material-symbols-outlined">
                                    login
                                </span>
                                Iniciar sesion
                            </button>

                            <button
                                type="button"
                                className="active"
                            >
                                <span className="material-symbols-outlined">
                                    person_add
                                </span>
                                Registro
                            </button>
                        </div>

                        {statusMessage && (
                            <div className="auth-message">
                                <span className="material-symbols-outlined">
                                    mark_email_read
                                </span>
                                <p>
                                    {statusMessage}
                                </p>
                            </div>
                        )}

                        {verificationPending ? (
                            <div className="auth-code-panel">
                                <span className="material-symbols-outlined auth-code-icon">
                                    password
                                </span>

                                <h2>
                                    Verifica tu correo
                                </h2>

                                <p>
                                    Ingresa el codigo de 6 digitos enviado a {pendingEmail || email}.
                                </p>

                                <label className="auth-field" htmlFor="register-code">
                                    Codigo de verificacion
                                    <span>
                                        <span className="material-symbols-outlined">
                                            pin
                                        </span>
                                        <input
                                            id="register-code"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength="6"
                                            placeholder="000000"
                                            value={verificationCode}
                                            onChange={(event) =>
                                                setVerificationCode(
                                                    event.target.value.replace(/\D/g, "")
                                                )
                                            }
                                            required
                                        />
                                    </span>
                                </label>

                                <button
                                    type="submit"
                                    disabled={loading || verificationCode.length !== 6}
                                >
                                    {loading ? "Verificando..." : "Confirmar correo"}
                                </button>

                                <button
                                    type="button"
                                    className="auth-secondary-action"
                                    onClick={() => {
                                        setVerificationPending(false);
                                        setVerificationCode("");
                                        setStatusMessage("");
                                    }}
                                >
                                    Corregir datos
                                </button>
                            </div>
                        ) : (
                            <>
                                <label className="auth-field" htmlFor="register-name">
                                    Nombre
                                    <span>
                                        <span className="material-symbols-outlined">
                                            badge
                                        </span>
                                        <input
                                            id="register-name"
                                            type="text"
                                            placeholder="Nombre"
                                            value={nombre}
                                            onChange={(event) =>
                                                setNombre(event.target.value)
                                            }
                                            required
                                        />
                                    </span>
                                </label>

                                <label className="auth-field" htmlFor="register-lastname">
                                    Apellido
                                    <span>
                                        <span className="material-symbols-outlined">
                                            badge
                                        </span>
                                        <input
                                            id="register-lastname"
                                            type="text"
                                            placeholder="Apellido"
                                            value={apellido}
                                            onChange={(event) =>
                                                setApellido(event.target.value)
                                            }
                                            required
                                        />
                                    </span>
                                </label>

                                <label className="auth-field" htmlFor="register-email">
                                    Correo electronico
                                    <span>
                                        <span className="material-symbols-outlined">
                                            mail
                                        </span>
                                        <input
                                            id="register-email"
                                            type="email"
                                            placeholder="nombre@ejemplo.com"
                                            value={email}
                                            onChange={(event) =>
                                                setEmail(event.target.value)
                                            }
                                            required
                                        />
                                    </span>
                                </label>

                                <label className="auth-field" htmlFor="register-password">
                                    Contrasena
                                    <span>
                                        <span className="material-symbols-outlined">
                                            lock
                                        </span>
                                        <input
                                            id="register-password"
                                            type="password"
                                            placeholder="********"
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(event.target.value)
                                            }
                                            minLength="6"
                                            required
                                        />
                                    </span>
                                </label>

                                <button type="submit" disabled={loading}>
                                    {loading ? "Registrando..." : "Registrarse"}
                                </button>

                                <p>
                                    Ya tienes cuenta?
                                    <span onClick={() => navigate("/login")}>
                                        Iniciar sesion
                                    </span>
                                </p>
                            </>
                        )}
                    </form>
                </div>
            </div>

            <Footer />
        </>
    );

};

export default Register;
