$(function(){
	
	//错误提示
	var showMsgTimer;
	function showMsg(txt) {
		showMsgTimer && clearTimeout(showMsgTimer);
		$(".popMsg").remove();
		$("body").append('<div class="popMsg"><p>' + txt + '</p></div>');
		$(".popMsg p").css({
			"margin-left": -$(".popMsg p").width() / 2,
			"left": "50%"
		});
		$(".popMsg").css({
			"visibility": "visible"
		});
		showMsgTimer = setTimeout(function() {
			$(".popMsg").fadeOut(300, function() {
				$(this).remove();
			});
		}, 1500);
	}
	
	
	var page = 1,isload = 0;
	
	getlist();
	function getlist(type){
		if(isload) return false;
		isload = 1;
		$(".hongbao_box").find(".loading").remove();
		$(".hongbao_box").append('<p class="loading">'+langData['live'][4][16]+'</p>');  //加载中~
		var type = $(".shai_box span.on_chose").attr('data-type');
		var hbfrom = $(".shai_list .selected").attr("data-value");
		if(type=='left'){
			state = 1
		}else{
			state = 0
		}
		var url = "/include/ajax.php?service=live&action=chatRoomHongbaoList&chatid="+chatid+"&from="+hbfrom+"&state="+state+"&page="+page+"&pageSize=10";
		
		
		$.ajax({
			url:url,
			type:"GET",
			dataType:"json",
			success:function(data){
				if(data.state==100){
					var list = data.info.list;
					var totalPage = data.info.pageInfo.totalPage;
					var html = [];
					$(".shai_box .left_hb em").text( data.info.pageInfo.totalSurplus);
					for(var i=0; i<list.length; i++){
						var li = list[i];
						var textshow = (userid_now == li.userid)?"<h4>"+langData['live'][3][17]+"</h4>":"<h4>"+li.userinfo.username+"</h4><p>ID:"+li.userinfo.userid+"</p>";   //我发出的
						var note = li.note?li.note:"111";
						var ftime = huoniao.transTimes(li.date,1);
						var id = li.id
						var noclick = (li.get||li.state==1)?"noclick":"";// 不能点击
						var amount = li.amount;  //总金额
						var amount1 = li.amount1;  //剩余金额
						var count = li.count ;    //总个数
						var count1 = li.count1 ;    //剩余个数
						var label = li.get?langData['live'][5][12]:(li.state=='1'?langData['live'][5][13]:langData['live'][5][11] )
						html.push('<li class="hongbao_li '+noclick+'" data-id="'+id+'"><div class="hb_info">');
						html.push('<div class="hb_con fn-left">');
						html.push('<h5>'+langData['live'][4][6]+'</h5>');  //红包内容
						html.push('<div class="count"><span class="money">'+echoCurrency("symbol")+'<em>'+amount+'</em></span>/共'+count+'个</div></div>');
						html.push('<div class="hb_left  fn-left"><h5>'+langData['live'][4][7]+'</h5>');   //剩余
						html.push('<div class="left_count">');
						html.push('<div class="count"><span class="money">'+echoCurrency("symbol")+'<em>'+amount1+'</em></span>/共'+count1+'个</div>');
						// 可领 langData['live'][5][11]   已领取 langData['live'][5][12]   不可领 langData['live'][5][13]
						html.push('<span class="label">'+label+'</span></div></div></div>');
						html.push('<div class="user_info"><div class="show_box">');
						html.push('<div class="user_box "><a class="uimg" href="'+masterDomain+'/u/'+li.userid+'"><img src="'+li.userphoto+'" onerror="this.src=\'/static/images/noPhoto_40.jpg\'"></a>');
						html.push('<div class="udetail">'+textshow+'</div></div>');
						html.push('<div class=" h_info">'+langData['live'][5][14]+'<span><em>H'+id+'</em></span></div></div>');//普通红包
						html.push('<ul class="slidebox">');
						html.push('<li><label>'+langData['live'][5][15]+'</label><span>'+note+'</span></li>');  //红包寄语
						html.push('<li><label>'+langData['live'][5][16]+'</label><span>'+ftime+'</span></li></ul></div></li>');//发送时间
						
					}
					if(page==1){
						$(".hongbao_list").html(html.join(''));
					}else{
						$(".hongbao_list").append(html.join(''));
					}
					$(".hongbao_box").find(".loading").remove();
					page++;
					isload = 0;
					if(page>totalPage){
						isload = 1;
						$(".hongbao_box").append('<p class="loading">'+langData['live'][5][10]+'</p>');   //没有更多了
					}
				}else{
					$(".hongbao_box").find(".loading").remove();
					$(".hongbao_box").append('<p class="loading">'+data.info+'</p>');
				}
			},
			error:function(data){
				$(".hongbao_list").find("loading").html(langData['live'][5][17]);  //加载出错，请稍后重试
			}
		});
		
	}
	
	// 查看红包详情
	$(".hongbao_box").delegate(".h_info","click",function(){
		var t = $(this),li = t.closest("li.hongbao_li");
		if(t.hasClass("open")){
			li.find(".slidebox").css("height","0");
			t.removeClass("open")
		}else{
			t.addClass("open")
			$(".hongbao_box li .slidebox").css("height","0");
			li.find(".slidebox").css("height","1.3rem");
		}
		
		
	});
	
	
	// 抢红包
	$('.hongbao_box').delegate('.hongbao_li .hb_info', 'click', function(){
		var t = $(this), hid = t.closest('li').attr('data-id'),li = t.closest('li');
		if(li.hasClass('noclick')) return false;
		if(t.hasClass('disabled')) return false;
		t.addClass('disabled').find('label').html(langData['siteConfig'][46][105]);  //领取中...
		$.ajax({
			url: '/include/ajax.php?service=live&action=getHongbao',
			data: {h_id: hid},
			type: "GET",
			dataType: "json",
			success: function(data) {
				if (data.state == 100) {
					if (data.info.states == 200) {
						showMsg(langData['siteConfig'][46][108] + '' +echoCurrency(symbol)+data.info.get_amount);  //恭喜抢到：

					} else if (data.info.states == 201) {
						showMsg(langData['siteConfig'][46][106]);  //已抢完
					} else {
						if (data.info.is_fin == 1 && data.info.states == 203) {
							showMsg(langData['siteConfig'][46][106]);  //已抢完

						} else if (data.info.states == 202) {
							showMsg(langData['siteConfig'][46][107]);  //不能重复领取
						}
					}
				} else {
					alert(data.info);
				}
				setTimeout(function(){
					page = 1;
					getlist();
				},1500)
				
			},
			error: function() {
				console.log(langData['siteConfig'][31][135]);  //网络错误，操作失败！
			}
		});
	});
	
	// 筛选
	$(".shai_btn").click(function(){
		$(".shai_list,.mask1").show();
		$("html").addClass("noscroll");
		$(".shai_list li").off("click").click(function(){
			var t = $(this);
			t.addClass("selected").siblings("li").removeClass("selected");
			$(".shai_btn").text(t.text())
			$(".mask1").click();
			page = 1, isload=0;
			$(".hongbao_list").html('');
			getlist();
		})
	});
	
	// 关闭下拉选项
	$('.mask1').click(function(){
		$("html").removeClass("noscroll")
		$(".shai_list,.mask1").hide();
	});
	
	
	// 
	$(".shai_box span").click(function(){
		var t = $(this);
		t.addClass("on_chose").siblings("span").removeClass("on_chose");
		page = 1, isload=0;
		$(".hongbao_list").html('');
		getlist();
	})
	
	
	// 滚动加载
	$(window).scroll(function(){
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w -10;
		if ($(window).scrollTop() >= scroll && !isload) {
			getlist();
		};
	})
})