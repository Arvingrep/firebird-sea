$(function(){
	//地址跳转
	$('.appMapBtn').attr('href', OpenMap_URL);
	// banner轮播图
  	var bannerS = new Swiper('.banner #banContainer', {pagination:{ el: '.banner .pagination',type: 'fraction',} ,slideClass:'swiper-slide',loop: true,grabCursor: true,paginationClickable: true,autoplay:{delay: 2000,}});

  	// 下拉加载
	var isload = false,atpage = 1,pageSize = 20;	
	$(window).scroll(function() {
		var scrolls = $(window).scrollTop();
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w;
		if (scrolls + 50 > scroll && !isload) {
			var atpage = parseInt($('.headbox .curr').attr('data-page')),
            totalPage = parseInt($('.headbox .curr').attr('data-totalPage'));
            if (atpage < totalPage) {
                ++atpage;
                $('.headbox .curr').attr('data-page', atpage);
                getList();
            }
		};


	});

  	//左右导航切换
	var tabsSwiper = new Swiper('#tabs-container', {
	    speed: 350,
	    touchAngle: 35,
	    observer: true,
	    observeParents: true,
	    freeMode: false,
	    longSwipesRatio: 0.1,
	    autoHeight: true,
	    on: {
	        slideChangeTransitionStart: function() {
	            $(".headbox .curr").removeClass('curr');
	            $(".headbox li").eq(tabsSwiper.activeIndex).addClass('curr');
	            var len = $("#tabs-container .swiper-slide").eq(tabsSwiper.activeIndex).find('li').length;
	            var len2 = $("#tabs-container .swiper-slide").eq(tabsSwiper.activeIndex).find('.empty').length;
	            if(len != 0 || len2 != 0){
	            }else{
	              getList();
	            }
	            
	        },
	    },
	})
	$('.headbox li').click(function() {
	      var i = $(this).index();
	      if (!$(this).hasClass('curr')) {
	          $(this).addClass('curr').siblings().removeClass('curr');
	          tabsSwiper.slideTo($(this).index());
	      }

	})
	//分类切换
	$('.typemore a').click(function() {
	    if (!$(this).hasClass('curr')) {
	        $(this).addClass('curr').siblings().removeClass('curr');
	        $('.headbox li.curr').attr('data-isload','0');
	        $('.headbox li.curr').attr('data-page','1');
	        getList()
	    }
	})
	getList();

	//数据列表
	function getList(){
	    var tload = $('.headbox li.curr').attr('data-isload'); 
	    if (tload == '1'){
	      return false;
	    }
	    $('.headbox li.curr').attr('data-isload','1');
	    var tindex = $('.headbox li.curr').index();
	    var objId = $('#tabs-container .swiper-slide-active')
	    objId.find('.loading').remove();
	    objId.append('<div class="loading">加载中</div>');
	    var active = $('.headbox .curr');
	    var page = active.attr('data-page');

	    //请求数据
	    var data = [];
	    data.push("pageSize="+pageSize);
	    data.push("page="+page);
	    //var typeid = $('.typemore a.curr').attr('data-id');
	    //data.push("typeid="+typeid);
	    $.ajax({
	      url: "/include/ajax.php?service=shop&action=slist&flag=0",
	      data: data.join("&"),
	      type: "GET",
	      dataType: "jsonp",
	      success: function (data) {   
	        if(data && data.state == 100){
	          var list = data.info.list, pageinfo = data.info.pageInfo,totalPage = pageinfo.totalPage, lr;
	          $('.headbox li.curr').attr('data-totalpage',totalPage);
	          var html = [];
	          var html3 = [],html4=[];
	          if(list.length > 0){
	            objId.find('.loading').remove()
	            for(var i = 0; i < list.length; i++){
	            	var html2=[];
	              lr = list[i];
	              var pic = lr.litpic == false || lr.litpic == '' ? '/static/images/404.jpg' : lr.litpic;
	              if(tindex == 0){//到店优惠
	                
					html2.push('<li><a href="">');
					html2.push('  <div class="goodImg">');
					html2.push('  <img src="'+pic+'" alt=""></div>');
					html2.push('  <div class="goodInfo"> ');                                                 
					html2.push('    <h2 class="goodTitle">'+lr.title+'</h2>');
					html2.push('    <div class="goodPrice">');
					var priArr = lr.price.split('.');
					html2.push('      <span class="newPrice">'+echoCurrency('symbol')+'<strong>'+priArr[0]+'</strong><em>.'+priArr[1]+'</em></span>');
					html2.push('      <span class="oldPrice">'+echoCurrency('symbol')+'<em>'+lr.mprice+'</em></span>');
					html2.push('    </div>  ');   
					html2.push('  </div>');
					html2.push('  <div class="goodStore">'+lr.storeTitle+'</div>');
					html2.push('</a></li>');
	                
	                if(i % 2 == 0){
						html3.push(html2.join(""))

					}else{
						html4.push(html2.join(""))

					}
	              }else{//同城配送

	                  	html.push('<li>');
						html.push('	<a href="'+lr.url+'">');
						html.push('<div class="storeImg"><img src="'+pic+'" alt=""></div>');
						html.push('	<div class="busInfo">');
						html.push('		<h2>'+lr.title+'</h2>');
						html.push('		<div class="starbox">');
						html.push('			<div>');
						html.push('				<span class="haoping"><i></i><span>4.0</span></span>')
						html.push('				<s></s>')
						html.push('				<em>6条优惠</em>')
						html.push('			</div>')
									
						html.push('			<span class="juli">1.2km</span>');
						html.push('		</div>');
						html.push('		<div class="tuanInfo">');
						html.push('			<div>');
						html.push('				<i></i>');
						html.push('				<span>'+echoCurrency('symbol')+'998.99</span>');
						html.push('				<s>'+echoCurrency('symbol')+'98888</s>');
						html.push('				团建必备全天档/湖景团建必备全天档/湖景');
						html.push('			</div>');
						html.push('			<div>');
						html.push('				<i></i>');
						html.push('				<span>'+echoCurrency('symbol')+lr.price+'</span>');
						html.push('				<s>'+echoCurrency('symbol')+lr.mprice+'</s>');
						html.push('				团建必备全天档/湖景团建必备全天档/湖景');
						html.push('			</div>');
						html.push('		</div>');
						html.push('	</div>');
	                  	html.push('</a></li>');
	               
	              }
	              
	            }

	            if(page == 1){
	            	if(tindex == 0){//推荐优惠
		            	objId.find('.list_ul1').html(html3.join(""));
		              	objId.find('.list_ul2').html(html4.join(""));
	            	}else{//相关商家
	            		objId.find('ul').html(html.join(""));
	            	}
	              
	            }else{
	            	if(tindex == 0){//推荐优惠
		            	objId.find('.list_ul1').append(html3.join(""));
		              	objId.find('.list_ul2').append(html4.join(""));
	            	}else{
	            		objId.find('ul').append(html.join(""));
	            	}
	              
	            }

	            
	            tload = '0';
	            $('.headbox li.curr').attr('data-isload',tload);
	            if(page >= pageinfo.totalPage){
	                tload = '1';
	                $('.headbox li.curr').attr('data-isload',tload);
	                objId.append('<div class="loading">没有更多了</div>');//没有更多了
	            }

	          //没有数据
	          }else{
	            tload = '1';
	            $('.headbox li.curr').attr('data-isload',tload);
	            objId.find('.loading').html('<div class="empty"></div><p>暂无数据!</p>');
	          }

	        //请求失败
	        }else{
	          tload = '1';
	          $('.headbox li.curr').attr('data-isload',tload);
	          objId.find('.loading').html('<div class="empty"></div><p>'+data.info+'</p>');
	        }
	        tabsSwiper.updateAutoHeight(100);
	        
	      },
	      error: function(){
	        tload = '0';
	        //网络错误，加载失败
	        objId.find('.loading').html('网络错误，加载失败'); // 网络错误，加载失败
	        $('.headbox li.curr').attr('data-isload',tload);
	      }
	    });
	}
})

