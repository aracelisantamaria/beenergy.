// ==============================================================================
// ENERGY TOKEN 
// ==============================================================================
// Token fungible que representa kWh de energía renovable.
// 
// 

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol};
use stellar_macros::default_impl;
use stellar_tokens::fungible::{Base, FungibleToken};

/// Main token contract
#[contract]
pub struct EnergyToken;

/// Storage keys
#[contracttype]
pub enum DataKey {
    Admin,
    DistributionContract,
    MarketContract,
    TotalMinted,
    TotalBurned,
}

/// Custom errors
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum TokenError {
    NotInitialized,
    AlreadyInitialized,
    Unauthorized,
    InvalidAmount,
    InsufficientBalance,
}

#[contractimpl]
impl EnergyToken {
    /// Initialize the token
    /// Only called once during deployment
    pub fn initialize(
        env: Env,
        admin: Address,
        distribution_contract: Address,
    ) -> Result<(), TokenError> {
        // Check if already initialized
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(TokenError::AlreadyInitialized);
        }

        // Set token metadata (7 decimals = standard Stellar precision)
        Base::set_metadata(
            &env,
            7,
            String::from_str(&env, "BeEnergy Token"),
            String::from_str(&env, "ENERGY"),
        );

        // Store admin and authorized contracts
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::DistributionContract, &distribution_contract);

        // Initialize counters
        env.storage().instance().set(&DataKey::TotalMinted, &0i128);
        env.storage().instance().set(&DataKey::TotalBurned, &0i128);

        // Emit initialization event
        env.events().publish(
            (Symbol::new(&env, "initialized"),),
            (admin.clone(), distribution_contract.clone()),
        );

        Ok(())
    }

    /// Mint tokens when energy is generated
    /// Can only be called by the distribution contract
    pub fn mint(env: Env, to: Address, amount: i128) -> Result<(), TokenError> {
        // Verify caller is the authorized distribution contract
        let distribution_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::DistributionContract)
            .ok_or(TokenError::NotInitialized)?;

        distribution_contract.require_auth();

        if amount <= 0 {
            return Err(TokenError::InvalidAmount);
        }

        // Mint using OpenZeppelin base
        Base::mint(&env, &to, amount);

        // Update total minted counter
        let total_minted: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalMinted)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalMinted, &(total_minted + amount));

        // Emit mint event
        env.events().publish(
            (Symbol::new(&env, "energy_minted"),),
            (to.clone(), amount),
        );

        Ok(())
    }

    /// Burn tokens when energy is consumed
    /// User must authorize this transaction
    pub fn burn(env: Env, from: Address, amount: i128) -> Result<(), TokenError> {
        from.require_auth();

        if amount <= 0 {
            return Err(TokenError::InvalidAmount);
        }

        // Check sufficient balance
        let balance = Base::balance(&env, &from);
        if balance < amount {
            return Err(TokenError::InsufficientBalance);
        }

        // Burn using OpenZeppelin base
        Base::burn(&env, &from, amount);

        // Update total burned counter
        let total_burned: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalBurned)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalBurned, &(total_burned + amount));

        // Emit burn event
        env.events().publish(
            (Symbol::new(&env, "energy_consumed"),),
            (from.clone(), amount),
        );

        Ok(())
    }

    /// Get balance of an address
    pub fn balance(env: Env, address: Address) -> i128 {
        Base::balance(&env, &address)
    }

    /// Get total supply
    pub fn total_supply(env: Env) -> i128 {
        let total_minted: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalMinted)
            .unwrap_or(0);
        let total_burned: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalBurned)
            .unwrap_or(0);
        total_minted - total_burned
    }

    /// Update the market contract address (for future integrations)
    pub fn set_market_contract(env: Env, market_contract: Address) -> Result<(), TokenError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(TokenError::NotInitialized)?;

        admin.require_auth();

        env.storage()
            .instance()
            .set(&DataKey::MarketContract, &market_contract);

        Ok(())
    }

    /// Get token metadata
    pub fn name(env: Env) -> String {
        String::from_str(&env, "BeEnergy Token")
    }

    pub fn symbol(env: Env) -> String {
        String::from_str(&env, "ENERGY")
    }

    pub fn decimals(env: Env) -> u32 {
        7
    }
}

/// Implement all standard FungibleToken functions automatically
/// This includes: transfer, transfer_from, approve, allowance, etc.
#[default_impl]
#[contractimpl]
impl FungibleToken for EnergyToken {
    type ContractType = Base;
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_initialization() {
        let env = Env::default();
        let contract_id = env.register_contract(None, EnergyToken);
        let client = EnergyTokenClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let distribution = Address::generate(&env);

        client.initialize(&admin, &distribution);

        assert_eq!(client.name(), String::from_str(&env, "BeEnergy Token"));
        assert_eq!(client.symbol(), String::from_str(&env, "ENERGY"));
        assert_eq!(client.decimals(), 7);
        assert_eq!(client.total_supply(), 0);
    }

    #[test]
    fn test_mint_tokens() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, EnergyToken);
        let client = EnergyTokenClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let distribution = Address::generate(&env);
        let user = Address::generate(&env);

        client.initialize(&admin, &distribution);

        // Mint 100 kWh (with 7 decimals)
        client.mint(&user, &100_0000000);

        assert_eq!(client.balance(&user), 100_0000000);
        assert_eq!(client.total_supply(), 100_0000000);
    }

    #[test]
    fn test_burn_tokens() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, EnergyToken);
        let client = EnergyTokenClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let distribution = Address::generate(&env);
        let user = Address::generate(&env);

        client.initialize(&admin, &distribution);
        client.mint(&user, &100_0000000);

        // Burn 30 kWh
        client.burn(&user, &30_0000000);

        assert_eq!(client.balance(&user), 70_0000000);
        assert_eq!(client.total_supply(), 70_0000000);
    }

    #[test]
    fn test_transfer() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, EnergyToken);
        let client = EnergyTokenClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let distribution = Address::generate(&env);
        let user_a = Address::generate(&env);
        let user_b = Address::generate(&env);

        client.initialize(&admin, &distribution);
        client.mint(&user_a, &50_0000000);

        // User A transfers 20 kWh to User B (P2P trade)
        client.transfer(&user_a, &user_b, &20_0000000);

        assert_eq!(client.balance(&user_a), 30_0000000);
        assert_eq!(client.balance(&user_b), 20_0000000);
    }

    #[test]
    #[should_panic(expected = "InsufficientBalance")]
    fn test_burn_insufficient_balance() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, EnergyToken);
        let client = EnergyTokenClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let distribution = Address::generate(&env);
        let user = Address::generate(&env);

        client.initialize(&admin, &distribution);
        client.mint(&user, &10_0000000);

        // Try to burn more than balance
        client.burn(&user, &50_0000000);
    }
}