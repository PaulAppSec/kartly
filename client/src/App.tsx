import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { CartDrawer } from "./components/CartDrawer";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Account } from "./pages/Account";
import { Checkout } from "./pages/Checkout";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { ProductDetail } from "./pages/ProductDetail";
import { Register } from "./pages/Register";
import { ResetPassword } from "./pages/ResetPassword";
import { SellerDashboard } from "./pages/SellerDashboard";

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const openCart = () => setCartOpen(true);

  return (
    <>
      <Header onOpenCart={openCart} />
      <Routes>
        <Route path="/" element={<Home onOpenCart={openCart} />} />
        <Route path="/product/:id" element={<ProductDetail onOpenCart={openCart} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/account" element={<Account />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="*" element={<Home onOpenCart={openCart} />} />
      </Routes>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
