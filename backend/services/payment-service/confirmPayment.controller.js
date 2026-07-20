const Stripe = require('stripe');

const supabase = require('../../config/supabase');
const { assertEnv } = require('../../config/env');
const { logAudit } = require('../audit.service');
const {
    runPaymentWorkflow
} = require('../bpm.service');
const {
    getReservationNotificationContext,
    sendReservationConfirmation
} = require('../notification-service/notification.service');

const getStripe = () => Stripe(
    assertEnv('STRIPE_SECRET_KEY', 'payment-service')
);

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

// ======================================
// CONFIRMAR PAGO
// ======================================

const confirmPayment = async (req, res) => {
    const { reservation_id } = req.body || {};

    try {
        if (!reservation_id) {
            throw createHttpError('reservation_id requerido', 400);
        }

        const {
            data: reservation,
            error: reservationDataError
        } = await supabase
            .from('reservations')
            .select('*')
            .eq('id', reservation_id)
            .single();

        if (reservationDataError || !reservation) {
            throw createHttpError('Reserva no encontrada', 404);
        }

        const {
            data: payment,
            error: paymentLookupError
        } = await supabase
            .from('payments')
            .select('*')
            .eq('reservation_id', reservation_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (paymentLookupError) {
            throw paymentLookupError;
        }

        if (!payment?.stripe_payment_intent) {
            throw createHttpError(
                'No existe pago para confirmar',
                404
            );
        }

        if (
            reservation.estado === 'confirmada' &&
            payment.estado === 'completado'
        ) {
            return res.json({
                status: 'success',
                message: 'Pago ya estaba confirmado',
                notification: 'skipped'
            });
        }

        const paymentIntent =
            await getStripe().paymentIntents.retrieve(
                payment.stripe_payment_intent
            );

        if (paymentIntent.status !== 'succeeded') {
            throw createHttpError(
                `Stripe no aprobo el pago. Estado: ${paymentIntent.status}`,
                409
            );
        }

        const paymentWorkflow =
            runPaymentWorkflow({
                reservation
            });

        const {
            error: reservationError
        } = await supabase
            .from('reservations')
            .update({
                estado: paymentWorkflow.nextStatus
            })
            .eq('id', reservation_id);

        if (reservationError) {
            throw reservationError;
        }

        const {
            error: paymentError
        } = await supabase
            .from('payments')
            .update({
                estado: paymentWorkflow.paymentStatus
            })
            .eq('id', payment.id);

        if (paymentError) {
            throw paymentError;
        }

        const {
            user,
            tour,
            travelers
        } = await getReservationNotificationContext(
            reservation_id
        );

        const notificationResult =
            await sendReservationConfirmation({
                reservation: {
                    ...reservation,
                    estado: paymentWorkflow.nextStatus
                },
                user,
                tour,
                travelers
            });

        const completedPaymentSteps =
            paymentWorkflow.steps.map((step) => ({
                ...step,
                status:
                    step.step === 'ENVIAR_CONFIRMACION'
                        ? notificationResult.status === 'sent'
                            ? 'completed'
                            : 'failed'
                        : step.status
            }));

        await logAudit({
            actorId: req.user?.id || reservation.user_id,
            actorEmail:
                req.user?.correo ||
                user.email ||
                user.correo,
            action: 'CONFIRM_PAYMENT',
            entity: 'payments',
            entityId: payment.id,
            metadata: {
                reservation_id,
                stripe_payment_intent:
                    payment.stripe_payment_intent,
                total: reservation.total,
                email_sent_to: notificationResult.to,
                email_status: notificationResult.status,
                email_error: notificationResult.error,
                bpm_steps: completedPaymentSteps
            }
        });

        return res.json({
            status: 'success',
            message:
                notificationResult.status === 'sent'
                    ? 'Pago confirmado y correo enviado'
                    : 'Pago confirmado. El correo no pudo enviarse, pero la reserva sigue confirmada.',
            notification: notificationResult.status
        });
    } catch (error) {
        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'CONFIRM_PAYMENT',
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
    confirmPayment
};
