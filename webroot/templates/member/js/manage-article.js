/**
 * 会员中心新闻投稿列表
 * by guozi at: 20150627
 */

var objId = $("#list");
var keywords = '';
$(function(){

	$(".main-tab li[data-id='"+state+"']").addClass("curr");

	$(".main-tab li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr") && !t.hasClass("add")){
			state = id;
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
			getList();
		}
	});

	//项目
	$(".main-sub-tab li label").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr")){
			atpage = 1;
			t.addClass("curr").siblings("label").removeClass("curr");
			getList();
		}
	});

	getList(1);

	//删除
	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][543], function(){  //你确定要删除这条信息吗？
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=article&action=del&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//删除成功后移除信息层并异步获取最新列表
							par.slideUp(300, function(){
								par.remove();
								setTimeout(function(){getList(1);}, 200);
							});

						}else{
							$.dialog.alert(data.info);
							t.siblings("a").show();
							t.removeClass("load");
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			});
		}
	});
	// 头部搜索
	$('.searchbox form').submit(function(e){
	  e.preventDefault();
	  $('#getTotal').val(langData['siteConfig'][17][36]);//查看统计
	  $('#list, .pagination').show();
		$('.main .table').hide();
	  keywords = $.trim($('.searchbox .keywords').val());
	  getList(1);
	})
	var selectDate = function(el){
		WdatePicker({
			el: el,
			isShowClear: false,
			isShowOK: false,
			isShowToday: false,
			qsEnabled: false,
			dateFmt: 'yyyy-MM',
			maxDate: $('#month').val(),
			ychanged: function(){
        // getArticleTotal();
      },
      Mchanged: function(){
        // getArticleTotal();
      }
		});
	}
	$("#month").on('click',function(){
    selectDate("month");
    $(this).off('click');
	}).blur(function(){
		getArticleTotal();
	})

	function getArticleTotal(wait){
		var wait = wait != 0 ? 200 : 0;
		$('#total0, #total1, #total2, #total3').text('-');
		if(wait){
			setTimeout(function(){
				getArticleTotal(0);
			}, wait)
			return;
		}
		var date = $('#month').val();
		if(date == '') return;
		$.ajax({
			url: '/include/ajax.php?service=article&action=alist&u=1&buMonth='+date,
			type: 'get',
			dataType: 'json',
			success: function(res){
				if(res && res.state == 100){
					$('#total0').text(res.info.total0);
					$('#total1').text(res.info.total1);
					$('#total2').text(res.info.total2);
					$('#total3').text(res.info.total3);
				}else{
					$('#total0, #total1, #total2, #total3').text(0);
				}
			},
			error: function(){
				$('#total0, #total1, #total2, #total3').text(langData['siteConfig'][38][84]);//获取失败
			}
		})
	}

	$('#getTotal').click(function(){
		getArticleTotal();
		var t = $(this);
		if(t.hasClass('openTotal')){
			t.val(langData['siteConfig'][17][36]);//查看统计
			$('#list, .pagination').show();
			$('.main .table').hide();
		}else{
			t.val(langData['siteConfig'][38][86]);//查看列表
			$('#list, .pagination').hide();
			$('.main .table').show();
		}
		t.toggleClass('openTotal');
	})

});

function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');  //加载中，请稍候
	$(".pagination").hide();

	var mold = $('.main-sub-tab label.curr').data('id');

	$("#total").html(0);
	$("#audit").html(0);
	$("#gray").html(0);
	$("#refuse").html(0);

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=article&action=alist&u=1&orderby=1&mold="+mold+"&state="+state+"&title="+encodeURIComponent(keywords)+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  // //暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){

						var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
						var param = t + "do=edit&id=";
						var urlString = editUrl + param;

						for(var i = 0; i < list.length; i++){
							var item        = [],
									id          = list[i].id,
									title       = list[i].title,
									color       = list[i].color,
									typeName    = list[i].typeName,
									url         = list[i].url,
									common      = list[i].common,
									litpic      = list[i].litpic,
									click       = list[i].click,
									source      = list[i].source,
									waitpay     = list[i].waitpay,
									pubdate     = huoniao.transTimes(list[i].pubdate, 1);

							url = waitpay == "1" || list[i].arcrank != "1" ? 'javascript:;' : url;

							html.push('<div class="item fn-clear" data-id="'+id+'">');
							if(litpic != ""){
								html.push('<div class="p"><a href="'+url+'" target="_blank"><i></i><img src="'+litpic+'" /></a></div>');
							}
							if(waitpay == "1"){
								html.push('<div class="o"><a href="javascript:;" class="stick delayPay" style="color:#f60;"><s></s>'+langData['siteConfig'][23][113]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
							//立即支付--删除
							}else{
								html.push('<div class="o"><a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
								//编辑--删除
							}
							html.push('<div class="i">');

							var arcrank = "";
							if(list[i].arcrank == 0){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][9][21]+'</span>';  //未审核
							}else if(list[i].arcrank == 2){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';   //审核拒绝
							}

							html.push('<p>'+langData['siteConfig'][19][393]+'：'+typeName+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][11][8]+'：'+pubdate+arcrank+'</p>');   //发布时间
							html.push('<h5><a href="'+url+'" target="_blank" style="color:'+color+';">'+title+'</a></h5>');

							var sour = "";
							if(source != ""){
								sour = '&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][395]+'：'+source;  //来源
							}

							var reward = langData['siteConfig'][19][397];  //暂无打赏
							if(list[i].reward.count > 0){
								reward = list[i].reward.count+langData['siteConfig'][13][26]+' '+langData['siteConfig'][13][13]+list[i].reward.amount+echoCurrency('short');   //次---共
							}

							html.push('<p>'+langData['siteConfig'][19][394]+'：'+click+langData['siteConfig'][13][26]+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][6][114]+'：'+common+langData['siteConfig'][13][49]+sour+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][396]+'：'+reward+'</p>');
							//浏览--次--评论--条--打赏
							html.push('</div>');
							html.push('</div>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>"); //暂无相关信息！
					}

					switch(state){
						case "":
							totalCount = pageInfo.totalCount;
							break;
						case "0":
							totalCount = pageInfo.gray;
							break;
						case "1":
							totalCount = pageInfo.audit;
							break;
						case "2":
							totalCount = pageInfo.refuse;
							break;
					}


					$("#total").html(pageInfo.totalCount);
					$("#audit").html(pageInfo.audit);
					$("#gray").html(pageInfo.gray);
					$("#refuse").html(pageInfo.refuse);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>"); //暂无相关信息！
			}
		}
	});
}
