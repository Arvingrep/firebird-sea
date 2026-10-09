$(function(){
	var page = 1;
	
	var rpageSize = 7 ,rpage =1;
	// 加载报名人
	getregList()
	function getregList(){
		if($(".more_btn").hasClass('disabled')) return false;
		$(".more_btn").text("加载中~").addClass('disabled');
		$.ajax({
			url : "/include/ajax.php?service=huodong&action=regList&hid="+id+"&page="+rpage+"&pageSize="+ rpageSize,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state==100){
					var list = data.info.list;
					var html = [];
					for(var i=0; i<list.length; i++){
						const dlist = list[i];
						var photo = dlist.photo?dlist.photo:"/static/images/noPhoto_100.jpg"
						html.push('<li class="li_reg"><a href="'+member_userDomain+'/user/'+dlist.uid+'">');
						html.push('<div class="head_img"><img src="'+photo+'" onerror="this.src=\'/static/images/noPhoto_60.jpg\'"></div>');
						html.push('<h5>'+(dlist.nickname?dlist.nickname:langData['huodong'][0][42])+'</h5>');  //{#*  匿名 *#}
						html.push('<p>'+transTimes(dlist.date,2)+'</p></a></li>');
					}
					if(rpage==1){
						$(".ulbox ul").html(html.join(''))
					}else{
						$(".ulbox ul").append(html.join(''))
					}
					rpage++;
					$(".more_btn").text("展开").removeClass('disabled');
					if(rpage > data.info.pageInfo.totalPage){
						$(".more_btn").addClass("open").text("收起");
					}
				}
			}
		});
	}
	
	// 查看报名的人
	$(".more_btn").click(function(){
		var t = $(this);
		if(t.hasClass('open')){
			t.removeClass('open').text('展开');
			console.log($(".ulbox ul li").length);
			rpage = 2 ; 
			$(".ulbox ul li").each(function(){
				if($(this).index()>=7){
					$(this).remove();
				}
			})
		}else{
			getregList();
		}
		
		
	});
	//转换PHP时间戳
		function transTimes(timestamp, n){
			
            const dateFormatter = huoniao.dateFormatter(timestamp);
            const year = dateFormatter.year;
            const month = dateFormatter.month;
            const day = dateFormatter.day;
            const hour = dateFormatter.hour;
            const minute = dateFormatter.minute;
            const second = dateFormatter.second;
            
			if(n == 1){
				return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
			}else if(n == 2){
				return (year+'-'+month+'-'+day);
			}else if(n == 3){
				return (month+'-'+day);
			}else{
				return 0;
			}
		}
	getCommt()
	function getCommt(){
		$(".commtlist_box .more").html(langData['huodong'][2][19]);   //加载中~
		$.ajax({
			url : "/include/ajax.php?service=member&action=getComment&type=huodong-detail&son=1&aid="+id+"&page="+page+"&pageSize=5",
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
					$(".commtlist_box h4 em").html(pageInfo.totalCount)
					for(var i = 0; i < list.length; i++){
						var src = staticPath+'images/noPhoto_100.jpg';
						if(list[i].user.photo){
							// src = huoniao.changeFileSize(list[i].user.photo, "middle");
							src = list[i].user.photo;
						}
						var zan = '' ; 
						if(list[i].zan_has){
							zan = 'zaned'
						}else{
							zan = '';
						}
						html.push('<li data-id="'+list[i].id+'" data-uid="'+list[i].user.userid+'" data-name="'+list[i].user.nickname+'" class="commt_li">');
						html.push('<div class="left_img"><img onerror="javascript:this.src=\''+staticPath+'images/noPhoto_40.jpg\';" src="'+src+'" /></div>');
						html.push('<div class="right_txt"><div class="btns_box">');
						html.push('<h3 class="c_nick">'+list[i].user.nickname+'</h3>');
						html.push('<div class="btn_group"><a href="javascript:;" class="reply_btn"><i></i><em>'+langData['huodong'][2][20]+'</em></a><a href="javascript:;" class="zan_btn '+zan+'"><i></i><em>'+(list[i].zan!="0"?list[i].zan:"")+'</em></a></div></div>');  //回复
						html.push(' <div class="commt_con">'+list[i].content+'</div>');
						html.push('<p class="pubdate">'+list[i].ftime+(list[i].iphome ? ' · ' + list[i].iphome : '')+'</p>');
						html.push('<div class="reply_box"  data-id="'+list[i].id+'" data-uid="'+list[i].user.userid+'" data-name="'+list[i].user.nickname+'"><input type="text" placeholder="'+langData['huodong'][2][20]+' '+list[i].user.nickname+'： " ><button type="button" class="re_btn">'+langData['huodong'][2][20]+'</button></div>')
						if(list[i]['lower']!=undefined && list[i]['lower'].count > 0 && list[i]['lower'].list!=null){
							html.push('<div class="reply_list"><i class="arr"></i><ul class="reply_ul">');
							html.push(getLowerReply(list[i].lower.list, list[i].user));
							html.push('</ul></div>')
						}
						html.push(' </div></li>');  //回复
					}

					if(page==1){
						$(".commt_ul").html(html.join(""));
					}else{
						$(".commt_ul").append(html.join(""));
					}
					$(".commtlist_box .more").remove();
					if(page < pageInfo.totalPage){
						$(".commtlist_box").append('<div class="more"><a href="javascript:;"><span>'+langData['huodong'][2][21]+'</span><i></i></a></div>');
					}//更多评论
				}else{
					if(page == 1){
						$(".commtlist_box").append('<div class="more">'+langData['huodong'][2][22]+'</div>');  //暂无评论！
					}
				}
			}
		});
	}
	
		//评论子级
		function getLowerReply(arr, member,flag){
			var retxt = '';
			if(flag){
				retxt = langData['huodong'][2][20]+ " <em>"+member.nickname+"：</em> "
			}
			if(arr){
				var html = [];
				for(var i = 0; i < arr.length; i++){
					var src = staticPath+'images/noPhoto_100.jpg';
					if(arr[i].user.photo){
						// src = huoniao.changeFileSize(arr[i].user.photo, "middle");
						src = arr[i].user.photo;
					}
					var zan = '';
					if(arr[i].zan_has){
						zan = 'zaned'
					}else{
						zan = '';
					}
					html.push('<li class="reply_li" data-id="'+arr[i].id+'" data-uid="'+arr[i].user.userid+'" data-name="'+arr[i].user.nickname+'">');
					html.push('<div class="left_img"><img onerror="javascript:this.src=\''+staticPath+'images/noPhoto_40.jpg\';" src="'+src+'" /></div>');
					html.push('<div class="right_txt"><div class="btns_box"><h3 class="c_nick">'+arr[i].user.nickname+'</h3>');
					html.push('<div class="btn_group"><a href="javascript:;" class="reply_btn"><i></i><em>'+langData['huodong'][2][20]+'</em></a><a href="javascript:;" class="zan_btn '+zan+'"><i></i><em>'+(arr[i].zan!='0'?arr[i].zan:"")+'</em></a></div></div>');
					html.push('<div class="commt_con">'+retxt+arr[i].content+'</div><p class="pubdate">'+arr[i].ftime+(arr[i].iphome ? ' · ' + arr[i].iphome : '')+'</p>');
					html.push(' <div class="reply_box"  data-id="'+arr[i].id+'" data-uid="'+arr[i].user.userid+'" data-name="'+arr[i].user.nickname+'"><input type="text" placeholder="'+langData['huodong'][2][20]+' '+arr[i].user.nickname+'： " ><button type="button" class="re_btn">'+langData['huodong'][2][20]+'</button></div></div></li>');
					
					if(arr[i]['lower']!=undefined && arr[i]['lower'].count > 0 && arr[i]['lower'].list!=null){
						html.push(getLowerReply(arr[i].lower.list, arr[i].user,1));
					}
				}
				return html.join("");
			}
		}

	// 加载更多评论
	$('.commtlist_box').delegate(".more","click",function(){
		page = page + 1;
		getCommt();
	});
	
	// 选择票种
	$(".ticketBox li").click(function(){
		var t = $(this);
		if(t.hasClass("nochose")) {
			return false;
		}
		t.siblings('li').removeClass('chosed');
		t.toggleClass('chosed')
	});
	
	// 收藏活动
	$(".shou").click(function(){
		var t = $(this), type = "add";
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			huoniao.login();
			return false;
		}

		if(t.hasClass("shoued")){
			type = "del";
			t.removeClass("shoued").find("em").html(langData['huodong'][0][31]);  //收藏
		}else{
			t.addClass("shoued").find("em").html(langData['huodong'][0][47]);  //已收藏
		}
		$.post("/include/ajax.php?service=member&action=collect&module=huodong&temp=detail&type="+type+"&id="+id);
	});
	
	// 顶部导航栏显示
	$(window).scroll(function(){
		if($(".fixedpane").hasClass("fixed")){
			$(".top_nav").slideDown();
		}else{
			$(".top_nav").hide();
		}
	});

	// 二维码显示
	$(".code_btn").hover(function(){
		var p = $(this).parents('li');
		p.find(".code_box").show();
	},function(){
		var p = $(this).parents('li');
		p.find(".code_box").hide();
	})

	// 报名
	$(".baoming").click(function(){
		var t = $(this);
		var fid = $(".ticketBox li.chosed").data("id");
		//验证登录
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			huoniao.login();
			return false;
		}
        if(t.hasClass('isbaoming')) return false;
		if(t.hasClass("cancel")){
			if(confirm(langData['huodong'][2][23])){    //确认取消报名吗？
				t.addClass("loading");
				$.ajax({
					url: "/include/ajax.php?service=huodong&action=cancelJoin&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							alert(data.info);
							location.reload();
						}else{
							alert(data.info);
							t.removeClass("loading");
						}
					},
					error: function(){
						alert(langData['huodong'][2][24]);  //"网络错误，操作失败，请稍候重试！"
						t.removeClass("loading");
					}
				});
			}
			return false;
		}
		if(feetype == 1 && (fid == undefined || fid == 0 || fid == "")){
			alert(langData['huodong'][2][25]);  //请选择票种
			return false;
		}
		$(".mask_pop,.pop_box").show();
		$("html").addClass("noscroll");
		
	});
	
	
	
	// 关闭报名
	$(".close_pop,.mask_pop").click(function(){
		$(".mask_pop,.pop_box").hide();
		$("html").removeClass("noscroll");
	})
	
	
	// 单选框
	$(".single_chose").click(function(){
		var t = $(this);
		t.addClass("chosed").siblings('.single_chose').removeClass("chosed");
		t.siblings('input[type="hidden"]').val(t.attr('data-val'));
	});
	
	// 多选框
	$(".multi_chose").click(function(){
		var t = $(this);
		t.toggleClass("chosed");
		var p = t.parents('dd').find('.multi_chose.chosed');
		var chose = [];
		p.each(function(){
			var val = $(this).attr('data-val');
			chose.push(val)
		})
		t.siblings('input[type="hidden"]').val(chose.join('、'));
	});
	
	// 选择区号
	$(".areacode").click(function(e){
		console.log($('.phone_dl').position().top)
		var top = $('.phone_dl').position().top +$('.phone_dl').height();
		$(".arealist").show().css("top",(top+20));
		$(".arealist li").click(function(){
			var t = $(this);
			var code = t.attr('data-code');
			$(".areacode").attr('data-val',code).find('em').text(code);
			 
		})
		$(document).one('click',function(){
			$(".arealist").hide();
		});
		 e.stopPropagation();  //停止事件传播
	});
	
	// 提交报名信息
	$(".sure_btn").click(function(){
		var tj = true, data = [];
		var areaCode = $(".areacode").attr('data-val');
		var fid = $(".ticketBox li.chosed").data("id");
		$(".box_in dl").each(function(){
			if(!tj) return false;
			var dl = $(this), title = dl.attr('data-id'), type = dl.attr('data-type'), required = dl.attr('data-required');
			var val;
			//单行文本
			if(type == 'text'){
				val = $.trim(dl.find('input').val());
			}
			//多行文本
			else if(type == 'text_long'){
				val = $.trim(dl.find('textarea').val());
			}
			//单选文本
			else if(type == 'single_vote'){
				val = dl.find('input:hidden').val();
			}	
			//多选文本
			else if(type == 'multi_vote'){
				val = dl.find('input:hidden').val();
			}
			
			if(required == '1' && (val == '' || val == undefined)){
				tj = false;
				alert(langData['huodong'][2][26]+(type == 'text' || type == 'text_long' ? langData['huodong'][2][27] : langData['huodong'][2][28]) + title);  //请选择，请输入
				return false;
			}
			
			if(val != '' && val != undefined){
				data.push('{"'+title+'": "'+val+'"}');
			}
			
		});
		
		if(!tj) return false;
		data = '['+data.join(',')+']';
	
		$.ajax({
			url: "/include/ajax.php?service=huodong&action=join&id="+id+"&fid="+fid+"&areaCode="+areaCode+"&data="+data,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					if(feetype == 1 && data.info != langData['huodong'][2][29]){  //报名成功！
						// location.href = data.info;
						if (typeof (data.info) == 'object') {
								info = data.info;
								orderurl = data.info.orderurl;
								cutDown = setInterval(function () {
									$(".payCutDown").html(payCutDown(info.timeout));
								}, 1000)

								var datainfo = [];
								for (var k in info) {
									datainfo.push(k + '=' + info[k]);
								}
								$("#amout").text(info.order_amount);
								$('.payMask').show();
								$('.payPop').show();

								// if (usermoney * 1 < info.order_amount * 1) {
								//
								// 	$("#moneyinfo").text('余额不足，');
								// }
							   if (usermoney * 1 < info.order_amount * 1) {

								   $("#moneyinfo").text('余额不足，');
								   $("#moneyinfo").closest('.pay_item').addClass('disabled_pay')
							   }else{
								   $("#moneyinfo").text('可用');
								   $("#moneyinfo").closest('.pay_item').removeClass('disabled_pay')
							   }
							   if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
								   $("#bonusinfo").text('额度不足，可用');
								   $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
							   }else if( bonus * 1 < info.order_amount * 1){
								   $("#bonusinfo").text('余额不足，');
								   $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
							   }else{
								   $("#bonusinfo").text('');
								   $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
							   }
								ordernum = info.ordernum;
								order_amount = info.order_amount;

								$("#ordertype").val('');
								$("#service").val('huodong');
								service = 'huodong';
								var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
								$('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));

						   }
					}else{
						alert(langData['huodong'][2][29]);   //报名成功！
						$(".close_pop").click();
						location.reload();
					}
				}else{
					alert(data.info);
				}
			},
			error: function(){
				alert(langData['huodong'][2][24]);  //"网络错误，操作失败，请稍候重试！"
			}
		});
		return false;
	
	})

	
	
	// 关注活动发起人
	$(".organzer_box .care_btn").click(function(){
		var t = $(this),userid = t.attr('data-uid');
		if (t.hasClass('cared')) {
			follow(t, function(){
				t.removeClass('cared');  //关注
				t.find('em').html(langData['siteConfig'][19][846]);
			});
		}else{
			follow(t, function(){
				t.addClass('cared');
				t.find('em').text(langData['siteConfig'][19][845]);  //已关注
			});
		}
	});
	
	function follow(t, func){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			location.href = masterDomain + '/login.html';
			return false;
		}

		if(t.hasClass("disabled")) return false;
		t.addClass("disabled");
		$.post("/include/ajax.php?service=member&action=followMember&id="+t.data("uid"), function(){
			t.removeClass("disabled");
			func();
		});
	}
	
	
	// 输入框监听
	$(".commtlist_box").on("input propertychange",'.reply_box.show input' ,function(){
		var con = $(this).val();
		if(con!=''){
			$(this).siblings('.re_btn').addClass('onbtn');
		}else{
			$(this).siblings('.re_btn').removeClass('onbtn');
		}
	});
	$(".commtbox textarea").on("input propertychange" ,function(){
		var con = $(this).val();
		if(con!=''){
			$('.commt_btn').addClass('onbtn');
		}else{
			$('.commt_btn').removeClass('onbtn');
		}
	})
	
	// 发留言
	var rid = 0, uid = 0; uname = "";
	$(".commt_btn").click(function(){
		if($(this).hasClass("onbtn")){
			var t = $(this);
			var con = $(".commtbox textarea");
			rid = 0;
			sendReply(t, con);
		}
		
	});
	// 回复框显示
	$('.commtlist_box').delegate(".reply_btn","click",function(){
		var t = $(this);
		var p = t.closest('.right_txt');
		if(p.children('.reply_box').hasClass("show")) {
			p.children('.reply_box').removeClass('show').slideUp();
		}else{
			$('.reply_box').removeClass('show').stop().slideUp()
			p.children('.reply_box').addClass('show').slideDown();
		}
		
		rid = p.children('.reply_box').attr('data-id');
		uid = p.children('.reply_box').attr('data-uid');
		uname = p.children('.reply_box').attr("data-name");
	});
	// 发布回复
	$(".commtlist_box").delegate(".re_btn.onbtn","click",function(){
		var t = $(this);
		var con = t.siblings("input"); 
		sendReply(t, con);
	})
	
	function sendReply(t, content){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			huoniao.login();
			return false;
		}

		if(!t.hasClass("disabled") && $.trim(content.val()) != ""){
			t.addClass("disabled");

			if(rid == undefined || rid == ''){
				var url = '/include/ajax.php?service=member&action=sendComment&check=1&type=huodong-detail&aid=' + id;
			}else{
				var url = '/include/ajax.php?service=member&action=replyComment&check=1&id=' + rid;
			}
			rid = rid == undefined ? 0 : rid;

			$.ajax({
				url: url,
				data: "sco1=1&content="+encodeURIComponent(content.val()),
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){

						var info = data.info;
						content.val("");
						t.removeClass('onbtn');
						// 重新加载评论
						$(".commtlist_box .more").remove();
						page = 1 ; 
						getCommt();
						t.removeClass("disabled");

					}else{
						alert(data.info);
						t.removeClass("disabled");
					}
				},
				error: function(){
					alert(langData['huodong'][2][30]);  //网络错误，发表失败，请稍候重试！
					t.removeClass("disabled");
				}
			});
		}
		}

	// 滚动
	$(window).scroll(function(){
		$('.scrollbox').each(function(){
			var scroll = $(this).offset().top;
			var wscroll = $(window).scrollTop()+200;
			if(wscroll>=scroll){
				var index = $(this).index();
				$(".top_nav li").eq(index).addClass("on").siblings('li').removeClass("on");
			}
			
		})
	});
	
	
	$(".top_nav li").click(function(){
		$(this).addClass("on").siblings('li').removeClass("on");
		var i = $(this).index();
		
		$(window).scrollTop($('.scrollbox').eq(i).offset().top-200)
	})
	
	
	
	// 点赞
	$('.commtlist_box').delegate(".zan_btn","click",function(){
		var t = $(this);
		if(t.hasClass('disabled')) return ;
		t.addClass('disabled');
		var action = "add" ;  //操作
		var num = (t.find('em').text()*1)?t.find('em').text()*1:0
		var rid = t.closest('li').attr('data-id')
		if(t.hasClass('zaned')){
			action = "del"
			num = num-1;
		}else{
			action = "add";
			num = num+1;
		}
		$.ajax({
			url: "/include/ajax.php?service=member&action=dingComment&id="+rid+"&type="+action,
			type: "GET",
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				if (data.state == 100) {
					t.find('em').text(num);
					if(action=="add"){
						t.addClass('zaned')
					}else{
						t.removeClass('zaned')
					}
				} else {
					alert(data.info)
				}
				t.removeClass('disabled');
			},
			error: function(err) {
				console.log(err);
				t.removeClass('disabled');
			}
		});
		
	});
	
	// 地图
	$('.appMapImg').attr('src', typeof MapImg_URL != "undefined" ? MapImg_URL : "");
    $('.appMapBtn').attr('href', OpenMap_URL);
})