// Firebase Initialization
const firebaseConfig = {
  // Add Firebase config here
  // apiKey: "YOUR_API_KEY",
  // authDomain: "YOUR_AUTH_DOMAIN",
  // projectId: "YOUR_PROJECT_ID",
  // storageBucket: "YOUR_STORAGE_BUCKET",
  // messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  // appId: "YOUR_APP_ID"
};

// Initialize Firebase (Check if already initialized to prevent errors if script is reloaded)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let currentPage = 1;
const moviesPerPage = 12;
let allMovies = []; // To store all fetched movies for client-side filtering and search
let currentMovies = []; // Movies currently displayed
let isLoading = false; // Flag to prevent multiple simultaneous loads

// DOM Elements
const movieGrid = document.querySelector('.movie-grid');
const movieCountSpan = document.querySelector('.movie-count span');
const loadMoreButton = document.querySelector('.load-more');
const filtersContainer = document.querySelector('.filters');
const searchBar = document.querySelector('.search-bar');

// Function to create a single movie card
function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.innerHTML = `
    <img src="${movie.poster || 'assets/images/placeholder-poster.jpg'}" alt="${movie.title || 'Movie'} poster" onerror="this.onerror=null;this.src='assets/images/placeholder-poster.jpg';">
    <div class="movie-details">
        <div class="title">${movie.title || 'Untitled Movie'}</div>
        <div class="genre">${movie.genre || 'N/A'}</div>
        <div class="rating">${movie.rating ? '★'.repeat(Math.floor(movie.rating)) + '☆'.repeat(5 - Math.floor(movie.rating)) : 'N/A'}</div>
        <div class="status ${movie.status === 'upcoming' ? 'upcoming' : 'released'}">${movie.status || 'N/A'}</div>
    </div>
  `;
  card.addEventListener('click', () => {
    if (movie.id) {
      // Ensure detail.html is in the same directory or adjust path
      window.location.href = \`detail.html?id=\${movie.id}\`;
    }
  });
  return card;
}

// Function to display movies (either all or filtered)
function displayMovies(moviesToDisplay) {
  movieGrid.innerHTML = ''; // Clear current movies or skeleton cards
  if (moviesToDisplay.length === 0 && !isLoading) {
    movieGrid.innerHTML = '<p>No movies found matching your criteria.</p>';
  } else {
    moviesToDisplay.forEach(movie => {
      movieGrid.appendChild(createMovieCard(movie));
    });
  }
  movieGrid.setAttribute('aria-busy', 'false');
  isLoading = false;
  // Update total movie count based on all fetched movies, not just currently displayed
  if (movieCountSpan) movieCountSpan.textContent = allMovies.length;

  // Hide load more button if all currently displayable movies are shown
  if (loadMoreButton) {
      if (currentMovies.length >= allMovies.length || moviesToDisplay.length < moviesPerPage && currentPage > 1) {
          loadMoreButton.style.display = 'none';
      } else {
          loadMoreButton.style.display = 'block';
      }
  }
}

// Function to show skeleton loaders
function showSkeletonLoaders() {
    movieGrid.innerHTML = ''; // Clear any existing content
    movieGrid.setAttribute('aria-busy', 'true');
    for (let i = 0; i < moviesPerPage; i++) {
        const skeletonCard = document.createElement('div');
        skeletonCard.className = 'movie-card skeleton';
        // Add inner structure for skeleton to mimic actual card structure for better shimmer
        skeletonCard.innerHTML = \`
            <div class="movie-poster-skeleton"></div>
            <div class="movie-details">
                <div class="text-line-skeleton"></div>
                <div class="text-line-skeleton"></div>
                <div class="text-line-skeleton"></div>
            </div>
        \`;
        movieGrid.appendChild(skeletonCard);
    }
    isLoading = true;
}


async function fetchMovies() {
  if (isLoading) return;
  isLoading = true;
  if(currentPage === 1) { // Only show skeleton loaders on initial load or filter change
      showSkeletonLoaders();
  }

  try {
    // Simulating fetch for now as Firebase config is not set
    // Replace with actual Firebase call:
    // const snapshot = await db.collection('movies')
    //   .orderBy('createdAt', 'desc') // Assuming you have a createdAt field
    //   .limit(moviesPerPage * currentPage) // This fetches all up to current page limit
    //   .get();
    // allMovies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // --- Simulated Data for Testing ---
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    const fetchedMovies = [];
    const startMovie = (currentPage - 1) * moviesPerPage;
    for (let i = 0; i < moviesPerPage; i++) {
        const movieIndex = startMovie + i;
        fetchedMovies.push({
            id: \`simulated\${movieIndex}\`,
            title: \`Simulated Movie \${movieIndex + 1}\`,
            genre: 'Action/Adventure',
            poster: \`https://picsum.photos/200/300?random=\${movieIndex}\`, // Placeholder images
            rating: Math.floor(Math.random() * 5) + 1,
            status: Math.random() > 0.3 ? 'released' : 'upcoming',
            searchKeywords: ['simulated', \`movie\${movieIndex + 1}\`]
        });
    }
    // If it's the first page, replace allMovies. Otherwise, append.
    if (currentPage === 1) {
        allMovies = fetchedMovies;
    } else {
        allMovies = allMovies.concat(fetchedMovies);
    }
    // --- End Simulated Data ---

    currentMovies = allMovies.slice(0, currentPage * moviesPerPage);
    displayMovies(currentMovies);

  } catch (error) {
    console.error('Error loading movies:', error);
    movieGrid.innerHTML = '<p>Error loading movies. Please try again later.</p>';
    movieGrid.setAttribute('aria-busy', 'false');
    isLoading = false;
  }
}

async function loadCategories() {
  if (!filtersContainer) return;
  try {
    // Simulated categories
    const categories = [{id: 'cat1', name: 'Action'}, {id: 'cat2', name: 'Comedy'}, {id: 'cat3', name: 'Drama'}];
    // Replace with actual Firebase call:
    // const snapshot = await db.collection('categories').get();
    // const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    filtersContainer.innerHTML = ''; // Clear existing
    categories.forEach(category => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.textContent = category.name;
      btn.dataset.category = category.name; // Store category name for filtering
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterMoviesByCategory(category.name);
      });
      filtersContainer.appendChild(btn);
    });
  } catch (error) {
    console.error('Error loading categories:', error);
    filtersContainer.innerHTML = '<p>Could not load categories.</p>';
  }
}

function filterMoviesByCategory(categoryName) {
    currentPage = 1; // Reset to first page for new filter
    showSkeletonLoaders(); // Show skeletons while filtering
    // In a real scenario, you might re-fetch from Firestore with a 'where' clause.
    // For client-side filtering with already fetched 'allMovies':
    currentMovies = allMovies.filter(movie => movie.genre && movie.genre.toLowerCase().includes(categoryName.toLowerCase()));
    // Simulate delay for filtering
    setTimeout(() => {
        displayMovies(currentMovies.slice(0, moviesPerPage * currentPage));
        if (loadMoreButton) loadMoreButton.style.display = currentMovies.length > moviesPerPage ? 'block' : 'none';
    }, 500);
}

function handleSearch(query) {
    currentPage = 1;
    showSkeletonLoaders();
    const lowerQuery = query.toLowerCase();
    // Client-side search for simplicity with simulated data
    currentMovies = allMovies.filter(movie =>
        (movie.title && movie.title.toLowerCase().includes(lowerQuery)) ||
        (movie.genre && movie.genre.toLowerCase().includes(lowerQuery)) ||
        (movie.searchKeywords && movie.searchKeywords.some(keyword => keyword.toLowerCase().includes(lowerQuery)))
    );
    setTimeout(() => { // Simulate search delay
        displayMovies(currentMovies.slice(0, moviesPerPage * currentPage));
        if (loadMoreButton) loadMoreButton.style.display = currentMovies.length > moviesPerPage ? 'block' : 'none';
    }, 500);
}


async function loadAds() {
  // This function would fetch ad configurations from Firestore
  // For now, it's a placeholder.
  // console.log("Loading ad configurations...");
  // const adSnapshot = await db.collection('advertisements').doc('adSettings').get();
  // const ads = adSnapshot.data();
  // if (ads.indexHtml.header.enabled) {
  //   document.querySelector('.header-ad').innerHTML = ads.indexHtml.header.content;
  // }
  // ... and so on for other ad placements
}

// Event Listeners
if (loadMoreButton) {
  loadMoreButton.addEventListener('click', () => {
    currentPage++;
    fetchMovies(); // Or a function that appends next page of currentMovies
  });
}

if (searchBar) {
  searchBar.addEventListener('input', (e) => {
    const query = e.target.value;
    if (query.length > 2 || query.length === 0) { // Search on more than 2 chars or if field is cleared
      handleSearch(query);
    }
  });
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
  // Check if Firebase is configured before trying to use it.
  // A more robust check would be to see if firebaseConfig has actual values.
  if (firebaseConfig && firebaseConfig.projectId) {
      console.log("Firebase configured, proceeding with Firestore operations.");
  } else {
      console.warn("Firebase is not configured. Using simulated data and features will be limited.");
      // Potentially disable features or show a message to the user/admin.
  }
  fetchMovies(); // Load initial set of movies
  loadCategories();
  loadAds();
});
