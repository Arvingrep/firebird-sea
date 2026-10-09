$(function(){
  var device = navigator.userAgent;
//   if(device.indexOf('huoniao') > -1){
//         $('.area a').bind('click', function(e){
//             e.preventDefault();
//             setupWebViewJavascriptBridge(function(bridge) {
//                 bridge.callHandler('goToCity', {}, function(){});
//             });
//         });
//     }

var checkname = '',position_cityid ,position_city,position_area ,position_areaid; //验证城市

location();
// 定位
function location(force){
	HN_Location.init(function(data){
		if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
			alert(langData['siteConfig'][27][137]);
			position_cityid = cityid;  //定位失败 选择当前城市分站
			position_city  = city;
			checkname = position_city;//验证的城市
			position_area = '';
			getCity()
		}else{
			var lng = data.lng, lat = data.lat, name = data.name, page = 1;
			var time = Date.parse(new Date());
			if(data.city.indexOf(city) > -1){  //定位显示当前是城市分站
				position_cityid = cityid;
				position_city  = city;
				position_area = data.district;
				getCity(position_city)
			}else{
				position_city  = data.city;
				checkname = position_city;//验证的城市
				position_area = data.district
				getCity()
			}
		}
	}, force);
}


function getCity(id){
	var data = {};
	if(id){
		data = {'type':id};
		checkname = position_area;
	}
	$.ajax({
		url: '/include/ajax.php?service=siteConfig&action=addr&son=1',
		data: data,
		type: "POST",
		dataType: "json",
		success: function (data) {
			if(data.state == 100){
				var cityList = data.info;
				var cityObj = cityList.find(checkCity);  //城市对象
				if(cityObj){
					if(!id){
						position_cityid = cityObj.id;
						$(".gz-addr-seladdr").attr('data-ids',position_cityid).attr('data-id',position_cityid);
						$(".gz-addr-seladdr .city,.gz-addr-seladdr .city2").html(position_city)
						getCity(position_cityid);
						
					}else{
						position_areaid =  cityObj.id;
						position_area =  cityObj.typename
						$(".gz-addr-seladdr").attr('data-ids',position_cityid +' '+position_areaid).attr('data-id',position_areaid);
						$(".gz-addr-seladdr .city").html(position_city+' '+position_area)
					}
				}else{
                     if(!position_cityid){
                        position_cityid = cityid;
                        position_city  = cityName;
                    }
					$(".gz-addr-seladdr").attr('data-ids',position_cityid).attr('data-id',position_cityid);
					$(".gz-addr-seladdr .city,.gz-addr-seladdr .city2").html(position_city)
				}
			}
		},
		error: function(){}
	});
}

// 查找符合的城市
function checkCity(city){
	if(checkname.indexOf(city.typename) > -1){
		return city
	}
}

  // banner轮播图
  new Swiper('.banner .swiper-container', {pagination:{ el: '.banner .pagination',},loop: true,grabCursor: true,paginationClickable: true,autoplay:{delay: 2000,}});

   // 滑动导航
    var t = $('.tcInfo .swiper-wrapper');
    var swiperNav = [], mainNavLi = t.find('li');
    for (var i = 0; i < mainNavLi.length; i++) {
        swiperNav.push('<li>'+t.find('li:eq('+i+')').html()+'</li>');
    }

    var liArr = [];
    for(var i = 0; i < swiperNav.length; i++){
        liArr.push(swiperNav.slice(i, i + 10).join(""));
        i += 9;
    }

    t.html('<div class="swiper-slide"><ul class="fn-clear">'+liArr.join('</ul></div><div class="swiper-slide"><ul class="fn-clear">')+'</ul></div>');
    new Swiper('.tcInfo .swiper-container', {pagination: {el:'.tcInfo .pagination',}, loop: false, grabCursor: true, paginationClickable: true});


  // //左右导航切换(按空间,按风格,按户型)
    // //导航内容切换
    $('.reno_tab li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('#tabs_container .design_container').eq(i).addClass('div_show').siblings().removeClass('div_show');
    });

    //滚动信息
    $.ajax({
        url : "/include/ajax.php?service=renovation&action=rese&type=0&bid="+id,
        type : "GET",
        data : {},
        dataType : "json",
        success : function (data) {
            var obj = $(".mBox .swiper-wrapper");
            if(data.state == 100){
                var list = data.info.list;
                var html = '';
                var length = list.length;
                for (var i = 0; i < length; i++){
                    if(i < length){
                        if(i % 2 != 0 ){
                            html += '<div class="swiper-slide swiper-no-swiping">' +
                            '<ul><li>'+list[i].people+'</li><li class="origion">'+list[i].community+'</li><li>三居</li><li>195平</li><li>面议</li></ul></a></div>';
                        }
                    }           

                }
                obj.html(html);
                new Swiper('.tcNews .swiper-container', {direction: 'vertical', pagination: { el: '.tcNews .pagination'},loop: true,autoplay: {delay: 2000},observer: true,observeParents: true,disableOnInteraction: false});
            }
        }
    });


   //横向滚动

    var swiper = new Swiper('.jz_service .swiper-container', {
      slidesPerView: 2.5,
      spaceBetween: 15,
      slidesPerGroup: 3,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      }

    });

    //房屋类型
  	//弹窗里的户型
    $('.price_alert .room_type').click(function(){
       $('.quote .room_type').click();
    })
    var hx =[];
    getHuxing()
    function getHuxing(){
        $.ajax({
            type: "POST",
            url: "/include/ajax.php?service=renovation&action=type&type=8",
            dataType: "json",
            success: function(res){
                if(res.state==100 && res.info){
                    var list = res.info;
                    var huxinSelect = new MobileSelect({
                        trigger: '.room_type',
                        title: '',
                        wheels: [
                            {data:list}
                        ],
                        keyMap: {
                            id: 'id',
                            value: 'typename'
                        },
                        position:[0, 0],
                        callback:function(indexArr, data){
                            $('.roomType').val(data[0].typename);
                            $('.room_type .type_room span').hide();
                            $('#units').val(data[0].id)
                        }
                        ,triggerDisplayData:false,
                    });
                }
            }
        });
    }

    // 立即报价弹出
    $('.publish-news').click(function(){
        $('.shop-img img').css('opacity',0.7);
        $('.news-img img').css('opacity',1);
        $('.quote').show().addClass('show');
        $('.order').hide().removeClass('show');
   
     })
    //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').closest('li').hide();
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                   }
                   $('.layer_list ul').append(phoneList.join(''));
                }else{
                   $('.layer_list ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.layer_list ul').html('<div class="loading">加载失败！</div>');
                }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $('.layer_code').show();
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.layer_list').delegate('li','click',function(){
        var t = $(this), txt = t.find('em').text();
        var par = $('.formCommon.show')
        var arcode = par.find('.areacode_span')
        arcode.find("label").text(txt);
        par.find(".areaCodeinp").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code, #popupReg-captcha-mobile').hide();
        $('.mask-code').removeClass('show');
    })
    //立即报价提交
    $('.submit,.freePrice').click(function(){
        var f = $(this) 
        var par = f.closest('.formCommon');
        var room_type = par.find('.roomType').val(), 
            room_area = par.find('.room_area').val(), 
            name = par.find('.name').val(),
            units = $("#units").val();
            tel = par.find('.phone').val();
        var txt = f.text();    
        if(f.hasClass("disabled")) return false;
        
        var areaCodev = par.find('.areaCodeinp').val();
        var addrid = par.find('.gz-addr-seladdr').attr('data-id');
        if (par.find('.city').text() == langData['renovation'][0][13]) {//请选择您所在的城市

            par.find('.city-1').show();
            setTimeout(function(){par.find('.city-1').hide()},1000);

        }else if (!tel) {

            par.find('.phone-1').show();
            setTimeout(function(){par.find('.phone-1').hide()},1000);

        }else {

            f.addClass("disabled").text(langData['renovation'][14][49]);//正在获取，请稍后

            var data = [];
            data.push("units="+units);
            data.push("are="+room_area);
            data.push("people="+name);
            data.push("areaCode="+areaCodev);
            data.push("contact="+tel);
            data.push("bid="+id);
            data.push("company="+company);
            data.push("resetype=1");
            data.push("addrid="+addrid);

            $.ajax({
                url: "/include/ajax.php?service=renovation&action=sendRese",
                data: data.join("&"),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    f.removeClass("disabled").text(txt);//
                    if(data && data.state == 100){//要返回价格回来
                        $('.price_mask').show();
                        
                    }else{
                        alert(data.info);
                    }
                },
                error: function(){
                    alert(langData['renovation'][14][88]);//获取失败，请重试！
                    f.removeClass("disabled").text(txt);//
                }
            });
        }
    })

    // 立即报价关闭
     $('.price_mask .work_close').click(function(){
        $('.price_mask').hide();
   
     })


    // 立即预约弹出
    $('.merchant').click(function(){
        $('.news-img img').css('opacity',0.7)
        $('.shop-img img').css('opacity',1)
        $('.order').show().addClass('show');
        $('.quote').hide().removeClass('show');   
   
     })

    // 立即预约 表单验证
    $('.submit2,.freeOrder').click(function(){
        var f = $(this);  
        var par = f.closest('.formCommon');      
        var name2 = par.find('.name').val(), 
            tel2 = par.find('.phone').val(),
            room2 = par.find('.room').val();
        var txt = f.text();
        if(f.hasClass("disabled")) return false;
        console.log(par.find('.city').text())
        var areaCodev = par.find('.areaCodeinp').val();
        var addrid = par.find('.gz-addr-seladdr').attr('data-id');
        if (par.find('.city').text() == langData['renovation'][0][13]) {//请选择您所在的城市

            par.find('.city-1').show();
            setTimeout(function(){par.find('.city-1').hide()},1000);

        }else if (!tel2) {

            par.find('.phone-1').show();
            setTimeout(function(){par.find('.phone-1').hide()},1000);

        }else {

            f.addClass("disabled").text(langData['renovation'][14][58]);//预约中...

            var data = [];
            data.push("community="+room2);
            data.push("people="+name2);
            data.push("areaCode="+areaCodev);
            data.push("contact="+tel2);
            data.push("bid="+id);
            data.push("company="+company);
            data.push("addrid="+addrid);

            $.ajax({
                url: "/include/ajax.php?service=renovation&action=sendRese",
                data: data.join("&"),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    f.removeClass("disabled").text(txt);//
                    if(data && data.state == 100){
                        $('.order_mask').show()
                        
                    }else{
                        alert(data.info);
                    }
                },
                error: function(){
                    alert(langData['renovation'][14][90]);//预约失败，请重试！
                    f.removeClass("disabled").text(txt);//
                }
            });
        }
    })

    // 立即预约关闭
     $('.order_mask .work_close').click(function(){
        $('.order_mask').hide();
   
     })

    //底部预约和报价弹出层关闭
    $('.price_alert .work_close').click(function(){
        $('.price_alert').hide();
   
    })
    $('.order_alert .work_close').click(function(){
        $('.order_alert').hide();
   
    })
    //底部预约和报价弹出层弹出
    $('.choose_submit .sure').click(function(){
        $('.price_alert').show();
        $('.formCommon').removeClass('show');
        $('.price_alert').find('.formCommon').addClass('show');
   
    })
    $('.choose_submit .reset').click(function(){
        $('.order_alert').show();
        $('.formCommon').removeClass('show');
        $('.order_alert').find('.formCommon').addClass('show');
    })




    // 悬浮发布
    $(document).ready(function (ev) {
          $('.menu').on('touchend', function (ev) {
              if($('.mask').hasClass('show')){
                 $('.mask').removeClass('show');
               }else{
                 $('.mask').addClass('show');
               }
              $('.mIcon').toggleClass('close');
              $('.menu').toggleClass('m_active');
              $('.mIcon.wx').toggleClass('m_curr');
              $('.mIcon.my').toggleClass('m_curr');
              $('.mIcon.gt').toggleClass('m_curr');
          });

    });



    //装修案例
    caseList()
    function caseList(){
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=renovation&action=diary&company="+id+"&page=1&pageSize=4",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    var cList = [], list = data.info.list;
                    if(list.length >0){
                        $('.caseList .loading').remove();
                        for (var i = 0; i < list.length; i++){

                            var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                            cList.push('<li>');
                            cList.push('<a href="'+list[i].url+'">');
                            cList.push('<div class="anli_top">');
                            cList.push('<img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';">');
                            cList.push('</div>');
                            cList.push('<h3 class="anli_tit">'+list[i].title+'</h3>');                        
                            cList.push('<p class="anli_info">'+list[i].area+'m² | '+list[i].style+' | '+list[i].price+''+langData['renovation'][9][22]+' | '+list[i].btype+'</p>');
                            cList.push('</a>');
                            cList.push('</li>');
                        }
                        $('.caseList').html(cList.join(''));
                    }else{
                        $('.caseList .loading').html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }
                    
                }else{
                    $('.caseList .loading').html(data.info)
                }
            },
            error: function(){
                $('.caseList .loading').html(data.info)
            }
        });
    }

    //设计师
    teamList()
    function teamList(){
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=renovation&action=team&company="+id+"&page=1&pageSize=4",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    var cList = [], list = data.info.list;
                    var totalCount = data.info.pageInfo.totalCount;
                    $('.reno_artist .num').text(langData['renovation'][15][5].replace('1',totalCount));//共1个
                    if(list.length >0){
                        $('.teamList .loading').remove();
                        for (var i = 0; i < list.length; i++){

                            var pic = list[i].photo != "" && list[i].photo != undefined ? huoniao.changeFileSize(list[i].photo, "small") : "/static/images/404.jpg";
                            cList.push('<li>');
                            cList.push('<a href="'+list[i].url+'">');
                            cList.push('<div class="foreman_photo">');
                            cList.push('<img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';">');
                            cList.push('</div>');
                            cList.push('<p class="foreman_name">'+list[i].name+'</p>');     
                            if(list[i].diary>0) {
                                cList.push('<p class="foreman_age">'+langData['renovation'][14][71].replace('1',list[i].diary)+'</p>');
                            }else{
                                cList.push('<p class="foreman_age">'+langData['renovation'][14][73]+'</p>');
                            }                  
                            
                            cList.push('</a>');
                            cList.push('</li>');
                        }
                        $('.teamList').html(cList.join(''));
                    }else{
                        $('.teamList .loading').html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }
                    
                }else{
                    $('.teamList .loading').html(data.info)
                }
            },
            error: function(){
                $('.teamList .loading').html(data.info)
            }
        });
    }
    //在线工地
    siteList();
    function siteList(){
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=renovation&action=constructionList&company="+id+"&page=1&pageSize=3",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    var cList = [], list = data.info.list;
                    if(list.length >0){
                        $('.siteList .loading').remove();
                        for (var i = 0; i < list.length; i++){
							var id = list[i].id;
                            var durl = detailUrl.replace("%id%", id);
                            var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                            cList.push('<li class="fn-clear">');
                            cList.push('<a href="'+durl+'">');
                            cList.push('<div class="left_b">');
                            cList.push('<img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';">');
                            //结束阶段 类名加over
                            cList.push('<span class="state">'+list[i].mqjd+'</span>');//准备阶段
                            cList.push('</div>');

                            cList.push('<div class="right_b">');     
                            cList.push('<h3 class="build_title">'+list[i].title+'</h3>');     
                            cList.push('<div class="build_middle">');     
                            cList.push('<p><span>'+langData['renovation'][4][19]+'：</span><span>'+list[i].style+'</span></p>');//风格   
                            cList.push('<p><span>'+langData['renovation'][4][20]+'：</span><span>'+list[i].area+'平</span></p>');//面积     
                            cList.push('</div>');   
                            cList.push('<div class="build_bottom fn-clear">');     
                            cList.push('<span>'+list[i].company+'</span>');     
                            cList.push('</div>');     
                            cList.push('</div>');                                              
                            cList.push('</a>');
                            cList.push('</li>');
                        }
                        $('.siteList').append(cList.join(''));
                    }else{
                        $('.siteList .loading').html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }
                    
                }else{
                    $('.siteList .loading').html(data.info)
                }
            },
            error: function(){
                $('.siteList .loading').html(data.info)
            }
        });
    }

    //工长
    foremanList()
    function foremanList(){
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=renovation&action=foreman&company="+id+"&page=1&pageSize=4",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    var cList = [], list = data.info.list;
                    if(list.length >0){
                        $('.foremanList .loading').remove();
                        for (var i = 0; i < list.length; i++){

                            var pic = list[i].photo != "" && list[i].photo != undefined ? huoniao.changeFileSize(list[i].photo, "small") : "/static/images/404.jpg";
                            cList.push('<li>');
                            cList.push('<a href="'+list[i].url+'">');
                            cList.push('<div class="foreman_photo">');
                            cList.push('<img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';">');
                            cList.push('</div>');
                            cList.push('<p class="foreman_name">'+list[i].name+'</p>');     
                            if(list[i].works>0) {
                                cList.push('<p class="foreman_age">'+langData['renovation'][14][94].replace('1',list[i].works)+'</p>');//1年工龄
                            }else{
                                cList.push('<p class="foreman_age">'+langData['siteConfig'][20][592]+'</p>');//暂无
                            }                  
                            
                            cList.push('</a>');
                            cList.push('</li>');
                        }
                        $('.foremanList').html(cList.join(''));
                    }else{
                        $('.foremanList .loading').html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }
                    
                }else{
                    $('.foremanList .loading').html(data.info)
                }
            },
            error: function(){
                $('.foremanList .loading').html(data.info)
            }
        });
    }



});
