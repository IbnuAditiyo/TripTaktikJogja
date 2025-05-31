class DetailPageSystem {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('tripTaktikCurrentUser')) || null;
        this.authPageUrl = '../auth/auth.html';
        this.wishlistKeyPrefix = 'tripTaktikUserWishlist_';
        this.currentPlace = null;

        this.init();
    }

    init() {
        if (!this.currentUser) {
            this.redirectToAuth();
            return;
        }

        this.bindEvents();
        this.loadPlaceDetails();
        this.initializeNavigation();
    }

    bindEvents() {
        const wishlistBtn = document.getElementById('toggleWishlistBtn');
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', () => this.toggleWishlist());
        }
    }

    initializeNavigation() {
        const navLinks = document.querySelectorAll('.nav-menu a');

        navLinks.forEach(link => {
            if (link.textContent.trim().toLowerCase() === 'rekomendasi') {
                // Jika ingin menandai 'Rekomendasi' sebagai aktif, aktifkan baris di bawah:
                // link.classList.add('active');
            }
        });
    }

    getPlaceIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || urlParams.get('place');
    }

    getDummyPlaceData(placeIdentifier) {
        const allPlaces = [
            {
                id: "pop1",
                name: 'Candi Borobudur',
                rating: 4.8,
                location: 'Magelang, Jawa Tengah',
                imageUrl: '../images/candi-borobudur1.png',
                description: 'Candi Borobudur adalah mahakarya arsitektur Buddha terbesar di dunia...',
                operatingHours: '06.30 - 17.00 WIB',
                tourType: 'Wisata Sejarah & Budaya',
                ticketPrice: 'Rp 50.000 - Rp 500.000',
                mapEmbedUrl: 'https://www.google.com/maps/embed?...'
            },
            {
                id: "pop2",
                name: 'Pantai Kuta',
                rating: 4.5,
                location: 'Bali',
                imageUrl: '../images/pantai-parang-tritis2.png',
                description: 'Pantai Kuta terkenal dengan pasir putihnya...',
                operatingHours: '24 Jam (Area Pantai)',
                tourType: 'Wisata Pantai & Rekreasi',
                ticketPrice: 'Gratis (Parkir mungkin bayar)',
                mapEmbedUrl: 'https://www.google.com/maps/embed?...'
            },
            {
                id: "pop3",
                name: 'Malioboro Street',
                rating: 4.6,
                location: 'Yogyakarta',
                imageUrl: '../images/jalan2.jpg',
                description: 'Jalan Malioboro adalah jantung kota Yogyakarta...',
                operatingHours: 'Toko umumnya 09.00 - 21.00 WIB',
                tourType: 'Wisata Belanja & Kuliner',
                ticketPrice: 'Gratis (Belanja sesuai keinginan)',
                mapEmbedUrl: 'https://www.google.com/maps/embed?...'
            }
        ];

        return allPlaces.find(place =>
            place.id === placeIdentifier ||
            place.name.toLowerCase() === placeIdentifier.toLowerCase()
        );
    }

    loadPlaceDetails() {
        const placeIdentifier = this.getPlaceIdFromUrl();
        if (!placeIdentifier) {
            this.displayError('Data wisata tidak ditemukan.');
            return;
        }

        this.currentPlace = this.getDummyPlaceData(placeIdentifier);

        if (!this.currentPlace) {
            this.displayError(`Detail untuk "${placeIdentifier}" tidak ditemukan.`);
            return;
        }

        this.renderPlaceDetails();
        this.updateWishlistButtonState();
    }

    renderPlaceDetails() {
        const data = this.currentPlace;

        document.getElementById('pageTitle').textContent = `${data.name} - Trip.Taktik`;
        document.getElementById('heroImage').src = data.imageUrl || '../images/placeholder-image.jpg';
        document.getElementById('heroImage').alt = data.name;
        document.getElementById('destinationTitle').textContent = data.name;
        document.getElementById('ratingScore').textContent = data.rating ? data.rating.toFixed(1) : '-';
        this.renderStars(data.rating || 0);
        document.getElementById('destinationLocation').textContent = data.location || '-';
        document.getElementById('operatingHours').textContent = data.operatingHours || '-';
        document.getElementById('tourType').textContent = data.tourType || '-';
        document.getElementById('ticketPrice').textContent = data.ticketPrice || 'Variatif';
        document.getElementById('overviewText').textContent = data.description || 'Informasi detail belum tersedia.';
        document.getElementById('mapLocationName').textContent = `Menampilkan lokasi ${data.name}`;

        // Untuk menampilkan peta, jika ingin mengaktifkan:
        // const mapFrame = document.getElementById('googleMapFrame');
        // if (mapFrame && data.mapEmbedUrl) {
        //     mapFrame.src = data.mapEmbedUrl;
        //     document.getElementById('mapPlaceholder').style.display = 'none';
        // } else if (mapFrame) {
        //     mapFrame.style.display = 'none';
        //     document.getElementById('mapPlaceholder').style.display = 'flex';
        // }
    }

    renderStars(rating) {
        const starsContainer = document.getElementById('starsContainer');
        if (!starsContainer) return;

        starsContainer.innerHTML = '';

        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.4;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        for (let i = 0; i < fullStars; i++) {
            starsContainer.innerHTML += '<i class="fas fa-star star"></i>';
        }
        if (halfStar) {
            starsContainer.innerHTML += '<i class="fas fa-star-half-alt star"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            starsContainer.innerHTML += '<i class="far fa-star star"></i>';
        }
    }

    displayError(message) {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-message">
                    ${message}<br>
                    <a href="../home/home.html">Kembali ke Home</a>
                </div>`;
        }
        document.getElementById('pageTitle').textContent = "Error - Trip.Taktik";
    }

    getWishlist() {
        if (!this.currentUser) return [];

        const userId = this.currentUser.id || this.currentUser.username;
        return JSON.parse(localStorage.getItem(this.wishlistKeyPrefix + userId)) || [];
    }

    saveWishlist(wishlist) {
        if (!this.currentUser) return;

        const userId = this.currentUser.id || this.currentUser.username;
        localStorage.setItem(this.wishlistKeyPrefix + userId, JSON.stringify(wishlist));
    }

    isPlaceInWishlist() {
        if (!this.currentPlace) return false;

        const wishlist = this.getWishlist();
        return wishlist.some(item => item.id === this.currentPlace.id);
    }

    updateWishlistButtonState() {
        const icon = document.getElementById('wishlist-icon');
        const text = document.getElementById('wishlist-text');
        const button = document.getElementById('toggleWishlistBtn');

        if (!icon || !text || !button || !this.currentPlace) return;

        if (this.isPlaceInWishlist()) {
            icon.className = 'fas fa-bookmark';
            text.textContent = 'Tersimpan di Wishlist';
            button.classList.add('favorited');
        } else {
            icon.className = 'far fa-bookmark';
            text.textContent = 'Simpan ke Wishlist';
            button.classList.remove('favorited');
        }
    }

    toggleWishlist() {
        if (!this.currentPlace) {
            this.showNotification('Data tempat wisata tidak valid.', 'error');
            return;
        }

        if (!this.currentUser) {
            this.showNotification('Anda harus login untuk menggunakan fitur wishlist.', 'error');
            return;
        }

        let wishlist = this.getWishlist();
        const placeIndex = wishlist.findIndex(item => item.id === this.currentPlace.id);

        if (placeIndex > -1) {
            wishlist.splice(placeIndex, 1);
            this.saveWishlist(wishlist);
            this.showNotification(`"${this.currentPlace.name}" dihapus dari wishlist.`, 'info');
        } else {
            const wishlistItem = {
                id: this.currentPlace.id,
                name: this.currentPlace.name,
                location: this.currentPlace.location,
                imageUrl: this.currentPlace.imageUrl,
                rating: this.currentPlace.rating
            };
            wishlist.push(wishlistItem);
            this.saveWishlist(wishlist);
            this.showNotification(`"${this.currentPlace.name}" ditambahkan ke wishlist!`, 'success');
        }

        this.updateWishlistButtonState();
    }

    logout() {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            localStorage.removeItem('tripTaktikCurrentUser');
            this.showNotification('Berhasil keluar!', 'success');
            setTimeout(() => this.redirectToAuth(), 1500);
        }
    }

    redirectToAuth() {
        window.location.href = this.authPageUrl;
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container-detail');
        if (!container) {
            console.warn("Container not found: #notification-container-detail");
            alert(message);
            return;
        }

        const notif = document.createElement('div');
        notif.className = `notification-item-detail type-${type}`;
        notif.textContent = message;

        if (type === 'success') notif.style.backgroundColor = '#28a745';
        else if (type === 'error') notif.style.backgroundColor = '#dc3545';
        else notif.style.backgroundColor = '#17a2b8';

        container.prepend(notif);

        setTimeout(() => notif.classList.add('show'), 10);
        setTimeout(() => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 400);
        }, 3500);
    }
}

// Inisialisasi saat halaman dimuat
let detailPageApp;
document.addEventListener('DOMContentLoaded', () => {
    detailPageApp = new DetailPageSystem();
});