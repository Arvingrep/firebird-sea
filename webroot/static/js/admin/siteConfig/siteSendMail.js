$(function(){
	
	//提交验证
	$("#btnSubmit").bind("click", function(){
		
		var address = $("#address"),
			title   = $("#title"),
			content = $("#content");
			
		if($.trim(address.val()) == ""){
			$.dialog.alert("请输入收件人E-mail地址！");
			return false;
		}
		
		if($.trim(title.val()) == ""){
			$.dialog.alert("请输入邮件主题！");
			return false;
		}
		
		if($.trim(content.val()) == ""){
			$.dialog.alert("请输入邮件内容！");
			return false;
		}
		
		$(this).attr("disabled", true).html("正在发送...");
		huoniao.operaJson("siteSendMail.php?action=send", $("#editform").serialize()+"&submit=提交", function(data){
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