$(function(){

  // 显示编辑/删除按钮组
  $("body").delegate('.btn_dot', 'click', function(event) {
    var t = $(this), lid = t.closest('li').attr('data-id');
    $(".mask_pop").show();
    $('.popBox').css('transform','translateY(0)').attr('data-id',lid);
    $('.popBox .edit_btn').attr('href',editUrl+'?id='+lid);
  });

// 点击遮罩
 $(".mask_pop").click(function(){
   $(".mask_pop").hide();
   $('.popBox').css('transform','translateY(100%)');
   $('.popbox').removeClass('show');
 });

$(".close_pop").click(function(){
  $(".mask_pop").hide();
  $('.popbox').removeClass('show');
})

// 生成二维码
 $(".codeImg").qrcode({
		render: window.applicationCache ? "canvas" : "table",
		width: $(".codeImg").width(),
		height: $(".codeImg").height(),
		text: toUtf8(staffurl)
	});

  // ---- Telegram 邀请卡片 ----
  // 请求 member?action=staffInvite → 画二维码 + 可复制链接；任何失败都整块降级为一行文案，
  // 绝不抛 JS 错误影响原有「员工扫码绑定商家」微信二维码链路。
  var tgBox = $('#tgInviteBox');
  if (tgBox.length && typeof staffInviteUrl !== 'undefined' && staffInviteUrl) {
    $.ajax({
      url: staffInviteUrl,
      type: 'GET',
      dataType: 'json',
      success: function (res) {
        if (res && res.success && res.data && res.data.link) {
          renderTgInvite(tgBox, res.data.link);
        } else {
          degradeTgInvite(tgBox);
        }
      },
      error: function () {
        degradeTgInvite(tgBox);
      }
    });
  }

  function renderTgInvite(box, link) {
    try {
      box.find('.tgLink').val(link);
      var $code = box.find('.tgCodeImg');
      var utf8 = typeof toUtf8 === 'function' ? toUtf8 : function (s) { return s; };
      $code.qrcode({
        render: window.applicationCache ? 'canvas' : 'table',
        width: $code.width(),
        height: $code.height(),
        text: utf8(link)
      });
      box.find('.tgCopyBtn').on('click', function () {
        copyTgLink(link, box);
      });
    } catch (e) {
      degradeTgInvite(box);
    }
  }

  function copyTgLink(text, box) {
    var done = function () {
      box.find('.tgCopyBtn').text('已复制');
      setTimeout(function () { box.find('.tgCopyBtn').text('复制'); }, 2000);
    };
    var fallback = function () {
      try {
        var input = box.find('.tgLink')[0];
        input.focus();
        input.select();
        if (document.execCommand('copy')) { done(); } else { window.prompt('请手动复制链接', text); }
      } catch (e) {
        window.prompt('请手动复制链接', text);
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  }

  function degradeTgInvite(box) {
    box.addClass('is-degraded');
    box.find('.tgLink').val('');
  }
  // ---- Telegram 邀请卡片 e ----

  // 显示弹窗
  $(".add_btn").click(function(event) {
    /* Act on the event */
    $(".mask_pop").show();
    $('.popbox').addClass('show')
    if($('.popbox .shareImg img').size() == 0){
      getCavas()
    }
  });



  // 生成图片
  function getCavas(){
      //生成图片
      html2canvas(document.querySelector(".poster"), {
          'backgroundColor':null,
          'useCORS':true,
          'taintTest':false,
      }).then(canvas => {
          var a = canvasToImage(canvas);
          $('.popbox .shareImg ').html(a);

      });
  }
  function canvasToImage(canvas) {
      var image = new Image();
      var imageBase64 = canvas.toDataURL("image/jpeg",1);
      image.src = imageBase64;  //把canvas转换成base64图像保存
      utils.setStorage("huoniao_poster", imageBase64);
      return image;
  }



// 删除员工
$('.del_btn').click(function(){
  var t = $(this), id = t.closest('.popBox').attr('data-id');
  console.log(id);
  $('.delMask,.delAlert').show();
  $(".sureDel").off('click').click(function(){
      $.ajax({
          url:'/include/ajax.php?service=business&action=staffUpdateAuth&dotype=delete&id='+id,
          type:'POST',
          dataType:'json',
          success: function (data) {

              if(data.state == 100){
                  alert(data.info);
                  location.reload()
              }
          },
          error:function () {

          }
      });
  });

  $(".delMask,.cancelDel").off('click').click(function(event) {
    /* Act on the event */
    $('.delMask,.delAlert').hide();
  });


// 编辑 进入页面

})

    var page = 1, totalPage = 0 , isload = 0;

    $(window).scroll(function(){
        var scrTop = $(window).scrollTop();
        var bh = $('body').height() - 50;
        var wh = $(window).height();
        var scroll = bh - wh ;


        console.log(scrTop >= scroll , !isload)
        if(scrTop >= scroll && !isload){

            getData()
        }
    })
    getData()

    function getData(is){
        if(isload) return false;
        isload = true
        var left_count =  $('.left_count').text();
        $('.left_count').text(left_count.replace('1',0))
        $.ajax({
            url: '/include/ajax.php?service=business&action=staffList&page='+page+'&pageSize=10',
            type: 'GET',
            dataType: 'json',
            success: function(data){
                if(data){
                    if(data.state == 100){
                        var info = data.info, list = info.list, html = [];
                        totalPage  = info.pageInfo.totalPage;
                        totalCount = info.pageInfo.totalCount;
                        for(let m = 0; m<list.length; m++){
                            var cls = list[m].jobname?"has_acc":"";
                            html.push('<li data-id="'+list[m].id+'">');
                            html.push('<div class="staffInfo">');
                            html.push('<div class="head"><img src="'+list[m].photo+'" onerror="this.src=\'/static/images/noPhoto_100.jpg\'" alt=""></div>');
                            html.push('<div class="info">');
                            html.push('<h2><span class="nick">'+list[m].staffname+'</span><span class="for_acc '+cls+'">'+list[m].jobname+'</span></h2>');
                            // <!-- 有权限 -->
                            html.push('<p>管理权限<em>'+list[m].authority+'</em></p> </div> </div>');
                            html.push('<div class="btn_group">');
                            html.push('<a href="tel:'+list[m].phone+'" class="btn_access btn_left">联系Ta</a>');
                            html.push('<a href="javascript:;" class="btn_dot"></a> </div>');

                        }
                        var left_count =  $('.left_count').text();

                        $('.left_count').text(left_count.replace('0',totalCount))
                        $(".listbox ul").append(html.join(""));
                        page ++;
                        isload = 0;

                        if(page>totalPage){
                            isload = 1;
                            $(".loading").html('没有更多了~');  //已全部加载
                        }

                    }else{
                        $(".loading").html(data.info)
                    }
                }else{
                    $(".loading").html(data.info)
                }
            },
            error: function(){
                alert(data.info);  //网络错误，请刷新重试
            }
        })

    }




     //长按
      var flag = 1  //设置长按标识符
      var timeOutEvent = 0;
      $(".popbox .shareImg").on({
          touchstart: function (e) {
            console.log(2)
              if (flag) {
                console.log(111)
                  clearTimeout(timeOutEvent);
                  timeOutEvent = setTimeout("longPressPoster($('.shareImg img'))", 800);

              }
              // e.preventDefault();
          },
          touchmove: function () {
            console.log(3)
              clearTimeout(timeOutEvent);
              timeOutEvent = 0;
          },
          touchend: function () {
            console.log(4)
              flag = 1;
          }

      });














})
