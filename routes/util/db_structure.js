var mysql=require('mysql');
var pool=mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: ''
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
    'password': ''
})
module.exports={
    pool:pool,
    querydb:querydb,
    'connection': {
        'host': 'localhost',
        'user': 'root',
        'password': ''
    },
    'database': 'noteshare',
    'users_table': 'user'
};