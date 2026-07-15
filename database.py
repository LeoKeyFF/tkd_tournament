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

