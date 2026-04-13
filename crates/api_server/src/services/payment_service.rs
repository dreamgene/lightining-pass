use std::collections::HashMap;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use anyhow::{anyhow, Result};
use serde_json::Value;
use tokio::sync::RwLock;

use shared_types::{PaymentRequest, PaymentStatusResponse};

use super::access_service::AccessArtifact;

#[derive(Clone, Debug)]
pub struct SessionRecord {
    pub payment_request: PaymentRequest,
    pub event_id: String,
    pub paid: bool,
    pub expires_at: u64,
    pub tx_hash: Option<String>,
    pub access_token: Option<String>,
    pub access_qr_png: Option<String>,
    pub access_qr_ascii: Option<String>,
}

#[derive(Clone)]
pub struct PaymentService {
    sessions: Arc<RwLock<HashMap<String, SessionRecord>>>,
    token_ttl_secs: u64,
}

impl PaymentService {
    pub fn new(token_ttl_secs: u64) -> Self {
        Self {
            sessions: Arc::new(RwLock::new(HashMap::new())),
            token_ttl_secs,
        }
    }

    pub async fn insert_session(
        &self,
        mut payment_request: PaymentRequest,
        request_expiry_secs: u64,
        event_id: String,
    ) -> SessionRecord {
        let now = now_secs();
        payment_request.expires_at = now + request_expiry_secs;

        let record = SessionRecord {
            expires_at: now + self.token_ttl_secs,
            payment_request: payment_request.clone(),
            event_id,
            paid: false,
            tx_hash: None,
            access_token: None,
            access_qr_png: None,
            access_qr_ascii: None,
        };

        let mut sessions = self.sessions.write().await;
        sessions.insert(payment_request.session_id.clone(), record.clone());
        record
    }

    pub async fn get(&self, session_id: &str) -> Option<SessionRecord> {
        let sessions = self.sessions.read().await;
        sessions.get(session_id).cloned()
    }

    pub async fn pending_sessions(&self) -> Vec<SessionRecord> {
        let sessions = self.sessions.read().await;
        sessions
            .values()
            .filter(|record| !record.paid && record.payment_request.expires_at > now_secs())
            .cloned()
            .collect()
    }

    pub async fn mark_paid(&self, session_id: &str, artifact: AccessArtifact) -> Result<()> {
        let mut sessions = self.sessions.write().await;
        let session = sessions
            .get_mut(session_id)
            .ok_or_else(|| anyhow!("unknown session: {session_id}"))?;

        session.paid = true;
        session.tx_hash = Some(artifact.tx_hash);
        session.access_token = Some(artifact.token);
        session.access_qr_png = Some(artifact.qr_png);
        session.access_qr_ascii = Some(artifact.qr_ascii);
        Ok(())
    }

    pub fn to_status_response(&self, session: SessionRecord) -> PaymentStatusResponse {
        let now = now_secs();
        let payment_request = session.payment_request.clone();
        let status = if session.access_token.is_some() {
            "confirmed"
        } else if session.paid || session.tx_hash.is_some() {
            "detected"
        } else if payment_request.expires_at <= now {
            "expired"
        } else {
            "waiting"
        };

        PaymentStatusResponse {
            session_id: payment_request.session_id.clone(),
            status: status.to_string(),
            paid: session.paid,
            request_expires_at: payment_request.expires_at,
            expires_at: session.expires_at,
            payment_request,
            tx_hash: session.tx_hash,
            access_token: session.access_token.map(|token| {
                serde_json::from_str::<Value>(&token).unwrap_or(Value::String(token))
            }),
            access_qr_png: session.access_qr_png,
            access_qr_ascii: session.access_qr_ascii,
        }
    }
}

fn now_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
