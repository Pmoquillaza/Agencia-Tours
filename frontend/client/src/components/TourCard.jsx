import { Link } from "react-router-dom";

const TourCard = ({ tour }) => {
    const title = tour.titulo || tour.nombre || "Tour";
    const duration = tour.duracion || tour.duracion_dias || tour.dias || 1;

    return (
        <article className="tour-card">
            <img
                src={tour.imagen}
                alt={title}
                className="tour-image"
            />

            <div className="tour-content">
                <div className="tour-badges">
                    <span>
                        {tour.destino || "Destino"}
                    </span>
                    <span>
                        {duration} dias
                    </span>
                </div>

                <div className="tour-name">
                    {title}
                </div>

                <p className="tour-description">
                    {tour.descripcion}
                </p>

                <div className="tour-footer-row">
                    <div>
                        <span>
                            Precio por persona
                        </span>
                        <strong className="tour-price">
                            S/ {tour.precio}
                        </strong>
                    </div>

                    <Link
                        to={`/tours/${tour.id}`}
                        className="detail-btn"
                    >
                        Ver
                    </Link>
                </div>
            </div>
        </article>
    );
};

export default TourCard;
