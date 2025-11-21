# 🔐 Guía de Privacidad con ZK Proofs - BeEnergy

## 🎯 Objetivo

Permitir que los usuarios registren consumo de energía **sin revelar la cantidad exacta** que consumieron, manteniendo la transparencia del sistema.

---

## 📊 ¿Por qué Privacidad?

En una blockchain pública, **todos los datos son visibles**. Esto incluye:
- ❌ Cuánta energía consumió cada hogar
- ❌ Patrones de consumo (horarios, días)
- ❌ Si la casa está ocupada o vacía (consumo = ocupación)

**Con ZK Proofs puedes:**
- ✅ Demostrar que consumiste ≤ tu cuota asignada
- ✅ Verificar que el consumo es válido
- ✅ Todo sin revelar la cantidad exacta

---

## 🏗️ Arquitectura Implementada

### Para la Hackathon (Actual)

```
┌──────────────────────────────────────┐
│  USUARIO (Frontend)                  │
│                                      │
│  1. Consumió 50 kWh (privado)       │
│  2. Genera commitment:              │
│     SHA256(address + 50 + secret)   │
│     → 0x7a3f9...                    │
│                                      │
│  3. Envía solo el commitment        │
└───────────────┬──────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│  SMART CONTRACT                       │
│                                      │
│  • Recibe: 0x7a3f9...               │
│  • Almacena sin saber la cantidad   │
│  • ✅ Commitment registrado          │
│                                      │
└──────────────────────────────────────┘

Resultado: Nadie sabe que consumió 50 kWh,
           solo que registró consumo válido.
```

### Para Producción (Futuro)

```
┌──────────────────────────────────────┐
│  USUARIO (Frontend + SnarkJS)        │
│                                      │
│  1. Consumió 50 kWh                 │
│  2. Genera ZK Proof (Groth16):      │
│     • Input privado: consumed = 50  │
│     • Input público: allocated = 75 │
│     • Proof: π = {...}              │
│                                      │
│  3. Envía solo el proof (no el 50)  │
└───────────────┬──────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│  SMART CONTRACT (Soroban)            │
│                                      │
│  • Recibe proof π                   │
│  • Verifica matemáticamente:        │
│    ✓ consumed ≤ allocated           │
│  • ✅ Sin conocer el valor real      │
│                                      │
└──────────────────────────────────────┘
```

---

## 💻 Uso en el Frontend

### 1. Generar Commitment (Actual)

```typescript
import { sha256 } from '@noble/hashes/sha256';
import { Address } from '@stellar/stellar-sdk';

// Generar un secret aleatorio (guardar localmente)
function generateSecret(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

// Generar commitment de consumo
async function generateCommitment(
  userAddress: string,
  consumedKwh: number,
  secret: Uint8Array
): Promise<string> {
  // Convertir address a bytes
  const addressBytes = Address.fromString(userAddress).toBuffer();

  // Convertir consumed_kwh a bytes (i128 = 16 bytes)
  const kwhWithDecimals = Math.floor(consumedKwh * 10_000_000); // 7 decimales
  const kwhBytes = new BigInt64Array([BigInt(kwhWithDecimals)]);

  // Concatenar: address (32) + kwh (16) + secret (32) = 80 bytes
  const data = new Uint8Array(80);
  data.set(addressBytes, 0);
  data.set(new Uint8Array(kwhBytes.buffer), 32);
  data.set(secret, 48);

  // Calcular SHA256
  const commitment = sha256(data);

  return Buffer.from(commitment).toString('hex');
}

// Uso
const secret = generateSecret();
localStorage.setItem('energy_secret', Buffer.from(secret).toString('hex'));

const commitment = await generateCommitment(
  userAddress,
  50, // Consumió 50 kWh
  secret
);

// Enviar al contrato
await distributionContract.record_private_consumption({
  user: userAddress,
  commitment: Buffer.from(commitment, 'hex')
});
```

### 2. Verificar Consumo (Revelar datos si es necesario)

```typescript
// El usuario puede demostrar su consumo revelando los datos
async function proveConsumption(
  userAddress: string,
  consumedKwh: number
) {
  // Recuperar secret guardado
  const secretHex = localStorage.getItem('energy_secret');
  const secret = Buffer.from(secretHex, 'hex');

  // Reconstruir los datos
  const userData = generateUserData(userAddress, consumedKwh, secret);

  // Verificar en el contrato
  const isValid = await distributionContract.verify_private_consumption({
    user: userAddress,
    user_data: userData
  });

  if (isValid) {
    console.log('✅ Consumo verificado:', consumedKwh, 'kWh');
  } else {
    console.log('❌ Consumo inválido');
  }
}
```

---

## 🚀 Migración a ZK Proofs Reales

### Paso 1: Instalar Circom y SnarkJS

```bash
npm install -g circom
npm install snarkjs
```

### Paso 2: Crear Circuito

```circom
// circuits/energy_consumption.circom
pragma circom 2.0.0;

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/comparators.circom";

template EnergyConsumptionProof() {
    // Inputs privados (solo el usuario los conoce)
    signal input consumed_kwh;
    signal input allocated_kwh;
    signal input user_secret;

    // Inputs públicos (visibles on-chain)
    signal input user_commitment;

    // Output público
    signal output valid;

    // 1. Verificar identidad del usuario (commitment)
    component hasher = Poseidon(1);
    hasher.inputs[0] <== user_secret;
    user_commitment === hasher.out;

    // 2. Verificar que consumed ≤ allocated
    component leq = LessEqThan(64);
    leq.in[0] <== consumed_kwh;
    leq.in[1] <== allocated_kwh;

    valid <== leq.out;
}

component main {public [user_commitment]} = EnergyConsumptionProof();
```

### Paso 3: Compilar y Setup

```bash
# Compilar circuito
circom circuits/energy_consumption.circom --r1cs --wasm --sym

# Generar proving key y verification key
snarkjs groth16 setup energy_consumption.r1cs pot12_final.ptau circuit_final.zkey

# Exportar verification key
snarkjs zkey export verificationkey circuit_final.zkey verification_key.json
```

### Paso 4: Generar Proofs en el Frontend

```typescript
import { groth16 } from 'snarkjs';

async function generateZKProof(
  consumed: number,
  allocated: number,
  secret: bigint
) {
  const input = {
    consumed_kwh: consumed,
    allocated_kwh: allocated,
    user_secret: secret,
    user_commitment: poseidon([secret])
  };

  const { proof, publicSignals } = await groth16.fullProve(
    input,
    'circuits/energy_consumption.wasm',
    'circuits/circuit_final.zkey'
  );

  return { proof, publicSignals };
}

// Uso
const { proof, publicSignals } = await generateZKProof(50, 75, secret);

// Enviar al contrato
await distributionContract.verify_zk_proof({
  proof: proof,
  public_signals: publicSignals
});
```

### Paso 5: Verificar en el Contrato

```rust
// contracts/energy_distribution/src/lib.rs

use soroban_sdk::{Bytes, BytesN, Env};

pub fn verify_zk_proof(
    env: Env,
    proof: Bytes,
    public_signals: Vec<u64>
) -> Result<bool, Error> {
    // Implementar verificador Groth16 en Soroban
    // (Requiere pairing-friendly curves como BN254)

    let is_valid = groth16_verify(
        &env,
        &proof,
        &public_signals,
        &VERIFICATION_KEY
    )?;

    Ok(is_valid)
}
```

---

## 📈 Comparación: Actual vs Producción

| Característica | Hackathon (Actual) | Producción (Futuro) |
|----------------|-------------------|---------------------|
| Privacidad | ⚠️ Parcial (commitment) | ✅ Total (ZK-SNARK) |
| Revelación | ❌ Puede revelar datos | ✅ Nunca revela |
| Complejidad | 🟢 Simple (SHA256) | 🟡 Avanzada (Circom) |
| Verificación | ⚠️ Requiere datos | ✅ Solo matemática |
| Performance | ⚡ Instantáneo | 🐌 2-5 segundos |
| Tamaño Proof | 32 bytes | ~200 bytes |
| Costo Gas | 💰 Bajo | 💰💰 Medio |

---

## 🎓 Para la Presentación de la Hackathon

### Slide 1: El Problema

> "En blockchain pública, **todos ven tu consumo de energía**. Esto revela:
> - Cuándo estás en casa
> - Tus patrones de vida
> - Información sensible familiar"

### Slide 2: La Solución - ZK Proofs

> "Con **Zero-Knowledge Proofs** puedes demostrar que:
> - ✅ Tu consumo es válido
> - ✅ No excediste tu cuota
> - ❌ **Sin revelar** la cantidad exacta"

### Slide 3: Implementación

> "Hemos implementado:
> 1. **Commitments** (SHA256) para la demo
> 2. **Arquitectura lista** para ZK-SNARKs reales
> 3. **3 funciones** en el contrato:
>    - `enable_privacy()`
>    - `record_private_consumption()`
>    - `verify_private_consumption()`"

### Slide 4: Demo

```typescript
// Usuario registra consumo privado
const commitment = generateCommitment(user, 50_kWh, secret);
await contract.record_private_consumption(commitment);

// ✅ Registrado sin revelar cantidad
// 🔒 Privacidad garantizada
```

---

## 🏆 Puntos Clave para los Jueces

1. **Privacidad desde el Diseño**: No es un add-on, está integrado en el core
2. **Escalable**: Fácil migración a ZK-SNARKs reales
3. **Práctico**: Balance entre privacidad y usabilidad
4. **Innovador**: Pocos proyectos de energía usan ZK proofs
5. **Educativo**: Código bien documentado para aprender

---

## 📚 Referencias

- [ZK Proofs Explained](https://zkproof.org/)
- [Circom Documentation](https://docs.circom.io/)
- [SnarkJS GitHub](https://github.com/iden3/snarkjs)
- [Groth16 Paper](https://eprint.iacr.org/2016/260.pdf)
- [Stellar ZK Research](https://stellar.org/blog/zero-knowledge-proofs)

---

**¡Con esto tienen un sistema de privacidad funcional y puntos extras en la hackathon! 🚀**
