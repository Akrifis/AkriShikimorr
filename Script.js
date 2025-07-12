// Конфигурация
const USERNAME = 'Akrifis'; // Замените на ваш ник
const API_URL = `https://shikimori.one/api/users/${USERNAME}`;

// Элементы
const elements = {
    avatar: document.getElementById('user-avatar'),
    username: document.getElementById('username'),
    animeCount: document.getElementById('anime-count'),
    mangaCount: document.getElementById('manga-count'),
    friendsCount: document.getElementById('friends-count'),
    animeList: document.getElementById('anime-list'),
    loader: document.getElementById('loader'),
    updateTime: document.getElementById('update-time'),
    tabs: document.querySelectorAll('.tab-btn')
};

let animeData = [];

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    await loadProfile();
    await loadAnimeList();
    setupTabs();
});

// Загрузка профиля
async function loadProfile() {
    try {
        const response = await fetchWithProxy(`${API_URL}`);
        const user = await response.json();
        
        elements.avatar.src = `https://shikimori.one${user.avatar}`;
        elements.username.textContent = user.nickname;
        elements.animeCount.textContent = user.stats.anime_counts.total;
        elements.mangaCount.textContent = user.stats.manga_counts.total;
        elements.friendsCount.textContent = user.stats.friends_count;
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
    }
}

// Загрузка списка аниме
async function loadAnimeList() {
    elements.loader.style.display = 'flex';
    elements.animeList.innerHTML = '';
    
    try {
        const response = await fetchWithProxy(`${API_URL}/anime_rates?limit=5000`);
        animeData = await response.json();
        renderAnimeList('watching');
    } catch (error) {
        console.error('Ошибка загрузки аниме:', error);
        elements.animeList.innerHTML = '<p class="error">Ошибка загрузки данных</p>';
    } finally {
        elements.loader.style.display = 'none';
        updateTime();
    }
}

// Рендер списка
function renderAnimeList(status) {
    const filtered = animeData.filter(item => item.status === status);
    
    elements.animeList.innerHTML = filtered.map(anime => `
        <div class="anime-card">
            <img class="anime-poster" src="https://shikimori.one${anime.anime.image.preview}" alt="${anime.anime.russian || anime.anime.name}">
            <div class="anime-info">
                <h3 class="anime-title">${anime.anime.russian || anime.anime.name}</h3>
                <div class="anime-meta">
                    <span>${anime.episodes}/${anime.anime.episodes || '?'} эп.</span>
                    <span>${anime.score ? '★'.repeat(anime.score) : '—'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Настройка табов
function setupTabs() {
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            elements.tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderAnimeList(tab.dataset.tab);
        });
    });
}

// Обновление времени
function updateTime() {
    const now = new Date();
    elements.updateTime.textContent = now.toLocaleString();
}

// Прокси для обхода CORS
async function fetchWithProxy(url) {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('Network error');
    
    const data = await response.json();
    return new Response(data.contents, {
        headers: { 'Content-Type': 'application/json' }
    });
}
