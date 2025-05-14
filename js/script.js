document.addEventListener('DOMContentLoaded', function() {
    const projectsContainer = document.getElementById('projects-container');
    const loadingMessageProjects = document.querySelector('#projects-container .loading-message');

    // Check if the GOOGLE_SHEET_API_BASE_URL is defined (it should be in the HTML)
    if (typeof GOOGLE_SHEET_API_BASE_URL === 'undefined' || !GOOGLE_SHEET_API_BASE_URL) {
        console.error("Error: GOOGLE_SHEET_API_BASE_URL is not defined in the HTML. Please add it.");
        if (loadingMessageProjects) {
            loadingMessageProjects.textContent = 'API URL configuration error. Cannot load projects.';
            loadingMessageProjects.classList.add('error-message');
        }
        return; // Stop execution if API URL is missing
    }

    const projectsApiUrl = `${GOOGLE_SHEET_API_BASE_URL}?sheet=Projects`;

    fetch(projectsApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (loadingMessageProjects) {
                loadingMessageProjects.remove(); // Remove "Loading..." message
            }
            if (data && data.length > 0) {
                displayProjects(data);
            } else if (data && data.error) { // Check for API error response from Apps Script
                 console.error('API Error:', data.message);
                 projectsContainer.innerHTML = `<p class="error-message">Error loading projects: ${data.message}</p>`;
            }
             else {
                projectsContainer.innerHTML = '<p>No projects to display at this time. Please check back later!</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching or parsing project data:', error);
            if (loadingMessageProjects) {
                loadingMessageProjects.remove();
            }
            projectsContainer.innerHTML = `<p class="error-message">Failed to load projects. Error: ${error.message}. Please ensure the API URL is correct and the Google Sheet is accessible.</p>`;
        });

    function displayProjects(projects) {
        if (!projectsContainer) return;
        projectsContainer.innerHTML = ''; // Clear any previous content or loading message

        projects.forEach(project => {
            if (!project.id || !project.title) { // Basic validation
                console.warn('Skipping a project due to missing id or title:', project);
                return;
            }

            const projectCard = document.createElement('div');
            projectCard.classList.add('project-card');

            // Image
            let imageHtml = `<div class="card-image-container"><img src="images/placeholder-project.png" alt="Placeholder"></div>`; // Default placeholder
            if (project.imageUrl) {
                const imgSrc = project.imageUrl.startsWith('http') ? project.imageUrl : `images/${project.imageUrl.trim()}`;
                imageHtml = `<div class="card-image-container"><img src="${imgSrc}" alt="${project.title || 'Project Image'}" loading="lazy"></div>`;
            }

            // Title
            const titleHtml = `<h3><a href="${project.liveUrl || project.repoUrl || '#'}" target="_blank" rel="noopener noreferrer">${project.title || 'Untitled Project'}</a></h3>`;

            // Description
            const descriptionHtml = `<p class="description">${project.description || 'No description available.'}</p>`;

            // Tags
            let tagsHtml = '';
            if (project.tags) {
                const tagsArray = project.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                if (tagsArray.length > 0) {
                    tagsHtml = `<div class="tags">${tagsArray.map(tag => `<span>${tag}</span>`).join('')}</div>`;
                }
            }

            // Links
            let linksHtml = '<div class="card-footer-links">';
            let hasLinks = false;
            if (project.liveUrl) {
                linksHtml += `<a href="${project.liveUrl.trim()}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary">Live Demo</a>`;
                hasLinks = true;
            }
            if (project.repoUrl) {
                linksHtml += `<a href="${project.repoUrl.trim()}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary">View Code</a>`;
                hasLinks = true;
            }
            linksHtml += '</div>';


            projectCard.innerHTML = `
                ${imageHtml}
                <div class="card-content">
                    ${titleHtml}
                    ${descriptionHtml}
                    ${tagsHtml}
                    ${hasLinks ? linksHtml : ''}
                </div>
            `;
            projectsContainer.appendChild(projectCard);
        });
    }
});