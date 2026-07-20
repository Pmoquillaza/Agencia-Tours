import {
    lazy,
    Suspense,
    useEffect,
    useState
} from "react";
import { Link, useNavigate } from "react-router-dom";

import Icon from "../components/Icon";
import Navbar from "../components/Navbar";

import "./Home.css";

const HomeDeferred = lazy(() => import("./HomeDeferred"));

const scheduleDeferredContent = (callback) => {
    if (typeof window === "undefined") {
        return undefined;
    }

    const run = () => {
        if ("requestIdleCallback" in window) {
            const idleId = window.requestIdleCallback(callback, {
                timeout: 1400
            });

            return () => window.cancelIdleCallback(idleId);
        }

        const timeoutId = window.setTimeout(callback, 700);

        return () => window.clearTimeout(timeoutId);
    };

    if (document.readyState === "complete") {
        return run();
    }

    let cleanup;
    const onLoad = () => {
        cleanup = run();
    };

    window.addEventListener("load", onLoad, {
        once: true
    });

    return () => {
        window.removeEventListener("load", onLoad);
        cleanup?.();
    };
};

const Home = () => {
    const navigate = useNavigate();
    const [destination, setDestination] = useState("");
    const [date, setDate] = useState("");
    const [travelers, setTravelers] = useState(2);
    const [showDeferredContent, setShowDeferredContent] = useState(false);

    useEffect(() => {
        return scheduleDeferredContent(() => {
            setShowDeferredContent(true);
        });
    }, []);

    const handleSearch = (event) => {
        event.preventDefault();

        const params = new URLSearchParams();

        if (destination.trim()) {
            params.set("search", destination.trim());
        }

        if (date) {
            params.set("date", date);
        }

        if (travelers) {
            params.set("travelers", travelers);
        }

        navigate(`/tours${params.toString() ? `?${params}` : ""}`);
    };

    return (
        <>
            <Navbar />

            <main className="home-page">
                <section className="home-hero">
                    <picture className="home-hero-media" aria-hidden="true">
                        <source
                            srcSet="/images/hero-travel-mobile.webp"
                            media="(max-width: 640px)"
                            type="image/webp"
                        />
                        <source
                            srcSet="/images/hero-travel-960.webp"
                            media="(max-width: 1024px)"
                            type="image/webp"
                        />
                        <img
                            src="/images/hero-travel.webp"
                            srcSet="/images/hero-travel-mobile.webp 520w, /images/hero-travel-640.webp 640w, /images/hero-travel-960.webp 960w, /images/hero-travel.webp 1280w"
                            sizes="100vw"
                            alt=""
                            width="1440"
                            height="960"
                            fetchPriority="high"
                            decoding="async"
                        />
                    </picture>

                    <div className="home-shell">
                        <p className="home-kicker">
                            TravelGo Tour Agency
                        </p>

                        <h1>
                            Explora el mundo con reservas hechas a tu medida
                        </h1>

                        <p>
                            Tours, transporte, hoteles, viajeros y pagos en una experiencia clara, moderna y segura para planificar tu siguiente aventura.
                        </p>

                        <div className="home-actions">
                            <Link
                                to="/tours"
                                className="home-primary-action"
                            >
                                Reservar ahora
                            </Link>

                            <Link
                                to="/login"
                                className="home-secondary-action"
                            >
                                Iniciar sesion
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="home-search-band">
                    <form
                        className="home-search"
                        onSubmit={handleSearch}
                    >
                        <div className="home-field home-field-wide">
                            <Icon name="pin" />
                            <label htmlFor="home-destination">
                                Destino
                            </label>
                            <input
                                id="home-destination"
                                type="search"
                                value={destination}
                                onChange={(event) =>
                                    setDestination(event.target.value)
                                }
                                placeholder="Cusco, Paracas, Arequipa"
                            />
                        </div>

                        <div className="home-field">
                            <Icon name="calendar" />
                            <label htmlFor="home-date">
                                Fecha
                            </label>
                            <input
                                id="home-date"
                                type="date"
                                value={date}
                                onChange={(event) =>
                                    setDate(event.target.value)
                                }
                            />
                        </div>

                        <div className="home-field">
                            <Icon name="users" />
                            <label htmlFor="home-travelers">
                                Viajeros
                            </label>
                            <input
                                id="home-travelers"
                                type="number"
                                min="1"
                                max="20"
                                value={travelers}
                                onChange={(event) =>
                                    setTravelers(event.target.value)
                                }
                            />
                        </div>

                        <button type="submit">
                            <Icon name="search" />
                            Buscar
                        </button>
                    </form>
                </section>

                {showDeferredContent && (
                    <Suspense fallback={null}>
                        <HomeDeferred />
                    </Suspense>
                )}
            </main>
        </>
    );
};

export default Home;
