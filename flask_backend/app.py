#!/usr/bin/python3
import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from datetime import date, datetime
from json import JSONEncoder
from flask_login import LoginManager, login_user, UserMixin, login_required, current_user
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://fintrack_dev:fintrack_pwd@localhost/finance_tracker_db'
app.config['SECRET_KEY'] = '6731408e087023795fba55e596f412ff'
db = SQLAlchemy(app)

# Initialize Flask-Migrate
migrate = Migrate(app, db)
login_manager = LoginManager(app)

class User(db.Model):
    """Initiaizes the User class"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    transactions = db.relationship('Transaction', backref='user', lazy=True)
    budgets = db.relationship('Budget', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.username}>'

    def is_active(self):
        """Check if the user is active."""
        return True
    def get_id(self):
        """Return the user ID as a string."""
        return str(self.id)
    def is_authenticated(self):
        """Check if the user is authenticated."""
        return True

    def is_anonymous(self):
        """Check if the user is anonymous."""
        return False

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/login', methods=['POST'])
def login():
    """Handle user login"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        login_user(user)
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

class Transaction(db.Model):
    """Initializes the transaction class"""
    __tablename__ = 'transactions'
    TransactionID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    Amount = db.Column(db.Float, nullable=False)
    Category = db.Column(db.String(50), nullable=False)
    Description = db.Column(db.String(255))
    Date = db.Column(db.DateTime, default=db.func.current_timestamp())

class Budget(db.Model):
    """Initializes the budget class"""
    __tablename__ = 'budgets'
    BudgetID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    Amount = db.Column(db.Float, nullable=False)
    Category = db.Column(db.String(50), nullable=False)
    # Description = db.Column(db.String(255))
    StartDate = db.Column(db.Date, nullable=False)
    EndDate = db.Column(db.Date, nullable=False)

# User Routes
@app.route('/user', methods=['GET'])
def get_users():
    """Retreives the users"""
    users = User.query.all()

    users_data  = [
        {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'password': user.password,
            'transactions': user.transactions,
            'budgets': user.budgets
        }
        for user in users
    ]

    return jsonify(users_data)

@app.route('/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """ Get user object by id """
    user = User.query.get(user_id)
    if user:
        return jsonify(user)
    return jsonify({'error': 'User not found'}), 404

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Validate the input
    if not username or not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400
    # check if username or email is already in use
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'error': 'Username or email already in use'}), 400
    hashed_password = generate_password_hash(password)
    new_user = User(username=username, email=email, password=hashed_password)

    # Save the new user to the database
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

# Transaction Routes
@app.route('/transactions', methods=['GET'])
def get_transaction():
    """gets all transaction objects"""
    transactions = Transaction.query.all()
    transactions_data = [
        {
            'Category': transaction.Category,
            'Amount': transaction.Amount,
            'Description': transaction.Description,
            'TransactionID': transaction.TransactionID
        }
        for transaction in transactions
    ]
    return jsonify(transactions_data)

@app.route('/transactions/<int:transaction_id>', methods=['GET'])
def get_trans(transaction_id):
    """gets transaction object using id"""
    transaction = Transaction.query.get(transaction_id)
    if transaction:
        return jsonify(transaction)
    return jsonify({'error': 'Transaction not found'}), 404

@app.route('/transactions', methods=['POST'])
@login_required
def create_transaction():
    """creates a transaction object"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400

    required_fields = ['Category', 'Amount', 'Description']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400


    try:
        user_id = current_user.get_id()
        if user_id is not None:
            # validate and process the data as needed
            new_transaction = Transaction(UserID=user_id, **data)
            db.session.add(new_transaction)
            db.session.commit()
            return jsonify({'message': 'Transaction created successfully'}), 201
        else:
            return jsonify({'error': 'UserID not available'}), 400
    except Exception as e:
        print('Error:', str(e))
        return jsonify({'error': 'Internal Server Error'}), 500

@app.route('/transactions/<int:transaction_id>', methods=['PUT'])
@login_required
def update_transaction(transaction_id):
    """Updates a transaction object"""
    data = request.get_json()

    try:
        user_id = current_user.get_id()
        if user_id is not None:
            # Validate and process the data as needed
            updated_transaction = Transaction.query.filter_by(TransactionID=transaction_id, UserID=user_id).first()
            if updated_transaction:
                updated_transaction.Category = data.get('Category', updated_transaction.Category)
                updated_transaction.Amount = data.get('Amount', updated_transaction.Amount)
                updated_transaction.Description = data.get('Description', updated_transaction.Description)
                db.session.commit()
                return jsonify({'message': 'Transaction updated successfully'}), 200
            else:
                return jsonify({'error': 'Transaction not found or unauthorized'}), 404
        else:
            return jsonify({'error': 'User ID not available'}), 401
    except Exception as e:
        print('Error:', str(e))
        return jsonify({'error': 'Internal Server Error'}), 500


@app.route('/transactions/<int:transaction_id>', methods=['DELETE'])
@login_required
def delete_transaction(transaction_id):
    """Deletes a transaction object"""
    try:
        user_id = current_user.get_id()
        if user_id is not None:
            # Validate and process the data as needed
            deleted_transaction = Transaction.query.filter_by(TransactionID=transaction_id, UserID=user_id).first()
            if deleted_transaction:
                db.session.delete(deleted_transaction)
                db.session.commit()
                return jsonify({'message': 'Transaction deleted successfully'}), 200
            else:
                return jsonify({'error': 'Transaction not found or unauthorized'}), 404
        else:
            return jsonify({'error': 'User ID not available'}), 401
    except Exception as e:
        print('Error:', str(e))
        return jsonify({'error': 'Internal Server Error'}), 500

# Budget Routes
@app.route('/budgets', methods=['GET'])
def get_budgets():
    """retrieves all budget objects"""
    budgets = Budget.query.all()
    budgets_data = [
        {
            'Category': budget.Category,
            'Amount': budget.Amount,
            'Start Date': budget.StartDate.strftime('%m-%d-%Y'),
            'End Date': budget.EndDate.strftime('%m-%d-%Y')
        }
        for budget in budgets
    ]
    return jsonify(budgets_data)

@app.route('/budgets/<int:budget_id>', methods=['GET'])
def get_bgt(budget_id):
    """retrieves budget object using id"""
    budget = Budget.query.get(budget_id)
    if budget:
        return jsonify(budget)
    return jsonify({'error': 'Budget not found'}), 404

@app.route('/budgets', methods=['POST'])
@login_required
def create_budget():
    """creates a budget object"""
    data = request.get_json()

    try:
        user_id = current_user.get_id()
        if user_id is not None:
            # Validate and process the data as needed
            new_budget = Budget(UserID=user_id, **data)
            db.session.add(new_budget)
            db.session.commit()
            response_data = {
                # 'BudgetID': new_budget.BudgetID,
                'Category': new_budget.Category,
                'Amount': new_budget.Amount,
                'StartDate': new_budget.StartDate.strftime('%m-%d-%Y'),
                'EndDate': new_budget.EndDate.strftime('%m-%d-%Y'),
            }
            return jsonify(response_data), 201
        else:
            return jsonify({'error': 'User ID not available'}), 401
    except Exception as e:
        print('Error:', str(e))
        return jsonify({'error': 'Internal Server Error'}), 500

if __name__ == "__main__":
    app.run(debug=True)
