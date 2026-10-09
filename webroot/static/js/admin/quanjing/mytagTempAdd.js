$(function () {

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	//配置代码切换
	$('#codeTab a').click(function (e) {
		e.preventDefault();
		var obj = $(this).attr("href").replace("#", "");
		if(!$(this).parent().hasClass("active")){
			$("#codeTab li").removeClass("active");
			$(this).parent().addClass("active");

			$("#codeTab").parent().find("div").hide();
			$("#"+obj).show();
		}
	})

	//swfupload s
	var thumbnail;
	
	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t = $(this);
		id = $("#id").val();
		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "mytagTemp.php?action="+module,
			data: $(this).parents("form").serialize()+"&submit=" + encodeURI("提交"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					if($("#dopost").val() == "save"){
						$.dialog({
							fixed: true,
							title: "添加成功",
							icon: 'success.png',
							content: "添加成功！",
							ok: function(){
								huoniao.goTop();
								window.location.reload();
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
									$("body",parent.document).find("#nav-mytagTemp"+module).click();
									parent.reloadPage($("body",parent.document).find("#body-mytagTemp"+module));
									$("body",parent.document).find("#nav-editmytagTemp"+module+id+" s").click();
								}catch(e){
									location.href = thisPath + "mytagTemp.php?action="+module;
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

});
