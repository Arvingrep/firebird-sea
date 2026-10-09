$(function () {
    var servepage = 1;
    var isload = false;
    // 获取汽车数据
    getNewsList(1);
    function  getNewsList(tr){
        if(tr){
			servepage = 1;
            $('.list ul').html('');
        }
        var id = $('.nav-box ul li.active').attr("data-id");
        var url ="/include/ajax.php?service=car&action=news&page="+ servepage +"&pageSize=10" + "&typeid=" + id;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
                var datalist = data.info.list, html = [];
                if(data.state == 100){
                    totalpage = data.info.pageInfo.totalPage;
                    for(var i=0;i<datalist.length;i++){
                        html.push('<li><a href="'+datalist[i].url+'">');
                        if(datalist[i].litpic){
                            html.push('<div class="img-box"><img src="'+datalist[i].litpic+'" alt=""><span>'+datalist[i].imgGroupNum+langData['car'][6][80]+'</span></div>');//图
                        }
                        html.push('<div class="info"><h4>'+datalist[i].title+'</h4><p><em>'+datalist[i].source+'</em> <em>'+datalist[i].click+langData['car'][6][81]+' · '+datalist[i].floortime+'</em></p></div>');
                        html.push('</a></li>');
                    }
                    $('.list ul').append(html.join(''));
                    isload = false;
                    if(servepage == totalpage){
                        isload = true;
                        $('.loading span').text(langData['car'][6][69]);
                    }
                }else {
                    isload = true;
                    $('.loading span').text(langData['siteConfig'][20][126]);
                }
            },
            error: function(){
                $('.loading span').text(langData['car'][6][65]);
            }
        })
    }

    $(window).scroll(function() {
        var sh = $('.list .loading').height();
        var allh = $('body').height();
        var w = $(window).height();

        var s_scroll = allh - sh - w;

        //服务列表
        if ($(window).scrollTop() > s_scroll && !isload) {
            servepage++;
            isload = true;
            if(servepage <= totalpage){
                getNewsList();
            }

        };

    });
    
    $('.nav-box ul li').click(function () {
        $(window).scrollTop(0);
        var id = $(this).attr('data-id');
        $(this).addClass('active').siblings().removeClass('active');
        getNewsList(1);
    });

    // 回到顶部
    $(window).scroll(function(){
        var this_scrollTop = $(this).scrollTop();
        if(this_scrollTop>200 ){
            $(".top").show();
        }else {
            $(".top").hide();
        }
    });

});