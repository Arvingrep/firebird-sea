
$(function(){

  if(!checkLogin()){
    showErr('您还没有登录');
    $('body').append('<div style="position:fixed;left:0;top:.9rem;right:0;bottom:0;background:rgba(255,255,255,.7);z-index:10;"></div>');
  }

  $('.content').click(function(){
    set_focus($('.placeholder:last'));
  })

  $('.textarea').focus(function(){
    var t = $(this), txtGray = t.find('.txt-gray');
    if (txtGray.length > 0) {
      t.html('');
    }
  })

  $('.textarea').blur(function(){
    var t = $(this), txtGray = t.find('.txt-gray');
    if (t.html() == "") {
      t.html('<font class="txt-gray">'+placeholderText+'</font>');
    }
  });

  $('.scoreBox .center').delegate('.star', 'click', function() {
      var i = $(this).index();
      $(this).addClass('active').siblings('span').removeClass('active');
      if(i==0){
        $('.scoreBox .right').html('很差');
      }else if(i==1){
        $('.scoreBox .right').html('一般');
      }else if(i==2){
        $('.scoreBox .right').html('满意');
      }else if(i==3){
        $('.scoreBox .right').html('非常满意');
      }else if(i==4){
        $('.scoreBox .right').html('无可挑剔');
      }
      
  });

  // 上传LOGO
  var upPhoto = new Upload({
    btn: '#filePicker1',
    bindBtn: '',
    title: 'Images',
    mod: 'business',
    params: 'type=atlas',
    atlasMax: 8,
    deltype: 'delAtlas',
    replace: false,
    fileQueued: function(file){
      
    },
    uploadSuccess: function(file, response){
      if(response.state == "SUCCESS"){
        $('.uploadBox').append('<li class="upBox"> <img src="'+response.turl+'" data-url="'+response.url+'" alt=""> <div class="delBox"> <img src="'+templets+'images/delIcon.png" alt=""> </div> </li>');
      }
    },
    showErr: function(info){
      showErr(info);
    }
  });
  // 删除
  $('.uploadBox').delegate('.delBox', 'click', function(){
    var t = $(this), path = t.siblings('img').attr('data-url'), p = t.parent();
    upPhoto.del(path);
    p.remove();
  })

    // 提交
    $(".btnFb").on("click",function(){
      var t = $(this),
          sco1 = $('.star.active'),
          con = $('#content'),
          content = $('#content').val(),
          isanony = $('#isanony').is(':checked') ? 1 : 0;
      if(t.hasClass('disabled')) return;
      if(sco1.length == 0){
        showErr('请给店铺评分');
        return;
      }
      sco1 = sco1.index() + 1;

      var pics = [];
      $('.uploadBox li').each(function(){
        var img = $(this).children('img').attr('data-url');
        pics.push(img);
      })

      t.addClass('disabled');
      showErr('正在提交', 'wait');

      $.ajax({
        url: masterDomain + '/include/ajax.php?service=member&action=sendComment&type=pension-store&aid='+id+'&sco1='+sco1+'&content='+encodeURIComponent(content)+'&pics='+pics.join(',')+'&isanony='+isanony,
        type: 'get',
        dataType: 'json',
        success: function(data){
          $('.error').hide();
          if(data && data.state == 100){
            $.smartScroll($('.modal-public'), '.modal-main');
            $('html').addClass('nos');
            $('.suc').addClass('curr');
            setTimeout(function(){
              history.go(-1);
            })
            if(wx_miniprogram){
            	wx.miniProgram.navigateBack({ changed: true });
            }
          }else{
            t.removeClass('disabled');
          }
        },
        error: function(){
          showErr('网络错误，请重试!');
          t.removeClass('disabled');
        }
      })

    });
    
    $('.voiceBox').on('click','i',function(){
       $.smartScroll($('.modal-public'), '.modal-main');
        $('html').addClass('nos');
        $('.delAudio').addClass('curr');
        $(".delAudio .comfirm").on("click",function(){
            $("html, .modal-public").removeClass('curr nos');
            $('.voiceBox').remove();
        })
    })
   
     // 语音弹框
    $(".audio").on("click",function(){
        $.smartScroll($('.modal-public'), '.modal-main');
        $('html').addClass('nos');
        $('.m-audio').addClass('curr');
    });
    // 关闭
    $(".btnConfirm").on("touchstart",function(){
        $("html, .modal-public").removeClass('curr nos');
        window.history.go(-1);
    })
    $(".modal-public .modal-main .close").on("touchstart",function(){
        $("html, .modal-public").removeClass('curr nos');
    })
    $(".bgCover,.cancel").on("click",function(){
        $("html, .modal-public").removeClass('curr nos');
        window.history.go(-1);
    })

    function checkLogin(){
      var userid = $.cookie(cookiePre+"login_user");

      if(userid == null || userid == ""){
        return false;
      }else{
        return true;
      }
    }
    
    //头部--微信引导关注
    $('.wechat-fix,.wechat').bind('click', function(){
      $('.wechat-popup').css("visibility","visible");
    });

    $('.wechat-popup .close').bind('click', function(){
      $('.wechat-popup').css("visibility","hidden");
    });

})
// 错误提示
function showErr(str, type){
  var o = $(".error");
  o.html('<p>'+str+'</p>').show();
  if(type != 'wait'){
    setTimeout(function(){o.hide()},1000);
  }
}