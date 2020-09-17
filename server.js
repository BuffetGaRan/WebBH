const express = require('express');
const app = express();
const multer = require('multer');
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

var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "mydb"
});

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

var uploadFile = multer({storage: diskStorage}).single("file");

app.post("/upload", (req, res) => {

  	// Thực hiện upload file, truyền vào 2 biến req và res
  	uploadFile(req, res, (error) => {

	    // Nếu có lỗi thì trả về lỗi cho client.
	    // Ví dụ như upload một file không phải file ảnh theo như cấu hình của mình bên trên
	    if (error) {
	    	return res.send(`Error when trying to upload: ${error}`);
	    }

	    console.log('Added!!!');

	    var body = req.body;
	    var brand = body.brand;
	    var name = body.name;
	    var price = body.price;
	    var info = body.info;
	    var file = req.file.path;

	    con.query("INSERT INTO sanpham (brand,name,price,info,image) VALUES ('"+brand+"','"+name+"','"+price+"','"+info+"','"+file+"')", function(err, result){});
	    console.log("complete");
	    // app.get('/', (req,res)=>{
	    // 	res.sendFile('index.html');
	    // })

	    // Không có lỗi thì lại render cái file ảnh về cho client.
	    // Đồng thời file đã được lưu vào thư mục uploads
	    // res.sendFile(path.join(`${__dirname}/uploads/${req.file.filename}`));
	});
	res.render('uploaded');
});

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

con.connect(function(err) {
	// 	con.query("CREATE TABLE sanpham (id INT AUTO_INCREMENT PRIMARY KEY, brand VARCHAR(255), name VARCHAR(255), price INT, info VARCHAR(255), image VARCHAR(255))",
	// 	function(err, result){
	// 	console.log('Created!!!')
	// });

	// 	con.query("DROP TABLE sanpham", function(err, result){
	// 	console.log('Removed!!!');
	// });
});

// io.on('connection', function(socket){
// 	socket.on('send-data', function(data){
// 		con.query("INSERT INTO sanpham (brand,name,price,info,image) VALUES ('"+data.brand+"','"+data.name+"','"+data.price+"','"+data.info+"','"+data.img+"')", function(err, result){});
// 		console.log("Added!!!");
// 	});
// });

app.get('/', function(req, res){
	res.render('index');
});