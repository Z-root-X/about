document.addEventListener('DOMContentLoaded', function() {
    // --- Mobile Menu Toggle Functionality ---
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (menuToggle && mainNav) {
        console.log("Mobile menu elements found by common.js."); // Debug
        menuToggle.addEventListener('click', function() {
            console.log("Menu toggle clicked in common.js!"); // Debug
            const isActive = mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
            console.log("mainNav is now active (common.js):", isActive); // Debug
        });

        // Close mobile menu when a nav link is clicked
        const navLinks = mainNav.querySelectorAll('a.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) { // Only if menu is open
                    console.log("Nav link clicked, closing menu (common.js)."); // Debug
                    mainNav.classList.remove('active');
                    menuToggle.classList.remove('active');
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
    const currentFullURL = window.location.href;
    let activeLinkFound = false;

    allNavLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        const currentPathname = window.location.pathname;
        const linkPathname = new URL(linkHref, window.location.origin).pathname; // Get full pathname for comparison

        // Check if the pathnames match (handles cases with or without trailing slashes better)
        if (currentPathname === linkPathname || (currentPathname + '/') === linkPathname || currentPathname === (linkPathname + '/')) {
            link.classList.add('active');
            activeLinkFound = true;
        }
        // Special case for blog post pages to highlight the main "Blog" link
        else if (currentPathname.includes('blog-post.html') && linkPathname.includes('blog.html')) {
             link.classList.add('active');
             activeLinkFound = true;
        }
    });
    // Fallback for index.html if on root or index.html explicitly
    if (!activeLinkFound && (currentPathname === '/' || currentPathname.endsWith('index.html') || currentPathname.endsWith(new URL(document.querySelector('#main-nav ul li a.nav-link[href="index.html"]').href, window.location.origin).pathname) )) {
        const homeLink = document.querySelector('#main-nav ul li a.nav-link[href="index.html"]');
        if (homeLink) homeLink.classList.add('active');
    }


    // --- Update Footer Year Dynamically ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Add sticky class to header on scroll ---
    const header = document.getElementById('main-header');
    if (header) {
        const scrollThreshold = 50; // Pixels to scroll before adding class
        // Initial check in case page is loaded already scrolled down
        if (window.pageYOffset > scrollThreshold) {
            header.classList.add('sticky-header');
        }
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > scrollThreshold) {
                header.classList.add('sticky-header');
            } else {
                header.classList.remove('sticky-header');
            }
        });
    }
});