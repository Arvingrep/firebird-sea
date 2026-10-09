
$(function(){
	var page = 1, isload = 0, totalpage = 0;
	var userid = $.cookie(cookiePre+"login_user");
	if(userid == null || userid == ""){
		window.location.href = masterDomain+'/login.html';
		
	}else{
		getmyorder()
	}

	 //下拉加载
	$(window).scroll(function(){
		var typeid = $('.right_box .on_li').attr('data-id');
		var srollPos = $(window).scrollTop(); //滚动条距顶部距离(页面超出窗口的高度)
		totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
		if(($(document).height()-50) <= totalheight && !isload) {
			page++;
			getmyorder();
		}
	});

	//取消预约
	$('.live_box').delegate('.ordered','click',function(){
		var id = $(this).parents('li').attr('data-id');
		var li = $(this).parents('li');
		$('.carebox,.mask0').addClass('show');
		$('.carebox li').off('click').on('click',function(){
			if($(this).hasClass('nocare')){
				$.ajax({
			        url: "/include/ajax.php?service=live&action=liveBooking&aid="+id,
			        type: "GET",
			        dataType: "json", //指定服务器返回的数据类型
			        crossDomain:true,
			        success: function (data) {
			         if(data.state == 100){
			         	li.remove(); //取消成功
			         	showMsg('取消成功')
			         }else{
			         	alert(data.info)
			         }
			        },
			        error:function(err){
			        	console.log('fail');
			        }
				});
			}
			$('.carebox,.mask0').removeClass('show');
		})
		
		return false;
	})
	
	function getmyorder(){
		isload = 1;
	    	$('.live_box .ulbox').append('<div class="loading"><img src="'+templatePath+'/images/loading.png"/></div>');
		   	$.ajax({
		        url: "/include/ajax.php?service=live&action=alive&page="+page+"&pageSize=10&mybooking=1",
		        type: "GET",
		        dataType: "json", //指定服务器返回的数据类型
		        success: function (data) {
		         if(data.state == 100){
		         	var datalist = data.info.list;
		         	var totalpage = data.info.pageInfo.totalPage;
		         	var list = [];
		         	for(var i=0 ; i<datalist.length; i++){
			         	var className = '', class_2='',txt="";
			         	//直播状态类型
			         	if(datalist[i].state==1){
			         		className = 'live_li';
			         		txt="<em>正在直播</em>"
			         	}else if(datalist[i].state==2){
			         		className = 'lived_li';
			         		txt="<h3><em>直播已结束</em></h3><p>点击查看回放</p>"
			         	}else{
			         		className = 'wlive_li';
			         		txt="<em>"+datalist[i].ftime+"</em>";
			         		class_2 = 'live_before'
			         	}
			         	
			         	list.push('<li data-id="'+datalist[i].id+'" class="video_box libox '+className+'">');
							list.push('<div class="anchor_info fn-clear">');
								list.push('<a href="'+masterDomain+'/u/user-'+datalist[i].user+'#live">');
									list.push('<div class="anchor_img">');
										list.push('<img src="'+(datalist[i].photo?datalist[i].photo:"/static/images/noPhoto_40.jpg")+'" />');
									list.push('</div>');
									list.push('<h2><span>'+datalist[i].nickname+'</span>'+(datalist[i].level?"<img src="+datalist[i].level+">":"")+'</h2>');
								list.push('</a>');
								list.push('<div class="ordered">取消预约</div>');
							list.push('</div>');
							list.push('<a href="'+datalist[i].url+'">');
								list.push('<div class="video_img">');
									list.push('<div class="video_state '+class_2+'">'+txt+'</div>');
									list.push('<img src="'+datalist[i].litpic+'" />');
								list.push('</div>');
								list.push('<div class="info_box">');
									list.push('<div class="look_num">'+datalist[i].click+'</div>');
									list.push('<div class="video_info">');
										list.push('<h3>'+datalist[i].title+'</h3>');
										list.push('<p>#'+(datalist[i].typename?datalist[i].typename:"其他")+'</p>');
									list.push('</div>');	
								list.push('</div>');
							list.push('</a>');
						list.push('</li>');
			         		
			         	}
		
		         	$('.live_box .ulbox .loading').remove();
		         	$('.live_box .ulbox').append(list.join(''));
		         	isload = 0;
		         	if(page>=totalpage){
		         		isload = 1;
		         		$('.live_box .ulbox').append('<div class="loading"><span>没有更多了~</span></div>');
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
	//提示窗
	var showErrTimer;
	var showMsg = function(txt,time){
		ht = time?time:1500
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

});
