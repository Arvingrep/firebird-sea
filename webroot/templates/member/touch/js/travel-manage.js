var pageVue = new Vue({
    el: "#vue",
    data: {
        masterDomain: masterDomain, //当前的域名
        userid: userid, //用户的id
        typeList: [
            {
                title: '旅行社',
                tip: '可发布旅游产品与服务',
                child: [
                    { id: '2', typename: "景点门票", select: false },
                    { id: '4', typename: "周边游", select: false },
                    { id: '3', typename: "租车", select: false },
                    { id: '7', typename: "签证", select: false }
                ]
            }, {
                id: '1',
                title: '酒店/民宿',
                tip: '可设置不同房型与价格',
                btn: true,
                select: false
            }
        ],//经营类别
        selectType: [], //选中的类别id
        info: '',
        warnb: false,
        savePop: false, //保存提示
        popb: false,
        appBoolean: Boolean(navigator.userAgent.toLowerCase().match(/huoniao/))
    },
    mounted() {
        this.typeData();

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
                location.href = `${masterDomain}/homemaking.html`;
            } else {
                history.go(-1);
            }
        },
        linkTo(url, login = false) { //链接跳转
            if (login && !this.userid) {
                url = `${this.masterDomain}/login.html`;
            }
            location.href = url;
        },
        async typeData() { //经营类别
            let data = {
                service: 'travel',
                action: 'storeDetail',
            };
            let result = await this.ajax(data);
            if (result.state == 100) {
                let selectArr = result.info.bind_moduleArr_;
                for (let i = 0; i < this.typeList.length; i++) {
                    let item = this.typeList[i];
                    if (item.child) { //子元素存在
                        for (let j = 0; j < item.child.length; j++) {
                            let itemc = item.child[j];
                            if (selectArr.includes(itemc.id)) {
                                itemc.select = true;
                                this.selectType.push(itemc.id);
                            }
                        }
                    } else if (selectArr.includes(item.id)) {
                        item.select = true;
                        this.selectType.push(item.id);
                    }
                }
            }
        },
        selectFn(item) { //选择/取消选择
            let select = item.select;
            let selectType = this.selectType;
            if (select) { //已经选中了
                if (item.id == 1) {
                    this.savePop = true; //婚宴酒店取消弹窗提示，在保存时触发
                }
                let index = selectType.indexOf(item.id);
                selectType.splice(index, 1);
            } else { //未选中
                if (item.id == 1) {
                    this.savePop = false;
                }
                selectType.push(item.id);
            }
            item.select = !select;
        },
        async saveFn(access) { //保存
            if (this.selectType.length == 0) {
                this.info = '请至少选择一项';
                this.warnb = true;
            } else if (this.savePop && !access) { //弹窗提示
                this.popb = true;
            } else {
                let data = {
                    service: 'travel',
                    action: 'storeConfigModule',
                    bind_module: this.selectType.join(',')
                };
                let result = await this.ajax(data);
                this.info = result.info;
                this.warnb = true;
                this.popb = false;
                if (result.state == 100) {
                    setTimeout(res => {
                        this.backFn();
                    }, 2000)
                }
            }
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