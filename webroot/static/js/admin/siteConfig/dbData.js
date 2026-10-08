$(function(){

	//初始加载表
	if(action == "data"){
		huoniao.showTip("loading", "正在操作，请稍候...");
		huoniao.operaJson("dbData.php?action=getTables", "", function(data){
			huoniao.hideTip();
			if(data != null && data.length > 0){
				var tables = [];
				var totalCount = 0;
				for(var i = 0; i < data.length; i++){
					if(data[i].name.indexOf('_all') < 0){
						totalCount++;
						tables.push('<ul class="clearfix">');
						tables.push('  <li class="row40"><input type="checkbox" name="tables[]" value="'+data[i].name+'" checked />'+data[i].name+'</li>');
						tables.push('  <li class="row10 center">'+data[i].Rows+'</li>');
						tables.push('  <li class="row10 center">'+data[i].Data_length+'</li>');
						tables.push('  <li class="row40">'+data[i].Comment+'</li>');
						tables.push('</ul>');
					}
				}
				$("#dbCount").html(totalCount);
				$("#tablist").html(tables.join(""));
			};
		});
	}

	//快速选择表
	$("#chooseModule a").bind("click", function(){
		var t = $(this), id = t.attr("data-id"), title = t.text();
		t.closest(".btn-group").find("button").html(title+'<span class="caret"></span>');

		if(id != ""){
			$("#tablist ul").find("input").attr("checked", false);
			$("#tablist ul").hide();
			var count = 0;
			$("#tablist").find("ul").each(function(){
				var input = $(this).find("input").val();
				if(input.indexOf(DB_PREFIX+id) > -1){
					$(this).show();
					$(this).find("input").attr("checked", true);
					count++;
				}
			});
			$("#dbCount").html(count);
		}else{
			$("#tablist ul").show();
			$("#checkall").attr("checked", true);
			$("#tablist ul").find("input").attr("checked", true);
			$("#dbCount").html($("#tablist ul").length);
		}
	});

	//全选
	$("#checkall").bind("click", function(){
		if($(this).is(":checked")){
			$(this).attr("checked", true);
			$("#tablist").find("input[type=checkbox]").attr("checked", true);
		}else{
			$(this).attr("checked", false);
			$("#tablist").find("input[type=checkbox]").attr("checked", false);

		}
	});

	//点击选择表
	$("#tablist").delegate("ul", "click", function(event){
		var t = $(this), check = t.find("input[type=checkbox]"), target = event.target.nodeName.toLowerCase();
		if(target != "input"){
			if(check.is(":checked")){
				check.attr("checked", false);
			}else{
				check.attr("checked", true);
			}
		}
		var tl = $("#tablist input[type=checkbox]").length, tcl = $("#tablist input[type=checkbox]:checked").length;
		if(tl == tcl){
			$("#checkall").attr("checked", true);
		}else{
			$("#checkall").removeAttr("checked");
		}
	});

	//备份
	$("#btnSubmit").bind("click", function(event){
		if($("#tablist input[type=checkbox]:checked").length <= 0){
			$.dialog.alert("请选择要备份的表！");
			return false;
		}

	});

	//优化
	$("#btnOpimize").bind("click", function(){
		if($("#tablist input[type=checkbox]:checked").length <= 0){
			$.dialog.alert("请选择要优化的表！");
			return false;
		}

		$(this).attr("disabled", true).html("优化中..");
		huoniao.operaJson("dbData.php?action=opimize", $("#dbform").serialize(), function(data){
			if(data.state == 100){
				$.dialog({
					title: "优化成功",
					icon: 'success.png',
					content: data.info,
					ok: function(){
						location.reload();
					}
				});
			}else{
				$.dialog.alert(data.info);
			}
		});
	});

	//修复
	$("#btnRepair").bind("click", function(){
		if($("#tablist input[type=checkbox]:checked").length <= 0){
			$.dialog.alert("请选择要修复的表！");
			return false;
		}

		$(this).attr("disabled", true).html("修复中..");
		huoniao.operaJson("dbData.php?action=repair", $("#dbform").serialize(), function(data){
			if(data.state == 100){
				$.dialog({
					title: "修复成功",
					icon: 'success.png',
					content: data.info,
					ok: function(){
						location.reload();
					}
				});
			}else{
				$.dialog.alert(data.info);
			}
		});
	});

	//加载备份列表
	if(action == "revert"){
		getRevertList();
	}

	var defaultBtn = $("#delRevert"),
		init = {
			//选中样式切换
			funTrStyle: function(){
				var trLength = $("#list tbody tr").length, hLength = $("#list tbody tr.hide").length, checkLength = $("#list tbody tr.selected").length;
				if((trLength-hLength) == checkLength){
					$("#selectAll").addClass("selected");
				}else{
					$("#selectAll").removeClass("selected");
				}

				if(checkLength > 0){
					defaultBtn.show();
				}else{
					defaultBtn.hide();
				}
			}
	};

	//全选、不选
	$("#selectAll").bind("click", function(){
		if(!$(this).hasClass("selected")){
			$("#selectAll").addClass("selected");
			$("#list tr").each(function(index, element) {
				if($(this).find("span.check").html() != undefined){
                	$(this).removeClass("selected").addClass("selected");
				}
            });
			defaultBtn.show();
		}else{
			$("#selectAll").removeClass("selected");
			$("#list tr").removeClass("selected");
			defaultBtn.hide();
		}
	});

	//单选
	$("#list tbody").delegate("tr", "click", function(event){
		var isCheck = $(this), checkLength = $("#list tbody tr.selected").length;
		if($(this).find("span.check").html() != undefined){
			if(event.target.className.indexOf("check") > -1) {
				if(isCheck.hasClass("selected")){
					isCheck.removeClass("selected");
				}else{
					isCheck.addClass("selected");
				}
			}else if(event.target.className.indexOf("edit") > -1 || event.target.className.indexOf("revert") > -1 || event.target.className.indexOf("del") > -1) {
				$("#list tr").removeClass("selected");
				isCheck.addClass("selected");
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
		}
	});

	//展开文件列表
	$("#list tbody").delegate(".s-sub", "click", function(){
		var name = $(this).parent().parent().attr("data-val");
		$("."+name).toggle();
	});

	//删除备份
	$("#delRevert").bind("click", function(){
		if($("#list tbody tr.selected").length <= 0){
			$.dialog.alert("请选择要删除的备份文件！");
			return false;
		}
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			var floder = [], trList = $("#list tbody tr.selected");
			for(var i = 0; i < trList.length; i++){
				floder.push($(trList[i]).attr("data-val"));
			}
			huoniao.showTip("loading", "正在操作，请稍候...");
			huoniao.operaJson("dbData.php?action=delRevert", "floder="+floder.join(","), function(data){
				huoniao.hideTip();
				if(data.state == 100){
					$("#selectAll").removeClass("selected");
					$("#delRevert").hide();
					getRevertList();
				}else{
					$.dialog.alert(data.info);
				}
			});
		});
	});

	//导入备份
	$("#list tbody").delegate(".s-dao", "click", function(){
		var name = $(this).parent().parent().attr("data-val");
		if(name != ""){
			$.dialog.confirm('确定要导入吗？', function(){
				$("input[name=floder]").val(name);
				$("#dbform").submit();
			});
		}
	});

});

//备份列表
function getRevertList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	huoniao.operaJson("dbData.php?action=getrevert", "", function(data){
		huoniao.hideTip();
		if(data.length > 0){
			var list = [];
			for(var i = 0; i < data.length; i++){
				list.push('<tr data-val="'+data[i].name+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				list.push('  <td class="row37 left"><a href="javascript:;" class="audit s-sub">'+data[i].name+'</a></td>');
				list.push('  <td class="row10 left">'+data[i].type+'</td>');
				list.push('  <td class="row20">'+data[i].date+'</td>');
				list.push('  <td class="row10">'+data[i].size+'</td>');
				list.push('  <td class="row10">'+data[i].volume+'</td>');
				list.push('  <td class="row10"><a href="javascript:;" class="audit s-dao">导入</a></td>');
				list.push('</tr>');
				for(var f = 0; f < data[i].file.length; f++){
					list.push('<tr class="hide '+data[i].name+'">');
					list.push('  <td class="row3"></td>');
					list.push('  <td class="row37 left">'+data[i].file[f].name+'</td>');
					list.push('  <td class="row10 left">'+data[i].file[f].type+'</td>');
					list.push('  <td class="row20">'+data[i].file[f].date+'</td>');
					list.push('  <td class="row10">'+data[i].file[f].size+'</td>');
					list.push('  <td class="row10">'+data[i].file[f].volume+'</td>');
					list.push('  <td class="row10">&nbsp;</td>');
					list.push('</tr>');
				}
			}
			$("#list").find("tbody").html(list.join(""));
			$("#loading").hide();
		}else{
			$("#list").find("tbody").html("").hide();
			$("#loading").html("暂无备份信息").show();
		}
	});
}
