const admin = require('firebase-admin');

// Inisialisasi Firebase Admin menggunakan 1 variabel FIREBASE_SERVICE_ACCOUNT
if (!admin.apps.length) {
    let serviceAccount;
    
    try {
        // Mengubah string JSON dari Netlify Environment Variable menjadi objek JavaScript
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

        // Ambil semua token FCM yang tersimpan di Firestore
        const tokensSnapshot = await admin.firestore().collection('fcm_tokens').get();
        const tokens = [];
        tokensSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.token) tokens.push(data.token);
        });

        if (tokens.length === 0) {
            return { statusCode: 200, body: JSON.stringify({ message: 'Tidak ada token ditemukan' }) };
        }

        // Susun pesan notifikasi
        const message = {
            notification: {
                title: 'Pesan Darurat dari Sayang! 💖',
                body: text
            },
            tokens: tokens
        };

        // Kirim ke semua perangkat terdaftar
        const response = await admin.messaging().sendEachForMulticast(message);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, response })
        };
    } catch (error) {
        console.error('Gagal mengirim notifikasi:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
