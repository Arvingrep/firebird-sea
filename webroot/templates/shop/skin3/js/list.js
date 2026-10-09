$(function(){
    //导航全部分类
    $(".lnav").find('.category-popup').hide();

    $(".lnav").hover(function(){
        $(this).find(".category-popup").show();
    }, function(){
        $(this).find(".category-popup").hide();
    });

    // 鼠标经过产品列表
    $('.content .list li').hover(function () {
		$(this).find('p').hide();
        $(this).find('i').addClass('show');
    },function () {
        $(this).find('p').show();
        $(this).find('i').removeClass('show');
    });

  //销量，人气，价格
	$(".pp-right .select span.left,.selectX span.left").hover(function(){
		var $this=$(this);
		$this.find("ul").show();
	},function(){
		var $this=$(this);
		$this.find("ul").hide();
	});

  //搜索
  $("#search").bind("click", function(){

    var price1 = $.trim($("#price1").val()), price2 = $.trim($("#price2").val());
    var price = [];
    if(price1 != "" || price2 != ""){
      if(price1 != ""){
        price.push(price1);
      }
      price.push(",");
      if(price2 != ""){
        price.push(price2);
      }
    }

    location.href = priceUrl.replace("pricePlaceholder", price.join(""));

  });

  //回车提交
  $(".price input").keyup(function (e) {
		if (!e) {
			var e = window.event;
		}
		if (e.keyCode) {
			code = e.keyCode;
		}
		else if (e.which) {
			code = e.which;
		}
		if (code === 13) {
			$("#search").click();
		}
	});


  //左右分页
	$("#totalPage").html(totalPage);
	if(totalPage > 1){
		$(".right").show();
		if(atPage == 1){
			$(".right .pre").addClass("on");
		}else{
			$(".right .pre").attr("href", pageUrl.replace("pagePlaceholder", atPage - 1));
		}
		if(atPage == totalPage){
			$(".right .next").addClass("on");
		}else{
			$(".right .next").attr("href", pageUrl.replace("pagePlaceholder", atPage + 1));
		}
	}


});
