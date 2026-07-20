const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const { getEnvStatus } = require('./config/env');

const authRoutes = require('./services/auth-service/auth.routes');
const tourRoutes = require('./services/tour-service/tour.routes');
const reservationRoutes = require('./services/reservation-service/reservation.routes');
const hotelRoutes = require('./services/hotel-service/hotel.routes');
const flightRoutes = require('./services/flight-service/flight.routes');
const travelerRoutes = require('./services/traveler-service/traveler.routes');
const paymentRoutes = require('./services/payment-service/payment.routes');
const notificationRoutes = require('./services/notification-service/notification.routes');

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.text({ type: 'application/xml' }));

app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/travelers', travelerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/openapi.yaml', (req, res) => {
    res.sendFile(
        path.join(__dirname, '..', 'docs', 'openapi.yaml')
    );
});

app.get('/api/contracts/notification-service.wsdl', (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            '..',
            'docs',
            'contracts',
            'notification-service.wsdl'
        )
    );
});

app.get('/api/contracts/reservation-email.xsd', (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            '..',
            'docs',
            'contracts',
            'reservation-email.xsd'
        )
    );
});

app.get('/api/health', (req, res) => {
    const envStatus = getEnvStatus();
    const requiredEnvStatus = envStatus.filter(
        (item) => item.required !== false
    );

    const configured = requiredEnvStatus.filter(
        (item) => item.configured
    ).length;

    res.json({
        status:
            configured === requiredEnvStatus.length
                ? 'up'
                : 'degraded',
        service: 'agencia-tours-gateway',
        architecture: 'SOA',
        env: envStatus,
        services: [
            'auth-service',
            'tour-service',
            'reservation-service',
            'traveler-service',
            'payment-service',
            'notification-service',
            'audit-service'
        ]
    });
});

app.get('/', (req, res) => {

    res.send('SOA Travel System Running');

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});
