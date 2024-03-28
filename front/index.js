document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'http://127.0.0.1:5000';

    fetch(`${apiUrl}/products`)
        .then(response => response.json())
        .then(produits => {
            console.log(produits);
        })
        .catch(error => console.error('Erreur lors de la récupération des produits:', error));

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
