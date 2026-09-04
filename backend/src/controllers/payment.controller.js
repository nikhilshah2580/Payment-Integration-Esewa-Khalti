import {
  initiateEsewaPaymentService,
  initiateKhaltiPaymentService,
  verifyEsewaPaymentService,
  verifyKhaltiPaymentService,
} from "../services/payment.service.js";

export const initiateEsewaPayment = (req, res) => {
  const result = initiateEsewaPaymentService(req.body);

  return res.status(201).json({
    success: true,
    message: "eSewa payment initiated successfully.",
    ...result,
  });
};

export const initiateKhaltiPayment = async (req, res) => {
  const result = await initiateKhaltiPaymentService(req.body);

  return res.status(201).json({
    success: true,
    message: "Khalti payment initiated successfully.",
    ...result,
  });
};

export const verifyEsewaPayment = async (req, res) => {
  const payment = await verifyEsewaPaymentService({ data: req.body.data });

  return res.status(200).json({
    success: true,
    message: "eSewa payment successful.",
    payment,
  });
};

export const verifyKhaltiPayment = async (req, res) => {
  const payment = await verifyKhaltiPaymentService({ pidx: req.body.pidx });

  return res.status(200).json({
    success: true,
    message: "Khalti payment successful.",
    payment,
  });
};

