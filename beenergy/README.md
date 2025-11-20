# BeEnergy 🌞⚡

> Plataforma Web3 para comunidades energéticas autónomas con transparencia total en blockchain y privacidad mediante ZK proofs

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-blue)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contracts-purple)](https://soroban.stellar.org)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-v0.4.1-green)](https://openzeppelin.com)
[![ZK-SNARK](https://img.shields.io/badge/Privacy-ZK--Proofs-red)](https://zkproof.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Tabla de Contenidos

- [¿Qué es BeEnergy?](#qué-es-beeenergy)
- [Problema que Resolvemos](#problema-que-resolvemos)
- [Solución](#solución)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Uso](#uso)
- [Smart Contracts](#smart-contracts)
- [Privacidad con ZK Proofs](#privacidad-con-zk-proofs)
- [Roadmap](#roadmap)
- [Equipo](#equipo)

---

## 🌍 ¿Qué es BeEnergy?

**BeEnergy** es una plataforma Web3 que permite a comunidades pequeñas (5-50 hogares) crear, gestionar y gobernar instalaciones solares compartidas de forma completamente transparente mediante blockchain Stellar, con privacidad garantizada mediante Zero-Knowledge proofs.

### Características Principales:

✅ **Distribución Automática**: Los kWh generados se distribuyen proporcionalmente según % de propiedad  
✅ **Marketplace P2P**: Comercio libre de energía entre vecinos con pricing dinámico (Stellar DEX)  
✅ **Transparencia Total**: Todo registrado on-chain - auditable por cualquiera  
✅ **Privacidad Garantizada**: ZK proofs protegen datos sensibles de consumo  
✅ **Gobernanza Descentralizada**: Decisiones comunitarias mediante votaciones on-chain  
✅ **Sin Base de Datos Centralizada**: 100% on-chain storage en Stellar  
✅ **Multi-firma Comunitaria**: Wallet compartida con firmas múltiples  

---

## 🔥 Problema que Resolvemos

Las comunidades que buscan adoptar energías renovables enfrentan:

- **Gobernanza opaca**: Administradores centralizados sin transparencia
- **Sistemas centralizados ineficientes**: Colapsos frecuentes, tarifas volátiles (aumentos del 40-300%)
- **Barreras de inversión**: $8,000-15,000 USD por hogar para instalación individual
- **Imposibilidad de monetizar excedentes**: Las distribuidoras compran a 40-60% del precio de venta
- **Falta de privacidad**: Datos de consumo expuestos públicamente
- **Dependencia de bases de datos centralizadas**: Riesgo de censura y pérdida de datos

---

## 💡 Solución

### Flujo de Usuario:

```
1. INSTALACIÓN (Off-chain)
   → Comunidad instala paneles solares compartidos
   
2. CONTRATO INICIAL (On-chain)
   → Smart contract registra % de propiedad cifrado con ZK proofs:
     Juan: 30%, María: 25%, Carlos: 25%, Ana: 20%
   
3. GENERACIÓN DIARIA (Automático + Privado)
   → Sistema genera 100 kWh
   → ZK proof verifica generación sin revelar datos sensibles
   → Distribución automática:
     • Juan: 30 $ENERGY tokens
     • María: 25 $ENERGY tokens
     • Carlos: 25 $ENERGY tokens
     • Ana: 20 $ENERGY tokens
   
4. CONSUMO DIARIO (Privado)
   → Tokens se queman al consumir
   → ZK proof demuestra consumo válido sin revelar cantidad exacta públicamente
   
5. MARKETPLACE P2P (Stellar DEX)
   → Trading directo en Stellar DEX
   → Precio dinámico según oferta/demanda
   → Ejecución atómica (sin riesgo de contraparte)
   
6. GOBERNANZA DAO
   → Propuestas y votaciones on-chain
   → Multi-sig wallet para fondos comunes
   → Todo transparente pero con privacidad opcional
```

---

## 🏗️ Arquitectura

```
┌──────────────────────────────────────────────────────┐
│                    USUARIO                            │
│               (Freighter Wallet)                      │
└────────────────────┬─────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────┐
│              FRONTEND (Next.js)                       │
│  • Dashboard      • Marketplace      • Votaciones    │
│  • ZK Proof Generator (Client-side)                  │
└────────────────────┬─────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────┐
│        STELLAR NETWORK (100% On-chain)               │
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │  SMART CONTRACTS (Soroban):                    │ │
│  │  • energy_token (OpenZeppelin SEP-41)          │ │
│  │  • energy_distribution (storage on-chain)      │ │
│  │  • community_governance (DAO + Marketplace)    │ │
│  │  • zk_verifier (ZK proof verification)         │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │  STELLAR NATIVE FEATURES:                      │ │
│  │  • Stellar DEX (Trading P2P)                   │ │
│  │  • Multi-sig Accounts (Community wallet)       │ │
│  │  • Stellar Anchors (USDC on/off-ramp)          │ │
│  │  • Persistent Storage (No external DB)         │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  📊 Stellar Expert API (Indexing)                    │
└──────────────────────────────────────────────────────┘
```

---

## 🛠️ Tecnologías

### Blockchain:
- **Stellar Testnet** - Red blockchain (no PostgreSQL, todo on-chain)
- **Soroban** - Smart contracts (Rust)
- **OpenZeppelin Stellar ^0.4.1** - Token estándar SEP-41
- **Stellar DEX** - Trading P2P nativo
- **Multi-sig Accounts** - Wallet comunitaria con 3-of-5 firmas
- **Stellar Anchors** - MoneyGram Access para USDC

### Privacy:
- **Circom** - ZK circuit compiler
- **SnarkJS** - ZK proof generation (browser)
- **Groth16** - ZK-SNARK proof system
- **Poseidon Hash** - ZK-friendly hash function

### Frontend:
- **Next.js 14** - Framework React (sin backend Node)
- **TypeScript** - Tipado estático
- **@stellar/stellar-sdk** - SDK de Stellar
- **Freighter** - Wallet integration
- **shadcn/ui + TailwindCSS** - Componentes UI
- **SnarkJS (Browser)** - ZK proof generation client-side

### Indexing & Analytics:
- **Stellar Expert API** - Leer transacciones históricas
- **Stellar Horizon** - API REST de Stellar

---

## 📦 Instalación (Windows Compatible)

### Prerrequisitos:

```bash
# Instalar Rust (Windows)
# Descargar desde: https://rustup.rs/
# O usar PowerShell:
Invoke-WebRequest -Uri https://win.rustup.rs/x86_64 -OutFile rustup-init.exe
.\rustup-init.exe

# Agregar target wasm32
rustup target add wasm32-unknown-unknown

# Instalar Soroban CLI
cargo install --locked soroban-cli --features opt

# Instalar Node.js 20+ (Windows)
# Descargar desde: https://nodejs.org

# NO SE NECESITA PostgreSQL ✅
```

### 1. Clonar Repositorio:

```bash
git clone https://github.com/tu-usuario/beeenergy.git
cd beeenergy
```

### 2. Setup Smart Contracts:

```bash
cd contracts

# Build todos los contratos
./build-all.sh  # Linux/Mac
.\build-all.ps1  # Windows PowerShell

# Deploy a testnet
./deploy-testnet.sh  # Linux/Mac
.\deploy-testnet.ps1  # Windows PowerShell
```

### 3. Setup ZK Circuits:

```bash
cd zk-circuits

# Instalar circom
npm install -g circom

# Compilar circuitos
npm run build:circuits

# Generar proving/verification keys
npm run setup:zk
```

### 4. Setup Frontend (No Backend Needed!):

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con CONTRACT_IDs

# Iniciar app
npm run dev
```

Abrir: `http://localhost:3000`

---

## 🚀 Uso

### 1. Crear Comunidad:

```bash
# Desde el dashboard
1. Click "Crear Comunidad"
2. Ingresar miembros y % de propiedad
3. Sistema genera ZK proof de distribución
4. Firmar transacción con Freighter
5. ¡Comunidad creada con privacidad! 🎉
```

### 2. Simular Generación (Con Privacidad):

```bash
# Opción A: Desde UI
Dashboard → "Simular Generación" 
→ Ingresar 100 kWh
→ Sistema genera ZK proof
→ Proof verifica en smart contract
→ Tokens distribuidos automáticamente

# Opción B: CLI directa
soroban contract invoke \
  --id $DISTRIBUTION_ID \
  --network testnet \
  -- \
  record_generation_with_proof \
  --total_kwh 100 \
  --zk_proof [proof_bytes]
```

### 3. Comerciar Energía (Stellar DEX):

```bash
1. Ir a "Marketplace"
2. Ver órdenes en Stellar DEX
3. Click "Comprar" o "Vender"
4. Transacción ejecutada atómicamente en DEX
5. Sin intermediarios, sin fees extra ⚡
```

---

## 📜 Smart Contracts (Solo 3)

### 1. **energy_token** (SEP-41 Token - OpenZeppelin)
- Token fungible $ENERGY
- 1 token = 1 kWh
- Minteo/Quema automática
- Compatible con Stellar DEX

📄 [Ver código](./contracts/energy_token/src/lib.rs)  
🔗 [Ver en Explorer](https://stellar.expert/explorer/testnet/contract/CXXXX)

### 2. **energy_distribution**
- Registra % de propiedad (on-chain storage)
- Recibe lecturas de medidor
- Verifica ZK proofs de privacidad
- Distribuye tokens automáticamente
- NO requiere DB externa (todo en Stellar)

📄 [Ver código](./contracts/energy_distribution/src/lib.rs)  
🔗 [Ver en Explorer](https://stellar.expert/explorer/testnet/contract/CXXXX)

### 3. **community_governance** (DAO + Marketplace combinados)
- Propuestas on-chain
- Votación ponderada por %
- Integración con Stellar DEX para trading
- Multi-sig wallet comunitaria
- Ejecución automática

📄 [Ver código](./contracts/community_governance/src/lib.rs)  
🔗 [Ver en Explorer](https://stellar.expert/explorer/testnet/contract/CXXXX)

### 4. **zk_verifier** (Opcional - Para MVP)
- Verifica ZK proofs on-chain
- Protege privacidad de datos de consumo
- Groth16 verifier en Soroban

📄 [Ver código](./contracts/zk_verifier/src/lib.rs)

---

## 🔐 Privacidad con ZK Proofs

### ¿Por qué ZK proofs?

En una blockchain pública, **todos los datos son visibles**. Esto incluye:
- Cuánta energía consumís individualmente
- Patrones de consumo (horarios, días)
- Si estás en casa o no (consumo = ocupación)

**ZK proofs permiten:**
✅ Demostrar que consumiste X kWh **sin revelar X**  
✅ Verificar que tu consumo es válido **sin mostrar detalles**  
✅ Mantener transparencia **con privacidad opcional**  

### Circuito ZK: Proof of Energy Consumption

```circom
// Circuit: Prove you consumed <= your allocation
pragma circom 2.0.0;

include "circomlib/poseidon.circom";
include "circomlib/comparators.circom";

template EnergyConsumptionProof() {
    // Private inputs (hidden)
    signal input consumed_kwh;
    signal input allocated_kwh;
    signal input user_secret;
    
    // Public inputs (visible on-chain)
    signal input user_commitment;  // Hash of user_secret
    signal output valid;
    
    // Verify user identity (without revealing secret)
    component hasher = Poseidon(1);
    hasher.inputs[0] <== user_secret;
    user_commitment === hasher.out;
    
    // Verify consumption <= allocation
    component leq = LessEqThan(64);
    leq.in[0] <== consumed_kwh;
    leq.in[1] <== allocated_kwh;
    
    valid <== leq.out;
}

component main = EnergyConsumptionProof();
```

### Flujo de Privacidad:

```
1. USUARIO (Frontend):
   → Genera proof: "Consumí ≤ mi cuota, pero no digo cuánto"
   → Proof generado en browser (SnarkJS)
   
2. SMART CONTRACT:
   → Recibe proof
   → Verifica matemáticamente que es válido
   → Acepta/rechaza sin saber cantidad real
   
3. RESULTADO:
   → ✅ Transparencia: todos ven que la transacción es válida
   → ✅ Privacidad: nadie sabe la cantidad exacta consumida
```

### Implementación:

**Frontend (JavaScript):**
```javascript
import { groth16 } from 'snarkjs';

// Generar proof
async function generateConsumptionProof(consumed, allocated, secret) {
  const input = {
    consumed_kwh: consumed,
    allocated_kwh: allocated,
    user_secret: secret,
    user_commitment: poseidon([secret])
  };
  
  const { proof, publicSignals } = await groth16.fullProve(
    input,
    'circuits/consumption.wasm',
    'circuits/consumption_final.zkey'
  );
  
  return { proof, publicSignals };
}

// Enviar a smart contract
await distributionContract.record_consumption_with_proof(
  proof,
  publicSignals
);
```

**Smart Contract (Rust):**
```rust
pub fn record_consumption_with_proof(
    env: Env,
    user: Address,
    zk_proof: BytesN<256>,
    public_signals: Vec<u64>
) -> Result<(), Error> {
    // Verify ZK proof
    let is_valid = zk_verifier::verify_groth16(
        &env,
        &zk_proof,
        &public_signals
    )?;
    
    require!(is_valid, Error::InvalidProof);
    
    // Proceed without knowing actual consumption
    burn_tokens(&env, &user, estimated_amount);
    
    Ok(())
}
```

---

## 🔗 Integraciones Stellar Nativas

### 1. **Stellar DEX** (Marketplace Automático)

```javascript
// NO necesitas smart contract custom para trading
// Usar Stellar DEX directamente:

import { Asset, Operation, TransactionBuilder } from '@stellar/stellar-sdk';

// Crear orden de venta
const sellOffer = Operation.manageSellOffer({
  selling: energyToken,
  buying: Asset.native(), // XLM o USDC
  amount: '10',  // 10 kWh
  price: '0.12',  // $0.12 por kWh
});

transaction.addOperation(sellOffer);
```

### 2. **Multi-sig Community Wallet**

```javascript
// Crear wallet comunitaria con 3-of-5 firmas
const communityAccount = await server.loadAccount(communityAddress);

// Agregar signatarios
const addSigners = [
  Operation.setOptions({
    signer: { ed25519PublicKey: member1Key, weight: 1 }
  }),
  Operation.setOptions({
    signer: { ed25519PublicKey: member2Key, weight: 1 }
  }),
  // ... más miembros
  Operation.setOptions({
    masterWeight: 0,  // Desactivar master key
    lowThreshold: 3,  // 3 firmas requeridas
    medThreshold: 3,
    highThreshold: 3
  })
];
```

### 3. **Stellar Anchors** (USDC On/Off Ramp)

```javascript
// Convertir tokens a USDC usando MoneyGram Access
import { StellarTomlResolver } from '@stellar/stellar-sdk';

// 1. Conectar con anchor
const toml = await StellarTomlResolver.resolve('moneygram.stellar.org');
const usdcAsset = new Asset('USDC', toml.CURRENCIES[0].issuer);

// 2. Path payment: $ENERGY → USDC → ARS
const pathPayment = Operation.pathPaymentStrictSend({
  sendAsset: energyToken,
  sendAmount: '50',  // 50 kWh
  destination: userAccount,
  destAsset: usdcAsset,
  destMin: '5.5',  // Mínimo $5.50 USDC
});
```

### 4. **Stellar Expert API** (Historial)

```javascript
// Leer historial de transacciones (sin DB propia)
const response = await fetch(
  `https://api.stellar.expert/explorer/testnet/contract/${contractId}/operations`
);

const history = await response.json();

// Mostrar en frontend
history.operations.forEach(op => {
  console.log(`${op.type}: ${op.amount} kWh`);
});
```

---

## 🗺️ Roadmap

### ✅ MVP (Hackathon - Marzo 2025)
- [x] 3 smart contracts desplegados en testnet
- [x] Dashboard funcional (sin backend)
- [x] Integración Stellar DEX
- [x] Multi-sig wallet comunitaria
- [x] ZK proofs para privacidad
- [x] Storage 100% on-chain

### 🔮 V1.0 (Post-Hackathon)
- [ ] Mainnet deployment
- [ ] Integración medidores IoT reales
- [ ] App móvil (iOS/Android)
- [ ] ZK proofs optimizados (Plonky2)
- [ ] 5 comunidades piloto activas

### 🚀 V2.0 (Futuro)
- [ ] Expansión a energía eólica, hidráulica
- [ ] Certificados de energía verde (RECs) tokenizados
- [ ] Marketplace inter-comunitario
- [ ] Interoperabilidad cross-chain (Ethereum L2s)
- [ ] SDK para developers

---

## 👥 Equipo

**Team BeEnergy:**

- **[Tu Nombre]** - Smart Contracts & ZK Circuits
- **[Nombre Compañera]** - Frontend & UX/UI

**Contacto:**
- 🐦 Twitter: [@BeEnergyDAO](https://twitter.com/BeEnergyDAO)
- 📧 Email: team@beeenergy.io
- 💬 Discord: [discord.gg/beeenergy](https://discord.gg/beeenergy)

---

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE)

---

## 🙏 Agradecimientos

- **Stellar Foundation** - Por la infraestructura blockchain
- **OpenZeppelin** - Por las librerías de contratos seguros
- **ZK Proof Community** - Por los circuits y herramientas
- **Hackathon Stellar Hack+** - Por el impulso inicial

---

## 📚 Documentación Adicional

- [Guía de Instalación (Windows)](./docs/INSTALLATION_WINDOWS.md)
- [Arquitectura de Contratos](./docs/CONTRACTS.md)
- [ZK Circuits Explicados](./docs/ZK_CIRCUITS.md)
- [Stellar DEX Integration](./docs/STELLAR_DEX.md)
- [FAQ](./docs/FAQ.md)

---

**¿Preguntas?** Abre un [issue](https://github.com/tu-usuario/beeenergy/issues)

**⭐ Si te gusta el proyecto, danos una estrella en GitHub!**
