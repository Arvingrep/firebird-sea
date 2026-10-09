$(function(){
	
	var defaultBtn = $("#delBtn"),
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
				}else{
					defaultBtn.hide();
				}
			}

			//新增 or 修改
			,popupOpera: function(type, id){
				
				var title = type == "add" ? "新增" : "修改";
				
				if(type == "edit" && id == null){
					return false;
				}

				$.dialog({
					id: "tuanItem",
					fixed: true,
					title: title + '字段',
					content: $("#popupOpera").html(),
					width: 450,
					ok: function(){
						
						//提交
						var field       = self.parent.$("#field").val(),
							title       = self.parent.$("#title").val(),
							serialize   = self.parent.$(".quick-editForm").serialize();
						
						if(field == ""){
							$.dialog.alert("请填写字段名！");
							return false;
						}
						
						if(title == ""){
							$.dialog.alert("请填写字段别名！");
							return false;
						}
						
						huoniao.operaJson("tuanItem.php?action="+type+"&tid="+typeid, "id="+id+"&tid="+typeid+"&"+serialize, function(data){
							if(data.state == 100){
								huoniao.showTip("success", data.info, "auto");
								
								if(type == "add"){
									$("#list").attr("data-atpage", 1);
								}
								$("#selectBtn a:eq(1)").click();
								setTimeout(function() { 
									getList();
								}, 800);
							}else if(data.state == 101){
								$.dialog.alert(data.info);
								return false;
							}else{
								huoniao.showTip("error", data.info, "auto");
							}
						});
						
					},
					cancel: true
				});
				
				self.parent.$("#formtype").change(function(){
					if($(this).val() == "checkbox"){
						self.parent.$("#default").attr("placeholder", "多个值用“|”分隔");
					}else{
						self.parent.$("#default").attr("placeholder", "");
					}
				});
				
				if(type == "edit"){
					huoniao.operaJson("tuanItem.php?action=getDetail&tid="+typeid, "id="+id, function(data){
						if(data != null && data.length > 0){
							data = data[0];
						
							//填充信息
							self.parent.$("#field").val(data.field);
							self.parent.$("#title").val(data.title);
							self.parent.$("#orderby").val(data.orderby);
							self.parent.$("#formtype").find("option").each(function(){
								if($(this).val() == data.formtype){
									$(this).attr("selected", true);
								}
							});
							self.parent.$("input[name='required'][value='"+data.required+"']").attr("checked", true);
							self.parent.$("#options").val(data.options);
							self.parent.$("#default").val(data.default);
							
						}else{
							huoniao.showTip("error", "信息获取失败！", "auto");
							try{
								$.dialog.list["tuanItem"].close();
							}catch(ex){
								
							}
						}
					});
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
					
					huoniao.operaJson("tuanItem.php?action=del&tid="+typeid, "id="+id, function(data){
						$("#selectBtn a:eq(1)").click();
						if(data.state == 100){
							//huoniao.showTip("success", data.info, "auto");
							getList();
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
								$("#selectBtn a:eq(1)").click();
								getList();
							});
						}
					});
				}
			}
			
		};
	
	//初始加载
	getList();
	
	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#list").attr("data-atpage", 1);
		getList();
	});
	
	//搜索回车提交
    $("#keyword").keyup(function (e) {
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
            $("#searchBtn").click();
        }
    });
	
	//新增模型
	$("#addItem").bind("click", function(){
		init.popupOpera("add");
	});
	
	$("#pageBtn, #paginationBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();
		obj.attr("data-id", id);
		if(obj.attr("id") == "paginationBtn"){
			var totalPage = $("#list").attr("data-totalpage");
			$("#list").attr("data-atpage", id);
			obj.find("button").html(id+"/"+totalPage+'页<span class="caret"></span>');
			$("#list").attr("data-atpage", id);
		}else{
			obj.find("button").html(title+'<span class="caret"></span>');
			$("#list").attr("data-atpage", 1);
		}
		getList();
	});
	
	//全选、不选
	$("#selectBtn a").bind("click", function(){
		var id = $(this).attr("data-id");
		var recycle = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "";
		if(id == 1){
			$("#selectBtn .check").addClass("checked");
			$("#list tr").removeClass("selected").addClass("selected");
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");
		}
		
		init.funTrStyle();
	});
	
	//修改
	$("#list").delegate(".edit", "click", function(event){
		var id = $(this).attr("data-id");

		init.popupOpera("edit", id);
	});
	
	//删除
	$("#delBtn").bind("click", function(){
		$.dialog.confirm('确定要删除吗？', function(){
			init.del("del");
		});
	});
	
	
	//单条删除
	$("#list").delegate(".del", "click", function(){
		$.dialog.confirm('确定要删除吗！', function(){
			init.del("del");
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
		
	});
	
	//拖选功能
	$("#list tbody").selectable({
		distance: 3,
		cancel: '.check, a',
		start: function(){
		},
		stop: function() {
			init.funTrStyle();
		}
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
	
});

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";
		
	var data = [];
		data.push("tid="+typeid);
		data.push("keyword="+sKeyword);
		data.push("pagestep="+pagestep);
		data.push("page="+page);
	
	huoniao.operaJson("tuanItem.php?action=list&tid="+typeid, data.join("&"), function(val){
		var obj = $("#list"), listArray = [], i = 0, list = val.list;
		
		if(val.state == 100){
			huoniao.hideTip();
			
			obj.attr("data-totalpage", val.pageInfo.totalPage);
			for(i; i < list.length; i++){
				listArray.push('<tr data-id="'+list[i].id+'">');
				listArray.push('  <td class="row3"><span class="check"></span></td>');
				listArray.push('  <td class="row20 left">'+list[i].field+'</td>');
				listArray.push('  <td class="row40 left">'+list[i].title+'</td>');
				listArray.push('  <td class="row25">'+list[i].formtype+'</td>');
				listArray.push('  <td class="row12"><a data-id="'+list[i].id+'" href="javascript:;" title="修改" class="edit">修改</a><a href="javascript:;" title="删除" class="del">删除</a></td>');
				listArray.push('</tr>');
			}
			obj.find("tbody").html(listArray.join(""));
			$("#loading").hide();
			$("#list table").show();
			huoniao.showPageInfo();
		}else{
			obj.attr("data-totalpage", "1");
			
			huoniao.showPageInfo();
			
			obj.find("tbody").html("");
			huoniao.showTip("warning", val.info, "auto");
			$("#loading").html(val.info).show();
		}
	});
	
};