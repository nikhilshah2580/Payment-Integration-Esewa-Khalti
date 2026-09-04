import axios from "axios";

const paymentApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:9000/api",
});

export const initiateEsewaPayment = async ({ amount, orderId, productName }) => {
  const response = await paymentApi.post("/payment/esewa/initiate", {
    amount,
    orderId,
    productName,
  });
  return response.data;
};

export const initiateKhaltiPayment = async ({ amount, orderId, productName }) => {
  const response = await paymentApi.post("/payment/khalti/initiate", {
    amount,
    orderId,
    productName,
  });
  return response.data;
};

export const verifyEsewaPayment = async (data) => {
  const response = await paymentApi.post("/payment/esewa/verify", { data });
  return response.data;
};

export const verifyKhaltiPayment = async (pidx) => {
  const response = await paymentApi.post("/payment/khalti/verify", { pidx });
  return response.data;
};