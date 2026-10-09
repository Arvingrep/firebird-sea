$(function(){
	
	//提交验证
	$("#btnSubmit").bind("click", function(){
		
		var phone = $("#phone"),
			content = $("#content");
			
		if($.trim(phone.val()) == ""){
			$.dialog.alert("请输入手机号码！");
			return false;
		}
		
		if($.trim(content.val()) == ""){
			$.dialog.alert("请输入短信内容！");
			return false;
		}
		
		$(this).attr("disabled", true).html("正在发送...");
		huoniao.operaJson("smsSend.php?action=send", $("#editform").serialize()+"&submit=提交", function(data){
			if(data.state == 100){
				huoniao.goTop();
				$.dialog({
					title: "发送成功",
					icon: 'success.png',
					content: data.info,
					ok: function(){
						location.reload();
					}
				});
			}else{
				$.dialog.alert(data.info);
				$("#btnSubmit").attr("disabled", false).html("确认发送");
			}
		});
	});
	
});