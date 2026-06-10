let subtitleData = [];

// 1. Tải dữ liệu từ file data.json
async function loadSubtitles() {
    try {
        const response = await fetch('data.json');
        subtitleData = await response.json();
        displaySubtitles(subtitleData);
    } catch (error) {
        console.error("Không thể tải dữ liệu phụ đề:", error);
    }
}

// 2. Hiển thị danh sách ra bảng HTML
function displaySubtitles(data) {
    const tbody = document.getElementById('subList');
    tbody.innerHTML = ''; // Xóa dữ liệu cũ

    if(data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Không tìm thấy phụ đề phù hợp.</td></tr>`;
        return;
    }

    data.forEach((item, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${item.title}</strong></td>
                <td>${item.category}</td>
                <td>${item.language}</td>
                <td><a href="${item.file_url}" class="btn-download" download>Tải về (.srt)</a></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// 3. Logic Lọc và Tìm kiếm (Xử lý mượt mà cả với 1000 files)
function filterData() {
    const searchTxt = document.getElementById('searchBar').value.toLowerCase();
    const categoryVal = document.getElementById('categoryFilter').value;
    const langVal = document.getElementById('langFilter').value;

    const filtered = subtitleData.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTxt);
        const matchesCategory = categoryVal === "" || item.category === categoryVal;
        const matchesLang = langVal === "" || item.language === langVal;

        return matchesSearch && matchesCategory && matchesLang;
    });

    displaySubtitles(filtered);
}

// Lắng nghe sự kiện người dùng gõ chữ hoặc chọn bộ lọc
document.getElementById('searchBar').addEventListener('input', filterData);
document.getElementById('categoryFilter').addEventListener('change', filterData);
document.getElementById('langFilter').addEventListener('change', filterData);

// Chạy hàm tải dữ liệu khi trang web sẵn sàng
window.onload = loadSubtitles;