/**
 * 会员中心积分明细
 * by guozi at: 20150717
 */

var objId = $("#list");
$(function(){

	//类型切换
  $(".tab ul li").bind("click", function(){
    var t = $(this), id = t.attr("data-id");
    if(!t.hasClass("curr") && !t.hasClass("sel")){
      state = id;
      atpage = 1;
      t.addClass("curr").siblings("li").removeClass("curr");
      objId.html('');
      getList();
    }
  });


  // 下拉加载
  $(window).scroll(function() {
    var h = $('.item').height();
    var allh = $('body').height();
    var w = $(window).height();
    var scroll = allh - w - h;
    if ($(window).scrollTop() > scroll && !isload) {
      atpage++;
      getList();
    };
  });


	getList(1);


});

function getList(is){

  isload = true;

	if(is != 1){
		// $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

	var type = $(".tab .curr").attr("data-id");

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=member&action=record&type="+type+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

          var msg = totalCount == 0 ? langData['siteConfig'][20][126] : langData['siteConfig'][20][185];

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item   = [],
									type   = list[i].type,
									time   = list[i].date,
									amount = list[i].amount,
									info   = list[i].info;


							html.push('<div class="item">');
							html.push('<div class="lbox">');
							html.push('<p class="time">'+time.split(' ')[1]+'</p>');
							html.push('<p class="date">'+addDateInV1_2(time.split(' ')[0])+'</p>');
							html.push('</div>');
							html.push('<div class="rbox">');
							html.push('<p class="number'+(type == 1 ? " add" : " less")+'">'+(type == 1 ? "+" : "-")+Number(amount).toFixed(2)+'</p>');
							html.push('<p class="thing">'+info+'</p>');
							html.push('</div>');
							html.push('</div>');

						}

            objId.append(html.join(""));
            $('.loading').remove();
            isload = false;

					}else{
            $('.loading').remove();
						objId.append("<p class='loading'>"+msg+"</p>");
					}

					totalAdd = pageInfo.totalAdd;
					totalLess = pageInfo.totalLess;
					totalCount = pageInfo.totalCount;


          $('#totalCount').val(totalCount);
          $('#totalAdd').text(Number(pageInfo.totalAdd).toFixed(2));
          $('#totalLess').text(Number(pageInfo.totalLess).toFixed(2));

				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}

function addDateInV1_2(strDate){
	var d = new Date();
	var day = d.getDate();
	var month = d.getMonth() + 1;
	var year = d.getFullYear();
	var dateArr = strDate.split('-');
	var tmp;
	var monthTmp;
	if(dateArr[2].charAt(0) == '0'){
		tmp = dateArr[2].substr(1);
	}else{
		tmp = dateArr[2];
	}
	if(dateArr[1].charAt(0) == '0'){
		monthTmp = dateArr[1].substr(1);
	}else{
		monthTmp = dateArr[1];
	}
	if(day == tmp && month == monthTmp && year == dateArr[0]){
		return langData['siteConfig'][13][24];
	}else{
		return dateArr[0] + langData['siteConfig'][13][14] + monthTmp + langData['siteConfig'][13][18] + tmp + langData['siteConfig'][13][25];
	}
}
