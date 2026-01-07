initializeGifts();
render();
const firebaseConfig = {
  apiKey: "AIzaSyDG5bOG9_9GV-xKEVHdIQLbAuvSsSWD0rw",
  authDomain: "wishlist-f6fac.firebaseapp.com",
  projectId: "wishlist-f6fac",
  storageBucket: "wishlist-f6fac.firebasestorage.app",
  messagingSenderId: "269148346232",
  appId: "1:269148346232:web:edc5a39b7cd3eab5985a8d",
  measurementId: "G-20VFBSQVTF"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const DEFAULT_GIFTS = [
  { name: "Kniha" },
  { name: "Sluchátka" },
  { name: "Hrnek" },
  { name: "Ponožky" },
  { name: "Puzzle" },
  { name: "Tričko" },
  { name: "Batoh" },
  { name: "Lego" },
  { name: "Peněženka" },
  { name: "Sladkosti" }
];

function initializeGifts() {
  db.ref('wishlist').once('value', snapshot => {
    if (!snapshot.exists()) {
      const gifts = {};
      DEFAULT_GIFTS.forEach((g, i) => {
        gifts[i] = { name: g.name, reservedBy: null };
      });
      db.ref('wishlist').set(gifts);
    }
  });
}

function loadGifts(callback) {
  db.ref('wishlist').on('value', snapshot => {
    const data = snapshot.val() || {};
    const gifts = Object.entries(data).map(([id, gift]) => ({ id, ...gift }));
    callback(gifts);
  });
}

function reserveGift(id, name) {
  db.ref('wishlist/' + id + '/reservedBy').set(name);
}

function render() {
  loadGifts(gifts => {
    const list = document.getElementById('gift-list');
    list.innerHTML = '';
    gifts.forEach(gift => {
      const li = document.createElement('li');
      const nameSpan = document.createElement('span');
      nameSpan.textContent = gift.name;
      li.appendChild(nameSpan);
      if (gift.reservedBy) {
        const reserved = document.createElement('span');
        reserved.className = 'reserved';
        reserved.textContent = ` — zamluvil: ${gift.reservedBy}`;
        li.appendChild(reserved);
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Zrušit zamluvení';
        cancelBtn.style.marginLeft = '1em';
        cancelBtn.onclick = () => {
          reserveGift(gift.id, null);
        };
        li.appendChild(cancelBtn);
      } else {
        const btn = document.createElement('button');
        btn.textContent = 'Zamluvit';
        btn.onclick = () => {
          const name = prompt('Zadej své jméno:');
          if (name) {
            reserveGift(gift.id, name);
          }
        };
        li.appendChild(btn);
      }
      list.appendChild(li);
    });
  });
}

