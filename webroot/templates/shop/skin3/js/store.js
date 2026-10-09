$(function(){

    //导航全部分类
    // $(".lnav").find('.category-popup').hide();

    // $(".lnav").hover(function(){
    //     $(this).find(".category-popup").show();
    // }, function(){
    //     $(this).find(".category-popup").hide();
    // });

	//左侧和右侧一样高
	$(".pp-left").height($(".pp-right").height()-2);

	//销量，人气，价格
	$(".pp-right .select span.left,.selectX span.left").hover(function(){
		var $this=$(this);
		$this.find("ul").show();
	},function(){
		var $this=$(this);
		$this.find("ul").hide();
	});


	//左右分页
	$("#totalPage").html(totalPage);
	if(totalPage > 1){
		$(".right").css("display","inline-block");
		if(atPage == 1){
			$(".right .pre").addClass("on");
		}else{
			$(".right .pre").attr("href", pageUrl.replace("%page%", atPage - 1));
		}
		if(atPage == totalPage){
			$(".right .next").addClass("on");
		}else{
			$(".right .next").attr("href", pageUrl.replace("%page%", atPage + 1));
		}
	}


	//商家列表详情

	$(".hot ul li").hover(function(){
		$li=$(this);
		$li.find("p").addClass("on");
		$li.siblings("li").find("p").removeClass("on");
		$li.find("dl").addClass("on");
		$li.siblings("li").find("dl").removeClass("on");
	})


		//商品列表--品牌选择
	$(".selCon s").on("click",function(){
		var $pp=$(this);
		$pp.toggleClass("on");
		$pp.siblings("p").toggleClass("on");
	})

});
