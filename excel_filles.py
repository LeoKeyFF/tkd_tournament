import pandas as pd
import re
import database

def set_tech_qual(tech_qual_str):
    if 'гып' in tech_qual_str or 'гуп' in tech_qual_str:
        return - int(re.sub(r"\D", "", tech_qual_str))
    elif 'дан' in tech_qual_str:
        return int(re.sub(r"\D", "", tech_qual_str))
    else:
        return -11

def read_cometitors():
    df = pd.read_excel(
        'competitors_old_data.xlsx',
        engine='openpyxl',
        dtype={
            'ФИО': str,
            'пол': str,
            'спорт квал': str,
            'техн квал': str,
            'весовая кат': float,
            'масоги': str,
            'туль': str,
            'сила': str,
            'спец техн': str,
            'ком сп': str,
            'ком тул': str,
            'ком сил': str,
            'ком спц': str,
            'традиц': str,
            'судейство': str,
            'регион': str,
            'фо': str,
            'ведомство': str,
            'клуб': str,
            'тренер': str,
        },
        parse_dates=['дата рожд']
    )

    for index, row in df.iterrows():
        print(row['дата рожд'].year)
        name = row['ФИО']
        gender = 'm' if 'м' in row['пол'].lower() else 'w'
        birth_date = row['дата рожд'].strftime('%Y-%m-%d')
        qualification = row['спорт квал']
        belt =  set_tech_qual(row['техн квал']) 
        weight = row['весовая кат']
        sparring = database.get_category_id(2026 - row['дата рожд'].year, weight, belt, gender, 'матсоги') if '+' in row['масоги'] else 0
        tuly =  database.get_category_id(2026 - row['дата рожд'].year, weight, belt, gender, 'тыль') if '+' in row['туль'] else 0
        power = 1 if '+' in row['сила'] else 0
        special_technic = 1 if '+' in row['спец техн'] else 0
        team_sparring = 1 if '+' in row['ком сп'] else 0
        team_tuly = 1 if '+' in row['ком тул'] else 0
        team_power = 1 if '+' in row['ком сил'] else 0
        team_special_technic = 1 if '+' in row['ком спц'] else 0
        traditional = 1 if '+' in row['традиц'] else 0
        is_judge = 1 if '+' in row['судейство'] else 0
        region = row['регион']
        federal_district = row['фо']
        security = row['ведомство']
        club = row['клуб']
        coach = row['тренер']
        database.add_competitor(
            name, gender, birth_date, qualification, 
            belt, weight, sparring, tuly, power, special_technic, 
            team_sparring, team_tuly, team_power, team_special_technic,
            traditional, is_judge, region, federal_district, security, club, coach
        )

    database.delete_unused_categories()


def read_categories():
    datatype = {
        'name': str,
        'gender': str,
        'belt_from': str,
        'belt_to': str,
        'weight_from': float,
        'weight_to': float,
        'age_from': int,
        'age_to': int,
        'type': str
    }
    df_m = pd.read_excel(
        'tuly_categories.xlsx',
        engine='openpyxl',
        dtype=datatype
    )
    df_t = pd.read_excel(
        'matsogi_categories.xlsx',
        engine='openpyxl',
        dtype=datatype
    )
    df = pd.concat([df_m, df_t], ignore_index=True)
    for index, row in df.iterrows():
        name = row['name']
        gender = 'w' if 'female' in row['gender'] else 'm'
        belt_from =  set_tech_qual(row['belt_from']) 
        belt_to =  set_tech_qual(row['belt_to']) 
        weight_from = row['weight_from']
        weight_to = row['weight_to']
        age_from = row['age_from']
        age_to = row['age_to']
        type = row['type']

        database.add_category(
            name, gender, belt_from, belt_to,
            weight_from, weight_to, age_from, age_to, type
        )
    