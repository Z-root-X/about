// js/blog-list.js
document.addEventListener('DOMContentLoaded', function() {
    const blogPostsContainer = document.getElementById('blog-posts-container');
    const loadingMessageBlogs = document.querySelector('#blog-listing .loading-message');
    const categoryFilterContainer = document.getElementById('category-filter-container');

    let allFetchedPosts = []; // Store all posts fetched from API

    if (typeof GOOGLE_SHEET_API_BASE_URL === 'undefined' || !GOOGLE_SHEET_API_BASE_URL) {
        handleError("API URL configuration error. Cannot load blog posts.", loadingMessageBlogs, blogPostsContainer);
        return;
    }

    const blogsApiUrl = `${GOOGLE_SHEET_API_BASE_URL}?sheet=Blogs`;

    fetch(blogsApiUrl)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Network response error: ${response.status} - ${response.statusText}. Response: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (loadingMessageBlogs) loadingMessageBlogs.remove();

            if (data && data.error) {
                 handleError(`Error loading blog posts: ${data.message}`, null, blogPostsContainer);
                 return;
            }
            if (data && Array.isArray(data)) {
                allFetchedPosts = data.sort((a, b) => { // Sort once after fetching
                    const dateA = new Date(a.datePublished);
                    const dateB = new Date(b.datePublished);
                    if (isNaN(dateA) && isNaN(dateB)) return 0;
                    if (isNaN(dateA)) return 1;
                    if (isNaN(dateB)) return -1;
                    return dateB - dateA;
                });

                if (allFetchedPosts.length > 0) {
                    populateCategoryFilters(allFetchedPosts);
                    displayBlogPosts(allFetchedPosts.slice(0, 9)); // Display initial N posts (e.g., 9)
                    // Or display all: displayBlogPosts(allFetchedPosts);
                    // Or display posts of the "all" category (which is all posts)
                    // filterPostsByCategory("all");
                } else {
                     blogPostsContainer.innerHTML = '<p>No blog posts available at this moment.</p>';
                }

            } else {
                handleError('Could not load blog posts due to unexpected data format.', null, blogPostsContainer);
            }
        })
        .catch(error => {
            handleError(`Failed to load blog posts. ${error.message}. Check console for details.`, loadingMessageBlogs, blogPostsContainer);
        });

    function handleError(message, loadingElement, containerElement) {
        console.error(message);
        if (loadingElement) loadingElement.remove();
        if (containerElement) containerElement.innerHTML = `<p class="error-message">${message}</p>`;
    }

    function populateCategoryFilters(posts) {
        if (!categoryFilterContainer) return;

        const categories = new Set(); // Use a Set to store unique categories
        posts.forEach(post => {
            if (post.category) {
                // Handle multiple categories separated by comma
                const postCategories = post.category.split(',').map(cat => cat.trim());
                postCategories.forEach(cat => {
                    if (cat) categories.add(cat); // Add non-empty categories
                });
            }
        });

        categories.forEach(category => {
            const button = document.createElement('button');
            button.classList.add('category-filter-btn');
            button.dataset.category = category.toLowerCase().replace(/\s+/g, '-'); // Create a slug-like data attribute
            button.textContent = category;
            button.addEventListener('click', function() {
                filterPostsByCategory(category); // Pass original category name
                // Handle active state for buttons
                document.querySelectorAll('.category-filter-btn').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            });
            categoryFilterContainer.appendChild(button);
        });

        // Add event listener for the "All" button if it's static in HTML
        const allButton = categoryFilterContainer.querySelector('[data-category="all"]');
        if (allButton) {
            allButton.addEventListener('click', function() {
                filterPostsByCategory("all");
                document.querySelectorAll('.category-filter-btn').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            });
        }
    }

    function filterPostsByCategory(selectedCategory) {
        let filteredPosts;
        if (selectedCategory === "all") {
            filteredPosts = allFetchedPosts;
        } else {
            filteredPosts = allFetchedPosts.filter(post => {
                if (post.category) {
                    const postCategories = post.category.split(',').map(cat => cat.trim());
                    return postCategories.includes(selectedCategory);
                }
                return false;
            });
        }
        displayBlogPosts(filteredPosts);
    }


    function displayBlogPosts(postsToDisplay) {
        if (!blogPostsContainer) return;
        blogPostsContainer.innerHTML = ''; // Clear previous posts

        if (postsToDisplay.length === 0) {
            blogPostsContainer.innerHTML = '<p>এই ক্যাটাগরিতে কোনো পোস্ট পাওয়া যায়নি।</p>';
            return;
        }

        // Display only a certain number of recent posts initially or after "All"
        // const postsToShow = (currentCategory === "all") ? postsToDisplay.slice(0, 9) : postsToDisplay;
        // For now, display all filtered posts. You can add pagination or "load more" later.

        postsToDisplay.forEach(post => {
            if (!post.slug || !post.title || !post.summary) {
                console.warn('Skipping blog post with missing slug, title, or summary:', post);
                return;
            }

            const postCard = document.createElement('div');
            postCard.classList.add('blog-card');

            let imageHtml = `<div class="card-image-container"><img src="images/placeholder-blog.png" alt="Placeholder Blog Image" loading="lazy"></div>`;
            if (post.imageUrl) {
                const processedImageUrl = getProcessedImageUrl(post.imageUrl, 'images/'); // Uses common.js function
                if (processedImageUrl) {
                    imageHtml = `<div class="card-image-container">
                                    <img src="${processedImageUrl}" 
                                         alt="${post.title || 'Blog post image'}" 
                                         loading="lazy" 
                                         onerror="this.onerror=null; this.src='images/placeholder-blog.png'; this.alt='Image could not be loaded';">
                                 </div>`;
                }
            }

            const postLink = `blog-post.html?slug=${encodeURIComponent(post.slug.trim())}`;
            const titleHtml = `<h3><a href="${postLink}">${post.title}</a></h3>`;
            let dateHtml = '';
            if (post.datePublished) {
                try {
                    const dateObj = new Date(post.datePublished);
                    if (isNaN(dateObj.getTime())) throw new Error('Invalid date');
                    const options = { year: 'numeric', month: 'long', day: 'numeric' };
                    dateHtml = `<p class="date">প্রকাশিত: ${dateObj.toLocaleDateString('bn-BD', options)}</p>`;
                } catch (e) {
                    dateHtml = `<p class="date">প্রকাশের তারিখ: অজানা</p>`;
                }
            }
            const summaryHtml = `<p class="summary">${post.summary}</p>`;
            const readMoreHtml = `<div class="card-footer-links"><a href="${postLink}">বিস্তারিত পড়ুন →</a></div>`;

            postCard.innerHTML = `
                ${imageHtml}
                <div class="card-content">
                    ${titleHtml}
                    ${dateHtml}
                    ${summaryHtml}
                    ${readMoreHtml}
                </div>
            `;
            blogPostsContainer.appendChild(postCard);
        });
    }
});