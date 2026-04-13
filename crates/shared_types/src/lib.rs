use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CreatePaymentRequest {
    pub amount: String,
    pub asset: String,
    pub event_id: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct PaymentRequest {
    pub session_id: String,
    pub destination: String,
    pub amount: String,
    pub asset: String,
    pub memo: String,
    pub qr_payload: String,
    pub expires_at: u64,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct PaymentEvent {
    pub tx_hash: String,
    pub source_account: String,
    pub destination_account: String,
    pub amount: String,
    pub asset: String,
    pub memo: String,
    pub ledger_sequence: u32,
    pub confirmed_at: u64,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct PaymentStatusResponse {
    pub session_id: String,
    pub status: String,
    pub paid: bool,
    pub request_expires_at: u64,
    pub expires_at: u64,
    pub payment_request: PaymentRequest,
    pub tx_hash: Option<String>,
    pub access_token: Option<Value>,
    pub access_qr_png: Option<String>,
    pub access_qr_ascii: Option<String>,
}
