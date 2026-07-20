import api from "../api/axios";

const buildTransportXml = (data) => {
    return `
        <transport>
            <origen>${data.origen}</origen>
            <destino>${data.destino}</destino>
            <aerolinea>${data.aerolinea}</aerolinea>
            <tipo>${data.tipo}</tipo>
            <fecha_salida>${data.fecha_salida}</fecha_salida>
            <fecha_llegada>${data.fecha_llegada}</fecha_llegada>
            <precio>${data.precio}</precio>
            <capacidad>${data.capacidad}</capacidad>
        </transport>
    `;
};

const xmlHeaders = {
    "Content-Type": "application/xml"
};

export const getFlights = async () => {

    const response = await api.get(
        "/flights/list",
        {
            headers: {
                Accept: "application/json"
            }
        }
    );

    return response.data;

};

export const createFlight = async (data) => {
    const response = await api.post(
        "/flights/create",
        buildTransportXml(data),
        {
            headers: xmlHeaders
        }
    );

    return response.data;
};

export const updateFlight = async (id, data) => {
    const response = await api.put(
        `/flights/${id}`,
        buildTransportXml(data),
        {
            headers: xmlHeaders
        }
    );

    return response.data;
};

export const deleteFlight = async (id) => {
    const response = await api.delete(
        `/flights/${id}`
    );

    return response.data;
};
