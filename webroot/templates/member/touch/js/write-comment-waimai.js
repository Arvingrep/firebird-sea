$(function(){
	$('#star').raty({"starOff":tpldir+"images/star-off.png","starOn":tpldir+"images/star-on.png","score":star});
	$('#starps').raty({"starOff":tpldir+"images/star-off.png","starOn":tpldir+"images/star-on.png","scoreName":"scoreps","score":starps});

	// 匿名
	$(".rank_lead li").click(function(){
		$(this).addClass("rank_bc").siblings().removeClass("rank_bc");
	})

	// 提交
	$(".submitBtn").click(function(){
		var btn = $(this);
		if(btn.hasClass("disabled")) return;

		var isanony = $(".rank_lead .rank_bc").index(),
			commonid = $("#commonid").val(),
			starps = $("input[name=scoreps]").val(),
			contentps = $.trim($("#contentps").val());

		if(ordertype == 'waimai'){
			var star = $("input[name=score]").val(),
				content = $.trim($("#content").val());
			if(star == ""){
				alert(langData['siteConfig'][20][401]);
				return;
			}
		}

		if(starps == ""){
			alert(langData['siteConfig'][20][402]);
			return;
		}

		var imglist = [], imgli = $("#fileList li.thumbnail");

	    imgli.each(function(index){
	        var t = $(this), val = t.find("img").attr("data-val");
	        if(val != ''){
	          	imglist.push(val);
        	}
	    })

		btn.addClass("disabeld").text(langData['siteConfig'][6][35]);

		var data = [];
		data.push('aid='+id);
		// data.push('commonid='+commonid);
		data.push('isanony='+isanony);
		data.push('starps='+starps);
		data.push('contentps='+contentps);
		data.push('pics='+imglist.join(","));

		if(ordertype == 'waimai'){
			data.push('star='+star);
			data.push('content='+content);
			data.push('type=waimai-order');
		}else{
			data.push('type=paotui-order');
		}

		// data.push('ordertype='+ordertype);



		$.ajax({
			url: masterDomain + '/include/ajax.php?service=member&action=sendComment',
			type: 'get',
			data: data.join("&"),
			dataType: 'jsonp',
			success: function(data){
				btn.removeClass("disabeld");
				if(data && data.state == 100){
					btn.removeClass("disabeld").text(langData['siteConfig'][20][312]);
					setTimeout(function(){
						location.href = returnUrl;
					},500)
				}else{
					btn.removeClass("disabeld").text(langData['siteConfig'][6][151]);
					alert(data.info);
				}
			},
			error: function(){
				btn.removeClass("disabeld").text(langData['siteConfig'][6][35]);
				alert(langData['siteConfig'][20][181]);
			}
		})

	})
})
