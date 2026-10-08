$(function(){

	// 切换平台
	$("[name=platform]").change(function(){
		var platform = $("[name=platform]:checked").val();
		var obj = $('#android_access_id').closest('dl')
					.add($('#android_package_activity').closest('dl'))
					.add($('#business_android_access_id').closest('dl'))
					.add($('#business_android_package_activity').closest('dl'))
					.add($('#peisong_android_access_id').closest('dl'))
					.add($('#peisong_android_package_activity').closest('dl'))
					.add($('#ios_access_id').closest('dl'))
					.add($('#business_ios_access_id').closest('dl'))
					.add($('#peisong_ios_access_id').closest('dl'));
		if(platform == "umeng"){
			obj.hide();
			$('.secret').html(secret[0]);
		}else{
			obj.show();
			$('.secret').html(secret[1]);
		}
	}).change();

	//头部导航切换
	$(".config-nav button").bind("click", function(){
		var index = $(this).index(), type = $(this).attr("data-type");
		if(!$(this).hasClass("active")){
			$(".item").hide();
			$("input[name=configType]").val(type);
			$(".item:eq("+index+")").fadeIn();
		}
	});

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
				parent.getPreviewInfo();
			}
		});

	});

});
