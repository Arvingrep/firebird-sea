$(function(){

	huoniao.parentHideTip();

   //填充分站列表
    huoniao.choseCity($(".choseCity"),$("#cityid"));
    $(".chosen-select").chosen();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	//访问方式
	$("input[name=domaintype]").bind("click", function(){
		var val = $(this).val(), obj = $("#domainObj"), input = $("#domain");
		if(val == 0){
			obj.hide();
		}else if(val == 1){
			input.removeClass().addClass("input-large");
			input.next(".add-on").hide();
			obj.show();
		}else if(val == 2){
			input.removeClass().addClass("input-mini");
			input.next(".add-on").show();
			obj.show();
		}
	});

	//域名过期时间
	$("#domainexp").datetimepicker({format: 'yyyy-mm-dd hh:ii:ss', autoclose: true, language: 'ch'});

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
            cityid       = $("#cityid").val(),
			title        = $("#title"),
			domain       = $("#domain").val(),
			litpic       = $("#litpic"),
			weight       = $("#weight");

        //城市
        if(cityid == '' || cityid == 0){
            $.dialog.alert('请选择城市');
            return false;
        };

		if(!huoniao.regex(title)){
			huoniao.goTop();
			return false;
		};

		if(litpic == ""){
			huoniao.goTop();
			$.dialog.alert("请上传代表图片！");
			return false;
		};

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("paperCompanyAdd.php", $("#editform").serialize() + "&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){

                    huoniao.parentTip("success", "添加成功<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
                    huoniao.goTop();
                    setTimeout(function(){
                        window.location.reload();
                    }, 2000);

				}else{

                    huoniao.parentTip("success", "修改成功<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
                    huoniao.goTop();
                    setTimeout(function(){
                        window.location.reload();
                    }, 2000);

				}
			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false);
			};
		});
	});

});
