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

	//类型选择
	function getType(){
		$.ajax({
			type: "POST",
			url: masterDomain + "/include/ajax.php?service=travel&action=strategytype&value=1",
			dataType: "jsonp",
			success: function(res){
				if(res.state==100 && res.info){
					var type = new MobileSelect({
							trigger: '.type_chose ',
							title: langData['travel'][6][13],   //攻略类型
							wheels: [ 
												{data: res.info}, 
											],
						
							callback:function(indexArr, data){
								$('#lei').val(data[0]['value']);
								$('#typeid').val(data[0]['id']);
							}
						,triggerDisplayData:false,
					});
				}
			}
		});
	}
	getType();
	

	$("#btn-keep").click(function(e){
		e.preventDefault();

		var t = $("#fabuForm"), action = t.attr("action"), url = t.attr("data-url");
		var r = true;

		var lei = $('#lei').val(),   //类别
				title_str = $('#title_str').val();  //标题

		if($('#fileList li.thumbnail').length<=0){
			r = false;
			showErr(langData['travel'][3][27]);//请至少上传一张图片
			return;
		}else if(lei==''){
			r = false;
			showErr(langData['travel'][6][14]);//请选择攻略类型
			return;
		}else if(title_str==''){
			r = false;
			showErr(langData['travel'][11][27]);//请输入标题
			return;
		}

		var pics = [];
		$("#fileList").find('.thumbnail').each(function(){
			var src = $(this).find('img').attr('data-val');
			pics.push(src);
		});
		$("#pics").val(pics.join(','));

		var litpic = [];
		$("#fileList_pro").find('.thumbnail').each(function(){
			var src = $(this).find('img').attr('data-val');
			litpic.push(src);
		});
		$("#litpic").val(litpic.join(','));

		if(!r){
			return;
		}
	
		$("#btn-keep").addClass("disabled").html(langData['siteConfig'][6][35]+"...");	//提交中
	
		$.ajax({
			url: action,
			data: t.serialize() + "&note="+$("#detail_text").html(),
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
		});

	});

});
