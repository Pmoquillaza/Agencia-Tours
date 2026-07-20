import api from '../api/axios';

// =====================================
// CREATE PAYMENT INTENT
// =====================================

export const createPaymentIntent = async (
    reservation_id
) => {

    const response = await api.post(

        '/payments/create-intent',

        {
            reservation_id
        }

    );

    return response.data;

};


export const confirmPayment = async (
    reservationId
) => {

    const response = await api.post(

        "/payments/confirm",

        {
            reservation_id: reservationId
        }

    );

    return response.data;
};