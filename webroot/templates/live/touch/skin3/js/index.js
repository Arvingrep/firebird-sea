var listpage = 1, isload = false;
$(function(){
	 rec_getlist('rec');
	 rec_getlist('back');
	 getlist('');
	//预约轮播
	var swiper = new Swiper('.swiper-container.yuyue_list', {
		autoplay:{
 	    	delay:4000,
 	    	disableOnInteraction: false,
 	   },
 	   on:{
 	   	 slideChangeTransitionStart: function () {

 	   	 	var time = $('.yuyue_list .yuyue_li').eq(this.activeIndex).find('a').attr('data-time')
 	   	 	$('.yuyue_list .live_time').text(time)
 	   	 }
 	   },
      pagination: {
        el: '.yuyue_pagination',
        clickable: true,
        renderBullet: function (index, className) {
        	switch(index){
	            case 0:text='<i>1</i>';break;
	            case 1:text='<i>2</i>';break;
	            case 2:text='<i>3</i>';break;
	            case 3:text='<i>4</i>';break;

          }
          return '<span class="' + className + '">' + text + '</span>';
        },
      },
      loop:true,
    });
    //点击预约
    $('.yuyue_list ').delegate('.yuyue_btn','click',function(){
    	var userid = $.cookie(cookiePre+"login_user");
		 if(userid == null || userid == ""){
		    window.location.href = masterDomain+'/login.html';
			return false;
		}
    	var t =$(this);id=$(this).attr('data-id');
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
    	return false;
    });
    // banner轮播图
    var bannerSwiper = new Swiper('.banner .swiper-container', {autoplay:{delay:4000, disableOnInteraction: false}, pagination: {el: '.banner-pagination',type: 'bullets',},loop: true,grabCursor: true,paginationClickable: true});

    //热门主播
    var swiper = new Swiper('.hotanchor_list.swiper-container', {
      slidesPerView: 3,
      slidesPerGroup: 3,
      loop: false,
      pagination: {
        el: '.hotanchor_pagination',
        clickable: true,
      },

    });


$('.search').click(function(e){
	window.location.href = channelDomain+"/search_index.html";
  
})
var device = navigator.userAgent;
if(device.indexOf('huoniao') > -1){
//   $('.posi').bind('click', function(e){
//     e.preventDefault();
//     setupWebViewJavascriptBridge(function(bridge) {
//       bridge.callHandler('goToCity', {'module': 'live'}, function(){});
//     });
//   });
}

//进入主播的个人中心
$('.hot_list,.video_list').delegate('.head','click',function(){
	var url = $(this).attr('data-url');
	window.location.href = url;
	return false;
});
 //更多导航栏展开，关闭
    $('.more_nav').click(function () {
        $('.nav_all').animate({
            'bottom': '0',
            'height': $(window).height(),
        }, 200);
    });
    $('.close_btn').click(function () {
        $('.nav_all').animate({
            'bottom': '-100%',

        }, 200);
    });
    $('.category_box li').click(function(){
    	$(this).addClass('on_li').siblings('li').removeClass('on_li');
    	$('.hot_list .ulbox').html('');
     	var id = $(this).attr('data-id');
     	if(id=='null'){
     		id='';
     	}
     	getlist(id);
     	$('.close_btn').click();



    });


    $('.video_list h2 span').click(function(){
    	if($(this).hasClass('on_chose')){
    		return false;
    	}else{
    		$(this).addClass('on_chose').siblings('span').removeClass('on_chose')
    		$('.box_all').eq($(this).index()).addClass('show').siblings('.box_all').removeClass('show')
    	}
    })

  function  rec_getlist(type){
	  var param = type == 'rec' ? '&rec=1' : '&type=5';
  	$.ajax({
        url: "/include/ajax.php?service=live&type=1&action=alive&orderby=5&pageSize=3"+param,
        type: "GET",
        dataType: "json", //指定服务器返回的数据类型
        success: function (data) {
         if(data.state == 100){
         	var datalist = data.info.list;
         	var html = [];
         	if(type == 'rec'){
         		par = $('.box_all.liveBox')
         	}else{
         		par = $('.box_all.livedBox')
         	}
         	for(var i=0 ; i<datalist.length; i++){
				var list = [],list2=[];
         		if(i<=1){
         			list.push('<a href="'+datalist[i].url+'">');
					list.push('<div class="video_img">');
					list.push('<img src="'+datalist[i].litpic+'" />');
					if(datalist[i].state== 1){
						list.push('<i class="live_icon"></i>');
					}else{
						list.push('<i class="liveback">精彩回放</i>');
					}
					list.push('</div>');
					list.push('<h3>'+datalist[i].title+'</h3>');
				    list.push('</a>');
	         	}else{
	         		list2.push('<a href="'+datalist[i].url+'">');
					list2.push('<div class="video_img">');
					list2.push('<img src="'+datalist[i].litpic+'" />');
					if(datalist[i].state== 1){
						list2.push('<i class="live_icon"></i>');
					}
					list2.push('</div>');
					list2.push('<div class="info_box">');
					list2.push('<div class="head" data-url="'+masterDomain+'/u/user-'+datalist[i].user+'#live"><img src="'+(datalist[i].photo?datalist[i].photo:"/static/images/noPhoto_60.jpg")+'"/></div>');
					if(datalist[i].state== 2){
						list2.push('<p class="label">精彩回放</p>');
					}
					list2.push('<div class="look_num">'+datalist[i].click+'</div>');
					list2.push('<div class="video_info">');
					list2.push('<h3>'+datalist[i].title+'</h3>');
					list2.push('<p>#'+(datalist[i].typename?datalist[i].typename:"其他")+'</p>');
					list2.push('</div>'	);
					list2.push('</div>');
				    list2.push('</a>');
	         	}

	         	par.find('.live_box').append(list.join(''));
	         	html.push(list2.join(''))

			}
			html=$.grep(html,function(n,i){
				return n;
			},false);
         	par.find('.video_box').append(html[0]);
         }
        },
        error:function(err){
        	console.log('fail');
        }
     });
  }

});

var listpage = 1;
function  getlist(id){

  	$.ajax({
        url: "/include/ajax.php?service=live&type=1&action=alive&orderby=time&pageSize=5&page=1&typeid="+id,
        type: "GET",
        dataType: "json", //指定服务器返回的数据类型
        success: function (data) {
         if(data.state == 100){
         	var datalist = data.info.list;
         	var html = [];

         	for(var i=0 ; i<datalist.length; i++){
         		var list2=[];
         			var livestate = live_text = live_time ='';
         			if(datalist[i].state==1){
         				livestate = 'living';
         				 live_text = '';
         				 live_time = datalist[i].ftime;
         			}else if(datalist[i].state==2){
         				livestate = 'lived';
         				 live_text = '精彩回放';
         				  live_time =datalist[i].times;
         			}else{
         				livestate = 'wlive';
         				 live_text = datalist[i].ftime;
         				 live_time ='即将开播';
         			}
	         		list2.push('<li class="libox '+livestate+'"><a href="'+datalist[i].url+'">');
					list2.push('<div class="video_img">');
					list2.push('<i class="live_icon">'+live_text+'</i>');
					list2.push('<img src="'+datalist[i].litpic+'" />');
					list2.push('<div class="look_num">'+datalist[i].click+'</div>');
					list2.push('</div>');
					list2.push('<div class="live_info">');
					list2.push('<h3>'+datalist[i].title+'</h3>');
					list2.push('<p><span>#'+(datalist[i].typename?datalist[i].typename:"其他")+'</span>   <em>'+live_time+'</em></p>');
					list2.push('</div>');
					list2.push('<div class="liver_info">');
					list2.push('<div class="head" data-url="'+masterDomain+'/u/user-'+datalist[i].user+'#live"><img src="'+datalist[i].photo+'" /></div>');
					list2.push('<p class="nickname">'+datalist[i].nickname+'</p>');
					list2.push('</div>');
				    list2.push('</a></li>');

	         	$('.hot_list .ulbox').append(list2.join(''));
	         	html.push(list2.join(''))
	         	if(id!=''){
	         		$(window).scrollTop($('.hot_list').offset().top);
	         	}
         	}

         }
        },
        error:function(err){
        	console.log('fail');
        }
     });
  }

//提示窗
var showErrTimer;
var showMsg = function(txt,time){
	ht = time?time:1500;
	showErrTimer && clearTimeout(showErrTimer);
	$(".popMsg").remove();
	$("body").append('<div class="popMsg"><p>'+txt+'</p></div>');
	$(".popMsg p").css({ "left": "50%"});
	$(".popMsg").css({"visibility": "visible"});
	showErrTimer = setTimeout(function(){
	    $(".popMsg").fadeOut(300, function(){
	        $(this).remove();
	    });
	}, ht);
}
