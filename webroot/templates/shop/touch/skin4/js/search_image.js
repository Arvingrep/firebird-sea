//速递到家 2021-8-24
$(function(){

    // 下拉加载
    var isload  = false;
    var page = 1,pageSize = 10;
    $(window).scroll(function() {
        var h = 60;
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - h - w;
        if ($(window).scrollTop() > scroll && !isload) {
            page++;
            getList();
        };
    });
    //分类选择
    $('.bgfenlei a').click(function(){
        var t = $(this);
        if(!t.hasClass('curr')){
            t.addClass('curr').siblings('a').removeClass('curr');
            isload = false;
            getList(1);
        }

    })
    //筛选
    $('.other a').click(function(){
        var t = $(this);
        var tindex = t.index();
        if(tindex == 2){//价格
            if(t.hasClass('up')){
                t.addClass('down').removeClass('up');
                t.attr('data-id',4);
            }else{
                t.addClass('up').removeClass('down');
                t.attr('data-id',3);
            }
            t.addClass('curr').siblings('a').removeClass('curr');
            isload = false;
            getList(1);
        }else{
            if(!t.hasClass('curr')){
                t.addClass('curr').siblings('a').removeClass('curr');
                $('.chosePrice').removeClass().addClass('chosePrice');
                isload = false;
                getList(1);
            }
        }


    })
    getList();
    //获取信息列表
    function getList(tr){
        if(isload) return false;
        isload = true;
        if(tr){
            page=1;
            $('.proList ul').html('')
        }
        $(".loading").remove();
        $('.proList').append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);

        var fenlei = $(".bgfenlei a.curr").attr("data-id");
        data.push("typeid="+fenlei);

        var orderby = $(".other a.curr").attr("data-id");
        data.push("orderby="+orderby);

        if(sercImg){
            data.push('image='+sercImg);
        }
        $(".dataBox ").removeClass('fn-hide')
        $(".emptyData").hide()
        $.ajax({
            url: "/include/ajax.php?service=shop&action=slist&"+data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){

                    var html = [], html2=[],list = data.info.list, pageinfo = data.info.pageInfo;
                    if(list.length > 0){
                        $(".loading").remove();
                        for (var i = 0; i < list.length; i++) {
                            lr = list[i];
                            var pic = lr.litpic == false || lr.litpic == '' ? '/static/images/404.jpg' : lr.litpic;
                            var detailurl = detailUrl.replace('%id%',list[i].id)
														console.log(lr.typesalesarr.indexOf('2') || lr.typesalesarr.indexOf('3')  || lr.typesalesarr.indexOf('4') )
                            if(i%2 == 0){
                              html.push('<li class="comLi"><a href="'+detailurl+'">');
                              html.push('  <div class="goodImg"><img src="'+pic+'" alt=""></div>');
                              html.push('  <div class="goodInfo">');

                              html.push('    <h2 class="goodTitle">'+lr.title+'</h2>');
                              html.push('    <div class="choicePrice">');

                                var priArr = lr.price.split('.');
                                html.push('      <span class="newPrice">'+echoCurrency('symbol')+'<strong>'+priArr[0]+'</strong><em>.'+priArr[1]+'</em></span>');

                                if(lr.sales > 0){
                                    html.push('      <span class="hasSale">'+lr.sales+'件已售</span>');
                                }
                                


                              html.push('   </div>');

                              html.push('    <div class="choiceSale">');

                                if(lr.huodongarr==1){//准点抢购特有
                                    html.push('<span class="xianshi">限时抢</span>');
                                }if(lr.huodongarr==4){//拼团
                                    html.push('<span class="ptuan">拼团</span>');
                                }
                                if(lr.quanhave >1){
                                  html.push('<span class="quanspan comspan">券</span>');
                                }
                                if (lr.typesalesarr.indexOf('2') > -1|| lr.typesalesarr.indexOf('3') > -1 || lr.typesalesarr.indexOf('4') > -1) {
                                    html.push('<span class="tcs comspan">同城送</span>');
                                }
                                // html.push('<span class="by comspan">包邮</span>');
                                // html.push('<span class="by comspan">优惠券</span>');
                              html.push('      ');
                              html.push('    </div>');
                              html.push('  </div>');
                              html.push('</a>');
                              html.push('    <a class="choiceStore" href="'+lr.storeurl+'">');
                              html.push('  <span>'+lr.storeTitle+'</span><em>进店<s></s></em>');
                              html.push('</a></li>');

                            }else{
                              html2.push('<li class="comLi"><a href="'+detailurl+'">');
                              html2.push('  <div class="goodImg"><img src="'+pic+'" alt=""></div>');
                              html2.push('  <div class="goodInfo">');

                              html2.push('    <h2 class="goodTitle">'+lr.title+'</h2>');
                              html2.push('    <div class="choicePrice">');

                                var priArr = lr.price.split('.');
                                html2.push('      <span class="newPrice">'+echoCurrency('symbol')+'<strong>'+priArr[0]+'</strong><em>.'+priArr[1]+'</em></span><span class="hasSale">'+lr.sales+'件已售</span>');


                              html2.push('   </div>');

                              html2.push('    <div class="choiceSale">');

                                if(lr.huodongarr==1){//准点抢购特有
                                    html2.push('<span class="xianshi">限时抢</span>');
                                }if(lr.huodongarr==4){//拼团
                                    html2.push('<span class="ptuan">拼团</span>');
                                }
                                if(lr.quanhave >1){
                                  html2.push('<span class="quanspan comspan">券</span>');
                                }
                                if (lr.typesalesarr.indexOf('2') > -1 || lr.typesalesarr.indexOf('3') > -1 || lr.typesalesarr.indexOf('4') > -1) {
                                    html2.push('<span class="tcs comspan">同城送</span>');
                                }

                                // html2.push('<span class="by comspan">包邮</span>');
                                // html2.push('<span class="by comspan">优惠券</span>');
                              html2.push('      ');
                              html2.push('    </div>');
                              html2.push('  </div>');
                              html2.push('</a>');
                              html2.push('    <a class="choiceStore" href="'+lr.storeurl+'">');
                              html2.push('  <span>'+lr.storeTitle+'</span><em>进店<s></s></em>');
                              html2.push('</a></li>');
                            }

                        }

                        $(".proList .box1").append(html.join(""));
                        $(".proList .box2").append(html2.join(""));

                        isload = false;

                        if(page >= pageinfo.totalPage){
                            isload = true;

                            $(".proList").append('<div class="loading">没有更多了~</div>');//到底了...

                        }
                    }else{
                        $(".proList .loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                        $(".dataBox ").addClass('fn-hide')
                        $(".emptyData").show()
                    }


                }else{
                    $(".dataBox ").addClass('fn-hide')
                    $(".emptyData").show()
                    $(".proList .loading").html(data.info);
                }
            },
            error: function(){
                isload = false;
                $(".proList .loading").html(langData['siteConfig'][6][203]);//网络错误，请重试！
            }
        });

    }
})
