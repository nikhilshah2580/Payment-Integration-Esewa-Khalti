import express from "express";
import {
  initiateEsewaPayment,
  initiateKhaltiPayment,
  verifyEsewaPayment,
  verifyKhaltiPayment,
} from "../controllers/payment.controller.js";

const paymentRoutes = express.Router();

paymentRoutes.post("/esewa/initiate", initiateEsewaPayment);
paymentRoutes.post("/esewa/verify", verifyEsewaPayment);
paymentRoutes.post("/khalti/initiate", initiateKhaltiPayment);
paymentRoutes.post("/khalti/verify", verifyKhaltiPayment);

export default paymentRoutes;