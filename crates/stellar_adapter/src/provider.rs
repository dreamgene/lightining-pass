use anyhow::Result;
use async_trait::async_trait;
use payment_core::PaymentProvider;
use shared_types::{CreatePaymentRequest, PaymentEvent, PaymentRequest};

use crate::client::HorizonClient;
use crate::memo::generate_memo;
use crate::parser::parse_payment;

#[derive(Clone, Debug)]
pub struct StellarConfig {
    pub horizon_url: String,
    pub destination_address: String,
}

#[derive(Clone)]
pub struct StellarProvider {
    config: StellarConfig,
    client: HorizonClient,
}

impl StellarProvider {
    pub fn new(config: StellarConfig) -> Self {
        let client = HorizonClient::new(config.horizon_url.clone());
        Self { config, client }
    }
}

#[async_trait]
impl PaymentProvider for StellarProvider {
    async fn create_payment_request(
        &self,
        request: CreatePaymentRequest,
    ) -> Result<PaymentRequest> {
        let memo = generate_memo();
        let session_id = memo.clone();
        let qr_payload = format!(
            "web+stellar:pay?destination={}&amount={}&memo={}",
            self.config.destination_address, request.amount, memo
        );

        Ok(PaymentRequest {
            session_id,
            destination: self.config.destination_address.clone(),
            amount: request.amount,
            asset: request.asset,
            memo,
            qr_payload,
            expires_at: 0,
        })
    }

    async fn find_confirmed_payment(
        &self,
        destination: &str,
        memo: &str,
        amount: &str,
        asset: &str,
    ) -> Result<Option<PaymentEvent>> {
        let payments = self.client.payments_for_account(destination).await?;
        for record in payments.embedded.records {
            if !record.transaction_successful || record.record_type != "payment" {
                continue;
            }

            let event = parse_payment(&record)?;
            if event.destination_account == destination
                && event.memo == memo
                && event.amount == amount
                && event.asset.eq_ignore_ascii_case(asset)
            {
                return Ok(Some(event));
            }
        }

        Ok(None)
    }
}
