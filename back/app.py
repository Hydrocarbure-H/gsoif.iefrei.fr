from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os
from datetime import datetime

from sqlalchemy import text
from flask_cors import CORS

load_dotenv()
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://' + DB_USER + ':' + DB_PASSWORD + '@localhost:5432/gsoif'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app)


def execute_sql(sql, args=()):
    with db.engine.connect() as connection:
        result = connection.execute(text(sql), args)
        result = result.fetchall()
        return result


@app.route('/products', methods=['GET'])
def get_products():
    result = execute_sql('SELECT id, name, category FROM product')
    products = [{'id': row[0], 'name': row[1], 'category': row[2]} for row in result]
    return jsonify(products)


@app.route('/engagement', methods=['POST'])
def add_engagement():
    data = request.json
    for product_id in data['products']:
        execute_sql('INSERT INTO engagement (name_user, product_id, date) VALUES (?, ?, ?)',
                    (data['name'], product_id, datetime.utcnow()))
    db.session.commit()  # Assurez-vous que la transaction est bien commitée
    return jsonify({'message': 'Choix enregistré avec succès'}), 201


@app.route('/engagement', methods=['GET'])
def get_engagements():
    result = execute_sql('SELECT name_user, product_id, date FROM engagement')
    engagements = [{'name_user': row[0], 'product_id': row[1], 'date': row[2]} for row in result]
    return jsonify(engagements)


# CREATE TABLE IF NOT EXISTS gsoif.product (id INTEGER PRIMARY KEY, name TEXT, category TEXT)
# CREATE TABLE IF NOT EXISTS engagement (id INTEGER PRIMARY KEY, name_user TEXT, product_id INTEGER, date TEXT)


if __name__ == '__main__':
    app.run(debug=True)
