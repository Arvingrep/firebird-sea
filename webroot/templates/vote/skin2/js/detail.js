$(function () {

    $('.submit_btn').click(function () {
        $('.dalog').css('display','block');
    });
    $('.dalog>div .close_icon').click(function () {
        $('.dalog').css('display','none');
    });

    $('.dalog>div .cancel').click(function () {
        $('.dalog').css('display','none');
        $('.dalog .msg').text('确定要提交选票吗');
         $('.dalog .submit').removeClass('disabled');
         $('.dalog .cancel').text('继续投票');

    });

    //滚动显示提交按钮
    var h2_height = $(".themebox").offset().top;
    $(window).scroll(function(){
        var this_scrollTop = $(this).scrollTop();
        if(this_scrollTop>h2_height ){
            $(".submit_btn").show();
        }else{
            $(".submit_btn").hide();
        }
    });

    
    

   // 勾选
    $(".vote_before .xuan").click(function(){
        var t = $(this).find('.choose'), b = t.closest('.body'), g = b.closest('.item'), type = g.attr('data-type');
        if(type == 0){
            b.find('.choose').removeClass('active');
            t.addClass('active');
        }else{
            t.toggleClass('active');
        }
    })


    // 提交
    $('.dalog>div .submit').click(function(){
        if(detail.has_vote){
            // $.dialog.alert('您已经参与过此投票！');
            $('.dalog .msg').text('您已经参与过此投票！');
            return;
        }
        if(detail.state == 2){
            // $.dialog.alert('投票已结束！');
            $('.dalog .msg').text('投票已结束！');
            return;
        }
        var userid = $.cookie(cookiePre + 'login_user');
        if(userid == undefined || userid == 0 || userid == ''){
            huoniao.login();
            return;
        }
        var t = $(this), result = [], count = 0, tj = true;
        if(t.hasClass('disabled')) return;
        $('#groupList .item').each(function(index){
            var g = $(this), x = g.find('.choose'),  type = g.attr('data-type');
            var c = [];
            x.each(function(){
                var t = $(this);
                if(t.hasClass('active')){
                    c.push(t.closest('.xuan').attr('data-index'));
                }
            })
            if(!c.length || (type == 0 && c.length > 1)){

                $('.dalog .msg').text('你还有未投票的选题，请检查第'+(index+1)+'题');
                $('.dalog>div .cancel').text('好');
                t.addClass('disabled');
                tj = false;
                return true;
            }
            result.push(c)
            count++;
        })
        if(!tj) return false;
        if(count && count == result.length){
            t.addClass('disabled');
            $.ajax({
                url: masterDomain + '/include/ajax.php?service=vote&action=vote&id='+detail.id,
                data: {result: result},
                type: 'post',
                dataType: 'jsonp',
                success: function(data){
                    if(data && data.state == 100){
                        $('.has_vote').show();
                        setTimeout(function(){
                            location.reload();
                        },1000)
                    }else{
                        t.removeClass('disabled');
                        $.dialog.alert(data.info);
                    }
                },
                error: function(){
                    $.dialog.alert('网络错误，请重试！');
                    t.removeClass('disabled');
                }
            })
        }
    })



//查看大图
$('.xuan .pic a').abigimage();

    
    

});