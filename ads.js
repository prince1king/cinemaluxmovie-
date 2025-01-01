// Ad Configuration
const adConfig = {
  ads1: 'https://cinemaluxmovie.blogspot.com/?m=1',
  ads2: 'https://example.com/ad2',
  ads3: 'https://example.com/ad3',
  downloadAd: 'https://devin.ai/'
};

// Initialize ad spaces
function initializeAds() {
  const adSpaces = document.querySelectorAll('.ad-space');
  adSpaces.forEach(space => {
    const iframe = document.createElement('iframe');
    iframe.src = adConfig[space.id]; // Assign ad link based on the ad space's ID
    iframe.width = '100%';
    iframe.height = '100px';
    iframe.frameBorder = '0';
    space.appendChild(iframe);
  });
}

// Handle ad on download button first click
function showDownloadAd() {
  window.open(adConfig.downloadAd, '_blank'); // Open the download ad in a new tab
} 

// Initialize advertisement system
document.addEventListener('DOMContentLoaded', () => {
  initializeAds(); // Initialize ad spaces on page load
});