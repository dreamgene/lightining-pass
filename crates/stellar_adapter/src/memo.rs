use rand::{distributions::Alphanumeric, Rng};

pub fn generate_memo() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(12)
        .map(char::from)
        .collect()
}
