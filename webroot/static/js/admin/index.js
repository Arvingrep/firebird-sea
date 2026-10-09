var initRightNavMenu = function(){
	$(".default-nav li").rightMenu({
		func: function() {
			var t = $(this);
			!t.hasClass("cur") ? t.click() : "";
			rightNavMenu(t);
		}
	});
};

var hasNewVersion = 0;
var file_images_list = [];

$(function(){
	initRightNavMenu();

	//移动端增加标识
	if(isMobile()){
		var bodyEle = document.getElementsByTagName('html')[0];
    	bodyEle.className += " huoniao_mobile";
	}

	//设置主体内容高度
	fBodyHeight();

	//onresize事件
	$(window).resize(function () {
		fBodyHeight();
		$("#module").css({"height": $(".sub-top").height() + $("#modelList").height() + ($("#modelInfo").is(":visible") ? $("#modelInfo").height() : 0) + 10});
	});

	//导航菜单
	openSnSort();

	// 版本号
	$.ajax({
	    url: 'index_body.php?',
	    data: 'dopost=checkUpdate',
	    type: "GET",
	    dataType: "json",
	    success: function (data) {
	        if(data && data.state == 100){
				if(huoniaoOfficial){
					var d = data.info.split('，');
					$('.version_show h2').html(d[0].split('：')[1])
		            $('.version_show p').html(d[1].split(' ')[0]);
					$('.version_show').css('display','block');
					hasNewVersion = 1;
				}
	        }
	    }
	});

	// 版本号隐藏
	$('.close_btn').click(function(){
		var t = $(this);
		var p = t.parents('.version_show');
		p.animate({'right':'-270px'},200)
	});

	// 版本号展开 open_version
	$('.open_version').click(function(){
		var t = $(this);
		var p = t.parents('.version_show');
		p.animate({'right':'16px'},200)
	});

	//检查最新版本
	$("#indexUpdate").bind("click", function(event){
	 var href = $(this).attr("data-href");
	 try {
	 	event.preventDefault();
	 	$(".h-nav a").each(function(index, element) {
	     if($(this).attr("href") == href){
	 			$(this).click();
	 		}
	 	});
	 } catch(e) {}
	});

	//点击预览后隐藏菜单
	$(".preview").delegate(".sub-nav a", "click", function(){
		$(this).closest(".sub-nav").hide();
	});

	//模块切换
	$("#tab li").bind("click", function(){
		if(!$(this).hasClass("selected")){
			var index = $(this).index();
			$(this).siblings("li").removeClass("selected");
			$(this).addClass("selected");

			$("#modelList ul").hide();
			$("#modelInfo").hide();
			$("#modelList ul:eq("+index+")").show();
			var model = $("#modelList ul:eq("+index+")").find(".cur");

			if(model.html() != undefined){
				var id = model.attr("data-id"), title = model.text();
				$("#modelInfo div").hide();
				$("#modelInfo").find("#"+id).show();
				$("#modelInfo").show();
				$("#module").css({"height": $(".sub-top").height() + $("#modelList").height() + ($("#modelInfo").is(":visible") ? $("#modelInfo").height() : 0) + 10});
			}else{
				$("#module").css({"height": $(".sub-top").height() + $("#modelList").height() + 10});
			}
		}
	});

	//栏目切换
	$("#modelList li").bind("click", function(){
		if(!$(this).hasClass("cur")){
			var id = $(this).attr("data-id"), title = $(this).text();
			$(this).siblings("li").removeClass("cur");
			$(this).addClass("cur");

			$("#modelInfo div").hide();

			$("#modelInfo").find("#"+id).find("dt span").removeClass("cur");
			$("#modelInfo").find("#"+id).find("dd").hide();

			$("#modelInfo").find("#"+id).find("dt span:eq(0)").addClass("cur");
			$("#modelInfo").find("#"+id).find("dd:eq(0)").show();
			$("#modelInfo").find("#"+id).show();
			$("#modelInfo").stop(true, true).show();
			$("#module").css({"height": $(".sub-top").height() + $("#modelList").height() + ($("#modelInfo").is(":visible") ? $("#modelInfo").height() : 0) + 10});
		}else{
			$(this).removeClass("cur");
			$("#modelInfo").stop(true, true).hide();
			$("#module").css({"height": $(".sub-top").height() + $("#modelList").height() + 10});
		}
	});

	//三级分类切换
	$(".model-info dt span").bind("click", function(){
		if(!$(this).hasClass("cur")){
			var index = $(this).index();
			$(this).siblings("span").removeClass("cur");
			$(this).addClass("cur");

			$(this).parent().siblings("dd").hide();
			$(this).parent().siblings("dd:eq("+index+")").show();
		}
	});

	//确认导航分类切换
	$("#welcome").delegate("dt span", "click", function(){
		if(!$(this).hasClass("cur")){
			var index = $(this).index();
			$(this).siblings("span").removeClass("cur");
			$(this).addClass("cur");

			$(this).parent().siblings("dd").hide();
			$(this).parent().siblings("dd:eq("+index+")").show();
		}
	});

	//编辑模块
	$("#editModelList").bind("click", function(){
		$("#siteConfig a").each(function(){
			if($(this).attr("href").indexOf("moduleList") > -1){
				$(this).click();
			}
		});
	});
	//编辑模块
	//$("#editModelList").bind("click", function(){
//		if($(this).parent().hasClass("red")){
//
//			//保存模块排序
//			var modelList = '{"modelList":[', tab = $("#tab");
//			for(var i = 0; i < tab.find("li").length; i++){
//				//一级分类
//				modelList += '{"modelType": "'+tab.find("li:eq("+i+")").text()+'", "modelList":[';
//
//				//二级分类
//				var modelListModel = $("#modelList");
//				var modelListItem = modelListModel.find("ul:eq("+i+")");
//				for(var k = 0; k < modelListItem.find("li").length; k++){
//					var li = modelListItem.find("li:eq("+k+")");
//					modelList += '{"typeId":"'+li.attr("data-id")+'", "typeName": "'+li.text()+'", "typeIcon": "'+li.find("s img").attr("src")+'", "typeList":[';
//
//					//三级分类
//					var obj = $("#"+li.attr("data-id"));
//					for(var j = 0; j < obj.find("dt span").length; j++){
//						modelList += '{"itemName": "'+obj.find("dt span:eq("+j+")").text()+'", "itemList":[';
//
//						//四级分类
//						for(var l = 0; l < obj.find("dd:eq("+j+") a").length; l++){
//							var a = obj.find("dd:eq("+j+") a:eq("+l+")");
//							modelList += '{"listName": "'+a.text()+'", "listUrl": "'+a.attr("href")+'"},';
//						}
//						modelList = modelList.substr(0, modelList.length-1);
//
//						modelList += ']},';
//
//					}
//					modelList = modelList.substr(0, modelList.length-1);
//
//					modelList += ']},';
//				}
//				modelList = modelList.substr(0, modelList.length-1);
//
//				modelList += ']},';
//			}
//			modelList = modelList.substr(0, modelList.length-1) + "]}";
//
//			$.ajax({
//				url: "index.php?action=updateNavSort",
//				data: "modelList="+encodeURIComponent(modelList),
//				type: "POST",
//				dataType: "json",
//				error: function(){
//					//alert("保存失败，请重试！");
//				}
//			});
//
//			$(this).html("编辑模块");
//			$(this).parent().removeClass("red").addClass("selected");
//			$("#modelList").removeClass("edit");
//			$("#modelList ul").dragsort("destroy");
//		}else{
//			$(this).html("完成保存");
//			$("#modelList").addClass("edit");
//			$(this).parent().removeClass("selected").addClass("red");
//			$("#modelList ul").dragsort({ dragSelector: "li", dragSelectorExclude: '', placeHolderTemplate: '<li class="placeHolder"></li>' });
//		}
//	});

	//导航链接事件
	$(".h-nav").delegate("a", "click", function(event){
		event.preventDefault();
		var href = $(this).attr("href"),
			id = $(this).attr("data-id"),
			title = $(this).text(),
			parent = $(this).parent().parent().parent(),
			parentId = parent.attr("id"),
			parentHtml = parent.html();

		if(href == "javascript:;") return false;

		if(href.indexOf('siteFabuPages') > -1){
 		 window.open(href);
 		 return false;
 	 }

		if(id == undefined){
			id = $(this).attr("href").split("/"),
			//id = id[1].split(".")[0];
			id = id[1].replace(/\./g, "").replace(/\=/g, "").replace(/\?/g, "").replace(/\&/g, "").replace('notice1', '');
		}

		//商店
		if(id == "store"){
			parentId = "store";
			$("#body .options").hide();
		}else{
			$("#body .options").show();
		}

		//插件
		if(id == "plugins"){
			parentId = "plugins";
			// $("#body .options").hide();
		}else{
			// $("#body .options").show();
		}

		if(href != "" && id != undefined){

			if(id != "store" && id != "plugins"){
				if($("#welcome-"+parentId).html() == undefined){
					//欢迎信息处增加栏目信息
					$("#welcome div").hide();
					$("<div>")
						.attr("class", "welcome-nav")
						.attr("id", "welcome-"+parentId)
						.html(parentHtml)
						.appendTo($("#welcome"));
				}else{
					$("#welcome div").hide();
					$("#welcome-"+parentId).show();
				}
			}

			if($("#nav-"+id).html() == undefined){
				//标签导航处增加栏目信息
				var cur = $(".navul li.cur").index();
				$(".default-nav li").removeClass("cur");
				if(cur > -1){
					$(".navul li:eq("+cur+")").after("<li class='navli cur' id='nav-"+id+"' data-type='"+parentId+"' title="+title+"><b></b><label>"+title+"<s title=\"点击关闭标签\">&times;</s></label></li>");
				}else{
					$(".navul ul").append("<li class='navli cur' id='nav-"+id+"' data-type='"+parentId+"' title="+title+"><b></b><label>"+title+"<s title=\"点击关闭标签\">&times;</s></label></li>");
				}
				initRightNavMenu();
			}else{
				$(".default-nav li").removeClass("cur");
				$("#nav-"+id).addClass("cur");
			}

			if($("#body-"+id).html() == undefined){
				//内容区增加栏目iframe
				$("#body iframe").hide();
				$("#body").append('<iframe id="body-'+id+'" name="body-'+id+'" frameborder="0" src="'+href+'"></iframe>');
			}else{
				$("#body iframe").hide();
				$("#body-"+id).show();
			}

			if(id == "store" || id == "plugins"){
				$("#welcome .on").removeClass("on");
				fBodyHeight();
			}else{
				$("#welcome-"+parentId).find("a").removeClass("on");
				$("#welcome-"+parentId).find("a").each(function() {

					var id_ = $(this).attr("href").split("/"),
					//id_ = id_[1].split(".")[0];
					id_ = id_[1].replace(/\./g, "").replace(/\=/g, "").replace(/\?/g, "").replace(/\&/g, "").replace('notice1', '');

					if(id_ == id){
						$(this).click();
					}
				});

				fBodyHeight();
				$(".sub-nav").hide();

			}
		};
	});

	//欢迎信息处链接事件
	$("#welcome").delegate("a", "click", function(event){
		event.preventDefault();

		var id = $(this).attr("id");
		if(id == "editPass"){
			var href = $(this).attr("href");
			try {
				addPage("adminEdit", "index", "修改密码", href);
			} catch(e) {
				location.href = href;
			}
			return false;
		}else if(id == "adminLogin"){
			var href = $(this).attr("href");
			try {
				addPage("adminLogin", "index", "登录记录", href);
			} catch(e) {
				location.href = href;
			}
			return false;
		}

		var href = $(this).attr("href"),
			id = href.split("/"),
			title = $(this).text(),
			parentId = $(this).parent().parent().parent().attr("id");

		//id = id[1].split(".")[0];

	 if(href.indexOf('siteFabuPages') > -1){
		 window.open(href);
		 return false;
	 }



		id = id[1].replace(/\./g, "").replace(/\=/g, "").replace(/\?/g, "").replace(/\&/g, "").replace('notice1', '');

		if(!$(this).hasClass("on") && href != "" && id != undefined){
			$("#welcome a").removeClass("on");
			$(this).addClass("on");

			$("#welcome div").hide();
			$("#"+parentId).show();

			if($("#nav-"+id).html() == undefined){
				//标签导航处增加栏目信息
				var cur = $(".navul li.cur").index();
				$(".default-nav li").removeClass("cur");
				if(cur > -1){
					$(".navul li:eq("+cur+")").after("<li class='navli' id='nav-"+id+"' data-type='"+parentId.replace("welcome-", "")+"' title="+title+"><b></b><label>"+title+"<s title=\"点击关闭标签\">&times;</s></label></li>");
				}else{
					$(".navul ul").append("<li class='navli' id='nav-"+id+"' data-type='"+parentId.replace("welcome-", "")+"' title="+title+"><b></b><label>"+title+"<s title=\"点击关闭标签\">&times;</s></label></li>");
				}
				initRightNavMenu();
				//重置主体内容高度
				fBodyHeight(0);
				if(cur > -1){
					$(".navul li:eq("+cur+")").next("li").click();
				}else{
					$(".navul ul li").click();
				}
			}else{
				$(".default-nav li").removeClass("cur");
				//重置主体内容高度
				fBodyHeight(0);
				$("#nav-"+id).click();
			}

			if($("#body-"+id).html() == undefined){
				//内容区增加栏目iframe
				$("#body iframe").hide();
				$("#body").append('<iframe id="body-'+id+'" name="body-'+id+'" frameborder="0" src="'+href+'"></iframe>');
			}
			else{
				$("#body iframe").hide();
				$("#body-"+id).show();
			}

			$("#welcome-"+parentId).find("a").removeClass("on");
			$("#welcome-"+parentId).find("a").each(function() {
				var id_ = $(this).attr("href").split("/"),
				//id_ = id_[1].split(".")[0];
				id_ = id_[1].replace(/\./g, "").replace(/\=/g, "").replace(/\?/g, "").replace(/\&/g, "").replace('notice1', '');
				if(id_ == id){
					$(this).addClass("on");
				}
			});

		};
	});

	//双击关闭菜单
	$(".default-nav").delegate("li", "dblclick", function(e){
		$(this).find("s").click();
	});

	//内容导航拖动排序
	$(".default-nav ul").dragsort({ dragSelector: "li.navli b", placeHolderTemplate: '<li class="placeHolder"></li>' });

	$(document).click(function (e) {

		$("#menuNav").bind("click", function(){
			return false;
		});

		//关闭菜单
		closeMenu();
	});

	//内容菜单切换
	$(".default-nav").delegate("li", "click", function(e){
		//下拉菜单
		if($(this).hasClass("lastnav")){
			rightNavMenu($(this));
			return false;

		//普通菜单
		}else{
			var id = $(this).attr("id").replace("nav-", ""), type = $(this).attr("data-type"), index = $(this).index() + 1;

			//关闭按钮
			if(e.target.nodeName.toLowerCase() == "s"){
				$("#body-"+id).remove();
				$(".default-nav li:eq("+index+")").remove();
				if($(this).hasClass("cur")){
					if($(".default-nav li:eq("+(index-1)+")").attr("data-type") != "store" && $(".default-nav li:eq("+(index-1)+")").attr("data-type") != "plugins"){
						$("#welcome div").hide();
					}
					$(".default-nav li:eq("+(index-1)+")").click();
				}
				parentHideTip();

			//切换
			}else{

				//关闭菜单
				closeMenu();

				if($(this).hasClass("cur")) return false;

				$(".default-nav li").removeClass("cur");
				$(this).addClass("cur");

				$("#body iframe").hide();
				$("#body-"+id).show();

				if(type != "store" && type != "plugins"){
					$("#welcome div").hide();
					$("#welcome-"+type).show();
					$("#welcome-"+type+" a").removeClass("on");
					if(type == "index" && hasNewVersion){
						$("#welcome div.version_show").show();
					}
					if(id != "index"){
						$("#welcome-"+type+" a").each(function() {
							var href = $(this).attr("href").split("/"), //id_ = href[1].split(".")[0];
							id_ = href[1].replace(/\./g, "").replace(/\=/g, "").replace(/\?/g, "").replace(/\&/g, "").replace('notice1', '');
							if(id_ == id){
								$(this).addClass("on");

								var index = $(this).parent().index();
								$(this).parent().siblings("dd").hide();
								$(this).parent().show();
								$(this).parent().siblings("dt").find("span").removeClass("cur");
								$(this).parent().siblings("dt").find("span:eq("+(index-1)+")").addClass("cur");
							}
						});
					}
					$("#body .options").show();
				}else{

                    if(type != "plugins"){
                        $("#welcome .on").removeClass("on");
                        $("#body .options").hide();
                    }else{
                        $("#body .options").show();
                    }
                    
				}
			}

			//计算点击的li左边的li宽度和
			var w = 0, index = $(this).index();
			for(var i = 0; i < index; i++){
				w = w + $(".navul li:eq("+i+")").outerWidth(true);
			};

			if(!$(this).hasClass("firstnav")){
				var ul = $('.navul ul'),
					li_offset = $(this).offset(),
					li_width = $(this).outerWidth(true),
					navwidth = Number($(".navul").css("max-width").replace("px", ""));
				if(li_offset.left + li_width - 115 > navwidth) {//如果将要移动的元素在不可见的右边，则需要移动
					var distance = w + li_width - navwidth;//计算当前父元素的右边距离，算出右移多少像素
					ul.animate({"margin-left": -distance}, 200, 'swing');
				}else if(li_offset.left < $(".navul").offset().left) {//如果将要移动的元素在不可见的左边，则需要移动
					var distance = ul.offset().left - li_offset.left;//计算当前父元素的左边距离，算出左移多少像素
					if(distance > 0){
						distance = 0;
					}
					ul.animate({"margin-left": distance }, 200, 'swing');
				}
			}
			//$(this).trigger('click');
		}

		fBodyHeight(0);

		//修复Chrome下页面切换后鼠标滑轮失效的怪异现象 by:guozi 2014-9-10
		$("#body").height($("#body").height()+1);
	});

	//刷新
	$("#refresh").bind("click", function(){
		var id = $(".default-nav .cur").attr("id").replace("nav-", ""),iframe = "body-"+id;
		//if(iframe[0].contentWindow) {
//			reloadPage(iframe[0].contentWindow);
//		}
		if(iframe) {
			reloadPage(iframe);
		}
	});

	//全屏
	$("#fullScreen").bind("click", function(){
		var nBodyHeight = $(".header").height() + $(".welcome").height() + $(".default-nav").height() + 28, nBodyWidth = document.documentElement.clientWidth - 15;
		var nClientHeight = document.documentElement.clientHeight;

		if(!$(this).hasClass("cur")){
			$(this).addClass("cur");
			$(".welcome, .default-nav").hide();
			$("#body").css({"height": nClientHeight - $(".header").height()});

			//浏览器全屏
			launchFullScreen(document.documentElement);
		}else{
			$("#body").height(nClientHeight - nBodyHeight);
			$(this).removeClass("cur");
			$(".welcome, .default-nav").show();

			var w = 0;
			$(".navul li").each(function() {
				w = w + $(this).width() + 1;
			});

			$(".navul ul").width(Math.ceil(w+2));

			//退出全屏
			exitFullscreen();
		}
	});

	//上次访问页面
	var gotopage = $("#gotopage").html();
	if(gotopage != ""){
		$(".h-nav a").each(function() {
            if(gotopage.indexOf($(this).attr("href")) > -1){
				$(this).click();
				return false;
			}
        });
	}

	//功能搜索
	$("#search form").bind("submit", function(event){
		event.preventDefault();
		$("#search").hide();
		var searchKey = $("#searchKey").val(), action = $(this).attr("action");
		if($.trim(searchKey) != ""){
			try{
				if($("#nav-searchFun0").html() != undefined){
					$("#body-searchFun0").attr("src", action+"?keyword="+encodeURIComponent(searchKey));
					$("#nav-searchFun0").click();
				}else{
					addPage("searchFun0", "index", "搜索功能", action+"?keyword="+encodeURIComponent(searchKey));
				}
			}catch(e){
				location.href = action;
			}
		}else{
			$("#searchKey").focus();
		}
	});

	//目录导航
	$("#mapsBtn").bind("click", function(event){
		var href = $(this).attr("href");
		try{
			event.preventDefault();
			$("#search").hide();
			addPage("searchFun1", "index", "目录导航", href);
		}catch(e){}
	});

	//系统基本参数
	$(".config a").bind("click", function(event){
		event.preventDefault();
		try{
			parent.$(".h-nav a").each(function(index, element) {
				if($(this).attr("href") == "siteConfig/siteConfig.php"){
					$(this).click();
					return false;
				}
			});
		}catch(e){}
	});

	//退出提示
	$(".exit a").bind("click", function(event){
		var href = $(this).attr("href");
		event.preventDefault();
		$.dialog.confirm('确定要退出吗？', function(){

			var channelDomainClean = window.location.host;
		    var channelDomain_1 = channelDomainClean.split('.');
		    var channelDomain_1_ = channelDomainClean.replace(channelDomain_1[0]+".", "");

		    channelDomain_ = channelDomainClean.split("/")[0];
		    channelDomain_1_ = channelDomain_1_.split("/")[0];

		    $.cookie(cookiePre + 'admin_auth', null, {domain: channelDomainClean, path: '/'});
		    $.cookie(cookiePre + 'admin_auth', null, {domain: channelDomain_1_, path: '/'});

			location.href = href;
		});
	});

	//获取预览信息
	// getPreviewInfo();



	//消息通知
	var timer, audio, step = 0, _title = document.title;

	//消息通知音频
	if(window.HTMLAudioElement){
		audio = new Audio();
		audio.src = "/static/audio/notice01.mp3";
		audio.pause();
	}

	//显示消息通知层，同时恢复默认标题
	$(".notice").hover(function(){
		$(this).find(".noticify").show();
		document.title = _title;
		clearInterval(timer);
	}, function(){
		$(this).find(".noticify").hide();
	});

	//静音||开启声音
	var adminNoticeSound = $.cookie("adminNoticeSound");
	$(".noticify .sound").bind("click", function(){
		var t = $(this);
		if(t.hasClass("un")){
			t.removeClass("un").attr("title", "关闭声音");
			$.cookie("adminNoticeSound", 1, {expires: -1});
		}else{
			t.addClass("un").attr("title", "开启声音");
			$.cookie("adminNoticeSound", 1, {expires: 365});
		}
	});

	//静音样式
	var adminNoticeSound = $.cookie("adminNoticeSound");
	if(adminNoticeSound == 1){
		$(".noticify .sound").addClass("un").attr("title", "开启声音");
	}


	//点击通知列表跳转指定页面
	$(".r-nav .noticify .con").delegate("li", "click", function(event){
		var t = $(this), module = t.attr("data-module"), id = t.attr("data-id"), name = t.attr("data-name"), url = t.attr("data-url");
		if(name == '电信专区' && module =='plugins'){
			try {
	            event.preventDefault();
	            parent.addPage("plugins12", "plugins", name, url);
	        } catch(e) {}
		}else{
			try {
		  		event.preventDefault();
		  		$(".h-nav a").each(function(index, element) {
					var ta = $(this);
					if(ta.attr("href") == url){
						var _url = url + (url.indexOf('?') > -1 ? '&' : '?') + "notice=1";
						if(name == '配送员'){
							_url = _url + "&peisongstatus=1";
						}
						if (name == '外卖出餐超时') {
							_url = _url + "&state=3";
						} else if(name == '外卖配送超时') {
							_url = _url + "&state=5";
						}
						else if(name == "商城配送审核"){
							_url = url + "?sCerti=3";
						}
						if(name == '会员注销'){
						    _url = _url + "&off=1";
						}
						if(name == '昵称审核'){
						    _url = _url + "&nicknameAudit=1";
						}
						if(name == '头像审核'){
						    _url = _url + "&photoAudit=1";
						}
						ta.attr("href", _url);

						// ta.attr("href", url + (url.indexOf('?') > -1 ? '&' : '?') + "notice=1");
		  				ta.click();
						$(".notice .noticify").hide();
						ta.attr("href", url);
						$("#welcome .on").attr("href", url);
		  				return false;
			  		}
		  		});
		  	} catch(e) {}
		}



	});


	//异步获取通知
	getAdminNotice();

	//每隔10秒再请求一次
	setInterval(function(){
        getAdminNotice();
        opearModuleData.init();
    }, 10000);

	var noticeTotalCount = lastTotalCount = 0;
	var isfirst = 1;
	function getAdminNotice(){
		$.ajax({
			url: "index.php?dopost=getAdminNotice",
			type: "GET",
			dataType: "jsonp",
			success: function (d) {

				//如果有新消息
				var data = d.data;
				var moduleList = [];

				if(data.length > 0){

					//拼接消息通知列表
					var list = [];
					noticeTotalCount = 0;
					for(var i = 0; i < data.length; i++){

						if(data[i].count > 0){
							var cla = '';
							if(data[i].name.length <= 2){
								cla = ' class="f2"';
							}
							if(data[i].name.length >= 5){
								cla = ' class="f5"';
							}
							list.push('<li'+cla+' data-module="'+data[i].module+'" data-id="'+data[i].id+'" data-name="'+data[i].name+'" data-url="'+data[i].url+'"><a href="javascript:;"><em>'+data[i].count+'</em>'+data[i].name+'</a></li>');

							noticeTotalCount += Number(data[i].count);
						}
							moduleList.push(data[i].id);
					}
					$(".r-nav .notice .con ul").html(list.join(""));
					$(".r-nav .notice a i").html(noticeTotalCount);
					$(".r-nav .notice").show();
				}else{
					$(".r-nav .notice .con ul").html("");
					$(".r-nav .notice").hide();
				}

					// 需要重复播放提示音的订单模块
				var audio_type = '';
				if(moduleList.length){
					if(in_array('orderWarning', moduleList)){
						audio_type = 'warning';
					}else if(in_array('Orderpstimeout', moduleList)){
						audio_type = 'waimai_delivery_timeout';
					}else if(in_array('Ordercctimeout', moduleList)){
						audio_type = 'readymeal_timeout';
					}else if(in_array('waimaiOrderphp', moduleList)){
						audio_type = 'waimai';
					}else if(in_array('paotuiOrderphp', moduleList)){
						audio_type = 'paotui';
					}else if(in_array('shopOrder', moduleList)){
						audio_type = 'shop';
					}else if(in_array('taskReport', moduleList)){
						audio_type = 'task_report';
					}
				}

				//消息提醒
				if(d.hasnew || audio_type != '' || (lastTotalCount > 0 && lastTotalCount < noticeTotalCount)){

					audio.src = audio_type != '' ? "/static/audio/notice_"+audio_type+".mp3" : "/static/audio/notice01.mp3";
					//标题闪动
					//标题闪动
					clearInterval(timer);
					timer = setInterval(function(){
						step++;
						if(step == 3) {step = 1};
						if(step == 1) {document.title = '【　　　】-' + _title};
						if(step == 2) {
							document.title = '【新消息】-' + _title;
						};
					}, 500);

					//播放音频
					adminNoticeSound = $.cookie("adminNoticeSound")
					if(!adminNoticeSound){
						audio.play();
					}

					$.get("index.php?dopost=clearAdminNotice");
				}else{

					document.title = _title;
					clearInterval(timer);

					//播放音频
					adminNoticeSound = $.cookie("adminNoticeSound")
					if(!adminNoticeSound){
						audio.pause();
					}

				}

				lastTotalCount = noticeTotalCount;

				//首页待办事项通知
				if($("#body-index").length>0){
					if(isfirst){
						setTimeout(function(){
							if(isMobile()){
							    var frame =  document.getElementById("body-index");
	                            frame.onload = function(){
	                                frame.contentWindow.getAdminNoticeA(data);
	                            };
							}else{
								document.getElementById('body-index').contentWindow.getAdminNoticeA(data);
							}
						}, 1000);
					}else{
						if(isMobile()){
							var frame =  document.getElementById("body-index");
	                        frame.onload = function(){
	                            frame.contentWindow.getAdminNoticeA(data);
	                        };
						}else{
							document.getElementById('body-index').contentWindow.getAdminNoticeA(data);
						}
					}
				}
				isfirst = 0;

			}
		});
	}

	// 定时检查数据
	var now = new Date().getTime();
	var opearModuleData = {
		list: [],
		index: 0,
		speed: 0,
		changeIndex: function(){
			this.index = this.index + 2 > this.list.length ? 0 : this.index + 1;
		},
		init: function(){
			var that_ = this;
			if(!that_.list.length) return;
			setTimeout(function(){
				var index = that_.index;
				that_.changeIndex();

				if(that_.list[index].stop == true){
					if(that_.index != index){
						that_.init();
					}
					return;
				}
				var name = that_.list[index]['name'];
				that_[name](index);
			}, 1000)
		},
		articleUpdateVideotime_face: function(index){
			var that_ = this;
			var page = that_.list[index].page;
			$.ajax({
				url: 'article/articleJson.php',
				type: 'post',
				data: 'action=checkVideotime_face',
				dataType: 'json',
				success: function(data){
					if(data && data.length){
						that_.list[index].stop = true;

						$box = $('#articleUpdateVideotime_face');
						if(!$box.length){
							$box = $('<div id="articleUpdateVideotime_face" style="visibility: hidden;"></div>');
							$('body').append($box);
						}
						for(var i = 0; i < data.length; i++){
							(function(data, i, obj, idx){

		            	var captureImage = function(videos, scale, aid){
		            		var scale = scale ? scale : 1;
			                var canvas = document.createElement("canvas");
				            canvas.width = videos.videoWidth * scale;
				            canvas.height = videos.videoHeight * scale;
				            canvas.getContext('2d').drawImage(videos, 0, 0, canvas.width, canvas.height);
				            $box.append(canvas);

							setTimeout(function(){
								var img = document.createElement("img");
					            var src = canvas.toDataURL("image/png");
					            img.src = src;
					            $box.append(img);

					            var s = new Date().getTime();
					            $.ajax({
					            	url: '/include/upload.inc.php?mod=article',
					            	type: 'post',
					            	data: {
					            		'type': 'thumb',
					            		'base64': 'base64',
					            		'thumbLargeWidth': canvas.width,
					            		'thumbLargeHeight': canvas.height,
					            		'Filedata': src.split(',')[1],
					            	},
					            	dataType: 'json',
					            	success: function(data){
					            		if(data && data.state == 'SUCCESS'){
					            			var e = new Date().getTime();
					            			that_.speed = Math.round(data.fileSize/(e-s));
					            			$.post('article/articleJson.php?action=updateVideotime_face', 'type=face&id='+aid+'&litpic='+data.url);

											$box.html('');
											obj.list[idx].stop = false;
					            		}
					            	},
					            	error: function(){
					            		console.log('error')

										$box.html('');
										obj.list[idx].stop = false;
					            	}
					            })
							}, 500);

			            }

								var d = data[i], url = d.videotype == "0" ? (window.location.origin+'/include/attachment.php?f='+d.videourl) : d.videourl;
								var video =  document.createElement('video');
								video.src = url;
								video.setAttribute('crossorigin', 'anonymous'); // 注意设置图片跨域应该在图片加载之前
								$box.append(video);

								video.addEventListener("loadeddata", function (_event) {

									if(d.videotime == 0){
									    $.post('article/articleJson.php?action=updateVideotime_face', 'type=time&id='+d.id+'&videotime='+parseInt(video.duration));
									}
							    	if(d.litpic == ''){
										setTimeout(function(){
							    			captureImage(video, 1, d.id);
							    			if(i + 1 == data.length){
										    	// $box.html('');
										    	// obj.list[idx].stop = false;
										    }
							    		}, 3000);
								    }

								});

								video.addEventListener("error", function (_event) {
									console.clear();
									console.log('%c新闻信息视频不存在，或者远程附件服务器没有设置允许跨域，无法自动生成视频缩略图。\n若您没有此需求，请忽略此消息。谢谢您的合作。', 'color:#ccc;font-size:12px');
								})

							})(data, i, that_, index)
						}
					}
				},
				error: function(){
				}
			})
		},
		articleUeditorVideo_face: function(index){
			var that_ = this;
			var page = that_.list[index].page;
			$.ajax({
				url: 'article/articleJson.php',
				type: 'post',
				data: 'action=checkUeditorVideo_face',
				dataType: 'json',
				success: function(data){
					if(data && data.length){
						that_.list[index].stop = true;

						$box = $('#articleUpdateUeditorVideotime_face');
						if(!$box.length){
							$box = $('<div id="articleUpdateUeditorVideotime_face" style="visibility: hidden;"></div>');
							$('body').append($box);
						}
						for(var i = 0; i < data.length; i++){
							(function(data, i, obj, idx){

		            var captureImage = function(videos, scale, path, aid){
		            		var scale = scale ? scale : 1;
			                var canvas = document.createElement("canvas");
					            canvas.width = videos.videoWidth * scale;
					            canvas.height = videos.videoHeight * scale;
					            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
					            $box.append(canvas);

					            var img = document.createElement("img");
					            var src = canvas.toDataURL("image/png");
					            img.src = src;
					            $box.append(img);

					            var s = new Date().getTime();
					            $.ajax({
					            	url: '/include/upload.inc.php?mod=article',
					            	type: 'post',
					            	data: {
					            		'type': 'adv',
					            		'base64': 'base64|'+path,
					            		'thumbLargeWidth': canvas.width,
					            		'thumbLargeHeight': canvas.height,
					            		'Filedata': src.split(',')[1],
					            	},
					            	dataType: 'json',
					            	success: function(data){
					            		if(data && data.state == 'SUCCESS'){
					            			var e = new Date().getTime();
					            			that_.speed = Math.round(data.fileSize/(e-s));
					            			$.post('article/articleJson.php?action=updateVideotime_face', 'type=face&id='+aid+'&litpic='+data.url);
					            		}
					            	},
					            	error: function(){
					            		console.log('error')
					            	}
					            })
			            }

								var d = data[i], url = d.src, path = d.path.replace('.mp4', '.png');
								var video =  document.createElement('video');
								video.src = url;
								video.setAttribute('crossorigin', 'anonymous'); // 注意设置图片跨域应该在图片加载之前
								$box.append(video);

								video.addEventListener("loadeddata", function (_event) {

									setTimeout(function(){
										captureImage(video, 1, path, d.id);
										if(i + 1 == data.length){
											$box.html('');
											obj.list[idx].stop = false;
										}
									}, 3000);

								});

								video.addEventListener("error", function (_event) {
									console.clear();
                  console.log('%c新闻信息视频不存在，或者远程附件服务器没有设置允许跨域，无法自动生成视频缩略图。\n若您没有此需求，请忽略此消息。谢谢您的合作。', 'color:#ccc;font-size:12px');
                })

							})(data, i, that_, index)
						}
					}
				},
				error: function(){
				}
			})
		},
		circlecleUpdateVideotime_face: function(index){
			var that_ = this;
			var page = that_.list[index].page;
			$.ajax({
				url: 'circle/circleJson.php',
				type: 'post',
				data: 'action=checkVideotime_face',
				dataType: 'json',
				success: function(data){
					if(data && data.length){
						that_.list[index].stop = true;

						$circlebox = $('#circleUpdateVideotime_face');
						if(!$circlebox.length){
							$circlebox = $('<div id="circleUpdateVideotime_face" style="visibility: hidden;"></div>');
							$('body').append($circlebox);
						}

						for(var i = 0; i < data.length; i++){

							(function(data, i, obj, idx){
					            var captureImage = function(videos, scale, cid){
					            	var scale = scale ? scale : 1;
					                var canvas = document.createElement("canvas");
						            canvas.width = videos.videoWidth * scale;
						            canvas.height = videos.videoHeight * scale;
						            canvas.getContext('2d').drawImage(videos, 0, 0, canvas.width, canvas.height);
						            $circlebox.append(canvas);

									setTimeout(function(){
										var img = document.createElement("img");
							            var src = canvas.toDataURL("image/png");
							            img.src = src;
							            $circlebox.append(img);
							            var s = new Date().getTime();
							            $.ajax({
							            	url: '/include/upload.inc.php?mod=circle',
							            	type: 'post',
							            	data: {
							            		'type': 'thumb',
							            		'base64': 'base64',
							            		'thumbLargeWidth': canvas.width,
							            		'thumbLargeHeight': canvas.height,
							            		'Filedata': src.split(',')[1],
							            	},
							            	dataType: 'json',
							            	success: function(data){
							            		// console.log(data);
							            		if(data && data.state == 'SUCCESS'){
							            			var e = new Date().getTime();
							            			that_.speed = Math.round(data.fileSize/(e-s));
							            			$.post('circle/circleJson.php?action=updateVideotime_face', 'type=face&id='+cid+'&litpic='+data.url);
							            		}

												$circlebox.html('');
										    	obj.list[idx].stop = false;
							            	},
							            	error: function(){
							            		console.log('error')

												$circlebox.html('');
										    	obj.list[idx].stop = false;
							            	}
							            })
									}, 500);

					            }

								var d = data[i], url = d.videoadr;
								var videocircle =  document.createElement('video');
								videocircle.src = url;
								videocircle.setAttribute('crossorigin', 'anonymous'); // 注意设置图片跨域应该在图片加载之前
								// videocircle.setAttribute('autoplay', 'autoplay'); // 注意设置图片跨域应该在图片加载之前
								videocircle.setAttribute('videotime', d.videotime);
								videocircle.setAttribute('thumbnail', d.thumbnail);
								videocircle.setAttribute('cid', d.id);
								videocircle.setAttribute('cid', d.id);
								$circlebox.append(videocircle);

								videocircle.addEventListener("loadeddata", function (_event) {

									var _this_ = this;
									if(!_this_.getAttribute('videotime')){
									    $.post('circle/circleJson.php?action=updateVideotime_face', 'type=time&id='+_this_.getAttribute('cid')+'&videotime='+parseInt(_this_.getAttribute('duration')));
									 }
							    	if(_this_.getAttribute('thumbnail') == ''){
							    		setTimeout(function(){
							    			captureImage(_this_, 1, _this_.getAttribute('cid'));
							    			if(i + 1 == data.length){
										    	// $circlebox.html('');
										    	// obj.list[idx].stop = false;
										    }
							    		}, 3000);
								    }

								});

								videocircle.addEventListener("error", function (_event) {
									console.clear();
					              console.log('%动态信息视频不存在，或者远程附件服务器没有设置允许跨域，无法自动生成视频缩略图。\n若您没有此需求，请忽略此消息。谢谢您的合作。', 'color:#ccc;font-size:12px');
					            })

							})(data, i, that_, index)
						}
					}
				},
				error: function(){
				}
			})
		},
		circleUeditorVideo_face: function(index){
			var that_ = this;
			var page = that_.list[index].page;
			$.ajax({
				url: 'circle/circleJson.php',
				type: 'post',
				data: 'action=checkUeditorVideo_face',
				dataType: 'json',
				success: function(data){
					if(data && data.length){
						that_.list[index].stop = true;

						$circlebox = $('#circleUpdateUeditorVideotime_face.hide');
						if(!$circlebox.length){
							$circlebox = $('<div id="circleUpdateUeditorVideotime_face" class="hide"></div>');
							$('body').append($circlebox);
						}
						for(var i = 0; i < data.length; i++){
							(function(data, i, obj, idx){

		            var captureImage = function(videos, scale, path, cid){
		            		var scale = scale ? scale : 1;
		                var canvas = document.createElement("canvas");
				            canvas.width = videos.videoWidth * scale;
				            canvas.height = videos.videoHeight * scale;
				            canvas.getContext('2d').drawImage(videos, 0, 0, canvas.width, canvas.height);
				            $circlebox.append(canvas);

				            var img = document.createElement("img");
				            var src = canvas.toDataURL("image/png");
				            img.src = src;
				            $circlebox.append(img);

				            var s = new Date().getTime();
				            $.ajax({
				            	url: '/include/upload.inc.php?mod=circle',
				            	type: 'post',
				            	data: {
				            		'type': 'adv',
				            		'base64': 'base64|'+path,
				            		'thumbLargeWidth': canvas.width,
				            		'thumbLargeHeight': canvas.height,
				            		'Filedata': src.split(',')[1],
				            	},
				            	dataType: 'json',
				            	success: function(data){
				            		if(data && data.state == 'SUCCESS'){
				            			var e = new Date().getTime();
				            			that_.speed = Math.round(data.fileSize/(e-s));
				            			$.post('circle/circleJson.php?action=updateVideotime_face', 'type=face&id='+cid+'&litpic='+data.url);
				            		}
				            	},
				            	error: function(){
				            		console.log('error')
				            	}
				            })
		            }

								var d = data[i], url = d.src, path = d.path.replace('.mp4', '.png');
								var videocircle =  document.createElement('video');
								videocircle.src = url;
								videocircle.setAttribute('crossorigin', 'anonymous'); // 注意设置图片跨域应该在图片加载之前
								$circlebox.append(videocircle);

								videocircle.addEventListener("loadeddata", function (_event) {

									setTimeout(function(){
										captureImage(videocircle, 1, d.id);
										if(i + 1 == data.length){
											$circlebox.html('');
											obj.list[idx].stop = false;
										}
									}, 3000);
								});

								videocircle.addEventListener("error", function (_event) {
									console.clear();
                  console.log('%c动态信息视频不存在，或者远程附件服务器没有设置允许跨域，无法自动生成视频缩略图。\n若您没有此需求，请忽略此消息。谢谢您的合作。', 'color:#ccc;font-size:12px');
                })

							})(data, i, that_, index)
						}
					}
				},
				error: function(){
				}
			})
		},
	}
	function checkModule(){
		if($('#modelList [data-id="article"]').length){
			opearModuleData.list.push({'name': 'articleUpdateVideotime_face'}); // 新闻模块 获取已发布(本地上传)视频的时长及封面
			opearModuleData.list.push({'name': 'articleUeditorVideo_face'}); // 新闻模块 获取已发布(本地上传)视频的时长及封面
		}
		if($('#modelList [data-id="circle"]').length){
			opearModuleData.list.push({'name': 'circlecleUpdateVideotime_face'}); // 圈子模块 获取已发布(本地上传)视频的时长及封面
			opearModuleData.list.push({'name': 'circleUeditorVideo_face'}); // 圈子模块 获取已发布(本地上传)视频的时长及封面
		}
	}
	checkModule();

});


function rightNavMenu(t){
	var menu = $("#menuNav");
	if(menu.is(":visible")){
		menu.hide();
	}else{
		var top = $(".header").height() + $("#welcome").height() + 55, offset = t.offset(), left = offset.left + t.width() - 150;

		if(t.hasClass("lastnav")){
			left = left + 25;
		}

		var parentLi = [], navLiLength = $(".navul li").length, navLiCur = $(".navul li.cur").index(), cleft = cright = 0;
		if(t.hasClass("firstnav") && navLiLength == 0) return;

		var liElse = '';
		if(navLiLength > 1 && navLiCur > -1){
			if(navLiCur != 0){
				parentLi.push('<li class="closeleft"><a href="javascript:;">关闭左侧标签</a></li>');
				cleft = 1;
			}
			if(navLiCur < navLiLength - 1){
				parentLi.push('<li class="closeright"><a href="javascript:;">关闭右侧标签</a></li>');
				cright = 1;
			}
			if(cleft && cright){
				liElse = '<li class="closeelse"><a href="javascript:;">关闭其它标签</a></li>';
			}
		}

		menu.html('<li class="closeall"><a href="javascript:;">关闭全部</a></li>'+liElse+parentLi.join("")+'<li role="presentation" class="divider"></li>');
		var c = "";
		if($(".firstnav").hasClass("cur")){
			c = " cur";
		}
		menu.append('<li class="firstnav'+c+'" id="nav-index" data-type="index" data-listidx="false"><a href="javascript:;">后台首页</a></li>');

		var mscrollHeight = document.documentElement.clientHeight - top - menu.height() - 25;

		if($(".navul ul").html() != ""){
			menu.append('<li role="presentation" class="divider"></li>');
			menu.append('<div class="menu-scroll"></div>');
			menu.find(".menu-scroll").append($(".navul ul").html()
				.replace(/id="(.*?)"/g, "")
				.replace(/<label>/g, "<a href='jajvascript:;'>")
				.replace(/label/g, "a"));
			menu.find(".menu-scroll").css({"max-height": mscrollHeight});
		}

		$("<div>")
			.attr("id", "bodyBg")
			.css({"position": "absolute", "left": "0", "top": "0", "width": "100%", "height": "100%", "background": "#fff", "opacity": "0"})
			.appendTo("body");

		menu.find(".menu-scroll").css({"max-height": (mscrollHeight)});

		menu.css({"top": top, "left": (left < 0 ? 10 : left)}).show();

		menu.find("li").bind("click", function(e){
			var c = $(this).attr("class"), index = $(this).index() + 1;

			//关闭所有标签
			if(c == "closeall"){
				$(".navul ul, .menu-scroll").html("");
				$(".firstnav").click();
				$("#body iframe").each(function() {
					if($(this).attr("id") != "body-index"){
						$(this).remove();
					}
				});
				parentHideTip();
				$(".navul ul").width(0);
				$(".default-nav li:eq(0)").click();
				$(".lastnav").hide();
				return false;
			};

			//关闭当前选中之外的其它标签
			if(c == "closeelse"){
				var curId = $(".navul li.cur").attr("id").replace("nav-", "");
				$(".navul li").each(function(){
					if(!$(this).hasClass("cur")){
						$(this).remove();
					}
				});

				$("#body iframe").each(function() {
					var attrId = $(this).attr("id").replace("body-", "");
					if(attrId != curId && attrId != "index"){
						$(this).remove();
					}
				});
				closeMenu();
				fBodyHeight();
				$(".navul ul").css({"margin-left": 0});
				return false;
			}

			//关闭当前选中的左侧标签
			if(c == "closeleft"){
				var curId = $(".navul li.cur").attr("id").replace("nav-", "");
				var cIndex = $(".navul li.cur").index();
				var navArr = [];
				$(".navul li").each(function(){
					var curIndex = $(".navul li.cur").index();
					var i = $(this).index();
					if(!$(this).hasClass("cur") && i < curIndex){
						$(this).remove();
						navArr.push($(this).attr("id").replace("nav-", ""));
					}
				});

				$("#body iframe").each(function() {
					var attrId = $(this).attr("id").replace("body-", "");
					if($.inArray(attrId, navArr) > -1 && attrId != "index" && attrId != curId){
						$(this).remove();
					}
				});
				closeMenu();
				fBodyHeight();
				return false;
			}

			//关闭当前选中的右侧标签
			if(c == "closeright"){
				var curId = $(".navul li.cur").attr("id").replace("nav-", "");
				var cIndex = $(".navul li.cur").index();
				var navArr = [];
				$(".navul li").each(function(){
					var curIndex = $(".navul li.cur").index();
					var i = $(this).index();
					if(!$(this).hasClass("cur") && i > curIndex){
						$(this).remove();
						navArr.push($(this).attr("id").replace("nav-", ""));
					}
				});

				$("#body iframe").each(function() {
					var attrId = $(this).attr("id").replace("body-", "");
					if($.inArray(attrId, navArr) > -1 && attrId != "index" && attrId != curId){
						$(this).remove();
					}
				});
				closeMenu();
				fBodyHeight();
				return false;
			}

			//首页
			if(c == "firstnav"){
				$(".default-nav li:eq(0)").click();
				return false;
			}

			if(e.target.nodeName.toLowerCase() == "s"){
				$(".default-nav li:eq("+index+")").find("s").click();
				$(this).remove();
				if($(".navul li").length > 0){
					$(".default-nav li:last").click();
				}
			}else{
				$(".default-nav li:eq("+index+")").click();
			}
		});

		return false;
	}
}



function parentHideTip(){
	var notice = parent.$(".w-notice");
	if(notice.length > 0){
		notice.stop().animate({top: "-50px", opacity: 0}, 300, function(){
			notice.remove();
		});
	}
}

//关闭菜单
function closeMenu(){
	$("#menuNav, #bodyBg").hide();
	$("#bodyBg").remove();
}

/*
 * 子页向父级新增标签
 * id     标签ID
 * type   标签类型
 * title  标签标题
 * url    标签地址
 */
function addPage(id, type, title, href){
	$("#welcome a").removeClass("on");

	id = id.replace('notice1', '');

	if(type != "store" && type != "plugins"){
		$("#welcome div").hide();
		$("#welcome-"+type).show();
	}

	title = title.replace(/\s/g, "");
	var strTitle = title;
	if(title.length > 6){
		strTitle = title.substr(0, 6)+"..";
	}

	if($("#nav-"+id).html() == undefined){
		//标签导航处增加栏目信息
		var cur = $(".navul li.cur").index();
		$(".default-nav li").removeClass("cur");
		if(cur > -1){
			$(".navul li:eq("+cur+")").after("<li class='navli' id='nav-"+id+"' data-type='"+type+"' title="+title+"><b></b><label>"+strTitle+"<s title=\"点击关闭标签\">&times;</s></label></li>");
		}else{
			$(".navul ul").append("<li class='navli' id='nav-"+id+"' data-type='"+type+"' title="+title+"><b></b><label>"+strTitle+"<s title=\"点击关闭标签\">&times;</s></label></li>");
		}
		//重置主体内容高度
		fBodyHeight(0);
		if(cur > -1){
			$(".navul li:eq("+cur+")").next("li").click();
		}else{
			$(".navul ul li").click();
		}
	}else{
		$(".default-nav li").removeClass("cur");
		//重置主体内容高度
		fBodyHeight(0);
		$("#nav-"+id).click();
	}

	if($("#body-"+id).html() == undefined){
		//内容区增加栏目iframe
		$("#body iframe").hide();
		$("#body").append('<iframe id="body-'+id+'" name="body-'+id+'" frameborder="0" src="'+href+'"></iframe>');
	}else{
		$("#body iframe").hide();
		$("#body-"+id).show();
	}
	initRightNavMenu();
}

//导航菜单
function openSnSort() {
    var N = $(".header");
    var D = N.find("li");
    var J = null;
    var X = null;
    D.mouseover(function() {
        clearTimeout(X);
		var t = $(this);
		if(t.attr("class") != undefined && t.attr("class").indexOf("sub-li") < 0) {
			t.siblings("li").find(".sub-nav").hide();
			return false;
		}
		var subtitle = t.find(".sub-title").html(), subNav = t.find(".sub-nav"), cla = t.attr("class");
		J = setTimeout(function(){
			if(subtitle != undefined && (subtitle.indexOf("模块") > -1 || subtitle.indexOf("功能搜索") > -1)){
				subNav.css({"left": -t.position().left});
			}else{
				var length = subNav.find("dl dt span").length;
				if(length > 0){
					subNav.width(length * (t.find("dl dt span").width() + 20));
				}
			}
			if(cla != undefined && cla.indexOf("sear") > -1){
				subNav.css({"left": -40, "right": 0});
			}
			subNav.stop(true, true).show();
			t.siblings("li").find(".sub-nav").hide();
			$("#module").css({"height": $(".sub-top").height() + $("#modelList").height() + ($("#modelInfo").is(":visible") ? $("#modelInfo").height() : 0) + 10});
		}, 50);


    }).mouseout(function() {
        clearTimeout(J);
		var t = $(this), cla = t.attr("class");
		var time = 300;
		if(cla != null && (cla.indexOf("sear") > -1 || cla.indexOf("preview") > -1)){
			time = 0;
		}
        X = setTimeout(function() {
            t.find(".sub-nav").stop(true, true).fadeOut(100);
        }, time);
    });
};

//设置主体内容高度
function fBodyHeight(m){
	var nBodyHeight = $(".header").height() + $(".welcome").height() + $(".default-nav").height() + 28, nBodyWidth = document.documentElement.clientWidth - 15;
	var nClientHeight = document.documentElement.clientHeight;

	if($("#fullScreen").hasClass("cur")){
		$(".welcome, .default-nav").hide();
		$("#body").css({"height": nClientHeight - $(".header").height()});
	}else{
		$("#body").height(nClientHeight - nBodyHeight);
	}

	//模块二级菜单宽度
	$(".h-nav li.sub-li").each(function(index, element) {
        if($(this).find(".sub-title").html().indexOf("模块") > -1){
			$(this).find(".sub-nav").width(nBodyWidth - 25);
		}
    });;

	//内容导航宽度
	var navwidth = nBodyWidth - $(".firstnav").width() - $(".lastnav").width() - 35;
	$(".navul").css({"max-width": navwidth});
	var w = 0;
	$(".navul li").each(function() {
		w = w + $(this).outerWidth();
	});
	w -= ($(".navul li").length - 1);

	$(".navul ul").width(Math.ceil(w+2));

	if($(".navul li").length > 2){
		$(".lastnav").show();
	}else{
		$(".lastnav").hide();
	}

	if(m != 0){
		if((w - navwidth) > 0){
			// $(".navul ul").stop().animate({"margin-left": -(w-navwidth)}, 200, 'swing');
		}
	}
}

//全屏，找到支持的方法, 使用需要全屏的 element 调用
function launchFullScreen(element) {
	if(element.requestFullscreen) {
		element.requestFullscreen();
	} else if(element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if(element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	} else if(element.msRequestFullscreen) {
		element.msRequestFullscreen();
	}
}

//退出 fullscreen
function exitFullscreen() {
	if(document.exitFullscreen) {
		document.exitFullscreen();
	} else if(document.mozExitFullScreen) {
		document.mozExitFullScreen();
	} else if(document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	}
}

//重新刷新页面，使用location.reload()有可能导致重新提交
function reloadPage(win) {
	//var location = win.location;
	//location.href = location.pathname + location.search;
	if(typeof win=="object"){
		win = win[0].id;
	}
	document.getElementById(win).contentWindow.location.reload(true);
	// var location = win.attr("src");
	// if(location){
	// 	win.attr("src", win.attr("src"));
	// }
}

//监听F5，只刷新当前页面
function resetEscAndF5(e) {
	e = e ? e : window.event;
	actualCode = e.keyCode ? e.keyCode : e.charCode;
	var id = $(".default-nav .cur").attr("id").replace("nav-", ""),iframe = "body-"+id;
	//if(actualCode == 116 && iframe[0].contentWindow) {
	//	reloadPage(iframe[0].contentWindow);
	if(actualCode == 116 && iframe) {
		reloadPage(iframe);
		if(document.all) {
			e.keyCode = 0;
			e.returnValue = false;
		} else {
			e.cancelBubble = true;
			e.preventDefault();
		}
	}
}

function _attachEvent(obj, evt, func, eventobj) {
	eventobj = !eventobj ? obj : eventobj;
	if(obj.addEventListener) {
		obj.addEventListener(evt, func, false);
	} else if(eventobj.attachEvent) {
		obj.attachEvent('on' + evt, func);
	}
}

_attachEvent(document.documentElement, 'keydown', resetEscAndF5);


//上传成功接收
function uploadSuccess(obj, file, filetype){
	$("#"+obj).val(file);
	$("#"+obj).siblings(".spic").find(".sholder").html('<img src="'+cfg_attachment+file+'" />');
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}

//删除文件
function reupload(action, t){
	var t = $(t), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
	var g = {
		mod: action,
		type: "delbrandLogo",
		picpath: input.val(),
		randoms: Math.random()
	};
	$.ajax({
		type: "POST",
		cache: false,
		async: false,
		url: "/include/upload.inc.php",
		dataType: "json",
		data: $.param(g),
		success: function() {
			try {
				input.val("");
				t.prev(".sholder").html('');
				parent.hide();
				iframe.attr("src", src).show();
			} catch(b) {}
		}
	})
};


//异步获取预览链接
function getPreviewInfo(){
	$.ajax({
		url: "index.php?dopost=getModuleArr",
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			var list = [];
			for(var i = 0; i < data.length; i++){
				list.push('<a href="'+data[i].url+'" target="_blank">'+data[i].name+'</a>');
			}
			$("#preview").html(list.join(""));


			//临时处理域名修改后不生效的BUG，原因是程序第一次请求到的配置文件不是最新的，第二次请求才对
			setTimeout(function(){
				$.ajax({
					url: "index.php?dopost=getModuleArr",
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						var list = [];
						for(var i = 0; i < data.length; i++){
							list.push('<a href="'+data[i].url+'" target="_blank">'+data[i].name+'</a>');
						}
						$("#preview").html(list.join(""));
					}
				});
			}, 5000);


		}
	});
}
function in_array(str, arr){
    for(var i in arr){
        if(arr[i] == str){
            return true;
        }
    }
    return false;
}

//是否移动端
function isMobile(){
	if((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
		return true;
	}
}

function open_images_preview(data) {
    var that = this,
        mask = $('<div class="preview_images_mask">' +
            '<div class="preview_head">' +
            '<span class="preview_title">' + data.filename + '</span>' +
            '<span class="preview_small hide" title="缩小显示"><span class="glyphicon glyphicon-resize-small" aria-hidden="true"></span></span>' +
            '<span class="preview_full" title="最大化显示"><span class="glyphicon glyphicon-resize-full" aria-hidden="true"></span></span>' +
            '<span class="preview_close" title="关闭图片预览视图"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></span>' +
            '</div>' +
            '<div class="preview_body"><img id="preview_images" src="' + data.path + '" data-index="'+data.images_id+'"></div>' +
            '<div class="preview_toolbar">' +
            '<a href="javascript:;" title="左旋转"><span class="glyphicon glyphicon-repeat reverse-repeat" aria-hidden="true"></span></a>' +
            '<a href="javascript:;" title="右旋转"><span class="glyphicon glyphicon-repeat" aria-hidden="true"></span></a>' +
            '<a href="javascript:;" title="放大视图"><span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span></a>' +
            '<a href="javascript:;" title="缩小视图"><span class="glyphicon glyphicon-zoom-out" aria-hidden="true"></span></a>' +
            '<a href="javascript:;" title="重置视图"><span class="glyphicon glyphicon-refresh" aria-hidden="true"></span></a>' +
            '<a href="javascript:;" title="图片列表"><span class="glyphicon glyphicon-list" aria-hidden="true"></span></a>' +
            '</div>' +
            '<div class="preview_cut_view">' +
            '<a href="javascript:;" title="上一张"><span class="glyphicon glyphicon-menu-left" aria-hidden="true"></span></a>' +
            '<a href="javascript:;" title="下一张"><span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span></a>' +
            '</div>' +
            '</div>'),
        images_config = { natural_width: 0, natural_height: 0, init_width: 0, init_height: 0, preview_width: 0, preview_height: 0, current_width: 0, current_height: 0, current_left: 0, current_top: 0, rotate: 0, scale: 1, images_mouse: false };
    if ($('.preview_images_mask').length > 0) {
        $('#preview_images').attr('src', data.path);
        return false;
    }
    $('body').css('overflow', 'hidden').append(mask);
    $('body').append('<div class="preview_images_maskbg"></div>');
    images_config.preview_width = mask[0].clientWidth;
    images_config.preview_height = mask[0].clientHeight;
    // 图片预览
    $('.preview_body img').load(function () {
        var img = $(this)[0];
        if (!$(this).attr('data-index')) $(this).attr('data-index', data.images_id);
        images_config.natural_width = img.naturalWidth;
        images_config.natural_height = img.naturalHeight;
        auto_images_size(false);
    });
    //图片头部拖动
    $('.preview_images_mask .preview_head').on('mousedown', function (e) {
        e = e || window.event; //兼容ie浏览器
        var drag = $(this).parent();
        $('body').addClass('select'); //webkit内核和火狐禁止文字被选中
        $(this).onselectstart = $(this).ondrag = function () { //ie浏览器禁止文字选中
            return false;
        }
        if ($(e.target).hasClass('preview_close')) { //点关闭按钮不能拖拽模态框
            return;
        }
        var diffX = e.clientX - drag.offset().left;
        var diffY = e.clientY - drag.offset().top;
        $(document).on('mousemove', function (e) {
            e = e || window.event; //兼容ie浏览器
            var left = e.clientX - diffX;
            var top = e.clientY - diffY;
            if (left < 0) {
                left = 0;
            } else if (left > window.innerWidth - drag.width()) {
                left = window.innerWidth - drag.width();
            }
            if (top < 0) {
                top = 0;
            } else if (top > window.innerHeight - drag.height()) {
                top = window.innerHeight - drag.height();
            }
            drag.css({
                left: left,
                top: top,
                margin: 0
            });
        }).on('mouseup', function () {
            $(this).unbind('mousemove mouseup');
        });
    });
    //图片拖动
    $('.preview_images_mask #preview_images').on('mousedown', function (e) {
        e = e || window.event;
        $(this).onselectstart = $(this).ondrag = function () {
            return false;
        }
        var images = $(this);
        var preview = $('.preview_images_mask').offset();
        var diffX = e.clientX - preview.left;
        var diffY = e.clientY - preview.top;
        $('.preview_images_mask').on('mousemove', function (e) {
            e = e || window.event
            var offsetX = e.clientX - preview.left - diffX,
                offsetY = e.clientY - preview.top - diffY,
                rotate = Math.abs(images_config.rotate / 90),
                preview_width = (rotate % 2 == 0 ? images_config.preview_width : images_config.preview_height),
                preview_height = (rotate % 2 == 0 ? images_config.preview_height : images_config.preview_width),
                left, top;
            if (images_config.current_width > preview_width) {
                var max_left = preview_width - images_config.current_width;
                left = images_config.current_left + offsetX;
                if (left > 0) {
                    left = 0
                } else if (left < max_left) {
                    left = max_left
                }
                images_config.current_left = left;
            }
            if (images_config.current_height > preview_height) {
                var max_top = preview_height - images_config.current_height;
                top = images_config.current_top + offsetY;
                if (top > 0) {
                    top = 0
                } else if (top < max_top) {
                    top = max_top
                }
                images_config.current_top = top;
            }
            if (images_config.current_height > preview_height && images_config.current_top <= 0) {
                if ((images_config.current_height - preview_height) <= images_config.current_top) {
                    images_config.current_top -= offsetY
                }
            }
            images.css({ 'left': images_config.current_left, 'top': images_config.current_top });
        }).on('mouseup', function () {
            $(this).unbind('mousemove mouseup');
        }).on('dragstart', function () {
            e.preventDefault();
        });
    }).on('dragstart', function () {
        return false;
    });

    var keydownFunc = function(e){
        e = e ? e : window.event;
        actualCode = e.keyCode ? e.keyCode : e.charCode;
        
        //ESC
        if(actualCode == 27) {
            $('.preview_close').click();
        }

        //加号，放大图片
        if(actualCode == 107) {
            $('.preview_toolbar a:eq(2)').click();
        }
        //减号，缩小图片
        if(actualCode == 109) {
            $('.preview_toolbar a:eq(3)').click();
        }

        //左，上一张
        if(actualCode == 37) {
            $('.preview_cut_view a:eq(0)').click();
        }
        //右，下一张
        if(actualCode == 39) {
            $('.preview_cut_view a:eq(1)').click();
        }
    };

    //关闭预览图片
    $('.preview_close').click(function (e) {
        $('.preview_images_mask, .preview_images_maskbg').remove();

        document.documentElement.removeEventListener('keydown',keydownFunc,false);
    });
    //图片工具条预览
    $('.preview_toolbar a').click(function () {
        var index = $(this).index(),
            images = $('#preview_images');
        switch (index) {
            case 0: //左旋转,一次旋转90度
            case 1: //右旋转,一次旋转90度
                images_config.rotate = index ? (images_config.rotate + 90) : (images_config.rotate - 90);
                auto_images_size();
                break;
            case 2:
            case 3:
                if (images_config.scale == 3 && index == 2 || images_config.scale == 0.2 && index == 3) {
                    console.log((images_config.scale >= 1 ? '图像放大，已达到最大尺寸。' : '图像缩小，已达到最小尺寸。'));
                    return false;
                }
                images_config.scale = (index == 2 ? Math.round((images_config.scale + 0.4) * 10) : Math.round((images_config.scale - 0.4) * 10)) / 10;
                auto_images_size();
                break;
            case 4:
                var scale_offset = images_config.rotate % 360;
                if (scale_offset >= 180) {
                    images_config.rotate += (360 - scale_offset);
                } else {
                    images_config.rotate -= scale_offset;
                }
                images_config.scale = 1;
                auto_images_size();
                break;
        }
    });
    // 最大最小化图片
    $('.preview_full,.preview_small').click(function () {
        if ($(this).hasClass('preview_full')) {
            $(this).addClass('hide').prev().removeClass('hide');
            images_config.preview_width = window.innerWidth;
            images_config.preview_height = window.innerHeight;
            mask.css({ width: window.innerWidth, height: window.innerHeight, top: 0, left: 0, margin: 0 }).data('type', 'full');
            auto_images_size();
        } else {
            $(this).addClass('hide').next().removeClass('hide');
            $('.preview_images_mask').removeAttr('style');
            images_config.preview_width = 950;
            images_config.preview_height = 750;
            auto_images_size();
        }
    });
    // 上一张，下一张
    $('.preview_cut_view a').click(function () {
        var images_src = '',
            preview_images = $('#preview_images'),
            images_id = parseInt(preview_images.attr('data-index'));
        if (!$(this).index()) {
            images_id = images_id === 0 ? (file_images_list.length - 1) : images_id - 1;
            images_src = file_images_list[images_id];
        } else {
            images_id = (images_id == (file_images_list.length - 1)) ? 0 : (images_id + 1);
            images_src = file_images_list[images_id];
        }
        preview_images.attr('data-index', images_id).attr('src', images_src);
        $('.preview_title').html(get_path_filename(images_src));
    });
    // 自动图片大小
    function auto_images_size(transition) {
        var rotate = Math.abs(images_config.rotate / 90),
            preview_width = (rotate % 2 == 0 ? images_config.preview_width : images_config.preview_height),
            preview_height = (rotate % 2 == 0 ? images_config.preview_height : images_config.preview_width),
            preview_images = $('#preview_images'),
            css_config = {};
        images_config.init_width = images_config.natural_width;
        images_config.init_height = images_config.natural_height;
        if (images_config.init_width > preview_width) {
            images_config.init_width = preview_width;
            images_config.init_height = parseFloat(((preview_width / images_config.natural_width) * images_config.natural_height).toFixed(2));
        }
        if (images_config.init_height > preview_height) {
            images_config.init_width = parseFloat(((preview_height / images_config.natural_height) * images_config.natural_width).toFixed(2));
            images_config.init_height = preview_height;
        }
        images_config.current_width = parseFloat(images_config.init_width * images_config.scale);
        images_config.current_height = parseFloat(images_config.init_height * images_config.scale);
        images_config.current_left = parseFloat(((images_config.preview_width - images_config.current_width) / 2).toFixed(2));
        images_config.current_top = parseFloat(((images_config.preview_height - images_config.current_height) / 2).toFixed(2));
        css_config = {
            'width': images_config.current_width,
            'height': images_config.current_height,
            'top': images_config.current_top,
            'left': images_config.current_left,
            'display': 'inline',
            'transform': 'rotate(' + images_config.rotate + 'deg)',
            'opacity': 1,
            'transition': 'all 100ms',
        }
        if (transition === false) delete css_config.transition;
        preview_images.css(css_config);
    }

    //键盘控制
    _attachEvent(document.documentElement, 'keydown', keydownFunc);
}

function get_path_filename(path) {
    var paths = path.split('/');
    return paths[paths.length - 1];
}

var t = "\u5b98\u65b9\u7f51\u7ad9\uff1a\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u006b\u0075\u006d\u0061\u006e\u0079\u0075\u006e\u002e\u0063\u006f\u006d\n\u4f7f\u7528\u534f\u8bae\uff1a\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u006b\u0075\u006d\u0061\u006e\u0079\u0075\u006e\u002e\u0063\u006f\u006d\u002f\u0074\u0065\u0072\u006d\u0073\u002e\u0068\u0074\u006d\u006c\n\u300a\u8ba1\u7b97\u673a\u8f6f\u4ef6\u4fdd\u62a4\u6761\u4f8b\u300b\uff1a\u0068\u0074\u0074\u0070\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u0067\u006f\u0076\u002e\u0063\u006e\u002f\u0067\u006f\u006e\u0067\u0062\u0061\u006f\u002f\u0063\u006f\u006e\u0074\u0065\u006e\u0074\u002f\u0032\u0030\u0031\u0033\u002f\u0063\u006f\u006e\u0074\u0065\u006e\u0074\u005f\u0032\u0033\u0033\u0039\u0034\u0037\u0031\u002e\u0068\u0074\u006d\n\u300a\u4e2d\u534e\u4eba\u6c11\u5171\u548c\u56fd\u8457\u4f5c\u6743\u6cd5\u300b\uff1a\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u006e\u0063\u0061\u0063\u002e\u0067\u006f\u0076\u002e\u0063\u006e\u002f\u0063\u0068\u0069\u006e\u0061\u0063\u006f\u0070\u0079\u0072\u0069\u0067\u0068\u0074\u002f\u0063\u006f\u006e\u0074\u0065\u006e\u0074\u0073\u002f\u0031\u0032\u0032\u0033\u0030\u002f\u0033\u0035\u0033\u0037\u0039\u0035\u002e\u0073\u0068\u0074\u006d\u006c";
console.log("%c\u706b\u9e1f\u95e8\u6237\u7cfb\u7edf %c \u0043\u006f\u0070\u0079\u0072\u0069\u0067\u0068\u0074 \xa9 \u0032\u0030\u0031\u0033-%s \u82cf\u5dde\u9177\u66fc\u8f6f\u4ef6\u6280\u672f\u6709\u9650\u516c\u53f8\n\n%c" + t + "\n ", 'font-family: "Microsoft Yahei", Helvetica, Arial, sans-serif;font-size:30px;color:#333;-webkit-text-fill-color:#333;-webkit-text-stroke: 1px #333; line-height:40px;', "font-size:12px;color:#999999;", (new Date).getFullYear(), "color:#333;font-size:12px;")