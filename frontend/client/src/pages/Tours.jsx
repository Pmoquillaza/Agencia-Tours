import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "./Tours.css";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Link,
    useLocation
} from "react-router-dom";

import {
    getTours
} from "../services/tourService";

const Tours = () => {
    const location = useLocation();

    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedDestination, setSelectedDestination] =
        useState("Todos");
    const [sortBy, setSortBy] = useState("recomendado");
    const [maxPrice, setMaxPrice] = useState(0);
    const [onlyAvailable, setOnlyAvailable] = useState(false);
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem("favoriteTours");
        return saved ? JSON.parse(saved) : [];
    });

    const loadTours = async () => {
        try {
            setLoadError("");

            const data = await getTours();

            setTours(data || []);
            const prices = (data || [])
                .map((tour) => Number(tour.precio || 0))
                .filter((price) => price > 0);

            if (prices.length > 0) {
                setMaxPrice(Math.max(...prices));
            }
        } catch (error) {
            setLoadError(
                error.response?.data?.message ||
                "No pudimos cargar las experiencias disponibles"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTours();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const querySearch = params.get("search");
        const queryDestination = params.get("destination");

        if (querySearch) {
            setSearch(querySearch);
        }

        if (queryDestination) {
            setSelectedDestination(queryDestination);
        }
    }, [location.search]);

    useEffect(() => {
        localStorage.setItem(
            "favoriteTours",
            JSON.stringify(favorites)
        );
    }, [favorites]);

    const destinations = useMemo(() => {
        const uniqueDestinations = tours
            .map((tour) => tour.destino)
            .filter(Boolean);

        return ["Todos", ...new Set(uniqueDestinations)];
    }, [tours]);

    const highestPrice = useMemo(() => {
        const prices = tours.map((tour) => Number(tour.precio || 0));
        return prices.length > 0 ? Math.max(...prices) : 0;
    }, [tours]);

    const filteredTours = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return tours
            .filter((tour) => {
                const title = tour.titulo || tour.nombre || "";
                const description = tour.descripcion || "";
                const destination = tour.destino || "";
                const price = Number(tour.precio || 0);
                const cupos = Number(tour.cupos || 0);

                const matchesSearch =
                    title.toLowerCase().includes(normalizedSearch) ||
                    description.toLowerCase().includes(normalizedSearch) ||
                    destination.toLowerCase().includes(normalizedSearch);

                const matchesDestination =
                    selectedDestination === "Todos" ||
                    destination === selectedDestination;

                const matchesPrice =
                    maxPrice === 0 ||
                    price <= Number(maxPrice);

                const matchesAvailability =
                    !onlyAvailable ||
                    cupos > 0;

                return (
                    matchesSearch &&
                    matchesDestination &&
                    matchesPrice &&
                    matchesAvailability
                );
            })
            .sort((a, b) => {
                if (sortBy === "precio-menor") {
                    return Number(a.precio || 0) - Number(b.precio || 0);
                }

                if (sortBy === "precio-mayor") {
                    return Number(b.precio || 0) - Number(a.precio || 0);
                }

                if (sortBy === "duracion") {
                    const durationA = Number(
                        a.duracion || a.duracion_dias || a.dias || 0
                    );
                    const durationB = Number(
                        b.duracion || b.duracion_dias || b.dias || 0
                    );

                    return durationA - durationB;
                }

                return Number(b.cupos || 0) - Number(a.cupos || 0);
            });
    }, [
        tours,
        search,
        selectedDestination,
        maxPrice,
        onlyAvailable,
        sortBy
    ]);

    const toggleFavorite = (tourId) => {
        setFavorites((currentFavorites) =>
            currentFavorites.includes(tourId)
                ? currentFavorites.filter((id) => id !== tourId)
                : [...currentFavorites, tourId]
        );
    };

    const resetFilters = () => {
        setSearch("");
        setSelectedDestination("Todos");
        setSortBy("recomendado");
        setMaxPrice(highestPrice);
        setOnlyAvailable(false);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
            maximumFractionDigits: 0
        }).format(Number(value || 0));
    };

    const getTourImage = (tour) => {
        if (tour.imagen) {
            return tour.imagen;
        }

        const destinationImages = {
            cusco: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1200&auto=format&fit=crop",
            paracas: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=1200&auto=format&fit=crop",
            arequipa: "https://images.unsplash.com/photo-1590602390121-9c2ec384a764?q=80&w=1200&auto=format&fit=crop"
        };

        return (
            destinationImages[(tour.destino || "").toLowerCase()] ||
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop"
        );
    };

    const getDuration = (tour) => {
        return Number(tour.duracion || tour.duracion_dias || tour.dias || 1);
    };

    const getScore = (tour) => {
        const cupos = Number(tour.cupos || 0);
        return (4.5 + Math.min(cupos, 20) / 100).toFixed(1);
    };

    return (
        <>
            <Navbar />

            <main className="tours-page">
                <div className="tours-shell">
                    <div className="tours-layout">
                        <aside className="tours-sidebar">
                            <div className="tours-filter-card">
                                <div className="filter-title-row">
                                    <h2>
                                        Filtros
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                    >
                                        Limpiar
                                    </button>
                                </div>

                                <label>
                                    Destino
                                    <div className="filter-input-icon">
                                        <span className="material-symbols-outlined">
                                            search
                                        </span>
                                        <input
                                            type="search"
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                            placeholder="Ciudad o pais"
                                        />
                                    </div>
                                </label>

                                <label>
                                    Categoria
                                    <select
                                        value={selectedDestination}
                                        onChange={(event) =>
                                            setSelectedDestination(event.target.value)
                                        }
                                    >
                                        {destinations.map((destination) => (
                                            <option
                                                key={destination}
                                                value={destination}
                                            >
                                                {destination}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <div className="filter-group">
                                    <span>
                                        Tipo de viaje
                                    </span>
                                    {[
                                        "Aventura",
                                        "Cultural",
                                        "Familiar",
                                        "Relax"
                                    ].map((type, index) => (
                                        <label
                                            className="check-row"
                                            key={type}
                                        >
                                            <input
                                                type="checkbox"
                                                defaultChecked={index === 1}
                                            />
                                            {type}
                                        </label>
                                    ))}
                                </div>

                                <label>
                                    Precio maximo
                                    <small>
                                        S/ {maxPrice || highestPrice || 0}
                                    </small>
                                    <input
                                        type="range"
                                        min="0"
                                        max={highestPrice || 0}
                                        value={maxPrice || highestPrice || 0}
                                        onChange={(event) =>
                                            setMaxPrice(Number(event.target.value))
                                        }
                                    />
                                </label>

                                <label className="check-row prominent">
                                    <input
                                        type="checkbox"
                                        checked={onlyAvailable}
                                        onChange={(event) =>
                                            setOnlyAvailable(event.target.checked)
                                        }
                                    />
                                    Solo con cupos
                                </label>
                            </div>
                        </aside>

                        <section className="tours-catalog">
                            <div className="tours-catalog-header">
                                <div>
                                    <h1>
                                        Paquetes turisticos disponibles
                                    </h1>
                                    <p>
                                        {loading
                                            ? "Cargando experiencias..."
                                            : `Mostrando ${filteredTours.length} experiencias unicas para tu proximo viaje`}
                                    </p>
                                </div>

                                <div className="catalog-toolbar">
                                    <button
                                        type="button"
                                        className="mobile-filter-btn"
                                    >
                                        <span className="material-symbols-outlined">
                                            tune
                                        </span>
                                        Filtros
                                    </button>

                                    <select
                                        value={sortBy}
                                        onChange={(event) =>
                                            setSortBy(event.target.value)
                                        }
                                    >
                                        <option value="recomendado">
                                            Recomendado
                                        </option>
                                        <option value="precio-menor">
                                            Precio menor
                                        </option>
                                        <option value="precio-mayor">
                                            Precio mayor
                                        </option>
                                        <option value="duracion">
                                            Duracion
                                        </option>
                                    </select>

                                    <div className="view-toggle">
                                        <button type="button" className="active">
                                            <span className="material-symbols-outlined">
                                                grid_view
                                            </span>
                                        </button>
                                        <button type="button">
                                            <span className="material-symbols-outlined">
                                                view_list
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {loadError && (
                                <div className="service-alert panel">
                                    <strong>
                                        No pudimos cargar las experiencias
                                    </strong>
                                    <span>
                                        {loadError}. Intenta nuevamente en unos segundos.
                                    </span>
                                    <button
                                        type="button"
                                        className="catalog-clear-btn"
                                        onClick={loadTours}
                                    >
                                        Reintentar
                                    </button>
                                </div>
                            )}

                            <div className="tours-grid">
                                {filteredTours.map((tour) => {
                                    const isFavorite =
                                        favorites.includes(tour.id);

                                    return (
                                        <article
                                            key={tour.id}
                                            className="tour-card"
                                        >
                                            <div className="tour-image-wrap">
                                                <img
                                                    src={getTourImage(tour)}
                                                    alt={tour.titulo || tour.nombre || "Tour"}
                                                    className="tour-image"
                                                />
                                                <span className="tour-floating-badge">
                                                    {Number(tour.cupos || 0) > 0
                                                        ? "Disponible"
                                                        : "Sin cupos"}
                                                </span>
                                                <button
                                                    type="button"
                                                    className={`favorite-btn ${isFavorite ? "active" : ""}`}
                                                    onClick={() => toggleFavorite(tour.id)}
                                                    aria-label="Guardar tour favorito"
                                                >
                                                    <span className="material-symbols-outlined">
                                                        favorite
                                                    </span>
                                                </button>
                                            </div>

                                            <div className="tour-content">
                                                <div className="tour-heading-row">
                                                    <div>
                                                        <div className="tour-location">
                                                            <span className="material-symbols-outlined">
                                                                location_on
                                                            </span>
                                                            {tour.destino || "Destino"}
                                                        </div>
                                                        <h2>
                                                            {tour.titulo || tour.nombre}
                                                        </h2>
                                                    </div>

                                                    <div className="tour-price-box">
                                                        <span>
                                                            Desde
                                                        </span>
                                                        <strong>
                                                            {formatCurrency(tour.precio)}
                                                        </strong>
                                                    </div>
                                                </div>

                                                <div className="tour-rating-line">
                                                    <span className="material-symbols-outlined">
                                                        schedule
                                                    </span>
                                                    {getDuration(tour)} dias
                                                    <span className="material-symbols-outlined">
                                                        star
                                                    </span>
                                                    <strong>
                                                        {getScore(tour)}
                                                    </strong>
                                                    <small>
                                                        ({Number(tour.cupos || 0)} cupos)
                                                    </small>
                                                </div>

                                                <p>
                                                    {tour.descripcion}
                                                </p>

                                                <div className="tour-services">
                                                    <span>
                                                        <span className="material-symbols-outlined">
                                                            hotel
                                                        </span>
                                                        Hotel
                                                    </span>
                                                    <span>
                                                        <span className="material-symbols-outlined">
                                                            restaurant
                                                        </span>
                                                        Asistencia
                                                    </span>
                                                    <span>
                                                        <span className="material-symbols-outlined">
                                                            commute
                                                        </span>
                                                        Transporte
                                                    </span>
                                                </div>

                                                <Link
                                                    to={`/tours/${tour.id}`}
                                                    className="detail-btn"
                                                >
                                                    Reservar experiencia
                                                </Link>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            {filteredTours.length === 0 && (
                                <div className="empty-state panel">
                                    No hay tours con esos filtros. Ajusta la busqueda para ver mas opciones.
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
};

export default Tours;
