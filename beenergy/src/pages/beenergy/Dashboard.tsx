import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../hooks/useWallet";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { wallet, disconnect } = useWallet();
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Datos hardcodeados para MVP
  const balanceEnergy = 125.5;
  const priceXLM = 0.15;
  const kwhAcumulados = 450.2;
  const consumoMes = 78.3;

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  if (!wallet.isConnected) {
    navigate("/connect-wallet");
    return null;
  }

  const shortAddress = wallet.address
    ? `${wallet.address.substring(0, 10)}...${wallet.address.substring(wallet.address.length - 5)}`
    : "";

  return (
    <div className="min-h-screen bg-gris-claro">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🐝</div>
            <h1 className="font-poppins text-xl font-bold text-azul-marino">
              BeEnergy
            </h1>
          </div>
          <Button onClick={disconnect} variant="outline">
            Desconectar
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Saludo */}
        <div>
          <h2 className="font-poppins text-3xl font-bold text-azul-marino mb-2">
            ¡HOLA, {shortAddress}! 👋
          </h2>
          <div className="flex items-center gap-2">
            <code className="font-nunito-mono text-sm bg-gray-100 px-3 py-1 rounded">
              {shortAddress}
            </code>
            <Button
              onClick={copyAddress}
              variant="ghost"
              size="sm"
              className="h-8"
            >
              {copiedAddress ? "✓ Copiado" : "📋 Copiar"}
            </Button>
          </div>
        </div>

        {/* Balance Section */}
        <Card className="bg-gradient-to-br from-verde-profesional to-cyan-turquesa text-white border-none">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-3xl">⚡</span>
              Balance de $ENERGY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold mb-2">{balanceEnergy} kWh</div>
            <div className="text-white/80">
              Precio actual: {priceXLM} XLM/kWh
            </div>
            <Button
              variant="outline"
              className="mt-4 border-white text-white hover:bg-white hover:text-verde-profesional"
            >
              VER DETALLES
            </Button>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* KWH Acumulados */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Stock KWH Acumulados</CardTitle>
              <CardDescription>Tu reserva de energía generada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-verde-profesional mb-4">
                {kwhAcumulados} kWh
              </div>
              <div className="h-32 bg-gradient-to-r from-verde-profesional/20 to-cyan-turquesa/20 rounded-lg flex items-end justify-around p-4">
                {/* Simulación de gráfico de barras */}
                {[40, 60, 55, 70, 85, 75, 90].map((height, i) => (
                  <div
                    key={i}
                    className="bg-verde-profesional rounded-t w-8"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">Últimos 7 días</p>
            </CardContent>
          </Card>

          {/* Consumo */}
          <Card>
            <CardHeader>
              <CardTitle>⚡ Consumo Este Mes</CardTitle>
              <CardDescription>Tu consumo de energía</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-azul-marino mb-4">
                {consumoMes} kWh
              </div>
              <div className="h-32 bg-gradient-to-r from-azul-marino/20 to-azul-secundario/20 rounded-lg flex items-end justify-around p-4">
                {/* Simulación de gráfico de barras */}
                {[30, 45, 60, 50, 75, 55, 80].map((height, i) => (
                  <div
                    key={i}
                    className="bg-azul-marino rounded-t w-8"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">Últimos 7 días</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Links */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-20 flex flex-col gap-2"
            disabled
          >
            <span className="text-2xl">📊</span>
            <span className="text-sm">Histórico de Consumos</span>
            <span className="text-xs text-gray-500">(Próximamente)</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col gap-2"
            disabled
          >
            <span className="text-2xl">💳</span>
            <span className="text-sm">Histórico de Transacciones</span>
            <span className="text-xs text-gray-500">(Próximamente)</span>
          </Button>

          <Button
            onClick={() => navigate("/marketplace")}
            className="h-20 flex flex-col gap-2 bg-verde-profesional hover:bg-verde-profesional/90"
          >
            <span className="text-2xl">🛒</span>
            <span className="text-sm">IR AL MARKETPLACE</span>
          </Button>
        </div>

        {/* Notificaciones */}
        <Card className="bg-cyan-turquesa/10 border-cyan-turquesa/30">
          <CardContent className="p-4">
            <p className="text-sm">
              <span className="text-verde-profesional font-semibold">✓ Nueva oferta en marketplace</span>
              {" - "}
              10 kWh disponibles a 0.14 XLM/kWh
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
