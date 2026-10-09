/**
 * 会员中心贴吧帖子列表
 * by guozi at: 20161124
 */

var objId = $("#list");
$(function(){
	$(".main-tab li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr") && !t.hasClass("add")){
			state = id;
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
			getList();
		}
	});
	getList(1);

});

function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');//加载中，请稍候
	$(".pagination").hide();

    if (state == 1) {
                 
		url =  "/include/ajax.php?service=renovation&action=rese&u=1&resetype=0&page="+atpage+"&pageSize=8";

    }else if(state == 2){



		url = "/include/ajax.php?service=renovation&action=rese&u=1&resetype=1&page="+atpage+"&pageSize=8";

	}else if(state == 3){
		url = "/include/ajax.php?service=renovation&action=construction&u=1&page="+atpage+"&pageSize=8";

	}

	$.ajax({
		url: url,
		type: "GET",
		dataType: "jsonp",
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
								community    	= list[i].community,
								company    		= list[i].company,
								// url      		= list[i].url,
								safeguard      	= list[i].safeguard,
								certi      		= list[i].certi,
								pubdate  		= huoniao.transTimes(list[i].pubdate, 1);
							if(state == 1 || state == 2){

								if(list[i].type ==0){
									listpic = list[i].author.logo;
								}else{
									listpic = list[i].author.photo;
								}
                                html.push(' <div class="item fn-clear" data-id="'+id+'">');
                                html.push('    <a href="'+list[i].author.domain+'" target="_blank">');
                                html.push('      <div class="com_bottom"> ');                     
                                html.push('        <div class="left_b">');
                                html.push('          <img src="'+listpic+'" alt="">');
                                html.push('         </div>');
                                html.push('       <div class="right_b">');
                                html.push('         <div class="com1">');
                                html.push('           <h4 class="com_type">'+list[i].designer+'</h4>');
                                if(safeguard > 0){
                                 	html.push('<span class="defend"></span>'); 
	                            }
	                            if (certi == 1) {
	                                html.push('<span class="certify"></span>'); 
	                            }
                                html.push('         </div>');
                                html.push('         <ul class="right_ul">');
                                if(action = 1){//在线预约有三种情况
                                	if(list[i].type ==2){//设计师
	                                    //1年工作经验 -- 暂无工作经验
	                                    var works='',caseNum='';
	                                    works = list[i].works>0?langData['renovation'][14][70].replace('1',list[i].works):langData['renovation'][14][72];
	                                    //1套设计案例 --暂无案例 
	                                    caseNum = list[i].case>0?langData['renovation'][14][100].replace('1',list[i].case):langData['renovation'][14][73];

	                                    html.push('<li>'+works+'</li>');
	                                    html.push('<li>'+caseNum+'</li>');
	                                    
	                                }else if(list[i].type ==1){//工长
	                                    html.push('<li>安徽芜湖</li>');
	                                    //1年工龄 -- 暂无工作经验
	                                    var works = list[i].works > 0?langData['renovation'][14][94].replace('1',list[i].works):langData['renovation'][14][72];
	                                    //1套案例 --暂无案例 
	                                    var caseNum = list[i].case > 0?langData['renovation'][14][71].replace('1',list[i].case):langData['renovation'][14][73];

	                                    html.push('<li>'+works+'</li>');
	                                    html.push('<li>'+caseNum+'</li>');

	                                }else{//公司
										html.push('<li>'+langData['renovation'][0][24]+':'+list[i].author.caseCount+'</li>'); //  案例
										html.push('<li>'+langData['renovation'][0][25]+':'+list[i].author.diaryCount+'</li>'); //   工地
										html.push('<li>'+langData['renovation'][0][4]+':'+list[i].author.teamCount+'</li>');   //     设计师
	                                }
                                }else{
	                                html.push('                 <li>'+langData['renovation'][0][24]+':'+list[i].diaryCount+'</li>'); //  案例              
	                                html.push('                 <li>'+langData['renovation'][0][25]+':321</li>'); //   工地             
	                                html.push('                 <li>'+langData['renovation'][0][4]+':'+list[i].teamCount+'</li>');   //     设计师 
	                                }
	                                html.push('         </ul>');
	                                html.push('       </div>');
	                                html.push('       <p class="apply">'+langData['renovation'][8][34]+'</p>');//查看主页
	                                html.push('        </div>'); 
	                                html.push('    </a>');                       
	                                html.push(' </div>');

                            }else{
                            	html.push('<div class="item fn-clear vill_site" data-id="'+id+'">');
                                html.push('    <a href="'+list[i].url+'" target="_blank">');
                                html.push('      <div class="left_img"><img src="'+list[i].constructionetail.communitylitpic+'" alt=""></div>');
                                html.push('      <div class="r_content">');             
                                html.push('          <h3 class="vill_title">'+list[i].constructionetail.title+'</h3>');
                                html.push('          <p class="vill_info2"><span class="area">'+list[i].constructionetail.area+'</span>M²/'+list[i].constructionetail.budget+'/'+list[i].constructionetail.style+'</p>');
                                html.push('      <p class="visit">'+langData['renovation'][1][8]+'</p>');//查看工地
                                html.push('    </div>'); 
                                html.push('    </a>');                       
                                html.push(' </div>');
                            }

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
