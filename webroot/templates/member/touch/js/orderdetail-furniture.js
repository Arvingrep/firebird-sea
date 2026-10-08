$(function(){
  
	//导航
  $('.header-r .screen').click(function(){
    var nav = $('.nav'), t = $('.nav').css('display') == "none";
    if (t) {nav.show();}else{nav.hide();}
  });

  (function ($) {
   $.getUrlParam = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
   }
  })(jQuery);
   var rates = $.getUrlParam('rates');
   console.log(rates)


   if (rates == 1) {
     $('.layer').addClass('show').css({"left":"0"});
   }

  // 退款
  $('.apply-refund-link').click(function(){
    var t = $(this);
    $('.layer').addClass('show').animate({"left":"0"},100);
  })

  // 隐藏退款
  $('#typeback').click(function(){
    $('.layer').animate({"left":"100%"},100);
    setTimeout(function(){
      $('.layer').removeClass('show');
    }, 100)
  })


  //提交申请
	$("#submit").bind("click", function(){
		var t      = $(this),
			type   = $("#type").val(),
			content = $("#textarea").val();

		if(t.hasClass('disabled')) return;

		if(type == 0 || type == ""){
			alert(langData['siteConfig'][20][194]);//请选择退款原因
			return;
		}

		if(content == "" || content.length < 15){
			alert(langData['siteConfig'][20][195]);//说明内容至少15个字！
			return;
		}

		var pics = [];
		$('#litpic li.item').each(function(){
			var src = $(this).find("img").attr("data-val");
			if(src != ''){
				pics.push(src);
			}
		});

		var data = {
			id: id,
			type: type,
			content: content,
			pics: pics.join(",")
		}

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");//提交中

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=furniture&action=refund",
			data: data,
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					alert(langData['siteConfig'][20][193]);//提交成功，请耐心等待申请结果！
					location.reload();
				}else{
					alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][6][118]);//重新提交
				}
			},
			error: function(){
				alert(langData['siteConfig'][6][203]);//网络错误，请重试！
				t.removeClass("disabled").html(langData['siteConfig'][6][118]);//重新提交
			}
		});
	});



})
