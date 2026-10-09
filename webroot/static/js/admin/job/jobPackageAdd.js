//实例化编辑器

$(function(){

	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		//树形递归分类
		treeTypeList: function(type){
			var typeList = [], cl = "";
			var l = type == "addr" ? addrListArr : industryListArr;
			var s = type == "addr" ? addrid : industry;
			typeList.push('<option value="0">请选择</option>');
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if(s == jsonArray["id"]){
						selected = " selected";
					}
					typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["typename"]+'</option>');
					if(jArray != undefined){
						for(var k = 0; k < jArray.length; k++){
							cl += '    ';
							var selected = "";
							if(s == jArray[k]["id"]){
								selected = " selected";
							}
							if(jArray[k]['lower'] != ""){
								arguments.callee(jArray[k]);
							}else{
								typeList.push('<option value="'+jArray[k]["id"]+'"'+selected+'>'+cl+"|--"+jArray[k]["typename"]+'</option>');
							}
							if(jsonArray["lower"] == null){
								cl = "";
							}else{
								cl = cl.replace("    ", "");
							}
						}
					}
				})(l[i]);
			}
			return typeList.join("");
		}
	};

	//填充区域
	$("#industry").html(init.treeTypeList("industry"));

	//访问方式
	$("input[name=domaintype]").bind("click", function(){
		var val = $(this).val(), obj = $("#domainObj"), input = $("#domain");
		if(val == 0){
			obj.hide();
		}else if(val == 1){
			input.removeClass().addClass("input-large");
			input.next(".add-on").hide();
			obj.show();
		}else if(val == 2){
			input.removeClass().addClass("input-mini");
			input.next(".add-on").show();
			obj.show();
		}
	});

	//显示与隐藏修改内容
	$(".changeRefuse").click(function (event){
		let item = $(event.target).parent().next().removeClass("hide");
	});
	$(".changeSuccess").click(function (event){
		let item = $(event.target).parent().next().next().addClass("hide");
	});

	$("#job").prop("readOnly",false);
	$("#resume").prop("readOnly",false);
	$("#refresh").prop("readOnly",false);
	$("#top").prop("readOnly",false);
	let type = $(":radio[name=type]:checked").val();
	if(type==="2"){
		$("#resume").prop("readOnly",true);
		$("#refresh").prop("readOnly",true);
		$("#top").prop("readOnly",true);
	}
	else if(type==="3"){
		$("#job").prop("readOnly",true);
		$("#refresh").prop("readOnly",true);
		$("#top").prop("readOnly",true);
	}
	else if(type==="4"){
		$("#job").prop("readOnly",true);
		$("#refresh").prop("readOnly",true);
		$("#resume").prop("readOnly",true);
	}
	else if(type==="5"){
		$("#job").prop("readOnly",true);
		$("#top").prop("readOnly",true);
		$("#resume").prop("readOnly",true);
	}


	/**
	 * 增值包类型修改事件
	 */
	$(":radio[name=type]").change(function (){
		let type = $(":radio[name=type]:checked").val();
		$("#job").prop("readOnly",false);
		$("#resume").prop("readOnly",false);
		$("#refresh").prop("readOnly",false);
		$("#top").prop("readOnly",false);
		if(type==="2"){
			$("#resume").val(0);
			$("#refresh").val(0);
			$("#top").val(0);
			$("#resume").prop("readOnly",true);
			$("#refresh").prop("readOnly",true);
			$("#top").prop("readOnly",true);
		}
		else if(type==="3"){
			$("#job").val(0);
			$("#refresh").val(0);
			$("#top").val(0);
			$("#job").prop("readOnly",true);
			$("#refresh").prop("readOnly",true);
			$("#top").prop("readOnly",true);
		}
		else if(type==="4"){
			$("#job").val(0);
			$("#refresh").val(0);
			$("#resume").val(0);
			$("#job").prop("readOnly",true);
			$("#refresh").prop("readOnly",true);
			$("#resume").prop("readOnly",true);
		}
		else if(type==="5"){
			$("#job").val(0);
			$("#top").val(0);
			$("#resume").val(0);
			$("#job").prop("readOnly",true);
			$("#top").prop("readOnly",true);
			$("#resume").prop("readOnly",true);
		}
	});


	//域名过期时间
	$("#domainexp").datetimepicker({format: 'yyyy-mm-dd hh:ii:ss', autoclose: true, language: 'ch'});

	//标注地图
	$("#mark").bind("click", function(){
		$.dialog({
			id: "markDitu",
			title: "标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）</small>",
			content: 'url:'+adminPath+'../api/map/mark.php?mod=job&lnglat='+$("#lnglat").val()+"&city="+mapCity+"&addr="+$("#address").val(),
			width: 800,
			height: 500,
			max: true,
			ok: function(){
				var doc = $(window.parent.frames["markDitu"].document),
					lng = doc.find("#lng").val(),
					lat = doc.find("#lat").val(),
					addr = doc.find("#addr").val();
				$("#lnglat").val(lng+","+lat);
				if($("#address").val() == ""){
					$("#address").val(addr);
				}
				huoniao.regex($("#address"));
			},
			cancel: true
		});
	});

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

	//模糊匹配会员
	$("#user").bind("input", function(){
		$("#userid").val("0");
		$("#people").val("");
		$("#contact").val("");
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkUser", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#userList").html("").hide();
					$("#people").val("");
					$("#contact").val("");
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'" data-nickname="'+data[i].nickname+'" data-phone="'+data[i].phone+'">'+data[i].username+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#userList")
						.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#userList").html("").hide();
					$("#people").val("");
					$("#contact").val("");
				}
			});

		}else{
			$("#userList").html("").hide();
			$("#people").val("");
			$("#contact").val("");
		}
    });

	$("#userList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id"), nickname = $(this).attr("data-nickname"), phone = $(this).attr("data-phone");
		$("#user").val(name);
		$("#userid").val(id);
		$("#userList").html("").hide();
		$("#people").val(nickname);
		$("#contact").val(phone);
		checkGw($("#user"), name, $("#id").val());
		return false;
	});

	$("#user").bind("blur", function(){
		var t = $(this), val = t.val(), id = $("#id").val();
		if(val != ""){
			checkGw(t, val, id);
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>&nbsp;');
		}
	});

	function checkGw(t, val, id){
		var flag = false;
		t.addClass("input-loading");
		huoniao.operaJson("../inc/json.php?action=checkCompanyUser_job&type=job", "key="+val+"&id="+id, function(data){
			t.removeClass("input-loading");
			if(data == 200){
				t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>此会员已授权管理其它公司，一个会员不可以管理多个公司！');
			}else{
				if(data) {
					for(var i = 0; i < data.length; i++){
						if(data[i].username == val){
							flag = true;
							$("#userid").val(data[i].id);
							$("#people").val(data[i].nickname);
							$("#contact").val(data[i].phone);
						}
					}
				}
				if(flag){
					t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>如果填写了，则此会员可以管理公司信息');
				}else{
					t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择会员');
				}
			}
		});
	}

	//搜索回车提交
    // $("#editform input").keyup(function (e) {
    //     if (!e) {
    //         var e = window.event;
    //     }
    //     if (e.keyCode) {
    //         code = e.keyCode;
    //     }
    //     else if (e.which) {
    //         code = e.which;
    //     }
    //     if (code === 13) {
    //         $("#btnSubmit").click();
    //     }
    // });

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
			title        = $("#title"),
			price  		 = $("#price").val(),
			mprice	     = $("#mprice").val();

		if(!huoniao.regex(title)){
			huoniao.goInput(title);
			return false;
		};

		if(mprice<=0){
			$.dialog.alert("原价不能为0");
			return false;
		}
		if(price<=0){
			$.dialog.alert("现价不能为0");
			return false;
		}

		let type = $(":radio[name=type]:checked").val();
		let job = $("#job").val();
		let resume = $("#resume").val();
		let top = $("#top").val();
		let refresh = $("#refresh").val();
		if(type==="1"){
			let notZeroCount = 0;
			if(job!=0) notZeroCount++;
			if(resume!=0) notZeroCount++;
			if(top!=0) notZeroCount++;
			if(refresh!=0) notZeroCount++;
			if(notZeroCount<2){
				$.dialog.alert("组合资源数至少2个不为0");
				return false;
			}
		}
		else if(type==2){
			if(job==0){
				$.dialog.alert("上架职位数为0");
				return false;
			}
		}
		else if(type==3){
			if(resume==0){
				$.dialog.alert("简历下载数为0");
				return false;
			}
		}
		else if(type==4){
			if(top==0){
				$.dialog.alert("置顶时长为0");
				return false;
			}
		}
		else if(type==5){
			if(refresh==0){
				$.dialog.alert("刷新次数为0");
				return false;
			}
		}

		t.attr("disabled", true);


		//异步提交
		huoniao.operaJson("jobPackageAdd.php", $("#editform").serialize() + "&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){

					huoniao.parentTip("success", "发布成功！");
					huoniao.goTop();
					window.location.reload();

				}else{

					huoniao.parentTip("success", "修改成功！");
					t.attr("disabled", false);

				}
			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false);
			};
		});
	});

});
