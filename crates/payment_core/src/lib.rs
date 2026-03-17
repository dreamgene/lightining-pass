use anyhow::Result;
use async_trait::async_trait;
use shared_types::{CreatePaymentRequest, PaymentEvent, PaymentRequest};

#[async_trait]
pub trait PaymentProvider: Send + Sync {
    async fn create_payment_request(&self, request: CreatePaymentRequest)
        -> Result<PaymentRequest>;

    async fn find_confirmed_payment(
        &self,
        destination: &str,
        memo: &str,
        amount: &str,
        asset: &str,
    ) -> Result<Option<PaymentEvent>>;
}
