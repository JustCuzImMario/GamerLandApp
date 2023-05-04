const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const searchResults = document.querySelector("#search-results");
const apiKey = RAWG_API_KEY;


// RAWG API
// Search for games
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const gameName = searchInput.value;
  const apiUrl = `https://api.rawg.io/api/games?search=${gameName}&key=${apiKey}`;

  fetch(apiUrl)
    // Check for errors
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    // Display games
    .then((data) => {
      if (data.results.length > 0) {
        searchResults.innerHTML = "";
        const gameCardContainer = document.createElement("div");
        gameCardContainer.classList.add("game-card-container");

        // Loop through the games
        data.results.forEach((game) => {
            const gameCard = document.createElement("div");
            gameCard.classList.add("game-card");
      
            const gameTitle = document.createElement("h2");
            gameTitle.innerText = game.name;
      
            const gameCover = document.createElement("img");
                if (game.background_image) {
                gameCover.src = game.background_image;
                } else {
                gameCover.appendChild(document.createTextNode("No Image"));
                }


            // Append game title and cover to game card
            gameCard.appendChild(gameTitle);
            gameCard.appendChild(gameCover);
            gameCardContainer.appendChild(gameCard);

            // Add event listener to each game card
            gameCard.addEventListener('click', async () => {
                const description = await getGameDetails(game.id);

                // Create popup
                const popup = document.createElement('div');
                popup.classList.add('popup');

                // Add popup content
                const popupContent = document.createElement('div');
                popupContent.classList.add('popup-content');

                // Add fixed header container
                const popupHeader = document.createElement('div');
                popupHeader.classList.add('popup-header');

                // Add game title
                const popupTitle = document.createElement('h2');
                popupTitle.textContent = game.name;
                popupContent.appendChild(popupTitle);

                // Add 'close' button
                const closeButton = document.createElement('button');
                closeButton.textContent = 'Close';
                closeButton.addEventListener('click', () => {
                  popup.remove();
                });
                popupHeader.appendChild(closeButton);

                // Append fixed header and scrollable content to popup
                popupContent.appendChild(popupHeader);

                const popupScrollableContent = document.createElement('div');
                popupScrollableContent.classList.add('popup-scrollable-content');

                // Add game description to scrollable content
                const popupDescription = document.createElement('p');
                popupDescription.textContent = description;
                popupScrollableContent.appendChild(popupDescription);

                popupContent.appendChild(popupScrollableContent);

                popup.appendChild(popupContent);
                document.body.appendChild(popup);

                // Append popup content and close button to popup
                popupContent.appendChild(closeButton);
                popup.appendChild(popupContent);
                document.body.appendChild(popup);

              });
            });
        // Append game cards to search results
        searchResults.appendChild(gameCardContainer);
        

      } else {
        searchResults.innerHTML = "No games found!";
      }
    })
    // Handle errors
    .catch((error) => {
      console.error(error);
      searchResults.innerHTML = "Error fetching games!";
    });
});


// Get game details
async function getGameDetails(gameId, descriptionLength) {
    const API_URL = `https://api.rawg.io/api/games/${gameId}?key=${apiKey}`;
  
    try {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data.description_raw.substring(0, descriptionLength);
  } catch (error) {
    return console.log(error);
  }
  
};

// Get game stores
async function getGameStores(gameId) {
  const API_URL = `https://api.rawg.io/api/games/${gameId}/stores?key=${apiKey}`;
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.log(error);
    return [];
  }
};