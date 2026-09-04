import axios from "axios";

const productApi = axios.create({
  baseURL: import.meta.env.VITE_PRODUCT_API,
});

export const getProducts = async () => {
  const response = await productApi.get("/products");
  return response.data.products;
};
