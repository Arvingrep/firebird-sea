$(function(){

	//筛选分类
	$('.filter .ftit li').bind('click', function(){
		var t = $(this), index = t.index();
		if(!t.hasClass('curr')){
			t.addClass('curr').siblings('li').removeClass('curr');
			$('.filter .fitem:eq('+index+')').show().siblings('.fitem').hide();
		}else{
			t.removeClass('curr');
			$('.filter .fitem').hide();
		}
	});

	//筛选分类组
	$('.filter .type1 li').bind('click', function(){
		var t = $(this), index = t.index();
		if(!t.hasClass('curr')){
			t.addClass('curr').siblings('li').removeClass('curr');
			$('.filter .type2 ul:eq('+index+')').show().siblings('ul').hide();
		}
	});

	//公里范围
	$('.distance li').bind('click', function(){
		var t = $(this), id = t.data('id'), txt = t.text();;
		$('.ftit li:eq(1)').find('label').html(txt);
		radius = id;
		page = totalPage = 0;
		$('.list').html('');
		$('.ftit li:eq(1)').click();
		getDataList();
	});

	var page = 0, pageSize = 10, totalPage = 0, totalCount = 0, isload = false, pagetoken = '';
	directory = getQueryString('directory');

	document.title = directory;
	wxconfig.title = directory;
	wxconfig.link = location.href;

	//当前关键字
	$('.ftit li:eq(0)').find('label').html(directory);

    window.addEventListener('pageshow', function () {
        HN_Location.init(function (data) {
            if (data == undefined || data.address == "" || data.lat == "" || data.lng == "") {
				msg('定位失败，请查看定位是否打开');
            } else {
                lat = data.lat;
                lng = data.lng;
                address = data.address instanceof Array ? data.address[0] : data.address;

                $('.location').html(address);
                getDataList();

                //到底加载
                $(window).bind("scroll", function () {
                    if ($(window).scrollTop() >= $(document).height() - $(window).height() - 80 && !isload && page < totalPage) {
						page++;
						if(site_map=='google' && pagetoken!='' && pagetoken!=undefined){
							getDataList(pagetoken);
						}else{
							getDataList();
						}
                    }
                });
            }
        })
    });


	function getDataList(pagetokentmp){
		pagetokentmp = pagetokentmp == '' || pagetokentmp == undefined ? '' : pagetokentmp;
		isload = true;
		$('.loading').remove();
		$('.list').append('<div class="loading"><span>加载中...</span></div>');
		$.ajax({
			url: masterDomain + '/include/ajax.php?service=siteConfig&action=get114ConveniencePoiList&pageSize='+pageSize+'&page='+page+'&lng='+lng+'&lat='+lat+'&directory='+directory+'&radius='+radius+"&pagetoken="+pagetoken,
			dataType: 'jsonp',
			success: function(data){
				isload = false;
				$('.loading').remove();
				if(data.state == 100){

					totalPage = data.info.totalPage;
					totalCount = data.info.totalCount;
					pagetoken = data.info.pagetoken == '' || data.info.pagetoken == null ? '' : data.info.pagetoken;
					var list = data.info.list;
					if(list.length > 0){
						var tmp = '';
						$.each(list, function (i, n) {
								var km = mapDistance(Number(lat), Number(lng), Number(n.lat), Number(n.lng));
								km = km / 1000;
								km = km.toFixed(2);
								var num=(i%7);

								tmp = '<dl class="fn-clear i' + num + '">';
							  tmp += '  <dt><a href="' + n.url + '">' + n.name.substring(0,1) + '</a></dt>';
							  tmp += '  <dd>';
								if(n.tel){
								  tmp += '    <a href="javascript:;" class="route tel" data-tel="'+n.tel+'"><img src="'+templatePath+'images/114/locationTel.png" /></a>';
								}else{
									var mapUrl = 'javascript:;';
									if(site_map == 'baidu'){
										mapUrl = 'http://api.map.baidu.com/geocoder?address=' + n.address + ' ' + n.name + '&output=html';
									}else if(site_map == 'google'){
										mapUrl = 'https://www.google.com/maps/place/' + n.address + ' ' + n.name;
									}else if(site_map == 'amap'){
										mapUrl = 'http://ditu.amap.com/search?query=' + n.address + ' ' + n.name;
									}else if(site_map == 'qq'){
										mapUrl = 'http://apis.map.qq.com/uri/v1/search?keyword=' + n.address + ' ' + n.name;
									}
								  tmp += '    <a href="javascript:;" data-href="'+mapUrl+'" class="route map" data-lat="'+n.lat+'" data-lng="'+n.lng+'" data-title="'+n.name+'" data-address="'+n.address+'"><img src="'+templatePath+'images/114/locationRoute.png" /></a>';
								}
							  tmp += '    <a href="' + n.url + '" class="info">';
							  tmp += '      <h5>' + n.name + '</h5>';
							  tmp += '      <p>[' + km + 'km] ' + n.address + '</p>';
							  tmp += '    </a>';
							  tmp += '  </dd>';
							  tmp += '</dl>';
								$('.list').append(tmp);
						});
					}else{
						if(totalPage <= page && page > 0){
							msg('已经到底啦！');
						}else{
							msg('周边没有相关信息');
						}
					}

				}else{
					msg(data.info);
				}
			},
			error: function(){
				isload = false;
				$('.loading').remove();
				msg('网络错误，加载失败！');
			}
		});
	}

	//导航
	$('.list').delegate('.map', 'click', function(e){
		e.preventDefault();
		var t = $(this), lat = t.attr('data-lat'), lng = t.attr('data-lng'), title = t.attr('data-title'), address = t.attr('data-address'), href = t.attr('data-href');

		var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
		var x = lng - 0.0065;
		var y = lat - 0.006;
		var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
		var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
		pageData.lng = z * Math.cos(theta);
		pageData.lat = z * Math.sin(theta);

		pageData.mapType = site_map;
		pageData.title = title;
		pageData.address = address;

		$('.appMapBtn').attr('data-href', href);
		$('.appMapBtn').click();
	});

	//电话
	$('.list').delegate('.tel', 'click', function(){
		showcall($(this).attr('data-tel'));
	});

	//打电话
	function showcall(phone){
		var tmp='<div class="callPop" style="display: block;">'+
						'<div class="call-center">'+
						'<div class="call-ts">提示</div>'+
						'<div class="call-hint">联系我时请说明是在'+webname+'上看到的，谢谢！ </div>'+
						'<div class="call-sure">确定拨打电话：<span>'+phone+'</span>吗？ </div>'+
						'<div class="call-btn">'+
						'<a href="tel:'+phone+'">确定</a>'+
						'<a onclick="this.parentNode.parentNode.parentNode.remove();">取消</a>'+
						'</div>'+
						'</div>'+
						'</div>';
		$('body').append(tmp);
	}


	//获取url中的参数
	function getQueryString(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", 'i'); // 匹配目标参数
		var result = window.location.search.substr(1).match(reg); // 对querystring匹配目标参数
		if (result != null) {
			return decodeURIComponent(result[2]);
		} else {
			return null;
		}
	}

	//提示
	function msg(text){
		$(".tishi p").html(text);
		$(".tishi").show();
		setTimeout(function(){$(".tishi").fadeOut();}, 3000);
	}

	//计算距离
	var mapDistance=function(lat_a,lng_a,lat_b,lng_b){
			var pk = 180 / 3.14169;
			var a1 = lat_a / pk;
			var a2 = lng_a / pk;
			var b1 = lat_b / pk;
			var b2 = lng_b / pk;
			var t1 = Math.cos(a1) * Math.cos(a2) * Math.cos(b1) * Math.cos(b2);
			var t2 = Math.cos(a1) * Math.sin(a2) * Math.cos(b1) * Math.sin(b2);
			var t3 = Math.sin(a1) * Math.sin(b1);
			var tt = Math.acos(t1 + t2 + t3);
			return 6366000 * tt;
	};
});
