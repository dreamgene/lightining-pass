use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct PaymentsResponse {
    #[serde(rename = "_embedded")]
    pub embedded: EmbeddedPayments,
}

#[derive(Debug, Deserialize)]
pub struct EmbeddedPayments {
    pub records: Vec<PaymentRecord>,
}

#[derive(Debug, Deserialize)]
pub struct PaymentRecord {
    pub id: String,
    #[serde(default)]
    pub transaction_hash: String,
    #[serde(default)]
    pub from: String,
    #[serde(default)]
    pub to: String,
    #[serde(default)]
    pub amount: String,
    #[serde(default)]
    pub asset_type: String,
    #[serde(default)]
    pub asset_code: Option<String>,
    #[serde(default)]
    pub transaction_successful: bool,
    #[serde(default)]
    pub created_at: String,
    #[serde(default)]
    pub memo: Option<String>,
    #[serde(default)]
    pub ledger: Option<u32>,
    #[serde(rename = "type", default)]
    pub record_type: String,
}
