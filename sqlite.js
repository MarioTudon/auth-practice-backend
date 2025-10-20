import sqlite3 from 'sqlite3'

const db = new sqlite3.Database('./models/users.db')

db.run(`DELETE FROM refresh_tokens
`, (err) => {
  if (err) console.log(err)
})

db.run(`DELETE FROM users
`, (err) => {
  if (err) console.log(err)
})