$(function(){



    // var navHeight = $('.navlist').offset().top;
    


    // //时间轴吸顶
    // $(window).scroll(function() {
    //     if ($(window).scrollTop() > navHeight) {
    //          $('.navlist').addClass('topfixed');
    //     } else {
    //          $('.navlist').removeClass('topfixed');
    //     }
    // });

    var isload = false, nowIdexTime = '',nowkTime = '';
    $.ajax({
        url: "/include/ajax.php?service=shop&action=getConfigtime&gettype=1",
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
            if(data.state == 100){
                var list = data.info, now = data.info.now, nowTime = data.info.nowTime, html = [], className='';
                //将开始时间按先后进行排序
                list.sort(function (a, b) { return a.ktimestr - b.ktimestr })
                if(list.length > 0){
                    for(var i = 0; i < list.length; i++){
                        nowIdexTime  = list[0].changci;
                        nowkTime  = list[0].ktime;
                        ktimestr  = list[0].ktimestr;
                        var textname = '';
                        if(list[i].now > list[i].etimestr){
                            textname = '不能错过'
                        }else if(list[i].now >= list[i].ktimestr && list[i].now <= list[i].etimestr){
                            textname = '抢购中';
                            if(list[i].hongdongCount > 0){

                                html.push('<li class="noChangci " data-huodongtime="'+list[i].ktimestr+'"><a href="javascript:;"><strong style="font-size:22px; line-height:30px;">热卖中</strong><span>不容错过</span></a></li>')
                            }
                        }else{
                            textname = '即将开始';
                        }
                        html.push('<li data-hour="'+list[i].ktime+'" data-time="'+list[i].changci+'"><a href="javascript:;"><strong>'+list[i].ktime+'</strong><span>'+textname+'</span></a></li>')

                    }
                    $(".qgTab ul").html(html.join(""));
                    $(".qgTab ul li:first-child").addClass('curr');
                    if(!$(".qgTab ul li:first-child").hasClass('noChangci')){
                       getList(nowIdexTime,nowkTime,1)
                    }else{
                        getList('','',1,ktimestr)
                    }
                    
                }
            }
        }
    }); 

    //tab 切换
    $('.qgTab ').delegate('li','click',function(){
      if(!$(this).hasClass('curr')){
        $(this).addClass('curr').siblings().removeClass('curr');
        var time= $(this).attr("data-time");
        var ktime= $(this).attr("data-hour");
        if($(this).hasClass('noChangci')){
            getList('','',1,$(this).attr('data-huodongtime'));
        }else{

            getList(time,ktime,1);
        }
        var end = $('.qgTab li.curr').offset().left - $('body').width() /2;
        var star = $(".tabDiv").scrollLeft();
        var ot = $('.qgTab li.curr').offset().left;
        var thisw = $('.qgTab li.curr').width(),tbody = $('html').width();
        if((ot + thisw) >= tbody || ot < 0){
          $('.tabDiv').scrollLeft(end + star);
        }
      }
    })
    function getList(time,ktime,tr,hdtime){
        isload = true;
        if(tr){
          atpage = 1;
          $(".qgList ul").html("");
        }
        $(".qgList .loading").remove();
        $(".qgList").append('<div class="loading"><i></i>加载更多活动…</div>');
        // if(time!='' && time!=undefined){
        //     nextHour = time;
        // }

         var param = ''
        if(time!='' && time!=undefined){
            nextHour = time;
           param = "&changci="+nextHour;
        }else if(hdtime){
           param = "&huodongtime="+hdtime;
        }
        
        $('.emptyData').hide();
        $.ajax({
            url: "/include/ajax.php?service=shop&action=proHuodongList&huodongtype=1"+param+"&pageSize=5&page="+atpage,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100 && data.info.list.length > 0){
                    var list = data.info.list, ggoodboxhtml = [], likeboxhtml = [], html = [];
                    if(list.length > 0){
                        for(var i = 0; i < list.length; i++){
                            html.push('<li><a href="'+list[i].url+'">');
                            html.push('    <div class="leftImg">');
                            if(list[i].huodongtimestate==1){
                            html.push('        <div class="hotTag"><i></i>热抢</div>');
                            }
                            html.push('        <img src="'+list[i].litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';">');
                            html.push('    </div>');
                            html.push('    <div class="rInfo">');
                            html.push('        <h3 class="goodTitle">'+list[i].title+'</h3>');
                            html.push('        <div class="priceW">');
                            html.push('            <p class="mprice">日常价<s>'+echoCurrency('symbol')+parseFloat(list[i].mprice)+'</s></p>');
                            var chaPrice = parseInt(list[i].mprice-list[i].huodongprice);
                            html.push('            <div class="downPrice"><span>直降</span><em>'+chaPrice+'</em></div>');
                            html.push('        </div>');
                            html.push('        <div class="fn-clear goodBot">');
                            html.push('            <div class="">');
                            html.push('               <span class="xstxt">限时价</span>');
                            html.push('                <p class="nprice">');
                            var hdprice = (list[i].huodongprice>1000)?parseInt(list[i].huodongprice):(list[i].huodongprice);
                            html.push('                    <span class="pr">'+echoCurrency('symbol')+'<strong>'+hdprice+'</strong></span>');
                            if(list[i].huodonginventory == 0){
                               html.push('        <span class="jins">已抢完</span>');
                            }else{
                              html.push('                    <span class="jins">仅剩<em>'+list[i].huodonginventory+'</em>件</span>');
                            }
                            
                            html.push('                </p>');
                            html.push('            </div>');
                            if(list[i].huodonginventory == 0){
                                html.push('            <span class="qg fn-right disabled">已抢完</span>');
                            }else{
                                html.push('            <span class="qg fn-right">抢购</span>');
                            }
                            
                            html.push('        </div>');
                            html.push('    </div>');
                            html.push('</a></li>');
                            

                        }
                        $(".qgList .loading").remove();
                        $(".qgList ul").append(html.join(""));

                        isload = false;
                        //最后一页
                        if(atpage >= data.info.pageInfo.totalPage){
                            isload = true;
                            $(".qgList").append('<div class="loading">没有更多了~</div>');
                        }
                    }else{
                        isload = true;
                        $('.emptyData').show();
                        //$(".qgList").append('<div class="loading">暂无相关信息</div>');
                    }
                }else{
                    isload = true;
                    $('.emptyData').show();
                   // $(".qgList").append('<div class="loading">暂无相关信息</div>');
                }
            },
            error: function(){
                isload = false;
                $(".qgList .loading").remove();
                $('.qgList').append('<div class="loading">'+langData['siteConfig'][20][227]+'</div>');
            }
        });
    }

    $(window).scroll(function() {

        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w;
        if ($(window).scrollTop() + 50 > scroll && !isload) {
            atpage++;
            getList();
        };
    });


})
