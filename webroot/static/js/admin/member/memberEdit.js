var ctype = "";
var keywords = '';
$(function () {

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {

		//选中样式切换
		funTrStyle: function(){
			// var list = ctype == "money" ? "list" : "list_",
			// 	selectBtn = ctype == "money" ? "selectBtn" : "selectBtn_";
			var list =" ",
				selectBtn =" ";


			if(ctype == "money"){
				list = "list"
				pageInfo  = "pageInfo";
				selectBtn = "selectBtn"
				loading   = "loading"
				pageBtn   = "pageBtn"
			}else if(ctype == "point"){
				list = "list_"
				pageInfo = "pageInfo_";
				selectBtn = "selectBtn_"
				loading  = "loading_"
				pageBtn   = "pageBtn_"
			}else if (ctype == "bonus"){
				list = "list_2"
				pageInfo = "pageInfo_2";
				selectBtn = "selectBtn_2"
				loading  = "loading_2"
				pageBtn   = "pageBtn_2"
			}else{
				list = "list_1"
				pageInfo = "pageInfo_1";
				selectBtn = "selectBtn_1"
				loading  = "loading_1"
				pageBtn   = "pageBtn_1"
			}
			var trLength = $("#"+list+" tbody tr").length, checkLength = $("#"+list+" tbody tr.selected").length;
			if(trLength == checkLength){
				$("#"+selectBtn+" .check").removeClass("checked").addClass("checked");
			}else{
				$("#"+selectBtn+" .check").removeClass("checked");
			}
		}

		//删除
		,del: function(type){
			var list =" ",
				selectBtn =" ";


			if(ctype == "money"){
				list = "list"
				selectBtn = "selectBtn"
			}else if(ctype == "point"){
				list = "list_"
				selectBtn = "selectBtn_"
			}else if (ctype == "bonus"){
				list = "list_2"
				selectBtn = "selectBtn_2"
			}else{
				list = "list_1"
				selectBtn = "selectBtn_1"
			}
			var checked = $("#"+list+" tbody tr.selected");
			if(checked.length < 1 && type == ""){
				huoniao.showTip("warning", "未选中任何信息！", "auto");
			}else{
				huoniao.showTip("loading", "正在操作，请稍候...");
				var id = [];
				for(var i = 0; i < checked.length; i++){
					id.push($("#"+list+" tbody tr.selected:eq("+i+")").attr("data-id"));
				}

				var action = type == "all" ? "clear" : "";
				huoniao.operaJson("memberList.php?dopost=delAmount", "userid="+$("#id").val()+"&type="+ctype+"&action="+action+"&id="+id, function(data){
					huoniao.hideTip();
					if(data.state == 100){
						huoniao.showTip("success", "操作成功！", "auto");
						$("#"+selectBtn+" a:eq(1)").click();
						setTimeout(getList, 2000);
					}else if(data.state == 101){
						$.dialog.alert(data.info);
					}else{
						var info = [];
						for(var i = 0; i < $("#"+list+" tbody tr").length; i++){
							var tr = $("#"+list+" tbody tr:eq("+i+")");
							for(var k = 0; k < data.info.length; k++){
								if(data.info[k] == tr.attr("data-id")){
									info.push("▪ "+tr.find("td:eq(3)").text());
								}
							}
						}
						$.dialog.alert("<div class='errInfo'><strong>以下信息删除失败：</strong><br />" + info.join("<br />") + '</div>', function(){
							getList();
						});
					}
				});
				$("#"+selectBtn+" a:eq(1)").click();
			}
		}

		//重新上传时删除已上传的文件
		,delFile: function(b, d, c) {
			var g = {
				mod: "siteConfig",
				type: "delCard",
				picpath: b,
				randoms: Math.random()
			};
			$.ajax({
				type: "POST",
				cache: false,
				async: d,
				url: "/include/upload.inc.php",
				dataType: "json",
				data: $.param(g),
				success: function(a) {
					try {
						c(a)
					} catch(b) {}
				}
			})
		}
	};

	huoniao.choseCity($(".choseCity"),$("#cityid"))


	//会员等级
	$("#clevel li a").bind("click", function(){
		var t = $(this), id = t.data("id"), txt = t.text();
		$("#level").val(id);
		$("#clevel button").html(txt + '<span class="caret"></span>');
	});

	//手机号码区域
	$("#phoneArea").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#areaCode").val(id.replace("+", ""));
		$("#phoneArea button").html(id+'<span class="caret"></span>');
	});

    //昵称审核、通过
    $('.nickname_audit').bind('click', function(){
        var t = $(this);
        $.dialog.confirm('确定要审核吗？', function(){
            $('#nickname').val($('#nickname_audit').val());
            $('#nickname_audit, #nickname_state').val('');
            t.closest('dl').hide();
        });
    });

    //昵称审核、取消
    $('.nickname_audit1').bind('click', function(){
        var t = $(this);
        $('#nickname_audit, #nickname_state').val('');
        t.closest('dl').hide();
    });

    //头像审核、通过
    $('.photo_audit').bind('click', function(){
        var t = $(this);
        $.dialog.confirm('确定要审核吗？', function(){
            var imgSrc = t.closest('dd').find('img').attr('src');
            $('#listSection1 a').attr('href', imgSrc);
            $('#listSection1 img').attr('src', imgSrc);
            $('#litpic').val($('#photo_audit').val());
            $('#photo_audit, #photo_state').val('');
            t.closest('dl').hide();
        });
    });

    //头像审核、取消
    $('.photo_audit1').bind('click', function(){
        var t = $(this);
        $('#photo_audit, #photo_state').val('');
        t.closest('dl').hide();
    });

	//头部导航切换
	$(".config-nav button").bind("click", function(){
		var index = $(this).index(), type = $(this).attr("data-type");
		if(!$(this).hasClass("active")){
			$(".item").hide();
			$(".item:eq("+index+")").fadeIn();
			if(index != 0){
				ctype = type;
				var oobj = "list";
				if(ctype == "point"){
					oobj = "list_";
				}
				if(ctype == "invite"){
					oobj = "list_1";
				}
				if(ctype == "bonus"){
					oobj = "list_2";
				}
				if(ctype == "promotion"){
					oobj = "list_3";
				}
				if($("#"+oobj).find("tbody").html() == ""){
					getList();
				}
			}
		}
	});


	var license = $("#licenseObj").val();
	if(license != ""){
		$("#licenseObj").siblings("iframe").hide();
		var media = '<img src="'+cfg_attachment+license+'" />';
		$("#licenseObj").siblings(".spic").find(".sholder").html(media);
		$("#licenseObj").siblings(".spic").find(".reupload").attr("style", "display:inline-block;");
		$("#licenseObj").siblings(".spic").show();
	}

	var idcardFront = $("#idcardFrontObj").val();
	if(idcardFront != ""){
		$("#idcardFrontObj").siblings("iframe").hide();
		var media = '<img src="'+cfg_attachment+idcardFront+'" />';
		$("#idcardFrontObj").siblings(".spic").find(".sholder").html(media);
		$("#idcardFrontObj").siblings(".spic").find(".reupload").attr("style", "display:inline-block;");
		$("#idcardFrontObj").siblings(".spic").show();
	}

	var idcardBack = $("#idcardBackObj").val();
	if(idcardBack != ""){
		$("#idcardBackObj").siblings("iframe").hide();
		var media = '<img src="'+cfg_attachment+idcardBack+'" />';
		$("#idcardBackObj").siblings(".spic").find(".sholder").html(media);
		$("#idcardBackObj").siblings(".spic").find(".reupload").attr("style", "display:inline-block;");
		$("#idcardBackObj").siblings(".spic").show();
	}

	//表单验证
	$("#editform").delegate("input,textarea", "focus", function(){
		var tip = $(this).siblings(".input-tips");
		if(tip.html() != undefined){
			tip.removeClass().addClass("input-tips input-focus").attr("style", "display:inline-block");
		}
	});

	$("#editform").delegate("input,textarea", "blur", function(){
		var obj = $(this);
		huoniao.regex(obj);
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

	//出生日期
	$("#birthday").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});
	$("#expired").datetimepicker({format: 'yyyy-mm-dd hh:ii:ss', autoclose: true, language: 'ch'});

	$("input[name=mtype]").bind("click", function(){
		var val = $(this).val();
		if(val == 1){
			$("#companyobj").hide();
		}else{
			$("#companyobj").show();
		}
	})

	$("input[name=licenseState]").bind("click", function(){
		var val = $(this).val();
		if(val == 2){
			$(this).closest("dl").next("dl").show();
		}else{
			$(this).closest("dl").next("dl").hide();
		}
	})

	$("input[name=state], input[name=certifyState]").bind("click", function(){
		var val = $(this).val();
		if(val == 2){
			$(this).closest("dl").next("dl").show();
		}else{
			$(this).closest("dl").next("dl").hide();
		}
	})


	//取消推荐人关联
	$('#unlink').bind('click', function(){
		$.dialog.confirm('此操作不可恢复，确定要取消关联吗？', function(){
			huoniao.showTip("loading", "正在操作，请稍候...");
			huoniao.operaJson("memberList.php?dopost=unlink", "userid="+$("#id").val(), function(data){
				huoniao.hideTip();
				if(data.state == 100){
					huoniao.showTip("success", "操作成功！", "auto");
					setTimeout(function(){
						location.reload();
					}
					, 2000);
				}else{
					$.dialog({
						title: '错误',
						icon: 'error.png',
						content: data.info,
						ok: true
					});
				}
			});
		});
	});


	//绑定推荐人关联
	$('#bindlink').bind('click', function(){
		$.dialog.confirm('此操作只可以绑定关系，不会对推荐人增加推荐奖励！<br />如果有此需求可以手动为推荐人增加余额。<br /><br />确定要添加绑定吗？', function(){

            $.dialog.prompt('请输入推荐人会员ID',
                function(val){
                    huoniao.showTip("loading", "正在操作，请稍候...");
                    huoniao.operaJson("memberList.php?dopost=bindlink", "userid="+$("#id").val()+"&recid="+val, function(data){
                        huoniao.hideTip();
                        if(data.state == 100){
                            huoniao.showTip("success", "操作成功！", "auto");
                            setTimeout(function(){
                                location.reload();
                            }
                            , 2000);
                        }else{
                            $.dialog({
                                title: '错误',
                                icon: 'error.png',
                                content: data.info,
                                ok: true
                            });
                        }
                    });
                }
            );
			
		});
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

	//筛选收入 支出
	$("#stateBtn a,#stateBtn_ a,#stateBtn_2 a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();		
		$('#filtertype').html($(this).attr("data-id"));
		$("#list").attr("data-atpage", 1);
		obj.find("button").html(title+'<span class="caret"></span>');
		getList();
		
		
	});

	//单选
	$("#list tbody,#list_2 tbody").delegate("tr", "click", function(event){
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

	//全选、不选
	$("#selectBtn_ a").bind("click", function(){
		var id = $(this).attr("data-id");
		if(id=='noopr'){
			$('#selectBtn_').removeClass('open');
		}else{
			if(id == 1){
				$("#selectBtn_ .check").addClass("checked");
				$("#list_ tr").removeClass("selected").addClass("selected");
			}else{
				$("#selectBtn_ .check").removeClass("checked");
				$("#list_ tr").removeClass("selected");
			}
		}
	});

	//全选、不选
	$("#selectBtn_2 a").bind("click", function(){
		var id = $(this).attr("data-id");
		if(id=='noopr'){
			$('#selectBtn_2').removeClass('open');
		}else{
			if(id == 1){
				$("#selectBtn_2 .check").addClass("checked");
				$("#list_ tr").removeClass("selected").addClass("selected");
			}else{
				$("#selectBtn_2 .check").removeClass("checked");
				$("#list_ tr").removeClass("selected");
			}
		}
	});

	$("#list_ tbody").delegate("tr", "click", function(event){
		var isCheck = $(this), checkLength = $("#list_ tbody tr.selected").length;
		if(event.target.className.indexOf("check") > -1) {
			if(isCheck.hasClass("selected")){
				isCheck.removeClass("selected");
			}else{
				isCheck.addClass("selected");
			}
		}else{
			if(checkLength > 1){
				$("#list_ tr").removeClass("selected");
				isCheck.addClass("selected");
			}else{
				if(isCheck.hasClass("selected")){
					isCheck.removeClass("selected");
				}else{
					$("#list_ tr").removeClass("selected");
					isCheck.addClass("selected");
				}
			}
		}

		init.funTrStyle();
	});

    //删除文件
	$(".spic .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
		init.delFile(input.val(), false, function(){
			input.val("");
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});

	//设备查看全部
	$(".sourceSee").click(function(){
		var t = $(this);
		if(t.hasClass('disable')){
			$('.sourceclienthide').hide();
			t.removeClass('disable');
			t.html('查看全部');
		}else{
			$('.sourceclienthide').show();
			t.addClass('disable');
			t.html('收起');
		}
	});


	//余额、积分回车提交
	$("input[name='operaPoint'],input[name='operaBonus'], input[name='operaPointInfo'], input[name='operaMoney'], input[name='operaMoneyInfo'], input[name='keywords'], input[name='operaPromotion'], input[name='operaPromotionInfo']").keyup(function (e) {
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
				$(this).closest("dl").find(".btn").click();
			}
	});


	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		$('#addr').val($('#addrList .addrBtn').attr('data-id'));

		var t            = $(this),
			id           = $("#id").val(),
			token        = $("#token").val(),
			mtype        = $("input[name=mtype]:checked").val(),
			level        = $("#level"),
			expired      = $("#expired"),
			password     = $("#password"),
			discount     = $("#discount"),
			nickname     = $("#nickname"),
			nickname_audit = $("#nickname_audit"),
			nickname_state = $("#nickname_state"),
			email        = $("#email"),
			emailCheck   = $("#emailCheck").attr("checked") == "checked" ? 1 : 0,
			areaCode     = $("#areaCode"),
			phone        = $("#phone"),
			phoneCheck   = $("#phoneCheck").attr("checked") == "checked" ? 1 : 0,
			paypwd       = $("#paypwd"),
			qq           = $("#qq"),
			freeze       = $("#freeze"),
			litpic       = $("#litpic"),
			sex          = $("input[name=sex]:checked").val(),
			birthday     = $("#birthday"),
            nation       = $('#nation'),
			company      = $("#company"),
			cityid       = $("#cityid"),
			lock_cityid  = $("#lock_cityid"),
			addr         = $("#addr"),
			address      = $("#address"),
			realname     = $("#realname"),
			idcard       = $("#idcard"),
			idcardFront  = $("#idcardFrontObj"),
			idcardBack   = $("#idcardBackObj"),
			certifyState = $("input[name=certifyState]:checked").val(),
			certifyInfo  = $("#certifyInfo"),
			license      = $("#licenseObj"),
			licenseState = $("input[name=licenseState]:checked").val(),
			licenseInfo  = $("#licenseInfo"),
			state        = $("input[name=state]:checked").val(),
			description  = $("#description"),
			stateinfo    = $("#stateinfo"),
			wechat_conn    = $("#wechat_conn"),
			wechat_openid    = $("#wechat_openid"),
			wechat_app_openid    = $("#wechat_app_openid"),
			wechat_mini_openid    = $("#wechat_mini_openid");

		//密码
		if(password.val() != ""){
			if(!huoniao.regex(password)){
				huoniao.goTop();
				return false;
			}
		};

		//打折卡号
		if(!huoniao.regex(discount)){
			// huoniao.goTop();
			// return false;
		};

		//真实姓名
		if(!huoniao.regex(nickname)){
			huoniao.goTop();
			return false;
		};

		//邮箱
		if(email.val() != "" && !huoniao.regex(email)){
			huoniao.goTop();
			return false;
		};

		//手机
		// if(phone.val() == ""){
		// 	huoniao.goTop();
		// 	return false;
		// };

		//QQ
		if(qq.val() != "" && !huoniao.regex(qq)){
			huoniao.goTop();
			return false;
		};

		//头像
		if(litpic.val() == ""){
			//$.dialog.alert("请上传头像！");
			//huoniao.goTop();
			//return false;
		};

		if(mtype == 2){
			//公司名称
			if(!huoniao.regex(company)){
				return false;
			}

			//所在区域
			if(addr.val() == 0){
				$.dialog.alert("请选择所在区域！");
				return false;
			}

			//详细地址
			if(address.val() == "" || !huoniao.regex(address)){
				$.dialog.alert("请输入公司详细地址！");
				return false;
			}
		};

		t.attr("disabled", true);

		var data = [];
		data.push("dopost=Edit");
		data.push("id="+id);
		data.push("token="+token);
		data.push("mtype="+mtype);
		data.push("level="+level.val());
		data.push("expired="+expired.val());
		data.push("password="+encodeURIComponent(password.val()));
		data.push("discount="+discount.val());
		data.push("nickname="+encodeURIComponent(nickname.val()));
		data.push("nickname_audit="+(nickname_audit.size() > 0 ? nickname_audit.val() : ''));
		data.push("nickname_state="+(nickname_state.size() > 0 ? nickname_state.val() : ''));
		data.push("email="+email.val());
		data.push("emailCheck="+emailCheck);
		data.push("areaCode="+areaCode.val());
		data.push("phone="+phone.val());
		data.push("phoneCheck="+phoneCheck);
		data.push("paypwd="+encodeURIComponent(paypwd.val()));
		data.push("qq="+qq.val());
		data.push("freeze="+freeze.val());
		data.push("photo="+encodeURIComponent(litpic.val()));
		data.push("photo_audit="+($('#photo_audit').size() > 0 ? encodeURIComponent($('#photo_audit').val()) : ''));
		data.push("photo_state="+($('#photo_state').size() > 0 ? $('#photo_state').val() : ''));
		data.push("sex="+sex);
		data.push("birthday="+birthday.val());
		data.push("nation="+nation.val());
		data.push("company="+encodeURIComponent(company.val()));
		data.push("cityid="+cityid.val());
		data.push("lock_cityid="+lock_cityid.val());
		data.push("addr="+addr.val());
		data.push("address="+encodeURIComponent(address.val()));
		data.push("realname="+realname.val());
		data.push("idcard="+idcard.val());
		data.push("idcardFront="+idcardFront.val());
		data.push("idcardBack="+idcardBack.val());
		data.push("certifyState="+certifyState);
		data.push("certifyInfo="+certifyInfo.val());
		data.push("license="+license.val());
		data.push("licenseState="+licenseState);
		data.push("licenseInfo="+licenseInfo.val());
		data.push("description="+description.val());
		data.push("state="+state);
		data.push("stateinfo="+encodeURIComponent(stateinfo.val()));
		data.push("wechat_conn="+wechat_conn.val());
		data.push("wechat_openid="+wechat_openid.val());
		data.push("wechat_app_openid="+wechat_app_openid.val());
		data.push("wechat_mini_openid="+wechat_mini_openid.val());
		data.push("submit="+encodeURI("提交"));

		$.ajax({
			type: "POST",
			url: "memberList.php",
			data: data.join("&"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					$.dialog({
						fixed: true,
						title: "修改成功",
						icon: 'success.png',
						content: "修改成功",
						ok: function(){
							t.attr("disabled", false);
						},
						cancel: false
					});
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

	//帐户余额操作
	$("#operaMoney").bind("click", function(){
		var type = $("input[name=moneyOpera]:checked").val(),
			amount = $("input[name=operaMoney]").val(),
			operaMoneyInfo = $("input[name=operaMoneyInfo]").val();
		if(!/^[1-9]\d*$/.test(amount)){
			huoniao.showTip("error", "请输入正确的金额！", "auto");
		}
		if($.trim(operaMoneyInfo) == ""){
			huoniao.showTip("error", "请输入操作原因！", "auto");
		}
		var data = [];
		data.push("action=money");
		data.push("userid="+$("#id").val());
		data.push("type="+type);
		data.push("amount="+amount);
		data.push("info="+operaMoneyInfo);
		huoniao.showTip("loading", "正在操作，请稍候...");
		huoniao.operaJson("memberList.php?dopost=operaAmount", data.join("&"), function(val){
			if(val.state == "100"){
				huoniao.showTip("success", "操作成功！", "auto");
				$("input[name=operaMoney], input[name=operaMoneyInfo]").val("");
				$("#moneyObj").html(val.money.toFixed(2));
				$("#freezeObj").html(val.freeze.toFixed(2));
				$("#pointObj").html(val.point);
				setTimeout(function(){
					getList();
				}, 1000);
			}else{
				huoniao.showTip("error", val.info, "auto");
			}
		});
	});

	//保障金操作
	$("#operaPromotion").bind("click", function(){
		var type = $("input[name=promotionOpera]:checked").val(),
			amount = $("input[name=operaPromotion]").val(),
			operaPromotionInfo = $("input[name=operaPromotionInfo]").val();
		if(!/^[1-9]\d*$/.test(amount)){
			huoniao.showTip("error", "请输入正确的金额！", "auto");
		}
		if($.trim(operaPromotionInfo) == ""){
			huoniao.showTip("error", "请输入操作原因！", "auto");
		}
		var data = [];
		data.push("action=promotion");
		data.push("userid="+$("#id").val());
		data.push("type="+type);
		data.push("amount="+amount);
		data.push("info="+operaPromotionInfo);
		huoniao.showTip("loading", "正在操作，请稍候...");
		huoniao.operaJson("memberList.php?dopost=operaAmount", data.join("&"), function(val){
			if(val.state == "100"){
				huoniao.showTip("success", "操作成功！", "auto");
				$("input[name=operaPromotion], input[name=operaPromotionInfo]").val("");
                $("#promotionObj").html(val.promotion.toFixed(2));
				setTimeout(function(){
					getList();
				}, 2000);
			}else{
				huoniao.showTip("error", val.info, "auto");
			}
		});
	});

	//帐户积分操作
	$("#operaPoint").bind("click", function(){
		var type = $("input[name=pointOpera]:checked").val(),
			amount = $("input[name=operaPoint]").val(),
			operaPointInfo = $("input[name=operaPointInfo]").val();
		if(!/^[1-9]\d*$/.test(amount)){
			huoniao.showTip("error", "请输入正确的金额！", "auto");
		}
		if($.trim(operaPointInfo) == ""){
			huoniao.showTip("error", "请输入操作原因！", "auto");
		}
		var data = [];
		data.push("action=point");
		data.push("userid="+$("#id").val());
		data.push("type="+type);
		data.push("amount="+amount);
		data.push("info="+operaPointInfo);
		huoniao.showTip("loading", "正在操作，请稍候...");
		huoniao.operaJson("memberList.php?dopost=operaAmount", data.join("&"), function(val){
			if(val.state == "100"){
				huoniao.showTip("success", "操作成功！", "auto");
				$("input[name=operaPoint], input[name=operaPointInfo]").val("");
				$("#moneyObj").html(val.money.toFixed(2));
				$("#pointObj").html(val.point);
				setTimeout(function(){
					getList();
				}, 2000);
			}else{
				huoniao.showTip("error", val.info, "auto");
			}
		});
	});

	//消费金操作
	$("#operaBonus").bind("click", function(){
		var type = $("input[name=bonusOpera]:checked").val(),
			amount = $("input[name=operaBonus]").val(),
			operaBonusInfo = $("input[name=operaBonusInfo]").val();
		if(!/^[1-9]\d*$/.test(amount)){
			huoniao.showTip("error", "请输入正确的金额！", "auto");
		}
		if($.trim(operaBonusInfo) == ""){
			huoniao.showTip("error", "请输入操作原因！", "auto");
		}
		var data = [];
		data.push("action=bonus");
		data.push("userid="+$("#id").val());
		data.push("type="+type);
		data.push("amount="+amount);
		data.push("info="+operaBonusInfo);
		huoniao.showTip("loading", "正在操作，请稍候...");
		huoniao.operaJson("memberList.php?dopost=operaAmount", data.join("&"), function(val){
			if(val.state == "100"){
				huoniao.showTip("success", "操作成功！", "auto");
				$("input[name=operaBonus], input[name=operaBonusInfo]").val("");
				$("#moneyObj").html(val.money.toFixed(2));
				$("#pointObj").html(val.point);
				$("#bonusObj").html(val.bonus);
				setTimeout(function(){
					getList();
				}, 2000);
			}else{
				huoniao.showTip("error", val.info, "auto");
			}
		});
	});


	//搜索推荐会员
	$("#operaSearch").bind("click", function(){
		keywords = $.trim($('input[name="keywords"]').val());
		getList();
	});

	//删除
	$("#delMoney, #delPoint,#delBonus").bind("click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del();
		});
	});

	$("#ClearMoney, #ClearPoint,#ClearBonus").bind("click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del("all");
		});
	});

	//单条删除
	$("#list, #list_,#list_2").delegate(".del", "click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del();
		});
	});
	//余额搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#list").attr("data-atpage", 1);
		getList();
	});

	//余额搜索回车提交
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

	//保证金搜索
	$("#promotionsearchBtn").bind("click", function(){
		$("#promotionsKeyword").html($("#promotionkeyword").val());
		$("#list_3").attr("data-atpage", 1);
		getList();
	});

	//积分搜索
	$("#pointsearchBtn").bind("click", function(){
		$("#pointsKeyword").html($("#pointkeyword").val());
		$("#list").attr("data-atpage", 1);
		getList();
	});

	//积分搜索回车提交
	$("#pointkeyword").keyup(function (e) {
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
	      $("#pointsearchBtn").click();
	    }
	});

	//消费金搜索
	$("#bonussearchBtn").bind("click", function(){
		$("#bonussKeyword").html($("#bonuskeyword").val());
		$("#list").attr("data-atpage", 1);
		getList();
	});

	//消费金搜索回车提交
	$("#bonuskeyword").keyup(function (e) {
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
			$("#bonussearchBtn").click();
		}
	});
	// 余额导出
	$("#export").click(function(e){
		// e.preventDefault();
		var sKeyword = $("#keyword").val(),
			cityid = $("#cityid").val(),
			filtertype = $("#filtertype").html();

		var data = [];
		data.push("search="+sKeyword);
		data.push("cityid="+cityid);
		data.push("pay="+filtertype);
		data.push("userid="+$("#id").val());
		data.push("pagestep=200000");
		data.push("page=1");

		$(this).attr('href', 'memberList.php?dopost=amountList&type=money&do=export&'+data.join('&'));

	})
	// 保证金导出
	$("#promotionexport").click(function(e){
		// e.preventDefault();
		var sKeyword = $("#promotionkeyword").val(),
		filtertype = $("#filtertype").html();
		
		var data = [];
		data.push("search="+sKeyword);
		data.push("pay="+filtertype);
		data.push("userid="+$("#id").val());
		$(this).attr('href', 'memberList.php?dopost=amountList&type=promotion&do=export&pagestep=99999&'+data.join('&'));

	})
	//消费金导出
	$("#bonusexport").click(function(e){
		// e.preventDefault();
		var sKeyword = $("#bonuskeyword").val(),
			cityid = $("#cityid").val(),
			filtertype = $("#filtertype").html();

		var data = [];
		data.push("search="+sKeyword);
		data.push("cityid="+cityid);
		data.push("pay="+filtertype);
		data.push("userid="+$("#id").val());
		data.push("pagestep=200000");
		data.push("page=1");

		$(this).attr('href', 'memberList.php?dopost=amountList&type=bonus&do=export&'+data.join('&'));

	})
	// 积分导出
	$("#pointexport").click(function(e){
		// e.preventDefault();
		var sKeyword = $("#pointkeyword").val(),
			cityid = $("#cityid").val(),
			filtertype = $("#filtertype").html();

		var data = [];
		data.push("search="+sKeyword);	
		data.push("cityid="+cityid);
		data.push("pay="+filtertype);
		data.push("userid="+$("#id").val());
		data.push("pagestep=200000");
		data.push("page=1");

		$(this).attr('href', 'memberList.php?dopost=amountList&type=point&do=export&'+data.join('&'));

	})

    //去审核保障金
    $("#list_3").delegate(".bondLog", "click", function (event) {
        var t = $(this), _id = t.attr('data-id'), _name = t.attr('data-name'), _href = t.attr('data-href');
        try {
            event.preventDefault();
            parent.addPage('bondLogphp', _id, _name, _href);
        } catch (e) {
        }
    });

});


//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	var  list = '';
	// var list = ctype == "money" ? "list" : (ctype == "point" ? "list_" : "list_1"),

		// pageInfo = ctype == "money" ? "pageInfo" : (ctype == "point" ? "pageInfo_" : "pageInfo_1"),
		// selectBtn = ctype == "money" ? "selectBtn" : (ctype == "point" ? "selectBtn_" : "selectBtn_1"),
		// loading = ctype == "money" ? "loading" : (ctype == "point" ? "loading_" : "loading_1"),
		// pageBtn = ctype == "money" ? "pageBtn" : (ctype == "point" ? "pageBtn_" : "pageBtn_1");
	console.log(ctype);
		if(ctype == "money"){
			list = "list"
			pageInfo  = "pageInfo";
			selectBtn = "selectBtn"
			loading   = "loading"
			pageBtn   = "pageBtn"
		}else if(ctype == "promotion"){
			list = "list_3"
			pageInfo = "pageInfo_3";
			selectBtn = "selectBtn_3"
			loading  = "loading_3"
			pageBtn   = "pageBtn_3"
		}else if(ctype == "point"){
			list = "list_"
			pageInfo = "pageInfo_";
			selectBtn = "selectBtn_"
			loading  = "loading_"
			pageBtn   = "pageBtn_"
		}else if (ctype == "bonus"){
			list = "list_2"
			pageInfo = "pageInfo_2";
			selectBtn = "selectBtn_2"
			loading  = "loading_2"
			pageBtn   = "pageBtn_2"
		}else{
			list = "list_1"
			pageInfo = "pageInfo_1";
			selectBtn = "selectBtn_1"
			loading  = "loading_1"
			pageBtn   = "pageBtn_1"
		}

	$("#"+list+" table, #"+pageInfo).hide();
	$("#"+selectBtn+" a:eq(1)").click();
	$("#"+loading).html("加载中，请稍候...").show();

	var page = $("#"+list).attr("data-atpage") ? $("#"+list).attr("data-atpage") : "1";
	var sKeyword ="";
		if(ctype == 'money'){
			sKeyword = encodeURIComponent($("#sKeyword").html());
		}else if(ctype == 'point'){
				sKeyword = encodeURIComponent($("#pointsKeyword").html())
		}else if(ctype == 'promotion'){
			sKeyword = encodeURIComponent($("#promotionsKeyword").html())
		}else{
			sKeyword = encodeURIComponent($("#bonussKeyword").html())
			console.log(sKeyword);
		}

		filtertype    = $("#filtertype").html();
		

	var data = [];
		data.push("search="+sKeyword);
		data.push("pay="+filtertype);
		data.push("type="+ctype);
		data.push("userid="+$("#id").val());
		data.push("pagestep=20");
		data.push("keywords=" + keywords);
		data.push("page="+page);

	huoniao.operaJson("memberList.php?dopost=amountList", data.join("&"), function(val){
		var obj = $("#"+list), listArr = [], i = 0, memberList = val.memberList;
		if(ctype == 'invite'){
			$('#totalInvite').html('共'+val.pageInfo.totalCount+'人，奖金' + val.pageInfo.totalMoney + '元');
		}

		if(val.state == "100"){

			obj.attr("data-totalpage", val.pageInfo.totalPage);
		
			// if(ctype == 'money'){
			// 	$(".totalCount").html(val.pageInfo.totalCount);
			// 	$(".allInmoney").html(val.pageInfo.countPrice);
			// 	$(".allOutmoney").html(val.pageInfo.countPayPrice);
			// 	$("#totalInmoney").html(val.pageInfo.totalPrice);
			// 	$("#totalOutmoney").html(val.pageInfo.totalPayPrice);
			// }else if(ctype == 'point'){
			// 	$(".pointtotalCount").html(val.pageInfo.totalCount);
			// 	$(".allInpoint").html(val.pageInfo.countPrice);
			// 	$(".allOutpoint").html(val.pageInfo.countPayPrice);
			// 	$("#totalInpoint").html(val.pageInfo.totalPrice);
			// 	$("#totalOutpoint").html(val.pageInfo.totalPayPrice);
			// }
			if(ctype == 'money'){
				$(".totalCount").html(val.pageInfo.totalCount);
				$(".allInmoney").html(val.pageInfo.countPrice);
				$(".allOutmoney").html(val.pageInfo.countPayPrice);
				$("#totalInmoney").html(val.pageInfo.totalPrice);
				$("#totalOutmoney").html(val.pageInfo.totalPayPrice);
			}else if(ctype == 'point'){
				$(".pointtotalCount").html(val.pageInfo.totalCount);
				$(".allInpoint").html(val.pageInfo.countPrice);
				$(".allOutpoint").html(val.pageInfo.countPayPrice);
				$("#totalInpoint").html(val.pageInfo.totalPrice);
				$("#totalOutpoint").html(val.pageInfo.totalPayPrice);
			}else if(ctype == 'promotion'){
				$(".promotiontotalCount").html(val.pageInfo.totalCount);
				$(".allInpromotion").html(val.pageInfo.totalPayCount);
				$(".allOutpromotion").html(val.pageInfo.totalOutCount);
                var totalUseablePrice = (val.pageInfo.userablePrice-val.pageInfo.totalOutPayPrice).toFixed(2);
				$("#totalUseablePrice").html(totalUseablePrice < 0 ? 0 : totalUseablePrice);
				$("#totalPayPrice").html(val.pageInfo.totalPayPrice);
				$("#totalOutPayPrice").html(val.pageInfo.totalOutPayPrice);
			}else if(ctype == 'bonus'){
				$(".bonustotalCount").html(val.pageInfo.totalCount);
				$(".allInbonus").html(val.pageInfo.countPrice);
				$(".allOutbonus").html(val.pageInfo.countPayPrice);
				$("#totalInbonus").html(val.pageInfo.totalPrice);
				$("#totalOutbonus").html(val.pageInfo.totalPayPrice);
			}
			
			huoniao.hideTip();

			for(i; i < memberList.length; i++){
				listArr.push('<tr data-id="'+memberList[i].id+'">');

				if(ctype != 'invite' && ctype != 'promotion'){					
					listArr.push('  <td class="row3"><span class="check"></span></td>');
					var type = '<span class="text-success">收入</span>';
					if(memberList[i].type == 0){
						type = '<span class="text-error">支出</span>';
					}
					listArr.push('  <td class="row15 left">'+type+'</td>');
					listArr.push('  <td class="row15 left">'+memberList[i].amount+'</td>');
					listArr.push('  <td class="row15 left">'+(judgeTime(memberList[i].date) ? memberList[i].balance : '-')+'</td>');
					listArr.push('  <td class="row25 left">'+memberList[i].info+'</td>');
					listArr.push('  <td class="row20 left">'+memberList[i].date+'</td>');
					listArr.push('  <td class="row7"><a href="javascript:;" class="del" title="删除记录">删除</a></td>');
					listArr.push('</tr>');
				}else if(ctype == 'promotion'){
					listArr.push('  <td class="row3">&nbsp;</td>');
					var type = '<span class="text-success">提取</span>';
					if(memberList[i].type == 1){
						type = '<span class="text-error">缴纳</span>';
					}
					listArr.push('  <td class="row12 left">'+type+'</td>');		
                    var extract = '';
                    if(memberList[i].type == 0){
                        extract = '<br />原因：' + memberList[i].title + '<br />说明：' + memberList[i].note;
                    }else if(memberList[i].note != ''){
                        extract = '<br />原因：' + memberList[i].title + '<br />说明：' + memberList[i].note;
                    }
					listArr.push('  <td class="row30 left">'+memberList[i].ordernum+extract+'</td>');
					listArr.push('  <td class="row20 left">'+memberList[i].amount+'</td>');		
					listArr.push('  <td class="row20 left">'+memberList[i].date+'</td>');

                    var stateInfo = '';
                    if(memberList[i].type == 1){
                        stateInfo = '<span class="audit">审核通过</span>';
                    }else{
                        if(memberList[i].state == 0){
                            stateInfo = '<span class="gray">待审核</span>&nbsp;&nbsp;<a href="javascript:;" data-href="member/bondLog.php" class="link bondLog" data-id="finance" data-name="保障金记录">去审核</a>';
                        }else if(memberList[i].state == 1){
                            stateInfo = '<span class="audit">审核通过</span>';
                        }else if(memberList[i].state == 2){
                            stateInfo = '<span class="refuse statusTips1" data-toggle="tooltip" data-placement="bottom" data-original-title="'+memberList[i].reason+'">审核失败 <i class="icon-question-sign" style="margin-top: 3px;"></i></span>';
                        }
                    }

					listArr.push('  <td class="row15 left">'+stateInfo+'</td>');
				}else{
					listArr.push('  <td class="row3">&nbsp;</td>');
					listArr.push('  <td class="row20 left"><a href="javascript:;" class="link userinfo" data-id="'+memberList[i].id+'">'+memberList[i].nickname+'</a></td>');
					listArr.push('  <td class="row17 left">'+memberList[i].phone+'</td>');
					listArr.push('  <td class="row20 left">'+memberList[i].regtime+'</td>');
					listArr.push('  <td class="row40 left">'+memberList[i].money+'</td>');
					listArr.push('</tr>');
				}

			}

			obj.find("tbody").html(listArr.join(""));
			$("#"+loading).hide();
			$("#"+list+" table").show();
			huoniao.showPageInfo(list, pageInfo);
            
            $('.statusTips1').tooltip();
		}else{
			huoniao.showPageInfo(list, pageInfo);

			obj.find("tbody").html("");
			huoniao.showTip("warning", val.info, "auto");
			$("#"+loading).html(val.info).show();
		}
	});

};

//上传成功接收
function uploadSuccess(obj, file, filetype){
	$("#"+obj).val(file);
	var media = '<img src="'+cfg_attachment+file+'" />';
	$("#"+obj).siblings(".spic").find(".sholder").html(media);
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}

// 判断时间
function judgeTime(time){
    var strtime = time.replace(/-/g, "/");//时间转换
    var endtime = "2021-07-13 00:00:00".replace(/-/g, "/");//时间转换
    //时间
    var date1=new Date(strtime);
    //现在时间
    var date2=new Date(endtime);
    //判断时间是否过期
    return date1>date2?true:false;
}
