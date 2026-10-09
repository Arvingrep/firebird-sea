var jcrop, jcrop_api,crop;
$(function(){
	var x = parseInt($("#xAxis").val()),
	y = parseInt($("#yAxis").val()),
	codewidth = parseInt($("#codewidth").val()),//二维码宽度
	codeheight = parseInt($("#codeheight").val()),//二维码高度
	cropwidth = parseInt($("#cropwidth").val()),//图片裁剪后宽度
	cropheight = parseInt($("#cropheight").val()),//图片裁剪后高度
	imgwidth = parseInt($("#imgwidth").val()),//原图宽度
	imgheight = parseInt($("#imgheight").val());//原图高度
	var ssratio = imgwidth/cropwidth;
	var swidth = Math.round((codewidth/imgwidth)*cropwidth);
	var sheight = Math.round((codeheight/imgheight)*cropheight);
	var sxAxis = Math.round((x/imgwidth)*cropwidth);
	var syAxis = Math.round((y/imgheight)*cropheight);

	if(imgwidth > 0 && imgheight > 0){

		var img = new Image();
		img.src = $('#crop').attr('src');
		img.onload = function() {
			var api = $.Jcrop("#crop",{
				setSelect: [sxAxis,syAxis,swidth+sxAxis,sheight+syAxis], //setSelect是Jcrop插件内部已定义的运动方法
				aspectRatio: 1,
				onChange:showCoords,
				onSelect:showCoords
			});
		}

	}

	//重新上传
	$(".spic .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
		delFile(input.val(), false, function(){
			input.val("");
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
			litpic       = $("#litpic_").val(),
			tj           = true;



		//背景图
		if(litpic == ""){
			$.dialog.alert('请上传海报背景图');
			return false;
		}

		t.attr("disabled", true);

		if(tj){
			$.ajax({
				type: "POST",
				url: "fenxiaoPoster.php",
				data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
				dataType: "json",
				success: function(data){
					if(data.state == 100){
						if($("#dopost").val() == "Add"){

							$.dialog({
								fixed: true,
								title: "添加成功",
								icon: 'success.png',
								content: "添加成功！",
								ok: function(){
									try{
										$("body",parent.document).find("#nav-fenxiaoPosterphp").click();
										parent.reloadPage($("body",parent.document).find("#body-fenxiaoPosterphp"));
										$("body",parent.document).find("#nav-fenxiaoPosterAdd s").click();
									}catch(e){
										location.href = thisPath + "fenxiaoPoster.php";
									}
								},
								cancel: false
							});

						}else{

							$.dialog({
								fixed: true,
								title: "修改成功",
								icon: 'success.png',
								content: "修改成功！",
								ok: function(){
									try{
										$("body",parent.document).find("#nav-fenxiaoPosterphp").click();
										parent.reloadPage($("body",parent.document).find("#body-fenxiaoPosterphp"));
										$("body",parent.document).find("#nav-fenxiaoPosterEdit"+id+" s").click();
									}catch(e){
										location.href = thisPath + "fenxiaoPoster.php";
									}
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


//简单的事件处理程序，响应自onChange,onSelect事件，按照上面的Jcrop调用
function showCoords(obj){
	crop = $("#crop");
	var	xbig = crop.width(),//图片裁剪之后宽度
		ybig = crop.height(),//图片裁剪之后高度
		boundx = (crop.attr('data-width'))*1, //图片原始宽度
		boundy = (crop.attr('data-height'))*1;//图片原始高度
	var nowratio,nowX,nowY,nowW,nowH;
	nowratio = boundx/xbig;
	nowW = Math.round(obj.w*nowratio);
	nowH = Math.round(obj.h*nowratio);
	nowX = Math.round(obj.x*nowratio);
  	nowY = Math.round(obj.y*nowratio);

	$("#xAxis").val(nowX);
	$("#yAxis").val(nowY);
	$("#codewidth").val(nowW);
	$("#codeheight").val(nowH);
	$("#cropwidth").val(xbig);
	$("#cropheight").val(ybig);
}
//上传成功接收
function uploadSuccess(obj, file, filetype, fileurl,filedata){
	$("#"+obj).val(file);
	$("#"+obj).siblings(".spic").find(".sholder").html('<img src="'+fileurl+'" data-val="'+file+'" class="crop" id="crop" data-width="'+filedata.width+'"  data-height="'+filedata.height+'"/>');
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
	$("#imgwidth").val(filedata.width);
	$("#imgheight").val(filedata.height);

	var sildX = 120;
	var sildY = 120;
	var sildLength = 120;
	$("#crop").Jcrop({
		setSelect: [sildX, sildY, sildLength+sildX, sildLength+sildY],
		aspectRatio:1,
		keySupport: false,
		onChange:showCoords,
		onSelect:showCoords
	}, function() {
	  	jcrop_api = this;
	});

}


//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "member",
		type: "delImage",
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
