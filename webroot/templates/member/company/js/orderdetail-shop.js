$(function(){

	/*****2021-12-23 新增配送方式更改*****/
	//更换配送方式
  	$('.btns .changePs').click(function(){
	    var btn = $(this),psid = btn.attr('data-id');
	    if(psid =='1'){//快递改为 商家/平台
		    if(psType.indexOf(2) > -1){//商家
		        $('.chpsTit').html("确定更换为平台配送吗");
		    }else{
		        $('.chpsTit').html("确定更换为商家配送吗");
		    }
	    }else{//商家/平台 改为快递
	    	$('.chpsTit').html("确定更换为快递寄送吗");
	    }
	    $(".psAlert .sureChangePs").attr('data-id',psid);
	    $('.psMask').show();
		$('.psAlert').addClass('show');
  	})

  	//确定更改配送方式
  	$(".psAlert .sureChangePs").bind("click", function(){
  		var btn = $(this),psid = btn.attr('data-id');
  		console.log(psid)
  		if(psid =='1'){//快递改为 商家/平台
	        $('.formfield .exp').addClass('fn-hide');
			$('#expBtn').removeClass('busKd').addClass('busPeis').text('确认送出');
			if(psType.indexOf(2) > -1){//商家
				$('#shipping').val(0);
				btn.attr('data-id',0);
				$('.psTit').text('配送方式：平台配送');
			}else{//平台
				$('#shipping').val(2);
				btn.attr('data-id',2);
				$('.psTit').text('配送方式：商家配送');
			}
			$('.btns .changePs').attr('data-id',2);

		}else{//商家改为快递
			$('#shipping').val(1);
			btn.attr('data-id',1);
			$('.btns .changePs').attr('data-id',1);
			$('#expBtn').removeClass('busPeis').addClass('busKd').text('确定发货');
			$('.psTit').text('配送方式：快递寄送');
			$('.formfield .exp').removeClass('fn-hide');
		}
		$('.psMask').hide();
		$('.psAlert').removeClass('show');
  	})

  	//关闭弹窗
	$(".psMask,.psAlert .ps_close").click(function(){
		$('.psMask').hide();
		$('.psAlert').removeClass('show');
	})

	$(".exp input").bind("blur", function(){
		if($.trim($(this).val()) == ""){
			$(this).parent().addClass("error");
		}else{
			$(this).parent().removeClass("error");
		}
	});

    $(".exp select").change(function(){
        if($.trim($(this).val()) == ""){
            $(this).parent().addClass("error");
        }else{
            $(this).parent().removeClass("error");
        }
    });


	//确认发货--确认送出
	$("#expBtn").bind("click", function(){
		var t = $(this),
			shipping = parseInt($("#shipping").val()),
			company = $("#exp-company"),
			number  = $("#exp-number");

		if(typeof shipping === 'number' && !isNaN(shipping)){

		}else{
			alert(langData['siteConfig'][45][83]);//请选择配送方式！
			return false;
		}

		//快递类型
		if(shipping == 1){
			if($.trim(company.val()) == ""){
				company.parent().addClass("error");
				return false;
			}

			if($.trim(number.val()) == ""){
				number.parent().addClass("error");
				return false;
			}
		}

		var data = [];
		data.push("id="+detailID);
		data.push("shipping="+shipping);

		if(shipping == 1){
			data.push("company="+company.val());
			data.push("number="+number.val());
		}

		t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: "/include/ajax.php?service=shop&action=delivery",
			data: data.join("&"),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					$.dialog({
						fixed: true,
						title: langData['siteConfig'][20][244],
						icon: 'success.png',
						content: data.info,
						ok: function(){
							location.reload();
						},
						cancel: false
					});

				}else{
					$.dialog.alert(data.info);
					t.attr("disabled", false).html(langData['siteConfig'][6][0]);
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.attr("disabled", false).html(langData['siteConfig'][6][0]);
			}
		});

	});

	//确认送达
	$('#sureArrive').click(function(){
		$.dialog.confirm('确认商品已送达?', function(){
			 var data = [];
	        data.push("id="+detailID);
	        data.push("shipping="+$("#shipping").val());

	        if($("#shipping").val() == 1){
	            data.push("company="+$("#exp-company").val());
	            data.push("number="+$("#exp-number").val());
	        }
			$.ajax({
				url: "/include/ajax.php?service=shop&action=confirmDelivery",
				type: "POST",
				data:data.join('&'),
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
						$.dialog.alert('确认成功');
						location.reload();

					}else{
						$.dialog.alert(data.info);	
					}
				},
				error: function(){
					$.dialog.alert(langData['siteConfig'][20][183]);

				}
			});
		})
	});


	//变更门店
	$('.changeBranch').bind('click', function(){
		$('.branchMask').show();
		$('.branchAlert').addClass('show');
		var par =$(this).closest('.fendian');
		if(par.hasClass('nobranch')){//还未分配分店
			$('.branchAlert .chpsTit').html('选择分店');
			$('.branchAlert ul').html('<li class="branch_sure"><a href="javascript:;">确定分配</a></li>');
		}else{
			$('.branchAlert .chpsTit').html('变更分店/取消分配');
			$('.branchAlert ul').html('<li class="branch_cancel"><a href="javascript:;">取消分配</a></li><li class="branch_sure"><a href="javascript:;">确定变更</a></li>');
		}
	});
	//选择门店
	$('.branchList .branchItem').click(function(){
		$(this).toggleClass('active').siblings().removeClass('active')
	})
	//确定变更
	$('.branchAlert').delegate('.branch_sure','click',function(){
		if($('.branchList .branchItem.active').size() >0){
			var branchVal = $('.branchList .branchItem.active').attr('data-id');
			if(branchVal == branchid){
				$.dialog.alert(langData['shop'][5][111])//与当前分店一致，无需变更！
			}else{
				$.ajax({
					url: "/include/ajax.php?service=shop&action=changeBranch",
					data: "id="+detailID+"&branchid="+branchVal,
					type: "POST",
					dataType: "json",
					success: function (data) {
						if(data && data.state == 100){
							$.dialog({
								fixed: true,
								title: langData['siteConfig'][20][244],//操作成功
								icon: 'success.png',
								content: data.info,
								ok: function(){
									location.reload();
								},
								cancel: false
							});

						}else{
							$.dialog.alert(data.info);
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);
					}
				});
			}
		}else{
			$.dialog.alert('请选择分店！')
		}
		
	})
	//取消分配
	$('.branchAlert').delegate('.branch_cancel','click',function(){
		$.ajax({
			url: "/include/ajax.php?service=shop&action=changeBranch",
			data: "id="+detailID+"&branchid=0",
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					$.dialog({
						fixed: true,
						title: langData['siteConfig'][20][244],//操作成功
						icon: 'success.png',
						content: data.info,
						ok: function(){
							location.reload();
						},
						cancel: false
					});

				}else{
					$.dialog.alert(data.info);
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
			}
		});
	})
	//关闭弹窗
	$('.branchAlert .branch_close,.branchMask').bind('click', function(){
		$('.branchMask').hide();
		$('.branchAlert').removeClass('show');
	});

	//确定退款
	$(".tuikuan").bind("click", function(){
		var t = $(this);

		if(t.attr("disabled") == "disabled") return;

		$.dialog.confirm(langData['siteConfig'][20][407], function(){

			t.html(langData['siteConfig'][6][35]+"...").attr("disabled", true);

			$.ajax({
				url: "/include/ajax.php?service=shop&action=refundPay",
				data: "id="+detailID,
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
						$.dialog({
							fixed: true,
							title: langData['siteConfig'][20][244],
							icon: 'success.png',
							content: data.info,
							ok: function(){
								location.reload();
							},
							cancel: false
						});

					}else{
						$.dialog.alert(data.info);
						t.attr("disabled", false).html(langData['siteConfig'][6][153]);
					}
				},
				error: function(){
					$.dialog.alert(langData['siteConfig'][20][183]);
					t.attr("disabled", false).html(langData['siteConfig'][6][153]);
				}
			});

		});
	});


	//回复
	$(".huifu, .canHf").bind("click", function(){
		$(".hf").toggle();
	});

	$(".hf textarea").bind("click", function(){
		$(this).parent().removeClass("error");
	});

	$(".hf textarea").bind("blur", function(){
		if($.trim($(this).val()) == ""){
			$(this).parent().addClass("error");
		}
	});


	//字数限制
	var commonChange = function(t){
		var val = t.val(), maxLength = 500, tip = $(".lim-count");
		var charLength = val.replace(/<[^>]*>|\s/g, "").replace(/&\w{2,4};/g, "a").length;
		var surp = maxLength - charLength;
		surp = surp <= 0 ? 0 : surp;
		var txt = langData['siteConfig'][23][63].replace("1", "<strong>" + surp + "</strong>");
		tip.html(txt);

		if(surp <= 0){
			t.val(val.substr(0, maxLength));
		}
	}

	$("#ret-note").focus(function(){
		commonChange($(this));
	});
	$("#ret-note").keyup(function(){
		commonChange($(this));
	});
	$("#ret-note").keydown(function(){
		commonChange($(this));
	});
	$("#ret-note").bind("paste", function(){
		commonChange($(this));
	});


	//上传图片
	var $list = $('#fileList'),
			ratio = window.devicePixelRatio || 1,
			fileCount = 0,
			thumbnailWidth = 100 * ratio,   // 缩略图大小
			thumbnailHeight = 100 * ratio,  // 缩略图大小
			uploader;

	fileCount = $list.find("li").length;


	if($list.length > 0){
		//图集排序
		$list.dragsort({dragSelector: "li", dragSelectorExclude: ".file-panel", placeHolderTemplate: '<li class="thumbnail"></li>'});

		// 初始化Web Uploader
		uploader = WebUploader.create({
			auto: true,
			swf: staticPath + 'js/webuploader/Uploader.swf',
			server: '/include/upload.inc.php?mod=shop&type=atlas',
			pick: '#filePicker',
			fileVal: 'Filedata',
			accept: {
				title: 'Images',
				extensions: atlasType,
				mimeTypes: 'image/jpeg,image/png,image/gif'
			},
			fileNumLimit: atlasMax,
			fileSingleSizeLimit: atlasSize
		});

		//删除已上传图片
		var delAtlasPic = function(b){
			var g = {
				mod: "tuan",
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
		function updateStatus(){
			$(".uploader-btn .utip").html(langData['siteConfig'][20][512].replace("1", (atlasMax-fileCount)));
		}

		// 负责view的销毁
		function removeFile(file) {
			var $li = $('#'+file.id);
			fileCount--;
			delAtlasPic($li.find("img").attr("data-val"));
			$li.off().find('.file-panel').off().end().remove();
			updateStatus();
		}

		//从队列删除
		$list.delegate(".cancel", "click", function(){
			var t = $(this), li = t.closest("li");
			var file = [];
			file['id'] = li.attr("id");
			removeFile(file);
		});

		//向左旋转
		$list.delegate(".left", "click", function(){
			var t = $(this), li = t.closest("li"), img = li.find("img"), val = img.attr("data-val"), url = img.attr("data-url");
			huoniao.rotateAtlasPic("tuan", "left", val, function(data){
				if(data.state == "SUCCESS"){
					url = huoniao.changeFileSize(url, "small");
					img.attr("src", hideFileUrl == 1 ? url+"&v="+Math.random() : url+"?v="+Math.random());
				}else{
					$(".uploader-btn .utip").html('<font color="ff6600">'+langData['siteConfig'][20][295]+'</font>');
				}
			});
		});

		//向右旋转
		$list.delegate(".right", "click", function(){
			var t = $(this), li = t.closest("li"), img = li.find("img"), val = img.attr("data-val"), url = img.attr("data-url");
			huoniao.rotateAtlasPic("tuan", "right", val, function(data){
				if(data.state == "SUCCESS"){
					url = huoniao.changeFileSize(url, "small");
					img.attr("src", hideFileUrl == 1 ? url+"&v="+Math.random() : url+"?v="+Math.random());
				}else{
					$(".uploader-btn .utip").html('<font color="ff6600">'+langData['siteConfig'][20][295]+'</font>');
				}
			});
		});

		// 当有文件添加进来时执行，负责view的创建
		function addFile(file) {
			var $li   = $('<li id="' + file.id + '" class="thumbnail"><img></li>'),
					$btns = $('<div class="file-panel"><span class="cancel">&times;</span><span class="left">'+langData['siteConfig'][13][15]+'</span><span class="right">'+langData['siteConfig'][13][16]+'</span></div>').appendTo($li),
					$prgress = $li.find('p.progress span'),
					$info    = $('<div class="error"></div>'),
					$img = $li.find('img');

			// 创建缩略图
			uploader.makeThumb(file, function(error, src) {
					if(error){
						$img.replaceWith('<span class="thumb-error">'+langData['siteConfig'][20][304]+'</span>');
						return;
					}
					$img.attr('src', src);
				}, thumbnailWidth, thumbnailHeight);

			$btns.on('click', 'span', function(){
				uploader.removeFile(file, true);
			});

			$list.append($li);
		}

		// 当有文件添加进来的时候
		uploader.on('fileQueued', function(file) {

			//先判断是否超出限制
			if(fileCount == atlasMax){
				$(".uploader-btn .utip").html('<font color="ff6600">'+langData['siteConfig'][20][305]+'</font>');
				return false;
			}

			fileCount++;
			addFile(file);
			updateStatus();
		});

		// 文件上传过程中创建进度条实时显示。
		uploader.on('uploadProgress', function(file, percentage){
			var $li = $('#'+file.id),
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
		uploader.on('uploadSuccess', function(file, response){
			var $li = $('#'+file.id);
			if(response.state == "SUCCESS"){
				$li.find("img").attr("data-val", response.url).attr("data-url", response.turl);
			}else{
				removeFile(file);
				$(".uploader-btn .utip").html('<font color="ff6600">'+langData['siteConfig'][20][306]+'</font>');
			}
		});

		// 文件上传失败，现实上传出错。
		uploader.on('uploadError', function(file){
			removeFile(file);
			$(".uploader-btn .utip").html('<font color="ff6600">'+langData['siteConfig'][20][306]+'</font>');
		});

		// 完成上传完了，成功或者失败，先删除进度条。
		uploader.on('uploadComplete', function(file){
			$('#'+file.id).find('.progress').remove();
		});

		//上传失败
		uploader.on('error', function(code){
			var txt = langData['siteConfig'][20][306];
			switch(code){
				case "Q_EXCEED_NUM_LIMIT":
					txt = langData['siteConfig'][20][305];
					break;
				case "F_EXCEED_SIZE":
					txt = langData['siteConfig'][20][307].replace('1', (atlasSize/1024/1024));
					break;
				case "F_DUPLICATE":
					txt = langData['siteConfig'][20][308];
					break;
			}
			$(".uploader-btn .utip").html('<font color="ff6600">'+txt+'</font>');
		});

	}


	//提交回复
	$("#hfBtn").bind("click", function(){
		var t      = $(this),
				retnote = $("#ret-note").val();

		if(retnote == "" || retnote.length < 15){
			$.dialog.alert(langData['siteConfig'][20][408]);
			return;
		}

		var pics = [];
		$("#fileList li").each(function(){
			var val = $(this).find("img").attr("data-val");
			if(val != ""){
				pics.push(val);
			}
		});

		var data = {
			id: detailID,
			pics: pics.join(","),
			content: retnote
		}

		t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=shop&action=refundReply",
			data: data,
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					$.dialog({
						fixed: true,
						title: langData['siteConfig'][21][147],
						icon: 'success.png',
						content: data.info,
						ok: function(){
							location.reload();
						},
						cancel: false
					});
				}else{
					$.dialog.alert(data.info);
					t.attr("disabled", false).html(langData['siteConfig'][6][0]);
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.attr("disabled", false).html(langData['siteConfig'][6][0]);
			}
		});
	});

});
