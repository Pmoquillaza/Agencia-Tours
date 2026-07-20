import api from "../api/axios";

// =====================================
// CREAR RESERVA
// =====================================

export const createReservation = async (data) => {

    const response = await api.post(
        "/reservations/create",
        data
    );

    return response.data;

};

// =====================================
// OBTENER RESERVA POR ID
// =====================================

export const getReservationById = async (
    id
) => {

    const response = await api.get(
        `/reservations/${id}`
    );

    return response.data;

};

// =====================================
// CANCELAR RESERVA
// =====================================

export const cancelReservation = async (
    id,
    reason = "Pago no aprobado"
) => {

    const response = await api.post(
        `/reservations/${id}/cancel`,
        {
            reason
        }
    );

    return response.data;

};

// =====================================
// OBTENER TODAS LAS RESERVAS
// =====================================

export const getReservations = async () => {

    const response = await api.get(
        "/reservations"
    );

    return response.data;

};

// =====================================
// CREAR PAYMENT INTENT
// =====================================

export const createPaymentIntent = async (
    reservation_id
) => {

    const response = await api.post(
        "/payments/create-intent",
        {
            reservation_id
        }
    );

    return response.data;

};
