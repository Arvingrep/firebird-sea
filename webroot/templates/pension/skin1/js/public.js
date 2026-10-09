$(function(){

	$('.orderby_head ul li').click(function(){
		// $(this).toggleClass('active').siblings().removeClass('active')
		// $(this).toggleClass('curr');
	})

	$(".list_container li.org_li").mouseenter(function() {
		//stop()方法来停止重复动画
		$(".list_container li.org_li").children(".hide_content").stop(true,false).slideUp();
        $(this).children(".hide_content").stop(true,false).slideDown();
    	}
     )

	//收藏
	$(".store-btn").bind("click", function(){
		var t = $(this), type = "add", oper = "+1", txt = "已收藏";

		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			huoniao.login();
			return false;
		}

		if(!t.hasClass("curr")){
			t.addClass("curr");
		}else{
			type = "del";
			t.removeClass("curr");
			oper = "-1";
			txt = "收藏";
		}

		var $i = $("<b>").text(oper);
		var x = t.offset().left, y = t.offset().top;
		$i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
		$("body").append($i);
		$i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
			$i.remove();
		});

		t.children('button').html("<em></em><i></i>"+txt);

		$.post("/include/ajax.php?service=member&action=collect&module=pension&temp=store-detail&type="+type+"&id="+infoData.id);

	});

});


//数量错误提示
var errmsgtime;
function errmsg(div,str){
	$('#errmsg').remove();
	clearTimeout(errmsgtime);
	var top = div.offset().top - 33;
	var left = div.offset().left;

	var msgbox = '<div id="errmsg" style="position:absolute;top:' + top + 'px;left:' + left + 'px;height:30px;line-height:30px;text-align:center;color:#f76120;font-size:14px;display:none;z-index:99999;background:#fff;">' + str + '</div>';
	$('body').append(msgbox);
	$('#errmsg').fadeIn(300);
	errmsgtime = setTimeout(function(){
		$('#errmsg').fadeOut(300, function(){
			$('#errmsg').remove()
		});
	},2000);
};
