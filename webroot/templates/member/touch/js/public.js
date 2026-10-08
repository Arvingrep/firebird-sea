var isHidden = false; //是否隐藏过,首次打开
var interval = null; //定时器
var dataChange = false; //数据是否有变化
$(function(){

	var device = navigator.userAgent;
	if (device.indexOf('huoniao_iOS') > -1) {
		$('body').addClass('huoniao_iOS');
	}

	
  //   // document.title = $('.header .header-address').text();
	// if(template == 'withdraw_log_detail'){ //确认收款

  //   // 确认收款按钮点击
  //   $(".btn_submit").click(function(){
	// 		// 确认收款
	// 		let device = navigator.userAgent.toLowerCase();
	// 		if (device.match(/MicroMessenger/i) == "micromessenger") { //在微信浏览器中
	// 			console.log('微信浏览器，请求接口获取参数，之后调用wechatSureGet函数')
	// 			getWithdrawInfo()
	// 		}else if(!device.toLowerCase().match(/huoniao_ios/)){  // h5
	// 			var popOptions = {
	// 				title: '温馨提示', //'确定删除信息？', //提示文字
	// 				btnCancelColor: '#407fff',
	// 				isShow:true,
	// 				confirmHtml: '<p style="margin-top:.2rem;">请在微信浏览器端操作</p>' , //'一经删除不可恢复', //副标题
	// 				btnCancel: '好的，知道了',
	// 				noSure: true
	// 			}
	// 				confirmPop(popOptions);
	// 		}else if(device.toLowerCase().match(/huoniao_ios/) && (!device.toLowerCase().includes('huoniao_android') || device.toLowerCase().includes('huoniao_harmony'))){ //苹果端
	// 			if(typeof(wxminiPath_withdraw) != 'undefined' ){
	// 				dataChange = true
	// 				// 在苹果端app中 需要用到appid
	// 				let miniGh = wxminiPath_withdraw.replace('wxMiniprogram://','')
	// 				let miniId = miniGh.split('/')[0]
	// 				setupWebViewJavascriptBridge(function (bridge) {
	//             bridge.callHandler('redirectToWxMiniProgram', { 'id': miniId, 'path': `/pages/redirect/index?url=${encodeURIComponent(window.location.href)}` }, function (responseData) { });
	//         });
	// 			}
	// 		}else{//鸿蒙或者安卓
	// 			getWithdrawInfo()
	// 			console.log('android端');
	// 		}
	// 	})

	// 	// 页面显示和隐藏
	// 	// 监听visibilitychange事件
	// 	document.addEventListener('visibilitychange', function() {
	// 		device = navigator.userAgent.toLowerCase();
	// 	    if (document.hidden && dataChange) {
	// 	        // 页面被隐藏
	// 	    	isHidden = true;
	// 	    	dataChange = false;
	// 	    } else {
	// 	        // 页面可见
	// 	        // 在这里执行相应的操作，例如恢复动画、增加定时器频率等
	// 	        if(isHidden){
	// 	        	isHidden = false;
	// 	        	if(device.toLowerCase().match(/huoniao_ios/)){
	// 	        		let url = window.location.href ;
	// 	        		 setupWebViewJavascriptBridge(function (bridge) {
  //                     bridge.callHandler("goBack", {}, function (responseData) {
  //                     });
  //                 });

	// 	        		 	location.reload(); //刷新
		        			
	// 	        	}else{
	// 	        		location.reload();
	// 	        	}
	// 	        }
	// 	    }
	// 	});
	// }
	

})

// if (navigator.userAgent.toLowerCase().match(/micromessenger/) && typeof(wxconfig) != 'undefined') {
//     wx.config({
//       debug: false,
//       appId: wxconfig.appId,
//       timestamp: wxconfig.timestamp,
//       nonceStr: wxconfig.nonceStr,
//       signature: wxconfig.signature,
//       jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone', 'openLocation', 'scanQRCode', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage'],
//       openTagList: ['wx-open-launch-app', 'wx-open-launch-weapp'] // 可选，需要使用的开放标签列表，例如['wx-open-launch-app']
//     });


// }


// // 获取提现信息
// function getWithdrawInfo () {
// 	// 请求接口
// 	let device = navigator.userAgent.toLowerCase();
// 	let withdrawInd = getId()
// 	$.ajax({
// 		url: '/include/ajax.php?service=member&action=getWithdrawInfo&id=' + withdrawInd,
// 		type: "POST",
// 		dataType: "json",
// 		success: function (data) {
// 			if(data.state == 100){
// 				// 此处需要区分是微信浏览器还是app
// 				if(device.match(/MicroMessenger/i) == "micromessenger"){
// 					wechatSureGet(data.info); //微信端
// 				}else if(device.toLowerCase().includes('huoniao_android')){ //安卓端
// 					if(data.info.source != 2){
// 						showErrAlert('请在微信中确认收款')
// 						setTimeout(() => {
// 							setupWebViewJavascriptBridge(function (bridge) {
// 								bridge.callHandler('redirectToWxMiniProgram', { 'id': miniId, 'path': `/pages/redirect/index?url=${encodeURIComponent(window.location.href)}` }, function (responseData) { });
// 							});
// 						}, 1500);
// 						return false;
// 					}
// 					setupWebViewJavascriptBridge(function(bridge) {
// 						bridge.callHandler('wxConfirmReceipt', {'mchId': data.info.mchid,'appId': data.info.appid,'package': encodeURIComponent(data.info.package_info)}, function(res){
// 							console.log('安卓端提现,需判断是否成功');
// 							setTimeout(() => {
// 								location.reload();
// 							}, 2000);
// 						});
// 					})
// 				}
// 			}else{
// 				showErrAlert(data.info)
// 			}
// 		},
// 		error: function () { }
// 	});
// }

// function getId() {
// 	let url = window.location.href;
// 	let url_1 = url.split('.html')[0]
// 	let urlArr = url_1.split('-');
// 	if(urlArr.length > 1){
// 		return urlArr[1]
// 	}else{
// 		return 0
// 	}
// }


// function wechatSureGet(rdata){// 微信用户确认收款
// 	// // 此处应确认是否需要审核  如不需要审核 则直接调用确认收款

// 	if(wx_miniprogram){
// 		// alert('是在小程序中,需要跳转页面')
// 		let params = `?package=${encodeURIComponent(rdata.package_info)}&appid=${rdata.appid}&mchid=${rdata.mchid}`
// 		wx.miniProgram.navigateTo({url: '/pages/merchantTransfer/merchantTransfer' + params});
// 	}else{
// 		wx.ready(function(res){
// 	    	wx.checkJsApi({
// 				jsApiList: ['requestMerchantTransfer'],
// 				success: function (res) {
// 					if (res.checkResult['requestMerchantTransfer']) {
// 						WeixinJSBridge.invoke('requestMerchantTransfer', {
// 							mchId: rdata.mchid ,
// 							appId: rdata.appid ,
// 							package: rdata.package_info ,
// 						},
// 						function (res) {
// 							if (res.err_msg === 'requestMerchantTransfer:ok') {
// 							// res.err_msg将在页面展示成功后返回应用时返回success，并不代表付款成功
// 							}
// 						});
// 					} else {
// 						alert('你的微信版本过低，请更新至最新版本。');
// 					}
// 				},
// 				fail:function(res){
// 					console.log(res)
// 				},
// 			});
// 	    })
// 	}
	
// }


// // 验证当前状态  确认收款时触发
// function toSetInterval(){
// 	if(interval){
// 		clearInterval(interval)
// 	}
// 	interval = setInterval(() => {

// 	},500)
// }


// function checkState() {
	
// }