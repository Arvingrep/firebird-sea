$(function(){

    var userid = $.cookie(cookiePre + "login_user");

    //原生APP后退回来刷新页面
    pageBack = function(data) {
        setupWebViewJavascriptBridge(function(bridge) {
            bridge.callHandler("pageRefresh", {}, function(responseData){});
        });
    }

    function getParam(paramName) {
      paramValue = "", isFound = !1;
      if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
          arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
          while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
      }
      return paramValue == "" && (paramValue = null), paramValue
  }
  console.log(getParam('module'))
  var moduleName = getParam('module');

  //app
  var deviceUserAgent = navigator.userAgent;
  if (deviceUserAgent.indexOf('huoniao') > -1 && getParam('from') == null) {

    $(".grEnter").bind('click', function(e){
        e.preventDefault();
        // setupWebViewJavascriptBridge(function(bridge) {
        //     bridge.callHandler("goBack", {}, function (responseData) { });
        // })
        var href = ''
        if(moduleName){
	        var Tourl = memberDomain+'/index_'+moduleName+'.html'+isAppLink
	        // location.href = Tourl
	        href = Tourl
	    }else{
	        var Tourl = memberDomain+isAppLink
	        href = Tourl
	    }
        window.location.href = href
    })

  }else{

    if(moduleName){
        var Tourl = memberDomain+'/index_'+moduleName+'.html'+isAppLink
        $(".grEnter").attr('href',Tourl)
    }else{
        var Tourl = memberDomain+isAppLink
        if (deviceUserAgent.indexOf('huoniao') > -1){
            $(".grEnter").attr('href',memberDomain)
        }else{
            $(".grEnter").attr('href',Tourl)
        }
    }

  }

  function getData(){
    var date = new Date();

    //今日收益
    if($('.today-money').size() > 0){
        $.ajax({
          url: '/include/ajax.php?service=member&action=statisticsDateRevenue',
          type: 'get',
          dataType: 'json',
          success: function(data){
            var totalAmount = totalCount = 0;
            if(data && data.state == 100){
              var list = data.info, html = [];
              for(var i = 0; i < list.length; i++){
                var item = [];
                var obj = list[i],
                    module = obj.module,
                    amount = obj.amount,
                    count = obj.count;
                totalAmount += parseFloat(amount)
              }
            }
            $('.today-money').text(totalAmount);//今日收益
          },
          error: function(){

          }
        })
    }


    //店铺评论
    if($('#comment_good_ratio').size() > 0){
        $.ajax({
          url: '/include/ajax.php?service=member&action=getComment&type=business&aid='+businessId+'&oid=0&page=1&pageSize=1',
          type: 'get',
          dataType: 'json',
          success: function(data){
            if(data && data.state == 100){
              var pageInfo = data.info.pageInfo;
              $('#comment_good_ratio').html(parseInt((pageInfo.sco4+pageInfo.sco5)/pageInfo.totalCount*100 ) + '<small>%</small>');
              $('#comment_good').text(parseInt(pageInfo.sco4 + pageInfo.sco5));
              $('#comment_middle').text(parseInt(pageInfo.sco2 + pageInfo.sco3));
              $('#comment_bad').text(parseInt(pageInfo.sco1));
            }
          },
          error: function(){

          }
        })
    }


    //订单信息
    if($('.order-unused').size() > 0){
        $.ajax({
          url: '/include/ajax.php?service=member&action=storeOrderList&page=1&pageSize=1',
          type: 'get',
          dataType: 'json',
          success: function(data){
            if(data && data.state == 100){
              var list = data.info;
              var pageInfo = list.pageInfo;
              $('.order-unused').html(pageInfo.unused);
              $('.order-recei').html(pageInfo.recei);
              $('.order-refund').html(pageInfo.refund);
              $('.order-used').html(pageInfo.used);
            }
          },
          error: function(){

          }
        })
    }




    //获取点餐订单信息
    if($('#diancanObj').size() > 0){

        //未处理
        $.ajax({
            url: "/include/ajax.php?service=business&action=diancanOrder&u=1&pageSize=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var pageInfo = data.info.pageInfo;
                    var totalGray = parseInt(pageInfo.totalGray);
                    if(totalGray){
                        $('#diancanObj').append('<span class="pai-num">'+totalGray+langData['siteConfig'][13][21]+'</span>');
                    }
                }
            }
        });

    }

    //获取订座订单信息
    if($('#dingzuoObj').size() > 0){

        //未处理
        $.ajax({
            url: "/include/ajax.php?service=business&action=dingzuoOrder&u=1&pageSize=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var pageInfo = data.info.pageInfo;
                    var totalGray = parseInt(pageInfo.totalGray);
                    if(totalGray){
                        $('#dingzuoObj').append('<span class="pai-num">'+totalGray+langData['siteConfig'][13][21]+'</span>');
                    }
                }
            }
        });

    }

    //获取排队订单信息
    if($('#paiduiObj').size() > 0){

        //未处理
        $.ajax({
            url: "/include/ajax.php?service=business&action=paiduiOrder&u=1&pageSize=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var pageInfo = data.info.pageInfo;
                    var totalGray = parseInt(pageInfo.totalGray);
                    if(totalGray){
                        $('#paiduiObj').append('<span class="pai-num">'+totalGray+langData['siteConfig'][13][21]+'</span>');
                    }
                }
            }
        });

    }

    //获取买单订单信息
    if($('#maidanObj').size() > 0){

        //未处理
        $.ajax({
            url: "/include/ajax.php?service=business&action=maidanOrder&u=1&today=1&pageSize=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var pageInfo = data.info.pageInfo;
                    var totalAudit = parseInt(pageInfo.totalAudit);
                    if(totalAudit){
                        $('#maidanObj').append('<span class="dot"></span>');
                    }
                }
            }
        });

    }

    //获取信息订单信息
    if($('#infoOrderObj').size() > 0){

        //未处理
        $.ajax({
            url: "/include/ajax.php?service=info&action=orderList&store=1&pageSize=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var pageInfo = data.info.pageInfo;
                    var ongoing = parseInt(pageInfo.ongoing);
                    if(ongoing){
                        $('#infoOrderObj').append('<span class="dot"></span>');
                    }
                }
            }
        });

    }

    //获取房产信息
    if($('#house_receive_broker').size() > 0){

        //入驻申请
        $.ajax({
            url: "/include/ajax.php?service=house&action=zjUserList&iszjcom=1&comid="+house_com_id+"&u=1&state=0&pageSize=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var pageInfo = data.info.pageInfo;
                    var house_receive_broker = parseInt(pageInfo.state0);
                    if(house_receive_broker){
                        $('#house_receive_broker').append('<span class="dot"></span>');
                    }
                }
            }
        });

        //房源委托
        $.ajax({
            url: "/include/ajax.php?service=house&action=myEntrust&iszjcom=1&u=1&state=0&pageSize=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var pageInfo = data.info.pageInfo;
                    var house_entrust = parseInt(pageInfo.state0);
                    if(house_entrust){
                        $('#house_entrust').append('<span class="dot"></span>');
                    }
                }
            }
        });

    }

    //获取招聘信息
    if($('#job_resume').size() > 0){

        //简历
        $.ajax({
            url: "/include/ajax.php?service=job&action=deliveryList&type=company&state=0&pageSize=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var pageInfo = data.info.pageInfo;
                    var state0 = parseInt(pageInfo.state0);
                    if(state0){
                        $('#job_resume').append('<span class="new-resume">'+langData['siteConfig'][6][214]+'</span>');  //新投递
                    }
                }
            }
        });

    }

    //获取商城订单信息
    if($('#shop_order').size() > 0){

        //未处理
        $.ajax({
            url: "/include/ajax.php?service=shop&action=orderList&store=1&pageSize=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var pageInfo = data.info.pageInfo;
                    var ongoing = parseInt(pageInfo.ongoing);
                    if(ongoing){
                        $('#shop_order').append('<span class="dot"></span>');
                    }
                }
            }
        });

    }

    //获取外卖订单信息
    if($('#waimai_order').size() > 0){

        //未处理
        $.ajax({
            url: "/wmsj/order/waimaiOrder.php?action=getList&state=2&p=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var totalCount = parseInt(data.info.pageInfo.totalCount);
                    if(totalCount){
                        $('#waimai_order').append('<span class="dot"></span>');
                    }
                }
            }
        });

    }

    //获取团购订单信息
    if($('#tuan_order').size() > 0){

        //未处理
        $.ajax({
            url: "/include/ajax.php?service=tuan&action=orderList&store=1&pageSize=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var pageInfo = data.info.pageInfo;
                    var ongoing = parseInt(pageInfo.ongoing);
                    if(ongoing){
                        $('#tuan_order').append('<span class="dot"></span>');
                    }
                }
            }
        });

    }

    //获取养老信息
    if($('#pension_booking').size() > 0){

        //预约
        $.ajax({
            url: "/include/ajax.php?service=pension&action=bookingList&u=1&pageSize=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var pageInfo = data.info.pageInfo;
                    var gray = parseInt(pageInfo.gray);
                    if(gray){
                        $('#pension_booking').append('<span class="dot"></span>');
                    }
                }
            }
        });

        //入住
        $.ajax({
            url: "/include/ajax.php?service=pension&action=awardList&u=1&pageSize=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var pageInfo = data.info.pageInfo;
                    var gray = parseInt(pageInfo.gray);
                    if(gray){
                        $('#pension_award').append('<span class="dot"></span>');
                    }
                }
            }
        });

        //邀请
        $.ajax({
            url: "/include/ajax.php?service=pension&action=invitationList&u=1&pageSize=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var pageInfo = data.info.pageInfo;
                    var gray = parseInt(pageInfo.gray);
                    if(gray){
                        $('#pension_invitation').append('<span class="dot"></span>');
                    }
                }
            }
        });

    }

    //获取家政信息
    if($('#homemaking_order').size() > 0){

        $.ajax({
            url: "/include/ajax.php?service=homemaking&action=orderList&store=1&pageSize=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var pageInfo = data.info.pageInfo;
                    var state0 = parseInt(pageInfo.state0);
                    if(state0){
                        $('#homemaking_order').append('<span class="dot"></span>');
                    }
                }
            }
        });

    }

    //获取汽车信息
    if($('#car_appoint').size() > 0){

        $.ajax({
            url: "/include/ajax.php?service=car&action=storeAppointList&store="+car_com_id+"&pageSize=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var pageInfo = data.info.pageInfo;
                    var state0 = parseInt(pageInfo.state0);
                    if(state0){
                        $('#car_appoint').append('<span class="dot"></span>');
                    }
                }
            }
        });

    }

    //获取装修信息
    if($('#renovation_booking').size() > 0){

        //预约
        $.ajax({
            url: "/include/ajax.php?service=renovation&action=rese&u=1&pageSize=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var pageInfo = data.info.pageInfo;
                    var state0 = parseInt(pageInfo.state0);
                    if(state0){
                        $('#renovation_booking').append('<span class="dot"></span>');
                    }
                }
            }
        });

    }

  }

  if (userid) {
      setTimeout(function(){
          getData();
      }, 2000);
  }

  //app
  if (deviceUserAgent.indexOf('huoniao') > -1) {    
    $('.sj-other').show();
    $('.sj-mobile').hide();
    $('body').delegate('.saveImg-app','click',function(){
      var imgsrc = $(".html2_imgSj").find('img').attr('src');
      if(device.indexOf('huoniao_Android') > -1){
			utils.setStorage("huoniao_poster", imgsrc);
			setupWebViewJavascriptBridge(function(bridge) {
			    bridge.callHandler(
			        'saveImage',
			        {'value': "huoniao_poster"},
			        function(responseData){
			            if(responseData == "success"){
			                setTimeout(function(){
			                    flag=1;
			                }, 200)
			            }
			        }
			    );
			});
		}else{
          setupWebViewJavascriptBridge(function(bridge) {
            bridge.callHandler(
              'saveImage',
              {'value': imgsrc},
              function(responseData){
                if(responseData == "success"){
                  alert('111')
                }else{
                  alert(responseData)
                }

              },

            );
          });

        }
      
    })
  }

  //微信小程序
  //if(window.__wxjs_environment == 'miniprogram'){
  //    $('.sj-other').show();
  //    $('.sj-mobile').hide();
//  }


  // 生成商家二维码保存
  $(document).delegate('.qr','click',function(e){
    $('html').addClass('noscroll')
    $(".html2_mask2").show();
    $('.html2canvas_fixed').addClass('show');

    getdetail_poster();
  });

  if(deviceUserAgent.indexOf('huoniao') <= -1 && !deviceUserAgent.toLowerCase().match(/micromessenger/)){
  	$(".qr_scan").remove();
  }

  // 扫一扫
  $(".qr_scan").click(function(){
    //APP端
		if(deviceUserAgent.indexOf('huoniao') > -1){
			setupWebViewJavascriptBridge(function(bridge) {
				bridge.callHandler("QRCodeScan", {}, function callback(DataInfo){
					if(DataInfo){
						// APP端已做处理，不需要前端跳转
						// if(DataInfo.indexOf('http') > -1){
						// 	location.href = DataInfo;
						// }else{
						// 	alert(DataInfo);
						// }
					}
				});
			});

		//微信端
		}else if(deviceUserAgent.toLowerCase().match(/micromessenger/) && deviceUserAgent.toLowerCase().match(/iphone|android/)){

			wx.scanQRCode({
				// 默认为0，扫描结果由微信处理，1则直接返回扫描结果
				needResult : 1,
				desc: '扫一扫',
				success : function(res) {
					if(res.resultStr){
						if(res.resultStr.indexOf('http') > -1){
							if(wx_miniprogram){
								wx.miniProgram.navigateTo({url: '/pages/redirect/index?url=' + encodeURIComponent(res.resultStr)});
							}else{
								location.href = res.resultStr;
							}
						}else if(res.resultStr.indexOf('EAN_13,') > -1){
							var resultStr = res.resultStr.split('EAN_13,');
							if(wx_miniprogram){
								wx.miniProgram.navigateTo({url: '/pages/redirect/index?url=' + encodeURIComponent(masterDomain + '/include/ajax.php?service=shop&action=barcodeSearch&type=redirect&code=' + resultStr[1])});
							}else{
								location.href = '/include/ajax.php?service=shop&action=barcodeSearch&type=redirect&code=' + resultStr[1];
							}
						}else{
							alert(res.resultStr);
						}
					}
				},
				fail: function(err){
					alert(langData['siteConfig'][20][183]);
				}
			});

		//浏览器
		}else{
			$('.downloadAppFixed').css("visibility","visible");
			$('.downloadAppFixed .con').show();
		}

  })

  // 生成海报2
    function getdetail_poster(){
      if($('.html2Wrap').size()>0 ){
        var html2canvas_fixed = $('#html2canvas_fixed'),html2canvas_fixed_img = $('#html2canvas_fixed .html2_img img');
          if(html2canvas_fixed_img.size()==0){
            //生成图片
            html2canvas(document.querySelector("#html2_node"), {
                       'backgroundColor':null,
                       'useCORS':true,
                   'dpi': window.devicePixelRatio * 2,
                   'scale': 2,

              }).then(canvas => {
                  var a = canvasToImage(canvas);
                  $('#html2canvas_fixed .html2_img').html(a);
                  $(".html2_mask2 img").hide();
                  $('.html2_closeAlert').addClass('show');
                  $('.sj-save').addClass('show');
              });
               function canvasToImage(canvas) {
                    var image = new Image();
                  image.setAttribute("crossOrigin",'anonymous')
                    image.src = canvas.toDataURL("image/png",1);  //把canvas转换成base64图像保存
                      return image;
              }
          }else{
            $('.html2canvas_fixed').addClass('show');
            $('.html2_closeAlert').addClass('show');
            $('.sj-save').addClass('show');
          }

        setTimeout(function(){
          if(($('.html2canvas_fixed').outerHeight()+10)>$(window).height()*.9){
            $('.html2_mask_bottom').fadeIn();
          }else{
            $('.html2_mask_bottom').fadeOut()
          }
        },500)

      }
      return false;
    }

  $('.html2_closeAlert').on('click',function(e){
    e.preventDefault();
    $('.html2canvas_fixed').removeClass('show')
    $('.html2_closeAlert').removeClass('show')
    $(".html2_mask2").hide();
    $('html').removeClass('noscroll');
    $('.html2_mask_bottom').fadeOut();
  });

  $('.html2_mask2').click(function(e){
      e.preventDefault();
      $('.html2canvas_fixed').removeClass('show')
      $('.html2_closeAlert').removeClass('show')
      $(".html2_mask2").hide();
      $('html').removeClass('noscroll');
      $('.html2_mask_bottom').fadeOut();
  })

  // 导航栏置顶
  if(userid){
        var Ggoffset = $('.module-container .module-tab').offset().top ;//tab
        var navHeight = $('.nav').offset().top -48;
        var h=$(window).height();
       var tabTop = $('.module-box').offset().top- $('.blackFix').height()-55;
		if($('.module-content .module-con').length<4){
          $('.module-box').hide();
        }else{
          $(window).bind("scroll",function(){
        	var scroll = $(window).scrollTop(); 
        
            if((device.indexOf('huoniao_iOS') > -1) && !(window.__wxjs_environment == 'miniprogram')){

                 if(scroll>0){
                    $('.blackFix').addClass('slide-in-top').removeClass('slide-out-top');
                 }else{
                    $('.blackFix').removeClass('slide-in-top').addClass('slide-out-top');
                 }
                 if(scroll>=tabTop){
                     $('.blackTopfix2').fadeIn();
                    $('.blackTopfix2').append($('.module-box ul'))

                  }else{
                     $('.blackTopfix2').fadeOut();

                    $('.module-box').append($('.blackTopfix2 ul'))

                  } 
            }else {
              var nav_top = $('.module-box').offset().top;
              if(navHeight  < scroll){
                $('.blackFix').fadeIn();
              }else{
                $('.blackFix').fadeOut();
              }
              if(scroll>=nav_top){
                $('.blackFix').addClass('show')
                $('.blackFix').append($('.module-box ul'))

              }else{
                $('.blackFix').removeClass('show');

                $('.module-box').append($('.blackFix ul'))

              }

            }     
        });
       }
        
    }


    var isClick = 0;
    //左侧导航点击
    $(".module-tab li").bind("click", function(){
        isClick = 1; //关闭滚动监听
        var t = $(this), index = t.index(), theadTop;
        var t = $(this), index = t.index(), theadTop;
        if((device.indexOf('huoniao_iOS') > -1) && !(window.__wxjs_environment == 'miniprogram')){
          theadTop = $(".module-con:eq("+index+")").offset().top - 140;
        }else{
          theadTop = $(".module-con:eq("+index+")").offset().top - 50;
        }
        t.addClass("curr").siblings("li").removeClass("curr");
        $(window).scrollTop(theadTop);
        setTimeout(function(){
          isClick = 0;//开启滚动监听
        },500);
        //点击到美食事
        var end = $('.curr').offset().left + $('.curr').width() / 2 - $('body').width() /2;
        var star = $(".module-tab").scrollLeft();
        $('.module-tab').scrollLeft(end + star);
    });

    //滚动监听
    if(userid){
        $(window).scroll(function() {
            var scroH = $(this).scrollTop();
            var thh =scroH + h;
            if(isClick) return false;//点击切换时关闭滚动监听

            var theadLength = $(".module-con").length;
            $(".module-tab li").removeClass("curr");

            $(".module-con").each(function(index, element) {
                var offsetTop = $(this).offset().top;
                if (index != theadLength - 1) {
                   
                    var offsetNextTop;
                    if((device.indexOf('huoniao_iOS') > -1) && !(window.__wxjs_environment == 'miniprogram')){
                      offsetNextTop = $(".module-con:eq(" + (index + 1) + ")").offset().top - 140;
                    }else{
                      offsetNextTop = $(".module-con:eq(" + (index + 1) + ")").offset().top - 70;
                    }
                    if (scroH < offsetNextTop) {
                        $(".module-tab li:eq(" + index + ")").addClass("curr");
                        return false;
                    }
                } else {
                    $(".module-tab li:last").addClass("curr");
                    return false;
                }
            });

            var end = $('.curr').offset().left + $('.curr').width() / 2 - $('body').width() /2;
            var star = $(".module-tab").scrollLeft();
            $('.module-tab').scrollLeft(end + star);
        });
    }

    //弹出功能管理卡片
    $('.module-tab').delegate('.ruzhu','click',function(){
      $('.manage-mask').addClass('show');
      $('.manage-alert').animate({"bottom":'0'},200);
      $('html').addClass('noscroll');
    })

    $('.manage-module').delegate('.manage-a','click',function(){
      $('.manage-mask').addClass('show');
      $('.manage-alert').animate({"bottom":'0'},200);
      $('html').addClass('noscroll');
    })

    //关闭 管理卡片
    $(".close_alert,.manage-mask").bind("click", function(){
      $('.manage-mask').removeClass('show');
      $('.manage-alert').animate({"bottom":'-100%'},200);
      $('html').removeClass('noscroll');
    })

  //拖动模块改变顺序
    //1.删除已有的模块
  $('.has-add').delegate('i','click',function(){
    var par = $(this).parent('li')
    var hasId = par.attr('type-id');
    var hasTitle = par.find('span').text();
    par.remove();//移除自身父元素
    //添加到其他管理中
    $('.no-add ul').prepend("<li type-id='"+hasId+"'><i></i><span>"+hasTitle+"</span></li>")
  })

    //2.添加新模块
  $('.no-add').delegate('li','click',function(){
    var par = $(this);
    var noId = par.attr('type-id');
    var noTitle = par.find('span').text();
    par.remove();//移除自身父元素
    //添加到其他管理中
    $('.has-add ul').append("<li type-id='"+noId+"'><i></i><span>"+noTitle+"</span><s class='sort-down'></s><s class='sort-up'></s></li>")
  })

    //3.已有模块上移
  $('.has-add').delegate('.sort-up','click',function(){
    if($(this).hasClass('disabled')) return false;
    var par = $(this).parent('li');
    $('.sort-up').addClass('disabled');

    if(par.prev().size()>0){
      par.addClass('slide-top');
      par.prev().addClass('slide-bottom');
      setTimeout(function(){
        $('.has-add li').removeClass('slide-top');
        $('.has-add li').removeClass('slide-bottom');
        par.prev().before(par);
      },500)
    }
    setTimeout(function(){
      $('.sort-up').removeClass('disabled')
    },500)
  })

    //3.已有模块下移
  $('.has-add').delegate('.sort-down','click',function(){
    if($(this).hasClass('disabled')) return false;
    var par = $(this).parent('li');
    $('.sort-down').addClass('disabled');
    if(par.next().size()>0){
      par.addClass('slide-bottom');
      par.next().addClass('slide-top');
      setTimeout(function(){
        $('.has-add li').removeClass('slide-top');
        $('.has-add li').removeClass('slide-bottom');
        par.next().after(par);
      },500)
    }
    setTimeout(function(){
      $('.sort-down').removeClass('disabled')
    },500)
  })

  //管理功能卡片完成
  $('.manage-alert').delegate('.finish','click',function(){

    if (userid == null || userid == "") {
      window.location.href = masterDomain + '/login.html';
      return false;
    }

    var t = $(this);
    if(t.hasClass('disabled')) return false;
    t.addClass('disabled');
    showMsg('保存中...', 60000, false);

    //将已添加 未添加的id 传给接口 接口处进行排序 页面重新刷新 请求数据
    //已添加
    var dataHas= [];
    $('.has-add li').each(function(){
      var addId = $(this).attr('type-id');
      dataHas.push(addId);
    })

    //未添加
    var dataNo= [];
    $('.no-add li').each(function(){
      var noId = $(this).attr('type-id');
      dataNo.push(noId);
    })

    //保存数据
    $.ajax({
        url: '/include/ajax.php',
        data: 'service=member&action=updateBusinessModule&sort=' + dataHas.join(',') + '&hide=' + dataNo.join(','),
        type: 'post',
        dataType: 'json',
        success: function (res) {
            t.removeClass('disabled');
            if(res.state == 100){

                $('.manage-mask').removeClass('show');
                $('.manage-alert').animate({"bottom":'-100%'},200);
                $('html').removeClass('noscroll');

                showMsg(langData['siteConfig'][6][39], 2000, false); //保存成功

                setTimeout(function(){
                    location.reload();
                }, 1000);

            }else{
                showMsg(res.info, 2000, false);
            }
        },
        error: function (res) {
            t.removeClass('disabled');
            showMsg(langData['siteConfig'][6][201], 2000, false); //网络错误，保存失败，请稍候重试！
        }
    })


  })


  // 消息提示
    function showMsg(msg, time, showbg){
        var time = time ? time : 2000;
        var sowbg = showbg !== undefined ? showbg : true;
        $('.dialog_msg').remove();

        var html = '<div class="dialog_msg'+(showbg ? ' dialog_top' : '')+'">';
        html += '<div class="box">'+msg+'</div>';
        html += sowbg ? '<div class="bg"></div>' : '';
        html += '</div>';
        $('body').append(html);
        setTimeout(function(){
            $('.dialog_msg').remove();
        }, time)
    }

});
