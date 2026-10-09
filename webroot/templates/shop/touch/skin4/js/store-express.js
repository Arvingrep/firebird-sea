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
    //搜索
    $('.searchForm form').submit(function(){
        isload = false;
        getList(1);
        return false;

    })
    //筛选
    $('.chooseTab li').click(function(){
        var t = $(this);
        var tindex = t.index();
        if(tindex == 3){//价格
            if(t.hasClass('up')){
                t.addClass('down').removeClass('up');
                t.attr('data-id',4);
            }else{
                t.addClass('up').removeClass('down');
                t.attr('data-id',3);
            }
            t.addClass('curr').siblings('li').removeClass('curr');
            getList(1);
        }else{
            if(!t.hasClass('curr')){
                t.addClass('curr').siblings('li').removeClass('curr');
                $('.chosePrice').removeClass().addClass('chosePrice');
                getList(1);
            }
        }


    })
    getList();
    //获取信息列表
    function getList(tr){
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
        data.push("store="+storeid);

        var keywords = $('.searchForm #keywords').val();
        if(keywords !=''){
            data.push("title="+keywords);
        }
        var orderby = $(".chooseTab li.curr").attr("data-id");
        if(orderby != ""){
            data.push("orderby="+orderby);
        }

        $(".proList").removeClass('fn-hide')
        $(".emptyData").hide();
        $.ajax({
            url: "/include/ajax.php?service=shop&action=slist&moduletype=4&"+data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){

                    var html = [], html2=[],list = data.info.list, pageinfo = data.info.pageInfo;
                    if(list.length > 0){
                        $(".loading").remove();
                        for (var i = 0; i < list.length; i++) {
                            var inventory = list[i].inventory != '0' ? '' : '<span class="noStock">已售罄</span>'; //是否售罄
                            if(i%2 == 0){
                                var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "middle") : "/static/images/404.jpg";
                                
                                html.push('<li class="pro_li tc_li">');
                                html.push('    <a href="'+list[i].url+'">');
                                html.push('        <div class="pimg"><img src="'+pic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'">' + inventory);
                                html.push('        </div>');
                                html.push('        <div class="pinfo">');
                                html.push('            <h3>'+list[i].title+'</h3>');
                                html.push('            <p class="mprice">'+echoCurrency('symbol')+'<span>'+list[i].mprice+'</span></p>');
                                html.push('            <div class="pricebox">');
                                var sPrice = list[i].price.split('.');
                                var qhtml='';
                                if(list[i].quanhave ==1){
                                    qhtml = '<span class="quan_icon">券</span>';
                                }
                                html.push('                <h4>'+echoCurrency('symbol')+'<b>'+sPrice[0]+'</b><span>.'+sPrice[1]+'</span>'+qhtml+'</h4>');

                                html.push('                <span class="hasSale">已售'+list[i].sales+'</span>');
                                html.push('            </div>');
                                html.push('        </div>');
                                html.push('    </a>');
                                html.push('</li>');

                            }else{
                                var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "middle") : "/static/images/404.jpg";
                                html2.push('<li class="pro_li tc_li">');
                                html2.push('    <a href="'+list[i].url+'">');
                                html2.push('        <div class="pimg"><img src="'+pic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'">'  + inventory);
                                html2.push('        </div>');
                                html2.push('        <div class="pinfo">');
                                html2.push('            <h3>'+list[i].title+'</h3>');
                                html2.push('            <p class="mprice">'+echoCurrency('symbol')+'<span>'+list[i].mprice+'</span></p>');
                                html2.push('            <div class="pricebox">');
                                var sPrice = list[i].price.split('.');
                                var qhtml='';
                                if(list[i].quanhave ==1){
                                    qhtml = '<span class="quan_icon">券</span>';
                                }
                                html2.push('                <h4>'+echoCurrency('symbol')+'<b>'+sPrice[0]+'</b><span>.'+sPrice[1]+'</span>'+qhtml+'</h4>');

                                html2.push('                <span class="hasSale">已售'+list[i].sales+'</span>');
                                html2.push('            </div>');
                                html2.push('        </div>');
                                html2.push('    </a>');
                                html2.push('</li>');
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
                        $(".proList").addClass('fn-hide')
                        $(".emptyData").show();
                        $(".proList .loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }


                }else{
                    $(".proList").addClass('fn-hide');
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
