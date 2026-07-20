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

const validateHotelData = ({
    nombre,
    ciudad,
    estrellas,
    descripcion,
    precio_por_noche
}) => {
    if (
        !nombre ||
        !ciudad ||
        !estrellas ||
        !descripcion ||
        !precio_por_noche
    ) {
        const error = new Error(
            'Todos los campos del hotel son obligatorios'
        );
        error.statusCode = 400;
        throw error;
    }
};

// =====================================
// CREAR HOTEL
// =====================================

const createHotel = async (req, res) => {

    try {

        const xmlData = req.body;

        const nombre = getXmlValue(xmlData, 'nombre');

        const ciudad = getXmlValue(xmlData, 'ciudad');

        const estrellas = getXmlValue(xmlData, 'estrellas');

        const descripcion = getXmlValue(xmlData, 'descripcion');

        const precio_por_noche = getXmlValue(xmlData, 'precio_por_noche');

        validateHotelData({
            nombre,
            ciudad,
            estrellas,
            descripcion,
            precio_por_noche
        });

        const { data, error } = await supabase

            .from('hotels')

            .insert([
                {
                    nombre,
                    ciudad,
                    estrellas,
                    descripcion,
                    precio_por_noche
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
            action: 'CREATE_HOTEL',
            entity: 'hotels',
            entityId: data.id,
            metadata: {
                nombre,
                ciudad,
                estrellas,
                precio_por_noche
            }
        });

        return sendXmlResponse(
            res,
            201,
            'success',
            'Hotel creado correctamente'
        );

    } catch (error) {

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'CREATE_HOTEL',
            entity: 'hotels',
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

// =====================================
// ACTUALIZAR HOTEL
// =====================================

const updateHotel = async (req, res) => {

    try {

        const { id } = req.params;

        const xmlData = req.body;

        const nombre = getXmlValue(xmlData, 'nombre');
        const ciudad = getXmlValue(xmlData, 'ciudad');
        const estrellas = getXmlValue(xmlData, 'estrellas');
        const descripcion = getXmlValue(xmlData, 'descripcion');
        const precio_por_noche = getXmlValue(xmlData, 'precio_por_noche');

        validateHotelData({
            nombre,
            ciudad,
            estrellas,
            descripcion,
            precio_por_noche
        });

        const { data, error } = await supabase
            .from('hotels')
            .update({
                nombre,
                ciudad,
                estrellas,
                descripcion,
                precio_por_noche
            })
            .eq('id', id)
            .select('id')
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            const notFound = new Error('Hotel no encontrado');
            notFound.statusCode = 404;
            throw notFound;
        }

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'UPDATE_HOTEL',
            entity: 'hotels',
            entityId: id,
            metadata: {
                nombre,
                ciudad,
                estrellas,
                precio_por_noche
            }
        });

        return sendXmlResponse(
            res,
            200,
            'success',
            'Hotel actualizado correctamente'
        );

    } catch (error) {

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'UPDATE_HOTEL',
            entity: 'hotels',
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

// =====================================
// ELIMINAR HOTEL
// =====================================

const deleteHotel = async (req, res) => {

    try {

        const { id } = req.params;

        const { data, error } = await supabase
            .from('hotels')
            .delete()
            .eq('id', id)
            .select('id')
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            const notFound = new Error('Hotel no encontrado');
            notFound.statusCode = 404;
            throw notFound;
        }

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'DELETE_HOTEL',
            entity: 'hotels',
            entityId: id
        });

        return sendXmlResponse(
            res,
            200,
            'success',
            'Hotel eliminado correctamente'
        );

    } catch (error) {

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'DELETE_HOTEL',
            entity: 'hotels',
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

// =====================================
// LISTAR HOTELES
// =====================================

const getHotels = async (req, res) => {

    try {

        const { data, error } = await supabase

            .from('hotels')

            .select('*');

        if (error) {

            throw error;

        }

        // FRONTEND REACT → JSON
        if (
            req.headers.accept?.includes(
                'application/json'
            )
        ) {

            return res.json(data);

        }

        // MICROSERVICIOS → XML
        const root = create({ version: '1.0' })

            .ele('hotels');

        data.forEach(hotel => {

            const item = root.ele('hotel');

            item.ele('id').txt(hotel.id);

            item.ele('nombre').txt(hotel.nombre);

            item.ele('ciudad').txt(hotel.ciudad);

            item.ele('estrellas').txt(
                hotel.estrellas.toString()
            );

            item.ele('descripcion').txt(
                hotel.descripcion || ''
            );

            item.ele('precio_por_noche').txt(
                hotel.precio_por_noche.toString()
            );

        });

        res.set(
            'Content-Type',
            'application/xml'
        );

        res.send(
            root.end({ prettyPrint: true })
        );

    } catch (error) {

        res.status(500).send(error.message);

    }

};

// =====================================
// EXPORTS
// =====================================

module.exports = {

    createHotel,
    deleteHotel,
    getHotels,
    updateHotel

};
