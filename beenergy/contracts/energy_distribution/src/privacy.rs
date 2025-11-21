//! # Privacy Module - ZK Proof Simulation
//!
//! Este módulo implementa privacidad básica usando commitments (hashes).
//! Para producción, esto debería reemplazarse con ZK-SNARKs reales (Groth16).
//!
//! ## Concepto:
//! - Los usuarios pueden registrar consumo de forma privada
//! - Se usa un "commitment" (hash) en lugar de revelar la cantidad exacta
//! - El contrato verifica que el commitment es válido sin conocer el valor real
//!
//! ## Para Hackathon:
//! Esto demuestra el concepto de privacidad sin implementar circuitos ZK completos.
//!
//! ## Para Producción:
//! Reemplazar con Circom + SnarkJS para ZK proofs reales.

use soroban_sdk::{Bytes, BytesN, Env};

/// Commitment de consumo privado
///
/// En un sistema ZK real, esto sería un proof Groth16.
/// Para la demo, usamos: commitment = SHA256(user_address + consumed_kwh + secret)
pub struct ConsumptionCommitment {
    pub commitment: BytesN<32>,  // Hash del consumo
    pub timestamp: u64,          // Cuándo se registró
}

/// Genera un commitment de consumo
///
/// # Argumentos
/// * `user_data` - Datos del usuario (address + consumed_kwh + secret)
///
/// # Retorna
/// Un commitment (hash SHA256) que oculta la cantidad consumida
pub fn generate_commitment(env: &Env, user_data: &Bytes) -> BytesN<32> {
    // En producción: esto sería un ZK proof (Groth16)
    // Para hackathon: usamos SHA256 como commitment
    env.crypto().sha256(user_data).into()
}

/// Verifica un commitment de consumo
///
/// # Argumentos
/// * `commitment` - El commitment a verificar
/// * `user_data` - Los datos originales (para verificación)
///
/// # Retorna
/// `true` si el commitment es válido, `false` si no
///
/// NOTA: En un sistema ZK real, NO recibiríamos user_data (eso revelaría la info).
/// En su lugar, verificaríamos el proof matemáticamente sin conocer los datos.
pub fn verify_commitment(env: &Env, commitment: &BytesN<32>, user_data: &Bytes) -> bool {
    let computed = generate_commitment(env, user_data);
    commitment == &computed
}

/// Calcula el hash de datos de usuario para commitment
///
/// # Formato de user_data:
/// ```
/// user_address (32 bytes) +
/// consumed_kwh (16 bytes, i128) +
/// secret (32 bytes)
/// = 80 bytes total
/// ```
pub fn hash_consumption_data(
    env: &Env,
    user_address: &BytesN<32>,
    consumed_kwh: i128,
    secret: &BytesN<32>,
) -> Bytes {
    let mut data = Bytes::new(env);

    // Agregar address
    data.append(&user_address.clone().into());

    // Agregar consumed_kwh (convertir i128 a bytes)
    let kwh_bytes = consumed_kwh.to_be_bytes();
    for byte in kwh_bytes.iter() {
        data.push_back(*byte);
    }

    // Agregar secret
    data.append(&secret.clone().into());

    data
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{Bytes, BytesN, Env};

    #[test]
    fn test_generate_commitment() {
        let env = Env::default();

        let user_data = Bytes::from_array(&env, &[1u8; 80]);
        let commitment = generate_commitment(&env, &user_data);

        // Commitment debe ser de 32 bytes
        assert_eq!(commitment.len(), 32);
    }

    #[test]
    fn test_verify_commitment_valid() {
        let env = Env::default();

        let user_data = Bytes::from_array(&env, &[1u8; 80]);
        let commitment = generate_commitment(&env, &user_data);

        // Verificar con los mismos datos debe pasar
        assert!(verify_commitment(&env, &commitment, &user_data));
    }

    #[test]
    fn test_verify_commitment_invalid() {
        let env = Env::default();

        let user_data1 = Bytes::from_array(&env, &[1u8; 80]);
        let user_data2 = Bytes::from_array(&env, &[2u8; 80]);

        let commitment = generate_commitment(&env, &user_data1);

        // Verificar con datos diferentes debe fallar
        assert!(!verify_commitment(&env, &commitment, &user_data2));
    }

    #[test]
    fn test_hash_consumption_data() {
        let env = Env::default();

        let user_address = BytesN::from_array(&env, &[1u8; 32]);
        let consumed_kwh = 100_0000000i128; // 100 kWh
        let secret = BytesN::from_array(&env, &[2u8; 32]);

        let hash = hash_consumption_data(&env, &user_address, consumed_kwh, &secret);

        // El hash debe tener el tamaño correcto
        assert_eq!(hash.len(), 80); // 32 + 16 + 32
    }

    #[test]
    fn test_same_data_same_commitment() {
        let env = Env::default();

        let user_data = Bytes::from_array(&env, &[1u8; 80]);

        let commitment1 = generate_commitment(&env, &user_data);
        let commitment2 = generate_commitment(&env, &user_data);

        // Mismos datos = mismo commitment
        assert_eq!(commitment1, commitment2);
    }

    #[test]
    fn test_different_data_different_commitment() {
        let env = Env::default();

        let user_data1 = Bytes::from_array(&env, &[1u8; 80]);
        let user_data2 = Bytes::from_array(&env, &[2u8; 80]);

        let commitment1 = generate_commitment(&env, &user_data1);
        let commitment2 = generate_commitment(&env, &user_data2);

        // Datos diferentes = commitments diferentes
        assert_ne!(commitment1, commitment2);
    }
}
