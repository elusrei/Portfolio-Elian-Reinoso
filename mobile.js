/**
 * Mobile detection and warning script
 * This script detects if a user is on a mobile device and shows a warning
 * that the site is optimized for desktop viewing.
 */

(function() {
    // Function to detect mobile devices
    function isMobileDevice() {
      // Check if the user agent contains mobile keywords
      const mobileKeywords = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      
      // Check screen width (typically mobile devices are under 768px)
      const isMobileWidth = window.innerWidth < 768;
      
      // Return true if either condition is met
      return mobileKeywords.test(navigator.userAgent) || isMobileWidth;
    }
  
    // Function to create and show the warning modal
    function showMobileWarning() {
      // Create modal container
      const modalContainer = document.createElement('div');
      modalContainer.className = 'mobile-warning-overlay';
      
      // Create modal content
      const modalContent = document.createElement('div');
      modalContent.className = 'mobile-warning-content';
      
      // Add warning title
      const warningTitle = document.createElement('h2');
      warningTitle.textContent = 'Portfolio para Desktop';
      
      // Add warning message
      const warningMessage = document.createElement('p');
      warningMessage.innerHTML = 'Esta página está diseñada para ser visualizada en dispositivos de escritorio (PC, notebook, netbook) y se recomienda con conexión a internet (NO datos móviles) debido al peso y cantidad de contenido multimedia.<br><br>La experiencia en dispositivos móviles puede no ser óptima.';
      
      // Create buttons container
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'mobile-warning-buttons';
      
      // Add continue button
      const continueButton = document.createElement('button');
      continueButton.className = 'mobile-warning-continue';
      continueButton.textContent = 'Continuar de todos modos';
      continueButton.addEventListener('click', function() {
        // Remove the modal and allow the page to load normally
        document.body.removeChild(modalContainer);
        // Store in session storage that user has accepted
        sessionStorage.setItem('mobileWarningDismissed', 'true');
        // Allow images and videos to load
        enableMediaLoading();
      });
      
      // Add go back button
      const goBackButton = document.createElement('button');
      goBackButton.className = 'mobile-warning-back';
      goBackButton.textContent = 'Volver';
      goBackButton.addEventListener('click', function() {
        // Go back to previous page
        window.history.back();
      });
      
      // Assemble the modal
      buttonsContainer.appendChild(continueButton);
      buttonsContainer.appendChild(goBackButton);
      
      modalContent.appendChild(warningTitle);
      modalContent.appendChild(warningMessage);
      modalContent.appendChild(buttonsContainer);
      
      modalContainer.appendChild(modalContent);
      
      // Add the modal to the body
      document.body.appendChild(modalContainer);
      
      // Add styles to match the portfolio
      const style = document.createElement('style');
      style.textContent = `
        .mobile-warning-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(42, 26, 15, 0.67);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .mobile-warning-content {
          background-color: #8c7a6b;
          color: #f8f3e9;
          padding: 2rem;
          border-radius: 4px;
          max-width: 90%;
          width: 350px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          border: 1px solid #d9b99b;
        }
        
        .mobile-warning-content h2 {
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #d9b99b;
          font-weight: 600;
        }
        
        .mobile-warning-content p {
          margin-bottom: 1.5rem;
          line-height: 1.5;
          font-size: 0.95rem;
        }
        
        .mobile-warning-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .mobile-warning-continue, .mobile-warning-back {
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }
        
        .mobile-warning-continue {
          background-color: #d9b99b;
          color: #2a1a0f;
        }
        
        .mobile-warning-continue:hover {
          background-color: #e6c9ae;
        }
        
        .mobile-warning-back {
          background-color: #5e4536;
          color: #f8f3e9;
        }
        
        .mobile-warning-back:hover {
          background-color: #4a3628;
        }
      `;
      
      document.head.appendChild(style);
    }
  
    // Function to prevent images and videos from loading initially
    function preventMediaLoading() {
      // Store original src attributes and replace them
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (img.src) {
          img.setAttribute('data-src', img.src);
          img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; // Transparent placeholder
        }
      });
      
      // Do the same for videos
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        if (video.src) {
          video.setAttribute('data-src', video.src);
          video.src = '';
        }
        
        // Also handle source elements inside video
        const sources = video.querySelectorAll('source');
        sources.forEach(source => {
          if (source.src) {
            source.setAttribute('data-src', source.src);
            source.src = '';
          }
        });
      });
    }
  
    // Function to enable media loading after user confirms
    function enableMediaLoading() {
      // Restore original src attributes for images
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(img => {
        img.src = img.getAttribute('data-src');
      });
      
      // Restore original src attributes for videos
      const videos = document.querySelectorAll('video[data-src]');
      videos.forEach(video => {
        video.src = video.getAttribute('data-src');
        
        // Also handle source elements inside video
        const sources = video.querySelectorAll('source[data-src]');
        sources.forEach(source => {
          source.src = source.getAttribute('data-src');
        });
        
        // Reload the video to apply changes
        video.load();
      });
    }
  
    // Main execution
    document.addEventListener('DOMContentLoaded', function() {
      // Check if user is on mobile
      if (isMobileDevice()) {
        // Check if the warning has been dismissed in this session
        if (sessionStorage.getItem('mobileWarningDismissed') !== 'true') {
          // Prevent media from loading
          preventMediaLoading();
          
          // Show the warning
          showMobileWarning();
        } else {
          // User has already dismissed the warning in this session
          enableMediaLoading();
        }
      }
    });
  })();

  
  