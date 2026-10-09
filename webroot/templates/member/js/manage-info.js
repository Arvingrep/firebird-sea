/**
 * 会员中心分类信息列表
 * by guozi at: 20150627
 */
validArr = validArr ? JSON.parse(validArr) : [{day:0}]
var objId = $("#list");
var editValid = 0;
var validTrade = null;
var editId = 0;
var typeObj = {}; 
$(function(){
	var share = false, hbfa = false;
	$(".main-tab li[data-id='"+state+"']").addClass("curr");

	$(".main-tab li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr") && !t.hasClass("add")){
			state = id;
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
			getList();
		}
	});

	getList(1);

	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][543], function(){   //你确定要删除这条信息吗？
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=info&action=del&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//删除成功后移除信息层并异步获取最新列表
							par.slideUp(300, function(){
								par.remove();
								setTimeout(function(){getList(1);}, 200);
							});

						}else{
							$.dialog.alert(data.info);
							t.siblings("a").show();
							t.removeClass("load");
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			});
		}
	});


	//刷新
	objId.delegate('.refresh', 'click', function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), title = par.attr("data-title");
    let typeid = $(this).closest('.item').attr('data-typeid')
    if(module == 'info'){
      let obj = {
        type:'refresh', mod:'info', act:'detail', aid:id, btn:t, title:title,
      }
      getTypeDetail(typeid,'refresh',obj)
    }else{
		  refreshTopFunc.init('refresh', 'info', 'detail', id, t, title);
    }
	});


	//置顶
	objId.delegate('.topping', 'click', function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), title = par.attr("data-title");
		let typeid = par.attr("data-typeid");
    if(module == 'info'){
      let obj = {
        type:'topping', mod:'info', act:'detail', aid:id, btn:t, title:title,
      }
      getTypeDetail(typeid,'topping',obj)
    }else{
		  refreshTopFunc.init('topping', 'info', 'detail', id, t, title);
    }
	});



  // 激励
  $('.jiliForm .dt_gou').click(function(event) {
    /* Act on the event */
    var t = $(this);
    var dl = t.closest('.dlbox')
    t.toggleClass('hasgou');
	  t.find('input').val(t.hasClass('hasgou')?"1":"0")
    if(dl.hasClass('sharejliBox') && t.hasClass('hasgou')){
      if($("input[name='share_money']").val() == ''){

        $("input[name='share_money']").val(0.88)
      }
    }
	  countJlPrice()
  });
  
  $('.jiliForm input[name="hbAmount"],.jiliForm input[name="share_money"],.jiliForm input[name="hbshareNum"],.jiliForm input[name="hbAddshareNum"],.jiliForm input[name="hbAddAmount"],.jiliForm input[name="addhbAmount"],.jiliForm input[name="addhbnum"]').blur(function(event) {
    /* Act on the event */
    if(($(this).attr('name') == 'share_money' || $(this).attr('name') == 'hbshareNum') && $('.sharejliBox .hasgou').length == 0){
      $('.sharejliBox .dt_gou').addClass('hasgou').find('input').val(1);
    }
    if(($(this).attr('name') == 'hbAmount' || $(this).attr('name') == 'hbNum') && $('.readBox .hasgou').length == 0){
      $('.readBox .dt_gou').addClass('hasgou').find('input').val(1);
    }
    countJlPrice();
  });

  $(".selectBox li").click(function(){
    var t = $(this);
    t.addClass('on_chose').siblings('li').removeClass('on_chose')
    t.closest('.inp').find('input').val(t.text())
    $(".selectBox").hide()
  })
  $('input').focus(function(){
    var t = $(this)
    var inp = t.closest('.inp');
    inp.find('.selectBox').show()
  })
  $('input').blur(function(){
    var t = $(this)
    var inp = t.closest('.inp');
    setTimeout(function(){
      inp.find('.selectBox').hide()
    },1000)
  })

  $(".btn-check").click(function (){

	  var form = $("#formBox"), action = form.attr("action"), url = form.attr("data-url"), tj = true;

	  event.preventDefault();
	  var t           = $(this)
	  if(t.hasClass('addIn')) return;

	  $("#payEncourage input[name='aid']").val(editId);
	  var mydata = $("#formBox").serialize();
	  if (share || hbfa){
		  mydata = mydata+"&id="+editId+"&type=add"
	  }else{
		  mydata = mydata+"&id="+editId
	  }

	  $.ajax({
		  url: action,
		  data: mydata,
		  type: "POST",
		  dataType: "json",
		  success: function (data) {
			  if (data && data.state == 100) {
				  if (typeof (data.info) == 'object') {
					  info = data.info;

					  if(typeof (info) != 'object'){
						  location.href = info;

					  }
					  cutDown = setInterval(function () {
						  $(".payCutDown").html(payCutDown(info.timeout));
					  }, 1000)

					  var datainfo = [];
					  for (var k in info) {
						  datainfo.push(k + '=' + info[k]);
					  }
					  $("#amout").text(info.order_amount);
					  $('.payMask').show();
					  $('.payPop').show();

                      if (usermoney * 1 < info.order_amount * 1) {

                          $("#moneyinfo").text('余额不足，');
                          $("#moneyinfo").closest('.pay_item').addClass('disabled_pay')
                      }else{
                          $("#moneyinfo").text('可用');
                          $("#moneyinfo").closest('.pay_item').removeClass('disabled_pay')
                      }

                      if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
                          $("#bonusinfo").text('额度不足，可用');
                          $("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
                      }else if( bonus * 1 < info.order_amount * 1){
                          $("#bonusinfo").text('余额不足，可用');
                          $("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
                      }else{
                          $("#bonusinfo").text('可用');
                          $("#bonusinfo").closest('.pay_item').removeClass('disabled_pay')
                      }


					  ordernum  = info.ordernum;
					  order_amount = info.order_amount;

					  $("#ordertype").val('payEncourage');
					  $("#service").val('siteConfig');
					  var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
					  $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
				  } else {
					  if (device.indexOf('huoniao_Android') > -1) {
						  setupWebViewJavascriptBridge(function (bridge) {
							  bridge.callHandler('pageClose', {}, function (responseData) {
							  });
						  });
						  location.href = data.info;
					  } else {
						  location.href = data.info + (data.info.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
					  }
				  }
			  } else {
				  alert(data.info);
			  }
		  },
		  error: function(){
			  alert(langData['siteConfig'][20][183]);
			  t.removeClass("disabled").html(langData['shop'][1][8]);
		  }

	  });
  })

  function countJlPrice(){
    var allAmount = 0;
    $('.dlbox:not(".fn-hide")').each(function(){
      var dl = $(this);
      if(dl.find('.dt_gou').hasClass('hasgou')){
        if(dl.hasClass('readBox') && dl.find('input[name="hbAmount"]').val() != ''){

          allAmount = allAmount + 1 * dl.find('input[name="hbAmount"]').val();
        }else if(dl.hasClass('sharejliBox')){
          var num = dl.find('input[name="hbshareNum"]').val();
          var amount = dl.find('input[name="share_money"]').val();
          console.log(num,amount)
          if(num != '' && amount!=''){
            allAmount = allAmount + num * amount;
          }
        }
      }else if(dl.find('.dt_gou').length == 0){
        if(dl.hasClass("readBox")){
          allAmount = allAmount + 1 * dl.find('input[name="addhbAmount"]').val()
          console.log(allAmount)
        }else{
          var num = dl.find('input[name="hbAddshareNum"]').val();
          var amount = $('input[name="share_money"]').val();
          if(num != '' && amount!=''){
            allAmount = allAmount + num * amount;
          }
          console.log(allAmount)
        }
      }

    })
    $('.tip2').removeClass('fn-hide').siblings('p').addClass('fn-hide');
    $(".spendAmount").html(parseFloat((allAmount * (1 + jili_bili*1)).toFixed(2)));

  }


  // 修改红包口令
  $(".hbMsg .sethb").click(function(){
    var t = $(this);
    t.hide();
    $(".hbMsg .msg").attr('contenteditable',true).focus();
    $(".hbMsg .save_msg").addClass('show')
  });

  // 保存红包口令
  $(".save_msg").click(function(){
    $(".hbMsg .sethb").show()
    $(".hbMsg .save_msg").removeClass('show');
    $(".hbMsg .msg").removeAttr('contenteditable');
    var hbMessage = $("#desc p.msg").text();
    $.ajax({
      type: "POST",
      url: "/include/ajax.php?service=siteConfig&action=upDesc&id="+editId+"&hbMessage="+hbMessage,
      dataType: "json",
      success: function (data) {
        if (data && data.state == 100) {
          $("#list .item[data-id='"+editId+"']").attr('data-desc',hbMessage)
          $.dialog.alert('红包口令设置成功');//网络错误，加载失败！
        }

      },
      error: function () {
        $(el).removeClass('disabledInp')
        $.dialog.alert(langData['siteConfig'][20][227]);//网络错误，加载失败！
      }
    });
  });


  // 显示激励弹窗

  $("body").delegate('.jili','click',function(){

	  var t = $(this);
	  var item = t.closest('.item');
	  var share = item.attr('data-shareInfo')=='1'?true:false;
	  var hbfa = item.attr('data-readInfo')=='1'?true:false;

    // 红包相关


    // 分享相关




	  editId = item.attr('data-id');

    $('html').addClass('noscroll');
    $(".extendMask,.extendPop").show();
    if(share || hbfa){
      $(".jiliShow").removeClass('fn-hide');
      $(".jiliForm").addClass('fn-hide');
      $(".jiliShow dl").addClass('fn-hide')
      if(share){
        $(".jiliShow dl.shareShow").removeClass('fn-hide')
      }
      if(hbfa){
        $(".jiliShow dl.hbShow").removeClass('fn-hide')
      }
    }else{
      $(".jiliShow").addClass('fn-hide');
      $(".jiliForm").removeClass('fn-hide');
      $(".jiliForm .dlbox").addClass('fn-hide')
      $(".jiliForm .dlbox:not('.hasSet')").removeClass('fn-hide');
    }
  });


  // 关闭激励弹窗
  $(".extendPop .close_pop").click(function(){
    $(".extendMask,.extendPop").hide();
    $('html').removeClass('noscroll')
  });

  // 追加红包
  $(".extendPop .addIn").click(function(){
    $(".jiliShow").addClass('fn-hide');
    $(".jiliForm").removeClass('fn-hide');
    $(".jiliForm .dlbox").addClass('fn-hide')

    if(share){
      $(".jiliForm .sharejliBox.hasSet").removeClass('fn-hide');
    }else{
      $(".jiliForm .sharejliBox:not('.hasSet')").removeClass('fn-hide');
    }
    if(hbfa){
      $(".jiliForm .readBox.hasSet").removeClass('fn-hide');
    }else{
      $(".jiliForm .readBox:not('.hasSet')").removeClass('fn-hide');
    }
  })

  // 查看红包奖励
  $('body').delegate('.jiliDetail','click',function(){
  	var t = $(this);
	  var item = t.closest('.item');
	  editId = item.attr('data-id');
	  share = item.attr('data-shareInfo') == '1' ? true : false;
	  hbfa = item.attr('data-readInfo') == '1' ? true : false;
	  $('input[name="readInfo"]').val(item.attr('data-readInfo'))
	  $('input[name="shareInfo"]').val(item.attr('data-shareInfo'))

	  if(share || hbfa){
		  $(".jiliShow").removeClass('fn-hide');
		  $(".jiliForm").addClass('fn-hide');
		  $(".jiliShow dl").addClass('fn-hide')
		  if(share){
			  $(".jiliShow dl.shareShow").removeClass('fn-hide')
		  }
		  if(hbfa){
			  $(".jiliShow dl.hbShow").removeClass('fn-hide')
		  }
	  }else{
		  $(".jiliShow").addClass('fn-hide');
		  $(".jiliForm").removeClass('fn-hide');
		  $(".jiliForm .dlbox").addClass('fn-hide')
		  $(".jiliForm .dlbox:not('.hasSet')").removeClass('fn-hide');
	  }
		//红包余额
	  var hongbaoCount = item.attr('data-hongbaoPrice');
	  $("#hongbaoPrice").find('b').text(hongbaoCount)
	  //红包个数
	  var  countHongbao  = item.attr('data-countHongbao');
	  $("#countHongbao").find('b').text(countHongbao)
	  //红包已领取数量
	  var priceCount   = item.attr('data-priceCount');
	  $("#priceCount").find('b').text(priceCount)
	  //口令
	  var desc   = item.attr('data-desc');
	  $("#desc").find('p').text(desc)





	  //增加阅读

	  // 奖励金额
	  var  rewardPrice  = item.attr('data-rewardPrice');
	  $("#rewardPrice").find('b').text(rewardPrice)
	  //已分享
	  var  countFenxiang = item.attr('data-countFenxiang');
	  $("#countFenxiang").find('b').text(countFenxiang)
	  //奖励剩余
	  var  rewardCount = item.attr('data-rewardCount');
	  $("#rewardCount").find('b').text(rewardCount)
	  //红包余额
	  var  hongbao = item.attr('data-hongbaoPrice');
	  $("#hongbao").find('span').text(hongbao)
	  //红包剩余个数
	  var  countHongbao = item.attr('data-hongbaoCount');
	  $("#hongbao").find('b.hb_left').text(hongbao);
	  $("#hongbao").find('b.hbnum_left').text(countHongbao);

    var rewardprice = item.attr('data-rewardprice'); //单次金额
    var countreward = item.attr('data-countreward'); //奖励人次
	  $("#share").find('b.hb_left').text(rewardprice)
	  $("#share").find('b.hbnum_left').text(countreward)
      $('input[name="share_money"]').val(rewardprice)

	  $(".extendMask,.extendPop").show();
    $('html').addClass('noscroll')
  })


  // 增加有效期
  $('body').delegate('.delayshowBtn','click',function(){
    var t = $(this);
    var item = t.closest('.item');
    editValid = item.attr('data-valid');  //当前有效时间
    editId = item.attr('data-id');  //当前的id
    $('.validbtnBox p em').html($('.validBox li.on_chose h3').text())
    $('.changeValidMask,.changeValidPop').show();
    $('html').addClass('noscroll')
    let typeid = item.attr('data-typeid');
    getTypeDetail(typeid);
  });

  // 选择有效期
  $('.validBox ').delegate('li','click',function(){
    var t = $(this);
    t.addClass('on_chose').siblings('li').removeClass('on_chose');
    $('.validbtnBox p em').html($('.validBox ul:not(.fn-hide) li.on_chose h3').text())
  });

// 去支付
  $('.changeValidPop .btn_valid').click(function(){
    var nowDate = parseInt((new Date()).valueOf()/1000)
    var nowValid = (editValid - nowDate) > 0 ? editValid : nowDate;
    var addValid = Number($('.validBox li.on_chose').attr('data-time'));
    var amount = Number($('.validBox li.on_chose').attr('data-price'));
    nowValid = nowValid * 1 + addValid;
    updateValid(nowValid,editId)
  })

  // 关闭有效期
  $('.changeValidMask,.close_validPop').click(function(){
    $('.changeValidMask,.changeValidPop').hide();
    editValid = 0;
    editId = 0;
    $('html').removeClass('noscroll')
    if(validTrade){
      clearInterval(validTrade);
    }
  })


});
// 更新有效期
function updateValid(valid,editId,haspayVal){
    var url = '/include/ajax.php?service=info&action=zvalid&id='+editId;
    var amount = Number($('.validBox li.on_chose').attr('data-price'));
    if(haspayVal){
      var dataTo = {
        hasPay:1,
        valid:valid,
        amount:amount,
      }
    }else{
      var dataTo = {
        valid:valid,
        amount:amount,
      }
    }
    $.ajax({
			url: url,
			data: dataTo,
			type: "POST",
			dataType: "json",
			success: function (data) {
        if(data.state == 100){
          if(!haspayVal){
            keepPay(data.info,valid)
          }else{
            alert('成功增加信息曝光时长');
            location.reload();
          }
        }
      },
      error:function(data){
        alert(data.info)
      },
    })
  }

// 支付

function keepPay(payInfo,valid){

      var tt = this;
    var t = $(event.currentTarget), aid = payInfo.aid;

    if(typeof (aid) !='undefined' && aid!=''){

      $("#payform input[name='aid']").val(aid);
      $("#payform").append(
          '<input type="hidden" name="aid"  value="'+aid+'" />'
      );
    } else {
      $("#payform").append(
          '<input type="hidden" name="aid"  value="'+$("#aid").val()+'" />'
      );
    }

    if(typeof(module) =='undefined' || typeof(module) != 'string' || module == ''  ){

      module = $("#module").val();
    }
    $("#ordertype").val('fabupay');
    $("#payform input[name='action']").val('fabuPay');
    $("#payform input[name='amount']").val(payInfo.order_amount);
    if($('#payform input[name="balance"]').length == 0){
      $('#payform').append('<input type="hidden" value="'+payInfo.order_amount+'" name="balance">')
    }else{
      $('#payform input[name="balance"]').val(payInfo.order_amount)
    }

    $('#payform').append('<input type="hidden" value="'+valid+'" name="valid">')
    if($('#payform input[name="validType"]').length == 0){
      $('#payform').append('<input type="hidden" value="1" name="validType">')
    }
    ordernum = payInfo.ordernum;
    if($("#payform input[name='ordernum']").size() > 0){
        $("#payform input[name='ordernum']").val(ordernum);
    }else{
        $('#payform').append('<input type="hidden" value="' + ordernum + '" name="ordernum">')
    }
    // $("#payform #tourl").val( document.URL);
    // orderurl = document.URL
    $.ajax({
      type: 'POST',
      url: '/include/ajax.php?service=member&action=fabuPay',
      dataType: 'json',
      data:$("#payform").serialize(),
      success: function (sdata) {
        if(sdata && sdata.state == 100) {
          sinfo = sdata.info;
          // ordertype = 'fabuPay';

          $("#amout").text(sinfo.order_amount);
          if(sinfo.order_amount > 0){
            $('.payMask,.payPop').show();
          }

          if (totalBalance * 1 < sinfo.order_amount * 1) {

            $("#moneyinfo").text('余额不足，');

            $('#balance').hide();
          }
            if(monBonus * 1 < sinfo.order_amount * 1  &&  bonus * 1 >= sinfo.order_amount * 1){
                $("#bonusinfo").text('额度不足，可用');
                $("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
            }else if( bonus * 1 < sinfo.order_amount * 1){
                $("#bonusinfo").text('余额不足，可用');
                $("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
            }else{
                $("#bonusinfo").text('可用');
                $("#bonusinfo").closest('.pay_item').removeClass('disabled_pay')
            }
          ordernum = sinfo.ordernum;
          order_amount = sinfo.order_amount;
          var datainfo = [];
          for (var k in sdata.info) {
            datainfo.push(k + '=' + sdata.info[k]);
          }
          var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
         $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
          // payCutDown('', sinfo.timeout);
          cutDown = setInterval(function () {
							$(".payCutDown").html(payCutDown(sinfo.timeout));
						},1000)
          if(validTrade){
            clearInterval(validTrade)
          }
          checkPayResult(ordernum)
          validTrade = setInterval(function(){
            checkPayResult(ordernum)
          },2000)

        }
      },
      error: function () {

      }
    })

  }

// 验证支付成功
function checkPayResult(ordernum){
      var tt = this;
      $.ajax({
        type: 'POST',
        async: false,
        url: '/include/ajax.php?service=member&action=tradePayResult&order='+ordernum,
        dataType: 'json',
        success: function(str){
          if(str.state == 100 && str.info != ""){
            clearInterval(validTrade);
            var nowDate = parseInt((new Date()).valueOf()/1000)
            var nowValid = (editValid - nowDate) > 0 ? editValid : nowDate;
            var addValid = Number($('.validBox li.on_chose').attr('data-time'));
            var amount = Number($('.validBox li.on_chose').attr('data-price'));
            nowValid = nowValid * 1 + addValid;
            updateValid(nowValid,editId,1)

          }
        }
      });

    }


// 获取数据
function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');  //加载中，请稍候
	$(".pagination").hide();
  var typeStr = ''
  if(state == '0'){
    typeStr = '&state=0'
  }else{
    typeStr = '&state='+state
  }
	$.ajax({
		url: masterDomain+"/include/ajax.php?service=info&action=ilist&u=1&orderby=1"+typeStr+"&page="+atpage+"&pageSize="+pageSize,
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
									isvalid     = list[i].isvalid,
									isbid       = parseInt(list[i].isbid),
									bid_type    = list[i].bid_type,
									bid_price   = list[i].bid_price,
									bid_end     = huoniao.transTimes(list[i].bid_end, 1),
									bid_plan    = list[i].bid_plan,
									waitpay     = list[i].waitpay,
									refreshSmart= list[i].refreshSmart,
									is_valid    = list[i].is_valid,
									valid    = list[i].valid, //有效期
                  refreshSwitch = list[i].refreshSwitch,
                  excitationSwitch = list[i].excitationSwitch,
									pubdate     = huoniao.transTimes(list[i].pubdate, 1);
                  var timeOffArr = checkValid(valid);  //有效时间 时间戳转换

							//智能刷新
							if(refreshSmart && refreshSwitch){
								refreshCount = list[i].refreshCount;
								refreshTimes = list[i].refreshTimes;
								refreshPrice = list[i].refreshPrice;
								refreshBegan = huoniao.transTimes(list[i].refreshBegan, 1);
								refreshNext = huoniao.transTimes(list[i].refreshNext, 1);
								refreshSurplus = list[i].refreshSurplus;
							}

							url = waitpay == "1" || list[i].arcrank != "1" ? 'javascript:;' : url;

							html.push('<div class="item fn-clear" data-id="'+id+'"  data-typeid="'+list[i].typeid+'" data-title="'+title+'" data-hongbaoCount="'+list[i].hongbaoPrice+'" data-countHongbao="'+list[i].hongbaoCount+'" data-priceCount="'+list[i].priceCount+'" data-hongbaoPrice="'+list[i].hongbaoPrice+'" data-desc="'+list[i].hbMessage+'" data-rewardPrice="'+list[i].rewardPrice+'" data-countFenxiang="'+list[i].countFenxiang+'" data-CountReward="'+list[i].CountReward+'" data-rewardCount="'+list[i].rewardCount+'" data-readInfo="'+list[i].readInfo+'" data-shareInfo="'+list[i].shareInfo+'" data-valid="'+list[i].valid+'">');
							if(litpic != "" && litpic != undefined){
								html.push('<div class="p"><a href="'+url+'" '+(waitpay == "1" || list[i].arcrank != '1' ? '' : ' target="_blank"')+'><i></i><img src="'+litpic+'" onerror="this.src=\'/static/images/404.jpg\'" /></a></div>');
							}
							if(waitpay == 1 || timeOffArr[1] == 1){
								html.push('<div class="o"><a href="'+urlString+id+'" class="edit"><s></s>重新发布</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
								//为求职者提供最新最全的招聘信息------删除
							}else{
								html.push('<div class="o">');



								if(list[i].arcrank == "1" && timeOffArr[1] !== 1){
                  // 此处需判断是否设置过
                  if(list[i].hasSetjili != "1" && excitation != '' && excitationSwitch) {
                    html.push('<a href="javascript:;" class="jili" data-share="'+list[i].hasSetjili+'"><s></s>用户激励</a>')
                  }
									if(!refreshSmart && refreshSwitch){
										html.push('<a href="javascript:;" class="refresh"><s></s>'+langData['siteConfig'][16][70]+'</a>'); //刷新
									}
									if(!isbid && list[i].topSwitch){
										html.push('<a href="javascript:;" class="topping"><s></s>'+langData['siteConfig'][19][762]+'</a>');  //置顶
									}
								}

								html.push('<a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a>'); //编辑
								if(!refreshSmart && !isbid){
									html.push('<a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a>');//删除
								}
								html.push('</div>');
							}
							html.push('<div class="i">');

							var arcrank = "";
							if(list[i].waitpay == "1"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">等待支付</span>';
							}else if(list[i].arcrank == "2"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][21]+'</span>'; //未审核
							}else if(list[i].arcrank == "2"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';//审核拒绝
							}else if(list[i].arcrank == "3"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][23][114]+'</span>';  //取消显示
							}else if(list[i].arcrank == "4"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][29]+'</span>';  //已过期
							}

							html.push('<p>'+langData['siteConfig'][19][393]+'：'+typename+'&nbsp;&nbsp;·&nbsp;&nbsp;'+pubdate+'</p>');//分类
							html.push('<h5><a href="'+url+'" '+(waitpay == "1" || list[i].arcrank != '1' ? '' : ' target="_blank"')+' title="'+title+'" style="color:'+color+';">'+title+'</a></h5>');

							html.push('<p>'+langData['siteConfig'][19][8]+'：'+address+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][394]+'：'+click+langData['siteConfig'][13][26]+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][6][114]+'：'+common+langData['siteConfig'][13][49]);
							//浏览--次--评论--条




              if(list[i].arcrank != '1'){
                html.push(arcrank)
              }else if(list[i].waitpay != '1'){
                if(timeOffArr[1] == 1){
  								html.push('&nbsp;&nbsp;·&nbsp;&nbsp;<font color="#ff0000">'+langData['siteConfig'][9][29]+'</font>');//已过期
  							}else if(timeOffArr[1] == 2){
                  html.push('&nbsp;&nbsp;·&nbsp;&nbsp;<font color="#ff0000">'+timeOffArr[0]+'</font>&nbsp;&nbsp;<span class="delayshowBtn">延长有效期></span>');//已过期
                }else if(timeOffArr[1] == 3){
                  html.push('&nbsp;&nbsp;·&nbsp;&nbsp;<font>'+timeOffArr[0]+'</font>&nbsp;&nbsp;<span class="delayshowBtn" style="color:#333">延长有效期></span>');//已过期
                }
              }
							// if(is_valid==1){
							// 	html.push('&nbsp;&nbsp;·&nbsp;&nbsp;<font color="#ff0000">'+langData['siteConfig'][31][132]+'</font>');  //此商品已售完
							// }
							html.push('</p>');

							if(refreshSmart || isbid == 1 || list[i].hasSetjili == '1'){
								html.push('<div class="sd">');
								if(refreshSmart && refreshSwitch){
									html.push('<p><span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['siteConfig'][31][128]+'<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>'+langData['siteConfig'][31][129]+'<span class="SurplusRefreshCount">'+refreshSurplus+'</span>'+langData['siteConfig'][13][26]+'</font></p>');
									//后刷新，已刷新---次，剩余---次
								}
								if(isbid && bid_type == 'normal' && list[i].topSwitch){
									html.push('<p>'+langData['siteConfig'][31][130]+'，<span class="topEndTime">'+bid_end+langData['siteConfig'][6][163]+'</span></p>');
									//已开通置顶---结束
								}
								if(isbid && bid_type == 'plan' && list[i].topSwitch){

								    //记录置顶详情
                                    topPlanData['info'] = Array.isArray(topPlanData['info']) ? topPlanData['info'] : [];
                                    topPlanData['info'][id] = bid_plan;

                                    html.push('<p class="topPlanDetail" data-module="info" data-id="'+id+'" title="'+langData['siteConfig'][6][113]+'">'+langData['siteConfig'][31][131]+'<s></s></p>');



                                    //查看详情---已开通计划置顶
								}
								// 此处需判断是否开通阅读红包，分享有奖
							if (list[i].hasSetjili == '1' && list[i].excitationSwitch){
								var txt1 = list[i].shareInfo == '1' ?'分享有奖' : '' ;
								var txt2 = list[i].readInfo == '1' ? '阅读红包 ' : '';
							html.push('<p class="jiliDetail" data-module="info" data-id="'+id+'" title="'+langData['siteConfig'][6][113]+'">已开通'+txt1+' '+txt2+'<s></s></p>');
							}
								html.push('</div>');

							}

							html.push('</div>');
							html.push('</div>');

						}

						objId.html(html.join(""));
                        countDownRefreshSmart();

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //暂无相关信息！
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
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //暂无相关信息！
			}
		}
	});
}

function checkValid(timestr){
   var nowDate = parseInt((new Date()).valueOf()/1000);
   var timeOff = timestr - nowDate;
        var weekTimeOff = 7 * 86400;
        var showText = '';
        var btn_show = 0; //是否显示增加有效期到按钮
        // if(type){
          if(timeOff <= 0){ //已失效
            showText = '已失效';
            btn_show = 1;
          }else if(timeOff <= weekTimeOff){
            var timeTrans = timeOff / 86400
            showText =  (Number(timeTrans.toString().split('.')[0]) + 1) +'天后失效';
            btn_show = 2;  //有效期小于7天
          }else{
            var timeTrans = timeOff / 86400;
            showText = '有效期'+(Number(timeTrans.toString().split('.')[0]) + 1)+'天';
              btn_show = 3; //有效期大于7天

            if(Number(timeTrans) >= Number(validArr[0]['day']/2) ){
              btn_show = 4;  //永久
            }
          }
          return [showText,btn_show];


}

//获取分类的设置  obj 主要视传刷新、置顶的详情
function getTypeDetail(id,type = 'valid',obj){
  if(typeObj[id]){
    solveData(type,typeObj[id],obj);
    return false;
  }
  $.ajax({
    url: masterDomain+"/include/ajax.php?service=info&action=typeDetail&id="+id,
    type: "GET",
    dataType: "jsonp",
    success: function (data) {
      if(data && data.state == 100){
        // console.log(data.info[0])
        let tconfig = data.info[0];
        typeObj[id] = tconfig;
        solveData(type,tconfig,obj)
      }  
    },
    error: function(){}
  });
}

/**
 * 处理相关数据
 * @param {*} type 表示进行的操作  不同操作对应不同的指令 默认是有效期
 * @param {*} data 表示处理的数据
 * @param {*} obj 表示下一步操作传的值 刷新置顶必传

 * */  

function solveData(type,data,obj){

    switch(type){
      case 'valid':
        if(data.validConfig == 1){  //有效期配置 自定义
          let html = [];
          for(let i = 0; i < data.validRule.length; i++){
            let item = data.validRule[i];
            html.push(`<li data-time="${item.daytime}" data-price="${item.price}" class="${i == 0 ? 'on_chose' : ''}">
              <h3><b>${item.day}</b>${item.dayText}</h3>
              <p>${langData['info'][3][38]}${item.price}${echoCurrency('short')}</p>
            </li>`)
          }
          
          $('.validBox .type_valid').removeClass('fn-hide').html(html.join(''))
          $('.validBox .default_valid').addClass('fn-hide')
        }else{
          $('.validBox .type_valid').addClass('fn-hide')
          $('.validBox .default_valid').removeClass('fn-hide')
        }
        break;
      case 'topping':

          if(data.topConfig == 1){
            let refreshTopConfig = {
              topNormal:data.topNormal,
              topPlan:data.topPlan,
            }
            console.log(2222)
            refreshTopFunc.init(obj.type, obj.mod, obj.act, obj.aid, obj.btn, obj.title, refreshTopConfig);
          }else{
            refreshTopFunc.init(obj.type, obj.mod, obj.act, obj.aid, obj.btn, obj.title);
          }
        break;
      case 'refresh':
          if(data.refreshConfig == 1  ){
            let refreshTopConfig = {
              refreshNormalPrice:data.refreshNormalPrice,
              refreshSmart:data.refreshSmart,
              
            }
            refreshTopFunc.init(obj.type, obj.mod, obj.act, obj.aid, obj.btn, obj.title, refreshTopConfig);
          }else{
            refreshTopFunc.init(obj.type, obj.mod, obj.act, obj.aid, obj.btn, obj.title);
          }
        break;
    }
}
