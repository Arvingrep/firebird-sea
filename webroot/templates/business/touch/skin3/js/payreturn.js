$(function () {

    var lng = lat = 0;
    var vpage = 1,isload =false;
    HN_Location.init(function(data){
        if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
            
        }else{
            lng = data.lng;
            lat = data.lat;
        }

        //初始加载
        storerec();

        //滚动加载视频
        $(window).on("scroll", function() {
            var thisa = $(this);
            var st = thisa.scrollTop();
            var sct = $(window).scrollTop();
            var h=$(window).height();
            var th = st + h;
            var allH = sct + $(window).height();

            if (allH >= $(document).height() - 100 && !isload) {
                vpage++;
                storerec();
            }

        });

    })


    

    function storerec(){
        isload = true;
        $('.storerec .loading').remove();
        $(".storerec").append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        $.ajax({
            type: "GET",
            url: "/include/ajax.php",
            dataType: "json",
            data: 'service=business&action=blist&lng='+lng+'&lat='+lat+'&maidan=1&orderby=3&page='+vpage+'&pageSize=10',
            success: function (data) {
                if(data && data.state == 100){
                    $(".storerec .loading").remove();
                    var html = [],html2=[], list = data.info.list,pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++){

                        if(i%2 == 0){
                            var pic = list[i].pics ? list[i].pics[0] : list[i].logo;
                            html2.push('<li><a href="'+list[i].url+'">');
                            html2.push('<div class="img">');
                            html2.push('<i>'+list[i].distance+'</i>');
                            html2.push('<img src="'+pic+'" onerror="javascript:this.src=\''+staticPath+'images/bus_default.png\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">');
                            html2.push('</div>');
                            html2.push('<div class="info">');
                            html2.push('<h2>'+list[i].title+'</h2>');
                            html2.push('<p class="addr">'+list[i].address+'</p>');
                            if(list[i].maidan_youhui_open){
                                html2.push('<p class="sale"><span><s>惠</s><strong>'+((100-list[i].maidan_youhui_value)/10)+'折</strong></span>买单立减折扣</p>');
                            }
                            html2.push('</div>');
                            html2.push('</a></li>');

                        }else{
                            var pic = list[i].pics ? list[i].pics[0] : list[i].logo;
                            html.push('<li><a href="'+list[i].url+'">');
                            html.push('<div class="img">');
                            html.push('<i>'+list[i].distance+'</i>');
                            html.push('<img src="'+pic+'" onerror="javascript:this.src=\''+staticPath+'images/bus_default.png\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">');
                            html.push('</div>');
                            html.push('<div class="info">');
                            html.push('<h2>'+list[i].title+'</h2>');
                            html.push('<p class="addr">'+list[i].address+'</p>');
                            if(list[i].maidan_youhui_open){
                                html.push('<p class="sale"><span><s>惠</s><strong>'+((100-list[i].maidan_youhui_value)/10)+'折</strong></span>买单立减折扣</p>');
                            }
                            html.push('</div>');
                            html.push('</a></li>');
                        }

                    }
                    isload = false;
                    $('.storerec ul.box1').append(html.join(''));
                    $('.storerec ul.box2').append(html2.join(''));

                    if(vpage >= pageinfo.totalPage){
                        isload = true;
                        $(".storerec").append('<div class="loading">'+langData['siteConfig'][20][429]+'</div>');
                    }

                }else{
                    isload = false;
                    $('.storerec .loading').html(langData['siteConfig'][21][64]);//暂无数据！


                }
            },
            error: function(){
                isload = false;
                $('.storerec .loading').html(langData['siteConfig'][20][462]);//加载失败！
            }
        });
    }

});