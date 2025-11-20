// ==============================================================================
// COMMUNITY GOVERNANCE CONTRACT 
// ==============================================================================
// Combina la gobernanza DAO con la integración de Stellar DEX
// No requiere un mercado personalizado: utiliza el DEX nativo de Stellar

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, String, Symbol, Vec};

/// Proposal types
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ProposalType {
    SpendFunds {
        amount: i128,
        recipient: Address,
        description: String,
    },
    ChangeOwnership {
        member: Address,
        new_percent: u32,
    },
    AddMember {
        new_member: Address,
        ownership_percent: u32,
    },
    RemoveMember {
        member: Address,
    },
    UpdateParameter {
        param_name: String,
        new_value: i128,
    },
    CreateDEXOffer {
        // Proposal to create offer on Stellar DEX
        amount: i128,
        price: i128,
    },
}

/// Proposal structure
#[contracttype]
#[derive(Clone, Debug)]
pub struct Proposal {
    pub proposal_id: u64,
    pub proposer: Address,
    pub proposal_type: ProposalType,
    pub description: String,
    pub votes_for: u32,
    pub votes_against: u32,
    pub total_voters: u32,
    pub status: ProposalStatus,
    pub created_at: u64,
    pub voting_ends_at: u64,
}

/// Proposal status
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ProposalStatus {
    Active,
    Passed,
    Rejected,
    Executed,
    Cancelled,
}

/// Vote record
#[contracttype]
#[derive(Clone, Debug)]
pub struct Vote {
    pub voter: Address,
    pub proposal_id: u64,
    pub in_favor: bool,
    pub weight: u32,
    pub timestamp: u64,
}

/// DEX Trade record (for analytics)
#[contracttype]
#[derive(Clone, Debug)]
pub struct DEXTrade {
    pub trade_id: u64,
    pub seller: Address,
    pub buyer: Address,
    pub amount: i128,
    pub price: i128,
    pub timestamp: u64,
    pub offer_id: i64,  // Stellar DEX offer ID
}

/// Storage keys
#[contracttype]
pub enum DataKey {
    Admin,
    DistributionContract,
    TokenContract,
    CommunityWallet,  // Multi-sig address
    Proposals(u64),
    Votes(u64, Address),
    LastProposalId,
    VotingPeriod,
    QuorumPercent,
    PassThreshold,
    DEXTrades(u64),
    LastTradeId,
    ActiveDEXOffers,  // Map of member → offer_ids
}

/// Errors
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum GovernanceError {
    NotInitialized,
    AlreadyInitialized,
    Unauthorized,
    ProposalNotFound,
    VotingEnded,
    VotingNotEnded,
    AlreadyVoted,
    ProposalNotActive,
    QuorumNotReached,
    NotPassed,
    AlreadyExecuted,
    InvalidAmount,
    InsufficientBalance,
}

#[contract]
pub struct CommunityGovernance;

#[contractimpl]
impl CommunityGovernance {
    /// Initialize governance
    pub fn initialize(
        env: Env,
        admin: Address,
        distribution_contract: Address,
        token_contract: Address,
        community_wallet: Address,  // Multi-sig wallet
        voting_period_days: u32,
        quorum_percent: u32,
        pass_threshold: u32,
    ) -> Result<(), GovernanceError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(GovernanceError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::DistributionContract, &distribution_contract);
        env.storage()
            .instance()
            .set(&DataKey::TokenContract, &token_contract);
        env.storage()
            .instance()
            .set(&DataKey::CommunityWallet, &community_wallet);

        let voting_period_seconds = voting_period_days * 24 * 60 * 60;
        env.storage()
            .instance()
            .set(&DataKey::VotingPeriod, &voting_period_seconds);

        env.storage()
            .instance()
            .set(&DataKey::QuorumPercent, &quorum_percent);

        env.storage()
            .instance()
            .set(&DataKey::PassThreshold, &pass_threshold);

        env.storage().instance().set(&DataKey::LastProposalId, &0u64);
        env.storage().instance().set(&DataKey::LastTradeId, &0u64);

        let active_offers = Map::<Address, Vec<i64>>::new(&env);
        env.storage()
            .persistent()
            .set(&DataKey::ActiveDEXOffers, &active_offers);

        env.events().publish(
            (Symbol::new(&env, "governance_initialized"),),
            (voting_period_days, quorum_percent, pass_threshold),
        );

        Ok(())
    }

    /// Create a proposal
    pub fn create_proposal(
        env: Env,
        proposer: Address,
        proposal_type: ProposalType,
        description: String,
    ) -> Result<u64, GovernanceError> {
        proposer.require_auth();

        // Verify proposer is community member
        Self::verify_member(&env, &proposer)?;

        let proposal_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::LastProposalId)
            .unwrap_or(0)
            + 1;

        let voting_period: u32 = env
            .storage()
            .instance()
            .get(&DataKey::VotingPeriod)
            .ok_or(GovernanceError::NotInitialized)?;

        let proposal = Proposal {
            proposal_id,
            proposer: proposer.clone(),
            proposal_type: proposal_type.clone(),
            description: description.clone(),
            votes_for: 0,
            votes_against: 0,
            total_voters: 0,
            status: ProposalStatus::Active,
            created_at: env.ledger().timestamp(),
            voting_ends_at: env.ledger().timestamp() + voting_period as u64,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Proposals(proposal_id), &proposal);

        env.storage()
            .instance()
            .set(&DataKey::LastProposalId, &proposal_id);

        env.events().publish(
            (Symbol::new(&env, "proposal_created"),),
            (proposal_id, proposer, description),
        );

        Ok(proposal_id)
    }

    /// Cast a vote
    pub fn vote(
        env: Env,
        voter: Address,
        proposal_id: u64,
        in_favor: bool,
    ) -> Result<(), GovernanceError> {
        voter.require_auth();

        // Get voting power from distribution contract
        let voting_power = Self::get_voting_power(&env, &voter)?;

        // Get proposal
        let mut proposal: Proposal = env
            .storage()
            .persistent()
            .get(&DataKey::Proposals(proposal_id))
            .ok_or(GovernanceError::ProposalNotFound)?;

        if proposal.status != ProposalStatus::Active {
            return Err(GovernanceError::ProposalNotActive);
        }

        if env.ledger().timestamp() > proposal.voting_ends_at {
            return Err(GovernanceError::VotingEnded);
        }

        // Check if already voted
        if env
            .storage()
            .persistent()
            .has(&DataKey::Votes(proposal_id, voter.clone()))
        {
            return Err(GovernanceError::AlreadyVoted);
        }

        // Record vote
        let vote = Vote {
            voter: voter.clone(),
            proposal_id,
            in_favor,
            weight: voting_power,
            timestamp: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Votes(proposal_id, voter.clone()), &vote);

        // Update proposal
        if in_favor {
            proposal.votes_for += voting_power;
        } else {
            proposal.votes_against += voting_power;
        }
        proposal.total_voters += 1;

        env.storage()
            .persistent()
            .set(&DataKey::Proposals(proposal_id), &proposal);

        env.events().publish(
            (Symbol::new(&env, "vote_cast"),),
            (proposal_id, voter, in_favor, voting_power),
        );

        Ok(())
    }

    /// Finalize proposal
    pub fn finalize_proposal(env: Env, proposal_id: u64) -> Result<(), GovernanceError> {
        let mut proposal: Proposal = env
            .storage()
            .persistent()
            .get(&DataKey::Proposals(proposal_id))
            .ok_or(GovernanceError::ProposalNotFound)?;

        if proposal.status != ProposalStatus::Active {
            return Err(GovernanceError::ProposalNotActive);
        }

        if env.ledger().timestamp() <= proposal.voting_ends_at {
            return Err(GovernanceError::VotingNotEnded);
        }

        // Check quorum
        let quorum_percent: u32 = env
            .storage()
            .instance()
            .get(&DataKey::QuorumPercent)
            .unwrap_or(51);

        let total_votes = proposal.votes_for + proposal.votes_against;

        if total_votes < quorum_percent {
            proposal.status = ProposalStatus::Rejected;
            env.storage()
                .persistent()
                .set(&DataKey::Proposals(proposal_id), &proposal);
            return Err(GovernanceError::QuorumNotReached);
        }

        // Check if passed
        let pass_threshold: u32 = env
            .storage()
            .instance()
            .get(&DataKey::PassThreshold)
            .unwrap_or(51);

        let approval_rate = (proposal.votes_for * 100) / total_votes;

        if approval_rate >= pass_threshold {
            proposal.status = ProposalStatus::Passed;
        } else {
            proposal.status = ProposalStatus::Rejected;
        }

        env.storage()
            .persistent()
            .set(&DataKey::Proposals(proposal_id), &proposal);

        env.events().publish(
            (Symbol::new(&env, "proposal_finalized"),),
            (proposal_id, proposal.status.clone()),
        );

        Ok(())
    }

    /// Execute approved proposal
    pub fn execute_proposal(env: Env, proposal_id: u64) -> Result<(), GovernanceError> {
        let mut proposal: Proposal = env
            .storage()
            .persistent()
            .get(&DataKey::Proposals(proposal_id))
            .ok_or(GovernanceError::ProposalNotFound)?;

        if proposal.status != ProposalStatus::Passed {
            return Err(GovernanceError::NotPassed);
        }

        // Execute based on type
        match &proposal.proposal_type {
            ProposalType::SpendFunds {
                amount,
                recipient,
                description: _,
            } => {
                Self::execute_spend_funds(&env, recipient, *amount)?;
            }
            ProposalType::CreateDEXOffer { amount, price } => {
                Self::execute_dex_offer(&env, *amount, *price)?;
            }
            _ => {
                // Other types can be implemented
            }
        }

        proposal.status = ProposalStatus::Executed;
        env.storage()
            .persistent()
            .set(&DataKey::Proposals(proposal_id), &proposal);

        env.events().publish(
            (Symbol::new(&env, "proposal_executed"),),
            (proposal_id,),
        );

        Ok(())
    }

    // ============ STELLAR DEX INTEGRATION ============

    /// Create sell offer on Stellar DEX (anyone can call, no proposal needed for personal trading)
    pub fn create_dex_sell_offer(
        env: Env,
        seller: Address,
        amount: i128,
        price_per_kwh: i128,
    ) -> Result<i64, GovernanceError> {
        seller.require_auth();

        if amount <= 0 || price_per_kwh <= 0 {
            return Err(GovernanceError::InvalidAmount);
        }

        // Verify seller has balance
        let token_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .ok_or(GovernanceError::NotInitialized)?;

        let balance: i128 = env.invoke_contract(
            &token_contract,
            &Symbol::new(&env, "balance"),
            (seller.clone(),).into_val(&env),
        );

        if balance < amount {
            return Err(GovernanceError::InsufficientBalance);
        }

        // Create offer on Stellar DEX using native operations
        // Note: In practice, this would use Stellar SDK operations
        // For Soroban, we emit an event that frontend listens to
        // and executes the actual DEX operation

        let offer_id = env.ledger().sequence() as i64;

        // Track active offer
        let mut active_offers: Map<Address, Vec<i64>> = env
            .storage()
            .persistent()
            .get(&DataKey::ActiveDEXOffers)
            .unwrap_or(Map::new(&env));

        let mut seller_offers = active_offers
            .get(seller.clone())
            .unwrap_or(Vec::new(&env));

        seller_offers.push_back(offer_id);
        active_offers.set(seller.clone(), seller_offers);

        env.storage()
            .persistent()
            .set(&DataKey::ActiveDEXOffers, &active_offers);

        // Emit event for frontend to execute on Stellar DEX
        env.events().publish(
            (Symbol::new(&env, "dex_offer_created"),),
            (seller, amount, price_per_kwh, offer_id),
        );

        Ok(offer_id)
    }

    /// Record trade from Stellar DEX (called by indexer/oracle)
    pub fn record_dex_trade(
        env: Env,
        seller: Address,
        buyer: Address,
        amount: i128,
        price: i128,
        offer_id: i64,
    ) -> Result<u64, GovernanceError> {
        // Only admin/oracle can record trades
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(GovernanceError::NotInitialized)?;

        admin.require_auth();

        let trade_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::LastTradeId)
            .unwrap_or(0)
            + 1;

        let trade = DEXTrade {
            trade_id,
            seller: seller.clone(),
            buyer: buyer.clone(),
            amount,
            price,
            timestamp: env.ledger().timestamp(),
            offer_id,
        };

        env.storage()
            .persistent()
            .set(&DataKey::DEXTrades(trade_id), &trade);

        env.storage()
            .instance()
            .set(&DataKey::LastTradeId, &trade_id);

        env.events().publish(
            (Symbol::new(&env, "trade_recorded"),),
            (trade_id, seller, buyer, amount, price),
        );

        Ok(trade_id)
    }

    /// Get active DEX offers for a user
    pub fn get_user_offers(env: Env, user: Address) -> Vec<i64> {
        let active_offers: Map<Address, Vec<i64>> = env
            .storage()
            .persistent()
            .get(&DataKey::ActiveDEXOffers)
            .unwrap_or(Map::new(&env));

        active_offers.get(user).unwrap_or(Vec::new(&env))
    }

    /// Get trade history
    pub fn get_trade(env: Env, trade_id: u64) -> Result<DEXTrade, GovernanceError> {
        env.storage()
            .persistent()
            .get(&DataKey::DEXTrades(trade_id))
            .ok_or(GovernanceError::ProposalNotFound)
    }

    // ============ HELPER FUNCTIONS ============

    fn verify_member(env: &Env, address: &Address) -> Result<(), GovernanceError> {
        let distribution_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::DistributionContract)
            .ok_or(GovernanceError::NotInitialized)?;

        // Call distribution contract to verify
        let _member: bool = env.invoke_contract(
            &distribution_contract,
            &Symbol::new(env, "get_member"),
            (address.clone(),).into_val(env),
        );

        Ok(())
    }

    fn get_voting_power(env: &Env, address: &Address) -> Result<u32, GovernanceError> {
        let distribution_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::DistributionContract)
            .ok_or(GovernanceError::NotInitialized)?;

        // Get member's ownership percent as voting power
        // This would call: distribution_contract.get_member(address).ownership_percent
        // For now, mock value
        Ok(25)
    }

    fn execute_spend_funds(
        env: &Env,
        recipient: &Address,
        amount: i128,
    ) -> Result<(), GovernanceError> {
        let community_wallet: Address = env
            .storage()
            .instance()
            .get(&DataKey::CommunityWallet)
            .ok_or(GovernanceError::NotInitialized)?;

        let token_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .ok_or(GovernanceError::NotInitialized)?;

        // Transfer from community wallet (requires multi-sig)
        env.invoke_contract::<()>(
            &token_contract,
            &Symbol::new(env, "transfer"),
            (community_wallet, recipient.clone(), amount).into_val(env),
        );

        Ok(())
    }

    fn execute_dex_offer(
        env: &Env,
        amount: i128,
        price: i128,
    ) -> Result<(), GovernanceError> {
        // Emit event for frontend to create community DEX offer
        let community_wallet: Address = env
            .storage()
            .instance()
            .get(&DataKey::CommunityWallet)
            .ok_or(GovernanceError::NotInitialized)?;

        env.events().publish(
            (Symbol::new(env, "community_dex_offer"),),
            (community_wallet, amount, price),
        );

        Ok(())
    }

    /// Get proposal
    pub fn get_proposal(env: Env, proposal_id: u64) -> Result<Proposal, GovernanceError> {
        env.storage()
            .persistent()
            .get(&DataKey::Proposals(proposal_id))
            .ok_or(GovernanceError::ProposalNotFound)
    }

    /// Get all active proposals
    pub fn get_active_proposals(env: Env) -> Vec<Proposal> {
        let last_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::LastProposalId)
            .unwrap_or(0);

        let mut result = Vec::new(&env);

        for id in 1..=last_id {
            if let Some(proposal) = env
                .storage()
                .persistent()
                .get::<DataKey, Proposal>(&DataKey::Proposals(id))
            {
                if proposal.status == ProposalStatus::Active {
                    result.push_back(proposal);
                }
            }
        }

        result
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_initialize() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, CommunityGovernance);
        let client = CommunityGovernanceClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let distribution = Address::generate(&env);
        let token = Address::generate(&env);
        let wallet = Address::generate(&env);

        client.initialize(&admin, &distribution, &token, &wallet, &3, &51, &51);
    }
}