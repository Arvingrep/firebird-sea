/**
 * 会员中心交友上传照片
 * by guozi at: 20160612
 */

$(function(){


  //保存
  $("#submit").bind("click", function(){

    var t = $(this);

    if(t.hasClass("disabled")) return false;

    var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			huoniao.login();
			return false;
		}


		var imgval = $("#imglist").val();
		var imgArr = imgval.split(",")
    var imglist = [];
		var imgli = $('#listSection2 li');
		for(var i = 0; i < imgArr.length; i++){
			imglist.push("img[]="+imgArr[i]);
		}

    if(imgli.length == 0){
      $.dialog.alert(langData['siteConfig'][20][301]);   //
      return false;
    }

    t.addClass("disabled").val(langData['siteConfig'][7][9]+"...");  //保存中

    $.ajax({
			url: masterDomain + "/include/ajax.php?service=dating&action=uploadAlbum",
			data: imglist.join("&"),
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
          $.dialog.tips(langData['siteConfig'][6][39], 3, 'success.png');  //保存成功
          setTimeout(function(){
            location.href = url;
          }, 3000);
				}else{
					$.dialog.alert(langData['siteConfig'][20][302]);  //保存失败！
					t.removeClass("disabled").html(langData['siteConfig'][6][27]);  //保存
				}
			},
			error: function(){
        $.dialog.alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
        t.removeClass("disabled").html(langData['siteConfig'][6][27]);//保存
			}
		});

  });

});
