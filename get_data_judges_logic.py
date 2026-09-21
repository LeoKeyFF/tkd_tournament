from flask import jsonify

import database


def get_data_judges_logic(doyang):
    judges = database.get_from_judges(doyang)
    if len(judges) == 0:
        data = {
            'ids': [],
            'logins': [],
            'scores1': [],
            'scores2': [],
            'winners': [],
            'scores1main': [],
            'scores2main': [],
            'cautions1': [],
            'cautions2': [],
            'warnings1': [],
            'warnings2': []
        }
        return data
    ids = []
    logins = []
    scores1 = []
    scores2 = []
    winners = []
    scores1main = []
    scores2main = []
    cautions1 = []
    cautions2 = []
    warnings1 = []
    warnings2 = []
    for judge in judges:
        ids.append(judge[0])
        logins.append(judge[1])
        scores1.append(judge[2])
        scores2.append(judge[3])
        winners.append(judge[4])
        scores1main.append(judge[5])
        scores2main.append(judge[6])
        cautions1.append(judge[7])
        cautions2.append(judge[8])
        warnings1.append(judge[9])
        warnings2.append(judge[10])
    data = {
        'ids': ids,
        'logins': logins,
        'scores1': scores1,
        'scores2': scores2, 
        'winners': winners,
        'scores1main': scores1main,
        'scores2main': scores2main, 
        'cautions1': cautions1,
        'cautions2': cautions2,
        'warnings1': warnings1,
        'warnings2': warnings2
    }
    return data