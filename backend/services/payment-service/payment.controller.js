const Stripe = require('stripe');

const supabase = require('../../config/supabase');
const { assertEnv } = require('../../config/env');
const { logAudit } = require('../audit.service');

const getStripe = () => Stripe(
    assertEnv('STRIPE_SECRET_KEY', 'payment-service')
);

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const isMissingColumnError = (error, columnName) =>
    error?.code === 'PGRST204' &&
    String(error?.message || '').includes(`'${columnName}' column`);

const roundMoney = (value) =>
    Number(Number(value || 0).toFixed(2));

const pricesDiffer = (left, right) =>
    Math.abs(Number(left || 0) - Number(right || 0)) > 0.009;

const synchronizeReservationTotal = async (reservation) => {
    const {
        data: tour,
        error
    } = await supabase
        .from('tours')
        .select('precio, precio_base')
        .eq('id', reservation.tour_id)
        .maybeSingle();

    if (error || !tour) {
        return reservation;
    }

    const passengers =
        Number(reservation.cantidad_personas || 1);

    const days =
        Number(reservation.dias || 1);

    const precioTour = roundMoney(
        Number(tour.precio || tour.precio_base || 0) *
        passengers *
        days
    );

    const precioTransporte = roundMoney(
        reservation.precio_transporte
    );

    const precioHotel = roundMoney(
        reservation.precio_hotel
    );

    const impuesto = roundMoney(
        reservation.impuesto
    );

    const subtotal = roundMoney(
        precioTour +
        precioTransporte +
        precioHotel
    );

    const total = roundMoney(subtotal + impuesto);

    if (
        !pricesDiffer(total, reservation.total) &&
        !pricesDiffer(subtotal, reservation.subtotal)
    ) {
        return reservation;
    }

    const {
        data: updatedReservation,
        error: updateError
    } = await supabase
        .from('reservations')
        .update({
            subtotal,
            total
        })
        .eq('id', reservation.id)
        .select('*')
        .single();

    if (updateError || !updatedReservation) {
        return {
            ...reservation,
            subtotal,
            total
        };
    }

    return updatedReservation;
};

const createPaymentRecord = async (payload) => {
    const {
        data,
        error
    } = await supabase
        .from('payments')
        .insert([payload])
        .select('id')
        .single();

    if (!isMissingColumnError(error, 'moneda')) {
        return {
            data,
            error
        };
    }

    const {
        moneda,
        ...legacyPayload
    } = payload;

    return supabase
        .from('payments')
        .insert([legacyPayload])
        .select('id')
        .single();
};

// =====================================
// CREATE PAYMENT INTENT
// =====================================

const createPaymentIntent = async (req, res) => {
    const { reservation_id } = req.body || {};

    try {
        if (!reservation_id) {
            throw createHttpError('reservation_id requerido', 400);
        }

        let {
            data: reservation,
            error
        } = await supabase
            .from('reservations')
            .select('*')
            .eq('id', reservation_id)
            .single();

        if (error || !reservation) {
            throw createHttpError('Reserva no encontrada', 404);
        }

        if (reservation.estado === 'cancelada') {
            throw createHttpError(
                'No se puede pagar una reserva cancelada',
                409
            );
        }

        if (Number(reservation.total || 0) <= 0) {
            throw createHttpError(
                'La reserva no tiene un total valido',
                400
            );
        }

        reservation =
            await synchronizeReservationTotal(reservation);

        const {
            data: existingPayment
        } = await supabase
            .from('payments')
            .select('*')
            .eq('reservation_id', reservation_id)
            .eq('estado', 'pendiente')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (
            existingPayment?.stripe_payment_intent &&
            !pricesDiffer(existingPayment.monto, reservation.total)
        ) {
            const existingIntent =
                await getStripe().paymentIntents.retrieve(
                    existingPayment.stripe_payment_intent
                );

            await logAudit({
                actorId: req.user?.id || reservation.user_id,
                actorEmail: req.user?.correo,
                action: 'REUSE_PAYMENT_INTENT',
                entity: 'payments',
                entityId: existingPayment.id,
                metadata: {
                    reservation_id,
                    stripe_payment_intent:
                        existingPayment.stripe_payment_intent
                }
            });

            return res.json({
                status: 'success',
                client_secret: existingIntent.client_secret,
                payment_intent: existingIntent.id,
                amount: existingPayment.monto,
                currency: existingPayment.moneda || 'usd',
                reused: true
            });
        }

        if (
            existingPayment?.stripe_payment_intent &&
            pricesDiffer(existingPayment.monto, reservation.total)
        ) {
            await supabase
                .from('payments')
                .update({
                    estado: 'cancelado'
                })
                .eq('id', existingPayment.id);
        }

        const currency =
            process.env.STRIPE_CURRENCY ||
            'usd';

        const paymentIntent = await getStripe().paymentIntents.create({
            amount: Math.round(Number(reservation.total) * 100),
            currency,
            automatic_payment_methods: {
                enabled: true
            },
            metadata: {
                reservation_id,
                user_id: reservation.user_id,
                service: 'payment-service'
            }
        });

        const {
            data: payment,
            error: paymentError
        } = await createPaymentRecord({
            reservation_id,
            stripe_payment_intent: paymentIntent.id,
            monto: reservation.total,
            moneda: currency,
            estado: 'pendiente'
        });

        if (paymentError) {
            throw paymentError;
        }

        await logAudit({
            actorId: req.user?.id || reservation.user_id,
            actorEmail: req.user?.correo,
            action: 'CREATE_PAYMENT_INTENT',
            entity: 'payments',
            entityId: payment.id,
            metadata: {
                reservation_id,
                stripe_payment_intent: paymentIntent.id,
                amount: reservation.total,
                currency
            }
        });

        return res.json({
            status: 'success',
            client_secret: paymentIntent.client_secret,
            payment_intent: paymentIntent.id,
            amount: reservation.total,
            currency
        });
    } catch (error) {
        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'CREATE_PAYMENT_INTENT',
            entity: 'payments',
            entityId: reservation_id,
            status: 'error',
            metadata: {
                error: error.message
            }
        });

        return res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message
        });
    }
};

module.exports = {
    createPaymentIntent
};
