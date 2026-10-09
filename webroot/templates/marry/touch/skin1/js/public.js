$(function () {

    //收藏
    $(".coll-box").bind("click", function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            location.href = masterDomain + '/login.html';
            return false;
        }
        var t = $(this), id = t.attr('data-id'), type = "add", oper = "+1", txt = langData['marry'][5][63];

        if(!t.hasClass("has")){
            t.addClass("has");
        }else{
            type = "del";
            t.removeClass("has");
            txt = langData['marry'][5][64];
        }
        var x = t.offset().left, y = t.offset().top;

        t.html("<s></s>"+txt);
        var act = '';
        if(fromType == 'store'){//公司详情
            act = 'store-detail' + '|' + istype + '|' + typeid;
        }else if(fromType == 'hotel'){//酒店详情
            act = 'hotel-detail';
        }else if(fromType == "plancase"){//商家案例详情
            act = 'plancase-detail';
        }else if(fromType == "planmeal"){//套餐详情
            act = 'planmeal-detail' + '|' + typeid + '|' + istype + '|' + businessid;
        }else if(fromType == "planpro"){//商家介绍
            act = 'planpro-detail';
        }   

        $.post("/include/ajax.php?service=member&action=collect&module=marry&temp="+act+"&type="+type+"&id="+id);

    });

    // 电话弹框
    $('.container').delegate('.tel-box', 'click', function(event) {
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            alert("登录后显示");
            location.href = masterDomain + '/login.html';
            return false;
        }
        var t = $(this);
        var tel_ = t.attr("data-tel");
        $(".modal-main .fn-clear b").html(tel_);
        $(".modal-main .call a").attr("href","tel:"+tel_);
        $.smartScroll($('.modal-public'), '.modal-main');
        $('html').addClass('nos');
        $('.m-telphone').addClass('curr');
        $("li").removeClass('bColor');
        return false;
    });

    // 关闭
    $(".modal-public .modal-main .close").on("click",function(){
        $("html, .modal-public").removeClass('curr nos');
        return false;
    })
    $(".bgCover").on("click",function(){
        $("html, .modal-public").removeClass('curr nos');
    })



    // 回到顶部
    $.fn.scrollTo =function(options){
        var defaults = {
            toT : 0, //滚动目标位置
            durTime : 500, //过渡动画时间
            delay : 30, //定时器时间
            callback:null //回调函数
        };
        var opts = $.extend(defaults,options),
            timer = null,
            _this = this,
            curTop = _this.scrollTop(),//滚动条当前的位置
            subTop = opts.toT - curTop, //滚动条目标位置和当前位置的差值
            index = 0,
            dur = Math.round(opts.durTime / opts.delay),
            smoothScroll = function(t){
                index++;
                var per = Math.round(subTop/dur);
                if(index >= dur){
                    _this.scrollTop(t);
                    window.clearInterval(timer);
                    if(opts.callback && typeof opts.callback == 'function'){
                        opts.callback();
                    }
                    return;
                }else{
                    _this.scrollTop(curTop + index*per);
                }
            };
        timer = window.setInterval(function(){
            smoothScroll(opts.toT);
        }, opts.delay);
        return _this;
    };
    $('.top').bind('tap', function(){
        $("html,body").scrollTo({toT:0})
    })
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