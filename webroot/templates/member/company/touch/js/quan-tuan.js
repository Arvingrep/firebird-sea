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
    	//撤消
    	objId.delegate(".cancel", "click", function(){
    		var t = $(this), par = t.closest(".QuanBox"), id = par.attr("data-id");
    		if(id){
                if (confirm(langData['siteConfig'][20][457])==true){
    				$.ajax({
    					url: masterDomain+"/include/ajax.php?service=tuan&action=cancelQuan&ids="+id,
    					type: "GET",
    					dataType: "jsonp",
    					success: function (data) {
    						if(data && data.state != 200){

    							//删除成功后移除信息层并异步获取最新列表
    							par.slideUp(300, function(){
    								par.remove();
                                    alert(langData['siteConfig'][20][444]);
    								setTimeout(function(){getList(1);}, 200);
    							});

    						}else{
    							alert(langData['siteConfig'][21][72]);
    						}
    					},
    					error: function(){
		                   alert(langData['siteConfig'][20][183]);
    					}
    				});
    			}
    		}
    	});

    });

    function getQueryVariable(variable){
           var query = window.location.search.substring(1);
           var vars = query.split("&");
           for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
           }
           return '';
    }

    function getList(is){
        if (objId.html() == "") {
            objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
        }
        isload = true;

        var ordernum = getQueryVariable('ordernum');

    	$.ajax({
    		url: masterDomain+"/include/ajax.php?service=tuan&action=quanList&ordernum="+ordernum+"&page="+atpage+"&pageSize="+pageSize,
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
    									ordernum = list[i].ordernum,
    									cardnum  = list[i].cardnum,
    									usedate  = huoniao.transTimes(list[i].usedate, 1),
    									pro      = list[i].pro,
    									title    = pro.title,
    									url      = pro.url,
    									price    = list[i].price,
    									product  = title != "" ? '<a href="'+url+'" target="_blank">'+title+'</a>' : "";

                                html.push('<div class="QuanBox fn-clear" data-id="'+id+'">');
                                html.push('<div class="BoxLeft">');
                                html.push('<div class="QTitle">'+product+'</div>');
                                html.push('<div class="QInfo"><em>'+langData['siteConfig'][5][15]+'</em>'+cardnum+'</div>');
                                html.push('<div class="QInfo"><em>'+langData['siteConfig'][16][156]+'</em>'+usedate+'</div>');
                                html.push('<div class="QInfo"><em>'+langData['siteConfig'][19][308]+'</em>'+ordernum+'</div>');
                                html.push('</div>');
                                html.push('<div class="BoxRight">');
                                html.push('<p><em>'+echoCurrency('symbol')+'</em>'+price+'</p>');
    							html.push('<a href="javascript:;" class="cancel">'+langData['siteConfig'][6][165]+'</a>');
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
