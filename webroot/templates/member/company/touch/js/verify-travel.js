$(function(){
    var userAgent1 = navigator.userAgent;

    if (userAgent1.indexOf('huoniao') > -1){
      $('.comment-count .comment_h5').show();
        $(".scan").show();
      $("body").delegate(".scan", "click", function(){
      	setupWebViewJavascriptBridge(function(bridge) {
        	bridge.callHandler("QRCodeScan", {}, function callback(DataInfo){
        	});
      	});
    });
    }else {
    	//微信端
	  	if(navigator.userAgent.toLowerCase().match(/micromessenger/) && navigator.userAgent.toLowerCase().match(/iphone|android/)){
	  		$('.comment-count .comment_h5').show();
      	$(".scan").show();

	  		$("body").delegate(".scan", "click", function(){
	  			var no = parseInt($('#count').val());
	  			$('#count').val(++no);
	      	wx.scanQRCode({
	          // 默认为0，扫描结果由微信处理，1则直接返回扫描结果
	          needResult : 0,
	          desc : 'scanQRCode desc',
	          success : function(res) {
	          },
	          fail: function(err){
	          }
	      	});
	      })
  		}
    }

  // 新增密码框
  var newPasswdHtml = '<div class="inptitbox"><p>'+langData['siteConfig'][5][0]+' <span class="tip-inline"></span><a href="javascript:;" class="remove">×</a></p><div class="inptitle"><input type="number" placeholder="'+langData['travel'][13][53].replace('1', '12')+'" maxlength="12" name="title" value=""></div></div>';
  $(".addbtn").bind("click", function(){
		$('.pswbox').append(newPasswdHtml);
  });

  // 移除密码框
  $(".pswbox").delegate(".remove", "click", function(){
  	$(this).closest(".inptitbox").remove();
  })


  //验证
	$("#fabuForm").delegate("input", "blur", function(){
		var t = $(this), val = t.val().replace(/\s+/g, ""), dl = t.closest(".inptitbox"), hline = dl.find(".tip-inline");
		if(!isNaN(val) && val != "" && val.length == 12){
			hline.html(langData['siteConfig'][7][6]+"...");

			$.ajax({
				url: verify,
				type: "POST",
				data: "code="+val,
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
						hline.removeClass().addClass("tip-inline success").html(data.info);
					}else{
						hline.removeClass().addClass("tip-inline error").html(data.info);
					}
				},
				error: function(){
					hline.removeClass().addClass("tip-inline error").html(langData['siteConfig'][20][183]);
				}
			});

			return false;
		}else if(val != ""){
			hline.removeClass().addClass("tip-inline error").html(langData['travel'][13][53].replace('1', '12'));
			return false;
		}

	});


  //提交消费
	$("#tj").bind("click", function(event){
		event.preventDefault();
		var t = $(this), codes = [];
		$("#fabuForm input").each(function(){
			var val = $(this).val().replace(/\s+/g, "");
			if(!isNaN(val) && val != "" && val.length == 12){
				codes.push(val);
			}
		});
		if(codes.length > 0){

			t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");
			$.ajax({
				url: action,
				type: "POST",
				data: "codes="+codes,
				dataType: "json",
				success: function (data) {

					if(data && data.state == 100){
            alert(data.info);
						location.reload();
					}else{
						showMsg(data.info);
						t.attr("disabled", false).html(langData['siteConfig'][19][551]);
					}

				},
				error: function(){
					t.attr("disabled", false).html(langData['siteConfig'][19][551]);
					showMsg(langData['siteConfig'][20][183]);
				}
			});

		}else{
			showMsg(langData['siteConfig'][20][390]);
		}
	});


})

// 错误提示
function showMsg(str){
  var o = $(".fixerror");
  o.html('<p>'+str+'</p>').show();
  setTimeout(function(){o.hide()},1000);
}
