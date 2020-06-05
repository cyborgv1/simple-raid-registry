var mysql = require('mysql');

var pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "not_a_real_user",
  password: "fake_password",
  database: "definitely_fake_database"
});
pool.getConnection(function(err) {
    if (err) throw err;
});
dateStrings:true
module.exports = pool;
