# ==============================================================================
# BeEnergy - Script de Deployment a Stellar Testnet
# ==============================================================================
# Este script despliega los contratos de BeEnergy a Stellar Testnet
# Requisitos: Soroban CLI instalado (stellar --version)
# ==============================================================================

Write-Host "🚀 BeEnergy - Deployment a Stellar Testnet" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$NETWORK = "testnet"
$ADMIN_IDENTITY = "beeenergy-admin"
$DISTRIBUTION_IDENTITY = "beeenergy-distribution"

# ==============================================================================
# Paso 1: Configurar Identidades
# ==============================================================================
Write-Host "📋 Paso 1: Configurando identidades..." -ForegroundColor Yellow

# Generar o usar identidad existente para admin
$adminExists = stellar keys show $ADMIN_IDENTITY 2>$null
if (!$adminExists) {
    Write-Host "Generando identidad de admin..."
    stellar keys generate --global $ADMIN_IDENTITY --network $NETWORK
    Write-Host "✅ Admin identity generada" -ForegroundColor Green
} else {
    Write-Host "✅ Usando admin identity existente" -ForegroundColor Green
}

# Mostrar dirección del admin
$ADMIN_ADDRESS = stellar keys address $ADMIN_IDENTITY
Write-Host "Admin Address: $ADMIN_ADDRESS" -ForegroundColor Cyan
Write-Host ""

# ==============================================================================
# Paso 2: Fondear Cuentas con Friendbot
# ==============================================================================
Write-Host "💰 Paso 2: Fondeando cuenta con Friendbot..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://friendbot.stellar.org/?addr=$ADMIN_ADDRESS" -Method Get
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Cuenta fondeada exitosamente" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Error al fondear cuenta: $_" -ForegroundColor Red
    Write-Host "Puedes fondear manualmente en: https://laboratory.stellar.org/#account-creator?network=test" -ForegroundColor Yellow
}

Write-Host ""
Start-Sleep -Seconds 2

# ==============================================================================
# Paso 3: Compilar Contratos
# ==============================================================================
Write-Host "🔨 Paso 3: Compilando contratos..." -ForegroundColor Yellow

# Compilar energy_token
Write-Host "Compilando energy_token..."
cargo +1.89.0 build --package energy_token --target wasm32v1-none --release
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ energy_token compilado" -ForegroundColor Green
} else {
    Write-Host "❌ Error compilando energy_token" -ForegroundColor Red
    exit 1
}

# Compilar energy_distribution
Write-Host "Compilando energy_distribution..."
cargo +1.89.0 build --package energy-distribution --target wasm32v1-none --release
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ energy_distribution compilado" -ForegroundColor Green
} else {
    Write-Host "❌ Error compilando energy_distribution" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ==============================================================================
# Paso 4: Desplegar Energy Token (HDROP)
# ==============================================================================
Write-Host "📤 Paso 4: Desplegando Energy Token (HDROP)..." -ForegroundColor Yellow

$TOKEN_WASM = "target/wasm32v1-none/release/energy_token.wasm"

Write-Host "Instalando WASM del token..."
$TOKEN_WASM_HASH = stellar contract install `
    --wasm $TOKEN_WASM `
    --source $ADMIN_IDENTITY `
    --network $NETWORK

Write-Host "✅ Token WASM instalado: $TOKEN_WASM_HASH" -ForegroundColor Green

Write-Host "Desplegando token..."
$TOKEN_CONTRACT_ID = stellar contract deploy `
    --wasm-hash $TOKEN_WASM_HASH `
    --source $ADMIN_IDENTITY `
    --network $NETWORK

Write-Host "✅ Token desplegado: $TOKEN_CONTRACT_ID" -ForegroundColor Green
Write-Host ""

# ==============================================================================
# Paso 5: Desplegar Energy Distribution
# ==============================================================================
Write-Host "📤 Paso 5: Desplegando Energy Distribution..." -ForegroundColor Yellow

$DISTRIBUTION_WASM = "target/wasm32v1-none/release/energy_distribution.wasm"

Write-Host "Instalando WASM de distribución..."
$DISTRIBUTION_WASM_HASH = stellar contract install `
    --wasm $DISTRIBUTION_WASM `
    --source $ADMIN_IDENTITY `
    --network $NETWORK

Write-Host "✅ Distribution WASM instalado: $DISTRIBUTION_WASM_HASH" -ForegroundColor Green

Write-Host "Desplegando distribución..."
$DISTRIBUTION_CONTRACT_ID = stellar contract deploy `
    --wasm-hash $DISTRIBUTION_WASM_HASH `
    --source $ADMIN_IDENTITY `
    --network $NETWORK

Write-Host "✅ Distribución desplegada: $DISTRIBUTION_CONTRACT_ID" -ForegroundColor Green
Write-Host ""

# ==============================================================================
# Paso 6: Inicializar Contratos
# ==============================================================================
Write-Host "⚙️ Paso 6: Inicializando contratos..." -ForegroundColor Yellow

# Inicializar Token
Write-Host "Inicializando token HDROP..."
stellar contract invoke `
    --id $TOKEN_CONTRACT_ID `
    --source $ADMIN_IDENTITY `
    --network $NETWORK `
    -- `
    __constructor `
    --admin $ADMIN_ADDRESS `
    --distribution_contract $DISTRIBUTION_CONTRACT_ID `
    --initial_supply 0

Write-Host "✅ Token inicializado" -ForegroundColor Green

# Inicializar Distribution
Write-Host "Inicializando distribución..."
stellar contract invoke `
    --id $DISTRIBUTION_CONTRACT_ID `
    --source $ADMIN_IDENTITY `
    --network $NETWORK `
    -- `
    initialize `
    --admin $ADMIN_ADDRESS `
    --token_contract $TOKEN_CONTRACT_ID `
    --required_approvals 3

Write-Host "✅ Distribución inicializada" -ForegroundColor Green
Write-Host ""

# ==============================================================================
# Paso 7: Configurar Permisos
# ==============================================================================
Write-Host "🔐 Paso 7: Configurando permisos..." -ForegroundColor Yellow

# Otorgar rol de MINTER al contrato de distribución
Write-Host "Otorgando rol de MINTER a distribución..."
stellar contract invoke `
    --id $TOKEN_CONTRACT_ID `
    --source $ADMIN_IDENTITY `
    --network $NETWORK `
    -- `
    grant_minter `
    --new_minter $DISTRIBUTION_CONTRACT_ID

Write-Host "✅ Rol de MINTER otorgado" -ForegroundColor Green
Write-Host ""

# ==============================================================================
# Paso 8: Guardar Configuración
# ==============================================================================
Write-Host "💾 Paso 8: Guardando configuración..." -ForegroundColor Yellow

$config = @"
# ==============================================================================
# BeEnergy - Deployed Contracts Configuration
# ==============================================================================
# Network: Stellar Testnet
# Deployed: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
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
"@

$config | Out-File -FilePath ".env.deployed" -Encoding utf8
Write-Host "✅ Configuración guardada en .env.deployed" -ForegroundColor Green
Write-Host ""

# ==============================================================================
# Resumen Final
# ==============================================================================
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🎉 ¡Deployment Completado Exitosamente!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Resumen:" -ForegroundColor Yellow
Write-Host "  Admin:        $ADMIN_ADDRESS"
Write-Host "  Token (HDROP): $TOKEN_CONTRACT_ID"
Write-Host "  Distribution:  $DISTRIBUTION_CONTRACT_ID"
Write-Host ""
Write-Host "🔗 Exploradores:" -ForegroundColor Yellow
Write-Host "  Token:        https://stellar.expert/explorer/testnet/contract/$TOKEN_CONTRACT_ID"
Write-Host "  Distribution: https://stellar.expert/explorer/testnet/contract/$DISTRIBUTION_CONTRACT_ID"
Write-Host ""
Write-Host "📄 Configuración guardada en: .env.deployed" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Copia las variables de .env.deployed a tu frontend"
Write-Host "  2. Agrega miembros con multi-firma"
Write-Host "  3. Registra generación de energía"
Write-Host "  4. ¡Prueba el sistema!"
Write-Host ""
