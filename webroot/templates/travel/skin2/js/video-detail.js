$(function(){
	$(".video-list li:nth-child(2n)").css('margin-right','0');
	//关注
	$('.inforight').on('click','.btn_care',function(){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			window.location.href = masterDomain+'/login.html';
			return false;
		}
		
		if($(this).hasClass('cared')){
			$(this).html(langData['travel'][6][11]);   //关注
			$(this).removeClass('cared')
		}else{
			$(this).html(langData['travel'][6][12]);  //已关注
			$(this).addClass('cared')
		}

		var mediaid = $(this).attr("data-id");

		$.post("/include/ajax.php?service=member&action=followMember&id="+mediaid);
	});

})
