$(function(){

	var init = {

			//删除
			del: function(id){
					huoniao.showTip("loading", "正在操作，请稍候...");
					huoniao.operaJson("siteNotify.php?dopost=del", "id="+id, function(data){
						if(data.state == 100){
							getList();
						}else{
							huoniao.showTip("error", "删除失败！", "auto");
						}
					});
			}

		};

	//初始加载
	getList();

	//恢复系统默认通知
	$('#importDefaultData').bind('click', function(e){
		var t = $(this), url = t.attr('href');
		e.preventDefault();

		$.dialog.confirm('确认后将自动恢复系统所有默认消息通知模板，此操作将会删除现有的系统消息配置！<br />如果有自定义配置的内容，请先做好备份！<br />注意：导入成功后，需要重新导入短信和公众号模板！', function(){
			huoniao.showTip("loading", "正在操作，，请稍候...");
            huoniao.operaJson("?dopost=importDefaultData",{}, function(data){
                if(data.state == 100){
                    huoniao.showTip("success", data.info, "auto");
                    setTimeout(function() {
                        location.reload();
                    }, 800);
                }else{
                    alert(data.info);
                    return false;
                }
            });
		});
	});

	//一键导入
	$('#import').bind('click', function(e){
		var t = $(this), url = t.attr('href');
		e.preventDefault();

		$.dialog.confirm('一键导入功能将会覆盖已经配置好的模板ID，确认要导入吗？', function(){
			window.open(url);
		});
	});

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

	//下拉菜单过长设置滚动条
	$(".dropdown-toggle").bind("click", function(){
		if($(this).parent().attr("id") != "typeBtn" && $(this).parent().attr("id") != "addrBtn"){
			var height = document.documentElement.clientHeight - $(this).offset().top - $(this).height() - 30;
			$(this).next(".dropdown-menu").css({"max-height": height, "overflow-y": "auto"});
		}
	});

	$("#setindustry").bind("click",function () {
		$.dialog.confirm('此操作会将微信所在行业设置为：IT科技-互联网/电子商务，文体娱乐-娱乐休闲；<br />确认要继续吗？', function(){
			huoniao.operaJson("../inc/json.php?action=addWxTemplate", "addtype=0", function(data){
				if(data.state == 100){
					huoniao.showTip("success", data.info, "auto");
				}else{
					huoniao.showTip("error", data.info, "auto");
				}
			});
		});
	})

	//一键导入微信模板
	$('#importWxtemp').bind('click', function(e){
		var t = $(this), url = t.attr('href');
		e.preventDefault();

		$.dialog.confirm('一键导入功能会自动将系统默认模板同步到微信公众平台；<br />请确认微信公众平台可用模版数量，不足将导致同步不完整！<br />确认要继续吗？', function(){
			window.open(url);
		});
	});

	//新增
	$("#addNew").bind("click", function(){
		try {
			event.preventDefault();
			parent.addPage("siteNotifyAdd", "siteConfig", "新增消息通知", "siteConfig/"+$(this).attr("href"));
		} catch(e) {}
	});

	//更新通知方式
	$("#list").delegate("input", "click", function(){
		var t = $(this), id = t.closest("tr").attr("data-id"), type = t.attr("class"), val = t.is(':checked') ? 1 : 0;

		huoniao.operaJson("siteNotify.php?dopost=updateMode", "id="+id+"&type="+type+"&val="+val, function(data){
			if(data.state == 100){
				huoniao.showTip("success", data.info, "auto");
			}else{
				huoniao.showTip("error", data.info, "auto");
			}
		});
	});

	//更新状态
	$("#list").delegate(".state a", "click", function(){
		var t = $(this), id = t.closest("tr").attr("data-id"), val = t.hasClass("audit") ? 0 : 1;

		huoniao.operaJson("siteNotify.php?dopost=updateState", "id="+id+"&val="+val, function(data){
			if(data.state == 100){
				getList();
			}else{
				huoniao.showTip("error", data.info, "auto");
			}
		});
	});

	//修改
	$("#list").delegate(".edit", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("siteNotifyEdit"+id, "siteConfig", title, "siteConfig/"+href);
		} catch(e) {}
	});

	//单条删除
	$("#list").delegate(".del", "click", function(){
		var t = $(this), id = t.closest("tr").attr("data-id");
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del(id);
		});
	});

});

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("siteNotify.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, data = val.list;
		obj.attr("data-totalpage", val.pageInfo.totalPage);

		$("#totalCount").html("共 "+val.pageInfo.totalCount+" 条记录");
		$(".totalCount").html(val.pageInfo.totalCount);

		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();

			for(i; i < data.length; i++){
				list.push('<tr data-id="'+data[i].id+'">');
				list.push('  <td class="row20 left">&nbsp;&nbsp;&nbsp;&nbsp;'+data[i].title+'</td>');
				list.push('  <td class="row50">');
				list.push('<label style="display:inline-block; margin-right:10px;"><input type="checkbox" class="email_state" value="1"'+(data[i].email_state == "1" ? " checked" : "")+'>电子邮件</label>');
				list.push('<label style="display:inline-block; margin-right:10px;"><input type="checkbox" class="sms_state" value="1"'+(data[i].sms_state == "1" ? " checked" : "")+'>手机短信</label>');
				list.push('<label style="display:inline-block; margin-right:10px;"><input type="checkbox" class="wechat_state" value="1"'+(data[i].wechat_state == "1" ? " checked" : "")+'>微信公众号</label>');
				list.push('<label style="display:inline-block; margin-right:10px;"><input type="checkbox" class="site_state" value="1"'+(data[i].site_state == "1" ? " checked" : "")+'>网页即时消息</label>');
				list.push('<label style="display:inline-block; margin-right:10px;"><input type="checkbox" class="app_state" value="1"'+(data[i].app_state == "1" ? " checked" : "")+'>APP推送</label>');
				list.push('</td>');
				var state = "";
				switch (data[i].state) {
					case "1":
						state = '<a href="javascript:;" class="audit">已启用</a>';
						break;
					case "0":
						state = '<a href="javascript:;" class="refuse">未启用</a>';
						break;
				}
				list.push('  <td class="row20 state">'+state+'</td>');
				list.push('  <td class="row10 left">');
				list.push('<a data-id="'+data[i].id+'" data-title="'+data[i].title+'" href="siteNotifyAdd.php?dopost=edit&id='+data[i].id+'" title="修改" class="edit">修改</a>');
				if(data[i].system == 2){
					list.push('<a href="javascript:;" title="删除" class="del">删除</a></td>');
				}
				list.push('</tr>');
			}

			obj.find("tbody").html(list.join(""));
			$("#loading").hide();
			$("#list table").show();
			huoniao.showPageInfo();
		}else{

			obj.find("tbody").html("");
			huoniao.showTip("warning", val.info, "auto");
			$("#loading").html(val.info).show();
		}
	});

};
