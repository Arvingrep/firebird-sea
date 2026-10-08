$(function() {
	

	//点星星
	$('.star_box i').click(function() {
		var t = $(this), pp = t.parents('.commt-box') 
			index = t.index(),
			p = t.parents('.star_box');
		var txt = t.attr('data-title');
		p.find('i').removeClass('click');
		t.addClass('click');
		for (var i = 0; i < index; i++) {
			p.find('i').eq(i).addClass('click');
		};
		p.find('.com_tip').text(txt).show();
		
		if(pp.hasClass('shop_box')){
			$('#score').val(index+1);
			if((index+1)<=2){
				$('.hide_tip').addClass('show');
				$('.hide_tip').attr('data-isanony',1)
			}
		}else{
			$('#scoreps').val(index+1);
			$('.label_tip li').removeClass('on_chose');
			if (index < 2 ) {
				$('.label_tip .bad_ul').addClass('show').siblings('ul').removeClass('show');
			} else {
				$('.label_tip .comon_ul').addClass('show').siblings('ul').removeClass('show');
			}
		}
	});
	// if(contentps!=''){
	// 	$(".commt_btn").click()
	// }

	// 点击标签
	var qs_cmt = [];
	$('.label_tip').delegate('li', 'click', function() {
		var t = $(this);
		if(!t.hasClass('on_chose')){
			t.addClass('on_chose');
			if(t.hasClass('commt_btn')){
				$('#comm_d').show();
			}else{
				qs_cmt.push(t.text());
			}
		}else{
			t.removeClass('on_chose');
			if(t.hasClass('commt_btn')){
				$('#comm_d').hide();
			}else{
				var index = qs_cmt.indexOf(t.text());
				qs_cmt.splice(index, 1);
			}
		}
		
		
	});

    // 匿名评价
	$('.hide_tip').click(function(){
		var t = $(this)
		if(!t.hasClass('show')){
			t.addClass('show');
			t.attr('data-isanony',1)
		}else{
			t.removeClass('show');
			t.attr('data-isanony',0)
		}
	});
	
	// 分数转换成星星
	if(star>0){
		$('.shop_box .star_box i').eq(star).click()
	};
	if(starps>0){
		$('.distributor_box .star_box i').eq(starps).click()
	};
	
	// 提交外卖评价
	$('.commt_upbtn').click(function(){
		var btn = $(this);
		if(btn.hasClass("disabled")) return;
			var isanony = $(".hide_tip").attr('data-isanony'),
				commonid = $("#commonid").val(),
				starps = $("input#scoreps").val(),
				contentps = $.trim($("#comm_d").text());
			if(ordertype == 'waimai'){
				var star = $("input#score").val(),
				content = $.trim($("#comm_shop").text());
				if(star == ""){
					alert(langData['siteConfig'][20][401]);   /* 请给店铺打分*/
					return;
				}
			}
			
			if(starps == ""){
				alert(langData['siteConfig'][20][402]);   /* 请给配送员打分 */
				return;
			}
			
			var imglist = [], imgli = $("#fileList li.thumbnail");
			
			imgli.each(function(index){
			  var t = $(this), val = t.find("img").attr("data-val");
			  if(val != ''){
				imglist.push(val);
			   }
			})
			
			btn.addClass("disabeld").text(langData['siteConfig'][6][35]);   /* 提交中*/
			var data = [];
			data.push('aid='+id);
			data.push('ordertype1='+ordertype1);
					// data.push('commonid='+commonid);
			data.push('isanony='+isanony);
			data.push('starps='+starps);
			data.push('qslabel='+qs_cmt.join(','))
			data.push('contentps='+contentps);
			data.push('pics='+imglist.join(","));
			if(ordertype == 'waimai'){
				data.push('star='+star);
				data.push('content='+content);
				data.push('type=waimai-order');
			}else{
				data.push('type=paotui-order');
				data.push('ordertype=paotui');
			}
			console.log(data);
			// 提交评论数据
			$.ajax({
				url: masterDomain + '/include/ajax.php?service=waimai&action=sendCommon',
				type: 'get',
				data: data.join("&"),
				dataType: 'jsonp',
				success: function(data){
					btn.removeClass("disabeld");
					if(data && data.state == 100){
						btn.removeClass("disabeld").text(langData['siteConfig'][20][312]);   /* 提交成功*/
						setTimeout(function(){
							location.href = returnUrl;
						},500)
					}else{
						btn.removeClass("disabeld").text(langData['siteConfig'][6][151]);    /* 提交*/
						alert(data.info);
					}
				},
				error: function(){
					btn.removeClass("disabeld").text(langData['siteConfig'][6][35]);   /* 提交中*/
					alert(langData['siteConfig'][20][181]);   /* 网络错误，提交失败*/
				}
			})
	})

});
