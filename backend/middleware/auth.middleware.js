const jwt = require('jsonwebtoken');

const { create } = require('xmlbuilder2');

const sendAuthError = (req, res, statusCode, message) => {
    if (
        req.headers.accept?.includes('application/json') ||
        req.headers['content-type']?.includes('application/json')
    ) {
        return res.status(statusCode).json({
            status: 'error',
            message
        });
    }

    const response = create({ version: '1.0' })
        .ele('response')
            .ele('status')
                .txt('error')
            .up()
            .ele('message')
                .txt(message)
            .up()
        .up();

    res.set('Content-Type', 'application/xml');

    return res.status(statusCode).send(
        response.end({ prettyPrint: true })
    );
};

// =====================================
// AUTH TOKEN
// =====================================

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return sendAuthError(
            req,
            res,
            401,
            'Token requerido'
        );
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (err, user) => {
            if (err) {
                return sendAuthError(
                    req,
                    res,
                    403,
                    'Token invalido'
                );
            }

            req.user = user;
            next();
        }
    );
};

// =====================================
// ADMIN
// =====================================

const authorizeAdmin = (req, res, next) => {
    if (req.user.rol !== 'admin') {
        return sendAuthError(
            req,
            res,
            403,
            'Acceso denegado'
        );
    }

    next();
};

// =====================================
// EXPORTS
// =====================================

module.exports = {
    authenticateToken,
    authorizeAdmin
};
