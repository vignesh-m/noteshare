var mysql=require('mysql');
var pool=mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root'
});

module.exports={
    pool:pool
}