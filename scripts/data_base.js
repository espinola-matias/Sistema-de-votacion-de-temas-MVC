const sqlite3 = require("sqlite3").verbose();

// Crear o abrir la base de datos
const db = new sqlite3.Database("Data_base_web.db", (error) => {
  if (error) {
    console.error("Error al abrir la base de datos:", error.message);
  } else {
    console.log("Conectado a la base de datos");
  }
});

db.serialize(() => {
  // para habilitar las claves foraneas 
  db.run("PRAGMA foreign_keys = ON");

  // y las generacion de mis tablas 
  db.run(`
    CREATE TABLE IF NOT EXISTS Topic (
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT NOT NULL DEFAULT '',
      autor TEXT NOT NULL DEFAULT 'Anonimo',
      votes INTEGER NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Link (
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'Anonimo',
      description TEXT NOT NULL DEFAULT '',
      votes INTEGER NOT NULL DEFAULT 0,
      topicId INTEGER NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_topic FOREIGN KEY (topicId)
        REFERENCES Topic (id) ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS VoteTopic (
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      sid TEXT NOT NULL,
      topicId INTEGER NOT NULL,
      CONSTRAINT fk_topic_vote FOREIGN KEY (topicId)
        REFERENCES Topic (id) ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS VoteLink (
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      sid TEXT NOT NULL,
      linkId INTEGER NOT NULL,
      CONSTRAINT fk_link_vote FOREIGN KEY (linkId)
        REFERENCES Link (id) ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  // indices unicos para evitar que voten una y otra vez , es otro chequeo mas aparte de la logica 
  db.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS VoteTopic_sid_topicId_key 
    ON VoteTopic(sid, topicId)
  `);

  db.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS VoteLink_sid_linkId_key 
    ON VoteLink(sid, linkId)
  `);

  // Trigger para updatedAt en Topic
  db.run(`
    CREATE TRIGGER IF NOT EXISTS update_Topic_timestamp
    AFTER UPDATE ON Topic
    FOR EACH ROW
    BEGIN
      UPDATE Topic SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
  `);

  // Trigger para updatedAt en Link
  db.run(`
    CREATE TRIGGER IF NOT EXISTS update_Link_timestamp
    AFTER UPDATE ON Link
    FOR EACH ROW
    BEGIN
      UPDATE Link SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
  `);

  console.log("todo se ejecuto correctamente");
});

// Cerrar la base 
db.close((error) => {
  if (error) {
    console.error("Error al cerrar la base:", error.message);
  } else {
    console.log("Conexion cerrada");
  }
});