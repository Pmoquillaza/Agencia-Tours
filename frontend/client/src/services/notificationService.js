import api from "../api/axios";

// =====================================
// ENVIAR EMAIL
// =====================================

export const sendReservationEmail = async (
    data
) => {
    const xml = `
        <notification>
            <correo>${data.correo}</correo>
            <nombre>${data.nombre}</nombre>
            <tour>${data.tour}</tour>
            <total>${data.total}</total>
        </notification>
    `;

    const response = await api.post(

        "/notifications/send",

        xml,
        {
            headers: {
                "Content-Type":
                    "application/xml"
            }
        }
    );

    return response.data;
};
