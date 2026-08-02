from flask import jsonify

import database


def get_data_judges_logic(doyang):
    judges = database.get_from_judges(doyang)
    print(doyang)
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
    return data