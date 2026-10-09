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

	$('.mask').click(function(){
		$('.bunch-section, .mask').hide();
	})

	$('.mask').on('touchmove', function(){
		$('.bunch-section, .mask').hide();
	})

  if (rates == 1) {
    $('.common').show();
  }

  // 立即发货
  $('.fahuo').click(function(){
    $('.bunch-section, .mask').show();
  })

  // 取消发货
  $('.bunch-section .close, .bunch-section .cancel').click(function(){
    $('.bunch-section, .mask').hide();
    $("#exp-company").val('');
    $("#exp-number").val('');
  })

  //提交快递信息
	$("#expBtn").bind("click", function(){
		var t = $(this),
				company = $("#exp-company"),
				number  = $("#exp-number");

		if($.trim(company.val()) == ""){
			$('.bunch-section .wrong').text(langData['siteConfig'][20][405]);
			return false;
		}

		if($.trim(number.val()) == ""){
			$('.bunch-section .wrong').text(langData['siteConfig'][20][406]);
			return false;
		}

    $('.bunch-section .wrong').text();
		var data = [];
		data.push("id="+detailID);
		data.push("company="+company.val());
		data.push("number="+number.val());

		t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: "/include/ajax.php?service=tuan&action=delivery",
			data: data.join("&"),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					location.reload();
				}else{
					alert(data.info);
					t.attr("disabled", false).html(langData['siteConfig'][6][0]);
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);
				t.attr("disabled", false).html(langData['siteConfig'][6][0]);
			}
		});

	});

  // 回复退款
  $('.huifu').click(function(){
    var t = $(this);
    $('.layer').addClass('show').animate({"left":"0"},100);
  })

  // 隐藏回复
  $('#typeback').click(function(){
    $('.layer').animate({"left":"100%"},100);
    setTimeout(function(){
      $('.layer').removeClass('show');
    }, 100)
  })

	//确定退款
	$(".tuikuan").bind("click", function(){
		var t = $(this);

		if(t.attr("disabled") == "disabled") return;

		if(confirm(langData['siteConfig'][20][407])){
			t.html(langData['siteConfig'][6][35]+"...").attr("disabled", true);

			$.ajax({
				url: "/include/ajax.php?service=tuan&action=refundPay",
				data: "id="+detailID,
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
						location.reload();
					}else{
						alert(data.info);
						t.attr("disabled", false).html(langData['siteConfig'][6][153]);
					}
				},
				error: function(){
					alert(langData['siteConfig'][20][183]);
					t.attr("disabled", false).html(langData['siteConfig'][6][153]);
				}
			});
  	}
  });

  //提交回复
  $("#submit").bind("click", function(){
    var t      = $(this),
        retnote = $("#textarea").val();

    if(retnote == "" || retnote.length < 15){
      alert(langData['siteConfig'][20][408]);
      return;
    }

    var pics = [];
    $("#fileList li").each(function(){
      var val = $(this).find("img").attr("data-val");
      if(val != ""){
        pics.push(val);
      }
    });

    var data = {
      id: detailID,
      pics: pics.join(","),
      content: retnote
    }

    t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");

    $.ajax({
      url: masterDomain+"/include/ajax.php?service=tuan&action=refundReply",
      data: data,
      type: "POST",
      dataType: "jsonp",
      success: function (data) {
        if(data && data.state == 100){
          location.reload();
        }else{
          alert(data.info);
          t.attr("disabled", false).html(langData['siteConfig'][6][0]);
        }
      },
      error: function(){
        alert(langData['siteConfig'][20][183]);
        t.attr("disabled", false).html(langData['siteConfig'][6][0]);
      }
    });
  });




})
