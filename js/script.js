// js/script.js
document.addEventListener('DOMContentLoaded', function() {
    const projectsContainer = document.getElementById('projects-container');
    const loadingMessageProjects = document.querySelector('#projects-container .loading-message');

    if (typeof GOOGLE_SHEET_API_BASE_URL === 'undefined' || !GOOGLE_SHEET_API_BASE_URL) {
        console.error("Error: GOOGLE_SHEET_API_BASE_URL is not defined. Cannot load projects.");
        if (loadingMessageProjects) {
            loadingMessageProjects.textContent = 'API URL configuration error.';
            loadingMessageProjects.classList.add('error-message');
        }
        return;
    }

    const projectsApiUrl = `${GOOGLE_SHEET_API_BASE_URL}?sheet=Projects`;

    fetch(projectsApiUrl)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Network response error: ${response.status} - ${response.statusText}. Response: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (loadingMessageProjects) loadingMessageProjects.remove();

            if (data && data.error) {
                 console.error('API Error from Google Apps Script (Projects):', data.message);
                 projectsContainer.innerHTML = `<p class="error-message">Error loading projects: ${data.message}</p>`;
                 return;
            }
            if (data && Array.isArray(data) && data.length > 0) {
                displayProjects(data);
            } else if (Array.isArray(data) && data.length === 0) {
                projectsContainer.innerHTML = '<p>No projects to display currently. Please add some to the sheet!</p>';
            }
            else {
                console.error('Unexpected data format for projects:', data);
                projectsContainer.innerHTML = '<p class="error-message">Could not load projects due to unexpected data format.</p>';
            }
        })
        .catch(error => {
            console.error('Fetch error for projects:', error);
            if (loadingMessageProjects) loadingMessageProjects.remove();
            projectsContainer.innerHTML = `<p class="error-message">Failed to load projects. ${error.message}. Check console for details.</p>`;
        });

    function displayProjects(projects) {
        if (!projectsContainer) return;
        projectsContainer.innerHTML = '';

        projects.forEach(project => {
            if (!project.id || !project.title) {
                console.warn('Skipping project with missing id or title:', project);
                return;
            }

            const projectCard = document.createElement('div');
            projectCard.classList.add('project-card');

            let imageHtml = `<div class="card-image-container"><img src="images/placeholder-project.png" alt="Placeholder Project Image" loading="lazy"></div>`;
            if (project.imageUrl) {
                const processedImageUrl = getProcessedImageUrl(project.imageUrl, 'images/');
                if (processedImageUrl) {
                    imageHtml = `<div class="card-image-container">
                                    <img src="${processedImageUrl}" 
                                         alt="${project.title || 'Project Image'}" 
                                         loading="lazy" 
                                         onerror="this.onerror=null; this.src='images/placeholder-project.png'; this.alt='Image could not be loaded';">
                                 </div>`;
                }
            }

            const titleHtml = `<h3><a href="${project.liveUrl || project.repoUrl || '#'}" target="_blank" rel="noopener noreferrer">${project.title || 'Untitled Project'}</a></h3>`;
            const descriptionHtml = `<p class="description">${project.description || 'No description available.'}</p>`;
            let tagsHtml = '';
            if (project.tags) {
                const tagsArray = project.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                if (tagsArray.length > 0) {
                    tagsHtml = `<div class="tags">${tagsArray.map(tag => `<span>${tag}</span>`).join('')}</div>`;
                }
            }
            let linksHtml = '<div class="card-footer-links">';
            let hasLinks = false;
            if (project.liveUrl && project.liveUrl.trim() !== '') {
                linksHtml += `<a href="${project.liveUrl.trim()}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary">Live Demo</a>`;
                hasLinks = true;
            }
            if (project.repoUrl && project.repoUrl.trim() !== '') {
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