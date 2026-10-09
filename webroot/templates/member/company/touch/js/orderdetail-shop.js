$(function(){

    //未付款 倒计时
    if($('.nopay').size()>0){
      var timer_nopay = setInterval(function(){
          cutDownTime($('.nopay'));
      },1000) ;
    }

    //待收货 倒计时
    if($('.hasfa').size()>0){
      var timer_hasfa = setInterval(function(){
          cutDownTime($('.hasfa'));
      },1000) ;
    }
    // 倒计时
    var eday = 3;    
    function cutDownTime(dom){   
        // timeOffset  是服务器和本地时间的时间差
        var end = dom.attr("data-time")*1000;  //点击的结束抢购时间的毫秒数
        var newTime = Date.parse(new Date()) - timeOffset;  //当前时间的毫秒数
        var youtime = end - newTime; //还有多久时间结束的毫秒数
        if(youtime <= 0){
          if(dom.hasClass('hasfa')){
            clearInterval(timer_hasfa);
          }else if(dom.hasClass('tuanIn')){
            clearInterval(timer_tuanin);
          }else if(dom.hasClass('nopay')){
            clearInterval(timer_nopay);
          }
            
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
        var c = new Date(Date.parse(new Date()) - timeOffset);
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
         dom.find("span.day").html(CDay);
         dom.find("span.day").show();
         dom.find("em.speDot").show();
        }else{
          dom.find("span.day").hide();
          dom.find("em.speDot").hide();
        }

        dom.find("span.hour").html(CHour);
        dom.find("span.minute").html(CMinute);
        dom.find("span.second").html(CSecond);
    }
    


    // 实付款 -- 展开
    $(".sum").bind("click", function(){
      var sch = $('.calcDiv ul').height();
      if($(this).hasClass('curr')){
        $(this).removeClass('curr');
        $('.calcDiv').css('height','0');
      }else{
        $(this).addClass('curr');
        $('.calcDiv').css('height','auto');
      }
      
    })



    $('.info-block .more').click(function () {
        $('.loc_name_box').addClass('show');
        $('.info-block .xInfo_box').addClass('hide');
        $('.wInfo_box').addClass('show');
    });

    $('.info-block .more_active').click(function () {
        $('.loc_name_box').removeClass('show');
        $('.info-block .xInfo_box').removeClass('hide');
        $('.wInfo_box').removeClass('show');
    });



	//导航
  $('.header-r .screen').click(function(){
    var nav = $('.nav'), t = $('.nav').css('display') == "none";
    if (t) {nav.show();}else{nav.hide();}
  });

  (function ($) {
   $.getUrlParam = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
   }
  })(jQuery);
   var rates = $.getUrlParam('rates');
   console.log(rates)


   if (rates == 1) {
     $('.common').show();
   }

  // 立即发货
  if($('.fakeData').size() > 0){
    var companyList = [];
    $('.fakeData span').each(function(){
      var tid = $(this).attr('data-id');
      var tval= $(this).text();
        companyList.push({
          id: tid,
          value: tval,//时
        })
    })
      
    var showFlag =false;
    //选择快递公司
    var clockSelect = new MobileSelect({
        trigger: '#fhTriggle',
        title: '选择快递公司',//选择快递公司
        ensureBtnText: '确定',//不选择
        wheels: [
          {data : companyList}
        ],
        onShow: function(){
            toggleDragRefresh('off');  //取消下拉刷新
        },
        onHide: function(){
            toggleDragRefresh('on');  //启用下拉刷新
        },
        transitionEnd:function(indexArr, data){
          var fir = indexArr[0];
          $('.selectContainer').find('li').removeClass('onchose')
          var firWheel =$('.wheels .wheel:first-child').find('.selectContainer');
          firWheel.find('li').eq(fir).addClass('onchose');
        },
        callback:function(indexArr, data){
          $('#expcompanytxt').val(data[0].value);
          $('#exp-company').val(data[0].id);
          if(!showFlag){
            $('.fahuoWrap .fahuoTxt').hide();
            $('.fahuoWrap .fahuoForm').show();
            showFlag = true;
          }
        }
        ,triggerDisplayData:false
    });
    $('.wheels .wheel:first-child').find('li:first-child').addClass('onchose');
  }
  $('.fhfa').click(function(){
    $('#fhTriggle').click();
  })
  $('.fahuoWrap .fahuo,.bottomOper .fahuo').click(function(){
    var t = $(this);
    if(t.hasClass('kuaidi')){//快递--发货
      $('#fhTriggle').click();
    }else{//商家--确认送出
      var popOptions = {
        title: shipping == 0 ? '确认订单有效' : '确认商品已送出',
        //confirmTip:'',
        isShow:true,
        btnColor:'#FA402C',
        btnCancelColor:'#000',
        btnSure:'确定',
        popClass:'shopGdArrive',
      }
      confirmPop(popOptions,function(){
        $(".fahuoForm .sureFahuo").click();
      })
      
    }
    
  })

  //更换配送方式
  $('.fahuoWrap .changePs').click(function(){
    var btn = $(this),psid = btn.attr('data-id');

    var popOptions = {
      title:'确定更换为快递寄送吗',
      confirmTip:'如因修改配送方式产生运费差额，请自行与买家协商一致',
      isShow:true,
      btnColor:'#FA402C',
      btnCancelColor:'#000',
      btnSure:'确定',
    }

    if(psid =='1'){//快递改为 商家/平台
      if(psType.indexOf(0) > -1){//商家
        popOptions.title="确定更换为商家配送吗";
      }else if(psType.indexOf(2) > -1){
        popOptions.title="确定更换为平台配送吗";
      }
    }
    confirmPop(popOptions,function(){
      if(psid =='1'){//快递改为 商家/平台
        
        $('.fahuoTxt .fahuo').removeClass('kuaidi').addClass('busPeis').text('确认送出');
        $('.bottomOper .fahuo').removeClass('kuaidi').addClass('busPeis').text('确认送出');
        if(psType.indexOf(0) > -1){//商家
          $('#shipping').val(2);
          btn.attr('data-id',2);
          $('.fahuoWrap .psTit strong').text('配送方式：商家配送');
        }else{//平台
          $('#shipping').val(0);
          btn.attr('data-id',0);
          $('.fahuoWrap .psTit strong').text('配送方式：平台配送');
        }
        
      }else{//商家改为快递
        $('#shipping').val(1);
        btn.attr('data-id',1);
        $('.fahuoTxt .fahuo').removeClass('busPeis').addClass('kuaidi').text('发货');
        $('.bottomOper .fahuo').removeClass('busPeis').addClass('kuaidi').text('发货');
        $('.fahuoWrap .psTit strong').text('配送方式：快递寄送');
      }
    })
  })

  //商家配送-- 确认送达
  $('.buspTxt .sureArrive').click(function(){
    var popOptions = {
      title:'确认商品已送达',
      //confirmTip:'',
      isShow:true,
      btnColor:'#FA402C',
      btnCancelColor:'#000',
      btnSure:'确定',
      popClass:'shopGdArrive',
    }
    confirmPop(popOptions,function(){
        var t = $(this),
            company = $("#exp-company"),
            number  = $("#exp-number");

        //快递类型
        if(shipping == 1){
            if($.trim(company.val()) == ""){
                showErrAlert(langData['siteConfig'][20][405]);
                return false;
            }

            if($.trim(number.val()) == ""){
                showErrAlert(langData['siteConfig'][20][406]);
                return false;
            }
        }

        var data = [];
        data.push("id="+detailID);
        data.push("shipping="+shipping);

        if(shipping == 1){
            data.push("company="+company.val());
            data.push("number="+number.val());
        }

        t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");

        $.ajax({
            url: "/include/ajax.php?service=shop&action=confirmDelivery",
            data: data.join("&"),
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    showErrAlert('发货成功');
                    setTimeout(function(){
                        location.reload();
                    },500)

                }else{
                    showErrAlert(data.info)
                    t.attr("disabled", false).html(langData['siteConfig'][6][0]);
                }
            },
            error: function(){
                showErrAlert(langData['siteConfig'][20][183])
                t.attr("disabled", false).html(langData['siteConfig'][6][0]);
            }
        });
    })
  })
  $('.bottomOper .sh').click(function(){
    $('.buspTxt .sureArrive').click();
  })
  //删除订单
  $('.bottomOper .delOrder').click(function(){
    var popOptions = {
      title:'确认删除订单',
      //confirmTip:'',
      isShow:true,
      btnColor:'#FA402C',
      btnCancelColor:'#000',
      btnSure:'确定',
      popClass:'shopGdArrive',
    }
    confirmPop(popOptions,function(){
      $.ajax({
        url: "/include/ajax.php?service=shop&action=delOrder&id="+detailID,
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
          if(data && data.state == 100){
            showErrAlert('删除成功');
            setTimeout(function(){
              location.href=orderUrl;
            },500)
            
          }else{
            showErrAlert(data.info);
          }
        },
        error: function(){
          showErrAlert(langData['siteConfig'][20][183]);

        }
      });
    })
  })


  //确定发货 -- 提交快递信息
	$(".fahuoForm .sureFahuo").bind("click", function(){
		var t = $(this),
			shipping = parseInt($("#shipping").val()),
			company = $("#exp-company"),
			number  = $("#exp-number");

        //快递类型
		if(shipping == 1){
    		if($.trim(company.val()) == ""){
    			showErrAlert(langData['siteConfig'][20][405]);
    			return false;
    		}

    		if($.trim(number.val()) == ""){
    			showErrAlert(langData['siteConfig'][20][406]);
    			return false;
    		}
    }

		var data = [];
		data.push("id="+detailID);
		data.push("shipping="+shipping);

    if(shipping == 1){
		data.push("company="+company.val());
		data.push("number="+number.val());
    }

		t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: "/include/ajax.php?service=shop&action=delivery",
			data: data.join("&"),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
          showErrAlert('发货成功');
          setTimeout(function(){
            location.reload();
          },500)
					
				}else{
          showErrAlert(data.info)
					t.attr("disabled", false).html(langData['siteConfig'][6][0]);
				}
			},
			error: function(){
        showErrAlert(langData['siteConfig'][20][183])
				t.attr("disabled", false).html(langData['siteConfig'][6][0]);
			}
		});

	});

  // 变更门店
  if($('.changeBranch').size() > 0){
    $.ajax({
            url: '/include/ajax.php?service=shop&action=storeBranch&branchid='+storeId,
            type: 'post',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                  var fendSelect = new MobileSelect({
                    trigger: '.changeBranch',
                    title: '选择分店',
                    ensureBtnText: '确定',//不选择
                    wheels: [
                      {data : data.info.list}
                    ],
                    keyMap: {
                      id: 'id',
                      value: 'title',
                    },
                    transitionEnd:function(indexArr, data){
                      var fir = indexArr[0];
                      var firWheel =$('.mobileSelect-show').find('.selectContainer');
                      firWheel.find('li').removeClass('onchose')
                      firWheel.find('li').eq(fir).addClass('onchose');
                    },
                    callback:function(indexArr, data){
                      var branchVal = data[0].id;
                      $('#brancheSelect').val(branchVal);
                      if(branchVal == branchid){
                          showErrAlert(langData['shop'][5][111]);  //与当前分店一致，无需变更！
                          return false;
                      }
                      var popOptions = {
                        title:'确定要变更分店吗？',//确定要变更分店吗？
                        //confirmTip:'',
                        isShow:true,
                        btnColor:'#FA402C',
                        btnCancelColor:'#000',
                        btnSure:'确定',
                        popClass:'shopGdArrive',
                      }
                      confirmPop(popOptions,function(){
                        $.ajax({
                          url: "/include/ajax.php?service=shop&action=changeBranch",
                          data: "id="+detailID+"&branchid="+branchVal,
                          type: "POST",
                          dataType: "json",
                          success: function (data) {
                              if(data && data.state == 100){
                                  
                                  showErrAlert('变更成功');
                                  setTimeout(function(){
                                    location.reload();
                                  },500)
                                  

                              }else{
                                showErrAlert(data.info)
                              }
                          },
                          error: function(){
                            showErrAlert(langData['siteConfig'][20][183])
                          }
                      });
                      })


                    }
                    ,triggerDisplayData:false
                });
                  
                  $('.wheels .wheel:first-child').find('li:first-child').addClass('onchose');
                    
                }
            },
            error: function(){
                
            }
        });
  }



  // 回复退款
  $('.huifu').click(function(){
    var t = $(this);
    $('.layer').addClass('show').animate({"left":"0"},100);
  })

  // 隐藏回复
  $('#typeback').click(function(){
    $('.layer').animate({"left":"100%"},100);
    setTimeout(function(){
      $('.layer').removeClass('show');
    }, 100)
  })

	//确定退款
	$(".tuikuan").bind("click", function(){
		var t = $(this);

		if(t.attr("disabled") == "disabled") return;

		if(confirm(langData['siteConfig'][20][407])){
			t.html(langData['siteConfig'][6][35]+"...").attr("disabled", true);

			$.ajax({
				url: "/include/ajax.php?service=shop&action=refundPay",
				data: "id="+detailID,
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
						showErrAlert('退款成功');
            setTimeout(function(){
              location.reload();
            },500)
					}else{
						showErrAlert(data.info)
						t.attr("disabled", false).html(langData['siteConfig'][6][153]);
					}
				},
				error: function(){
					showErrAlert(langData['siteConfig'][20][183])
					t.attr("disabled", false).html(langData['siteConfig'][6][153]);
				}
			});
  	}
  });

  //提交回复
  $("#submit").bind("click", function(){
    var t      = $(this),
        retnote = $("#textarea").val();

    if(retnote == "" || retnote.length < 15){
      showErrAlert(langData['siteConfig'][20][408]);
      return;
    }

    var pics = [];
    $("#fileList li").each(function(){
      var val = $(this).find("img").attr("data-val");
      if(val != ""){
        pics.push(val);
      }
    });

    var data = {
      id: detailID,
      pics: pics.join(","),
      content: retnote
    }

    t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");

    $.ajax({
      url: masterDomain+"/include/ajax.php?service=shop&action=refundReply",
      data: data,
      type: "POST",
      dataType: "jsonp",
      success: function (data) {
        if(data && data.state == 100){
          location.reload();
        }else{
          showErrAlert(data.info)
          t.attr("disabled", false).html(langData['siteConfig'][6][0]);
        }
      },
      error: function(){
        showErrAlert(langData['siteConfig'][20][183])
        t.attr("disabled", false).html(langData['siteConfig'][6][0]);
      }
    });
  });




})
