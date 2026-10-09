$(function () {
    //tab切换
    $('.top_tab li').click(function(){
        $(this).addClass('curr').siblings('li').removeClass('curr');
        getList(1);
        if($(this).data('id') == '2'){//商家
            $('.mealWrap,.mealDl').hide();
            $('.mealWrap,.mealDl').find('a').removeClass('chosed');
        }else{//套餐
            $('.mealWrap,.mealDl').show();
        }

    })
    //综合排序
    $('.otherFilter .orderby').click(function(){
        $('.choose-more').animate({"right":'0'},200);
        $('.mask').addClass('spe').show();
        $('.choose-local').hide();
        $('.choose-tab li').removeClass('active');
    })
    // 确认
    $('.btn_confirm').click(function(){
        $('.mask').removeClass('spe').hide();
        $('.choose-more').animate({"right":'-100%'},200);       
        getList(1);
    });

    // 取消
    $('.btn_reset'). click(function() {
        $('.mask').removeClass('spe').hide();
        $('.choose-more').animate({"right":'-100%'},200);
    });
    //自定义价格
    $("#price_u").ionRangeSlider({
        skin: "big",
        type: "double",
        min: 0,
        max: 5000,
        from: 0,
        to: 5000,
        grid: true,
        step: 1000,
        from_fixed: false,  // fix position of FROM handle
        to_fixed: false     // fix position of TO handle
    });

    var slider = $("#price_u").data("ionRangeSlider");
    
    $("#price_u").on("change", function () {
        var $inp = $(this);
        var v = $inp.prop("value");     // input value in format FROM;TO
        var from = $inp.data("from");   // input data-from attribute
        var to = $inp.data("to");       // input data-to attribute

        if(to==1000){
           $('.price_text').html(''+echoCurrency('symbol')+from+'-'+langData['travel'][7][63]);
           $("#pricetemp").val(from + ',' + '1000');
        }else{
            $('.price_text').html(''+echoCurrency('symbol')+from+'-'+echoCurrency('symbol')+to);
            $("#pricetemp").val(from + ',' + to);
        }
        
        $('.zhPrice a').removeClass('chosed');
    });
    


    // 其他筛选
    $('#choose-more a').click(function(){
        var parType = $(this).closest('dd').attr('data-chose');
        if(parType == 'price'){
            slider.reset();
            $('.price_text').html('');  
        }
        if($(this).hasClass('chosed')){
            $(this).removeClass('chosed');
            $(this).siblings('a').removeClass('chosed');
        }else{
            $(this).addClass('chosed').siblings('a').removeClass('chosed');
            if(parType == 'price'){                
                var pr = $(this).attr('data-id')
                $("#pricetemp").val(pr); 
            }
        }

        

    });
    $('#choose-more dd').each(function(){
        var pard = $(this).closest('dl');
        var aLen = $(this).find('a').length;
        if(aLen > 6){
            pard.find('dt').append('<span>全部</span>');
            $(this).find('a:gt(5)').hide()
        }
    })
    //查看全部
    $('#choose-more dt').delegate('span','click',function(){
        var par = $(this).closest('dl');
        if($(this).hasClass('hasclick')){
            $(this).removeClass('hasclick');
            par.find('a:gt(5)').hide()
        }else{
            $(this).addClass('hasclick');
            par.find('a').show();
        }
        
        
    })

    $('.mask').click(function () {
        $('.mask').removeClass('spe').hide();
        $('.choose-more').animate({"right":'-100%'},200);
    });

    //商家跳转
    $('#list').delegate('.storeLi','click',function(e){
        var ahref = $(this).attr('data-url');
        
        if(e.target == $(this).find('.rCall')[0]){
            
        }else{
            window.location.href = ahref;
        }
    })
    var isload = false;

    getList();

    function  getList(tr){
        if(tr){
            page = 1;
           $(".container ul").html(''); 
        }
        var action = $('.top_tab li.curr').attr('data-id');
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("type="+typeid);
        if(action == 2){//商家
            data.push("filter="+typeid);      
        }
        
        $("#choose-more a.chosed").each(function(){
            var ttype = $(this).closest('dd').attr('data-chose');
            if(ttype != 'price'){
              data.push(ttype + "=" + $(this).attr("data-id"));  
            }
            
        });
        var ord = $('.zhOrder a.chosed').attr('data-id');
        if(ord != undefined)
        data.push("&orderby="+ord)
        if($("#pricetemp").val()!=''){
          data.push("&price="+$("#pricetemp").val())  
        }
        isload = true;
        if(page == 1){
            $(".loading").html('<span>'+langData['marry'][5][22]+'</span>');//加载中...
        }else{
            $(".loading").html('<span>'+langData['marry'][5][22]+'</span>');//加载中...
        }
        
        var url;
        if(action == "1"){
            if(typeid == 7){
                url = "/include/ajax.php?service=marry&action=marryhostList&"+data.join("&")
            }else if (typeid == 10){
                url = "/include/ajax.php?service=marry&action=marrycarList&"+data.join("&")
            }else{
                url = "/include/ajax.php?service=marry&action=planmealList&"+data.join("&")
            }
        }else{
            url = "/include/ajax.php?service=marry&action=storeList&"+data.join("&")
        }
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    if(list.length > 0){

                        for (var i = 0; i < list.length; i++) {
                            var pic = list[i].litpic != "" && list[i].litpic != undefined ? list[i].litpic : "/static/images/404.jpg";
                            if(action == '1'){
                                html.push('<li class="mealLi"><a href="'+list[i].url+'">')
                                html.push('<div class="topImg">')                                 
                                html.push('<img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">')
                                html.push('</div>')
                                html.push('<div class="mealInfo">')
                                html.push('<h2>'+list[i].title+'</h2>')
                                var len = list[i].addrname.length;
                                html.push('<p class="addr">'+ list[i].addrname[len-2]+'<em></em>'+ list[i].companyname+'</p>')
                                html.push('<div class="other">')
                                var tLen = list[i].tagAll.length <2 ?list[i].tagAll.length : 2;
                                for(var m=0;m<tLen;m++){                       
                                    html.push('<span class="'+list[i].tagAll[m].py+'">'+list[i].tagAll[m].jc+'</span>');
                                    
                                }                       
                                var sameTxt = '';
                                if(typeid == 7){//婚礼主持
                                    sameTxt = list[i].stylename;
                                }else if(typeid == 10){//租婚车
                                    sameTxt = list[i].carname;
                                }else if(typeid == 9){//婚礼策划
                                    sameTxt = list[i].stylename;
                                }else{
                                    sameTxt = list[i].stylename;
                                }
                                
                                html.push('<span class="same">'+sameTxt+'</span>')
                                html.push('<strong class="pri">'+echoCurrency('symbol')+list[i].price+'</strong>')
                                html.push('</div>')
                                html.push('</div>')
                                html.push('</a></li>')
                            }else{
                                html.push('<li class="storeLi" data-url="'+list[i].url+'">')
                                html.push('<div class="leftImg">')
                                var pic = list[i].litpic != "" && list[i].litpic != undefined ? list[i].litpic : "/static/images/404.jpg"; 
                                html.push('<img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">')
                                html.push('</div>') 
                                html.push('<div class="rightb">') 
                                html.push('<h2 class="sName">'+list[i].title+'</h2>') 
                                var newPrice = list[i].pricee.split('.');
                                if(newPrice[1]==0){
                                    newPrice = newPrice[0];
                                }else{
                                    newPrice = list[i].pricee;
                                }
                          
                                html.push('<p class="sPrice">'+echoCurrency('symbol')+newPrice+'<em>起</em></p>');
                                
                                html.push('<p class="sInfo">案例 '+list[i].plancaseCount+'<em>/</em>套系 '+list[i].planmealCount+'</p>')

                                html.push('<div class="fn-clear">')
                                var tLen = list[i].taocan.length <3 ?list[i].taocan.length : 3;
                                for(var t=0;t<tLen;t++){
                                    var picc = list[i].taocan[t].litpic != "" && list[i].taocan[t].litpic != undefined ? list[i].taocan[t].litpic : "/static/images/404.jpg";
                                html.push('<dl>')

                                html.push('<dt><img src="'+picc+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></dt>')
                                html.push('<dd>'+echoCurrency('symbol')+''+ list[i].taocan[t].price+'</dd>')
                                html.push('</dl>')
                                }

                                html.push('</div>')

                                html.push('<a href="tel:'+list[i].tel+'" class="rCall"></a>') 
                                html.push('</li>')
                            }
                            
                        }
                        if(page == 1){
                            $(".container ul").html(html.join(""));
                        }else{
                            $(".container ul").append(html.join(""));
                        }
                        isload = false;

                        if(page >= pageinfo.totalPage){
                            isload = true;
                            $(".loading").html('<span>'+langData['marry'][5][29]+'</span>');
                        }   
                    }else{
                        isload = false;
                        $(".loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }
                    
                }else{
                    if(page == 1){
                        $(".container ul").html("");
                    }
                    $(".loading").html('<span>'+data.info+'</span>');
                }
            },
            error: function(){
                isload = false;
                if(page == 1){
                    $(".container ul").html("");
                }
                //网络错误，加载失败
                $(".loading").html('<span>'+langData['marry'][5][23]+'</span>');
            }
        });

    }

    //滚动底部加载
    $(window).scroll(function() {
        var sh = $('.container .loading').height();
        var allh = $('body').height();
        var w = $(window).height();
        var s_scroll = allh - sh - w;
        if ($(window).scrollTop() > s_scroll && !isload) {
            page++;
            getList();
        };
    });



});