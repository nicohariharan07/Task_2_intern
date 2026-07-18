// ==========================================================================
// Field Notes — shared behaviour
// ==========================================================================

const STORAGE_KEY = 'fieldnotes.entries';

const SEED_ENTRIES = [
  {
    id: 'seed-1',
    title: 'What the tide pools taught me about patience',
    author: 'Mira Okafor',
    category: 'Nature',
    date: '2026-07-02',
    excerpt: 'An hour spent still at the edge of a rock pool changes how fast you think everything else should move.',
    content: 'An hour spent still at the edge of a rock pool changes how fast you think everything else should move. The anemones only open once they trust the water is calm again. Watching a hermit crab test three shells before choosing one felt like a lesson I did not know I needed about slow, deliberate decisions.'
  },
  {
    id: 'seed-2',
    title: 'A short defence of writing things down by hand',
    author: 'Theo Lindqvist',
    category: 'Craft',
    date: '2026-06-24',
    excerpt: 'Typing captures the thought. A pencil captures the thinking — the crossed-out line is part of the record.',
    content: 'Typing captures the thought. A pencil captures the thinking — the crossed-out line is part of the record. Notebooks age with you in a way a document history never quite manages to. I keep a small one in every bag, not because I am organised, but because I am forgetful in a very specific, useful way.'
  },
  {
    id: 'seed-3',
    title: 'Field notes from a very small garden',
    author: 'Priya Ramesh',
    category: 'Nature',
    date: '2026-06-11',
    excerpt: 'Four pots on a balcony is not a farm. It is, apparently, enough to lose an entire evening to.',
    content: 'Four pots on a balcony is not a farm. It is, apparently, enough to lose an entire evening to. The basil is thriving out of spite. The tomatoes are having an opinion about the amount of afternoon sun they receive. I have never learned so much from something so small and so unwilling to be rushed.'
  },
  {
    id: 'seed-4',
    title: 'On reading the same book twice, years apart',
    author: 'Theo Lindqvist',
    category: 'Reading',
    date: '2026-05-29',
    excerpt: 'The book had not changed. I clearly had, and it kept a record of that in the margins.',
    content: 'The book had not changed. I clearly had, and it kept a record of that in the margins. My twenty-two-year-old handwriting underlined sentences my current self would have skimmed past, and vice versa. Rereading is less about the story and more about comparing notes with an earlier version of yourself.'
  }
];

function getStoredEntries(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(err){
    console.error('Could not read saved entries', err);
    return [];
  }
}

function saveEntry(entry){
  const entries = getStoredEntries();
  entries.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function getAllEntries(){
  const stored = getStoredEntries();
  return [...stored, ...SEED_ENTRIES].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function formatDate(iso){
  const d = new Date(iso + 'T00:00:00');
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  return { day, month };
}

function readingTime(text){
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// ---------------- Navbar ----------------
function initNav(){
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if(!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// ---------------- Footer year ----------------
function initFooterYear(){
  const el = document.querySelector('[data-year]');
  if(el) el.textContent = new Date().getFullYear();
}

// ---------------- Home page: render entries ----------------
function entryCardHTML(entry){
  const { day, month } = formatDate(entry.date);
  const mins = readingTime(entry.content);
  return `
    <article class="entry" data-category="${entry.category}">
      <div class="postmark" aria-hidden="true">
        <span class="postmark-inner">
          <span class="postmark-day">${day}</span>
          <span class="postmark-mon">${month}</span>
        </span>
      </div>
      <div class="entry-body">
        <h3>${escapeHTML(entry.title)}</h3>
        <div class="entry-meta">
          <span>${escapeHTML(entry.author)}</span>
          <span class="tag">#${escapeHTML(entry.category)}</span>
          <span>${mins} min read</span>
        </div>
        <p class="entry-excerpt">${escapeHTML(entry.excerpt)}</p>
        <details>
          <summary>Read entry</summary>
          <p class="full-text">${escapeHTML(entry.content)}</p>
        </details>
      </div>
    </article>
  `;
}

function escapeHTML(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderEntries(filter){
  const list = document.getElementById('entries-list');
  if(!list) return;
  const all = getAllEntries();
  const filtered = filter && filter !== 'all'
    ? all.filter(e => e.category === filter)
    : all;

  if(filtered.length === 0){
    list.innerHTML = `<div class="entry-empty">No entries in this category yet. Be the first to write one →</div>`;
    return;
  }
  list.innerHTML = filtered.map(entryCardHTML).join('');
}

function initHome(){
  const list = document.getElementById('entries-list');
  if(!list) return;

  const entryCountEl = document.getElementById('entry-count');
  if(entryCountEl) entryCountEl.textContent = getAllEntries().length;

  renderEntries('all');

  const chips = document.querySelectorAll('.chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      renderEntries(chip.dataset.filter);
    });
  });
}

// ---------------- Add Blog page ----------------
function showToast(message){
  const toast = document.getElementById('toast');
  if(!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function initComposer(){
  const form = document.getElementById('blog-form');
  if(!form) return;

  const contentEl = document.getElementById('content');
  const countEl = document.getElementById('char-count');
  if(contentEl && countEl){
    const updateCount = () => { countEl.textContent = `${contentEl.value.length} characters`; };
    contentEl.addEventListener('input', updateCount);
    updateCount();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const category = document.getElementById('category').value;
    const excerptInput = document.getElementById('excerpt').value.trim();
    const content = document.getElementById('content').value.trim();

    if(!title || !author || !content){
      showToast('Please fill in the title, author and entry before publishing.');
      return;
    }

    const entry = {
      id: 'entry-' + Date.now(),
      title,
      author,
      category: category || 'General',
      date: new Date().toISOString().slice(0, 10),
      excerpt: excerptInput || content.slice(0, 140) + (content.length > 140 ? '…' : ''),
      content
    };

    saveEntry(entry);
    form.reset();
    if(countEl) countEl.textContent = '0 characters';
    showToast('Entry published. Taking you to the journal…');
    setTimeout(() => { window.location.href = 'index.html'; }, 900);
  });

  const clearBtn = document.getElementById('clear-form');
  if(clearBtn){
    clearBtn.addEventListener('click', () => {
      form.reset();
      if(countEl) countEl.textContent = '0 characters';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initFooterYear();
  initHome();
  initComposer();
});
