document.addEventListener('DOMContentLoaded', function() {
    const postTitleElement = document.getElementById('blog-post-title');
    const postDateElement = document.getElementById('blog-post-date-published');
    // const postAuthorElement = document.getElementById('blog-post-author-name'); // Uncomment if you have an element with this ID for author
    const postImageElement = document.getElementById('blog-post-image');
    const postImageContainer = document.querySelector('.post-featured-image-container'); // To show/hide the image container
    const postContentElement = document.getElementById('blog-post-content');
    const loadingMessagePost = document.querySelector('#blog-post-content .loading-message'); // Assumes loading message is inside postContentElement

    // Check if the GOOGLE_SHEET_API_BASE_URL is defined (it should be in the HTML)
    if (typeof GOOGLE_SHEET_API_BASE_URL === 'undefined' || !GOOGLE_SHEET_API_BASE_URL) {
        console.error("Error: GOOGLE_SHEET_API_BASE_URL is not defined in the HTML. Please add it.");
        if (postTitleElement) postTitleElement.textContent = 'Configuration Error';
        if (postContentElement) {
            if (loadingMessagePost) loadingMessagePost.remove();
            postContentElement.innerHTML = '<p class="error-message">API URL configuration error. Cannot load post.</p>';
        }
        return; // Stop execution
    }

    // Get the 'slug' query parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const postSlug = urlParams.get('slug');

    if (!postSlug) {
        if (postTitleElement) postTitleElement.textContent = 'Post Not Found';
        if (postContentElement) {
            if (loadingMessagePost) loadingMessagePost.remove();
            postContentElement.innerHTML = '<p class="error-message">Error: Blog post identifier (slug) not found in the URL. Please ensure you are accessing a valid blog post link.</p>';
        }
        if (postImageContainer) postImageContainer.style.display = 'none'; // Hide image container if no slug
        return; // Stop execution
    }

    const blogsApiUrl = `${GOOGLE_SHEET_API_BASE_URL}?sheet=Blogs`;

    fetch(blogsApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(allPosts => {
            if (loadingMessagePost) {
                loadingMessagePost.remove(); // Remove loading message once data (or error) is received
            }

            // Check for API error response from Apps Script itself
            if (allPosts && allPosts.error) {
                 console.error('API Error from Google Apps Script:', allPosts.message);
                 if (postTitleElement) postTitleElement.textContent = 'Error Loading Post';
                 if (postContentElement) postContentElement.innerHTML = `<p class="error-message">Error loading post data: ${allPosts.message}</p>`;
                 if (postImageContainer) postImageContainer.style.display = 'none';
                 return;
            }

            // Find the specific post by slug
            // Ensure 'slug' property exists and trim whitespace for reliable comparison
            const post = allPosts.find(p => p.slug && p.slug.trim() === postSlug.trim());

            if (post) {
                displayFullPost(post);
            } else {
                if (postTitleElement) postTitleElement.textContent = 'Post Not Found';
                if (postContentElement) postContentElement.innerHTML = `<p class="error-message">Sorry, the blog post you are looking for (slug: "<strong>${escapeHTML(postSlug)}</strong>") could not be found. It might have been moved, deleted, or the slug might be incorrect.</p>`;
                if (postImageContainer) postImageContainer.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching or finding the specific blog post:', error);
            if (loadingMessagePost) {
                loadingMessagePost.remove();
            }
            if (postTitleElement) postTitleElement.textContent = 'Error Loading Post';
            if (postContentElement) postContentElement.innerHTML = `<p class="error-message">There was an error loading the blog post. Error: ${error.message}. Please check your internet connection, the API URL, and ensure the Google Sheet is accessible and correctly formatted.</p>`;
            if (postImageContainer) postImageContainer.style.display = 'none';
        });

    function displayFullPost(post) {
        // Update page title (in the browser tab)
        document.title = `${post.title || 'Blog Post'} - Your Name`; // Replace 'Your Name' with your actual name or site title

        // Display Post Title (Bangla)
        if (postTitleElement) {
            postTitleElement.textContent = post.title || 'শিরোনাম উপলব্ধ নেই';
        }

        // Display Publication Date (Bangla)
        if (postDateElement) {
            if (post.datePublished) {
                 try {
                    const dateObj = new Date(post.datePublished);
                    // Ensure the date is valid before formatting
                    if (isNaN(dateObj.getTime())) {
                        throw new Error('Invalid date');
                    }
                    const options = { year: 'numeric', month: 'long', day: 'numeric' };
                    postDateElement.textContent = dateObj.toLocaleDateString('bn-BD', options);
                } catch(e) {
                    console.warn("Could not parse or format date for blog post titled: ", post.title, "; Date value: ", post.datePublished, e);
                    postDateElement.textContent = 'অজানা'; // Fallback text for invalid date
                }
            } else {
                postDateElement.textContent = 'অজানা'; // Fallback if date is not provided
            }
        }

        // Display Author (Optional - uncomment if you have an author field and HTML element)
        // if (postAuthorElement) {
        //     if (post.author) {
        //         postAuthorElement.textContent = post.author;
        //     } else {
        //         // Optionally hide the author section if no author is provided
        //         const authorContainer = postAuthorElement.closest('.author-container-class'); // Add a class to the parent container of author
        //         if (authorContainer) authorContainer.style.display = 'none';
        //         else postAuthorElement.textContent = ''; // Or just clear it
        //     }
        // }

        // Display Featured Image
        if (postImageElement && postImageContainer) {
            if (post.imageUrl) {
                // Assuming blog-post.html is in the root, and 'images' folder is also in the root.
                const imgSrc = post.imageUrl.startsWith('http') ? post.imageUrl : `images/${post.imageUrl.trim()}`;
                postImageElement.src = imgSrc;
                postImageElement.alt = post.title || 'Blog post featured image';
                postImageElement.style.display = 'block';
                postImageContainer.style.display = 'block'; // Show the container
            } else {
                postImageElement.style.display = 'none'; // Hide image if no URL
                postImageContainer.style.display = 'none'; // Hide container if no image
            }
        }

        // Display Full Blog Content (Bangla, with HTML rendering)
        if (postContentElement) {
            // IMPORTANT: This renders HTML from your Google Sheet 'content' column.
            // Ensure you trust the content you put in the sheet.
            // Avoid allowing untrusted users to edit this sheet directly.
            postContentElement.innerHTML = post.content || '<p>এই পোস্টের জন্য কোনো কনটেন্ট উপলব্ধ নেই।</p>';
        }
    }

    // Helper function to escape HTML for displaying user-provided slugs safely in error messages
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
});