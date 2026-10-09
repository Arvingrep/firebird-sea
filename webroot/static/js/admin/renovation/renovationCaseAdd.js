var uploadCustom = {
	//旋转图集文件
	rotateAtlasPic: function(mod, direction, img, c) {
		var g = {
			mod: mod,
			type: "rotateAtlas",
			direction: direction,
			picpath: img,
			randoms: Math.random()
		};
		$.ajax({
			type: "POST",
			cache: false,
			async: false,
			url: "/include/upload.inc.php",
			dataType: "json",
			data: $.param(g),
			success: function(a) {
				try {
					c(a)
				} catch(b) {}
			}
		});
	}
}

$(function(){

	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	//类别切换
	$("input[name=type]").bind("click", function(){
		var val = $(this).val(), obj = $(".jiastyle"), obj1 = $(".comstyle");
		if(val == 0){
			obj.show();
			obj1.hide();
		}else if(val == 1){
			obj.hide();
			obj1.show();
		}
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

	$("#editform").delegate("select", "change", function(){
		if($(this).parent().siblings(".input-tips").html() != undefined){
			if($(this).val() == 0){
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}
	});

	//模糊匹配公司
	$("#company").bind("input", function(){
		$("#companyid").val("0");
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkRenovationCompany", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#companyList").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'">'+data[i].company+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#companyList")
						.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#companyList").html("").hide();
				}
			});
	
		}else{
			$("#companyList").html("").hide();
		}
    });
	
	$("#companyList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id");
		$("#company").val(name);
		$("#companyid").val(id);
		$("#companyList").html("").hide();
		checkRc($("#company"), name, $("#id").val());
		return false;
	});
	
	$(document).click(function (e) {
    	var s = e.target;
	    if (!jQuery.contains($("#companyList").get(0), s)) {
		        if (jQuery.inArray(s.id, "company") < 0) {
		            $("#companyList").hide();
		        }
        }
    });
	
	$("#company").bind("blur", function(){
		var t = $(this), val = t.val(), id = $("#id").val();
		if(val != ""){
			checkRc(t, val, id);
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请输入所属公司');
		}
	});

	function checkRc(t, val, id){
		var flag = false;
		t.addClass("input-loading");
		huoniao.operaJson("../inc/json.php?action=checkTeamCompany&type=renovation", "key="+val+"&id="+id, function(data){
			t.removeClass("input-loading");
			if(data == 200){
				t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>公司不存在，请重新选择！');
			}else{
				if(data) {
					for(var i = 0; i < data.length; i++){
						if(data[i].company == val){
							flag = true;
							$("#companyid").val(data[i].id);
						}
					}
				}
				if(flag){
					t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>请从列表中选择公司名');
				}else{
					t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>公司不存在，请确认后再添加！');
				}
			}
		});
	}

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
			litpic       = $("#litpic").val(),
			designer     = $("#designer").val(),
			designername = $("#designername").val(),
			weight       = $("#weight");

		if(!huoniao.regex(title)){
			huoniao.goInput(title);
			return false;
		};

		if(litpic == ""){
			huoniao.goInput($("#litpic"));
			$.dialog.alert("请上传代表图片！");
			return false;
		};

		if(designername == "" || designer == 0){
			huoniao.goInput($("#designername"));
			$("#designername").siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请输入此效果图的作者');
			return false;
		}

		if(!huoniao.regex(weight)){
			return false;
		}

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("renovationCaseAdd.php", $("#editform").serialize() + "&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){

					huoniao.parentTip("success", "发布成功！");
					huoniao.goTop();
					window.location.reload();

				}else{

					huoniao.parentTip("success", "修改成功！");
					t.attr("disabled", false);

				}
			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false);
			};
		});
	});

});
