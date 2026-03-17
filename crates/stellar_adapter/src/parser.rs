use anyhow::Result;
use shared_types::PaymentEvent;

use crate::types::PaymentRecord;

pub fn parse_payment(record: &PaymentRecord) -> Result<PaymentEvent> {
    let asset = match record.asset_type.as_str() {
        "native" => "XLM".to_string(),
        _ => record
            .asset_code
            .clone()
            .unwrap_or_else(|| record.asset_type.clone()),
    };

    Ok(PaymentEvent {
        tx_hash: if record.transaction_hash.is_empty() {
            record.id.clone()
        } else {
            record.transaction_hash.clone()
        },
        source_account: record.from.clone(),
        destination_account: record.to.clone(),
        amount: record.amount.clone(),
        asset,
        memo: record.memo.clone().unwrap_or_default(),
        ledger_sequence: record.ledger.unwrap_or_default(),
        confirmed_at: 0,
    })
}
