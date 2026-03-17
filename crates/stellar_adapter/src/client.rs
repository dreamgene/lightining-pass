use anyhow::Result;
use reqwest::Client;

use crate::types::PaymentsResponse;

#[derive(Clone)]
pub struct HorizonClient {
    base_url: String,
    client: Client,
}

impl HorizonClient {
    pub fn new(base_url: String) -> Self {
        Self {
            base_url: base_url.trim_end_matches('/').to_string(),
            client: Client::new(),
        }
    }

    pub async fn payments_for_account(&self, account: &str) -> Result<PaymentsResponse> {
        let url = format!(
            "{}/accounts/{}/payments?limit=200&order=desc",
            self.base_url, account
        );
        let response = self.client.get(url).send().await?.error_for_status()?;
        Ok(response.json::<PaymentsResponse>().await?)
    }
}
