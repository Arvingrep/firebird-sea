$(function(){

	$('img').scrollLoading();

	var objId = $('#list');

	$('.item textarea').focus(function(){
		$(this).closest('.item').addClass('focus');
	}).blur(function(){
		$(this).closest('.item').removeClass('focus');
	})

	//删除
	objId.delegate(".item .del", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			par.addClass('del');
			setTimeout(function(){
				if(confirm(langData['siteConfig'][20][211])){
					$.ajax({
						url: masterDomain+"/include/ajax.php?service=dating&action=albumDel&id="+id,
						type: "GET",
						dataType: "jsonp",
						success: function (data) {
							if(data && data.state == 100){
								//删除成功后移除信息层并异步获取最新列表
								par.addClass('remove-ing');
								setTimeout(function(){
									par.remove();
									$(window).scroll();
									if(objId.children('.item').length == 0){
										location.reload();
									}
								},300);
							}else{
								alert(langData['siteConfig'][20][300]);
							}
						},
						error: function(){
							alert(langData['siteConfig'][20][183]);
						}
					});
				}else{
					par.removeClass('del');
				}
			},10)
		}
	});

	//修改
	objId.delegate(".item .edit", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), note = par.find("textarea").val();
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			location.href = "/login.html";
			return false;
		}

		if(id){
			$.ajax({
            	url: masterDomain + "/include/ajax.php?service=dating&action=albumEdit&id="+id+"&note="+note,
            	type: "GET",
            	dataType: "jsonp",
            	success: function (data) {
              		if(data.state == 100){
                		t.html(langData['siteConfig'][9][5]);
                		setTimeout(function(){
                			t.html(langData['siteConfig'][6][27]);
                		},1000)
              		}else{
                		alert(data.info);
              		}
            	},
            	error: function(){
              		alert(langData['siteConfig'][20][173]);
            	}
          	});
		}

	});


})