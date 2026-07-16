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

@app.route("/add_competitor", methods = ['POST'])
def add_competitor():
    data = request.get_json()
    name = data.get('name')
    club = data.get('club')
    database.add_competitor(name, club)
    return redirect(url_for('home'))

@app.route("/get_data_doyangs", methods = ['GET'])
def get_data_doyangs():
    doyangs = database.get_from_doyangs()
    if len(doyangs) == 0:
        data = {
            'ids': [],
            'names': []
        }
        return jsonify(data)
    ids = []
    names = []
    for doyang in doyangs:
        ids.append(doyang[0])
        names.append(doyang[1])
    data = {
        'ids': ids,
        'names': names
    }
    return jsonify(data)

@app.route("/get_data_categories", methods = ['GET'])
def get_data_categories():
    categories = database.get_from_categories()
    if len(categories) == 0:
        data = {
            'ids': [],
            'names': [],
            'doyangs': []
        }
        return jsonify(data)
    ids = []
    names = []
    doyangs = []
    for category in categories:
        ids.append(category[0])
        names.append(category[1])
        doyangs.append(category[2])
    data = {
        'ids': ids,
        'names': names,
        'doyangs': doyangs
    }
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=5001)
