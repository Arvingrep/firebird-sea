$(function(){
  	var device = navigator.userAgent;
    // if(device.indexOf('huoniao') > -1){
    //   $('.areaChose').bind('click', function(e){
    //     e.preventDefault();
    //     setupWebViewJavascriptBridge(function(bridge) {
    //       bridge.callHandler('goToCity', {'module': 'huodong'}, function(){});
    //     });
    //   });
    // }
	// 广告图
	var bannerswiper = new Swiper('.banner.swiper-container', {
		  autoplay:true,//等同于以下设置
	      pagination: {
	        el: '.banner_page',
	      },
	});
	
	// 导航列表
	
	if($(".navBox li").size()>10){
		var swiper = new Swiper('.navList.swiper-container', {
			  slidesPerGroup: 5,
		      slidesPerView: 5,
		      slidesPerColumn: 2,
		      pagination: {
		        el: '.swiper-pagination',
		        clickable: true,
		      },
		    });
	}else{
      $(".navBox").addClass("noslide");
    }
	
	
	
	var page = 1, isload = 0, totalPage = 0;
	// 推荐活动
	gethd();
	
	
	 var nav_click = 1;
	$(window).scroll(function(){
		var scrTop = $(window).scrollTop();
		var wh = $(window).height();
		var bh = $("body").height();
		var scroll = bh - wh ;
		if(scrTop>=$('.dataBox').offset().top){
			$(".topfixed").append($(".tab_ul")).addClass('show');
		}else{
			$(".ul_box").append($(".tab_ul"));
			$(".topfixed").removeClass('show');
		}
		$(".slide_box").each(function(){
			var t = $(this);
			var index = t.index();
			if((t.offset().top-100) <= scrTop &&  nav_click == 1){
				$(".tab_ul li").removeClass('on_tab');
				$(".tab_ul li").eq(index).addClass('on_tab')
			}
		});
		
		// 下拉加载
		if(scrTop+10 >= scroll && !isload){
			gethd();
		}
	})
	
	$(".tab_ul li").click(function(){
		var t = $(this);
		var index = t.index();
		t.addClass("on_tab").siblings("li").removeClass("on_tab");
		 nav_click = 0;
		$(window).scrollTop($(".slide_box").eq(index).offset().top-70);
		setTimeout(function(){
			nav_click = 1;
		},600)
	})
	
	function gethd(){
		isload = 1;
		$.ajax({
		    url: '/include/ajax.php?service=huodong&action=hlist&flag=0&pageSize=5&page='+page,
		    type: 'GET',
		    dataType: 'json',
		    success: function(data){
		        if(data){
		            if(data.state == 100){
		              var html = [];
					  var list = data.info.list;
					  totalPage = data.info.pageInfo.totalPage;
					  for(var i = 0; i<list.length; i++){
						  html.push('<li>');
						  html.push('<a href="'+list[i].url+'" class="hd_detail">');
						  html.push('<div class="pro_img"><img src="'+list[i].litpic+'" alt=""></div>');
						  html.push('<div class="pro_info">');
						  html.push('<h2>'+list[i].title+'</h2>');
						  html.push('<div class="pro_detail">');
						  html.push('<p class="act_time"><i></i><span>'+huoniao.transTimes(list[i].began,2)+'</span></p>');
						  html.push('<p class="act_addr"><i></i><span>'+list[i].addrname.join(' ')+'</span></p>');
						  html.push('<p class="act_bm"><i></i><span>'+(langData['huodong'][0][4].replace("1",list[i].reg))+'</span></p>'); //已报名<em>1</em>人
						  html.push('</div>');
						  if(list[i].feetype=="0"){
							  html.push('<span class="price free">'+langData['huodong'][0][5]+'</span>');  //免费
						  }else{
							  html.push('<span class="price ">'+echoCurrency('symbol')+'<em>'+list[i].mprice+'</em>'+langData['huodong'][0][6]+'</span>');  //起
						  }
						  
						  html.push('</div></a>');
						  html.push('<a href="'+list[i].memberurl+'" class="hd_host">');
						  html.push('<div class="head_img"><img src="'+list[i].userphoto+'" onerror="this.src=\"'+templets_skin+'images/user.png \"">');
						  html.push('<div class="v_log "><img src="'+templets_skin+'/images/vip_icon.png"></div>');
						  html.push('</div><p>'+list[i].username+' </p></a></li>');
						  
					  }
					  $(".rec_hot ul").append(html.join(''));
					  
					  isload = 0;
					  page++;
					  if(page > totalPage){
						  $(".loading").html(langData['huodong'][1][14]);  //已全部加载
						  isload = 1;
					  }
					  
		            }else{
						 isload = 0;
						 $(".loading").html(langData['huodong'][1][15]);  //暂无数据
		            }
		        }else{
		          
		        }
		    },
		    error: function(){
		        alert(langData['huodong'][1][16]);  //网络错误，请刷新重试
		    }
		})
		
	}
	
	
	// 加关注
	$(".care_btn").click(function(){
		var t = $(this),userid = t.attr('data-id');
		if (t.hasClass('cared')) {
			follow(t, function(){
				t.removeClass('cared');  //关注
				t.html(langData['siteConfig'][19][846]);
			});
		}else{
			follow(t, function(){
				t.addClass('cared');
				t.text(langData['siteConfig'][19][845]);  //已关注
			});
		}
		return false;
	});
	
	function follow(t, func){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			location.href = masterDomain + '/login.html';
			return false;
		}
	
		if(t.hasClass("disabled")) return false;
		t.addClass("disabled");
		$.post("/include/ajax.php?service=member&action=followMember&id="+t.data("id"), function(){
			t.removeClass("disabled");
			func();
		});
	}
	
	
	
	
	
	
	
})