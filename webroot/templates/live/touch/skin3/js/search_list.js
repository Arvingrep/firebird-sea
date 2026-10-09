$(function(){
	
	var isload = 0, page = 1, totalpage = 0;
	var aload = 0 , apage = 1, atotalpage = 0
	var keywords = decodeURI(getUrlParam('keywords'));  //搜索关键字
	if(decodeURI(getUrlParam('type'))=='null'){
		$('.anchor_searchlist').show().siblings('.live_searchlist').hide();
		$('#type').val(0)
		return false;
	}
	$('#keywords').val(keywords);
    var type = decodeURI(getUrlParam('type'));  //搜索类型
    if(type=='1'){
    	$('.live_searchlist').show().siblings('.anchor_searchlist').hide();
    	getlist(1,1,''); //首次搜索数据
    }else{
    	$('.anchor_searchlist').show().siblings('.live_searchlist').hide();
    	$('.chose_type').text('主播').attr('data-type',type);
    	$('#type').val(type)
    	getanchor();
    }
    
    
    
    
    
    
    //搜索切换
	$('.chose_type').click(function(){
		$('.chose_box').toggle();
		$('.chose_box li').click(function(){
			var txt = $(this).text();
			var stype = $(this).attr("data-type");
			$('.chose_type').text(txt).attr('data-type',stype);
			$('#type').val(stype)
			$('.chose_box').hide();
			if(stype=='1'){
				$('.live_searchlist').show().siblings('.anchor_searchlist').hide();
			}else{
				$('.anchor_searchlist').show().siblings('.live_searchlist').hide();
			}
		})
	});
    
    //点击切换直播类型
	$('.tabbox li').click(function(){
		var state = $(this).attr('data-state');
		var box = $('.ulbox').eq($(this).index()).find('li');
		var total = $('.tabbox li.active').attr('data-total');
		var page = $(this).attr("data-page")
		if(page<total){
			isload=0;
		}
		if(!$(this).hasClass('active')){
			$(this).addClass('active').siblings('li').removeClass('active');
			$('.video_list .ulbox').eq($(this).index()).addClass('show').siblings('ul').removeClass('show');
			if(box.length==0){
				getlist(state,page,'')
			}
		}
	});
	
	//右侧类型选择
	$('.right_box li').click(function(){
		if(!$(this).hasClass('on_li')){
			page = 1;
			var state = $('.tabbox li.active').attr("data-state")
			var typeid = $(this).attr("data-id");
			$(this).addClass('on_li').siblings('li').removeClass('on_li');
			$('.video_list .ulbox.show').html('');
			getlist(state,page,typeid)
		}
		$('.mask0').hide();
		$('.right_box').animate({'right':'-66%'},'fast');
	});
    
    //分类按钮
	$('.classify_icon').click(function(){
		$('.right_box').css({'display':'block'});
		$('.mask0').show();
		$('.right_box').animate({'right':0},'fast');
	});
	
	//点击遮罩隐藏
	$('.mask0').click(function(){
		$(this).hide();
		$('.right_box').animate({'right':'-66%'},'fast');
	});
	
	//下拉加载
	$(window).scroll(function(){
		var page = $('.tabbox li.active').attr('data-page');
		var state = $('.tabbox li.active').attr('data-state');
		var typeid = $('.right_box .on_li').attr('data-id');
		var srollPos = $(window).scrollTop(); //滚动条距顶部距离(页面超出窗口的高度)
		totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
		if(type=='1'){
			if(($(document).height()-50) <= totalheight && !isload) {
				page++;
				$('.tabbox li.active').attr('data-page',page );
				getlist(state,page,typeid);
			}
		}else{
			if(($(document).height()-50) <= totalheight && !aload) {
				apage++;
				getanchor();
			}
		}
	});
    
    
    
    
    
    
    

    
   //获取直播数据
   function getlist(state,page,typeid){
   	  $('rec_video.video_list .ulbox.show').append('<div class="loading"><img src="'+templatePath+'images/loading.png"/></div>');
	  isload = 1;
   	 $.ajax({
        url: "/include/ajax.php?service=live&action=alive&page="+page+"&pageSize=10&typeid="+typeid+"&state="+state+"&title="+keywords,
        type: "GET",
        dataType: "json", //指定服务器返回的数据类型
        success: function (data) {
         if(data.state == 100){
         	var datalist = data.info.list;
         	var totalpage = data.info.pageInfo.totalPage;
         	$('.tabbox li.active').attr('data-total',totalpage );
         	var list = [];
         	for(var i=0 ; i<datalist.length; i++){
	         		var className = '', ftime='', care="",txt="";
	         		//直播状态类型
	         		if(state==1){
	         			className = 'living';
	         		}else if(state==2){
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
									list.push('<p>#'+(datalist[i].typename?datalist[i].typename:"其他")+'</p>');
								list.push('</div>	');
							list.push('</div>');
						list.push('</a>');
					list.push('</li>');	
	         	}

         	$('.rec_video .show.ulbox .loading').remove();
         	$('.rec_video .show.ulbox').append(list.join(''));
         	isload = 0;
         	if(page>=totalpage){
         		isload = 1;
         		$('.rec_video .show.ulbox').append('<div class="loading"><span>已经全部加载</span></div>');
         	}
         	
         }else{
         	$('.rec_video .show.ulbox .loading').remove();
         	$('.rec_video .show.ulbox').append('<div class="loading"><span>暂无数据</span></div>');
         }
        },
        error:function(err){
        	console.log('fail');
        }
     });	
   	
   }
   
   //获取主播数据
   function getanchor(){
   	    aload =1;
   	    $('.anchor_searchlist .anchor_ulbox').append('<div class="loading"><img src="'+templatePath+'images/loading.png"/></div>');
   		$.ajax({
	        url: "/include/ajax.php?service=live&action=anchorList&page="+apage+"&pageSize=10&title="+keywords,
	        type: "GET",
	        dataType: "json", //指定服务器返回的数据类型
	        success: function (data) {
	         if(data.state == 100){
	         	var datalist = data.info.list;
	         	var atotalpage = data.info.pageInfo.totalPage;
	         	$('.tabbox li.active').attr('data-total',totalpage );
	         	$('.anchor_searchlist').prepend('<h2>共<em>'+data.info.pageInfo.totalCount+'</em>个搜索结果</h2>')
	         	
	         	var list = [];
	         	
	         	for(var i=0 ; i<datalist.length; i++){
	         		var className = "",txt = "",addr='';
	         		//判断是否关注
			         	if(datalist[i].isMfollow==1){
			         		className="cared"
			         		txt = "已关注"
			         	}else if(datalist[i].isMfollow==0){
			         		className="";
			         		txt = "关注"
			         	}else{
			         		className="fn-hide";
			         	}
			         	
			        //地址 处理
			        if(datalist[i].addrname){
			        	var len = datalist[i].addrname.length;
			        	if(len>=3){
			        		addr = datalist[i].addrname[1]+' '+datalist[i].addrname[2]+' '+datalist[i].addrname[3]
			        	}else if(len=2){
			        		addr = datalist[i].addrname[1]+' '+datalist[i].addrname[2]
			        	}else{
			        		addr = datalist[i].addrname[1]
			        	}
			        }else{
			        	addr="未填写"
			        }
	         		list.push('<li class="anchor_li">');
						list.push('<a href="'+masterDomain+'/u/user-'+datalist[i].uid+'#live" class="fn-clear">');
							list.push('<div class="left_head">');
								list.push('<img src="'+(datalist[i].photo?datalist[i].photo:"/static/images/noPhoto_40.jpg")+'" />');
							list.push('</div>');
							list.push('<div data-id="'+datalist[i].uid+'" class="acarebtn '+className+' ">');
								list.push('<span>'+txt+'</span>');
							list.push('</div>');
							list.push('<div class="list_info">');
								list.push('<h2 class="anchor_nickname">'+datalist[i].nickname+'</h2>');
								list.push('<p class="info_sign">'+addr+'</p>');
								list.push('<p class="anchor_fans">直播数：'+datalist[i].liveCount+'次 &nbsp;&nbsp;  粉丝：'+datalist[i].totalFans+'人</p>');
							list.push('</div>');
						list.push('</a>');
					list.push('</li>');
	         	}
	
	         	$('.anchor_ulbox .loading').remove();
	         	$('.anchor_ulbox').append(list.join(''));
	         	asload = 0;
	         	if(apage >= atotalpage){
	         		aload = 1;
	         		$('.anchor_ulbox').append('<div class="loading"><span>已经全部加载</span></div>');
	         	}
	         	
	         }else{
	         	$('.anchor_ulbox .loading').remove();
	         	$('.anchor_ulbox').append('<div class="loading"><span>暂无数据</span></div>');
	         }
	        },
	        error:function(err){
	        	console.log('fail');
	        }
	     });	
   }
	
});

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

	// 关注按钮
$('body').delegate('.acarebtn,.carebtn', 'click', function(){
    var x = $(this);
    if (x.hasClass('cared')) {
    	$('.carebox,.mask0').addClass('show');
    	$('.carebox.show li').click(function(){
    		if($(this).hasClass('nocare')){
				follow(x, function(){
					x.removeClass('cared').find('span').text(langData['siteConfig'][19][846]);
				});
    		}
    		$('.carebox,.mask0').removeClass('show');
    	})

    }else{
			follow(x, function(){
				x.addClass('cared').find('span').text(langData['siteConfig'][19][845]);
			});
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
  
    
 //图片2报错
var nofind_c = function(){ 
	var img = event.srcElement; 
	img.src = staticPath+"images/404.jpg"; 
	img.onerror = null;
} 
    