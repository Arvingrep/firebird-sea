$(function(){

	//申请退款
	$(".refundApply").bind("click", function(){
		$(".refundCon").toggle();
	});

	//平台介入
	$(".platformApply").bind("click", function(){
		$(".platformCon").toggle();
	});

	$(".huifu").bind("click", function(){
		$(".tuikuanblock").toggle();
	});


	//字数限制
	var commonChange = function(t){
		var val = t.val(), maxLength = 500, tip = $(".lim-count");
		var charLength = val.replace(/<[^>]*>|\s/g, "").replace(/&\w{2,4};/g, "a").length;
		var surp = maxLength - charLength;
		surp = surp <= 0 ? 0 : surp;
		var txt = langData['siteConfig'][23][63].replace('1', '<strong>' + surp + '</strong>');  //还可输入 1 个字。
		tip.html(txt);

		if(surp <= 0){
			t.val(val.substr(0, maxLength));
		}
	}

	$("#content").focus(function(){
		commonChange($(this));
	});
	$("#content").keyup(function(){
		commonChange($(this));
	});
	$("#content").keydown(function(){
		commonChange($(this));
	});
	$("#content").bind("paste", function(){
		commonChange($(this));
	});

	$("#ret-note").focus(function(){
		commonChange($(this));
	});
	$("#ret-note").keyup(function(){
		commonChange($(this));
	});
	$("#ret-note").keydown(function(){
		commonChange($(this));
	});
	$("#ret-note").bind("paste", function(){
		commonChange($(this));
	});



	//提交申请
	$("#refundBtn").bind("click", function(){
		var t      = $(this),
				type   = $("#type").val(),
				content = $("#content").val();

		if(type == 0 || type == ""){
			alert(langData['siteConfig'][55][58]);//请选择退款原因！
			return;
		}

		if(content == "" || content.length < 15){
			// alert(langData['siteConfig'][20][195]);  //说明内容至少15个字！
			// return;
		}

		var pics = [];
		$("#listSection1 li").each(function(){
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

		t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");  //提交中

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=travel&action=refund",
			data: data,
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					// alert("提交成功，请耐心等待申请结果！");
					location.reload();
				}else{
					alert(data.info);
					t.attr("disabled", false).html(langData['siteConfig'][6][118]);//重新提交
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
				t.attr("disabled", false).html(langData['siteConfig'][6][118]);//重新提交
			}
		});
	});

	//申请平台介入
	$("#platformBtn").bind("click", function(){
		var t      = $(this),
		    type   = $("#applytype").val(),
			retnote = $("#ret-note").val();

		if(type == 0 || type == ""){
			alert(langData['siteConfig'][55][57]);//请选择申请原因！
			return;
		}

		if(retnote == "" || retnote.length < 15){
			$.dialog.alert(langData['siteConfig'][20][408]);
			return;
		}

		var pics = [];
		$("#listSection2 li").each(function(){
			var val = $(this).find("img").attr("data-val");
			if(val != ""){
				pics.push(val);
			}
		});

		var data = {
			id: id,
			type: type,
							pics: pics.join(","),
			content: retnote,
			kefu : 1
		}

		t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=travel&action=refund",
			data: data,
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					$.dialog({
						fixed: true,
						title: langData['siteConfig'][21][147],
						icon: 'success.png',
						content: data.info,
						ok: function(){
							location.reload();
						},
						cancel: false
					});
				}else{
					$.dialog.alert(data.info);
					t.attr("disabled", false).html(langData['siteConfig'][6][0]);
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.attr("disabled", false).html(langData['siteConfig'][6][0]);
			}
		});
	});


});
