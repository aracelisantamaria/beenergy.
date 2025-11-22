# ⚡ BeEnergy - Energía Verde Tokenizada

<div align="center">

**Plataforma cooperativa de energía renovable tokenizada en Stellar**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![Stellar](https://img.shields.io/badge/Stellar-SDK%2014.2-blue)](https://stellar.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-v0.4.1-green)](https://openzeppelin.com)
[![DeFindex](https://img.shields.io/badge/DeFindex-Integrated-purple)](https://defindex.io/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Funcionalidades](#-funcionalidades)
- [API Endpoints](#-api-endpoints)
- [Scripts](#-scripts)
- [Deployment](#-deployment)
- [Equipo](#-equipo)

---

## 🌟 Descripción

**BeEnergy** es una plataforma Web3 que permite a comunidades pequeñas crear, gestionar y gobernar instalaciones solares compartidas de forma completamente transparente mediante blockchain Stellar.

### Los usuarios pueden:

- 🏭 **Generar** energía renovable tokenizada (kWh en blockchain)
- 💱 **Comercializar** energía excedente en un marketplace P2P
- 📊 **Gestionar** producción y consumo en tiempo real
- 💰 **Generar rendimientos** automáticos con DeFi (DeFindex)
- 🔒 **Privacidad** mediante Zero-Knowledge Proofs para rankings

La plataforma utiliza **Stellar blockchain** para tokenizar kWh de energía como **HDROP tokens** y **contratos inteligentes Soroban** para gestionar transacciones peer-to-peer.

---

## ✨ Características

### 🔗 Blockchain & Web3
- ✅ Integración completa con **Stellar Network**
- ✅ Tokenización de kWh como **HDROP tokens**
- ✅ Soporte para múltiples wallets (Freighter, Albedo, xBull)
- ✅ Contratos inteligentes en **Soroban**
- ✅ Trading en **Stellar DEX**
- ✅ **Multi-sig wallet** comunitaria

### 💹 DeFi & Rendimientos
- ✅ Integración con **DeFindex** para yield farming
- ✅ Generación de **intereses diarios** automáticos (APY ~5.2%)
- ✅ Vaults de stablecoins para maximizar retornos
- ✅ Dashboard con estadísticas en tiempo real
- ✅ API backend completa para DeFindex

### 🎨 Interfaz de Usuario
- ✅ Dashboard interactivo con gráficos (Recharts)
- ✅ Modo claro/oscuro con persistencia
- ✅ Diseño responsive (mobile-first)
- ✅ Componentes accesibles (Radix UI)
- ✅ Animaciones fluidas (Tailwind Animate)
- ✅ Multi-idioma (ES/EN)

### 🏆 Gamificación & Social
- ✅ **Ranking comunitario** de ahorro energético
- ✅ Sistema de **hojas 🍃** (1-5) según eficiencia
- ✅ **Zero-Knowledge Proofs** para privacidad
- ✅ Nombres parcialmente ocultos (ej: "M***a G****z")
- ✅ Avatares generados por hash de dirección

### 📊 Análisis & Reportes
- ✅ Gráficos de consumo mensual (barras)
- ✅ Gráficos de kWh disponibles (área)
- ✅ Distribución energética (torta)
- ✅ Historial completo de transacciones
- ✅ Marketplace de ofertas P2P

---

## 🛠️ Tecnologías

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 16.0.3 | Framework React con SSR/API Routes |
| **React** | 19.2.0 | Biblioteca UI |
| **TypeScript** | 5.x | Tipado estático |
| **Tailwind CSS** | 4.1.9 | Estilos utility-first |
| **Radix UI** | Latest | Componentes accesibles (25+) |
| **Recharts** | Latest | Gráficos y visualizaciones |
| **Lucide React** | 0.454.0 | Iconos |

### Backend & API
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js API Routes** | 16.0.3 | Backend serverless |
| **Stellar SDK** | 14.2.0 | Integración con Stellar |
| **DeFindex SDK** | 0.1.1 | Yield farming automático |
| **Soroban** | Latest | Smart contracts (Rust) |

### Blockchain
- **Stellar Testnet/Mainnet** - Red blockchain
- **Soroban Smart Contracts** - energy_token, energy_distribution, community_governance
- **OpenZeppelin Stellar** ^0.4.1 - Token estándar SEP-41
- **Stellar DEX** - Trading P2P nativo
- **Multi-sig Accounts** - Wallet comunitaria

### Herramientas
- **Vite** 7.1.11 - Build tool
- **ESLint** 9.36.0 - Linting
- **Prettier** 3.6.2 - Formateo
- **Husky** 9.1.7 - Git hooks
- **React Hook Form** - Formularios
- **Zod** - Validación de esquemas

---

## 🏗️ Arquitectura

### Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                     USUARIO (Browser)                       │
│                  (Freighter Wallet)                         │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────▼───────────┐
        │   Next.js Frontend    │
        │   (React Components)  │
        │   • Dashboard         │
        │   • Marketplace       │
        │   • Activity          │
        │   • Profile           │
        └───────────┬───────────┘
                    │
        ┌───────────▼───────────────────────────────────┐
        │         API Routes (Next.js Backend)          │
        │  /api/defindex/*  |  Custom endpoints         │
        └───────────┬───────────────────────────────────┘
                    │
        ┌───────────┴──────────┐
        │                      │
┌───────▼──────────┐   ┌───────▼─────────┐
│  DeFindex SDK    │   │  Stellar SDK    │
│  (lib/defindex-  │   │  (Blockchain)   │
│   service.ts)    │   │                 │
└───────┬──────────┘   └────────┬────────┘
        │                       │
┌───────▼──────────┐   ┌────────▼──────────┐
│  DeFindex API    │   │  Stellar Network  │
│  (Soroban Vaults)│   │  • Testnet        │
│  • APY Stats     │   │  • Mainnet        │
│  • Deposits      │   │  • Smart Contracts│
│  • Withdrawals   │   │  • DEX Trading    │
└──────────────────┘   └───────────────────┘
                │
        ┌───────▼──────────┐
        │    Supabase      │
        │  (Database/Auth) │
        └──────────────────┘
```

### Flujo de Datos

1. **Usuario conecta wallet** → Freighter/Albedo/xBull
2. **Frontend** → Solicita datos al API Next.js
3. **API Routes** → Procesa y llama a servicios (DeFindex, Stellar)
4. **DeFindex Service** → Obtiene APY, genera transacciones
5. **Stellar SDK** → Ejecuta transacciones en blockchain
6. **Frontend** → Actualiza UI con datos en tiempo real

---

## 🚀 Instalación

### Prerrequisitos

```bash
Node.js >= 18.x
npm >= 9.x
Git
Wallet Stellar (Freighter recomendado)
```

### Paso 1: Clonar Repositorio

```bash
git clone https://github.com/tu-usuario/beenergy.git
cd beenergy
```

### Paso 2: Instalar Dependencias

```bash
npm install --legacy-peer-deps
```

> **Nota:** Se usa `--legacy-peer-deps` debido a conflictos de peer dependencies entre React 19 y algunas librerías.

### Paso 3: Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones (ver [Configuración](#-configuración)).

### Paso 4: Iniciar Servidor de Desarrollo

```bash
npm run dev
```

Aplicación disponible en: `http://localhost:3000`

---

## ⚙️ Configuración

### Variables de Entorno Esenciales

```env
# Stellar Network
STELLAR_SCAFFOLD_ENV=development
PUBLIC_STELLAR_NETWORK="TESTNET"
PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
PUBLIC_STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
PUBLIC_STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"

# DeFindex (Para yield farming)
DEFINDEX_API_KEY="sk_your_api_key_here"
DEFINDEX_BASE_URL="https://api.defindex.io"
NEXT_PUBLIC_DEFINDEX_VAULT_ADDRESS="VAULT_ADDRESS_HERE"

```

### Obtener DeFindex API Key

1. Visita [DeFindex.io](https://defindex.io)
2. Regístrate y obtén API key
3. Encuentra dirección del vault USDC
4. Actualiza variables en `.env`

Ver: [DEFINDEX_INTEGRATION.md](DEFINDEX_INTEGRATION.md)

---

## 📁 Estructura del Proyecto

```
beenergy/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (Backend)
│   │   └── defindex/            # Endpoints DeFindex
│   │       ├── health/          # GET - Health check
│   │       ├── stats/           # GET - User statistics
│   │       ├── vault/           # GET - Vault info
│   │       ├── deposit/         # POST - Generate deposit tx
│   │       └── withdraw/        # POST - Generate withdraw tx
│   ├── dashboard/               # Dashboard principal
│   ├── marketplace/             # Marketplace P2P
│   ├── activity/                # Historial transacciones
│   ├── consumption/             # Consumo energético
│   ├── profile/                 # Perfil de usuario
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── globals.css             # Estilos globales
│
├── components/                  # Componentes React
│   ├── ui/                     # UI primitives (shadcn)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── sidebar.tsx             # Sidebar de navegación
│   ├── dashboard-header.tsx    # Header del dashboard
│   ├── balance-display.tsx     # Componente de balance
│   └── ...
│
├── hooks/                       # Custom React hooks
│   ├── useDefindex.ts          # Hook DeFindex integration
│   ├── useWallet.ts            # Hook wallet management
│   └── ...
│
├── lib/                         # Utilidades & Servicios
│   ├── defindex-service.ts     # DeFindex backend logic
│   ├── wallet-context.tsx      # Wallet context provider
│   ├── i18n-context.tsx        # Internacionalización
│   ├── mock-data.ts            # Datos mock para demo
│   └── utils.ts                # Helper functions
│
├── contracts/                   # Soroban Smart Contracts
│   ├── energy_token/           # Token HDROP (SEP-41)
│   ├── energy_distribution/    # Distribución automática
│   ├── energy_marketplace/     # Marketplace P2P
│   └── zk_verifier/           # ZK proof verifier
│
├── public/                      # Assets estáticos
│   ├── logo.png
│   ├── favicon.ico
│   └── ...
│
├── .env.example                # Plantilla env vars
├── package.json                # Dependencies (~80)
├── next.config.mjs             # Next.js config
├── tailwind.config.js          # Tailwind config
├── tsconfig.json               # TypeScript config
├── DEFINDEX_INTEGRATION.md     # Docs DeFindex
└── README.md                   # Este archivo
```

---

## 🎯 Funcionalidades

### 1️⃣ Dashboard Principal (`/dashboard`)

**Componentes:**
- 💰 **Balance Card**
  - Balance HDROP + USD
  - Sección DeFindex con APY
  - Intereses diarios/mensuales

- ⚡ **kWh Disponibles**
  - Gráfico de área (7 días)
  - Total disponible

- 📊 **Consumo Mensual**
  - Gráfico de barras (7 días)
  - Total consumido

- 🥧 **Distribución Energética**
  - Gráfico de torta
  - Generado vs Consumido
  - Barra de eficiencia

- 🏆 **Ranking Comunitario**
  - Top 8 usuarios
  - Sistema de hojas 🍃
  - ZK Proofs para privacidad
  - Nombres parcialmente ocultos

### 2️⃣ Marketplace P2P (`/marketplace`)

- 🔍 Ver ofertas de energía
- 💵 Precios en XLM
- ✅ Comprar energía directamente
- 📤 Publicar ofertas de venta
- 🔄 Transacciones en Stellar DEX

### 3️⃣ Historial de Actividad (`/activity`)

- 📜 Últimas compras y ventas
- 🔎 Filtros por mes/año
- 📊 Resumen de transacciones
- 💸 Totales acumulados

### 4️⃣ Consumo Energético (`/consumption`)

- 📈 Historial completo de consumo
- 🗓️ Desglose por mes
- 📊 Total de kWh consumidos
- 📉 Tendencias de uso

### 5️⃣ Perfil de Usuario (`/profile`)

- 👤 Avatar personalizado
- 📝 Editar nombre
- 🔑 Dirección de wallet
- 💾 Guardar cambios en Supabase

---

## 🔌 API Endpoints

### DeFindex API

#### Health Check
```http
GET /api/defindex/health

Response:
{
  "success": true,
  "healthy": true,
  "message": "DeFindex API is operational"
}
```

#### User Statistics
```http
GET /api/defindex/stats/[vaultAddress]/[userAddress]

Response:
{
  "success": true,
  "data": {
    "balance": 520,
    "apy": 5.2,
    "interestToday": 0.074,
    "interestThisMonth": 2.21
  }
}
```

#### Vault Information
```http
GET /api/defindex/vault/[address]

Response:
{
  "success": true,
  "data": {
    "address": "VAULT_...",
    "name": "USDC Yield Vault",
    "symbol": "yvUSDC",
    "totalAssets": 1000000,
    "apy": 5.2
  }
}
```

#### Deposit Funds
```http
POST /api/defindex/deposit
Content-Type: application/json

Body:
{
  "vaultAddress": "VAULT_ADDRESS",
  "amount": 100,
  "userAddress": "USER_PUBLIC_KEY"
}

Response:
{
  "success": true,
  "data": {
    "transaction": "TRANSACTION_XDR",
    "message": "Please sign with your wallet"
  }
}
```

#### Withdraw Funds
```http
POST /api/defindex/withdraw
Content-Type: application/json

Body:
{
  "vaultAddress": "VAULT_ADDRESS",
  "amount": 50,
  "userAddress": "USER_PUBLIC_KEY"
}
```

Ver documentación completa: [DEFINDEX_INTEGRATION.md](DEFINDEX_INTEGRATION.md)

---

## 📜 Scripts

### Desarrollo

```bash
# Servidor de desarrollo
npm run dev

# Con watch de contratos
npm run dev:full

# Build para producción
npm run build

# Servidor de producción
npm run preview
```

### Contratos Soroban

```bash
# Compilar contratos
npm run build:contracts

# Instalar dependencias de contratos
npm run install:contracts
```

### Calidad de Código

```bash
# Linting
npm run lint

# Formateo automático
npm run format
```

---

## 🌐 Deployment

### Build Manual

```bash
npm run build
npm run preview
```
---

## 📊 Dependencias Principales

### Producción (22 core + UI)
- `next` 16.0.3 - Framework
- `react` 19.2.0 - UI
- `@stellar/stellar-sdk` 14.2.0 - Blockchain
- `@defindex/sdk` 0.1.1 - DeFi yield ⭐
- `@supabase/supabase-js` 2.84.0 - DB
- `recharts` - Gráficos
- `@radix-ui/*` (25+ componentes) - UI
- `tailwindcss` 4.1.9 - Styles
- `lucide-react` - Iconos
- `react-hook-form` + `zod` - Forms

### Dev Tools
- `typescript` 5.x
- `eslint` + `prettier`
- `husky` - Git hooks
- `vite` 7.1.11
---

## 🎨 Diseño

### Paleta de Colores

```css
--primary: rgb(3, 0, 171);      /* Azul energético */
--success: rgb(5, 150, 105);    /* Verde renovable */
--accent: rgb(141, 232, 242);   /* Celeste */
--warning: rgb(234, 179, 8);    /* Amarillo */
```

### Breakpoints Responsive

```css
sm: 640px   /* Mobile */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Wide */
2xl: 1536px /* Ultra wide */
```

---

## 📚 Documentación Adicional

- [DEFINDEX_INTEGRATION.md](DEFINDEX_INTEGRATION.md) - Integración DeFindex completa
- [ZK_PRIVACY_GUIDE.md](ZK_PRIVACY_GUIDE.md) - Zero-Knowledge Proofs
- [DEPLOY_MANUAL.md](DEPLOY_MANUAL.md) - Deployment manual
- [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) - Setup inicial

---

## 🐛 Troubleshooting

### Error: Peer Dependencies

```bash
npm install --legacy-peer-deps
```

### Error: DeFindex API Key no configurada

Agregar en `.env`:
```env
DEFINDEX_API_KEY="sk_your_key_here"
NEXT_PUBLIC_DEFINDEX_VAULT_ADDRESS="VAULT_ADDRESS"
```

### Error: Wallet no conecta

1. Instalar extensión Freighter
2. Configurar network a Testnet
3. Obtener XLM de testnet faucet

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea rama (`git checkout -b feature/nueva`)
3. Commit (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push (`git push origin feature/nueva`)
5. Abre Pull Request

### Commits Semánticos

```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formateo
refactor: refactorización
test: tests
chore: mantenimiento
```

---

## 📝 Roadmap

### ✅ Completado (Q4 2024)
- Dashboard interactivo con gráficos
- Marketplace P2P en Stellar DEX
- Integración Stellar + Soroban
- DeFindex yield farming
- Ranking comunitario con ZK Proofs
- Multi-idioma (ES/EN)
- API Routes completa

### 🚧 En Progreso (Q1 2025)
- Tests unitarios (80% coverage)
- Integración Mainnet
- Mobile app
- Auditoría de seguridad

### 📅 Planificado (Q2-Q4 2025)
- DAO governance on-chain
- NFTs certificados verdes
- Integración con medidores IoT
- Staking de HDROP tokens
- 5 comunidades piloto activas

---

## 👥 Equipo

**Team BeEnergy:**

- **Tamara Ortega** - Pitch & Product
- **Araceli Santamaria** - Smart Contracts & ZK Circuits
- **Romina Iurchik** - Backend & API
- **Maria de los Angeles Rechach** - UX/UI Designer
- **Beverly González** - Frontend Development

**Contacto:**
- 🐦 Twitter: [@BeEnergyDAO](https://x.com/beenergycom?s=11)
- 📧 Email: benenergycoomunity@gmail.com

---

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE)

---

## 🙏 Agradecimientos

- **Stellar Development Foundation** - Infraestructura blockchain
- **DeFindex Team / Palta Labs** - SDK de yield farming
- **OpenZeppelin** - Contratos seguros
- **Hackathon Stellar Hack+** - Impulso inicial
- **Comunidad Open Source**

---

<div align="center">


[⬆ Volver arriba](#-beenergy---energía-verde-tokenizada)
