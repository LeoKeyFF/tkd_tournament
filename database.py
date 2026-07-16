import json
import sqlite3

database_path = "database.db"

def add_doyang(name):
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()
    cursor.execute(
        f"CREATE TABLE IF NOT EXISTS DoYangs ( DoYangID INTEGER PRIMARY KEY," 
          "Name varchar(255)"
        ")"
    )
    message = f"INSERT INTO DoYangs (Name) VALUES ('{name}')"
    cursor.execute(message)

    connection.commit()
    connection.close()

def add_category(name, doyang_id_current):
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()
    cursor.execute(
        f"CREATE TABLE IF NOT EXISTS Categories ( CategoryID INTEGER PRIMARY KEY," 
          "Name varchar(255),"
          "DoYangID INT"
        ")"
    )
    message = f"INSERT INTO Categories (Name, DoYangID) VALUES ('{name}', {doyang_id_current})"
    cursor.execute(message)

    connection.commit()
    connection.close()

def add_competitor(name, club):
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()
    cursor.execute(
        f"CREATE TABLE IF NOT EXISTS Competitors ( CompetitorID INTEGER PRIMARY KEY," 
          "Name varchar(255),"
          "Club varchar(255)"
        ")"
    )
    message = f"INSERT INTO Competitors (Name, Club) VALUES ('{name}', '{club}')"
    cursor.execute(message)

    connection.commit()
    connection.close()

def get_from_doyangs():
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    doyangs = cursor.execute(f"SELECT DoYangID, Name FROM DoYangs")
    doyangs = doyangs.fetchall()
    print(doyangs)
    return doyangs

def get_from_categories():
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()

    categories = cursor.execute(f"SELECT CategoryID, Name, DoYangID FROM Categories")
    categories = categories.fetchall()
    print(categories)
    return categories