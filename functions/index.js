const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const serviceAccount = require('./pwagram-key.json');
const webpush = require('web-push');
const Busboy = require("busboy");
const fs = require('fs');
const googleCloudConfig = {
    projectId: 'pwa-cource-project',
    keyFilename: 'pwagram-key.json'
};
const { Storage } = require('@google-cloud/storage');
const UUID = require('uuid-v4');
const googleCloudStorage = new Storage(googleCloudConfig);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
admin.initializeApp({
    databaseURL: 'https://pwa-cource-project.firebaseio.com/',
    credential: admin.credential.cert(serviceAccount)
});

exports.storePostsData = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        const uuid = UUID();

        const busboy = new Busboy({ headers: request.headers });
        // These objects will store the values (file + fields) extracted from busboy
        let upload;
        const fields = {};

        // This callback will be invoked for each file uploaded
        busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
            console.log(
                `File [${fieldname}] filename: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`
            );
            const filepath = path.join(os.tmpdir(), filename);
            upload = { file: filepath, type: mimetype };
            file.pipe(fs.createWriteStream(filepath));
        });

        // This will invoked on every field detected
        busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
            fields[fieldname] = val;
        });

        // This callback will be invoked after all uploaded files are saved.
        busboy.on("finish", () => {
            const bucket = googleCloudStorage.bucket("pwa-cource-project.appspot.com");
            bucket.upload(
                upload.file,
                {
                    uploadType: "media",
                    metadata: {
                        metadata: {
                            contentType: upload.type,
                            firebaseStorageDownloadTokens: uuid
                        }
                    }
                },
                (err, uploadedFile) => {
                    if (!err) {
                        admin
                            .database()
                            .ref("posts")
                            .push({
                                title: fields.title,
                                location: fields.location,
                                rawLocation: fields.rawLocation,
                                image:
                                    "https://firebasestorage.googleapis.com/v0/b/" +
                                    bucket.name +
                                    "/o/" +
                                    encodeURIComponent(uploadedFile.name) +
                                    "?alt=media&token=" +
                                    uuid
                            })
                            .then(() => {
                                webpush.setVapidDetails(
                                    'mailto:sshest78@gmail.com',
                                    'BOBheh-RHWtrqY8UgW9pWsOCDJY8_VQHNKH_imSuGNfhbTWI7sIUIj8oucG2e-OiZR_LvBELQoiifWzsQYI5clE',
                                    'TSfRxQOWxMANsOLf_XQfqcL4oDx4m0qd32B8lK7iHjc'
                                );
                                return admin
                                    .database()
                                    .ref("subscriptions")
                                    .once("value");
                            })
                            .then((subscriptions) => {
                                subscriptions.forEach((sub) => {
                                    const pushConfig = {
                                        endpoint: sub.val().endpoint,
                                        keys: {
                                            auth: sub.val().keys.auth,
                                            p256dh: sub.val().keys.p256dh
                                        }
                                    };

                                    webpush
                                        .sendNotification(
                                            pushConfig,
                                            JSON.stringify({
                                                title: "New Post",
                                                content: "New Post added!",
                                                openUrl: "/help"
                                            })
                                        )
                                        .catch(console.log);
                                });
                                return response
                                    .status(201)
                                    .json({ message: "Data stored", id: fields.id });
                            })
                            .catch((err) => {
                                return response.status(500).json({ error: err });
                            });
                    } else {
                        console.log(err);
                    }
                }
            );
        });

        // The raw bytes of the upload will be in request.rawBody.  Send it to busboy, and get
        // a callback when it's finished.
        busboy.end(request.rawBody);
        // formData.parse(request, function(err, fields, files) {
        //   fs.rename(files.file.path, "/tmp/" + files.file.name);
        //   var bucket = gcs.bucket("YOUR_PROJECT_ID.appspot.com");
        // });
    });
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
