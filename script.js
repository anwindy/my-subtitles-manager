let allMovies = [];

// 1. Tải dữ liệu từ data.json khi trang web load xong
async function fetchSubtitles() {
    try {
        const response = await fetch('data.json');
        allMovies = await response.json();
        renderMovies(allMovies);
    } catch (error) {
        console.error("Lỗi nạp dữ liệu: ", error);
    }
}

// 2. Hàm hiển thị danh sách phim ra màn hình chính
function renderMovies(moviesList) {
    const grid = document.getElementById('moviesGrid');
    grid.innerHTML = '';

    if (moviesList.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted);">No results found.</p>`;
        return;
    }

    moviesList.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.onclick = () => openSubModal(movie); // Click để mở danh sách phụ đề chi tiết

        card.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <div class="movie-meta">${movie.year} • ${movie.type}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 3. Logic tìm kiếm từ khóa phim
function handleSearch() {
    const query = document.getElementById('mainSearch').value.toLowerCase().trim();
    const titleSection = document.getElementById('sectionTitle');

    if (query === '') {
        titleSection.innerText = "Popular Titles";
        renderMovies(allMovies);
    } else {
        titleSection.innerText = `Search Results for "${query}"`;
        const filtered = allMovies.filter(movie => 
            movie.title.toLowerCase().includes(query)
        );
        renderMovies(filtered);
    }
}

// Gắn sự kiện lắng nghe người dùng gõ chữ
document.getElementById('mainSearch').addEventListener('input', handleSearch);

function resetSearch() {
    document.getElementById('mainSearch').value = '';
    handleSearch();
}

// 4. Quản lý Đóng/Mở Modal Phụ Đề
function openSubModal(movie) {
    document.getElementById('modalPoster').src = movie.poster;
    document.getElementById('modalMovieTitle').innerText = movie.title;
    document.getElementById('modalMovieInfo').innerText = `${movie.year} • ${movie.type}`;
    
    const tbody = document.getElementById('modalSubList');
    tbody.innerHTML = '';

    // Đổ danh sách file .srt của phim này vào bảng
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

// Đóng modal nếu người dùng click ra ngoài vùng bảng dữ liệu
window.onclick = function(event) {
    const modal = document.getElementById('subModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

window.onload = fetchSubtitles;
