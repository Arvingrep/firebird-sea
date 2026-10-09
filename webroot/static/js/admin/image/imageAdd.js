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
			url: "imageJson.php?action=chooseData",
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
											url: "imageJson.php?action=saveChooseData",
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
			url: "imageJson.php?action=allowurl",
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
							url: "imageJson.php?action=saveAllowurl",
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

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
            cityid       = $("#cityid").val(),
			title        = $("#title"),
			subtitle     = $("#subtitle"),
			creturn      = $("input[type=checkbox][value=t]"),
			redirecturl  = $("#redirecturl"),
			weight       = $("#weight"),
			keywords     = $("#keywords"),
			description  = $("#description"),
			typeid       = $("#typeid"),
			tj           = true;

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

		//跳转
		if(creturn.is(":checked")){
			if(!huoniao.regex(redirecturl)){
				tj = false;
				huoniao.goTop();
				return false;
			};
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

		var imglistArr = [], imgli = $("#listSection2 li");
		if(imgli.length > 0){
			for(var i = 0; i < imgli.length; i++){
				var imgsrc = $("#listSection2 li:eq("+i+")").find(".li-thumb img").attr("data-val"), imgdes = $("#listSection2 li:eq("+i+")").find(".li-desc").val();
				imglistArr.push(imgsrc+"|"+imgdes);
			}
		}

		t.attr("disabled", true);

		if(tj){
			$.ajax({
				type: "POST",
				url: "imageAdd.php?action="+action,
				data: $(this).parents("form").serialize() + "&imglist="+imglistArr.join(",")+"&submit=" + encodeURI("提交"),
				dataType: "json",
				success: function(data){
					if(data.state == 100){
						if($("#dopost").val() == "save"){

							huoniao.parentTip("success", "信息发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
							huoniao.goTop();
							location.href = "imageAdd.php?action=image&typeid="+typeid.val()+"&typename="+$("#typeBtn button").text();

						}else{

							huoniao.parentTip("success", "信息修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
							t.attr("disabled", false);

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

});
