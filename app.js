const BIOMES = [
  { id: 'mountains', label: 'Горные пики' },
  { id: 'forest', label: 'Лес' },
  { id: 'desert', label: 'Пустыня' },
  { id: 'swamp', label: 'Болото' },
  { id: 'tundra', label: 'Тундра' },
  { id: 'caves', label: 'Пещеры' }
];

const CATEGORIES = { nugget: 'Самородки', ore: 'Руды', loot: 'Добыча' };

const ITEMS = [
  { id: 'nugget_gold', label: 'Золотой самородок', category: 'nugget' },
  { id: 'nugget_iron', label: 'Железный самородок', category: 'nugget' },
  { id: 'ore_coal', label: 'Угольная руда', category: 'ore' },
  { id: 'ore_diamond', label: 'Алмазная руда', category: 'ore' },
  { id: 'loot_meat', label: 'Мясо добычи', category: 'loot' },
  { id: 'loot_bone', label: 'Кость', category: 'loot' }
];

const STORAGE_KEY = 'dragon-hoard-v1';

const els = {
  form: document.getElementById('addForm'),
  biome: document.getElementById('biome'),
  item: document.getElementById('item'),
  count: document.getElementById('count'),
  error: document.getElementById('formError'),
  grand: document.getElementById('grandTotal'),
  cats: document.getElementById('categoryTotals'),
  biomes: document.getElementById('biomes'),
  reset: document.getElementById('resetBtn')
};

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let entries = load();

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function itemById(id) {
  return ITEMS.find(i => i.id === id);
}

function fillSelects() {
  BIOMES.forEach(b => els.biome.append(new Option(b.label, b.id)));
  ITEMS.forEach(i => els.item.append(new Option(`${i.label} (${CATEGORIES[i.category]})`, i.id)));
}

function renderTotals() {
  const byCategory = Object.fromEntries(Object.keys(CATEGORIES).map(k => [k, 0]));
  let grand = 0;
  entries.forEach(e => {
    const item = itemById(e.item);
    if (item) byCategory[item.category] += e.count;
    grand += e.count;
  });
  els.grand.textContent = grand;
  els.cats.replaceChildren(...Object.entries(CATEGORIES).map(([key, label]) => {
    const li = document.createElement('li');
    li.textContent = `${label}: ${byCategory[key]}`;
    return li;
  }));
}

function renderBiomes() {
  els.biomes.replaceChildren(...BIOMES.map(b => {
    const rows = entries.filter(e => e.biome === b.id);
    const sum = rows.reduce((s, e) => s + e.count, 0);

    const section = document.createElement('article');
    section.className = 'biome';

    const heading = document.createElement('h3');
    heading.textContent = `${b.label}: ${sum}`;
    section.append(heading);

    if (rows.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'Пусто';
      section.append(empty);
      return section;
    }

    const list = document.createElement('ul');
    rows.forEach(e => {
      const item = itemById(e.item);
      const li = document.createElement('li');

      const name = document.createElement('span');
      name.textContent = item ? item.label : e.item;

      const amount = document.createElement('span');
      amount.textContent = `× ${e.count}`;

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'ghost small';
      remove.textContent = 'Убрать';
      remove.addEventListener('click', () => removeRow(e.biome, e.item));

      li.append(name, amount, remove);
      list.append(li);
    });
    section.append(list);
    return section;
  }));
}

function render() {
  renderTotals();
  renderBiomes();
}

function removeRow(biome, item) {
  entries = entries.filter(e => !(e.biome === biome && e.item === item));
  save();
  render();
}

els.form.addEventListener('submit', event => {
  event.preventDefault();
  const count = Math.floor(Number(els.count.value));
  if (!Number.isFinite(count) || count < 1) {
    els.error.textContent = 'Количество должно быть целым и не меньше 1.';
    return;
  }
  els.error.textContent = '';
  const existing = entries.find(e => e.biome === els.biome.value && e.item === els.item.value);
  if (existing) {
    existing.count += count;
  } else {
    entries.push({ biome: els.biome.value, item: els.item.value, count });
  }
  save();
  render();
});

els.reset.addEventListener('click', () => {
  if (!confirm('Очистить всё логово?')) return;
  entries = [];
  save();
  render();
});

fillSelects();
render();
