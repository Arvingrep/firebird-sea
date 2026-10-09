$(function(){

	var formAction = $("#editform").attr("action");

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();

		//异步提交
		huoniao.operaJson(formAction, $("#editform").serialize(), function(data){
			var state = "success";
			if(data.state != 100){
				state = "error";
			}

			if(data.state == 2001){
				$.dialog.alert(data.info);
			}else{
				huoniao.showTip(state, data.info, "auto");
			}

			if(data.state == 100){
				
			}
		});

	});

});
