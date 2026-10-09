var atpage = 1, pageSize = 10, total = 0, totalPage = 0;
var isload = 0;
var objId = $("#list");
var arcrank = '';
$(function(){



    getList()
    //筛选展开
	$('.navFilterItem h3').click(function(e){
		var par = $(this).closest('.navFilterItem');
		$('.navFilterDown').removeClass('show')
		if(!par.hasClass('curr')){
			par.addClass('curr');
			par.find('.navFilterDown').addClass('show');
		}else{
			par.removeClass('curr');
			par.find('.navFilterDown').removeClass('show');
		}

		$(document).click(function(){

			$('.navFilterItem').removeClass('curr');
			$('.navFilterDown').removeClass('show');

		})
		e.stopPropagation();
	})

    //点击筛选
	$(".navFilterDown p").bind("click", function(e){
		var par = $(this).closest('.navFilterItem');
		var t = $(this), id = t.find('a').attr("data-id");
		var txt = t.find('a').text();
		par.find('h3 a').text(txt);
		if(!t.hasClass("active")){
			atpage = 1;
			t.addClass("active").siblings("p").removeClass("active");
			getList();
		}
		par.removeClass('curr');
		par.find('.navFilterDown').removeClass('show');

	});



    $(".nav-tabs li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("active") && !t.hasClass("add")){
			arcrank = id;
			atpage = 1;
			t.addClass("active").siblings("li").removeClass("active");
			getList();
		}
	
	});


    // 商品下架
    
    var options = {
        btnSure : '确定',
        title:'确认结束该拍卖？',
        // btnTrggle:true,
        isShow:true,
    }
    $("body").delegate(".offShelf.del", "click", function(){
        var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
        if(id){
            confirmPop(options,function(){
                // 点击确认按钮
                $.ajax({
                    url: "/include/ajax.php?service=paimai&action=offShelf&ids="+id,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data.state == 100){
                            $.dialog.alert(data.info)
                            isload = false;
                            atpage = 1;
                            getList()
                        }else{
                            $.dialog.alert(data.info)
                        }
                    },
                    error: function(){
                        $.dialog.alert(data.info)
                    }
                })
            })

            
        }
    })
    $("body").delegate(".offShelf.end", "click", function(){
        var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
        if(id){
            confirmPop(options,function(){
                // 点击确认按钮
                $.ajax({
                    url: "/include/ajax.php?service=paimai&action=offShelf&ids="+id,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data.state == 100){
                            $.dialog.alert(data.info)
                            isload = false;
                            atpage = 1;
                            getList()
                        }else{
                            $.dialog.alert(data.info)
                        }
                    },
                    error: function(){
                        $.dialog.alert(data.info)
                    }
                })
            })

            
        }
    })



})





function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();
    var typeitem = $('.typeitem .navFilterDown p.active').find('a').attr('data-id');
    var keyword = $('#searchTit').val();
	$.ajax({
		url: "/include/ajax.php?service=paimai&action=getList&u=1&typeid="+typeitem+"&arcrank="+arcrank+"&title="+keyword+"&page="+atpage+"&pageSize="+pageSize,
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
									sta       = list[i].state,
									url       = state == 1 ? list[i].url : "javascript:;",
									sales     = list[i].sales,
									comment   = list[i].comment,
									inventory = list[i].inventory,
									litpic    = list[i].litpic,
									date      = list[i].pubdate,
									editdate  = huoniao.transTimes(list[i].editdate, 1),
									time      = huoniao.transTimes(list[i].upshelftime, 1),
									cText = (state == 0 || state == 2) ? '创建时间:' + date : '上架时间:' + time;
							html.push('<div class="item fn-clear" data-id="'+id+'">');
							if(litpic != ""){
								html.push('<div class="p"><a href="'+url+'" target="_blank"><i></i><img src="'+huoniao.changeFileSize(litpic, "small")+'" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';"/></a></div>');
							}
							 html.push('<div class="o">');
                            if(new Date(list[i].startdate.replace(/-/g,'/')).getTime() <= new Date().getTime() && new Date(list[i].enddate.replace(/-/g,'/')).getTime() >= new Date().getTime()){
                                html.push('<a href="javascript:;" class="offShelf end"><i></i>结束拍卖</a>');
                            }else if(list[i].arcrank == 0){
                            	html.push('<a href="javascript:;" class="offShelf">待审核</a>');
                            }else if(list[i].arcrank == 2){
                            	html.push('<a href="javascript:;" class="offShelf">审核拒绝</a>');
                            }else if(list[i].arcrank == 1){
                                html.push('<a href="javascript:;" class="offShelf del"><i></i>结束拍卖</a>');
                            }else{
                                html.push('<a href="javascript:;" class="offShelf">已结束</a>');
                            }
                            if(list[i].arcrank == 0 || list[i].arcrank == 2){
                                html.push('<a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a>');
                            }
							html.push('</div>');
							html.push('<div class="i">');

							html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a></h5>');

                            html.push('<p>发布时间：'+list[i].pubdate+'&nbsp;&nbsp;·&nbsp;&nbsp;竞拍开始时间：'+list[i].startdate+'&nbsp;&nbsp;·&nbsp;&nbsp;竞拍结束时间：'+list[i].enddate+'</p>')
							html.push('</div>');
							html.push('</div>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					totalCount = pageInfo.totalCount;

					switch(state){
						case "0":
							totalCount = pageInfo.gray;
							break;
						case "1":
							totalCount = pageInfo.audit;
							break;
						case "2":
							totalCount = pageInfo.refuse;
							break;
					}


					$("#audit0").html(pageInfo.state0);
					$("#audit1").html(pageInfo.state1);
					$("#refuse").html(pageInfo.state2);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}

function CheckInfo() {
    if (event.keyCode == 13) {
        atpage = 1;
		getList();
    }
}