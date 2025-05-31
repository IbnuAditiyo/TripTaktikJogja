class ProfilePage {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('tripTaktikCurrentUser'));
        this.authPageUrl = '../auth/auth.html';
        this.homePageUrl = '../home/home.html';

        // Data default profil
        this.profileData = {
            name: 'Mahen',
            email: 'MahenMber123@Marley.Com',
            gender: '',
            birthdate: '',
            avatar: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23e0e0e0"/><circle cx="50" cy="40" r="18" fill="%23b0b0b0"/><ellipse cx="50" cy="85" rx="30" ry="20" fill="%23b0b0b0"/></svg>'
        };

        this.init();
    }

    init() {
        if (!this.currentUser) {
            this.redirectToAuth();
            return;
        }

        this.loadProfileData();
        this.bindEvents();
        this.updateProfileDisplay();
        this.navigateToSection('edit-profile', document.querySelector('.profile-menu a.active'));
    }

    bindEvents() {
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });

        document.getElementById('photoInput').addEventListener('change', (e) => {
            this.handlePhotoUpload(e);
        });
    }

    loadProfileData() {
        const storedData = JSON.parse(localStorage.getItem(`tripTaktikUserProfile_${this.currentUser.username || this.currentUser.email}`));

        if (storedData) {
            this.profileData = { ...this.profileData, ...storedData };
        } else {
            this.profileData.name = this.currentUser.username || "Pengguna Baru";
            this.profileData.email = this.currentUser.email || "email@example.com";
        }

        // Isi form dengan data profil
        document.getElementById('name').value = this.profileData.name;
        document.getElementById('email').value = this.profileData.email;
        document.getElementById('gender').value = this.profileData.gender;
        document.getElementById('birthdate').value = this.profileData.birthdate;
    }

    updateProfileDisplay() {
        document.getElementById('sidebarProfileName').textContent = this.profileData.name;
        document.getElementById('sidebarProfileEmail').textContent = this.profileData.email;

        const avatarElements = [
            document.getElementById('profileAvatarDisplay'),
            document.getElementById('profileAvatarFormDisplay')
        ];

        avatarElements.forEach(el => {
            if (el) {
                el.style.backgroundImage = `url(${this.profileData.avatar})`;
            }
        });
    }

    saveProfile() {
        this.profileData.name = document.getElementById('name').value;
        this.profileData.gender = document.getElementById('gender').value;
        this.profileData.birthdate = document.getElementById('birthdate').value;
        this.profileData.email = document.getElementById('email').value;

        if (!this.profileData.name || !this.profileData.email) {
            this.showNotification('Nama dan Email wajib diisi!', 'error');
            return;
        }

        localStorage.setItem(
            `tripTaktikUserProfile_${this.currentUser.username || this.currentUser.email}`,
            JSON.stringify(this.profileData)
        );

        this.updateProfileDisplay();
        this.showNotification('Profil berhasil diperbarui!', 'success');
    }

    cancelEdit() {
        if (confirm('Apakah Anda yakin ingin membatalkan? Perubahan tidak akan disimpan.')) {
            this.loadProfileData();
            this.showNotification('Perubahan dibatalkan.', 'info');
        }
    }

    triggerUploadPhoto() {
        document.getElementById('photoInput').click();
    }

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.profileData.avatar = e.target.result;
                this.updateProfileDisplay();
                this.showNotification('Foto siap diunggah. Klik "Simpan Perubahan" untuk menyimpan.', 'info');
            };
            reader.readAsDataURL(file);
        }
    }

    navigateToSection(sectionId, clickedLink) {
        // Sembunyikan semua section konten
        document.querySelectorAll('.profile-content-section, .edit-profile-container').forEach(section => {
            section.style.display = 'none';
        });

        const targetSection = document.getElementById(sectionId + 'Section');

        if (targetSection) {
            targetSection.style.display = 'block';
        } else if (sectionId === 'edit-profile') {
            document.querySelector('.edit-profile-container').style.display = 'block';
        }

        // Update kelas aktif pada menu sidebar
        document.querySelectorAll('.profile-menu a').forEach(item => item.classList.remove('active'));

        if (clickedLink) {
            clickedLink.classList.add('active');
        } else {
            const correspondingLink = document.querySelector(`.profile-menu a[onclick*="navigateToSection('${sectionId}'"]`);
            if (correspondingLink) {
                correspondingLink.classList.add('active');
            } else if (sectionId === 'edit-profile') {
                document.querySelector(`.profile-menu a[onclick*="navigateToSection('edit-profile'"]`).classList.add('active');
            }
        }

        if (sectionId !== 'edit-profile') {
            this.showNotification(`Menampilkan bagian ${sectionId}. (Konten contoh)`, 'info');
        }
    }

    logout() {
        const confirmed = confirm('Apakah Anda yakin ingin keluar?');
        if (confirmed) {
            localStorage.removeItem('tripTaktikCurrentUser');
            // localStorage.removeItem(`tripTaktikUserProfile_${this.currentUser.username || this.currentUser.email}`);
            this.showNotification('Berhasil keluar!', 'success');
            setTimeout(() => {
                this.redirectToAuth();
            }, 1500);
        }
    }

    redirectToAuth() {
        window.location.href = this.authPageUrl;
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.style.cssText = `
            padding: 12px 20px;
            margin-bottom: 10px;
            border-radius: 5px;
            color: white;
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease;
            transform: translateX(100%);
            min-width: 250px;
            text-align: center;
        `;

        notification.textContent = message;

        if (type === 'success') notification.style.backgroundColor = '#28a745';
        else if (type === 'error') notification.style.backgroundColor = '#dc3545';
        else notification.style.backgroundColor = '#17a2b8';

        container.prepend(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

let profileApp;
document.addEventListener('DOMContentLoaded', () => {
    profileApp = new ProfilePage();
});