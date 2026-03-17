use std::sync::Arc;

use payment_core::PaymentProvider;

use crate::services::{AccessService, PaymentService};

#[derive(Clone)]
pub struct AppState {
    pub payment_service: PaymentService,
    pub access_service: AccessService,
    pub payment_provider: Arc<dyn PaymentProvider>,
}
