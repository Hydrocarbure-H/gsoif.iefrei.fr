import os
from datetime import datetime

from dotenv import load_dotenv
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

load_dotenv()
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://' + DB_USER + ':' + DB_PASSWORD + '@localhost:5432/gsoif'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app, resources={r"/*": {"origins": "*"}})


class SQLAlchemyError:
    pass


def execute_sql(sql, args=None):
    try:
        with db.engine.connect() as connection:
            if args is None:
                result = connection.execute(text(sql))
            else:
                result = connection.execute(text(sql), args)

            connection.commit()

            try:
                result = result.fetchall()
            except Exception as e:
                app.logger.info(f"No results to fetch: {str(e)}")
                result = None

            return result

    except Exception as e:
        app.logger.error(f"An error occurred: {str(e)}")
        raise e


@app.route('/products', methods=['GET'])
def get_products():
    sql = """
    SELECT p.id, p.name, p.category, COUNT(e.id) as engagement_count
    FROM product p
    LEFT JOIN engagement e ON p.id = e.product_id
    GROUP BY p.id
    ORDER BY COUNT(e.id) ASC, p.id
    """
    result = execute_sql(sql)
    products = [{'id': row[0], 'name': row[1], 'category': row[2], 'engagement_count': row[3]} for row in result]
    return jsonify(products)


@app.route('/engagement', methods=['POST'])
def add_engagement():
    data = request.json
    date = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    engagements = [
        {'name_user': data['name'], 'product_id': product_id, 'date': date}
        for product_id in data['products']
    ]

    for engagement in engagements:
        execute_sql("""
            INSERT INTO engagement (name_user, product_id, date)
            VALUES (:name_user, :product_id, :date)
            """, engagement)
    db.session.commit()
    return get_engagements()


@app.route('/engagement', methods=['GET'])
def get_engagements():
    result = execute_sql(
        'SELECT name_user, product_id, product.name, date '
        'FROM engagement JOIN product ON product.id = engagement.product_id')
    engagements = [{'name_user': row[0], 'product_id': row[1], 'product_name': row[2], 'date': row[3]} for row in
                   result]
    return jsonify(engagements)


@app.route("/")
def home():
    return render_template("index.html")


# CREATE TABLE IF NOT EXISTS gsoif.product (id INTEGER PRIMARY KEY, name TEXT, category TEXT)
# CREATE TABLE IF NOT EXISTS engagement (
#     id SERIAL PRIMARY KEY,
# name_user TEXT,
# product_id INTEGER,
# date TEXT,
# FOREIGN KEY (product_id) REFERENCES product(id)
# );

def create_tables():
    sql = """
    CREATE TABLE IF NOT EXISTS product (
        id SERIAL PRIMARY KEY,
        name TEXT,
        category TEXT
    );
    CREATE TABLE IF NOT EXISTS engagement (
        id SERIAL PRIMARY KEY,
        name_user TEXT,
        product_id INTEGER,
        date TEXT,
        FOREIGN KEY (product_id) REFERENCES product(id)
    );
    """
    app.logger.info("Creating tables")
    try:
        execute_sql(sql)
    except Exception as e:
        app.logger.error(f"An error occurred: {str(e)}")
        raise e


with app.app_context():
    create_tables()

if __name__ == '__main__':
    app.run(debug=True)
