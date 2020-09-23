const express = require('express');
const app = express();
const multer = require('multer');
const session = require('express-session');
const bodyParser = require('body-parser');
const pug = require('pug');
const mysql = require('mysql');
const http = require('http').Server(app);
const io = require('socket.io')(http);


http.listen(3000);
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./'));
app.set('views','./views');
app.set('view engine', 'pug');


//Config Session
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));


//Kết nối Database
var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "mydb"
});


//Xử lý ảnh
var diskStorage = multer.diskStorage({
	destination: (req, file, callback) => {
    // Định nghĩa nơi file upload sẽ được lưu lại
    callback(null, "ImgVid");
	},
	filename: (req, file, callback) => {
	    // ở đây các bạn có thể làm bất kỳ điều gì với cái file nhé.
	    // Mình ví dụ chỉ cho phép tải lên các loại ảnh png & jpg
	    var math = ["image/png", "image/jpeg"];
	    if (math.indexOf(file.mimetype) === -1) {
	    	var errorMess = `The file <strong>${file.originalname}</strong> is invalid. Only allowed to upload image jpeg or png.`;
	    	return callback(errorMess, null);
	    }

	    // Tên của file thì mình nối thêm một cái nhãn thời gian để đảm bảo không bị trùng.
	    let filename = `${Date.now()}-webbh-${file.originalname}`;
	    callback(null, filename);
	}
});


//Chọn name của file ảnh xử lý
var uploadFile = multer({storage: diskStorage}).single("file");


//Upload sản phẩm
app.post("/upload", (req, res) => {

  	// Thực hiện upload file, truyền vào 2 biến req và res
  	uploadFile(req, res, (error) => {

	    // Nếu có lỗi thì trả về lỗi cho client.
	    // Ví dụ như upload một file không phải file ảnh theo như cấu hình của mình bên trên
	    if (error) {
	    	return res.send(`Error when trying to upload: ${error}`);
	    }

	    var body = req.body;
	    var brand = body.brand;
	    var name = body.name;
	    var price = body.price;
	    var info = body.info;
	    var file = req.file.path;

	    con.query("INSERT INTO sanpham (brand,name,price,info,image) VALUES ('"+brand+"','"+name+"','"+price+"','"+info+"','"+file+"')", function(err, result){});
	    // console.log("complete");
	    // app.get('/', (req,res)=>{
	    // 	res.sendFile('index.html');
	    // })

	    // Không có lỗi thì lại render cái file ảnh về cho client.
	    // Đồng thời file đã được lưu vào thư mục uploads
	    // res.sendFile(path.join(`${__dirname}/uploads/${req.file.filename}`));

	    res.render('uploaded');
	});
});


//Sửa sản phẩm
app.post("/repair", (req, res) => {

  	// Thực hiện upload file, truyền vào 2 biến req và res
  	uploadFile(req, res, (error) => {

	    // Nếu có lỗi thì trả về lỗi cho client.
	    // Ví dụ như upload một file không phải file ảnh theo như cấu hình của mình bên trên
	    if (error) {
	    	return res.send(`Error when trying to upload: ${error}`);
	    }

	    var body = req.body;
	    var brand = body.brand;
	    var name = body.name;
	    var price = body.price;
	    var info = body.info;
	    var repair = body.repair;
	    var file = req.file.path;
	    con.query('UPDATE sanpham SET brand = "'+brand+'", name = "'+name+'", price = "'+price+'", info = "'+info+'", image = "'+file+'" WHERE name = "'+repair+'"', function(err, rows, fields){});

	    res.render('uploaded');
	});
});


//Xóa sản phẩm
io.on('connection', function(socket){
	socket.on('send-del-product', function(data){
		con.query('DELETE FROM sanpham WHERE name = "'+data+'"', function(err, rows, fields){});
	});
	console.log(socket.id);
});


//Show sản phẩm ra html
app.get('/', function(req, res) {
	var productList = [];

	// Do the query to get data.
	con.query('SELECT * FROM sanpham', function(err, result, fields) {
	  	if (err) {
	  		res.status(500).json({"status_code": 500,"status_message": "internal server error"});
	  	} else {
	  		// Loop check on each row
	  		for (var i = 0; i < result.length; i++) {

	  			// Create an object to save current row's data
		  		var product = {
		  			'brand':result[i].brand,
		  			'name':result[i].name,
		  			'price':result[i].price
		  		}
		  		// Add object into array
		  		productList.push(product);
	  	}

	  	// Render index.pug page using array 
	  	res.render('index', {"productList": productList});
	  	}
	});
});


//Mysql
con.connect(function(err) {
	// 	con.query("CREATE TABLE sanpham (id INT AUTO_INCREMENT PRIMARY KEY, brand VARCHAR(255), name VARCHAR(255), price INT, info VARCHAR(255), image VARCHAR(255))",
	// 	function(err, result){
	// 	console.log('Created!!!')
	// });

	// 	con.query("CREATE TABLE account (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255), password VARCHAR(255), class VARCHAR(255))",
	// 	function(err, result){
	// 	console.log('Created!!!')
	// });

	// 	con.query("DROP TABLE sanpham", function(err, result){
	// 	console.log('Removed!!!');
	// });
});


//Xử lý login
app.post('/admin', function(req, res) {

	var user = req.body.user;
	var password = req.body.password;

	if (user && password) {
		con.query('SELECT * FROM account WHERE email = ? AND password = ?', [user, password], function(err, results) {
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.user = user;
				res.redirect('/');
			} else {
				res.send('Sai tài khoản hoặc mật khẩu');
			}			
			res.end();
		});
	} else {
		res.send('Vui lòng ghi đủ tài khoản và mật khẩu');
		res.end();
	}
});


app.get('/', (req, res)=>{
	res.render('index');
});


app.get('/login', (req, res)=>{
	var a = 2;
	if(a == 2){
		res.render('login');
	}
});
