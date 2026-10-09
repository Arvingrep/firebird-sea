var huoniao = {

    //转换PHP时间戳
    transTimes: function(timestamp, n){

        const dateFormatter = this.dateFormatter(timestamp);
        const year = dateFormatter.year;
        const month = dateFormatter.month;
        const day = dateFormatter.day;
        const hour = dateFormatter.hour;
        const minute = dateFormatter.minute;
        const second = dateFormatter.second;

        if(n == 1){
            return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
        }else if(n == 2){
            return (year+'-'+month+'-'+day);
        }else if(n == 3){
            return (month+'-'+day);
        }else if(n == 4){
            return dateFormatter;
        }else{
            return 0;
        }
    },

    //判断是否为合法时间戳
    isValidTimestamp: function(timestamp) {
        return timestamp = timestamp * 1, Number.isFinite(timestamp) && timestamp > 0;
    },

    //创建 Intl.DateTimeFormat 对象并设置格式选项
    dateFormatter: function(timestamp){
        
        if(!this.isValidTimestamp(timestamp)) return {year: '-', month: '-', day: '-', hour: '-', minute: '-', second: '-'};

        const date = new Date(timestamp * 1000);  //创建一个新的Date对象，使用时间戳
        
        // 使用Intl.DateTimeFormat来格式化日期
        const dateTimeFormat = new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: typeof cfg_timezone == 'undefined' ? 'PRC' : cfg_timezone,  //指定时区，cfg_timezone变量已在页面中通过程序自动声明
        });
        
        // 获取格式化后的时间字符串
        const formatted = dateTimeFormat.format(date);
        
        // 将格式化后的字符串分割为数组
        const [year, month, day, hour, minute, second] = formatted.match(/\d+/g);

        // 返回一个对象，包含年月日时分秒
        return {year, month, day, hour, minute, second};
    }
    
  /**
     * 获取附件不同尺寸
     * 此功能只适用于远程附件（非FTP模式）
     * @param string url 文件地址
     * @param string width 兼容老版本(small/middle)
     * @param int width 宽度
     * @param int height 高度
     * @return string *
     */ 
   ,changeFileSize: function(url, width, height){
    if(url == "" || url == undefined) return "";

    //小图尺寸
    if(width == 'small'){
        width = 200;
        height = 200;
    }

    //中图尺寸
    if(width == 'middle'){
        width = 500;
        height = 500;
    }

    //默认尺寸
    width = typeof width === 'number' ? width : 800;
    height = typeof height === 'number' ? height : 800;

    //阿里云、华为云
    url = url.replace('w_4096', 'w_' + width);
    url = url.replace('h_4096', 'h_' + height);

    //七牛云
    url = url.replace('w/4096', 'w/' + width);
    url = url.replace('h/4096', 'h/' + height);

    //腾讯云
    url = url.replace('4096x4096', width+"x"+height);

    return url;

    // 以下功能弃用
		if(to == "") return url;
		var from = (from == "" || from == undefined) ? "large" : from;
		var newUrl = "";
		// if(hideFileUrl == 1){
		// 	newUrl =  url + "&type=" + to;
		// }else{
			newUrl = url.replace(from, to);
		// }

		return newUrl;
	}
}

$(function(){

  var action, objId = $('.house-list'), lei = 0;

  // 选择房源类型
  $('.house-type .cell').click(function(){
    var t = $(this), type = t.attr('data-type'), index = t.index();
    if (!t.hasClass('active')) {
      atpage = 1;
      t.addClass("active").siblings(".cell").removeClass("active");
      $('.house-tab .tab-box').removeClass('show').eq(index).addClass('show');
      objId.html('');
      getList(1);
    }
    t.addClass('active').siblings('.cell').removeClass('active');
  })

  //选择房源信息状态
  $(".tab-box a").bind("click", function(){
    var t = $(this), id = t.attr("data-state"), type = $('.house-type .active').attr('data-type');
    if(!t.hasClass("active") && !t.hasClass('more')){
      state = id;
      atpage = 1;
      t.addClass("active").siblings("a").removeClass("active");
      objId.html('');
      getList(1);
    }else {
    	$('.typebox, .mask').show();
			$('.typebox ul').hide();
			$('.'+type).show();
    }
  });

	// 选择整租、合租、出售等
	$('.typebox li').click(function(){
		$(this).addClass('active').siblings('li').removeClass('active');
	})

	$('.typebox .confirm').click(function(){
		objId.html('');
		getList(1);
		var tt = $('.house-type .active').data('type');
		var tit = $('.typebox .' + tt).find('.active').text();
		$('.house-tab .show a:eq(0)').find('span').html(tit ? tit : langData['siteConfig'][9][0]);
		$('.typebox, .mask').hide();
	})
	$('.mask').click(function(){
		$('.typebox, .mask').hide();
	})

	var bidDefaultDay = parseInt($(".day .on").text()),               //默认时长为选中的天数
	      bidPriceObj   = $('#dayprice'),                               //每日预算input
	      bidAmountObj  = $('#totalPrice em'),                          //总价格
	      bidDayObj     = $('.state1 .bidJ-pay-select .inp input'),     //自定义天数input
	      bidPopObj     = $('.bidJ-pay, .mask'),                        //浮动层和背景层
	      bidCloseObj   = $('.bidJ-pay-tit .close'),                    //关闭按钮
	      bidCurrObj    = $("#currPrice"),                              //当前每日预算
	      bidEnd        = $("#bidEnd"),                                 //竞价结束时间
	      bidPriceObj1  = $('.state2 .bid-inp'),                        //每日增加预算input
	      bidAmountObj1 = $('.state2 .total-price'),                    //需要支付费用
	      isIncrease    = false,  //是否加价操作
	      bidID         = 0,      //要竞价的信息
	      bidCurrPrice  = 0,      //当前每日预算，异步获取
	      bidCurrDay    = 0;      //剩余竞价天数

	      //计算总价
	    computeBidAmount = function(){
	      var bidDayPrice = bidPriceObj.val();
	      var bidAmount = bidDayPrice * bidDefaultDay;
	      bidAmount = isNaN(bidAmount) || bidAmount < 0 ? 0 : bidAmount;
	      bidAmountObj.html(bidAmount.toFixed(2));
	    };

	  // 打开竞价
	  $('#list').delegate('.bid', 'click', function(){
	    var t = $(this), id = t.closest(".house-box").attr("data-id");
	    if(t.hasClass("load")) return false;

	    t.addClass("load");
	    bidID = id;

	    //验证信息状态
	    $.ajax({
	      "url": masterDomain + "/include/ajax.php?service=house&action=checkBidState",
	      "data": {"aid": id, "type": type},
	      "dataType": "jsonp",
	      success: function(data){
	        t.removeClass("load");
	        if(data && data.state == 100){
	          bidPopObj.show();

	          //加价
	          if(data.info.isbid){
	            isIncrease = true;
	            $(".bidJ-pay .state1").hide();
	            $(".bidJ-pay .state2").show();

	            bidCurrPrice = parseFloat(data.info.bid_price);
	            bidCurrDay   = (data.info.bid_end - data.info.now) / 24 / 3600;
	            bidCurrDay   = bidCurrDay <= 0 ? 1 : bidCurrDay;
	            bidCurrDay   = Math.ceil(bidCurrDay);
	            bidCurrObj.html(bidCurrPrice);
	            bidEnd.html(huoniao.transTimes(data.info.bid_end, 1));
	            bidPriceObj1.val(bidDefaultAdd).focus();
	            bidAmountObj1.html((bidDefaultAdd * bidCurrDay).toFixed(2));

	          }else{
	            isIncrease = false;
	            $(".bidJ-pay .state1").show();
	            $(".bidJ-pay .state2").hide();
	            console.log(bidDefault)
	            bidPriceObj.val(bidDefault).focus();
	            computeBidAmount();
	          }

	        }else{
	          alert(data.info);
	        }

	        //登录超时
	        if(data.state == 101){
	          location.reload();
	        }
	      },
	      error: function(){
	        t.removeClass("load");
	        alert(langData['siteConfig'][20][183]);
	      }
	    });

	  })

	  // 选择支付方式
	  $('.paybox ul li').click(function(){
	    $(this).addClass('on').siblings('li').removeClass('on');
	  })


	  // 竞价 计算总价
	  $('.day li').click(function(){
	    var t = $(this), val = t.text();
	    t.addClass('on').siblings('li').removeClass('on');
	    $('#dayCount').val('');
	    bidDefaultDay = parseInt(val);
	    computeBidAmount();
	  })

	  // 自定义天数
	  $('#dayCount').focus(function(){
	    $('.day li').removeClass('on');
	  })

	  $('#dayCount').keyup(function(){
	    bidDefaultDay = $(this).val();
	    computeBidAmount();
	  })

	  // 自定义预算
	  $('#dayprice').keyup(function(){
	    computeBidAmount();
	  })

	   // 每日增加预算
	  bidPriceObj1.keyup(function(){
	    var t = $(this), val = t.val();
	    if(isNaN(val) || val < 0){
	      t.val(0);
	      val = 0;
	    }
	    bidAmountObj1.html((val * bidCurrDay).toFixed(2));
	  });


	  // 选择支付方式
	  $('.bidbtn').click(function(){
	    // 加价
	    if(isIncrease){
	      var inpPrice1 = bidPriceObj1.val();
	      if (inpPrice1 == "" || isNaN(inpPrice1) || inpPrice1 == 0){
	        event.preventDefault();
	        alert(langData['siteConfig'][20][263]);
	        return false;
	      }
	    }else{
	      var dom = $('.day li').hasClass('on'), dayCount = $('#dayCount').val(), dayprice = $('#dayprice').val();
	      if (!dom && dayCount == "") {
	        alert(langData['siteConfig'][20][264]);
	        return false;
	      }else if(dayprice == ""){
	        alert(langData['siteConfig'][20][263]);
	        return false;
	      }
	    }

	    $('.bidJ-pay').fadeOut(300);

	    //如果不在客户端中访问，根据设备类型删除不支持的支付方式
	    if(appInfo.device == ""){
	        if(navigator.userAgent.toLowerCase().match(/micromessenger/)){
	            $("#alipay").remove();
	        }
	    }
	    $(".paybox li:eq(0)").addClass("on");

	    setTimeout(function(){
	      $('.bidJ-pay').hide();
	    }, 300);
	    $('.paybox').addClass('show').animate({"bottom":"0"},300);
	  })

	  // 支付
	  $('.paybtn').click(function(){
	    var t = $(this);
	    var inpPrice = bidPriceObj.val();
	    var inpPrice1 = bidPriceObj1.val();
	    var paytype = $(".paybox .on").data("type");
	    //加价
	    if(isIncrease){

	      if (inpPrice1 == "" || isNaN(inpPrice1) || inpPrice1 == 0){
	        event.preventDefault();
	        alert(langData['siteConfig'][20][263]);
	        return false;
	      }

	      if(paytype == "" || paytype == undefined || paytype == null){
	        event.preventDefault();
	        alert(langData['siteConfig'][20][203]);
	        return false;
	      }

	      var url = t.data("url1").replace("$aid", bidID).replace("$price", inpPrice1).replace("$paytype", paytype);
	      t.attr("href", url);


	    //正常竞价
	    }else{
	      if(!bidID){
	        event.preventDefault();
	        alert(langData['siteConfig'][20][265]);
	        bidCloseObj.click();
	        return false;
	      }

	      if (bidDefaultDay == "" || isNaN(bidDefaultDay) || bidDefaultDay == 0) {
	        event.preventDefault();
	        alert(langData['siteConfig'][20][266]);
	        return false;
	      }

	      if (inpPrice == "" || isNaN(inpPrice) || inpPrice == 0){
	        event.preventDefault();
	        alert(langData['siteConfig'][20][263]);
	        return false;
	      }

	      if(paytype == "" || paytype == undefined || paytype == null){
	        event.preventDefault();
	        alert(langData['siteConfig'][20][203]);
	        return false;
	      }

	      var url = t.data("url").replace("$aid", bidID).replace("$price", inpPrice).replace("$day", bidDefaultDay).replace("$paytype", paytype);
	      t.attr("href", url);
	    }

	    //客户端中支付
	    if(appInfo.device != ""){
	        t.attr("href", url+"&app=1");
	    }

	    setTimeout(function(){
	      $('.paybox').removeClass('show');
	      $('.mask').hide();
	    }, 500);
	  })

	  // 点击遮罩层
	  $('.mask').on('click',function(){
	    $('.mask').hide();
	    $('.bidJ-pay').hide();
	    $('.paybox').animate({"bottom":"-100%"},300)
	    setTimeout(function(){
	      $('.paybox').removeClass('show');
	    }, 300);
	    $('body').removeClass('fixed');
	  })


	  // 关闭竞价
	  $('.bidJ-pay .close').click(function(){
	    $('.bidJ-pay, .mask').hide();
	    $('body').removeClass('fixed');
	  })


  // 删除
  objId.delegate(".del", "click", function(){
    var t = $(this), par = t.closest(".house-box"), id = par.attr("data-id"), type = $('.house-type .active').attr('data-type');
    if(id){
      if(confirm(langData['siteConfig'][20][211])){
        $.ajax({
          url: masterDomain+"/include/ajax.php?service=house&type="+type+"&action=del&id="+id,
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
            if(data && data.state == 100){

              //删除成功后移除信息层并异步获取最新列表
              objId.html('');
              getList(1);

            }else{
              alert(data.info);
              t.siblings("a").show();
              t.removeClass("load");
            }
          },
          error: function(){
            alert(langData['siteConfig'][20][183]);
            t.siblings("a").show();
            t.removeClass("load");
          }
        });
      }
    }
  });



  // 发布
  $('#fabubtn').click(function(){
    var box = $('.fabuBox');
    if (!box.hasClass('open')) {
      $('body,html').bind('touchmove', function(e){e.preventDefault();})
      box.addClass('open');
      $('.bg_1').addClass('show');
    }else {
      $('body,html').unbind('touchmove')
      box.removeClass('open');
      $('.bg_1').removeClass('show');
    }
  })

  $('.fabuBox .cancel').click(function(){
    $('.fabuBox').addClass('close');
    setTimeout(function(){
      $('body,html').unbind('touchmove');
      $('.fabuBox').removeClass('open close');
      $('.bg_1').removeClass('show');
    }, 600)
  })




  // 下拉加载
  $(window).scroll(function() {
    var h = $('.house-box').height();
    var allh = $('body').height();
    var w = $(window).height();
    var scroll = allh - w - h;
    if ($(window).scrollTop() > scroll && !isload) {
      atpage++;
      getList();
    };
  });

  getList(1);

  // 获取房屋列表
  function getList(is){
    isload = true;
    if(is != 1){}
    objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
		var type = $('.house-type .active').attr('data-type'),
				lei = $('.typebox .'+type).find('.active').attr('data-id');

    var t = "type="+lei;
    if(type == "zu") t = "rentype="+lei;

    var action = $('.house-type .active').attr('data-action');

    $.ajax({
    	url: masterDomain+"/include/ajax.php?service=house&action="+action+"&"+t+"&u=1&orderby=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
    	type: "GET",
    	dataType: "jsonp",
    	success: function (data) {
    		if(data && data.state != 200){
    			if(data.state == 101){
    				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
    			}else{
    				var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

    				//拼接列表
    				if(list.length > 0){

    					var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
    					var param = t + "do=edit&type="+type+"&id=";
    					var urlString = editUrl + param;

    					for(var i = 0; i < list.length; i++){
    						var item        = [],
    								id          = list[i].id,
    								title       = list[i].title,
    								community   = list[i].community,
    								addr        = list[i].addr,
    								price       = list[i].price,
    								url         = list[i].url,
    								litpic      = list[i].litpic,
    								protype     = list[i].protype,
    								room        = list[i].room,
    								bno         = list[i].bno,
    								floor       = list[i].floor,
    								area        = list[i].area,
                    isbid       = list[i].isbid,
                    bid_price   = list[i].bid_price,
    								pubdate     = list[i].pubdate;

    						//求租
    						if(type == "qzu" || type == "qgou"){

    							var action = list[i].action;

    							html.push('<div class="item qiu fn-clear" data-id="'+id+'">');
    							html.push('<div class="o"><a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
    							html.push('<div class="i">');

    							var state = "";
    							if(list[i].state == "0"){
    								state = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][9][21]+'</span>';
    							}else if(list[i].state == "2"){
    								state = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';
    							}

    							var protype = "";
    							switch(action){
    								case "1":
    									protype = langData['siteConfig'][19][764];
    									break;
    								case "2":
    									protype = langData['siteConfig'][19][218];
    									break;
    								case "3":
    									protype = langData['siteConfig'][19][219];
    									break;
    								case "4":
    									protype = langData['siteConfig'][19][220];
    									break;
    								case "5":
    									protype = langData['siteConfig'][19][221];
    									break;
    								case "6":
    									protype = langData['siteConfig'][19][222];
    									break;
    							}

    							html.push('<p>'+langData['siteConfig'][19][84]+'：'+protype+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][8]+'：'+addr+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][11][8]+'：'+huoniao.transTimes(pubdate, 1)+state+'</p>');
    							html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a></h5>');
    							html.push('</div>');
    							html.push('</div>');

    						//二手房
    						}else if(type == "sale"){

    							var unitprice   = list[i].unitprice;

    							html.push('<div class="house-box" data-id="'+id+'">');
    							html.push('<div class="house-item fn-clear">');
    							if(litpic != "" && litpic != undefined){
    								html.push('<div class="house-img fn-left">');
                    html.push('<a href="'+url+'">');
    								html.push('<img src="'+huoniao.changeFileSize(litpic, "small")+'" />');
    								html.push('</a>');
    								html.push('</div>');
    							}
    							html.push('<dl>');
    							html.push('<dt>'+title+'</dt>');
    							html.push('<dd class="item-area"><em>'+addr+'</em><em>'+bno+'/'+floor+langData['siteConfig'][13][12]+'</em><span class="price fn-right">'+price+langData['siteConfig'][13][27]+echoCurrency('short')+'</span></dd>');
    							html.push('<dd class="item-type-1"><em>'+community+'</em><em>'+langData['siteConfig'][19][85]+':'+area+echoCurrency('areasymbol')+'</em><em>'+room+'</em><em>'+protype+'</em></dd>');

    							html.push('<dd class="item-type-2">');
                  if(list[i]['state'] == 1){
                    if(isbid == 1){
	                      html.push('<a href="javascript:;" class="bid">'+langData['siteConfig'][6][17]+'</a>')
                    }else{
	                      html.push('<a href="javascript:;" class="bid">'+langData['siteConfig'][6][16]+'</a></a>')
                    }
                  }
	                  html.push('<a href="'+urlString+id+'" class="edit">'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>')
                  html.push('</dd>');
    							html.push('</dl>');
    							html.push('</div>');

    							html.push('</div>');
    							html.push('</div>');

    						//出租房
    						}else if(type == "zu"){

    							var zhuangxiu = list[i].zhuangxiu,
    									rentype   = list[i].rentype;

                  html.push('<div class="house-box" data-id="'+id+'">');
    							html.push('<div class="house-item fn-clear">');
    							if(litpic != "" && litpic != undefined){
    								html.push('<div class="house-img fn-left">');
                    html.push('<a href="'+url+'">');
    								html.push('<img src="'+huoniao.changeFileSize(litpic, "small")+'" />');
    								html.push('</a>');
    								html.push('</div>');
    							}
    							html.push('<dl>');
    							html.push('<dt>'+title+'</dt>');
    							html.push('<dd class="item-area"><em>'+addr+'</em><em>'+bno+'/'+floor+langData['siteConfig'][13][12]+'</em><em>'+rentype+'</em><span class="price fn-right">'+price+echoCurrency('short')+'</span></dd>');
    							html.push('<dd class="item-type-1"><em>'+community+'</em><em>'+langData['siteConfig'][6][6]+':'+area+echoCurrency('areasymbol')+'</em><em>'+room+'</em><em>'+protype+'</em></dd>');
    							html.push('<dd class="item-type-2">');
                  if(list[i]['state'] == 1){
                    if(isbid == 1){
	                      html.push('<a href="javascript:;" class="bid">'+langData['siteConfig'][6][17]+'</a>')
                    }else{
	                      html.push('<a href="javascript:;" class="bid">'+langData['siteConfig'][6][16]+'</a></a>')
                    }
                  }
	                  html.push('<a href="'+urlString+id+'" class="edit">'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>')
                  html.push('</dd>');
    							html.push('</dl>');
    							html.push('</div>');
    							html.push('</div>');


    						//写字楼
    						}else if(type == "xzl"){

    							var loupan = list[i].loupan;

                  html.push('<div class="house-box" data-id="'+id+'">');
    							html.push('<div class="house-item fn-clear">');
    							if(litpic != "" && litpic != undefined){
    								html.push('<div class="house-img fn-left">');
                    html.push('<a href="'+url+'">');
    								html.push('<img src="'+huoniao.changeFileSize(litpic, "small")+'" />');
    								html.push('</a>');
    								html.push('</div>');
    							}
    							html.push('<dl>');
    							html.push('<dt>'+title+'</dt>');

                  var p = lei == 0 ? ''+echoCurrency('short')+'/'+langData['siteConfig'][13][18] : langData['siteConfig'][13][27]+echoCurrency('short')+'';

    							html.push('<dd class="item-area"><em>'+addr+'</em><span class="price fn-right">'+price+p+'</span></dd>');
    							html.push('<dd class="item-type-1"><em>'+loupan+'</em><em>'+langData['siteConfig'][6][6]+':'+area+echoCurrency('areasymbol')+'</em><em>'+protype+'</em></dd>');
    							html.push('<dd class="item-type-2">');
                  if(list[i]['state'] == 1){
                    if(isbid == 1){
	                      html.push('<a href="javascript:;" class="bid">'+langData['siteConfig'][6][17]+'</a>')
                    }else{
	                      html.push('<a href="javascript:;" class="bid">'+langData['siteConfig'][6][16]+'</a></a>')
                    }
                  }
	                  html.push('<a href="'+urlString+id+'" class="edit">'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>')
                  html.push('</dd>');
    							html.push('</dl>');
    							html.push('</div>');
    							html.push('</div>');


    						//商铺
    						}else if(type == "sp"){

    							var transfer = list[i].transfer,
    									address  = list[i].address;

                  html.push('<div class="house-box" data-id="'+id+'">');
    							html.push('<div class="house-item fn-clear">');
    							if(litpic != "" && litpic != undefined){
    								html.push('<div class="house-img fn-left">');
                    html.push('<a href="'+url+'">');
    								html.push('<img src="'+huoniao.changeFileSize(litpic, "small")+'" />');
    								html.push('</a>');
    								html.push('</div>');
    							}
    							html.push('<dl>');
    							html.push('<dt>'+title+'</dt>');

                  var p = lei == 0 ? ''+echoCurrency('short')+'/'+langData['siteConfig'][13][18] : langData['siteConfig'][13][27]+echoCurrency('short')+'';

    							html.push('<dd class="item-area"><em>'+addr+'</em><span class="price fn-right">'+price+p+'</span></dd>');
    							html.push('<dd class="item-type-1"><em>'+protype+'</em><em>'+langData['siteConfig'][6][6]+':'+area+echoCurrency('areasymbol')+'</em><em>'+address+'</em></dd>');
    							html.push('<dd class="item-type-2">');
                  if(list[i]['state'] == 1){
                    if(isbid == 1){
	                      html.push('<a href="javascript:;" class="bid">'+langData['siteConfig'][6][17]+'</a>')
                    }else{
	                      html.push('<a href="javascript:;" class="bid">'+langData['siteConfig'][6][16]+'</a></a>')
                    }
                  }
	                  html.push('<a href="'+urlString+id+'" class="edit">'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>')
                  html.push('</dd>');
    							html.push('</dl>');
    							html.push('</div>');
    							html.push('</div>');


    						//厂房、仓库
    						}else if(type == "cf"){

    							var transfer = list[i].transfer,
    									address  = list[i].address;

                  html.push('<div class="house-box" data-id="'+id+'">');
    							html.push('<div class="house-item fn-clear">');
    							if(litpic != "" && litpic != undefined){
    								html.push('<div class="house-img fn-left">');
                    html.push('<a href="'+url+'">');
    								html.push('<img src="'+huoniao.changeFileSize(litpic, "small")+'" />');
    								html.push('</a>');
    								html.push('</div>');
    							}
    							html.push('<dl>');
    							html.push('<dt>'+title+'</dt>');

                  var p = lei == 0 ? ''+echoCurrency('short')+'/'+langData['siteConfig'][13][27] : langData['siteConfig'][13][27]+echoCurrency('short')+'';

    							html.push('<dd class="item-area"><em>'+addr+'</em><span class="price fn-right">'+price+p+'</span></dd>');
    							html.push('<dd class="item-type-1"><em>'+protype+'</em><em>'+langData['siteConfig'][6][6]+':'+area+echoCurrency('areasymbol')+'</em><em>'+address+'</em></dd>');
    							html.push('<dd class="item-type-2">');
                  if(list[i]['state'] == 1){
                    if(isbid == 1){
	                      html.push('<a href="javascript:;" class="bid">'+langData['siteConfig'][6][17]+'</a>')
                    }else{
	                      html.push('<a href="javascript:;" class="bid">'+langData['siteConfig'][6][16]+'</a></a>')
                    }
                  }
	                  html.push('<a href="'+urlString+id+'" class="edit">'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>')
                  html.push('</dd>');
    							html.push('</dl>');
    							html.push('</div>');
    							html.push('</div>');


    						}

    					}

    					objId.append(html.join(""));
              $('.loading').remove();
              isload = false;

    				}else{
              $('.loading').remove();
    					objId.append("<p class='loading'>"+langData['siteConfig'][20][185]+"</p>");
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
    						totalCount = pageInfo.refuse;
    						break;
    				}


    				$("#total").html(pageInfo.totalCount);
    				$("#audit").html(pageInfo.audit);
    				$("#gray").html(pageInfo.gray);
    				$("#refuse").html(pageInfo.refuse);
    				$("#expire").html(pageInfo.expire);
    			}
    		}else{
    			$("#total").html(0);
    			$("#audit").html(0);
    			$("#gray").html(0);
    			$("#refuse").html(0);
    			$("#expire").html(0);
    			objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
    		}
    	}
    });

  }


})
