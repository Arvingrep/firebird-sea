/**
 * 会员中心交易明细
 * by guozi at: 20151109
 */

var objId = $("#list");
$(function(){

  var device = navigator.userAgent;
  if (device.indexOf('huoniao_iOS') > -1) {
    $('body').addClass('huoniao_iOS');
  }

  // 下拉加载
  var isload = false, isend = false;
  $(window).scroll(function() {
    var h = $('.list li').height();
    var allh = $('body').height();
    var w = $(window).height();
    var scroll = allh - h - w;
    if ($(window).scrollTop() > scroll && !isload && !isend) {
      atpage++;
      getList();
    };
  });

	getList();


  function getList(){

    isload = true;
  	objId.append('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');

  	$.ajax({
  		url: masterDomain+"/include/ajax.php?service=member&action=reward&page="+atpage+"&pageSize="+pageSize,
  		type: "GET",
  		dataType: "jsonp",
  		success: function (data) {
        $('.loading').remove();
  			if(data && data.state != 200){

  				if(data.state == 101){
            isend = true;
  					objId.append("<div class='empty'>"+langData['siteConfig'][20][126]+"</div>");
  				}else{
  					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

  					//拼接列表
  					if(list.length > 0){
  						for(var i = 0; i < list.length; i++){
  							var item   = [],
  									title  = list[i].title,
  									url    = list[i].url,
  									user   = list[i].user,
  									amount = list[i].amount,
  									date   = list[i].date;

  							html.push('<li><a href="'+url+'"><p class="list-tit fn-clear"><span class="span-1">'+user+'</span><span class="span-2">'+title+'</span><span class="span-3">'+echoCurrency('symbol')+' <em class="count">'+amount+'</em></span></p><p class="time"><span>'+date+'</span></p></a></li>');

  						}

  						objId.append(html.join(""));
              if(atpage >= pageInfo.totalPage){
                isend = true;
    						$(".list").append('<div class="empty">'+langData['siteConfig'][20][185]+'</div>');
    					}

  					}else{
  						objId.append("<div class='empty'>"+langData['siteConfig'][20][126]+"</div>");
  					}

  					// totalCount = pageInfo.totalCount;
  				}
  			}else{
  				objId.append("<div class='empty'>"+langData['siteConfig'][20][126]+"</div>");
  			}
  		}
  	});
  }


});
