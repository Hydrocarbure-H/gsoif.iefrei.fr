document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'http://127.0.0.1:5000';

    fetch(`${apiUrl}/products`)
        .then(response => response.json())
        .then(products =>
        {
            const ul_alcool = document.getElementById('alcool-list');
            const ul_soft = document.getElementById('soft-list');
            products.forEach(product => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <input type="checkbox" name="product" value="${product.id}" id="product-${product.id}">
                    <label for="product-${product.id}">${product.name}</label>
                `;
                if (product.category === 'Alcool')
                {
                    ul_alcool.appendChild(li);
                }
                else if (product.category === 'Soft')
                {
                    ul_soft.appendChild(li);
                }
            });
        })
        .catch(error => console.error('Erreur lors de la récupération des products:', error));

    document.getElementById('form-choix').addEventListener('submit', function(e) {
        e.preventDefault();

        const nomUser = document.getElementById('nom').value;
        const produitsChoisis = Array.from(document.querySelectorAll('input[type=checkbox]:checked')).map(checkbox => parseInt(checkbox.value));

        const data = {
            nom: nomUser,
            produits: produitsChoisis
        };

        fetch(`${apiUrl}/engagement`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Succès:', data);
            })
            .catch((error) => {
                console.error('Erreur:', error);
            });
    });
});
