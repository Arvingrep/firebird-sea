/**
 * 会员中心我参与的活动
 * by guozi at: 20161229
 */

var objId = $("#list"), isload = false;
$(function(){

  var userAgent1 = navigator.userAgent;

  if (userAgent1.indexOf('huoniao') > -1){
    $(".scan").show();
    $("body").delegate(".scan", "click", function(){
      setupWebViewJavascriptBridge(function(bridge) {
        bridge.callHandler("QRCodeScan", {}, function callback(DataInfo){
          if(DataInfo){
            $.ajax({
      				url: masterDomain+"/include/ajax.php?service=huodong&action=verifyCode&hid="+hid+"&codes="+DataInfo,
      				type: "GET",
      				dataType: "jsonp",
      				success: function (data) {
      					if(data && data.state == 100){
                  alert(langData['siteConfig'][22][117]);
      						atpage = 1;
            			objId.html('');
      						$(".tab li:eq(0)").removeClass('curr');
      						$(".tab li:eq(1)").addClass('curr');
      						getList();
      					}else{
      						alert(data.info);
      					}
      				},
      				error: function(){
      					alert(langData['siteConfig'][20][183]);
      				}
      			})
          }
        });
      });
  });
  }else {
    //微信端
    if(navigator.userAgent.toLowerCase().match(/micromessenger/) && navigator.userAgent.toLowerCase().match(/iphone|android/)){
      $(".scan").show();

      $("body").delegate(".scan", "click", function(){
        var no = parseInt($('#count').val());
        $('#count').val(++no);
        wx.scanQRCode({
          // 默认为0，扫描结果由微信处理，1则直接返回扫描结果
          needResult : 1,
          desc : 'scanQRCode desc',
          success : function(res) {
            if(res.resultStr){
              $.ajax({
        				url: masterDomain+"/include/ajax.php?service=huodong&action=verifyCode&hid="+hid+"&codes="+res.resultStr,
        				type: "GET",
        				dataType: "jsonp",
        				success: function (data) {
        					if(data && data.state == 100){
                    alert(langData['siteConfig'][22][117]);
        						atpage = 1;
              			objId.html('');
        						$(".tab li:eq(0)").removeClass('curr');
        						$(".tab li:eq(1)").addClass('curr');
        						getList();
        					}else{
        						alert(data.info);
        					}
        				},
        				error: function(){
        					alert(langData['siteConfig'][20][183]);
        				}
        			})
            }
          },
          fail: function(err){            
            alert(JSON.stringify(err));
          }
        });
      })
    }
  }




	$(".tab li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr")){
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

  objId.delegate('.item', 'click', function(){
    var t = $(this);
    !t.next('.detail').is(':visible') ? t.siblings('.detail').hide() : null;
    t.next('.detail').is(':visible') ? t.next('.detail').stop().slideUp(200) : t.next('.detail').stop().slideDown(200);
  });

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

	 isload = true;


	if(is != 1){
		// $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=huodong&action=regList&hid="+hid+"&state="+$('.tab .curr').attr("data-id")+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
      $('.loading').remove();
			if(data && data.state != 200){
				if(data.state == 101){
          $("#unchecked").html(0);
					$("#checked").html(0);
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

          $("#unchecked").html(pageInfo.unchecked);
					$("#checked").html(pageInfo.checked);

          //拼接列表
					if(list.length > 0){

						for(var i = 0; i < list.length; i++){
							var item = [],
									date = list[i].date,
									nickname   = list[i].nickname,
									phone = list[i].phone;
									photo = list[i].photo;
									price = list[i].price ? list[i].price : 0;;
									property = list[i].property;
									state = list[i].state;
									title = list[i].title;
									uid = list[i].uid;
									usedate = list[i].usedate;

							var status = state == '1' ? langData['siteConfig'][6][187] : langData['siteConfig'][6][188];

							var name = nickname, tel = phone;
							if(property.length > 1){
								name = property[0]['姓名'];
								tel = property[1]['手机'];
							}

							var info = [];
							if(property.length > 0){
								for(var tmp in property){
									for(var n in property[tmp]){
										info.push('<p><span>'+(n == 'areaCode' ? '区号' : n)+'：</span>'+property[tmp][n]+'</p>');
									}
								}
							}

                              var status = state == '1' ? langData['siteConfig'][6][187] : langData['siteConfig'][6][188];

                              html.push('<div class="item fn-clear">');
                              html.push('<div class="lbox fn-left">');
                              html.push('<p class="name">'+name+'<i><s></s></i></p>');
                              html.push('<p class="number">'+(tel ? tel : langData['siteConfig'][13][20])+'</p>');
                              if(usedate!=''){
								  html.push('<p class="number">'+langData['siteConfig'][0][18]+':&nbsp;&nbsp;'+usedate+'</p>');
							  }
                              html.push('</div>');
                              html.push('<div class="rbox fn-right">');
                              html.push('<p class="time">'+transTimes(date, 1)+'</p>');
                              html.push('<p class="thing">'+status+'&nbsp;&nbsp;'+(title ? title : langData['siteConfig'][19][427])+'('+price+')</p>');
                              html.push('</div>');
                              html.push('</div>');

                              html.push('<div class="detail">'+info.join("")+'</div>');

						}

						objId.append(html.join(''));

                        isload = false;

					}else{
                        $('.loading').remove();
						objId.append("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}


				}
			}else{
				objId.append("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
        $('.count span').text(0);
			}
		}
	});
}
