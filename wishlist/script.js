const supabase = supabase.createClient(
  'https://pvgdsnandhesqzmvgede.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2Z2RzbmFuZGhlc3F6bXZnZWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3ODcwNjksImV4cCI6MjA4MzM2MzA2OX0.-h6fv0n8I8q5WQlJ4asfg7j2-hf-CX98_uWxO4MJjUw'
);

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

async function loadGifts() {
  let { data, error } = await supabase.from('wishlist').select();
  if (error) {
    alert('Chyba při načítání dárků!');
    return [];
  }
  if (!data || data.length === 0) {
    // Tabulka je prázdná, vložíme základní předměty
    const giftsToInsert = DEFAULT_GIFTS.map(g => ({ name: g.name, reserved_by: null }));
    const { error: insertError } = await supabase.from('wishlist').insert(giftsToInsert);
    if (insertError) {
      alert('Chyba při vkládání základních dárků!');
      return [];
    }
    // Znovu načteme data
    ({ data } = await supabase.from('wishlist').select());
  }
  return data;
}

async function reserveGift(id, name) {
  const { error } = await supabase
    .from('wishlist')
    .update({ reserved_by: name })
    .eq('id', id);
  if (error) {
    alert('Chyba při rezervaci!');
  }
}

async function render() {
  const gifts = await loadGifts();
  const list = document.getElementById('gift-list');
  list.innerHTML = '';
  gifts.forEach(gift => {
    const li = document.createElement('li');
    const nameSpan = document.createElement('span');
    nameSpan.textContent = gift.name;
    li.appendChild(nameSpan);
    if (gift.reserved_by) {
      const reserved = document.createElement('span');
      reserved.className = 'reserved';
      reserved.textContent = ` — zamluvil: ${gift.reserved_by}`;
      li.appendChild(reserved);

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Zrušit zamluvení';
      cancelBtn.style.marginLeft = '1em';
      cancelBtn.onclick = async () => {
        await reserveGift(gift.id, null);
        render();
      };
      li.appendChild(cancelBtn);
    } else {
      const btn = document.createElement('button');
      btn.textContent = 'Zamluvit';
      btn.onclick = async () => {
        const name = prompt('Zadej své jméno:');
        if (name) {
          await reserveGift(gift.id, name);
          render();
        }
      };
      li.appendChild(btn);
    }
    list.appendChild(li);
  });
}

render();