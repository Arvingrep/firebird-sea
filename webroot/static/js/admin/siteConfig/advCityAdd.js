var mue = UE.getEditor('notifyAdv', {"term": "mobile"});

$(function () {

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {

		//重新上传时删除已上传的文件
		delFile: function(b, d, c) {
			var g = {
				mod: action,
				type: "delAdv",
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

	//填充城市列表
	huoniao.buildAdminList($("#cityid"), cityList, '请选择分站', cityid);
	$(".chosen-select").chosen();

	$("#class"+$("#ad_class").text()).show();

	//普通广告展现方式切换
	$("input[name=style]").bind("click", function(e){
		var val = $(this).val();
		$("input[name=style]").each(function(){
			$("#style_"+$(this).val()).hide();
		});
		$("#style_"+val).show();
	});

	var ad_body = $("#ad_Body").html().split("$$");
	if($("#ad_class").text() == '1'){
		$("input[name=style][value="+ad_body[0]+"]").click();
	}

	//首次加载
	if($("#dopost").val() == "edit"){
		if($("#ad_class").text() != ""){


			var adbody = $("#adBody").html().split("$$");

			//普通广告
			if($("#ad_class").text() == '1'){

				//code
				if(ad_body[0] == "code"){
					$("#codehtml").val(adbody[1]);

					if(adbody[2] == 1){
						$('#class1 input[name=mark1][value=0]').attr('checked', false);
						$('#class1 input[name=mark1][value=1]').attr('checked', true);
					}else{
						$('#class1 input[name=mark1][value=0]').attr('checked', true);
						$('#class1 input[name=mark1][value=1]').attr('checked', false);
					}

				//文字
				}else if(ad_body[0] == "text"){
					$("#texttitle").val(adbody[1]);
					$("#color").val(adbody[2]);
					$(".color_pick em").css({"background": adbody[2]});
					$("#textlink").val(adbody[3]);
					$("#textsize").val(adbody[4]);

					if(adbody[5] == 1){
						$('#class1 input[name=mark1][value=0]').attr('checked', false);
						$('#class1 input[name=mark1][value=1]').attr('checked', true);
					}else{
						$('#class1 input[name=mark1][value=0]').attr('checked', true);
						$('#class1 input[name=mark1][value=1]').attr('checked', false);
					}

				//图片
				}else if(ad_body[0] == "pic"){
					$("#class1pic").val(adbody[1]);
					var media = "";
					if(adbody[1].split(".")[1] == "swf"){
						media = '<embed src="'+cfg_attachment+adbody[1]+'" type="application/x-shockwave-flash" quality="high" wmode="transparent">';
					}else{
						media = '<li id="WU_FILE_0_1"><a href='+cfg_attachment+adbody[1]+' target="_blank"><img src="'+cfg_attachment+adbody[1]+'" data-val="'+adbody[1]+'" /></a><a class="reupload li-rm" href="javascript:;">重新上传</a></li>';
					}
					$("#class1pic").siblings(".listSection").html(media);
					$("#class1pic").siblings(".filePicker").hide();
					$("#piclink").val(adbody[2]);
					$("#picalt").val(adbody[3]);
					$("#class1picwidth").val(adbody[4]);
					$("#class1picheight").val(adbody[5]);

					if(adbody[6] == 1){
						$('#class1 input[name=mark1][value=0]').attr('checked', false);
						$('#class1 input[name=mark1][value=1]').attr('checked', true);
					}else{
						$('#class1 input[name=mark1][value=0]').attr('checked', true);
						$('#class1 input[name=mark1][value=1]').attr('checked', false);
					}

				//flash
				}else if(ad_body[0] == "flash"){
					$("#class1flash").val(adbody[1]);
					$("#class1flash").siblings("iframe").hide();
					var media = '<embed src="'+cfg_attachment+adbody[1]+'" type="application/x-shockwave-flash" quality="high" wmode="transparent">';
					$("#class1flash").siblings(".spic").find(".sholder").html(media);
					$("#class1flash").siblings(".spic").find(".reupload").attr("style", "display:inline;");
					$("#class1flash").siblings(".spic").show();
					$("#flashwidth").val(adbody[2]);
					$("#flashheight").val(adbody[3]);

					if(adbody[4] == 1){
						$('#class1 input[name=mark1][value=0]').attr('checked', false);
						$('#class1 input[name=mark1][value=1]').attr('checked', true);
					}else{
						$('#class1 input[name=mark1][value=0]').attr('checked', true);
						$('#class1 input[name=mark1][value=1]').attr('checked', false);
					}

				}

			//多图广告
			}else if($("#ad_class").text() == 2){
				$("#class2picwidth").val(adbody[0]);
				$("#class2picheight").val(adbody[1]);

				var imglistArr1 = adbody[2];
				$('#imglist1').val(imglistArr1);
				//填充图集
				if(imglistArr1 != ""){
					imgArray = imglistArr1.split("||");
					var picList = [];
					for(var i = 0; i < imgArray.length; i++){
						var imgItem = imgArray[i].split("##");
						picList.push('<li class="clearfix" id="SWFUpload_1_0'+i+'">');
						picList.push('  <a class="li-move" href="javascript:;" title="拖动调整图片顺序">移动</a>');
						picList.push('  <a class="li-rm" href="javascript:;">×</a>');
						picList.push('  <div class="li-thumb" style="display:block;">');
						picList.push('    <div class="r-progress"><s></s></div>');
						picList.push('    <span class="ibtn"><a href="javascript:;" class="Lrotate" title="逆时针旋转90度"></a><a href="javascript:;" class="Rrotate" title="顺时针旋转90度"></a><a href="'+cfg_attachment+imgItem[0]+'" target="_blank" class="enlarge" title="放大"></a></span><span class="ibg"></span>');
						picList.push('    <img data-val="'+imgItem[0]+'" src="'+cfg_attachment+imgItem[0]+'" data-url="'+cfg_attachment+imgItem[0]+'" />');
						picList.push('  </div>');
						picList.push('  <div class="li-input" style="display:block;"><input type="text" style="margin:0 10px 10px 0; width:47%; float:left;" class="i-name" placeholder="请输入图片名称" value="'+imgItem[1]+'" /><input type="text" style="margin:0 0 10px 0; width:46%; float:left;" class="i-link" placeholder="请输入图片链接" value="'+imgItem[2]+'" /><input type="text" style="margin:0 10px 10px 0; width:47%; float:left;" class="i-desc" placeholder="请输入图片介绍" value="'+imgItem[3]+'" /><div class="help-inline" style="padding-left: 0; line-height: 35px;">广告标识：<label><input type="radio" class="mark" value="1" name="mark_'+i+'"'+(imgItem[4] == 1 ? ' checked' : '')+'>隐藏</label>&nbsp;&nbsp;&nbsp;&nbsp;<label><input type="radio" class="mark" value="0" name="mark_'+i+'"'+(imgItem[4] != 1 ? ' checked' : '')+'>显示</label></div></div>');
						picList.push('</li>');
					}
					$("#listSection2").html(picList.join(""));
					$(".deleteAllAtlas").show();
				}

			//拉伸广告
			}else if($("#ad_class").text() == 3){
				$("#showtime").val(adbody[0]);
				$("#adwidth").val(adbody[1]);
				$("#extrulink").val(adbody[2]);

				$("#class3bigpic").val(adbody[3]);
				var media = "";
				if($("#type1").html() == ".swf"){
					media = '<embed src="'+cfg_attachment+adbody[3]+'" type="application/x-shockwave-flash" quality="high" wmode="transparent">';
				}else{
					media = '<li id="WU_FILE_0_1"><a href='+cfg_attachment+adbody[3]+' target="_blank"><img src="'+cfg_attachment+adbody[3]+'" data-val="'+adbody[3]+'" /></a><a class="reupload li-rm" href="javascript:;">重新上传</a></li>';
				}
				$("#class3bigpic").siblings(".listSection").html(media);
				$("#class3bigpic").siblings(".filePicker").hide();

				$("#bigheight").val(adbody[4]);

				$("#class3smallpic").val(adbody[5]);
				$("#class3smallpic").siblings("iframe").hide();
				var media = "";
				if($("#type2").html() == ".swf"){
					media = '<embed src="'+cfg_attachment+adbody[5]+'" type="application/x-shockwave-flash" quality="high" wmode="transparent">';
				}else{
					media = '<li id="WU_FILE_1_1"><a href='+cfg_attachment+adbody[5]+' target="_blank"><img src="'+cfg_attachment+adbody[5]+'" data-val="'+adbody[5]+'" /></a><a class="reupload li-rm" href="javascript:;">重新上传</a></li>';
				}
				$("#class3smallpic").siblings(".listSection").html(media);
				$("#class3smallpic").siblings(".filePicker").hide();

				$("#smallheight").val(adbody[6]);

				if(adbody[7] == 1){
					$('#class3 input[name=mark3][value=0]').attr('checked', false);
					$('#class3 input[name=mark3][value=1]').attr('checked', true);
				}else{
					$('#class3 input[name=mark3][value=0]').attr('checked', true);
					$('#class3 input[name=mark3][value=1]').attr('checked', false);
				}

			//对联广告
			}else if($("#ad_class").text() == 4){
				$("#bodywidth").val(adbody[0]);
				$("#adwidth_").val(adbody[1]);
				$("#adheight_").val(adbody[2]);
				$("#topheight").val(adbody[3]);

				var class4left = adbody[4].split("##");
				if (class4left[0] != "") {
					$("#class4leftpic").val(class4left[0]);
					$("#class4leftpic").siblings("iframe").hide();
					var media = "";
					if($("#type1").html() == ".swf"){
						media = '<embed src="'+cfg_attachment+class4left[0]+'" type="application/x-shockwave-flash" quality="high" wmode="transparent">';
					}else{
						media = '<li id="WU_FILE_2_1"><a href='+cfg_attachment+class4left[0]+' target="_blank"><img src="'+cfg_attachment+class4left[0]+'" data-val="'+class4left[0]+'" /></a><a class="reupload li-rm" href="javascript:;">重新上传</a></li>';
					}
					$("#class4leftpic").siblings(".listSection").html(media);
					$("#class4leftpic").siblings(".filePicker").hide();
					$("#leftpiclink").val(class4left[1]);
					$("#leftpicalt").val(class4left[2]);

					if(class4left[3] == 1){
						$('#class4 input[name=markLeft][value=0]').attr('checked', false);
						$('#class4 input[name=markLeft][value=1]').attr('checked', true);
					}else{
						$('#class4 input[name=markLeft][value=0]').attr('checked', true);
						$('#class4 input[name=markLeft][value=1]').attr('checked', false);
					}
				}

				var class4right = adbody[5].split("##");
				if (class4right[0] != "") {
					$("#class4rightpic").val(class4right[0]);
					$("#class4rightpic").siblings("iframe").hide();
					var media = "";
					if($("#type2").html() == ".swf"){
						media = '<embed src="'+cfg_attachment+class4right[0]+'" type="application/x-shockwave-flash" quality="high" wmode="transparent">';
					}else{
						media = '<li id="WU_FILE_2_1"><a href='+cfg_attachment+class4right[0]+' target="_blank"><img src="'+cfg_attachment+class4right[0]+'" data-val="'+class4right[0]+'" /></a><a class="reupload li-rm" href="javascript:;">重新上传</a></li>';
					}
					$("#class4rightpic").siblings(".listSection").html(media);
					$("#class4rightpic").siblings(".filePicker").hide();
					$("#rightpiclink").val(class4right[1]);
					$("#rightpicalt").val(class4right[2]);

					if(class4right[3] == 1){
						$('#class4 input[name=markRight][value=0]').attr('checked', false);
						$('#class4 input[name=markRight][value=1]').attr('checked', true);
					}else{
						$('#class4 input[name=markRight][value=0]').attr('checked', true);
						$('#class4 input[name=markRight][value=1]').attr('checked', false);
					}
				}


			//节日广告
			}else if($("#ad_class").text() == 5){
				$("#class5headHeight").val(adbody[0]);
				$("#class5picurl").val(adbody[2]);
				var litpic = adbody[1];

				$('#litpic').val(litpic);
				//填充图集
				if(litpic != ""){
					var media = '<li id="WU_FILE_2_1"><a href='+cfg_attachment+litpic+' target="_blank"><img src="'+cfg_attachment+litpic+'" data-val="'+litpic+'" /></a><a class="reupload li-rm" href="javascript:;">重新上传</a></li>';
					$("#listSection10").html(media);
					$("#class5 .deleteAllAtlas").show();
					$("#filePicker10").hide();
				}


			//弹窗公告
			}else if($("#ad_class").text() == 6){
				mue.ready(function() {
					mue.setContent(adbody[0]);
				})
				$("#notifyLink").val(adbody[1]);
			}
		}
	}

	//表单验证
	$("#editform").delegate("input,textarea", "focus", function(){
		var tip = $(this).siblings(".input-tips");
		if(tip.html() != undefined){
			tip.removeClass().addClass("input-tips input-focus").attr("style", "display:inline-block");
		}
	});

	$("#editform").delegate("input,textarea", "blur", function(){
		var obj = $(this), tip = obj.siblings(".input-tips");
		if(obj.attr("data-required") == "true"){
			if($(this).val() == ""){
				tip.removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				tip.removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}else{
			huoniao.regex(obj);
		}
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

	$(".color_pick").colorPicker({
		callback: function(color) {
			var color = color.length === 7 ? color : '';
			$("#color").val(color);
			$(this).find("em").css({"background": color});
		}
	});

	//删除文件
	$(".reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
		init.delFile(input.val(), false, function(){
			input.val("");
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t    = $(this),
			id     = $("#id").val(),
			dopost = $("#dopost").val(),
			cityid = $("#cityid").val(),
			tj     = true;

		//城市ID
		if(cityid == "" || cityid == 0){
			$.dialog.alert('请选择城市');
			return false;
		}

		var content = "";

		//普通广告
		if($('#ad_class').text() == '1'){
			var style = $("input[name=style]:checked").val();

			//代码
			if(style == "code"){
				var codehtml = $("#codehtml").val();
				if(codehtml == ""){
					$.dialog.alert("请输入HTML代码！");
					return false;
				}
				content = 'code$$'+codehtml;

			//文字
			}else if(style == "text"){
				var texttitle = encodeURIComponent($("#texttitle").val()),
					color     = $("#color").val(),
					textlink  = encodeURIComponent($("#textlink").val()),
					textsize  = Number($("#textsize").val());
				if(texttitle == ""){
					$.dialog.alert("请输入文字内容！");
					return false;
				}
				content = 'text$$'+texttitle+'$$'+color+'$$'+textlink+'$$'+textsize;

			//图片
			}else if(style == "pic"){
				var class1pic = $("#class1pic").val(),
					piclink   = encodeURIComponent($("#piclink").val()),
					picalt    = encodeURIComponent($("#picalt").val()),
					class1picwidth  = Number($("#class1picwidth").val()),
					class1picheight = Number($("#class1picheight").val());
				if(class1pic == ""){
					$.dialog.alert("请先上传图片！");
					return false;
				}
				content = 'pic$$'+class1pic+'$$'+piclink+'$$'+picalt+'$$'+class1picwidth+'$$'+class1picheight;

			//Flash
			}if(style == "flash"){
				var class1flash = $("#class1flash").val(),
					flashwidth  = Number($("#flashwidth").val()),
					flashheight = Number($("#flashheight").val());
				if(class1flash == ""){
					$.dialog.alert("请先上传Flash！");
					return false;
				}
				content = 'flash$$'+class1flash+'$$'+flashwidth+'$$'+flashheight;

			}

			var mark = $('#class1 input[name="mark1"]:checked').val();
			content += '$$' + mark;

		//多图广告
		}else if($('#ad_class').text() == '2'){
			var class2picwidth = Number($("#class2picwidth").val()),
				class2picheight = Number($("#class2picheight").val());

			var imgli = $("#listSection2 li"), imglist1 = $('#imglist1').val();
			if(imgli.length <= 0){
				$.dialog.alert("请先上传图片！");
				return false;
			}
			$('#imglist1').val(imglist1.replace(/,/g, "||").replace(/resize\|\|/g, "resize,").replace(/m_fill\|\|/g, "m_fill,").replace(/w_4096\|\|/g, "w_4096,"));
			content = class2picwidth+'$$'+class2picheight+'$$'+encodeURIComponent($('#imglist1').val());

		//拉伸广告
		}else if($('#ad_class').text() == '3'){
			var showtime  = Number($("#showtime").val()),
				adwidth = Number($("#adwidth").val()),
				extrulink = encodeURIComponent($("#extrulink").val()),
				class3bigpic = $("#class3bigpic").val(),
				bigheight = Number($("#bigheight").val()),
				class3smallpic = $("#class3smallpic").val(),
				smallheight = Number($("#smallheight").val());
				console.log(class3smallpic)
			if(isNaN(showtime)){
				$.dialog.alert("请输入广告显示时间！");
				return false;
			}
			if(isNaN(adwidth)){
				$.dialog.alert("请输入广告宽度！");
				return false;
			}
			if(class3bigpic == ""){
				$.dialog.alert("请上传广告大图！");
				return false;
			}
			if(isNaN(bigheight)){
				$.dialog.alert("请输入大图高度！");
				return false;
			}
			if(class3smallpic == ""){
				$.dialog.alert("请上传广告小图！");
				return false;
			}
			if(isNaN(smallheight)){
				$.dialog.alert("请输入小图高度！");
				return false;
			}
			content = showtime+'$$'+adwidth+'$$'+extrulink+'$$'+class3bigpic+'$$'+bigheight+'$$'+class3smallpic+'$$'+smallheight;

			var mark = $('#class3 input[name="mark3"]:checked').val();
			content += '$$' + mark;

		//对联广告
		}else if($('#ad_class').text() == '4'){
			var bodywidth = Number($("#bodywidth").val()),
				adwidth = Number($("#adwidth_").val()),
				adheight = Number($("#adheight_").val()),
				topheight = Number($("#topheight").val()),
				class4leftpic = $("#class4leftpic").val(),
				leftpiclink = encodeURIComponent($("#leftpiclink").val()),
				leftpicalt = encodeURIComponent($("#leftpicalt").val()),
				class4rightpic = $("#class4rightpic").val(),
				rightpiclink = encodeURIComponent($("#rightpiclink").val()),
				rightpicalt = encodeURIComponent($("#rightpicalt").val());

			if(isNaN(bodywidth)){
				$.dialog.alert("请输入页面宽度！");
				return false;
			}
			if(isNaN(adwidth)){
				$.dialog.alert("请输入广告宽度！");
				return false;
			}
			if(isNaN(adheight)){
				$.dialog.alert("请输入广告高度！");
				return false;
			}
			if(isNaN(topheight)){
				$.dialog.alert("请输入距离顶部高度！");
				return false;
			}
			if(class4leftpic == "" && class4rightpic == ""){
				$.dialog.alert("请上传广告图片！");
				return false;
			}

			var markLeft = $('#class4 input[name="markLeft"]:checked').val();
			var markRight = $('#class4 input[name="markRight"]:checked').val();

			content = bodywidth+'$$'+adwidth+'$$'+adheight+'$$'+topheight+'$$'+class4leftpic+'##'+leftpiclink+'##'+leftpicalt+'##'+markLeft+'$$'+class4rightpic+'##'+rightpiclink+'##'+rightpicalt+'##'+markRight;

		//节日广告
		}else if($('#ad_class').text() == '5'){
			var headHeight = Number($("#class5headHeight").val()),
				picUrl = $("#class5picurl").val(),
				pic = $("#litpic").val();

			if(pic == ""){
				$.dialog.alert("请上传图片！");
				return false;
			}
			headHeight = isNaN(headHeight) ? 0 : headHeight;
			content = headHeight+'$$'+pic+'$$'+picUrl;

		//弹窗公告
		}else if($('#ad_class').text() == '6'){
			mue.sync();
			content = mue.getContent() + '$$' + $("#notifyLink").val();
		}

		t.attr("disabled", true);

		var data = [];
			data.push('id='+id);
			data.push('dopost='+dopost);
			data.push('cityid='+cityid);
			data.push('body='+content);
			data.push('token='+$("#token").val());

		if(tj){
			$.ajax({
				type: "POST",
				url: "advCityAdd.php?action="+action+"&aid="+aid,
				data: data.join("&") + "&submit=" + encodeURI("提交"),
				dataType: "json",
				success: function(data){
					if(data.state == 100){
						if($("#dopost").val() == "save"){

							$.dialog({
								fixed: true,
								title: "添加成功",
								icon: 'success.png',
								content: '添加成功！',
								ok: function(){
									huoniao.goTop();
									window.location.reload();
								},
								cancel: false
							});

						}else{
							$.dialog({
								fixed: true,
								title: "修改成功",
								icon: 'success.png',
								content: '修改成功！',
								ok: function(){
									huoniao.goTop();
									window.location.reload();
								},
								cancel: false
							});
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

//上传成功接收
function uploadSuccess(obj, file, filetype, fileurl){
	$("#"+obj).val(file);
	var media = "";
	if(filetype == "swf" || file.split(".")[1] == "swf"){
		media = '<embed src="'+fileurl+'" type="application/x-shockwave-flash" quality="high" wmode="transparent">';
	}else{
		media = '<img src="'+cfg_attachment+file+'" />';
	}
	$("#"+obj).siblings(".spic").find(".sholder").html(media);
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}

//多图列表
function fileQueuedList_(file) {
    var listSection = $("#listSection"), t = this;

	var pli = $('<li class="clearfix" id="'+file.id+'"></li>'),
	    lim = $('<a class="li-move" href="javascript:;" title="拖动调整图片顺序">移动</a>'),
	    lir = $('<a class="li-rm" href="javascript:;">&times;</a>'),
		lin = $('<span class="li-name">'+file.name+'</span>'),
		lip = $('<span class="li-progress"><s></s></span>'),
		lit = $('<div class="li-thumb"><div class="r-progress"><s></s></div><img></div>'),
		lid = $('<div class="li-input"><input style="margin:0 10px 10px 0; width:47%; float:left;" class="i-name" placeholder="请输入图片名称" value="" /><input style="margin:0 0 10px 0; width:46%; float:left;" class="i-link" placeholder="请输入图片链接" value="" /><input class="i-desc" placeholder="请输入图片介绍" value="" /></div>');

	//关闭
	lir.bind("click", function(){
		t.cancelUpload(file.id, false);

		$("#"+file.id).remove();
		var stats = t.getStats();
		stats.successful_uploads--;
		t.setStats(stats);
	});

	pli.append(lim);
	pli.append(lir);
	pli.append(lin);
	pli.append(lip);
	pli.append(lit);
	pli.append(lid);

	listSection.append(pli);
}

//多图上传成功
function uploadSuccessList_(file, serverData) {
	var b = eval('('+serverData+')');
	var pro = file.id;
	$("#"+pro).find(".li-name").hide();
	$("#"+pro).find(".li-progress").hide();
	$("#"+pro).find(".li-move").show();
	$("#"+pro).find(".li-thumb").show();
	$("#"+pro).find(".li-thumb img").attr("data-val", b.url);
	$("#"+pro).find(".li-thumb img").attr("src", cfg_attachment+b.url);
	$("#"+pro).find(".li-input").show();

	$("#deleteAllAtlas").show();

	$("#"+pro).find(".li-rm").bind("click", function(){
		var t = $(this), img = t.siblings(".li-thumb").find("img").attr("data-val");
		delAtlasImg_(pro, img);
	});
}
