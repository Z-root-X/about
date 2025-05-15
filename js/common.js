// js/common.js
document.addEventListener('DOMContentLoaded', function() {
    // --- Mobile Menu Toggle Functionality ---
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (menuToggle && mainNav) {
        // console.log("Mobile menu elements found by common.js."); // Uncomment for debugging
        menuToggle.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent click from bubbling up if needed
            // console.log("Menu toggle clicked in common.js!"); // Uncomment for debugging
            const isActive = mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
            // Update aria-expanded attribute for accessibility
            menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            // console.log("mainNav is now active (common.js):", isActive); // Uncomment for debugging
        });

        // Close mobile menu when a nav link is clicked
        const navLinks = mainNav.querySelectorAll('a.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) { // Only if menu is open
                    // console.log("Nav link clicked, closing menu (common.js)."); // Uncomment for debugging
                    mainNav.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    } else {
        if (!menuToggle) console.error("Mobile menu toggle button (#mobile-menu-toggle) not found by common.js!");
        if (!mainNav) console.error("Main navigation element (#main-nav) not found by common.js!");
    }

    // --- Smooth Scrolling for Anchor Links ---
    const internalLinks = document.querySelectorAll('a.nav-link[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const header = document.getElementById('main-header');
                const headerOffset = header ? header.offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset - 15; // 15px buffer

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Highlight Active Navigation Link ---
    const allNavLinks = document.querySelectorAll('#main-nav ul li a.nav-link');
    const currentPathnameClean = window.location.pathname.replace(/\/$/, "").replace(/^\//, ""); // Clean current path

    allNavLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        const linkUrl = new URL(linkHref, window.location.origin);
        const linkPathnameClean = linkUrl.pathname.replace(/\/$/, "").replace(/^\//, "");

        // Direct match or index.html match for root
        if (currentPathnameClean === linkPathnameClean || 
            (linkPathnameClean === 'index.html' && currentPathnameClean === '') ||
            (linkPathnameClean === '' && currentPathnameClean === 'index.html') ) {
            link.classList.add('active');
        }
        // Special case for blog post pages to highlight the main "Blog" link
        else if (currentPathnameClean.startsWith('blog-post.html') && linkPathnameClean.includes('blog.html')) {
             link.classList.add('active');
        }
    });


    // --- Update Footer Year Dynamically ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Add sticky class to header on scroll ---
    const header = document.getElementById('main-header');
    if (header) {
        const scrollThreshold = 50; 
        const checkSticky = () => {
            if (window.pageYOffset > scrollThreshold) {
                header.classList.add('sticky-header');
            } else {
                header.classList.remove('sticky-header');
            }
        };
        checkSticky(); // Initial check
        window.addEventListener('scroll', checkSticky);
    }
});

/**
 * Converts a Google Drive sharing URL to a direct image viewable URL.
 * Also handles other absolute URLs and local path fragments.
 * @param {string} urlInput The URL or path fragment from the Google Sheet.
 * @param {string} localPathPrefix The prefix for local images (e.g., 'images/').
 * @returns {string} The processed image URL.
 */
function getProcessedImageUrl(urlInput, localPathPrefix = 'images/') {
    if (typeof urlInput !== 'string' || urlInput.trim() === '') {
        return ''; // Return empty for invalid input
    }
    const trimmedUrl = urlInput.trim();

    const fileIdMatch = trimmedUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
        return trimmedUrl;
    }
    // If it's not an absolute URL and not a recognized Drive URL, assume it's a local path fragment relative to the images folder.
    return `${localPathPrefix.replace(/\/$/, "")}/${trimmedUrl}`; // Ensure single slash
}