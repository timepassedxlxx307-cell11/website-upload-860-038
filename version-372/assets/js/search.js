import { SEARCH_INDEX } from './search-data.js';

const params = new URLSearchParams(window.location.search);
const query = (params.get('q') || '').trim();
const input = document.getElementById('searchInput');
const title = document.getElementById('searchTitle');
const results = document.getElementById('searchResults');

if (input) {
  input.value = query;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[character];
  });
}

function matchMovie(movie, keyword) {
  if (!keyword) {
    return true;
  }

  const haystack = [
    movie.title,
    movie.year,
    movie.region,
    movie.type,
    movie.genre,
    movie.category,
    movie.summary,
    (movie.tags || []).join(' ')
  ].join(' ').toLowerCase();

  return haystack.indexOf(keyword.toLowerCase()) !== -1;
}

function renderCard(movie) {
  const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
    return '<span>' + escapeHtml(tag) + '</span>';
  }).join('');

  return '<article class="movie-card compact">' +
    '<a class="poster-link" href="' + escapeHtml(movie.url) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="score">' + escapeHtml(movie.rating) + '</span>' +
    '</a>' +
    '<div class="card-body">' +
      '<div class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</div>' +
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.summary) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
    '</div>' +
  '</article>';
}

if (results && title) {
  const matched = SEARCH_INDEX.filter(function (movie) {
    return matchMovie(movie, query);
  }).slice(0, 120);

  if (query) {
    title.textContent = '“' + query + '” 的搜索结果';
  }

  if (matched.length) {
    results.innerHTML = matched.map(renderCard).join('');
  } else {
    results.innerHTML = '<p class="empty-state">暂无匹配内容</p>';
  }
}
