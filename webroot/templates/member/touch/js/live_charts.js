$(function(){
	getList(1,'0');
	
	// 切换
	$(".tab_box li").click(function(){
		var t = $(this),index = t.index(),type = t.attr('data-type');
		t.addClass('on_chose').siblings("li").removeClass("on_chose");
		$(".chartlist .chart_box").eq(index).removeClass("fn-hide").siblings(".chart_box").addClass("fn-hide");
		getList(1,type);
	});
	
	
	$(window).scroll(function(){
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w;
		var isload = $(".chart_box:not(.fn-hide)").attr("data-load");
		if ($(window).scrollTop() > scroll && isload=='0') {
			type = $(".tab_box  li.on_chose").attr('data-type');
			getList('',type)
		};
	})
	
	function getList(is,type){
		var atpage = $(".chart_box").not(".fn-hide").attr('data-page'),
		 isload = $(".chart_box").not(".fn-hide").attr('data-load'),
		 totalCount = $(".chart_box").not(".fn-hide").attr('data-count');
		var objId = $(".chart_box").not(".fn-hide");
		if(isload) return false;
		$(".chart_box").not(".fn-hide").attr('data-load','1')
		if(is != 1){
			$('html, body').animate({scrollTop: $(".live_head").offset().top}, 300);
		}
	
		objId.find('.loading').text(langData['siteConfig'][20][184]);  //加载中，请稍候
		var action = type=='0'?"getRewardList":"getShareList";
		$.ajax({
			url: "/include/ajax.php?service=live&action="+action+"&liveid="+chatid+"&pageSize="+pageSize+"&page="+atpage+"&keyword="+keywords,
			type: "GET",
			dataType: "json",
			success: function (data) {
				if(data && data.state != 200){
					if(data.state != 100){
						objId.find('.loading').text(langData['siteConfig'][20][126]);  // //暂无相关信息！
					}else if(data.state == 100){
						var list = data.info, pageInfo = data.info.pageInfo, html = [];
						var px_num = (atpage-1)*pageSize;
						var totalPage = 1;
						$(".invite_count em").text(list.length);
						//拼接列表
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){
								var item     = [],
									id       = list[i].user.userid,
									photo    = list[i].user.photo,
									url      = masterDomain+'user/'+id,
									nickname = list[i].user.nickname,
									px_num = px_num + 1;
									var cls = '',px = '';
									if(px_num==1){
										cls = 'first_li';
										px = '';
									}else if(px_num==2){
										cls = 'second_li';
										px = '';
									}else if(px_num==3){
										cls = 'third_li';
										px = '';
									}else{
										px = px_num;
									}
			
								html.push('<li class="chart_li">');
								html.push('<div class="chart_user fn-clear" >');
								html.push('<i class="px fn-left">'+px+'</i>');
								html.push('<a class="uimg fn-left" href="'+url+'"><img src="'+photo+'" onerror="this.src=\'/static/images/noPhoto_40.jpg\'"></a>');
								html.push('<div class="uinfo">');
								html.push('<h4>'+nickname+'</h4><p>ID：'+id+' </p></div>');
								if(type == '0'){
								html.push('</div><div class="chart_num">'+Number(list[i].sumamount).toFixed(2)+'</div></li>');
								}else{
									html.push('</div><div class="chart_num">'+list[i].scount+'</div></li>');
								}
								
	
							}
	
							objId.find("ul").html(html.join(""));
							atpage++
							$(".chart_box").not(".fn-hide").attr('data-load','');
							$(".chart_box").not(".fn-hide").attr('data-page',atpage);
							objId.find('.loading').html('')
							 if(atpage > totalPage){
								 $(".chart_box").not(".fn-hide").attr('data-load','1');
								 objId.find('.loading').text(langData['live'][5][10]);  //没有更多了
							 }
							
						}else{
							objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>"); //暂无相关信息！
						}
	
					
					}
				}else{
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>"); //暂无相关信息！
				}
			}
		}); 
	}
})