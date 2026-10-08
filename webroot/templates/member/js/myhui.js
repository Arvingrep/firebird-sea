$(function(){

	 $(".grade").slide({mainCell:".g_ul", autoPage:true, effect:"left", autoPlay:false, vis:4, trigger:"click",prevCell:".prev1", nextCell:".next1",pnLoop:false,});
	 $(".container_box .hui_box").slide({mainCell:"ul", autoPage:true, effect:"left", autoPlay:false, vis:3, pnLoop:false,prevCell:".prev_1", nextCell:".next_1",trigger:"click"});

	 $(".grade li").click(function(){
		 var t = $(this),index = t.index();
		 var level = $(".xf_btn").attr('data-id');
		 console.log(level,index)
		 if((index+1)==level){
			 $(".pop_page>h2").text("会员续费");
		 }else{
			  $(".pop_page>h2").text("开通会员");
		 }
		 t.addClass("active").siblings("li").removeClass("active");
		  $(".container_box .hui_box").eq(index).addClass("show").siblings(".hui_box").removeClass("show");

	 });


	 // xufei
	 $(".xf_btn").click(function(){
		 var t = $(this),
		 level = t.attr('data-id');
		 $(".mask_pop,.pop_page").show();
		 $('html').addClass("noscroll");

	 });

	 $(".close_btn,.mask_pop").click(function(){
		  $(".mask_pop,.pop_page").hide();
		  $('html').removeClass("noscroll");
	 });


	 // 开通
	 $(".open").click(function(){
		 var t = $(this),p = t.parents("li");
		  price = p.attr('data-count');
		  level = p.attr('data-level');
		  day =  p.attr('data-time');

		  $.ajax({
		      url: '/include/ajax.php?service=member&action=upgrade&check=1',
		      data: {
		        amount  : price,
				level   : level,
				day     : day,
				daytype : 'month',
				paytype : 'wxpay',
				final	:  0
		      },
		      type: 'post',
		      dataType: 'json',
		      success: function(data){
		  		if(data && data.state == 100){
	  				console.log(data.info);
	  				window.location.href = data.info;
	  			}else{
					alert(data.info);
				}
		  	 },
		  	error: function(){

		  	}
		  });
	 })
})
