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

					huoniao.operaJson("memberList.php?dopost=del", "id="+id, function(data){
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
					huoniao.operaJson("memberList.php?action=updateState", "id="+id+"&arcrank="+arcrank, function(data){
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


	//填充城市列表
	huoniao.choseCity($(".choseCity"),$("#cityid"));
	$(".chosen-select").chosen();

	//开始、结束时间
	$("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});

	//初始加载
	getList();

	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#start").html($("#stime").val());
		$("#end").html($("#etime").val());
		$("#startmoney").html($("#samount").val());
		$("#endmoney").html($("#eamount").val());
		$("#startpoint").html($("#spoint").val());
		$("#endpoint").html($("#epoint").val());
		$("#startbonus").html($("#sbonus").val());
		$("#endbonus").html($("#ebonus").val());
		$("#list").attr("data-atpage", 1);
		getList();
	});

	//搜索回车提交
  $("#keyword").keyup(function (e) {
    if (!e) {
      var e = window.event;
    }
	let code = '';
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
	$("#stateBtn, #pendBtn, #pageBtn, #paginationBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();
		if(id == 'noopr'){//余额统计和积分统计 不触发
			$('#stateBtn').removeClass('open');
			return false;
		}
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

			defaultBtn.show();
			checkedBtn.hide();
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");

			defaultBtn.hide();
			checkedBtn.show();
		}
	});

	//新增会员
	$("#addNew").bind("click", function(event){
		event.preventDefault();
		var href = $(this).attr("href");
		try {
			event.preventDefault();
			parent.addPage("memberAdd", "member", "添加新会员", "member/"+href);
		} catch(e) {}
	});

	//修改
	$("#list").delegate(".edit", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("memberListEdit"+id, "member", title, "member/"+href);
		} catch(e) {}
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

	//取消注销
	$("#list").delegate(".qxzhuxiao", "click", function(){
		var uid  = $(this).attr("data-uid");
		console.log(uid);
		$.dialog.confirm('确定要取消吗？', function(){
			huoniao.operaJson("memberList.php?action=qxzhuxiao", "uid="+uid, function(data){
				if(data.state == 100){
					huoniao.showTip("success", data.info, "auto");
					setTimeout(function() {
						getList();
					}, 800);
				}else{
					obj.find("tbody").html("");
					huoniao.showTip("warning", val.info, "auto");
					$("#loading").html(val.info).show();
				}
			});
		});
	});

	//昵称审核
	$("#list").delegate(".nickname_audit", "click", function(){
		var uid  = $(this).attr("data-uid");
		console.log(uid);
		$.dialog.confirm('确定要审核吗？', function(){
			huoniao.operaJson("memberList.php?action=nickname_audit", "uid="+uid, function(data){
				if(data.state == 100){
					huoniao.showTip("success", data.info, "auto");
					setTimeout(function() {
						getList();
					}, 800);
				}else{
					obj.find("tbody").html("");
					huoniao.showTip("warning", val.info, "auto");
					$("#loading").html(val.info).show();
				}
			});
		});
	});

	//头像审核
	$("#list").delegate(".photo_audit", "click", function(){
		var uid  = $(this).attr("data-uid");
		console.log(uid);
		$.dialog.confirm('确定要审核吗？', function(){
			huoniao.operaJson("memberList.php?action=photo_audit", "uid="+uid, function(data){
				if(data.state == 100){
					huoniao.showTip("success", data.info, "auto");
					setTimeout(function() {
						getList();
					}, 800);
				}else{
					obj.find("tbody").html("");
					huoniao.showTip("warning", val.info, "auto");
					$("#loading").html(val.info).show();
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
	// $("#list tbody").selectable({
	// 	distance: 3,
	// 	cancel: '.check, a',
	// 	start: function(){
	// 		$("#smartMenu_state").remove();
	// 	},
	// 	stop: function() {
	// 		init.funTrStyle();
	// 	}
	// });

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
			htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">待审核</a></li>');
			htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">正常</a></li>');
			htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">审核拒绝</a></li>');
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

	// 导出
	$("#export").click(function(e){
		// e.preventDefault();
		var sKeyword = $("#keyword").val(),
			cityid = $("#cityid").val(),
			mtype = $("#ctype").val(),
			level = $("#clevel").val(),
			regfrom = $("#regfrom").val(),
			state = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
			pend  = $("#pendBtn").attr("data-id") ? $("#pendBtn").attr("data-id") : "",
			start = $("#start").html(),
			end   = $("#end").html(),
			smoney    = $("#startmoney").html(),
			emoney     = $("#endmoney").html(),
			stpoint    = $("#startpoint").html(),
			endpoint     = $("#endpoint").html(),
			stbonus    = $("#startbonus").html(),
			endbonus     = $("#endbonus").html(),
			orderMoney     = $("#orderMoney").html(),
			orderPoint     = $("#orderPoint").html(),
			orderBonus     = $("#orderBonus").html();

		var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("start="+start);
		data.push("end="+end);
		data.push("cityid="+cityid);
		data.push("mtype="+mtype);
		data.push("level="+level);
		data.push("regfrom="+regfrom);
		data.push("state="+state);
		data.push("pend="+pend);
		data.push("startMoney="+smoney);
		data.push("endMoney="+emoney);
		data.push("startPoint="+stpoint);
		data.push("endPoint="+endpoint);
		data.push("startBonus="+stbonus);
		data.push("endBonus="+endbonus);
		data.push("orderMoney="+orderMoney);
		data.push("orderPoint="+orderPoint);
		data.push("orderBonus="+orderBonus);
		data.push("pagestep=200000");
		data.push("page=1");

        huoniao.showTip("loading", "正在导出，请稍候...", "auto");
		$(this).attr('href', 'memberList.php?dopost=getList&do=export&'+data.join('&'));

	})

	// 更新账户余额
	$("#updateAccount").click(function(e){
		// e.preventDefault();
		var sKeyword = $("#keyword").val(),
			cityid = $("#cityid").val(),
			mtype = $("#ctype").val(),
			level = $("#clevel").val(),
			regfrom = $("#regfrom").val(),
			state = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
			pend  = $("#pendBtn").attr("data-id") ? $("#pendBtn").attr("data-id") : "",
			start = $("#start").html(),
			end   = $("#end").html(),
			smoney    = $("#startmoney").html(),
			emoney     = $("#endmoney").html(),
			stpoint    = $("#startpoint").html(),
			endpoint     = $("#endpoint").html();
			stbonus    = $("#startbonus").html(),
			endbonus     = $("#endbonus").html();

		var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("start="+start);
		data.push("end="+end);
		data.push("cityid="+cityid);
		data.push("mtype="+mtype);
		data.push("level="+level);
		data.push("regfrom="+regfrom);
		data.push("state="+state);
		data.push("pend="+pend);
		data.push("startMoney="+smoney);
		data.push("endMoney="+emoney);
		data.push("startPoint="+stpoint);
		data.push("endPoint="+endpoint);
		data.push("startBonus="+stbonus);
		data.push("endBonus="+endbonus);

        var id = [];
        var checked = $("#list tbody tr.selected");
        for(var i = 0; i < checked.length; i++){
            id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
        }
        data.push("ids=" + id);

        $.dialog({
            fixed: true,
            title: '更新账户余额',
            content: $("#updateAccountHtml").html(),
            width: 500,
            ok: function(){
                //提交
                var amount   = self.parent.$("#updateAccountAmount").val(),
                    note    = self.parent.$("#updateAccountNote").val(),
                    serialize = self.parent.$(".quick-editForm").serialize();

                if(amount == ""){
                    $.dialog.alert("请输入要操作的金额");
                    return false;
                }

                if(note == ""){
                    $.dialog.alert("请输入操作说明");
                    return false;
                }

                huoniao.showTip("loading", "正在更新，请稍候...");

                huoniao.operaJson("memberList.php?dopost=updateAccount", serialize+"&"+data.join('&'), function(data){
                    if(data.state == 100){
                        huoniao.showTip("success", data.info, "auto");
                        getList();
                    }else{
                        huoniao.hideTip();
                        $.dialog.alert(data.info);
                    }
                });

            },
            cancel: true
        });

	})

	//余额排序
	var sclick = 0,sclick2 = 0,sclick3 = 0;//第一次down 第二次up 第三次恢复
	$('.thead li .moneyA').click(function(){
		sclick2=0;
		sclick3=0;
		if(!$(this).hasClass('down')){
			$(this).removeClass('up').addClass('down');
			$('#orderMoney').html('1');
		}else{
			$(this).removeClass('down').addClass('up');
			$('#orderMoney').html('2');
		}
		$('.thead li .pointA').removeClass().addClass('pointA');
		$('.thead li .bonusA').removeClass().addClass('bonusA');
		$('#orderPoint, #orderBonus').html('');
		$('.thead li .recomdA').removeClass().addClass('recomdA');
		$('#recomdOrder').html('');
		sclick++;
		if(sclick == 3){
			sclick = 0;
			$(this).removeClass().addClass('moneyA');
			$('#orderMoney').html('');
		}else{
			$(this).addClass('curr');
		}
		getList();

	})
	//积分排序
	$('.thead li .pointA').click(function(){
		sclick=0;
		sclick3=0;
		if(!$(this).hasClass('down')){
			$(this).removeClass('up').addClass('down');
			$('#orderPoint').html('1');
		}else{
			$(this).removeClass('down').addClass('up');
			$('#orderPoint').html('2');
		}
		$('.thead li .moneyA').removeClass().addClass('moneyA');
		$('.thead li .bonusA').removeClass().addClass('bonusA');
		$('#orderMoney, #orderBonus').html('');
		$('.thead li .recomdA').removeClass().addClass('recomdA');
		$('#recomdOrder').html('');
		sclick2++;
		if(sclick2 == 3){
			sclick2 = 0;
			$(this).removeClass().addClass('pointA');
			$('#orderPoint').html('');
		}else{
			$(this).addClass('curr');
		}
		getList();
	})
	//消费金排序
	$('.thead li .bonusA').click(function(){
		sclick=0;
		sclick3=0;
		if(!$(this).hasClass('down')){
			$(this).removeClass('up').addClass('down');
			$('#orderBonus').html('1');
		}else{
			$(this).removeClass('down').addClass('up');
			$('#orderBonus').html('2');
		}
		$('.thead li .moneyA').removeClass().addClass('moneyA');
		$('.thead li .pointA').removeClass().addClass('pointA');
		$('#orderMoney, #orderPoint').html('');
		$('.thead li .recomdA').removeClass().addClass('recomdA');
		$('#recomdOrder').html('');
		sclick2++;
		if(sclick2 == 3){
			sclick2 = 0;
			$(this).removeClass().addClass('bonusA');
			$('#orderBonus').html('');
		}else{
			$(this).addClass('curr');
		}
		getList();
	})

	//推荐人数排序
	$('.thead li .recomdA').click(function(){
		sclick=0;
		sclick2=0;
		if(!$(this).hasClass('down')){
			$(this).removeClass('up').addClass('down');
			$('#recomdOrder').html('1');
		}else{
			$(this).removeClass('down').addClass('up');
			$('#recomdOrder').html('2');
		}
		$('.thead li .moneyA').removeClass().addClass('moneyA');
		$('#orderMoney').html('');
		$('.thead li .pointA').removeClass().addClass('pointA');
		$('#orderPoint').html('');
		sclick3++;
		if(sclick3 == 3){
			sclick3 = 0;
			$(this).removeClass().addClass('recomdA');
			$('#recomdOrder').html('');
		}else{
			$(this).addClass('curr');
		}
		getList();
	})

});

//获取列表统计
function listCount(data){
	huoniao.operaJson("memberList.php?dopost=listCount", data, function(val){
		$(".totalGray").html(val.totalGray);
		$(".normal").html(val.normal);
		$(".lock").html(val.lock);
		$(".online").html(val.online);
		$(".qiyeweikt").html(val.qiyeweikt);
		$(".totalPend").html(val.totalPend);
		$(".pendPerson").html(val.pendPerson);
		$(".pendCompany").html(val.pendCompany);
		$(".cancellation").html(val.cancellation);
		$(".nicknameAudit").html(val.nicknameAudit);
		$(".photoAudit").html(val.photoAudit);
		$(".wechat_subscribe").html(val.wechat_subscribe);
		$(".nowechat_subscribe").html(val.nowechat_subscribe);
		$(".totalRobot").html(val.totalRobot);
		$(".allmoney").html(val.totalMoney);
		$(".allPoint").html(val.totalPoint);
		$(".allBonus").html(val.totalBonus);
	});
}

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		start    = $("#start").html(),
		end      = $("#end").html(),
		cityid    = $("#cityid").val(),
		mtype    = $("#ctype").val(),
		level    = $("#clevel").val(),
		regfrom    = $("#regfrom").val(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pend    = $("#pendBtn").attr("data-id") ? $("#pendBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1",
		smoney    = $("#startmoney").html(),
		emoney     = $("#endmoney").html(),
		stpoint    = $("#startpoint").html(),
		endpoint     = $("#endpoint").html(),
		stbonus    = $("#startbonus").html(),
		endbonus     = $("#endbonus").html(),
		orderMoney     = $("#orderMoney").html(),
		orderPoint     = $("#orderPoint").html(),
		orderBonus     = $("#orderBonus").html(),
		recomdOrder     = $("#recomdOrder").html();

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("start="+start);
		data.push("end="+end);
		data.push("cityid="+cityid);
		data.push("mtype="+mtype);
		data.push("level="+level);
		data.push("regfrom="+regfrom);
		data.push("state="+state);
		data.push("pend="+pend);
		data.push("startMoney="+smoney);
		data.push("endMoney="+emoney);
		data.push("startPoint="+stpoint);
		data.push("endPoint="+endpoint);
		data.push("startBonus="+stbonus);
		data.push("endBonus="+endbonus);
		data.push("orderMoney="+orderMoney);
		data.push("orderPoint="+orderPoint);
		data.push("orderBonus="+orderBonus);
		data.push("tjOrder="+recomdOrder);
		data.push("pagestep="+pagestep);
		data.push("page="+page);


	huoniao.operaJson("memberList.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, memberList = val.memberList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		if(page==1){
			$(".totalGray").html("...");
			$(".normal").html("...");
			$(".lock").html("...");
			$(".online").html("...");
			$(".qiyeweikt").html("...");
			$(".totalPend").html("...");
			$(".pendPerson").html("...");
			$(".pendCompany").html("...");
			$(".cancellation").html("...");
			$(".nicknameAudit").html("...");
			$(".photoAudit").html("...");
			$(".wechat_subscribe").html("...");
			$(".nowechat_subscribe").html("...");
			$(".totalRobot").html("...");
			$(".allmoney").html("...");
			$(".allPoint").html("...");
			$(".allBonus").html("...");
		}
		if(val.state == "100"){
			huoniao.hideTip();

			for(i; i < memberList.length; i++){
				list.push('<tr data-id="'+memberList[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				var mtype = "个人";
				if(memberList[i].mtype == 2){
					mtype = "企业";
				}

                var certify = '';
                if(memberList[i].mtype == 2){
					realname = memberList[i].company;
					if(memberList[i].licenseState == 3){
						certify = " label-warning";
					}else if(memberList[i].licenseState == 2){
						certify = " label-important";
					}else if(memberList[i].licenseState == 1){
						certify = " label-info";
					}
					mtype += ' <span class="label'+certify+'"style="margin-right:3px;" title="营业执照认证">验</span>';
				}else{
					realname = memberList[i].realname;
					if(memberList[i].certifyState == 3){
						certify = " label-warning";
					}else if(memberList[i].certifyState == 2){
						certify = " label-important";
					}else if(memberList[i].certifyState == 1){
						certify = " label-info";
					}
					mtype += ' <span class="label'+certify+'"style="margin-right:3px;" title="身份证实名认证">验</span>';
				}

				var photo;
                if(memberList[i].photo){
                    if(memberList[i].photo.indexOf('http') > -1){
                        photo = memberList[i].photo;
                    }else{
                        photo = cfg_attachment + memberList[i].photo + '&type=small';
                    }
                }else{
                    photo = '/static/images/default_user.jpg';
                }
				var photo_audit = '';
				if(memberList[i].photo_audit.indexOf('http') > -1){
					photo_audit = memberList[i].photo_audit;
				}else if(memberList[i].photo_audit != ''){
					photo_audit = cfg_attachment + memberList[i].photo_audit + '&type=small';
				}
				if(photo_audit){
					photo = photo_audit;
				}
				list.push('  <td class="row6 left">'+mtype+'<br />ID:'+memberList[i].id+'</td>');
				var cancellation = '';
				if(memberList[i].is_cancellation==1){

					cancellation = '<small><span style="color: red;">账户注销</span>';
					cancellation += '<a href="javascript:;" data-uid="'+memberList[i].id+'" style="margin-left: 10px; color: #0ab88e" class="qxzhuxiao" title="取消注销">取消注销</a></small>';
				}

				var audit = '';
				if(photo_audit){
					audit += '<small><span style="color: red;">头像需要审核</span><a href="javascript:;" data-uid="'+memberList[i].id+'" style="margin-left: 10px; color: #0ab88e" class="photo_audit" title="审核通过">审核通过</a></small></small>';
				}
				if(memberList[i].nickname_audit){
					audit += '<small><span style="color: red;">新昵称('+memberList[i].nickname_audit+')</span><a href="javascript:;" data-uid="'+memberList[i].id+'" style="margin-left: 10px; color: #0ab88e" class="nickname_audit" title="审核通过">审核通过</a></small></small>';
				}

                var robot = '';
                if(memberList[i].robot===1){
					robot = '<em class="robot" title="机器人">机</em>';
				}

				list.push('  <td class="row20 left"><img onerror="javascript:this.src=\'/static/images/default_user.jpg\';" src="'+photo+'" class="litpic" style="width:60px; height:60px;" />'+robot+'<span>'+memberList[i].username+'<br /><small>'+memberList[i].nickname+(memberList[i].fenxiao ? '<br />' + (memberList[i].fenxiao_level ? '<code>'+memberList[i].fenxiao_level+'</code>' : fenxiaoName) : '')+'</small></span>'+cancellation+audit+'</td>');
				var company = "";
				var certify = "";
				var realname = memberList[i].company ? memberList[i].company : memberList[i].realname;
				var level = '<small><code style="padding: 1px 4px; margin-right: 3px; display: inline-block; vertical-align: bottom; line-height: 16px; background: #F7FAFF; border: 1px solid #CED9ED; border-radius: 4px; color: #7D8FB3;">'+memberList[i].cityname+'</code><span class="label '+(memberList[i].sex == '女' ? 'label-warning' : 'label-info')+'" style="margin-right:3px; '+(memberList[i].sex == '女' ? 'background: #FFF0F2!important; border: 1px solid #FFDEE3!important; color: #FF4C6A!important;' : '')+'">'+memberList[i].sex+'</span>';
				if(memberList[i].level){
					level += '<span class="label label-info"style="margin-right:3px;background-image: linear-gradient(120deg,#695C48 40%,#796C59 30%); border:1px solid #695C48!important; color: #FFF3DE!important;" title="'+memberList[i].level+"\r过期时间："+huoniao.transTimes(memberList[i].expired, 2)+'"><svg width="13px" height="12px"><path fill-rule="evenodd"  fill="rgb(255, 243, 222)" d="M3.662,11.004 L6.565,10.970 L12.672,2.996 L9.000,3.000 L5.679,7.559 L5.639,3.067 L2.657,3.102 L3.662,11.004 Z"/><path fill-rule="evenodd"  opacity="0.302" fill="rgb(184, 171, 151)" d="M7.000,4.999 L3.000,12.000 L-0.001,3.999 L1.000,-0.000 L7.000,1.000 L7.000,4.999 Z"/></svg>'+memberList[i].level+'</span>';
				}else{
					// level += '<span class="label"style="margin-right:3px;" title="普通会员">普</span>';
				}

				if(memberList[i].from_uid){
					company += '<span class="label label-info" style="margin-right:3px"><a href="javascript:;" class="userinfo" data-id="'+memberList[i].from_uid+'" style="color: #409eff;" title="推荐人：'+memberList[i].from_name+'">荐 </a></span>';
				}

				if(memberList[i].from_countuid > 0){
					company += '<code style="padding: 1px 4px; margin-right: 3px; display: inline-block; vertical-align: bottom; line-height: 16px; background: #fff!important; border: 1px solid #D4E9FF!important; color: #409EFF!important;" title="总推荐：'+memberList[i].from_countuid+'人">'+ memberList[i].from_countuid +'人 </code>';

				}

				if(memberList[i].online){
					company += '<code style="padding: 1px 4px; display: inline-block; vertical-align: bottom; line-height: 16px;">在线</code>';
				}
				company += '</small>';


				list.push('  <td class="row15 left"><small style="margin-bottom: 5px;">'+realname+'</small>'+level+company+'</td>');
				var emailCheck = "", phoneCheck = "";
				if(memberList[i].emailCheck == 1){
					emailCheck = " label-success";
				}
				if(memberList[i].phoneCheck == 1){
					phoneCheck = " label-success";
				}
				list.push('  <td class="row13 left"><span class="label'+emailCheck+'" style="margin-right:3px;">验</span>'+memberList[i].email+'<br /><span class="label'+phoneCheck+'" style="margin-right:3px;">验</span>'+memberList[i].phone+'</td>');
				list.push('  <td class="row13 left"><span><code class="uaccount">余 额</code>'+memberList[i].money+'</span><br /><small><span><code class="uaccount" style="margin-top: -4px;">'+pointname+'</code>'+memberList[i].point+'</span><br /><span><code class="uaccount">'+payname+'</code>'+memberList[i].bonus+'</span></small></td>');
				list.push('  <td class="row12 left">'+memberList[i].regtime+'<br /><small>'+memberList[i].lastlogintime+'</small></td>');
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

				var statetype = '';
				if(memberList[i].is_cancellation!=1){

					statetype = '<span class="more"><s></s></span>';
				}
				list.push('  <td class="row10 state">'+state+statetype+'</td>');
				list.push('  <td class="row8"><a href="/?action=authorizedLogin&id='+memberList[i].id+'" class="authorizedLogin" target="_blank" title="授权登录此会员账号">登录</a><a href="memberList.php?dopost=Edit&id='+memberList[i].id+'" data-id="'+memberList[i].id+'" class="edit" data-title="'+memberList[i].username+'" title="修改会员信息" style="margin: 0 10px;">修改</a><a href="javascript:;" class="del" title="删除会员">删除</a></td>');
				list.push('</tr>');
			}

			obj.find("tbody").html(list.join(""));
			$("#loading").hide();
			$("#list table").show();
			huoniao.showPageInfo();

			if(page==1){ //第一页时，加载统计
				listCount(data.join("&"))
			}
		}else{
			listCount(data.join("&"));
			obj.find("tbody").html("");
			huoniao.showTip("warning", val.info, "auto");
			$("#loading").html(val.info).show();
		}
	});
};
