from flask import Flask, render_template, request, redirect, url_for, jsonify, make_response
import json

import database

app = Flask(__name__)

@app.route("/")
def home():
    return render_template('main.html')

@app.route("/pj")
def home_pj():
    return render_template('pj.html')

@app.route("/create_tables", methods = ['POST'])
def create_tables():
    database.create_tables()
    return redirect(url_for('home'))

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
    category_id_current = data.get('category_id_current')
    database.add_competitor(name, club, category_id_current)
    return redirect(url_for('home'))

@app.route("/pj/add_judge", methods = ['POST'])
def add_judge():
    data = request.get_json()
    login = data.get('login')
    doyang_id = data.get('doyang_id_current')
    category_id = data.get('category_id_current')
    database.add_judge(login, doyang_id, category_id)
    return redirect(url_for('home'))

@app.route("/create_grid", methods = ['POST'])
def create_grid():
    data = request.get_json()
    category_id = data.get('category_id')
    database.add_matches(category_id)
    return redirect(url_for('home'))

@app.route("/set_winner", methods = ['POST'])
def set_winner():
    data = request.get_json()
    match_id = data.get('match_id')
    winner = data.get('winner')
    print(match_id, winner)
    database.set_winner(match_id, winner)
    return redirect(url_for('home'))
#---------------------------------------------------------------------------------------

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
    doyangs_list = database.get_from_doyangs()
    if len(categories) == 0:
        data = {
            'ids': [],
            'names': [],
            'doyangs': [],
            'doyangs_list': doyangs_list
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
        'doyangs': doyangs, 
        'doyangs_list': doyangs_list
    }
    return jsonify(data)

@app.route("/get_data_competitors", methods = ['GET'])
def get_data_competitors():
    competitors = database.get_from_competitors()
    categories_list = database.get_from_categories()
    if len(competitors) == 0:
        data = {
            'ids': [],
            'names': [],
            'clubs': [],
            'categories': [], 
            'categories_list': categories_list
        }
        return jsonify(data)
    ids = []
    names = []
    clubs = []
    categories = []
    for competitor in competitors:
        ids.append(competitor.id)
        names.append(competitor.name)
        clubs.append(competitor.club)
        categories.append(competitor.category)
    data = {
        'ids': ids,
        'names': names,
        'clubs': clubs,
        'categories': categories,
        'categories_list': categories_list
    }
    return jsonify(data)

@app.route("/get_data_matches", methods = ['GET'])
def get_data_matches():
    category_id = request.args.get('category_id')
    matches = database.get_from_matches(category_id)
    rounds = []
    for match in matches:
        if match[1] not in rounds:
            rounds.append(match[1])
    rows = []
    for round in rounds:
        row_index = 0
        for match in matches:
            if (match[1] == round):
                match_new = match + (int(row_index),)
                rows.append(match_new)
                row_index += max(rounds)/round
    data = {
        'rows': rows, 
        'rounds': rounds,
    }
    return jsonify(data)

@app.route("/pj/get_data_judges", methods = ['GET'])
def get_data_judges():
    doyang = request.args.get('doyang_id')
    judges = database.get_from_judges(doyang)
    if len(judges) == 0:
        data = {
            'ids': [],
            'logins': [],
            'scores1': [],
            'scores2': [],
            'winners': []
        }
        return jsonify(data)
    ids = []
    logins = []
    scores1 = []
    scores2 = []
    winners = []
    for judge in judges:
        ids.append(judge[0])
        logins.append(judge[1])
        scores1.append(judge[2])
        scores2.append(judge[3])
        winners.append(judge[4])
    data = {
        'ids': ids,
        'logins': logins,
        'scores1': scores1,
        'scores2': scores2, 
        'winners': winners
    }
    return jsonify(data)


if __name__ == "__main__":
    database.create_tables()
    app.run(debug=False, host='0.0.0.0', port=5001)
