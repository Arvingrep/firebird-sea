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

	$("#editform").delegate("input[type='radio'], input[type='checkbox']", "click", function(){
		if($(this).attr("data-required") == "true"){
			var name = $(this).attr("name"), val = $("input[name="+name+"]:checked").val();
			if(val == undefined){
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}
	});

	$("#editform").delegate("input,textarea", "blur", function(){
		var obj = $(this), tip = obj.siblings(".input-tips");
		if(obj.attr("data-required") == "true"){
			if($(this).val() == ""){
				tip.removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				tip.removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}else{
			huoniao.regex(obj);
		}
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

	var typeObj = $("#type");

	if(type != ""){
		typeObj.find("option[value='"+type+"']").attr("selected",true);
	}
	if(day != ""){
		$("#day").find("option[value='"+day+"']").attr("selected",true);
	}
	if(type == "week" && day != ""){
		$("#week").find("option[value='"+day+"']").attr("selected",true);
	}
	if(hour != ""){
		$("#hour").find("option[value='"+hour+"']").attr("selected",true);
	}
	if(minute != ""){
		$("#minute").find("option[value='"+minute+"']").attr("selected",true);
	}
	if(type == "now"){
		var now_time = "";
		if(now_type == "day"){
			now_time = day;
		}else if(now_type == "hour"){
			now_time = hour;
		}else if(now_type == "minute"){
			now_time = minute;
		}
		$("#now_time").val(now_time);
		$("#now_type").find("option[value='"+now_type+"']").attr("selected",true);
	}

	var changeDaytime = function(tp){
		tp = tp ? tp : "month";
		typeObj.siblings().hide();

		//每月
		if(tp == "month"){
			typeObj.siblings("#day, #hour, #minute").show();

		//每周
		}else if(tp == "week"){
			typeObj.siblings("#week, #hour, #minute").show();

		//每日
		}else if(tp == "day"){
			typeObj.siblings("#hour, #minute").show();

		//每小时
		}else if(tp == "hour"){
			typeObj.siblings("#minute").show();

		//每隔
		}else if(tp == "now"){
			typeObj.siblings("#now_time, #now_type").show();

		}

	}
	changeDaytime(type);

	typeObj.bind("change", function(){
		changeDaytime($(this).val());
	});


	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t        = $(this),
				id       = $("#id").val(),
				module   = $("#module").val(),
				title    = $("#title"),
				type     = $("#type").val(),
				now_time = $("#now_time").val(),
				file     = $("#file").val();

		//模块
		if(module == "" || module == 0){
			huoniao.goTop();
			$("#moduleList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			return false;
		}else{
			$("#moduleList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		//标题
		if(!huoniao.regex(title)){
			huoniao.goTop();
			return false;
		};

		//执行时间
		if(type == "now" && now_time == ""){
			$.dialog.alert("请输入执行时间");
			return false;
		}

		//执行文件
		if(file == "" || file == 0){
			huoniao.goTop();
			$("#fileList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			return false;
		}else{
			$("#fileList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "siteCron.php",
			data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					if($("#action").val() == "add"){

						$.dialog({
							fixed: true,
							title: "添加成功",
							icon: 'success.png',
							content: "添加成功！",
							ok: function(){
								try{
									$("body",parent.document).find("#nav-siteCronphp").click();
									parent.reloadPage($("body",parent.document).find("#body-siteCronphp"));
									$("body",parent.document).find("#nav-siteCronAdd s").click();
								}catch(e){
									location.href = thisPath + "siteCron.php";
								}
							},
							cancel: false
						});

					}else{
						$.dialog({
							fixed: true,
							title: "修改成功",
							icon: 'success.png',
							content: "修改成功",
							ok: function(){
								try{
									$("body",parent.document).find("#nav-siteCronphp").click();
									parent.reloadPage($("body",parent.document).find("#body-siteCronphp"));
									$("body",parent.document).find("#nav-siteCronEdit"+id+" s").click();
								}catch(e){
									location.href = thisPath + "siteCron.php";
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
