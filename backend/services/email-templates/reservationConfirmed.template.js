const money = (value) => {
    return `S/ ${Number(value || 0).toFixed(2)}`;
};

const clean = (value, fallback = "") => {
    const normalized = String(value ?? "").trim();

    if (
        !normalized ||
        ["undefined", "null", "nan"].includes(normalized.toLowerCase())
    ) {
        return fallback;
    }

    return normalized;
};

const safe = (value, fallback = "") =>
    clean(value, fallback)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

const buildReservationConfirmedEmail = ({
    user,
    reservation,
    tour,
    travelers = []
}) => {
    const fullName = safe(
        [clean(user?.nombre), clean(user?.apellido)]
            .filter(Boolean)
            .join(" "),
        "Cliente"
    );
    const tourName = safe(tour?.titulo || tour?.nombre || "Viaje confirmado");
    const destination = safe(tour?.destino || "Destino seleccionado");
    const reservationCode = `TG-${String(reservation?.id || "")
        .slice(0, 8)
        .toUpperCase()}`;
    const heroImage = safe(
        tour?.imagen ||
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
    );
    const travelerNames = travelers.length > 0
        ? travelers
            .map((traveler) => {
                const name = safe(
                    [clean(traveler.nombres), clean(traveler.apellidos)]
                        .filter(Boolean)
                        .join(" "),
                    "Viajero registrado"
                );
                const document = safe(
                    traveler.documento || traveler.dni,
                    "Documento registrado"
                );

                return `
                    <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e0e0e0;color:#1a1c1c;font-weight:700;">${name}</td>
                        <td style="padding:12px 0;border-bottom:1px solid #e0e0e0;color:#666666;text-align:right;">${document}</td>
                    </tr>
                `;
            })
            .join("")
        : `
            <tr>
                <td colspan="2" style="padding:12px 0;color:#666666;">
                    Los viajeros fueron registrados correctamente para esta reserva.
                </td>
            </tr>
        `;
    const tourTotal = Math.max(
        Number(reservation?.subtotal || 0) -
        Number(reservation?.precio_transporte || 0) -
        Number(reservation?.precio_hotel || 0),
        0
    );
    const transportName = safe(
        reservation?.transport_nombre ||
        reservation?.tipo_transporte ||
        "Transporte seleccionado"
    );
    const hotelName = safe(
        reservation?.hotel_nombre ||
        "Hospedaje seleccionado"
    );

    return `
        <!doctype html>
        <html lang="es">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Reserva confirmada | TravelGo</title>
        </head>
        <body style="margin:0;background:#f9f9f9;font-family:Inter,Arial,Helvetica,sans-serif;color:#1a1c1c;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9f9f9;padding:0;">
                <tr>
                    <td align="center">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;">
                            <tr>
                                <td style="height:66px;padding:0 28px;border-bottom:1px solid #e0e0e0;">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td style="font-size:24px;font-weight:900;color:#006CE4;">TravelGo</td>
                                            <td style="text-align:right;font-size:12px;font-weight:800;text-transform:uppercase;color:#424656;">Confirmacion</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:34px 28px 18px;">
                                    <h1 style="margin:0 0 12px;font-size:34px;line-height:1.12;color:#1a1c1c;">
                                        Tu aventura esta lista, ${fullName}
                                    </h1>
                                    <p style="margin:0;color:#424656;font-size:16px;line-height:1.65;">
                                        Gracias por reservar con TravelGo. Tu itinerario fue confirmado y el pago quedo registrado correctamente.
                                    </p>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:0 28px 22px;">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e0e0e0;border-radius:12px;background:#f9f9f9;">
                                        <tr>
                                            <td style="padding:18px 20px;">
                                                <div style="font-size:12px;color:#424656;text-transform:uppercase;font-weight:800;margin-bottom:6px;">
                                                    Codigo de reserva
                                                </div>
                                                <div style="font-size:24px;font-weight:900;color:#004ccd;letter-spacing:1px;">
                                                    ${reservationCode}
                                                </div>
                                            </td>
                                            <td style="padding:18px 20px;text-align:right;">
                                                <span style="display:inline-block;padding:7px 14px;border-radius:999px;background:#6bfe9c;color:#005228;font-size:12px;font-weight:900;">
                                                    Confirmada
                                                </span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:0 28px;">
                                    <h2 style="margin:0 0 14px;font-size:22px;line-height:1.25;color:#1a1c1c;">Resumen del viaje</h2>
                                    <div style="height:190px;border-radius:12px;overflow:hidden;background:#e2e2e2;">
                                        <img src="${heroImage}" alt="${tourName}" style="width:100%;height:190px;object-fit:cover;display:block;">
                                    </div>
                                    <h3 style="margin:16px 0 4px;font-size:20px;line-height:1.25;color:#1a1c1c;">${tourName}</h3>
                                    <p style="margin:0 0 18px;color:#666666;">${destination}</p>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:0 28px 10px;">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                                        <tr>
                                            <td style="padding:12px 0;border-top:1px solid #e0e0e0;color:#666666;">Viajeros</td>
                                            <td style="padding:12px 0;border-top:1px solid #e0e0e0;text-align:right;font-weight:800;">${safe(reservation?.cantidad_personas || 1)}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding:12px 0;border-top:1px solid #e0e0e0;color:#666666;">Tour</td>
                                            <td style="padding:12px 0;border-top:1px solid #e0e0e0;text-align:right;font-weight:800;">${money(tourTotal)}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding:12px 0;border-top:1px solid #e0e0e0;color:#666666;">Transporte<br><span style="font-size:12px;color:#424656;">${transportName}</span></td>
                                            <td style="padding:12px 0;border-top:1px solid #e0e0e0;text-align:right;font-weight:800;">${money(reservation?.precio_transporte)}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding:12px 0;border-top:1px solid #e0e0e0;color:#666666;">Hospedaje<br><span style="font-size:12px;color:#424656;">${hotelName}</span></td>
                                            <td style="padding:12px 0;border-top:1px solid #e0e0e0;text-align:right;font-weight:800;">${money(reservation?.precio_hotel)}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding:18px 0;border-top:1px solid #e0e0e0;color:#1a1c1c;font-size:18px;font-weight:900;">Total pagado</td>
                                            <td style="padding:18px 0;border-top:1px solid #e0e0e0;text-align:right;color:#006CE4;font-size:26px;font-weight:900;">${money(reservation?.total)}</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:0 28px 24px;">
                                    <h2 style="margin:10px 0 10px;font-size:20px;color:#1a1c1c;">Viajeros</h2>
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                                        ${travelerNames}
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:24px 28px;background:#eeeeee;text-align:center;color:#424656;font-size:14px;line-height:1.7;">
                                    <strong style="display:block;color:#1a1c1c;margin-bottom:8px;">Necesitas ayuda con tu reserva?</strong>
                                    Responde este correo o contacta al equipo de TravelGo con el codigo ${reservationCode}.
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};

module.exports = {
    buildReservationConfirmedEmail
};
