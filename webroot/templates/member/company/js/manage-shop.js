/**
 * 会员中心商城商品列表
 * by guozi at: 20160419
 */

var objId = $("#list");
$(function(){

	$(".nav-tabs li[data-id='"+state+"']").addClass("active");

	
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
			state = id;
			atpage = 1;
			t.addClass("active").siblings("li").removeClass("active");
			if(id == '0'){
		        $(".upselfTime,.createTime").addClass('fn-hide')
		        $(".updateTime").removeClass('active').click()
		        $(".updateTime").removeClass('fn-hide')
		      }else if(id == '1'){
		        $(".createTime").addClass('fn-hide')
		        $(".upselfTime,.updateTime").removeClass('fn-hide')
		        $(".updateTime").removeClass('active').click()
		      }else{
		         $(".createTime").removeClass('fn-hide')
		         $(".createTime").eq(0).click()
		         $(".upselfTime,.updateTime").removeClass('active').addClass('fn-hide')
		      }
		}
		// if(!t.hasClass("active") && !t.hasClass("add")){
		// 	state = id;
		// 	atpage = 1;
		// 	t.addClass("active").siblings("li").removeClass("active");
		// 	getList();
		// }
	});
	//搜索
	$('.searchItem button').click(function(){
		atpage = 1;
		getList();
	})


	getList(1);

	//下架
	objId.delegate(".offShelf", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][27][116], function(){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=shop&action=offShelf&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							t.siblings("a").show();
							t.removeClass("load").html(langData['siteConfig'][27][117]);
							setTimeout(function(){getList(1);}, 1000);
						}else{
							$.dialog.alert(data.info);
							t.siblings("a").show();
							t.removeClass("load");
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			});
		}
	});

	//上架
	objId.delegate(".upShelf", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			t.siblings("a").hide();
			t.addClass("load");

			$.ajax({
				url: masterDomain+"/include/ajax.php?service=shop&action=upShelf&id="+id,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						t.siblings("a").show();
						t.removeClass("load").html(langData['siteConfig'][27][118]);
						setTimeout(function(){getList(1);}, 1000);
					}else{
						$.dialog.alert(data.info);
						t.siblings("a").show();
						t.removeClass("load");
					}
				},
				error: function(){
					$.dialog.alert(langData['siteConfig'][20][183]);
					t.siblings("a").show();
					t.removeClass("load");
				}
			});
		}
	});

});
function CheckInfo() {
    if (event.keyCode == 13) {
        atpage = 1;
		getList();
    }
}
function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();
	var orderbyitem = $('.orderitem .navFilterDown p.active').find('a').attr('data-id');
    var typeitem = $('.typeitem .navFilterDown p.active').find('a').attr('data-id');
    var shopitem = $('.shopitem .navFilterDown p.active').find('a').attr('data-id');
    var saleitem = $('.saleitem .navFilterDown p.active').find('a').attr('data-id');
    var keyword = $('#searchTit').val();
	$.ajax({
		url: masterDomain+"/include/ajax.php?service=shop&action=slist&u=1&orderby="+orderbyitem+"&typeid="+typeitem+"&typesales="+saleitem+"&shoptypeid="+shopitem+"&title="+keyword+"&state="+state+"&page="+atpage+"&pageSize="+pageSize,
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
									date      = huoniao.transTimes(list[i].pubdate, 1),
									editdate  = huoniao.transTimes(list[i].editdate, 1),
									time      = huoniao.transTimes(list[i].upshelftime, 1),
									cText = (state == 0 || state == 2) ? '创建时间：' + date : '上架时间：' + time;
							html.push('<div class="item fn-clear" data-id="'+id+'">');
							if(litpic != ""){
								html.push('<div class="p"><a href="'+url+'" target="_blank"><i></i><img src="'+huoniao.changeFileSize(litpic, "small")+'" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';"/></a></div>');
							}
							html.push('<div class="o"><a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a>');
							if(sta == "1"){
								html.push('<a href="javascript:;" class="offShelf"><s></s>'+langData['siteConfig'][19][558]+'</a>');
							}else if(sta == "2"){
								html.push('<a href="javascript:;" class="upShelf"><s></s>'+langData['siteConfig'][26][166]+'</a>');
							}
							html.push('</div>');
							html.push('<div class="i">');

							html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a></h5>');

							var arcrank = "";
							if(sta == "0"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][26][74]+'</span>';
							}else if(sta == "1"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][26][167];
							}else if(sta == "2"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][26][168]+langData['siteConfig'][19][558]+'</span>';
							}

							html.push('<p style="line-height: 1.6;">销售类型：'+list[i].typesalesname+'<br />'+langData['siteConfig'][11][8]+'：'+editdate+'&nbsp;&nbsp;·&nbsp;&nbsp;'+cText+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['shop'][3][16]+'：'+sales+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][525]+'：'+inventory+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][6][114]+'：'+comment+arcrank+'</p>');
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


					$("#audit").html(pageInfo.audit);
					$("#gray").html(pageInfo.gray);
					$("#refuse").html(pageInfo.refuse);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
