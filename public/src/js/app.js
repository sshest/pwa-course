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
    const options = {
        body: 'You successfully subscribed to our notification service!'
    };
    new Notification('Subscribed successfully', options);
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