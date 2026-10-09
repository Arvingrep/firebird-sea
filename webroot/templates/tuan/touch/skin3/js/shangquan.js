$(function(){

	var device = navigator.userAgent;
		if(device.indexOf('huoniao') > -1){
	    // $('.area a').bind('click', function(e){
	    //     e.preventDefault();
	    //     setupWebViewJavascriptBridge(function(bridge) {
	    //         bridge.callHandler('goToCity', {'module': 'tuan'}, function(){});
	    //     });
	    // });
	}



  //吸顶
  var xiding = $(".search-form"), chtop = parseInt(xiding.offset().top);
  $(window).on("scroll", function() {
    var thisa = $(this);
    var st = thisa.scrollTop();
    if (st >= chtop) {
      $(".search-form").addClass('choose-top');
      $('.info').css('margin-top','1.3rem');
      if (device.indexOf('huoniao_iOS') > -1) {
        $(".search-form").addClass('padTop20');
      }
    } else {
      $(".search-form").removeClass('choose-top padTop20');
      $('.info').css('margin-top','.17rem');
    }
  });
	var atpage = 1, isload = false, lng='',lat='';
	HN_Location.init(function(data){
		if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
		  onefindList();
		  //$(".info").append('<div class="loading">定位失败,请重新刷新页面！</div>');
	  	}else{
		  lng = data.lng, lat = data.lat;
		  onefindList();
	  	}
	  	window.addEventListener("mousewheel", (e) => {
		   if (e.deltaY === 1) {
		     e.preventDefault();
		   }
		});
	});

	    $('.inp').delegate('#search', 'click', function(){
			onefindList(1);
	    });

	    function onefindList(tr){
	    	if(tr){
	    		atpage = 1;
	    		$(".info ul").html("");
	    	}
	    	isload = true;

	    	var data = [];
	    	if($("#keywords").val() != ''){
				data.push("search="+$("#keywords").val());
			}
			data.push("page="+atpage);
			$(".info").append('<div class="loading">加载中...</div>');
			$(".info .loading").remove();

	    	$.ajax({
				url: "/include/ajax.php?service=tuan&action=circleList&pageSize=10"+'&lng='+lng+'&lat='+lat,
				data: data.join("&"),
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data){
						if(data.state == 100){
							$(".info .loading").remove();
							var list = data.info.list, html = [];
							if(list.length > 0){
								for(var i = 0; i < list.length; i++){
									html.push('<li class="fn-clear">');
									html.push('<a href="'+list[i].url+'">');
							        html.push('   <div class="s_img"><img src="'+list[i].litpic+'"></div>');
							        html.push('  <div class="s_title">');
							        html.push('     <div class="bus_txt fn-clear"><span class="bus_txt_title business-txt">'+list[i].name+'</span><span class="distance">'+(list[i].distance != '0.0米' ? list[i].distance : '')+'</span></div>');
							        html.push('      <p class="tuan">发现<em>'+list[i].storenum+'</em>家好店</p>');
							        html.push('      <div class="quan">营业时间: '+list[i].openStart+'-'+list[i].openEnd+'</div>');
							        html.push('     <div class="addr fn-clear"><span>联系电话: '+list[i].tel+'</span><div class="aa">去逛逛</div></div>');
							        html.push('   </div>');
							        html.push('   </div>');
							        html.push('</a>');
							        html.push('</li>');
								}
								$(".info ul").append(html.join(""));
								isload = false;
								//最后一页
								if(atpage >= data.info.pageInfo.totalPage){
									isload = true;
									$(".info").append('<div class="loading">已经到最后一页了</div>');
								}
							}else{
								isload = true;
								$(".info").append('<div class="loading">暂无相关信息</div>');
							}
						}else{
							$(".info").append('<div class="loading"></div>');
							$(".info .loading").html(data.info);
						}
					}else{
						$(".info").html('<div class="loading">加载失败</div>');
					}
				},
				error: function(){
					isload = false;
					$(".info").html('<div class="loading">网络错误，加载失败！</div>');
				}
			});
	    };

		  $(window).scroll(function() {
		    var allh = $('body').height();
		    var w = $(window).height();
		    var scroll = allh - w;
		    if ($(window).scrollTop()+50 >= scroll&& !isload) {
			  atpage++;
			  isload = true;
		      onefindList();
		    };
		  });

})
