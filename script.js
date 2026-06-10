let allMoviesData = [];

// 1. Tải dữ liệu cục bộ từ data.json
async function fetchSubtitles() {
    try {
        const response = await fetch('data.json');
        allMoviesData = await response.json();
        
        // Hiển thị ngay danh sách phim lên giao diện
        renderMovies(allMoviesData);
        
        // Kiểm tra xem người dùng có vào bằng link trực tiếp không (Ví dụ: #tv-240437)
        checkUrlHash();
    } catch (error) {
        console.error("Lỗi nạp dữ liệu cục bộ: ", error);
    }
}

// 2. Hiển thị các thẻ phim ra màn hình chính
function renderMovies(moviesList) {
    const grid = document.getElementById('moviesGrid');
    grid.innerHTML = '';

    if (moviesList.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted);">Không tìm thấy phim phù hợp.</p>`;
        return;
    }

    moviesList.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        // Thay đổi URL hash để kích hoạt mở trang quản lý phim
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

// 3. Xử lý tìm kiếm (Tìm theo Tên hoặc theo ID phim)
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

// 4. Kiểm tra URL hash để điều hướng thẳng vào trang sub của phim
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

// 5. Hiển thị bảng quản lý phụ đề chi tiết của phim đó
function openSubModal(movie) {
    document.getElementById('modalPoster').src = movie.poster;
    document.getElementById('modalMovieTitle').innerText = movie.title;
    document.getElementById('modalMovieInfo').innerText = `${movie.year} • ID: ${movie.tmdb_id}`;
    
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

// Khi đóng phim, xóa hash trên thanh địa chỉ để đưa URL về trạng thái trang chủ
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

// Chạy ứng dụng
window.onload = fetchSubtitles;
