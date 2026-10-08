var interVal = null;
var pageVue = new Vue({
    el:'#page',
    data:{
      detail:{},
  
    },
    mounted(){
    	const that = this
    	this.getDetailInfo()
        // 微信h5初始化
        if (navigator.userAgent.toLowerCase().match(/micromessenger/) && typeof(wxconfig) != 'undefined') {
                wx.config({
                debug: false,
                appId: wxconfig.appId,
                timestamp: wxconfig.timestamp,
                nonceStr: wxconfig.nonceStr,
                signature: wxconfig.signature,
                jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone', 'openLocation', 'scanQRCode', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage'],
                openTagList: ['wx-open-launch-app', 'wx-open-launch-weapp'] // 可选，需要使用的开放标签列表，例如['wx-open-launch-app']
                });
            
            
        }
      // 监听visibilitychange事件 因为加了定时器 不需要验证状态了
        document.addEventListener('visibilitychange', function() {
            let device = navigator.userAgent.toLowerCase();
            if (document.hidden) {
                // 页面被隐藏
                isHidden = true;

            } else {
                // 页面可见
                // 在这里执行相应的操作，例如恢复动画、增加定时器频率等
                if(isHidden){
	                isHidden = false;
	                // console.log('刷新1')
	                // that.getDetailInfo(); //重新加载数据
                }
            }
        });

        
    },
  
    destroyed() {  
      document.removeEventListener('visibilitychange', this.handleVisiable)
	  clearInterval(interVal); //页面销毁 情况定时器
    }, 
  
    methods:{
    	/**
    	 * check表示当前是定时器验证是否状态改变
    	 * */ 
      getDetailInfo(check = 0){
        const that = this;
        let withdrawInd = getId()
        let url = `/include/ajax.php?service=member&action=getWithdrawDetail&id=${withdrawInd}`
        $.ajax({
            url: url,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data.state == 100){
					if(data.info.state == 1 || data.info.state == 2){
						clearInterval(interVal); //状态已定 清除定时器
					}
					if(!check){
						that.detail = data.info;
						if(data.info.state != 1 && data.info.state != 2){
							if(interVal){
								clearInterval(interVal);
							}
							interval = setInterval(function(){
								that.getDetailInfo(1); //定时器 验证状态是否改变
							}, 3000);
						}
					}else{
						if(data.info.state != that.detail.state){
							// 状态发生改变
							that.detail = data.info; //状态改变直接赋值
						}
					}
                    
                }
            },
        })
      },

      btnClick(){
			// 确认收款
            let device = navigator.userAgent.toLowerCase();
            if (device.match(/MicroMessenger/i) == "micromessenger") { //在微信浏览器中
                console.log('微信浏览器，请求接口获取参数，之后调用wechatSureGet函数')
                getWithdrawInfo()
            }else if(!device.toLowerCase().match(/huoniao_ios/) && !device.toLowerCase().match(/huoniao_android/)){  // h5
                var popOptions = {
                    title: '温馨提示', //'确定删除信息？', //提示文字
                    btnCancelColor: '#407fff',
                    isShow:true,
                    confirmHtml: '<p style="margin-top:.2rem;">请在微信浏览器端操作</p>' , //'一经删除不可恢复', //副标题
                    btnCancel: '好的，知道了',
                    noSure: true
                }
                    confirmPop(popOptions);
            }else if(device.toLowerCase().match(/huoniao_ios/) && (!device.toLowerCase().includes('huoniao_android') || device.toLowerCase().includes('huoniao_harmony'))){ //苹果端
                if(typeof(wxminiPath_withdraw) != 'undefined' ){
                    // 在苹果端app中 需要用到appid
                    let miniGh = wxminiPath_withdraw.replace('wxMiniprogram://','')
                    let miniId = miniGh.split('/')[0]
                    setupWebViewJavascriptBridge(function (bridge) {
                        bridge.callHandler('redirectToWxMiniProgram', { 'id': miniId, 'path': `/pages/redirect/index?url=${encodeURIComponent(window.location.href)}` }, function (responseData) { });
                    });
                }
            }else{//鸿蒙或者安卓
                getWithdrawInfo()
                console.log('android端');
            }
      },

      transTimes(str){
      	return huoniao.transTimes(str,1)
      },
    }
  })


  // 获取提现信息
function getWithdrawInfo () {
	// 请求接口
	let device = navigator.userAgent.toLowerCase();
	let withdrawInd = getId()
	$.ajax({
		url: '/include/ajax.php?service=member&action=getWithdrawInfo&id=' + withdrawInd,
		type: "POST",
		dataType: "json",
		success: function (data) {
			if(data.state == 100){
				// 此处需要区分是微信浏览器还是app
				if(device.match(/MicroMessenger/i) == "micromessenger"){
					wechatSureGet(data.info); //微信端
				}else if(device.toLowerCase().includes('huoniao_android')){ //安卓端
					if(data.info.source < 2){
						showErrAlert('请在微信中确认收款')
						setTimeout(() => {
							setupWebViewJavascriptBridge(function (bridge) {
								bridge.callHandler('redirectToWxMiniProgram', { 'id': miniId, 'path': `/pages/redirect/index?url=${encodeURIComponent(window.location.href)}` }, function (responseData) { });
							});
						}, 1500);
						return false;
					}
					setupWebViewJavascriptBridge(function(bridge) {
						bridge.callHandler('wxConfirmReceipt', {'mchId': data.info.mchid,'appId': data.info.appid,'package': encodeURIComponent(data.info.package_info)}, function(res){
							console.log('安卓端提现,需判断是否成功');
							setTimeout(() => {
								location.reload();
							}, 2000);
						});
					})
				}
			}else{
				pageVue.getDetailInfo(); //优化请求失败之后 重新获取数据
				showErrAlert(data.info)
			}
		},
		error: function () { }
	});
}

function getId() {
	let url = window.location.href;
	let url_1 = url.split('.html')[0]
	let urlArr = url_1.split('-');
	if(urlArr.length > 1){
		return urlArr[1]
	}else{
		return 0
	}
}


function wechatSureGet(rdata){// 微信用户确认收款
	// // 此处应确认是否需要审核  如不需要审核 则直接调用确认收款

	if(wx_miniprogram){
		// alert('是在小程序中,需要跳转页面')
		let params = `?package=${encodeURIComponent(rdata.package_info)}&appid=${rdata.appid}&mchid=${rdata.mchid}`
		wx.miniProgram.navigateTo({url: '/pages/merchantTransfer/merchantTransfer' + params});
	}else{
		wx.ready(function(res){
	    	wx.checkJsApi({
				jsApiList: ['requestMerchantTransfer'],
				success: function (res) {
					if (res.checkResult['requestMerchantTransfer']) {
						WeixinJSBridge.invoke('requestMerchantTransfer', {
							mchId: rdata.mchid ,
							appId: rdata.appid ,
							package: rdata.package_info ,
						},
						function (res) {
							if (res.err_msg === 'requestMerchantTransfer:ok') {
								// res.err_msg将在页面展示成功后返回应用时返回success，并不代表付款成功
								// if(interVal){
								// 	clearInterVal(interVal)
								// }
								// interVal = setInterval(() => {
								// 	pageVue.getDetailInfo(1)
								// },3000)
							}
						});
					} else {
						alert('你的微信版本过低，请更新至最新版本。');
					}
				},
				fail:function(res){
					console.log(res)
				},
			});
	    })
	}
	
}