// Store generated images in memory (since localStorage is not supported)
let imageHistory = [];
let currentImageUrl = '';
let currentPrompt = '';

// Backend server URL
const API_BASE_URL = 'http://127.0.0.1:5500';

// DOM Elements
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const promptInput = document.getElementById('promptInput');
const styleSelect = document.getElementById('styleSelect');
const fileUpload = document.getElementById('fileUpload');
const fileName = document.getElementById('fileName');
const generateBtn = document.getElementById('generateBtn');
const resultContainer = document.getElementById('resultContainer');
const loadingAnimation = document.getElementById('loadingAnimation');
const generatedImageContainer = document.getElementById('generatedImageContainer');
const generatedImage = document.getElementById('generatedImage');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const galleryGrid = document.getElementById('galleryGrid');
const emptyGallery = document.getElementById('emptyGallery');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const fullscreenModal = document.getElementById('fullscreenModal');
const fullscreenImage = document.getElementById('fullscreenImage');
const closeModal = document.getElementById('closeModal');

// Mobile Menu Toggle
mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.mobile-nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// File Upload Handler
fileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (event) => {
            promptInput.value = event.target.result;
            fileName.textContent = `Loaded: ${file.name}`;
        };
        reader.readAsText(file);
    } else {
        alert('Please upload a valid .txt file');
        fileUpload.value = '';
    }
});

// Generate Image Function - Now calls our backend
generateBtn.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    const style = styleSelect.value;

    // Validation
    if (!prompt) {
        alert('⚠️ Please enter a prompt to generate an image');
        promptInput.focus();
        return;
    }

    // Construct full prompt with style
    const fullPrompt = style ? `${prompt}, ${style} style` : prompt;
    currentPrompt = fullPrompt;

    try {
        // Show loading animation
        resultContainer.style.display = 'none';
        generatedImageContainer.style.display = 'none';
        loadingAnimation.style.display = 'block';
        
        // Disable button during generation
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

        console.log('🎨 Generating image with prompt:', fullPrompt);
        console.log('📡 Calling backend server...');

        // Call our backend API
        const response = await fetch(`${API_BASE_URL}/api/generate-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: fullPrompt })
        });

        console.log('📡 Backend Response Status:', response.status);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate image');
        }

        if (data.success && data.imageUrl) {
            currentImageUrl = data.imageUrl;
            console.log('✅ Image generated successfully!');
            console.log('🖼️ Image URL:', currentImageUrl);
            displayGeneratedImage(data.imageUrl);
            addToHistory(data.imageUrl, fullPrompt);
        } else {
            throw new Error('No image URL in response');
        }

    } catch (error) {
        console.error('❌ Error generating image:', error);
        
        let errorMessage = '❌ Failed to generate image!\n\n';
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage += '🌐 SERVER CONNECTION ERROR\n\n';
            errorMessage += 'Cannot connect to the backend server.\n\n';
            errorMessage += '📝 Make sure:\n';
            errorMessage += '1. The Node.js server is running\n';
            errorMessage += '2. Run "npm start" in the terminal\n';
            errorMessage += '3. Server should be at http://127.0.0.1:5500';
        } else if (error.message.includes('Invalid API Key')) {
            errorMessage += '🔑 API KEY ISSUE\n\n';
            errorMessage += 'The API key is invalid or expired.\n\n';
            errorMessage += 'Get a new key from https://deepai.org';
        } else if (error.message.includes('Payment required')) {
            errorMessage += '💳 CREDITS EXHAUSTED\n\n';
            errorMessage += 'The API has run out of free credits.\n\n';
            errorMessage += 'Visit https://deepai.org to add more credits.';
        } else if (error.message.includes('Too many requests')) {
            errorMessage += '⏱️ RATE LIMIT EXCEEDED\n\n';
            errorMessage += 'Please wait a moment before trying again.';
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
        
        // Reset UI
        loadingAnimation.style.display = 'none';
        resultContainer.style.display = 'flex';
    } finally {
        // Re-enable button
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Generate Image';
    }
});

// Display Generated Image
function displayGeneratedImage(imageUrl) {
    loadingAnimation.style.display = 'none';
    generatedImage.src = imageUrl;
    generatedImageContainer.style.display = 'block';
    
    // Scroll to result
    generatedImageContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Add Image to History
function addToHistory(imageUrl, prompt) {
    const historyItem = {
        url: imageUrl,
        prompt: prompt,
        timestamp: new Date().toISOString(),
        id: Date.now()
    };

    imageHistory.unshift(historyItem);
    
    // Limit history to 50 items
    if (imageHistory.length > 50) {
        imageHistory = imageHistory.slice(0, 50);
    }

    updateGallery();
}

// Update Gallery Display
function updateGallery() {
    galleryGrid.innerHTML = '';

    if (imageHistory.length === 0) {
        emptyGallery.style.display = 'block';
        galleryGrid.style.display = 'none';
    } else {
        emptyGallery.style.display = 'none';
        galleryGrid.style.display = 'grid';

        imageHistory.forEach(item => {
            const galleryItem = createGalleryItem(item);
            galleryGrid.appendChild(galleryItem);
        });
    }
}

// Create Gallery Item
function createGalleryItem(item) {
    const div = document.createElement('div');
    div.className = 'gallery-item';

    const date = new Date(item.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Escape HTML in prompt to prevent XSS
    const safePrompt = item.prompt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const safeUrl = item.url.replace(/"/g, '&quot;');

    div.innerHTML = `
        <img src="${safeUrl}" alt="AI generated image" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22250%22><rect fill=%22%23333%22 width=%22300%22 height=%22250%22/><text fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22>Image Not Available</text></svg>'">
        <div class="gallery-item-info">
            <p class="gallery-item-prompt">${safePrompt}</p>
            <p class="gallery-item-date">${date}</p>
        </div>
        <div class="gallery-item-actions">
            <button class="gallery-action-btn" onclick="viewImageFullscreen('${safeUrl}')" title="View">
                <i class="fas fa-eye"></i>
            </button>
            <button class="gallery-action-btn" onclick="downloadImage('${safeUrl}', 'ai-image-${item.id}.jpg')" title="Download">
                <i class="fas fa-download"></i>
            </button>
            <button class="gallery-action-btn" onclick="deleteFromHistory(${item.id})" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    return div;
}

// Download Image
downloadBtn.addEventListener('click', () => {
    if (currentImageUrl) {
        downloadImage(currentImageUrl, 'ai-generated-image.jpg');
    }
});

function downloadImage(url, filename) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        })
        .catch(error => {
            console.error('Download error:', error);
            // Fallback: open in new tab
            window.open(url, '_blank');
        });
}

// Share Image
shareBtn.addEventListener('click', async () => {
    if (!currentImageUrl) return;

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'AI Generated Image',
                text: `Check out this AI-generated image: ${currentPrompt}`,
                url: currentImageUrl
            });
        } catch (error) {
            if (error.name !== 'AbortError') {
                copyToClipboard(currentImageUrl);
            }
        }
    } else {
        copyToClipboard(currentImageUrl);
    }
});

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Image URL copied to clipboard!');
    }).catch(() => {
        prompt('Copy this URL:', text);
    });
}

// Fullscreen Image
fullscreenBtn.addEventListener('click', () => {
    if (currentImageUrl) {
        viewImageFullscreen(currentImageUrl);
    }
});

function viewImageFullscreen(url) {
    fullscreenImage.src = url;
    fullscreenModal.classList.add('active');
}

closeModal.addEventListener('click', () => {
    fullscreenModal.classList.remove('active');
});

fullscreenModal.addEventListener('click', (e) => {
    if (e.target === fullscreenModal) {
        fullscreenModal.classList.remove('active');
    }
});

// Regenerate Image
regenerateBtn.addEventListener('click', () => {
    if (currentPrompt) {
        promptInput.value = currentPrompt;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => generateBtn.click(), 500);
    }
});

// Clear History
clearHistoryBtn.addEventListener('click', () => {
    if (imageHistory.length === 0) {
        alert('Gallery is already empty!');
        return;
    }
    
    if (confirm('⚠️ Are you sure you want to clear all your generated images?\n\nThis cannot be undone!')) {
        imageHistory = [];
        updateGallery();
        alert('✅ Gallery cleared successfully!');
    }
});

// Delete from History
function deleteFromHistory(id) {
    if (confirm('Delete this image from history?')) {
        imageHistory = imageHistory.filter(item => item.id !== id);
        updateGallery();
    }
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (promptInput === document.activeElement) {
            generateBtn.click();
        }
    }

    // Escape to close fullscreen
    if (e.key === 'Escape') {
        fullscreenModal.classList.remove('active');
        mobileMenu.classList.remove('active');
    }
});

// Auto-resize textarea
promptInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Initialize Gallery on Load
updateGallery();

// Add scroll animation
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(15, 23, 42, 0.98)';
    } else {
        header.style.background = 'rgba(15, 23, 42, 0.95)';
    }
});

// Check server connection on load
async function checkServerConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (response.ok) {
            console.log('✅ Backend server is running and connected!');
        } else {
            console.warn('⚠️ Backend server returned an error');
        }
    } catch (error) {
        console.error('❌ Cannot connect to backend server');
        console.error('Please make sure the server is running with "npm start"');
    }
}

// Check connection on page load
checkServerConnection();

// Example prompts for demonstration
const examplePrompts = [
    "A futuristic city on Mars at sunset with flying cars",
    "A magical forest with glowing mushrooms and fireflies",
    "A cyberpunk street market in the rain at night",
    "A majestic dragon flying over snowy mountains",
    "An underwater castle with colorful coral and tropical fish",
    "A steampunk airship sailing through clouds",
    "A cozy cottage in a lavender field during golden hour",
    "A robot and a child sharing ice cream in a park"
];

// Add example prompt functionality
function loadRandomPrompt() {
    const randomPrompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = randomPrompt;
    promptInput.style.height = 'auto';
    promptInput.style.height = (promptInput.scrollHeight) + 'px';
}

// Log ready state
console.log('🎨 AI Image Creator initialized!');
console.log('💡 Tip: Press Ctrl/Cmd + Enter to generate while in the prompt field');
console.log('🔧 Debug mode enabled - check console for detailed logs');
console.log('');
console.log('📡 Backend URL:', API_BASE_URL);
