var deferredPromt;

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