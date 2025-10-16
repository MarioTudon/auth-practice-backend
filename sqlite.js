import sqlite3 from 'sqlite3'

const db = new sqlite3.Database('./models/users.db')

db.run(`DROP TABLE messages`, (err) => {
  if (err) console.log(err)
})