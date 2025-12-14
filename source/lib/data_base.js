const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// direccion desde donde va a dirigir el scripts de la base de datos 
const DB_PATH = path.resolve(process.cwd(), 'Data_base_web.db');

const db = new sqlite3.Database(DB_PATH, (error) => {
  if (error) console.error('Error abriendo la base de datos :', error.message);
});

// serializo la ejecucion devolviendo los modelos que voy a usar luego 
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) return reject(error);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => (error ? reject(error) : resolve(row)));
  });
}
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => (error ? reject(error) : resolve(rows)));
  });
}
// exportamos para poder utilizar 
module.exports = { run, get, all };