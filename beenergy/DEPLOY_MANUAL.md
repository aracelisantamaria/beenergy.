# Manual de Deployment a Stellar Testnet

## Pasos para Desplegar BeEnergy

### 1. Configurar Identity

```bash
# Generar identidad de admin (solo la primera vez)
stellar keys generate beeenergy-admin --network testnet

# Ver la dirección
stellar keys address beeenergy-admin
```

**Guarda esta dirección**: La necesitarás para fondear la cuenta.

### 2. Fondear Cuenta

Opción A - Usando Friendbot (CLI):
```bash
# Reemplaza <TU_DIRECCION> con la dirección del paso anterior
curl "https://friendbot.stellar.org/?addr=<TU_DIRECCION>"
```

Opción B - Usando Stellar Laboratory:
1. Ve a: https://laboratory.stellar.org/#account-creator?network=test
2. Pega tu dirección
3. Click en "Get test network lumens"

### 3. Compilar Contratos

```bash
cd C:\Users\Aracelis\Desktop\Proyecto_Hack\Backend\beenergy\beenergy

# Compilar token
cargo +1.89.0 build --package energy_token --target wasm32v1-none --release

# Compilar distribution
cargo +1.89.0 build --package energy-distribution --target wasm32v1-none --release
```

### 4. Deploy Energy Token

```bash
# Upload WASM
stellar contract upload \
  --wasm target/wasm32v1-none/release/energy_token.wasm \
  --source beeenergy-admin \
  --network testnet

# Te dará un WASM_HASH, guárdalo
# Ejemplo: 1234567890abcdef...

# Deploy contract
stellar contract deploy \
  --wasm-hash <WASM_HASH_DEL_TOKEN> \
  --source beeenergy-admin \
  --network testnet

# Te dará un CONTRACT_ID, guárdalo
# Ejemplo: CBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 5. Deploy Energy Distribution

```bash
# Upload WASM
stellar contract upload \
  --wasm target/wasm32v1-none/release/energy_distribution.wasm \
  --source beeenergy-admin \
  --network testnet

# Deploy contract
stellar contract deploy \
  --wasm-hash <WASM_HASH_DE_DISTRIBUTION> \
  --source beeenergy-admin \
  --network testnet
```

### 6. Inicializar Token

```bash
# Obtener tu dirección de admin
$ADMIN_ADDRESS = stellar keys address beeenergy-admin

# Inicializar (reemplaza los valores)
stellar contract invoke \
  --id <TOKEN_CONTRACT_ID> \
  --source beeenergy-admin \
  --network testnet \
  -- \
  __constructor \
  --admin $ADMIN_ADDRESS \
  --distribution_contract <DISTRIBUTION_CONTRACT_ID> \
  --initial_supply 0
```

### 7. Inicializar Distribution

```bash
stellar contract invoke \
  --id <DISTRIBUTION_CONTRACT_ID> \
  --source beeenergy-admin \
  --network testnet \
  -- \
  initialize \
  --admin $ADMIN_ADDRESS \
  --token_contract <TOKEN_CONTRACT_ID> \
  --required_approvals 3
```

### 8. Otorgar Rol MINTER

```bash
stellar contract invoke \
  --id <TOKEN_CONTRACT_ID> \
  --source beeenergy-admin \
  --network testnet \
  -- \
  grant_minter \
  --new_minter <DISTRIBUTION_CONTRACT_ID>
```

### 9. Guardar Configuración

Crea un archivo `.env.deployed` con:

```bash
# BeEnergy - Deployed Contracts

ADMIN_ADDRESS=<TU_ADMIN_ADDRESS>
TOKEN_CONTRACT_ID=<TOKEN_CONTRACT_ID>
DISTRIBUTION_CONTRACT_ID=<DISTRIBUTION_CONTRACT_ID>

# Frontend
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_TOKEN_CONTRACT_ID=<TOKEN_CONTRACT_ID>
NEXT_PUBLIC_DISTRIBUTION_CONTRACT_ID=<DISTRIBUTION_CONTRACT_ID>
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
```

### 10. Verificar Deployment

Visita los exploradores:
- Token: https://stellar.expert/explorer/testnet/contract/<TOKEN_CONTRACT_ID>
- Distribution: https://stellar.expert/explorer/testnet/contract/<DISTRIBUTION_CONTRACT_ID>

---

## Ejemplo Completo (Reemplaza los valores)

```bash
# 1. Generar identity
stellar keys generate beeenergy-admin --network testnet
$ADMIN = stellar keys address beeenergy-admin

# 2. Fondear
curl "https://friendbot.stellar.org/?addr=$ADMIN"

# 3. Build
cargo +1.89.0 build --package energy_token --target wasm32v1-none --release
cargo +1.89.0 build --package energy-distribution --target wasm32v1-none --release

# 4. Upload Token
$TOKEN_HASH = stellar contract upload --wasm target/wasm32v1-none/release/energy_token.wasm --source beeenergy-admin --network testnet
$TOKEN_ID = stellar contract deploy --wasm-hash $TOKEN_HASH --source beeenergy-admin --network testnet

# 5. Upload Distribution
$DIST_HASH = stellar contract upload --wasm target/wasm32v1-none/release/energy_distribution.wasm --source beeenergy-admin --network testnet
$DIST_ID = stellar contract deploy --wasm-hash $DIST_HASH --source beeenergy-admin --network testnet

# 6. Initialize Token
stellar contract invoke --id $TOKEN_ID --source beeenergy-admin --network testnet -- __constructor --admin $ADMIN --distribution_contract $DIST_ID --initial_supply 0

# 7. Initialize Distribution
stellar contract invoke --id $DIST_ID --source beeenergy-admin --network testnet -- initialize --admin $ADMIN --token_contract $TOKEN_ID --required_approvals 3

# 8. Grant MINTER
stellar contract invoke --id $TOKEN_ID --source beeenergy-admin --network testnet -- grant_minter --new_minter $DIST_ID

# 9. Ver contratos
Write-Host "Token: https://stellar.expert/explorer/testnet/contract/$TOKEN_ID"
Write-Host "Distribution: https://stellar.expert/explorer/testnet/contract/$DIST_ID"
```

---

## Troubleshooting

### Error: "Failed to find config identity"
```bash
# Regenerar identity
stellar keys generate beeenergy-admin --network testnet --regen
```

### Error: "Insufficient balance"
```bash
# Fondear de nuevo
curl "https://friendbot.stellar.org/?addr=$(stellar keys address beeenergy-admin)"
```

### Error: "Transaction simulation failed"
- Verifica que usaste las direcciones correctas
- Verifica que la cuenta esté fondeada
- Espera unos segundos y vuelve a intentar

---

¡Con estos pasos tus contratos estarán desplegados en Stellar Testnet! 🚀
