import sqlite3 from 'sqlite3'

const db = new sqlite3.Database('./models/users.db')

db.get(`DELETE FROM users`, (err,row) => {
    if(err) {
      console.log(err)
    }
})