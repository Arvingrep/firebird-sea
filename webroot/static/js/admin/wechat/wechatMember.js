$(function(){

    $(".chosen-select").chosen();

	//初始加载
	getList();

	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#sReg").html($("#reg").val());
		$("#sSubscribe").html($("#subscribe").val());
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

	//二级菜单点击事件
	$("#ctype").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#ctype").attr("data-id", id);
		$("#ctype button").html(title+'<span class="caret"></span>');
	});

	$("#stateBtn, #pageBtn, #paginationBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();
		obj.attr("data-id", id);
		if(obj.attr("id") == "paginationBtn"){
			var totalPage = $("#list").attr("data-totalpage");
			$("#list").attr("data-atpage", id);
			obj.find("button").html(id+"/"+totalPage+'页<span class="caret"></span>');
			$("#list").attr("data-atpage", id);
		}else{
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

	//同步公众号会员
	$("#syncAll").bind("click", function(event){
		event.preventDefault();
		$.dialog.confirm('确定要同步公众号用户吗？', function(){
			location.href = "wechatMember.php?action=syncAll";
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
        sReg = encodeURIComponent($("#sReg").html()),
        sSubscribe = encodeURIComponent($("#sSubscribe").html()),
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("sReg="+sReg);
		data.push("sSubscribe="+sSubscribe);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("wechatMember.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, memberList = val.memberList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);

		if(val.state == "100"){
			huoniao.hideTip();

			for(i; i < memberList.length; i++){
				list.push('<tr data-id="'+memberList[i].id+'">');
				list.push('  <td class="row3"></td>');
                var nickname = '未注册';
                if(memberList[i].id){
                    nickname = '<a href="javascript:;" class="userinfo" data-id="'+memberList[i].id+'">'+memberList[i].nickname+'</a>';
                }
				list.push('  <td class="row20 left">'+nickname+'</td>');
				list.push('  <td class="row30 left">'+memberList[i].openid+'</td>');
				list.push('  <td class="row12 left">'+(memberList[i].subscribe ? '<span class="audit">已关注</span>' : '<span class="gray">未关注</span>')+'</td>');
				list.push('  <td class="row35 left">'+memberList[i].subscribe_time+'</td>');
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
