var pageVue = new Vue({
    el: "#vue",
    data: {
        masterDomain: masterDomain, //当前的域名
        userId: userId, //用户的id
        detail: {}, //详情信息
        subscribeInfo: 0,//预约信息
        info: '', //接口错误提示
        loadingb: true, //页面加载
        imgError: imgError, //图片加载错误的地址
        appBoolean: Boolean(navigator.userAgent.toLowerCase().match(/huoniao/))
    },
    mounted() {
        this.detailData();
        this.subscribeData();
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
                location.href = `${masterDomain}/car.html`;
            } else {
                history.go(-1);
            }
        },
        linkTo(url,wxUrl) { //链接跳转
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
                module: 'car'
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
                    location.href = `${memberUrl}/config-car.html`;
                } else {
                    this.detail = info;
                    this.subscribeData();
                }
            } else {
                this.info = result.info;
            }
            this.loadingb = false;
        },
        async subscribeData() { //预约信息
            let data = {
                service: 'car',
                action: 'storeAppointList',
                page: 1,
                pageSize: 1,
                store: this.detail.id
            }
            let result = await this.ajax(data);
            if (result.state == 100) {
                this.subscribeInfo = result.info.pageInfo.state0;
            }
        },
    }
})