var express = require('express');
var app = express();
var multer = require('multer');
var bodyParser = require('body-parser');
var pug = require('pug');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./'));
app.set('views','./views');
app.set('view engine', 'pug');
// var server = require('http').Server(app);
// var io = require('socket.io')(server);
app.listen(3000);
var mysql = require('mysql');

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
	    console.log(body);

	    con.query("INSERT INTO sanpham (brand,name,price,info,image) VALUES ('"+brand+"','"+name+"','"+price+"','"+info+"','"+file+"')", function(err, result){});
	    console.log("complete");
	    // app.get('/', (req,res)=>{
	    // 	res.sendFile('index.html');
	    // })

	    // Không có lỗi thì lại render cái file ảnh về cho client.
	    // Đồng thời file đã được lưu vào thư mục uploads
	    // res.sendFile(path.join(`${__dirname}/uploads/${req.file.filename}`));
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
	res.sendFile('index.html');
});

app.get('/users', function(req, res){
	res.render('index');
});