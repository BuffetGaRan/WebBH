// var socket = io();

$(() => {
	
	// Chat windows
	$('.header-chat').click(function(){
		if($('.chat').css('bottom') == '-300px'){
			$('.chat').css('bottom','0');
		}
		else{
			$('.chat').css('bottom','-300px');
		}
	});


	// Scroll Top
	$(window).scroll(function(){
		if($(window).scrollTop() > 100){
			$('.scroll').css('visibility','visible')
		}
		else{
			$('.scroll').css('visibility','hidden')
		}
	});


	//Xóa sản phẩm
	$(".fa-trash-alt").click(function() {
	    var $row = $(this).closest("tr");
	    var $text = $row.find(".del-product-send").text();
	    socket.emit('send-del-product', $text);
	});


	//Sửa sản phẩm
	$(".fa-retweet").click(function() {
	    var $row = $(this).closest("tr");
	    var $text = $row.find(".repair-product-send").text();
	    $('#repair-product').attr('value',$text);
	});


	// $('#plus-image').change(function(e){
 //        var image = $('#plus-image').val().split('\\').pop();
 //         $('#btn-confirm').click(function(){
 //         	socket.emit('send-data',{brand : $('#brand-product').val(), name : $('#name-product').val(), price : $('#price-product').val(), info : $('#info-product').val(), img : image});
 //    	});
 //    });
});