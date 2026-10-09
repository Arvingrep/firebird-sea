$(function(){

  // 打开或者关闭
  $('.item .toggle').click(function(){
    var t = $(this), item = t.closest('.item'), warn = item.find('.warn'), type = item.attr('data-type');
    var val = t.hasClass('on') ? 0 : 1;
    var action = type == 'status' ? 'updateStatus' : 'updateValid';
    t.toggleClass('on');
    $.ajax({
      url: "waimaiShop.php",
      type: "post",
      data: {action: action, id: id, val: val},
      dataType: "json",
      success: function(res){
          if(res.state != 100){
            t.toggleClass('on');
            alert(res.info);
          }
      },
      error: function(){
          alert(langData['siteConfig'][20][253]);
      }
    })


  })

})
