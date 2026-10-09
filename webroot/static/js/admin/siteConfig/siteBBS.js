$(function(){
	
	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" ); 
		thisUPage = tmpUPage[ tmpUPage.length-1 ]; 
		thisPath  = thisURL.split(thisUPage)[0];
		
	//表单验证
	$("#editform").delegate("input,textarea", "focus", function(){
		var tip = $(this).siblings(".input-tips");
		if(tip.html() != undefined){
			tip.removeClass().addClass("input-tips input-focus").attr("style", "display:inline-block");
		}
	});
	
	$("#editform").delegate("input,textarea", "blur", function(){
		var obj = $(this);
		huoniao.regex(obj);
	});
	
	$("#editform").delegate("select", "change", function(){
		if($(this).parent().siblings(".input-tips").html() != undefined){
			if($(this).val() == ""){
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}
	});

	//状态切换
	$("input[name=state]").bind("click", function(){
		if($(this).val() == 1){
			$("#state1").show();
		}else{
			$("#state1").hide();
		}
	});

	//平台切换
	$("input[name=bbs_type]").bind("click", function(){
		var val = $(this).val();
		$(this).closest("#state1").find("div").hide();
		$("#"+val).show();
	});
	
	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t       = $(this),
			bbs_name  = $("#bbs_name"),
			bbs_url   = $("#bbs_url"),
			state     = $("input[name='state']:checked").val();
			bbs_type  = $("input[name='bbs_type']:checked").val();
		
		//名称
		if(!huoniao.regex(bbs_name)){
			huoniao.goInput(bbs_name);
			return false;
		};

		//地址
		if(!huoniao.regex(bbs_url)){
			huoniao.goInput(bbs_url);
			return false;
		};

		//启用状态
		if(state == 1){

			//discuz
			if(bbs_type == "discuz"){
				if($.trim($("#discuz_config").val()) == ""){
					$.dialog.alert("请填写UCenter配置信息！");
					return false;
				}
			}else if(bbs_type == "phpwind"){

			}else{
				$.dialog.alert("请选择需要整合的平台！");
				return false;
			}
		}
		
		t.attr("disabled", true);
		
		$.ajax({
			type: "POST",
			url: "siteBBS.php",
			data: $("#editform").serialize()+"&submit=提交",
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					$.dialog({
						fixed: true,
						title: "配置成功",
						icon: 'success.png',
						content: "配置成功！",
						ok: function(){
							window.location.reload();
						},
						cancel: false
					});
				}else{
					$.dialog.alert(data.info);
					t.attr("disabled", false);
				};
			},
			error: function(msg){
				$.dialog.alert("网络错误，请刷新页面重试！");
				t.attr("disabled", false);
			}
		});
	});
	
});