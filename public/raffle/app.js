'use strict';

const people = [
  { id: 14001, name: 'Akari', avatar: 1, liked: true },
  { id: 14002, name: 'KuroFox', avatar: 2, liked: true },
  { id: 14003, name: 'LunaMoth', avatar: 3, liked: true },
  { id: 14004, name: 'Tenshi', avatar: 4, liked: true },
  { id: 14005, name: 'MikaRain', avatar: 5, liked: true },
  { id: 14006, name: 'NeonNeko', avatar: 6, liked: false },
  { id: 14007, name: 'Rin', avatar: 7, liked: true },
  { id: 14008, name: 'Sora', avatar: 8, liked: true },
];

const artwork = ['Бёль', 'Шрам', 'Лорд Шень', 'Тамия Гантетсусаи', 'Скарлет Арман', 'Эномото Даичи', 'Дзё Тогамэ', 'Ангел'];
const variant = ['Целая', 'Сломанная', 'Пробуждённая'];

function trade(id, owner, status, items) {
  return { id, owner, status, items: items.map(([art, count, type = 0, rank = 'B']) => ({ art, count, type, rank })) };
}

const trades = [
  trade(51041, 14001, 'denied', [[1, 1], [5, 1, 1]]),
  trade(51044, 14001, 'accepted', [[1, 1], [5, 1, 1]]),
  trade(51045, 14001, 'accepted', [[2, 1, 2], [7, 1], [1, 1, 0, 'C']]),
  trade(51046, 14002, 'accepted', [[4, 15], [6, 5, 1]]),
  trade(51047, 14002, 'accepted', [[8, 10, 2]]),
  trade(51048, 14003, 'accepted', [[3, 2]]),
  trade(51049, 14004, 'accepted', [[4, 1, 1]]),
  trade(51050, 14005, 'accepted', [[2, 1], [5, 2, 2]]),
  trade(51051, 14006, 'accepted', [[6, 2]]),
  trade(51052, 14007, 'pending', [[7, 1]]),
  trade(51053, 14008, 'canceled', [[8, 1]]),
  trade(51054, 14008, 'denied', [[8, 1]]),
];

function acceptedCards(exchangeSnapshots) {
  const latestById = new Map(exchangeSnapshots.map(exchange => [exchange.id, exchange]));
  const cards = [];
  for (const exchange of latestById.values()) {
    if (exchange.status !== 'accepted') continue;
    exchange.items.forEach((item, index) => {
      if (item.rank !== 'B') return;
      for (let copy = 0; copy < item.count; copy++) {
        cards.push({ id: `${exchange.id}-${index}-${copy}`, tradeId: exchange.id, owner: exchange.owner, art: item.art, variant: variant[item.type] });
      }
    });
  }
  return cards;
}

const accepted = acceptedCards(trades);
const likedIds = new Set(people.filter(person => person.liked).map(person => person.id));
const pool = accepted.filter(card => likedIds.has(card.owner));
const byCard = new Map(pool.map(card => [card.id, card]));
const byPerson = new Map(people.map(person => [person.id, person]));
const storageKey = 'bclub-demo-v1';
const channel = 'BroadcastChannel' in window ? new BroadcastChannel(storageKey) : null;
const $ = id => document.getElementById(id);

function startRound() {
  return { deadline: Date.now() + 45000, winners: [], reveals: [] };
}

function readRound() {
  try { return JSON.parse(localStorage.getItem(storageKey)); }
  catch { return null; }
}

let round = readRound() || startRound();
let viewer = byPerson.get(Number(sessionStorage.getItem('bclub-viewer')));
let filter = 'all';
const pages = [...document.querySelectorAll('[data-page]')];
let currentPage = 'home';

function saveRound(updated, announce = true) {
  round = updated;
  localStorage.setItem(storageKey, JSON.stringify(updated));
  if (announce) channel?.postMessage(updated);
}

saveRound(round, false);

function randomIndex(size) {
  const range = 2 ** 32;
  const cutoff = range - range % size;
  const sample = new Uint32Array(1);
  do { crypto.getRandomValues(sample); } while (sample[0] >= cutoff);
  return sample[0] % size;
}

function drawPrizeCards(cards) {
  const remaining = [...cards];
  const winners = [];
  while (remaining.length && winners.length < 3) {
    const [winner] = remaining.splice(randomIndex(remaining.length), 1);
    winners.push(winner.id);
  }
  return winners;
}

async function changeRound(change) {
  const commit = () => {
    const current = readRound() || round;
    const next = change(current);
    if (next === current) return false;
    saveRound(next);
    render();
    return true;
  };
  return navigator.locks ? navigator.locks.request(storageKey, commit) : commit();
}

function finalize(skipTimer = false) {
  return changeRound(current => {
    if (current.winners.length || (!skipTimer && current.deadline > Date.now())) return current;
    return { ...current, deadline: skipTimer ? Date.now() : current.deadline, winners: drawPrizeCards(pool) };
  });
}

let openingCard = false;

async function reveal(cardId) {
  if (openingCard) return;
  openingCard = true;
  try {
    const opened = await changeRound(current => {
      const card = byCard.get(cardId);
      if (!card || card.owner !== viewer?.id || !current.winners.length || current.reveals.some(event => event.id === cardId)) return current;
      return { ...current, reveals: [...current.reveals, { id: cardId, at: Date.now() }] };
    });
    if (!opened || $('my-cards').hidden) return;
    const front = $('my-grid').querySelector(`.card-front[data-card="${cardId}"]`);
    if (!front) return;
    front.classList.add('reveal');
    await Promise.allSettled(front.getAnimations().map(animation => animation.finished));
    front.classList.remove('reveal');
  } finally {
    openingCard = false;
  }
}

function renderTimer() {
  const seconds = Math.max(0, Math.ceil((round.deadline - Date.now()) / 1000));
  const closed = Boolean(round.winners.length);
  if (!seconds && !closed) void finalize();
  $('phase').textContent = closed ? 'ПРИЗЫ РАСПРЕДЕЛЕНЫ' : 'ДО РАСПРЕДЕЛЕНИЯ ПРИЗОВ';
  $('time').textContent = closed ? 'Можно открывать карты' : `00:00:${String(seconds).padStart(2, '0')}`;
  $('time').classList.toggle('finished', closed);
  $('finish').hidden = closed || !viewer;
}

function artPath(art) { return `/raffle/assets/b-${art}.webp`; }

function cardState(card, allowReveal) {
  if (round.reveals.some(event => event.id === card.id)) return round.winners.includes(card.id) ? 'prize' : 'empty';
  return allowReveal && round.winners.length ? 'ready' : 'locked';
}

function cardMarkup(card, index, state) {
  if (state === 'prize' || state === 'empty') {
    const win = state === 'prize';
    return `<article class="trade-card card-front${win ? ' is-prize' : ''}" data-card="${card.id}" data-state="${state}">
      <img src="${artPath(card.art)}" alt="${artwork[card.art - 1]}" loading="lazy">
      <div class="card-caption"><strong>${win ? '✦ ПРЕМИУМ' : 'ПУСТО'}</strong><small>${artwork[card.art - 1]} · ${card.variant}</small><small>Обмен #${card.tradeId}</small></div>
    </article>`;
  }
  const clickable = state === 'ready';
  const action = clickable ? 'Открыть карту' : 'Скрыта';
  return `<button type="button" class="trade-card card-back" data-card="${card.id}" data-state="${state}" aria-label="Карта ${index + 1}. ${action}" ${clickable ? '' : 'disabled'}>
    <span class="card-index">#${String(index + 1).padStart(2, '0')}</span><span class="card-emblem" aria-hidden="true"><span class="eye-mark"></span></span><span class="card-action">${action}</span>
  </button>`;
}

function personCards(person) { return pool.filter(card => card.owner === person.id); }

function reason(person) {
  if (!person.liked) return 'Нужен лайк на пост';
  if (trades.some(exchange => exchange.owner === person.id && exchange.status === 'pending')) return 'Обмен ожидает принятия';
  return 'Нет принятого обмена с B-картой';
}

function cardCount(count) {
  const word = new Intl.PluralRules('ru').select(count);
  return `${count} ${({ one: 'карта', few: 'карты', many: 'карт', other: 'карт' })[word]}`;
}

function renderRoster() {
  const search = $('search').value.trim().toLowerCase();
  const expanded = new Set([...$('roster').querySelectorAll('details[open]')].map(item => Number(item.dataset.person)));
  const matching = people.filter(person => {
    const entered = Boolean(personCards(person).length);
    const inFilter = filter === 'all' || (filter === 'in' ? entered : !entered);
    return inFilter && (person.name.toLowerCase().includes(search) || String(person.id).includes(search));
  });
  $('roster-count').textContent = `${matching.length} из ${people.length}`;
  $('roster').innerHTML = matching.map(person => {
    const cards = personCards(person);
    return `<details class="person" data-person="${person.id}" ${expanded.has(person.id) ? 'open' : ''}>
      <summary><img class="avatar" src="/raffle/assets/card-${person.avatar}.jpg" alt=""><span class="person-name">${person.name}<small class="person-note">${cards.length ? `ID ${person.id} · Лайк и обмен подтверждены` : reason(person)}</small></span><span class="person-count${cards.length ? '' : ' pending'}">${cardCount(cards.length)}</span><span class="chevron" aria-hidden="true">⌄</span></summary>
      <div class="person-detail">${cards.length ? `<div class="card-grid">${cards.map((card, index) => cardMarkup(card, index, cardState(card, false))).join('')}</div>` : `<div class="empty">${reason(person)}</div>`}</div>
    </details>`;
  }).join('') || '<div class="empty">Участники не найдены.</div>';
}

function renderFeed() {
  $('feed-count').textContent = round.reveals.length;
  const timeFormat = new Intl.DateTimeFormat('ru', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  $('feed').innerHTML = [...round.reveals].reverse().map(event => {
    const card = byCard.get(event.id);
    const person = byPerson.get(card.owner);
    const won = round.winners.includes(card.id);
    const time = timeFormat.format(event.at);
    return `<div class="feed-item"><img src="${artPath(card.art)}" alt="" loading="lazy"><div><strong>${person.name}</strong> ${won ? '<b>получает Премиум!</b>' : 'открывает карту'}<small>${artwork[card.art - 1]} · ${won ? '1 месяц' : 'Пусто'}<br>Обмен #${card.tradeId} · ${time}</small></div></div>`;
  }).join('') || '<div class="empty">Первые открытия появятся здесь после окончания таймера.</div>';
}

function renderHome() {
  $('total-people').textContent = new Set(pool.map(card => card.owner)).size;
  $('total-cards').textContent = pool.length;
  $('prizes').textContent = `${round.reveals.filter(event => round.winners.includes(event.id)).length} / 3`;
}

function renderMyCards() {
  const cards = viewer ? personCards(viewer) : [];
  $('my-count').hidden = !viewer;
  $('cards-login').hidden = Boolean(viewer);
  $('my-count').textContent = cardCount(cards.length);
  if (!viewer) $('my-note').textContent = 'Войди в свой профиль, чтобы посмотреть и открыть свои карты.';
  else if (!cards.length) $('my-note').textContent = reason(viewer);
  else $('my-note').textContent = round.winners.length ? `${viewer.name}, нажимай на карты, чтобы увидеть результат.` : `${viewer.name}, твои карты откроются после окончания таймера.`;
  const grid = $('my-grid');
  cards.forEach((card, index) => {
    const state = cardState(card, true);
    const current = grid.children[index];
    if (current?.dataset.card === card.id && current.dataset.state === state) return;
    if (current) {
      current.insertAdjacentHTML('beforebegin', cardMarkup(card, index, state));
      current.remove();
    } else {
      grid.insertAdjacentHTML('beforeend', cardMarkup(card, index, state));
    }
  });
  while (grid.children.length > cards.length) grid.lastElementChild.remove();
}

function render() {
  renderTimer();
  $('profile').querySelector('span').textContent = viewer?.name || 'Войти';
  $('logout').hidden = !viewer;
  $('reset').hidden = !viewer || currentPage !== 'home';
  if (currentPage === 'home') renderHome();
  if (!$('my-cards').hidden) renderMyCards();
  if (!$('participants').hidden) renderRoster();
  if (!$('activity').hidden) renderFeed();
}

function navigate(moveFocus = false) {
  const active = pages.find(page => `#${page.dataset.page}` === location.hash) || pages[0];
  currentPage = active.dataset.page;
  for (const page of pages) {
    page.hidden = currentPage === 'home' ? false : page !== active;
  }
  for (const link of document.querySelectorAll('.brand, .section-nav a')) {
    if (link.hash === `#${currentPage}`) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  const heading = active.querySelector('h1, h2');
  document.title = currentPage === 'home' ? 'Eternal Watchers — Розыгрыш ReManga Premium' : `${heading.textContent} — Eternal Watchers`;
  render();
  if (moveFocus) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

function syncRound() {
  const latest = readRound();
  if (!latest || JSON.stringify(latest) === JSON.stringify(round)) return;
  round = latest;
  render();
}

channel?.addEventListener('message', syncRound);
window.addEventListener('storage', event => { if (event.key === storageKey) syncRound(); });
window.addEventListener('hashchange', () => navigate(true));
document.addEventListener('click', event => {
  const card = event.target.closest('#my-grid button[data-card]');
  if (card && !card.disabled && !$('my-cards').hidden) void reveal(card.dataset.card);
  const tab = event.target.closest('[data-filter]');
  if (tab) {
    filter = tab.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', button === tab));
    renderRoster();
  }
  if (event.target.closest('[data-close]')) event.target.closest('dialog').close();
});

$('search').addEventListener('input', renderRoster);
$('rules').addEventListener('click', () => $('rules-dialog').showModal());
function openProfile() {
  $('profile-error').textContent = '';
  $('identity').value = '';
  $('profile-dialog').showModal();
}
$('profile').addEventListener('click', openProfile);
$('cards-login').addEventListener('click', openProfile);
$('identities').innerHTML = people.map(person => `<option value="${person.name}">ID ${person.id}</option>`).join('');
$('profile-form').addEventListener('submit', event => {
  event.preventDefault();
  const identity = $('identity').value.trim().toLowerCase();
  const matched = people.find(person => person.name.toLowerCase() === identity || String(person.id) === identity);
  if (!matched) { $('profile-error').textContent = 'Такого демо-профиля нет. Попробуй Akari или 14002.'; return; }
  viewer = matched;
  sessionStorage.setItem('bclub-viewer', String(viewer.id));
  $('profile-dialog').close();
  render();
});
$('logout').addEventListener('click', () => {
  viewer = undefined;
  sessionStorage.removeItem('bclub-viewer');
  $('profile-dialog').close();
  render();
});
$('finish').addEventListener('click', () => { if (viewer) void finalize(true); });
$('reset').addEventListener('click', () => { if (viewer) void changeRound(startRound); });
navigate();
setInterval(renderTimer, 250);
