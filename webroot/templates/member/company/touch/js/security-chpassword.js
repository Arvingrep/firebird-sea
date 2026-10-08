$(function(){

  //修改登录密码
  $("#submit").bind("click", function(){
      var old = $("#old"), newest = $("#new"), confirm = $("#confirm"), passwordStrengthDiv = $("#passwordStrengthDiv").attr("class"), btn = $(this);

      if(btn.hasClass('disabled')) return;

      if(old.size() > 0 && old.val() == ""){
        showMsg(langData['siteConfig'][20][240]);
        old.focus();
        return "false";
      }
      if(newest.val() == ""){
        showMsg(langData['siteConfig'][20][84]);
        newest.focus();
        return "false";
      }
      if(passwordStrengthDiv == "" || passwordStrengthDiv == undefined || Number(passwordStrengthDiv.replace("is", "")) < 50){
        showMsg(langData['siteConfig'][20][241]);
        newest.focus();
        return "false";
      }
      if(confirm.val() == ""){
        showMsg(langData['siteConfig'][5][14]);
        confirm.focus();
        return "false";
      }
      if(newest.val() != confirm.val()){
        showMsg(langData['siteConfig'][20][242]);
        confirm.focus();
        return "false";
      }

      var param = "old="+old.val()+"&new="+newest.val()+"&confirm="+confirm.val();
      modifyFun(btn,langData['siteConfig'][6][41],'password',param);

  });

    $(".editForm #new").passwordStrength();

})

function modifyFun(btn, btnstr, type, param){
  var data = param == undefined ? '' : param;
  btn.addClass('disabled').text(langData['siteConfig'][6][35]+'...');
  $.ajax({
    url: masterDomain+"/include/ajax.php?service=member&action=updateAccount&do="+type,
    data: data,
    type: "POST",
    dataType: "jsonp",
    success: function (data) {
      if(data && data.state == 100){
        alert(data.info);
        location.href = pageUrl;
      }else{
        alert(data.info);
        btn.removeClass('disabled').text(btnstr);
      }
    },
    error: function(){
      alert(langData['siteConfig'][20][183]);
      btn.removeClass('disbaled').text(btnstr);
    }
  })
}


// 错误提示
function showMsg(str){
  var o = $(".error");
  o.html('<p>'+str+'</p>').show();
  setTimeout(function(){o.hide()},1000);
}
