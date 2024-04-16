document.addEventListener('DOMContentLoaded', function() {

    // Check if the user has already made a choice
    if (localStorage.getItem('products') !== null && localStorage.getItem('date') === new Date().toLocaleString().split(' ')[0])
    {
        container = document.getElementById('container')
        container.innerHTML = `
            <h1>Merci !</h1>
            <p>Vous avez choisi les produits suivants :</p>
            <ul>
        `;
        products = JSON.parse(localStorage.getItem('products'));
        products.forEach(product => {
            container.innerHTML += `<li>${product}</li>`;
        });
        container.innerHTML += '</ul>';

        const button = document.createElement('button');
        button.innerHTML = 'Réinitialiser';
        button.onclick = function() {
            localStorage.removeItem('products');
            localStorage.removeItem('date');
            location.reload();
        };
        container.appendChild(button);
        return;
    }

    const apiUrl = 'http://127.0.0.1:5000';

    fetch(`${apiUrl}/products`)
        .then(response => response.json())
        .then(products =>
        {
            const ul_alcool = document.getElementById('alcool-list');
            const ul_soft = document.getElementById('soft-list');
            const ul_crounch = document.getElementById('crounch-list');
            products.forEach(product => {
                const li = document.createElement('li');
                li.innerHTML = `
        <input type="checkbox" name="product" value="${product.id}" id="product-${product.id}" data-engagement-count="${product.engagement_count}">
        <label for="product-${product.id}">
            ${product.name}
            <span id="count-${product.id}">(${product.engagement_count} <ion-icon class="icon" name="people-outline"></ion-icon>)</span>
        </label>
    `;
                if (product.category === 'Alcool') {
                    ul_alcool.appendChild(li);
                } else if (product.category === 'Soft') {
                    ul_soft.appendChild(li);
                } else if (product.category === 'Crounch') {
                    ul_crounch.appendChild(li);
                }

                // Ajouter un gestionnaire d'événements pour chaque checkbox
                const checkbox = li.querySelector(`input[type=checkbox]`);
                checkbox.addEventListener('change', function() {
                    const engagementCountElement = document.getElementById(`count-${this.value}`);
                    let engagementCount = parseInt(this.dataset.engagementCount);

                    if (this.checked) {
                        engagementCount++; // Incrémenter le compteur si la case est cochée
                    } else {
                        engagementCount--; // Décrémenter le compteur si la case est décochée
                    }

                    // Mettre à jour l'attribut pour refléter le changement
                    this.dataset.engagementCount = engagementCount;

                    // Mettre à jour le texte
                    engagementCountElement.innerHTML = `(${engagementCount} <ion-icon class="icon" name="people-outline"></ion-icon>)`;
                });
            });
        })
        .catch(error => console.error('Erreur lors de la récupération des products:', error));

    document.getElementById('form-choix').addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('nom').value;
        const chosen_products = Array.from(document.querySelectorAll('input[type=checkbox]:checked')).map(checkbox => parseInt(checkbox.value));

        const data = {
            name: username,
            products: chosen_products
        };

        fetch(`${apiUrl}/engagement`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data =>
            {
                container = document.getElementById('container')
                container.innerHTML = `
                    <h1>Merci !</h1>
                    <p>Vous avez choisi les produits suivants :</p>
                    <ul>
                `;
                products = [];
                data.forEach(product => {
                    if (product.name_user === username)
                    {
                        container.innerHTML += `<li>${product.product_name}</li>`;
                        products.push(product.product_name);
                    }
                });
                localStorage.setItem('products', JSON.stringify(products));
                localStorage.setItem('date', new Date().toLocaleString().split(' ')[0]);

                container.innerHTML += '</ul>';
                // const button = document.createElement('button');
                // button.innerHTML = 'Réinitialiser';
                // button.onclick = function() {
                //     localStorage.removeItem('products');
                //     localStorage.removeItem('date');
                //     location.reload();
                // };
                // container.appendChild(button);
            })
            .catch((error) => {
                console.error('Erreur:', error);
            });
    });
});
