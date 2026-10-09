$(function(){

	var defaultBtn = $("#openBtn, #closeBtn, #delBtn"),
		checkedBtn = $("#moduleBtn, #addNew, .operBtn"),
		init = {

			//选中样式切换
			funTrStyle: function(){
				var trLength = $("#list tbody tr").length, checkLength = $("#list tbody tr.selected").length;
				if(trLength == checkLength){
					$("#selectBtn .check").removeClass("checked").addClass("checked");
				}else{
					$("#selectBtn .check").removeClass("checked");
				}

				if(checkLength > 0){
					defaultBtn.show();
					checkedBtn.hide();
				}else{
					defaultBtn.hide();
					checkedBtn.show();
				}
			}

			//删除
			,del: function(){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}

					huoniao.operaJson("siteCron.php?action=del", "id="+id, function(data){
						if(data.state == 100){
							huoniao.showTip("success", data.info, "auto");
							setTimeout(function() {
								location.reload();
							}, 800);
						}else{
							var info = [];
							for(var i = 0; i < $("#list tbody tr").length; i++){
								var tr = $("#list tbody tr:eq("+i+")");
								for(var k = 0; k < data.info.length; k++){
									if(data.info[k] == tr.attr("data-id")){
										info.push("▪ "+tr.find("td:eq(2)").text());
									}
								}
							}
							$.dialog.alert("<div class='errInfo'><strong>以下信息删除失败：</strong><br />" + info.join("<br />") + '</div>', function(){
								location.reload();
							});
						}
					});
					$("#selectBtn a:eq(1)").click();
				}
			}

			//手动执行
			,run: function(){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					var file = $.trim(checked.find('small').text());
					if(file.indexOf('syncFenbiao') > 0){
						window.open('/include/cron/'+file);
						return;
					}
					if(file.indexOf('shop_syncSku') > 0){
						window.open('/include/cron/'+file);
						return;
					}
					if(file=='shop_syncSku.php'){
						window.open('/include/cron/'+file);
						return;
					}
                    if(file.indexOf('common') > 0){
						window.open('/include/cron/'+file);
						return;
					}
					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}

					huoniao.operaJson("siteCron.php?action=run", "id="+id, function(data){
						if(data.state == 100){
							huoniao.showTip("success", data.info, "auto");
							setTimeout(function() {
								location.reload();
							}, 800);
						}
					});
					$("#selectBtn a:eq(1)").click();
				}
			}


			//更新信息状态
			,updateState: function(type){
				huoniao.showTip("loading", "正在操作，请稍候...");
				$("#smartMenu_state").remove();

				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					var state = "";
					if(type == "开启"){
						state = 1;
					}else if(type == "停用"){
						state = 0;
					}

					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}
					huoniao.operaJson("siteCron.php?action=updateState", "id="+id+"&state="+state, function(data){
						if(data.state == 100){
							huoniao.showTip("success", data.info, "auto");
							setTimeout(function() {
								location.reload();
							}, 800);
						}else{
							var info = [];
							for(var i = 0; i < $("#list tbody tr").length; i++){
								var tr = $("#list tbody tr:eq("+i+")");
								for(var k = 0; k < data.info.length; k++){
									if(data.info[k] == tr.attr("data-id")){
										info.push("▪ "+tr.find(".row2").text());
									}
								}
							}
							$.dialog.alert("<div class='errInfo'><strong>以下信息修改失败：</strong><br />" + info.join("<br />") + '</div>', function(){
								location.reload();
							});
						}
					});
					$("#selectBtn a:eq(1)").click();
				}
			}

		};

	//二级菜单点击事件
	$("#moduleBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#moduleBtn").attr("data-id", id);
		$("#moduleBtn button").html(title+'<span class="caret"></span>');

		//筛选结果
		if(id != ""){
			$("#list tr").each(function(){
				var type = $(this).data("type");
				if(type != id){
					$(this).hide();
				}else{
					$(this).show();
				}
			});
		}else{
			$("#list tr").show();
		}
	});

	//下拉菜单过长设置滚动条
	$(".dropdown-toggle").bind("click", function(){
		if($(this).parent().attr("id") != "typeBtn"){
			var height = document.documentElement.clientHeight - $(this).offset().top - $(this).height() - 30;
			$(this).next(".dropdown-menu").css({"max-height": height, "overflow-y": "auto"});
		}
	});

	//全选、不选
	$("#selectBtn a").bind("click", function(){
		var id = $(this).attr("data-id");
		if(id == 1){
			$("#selectBtn .check").addClass("checked");
			$("#list tr").removeClass("selected").addClass("selected");

			defaultBtn.show();
			checkedBtn.hide();
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");

			defaultBtn.hide();
			checkedBtn.show();
		}
	});

	//启用、停用
	$("#openBtn, #closeBtn").bind("click", function(){
		init.updateState($(this).data("type"));
	});

	//新增
	$("#addNew").bind("click", function(event){
		try {
			event.preventDefault();
			parent.addPage("siteCronAdd", "siteConfig", "新增计划任务", "siteConfig/siteCron.php?action=add");
		} catch(e) {}
	});

	//修改
	$("#list").delegate(".edit", "click", function(event){
		var t     = $(this),
				id    = t.closest("tr").attr("data-id"),
				title = t.attr("title"),
				href  = t.attr("href");

		try {
			event.preventDefault();
			parent.addPage("siteCronEdit"+id, "siteConfig", title, "siteConfig/"+href);
		} catch(e) {}
	});

	//删除
	$("#delBtn").bind("click", function(){
		$.dialog.confirm('您确定要将选中的计划任务删除吗？', function(){
			init.del();
		});
	});

	//单条删除
	$("#list").delegate(".del", "click", function(){
		$.dialog.confirm('您确定要将选中的计划任务删除吗？', function(){
			init.del();
		});
	});

	//手动执行
	$("#list").delegate(".run", "click", function(){
		init.run();
	});

	//一键删除重复任务
	$("#deleteRepeat").bind("click", function(){
		$.dialog.confirm('确认删除重复的任务吗？<br />确认后系统会把重复的计划任务自动合并为一条！', function(){
			huoniao.operaJson("siteCron.php?action=clearRepeat", "", function(data){
				if(data.state == 100){
					huoniao.showTip("success", data.info, "auto");
					setTimeout(function() {
						location.reload();
					}, 800);
				}
			});
		});
	});

	//一键删除无效的任务
	$("#deleteInvalid").bind("click", function(){
		$.dialog.confirm('确认删除无效的任务吗？<br />确认后系统会把不存在或已卸载的模块计划任务自动删除！', function(){
			huoniao.operaJson("siteCron.php?action=clearInvalid", "", function(data){
				if(data.state == 100){
					huoniao.showTip("success", data.info, "auto");
					setTimeout(function() {
						location.reload();
					}, 800);
				}
			});
		});
	});

	//一键删除停用的任务
	$("#deleteStop").bind("click", function(){
		$.dialog.confirm('确认删除已停用的任务吗？<br />确认后系统会把已经停用的计划任务批量删除！', function(){
			huoniao.operaJson("siteCron.php?action=clearStop", "", function(data){
				if(data.state == 100){
					huoniao.showTip("success", data.info, "auto");
					setTimeout(function() {
						location.reload();
					}, 800);
				}
			});
		});
	});

	//单选
	$("#list tbody").delegate("tr", "click", function(event){
		var isCheck = $(this), checkLength = $("#list tbody tr.selected").length;
		if(event.target.className.indexOf("check") > -1) {
			if(isCheck.hasClass("selected")){
				isCheck.removeClass("selected");
			}else{
				isCheck.addClass("selected");
			}
		}else{
			if(checkLength > 1){
				$("#list tr").removeClass("selected");
				isCheck.addClass("selected");
			}else{
				if(isCheck.hasClass("selected")){
					isCheck.removeClass("selected");
				}else{
					$("#list tr").removeClass("selected");
					isCheck.addClass("selected");
				}
			}
		}

		init.funTrStyle();
	});


	//审核状态更新
	$("#list").delegate(".more", "click", function(event){
		event.preventDefault();

		var t = $(this), top = t.offset().top - 5, left = t.offset().left + 15, obj = "smartMenu_state";
		if($("#"+obj).html() != undefined){
			$("#"+obj).remove();
		}

		t.parent().parent().removeClass("selected").addClass("selected");

		var htmlCreateStateMenu = function(){
			var htmlMenu = [];
			htmlMenu.push('<div id="'+obj+'" class="smart_menu_box">');
			htmlMenu.push('  <div class="smart_menu_body">');
			htmlMenu.push('    <ul class="smart_menu_ul">');
			htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">开启</a></li>');
			htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">停用</a></li>');
			htmlMenu.push('    </ul>');
			htmlMenu.push('  </div>');
			htmlMenu.push('</div>');

			return htmlMenu.join("");
		}

		$("body").append(htmlCreateStateMenu());

		$("#"+obj).find("a").bind("click", function(event){
			event.preventDefault();
			init.updateState($(this).text());
		});

		$("#"+obj).css({
			top: top,
			left: left - $("#"+obj).width()/2
		}).show();

		return false;
	});

	$(document).click(function (e) {
		var s = e.target;
		if ($("#smartMenu_state").html() != undefined) {
			if (!jQuery.contains($("#smartMenu_state").get(0), s)) {
				if (jQuery.inArray(s, $(".smart_menu_body")) < 0) {
					$("#smartMenu_state").remove();
				}
			}
		}
	});


    //执行方式
	$("#save").bind("click", function(){
	    var t = $(this);
		$.dialog.confirm('确定要修改吗？', function(){

            var state = $('input[name=state]:checked').val(),
                title = $.trim($('#tit').val());
            if(state == '' || state == undefined || state == null){
                $.dialog.alert('请选择执行方式！');
                return false;
            }
            huoniao.operaJson("siteConfig.php?action=cronType", "&cronType="+state+"&token="+token, function(data){
                $.get("siteClearCache.php?action=do");
                huoniao.showTip("success", "保存成功", "auto");
            });

		});
	});


});
