$(function(){

	$('.filebtn,.reset').click(function(){
		if($(this).hasClass('disabled')) return;
		$('#clipArea img').remove();
		$('#Filedata').click();
	})

	var coordinate = [],
		picid = 0,
		upbtn = $('.filebtn'),
		resbtn = $('.reset'),
		mw = largeWidth,
		mh = largeHeight,
		rotate = 0,
		save = $('#save');
	$("#clipArea").photoClip({
		width: mw,
		height: mh,
		file: "#Filedata",
		view: "#view",
		ok: "#save",
		rotatedisable: true,
		loadStart: function() {
			upbtn.hide();
			mysub();
		},
		loadComplete: function(url) {
			// $("#save").removeClass("disabled");
		},
		clipFinish: function(data) {
			saveFile(data);
		}
	});

	//上传图片
	function mysub(){

		upbtn.addClass('disabled');
		resbtn.addClass('disabled');
		save.addClass('disabled').text(langData['siteConfig'][19][830]);

		var form = $("#uploadForm"), data = [], action = form.attr("action");

		var mod = $("#mod").val(), type = $("#type").val(), filetype = $("#filetype").val();
		data['mod'] = mod;
		data['type'] = type;
		data['filetype'] = filetype;



		//重置提交参数
		coordinate = [];
		picid = 0;

		$.ajaxFileUpload({
			url: action,
			fileElementId: "Filedata",
			dataType: "json",
			data: data,
			success: function(m, l) {
				if (m.state == "SUCCESS") {
					picid = m.url;
					save.removeClass('disabled').text(langData['siteConfig'][6][27]);
					resbtn.css('display','table-cell').removeClass('disabled');
				} else {
					upFailed(langData['siteConfig'][20][306]);
				}
			},
			error: function() {
				upFailed(langData['siteConfig'][20][183]);
			}
		});

	}

	//保存头像
	function saveFile(data){
		if(save.hasClass('disabled')) return;

		if(picid != 0){

			save.addClass("disabled").text(langData['siteConfig'][7][9]);
			resbtn.addClass('disabled');

			coordinate = {
				coordX: data.x*data.scale,
				coordY: data.y*data.scale,
				coordW: mw,
				coordH: mh,
				picid: picid,
				width: parseInt(data.w*data.scale),
				height: parseInt(data.h*data.scale)
			}

			$.ajax({
				url: "/include/cropupload.php",
				data: coordinate,
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						resbtn.remove();
						save.removeClass("disabled").text(langData['siteConfig'][6][39]);
						setTimeout(function(){
							location.href = bindbackUrl;
						},500)
					}else{
						saveFailed(data.info);
					}
				},
				error: function(){
					saveFailed(langData['siteConfig'][20][183]);
				}
			});
		}

	}

	function saveFailed(info){
		alert(info);
		$("#save").removeClass('disabled');
	}

	function upFailed(info){
		upbtn.show().text(info);
		save.add('.reset').addClass('disabled');
		$('#clipArea img').fadeOut(1000);
		setTimeout(function(){
			upbtn.show().removeClass('disabled').text(langData['siteConfig'][6][59]);
		},1000)
	}


})
