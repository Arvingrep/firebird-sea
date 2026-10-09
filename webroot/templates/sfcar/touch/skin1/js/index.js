$(function(){
    //切换城市、搜索跳转
    
  var device = navigator.userAgent;
  if(device.indexOf('huoniao') > -1){
    // $('.areachose').bind('click', function(e){
    //   setupWebViewJavascriptBridge(function(bridge) {
    //     bridge.callHandler('goToCity', {'module': 'sfcar'}, function(){});
    //   });
    //   return false;
    // });
  }else{
    $('.areachose').bind('click', function(){
        location.href = $(this).data('url');
    });
  } 

	//广告位滚动
	new Swiper('.banner .swiper-container', {pagination: '.banner .pagination',paginationClickable: true, loop: true, autoplay: 4000, });
	//头部目的地搜索
    $('.placeTop input').keypress(function(event){
	    var keycode = (event.keyCode ? event.keyCode : event.which);
	    if(keycode == '13'){
	         $('.topForm').submit();
	    }
	});
	//车主和乘客切换
  var isClick =  1;
	$('.tab li').click(function(){
       isClick = 0;
		var t = $(this);
		$(this).addClass('active').siblings().removeClass('active');
		if($(this).hasClass('owner')){
			$('.ownerCon').addClass('show').show();
			$('.userCon').removeClass('show').hide();
			t.parent('ul').addClass('on')
        	$('.findCar').attr('data-id',0).text(langData['sfcar'][1][1]);//找乘客
        	$('.findTruck').attr('data-id',1).text(langData['sfcar'][1][2]);//找货物
        	$('.dayday').hide();//我是车主没有天天发车
		}else{
			t.parent('ul').removeClass('on')
			$('.ownerCon').removeClass('show').hide();
			$('.userCon').addClass('show').show();
			$('.findCar').attr('data-id',0).text(langData['sfcar'][1][3]);//找乘用车
        	$('.findTruck').attr('data-id',1).text(langData['sfcar'][1][4]);//找载货车
        	$('.dayday').show();
		}
		checkChoose()
		$(".list .loading").remove();
        $('.list ul').html('');
        $('.list').append('<li class="pl_h"><div class="loading">'+langData['siteConfig'][38][8]+'</div></li>');//加载中...
        setTimeout(function(){
                getList(1);
        }, 300);
		$('#formType').val($(this).attr('data-type'));
	})
	//货车类型 出发时间
	$('.c_top span').click(function(){
       isClick = 0;
		$(this).addClass('checked').siblings().removeClass('checked');
		checkChoose();
		$(".list .loading").remove();
        $('.list ul').html('');
        $('.list').append('<li class="pl_h"><div class="loading">'+langData['siteConfig'][38][8]+'</div></li>');//加载中...
        setTimeout(function(){
                getList(1);
        }, 300);

	})
	function checkChoose(){
		var carId = $(".c_top.show .carType .checked").attr("data-id");
		var timeId = $(".c_top.show .carPub .checked").attr("data-id");
		var timeTxt = $(".c_top.show .carPub .checked").text();
		$('.choose-tab li.topCarType').each(function(){
            var tId = $(this).attr('data-id');
            if(carId == tId){
                $(this).addClass('curr').siblings('.topCarType').removeClass('curr');
            }
        })
        $('.time-wrap li').each(function(){
            var tId = $(this).attr('data-id');
            if(timeId == tId){
                $(this).addClass('on').siblings('li').removeClass('on');
                $('.choose-tab li.pubTime').html(timeTxt+'<s></s>')
            }
        })
	}
	//出发地 目的地 监听输入 传到头部
	$(".c_bot .startPlace").bind('input propertychange', function () {
        var term = $(this).val();
       	$('.placeTop .startPlace').val(term);

    });
    $(".placeTop .startPlace").bind('input propertychange', function () {
        var term = $(this).val();
        $('.c_bot .startPlace').val(term);

    });
    $(".c_bot .endPlace").bind('input propertychange', function () {
        var term = $(this).val();
        $('.placeTop .endPlace').val(term);
    });
    $(".placeTop .endPlace").bind('input propertychange', function () {
        var term = $(this).val();
        $('.c_bot .endPlace').val(term);
    });
    //出发地 目的地切换 值调换
    $('.changecity').click(function(){
    	var departure = $('.c_bot .startPlace').val();
    	var destination = $('.c_bot .endPlace').val();
	    $('.c_bot .startPlace').toggleClass('choose').addClass('left_move');
	    $('.c_bot .endPlace').toggleClass('choose').addClass('right_move');
	    $('.changecity s').addClass('transform');
	    setTimeout(function () {
	        $('.c_bot .endPlace').val(departure).removeClass('right_move');
	    	$('.c_bot .startPlace').val(destination).removeClass('left_move');;
	    	$('.placeTop .startPlace').val(destination)
	    	$('.placeTop .endPlace').val(departure)
	      	$('.changecity s').removeClass('transform');
	    }, 300)

    })
    $('.top-changecity').click(function(){
    	var departure = $('.placeTop .startPlace').val();
    	var destination = $('.placeTop .endPlace').val();
	    $('.placeTop .startPlace').toggleClass('choose').addClass('left_move');
	    $('.placeTop .endPlace').toggleClass('choose').addClass('right_move');
	    $('.top-changecity s').addClass('transform');
	    setTimeout(function () {
	        $('.placeTop .endPlace').val(departure).removeClass('right_move');
	    	$('.placeTop .startPlace').val(destination).removeClass('left_move');;
	    	$('.c_bot .startPlace').val(destination)
	    	$('.c_bot .endPlace').val(departure)
	      	$('.top-changecity s').removeClass('transform');
	    }, 300)

    })

	//搜索
	$('.serButton').click(function(){
		var startPlace = $(".c_bot .startPlace").val();
        var endPlace = $(".c_bot .endPlace").val();
        if(startPlace!='' || endPlace!=''){
            $('.topForm').submit();
        }


	})
	//下拉加载
    var isload = false,page=1,pageSize=4;
    var sc = $('.list').offset().top - 50;
    $(window).scroll(function() {
    	if($(window).scrollTop()>sc){
            $('.topForm').css('display','block');
        }else{
            $('.topForm').css('display','none');
        }
        if(isClick == 0) return false;//为了避免头部切换时 与滚动加载冲突
        var h = $('.list li').height();
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh -80- w;
        if ($(window).scrollTop() >= scroll && !isload) {
        	page++;
            getList();
        };
    });
    // 筛选框
    var formType = $('.tab li.active').attr('data-type');

    $('#formType').val(formType);
    var disk = $('.disk');
    //存放最开始进页面时的id
    var oldCarType = $('.choose-tab li.topCarType.curr').attr('data-id');
    $('#formCartype').val(oldCarType);
	$('.choose-tab li').click(function(){
		var t = $(this), index = t.index();
		if($(this).hasClass('topCarType')){
			t.addClass('curr').siblings('.topCarType').removeClass('curr');
			var topCarType = $(this).attr('data-id');
			$('#formCartype').val(topCarType);
			$('.topForm').submit();
		}else{
			if($('.time-wrap').hasClass('hide-time')){
			 	disk.fadeIn();
                t.addClass('curr');
                $('html').addClass('noscroll');
                setTimeout(function(){
                $('.time-wrap').removeClass('hide-time').animate({'top': '0',}, 100);
                },100)
			}else{
				$('.time-wrap').addClass('hide-time').animate({'top': '-100%',}, 100);
                disk.fadeOut();
                if($('.time-wrap li.on').length==0){
                    t.removeClass('curr');
                }
                $('html').removeClass('noscroll');
			}

		}

	});
	$('.time-wrap li').click(function(){
		$(this).addClass('on').siblings().removeClass('on');
		var time = $(this).attr('data-id');
		$('#formTime').val(time);
		$('.topForm').submit();

	})
	$('.cancel,.disk').click(function(){
		disk.hide();
 		$('html').removeClass('noscroll');
 		$('.time-wrap').addClass('hide-time').animate({'top': '-100%',}, 100);
	})
   $('.list').delegate('a','click',function(e){
		var url = $(this).attr('data-url');
        if(!$(this).hasClass('privatePhoneBtn')){
		    location.href=url
        }
	})
	// $('.list').delegate('.call','click',function(e){
	// 	e.stopPropagation();
	// })

    getList()
    //获取信息列表
    function getList(tr){
    	isload = true;
    	if(tr){
    		page=1;
            isClick=1;

    	}
    	if(page!=1){
    		$(".list").append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
    	}
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("cityid="+cityid);
        // 用车 or 车主
        var usetype = $(".tab .active").attr("data-type");
        if(usetype!=undefined && usetype!=''){
            if (usetype==1) {
                usetype = 0;
            }else{
                usetype = 1;
            }
            data.push("type="+usetype);
        }

        // 用车类型 找客or 载客
        var cartype = $(".c_top.show .carType .checked").attr("data-id");
        if(cartype!=undefined && cartype!=''){
            data.push("cartype="+cartype);
        }
        // 出发时间
        var timetype = $(".c_top.show .carPub .checked").attr("data-id");
        if(timetype!=undefined && timetype!=''){
            data.push("orderby="+timetype);
        }
        // 出发地和目的地
        var startPlace = $(".c_bot .startPlace").val();
        var endPlace = $(".c_bot .endPlace").val();
        if(startPlace!='' || endPlace!=''){
            data.push("startplace="+startPlace);
            data.push("endplace="+endPlace);
        }


        $.ajax({
            url: "/include/ajax.php?service=sfcar&action=getsfcarlist&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
            	$('.pl_h').remove();
            	$(".list .loading").remove();
                if(data && data.state == 100){
                    var totalCount  = data.info.pageInfo.totalCount;
                    var cartype     = zhiding =  '';
                    $('.infoNum strong').text(totalCount);
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                       	html.push('<li class="fn-clear">');
                        html.push('<a class="top_con" href="javascript:;" data-url="'+list[i].url+'">' );
                        html.push('<div class="li_top">');
                        //乘用车car 载货车truck 乘客car 货物truck
                        if(list[i].usetype ==0){
                            cartype = "car";
                        }else{
                            cartype = "truck";

                        }
                        html.push('<span class="car-type '+cartype+'">'+list[i].usetypename+'</span>');
                        html.push('<h2 class="liTitle">'+list[i].startaddr+'<s></s>'+list[i].endaddr+'</h2>');

                        if(list[i].isbid){
                            zhiding = langData['siteConfig'][19][762];
                            html.push('<em class="topFlag">'+zhiding+'</em>');//置顶
                        }
                        // html.push('<em class="routeFlag">途径六合</em>');
                        html.push('</div>');
                        html.push('<div class="startTime">');
                        if(list[i].missiontype==1){
                          html.push('<strong class="startdayDay">'+list[i].missiontime+'</strong>');
                          html.push('<span class="startWeek">'+list[i].missiontime1+langData['sfcar'][1][5]+'</span>');//出发
                        }else{
                            html.push('<strong class="startDay">'+list[i].missiontime+'</strong>');
                            html.push('<span class="startWeek">'+list[i].missiontime1+langData['sfcar'][1][5]+'</span>');//出发
                        }

                        html.push('<span class="pubTime">'+list[i].pubdatetime+'</span>');
                        html.push('</div>');
                        if(list[i].note){

                            html.push('<div class="startNote">');
                            html.push('<strong>'+langData['siteConfig'][16][74]+'</strong><em>：</em>');//备注
                            html.push('<span>'+list[i].note+'</span>');
                            html.push('</div>');
                        }
                        html.push('</a>');
                        html.push('<div class="carInfo">');
                        html.push('<a class="car-info" href="javascript:;" data-url="'+list[i].url+'">');
                        if(list[i].Specifications){

                            html.push('<span>'+list[i].Specifications+'</span>');
                        }

                        if(list[i].tag!=''){
                        	var len = (list[i].tag.length > 3)?3 : list[i].tag.length;
                            for(var m=0;m<len;m++){
                              if(list[i].tag[m]){
                                html.push('<span>'+list[i].tag[m]+'</span>');
                              }
                            }
                        }
                        html.push('</a>');
                        html.push('<a href="javascript:;" data-tel="'+list[i].tel+'" class="call privatePhoneBtn  '+(cfg_payPhoneState == 1 && !list[i].payPhoneState ? 'payPhoneBtn  ' : '')+'" data-module="sfcar" data-temp="detail" data-id="'+list[i].id+'">'+langData['sfcar'][0][36]+'</a>');//拨打电话
                        html.push('</div>');
                        html.push('</li>');
                    }




					if($(".list ul").size() > 0){
						$(".list ul").append(html.join(""));
                    }else{
                    	$(".list").html('<ul>'+html.join("")+'</ul>');
                    }
					isload = false;
                    if(page >= pageinfo.totalPage){
                        isload = true;
                        $(".list").append('<div class="loading">'+langData['sfcar'][1][6]+'</div>');//没有更多了
                    }





                }else{
                    $(".list").append('<li class="pl_h"><div class="loading">'+data.info+'</div></li>');
                    // $(".list .loading").html(data.info);
                }
            },
            error: function(){
                isload = false;
                //网络错误，加载失败
                $(".list .loading").html(langData['siteConfig'][20][227]); // 网络错误，加载失败
            }
        });

    }
})
