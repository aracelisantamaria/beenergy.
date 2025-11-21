import React from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../hooks/useWallet";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

const ConnectWallet: React.FC = () => {
  const navigate = useNavigate();
  const { wallet, connect, disconnect } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
      // Redirigir al dashboard después de conectar
      navigate("/dashboard");
    } catch (error) {
      console.error("Error conectando wallet:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-azul-marino to-azul-secundario flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🐝</div>
          <CardTitle className="text-3xl mb-2">BeEnergy</CardTitle>
          <CardDescription className="text-base">
            Conecta tu wallet Freighter para comenzar a gestionar tu energía solar tokenizada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!wallet.isConnected ? (
            <>
              <Button
                onClick={handleConnect}
                className="w-full bg-gradient-to-r from-verde-profesional to-cyan-turquesa text-white text-lg py-6 h-auto hover:scale-105"
                size="lg"
              >
                🔌 Conectar Freighter Wallet
              </Button>

              <div className="bg-amarillo-dorado/10 border border-amarillo-dorado/30 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>¿No tienes Freighter?</strong><br />
                  Es una extensión de navegador gratuita para interactuar con Stellar.{" "}
                  <a
                    href="https://www.freighter.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-verde-profesional hover:underline font-medium"
                  >
                    Instalar aquí
                  </a>
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-poppins font-semibold text-azul-marino">Primeros pasos:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Instala la extensión Freighter</li>
                  <li>Crea o importa una wallet</li>
                  <li>Haz clic en "Conectar Freighter Wallet"</li>
                  <li>Acepta la conexión en el popup</li>
                </ol>
              </div>
            </>
          ) : (
            <>
              <div className="bg-verde-profesional/10 border border-verde-profesional/30 rounded-lg p-4 text-center">
                <p className="text-verde-profesional font-semibold mb-2">✓ Wallet Conectada</p>
                <p className="text-xs text-gray-600 font-nunito-mono">
                  {wallet.address?.substring(0, 10)}...{wallet.address?.substring(wallet.address.length - 5)}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 bg-verde-profesional"
                  size="lg"
                >
                  Ir al Dashboard
                </Button>
                <Button
                  onClick={disconnect}
                  variant="outline"
                  size="lg"
                >
                  Desconectar
                </Button>
              </div>
            </>
          )}

          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="w-full"
          >
            ← Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectWallet;
