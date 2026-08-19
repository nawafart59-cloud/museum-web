const admin = require('firebase-admin');

if (!admin.apps.length) {
    try {
        const rawEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (!rawEnv) {
            throw new Error("FIREBASE_SERVICE_ACCOUNT tidak ditemukan di Environment Variables.");
        }

        let serviceAccount;
        if (rawEnv.trim().startsWith('{')) {
            serviceAccount = JSON.parse(rawEnv);
        } else {
            const decoded = Buffer.from(rawEnv, 'base64').toString('utf8');
            serviceAccount = JSON.parse(decoded);
        }

        // Memastikan private_key dibersihkan secara presisi
        let privateKey = serviceAccount.private_key;
        if (typeof privateKey === 'string') {
            privateKey = privateKey.replace(/\\n/g, '\n');
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: serviceAccount.project_id,
                clientEmail: serviceAccount.client_email,
                privateKey: privateKey
            })
        });
    } catch (e) {
        console.error("Gagal inisialisasi Firebase Admin:", e.message);
    }
}

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { text } = JSON.parse(event.body || '{}');

        const tokensSnapshot = await admin.firestore().collection('fcm_tokens').get();
        const tokens = [];
        tokensSnapshot.forEach(doc => {
            const data = doc.data();
            if (data && data.token) {
                tokens.push(data.token);
            }
        });

        if (tokens.length === 0) {
            return { statusCode: 200, body: JSON.stringify({ message: 'Tidak ada token.' }) };
        }

        const sendPromises = tokens.map(token => {
            return admin.messaging().send({
                token: token,
                notification: {
                    title: "Pesan Baru dari Sayang! 💖",
                    body: text || "Ada pesan darurat baru untukmu."
                },
                data: {
                    title: "Pesan Baru dari Sayang! 💖",
                    body: text || "Ada pesan darurat baru untukmu.",
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
