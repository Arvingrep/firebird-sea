$(function(){

	var defaultBtn = $("#delBtn"),
		checkedBtn = $("#stateBtn, #pendBtn"),
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

					huoniao.operaJson("action=historyList", "id="+id, function(data){
						huoniao.hideTip();
						if(data.state == 100){
							$("#selectBtn a:eq(1)").click();
							getList();
						}else if(data.state == 101){
							$.dialog.alert(data.info);
						}else{
							var info = [];
							for(var i = 0; i < $("#list tbody tr").length; i++){
								var tr = $("#list tbody tr:eq("+i+")");
								for(var k = 0; k < data.info.length; k++){
									if(data.info[k] == tr.attr("data-id")){
										info.push("▪ "+tr.find("td:eq(1)").text());
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

			//更新信息状态
			,updateState: function(type){
				huoniao.showTip("loading", "正在操作，请稍候...");
				$("#smartMenu_state").remove();

				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					var arcrank = "";
					if(type == "待审核"){
						arcrank = 0;
					}else if(type == "正常"){
						arcrank = 1;
					}else if(type == "审核拒绝"){
						arcrank = 2;
					}

					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}
					huoniao.operaJson("memberDepositLog.php?action=updateState", "id="+id+"&arcrank="+arcrank, function(data){
						if(data.state == 100){
							huoniao.showTip("success", data.info, "auto");
							setTimeout(function() {
								getList();
							}, 800);
						}else{
							var info = [];
							for(var i = 0; i < $("#list tbody tr").length; i++){
								var tr = $("#list tbody tr:eq("+i+")");
								for(var k = 0; k < data.info.length; k++){
									if(data.info[k] == tr.attr("data-id")){
										info.push("▪ "+tr.find(".row2 a").text());
									}
								}
							}
							$.dialog.alert("<div class='errInfo'><strong>以下信息修改失败：</strong><br />" + info.join("<br />") + '</div>', function(){
								getList();
							});
						}
					});
					$("#selectBtn a:eq(1)").click();
				}
			}

		};

	//开始、结束时间
	$("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});
    $('#stime').val(now);
    $('#etime').val(now);
    $("#start").html($("#stime").val());
    $("#end").html($("#etime").val());
	//初始加载
	getList();



	$("#export").click(function(e){
	var t = $(this),
		Keyword = encodeURIComponent($("#keyword").val()),
		start    = $("#stime").val(),
		end      = $("#etime").val(),
		mtype    = $("#ctype").val("data-id") ? $("#ctype").attr("data-id") : ""


	var url = '?do=export&sKeyword='+Keyword+'&start='+start+'&end='+end+'&mtype='+mtype;

	t.attr('href', url);

	})
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
	$(".form-horizontal .btn-group").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
        let par = $(this).closest('.btn-group');
        par.removeClass('open');
		par.attr("data-id", id);
		par.find('button').html(title+'<span class="caret"></span>');
	});

	$("#stateBtn, #pendBtn, #pageBtn, #paginationBtn").delegate("a", "click", function(){
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
	$(".dropdown-toggle").bind("click", function(e){
		var t = $(this)
        $(this).closest('.btn-group').toggleClass('open')
		if($(this).parent().attr("id") != "typeBtn"){
			var height = document.documentElement.clientHeight - $(this).offset().top - $(this).height() - 30;
			$(this).next(".dropdown-menu").css({"max-height": height, "overflow-y": "auto"});
		}

		
		$('body').one('click',function(){
			t.closest('.btn-group').removeClass('open')
		})

		return false
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

	


	//删除
	$("#delBtn").bind("click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del();
		});
	});

	//单条删除
	$("#list").delegate(".del", "click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del();
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

	//拖选功能
	/*$("#list tbody").selectable({
		distance: 3,
		cancel: '.check, a',
		start: function(){
			$("#smartMenu_state").remove();
		},
		stop: function() {
			init.funTrStyle();
		}
	});*/

	// //审核状态更新
	// $("#list").delegate(".more", "click", function(event){
	// 	event.preventDefault();

	// 	var t = $(this), top = t.offset().top - 5, left = t.offset().left + 15, obj = "smartMenu_state";
	// 	if($("#"+obj).html() != undefined){
	// 		$("#"+obj).remove();
	// 	}

	// 	t.parent().parent().removeClass("selected").addClass("selected");

	// 	var htmlCreateStateMenu = function(){
	// 		var htmlMenu = [];
	// 		htmlMenu.push('<div id="'+obj+'" class="smart_menu_box">');
	// 		htmlMenu.push('  <div class="smart_menu_body">');
	// 		htmlMenu.push('    <ul class="smart_menu_ul">');
	// 		htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">待审核</a></li>');
	// 		htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">正常</a></li>');
	// 		htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">审核拒绝</a></li>');
	// 		htmlMenu.push('    </ul>');
	// 		htmlMenu.push('  </div>');
	// 		htmlMenu.push('</div>');

	// 		return htmlMenu.join("");
	// 	}

	// 	$("body").append(htmlCreateStateMenu());

	// 	$("#"+obj).find("a").bind("click", function(event){
	// 		event.preventDefault();
	// 		init.updateState($(this).text());
	// 	});

	// 	$("#"+obj).css({
	// 		top: top,
	// 		left: left - $("#"+obj).width()/2
	// 	}).show();

	// 	return false;
	// });

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

    // 排序
    $('.sort').click(function(){
        if($(this).hasClass('curr')){
            $(this).removeClass('curr')
        }else{
            $('.sort').removeClass('curr')
            $(this).addClass('curr')
        }
        getList();
    })

	//查看会员信息
    $("#list, #editform, .o-wrap, .layui-row").delegate(".userinfoShow", "click", function () {
        var id = $(this).attr("data-id");
        if (id) {
            huoniao.showTip("loading", "数据读取中，请稍候...");
            huoniao.operaJson(adminRoute + "../inc/json.php?action=getMemberInfo", "id=" + id, function (data) {
                huoniao.hideTip();
                if (data) {

                    $.dialog({
                        id: "memberInfo",
                        fixed: false,
                        title: "会员ID【" + id + "】",
                        content: '<table width="100%"border="0"cellspacing="1"cellpadding="5" style="line-height:2em;"><tr><td width="100"valign="top"><img onerror="this.src=\'/static/images/noPhoto_60.jpg\'" src="' + data[0]["photo"] + '"width="100"/></td><td width="80"align="right"valign="top">会员名：<br />昵称：<br />真实姓名：<br />' + (data[0]["company"] ? "公司名称：<br />" : "") + '帐户：<br />&nbsp;<br />性别：<br />邮箱：<br />电话：<br />QQ：<br />生日：<br />城市：<br />注册时间：<br />注册IP：<br />状态：</td><td valign="top">' + data[0]["username"] + (data[0]["level"] ? '<font color="red">【' + data[0]["level"] + '】</font>' : '') + '<br />' + data[0]["nickname"] + '<br />' + data[0]["realname"] + (data[0]["company"] ? '<br />' + data[0]["company"] : "") + '<br />余额 ' + data[0]["money"] + '&nbsp;&nbsp;&nbsp;积分 ' + data[0]["point"] + '<br />保障金 ' + data[0]["promotion"] + '&nbsp;&nbsp;&nbsp;'+ parent.bonusName + ' ' + data[0]['bonus'] + '<br />' + (data[0]["sex"] == 0 ? "女" : "男") + '<br />' + data[0]["email"] + (data[0]["emailCheck"] == 0 ? "&nbsp;<font color='#f00'>[未验证]</font>" : "&nbsp;<font color='green'>[已验证]</font>") + '<br />' + data[0]["phone"] + (data[0]["phoneCheck"] == 0 ? "&nbsp;<font color='#f00'>[未验证]</font>" : "&nbsp;<font color='green'>[已验证]</font>") + '<br />' + data[0]["qq"] + '<br />' + huoniao.transTimes(data[0]["birthday"], 2) + '<br />' + data[0]["addr"] + '<br />' + huoniao.transTimes(data[0]["regtime"], 2) + '<br />' + data[0]["regip"] + '<br />' + (data[0]["state"] == 1 ? '<font color="green">正常</font>' : (data[0]["state"] == 2 ? '<font color="red">审核拒绝</font>' : '<font color="gray">未审核</font>')) + '</td></tr></table>',
                        width: 550,
                        button: [
                            {
                                name: '修改会员信息',
                                callback: function(){
                                    var title = data[0]["username"],
                                        href = "memberList.php?dopost=Edit&id=" + id;

                                    try {
                                        parent.addPage("memberListEdit" + id, "member", title, "member/" + href);
                                    } catch (e) {
                                    }
                                },
                                focus: true
                            },
                            {
                                name: '授权登录此账号',
                                callback: function(){
                                    window.open('/?action=authorizedLogin&id='+id+'');
                                }
                            },
                            {
                                name: '关闭'
                            }
                        ]
                    });

                } else {
                    huoniao.showTip("error", "数据读取失败");
                }
            });
        }
    });

});

//获取列表
var currPageList = []
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var start    = $("#start").html(),
		end      = $("#end").html(),
		mtype    = $("#mtype").html(),
		platfomm    = $("#cplatform").attr('data-id') || -1,
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pend    = $("#pendBtn").attr("data-id") ? $("#pendBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";
    var sort = $(".sort.curr").length && $(".sort.curr").attr('data-sort') || '',
		userid = $("#keyword").val();
	var data = [];
		data.push("startTime="+start);
		data.push("endTime="+end);
		data.push("module="+mtype);
		data.push("platform=" + platfomm); //搜索引擎
		data.push("userid=" + userid); //用户id
		data.push("sort=" + sort); //排序
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("count.php?action=historyList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, dlist = val.list;
        if(val.state == 100){
            obj.attr("data-totalpage", val.pageInfo.totalPage);
            $(".totalCount").html(val.pageInfo.totalCount);
            huoniao.hideTip();
			currPageList = dlist
                    // <td class="row8 ">${huoniao.transTimes(dlist[i].addtime,1)}</td>
			// 
            for(i; i < dlist.length; i++){ 
                let html = `
                    <td class="row6 ">${modules[dlist[i].module] || dlist[i].module}</td>
                    <td class="row12 "><a href="javascript:;" class="link userinfoShow" data-id="${dlist[i].userid}">${dlist[i].username}</a></td>
                    <td class="row16 left"><div class="con showReply" title="查看详情">${dlist[i].keyword}</div></td>
                    <td class="row10 ">${dlist[i].platformName}</td>
                    <td class="row12 ">${dlist[i].tokens}</td>
					<td class="row8 ">${dlist[i].completionTokens}</td>
      				<td class="row8 ">${dlist[i].promptTokens}</td>
                    <td class="row8 ">${dlist[i].responseTime}</td>
                    <td class="row12 ">
						<div class="add_time">${huoniao.transTimes(dlist[i].addtime,1)}</div>
						<div class="ip">${dlist[i].ip}</div>
					</td>
                    <td class="row8 "><button class="showReply btn">查看回答</button></td>

                `
                list.push(`<tr data-ind="${i}"  class="row">${html}</tr>`)
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


		// if(val.state == "100"){
		// 	huoniao.hideTip();

		

		// 	obj.find("tbody").html(list.join(""));
		// 	$("#loading").hide();
		// 	$("#list table").show();
		// 	huoniao.showPageInfo();
		// }else{

		// 	$(".totalMoney").html('&yen;0');
		// 	$(".totalWxpayMoney").html('&yen;0');
		// 	$(".totalAlipayMoney").html('&yen;0');

		// 	obj.find("tbody").html("");
		// 	huoniao.showTip("warning", val.info, "auto");
		// 	$("#loading").html(val.info).show();
		// }


		$('body').delegate('.showReply ','click',function(){
			var ind = $(this).parents('tr').attr('data-ind');
			let content = currPageList[ind].answer;
			var keyword = currPageList[ind].keyword;
			var html = `
				<div class="infoCon" style="line-height:1.5em; padding:0 20px; max-height:400px; overflow:auto;">
					<div class="answer_box" style="margin-bottom:50px;">
						<h3 class="answer_title" style="font-size: 20px; color:#444; font-weight: bold;">问题描述</h3>
						<div class="answer_con" style="font-size:16px; line-height:1.8em; color:#333;">
							${keyword.replace(/\n/g,'<br>')}
						</div>
					</div>
					<div class="answer_box" >
						<h3 class="answer_title" style="font-size: 20px; color:#444; font-weight: bold;">回答内容：</h3>
						<div class="answer_con" style="font-size:16px; line-height:1.8em; color:#333;">
							${content.replace(/\n/g,'<br>')}
						</div>
					</div>
				</div>
			`
			if(content){
				$.dialog({
					id: "answerInfo",
					fixed: false,
					title: "查看详情",
					content: html,
					width: 800,
					// height:500,
					button: [
						{
							name: '确定',
							focus: true
						}
					]
				});
			}
		})
	});

};
