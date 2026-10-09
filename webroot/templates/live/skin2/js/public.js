$(function () {
    $('.header .searchbox .searchkey').bind('focus',function () {
        $(this).closest('.searchbox').addClass('focus');
    });
    $('.header .searchbox').hover(function () {
        $(this).addClass('curr');
    },function () {
        $(this).removeClass('curr');
    });

    $('.header .searchbox .searchkey').bind('blur',function () {
        $(this).closest('.searchbox').removeClass('focus');
    });
    // 鼠标经过下拉排序框
    $('.header .nav .state').hover(function(){
        $('.header .nav .state .ModuleBox').show();
    },function(){
        $('.header .nav .state .ModuleBox').hide();
    });
    //鼠标点击下拉列表项
    $('.header .nav  .state a').click(function(){
        $('.header .nav  .state dt').text($(this).text());
        $('.header .nav  .state .ModuleBox').hide();
    });
    $('.searchbox form').submit(function(e){
        var val = $.trim($('.searchkey').val());
        if(val == ''){
            e.preventDefault();
        }
    });

    $('.isearch').bind('click', function () {
        $(this).closest('form').submit();
    })


    getDaojishi();
    //倒计时一次请求
    function getDaojishi(){
        $.ajax({
            url: "/include/ajax.php?service=tuan&action=systemTime",
            type: "GET",
            dataType: "jsonp",
            success:function (data) {
                var list = data.info.list,nowTime = data.info.nowTime,now = data.info.now;
                for(var i = 0; i < list.length; i++){
                    if(now ==list[i].nowTime){
                        var nextHour = list[i].nextHour;
                        var nowTime = data.info.nowTime;
                        var intDiff = nextHour - nowTime;

                        function timer(intDiff){
                            window.setInterval(function(){
                                var hour=0,
                                    minute=0,
                                    second=0;//时间默认值
                                if(intDiff > 0){
                                    var hour = Math.floor((intDiff / 3600) % 24);
                                    var minute = Math.floor((intDiff / 60) % 60);
                                    var second = Math.floor(intDiff % 60);
                                }

                                $('.daojishi').find(".h").text(hour < 10 ? "0" + hour : hour);
                                $('.daojishi').find(".m").text(minute < 10 ? "0" + minute : minute);
                                $('.daojishi').find(".s").text(second < 10 ? "0" + second : second);
                                intDiff--;
                            }, 1000);
                        }
                        timer(intDiff);

                    }
                }
            }
        });
    }

    //举报
    var complain = null;
    $(".report").bind("click", function(){

        var domainUrl = channelDomain.replace(masterDomain, "").indexOf("http") > -1 ? channelDomain : masterDomain;
        complain = $.dialog({
            fixed: true,
            title: "直播举报",
            content: 'url:'+domainUrl+'/complain-live-detail-'+id+'.html',
            width: 500,
            height: 300
        });
    });

    var staticPath = (u=window.staticPath||window.cfg_staticPath)?u:((window.masterDomain?window.masterDomain:document.location.origin)+'/static/');
    var shareApiUrl = staticPath.indexOf('https://')>-1?staticPath+'api/baidu_share/js/share.js':'http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion='+~(-new Date()/36e5);
    window._bd_share_config={"common":{"bdSnsKey":{},"bdText":"","bdMini":"1","bdMiniList":false,"bdPic":"","bdStyle":"1","bdSize":"24"},"share":{"bdSize":0}};with(document)0[(getElementsByTagName('head')[0]||body).appendChild(createElement('script')).src=shareApiUrl];





});
