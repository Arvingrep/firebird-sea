$(function(){
	// 出现搜索框
	$(".search_btn").click(function(){
		var t =$(this);
		t.closest('.tab_box').addClass("fn-hide");
		$(".search_box").removeClass("fn-hide");
		$(".search_box #keywords").focus();
	});

	$(".search_cancel").click(function(){
		if(keywords!=''){
			keywords = '';
			$(".ulist_box:not(.fn-hide)").attr("data-page","1").attr("data-load","0")
			getList($(".ulist_box:not(.fn-hide)"))
		}
		$(".top_box .tab_box").removeClass("fn-hide");
		$(".search_box").addClass("fn-hide");
	})
	
	$(".search_clear").click(function(){
		$("#keywords").val('');
		$(".searchbox i.search_clear").hide();
	});
	
	$("#keywords").on("input",function(){
		if($(this).val()){
			$(".searchbox i.search_clear").show();
		}else{
			$(".searchbox i.search_clear").hide();
		}
	});
	
	// 操作
	
	$(".ul_list").delegate(".u_op","click",function(){
		var t = $(this),li = t.closest('li');
		var uid = li.attr('data-id');
		$('html').addClass("noscroll");
		$(".mask_pop").show();
		$(".pop_box").css("bottom",0);
		if(li.hasClass("lahei")){
			$(".pop_box .lh_show").addClass("fn-hide").siblings(".ylh").removeClass('fn-hide');
		}else{
			$(".pop_box .lh_show").removeClass("fn-hide").siblings(".ylh").addClass('fn-hide');
		}
		if(li.hasClass("jinyan")){
			$(".pop_box .jy_show").addClass("fn-hide").siblings(".yjy").removeClass('fn-hide');
		}else{
			$(".pop_box  .jy_show").removeClass("fn-hide").siblings(".yjy").addClass('fn-hide');
		}
		
		$(".pop_box .op_btn").off('click').click(function(){
			var btn = $(this),op = 0,optype= 'lahei';
			if(btn.hasClass("disabled")) return false;
			btn.addClass("disabled");
			if(btn.hasClass("oped")){
				op = 1
			}
			if(btn.closest('.lh_box').length>0){
				optype  = 'lahei';
				if(op==1){
					t.find(".lh").remove();
					li.removeClass(optype);
					operType = 'remove';
				}else{
					t.prepend('<em class="lh">'+langData['live'][2][50]+'</em>');  //拉黑
					li.addClass(optype);
					operType = 'add';
				}
				
			}else if(btn.closest('.jy_box').length>0){
				optype  = 'jinyan';
				if(op==1){
					t.find(".jy").remove();
					li.removeClass(optype);
					operType = 'remove';
				}else{
					t.prepend('<em class="jy">'+langData['live'][2][49]+'</em>');    //禁言
					li.addClass(optype);
					operType = 'add';
				}
			}
			$.ajax({
				url: '/include/ajax.php?service=live&action=operMember',
				data: {aid: chatid, uid: uid, act: optype, type: operType},
				type: "POST",
				dataType: "json",
				success: function(data) {
					btn.removeClass("disabled")
					if (data.state == 100) {
						// li.remove();
						// $(".mask_pop").click();
					} else {
						alert(data.info);
					}
					
					$(".mask_pop").click();
					$(".ulist_box:not(.fn-hide)").attr('data-load','0').attr('data-page',"1")
					getList($(".ulist_box:not(.fn-hide)"));
					
				},
				error: function() {
					btn.removeClass("disabled")
					console.log(langData['siteConfig'][31][135]);  //网络错误，操作失败！
				}
			});
			
			$(".mask_pop").click();
		})
	});
	
	// 隐藏
	$(".pop_box .cancel_btn,.pop_sure .cancel_btn ,.mask_pop").click(function(){
		$(".mask_pop").hide();
		$('html').removeClass("noscroll");
		$(".pop_box").css("bottom","-4.8rem");
		$(".pop_sure").css("bottom","-4.2rem");
	});
	
	
	// 取消禁言/拉黑
	tj = false;
	$(".ul_list").delegate(".u_remove","click",function(){
		if(tj) return false;
		tj = true;
		var t = $(this),li = t.closest('li'),uid = li.attr('data-id'),par = t.closest('.ulist_box');
		var optype = 'laihei'
		$('html').addClass("noscroll");
		$(".mask_pop").show();
		$(".pop_sure").css("bottom",0);
		if(par.hasClass("jy_user")){
			optype = 'jinyan';
		}else{
			optype =  'laihei';
		}
		operAction = optype;
		operType = 'remove';
		operUserid = uid;
		$(".pop_sure h4").click(function(){
			$.ajax({
				url: '/include/ajax.php?service=live&action=operMember',
				data: {aid: chatid, uid: operUserid, act: operAction, type: operType},
				type: "POST",
				dataType: "json",
				success: function(data) {
					tj = false;
					if (data.state == 100) {
						// li.remove();
						// $(".mask_pop").click();
					} else {
						alert(data.info);
					}
					
					$(".mask_pop").click();
					$(".ulist_box:not(.fn-hide)").attr('data-load','0').attr('data-page',"1")
					getList($(".ulist_box:not(.fn-hide)"));
					
				},
				error: function() {
					tj = false;
					console.log(langData['siteConfig'][31][135]);  //网络错误，操作失败！
				}
			});
			
		})
	})
	
	
	
	
	// 切换
	var pageSize = 10, atpage = 1, keywords='';
	// var isload = 0;
	
	var usertype = '';
	$(".tab_box .tab_ul li").click(function(){
		var t = $(this),index = t.index();
		t.addClass("on_chose").siblings('li').removeClass("on_chose");
		if(index){
			usertype = index;
		}else{
			usertype = '';
		}
		$(".ulist_box").eq(index).removeClass("fn-hide").siblings(".ulist_box").addClass("fn-hide");
		$(".ulist_box").eq(index).attr('data-page',"1").attr('data-load',"");
		
		getList($(".ulist_box").eq(index))
		
	})
	// 
	$('.searchbox').submit(function(e) {
		e.preventDefault();
		keywords = $.trim($('#keywords').val());
		atpage = 1;
		$(".tab_box .tab_ul li").eq(0).click();
		
	});
	getList($(".ulist_box:not(.fn-hide)"));
	
	/* 滚动加载更多 */
	$(window).scroll(function(){
		// var h = $('.item').height();
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w;
		var isload = $(".ulist_box:not(.fn-hide)").attr("data-load");
		if ($(window).scrollTop() > scroll && isload=='0') {
			getList($(".ulist_box:not(.fn-hide)"));
		};
	})
	
	
	
	// 数据加载
	function getList(ubox){
		var isload = ubox.attr('data-load');
		if(isload=='1')  return false;
		isload = 1;
		var type = $(".top_box li.on_chose").attr('data-type');
		var data_chose =''
		if(type == 'mute'){
			data_chose = "&mute=1&block=0";
		}else if(type =='block'){
			data_chose = "&mute=0&block=1";
		}
		ubox.find('.loading').html(langData['live'][3][48]);   //努力加载中~
		var atpage = ubox.attr('data-page');
		var total =  ubox.attr('data-total');
		if(atpage==1){
			ubox.find('.ul_list').html('')
		}
		$.ajax({
			url: "/include/ajax.php?service=live&action=member&aid="+chatid+"&pageSize="+pageSize+"&page="+atpage+"&keywords="+keywords+data_chose,
			type: "GET",
			dataType: "json",
			success: function (data) {
				if(data.state==100){
					var html = [];
					var list = data.info.list;
					var totalPage = data.info.pageInfo.totalPage;
					$(".block em").text(data.info.pageInfo.totalBlock);
					$(".total em").text(data.info.pageInfo.totalMember);
					$(".mute em").text(data.info.pageInfo.totalMute)
					
					ubox.attr('data-total',totalPage)
					for(var i= 0; i<list.length; i++){
						var lr     = list[i],
						    uid    = lr.id,
							userid = lr.userinfo.userid
							himg   = lr.userinfo.photo?lr.userinfo.photo:"/static/images/noPhoto_40.jpg",
							nick   = lr.userinfo.username;
							time   = returnHumanTime(lr.date,1);
						if(usertype){
							html.push('<li class="fn-clear"  data-id="'+uid+'"><div class="u_detail fn-clear"><a href="'+masterDomain+'/user/'+userid+'" class="u_himg fn-left"><img src="'+himg+'" onerror="this.src=\'/static/images/noPhoto_40.jpg\'"></a><div class="u_info"><h3>'+nick+'</h3><p>ID：'+userid+' </p></div></div><div class="u_time">'+time+'</div><div class="u_remove fn-clear">'+langData['live'][5][27]+'</div></li>');    //移除
						}else{
							var lahei = lr.block,jinyan = lr.mute;	
							var cls1 = lahei==1?"lahei":"",cls2 = jinyan==1?"jinyan":"";
							var txt1 = lahei==1?"<em class='lh'>"+langData['live'][2][50]+"</em>":"",txt2 = jinyan==1?"<em class='jy'>"+langData['live'][2][49]+"</em>":"";  //经验   拉黑
							html.push('<li class="fn-clear '+cls1+' '+cls2+'" data-id="'+uid+'"><div class="u_detail fn-clear"><a href="'+masterDomain+'/user/'+userid+'" class="u_himg fn-left"><img src="'+himg+'" onerror="this.src=\'/static/images/noPhoto_40.jpg\'"></a><div class="u_info"><h3>'+nick+'</h3><p>ID：'+userid+' </p></div></div><div class="u_time">'+time+'</div><div class="u_op fn-clear">'+txt1+txt2+'</div></li>')
						}
						
					}
					
					if(atpage==1){
						ubox.find('.ul_list').html(html.join(''));
					}else{
						ubox.find('.ul_list').append(html.join(''));
					}
					// ubox.find('.loading').html('');
					isload = 0;
					atpage ++;
					ubox.attr("data-page",atpage);
					ubox.attr('data-load',isload);
					if(atpage > totalPage){
						isload = 1;
						ubox.attr('data-load',isload);
						ubox.find('.loading').html(langData['live'][5][10]);   //没有更多了~
					}
				}else{
					isload = 0;
					 ubox.find('.loading').html(data.info);   //没有更多了~
				}
			},
			error:function (data){ 
				 ubox.find('.loading').html(langData['live'][5][17]);  //没有更多了~
			},
		});
	}
})