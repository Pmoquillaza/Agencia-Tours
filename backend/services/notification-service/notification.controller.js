const { create } = require('xmlbuilder2');

const sendEmail = require('../email.service');

const { logAudit } = require('../audit.service');

const {
    recordNotification
} = require('./notification.service');

const {
    buildReservationConfirmedEmail
} = require('../email-templates/reservationConfirmed.template');

const sendReservationEmail = async (req, res) => {
    let correo = '';
    let nombre = '';
    let tour = '';
    let total = '';
    const subject = 'TravelGo - Reserva confirmada';

    try {

        // =========================
        // XML STRING
        // =========================

        const xmlData = req.body.toString();

        // =========================
        // EXTRAER XML
        // =========================

        correo = xmlData.match(
            /<correo>\s*(.*?)\s*<\/correo>/
        )?.[1];

        nombre = xmlData.match(
            /<nombre>\s*(.*?)\s*<\/nombre>/
        )?.[1];

        tour = xmlData.match(
            /<tour>\s*(.*?)\s*<\/tour>/
        )?.[1];

        total = xmlData.match(
            /<total>\s*(.*?)\s*<\/total>/
        )?.[1];

        // =========================
        // VALIDAR
        // =========================

        if (!correo) {

            throw new Error(
                'Correo requerido'
            );

        }

        // =========================
        // TEMPLATE
        // =========================

        const htmlTemplate =
            buildReservationConfirmedEmail({
                user: {
                    nombre,
                    apellido: '',
                    correo
                },
                reservation: {
                    id: 'XML',
                    cantidad_personas: 1,
                    tipo_transporte: 'No definido',
                    subtotal: total,
                    impuesto: 0,
                    total
                },
                tour: {
                    titulo: tour,
                    destino: 'Destino seleccionado'
                },
                travelers: []
            });

        // =========================
        // ENVIAR EMAIL
        // =========================

        await sendEmail({

            subject,

            to: correo,

            text:
                `Hola ${nombre || 'Cliente'}. Tu reserva TravelGo fue confirmada. Total: S/ ${total}.`,

            html: htmlTemplate

        });

        await recordNotification({
            reservationId: null,
            userId: req.user?.id || null,
            to: correo,
            subject,
            estado: 'enviado',
            metadata: {
                service: 'notification-service',
                source: 'manual_endpoint',
                nombre,
                tour,
                total
            }
        });

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'SEND_RESERVATION_EMAIL',
            entity: 'notifications',
            entityId: correo,
            metadata: {
                correo,
                nombre,
                tour,
                total
            }
        });

        // =========================
        // XML RESPONSE
        // =========================

        const response = create({ version: '1.0' })

            .ele('response')

                .ele('status')
                    .txt('success')
                .up()

                .ele('message')
                    .txt('Correo enviado')
                .up()

            .up();

        res.set(
            'Content-Type',
            'application/xml'
        );

        res.send(
            response.end({
                prettyPrint: true
            })
        );

    } catch (error) {

        if (correo) {
            await recordNotification({
                reservationId: null,
                userId: req.user?.id || null,
                to: correo,
                subject,
                estado: 'fallido',
                error: error.message,
                metadata: {
                    service: 'notification-service',
                    source: 'manual_endpoint',
                    nombre,
                    tour,
                    total
                }
            });
        }

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'SEND_RESERVATION_EMAIL',
            entity: 'notifications',
            status: 'error',
            metadata: {
                error: error.message
            }
        });

        const response = create({ version: '1.0' })

            .ele('response')

                .ele('status')
                    .txt('error')
                .up()

                .ele('message')
                    .txt(error.message)
                .up()

            .up();

        res.status(500);

        res.set(
            'Content-Type',
            'application/xml'
        );

        res.send(
            response.end({
                prettyPrint: true
            })
        );

    }

};

module.exports = {

    sendReservationEmail

};
