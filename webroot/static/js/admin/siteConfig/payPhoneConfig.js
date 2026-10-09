$(function(){

    //分站管理
	$('#siteCity').bind('click', function(){
		var href = $(this).attr("href");
	  	try {
	  		event.preventDefault();
	  		parent.$(".h-nav a").each(function(index, element) {
	        	if($(this).attr("href") == href){
	  				parent.$(this).click();
	  				return false;
	  			}
	  		});
	  	} catch(e) {}
	});

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

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();

		//异步提交
		var post = $("#editform").find("input, select, textarea").serialize();
		huoniao.operaJson("payPhoneConfig.php", post + "&token="+$("#token").val(), function(data){
			var state = "success";
			if(data.state != 100){
				state = "error";
			}
			huoniao.showTip(state, data.info, "auto");
		});
	});

});
