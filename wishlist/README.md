# Wishlist (prototype)

This folder contains a simple wishlist web app. It can use Supabase for persistent, shared reservations or fall back to localStorage for local-only demos.

Files:
- `index.html` — frontend (includes placeholders for Supabase config)
- `styles.css` — styles
- `script.js` — UI + Supabase integration (falls back to localStorage)

Preview locally:

```powershell
cd "c:\Users\honzi\Plocha\škola\webdesign\jnpvlck\wishlist"
python -m http.server 8001
# open http://localhost:8001
```

Connect to your Supabase project

1. In Supabase, open the SQL editor and run the following to create the `items` table and seed the six example items:

```sql
create table if not exists items (
	id text primary key,
	title text not null,
	description text,
	reserved_by text,
	reserved_at timestamptz
);

insert into items (id, title, description) values
('item1','Leather Journal','Handmade A5 journal for notes and sketches.'),
('item2','Bluetooth Speaker','Portable speaker with rich sound.'),
('item3','Coffee Sampler','Selection of six single-origin coffees.'),
('item4','Cozy Blanket','Soft throw blanket, 130x160 cm.'),
('item5','Desk Plant','Low-maintenance succulent in a ceramic pot.'),
('item6','Gift Card','Versatile €50 gift card for tech or books.'),
('item7','Wireless Headphones','Over-ear Bluetooth headphones with long battery life.'),
('item8','Stainless Travel Mug','Keeps drinks hot for hours, leak-proof.'),
('item9','Contemporary Cookbook','A collection of easy, modern recipes.'),
('item10','Smart LED Lamp','Dimmable lamp with color and scene presets.'),
('item11','Photo Frame','Digital frame to display favorite photos.'),
('item12','Strategy Board Game','Fun tabletop game for 2-6 players.'),
('item13','Planner Notebook','Yearly planner with weekly layouts.'),
('item14','Noise-Cancelling Earbuds','Compact earbuds with ANC.')
on conflict (id) do nothing;
```

2. (Recommended) Create an atomic RPC to reserve an item safely:

```sql
create or replace function public.reserve_item(p_item_id text, p_name text)
returns json language plpgsql as $$
declare
	v_reserved_by text;
begin
	update items
	set reserved_by = p_name, reserved_at = now()
	where id = p_item_id and reserved_by is null;

	select reserved_by into v_reserved_by from items where id = p_item_id;
	return json_build_object('success', found, 'reserved_by', v_reserved_by);
end;
$$;
```

3. In the Supabase dashboard, get your **Project URL** and **anon/public API key** (Settings → API).

4. Edit `index.html` and replace the placeholders `YOUR_PROJECT_ID` and `YOUR_ANON_KEY` with your project's values. The site will then use Supabase automatically.

Security notes:
- For a quick demo you can use the anon key, but for production enable Row Level Security (RLS) and require authenticated users to modify reservations.
- Use the RPC above so reservations happen atomically and avoid double-booking.

If you'd like, I can fill in the keys for you now (paste them here), or I can scaffold a small Node backend instead. 
