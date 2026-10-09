/**
 * 会员中心我参与的投票
 * by guozi at: 20161229
 */

var objId = $("#list");
$(function(){

	$(".main-tab li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr")){
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
			getList();
		}
	});

	getList(1);

});



function transTimes(timestamp, n){
	
    const dateFormatter = huoniao.dateFormatter(timestamp);
    const year = dateFormatter.year;
    const month = dateFormatter.month;
    const day = dateFormatter.day;
    const hour = dateFormatter.hour;
    const minute = dateFormatter.minute;
    const second = dateFormatter.second;
    
	if(n == 1){
		return (month+'-'+day+' '+hour+':'+minute);
	}else{
		return 0;
	}
}

function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');  //加载中，请稍候
	$(".pagination").hide();
  var state = $(".main-tab .curr").data("state");

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=vote&action=joinList&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
        if(data.state == 101){
          objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //暂无相关信息！
        }else{
          var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

          //拼接列表
          if(list.length > 0){

            var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";

            for(var i = 0; i < list.length; i++){
              var item        = [],
                  id          = list[i].id,
                  title       = list[i].title,
                  url         = list[i].url,
                  click       = list[i].click,
                  vstate      = list[i].state,
                  arcrank     = list[i].arcrank,
                  join        = list[i].join,
                  // waitpay     = list[i].waitpay,
                  pubdate     = huoniao.transTimes(list[i].pubdate, 1);

              // url = waitpay == "1" || list[i].arcrank != "1" ? 'javascript:;' : url;

              var stateTxt = '';
              if(vstate == 1){
                stateTxt = langData['siteConfig'][31][139]+'...';  //投票进行中
              }else if(vstate == 2){
                stateTxt = langData['siteConfig'][19][507];  //已结束
              }

              html.push('<div class="item fn-clear" data-id="'+id+'" data-join="'+join+'">');
              html.push('  <div class="i">');
              html.push('    <h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a><span class="state state'+vstate+'">'+stateTxt+'</span></h5>');
              html.push('    <p>'+langData['siteConfig'][11][8]+'：'+pubdate+'</p>');   //发布时间
              html.push('    <div class="btns o">');
              html.push('      <span><font>'+join+'</font>'+langData['siteConfig'][31][140]+'</span>');  //人已参与
              html.push('    </div>');
              html.push('  </div>');
              html.push('</div>');
            }

            objId.html(html.join(""));

          }else{
            objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");   //暂无相关信息！
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
              totalCount = pageInfo.expire;
              break;
          }
          $("#total").html(pageInfo.totalCount);
          // $("#gray").html(pageInfo.gray);
          $("#audit").html(pageInfo.audit);
          $("#expire").html(pageInfo.expire);
          showPageInfo();
        }
      }else{
        objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //暂无相关信息！
      }
		}
	});
}
