from pathlib import Path
import qrcode

TARGETS = {
    "qr-facebook.png": "https://www.facebook.com/profile.php?id=61575582120326",
    "qr-instagram.png": "https://www.instagram.com/vietbreadhouse.hk/",
    "qr-menu.png": "https://vietbreadhouse.hk/",
}

for folder in (Path("images"), Path("public/images")):
    folder.mkdir(parents=True, exist_ok=True)
    for name, url in TARGETS.items():
        code = qrcode.QRCode(
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=24,
            border=6,
        )
        code.add_data(url)
        code.make(fit=True)
        code.make_image(fill_color="black", back_color="white").convert("RGB").save(
            folder / name, dpi=(600, 600)
        )
