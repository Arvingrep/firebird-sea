$(function(){
	var pubStaticPath = (typeof staticPath != "undefined" && staticPath != "") ? staticPath : "/static/";
	var pubModelType = (typeof modelType != "undefined") ? modelType : "siteConfig";

	var upslideShow = new Upload({
	    btn: '.add_img ',
	    bindBtn: '',
	    title: 'Images',
	    mod: 'business',
	    params: 'type=atlas',
	    atlasMax: 5,
	    deltype: 'delAtlas',
	    replace: true,
	    fileQueued: function(file){
			$(".imgshow").remove();
			$(".add_img").addClass('fn-hide')
			$(".add_img").after('<div class="imgshow" id="'+file.id+'"></div>');
	    },
	    uploadSuccess: function(file, response){
	      if(response.state == "SUCCESS"){
	        $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'" alt=""><a href="javascript:;" class="del_img"></a>');
			$("#video_litpic").val(response.url)
	      }
	    },
	    uploadFinished: function(){
	     
	    },
	    uploadError: function(){
	
	    },
	    showErr: function(info){
	      showErrAlert(info);
	    }
	  });
	  
	  
	  // 删除图片
	  $(".imgbox").delegate(".del_img","click",function(){
			var del = $(this);
			var img_box = del.closest(".imgshow");
			var upimg = img_box.siblings(".add_img");
			upimg.removeClass("fn-hide");
			img_box.addClass("fn-hide");
			var picpath = img_box.find("img").attr('data-url');
			var g = {
				mod: pubModelType,
				type: "delatlas",
				picpath: picpath,
				randoms: Math.random()
			};
			$.ajax({
				type: "POST",
				url: "/include/upload.inc.php",
				data: $.param(g),
				success: function(a) {
					img_box.html('');
					$("#video_litpic").val('')
				}
			})
	});
	
	// 确认提交
	$(".save_btn").click(function(){
		var t = $(this);
		t.attr('disabled');
		if($("#title").val()==''){
			var txt = $("#title").attr('placeholder')
			showErrAlert(txt);
			return false;
		}
		if($("#video_litpic").val()==''){
			showErrAlert(langData['siteConfig'][27][78]);
			return false;
		}
		if($("#video").val()==''){
			var txt = $("#video").attr('placeholder')
			showErrAlert(txt);
			return false;
		}
		var data = $(".form").serialize();
		var url = urlPath +'/business-video.html';
		action = vid!='0'?'editvideo':'addvideo';
		idtxt = action=='editvideo'?'&id='+vid:'';
		
		$.ajax({
			url: '/include/ajax.php?service=business&action='+action+idtxt,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					var tip = langData['shop'][1][7];
					if(id != undefined && id != "" && id != 0){
						tip = langData['siteConfig'][20][229];
					}
					showErrAlert('成功操作')
					setTimeout(function(){
						location.href = url;
					})
				}else{
					showErrAlert(data.info);
					t.removeAttr("disabled").html(langData['shop'][1][7]);
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeAttr("disabled").html(langData['shop'][1][7]);
			}
		});
	})
	
})