var mysql=require('mysql');
var pool=mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root'
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
    'password': 'root'
})
module.exports={
    pool:pool,
    querydb:querydb,
    'connection': {
        'host': 'localhost',
        'user': 'root',
        'password': 'root'
    },
    'database': 'noteshare',
    'users_table': 'user'
};