from flask import Flask, request, jsonify
from flask.cli import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

load_dotenv()

DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://' + DB_USER + ':' + DB_PASSWORD + '@127.0.0.1:5432/gsoif'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


# Modèle pour les products
class Produit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    category = db.Column(db.String(80), nullable=False)


# Modèle pour les participations des utilisateurs
class Engagement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name_user = db.Column(db.String(80), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)


@app.route('/products', methods=['GET'])
def get_products():
    products = Produit.query.all()
    return jsonify([{'id': prod.id, 'name': prod.name, 'category': prod.category} for prod in products])


@app.route('/engagement', methods=['POST'])
def add_participation():
    data = request.json
    for product_id in data['products']:
        participation = Engagement(name_user=data['name'], product_id=product_id)
        db.session.add(participation)
    db.session.commit()
    return jsonify({'message': 'Choix enregistré avec succès'}), 201


# Route pour récupérer la liste des participations
@app.route('/engagement', methods=['GET'])
def get_participations():
    participations = Engagement.query.all()
    return jsonify(
        [{'name_user': part.name_user, 'product_id': part.product_id, 'date': part.date} for part in participations])


if __name__ == '__main__':
    db.create_all()
    app.run(host='0.0.0.0', port=5000)
