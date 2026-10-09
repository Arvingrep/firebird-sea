$(function(){

	// $(".sidebar dl").each(function(index){
	// 	if(index > 1){
	// 		$(this).addClass("curr");
	// 		$(this).find("dd").hide();
	// 	}
	// });

	var jcrop, boundx, boundy, jcrop_api,
			crop = $("#crop"),
			big = $('#big'),
			middle = $('#middle'),
			small = $('#small'),
			wcrop = crop.width(),
			hcrop = crop.height(),
			xbig = $(".avatar-big .pic").width(),
			ybig = $(".avatar-big .pic").height(),
			xmiddle = $(".avatar-middle .pic").width(),
			ymiddle = $(".avatar-middle .pic").height(),
			xsmall = $(".avatar-small .pic").width(),
			ysmall = $(".avatar-small .pic").height(),
			coordinate = [],
			picid = 0,
			sildLength = 100;

	//图片裁剪
	function initJcrop(){
		$(".crop-img:eq(0)").Jcrop({
			setSelect: [sildLength, sildLength, sildLength * 2, sildLength * 2],
			aspectRatio: xmiddle/ymiddle,
			keySupport: false,
			onChange: updatePreview,
			onSelect: updatePreview
		}, function(){
			jcrop_api = this;
		});
	}

	//同步更新大中小图
	function updatePreview(c){
		if (parseInt(c.w) > 0) {

		coordinate = {
			coordX: c.x,
			coordY: c.y,
			coordW: c.w,
			coordH: c.h
		}

		var img = crop.find("img").eq(0);
		boundx = img.width();
		boundy = img.height();

		var bx = xbig / c.w;
		var by = ybig / c.h;
		big.css({
			width: Math.round(bx * boundx) + 'px',
			height: Math.round(by * boundy) + 'px',
			marginLeft: '-' + Math.round(bx * c.x) + 'px',
			marginTop: '-' + Math.round(by * c.y) + 'px'
		});

		var mx = xmiddle / c.w;
		var my = ymiddle / c.h;
		middle.css({
			width: Math.round(mx * boundx) + 'px',
			height: Math.round(my * boundy) + 'px',
			marginLeft: '-' + Math.round(mx * c.x) + 'px',
			marginTop: '-' + Math.round(my * c.y) + 'px'
		});

		var sx = xsmall / c.w;
		var sy = ysmall / c.h;
		small.css({
			width: Math.round(sx * boundx) + 'px',
			height: Math.round(sy * boundy) + 'px',
			marginLeft: '-' + Math.round(sx * c.x) + 'px',
			marginTop: '-' + Math.round(sy * c.y) + 'px'
		});
		}
  };

	//设置中心点
	function setCropZoom(img){
		pic = new Image();
		pic.onload = function() {
			var pw = pic.width;
			var ph = pic.height;

			var hRatio;
			var wRatio;
			var Ratio = 1;
			wRatio = wcrop / pw;
			hRatio = hcrop / ph;
			if (wcrop ==0 && hcrop==0){
			Ratio = 1;
			}else if (wcrop==0){//
			if (hRatio<1) Ratio = hRatio;
			}else if (hcrop==0){
			if (wRatio<1) Ratio = wRatio;
			}else if (wRatio<1 || hRatio<1){
			Ratio = (wRatio<=hRatio?wRatio:hRatio);
			}
			if (Ratio<1){
			pw = pw * Ratio;
			ph = ph * Ratio;
			}

			var nwidth = pw > sildLength ? sildLength : pw;
			var nheight = ph > sildLength ? sildLength : ph;
			var nleft = pw > sildLength ? (pw - sildLength) / 2 : 0;
			var ntop = ph > sildLength ? (ph - sildLength) / 2 : 0;

			nlength = nwidth > nheight ? nheight : nwidth;
			nlength = nlength > sildLength ? sildLength : nlength;

			jcrop_api.setSelect([nleft, ntop, nlength * 2, nlength * 2]);
		};
		pic.setAttribute("src", img);
	}

	//上传图片
	function mysub(){
		crop.html('<img src="'+staticPath+'images/ajax-loader.gif" class="loading" />');
		$(".btns").removeClass("normal").hide();
		$("#choose").val(langData['siteConfig'][6][178]);

		var form = $("#uploadForm"), data = [], action = form.attr("action");

		var mod = $("#mod").val(), type = $("#type").val(), filetype = $("#filetype").val();
		data['mod'] = mod;
		data['type'] = type;
		data['filetype'] = filetype;

		//重置提交参数
		coordinate = [];
		picid = 0;

		if(jcrop_api) jcrop_api.destroy();
		$("#save").attr("disabled", true);

		$.ajaxFileUpload({
			url: action,
			fileElementId: "Filedata",
			dataType: "json",
			data: data,
			success: function(m, l) {
				if (m.state == "SUCCESS") {
					crop.html('<img src="'+m.turl+'" class="crop-img" />');
					big.attr('src', m.turl);
					middle.attr('src', m.turl);
					small.attr('src', m.turl);
					$(".m-left .tips").hide();

					picid = m.url;
					$(".upload-form").attr("data-url", m.url);

					initJcrop();
					setTimeout(function(){
						setCropZoom(m.turl);
					}, 50);

					$(".btns").show();
					$("#save").attr("disabled", false);

				} else {
					uploadError(m.state);
				}
			},
			error: function() {
				uploadError(langData['siteConfig'][20][183]);
			}
		});

	}

	function uploadError(info){
		$("#choose").val(langData['siteConfig'][6][49]);
		$(".btns").show().addClass("normal");
		$(".m-left .tips").show();
		$.dialog.alert(info);
	}

	$("#Filedata").bind("change", function(){
		if ($(this).val() == '') return;
		mysub();
	});


	//保存头像
	$("#save").bind("click", function(){

		if(coordinate && picid != 0){

			$("#save").attr("disabled", true).val(langData['siteConfig'][7][9]+"...");
			$(".upload-form").hide();
			coordinate.picid = picid;

			var pic = $(".crop-img:eq(0)");
			coordinate.width = pic.width();
			coordinate.height = pic.height();

			$.ajax({
				url: "/include/cropupload.php",
				data: coordinate,
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						coordinate = [];
						picid = 0;

						// jcrop_api.destroy();
						// $("#crop").html("");
						// $(".btns").addClass("normal");
						// $("#choose").val(langData['siteConfig'][6][49]);
						// $(".upload-form, .tips").show();
						$.dialog({
							title: langData['siteConfig'][19][287],
							icon: 'success.png',
							content: langData['siteConfig'][6][39],
							ok: function(){
								location.reload();
							}
						});

					}else{
						saveFailed(data.info);
					}
				},
				error: function(){
					saveFailed(langData['siteConfig'][20][183]);
				}
			});
		}

	});

	function saveFailed(info){
		$.dialog.alert(info);
		jcrop_api.destroy();
		$("#crop").html("");
		$(".btns").addClass("normal");
		$("#choose").val(langData['siteConfig'][6][49]);
		$("#save").attr("disabled", false).val(langData['siteConfig'][6][48]);
		$(".upload-form, .tips").show();
	}

});
