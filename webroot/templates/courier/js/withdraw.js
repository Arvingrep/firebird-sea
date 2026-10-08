var  withdrawWxVersion = ''; //微信提现版本，不同版本的提现绑定的方法不同
$(function(){

	

	var userid_courier = hn_getCookie('HN_courier')
	wxurl = wxurl + userid_courier;
  //   $(".tobind").attr('href',wxurl); //注释原因：改版app端直接获取微信openid
	var interval  = null;
	checkBindWx(); //先验证是否绑定过微信



	function checkBindWx(){

		$.ajax({
	  //   url: '/include/ajax.php?service=waimai&action=getCourierOpenid&did='+userid_courier, //老版本
		url: '/include/ajax.php?service=waimai&action=getCourierOpenidNew', //新版本
		type: "POST",
		dataType: "json",
		success: function (data) {
		 if(data && data.state == 100){
		  let showBind = 1;
		  let openid = data.info.withdrawWxVersion == 4 ? data.info.courierOpenid : data.info.oldOpenid; //根据提现版本不同 使用不同的openid  
		  withdrawWxVersion = data.info.withdrawWxVersion; //根据不同版本需要调不同方法
		  if(!openid){
			  // 表示需要绑定openid
			  showBind = 1;
		  }else{
			  showBind = 0;
			  clearInterval(interval); //如果withdrawWxVersion是4,则需要清除定时器
		  } 
		  if(!showBind){
			  $('.loading').hide();
			  $(".norecord,.txBox").removeClass("fn-hide");
			  $(".bindtip").remove()
		  }else{
			  $(".bindtip").removeClass('fn-hide')
			  $(".norecord,.txBox").addClass("fn-hide");
		  } 
		 }
		},
		error: function(){}
	  });
	}
// 选择支付方式
$('.tab li').bind('click', function(){
var t = $(this), lid = t.data('id');
$(this).addClass('curr').siblings('li').removeClass('curr');
$('.witem').hide();
$('.' + lid).show();
if(lid != 'weixin'){
	$(".txBox").removeClass('fn-hide')
}else {
	$(".txBox").addClass('fn-hide');
	if(wxBind){
		$(".txBox").removeClass('fn-hide')
	}
}
});

//提交申请
$("#tj").bind("click", function(event){
  var t = $(this), data = [];

  if(t.hasClass('disabled')) return false;

  var type = $(".tab .curr").attr('data-id');

  //微信
  if(type == 'weixin'){

	  let device = navigator.userAgent.toLowerCase();

	  // 不需要判断h5还是微信 只做app端
	  // 无记录状态
	  var amount = $(".weixin #amount").val();
	  data.push("bank=weixin");

  //支付宝
  }else if(type == 'alipay'){

	  // 无记录状态
	  var cardnum = $(".alipay #cardnum").val(),
		  cardname = $(".alipay #cardname").val(),
		  amount = $(".alipay #amount").val();

	  if(cardnum == ""){
		  showMsg(langData['siteConfig'][20][208]);
		  return false;
	  }

	  if(cardname == ""){
		  showMsg(langData['siteConfig'][20][209]);
		  return false;
	  }

	  data.push("bank=alipay");
	  data.push("cardnum="+cardnum);
	  data.push("cardname="+cardname);

  //银行卡
  }else if(type == 'bank'){

	  var bank = $(".bankbox #bank").val(),
		  cardnum = $(".bankbox #cardnum").val().replace(/\s/g, ""),
		  cardname = $(".bankbox #cardname").val(),
		  amount = $(".bankbox #amount").val();

	  if(bank == ""){
		  showMsg(langData['siteConfig'][20][204]);
		  return false;
	  }

	  if(cardnum == ""){
		  showMsg(langData['siteConfig'][20][205]);
		  return false;
	  }

	  if(cardname == ""){
		  showMsg(langData['siteConfig'][20][206]);
		  return false;
	  }

	  data.push("bank="+bank);
	  data.push("cardnum="+cardnum);
	  data.push("cardname="+cardname);

  }

  if(amount == ""){
	  showMsg(langData['siteConfig'][20][207]);
	  return false;
  }

  amount = amount * 1;
  if(from != 'invite'){
	  if(minWithdraw && amount < minWithdraw * 1){
		  showMsg((langData['siteConfig'][36][3]).replace(1, minWithdraw));  ////起提金额：1元
		  return false;
	  }
  }else{
	  if(moneyRegGivingWithdraw && amount < moneyRegGivingWithdraw * 1){
		  showMsg((langData['siteConfig'][36][3]).replace(1, moneyRegGivingWithdraw));  ////起提金额：1元
		  return false;
	  }
  }

  if(from != 'invite'){
	  if(maxWithdraw && amount > maxWithdraw * 1 && maxWithdraw != 0){
		  showMsg((langData['siteConfig'][36][4]).replace(1, maxWithdraw));  //单次最多提现：1元
		  return false;
	  }
  }

  if(from != 'invite'){
	  if(amount > money * 1){
		  showMsg(langData['siteConfig'][19][720]+money);
		  return false;
	  }
  }else{
	  if(amount > totalCanWithdrawn * 1){
		  showMsg(langData['siteConfig'][19][720]+totalCanWithdrawn);
		  return false;
	  }
  }

  data.push("amount="+amount);
  data.push("from="+from);
  t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");
  // 表示骑手端提现
  $.ajax({
	  url: masterDomain+"/include/ajax.php?service=waimai&action=courierWithdraw",
	  type: "POST",
	  data: data.join("&"),
	  dataType: "jsonp",
	  success: function (data) {
		  if(data && data.state == 100){
			  if(type == 'weixin'){
				  weixinApply(data.info)
			  }else{
				  t.removeClass("disabled").html('申请成功');
				  setupWebViewJavascriptBridge(function(bridge) {
					  setTimeout(function(){
						  bridge.callHandler('goBack', function(){});
					  }, 1000);
				  });
			  }
			  
		  }else{
			  showMsg(data.info);
			  t.removeClass("disabled").html(langData['siteConfig'][19][716]);
		  }
	  },
	  error: function(){
		  showMsg(langData['siteConfig'][20][183]);
		  t.removeClass("disabled").html(langData['siteConfig'][19][716]);
	  }
  });


});


$('.tobind').click(function(e){
  if(withdrawWxVersion == 4){ //新版微信提现
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler("wechatLogin", {}, function(responseData) {
			let openid = responseData; //获取openid
			let url = `/include/ajax.php?service=waimai&action=saveCourierOpenid&openid=${openid}`; //待修改
			$.ajax({
				url: url,
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
						$('.loading').hide();
						$(".norecord,.txBox").removeClass("fn-hide");
						$(".bindtip").remove()
					}
				},
				error: function(){}
			});
		})
	})

  }else{
	   	// var t = $(this);
	  	// var param = t.attr('href'); //此处注释掉是因为 老版给tobind按钮添加了wxurl链接
		var param = wxurl; //
		var ahref = param.replace('wxMiniprogram://',"");
	    var miniId = ahref.split('?/')[0],  //小程序原始id
		path = ahref.split('?/')[1];  //跳转的路径
		miniId = miniId.split('/')[0];
		path = path == undefined ? '' : path;
		$('.loading').show();
		setTimeout(function(){
			setupWebViewJavascriptBridge(function(bridge) {
				if(path){
					bridge.callHandler('redirectToWxMiniProgram', {'id':miniId,'path': path},  function(responseData){});
				}else{
					bridge.callHandler('redirectToWxMiniProgram', {'id':miniId,'path':''},  function(responseData){});
				}

				interval = setInterval(function(){
					checkBindWx()
				},1000)

			});
		},1000)
		e.preventDefault();
  	}
})


})




function weixinApply(id){
$.ajax({
	url: '/include/ajax.php?service=waimai&action=getWithdrawInfo&id=' + id,
	type: "POST",
	dataType: "json",
	success: function (data) {
		if(data.state == 100){
			let rdata = data.info
			setupWebViewJavascriptBridge(function(bridge) {
				bridge.callHandler('wxConfirmReceipt', {'mchId': rdata.mchid,'appId': rdata.appid,'package': encodeURIComponent(rdata.package_info),}, function(res){
					console.log('安卓端提现,需判断是否成功');
					setTimeout(() => {
						bridge.callHandler('goBack', function(){});
					}, 2000);
				});
			})
		}else{
			
			$('#tj').removeClass("disabled").html('申请成功');
			setupWebViewJavascriptBridge(function(bridge) {
				setTimeout(function(){
					bridge.callHandler('goBack', function(){});
				}, 1000);
			});
		}
	}
});
}

// 错误提示
function showMsg(str){
	var o = $(".error");
	o.html('<p>'+str+'</p>').show();
	setTimeout(function(){o.hide()},1000);
}



$('#amount').bind('input',function(){
	var t = $(this);
	if(Number(t.val()) > Number(tx_num)){
		$('.overtip').show()
		$("#tj").addClass('disabled')
	}else{
		$('.overtip').hide()
		$("#tj").removeClass('disabled')
	}
})