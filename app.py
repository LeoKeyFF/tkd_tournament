from flask import Flask, render_template, request, redirect, url_for, jsonify, make_response
import json

import database

app = Flask(__name__)

@app.route("/")
def home():
    return render_template('main.html')

@app.route("/add_doyang", methods = ['POST'])
def add_doyang():
    data = request.get_json()
    name = data.get('name')
    database.add_doyang(name)
    return redirect(url_for('home'))

@app.route("/add_category", methods = ['POST'])
def add_category():
    data = request.get_json()
    name = data.get('name')
    doyang_id_current = data.get('doyang')
    database.add_category(name, doyang_id_current)
    return redirect(url_for('home'))

if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=5001)
