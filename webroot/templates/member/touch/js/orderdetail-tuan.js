$(function(){
	if(orState ==0){
      var nopayTimer = setInterval(function(){
			getnopayDetail()
		},2000)
    }
  	function getnopayDetail(){
		$.ajax({
			type: "GET",
			url: "/include/ajax.php?service=tuan&action=orderDetail&id="+id,
			dataType: "jsonp",
			success: function(data) {
              if(data.state == 100){
                if(data.info.orderstate != '0' ){
                  window.clearInterval(nopayTimer);
                  location.reload();
                }

              }
			}
		});
	}
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
     $('.common').show();
   }

  //  评价
   $('#suggestion').click(function(){
     $('.common').show();
     $(window).scrollTop($(window).height())
   })

  // 退款
  $('.apply-refund-link').click(function(){
    var t = $(this);
    $('.layer').addClass('show').animate({"left":"0"},100);
    $('html').addClass('noscroll');
  })

  // 隐藏退款
  $('#typeback').click(function(){
    $('.layer').animate({"left":"100%"},100);
    setTimeout(function(){
      $('.layer').removeClass('show');
    }, 100)
    $('html').removeClass('noscroll');
  })

	//收货
	$(".sh").bind("click", function(){
		var t = $(this);
		if(t.attr("disabled") == "disabled") return;

		if(confirm(langData['siteConfig'][20][188])){
			t.html(langData['siteConfig'][6][35]+"...").attr("disabled", true);

			$.ajax({
				url: "/include/ajax.php?service=tuan&action=receipt",
				data: "id="+id,
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
						location.reload();

					}else{
						alert(data.info);
						t.attr("disabled", false).html(langData['siteConfig'][6][45]);
					}
				},
				error: function(){
					alert(langData['siteConfig'][20][183]);
					t.attr("disabled", false).html(langData['siteConfig'][6][45]);
				}
			});

		}

	});

  // 店铺评分
  $('.pingfen i').click(function(){
    var t = $(this);
    t.addClass('on');
    t.prevAll().addClass('on');
    t.nextAll().removeClass('on');
  })


  //提交评价
	$("#commonBtn").bind("click", function(){
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
		// if(commentText == "" || commentText.length < 15){
		// 	alert(langData['siteConfig'][20][201]);
		// 	return;
		// }

		var pics = [];
		$("#fileList li.thumbnail").each(function(){
			var val = $(this).find("img").attr("data-url") || $(this).find("img").attr("data-val");
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
			type: 'tuan-order'
		}

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=member&action=sendComment",
			data: data,
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					alert(langData['siteConfig'][20][196]);
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


  //提交申请退款
	$("#submit").bind("click", function(){
		var t       = $(this),
			type    = $("#type").val(),
			content = $("#textarea").val();

		if(t.hasClass('disabled')) return;

		if(type == 0 || type == ""){
			alert(langData['siteConfig'][20][194]);
			return;
		}

		// if(content == "" || content.length < 15){
		// 	alert(langData['siteConfig'][20][195]);
		// 	return;
		// }

		var pics = [];

		$("#litpic li.item").each(function(){
			var val = $(this).find("img").attr("data-val");
			if(val != ""){
				pics.push(val);
			}
		});

		var data = {
			id: id,
			type: type,
			content: content,
			pics: pics.join(",")
		}

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=tuan&action=refund",
			data: data,
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					alert(langData['siteConfig'][20][193]);
					location.reload();
				}else{
					alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][6][118]);
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['siteConfig'][6][118]);
			}
		});
	});


	// 查看券码
	$('.showQrcode').click(function(){
		$('.disk').show();
        $('.tymodal').removeClass('fn-hide');
	})
  	$('.tymodal .close,.disk').click(function(){
        $('.tymodal').addClass('fn-hide');
        $('.disk').hide();
    })
    //抖音小程序
	var isBytemini = device.toLowerCase().includes("toutiaomicroapp");

  	if(isBytemini){
  		$('.shop-pro .imgbox a,.shop-pro .txtbox').click(function(){
  			var thref = $(this).attr('href');
  			var ttid = (thref.split('-')[1]).split('.')[0];
  			tt.miniProgram.navigateTo({url: '/pages/packages/tuan/detail/detail?id=' + ttid});
  		})
  	}

    
})
