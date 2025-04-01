document.addEventListener('DOMContentLoaded', function() {
    // Crear el contenedor del lightbox
    const lightboxHTML = `
        <div id="gallery-lightbox" class="gallery-lightbox">
            <div class="lightbox-content">
                <h3 class="lightbox-title">Título de la imagen</h3>
                <div class="lightbox-container"></div>
                <p class="lightbox-description">Descripción de la imagen o video...</p>
                <button class="lightbox-close" aria-label="Cerrar">×</button>
                <button class="lightbox-prev" aria-label="Anterior">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <button class="lightbox-next" aria-label="Siguiente">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
                <div class="lightbox-counter">1 / 5</div>
            </div>
        </div>
    `;
    
    // Añadir el lightbox al body
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    
    // Obtener referencias a los elementos del lightbox
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxContainer = lightbox.querySelector('.lightbox-container');
    const lightboxTitle = lightbox.querySelector('.lightbox-title');
    const lightboxDescription = lightbox.querySelector('.lightbox-description');
    const lightboxCounter = lightbox.querySelector('.lightbox-counter');
    const closeButton = lightbox.querySelector('.lightbox-close');
    const prevButton = lightbox.querySelector('.lightbox-prev');
    const nextButton = lightbox.querySelector('.lightbox-next');
    
    // Variables para controlar el lightbox
    let currentGallery = null;
    let currentIndex = 0;
    let galleryItems = [];
    let galleryTitles = [];
    let galleryDescriptions = [];
    
    // Función para obtener título y descripción
    function getItemMetadata(item) {
        let title = '';
        let description = '';
        
        if (item.tagName === 'IMG') {
            // Para imágenes, usar el alt como título y data-description si existe
            title = item.alt || 'Imagen';
            description = item.dataset.description || '';
        } else if (item.classList.contains('video-slide')) {
            // Para videos, buscar data-title y data-description
            const video = item.querySelector('video');
            if (video) {
                title = video.dataset.title || item.dataset.title || 'Video';
                description = video.dataset.description || item.dataset.description || '';
            }
        }
        
        return { title, description };
    }
    
    // Función para abrir el lightbox
    function openLightbox(gallery, index) {
        currentGallery = gallery;
        currentIndex = index;
        
        // Obtener todos los elementos de la galería
        if (gallery.classList.contains('gallery-slides')) {
            // Para galerías de imágenes
            galleryItems = Array.from(gallery.querySelectorAll('img'));
        } else if (gallery.classList.contains('video-slide')) {
            // Para galerías de videos, necesitamos obtener todos los slides hermanos
            const parentSlides = gallery.parentElement;
            galleryItems = Array.from(parentSlides.querySelectorAll('.video-slide'));
        }
        
        // Obtener títulos y descripciones
        galleryTitles = [];
        galleryDescriptions = [];
        
        galleryItems.forEach(item => {
            const { title, description } = getItemMetadata(item);
            galleryTitles.push(title);
            galleryDescriptions.push(description);
        });
        
        // Mostrar el elemento actual
        showLightboxItem(currentIndex);
        
        // Mostrar el lightbox
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Evitar scroll en el body
    }
    
    // Función para mostrar un elemento en el lightbox
    function showLightboxItem(index) {
        // Limpiar el contenedor
        lightboxContainer.innerHTML = '';
        
        const item = galleryItems[index];
        
        // Actualizar título y descripción
        lightboxTitle.textContent = galleryTitles[index];
        lightboxDescription.textContent = galleryDescriptions[index];
        
        // Actualizar contador
        lightboxCounter.textContent = `${index + 1} / ${galleryItems.length}`;
        
        if (item.tagName === 'IMG') {
            // Es una imagen
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.alt;
            img.className = 'lightbox-img';
            lightboxContainer.appendChild(img);
        } else if (item.classList.contains('video-slide')) {
            // Es un video slide
            const video = item.querySelector('video');
            if (video) {
                // Clonar el video para mantener su estado
                const videoClone = video.cloneNode(true);
                videoClone.className = 'lightbox-video';
                
                // Mantener el estado de reproducción y volumen
                videoClone.muted = video.muted;
                videoClone.volume = video.volume;
                
                // Si el video original estaba reproduciéndose, reproducir el clon
                if (!video.paused) {
                    videoClone.play().catch(e => console.log("Autoplay prevented in lightbox:", e));
                }
                
                // Añadir el texto de hover si existe
                const hoverText = item.querySelector('.video-hover-text');
                if (hoverText && !video.classList.contains('no-sound')) {
                    const hoverTextClone = hoverText.cloneNode(true);
                    
                    // Crear un contenedor para el video y el texto
                    const videoContainer = document.createElement('div');
                    videoContainer.className = 'lightbox-video-container';
                    videoContainer.appendChild(videoClone);
                    videoContainer.appendChild(hoverTextClone);
                    
                    // Añadir eventos de hover para el sonido
                    videoContainer.addEventListener('mouseenter', () => {
                        hoverTextClone.style.opacity = '0';
                        videoClone.muted = false;
                        
                        // Fade in volumen
                        let volume = 0;
                        videoClone.volume = volume;
                        const fadeIn = setInterval(() => {
                            volume = Math.min(volume + 0.1, window.userPreferredVolume || 0.8);
                            videoClone.volume = volume;
                            
                            if (volume >= (window.userPreferredVolume || 0.8)) {
                                clearInterval(fadeIn);
                            }
                        }, 100);
                    });
                    
                    videoContainer.addEventListener('mouseleave', () => {
                        hoverTextClone.style.opacity = '0.8';
                        
                        // Fade out volumen
                        let volume = videoClone.volume;
                        const fadeOut = setInterval(() => {
                            volume = Math.max(volume - 0.1, 0);
                            videoClone.volume = volume;
                            
                            if (volume <= 0) {
                                clearInterval(fadeOut);
                                videoClone.muted = true;
                            }
                        }, 100);
                    });
                    
                    lightboxContainer.appendChild(videoContainer);
                } else {
                    lightboxContainer.appendChild(videoClone);
                }
            }
        }
        
        // Actualizar el índice actual
        currentIndex = index;
        
        // Actualizar visibilidad de los botones de navegación
        updateNavigationButtons();
    }
    
    // Función para actualizar la visibilidad de los botones de navegación
    function updateNavigationButtons() {
        // Siempre mostrar los botones en un lightbox de galería
        prevButton.style.display = galleryItems.length > 1 ? 'flex' : 'none';
        nextButton.style.display = galleryItems.length > 1 ? 'flex' : 'none';
        lightboxCounter.style.display = galleryItems.length > 1 ? 'block' : 'none';
    }
    
    // Función para cerrar el lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restaurar scroll en el body
        
        // Limpiar el contenedor
        lightboxContainer.innerHTML = '';
        
        // Resetear variables
        currentGallery = null;
        currentIndex = 0;
        galleryItems = [];
    }
    
    // Función para ir al elemento anterior
    function prevItem() {
        if (currentIndex > 0) {
            showLightboxItem(currentIndex - 1);
        } else {
            // Ir al último elemento si estamos en el primero
            showLightboxItem(galleryItems.length - 1);
        }
    }
    
    // Función para ir al elemento siguiente
    function nextItem() {
        if (currentIndex < galleryItems.length - 1) {
            showLightboxItem(currentIndex + 1);
        } else {
            // Volver al primer elemento si estamos en el último
            showLightboxItem(0);
        }
    }
    
    // Añadir eventos a los botones del lightbox
    closeButton.addEventListener('click', closeLightbox);
    prevButton.addEventListener('click', prevItem);
    nextButton.addEventListener('click', nextItem);
    
    // Cerrar el lightbox al hacer clic fuera del contenido
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Añadir eventos de teclado para navegación
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            prevItem();
        } else if (e.key === 'ArrowRight') {
            nextItem();
        }
    });
    
    // Añadir eventos de clic a las imágenes y videos de la galería
    function setupGalleryLightbox() {
        // Para galerías de imágenes
        document.querySelectorAll('.gallery-slider').forEach((slider) => {
            // Hacer que todo el slider sea clicable
            slider.style.cursor = 'pointer';
            
            // Añadir evento de clic al slider completo
            slider.addEventListener('click', function(e) {
                // Evitar que el clic se propague a los botones de navegación
                if (e.target.closest('.gallery-prev') || e.target.closest('.gallery-next')) {
                    return;
                }
                
                const gallery = this.querySelector('.gallery-slides');
                const activeImg = gallery.querySelector('img.active');
                const activeVideo = gallery.querySelector('.video-slide.active');
                
                if (activeImg) {
                    // Encontrar el índice de la imagen activa
                    const images = Array.from(gallery.querySelectorAll('img'));
                    const index = images.indexOf(activeImg);
                    openLightbox(gallery, index);
                } else if (activeVideo) {
                    // Encontrar el índice del video activo
                    const videos = Array.from(gallery.querySelectorAll('.video-slide'));
                    const index = videos.indexOf(activeVideo);
                    openLightbox(activeVideo, 0);
                }
            });
            
            // Mantener los eventos individuales para imágenes y videos también
            const images = slider.querySelectorAll('.gallery-slides img');
            images.forEach((img, index) => {
                img.style.cursor = 'pointer';
                img.addEventListener('click', function(e) {
                    e.stopPropagation(); // Evitar que el clic llegue al slider
                    const gallery = this.closest('.gallery-slides');
                    openLightbox(gallery, index);
                });
            });
            
            // Para videos en galerías
            const videoSlides = slider.querySelectorAll('.video-slide');
            videoSlides.forEach((slide) => {
                slide.style.cursor = 'pointer';
                
                // Añadir un botón de expansión sobre el video si no existe
                if (!slide.querySelector('.expand-video-btn')) {
                    const expandBtn = document.createElement('button');
                    expandBtn.className = 'expand-video-btn';
                    expandBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <polyline points="9 21 3 21 3 15"></polyline>
                            <line x1="21" y1="3" x2="14" y2="10"></line>
                            <line x1="3" y1="21" x2="10" y2="14"></line>
                        </svg>
                    `;
                    slide.appendChild(expandBtn);
                    
                    expandBtn.addEventListener('click', function(e) {
                        e.stopPropagation(); // Evitar que el clic llegue al video
                        openLightbox(slide, 0);
                    });
                }
                
                // Añadir evento de clic al slide completo
                slide.addEventListener('click', function(e) {
                    // Evitar que el clic se propague si es en el botón de expansión
                    if (e.target.closest('.expand-video-btn')) {
                        return;
                    }
                    
                    // Evitar que el clic se propague a los controles del video
                    const video = this.querySelector('video');
                    if (video && e.target === video) {
                        return;
                    }
                    
                    openLightbox(this, 0);
                });
            });
        });
    }
    
    // Configurar inicialmente
    setupGalleryLightbox();
    
    // Reconfigurar cuando cambian los slides
    const galleryNextButtons = document.querySelectorAll('.gallery-next');
    const galleryPrevButtons = document.querySelectorAll('.gallery-prev');
    
    [...galleryNextButtons, ...galleryPrevButtons].forEach(button => {
        button.addEventListener('click', () => {
            // Esperar a que se complete la transición del slide
            setTimeout(setupGalleryLightbox, 500);
        });
    });
    
    // Exponer funciones para uso externo
    window.galleryLightbox = {
        open: openLightbox,
        close: closeLightbox,
        prev: prevItem,
        next: nextItem
    };
});