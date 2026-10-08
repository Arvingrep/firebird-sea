$(function () {
	atlasMax = 1;
	//APP端取消下拉刷新
	toggleDragRefresh('off');

	var device = navigator.userAgent;
	if (device.indexOf('huoniao_iOS') > -1) {
		$('body').addClass('huoniao_iOS');
	}


	//错误提示
	var showErrTimer;
	function showErr(txt) {
		showErrTimer && clearTimeout(showErrTimer);
		$(".popErr").remove();
		$("body").append('<div class="popErr"><p>' + txt + '</p></div>');
		$(".popErr p").css({ "margin-left": -$(".popErr p").width() / 2, "left": "50%" });
		$(".popErr").css({ "visibility": "visible" });
		showErrTimer = setTimeout(function () {
			$(".popErr").fadeOut(300, function () {
				$(this).remove();
			});
		}, 1500);
	}


	var changeFileSize = function (url, to, from) {
		if (url == "" || url == undefined) return "";
		if (to == "") return url;
		var from = (from == "" || from == undefined) ? "large" : from;
		var newUrl = "";
		if (hideFileUrl == 1) {
			newUrl = url + "&type=" + to;
		} else {
			newUrl = url.replace(from, to);
		}

		return newUrl;
	}


	//下拉菜单
	$('.demo-test-select').scroller(
		$.extend({ preset: 'select' })
	);


	//年月日
	$('.demo-test-date').scroller(
		$.extend({ preset: 'datetime', dateFormat: 'yy-mm-dd' })
	);




	// 如果是修改，设置类别
	if (id && typeid) {
		var s = $('#typename'), type1 = s.val();
		// getType(s,type1,typeid);
		$('#citybtn').attr({ 'data-ids': type1 + ' ' + typeid, 'data-id': typeid })
	}

	// 个人列表
	$(".tab").click(function () {
		if ($(".lead .tab-list").css("display") == 'none') {
			$(".lead .tab-list").show();
		} else {
			$(".lead .tab-list").hide();
		}
	});

	// 选择分类
	$('label.type').delegate("select", "change", function () {
		var s = $(this), id = s.val();
		// getType(s,id);
	})







	//上传凭证
	var $list = $('#fileList'),
		uploadbtn = $('.uploadbtn'),
		ratio = window.devicePixelRatio || 1,
		thumbnailWidth = 100 * ratio,   // 缩略图大小
		thumbnailHeight = 100 * ratio,  // 缩略图大小
		uploader;

	fileCount = $list.find("li.item").length;

	// 初始化Web Uploader
	uploader = WebUploader.create({
		auto: true,
		swf: staticPath + 'js/webuploader/Uploader.swf',
		server: '/include/upload.inc.php?mod=' + modelType + '&type=thumb',
		// pick: '#filePicker',
		fileVal: 'Filedata',
		// multiple:false, 
		pick: {
			id: '#filePicker',
			multiple: false,
		},
		accept: {
			title: 'Images',
			extensions: 'jpg,jpeg,gif,png',
			mimeTypes: 'image/*'
		},
		compress: {
			width: 750,
			height: 750,
			// 图片质量，只有type为`image/jpeg`的时候才有效。
			quality: 90,
			// 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
			allowMagnify: false,
			// 是否允许裁剪。
			crop: false,
			// 是否保留头部meta信息。
			preserveHeaders: true,
			// 如果发现压缩后文件大小比原来还大，则使用原来图片
			// 此属性可能会影响图片自动纠正功能
			noCompressIfLarger: false,
			// 单位字节，如果图片大小小于此值，不会采用压缩。
			compressSize: 1024 * 200
		},
		fileNumLimit: 1,
		fileSingleSizeLimit: 10 * 1024 * 1024 * 1024   //10M
	});

	//删除已上传图片
	var delAtlasPic = function (b) {
		var g = {
			mod: modelType,
			type: "delAtlas",
			picpath: b,
			randoms: Math.random()
		};
		$.ajax({
			type: "POST",
			url: "/include/upload.inc.php",
			data: $.param(g)
		})
	};

	//更新上传状态
	updateStatus = function updateStatus() {
		if (fileCount == 0) {
			$('.imgtip').show();
			$(".uploadbtn").show()
		} else {
			$('.imgtip').hide();
			if (atlasMax > 1 && $list.find('.litpic').length == 0) {
				$list.children('li').eq(0).addClass('litpic');
			}
			$(".uploadbtn").hide()
		}
		$(".uploader-btn .utip").html('还能上传' + (atlasMax - fileCount) + '张图片');
	}

	// 负责view的销毁
	function removeFile(file) {
		var $li = $('#' + file.id);
		fileCount--;
		delAtlasPic($li.find("img").attr("data-val"));
		$li.remove();
		updateStatus();
	}

	//从队列删除
	$list.delegate(".cancel", "click", function () {
		var t = $(this), li = t.closest("li");
		var file = [];
		file['id'] = li.attr("id");
		removeFile(file);
		updateStatus();
		$("#litpic").val('');
		$('#fileList .uploadbtn').show();
	});

	// 切换litpic
	if (atlasMax > 1) {
		$list.delegate(".item img", "click", function () {
			var t = $(this).parent('.item');
			if (atlasMax > 1 && !t.hasClass('litpic')) {
				t.addClass('litpic').siblings('.item').removeClass('litpic');
			}
		});
	}

	// 当有文件添加进来时执行，负责view的创建
	function addFile(file) {
		var $li = $('<li id="' + file.id + '" class="thumbnail"><img></li>'),
			$btns = $('<div class="file-panel"><span class="cancel"></span></div>').appendTo($li),
			$img = $li.find('img');

		// 创建缩略图
		uploader.makeThumb(file, function (error, src) {
			if (error) {
				$img.replaceWith('<span class="thumb-error">不能预览</span>');
				return;
			}
			$img.attr('src', src);
		}, thumbnailWidth, thumbnailHeight);

		$btns.on('click', 'span', function () {
			uploader.removeFile(file, true);
		});

		uploadbtn.after($li);
	}

	if (uploader) {
		// 当有文件添加进来的时候
		uploader.on('fileQueued', function (file) {

			//先判断是否超出限制
			if (fileCount == atlasMax) {
				showErr('图片数量已达上限');
				// $(".uploader-btn .utip").html('<font color="ff6600">图片数量已达上限</font>');
				return false;
			}

			fileCount++;
			addFile(file);
			updateStatus();
		});

		// 文件上传过程中创建进度条实时显示。
		uploader.on('uploadProgress', function (file, percentage) {
			var $li = $('#' + file.id),
				$percent = $li.find('.progress span');

			// 避免重复创建
			if (!$percent.length) {
				$percent = $('<p class="progress"><span></span></p>')
					.appendTo($li)
					.find('span');
			}
			$percent.css('width', percentage * 100 + '%');
		});

		// 文件上传成功，给item添加成功class, 用样式标记上传成功。
		uploader.on('uploadSuccess', function (file, response) {
			var $li = $('#' + file.id);
			if (response.state == "SUCCESS") {
				$li.find("img").attr("data-val", response.url).attr("data-url", response.turl).attr("src", response.turl);
				$('#litpic').val(response.url);
			} else {
				removeFile(file);
				showErr('上传失败！');
				// $(".uploader-btn .utip").html('<font color="ff6600">上传失败！</font>');
			}
		});

		// 文件上传失败，现实上传出错。
		uploader.on('uploadError', function (file) {
			removeFile(file);
			showErr('上传失败！');
			// $(".uploader-btn .utip").html('<font color="ff6600">上传失败！</font>');
		});

		// 完成上传完了，成功或者失败，先删除进度条。
		uploader.on('uploadComplete', function (file) {
			$('#' + file.id).find('.progress').remove();
		});

		//上传失败
		uploader.on('error', function (code) {
			var txt = "上传失败！";
			switch (code) {
				case "Q_EXCEED_NUM_LIMIT":
					txt = "图片数量已达上限";
					break;
				case "F_EXCEED_SIZE":
					txt = "图片大小超出限制，单张图片最大不得超过" + atlasSize / 1024 / 1024 + "MB";
					break;
				case "F_DUPLICATE":
					txt = "此图片已上传过";
					break;
			}
			showErr(txt);
			// $(".uploader-btn .utip").html('<font color="ff6600">'+txt+'</font>');
		});

	}

	$('.turn').click(function () {
		var btn = $(this);
		if (btn.hasClass('close')) {
			btn.removeClass('close').addClass('open');
			$('.baomingend').hide();
			$('#baoming').val(1);
		} else {
			btn.removeClass('open').addClass('close');
			$('.baomingend').show()
			$('#baoming').val(0);
		}
	})

	// 切换费用类型
	$('.pricetype input').click(function () {
		var t = $(this), val = t.closest('label').find('a').data('id');
		if (val == 0) {
			$('.max').removeClass('fn-hide');
			$('.fee_body').addClass('fn-hide');
		} else {
			$('.max').addClass('fn-hide');
			$('.fee_body').removeClass('fn-hide');
		}
		$('#fee').val(val);
	})


	$('.signtype input').click(function () {
		var t = $(this), val = t.closest('label').find('a').data('id');
		$('#sign').val(val);
	})

	//增加电子票
	var feeTemp = '<div class="fee_item fn-clear"><span class="t1"><input type="text" name="fee_title[]" placeholder="费用名称"></span><span class="t2"><input type="number" name="fee_price[]" placeholder="免费请填0"></span><span class="t3"><input type="number" onkeyup="value=value.replace(/[^\\d.]/g, \'\')" name="fee_max[]" placeholder="留空不限"></span><span class="t4"><a href="javascript:;" class="del">删除</a></span></div>';
	$("body").on("click", '#feeAdd', function () {
		$(this).before(feeTemp);
		$(".fee_con .t4 a").show();
	});

	//删除电子票
	$(".fee_con").delegate(".t4 a", "click", function () {
		if ($(".fee_con .fee_item").length > 1) {
			$(this).closest(".fee_item").remove();

			if ($(".fee_con .fee_item").length == 1) {
				$(".fee_con .t4 a").hide();
			}
		}
	});


	//报名填写信息

	//新增报名项按钮
	$('.addNewProperty a').bind('click', function () {
		$('#popupSelectPropertyType, #popupSelectPropertyTypeBg').show();
	});

	//隐藏报名项
	$('#popupSelectPropertyType li, #popupSelectPropertyType .cancel, #popupSelectPropertyTypeBg').bind('click', function () {
		$('#popupSelectPropertyType, #popupSelectPropertyTypeBg').hide();
	});

	//删除报名项
	$('#join_ol').delegate('dt s', 'click', function () {
		if ($(this).closest('.inpbox').parent().hasClass('singlelist')) {
			if ($(this).closest('.singlelist').find('.inpbox').length < 3) {
				errmsg($(this), '最少保留两项！');
			} else {
				$(this).closest('.inpbox').remove();
			}
		} else {
			$(this).closest('.ml4r').remove();
		}
	});

	//增加选项
	$('#join_ol').delegate('.singlelist dd i', 'click', function () {
		$(this).closest('.inpbox').after('<dl class="inpbox"><dt><s></s><input type="text" placeholder="输入选项"></dt><dd><i>+</i></dd></dl>');
	});

	//新增报名项内容
	$('#popupSelectPropertyType li').bind('click', function () {
		var t = $(this), type = t.data('type'), title = t.closest('ul').hasClass('row4') ? t.text() : '';
		var html = '';
		if (type == 'text' || type == 'text_long') {
			html = '<div class="ml4r" data-type="' + type + '" data-title="' + title + '">';
			html += '<dl class="inpbox">';
			html += '<dt><s></s><input type="text" placeholder="输入' + (type == 'text' ? '单' : '多') + '行文本问题" value="' + title + '" /></dt>';
			html += '<dd>';
			html += '<div class="radio radioBox fn-clear">';
			html += '<label>';
			html += '<a href="javascript:;" data-id="1">必填</a>';
			html += '<div class="check-left check-right">';
			html += '<input type="checkbox" value="1">';
			html += '<span class="checkbox-icon-round"></span>';
			html += '</div>';
			html += '</label>';
			html += '</div>';
			html += '</dd>';
			html += '</dl>';
			html += '</div>';
		} else if (type == 'single_vote' || type == 'multi_vote') {
			html = '<div class="ml4r" data-type="' + type + '" data-title="' + title + '">';
			html += '<dl class="inpbox">';
			html += '<dt><s></s><input type="text" placeholder="输入' + (type == 'single_vote' ? '单' : '多') + '选标题" value="' + title + '" / ></dt>';
			html += '<dd>';
			html += '<div class="radio radioBox fn-clear">';
			html += '<label>';
			html += '<a href="javascript:;" data-id="1">必填</a>';
			html += '<div class="check-left check-right">';
			html += '<input type="checkbox" value="1">';
			html += '<span class="checkbox-icon-round"></span>';
			html += '</div>';
			html += '</label>';
			html += '</div>';
			html += '</dd>';
			html += '</dl>';
			html += '<div class="singlelist' + (type == 'multi_vote' ? ' multilist' : '') + '">';
			if (title == '性别') {
				html += '<dl class="inpbox">';
				html += '<dt><s></s><input type="text" placeholder="输入选项" value="男" /></dt>';
				html += '<dd><i>+</i></dd>';
				html += '</dl>';
				html += '<dl class="inpbox">';
				html += '<dt><s></s><input type="text" placeholder="输入选项" value="女" /></dt>';
				html += '<dd><i>+</i></dd>';
				html += '</dl>';
			} else {
				html += '<dl class="inpbox">';
				html += '<dt><s></s><input type="text" placeholder="输入选项"></dt>';
				html += '<dd><i>+</i></dd>';
				html += '</dl>';
				html += '<dl class="inpbox">';
				html += '<dt><s></s><input type="text" placeholder="输入选项"></dt>';
				html += '<dd><i>+</i></dd>';
				html += '</dl>';
			}
			html += '</div>';
			html += '</div>';
		}

		$('#join_ol').append(html);
	});
	//国际手机号获取
	getNationalPhone();
	function getNationalPhone() {
		$.ajax({
			url: masterDomain + "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
			type: 'get',
			dataType: 'jsonp',
			success: function (data) {
				if (data && data.state == 100) {
					var phoneList = [], list = data.info;
					for (var i = 0; i < list.length; i++) {
						phoneList.push('<li><span>' + list[i].name + '</span><em class="fn-right">+' + list[i].code + '</em></li>');
					}
					$('.layer_list ul').append(phoneList.join(''));
				} else {
					$('.layer_list ul').html('<div class="loading">暂无数据！</div>');
				}
			},
			error: function () {
				$('.layer_list ul').html('<div class="loading">加载失败！</div>');
			}

		})
	}
	// 打开手机号地区弹出层
	$(".areacode_span").click(function () {
		$('.layer_code').show();
		$('.mask-code').addClass('show');
	})
	// 选中区域
	$('.layer_list').delegate('li', 'click', function () {
		var t = $(this), txt = t.find('em').text();
		$(".areacode_span em").text(txt);
		$("#areaCode").val(txt.replace("+", ""));

		$('.layer_code').hide();
		$('.mask-code').removeClass('show');
	})

	// 关闭弹出层
	$('.layer_close, .mask-code').click(function () {
		$('.layer_code').hide();
		$('.mask-code').removeClass('show');
	})



	$('#submit').click(function () {
		var tj = $(this), action = $('#fabuForm').attr("action"), data = $("#fabuForm").serialize();

		$('#fabuForm label').removeClass('haserror');

		if (tj.hasClass('disabled')) return;

		var typeid = $('#typeid');
		if (typeid.val() == 0) {
			errmsg(typeid, '请选择活动分类');
			$(window).scrollTop(0);
			return false;
		}

		$('#typeid').val(typeid.val());

		var litpic = $('#litpic');
		if (litpic.val() == '') {
			errmsg(litpic, '请上传活动海报');
			$(window).scrollTop(0);
			return false;
		}

		var title = $('#title');
		if (title.val() == 0) {
			errmsg(title, '请输入活动主题！');
			title.focus();
			return false;
		}

		var began = $("#began");
		if (began.val() == "") {
			errmsg(began, "请选择开始时间！");
			return false;
		}

		var end = $("#end");
		if (end.val() == "") {
			errmsg(end, "请选择结束时间！");
			return false;
		}

		var baomingend = $("#baomingend");
		if (baomingend.val() == "" && $(".inpbox .turn").hasClass("close")) {
			errmsg(baomingend, "请选择报名截止时间！");
			return false;
		}

		var addrid = $("#addrid");
		if (addrid.val() == "" || addrid.val() == 0) {
			errmsg(addrid, "请选择活动区域！");
			return false;
		}

		var address = $("#address");
		if (address.val() == "") {
			errmsg(address, "请输入活动详细地址！");
			return false;
		}

		var body = $("#body");
		if (body.val() == "") {
			errmsg(body, "请输入活动详情！");
			return false;
		}

		//费用验证
		if (id == 0 && reg == 0) {
			var fee = $("#fee").val(), feeCount = 0;
			if (fee == 1) {
				$(".fee_con .fee_item").each(function () {
					var th = $(this), tit = th.find(".t1 input").val(), price = parseFloat(th.find(".t2 input").val()), max = th.find(".t3 input").val();
					if (tit != "" && price != NaN) {
						feeCount++
					}
				});
				if (feeCount == 0) {
					errmsg($(".fee_body"), "请填写电子票内容！");
					return false;
				}
			} else {
				var max = $("#max");
				if (max.val() == "" || max.val() == 0) {
					errmsg(max, "请输入人数上限！");
					return false;
				}
			}
		}


		//报名填写信息
		var property = [], tj_ = true;
		$('#join_ol').find('.ml4r').each(function (index) {
			if (tj_) {
				var t = $(this), type = t.attr('data-type'), required = t.find('.radioBox input').is(':checked') ? 1 : 0, title = $.trim(t.find('dt input').val());
				if (title == '') {
					tj_ = false;
					errmsg(t.find('dt input:eq(0)'), "请填写报名信息第" + (index + 1) + "项！");
					return false;
				}
				var arr = [];
				if (type == 'multi_vote' || type == 'single_vote') {
					var zuList = t.find('.singlelist .inpbox'), tj_1 = true;
					if (zuList.length > 0) {
						zuList.each(function (i) {
							if (tj_1) {
								var xuan = $.trim($(this).find('dt input').val());
								if (xuan == '') {
									tj_ = tj_1 = false;
									errmsg($(this).find('dt input'), "请输入选项" + (i + 1) + "的内容！");
									return false;
								}
								arr.push('"' + xuan + '"');
							}
						});
					} else {
						tj_ = false;
						errmsg(t.find('dt input:eq(0)'), "请添加报名填写信息第" + (index + 1) + "项的选项内容！");
						return false;
					}
				}

				property.push('{"type": "' + type + '", "required": "' + required + '", "title": "' + title + '", "val": [' + arr.join(',') + ']}');
			}
		});

		data += "&property=[" + property.join(",") + "]";
		if (!tj_) return false;


		var contact = $("#contact");
		if (contact.val() == "") {
			errmsg(contact, "请输入主办方联系方式！");
			return false;
		}

		tj.addClass("disabled").text("提交中...");

		if (id != 0) {
			data += "&id=" + id;
		}

		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if (data && data.state == 100) {

					fabuPay.check(data, manageUrl, tj);

				} else {
					alert(data.info);
					tj.removeClass("disabled").text("重新提交");
				}
			},
			error: function () {
				alert(data.info);
				tj.removeClass("disabled").text("重新提交");
			}
		});
	})

	// 错误提示
	function errmsg(obj, str) {
		var o = $(".error");
		o.html('<p>' + str + '</p>').show();
		if (obj.is('textarea') || (obj.is('input') && obj.is(':visible') && obj.attr('readonly') != "true")) {
			obj.focus();
		} else {
			$('html,body').animate({
			}, 10);
		}

		obj.closest('label').addClass('haserror');
		setTimeout(function () { o.hide() }, 1000);
	}

	let data = {
		service: 'huodong',
		action: 'type'
	}
	ajax(data, { dataType: 'json' }).then(res => {
		if (res.state == 100) {
			let str = '';
			for (let i = 0; i < res.info.length; i++) {
				let item = res.info[i];
				str += `<option value="${item.id}">${item.typename}</option>`
			}
			$('#typeid').html(str);
			//二级菜单
			$('.demo-select-opt').scroller(
				$.extend({
					preset: 'select'
				})
			);
		}
	})
})