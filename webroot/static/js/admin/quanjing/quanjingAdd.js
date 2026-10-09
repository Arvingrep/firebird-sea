$(function () {

    //填充城市列表
    huoniao.choseCity($(".choseCity"),$("#cityid"));
    $(".chosen-select").chosen();

	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		//菜单递归分类
		selectTypeList: function(){
			var typeList = [];
			typeList.push('<ul class="dropdown-menu">');
			typeList.push('<li><a href="javascript:;" data-id="0">选择分类</a></li>');

			var l=typeListArr.length;
			for(var i = 0; i < l; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, cl = "";
					if(jArray.length > 0){
						cl = ' class="dropdown-submenu"';
					}
					typeList.push('<li'+cl+'><a href="javascript:;" data-id="'+jsonArray["id"]+'">'+jsonArray["typename"]+'</a>');
					if(jArray.length > 0){
						typeList.push('<ul class="dropdown-menu">');
					}
					for(var k = 0; k < jArray.length; k++){
						if(jArray[k]['lower'] != null){
							arguments.callee(jArray[k]);
						}else{
							typeList.push('<li><a href="javascript:;" data-id="'+jArray[k]["id"]+'">'+jArray[k]["typename"]+'</a></li>');
						}
					}
					if(jArray.length > 0){
						typeList.push('</ul></li>');
					}else{
						typeList.push('</li>');
					}
				})(typeListArr[i]);
			}

			typeList.push('</ul>');
			return typeList.join("");
		}
	};

	//平台切换
	$('.nav-tabs a').click(function (e) {
		e.preventDefault();
		var obj = $(this).attr("href").replace("#", "");
		if(!$(this).parent().hasClass("active")){
			$(".nav-tabs li").removeClass("active");
			$(this).parent().addClass("active");

			$(".nav-tabs").parent().find(">div").hide();
			cfg_term = obj;
			$("#"+obj).show();
		}
	});

	//填充栏目分类
	$("#typeBtn").append(init.selectTypeList());

	//二级菜单点击事件
	$("#typeBtn a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#typeid").val(id);
		$("#typeBtn button").html(title+'<span class="caret"></span>');

		if(id != 0){
			$("#typeid").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}else{
			$("#typeid").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
		}
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

	//来源、作者选择
	var editDiv;
	$(".chooseData").bind("click", function(){
		var type = $(this).attr("data-type"), title = "";
		if(type == "source"){
			title = "来源";
		}else if(type == "writer"){
			title = "作者";
		}
		$.ajax({
			url: "quanjingJson.php?action=chooseData",
			data: "type="+type,
			type: "POST",
			dataType: "json",
			success: function(data){
				var content = [], edit = [];
				for(var i = 0; i < data.length; i++){
					content.push('<a href="javascript:;">'+data[i]+'</a>');
					edit.push(data[i]);
				};
				editDiv = $.dialog({
					id: "chooseData"+type,
					fixed: false,
					lock: false,
					title: "选择"+title,
					content: '<div class="choose-data" data-type="'+type+'">'+content.join("")+'</div>',
					width: 360,
					button:[
						{
							name: '设置',
							callback: function(){
								$.dialog({
									id: "changeData"+type,
									title: "设置"+title,
									content: '<textarea id="changeData" style="width:95%; height:100px; padding:2%;">'+edit.join(",")+'</textarea>',
									width: 360,
									ok: function(){
										var val = self.parent.$("#changeData").val();
										$.ajax({
											url: "quanjingJson.php?action=saveChooseData",
											data: "type="+type+"&val="+val,
											type: "POST",
											dataType: "json",
											success: function(){}
										});
									},
									cancel: true
								});
							}
						}
					]
				});
			}
		});
	});

	//选择来源、作者
	self.parent.$(".choose-data a").live("click", function(){
		var type = $(this).parent().attr("data-type"), txt = $(this).text();
		$("#"+type).val(txt);
		try{
			$.dialog.list["chooseData"+type].close();
		}catch(ex){

		}
	});

	//配置站内链接
	$("#allowurl").bind("click", function(){
		$.ajax({
			url: "quanjingJson.php?action=allowurl",
			type: "POST",
			dataType: "html",
			success: function(data){
				$.dialog({
					id: "allowurlData",
					title: "配置站内链接",
					content: '<textarea id="allowurl" style="width:95%; height:100px; padding:2%;">'+data+'</textarea>',
					width: 360,
					ok: function(){
						var val = self.parent.$("#allowurl").val();
						$.ajax({
							url: "quanjingJson.php?action=saveAllowurl",
							data: "val="+val,
							type: "POST",
							dataType: "json",
							success: function(){}
						});
					},
					cancel: true
				});
			}
		});
	});

	$("#pubdate").bind("blur", function(){
		huoniao.resetDate($(this));
		return false;
	});

	//发布时间
	$(".form_datetime .add-on").datetimepicker({
		format: 'yyyy-mm-dd hh:ii:ss',
		autoclose: true,
		language: 'ch',
		todayBtn: true,
		minuteStep: 5,
		linkField: "pubdate"
	});

	$(".color_pick").colorPicker({
		callback: function(color) {
			var color = color.length === 7 ? color : '';
			$("#color").val(color);
			$(this).find("em").css({"background": color});
		}
	});

	//跳转表单交互
	$("input[name='flags[]']").bind("click", function(){
		if($(this).val() == "t"){
			if(!$(this).is(":checked")){
				$("#rDiv").hide();
			}else{
				$("#rDiv").show();
			}
		}
	});

	//全景预览
	$("#licenseFiles a").bind("click", function(event){
		event.preventDefault();
		var id   = $(this).attr("data-id");

		window.open(cfg_attachment+id, "videoPreview", "height=600, width=650, top="+(screen.height-600)/2+", left="+(screen.width-600)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	});

    //全景预览
    $("#previewQj1").bind("click", function(event){
        event.preventDefault();
        var id = $("#quanjingPicUrl").val(), href = $(this).attr('href');

        window.open(href+"&fileSrc="+id+"&hd=360&vd=180", "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
    });

	$("#previewQj").bind("click", function(){
		if($("#listSection2").find("li").length == 6){

			event.preventDefault();
			var href = $(this).attr("href");

			pics = [];
			$("#listSection2").find("img").each(function(index, element) {
        pics.push($(this).attr("data-val"));
      });

			window.open(href+pics.join(","), "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");

		}else{
			$.dialog.alert("请上传6张完整的全景图片！");
		}
	});

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
			title        = $("#title"),
			subtitle     = $("#subtitle"),
			creturn      = $("input[type=checkbox][value=t]"),
			weight       = $("#weight"),
			keywords     = $("#keywords"),
			description  = $("#description"),
			typeid       = $("#typeid"),
			quanjingtype = $("input[name='typeidArr']:checked").val(),
			tj           = true,
    	cityid       = $("#cityid").val();

      //城市
      if(cityid == '' || cityid == 0){
          $.dialog.alert('请选择城市');
          return false;
      };

		//标题
		if(!huoniao.regex(title)){
			tj = false;
			huoniao.goTop();
			return false;
		};

		//简略标题
		if($.trim(subtitle.val()) != ""){
			if(!huoniao.regex(subtitle)){
				tj = false;
				huoniao.goTop();
				return false;
			};
		}else{
			subtitle.siblings(".input-tips").removeClass().addClass("input-tips input-ok");
		}

		//分类
		if(typeid.val() == "" || typeid.val() == 0){
			typeid.siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			tj = false;
			huoniao.goTop();
			return false;
		}else{
			typeid.siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		//排序
		if(!huoniao.regex(weight)){
			tj = false;
			huoniao.goTop();
			return false;
		}

		//关键词
		if(keywords.val() != ""){
			if(!huoniao.regex(keywords)){
				tj = false;
				huoniao.goTop();
				return false;
			};
		}

		//描述
		if(description.val() != ""){
			if(!huoniao.regex(description)){
				tj = false;
				huoniao.goTop();
				return false;
			};
		}

		if(quanjingtype == 0){
			if($("#listSection2").find("li").length != 6){
				$.dialog.alert("请上传6张完整的全景图片！");
				return false;
			}

			var pics = [];
			$("#listSection2").find("img").each(function(index, element) {
        pics.push($(this).attr("data-val"));
	    });

			$("#litpic").val(pics.join(","));
		}else if(quanjingtype == 1){
			if($("#videoUrl").val() == ""){
				$.dialog.alert("请上传全景文件！");
				return false;
			}
			$("#litpic").val($("#videoUrl").val());

		}else if(quanjingtype == 2){
			if($("#url").val() == ""){
				$.dialog.alert("请输入URL地址！");
				return false;
			}
		}else if(quanjingtype == 3){
			if($("#zipname").val() == ""){
				$.dialog.alert("请上传zip压缩包！");
				return false;
			}
		}else if(quanjingtype == 4){
            if($("#quanjingPic").val() == ""){
                $.dialog.alert("请上传全景图片！");
                return false;
            }
        }

		t.attr("disabled", true);

		if(tj){
			$.ajax({
				type: "POST",
				url: "quanjingAdd.php?action="+action,
				data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
				dataType: "json",
				success: function(data){
					if(data.state == 100){
						if($("#dopost").val() == "save"){

							huoniao.parentTip("success", "信息发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
							huoniao.goTop();
							location.href = "quanjingAdd.php?action=quanjing&typeid="+typeid.val()+"&typename="+$("#typeBtn button").text();

						}else{

							huoniao.parentTip("success", "信息修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
							t.attr("disabled", false);

							// try{
							// 	$("body",parent.document).find("#nav-imageListphpaction"+action).click();
							// 	$("body",parent.document).find("#nav-edit"+action+id+" s").click();
							// }catch(e){
							// 	location.href = thisPath + "quanjingList.php?action="+action;
							// }

						}
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
		}
	});

	//视频预览
	$("#quanjingPreview").delegate("a", "click", function(event){
		event.preventDefault();
		var href = $(this).attr("href"),
			id   = $(this).attr("data-id");

		window.open(href+id, "quanjingPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	});

	//删除文件
	$(".spic .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
		if(t.hasClass('quanjin')){
			$.post("?action=delQuanjing", "file="+input.val(), function(){
				input.val("");
				t.prev(".sholder").html('');
				parent.hide();
				iframe.attr("src", src).show();
			})
		}else{
			delFile(input.val(), false, function(){
				input.val("");
				t.prev(".sholder").html('');
				parent.hide();
				iframe.attr("src", src).show();
			});
		}
	});

});



//全景类型切换
$("input[name='typeidArr']").bind("click", function(){
	$("#type0, #type1, #type2, #type3").hide();
	$("#type"+$(this).val()).show();
});


//上传成功接收
function uploadSuccess(obj, file, filetype, fileurl){
	$("#"+obj).val(file);
	// $("#"+obj).siblings(".spic").find(".sholder").html('<a href="/include/quanjingPreview.php?f=" data-id="'+file+'">预览全景</a>');
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
	if(obj == 'quanjingPic'){
		$('#quanjingPicUrl').val(fileurl);
	}
}


//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "quanjing",
		type: "delVideo",
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
