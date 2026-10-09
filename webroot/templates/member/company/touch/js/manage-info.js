/**
 * 会员中心分类信息列表
 * by guozi at: 20150627
 */

 var uploadErrorInfo = [],
 	huoniao = {

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

 	//将普通时间格式转成UNIX时间戳
 	,transToTimes: function(timestamp){
 		var new_str = timestamp.replace(/:/g,'-');
     new_str = new_str.replace(/ /g,'-');
     var arr = new_str.split("-");
     var datum = new Date(Date.UTC(arr[0],arr[1]-1,arr[2],arr[3]-8,arr[4],arr[5]));
     return datum.getTime()/1000;
 	}


 	//判断登录成功
 	,checkLogin: function(fun){
 		//异步获取用户信息
 		$.ajax({
 			url: masterDomain+'/getUserInfo.html',
 			type: "GET",
 			async: false,
 			dataType: "jsonp",
 			success: function (data) {
 				if(data){
 					fun();
 				}
 			},
 			error: function(){
 				return false;
 			}
 		});
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
 		if(hideFileUrl == 1){
 			return url + "&type=" + to;
 		}else{
 			return url.replace(from, to);
 		}
 	}

 	//获取字符串长度
 	//获得字符串实际长度，中文2，英文1
 	,getStrLength: function(str) {
 		var realLength = 0, len = str.length, charCode = -1;
 		for (var i = 0; i < len; i++) {
 		charCode = str.charCodeAt(i);
 		if (charCode >= 0 && charCode <= 128) realLength += 1;
 		else realLength += 2;
 		}
 		return realLength;
 	}



 	//删除已上传的图片
 	,delAtlasImg: function(mod, obj, path, listSection, delBtn){
 		var g = {
 			mod: mod,
 			type: "delAtlas",
 			picpath: path,
 			randoms: Math.random()
 		};
 		$.ajax({
 			type: "POST",
 			cache: false,
 			async: false,
 			url: "/include/upload.inc.php",
 			dataType: "json",
 			data: $.param(g),
 			success: function() {}
 		});
 		$("#"+obj).remove();

 		if($("#"+listSection).find("li").length < 1){
 			$("#"+listSection).hide();
 			$("#"+delBtn).hide();
 		}
 	}

 	//异步操作
 	,operaJson: function(url, action, callback){
 		$.ajax({
 			url: url,
 			data: action,
 			type: "POST",
 			dataType: "json",
 			success: function (data) {
 				typeof callback == "function" && callback(data);
 			},
 			error: function(){

 				$.post("../login.php", "action=checkLogin", function(data){
 					if(data == "0"){
 						huoniao.showTip("error", langData['siteConfig'][20][262]);
 						setTimeout(function(){
 							location.reload();
 						}, 500);
 					}else{
 						huoniao.showTip("error", langData['siteConfig'][20][183]);
 					}
 				});

 			}
 		});
 	}



 }
var objId = $("#list");

$(function(){

	//导航
	$('.header-r .screen').click(function(){
		var nav = $('.nav'), t = $('.nav').css('display') == "none";
		if (t) {nav.show();}else{nav.hide();}
	})


	//项目
	$(".tab .type").bind("click", function(){
	var t = $(this), id = t.attr("data-id"), index = t.index();
	if(!t.hasClass("curr") && !t.hasClass("sel")){
		state = id;
		atpage = 1;
	$('.count li').eq(index).show().siblings("li").hide();
		t.addClass("curr").siblings("li").removeClass("curr");
	$('#list').html('');
		getList(1);
	}
	});


	var bidDefaultDay = parseInt($(".day .on").text()),               //默认时长为选中的天数
      bidPriceObj   = $('#dayprice'),                               //每日预算input
      bidAmountObj  = $('#totalPrice em'),                          //总价格
      bidDayObj     = $('.state1 .bidJ-pay-select .inp input'),     //自定义天数input
      bidPopObj     = $('.bidJ-pay, .mask'),                        //浮动层和背景层
      bidCloseObj   = $('.bidJ-pay-tit .close'),                    //关闭按钮
      bidCurrObj    = $("#currPrice"),                              //当前每日预算
      bidEnd        = $("#bidEnd"),                                 //竞价结束时间
      bidPriceObj1  = $('.state2 .bid-inp'),                        //每日增加预算input
      bidAmountObj1 = $('.state2 .total-price em'),     //需要支付费用
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
    var t = $(this), id = t.closest(".item").attr("data-id");
    if(t.hasClass("load")) return false;

    t.addClass("load");
    bidID = id;

    //验证信息状态
    $.ajax({
      "url": masterDomain + "/include/ajax.php?service=info&action=checkBidState",
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
            $("#alipay, #globalalipay").remove();
        }
    }
    $(".paybox li:eq(0)").addClass("on");

    setTimeout(function(){
      $('.bidJ-pay').hide();
    }, 300);
    $('.paybox').addClass('show').animate({"bottom":"0"},300);
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
    var dom = $('.day li').hasClass('on'), dayCount = $('#dayCount').val(), dayprice = $('#dayprice').val();
    if (!dom && dayCount == "") {
      alert(langData['siteConfig'][20][264]);
    }else if(dayprice == ""){
      alert(langData['siteConfig'][20][263]);
    }
    else {
      $('.bidJ-pay').fadeOut(300);
      setTimeout(function(){
        $('.bidJ-pay').hide();
      }, 300);
      $('.paybox').addClass('show').animate({"bottom":"0"},300);
    }
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

	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			if(confirm(langData['siteConfig'][20][211])){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=info&action=del&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//删除成功后移除信息层并异步获取最新列表
							objId.html('')
              				getList(1);

						}else{
							$.dialog.alert(data.info);
							t.siblings("a").show();
							t.removeClass("load");
						}
					},
					error: function(){
						alert(langData['siteConfig'][20][227]);
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			}
		}
	});






});

function getList(is){

  isload = true;

	if(is != 1){
		// $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=info&action=ilist&u=1&orderby=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
          $('.count span').text(0);
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){

						var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
						var param = t + "do=edit&id=";
						var urlString = editUrl + param;

						for(var i = 0; i < list.length; i++){
							var item        = [],
									id          = list[i].id,
									title       = list[i].title,
									color       = list[i].color,
									address     = list[i].address,
									typename    = list[i].typename,
									url         = list[i].url,
									litpic      = list[i].litpic,
									click       = list[i].click,
									common      = list[i].common,
									isbid       = list[i].isbid,
                  isvalid     = list[i].isvalid,
									bid_price   = list[i].bid_price,
									is_valid    = list[i].is_valid,
									bid_end     = huoniao.transTimes(list[i].bid_end, 1),
									pubdate     = huoniao.transTimes(list[i].pubdate, 1);

							html.push('<div class="item" data-id="'+id+'">');
							html.push('<div class="title">'+typename+'</div>');
							html.push('<div class="info-item fn-clear">');
							if(litpic != "" && litpic != undefined){
								html.push('<div class="info-img fn-left"><a href="'+url+'"><img src="'+huoniao.changeFileSize(litpic, "small")+'" /></a></div>');
							}
							html.push('<dl>');
							html.push('<dt><a href="'+url+'">'+title+'</a></dt>');
							html.push('<dd class="item-area"><em>'+langData['siteConfig'][19][8]+'：'+address+'</em></dd>');
							html.push('<dd class="item-type-1"><em> '+langData['siteConfig'][19][394]+'：'+click+langData['siteConfig'][13][26]+' </em><em>'+langData['siteConfig'][6][114]+'：'+common+'</em></dd>');
							html.push('<dd class="item-type-2">'+langData['siteConfig'][11][8]+'：'+pubdate+'</dd>');
							if(is_valid==1){
								html.push('<dd class="item-type-2"><font color="#f00">'+langData['siteConfig'][31][132]+'</font></dd>');//此商品已售完
							}
							html.push('</dl>');
							html.push('</div>');
							html.push('<div class="o fn-clear">');
  							html.push('<a href="'+urlString+id+'" class="edit">'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');
              if(list[i].arcrank == "1" && !isvalid){
								if(isbid == 1){
      							html.push('<a href="javascript:;" class="bid">'+langData['siteConfig'][19][78]+'：'+bid_price+'，'+langData['siteConfig'][6][17]+'</a>');
                }else{
                    html.push('<a href="javascript:;" class="bid">'+langData['siteConfig'][6][16]+'</a>');
                }
              }
							html.push('</div>');
							html.push('</div>');
							html.push('</div>');

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
						case "4":
							totalCount = pageInfo.expire;
							break;
					}

					$("#total").html(pageInfo.totalCount);
					$("#audit").html(pageInfo.audit);
					$("#gray").html(pageInfo.gray);
					$("#refuse").html(pageInfo.refuse);
					$("#expire").html(pageInfo.expire);
					// showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
        $('.count span').text(0);
			}
		}
	});
}
