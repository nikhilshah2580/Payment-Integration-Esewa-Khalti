import Products from "./pages/Products";
import PaymentResult from "./pages/PaymentResult";

function App() {
  return window.location.pathname.startsWith("/payment/") ? (
    <PaymentResult />
  ) : (
    <Products />
  );
}

export default App;
