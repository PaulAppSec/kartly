import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import type { Product } from "./api/client";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Home } from "./pages/Home";

export default function App() {
  // Minimal cart state for the shell; full cart/checkout arrives in Phase 2.
  const [cartCount, setCartCount] = useState(0);
  const addToCart = (_p: Product) => setCartCount((c) => c + 1);

  return (
    <>
      <Header cartCount={cartCount} />
      <Routes>
        <Route path="/" element={<Home onAdd={addToCart} />} />
        <Route path="*" element={<Home onAdd={addToCart} />} />
      </Routes>
      <Footer />
    </>
  );
}
