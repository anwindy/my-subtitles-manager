let allMoviesData = [];
const TMDB_API_KEY = 'a873e1503b8e734bbd1297f6c38b2bc0'; // API Key công cộng hỗ trợ lấy thông tin phim

// 1. Tải dữ liệu từ cấu trúc data.json mới
async function fetchSubtitles() {
    try {
        const response = await fetch('data.json');
        const rawData = await response.json();
        
        // Trực tiếp gọi API TMDB để bổ sung thông tin chi tiết cho từng phim dựa vào ID
        allMoviesData = await Promise.all(rawData.map(async (item) => {
            const tmdbInfo = await getTMDBDetails(item.tmdb_id, item.type);
            return {
                ...item,
                slug: `${item.type}-${item.tmdb_id}`, // Tạo link quản lý dạng #tv-240437
                title: tmdbInfo.title,
                year: tmdbInfo.year,
                poster: tmdbInfo.poster
            };
        }));

        renderMovies(allMoviesData);
        checkUrlHash(); // Kiểm tra nếu người dùng vào thẳng bằng link ID
    } catch (error) {
        console.error("Lỗi nạp dữ liệu: ", error);
    }
}

// Hàm kết nối tới TMDB API để lấy Tên, Năm và Ảnh Poster theo ID
async function getTMDBDetails(id, type) {
    const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${8989fb6e6b15f99503ca9c5199f8141f}&language=en-US`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        
        // Nếu không có tiếng Việt thì lấy bản tiếng Anh đầy đủ
        const title = data.name || data.title || data.original_name || "Unknown Title";
        const releaseDate = data.first_air_date || data.release_date || "";
        const year = releaseDate ? releaseDate.split('-')[0] : "N/A";
        const poster = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "https://via.placeholder.com/500x750?text=No+Poster";
        
        return { title, year, poster };
    } catch (e) {
        return { title: `ID: ${id}`, year: "", poster: "https://via.placeholder.com/500x750?text=Error" };
    }
}

// 2. Hiển thị các thẻ phim ra màn hình chính
function renderMovies(moviesList) {
    const grid = document.getElementById('moviesGrid');
    grid.innerHTML = '';

    if (moviesList.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted);">Không tìm thấy phim.</p>`;
        return;
    }

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

// 3. Xử lý tìm kiếm
function handleSearch() {
    const query = document.getElementById('mainSearch').value.toLowerCase().trim();
    const titleSection = document.getElementById('sectionTitle');

    if (query === '') {
        titleSection.innerText = "Popular Titles";
        renderMovies(allMoviesData);
    } else {
        titleSection.innerText = `Kết quả tìm kiếm cho "${query}"`;
        const filtered = allMoviesData.filter(movie => 
            movie.title.toLowerCase().includes(query) || movie.tmdb_id.includes(query)
        );
        renderMovies(filtered);
    }
}
document.getElementById('mainSearch').addEventListener('input', handleSearch);

function resetSearch() {
    document.getElementById('mainSearch').value = '';
    window.location.hash = '';
    handleSearch();
}

// 4. Kiểm tra URL hash (Ví dụ: #tv-240437) để mở đúng trang phụ đề của phim đó luôn
function checkUrlHash() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const matchedMovie = allMoviesData.find(movie => movie.slug === hash);
        if (matchedMovie) {
            openSubModal(matchedMovie);
        }
    } else {
        closeModal();
    }
}
window.addEventListener('hashchange', checkUrlHash);

// 5. Hiển thị trang sub chi tiết (Modal)
function openSubModal(movie) {
    document.getElementById('modalPoster').src = movie.poster;
    document.getElementById('modalMovieTitle').innerText = movie.title;
    document.getElementById('modalMovieInfo').innerText = `${movie.year} • TMDB ID: ${movie.tmdb_id}`;
    
    const tbody = document.getElementById('modalSubList');
    tbody.innerHTML = '';

    movie.subs.forEach(sub => {
        const row = `
            <tr>
                <td><strong>${sub.flag} ${sub.lang}</strong></td>
                <td style="color: var(--text-muted); font-size: 14px;">${sub.name}</td>
                <td><a href="${sub.url}" class="btn-dl" download>Download</a></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    document.getElementById('subModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('subModal').style.display = 'none';
}

function closeMovieView() {
    window.location.hash = '';
}

document.querySelector('.close-btn').setAttribute('onclick', 'closeMovieView()');
window.onclick = function(event) {
    const modal = document.getElementById('subModal');
    if (event.target === modal) {
        closeMovieView();
    }
}

window.onload = fetchSubtitles;
