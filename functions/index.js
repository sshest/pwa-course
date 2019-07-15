const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const serviceAccount = require('./pwagram-key.json');
const webpush = require('web-push');

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
          webpush.setVapidDetails('mailto:sshest78@gmail.com',
              'BOBheh-RHWtrqY8UgW9pWsOCDJY8_VQHNKH_imSuGNfhbTWI7sIUIj8oucG2e-OiZR_LvBELQoiifWzsQYI5clE',
              'TSfRxQOWxMANsOLf_XQfqcL4oDx4m0qd32B8lK7iHjc');
          return admin.database().ref('subscriptions').once('value');
      })
      .then((subscriptions) => {
          subscriptions.forEach((sub) => {
              const pushConfig = {
                  endpoint: sub.val().endpoint,
                  keys: {
                      auth: sub.val().keys.auth,
                      p2556dh: sub.val().keys.p256dh
                  }
              };
              webpush.sendNotification(pushConfig, JSON.stringify({
                  title: 'New post',
                  content: 'New post added!'
              }))
                  .catch(console.log);
          });
          return res.status(201).json({message: 'Data stored', id: req.body.id})
      })
      .catch((err) => {
       res.status(500).json({error: err});
      })
 })
});

exports.fetchPostsData = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        return admin.database().ref('posts')
            .once('value')
            .then((snapshot) => {
                const posts = snapshot.val();
                return res.status(201).json(posts);

            })
            .catch((err) => res.status(500).json({error: err}));
    });
});
