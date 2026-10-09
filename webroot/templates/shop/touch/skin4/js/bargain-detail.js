$(function(){
  //数字滚动
  var qrr = {
      useEasing: true,
      easingFn: function(a, b, e, d) {
          d = (a /= d) * a;
          return b + e * (d * a + -3 * d + 3 * a)
      },
      useGrouping: true,
      separator: ",",
      decimal: ".",
      prefix: "",
      suffix: ""
  };

  //砍价成功滚动
  var a = $('.content4 .swiper-slide').length;
  if(a == 1){
    $(".content4 .swiper-wrapper").css('height','1.1rem');
  }else if(a>=2){
    var sucSwiper = new Swiper('.content4 .swiper-container', {direction: 'vertical',autoplay:true,slidesPerView:"auto",loop:true });
  }else{
    $('.content4').html('').hide();
  }


  //砍价价格
  var needKan = yuanPrice-buyPrice;
  priceCalc();
  function priceCalc(){
    var firstKanP = $('.content2 .hasCon #hasKan').attr('data-price');
    var hasKanPrice = yuanPrice - firstKanP;   
    var kanRatio = ((hasKanPrice/needKan)*100).toFixed(2);
    console.log(kanRatio)
    if(kanRatio <= 14){
      $('.hasCon .kanPro span').animate({'left':'13%'},300);
      if(kanRatio <=2){
        $('.hasCon .kanPro s').animate({'left':'2%'},300);
      }else{
        $('.hasCon .kanPro s').animate({'left':kanRatio+'%'},300);
      }
      
    }else if(kanRatio > 95){
      $('.hasCon .kanPro span').animate({'left':'85%'},300);
      $('.hasCon .kanPro s').animate({'left':'95%'},300);

    }else if(kanRatio > 86){
      $('.hasCon .kanPro span').animate({'left':'85%'},300);
      $('.hasCon .kanPro s').animate({'left':kanRatio+'%'},300);

    }else{
      $('.hasCon .kanPro span').animate({'left':kanRatio+'%'},300);
      $('.hasCon .kanPro s').animate({'left':kanRatio+'%'},300);
    }
    
    $('.hasCon .kanPro i').animate({'width':kanRatio+'%'},300); 
    //数字滚动
    $(".hasCon").on('inview', function(event, isInview) {
        if(isInview){
            var hasKan =  new CountUp("hasKan", 0, 0, 2, 3, qrr);
            hasKan.update(firstKanP);
        }
    })
  }
  

	//购买者滚动
    $.ajax({
        type: "GET",
        url: "/include/ajax.php",
        dataType: "jsonp",
        data: 'service=shop&action=bargainingLog&bargaid='+detailID+'&bargastate=3&pageSize=10',
        success: function(data) {

            if(data.state == 100){
                var tcNewsHtml = [], list = data.info.list;
                
                for (var i = 0; i < list.length; i++){
                    tcNewsHtml.push('<div class="swiper-slide">');
                    tcNewsHtml.push('<div class="buyImg"><img src="'+list[i].photo+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
                    tcNewsHtml.push('<p><em>“'+list[i].nickname+'”</em>'+list[i].gnowmoney+'元拿下</p>');
                    tcNewsHtml.push('</div>');

                }
                
                $('.buyGun .swiper-wrapper').html(tcNewsHtml.join(''));
                $('.buyGun').show();
                var mySwiper = new Swiper('.buyGun .swiper-container',{
                    direction : 'vertical',
                    autoplay: {
                    delay: 2000,
                    stopOnLastSlide: false,
                    disableOnInteraction: true,
                    },
                })

            }else{
                $('.buyGun').hide();
            }
        },
        error: function(){
            $('.buyGun').hide();
        }
    });
    // 倒计时
    var eday = 3;
    timer = setInterval(function(){
        if($('body').find('.jsTime').hasClass('disabled')){
            return false;//砍价已过期的不用倒计时
        }

        var end = $('body').find('.jsTime').attr("data-time")*1000;  //点击的结束抢购时间的毫秒数
        var newTime = Date.parse(new Date());  //当前时间的毫秒数
        var youtime = end - newTime; //还有多久时间结束的毫秒数
        if(youtime <= 0){
          clearInterval(timer);
          return;
        }
        var seconds = youtime/1000;//秒
        var minutes = Math.floor(seconds/60);//分
        var hours = Math.floor(minutes/60);//小时
        var days = Math.floor(hours/24);//天

        var CDay= days ;
        var CHour= hours % 24 ;
        if(CDay <= eday){//3天之内的只要小时 不要天 
            CHour = CHour + CDay*24;
            CDay = 0;
        }
        var CMinute= minutes % 60;
        var CSecond= Math.floor(seconds%60);//"%"是取余运算，可以理解为60进一后取余数
        var c=new Date();
        var millseconds=c.getMilliseconds();
        var Cmillseconds=Math.floor(millseconds %100);
        if(CSecond<10){//如果秒数为单数，则前面补零
          CSecond="0"+CSecond;
        }
        if(CMinute<10){ //如果分钟数为单数，则前面补零
          CMinute="0"+CMinute;
        }
        if(CHour<10){//如果小时数为单数，则前面补零
          CHour="0"+CHour;
        }
        if(CDay<10){//如果天数为单数，则前面补零
          CDay="0"+CDay;
        }
        if(Cmillseconds<10) {//如果毫秒数为单数，则前面补零
          Cmillseconds="0"+Cmillseconds;
        }
        if(CDay > 0){
         $(".jsTime").find("span.day").html(CDay);   
        }else{
            $('.jsTime span.day,.jsTime em.speDot').hide();
        }
        
        $(".jsTime").find("span.hour").html(CHour);
        $(".jsTime").find("span.minute").html(CMinute);
        $(".jsTime").find("span.second").html(CSecond);

  	}, 1000);

    
  	//亲自砍一刀
  	$('.selfKan').click(function(){
  	    var hid = $("#hid").val();
      $.ajax({
          type: "GET",
          url: '/include/ajax.php?service=shop&action=doBargaining&hid='+hid+'&kjid='+detailID+'&kjtype=0',
          dataType: "jsonp",
          success: function(data) {
                if(data.state ==100){
					       var ttprice = yuanPrice-data.info;
                    $('.content2 .hasCon #hasKan').text(ttprice.toFixed(2));
                   $('.content2 .hasCon #hasKan').attr('data-price',ttprice.toFixed(2));
                    // if(ttprice == buyPrice){
                    //   $(".selfAlert h2").html('帮好友砍价成功')
                    //   $(".selfAlert .selefCon p").html('感谢你帮好友砍下最后一刀，快通知好友吧')
                    // }
                    $('.comMask').show();
                    $('.selfKan').hide();
                    $('.canbuy').show();
                    $('.selfAlert').addClass('show');
                    if(ttprice > buyPrice){
                      //数字滚动
                      $(".selfAlert").on('inview', function(event, isInview) {
                          if(isInview){
                              var allin =  new CountUp("num1", 0, 0, 2, 3, qrr);
                              allin.update(data.info);
                          }
                      })
                    }
                  
                }else{
                    showErrAlert(data.info)
                }
          },
          error:function () {

          }

      })

  	})
  
  	//帮好友砍一刀
  	$('.friendKan').click(function(){
		$(this).hide();
        $('.selfBuy').css('display','block');
        
        $('.content2 .hasCon .kanPro .kanSpan').hide();
        $('.content2 .hasCon .kanPro s').hide();
        $.ajax({
            type: "GET",
            url: '/include/ajax.php?service=shop&action=doBargaining&kjid='+detailID+'&kjtype=1',
            dataType: "jsonp",
            success: function(data) {
                if(data.state ==100){
                   $('.content2 .hasTip').removeClass('fn-hide');
                    var tprice = yuanPrice-data.info;
                    var haskan = $('.content2 .hasCon #hasKan').text()
                    var cprice = haskan - data.info
                    $('.content2 .hasCon #hasKan').text(cprice.toFixed(2));
                    $('.content2 .hasCon #hasKan').attr('data-price',cprice.toFixed(2));
                    if(cprice == buyPrice){
                      $(".friendA .selefCon h2").html('帮好友砍价成功')
                      $(".friendA .selefCon p").html('感谢你帮好友砍下最后一刀，快通知好友吧')
                    }else{
                      //数字滚动
                      $(".selfAlert").on('inview', function(event, isInview) {
                          if(isInview){
                              var allin =  new CountUp("num1", 0, 0, 2, 3, qrr);
                              allin.update(data.info);
                              var bangPrice =  new CountUp("bangPrice", 0, 0, 2, 3, qrr);
                              bangPrice.update(data.info);
                          }
                      })
                    }
                    $('.comMask').show();
                    $('.selfAlert').addClass('show');
                   

                    


                }else{
                    alert(data.info)
                }
            },
            error:function () {

            }

        })
  	})

  	$('.comMask,.goKan,.closeAlert').click(function(){
      // if(selfOpen == 1){
      //   priceCalc();
      // }
       priceCalc();
      $('.comMask').hide();
      $('.selfAlert').removeClass('show');
      if(selfOpen == 1){
      $('.canbuy').removeClass('fn-hide');
      }else{
        $('.selfBuy').css('display','block');
      }
      
  	})


    //直接购买
    $('.goBuy').click(function(){
      
      $('.comMask2').show();
      $('.buyAlert').addClass('show');

      //数字滚动
      $(".buyAlert").on('inview', function(event, isInview) {
          if(isInview){
              var buyPr =  new CountUp("buyPr", 0, 0, 2, 3, qrr);              
              if($('.goBuy').hasClass('youBuy')){//砍至一半购买
                var banPrice = $('.content2 .hasCon #hasKan').attr('data-price');
                console.log(banPrice)
                buyPr.update(banPrice);
              }else{//原价购买
                buyPr.update(yuanPrice);
              }

          }
      })
      
    })

    $('.comMask2,.goOn,.closeBuy').click(function(){
      $('.comMask2,.ruleAlert').hide();
      $('.buyAlert').removeClass('show');

    })
    //弹窗--未成功时直接购买
    $('.nowBuy').click(function(){
      $('#payPrice').val($('#buyPr').text());
      $("#directbuy").val(1)
      $("#pros").val(detailID);
      $("#buyForm").submit();
    })

    //砍价成功立即购买
    $('.buyNow').click(function(){
      $('#payPrice').val(buyPrice);
      $("#buyForm").submit();
    })

    //规则弹窗
    $('.content1 .rule').click(function(){
      $('.comMask2,.ruleAlert').show();
      // $('.ruleAlert').addClass('show');
    })
    $('.ruleAlert .closeAlert').click(function(){
      $('.comMask2,.ruleAlert').hide();
    })

  	//分享功能
  	var selfshareHtml = '<div class="self_shearBox fn-hide" id="self_shearBox"><div class="self_sheark1"><h2>长按保存图片，分享给好友</h2><div class="self_sheark2"><div class="self_HN_style_32x32"><ul class="fn-clear">' +
	  '<li> <a class="HN_button_qzone" href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + wxconfig.link + '&desc=' + wxconfig.title + '"></a>'+langData['siteConfig'][38][13]+'</li>' +	//QQ空间
	  '<li><a class="HN_button_tweixin"></a>'+langData['siteConfig'][27][139]+'</li>' +// 微信
	  '<li><a class="HN_button_ttqq"></a>'+langData['siteConfig'][38][14]+'</li>' +	//QQ好友
	  '<li><a class="HN_button_comment"><span class="HN_txt jtico jtico_comment"></span></a>'+langData['siteConfig'][38][15]+'</li>' +	//朋友圈
	  '</ul></div></div> <div class="self_cancel" id="self_cancelShear">'+langData['siteConfig'][6][12]+'</div></div>' +	//取消
	  '<div class="self_bg" id="self_shearBg"></div>' +
	  '<div class="self_zhiyin fn-hide"><div class="self_bg"><div class="self_zhibox"><img src="' + staticPath + 'images/HN_Public_sharezhi.png?v=1" alt=""></div></div></div>';

	$("body").append(selfshareHtml);

	var hnselfShare = {
		showShareBox: function(){
			// $("#publit_shear_load").remove();
			$('#self_shearBox').removeClass('fn-hide').animate({'bottom': '0'}, 200);
			$('#self_shearBox .self_bg').css({'height':'100%','opacity':1});

		}

		,closeShearBox: function(){
			$('#self_shearBox').animate({'bottom': '-100%'}, 200);
			$('#self_shearBox .self_bg').css({'height':'0','opacity':0});
			//关闭海报
			$('.html2canvas_fixed').removeClass('show')
			$(".html2_mask").hide();
			$('html').removeClass('noscroll');
			$('.html2_mask_bottom').fadeOut();
		}

		,showQRBox: function(){
			$('#self_shearBox').animate({'bottom': '-100%'}, 200);
			$('#self_codeBox').animate({'bottom': '0'}, 200);
		}
		,closeQRBox: function(){
            $('#self_codeBox').animate({'bottom': '-100%'}, 200);
            $('.self_shearBox .self_bg').css({'height':'0','opacity':0});
      	}
      	,showSRBox: function(){
			$('.self_zhiyin').show();
			$('.self_zhiyin .self_bg').css({'height':'100%','opacity':1});
      	}
      	,closeSRBox: function(){
			$('.self_zhiyin').hide();
    	    $('.self_zhiyin .self_bg').css({'height':'0','opacity':0});
      	}
	}
	$("body").delegate(".invite", "click", function(){
    if($(this).hasClass('disabled')) return false;
		// 生成海报
		$('.postFast').click();

		//非客户端下调用默认分享功能
		var device = navigator.userAgent;
		if(device.indexOf('huoniao') <= -1){

			var QzoneUrl = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+wxconfig.link+'&desc='+wxconfig.title;
			$('.HN_button_qzone').attr("href",QzoneUrl);
			hnselfShare.showShareBox();

		//客户端下调用原生分享功能
		}else{
            setupWebViewJavascriptBridge(function(bridge) {
				bridge.callHandler("appShare", {
					"platform": "all",
					"title": wxconfig.title,
					"url": wxconfig.link,
					"imageUrl": wxconfig.imgUrl,
					"summary": wxconfig.description
				}, function(responseData){
					var data = JSON.parse(responseData);
					// if(data.state == 100){
					// 	alert("分享成功！");
					// }else{
					// 	alert(data.info);
					// }
				})
		  });
      }

      //隐藏浮动菜单
      $('.fixFooter').show();
	  $('.header').removeClass('open');
	  $('#navBox_4').hide();
	  $('#navBox_4 .bg').css({'height':'0','opacity':0});

      return false;
	});

	$('#self_shearBox .HN_button_tweixin, #self_shearBox .HN_button_ttqq, #self_shearBox .HN_button_comment').click(function(){
		hnselfShare.closeShearBox();
		hnselfShare.showSRBox();
	})


	$("#self_cancelcode,#self_cancelShear").click(function(){
		hnselfShare.closeShearBox();
		hnselfShare.closeQRBox();
    if($(".html2_img img").length == 0){
      $(".html2canvas_fixed").css('display','none')
      var imgShow = setInterval(function(){
        if($(".html2_img img").length){
          clearInterval(imgShow)
          $(".html2canvas_fixed").removeClass('show').removeAttr('style')
        }
      })
    }
	});

	$("#self_shearBg,.self_bg").click(function(){
		hnselfShare.closeShearBox();
		hnselfShare.closeQRBox();
		hnselfShare.closeSRBox();
    if($(".html2_img img").length == 0){
      $(".html2canvas_fixed").css('display','none')
      var imgShow = setInterval(function(){
        if($(".html2_img img").length){
          clearInterval(imgShow)
          $(".html2canvas_fixed").removeClass('show').removeAttr('style')
        }
      })
    }
	});




  	var page = 1,isload = false,atpage=1;
  if(selfOpen == 1){
    getList();
  }else{
    getList2();
  }
  	
  	//好友助力榜 -- 查看更多
    $('.seeMore').click(function(){
          page++;
          getList();

    })
  
  //更多砍价商品 -- 滚动加载
    $(window).scroll(function(){
        var allh = $('body').height();
        var w = $(window).height();
        var s_scroll = allh - w - 100;
        if ($(window).scrollTop() > s_scroll && !isload) {
          if(selfOpen == 0){
            console.log(222)
            atpage++;
            getList2();
          }

        }
    })
  	//好友助力榜
  	function getList(){
		isload = true;
		$('.loading').remove();
		$('.content3 ul').append('<div class="loading">加载中...</div>');
	  	$.ajax({
	        type: "GET",
	        url: '/include/ajax.php?service=shop&action=bargainingLog&bargaid='+detailID+'&page='+page+'&pageSize=20',
	        dataType: "jsonp",
	        success: function(data) {
	        	if(data.state == 100){
	        		var list = data.info.list,pageinfo = data.info.pageInfo,page = pageinfo.page,html = [];
	        		for(var i = 0; i < list.length; i++){
	        			$('.loading').remove();
	        			html.push('<li class="fn-clear">');
	        			var litpic = list[i].photo == "" ? staticPath+'images/noPhoto_40.jpg' : list[i].photo;
	        			html.push('<div class="peoImg"><img src="'+litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
	        			html.push('<div class="peoInfo">');
	        			html.push('<h3>'+list[i].nickname+'</h3>');
	        			// var pub = trans(list[i].pubdate)
	        			var pub = list[i].pubdate
	        			html.push('<p>'+pub+'</p>');
	        			html.push('</div>');
	        			html.push('<p class="kanMoney">砍掉<strong>'+echoCurrency('symbol')+list[i].money+'</strong></p>');
	        			html.push('</li>');
	        		}
	        		$('.content3 ul').append(html.join(""));
	        		isload = false;
	        		//最后一页
                    if(page >= data.info.pageInfo.totalPage){
                        isload = true;                      
                        $('.content3 ul').append('<div class="loading">已加载全部</div>');
                        $('.seeMore').hide();
                    }else{
                    	$('.seeMore').show();
                    }
	        	}else{
	        		$('.content3 ul .loading').html(data.info);
	        	}
			},
	        error: function(){
	            isload = false;
                $('.content3 ul .loading').html(langData['siteConfig'][20][227]);
	        }
	    });
  	}
  //更多砍价商品
  	function getList2(){
		isload = true;
		$('.loading').remove();
		$('.content5 ul').append('<div class="loading">加载中...</div>');
	  	$.ajax({
	        type: "GET",
	        url: '/include/ajax.php?service=shop&action=slist&huodongtype=3&page='+atpage+'&pageSize=10',
	        dataType: "jsonp",
	        success: function(data) {
	        	if(data.state == 100){
	        		var list = data.info.list,pageinfo = data.info.pageInfo,page = pageinfo.page,html = [];
	        		for(var i = 0; i < list.length; i++){
	        			$('.loading').remove();
	        			html.push('<li class="fn-clear">');
                html.push('<a href="'+kanUrl.replace('%id',list[i].id)+'">');
	        			var litpic = list[i].litpic == "" ? staticPath+'images/noPhoto_40.jpg' : list[i].litpic;
	        			html.push('<div class="goodImg"><img src="'+litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
	        			html.push('<div class="goodInfo">');
	        			html.push('<h4>'+list[i].title+'</h4>');
                html.push('<p class="mPrice"><s>'+echoCurrency('symbol')+list[i].price+'</s></p>');
                var priceAr = (list[i].huodongprice?list[i].huodongprice:list[i].price).split('.');
                html.push('<p class="nPrice"><em>'+echoCurrency('symbol')+'</em><span>'+priceAr[0]+'</span>.'+priceAr[1]+'<i></i></p>');
                html.push('</div>');
	        			html.push('<span class="kanSpan">立即砍价</span>');
	        			html.push('</a>');
                html.push('</li>');
	        		}
	        		$('.content5 ul').append(html.join(""));
	        		isload = false;
	        		//最后一页
                    if(atpage >= data.info.pageInfo.totalPage){
                        isload = true;                      
                        $('.content5 ul').append('<div class="loading">已加载全部</div>');
                    }
	        	}else{
	        		$('.content5 ul .loading').html(data.info);
	        	}
			},
	        error: function(){
	            isload = false;
                $('.content5 ul .loading').html(langData['siteConfig'][20][227]);
	        }
	    });
  	}

  	function trans(timestamp){
        
        const dateFormatter = huoniao.dateFormatter(timestamp);
        const year = dateFormatter.year;
        const month = dateFormatter.month;
        const day = dateFormatter.day;
        const hour = dateFormatter.hour;
        const minute = dateFormatter.minute;
        const second = dateFormatter.second;
        
		
		return (month+'-'+day+' '+hour+':'+minute+':'+second);
		
  	}
  	

})
