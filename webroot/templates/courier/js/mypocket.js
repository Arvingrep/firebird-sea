var page = new Vue({
  el:'#page',
  data:{
    currTab:0,
    page:1,
    isload:0,
    datalist:[], //数据存放
    loadText:'下拉加载更多',
    failPop:false,  //失败原因弹窗
    failNote:'', //失败原因
    isUpload:false,
  },
  computed:{
    changeData(){
      var tt = this;

      var dataArr = []; //数据整理
      var monthArr= [];
      for(var i = 0; i < tt.datalist.length; i++){
        var date = tt.datalist[i].date.split(' ')[0];
        var month = date.split('-')[0]+'-'+date.split('-')[1];
        if(monthArr.indexOf(month) <=-1 ){
          monthArr.push(month);
        }
      }
      monthArr.forEach(function(val){
        var dlList = [];
        var income = 0,outcome = 0,withdraw = 0;
        tt.datalist.forEach(function(list){
          var date = list.date.split(' ')[0];
          var month = date.split('-')[0]+'-'+date.split('-')[1];
          if(val == month){
            dlList.push(list);
            income = income + (list.type == '1' ? list.amount * 1 : 0);
            outcome = outcome + (list.type == '0' && list.cattype == '0' ? list.amount * 1 : 0);
            if (list.cattype == '1' && list.type == '0') {
                withdraw = withdraw + list.amount  * 1;
            }

          }
        })

        dataArr.push({
          month:val,
          dlList:dlList,
          income:income.toFixed(2),
          outcome:outcome.toFixed(2),
          withdraw:withdraw.toFixed(2),
        })
      });
      return dataArr
    },
    changeTime(){
      return function(date){
        var nowDate = new Date()
        var nowY = nowDate.getFullYear();
        var nowY = nowDate.getFullYear();
      }
    }
  },
  mounted(){
    this.onPageVisibility();

    var tt = this;
    var click = 0; //点击切换
    $(".tab_ul li").click(function(){
      click = 1;
      if($(this).hasClass('on_chose')) {
        return false;
      };
      var tab = $(this).attr('data-tab');
      $(this).addClass('on_chose').siblings('li').removeClass('on_chose');
      var left = $(this).offset().left + $(this).width()/2;
      $(".tab_ul s.line").css({'left':left-.5*$(".tab_ul s.line").width()});
      tt.currTab = tab;
      tt.datalist = [];
      tt.page = 1;
      tt.isload = false
      tt.getList();
      setTimeout(function(){
        click = 0;
      },1500)
    })
    $(".tab_ul li").eq(0).click();


    // 滚动加载
    $(".detailList").scroll(function(){
      // var h = $('.item').height();
  		var allh = $('.detailListBox').height();
  		var w = $('.detailList').height();
  		var scroll = allh - w - 60;
  		if ($('.detailList').scrollTop() > scroll && !tt.isload && !click) {
  		  tt.getList()
  		};
    })
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

  },
  methods:{
    showFailTip(tip){
      var tt= this;
      tt.failNote = tip;
      console.log(tip,tt.failNote)
      tt.failPop = true;
    },

    // 获取数据
    getList(){
      var tt = this;
      if(tt.isload) return false;
      tt.isload = true;
      tt.loadText = '加载中~'
      $.ajax({
        url: "/include/ajax.php?service=waimai&action=courierIncome&pageSize=20&type="+tt.currTab+"&page="+tt.page,
        type: "GET",
        dataType: "json",
        success: function (data) {
          tt.isload = false;
          if(data.state == 100){
            if(tt.page == 1){
              tt.datalist = data.info.list
            }else{
              tt.datalist = [...tt.datalist,...data.info.list]
            }
            tt.loadText = '下拉加载更多'
            tt.page ++ ;
            if(tt.page > data.info.pageInfo.totalPage){
              tt.isload = true;
              tt.loadText = '没有更多了'
            }
          }else{
            console.log(111)
            tt.datalist = [];
            tt.loadText = data.info;
          }
        },
        error:function(data){},
      });
    },
    /* 监听页面显示隐藏 */
    onPageVisibility(functions) {
        var _t = {};
        var ishide = false;

        var onShowCall = function () {
            if(ishide){
                location.reload();
            }
            if (!functions || !functions.show) {
                return;
            }
            window.clearTimeout(_t.showTime);
            _t.showTime = window.setTimeout(function () {
                functions.show();
            }, 100);
        }

        var onHideCall = function () {
            ishide = true;
            if (!functions || !functions.hide) {
                return;
            }
            window.clearTimeout(_t.hideTime);
            _t.hideTime = window.setTimeout(function () {
                functions.hide();
            }, 100);
        }

        document.addEventListener('visibilitychange', function () {
            var visibility = document.visibilityState;
            if (visibility == 'visible') {
                onShowCall();
            } else if (visibility == 'hidden') {
                onHideCall();
            }
        });

        window.addEventListener("pageshow", function () {
            onShowCall()
        }, false);

        window.addEventListener("pagehide", function () {
            onHideCall();
        }, false);
    },


    // 点击提现按钮 app
    confirmGetMoney: function (item) { 
      const that = this;
      if(that.isUpload) return false;
      that.isUpload = true;
      let device = navigator.userAgent.toLowerCase();
      $.ajax({
          url: '/include/ajax.php?service=waimai&action=getWithdrawInfo&id=' + item.wid,
          type: "POST",
          dataType: "json",
          success: function (data) {
            that.isUpload = false;
            if(data.state == 100){
              // 此处需要区分是微信浏览器还是app
            if(device.match(/MicroMessenger/i) == "micromessenger"){
              that.wechatSureGet(data.info); //微信端
            }else if(device.toLowerCase().includes('huoniao_android')){ //安卓端
                setupWebViewJavascriptBridge(function(bridge) {
                  bridge.callHandler('wxConfirmReceipt', {'mchId': data.info.mchid,'appId': data.info.appid,'package': data.info.package_info,}, function(res){
                    console.log('安卓端提现,需判断是否成功');
                    setTimeout(() => {
                      location.reload();
                    }, 2000);
                  });
                })
              }
            }
          },
          error: function () {
            that.isUpload = false;
           }
        });
      },

      // 微信用户确认收款
      wechatSureGet(rdata){
        if(wx_miniprogram){
          // alert('是在小程序中,需要跳转页面')
          let params = `?package=${rdata.package_info}&appid=${rdata.appid}&mchid=${rdata.mchid}`
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
      },
    },

    
  
})
