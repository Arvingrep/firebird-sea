$(function () {
    //顶部图片轮播
    $(".adbox .slideBox1").slide({mainCell:".bd ul",autoPlay:true,easing:"easeInSine",delayTime:1000, autoPage:'<li></li>',titCell: '.hd ul'});


    //选项卡切换
    $('.part1 ul li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.filter .container').eq(i).addClass('show').siblings().removeClass('show');
    });

    //中间图片轮播
    $(".mid-ad .slideBox2").slide({mainCell:".bd ul",effect:"left",autoPlay:true, autoPage:'<li></li>', titCell: '.hd ul'});


    //报名组团看房下拉菜单
    $('#selectTypeMenu').hover(function(){
        $(this).show();
        $(".searchArrow").addClass("searchArrowRote");
    }, function(){
        $(this).hide();
        $(".searchArrow").removeClass("searchArrowRote");
    });

    $("#selectTypeText").hover(function () {
        $(this).next("span").slideDown(200);
        $(".searchArrow").addClass("searchArrowRote");
    }, function(){
        $(this).next("span").hide();
        $(".searchArrow").removeClass("searchArrowRote");
    });

    $("#selectTypeMenu>a").click(function () {
        $("#selectTypeText").text($(this).text());
        $("#selectTypeRel").attr("value", $(this).attr("rel"));
        $(this).parent().hide();
        $(".searchArrow").removeClass("searchArrowRote");
    });

    // 查看更多
    $(".getnew").bind('click', function () {
        var noid = $("#noid").val();
        $.ajax({
            url: '/include/ajax.php?service=house&action=news&pageSize=7&noid=' + noid,
            dataType: 'json',
            type: 'GET',
            success: function (data) {
                if (data && data.state == 100) {
                    var redhtml= [], html = [], info = data.info.list;
                    for (var i = 0; i < info.length; i++) {
                        if(i==0){
                            redhtml.push('<a class="firkx" href="' + info[i].url + '" target="_blank">' + info[i].title + '</a>');
                        }else{
                            html.push('<li><a href="' + info[i].url + '" target="_blank">' + info[i].title + '</a></li>');
                        }
                    }
                    $(".firkx").eq(0).remove();
                    $(".kuaixun").eq(0).before(redhtml.join(""));
                    $(".kuaixun").eq(0).html(html.join(""));
                }
            }
        })
    });

    //getlist();
    function getlist(){
        $.ajax({
            url: '/include/ajax.php?service=house&action=loupanList&pageSize=12&orderby=4',
            dataType: 'json',
            type: 'GET',
            success: function (data) {
                if (data && data.state == 100) {
                    var redhtml= [], html = [], info = data.info.list;
                    var temptime = '';
                    for (var i = 0; i < info.length; i++) {
                        if(temptime == info[i].deliverdate){
                            console.log(22);
                    
                            html.push('</div>');
                        }else{
                            temptime = info[i].deliverdate;
                            html.push('<div class="scroll">');
                            html.push('<p class="scroll-time" data-time="{#$j#}"><img src="{#$templets_skin#}images/intro-01.png" alt=""><span>'+huoniao.transTimes(info[i].deliverdate, 1)+'</span><em></em></p>');
                        }
                    }
                    $(".scroll-box").html(html.join(""));
                    /* for (var i = 0; i < info.length; i++) {
                        if(i==0){
                            redhtml.push('<a class="firkx" href="' + info[i].url + '" target="_blank">' + info[i].title + '</a>');
                        }else{
                            html.push('<li><a href="' + info[i].url + '" target="_blank">' + info[i].title + '</a></li>');
                        }
                    }
                    $(".firkx").eq(0).remove();
                    $(".kuaixun").eq(0).before(redhtml.join(""));
                    $(".kuaixun").eq(0).html(html.join("")); */
                }
            }
        })
    }


});

