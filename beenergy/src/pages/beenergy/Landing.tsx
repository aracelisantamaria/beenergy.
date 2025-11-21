import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gris-claro">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🐝</div>
          <h1 className="font-poppins text-2xl font-bold text-azul-marino">
            BeEnergy
          </h1>
        </div>
        <Button
          onClick={() => navigate("/connect-wallet")}
          size="lg"
          className="bg-gradient-to-r from-verde-profesional to-cyan-turquesa"
        >
          Conectar Wallet
        </Button>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="font-poppins text-5xl md:text-6xl font-bold text-azul-marino mb-6">
          Energía Verde Tokenizada <br />
          para tu Comunidad 🌞⚡
        </h2>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-10">
          Plataforma Web3 que permite a comunidades pequeñas crear, gestionar y gobernar
          instalaciones solares compartidas con transparencia total en blockchain.
        </p>
        <Button
          onClick={() => navigate("/connect-wallet")}
          size="lg"
          className="bg-verde-profesional hover:bg-verde-profesional/90 text-lg px-12 py-6 h-auto"
        >
          Comenzar Ahora
        </Button>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="hover:scale-105 transition-transform">
            <CardHeader>
              <div className="text-5xl mb-4">🤝</div>
              <CardTitle className="text-azul-marino">Compra Colectiva</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Reduce costos de instalación solar compartiendo la inversión entre 5-50 hogares.
                De $8,000-15,000 por hogar a inversión compartida.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 transition-transform">
            <CardHeader>
              <div className="text-5xl mb-4">⚡</div>
              <CardTitle className="text-azul-marino">Tokenización</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                La energía generada se convierte en $ENERGY tokens según tu % de propiedad.
                100% transparente en blockchain Stellar.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 transition-transform">
            <CardHeader>
              <div className="text-5xl mb-4">🛒</div>
              <CardTitle className="text-azul-marino">Marketplace P2P</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Compra y vende energía directamente con tus vecinos.
                Precios dinámicos, ejecución atómica, sin intermediarios.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-azul-marino text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-cyan-turquesa mb-2">100%</div>
              <div className="text-lg">On-chain Storage</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amarillo-dorado mb-2">0</div>
              <div className="text-lg">Intermediarios</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-verde-profesional mb-2">∞</div>
              <div className="text-lg">Transparencia</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} BeEnergy - Plataforma Web3 para comunidades energéticas autónomas</p>
          <p className="mt-2 text-sm">
            <a href="https://x.com/beenergycom" target="_blank" rel="noopener noreferrer" className="text-verde-profesional hover:underline">
              @BeEnergyDAO
            </a>
            {" • "}
            <a href="mailto:benenergycoomunity@gmail.com" className="text-verde-profesional hover:underline">
              Contacto
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
