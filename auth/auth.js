// Authentication System
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('tripTaktikUsers')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('tripTaktikCurrentUser')) || null;
        this.homePageUrl = '../home/home.html';
        this.init();
    }

    init() {
        if (this.currentUser) {
            this.redirectToHome();
        } else {
            this.showLogin();
        }
        this.bindEvents();
    }

    bindEvents() {
        // Event listener untuk form login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Event listener untuk form registrasi
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const loginBtn = document.getElementById('loginBtn');

        if (!email || !password) {
            this.showAlert('loginAlert', 'Harap isi semua field', 'error');
            return;
        }

        // Tampilkan status loading
        loginBtn.classList.add('btn-loading');
        loginBtn.textContent = 'Signing In';

        // Simulasi delay API
        await new Promise(resolve => setTimeout(resolve, 1000));

        const user = this.users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = {
                id: user.id,
                email: user.email,
                username: user.username,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('tripTaktikCurrentUser', JSON.stringify(this.currentUser));
            this.redirectToHome();
        } else {
            this.showAlert('loginAlert', 'Email atau password salah', 'error');
        }

        // Hapus status loading
        loginBtn.classList.remove('btn-loading');
        loginBtn.textContent = 'Log In';
    }

    async handleRegister() {
        const email = document.getElementById('registerEmail').value.trim();
        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value;
        const registerBtn = document.getElementById('registerBtn');

        if (!email || !username || !password) {
            this.showAlert('registerAlert', 'Harap isi semua field', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showAlert('registerAlert', 'Format email tidak valid', 'error');
            return;
        }

        if (password.length < 6) {
            this.showAlert('registerAlert', 'Password minimal 6 karakter', 'error');
            return;
        }

        if (this.users.find(u => u.email === email)) {
            this.showAlert('registerAlert', 'Email sudah terdaftar', 'error');
            return;
        }

        if (this.users.find(u => u.username === username)) {
            this.showAlert('registerAlert', 'Username sudah digunakan', 'error');
            return;
        }

        // Tampilkan status loading
        registerBtn.classList.add('btn-loading');
        registerBtn.textContent = 'Creating Account';

        // Simulasi delay API
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newUser = {
            id: Date.now().toString(),
            email,
            username,
            password,
            registeredAt: new Date().toISOString()
        };

        this.users.push(newUser);
        localStorage.setItem('tripTaktikUsers', JSON.stringify(this.users));

        this.showAlert('registerSuccess', 'Akun berhasil dibuat! Silakan login.', 'success');

        // Reset form
        document.getElementById('registerForm').reset();

        // Alihkan ke login dalam 2 detik
        setTimeout(() => {
            this.showLogin();
        }, 2000);

        // Hapus status loading
        registerBtn.classList.remove('btn-loading');
        registerBtn.textContent = 'Register';
    }

    // Redirect ke halaman home
    redirectToHome() {
        window.location.href = this.homePageUrl;
    }

    // Tampilkan form login
    showLogin() {
        const loginPage = document.getElementById('loginPage');
        const registerPage = document.getElementById('registerPage');

        if (loginPage) loginPage.style.display = 'flex';
        if (registerPage) registerPage.style.display = 'none';

        this.clearAlerts();
    }

    // Tampilkan form registrasi
    showRegister() {
        const loginPage = document.getElementById('loginPage');
        const registerPage = document.getElementById('registerPage');

        if (loginPage) loginPage.style.display = 'none';
        if (registerPage) registerPage.style.display = 'flex';

        this.clearAlerts();
    }

    // Tampilkan halaman home jika elemen tersedia
    showHome() {
        const homePage = document.getElementById('homePage');
        if (homePage) {
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('registerPage').style.display = 'none';
            homePage.style.display = 'flex';

            if (this.currentUser) {
                const welcomeMessage = document.getElementById('welcomeMessage');
                if (welcomeMessage) {
                    welcomeMessage.innerHTML = `
                        Halo <strong>${this.currentUser.username}</strong>! 
                        Selamat datang kembali di platform perjalanan terbaik! 
                        Temukan destinasi impian Anda, rencanakan perjalanan yang tak terlupakan, 
                        dan bagikan pengalaman bersama komunitas traveler lainnya.
                    `;
                }
            }
        } else {
            this.redirectToHome();
        }
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('tripTaktikCurrentUser');
        window.location.href = 'auth.html';
    }

    // Tampilkan pesan alert
    showAlert(alertId, message, type) {
        const alertDiv = document.getElementById(alertId);
        if (alertDiv) {
            alertDiv.textContent = message;
            alertDiv.className = `alert alert-${type}`;
            alertDiv.style.display = 'block';

            setTimeout(() => {
                alertDiv.style.display = 'none';
            }, 5000);
        }
    }

    // Sembunyikan semua alert
    clearAlerts() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            alert.style.display = 'none';
        });
    }

    // Validasi format email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Ubah URL halaman home
    setHomePageUrl(url) {
        this.homePageUrl = url;
    }
}

// Fungsi global untuk navigasi auth
function showLogin() {
    window.authSystem.showLogin();
}

function showRegister() {
    window.authSystem.showRegister();
}

function logout() {
    window.authSystem.logout();
}

// Inisialisasi sistem auth
window.authSystem = new AuthSystem();

// Shortcut keyboard: Ctrl + Enter untuk submit form aktif
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        const activeForm = document.querySelector(
            'form:not([style*="display: none"]) form, ' +
            '#loginPage:not([style*="display: none"]) form, ' +
            '#registerPage:not([style*="display: none"]) form'
        );
        if (activeForm) {
            activeForm.dispatchEvent(new Event('submit'));
        }
    }
});

// Event browser back/forward (kosong untuk future use)
window.addEventListener('popstate', (e) => {
    // Tambahkan navigasi state jika diperlukan
});

console.log('🚀 Trip.Taktik Authentication System Loaded');