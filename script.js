document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Variable global para almacenar el volumen preferido del usuario
    let userPreferredVolume = 0.8; // Inicialmente al 80%
    
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
                this.querySelector('span').textContent = 'Ocultar';
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
                
                // Pause any videos in non-active slides
                const slideVideo = slide.querySelector('video');
                if (slideVideo) {
                    slideVideo.pause();
                }
            });
            
            // Show the selected slide
            slides[index].classList.add('active');
            
            // Play video in active slide if it exists
            const activeVideo = slides[index].querySelector('video');
            if (activeVideo) {
                activeVideo.play().catch(e => console.log("Autoplay prevented:", e));
                
                // Configurar interacción de hover para el video activo en la galería
                const videoContainer = slides[index];
                setupSingleVideoHover(videoContainer);
            }
            
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
        
        // Inicializar el primer slide
        showSlide(currentIndex);
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
    
    // Configurar todos los videos para reproducirse en loop
    autoplayVideos.forEach(video => {
        video.loop = true;
        
        // Detectar cambios manuales de volumen
        video.addEventListener('volumechange', function(e) {
            // Solo actualizar si el cambio no fue causado por nuestro código
            if (!video.isAdjustingVolume && !video.muted) {
                userPreferredVolume = video.volume;
                console.log("Usuario ajustó volumen a:", userPreferredVolume);
            }
        });
    });
    
    // Create an Intersection Observer
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => console.log("Autoplay prevented:", e));
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, { threshold: 0.3 });
    
    // Observe each video
    autoplayVideos.forEach(video => {
        videoObserver.observe(video);
    });
    
    // Configurar interacción de hover para todos los contenedores de video
    setupVideoHoverInteraction();
    
    function setupVideoHoverInteraction() {
        // Seleccionar todos los contenedores de video fuera de las galerías
        const videoContainers = document.querySelectorAll('.project-video, .video-container');
        
        videoContainers.forEach(container => {
            setupSingleVideoHover(container);
        });
    }
    
    function setupSingleVideoHover(container) {
        const video = container.querySelector('video');
        const hoverText = container.querySelector('.video-hover-text');
        
        // Verificar si el video existe, tiene texto de hover y no tiene la clase no-sound
        if (video && hoverText && !video.classList.contains('no-sound')) {
            // Eliminar eventos previos para evitar duplicados
            container.removeEventListener('mouseenter', container.mouseEnterHandler);
            container.removeEventListener('mouseleave', container.mouseLeaveHandler);
            
            // Crear funciones de manejador y guardarlas en el elemento para poder eliminarlas después
            container.mouseEnterHandler = () => {
                // Fade out hover text
                fadeElement(hoverText, false);
                
                // Unmute and fade in volume
                video.muted = false;
                fadeVolume(video, true);
            };
            
            container.mouseLeaveHandler = () => {
                // Fade in hover text
                fadeElement(hoverText, true);
                
                // Fade out volume and mute
                fadeVolume(video, false);
            };
            
            // Añadir los eventos
            container.addEventListener('mouseenter', container.mouseEnterHandler);
            container.addEventListener('mouseleave', container.mouseLeaveHandler);
            
            // Asegurarse de que el texto de hover sea visible inicialmente
            hoverText.style.opacity = '0.8';
        } else if (video && video.classList.contains('no-sound')) {
            // Para videos sin sonido, ocultar el texto de hover
            if (hoverText) {
                hoverText.style.display = 'none';
            }
        }
    }
    
    // Función para hacer fade in/out de un elemento
    function fadeElement(element, fadeIn) {
        // Cancelar cualquier animación en curso
        if (element.fadeInterval) {
            clearInterval(element.fadeInterval);
        }
        
        const startOpacity = parseFloat(window.getComputedStyle(element).opacity);
        let opacity = startOpacity;
        const step = fadeIn ? 0.1 : -0.1;
        
        element.fadeInterval = setInterval(() => {
            opacity += step;
            
            if ((fadeIn && opacity >= 0.8) || (!fadeIn && opacity <= 0)) {
                opacity = fadeIn ? 0.8 : 0;
                clearInterval(element.fadeInterval);
                element.fadeInterval = null;
            }
            
            element.style.opacity = opacity;
        }, 50);
    }
    
    // Función para hacer fade in/out del volumen
    function fadeVolume(video, fadeIn) {
        // Marcar que estamos ajustando el volumen programáticamente
        video.isAdjustingVolume = true;
        
        // Cancelar cualquier animación de volumen en curso
        if (video.volumeInterval) {
            clearInterval(video.volumeInterval);
        }
        
        let volume = video.volume;
        const targetVolume = fadeIn ? userPreferredVolume : 0;
        const step = fadeIn ? 0.1 : -0.1;
        
        video.volumeInterval = setInterval(() => {
            volume = Math.min(Math.max(volume + step, 0), userPreferredVolume);
            
            if ((fadeIn && volume >= targetVolume) || (!fadeIn && volume <= 0)) {
                volume = fadeIn ? targetVolume : 0;
                clearInterval(video.volumeInterval);
                video.volumeInterval = null;
                
                if (!fadeIn) {
                    video.muted = true;
                }
                
                // Ya no estamos ajustando el volumen programáticamente
                video.isAdjustingVolume = false;
            }
            
            video.volume = volume;
        }, 100);
    }
    
    // Configurar manualmente los videos en la sección de galería
    document.querySelectorAll('.gallery-slider .video-slide.active').forEach(slide => {
        setupSingleVideoHover(slide);
    });
});