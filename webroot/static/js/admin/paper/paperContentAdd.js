//实例化编辑器
var ue = UE.getEditor('body');

$(function(){

	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var x = parseInt($("#xAxis").val()),
		y = parseInt($("#yAxis").val()),
		width = parseInt($("#width").val()),
		height = parseInt($("#height").val());

	if(width != 0 && height != 0){
		var api = $.Jcrop("#coor",{
			setSelect: [x,y,width+x,height+y] //setSelect是Jcrop插件内部已定义的运动方法
		});
	}

	$("#coor").Jcrop({
		onChange:showCoords,
		onSelect:showCoords
	});
	//简单的事件处理程序，响应自onChange,onSelect事件，按照上面的Jcrop调用
	function showCoords(obj){
		$("#xAxis").val(obj.x);
		$("#yAxis").val(obj.y);
		$("#width").val(obj.w);
		$("#height").val(obj.h);
	}

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
			width        = $("#width").val(),
			height       = $("#height").val(),
			weight       = $("#weight");

		if(!huoniao.regex(title)){
			huoniao.goInput(title);
			return false;
		};

		if((width == "" || width == 0) || (height == "" || height == 0)){
			$.dialog.alert("请选择内容所在图片区域！");
			return false;
		}

		ue.sync();


		if(ue.getContent() == ""){
			$.dialog.alert("请输入内容！");
			return false;
		};

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("paperContentAdd.php?forum="+forum, $("#editform").serialize() + "&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){

					huoniao.parentTip("success", "信息发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					huoniao.goTop();
					location.reload();

				}else{

					huoniao.parentTip("success", "信息修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					t.attr("disabled", false);

				}
			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false);
			};
		});
	});

});
