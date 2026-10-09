var pageVue = new Vue({
    el: "#vue",
    data: {
        masterDomain: masterDomain, //当前的域名
        userId: userId, //用户的id
        detail: {}, //详情信息
        describeInfo: 0, //预约参观
        applyInfo: 0, //入住申请
        info: '', //接口错误提示
        loadingb: true, //页面加载
        imgError: imgError, //图片加载错误的地址
        appBoolean: Boolean(navigator.userAgent.toLowerCase().match(/huoniao/))
    },
    mounted() {
        this.detailData();
        this.describeData();
        this.applyData();
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
                location.href = `${masterDomain}/pension.html`;
            } else {
                history.go(-1);
            }
        },
        linkTo(url) { //链接跳转
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
            } else {
                location.href = url;
            }
        },
        async detailData() { //详情信息
            let data = {
                service: 'member',
                action: 'storeCenterData',
                module: 'pension'
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
                    location.href = `${memberUrl}/config-pension.html`;
                } else {
                    this.detail = info;
                }
            } else {
                this.info = result.info;
            }
            this.loadingb = false;
        },
        async describeData() { //预约参观
            let data = {
                service: 'pension',
                action: 'bookingList',
                u: 1,
                page: 1,
                pageSize: 1
            }
            let result = await this.ajax(data);
            if (result.state == 100) {
                this.describeInfo = result.info.pageInfo.gray;
            }
        },
        async applyData() { //入住申请
            let data = {
                service: 'pension',
                action: 'awardList',
                u: 1,
                page: 1,
                pageSize: 1
            }
            let result = await this.ajax(data);
            if (result.state == 100) {
                this.applyInfo = result.info.pageInfo.gray;
            }
        }
    }
})