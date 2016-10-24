'use strict';

const qsql = require('q-sqlite3')
    , Q = require('q')
    , path = require('path');

class SqlDb{
  constructor(){
    let dbPath = path.join(__dirname, '../db/clients.sqlite3');
    this.path = dbPath;
    this.db = null;
  }
  get(){
    let that = this;
    return (this.db
      ? Q(this.db)
      : qsql.createDatabase(this.path).then(d => Q(that.db = d)));
  }
  select(table, where){
    let where_a = Object.keys(where)
      .map(k => ([k, where[k]]));
    let where_s = (where_a?' WHERE ':'') + where_a.map(i => `${i[0]} = ?`);
    let query = `SELECT * FROM ${table} ${where_s}`;
    let args = [query].concat(where_a.map(i => i[1]));
    return this.get()
      .then(d => d.all.apply(d, args));
  }
};

module.exports = SqlDb;
