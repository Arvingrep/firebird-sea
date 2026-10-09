$(function(){

    //点击查看完整电话
    $('.hotelbottom').delegate('.seePhone','click',function(){
        var h3 = $(this).closest('.hotelbottom').find('.tel');
        var realCall = h3.attr('data-call');
        h3.text(realCall);
        $(this).fadeOut(500);
        return false;
    })

    getList()
    function getList(){
        $.ajax({
            url: "/include/ajax.php?service=marry&action=storeList&orderby=1&page=1&pageSize=8",
            type: "GET",
            dataType: "json",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                        html.push('<li>');
                        html.push('<a href="'+list[i].url+'" target="_blank">');
                        var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                        html.push('<div class="r_left"><img src="'+pic+'" alt=""></div>');
                        html.push('<div class="rInfo">');
                        html.push('<h3 class="rTitle">'+list[i].title+'</h3>');
                        html.push('<p class="star">'+langData['marry'][6][12]+list[i].anli+' | '+langData['marry'][0][48]+list[i].taoxi+'</p>');

                        html.push('<p class="hPrice">'+echoCurrency('symbol')+list[i].pricee+'起</p>');
                        html.push('</div>');
                        html.push('</a>');
                        html.push('</li>');
                    }
                    
                    $(".list_r ul").html(html.join(""));
                   
                }else{
                    $(".list_r ul .listr_con").hide();
                }
            },
            error: function(){
                $(".list_r ul .listr_con").hide();
            }
        });
    }



})
