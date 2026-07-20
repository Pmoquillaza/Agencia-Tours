const { create } = require('xmlbuilder2');

const supabase = require('../../config/supabase');

const { logAudit } = require('../audit.service');

const getXmlValue = (xmlData, tag) => {
    return xmlData.match(
        new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)
    )?.[1]?.trim();
};

const sendXmlResponse = (res, statusCode, status, message) => {
    const response = create({ version: '1.0' })
        .ele('response')
            .ele('status').txt(status).up()
            .ele('message').txt(message).up()
        .up();

    res.set('Content-Type', 'application/xml');
    return res.status(statusCode).send(
        response.end({ prettyPrint: true })
    );
};

const normalizeTransportType = (type) => {
    const normalized = String(type || '').toLowerCase();

    if (['avion', 'avión', 'vuelo'].includes(normalized)) {
        return 'vuelo';
    }

    return normalized;
};

const validateTransportData = ({
    origen,
    destino,
    aerolinea,
    tipo,
    precio,
    capacidad
}) => {
    if (
        !origen ||
        !destino ||
        !aerolinea ||
        !tipo ||
        !precio ||
        !capacidad
    ) {
        const error = new Error(
            'Todos los campos del transporte son obligatorios'
        );
        error.statusCode = 400;
        throw error;
    }

    if (!['vuelo', 'bus'].includes(tipo)) {
        const error = new Error(
            'El tipo debe ser vuelo o bus'
        );
        error.statusCode = 400;
        throw error;
    }
};

const createFlight = async (req, res) => {

    try {

        const xmlData = req.body;

        const origen = getXmlValue(xmlData, 'origen');
        const destino = getXmlValue(xmlData, 'destino');
        const aerolinea = getXmlValue(xmlData, 'aerolinea');
        const tipo = normalizeTransportType(
            getXmlValue(xmlData, 'tipo')
        );
        const fecha_salida = getXmlValue(xmlData, 'fecha_salida');
        const fecha_llegada = getXmlValue(xmlData, 'fecha_llegada');
        const precio = getXmlValue(xmlData, 'precio');
        const capacidad = getXmlValue(xmlData, 'capacidad');

        validateTransportData({
            origen,
            destino,
            aerolinea,
            tipo,
            precio,
            capacidad
        });

        const { data, error } = await supabase

            .from('flights')

            .insert([
                {
                    origen,
                    destino,
                    aerolinea,
                    tipo,
                    fecha_salida,
                    fecha_llegada,
                    precio,
                    capacidad
                }
            ])
            .select()
            .single();

        if (error) {

            throw error;

        }

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'CREATE_TRANSPORT',
            entity: 'flights',
            entityId: data.id,
            metadata: {
                origen,
                destino,
                aerolinea,
                tipo,
                precio,
                capacidad
            }
        });

        return sendXmlResponse(
            res,
            201,
            'success',
            'Transporte creado correctamente'
        );

    } catch (error) {

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'CREATE_TRANSPORT',
            entity: 'flights',
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

const getFlights = async (req, res) => {

    try {

        const { data, error } = await supabase
            .from('flights')
            .select('*');

        if (error) {
            throw error;
        }

        // SI EL FRONTEND PIDE JSON
        if (req.headers.accept?.includes('application/json')) {

            return res.json(data);

        }

        // SI OTRO MICROSERVICIO PIDE XML
        const root = create({ version: '1.0' })
            .ele('flights');

        data.forEach(flight => {

            const item = root.ele('flight');

            item.ele('id').txt(flight.id);

            item.ele('origen').txt(flight.origen);

            item.ele('destino').txt(flight.destino);

            item.ele('aerolinea').txt(flight.aerolinea);

            item.ele('tipo').txt(flight.tipo);

            item.ele('precio').txt(
                flight.precio.toString()
            );

        });

        res.set('Content-Type', 'application/xml');

        res.send(
            root.end({ prettyPrint: true })
        );

    } catch (error) {

        res.status(500).send(error.message);

    }

};

const getFlightById = async (req, res) => {

    try {

        const { id } = req.params;

        const { data, error } = await supabase

            .from('flights')

            .select('*')

            .eq('id', id)

            .single();

        if (error) {

            throw error;

        }

        const response = create({ version: '1.0' })

            .ele('flight');

        response.ele('id').txt(data.id);

        response.ele('origen').txt(data.origen);

        response.ele('destino').txt(data.destino);

        response.ele('aerolinea').txt(data.aerolinea);

        response.ele('tipo').txt(data.tipo);

        response.ele('precio').txt(
            data.precio.toString()
        );

        res.set('Content-Type', 'application/xml');

        res.send(response.end({ prettyPrint: true }));

    } catch (error) {

        res.status(500).send(error.message);

    }

};

const updateFlight = async (req, res) => {

    try {

        const { id } = req.params;

        const xmlData = req.body;

        const origen = getXmlValue(xmlData, 'origen');
        const destino = getXmlValue(xmlData, 'destino');
        const aerolinea = getXmlValue(xmlData, 'aerolinea');
        const tipo = normalizeTransportType(
            getXmlValue(xmlData, 'tipo')
        );
        const fecha_salida = getXmlValue(xmlData, 'fecha_salida');
        const fecha_llegada = getXmlValue(xmlData, 'fecha_llegada');
        const precio = getXmlValue(xmlData, 'precio');
        const capacidad = getXmlValue(xmlData, 'capacidad');

        validateTransportData({
            origen,
            destino,
            aerolinea,
            tipo,
            precio,
            capacidad
        });

        const { data, error } = await supabase
            .from('flights')
            .update({
                origen,
                destino,
                aerolinea,
                tipo,
                fecha_salida,
                fecha_llegada,
                precio,
                capacidad
            })
            .eq('id', id)
            .select('id')
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            const notFound = new Error('Transporte no encontrado');
            notFound.statusCode = 404;
            throw notFound;
        }

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'UPDATE_TRANSPORT',
            entity: 'flights',
            entityId: id,
            metadata: {
                origen,
                destino,
                aerolinea,
                tipo,
                precio,
                capacidad
            }
        });

        return sendXmlResponse(
            res,
            200,
            'success',
            'Transporte actualizado correctamente'
        );

    } catch (error) {

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'UPDATE_TRANSPORT',
            entity: 'flights',
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

const deleteFlight = async (req, res) => {

    try {

        const { id } = req.params;

        const { data, error } = await supabase
            .from('flights')
            .delete()
            .eq('id', id)
            .select('id')
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            const notFound = new Error('Transporte no encontrado');
            notFound.statusCode = 404;
            throw notFound;
        }

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'DELETE_TRANSPORT',
            entity: 'flights',
            entityId: id
        });

        return sendXmlResponse(
            res,
            200,
            'success',
            'Transporte eliminado correctamente'
        );

    } catch (error) {

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'DELETE_TRANSPORT',
            entity: 'flights',
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

    createFlight,
    deleteFlight,
    getFlights,
    getFlightById,
    updateFlight

};
