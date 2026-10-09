var uploadCustom = {
	//旋转图集文件
	rotateAtlasPic: function(mod, direction, img, c) {
		var g = {
			mod: mod,
			type: "rotateAtlas",
			direction: direction,
			picpath: img,
			randoms: Math.random()
		};
		$.ajax({
			type: "POST",
			cache: false,
			async: false,
			url: "/include/upload.inc.php",
			dataType: "json",
			data: $.param(g),
			success: function(a) {
				try {
					c(a)
				} catch(b) {}
			}
		});
	}
}

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

		//区域树形递归分类
		,treeTypeList_: function(){
			var typeList = [], cl = "";
			var l = addrListArr;
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower;
					typeList.push('<a href="javascript:;" data="'+jsonArray["id"]+'">'+cl+"|--"+jsonArray["typename"]+'</a>');
					if(jArray != undefined){
						for(var k = 0; k < jArray.length; k++){
							cl += '    ';
							if(jArray[k]['lower'] != ""){
								arguments.callee(jArray[k]);
							}else{
								typeList.push('<a href="javascript:;" data="'+jArray[k]["id"]+'">'+cl+"|--"+jArray[k]["typename"]+'</a>');
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

		//重新上传时删除已上传的文件
		,delFile: function(b, d, c) {
			var g = {
				mod: "renovation",
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

	//填充区域
	$("#addrid").html(init.treeTypeList("addr"));

	//类别切换
	$("input[name=type]").bind("click", function(){
		var val = $(this).val(), obj = $(".jiastyle"), obj1 = $(".comstyle");
		if(val == 0){
			obj.show();
			obj1.hide();
		}else if(val == 1){
			obj.hide();
			obj1.show();
		}
	});

	//域名过期时间
	$("#began").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});
	$("#end" ).datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});

	//标注地图
	$("#mark").bind("click", function(){
		$.dialog({
			id: "markDitu",
			title: "标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）</small>",
			content: 'url:'+adminPath+'../api/map/mark.php?mod=renovation&lnglat='+$("#lnglat").val()+"&city="+mapCity+"&addr="+$("#address").val(),
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
	$("#designername").bind("input", function(){
		$("#designerid").val("0");
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkDesigner", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#designerList").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'" data-name="'+data[i].name+'">'+data[i].name+"--"+data[i].company+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#designerList")
						.css({"left": pos.left, "top": pos.top + 36})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#designerList").html("").hide();
				}
			});

		}else{
			$("#designerList").html("").hide();
		}
    });

	$("#designerList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id"), name = $(this).attr("data-name");
		$("#designername").val(name);
		$("#designerid").val(id);
		$("#designerList").html("").hide();
		checkGw($("#designername"), name, $("#id").val());
		return false;
	});


	$(document).click(function (e) {
        var s = e.target;
        if (!jQuery.contains($("#designerList").get(0), s)) {
            if (jQuery.inArray(s.id, "designername") < 0) {
                $("#designerList").hide();
            }
        }
    });

	$("#designername").bind("blur", function(){
		var t = $(this), val = t.val(), id = $("#id").val();
		if(val != ""){
			checkGw(t, val, id);
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>&nbsp;');
		}
	});


	//模糊匹配公司
	$("#companyname").bind("input", function(){
		$("#companyid").val("0");
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkRenovationCompany", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#companyList").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'">'+data[i].company+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#companyList")
						.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#companyList").html("").hide();
				}
			});

		}else{
			$("#companyList").html("").hide();
		}
    });

	$("#companyList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id");
		$("#companyname").val(name);
		$("#companyid").val(id);
		$("#companyList").html("").hide();
		checkRc($("#companyname"), name, $("#id").val());
		return false;
	});

	$(document).click(function (e) {
    	var s = e.target;
	    if (!jQuery.contains($("#companyList").get(0), s)) {
		        if (jQuery.inArray(s.id, "company") < 0) {
		            $("#companyList").hide();
		        }
        }
    });

	$("#companyname").bind("blur", function(){
		var t = $(this), val = t.val(), id = $("#id").val();
		if(val != ""){
			checkRc(t, val, id);
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请输入所属公司');
		}
	});


	//模糊匹配工长
	$("#foremanname").bind("input", function(){
		$("#foremanid").val("0");
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkForeman", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#foremanList").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'" data-name="'+data[i].name+'">'+data[i].name+"--"+data[i].company+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#foremanList")
						.css({"left": pos.left, "top": pos.top + 36})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#foremanList").html("").hide();
				}
			});

		}else{
			$("#foremanList").html("").hide();
		}
    });

	$("#foremanList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id"), name = $(this).attr("data-name");
		$("#foremanname").val(name);
		$("#foremanid").val(id);
		$("#foremanList").html("").hide();
		checkGz($("#foremanname"), name, $("#id").val());
		return false;
	});

	$(document).click(function (e) {
    	var s = e.target;
	    if (!jQuery.contains($("#companyList").get(0), s)) {
		        if (jQuery.inArray(s.id, "company") < 0) {
		            $("#foremanList").hide();
		        }
        }
    });

	$("#foremanname").bind("blur", function(){
		var t = $(this), val = t.val(), id = $("#id").val();
		if(val != ""){
			checkGz(t, val, id);
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请输入所属公司');
		}
	});



	function checkRc(t, val, id){
		var flag = false;
		t.addClass("input-loading");
		huoniao.operaJson("../inc/json.php?action=checkTeamCompany&type=renovation", "key="+val+"&id="+id, function(data){
			t.removeClass("input-loading");
			if(data == 200){
				t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>公司不存在，请重新选择！');
			}else{
				if(data) {
					for(var i = 0; i < data.length; i++){
						if(data[i].company == val){
							flag = true;
							$("#companyid").val(data[i].id);
						}
					}
				}
				if(flag){
					t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>请从列表中选择公司名');
				}else{
					t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>公司不存在，请确认后再添加！');
				}
			}
		});
	}


	function checkGw(t, val, id){
		var flag = false;
		t.addClass("input-loading");
		huoniao.operaJson("../inc/json.php?action=checkDesignerName&type=renovation", "key="+val, function(data){
			t.removeClass("input-loading");
			if(data == 200){
				t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>工长不存在，请确认后再试！');
			}else{
				if(data) {
					for(var i = 0; i < data.length; i++){
						if(data[i].name == val){
							flag = true;
							$("#designerid").val(data[i].id);
						}
					}
				}
				if(flag){
					t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>请输入此作品的作者');
				}else{
					t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择设计师');
				}
			}
		});
	}


	function checkGz(t, val, id){
		var flag = false;
		t.addClass("input-loading");
		huoniao.operaJson("../inc/json.php?action=checkForemanName&type=renovation", "key="+val, function(data){
			t.removeClass("input-loading");
			if(data == 200){
				t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>工长不存在，请确认后再试！');
			}else{
				if(data) {
					for(var i = 0; i < data.length; i++){
						if(data[i].name == val){
							flag = true;
							$("#foremanid").val(data[i].id);
						}
					}
				}
				if(flag){
					t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>请输入此作品的作者');
				}else{
					t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择工长');
				}
			}
		});
	}

	//发布类型

	$("#ftype input").bind("click",function(){
		type = $(this).val();

		if(type==0){
			$('#designer').hide();
			$('#foreman').hide();
			$('#company').show();
		}else if(type==1){
			$('#designer').hide();
			$('#foreman').show();
			$('#company').hide();
		}else if(type==2){
			$('#designer').show();
			$('#foreman').hide();
			$('#company').hide();

		}
	})
	//选择设计方案
	// $(".chooseCase").bind("click", function(){
	// 	var input = $(this).prev("input"), valArr = input.val().split(","), designer = $("#designer").val();
	// 	if(designer == "" || designer == 0 || designer == undefined){
	// 		$.dialog.alert("请先确定案例所属设计师！");
	// 		return false;
	// 	}
	// 	huoniao.showTip("loading", "数据读取中，请稍候...");
	// 	huoniao.operaJson("renovationCase.php?dopost=getList&designer="+designer, "", function(data){
	// 		huoniao.hideTip();
	// 		if(data && data.state == 100){
	// 			var data = data.renovationCase;
	// 			var content = [];
	// 			content.push('<div class="tagsList"><div class="tag-list">');
	// 			for(var l = 0; l < data.length; l++){
	// 				var id = data[l].id, title = data[l].title;
	// 				content.push('<span'+($.inArray(id, valArr) > -1 ? " class='checked'" : "")+' data-id="'+id+'">'+title+'<a href="javascript:;">√</a></span>');
	// 			}
	// 			content.push('</div></div>');

	// 			$.dialog({
	// 				id: "caseInfo",
	// 				fixed: false,
	// 				title: "选择设计方案",
	// 				content: '<div class="selectTags">'+content.join("")+'</div>',
	// 				width: 600,
	// 				okVal: "确定",
	// 				ok: function(){

	// 					//确定选择结果
	// 					var checked = parent.$(".tag-list .checked");
	// 					input.val(checked.attr("data-id"));
	// 					input.prev("#caseName").html('<span class="checked">'+checked.html().replace("√", "×")+'</span>');

	// 				},
	// 				cancelVal: "关闭",
	// 				cancel: true
	// 			});

	// 			//选择标签
	// 			parent.$(".tag-list span").click(function(){
	// 				if(!$(this).hasClass("checked")){
	// 					var id = $(this).attr("data-id"), name = $(this).text().replace("+", "");
	// 					$(this).siblings("span").removeClass("checked");
	// 					$(this).addClass("checked");
	// 				}else{
	// 					$(this).siblings("span").removeClass("checked");
	// 					$(this).removeClass("checked");
	// 				}
	// 			});

	// 		}else{
	// 			$.dialog.alert("设计师暂未发表作品！");
	// 		}
	// 	});
	// });

	//选择小区
	$(".chooseCommunity").bind("click", function(){

		var content = [], type = "Brand";

		//选地区
		content.push('<div class="selectCarBrand-item" id="selectAddr" style="margin-left:30px;"><h2>选择地区：</h2><div class="selectCarBrand-container clearfix">');
		content.push('<div class="pinp_main"><div class="pinp_main_zm">'+init.treeTypeList_()+'</div></div>');
		content.push('</div></div>');

		//选小区
		content.push('<div class="selectCarBrand-item" id="selectOffer" style="width:230px; margin-left:30px;"><h2>选择小区：</h2><div class="selectCarBrand-container clearfix">');
		content.push('<div class="pinp_main" style="height:300px;"><div class="pinp_main_zm"><center style="line-height:290px;">没有相关小区！</center></div></div>');
		content.push('</div>');
		content.push('<div style="margin-top:8px;"><input type="text" id="communityInput" style="width:216px;" placeholder="没有找到？直接输入小区名" /></div>');
		content.push('</div>');

		$.dialog({
			id: "selectCommunity",
			fixed: false,
			title: "选择小区",
			content: '<div class="selectCarBrand clearfix">'+content.join("")+'</div>',
			width: 600,
			okVal: "确定",
			ok: function(){

				//确定选择结果
				var obj = parent.$("#selectOffer .cur"),
					id = obj.attr("data-id"),
					text = obj.attr("data-title"),
					value = parent.$("#communityInput").val();
				if((id != undefined && text != undefined) || value != ""){
					if(id != undefined && text != undefined){
						$("#communityid").val(id);
						$("#community").val(text);
						$("#communityName")
							.html('<span class="checked">'+text+'<a href="javascript:;">×</a></span>');
						}else{
							$("#communityid").val(0);
							$("#community").val(value);
							$("#communityName")
								.html('<span class="checked">'+value+'<a href="javascript:;">×</a></span>');
						}

				}else{
					alert("请选择或直接输入小区名！");
					return false;
				}

			},
			cancelVal: "关闭",
			cancel: true
		});

		//选择地区
		parent.$("#selectAddr a").bind("click", function(){
			parent.$("#selectAddr a").removeClass("cur");
        	$(this).addClass("cur");
        	getCommunity();
		});

		//获取小区
		function getCommunity(){
			var addr = parent.$("#selectAddr .cur").attr("data");

			addr = addr != undefined ? addr : 0;

			parent.$("#selectOffer .pinp_main_zm").html('<center style="line-height:290px;">搜索中...</center>');
			huoniao.operaJson("renovationCommunity.php", "dopost=getList&sAddr="+addr, function(data){
				if(data && data.state == 100){
					var dealer = [], list = data.renovationCommunity;
					for (var i = 0; i < list.length; i++) {
						dealer.push('<a href="javascript:;" data-id="'+list[i].id+'" data-title="'+list[i].title+'" title="'+list[i].title+'"> '+(i+1)+'. '+list[i].title+'</a>');
					};
					parent.$("#selectOffer .pinp_main_zm").html(dealer.join(""));
				}else{
					parent.$("#selectOffer .pinp_main_zm").html('<center style="line-height:290px;">没有相关小区！</center>');
				}
			});
		}

		//选择小区
		parent.$("#selectOffer").delegate("a", "click", function(){
			parent.$("#selectOffer a").removeClass("cur");
        	$(this).addClass("cur");
		});


	});

	//删除已选择的效果图
	$(".selectedTags").delegate("span a", "click", function(){
		var pp = $(this).parent(), input = pp.parent().nextAll("input");
		pp.remove();
		input.val("");
	});

	//搜索回车提交
    $("#editform input").keyup(function (e) {
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
            $("#btnSubmit").click();
        }
    });

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
			title        = $("#title"),
			designername = $("#designername").val(),
			designer     = $("#designer").val();

		if(!huoniao.regex(title)){
			huoniao.goInput(title);
			return false;
		};

		// if(designername == "" || designer == 0){
		// 	huoniao.goInput($("#designername"));
		// 	$("#designerList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
		// 	return false;
		// }else{
		// 	$("#designerList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		// }

		//图集
		var imgli = $("#listSection2 li"), imglistArr = [];
		if(imgli.length > 0){
			for(var i = 0; i < imgli.length; i++){
				var imgsrc = $("#listSection2 li:eq("+i+")").find(".li-thumb img").attr("data-val"),
					name = $("#listSection2 li:eq("+i+")").find("textarea").val();
				imglistArr.push(imgsrc+"##"+name);
			}
		}
		content = imglistArr.join("||");

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("renovationDiaryAdd.php", $("#editform").serialize() + "&imglist="+content+"&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){

					huoniao.parentTip("success", "发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					huoniao.goTop();
					window.location.reload();

				}else{

					huoniao.parentTip("success", "修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					t.attr("disabled", false);

				}
			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false);
			};
		});
	});

});

//上传成功接收
function uploadSuccess(obj, file){
	$("#"+obj).val(file);
	$("#"+obj).siblings(".spic").find(".sholder").html('<img src="'+cfg_attachment+file+'" />');
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}
