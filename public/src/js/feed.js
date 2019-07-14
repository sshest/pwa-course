const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
const sharedMomentsArea = document.querySelector('#shared-moments');
const form = document.querySelector('form');

function openCreatePostModal() {
  createPostArea.style.transform = 'translateY(0)';
  if (deferredPromt) {
    deferredPromt.prompt();

    deferredPromt.userChoice.then((choiceResult) => {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added the App to the home screen')
      }
      deferredPromt = null;
    });
  }
}

function closeCreatePostModal() {
    createPostArea.style.transform = 'translateY(100vh)';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// Not in use, allows to cache on demand
function onSaveButtonClicked(event) {
    if ('caches' in window) {
        caches.open('user-requested')
            .then((cache) => {
                cache.add('https://httpbin.org/get');
                cache.add('/src/images/sf-boat.jpg');
            })
    }
}

function clearCards() {
    // while(sharedMomentsArea.hasChildNodes()) {
    //     sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
    // }
}

function createCard(data) {
    clearCards();
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  const cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardWrapper.appendChild(cardTitle);
  const cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  const cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  const saveCardButton = document.createElement('button');
  saveCardButton.textContent ='Save';
  saveCardButton.addEventListener('click', onSaveButtonClicked);
  cardSupportingText.appendChild(saveCardButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
    for (let i=0; i < data.length; i++) {
        createCard(data[i]);
    }
}

const url = 'https://pwa-cource-project.firebaseio.com/posts.json';
let networkDataReceived = false;

fetch(url)
    .then(function(res) {
        return res.json();
    })
    .then(function(data) {
        console.log('From Web', data);
        networkDataReceived = true;
        const dataToArray = [];
        for (const key in data) {
            if(!data.hasOwnProperty(key)) {
                return;
            }
            dataToArray.push(data[key]);
        }
        updateUI(dataToArray);
    })
    .catch(() => {});

if ('indexedDB' in window) {
    readAllData('posts')
        .then(data => {
            console.log('From the indexedDB', data);
            if (networkDataReceived) {
                return;
            }
            updateUI(data);
        })
}

form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (form.title.value.trim() === ''
        && form.location.value.trim() === '') {
        return;
    }
    closeCreatePostModal();

    if('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
            .then((sw) => {
                sw.sync.register('sync-new-post');
            })
    }
});


