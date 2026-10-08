$(function(){

	var init = {

			//选中样式切换
			funTrStyle: function(){
				var trLength = $("#list tbody tr").length, checkLength = $("#list tbody tr.selected").length;
				if(trLength == checkLength){
					$("#selectBtn .check").removeClass("checked").addClass("checked");
				}else{
					$("#selectBtn .check").removeClass("checked");
				}
			}

		};

	//开始、结束时间
	$("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});

	//初始加载
	if(type != "bbs"){
		getList();
	}

	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#mtype").html($("#ctype").attr("data-id"));
		$("#start").html($("#stime").val());
		$("#end").html($("#etime").val());
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

	//全选、不选
	$("#selectBtn a").bind("click", function(){
		var id = $(this).attr("data-id");
		if(id == 1){
			$("#selectBtn .check").addClass("checked");
			$("#list tr").removeClass("selected").addClass("selected");
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");
		}
	});

	//同步所有会员
	$("#syncAll").bind("click", function(event){
		event.preventDefault();
		$.dialog.confirm('确定要同步所有会员到论坛吗？', function(){
			location.href = "memberSync.php?action=syncAll";
		});
	});

	//同步选择的会员
	$("#syncSelect").bind("click", function(event){
		event.preventDefault();
		$.dialog.confirm('确定要同步选择的会员到论坛吗？', function(){
			var checked = $("#list tbody tr.selected");
			if(checked.length < 1){
				$.dialog.alert("未选中任何信息！");
				return false;
			}else{
				var id = [];
				for(var i = 0; i < checked.length; i++){
					id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
				}
				location.href = "memberSync.php?action=syncSelect&id="+id.join(",");
			}
		});
	});

	//同步所有符合条件的会员
	$("#syncFilter").bind("click", function(event){
		event.preventDefault();
		$.dialog.confirm('确定要同步所有符合条件的会员到论坛吗？', function(){

		var sKeyword = encodeURIComponent($("#sKeyword").html()),
			start    = $("#start").html(),
			end      = $("#end").html(),
			mtype    = $("#mtype").html(),
			state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "";

		var data = [];
			data.push("sKeyword="+sKeyword);
			data.push("start="+start);
			data.push("end="+end);
			data.push("mtype="+mtype);
			data.push("pend=");
			data.push("state="+state);

			location.href = "memberSync.php?action=syncFilter&"+data.join("&");
		});
	});

	//从论坛导入会员
	$("#syncBBS").bind("click", function(event){
		event.preventDefault();
		location.href = "memberSync.php?action=syncBBS";
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

	//拖选功能
	$("#list tbody").selectable({
		distance: 3,
		cancel: '.check, a',
		start: function(){
			$("#smartMenu_state").remove();
		},
		stop: function() {
			init.funTrStyle();
		}
	});

	//从论坛导入会员
	var typeArr = ["csv"];
	$("#userData").bind("change",function(){
		if($(this).val() == ""){
			$.dialog.alert("请选择需要导入的文件");
		}else{
			var file = $(this).val();
			var len = file.length;
			var ext = file.substring(len-3,len).toLowerCase();
			if($.inArray(ext,typeArr) == -1){
				$.dialog.alert("选择的文件类型不正确，请选择使用插件下载的用户数据！");
			}
		}
	});

	$("#btnSubmit").bind("click", function(){
		if($("#userData").val() == ""){
			$.dialog.alert("请选择需要导入的文件");
			return false;
		}else{
			var file = $("#userData").val();
			var len = file.length;
			var ext = file.substring(len-3,len).toLowerCase();
			if($.inArray(ext,typeArr) == -1){
				$.dialog.alert("选择的文件类型不正确，请选择使用插件下载的用户数据！");
				return false;
			}
		}

		$(this).attr("disabled", true).html("导入中，请稍候...");
		$("#editform").submit();
	});

});

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		start    = $("#start").html(),
		end      = $("#end").html(),
		mtype    = $("#mtype").html(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("start="+start);
		data.push("end="+end);
		data.push("mtype="+mtype);
		data.push("pend=");
		data.push("state="+state);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("memberList.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, memberList = val.memberList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		$(".totalGray").html(val.pageInfo.totalGray);
		$(".normal").html(val.pageInfo.normal);
		$(".lock").html(val.pageInfo.lock);

		if(val.state == "100"){
			huoniao.hideTip();

			for(i; i < memberList.length; i++){
				list.push('<tr data-id="'+memberList[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				var mtype = "个人";
				if(memberList[i].mtype == 2){
					mtype = "企业";
				}
				list.push('  <td class="row5 left">'+mtype+'</td>');
				list.push('  <td class="row20 left"><img onerror="javascript:this.src=\'/static/images/default_user.jpg\';" src="'+cfg_attachment+memberList[i].photo+'&type=small" class="litpic" style="width:60px;" /><span>'+memberList[i].username+'<br /><small>'+memberList[i].discount+'</small></span></td>');
				var company = "";
				if(memberList[i].mtype == 2){
					company = '<br /><small>'+memberList[i].company+'</small>';
				}
				list.push('  <td class="row15 left">'+memberList[i].nickname+'【'+memberList[i].sex+'】'+company+'</td>');
				var emailCheck = "", phoneCheck = "";
				if(memberList[i].emailCheck == 1){
					emailCheck = " label-success";
				}
				if(memberList[i].phoneCheck == 1){
					phoneCheck = " label-success";
				}
				list.push('  <td class="row13 left"><span class="label'+emailCheck+'" style="margin-right:3px;">验</span>'+memberList[i].email+'<br /><span class="label'+phoneCheck+'" style="margin-right:3px;">验</span>'+memberList[i].phone+'</td>');
				list.push('  <td class="row6 left">&yen;'+memberList[i].money+'</td>');
				list.push('  <td class="row6 left">'+memberList[i].point+'</td>');
				list.push('  <td class="row15 left">'+memberList[i].regtime+'<br /><small>'+memberList[i].lastlogintime+'</small></td>');
				list.push('  <td class="row7 left">'+memberList[i].regip+'<br /><small>'+memberList[i].lastloginip+'</small></td>');
				var state = "";
				switch(memberList[i].state){
					case "0":
						state = "<span class='gray'>待审核</span>";
						break;
					case "1":
						state = "<span class='audit'>正常</span>";
						break;
					case "2":
						state = "<span class='refuse'>审核拒绝</span>";
						break;
				}
				list.push('  <td class="row10 state">'+state+'</td>');
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
