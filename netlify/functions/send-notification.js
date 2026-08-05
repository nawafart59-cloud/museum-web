const admin = require('firebase-admin');

if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);
        const messageText = data.text || "Pesan Darurat 💖";

        const tokensSnapshot = await db.collection('fcm_tokens').get();
        const tokens = [];
        tokensSnapshot.forEach(doc => {
            const tokenData = doc.data();
            if (tokenData.token) tokens.tokens.push(tokenData.token); // safety fix below
        });
        
        // Perbaikan array push tokens
        tokensSnapshot.forEach(doc => {
            const tokenData = doc.data();
            if (tokenData.token) tokens.push(tokenData.token);
        });

        if (tokens.length === 0) {
            return { statusCode: 200, body: JSON.stringify({ message: 'Tidak ada token ditemukan' }) };
        }

        const message = {
            notification: {
                title: 'Pesan Baru dari Sayang! ✨',
                body: messageText
            },
            tokens: tokens
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, count: response.successCount })
        };
    } catch (error) {
        console.error('Error sending notification:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
          
