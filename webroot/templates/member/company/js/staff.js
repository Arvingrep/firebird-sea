
$(function(){
// 删除

$('.container').delegate('.del_btn', 'click', function(event) {
  var t = $(this),id = t.closest('tr').attr('data-id');
  if(id){
    $.dialog.confirm(langData['siteConfig'][20][211], function(){
      t.siblings("a").hide();
      t.addClass("load");

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
      // 删除接口
    })
  }
});



// 生成二维码
  $(".codeImg").qrcode({
		render: window.applicationCache ? "canvas" : "table",
		width: $(".codeImg").width(),
		height: $(".codeImg").height(),
		text: toUtf8(staffurl)
	});

  // 显示弹窗
  $(".showPop").click(function(event) {
    /* Act on the event */
    $(".pop_mask,.popbox").show();
    if($('.popbox .shareImg img').size() == 0){
      getCavas()
    }
  });

  $(".close_pop,.popbox").click(function(){
    $(".pop_mask,.popbox").hide();
  })

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
      $(".btn_share").attr('href',imageBase64).attr('download',imageBase64)
      return image;
  }

})



function toUtf8(str){
    var out, i, len, c;
    out = "";
    len = str.length;
    for(i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if ((c >= 0x0001) && (c <= 0x007F)) {
            out += str.charAt(i);
        } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
            out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
            out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
        } else {
            out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
            out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
        }
    }
    return out;
}

var loading = 0;
getList()
function getList(){
    if(loading) return false;
    loading = 1;
    $.ajax({
        url:"/include/ajax.php?service=business&action=staffList&pageSize=10&page="+atpage,
        type: "GET",
        dataType: "json",
        success: function (data) {
            if(data.state == 100){
                var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
                //拼接列表
                if(list.length > 0){
                    for(var i = 0; i< list.length; i++){
                        html.push('<tr data-id="'+list[i].id+'"><td class="fir"></td>');
                        html.push('<td class="staff_info">');
                        html.push('<div class="headIcon"><img src="'+list[i].photo+'" alt=""></div>');
                        html.push('<h5 class="nickname">'+list[i].nickname+'</h5></td>');
                        html.push('<td>'+list[i].staffname+'</td>');
                        html.push('<td>'+list[i].phone+'</td>');
                        var statename = '正常';
                        if(list[i].state == 0){
                            statename = '待分配权限';
                        }
                        html.push('<td>'+statename+'</td>');
                        html.push('<td>'+list[i].jobname+'</td>');

                        var storearr = ''

                        if(list[i].storearr.length > 0){
                            for (var a = 0; a< list[i].storearr.length; a++){
                                storearr += '<span>'+list[i].storearr[a]+'</span>'
                            }
                        }
                        html.push('<td class="manage_shop">'+storearr+'</td>');
                        html.push('<td class="editBox"><a class="edit_btn" href="'+editUrl+'?id='+list[i].id+'">'+langData['siteConfig'][56][22]+'</a><a class="del_btn" href="javascript:;">'+langData['siteConfig'][56][21]+'</a></td></tr>');
                    }
                    $(".container tbody").html(html.join(''))
                    totalCount = pageInfo.totalCount;

                    $("#totalcount").text('('+totalCount+')');
                    showPageInfo();
                    loading = false;
                }else{
                    $(".container tbody").html('<tr>暂无数据</tr>')
                }
            }
        },
        error:function(){  $(".container tbody").html('<tr>'+data.info+'</tr>')},
    });
}

/* ---------------- Telegram 邀请卡片 ----------------
 * 请求 member?action=staffInvite → 画二维码 + 可复制链接；任何失败都整块降级为一行文案，
 * 绝不抛 JS 错误影响原有「员工扫码绑定商家」微信二维码链路。 */
$(function(){
  var tgBox = $('#tgInviteBox');
  if (!tgBox.length || typeof staffInviteUrl === 'undefined' || !staffInviteUrl) return;

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
});
