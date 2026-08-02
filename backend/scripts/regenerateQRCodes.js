const db = require("../config/db");
const QRCode = require("qrcode");
const { uploadBuffer } = require("../config/cloudinary");

async function regenerateQRCodes() {
    const [stores] = await db.query("SELECT id, qr_slug FROM stores");

    for (const store of stores) {

        const reviewUrl =
            `${process.env.BASE_URL}/customer-review.html?store=${store.qr_slug}`;

        const qrBuffer = await QRCode.toBuffer(reviewUrl, {
            width: 500,
            margin: 2
        });

        const uploaded = await uploadBuffer(
            qrBuffer,
            "worker-review/qrcodes",
            `${store.qr_slug}-${Date.now()}`
        );

        await db.query(
            "UPDATE stores SET qr_code_path=? WHERE id=?",
            [uploaded.secure_url, store.id]
        );

        console.log(`Updated store ${store.id}`);
    }

    console.log("Done");
    process.exit();
}

regenerateQRCodes();