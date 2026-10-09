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
  var newPasswdHtml = '<div class="inptitbox fn-clear"><div class="inptitle"><input type="tel" placeholder="'+langData['siteConfig'][20][14].replace('1', '12')+'" maxlength="12" name="title" value=""></div><a href="javascript:;" class="remove"></a><p class="tip-inline"></p></div>';
  $(".addbtn").bind("click", function(){
		$('.pswbox').append(newPasswdHtml);
		$('.pswbox .inptitbox:last-child input').focus();
  });

  // 移除密码框
  $(".pswbox").delegate(".remove", "click", function(){
  	$(this).closest(".inptitbox").remove();
  })


  //验证
	$("#fabuForm").delegate("input", "blur", function(){
		var t = $(this), val = t.val().replace(/\s+/g, ""), dl = t.closest(".inptitbox"), hline = dl.find(".tip-inline");
		if(!dl.hasClass('hasuc')){
			if(!isNaN(val) && val != "" && val.length == 12){
				$.ajax({
					url: verify,
					type: "POST",
					data: "code="+val,
					dataType: "json",
					success: function (data) {
						if(data && data.state == 100){
							dl.removeClass('hasuc nocode').addClass('succode');
							hline.removeClass().addClass("tip-inline success").html('').hide();
						}else{
							dl.removeClass('succode hasuc').addClass('nocode');
							hline.removeClass().addClass("tip-inline error").html(data.info).show();
						}
					},
					error: function(){
						// dl.removeClass('succode hasuc').addClass('nocode');
						showErrALert(langData['siteConfig'][20][183])
						// hline.removeClass().addClass("tip-inline error").html(langData['siteConfig'][20][183]).show();
					}
				});

				return false;
			}else if(val != ""){
				dl.removeClass('succode hasuc').addClass('nocode');
				// hline.removeClass().addClass("tip-inline error").html(langData['siteConfig'][20][389].replace('1', '12')).show();
				hline.removeClass().addClass("tip-inline error").html('券码由12位数字组成').show();
				return false;
			}
		}

	});

	//我知道了
	$('.sucAlert .suckonw,.xfmask').click(function(){
		$('.xfmask').hide();
        $('.sucAlert').removeClass('sucshow');
	})

  	//提交消费
	$("#tj").bind("click", function(event){
		event.preventDefault();
		
		var sucLen = $("#fabuForm .inptitbox.succode").length;
		var t = $(this), codes = [],flag = 1,btxt = t.text();
		$("#fabuForm input").each(function(){
			var par = $(this).closest('.inptitbox');
			if(!par.hasClass('hasuc')){//已经提交过 消费成功的不提交验证
				var val = $(this).val().replace(/\s+/g, "");
				if(val.length < 12){
					flag = 0
				}
				if(!isNaN(val) && val != "" && val.length == 12){
					par.removeClass('nocode')
					codes.push(val);
				}

			}
			
		});
		if(codes.length > 0){
			var nocodeLen = $("#fabuForm .inptitbox.nocode").length;
			t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");
			$.ajax({
				url: action,
				type: "POST",
				data: "codes="+codes,
				dataType: "json",
				success: function (data) {

					if(data && data.state == 100){
            			$('.xfmask').show();
            			$('.sucAlert').addClass('sucshow');
            			$("#fabuForm .inptitbox.succode .tip-inline").removeClass().addClass("tip-inline success").html('消费成功').show();
            			$("#fabuForm .inptitbox.succode").addClass('hasuc');
            			$("#fabuForm .inptitbox.hasuc input").attr('readonly',true);
            			if(nocodeLen > 0){
            				$('.suctip').html((sucLen ? sucLen+'张券码验证成功，' : '') + (nocodeLen ? '<span>'+nocodeLen+'张券码验证失败</span>' : ''));
            			}else{
            				$('.suctip').html(sucLen ? sucLen+'张券码验证成功' : '');
            			}
            			t.attr("disabled", false).html('继续核销');
					}else{
						showMsg(data.info);
						t.attr("disabled", false).html(btxt);
					}

				},
				error: function(){
					t.attr("disabled", false).html(btxt);
					showMsg(langData['siteConfig'][20][183]);
				}
			});

		}else{
			if(flag){
				showMsg(langData['siteConfig'][20][390]);
			}else{
				showMsg('请输入正确的团购券');
			}
			
		}
	});


})

// 错误提示
function showMsg(str){
  var o = $(".fixerror");
  o.html('<p>'+str+'</p>').show();
  setTimeout(function(){o.hide()},1000);
}
