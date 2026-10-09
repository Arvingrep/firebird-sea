$(function(){
    var page = 1,pageSize = 5;
    getList();
    function getList(tr){
        console.log(page)
        //if(isload) return false;
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("typeid=1");     
        $.ajax({
            url: "/include/ajax.php?service=travel&action=ticketList&rec=1&orderby=1&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                console.log(data)
                isload = false;
                if(data && data.state == 100){
 
                    var html = [],html_box = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    var total = data.info.pageInfo.totalCount;
                    if(total > pageSize){
                        $('.like_wrap .change').css('display','block');
                    }
                    for (var i = 0; i < list.length; i++) {
                        var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                        var videoshow = list[i].video != "" && list[i].video != undefined ? "videoshow" : '';
                        var labshow = list[i].flagname != "" && list[i].flagname != undefined ? '<label class="labshow">'+list[i].flagname+'</label>' : '';

                        html.push('<li>');
                        html.push('<a href="'+list[i].url+'" target="_blank">');                      
                        html.push('<div class="recimgshow '+videoshow+'">');                      
                        html.push(labshow);                      
                        html.push('<img src="'+pic+'" alt="">');
                        html.push('</div>');
                        html.push('<div class="rectextshow">');
                        html.push('<h2>'+list[i].title+'</h2> ');
                        html.push('<div class="fn-clear">');
                        html.push('<p class="price"><span>'+echoCurrency('symbol')+'<em>'+list[i].price+'</em></span>'+langData['travel'][12][51]+'</p>');
                        html.push(' <p class="attr_posi">'+list[i].addrname[0]+' '+list[i].addrname[1]+'</p>');
                        html.push('</div>');
                        html.push('</div>');
                        html.push('</a>');
                        html.push('</li>');
                    }

                    $(".like_wrap ul").html(html.join(""));


                    if(page >= pageinfo.totalPage){
                        page = 0;//循环加载 加载结束时 加载第一页
                    }

                }else{
                    $(".like_wrap ul").html('<div class="loading">'+data.info+'</div>');
                }
            },
            error: function(){
                $(".like_wrap ul .loading").html(langData['siteConfig'][6][203]);//网络错误，请重试！
            }
        });

    }
    //换一批
    $('.like_wrap').delegate('.change','click',function(){      
        page++;
        getList()
    })

    //控制热门目的地的字数
    $('.spe-num').each(function(index, el) {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        if(len > num){
            $(this).html(text.substring(0,num));
        }
    });
    //点击热门目的地
    $('.gl_con').delegate('li','click',function(){
        var txt = $(this).find('a').data('dest');
        location.href = channelDomain+'/grouptravel.html?keywords='+txt
    });



})