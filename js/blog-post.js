// js/blog-post.js
document.addEventListener('DOMContentLoaded', function() {
    const postTitleElement = document.getElementById('blog-post-title');
    const postDateElement = document.getElementById('blog-post-date-published');
    const postImageElement = document.getElementById('blog-post-image');
    const postImageContainer = document.querySelector('.post-featured-image-container');
    const postContentElement = document.getElementById('blog-post-content');
    const loadingMessagePost = document.querySelector('#blog-post-content .loading-message');

    if (typeof GOOGLE_SHEET_API_BASE_URL === 'undefined' || !GOOGLE_SHEET_API_BASE_URL) {
        console.error("Error: GOOGLE_SHEET_API_BASE_URL is not defined. Cannot load post.");
        if (postTitleElement) postTitleElement.textContent = 'Configuration Error';
        if (postContentElement) {
            if (loadingMessagePost) loadingMessagePost.remove();
            postContentElement.innerHTML = '<p class="error-message">API URL configuration error.</p>';
        }
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const postSlug = urlParams.get('slug');

    if (!postSlug) {
        if (postTitleElement) postTitleElement.textContent = 'Post Not Found';
        if (postContentElement) {
            if (loadingMessagePost) loadingMessagePost.remove();
            postContentElement.innerHTML = '<p class="error-message">Blog post identifier (slug) not found in URL.</p>';
        }
        if (postImageContainer) postImageContainer.style.display = 'none';
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
        .then(allPosts => {
            if (loadingMessagePost) loadingMessagePost.remove();

            if (allPosts && allPosts.error) {
                 console.error('API Error from Google Apps Script (Single Blog Post):', allPosts.message);
                 if (postTitleElement) postTitleElement.textContent = 'Error Loading Post';
                 if (postContentElement) postContentElement.innerHTML = `<p class="error-message">Error loading post data: ${allPosts.message}</p>`;
                 if (postImageContainer) postImageContainer.style.display = 'none';
                 return;
            }
            if (!Array.isArray(allPosts)) {
                console.error('Invalid data format for blog posts. Expected array.', allPosts);
                if (postTitleElement) postTitleElement.textContent = 'Data Error';
                if (postContentElement) postContentElement.innerHTML = `<p class="error-message">Invalid data format received from API.</p>`;
                return;
            }

            const post = allPosts.find(p => p.slug && p.slug.trim() === postSlug.trim());

            if (post) {
                displayFullPost(post);
            } else {
                if (postTitleElement) postTitleElement.textContent = 'Post Not Found';
                if (postContentElement) postContentElement.innerHTML = `<p class="error-message">Sorry, the blog post with slug "<strong>${escapeHTML(postSlug)}</strong>" could not be found.</p>`;
                if (postImageContainer) postImageContainer.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Fetch error for specific blog post:', error);
            if (loadingMessagePost) loadingMessagePost.remove();
            if (postTitleElement) postTitleElement.textContent = 'Error Loading Post';
            if (postContentElement) postContentElement.innerHTML = `<p class="error-message">Failed to load this blog post. ${error.message}. Check console for details.</p>`;
            if (postImageContainer) postImageContainer.style.display = 'none';
        });

    function displayFullPost(post) {
        document.title = `${post.title || 'Blog Post'} - Your Name`;

        if (postTitleElement) {
            postTitleElement.textContent = post.title || 'শিরোনাম উপলব্ধ নেই';
        }

        if (postDateElement) {
            if (post.datePublished) {
                 try {
                    const dateObj = new Date(post.datePublished);
                    if (isNaN(dateObj.getTime())) throw new Error('Invalid date');
                    const options = { year: 'numeric', month: 'long', day: 'numeric' };
                    postDateElement.textContent = dateObj.toLocaleDateString('bn-BD', options);
                } catch(e) {
                    console.warn("Could not parse or format date for post: ", post.title, "; Date: ", post.datePublished, e);
                    postDateElement.textContent = 'অজানা';
                }
            } else {
                postDateElement.textContent = 'অজানা';
            }
        }

        // Display Featured Image
        if (postImageElement && postImageContainer) {
            if (post.imageUrl && post.imageUrl.trim() !== '') {
                const processedImageUrl = getProcessedImageUrl(post.imageUrl, 'images/');
                if (processedImageUrl) {
                    postImageElement.src = processedImageUrl;
                    postImageElement.alt = post.title || 'Blog post featured image';
                    postImageElement.style.display = 'block';
                    postImageContainer.style.display = 'block';

                    postImageElement.onerror = function() {
                        this.onerror = null; // Prevent infinite loop
                        this.src = 'images/placeholder-blog.png';
                        this.alt = 'Image could not be loaded';
                        console.warn(`Failed to load image for post "${post.title}" from: ${processedImageUrl}. Showing placeholder.`);
                    };
                } else {
                    postImageElement.style.display = 'none';
                    postImageContainer.style.display = 'none';
                }
            } else {
                postImageElement.style.display = 'none';
                postImageContainer.style.display = 'none';
            }
        }

        if (postContentElement) {
            postContentElement.innerHTML = post.content || '<p>এই পোস্টের জন্য কোনো কনটেন্ট উপলব্ধ নেই।</p>';
        }
    }

    function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
});