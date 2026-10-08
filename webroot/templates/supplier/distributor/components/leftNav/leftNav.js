/* 顶部导航 */
const { defineComponent, reactive, watch } = Vue;
export default defineComponent({
    name: 'left-nav', //组件名
    template:
        `<div class="LeftNav">
        <div class="L-list">
            <template v-for="(item,index) in tabConfig[type]" :key="item.id">
                <div :class="['Li-item',{'active':activeIndex==index},{'operate':item.id!=1}]" @click="linkTo(item.toUrl)" v-if="item.show"> 
                    {{item.title}}
                </div>
            </template>
        </div>
    </div>`, //模板
    props: { //传值
        companyInfo: {
            type: [Object],
            default: null
        },
        userInfo: {
            type: [Object],
            default: null
        },
        type: {//broker：房产中介 distribute：分销公司
            type: [String],
            default: 'broker'
        },
        activeIndex: {
            type: [Number, String],
            default: 0
        }
    },
    setup(props) { //methods
        let activeIndex = props.activeIndex;
        let tabConfig = reactive({
            broker: [
                {
                    id: 1, //绑定key用
                    title: '房产工作台', //title文本
                    toUrl: '', //跳转的url
                    show: false, //暂时永久隐藏
                },
                {
                    id: 2, //绑定key用
                    title: '公司信息', //title文本
                    toUrl: '/supplier/distributor/companyInfo.html', //跳转的url
                    show: false,
                },
                {
                    id: 3, //绑定key用
                    title: '经纪人管理', //title文本
                    toUrl: '/supplier/distributor/brokerManage.html', //跳转的url
                    show: false,
                },
                {
                    id: 4, //绑定key用
                    title: '房源管理', //title文本
                    toUrl: '/supplier/distributor/companyInfo.html', //跳转的url
                    show: false, //暂时隐藏
                },
                {
                    id: 5, //绑定key用
                    title: '客源管理', //title文本
                    toUrl: '/supplier/distributor/clientManage.html', //跳转的url
                    show: false,
                },
                {
                    id: 6, //绑定key用
                    title: '业主委托', //title文本
                    toUrl: '/supplier/distributor/ownerEntrust.html', //跳转的url
                    show: false,
                },
                {
                    id: 7, //绑定key用
                    title: '客户线索', //title文本
                    toUrl: '/supplier/distributor/clientManage.html?type=1', //跳转的url
                    show: false,
                },
                {
                    id: 8,
                    title: '共享池',
                    toUrl: '/supplier/distributor/sharePool.html',
                    show: false,
                },
                {
                    id: 9, //绑定key用
                    title: '新房分销', //title文本
                    toUrl: '/supplier/distributor/distribution.html', //跳转的url
                    show: false,
                },
                {
                    id: 10, //绑定key用
                    title: '佣金记录', //title文本
                    toUrl: '/supplier/distributor/brokerageRecord.html', //跳转的url
                    show: false,
                },
            ],
            distribute: [
                {
                    id: 1, //绑定key用
                    title: '分销工作台', //title文本
                    toUrl: '', //跳转的url
                    show: false, //暂时永久隐藏
                },
                {
                    id: 2, //绑定key用
                    title: '公司信息', //title文本
                    toUrl: '/supplier/distributor/companyInfo.html', //跳转的url
                    show: false,
                },
                {
                    id: 3, //绑定key用
                    title: '团队管理', //title文本
                    toUrl: '/supplier/distributor/brokerManage.html', //跳转的url
                    show: false,
                },
                {
                    id: 4, //绑定key用
                    title: '分销报备', //title文本
                    toUrl: '/supplier/distributor/distribution.html', //跳转的url
                    show: false,
                },
                {
                    id: 5, //绑定key用
                    title: '佣金记录', //title文本
                    toUrl: '/supplier/distributor/brokerageRecord.html', //跳转的url
                    show: false,
                },
            ],
        });
        watch(
            () => [props.userInfo, props.companyInfo], // 监听这两个值的变化
            (newValue, oldValue) => {
                const [newUserInfo, newCompanyInfo] = newValue;
                if (newCompanyInfo?.id && newUserInfo?.id) {
                    let exceptIndex = {
                        broker: [1, 4], //元素内容是下标tabConfig中元素对应的id
                        distribute: [1]
                    }
                    if (newCompanyInfo.uid !== newUserInfo.uid) {
                        // 不是店长，隐藏佣金记录
                        exceptIndex = {
                            broker: [...exceptIndex.broker, 2, 3, 10], //元素内容是下标tabConfig中元素对应的id
                            distribute: [...exceptIndex.distribute, 5]
                        }
                    }
                    for (let key in exceptIndex) {
                        let value = tabConfig[key];
                        for (let i = 0; i < value.length; i++) {
                            let item = value[i];
                            item.show = !exceptIndex[key].includes(item.id);
                        }
                    }
                    if (!tabConfig[props.type][activeIndex].show) { //如果说当前项的show是false的话，选中当前tab第一个为show的页面
                        activeIndex = tabConfig[props.type].findIndex(item => item.show);
                        location.href = tabConfig[props.type][activeIndex].toUrl;
                    }
                    // // 用户信息已加载
                    if (newUserInfo?.id) {
                        tabConfig[props.type][2].show = Boolean(newUserInfo.leaderName); // 经纪人管理显隐
                    }
                }
            },
            { deep: true, immediate: true }
        );

        let linkTo = res => {
            if (res) location.href = res;
        }
        return {
            activeIndex,
            tabConfig,
            linkTo
        };
    },
});