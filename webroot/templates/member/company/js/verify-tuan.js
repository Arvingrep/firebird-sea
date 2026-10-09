$(function(){

	//新增密码框
	var newPasswdHtml = '<dl class="fn-clear" data-required="1"><dt><span>*</span>'+langData['siteConfig'][5][0]+'：</dt><dd><input type="text" name="passwd[]" class="inp" maxlength="14" data-title="'+langData['siteConfig'][27][74]+'" /><a href="javascript:;" class="clear" title="'+langData['siteConfig'][6][162]+'"><s></s></a><span class="tip-inline"></span></dd></dl>';
	$("#addPasswd").bind("click", function(){
		var t = $(this).closest("dl");
		t.before(newPasswdHtml);
		$('#fabuForm input').inputFormat('account');
	});

	//自动分组
	$("#fabuForm input").inputFormat('account');

	//验证
	$("#fabuForm").delegate("input", "blur", function(){
		var t = $(this), val = t.val().replace(/\s+/g, ""), dl = t.closest("dl"), hline = t.siblings(".tip-inline"), cbtn = t.siblings(".clear");
		if(!isNaN(val) && val != "" && val.length == 12){
			t.attr("disabled", true);
			cbtn.hide();
			hline.removeClass().addClass("tip-inline loading").html("<s></s>"+langData['siteConfig'][7][6]);

			$.ajax({
				url: verify,
				type: "POST",
				data: "code="+val,
				dataType: "json",
				success: function (data) {
					cbtn.show();
					if(data && data.state == 100){
						hline.removeClass().addClass("tip-inline success").html("<s></s>"+data.info);
					}else{
						hline.removeClass().addClass("tip-inline error").html("<s></s>"+data.info);
						t.attr("disabled", false);
					}
				},
				error: function(){
					cbtn.show();
					t.attr("disabled", false);
					hline.removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][183]);
				}
			});

			return false;
		}else if(val != ""){
			cbtn.show();
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][27][126]);

			return false;
		}

	});

	//清空
	$("#fabuForm").delegate(".clear", "click", function(){
		var input = $(this).siblings("input");
		if(input.attr("disabled") != true){
			input.attr("disabled", false).val("").focus();
			$(this).hide();
		}
	});

	//提交消费
	$("#submit").bind("click", function(event){
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
						$.dialog({
							fixed: true,
							title: langData['siteConfig'][20][244],
							icon: 'success.png',
							content: data.info,
							ok: function(){
								location.reload();
							},
							cancel: false
						});
					}else{
						$.dialog.alert(data.info);
						t.attr("disabled", false).html(langData['siteConfig'][19][551]);
					}

				},
				error: function(){
					t.attr("disabled", false).html(langData['siteConfig'][19][551]);
					$.dialog.alert(langData['siteConfig'][20][183]);
				}
			});

		}else{
			$.dialog.alert(langData['siteConfig'][20][390]);
		}
	});

});
