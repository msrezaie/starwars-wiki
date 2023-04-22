// getting all the needed DOM elements and assigning them to variables
const charIndexList = document.getElementById('char-list');
const filmIndexList = document.getElementById('film-list');

const charLinkTemplate = document.getElementById('character-link');
const filmLinkTemplate = document.getElementById('film-link');

const charFilmSection = document.querySelector('.index-lists');
const characterSection = document.querySelector('.about-character');
const filmSection = document.querySelector('.about-film');

const featuredFilmsList = document.getElementById('featured-films-list');
const featuredCharactersList = document.getElementById('featured-characters-list');

const charName = document.getElementById('char-name');
const filmName = document.getElementById('film-name');
const filmCrawl = document.getElementById('film-crawl');

const charValues = document.getElementById("char-values");

const filmValues = document.getElementById("film-values");

const backButton = document.querySelector('.go-back-btn');

const indexLoadingDiv = document.getElementById('index-loading-div');
const charLoadingDiv = document.getElementById('char-loading-div');
const filmLoadingDiv = document.getElementById('film-loading-div');

// A function that sends an HTTP GET request to a given URL and returns a promise that resolves to the JSON response.
function sendHttpRequest(url) {
    // Use the Fetch API to send an HTTP GET request to the given URL and return a promise that resolves to the response.
    return fetch(url).then(response => {
        // Parse the response as JSON and return a promise that resolves to the parsed JSON.
        return response.json();
    });
};

/*
 * This function resets the data displayed in the character and film sections by resetting the innerHTML 
 * of their respective elements
 */
function resetSectionData() {
    // Reset charValues
    charValues.innerHTML = `
      <li id="birth_year"><h2></h2></li>
      <li id="mass"><h2></h2></li>
      <li id="hair_color"><h2></h2></li>
      <li id="skin_color"><h2></h2></li>
      <li id="eye_color"><h2></h2></li>
      <li id="gender"><h2></h2></li>
    `;
  
    // Reset featuredFilmsList
    featuredFilmsList.innerHTML = `
      <li><h1 class="banner about-banner">Featured Films</h1></li>
    `;
  
    // Reset filmValues
    filmValues.innerHTML = `
        <li id="director"><h2></h2></li>
        <li id="producer"><h2></h2></li>
        <li id="release_date"><h2></h2></li>
    `;
  
    // Reset featuredCharactersList
    featuredCharactersList.innerHTML = `
      <li><h1 class="banner about-banner">Featured Characters</h1></li>
    `;
};

// Show back button if charFilmSection is visible, otherwise hide it
function displayBackBtn() {
    if (charFilmSection.classList.contains('visible')) {
        backButton.style.display = 'block';
    } else {
        backButton.style.display = 'none';
    }
};

/*
 * This function fetches data for the character and film indexes from the Star Wars API and
 * generates HTML elements to display the data. It then appends these elements to the DOM.
 */
async function fetchIndexData() {
    try {
        // Send parallel requests for character and film data
        const [charactersData, filmsData] = await Promise.all([
            sendHttpRequest('https://swapi.dev/api/people/'),
            sendHttpRequest('https://swapi.dev/api/films/')
        ]);

        // Extract the character and film arrays from the response data
        const characters = charactersData.results;
        const films = filmsData.results;

        // Generate HTML elements for each character and film link
        const charLinkElements = characters.map(character => {
            const charLinkElement = document.importNode(charLinkTemplate.content, true);
            charLinkElement.querySelector('h2').textContent = character.name.toUpperCase();
            charLinkElement.querySelector('li').id = character.url;
            return charLinkElement;
        });

        const filmLinkElements = films.map(film => {
            const filmLinkElement = document.importNode(filmLinkTemplate.content, true);
            filmLinkElement.querySelector('h2').textContent = film.title.toUpperCase();
            filmLinkElement.querySelector('li').id = film.url;
            return filmLinkElement;
        });

        // Append the generated HTML elements to the corresponding lists in the DOM
        charIndexList.append(...charLinkElements);
        filmIndexList.append(...filmLinkElements);

        // Hide the loading spinner
        indexLoadingDiv.classList.toggle('visible');
    } catch (error) {
        // Display an error message and log the error to the console
        indexLoadingDiv.querySelector('p').textContent = "Something Went Wrong!";
        console.log(error.message);
    }
};


// Fetches character data from the API and updates the DOM
async function fetchCharacterData(url) {
    try {
        // Fetch character data from API
        const charData = await sendHttpRequest(url);
        
        // Get list items containing character data from the DOM
        const charValueListItems = charValues.querySelectorAll('li');

        // Get list of featured films from character data
        const featuredFilms = charData.films;

        // Update character name in the DOM
        charName.textContent = charData.name.toUpperCase();

        // Loop through each list item and update the corresponding character data in the DOM
        charValueListItems.forEach(item => {
            const property = item.id;
            const value = charData[property];
            const h2 = item.querySelector("h2");
            h2.textContent = value === 'n/a' ? 'Not Applicable' : value;
        });

        // Fetch featured films data and add to the DOM
        Promise.all(featuredFilms.map(url => sendHttpRequest(url)))
        .then(responses => {
            for (const property of responses) {
                const filmLinkElement = document.importNode(filmLinkTemplate.content, true);
                filmLinkElement.querySelector('h2').textContent = property.title.toUpperCase();
                filmLinkElement.querySelector('li').id = property.url;
                featuredFilmsList.append(filmLinkElement);
            }
        })

        // Display back button and hide loading indicator
        displayBackBtn();
        charLoadingDiv.classList.toggle('visible');
    } catch (error) {
        // Handle error if fetch request fails
        charLoadingDiv.querySelector('p').textContent = "Something Went Wrong!";
        console.log(error.message);
    }
};

// Fetches film data from the provided URL and updates the DOM with the retrieved data
async function fetchFilmData(url) {
    try {
        // Send an HTTP request to the provided URL and await the response
        const filmData = await sendHttpRequest(url);
        
        // Get references to the film value list items in the DOM
        const filmValueListItems = filmValues.querySelectorAll('li');

        // Retrieve the URLs of the characters that are featured in this film
        const featuredCharacters = filmData.characters;

        // Update the film name and crawl text in the DOM
        filmName.textContent = filmData.title.toUpperCase();
        filmCrawl.textContent = filmData.opening_crawl;

        // Update the film value list items in the DOM with data from the API response
        filmValueListItems.forEach(item => {
            const property = item.id;
            const value = filmData[property];
            const h2 = item.querySelector("h2");
            h2.textContent = value;
        });

        // Send HTTP requests for the characters that are featured in this film
        Promise.all(featuredCharacters.map(url => sendHttpRequest(url)))
        .then(responses => {
            // For each character that is returned, create a new link element and append it to the featured characters list in the DOM
            for (const property of responses) {
                const charLinkElement = document.importNode(charLinkTemplate.content, true);
                charLinkElement.querySelector('h2').textContent = property.name.toUpperCase();
                charLinkElement.querySelector('li').id = property.url;
                featuredCharactersList.append(charLinkElement);
            }
        })

        // Show the back button and hide the loading spinner
        displayBackBtn();
        filmLoadingDiv.classList.toggle('visible');
    } catch (error) {
        // If there's an error, display an error message in the loading spinner and log the error to the console
        filmLoadingDiv.querySelector('p').textContent = "Something Went Wrong!";
        console.log(error.message);
    }
};

// Add an event listener to the character index list
charIndexList.addEventListener('click', event => {
    // Check if the target element clicked is an H2 tag
    if (event.target.tagName === 'H2'){
        // Get the URL of the character from the closest list item
        const charUrl = event.target.closest('li').id;
        // Reset section data to its initial state
        resetSectionData();
        // Fetch character data and populate the page
        fetchCharacterData(charUrl);
        // Show the character section and hide the index section
        characterSection.classList.toggle('visible');
        charFilmSection.classList.toggle('visible');
    }
});

// Add event listener to the list of featured films
featuredFilmsList.addEventListener('click', event => {
    // Check if the clicked element is an h2 element
    if (event.target.tagName === 'H2'){
        // Get the URL of the clicked film
        const filmUrl = event.target.closest('li').id;
        // Reset the data in the character or film section
        resetSectionData();
        // Fetch the data for the clicked film
        fetchFilmData(filmUrl);
        // Show the film section and hide the character section
        filmSection.classList.toggle('visible');
        characterSection.classList.toggle('visible');
        // Show the loading spinner for the character section
        charLoadingDiv.classList.toggle('visible');
    }
});

// Add a click event listener to the filmIndexList element
filmIndexList.addEventListener('click', event => {
    // Check if the clicked element has the tag name "H2"
    if (event.target.tagName === 'H2'){
        // Get the film URL from the closest ancestor element with an "id" attribute
        const filmUrl = event.target.closest('li').id;
        // Reset the section data and fetch the film data from the URL
        resetSectionData();
        fetchFilmData(filmUrl);
        // Toggle the visibility of the filmSection and charFilmSection elements
        filmSection.classList.toggle('visible');
        charFilmSection.classList.toggle('visible');
    }
});


// Add a click event listener to the featuredCharactersList
featuredCharactersList.addEventListener('click', event => {
    // Check if the clicked element is an h2 element
    if (event.target.tagName === 'H2'){
        // Get the id of the closest li element to the clicked h2 element
        const charUrl = event.target.closest('li').id;
        // Reset the data in the sections
        resetSectionData();
        // Fetch the character data using the obtained URL
        fetchCharacterData(charUrl);
        // Show the character section and hide the film section
        characterSection.classList.toggle('visible');
        filmSection.classList.toggle('visible');
        // Show the loading div for the film section
        filmLoadingDiv.classList.toggle('visible');
    }
});


// Add a click event listener to the back button
backButton.addEventListener('click', () => {
    // If the character section is currently visible
    if (characterSection.classList.contains('visible')) {
        // Toggle the visibility of the character section, the charFilm section, and the character loading div
        characterSection.classList.toggle('visible');
        charFilmSection.classList.toggle('visible');
        charLoadingDiv.classList.toggle('visible');
    } 
    // If the film section is currently visible
    else if (filmSection.classList.contains('visible')) {
        // Toggle the visibility of the film section, the charFilm section, and the film loading div
        filmSection.classList.toggle('visible');
        charFilmSection.classList.toggle('visible');
        filmLoadingDiv.classList.toggle('visible');
    } 
    // If neither section is currently visible, return and do nothing
    else {
        return;
    }
    // Call the displayBackBtn function to update the back button visibility
    displayBackBtn();
});

// Calling this function so that characters lists and films lists are fetched
fetchIndexData();
// Calling this function so that the back button won't show up on the index page, since there is no need to go back from there
displayBackBtn();