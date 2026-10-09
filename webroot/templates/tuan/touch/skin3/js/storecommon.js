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

   if (rates == 1) {
     $('.common').show();
   }

  //  评价
   $('#suggestion').click(function(){
     $('.common').show();
   })

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

  // 店铺评分
  $('.pingfen i').click(function(){
    var t = $(this);
    t.addClass('on');
    t.prevAll().addClass('on');
    t.nextAll().removeClass('on');
  })


  //提交评价
	$("#commonBtn").bind("click", function(){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			window.location.href = masterDomain+'/login.html';
			return false;
		}
		var t           = $(this),
			rating      = $("#rating .on").length,
			score1      = $("#score1 .on").length,
			score2      = $("#score2 .on").length,
			score3      = $("#score3 .on").length,
			commentText = $("#commentText").val();

		if(t.hasClass('disabled')) return;

		if(rating == "0"){
			alert(langData['siteConfig'][20][197]);
			return;
		}
		if(score1 == "0"){
			alert(langData['siteConfig'][20][198]);
			return;
		}
		if(score2 == "0"){
			alert(langData['siteConfig'][20][199]);
			return;
		}
		if(score3 == "0"){
			alert(langData['siteConfig'][20][200]);
			return;
		}
		if(commentText == "" || commentText.length < 15){
			alert(langData['siteConfig'][20][201]);
			return;
		}

		var pics = [];
		$("#fileList li.thumbnail").each(function(){
			var val = $(this).find("img").attr("data-url");
			if(val != ""){
				pics.push(val);
			}
		});

		var data = {
			aid: id,
			rating: rating,
			sco1: score1,
			sco2: score2,
			sco3: score3,
			pics: pics.join(","),
			content: commentText,
			type: 'tuan-store'
		}

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=member&action=sendComment",
			data: data,
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					alert('待审核，请稍等！');
					location.href = url;
					t.removeClass("disabled").html(langData['siteConfig'][8][2]);
				}else{
					alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][8][5]);
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);
				t.addClass("disabled").html(langData['siteConfig'][8][5]);
			}
		});


	});

})
