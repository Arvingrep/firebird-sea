(async function () {
    const { createApp, reactive, ref, onMounted } = Vue; //1.vue引入
    const { ElMessage } = ElementPlus;
    const app = createApp({ //2.创建
        setup() {
            /** tab切换
            *  @property {tabConfig} 总参数
            */
            let tabConfig = reactive({
                list: [ //列表
                    { //全部报备
                        id: 1,
                        title: '分销佣金',
                    },
                    { //待审核
                        id: 2,
                        title: '提现记录',
                        num: 0,
                    }
                ],
                active: 0, //选中项
            });
            let tabFn = async index => {
                tableConfig.page = 1;
                tableConfig.list = [];
                tabConfig.active = index;
                await getTableData();
            }
            /** 列表筛选
            *  @property {filterConfig} 总配置
            */
            let filterConfig = reactive({
                date: { //日期筛选
                    value: ['', ''], //值
                    shortcuts: [
                        {
                            text: '最近一周',
                            value: () => {
                                const end = new Date()
                                const start = new Date()
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                                return [start, end]
                            },
                        },
                        {
                            text: '最近一个月',
                            value: () => {
                                const end = new Date()
                                const start = new Date()
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                                return [start, end]
                            },
                        },
                        {
                            text: '最近三个月',
                            value: () => {
                                const end = new Date()
                                const start = new Date()
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                                return [start, end]
                            },
                        },
                        {
                            text: '最近一年',
                            value: () => {
                                const end = new Date()
                                const start = new Date()
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
                                return [start, end]
                            },
                        },
                    ]
                },
                keywords: '' //关键字搜索
            })
            /** 表格
            *  @property {tableConfig} 表格配置
            *  @function [getTableData] 获取表格数据
            *  @function [pagingFn] 分页跳转
            */
            let tableConfig = reactive({
                ref: {},
                column: [
                    { //结算时间
                        id: 1,
                        label: '结算时间',
                        prop: 'settlementDate',
                        align: 'left',
                        show: [0] //哪些需要显示
                    },
                    { //账单编号
                        id: 2,
                        label: '账单编号',
                        prop: 'bill',
                        align: 'left',
                        show: [0] //哪些需要显示
                    },
                    { //分销楼盘
                        id: 3,
                        label: '分销楼盘',
                        prop: 'build_name',
                        align: 'left',
                        show: [0, 1] //哪些需要显示
                    },
                    { //关联记录
                        id: 4,
                        label: '关联记录',
                        prop: 'cname',
                        align: 'left',
                        show: [0] //哪些需要显示
                    },
                    { //可提现佣金(元)
                        id: 5,
                        label: '可提现佣金(元)',
                        prop: 'commission',
                        align: 'left',
                        show: [0] //哪些需要显示
                    },
                    { //操作
                        id: 6,
                        label: '操作',
                        prop: 'operate',
                        align: 'center',
                        show: [0] //哪些需要显示
                    },
                    { //操作人
                        id: 7,
                        label: '操作人',
                        prop: 'audit_name',
                        align: 'left',
                        show: [1] //哪些需要显示
                    },
                    { //操作时间
                        id: 8,
                        label: '操作时间',
                        prop: 'auditDate',
                        align: 'left',
                        show: [1] //哪些需要显示
                    },
                    { //打款说明
                        id: 9,
                        label: '打款说明',
                        prop: 'note',
                        align: 'left',
                        show: [1] //哪些需要显示
                    },
                    { //提现佣金(元)
                        id: 10,
                        label: '提现佣金(元)',
                        prop: 'commission',
                        align: 'left',
                        show: [1] //哪些需要显示
                    },
                    { //状态
                        id: 11,
                        label: '状态',
                        prop: 'status',
                        align: 'center',
                        show: [1] //哪些需要显示
                    }
                ], //表格列
                list: [], //列表
                page: 1, //当前页
                pageSize: 10, //每页条数
                pageInfo: {}, //分页信息
                loading: false, //加载状态
            });
            let getTableData = async res => {
                tableConfig.loading = true;
                if (!filterConfig.date.value) { //选项清除bug修补
                    filterConfig.date.value = ['', ''];
                }
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/commissionList',
                    status: tabConfig.active == 0 ? 0 : 3,
                    startTime: filterConfig.date.value[0] || '',
                    endTime: filterConfig.date.value[1] || '',
                    keyword: filterConfig.keywords,
                    page: tableConfig.page,
                    pageSize: tableConfig.pageSize
                }
                let result = await request.post(data);
                tableConfig.loading = false;
                if (result.data.state == 100) {
                    let info = result.data.info;
                    tableConfig.list = info.list;
                    tableConfig.pageInfo = info.pageInfo;
                    tabConfig.list[1].num = info.pageInfo.totalCountCash; //提现记录统计
                }
            }
            let pagingFn = async res => {
                tableConfig.page = res;
                getTableData();
            }
            /** 表单全选 
            * @property {selectConfig} 总配置
            * @function [selectAllFn] 全选按钮
            * @function [selectChangeFn] 单选切换
            */
            let selectConfig = reactive({
                all: false, //全选状态
                count: 0,
            });
            let selectAllFn = res => {
                tableConfig.ref.toggleAllSelection();
            }
            let selectChangeFn = res => {
                let length = res.length;
                selectConfig.count = length; //选中数量
                if (length > 0 && length == tableConfig.list.length) { //全选
                    selectConfig.all = true;
                } else if (selectConfig.all) { //非全选
                    selectConfig.all = false;
                }
            }
            /** 导出EXCEL
            * @function [exportFn] 导出EXCEL
            */
            let exportFn = async res => {
                let selectRes = tableConfig.ref.getSelectionRows();
                if (selectRes.length == 0) {
                    ElMessage.warning('请选择要导出的记录！');
                    return false;
                }
                let ids = [];
                selectRes.forEach(item => {
                    ids.push(item.id);
                });
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/commissionList',
                    execute: 2,
                    ids: ids.join(','),
                    status: tabConfig.active == 0 ? 0 : 3,
                    startTime: filterConfig.date.value[0] || '',
                    endTime: filterConfig.date.value[1] || '',
                    keyword: filterConfig.keywords,
                    page: tableConfig.page,
                    pageSize: tableConfig.pageSize
                }
                let arr = [];
                for (let key in data) {
                    let item = data[key];
                    arr.push(`${key}=${item}`);
                }
                location.href = `${masterDomain}/include/ajax.php?${arr.join('&')}`;

            }
            /** 提现
            * @property {widthdrawConfig} 提现配置
            * @function [withdrawFn] 提现
            */
            let widthdrawConfig = reactive({
                pop: false, //弹窗
                ids: [], //提现id
                money: 0, //提现金额
                loading: false,
            })
            let widthdrawPopFn = item => {
                if (item) { //单选
                    widthdrawConfig.ids = [item.id];
                    widthdrawConfig.money = item.commission;
                } else { //多选
                    let selectRes = tableConfig.ref.getSelectionRows();
                    if (selectRes.length == 0) {
                        ElMessage.warning('请选择要提现的记录！');
                        return false;
                    } else {
                        widthdrawConfig.ids = [];
                        widthdrawConfig.money = 0;
                        selectRes.forEach(res => {
                            widthdrawConfig.money += res.commission;
                            widthdrawConfig.ids.push(res.id);
                        });
                    }
                }
                widthdrawConfig.pop = true;
            }
            let withdrawFn = async res => {
                widthdrawConfig.loading = true;
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/commissionList',
                    execute: 1,
                    ids: widthdrawConfig.ids.join(','),
                }
                let result = await request.post(data);
                widthdrawConfig.loading = false;
                if (result.data.state == 100) {
                    ElMessage.success(result.data.info);
                    widthdrawConfig.pop = false;
                    getTableData();
                } else {
                    ElMessage.error(result.data.info);
                }
            }
            /** @description onMounted */
            let companyInfo = ref({});
            let userInfo = ref({});
            onMounted(res => {
                utils.getCompanyInfo(companyInfo);
                utils.getUserInfo(userInfo);
                getTableData();
            })
            return {
                ...utils,
                companyInfo,
                userInfo,
                tabConfig,
                tabFn,
                filterConfig,
                tableConfig,
                getTableData,
                pagingFn,
                selectConfig,
                selectAllFn,
                selectChangeFn,
                exportFn,
                widthdrawConfig,
                widthdrawPopFn,
                withdrawFn
            }
        }
    });
    app.use(ElementPlus, { locale: ElementPlusLocaleZhCn }); //3.使用ElementPlus
    //4.引入组件
    let componentConfig = [
        {
            url: `../components/topNav/topNav.js?v=${staticVersion}`,
            name: 'top-nav',
        },
        {
            url: `../components/leftNav/leftNav.js?v=${staticVersion}`,
            name: 'left-nav',
        }
    ]
    for (let i = 0; i < componentConfig.length; i++) {
        let item = componentConfig[i];
        let result = await import(item.url); //因为静态版本号，所以需要动态引入，若不是动态引入则直接使用import xxx from 'xxx'
        app.component(item.name, result.default);
    }
    //5.最后挂载vue
    app.mount('#brokerageRecord');
})();