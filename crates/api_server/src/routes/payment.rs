use axum::extract::State;
use axum::http::StatusCode;
use axum::Json;
use serde::{Deserialize, Serialize};
use qr::render_png_data_url;
use shared_types::CreatePaymentRequest;

use crate::state::AppState;

#[derive(Debug, Deserialize)]
pub struct CreatePaymentBody {
    pub amount: Option<String>,
    pub asset: Option<String>,
    pub event_id: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct CreatePaymentResponse {
    pub session_id: String,
    pub destination: String,
    pub amount: String,
    pub asset: String,
    pub memo: String,
    pub qr_payload: String,
    pub qr_png: String,
    pub request_expires_at: u64,
}

pub async fn create_payment_request(
    State(state): State<AppState>,
    Json(body): Json<CreatePaymentBody>,
) -> Result<Json<CreatePaymentResponse>, StatusCode> {
    let request = CreatePaymentRequest {
        amount: body.amount.unwrap_or_else(|| "10".to_string()),
        asset: body.asset.unwrap_or_else(|| "XLM".to_string()),
        event_id: body.event_id.unwrap_or_else(|| "demo-event".to_string()),
    };

    let payment_request = state
        .payment_provider
        .create_payment_request(request.clone())
        .await
        .map_err(|_| StatusCode::BAD_GATEWAY)?;

    let session = state
        .payment_service
        .insert_session(payment_request, 15 * 60, request.event_id)
        .await;

    Ok(Json(CreatePaymentResponse {
        session_id: session.payment_request.session_id,
        destination: session.payment_request.destination,
        amount: session.payment_request.amount,
        asset: session.payment_request.asset,
        memo: session.payment_request.memo,
        qr_payload: session.payment_request.qr_payload.clone(),
        qr_png: render_png_data_url(&session.payment_request.qr_payload, 320)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?,
        request_expires_at: session.payment_request.expires_at,
    }))
}
