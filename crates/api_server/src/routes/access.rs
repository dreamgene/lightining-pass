use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::Json;
use shared_types::PaymentStatusResponse;

use crate::state::AppState;

pub async fn get_access_token(
    State(state): State<AppState>,
    Path(session_id): Path<String>,
) -> Result<Json<PaymentStatusResponse>, StatusCode> {
    let session = state
        .payment_service
        .get(&session_id)
        .await
        .ok_or(StatusCode::NOT_FOUND)?;
    Ok(Json(state.payment_service.to_status_response(session)))
}
