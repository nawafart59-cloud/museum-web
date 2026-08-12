const admin = require('firebase-admin');

if (!admin.apps.length) {
    let serviceAccount;
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
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
            return { statusCode: 200, body: JSON.stringify({ message: 'Tidak ada token.' }) };
        }

        const message = {
            notification: {
                title: "Pesan Baru dari Sayang! 💖",
                body: text || "Ada pesan darurat baru untukmu."
            },
            data: {
                text: text || "",
                url: "https://museum-web.netlify.app/"
            },
            tokens: tokens
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, response: response })
        };
    } catch (error) {
        console.error('Error mengirim notifikasi:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
