/**
 * 提现记录
 * by guozi at: 20151110
 */
 var objId = $("#list");

$(function(){

  //状态切换
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

	var type = $(".tab ul .curr").attr("data-id");

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=member&action=withdraw_log&state="+type+"&page="+atpage+"&pageSize="+pageSize,
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
							if(list[i].tab == 'w'){
                var item     = [],
                    bank     = list[i].bank,
                    cardnum  = list[i].cardnum,
                    cardnum  = bank == "alipay" ? cardnum.substr(0, 4) + "..." : "..."+cardnum.substr(cardnum.length-4),
                    cardname = list[i].cardname,
                    cardname = "*"+cardname.substr(1),
                    amount   = list[i].amount,
                    tdate    = huoniao.transTimes(list[i].tdate, 1),
                    state    = list[i].state,
                    url      = list[i].url;

                var stateTxt = "";
                switch(state){
                  case "0":
                    stateTxt = langData['siteConfig'][9][14];
                    break;
                  case "1":
                    stateTxt = langData['siteConfig'][9][5];
                    break;
                  case "2":
                    stateTxt = langData['siteConfig'][9][6];
                    break;
                  case "3":
                    stateTxt = '打款中';
                    break;
                }

                html.push('<div class="item">');
                html.push('<a href="'+url+'" class="fn-clear">');
                html.push('<div class="lbox fn-left">');
                html.push('<p class="state">'+stateTxt+'</p>');
                html.push('<p class="name">'+cardnum+" | "+cardname+'</p>');
                html.push('</div>');
                html.push('<div class="rbox fn-right">');
                html.push('<p class="number">'+amount+'</p>');
                html.push('<p class="date">'+tdate+'</p>');
                html.push('</div>');
                html.push('</a>');
                html.push('</div>');

              }else if(list[i].tab == "p"){
                var item     = [],
                    type = list[i].type,
                    amount = list[i].amount,
                    order_id = list[i].order_id,
                    pubdate = huoniao.transTimes(list[i].pubdate),
                    paydate = list[i].paydate,
                    cardname = list[i].cardname,
                    state = list[i].state,
                    bank = list[i].bank,
                    url = list[i].url,
                    account;

                var stateTxt = "";
                if(type == 'bank'){
                  account = "..."+order_id.substr(order_id.length-4)+"|"+"*"+cardname.substr(1);
                  switch(state){
                    case "0":
                      stateTxt = "<font color='#999999'>"+langData['siteConfig'][9][14]+"</font>";
                      break;
                    case "1":
                      stateTxt = "<font color='#53a000'>"+langData['siteConfig'][9][5]+"</font>";
                      break;
                    case "2":
                      stateTxt = "<font color='#f37800'>"+langData['siteConfig'][9][6]+"</font>";
                      break;
                    case "3":
                      stateTxt = "<font color='#f37800'>打款中</font>";
                      break;
                  }
                }else{
                  switch(type){
                    case 'alipay':
                      account = langData['siteConfig'][19][302];//支付宝
                      break;
                    case 'wxpay':
                      account = langData['siteConfig'][27][139];//微信
                      break;
                  }
                  account += langData['siteConfig'][32][73];//快速提现
                  stateTxt = "<font color='#53a000'>"+langData['siteConfig'][20][312]+"</font>";//提交成功
                }

                html.push('<div class="item">');
                html.push('<a href="'+url+'" class="fn-clear">');
                html.push('<div class="lbox fn-left">');
                html.push('<p class="state">'+stateTxt+'</p>');
                html.push('<p class="name">'+account+'</p>');
                html.push('</div>');
                html.push('<div class="rbox fn-right">');
                html.push('<p class="number">'+amount+'</p>');
                html.push('<p class="date">'+pubdate+'</p>');
                html.push('</div>');
                html.push('</a>');
                html.push('</div>');
              }

						}

            objId.append(html.join(""));
            $('.loading').remove();
            isload = false;

					}else{
            $('.loading').remove();
						objId.append("<p class='loading'>"+msg+"</p>");
					}

					totalCount = pageInfo.totalCount;
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
