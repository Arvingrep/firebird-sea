/**
 * 会员中心贴吧帖子列表
 * by guozi at: 20161124
 */

var objId = $("#list");
$(function(){

	getList(1);
	//删除
	$('.btnBox').delegate("a", "click", function(){
		if($('.btnBox').hasClass('disabled')) return false;
		var t = $(this);
		
			$.dialog.confirm(langData['renovation'][8][37], function(){   //确定要结束招标吗?

				$.ajax({
					url: "/include/ajax.php?service=huodong&action=del",
					type: "GET",
					dataType: "json",
					success: function (data) {
						if(data && data.state == 100){

							t.html(langData['renovation'][8][36]);//招标已结束
							$('.btnBox').addClass('disabled');

						}else{
							$.dialog.alert(data.info);
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);   //
					}
				});
			});
		
	});

});

function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');//加载中，请稍候
	$(".pagination").hide();

	$.ajax({
		url: "/include/ajax.php?service=renovation&action=store&u=1&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "json",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
					totalCount = pageInfo.totalCount;
					//拼接列表
					if(list.length > 0){

						for(var i = 0; i < list.length; i++){
							var item     = [],
								id       = list[i].id,
								company    = list[i].company,															
								pic    = list[i].logo,															
								url      = list[i].url,								
								safeguard   = list[i].safeguard,								
								certi      = list[i].certi,								
								diaryCount      = list[i].diaryCount,								
								teamCount      = list[i].teamCount,								
								pubdate  = huoniao.transTimes(list[i].pubdate, 1);							

							html.push('<div class="item fn-clear" data-id="'+id+'">');
							html.push('<a href="'+url+'">');
							html.push('<div class="p">');                        
							                        
                            html.push('<img src="'+pic+'" alt="">');
                            
                            html.push('</div>');							
							
                            html.push('<div class="right_b">');
                            html.push('<div class="com1">');
                            html.push('<h4 class="com_type">'+company+'</h4>');
                            if(safeguard > 0){
                                 html.push('<span class="defend"></span>'); 
                            }
                            if (certi == 1) {
                                html.push('<span class="certify"></span>'); 
                            }                
                            html.push('</div>'); 
                            html.push('<ul class="right_ul">');                 
                            html.push('<li>'+langData['renovation'][0][24]+'：<span>'+diaryCount+'</span></li>'); //  案例              
                            html.push('<li>'+langData['renovation'][0][25]+'：<span>321</span></li>'); //   工地             
                            html.push('<li>'+langData['renovation'][0][4]+'：<span>'+teamCount+'</span></li>');   //     设计师    
                            html.push('<li>'+langData['renovation'][0][34]+'：<span>'+teamCount+'</span></li>');   //     工长         
                            html.push('</ul>');                                     
                            html.push('</div>');                                     
                            html.push('<p class="apply">'+langData['renovation'][8][34]+'</p>');//查看主页  
                            html.push('</a>');                               
                            html.push('</div> ');   


						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
					}

					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
			}
		}
	});
}
