$(function(){
  //查看地图
   $('.appMapBtn').attr('href', OpenMap_URL);
  // 切换
  $(".tabBox li").click(function(){
    var t = $(this)
    var ind = t.index();
    t.addClass('curr').siblings('li').removeClass('curr');
    $(".listBox .dataCon").eq(ind).removeClass('fn-hide').siblings('.dataCon').addClass('fn-hide')
    if($(".listBox .dataCon").eq(ind).find('li').length == 0){
      getShopList(ind)
    }
  });


getShopList()



  // 获取数据
function getShopList(type){
  var industry = $(".shaiBox li.curr").attr('data-id'); //分类
  industry = industry ? industry : '';
  var busId = 0; //商圈id
  var dom = $('.listBox .dataCon').not('.fn-hide');
  var spage = dom.attr('data-page');
      spage = Number(spage)
  var isload = Number(dom.attr('data-load'));
  if(isload) return false;
  isload = 1;
  var url = !type ?　'/include/ajax.php?service=shop&action=slist&pageSize=10&page='+spage : "/include/ajax.php?service=shop&action=store&pageSize=10&business="+busId+"&industry="+industry+"&page="+spage;
  $.ajax({
    url: url,
    type: "GET",
    dataType: "jsonp",
    success: function (data) {
      if(data.state == 100){
        var html = [],list = data.info.list;
        var totalCount = data.info.pageInfo.totalCount;
        for(var i = 0; i < list.length; i++ ){

          if(!type){
            html.push('<li>');
    				html.push('<a href="'+list[i].url+'" class="shop_item" target="_blank">');
    				html.push('<div class="shop_logo"><img src="'+list[i].litpic+'" onerror="this.src=\'/static/images/404.jpg\'"></div>');
    				html.push('<div class="shop_info">');
    				html.push('<h3>'+list[i].title+'</h3>');
    				html.push('<div class="price"><b><em>'+echoCurrency("symbol")+'</em>'+list[i].mprice+'</b><s>'+echoCurrency("symbol")+list[i].mprice+'</s></div>');
    				html.push('<p>'+list[i].storeTitle+'</p>');
    				html.push('</div> </a> </li>');
          }else{
            html.push('<li><a href="'+list[i].url+'"  target="_blank">');
    				html.push('<div class="shop_logo"><img src="'+list[i].logo+'" onerror="this.src=\'/static/images/404.jpg\'"></div>');
    				html.push('<div class="shop_info">');
    				html.push('<h3>'+list[i].title+'</h3>');
    				html.push('<p class="star_info"><span class="star"><s></s>4.8</span> <span class="youhui">36条优惠</p>');
    				html.push('<div class="shop_detail">');
    				html.push('<p><span class="price"><s class="icon"></s>'+echoCurrency("symbol")+'980 <s class="oprice">'+echoCurrency("symbol")+'1280</s></span><span>团建必备全天档/湖景泳池/周五周六</span></p>');
    				html.push('<p><span class="price"><s class="icon"></s>'+echoCurrency("symbol")+'980 <s class="oprice">'+echoCurrency("symbol")+'1280</s></span><span>团建必备全天档/湖景泳池/周五周六</span></p>');
    				html.push('</div> </div> </a> </li>');
          }
        }
        // if(spage == 1){
        //
        // }else{
        //   dom.find('ul').append(html.join(''))
        // }
        dom.find('ul').html(html.join(''))
        spage++;
        isload = 0;
        if(spage > data.info.pageInfo.totalPage){
          isload = 1;
        }
        showPageInfo(type,totalCount);
        dom.attr('data-page',spage).attr('data-load',isload)
      }
    },
    error:function(data){

    }
  })
}


//打印分页
function showPageInfo(type,totalCount) {
	var info = $(".pagination");
	var nowPageNum = atpage;
	var allPageNum = Math.ceil(totalCount/pageSize);
	var pageArr = [];
	info.html("").hide();

	var pages = document.createElement("div");
	pages.className = "pagination-pages";
	info.append(pages);

	//拼接所有分页
	if (allPageNum > 1) {

		//上一页
		if (nowPageNum > 1) {
			var prev = document.createElement("a");
			prev.className = "prev";
			prev.innerHTML = langData['siteConfig'][6][33];//上一页
			prev.onclick = function () {
				atpage = nowPageNum - 1;
				getShopList(type);
			}
			info.find(".pagination-pages").append(prev);
		}

		//分页列表
		if (allPageNum - 2 < 1) {
			for (var i = 1; i <= allPageNum; i++) {
				if (nowPageNum == i) {
					var page = document.createElement("span");
					page.className = "curr";
					page.innerHTML = i;
				} else {
					var page = document.createElement("a");
					page.innerHTML = i;
					page.onclick = function () {
						atpage = Number($(this).text());
						getShopList(type);
					}
				}
				info.find(".pagination-pages").append(page);
			}
		} else {
			for (var i = 1; i <= 2; i++) {
				if (nowPageNum == i) {
					var page = document.createElement("span");
					page.className = "curr";
					page.innerHTML = i;
				}
				else {
					var page = document.createElement("a");
					page.innerHTML = i;
					page.onclick = function () {
						atpage = Number($(this).text());
						getShopList(type);
					}
				}
				info.find(".pagination-pages").append(page);
			}
			var addNum = nowPageNum - 4;
			if (addNum > 0) {
				var em = document.createElement("span");
				em.className = "interim";
				em.innerHTML = "...";
				info.find(".pagination-pages").append(em);
			}
			for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
				if (i > allPageNum) {
					break;
				}
				else {
					if (i <= 2) {
						continue;
					}
					else {
						if (nowPageNum == i) {
							var page = document.createElement("span");
							page.className = "curr";
							page.innerHTML = i;
						}
						else {
							var page = document.createElement("a");
							page.innerHTML = i;
							page.onclick = function () {
								atpage = Number($(this).text());
								getShopList(type);
							}
						}
						info.find(".pagination-pages").append(page);
					}
				}
			}
			var addNum = nowPageNum + 2;
			if (addNum < allPageNum - 1) {
				var em = document.createElement("span");
				em.className = "interim";
				em.innerHTML = "...";
				info.find(".pagination-pages").append(em);
			}
			for (var i = allPageNum - 1; i <= allPageNum; i++) {
				if (i <= nowPageNum + 1) {
					continue;
				}
				else {
					var page = document.createElement("a");
					page.innerHTML = i;
					page.onclick = function () {
						atpage = Number($(this).text());
						getShopList(type);
					}
					info.find(".pagination-pages").append(page);
				}
			}
		}

		//下一页
		if (nowPageNum < allPageNum) {
			var next = document.createElement("a");
			next.className = "next";
			next.innerHTML = langData['siteConfig'][6][34];//下一页
			next.onclick = function () {
				atpage = nowPageNum + 1;
				getShopList(type);
			}
			info.find(".pagination-pages").append(next);
		}

		info.show();

	}else{
		info.hide();
	}
}

})
