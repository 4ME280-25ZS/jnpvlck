// Wishlist script: uses Supabase if configured, falls back to localStorage
const DEFAULT_ITEMS = [
  { id: 'item1', title: 'Leather Journal', desc: 'Handmade A5 journal for notes and sketches.' },
  { id: 'item2', title: 'Bluetooth Speaker', desc: 'Portable speaker with rich sound.' },
  { id: 'item3', title: 'Coffee Sampler', desc: 'Selection of six single-origin coffees.' },
  { id: 'item4', title: 'Cozy Blanket', desc: 'Soft throw blanket, 130x160 cm.' },
  { id: 'item5', title: 'Desk Plant', desc: 'Low-maintenance succulent in a ceramic pot.' },
  { id: 'item6', title: 'Gift Card', desc: 'Versatile €50 gift card for tech or books.' }
];

const STORAGE_KEY = 'wishlistReservations_v1';

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"
  }[c]));
}

/* ---------- LocalStorage fallback ---------- */
function loadReservationsLocal(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch(e){ return {}; }
}
function saveReservationsLocal(obj){ localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }

/* ---------- Supabase helpers (if configured) ---------- */
function hasSupabase(){ return !!window.supabaseClient; }

async function fetchItemsFromDb(){
  if(!hasSupabase()) return DEFAULT_ITEMS;
  const { data, error } = await window.supabaseClient
    .from('items')
    .select('id,title,description,reserved_by')
    .order('title', { ascending: true });
  if(error){ console.error(error); return DEFAULT_ITEMS; }
  // normalize field names to match DEFAULT_ITEMS
  return data.map(r => ({ id: r.id, title: r.title, desc: r.description || '', reserved_by: r.reserved_by }));
}

async function reserveItemDb(itemId, name){
  if(!hasSupabase()) return { success: true, reserved_by: name };
  // call RPC 'reserve_item' which should atomically reserve if available
  const { data, error } = await window.supabaseClient.rpc('reserve_item', { p_item_id: itemId, p_name: name });
  if(error){ console.error(error); return { success: false, error }; }
  // RPC returns json object
  try{ return data; } catch(e){ return { success: false }; }
}

async function cancelReservationDb(itemId){
  if(!hasSupabase()){
    const r = loadReservationsLocal(); delete r[itemId]; saveReservationsLocal(r); return { success: true };
  }
  const { data, error } = await window.supabaseClient
    .from('items')
    .update({ reserved_by: null, reserved_at: null })
    .eq('id', itemId);
  if(error){ console.error(error); return { success: false, error }; }
  return { success: true };
}

/* ---------- Rendering & UI ---------- */
async function render(){
  const itemsContainer = document.getElementById('items');
  itemsContainer.innerHTML = '';
  const tpl = document.getElementById('item-template');

  let items = await fetchItemsFromDb();
  let reservations = hasSupabase() ? {} : loadReservationsLocal();

  items.forEach(item => {
    const node = tpl.content.cloneNode(true);
    const li = node.querySelector('.item');
    li.dataset.id = item.id;
    node.querySelector('.title').textContent = item.title;
    node.querySelector('.desc').textContent = item.desc || '';

    const reserveBtn = node.querySelector('.reserve');
    const statusEl = node.querySelector('.status');
    const form = node.querySelector('.name-form');
    const input = node.querySelector('.name-input');
    const saveBtn = node.querySelector('.save');
    const cancelBtn = node.querySelector('.cancel');

    const reservedBy = hasSupabase() ? item.reserved_by : reservations[item.id];
    if(reservedBy){
      statusEl.innerHTML = `<span class="reserved-badge">Reserved by ${escapeHtml(reservedBy)}</span>`;
      reserveBtn.textContent = 'Cancel reservation';
      reserveBtn.classList.add('cancel-reserve');
    } else {
      statusEl.textContent = '';
      reserveBtn.textContent = "I'll buy";
      reserveBtn.classList.remove('cancel-reserve');
    }

    reserveBtn.addEventListener('click', async ()=>{
      if(reservedBy){
        if(confirm('Cancel reservation for this item?')){
          await cancelReservationDb(item.id);
          await loadAndRender();
        }
      } else {
        form.classList.remove('hidden');
        input.focus();
      }
    });

    saveBtn.addEventListener('click', async (ev)=>{
      ev.preventDefault();
      const name = input.value.trim();
      if(!name) return input.focus();
      const res = await reserveItemDb(item.id, name);
      if(res && res.success){
        if(hasSupabase()){
          // success, refresh from DB
          await loadAndRender();
        } else {
          const r = loadReservationsLocal(); r[item.id] = name; saveReservationsLocal(r); render();
        }
      } else {
        const takenBy = res && res.reserved_by ? res.reserved_by : null;
        alert(takenBy ? `Item already reserved by ${takenBy}` : 'Could not reserve item');
        form.classList.add('hidden');
      }
    });

    cancelBtn.addEventListener('click', ()=>{ form.reset(); form.classList.add('hidden'); });

    itemsContainer.appendChild(node);
  });
}

async function loadAndRender(){
  await render();
}

/* ---------- Realtime (Supabase) subscription to auto-refresh ---------- */
function setupRealtime(){
  if(!hasSupabase()) return;
  try{
    window.supabaseClient.channel('public:items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, payload => {
        loadAndRender();
      })
      .subscribe();
  }catch(e){
    // try older API fallback
    try{
      window.supabaseClient.from('items').on('*', payload=> { loadAndRender(); }).subscribe();
    }catch(_){ }
  }
}

document.addEventListener('DOMContentLoaded', async ()=>{
  await loadAndRender();
  setupRealtime();
});
const ITEMS = [
  { id: 'item1', title: 'Leather Journal', desc: 'Handmade A5 journal for notes and sketches.' },
  { id: 'item2', title: 'Bluetooth Speaker', desc: 'Portable speaker with rich sound.' },
  { id: 'item3', title: 'Coffee Sampler', desc: 'Selection of six single-origin coffees.' },
  { id: 'item4', title: 'Cozy Blanket', desc: 'Soft throw blanket, 130x160 cm.' },
  { id: 'item5', title: 'Desk Plant', desc: 'Low-maintenance succulent in a ceramic pot.' },
  { id: 'item6', title: 'Gift Card', desc: 'Versatile €50 gift card for tech or books.' }
];

const STORAGE_KEY = 'wishlistReservations_v1';

function loadReservations(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch(e){ return {}; }
}

function saveReservations(obj){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

function render(){
  const container = document.getElementById('items');
  container.innerHTML = '';
  const reservations = loadReservations();
  const tpl = document.getElementById('item-template');

  ITEMS.forEach(item => {
    const node = tpl.content.cloneNode(true);
    const li = node.querySelector('.item');
    li.dataset.id = item.id;
    node.querySelector('.title').textContent = item.title;
    node.querySelector('.desc').textContent = item.desc;

    const reserveBtn = node.querySelector('.reserve');
    const statusEl = node.querySelector('.status');
    const form = node.querySelector('.name-form');
    const input = node.querySelector('.name-input');
    const saveBtn = node.querySelector('.save');
    const cancelBtn = node.querySelector('.cancel');

    const reservedBy = reservations[item.id];
    if(reservedBy){
      statusEl.innerHTML = `<span class="reserved-badge">Reserved by ${escapeHtml(reservedBy)}</span>`;
      reserveBtn.textContent = 'Cancel reservation';
      reserveBtn.classList.add('cancel-reserve');
    } else {
      statusEl.textContent = '';
      reserveBtn.textContent = "I'll buy";
      reserveBtn.classList.remove('cancel-reserve');
    }

    reserveBtn.addEventListener('click', ()=>{
      if(reservations[item.id]){
        // cancel immediately
        if(confirm('Cancel reservation for this item?')){
          delete reservations[item.id];
          saveReservations(reservations);
          render();
        }
      } else {
        form.classList.remove('hidden');
        input.focus();
      }
    });

    saveBtn.addEventListener('click', (ev)=>{
      ev.preventDefault();
      const name = input.value.trim();
      if(!name) return input.focus();
      reservations[item.id] = name;
      saveReservations(reservations);
      form.reset();
      form.classList.add('hidden');
      render();
    });

    cancelBtn.addEventListener('click', ()=>{
      form.reset();
      form.classList.add('hidden');
    });

    container.appendChild(node);
  });
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"
  }[c]));
}

document.addEventListener('DOMContentLoaded', ()=>{
  render();
});
