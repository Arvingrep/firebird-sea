//实例化编辑器
var ue = UE.getEditor('body');

$(function () {
	
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
	
	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
			title        = $("#title");
		
		//标题
		if(!huoniao.regex(title)){
			huoniao.goTop();
			return false;
		};
		
		ue.sync();
		
		t.attr("disabled", true);
		
		$.ajax({
			type: "POST",
			url: "siteSingel.php?dopost="+$("#dopost").val()+"&action="+action,
			data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					ue.execCommand('cleardoc');
					if($("#dopost").val() == "Add"){
						huoniao.goTop();
						$.dialog({
							fixed: true,
							title: "添加成功",
							icon: 'success.png',
							content: "添加成功！",
							ok: function(){
								location.reload();
							},
							cancel: false
						});
						
					}else{
						$.dialog({
							fixed: true,
							title: "修改成功",
							icon: 'success.png',
							content: "修改成功！",
							ok: function(){
								try{
									$("body",parent.document).find("#nav-siteSingelphpaction"+action).click();
									//parent.reloadPage($("body",parent.document).find("#body-siteSingelphpaction"+action)[0].contentWindow);
									parent.reloadPage($("body",parent.document).find("#body-siteSingelphpaction"+action));
									$("body",parent.document).find("#nav-siteSingelEdit"+id+" s").click();
								}catch(e){
									location.href = thisPath + "siteSingel.php?action="+action;
								}
							},
							cancel: false
						});
					}
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
	
	//页面刷新前提示
	window.onbeforeunload = function() {
		if (ue.hasContents()) {
			return "您正在编辑的文章没有保存，离开会导致内容丢失，是否确定离开？";
		}
	}

	
});