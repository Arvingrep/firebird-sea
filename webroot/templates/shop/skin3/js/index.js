$(function () {
    let userid=$.cookie('HN_userid');
    if (userid) { //已登录
        // 获取用户信息（头部已经请求过，为了避免浪费请求资源，此处用定时器）
        let userTimes = 0; //循环次数
        let userTimer = setInterval(res => {
            ++userTimes;
            if (userDetail) { //用户信息
                let str1=`
                    <h5>${userDetail.level > 0?'<img src='+templets_skin+'images/level.png alt="">':''}Hi~${userDetail.nickname}</h5>
                    <p>
                    <a href="${masterDomain}/logout.html" class="tchu">退出登录</a>
                    </p>
                `;
                $('.userTit').html(str1);
                // 按钮
                $('.seeOrder,.seeSelf').css({'display':'inline-block'});
                $('.openstore,.mastore').hide();
                // 头像
                let str2=`
                <img src="${userDetail.photo}" alt="" onerror="javascript:this.src='${staticPath}images/noPhoto_100.jpg';this.onerror=this.src='${staticPath}images/noPhoto_100.jpg';">
                `;
                $('.userImg').html(str2);
                clearInterval(userTimer);
            } else if (userTimes > 10) { //5秒请求超时
                clearInterval(userTimer);
            }
        }, 500);
    }
    let newsPage=$('.newsList .newp').length;
    // 公告显示处理
    if ($('.newp.announce .text')[0]) { //有公告数据
        $('.newp.announce').css({'display':'flex'});
        if(newsPage>3){
            newsPage=3;
        }
    }else if(newsPage>4){
        newsPage=4;
    }
    $(".txtMarquee-top").slide({ mainCell: ".bd .newsList", autoPlay: true, effect: "topMarquee", vis: newsPage, interTime: 50, trigger: "click" });
    $('.txtMarquee-top .bd').css({'height':'auto','overflow':'visible'})
    //顶部图片轮播
    $(".adbox .slideBox").slide({mainCell:".bd ul",effect:"left",autoPlay:true, autoPage:'<li></li>', titCell: '.hd ul'});

    $("#adbox").hover(function(){
        $(this).find(".prev, .next").fadeIn(300);
    }, function(){
        $(this).find(".prev, .next").hide();
    });

    //右侧小轮播图
    $(".secskill .slideBox").slide({mainCell:".bd ul",effect:"left",autoPlay:true, autoPage:'<li></li>', titCell: '.hd ul'});



	//兼容性问题
    if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.recommoend .slideBox .bd ul li a .img_small .s_item:nth-child(3n)').css('margin-right','0');
        $('.recommoend .slideBox .bd ul li a:nth-child(3n)').css('margin-right','0');
    }

    $('.goodWrap .goodList:eq(0)').addClass('goodShow');

    var isqgload = false;
    // counttime();
    //倒计时一次请求
    function counttime(){
        $.ajax({
            url: "/include/ajax.php?service=shop&action=getConfigtime&gettype=1",
            type: "GET",
            dataType: "jsonp",
            success:function (data) {
                var list = data.info,nowTime = data.info.nowTime,now = data.info.now;
                var stflag = false;
                for(var i = 0; i < list.length; i++){

                    if(list[i].now >= list[i].ktimestr && list[i].now <= list[i].etimestr){
                        // console.log(444)
                        stflag = true;
                        var nextHour = list[i].changci;
                        var nowTime = list[i].now;
                        var intDiff = list[i].etimestr - nowTime;
                        $('.qianggou .changci .active').html(list[i].ktime+'场').attr('data-changci',nextHour);;
                        if(list[i+1] && list[i+1].ktime){
                            $('.qianggou .changci .nextc').html(list[i+1].ktime+'场').attr('data-changci',list[i+1].changci);;
                        }else{
                            $('.qianggou .changci .nextc').hide();
                            $('.qianggou .changci .active').addClass('br')
                        }
                        qianggou(nextHour);

                    }
                    //当前时间没有场次 调取下一场
                    if(i == list.length-1 && stflag == false){
                        var nextHour = list[0].changci;
                        var nowTime = list[0].now;
                        var intDiff = list[0].etimestr - nowTime;
                        $('.hdsection .hdTop .dec').html('距离下场');
                        $('.qianggou .changci .nextc').html(list[0].ktime+'场').attr('data-changci',(list[1] ? list[1].changci : ''));
                        $('.qianggou .changci .nextc').addClass('br')
                        $('.qianggou .changci .active').hide();
                        qianggou(nextHour);
                    }
                    


                    window.setInterval(function(){
                        i = i < 0 ? 9 : i;
                        // $(obj).find(".ms").text(i);
                        $('.daojishi').find(".hm").text("0" + i );
                        i--;
                    }, 100);

                    function timer(intDiff){
                        window.setInterval(function(){
                            var hour=0,
                                minute=0,
                                second=0;//时间默认值
                            if(intDiff > 0){
                                var hour = Math.floor((intDiff / 3600) % 24);
                                var minute = Math.floor((intDiff / 60) % 60);
                                var second = Math.floor(intDiff % 60);
                            }

                            if(hour > 0){
                                $('.daojishi') .find(".h").text(hour < 10 ? "0" + hour : hour);
                            }else{
                                $('.daojishi') .find(".h").hide();
                            }

                            $('.daojishi').find(".m").text(minute < 10 ? "0" + minute : minute);
                            $('.daojishi').find(".s").text(second < 10 ? "0" + second : second);
                            intDiff--;
                        }, 1000);
                    }
                    timer(intDiff);
                }
            }
        });
    }



    function qianggou(nextHour){
        // var ibox = $('.boxCon').find('.ibox');
        // var len = ibox.length;
        // if(isqgload) return false;
        $("#qgou li").remove()
        $.ajax({
            url: "/include/ajax.php?service=shop&action=proHuodongList&huodongstate=1&huodongtype=1&changci="+nextHour+"&pageSize=3",
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                $("#qgou").html('');
                if(data.state == 100){
                    var list = data.info.list,html = [];
                    for(var i = 0; i < list.length; i++){
                        html.push(' <li><a href="'+list[i].url+'">');
                        html.push('  <div class="topImg"><img src="'+list[i].litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';">');
                        html.push('</div>');
                        html.push('<p class="name">'+list[i].title+'</p>');
                        html.push('<p class="price"><span><i>'+echoCurrency("symbol")+'</i><strong>'+list[i].huodongprice+'</strong></span><s>'+echoCurrency('symbol')+list[i].mprice+'</s></p>');
                        var qper = parseInt((list[i].huodongsales/list[i].huodonginventory)*100);
                        html.push('<p class="qgSale"><i><label style="width:'+qper+'%"></label></i><span>已抢'+qper+'%</span></p>');
                        html.push('</a></li>');
                    }
                    $("#qgou").append(html.join(""));
                }else{
                    $("#qgou .loading").remove()
                    $('.djs').addClass('opacity');
                    if($("#qgou li").length ==0){
                     $("#qgou").append('<div class="loading">暂无抢购活动</div>');
                    }
                }
            }
        });

    }

    // //热门团购
    // hotpinList();
    // function hotpinList(){
        
    //     $.ajax({
    //         url: "/include/ajax.php?service=shop&action=slist&hottuan=1&page=1&pageSize=3",
    //         type: "GET",
    //         dataType: "jsonp",
    //         success: function (data) {
    //             $("#htuan .loading").remove()
    //             if(data.state == 100){
    //                 var list = data.info.list,html = [];
    //                 for(var i = 0; i < list.length; i++){
    //                     html.push(' <li><a href="'+list[i].url+'">');
    //                     html.push('  <div class="topImg"><img src="'+list[i].litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';">');
                
    //                     if(list[i].is_daodian == 1){
    //                       html.push('    <span class="daodian">到店</span>');
    //                     }
    //                     html.push('</div>');
    //                     html.push('<p class="name">'+list[i].title+'</p>');
    //                     html.push('<p class="htprice"><span class="price2">团购价<s></s></span><span class="price1"><i>'+echoCurrency("symbol")+'</i><strong>'+list[i].mprice+'</strong></span></p>');
    //                     html.push('<p class="htSale">月销'+list[i].sales+'件</p>');
    //                     html.push('</a></li>');
    //                 }
    //                 $("#htuan").append(html.join(""));
    //             }else{
    //                 $("#htuan .loading").remove()
    //                 if($("#htuan li").length ==0){
    //                  $("#htuan").append('<div class="loading">暂无团购商品</div>');
    //                 }
    //             }
    //         }
    //     });

    // }
    //本地团购 精选商品切换
    $('.tab_ul li').click(function(){
        var tind =$(this).index();
        $(this).addClass('curr').siblings().removeClass('curr');
        $('.goodWrap .goodList').eq(tind).addClass('goodShow').siblings('.goodList').removeClass('goodShow');
    })

    //立即领取
    $('#quanList').delegate('a','click',function(e){
        var turl = $(this).attr('data-url');
        if(e.target == $(this).find('.getQuan')[0]){
            var t = $(this).find('.getQuan'); 
            if(t.hasClass('hasLin')){//领取过 跳转到商品去使用
                window.open(turl);
            }else{
                if(t.hasClass('noChose')) return false;
                t.addClass('noChose').text('领取中');
                var qid = t.attr('data-id');
                $.ajax({
                    url: "/include/ajax.php?service=shop&action=getQuan&qid="+qid,
                    type:'POST',
                    dataType: "json",
                    success:function (data) {
                        // alert(data.info)
                        if(data.state ==100){                   
                            t.removeClass('noChose').addClass('hasLin').text('立即使用');
                        }else{
                            if(data.state == 200){
                               t.addClass('hasLin').text('立即领取'); 
                            }else{
                                t.removeClass('noChose').addClass('hasLin').text('立即使用');
                            }
                        }
                        
                    },
                    error:function () {
                        t.removeClass('noChose').text('立即领取');
                    }
                });
            }
        }else{
            window.open(turl);
        }
        
        
        
    })


    // 限时抢购 准点秒杀 砍价狂欢 热门团购   拼团特惠  发现好货
    getHuodong()
    function getHuodong(){
        $.ajax({
            url: "/include/ajax.php?service=shop&action=huodongOpen&pagetype="+pagetype,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
              if(data.state == 100){
                  var list = data.info.list;
                  console.log(list)
                  // 限时抢购
                  if(Boolean(list['1']) && list['1'] != 'undefined'){
                    counttime();
                    $('.qianggou').removeClass('fn-hide')
                  }else{
                    $('.qianggou').addClass('fn-hide')
                  }
  
                  // 准点秒杀
                  if(Boolean(list['2'])  && list['2'] != 'undefined' && list['2'].length >= 3){ 
                    mshaList(list['2']);  
                  }else{
                     $(".secKill ").addClass('fn-hide');
                    //  $('.secKill').removeClass('fn-hide')
                  }
  
                  // 砍价狂欢
                  if(Boolean(list['3']) && list['3'] != 'undefined' && list['3'].length > 0){
                      kanjiaList(list['3'])
                  }else{
                      $('.bargain ').addClass('fn-hide')
                    //   $('.bargain').removeClass('fn-hide')
                  }
  
                //   // 热门团购
                  if(Boolean(list['4']) && list['4'] != 'undefined' && list['4'].length >= 3 && pagetype != '2'){
                    hotpinList(list['4'],1);
                    $(".hotTuan .hdTop .tit").text('热门团购')
                    $(".hotTuan .hdTop .decsp").text('网罗全城优惠')
                  }else if(Boolean(list['6'])  && list['6'] != 'undefined' && list['6'].length >= 3 && pagetype != '1'){
                    // $(".hotTuan .tuan_title").addClass('fn-hide')
                    // $(".hotTuan .shop_title").removeClass('fn-hide');
                    $(".hotTuan .hdTop .tit").text('发现好货')
                    $(".hotTuan .hdTop .decsp").text('抢品质好货')
                    hotpinList(list['6']);
                  }else{
                    $(".hotTuan").addClass('fn-hide')
                    // $('.hotTuan').removeClass('fn-hide')
                  }
  
                  // 拼团特惠
                  if(Boolean(list['5']) && list['5'] != 'undefined' && list['5'].length > 0){
                    pinList(list['5'])
                    $(".pintuan ").show()
                  }else{
                    $(".pintuan ").hide()
                  }
  
  
              }
            },
            error:function(){},
          })
    }

    // 切换抢购场次
    $(".changci span").click(function(){
        var t = $(this);
        if(!t.hasClass('active') && t.attr('data-changci') && t.attr('data-changci') != 'undefined'){
            t.addClass('active').siblings('span').removeClass('active')
            t.removeClass('nextc').siblings('span').addClass('nextc');
             qianggou(t.attr('data-changci'));
        }
        
    })

    // 特价秒杀
    function mshaList(list){
        var html = [];
        var len = list.length > 3 ? 3 : list.length;
        for(var i = 0; i < len; i++){
            html.push('<li><a target="_blank" href="'+list[i].url+'">');
            html.push('    <div class="topImg">');
            html.push('                <img src="'+huoniao.changeFileSize(list[i].litpic,308,308)+'" onerror="this.src=\'/static/images/good_default.png\'" />');
            if(list[i].daodiao){
                html.push('                <span class="daodian">到店</span>');
            }
            html.push('            </div>');
            html.push('            <p class="name">'+list[i].title+'</p>');
            html.push('            <p class="htprice"><span class="price1"><i>'+echoCurrency("symbol")+'</i><strong>'+list[i].huodongprice+'</strong></span></p>');
            html.push('            <p class="htSale">月销'+list[i].sales+'件</p>');
            html.push('            <span class="goQiang">抢购</span>');
            html.push('        </a></li>');
        }
        $("#msList").html(html.join(''))
    }
    // 砍价
    function kanjiaList(list){
        var html = [];
        var len = list.length > 3 ? 3 : list.length;
        for(var i = 0; i < len; i++){
        	var url = kanUrl.replace('%id%',list[i].id)
            html.push('<li><a target="_blank" href="'+url+'">');
            html.push('    <div class="topImg">');
            html.push('                <img src="'+huoniao.changeFileSize(list[i].litpic,308,308)+'" onerror="this.src=\'/static/images/good_default.png\'" />');
            if(list[i].daodiao){
                html.push('                <span class="daodian">到店</span>');
            }
            html.push('            </div>');
            html.push('            <p class="name">'+list[i].title+'</p>');
            if(list[i].sales > 0){
                html.push('            <p class="kanNum">'+list[i].sales+'人正在砍</p>');
            }else{
                html.push('            <p class="kanNum">热卖中</p>');
            }
            
            html.push('            <div class="kanPrice"><span class="price1"><i>'+echoCurrency("symbol")+'</i><strong>'+list[i].floorprice+'</strong><s></s></span><em>可砍至</em></div> ');
          
            html.push('        </a></li>');
        }
        $("#bargainList").html(html.join(''))
    }


    // 拼团
    function pinList(list){
        var html = [];
        var len = list.length > 3 ? 3 : list.length;
        for(var i = 0; i < len; i++){
            html.push('<li><a target="_blank" href="'+list[i].url+'">');
            html.push('    <div class="topImg">');
            html.push('                <img src="'+huoniao.changeFileSize(list[i].litpic,308,308)+'" onerror="this.src=\'/static/images/good_default.png\'" /><span class="pinNum">'+list[i].huodongnumber+'人团</span>    ');
            if(list[i].daodiao){
                html.push('                <span class="daodian">到店</span>');
            }
            html.push('            </div>');
            html.push('            <p class="name">'+list[i].title+'</p>');
            html.push('            <p class="htprice"><span class="price1"><i>'+echoCurrency("symbol")+'</i><strong>'+list[i].huodongprice+'</strong></span></p>');
            html.push('            <p class="htSale">月销'+list[i].sales+'件</p>');
          
            html.push('        </a></li>');
        }
        $("#pintuanList").html(html.join(''))
    }

    // 团购 or 好货
    function hotpinList(list,type){
        var html = [];
        var len = list.length > 3 ? 3 : list.length;
        for(var i = 0; i < len; i++){
           
                html.push(' <li><a href="'+list[i].url+'">');
                html.push('  <div class="topImg"><img src="'+huoniao.changeFileSize(list[i].litpic,308,308)+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';">');
        
                if(list[i].is_daodian == 1 && type){
                  html.push('    <span class="daodian">到店</span>');
                }
                html.push('</div>');
                html.push('<p class="name">'+list[i].title+'</p>');
                var str = type ? '<span class="price2">团购价<s></s></span>':''
                html.push('<p class="htprice">'+str+'<span class="price1"><i>'+echoCurrency("symbol")+'</i><strong>'+list[i].price+'</strong></span></p>');
                html.push('<p class="htSale">月销'+list[i].sales+'件</p>');
                html.push('</a></li>');
            
        }
        $("#htuan").html(html.join(""));
    }

    // 领券中心
    getQuan()
    function getQuan(){
        $.ajax({
            url: "/include/ajax.php?service=shop&action=quanList&pageSize=3&page=1",
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
              if(data.state == 100){
                  var list = data.info.list;
                  var html = [];
                  if(list.length > 0){
                      for(var i = 0; i< list.length; i++){
                        if(list[i].bear != '1'){

                            var errImg = list[i].shoptype == 1 ? '/static/images/good_default.png' : '/static/images/shop.png'
                            html.push('<li><a href="javascript:;" data-url="'+list[i].url+'">');
                            html.push('<div class="topImg">');
                            html.push('    <img src="'+huoniao.changeFileSize(list[i].logo,340,340)+'" alt="" onerror="this.src='+errImg+'">');
                            html.push('</div>');
                            html.push('<div class="quanInfo">');
                            var promotioText = '';
                            if(list[i].basic_price > 0){
    
                                if(list[i].promotiotype == 0){
                                    promotioText = '满' + parseFloat(list[i].basic_price) + '用' + parseFloat(list[i].promotio)
                                }else{
                                    promotioText = '满' + parseFloat(list[i].basic_price)  + parseFloat(list[i].promotio) + '折'
                                }
                            }else{
                                if(list[i].promotiotype == 0){
                                    promotioText = '无门槛用' + parseFloat(list[i].promotio)
                                }else{
                                    promotioText = '无门槛' + parseFloat(list[i].promotio) + '折'
                                }
                            }
                            html.push('    <h2>'+promotioText+'</h2>');
                            html.push('    <p class="busname">'+list[i].storename+'</p>');
                            var hasgetCls = list[i].is_lingqu == 1 ? 'hasLin' : '', hasgetText = list[i].is_lingqu == 1 ? '立即使用' : '立即领取'
                            html.push('    <span class="getQuan '+hasgetCls+'" data-id="'+list[i].id+'">'+hasgetText+'</span>');
                            html.push('</div>');
                            html.push('</a></li>');
                        }
                      }
                      if(html.length == 0){
                        $(".quan ").addClass('fn-hide')
                      }else{
                          $("#quanList ").html(html.join(''))
                          $(".quan").removeClass('fn-hide')
                      }
                  }
  
              }else{
                $(".quan ").addClass('fn-hide')
              }
            },
            error:function(){
                $(".quan ").addClass('fn-hide')
            },
          })
    }
});
