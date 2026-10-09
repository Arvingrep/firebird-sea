$(function(){
	$('.appMapBtn').attr('href', OpenMap_URL);

    new Swiper('.swiper-container', {pagination: {el: '.swiper-pagination',type: 'fraction',},loop: true,grabCursor: true,paginationClickable: true});

    $('.video-box').on('click',function(){
        $('.video-btn').css('display','-webkit-flex');
        $('#video-control').css('display','-webkit-flex');
        setTimeout(function(){ $('#video-control').css('display','none'); $('.video-btn').css('display','none');}, 5000);
    });


    // 图片放大
    $('.topMain .swiper-slide img').on('click',function(){
        $(this).closest('.swiper-container').toggleClass('fullscreen-box');
    });
    // 视频链接弹出
    $('.markBox .mark1').on('click',function(){
        $('.swiper-container').toggleClass('fullscreen-box');
        $('.markBox').toggleClass('show');
        var type = $('.full').hasClass('small') ? "del" : "add";
        if(type=="del"){
            $('.full').removeClass('small')
        }else if(type=="add"){
            $('.full').addClass('small')
        }
    })
    


    
    new Swiper('pubCon .swiper-container', {scrollbar: {el: 'pubCon .swiper-scrollbar',hide: true,},});
    // 收藏
    $('.btnCollect').click(function(){
        var x = $(this);

        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
          window.location.href = masterDomain+'/login.html';
          return false;
        }

        var type = x.hasClass('collect1') ? "del" : "add";
        x.toggleClass('collect1');

        $.post("/include/ajax.php?service=member&action=collect&module=website&temp=detail&id="+id+"&type="+type);
    })



	// 电话弹框
    $(".foot-2").on("click",function(){
        $.smartScroll($('.modal-public'), '.modal-main');
        $('html').addClass('nos');
        $('.m-telphone').addClass('curr');
        return false;
    });
    
     // 微信弹框
    $(".foot-3").on("click",function(){
        $.smartScroll($('.modal-public'), '.modal-main');
        $('html').addClass('nos');
        $('.m-wx').addClass('curr');
        return false;
    });
    // 关闭
    $(".modal-public .modal-main .close").on("touchstart",function(){
        $("html, .modal-public").removeClass('curr nos');
        return false;
    })
    $(".bgCover").on("click",function(){
        $("html, .modal-public").removeClass('curr nos');
    })

    // 提交留言
    $("#addGuest").submit(function(event){
        event.preventDefault();
        var form = $(this),
            user    = $("#name")
            contact = $("#contact"),
            email = $("#email"),
            content = $("#content"),
            t = form.find('.submit');

        if($.trim(user.val()) == ""){
            alert("请输入您的姓名！");
            user.focus();
            return false;
        }


        if($.trim(email.val()) == "" && $.trim(contact.val()) == ""){
            alert("请输入您的联系电话或邮箱！");
            contact.focus();
            return false;
        }
        if($.trim(email.val()) != ""){
            if(!/^[a-z0-9]+([\+_\-\.]?[a-z0-9]+)*@([a-z0-9]+\.)+[a-z]{2,6}$/i.test($.trim(email.val()))){
                alert("请输入正确的邮箱！");
                email.focus();
                return false;
            }
        }

        if($.trim(content.val()) == ""){
            alert("请输入留言内容！");
            content.focus();
            return false;
        }

        t.prop("disabled", true).val("提交中...");
        var data = form.serialize();

        $.ajax({
            url: "/include/website.inc.php?action=guestAdd&projectid="+id,
            data: data,
            type: "post",
            dataType: "json",
            success: function(e) {
                t.prop("disabled", false).val("提交");
                if(e.state == 100){
                    alert('留言成功，我们会尽快与您取得联系！');
                    content.val('');
                }else{
                    alert(e.info);
                }
            },
            error: function(){
                alert.log('网络错误，请重试');
            }
        });

    });

    function auto_data_size(){
        $("figure a").each(function() {
            var t = $(this);
            var imgs = new Image();
            imgs.src = t.attr("href");

            if (imgs.complete) {
                t.attr("data-size","").attr("data-size",imgs.width+"x"+imgs.height);
            } else {
                imgs.onload = function () {
                    t.attr("data-size","").attr("data-size",imgs.width+"x"+imgs.height);
                    imgs.onload = null;
                };
            };

        })
    };
    auto_data_size();
    
    // 异步获取新闻
    function getList(){
        $.ajax({
            url: masterDomain + '/include/website.inc.php?action=articleList&pageSize=3&&projectid='+id+'&jsoncallback=?',
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.code == 0){
                    var html = [];
                    for(var i = 0; i < data.data.length; i++){
                        var d = data.data[i];
                        html.push('<li>')
                        html.push('    <a href="'+websiteUrl+'/newsd.html?sid='+d.id+'" class="fn-clear">')
                        html.push('        <div class="left"></div>')
                        html.push('        <div class="right">')
                        html.push('            <h4>'+d.title+'</h4>')
                        html.push('            <p>'+d.addtime.split(' ')[0].replace(/-/g, '.')+'</p>')
                        html.push('        </div>')
                        html.push('    </a>')
                        html.push('</li>')
                    }
                    $('#newsBox .trends-ul').html(html.join(''));
                }else{
                    $('#newsBox .trends-ul .loading').html(data.message);
                    $('#newsBox .readMore').remove();
                }
            }
        })
    }
    setTimeout(function(){
        getList();
    }, 1000)

});

// 视频
$(function(){
    
    var box = document.getElementById("video-control"); //box对象
    var video = document.getElementById("video"); //视频对象
    var play = document.getElementById("play"); //播放按钮
    var vbplay = document.getElementById("vbplay");//视频中间播放按钮
    var time = document.getElementById('time');
    var progress = document.getElementById("progress"); //进度条
    var bar = document.getElementById("bar"); //蓝色进度条
    var control = document.getElementById("control"); //声音按钮
    var sound = document.getElementById("sound"); //喇叭
    var full = document.getElementById("full") //全屏
    video.addEventListener('play', function() {
        play.className = "pause";
        $('.play-box').find('i').removeClass('play-icon').addClass('pause-icon');
    });
    video.addEventListener('pause', function() {
        play.className = "play";
        $('.play-box').find('i').removeClass('pause-icon').addClass('play-icon');
    });
    video.addEventListener('timeupdate', function() {
        var timeStr = parseInt(video.currentTime);
        var minute = parseInt(timeStr/60);
        if(minute == 0){
            if(timeStr < 10){
                timeStr = "0"+timeStr  ;
            }
            minute = "00:"+timeStr;
        }else{
            var timeStr = timeStr%60;
            if(timeStr < 10){
                timeStr = "0"+timeStr  ;
            }
            minute = minute +":"+timeStr;
        }
        time.innerHTML = minute;
    });
    video.addEventListener('volumechange', function() {
        if(video.muted) {
            sound.className = "soundoff"
        } else {
            sound.className = "soundon"
        }
    });
    full.addEventListener("click", function() {
        $('.video-box').parent().parent().toggleClass('fullscreen-box');
        $('.markBox').toggleClass('show');
        var type = $(this).hasClass('small') ? "del" : "add";
        if(type=="del"){
            $(this).removeClass('small')
        }else if(type=="add"){
            $(this).addClass('small')
        }

    }, false)
    play.onclick = function() {
        if(video.paused) {
            play.className = "pause";
            video.play();
        } else {
            play.className = "play";
            video.pause();
        }
    }
    vbplay.onclick = function() {
        if (video.paused){
            video.play();
            video.value = "pause";
        }else{
            video.pause();
            video.value = "play";
        }
    }
    //进度条
    video.addEventListener("timeupdate", function() {
        var scales = video.currentTime / video.duration;
        bar.style.width = progress.offsetWidth * scales + "px";
        control.style.left = progress.offsetWidth * scales + "px";
    }, false);
    var move = 'ontouchmove' in document ? 'touchmove' : 'mousemove';
    control.addEventListener("touchstart", function(e) {
        var leftv = e.touches[0].clientX - progress.offsetLeft - box.offsetLeft;
            if(leftv <= 0) {
                leftv = 0;
            }
            if(leftv >= progress.offsetWidth) {
                leftv = progress.offsetWidth;
            }
            control.style.left = leftv + "px"
    }, false);
    control.addEventListener('touchmove', function(e) {
        var leftv = e.touches[0].clientX - progress.offsetLeft - box.offsetLeft;
            if(leftv <= 0) {
                leftv = 0;
            }
            if(leftv >= progress.offsetWidth) {
                leftv = progress.offsetWidth;
            }
        control.style.left = leftv + "px"
    }, false);
    control.addEventListener("touchend", function(e) {
        var scales = control.offsetLeft / progress.offsetWidth;
        video.currentTime = video.duration * scales;
        video.play();
        document.onmousemove = null;
        document.onmousedown = null;
    //video.pause();
    }, false);
    sound.onclick = function() {
        if(video.muted) {
            video.muted = false;
            sound.className = "soundon"
        } else {
            video.muted = true;
            sound.className = "soundoff"
        }
    }
})