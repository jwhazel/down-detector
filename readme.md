## DATABASE SCHEMA
Uses SQLITE3
`CREATE TABLE data(id INTEGER PRIMARY KEY AUTOINCREMENT, status text, response_time text, check_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL);`