$(function(){

    //获取url中的参数
    function getUrlParam(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if ( r != null ){
         return decodeURI(r[2]);
      }else{
         return null;
      }
    }
    var title = decodeURI(getUrlParam('title'));
    var sId = decodeURI(getUrlParam('typeid'));
    var index = 0;
    if(sId!=''){
    	$('.f_nav li[data-id="'+sId+'"]').addClass('active').siblings().removeClass('active');
        index =$('.f_nav li[data-id="'+sId+'"]').index();

    }
	//更多导航栏展开，关闭
    $('.more_nav').click(function () {
        $('.mask').fadeIn();
        setTimeout(function(){
            $('.nav_all').animate({
                'top': '0',
            }, 100);
        },100)
        setTimeout(function(){
            $('.nav_box').css('z-index','100000');
        },200)
        $('html').addClass('noscroll');
        $(".nav_all .nav_on").removeClass('nav_on'); 
        
    });
    $('.close_btn,.cancel,.mask').click(function () {      
       $('.nav_all').animate({
            'top': '-100%',
        }, 100);
        
        $('.mask').fadeOut();
        $('.nav_box').css('z-index','100001'); 
        $('html').removeClass('noscroll');
    });


    var newsTime = {

        //转换PHP时间戳
        transTimes: function(timestamp, n){
            
            const dateFormatter = huoniao.dateFormatter(timestamp);
            const year = dateFormatter.year;
            const month = dateFormatter.month;
            const day = dateFormatter.day;
            const hour = dateFormatter.hour;
            const minute = dateFormatter.minute;
            const second = dateFormatter.second;
            
            if(n == 1){
                return (year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second);
            }else if(n == 2){
                return (year+'/'+month+'/'+day);
            }else if(n == 3){
                return (month+'/'+day);
            }else{
                return 0;
            }
        }
    }

var hchange,hnochange
function getData(id){
	$('#nav_item_'+id).attr('data-type',1);
	$('#chanel_'+$('.item'+id).index()).append('<div class="loading"><img src="'+templets_skin+'images/loading.png"></div>')
	var html = [];
	//请求数据
	var data = [];
		data.push("pageSize="+pageSize);
		data.push("page="+atpage);
		
		if(title!='' && title!='null' && title!=undefined){
			$('#keywords').val(title)
			data.push("title="+title);
		}
	$.ajax({
		url: "/include/ajax.php?service=house&action=news&typeid="+id,
		data: data.join("&"),
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			$('#chanel_'+$('.item'+id).index()).find('.loading').remove();
			if(data){
				if(data.state == 100){
					var list=data.info.list;
					for(var i=0; i<list.length; i++){						
						html.push('<li class="m_item singleBox">')
						html.push('<a href='+list[i].url+' class="fn-clear">')
						if (list[i].litpic != "") {
							html.push('<div class="aright_">')
							html.push('<img onerror="this.src=`/static/images/404.jpg`" src='+list[i].litpic+'>')
							html.push('</div>')
						}
						html.push('<div class="aleft">')
						html.push('<h2>'+list[i].title+'</h2>')
						html.push('<div class="newsInfo">')
	                    if(list[i].click > 500){//浏览量大于500 时 为hot
	                        if(list[i].click >= 10000){
	                           list[i].click = (list[i].click/10000).toFixed(1) + '万';
	                        }
	                        html.push('<i class="hot"></i>');
	                    }
	                    var time = list[i].pubdate;
	                    var pubTime = newsTime.transTimes(time,2)
	                    html.push('<em class="pub-time">'+pubTime+'</em><i class="see"></i><em class="see_num">'+list[i].click+'</em>')
	                    html.push('</div>')
						html.push('</div>')
						html.push('</a>')
						html.push('</li>')
						
					}
					$('#chanel_'+$('.item'+id).index()).append(html.join(''));
					$('#nav_item_'+id).attr('data-type',0);
					if(atpage >= data.info.pageInfo.totalPage){
						$('#nav_item_'+id).attr('data-type',1);
						$('#chanel_'+$('.item'+id).index()).append('<div class="loading">已经到最后一页了</div>');
					}
					mySwiper.updateAutoHeight(100);

				//请求失败
				}else{
					console.log(data.info);
					$('#chanel_'+$('.item'+id).index()).append('<div class="loading">暂无数据</div>');
				}
			//加载失败
			}else{
				console.log(data.info);
				$('#chanel_'+$('.item'+id).index()).append('<div class="loading">暂无数据</div>');
			}
			hchange = $('#chanel_'+$('.item'+id).index()).height();
		},
		error: function(){
			$('#nav_item_'+id).attr('data-type',0);
		}
	});
}


// 下拉加载
$(window).scroll(function() {
	if($(window).scrollTop()>($('.header').height())){
        $('.nav_box').addClass('topfixed');
        $('.nav_all').addClass('top0');
    }else{
        $('.nav_box').removeClass('topfixed');
        $('.nav_all').removeClass('top0');
    } 
	var id = $('.active').attr('data-id')
	var h = $('.footer').height() + $('.content li').height() * 2;
	var allh = $('body').height();
	var w = $(window).height();
	var hasload = $('.active').attr('data-type');
	var scroll = allh - h - w;
	hnochange = $('#chanel_'+id).height();
	if ($(window).scrollTop() > scroll && (hasload==0) ) {
		atpage++;
		getData(id);
		mySwiper.updateAutoHeight(hchange);
		return 0;
	}else{
		mySwiper.updateAutoHeight(hnochange);
		return 0;
	};

});

	//导航栏加载成功时
	var len = $('#nav_list .item').length ;
	for(var i=0;i<len;i++){
		$('.swrip-panel').append('<ul class="content swiper-slide" id="chanel_'+i+'"></ul>')
	}

	getData($(".f_nav li.active").attr('data-id'));
	var mySwiper = new Swiper('.swiper-container', {
		pagination : '.pagination',
		autoHeight: true,
		initialSlide :index,//默认第三页
		on: {
		    slideChangeTransitionEnd: function(){
		    	$(".nav_box .active").removeClass('active');
                $(".nav_box li").eq(this.activeIndex).addClass('active'); 
		      	//横向滚动到已选中的li
		       	var end = $('.active').offset().left + $('.active').width() / 2 - $('body').width() /2;
                var star = $(".nav_box .f_nav").scrollLeft();
                $('.f_nav').scrollLeft(end + star);
		        var hasload =  $('.item').eq(this.activeIndex).attr('data-type');
		      	var len = $('#chanel_'+this.activeIndex).children('li').length;
			    if(hasload==0 && len==0){//第一次加载
			      	$(window).scrollTop(0);
			      	atpage=1;
			      	$('#chanel_'+this.activeIndex).html('');
			      	var acId =$("#nav_list .item:eq("+(this.activeIndex*1)+")").attr('data-id') 
			      	getData(acId);
			      	this.updateAutoHeight(100)
			    }else{//已经滑动加载过
			      	this.updateAutoHeight(100)
			    }
		    },
		  },
	});
	
   
    


	$('#searchId').val($('.f_nav li.active').attr('data-id'));
	// 点击导航
    $('#nav_list .item').click(function(e){
        e.preventDefault();
        $(".f_nav .active").removeClass('active');
        $(this).addClass('active');
        var searchId =$(this).attr('data-id')
        $('#searchId').val(searchId);
        mySwiper.slideTo($(this).index());


    });
    //全部导航点击
    $('.nav_all').delegate('li', 'click', function (e) {
        var t = $(this);        
        $(this).addClass('nav_on').siblings().removeClass('nav_on');
        var iname = $(this).attr('data-id');
        $('.nav_box li[data-id="'+iname+'"]').click();
        $('.nav_all').animate({
            'top': '-100%'
        }, 200);
        $('.nav_box').fadeIn();
        $('.mask').hide();
        $('html').removeClass('noscroll');

    });




})
