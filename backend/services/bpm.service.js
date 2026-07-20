const roundMoney = (value) => {
    return Number(Number(value).toFixed(2));
};

const runReservationWorkflow = ({
    tour,
    cantidad_personas,
    tipo_transporte,
    hotel,
    dias,
    precio_transporte_unitario,
    precio_hotel_noche
}) => {

    const steps = [];

    const passengers = Number(cantidad_personas);

    const reservationDays = Number(dias) || 1;

    if (!Number.isInteger(passengers) || passengers <= 0) {
        throw new Error('Cantidad de personas invalida');
    }

    steps.push({
        step: 'VALIDAR_CUPOS',
        status: 'completed'
    });

    if (tour.cupos < passengers) {

        throw new Error('No hay suficientes cupos');

    }

    let precio_transporte = 0;

    if (tipo_transporte === 'vuelo') {

        steps.push({
            step: 'VALIDAR_TRANSPORTE_VUELO',
            status: 'completed'
        });

        if (tour.vuelo_disponible === false) {

            throw new Error('Vuelo no disponible');

        }

        precio_transporte =
            Number(
                precio_transporte_unitario ||
                tour.precio_vuelo ||
                0
            ) *
            passengers;

    }

    if (tipo_transporte === 'bus') {

        steps.push({
            step: 'VALIDAR_TRANSPORTE_BUS',
            status: 'completed'
        });

        if (tour.bus_disponible === false) {

            throw new Error('Bus no disponible');

        }

        precio_transporte =
            Number(
                precio_transporte_unitario ||
                tour.precio_bus ||
                0
            ) *
            passengers;

    }

    let precio_hotel = 0;

    if (hotel) {

        steps.push({
            step: 'VALIDAR_HOTEL',
            status: 'completed'
        });

        if (tour.hotel_disponible === false) {

            throw new Error('Hotel no disponible');

        }

        precio_hotel =
            Number(
                precio_hotel_noche ||
                tour.precio_hotel ||
                0
            ) *
            reservationDays;

    }

    steps.push({
        step: 'CALCULAR_TOTAL',
        status: 'completed'
    });

    const precio_base = Number(
        tour.precio ||
        tour.precio_base ||
        0
    );

    const precio_tour = roundMoney(
        precio_base * passengers * reservationDays
    );

    const subtotal = roundMoney(
        precio_tour +
        precio_transporte +
        precio_hotel
    );

    const impuesto = 0;

    const total = roundMoney(subtotal + impuesto);

    return {
        steps,
        precio_tour,
        precio_transporte,
        precio_hotel,
        subtotal,
        impuesto,
        total
    };

};

const runPaymentWorkflow = ({ reservation }) => {

    if (!reservation) {

        throw new Error('Reserva no encontrada');

    }

    if (
        reservation.estado === 'pagado' ||
        reservation.estado === 'confirmada'
    ) {

        return {
            nextStatus: 'confirmada',
            paymentStatus: 'completado',
            steps: [
                {
                    step: 'PAGO_YA_CONFIRMADO',
                    status: 'completed'
                }
            ]
        };

    }

    return {
        nextStatus: 'confirmada',
        paymentStatus: 'completado',
        steps: [
            {
                step: 'VALIDAR_RESERVA',
                status: 'completed'
            },
            {
                step: 'CONFIRMAR_PAGO',
                status: 'completed'
            },
            {
                step: 'ENVIAR_CONFIRMACION',
                status: 'pending'
            }
        ]
    };

};

const runReservationCancellationWorkflow = ({
    reservation
}) => {

    if (!reservation) {

        throw new Error('Reserva no encontrada');

    }

    if (reservation.estado === 'confirmada') {

        throw new Error(
            'No se puede cancelar una reserva confirmada'
        );

    }

    if (reservation.estado === 'cancelada') {

        return {
            shouldReleaseSeats: false,
            nextStatus: 'cancelada',
            steps: [
                {
                    step: 'RESERVA_YA_CANCELADA',
                    status: 'completed'
                }
            ]
        };

    }

    return {
        shouldReleaseSeats: true,
        nextStatus: 'cancelada',
        steps: [
            {
                step: 'PAGO_NO_APROBADO',
                status: 'completed'
            },
            {
                step: 'CANCELAR_RESERVA',
                status: 'completed'
            },
            {
                step: 'LIBERAR_CUPOS',
                status: 'completed'
            }
        ]
    };

};

module.exports = {
    runReservationWorkflow,
    runPaymentWorkflow,
    runReservationCancellationWorkflow
};
