$(function(){
  var activeID = detail.id;
  var page = 1, pageSize = 10, isload = false;

  function auto_data_size(){
    var imgss= $("figure img");
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
    // 播放
    $('.voiceBox .voice').on('click',function(){
      var audio;
      audio = new Audio();
      audio.src = "";
      if($(this).hasClass('play')){
        $(this).removeClass('play');
        audio.pause();

      }else{
        $(this).addClass('play');
        audio.play();
      }
      audio.loop = false;
      audio.addEventListener('ended', function () {  
          $('.voiceBox .voice').removeClass('play');
      }, false);
    })
    // 视频
    $('.comPic .comVideo video').on('tap',function(){
      $(this).closest('.wrapper').addClass('fullscreen');
      return false;
    })
     // 大图关闭
    $('.comPic .vClose').on('click',function(){
        $('.wrapper').removeClass('fullscreen');
        return false;
    })

    // 点赞
    $(".btn_zan").click(function(){
      $(".showlist .like").click();
    });

    $("body").delegate(".like","click", function(){
        var num = $(this).find("em").text();
        var t = $(this),id=t.attr('data-id'),type=t.hasClass('like1')? "del" : "add" ;
        var cid = $(this).closest('li').attr('data-id');

        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
          window.location.href = masterDomain+'/login.html';
          return false;
        }

        num++;
        if(type == "add"){
            t.addClass('like1');
            t.find("em").text(num);
            $('.btn_zan em').text(num > 0 ? num : "")
        }else{
            t.removeClass('like1');
            t.find("em").text(num-2);
            $('.btn_zan em').text(num-2 > 0 ? num-2 : "")
        }

        $.post("/include/ajax.php?service=member&action=dingComment&id="+detail.id+'&type='+type);
        
       
    });


    // 返回顶部
    var windowTop=0;
    $(window).on("scroll", function(){
            var scrolls = $(window).scrollTop();//获取当前可视区域距离页面顶端的距离
            if(scrolls>=windowTop){//当B>A时，表示页面在向上滑动
                //需要执行的操作
                windowTop=scrolls;
                $('.gotop').hide();
                $('.wechat-fix').hide();

            }else{//当B<a 表示手势往下滑动
                //需要执行的操作
                windowTop=scrolls;
                $('.gotop').show();
                $('.wechat-fix').show();
            }
            if(scrolls==0){
              $('.gotop').hide();
                $('.wechat-fix').hide();
            }
     });
   // 回到顶部
  $('.gotop').click(function(){
    var dealTop = $("body").offset().top;
        $("html,body").scrollTo({toT:dealTop})
    $('.gotop').hide();
  })
    // 返回上一页
    $('.goback').click(function(){
      history.go(-1);
    })
var comTime = {

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
      return (month+'-'+day);
    }else if(n == 4){
      return (month+'-'+day+' '+hour+':'+minute);
    }else{
      return 0;
    }
  }
}
    function getComment(tr){
      isload = true;

      $.ajax({
        url: masterDomain + '/include/ajax.php?service=member&action=getChildComment&pid='+detail.id+'&page='+page+'&pageSize='+pageSize,
        type: 'get',
        dataType: 'jsonp',
        success: function(data){
            if(data && data.state == 100){
                var list = data.info.list;
                var pageInfo = data.info.pageInfo;
                var html = [];
                for(var i = 0; i < list.length; i++){
                    var d = list[i];
                    html.push('<li class="fn-clear" data-id="'+d.id+'">');
                    html.push('  <div class="left">');
                    html.push('    <a href="javascript:;"><img src="'+(d.user.photo ? d.user.photo : (staticPath + 'images/noPhoto_60.jpg') )+'" alt=""></a>');
                    html.push('  </div>');
                    html.push('  <div class="right reply" data-id="'+d.id+'">');
                    html.push('    <p class="name"><span class="sname">'+d.user.nickname+'</span>');
                    if(d.is_self != "1"){
                        html.push(' <span class="like'+(d.zan_has == "1" ? " like1" : "")+'"><i></i><em>'+d.zan+'</em></span>');
                    }
                    html.push('    </p>');
                    html.push('    <p class="content reply_child">'+d.content.replace(/\n/g, '<br>')+'</p>');
                    html.push('    <p class="thirdP"><span class="time">'+comTime.transTimes(d.dtime, 4)+'</span><em class="reply_third reply_child">'+langData['business'][5][107]+'</em></p>');//回复Ta
                    html.push('  </div>');
                    
                    html.push('</li>');
                    if(d.lower.count){
                      //html.push('  <ul class="children">');                     
                      for(var n = 0; n < d.lower.list.length; n++){
                        var c = d.lower.list[n];
                        html.push('    <li class="fn-clear" data-id="'+c.id+'">');
                        html.push('      <div class="left">');
                        html.push('        <a href="javascript:;"><img src="'+(c.user.photo ? c.user.photo : (staticPath + 'images/noPhoto_60.jpg') )+'" alt=""></a>');
                        html.push('      </div>');
                        html.push('      <div class="right reply" data-id="'+c.id+'">');
                        html.push('        <p class="name"><span class="sname">'+c.user.nickname+'</span>');
                        if(d.is_self != "1"){
                            html.push(' <span class="like'+(d.zan_has == "1" ? " like1" : "")+'"><i></i><em>'+d.zan+'</em></span>');
                        }
                        html.push('    </p>');
                        html.push('        <p class="content reply_child">'+langData['siteConfig'][6][29]+'<span>'+c.member.nickname+'</span>：'+c.content.replace(/\n/g, '<br>')+'</p>');//回复
                        html.push('    <p class="thirdP"><span class="time">'+comTime.transTimes(c.dtime, 4)+'</span><em class="reply_third reply_child">'+langData['business'][5][107]+'</em></p>');//回复Ta
                        html.push('      </div>');
                        html.push('    </li>');
                      }
                      //html.push('  </ul>');
                    }
                }
                $('.comment_total').text(pageInfo.totalCount_all);
                $('.all_huifu em').text(pageInfo.totalCount_all);
                if(tr){
                  $('.commentlist').html(html.join(""));
                }else{
                  $('.commentlist').append(html.join(""));
                }
                $('.commentBox').removeClass('fn-hide');

                if(pageInfo.totalPage > page){
                  isload = false;
                }
            }
        }
      })
    }


    var cscroll = 0;

    $(".commentlist").delegate(".reply_child", "click", function(){
      var t = $(this).closest('.reply'), name = t.find(".sname").text();
      activeID = t.attr("data-id");
      cscroll = $(this).offset().top

      $("#commentInput").attr("placeholder", langData['siteConfig'][6][29]+name+":");//回复
      set_focus($('#commentInput'));
      $('.btn_zan').hide();
      $('.btnSend').show();
      $('.error').addClass('t-reply').html('').show();
      $('html').addClass('noscroll');
    })


    //点赞变为发送
    $('.inbox #commentInput').click(function(){
      var t = $(this);
      $('.btn_zan').hide();
      $('.btnSend').show();
      $('.error').addClass('t-reply').html('').show();
      $('html').addClass('noscroll');
    }); 
      $('#commentInput').blur(function(){
      var bh = $('body').height();
      setTimeout(function() {
        $(window).scrollTop(cscroll); //失焦后强制让页面归位
      }, 100);
    })
    
    // 弹出表情   
    $('.reply_box .bq_btn').click(function() {     
        var t = $(this);      
        if (!t.hasClass('bq_open')) {
          $('.bq_btn').addClass('bq_open');
          $('.bq_box').addClass('show');
        } else {
          $('.bq_btn').removeClass('bq_open');
          $('.bq_box').removeClass('show');
        }
        if(!$('.error').hasClass('t-reply')){
          $('.btn_zan').hide();
          $('.btnSend').show();
          $('.error').addClass('t-reply').html('').show();
        }

    });

    //点击表情，输入 
    var memerySelection;
    var userAgent = navigator.userAgent.toLowerCase();
    //set_focus($('#commentInput'));
    $('.emot_li').click(function() {
      var t = $(this);
      var emojsrc = t.find('img').attr('src');
      console.log(emojsrc)
      memerySelection = window.getSelection();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        $('#commentInput').append('<img src="' + emojsrc + '" class="emotion-img" />');
        return false;
  
      } else {
        set_focus($('#commentInput:last'));
        pasteHtmlAtCaret('<img src="' + emojsrc + '" class="emotion-img" />');
      }
      // $('.input_container .inbox:before').css('display',"none")
      document.activeElement.blur();
      return false;
    })
    //根据光标位置插入指定内容
    function pasteHtmlAtCaret(html) {
      var sel, range;
      if (window.getSelection) {
        sel = memerySelection;
        // console.log(sel)
        if (sel.anchorNode == null) {
          return;
        }
        if (sel.getRangeAt && sel.rangeCount) {
  
          range = sel.getRangeAt(0);
          range.deleteContents();
          var el = document.createElement("div");
          el.innerHTML = html;
          var frag = document.createDocumentFragment(),
            node, lastNode;
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node);
          }
          range.insertNode(frag);
          if (lastNode) {
            range = range.cloneRange();
            range.setStartAfter(lastNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
  
      } else if (document.selection && document.selection.type != "Control") {
        document.selection.createRange().pasteHTML(html);
      }
    }
    //光标定位到最后
    function set_focus(el) {
      el = el[0];
      el.focus();
      if ($.browser.msie) {
        var rng;
        el.focus();
        rng = document.selection.createRange();
        rng.moveStart('character', -el.innerText.length);
        var text = rng.text;
        for (var i = 0; i < el.innerText.length; i++) {
          if (el.innerText.substring(0, i + 1) == text.substring(text.length - i - 1, text.length)) {
            result = i + 1;
          }
        }
        return false;
      } else {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    $('.error').click(function(){
      var t = $(this);
      if(t.hasClass('t-reply')){
        t.removeClass('t-reply').hide();
        activeID = detail.id;
        $("#commentInput").attr("placeholder", placeholderText);//说点什么…
        $("#commentInput").html('');
        $('.btn_zan').show();
        $('.btnSend').hide();
        if($('.reply_box .bq_btn').hasClass('bq_open')){//如果表情窗还在 则隐藏
          $('.bq_btn').removeClass('bq_open');
          $('.bq_box').removeClass('show');
        }
        $('html').removeClass('noscroll')
      }
    })

    $(".btnSend").click(function(){
      var t = $(this);
      if(t.hasClass('disabled')) return;
      var content = $('#commentInput').html() ; 
      if(content == ''){
        showErr(langData['siteConfig'][20][418]);//请填写内容
        return;
      }
      t.addClass('disabled');
      $.ajax({
        url: masterDomain + '/include/ajax.php?service=member&action=replyComment&id='+activeID+'&content='+encodeURIComponent(content),
        type: 'get',
        dataType: 'json',
        success: function(data){
          if(data && data.state == 100){
            showErr(data.info, 1000, function(){
              page = 1;
              isload = false;
              activeID = detail.id;
              t.removeClass('disabled');
              $("#commentInput").html('').attr("placeholder", langData['business'][5][130]+"...");//写点评论吧
              location.reload();
            })
          }else{
            showErr(data.info);
            t.removeClass('disabled');
          }
        },
        error: function(){
          showErr(langData['siteConfig'][6][203]);//网络错误，请重试
          t.removeClass('disabled');
        }
      })

    })

    $(window).scroll(function(){
      var sct = $(window).scrollTop(), winh = $(window).height(), bh = $('body').height();
      if(!isload && winh + sct + 50 >= bh){
        page ++;
        getComment();
      }
    })

    getComment();
})

// 错误提示
function showErr(str, type, callback){
  var o = $(".error");
  o.html('<p>'+str+'</p>').show();
  if(type != 'wait'){
    setTimeout(function(){
      o.hide();
      callback && callback();
    },1000);
  }
}