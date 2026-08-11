const admin = require('firebase-admin');

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
        const { text, messageId } = JSON.parse(event.body);

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
                body: text,
                icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 424C256 424 100 290 100 186C100 128 146 82 204 82C236 82 265 98 284 124C303 98 332 82 364 82C422 82 468 128 468 186C468 290 256 424 256 424Z" fill="%23ff4b72"/></svg>'
            },
            data: {
                text: text,
                messageId: messageId || "", // Menyertakan ID pesan untuk pelacakan centang biru
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
