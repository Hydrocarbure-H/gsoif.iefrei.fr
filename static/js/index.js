document.addEventListener('DOMContentLoaded', initializePage);

/**
 * Initializes the page and sets up necessary event handlers.
 */
function initializePage() {
    if (userHasMadeChoice()) {
        displayUserChoices();
        return;
    }

    const apiUrl = 'http://192.168.1.69:5000';
    loadProductData(apiUrl);
    setupFormSubmission(apiUrl);
}

/**
 * Checks if the user has previously made choices and if the date matches today.
 * @returns {boolean} True if choices exist and date matches, otherwise false.
 */
function userHasMadeChoice() {
    
    return localStorage.getItem('products') !== null && localStorage.getItem('date') === new Date().toLocaleString().split(' ')[0];
}

/**
 * Displays the products chosen by the user from localStorage and provides a reset button.
 */
function displayUserChoices() {
    let container = document.getElementById('container');
    container.innerHTML = `
        <h1>Merci !</h1>
        <p>Vous avez choisi les produits suivants :</p>
        <ul>
    `;

    const products = JSON.parse(localStorage.getItem('products'));
    products.forEach(product => {
        container.innerHTML += `<li>${product}</li>`;
    });
    container.innerHTML += '</ul>';
    //
    // const button = document.createElement('button');
    // button.innerHTML = 'Réinitialiser';
    // button.onclick = resetChoices;
    // container.appendChild(button);
}

/**
 * Resets the choices stored in localStorage and reloads the page.
 */
function resetChoices() {
    localStorage.removeItem('products');
    localStorage.removeItem('date');
    location.reload();
}

/**
 * Fetches product data from the API and sets up the product list.
 * @param {string} apiUrl The base URL of the API.
 */
function loadProductData(apiUrl) {
    fetch(`${apiUrl}/products`)
        .then(response => response.json())
        .then(products => populateProductList(products))
        .catch(error => console.error('Erreur lors de la récupération des products:', error));
}

/**
 * Populates the product list on the page.
 * @param {Array} products An array of products from the API.
 */
function populateProductList(products) {
    const ul_alcool = document.getElementById('alcool-list');
    const ul_soft = document.getElementById('soft-list');
    const ul_crounch = document.getElementById('crounch-list');

    products.forEach(product => {
        const li = createProductListItem(product);
        if (product.category === 'Alcool') {
            ul_alcool.appendChild(li);
        } else if (product.category === 'Soft') {
            ul_soft.appendChild(li);
        } else if (product.category === 'Crounch') {
            ul_crounch.appendChild(li);
        }
    });
}

/**
 * Creates a list item for a product with a checkbox.
 * @param {Object} product The product data.
 * @returns {HTMLElement} The list item element.
 */
function createProductListItem(product) {
    const li = document.createElement('li');
    li.innerHTML = `
        <input type="checkbox" name="product" value="${product.id}" id="product-${product.id}" data-engagement-count="${product.engagement_count}">
        <label for="product-${product.id}">
            ${product.name}
            <span id="count-${product.id}">(${product.engagement_count} <ion-icon class="icon" name="people-outline"></ion-icon>)</span>
        </label>
    `;

    const checkbox = li.querySelector(`input[type=checkbox]`);
    checkbox.addEventListener('change', () => updateEngagementCount(checkbox));
    return li;
}

/**
 * Updates the engagement count displayed next to a product based on user interaction.
 * @param {HTMLElement} checkbox The checkbox element.
 */
function updateEngagementCount(checkbox) {
    const engagementCountElement = document.getElementById(`count-${checkbox.value}`);
    let engagementCount = parseInt(checkbox.dataset.engagementCount);
    engagementCount += checkbox.checked ? 1 : -1;
    checkbox.dataset.engagementCount = engagementCount;
    engagementCountElement.innerHTML = `(${engagementCount} <ion-icon class="icon" name="people-outline"></ion-icon>)`;
}

/**
 * Sets up the form submission handler.
 * @param {string} apiUrl The base URL of the API.
 */
function setupFormSubmission(apiUrl) {
    document.getElementById('form-choix').addEventListener('submit', function (e) {
        e.preventDefault();
        submitEngagement(apiUrl);
    });
}

/**
 * Submits the engagement form data to the API and updates the UI based on the response.
 * @param {string} apiUrl The base URL of the API.
 */
function submitEngagement(apiUrl) {
    const username = document.getElementById('nom').value;
    const chosen_products = Array.from(document.querySelectorAll('input[type=checkbox]:checked')).map(checkbox => parseInt(checkbox.value));
    const data = {name: username, products: chosen_products};

    fetch(`${apiUrl}/engagement`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => handleEngagementResponse(data, username))
        .catch(error => console.error('Erreur:', error));
}

/**
 * Handles the server response for the engagement submission.
 * @param {Array} data The response data from the server.
 * @param {string} username The username of the user who submitted the engagement.
 */
function handleEngagementResponse(data, username) {
    let container = document.getElementById('container');
    container.innerHTML = `
        <h1>Merci !</h1>
        <p>Vous avez choisi les produits suivants :</p>
        <ul>
    `;
    let products = [];
    data.forEach(product => {
        if (product.name_user === username) {
            container.innerHTML += `<li>${product.product_name}</li>`;
            products.push(product.product_name);
        }
    });
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('date', new Date().toLocaleString().split(' ')[0]);
    container.innerHTML += '</ul>';
}
