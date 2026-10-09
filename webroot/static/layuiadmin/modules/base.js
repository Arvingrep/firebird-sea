/**

 @Name：公用JS部分
 @Author：陈伟
 */
layui.extend({}).define(function (exports) {
  var $ = layui.$
    , layer = layui.layer
    , laytpl = layui.laytpl
    , setter = layui.setter
    , view = layui.view
    , admin = layui.admin;


// 表格转交弹出层
  $(document).on('click', ".j-transmit", function (e) {
    layui.stope(e);
    $(this).siblings('.transmit-list').show();
  });
  $(document).on('click', function () {
    $(".js-transmit-list").hide();
    $(".j-doing").hide();
  });
  $(".js-transmit-list").on('click', function () {
    $(this).hide();
  });
  // 表格鼠标悬停事件
  /*$(document).on({
    'mouseover': function () {
      var msg = $(this).data('msg');
      layer.tips(msg, $(this), {
        tips: 1,
        skin: 'crm-layer-tips',
        time: 4000
      })
    },
    "mouseout": function () {
      layer.closeAll('tips');
    }
  }, '.j-nameurl',);*/
  // $(document).on('mouseover','.j-nameurl',function () {
  //   var msg = $(this).data('msg');
  //   layer.tips(msg, $(this), {
  //     tips: 1,
  //     skin: 'crm-layer-tips',
  //     time: 4000
  //   })
  // });
  // $(document).on('mouseout','.j-nameurl',function () {
  //   layer.closeAll('tips');
  // });
    $('.j-nameurl').hover(function() {
          var msg = $(this).data('msg');
          layer.tips(msg, $(this), {
            tips: 1,
            skin: 'crm-layer-tips',
            time: 4000
          })
    }, function() {
         layer.closeAll('tips');
    });

  // 表格中图标按钮弹出式操作
  $(document).on('click', ".j-bar-operation", function (e) {
    var even = e || window.event;
    layui.stope(e);
    var rel = even.target.getBoundingClientRect();
    $(".j-doing").hide();
    $(this).siblings('.j-doing').css({
      'top': rel.y + 20 + 'px',
      'left': rel.x - 20 + 'px',
      'display': 'block'
    })
  });

  // Form methods
  var FormInit = function() {
    var requiredDOM = $('[lay-verify]');
    requiredDOM.each(function() {
      // var target = $(this).parents('.layui-form-item').find('.layui-form-label')
      var target = $(this).parent().parent().find('.layui-form-label');
      var target_text = target.text()
      target.prepend('<b style="margin-right: 5px; color: #DC171A">*</b>')
      $(this).attr('lay-reqText', target_text + '不能为空')
    })
  }
  FormInit()



  exports('basejs', {})
});