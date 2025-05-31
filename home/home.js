class HomeSystem {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('tripTaktikCurrentUser')) || null;
        this.authPageUrl = '../auth/auth.html';
        this.rekomendasiPageUrl = '../recommendation/recommendation.html';
        this.detailPageUrl = '../detail/detail-page.html';
        this.homePageUrl = 'home.html';

        this.popularDestinationsData = [{
            id: "pop1",
            name: 'Candi Borobudur',
            rating: 4.8,
            location: 'Magelang, Jawa Tengah',
            imageUrl: '../images/candi-borobudur1.png',
            description: 'Mahakarya arsitektur Buddha terbesar di dunia.'
        }, {
            id: "pop2",
            name: 'Pantai Kuta',
            rating: 4.5,
            location: 'Bali',
            imageUrl: '../images/pantai-parang-tritis2.png',
            description: 'Nikmati matahari terbenam yang legendaris dan ombak yang cocok untuk berselancar.'
        }, {
            id: "pop3",
            name: 'Malioboro Street',
            rating: 4.6,
            location: 'Yogyakarta',
            imageUrl: '../images/jalan2.jpg',
            description: 'Jantung kota Yogyakarta, pusat belanja dan kuliner khas.'
        }, ];

        const baseTestimonials = [{
            id: "testi1",
            name: 'Malam di Angkringan',
            content: 'Suasana Jogja malam hari di angkringan memang tiada duanya, sederhana tapi berkesan.',
            date: '2024-10-10',
            location: 'Yogyakarta',
            imageUrl: '../images/testimoni1.jpg',
            userName: 'Budi Traveller'
        }, {
            id: "testi2",
            name: 'Sunrise di Sikunir',
            content: 'Golden sunrise terbaik yang pernah saya lihat! Perjalanan dingin terbayar lunas.',
            date: '2024-09-22',
            location: 'Dieng, Jawa Tengah',
            imageUrl: '../images/testimoni2.jpg',
            userName: 'Ani Explorer'
        }, {
            id: "testi3",
            name: 'Eksplorasi Budaya Solo',
            content: 'Belajar banyak tentang batik dan keramahan warga Solo. Pengalaman yang memperkaya.',
            date: '2024-08-15',
            location: 'Surakarta',
            imageUrl: '../images/testimoni3.jpg',
            userName: 'Charlie W.'
        }, {
            id: "testi4",
            name: 'Sepeda Ontel Kota Tua',
            content: 'Menyusuri kota tua dengan sepeda ontel, nostalgia dan banyak spot foto menarik.',
            date: '2024-07-05',
            location: 'Semarang',
            imageUrl: '../images/testimoni4.jpg',
            userName: 'Dewi K.'
        }, ];

        // Duplicate base testimonials to ensure enough items for the slider
        let fullTestimonials = [...baseTestimonials];
        if (baseTestimonials.length > 0 && fullTestimonials.length < 8) {
            for (let i = 0; fullTestimonials.length < 8; i++) {
                const originalIndex = i % baseTestimonials.length;
                fullTestimonials.push({
                    ...baseTestimonials[originalIndex],
                    id: `testiCopy${fullTestimonials.length + 1}`,
                    name: `${baseTestimonials[originalIndex].name} (2)` // Mark as copy
                });
            }
        }
        this.testimonialsData = fullTestimonials.slice(0, 8); // Limit to first 8 items

        this.currentTestimonialSlideGroup = 0; // Current slide group index
        this.itemsPerView = 4; // Default and target items per view

        this.init();
    }

    /**
     * Initializes the HomeSystem by checking user authentication,
     * binding events, and rendering initial content.
     */
    init() {
        if (!this.currentUser) {
            this.redirectToAuth();
            return;
        }

        this.itemsPerView = this.calculateItemsPerView();
        this.bindEvents();
        this.initializeUserProfile();
        this.initializeFilterDropdown();
        this.displayEmptyStats();
        this.displayPopularDestinations();
        this.displayTestimonials();
        this.initializeNavigation();
        this.initializeTestimonialPopup();

        // Recalculate items per view and reset slider on window resize
        window.addEventListener('resize', () => {
            const newItemsPerView = this.calculateItemsPerView();
            if (newItemsPerView !== this.itemsPerView) {
                this.itemsPerView = newItemsPerView;
                this.currentTestimonialSlideGroup = 0; // Reset to the first slide
                this.displayTestimonials(); // Re-render and update slider UI
            }
        });
    }

    /**
     * Calculates the number of testimonial cards that can be displayed per view
     * based on the wrapper width.
     * @returns {number} The number of items to display per view (1 to 4).
     */
    calculateItemsPerView() {
        const wrapper = document.querySelector('.testimonial-slider-wrapper');
        const cardMinWidth = 290; // Corresponds to .testimonial-card min-width in CSS
        const cardGap = 20; // Corresponds to .testimonial-cards gap in CSS

        if (wrapper) {
            const wrapperWidth = wrapper.offsetWidth;
            const calculated = Math.floor((wrapperWidth + cardGap) / (cardMinWidth + cardGap));
            return Math.max(1, Math.min(4, calculated)); // Ensure between 1 and 4
        }

        // Fallback if wrapper is not yet available
        if (window.innerWidth >= (cardMinWidth + cardGap) * 4 - cardGap + 40) return 4;
        if (window.innerWidth >= (cardMinWidth + cardGap) * 3 - cardGap + 40) return 3;
        if (window.innerWidth >= (cardMinWidth + cardGap) * 2 - cardGap + 40) return 2;
        return 1;
    }

    /**
     * Binds all necessary event listeners for various page elements.
     */
    bindEvents() {
        const logoutBtn = document.querySelector('.logout');
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());
        else console.warn("Logout button not found.");

        const findTripButton = document.getElementById('findTripButton');
        if (findTripButton) {
            findTripButton.addEventListener('click', (e) => {
                e.preventDefault();
                const selectedWisata = document.getElementById('jenis-wisata-hidden-input').value;
                if (selectedWisata) {
                    window.location.href = `${this.rekomendasiPageUrl}?jenis=${encodeURIComponent(selectedWisata)}`;
                }
            });
        } else console.warn("Find Trip button not found.");

        const prevBtn = document.getElementById('testimonial-prev-btn');
        const nextBtn = document.getElementById('testimonial-next-btn');
        if (prevBtn) prevBtn.addEventListener('click', () => this.slideTestimonials('prev'));
        else console.warn("Testimonial Prev button not found.");
        if (nextBtn) nextBtn.addEventListener('click', () => this.slideTestimonials('next'));
        else console.warn("Testimonial Next button not found.");
    }

    /**
     * Displays testimonial cards in the dedicated container.
     */
    displayTestimonials() {
        const container = document.getElementById('testimonial-cards-container');
        if (!container) {
            console.warn("Testimonial container (#testimonial-cards-container) not found.");
            return;
        }
        container.innerHTML = ''; // Clear existing content

        this.testimonialsData.forEach(testimoni => {
            const card = document.createElement('div');
            card.className = 'testimonial-card';
            card.innerHTML = `
                <img src="${testimoni.imageUrl || '../images/placeholder-avatar.png'}" alt="Foto ${testimoni.userName || testimoni.name}">
                <div class="testimonial-content">
                    <div class="content-header">
                        <h3>${testimoni.name}</h3>
                        <button class="like-btn" data-id="${testimoni.id}" title="Like"><i class="far fa-heart"></i></button>
                    </div>
                    <p>"${testimoni.content}"</p>
                    <div class="testimonial-meta">
                        <span class="user-name">By: ${testimoni.userName || 'Anonymous'}</span>
                        <span class="date">${new Date(testimoni.date).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</span>
                        ${testimoni.location ? `<span class="location"><i class="fas fa-map-marker-alt"></i> ${testimoni.location}</span>` : ''}
                    </div>
                </div>`;
            container.appendChild(card);
        });
        this.initializeLikeButtons();
        this.updateSliderUIVisibility(); // Adjust slider position and button visibility
    }

    /**
     * Updates the testimonial slider's visual state (transform and button disabled states).
     */
    updateSliderUIVisibility() {
        const container = document.getElementById('testimonial-cards-container');
        const prevBtn = document.getElementById('testimonial-prev-btn');
        const nextBtn = document.getElementById('testimonial-next-btn');

        if (!container || !prevBtn || !nextBtn) {
            return;
        }

        const firstCard = container.querySelector('.testimonial-card');
        if (!firstCard) { // If no testimonials are present
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            container.style.transform = 'translateX(0px)';
            return;
        }

        const cardWidth = firstCard.offsetWidth;
        const gap = 20; // Corresponds to .testimonial-cards gap in CSS
        const cardWidthPlusGap = cardWidth + gap;

        const offset = -this.currentTestimonialSlideGroup * this.itemsPerView * cardWidthPlusGap;
        container.style.transform = `translateX(${offset}px)`;

        const totalItems = this.testimonialsData.length;
        const totalGroups = Math.ceil(totalItems / this.itemsPerView);

        const showNavButtons = totalGroups > 1;
        prevBtn.style.display = showNavButtons ? 'flex' : 'none';
        nextBtn.style.display = showNavButtons ? 'flex' : 'none';

        prevBtn.disabled = this.currentTestimonialSlideGroup === 0;
        nextBtn.disabled = this.currentTestimonialSlideGroup >= totalGroups - 1;
    }

    /**
     * Slides the testimonial cards in the specified direction.
     * @param {string} direction - 'prev' for previous slide, 'next' for next slide.
     */
    slideTestimonials(direction) {
        const totalItems = this.testimonialsData.length;
        if (totalItems <= this.itemsPerView) return; // No need to slide if items fit

        const totalGroups = Math.ceil(totalItems / this.itemsPerView);
        const maxGroupIndex = totalGroups - 1;

        if (direction === 'next') {
            this.currentTestimonialSlideGroup = Math.min(this.currentTestimonialSlideGroup + 1, maxGroupIndex);
        } else if (direction === 'prev') {
            this.currentTestimonialSlideGroup = Math.max(this.currentTestimonialSlideGroup - 1, 0);
        }
        this.updateSliderUIVisibility();
    }

    /**
     * Initializes the testimonial submission popup functionality.
     */
    initializeTestimonialPopup() {
        const openBtn = document.getElementById('open-testimonial-popup-btn');
        const popupOverlay = document.getElementById('testimonial-popup-overlay');
        const closeBtn = document.getElementById('close-testimonial-popup-btn');
        const form = document.getElementById('testimonial-form');
        const imageInput = document.getElementById('testimonial-image-input');
        const imagePreview = document.getElementById('testimonial-image-preview');

        if (!openBtn || !popupOverlay || !closeBtn || !form) {
            console.error('Testimonial popup elements (button/overlay/form) not found!');
            return;
        }
        if (!imageInput || !imagePreview) {
            console.warn('Testimonial image input/preview elements not found; image upload may not work.');
        }

        openBtn.addEventListener('click', () => {
            popupOverlay.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent scrolling background
        });

        const closePopup = () => {
            popupOverlay.classList.remove('show');
            document.body.style.overflow = 'auto'; // Re-enable background scrolling
            form.reset();
            if (imagePreview) {
                imagePreview.style.display = 'none';
                imagePreview.src = '#';
            }
            if (imageInput) imageInput.value = ''; // Clear file input
        };

        closeBtn.addEventListener('click', closePopup);
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) closePopup(); // Close if clicking outside form
        });

        if (imageInput && imagePreview) {
            imageInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        imagePreview.src = e.target.result;
                        imagePreview.style.display = 'block';
                    }
                    reader.readAsDataURL(file);
                } else {
                    imagePreview.style.display = 'none';
                    imagePreview.src = '#';
                }
            });
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('testimonial-name-input').value.trim();
            const text = document.getElementById('testimonial-text-input').value.trim();
            const location = document.getElementById('testimonial-location-input').value.trim();

            if (!name || !text) {
                this.showNotification('Testimonial title/name and description are required!', 'error');
                return;
            }

            const newTestimonial = {
                id: "testi" + Date.now(),
                name,
                content: text,
                date: new Date().toISOString(),
                location: location || 'Unknown',
                imageUrl: (imagePreview && imagePreview.style.display !== 'none' && imagePreview.src !== '#') ? imagePreview.src : '../images/placeholder-avatar.png',
                userName: (this.currentUser && this.currentUser.username) ? this.currentUser.username : 'Trip.Taktik User'
            };

            // Add new testimonial to the beginning of the array
            this.testimonialsData.unshift(newTestimonial);

            // Keep only the first 8 testimonials for the slider
            if (this.testimonialsData.length > 8) {
                this.testimonialsData = this.testimonialsData.slice(0, 8);
            }

            this.currentTestimonialSlideGroup = 0; // Reset slider to show new item
            this.displayTestimonials(); // Re-render testimonials
            this.showNotification('Testimonial added successfully!', 'success');
            closePopup();
        });
    }

    /**
     * Initializes the custom filter dropdown functionality for selecting destination types.
     */
    initializeFilterDropdown() {
        const trigger = document.getElementById('jenisWisataTrigger');
        const optionsContainer = document.getElementById('jenisWisataOptions');
        const hiddenInput = document.getElementById('jenis-wisata-hidden-input');
        const wrapper = document.querySelector('.custom-select-wrapper');

        if (!trigger || !optionsContainer || !hiddenInput || !wrapper) {
            console.warn("One or more filter dropdown elements not found.");
            return;
        }

        // Toggle dropdown visibility on trigger click
        trigger.addEventListener('click', (event) => {
            event.stopPropagation();
            optionsContainer.classList.toggle('show');
            wrapper.classList.toggle('open');
        });

        // Handle option selection
        optionsContainer.addEventListener('click', (e) => {
            const targetOption = e.target.closest('.custom-option, li');
            if (targetOption) {
                trigger.textContent = targetOption.textContent; // Update displayed value
                hiddenInput.value = targetOption.getAttribute('data-value'); // Update hidden input value
                optionsContainer.classList.remove('show');
                wrapper.classList.remove('open');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (wrapper && !wrapper.contains(e.target)) {
                optionsContainer.classList.remove('show');
                wrapper.classList.remove('open');
            }
        });
    }

    /**
     * Displays empty states for statistical numbers when data is not available.
     */
    displayEmptyStats() {
        ['total-tempat-wisata', 'total-jenis-wisata', 'total-wisata-alam', 'total-wisata-sejarah'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '-';
        });
    }

    /**
     * Displays popular destination cards.
     */
    displayPopularDestinations() {
        const container = document.getElementById('popular-destinations-container');
        if (!container) {
            console.warn("Popular Destinations container (#popular-destinations-container) not found.");
            return;
        }
        container.innerHTML = ''; // Clear existing content

        this.popularDestinationsData.forEach(dest => {
            const isBookmarked = this.isBookmarked(dest.id);
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.id = dest.id; // Store ID for bookmarking
            card.innerHTML = `
                <div class="card-image">
                    <img src="${dest.imageUrl || '../images/placeholder-image.jpg'}" alt="${dest.name}">
                    <button class="bookmark-btn ${isBookmarked ? 'active' : ''}" title="${isBookmarked ? 'Remove from Wishlist' : 'Save to Wishlist'}">
                        <i class="${isBookmarked ? 'fas' : 'far'} fa-bookmark"></i>
                    </button>
                </div>
                <div class="card-content">
                    <h3>${dest.name}</h3>
                    <div class="rating">
                        <span class="rating-number">${dest.rating.toFixed(1)}</span>
                        <div class="stars">${this.generateStars(dest.rating)}</div>
                    </div>
                    <div class="location"><i class="fas fa-map-marker-alt"></i> <span>${dest.location}</span></div>
                    <button class="view-more">View More</button>
                </div>`;
            container.appendChild(card);
        });
        this.initializeBookmarkButtons();
        this.initializeViewMoreButtons();
    }

    /**
     * Generates HTML for star ratings.
     * @param {number} rating - The rating value.
     * @returns {string} HTML string of star icons.
     */
    generateStars(rating) {
        let starsHTML = '';
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.4;
        const empty = 5 - full - (half ? 1 : 0);

        for (let i = 0; i < full; i++) starsHTML += '<i class="fas fa-star"></i>';
        if (half) starsHTML += '<i class="fas fa-star-half-alt"></i>';
        for (let i = 0; i < empty; i++) starsHTML += '<i class="far fa-star"></i>';
        return starsHTML;
    }

    /**
     * Redirects to the authentication page if the user is not logged in.
     */
    redirectToAuth() {
        if (!window.location.pathname.includes(this.authPageUrl.replace('../', ''))) {
            window.location.href = this.authPageUrl;
        }
    }

    /**
     * Handles user logout.
     */
    logout() {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            localStorage.removeItem('tripTaktikCurrentUser');
            this.currentUser = null;
            this.redirectToAuth();
        }
    }

    /**
     * Initializes the user profile link with the current user's details.
     */
    initializeUserProfile() {
        if (this.currentUser) {
            const userProfileLink = document.querySelector('.user-profile a');
            if (userProfileLink) {
                userProfileLink.title = `Profile: ${this.currentUser.username || this.currentUser.email || 'User'}`;
            }
        }
    }

    /**
     * Sets the active class for the current page in the navigation.
     */
    initializeNavigation() {
        const navLinks = document.querySelectorAll('.main-nav ul li a');
        const currentPath = window.location.pathname.split('/').pop() || 'home.html';

        navLinks.forEach(link => {
            const linkParent = link.parentElement;
            const linkPath = link.getAttribute('href').split('/').pop();

            // Remove active class from all links first
            linkParent.classList.remove('active');
            link.classList.remove('active');

            // Add active class if the link matches the current page
            if (linkPath === currentPath) {
                linkParent.classList.add('active');
                link.classList.add('active');
            }
        });
    }

    /**
     * Checks if a place is bookmarked by the current user.
     * @param {string} placeId - The ID of the place to check.
     * @returns {boolean} True if bookmarked, false otherwise.
     */
    isBookmarked(placeId) {
        const userId = this.currentUser ? (this.currentUser.id || this.currentUser.username) : null;
        if (!userId) return false;
        const bookmarks = JSON.parse(localStorage.getItem(`tripTaktikUserWishlist_${userId}`)) || [];
        return bookmarks.some(b => b.id === placeId);
    }

    /**
     * Initializes bookmark buttons for destination cards.
     */
    initializeBookmarkButtons() {
        // Re-attach event listeners to ensure they work after re-rendering cards
        document.querySelectorAll('.card .bookmark-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true); // Clone to remove old listeners
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', (e) => this.handleBookmarkClick(e, newBtn));
        });
    }

    /**
     * Handles click events for bookmark buttons.
     * @param {Event} event - The click event.
     * @param {HTMLElement} buttonElement - The bookmark button element.
     */
    handleBookmarkClick(event, buttonElement) {
        event.preventDefault();
        event.stopPropagation(); // Prevent card click event from firing

        if (!this.currentUser) {
            this.showNotification('You must be logged in to use the wishlist feature.', 'error');
            return;
        }

        const card = buttonElement.closest('.card');
        if (!card) return;

        // Extract data from the card to save to wishlist
        const itemData = {
            id: card.dataset.id,
            name: card.querySelector('h3')?.textContent,
            location: card.querySelector('.location span')?.textContent,
            imageUrl: card.querySelector('.card-image img')?.src,
            rating: parseFloat(card.querySelector('.rating-number')?.textContent) || 0,
        };

        if (!itemData.id || !itemData.name) {
            console.error("Incomplete item data for bookmarking.");
            return;
        }

        const icon = buttonElement.querySelector('i');
        const isCurrentlyBookmarked = icon.classList.contains('fas');

        if (!isCurrentlyBookmarked) {
            // Add to wishlist
            icon.classList.replace('far', 'fas');
            buttonElement.classList.add('active');
            buttonElement.title = "Remove from Wishlist";
            this.addToWishlist(itemData);
        } else {
            // Remove from wishlist
            icon.classList.replace('fas', 'far');
            buttonElement.classList.remove('active');
            buttonElement.title = "Save to Wishlist";
            this.removeFromWishlist(itemData.id);
        }
    }

    /**
     * Adds an item to the user's wishlist in local storage.
     * @param {Object} item - The item object to add.
     */
    addToWishlist(item) {
        const userId = this.currentUser.id || this.currentUser.username;
        let wishlist = JSON.parse(localStorage.getItem(`tripTaktikUserWishlist_${userId}`)) || [];

        // Add only if not already present
        if (!wishlist.some(b => b.id === item.id)) {
            wishlist.push(item);
            localStorage.setItem(`tripTaktikUserWishlist_${userId}`, JSON.stringify(wishlist));
            this.showNotification(`"${item.name}" added to wishlist!`, 'success');
        }
    }

    /**
     * Removes an item from the user's wishlist in local storage.
     * @param {string} itemId - The ID of the item to remove.
     */
    removeFromWishlist(itemId) {
        const userId = this.currentUser.id || this.currentUser.username;
        let wishlist = JSON.parse(localStorage.getItem(`tripTaktikUserWishlist_${userId}`)) || [];
        const itemIndex = wishlist.findIndex(b => b.id === itemId);

        if (itemIndex > -1) {
            const itemName = wishlist[itemIndex].name;
            wishlist.splice(itemIndex, 1); // Remove the item
            localStorage.setItem(`tripTaktikUserWishlist_${userId}`, JSON.stringify(wishlist));
            this.showNotification(`"${itemName}" removed from wishlist.`, 'info');
        }
    }

    /**
     * Initializes "View More" buttons on destination cards to navigate to detail pages.
     */
    initializeViewMoreButtons() {
        document.querySelectorAll('.card .view-more').forEach(btn => {
            // Clone and replace to remove previously attached event listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default button action
                const card = newBtn.closest('.card');
                if (!card) return;

                // Get ID from dataset or fallback to text content if ID not found
                const placeId = card.dataset.id || card.querySelector('h3')?.textContent;
                if (placeId) {
                    window.location.href = `${this.detailPageUrl}?id=${encodeURIComponent(placeId)}`;
                } else {
                    this.showNotification('Detail not found.', 'error');
                }
            });
        });
    }

    /**
     * Initializes like buttons for testimonial cards.
     */
    initializeLikeButtons() {
        document.querySelectorAll('.testimonial-card .like-btn').forEach(btn => {
            // Clone and replace to remove previously attached event listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent parent card click if any

                const icon = newBtn.querySelector('i');
                const isLiked = icon.classList.contains('fas');

                if (!isLiked) {
                    icon.classList.replace('far', 'fas'); // Change to filled heart
                    newBtn.classList.add('active');
                    icon.style.color = '#e74c3c'; // Set heart color to red
                    // Potentially add logic to save like status (e.g., to localStorage)
                } else {
                    icon.classList.replace('fas', 'far'); // Change to outline heart
                    newBtn.classList.remove('active');
                    icon.style.color = ''; // Reset heart color
                    // Potentially add logic to remove like status
                }
            });
        });
    }

    /**
     * Scrolls the window to the top smoothly.
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    /**
     * Displays a notification message.
     * @param {string} message - The message to display.
     * @param {string} type - The type of notification ('info', 'success', 'error', 'warning').
     */
    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) {
            console.warn("Notification container (#notification-container) not found!");
            alert(message); // Fallback to alert if container is missing
            return;
        }

        const notif = document.createElement('div');
        notif.className = `notification-item type-${type}`;
        notif.textContent = message;

        // Apply background color based on type
        if (type === 'success') notif.style.backgroundColor = '#28a745';
        else if (type === 'error') notif.style.backgroundColor = '#dc3545';
        else if (type === 'warning') notif.style.backgroundColor = '#ffc107';
        else notif.style.backgroundColor = '#17a2b8'; // Default info color

        container.prepend(notif); // Add new notification to the top

        // Show animation
        setTimeout(() => notif.classList.add('show'), 10);

        // Hide and remove after a delay
        setTimeout(() => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 400); // Remove from DOM after transition
        }, 3500); // Notification visible for 3.5 seconds
    }
}

let homeSystem;
document.addEventListener('DOMContentLoaded', () => {
    homeSystem = new HomeSystem();
});

// Reload page if user logs in/out from another tab/window
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && homeSystem && !homeSystem.currentUser) {
        const storedUser = JSON.parse(localStorage.getItem('tripTaktikCurrentUser'));
        if (!storedUser && !window.location.pathname.includes(homeSystem.authPageUrl.replace('../', ''))) {
            homeSystem.redirectToAuth();
        } else if (storedUser) {
            window.location.reload();
        }
    }
});