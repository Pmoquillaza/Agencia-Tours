const supabase = require('../../config/supabase');

const { logAudit } = require('../audit.service');

const cleanValue = (value) => {
    const normalized = String(value ?? "").trim();

    if (
        !normalized ||
        ["undefined", "null", "nan"].includes(normalized.toLowerCase())
    ) {
        return "";
    }

    return normalized;
};

// =====================================
// CREAR VIAJERO
// =====================================

const createTraveler = async (req, res) => {

    try {

        const xmlData = req.body;

        // =========================
        // EXTRAER XML
        // =========================

        const reservation_id = cleanValue(xmlData.match(
            /<reservation_id>([\s\S]*?)<\/reservation_id>/
        )?.[1]);

        const nombres = cleanValue(xmlData.match(
            /<nombres>([\s\S]*?)<\/nombres>/
        )?.[1]);

        const apellidos = cleanValue(xmlData.match(
            /<apellidos>([\s\S]*?)<\/apellidos>/
        )?.[1]);

        const dni = cleanValue(xmlData.match(
            /<dni>([\s\S]*?)<\/dni>/
        )?.[1]);

        const fecha_nacimiento = cleanValue(xmlData.match(
            /<fecha_nacimiento>([\s\S]*?)<\/fecha_nacimiento>/
        )?.[1]);

        const genero = cleanValue(xmlData.match(
            /<genero>([\s\S]*?)<\/genero>/
        )?.[1]);

        const telefono = cleanValue(xmlData.match(
            /<telefono>([\s\S]*?)<\/telefono>/
        )?.[1]);

        // =========================
        // VALIDACIONES
        // =========================

        if (!reservation_id) {

            throw new Error("reservation_id requerido");

        }

        if (!nombres) {

            throw new Error("nombres requerido");

        }

        // =========================
        // INSERTAR
        // =========================

        const { data, error } = await supabase

            .from("travelers")

            .insert([
                {
                    reservation_id,
                    nombres,
                    apellidos: apellidos || null,
                    dni: dni || null,
                    fecha_nacimiento: fecha_nacimiento || null,
                    genero: genero || null,
                    telefono: telefono || null
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
            action: 'CREATE_TRAVELER',
            entity: 'travelers',
            entityId: data.id,
            metadata: {
                reservation_id,
                nombres,
                apellidos
            }
        });

        res.json({

            status: "success",

            traveler: data

        });

    } catch (error) {

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'CREATE_TRAVELER',
            entity: 'travelers',
            status: 'error',
            metadata: {
                error: error.message
            }
        });

        res.status(500).json({

            status: "error",

            message: error.message

        });

    }

};

// =====================================
// LISTAR VIAJEROS
// =====================================

const getTravelersByReservation = async (req, res) => {

    try {

        const { reservationId } = req.params;

        const { data, error } = await supabase

            .from("travelers")

            .select("*")

            .eq("reservation_id", reservationId);

        if (error) {

            throw error;

        }

        res.json(data);

    } catch (error) {

        res.status(500).json({

            status: "error",

            message: error.message

        });

    }

};

// =====================================
// EXPORTS
// =====================================

module.exports = {

    createTraveler,
    getTravelersByReservation

};
