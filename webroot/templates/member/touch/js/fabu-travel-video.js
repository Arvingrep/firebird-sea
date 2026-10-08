$(function () {
	//错误提示
	var showErrTimer;
	function showErr(txt){
	    showErrTimer && clearTimeout(showErrTimer);
	    $(".popErr").remove();
	    $("body").append('<div class="popErr"><p>'+txt+'</p></div>');
	    $(".popErr p").css({"margin-left": -$(".popErr p").width()/2, "left": "50%"});
	    $(".popErr").css({"visibility": "visible"});
	    showErrTimer = setTimeout(function(){
	        $(".popErr").fadeOut(300, function(){
	            $(this).remove();
	        });
	    }, 1500);
	}

	$('#btn-keep').click(function(e){
		e.preventDefault();

		var t = $("#fabuForm"), action = t.attr("action"), url = t.attr("data-url");
		var r = true;

		var tit = $('#video_tit').val();

		if($('#fileList li.thumbnail').length<=0){
			r = false;
			showErr(langData['travel'][12][50]);   //请上传封面
			return;
		}if($('#fileList2 li.thumbnail').length<=0){
			r = true;
			showErr(langData['travel'][12][49]);//请上传视频
			return;
		}else if(tit==''){
			r = true;
			showErr(langData['travel'][11][27]);//请输入标题
			return;
		}

		var pics = [];
		$("#fileList").find('.thumbnail').each(function(){
			var src = $(this).find('img').attr('data-val');
			pics.push(src);
		});
		$("#litpic").val(pics.join(','));

		var video = [];
		$("#fileList2").find('.thumbnail').each(function(){
			var src = $(this).find('video').attr('data-val');
			video.push(src);
		});
		$("#video").val(video.join(','));

		if(!r){
			return;
		}

		$("#btn-keep").addClass("disabled").html(langData['siteConfig'][6][35]+"...");	//提交中

		$.ajax({
			url: action,
			data: t.serialize(),
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					var tip = langData['siteConfig'][20][341];
					if(id != undefined && id != "" && id != 0){
						tip = langData['siteConfig'][20][229];
					}
					location.href = url;
				}else{
					showErr(data.info);
					$("#btn-keep").removeClass("disabled").html(langData['marry'][2][58]);		//立即发布
				}
			},
			error: function(){
				showErr(langData['siteConfig'][6][203]);
			}
		})
		
	})

});
