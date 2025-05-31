class WishlistPage {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('tripTaktikCurrentUser')) || null;
        this.authPageUrl = '../auth/auth.html';
        this.homePageUrl = '../home/home.html';

        this.init();
    }

    init() {
        if (!this.currentUser) {
            this.redirectToAuth();
            return;
        }
        this.displayWishlistStatus();
        this.bindGlobalEvents();
    }

    bindGlobalEvents() {
        // Tambahkan event listener global jika diperlukan
    }

    displayWishlistStatus() {
        const wishlistContent = document.getElementById('wishlistContent');
        if (!wishlistContent) return;

        const userWishlist = JSON.parse(localStorage.getItem(`tripTaktikUserWishlist_${this.currentUser.id}`)) || [];

        if (userWishlist.length === 0) {
            wishlistContent.innerHTML = `
                <div class="empty-wishlist-message">
                    <h3>Wishlist Anda Masih Kosong</h3>
                    <p>Tambahkan tempat-tempat menarik yang ingin Anda kunjungi!</p>
                    <p><a href="${this.homePageUrl}" style="color: #a8d5ba; text-decoration: underline;">Mulai cari destinasi</a></p>
                </div>
            `;
        } else {
            wishlistContent.innerHTML = `
                <div class="empty-wishlist-message">
                    <h3>Wishlist Saya</h3>
                    <p>Berikut adalah item yang telah Anda simpan:</p>
                    <ul>
                        ${userWishlist.map(item => `<li>${item.name} (ID: ${item.id})</li>`).join('')}
                    </ul>
                    <p style="margin-top: 20px;"><i>(Render data ini hanya contoh, tampilan sebenarnya akan berupa kartu)</i></p>
                </div>
            `;
        }
    }

    redirectToAuth() {
        window.location.href = this.authPageUrl;
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.textContent = message;

        // Gaya notifikasi
        notification.style.padding = '10px 20px';
        notification.style.marginBottom = '10px';
        notification.style.borderRadius = '5px';
        notification.style.color = 'white';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease-in-out';

        if (type === 'success') {
            notification.style.backgroundColor = '#28a745';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#dc3545';
        } else {
            notification.style.backgroundColor = '#17a2b8';
        }

        container.appendChild(notification);

        // Animasi masuk
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);

        // Animasi keluar
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }
}

// Fungsi logout global (dipanggil dari tombol di HTML)
function logout() {
    const confirmed = confirm('Apakah Anda yakin ingin keluar?');
    if (confirmed) {
        localStorage.removeItem('tripTaktikCurrentUser');

        if (wishlistApp && typeof wishlistApp.showNotification === 'function') {
            wishlistApp.showNotification('Berhasil keluar!', 'success');
        } else {
            alert('Berhasil keluar!');
        }

        setTimeout(() => {
            window.location.href = wishlistApp ? wishlistApp.authPageUrl : '../auth/auth.html';
        }, 1500);
    }
}

let wishlistApp;

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    wishlistApp = new WishlistPage();
});

// Handle jika user kembali ke tab
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && wishlistApp) {
        const currentUser = JSON.parse(localStorage.getItem('tripTaktikCurrentUser'));

        if (!currentUser && typeof wishlistApp.redirectToAuth === 'function') {
            const authPath = wishlistApp.authPageUrl.replace('..', '');
            if (!window.location.pathname.includes(authPath)) {
                wishlistApp.redirectToAuth();
            }
        } else if (currentUser && wishlistApp.currentUser !== currentUser) {
            wishlistApp.currentUser = currentUser;
            wishlistApp.displayWishlistStatus();
        }
    }
});