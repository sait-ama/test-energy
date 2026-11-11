'use strict';

const $ = id => document.getElementById(id);
const pages = [...document.querySelectorAll('[data-page]')];
let currentPage = 'home';
let filter = 'all';
let viewer;
let token = sessionStorage.getItem('ew-raffle-session') || '';
let challenge;
let openingCard = false;
let serverOffset = 0;
let lastServerTime = 0;
let connection = 'Подключение к розыгрышу…';
let round = { people: [], cards: [], reveals: [], finished: false, deadline: null, nextScan: null, post: '' };
let people = [];
let pool = [];
let byPerson = new Map();
let byCard = new Map();
let opened = new Map();

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

async function request(path, data, auth = token) {
  const headers = auth ? { Authorization: 'Bearer ' + auth } : {};
  if (data !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch('/raffle-api/' + path, {
    method: data === undefined ? 'GET' : 'POST', headers,
    body: data === undefined ? undefined : JSON.stringify(data), cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  if (response.status >= 500 && !response.headers.get('Content-Type')?.includes('application/json')) {
    throw new Error('Связь с сервером розыгрыша потеряна.');
  }
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Запрос не выполнен.');
  return result;
}

function useState(result) {
  const { serverTime, user, ...state } = result;
  if (serverTime < lastServerTime) return;
  lastServerTime = serverTime;
  serverOffset = serverTime - Date.now();
  const changed = connection || JSON.stringify(state) !== JSON.stringify(round) || user !== (viewer?.id ?? null);
  connection = '';
  if (!changed) return;
  round = state;
  people = round.people;
  pool = round.cards;
  byPerson = new Map(people.map(person => [person.id, person]));
  byCard = new Map(pool.map(card => [card.id, card]));
  opened = new Map(round.reveals.map(event => [event.id, event]));
  viewer = byPerson.get(user);
  render();
}

async function syncRound() {
  const auth = token;
  try {
    const result = await request('state', undefined, auth);
    if (auth === token) useState(result);
  } catch (error) {
    connection = error.message === 'Сервер розыгрыша пока не подключён.'
      ? error.message : 'Связь с сервером розыгрыша потеряна. Повторяем подключение.';
    renderTimer();
  }
}

async function reveal(cardId) {
  if (openingCard) return;
  openingCard = true;
  try {
    const auth = token;
    const result = await request('reveal', { card: cardId }, auth);
    if (auth !== token) return;
    useState({ ...result, user: viewer?.id ?? null });
    if ($('my-cards').hidden) return;
    const front = $('my-grid').querySelector('.card-front[data-card="' + cardId + '"]');
    if (!front) return;
    front.classList.add('reveal');
    await Promise.allSettled(front.getAnimations().map(animation => animation.finished));
    front.classList.remove('reveal');
  } catch (error) {
    $('my-note').textContent = error.message;
  } finally {
    openingCard = false;
  }
}

function countdown(timestamp) {
  const seconds = Math.max(0, Math.ceil((timestamp - Date.now() - serverOffset) / 1000));
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map(value => String(value).padStart(2, '0')).join(':');
}

function renderTimer() {
  $('phase').textContent = round.finished ? 'ПРИЗЫ РАСПРЕДЕЛЕНЫ' : 'ДО РАСПРЕДЕЛЕНИЯ ПРИЗОВ';
  $('time').textContent = round.finished ? 'Можно открывать карты' :
    round.deadline ? countdown(round.deadline) : 'Ожидаем начала';
  $('time').classList.toggle('finished', round.finished || !round.deadline);
  $('sync-time').textContent = connection || (round.nextScan ? 'Обновление через ' + countdown(round.nextScan) : '');
}

function cardState(card, allowReveal) {
  const event = opened.get(card.id);
  if (event) return event.won ? 'prize' : 'empty';
  return allowReveal && round.finished ? 'ready' : 'locked';
}

function cardMarkup(card, index, state) {
  if (state === 'prize' || state === 'empty') {
    const win = state === 'prize';
    return `<article class="trade-card card-front${win ? ' is-prize' : ''}" data-card="${card.id}" data-state="${state}" data-opened-at="${opened.get(card.id).at}">
      <img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.title)}" loading="lazy">
      <div class="card-caption"><strong>${win ? '✦ ПРЕМИУМ' : 'ПУСТО'}</strong><small>${escapeHtml(card.title)}</small><small>Обмен #${card.tradeId}</small></div>
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
  if (person.pending) return 'Обмен ожидает принятия';
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
      <summary><img class="avatar" src="${escapeHtml(person.avatar || '/raffle/assets/watchers-hero.png')}" alt=""><span class="person-name">${escapeHtml(person.name)}<small class="person-note">${cards.length ? `ID ${person.id} · Лайк и обмен подтверждены` : reason(person)}</small></span><span class="person-count${cards.length ? '' : ' pending'}">${cardCount(cards.length)}</span><span class="chevron" aria-hidden="true">⌄</span></summary>
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
    const won = event.won;
    const time = timeFormat.format(event.at);
    return `<div class="feed-item"><img src="${escapeHtml(card.image)}" alt="" loading="lazy"><div><strong>${escapeHtml(person.name)}</strong> ${won ? '<b>получает Премиум!</b>' : 'открывает карту'}<small>${escapeHtml(card.title)} · ${won ? '1 месяц' : 'Пусто'}<br>Обмен #${card.tradeId} · ${time}</small></div></div>`;
  }).join('') || '<div class="empty">Первые открытия появятся здесь после окончания таймера.</div>';
}

function renderHome() {
  $('total-people').textContent = new Set(pool.map(card => card.owner)).size;
  $('total-cards').textContent = pool.length;
  $('prizes').textContent = `${round.reveals.filter(event => event.won).length} / 3`;
}

function renderMyCards() {
  const cards = viewer ? personCards(viewer) : [];
  $('my-count').hidden = !viewer;
  $('cards-login').hidden = Boolean(viewer);
  $('my-count').textContent = cardCount(cards.length);
  if (!viewer) $('my-note').textContent = 'Войди в свой профиль, чтобы посмотреть и открыть свои карты.';
  else if (!cards.length) $('my-note').textContent = reason(viewer);
  else $('my-note').textContent = round.finished ? `${viewer.name}, нажимай на карты, чтобы увидеть результат.` : `${viewer.name}, твои карты откроются после окончания таймера.`;
  const grid = $('my-grid');
  cards.forEach((card, index) => {
    const state = cardState(card, true);
    const current = grid.children[index];
    if (current?.dataset.card === card.id && current.dataset.state === state &&
        (state === 'ready' || state === 'locked' || current.dataset.openedAt === String(opened.get(card.id).at))) return;
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
  $('post-link').hidden = !round.post;
  if (round.post) $('post-link').href = round.post;
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
  challenge = undefined;
  $('identity').value = '';
  $('identity').readOnly = false;
  $('profile-code').hidden = true;
  $('profile-submit').textContent = 'Получить код';
  $('profile-dialog').showModal();
}
$('profile').addEventListener('click', openProfile);
$('cards-login').addEventListener('click', openProfile);

$('profile-form').addEventListener('submit', async event => {
  event.preventDefault();
  const submit = $('profile-submit');
  if (submit.disabled) return;
  submit.disabled = true;
  $('profile-error').textContent = '';
  try {
    const result = await request('login', challenge ? { challenge } : { identity: $('identity').value });
    if (result.challenge) {
      challenge = result.challenge;
      $('profile-code').hidden = false;
      $('profile-code-value').textContent = result.code;
      $('identity').readOnly = true;
      submit.textContent = 'Проверить код';
    } else {
      token = result.token;
      sessionStorage.setItem('ew-raffle-session', token);
      $('profile-dialog').close();
      await syncRound();
    }
  } catch (error) {
    $('profile-error').textContent = error.message;
  } finally {
    submit.disabled = false;
  }
});

$('logout').addEventListener('click', () => {
  token = '';
  viewer = undefined;
  sessionStorage.removeItem('ew-raffle-session');
  $('profile-dialog').close();
  render();
});

async function poll() {
  await syncRound();
  setTimeout(poll, 2500);
}

navigate();
void poll();
setInterval(renderTimer, 250);
