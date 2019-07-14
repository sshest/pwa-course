const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.storePostsData = functions.https.onRequest((request, response) => {
 cors((req, res) => {
  admin.database().ref('posts').push({
   id: req.body.id,
   title: req.body.title,
   location: req.body.location,
   image: req.body.image
  })
      .then(() => {
       return response.status(201).json({message: 'Data stores', id: req.body.id})
      })
      .catch((err) => {
       response.status(500).json({error: err});
      })
 })
});
