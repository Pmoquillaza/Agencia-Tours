import api from "../api/axios";

const escapeXml = (value) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

// =====================================
// CREAR VIAJERO
// =====================================

export const createTraveler = async (travelerData) => {

    const token = localStorage.getItem("token");

    const xml = `

        <traveler>

            <reservation_id>
                ${escapeXml(travelerData.reservation_id)}
            </reservation_id>

            <nombres>
                ${escapeXml(travelerData.nombres)}
            </nombres>

            <apellidos>
                ${escapeXml(travelerData.apellidos)}
            </apellidos>

            <dni>
                ${escapeXml(travelerData.documento || travelerData.dni)}
            </dni>

            <fecha_nacimiento>
                ${escapeXml(travelerData.fecha_nacimiento)}
            </fecha_nacimiento>

            <genero>
                ${escapeXml(travelerData.genero)}
            </genero>

            <telefono>
                ${escapeXml(travelerData.telefono)}
            </telefono>

        </traveler>

    `;

    const response = await api.post(

        "/travelers/create",

        xml,

        {
            headers: {

                "Content-Type": "application/xml",

                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

// =====================================
// OBTENER VIAJEROS
// =====================================

export const getTravelersByReservation = async (reservationId) => {

    const token = localStorage.getItem("token");

    const response = await api.get(

        `/travelers/reservation/${reservationId}`,

        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};
