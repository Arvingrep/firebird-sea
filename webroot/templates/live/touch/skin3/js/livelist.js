var isload = 0, totalpage=0, page = 1;
var history_search = 'index_history_search';

$(function(){
	if($('.show.ulbox').size()>0){
		getlist(1,page,'');
	}

	//直播切换
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

	//搜索页面
	$('.search_icon').click(function(){
		$('.search_page').fadeIn(300);
		//加载历史记录
		var hlist = [];
		var history = utils.getStorage(history_search);
		if(history){
			history.reverse();
			for(var i = 0; i < history.length; i++){
				hlist.push('<li><a href="javascript:;">'+history[i]+'</a><i class=""></i></li>');
			}
			$('.search_result ul').html(hlist.join(''));
		}
	});
	//搜索提交
	$('#keywords').keydown(function(e){
		if(e.keyCode==13){
			var keywords = $('#keywords').val();
			var type = $('.chose_type').attr('data-type');
			if(!keywords){
				return false;
			}
			//记录搜索历史
			var history = utils.getStorage(history_search);
			history = history ? history : [];
			if(history && history.length >= 10 && $.inArray(keywords, history) < 0){
				history = history.slice(1);
			}

			// 判断是否已经搜过
			if($.inArray(keywords, history) > -1){
				for (var i = 0; i < history.length; i++) {
					if (history[i] === keywords) {
						history.splice(i, 1);
						break;
					}
				}
			}
			history.push(keywords);
			var hlist = [];
			for(var i = 0; i < history.length; i++){
				hlist.push('<li><a href="javascript:;">'+history[i]+'</a><i class=""></i></li>');
			}
			$('.search_result ul').html(hlist.join(''));
			utils.setStorage(history_search, JSON.stringify(history));
		}
	})


	//取消
	$('.cancel_btn').click(function(){
		$('.search_page').fadeOut(300);
	});
	//删除搜索历史
	$('.search_result').delegate('li>i','click',function(){
		var t =$(this); txt = t.parents('li').find('a').text();
		var history = utils.getStorage(history_search);
		history.splice(history.indexOf(txt),1)
		utils.setStorage(history_search, JSON.stringify(history));
		$(this).parents('li').remove();
		console.log(history)
		return false;
	});


//	$('.cancel_care').click(function(){
//		$('.carebox,.mask0').removeClass('show');
//	});

	//搜索切换
	$('.chose_type').click(function(){
		$('.chose_box').toggle();
		$('.chose_box li').click(function(){
			var txt = $(this).text();
			var type = $(this).attr("data-type");
			$('.chose_type').text(txt).attr('data-type',type);
			$('#searchtype').val(type)
			$('.chose_box').hide();
		})
	});

	//历史搜索记录点击
	$('.search_result').delegate('li','click',function(t){
		if(t.target != $(this).find('i')[0]){
			$('#keywords').val($(this).text());
			$('.form_search').submit();
		}
	})
	//分类按钮
	$('.classify_icon').click(function(){
		$('.right_box').css({'display':'block'});
		$('.mask0').show();
		$('.right_box').animate({'right':0},'fast');
	})

	//点击遮罩隐藏
	$('.mask0').click(function(){
		$(this).hide();
		$('.right_box').animate({'right':'-66%'},'fast');
	});

	//点击分类筛选
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

	//下拉加载
	$(window).scroll(function(){
		var page = $('.tabbox li.active').attr('data-page');
		var state = $('.tabbox li.active').attr('data-state');
		var typeid = $('.right_box .on_li').attr('data-id');
		var srollPos = $(window).scrollTop(); //滚动条距顶部距离(页面超出窗口的高度)
		totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
		if(($(document).height()-50) <= totalheight && !isload) {
			page++;
			$('.tabbox li.active').attr('data-page',page );
			getlist(state,page,typeid);
		}
	});

	//获取数据的方法
	function getlist(state,page,typeid){
		isload =1;
		$('.show.ulbox').append('<div class="loading"><img src="'+templatePath+'/images/loading.png"/></div>');
		$.ajax({
        url: "/include/ajax.php?service=live&action=alive&orderby=time&pageSize=10&page="+page+"&state="+state+"&typeid="+typeid,
        type: "GET",
        dataType: "json", //指定服务器返回的数据类型
        success: function (data) {
         if(data.state == 100){
         	var datalist = data.info.list;
         	var totalpage = data.info.pageInfo.totalPage;
         	$('.tabbox li.active').attr('data-total',totalpage );
         	var list = [];
         	for(var i=0 ; i<datalist.length; i++){

         		var className = '', ftime='' ,care='',txt="";
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
							list.push('<img src="'+datalist[i].litpic+'" />');
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
         	$('.show.ulbox .loading').remove();
         	$('.show.ulbox').append(list.join(''));
         	isload = 0;
         	if(page>=totalpage){
         		isload = 1;
         		$('.show.ulbox').append('<div class="loading"><span>已经全部加载</span></div>');
         	}

         }else{
         	$('.show.ulbox .loading').remove();
         	$('.show.ulbox').append('<div class="loading"><span>暂无数据</span></div>');
         }
        },
        error:function(err){
        	console.log('fail');
        }
     });
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
    		location.reload();
    	})

    }else{
		follow(x, function(){
			x.addClass('cared').find('span').text(langData['siteConfig'][19][845]);
		});
		showMsg('<img class="gou" src="'+templatePath+'images/gou.png"><em>关注成功</em>');
		setTimeout(function(){
			location.reload();
		},1500)

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

})



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
