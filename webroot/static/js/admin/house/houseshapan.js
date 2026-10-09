$(function () {

	var num = 1, item = [], html = [], dzshapan = "#dzshapan", dzObj = $(dzshapan);

    $(".chosen-select").chosen();


	//沙盘图拖动
	var shapanImg = $("#shapan-box");
	shapanImg.jqDrag({
		dragParent: dzshapan,
		dragHandle: "#shapan-obj"
	})


	$('.drag').drag("start",function(ev, dd){
		dd.limit = $("#shapan-box").position();
		dd.limit.bottom = dd.limit.top + $("#shapan-box").outerHeight() - $(this).outerHeight();
		dd.limit.right = dd.limit.left + $("#shapan-box").outerWidth() - $(this).outerWidth();
	}).drag(function(ev, dd){
		pos = $("#shapan-box").position();
			var top = parseInt(Math.min(dd.limit.bottom, Math.max(dd.limit.top, dd.offsetY)) - pos.top),
					left = parseInt(Math.min(dd.limit.right, Math.max(dd.limit.left, dd.offsetX)) - pos.left);
		$(this).css({
			top: top,
			left: left
		});

		var t = $(this), idStr = t.attr('id'), id = idStr.substr(4);
		$('#sandtxt' + id).find('.topVal').val(top);
		$('#sandtxt' + id).find('.leftVal').val(left);
	});


    //新增楼栋
	$('#add').click(function(){
		var startTop = parseInt($('#shapan-box').css("top"));
		var startLeft = parseInt($('#shapan-box').css("left"));
		startTop = startTop > 0 ? 0 : startTop;
		startLeft = startLeft > 0 ? 0 : startLeft;
		$('<div class="drag on" id="drag'+ num +'"><em>#</em><i></i></div>')
			.appendTo("#shapan-box")
        .drag("start",function(ev, dd){
  			dd.limit = $("#shapan-box").position();
  			dd.limit.bottom = dd.limit.top + $("#shapan-box").outerHeight() - $(this).outerHeight();
  			dd.limit.right = dd.limit.left + $("#shapan-box").outerWidth() - $(this).outerWidth();
  		})
  		.drag(function(ev, dd){
        pos = $("#shapan-box").position();
				var top = parseInt(Math.min(dd.limit.bottom, Math.max(dd.limit.top, dd.offsetY)) - pos.top),
						left = parseInt(Math.min(dd.limit.right, Math.max(dd.limit.left, dd.offsetX)) - pos.left);
  			$(this).css({
  				top: top,
  				left: left
  			});

				var t = $(this), idStr = t.attr('id'), id = idStr.substr(4);
				$('#sandtxt' + id).find('.topVal').val(top);
				$('#sandtxt' + id).find('.leftVal').val(left);
  		})
		.css({
			top: 80 - startTop,
			left: 40 - startLeft,
		});


	    $('#add').before('<span class="info-btn on" id="info-btn'+ num +'"><em>#</em><i class="del">&times;</i></span>');

        var apartmentHtml = [];
        if(apartmentList){
            for(var i = 0; i < apartmentList.length; i++){
                apartmentHtml.push('<option value="'+ apartmentList[i].id +'">'+ apartmentList[i].title +'</option>');
            }
        }
        
	    $('.sandbox').append('<div class="sandtxt" id="sandtxt'+ num +'"><dl class="clearfix"> <dt><label>楼栋：</label></dt> <dd><input type="text" class="data1 input-medium Bnumber" placeholder="楼栋号"></dd> </dl> <dl class="clearfix"> <dt><label>状态：</label></dt> <dd class="radio"> <label><input type="radio" class="data2" name="salestate'+ num +'" value="0">待售</label> <label><input type="radio" class="data2" name="salestate'+ num +'" value="1" checked="checked">在售</label> <label><input type="radio" class="data2" name="salestate'+ num +'" value="2">售完</label> </dd> </dl> <dl class="clearfix"> <dt><label>户型：</label></dt> <dd style="overflow: visible;padding-left: 60px;"> <select class="col-sm-2 chosen-select data9" data-placeholder="请选择该楼栋的户型，支持多选。" multiple="multiple" style="width:300px;"> '+apartmentHtml.join('')+' </select> </dd> </dl><dl class="clearfix"> <dt><label>层数：</label></dt> <dd><input type="text" class="data3 input-medium" placeholder="总层数"></dd> </dl> <dl class="clearfix"> <dt><label>户数：</label></dt> <dd><input type="text" class="data4 input-medium" placeholder="总户数"></dd> </dl> <dl class="clearfix"> <dt><label>梯户：</label></dt> <dd><input type="text" class="data5 input-medium" placeholder="几梯"></dd> </dl><dl class="clearfix"> <dt><label>梯户：</label></dt> <dd><input type="text" class="data5_1 input-medium" placeholder="几户"></dd> </dl> <dl class="clearfix"> <dt><label>均价：</label></dt> <dd><input type="text" class="data6 input-medium" placeholder="均价"></dd> </dl><dl class="clearfix"><dt><label>开盘：</label></dt><dd><input type="text" class="data7 input-medium" placeholder="开盘时间"></dd></dl><dl class="clearfix"><dt><label>交房：</label></dt><dd><input type="text" class="data8 input-medium" placeholder="交房时间"></dd></dl><dl><input type="hidden" class="topVal" value=""></dl><dl><input type="hidden" class="leftVal" value=""></dl></div>');

		$('#drag'+num).siblings().removeClass('on');
		$('#info-btn'+num).css({"background": "#2672ec", "color": "#fff"}).siblings().removeClass('on');
	    $('#sandtxt'+num).siblings().hide();
	    num++;

		$(".data7, .data8").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});
        $(".chosen-select").chosen();

	});


  //删除楼栋
  $('.sanditem').delegate('.del', 'click', function(){
    var t = $(this), parent = t.parent('.info-btn'), idStr = parent.attr('id'), id = idStr.substr(8), index = parent.index();

		if (parent.hasClass('on')) {
			if (index == '0') {
				$('#info-btn'+ id).next().addClass('on');parent.remove();
				$('#drag'+ id).next().addClass('on');$('#drag'+ id).remove();
				$('#sandtxt'+ id).next().show();$('#sandtxt'+ id).remove();
			}else {
				$('#info-btn'+ id).prev().addClass('on');parent.remove();
				$('#drag'+ id).prev().addClass('on');$('#drag'+ id).remove();
				$('#sandtxt'+ id).prev().show();$('#sandtxt'+ id).remove();
			}
		}
		else {
			parent.remove();$('#drag'+ id).remove();$('#sandtxt'+ id).remove();
		}
  })

	// 写入楼栋号
	$('.sandbox').delegate('.sandtxt .Bnumber', 'keyup', function(){
		var t = $(this), val = t.val(), parent = t.closest('.sandtxt'), idStr = parent.attr('id'), id = idStr.substr(7);
		$('#info-btn'+id).find('em').text(val);
		$('#drag'+id).find('em').text(val);
	})

	// 点击切换楼栋信息
	$('.sanditem').delegate('.info-btn:not(:last)', 'click', function(){
		var t = $(this), idStr = t.attr('id'), id = idStr.substr(8);
		t.addClass('on').siblings('.info-btn').removeClass('on');
		$('#drag'+id).addClass('on').siblings('.drag').removeClass('on');
		$('#sandtxt'+id).show().siblings().hide();
	})

	// 切换状态
	$('.sandbox').delegate('label', 'click', function(){
		var t = $(this), val = t.find('input').val(), parent = t.closest('.sandtxt'), idStr = parent.attr('id'), id = idStr.substr(7), drag = $('#drag'+ id), btn = $('#info-btn'+id);
		if (val == 0) {
			drag.css({"background":"#ff9a1f", });btn.css({"background":"#ff9a1f", "color":"#fff"});
			drag.find('i').css({"border-top-color":"#ff9a1f"})
		}
		if (val == 1) {
			drag.css({"background":"#2672ec", });btn.css({"background":"#2672ec", "color":"#fff"});
			drag.find('i').css({"border-top-color":"#2672ec"})
		}
		if (val == 2) {
			drag.css({"background":"#a8a8a8", });btn.css({"background":"#a8a8a8", "color":"#fff"});
			drag.find('i').css({"border-top-color":"#a8a8a8"})
		}
	})

	// 点击图片标签
	$('#shapan-box').delegate('.drag', 'click', function(){
		var t = $(this), idStr = t.attr('id'), id = idStr.substr(4);
		t.addClass('on').siblings('.drag').removeClass('on');
		$('#info-btn'+id).addClass('on').siblings('.info-btn').removeClass('on');
		$('#sandtxt'+id).show().siblings().hide();
	})


	//日期选择
	$(".data7, .data8").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});


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
		var t      = $(this),
			loupan = $("#loupan").val(),
			litpic = $("#litpic").val(),
			token  = $("#token").val();

		var data = [];

		$(".sandbox .sandtxt").each(function(){
			var t = $(this),
				name  = t.find(".data1").val(),
				state = t.find("input[type=radio]:checked").val(),
				floor = t.find(".data3").val(),
				hushu = t.find(".data4").val(),
				ti= t.find(".data5").val(),
				hu = t.find(".data5_1").val(),
				price = t.find(".data6").val(),
				began = t.find(".data7").val(),
				end   = t.find(".data8").val(),
				apartment   = t.find(".data9").val(),
				coorx = t.find(".leftVal").val(),
				coory = t.find(".topVal").val();

			data.push('{"name": "'+name+'", "state": "'+state+'", "apartment": "'+apartment+'", "floor": "'+floor+'", "hushu": "'+hushu+'", "price": "'+price+'","ti": "'+ti+'","hu": "'+hu+'", "began": "'+began+'", "end": "'+end+'", "coorx": "'+coorx+'", "coory": "'+coory+'"}');
		});

		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "houseshapan.php",
			data: "loupan="+loupan+"&litpic="+litpic+"&token="+token+"&data="+'['+data.join(",")+']',
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					$.dialog({
						fixed: true,
						title: "操作成功",
						icon: 'success.png',
						content: "操作成功！",
						ok: true,
						cancel: false
					});

				}else{
					$.dialog.alert(data.info);
					t.attr("disabled", false);
				};
				t.attr("disabled", false);
			},
			error: function(msg){
				$.dialog.alert("网络错误，请刷新页面重试！");
				t.attr("disabled", false);
			}
		});
	});

});


//上传成功接收
function uploadSuccess(obj, file, filetype){
	var input = $("#litpic"), iframe = $(".submit iframe"), src = iframe.attr("src");
	delFile(input.val(), false, function(){
		iframe.attr("src", src).show();
	});

	$("#"+obj).val(file);
	$("#shapan-obj").html('<img src="'+cfg_attachment+file+'" />');
	$(".add-btn, .submit input").show();
	iframe.addClass("h");
}

//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "house",
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
