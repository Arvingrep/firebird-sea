$(function () {

    // 最新入驻--焦点图
    var swiperNav = [], mainNavLi = $('.slideBox4 .bd').find('li');
    for (var i = 0; i < mainNavLi.length; i++) {
        swiperNav.push($('.slideBox4 .bd').find('li:eq('+i+')').html());
    }
    var liArr = [];
    for(var i = 0; i < swiperNav.length; i++){
        liArr.push(swiperNav.slice(i, i + 6).join(""));
        i += 5;
    }
    $('.slideBox4 .bd').find('ul').html('<li>'+liArr.join('</li><li>')+'</li>');
    $(".slideBox4").slide({titCell:".hd ul", mainCell:".bd ul",effect:"leftLoop", autoPage:"<li></li>",autoPlay: true});



    /* 内层图片滚动切换 */
    $(".slideGroup .slideBox").slide({ mainCell:"ul",vis:4,prevCell:".sPrev",nextCell:".sNext",effect:"leftLoop"});

    //广告轮播
    $(".adbox .slideBox").slide({mainCell:".bd ul",effect:"left",autoPlay:true, autoPage:'<li></li>', titCell: '.hd ul'});

    $("#adbox").hover(function(){
        $(this).find(".prev, .next").fadeIn(300);
    }, function(){
        $(this).find(".prev, .next").hide();
    });

    //本周精选
    $("#setbox ul").cycle({
        fx: 'fade',
        speed: 200,
        pager: '#setboxBtn',
        next:	'#setbox_next',
        prev:	'#setbox_prev',
        pause: true
    });

    $("#setbox").hover(function(){
        $(this).find(".prev, .next").fadeIn(300);
    }, function(){
        $(this).find(".prev, .next").hide();
    });

    // 火热拼团
    $('.ptnow .slideGroup').hover(function () {
        $(this).find('.sPrev').addClass('show');
        $(this).find('.sNext').addClass('show');
    },function () {
        $(this).find('.sPrev').removeClass('show');
        $(this).find('.sNext').removeClass('show');
    });
    //二维码

    $('.nbusiness_c .nc_item .code').hover(function(){
        $(this).next('.code-img').addClass('show');
    },function(){
        $(this).next('.code-img').removeClass('show');
    });

    // 限时抢购
    // $('.time-list li').click(function () {
    //     $(this).addClass('active');
    //     $(this).siblings().removeClass('active');
    // });



    var atpage = 1, isload = false, nextHour='',clearTime='';
    $(".two-center .title ul").delegate("li","click",function(){
        var t = $(this);
        if( !t.hasClass('active') ){
            nextHour = t.attr("data-time");
            getTime(nextHour,1);
            t.addClass('active');
            t.siblings().removeClass('active');
            // t.siblings('nowtimcurr').css('color','#a0a0a0');
        }
    });

    //点击 提醒与取消提醒不跳转页面
    $('#limitlist').delegate('li', 'click', function(e){
        var t = $(this), a = t.find('.btn'), url = a.attr('data-url'), id = a.attr('data-id');
        var target = $(e.target);

        if(target.closest(".remind").length == 1){
            e.preventDefault();
        }else{
            window.open(url, '_blank');
        }
    });

// 限时抢购
    function getTime(time,tr){
        if(tr){
            atpage = 1;
            $("#limitlist").html("");
        }
        isload = true;
        $.ajax({
            url: "/include/ajax.php?service=tuan&action=systemTime",
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data.state == 100){
                    var list = data.info.list, now = data.info.now, nowTime = data.info.nowTime, html = [], className='';
                    if(list.length > 0){
                        for(var i = 0; i < 3; i++){
                            //判断是否是当前时间
                            if(now == list[i].nowTime){
                                var nextHour = list[i].nextHour;
                                if(list[i].nextHour==time){
                                    className='active';
                                }else if((time=='' || time==undefined) && now == list[i].nowTime){
                                    className='active';
                                }else{
                                    className='';
                                }
                                html.push('<li class="'+className+'" data-hour="'+list[i].nowTime+'" data-time="'+list[i].nextHour+'">'+list[i].showTime+'<span>进行中</span></li>');
                            }else{
                                if(list[i].nextHour==time){
                                    className='active';
                                }else{
                                    className='';
                                }
                                html.push('<li class="'+className+'" data-hour="'+list[i].nowTime+'" data-time="'+list[i].nextHour+'">'+list[i].showTime+'<span>即将开始</span></li>');
                            }
                        }
                        $("#limit").html(html.join(""));
                        if(time!='' && time!=undefined){
                            nextHour = time;
                        }
                        var parm = [];
                        parm.push("page="+atpage);
                        $.ajax({
                            url: "/include/ajax.php?service=tuan&action=tlist&iscity=1&hourly=1&time="+nextHour+"&pageSize=3",//&hourly=1&time="+nextHour+"
                            type: "GET",
                            data: parm.join("&"),
                            dataType: "jsonp",
                            success: function (data) {
                                if(data && data.state == 100 && data.info.list.length > 0){
                                    var list = data.info.list, html = [];
                                    if(list.length > 0){
                                        for(var i = 0; i < list.length ; i++){
                                            html.push('<li class="fn-clear">');
                                            html.push('<a target="_blank" href="'+list[i].url+'">');
                                            html.push('<img src="'+list[i].litpic+'">');
                                            html.push('  <div class="info">');
                                            html.push('     <p class="name">'+list[i].title+'</p>');
                                            html.push('<p class="price"><i>'+echoCurrency('symbol')+'</i><span>'+list[i].price+'</span><s><i>'+ echoCurrency('symbol') +'</i>'+list[i].market+'</s></p>');
                                            var state = '';
                                            if(list[i].state==1){
                                                state = '<p><span data-url="'+list[i].url+'" class="btn_03 btn">已结束</span></p>';
                                            }else if(list[i].state==2){
                                                state = '<div data-url="'+list[i].url+'" class="btn_01 btn">已抢光</div>';
                                            }else if(list[i].state==3){
                                                state = '<div data-url="'+list[i].url+'" class="btn_01 btn">立即抢购</div>';
                                            }else if(list[i].state==4){
                                                state = '<div data-url="'+list[i].url+'" data-id="'+list[i].id+'" class="btn_04 btn remind">取消提醒</div>';
                                            }else if(list[i].state==5){
                                                state = '<div data-url="'+list[i].url+'" data-id="'+list[i].id+'" class="btn_02 btn remind">提醒我</div>';
                                            }
                                            html.push('     <div class="addr fn-clear"><span class="bb"></span>'+state+'</div>');
                                            html.push('   </div>');
                                            html.push('</a>')
                                            html.push('</li>');

                                        }
                                        $("#limitlist").append(html.join(""));
                                        isload = false;
                                        //最后一页
                                        if(atpage >= data.info.pageInfo.totalPage){
                                            isload = true;
                                            // $("#limitlist").append('<div class="loading">已经到最后一页了</div>');
                                        }

                                    }else{
                                        isload = true;
                                        $("#limitlist").append('<div class="loading">暂无相关信息</div>');
                                    }
                                }else{
                                    // $(".daojishi").fadeOut();
                                    $("#limitlist").html('<div class="loading">暂无相关信息</div>');
                                }
                            },
                            error: function(){
                                isload = false;
                                $("#limitlist").html('<div class="loading">网络错误，加载失败！</div>');
                            }
                        });
                    }
                }
            }
        });
    }
    //setInterval(getTime(),1000);
    getTime();

    //提醒与取消提醒
    $("#limitlist").delegate(".remind","click",function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            window.location.href = masterDomain+'/login.html';
            return false;
        }
        var id = $(this).data('id');
        var t  = $(this);
        $.ajax({
            url: "/include/ajax.php?service=tuan&action=remind",
            type: "GET",
            data: {id:id},
            dataType: "json",
            success: function (data) {
                if(data.state == 100){
                    if(data.info==1){
                        t.text('提醒我');
                        t.removeClass('btn_04');
                        t.addClass('btn_02');
                    }else if(data.info==2){
                        t.text('取消提醒');
                        t.removeClass('btn_02');
                        t.addClass('btn_04');
                    }
                }
            }
        });
    });


});
