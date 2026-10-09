$(function(){


	$("input[name=userType]").bind("click", function(){
		var val = $(this).val();
		if(val == 4){
			$("#userIds").show();
		}else{
			$("#userIds").hide();
		}
		if(val == 5){
			$('.mtype').hide();
		}else{
			$('.mtype').show();
		}
		if(val == 6){
			$('.mtype1').hide();
            $('.mtype2').show();
		}else if(val != 5){
			$('.mtype1').show();
            $('.mtype2').hide();

            var type = $("input[name=type]:checked").val();
            if(type == 4){
                $(".mtype2").show();
            }else{
                $(".mtype2").hide();
            }
		}
	});

    $("input[name=type]").bind("click", function(){
		var val = $(this).val();
		if(val == 4){
			$(".mtype2").show();
		}else{
			$(".mtype2").hide();
		}
	});


	//保存
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t = $(this),
				userType = $("input[name=userType]:checked").val(),
				users = $("#users").val(),
				title = $("#title").val(),
				body = $("#body").val();

		if(userType == 4 && users == ""){
			$.dialog.alert("请填写会员名");
			return false;
		}

		if(title == ""){
			$.dialog.alert("请输入标题");
			return false;
		}

		if(body == ""){
			$.dialog.alert("请输入内容");
			return false;
		}

		t.attr("disabled", true).html("发送中，请稍候...");
		huoniao.operaJson("memberLetter.php?dopost=add", $("#editform").serialize() + "&submit=" + encodeURI("提交"), function(data){
			if(data.state == 100){

					$.dialog({
						fixed: true,
						title: "发送成功",
						icon: 'success.png',
						content: data.info,
						ok: function(){
							window.location.reload();
						},
						cancel: false
					});

			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false).html("重新发送");
			};
		}, function(){
			$.dialog.alert("网络错误，请刷新页面重试！");
			t.attr("disabled", false).html("重新发送");
		});
	});

});
