const admin = require('firebase-admin');

// Inisialisasi Firebase Admin dengan membaca langsung dari FIREBASE_SERVICE_ACCOUNT
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
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
            tokens.push(doc.data().token);
        });

        if (tokens.length === 0) {
            return { statusCode: 200, body: JSON.stringify({ message: 'Tidak ada token.' }) };
        }

        const message = {
            notification: {
                title: "Pesan Baru dari Sayang! 💖",
                body: text
            },
            data: {
                text: text
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
