# BeEnergy - Deploy to Stellar Testnet
# Simple version without special characters

Write-Host "BeEnergy - Deployment a Stellar Testnet"
Write-Host "========================================"
Write-Host ""

# Config
$NETWORK = "testnet"
$ADMIN_IDENTITY = "beeenergy-admin"

# Step 1: Setup identity
Write-Host "Step 1: Setting up identity..."
stellar keys generate --global $ADMIN_IDENTITY --network $NETWORK --regen 2>$null

$ADMIN_ADDRESS = stellar keys address $ADMIN_IDENTITY
Write-Host "Admin Address: $ADMIN_ADDRESS"
Write-Host ""

# Step 2: Fund account
Write-Host "Step 2: Funding account with Friendbot..."
try {
    Invoke-WebRequest -Uri "https://friendbot.stellar.org/?addr=$ADMIN_ADDRESS" -Method Get | Out-Null
    Write-Host "Account funded successfully"
} catch {
    Write-Host "Error funding account. Fund manually at: https://laboratory.stellar.org/#account-creator?network=test"
}
Write-Host ""
Start-Sleep -Seconds 3

# Step 3: Build contracts
Write-Host "Step 3: Building contracts..."
cargo +1.89.0 build --package energy_token --target wasm32v1-none --release --quiet
Write-Host "Token built"
cargo +1.89.0 build --package energy-distribution --target wasm32v1-none --release --quiet
Write-Host "Distribution built"
Write-Host ""

# Step 4: Deploy Token
Write-Host "Step 4: Deploying Token..."
$TOKEN_WASM = "target/wasm32v1-none/release/energy_token.wasm"
$TOKEN_WASM_HASH = stellar contract install --wasm $TOKEN_WASM --source $ADMIN_IDENTITY --network $NETWORK
Write-Host "Token WASM Hash: $TOKEN_WASM_HASH"

$TOKEN_CONTRACT_ID = stellar contract deploy --wasm-hash $TOKEN_WASM_HASH --source $ADMIN_IDENTITY --network $NETWORK
Write-Host "Token Contract ID: $TOKEN_CONTRACT_ID"
Write-Host ""

# Step 5: Deploy Distribution
Write-Host "Step 5: Deploying Distribution..."
$DISTRIBUTION_WASM = "target/wasm32v1-none/release/energy_distribution.wasm"
$DISTRIBUTION_WASM_HASH = stellar contract install --wasm $DISTRIBUTION_WASM --source $ADMIN_IDENTITY --network $NETWORK
Write-Host "Distribution WASM Hash: $DISTRIBUTION_WASM_HASH"

$DISTRIBUTION_CONTRACT_ID = stellar contract deploy --wasm-hash $DISTRIBUTION_WASM_HASH --source $ADMIN_IDENTITY --network $NETWORK
Write-Host "Distribution Contract ID: $DISTRIBUTION_CONTRACT_ID"
Write-Host ""

# Step 6: Initialize contracts
Write-Host "Step 6: Initializing contracts..."
stellar contract invoke --id $TOKEN_CONTRACT_ID --source $ADMIN_IDENTITY --network $NETWORK -- __constructor --admin $ADMIN_ADDRESS --distribution_contract $DISTRIBUTION_CONTRACT_ID --initial_supply 0
Write-Host "Token initialized"

stellar contract invoke --id $DISTRIBUTION_CONTRACT_ID --source $ADMIN_IDENTITY --network $NETWORK -- initialize --admin $ADMIN_ADDRESS --token_contract $TOKEN_CONTRACT_ID --required_approvals 3
Write-Host "Distribution initialized"
Write-Host ""

# Step 7: Grant permissions
Write-Host "Step 7: Granting MINTER role..."
stellar contract invoke --id $TOKEN_CONTRACT_ID --source $ADMIN_IDENTITY --network $NETWORK -- grant_minter --new_minter $DISTRIBUTION_CONTRACT_ID
Write-Host "MINTER role granted"
Write-Host ""

# Step 8: Save config
Write-Host "Step 8: Saving configuration..."
@"
# BeEnergy - Deployed Contracts
# Date: $(Get-Date)

ADMIN_ADDRESS=$ADMIN_ADDRESS
TOKEN_CONTRACT_ID=$TOKEN_CONTRACT_ID
DISTRIBUTION_CONTRACT_ID=$DISTRIBUTION_CONTRACT_ID

# Frontend .env
NEXT_PUBLIC_NETWORK=$NETWORK
NEXT_PUBLIC_TOKEN_CONTRACT_ID=$TOKEN_CONTRACT_ID
NEXT_PUBLIC_DISTRIBUTION_CONTRACT_ID=$DISTRIBUTION_CONTRACT_ID
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org

# Explorers
# Token: https://stellar.expert/explorer/testnet/contract/$TOKEN_CONTRACT_ID
# Distribution: https://stellar.expert/explorer/testnet/contract/$DISTRIBUTION_CONTRACT_ID
"@ | Out-File ".env.deployed"

Write-Host "Config saved to .env.deployed"
Write-Host ""

# Summary
Write-Host "========================================"
Write-Host "Deployment Complete!"
Write-Host "========================================"
Write-Host "Admin: $ADMIN_ADDRESS"
Write-Host "Token: $TOKEN_CONTRACT_ID"
Write-Host "Distribution: $DISTRIBUTION_CONTRACT_ID"
Write-Host ""
Write-Host "View contracts:"
Write-Host "https://stellar.expert/explorer/testnet/contract/$TOKEN_CONTRACT_ID"
Write-Host "https://stellar.expert/explorer/testnet/contract/$DISTRIBUTION_CONTRACT_ID"
