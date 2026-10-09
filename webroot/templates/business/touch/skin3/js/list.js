$(function() {

    toggleDragRefresh('off');

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
			        url: '/include/ajax.php?service=business&action=addr&son=1&type='+cityid,
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
			//if (index == 0 && infoScroll == null) {infoScroll = chooseScroll("scroll-assort");}
			if (index == 1 && areaScroll == null) {init.getArea();}
			if (index == 2 && sortScroll == null) {sortScroll = chooseScroll("scroll-sort");}
			if (index == 3 && moreScroll == null) {moreScroll = chooseScroll("scroll-more");}
			mask.show();
			stopBodyScroll(1);
		}else{
		 	$t.removeClass('on');
		 	box.hide();mask.hide();
		 	stopBodyScroll();
		}

	});
	var bodyEl = document.body
	var top = 0

	function stopBodyScroll (isFixed) {//弹窗弹出时 禁止底部页面滚动
	 if (isFixed) {
		 top = window.scrollY
		 bodyEl.style.position = 'fixed'
		 bodyEl.style.top = -top + 'px'
	 }else{
		bodyEl.style.position = ''
		bodyEl.style.top = ''
	 	window.scrollTo(0, top) // 回到原先的top
	 }
	}
	// 全部分类
	var isclick = 0;
	$('#scroll-assort').delegate("li", "click", function(){
		isClick = 1; //关闭滚动监听
		var t = $(this), index = t.index(), val = t.find('a').text(), local = t.closest('.choose-local'), lower = t.hasClass('lower'),
		id = t.attr('data-id'), stager = $('#assort-box .choose-stage-r'),jumpId = t.find('a').attr('data-id');

		if (!lower) {
			$('#assort-box .choose-stage-th').removeClass('choose-stage-l');
			stager.hide();local.hide();mask.hide();
			t.addClass('on').siblings().removeClass('on');
			$('#scroll-assort-second dd.on').removeClass('on');
			$('.choose-tab li').removeClass('on');
			$('.tab-assort span').text(val);
            stopBodyScroll();
			getList(1);
		}else{
			stager.show();
			t.closest('.choose-stage-th').addClass('choose-stage-l');
			t.addClass('on').siblings().removeClass('on');
			var mao = $('.dl_wrap').find('#'+jumpId);
			var scrollTop = $('#scroll-assort-second').scrollTop()
            var off = mao.position().top + scrollTop -15;//position() 方法返回匹配元素相对于父元素的位置（偏移）。
            $('#scroll-assort-second').scrollTop(off);
		}
		setTimeout(function(){
          isClick = 0;//开启滚动监听
        },1000);
	})

	$('#scroll-assort-second').scroll(function(){
		if(isClick) return false;//点击切换时关闭滚动监听
		//$('#scroll-assort').css('-webkit-overflow-scrolling','auto');
		$('.dl_wrap dl').each(function(){
			var soth = $(this).find('dt').position().top;
			var h =$(this).height() - 20;
			if(soth <= 0 && soth > (0-h)){
				var scrollId = $(this).find('dt').attr('id');
				$('#scroll-assort li').removeClass('on')
				$("#scroll-assort a[data-id='"+scrollId+"']").closest('li').addClass('on');
			}
		})
		var end = $('#scroll-assort li.on').offset().top + $('#scroll-assort li.on').height() / 2 - $('.choose-stage-l').height() /2;
        var start = $("#scroll-assort").scrollTop();
        $('#scroll-assort').scrollTop(end + start);
        //$('#scroll-assort').css('-webkit-overflow-scrolling','touch');
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
          	getList(1);
		}else{
			t.siblings().removeClass('on');
			t.addClass('on').siblings().removeClass('on');
			$('#area-box .choose-stage-th').addClass('choose-stage-l');
			stager.show();

			var lower = areaArr[id], html = [];
			if(lower){
              html.push('<li data-id="'+id+'"><a href="javascript:;">'+langData['siteConfig'][9][0]+'</a></li>');//全部
              for(var i = 0; i < lower.length; i++){
                html.push('<li data-id="'+lower[i].id+'"><a href="javascript:;">'+lower[i].typename+'</a></li>');
              }
              $("#scroll-area-second").html('<ul>'+html.join("")+'</ul>');
              chooseScroll("scroll-area-second");
			}else{
				$('#scroll-area-second li.on').removeClass('on');
				t.closest('.choose-local').hide();
				$('#area-box .choose-stage-th').removeClass('choose-stage-l');
				mask.hide();stager.hide();
				getList(1);
			}
		}
		$('.choose-tab li').eq(localIndex).removeClass('on').find('span').text(val);
        stopBodyScroll();
		
	})
	// 分类
	$('#scroll-assort-second').delegate("dd", "click", function(){
		console.log('hhhhhh')
		var $t = $(this), id = $t.attr('data-id'), val = $t.html(), local = $t.closest('.choose-local'), index = local.index();
		$('#scroll-assort-second dd').removeClass('on')
		$t.addClass('on');
		if (!id) {
			$('.choose-tab li').eq(index).find('span').text($('#scroll-assort li.on a').text());
		}else {
			$('.choose-tab li').eq(index).removeClass('on').find('span').text(val);
		}
		local.hide();mask.hide();
		getList(1);
		stopBodyScroll();
		return false;
	})

	// 区域
	$('#scroll-area-second').delegate("li", "click", function(){
		var $t = $(this), id = $t.attr('data-id'), val = $t.find('a').html(), local = $t.closest('.choose-local'), index = local.index();
		$t.addClass('on').siblings().removeClass('on');
		if (!id) {
			$('.choose-tab li').eq(index).find('span').text($('#scroll-assort li.on a').text());
		}else {
			$('.choose-tab li').eq(index).removeClass('on').find('span').text(val);
		}
		local.hide();mask.hide();
        stopBodyScroll();
		getList(1);
	})

	// 排序
	$('#scroll-sort').delegate("li", "click", function(){
		var $t = $(this), id = $t.attr('data-id'), val = $t.find('a').html(), local = $t.closest('.choose-local'), index = local.index();
		$t.addClass('on').siblings().removeClass('on');
		$('.choose-tab li').eq(index).removeClass('on').find('span').text(val);
		local.hide();mask.hide();
        stopBodyScroll();
		getList(1);
	})

	// 遮罩层
	$('.mask').on('click',function(){
		mask.hide();$('.choose-local').hide();
		$('.choose-tab li').removeClass('on');
		stopBodyScroll();
	})
    // //点击小箭头 收起

    $('.list-arr').click(function () {
    	var stager = $('#assort-box .choose-stage-r'),local = $(this).closest('.choose-local');
    	//$('#assort-box .choose-stage-th').removeClass('choose-stage-l');
        local.hide();mask.hide();
        $('.choose-tab li').removeClass('on');
        stopBodyScroll();
    });


	// 下拉加载
    var isload = false;
    $(window).scroll(function() {
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - 50;
        if ($(window).scrollTop() > scroll && !isload) {
            atpage++;
            getList();
        };
    });

	//初始加载
    var lng = lat = 0;

    function checkLocal(){
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

      if(!local){
        HN_Location.init(function(data){
          if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
            lat = lng = -1;
            getList();
          }else{
            lng = data.lng;
            lat = data.lat;

            var time = Date.parse(new Date());
            utils.setStorage('user_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address': data.address}));

            getList();
          }
        })
      }else{
        getList();
      }

    }
    checkLocal();

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

		var typeid = $('#scroll-assort-second dd.on').attr('data-id');
		if (!typeid) {
			typeid = $('#scroll-assort li.on').attr('data-id');
		}
		var addrid = $('#scroll-area-second li.on').attr('data-id');
		if (!addrid) {
			addrid = $('#scroll-area li.on').attr('data-id') ? $('#scroll-area li.on').attr('data-id') : urlAddrid;
		}
		var orderby = $('#scroll-sort li.on').attr('data-id');
		//var keywords = $('#keywords').val();

		//请求数据
		var data = [];
		data.push("pageSize="+pageSize);
		data.push("page="+atpage);
		data.push("store=2");
		data.push("lng="+lng);
		data.push("lat="+lat);
		data.push("typeid="+typeid);
		if (addrid) {
			data.push("addrid="+addrid);
		}
		if (orderby) {
			data.push("orderby="+orderby);
		}
		//data.push("title="+keywords);

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

								var imgLen = list[i].banner.length;
								var cla='',imgHtml = '',claInfo='',modelHtml='';
								var txt = '',nostar ='';
				              	if(list[i].sco1 == 0){
				                	txt = '<em>'+langData['business'][6][11]+'</em>';//暂无评分
				                	nostar = 'nostar';
				              	}

                                var typeList = [];
                                if(list[i]['typename']){
                                    for (var t = 0; t < list[i]['typename'].length; t++) {
                                        if(t < 3){
                                            typeList.push('<span>'+list[i]['typename'][t]+'</span>');
                                        }
                                    }
                                    if(list[i]['typename'].length > 2){
                                        typeList.push('<span>...</span>');
                                    }
                                }

								if(imgLen == 0 && list[i].logo){

									cla = 'img1';
									claInfo = 'listInfo1';
									imgHtml = `<img src="${list[i].logo}" onerror="this.src='/static/images/bus_default.png'">`;
									modelHtml = '<div class="has-module">'+typeList.join('')+'</div>';

								}else if(imgLen == 1 && list[i].banner[0].pic){

									cla = 'img1';
									claInfo = 'listInfo1';
									imgHtml = `<img src="${list[i].banner[0].pic}" onerror="this.src='/static/images/404.jpg'">`;
									modelHtml = '<div class="has-module">'+typeList.join('')+'</div>'

								}else if(list[i].banner.length > 0){
									cla = 'img3'
                                    for (var b = 0; b < list[i].banner.length; b++) {
                                        if(b < 3){
                                            imgHtml += `<img src="${list[i].banner[b].pic}" onerror="this.src='/static/images/404.jpg'">`;
                                        }
                                    }

								}


								html.push('<li class="fn-clear">');
								html.push('<a href="'+list[i].url+'" class="fn-clear">');

                                if(cla == 'img1'){
                                    html.push('<div class="img_box '+cla+'">');
    								html.push(imgHtml);
    								html.push('</div>');
                                }

								html.push('<div class="listInfo '+claInfo+'">');
								html.push('<h2>'+list[i].title+'</h2>');
								html.push('<p class="comment fn-clear"><span class="starbg '+nostar+'"><i class="star" style="width: '+(list[i].sco1 / 5 * 100)+'%;"></i></span>'+txt+'</p>');
								html.push('<p class="addr"><span class="address">'+list[i].address+'</span><span class="dis">'+list[i].distance+'</span></p>');
								html.push(modelHtml);
								html.push('</div>');

                                if(cla != 'img1'){
    								html.push('<div class="img_box '+cla+'">');
    								html.push(imgHtml);
    								html.push('</div>');
                                }

								html.push('</a>');
								html.push('</li>');
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
