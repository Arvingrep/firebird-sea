$(function(){
	// 顶部二维码
	$('.topbarlink li').hover(function(){
		var s = $(this);
		s.find('.pop').show();
	}, function(){
		$(this).find('.pop').hide();
	})

	//上传海报
	function mysub(){
		$("#hbImg").attr('src', templatePath+'images/placeholder_img.png');
		$("#delHb").hide();
		$("#Filedata").prev("span").html("重新选择");

		var data = [];
		data['mod'] = "huodong";
		data['type'] = "thumb";
		data['filetype'] = "image";

		$.ajaxFileUpload({
			url: "/include/upload.inc.php",
			fileElementId: "Filedata",
			dataType: "json",
			data: data,
			success: function(m, l) {
				if (m.state == "SUCCESS") {
					$("#hbImg").attr('src', m.turl);
					$("#litpic").val(m.url);
					$("#delHb").show();
				} else {
					alert(m.state);
					uploadError();
				}
			},
			error: function() {
				uploadError();
			}
		});

	}

	//上传失败、重新上传
	function uploadError(){
		$("#hbImg").attr('src', templatePath+'images/placeholder_img.png');
		$("#Filedata").prev("span").html("添加海报");
		$("#delHb").hide();
		$("#litpic").val("");
	}
	$("#Filedata").bind("change", function(){
		if ($(this).val() == '') return;
		mysub();
	});
	$("#delHb").bind("click", function(){
		uploadError();
	});

	//标注地图
		$("#mark").bind("click", function(){
			$.dialog({
				id: "markDitu",
				title: "标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）</small>",
				content: 'url:/api/map/mark.php?mod=business&lnglat='+$("#lnglat").val()+"&city="+mapCity+"&address="+$("#address").val(),
				width: 800,
				height: 500,
				max: true,
				ok: function(){
					var doc = $(window.parent.frames["markDitu"].document),
						lng = doc.find("#lng").val(),
						lat = doc.find("#lat").val(),
						address = doc.find("#addr").val();
					$("#lnglat").val(lng+","+lat);
					if($("#address").val() == ""){
						$("#address").val(address);
					}
					regex($("#address"));
				},
				cancel: true
			});
		});

	function regex(obj){
		var regex = obj.attr("data-regex"), tip = obj.siblings(".input-tips");
		if (regex != undefined && tip.html() != undefined) {
			var exp = new RegExp("^" + regex + "$", "img");
			if (!exp.test($.trim(obj.val()))) {
				tip.removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
				return false;
			} else {
				tip.removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
				return true;
			}
		}

	}

	//时间
	var showDate = function(obj){
		WdatePicker({
			el: obj,
			dateFmt: 'yyyy-MM-dd HH:mm',
			doubleCalendar: true,
			isShowClear: false,
			isShowToday: false,
			position: {left: -41}
		});
	};
	$(".f-date").click(function(){
		showDate($(this).find("input").attr("id"));
	});


	//截止时间
	$("#baomingLabel").bind("click", function(){
		if($("#baoming").is(":checked")){
			$("#baomingendObj").stop().slideUp(200);
		}else{
			$("#baomingendObj").stop().slideDown(200);
		}
	});


	//编辑器
	var ue;
	function getEditor(id){
		ue = UE.getEditor(id, {toolbars: [['fullscreen', 'undo', 'redo', '|', 'fontfamily', 'fontsize', '|', 'forecolor', 'bold', 'italic', 'underline', '|', 'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'insertorderedlist', 'insertunorderedlist', '|', 'simpleupload', 'insertimage', '|', 'link', 'unlink']], initialStyle:'p{line-height:1.5em; font-size:13px; font-family:microsoft yahei;}'});
		ue.on("focus", function() {ue.container.style.borderColor = "#999"});
		ue.on("blur", function() {ue.container.style.borderColor = ""})
	}
	getEditor("body");

	//选择菜单
	$(".f-sel").delegate("a", "click", function(){
		var t = $(this),
			id = t.attr("data-id"),
			text = t.text(),
			sel = t.closest(".f-sel"),
			opt = t.closest(".f-opt"),
			inp = sel.find("input"),
			idobj = t.closest(".f-right").find("input[type=hidden]");
		inp.val(text);
		idobj.val(id);
		opt.hide();

		return false;
	});

	$(".f-sel").bind("click", function(){
		var t = $(this), input = t.find("input"), opt = t.find(".f-opt");
		opt.show();
		return false;
	});

	//点击空白区域隐藏选择菜单
	$("body").bind("click", function(){
		$(".f-sel .f-opt, .sel-addr").hide();
	});


	//费用类型
	$(".fee_type a").bind("click", function(){
		var t = $(this), val = t.data("val");
		if(!t.hasClass("curr")){
			t.addClass("curr").siblings("a").removeClass("curr");
			$("#fee").val(val);

			if(val == 1){
				$(".fee_max").stop().slideUp(200);
				$(".fee_body").stop().slideDown(200);
			}else{
				$(".fee_max").stop().slideDown(200);
				$(".fee_body").stop().slideUp(200);
			}
		}
	});

	//费用类型
	$(".sign_type a").bind("click", function(){
		var t = $(this), val = t.data("val");
		if(!t.hasClass("curr")){
			t.addClass("curr").siblings("a").removeClass("curr");
			$("#sign").val(val);
		}
	});

	//增加电子票
	var feeTemp = '<div class="fee_item"><span class="t1"><input type="text" name="fee_title[]" placeholder="费用名称"></span><span class="t2"><input type="text" name="fee_price[]" placeholder="金额，免费请填0"></span><span class="t3"><input type="text" onkeyup="value=value.replace(/[^\\d.]/g, \'\')" name="fee_max[]" placeholder="人数，不填则无限制"></span><span class="t4"><a href="javascript:;"></a></span></div>';
	$("#feeAdd").bind("click", function(){
		$(this).before(feeTemp);
		$(".fee_con .t4 a").show();
	});

	//删除电子票
	$(".fee_con").delegate(".t4 a", "click", function(){
		if($(".fee_con .fee_item").length > 1){
			$(this).closest(".fee_item").remove();

			if($(".fee_con .fee_item").length == 1){
				$(".fee_con .t4 a").hide();
			}
		}
	});



	//添加自定义报名信息
	$('.post_main_r_hidden').bind('click', function(){
		$(this).stop().slideUp();
		$('#join_PropertyOrder').stop().slideDown();
	});
	$('.joinxx_px_item_hiddenBtn a').bind('click', function(){
		$('.post_main_r_hidden').stop().slideDown();
		$('#join_PropertyOrder').stop().slideUp();
	});

	//选中
	$('#join_PropertyOrder').delegate('.joinxx_px_item strong a', 'click', function(){
		$(this).parent().toggleClass('thisover');
	});

	//删除自定义项
	$('#join_PropertyOrder').delegate('.del', 'click', function(){
		$(this).closest('.joinxx_px_item').remove();
	});

	//删除选项
	$('#join_PropertyOrder').delegate('.zu a', 'click', function(){
		var p = $(this).parent().parent(), c = p.find('.zu').length;
		//如果选项大于2个
		if(c > 2){
			p.find('.zu a').show();
			$(this).closest('.zu').remove();
		}
		if(c <= 3){
			p.find('.zu a').hide();
		}
	});

	//新增
	$('#join_PropertyOrder').delegate('.add', 'click', function(){
		$(this).prev().append('<div class="zu"><input type="text" class="xuan" placeholder="输入选项"><a href="javascript:;" title="删除"></a></div>');
		$(this).prev().find('a').show();
	});

	$("#join_ol").dragsort({ dragSelector: "li", placeHolderTemplate: '<li class="holder"></li>'});


	//添加自定义字段方法
	var addCustomInput = function(type, placeholder, title, val){
		var html = '';
		//单行、多行
		if(type == 'text' || type == 'text_long'){

			html = '<li class="joinxx_px_item" data-value="'+title+'" data-type="'+type+'"><strong><a href="javascript:;" title="是否必填"></a><i>必填</i></strong><div class="c"><input type="text" value="'+title+'" placeholder="输入'+(type == 'text' ? '单' : '多')+'行文本问题" class="text" /></div><a class="del" href="javascript:;" title="删除"></a></li>';

		//单选、多选
		}else if(type == 'single_vote' || type == 'multi_vote'){

			html = '<li class="joinxx_px_item" data-value="'+title+'" data-type="'+type+'">';
			html += '<strong><a href="javascript:;" title="是否必填"></a><i>必填</i></strong>';
			html += '<div class="c">';
			html += '<input type="text" value="'+title+'" placeholder="输入'+(type == 'single_vote' ? '单' : '多')+'选标题" class="text" />';
			html += '<div class="'+(type == 'single_vote' ? 'singlelist' : 'multilist')+'">';
			if(val && val.length > 1){
				for (var i = 0; i < val.length; i++) {
					html += '<div class="zu"><input type="text" class="xuan" placeholder="输入选项" value="'+val[i]+'"><a href="javascript:;"'+(val.length <= 2 ? 'style="display: none;"' : '')+' title="删除"></a></div>';
				}
			}else{
				html += '<div class="zu"><input type="text" class="xuan" placeholder="输入选项"><a href="javascript:;"style="display: none;" title="删除"></a></div>';
				html += '<div class="zu"><input type="text" class="xuan" placeholder="输入选项"><a href="javascript:;"style="display: none;" title="删除"></a></div>';
			}
			html += '</div>';
			html += '<a class="add" href="javascript:;" title="增加"></a>';
			html += '</div>';
			html += '<a class="del" href="javascript:;" title="删除"></a>';
			html += '</li>';
		}

		$("#join_ol").append(html);
	}

	//添加自定义字段
	$('.join_property_btn a').bind('click', function(){
		var t = $(this), type = '', placeholder = '', title = '', val = [];

		//常用信息
		if(t.hasClass('single')){
			if(t.hasClass('company') || t.hasClass('office') || t.hasClass('business') || t.hasClass('age') || t.hasClass('mail')){
				type = 'text';
				title = t.text();
				placeholder = '输入单行文本问题';
			}

			//性别
			if(t.hasClass('gender')){
				type = 'single_vote';
				title = t.text();
				placeholder = '输入单选标题';
				val = ['男', '女'];
			}

		//自定义项
		}else if(t.hasClass('double')){
			if(t.hasClass('singletext')){
				type = 'text';
				placeholder = '输入单行文本问题';
			}
			if(t.hasClass('multitext')){
				type = 'text_long';
				placeholder = '输入多行文本问题';
			}
			if(t.hasClass('singletopic')){
				type = 'single_vote';
				placeholder = '输入单选标题';
			}
			if(t.hasClass('multiplechoice')){
				type = 'multi_vote';
				placeholder = '输入多选标题';
			}
		}
		addCustomInput(type, placeholder, title, val);
	});


	//数量错误提示
	var errmsgtime;
	function errmsg(div, str){
		$('#errmsg').remove();
		clearTimeout(errmsgtime);
		var top = div.offset().top - 33;
		var left = div.offset().left;

		$('html, body').animate({scrollTop:top}, 300);

		var msgbox = '<div id="errmsg" style="position:absolute;top:' + top + 'px;left:' + left + 'px;height:30px;padding:0 10px;line-height:30px;text-align:center;color:#ff0;font-size:14px;display:none;z-index:99999;background:#f00;">' + str + '</div>';
		$('body').append(msgbox);
		$('#errmsg').fadeIn(300);
		errmsgtime = setTimeout(function(){
			$('#errmsg').fadeOut(300, function(){
				$('#errmsg').remove();
			});
		},3000);
	};

	//发布
	$("#fabuForm").submit(function(event){
		event.preventDefault();

		var action = $(this).attr("action"), tj = $("#tj");

		var typename = $("#typename");
		if(typename.val() == ""){
			errmsg(typename, "请选择活动类型！");
			return false;
		}

		var typename1 = $("#typename1");
		if(typename1.val() == ""){
			errmsg(typename1, "请选择具体分类！");
			return false;
		}

		var typeid = $("#typeid");
		if(typeid.val() == "" || typeid.val() == 0){
			errmsg(typename1, "请选择具体分类！");
			return false;
		}

		var title = $("#title");
		if(title.val() == ""){
			errmsg(title, "请输入活动主题！");
			return false;
		}

		var litpic = $("#litpic");
		if(litpic.val() == ""){
			errmsg($(".add-hb"), "请添加海报！");
			return false;
		}

		var began = $("#began");
		if(began.val() == ""){
			errmsg(began.parent(), "请选择开始时间！");
			return false;
		}

		var end = $("#end");
		if(end.val() == ""){
			errmsg(end.parent(), "请选择结束时间！");
			return false;
		}

		var baomingend = $("#baomingend");
		if(baomingend.val() == "" && !$("#baoming").is(":checked")){
			errmsg(baomingend.parent(), "请选择报名截止时间！");
			return false;
		}

		$('#addrid').val($('.addrBtn').attr('data-id'));
    var addrids = $('.addrBtn').attr('data-ids').split(' ');
    $('#cityid').val(addrids[0]);

        var data = $("#fabuForm").serialize()

		var addrid = $("#addrid");
		if(addrid.val() == "" || addrid.val() == 0){
			errmsg($(".addrBtn"), "请选择活动区域！");
			return false;
		}

		var address = $("#address");
		if(address.val() == ""){
			errmsg(address, "请输入活动详细地址！");
			return false;
		}

		ue.sync();
		if(!ue.hasContents()){
			errmsg($(".f-body"), "请输入活动详情！");
			return false;
		}

		//费用验证
		if(id && reg == 0){
			var fee = $("#fee").val(), feeCount = 0;
			if(fee == 1){
				$(".fee_con .fee_item").each(function(){
					var th = $(this), tit = th.find(".t1 input").val(), price = parseFloat(th.find(".t2 input").val()), max = th.find(".t3 input").val();
					if(tit != "" && price != NaN){
						feeCount++
					}
				});
				if(feeCount == 0){
					errmsg($(".fee_body"), "请填写电子票内容！");
					return false;
				}
			}else{
				var max = $("#max");
				if(max.val() == "" || max.val() == 0){
					errmsg(max, "请输入人数上限！");
					return false;
				}
			}
		}


		//报名填写信息
		var property = [], tj_ = true;
		$('#join_ol').find('li').each(function(index){
			if(tj_){
				var t = $(this), type = t.attr('data-type'), required = t.find('strong').hasClass('thisover') ? 1 : 0, title = $.trim(t.find('.text').val());
				if(title == ''){
					tj_ = false;
					$('.post_main_r_hidden').hide();
					$('#join_PropertyOrder').show();
					errmsg(t.find('.text'), "请填写报名信息第"+(index+1)+"项！");
					return false;
				}
				var arr = [];
				if(type == 'multi_vote' || type == 'single_vote'){
					var zuList = t.find('.zu'), tj_1 = true;
					if(zuList.length > 0){
						zuList.each(function(i){
							if(tj_1){
								var xuan = $.trim($(this).find('.xuan').val());
								if(xuan == ''){
									tj_ = tj_1 = false;
									$('.post_main_r_hidden').hide();
									$('#join_PropertyOrder').show();
									errmsg($(this).find('.xuan'), "请输入选项"+(i+1)+"的内容！");
									return false;
								}
								arr.push('"'+xuan+'"');
							}
						});
					}else{
						tj_ = false;
						$('.post_main_r_hidden').hide();
						$('#join_PropertyOrder').show();
						errmsg(t.find('.text'), "请添加报名填写信息第"+(index+1)+"项的选项内容！");
						return false;
					}
				}

				property.push('{"type": "'+type+'", "required": "'+required+'", "title": "'+title+'", "val": ['+arr.join(',')+']}');
			}
		});

		data += "&property=["+property.join(",")+"]";
		if(!tj_) return false;

		var contact = $("#contact");
		if(contact.val() == ""){
			errmsg(contact, "请输入主办方联系方式！");
			return false;
		}


		tj.attr("disabled", true).val("提交中...");

		if(id != 0){
			data += "&id="+id;
		}

		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){

					if(id){
						location.href = detailUrl;
					}else{
						fabuPay.check(data, manageUrl, tj);
					}

				}else{
					alert(data.info);
					tj.removeAttr("disabled").val("重新提交");
				}
			},
			error: function(){
				alert(data.info);
				tj.removeAttr("disabled").val("重新提交");
			}
		});



	});


})
