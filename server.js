var express = require('express');
var app = express();
app.use(express.static('./'));
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(3000);
var mysql = require('mysql');

var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "mydb"
});

con.connect(function(err) {
	// 	con.query("CREATE TABLE sanpham (id INT AUTO_INCREMENT PRIMARY KEY, brand VARCHAR(255), name VARCHAR(255), price INT, info VARCHAR(255), image VARCHAR(255))",
	// 	function(err, result){
	// 	console.log('Created!!!')
	// });

	// 	con.query("DROP TABLE sanpham", function(err, result){
	// 	console.log('Removed!!!');
	// });
});

io.on('connection', function(socket){
	socket.on('send-data', function(data){
		con.query("INSERT INTO sanpham (brand,name,price,info,image) VALUES ('"+data.brand+"','"+data.name+"','"+data.price+"','"+data.info+"','"+data.img+"')", function(err, result){});
		console.log("Added!!!");
	});
});

app.get('/', function(req, res){
	res.sendFile('index.html');
});