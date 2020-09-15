var socket = io('http://localhost:3000');

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

	$('#plus-image').change(function(e){
        var image = $('#plus-image').val().split('\\').pop();
         $('#btn-confirm').click(function(){
         	socket.emit('send-data',{brand : $('#brand-product').val(), name : $('#name-product').val(), price : $('#price-product').val(), info : $('#info-product').val(), img : image});
    	});
    });
});