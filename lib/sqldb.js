'use strict';

const qsql = require('q-sqlite3')
    , Q = require('q');

class SqlDb{
  constructor(dbPath){
    this.path = dbPath;
    this.db = null;
  }

  get(){
    let that = this;
    return (this.db
      ? Q(this.db)
      : qsql.createDatabase(this.path).then(d => Q(that.db = d)));
  }
};

module.exports = SqlDb;
