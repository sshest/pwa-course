const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const serviceAccount = require('./pwagram-key.json');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
admin.initializeApp({
    databaseURL: 'https://pwa-cource-project.firebaseio.com/',
    credential: admin.credential.cert(serviceAccount)
});
exports.storePostsData = functions.https.onRequest((req, res) => {
 cors(req, res, () => {
  admin.database().ref('posts').push({
   id: req.body.id,
   title: req.body.title,
   location: req.body.location,
   image: req.body.image
  })
      .then(() => {
       return res.status(201).json({message: 'Data stores', id: req.body.id})
      })
      .catch((err) => {
       res.status(500).json({error: err});
      })
 })
});
