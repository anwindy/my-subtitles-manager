let allMoviesData = [];
const TMDB_API_KEY = 'a873e1503b8e734bbd1297f6c38b2bc0'; 
const PROXY_URL = 'https://corsproxy.io/?'; // Proxy trung gian để vượt chặn

async function fetchSubtitles() {
    try {
        const response = await fetch('data.json');
        const rawData = await response.json();
        
        allMoviesData = await Promise.all(rawData.map(async (item) => {
            const tmdbInfo = await getTMDBDetails(item.tmdb_id, item.type);
            return {
                ...item,
                slug: `${item.type}-${item.tmdb_id}`,
                title: tmdbInfo.title,
                year: tmdbInfo.year,
                poster: tmdbInfo.poster
            };
        }));

        renderMovies(allMoviesData);
        checkUrlHash();
    } catch (error) {
        console.error("Lỗi nạp dữ liệu: ", error);
    }
}

async function getTMDBDetails(id, type) {
    // Kết hợp Proxy với URL API của TMDB
    const targetUrl = `https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_API_KEY}&language=vi-VN`;
    const finalUrl = PROXY_URL + encodeURIComponent(targetUrl);

    try {
        const res = await fetch(finalUrl);
        const data = await res.json();
        
        const title = data.name || data.title || data.original_name || "Unknown Title";
        const releaseDate = data.first_air_date || data.release_date || "";
        const year = releaseDate ? releaseDate.split('-')[0] : "N/A";
        const poster = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "https://via.placeholder.com/500x750?text=No+Poster";
        
        return { title, year, poster };
    } catch (e) {
        return { title: `ID: ${id}`, year: "", poster: "https://via.placeholder.com/500x750?text=Offline" };
    }
}

// Các hàm bên dưới giữ nguyên như logic đã thảo luận
function renderMovies(moviesList) {
    const grid = document.getElementById('moviesGrid');
    grid.innerHTML = '';
    moviesList.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.onclick = () => { window.location.hash = movie.slug; }; 
        card.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <div class="movie-meta">${movie.year} • ${movie.type.toUpperCase()}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function checkUrlHash() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const matchedMovie = allMoviesData.find(movie => movie.slug === hash);
        if (matchedMovie) openSubModal(matchedMovie);
    }
}

window.addEventListener('hashchange', checkUrlHash);

function openSubModal(movie) {
    document.getElementById('modalPoster').src = movie.poster;
    document.getElementById('modalMovieTitle').innerText = movie.title;
    document.getElementById('modalMovieInfo').innerText = `${movie.year} • ID: ${movie.tmdb_id}`;
    const tbody = document.getElementById('modalSubList');
    tbody.innerHTML = '';
    movie.subs.forEach(sub => {
        const row = `<tr><td><strong>${sub.flag} ${sub.lang}</strong></td><td>${sub.name}</td><td><a href="${sub.url}" class="btn-dl" download>Download</a></td></tr>`;
        tbody.innerHTML += row;
    });
    document.getElementById('subModal').style.display = 'flex';
}

function closeMovieView() { window.location.hash = ''; document.getElementById('subModal').style.display = 'none'; }
document.querySelector('.close-btn').onclick = closeMovieView;

window.onload = fetchSubtitles;
