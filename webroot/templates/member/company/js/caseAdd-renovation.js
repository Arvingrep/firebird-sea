$(function(){

	$("#selTeam a").bind("click", function(){
		getAlbums($(this).data("id"));
	});

	getAlbums($("#designer").val());

	//获取设计师的设计方案
	function getAlbums(id) {
		if(id != 0 && id != ""){
			$.ajax({
				url: masterDomain+"/include/ajax.php?service=renovation&action=rcase&designer="+id,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){

						var arr = [], list = data.info.list;
						for(var i = 0; i < list.length; i++){
							arr.push('<li><a href="javascript:;" data-id="'+list[i].id+'" title="'+list[i].title+'">'+list[i].title+'</a></li>')
						}
						$("#selCase .sel-menu").html(arr.join(""));
						$("#selCase .sel").attr("disabled", false);

					}else{
						$("#selCase .sel").html(data.info+'<span class="caret"></span>').attr("disabled", true);
					}
				},
				error: function(){
					$("#selCase .sel").html(langData['siteConfig'][20][228]+'<span class="caret"></span>').attr("disabled", true);
				}
			});
		}
	}


	var init = {
		//树形递归分类
		treeTypeList: function(data){
			var typeList = [], cl = "";
			for(var i = 0; i < data.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower;
					typeList.push('<a href="javascript:;" data="'+jsonArray["id"]+'">'+cl+"|--"+jsonArray["typename"]+'</a>');
					if(jArray != undefined){
						for(var k = 0; k < jArray.length; k++){
							cl += '&nbsp;&nbsp;&nbsp;&nbsp;';
							if(jArray[k]['lower'] != ""){
								arguments.callee(jArray[k]);
							}else{
								typeList.push('<a href="javascript:;" data="'+jArray[k]["id"]+'">'+cl+"|--"+jArray[k]["typename"]+'</a>');
							}
							if(jsonArray["lower"] == null){
								cl = "";
							}else{
								cl = cl.replace("&nbsp;&nbsp;&nbsp;&nbsp;", "");
							}
						}
					}
				})(data[i]);
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
	}


	//选择小区
	$("#selCommunity .sel").bind("click", function(){
		var t = $(this);

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=renovation&action=addr&son=1",
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data){

					var content = [];

					//选地区
					content.push('<div class="choose-item" id="selectAddr"><h2>'+langData['siteConfig'][6][73]+'：</h2><div class="choose-container fn-clear">');
					content.push('<div class="pinp_main"><div class="pinp_main_zm">'+init.treeTypeList(data.info)+'</div></div>');
					content.push('</div></div>');

					//选小区
					content.push('<div class="choose-item" id="selectCommunity" style="width:230px;"><h2>'+langData['siteConfig'][6][74]+'：<span id="tCount"></span></h2><div class="choose-container fn-clear">');
					content.push('<div class="pinp_main"><div class="pinp_main_zm"><center style="line-height:335px;">'+langData['siteConfig'][20][127]+'</center></div></div>');
					content.push('</div></div>');

					$.dialog({
						id: "chooseData",
						fixed: false,
						title: langData['siteConfig'][6][74],
						content: '<div class="chooseData fn-clear">'+content.join("")+'</div>',
						width: 590,
						okVal: langData['siteConfig'][6][1],
						ok: function(){

							//确定选择结果
							var obj = parent.$("#selectCommunity .cur"),
								id = obj.attr("data-id"),
								title = obj.attr("data-title");
							if(id != undefined && title != undefined){
								$("#community").val(id);
								t.html(title);
							}else{
								alert(langData['siteConfig'][20][523]);
								return false;
							}

						},
						cancelVal: langData['siteConfig'][6][15],
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

						parent.$("#selectCommunity .pinp_main_zm").html('<center style="line-height:335px;">'+langData['siteConfig'][6][176]+'...</center>');


						$.ajax({
							url: masterDomain+"/include/ajax.php?service=renovation&action=community&addrid="+addr,
							type: "GET",
							dataType: "jsonp",
							success: function (data) {
								if(data && data.state == 100){
									var list = data.info.list, community = [];
									for (var i = 0; i < list.length; i++) {
										community.push('<a href="javascript:;" data-id="'+list[i].id+'" data-title="'+list[i].title+'" data-address="'+list[i].address+'" data-price="'+list[i].price+'" title="'+list[i].title+'"> '+(i+1)+'. '+list[i].title+'</a>');
									};
									parent.$("#selectCommunity .pinp_main_zm").html(community.join(""));
									parent.$("#tCount").html("<small>"+list.length+"个</small>");
								}else{
									parent.$("#selectCommunity .pinp_main_zm").html('<center style="line-height:335px;">'+langData['siteConfig'][20][127]+'</center>');
									parent.$("#tCount").html("");
								}
							}
						});

					}

					//选择小区
					parent.$("#selectCommunity").delegate("a", "click", function(){
						parent.$("#selectCommunity a").removeClass("cur");
			        	$(this).addClass("cur");
					});

				}
			}
		});
	});



	//删除文件
	$(".reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");

		init.delFile(input.val(), false);

		input.val("");
		t.prev(".sholder").html('');
		parent.hide();
		iframe.attr("src", src).show();
	});


	$("#typeObj span").bind("click", function(){
		var t = $(this), id = t.data("id");
		$("#type0, #type1").hide();
		$("#type"+id).show();
		if(id == 0){
			$("#selCommunity").show();
		}else{
			$("#selCommunity").hide();
		}
	});

	//时间
	var selectDate = function(el, func){
		WdatePicker({
			el: el,
			isShowClear: false,
			isShowOK: false,
			isShowToday: false,
			qsEnabled: false,
			dateFmt: 'yyyy-MM-dd'
		});
	}
	$("#began").focus(function(){
		selectDate("began");
	});

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t        = $(this),
				designer = $("#designer").val(),
				title    = $("#title"),
				litpic   = $("#litpic").val();

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

		if(designer == "" || designer == 0){
			var hline = $("#selTeam").find(".tip-inline"), tips = $("#designer").data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}else{
			$("#selTeam").find(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
		}

		if($.trim(title.val()) == ""){
			var hline = title.next(".tip-inline"), tips = title.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}else{
			title.next(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
		}

		if(litpic == "" && offsetTop <= 0){
			$.dialog.alert(langData['siteConfig'][27][78]);
			offsetTop = $("#license").position().top;
		}

		//图集
		var imgli = $("#listSection3 li");
		if(imgli.length <= 0 && offsetTop <= 0){
			$.dialog.alert(langData['siteConfig'][20][436]);
			offsetTop = $("#listSection3").position().top;
		}

		var certs = $("#imglist").val().replace(/\|/g, "##").replace(/,/g, "||");
		$("#imglist").attr("value", certs);

		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}

		var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
		data = form.serialize();

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					var tip = langData['siteConfig'][20][341];
					if(id != undefined && id != "" && id != 0){
						tip = langData['siteConfig'][20][229];
					}

					$.dialog({
						title: langData['siteConfig'][19][287],
						icon: 'success.png',
						content: tip,
						ok: function(){
							location.href = url;
						}
					});

				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['shop'][1][7]);
					$("#verifycode").click();
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['shop'][1][7]);
				$("#verifycode").click();
			}
		});

	});

});

//上传成功接收
function uploadSuccess(obj, file, type, path){
	$("#"+obj).val(file);
	$("#"+obj).siblings(".spic").find(".sholder").html('<img src="'+path+'" />');
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}
