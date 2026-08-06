from urllib.parse import urlencode

from flask import Flask, render_template, request, redirect, url_for, jsonify, make_response, session, send_from_directory, abort

import json
import os
from functools import wraps

from dotenv import load_dotenv

import category_py
import database
import excel_filles

from werkzeug.security import check_password_hash, generate_password_hash

import get_data_judges_logic

load_dotenv()

from flask_socketio import SocketIO, join_room

app = Flask(__name__)
socketio = SocketIO(app)

app.config["SECRET_KEY"] = os.environ["SECRET_KEY"]

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",

    # В production должно быть True.
    # При True сайт должен работать через HTTPS.
    SESSION_COOKIE_SECURE=False
)

PJ_PASSWORD_HASH = os.environ["MASTER_PASSWORD_HASH"]
ADMIN_PASSWORD_HASH = os.environ["ADMIN_PASSWORD_HASH"]

ROLE_LEVELS = {
    "user": 0,
    "judge": 1,
    "referee": 1,
    "pj": 2,
    "admin": 3
}

def get_current_role():
    role = session.get("role", "user")

    if role not in ROLE_LEVELS:
        session.clear()
        return "user"

    return role

def get_current_login():
    login = session.get("login", "")

    return login

def role_required(required_role):
    """
    Декоратор проверки минимально необходимой роли.
    """

    def decorator(view_function):
        @wraps(view_function)
        def wrapped_view(*args, **kwargs):
            current_role = get_current_role()

            current_level = ROLE_LEVELS[current_role]
            required_level = ROLE_LEVELS[required_role]

            if current_level < required_level:
                if current_role == "user":
                    return redirect(
                        url_for(
                            "login",
                            role=required_role,
                            next=request.path,
                        )
                    )
                abort(403)

            return view_function(*args, **kwargs)

        return wrapped_view

    return decorator
#----------------------------------------------------------------------------------------
#----------------------------------------------------------------------------------------
@socketio.on("join_doyang")
def join_doyang(data):
    try:
        doyang_id = int(data.get("doyang_id"))
    except (TypeError, ValueError):
        return

    room_name = f"doyang_{doyang_id}"

    join_room(room_name)

@socketio.on("update_scores")
def update_scores(data):
    login = session.get("login", "")
    score1 = data.get("score1")
    score2 = data.get("score2")
    print("Score 1: " + str(score1) + " Score2: " + str(score2) + " Login: " + str(login))
    database.add_score(login, score1, score2)
    doyang = database.get_doyang_of_judge(login)
    print(get_data_judges_logic.get_data_judges_logic(doyang))
    socketio.emit(
        "update_scores_get", 
        get_data_judges_logic.get_data_judges_logic(doyang),
        to=f"doyang_{doyang}"
        )

#----------------------------------------------------------------------------------------
#----------------------------------------------------------------------------------------

@app.context_processor
def inject_current_role():
    """
    Делает current_role доступным во всех HTML-шаблонах.
    """
    return {
        "current_role": get_current_role()
    }

#----------------------------------------------------------------------------------------
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'xlsx', 'xls'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
#----------------------------------------------------------------------------------------

@app.route("/")
def home():    
    return render_template('main.html')

@app.route("/pj")
def home_pj():
    return render_template('pj.html')

@app.route("/admin")
def home_admin():
    print(get_current_role())
    if get_current_role() != 'admin':
        return redirect(url_for('login_screen'))
    
    if not os.path.exists(os.path.join(UPLOAD_FOLDER, 'competitors.xlsx')):
        return redirect(url_for('home_upload'))
    
    return render_template('admin.html')

@app.route("/upload_screen")
@role_required("admin")
def home_upload():
    if os.path.exists(os.path.join(UPLOAD_FOLDER, 'competitors.xlsx')):
        return redirect(url_for('home_admin'))
    return render_template('upload_page.html')

@app.route("/judges_screen")
@role_required("admin")
def judges_screen():
    return render_template('judges_screen.html')

@app.route("/login_screen")
def login_screen():
    return render_template('login_screen.html')

@app.route("/tkd_counter")
# @role_required("judge")
def home_tkd_counter():
    return render_template('tkd_counter.html')

@app.route("/home_match")
@role_required("pj")
def home_match():
    return render_template('home_match.html')
#----------------------------------------------------------------------------------------


@app.route("/api/auth/status", methods=["GET"])
def auth_status():
    role = request.args.get('role')
    print(role, get_current_role())

    # if get_current_login() == "" and role != "admin" and role == "pj":
    #     print('error')
    #     return jsonify({
    #         "success": False,
    #         "role": get_current_role(),
    #         "redirect": url_for('login_screen')
    #     })
    
    if ROLE_LEVELS[role] <= ROLE_LEVELS[get_current_role()]:
        return jsonify({
            "success": True,
            "role": get_current_role()
        })
    else:
        print('error')
        return jsonify({
            "success": False,
            "role": get_current_role(),
            "redirect": url_for('login_screen')
        })


@app.route("/api/auth/login", methods=["POST"])
def login():
    print('HI U Hi')
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "error": "No data"
        }), 400

    role = data.get("role")
    password = data.get("password", "")
    login = data.get("login", "")
    print(role)
    if role not in ("judge", "admin"):
        return jsonify({
            "success": False,
            "error": "Некорректная роль"
        }), 400

    if role == "judge":
        password_hash, judge_role = database.get_judge_password(login)
        role = judge_role
        # password_hash = PJ_PASSWORD_HASH
    else:
        password_hash = ADMIN_PASSWORD_HASH

    if not check_password_hash(password_hash, password):
        return jsonify({
            "success": False,
            "error": "Неверный пароль"
        }), 401

    # Удаляем старые данные сессии.
    session.clear()

    # Сохраняем только роль, а не пароль.
    session["role"] = role
    session["login"] = login
    if role == 'admin':
        return jsonify({
            "success": True,
            "role": role,
            "redirect": url_for('home_admin')
        })
    elif role == 'pj':
        return jsonify({
            "success": True,
            "role": role,
            "redirect": url_for('home_pj')
        }) 
    elif role == 'judge' or role == 'referee':
        return jsonify({
            "success": True,
            "role": role,
            "redirect": url_for('home_tkd_counter')
        }) 


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    session.clear()

    return jsonify({
        "success": True,
        "redirect": url_for('login_screen')
    })


#----------------------------------------------------------------------------------------

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({
            'success': False,
            'redirect': url_for('upload_screen')
        })    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({
            'success': False,
            'redirect': url_for('upload_screen')
        })        
    if not allowed_file(file.filename):
        return jsonify({
            'success': False,
            'redirect': url_for('upload_screen')
        })    
    if os.path.exists(os.path.join(UPLOAD_FOLDER, 'competitors.xlsx')):
        return jsonify({
            'success': False,
            'redirect': url_for('home_admin')
        })    
    
    year = int(request.form.get("year"))

    try:
        file_path = os.path.join(UPLOAD_FOLDER, 'competitors.xlsx')
        file.save(file_path)

        with open("year.txt", "w", encoding="utf-8") as f:
            f.write(str(year))

        database.start_tournament()
        return jsonify({
            'success': True,
            'redirect': url_for('home_admin')
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'redirect': url_for('upload_screen')
        })    

#----------------------------------------------------------------------------------------

@app.route("/api/add_doyang", methods = ['POST'])
@role_required("admin")
def add_doyang():
    data = request.get_json()
    name = data.get('name')
    database.add_doyang(name)
    return jsonify(success=True)
    # return redirect(url_for('home'))

@app.route("/api/add_judge", methods = ['POST'])
@role_required("admin")
def add_judge():
    data = request.get_json()
    login = data.get('login')
    password = data.get('password')
    doyang_id = data.get('doyang_id')
    role = data.get('role')
    
    database.add_judge(login, password, doyang_id, role)
    return jsonify(success=True)
    # return redirect(url_for('home'))

@app.route("/api/read_judges_file", methods = ['POST'])
@role_required("admin")
def read_judges_file():
    if 'file' not in request.files:
        return jsonify({
            'success': False
        })    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({
            'success': False
        })        
    if not allowed_file(file.filename):
        return jsonify({
            'success': False
        })    
    try:
        excel_filles.read_judges(file)
        return jsonify({
            'success': True
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
        })  
    return jsonify(success=True)

@app.route("/api/create_grid", methods = ['POST'])
@role_required("admin")
def create_grid():
    data = request.get_json()
    category_id = data.get('category_id')
    database.add_matches(category_id)
    return jsonify(success=True)
    # return redirect(url_for('home'))

@app.route("/api/set_winner", methods = ['POST'])
@role_required("pj")
def set_winner():
    data = request.get_json()
    match_id = data.get('match_id')
    winner = data.get('winner')
    print(match_id, winner)
    database.set_winner(match_id, winner)
    return jsonify(success=True)
    # return redirect(url_for('home'))

@app.route("/api/add_doyang_to_categories", methods = ['POST'])
@role_required("admin")
def add_doyang_to_categories():
    data = request.get_json()
    doyang_id = data.get('doyang_id')
    category_ids = data.get('categories')
    print(category_ids)
    database.add_doyang_to_categories(category_ids, doyang_id)
    return jsonify(success=True)
    # return redirect(url_for('home'))

@app.route("/api/play_match", methods = ['POST'])
@role_required("pj")
def play_match():
    data = request.get_json()
    match_id = data.get('match_id')
    # competitor1id = data.get('competitor1id')
    # competitor1name = data.get('competitor1name')
    # competitor2id = data.get('competitor2id')
    # competitor2name = data.get('competitor2name')

    doyang_id = database.play_match(match_id)
    data_to_send = {
        'doyang_id': doyang_id
        # ,
        # 'competitor1id': competitor1id,
        # 'competitor1name': competitor1name,
        # 'competitor2id': competitor2id,
        # 'competitor2name': competitor2name
    }
    
    base_url = url_for('home_match')
    redirect_url = f"{base_url}?{urlencode(data_to_send)}"
    return jsonify({
        'success': True,
        'redirect': redirect_url
    })  
#---------------------------------------------------------------------------------------

@app.route("/api/get_data_doyangs", methods = ['GET'])
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

@app.route("/api/get_data_categories", methods = ['GET'])
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

@app.route("/api/get_data_competitors", methods = ['GET'])
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

@app.route("/api/get_data_matches", methods = ['GET'])
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

@app.route("/api/pj/get_data_judges", methods = ['GET'])
def get_data_judges():
    doyang = request.args.get('doyang_id')
    return jsonify(get_data_judges_logic.get_data_judges_logic(doyang))

@app.route("/api/get_all_judges", methods = ['GET'])
@role_required("admin")
def get_all_judges():
    judges = database.get_all_judges()
    if len(judges) == 0:
        data = {
            'ids': [],
            'logins': [],
            'roles': [],
            'doyangs': [],
            'doyangs_names': []
        }
        return jsonify(data)
    ids = []
    logins = []
    roles = []
    doyangs = []
    doyangs_names = []
    for judge in judges:
        ids.append(judge[0])
        logins.append(judge[1])
        roles.append(judge[2])
        doyangs.append(judge[3])
        doyangs_names.append(judge[4])
    print(doyangs_names)
    data = {
        'ids': ids,
        'logins': logins,
        'roles': roles,
        'doyangs': doyangs,
        'doyangs_names': doyangs_names
    }
    return jsonify(data)

@app.route("/api/get_playing_match", methods = ['GET'])
def get_playing_match():
    doyang_id = request.args.get('doyang_id')
    match = database.get_playing_match(doyang_id)[0]
    print(match)
    match_id = match[0]
    competitor_1_id = match[3]
    competitor_2_id = match[4]
    competitor_1_name = match[-2]
    competitor_2_name = match[-1]
    data = {
        'match_id': match_id,
        'competitor_1_id': competitor_1_id,
        'competitor_2_id': competitor_2_id,
        'competitor_1_name': competitor_1_name,
        'competitor_2_name': competitor_2_name
    }
    return jsonify(data)

#---------------------------------------------------------------------------------------

@app.route("/api/delete_doyang", methods = ['POST'])
@role_required("admin")
def delete_doyang():
    data = request.get_json()
    doyang_id = data.get('doyang_id')
    database.delete_doyang(doyang_id)
    return jsonify(success=True)
    # return redirect(url_for('home'))

@app.route("/api/cancel_winner", methods = ['POST'])
@role_required("pj")
def cancel_winner():
    data = request.get_json()
    match_id = data.get('match_id')
    database.cancel_winner(match_id)
    return jsonify(success=True)
    # return redirect(url_for('home'))

@app.route("/api/delete_tournament", methods = ['POST'])
@role_required("admin")
def delete_tournament():
    database.delete_tables()
    if os.path.exists(os.path.join(UPLOAD_FOLDER, 'competitors.xlsx')):
        os.remove(os.path.join(UPLOAD_FOLDER, 'competitors.xlsx'))

    return jsonify({'success': True, 'redirect': url_for('home_admin')})

@app.route("/api/delete_judge", methods = ['POST'])
@role_required("admin")
def delete_judge():
    data = request.get_json()
    id = data.get('id')
    database.delete_judge(id)
    return jsonify(success=True)

@app.route("/api/change_judge", methods = ['POST'])
@role_required("admin")
def change_judge():
    data = request.get_json()
    judge_id = data.get('judge_id')
    doyang_id = data.get('doyang_id')
    role_id = data.get('role_id')
    database.change_judge(judge_id, doyang_id, role_id)
    return jsonify(success=True)

#---------------------------------------------------------------------------------------

@app.route("/api/open_judges", methods = ['POST'])
@role_required("admin")
def open_judges():
    return jsonify({
        'success': True,
        'redirect': url_for('judges_screen')
    })  

@app.route("/page_back", methods = ['POST'])
def page_back():
    return jsonify({
        'success': True,
        'redirect': request.referrer
    })  

if __name__ == "__main__":
    # print('hash:' + generate_password_hash("123", method="pbkdf2:sha256"))
    # app.run(debug=False, host='0.0.0.0', port=5001)
    socketio.run(app, debug=False, host='0.0.0.0', port=5001)
