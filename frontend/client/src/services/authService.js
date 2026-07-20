import api from "../api/axios";

// =====================================
// REGISTER
// =====================================

export const registerUser = async (data) => {

    const xml = `

        <user>

            <nombre>${data.nombre}</nombre>

            <apellido>${data.apellido}</apellido>

            <correo>${data.email}</correo>

            <password>${data.password}</password>

        </user>

    `;

    const response = await api.post(

        "/auth/register",

        xml,

        {
            headers: {
                "Content-Type": "application/xml"
            }
        }

    );

    return response.data;

};

// =====================================
// LOGIN
// =====================================

export const loginUser = async (data) => {

    const xml = `

        <user>

            <correo>${data.email}</correo>

            <password>${data.password}</password>

        </user>

    `;

    const response = await api.post(

        "/auth/login",

        xml,

        {
            headers: {
                "Content-Type": "application/xml"
            }
        }

    );

    return response.data;

};

// =====================================
// VERIFICAR CODIGO
// =====================================

export const verifyAuthCode = async (data) => {

    const response = await api.post(
        "/auth/verify-code",
        {
            correo: data.email || data.correo,
            code: data.code,
            purpose: data.purpose
        }
    );

    return response.data;

};

// =====================================
// PERFIL
// =====================================

export const getProfile = async () => {

    const response = await api.get(
        "/auth/profile"
    );

    return response.data;

};

export const updateProfile = async (data) => {

    const response = await api.put(
        "/auth/profile",
        data
    );

    return response.data;

};
