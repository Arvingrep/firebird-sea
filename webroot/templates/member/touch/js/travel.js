var pageVue = new Vue({
    el: "#vue",
    data: {
        masterDomain: masterDomain, //当前的域名
        userId: userId, //用户的id
        detail: {}, //详情信息
        orderInfo: {}, //订单信息
        hotelList: [], //酒店列表
        typeList: [],//经营类别（1:酒店;2:景点门票;3:租车;4:周边游;5:视频;6:旅游攻略;7:签证）
        info: '', //接口错误提示
        loadingb: true, //页面加载
        imgError: imgError, //图片加载错误的地址
        popb: false, //二次弹窗提示
        popType: '',
        ajaxb: false,
        appBoolean: Boolean(navigator.userAgent.toLowerCase().match(/huoniao/)), //是否处于app环境
        errInfo: '', //小黑框
        warnb: false,
        reloadb: false
    },
    async mounted() {
        this.onPageVisibility({
            show: async res => {
                if (this.reloadb) {
                    await this.typeData();
                    if (this.typeList.length == 0 && this.hotelList.length == 0) { //新店注册
                        this.typeList = ['1', '2', '3', '4', '7']
                    }
                }
            },
        })
        this.detailData();
        this.orderData();
        await this.typeData();
        await this.hotelData();
    },
    methods: {
        ajax(data, param = {}) { //接口请求
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: param.url || '/include/ajax.php?',
                    data: data,
                    type: param.type || 'POST',
                    timeout: 5000, //超时时间
                    success: (res) => {
                        resolve(typeof res == 'object' ? res : JSON.parse(res));
                    },
                    error: error => {
                        reject(JSON.parse(error));
                    }
                })
            })
        },
        backFn() {
            if (history.length == 1) {
                location.href = `${masterDomain}/travel.html`;
            } else {
                history.go(-1);
            }
        },
        linkTo(url, reload = false,wxUrl) { //链接跳转
            this.reloadb = reload;
            if (!this.userId) { //登录验证
                url = `${this.masterDomain}/login.html`;
            } else if (this.appBoolean) { //app跳转
                setupWebViewJavascriptBridge(function (bridge) {
                    bridge.callHandler('redirectNative', {
                        'name': '',
                        'code': '',
                        'link': url
                    }, function () { });
                })
            }else if(navigator.userAgent.toLowerCase().match(/micromessenger/)){ //微信环境
                wx.miniProgram.navigateTo({
                    url: wxUrl||`/pages/redirect/index?url=${encodeURIComponent(url)}`,
                    fail:res=>{ //微信浏览器  
                      location.href = url;
                    }
                  })
            } else {
                location.href = url;
            }
        },
        async detailData() { //详情信息
            let data = {
                service: 'member',
                action: 'storeCenterData',
                module: 'travel'
            };
            let result = await this.ajax(data);
            if (result.state == 100) {
                // 过期时间处理
                let info = result.info;
                let date = new Date(info.expired * 1000);
                let year = date.getFullYear();
                let month = date.getMonth() + 1;
                month = month > 9 ? month : ('0' + month);
                let day = date.getDate();
                day = day > 9 ? day : ('0' + day);
                info['endTime'] = `${year}.${month}.${day}`; //添加日期
                // 续期提醒
                info['continue'] = Boolean(info.expired - (+new Date() / 1000) < 864000); //添加续期提示(10天)
                if (info.id == 0) { //店铺信息未填写
                    alert('请先提交店铺资料！')
                    location.href = `${memberUrl}/config-travel.html`;
                } else {
                    this.detail = info;
                }
            } else {
                this.info = result.info;
            }
            this.loadingb = false;
        },
        async orderData() { //订单列表
            let data = {
                service: 'travel',
                action: 'orderList',
                store: 1,
            };
            let result = await this.ajax(data);
            if (result.state == 100) {
                this.orderInfo = result.info.pageInfo;
            }
        },
        async hotelData() { //酒店列表
            let data = {
                service: 'travel',
                action: 'hotelList',
                u: 1,
                orderby: 2,
                page: 1,
                pageSize: 10
            };
            let result = await this.ajax(data);
            if (result.state == 100) {
                this.hotelList = result.info.list;
                if (this.hotelList.length > 1 && this.typeList.includes('1')) { //swiper切换
                    this.$nextTick(res => {
                        new Swiper('.h-list', {
                            autoplay: false,//可选选项，自动滑动
                            autoHeight: true,
                            spaceBetween: 10,
                            slidesPerView: 'auto',
                            pagination: {
                                el: ".h-pagination",
                                bulletClass: 'hp-dot',
                                bulletActiveClass: 'hp-active',
                                clickable: true,
                            },
                            watchSlidesProgress: true, //配合下面的on
                            on: {
                                setTranslate: function () {
                                    let slidesList = this.slides;//swiper元素列表
                                    for (i = 0; i < slidesList.length; i++) {
                                        item = slidesList.eq(i);
                                        progress = slidesList[i].progress;
                                        item.css({ 'opacity': '', 'background': '' }); item.transform('');//清除样式
                                        item.css('opacity', (1 - Math.abs(progress) / 2));
                                    }
                                },
                            }
                        });
                    })
                }
            }
            if (this.typeList.length == 0 && this.hotelList.length == 0) { //新店注册
                this.typeList = ['1', '2', '3', '4', '7']
            }
        },
        async typeData() { //经营类别
            let data = {
                service: 'travel',
                action: 'storeDetail',
            };
            let result = await this.ajax(data);
            if (result.state == 100) {
                this.typeList = result.info.bind_moduleArr_;
            }
        },
        async openFn(state) { //开启/关闭酒店民宿
            if (this.ajaxb) {
                return false
            }
            this.ajaxb = true;
            let typeList = JSON.parse(JSON.stringify(this.typeList));
            if (state) { //添加酒店民宿
                typeList.push('1');
            } else { //删除酒店民宿
                let index = typeList.indexOf('1');
                typeList.splice(index, 1);
            }
            let data = {
                service: 'travel',
                action: 'storeConfigModule',
                bind_module: typeList.join(',')
            };
            let result = await this.ajax(data);
            if (result.state == 100) {
                this.typeList = typeList; //视图更新
                this.popFn(0, ''); //弹窗关闭
                if (state) {
                    this.$nextTick(res => {
                        new Swiper('.h-list', {
                            autoplay: false,//可选选项，自动滑动
                            autoHeight: true,
                            spaceBetween: 10,
                            slidesPerView: 'auto',
                            pagination: {
                                el: ".h-pagination",
                                bulletClass: 'hp-dot',
                                bulletActiveClass: 'hp-active',
                                clickable: true,
                            }
                        });
                    })
                }
            }
            this.ajaxb = false;
        },
        popFn(state, type) { //弹窗
            this.popType = type;
            this.popb = state;
        },
        scanFn() {//扫码
            if (this.appBoolean) {
                setupWebViewJavascriptBridge(function (bridge) {
                    bridge.callHandler("QRCodeScan", {}, function callback(DataInfo) {
                        if (DataInfo) { }
                    });
                })
            } else if (navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == "micromessenger") { //微信浏览器
                wx.config({
                    debug: false,
                    appId: wxconfig.appId,
                    timestamp: wxconfig.timestamp,
                    nonceStr: wxconfig.nonceStr,
                    signature: wxconfig.signature,
                    jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ',
                        'onMenuShareWeibo', 'updateAppMessageShareData', 'updateTimelineShareData',
                        'onMenuShareQZone', 'openLocation', 'scanQRCode', 'chooseImage', 'previewImage',
                        'uploadImage', 'downloadImage', 'getLocation'
                    ]
                });
                wx.scanQRCode({
                    // 默认为0，扫描结果由微信处理，1则直接返回扫描结果
                    needResult: 0,
                    desc: '扫一扫',
                    success: function (res) { },
                    fail: function (err) { }
                });
            } else {
                this.warnb = true;
                this.errInfo = '请使用APP或者微信自带的浏览器进行扫码';
            }
        },
        /* 监听页面显示隐藏 */
        onPageVisibility(functions) {
            var _t = {};

            var onShowCall = function () {
                if (!functions || !functions.show) {
                    return;
                }
                window.clearTimeout(_t.showTime);
                _t.showTime = window.setTimeout(function () {
                    functions.show();
                }, 100);
            }

            var onHideCall = function () {
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
        }
    },
    watch: {
        warnb(newVal, oldVal) {
            if (newVal) {
                setTimeout(res => {
                    this.warnb = false;
                }, 2000)
            }
        }
    }
})