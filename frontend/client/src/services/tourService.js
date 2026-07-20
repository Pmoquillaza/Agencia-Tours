import api from "../api/axios";

const buildTourXml = (data) => {

    return `
        <tour>
            <titulo>${data.titulo}</titulo>
            <destino>${data.destino}</destino>
            <descripcion>${data.descripcion}</descripcion>
            <precio>${data.precio}</precio>
            <duracion>${data.duracion}</duracion>
            <cupos>${data.cupos}</cupos>
        </tour>
    `;

};

const xmlHeaders = {
    "Content-Type": "application/xml"
};

// =========================
// OBTENER TOURS
// =========================

export const getTours = async () => {

    const response = await api.get(
        "/tours/list"
    );

    return response.data;

};

// =========================
// CREAR TOUR
// =========================

export const createTour = async (data) => {

    const response = await api.post(
        "/tours/create",
        buildTourXml(data),
        {
            headers: xmlHeaders
        }
    );

    return response.data;

};

// =========================
// ACTUALIZAR TOUR
// =========================

export const updateTour = async (id, data) => {

    const response = await api.put(
        `/tours/${id}`,
        buildTourXml(data),
        {
            headers: xmlHeaders
        }
    );

    return response.data;

};

// =========================
// ELIMINAR TOUR
// =========================

export const deleteTour = async (id) => {

    const response = await api.delete(
        `/tours/${id}`
    );

    return response.data;

};

// =========================
// OBTENER TOUR POR ID
// =========================

export const getTourById = async (id) => {

    const response = await api.get(
        `/tours/${id}`
    );

    return response.data;

};
