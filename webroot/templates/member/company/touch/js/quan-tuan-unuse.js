$(function(){
    var objId = $(".QuanList"), isload = false;;
    $(function(){

    	getList(1);
        // 上拉加载
        $(window).scroll(function() {
            var allh = $('.QuanList').height();
            var w = $(window).height();
            var scroll = allh  - w;
            if ($(window).scrollTop() > scroll && !isload) {
                    atpage++;
                    getList();
            };
        });
    });

    function getList(is){
        if (objId.html() == "") {
            objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
        }
        isload = true;

    	$.ajax({
    		url: masterDomain+"/include/ajax.php?service=tuan&action=quanList&type=unuse&page="+atpage+"&pageSize="+pageSize,
    		type: "GET",
    		dataType: "jsonp",
    		success: function (data) {
    			if(data && data.state != 200){
    				if(data.state == 101){
    					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
    				}else{
                        isload = true;
                        $('.loading').remove();
    					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

    					//拼接列表
    					if(list.length > 0){

    						for(var i = 0; i < list.length; i++){
    							var     item     = [],
    									id       = list[i].id,
                                        carddate = huoniao.transTimes(list[i].carddate, 1),
    									expireddate = huoniao.transTimes(list[i].expireddate, 1),
    									pro      = list[i].pro,
    									title    = pro.title,
    									url      = pro.url,
    									price    = list[i].price,
    									product  = title != "" ? '<a href="'+url+'" target="_blank">'+title+'</a>' : "";

                                html.push('<div class="QuanBox fn-clear" data-id="'+id+'">');
                                html.push('<div class="BoxLeft">');
                                html.push('<div class="QTitle">'+product+'</div>');
                                html.push('<div class="QInfo"><em>'+langData['siteConfig'][19][53]+'</em>'+carddate+'</div>');
                                html.push('<div class="QInfo"><em>'+langData['siteConfig'][19][530]+'</em>'+expireddate+'</div>');
                                html.push('</div>');
                                html.push('<div class="BoxRight">');
                                html.push('<p style="margin-top:.6rem;"><em>'+echoCurrency('symbol')+'</em>'+price+'</p>');
                                html.push('</div>');
                                html.push('</div>');
    						}
                            objId.append(html.join(""));
                            totalPage = pageInfo.totalPage;
                             if(atpage <= totalPage){
                                 isload = false;
                             }else{
                                 isload = true;
                             }

    					}else{
                            isload = true;
                            if (objId.html() == "") {
                                objId.append("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
                            }else{
                                objId.append("<p class='loading'>"+langData['siteConfig'][20][185]+"</p>");
                            }
    					}

    				}
    			}else{
    				objId.append("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
    			}
    		}
    	});
    }

})
