$(function(){
     //导航内容切换
    $('.searchTop li').off('click').click(function(){
        $(this).addClass('curr').siblings('li').removeClass('curr');
        var i = $(this).index();
        $('.container .comCon').eq(i).addClass('show').siblings().removeClass('show');
        getList();
    });

    //去看看
    $('.followList').delegate('.seeAnchor','click',function(){
        $('.followList').removeClass('show');
        $('.goodselect').addClass('show');
        $('.searchTop li').eq(1).addClass('curr').siblings('li').removeClass('curr');
    })

    var isload = false,page=1,pageSize=10;

    //滚动加载
    $(window).scroll(function(){
        var allh = $('body').height();
        var w = $(window).height();
        var s_scroll = allh - w - 100;
        if ($(window).scrollTop() > s_scroll && !isload) {
            var page = parseInt($('.searchTop .curr').attr('data-page')),
                totalPage = parseInt($('.searchTop .curr').attr('data-totalPage'));
            if (page < totalPage) {
                ++page;
                isload = true;
                $('.searchTop .curr').attr('data-page', page);
                getList();
            }

        }
    })


    // 获取评论
    var objId = $('.followList ul');
    var objId2 = $('.seList');
    getList();
    function getList(){
        isload = true;
        var active = $('.searchTop .curr'), action = active.attr('data-type'), url;
        var page = active.attr('data-page');
        
        if (action == 1) { //关注  
            $('.followList').find('.loading').remove();
            $('.followList').append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...           
            url =  "/include/ajax.php?service=tuan&action=tlist&iscity=1&pin=1&page="+page+"&pageSize=8";
          
        }else if(action == 2){//精选
            $('.goodselect').find('.loading').remove();
            $('.goodselect').append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
            url =  "/include/ajax.php?service=tuan&action=tlist&iscity=1&pin=1&page="+page+"&pageSize=8";
        }
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            async:false,
            success: function (data) {
                if(data && data.state == 100){
                    var list = data.info.list,pageinfo = data.info.pageInfo,html = [];
                    var totalpage = pageinfo.totalPage;
                    active.attr('data-totalPage', totalpage);
                    if(list.length>0){
                        for(var i = 0; i < list.length; i++){
                            var html2=[];//ajax嵌套时 放循环内清空 
                            if(action == 1){
                                html.push('<li class="fn-clear">');
                                html.push('<a href="">');
                                var litpic = list[i].litpic == "" ? staticPath+'images/noPhoto_40.jpg' : list[i].litpic;
                                html.push('<div class="top_img"><img src="'+litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">');
                                html.push('<div class="musicwrap">');
                                html.push('<dl class="music">');
                                html.push('<dd class="m1"></dd><dd class="m2"></dd><dd class="m3"></dd>');
                                html.push('</dl>');
                                html.push('<span>1954观看</span>');
                                html.push('</div>');
                                html.push('</div>');
                                html.push('<div class="followInfo">');
                                var storeLogo = list[i].litpic == "" ? staticPath+'images/noPhoto_40.jpg' : list[i].litpic;
                                html.push('<div class="storeLogo"><img src="'+storeLogo+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
                                html.push('<h2>美洲化妆品旗舰店</h2>');
                                html.push('<p>'+list[i].title+'</p>');
                                html.push('</div>');
                                html.push('</a>');
                                html.push('</li>'); 
                            }else{
                                html.push('<li>');
                                html.push('<a href="">');
                                var litpic = list[i].litpic == "" ? staticPath+'images/noPhoto_40.jpg' : list[i].litpic;
                                html.push('<div class="leftImg"><img src="'+litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">');
                                html.push('<div class="musicwrap">');
                                html.push('<dl class="music">');
                                html.push('<dd class="m1"></dd><dd class="m2"></dd><dd class="m3"></dd>');
                                html.push('</dl>');
                                html.push('<span>1954观看</span>');
                                html.push('</div>'); 
                                html.push('<div class="zan_btn"></div>'); 
                                html.push('</div>'); 
                                html.push('<div class="rInfo">'); 
                                html.push('<h2 class="userTit">'+list[i].title+'</h2>');
                                //发布者 如果是企业发布 先展示企业 
                                html.push('<div class="fUseInfo">'); 
                                var fbImg = list[i].litpic == "" ? staticPath+'images/noPhoto_40.jpg' : list[i].litpic;
                                html.push('<div class="fbImg"><img src="'+fbImg+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
                                html.push('<h3>'+list[i].title+'</h3>'); 
                                html.push('</div>'); 
                                html.push('<div class="goodItem fn-clear">'); 
                                $.ajax({
                                    url: "/include/ajax.php?service=tuan&action=tlist&iscity=1&pin=1&page=1&pageSize=2",
                                    type: "GET",
                                    dataType: "json",
                                    async:false,
                                    success: function (data) {
                                        if(data && data.state == 100){
                                            var list2 = data.info.list;
                                            for(var j = 0; j < list2.length; j++){
                                                html2.push('<dl>'); 
                                                var goodImg = list2[j].litpic == "" ? staticPath+'images/noPhoto_40.jpg' : list2[j].litpic;
                                                html2.push('<dt><img src="'+goodImg+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></dt>'); 
                                                var priceAr = '148.00'.split('.');
                                                if(j == 0){
                                                    html2.push('<dd class="nPrice"><em>'+echoCurrency('symbol')+'</em><strong>'+priceAr[0]+'</strong><em>.'+priceAr[1]+'</em></dd>');
                                                }else{
                                                    html2.push('<dd class="goodInfo">');
                                                    html2.push('<div class="goodNum">');
                                                    html2.push('<p>30</p>宝贝');
                                                    html2.push('</div>');
                                                    html2.push('</dd>');
                                                }
                                                
                                                html2.push('</dl>');
                                            }
                                             
                                        }
                                    }
                                })
                                 
                                html.push(html2.join('')); 
                                html.push('</div>'); 
                                html.push('</div>'); 
                                html.push('</a></li>'); 
                            }
                            
                        }

                        if (action == 1) {
                            $('.followList').find('.loading').remove();
                            if(page == 1){
                                objId.html(html.join(""));
                            }else{
                                objId.append(html.join(""));
                            }
                        }else{
                            $('.goodselect').find('.loading').remove();
                            if(page == 1){
                                objId2.html(html.join(""));
                            }else{
                                objId2.append(html.join(""));
                            }
                        }

                        //爱心飘动效果
                        Promise.all(assets).then(function(images) {

                            var random = {
                                uniform: function(min, max) {
                                    return min + (max - min) * Math.random();
                                },
                                uniformDiscrete: function(i, j) {
                                    return i + Math.floor((j - i + 1) * random.uniform(0, 1));
                                },
                            };
                            
                            
                            var allleftImg = document.getElementsByClassName('leftImg');
                            var bubbleArr = [];
                            for(var m = 0;m<allleftImg.length;m++ ){

                             var stage = new BubbleHearts();
                             var canvas = stage.canvas;
                             canvas.width = 100;
                             canvas.height = 130;
                             canvas.style['width'] = '1rem';
                             canvas.style['height'] = '1.3rem';
                             allleftImg[m].appendChild(canvas);

                             bubbleArr.push(stage);         
                            }
                            //随机飘动
                            setInterval(function(){
                             for(var n = 0;n<bubbleArr.length;n++ ){
                                     bubbleArr[n].bubble(images[random.uniformDiscrete(0, images.length - 1)]);
                                 }
                             },200)


                        });


                        isload = false;
                        if(page >= pageinfo.totalPage){
                            isload = true;
                            if (action == 1) {
                                $('.followList').append('<div class="loading">没有更多啦~</div>');
                                
                            }else{
                                $('.goodselect').append('<div class="loading">没有更多啦~</div>');
                            }
                        }
                    }else{
                        if(action == 1) {
                            $('.followList').find('.loading').addClass('empty');
                            $('.followList').find('.loading').html('<p>还没有关注的主播，快去关注一波吧</p><a href="javascript:;" class="seeAnchor">去看看</a>');//暂无相关信息！
                        }else{
                            $('.goodselect').find('.loading').html(langData['siteConfig'][20][126]);//暂无相关信息！
                        } 
                    }

                }else {
                    if(action == 1) {
                        $('.followList').find('.loading').html(data.info);
                    }else{
                        $('.goodselect').find('.loading').html(data.info);
                    }
                }
            },
            error: function(){
                isload = false;
                if (action == 1) {
                    $('.followList').find('.loading').html(langData['siteConfig'][20][227]);//网络错误，加载失败...
                }else{
                    $('.goodselect').find('.loading').html(langData['siteConfig'][20][227]);//网络错误，加载失败...
                }
            }
        })
    }


})
