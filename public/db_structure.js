var mysql=require('mysql');
var password='root';
var pool=mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password'
});
function querydb(querystring,callback){
    pool.getConnection(function(err, connection) {
        // Use the connection
        connection.query(querystring, function(err, rows,fields) {
            callback(rows);
            connection.release();
        });
    });
}
var connection = mysql.createConnection({
    'host': 'localhost',
    'user': 'root',
    'password': 'password'
});
module.exports={
    pool:pool,
    querydb:querydb,
    'connection': {
        'host': 'localhost',
        'user': 'root',
        'password': 'password'
    },
    'database': 'noteshare',
    'users_table': 'user'
};