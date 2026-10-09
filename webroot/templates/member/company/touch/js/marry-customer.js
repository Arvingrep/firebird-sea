$(function () {
    var marryTime = {
        //转换PHP时间戳
        transTimes: function(timestamp, n){
            
            const dateFormatter = huoniao.dateFormatter(timestamp);
            const year = dateFormatter.year;
            const month = dateFormatter.month;
            const day = dateFormatter.day;
            const hour = dateFormatter.hour;
            const minute = dateFormatter.minute;
            const second = dateFormatter.second;
            
            if(n == 1){
                return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
            }else if(n == 2){
                return (year+'-'+month+'-'+day);
            }else if(n == 3){
                return (month+'/'+day);
            }else if(n == 4){
                return (hour+':'+minute);
            }else{
                return 0;
            }
        }
    };

    var atpage = 1, pageSize = 10, isload = false;
    //切换
    $('.tab-box a').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.list .con').eq(i).addClass('con_show').siblings().removeClass('con_show');
        getList();
    });

    var page = 1;
    var loadMoreLock = false;
    var objId = $('.con_store .cont_ul');
    var objId2 = $('.con_meal .cont_ul');

    //加载
    $(window).scroll(function() {      
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - 60;
        if ($(window).scrollTop() >= scroll && !loadMoreLock) {
            var page = parseInt($('.tab-box .active').attr('data-page')),
                totalPage = parseInt($('.tab-box .active').attr('data-totalPage'));
            if (page < totalPage) {
                ++page;
                loadMoreLock = true;
                $('.tab-box .active').attr('data-page', page);
                getList();
            }
        };
    });

    getList();
    function getList() {
        var active = $('.tab-box .active'), action = active.attr('data-id'), url;
        var page = active.attr('data-page');
        $('.loading').remove();
        if (action == 1) {
            
            objId.append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...           
            url =  "/include/ajax.php?service=marry&action=getrese&page="+page+"&pageSize=10";
          
        }else if(action == 2){
            
            objId2.append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
            url = "/include/ajax.php?service=marry&action=getContactlog&resetype=1&type=0&page="+page+"&pageSize=10";
        }
        loadMoreLock = true;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
                var list = data.info.list;
                if(data && data.state == 100){
                    var html = [];
                    var pageinfo = data.info.pageInfo,totalpage = pageinfo.totalPage;
                    active.attr('data-totalPage', totalpage);

                    for(var i=0;i<list.length;i++){
                        var pubd   = marryTime.transTimes(list[i].pubdate,3),
                            pubt   = marryTime.transTimes(list[i].pubdate,4),
                            pubdbus   = marryTime.transTimes(list[i].date,3),
                            pubtbus  = marryTime.transTimes(list[i].date,4);
                        html.push('<li class="tutor fn-clear">');
                        html.push('    <div class="top fn-clear">');
                        if(list[i].state == 1){
                            html.push(' <div class="left_b_on">已联系</div>');
                        }else{
                            if(action == 1){
                                html.push(' <div class="left_b"><span>'+pubd+'</span><span>'+pubt+'</span></div>');
                            }else{
                                html.push(' <div class="left_b"><span>'+pubdbus+'</span><span>'+pubtbus+'</span></div>');
                            }
                            
                        }
                       
                        html.push('        <div class="middle_b">');
                        var peoname = action == 1?list[i].people:list[i].username;
                        var contact = action == 1?list[i].contact:list[i].tel;
                        html.push('            <h2 class="person_name">'+peoname+'</h2>');
                        html.push('            <p>'+contact+'</p>');
                        html.push('        </div>');
                        html.push('        <div class="right_b">');
                        html.push('            <a href="tel:'+list[i].contact+'"><img src="'+templateSkin+'images/renovation/call.png" alt=""></a>');
                        html.push('        </div>');
                        html.push('    </div>');
                        html.push('    <div class="bottom">');
                        if (action == 1) {     
                        var comUrl = list[i].comtype == 1?storeUrl.replace('%id%',list[i].company):hotelUrl.replace('%id%',list[i].company);
                        var httxt = list[i].comtype == 1?'酒店主页':'商家主页';                   
                        html.push('        <h3 class="village"><a href="'+comUrl+'">'+langData['marry'][7][46]+'：<span>'+httxt+'</span><i></i></a></h3>');//客户来源
                        }else if(action == 2){
                        html.push('        <h3 class="village"><a href="'+list[i].link+'">'+langData['marry'][7][46]+'：<span>'+ list[i].title+'</span><i></i></a></h3>');//客户来源
                        }
                        html.push('        </div>');
                        html.push('    </li>');
                    }
                    if (action == 1) {
                        objId.find('.loading').remove();
                        if(page == 1){
                            objId.html(html.join(""));
                        }else{
                            objId.append(html.join(""));
                        }
                    }else if(action == 2){
                        objId2.find('.loading').remove();
                        if(page == 1){
                            objId2.html(html.join(""));
                        }else{
                            objId2.append(html.join(""));
                        }
                    }


                    loadMoreLock = false;
                    if(page >= pageinfo.totalPage){
                        loadMoreLock = true;
                        if (action == 1) {
                            objId.append('<div class="loading">'+langData['marry'][7][45]+'</div>');//没有更多啦~
                        }else if(action == 2){
                            objId2.append('<div class="loading">'+langData['marry'][7][45]+'</div>');//没有更多啦~
                        }
                    }
                }else {
                    loadMoreLock = false;
                    if(action == 1) {
                        objId.find('.loading').html(data.info);
                    }else if(action == 2){
                        objId2.find('.loading').html(data.info);
                    }
                }
            },
            error: function(){
                loadMoreLock = false;
                if (action == 1) {
                    objId.find('.loading').html(langData['siteConfig'][20][227]);//网络错误，加载失败！
                }else if(action == 2){
                    objId2.find('.loading').html(langData['siteConfig'][20][227]);//网络错误，加载失败！
                }
            }
        })
    }
});