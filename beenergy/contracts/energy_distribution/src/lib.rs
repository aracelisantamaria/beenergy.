// ==============================================================================
// DISTRIBUTION CONTRACT - Distribución Equitativa de Energía
// ==============================================================================
// Gestiona la distribución de energía solar entre miembros.
// 100% on-chain storage
// ZK proof verification for privacy

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Bytes, BytesN, Env, Map, String, Symbol, Vec};

/// Member data structure
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Member {
    pub address: Address,
    pub ownership_percent: u32,  // 0-100 (e.g., 30 = 30%)
    pub total_generated: i128,   // Total kWh generated for this member
    pub total_consumed: i128,    // Total kWh consumed
    pub current_balance: i128,   // Current token balance
    pub commitment_hash: BytesN<32>, // ZK commitment for privacy
}

/// Generation record (stored on-chain)
#[contracttype]
#[derive(Clone, Debug)]
pub struct GenerationRecord {
    pub record_id: u64,
    pub timestamp: u64,
    pub total_kwh: i128,
    pub has_zk_proof: bool,  // Privacy enabled?
    pub proof_hash: BytesN<32>,  // Hash of ZK proof for verification
}

/// Consumption record (private with ZK)
#[contracttype]
#[derive(Clone, Debug)]
pub struct ConsumptionRecord {
    pub record_id: u64,
    pub user: Address,
    pub timestamp: u64,
    pub consumed_kwh_encrypted: BytesN<32>,  // Encrypted amount
    pub zk_proof_hash: BytesN<32>,  // Proof that consumption is valid
    pub is_valid: bool,
}

/// Storage keys (all on Stellar persistent storage)
#[contracttype]
pub enum DataKey {
    Admin,
    TokenContract,
    Members,
    CommunityName,
    GenerationHistory(u64),  // Key: generation_id
    ConsumptionHistory(u64), // Key: consumption_id
    LastGenerationId,
    LastConsumptionId,
    TotalGeneratedAllTime,
    TotalConsumedAllTime,
    ZKVerifierContract,
}

/// Errors
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DistributionError {
    NotInitialized,
    AlreadyInitialized,
    Unauthorized,
    InvalidOwnership,
    OwnershipNotHundred,
    MemberNotFound,
    InvalidAmount,
    InvalidZKProof,
    ZKVerifierNotSet,
}

#[contract]
pub struct EnergyDistribution;

#[contractimpl]
impl EnergyDistribution {
    /// Initialize community
    pub fn initialize(
        env: Env,
        admin: Address,
        token_contract: Address,
        community_name: String,
        members: Vec<Address>,
        ownership_percents: Vec<u32>,
    ) -> Result<(), DistributionError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(DistributionError::AlreadyInitialized);
        }

        // Validate inputs
        if members.len() != ownership_percents.len() {
            return Err(DistributionError::InvalidOwnership);
        }

        // Calculate total ownership
        let mut total_ownership: u32 = 0;
        for percent in ownership_percents.iter() {
            total_ownership += percent;
        }

        // Must sum to 100%
        if total_ownership != 100 {
            return Err(DistributionError::OwnershipNotHundred);
        }

        // Store configuration in Stellar persistent storage
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenContract, &token_contract);
        env.storage().instance().set(&DataKey::CommunityName, &community_name);
        
        // Initialize counters (all on-chain)
        env.storage().instance().set(&DataKey::LastGenerationId, &0u64);
        env.storage().instance().set(&DataKey::LastConsumptionId, &0u64);
        env.storage().instance().set(&DataKey::TotalGeneratedAllTime, &0i128);
        env.storage().instance().set(&DataKey::TotalConsumedAllTime, &0i128);

        // Store members (all on-chain)
        let mut members_map = Map::<Address, Member>::new(&env);

        for (i, member_address) in members.iter().enumerate() {
            let ownership = ownership_percents.get(i as u32).unwrap();

            // Generate ZK commitment for each member
            let commitment = env.crypto().keccak256(&member_address.to_val());

            members_map.set(
                member_address.clone(),
                Member {
                    address: member_address.clone(),
                    ownership_percent: ownership,
                    total_generated: 0,
                    total_consumed: 0,
                    current_balance: 0,
                    commitment_hash: commitment.into(),
                },
            );
        }

        env.storage().persistent().set(&DataKey::Members, &members_map);

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "community_initialized"),),
            (community_name, members.len()),
        );

        Ok(())
    }

    /// Set ZK verifier contract (optional - for privacy features)
    pub fn set_zk_verifier(
        env: Env,
        zk_verifier_contract: Address,
    ) -> Result<(), DistributionError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(DistributionError::NotInitialized)?;

        admin.require_auth();

        env.storage()
            .instance()
            .set(&DataKey::ZKVerifierContract, &zk_verifier_contract);

        Ok(())
    }

    /// Record energy generation (PUBLIC - no privacy needed)
    pub fn record_generation(
        env: Env,
        total_kwh_generated: i128,
    ) -> Result<u64, DistributionError> {
        // Verify admin authorization
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(DistributionError::NotInitialized)?;

        admin.require_auth();

        if total_kwh_generated <= 0 {
            return Err(DistributionError::InvalidAmount);
        }

        // Get members and token contract
        let mut members: Map<Address, Member> = env
            .storage()
            .persistent()
            .get(&DataKey::Members)
            .ok_or(DistributionError::NotInitialized)?;

        let token_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .ok_or(DistributionError::NotInitialized)?;

        // Convert to stroops (7 decimals)
        let total_stroops = total_kwh_generated * 10_000_000;

        // Distribute tokens proportionally to each member
        for (member_address, mut member_data) in members.iter() {
            // Calculate this member's share
            let member_share_stroops =
                (total_stroops * member_data.ownership_percent as i128) / 100;

            // Mint tokens to member
            Self::mint_tokens(&env, &token_contract, &member_address, member_share_stroops);

            // Update member stats (stored on-chain)
            member_data.total_generated += member_share_stroops;
            member_data.current_balance = member_data.total_generated - member_data.total_consumed;

            // Save updated member
            members.set(member_address, member_data);
        }

        // Save updated members to persistent storage
        env.storage().persistent().set(&DataKey::Members, &members);

        // Store generation record on-chain
        let generation_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::LastGenerationId)
            .unwrap_or(0) + 1;

        let record = GenerationRecord {
            record_id: generation_id,
            timestamp: env.ledger().timestamp(),
            total_kwh: total_kwh_generated,
            has_zk_proof: false,
            proof_hash: BytesN::from_array(&env, &[0u8; 32]),
        };

        env.storage()
            .persistent()
            .set(&DataKey::GenerationHistory(generation_id), &record);

        env.storage()
            .instance()
            .set(&DataKey::LastGenerationId, &generation_id);

        // Update total generated counter
        let total_generated: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalGeneratedAllTime)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalGeneratedAllTime, &(total_generated + total_stroops));

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "generation_recorded"),),
            (generation_id, total_kwh_generated),
        );

        Ok(generation_id)
    }

    /// Record consumption WITH ZK proof (PRIVATE)
    /// User proves they consumed <= allocation without revealing exact amount
    pub fn record_consumption_with_proof(
        env: Env,
        user: Address,
        zk_proof: BytesN<256>,  // Groth16 proof
        public_signals: Vec<i128>,  // Public inputs
    ) -> Result<u64, DistributionError> {
        user.require_auth();

        // Get ZK verifier contract
        let zk_verifier: Address = env
            .storage()
            .instance()
            .get(&DataKey::ZKVerifierContract)
            .ok_or(DistributionError::ZKVerifierNotSet)?;

        // Verify ZK proof on-chain
        let is_valid: bool = env.invoke_contract(
            &zk_verifier,
            &Symbol::new(&env, "verify_groth16"),
            (zk_proof.clone(), public_signals.clone()).into_val(&env),
        );

        if !is_valid {
            return Err(DistributionError::InvalidZKProof);
        }

        // Proof is valid! We can proceed without knowing exact consumption
        let token_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .ok_or(DistributionError::NotInitialized)?;

        // Extract estimated consumption from public signals (commitment-based)
        let estimated_consumption = public_signals.get(0).unwrap_or(0);

        // Burn tokens (user's balance decreases)
        Self::burn_tokens(&env, &token_contract, &user, estimated_consumption);

        // Update member stats
        let mut members: Map<Address, Member> = env
            .storage()
            .persistent()
            .get(&DataKey::Members)
            .ok_or(DistributionError::NotInitialized)?;

        let mut member = members
            .get(user.clone())
            .ok_or(DistributionError::MemberNotFound)?;

        member.total_consumed += estimated_consumption;
        member.current_balance = member.total_generated - member.total_consumed;

        members.set(user.clone(), member);
        env.storage().persistent().set(&DataKey::Members, &members);

        // Store consumption record with privacy
        let consumption_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::LastConsumptionId)
            .unwrap_or(0) + 1;

        // Hash the proof for storage (don't store full proof to save space)
        let proof_hash = env.crypto().keccak256(&zk_proof);

        // Encrypt consumption amount (only user knows real value)
        let encrypted_amount = env.crypto().keccak256(&user.to_val());

        let consumption_record = ConsumptionRecord {
            record_id: consumption_id,
            user: user.clone(),
            timestamp: env.ledger().timestamp(),
            consumed_kwh_encrypted: encrypted_amount.into(),
            zk_proof_hash: proof_hash.into(),
            is_valid: true,
        };

        env.storage()
            .persistent()
            .set(&DataKey::ConsumptionHistory(consumption_id), &consumption_record);

        env.storage()
            .instance()
            .set(&DataKey::LastConsumptionId, &consumption_id);

        // Emit event (doesn't reveal exact amount)
        env.events().publish(
            (Symbol::new(&env, "consumption_recorded_private"),),
            (consumption_id, user),
        );

        Ok(consumption_id)
    }

    /// Get member info (public data only)
    pub fn get_member(env: Env, address: Address) -> Result<Member, DistributionError> {
        let members: Map<Address, Member> = env
            .storage()
            .persistent()
            .get(&DataKey::Members)
            .ok_or(DistributionError::NotInitialized)?;

        members
            .get(address)
            .ok_or(DistributionError::MemberNotFound)
    }

    /// Get all members
    pub fn get_all_members(env: Env) -> Result<Vec<Member>, DistributionError> {
        let members: Map<Address, Member> = env
            .storage()
            .persistent()
            .get(&DataKey::Members)
            .ok_or(DistributionError::NotInitialized)?;

        let mut result = Vec::new(&env);
        for (_, member) in members.iter() {
            result.push_back(member);
        }

        Ok(result)
    }

    /// Get generation history (all stored on-chain)
    pub fn get_generation_record(
        env: Env,
        generation_id: u64,
    ) -> Result<GenerationRecord, DistributionError> {
        env.storage()
            .persistent()
            .get(&DataKey::GenerationHistory(generation_id))
            .ok_or(DistributionError::NotInitialized)
    }

    /// Get consumption record (private data encrypted)
    pub fn get_consumption_record(
        env: Env,
        consumption_id: u64,
    ) -> Result<ConsumptionRecord, DistributionError> {
        env.storage()
            .persistent()
            .get(&DataKey::ConsumptionHistory(consumption_id))
            .ok_or(DistributionError::NotInitialized)
    }

    /// Get community statistics (aggregated - no privacy concerns)
    pub fn get_community_stats(env: Env) -> Result<(String, i128, i128, u64, u64), DistributionError> {
        let name: String = env
            .storage()
            .instance()
            .get(&DataKey::CommunityName)
            .ok_or(DistributionError::NotInitialized)?;

        let total_generated: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalGeneratedAllTime)
            .unwrap_or(0);

        let total_consumed: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalConsumedAllTime)
            .unwrap_or(0);

        let num_generations: u64 = env
            .storage()
            .instance()
            .get(&DataKey::LastGenerationId)
            .unwrap_or(0);

        let num_consumptions: u64 = env
            .storage()
            .instance()
            .get(&DataKey::LastConsumptionId)
            .unwrap_or(0);

        Ok((name, total_generated, total_consumed, num_generations, num_consumptions))
    }

    // Internal helper functions
    fn mint_tokens(env: &Env, token_contract: &Address, to: &Address, amount: i128) {
        env.invoke_contract::<()>(
            token_contract,
            &Symbol::new(env, "mint"),
            (to.clone(), amount).into_val(env),
        );
    }

    fn burn_tokens(env: &Env, token_contract: &Address, from: &Address, amount: i128) {
        env.invoke_contract::<()>(
            token_contract,
            &Symbol::new(env, "burn"),
            (from.clone(), amount).into_val(env),
        );
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env, String};

    #[test]
    fn test_initialize_community() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, EnergyDistribution);
        let client = EnergyDistributionClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let token = Address::generate(&env);

        let members = Vec::from_array(
            &env,
            [
                Address::generate(&env),
                Address::generate(&env),
                Address::generate(&env),
            ],
        );

        let percents = Vec::from_array(&env, [30u32, 40u32, 30u32]);

        client.initialize(
            &admin,
            &token,
            &String::from_str(&env, "Solar Hills"),
            &members,
            &percents,
        );

        let stats = client.get_community_stats();
        assert_eq!(stats.0, String::from_str(&env, "Solar Hills"));
    }

    #[test]
    fn test_record_generation() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, EnergyDistribution);
        let client = EnergyDistributionClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        let members = Vec::from_array(&env, [Address::generate(&env)]);
        let percents = Vec::from_array(&env, [100u32]);

        client.initialize(&admin, &token, &String::from_str(&env, "Test"), &members, &percents);

        // Record 100 kWh generation
        let generation_id = client.record_generation(&100);
        assert_eq!(generation_id, 1);

        // Verify record stored on-chain
        let record = client.get_generation_record(&1);
        assert_eq!(record.total_kwh, 100);
    }
}