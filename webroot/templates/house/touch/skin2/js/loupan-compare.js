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
                action: `loupanList`,
                id: id
            };
            let result = await ajax(data, { dataType: 'json' });
            if (result.state == 100) {
                let info = result.info.list;
                for (let i = 0; i < info.length; i++) {
                    let item = info[i];
                    if (item.deliverdate) {
                        let date = new Date(item.deliverdate * 1000);
                        let year = date.getFullYear();
                        let month = date.getMonth() + 1;
                        let day = date.getDate();
                        item.deliverdate = `预计${year}年${month}月${day}日`;
                    } else {
                        item.deliverdate = '待定';
                    }
                    if (item.opendate) {
                        let date = new Date(item.opendate * 1000);
                        let year = date.getFullYear();
                        let month = date.getMonth() + 1;
                        let day = date.getDate();
                        item.opendate = `预计${year}年${month}月${day}日`;
                    } else {
                        item.opendate = '待定';
                    }
                    // 户型处理
                    if (item.hx_data.length > 0) {
                        let hxArr = [item.hx_data[0]];
                        for (let a = 1; a < item.hx_data.length; a++) {
                            let hxLength = hxArr.length;
                            x: for (let b = 0; b < hxLength; b++) {
                                if (hxArr[b].room == item.hx_data[a].room) { //找到对应户型area合并
                                    hxArr[b].area = `${hxArr[b].area}${symbolArea}，${item.hx_data[a].area}`;
                                    break x; //直接结束x循环
                                } else if (hxArr.length - 1 == b) { //未找到对应户型
                                    hxArr.push(item.hx_data[a]);
                                }
                            }
                        }
                        item['hxArr'] = hxArr;
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
})