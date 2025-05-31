// recommendation.js
class RecommendationPage {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('tripTaktikCurrentUser')) || null;
        this.authPageUrl = '../auth/auth.html';
        this.homePageUrl = '../home/home.html';
        this.detailPageUrl = '../detail/detail-page.html';

        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.allResults = [];
        this.currentFilter = null;

        this.init();
    }

    init() {
        if (!this.currentUser) {
            this.redirectToAuth();
            return;
        }
        this.bindGlobalEvents();
        this.checkInitialFilter();
        this.initializeActiveNav();
    }

    bindGlobalEvents() {
        const searchBtn = document.getElementById('searchRecommendationsBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchRecommendations());
        } else {
            console.warn("Tombol Search (searchRecommendationsBtn) tidak ditemukan.");
        }

        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMore());
        } else {
            console.warn("Tombol Load More (loadMoreBtn) tidak ditemukan.");
        }
    }

    initializeActiveNav() {
        document.querySelectorAll('.nav-links a').forEach(link => {
            if (link.getAttribute('href') === 'recommendation.html') {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    checkInitialFilter() {
        const urlParams = new URLSearchParams(window.location.search);
        const jenisFromHome = urlParams.get('jenis');
        if (jenisFromHome) {
            const selectElement = document.getElementById('jenisWisataSelectRecom');
            if (selectElement) {
                selectElement.value = jenisFromHome;
            }
            this.searchRecommendations();
        }
    }

    searchRecommendations() {
        const jenisWisata = document.getElementById('jenisWisataSelectRecom').value;
        this.currentFilter = jenisWisata;
        this.currentPage = 1;
        this.allResults = [];

        if (!jenisWisata) {
            this.resetView("Silakan pilih jenis wisata untuk memulai pencarian.");
            return;
        }

        document.getElementById('defaultMessage').style.display = 'none';
        document.getElementById('resultsContainer').innerHTML = '';
        document.getElementById('resultsContainer').style.display = 'none';
        document.getElementById('loadMoreSection').style.display = 'none';
        document.getElementById('loadingSection').style.display = 'block';

        setTimeout(() => {
            document.getElementById('loadingSection').style.display = 'none';
            this.allResults = this.generateMockResults(jenisWisata);
            this.displayResultsPage();
        }, 1200);
    }

    generateMockResults(jenisWisata) {
        const baseResults = [
            { id: 'rec1', title: `Hasil Alam ${jenisWisata || 'Indah'} 1`, rating: 4.5, location: 'Lokasi Alam A', description: 'Deskripsi menarik tentang Pesona Alam Desa Hijau yang menyejukkan mata dan jiwa.', imagePlaceholder: '🏞️', type: 'alam' },
            { id: 'rec2', title: `Sejarah ${jenisWisata || 'Kuno'} Kota Lama`, rating: 4.8, location: 'Kota Bersejarah B', description: 'Jelajahi Jejak Sejarah Kerajaan Kuno dengan arsitektur yang memukau.', imagePlaceholder: '🏛️', type: 'sejarah' },
            { id: 'rec3', title: `Kuliner Wajib Coba di ${jenisWisata || 'Pasar'}`, rating: 4.6, location: 'Pusat Kuliner C', description: 'Cicipi Kuliner Khas Nusantara yang otentik dan menggugah selera.', imagePlaceholder: '🍜', type: 'kuliner' },
            { id: 'rec4', title: `Pantai ${jenisWisata || 'Eksotis'} Matahari Terbenam`, rating: 4.7, location: 'Pulau Tropis D', description: 'Bersantai di Pantai Pasir Putih Eksotis dengan air laut yang jernih.', imagePlaceholder: '🏖️', type: 'pantai' },
            { id: 'rec5', title: `Festival ${jenisWisata || 'Budaya'} Meriah`, rating: 4.4, location: 'Alun-Alun E', description: 'Saksikan kemeriahan Festival Budaya Tahunan yang menampilkan tradisi lokal.', imagePlaceholder: '🎭', type: 'budaya' },
            { id: 'rec6', title: `Pendakian Gunung ${jenisWisata || 'Megah'}`, rating: 4.9, location: 'Pegunungan F', description: 'Tantang dirimu dengan mendaki gunung yang menawarkan pemandangan spektakuler.', imagePlaceholder: '⛰️', type: 'gunung' },
            { id: 'rec7', title: `Air Terjun ${jenisWisata || 'Alami'} yang Segar`, rating: 4.3, location: 'Lembah G', description: 'Temukan keindahan air terjun tersembunyi di tengah hutan yang rimbun.', imagePlaceholder: '🏞️', type: 'alam' },
            { id: 'rec8', title: `Museum ${jenisWisata || 'Seni'} Kontemporer`, rating: 4.5, location: 'Distrik Kreatif H', description: 'Jelajahi karya seni modern dari seniman lokal dan internasional.', imagePlaceholder: '🖼️', type: 'budaya' },
            { id: 'rec9', title: `Kopi ${jenisWisata || 'Legendaris'} di Pagi Hari`, rating: 4.6, location: 'Kedai Kopi I', description: 'Nikmati secangkir kopi dari biji pilihan dengan suasana yang khas.', imagePlaceholder: '☕', type: 'kuliner' },
            { id: 'rec10', title: `Candi ${jenisWisata || 'Misterius'} di Kaki Gunung`, rating: 4.2, location: 'Area Purbakala J', description: 'Ungkap misteri candi kuno yang tersembunyi di kaki gunung.', imagePlaceholder: '🏛️', type: 'sejarah' },
            { id: 'rec11', title: `Danau ${jenisWisata || 'Tenang'} di Dataran Tinggi`, rating: 4.7, location: 'Kawasan Dataran Tinggi K', description: 'Nikmati ketenangan danau dengan pemandangan pegunungan yang indah.', imagePlaceholder: '🏞️', type: 'alam' },
            { id: 'rec12', title: `Pasar Apung ${jenisWisata || 'Tradisional'}`, rating: 4.5, location: 'Sungai Kota L', description: 'Rasakan pengalaman unik berbelanja di pasar apung tradisional.', imagePlaceholder: '🛶', type: 'budaya' }
        ];

        if (jenisWisata) {
            return baseResults.filter(item => item.type === jenisWisata);
        }

        return [];
    }

    displayResultsPage() {
        const resultsContainer = document.getElementById('resultsContainer');
        const loadMoreSection = document.getElementById('loadMoreSection');

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageResults = this.allResults.slice(startIndex, endIndex);

        if (this.currentPage === 1) resultsContainer.innerHTML = '';

        if (pageResults.length === 0 && this.currentPage === 1) {
            resultsContainer.innerHTML = `
                <div class="default-message">
                    <div class="icon">🤷</div>
                    <h2>Oops! Tidak ada rekomendasi ditemukan.</h2>
                    <p>Coba ganti pilihan filter Anda atau periksa kembali nanti.</p>
                </div>`;
            resultsContainer.style.display = 'block';
            loadMoreSection.style.display = 'none';
            return;
        }

        pageResults.forEach(item => {
            const isFavorited = this.isBookmarked(item.id);
            const cardHTML = `
                <div class="destination-card" data-id="${item.id}">
                    <div class="destination-image">
                        <img src="${item.imageUrl || '../images/placeholder-image.jpg'}" alt="${item.title}">
                    </div>
                    <div class="destination-info">
                        <div class="destination-header">
                            <div class="destination-title">${item.title}</div>
                            <div class="destination-rating">
                                <span class="stars">${this.getStarRating(parseFloat(item.rating))}</span>
                                <span class="rating-number">${item.rating}</span>
                            </div>
                            <div class="destination-location">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${item.location}</span>
                            </div>
                        </div>
                        <div class="destination-description">${item.description}</div>
                        <div class="destination-footer">
                            <button class="bookmark-btn ${isFavorited ? 'favorited' : ''}" data-item-id="${item.id}" data-item-name="${item.title}" title="${isFavorited ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}">
                                <i class="${isFavorited ? 'fas' : 'far'} fa-bookmark"></i>
                            </button>
                            <button class="view-btn" data-item-id="${item.id}" data-item-name="${item.title}">View Detail</button>
                        </div>
                    </div>
                </div>`;
            resultsContainer.insertAdjacentHTML('beforeend', cardHTML);
        });

        resultsContainer.style.display = 'block';
        this.bindCardButtons();

        if (endIndex < this.allResults.length) {
            loadMoreSection.style.display = 'block';
        } else {
            loadMoreSection.style.display = 'none';
        }
    }

    bindCardButtons() {
        // Tombol bookmark
        document.querySelectorAll('.destination-card .bookmark-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', (e) => {
                const itemId = e.currentTarget.dataset.itemId;
                const itemName = e.currentTarget.dataset.itemName;
                this.toggleBookmark(itemId, itemName, e.currentTarget);
            });
        });

        // Tombol detail
        document.querySelectorAll('.destination-card .view-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', (e) => {
                const itemId = e.currentTarget.dataset.itemId;
                const itemName = e.currentTarget.dataset.itemName;
                this.viewDetails(itemId, itemName);
            });
        });
    }

    getStarRating(ratingValue) {
        let stars = '';
        const full = Math.floor(ratingValue);
        const half = ratingValue % 1 >= 0.5;
        const empty = 5 - full - (half ? 1 : 0);

        for (let i = 0; i < full; i++) stars += '<i class="fas fa-star"></i>';
        if (half) stars += '<i class="fas fa-star-half-alt"></i>';
        for (let i = 0; i < empty; i++) stars += '<i class="far fa-star"></i>';

        return stars;
    }

    isBookmarked(itemId) {
        if (!this.currentUser) return false;
        const userId = this.currentUser.id || this.currentUser.username;
        const bookmarks = JSON.parse(localStorage.getItem(`tripTaktikUserWishlist_${userId}`)) || [];
        return bookmarks.some(bookmark => bookmark.id === itemId);
    }

    toggleBookmark(itemId, itemName, buttonElement) {
        if (!this.currentUser) {
            this.showNotification("Login untuk menambahkan ke wishlist.", "error");
            return;
        }

        const userId = this.currentUser.id || this.currentUser.username;
        let bookmarks = JSON.parse(localStorage.getItem(`tripTaktikUserWishlist_${userId}`)) || [];
        const itemIndex = bookmarks.findIndex(bookmark => bookmark.id === itemId);
        const icon = buttonElement.querySelector('i');

        if (itemIndex > -1) {
            bookmarks.splice(itemIndex, 1);
            buttonElement.classList.remove('favorited');
            icon.classList.remove('fas');
            icon.classList.add('far');
            buttonElement.title = "Simpan ke Wishlist";
            this.showNotification(`"${itemName}" dihapus dari wishlist.`, 'info');
        } else {
            const itemDetails = this.allResults.find(res => res.id === itemId) || { id: itemId, name: itemName };
            bookmarks.push(itemDetails);
            buttonElement.classList.add('favorited');
            icon.classList.remove('far');
            icon.classList.add('fas');
            buttonElement.title = "Hapus dari Wishlist";
            this.showNotification(`"${itemName}" ditambahkan ke wishlist!`, 'success');
        }

        localStorage.setItem(`tripTaktikUserWishlist_${userId}`, JSON.stringify(bookmarks));
    }

    viewDetails(id, title) {
        window.location.href = `${this.detailPageUrl}?id=${id || encodeURIComponent(title)}`;
    }

    loadMore() {
        this.currentPage++;
        this.displayResultsPage();
    }

    resetView(message = "Silahkan pilih jenis wisata yang anda sukai") {
        const defaultMsgEl = document.getElementById('defaultMessage');

        defaultMsgEl.querySelector('h2').textContent = message.includes("Oops")
            ? "Oops! Tidak ada rekomendasi ditemukan."
            : "Silahkan pilih jenis wisata yang anda sukai";

        defaultMsgEl.querySelector('p').textContent = message.includes("Oops")
            ? "Coba ganti pilihan filter Anda atau periksa kembali nanti."
            : "Gunakan filter di atas untuk mendapatkan rekomendasi wisata terbaik sesuai dengan preferensi Anda.";

        defaultMsgEl.style.display = 'block';
        document.getElementById('resultsContainer').style.display = 'none';
        document.getElementById('resultsContainer').innerHTML = '';
        document.getElementById('loadMoreSection').style.display = 'none';
        document.getElementById('loadingSection').style.display = 'none';
    }

    redirectToAuth() {
        window.location.href = this.authPageUrl;
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) {
            console.warn("Notification container tidak ditemukan!");
            alert(message);
            return;
        }

        const notif = document.createElement('div');
        notif.className = `notification-item type-${type}`;
        notif.textContent = message;

        Object.assign(notif.style, {
            padding: '12px 20px',
            marginBottom: '10px',
            borderRadius: '6px',
            color: 'white',
            opacity: '0',
            transition: 'opacity 0.4s ease, transform 0.4s ease, visibility 0s linear 0.4s',
            transform: 'translateX(110%)',
            visibility: 'hidden',
            minWidth: '280px',
            textAlign: 'left'
        });

        if (type === 'success') notif.style.backgroundColor = '#28a745';
        else if (type === 'error') notif.style.backgroundColor = '#dc3545';
        else notif.style.backgroundColor = '#17a2b8';

        container.prepend(notif);

        setTimeout(() => {
            notif.style.opacity = '1';
            notif.style.transform = 'translateX(0)';
            notif.style.visibility = 'visible';
        }, 10);

        setTimeout(() => {
            notif.style.opacity = '0';
            notif.style.transform = 'translateX(110%)';
            setTimeout(() => {
                notif.style.visibility = 'hidden';
                notif.remove();
            }, 400);
        }, 3500);
    }
}

// Logout helper
const logoutPage = {
    authPageUrl: '../auth/auth.html',
    logout: function () {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            localStorage.removeItem('tripTaktikCurrentUser');
            if (typeof recommendationApp !== 'undefined' && recommendationApp && typeof recommendationApp.showNotification === 'function') {
                recommendationApp.showNotification('Berhasil keluar!', 'success');
            } else {
                alert('Berhasil keluar!');
            }
            setTimeout(() => {
                window.location.href = this.authPageUrl;
            }, 1500);
        }
    }
};

let recommendationApp;

document.addEventListener('DOMContentLoaded', () => {
    recommendationApp = new RecommendationPage();
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden && typeof recommendationApp !== 'undefined' && recommendationApp) {
        const currentUser = JSON.parse(localStorage.getItem('tripTaktikCurrentUser'));
        if (!currentUser && typeof recommendationApp.redirectToAuth === 'function') {
            if (!window.location.pathname.includes(recommendationApp.authPageUrl.replace('..', ''))) {
                recommendationApp.redirectToAuth();
            }
        }
    }
});