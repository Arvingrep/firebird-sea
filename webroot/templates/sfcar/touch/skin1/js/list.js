$(function(){
    //获取url中的参数
    function getUrlParam(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if ( r != null ){
         return decodeURI(r[2]);
      }else{
         return null;
      }
    }
    var sendSplace = decodeURI(getUrlParam('startplace'));
    var sendEplace = decodeURI(getUrlParam('endplace'));
    var sendUserType = decodeURI(getUrlParam('type'));
    var sendCarType = decodeURI(getUrlParam('cartype'));
    var sendTime = decodeURI(getUrlParam('time'));
    // console.log(sendSplace,sendEplace,sendUserType,sendCarType,sendTime)

    $('.placeTop input').keypress(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
             $('.topForm').submit(); 
        }
    });
    if(sendUserType=='0'){//乘客找车
        $('.findCar').attr('data-id',0).text(langData['sfcar'][1][3]);//找乘用车
        $('.findTruck').attr('data-id',1).text(langData['sfcar'][1][4]);//找载货车
        $('.dayday').show();
    }else{//车主找乘客
        $('.findCar').attr('data-id',0).text(langData['sfcar'][1][1]);//找乘客
        $('.findTruck').attr('data-id',1).text(langData['sfcar'][1][2]);//找货物
        $('.dayday').hide();//我是车主没有天天发车
    }
    //根据传过来的参数一一对应
    $('#formType').val(sendUserType);//用车身份
    $('#formTime').val(sendTime);//时间类型
    $('#formCartype').val(sendCarType);//车类型

    if(sendTime!=''&&sendTime!='null'){
        $('.time-wrap li').removeClass('on')
        $('.time-wrap li').each(function(){
            
            var tId = $(this).attr('data-id');
            if(sendTime == tId){
                $(this).addClass('on');
                var txt = $(this).text();
                $('.choose-tab li.pubTime').html(txt+'<s></s>')
            }
        })
    }
    if(sendCarType!=''&&sendCarType!='null'){
        $('.choose-tab li.topCarType').removeClass('curr');
        $('.choose-tab li.topCarType').each(function(){           
            var tId = $(this).attr('data-id');
            if(sendCarType == tId){
                $(this).addClass('curr');
            }
        })
    }
    if(sendSplace!=''&&sendSplace!='null'){
        $('.startPlace').val(sendSplace)
    }
    if(sendEplace!=''&&sendEplace!='null'){
        $('.endPlace').val(sendEplace)
    }


    var isClick = 0;
    // 筛选框
    var disk = $('.disk');
    //存放最开始进页面时的id
    var firCarId = $('.findCar').attr('data-id');
    var firTruckId = $('.findCar').attr('data-id');
    $('.choose-tab li').click(function(){
        var t = $(this), index = t.index();         
        if($(this).hasClass('topCarType')){
            t.addClass('curr').siblings('.topCarType').removeClass('curr');
            var topCarType = $(this).attr('data-id');
            $('#formCartype').val(topCarType);

            isClick = 1; //关闭滚动监听
            $('html, body').animate({
                scrollTop: 0
            }, 500, function(){
                isClick = 0; //开启滚动监听
            });
            $(".list .loading").remove();
            $('.list ul').html('');
            $('.list').append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
            setTimeout(function(){
                    getList(1);
            }, 300);
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
        $('html').removeClass('noscroll');
        $(this).addClass('on').siblings().removeClass('on');
        var time = $(this).attr('data-id');
        $('.time-wrap').addClass('hide-time').animate({'top': '-100%',}, 100);
        disk.fadeOut();
        var txt = $(this).text();
        $('.choose-tab li.pubTime').html(txt+'<s></s>')
        $('#formTime').val(time);
        isClick = 1; //关闭滚动监听
        $('html, body').animate({
            scrollTop: 0
        }, 500, function(){
            isClick = 0; //开启滚动监听
        });
        setTimeout(function(){
            $(".list .loading").remove();
            $('.list ul').html('');
            $('.list').append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        }, 300);
        
        setTimeout(function(){
                getList(1);
        }, 400);

    })
    $('.cancel,.disk').click(function(){
        disk.fadeOut();
        if($('.time-wrap li.on').length>0){     
            $('.choose-tab li.all').removeClass('curr');    
        }else{
            $('.choose-tab li.pubTime').removeClass('curr');
        }
        $('html').removeClass('noscroll');
        $('.time-wrap').addClass('hide-time').animate({'top': '-100%',}, 100);
    })

    $('.list').delegate('a', 'click', function(){
        var t = $(this), url = t.attr('data-url');
        if(!$(this).hasClass('privatePhoneBtn')){
		    location.href=url
        }
    });

    // $('.list').delegate('.call','click',function(e){
    //     e.stopPropagation();
    // })

    //出发地 目的地切换 值调换
    $('.top-changecity').click(function(){
        var departure = $('.placeTop .startPlace').val();
        var destination = $('.placeTop .endPlace').val();
        $('.placeTop .startPlace').toggleClass('choose').addClass('left_move');
        $('.placeTop .endPlace').toggleClass('choose').addClass('right_move');
        $('.top-changecity s').addClass('transform');
        setTimeout(function () {
            $('.placeTop .endPlace').val(departure).removeClass('right_move');
            $('.placeTop .startPlace').val(destination).removeClass('left_move');;
            $('.top-changecity s').removeClass('transform');
        }, 300)

    })
    //下拉加载
    var isload = false,page=1,pageSize=20;
    
    $(window).scroll(function() {
        if(isClick) return false;//点击切换时关闭滚动监听
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - 80- w;
        if ($(window).scrollTop() > scroll && !isload) {
            page++;
            getList();       
        };
    });
    
    //初始加载

    getList();
   
    //获取信息列表
    function getList(tr){
        isload = true;
        if(tr){
            page =1;           
        }
        if(page!=1){
             $(".list").append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        }

        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("cityid="+cityid);
        //用车 or 车主
        if(ttype!=undefined){
            data.push("type="+ttype);
        }

        //用车类型 找客or 载客
        var cartype = $(".topCarType.curr").attr("data-id");
        if(cartype!=undefined){
            data.push("cartype="+cartype);
        }

        var timetype = $(".time-wrap li.on").attr("data-id");
        if(timetype!=undefined && timetype!=''){
            data.push("orderby="+timetype);
        }
        //出发地和目的地
        var startPlace = $(".inp .startPlace").val();
        var endPlace = $(".inp .endPlace").val();      
        if(startPlace!='' || endPlace!=''){
            data.push("startaddr="+startPlace);
            data.push("endaddr="+endPlace);
        }
        $.ajax({
            url: masterDomain + "/include/ajax.php?service=sfcar&action=getsfcarlist&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    $(".list .loading").remove();
                    var totalCount = data.info.pageInfo.totalCount;
                    $('.infoNum strong').text(totalCount);
                    var cartype     = zhiding =  ''; 
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                        //if (list[i].invalid == 1){
                            html.push('<li class="fn-clear">');
                            html.push('<a class="top_con" href="javascript:;" data-url="'+list[i].url+'">');
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
                            if(list[i].accessaddrserch){

                                html.push('<em class="routeFlag">途径'+list[i].accessaddrserch+'</em>');
                            }
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
                            html.push('<a href="javascript:;" class="call privatePhoneBtn '+(cfg_payPhoneState == 1 && !list[i].payPhoneState ? 'payPhoneBtn ' : '')+'" data-module="sfcar" data-temp="detail" data-id="'+list[i].id+'">'+langData['sfcar'][0][36]+'</a>');//拨打电话
                            html.push('</div>');
                            html.push('</li>');
                       // }
                    }

                                    
                    $(".list ul").append(html.join(""));
                    
                    isload = false;

                    if(page >= pageinfo.totalPage){
                        isload = true;
                        $(".list").append('<div class="loading">'+langData['sfcar'][1][6]+'</div>');//没有更多了
                    }

                }else{

                    $(".list").html('<div class="loading">'+data.info+'</div>');
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