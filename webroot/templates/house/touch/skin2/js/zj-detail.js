$(function(){
    //放大图片
    $.fn.bigImage({
        artMainCon:".main-list .introduce",  //图片所在的列表标签
    });

	var lng = '', lat = '';
	HN_Location.init(function(data){
		if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
		  $('.rent').html('<div class="loading" style="text-align: center;padding: .3rem;">定位失败，请刷新页面</div>');
		}else{
		  lng = data.lng, lat = data.lat;
		  getloupanList();
		}

		function getloupanList(){
			//租房
			$.ajax({
			    url: masterDomain + '/include/ajax.php?service=house&action=zuList&orderby=juli&pageSize=3&page=1'+'&lng='+lng+'&lat='+lat+"&comid="+comid,
			    dataType: 'jsonp',
			    success: function(data){
					if(data.state == 100){
				        var list = data.info.list, html = [];
				        for(var i = 0; i < list.length; i++){
				        	/**
				        	 *<div class="house-box">
							<a href="javascript:;">
								<div class="house-item">
									<div class="house-img l">
										<i class="house_disk"></i><img src="http://qmr.215000.com/templates/house/touch/skin2//images/newImg.png"><i class="play_img"></i><i class="VR_img"></i>
									</div>
									<dl class="l">
										<dt><i class="set_top"></i><em>巴黎春天</em><span class="label_01">全景</span></dt>
										<dd class="item-area"><em>合租</em><em>4室1厅2卫</em><em>137.00㎡</em><span class="price r"><strong>900</strong><span>元/月</span></span></dd>
										<dd class="item-type-1 item-type_zu"><em>1.2km</em><em>新创理想城</em></dd>
									</dl>
								</div>
								<div class="clear"></div>
							</a>
						</div>
				        	 */
				        	html.push('<div class="house-box">');
				        	html.push('<a href="'+list[i].url+'">');
				        	html.push('<div class="house-item">');
				        	var play_img = list[i].video==1 ? '<i class="play_img"></i>' : '';
				        	var VR_img = list[i].qj==1 ? '<i class="VR_img"></i>' : '';
				        	html.push('<div class="house-img l"><i class="house_disk"></i><img onerror="this.src=`/static/images/404.jpg`" src="'+huoniao.changeFileSize(list[i].litpic, "large")+'">'+play_img+VR_img+'</div>');
				        	var set_top = list[i].isbid==1 ? '<i class="set_top"></i>' : '';
				        	var labelq = list[i].qj==1 ? '<span class="label_01">全景</span>' : '';
				        	var rentypet = list[i].rentype==1 ? '<em>合租</em>' : '<em>整租</em>';
				        	var price = list[i].price>0 ? '<strong>'+list[i].price+'</strong><span>'+echoCurrency('short')+'/月</span>' : '<strong>面议</strong>';
				        	html.push('<dl class="l"><dt>'+set_top+'<em>'+list[i].title+'</em>'+labelq+'</dt><dd class="item-area">'+rentypet+'<em>'+list[i].room+'</em><em>'+list[i].area+echoCurrency('areasymbol')+'</em><span class="price r">'+price+'</span></dd><dd class="item-type-1 item-type_zu"><em>'+list[i].distances+'</em><em>'+list[i].community+'</em></dd></dl>');
				        	html.push('</div>');
				        	html.push('<div class="clear"></div>');
							html.push('</a>');
				        	html.push('</div>');
				        }
				        $('.rent').append(html.join(''));
				    }else{
						$('.rent').html('<div class="loading" style="text-align: center;padding: .3rem;">'+data.info+'</div>');
				    }
			    },
			    error: function(){
					$('.rent').html('<div class="loading" style="text-align: center;padding: .3rem;">网络错误！</div>');
			    }
			});
		}

	});


  $('.appMapBtn').attr('href', OpenMap_URL);

  // 点击电话
  $('.building_phone').click(function(){
      $('.phone_frame').show();
      $('.desk').show();
  });
  $('.phone_frame .phone_cuo').click(function(){
      $('.phone_frame').hide();
      $('.desk').hide();
  });


  var xiding = $(".main_titleList_l");
  var chtop = parseInt(xiding.offset().top);

  $(window).on("scroll", function() {
    var thisa = $(this);
    var st = thisa.scrollTop();
    if (st >= chtop) {
      $(".main_titleList_l").addClass('choose-top');
      if (device.indexOf('huoniao_iOS') > -1) {
        $(".main_titleList_l").addClass('padTop20');
      }
    } else {
      $(".main_titleList_l").removeClass('choose-top padTop20');
    }
  });



  $('.main_titleList .main_titleList_l ul li').click(function(){
    var t = $(this);
    var index = t.index();
    if(!t.hasClass('active')){
      t.addClass('active');
      t.siblings().removeClass('active');
    }
    $('.main-list>div:eq('+index+')').show();
    $('.main-list>div:eq('+index+')').siblings().hide();
    console.log(t.attr("data-action"));
    if(t.attr("data-action")!=null && t.attr("data-action")!=undefined){
        getList(1);
	}
  });
  $('.main_titleList .main_titleList_l ul li:eq(0)').click();

  var atpage=1 , pageSize=8, isload = false;

    // 下拉加载
	$(document).ready(function() {
		$(window).scroll(function() {
			var h = $('.footer').height() + 100;
			var allh = $('body').height();
			var w = $(window).height();
			var scroll = allh - h - w;

			if ($(window).scrollTop() > scroll && !isload) {
				atpage++;
				getList();
			};
		});
	});

	function getList(tr){
		isload = true;
		var active = $('.main_titleList_l .active'), action = active.attr('data-action'), url;
		var data = [];
		if(!action) return false;
		if(action=="team"){//团队
	       	if(tr){
	           atpage = 1;
	           $(".jy .house-list").html('');
			}
			//$(".house-list .loading").remove();
			//$(".house-list").append('<div class="loading" style="text-align: center;padding: .3rem;">加载中...</div>');
			//var data = [];
			//data.push("page="+atpage);
			//data.push("pageSize="+pageSize);
	        url =  masterDomain + "/include/ajax.php?service=house&action=zjUserList&page=" + atpage + "&pageSize=" + pageSize + "&comid=" + comid + "&type=getnormal";
		}else if(action=="esf"){//二手房
			if(tr){
	           atpage = 1;
	           $(".esfList .house-list").html('');
			}
			url =  masterDomain + "/include/ajax.php?service=house&action=saleList&page=" + atpage + "&pageSize=" + pageSize + "&comid=" + comid;
		}else if(action=="rent"){//租房
			if(tr){
	           atpage = 1;
	           $(".czfList .house-list").html('');
			}

			data.push("lng="+lng);
			data.push("lat="+lat);
			data.push("orderby=juli");

			url =  masterDomain + "/include/ajax.php?service=house&action=zuList&page=" + atpage + "&pageSize=" + pageSize + "&comid=" + comid;
		}

		$.ajax({
			url: url,
			data:data.join("&"),
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data){
					if(data.state == 100){
						$(".house-list .loading").remove();
						var list = data.info.list, html = [];
						if(list.length > 0){
							if(action=="team"){
								for(var i = 0; i < list.length; i++){
									var pic = list[i].litpic == false || list[i].litpic == '' ? '/static/images/blank.gif' : list[i].litpic;
									html.push('<div class="house-box">');
								    html.push('<a href="'+list[i].url+'">');
								    html.push('<div class="house-item">');
								    html.push('<div class="jy_img l">'+(list[i].post == 2 ? '<span class="dz"></span>' : '')+'<img onerror="this.src=`/static/images/404.jpg`" src="'+pic+'"></div>');
								    html.push('<dl class="l">');
								    var sf_rz = list[i].certify==1 ? '<span class="sf_rz">身份认证</span>' : '';
									var mp_rz = list[i].flag==1 ? '<span class="mp_rz">名片认证</span>' : '';
								    html.push('<dt><em>'+list[i].nickname+'</em>'+sf_rz+mp_rz+'</dt>');
								    html.push('<dd class="jy-level">'+(list[i].level ? '<img onerror="this.src=`/static/images/404.jpg`" alt="'+list[i].level.name+'" src="'+list[i].level.icon+'" />' : '')+'</dd>');
								    html.push('<dd class="jy_item-area"><span><em>出租</em><em>'+list[i].zuCount+'</em></span><em>|</em><span><em>出售</em><em>'+list[i].saleCount+'</em></span><em>|</em><span><em>成交</em><em>'+list[i].sucCount+'</em></span></dd>');
								    html.push(' <dd class="item-type-1 jy-item-type-1 fn-clear"><em>'+list[i].address.join(' ')+'</em><button class="r">进入店铺</button></dd>');
								    html.push('</dl>');
								    html.push('</div>');
								    html.push('<div class="clear"></div>');
								    html.push('</a>');
								    html.push('</div>');
								}
		                        $(".jy .house-list").append(html.join(''));
							}else if(action=="esf"){//二手房
								for(var i = 0; i < list.length; i++){
									var pic = list[i].litpic == false || list[i].litpic == '' ? '/static/images/blank.gif' : huoniao.changeFileSize(list[i].litpic, "large");
									html.push('<div class="house-box">');
								    html.push('<a href="'+list[i].url+'">');
								    html.push('<div class="house-item">');
								    html.push('<div class="house-img l">');
								    var ivplay = list[i].video==1 ? '<i class="ivplay"></i>' : '';
	                            	var ivr = list[i].qj==1 ? '<i class="ivr"></i>' : '';
	                            	var set_top = list[i].isbid==1 ? '<i class="set_top"></i>' : '';
	                            	var label_01 = list[i].qj==1 ? '<span class="label_01">全景</span>' : '';
	                            	var price = '';
	                            	if(list[i].price>0){
	                            		price = '<span class="price r">'+list[i].price+'万'+echoCurrency('short')+'</span>';
		                            }else{
		                            	price = '<span class="price r">面议</span>';
		                            }
								   	html.push('<i class="house_disk"></i><img onerror="this.src=`/static/images/404.jpg`" src="'+pic+'">'+ivplay+ivr);
								    html.push('</div>');
								    html.push('<dl class="l">');
								    html.push('<dt>'+set_top+'<em>'+list[i].title+'</em>'+label_01+'</dt>');
								    html.push('<dd class="item-area"><em>'+list[i].room+'</em><em>'+list[i].area+'</em>'+price+'</dd>');
								    html.push('<dd class="item-type-1 fn-clear"><em class="l">'+list[i].community+'</em><em class="r">均价 '+list[i].unitprice+''+echoCurrency('short')+'/'+echoCurrency('areasymbol')+'</em></dd>');
								    html.push('</dl>');
								    html.push('</div>');
								    html.push('<div class="clear"></div>');
								    html.push('</a>');
								    html.push('</div> ');
								}
								$(".esfList .house-list").append(html.join(''));
							}else if(action=="rent"){
								 for(var i = 0; i < list.length; i++){
									var pic = list[i].litpic == false || list[i].litpic == '' ? '/static/images/blank.gif' : huoniao.changeFileSize(list[i].litpic, "large");
								    html.push('<div class="house-box">');
								    html.push('<a href="'+list[i].url+'">');
								    html.push('<div class="house-item">');
								    html.push('<div class="house-img l">');
								    var ivplay = list[i].video==1 ? '<i class="ivplay"></i>' : '';
	                            	var ivr = list[i].qj==1 ? '<i class="ivr"></i>' : '';
	                            	var set_top = list[i].isbid==1 ? '<i class="set_top"></i>' : '';
	                            	var label_01 = list[i].qj==1 ? '<span class="label_01">全景</span>' : '';
	                            	var price = '';
	                            	if(list[i].price>0){
	                            		price = '<span class="price r">'+list[i].price+''+echoCurrency('short')+'/月</span>';
		                            }else{
		                            	price = '<span class="price r">面议</span>';
		                            }
								    html.push('<i class="house_disk"></i><img onerror="this.src=`/static/images/404.jpg`"11 src="'+pic+'">'+ivplay+ivr);
								    html.push('</div>');
								    html.push('<dl class="l">');
								    html.push('<dt>'+set_top+'<em>'+list[i].title+'</em>'+label_01+'</dt>');
								    html.push('<dd class="item-area">');
								    html.push('<em>'+list[i].rentype+'</em><em>'+list[i].room+'</em><em>'+list[i].area+echoCurrency('areasymbol')+'</em><span class="price r">'+price+'</span>');
								    html.push('</dd>');
								    html.push('<dd class="item-type-1 item-type_zu"><em>'+list[i].distances+'</em><em>'+list[i].community+'</em></dd>');
								    html.push('</dl>');
								    html.push('</div>');
								    html.push('<div class="clear"></div>');
								    html.push('</a>');
								    html.push('</div>');
								  }
								  $(".czfList .house-list").append(html.join(""));
							}

							isload = false;

							//最后一页
							if(atpage >= data.info.pageInfo.totalPage){
								isload = true;
								if(action=="team"){
									$(".jy .house-list").append('<div class="loading" style="text-align: center;padding: .3rem;">已经到最后一页了</div>');
								}else if(action=="esf"){
									$(".esfList .house-list").append('<div class="loading" style="text-align: center;padding: .3rem;">已经到最后一页了</div>');
								}else if(action=="rent"){
									$(".czfList .house-list").append('<div class="loading" style="text-align: center;padding: .3rem;">已经到最后一页了</div>');
								}
							}

						//没有数据
						}else{
							isload = true;
							if(action=="team"){
								$(".jy .house-list").append('<div class="loading" style="text-align: center;padding: .3rem;">暂无相关信息</div>');
							}else if(action=="esf"){
								$(".esfList .house-list").append('<div class="loading" style="text-align: center;padding: .3rem;">暂无相关信息</div>');
							}else if(action=="rent"){
								$(".czfList .house-list").append('<div class="loading" style="text-align: center;padding: .3rem;">暂无相关信息</div>');
							}
						}

					//请求失败
					}else{
						if(action=="team"){
							$(".jy .house-list").html('<div class="loading" style="text-align: center;padding: .3rem;">'+data.info+'</div>');
						}else if(action=="esf"){
							$(".esfList .house-list").append('<div class="loading" style="text-align: center;padding: .3rem;">'+data.info+'</div>');
						}else if(action=="rent"){
							$(".czfList .house-list").append('<div class="loading" style="text-align: center;padding: .3rem;">'+data.info+'</div>');
						}
					}

				//加载失败
				}else{
					if(action=="team"){
						$(".jy .house-list .loading").html('加载失败');
					}else if(action=="esf"){
						$(".esfList .house-list .loading").html('加载失败');
					}else if(action=="rent"){
						$(".czfList .house-list .loading").html('加载失败');
					}
				}
			},
			error: function(){
				isload = false;
				if(action=="team"){
					$(".jy .house-list .loading").html('网络错误，加载失败！');
				}else if(action=="esf"){
					$(".esfList .house-list .loading").html('网络错误，加载失败！');
				}else if(action=="rent"){
					$(".czfList .house-list .loading").html('网络错误，加载失败！');
				}
			}
		});
	}






});
