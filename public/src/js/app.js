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
    if ('serviceWorker' in window) {
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

function askForNotificationPermission() {
    Notification.requestPermission((result) => {
        console.log('User choice ', result);
        if (result !== 'granted') {
            console.log('No Notification permission granted');
            return;
        }
        displayConfirmNotification();
    });
}

if ('Notification' in window) {
    for (let i=0; i < enableNotificationButtons.length; i++) {
        enableNotificationButtons[i].style.display = 'inline-block';
        enableNotificationButtons[i].addEventListener('click', askForNotificationPermission);
    }
}