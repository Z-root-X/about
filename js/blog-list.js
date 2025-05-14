document.addEventListener('DOMContentLoaded', function() {
    const blogPostsContainer = document.getElementById('blog-posts-container');
    const loadingMessageBlogs = document.querySelector('#blog-listing .loading-message'); // Ensure selector is correct

    if (typeof GOOGLE_SHEET_API_BASE_URL === 'undefined' || !GOOGLE_SHEET_API_BASE_URL) {
        console.error("Error: GOOGLE_SHEET_API_BASE_URL is not defined in the HTML.");
        if (loadingMessageBlogs) {
            loadingMessageBlogs.textContent = 'API URL configuration error. Cannot load blog posts.';
            loadingMessageBlogs.classList.add('error-message');
        }
        return;
    }

    const blogsApiUrl = `${GOOGLE_SHEET_API_BASE_URL}?sheet=Blogs`;

    fetch(blogsApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (loadingMessageBlogs) {
                loadingMessageBlogs.remove();
            }
            if (data && data.length > 0) {
                // Sort posts by datePublished in descending order (newest first)
                const sortedData = data.sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished));
                displayBlogPosts(sortedData);
            } else if (data && data.error) {
                 console.error('API Error:', data.message);
                 blogPostsContainer.innerHTML = `<p class="error-message">Error loading blog posts: ${data.message}</p>`;
            }
            else {
                blogPostsContainer.innerHTML = '<p>No blog posts available at this moment. Please check back soon!</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching or parsing blog posts:', error);
            if (loadingMessageBlogs) {
                loadingMessageBlogs.remove();
            }
            blogPostsContainer.innerHTML = `<p class="error-message">Failed to load blog posts. Error: ${error.message}. Please ensure the API URL is correct and the Google Sheet is accessible.</p>`;
        });

    function displayBlogPosts(posts) {
        if (!blogPostsContainer) return;
        blogPostsContainer.innerHTML = ''; // Clear previous content

        posts.forEach(post => {
            // Basic validation for essential fields
            if (!post.slug || !post.title || !post.summary) {
                console.warn('Skipping a blog post due to missing slug, title, or summary:', post);
                return;
            }

            const postCard = document.createElement('div');
            postCard.classList.add('blog-card');

            // Image
            let imageHtml = `<div class="card-image-container"><img src="images/placeholder-blog.png" alt="Placeholder"></div>`; // Default placeholder
            if (post.imageUrl) {
                const imgSrc = post.imageUrl.startsWith('http') ? post.imageUrl : `images/${post.imageUrl.trim()}`;
                imageHtml = `<div class="card-image-container"><img src="${imgSrc}" alt="${post.title || 'Blog post image'}" loading="lazy"></div>`;
            }

            // Link to the full blog post
            const postLink = `blog-post.html?slug=${encodeURIComponent(post.slug.trim())}`;

            // Title (Bangla)
            const titleHtml = `<h3><a href="${postLink}">${post.title}</a></h3>`;

            // Date Published (Bangla formatting)
            let dateHtml = '';
            if (post.datePublished) {
                try {
                    const dateObj = new Date(post.datePublished);
                    const options = { year: 'numeric', month: 'long', day: 'numeric' };
                    const formattedDate = dateObj.toLocaleDateString('bn-BD', options); // Bengali locale
                    dateHtml = `<p class="date">প্রকাশিত: ${formattedDate}</p>`;
                } catch (e) {
                    console.warn("Could not parse date for blog post: ", post.title, e);
                    dateHtml = `<p class="date">প্রকাশের তারিখ: অজানা</p>`;
                }
            }

            // Summary (Bangla)
            const summaryHtml = `<p class="summary">${post.summary}</p>`;

            // Read More Link (Bangla)
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