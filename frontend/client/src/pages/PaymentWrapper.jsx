import { Elements } from "@stripe/react-stripe-js";

import { loadStripe } from "@stripe/stripe-js";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Payment from "./Payment";

const stripePublicKey =
    import.meta.env.VITE_STRIPE_PUBLIC_KEY;

const stripePromise =
    stripePublicKey
        ? loadStripe(stripePublicKey)
        : null;

const PaymentWrapper = () => {
    if (!stripePromise) {
        return (
            <>
                <Navbar />

                <div className="payment-page">
                    <div className="payment-shell">
                        <div className="empty-state panel">
                            Stripe no esta configurado. Agrega VITE_STRIPE_PUBLIC_KEY en frontend/client/.env para habilitar pagos.
                        </div>
                    </div>
                </div>

                <Footer />
            </>
        );
    }

    return (

        <Elements stripe={stripePromise}>

            <Payment />

        </Elements>

    );

};

export default PaymentWrapper;
