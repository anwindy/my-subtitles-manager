let allMovies = [];

// 1. Tải dữ liệu từ data.json khi trang web load xong
async function fetchSubtitles() {
    try {
        const response = await fetch('data.json');
        allMovies = await response.json();
        renderMovies(allMovies);
        
        // KIỂM TRA ĐƯỜNG LINK: Nếu trên link có sẵn #slug-phim thì mở luôn phim đó
        checkUrlHash();
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
        // Thay vì chỉ mở Modal, ta sẽ đổi Hash trên URL
        card.onclick = () => {
            window.location.hash = movie.slug;
        }; 

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
    window.location.hash = ''; // Xóa hash khi bấm về trang chủ
    handleSearch();
}

// 4. Hàm kiểm tra URL Hash để mở đúng phim theo link
function checkUrlHash() {
    const hash = window.location.hash.substring(1); // Lấy chữ sau dấu #
    if (hash) {
        const matchedMovie = allMovies.find(movie => movie.slug === hash);
        if (matchedMovie) {
            openSubModal(matchedMovie);
        }
    } else {
        closeModal();
    }
}

// Theo dõi nếu người dùng bấm "Back" (Quay lại) trên trình duyệt hoặc thay đổi URL
window.addEventListener('hashchange', checkUrlHash);

// 5. Quản lý Đóng/Mở Modal Phụ Đề
function openSubModal(movie) {
    document.getElementById('modalPoster').src = movie.poster;
    document.getElementById('modalMovieTitle').innerText = movie.title;
    document.getElementById('modalMovieInfo').innerText = `${movie.year} • ${movie.type}`;
    
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

// Khi bấm nút X hoặc bấm ra ngoài bảng, ta xóa hash trên URL để đóng tab phim
function closeMovieView() {
    window.location.hash = ''; // Tự động kích hoạt đóng modal qua sự kiện hashchange
}

// Cập nhật lại nút đóng trong HTML (Sửa hàm gọi thành closeMovieView)
document.querySelector('.close-btn').setAttribute('onclick', 'closeMovieView()');
window.onclick = function(event) {
    const modal = document.getElementById('subModal');
    if (event.target === modal) {
        closeMovieView();
    }
}

window.onload = fetchSubtitles;
