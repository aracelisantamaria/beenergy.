import { Routes, Route } from "react-router-dom";
import Landing from "./pages/beenergy/Landing";
import ConnectWallet from "./pages/beenergy/ConnectWallet";
import Dashboard from "./pages/beenergy/Dashboard";
import Marketplace from "./pages/beenergy/Marketplace";
import "./App.module.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/connect-wallet" element={<ConnectWallet />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/marketplace" element={<Marketplace />} />
    </Routes>
  );
}

export default App;
