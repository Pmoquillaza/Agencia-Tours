const { create } = require('xmlbuilder2');

const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

const crypto = require('crypto');

const supabase = require('../../config/supabase');

const getSupabaseAdmin = require('../../config/supabaseAdmin');

const { logAudit } = require('../audit.service');

const sendEmail = require('../email.service');

const {
    recordNotification
} = require('../notification-service/notification.service');

const getXmlValue = (xmlData, tag) => {

    return xmlData.match(
        new RegExp(`<${tag}>(.*?)</${tag}>`)
    )?.[1]?.trim();

};

const createHttpError = (message, statusCode) => {

    const error = new Error(message);

    error.statusCode = statusCode;

    return error;

};

const normalizeEmail = (value) =>
    cleanValue(value).toLowerCase();

const getRequestValue = (req, tag) => {
    if (typeof req.body === 'string') {
        return getXmlValue(req.body, tag);
    }

    return req.body?.[tag];
};

const getRequestEmail = (req) =>
    getRequestValue(req, 'correo') ||
    getRequestValue(req, 'email');

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

const validateRegisterData = ({
    nombre,
    apellido,
    correo,
    password
}) => {

    if (!nombre || !apellido || !correo || !password) {

        throw createHttpError(
            'Nombre, apellido, correo y contrasena son obligatorios',
            400
        );

    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(correo)) {

        throw createHttpError(
            'Formato de correo invalido',
            400
        );

    }

    if (password.length < 6) {

        throw createHttpError(
            'La contrasena debe tener al menos 6 caracteres',
            400
        );

    }

};

const validateLoginData = ({
    correo,
    password
}) => {

    if (!correo || !password) {

        throw createHttpError(
            'Correo y contrasena son obligatorios',
            400
        );

    }

};

const buildPublicUser = (data) => ({
    id: data.id,
    nombre: cleanValue(data.nombre),
    apellido: cleanValue(data.apellido),
    correo: data.correo,
    email: data.email || data.correo,
    rol: data.rol,
    telefono: cleanValue(data.telefono),
    documento: cleanValue(data.documento),
    estado: cleanValue(data.estado) || "activo",
    email_verificado: Boolean(data.email_verificado)
});

const isMissingColumnError = (error) => {
    return (
        error?.code === 'PGRST204' ||
        String(error?.message || "")
            .toLowerCase()
            .includes("could not find") ||
        String(error?.message || "")
            .toLowerCase()
            .includes("schema cache")
    );
};

const isMissingVerificationStorageError = (error) => {
    const message = String(error?.message || "")
        .toLowerCase();

    return (
        isMissingColumnError(error) ||
        ['42p01', 'pgrst205'].includes(
            String(error?.code || "").toLowerCase()
        ) ||
        message.includes('does not exist')
    );
};

const isVerificationPermissionError = (error) => {
    const message = String(error?.message || "")
        .toLowerCase();

    return (
        String(error?.code || "") === '42501' ||
        message.includes('row-level security') ||
        message.includes('permission denied')
    );
};

const rollbackRegisteredUser = async (userId) => {
    if (!userId) {
        return;
    }

    try {
        const admin = getSupabaseAdmin();

        await admin
            .from('auth_verification_codes')
            .delete()
            .eq('user_id', userId);

        await admin
            .from('users')
            .delete()
            .eq('id', userId);

        await admin
            .auth
            .admin
            .deleteUser(userId);
    } catch {
        // El error original del registro es mas importante para responder al cliente.
    }
};

const createToken = (data) => jwt.sign(
    {
        id: data.id,
        correo: data.correo,
        rol: data.rol
    },
    process.env.JWT_SECRET,
    {
        expiresIn: '1d'
    }
);

const getVerificationEmail = ({ nombre, code, purpose }) => {
    const title =
        purpose === 'login'
            ? 'Codigo de acceso TravelGo'
            : 'Confirma tu correo TravelGo';

    const actionText =
        purpose === 'login'
            ? 'Usa este codigo para terminar tu inicio de sesion.'
            : 'Usa este codigo para activar tu cuenta.';

    return {
        subject: title,
        text:
            `Hola ${nombre || 'viajero'}, tu codigo TravelGo es ${code}. ` +
            'Vence en 10 minutos.',
        html: `
            <div style="margin:0;padding:32px;background:#f4f7fb;font-family:Arial,sans-serif;color:#1a1c1c;">
                <div style="max-width:520px;margin:auto;background:#ffffff;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
                    <div style="padding:28px;background:#006ce4;color:#ffffff;">
                        <div style="font-size:13px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;">TravelGo</div>
                        <h1 style="margin:10px 0 0;font-size:28px;line-height:1.15;">${title}</h1>
                    </div>
                    <div style="padding:28px;">
                        <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hola ${nombre || 'viajero'}, ${actionText}</p>
                        <div style="margin:24px 0;padding:22px;border-radius:10px;background:#f2f6ff;text-align:center;">
                            <div style="font-size:13px;color:#666666;font-weight:800;text-transform:uppercase;">Codigo de verificacion</div>
                            <div style="margin-top:8px;font-size:38px;letter-spacing:8px;color:#006ce4;font-weight:900;">${code}</div>
                        </div>
                        <p style="margin:0;color:#666666;font-size:14px;line-height:1.6;">Este codigo vence en 10 minutos. Si no solicitaste este acceso, puedes ignorar este correo.</p>
                    </div>
                </div>
            </div>
        `
    };
};

const issueVerificationCode = async ({
    user,
    purpose
}) => {
    const code = crypto.randomInt(100000, 1000000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(
        Date.now() + 10 * 60 * 1000
    ).toISOString();

    const { error } = await getSupabaseAdmin()
        .from('auth_verification_codes')
        .insert([
            {
                user_id: user.id,
                correo: user.correo,
                purpose,
                code_hash: codeHash,
                expires_at: expiresAt
            }
        ]);

    if (error) {
        throw error;
    }

    const email = getVerificationEmail({
        nombre: user.nombre,
        code,
        purpose
    });

    try {
        const emailResult = await sendEmail({
            to: user.correo,
            subject: email.subject,
            html: email.html,
            text: email.text
        });

        await recordNotification({
            reservationId: null,
            userId: user.id,
            to: user.correo,
            subject: email.subject,
            estado: 'enviado',
            metadata: {
                service: 'auth-service',
                purpose,
                expires_at: expiresAt,
                message_id: emailResult.messageId
            }
        });
    } catch (emailError) {
        await recordNotification({
            reservationId: null,
            userId: user.id,
            to: user.correo,
            subject: email.subject,
            estado: 'fallido',
            error: emailError.message,
            metadata: {
                service: 'auth-service',
                purpose,
                expires_at: expiresAt
            }
        });

        throw emailError;
    }

    return expiresAt;
};

const createSupabaseAuthUser = async ({
    correo,
    password,
    nombre,
    apellido
}) => {
    const { data, error } =
        await getSupabaseAdmin().auth.admin.createUser({
            email: correo,
            password,
            email_confirm: false,
            user_metadata: {
                nombre,
                apellido,
                source: 'travelgo'
            }
        });

    if (error) {
        const message = String(error.message || '');

        if (
            message.toLowerCase().includes('not allowed') ||
            message.toLowerCase().includes('service role') ||
            message.toLowerCase().includes('jwt')
        ) {
            throw createHttpError(
                'Para guardar usuarios en Supabase Authentication configura SUPABASE_SERVICE_ROLE_KEY en el backend con la service_role key de Supabase.',
                503
            );
        }

        throw error;
    }

    return data.user;
};

const confirmSupabaseAuthEmail = async (userId) => {
    try {
        await getSupabaseAdmin().auth.admin.updateUserById(
            userId,
            {
                email_confirm: true
            }
        );
    } catch {
        // La app mantiene su propia verificacion aunque Supabase no confirme el flag.
    }
};

// =====================================
// REGISTER
// =====================================

const registerUser = async (req, res) => {

    try {

        const nombre = cleanValue(
            getRequestValue(req, 'nombre')
        );

        const apellido = cleanValue(
            getRequestValue(req, 'apellido')
        );

        const correo = normalizeEmail(
            getRequestValue(req, 'correo')
        );

        const password = cleanValue(
            getRequestValue(req, 'password')
        );

        // =========================
        // VALIDAR DATOS
        // =========================

        validateRegisterData({
            nombre,
            apellido,
            correo,
            password
        });

        // =========================
        // VERIFICAR USUARIO EXISTENTE
        // =========================

        const {
            data: existingUser,
            error: existingUserError
        } = await supabase

            .from('users')

            .select('id, correo')

            .eq('correo', correo)

            .maybeSingle();

        if (existingUserError) {

            throw existingUserError;

        }

        if (existingUser) {

            throw createHttpError(
                'Usuario ya existe',
                409
            );

        }

        const authUser =
            await createSupabaseAuthUser({
                correo,
                password,
                nombre,
                apellido
            });

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data, error } = await supabase

            .from('users')

            .insert([
                {
                    id: authUser.id,
                    nombre,
                    apellido,
                    correo,
                    password: hashedPassword,
                    supabase_auth_id: authUser.id,
                    email_verificado: false
                }
            ])

            .select()

            .single();

        if (error) {

            await getSupabaseAdmin()
                .auth
                .admin
                .deleteUser(authUser.id)
                .catch(() => null);

            throw error;

        }

        let expiresAt;

        try {
            expiresAt =
                await issueVerificationCode({
                    user: data,
                    purpose: 'registro'
                });
        } catch (verificationError) {
            await rollbackRegisteredUser(authUser.id);

            if (
                isMissingVerificationStorageError(
                    verificationError
                )
            ) {
                throw createHttpError(
                    'Falta ejecutar database/add_auth_email_verification.sql en Supabase para guardar codigos de verificacion.',
                    503
                );
            }

            if (
                isVerificationPermissionError(
                    verificationError
                )
            ) {
                throw createHttpError(
                    'Supabase bloqueo el guardado del codigo por RLS/permisos. El backend debe usar SUPABASE_SERVICE_ROLE_KEY.',
                    503
                );
            }

            throw createHttpError(
                'No se pudo enviar el codigo de verificacion. Revisa la configuracion de correo del backend.',
                503
            );
        }

        await logAudit({
            actorId: data.id,
            actorEmail: data.correo,
            action: 'REGISTER_USER',
            entity: 'users',
            entityId: data.id,
            metadata: {
                nombre: data.nombre,
                apellido: data.apellido
            }
        });

        // =========================
        // RESPUESTA JSON
        // =========================

        res.json({

            status: 'success',

            message: 'Usuario registrado correctamente. Te enviamos un codigo de verificacion al correo.',

            requires_verification: true,

            purpose: 'registro',

            correo: data.correo,

            expires_at: expiresAt,

            user: {
                id: data.id,
                nombre: data.nombre,
                apellido: data.apellido,
                correo: data.correo,
                email_verificado: false
            }

        });

    } catch (error) {

        await logAudit({
            actorEmail: getRequestEmail(req),
            action: 'REGISTER_USER',
            entity: 'users',
            status: 'error',
            metadata: {
                error: error.message
            }
        });

        res.status(error.statusCode || 500).json({

            status: 'error',

            message: error.message

        });

    }

};

// =====================================
// LOGIN
// =====================================

const loginUser = async (req, res) => {

    try {

        const correo = normalizeEmail(
            getRequestValue(req, 'correo')
        );

        const password = cleanValue(
            getRequestValue(req, 'password')
        );

        // =========================
        // VALIDAR CREDENCIALES
        // =========================

        validateLoginData({
            correo,
            password
        });

        const { data, error } = await supabase

            .from('users')

            .select('*')

            .eq('correo', correo)

            .single();

        if (error || !data) {

            throw createHttpError(
                'Credenciales invalidas',
                401
            );

        }

        const validPassword = await bcrypt.compare(

            password,

            data.password

        );

        if (!validPassword) {

            throw createHttpError(
                'Credenciales invalidas',
                401
            );

        }

        if (data.estado === 'bloqueado') {

            throw createHttpError(
                'Cuenta bloqueada',
                403
            );

        }

        let expiresAt;

        try {
            expiresAt =
                await issueVerificationCode({
                    user: data,
                    purpose: 'login'
                });
        } catch (verificationError) {
            if (
                isMissingVerificationStorageError(
                    verificationError
                )
            ) {
                throw createHttpError(
                    'Falta ejecutar database/add_auth_email_verification.sql en Supabase para guardar codigos de verificacion.',
                    503
                );
            }

            if (
                isVerificationPermissionError(
                    verificationError
                )
            ) {
                throw createHttpError(
                    'Supabase bloqueo el guardado del codigo por RLS/permisos. El backend debe usar SUPABASE_SERVICE_ROLE_KEY.',
                    503
                );
            }

            throw createHttpError(
                'No se pudo enviar el codigo de acceso. Revisa la configuracion de correo del backend.',
                503
            );
        }

        await logAudit({
            actorId: data.id,
            actorEmail: data.correo,
            action: 'LOGIN_CODE_SENT',
            entity: 'auth',
            entityId: data.id,
            metadata: {
                rol: data.rol,
                email_verificado: Boolean(data.email_verificado)
            }
        });

        // =========================
        // RESPUESTA JSON
        // =========================

        res.json({

            status: 'success',

            message: data.email_verificado
                ? 'Codigo de acceso enviado al correo'
                : 'Tu correo aun no estaba verificado. Te enviamos un codigo para confirmar tu cuenta e iniciar sesion.',

            requires_verification: true,

            purpose: 'login',

            correo: data.correo,

            expires_at: expiresAt,

            usuario: {

                id: data.id,

                nombre: data.nombre,

                apellido: data.apellido,

                correo: data.correo,

                email: data.email || data.correo,

                rol: data.rol,

                telefono: data.telefono || "",

                documento: data.documento || "",

                email_verificado: Boolean(data.email_verificado)

            }

        });

    } catch (error) {

        await logAudit({
            actorEmail: getRequestEmail(req),
            action: 'LOGIN_USER',
            entity: 'auth',
            status: 'error',
            metadata: {
                error: error.message
            }
        });

        res.status(error.statusCode || 500).json({

            status: 'error',

            message: error.message

        });

    }

};

// =====================================
// VERIFY EMAIL / LOGIN CODE
// =====================================

const verifyAuthCode = async (req, res) => {

    try {

        const admin = getSupabaseAdmin();

        const correo = normalizeEmail(
            getRequestValue(req, 'correo') ||
            getRequestValue(req, 'email')
        );

        const code = cleanValue(
            getRequestValue(req, 'code') ||
            getRequestValue(req, 'codigo')
        );

        const purpose = cleanValue(
            getRequestValue(req, 'purpose') ||
            getRequestValue(req, 'proposito') ||
            'login'
        );

        if (!correo || !code) {
            throw createHttpError(
                'Correo y codigo son obligatorios',
                400
            );
        }

        if (!['registro', 'login'].includes(purpose)) {
            throw createHttpError(
                'Tipo de verificacion invalido',
                400
            );
        }

        const {
            data: user,
            error: userError
        } = await admin
            .from('users')
            .select('*')
            .eq('correo', correo)
            .single();

        if (userError || !user) {
            throw createHttpError(
                'Usuario no encontrado',
                404
            );
        }

        const {
            data: verification,
            error: verificationError
        } = await admin
            .from('auth_verification_codes')
            .select('*')
            .eq('user_id', user.id)
            .eq('purpose', purpose)
            .is('used_at', null)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (verificationError) {
            throw verificationError;
        }

        if (!verification) {
            throw createHttpError(
                'Codigo vencido o no encontrado',
                400
            );
        }

        if (Number(verification.attempts || 0) >= 5) {
            throw createHttpError(
                'Codigo bloqueado por demasiados intentos',
                429
            );
        }

        const validCode = await bcrypt.compare(
            code,
            verification.code_hash
        );

        if (!validCode) {
            await admin
                .from('auth_verification_codes')
                .update({
                    attempts: Number(verification.attempts || 0) + 1
                })
                .eq('id', verification.id);

            throw createHttpError(
                'Codigo invalido',
                400
            );
        }

        await admin
            .from('auth_verification_codes')
            .update({
                used_at: new Date().toISOString()
            })
            .eq('id', verification.id);

        const verificationPatch = {
            email_verificado: true,
            email_verificado_at:
                user.email_verificado_at || new Date().toISOString()
        };

        if (purpose === 'login') {
            verificationPatch.ultimo_login_at =
                new Date().toISOString();
        }

        const {
            data: updatedUser,
            error: updateError
        } = await admin
            .from('users')
            .update(verificationPatch)
            .eq('id', user.id)
            .select('*')
            .single();

        if (updateError) {
            throw updateError;
        }

        if (updatedUser.supabase_auth_id) {
            await confirmSupabaseAuthEmail(
                updatedUser.supabase_auth_id
            );
        }

        await logAudit({
            actorId: updatedUser.id,
            actorEmail: updatedUser.correo,
            action:
                purpose === 'login'
                    ? 'VERIFY_LOGIN_CODE'
                    : 'VERIFY_REGISTER_CODE',
            entity: 'auth',
            entityId: updatedUser.id,
            metadata: {
                purpose
            }
        });

        if (purpose === 'registro') {
            return res.json({
                status: 'success',
                message: 'Correo verificado correctamente. Ahora puedes iniciar sesion.',
                usuario: buildPublicUser(updatedUser)
            });
        }

        const token = createToken(updatedUser);

        return res.json({
            status: 'success',
            message: 'Inicio de sesion verificado correctamente',
            token,
            usuario: buildPublicUser(updatedUser)
        });

    } catch (error) {

        await logAudit({
            actorEmail: getRequestEmail(req),
            action: 'VERIFY_AUTH_CODE',
            entity: 'auth',
            status: 'error',
            metadata: {
                error: error.message
            }
        });

        return res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message
        });

    }

};

// =====================================
// PROFILE
// =====================================

const getProfile = async (req, res) => {

    try {

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error || !data) {

            throw createHttpError(
                'Usuario no encontrado',
                404
            );

        }

        return res.json({
            status: 'success',
            usuario: buildPublicUser(data)
        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message
        });

    }

};

const updateProfile = async (req, res) => {

    try {

        const {
            nombre: rawNombre,
            apellido: rawApellido,
            telefono: rawTelefono,
            documento: rawDocumento
        } = req.body;

        const nombre = cleanValue(rawNombre);
        const apellido = cleanValue(rawApellido);
        const telefono = cleanValue(rawTelefono);
        const documento = cleanValue(rawDocumento);

        if (!nombre || !apellido) {

            throw createHttpError(
                'Nombre y apellido son obligatorios',
                400
            );

        }

        const { data: baseData, error: baseError } = await supabase
            .from('users')
            .update({
                nombre,
                apellido
            })
            .eq('id', req.user.id)
            .select('*')
            .single();

        if (baseError) {

            throw baseError;

        }

        let data = {
            ...baseData,
            telefono: baseData.telefono || telefono || "",
            documento: baseData.documento || documento || ""
        };

        const { data: optionalData, error: optionalError } = await supabase
            .from('users')
            .update({
                telefono: telefono || null,
                documento: documento || null
            })
            .eq('id', req.user.id)
            .select('*')
            .single();

        if (optionalError && !isMissingColumnError(optionalError)) {

            throw optionalError;

        }

        if (optionalData) {

            data = optionalData;

        }

        await logAudit({
            actorId: req.user.id,
            actorEmail: req.user.correo,
            action: 'UPDATE_PROFILE',
            entity: 'users',
            entityId: req.user.id,
            metadata: {
                nombre,
                apellido,
                telefono_updated: Boolean(telefono),
                documento_updated: Boolean(documento)
            }
        });

        return res.json({
            status: 'success',
            message: 'Perfil actualizado correctamente',
            usuario: buildPublicUser(data)
        });

    } catch (error) {

        await logAudit({
            actorId: req.user?.id,
            actorEmail: req.user?.correo,
            action: 'UPDATE_PROFILE',
            entity: 'users',
            entityId: req.user?.id,
            status: 'error',
            metadata: {
                error: error.message
            }
        });

        return res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message
        });

    }

};

module.exports = {

    registerUser,
    loginUser,
    verifyAuthCode,
    getProfile,
    updateProfile

};
