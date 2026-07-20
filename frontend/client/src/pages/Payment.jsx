import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookingSteps from "../components/BookingSteps";

import {
    CardCvcElement,
    CardExpiryElement,
    CardNumberElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";

import { useParams, useNavigate } from "react-router-dom";

import { useState } from "react";

import {
    confirmPayment,
    createPaymentIntent
} from "../services/paymentService";

import "./Payment.css";

const Payment = () => {

    const { reservationId } = useParams();

    const stripe = useStripe();

    const elements = useElements();

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [paymentError, setPaymentError] = useState("");

    const [billingDetails, setBillingDetails] = useState({
        name: "",
        address: "",
        city: "",
        postalCode: ""
    });

    const reservationData = JSON.parse(
        localStorage.getItem("reservationData") || "{}"
    );

    const transportData = JSON.parse(
        localStorage.getItem("transportData") || "{}"
    );

    const hotelData = JSON.parse(
        localStorage.getItem("hotelData") || "{}"
    );

    const calculatedBaseTotal =
        Number(reservationData?.precio || 0) *
        Number(reservationData?.cantidad_personas || 1) *
        Number(reservationData?.dias || 1);

    const calculatedTransportTotal =
        Number(transportData?.precio || 0) *
        Number(transportData?.cantidad || reservationData?.cantidad_personas || 1);

    const calculatedHotelTotal =
        Number(hotelData?.precio_por_noche || 0) *
        Number(reservationData?.dias || 1);

    const baseTotal =
        Number(reservationData?.precio_tour || 0) > 0
            ? Number(reservationData.precio_tour)
            : calculatedBaseTotal;

    const transportTotal =
        Number(reservationData?.precio_transporte || 0) > 0
            ? Number(reservationData.precio_transporte)
            : calculatedTransportTotal;

    const hotelTotal =
        Number(reservationData?.precio_hotel || 0) > 0
            ? Number(reservationData.precio_hotel)
            : calculatedHotelTotal;

    const estimatedTotal =
        baseTotal + transportTotal + hotelTotal;
    const reservationImage =
        reservationData?.imagen ||
        reservationData?.image ||
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop";
    const stripeElementOptions = {
        style: {
            base: {
                color: "#1a1c1c",
                fontFamily: "Inter, Segoe UI, Arial, sans-serif",
                fontSize: "15px",
                fontWeight: "700",
                "::placeholder": {
                    color: "#8b91a1"
                }
            },
            invalid: {
                color: "#b91c1c"
            }
        }
    };

    const handleBillingChange = (event) => {
        setBillingDetails({
            ...billingDetails,
            [event.target.name]: event.target.value
        });
    };

    const getFriendlyStripeError = (message = "") => {
        if (
            message.includes("No such payment_intent") ||
            message.includes("client_secret") ||
            message.includes("publishable key") ||
            message.includes("Invalid API Key")
        ) {
            return "Stripe esta usando una clave publica invalida o antigua. Reinicia el servidor frontend para que lea el VITE_STRIPE_PUBLIC_KEY actual y verifica que el pk_test sea de la misma cuenta que el sk_test del backend.";
        }

        return message
            ? `Pago no aprobado: ${message}`
            : "Pago no aprobado por Stripe. La reserva sigue pendiente para que puedas reintentar.";
    };

    const handlePayment = async () => {

        try {

            setLoading(true);
            setPaymentError("");

            const data =
                await createPaymentIntent(
                    reservationId
                );

            const clientSecret =
                data.client_secret;

            const result =
                await stripe.confirmCardPayment(
                    clientSecret,
                    {
                        payment_method: {
                            card:
                                elements.getElement(
                                    CardNumberElement
                                ),
                            billing_details: {
                                name:
                                    billingDetails.name ||
                                    undefined,
                                address: {
                                    line1:
                                        billingDetails.address ||
                                        undefined,
                                    city:
                                        billingDetails.city ||
                                        undefined,
                                    postal_code:
                                        billingDetails.postalCode ||
                                        undefined,
                                    country: "PE"
                                }
                            }
                        }
                    }
                );

            if (result.error) {

                const friendlyMessage =
                    getFriendlyStripeError(result.error.message);

                setPaymentError(friendlyMessage);

                alert(friendlyMessage);

                return;

            }

            if (result.paymentIntent.status === "succeeded") {

                const confirmResponse =
                    await confirmPayment(reservationId);

                alert(
                    confirmResponse?.message ||
                    "Pago realizado correctamente"
                );

                navigate(
                    `/confirm?reservation=${reservationId}&notification=${confirmResponse?.notification || "sent"}`
                );

            }

            if (result.paymentIntent.status !== "succeeded") {

                const friendlyMessage =
                    `Stripe dejo el pago en estado ${result.paymentIntent.status}. La reserva sigue pendiente para reintentar.`;

                setPaymentError(
                    friendlyMessage
                );

                alert(
                    friendlyMessage
                );

            }

        } catch (error) {
            const backendMessage =
                error.response?.data?.message ||
                "";

            if (
                backendMessage.includes("schema cache") ||
                backendMessage.includes("moneda")
            ) {
                const friendlyMessage =
                    "La tabla de pagos necesita actualizarse en Supabase. Ejecuta el script SQL de upgrade o reinicia el backend para usar la compatibilidad temporal."

                setPaymentError(friendlyMessage);

                alert(friendlyMessage);

                return;
            }

            setPaymentError(
                backendMessage ||
                "No se pudo procesar el pago. Intenta nuevamente."
            );

            alert(
                backendMessage ||
                "No se pudo procesar el pago. Intenta nuevamente."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <>

            <Navbar />

            <div className="payment-page">

                <div className="payment-shell">

                    <BookingSteps current="payment" />

                    <div className="payment-layout">

                        <section className="payment-card">

                            <p className="eyebrow">
                                Checkout seguro
                            </p>

                            <h1>
                                Secure Payment
                            </h1>

                            <p>
                                Choose your payment method and enter your details below. Reserva #{reservationId}.
                            </p>

                            {paymentError && (
                                <div className="payment-alert" role="alert">
                                    <span className="material-symbols-outlined">
                                        error
                                    </span>
                                    <p>
                                        {paymentError}
                                    </p>
                                </div>
                            )}

                            <div className="payment-methods">
                                {[
                                    ["credit_card", "Visa", "Credito y debito"],
                                    ["payments", "Mastercard", "Tarjeta bancaria"],
                                    ["card_membership", "Amex", "Pago internacional"],
                                    ["account_balance", "Debit", "Cuenta asociada"]
                                ].map(([icon, brand, label], index) => (
                                    <button
                                        type="button"
                                        key={brand}
                                        className={index === 0 ? "active" : ""}
                                    >
                                        <span className="material-symbols-outlined">
                                            {icon}
                                        </span>
                                        <strong>
                                            {brand}
                                        </strong>
                                        <span>
                                            {label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="billing-grid">
                                <label className="billing-wide stripe-field">
                                    Card Number
                                    <span className="stripe-input">
                                        <CardNumberElement options={stripeElementOptions} />
                                    </span>
                                </label>

                                <label className="billing-wide">
                                    Cardholder Name
                                    <input
                                        name="name"
                                        type="text"
                                        placeholder="Johnathan Doe"
                                        value={billingDetails.name}
                                        onChange={handleBillingChange}
                                    />
                                </label>

                                <label className="stripe-field">
                                    Expiry Date
                                    <span className="stripe-input">
                                        <CardExpiryElement options={stripeElementOptions} />
                                    </span>
                                </label>

                                <label className="stripe-field">
                                    CVV
                                    <span className="stripe-input">
                                        <CardCvcElement options={stripeElementOptions} />
                                    </span>
                                </label>

                                <label className="billing-wide">
                                    Billing Address
                                    <input
                                        name="address"
                                        type="text"
                                        placeholder="Street Address"
                                        value={billingDetails.address}
                                        onChange={handleBillingChange}
                                    />
                                </label>

                                <label>
                                    City
                                    <input
                                        name="city"
                                        type="text"
                                        placeholder="City"
                                        value={billingDetails.city}
                                        onChange={handleBillingChange}
                                    />
                                </label>

                                <label>
                                    Postal Code
                                    <input
                                        name="postalCode"
                                        type="text"
                                        placeholder="Postal Code"
                                        value={billingDetails.postalCode}
                                        onChange={handleBillingChange}
                                    />
                                </label>
                            </div>

                            <div className="payment-security">
                                <strong>
                                    <span className="material-symbols-outlined">
                                        shield
                                    </span>
                                    Pago protegido
                                </strong>
                                <span>
                                    <span className="material-symbols-outlined">
                                        lock
                                    </span>
                                    SSL encriptado
                                </span>
                            </div>

                            <button
                                className="pay-btn"
                                onClick={handlePayment}
                                disabled={loading || !stripe || !elements}
                            >

                                {loading
                                    ? "Procesando pago..."
                                    : (
                                        <>
                                            <span className="material-symbols-outlined">
                                                payments
                                            </span>
                                            Confirmar y pagar
                                        </>
                                    )}

                            </button>

                            <p className="payment-terms">
                                Al pagar aceptas las politicas de reserva, cancelacion y confirmacion por correo.
                            </p>

                        </section>

                        <aside className="payment-summary panel">
                            <p className="eyebrow">
                                Resumen
                            </p>

                            <h2>
                                Booking Summary
                            </h2>

                            <div className="payment-trip">
                                <img
                                    src={reservationImage}
                                    alt={reservationData?.titulo || reservationData?.nombre || "Reserva"}
                                />
                                <div>
                                    <strong>
                                        {reservationData?.titulo || reservationData?.nombre || "Reserva turistica"}
                                    </strong>
                                    <span>
                                        {reservationData?.destino || "Destino seleccionado"} - {reservationData?.cantidad_personas || 1} viajero(s)
                                    </span>
                                </div>
                            </div>

                            <div className="payment-row">
                                <span>
                                    Tour
                                </span>
                                <strong>
                                    S/ {baseTotal.toFixed(2)}
                                </strong>
                            </div>

                            <div className="payment-row">
                                <span>
                                    Transporte
                                </span>
                                <strong>
                                    S/ {transportTotal.toFixed(2)}
                                </strong>
                            </div>

                            <div className="payment-row">
                                <span>
                                    Hotel
                                </span>
                                <strong>
                                    S/ {hotelTotal.toFixed(2)}
                                </strong>
                            </div>

                            <div className="payment-total">
                                <span>
                                    Total estimado
                                </span>
                                <strong>
                                    S/ {estimatedTotal.toFixed(2)}
                                </strong>
                            </div>

                            <small>
                                El cargo final lo calcula el servicio de reservas antes de confirmar el pago.
                            </small>
                        </aside>

                    </div>

                </div>

            </div>

            <Footer />

        </>

    );

};

export default Payment;
