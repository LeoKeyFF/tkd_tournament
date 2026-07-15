import json
import sqlite3

database_path = "database.db"

def add_doyang():
    connection = sqlite3.connect(database_path)
    cursor = connection.cursor()
    cursor.execute(
        f"CREATE TABLE IF NOT EXISTS DoYangs ( DoYangID INTEGER PRIMARY KEY," 
          "DoYangNumber INT"
        ")"
    )
    connection.commit
    connection.close