$(function(){

  // 选择原因
  $('#reason').scroller(
    $.extend({preset: 'select'})
  );

  $('#submit').click(function(){
    var amount = $('.input').val();
    var val = $('.textarea').val();
    var t = $(this);
    if(t.hasClass("disabled")) return false;

    if (amount == 0 || amount == '') {
        showMsg('请填写提取金额');
        return false;
    }

    var reason = $('#reason').val();
    if (!reason) {
      showMsg(langData['siteConfig'][27][121]);
      return false;
    }

    if (val == "") {
      showMsg(langData['siteConfig'][20][435]);
      return false;
    }

      t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");
      $.ajax({
        url: "/include/ajax.php",
        data: {"service": "member", "action": "extract", "amount": amount, "title": reason, "note": val},
        type: "POST",
        dataType: "json",
        success: function (data) {
          if(data.state == 100){
            alert(data.info);
            setTimeout(function(){
                location.href = promotion;
            }, 1000);
          }else{
            alert(data.info);
            t.removeClass("disabled").html(langData['siteConfig'][19][674]);
          }
        },
        error: function(){
          alert(langData['siteConfig'][20][183]);
          t.removeClass("disabled").html(langData['siteConfig'][19][674]);
        }
      });
    
  })

})

// 错误提示
function showMsg(str){
  var o = $(".error");
  o.html('<p>'+str+'</p>').show();
  setTimeout(function(){o.hide()},1000);
}
