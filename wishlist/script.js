const supabase = supabase.createClient(
  'https://pvgdsnandhesqzmvgede.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2Z2RzbmFuZGhlc3F6bXZnZWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3ODcwNjksImV4cCI6MjA4MzM2MzA2OX0.-h6fv0n8I8q5WQlJ4asfg7j2-hf-CX98_uWxO4MJjUw'
);

async function loadGifts() {
  const { data, error } = await supabase.from('wishlist').select();
  if (error) {
    alert('Chyba při načítání dárků!');
    return [];
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