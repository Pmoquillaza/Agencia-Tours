import api from "../api/axios";

const buildHotelXml = (data) => {
    return `
        <hotel>
            <nombre>${data.nombre}</nombre>
            <ciudad>${data.ciudad}</ciudad>
            <estrellas>${data.estrellas}</estrellas>
            <descripcion>${data.descripcion}</descripcion>
            <precio_por_noche>${data.precio_por_noche}</precio_por_noche>
        </hotel>
    `;
};

const xmlHeaders = {
    "Content-Type": "application/xml"
};

export const getHotels = async () => {

    const response = await api.get(
        "/hotels/list",
        {
            headers: {
                Accept: "application/json"
            }
        }
    );

    return response.data;

};

export const createHotel = async (data) => {
    const response = await api.post(
        "/hotels/create",
        buildHotelXml(data),
        {
            headers: xmlHeaders
        }
    );

    return response.data;
};

export const updateHotel = async (id, data) => {
    const response = await api.put(
        `/hotels/${id}`,
        buildHotelXml(data),
        {
            headers: xmlHeaders
        }
    );

    return response.data;
};

export const deleteHotel = async (id) => {
    const response = await api.delete(
        `/hotels/${id}`
    );

    return response.data;
};
