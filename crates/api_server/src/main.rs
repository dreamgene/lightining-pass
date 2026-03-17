use std::sync::Arc;
use std::time::Duration;

use anyhow::{anyhow, Result};
use axum::http::Method;
use axum::routing::{get, post};
use axum::Router;
use base64::engine::general_purpose::STANDARD as BASE64_STANDARD;
use base64::Engine;
use ed25519_dalek::SigningKey;
use rand::rngs::OsRng;
use tower_http::cors::{Any, CorsLayer};

use api_server::routes::access::get_access_token;
use api_server::routes::payment::create_payment_request;
use api_server::routes::status::get_payment_status;
use api_server::services::{run_payment_watcher, AccessService, PaymentService};
use api_server::state::AppState;
use stellar_adapter::{StellarConfig, StellarProvider};

#[tokio::main]
async fn main() -> Result<()> {
    let payment_provider = Arc::new(StellarProvider::new(load_stellar_config()?));
    let signing_key = load_signing_key()?;
    let access_service = AccessService::new(signing_key);
    let payment_service = PaymentService::new(read_u64_env("HASKE_TOKEN_EXPIRY_SECS", 5 * 60));

    let state = AppState {
        payment_service: payment_service.clone(),
        access_service: access_service.clone(),
        payment_provider: payment_provider.clone(),
    };

    tokio::spawn(run_payment_watcher(
        payment_service,
        access_service,
        payment_provider,
        Duration::from_secs(read_u64_env("HASKE_WATCH_INTERVAL_SECS", 3)),
    ));

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/payment-request", post(create_payment_request))
        .route("/api/payment-status/:session_id", get(get_payment_status))
        .route("/api/access-token/:session_id", get(get_access_token))
        .with_state(state)
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app.into_make_service()).await?;
    Ok(())
}

fn load_stellar_config() -> Result<StellarConfig> {
    Ok(StellarConfig {
        horizon_url: std::env::var("STELLAR_HORIZON_URL")
            .unwrap_or_else(|_| "https://horizon-testnet.stellar.org".to_string()),
        destination_address: std::env::var("STELLAR_DESTINATION_ADDRESS")
            .map_err(|_| anyhow!("missing STELLAR_DESTINATION_ADDRESS env var"))?,
    })
}

fn load_signing_key() -> Result<SigningKey> {
    if let Ok(value) = std::env::var("HASKE_SIGNING_KEY_BASE64") {
        let decoded = BASE64_STANDARD.decode(value.trim())?;
        let secret: [u8; 32] = decoded
            .as_slice()
            .try_into()
            .map_err(|_| anyhow!("HASKE_SIGNING_KEY_BASE64 must decode to 32 bytes"))?;
        return Ok(SigningKey::from_bytes(&secret));
    }

    eprintln!("warning: HASKE_SIGNING_KEY_BASE64 not set, using an ephemeral signing key");
    Ok(SigningKey::generate(&mut OsRng))
}

fn read_u64_env(key: &str, default: u64) -> u64 {
    std::env::var(key)
        .ok()
        .and_then(|value| value.parse::<u64>().ok())
        .unwrap_or(default)
}
