$(function(){
	
	
	$(".con_box h2").click(function(e){
		var t = $(this),p = t.parents(".con_box");
		if(e.target==$(".user_detail>h2>a")[0]){
				e.stopPropagation()
		}
		// if(t.hasClass("user_detail")){
		// 	t.addClass('open').find('.detail_box').slideDown();
		// 	$('.fabu_box .module_list').stop(true,false).slideUp();
		// }else if(t.hasClass("fabu_box")){
		// 	t.addClass('open').find('.module_list').slideDown();
		// 	$('.user_detail .detail_box').stop(true,false).slideUp();
		// }
		if(p.hasClass('open')){
			p.removeClass('open');
			p.find(".slide_box").slideUp();
		}else{
			p.addClass('open');
			p.find(".slide_box").slideDown();
		}
		
	})
	
	
	// 关注按钮
	$('.attention').click(function(){
		var t = $(this);
		if (t.hasClass('guanzhu_btn')) {
			follow(t, function(){
				t.removeClass('guanzhu_btn').html('<i></i>'+langData['siteConfig'][19][846]+'Ta');  //关注
			});
		}else{
			follow(t, function(){
				t.addClass('guanzhu_btn').html(langData['siteConfig'][19][845]);  //已关注
			});
	
		}
	});
	
	$(".attention").hover(function(){
		var t = $(this);
		if(t.hasClass('guanzhu_btn')){
			t.html(langData['siteConfig'][6][77]);  //'取消关注'
		}
	},function(){
		var t = $(this);
		if(t.hasClass('guanzhu_btn')){
			t.html(langData['siteConfig'][19][845]);  //已关注
		}
	});
	
	// 左侧关注按钮
	$(".care_btn").click(function(){
		var t = $(this);
		if (t.hasClass('cared')) {
			follow(t, function(){
				t.removeClass('cared').html('<i></i>'+langData['siteConfig'][19][846]);  //关注
			});
		}else{
			follow(t, function(){
				t.addClass('cared').html(langData['siteConfig'][19][845]);  //已关注
			});
			
		}
	})
	
	function follow(t, func){
			var userid = $.cookie(cookiePre+"login_user");
			if(userid == null || userid == ""){
				location.href = masterDomain + '/login.html';
				return false;
			}
	
			if(t.hasClass("disabled")) return false;
			t.addClass("disabled");
			$.post("/include/ajax.php?service=member&action=followMember&id="+t.data("id"), function(){
				t.removeClass("disabled");
				func();
			});
		}
	// 数据获取
	(async res => { 
		let data = {
			service: 'member',
			action: 'detail',
			id: uid,
			from:'homepage'
		}
		let result = await ajax(data, { dataType: 'json' });
		if (result.state == 100) {
			let info = result.info;
			console.log(info)
			$('.user_re a').eq(0).find('h4').text(info.homepageData.totalFans);
			$('.user_re a').eq(1).find('h4').text(info.homepageData.totalFollow);
			$('.user_re a').eq(2).find('h4').text(info.homepageData.totalMessage);
			$('.msglist_box h2 em').text(info.homepageData.totalMessage);
			$('.base_info').html(`<i></i><em>|</em> 注册${info.homepageData.regtime}年`);
			$('.top_box .nav_box li').eq(1).find('a').text(`发布 · ${info.homepageData.allcount}`);
			if(info.homepageData.isfollow){
				$('.btns_group a.care_btn').addClass('.cared').text('已关注');
			}
		}
	})();
	
})