$(function(){
	var page = 1, isload = 0, totalpage = 0;
	  
        checkLocal();
    
    	// 关注按钮
	$('body').delegate('.carebtn', 'click', function(){
	    var x = $(this);
	    if (x.hasClass('cared')) {
	    	
	    	$('.carebox,.mask0').addClass('show');
	    	
	    	$('.carebox.show li').click(function(){
	    		if($(this).hasClass('nocare')){
					follow(x, function(){
						x.removeClass('cared').find('span').text(langData['siteConfig'][19][846]);
					});
					 location.reload();
	    		}
	    		$('.carebox,.mask0').removeClass('show');
	    	})
	
	    }else{
				follow(x, function(){
					x.addClass('cared').find('span').text(langData['siteConfig'][19][845]);
				});
				 location.reload();
	    }
	   
	    return false;
	  })
    
    var follow = function(t, func){
	    var userid = $.cookie(cookiePre+"login_user");
	    if(userid == null || userid == ""){
	      location.href = masterDomain + '/login.html';
	      return false;
	    }
	
	    if(t.hasClass("disabled")) return false;
	    t.addClass("disabled");
	    $.post("/include/ajax.php?service=member&action=followMember&id="+t.attr("data-id"), function(){
	      t.removeClass("disabled");
	      func();
	    });
	  }
     //下拉加载
	$(window).scroll(function(){
		var typeid = $('.right_box .on_li').attr('data-id');
		var srollPos = $(window).scrollTop(); //滚动条距顶部距离(页面超出窗口的高度)
		totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
		if(($(document).height()-50) <= totalheight && !isload) {
			page++;
			checkLocal('livelist')
		}
		
	});
	
	
	//点击搜索跳转页面
	$('.search_icon').click(function(){
		console.log(channelDomain+"/search_list.html?type=0")
		window.location.href = channelDomain+"/search_list.html";
	})
	
	//推荐的主播
	function getanchorlist(){
		$.ajax({
	        url: "/include/ajax.php?service=live&action=anchorList&orderby=active&pageSize=5",
	        type: "GET",
	        dataType: "json", //指定服务器返回的数据类型
	        success: function (data) {
	         if(data.state == 100){
	         	var datalist = data.info.list;
	         	var totalpage = data.info.pageInfo.totalPage;
	         	var list = [];
	         	for(var i=0 ; i<datalist.length; i++){
	         		var list_num = '',live_state = '',ifcare = '',txt = '';
	         		if(i==0){
	         			list_num = 'first';
	         		}else if(i==1){
	         			list_num = 'second';
	         		}else if(i==2){
	         			list_num = 'third';
	         		}
	         		if(datalist[i].isLiving){
	         			live_state = 'living';
	         		}
	         		
	         		if(datalist[i].isMfollow=='1'){
	         			ifcare = 'cared';
	         			txt='已'
	         		}else if(datalist[i].isMfollow=='2'){
	         			ifcare = 'fn-hide';
	         		}
	         		list.push('<li class="swiper-slide '+live_state+' '+list_num+'">');
					list.push('<a href="'+masterDomain+'/user/'+datalist[i].uid+'#live">');
					list.push('<div class="head"><img src="'+(datalist[i].photo?datalist[i].photo:"/static/images/noPhoto_60.jpg")+'"/></div>');
					list.push('<h3>'+datalist[i].nickname+'</h3>');
					list.push('<p class="distance_toyou">'+datalist[i].totalFans+'人关注</p>');
					list.push('<button data-id="'+datalist[i].uid+'"  class="carebtn '+ifcare+'"><span>'+txt+'关注</span></button>');
					list.push('</a></li>');
	         		
	         		
	         	}
	         	
	         	$('.hotanchor_list .loading').remove();
	         	$('.hotanchor_list ul').append(list.join(''));
	         	  //热门主播
			    var swiper = new Swiper('.hotanchor_list.swiper-container', {
			      slidesPerView: 2.8 
			    });
	         	
	         }else{
	         	$('.hotanchor_list  .loading').remove();
	         	$('.hotanchor_list ul').append('<div class="loading"><span>暂无数据</span></div>');
	         }
	        },
	        error:function(err){
	        	console.log('fail');
	        }
	     });
	}
	
    //推荐的直播
   function getlist(){
   		isload =1;
		$('.live_box .ulbox').append('<div class="loading"><img src="'+templatePath+'/images/loading.png"/></div>');
		$.ajax({
	        url: "/include/ajax.php?service=live&action=alive&orderby=4&pageSize=10&page="+page+"&lng="+lng+"&lat="+lat,
	        type: "GET",
	        dataType: "json", //指定服务器返回的数据类型
	        crossDomain:true,
	        success: function (data) {
	         if(data.state == 100){
	         	var datalist = data.info.list;
	         	var totalpage = data.info.pageInfo.totalPage;
	         	var list = [];
	         	for(var i=0 ; i<datalist.length; i++){
	         		var className = '', ftime='' ,care='',txt="";
	         		if(datalist[i].state==1){
	         			className = 'living';
	         		}else if(datalist[i].state==2){
	         			className = 'live_after';
	         		}else{
	         			className = 'live_before';
	         			ftime='<em>'+datalist[i].ftime+'</em>'
	         		}
	         		//是否已经关注
		         		if(datalist[i].isMfollow==1){
				         		care="cared"
				         		txt = "已关注"
				        }else if(datalist[i].isMfollow==0){
				         		care="";
				         		txt = "关注"
				        }else{
				         		care="fn-hide";
				        }
	         		
	         		list.push('<li class="video_box libox">');
						list.push('<div class="anchor_info fn-clear">');
							list.push('<a href="'+masterDomain+'/user/'+datalist[i].user+'#live">');
								list.push('<div class="anchor_img">');
									list.push('<img src='+(datalist[i].photo?datalist[i].photo:"/static/images/noPhoto_40.jpg")+' />');
								list.push('</div>');
								list.push('<h2><span>'+datalist[i].nickname+'</span></h2>');
							list.push('</a>');
							list.push('<div class="carebtn '+care+'" data-id="'+datalist[i].user+'"><span>'+txt+'</span></div>');
						list.push('</div>');
						list.push('<a href="'+datalist[i].url+'">');
							list.push('<div class="video_img">');
								list.push('<span class="video_state '+className+'">'+ftime+'</span>');
								list.push('<img onerror="nofind_c();" src="'+datalist[i].litpic+'" />');
							list.push('</div>');
							list.push('<div class="info_box">');
								list.push('<div class="look_num">'+datalist[i].click+'</div>');
								list.push('<div class="video_info">');
									list.push('<h3>'+datalist[i].title+'</h3>');
									list.push('<p>#'+(datalist[i].typename?datalist[i].typename:"其他")+'-'+datalist[i].distance+'</p>');
								list.push('</div>	');
							list.push('</div>');
						list.push('</a>');
					list.push('</li>');	
	         	}
	         	$('.live_box .ulbox .loading').remove();
	         	$('.live_box .ulbox').append(list.join(''));
	         	isload = 0;
	         	if(page>=totalpage){
	         		isload = 1;
	         		$('.live_box .ulbox').append('<div class="loading"><span>已经全部加载</span></div>');
	         	}
	         	
	         }else{
	         	$('.live_box .ulbox .loading').remove();
	         	$('.live_box .ulbox').append('<div class="loading"><span>暂无数据</span></div>');
	         }
	        },
	        error:function(err){
	        	console.log('fail');
	        }
	     });
   }
    
     function checkLocal(type){
        var local = false;
        var localData = utils.getStorage("user_local");
        if(localData){
            var time = Date.parse(new Date());
            time_ = localData.time;
            // 缓存1小时
            if(time - time_ < 3600 * 1000){
                lat = localData.lat;
                lng = localData.lng;
                local = true;
            }

        }
//				getList();
        if(!local){
            HN_Location.init(function(data){
                if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
                    lng = lat = -1;
                    if(type=='livelist'){
                    	 getlist();
                    }else{
                    	getlist();
                    	getanchorlist();
                    }
                    
                }else{
                    lng = data.lng;
                    lat = data.lat;

                    var time = Date.parse(new Date());
                    utils.setStorage('user_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address': data.address}));
					if(type=='livelist'){
                    	 getlist();
                    }else{
                    	getlist();
                    	getanchorlist();
                    }
                }
            })
        }else{
           if(type=='livelist'){
                getlist();
            }else{
                getlist();
                getanchorlist();
             }
        }

    }
    
    
});
 //图片2报错
var nofind_c = function(){ 
	var img = event.srcElement; 
	img.src = staticPath+"images/404.jpg"; 
	img.onerror = null;
} 