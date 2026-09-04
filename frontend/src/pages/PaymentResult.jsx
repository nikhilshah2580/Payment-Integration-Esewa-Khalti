import { useEffect, useState } from "react";
import {
  verifyEsewaPayment,
  verifyKhaltiPayment,
} from "../services/paymentApi";
import Failure from "./Failure";
import Success from "./Success";

const PaymentResult = () => {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const provider = params.get("pidx") ? "Khalti" : "eSewa";

      try {
        const result = params.get("pidx")
          ? await verifyKhaltiPayment(params.get("pidx"))
          : await verifyEsewaPayment(params.get("data"));
        setStatus("success");
        setMessage(result.message || `${provider} payment successful.`);
      } catch (error) {
        setStatus("failure");
        setMessage(
          error.response?.data?.message || `${provider} payment failed.`,
        );
      }
    };

    verifyPayment();
  }, []);

  if (status === "loading") {
    return (
      <main className="grid min-h-screen place-content-center justify-items-center p-6 text-center text-slate-950">
        <p className="mb-5 text-xs font-bold uppercase tracking-[1.4px] text-emerald-700">Payment status</p>
        <div className="grid size-16 place-items-center rounded-full bg-emerald-600 text-3xl font-bold text-white" aria-hidden="true">...</div>
        <h1 className="my-5 text-4xl font-semibold">Checking payment</h1>
        <p className="max-w-md text-slate-500">{message}</p>
      </main>
    );
  }

  return status === "success" ? (
    <Success message={message} />
  ) : (
    <Failure message={message} />
  );
};

export default PaymentResult;