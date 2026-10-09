$(function () {
		// console.log($(".part_thr").offset().top);
		
		$('.bd a.go_detail').attr('href',$('.hd li.curr').attr('data-url'));
		$('.bd .codeBox .code img').attr('src',masterDomain+"/include/qrcode.php?data="+$('.hd li.curr').attr('data-url'));
		$('.bd .codeBox h2').text($('.hd li.curr').attr('data-tit'));
    //广告轮播
    $(".fir_l_top #slideBox").slide({mainCell:".bd ul",effect:"left",easing:"easeOutCirc",delayTime:600,
        autoPlay:true,
        autoPage:'<li></li>', titCell: '.hd ul'});
    $(".fir_m_adBox #slideBox2").slide({mainCell:".bd ul",effect:"left",easing:"easeOutCirc",delayTime:650,
        autoPlay:true,
        autoPage:'<li></li>', titCell: '.hd ul'});
   
  /*
   //点击预约
    $('.fir_r_con .con_img .btn_appo').click(function () {
        var h1 = $(this).parents('.fir_r_con').offset().top;
        var h2 = $(this).parents('li').offset().top;
        var h = h2-h1+214;
        $('#appo_sec').attr('style','top:'+h+'px');
        $('#appo_sec').show();
        fadeOut();
    });
    function fadeOut(){
        setTimeout(function () {
            $('#appo_sec').fadeOut();
        },3000);
    }*/
	
	

    //控制标题的字数
    $('.sliceFont').each(function(index, el) {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        $(this).attr('title',$(this).text());
        if(len > num){
            $(this).html(text.substring(0,num));
        }
    });

    $('.fir_r_con li').hover(function () {
       $(this).addClass('curr').siblings().removeClass('curr');
    });

    // 推荐直播--焦点图
    var swiperNav = [], mainNavLi = $('.slideBox4 .bd').find('li');
	if(mainNavLi.length>0){
		for (var i = 0; i < mainNavLi.length; i++) {
		    swiperNav.push($('.slideBox4 .bd').find('li:eq('+i+')').html());
		}
		var liArr = [];
		for(var i = 0; i < swiperNav.length; i++){
		    liArr.push(swiperNav.slice(i, i + 5).join(""));
		    i += 4;
		}
		$('.slideBox4 .bd').find('ul').html('<li>'+liArr.join('</li><li>')+'</li>');
		$(".slideBox4").slide({titCell:".hd ul", mainCell:".bd ul",effect:"leftLoop", autoPage:"<li></li>",autoPlay: true});
	}else{
		$(".part_sec").hide();
	}
   
    $(".bg_").css("top",$(".part_thr").offset().top+90)

    //都在关注
    $(".part_thr .foucebox2").slide({
        mainCell: ".bd ul",
        effect: "fold",
        autoPlay: true,
        delayTime: 300,
        triggerTime: 50,
        startFun: function(i) {
            $(".foucebox2 .hoverBg").animate({
                    "margin-top": 126 * i
                },
                150);
        }
    });
	
	// 直播预约
	$(".yue_btn").click(function(){
		var userid = $.cookie(cookiePre+"login_user");
		 if(userid == null || userid == ""){
			window.location.href = masterDomain+'/login.html';
			return false;
		}
		var t =$(this);id=t.attr('data-id');
		$.ajax({
				url: "/include/ajax.php?service=live&action=liveBooking&aid="+id,
				type: "GET",
				dataType: "json", //指定服务器返回的数据类型
				success: function (data) {
				 if(data.state == 100){
					if(!t.hasClass('yued')){
						t.addClass('yued');
						t.find('p').text('已预约');
						showMsg('<img class="gou" src="'+templatePath+'images/gou.png"><em>预约成功</em>')
					}else{
						t.removeClass('yued');
						t.find('p').text('预约');
						showMsg('<img class="gou" src="'+templatePath+'images/gou.png"><em>预约已取消</em>')
					}
					console.log(data)
				 }else{
					alert(data.info)
				 }
				},
				error:function(err){
					console.log('fail');
				}
		});
		    	
	})

    //控制标题的字数
    $('.sliceFont2').each(function(index, el) {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        $(this).attr('title',$(this).text());
        if(len > num){
            $(this).html(text.substring(0,num));
        }
    });
    //控制标题的字数
    $('.sliceFont3').each(function(index, el) {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        $(this).attr('title',$(this).text());
        if(len > num){
            $(this).html(text.substring(0,num));
        }
    });


    $('.part_four .conList li').hover(function () {
        $(this).find('.code_bg').show();
    },function () {
        $(this).find('.code_bg').hide();
    });

    if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.part_sec .liveList .slideBox .bd ul li a:nth-child(5n),.part_four .conList li:nth-child(4n)').css('margin-right','0');
    }

    $(".isearch").click(function(){
        var url = $("#myform").attr('action');
        location.href = url + '?keywords=' + $(".searchkey").val();
    });

});