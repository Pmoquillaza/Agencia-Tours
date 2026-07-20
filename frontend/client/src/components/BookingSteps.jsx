import "./BookingSteps.css";

const steps = [
    {
        id: "tour",
        label: "Destino",
        icon: "explore"
    },
    {
        id: "transport",
        label: "Transporte",
        icon: "flight_takeoff"
    },
    {
        id: "hotel",
        label: "Hotel",
        icon: "hotel"
    },
    {
        id: "travelers",
        label: "Viajeros",
        icon: "group"
    },
    {
        id: "payment",
        label: "Pago",
        icon: "credit_card"
    }
];

const BookingSteps = ({ current = "tour" }) => {
    const currentIndex = steps.findIndex(
        (step) => step.id === current
    );

    return (
        <div className="booking-steps" aria-label="Progreso de reserva">
            {steps.map((step, index) => {
                const isDone = index < currentIndex;
                const isActive = index === currentIndex;

                return (
                    <div
                        key={step.id}
                        className={`booking-step ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}
                    >
                        <span>
                            <span className="material-symbols-outlined">
                                {isDone ? "check" : step.icon}
                            </span>
                        </span>
                        <strong>
                            {step.label}
                        </strong>
                    </div>
                );
            })}
        </div>
    );
};

export default BookingSteps;
