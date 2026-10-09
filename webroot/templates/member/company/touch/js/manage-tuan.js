$(function(){
    var objId = $(".TuanList") , isload = false;
    $(function(){

    	$(".nav-tabs li[data-id='"+state+"']").addClass("navBC");

    	$(".nav-tabs li").bind("click", function(){
    		var t = $(this), id = t.attr("data-id");
    		if(!t.hasClass("navBC") && !t.hasClass("add")){
    			state = id;
    			atpage = 1;
    			t.addClass("navBC").siblings("li").removeClass("navBC");
                isload = false;
    			getList();
    		}
    	});

    	getList(1);

        // 上拉加载
    	$(window).scroll(function() {
    		var allh = $('.TuanList').height();
    		var w = $(window).height();
    		var scroll = allh  - w;
    		if ($(window).scrollTop() > scroll && !isload) {
    				atpage++;
                    var state = $(".nav-tabs li.navBC").attr("data-id");
    				load();
    		};
    	});

    	//删除
    	objId.delegate(".del", "click", function(){
    		var t = $(this), par = t.closest(".TuanBox"), id = par.attr("data-id");
    		if(id){
                var result = confirm("确定后将会删除所有订单和评论。\r\n如果此商品下有未消费的团购券或订单请先进行退款操作，以免产生用户投诉。");
                if(result){
                   $.ajax({
                       url: masterDomain+"/include/ajax.php?service=tuan&action=del&id="+id,
                       type: "GET",
                       dataType: "json",
                       success: function (data) {
                           if(data && data.state == 100){

                               //删除成功后移除信息层并异步获取最新列表
                               par.slideUp(300, function(){
                                   par.remove();
                                   setTimeout(function(){getList(1);}, 200);
                               });
                               alert(langData['siteConfig'][20][444]);

                           }else{
                               alert(data.info);
                           }
                       },
                       error: function(){
                           alert(langData['siteConfig'][20][183]);
                       }
                   });

                }else{
                }
    		}
    	});

        //下架
        objId.delegate(".offshelf", "click", function(){
            var t = $(this), par = t.closest(".TuanBox"), id = par.attr("data-id");
            if(id){
                var result = confirm("确定要下架吗？");
                if(result){
                    $.ajax({
                        url: masterDomain+"/include/ajax.php?service=tuan&action=offshelf&id="+id,
                        type: "GET",
                        dataType: "json",
                        success: function (data) {
                            if(data && data.state == 100){

                                //下架成功后异步获取最新列表
                                setTimeout(function(){getList(1);}, 200);
                                alert("下架成功");

                            }else{
                                alert(data.info);
                            }
                        },
                        error: function(){
                            alert("下架失败");
                        }
                    });

                }else{
                }
            }
        });

        //上架
        objId.delegate(".onshelf", "click", function(){
            var t = $(this), par = t.closest(".TuanBox"), id = par.attr("data-id");
            if(id){
                var result = confirm("确定要上架吗？");
                if(result){
                    $.ajax({
                        url: masterDomain+"/include/ajax.php?service=tuan&action=onshelf&id="+id,
                        type: "GET",
                        dataType: "json",
                        success: function (data) {
                            if(data && data.state == 100){

                                //上架成功后异步获取最新列表
                                setTimeout(function(){getList(1);}, 200);
                                alert("上架成功");

                            }else{
                                alert(data.info);
                            }
                        },
                        error: function(){
                            alert("上架失败");
                        }
                    });

                }else{
                }
            }
        });

    });
    function load(){

        objId.append('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
        isload = true;

        $.ajax({
            url: masterDomain+"/include/ajax.php?service=tuan&action=tlist&u=1&orderby=5&state="+state+"&page="+atpage+"&pageSize="+pageSize,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state != 200){
                    if(data.state == 101){
                        objId.html("<p class='loading'>"+data.info+"</p>");
                    }else{
                        isload = true;
                        $('.loading').remove();
                        var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

                        //拼接列表
                        if(list.length > 0){

                            var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
                            var param = t + "do=edit&id=";
                            var urlString = editUrl + param;

                            for(var i = 0; i < list.length; i++){
                                var item      = [],
                                        id        = list[i].id,
                                        title     = list[i].title,
                                        startdate = huoniao.transTimes(list[i].startdate, 1),
                                        enddate   = huoniao.transTimes(list[i].enddate, 1),
                                        url       = list[i].url,
                                        buynum    = list[i].buynum,
                                        common    = list[i].common,
                                        litpic    = list[i].litpic;

                                html.push('<div class="TuanBox" data-id="'+id+'"><div class="Info fn-clear"><a href="'+url+'">');
                                if(litpic != ""){
                                    html.push('<div class="tuanIMG"><img src="'+litpic+'" alt=""></div>');
                                }
                                html.push('<div class="tuanTitle">'+title+'</div>');
                                html.push('<div class="tuanNumber"><span>'+langData['siteConfig'][19][518]+' <em>'+buynum+'</em></span>&nbsp;&nbsp;&nbsp;<span>'+langData['siteConfig'][6][114]+' <em>'+common+'</em></span></div>');
                                html.push('<div class="time">'+langData['siteConfig'][17][34]+'  <em>'+startdate+'</em></div>');
                                html.push('<div class="time">'+langData['siteConfig'][19][310]+'  <em>'+enddate+'</em></div>');

                                if(list[i].arcrank == "0"){
                                    html.push( '<div class="shen">'+langData['siteConfig'][19][556]+'</div>')
                                }else if(list[i].arcrank == "1"){
                                    html.push( '<div class="shen weishen">'+langData['siteConfig'][19][392]+'</div>')
                                }else if(list[i].arcrank == "2"){
                                    html.push( '<div class="shen">'+langData['siteConfig'][9][35]+'</div>')
                                }else if(list[i].arcrank == "3"){
                                    html.push( '<div class="shen weishen">'+langData['siteConfig'][19][507]+'</div>')
                                }
                                html.push('</a></div>');
                                html.push('<div class="TuanBtn fn-clear">');
                                html.push('<ul>');
                                // html.push('<li class="del"><a href="javascript:;">'+langData['siteConfig'][6][8]+'</a></li>');
                                if(list[i].arcrank== "1"){
                                    html.push('<li class="offshelf"><a href="javascript:;">'+'下架'+'</a></li>');
                                }
                                else if(list[i].arcrank=="6"){
                                    html.push('<li class="onshelf"><a href="javascript:;">'+'上架'+'</a></li>');
                                }
                                html.push('<li class="edit"><a href="'+urlString+id+'">'+langData['siteConfig'][6][8]+'</a></li>');
                                html.push('</ul>');
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
                            objId.append("<p class='loading'>"+langData['siteConfig'][20][185]+"</p>");
                            isload = true;
                        }

                    }
                }else{
                    objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
                    isload = true;
                }
            }
        });
    }

    function getList(is){

    	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');

    	$.ajax({
    		url: masterDomain+"/include/ajax.php?service=tuan&action=tlist&u=1&orderby=5&state="+state+"&page="+atpage+"&pageSize="+pageSize,
    		type: "GET",
    		dataType: "jsonp",
    		success: function (data) {
    			if(data && data.state != 200){
    				if(data.state == 101){
    					objId.html("<p class='loading'>"+data.info+"</p>");
    				}else{
    					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

    					//拼接列表
    					if(list.length > 0){

    						var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
    						var param = t + "do=edit&id=";
    						var urlString = editUrl + param;

    						for(var i = 0; i < list.length; i++){
    							var item      = [],
    									id        = list[i].id,
    									title     = list[i].title,
    									startdate = huoniao.transTimes(list[i].startdate, 1),
    									enddate   = huoniao.transTimes(list[i].enddate, 1),
    									url       = list[i].url,
    									buynum    = list[i].buynum,
    									common    = list[i].common,
    									litpic    = list[i].litpic;

                                if(list[i].arcrank != "1") url = "javascript:;";

    							html.push('<div class="TuanBox" data-id="'+id+'"><div class="Info fn-clear"><a href="'+url+'">');
    							if(litpic != ""){
    								html.push('<div class="tuanIMG"><img src="'+litpic+'" alt=""></div>');
    							}
                                html.push('<div class="tuanTitle">'+title+'</div>');
                                html.push('<div class="tuanNumber"><span>'+langData['siteConfig'][19][518]+' <em>'+buynum+'</em></span>&nbsp;&nbsp;&nbsp;<span>'+langData['siteConfig'][6][114]+' <em>'+common+'</em></span></div>');
                                html.push('<div class="time">'+langData['siteConfig'][17][34]+'  <em>'+startdate+'</em></div>');
                                html.push('<div class="time">'+langData['siteConfig'][19][310]+'  <em>'+enddate+'</em></div>');

                                if(list[i].arcrank == "0"){
                                    html.push( '<div class="shen">'+langData['siteConfig'][19][556]+'</div>')
                                }else if(list[i].arcrank == "1"){
                                    html.push( '<div class="shen weishen"><font color="#1dc11d">出售中</font></div>')
                                }else if(list[i].arcrank == "2"){
                                    html.push( '<div class="shen">'+langData['siteConfig'][9][35]+'</div>')
                                }else if(list[i].arcrank == "3"){
                                    html.push( '<div class="shen weishen">'+langData['siteConfig'][19][507]+'</div>')
                                }else if(list[i].arcrank == "6"){
                                    html.push( '<div class="shen weishen"><font color="#ff9419">已下架</font></div>')
                                }
                                html.push('</a></div>');
                                html.push('<div class="TuanBtn fn-clear">');
                                html.push('<ul>');
                                // html.push('<li class="del"><a href="javascript:;">'+langData['siteConfig'][6][8]+'</a></li>');
                                if(list[i].arcrank== "1"){
                                    html.push('<li class="offshelf"><a href="javascript:;">'+'立即下架'+'</a></li>');
                                }
                                else if(list[i].arcrank=="6"){
                                    html.push('<li class="onshelf"><a href="javascript:;">'+'立即上架'+'</a></li>');
                                }
                                html.push('<li class="edit"><a href="'+urlString+id+'">'+langData['siteConfig'][6][6]+'</a></li>');
                                html.push('</ul>');
                                html.push('</div>');
                                html.push('</div>');
    						}

    						objId.html(html.join(""));

    					}else{
    						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
    					}

    					switch(state){
    						case "":
    							totalCount = pageInfo.totalCount;
    							break;
    						case "0":
    							totalCount = pageInfo.gray;
    							break;
    						case "1":
    							totalCount = pageInfo.audit;
    							break;
    						case "2":
    							totalCount = pageInfo.refuse;
    							break;
    						case "3":
    							totalCount = pageInfo.finish;
    							break;
                            case "6":
                                totalCount = pageInfo.offshelf;
    					}


    					$("#total").html(pageInfo.totalCount);
    					$("#audit").html(pageInfo.audit);
    					$("#gray").html(pageInfo.gray);
    					$("#refuse").html(pageInfo.refuse);
    					$("#finish").html(pageInfo.finish);
    					$("#offshelf").html(pageInfo.offshelf);
    				}
    			}else{
    				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
    			}
    		}
    	});
    }

})
