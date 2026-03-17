use anyhow::Result;
use ed25519_dalek::SigningKey;
use rand::{distributions::Alphanumeric, Rng};

use access_token::{sign_token, signed_token_to_json, AccessToken};
use qr::{render_ascii_qr, render_png_data_url};
use shared_types::PaymentEvent;

#[derive(Clone)]
pub struct AccessArtifact {
    pub token: String,
    pub qr_png: String,
    pub qr_ascii: String,
    pub tx_hash: String,
}

#[derive(Clone)]
pub struct AccessService {
    signing_key: SigningKey,
}

impl AccessService {
    pub fn new(signing_key: SigningKey) -> Self {
        Self { signing_key }
    }

    pub fn issue_token(
        &self,
        event: &PaymentEvent,
        event_id: &str,
        expires_at: u64,
    ) -> Result<AccessArtifact> {
        let nonce: String = rand::thread_rng()
            .sample_iter(&Alphanumeric)
            .take(16)
            .map(char::from)
            .collect();

        let token = AccessToken::new_stellar(
            1,
            event_id,
            &event.tx_hash,
            &event.source_account,
            &event.amount,
            &event.asset,
            &event.memo,
            event.ledger_sequence,
            expires_at,
            nonce,
        );
        let signed = sign_token(token, &self.signing_key)?;
        let token = signed_token_to_json(&signed)?;
        let qr_png = render_png_data_url(&token, 320)?;
        let qr_ascii = render_ascii_qr(&token)?;

        Ok(AccessArtifact {
            token,
            qr_png,
            qr_ascii,
            tx_hash: event.tx_hash.clone(),
        })
    }
}
