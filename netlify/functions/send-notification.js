const admin = require('firebase-admin');

if (!admin.apps.length) {
    let serviceAccount;
    try {
        // Mendukung format JSON biasa maupun Base64
        const envVal = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (envVal.startsWith('{')) {
            serviceAccount = JSON.parse(envVal);
        } else {
            const raw = Buffer.from(envVal, 'base64').toString('utf8');
            serviceAccount = JSON.parse(raw);
        }
    } catch (e) {
        console.error("Gagal memparsing FIREBASE_SERVICE_ACCOUNT:", e);
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { text } = JSON.parse(event.body);

        const tokensSnapshot = await admin.firestore().collection('fcm_tokens').get();
        const tokens = [];
        tokensSnapshot.forEach(doc => {
            const data = doc.data();
            if (data && data.token) {
                tokens.push(data.token);
            }
        });

        if (tokens.length === 0) {
            return { statusCode: 200, body: JSON.stringify({ message: 'Tidak ada token terdaftar.' }) };
        }

        // Mengirim pesan ke tiap token secara terpisah agar pasti masuk
        const sendPromises = tokens.map(token => {
            return admin.messaging().send({
                token: token,
                notification: {
                    title: "Pesan Baru dari Sayang! 💖",
                    body: text || "Ada pesan darurat baru untukmu."
                },
                data: {
                    text: text || "",
                    url: "https://sign-of-love.netlify.app/"
                }
            });
        });

        const results = await Promise.allSettled(sendPromises);

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, results: results })
        };
    } catch (error) {
        console.error('Error mengirim notifikasi:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
