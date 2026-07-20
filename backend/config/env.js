const requiredEnv = [
    'SUPABASE_URL',
    'SUPABASE_KEY',
    'JWT_SECRET',
    'STRIPE_SECRET_KEY',
    'EMAIL_USER',
    'EMAIL_PASS'
];

const optionalEnv = [
    'SUPABASE_SERVICE_ROLE_KEY'
];

const getEnvStatus = () => {
    const requiredStatus = requiredEnv.map((name) => ({
        name,
        configured: Boolean(process.env[name]),
        required: true
    }));

    const optionalStatus = optionalEnv.map((name) => ({
        name,
        configured: Boolean(process.env[name]),
        required: false
    }));

    return [
        ...requiredStatus,
        ...optionalStatus
    ];
};

const assertEnv = (name, serviceName) => {
    if (!process.env[name]) {
        const error = new Error(
            `${name} no configurado para ${serviceName}`
        );

        error.statusCode = 503;
        error.code = 'ENV_MISSING';
        throw error;
    }

    return process.env[name];
};

module.exports = {
    assertEnv,
    getEnvStatus,
    optionalEnv,
    requiredEnv
};
