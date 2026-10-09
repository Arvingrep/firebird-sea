new Vue({
    el: '#Shell',
    data: {
        selfList: [],//已选择过列表（顶部部分）
        recommendList: [], //推荐/浏览列表
        compareArr: [], //已选中对比项（最多两项）
        info: '', //弹窗提示内容
        timeoutTimer: '', //计时器
        activeIndex: 0, //tab切换选中下标
        page: 1,
        pageSize: 10,
        ajaxb: false,
        loadingb: true, //加载中标识
        // 左滑删除相关
        startX: 0,
        maxDistance: 0,
    },
    async mounted() {
        let localArr = JSON.parse(localStorage.getItem(`h5_${type}_compare`));
        if (localArr&&localArr.length>0) { //本地是否有记录
            let length=localArr.length; //静态（不会随localArr变化）
            for (let i = 0; i < length; i++) {
                let item = localArr[i];
                if (item.id == pageId) { //之前添加过
                    this.selfList = localArr;
                    break;
                } else if (localArr.length - 1 == i) { //之前未添加过
                    this.selfList = localArr;
                    await this.getTarget(pageId);
                }
            }
        } else {
            await this.getTarget(pageId); //这里如果异步，因为listfn也是异步，所以可能会出现上面和下面某个数据重复，且重复数据都会显示。
        }
        this.tabFn(0);
        this.touchBottom(); //触底加载
        this.maxDistance = this.RemChangePx(1.3); //这里的单位是rem
    },
    methods: {
        popWarn(info) { //弹窗提示
            $('.popWarn').text(info);
            $('.popWarn').show();
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = setTimeout(res => {
                $('.popWarn').hide();
            }, 2000);
        },
        async listFn(data, bottom = false) { //列表获取
            if (this.ajaxb) {
                return false
            }
            this.ajaxb = true;
            let result = await ajax(data, { dataType: 'json' });
            this.ajaxb = false;
            if (result.state == 100) {
                let info = result.info.list;
                //检验上面自选列表和下面推荐列表是否有相同的数据
                for(let i=0;i<this.selfList.length;i++){
                    let item=this.selfList[i];
                    b:for(let j=0;j<info.length;j++){
                        let infoItem=info[j];
                        if(infoItem.id==item.id){ //上面列表和下面推荐列表中出现了相同项，去掉下面列表中的那个
                            info.splice(j,1);
                            break b;
                        }
                    }
                }
                if (bottom) { //触底
                    this.recommendList = [...this.recommendList, ...info];
                } else { //非触底
                    this.recommendList = info;
                }
                this.loadingb = Boolean(info.length == this.pageSize);
            } else {
                this.popWarn(result.info);
            }
        },
        async getTarget(id) { //获取指定项
            let data = {
                service: 'house',
                action: `${type}List`,
                id: id
            };
            let result = await ajax(data, { dataType: 'json' });
            if (result.state == 100) {
                result.info.list[0]['moveDistance'] = 0;
                this.selfList.unshift(result.info.list[0]);
                localStorage.setItem(`h5_${type}_compare`, JSON.stringify(this.selfList));
            } else {
               this.popWarn(result.info);
            }
        },
        tabFn(index) { //tab切换
            this.activeIndex = index;
            this.page = 1; //页面重置
            this.recommendList = []; //列表重置
            this.compareArr = []; //对比数组重置
            this.loadingb = true; //加载状态重置
            let data = {};
            if (index == 0) { //热销/猜你喜欢
                data = {
                    service: 'house',
                    action: `${type}List`,
                    filter: 'hot',
                    page: 1,
                    pageSize: this.pageSize
                }
            } else { //浏览记录
                data = {
                    service: 'member',
                    action: 'footprintsGet',
                    module: 'house',
                    module2: `${type}Detail`,
                    page: 1,
                    pageSize: this.pageSize
                }
            }
            this.listFn(data);
        },
        touchBottom() { //触底加载
            let _this = this;
            $(window).scroll(function () {
                let scrollTop = $(this).scrollTop();
                let scrollHeight = $(document).height();
                let windowHeight = $(this).height();
                if (scrollTop + windowHeight == scrollHeight) { //窗口高度+卷上去的高度=整体高度
                    if (_this.activeIndex == 0) { //热销/猜你喜欢
                        data = {
                            service: 'house',
                            action: `${type}List`,
                            filter: 'hot',
                            page: ++_this.page,
                            pageSize: _this.pageSize
                        }
                    } else { //浏览记录
                        data = {
                            service: 'member',
                            action: 'footprintsGet',
                            module: 'house',
                            module2: `${type}Detail`,
                            page: ++_this.page,
                            pageSize: _this.pageSize
                        }
                    }
                    if (_this.loadingb) { //还有数据
                        _this.listFn(data, true);
                    }
                }
            });
        },
        deleteFn(index) { //删除记录
            event.stopPropagation(); //阻止父级事件触发（选中）
            let deleteItem = this.selfList[index]; //删除项
            let compareArr = this.compareArr;
            for (let i = 0; i < compareArr.length; i++) {
                let item = compareArr[i];
                if (item == deleteItem.id) { //对比项已经选择了，清掉
                    this.compareArr.splice(i, 1);
                }
            }
            this.selfList.splice(index, 1); //删除
            localStorage.setItem(`h5_${type}_compare`, JSON.stringify(this.selfList)); //本地存储更新
            this.popWarn('删除成功！');
        },
        touchStartFn(options) { //获取初始点坐标
            let startX = options.changedTouches[0].pageX;
            this.startX = startX;
        },
        toucMoveFn(options, index) {
            let moveX = options.changedTouches[0].pageX;
            let diff = this.startX - moveX; //差值，大于0说明左拉 小于0说明右拉
            let maxDistance = this.maxDistance;
            let dragItem = this.selfList[index];
            if (diff > 0) { //左拉
                if (diff < maxDistance) { //没有超出最大距离
                    dragItem.moveDistance = this.RemChangePx(0, diff);
                } else if (dragItem.moveDistance != maxDistance) { //超过最大值且没赋过值，优化操作
                    dragItem.moveDistance = this.RemChangePx(0, maxDistance);
                }
            } else if (dragItem.moveDistance > 0) { //右拉，只有按钮完全暴露了才能右拉
                if (-diff < maxDistance) {
                    dragItem.moveDistance = -this.RemChangePx(0, diff);
                } else if (dragItem.moveDistance > 0) {//这里加判断是为了避免重复赋值
                    dragItem.moveDistance = 0;
                }
            }
        },
        touchEndFn(options, index) { //松手之后的操作
            let endX = options.changedTouches[0].pageX;
            let quarter = this.maxDistance / 4; //最大距离的25%
            let diff = this.startX - endX;
            let dragItem = this.selfList[index];
            if (diff > 0) { //左拉
                dragItem.moveDistance = this.RemChangePx(0, diff > quarter ? this.maxDistance : 0);
            } else if (dragItem.moveDistance > 0 && (-diff) >= quarter) { //右拉
                dragItem.moveDistance = 0;
            }
        },
        RemChangePx(rem = 0, px = 0) { //rem转px
            let x = document.documentElement;
            let a = x.getBoundingClientRect().width;
            let y = document.querySelector('meta[name="viewport"]');
            let z = document.querySelector('meta[name="flexible"]');
            let A = 0;
            let B = 0;
            if (y) {
                let D = y.getAttribute("content").match(/initial\-scale=([\d\.]+)/);
                D && (B = parseFloat(D[1]),
                    A = parseInt(1 / B))
            } else if (z) {
                let E = z.getAttribute("content");
                if (E) {
                    let F = E.match(/initial\-dpr=([\d\.]+)/)
                        , G = E.match(/maximum\-dpr=([\d\.]+)/);
                    F && (A = parseFloat(F[1]),
                        B = parseFloat((1 / A).toFixed(2))),
                        G && (A = parseFloat(G[1]),
                            B = parseFloat((1 / A).toFixed(2)))
                }
            }
            if (!A && !B) {
                let H = (navigator.appVersion.match(/android/gi),
                    navigator.appVersion.match(/iphone/gi))
                    , I = devicePixelRatio;
                A = H ? I >= 3 && (!A || A >= 3) ? 3 : I >= 2 && (!A || A >= 2) ? 2 : 1 : 1,
                    B = 1 / A
            }
            a / A > 540 && (a = 540 * A);
            let d = a / 7.5;
            if (rem) { //rem转px
                return d * rem
            } else { //px转rem
                return (px / d).toFixed(2);
            }
        },
        selectFn(id) {
            let compareArr = this.compareArr;
            let index = compareArr.indexOf(id);
            if (index > -1) { //已经选择过了，直接取消选择
                compareArr.splice(index, 1);
            } else if (compareArr.length >= 2) {
                this.popWarn(`一次只能两个${type == 'loupan' ? '楼盘' : '房源'}对比哦`);
            } else {
                compareArr.push(id);
            }
        },
        toCompareFn(hostName){ //对比跳转
            if(this.compareArr.length<2){
                this.popWarn('请选择两项进行对比');
                return false
            }
            location.href=`${hostName}/${type}-compare.html?id=${this.compareArr.join(',')}`
        }
    }
})