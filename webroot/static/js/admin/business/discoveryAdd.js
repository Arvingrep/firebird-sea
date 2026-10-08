//实例化编辑器
var ue = UE.getEditor('body');

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

	huoniao.parentHideTip();

  //填充城市列表
  huoniao.buildAdminList($("#cityid"), cityList, '请选择分站', cityid);
  $(".chosen-select").chosen();

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
	$("#typeBtn").delegate("a", "click", function(){
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

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
				id           = $("#id").val(),
				cityid       = $("#cityid").val(),
				title        = $("#title"),
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

		//分类
		if(typeid.val() == "" || typeid.val() == 0){
			typeid.siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			tj = false;
			huoniao.goTop();
			return false;
		}else{
			typeid.siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		//关键词
		// if(keywords.val() != ""){
		// 	if(!huoniao.regex(keywords)){
		// 		tj = false;
		// 		huoniao.goTop();
		// 		return false;
		// 	};
		// }

		//描述
		// if(description.val() != ""){
		// 	if(!huoniao.regex(description)){
		// 		tj = false;
		// 		huoniao.goTop();
		// 		return false;
		// 	};
		// }


		ue.sync();

		t.attr("disabled", true);

		if(tj){
			$.ajax({
				type: "POST",
				url: "discoveryAdd.php",
				data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
				dataType: "json",
				success: function(data){
					if(data.state == 100){
						if($("#dopost").val() == "save"){

							huoniao.parentTip("success", "信息发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
							huoniao.goTop();
							location.href = "discoveryAdd.php?typeid="+typeid.val()+"&typename="+$("#typeBtn button").text();

						}else{

							huoniao.parentTip("success", "信息修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
							t.attr("disabled", false);

							//更新列表页数据
							// $("body",parent.document).find("#body-articleListphp")[0].contentWindow.getList()

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
			url: "?dopost=chooseData",
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
											url: "?dopost=saveChooseData",
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
	

	//模糊匹配商家
	$("#storename").bind("input", function(){
		var t = $(this), val = t.val(), id = $("#id").val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("?dopost=checkStore", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#companyList").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					var name = data[i].title;
					list.push('<li data-id="'+data[i].id+'" data-company="'+name+'">'+name+'</li>');
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
		$("#storename").val(name);
		$("#uid").val(id);
		$("#companyList").html("").hide();
		$('#storename').val('');
		checkGw($("#storename"), name, $("#id").val(), function(sid){
			// if(checkContent(sid)){
			// 	$.dialog.alert('店铺已存在');
			// 	return false;
			// }
			var time = new Date().getTime();
			var id = 'iframe_'+time;
			ue.setContent('<iframe src="/include/ajax.php?service=business&action=detailHtml&dataType=html&id='+sid+'&iframe='+id+'" style="width:100%;border:none;" id="'+id+'"></iframe>', true);
			$.dialog.tips('店铺已插入文章', 1, 'success.png');
		});
		return false;	
	});

	$(document).click(function (e) {
    var s = e.target;
    if (!jQuery.contains($("#companyList").get(0), s)) {
      if (jQuery.inArray(s.id, "user") < 0) {
          $("#companyList").hide();
      }
    }
  });

	$("#storename").bind("blur", function(){
		var t = $(this), val = t.val(), id = $("#id").val();
		if(val != ""){
			checkGw(t, val, id);
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>&nbsp;');
		}
	});

	function checkGw(t, val, id, callback){
		var flag = false;
		t.addClass("input-loading");
		huoniao.operaJson("?dopost=checkStore", "key="+val+"&id="+id, function(data){
			t.removeClass("input-loading");
			
			if(data) {
				for(var i = 0; i < data.length; i++){
					if(data[i].title == val){
						flag = true;
						callback && callback(data[i].id);
						break;
					}
				}
			}
			if(flag){
				t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>&nbsp;');
			}else{
				t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择商家');
			}
		});
	}


	// var storeList = [];
	// function getStore(page){
	// 	$.ajax({
	// 		url: '?dopost=getAllStore&page='+page,
	// 		type: 'get',
	// 		dataType: 'json',
	// 		success: function(data){
	// 			if(data && data.length){
	// 				storeList = storeList.concat(data);
	// 				getStore(++page);
	// 			}else{
	// 				// checkContent();
	// 			}
	// 		}
	// 	})
	// }
	function in_array(arr, id){
		for(var i in arr){
			if(arr[i] == id) return true;
		}
		return false;
	}
	function checkContent(id){
	  var content = ue.getContent();
	  if($.trim(content) == ''){
	    $('#sid').val('');
	    return;
	  }
	  var patt = /action=detailHtml&dataType=html&id=(\d+)/g;

	  var sid = [];
	  while ((res = patt.exec(content)) != null)  {
		  sid.push(res[1]);
	  }
	  $('#sid').val(sid.join(','));
	}
	ue.addListener("contentChange",function(){
		checkContent();
	});
	// getStore(1);

});
