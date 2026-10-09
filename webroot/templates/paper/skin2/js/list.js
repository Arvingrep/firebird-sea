$(function () {
    // 判断浏览器是否是ie8
    if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.container ul.list li:nth-child(3n)').css('margin-right','0');
    }
    $('.nav li').hover(function () {
        $(this).toggleClass('active');
    });
    $('#date').hover(function () {
        $(this).addClass('active');
    },function(){
        $(this).removeClass('active');
    });
    $('.nav-box .choose-box li').click(function () {
        $(this).addClass('active').siblings().removeClass('active');
    });

    $('body').delegate('.nav-box .choose-box li span','click',function () {
        $('.nav li.edit span').html($(this).text());
        $('.nav-box .choose-box').removeClass('show');
    })

    $(document).bind('click',function(e){
        var e = e || window.event; //浏览器兼容性
        var elem = e.target || e.srcElement;
        while (elem) { //循环判断至跟节点，防止点击的是div子元素
            if (elem.id && elem.id=='edit') {
                return;
            }
            elem = elem.parentNode;
        }

        $('.nav-box .choose-box').removeClass('show'); //点击的不是div或其子元素
    });
    $('.nav li.edit').click(function () {
        $('.nav-box .choose-box').toggleClass('show');
    });



    //选择日期
    $(".laydate-icon").bind("click", function(){
        laydate({
            choose: function(dates){
                console.log(dates);
                location.href = searchUrl.replace("%1", dates);
            }
        });
    });


});