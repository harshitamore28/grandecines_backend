const admin = require('firebase-admin');

// Replace this path with your actual service account key file path
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;