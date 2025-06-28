import Database from "better-sqlite3";

const db = new Database("app.db");

async function initDB() {
  const tableName = "users";
  const botSettingsTable = "botSettings";
  const tableExists = `SELECT * FROM ${tableName}`;
  const botSettingsExists = `SELECT * FROM ${botSettingsTable}`;

  //   Creating new table if it dosent exists already
  try {
    db.exec(tableExists);
  } catch {
    const query = `CREATE TABLE ${tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT,ign varchar(48), addedBy varchar(48), puuid varchar(78))`;
    db.exec(query);
  }

  try {
    db.exec(botSettingsExists);
  } catch {
    const query = `CREATE TABLE ${botSettingsTable} (id INTEGER PRIMARY KEY AUTOINCREMENT,channel varchar(48))`;
    db.exec(query);
  }

  return db;
}

export default initDB;
