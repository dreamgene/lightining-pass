use rand::{distributions::Alphanumeric, Rng};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct AccessToken {
    pub version: u8,
    pub event_id: String,
    #[serde(default)]
    pub payment_hash: String,
    #[serde(default)]
    pub tx_hash: String,
    #[serde(default)]
    pub source: String,
    #[serde(default)]
    pub amount: String,
    #[serde(default)]
    pub asset: String,
    #[serde(default)]
    pub memo: String,
    #[serde(default)]
    pub ledger: u32,
    pub expires_at: u64,
    pub nonce: String,
}

impl AccessToken {
    pub fn new(
        version: u8,
        event_id: impl Into<String>,
        payment_hash: impl Into<String>,
        expires_at: u64,
        nonce: impl Into<String>,
    ) -> Self {
        Self {
            version,
            event_id: event_id.into(),
            payment_hash: payment_hash.into(),
            tx_hash: String::new(),
            source: String::new(),
            amount: String::new(),
            asset: String::new(),
            memo: String::new(),
            ledger: 0,
            expires_at,
            nonce: nonce.into(),
        }
    }

    pub fn new_stellar(
        version: u8,
        event_id: impl Into<String>,
        tx_hash: impl Into<String>,
        source: impl Into<String>,
        amount: impl Into<String>,
        asset: impl Into<String>,
        memo: impl Into<String>,
        ledger: u32,
        expires_at: u64,
        nonce: impl Into<String>,
    ) -> Self {
        Self {
            version,
            event_id: event_id.into(),
            payment_hash: String::new(),
            tx_hash: tx_hash.into(),
            source: source.into(),
            amount: amount.into(),
            asset: asset.into(),
            memo: memo.into(),
            ledger,
            expires_at,
            nonce: nonce.into(),
        }
    }

    pub fn with_random_nonce(
        version: u8,
        event_id: impl Into<String>,
        payment_hash: impl Into<String>,
        expires_at: u64,
    ) -> Self {
        let nonce: String = rand::thread_rng()
            .sample_iter(&Alphanumeric)
            .take(16)
            .map(char::from)
            .collect();

        Self::new(version, event_id, payment_hash, expires_at, nonce)
    }

    pub fn with_random_nonce_stellar(
        version: u8,
        event_id: impl Into<String>,
        tx_hash: impl Into<String>,
        source: impl Into<String>,
        amount: impl Into<String>,
        asset: impl Into<String>,
        memo: impl Into<String>,
        ledger: u32,
        expires_at: u64,
    ) -> Self {
        let nonce: String = rand::thread_rng()
            .sample_iter(&Alphanumeric)
            .take(16)
            .map(char::from)
            .collect();

        Self::new_stellar(
            version, event_id, tx_hash, source, amount, asset, memo, ledger, expires_at, nonce,
        )
    }
}
