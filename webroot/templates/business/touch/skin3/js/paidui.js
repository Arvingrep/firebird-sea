$(function(){

    $('.appMapBtn').attr('href', OpenMap_URL);

	var container = $(".pai_con");

	var juli = 0;

	// 开启排队
	if(state){

		getPaiduiInfo(function(status){

			checkMyOrder();

			if(status == 100){

				$(".now, .tips").removeClass("fn-hide");

				if(lat > 0 && lng > 0){
					getLocation(function(data){
						if(data){
							juli = GetDistance(data.lat, data.lng, lat, lng);
							$("#juli").text(juli+'km');
						}else{
							$("#juli").text(langData['siteConfig'][21][67]);
						}
						$(".now, .tips").removeClass("fn-hide");
						checkMyOrder();
					});
				}else{
					alert('无法获取商家具体位置');
					$("#juli").text(langData['siteConfig'][21][67]);
					$(".now, .tips").removeClass("fn-hide");
					checkMyOrder();
				}

			}

		});



	}else{

		checkMyOrder();

	}

	// 取号-选择人数
	$('.now_btn').click(function(){
		if(juli > juliLimit){
			alert(langData['siteConfig'][22][99].replace('1', juliLimit));
			return;
		}
		// getTableConfig();
		$(".Choice_Num").show();
		$(".disk").show();
	})
	$(".Choice_Num .num_box ul li").click(function(){
		var x = $(this);
		x.addClass('nb_bc').siblings().removeClass('nb_bc');
	})
	$('.cancle').click(function(){
		$(".Choice_Num").hide();
		$(".disk").hide();
	})
	// 确定
	$('.sure').click(function(){

		var userid = $.cookie(cookiePre+'login_user');
		if(userid == undefined || userid == '' || userid == 0){
			location.href = '/login.html';
			return;
		}


		$(".Choice_Num").hide();
		$(".disk").hide();

		var t = $(this);
		if(t.hasClass("disabled")) return;

		var people = parseInt($(".num_box li.nb_bc").text());
		t.addClass("disabled");
		$.ajax({
			url: '/include/ajax.php?service=business&action=paiduiDeal',
			type: 'post',
			data: {
				store  : shopid,
				people : people
			},
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					var url = retUrl.replace('%ordernum%', data.info);
					location.href = retUrl.replace('%ordernum%', data.info);
				}else{
					alert(data.info);
					t.removeClass('disabled');
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);
				t.removeClass('disabled');
			}
		})

	})

	// 取消排队
	$(".waitCon").delegate(".wait_btn", "click", function(){
		var id = $(this).closest(".wait").attr("data-id");
		if(confirm(langData['siteConfig'][22][98])){
			$.ajax({
				url: '/include/ajax.php?service=business&action=paiduiUpdateState&state=2&id='+id,
				type: 'post',
				dataType: 'json',
				success: function(data){
					if(data && data.state == 100){
						location.reload();
					}else{
						alert(data.info);
					}
				},
				error: function(){
					alert(langData['siteConfig'][20][183]);
				}
			})
		}
	})

	// 查询桌位人数配置
	function getTableConfig(){
		$.ajax({
			url: '/include/ajax.php?service=business&action=serviceGetTable&store='+shopid,
			type: 'post',
			dataType: 'json',
			success: function(data){

			},
			error: function(){

			}
		})
	}


	// 检查我的排队
	function checkMyOrder(){
		$.ajax({
			url: '/include/ajax.php?service=business&action=paiduiGetMyorder&store='+shopid,
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					var list = data.info, html = [];
					for(var i = 0; i < list.length; i++){
						html.push('<div class="wait fn-clear" data-id="'+list[i].id+'">');
						html.push('	<ul>');
						html.push('		<li><p>'+langData['siteConfig'][19][308]+'</p><span>'+list[i].table+'</span></li>');
						html.push('		<li><p>'+langData['siteConfig'][22][79]+'</p><p><span>'+list[i].before+'</span> '+langData['siteConfig'][13][40]+'</p></li>');
						html.push('		<li><p>'+langData['siteConfig'][22][77]+'</p><p>'+ (oncetime * list[i].before)+langData['siteConfig'][22][39]+'</p></li>');
						html.push('	</ul>');
						html.push('	<div class="wait_btn">'+langData['siteConfig'][22][80]+'</div>');
						html.push('</div>');
					}

					$(".waitCon").html(html.join(""));
				}
			},
			error: function(){

			}
		})
	}

	function getPaiduiInfo(callback){
		$.ajax({
			url: '/include/ajax.php?service=business&action=paiduiCat&store='+shopid,
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					var list = data.info, html = [];
					for(var i = 0; i < list.length; i++){
						html.push('<ul class="fn-clear">');
						html.push('	<li><p>'+list[i].typename+'</p><span>'+list[i].min+'-'+list[i].max+langData['siteConfig'][13][32]+'</span></li>');
						html.push('	<li class="zhuo last"><em>'+list[i].count+'</em> '+langData['siteConfig'][13][40]+'</li>');
						html.push('	<li class="zhuo"><em>'+(list[i].count * oncetime)+'</em> '+langData['siteConfig'][13][39]+'</li>');
						html.push('</ul>');
					}
					container.html(html.join(""));
				}else{
					container.html('<div class="loading">'+data.info+'</div>');
				}
				if(typeof callback == 'function'){
					callback(data.state);
				}
			},
			error: function(){

			}
		})
	}

})

// 定位
function getLocation(callback){
	var lat = lng = 0;
	// 百度地图
	HN_Location.init(function(data){
      if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
        alert(''+langData['siteConfig'][27][137]+'')   /* 定位失败，请重新刷新页面！ */ 

      }else{      
        lng = data.lng;
        lat = data.lat;       
      }
      callback({"lat":lat, "lng":lng});
    }, device.indexOf('huoniao') > -1 ? false : true);

}

//计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
function GetDistance(lat1,lng1,lat2,lng2){

    var earthRadius = 6367000;

    lat1 = (lat1 * Math.PI ) / 180;
    lng1 = (lng1 * Math.PI ) / 180;

    lat2 = (lat2 * Math.PI ) / 180;
    lng2 = (lng2 * Math.PI ) / 180;

    var calcLongitude = lng2 - lng1;
    var calcLatitude = lat2 - lat1;
    var stepOne = Math.pow(Math.sin(calcLatitude / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(calcLongitude / 2), 2);
    var stepTwo = 2 * Math.asin(Math.min(1, Math.sqrt(stepOne)));
    var calculatedDistance = earthRadius * stepTwo;

    var m = Math.round(calculatedDistance);

    return Math.round(m/1000);

}
