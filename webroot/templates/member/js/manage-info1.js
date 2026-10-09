/**
 * 会员中心分类信息列表
 * by guozi at: 20150627
 */

var objId = $("#list");
$(function(){
	var share = false, hbfa = false;
	var editId = 0;
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
		refreshTopFunc.init('refresh', 'info', 'detail', id, t, title);
	});


	//置顶
	objId.delegate('.topping', 'click', function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), title = par.attr("data-title");
		refreshTopFunc.init('topping', 'info', 'detail', id, t, title);
	});



  // 激励
  $('.jiliForm .dt_gou').click(function(event) {
    /* Act on the event */
    var t = $(this);
    t.toggleClass('hasgou');
	  t.find('input').val(t.hasClass('hasgou')?"1":"0")
	  countJlPrice()
  });

  $('.jiliForm input[name="hbAmount"],.jiliForm input[name="shareAmount"],.jiliForm input[name="shareNumber"],.jiliForm input[name="shareAddNumber"],.jiliForm input[name="hbAddAmount"]').blur(function(event) {
    /* Act on the event */
    countJlPrice();
  });


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
						  $("#moneyinfo").text('');
						  $("#moneyinfo").closest('.pay_item').removeClass('disabled_pay')
					  }

					  if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
						  $("#bonusinfo").text('额度不足，可用');
						  $("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
					  }else if( bonus * 1 < info.order_amount * 1){
						  $("#bonusinfo").text('余额不足，');
						  $("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
					  }else{
						  $("#bonusinfo").text('');
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
        }else{
          var num = dl.find('input[name="shareNumber"]').val();
          var amount = dl.find('input[name="shareAmount"]').val();
          if(num != '' && amount!=''){
            allAmount = allAmount + num * amount;
          }
        }
      }else if(dl.find('.dt_gou').length == 0){
        if(dl.hasClass("readBox")){
          allAmount = allAmount + 1 * dl.find('input[name="hbAddAmount"]').val()
          console.log(allAmount)
        }else{
          var num = dl.find('input[name="shareAddNumber"]').val();
          var amount = $('input[name="shareAmount"]').val();
          if(num != '' && amount!=''){
            allAmount = allAmount + num * amount;
          }
          console.log(allAmount)
        }
      }

      console.log(allAmount)
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
  });


  // 显示激励弹窗

  $("body").delegate('.jili','click',function(){
	  share = $(this).attr('data-share')=='1'? true : false;
	  var t = $(this);
	  var item = t.closest('.item');
	  // var det = item.attr('data-detail');
	  // console.log(det)
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
	  $("#hongbao").find('b').text(countHongbao)


	  console.log();

	  $(".extendMask,.extendPop").show();
    $('html').addClass('noscroll')
  })

});

function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');  //加载中，请稍候
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=info&action=ilist&u=1&orderby=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
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
									pubdate     = huoniao.transTimes(list[i].pubdate, 1);

							//智能刷新
							if(refreshSmart){
								refreshCount = list[i].refreshCount;
								refreshTimes = list[i].refreshTimes;
								refreshPrice = list[i].refreshPrice;
								refreshBegan = huoniao.transTimes(list[i].refreshBegan, 1);
								refreshNext = huoniao.transTimes(list[i].refreshNext, 1);
								refreshSurplus = list[i].refreshSurplus;
							}

							url = waitpay == "1" || list[i].arcrank != "1" ? 'javascript:;' : url;

							html.push('<div class="item fn-clear" data-id="'+id+'" data-title="'+title+'" data-hongbaoCount="'+list[i].hongbaoCount+'" data-countHongbao="'+list[i].countHongbao+'" data-priceCount="'+list[i].priceCount+'" data-hongbaoPrice="'+list[i].hongbaoPrice+'" data-desc="'+list[i].descc+'" data-rewardPrice="'+list[i].rewardPrice+'" data-countFenxiang="'+list[i].countFenxiang+'" data-CountReward="'+list[i].CountReward+'" data-rewardCount="'+list[i].rewardCount+'" data-readInfo="'+list[i].readInfo+'" data-shareInfo="'+list[i].shareInfo+'" >');
							if(litpic != "" && litpic != undefined){
								html.push('<div class="p"><a href="'+url+'" target="_blank"><i></i><img src="'+litpic+'" /></a></div>');
							}
							if(waitpay == 1){
								html.push('<div class="o"><a href="javascript:;" class="stick delayPay" style="color:#ff6600;"><s></s>'+langData['siteConfig'][23][113]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
								//为求职者提供最新最全的招聘信息------删除
							}else{
								html.push('<div class="o">');

                // 此处需判断是否设置过
								if(list[i].hasSetjili != "1") {
									html.push('<a href="javascript:;" class="jili" data-share="'+list[i].hasSetjili+'"><s></s>用户激励</a>')
								}


								if(list[i].arcrank == "1"){
									if(!refreshSmart){
										html.push('<a href="javascript:;" class="refresh"><s></s>'+langData['siteConfig'][16][70]+'</a>'); //刷新
									}
									if(!isbid){
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
							if(list[i].arcrank == "0"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][9][21]+'</span>'; //未审核
							}else if(list[i].arcrank == "2"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';//审核拒绝
							}else if(list[i].arcrank == "3"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][23][114]+'</span>';  //取消显示
							}else if(list[i].arcrank == "4"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][29]+'</span>';  //已过期
							}

							html.push('<p>'+langData['siteConfig'][19][393]+'：'+typename+'&nbsp;&nbsp;·&nbsp;&nbsp;'+pubdate+arcrank+'</p>');//分类
							html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'" style="color:'+color+';">'+title+'</a></h5>');

							html.push('<p>'+langData['siteConfig'][19][8]+'：'+address+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][394]+'：'+click+langData['siteConfig'][13][26]+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][6][114]+'：'+common+langData['siteConfig'][13][49]);
							//浏览--次--评论--条
							if(isvalid){
								html.push('&nbsp;&nbsp;·&nbsp;&nbsp;<font color="#ff0000">'+langData['siteConfig'][9][29]+'</font>');//已过期
							}
							if(is_valid==1){
								html.push('&nbsp;&nbsp;·&nbsp;&nbsp;<font color="#ff0000">'+langData['siteConfig'][31][132]+'</font>');  //此商品已售完
							}
							html.push('</p>');

							if(refreshSmart || isbid == 1 || list[i].hasSetjili == '1'){
								html.push('<div class="sd">');
								if(refreshSmart){
									html.push('<p><span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['siteConfig'][31][128]+'<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>'+langData['siteConfig'][31][129]+'<span class="SurplusRefreshCount">'+refreshSurplus+'</span>'+langData['siteConfig'][13][26]+'</font></p>');
									//后刷新，已刷新---次，剩余---次
								}
								if(isbid && bid_type == 'normal'){
									html.push('<p>'+langData['siteConfig'][31][130]+'，<span class="topEndTime">'+bid_end+langData['siteConfig'][6][163]+'</span></p>');
									//已开通置顶---结束
								}
								if(isbid && bid_type == 'plan'){

								    //记录置顶详情
                                    topPlanData['info'] = Array.isArray(topPlanData['info']) ? topPlanData['info'] : [];
                                    topPlanData['info'][id] = bid_plan;

                                    html.push('<p class="topPlanDetail" data-module="info" data-id="'+id+'" title="'+langData['siteConfig'][6][113]+'">'+langData['siteConfig'][31][131]+'<s></s></p>');



                                    //查看详情---已开通计划置顶
								}
								// 此处需判断是否开通阅读红包，分享有奖
							if (list[i].hasSetjili == '1'){
								var txt1 = list[i].shareInfo == '1' ?'分享有奖' : '' ;
								var txt2 = list[i].readInfo == '1' ? '阅读红包 ' : '';
							html.push('<p class="jiliDetail" data-module="info" data-id="'+id+'" title="'+langData['siteConfig'][6][113]+'">已开通'+txt1+txt2+'<s></s></p>');
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
