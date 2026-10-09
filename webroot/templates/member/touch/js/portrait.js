$(function(){

	//APP端取消下拉刷新
    toggleDragRefresh('off');

	$('.reset,.change').click(function(){
		if($(this).hasClass('disabled')) return;
		//$('#clipArea img').remove();
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
		var imgData = [];
		// 选择图片
		var cropper;
		$('#Filedata').change(function(){
			var t = $(this);
			console.log(t.prop('files'));
			var files = t.prop('files');
			if(files.length>0){
				var file = files[0];
				if(isImageFile(file)){
					url = URL.createObjectURL(file);
					$("#image").attr('src',url) ;
					$(".change").addClass('disabled');
					$(".reset,#save").removeClass('disabled');

				};
				// $('#image').cropper('destroy');
				// $('#image').cropper({
				// 		aspectRatio: largeWidth/largeHeight,
				// 		viewMode:1,
				// 		crop: function (e) {
				// 			imgData = e;
				// 			console.log(e);
				// 		}
				//  });
				
                cropper ? cropper.destroy() : '';

				cropper = new Cropper(image, {
				        aspectRatio: largeWidth/largeHeight,
				        viewMode:1,
				        crop: function (e) {
							imgData = e;
							console.log(imgData)
							//alert('2222')
				        }
				    });
				$('.roate_btn').show();
			}

		});

		// 点击保存
		var imgPic = ''
		$("#save").click(function(){
			 var cas=cropper.getCroppedCanvas();
			 var base64url=cas.toDataURL('image/png',.6);
			imgPic = base64url;
			 $('#image').attr('data-url',base64url);


			 mysub()

		});




		function isImageFile(file) {
		  if (file.type) {
			return /^image\/\w+$/.test(file.type);
		  } else {
			return /\.(jpg|jpeg|png|gif)$/.test(file);
		  }
		}




	//上传图片
	function mysub(){

		upbtn.addClass('disabled');
		//resbtn.addClass('disabled');
		save.text(langData['siteConfig'][46][73]);

		var form = $("#uploadForm"), data = [], action = form.attr("action");

		var mod = $("#mod").val(), type = $("#type").val(), filetype = $("#filetype").val();
		data['mod'] = mod;
		data['type'] = type;
		data['filetype'] = filetype;
		data['base64'] = 'base64';
		imgPic = imgPic.replace('data:image/png;base64,', '');
		data['Filedata'] = imgPic;


		$(".mask_loading").show();

		//重置提交参数
		// coordinate = [];
		picid = 0;
      
        var login_user = $.cookie(cookiePre + 'login_user');

		$.ajaxFileUpload({
			url: action,
			dataType: "json",
			data: data,
			success: function(m, l) {
				if (m.state == "SUCCESS") {

                    var host = window.location.host;
                    var host_ = host.split('.');
                    var len = host_.length;
                    var domain = '', start = len > 2 ? len - 2 : 0;
                    for (var i = start; i < len; i++) {
                        domain += '.' + host_[i];
                    }
                  
                    $.cookie(cookiePre + 'login_user', login_user, { expires: 365, domain: host, path: '/' });
                    $.cookie(cookiePre + 'login_user', login_user, { expires: 365, domain: domain, path: '/' });
                  
					picid = m.url;
					// alert(picid)
					$('.change').addClass('disabled');
					save.removeClass('disabled').text(langData['siteConfig'][6][27]);
					resbtn.removeClass('disabled');
					console.log(m)
					saveFile(imgData.detail)
				} else {
					upFailed(m.state);
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
				coordX: 0,
				coordY: 0,
				coordW: data.width,
				coordH: data.height,
				picid: picid,
				width: data.width,
				height: data.height
			}
				// console.log(coordinate);


			$.ajax({
				url: "/include/cropupload.php",
				data: coordinate,
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						resbtn.remove();
						save.removeClass("disabled").text(langData['siteConfig'][6][39]);
                      
                      	alert('设置成功');

                        //APP中
                        if(device.indexOf('huoniao') > -1){

                            setupWebViewJavascriptBridge(function(bridge) {
                                bridge.callHandler('pageReload', {}, function(responseData){});
                                setTimeout(function(){
                                    bridge.callHandler("goBack", {}, function(responseData){});
                                }, 500);
                            });

                        }else{
                            setTimeout(function(){
                                location.href = bindbackUrl + '?currentPageOpen=1';
                            },500)                            
                        }
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

	$(".roate_btn").click(function(){
		// $('#image').cropper('rotate', '-90');
		cropper.rotate(-90)
	})

	function saveFailed(info){
		$(".mask_loading").hide();
		alert(info);
		$("#save").removeClass('disabled');

	}

	function upFailed(info){
		$('#image').attr('src',lit_photo);
		// $('#image').cropper('destroy');
		$('.roate_btn').hide();
		$("#save,.reset").addClass('disabled');
		$(".change").removeClass('disabled');
		$(".mask_loading").hide();
		alert(info);
		location.reload();
	}


})
