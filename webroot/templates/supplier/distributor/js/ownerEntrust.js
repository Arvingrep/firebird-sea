(async function () {
    const { createApp, reactive, computed, onMounted, ref } = Vue; //1.vue引入
    const { ElMessage, genFileId } = ElementPlus;
    const app = createApp({ //2.创建
        setup() {
            let identity = Number(localStorage.getItem('house_identity')); //0:管理者，1:经纪人
            /** tab切换
             *  @param {tabConfig} 总参数
            */
            let tabConfig = reactive({
                list: [
                    {
                        id: 1, name: '业主委托', num: computed(res => {
                            return tableConfig.pageInfo?.totalCount || 0
                        }), red: 0
                    },
                ],
                active: 0
            });
            let tabFn = index => {
                tabConfig.active = index;
            }
            /** 筛选
             *  @property {filterConfig} 总参数
             */
            let filterConfig = reactive({
                invalid: false, //无效信息过滤
                type: '', //委托类型
                typeOption: [ //委托类型选项
                    {
                        label: '在线委托',
                        value: '10',
                    },
                    {
                        label: '导入委托',
                        value: '11',
                    }
                ],
                follow: '', //跟进情况
                followOption: [ //跟进选项
                    {
                        label: '已联系',
                        value: '1'
                    },
                    {
                        label: '已委托',
                        value: '2'
                    },
                    {
                        label: '委托无效',
                        value: '3'
                    }
                ],
                origin: '',
                originOption: [ //来源
                    {
                        label: '新房',
                        value: '1',
                    },
                    {
                        label: '二手房',
                        value: '2',
                    },
                    {
                        label: '租房',
                        value: '3',
                    },
                    {
                        label: '写字楼',
                        value: '4',
                    },
                    {
                        label: '商铺',
                        value: '5',
                    },
                    {
                        label: '厂房',
                        value: '6',
                    },
                    {
                        label: '仓库',
                        value: '7',
                    },
                    {
                        label: '车位',
                        value: '8',
                    },
                    {
                        label: '土地',
                        value: '9',
                    },
                ],
                keywords: '', //关键字
                recordRef: {},
            });
            /** 表单
             *  @property {tableConfig} 总参数
             *  @property {currTableColum} 当前表格列配置
             */
            let tableConfig = reactive({
                list: [], //列表数据
                page: 1, //页码
                pageSize: 10, //每页数量
                pageInfo: {}, //分页信息
                total: 0,
                column: { //列配置
                    owner: [ //业主委托
                        { //客户
                            id: 1,
                            label: '客户',
                            prop: 'client',
                            align: 'left',
                            width: '280px',
                        },
                        { //委托说明
                            id: 2,
                            label: '委托说明',
                            prop: 'history',
                            align: 'left',
                            width: '320px',
                        },
                        { //报价
                            id: 3,
                            label: '报价',
                            prop: 'price',
                            align: 'left',
                            width: '150px'
                        },
                        { //委托时间
                            id: 4,
                            label: '委托时间',
                            prop: 'time',
                            align: 'left',
                            width: '150px'
                        },
                        { //状态
                            id: 5,
                            label: '状态',
                            prop: 'state',
                            align: 'center',
                            width: '150px'
                        },
                        { //跟进人
                            id: 6,
                            label: '跟进人',
                            prop: 'follow',
                            align: 'left',
                            width: '150px'
                        },
                        { //操作
                            id: 7,
                            label: '操作',
                            prop: 'operate',
                            align: 'left',
                            width: '300px',
                        }
                    ]
                },
                loading: false,
            });
            let currTableColum = computed(res => {
                let returnList = [];
                switch (tabConfig.active) {
                    case 0: {
                        returnList = tableConfig.column.owner;
                        break;
                    }
                }
                return returnList;
            });
            let getTableData = async res => {
                if (tableConfig.loading) return false;
                tableConfig.loading = true;
                tableConfig.list = [];
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/ownerEntrustList',
                    keyword: filterConfig.keywords || '', //搜索
                    concat: filterConfig.follow || '', //跟进
                    source: filterConfig.origin || '', //委托类型
                    invalid: filterConfig.invalid ? 1 : 0,
                    identity: Number(!identity),
                    page: tableConfig.page,
                    pageSize: tableConfig.pageSize
                }
                let result = await request.post(data);
                tableConfig.loading = false;
                if (result.data.state == 100) {
                    let info = result.data.info;
                    for (let i = 0; i < info.list.length; i++) {
                        let item = info.list[i];
                        item.visiable = false;
                    }
                    tableConfig.list = info.list;
                    tableConfig.pageInfo = info.pageInfo;
                    // for (let i = 0; i < info.pageInfo.typeCount2.length; i++) {
                    //     let item = info.pageInfo.typeCount2[i];
                    //     tabConfig.list[i] = { ...tabConfig.list[i], ...item };
                    // }
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
                ref: {},
                all: false, //全选状态
                count: 0,
            });
            let selectAllFn = res => {
                selectConfig.ref.toggleAllSelection();
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
            /** 二次弹窗提示
             * @property {diaglogConfig}
             */
            let dialogConfig = reactive({
                loading: false,
                pop: false,
                title: '',
                tip: '',
            });
            let dialogFn = (show, type) => {
                if (selectConfig.count == 0) {
                    ElMessage.warning('请选择用户');
                    return false;
                }
                switch (type) {
                    case 'store': { //转店
                        dialogConfig.title = `确定将这${selectConfig.count}个客户，转入店组共享池？`;
                        dialogConfig.tip = `转入后，经纪人可自主认领抢客`;
                        break;
                    }
                    case 'door': { //转门
                        dialogConfig.title = `确定将这${selectConfig.count}个客户，转入门店共享池？`;
                        dialogConfig.tip = `转入后，经纪人可自主认领抢客`;
                        break;
                    }
                }
                dialogConfig.pop = show;
            }
            let transferFn = async share => {
                if (dialogConfig.loading) return false;
                dialogConfig.loading = true;
                let ids = selectRes.map(res => res.id).join(',');
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/unfollowCustomer',
                    ids: ids,
                    share: share
                }
                let result = await request.post(data);
                dialogConfig.loading = false;
                if (result.data.state == 100) {
                    ElMessage.success(result.data.info);
                    getTableData();
                } else {
                    ElMessage.error(result.data.info);
                }
            }
            /** 指派功能
             * @property {assignConfig} 
             * @function [assignPop] 指派弹窗
             * @function [assignConfirm] 确认指派
             */
            let assignConfig = reactive({
                item: {},
                pop: false, //弹窗
                hasSelect: [], //指派id
                loading: false,
                filter: -1,
                options: [ //筛选职务类型
                    { //全部职务
                        value: -1,
                        label: '全部职务'
                    },
                    { //经纪人
                        value: 0,
                        label: '经纪人'
                    },
                    { //组长
                        value: 1,
                        label: '组长'
                    },
                    { //主管
                        value: 2,
                        label: '主管'
                    },
                    { //驻场
                        value: 3,
                        label: '驻场'
                    },
                    { //店长
                        value: 4,
                        label: '店长'
                    }
                ],
                keywords: ''
            });
            let assignPop = item => {
                assignConfig.pop = true;
                assignConfig.item = item;
                if (brokerConfig.list.length == 0) {
                    borkerFn();
                }
                if (wanderConfig.list.length == 0) {
                    wanderFn();
                }
            }
            let assignConfirm = async res => {
                if (assignConfig.loading) return false;
                assignConfig.loading = true;
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/assignCustomer',
                    id: assignConfig.item.id,
                    userid: brokerConfig.id
                }
                let result = await request.post(data);
                assignConfig.loading = false;
                if (result.data.state == 100) {
                    assignConfig.pop = false;
                    ElMessage.success(result.data.info);
                    getTableData();
                } else {
                    ElMessage.error(result.data.info);
                }
            }
            /** 经纪人/流转记录
            * @property {brokerConfig} 
            * @function [borkerFn] 获取经纪人列表
            * @property {wanderConfig}
            */
            let brokerConfig = reactive({
                id: '',
                list: [], //经纪人列表
                loading: false, //loading
            });
            let borkerFn = async res => {
                if (brokerConfig.loading) return false;
                brokerConfig.loading = true;
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/companyUserList',
                    duty: assignConfig.filter,
                    keyword: assignConfig.keywords,
                    page: 1,
                    pageSize: 9999
                }
                let result = await request.post(data);
                brokerConfig.loading = false;
                if (result.data.state == 100) {
                    let info = result.data.info;
                    brokerConfig.list = info.list;
                }
            }
            let wanderConfig = reactive({
                list: [], //流转记录
                pageInfo: {},
            });
            let wanderFn = async res => {
                if (wanderConfig.loading) return false;
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/getFollowList',
                    id: assignConfig.item.id
                }
                let result = await request.post(data);
                if (result.data.state == 100) {
                    let info = result.data.info;
                    for (let i = 0; i < info.list.length; i++) {
                        let item = info.list[i];
                        item['selected'] = false;
                    }
                    wanderConfig.list = info.list;
                    wanderConfig.pageInfo = info.pageInfo;
                }
            }
            /** 导出名单
             * @function [exportFn]
             */
            let exportFn = async res => {
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/ownerEntrustList',
                    keyword: filterConfig.keywords || '', //搜索
                    concat: filterConfig.follow || '', //跟进
                    source: filterConfig.origin || '', //委托类型
                    invalid: filterConfig.invalid ? 1 : 0,
                    identity: Number(!identity),
                    page: tableConfig.page,
                    pageSize: tableConfig.pageSize,
                    export: 1
                }
                let arr = [];
                for (let key in data) {
                    let item = data[key];
                    arr.push(`${key}=${item}`);
                }
                location.href = `${masterDomain}/include/ajax.php?${arr.join('&')}`;
            }
            /** 标记客户
             * @property {markConfig} 标记配置
             */
            let markConfig = reactive({
                id: '', //目标id
                type: 2, //标记类型 已联系 未联系 无效客户
                note: '', //备注
                loading: false, //loading
            });
            let addMarkFn = async res => {
                markConfig.loading = true;
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/markCustomer',
                    id: markConfig.id,
                    status: markConfig.type,
                    mark: markConfig.note,
                }
                let result = await request.post(data);
                markConfig.loading = false;
                if (result.data.state == 100) {
                    res.visiable = false;
                    markConfig.note = '';
                    getTableData();
                    ElMessage.success(result.data.info);
                } else {
                    ElMessage.error(result.data.info);
                }
            }
            /** 删除客户
             * @function [deleteFn]
             */
            let deleteFn = async id => {
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/delCustomer',
                    ids: id,
                }
                let result = await request.post(data);
                if (result.data.state == 100) {
                    ElMessage.success(result.data.info);
                    getTableData();
                } else {
                    ElMessage.error(result.data.info);
                }
            }
            /** 生命周期 */
            let companyInfo = ref({});
            let userInfo = ref({});
            onMounted(res => {
                utils.getCompanyInfo(companyInfo);
                utils.getUserInfo(userInfo);
                getTableData();
            })
            return {
                ...utils,
                errorPhoto,
                companyInfo,
                userInfo,
                tabConfig,
                tabFn,
                filterConfig,
                tableConfig,
                currTableColum,
                getTableData,
                pagingFn,
                selectConfig,
                selectAllFn,
                selectChangeFn,
                dialogConfig,
                dialogFn,
                transferFn,
                assignConfig,
                assignPop,
                assignConfirm,
                brokerConfig,
                borkerFn,
                wanderConfig,
                wanderFn,
                exportFn,
                markConfig,
                addMarkFn,
                deleteFn,
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
    app.mount('#ownerEntrust');
})();