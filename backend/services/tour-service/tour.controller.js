const { create } = require('xmlbuilder2');

const supabase = require('../../config/supabase');

const { logAudit } = require('../audit.service');

const getXmlValue = (xmlData, tag) => {

    return xmlData.match(
        new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)
    )?.[1]?.trim();

};

const createHttpError = (message, statusCode) => {

    const error = new Error(message);

    error.statusCode = statusCode;

    return error;

};

const isMissingColumnError = (error) => {
    const message = String(error?.message || '').toLowerCase();

    return (
        error?.code === 'PGRST204' ||
        message.includes('could not find') ||
        message.includes('schema cache') ||
        message.includes('column')
    );
};

const withDurationColumnFallback = async (
    operation,
    fallbackOperation
) => {
    const result = await operation();

    if (result.error && isMissingColumnError(result.error)) {
        return fallbackOperation();
    }

    return result;
};

const validateTourData = ({
    titulo,
    destino,
    descripcion,
    precio,
    duracion,
    cupos
}) => {

    if (
        !titulo ||
        !destino ||
        !descripcion ||
        !precio ||
        !duracion ||
        !cupos
    ) {

        throw createHttpError(
            'Todos los campos del tour son obligatorios',
            400
        );

    }

    if (Number(precio) <= 0) {

        throw createHttpError(
            'El precio debe ser mayor a cero',
            400
        );

    }

    if (Number(duracion) <= 0) {

        throw createHttpError(
            'La duracion debe ser mayor a cero',
            400
        );

    }

    if (Number(cupos) <= 0) {

        throw createHttpError(
            'Los cupos deben ser mayores a cero',
            400
        );

    }

};

const sendXmlResponse = (
    res,
    statusCode,
    status,
    message
) => {

    const response = create({ version: '1.0' })
        .ele('response')

            .ele('status')
                .txt(status)
            .up()

            .ele('message')
                .txt(message)
            .up()

        .up();

    res.set('Content-Type', 'application/xml');

    return res.status(statusCode).send(
        response.end({ prettyPrint: true })
    );

};

const createTour = async (req, res) => {

    try {

        const xmlData = req.body;

        const titulo = getXmlValue(xmlData, 'titulo');

        const destino = getXmlValue(xmlData, 'destino');

        const descripcion = getXmlValue(xmlData, 'descripcion');

        const precio = getXmlValue(xmlData, 'precio');

        const duracion = getXmlValue(xmlData, 'duracion');

        const cupos = getXmlValue(xmlData, 'cupos');

        validateTourData({
            titulo,
            destino,
            descripcion,
            precio,
            duracion,
            cupos
        });

        const { data, error } = await withDurationColumnFallback(
            () => supabase
                .from('tours')
                .insert([
                    {
                        titulo,
                        destino,
                        descripcion,
                        precio,
                        duracion,
                        cupos
                    }
                ])
                .select()
                .single(),
            () => supabase
                .from('tours')
                .insert([
                    {
                        titulo,
                        destino,
                        descripcion,
                        precio,
                        duracion_dias: duracion,
                        cupos
                    }
                ])
                .select()
                .single()
        );

        if (error) {

            throw error;

        }

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'CREATE_TOUR',
            entity: 'tours',
            entityId: data.id,
            metadata: {
                titulo,
                destino,
                precio,
                cupos
            }
        });

        return sendXmlResponse(
            res,
            201,
            'success',
            'Tour creado correctamente'
        );

    } catch (error) {

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'CREATE_TOUR',
            entity: 'tours',
            status: 'error',
            metadata: {
                error: error.message
            }
        });

        return sendXmlResponse(
            res,
            error.statusCode || 500,
            'error',
            error.message
        );

    }

};

const getTours = async (req, res) => {

    try {

        const { data, error } = await supabase

            .from('tours')

            .select('*');

        if (error) {

            throw error;

        }

        // =========================
        // RESPUESTA JSON
        // =========================

        const tours = data.map(tour => ({

            id: tour.id,

            titulo: tour.titulo,

            destino: tour.destino,

            descripcion: tour.descripcion,

            precio: tour.precio,

            duracion: tour.duracion || tour.duracion_dias || 1,

            cupos: tour.cupos,

            imagen:
                tour.imagen ||
                'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop'

        }));

        res.json(tours);

    } catch (error) {

        res.status(500).json({

            status: 'error',

            message: error.message

        });

    }

};
const getTourById = async (req, res) => {

    try {

        const { id } = req.params;

        const { data, error } = await supabase

            .from('tours')

            .select('*')

            .eq('id', id)

            .single();

        if (error) {

            throw error;

        }

        // =========================
        // RESPUESTA JSON
        // =========================

        res.json({

            id: data.id,

            titulo: data.titulo,

            destino: data.destino,

            descripcion: data.descripcion,

            precio: data.precio,

            duracion: data.duracion || data.duracion_dias || 1,

            cupos: data.cupos,

            imagen:
                data.imagen ||
                'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop'

        });

    } catch (error) {

        res.status(404).json({

            status: 'error',

            message: error.message

        });

    }

};

const updateTour = async (req, res) => {

    try {

        const { id } = req.params;

        const xmlData = req.body;

        const titulo = getXmlValue(xmlData, 'titulo');

        const destino = getXmlValue(xmlData, 'destino');

        const descripcion = getXmlValue(xmlData, 'descripcion');

        const precio = getXmlValue(xmlData, 'precio');

        const duracion = getXmlValue(xmlData, 'duracion');

        const cupos = getXmlValue(xmlData, 'cupos');

        validateTourData({
            titulo,
            destino,
            descripcion,
            precio,
            duracion,
            cupos
        });

        const {
            data: updatedTour,
            error
        } = await withDurationColumnFallback(
            () => supabase
                .from('tours')
                .update({
                    titulo,
                    destino,
                    descripcion,
                    precio,
                    duracion,
                    cupos
                })
                .eq('id', id)
                .select('id')
                .maybeSingle(),
            () => supabase
                .from('tours')
                .update({
                    titulo,
                    destino,
                    descripcion,
                    precio,
                    duracion_dias: duracion,
                    cupos
                })
                .eq('id', id)
                .select('id')
                .maybeSingle()
        );

        if (error) {

            throw error;

        }

        if (!updatedTour) {

            throw createHttpError(
                'Tour no encontrado',
                404
            );

        }

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'UPDATE_TOUR',
            entity: 'tours',
            entityId: id,
            metadata: {
                titulo,
                destino,
                precio,
                cupos
            }
        });

        return sendXmlResponse(
            res,
            200,
            'success',
            'Tour actualizado correctamente'
        );

    } catch (error) {

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'UPDATE_TOUR',
            entity: 'tours',
            entityId: req.params.id,
            status: 'error',
            metadata: {
                error: error.message
            }
        });

        return sendXmlResponse(
            res,
            error.statusCode || 500,
            'error',
            error.message
        );

    }

};

const deleteTour = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            data: deletedTour,
            error
        } = await supabase

            .from('tours')

            .delete()

            .eq('id', id)

            .select('id')

            .maybeSingle();

        if (error) {

            throw error;

        }

        if (!deletedTour) {

            throw createHttpError(
                'Tour no encontrado',
                404
            );

        }

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'DELETE_TOUR',
            entity: 'tours',
            entityId: id
        });

        return sendXmlResponse(
            res,
            200,
            'success',
            'Tour eliminado correctamente'
        );

    } catch (error) {

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'DELETE_TOUR',
            entity: 'tours',
            entityId: req.params.id,
            status: 'error',
            metadata: {
                error: error.message
            }
        });

        return sendXmlResponse(
            res,
            error.statusCode || 500,
            'error',
            error.message
        );

    }

};

module.exports = {

    createTour,
    getTours,
    getTourById,
    updateTour,
    deleteTour

};
