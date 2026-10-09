new Vue({
    el: '#Shell',
    data: {
        listData: [],
        symbolArea: symbolArea,
        symbolShort: symbolShort

    },
    mounted() {
        let url = location.search;
        let params = new URLSearchParams(url.slice(1));
        this.getTarget(params.get('id')); //获取数据
    },
    methods: {
        async getTarget(id) { //获取指定项
            let data = {
                service: 'house',
                action: `saleList`,
                id: id
            };
            let result = await ajax(data, { dataType: 'json' });
            if (result.state == 100) {
                let info = result.info.list;
                for (let i = 0; i < info.length; i++) {
                    let item = info[i];
                    if (item.opendate) {
                        let date = new Date(item.opendate * 1000);
                        let year = date.getFullYear();
                        let month = date.getMonth() + 1;
                        let day = date.getDate();
                        item.opendate = `${year}年${month}月${day}日`;
                    } else {
                        item.opendate = '待定';
                    }
                }
                this.listData = info;
            } else {
                this.popWarn(result.info);
            }
        },
        popWarn(info) { //弹窗提示
            $('.popWarn').text(info);
            $('.popWarn').show();
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = setTimeout(res => {
                $('.popWarn').hide();
            }, 2000);
        },
        shareFn() { //分享对比结果
            let target = location.href;
            let save = function (e) {
                e.clipboardData.setData('text/plain', target);
                e.preventDefault();//阻止默认行为
            }
            // 选择内容
            document.addEventListener('copy', save);
            // 复制内容
            document.execCommand("copy");
            this.popWarn('当前页链接复制成功！')
        }
    }
});