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

			//删除
			,del: function(type){

				//清空
				if(type == "all"){
					huoniao.operaJson("?dopost=delAllLogs", "", function(data){
						if(data.state == 100){
							$("#selectBtn a:eq(1)").click();
							getList();
						}else{
							huoniao.showTip("error", data.info, "auto");
						}
					});
					$("#selectBtn a:eq(1)").click();

				//逐条删除
				}else{
					var checked = $("#list tbody tr.selected");
					if(checked.length < 1){
						huoniao.showTip("warning", "未选中任何信息！", "auto");
					}else{
						huoniao.showTip("loading", "正在操作，请稍候...");
						var id = [];
						for(var i = 0; i < checked.length; i++){
							id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
						}

						huoniao.operaJson("?dopost=del", "id="+id, function(data){
							if(data.state == 100){
								$("#selectBtn a:eq(1)").click();
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
									getList();
								});
							}
						});
						$("#selectBtn a:eq(1)").click();
					}
				}
			}

            //快速编辑
            ,quickEdit: function(id, rank){
                    
                $.dialog({
                    fixed: true,
                    title: '新增黑名单',
                    content: $("#editForm").html(),
                    width: 460,
                    ok: function(){
                        //提交
                        var uid  = self.parent.$("#uid").val(),
                            type = self.parent.$("#type").val(),
                            serialize = self.parent.$(".quick-editForm").serialize();

                        var attr = [], checkbox = self.parent.$(".quick-editForm input[type=checkbox]");
                        for(var i = 0; i < checkbox.length; i++){
                            var check = self.parent.$(".quick-editForm input[type=checkbox]:eq("+i+")");
                            if(check.is(":checked")){
                                attr.push(check.val());
                            }
                        }

                        if(!uid){
                            alert("请输入会员ID");
                            return false;
                        }

                        if(!type){
                            alert("请填写违规原因");
                            return false;
                        }

						if(attr == ""){
							$.dialog.alert("请选择要处理的内容！");
							return false;
						}

                        huoniao.operaJson("?dopost=add", serialize, function(data){
                            if(data.state == 100){
                                huoniao.showTip("success", data.info, "auto");
                                setTimeout(function() {
                                    location.reload();
                                }, 800);
                            }else if(data.state == 101){
                                alert(data.info);
                                return false;
                            }else{
                                huoniao.showTip("error", data.info, "auto");
                                location.reload();
                            }
                        });

                    },
                    cancel: true
                });
                    

            }

		};

	//填充操作人列表
	huoniao.buildAdminList($("#cadmin"), adminList, '请选择管理员');
	$(".chosen-select").chosen();

	//开始、结束时间
	$("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 3, language: 'ch'});

	//初始加载
	getList();

	//搜索
	$("#searchBtn").bind("click", function(){
		var starttime = $("#stime").val(), endtime = $("#etime").val(), keyword = $("#keyword").val();
		//时间对比
		if(starttime != "" && endtime != "" && Date.ParseString(starttime) - Date.ParseString(endtime) > 0){
			$.dialog.alert("结束时间必须大于开始时间！");
			return false;
		}

		$("#start").html(starttime);
		$("#end").html(endtime);
		$("#keywords").html($.trim(keyword));
		$("#list").attr("data-atpage", 1);
		getList();

	});

	//搜索回车提交
    $("#stime, #etime").keyup(function (e) {
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

	//二级菜单点击事件
	$("#cadmin").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#cadmin").attr("data-id", id);
		$("#cadmin button").html(title+'<span class="caret"></span>');
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

			$("#cadmin")
				.attr("data-id", "")
				.find("button").html('操作人<span class="caret"></span>');

			$("#admin").html("");
			$("#stime, #etime").val("");
			$("#start, #end").html("");

			if(obj.attr("id") != "propertyBtn"){
				obj.find("button").html(title+'<span class="caret"></span>');
			}
			$("#list").attr("data-atpage", 1);
		}
		getList();
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
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");

			defaultBtn.hide();
		}
	});

	//删除
	$("#delBtn").bind("click", function(){
        $.dialog.confirm('您确定要将选中的会员从黑名单中删除吗？', function(){
		    init.del();
        });
	});

	//新增黑名单
	$("#addNew").bind("click", function(event){
		init.quickEdit(0);
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

});

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var start    = $("#start").html(),
		end      = $("#end").html(),
		keywords = $("#keywords").html(),
		admin    = $("#cadmin").val(),
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("start="+start);
		data.push("end="+end);
		data.push("admin="+admin);
		data.push("keywords="+keywords);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), tr = [], i = 0, list = val.list;
		if(val.state == "100"){
			huoniao.hideTip();

			obj.attr("data-totalpage", val.pageInfo.totalPage);

			for(i; i < list.length; i++){
				tr.push('<tr data-id="'+list[i].id+'">');
				tr.push('  <td class="row3"><span class="check"></span></td>');
				tr.push('  <td class="row10 left"><a href="javascript:;" class="userinfo" data-id="'+list[i].uid+'">'+list[i].user+'</a></td>');
				tr.push('  <td class="row10 left">'+list[i].type+'</td>');
				tr.push('  <td class="row20 left">'+list[i].auth+'</td>');
				tr.push('  <td class="row12 left">'+list[i].expired+'</td>');
				tr.push('  <td class="row13 left">'+list[i].admin+'</td>');
				tr.push('  <td class="row20 left">'+list[i].note+'</td>');
				tr.push('  <td class="row12 left">'+list[i].pubdate+'</td>');
				tr.push('</tr>');
			}

			obj.find("tbody").html(tr.join(""));
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
