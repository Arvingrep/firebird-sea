$(function() {
	var device = navigator.userAgent;
	if (device.indexOf('huoniao_iOS') > -1) {
		$('.header').addClass('padTop20');
		$('.choose-tab').css('top', 'calc(.95rem + 20px)');
		$('.list').css('margin-top', 'calc(1.75rem + 20px)');
		$('.choose-box').css('top', 'calc(1.79rem + 20px)');
	}

	var urlAddrid = getParam("addrid");
	function getParam(paramName) {
			paramValue = "", isFound = !1;
			if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
					arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
					while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
			}
			return paramValue == "" && (paramValue = null), paramValue
	}

	var	mask = $('.mask'),
		areaScroll = infoScroll = sortScroll = moreScroll = null,
		areaArr = infoArr = sortArr = moreArr = sortSecondArr = [],
		chooseScroll = function(obj){
			return new iScroll(obj, {vScrollbar: false, mouseWheel: true, click: true});
		},

		init = {

			//区域
			getArea: function(){
				var areaObj = $("#scroll-area");
				$.ajax({
			        url: '/include/ajax.php?service=business&action=addr&son=1',
			        dataType: 'json',
			        success: function(data){
			          if(data.state == 100){

			            var list = data.info;
			            var html = [];
									var cla = urlAddrid ? "" : " class='on'";
			            html.push('<li data-id=""'+cla+'><a href="javascript:;">'+langData['siteConfig'][22][96]+'</a></li>');
			            for(var i = 0; i < list.length; i++){
										var idcla = urlAddrid && urlAddrid == list[i].id ? " class='on'" : "";
			              html.push('<li data-id="'+list[i].id+'"'+idcla+'>'+list[i].typename+'</li>');
			              areaArr[list[i].id] = list[i].lower;
			            }

			            areaObj.html('<ul>'+html.join("")+'</ul>');
			            areaScroll = chooseScroll("scroll-area");

			          }else{
			            areaObj.html('<div class="load">'+data.info+'</div>');
			          }
			        },
			        error: function(){
			        	areaObj.html('<div class="load">'+langData['siteConfig'][20][183]+'</div>');
			        }
			    });
			},



		}


	// 筛选框
	$('.choose-tab li').click(function(){

		var $t = $(this), index = $t.index(), box = $('.choose-box .choose-local').eq(index);
		if (box.css("display")=="none") {
			$t.addClass('on').siblings().removeClass('on');
			box.show().siblings().hide();
			if (index == 0 && infoScroll == null) {infoScroll = chooseScroll("scroll-assort");}
			if (index == 1 && areaScroll == null) {init.getArea();}
			if (index == 2 && sortScroll == null) {sortScroll = chooseScroll("scroll-sort");}
			if (index == 3 && moreScroll == null) {moreScroll = chooseScroll("scroll-more");}
			mask.show();
		}else{
		 	$t.removeClass('on');
		 	box.hide();mask.hide();
		}

	});


	// 全部分类
	$('#scroll-assort').delegate("li", "click", function(){

		var t = $(this), index = t.index(), val = t.find('a').text(), local = t.closest('.choose-local'), lower = t.hasClass('lower'),
		id = t.attr('data-id'), stager = $('#assort-box .choose-stage-r');

		if (!lower) {
			$('#assort-box .choose-stage-th').removeClass('choose-stage-l');
			stager.hide();local.hide();mask.hide();
			t.addClass('on').siblings().removeClass('on');
			$('#scroll-assort-second li.on').removeClass('on');
			$('.choose-tab li').removeClass('on');
			$('.tab-assort span').text(val);
			getList(1);
		}else{
			stager.show();
			$.ajax({
				url: "/include/ajax.php?service=business&action=type&type="+id,
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
						var list = [], info = data.info;
						list.push('<ul>');
						list.push('<li><a href="javascript:;">'+langData['siteConfig'][9][0]+'</a></li>');
						for(var i = 0; i < info.length; i++){
							list.push('<li data-id="'+info[i].id+'"><a href="javascript:;">'+info[i].typename+'</a></li>');
						}
						list.push('</ul>');

						$("#scroll-assort-second").html(list.join(""));
						assortSecondScroll = chooseScroll("scroll-assort-second");
					}else{
						$("#scroll-assort-second").html('<div class="loading">'+data.info+'</div>');
					}
				}
			});

			t.closest('.choose-stage-th').addClass('choose-stage-l');
			t.addClass('on').siblings().removeClass('on');

		}

	})

	// 区域
	$('#scroll-area').delegate("li", "click", function(){

		urlAddrid = "";

		var t = $(this), index = t.index(), id = t.attr('data-id'), val = t.text(), stager = $('#area-box .choose-stage-r'),
	  		localIndex = t.closest('.choose-local').index();

		if (index == 0) {
			t.addClass('on').siblings().removeClass('on');
			$('#scroll-area-second li.on').removeClass('on');
			t.closest('.choose-local').hide();
			$('#area-box .choose-stage-th').removeClass('choose-stage-l');
			mask.hide();stager.hide();
		}else{
			t.siblings().removeClass('on');
			t.addClass('on').siblings().removeClass('on');
			$('#area-box .choose-stage-th').addClass('choose-stage-l');
			stager.show();

			var lower = areaArr[id], html = [];
			if(lower){
        for(var i = 0; i < lower.length; i++){
          html.push('<li data-id="'+lower[i].id+'"><a href="javascript:;">'+lower[i].typename+'</a></li>');
        }
        $("#scroll-area-second").html('<ul>'+html.join("")+'</ul>');
        chooseScroll("scroll-area-second");
			}
		}
		$('.choose-tab li').eq(localIndex).removeClass('on').find('span').text(val);
		getList(1);
	})

	// 分类
	$('#scroll-assort-second, #scroll-area-second').delegate("li", "click", function(){
		var $t = $(this), id = $t.attr('data-id'), val = $t.find('a').html(), local = $t.closest('.choose-local'), index = local.index();
		$t.addClass('on').siblings().removeClass('on');
		if (!id) {
			$('.choose-tab li').eq(index).find('span').text($('#scroll-assort li.on a').text());
		}else {
			$('.choose-tab li').eq(index).removeClass('on').find('span').text(val);
		}
		local.hide();mask.hide();
		getList(1);
	})

	// 排序
	$('#scroll-sort').delegate("li", "click", function(){
		var $t = $(this), id = $t.attr('data-id'), val = $t.find('a').html(), local = $t.closest('.choose-local'), index = local.index();
		$t.addClass('on').siblings().removeClass('on');
		$('.choose-tab li').eq(index).removeClass('on').find('span').text(val);
		local.hide();mask.hide();
		getList(1);
	})

	// 遮罩层
	$('.mask').on('click',function(){
		mask.hide();$('.choose-local').hide();
		$('.choose-tab li').removeClass('on');
	})


	// 下拉加载
	$(window).on("touchmove", function(){
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w;
		if ($(window).scrollTop() > scroll && !isload) {
			atpage++;
			getList();
		};
	});

	//初始加载
	getList();

	//数据列表
	function getList(tr){
		isload = true;

		//如果进行了筛选或排序，需要从第一页开始加载
		if(tr){
			atpage = 1;
			$(".list ul").html("");
		}

		$(".list .loading").remove();
		$(".list").append('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');

		var typeid = $('#scroll-assort-second li.on').attr('data-id');
		if (!typeid) {
			typeid = $('#scroll-assort li.on').attr('data-id');
		}
		var addrid = $('#scroll-area-second li.on').attr('data-id');
		if (!addrid) {
			addrid = $('#scroll-area li.on').attr('data-id') ? $('#scroll-area li.on').attr('data-id') : urlAddrid;
		}
		var orderby = $('#scroll-sort li.on').attr('data-id');
		var keywords = $('#keywords').val();

		//请求数据
		var data = [];
		data.push("pageSize="+pageSize);
		data.push("page="+atpage);
		data.push("typeid="+typeid);
		if (addrid) {
			data.push("addrid="+addrid);
		}
		if (orderby) {
			data.push("orderby="+orderby);
		}
		data.push("title="+keywords);

		$('.choose li ,#choose-more ul li').each(function(){
			var obj = $(this),field = obj.data('type');
			var val = obj.attr('data-id');
			if(field && val != undefined && val != ''){
				data.push(field+"="+val);
			}
		})

		$.ajax({
			url: "/include/ajax.php?service=business&action=blist",
			data: data.join("&"),
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data){
					if(data.state == 100){
						$(".list .loading").remove();
						var list = data.info.list, html = [];
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){
								html.push('<li>');
								// html.push(''+(list[i].waimai?'<a href="'+list[i].waimaiUrl+'" class="murl">外卖</a>':'')+'');
								html.push('<a href="'+list[i].url+'" class="fn-clear">');
								html.push('<div class="pic-box">');
								html.push('<img src="'+list[i].logo+'" alt="">');
								html.push('</div>');
								html.push('<div class="pic-txt">');
								html.push('<h3>');
								html.push('<span class="shop-name">'+list[i].title+'</span>');
								html.push('<div class="pic-tag">');

								// if (list[i].member['certifyState']) {
								// 	html.push('<i class="pai">身</i>');
								// }
								// if (list[i].member['licenseState']) {
								// 	html.push('<i class="wai">营</i>');
								// }
								// if (list[i].member['phoneCheck']) {
								// 	html.push('<i class="hui">号</i>');
								// }

								html.push('</div>');
								html.push('</h3>');
								html.push('<p class="per">');
								html.push('<span>'+langData['siteConfig'][22][97]+'：'+list[i].typename[0]+'</span>&nbsp;&nbsp;<span>'+langData['siteConfig'][19][195]+'：'+list[i].amount+'</span>');
								html.push('</p>');
								html.push('<p class="per">');
								// if(list[i].member['company'] == "无"){
								// 	html.push('<span>联系人：'+list[i].member['company']+'</span></span>');
								// }
								html.push('</p>');
								html.push('<p class="address grey"><span>'+langData['siteConfig'][19][34]+'：'+list[i].addrname[0]+'</span><span>'+list[i].addrname[1]+'</span></p>');
								html.push('</div>');
								html.push('</a>');
								html.push('</li>');
								// html.push('<div class="shop-service">');
			     //                html.push('<a href="'+masterDomain +'/business/diancan-'+list[i].id+'.html" class="shop-dian">');
			     //                html.push('<i>');
			     //                html.push('<img src="'+masterDomain +'/templates/business/touch/default/images/feature1.png"></i>');
			     //                html.push('<span>点餐</span></a>');
			     //                html.push('<a href="'+masterDomain +'/business/dingzuo-online-'+list[i].id+'.html" class="shop-dian">');
			     //                html.push('<i>');
			     //                html.push('<img src="'+masterDomain +'/templates/business/touch/default/images/feature2.png"></i>');
			     //                html.push('<span>订座</span></a>');
			     //                html.push('<a href="'+masterDomain +'/business/paidui-'+list[i].id+'.html" class="shop-dian">');
			     //                html.push('<i>');
			     //                html.push('<img src="'+masterDomain +'/templates/business/touch/default/images/feature3.png"></i>');
			     //                html.push('<span>排队</span></a>');
			     //                html.push('<a href="'+masterDomain +'/business/maidan-'+list[i].id+'.html" class="shop-dian">');
			     //                html.push('<i>');
			     //                html.push('<img src="'+masterDomain +'/templates/business/touch/default/images/feature4.png"></i>');
			     //                html.push(' <span>买单</span></a>');
      		// 					html.push(' </div>');
							}

							$(".list ul").append(html.join(""));
							isload = false;

							//最后一页
							if(atpage >= data.info.pageInfo.totalPage){
								isload = true;
								$(".list").append('<div class="loading">'+langData['siteConfig'][18][7]+'</div>');
							}

						//没有数据
						}else{
							isload = true;
							$(".list").append('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');
						}

					//请求失败
					}else{
						$(".list .loading").html(data.info);
					}

				//加载失败
				}else{
					$(".list .loading").html(langData['siteConfig'][20][462]);
				}
			},
			error: function(){
				isload = false;
				$(".list .loading").html(langData['siteConfig'][20][227]);
			}
		});
	}



})
