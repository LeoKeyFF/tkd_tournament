import json
import random
import sqlite3
import math

from competitor import Competitor
import excel_filles

from werkzeug.security import generate_password_hash

database_path = "database.db"

def start_tournament():
    create_tables()

    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    if len(cursor.execute(f"SELECT * FROM Competitors").fetchall()) == 0:
        connection.commit()
        connection.close()
        print('..........creation!!!! AAAAAAAAAAAAAAAAAAAAAAAAAA..............AAAAAAAAAAAAAAAAAAAAAA')

        excel_filles.read_categories()
        excel_filles.read_cometitors()
        create_grids()
    else:
        connection.commit()
        connection.close()

def create_tables():
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()
    cursor.execute(
        f"CREATE TABLE IF NOT EXISTS DoYangs ( DoYangID INTEGER PRIMARY KEY," 
          "Name varchar(255),"
          "PlayingCategoryID INT"
          
        ")"
    )
    cursor.execute(
        f"CREATE TABLE IF NOT EXISTS Categories ( CategoryID INTEGER PRIMARY KEY," 
          "Name varchar(255),"
          "Gender varchar(2),"
          "BeltFrom INT,"
          "BeltTo INT,"
          "WeightFrom REAL,"
          "WeightTo REAL,"
          "AgeFrom INT,"
          "AgeTo INT,"
          "Type varchar(255),"
          "DoYangID INT"
        ")"
    )
    cursor.execute(
        f"CREATE TABLE IF NOT EXISTS Competitors ( CompetitorID INTEGER PRIMARY KEY," 
          "Name varchar(255),"
          "Gender varchar(1),"
          "BirthDate varchar(255),"
          "Qualification varchar(255),"
          "Belt INT,"
          "Weight REAL,"
          "Sparring INT,"
          "Tuly INT,"
          "Power INT,"
          "SpecialTechnic INT,"
          "TeamSparring INT,"
          "TeamTuly INT,"
          "TeamPower INT,"
          "TeamSpecialTechnic INT,"
          "Traditional INT,"
          "IsJudge INT,"
          "Region varchar(255),"
          "FederalDistrict varchar(255),"
          "Security varchar(255),"
          "Club varchar(255),"
          "Coach varchar(255)"
        ")"
    )

    cursor.execute(
        f"CREATE TABLE IF NOT EXISTS Matches ( MatchID INTEGER PRIMARY KEY," 
          "CategoryID INT,"
          "RoundNumber INT," 
          "Competitor1ID INT," 
          "Competitor2ID INT," 
          "Winner INT," 
          "NextMatchID INT"
        ")"
    )

    cursor.execute(
        f"CREATE TABLE IF NOT EXISTS Judges ( JudgeID INTEGER PRIMARY KEY," 
          "Login varchar(255),"
          "DoYangID INT,"
          "Password INT,"
          "Role varchar(255),"
          "Competitor1Score INT," 
          "Competitor2Score INT," 
          "Winner INT" 
        ")"
    )
    
    connection.commit()
    connection.close()

def add_doyang(name):
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    message = f"INSERT INTO DoYangs (Name, PlayingCategoryID) VALUES ('{name}', 0)"
    cursor.execute(message)

    connection.commit()
    connection.close()

def add_category(
            name, gender, belt_from, belt_to,
            weight_from, weight_to, age_from, age_to, type
        ):
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    message = f"""
        INSERT INTO Categories (
            Name, Gender, BeltFrom, BeltTo, WeightFrom, WeightTo, AgeFrom, AgeTo, Type, DoYangID
        ) VALUES (
            '{name}', '{gender}', {belt_from}, {belt_to}, {weight_from}, {weight_to}, {age_from}, {age_to}, '{type}', 0
        )
    """
    cursor.execute(message)

    connection.commit()
    connection.close()

def add_competitor(name, gender, birth_date, qualification, 
                                belt, weight, sparring, tuly, power, special_technic, 
                                team_sparring, team_tuly, team_power, team_special_technic,
                                traditional, is_judge, region, federal_district, security, club, coach):
    
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    message = f"""
        INSERT INTO Competitors (
            Name, Gender, BirthDate, Qualification, 
            Belt, Weight, Sparring , Tuly,
            Power, SpecialTechnic, TeamSparring,
            TeamTuly, TeamPower, TeamSpecialTechnic,
            Traditional, IsJudge, Region, FederalDistrict,
            Security, Club, Coach
        ) VALUES (
            '{name}', '{gender}', '{birth_date}', '{qualification}', {belt},
            {weight}, {sparring}, {tuly}, {power}, {special_technic},
            {team_sparring}, {team_tuly}, {team_power}, {team_special_technic}, {traditional},
            {is_judge}, '{region}', '{federal_district}', '{security}', '{club}', '{coach}'
        )
    """
    cursor.execute(message)

    connection.commit()
    connection.close()

def add_matches(category_id):
    competitors = get_from_competitors(category_id)
    random.shuffle(competitors)

    first_round = 1
    rounds = [1]
    while len(competitors) > first_round * 2:
         first_round = first_round * 2
         rounds.append(first_round)
    rounds = rounds[::-1]

    while len(competitors) < first_round * 2:
        for i in range(len(competitors) - 1, -1, -1):
            if len(competitors) == first_round * 2:
                break
            competitors.insert(i + 1, Competitor(0, '', '', category_id))

    print(competitors)

    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()
    
    last_id_selected = cursor.execute(f"SELECT MAX(MatchID) FROM Matches").fetchall()
    try:
        last_id = int(last_id_selected[0][0])
    except Exception as e:
        last_id = 0

    comp_index = 0
    next_id = last_id
    for round in rounds:
        next_id += round
        if round == 1:
            next_id = -1
        for match_index in range(1, round + 1):
            if comp_index + 1 < len(competitors):
                cursor.execute(f"""
                    INSERT INTO Matches 
                    (CategoryID, RoundNumber, Competitor1ID, Competitor2ID, NextMatchID) 
                    VALUES (
                        {category_id}, 
                        {round}, 
                        {competitors[comp_index].id}, 
                        {competitors[comp_index + 1].id}, 
                        {next_id + math.ceil(match_index / 2)}
                    )
                """)  
            else:
                cursor.execute(f"""
                    INSERT INTO Matches 
                    (CategoryID, RoundNumber, NextMatchID) 
                    VALUES (
                        {category_id}, 
                        {round}, 
                        {next_id + math.ceil(match_index / 2)}
                    )
                """)            
            comp_index += 2

    connection.commit()
    connection.close()

    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    empty_competitors = cursor.execute(f"""
        SELECT 
            MatchID,
            Competitor1ID
        FROM 
            Matches
        WHERE 
            Competitor1ID IS NOT NULL 
            AND Competitor1ID != ''
            AND (Competitor2ID IS NULL OR Competitor2ID = 0)
            AND (CategoryID = {category_id});
    """).fetchall()

    connection.commit()
    connection.close()

    for competitor in empty_competitors:
        set_winner(competitor[0], competitor[1])

def add_judge(login, password, doyang_id, role):
    password = generate_password_hash(password, method="pbkdf2:sha256")
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    login_is_used = cursor.execute(
        f"SELECT Login FROM Judges WHERE Login = '{login}'"
    ).fetchall()
    print(login_is_used)
    if len(login_is_used) != 0:
        cursor.execute(f"DELETE FROM Judges WHERE Login = '{login}'")

    message = f"""
        INSERT INTO Judges (Login, Password, DoYangID, Role) 
        VALUES ('{login}', '{password}', {doyang_id}, '{role}')
    """
    cursor.execute(message)

    connection.commit()
    connection.close()

def add_doyang_to_categories(category_ids, doyang_id):
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    for category in category_ids:
        cursor.execute(f"""
            UPDATE Categories
            SET 
                DoYangID = {doyang_id}
            WHERE 
                CategoryID = {category}
        """)   

    connection.commit()
    connection.close()


def get_from_doyangs():
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    doyangs = cursor.execute(f"SELECT DoYangID, Name FROM DoYangs")
    doyangs = doyangs.fetchall()

    connection.commit()
    connection.close()

    return doyangs

def get_from_categories():
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    categories = cursor.execute(f"""
        SELECT CategoryID, Name, BeltFrom, BeltTo, WeightFrom, WeightTo, AgeFrom, AgeTo, Type, DoYangID FROM Categories
    """)
    categories = categories.fetchall()

    connection.commit()
    connection.close()

    return categories

def get_from_competitors(category):
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    competitors_selected = cursor.execute(f"""
        SELECT CompetitorID, Name, Club FROM Competitors
        WHERE 
            Sparring = {category} OR Tuly = {category} 
            OR Power = {category} OR SpecialTechnic = {category} 
            OR TeamSparring = {category} OR TeamTuly = {category} 
            OR TeamPower = {category} OR TeamSpecialTechnic = {category} OR Traditional = {category}
    """)

    competitors_selected = competitors_selected.fetchall()
    competitors = []
    for competitor in competitors_selected:
        competitors.append(Competitor(competitor[0], competitor[1], competitor[2], category))

    connection.commit()
    connection.close()

    return competitors

def get_from_matches(category_id):
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    matches = cursor.execute(f"""
        SELECT 
            m.CategoryID,
            m.RoundNumber,
            m.Competitor1ID,
            c1.Name AS Competitor1Name,
            m.Competitor2ID,
            c2.Name AS Competitor2Name,
            m.Winner,
            m.MatchID
        FROM 
            Matches m
        LEFT JOIN 
            Competitors c1 ON m.Competitor1ID = c1.CompetitorID
        LEFT JOIN 
            Competitors c2 ON m.Competitor2ID = c2.CompetitorID
        WHERE 
            m.CategoryID = {category_id}
    """)    
    matches = matches.fetchall()

    connection.commit()
    connection.close()

    return matches

def get_from_judges(doyang_id):
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    judges = cursor.execute(f"""
        SELECT 
            JudgeID, Login, Competitor1Score, Competitor1Score, Winner 
        FROM 
            Judges 
        WHERE 
            DoYangID = {doyang_id}
    """)

    judges = judges.fetchall()

    connection.commit()
    connection.close()

    return judges

def set_winner(match_id, winner):
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    cursor.execute(
        f"UPDATE Matches SET Winner = {winner} WHERE MatchID = {match_id}"
    )
    next_match_id = cursor.execute(
        f"SELECT NextMatchID FROM Matches WHERE MatchID = {match_id}"
    ).fetchall()[0][0]

    cursor.execute(f"""
        UPDATE Matches 
        SET 
            Competitor1ID = 
                CASE WHEN Competitor1ID IS NULL OR Competitor1ID = '' 
                THEN {winner}
                ELSE Competitor1ID 
                END,
            Competitor2ID = 
                CASE WHEN Competitor1ID IS NOT NULL AND Competitor1ID != '' 
                    AND (Competitor2ID IS NULL OR Competitor2ID = '')
                THEN {winner}
                ELSE Competitor2ID 
                END
        WHERE 
            MatchID = {next_match_id}
    """)    

    connection.commit()
    connection.close()

def get_category_id(age, weight, belt, gender, type):
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    category = cursor.execute(f"""
        SELECT 
            CategoryID 
        FROM 
            Categories 
        WHERE
            Type = '{type}' AND Gender = '{gender}' AND 
            AgeFrom <= {age} AND AgeTo >= {age} AND 
            WeightFrom <= {weight} AND WeightTo > {weight} AND
            BeltFrom <= {belt} AND BeltTo >= {belt}
    """).fetchall()

    connection.commit()
    connection.close()

    if len(category) > 0:
        return category[0][0]
    else:
        return 0

def delete_unused_categories():
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    cursor.execute(f"""
        DELETE FROM Categories
        WHERE NOT EXISTS (
            SELECT 1
            FROM Competitors
            WHERE Competitors.Sparring = Categories.CategoryID OR Competitors.Tuly = Categories.CategoryID OR Competitors.Power = Categories.CategoryID 
        )
    """)

    connection.commit()
    connection.close()
                #     OR Competitors.Power = Categories.CategoryID OR Competitors.SpecialTechnic = Categories.CategoryID
                # OR Competitors.TeamSparring = Categories.CategoryID OR Competitors.TeamTuly = Categories.CategoryID
                # OR Competitors.TeamPower = Categories.CategoryIDOR Competitors.TeamSpecialTechnic = Categories.CategoryID
                # OR Competitors.Traditional = Categories.CategoryID

def create_grids():
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    categories = cursor.execute(f"SELECT CategoryID FROM Categories")
    categories = categories.fetchall()

    connection.commit()
    connection.close()

    for category in categories:
        add_matches(category[0])

def get_competitors_amounts():
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    categories = cursor.execute(f"SELECT CategoryID FROM Categories")
    categories = categories.fetchall()

    competitors_amounts = []

    for category in categories:
        amount = cursor.execute(f"""
            SELECT COUNT(*) FROM Competitors
            WHERE 
                Sparring = {category[0]} OR Tuly = {category[0]} 
                OR Power = {category[0]} OR SpecialTechnic = {category[0]} 
                OR TeamSparring = {category[0]} OR TeamTuly = {category[0]} 
                OR TeamPower = {category[0]} OR TeamSpecialTechnic = {category[0]} OR Traditional = {category[0]}       
        """).fetchall()
        competitors_amounts.append(amount[0][0])

    connection.commit()
    connection.close()

    return competitors_amounts

def delete_doyang(doyang_id):
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    cursor.execute(f"""
        UPDATE Categories
        SET 
            DoYangID = 0
        WHERE 
            DoYangID = {doyang_id}
    """) 

    cursor.execute(f"""
        DELETE FROM DoYangs
        WHERE 
            DoYangID = {doyang_id}
    """) 

    connection.commit()
    connection.close()    


def cancel_winner(match_id):
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    was_winner = cursor.execute(
        f"SELECT Winner FROM Matches WHERE MatchID = {match_id}"
    ).fetchall()[0][0]

    next_match_id = cursor.execute(
        f"SELECT NextMatchID FROM Matches WHERE MatchID = {match_id}"
    ).fetchall()[0][0]

    cursor.execute(
        f"UPDATE Matches SET Winner = NULL WHERE MatchID = {match_id}"
    )

    cursor.execute(f"""
        UPDATE Matches 
        SET 
            Competitor1ID = 
                CASE WHEN Competitor1ID = {was_winner}
                THEN NULL
                ELSE Competitor1ID 
                END,
            Competitor2ID = 
                CASE WHEN Competitor2ID = {was_winner}
                THEN NULL
                ELSE Competitor2ID 
                END
        WHERE 
            MatchID = {next_match_id}
    """)    

    next_match_winner = cursor.execute(
        f"SELECT Winner FROM Matches WHERE MatchID = {next_match_id}"
    ).fetchall()[0][0] if next_match_id != 0 else None

    connection.commit()
    connection.close()  

    if next_match_winner != None:
        cancel_winner(next_match_id)

def delete_tables():
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    cursor.execute(f"DELETE FROM DoYangs")
    cursor.execute(f"DELETE FROM Categories")
    cursor.execute(f"DELETE FROM Competitors")
    cursor.execute(f"DELETE FROM Matches")
    cursor.execute(f"DELETE FROM Judges")

    connection.commit()
    connection.close()

def get_all_judges():
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    judges = cursor.execute(f"""
        SELECT 
            j.JudgeID, j.Login, j.Role, j.DoYangID, IFNULL(d.Name, "Выберите площадку")
        FROM 
            Judges j
        LEFT JOIN
            DoYangs d ON j.DoYangID = d.DoYangID
    """)

    judges = judges.fetchall()

    connection.commit()
    connection.close()

    return judges

def delete_judge(id):
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    cursor.execute(f"""
        DELETE FROM Judges
        WHERE 
            JudgeID = {id}
    """) 

    connection.commit()
    connection.close() 

def change_judge(judge_id, doyang_id, role_id):
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    cursor.execute(f"""
        UPDATE Judges
        SET
            DoYangID = {doyang_id}, Role = '{role_id}'
        WHERE 
            JudgeID = {judge_id}
    """) 

    connection.commit()
    connection.close() 

def get_judge_password(login):
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    password_role = cursor.execute(f"""
        SELECT Password, Role FROM Judges WHERE Login = '{login}'
    """).fetchall()

    connection.commit()
    connection.close() 

    if len(password_role) > 0:
        return password_role[0][0], password_role[0][1]

    else:
        return "", ""