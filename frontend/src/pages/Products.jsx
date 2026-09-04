import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import {
  initiateEsewaPayment,
  initiateKhaltiPayment,
} from "../services/paymentApi";
import { getProducts } from "../services/productApi";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState("");
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const productData = await getProducts();
        setProducts(productData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError("Unable to load the products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, []);

  const handleBuy = (product) => {
    setPaymentError("");
    setSelectedProduct(product);
  };

  const handlePayment = async (provider) => {
    setPaymentLoading(provider);
    setPaymentError("");

    try {
      const details = {
        amount: selectedProduct.price,
        orderId: `product-${selectedProduct.id}-${Date.now()}`,
        productName: selectedProduct.title,
      };
      const result = provider === "eSewa"
        ? await initiateEsewaPayment(details)
        : await initiateKhaltiPayment(details);

      if (provider === "eSewa") {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = result.formUrl;
        Object.entries(result.formData).forEach(([name, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = value;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      } else {
        window.location.assign(result.paymentUrl);
      }
    } catch (requestError) {
      setPaymentError(
        requestError.response?.data?.message ||
          `${provider} payment could not be started.`,
      );
      setPaymentLoading("");
    }
  };

  if (loading) {
    return <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-8 text-slate-950 sm:px-8 sm:py-12"><h2 className="text-2xl font-semibold">Loading products...</h2></main>;
  }

  if (error) {
    return <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-8 text-slate-950 sm:px-8 sm:py-12"><p className="border border-red-200 bg-red-50 p-6 text-red-800">{error}</p></main>;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-8 text-left text-slate-950 sm:px-8 sm:py-12">
      <Navbar />
      <header className="mb-9 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[1.4px] text-emerald-700">DummyJSON catalog</p>
          <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Products</h1>
        </div>
        <div className="flex gap-[18px] text-sm text-slate-500">
          <span><strong className="mr-1 text-xl text-slate-950">{products.length}</strong> products</span>
        </div>
      </header>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[18px]">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onBuy={handleBuy} />
        ))}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-10 grid place-items-center bg-slate-950/60 p-5" role="presentation">
          <section className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="payment-title">
            <button
              className="absolute right-4 top-3 cursor-pointer border-0 bg-transparent text-2xl text-slate-500"
              type="button"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close payment options"
            >
              ×
            </button>
            <p className="mb-2 text-xs font-bold uppercase tracking-[1.4px] text-emerald-700">Secure checkout</p>
            <h2 id="payment-title" className="mb-3 max-w-[340px] text-2xl font-semibold text-slate-950">Pay for {selectedProduct.title}</h2>
            <p className="text-3xl font-bold text-emerald-700">${selectedProduct.price.toFixed(2)}</p>
            <p className="my-2 mb-6 text-sm text-slate-500">Choose one of the available payment gateways.</p>
            <div className="grid gap-2.5">
              <button className="cursor-pointer rounded bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60" type="button" onClick={() => handlePayment("eSewa")} disabled={Boolean(paymentLoading)}>
                {paymentLoading === "eSewa" ? "Connecting..." : "Pay with eSewa"}
              </button>
              <button className="cursor-pointer rounded bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60" type="button" onClick={() => handlePayment("Khalti")} disabled={Boolean(paymentLoading)}>
                {paymentLoading === "Khalti" ? "Connecting..." : "Pay with Khalti"}
              </button>
            </div>
            {paymentError && <p className="mt-4 text-sm text-red-800">{paymentError}</p>}
          </section>
        </div>
      )}
    </main>
  );
};

export default Products;
