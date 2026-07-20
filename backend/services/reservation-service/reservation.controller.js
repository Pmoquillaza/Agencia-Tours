const supabase = require('../../config/supabase');

const { logAudit } = require('../audit.service');

const {
    runReservationCancellationWorkflow,
    runReservationWorkflow
} = require('../bpm.service');

const createHttpError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const isMissingColumnError = (error) =>
    error?.code === 'PGRST204' &&
    String(error?.message || '').includes('schema cache');

const insertReservation = async (payload) => {
    const insert = async (data) =>
        supabase
            .from('reservations')
            .insert([data])
            .select()
            .single();

    const result = await insert(payload);

    if (!isMissingColumnError(result.error)) {
        return result;
    }

    const {
        transport_nombre,
        hotel_nombre,
        ...legacyPayload
    } = payload;

    return insert(legacyPayload);
};

// =====================================
// CREAR RESERVA (JSON INPUT -> JSON OUTPUT)
// =====================================

const createReservation = async (req, res) => {

    try {

        // =====================================
        // BODY JSON
        // =====================================

        const {

            tour_id,
            cantidad_personas,
            tipo_transporte,
            hotel,
            dias,
            precio_transporte_unitario,
            precio_hotel_noche,
            transport_nombre,
            hotel_nombre

        } = req.body;

        // =====================================
        // USER
        // =====================================

        const user_id = req.user.id;

        // =====================================
        // VALIDACIONES
        // =====================================

        if (!tour_id) {

            throw createHttpError('tour_id requerido', 400);

        }

        const passengers =
            Number(cantidad_personas);

        if (
            !Number.isInteger(passengers) ||
            passengers <= 0
        ) {

            throw createHttpError(
                'Cantidad de personas inválida'
            );

        }

        // =====================================
        // OBTENER TOUR
        // =====================================

        const {

            data: tour,
            error: tourError

        } = await supabase

            .from('tours')

            .select('*')

            .eq('id', tour_id)

            .single();

        if (tourError || !tour) {

            throw createHttpError('Tour no encontrado', 404);

        }

        // =====================================
        // BPM / MOTOR DE REGLAS
        // =====================================

        const reservationWorkflow =
            runReservationWorkflow({
                tour,
                cantidad_personas: passengers,
                tipo_transporte,
                hotel,
                dias,
                precio_transporte_unitario,
                precio_hotel_noche
            });

        const {
            precio_tour,
            precio_transporte,
            precio_hotel,
            subtotal,
            impuesto,
            total
        } = reservationWorkflow;

        // =====================================
        // CREAR RESERVA
        // =====================================

        const {

            data: reservation,
            error

        } = await insertReservation({
            user_id,
            tour_id,
            cantidad_personas: passengers,
            tipo_transporte,
            hotel,
            dias,
            precio_transporte,
            precio_hotel,
            subtotal,
            impuesto,
            total,
            transport_nombre:
                transport_nombre ||
                'Transporte seleccionado',
            hotel_nombre:
                hotel_nombre ||
                'Hospedaje seleccionado',
            estado: 'pendiente'
        });

        if (error) {

            throw error;

        }

        // =====================================
        // ACTUALIZAR CUPOS
        // =====================================

        const nuevosCupos =

            Number(tour.cupos || 0) - passengers;

        const {

            error: updateError

        } = await supabase

            .from('tours')

            .update({
                cupos: nuevosCupos
            })

            .eq('id', tour_id);

        if (updateError) {

            await supabase
                .from('reservations')
                .delete()
                .eq('id', reservation.id);

            throw updateError;

        }

        await logAudit({
            actorId: req.user.id,
            actorEmail: req.user.correo,
            action: 'CREATE_RESERVATION',
            entity: 'reservations',
            entityId: reservation.id,
            metadata: {
                tour_id,
                cantidad_personas: passengers,
                tipo_transporte,
                hotel,
                total,
                bpm_steps: reservationWorkflow.steps
            }
        });

        // =====================================
        // RESPUESTA JSON
        // =====================================

        return res.status(201).json({

            status: 'success',

            message:
                'Reserva creada correctamente',

            reservation_id:
                reservation.id,

            subtotal,

            impuesto,

            precio_tour,

            precio_transporte,

            precio_hotel,

            total

        });

    } catch (error) {

        // =====================================
        // ERROR
        // =====================================

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'CREATE_RESERVATION',
            entity: 'reservations',
            status: 'error',
            metadata: {
                error: error.message,
                body: req.body
            }
        });

        // =====================================
        // RESPUESTA JSON
        // =====================================

        return res.status(error.statusCode || 500).json({

            status: 'error',

            message: error.message

        });

    }

};

// =====================================
// LISTAR RESERVAS
// =====================================

const getReservations = async (req, res) => {

    try {

        let query = supabase

            .from('reservations')

            .select(`
                *,
                users(nombre, apellido),
                tours(titulo, destino),
                travelers(id)
            `);

        if (req.user?.rol !== 'admin') {

            query = query.eq('user_id', req.user.id);

        }

        const {

            data,
            error

        } = await query.order(
            'created_at',
            {
                ascending: false
            }
        );

        if (error) {

            throw error;

        }

        const reservations = data.map(
            reservation => ({

                id:
                    reservation.id,

                cliente:

                    reservation.users?.nombre +

                    ' ' +

                    reservation.users?.apellido,

                tour:
                    reservation.tours?.titulo,

                destino:
                    reservation.tours?.destino,

                cantidad_personas:
                    reservation.cantidad_personas,

                viajeros_registrados:
                    reservation.travelers?.length || 0,

                dias:
                    reservation.dias,

                subtotal:
                    reservation.subtotal,

                impuesto:
                    reservation.impuesto,

                estado:
                    reservation.estado,

                total:
                    reservation.total,

                tipo_transporte:
                    reservation.tipo_transporte,

                created_at:
                    reservation.created_at

            })
        );

        res.json(reservations);

    } catch (error) {

        res.status(500).json({

            status: 'error',

            message: error.message

        });

    }

};

// =====================================
// OBTENER RESERVA POR ID
// =====================================
const getReservationById = async (req, res) => {

    try {

        const { id } = req.params;

        const { data, error } = await supabase
            .from("reservations")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (error) throw error;

        if (!data) {

            return res.status(404).json({
                error: "Reserva no encontrada"
            });

        }

        res.json(data);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

// =====================================
// CANCELAR RESERVA / LIBERAR CUPOS
// =====================================

const cancelReservation = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            data: reservation,
            error: reservationError
        } = await supabase
            .from("reservations")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (reservationError) {

            throw reservationError;

        }

        if (!reservation) {

            return res.status(404).json({
                status: "error",
                message: "Reserva no encontrada"
            });

        }

        const cancellationWorkflow =
            runReservationCancellationWorkflow({
                reservation
            });

        if (cancellationWorkflow.shouldReleaseSeats) {

            const {
                data: tour,
                error: tourError
            } = await supabase
                .from("tours")
                .select("id, cupos")
                .eq("id", reservation.tour_id)
                .single();

            if (tourError) {

                throw tourError;

            }

            const releasedSeats =
                Number(tour.cupos || 0) +
                Number(reservation.cantidad_personas || 0);

            const { error: updateTourError } =
                await supabase
                    .from("tours")
                    .update({
                        cupos: releasedSeats
                    })
                    .eq("id", reservation.tour_id);

            if (updateTourError) {

                throw updateTourError;

            }

        }

        const { error: updateReservationError } =
            await supabase
                .from("reservations")
                .update({
                    estado: cancellationWorkflow.nextStatus
                })
                .eq("id", id);

        if (updateReservationError) {

            throw updateReservationError;

        }

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'CANCEL_RESERVATION',
            entity: 'reservations',
            entityId: id,
            metadata: {
                tour_id: reservation.tour_id,
                cantidad_personas:
                    reservation.cantidad_personas,
                reason:
                    req.body?.reason ||
                    'Pago no aprobado',
                bpm_steps:
                    cancellationWorkflow.steps
            }
        });

        return res.json({
            status: "success",
            message:
                "Reserva cancelada y cupos liberados"
        });

    } catch (error) {

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'CANCEL_RESERVATION',
            entity: 'reservations',
            entityId: req.params.id,
            status: 'error',
            metadata: {
                error: error.message
            }
        });

        return res.status(500).json({
            status: "error",
            message: error.message
        });

    }

};


module.exports = {
    cancelReservation,
    createReservation,
    getReservationById,
    getReservations
};
