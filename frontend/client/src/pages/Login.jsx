import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Login.css";

import {
    loginUser,
    verifyAuthCode
} from "../services/authService";

import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

const Login = () => {
    const navigate = useNavigate();

    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationPending, setVerificationPending] = useState(false);
    const [pendingEmail, setPendingEmail] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setStatusMessage("");

            const response = await loginUser({
                email,
                password
            });

            if (response?.requires_verification) {
                setPendingEmail(response.correo || email);
                setVerificationPending(true);
                setStatusMessage(
                    response.message ||
                    "Te enviamos un codigo de acceso al correo."
                );
                return;
            }

            login(
                response.token,
                response.usuario
            );

            setTimeout(() => {
                navigate("/");
            }, 100);
        } catch (error) {
            alert(
                error.response?.data?.message ||
                error.message ||
                "No se pudo iniciar sesion"
            );
        } finally {
            setLoading(false);
        }
    };

    const verifyLoginCode = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setStatusMessage("");

            const response = await verifyAuthCode({
                email: pendingEmail || email,
                code: verificationCode,
                purpose: "login"
            });

            login(
                response.token,
                response.usuario
            );

            navigate("/");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                error.message ||
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
                        onClick={() => navigate("/tours")}
                    >
                        Explorar paquetes
                    </button>
                </header>

                <div className="login-container">
                    <section className="auth-intro">
                        <span>
                            TravelGo
                        </span>
                        <h1>
                            Organiza tu proxima aventura desde una cuenta segura.
                        </h1>
                        <p>
                            Guarda reservas, continua pagos pendientes y recibe confirmaciones profesionales de cada viaje.
                        </p>
                    </section>

                    <form
                        className="login-card"
                        onSubmit={verificationPending ? verifyLoginCode : submit}
                    >
                        <p className="eyebrow">
                            Bienvenido
                        </p>

                        <h1>
                            Iniciar sesion
                        </h1>

                        <div className="auth-tabs" aria-label="Autenticacion">
                            <button
                                type="button"
                                className="active"
                            >
                                <span className="material-symbols-outlined">
                                    login
                                </span>
                                Iniciar sesion
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/register")}
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
                                    shield_lock
                                </span>

                                <h2>
                                    Verificacion de acceso
                                </h2>

                                <p>
                                    Ingresa el codigo enviado a {pendingEmail || email} para terminar el inicio de sesion.
                                </p>

                                <label className="auth-field" htmlFor="login-code">
                                    Codigo de acceso
                                    <span>
                                        <span className="material-symbols-outlined">
                                            pin
                                        </span>
                                        <input
                                            id="login-code"
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
                                    {loading ? "Verificando..." : "Entrar de forma segura"}
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
                                    Cambiar correo
                                </button>
                            </div>
                        ) : (
                            <>
                                <label className="auth-field" htmlFor="login-email">
                                    Correo electronico
                                    <span>
                                        <span className="material-symbols-outlined">
                                            mail
                                        </span>
                                        <input
                                            id="login-email"
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

                                <label className="auth-field" htmlFor="login-password">
                                    Contrasena
                                    <span>
                                        <span className="material-symbols-outlined">
                                            lock
                                        </span>
                                        <input
                                            id="login-password"
                                            type="password"
                                            placeholder="********"
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(event.target.value)
                                            }
                                            required
                                        />
                                    </span>
                                </label>

                                <button type="submit" disabled={loading}>
                                    {loading ? "Validando..." : "Ingresar"}
                                </button>

                                <p>
                                    No tienes cuenta?
                                    <span onClick={() => navigate("/register")}>
                                        Registrarse
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

export default Login;
