const gifts = [
  { name: "Kniha", reservedBy: "" },
  { name: "Sluchátka", reservedBy: "" },
  { name: "Hrnek", reservedBy: "" },
  { name: "Ponožky", reservedBy: "" },
  { name: "Puzzle", reservedBy: "" },
  { name: "Tričko", reservedBy: "" },
  { name: "Batoh", reservedBy: "" },
  { name: "Lego", reservedBy: "" },
  { name: "Peněženka", reservedBy: "" },
  { name: "Sladkosti", reservedBy: "" }
];

function save() {
  localStorage.setItem("wishlist", JSON.stringify(gifts));
}

function load() {
  const data = localStorage.getItem("wishlist");
  if (data) {
    const arr = JSON.parse(data);
    gifts.forEach((g, i) => gifts[i].reservedBy = arr[i].reservedBy);
  }
}

function render() {
  load();
  const list = document.getElementById("gift-list");
  list.innerHTML = "";
  gifts.forEach((gift, i) => {
    const li = document.createElement("li");
    li.textContent = gift.name;
    if (gift.reservedBy) {
      li.textContent += ` — zamluvil: ${gift.reservedBy}`;
    } else {
      const btn = document.createElement("button");
      btn.textContent = "Zamluvit";
      btn.onclick = () => {
        const name = prompt("Zadej své jméno:");
        if (name) {
          gifts[i].reservedBy = name;
          save();
          render();
        }
      };
      li.appendChild(btn);
    }
    list.appendChild(li);
  });
}

render();