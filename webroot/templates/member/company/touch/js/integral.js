var objId = $(".order-list");
$(function(){
  $('.tit .select').click(function(){
    var t = $(this);
    if (t.hasClass('show')) {
      t.removeClass('show');
    }else {
      t.addClass('show');
    }
    return false;
  })

  $('body').click(function(){
    $('.tit .select').removeClass('show');
  })


  //类型切换
  $(".select ul li").bind("click", function(){
    var t = $(this), id = t.attr("data-id");
    if(!t.hasClass("curr")){
      t.addClass("curr").siblings("li").removeClass("curr");
      objId.html('');
      atpage = 1;
      getList(1);
      $('.totalLess, .totalAdd').hide();
      if (id == "0") {
        $('.totalLess').show();
      }else if (id == "1") {
        $('.totalAdd').show();
      }else {
        $('.totalLess, .totalAdd').show();
      }
    }
  });


  // 下拉加载
  $('.list').scroll(function() {
    var h = $('.item').height();
    var allh = $('.order-list').height();
    var w = $(window).height();
    var scroll = allh - w - h;
    if ($('.list').scrollTop() > scroll && !isload) {
      atpage++;
      getList();
    };
  });


	getList(1);

  function getList(is){

    isload = true;

  	if(is != 1){}

  	objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

  	var type = $(".select .curr").attr("data-id");

  	$.ajax({
  		url: masterDomain+"/include/ajax.php?service=member&action=point&type="+type+"&page="+atpage+"&pageSize="+pageSize,
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


  							html.push('<li>');
  							html.push('<p class="fn-clear">');
  							html.push('<span class="fn-left">'+info+'</span>');
  							html.push('<span class="fn-right'+(type == 1 ? " add" : " less")+'">'+(type == 1 ? "+" : "-")+Number(amount).toFixed(0)+'</span>');
  							html.push('</p>');
  							html.push('<p class="time">'+addDateInV1_2(time.split(' ')[0])+'</p>');
  							html.push('</li>');

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
            $('#totalAdd').text(Number(pageInfo.totalAdd).toFixed(0));
            $('#totalLess').text(Number(pageInfo.totalLess).toFixed(0));

  				}
  			}else{
  				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
  			}
  		}
  	});
  }


})

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
