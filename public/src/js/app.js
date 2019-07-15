let deferredPromt;
const enableNotificationButtons = document.querySelectorAll('.enable-notifications');

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => {
            console.log('service Worker registered!');
        });
}

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPromt = event;
    return false;
});

function displayConfirmNotification() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then((swRegistration) => {
                const options = {
                    body: 'You successfully subscribed to our notification service!',
                    icon: '/src/images/icons/app-icon-96x96.png',
                    image: '/src/images/sf-boat.jpg',
                    dir: 'ltr',
                    lang: 'en-US',
                    vibrate: [100, 50, 200],
                    badge: '/src/images/icons/app-icon-96x96.png',
                    tag: 'confirm-notification',
                    renotify: true,
                    actions: [
                        { action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png' },
                        { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png' }
                    ]

                };
                swRegistration.showNotification('Subscribed successfully', options)
            })
    }
}

function configurePushSubscription() {
    if (!'serviceWorker' in navigator) {
        return;
    }
    let swReg;
    navigator.serviceWorker.ready
        .then((swRegistration) => {
            swReg = swRegistration;
            return swRegistration.pushManager.getSubscription()
        })
        .then((sub) => {
            if (sub === null) {
                const vapidPublicKey = 'BOBheh-RHWtrqY8UgW9pWsOCDJY8_VQHNKH_imSuGNfhbTWI7sIUIj8oucG2e-OiZR_LvBELQoiifWzsQYI5clE';
                const converedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
                // create new subscription
                return swReg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: converedVapidPublicKey
                })
            } else {
                // we have an existing one
            }
        })
        .then((newSubscription) => {
            return fetch('https://pwa-cource-project.firebaseio.com/subscriptions.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(newSubscription)
            });
        })
        .then((resp) => {
            if (resp.ok) {
                displayConfirmNotification();
            }
        })
        .catch(console.log);
}

function askForNotificationPermission() {
    Notification.requestPermission((result) => {
        console.log('User choice ', result);
        // if (result !== 'granted') {
        //     console.log('No Notification permission granted');
        //     return;
        // }
        configurePushSubscription();
    });
}

if ('Notification' in window) {
    for (let i=0; i < enableNotificationButtons.length; i++) {
        enableNotificationButtons[i].style.display = 'inline-block';
        enableNotificationButtons[i].addEventListener('click', askForNotificationPermission);
    }
}