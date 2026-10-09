$(function(){
	var swiperBanner = new Swiper('.banner_box .swiper-container', {
	      pagination: {
	        el: '.banner-pagination',
	        type: 'fraction',
	      },
	      
	    });
	 var swiper = new Swiper('.gift_box .swiper-container', {
	      slidesPerView: 'auto',
	      pagination: {
	        el: '.page',
			type:'progressbar',
	        clickable: true,
	      },
	    });
		
		var now = Date.parse(new Date())/1000
	//倒计时
	if(cutTime && $(".yiJoin .cutDown").length>0){
		countDown((cutTime-now),$(".cutDown"),'1')
	 }
		function countDown(dtime, obj,type){
			var ctime = countTime(dtime)
			if(type=='1'){
				obj.html('剩余时间 <span class="hh">'+ctime[0]+'</span>:<span class="mm">'+ctime[1]+'</span>:<span class="ss">'+ctime[2]+'</span>')
			}else{
				obj.html('剩余'+ctime[0]+':'+ctime[1]+':'+ctime[2])
			}
			mtimer = setInterval(function(){
				dtime = dtime -1;
				var cctime = countTime(dtime);
				if(type=='1'){
					obj.html('剩余时间 <span class="hh">'+cctime[0]+'</span>:<span class="mm">'+cctime[1]+'</span>:<span class="ss">'+cctime[2]+'</span>')
				}else{
					obj.html('剩余'+cctime[0]+':'+cctime[1]+':'+cctime[2])
				}
				if(dtime <= 0) {
					clearInterval(mtimer);	
				}
			}, 1000);
		}
		
		function countTime(time){
			hh = parseInt(time/(60*60));
			mm = parseInt(time%(60*60)/60);
			ss = parseInt(time%(60*60)%60);
			hh = hh > 9 ? hh :"0" + hh;
			mm = mm > 9 ? mm :"0" + mm;
			ss = ss > 9 ? ss :"0" + ss;
			return [hh,mm,ss]
		}
		
		
		
		
		
		// 查看商品
		$(".gift_list,.gift_box").delegate('li','click', function(){

			var title 	= $(this).attr('data-title');
			var img 	= $(this).attr('data-img');
			var price 	= $(this).attr('data-price');
			var descon 	= $(this).find(".descon").html();

			$(".pop_gift .conbox h2").text(title);
			$(".pop_gift .gift_price b").text(price);
			$(".pop_gift .note ").html(descon);
			$(".pop_gift .banner_box img").attr('src',img);



			$(".gift_mask").show();
			$('.pop_gift').animate({"bottom":"0"},300);
			setTimeout(function(){
				$('.pop_gift .btn_tobuy').removeClass('fn-hide')
			},300);
		});
		
		$('.gift_mask ,.pop_gift .close_btn').click(function(){
			$(".gift_mask").hide();
			$('.pop_gift').animate({"bottom":"-80%"},300);
			$('.pop_gift .btn_tobuy').addClass('fn-hide')
		})

	$(".yaoqing").click(function(){
		$(".HN_PublicShare").click();
	})

	$('.buyLink').click(function(){
		var fromstr = '';
		if(fromShare!='0'){
			fromstr = '&fromShare='+fromShare;
		}
		window.location = channelDomain +'/confirm-order.html?proid='+proid+'&pinid='+pinid+fromstr;
	})
	
	
	var list_len = $('.legouList .swiper-slide').length;
	
	if(list_len>=2){
	  new Swiper('.legouList .swiper-container', {
		  direction: 'vertical', 
		  loop:true,
		  autoplay:{delay: 3000,},
		  slidesPerView:2,
		  autoplayDisableOnInteraction:false,
		  on:{
			  init:function(){
				  $('.legouList .swiper-slide').each(function(){
				  	var time = $(this).find('.le_info p').attr('data-time');
					var time_data = (time-now)
				  	countDown(time_data,$(this).find('.le_info p'),2)
				  })
			  }
		  }
	  });
	}else if(list_len == 0){
	  $('.legouList').html('').hide();
	}else{
		 $('.legouList .swiper-slide').each(function(){
			var time = $(this).find('.le_info p').attr('data-time');
			var time_data = (time-now)
			countDown(27055,$(this).find('.le_info p'),2)
		  })
	}



	// 收藏
	$(".shou").bind("click", function(){
			var t = $(this), type = "add", oper = "+1", txt = '已收藏';   //"已收藏"
			var userid = $.cookie(cookiePre+"login_user");
			if(userid == null || userid == ""){
				top.location.href = masterDomain + '/login.html';
				return false;
			}
	
			if(!t.hasClass("curr")){
				t.addClass("curr");
			}else{
				type = "del";
				t.removeClass("curr");
				oper = "-1";
				txt = '收藏';  //收藏
			}
	
			var $i = $("<b>").text(oper);
			var x = t.offset().left, y = t.offset().top;
			$i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
			$("body").append($i);
			$i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
				$i.remove();
			});
	
	        t.html(txt);
	
			$.post("/include/ajax.php?service=member&action=collect&module=awardlegou&temp=detail&type="+type+"&id="+proid);   //收藏提交
	
		});

})