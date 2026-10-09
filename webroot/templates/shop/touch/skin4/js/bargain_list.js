$(function(){
    var len = $('.content1 ul li').length;
    if(len > 0){
        $('.content1').show();
        $('.content2').addClass('spe');
    }

    var isload = false,page=1,pageSize=10;

    //滚动加载
    $(window).scroll(function(){
        var allh = $('body').height();
        var w = $(window).height();
        var s_scroll = allh - w - 100;
        if ($(window).scrollTop() > s_scroll && !isload) {
            page++;
            getList();

        }
    })

    // 获取评论
    var combox = $('.content2 ul');
    getList();
    function getList(){
        isload = true;
        $('.loading').remove();
        combox.append('<div class="loading">加载中...</div>');
        var data = [];
        data.push('page='+page);
        data.push('pageSize='+pageSize);
        $.ajax({
            url: "/include/ajax.php?service=shop&action=bargainingList",//&pageSize=8
            data : data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    $('.loading').remove();
                    var list = data.info.list,pageinfo = data.info.pageInfo,page = pageinfo.page,html = [];

                    for(var i = 0; i < list.length; i++){
                        var detailUrl2 = detailUrl.replace("%id%", list[i].id);
                        html.push('<li class="fn-clear">');
                        html.push('<a href="'+detailUrl2+'">');
                                var litpic = list[i].litpic == "" ? staticPath+'images/noPhoto_40.jpg' : list[i].litpic;
                                html.push('<div class="goodImg"><img src="'+litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
                                html.push('<div class="goodInfo">');
                                html.push('<h4>'+list[i].title+'</h4>');
                        html.push('<p class="mPrice"><s>'+echoCurrency('symbol')+list[i].mprice+'</s></p>');
                        var priceAr = (list[i].floorprice).split('.');
                        html.push('<p class="nPrice"><em>'+echoCurrency('symbol')+'</em><span>'+priceAr[0]+'</span>.'+priceAr[1]+'<i></i></p>');
                        html.push('</div>');
                        var txt = '立即砍价',txtstyle ='    ';
                        if(list[i].huodonginventory ==0 ){

                            txt         = '已砍完';
                            txtstyle    = 'disabled'
                        }
                        html.push('<span class="kanSpan '+txtstyle+'">'+txt+'</span>');
                        html.push('</a>');
                        html.push('</li>');
                    }

                    combox.append(html.join(""));

                    isload = false;
                    //最后一页
                    if(page >= data.info.pageInfo.totalPage){
                        isload = true;                      
                        combox.append('<div class="loading">已加载全部</div>');
                    }

                }else {

                    $('.content2 ul .loading').html(data.info);
                }
            },
            error: function(){
                isload = false;
                $('.content2 ul .loading').html(langData['siteConfig'][20][227]);
            }
        })
    }


})
