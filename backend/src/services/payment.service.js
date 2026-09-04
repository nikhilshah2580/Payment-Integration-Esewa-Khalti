import crypto from "crypto";

const pendingPayments = new Map();

const getFrontendUrl = () =>
  process.env.FRONTEND_URL || "http://localhost:5173";

const getAmount = (amount) => {
  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    const error = new Error("A valid payment amount is required.");
    error.statusCode = 400;
    throw error;
  }

  return parsedAmount.toFixed(2);
};

const getEsewaConfig = () => ({
  endpoint:
    process.env.ESEWA_PAYMENT_URL ||
    "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  statusEndpoint:
    process.env.ESEWA_STATUS_URL ||
    "https://rc-epay.esewa.com.np/api/epay/transaction/status/",
  productCode: process.env.ESEWA_PRODUCT_CODE || "EPAYTEST",
  secretKey: process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q",
});

const getKhaltiConfig = () => ({
  endpoint:
    process.env.KHALTI_PAYMENT_URL ||
    "https://a.khalti.com/api/v2/epayment/initiate/",
  verificationEndpoint:
    process.env.KHALTI_VERIFICATION_URL ||
    "https://a.khalti.com/api/v2/epayment/lookup/",
  secretKey: process.env.KHALTI_SECRET_KEY,
});

const createPaymentId = () =>
  `PAY-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

const signEsewaPayload = ({ totalAmount, transactionUuid, productCode }) => {
  const { secretKey } = getEsewaConfig();
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;

  return crypto
    .createHmac("sha256", secretKey)
    .update(message)
    .digest("base64");
};

const decodeEsewaData = (data) => {
  try {
    return JSON.parse(Buffer.from(data, "base64").toString("utf8"));
  } catch {
    const error = new Error("Invalid eSewa response data.");
    error.statusCode = 400;
    throw error;
  }
};

const assertEsewaSignature = (responseData) => {
  const { secretKey } = getEsewaConfig();
  const fields = responseData.signed_field_names;

  if (!fields || !responseData.signature) {
    const error = new Error("eSewa signature data is missing.");
    error.statusCode = 400;
    throw error;
  }

  const message = fields
    .split(",")
    .map((field) => `${field}=${responseData[field] ?? ""}`)
    .join(",");
  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(message)
    .digest("base64");

  if (responseData.signature !== expectedSignature) {
    const error = new Error("Invalid eSewa payment signature.");
    error.statusCode = 400;
    throw error;
  }
};

export const initiateEsewaPaymentService = ({ amount, orderId }) => {
  const totalAmount = getAmount(amount);
  const paymentId = orderId || createPaymentId();
  const { endpoint, productCode } = getEsewaConfig();

  pendingPayments.set(paymentId, { amount: totalAmount, provider: "eSewa" });

  return {
    paymentId,
    provider: "eSewa",
    formUrl: endpoint,
    formData: {
      amount: totalAmount,
      tax_amount: "0",
      total_amount: totalAmount,
      transaction_uuid: paymentId,
      product_code: productCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${getFrontendUrl()}/payment/success`,
      failure_url: `${getFrontendUrl()}/payment/failure?paymentId=${paymentId}`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature: signEsewaPayload({
        totalAmount,
        transactionUuid: paymentId,
        productCode,
      }),
    },
  };
};

export const initiateKhaltiPaymentService = async ({
  amount,
  orderId,
  productName = "Payment",
}) => {
  const totalAmount = getAmount(amount);
  const { endpoint, secretKey } = getKhaltiConfig();

  if (!secretKey) {
    const error = new Error("Khalti secret key is not configured.");
    error.statusCode = 500;
    throw error;
  }

  const paymentId = orderId || createPaymentId();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Key ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      return_url: `${getFrontendUrl()}/payment/success`,
      website_url: getFrontendUrl(),
      amount: Math.round(Number(totalAmount) * 100),
      purchase_order_id: paymentId,
      purchase_order_name: productName,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.pidx || !data.payment_url) {
    const error = new Error(data.detail || "Khalti payment initiation failed.");
    error.statusCode = 502;
    throw error;
  }

  pendingPayments.set(data.pidx, { amount: totalAmount, provider: "Khalti" });

  return {
    paymentId,
    provider: "Khalti",
    pidx: data.pidx,
    paymentUrl: data.payment_url,
  };
};

export const verifyEsewaPaymentService = async ({ data }) => {
  if (!data) {
    const error = new Error("eSewa response data is required.");
    error.statusCode = 400;
    throw error;
  }

  const responseData = decodeEsewaData(data);
  assertEsewaSignature(responseData);
  const payment = pendingPayments.get(responseData.transaction_uuid);
  const { productCode, statusEndpoint } = getEsewaConfig();

  if (!payment || payment.provider !== "eSewa") {
    const error = new Error("eSewa payment was not found.");
    error.statusCode = 404;
    throw error;
  }

  const statusUrl = new URL(statusEndpoint);
  statusUrl.searchParams.set("product_code", productCode);
  statusUrl.searchParams.set("total_amount", responseData.total_amount);
  statusUrl.searchParams.set("transaction_uuid", responseData.transaction_uuid);
  const statusResponse = await fetch(statusUrl);
  const statusData = await statusResponse.json().catch(() => ({}));
  const isValid =
    statusResponse.ok &&
    responseData.status === "COMPLETE" &&
    statusData.status === "COMPLETE" &&
    responseData.product_code === productCode &&
    Number(responseData.total_amount) === Number(payment.amount);

  if (!isValid) {
    const error = new Error("eSewa payment verification failed.");
    error.statusCode = 400;
    throw error;
  }

  return {
    paymentId: responseData.transaction_uuid,
    provider: "eSewa",
    status: "Paid",
  };
};

export const verifyKhaltiPaymentService = async ({ pidx }) => {
  if (!pidx) {
    const error = new Error("Khalti payment identifier is required.");
    error.statusCode = 400;
    throw error;
  }

  const payment = pendingPayments.get(pidx);
  const { verificationEndpoint, secretKey } = getKhaltiConfig();
  if (!payment || payment.provider !== "Khalti") {
    const error = new Error("Khalti payment was not found.");
    error.statusCode = 404;
    throw error;
  }

  const response = await fetch(verificationEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Key ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
  });
  const data = await response.json().catch(() => ({}));
  const isValid =
    response.ok &&
    data.pidx === pidx &&
    data.status === "Completed" &&
    Number(data.total_amount) === Math.round(Number(payment.amount) * 100);

  if (!isValid) {
    const error = new Error("Khalti payment verification failed.");
    error.statusCode = 400;
    throw error;
  }

  return { paymentId: pidx, provider: "Khalti", status: "Paid" };
};
