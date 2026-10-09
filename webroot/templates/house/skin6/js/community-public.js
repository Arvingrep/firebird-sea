$(function(){
	$(".mobile_kf #qrcode").qrcode({
		render: window.applicationCache ? "canvas" : "table",
		width: 74,
		height: 74,
		text: huoniao.toUtf8(window.location.href)
	});
	//收藏
	$(".btnSc").bind("click", function(){
		var t = $(this), type = "add", oper = "+1", txt = "已收藏";

		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			huoniao.login();
			return false;
		}

		if(!t.hasClass("btnYsc")){
			t.addClass("btnYsc");
		}else{
			type = "del";
			t.removeClass("btnYsc");
			oper = "-1";
			txt = "收藏";
		}

		var $i = $("<b>").text(oper);
		var x = t.offset().left, y = t.offset().top;
		$i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#f1370b"});
		$("body").append($i);
		$i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
			$i.remove();
		});

		t.html("<i></i>"+txt);

		$.post("/include/ajax.php?service=member&action=collect&module=house&temp=community_detail&type="+type+"&id="+pageData_.id);

	});

    //举报
    $(".btnJb").bind("click", function(){

        var domainUrl = masterDomain;
        $.dialog({
            fixed: false,
            title: "房源举报",
            content: 'url:'+domainUrl+'/complain-house-sale-'+pageData_.id+'.html',
            width: 460,
            height: 300
        });
    });

	//增加浏览历史
  var house_community_history = $.cookie(cookiePre+'house_community_history');
  if (house_community_history == null) house_community_history = "";
  if (house_community_history.indexOf(pageData_.id) == -1) {
  	if (house_community_history.length > 0) {
  		house_community_history += ':'+pageData_.id;
  	} else {
  		house_community_history += pageData_.id;
  	}
  	if (house_community_history.length > 128) {
  		var pos = house_community_history.indexOf(':');
  		house_community_history = house_community_history.substr(pos + 1);
  	}
  	$.cookie(cookiePre+'house_community_history', house_community_history, {expires: 365, domain: masterDomain.replace("http://", "").replace("https://", "").replace("https://", ""), path: '/'});
  }
})

