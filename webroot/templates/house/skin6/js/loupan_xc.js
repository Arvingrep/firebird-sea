var winWid = $(window).width(), cc = 9;
cc = winWid > 1240 ? cc : 7;
var page = Math.floor(at/cc);

$(function(){

	//左右切换按钮显示、隐藏
	$(".xc-big").hover(function(){
		$(this).find(".l, .r").show();
	}, function(){
		$(this).find(".l, .r").hide();
	});

	loadImgList(page);

	//上一页
	$(".sl").bind("click", function(){
		if((page+1) > 1){
			at = page+1;
			page--;

			loadImgList(page);
				
			$(".xc-thumb li").removeClass("curr");
			$(".xc-thumb li:last").addClass("curr");

			var src = $(".xc-thumb li:last").attr("data-big"), txt = $(".xc-thumb li:last").attr("data-txt"), index = $(".xc-thumb li:last").attr("data-index");
			$(".big img").attr("src", src);
			$(".big").attr("href", src);
			$(".info p").html(txt);
			printCount(index);
		}
	});
	
	//下一页
	$(".sr").bind("click", function(){
		if((page+1)*cc < pics.length){
			at = (page+1)*cc;
			page++;
		}else{
			at = 0;
			page = 0;
		}
		loadImgList(page);
	});
	
	//上一张
	$(".prev").bind("click", function(){
		var index = $(".xc-thumb .curr").index();
		if(index == 0){
			$(".sl").click();
		}else{
			$(".xc-thumb .curr").prev("li").click();
		}
	});
	
	//下一张
	$(".next").bind("click", function(){
		var index = $(".xc-thumb .curr").index();
		if(index == $(".xc-thumb li").length-1){
			$(".sr").click();
		}else{
			$(".xc-thumb li.curr").next("li").click();
		}
	});
	
	//左右键盘
	$(document).keydown(function(event){
		if(event.keyCode == 37) {
			$(".prev").click();
			event.preventDefault();
		}else if(event.keyCode == 39) {
			$(".next").click();
			event.preventDefault();
		}
	});	
	
	//点击图集列表
	$(".xc-thumb").delegate("li", "click", function(){
		var t = $(this), src = t.attr("data-big"), txt = t.attr("data-txt");
		if(src && !t.hasClass("curr")){
			t.siblings("li").removeClass("curr");
			t.addClass("curr");
			$(".big img").attr("src", src);
			$(".big").attr("href", src);
			$(".info p").html(txt);
			printCount(t.attr("data-index"));
		}
	});

	//加载图片
	function loadImgList(page){
		if(pics && pics.length > 0){
			var f = 0, ul = $(".xc-thumb ul");
			var a = at ? at : 0;
			ul.html("");
			for(i = page*cc; i < pics.length; i++){
				if(f >= cc){
					return;
				}
				var cla = "";
				if(a == i){
					cla = " class='curr'";
					$(".big img").attr("src", pics[i]['big']);
					$(".big").attr("href", pics[i]['big']);
					$(".info p").html(pics[i]['txt']);
					printCount(i);
				}
				ul.append('<li'+cla+' data-big="'+pics[i]['big']+'" data-txt="'+pics[i]['txt']+'" data-index="'+i+'"><s></s><img src="'+pics[i]['small']+'" /></li>');
				f++;
			}
		}
	}

	//显示页码
	function printCount(i){
		$(".count").html((Number(i)+1)+'/'+pics.length);
	}

});