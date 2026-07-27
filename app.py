from flask import Flask, render_template, request, redirect, url_for, jsonify, make_response
import json
import os

import category_py
import database

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'xlsx', 'xls'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/")
def home():
    if not os.path.exists(os.path.join(UPLOAD_FOLDER, 'competitors.xlsx')):
        return redirect(url_for('home_upload'))
    
    return render_template('main.html')

@app.route("/pj")
def home_pj():
    return render_template('pj.html')

@app.route("/upload_screen")
def home_upload():
    return render_template('upload_page.html')


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'success': False, 'redirect': '/upload'})
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'success': False, 'redirect': '/upload'})
    
    if not allowed_file(file.filename):
        return jsonify({'success': False, 'redirect': '/upload'})
    try:
        file_path = os.path.join(UPLOAD_FOLDER, 'competitors.xlsx')
        file.save(file_path)

        database.start_tournament()
        return jsonify({'success': True, 'redirect': '/'})
    
    except Exception as e:
        return jsonify({'success': False, 'redirect': '/upload'})
    

@app.route("/add_doyang", methods = ['POST'])
def add_doyang():
    data = request.get_json()
    name = data.get('name')
    database.add_doyang(name)
    return redirect(url_for('home'))

@app.route("/pj/add_judge", methods = ['POST'])
def add_judge():
    data = request.get_json()
    login = data.get('login')
    doyang_id = data.get('doyang_id_current')
    database.add_judge(login, doyang_id)
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

@app.route("/add_doyang_to_categories", methods = ['POST'])
def add_doyang_to_categories():
    data = request.get_json()
    doyang_id = data.get('doyang_id')
    category_ids = data.get('categories')
    print(category_ids)
    database.add_doyang_to_categories(category_ids, doyang_id)
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
    competitors_amounts = database.get_competitors_amounts()
    if len(categories) == 0:
        data = {
            'ids': [],
            'names': [],
            'doyangs': [],
            'doyangs_list': doyangs_list,
            'competitors_amounts': []
        }
        return jsonify(data)
    ids = []
    names = []
    doyangs = []
    for category in categories:
        ids.append(category[0])
        names.append(
            category_py.category_name(
                name=category[1], 
                belt_from=category[2],
                belt_to=category[3],
                weight_from=category[4],
                weight_to=category[5],
                age_from=category[6],
                age_to=category[7],
                type=category[8]
            )
        )
        doyangs.append(category[9])
    data = {
        'ids': ids,
        'names': names,
        'doyangs': doyangs, 
        'doyangs_list': doyangs_list,
        'competitors_amounts': competitors_amounts
    }
    return jsonify(data)

@app.route("/get_data_competitors", methods = ['GET'])
def get_data_competitors():
    category = request.args.get('category_id')
    competitors = database.get_from_competitors(category)
    categories_list_initial = database.get_from_categories()
    categories_list = []
    for category_initial in categories_list_initial:
        category = []
        category.append(category_initial[0])
        category.append(
            category_py.category_name(
                name=category_initial[1], 
                belt_from=category_initial[2],
                belt_to=category_initial[3],
                weight_from=category_initial[4],
                weight_to=category_initial[5],
                age_from=category_initial[6],
                age_to=category_initial[7],
                type=category_initial[8]
            )
        )
        category.append(category_initial[9])
        categories_list.append(category)

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

#---------------------------------------------------------------------------------------

@app.route("/delete_doyang", methods = ['POST'])
def delete_doyang():
    data = request.get_json()
    doyang_id = data.get('doyang_id')
    database.delete_doyang(doyang_id)
    return redirect(url_for('home'))

@app.route("/cancel_winner", methods = ['POST'])
def cancel_winner():
    data = request.get_json()
    match_id = data.get('match_id')
    database.cancel_winner(match_id)
    return redirect(url_for('home'))

if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=5001)
