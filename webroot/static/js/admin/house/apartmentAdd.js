$(function(){

	huoniao.parentHideTip();

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
			if($(this).val() == 0){
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}
	});

	//搜索回车提交
    $("#editform input").keyup(function (e) {
        if (!e) {
            var e = window.event;
        }
        if (e.keyCode) {
            code = e.keyCode;
        }
        else if (e.which) {
            code = e.which;
        }
        if (code === 13) {
            $("#btnSubmit").click();
        }
    });

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
			title        = $("#title"),
			litpic       = $("#litpic").val();

		if(!huoniao.regex(title)){
			huoniao.goTop();
			return false;
		};

		if($.trim(litpic) == ""){
			$.dialog.alert("请上传户型缩略图");
			return false;
		}

		var picList = [], imgli = $("#listSection2 li");
		if(imgli.length > 0){
			for(var i = 0; i < imgli.length; i++){
				var imgsrc = $("#listSection2 li:eq("+i+")").find(".li-thumb img").attr("data-val"), imgdes = $("#listSection2 li:eq("+i+")").find(".li-desc").val();
				picList.push(imgsrc+"|"+imgdes);
			}
		}

		if(imgli.length == 0){
			$.dialog.alert("请上传户型图");
			return false;
		}

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("apartmentAdd.php", $("#editform").serialize() + "&imglist="+picList.join(",")+"&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){
					huoniao.parentTip("success", "户型添加成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					huoniao.goTop();
					location.reload();
				}else{
					huoniao.parentTip("success", "户型修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					t.attr("disabled", false);
				}
			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false);
			};
		});
	});

	//图集排序
	// $(".list-holder ul").dragsort({ dragSelector: "li", placeHolderTemplate: '<li class="holder"></li>' });

});
