$(function(){
	$(".anli_wrap ul li:nth-child(4n)").css("margin-right","0");
	$(".team_ul li:nth-child(4n)").css("margin-right","0");
    //滚动
    scrollTopFn(4, ".scrolldiv li");
	function scrollTopFn(num,selc) {
		var curNum = $(selc).length;
		if(curNum > num) {
			var SD=24,
				myScroll,
				tardiv = document.getElementById('scrolldiv'),
				tardiv1 = document.getElementById('scroll1'),
				tardiv2 = document.getElementById('scroll2');

			tardiv2.innerHTML=tardiv1.innerHTML;
			function Marquee2(){
				if(tardiv2.offsetTop-tardiv.scrollTop<=0)
					tardiv.scrollTop-=tardiv1.offsetHeight;
				else{
					tardiv.scrollTop++;
				}
			}
			myScroll=window.setInterval(Marquee2,24); ;
			tardiv.onmouseover=function() {clearInterval(myScroll)};
			tardiv.onmouseout=function() {myScroll=setInterval(Marquee2,SD)};
		}
	}
	//免费设计 在线报切换
    $('.free_tab li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.lr_right .con').eq(i).addClass('con_show').siblings().removeClass('con_show');
    });
   	

	//团队立即预约
	$('.ar_order').click(function(){
		$('.team_mask').show();
		var team_man=$(this).parents('li').find('.ar_name a').text();
		$('.team_man').text(team_man);

		$("#userid").val($(this).attr("data-id"))
		$("#type").val($(this).attr("data-type"))
	})
	//广告位切换
	// 焦点图
    $(".slideBox1").slide({titCell:".hd ul",mainCell:".bd",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>",prevCell:".prev",nextCell:".next"});
    

})
