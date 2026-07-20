const getSupabaseAdmin = require('../../config/supabaseAdmin');

const sendEmail = require('../email.service');
const {
    buildReservationConfirmedEmail
} = require('../email-templates/reservationConfirmed.template');

const buildReservationCode = (reservationId) =>
    `TG-${String(reservationId).slice(0, 8).toUpperCase()}`;

const cleanValue = (value) => {
    const normalized = String(value ?? '').trim();

    if (
        !normalized ||
        ['undefined', 'null', 'nan'].includes(normalized.toLowerCase())
    ) {
        return '';
    }

    return normalized;
};

const getReservationNotificationContext = async (reservationId) => {
    const notificationClient = getSupabaseAdmin();

    const {
        data: reservation,
        error: reservationError
    } = await notificationClient
        .from('reservations')
        .select('*')
        .eq('id', reservationId)
        .single();

    if (reservationError || !reservation) {
        throw reservationError || new Error('Reserva no encontrada');
    }

    const {
        data: user,
        error: userError
    } = await notificationClient
        .from('users')
        .select('*')
        .eq('id', reservation.user_id)
        .single();

    if (userError || !user) {
        throw userError || new Error('Usuario no encontrado');
    }

    const {
        data: tour,
        error: tourError
    } = await notificationClient
        .from('tours')
        .select('*')
        .eq('id', reservation.tour_id)
        .maybeSingle();

    if (tourError) {
        throw tourError;
    }

    const {
        data: travelers,
        error: travelersError
    } = await notificationClient
        .from('travelers')
        .select('*')
        .eq('reservation_id', reservationId);

    if (travelersError) {
        throw travelersError;
    }

    return {
        reservation,
        user,
        tour,
        travelers: travelers || []
    };
};

const recordNotification = async ({
    reservationId,
    userId,
    to,
    subject,
    estado,
    error = null,
    metadata = {}
}) => {
    try {
        const notificationClient = getSupabaseAdmin();

        const { error: insertError } = await notificationClient
            .from('notifications')
            .insert([
                {
                    reservation_id: reservationId,
                    user_id: userId,
                    canal: 'email',
                    destinatario: to,
                    asunto: subject,
                    estado,
                    error,
                    metadata
                }
            ]);

        if (insertError) {
            return {
                status: 'failed',
                error: insertError.message,
                code: insertError.code || null
            };
        }

        return {
            status: 'recorded',
            error: null
        };
    } catch (recordError) {
        return {
            status: 'failed',
            error: recordError.message
        };
    }
};

const sendReservationConfirmation = async ({
    reservation,
    user,
    tour,
    travelers = []
}) => {
    const to = user.email || user.correo;
    const userName =
        [cleanValue(user.nombre), cleanValue(user.apellido)]
            .filter(Boolean)
            .join(' ') ||
        'Cliente';
    const reservationCode = buildReservationCode(reservation.id);
    const subject = `TravelGo - Reserva confirmada ${reservationCode}`;

    if (!to) {
        const emailError = 'El usuario no tiene correo registrado';

        await recordNotification({
            reservationId: reservation.id,
            userId: reservation.user_id,
            to: '',
            subject,
            estado: 'fallido',
            error: emailError,
            metadata: {
                service: 'notification-service',
                isolated_failure: true
            }
        });

        return {
            status: 'failed',
            to: null,
            subject,
            error: emailError
        };
    }

    try {
        const emailResult = await sendEmail({
            to,
            subject,
            text:
                `Hola ${userName}. Tu reserva ${reservationCode} fue confirmada. Total pagado: S/ ${reservation.total}.`,
            html: buildReservationConfirmedEmail({
                user,
                reservation,
                tour,
                travelers
            })
        });

        await recordNotification({
            reservationId: reservation.id,
            userId: reservation.user_id,
            to,
            subject,
            estado: 'enviado',
            metadata: {
                service: 'notification-service',
                message_id: emailResult.messageId,
                isolated_failure: false
            }
        });

        return {
            status: 'sent',
            to,
            subject,
            error: null
        };
    } catch (error) {
        await recordNotification({
            reservationId: reservation.id,
            userId: reservation.user_id,
            to,
            subject,
            estado: 'fallido',
            error: error.message,
            metadata: {
                service: 'notification-service',
                isolated_failure: true
            }
        });

        return {
            status: 'failed',
            to,
            subject,
            error: error.message
        };
    }
};

module.exports = {
    buildReservationCode,
    getReservationNotificationContext,
    recordNotification,
    sendReservationConfirmation
};
