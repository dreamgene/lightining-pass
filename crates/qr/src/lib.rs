use std::path::Path;

use anyhow::Result;
use base64::engine::general_purpose::STANDARD as BASE64_STANDARD;
use base64::Engine;
use image::ImageEncoder;
use image::Luma;
use qrcode::QrCode;

pub fn render_ascii_qr(payload: &str) -> Result<String> {
    let code = QrCode::new(payload.as_bytes())?;
    let qr = code
        .render::<char>()
        .quiet_zone(false)
        .module_dimensions(2, 1)
        .build();
    Ok(qr)
}

pub fn render_png_qr(payload: &str, path: impl AsRef<Path>, size: u32) -> Result<()> {
    let code = QrCode::new(payload.as_bytes())?;
    let image = code.render::<Luma<u8>>().max_dimensions(size, size).build();
    image.save(path)?;
    Ok(())
}

pub fn render_png_data_url(payload: &str, size: u32) -> Result<String> {
    let code = QrCode::new(payload.as_bytes())?;
    let image = code.render::<Luma<u8>>().max_dimensions(size, size).build();

    let mut buf = Vec::new();
    let encoder = image::codecs::png::PngEncoder::new(&mut buf);
    encoder.write_image(
        image.as_raw(),
        image.width(),
        image.height(),
        image::ExtendedColorType::L8,
    )?;

    let encoded = BASE64_STANDARD.encode(buf);
    Ok(format!("data:image/png;base64,{}", encoded))
}
