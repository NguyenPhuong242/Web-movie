"use strict";

const fs = require('fs');
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

const createTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY,
    title TEXT,
    year INTEGER,
    actors TEXT,
    plot TEXT,
    poster TEXT
  );
`);

createTable.run();


exports.load = function (filename) {
  const movies = JSON.parse(fs.readFileSync(filename));
  let insert = db.prepare('INSERT INTO movies VALUES (?, ?, ?, ?, ?, ?)');
  let clear_and_insert_many = db.transaction((movies) => {
    db.prepare('DELETE FROM movies').run();
    for (let id of Object.keys(movies)) {
      const movie = movies[id];
      insert.run(movie.id, movie.title, movie.year, movie.actors, movie.plot, movie.poster);
    }
  });
  clear_and_insert_many(movies);
  return true;
};

exports.save = function (filename) {
  let movie_list = db.prepare('SELECT * FROM movies ORDER BY id').all();
  let movies = {};
  for (let movie of movie_list) {
    movies[movie.id] = movie;
  }
  fs.writeFileSync(filename, JSON.stringify(movies));
};

exports.list = function () {
  return db.prepare('SELECT * FROM movies ORDER BY id').all();
};

exports.create = function (title, year, actors, plot, poster) {
  const insert = db.prepare('INSERT INTO movies (title, year, actors, plot, poster) VALUES (?, ?, ?, ?, ?)');
  const info = insert.run(title, year, actors, plot, poster);
  return info.lastInsertRowid;
};

exports.read = function (id) {
  return db.prepare('SELECT * FROM movies WHERE id = ?').get(id);
};

exports.update = function (id, title, year, actors, plot, poster) {
  const update = db.prepare('UPDATE movies SET title = ?, year = ?, actors = ?, plot = ?, poster = ? WHERE id = ?');
  update.run(title, year, actors, plot, poster, id);
  return true;
};

exports.delete = function (id) {
  const deleteMovie = db.prepare('DELETE FROM movies WHERE id = ?');
  deleteMovie.run(id);
  return true;
};






