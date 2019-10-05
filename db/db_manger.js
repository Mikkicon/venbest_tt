const sqlite = require("sqlite3").verbose();

const db = new sqlite.Database(
  "/Users/mp/JSProjects/venbest_tt/db/database.db",
  sqlite.OPEN_READWRITE,
  err => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Connected to the database.");
    }
  }
);

const initDb = () =>
  db.serialize(() => {
    db.run(
      "CREATE TABLE IF NOT EXISTS user(user_id integer, email text, pwd text)"
    );
    let preparedDb = db.prepare(
      "INSERT INTO user(user_id,email,pwd) VALUES (?,?,?)"
    );

    for (var i = 0; i < 10; i++) {
      preparedDb.run(i, `mail@email${i}.com`, i + "fdsa");
    }
    preparedDb.finalize();
    db.each("SELECT * FROM user", console.log);
  });

const getUser = email => {
  return new Promise((res, rej) =>
    db.serialize(() => {
      db.get(`SELECT * FROM user WHERE email=?`, email, (err, row) =>
        err ? console.log("Couldn't get user from DB: \n\r", err) : res(row)
      );
    })
  );
};
module.exports = { initDb, getUser };
