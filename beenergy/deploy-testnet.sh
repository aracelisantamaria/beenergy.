#!/bin/bash

# ==============================================================================
# BeEnergy - Script de Deployment a Stellar Testnet
# ==============================================================================
# Este script despliega los contratos de BeEnergy a Stellar Testnet
# Requisitos: Soroban CLI instalado (stellar --version)
# ==============================================================================

set -e  # Exit on error

echo "🚀 BeEnergy - Deployment a Stellar Testnet"
echo "============================================"
echo ""

# Configuración
NETWORK="testnet"
ADMIN_IDENTITY="beeenergy-admin"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ==============================================================================
# Paso 1: Configurar Identidades
# ==============================================================================
echo -e "${YELLOW}📋 Paso 1: Configurando identidades...${NC}"

# Generar o usar identidad existente para admin
if ! stellar keys show $ADMIN_IDENTITY 2>/dev/null; then
    echo "Generando identidad de admin..."
    stellar keys generate --global $ADMIN_IDENTITY --network $NETWORK
    echo -e "${GREEN}✅ Admin identity generada${NC}"
else
    echo -e "${GREEN}✅ Usando admin identity existente${NC}"
fi

# Mostrar dirección del admin
ADMIN_ADDRESS=$(stellar keys address $ADMIN_IDENTITY)
echo -e "${CYAN}Admin Address: $ADMIN_ADDRESS${NC}"
echo ""

# ==============================================================================
# Paso 2: Fondear Cuentas con Friendbot
# ==============================================================================
echo -e "${YELLOW}💰 Paso 2: Fondeando cuenta con Friendbot...${NC}"

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://friendbot.stellar.org/?addr=$ADMIN_ADDRESS")
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Cuenta fondeada exitosamente${NC}"
else
    echo -e "${RED}⚠️ Error al fondear cuenta${NC}"
    echo -e "${YELLOW}Puedes fondear manualmente en: https://laboratory.stellar.org/#account-creator?network=test${NC}"
fi

echo ""
sleep 2

# ==============================================================================
# Paso 3: Compilar Contratos
# ==============================================================================
echo -e "${YELLOW}🔨 Paso 3: Compilando contratos...${NC}"

# Compilar energy_token
echo "Compilando energy_token..."
cargo +1.89.0 build --package energy_token --target wasm32v1-none --release
echo -e "${GREEN}✅ energy_token compilado${NC}"

# Compilar energy_distribution
echo "Compilando energy_distribution..."
cargo +1.89.0 build --package energy-distribution --target wasm32v1-none --release
echo -e "${GREEN}✅ energy_distribution compilado${NC}"

echo ""

# ==============================================================================
# Paso 4: Desplegar Energy Token (HDROP)
# ==============================================================================
echo -e "${YELLOW}📤 Paso 4: Desplegando Energy Token (HDROP)...${NC}"

TOKEN_WASM="target/wasm32v1-none/release/energy_token.wasm"

echo "Instalando WASM del token..."
TOKEN_WASM_HASH=$(stellar contract install \
    --wasm $TOKEN_WASM \
    --source $ADMIN_IDENTITY \
    --network $NETWORK)

echo -e "${GREEN}✅ Token WASM instalado: $TOKEN_WASM_HASH${NC}"

echo "Desplegando token..."
TOKEN_CONTRACT_ID=$(stellar contract deploy \
    --wasm-hash $TOKEN_WASM_HASH \
    --source $ADMIN_IDENTITY \
    --network $NETWORK)

echo -e "${GREEN}✅ Token desplegado: $TOKEN_CONTRACT_ID${NC}"
echo ""

# ==============================================================================
# Paso 5: Desplegar Energy Distribution
# ==============================================================================
echo -e "${YELLOW}📤 Paso 5: Desplegando Energy Distribution...${NC}"

DISTRIBUTION_WASM="target/wasm32v1-none/release/energy_distribution.wasm"

echo "Instalando WASM de distribución..."
DISTRIBUTION_WASM_HASH=$(stellar contract install \
    --wasm $DISTRIBUTION_WASM \
    --source $ADMIN_IDENTITY \
    --network $NETWORK)

echo -e "${GREEN}✅ Distribution WASM instalado: $DISTRIBUTION_WASM_HASH${NC}"

echo "Desplegando distribución..."
DISTRIBUTION_CONTRACT_ID=$(stellar contract deploy \
    --wasm-hash $DISTRIBUTION_WASM_HASH \
    --source $ADMIN_IDENTITY \
    --network $NETWORK)

echo -e "${GREEN}✅ Distribución desplegada: $DISTRIBUTION_CONTRACT_ID${NC}"
echo ""

# ==============================================================================
# Paso 6: Inicializar Contratos
# ==============================================================================
echo -e "${YELLOW}⚙️ Paso 6: Inicializando contratos...${NC}"

# Inicializar Token
echo "Inicializando token HDROP..."
stellar contract invoke \
    --id $TOKEN_CONTRACT_ID \
    --source $ADMIN_IDENTITY \
    --network $NETWORK \
    -- \
    __constructor \
    --admin $ADMIN_ADDRESS \
    --distribution_contract $DISTRIBUTION_CONTRACT_ID \
    --initial_supply 0

echo -e "${GREEN}✅ Token inicializado${NC}"

# Inicializar Distribution
echo "Inicializando distribución..."
stellar contract invoke \
    --id $DISTRIBUTION_CONTRACT_ID \
    --source $ADMIN_IDENTITY \
    --network $NETWORK \
    -- \
    initialize \
    --admin $ADMIN_ADDRESS \
    --token_contract $TOKEN_CONTRACT_ID \
    --required_approvals 3

echo -e "${GREEN}✅ Distribución inicializada${NC}"
echo ""

# ==============================================================================
# Paso 7: Configurar Permisos
# ==============================================================================
echo -e "${YELLOW}🔐 Paso 7: Configurando permisos...${NC}"

# Otorgar rol de MINTER al contrato de distribución
echo "Otorgando rol de MINTER a distribución..."
stellar contract invoke \
    --id $TOKEN_CONTRACT_ID \
    --source $ADMIN_IDENTITY \
    --network $NETWORK \
    -- \
    grant_minter \
    --new_minter $DISTRIBUTION_CONTRACT_ID

echo -e "${GREEN}✅ Rol de MINTER otorgado${NC}"
echo ""

# ==============================================================================
# Paso 8: Guardar Configuración
# ==============================================================================
echo -e "${YELLOW}💾 Paso 8: Guardando configuración...${NC}"

cat > .env.deployed << EOF
# ==============================================================================
# BeEnergy - Deployed Contracts Configuration
# ==============================================================================
# Network: Stellar Testnet
# Deployed: $(date)
# ==============================================================================

# Admin Account
ADMIN_ADDRESS=$ADMIN_ADDRESS
ADMIN_IDENTITY=$ADMIN_IDENTITY

# Contracts
TOKEN_CONTRACT_ID=$TOKEN_CONTRACT_ID
DISTRIBUTION_CONTRACT_ID=$DISTRIBUTION_CONTRACT_ID

# WASM Hashes
TOKEN_WASM_HASH=$TOKEN_WASM_HASH
DISTRIBUTION_WASM_HASH=$DISTRIBUTION_WASM_HASH

# Network
NETWORK=$NETWORK
RPC_URL=https://soroban-testnet.stellar.org
HORIZON_URL=https://horizon-testnet.stellar.org

# Stellar Expert Explorer
TOKEN_EXPLORER=https://stellar.expert/explorer/testnet/contract/$TOKEN_CONTRACT_ID
DISTRIBUTION_EXPLORER=https://stellar.expert/explorer/testnet/contract/$DISTRIBUTION_CONTRACT_ID

# ==============================================================================
# Frontend Environment Variables
# ==============================================================================
# Copia estas variables a tu archivo .env del frontend:

NEXT_PUBLIC_NETWORK=$NETWORK
NEXT_PUBLIC_TOKEN_CONTRACT_ID=$TOKEN_CONTRACT_ID
NEXT_PUBLIC_DISTRIBUTION_CONTRACT_ID=$DISTRIBUTION_CONTRACT_ID
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
EOF

echo -e "${GREEN}✅ Configuración guardada en .env.deployed${NC}"
echo ""

# ==============================================================================
# Resumen Final
# ==============================================================================
echo -e "${CYAN}============================================${NC}"
echo -e "${GREEN}🎉 ¡Deployment Completado Exitosamente!${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""
echo -e "${YELLOW}📋 Resumen:${NC}"
echo "  Admin:         $ADMIN_ADDRESS"
echo "  Token (HDROP):  $TOKEN_CONTRACT_ID"
echo "  Distribution:   $DISTRIBUTION_CONTRACT_ID"
echo ""
echo -e "${YELLOW}🔗 Exploradores:${NC}"
echo "  Token:         https://stellar.expert/explorer/testnet/contract/$TOKEN_CONTRACT_ID"
echo "  Distribution:  https://stellar.expert/explorer/testnet/contract/$DISTRIBUTION_CONTRACT_ID"
echo ""
echo -e "${YELLOW}📄 Configuración guardada en: .env.deployed${NC}"
echo ""
echo -e "${CYAN}🚀 Próximos pasos:${NC}"
echo "  1. Copia las variables de .env.deployed a tu frontend"
echo "  2. Agrega miembros con multi-firma"
echo "  3. Registra generación de energía"
echo "  4. ¡Prueba el sistema!"
echo ""
