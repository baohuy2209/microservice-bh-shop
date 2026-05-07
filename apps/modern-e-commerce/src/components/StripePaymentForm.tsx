"use client";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import React from "react";
import { useAuth } from "@clerk/nextjs";
import { ShippingFormInputs } from "@repo/types";
import useCartStore from "@/stores/cartStore";
const stripePromise = loadStripe(
  `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`,
);

function StripePaymentForm({
  shippingForm,
}: {
  shippingForm: ShippingFormInputs;
}) {
  const { cart } = useCartStore();
  const { getToken } = useAuth();
  const fetchClientSecret = React.useCallback(async () => {
    const token = await getToken();
    console.log(token);
    // Create a Checkout Session
    return fetch(
      `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/session/create-checkout-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cart),
      },
    )
      .then((res) => res.json())
      .then((data) => data.clientSecret);
  }, [cart, getToken]);
  const options = { fetchClientSecret };
  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

export default StripePaymentForm;
