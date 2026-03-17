use std::sync::Arc;
use std::time::Duration;

use payment_core::PaymentProvider;

use crate::services::{AccessService, PaymentService};

pub async fn run_payment_watcher(
    payment_service: PaymentService,
    access_service: AccessService,
    payment_provider: Arc<dyn PaymentProvider>,
    poll_interval: Duration,
) {
    let mut ticker = tokio::time::interval(poll_interval);

    loop {
        ticker.tick().await;
        let pending = payment_service.pending_sessions().await;

        for session in pending {
            let payment = match payment_provider
                .find_confirmed_payment(
                    &session.payment_request.destination,
                    &session.payment_request.memo,
                    &session.payment_request.amount,
                    &session.payment_request.asset,
                )
                .await
            {
                Ok(payment) => payment,
                Err(err) => {
                    eprintln!("payment watcher lookup failed: {err}");
                    continue;
                }
            };

            let Some(payment) = payment else {
                continue;
            };

            let artifact =
                match access_service.issue_token(&payment, &session.event_id, session.expires_at) {
                    Ok(artifact) => artifact,
                    Err(err) => {
                        eprintln!("access token issuance failed: {err}");
                        continue;
                    }
                };

            if let Err(err) = payment_service
                .mark_paid(&session.payment_request.session_id, artifact)
                .await
            {
                eprintln!("failed to mark session as paid: {err}");
            }
        }
    }
}
