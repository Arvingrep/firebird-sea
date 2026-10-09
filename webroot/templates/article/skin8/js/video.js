$(function () {


    //左侧导航吸顶
    // var navHeight = $('.navlist').offset().top;

    // $(window).scroll(function() {
    //     if ($(window).scrollTop() > navHeight) {
    //         $('.navlist').addClass('topfixed');
    //     } else {
    //         $('.navlist').removeClass('topfixed');
    //     }
    // });
    //联播和列表切换
    // $('.switch-type li').click(function () {
    //     $(this).addClass('on');
    //     $(this).siblings().removeClass('on');
    //     var i = $(this).index();
    //     $('.containtwo .con').eq(i).addClass('show').siblings().removeClass('show');
    // });


        //左侧浮动导航定位

        $(document).scroll(function(){

        var top =  $('#content').offset().top;
        var left =  $('#content').offset().left;
        var scrollTop1=$(document).scrollTop();
          console.log(scrollTop1+'==='+top)
        if(scrollTop1>top){
          //console.log($('.channel_mod').offset().top)

            $('.fudong-nav').css({'left':left-190,'position':'fixed','z-index':'12'})
        }else{
            $('.fudong-nav').css({'left':'-30px','position':'absolute','z-index':'12'})
        }

    });


    //左侧浮动导航栏二级导航定位

     $('.fudong-nav>li').hover(function(){
        var nav_H = $('.fudong-nav').height();
        var nav_second = $(this).find('.secondnac-box');
        var li_top =  $(this).offset().top;
        var ul_top =  $(this).parents('.fudong-nav').offset().top;
        if(nav_second.find('li').length==0){
            nav_second.remove()
        }
        if(nav_second.height()>nav_H){
            nav_second.css('top','0');
            $(this).css('position','static')
        }else if(li_top<nav_second.height()){
            nav_second.css('top','0');
            $(this).css('position','relative')

        }else if(li_top>nav_second.height()){
            //console.log()
            nav_second.css('bottom',-.8*(nav_second.height()));
            $(this).css('position','relative')
        }

    },function(){});

    var page=1;pageSize=10;
    var flag = false;

    getDatas(pageSize,page);

    function getDatas(pageSize, page){

        flag = true;
        $.ajax({
            url: masterDomain + '/include/ajax.php?service=article&action=alist&mold='+mold+'&typeid='+typeid+'&page=' + page + '&pageSize=' + pageSize,
            type: 'GET',
            dataType: 'jsonp',
            success: function (respon) {
                if (respon.state == 100) {
                    var datas = respon.info.list;
                    var totalPage = respon.info.pageInfo.totalPage; //总页码
                    for (var i = 0; i < datas.length; i++) {
                        var d = datas[i];
                        var pubdate = dateTimes(d.pubdate);
                        var litpic = d.litpic ? d.litpic : staticPath+'images/blank.gif';
                        var click = d.click >= 1000 ? d.click/10000 + '万' : d.click;
                        var reg = /<strong>|<\/strong>/g;
                        var title = datas[i].title.replace(reg, '');
                        var duration = '';
                        if(d.videotime > 0){
                            var theTime = parseInt(d.videotime);// 秒
                            var theTime1 = 0;// 分
                            var theTime2 = 0;// 小时
                            if(theTime > 60) {
                                theTime1 = parseInt(theTime/60);
                                theTime = parseInt(theTime%60);
                                if(theTime1 > 60) {
                                    theTime2 = parseInt(theTime1/60);
                                    theTime1 = parseInt(theTime1%60);
                                }
                            }
                            var result = theTime;
                            if(theTime1 > 0) {
                                if(theTime2 > 0) {
                                    result = theTime2+":"+theTime1+":"+result;
                                }else{
                                    result = theTime1+":"+result;
                                }
                            }else{
                                result = "00:"+result;
                            }
                            duration = '<span class="duration">'+result+'</span>';
                        }
                        var writer = '';
                        if(d.writer){
                            if(d.media){
                                writer = '<a href="'+d.media.url+'" class="author" target="_blank">'+d.writer+'</a>';
                            }else{
                                writer = '<span class="author">'+d.writer+'</span>';
                            }
                        }
                       // console.log(d);

                         // if(d.videotime !=0){
                         //    var playtime =`<span class="paly_time">${d.videotime}</span>`;
                         // }else {
                         //     var playtime =` `;
                         // }

                        list = `
                                    <li><div class="inner">
                                        <a href="${d.url}" target="_blank" class="pic"><img src="`+litpic+`" alt="" >${duration}

                                        </a>
                                        <div class="info fn-clear">
                                            <a href="${d.url}" target="_blank" class="title">${d.title}</a>
                                            <div class="desc">${d.description}</div>
                                            <div class="items l0 fn-left">
                                                ${writer}
                                                <span class="publish">${pubdate}</span>
                                            </div>
                                            <div class="items r0 fn-right">
                                                <a href="javascript:;" class="sharebtn t newBtn_share listBtnShare" data-title="${title}" data-url="${d.url}" data-pic="${d.litpic}">分享</a>
                                                <span class="count">${click}</span> </div>
                                        </div>
                                    </div></li>

                                    `
                        $('#vdlist').append(list)
                        flag = false;

                    }
                    if (page == totalPage) {
                        $('.loa').text('没有更多数据');
                        getDatas = null;
                        flag = false;
                        return;

                    }
                }else{
                    $('.loa').text('暂无相关数据');
                }
            },

            error: function () {
                $('.loa').text('数据加载失败，请刷新后重新尝试')
                flag = false;
            }
        });

    }
    //触底加载更多
    $(window).scroll(function () {
        var height = document.documentElement.clientHeight || window.innerHeight;
        var scrollHeight = document.documentElement.scrollTop || document.body.scrollTop;
        var elementHeight = null;

        var viewHeight = parseFloat($(window).height()) + parseFloat($(window).scrollTop());
        if ($('#vdlist').children().length >= 1) {
            elementHeight = $('#vdlist').children().last().offset().top;

        }
        if (elementHeight - scrollHeight < height && !flag) {

            page++;
            try {
                getDatas(pageSize, page);
            } catch (erro) {
                getDatas = null;
            }


        }
    });




});

function dateTimes(times) {
    var d = new Date(times * 1000);
    var date = (d.getFullYear()) + "-" + (d.getMonth() + 1) + "-" + (d.getDate()) + "-" + (d.getHours()) + ":" + (d.getMinutes()) + ":" + (d.getSeconds());
    var startTime = date;
    var currTime = new Date(); //当前时间
    //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式
    startTime = startTime.replace(/\-/g, "/");
    var sTime = new Date(startTime);
    var totalTime = currTime.getTime() - sTime.getTime();
    var days = parseInt(totalTime / parseInt(1000 * 60 * 60 * 24));
    totalTime = totalTime % parseInt(1000 * 60 * 60 * 24);
    var hours = parseInt(totalTime / parseInt(1000 * 60 * 60));
    totalTime = totalTime % parseInt(1000 * 60 * 60);
    var minutes = parseInt(totalTime / parseInt(1000 * 60));
    totalTime = totalTime % parseInt(1000 * 60);
    var seconds = parseInt(totalTime / parseInt(1000));
    var time = "";
    if (days >= 1) {
        time = days + "天";
        if (days > 3) {
            time = d;
            return time = d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
        }
    } else if (hours >= 1) {
        time = hours + "小时";
    } else if (minutes >= 1) {
        time = minutes + "分钟"
    } else {
        time = seconds + "秒";
    }
    return time+'前';

}
