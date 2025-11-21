import React from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../hooks/useWallet";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const { wallet, disconnect } = useWallet();

  // Ofertas hardcodeadas para MVP
  const ofertas = [
    { id: 1, vendedor: "GACX...7YZ2", cantidad: 10, precio: 0.14, tipo: "venta" },
    { id: 2, vendedor: "GBDM...3PQR", cantidad: 25, precio: 0.13, tipo: "venta" },
    { id: 3, vendedor: "GCEF...8STU", cantidad: 15, precio: 0.15, tipo: "venta" },
    { id: 4, vendedor: "GDGH...4VWX", cantidad: 8, precio: 0.12, tipo: "venta" },
  ];

  if (!wallet.isConnected) {
    navigate("/connect-wallet");
    return null;
  }

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
          <div className="flex gap-3">
            <Button onClick={() => navigate("/dashboard")} variant="outline">
              Dashboard
            </Button>
            <Button onClick={disconnect} variant="ghost">
              Desconectar
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Título */}
        <div className="mb-8">
          <h2 className="font-poppins text-4xl font-bold text-azul-marino mb-2">
            🛒 Marketplace Comunal
          </h2>
          <p className="text-gray-600">
            Compra y vende energía directamente con tu comunidad
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-verde-profesional">58 kWh</div>
                <div className="text-sm text-gray-600 mt-1">Disponibles ahora</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-azul-marino">0.14 XLM</div>
                <div className="text-sm text-gray-600 mt-1">Precio promedio</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-turquesa">4</div>
                <div className="text-sm text-gray-600 mt-1">Ofertas activas</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ofertas */}
        <div className="space-y-4">
          <h3 className="font-poppins text-2xl font-semibold text-azul-marino mb-4">
            Ofertas Disponibles
          </h3>

          {ofertas.map((oferta) => (
            <Card key={oferta.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-4 gap-4 items-center">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Vendedor</div>
                    <div className="font-nunito-mono text-sm font-semibold">
                      {oferta.vendedor}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Cantidad</div>
                    <div className="text-2xl font-bold text-verde-profesional">
                      {oferta.cantidad} kWh
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Precio</div>
                    <div className="text-2xl font-bold text-azul-marino">
                      {oferta.precio} XLM/kWh
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-verde-profesional hover:bg-verde-profesional/90"
                      onClick={() => alert(`Comprando ${oferta.cantidad} kWh a ${oferta.precio} XLM/kWh`)}
                    >
                      COMPRAR
                    </Button>
                    <Button variant="outline" className="flex-1">
                      VER DETALLES
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Vender Energía */}
        <Card className="mt-8 bg-gradient-to-br from-amarillo-dorado/20 to-verde-profesional/20 border-verde-profesional/30">
          <CardHeader>
            <CardTitle className="text-azul-marino">¿Quieres vender tu energía?</CardTitle>
            <CardDescription>
              Crea tu propia oferta y establece tu precio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              className="bg-verde-profesional hover:bg-verde-profesional/90"
              onClick={() => alert("Funcionalidad de venta próximamente")}
            >
              CREAR OFERTA DE VENTA
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Marketplace;
