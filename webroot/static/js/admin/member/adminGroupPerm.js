$(function(){
	
	var more = "", id = "";
	
	//全选（所有操作权限）
	$("#founder").bind("click", function(){
		if($(this).is(":checked")){
			$(".thead, .menu-list, #popupPerm, .adminIndex").find("input[type='checkbox']").attr("checked", true);
		}else{
			$(".thead, .menu-list, #popupPerm, .adminIndex").find("input[type='checkbox']").attr("checked", false);
		}
	});
	
	//模块全选
	$("input[name='moduleAll']").bind("click", function(){
		var next = $(this).parent().parent().next(".menu-list").find("input[type='checkbox']");
		if($(this).is(":checked")){
			next.attr("checked", true);
		}else{
			next.attr("checked", false);
			$("#founder").attr("checked", false);
		}
	});
	
	//dt全选dd
	$("input[name='checkDt']").bind("click", function(){
		var next = $(this).parent().parent().next("dd").find("input[type='checkbox']"),
			parent = $(this).parent().parent().parent().parent();
		if($(this).is(":checked")){
			next.attr("checked", true);
		}else{
			next.attr("checked", false);
			$("#founder").attr("checked", false);
		}
		
		if(parent.attr("class") != "menu-list"){
			
			allLength = parent.find("input[name='purviews']").length;
			checkedLength = parent.find("input[name='purviews']:checked").length;
			if(allLength == checkedLength){
				parent.prev("dt").find("input[name='checkDt']").attr("checked", true);
			}else{
				parent.prev("dt").find("input[name='checkDt']").attr("checked", false);
				$("#founder").attr("checked", false);
			}
			
			parent = parent.parent().parent();
			
		}
		
		allLength = parent.find("input[name='purviews']").length;
		checkedLength = parent.find("input[name='purviews']:checked").length;
		
		if(allLength == checkedLength){
			parent.prev(".thead").find("input[name='moduleAll']").attr("checked", true);
		}else{
			parent.prev(".thead").find("input[name='moduleAll']").attr("checked", false);
			$("#founder").attr("checked", false);
		}
		
	});
	
	//单个复选框点击
	$("input[name='purviews']").bind("click", function(){
		var t = $(this),
			parent = t.parent().parent().parent();
			allLength = parent.find("input[name='purviews']").length;
			checkedLength = parent.find("input[name='purviews']:checked").length;
		
		//一级
		if(allLength == checkedLength){
			parent.prev("dt").find("input[name='checkDt']").attr("checked", true);
		}else{
			parent.prev("dt").find("input[name='checkDt']").attr("checked", false);
			$("#founder").attr("checked", false);
		}
		
		//二级
		parent = parent.parent().parent();
		if(parent.attr("class") != "menu-list"){
			allLength = parent.find("input[name='purviews']").length;
			checkedLength = parent.find("input[name='purviews']:checked").length;
			
			if(allLength == checkedLength){
				parent.prev("dt").find("input[name='checkDt']").attr("checked", true);
			}else{
				parent.prev("dt").find("input[name='checkDt']").attr("checked", false);
				$("#founder").attr("checked", false);
			}
			
			//三级
			parent = parent.parent().parent();
			if(parent.attr("class") == "menu-list"){
				
				//浮动层
				if(t.parent().siblings(".sub").html() != undefined){
					if(t.is(":checked")){
						t.parent().siblings(".sub").find("input[type='checkbox']").attr("checked", true);
					}else{
						t.parent().siblings(".sub").find("input[type='checkbox']").attr("checked", false);
					}
				}
				
				allLength = parent.find("input[name='purviews']").length;
				checkedLength = parent.find("input[name='purviews']:checked").length;
				
				if(allLength == checkedLength){
					parent.prev(".thead").find("input[name='moduleAll']").attr("checked", true);
					parent.find("input[type=checkbox]").attr("checked", true);
				}else{
					parent.prev(".thead").find("input[name='moduleAll']").attr("checked", false);
					$("#founder").attr("checked", false);
				}
			}
			
		}else{
			
			//浮动层
			if(t.parent().siblings(".sub").html() != undefined){
				if(t.is(":checked")){
					t.parent().siblings(".sub").find("input[type='checkbox']").attr("checked", true);
				}else{
					t.parent().siblings(".sub").find("input[type='checkbox']").attr("checked", false);
				}
			}
			
			allLength = parent.find("input[name='purviews']").length;
			checkedLength = parent.find("input[name='purviews']:checked").length;
			
			if(allLength == checkedLength){
				parent.prev(".thead").find("input[name='moduleAll']").attr("checked", true);
				parent.find("input[type=checkbox]").attr("checked", true);
			}else{
				parent.prev(".thead").find("input[name='moduleAll']").attr("checked", false);
				$("#founder").attr("checked", false);
			}
		}
	});
	
	//初始加载，如果子级全部选中，则父级也选中
	$(".menu-list dd").each(function(index, element) {
        var allLength = $(this).find("input[name='purviews']").length,
			checkLength = $(this).find("input[name='purviews']:checked").length;
		if(allLength == checkLength){
			$(this).prev("dt").find("input[name='checkDt']").attr("checked", true);
		}
    });
	
	$(".menu-list").each(function(index, element) {
        var allLength = $(this).find("input[name='purviews']").length,
			checkLength = $(this).find("input[name='purviews']:checked").length;
		if(allLength == checkLength){
			$(this).prev(".thead").find("input[name='moduleAll']").attr("checked", true);
		}
    });
	
	//更多选项
	$(".more").bind("click", function(){
		more = $(this);
		var obj = "popupPerm", inner = $(this).next(".sub").html(), pos = $(this).parent().position();
		if($("#"+obj).html() != undefined && $("#"+obj).is(":visible") && id == $(this).attr("data-id")){
			$("#"+obj).find("input[name='purviews']").each(function(index, element) {
            	var val = $(this).val(), checked = $(this).is(":checked");
				more.next(".sub").find("input[name='purviews']").each(function(index, element) {
					if($(this).val() == val){
						checked ? $(this).attr("checked", true) : $(this).attr("checked", false);
					}
				});
            });
			$("#"+obj).stop(true, true).hide(200).html("");
		}else{
			$("#"+obj).hide();
			if($("#"+obj).html() == undefined){
				$("#editform").append('<div id="'+obj+'" class="dropdown-menu"></div>');
			}
			$("#"+obj)
				.html(inner)
				.css({"left": pos.left-2, "top": pos.top+30})
				.stop(true, true)
				.show(300);
		}
		id = $(this).attr("data-id");
		return false;
	});
	
	//浮动权限展开更多
	$(".more_").live("click", function(){
		var ul = $(this).next("ul");
		ul.stop(true, true).slideToggle("fast");
	});
	
	//浮动权限父级关联子级
	$("#popupPerm input[name='purviews']").live("click", function(){
		if($(this).is(":checked")){
			more.prev("label").find("input[name='purviews']").attr("checked", true);
		}
		
		//一级有子级
		var ul = $(this).parent().siblings("ul");
		if(ul.html() != undefined){
			if($(this).is(":checked")){
				ul.find("input[name='purviews']").attr("checked", true);
			}else{
				ul.find("input[name='purviews']").attr("checked", false);
			}
		}
		
		//三级点击则自动选中父级以及所属栏目
		var three = $(this).parent().parent().parent();
		if(three.siblings("label").html() != undefined){
			if($(this).is(":checked")){
				three.siblings("label").find("input[name='purviews']").attr("checked", true);
			}else{
				var checkLength = three.find("input[name='purviews']:checked").length;
				if(checkLength <= 0){
					three.siblings("label").find("input[name='purviews']").attr("checked", false);
				}
			}
		};
		
		var checkLength = $("#popupPerm").find("input[name='purviews']:checked").length;
		if(checkLength <= 0){
			more.prev("label").find("input[name='purviews']").attr("checked", false);
		}
		
	});
	
	//点击空白处隐藏浮动层，并把已操作的状态赋给所选的目录
	$(document).click(function (e) {
		var s = e.target;
		if ($("#popupPerm").html() != undefined) {
			if (!jQuery.contains($("#popupPerm").get(0), s)) {
				if (jQuery.inArray(s, $("#popupPerm ul")) < 0) {
					$("#popupPerm").find("input[name='purviews']").each(function(index, element) {
						var val = $(this).val(), checked = $(this).is(":checked");
						more.next(".sub").find("input[name='purviews']").each(function(index, element) {
							if($(this).val() == val){
								checked ? $(this).attr("checked", true) : $(this).attr("checked", false);
							}
						});
					});
					$("#popupPerm").stop(true, true).hide(200).html("");
				}
			}
		}
	});
	
	//提交
	$("#saveBtn").bind("click", function(){
		var t = $(this);
		if($("input[name='purviews']:checked").length <= 0){
			$.dialog.alert("请选择要设置的权限！");
		}else{
			t.attr("disabled", true);
			
			var purviews = [];
			if($("#founder").is(":checked")){
				purviews.push($("#founder").val());
			}else{
				$("input[name='purviews']:checked").each(function(index, element) {
					purviews.push($(this).val());
				});
			}
			
			huoniao.showTip("loading", "正在提交，请稍候...");
			huoniao.operaJson("adminGroup.php?action=perm&id="+$("#id").val(), "dopost=updatePerm&purviews="+purviews.join(",")+"&token="+$("#token").val(), function(data){
				t.attr("disabled", false);
				if(data.state == 100){
					huoniao.showTip("success", data.info, "auto");
				}else{
					huoniao.showTip("error", data.info);
				}
			});
		}
	});
	
});