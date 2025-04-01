document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Project Details Expand/Collapse
    const expandButtons = document.querySelectorAll('.expand-button');
    
    expandButtons.forEach(button => {
        button.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const detailsId = this.getAttribute('aria-controls');
            const detailsElement = document.getElementById(detailsId);
            
            if (isExpanded) {
                this.setAttribute('aria-expanded', 'false');
                this.querySelector('span').textContent = 'Proceso';
                detailsElement.classList.remove('expanded');
            } else {
                this.setAttribute('aria-expanded', 'true');
                this.querySelector('span').textContent = 'Ocultar Proceso';
                detailsElement.classList.add('expanded');
            }
        });
    });
    
    // Gallery Sliders
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        const slides = item.querySelectorAll('.gallery-slides img, .video-slide');
        const prevBtn = item.querySelector('.gallery-prev');
        const nextBtn = item.querySelector('.gallery-next');
        let currentIndex = 0;
        let isAnimating = false;
        let autoplayInterval;
        
        // Function to show a specific slide
        function showSlide(index) {
            if (isAnimating) return;
            
            isAnimating = true;
            
            // Hide all slides
            slides.forEach(slide => {
                slide.classList.remove('active');
            });
            
            // Show the selected slide
            slides[index].classList.add('active');
            
            // Reset animation flag after transition completes
            setTimeout(() => {
                isAnimating = false;
            }, 500);
        }
        
        // Next slide function
        function nextSlide() {
            currentIndex = (currentIndex + 1) % slides.length;
            showSlide(currentIndex);
        }
        
        // Previous slide function
        function prevSlide() {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            showSlide(currentIndex);
        }
        
        // Add event listeners to buttons
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', prevSlide);
            nextBtn.addEventListener('click', nextSlide);
        }
        
        // Start autoplay
        function startAutoplay() {
            autoplayInterval = setInterval(nextSlide, 5000);
        }
        
        // Stop autoplay on hover
        item.addEventListener('mouseenter', () => {
            clearInterval(autoplayInterval);
        });
        
        // Resume autoplay when mouse leaves
        item.addEventListener('mouseleave', startAutoplay);
        
        // Initialize autoplay
        startAutoplay();
    });
    
    // Add responsive behavior for videos
    function resizeVideos() {
        const videos = document.querySelectorAll('.project-video video, .video-container video');
        videos.forEach(video => {
            const container = video.parentElement;
            if (container.classList.contains('project-video') || container.classList.contains('video-container')) {
                const containerWidth = container.offsetWidth;
                const containerHeight = containerWidth * (9/16); // 16:9 aspect ratio
                container.style.height = `${containerHeight}px`;
            }
        });
    }
    
    // Initial resize
    resizeVideos();
    
    // Resize on window resize
    window.addEventListener('resize', resizeVideos);
    
    // Autoplay videos when they come into view
    const autoplayVideos = document.querySelectorAll('.autoplay-video');
    
    // Create an Intersection Observer
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play();
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, { threshold: 0.5 });
    
    // Observe each video
    autoplayVideos.forEach(video => {
        videoObserver.observe(video);
        
        // Add hover event for sound
        const container = video.closest('.project-video') || video.closest('.video-container') || video.closest('.video-slide');
        
        if (container) {
            // On hover, unmute with fade in
            container.addEventListener('mouseenter', () => {
                video.muted = false;
                
                // Fade in volume
                let volume = 0;
                const fadeIn = setInterval(() => {
                    volume += 0.1;
                    if (volume >= 1) {
                        volume = 1;
                        clearInterval(fadeIn);
                    }
                    video.volume = volume;
                }, 100);
            });
            
            // On mouse leave, mute with fade out
            container.addEventListener('mouseleave', () => {
                // Fade out volume
                let volume = video.volume;
                const fadeOut = setInterval(() => {
                    volume -= 0.1;
                    if (volume <= 0) {
                        volume = 0;
                        clearInterval(fadeOut);
                        video.muted = true;
                    }
                    video.volume = volume;
                }, 100);
            });
        }
    });
});