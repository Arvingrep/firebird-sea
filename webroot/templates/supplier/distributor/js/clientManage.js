(async function () {
    const { createApp, reactive, computed, onMounted, ref } = Vue; //1.vue引入
    const { ElMessage, ElMessageBox } = ElementPlus;
    const app = createApp({ //2.创建
        setup() {
            let identity = Number(localStorage.getItem('house_identity')); //0:管理者，1:经纪人
            let clueTip = ref(true);
            /** tab切换
             *  @param {tabConfig} 总参数
            */
            let tabConfig = reactive({
                list: [
                    { id: 1, value: 1, name: '在线约看', num: 0, red: 0 },
                    { id: 2, value: 2, name: '400', num: 0, red: 0 },
                    { id: 3, value: 3, name: 'IM线索', num: 0, red: 0 },
                    { id: 4, value: 4, name: '客户轨迹', num: 0, red: 0 },
                    // { id: 5, value: '', name: '抢客', num: 0, red: 0 },
                    // { id: 6, value: '', name: '分配', num: 0, red: 0 },
                ],
                active: 0
            });
            let tabFn = index => {
                tabConfig.active = index;
                getTableData();
            }
            /** 筛选
             *  @property {filterConfig} 总参数
             */
            let filterConfig = reactive({
                invalid: false, //无效信息过滤
                type: '', //房源类型
                typeOption: [ //房源类型选项
                    {
                        label: '全部',
                        value: '0'
                    },
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
                        value: '7'
                    },
                    {
                        label: '车位',
                        value: '8',
                    },
                    {
                        label: '土地',
                        value: '9',
                    }
                ],
                follow: '', //跟进情况
                followOption: [ //跟进选项
                    [
                        {
                            label: '全部',
                            value: '0'
                        },
                        {
                            label: '已联系，带看房',
                            value: '1'
                        },
                        {
                            label: '已看房',
                            value: '2'
                        },
                        {
                            label: '预约无效',
                            value: '3'
                        },
                    ],
                    [
                        {
                            label: '全部',
                            value: '0'
                        },
                        {
                            label: '已联系',
                            value: '1'
                        },
                        {
                            label: '已委托',
                            value: '2'
                        },
                        {
                            label: '无效客户',
                            value: '3'
                        }
                    ],
                    [
                        {
                            label: '全部',
                            value: '0'
                        },
                        {
                            label: '已联系',
                            value: '1'
                        },
                        {
                            label: '未联系',
                            value: '2'
                        },
                        {
                            label: '无效客户',
                            value: '3'
                        }
                    ],
                    [
                        {
                            label: '全部',
                            value: '0'
                        },
                        {
                            label: '已联系',
                            value: '1'
                        },
                        {
                            label: '未联系',
                            value: '2'
                        },
                        {
                            label: '无效客户',
                            value: '3'
                        }
                    ],
                ],
                subscribe: '',//预约时间
                subscribeOption: [ //预约时间选项
                    {
                        label: '按提交时间',
                        value: '1'
                    },
                    {
                        label: '预约时间',
                        value: '2'
                    },
                    {
                        label: '未确定时间',
                        value: '3'
                    }
                ],
                keywords: '', //关键字
                recordRef: {} //录客的popover实例
            });
            /** 表单
             *  @property {tableConfig} 总参数
             *  @property {currTableColum} 当前表格列配置
             *  @function [getTableData] 获取列表
             */
            let tableConfig = reactive({
                list: [], //列表数据
                page: 1, //页码
                pageSize: 10, //每页数量
                pageInfo: {}, //分页信息
                total: 0,
                column: { //列配置
                    online: [ //在线约看
                        { //预约时间
                            id: 1,
                            label: '预约时间',
                            prop: 'subscribe',
                            align: 'left',
                            width: '180px'
                        },
                        { //预约房源
                            id: 2,
                            label: '预约房源',
                            prop: 'history',
                            align: 'left',
                            width: '400px'
                        },
                        { //客户
                            id: 3,
                            label: '客户',
                            prop: 'client',
                            align: 'left',
                            width: '150px'
                        },
                        { //提交时间
                            id: 4,
                            label: '提交时间',
                            prop: 'time',
                            align: 'left',
                            width: '200px'
                        },
                        { //状态
                            id: 5,
                            label: '状态',
                            prop: 'state',
                            align: 'left',
                            width: '100px'
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
                    ],
                    four: [ //400
                        { //客户
                            id: 1,
                            label: '客户',
                            prop: 'client',
                            align: 'left',
                            width: '100px'
                        },
                        { //联系电话
                            id: 2,
                            label: '联系电话',
                            prop: 'phone',
                            align: 'left',
                            width: '150px'
                        },
                        { //来电来源
                            id: 3,
                            label: '来电来源',
                            prop: 'history',
                            align: 'left',
                            width: '300px'
                        },
                        // { //来电信息
                        //     id: 4,
                        //     label: '来电信息',
                        //     prop: 'info',
                        //     align: 'left',
                        //     width: '150px'
                        // },
                        { //备注
                            id: 5,
                            label: '备注',
                            prop: 'note',
                            align: 'left',
                            width: '400px'
                        },
                        { //状态
                            id: 6,
                            label: '状态',
                            prop: 'state',
                            align: 'left',
                            width: '100px'
                        },
                        { //跟进人
                            id: 7,
                            label: '跟进人',
                            prop: 'follow',
                            align: 'left',
                            width: '100px'
                        },
                        { //操作
                            id: 8,
                            label: '操作',
                            prop: 'operate',
                            align: 'left',
                            width: '300px'
                        }
                    ],
                    clue: [ //线索
                        { //用户名
                            id: 1,
                            label: '用户名',
                            prop: 'username',
                            align: 'left',
                            width: '180px'
                        },
                        { //客户
                            id: 2,
                            label: '客户',
                            prop: 'client',
                            align: 'left',
                            width: '100px'
                        },
                        { //咨询房源
                            id: 2,
                            label: '咨询房源',
                            prop: 'history',
                            align: 'left',
                            width: '400px'
                        },
                        { //最后联系
                            id: 3,
                            label: '最后联系',
                            prop: 'time',
                            align: 'left',
                            width: '200px'
                        },
                        { //状态
                            id: 4,
                            label: '状态',
                            prop: 'state',
                            align: 'center',
                            width: '100px'
                        },
                        { //操作
                            id: 8,
                            label: '操作',
                            prop: 'operate',
                            align: 'left',
                            width: '300px'
                        }
                    ],
                    track: [ //客户轨迹
                        { //用户名
                            id: 1,
                            label: '用户名',
                            prop: 'username',
                            align: 'left',
                            width: '150px'
                        },
                        { //客户
                            id: 2,
                            label: '客户',
                            prop: 'client',
                            align: 'left',
                            width: '80px'
                        },
                        { //用户轨迹
                            id: 3,
                            label: '用户轨迹',
                            prop: 'history',
                            align: 'left',
                            width: '200px'
                        },
                        { //访问次数
                            id: 4,
                            label: '访问次数',
                            prop: 'times',
                            align: 'center',
                            width: '80px'
                        },
                        { //最后访问
                            id: 5,
                            label: '最后访问',
                            prop: 'time',
                            align: 'left',
                            width: '150px'
                        },
                        { //备注
                            id: 6,
                            label: '备注',
                            prop: 'note',
                            align: 'left',
                            width: '300px'
                        },
                        { //状态
                            id: 7,
                            label: '状态',
                            prop: 'state',
                            align: 'left',
                            width: '100px'
                        },
                        { //跟进人
                            id: 8,
                            label: '跟进人',
                            prop: 'follow',
                            align: 'left',
                            width: '150px'
                        },
                        { //操作
                            id: 9,
                            label: '操作',
                            prop: 'operate',
                            align: 'left',
                            width: '300px'
                        }
                    ]
                },
                loading: false,
            });
            let currTableColum = computed(res => {
                let returnList = [];
                switch (tabConfig.active) {
                    case 0: {
                        returnList = tableConfig.column.online;
                        break;
                    }
                    case 1: {
                        returnList = tableConfig.column.four;
                        break;
                    }
                    case 2: {
                        returnList = tableConfig.column.clue;
                        break;
                    }
                    case 3: {
                        returnList = tableConfig.column.track;
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
                    route: 'distributor/customerManage',
                    type: tabConfig.list[tabConfig.active].value, //客户类型
                    keyword: filterConfig.keywords || '', //搜索
                    concat: filterConfig.follow || '', //跟进
                    source: filterConfig.type || '', //房源类型
                    order: filterConfig.subscribe || '', //预约时间
                    invalid: filterConfig.invalid ? 1 : 0,
                    identity: Number(!identity),
                    page: tableConfig.page,
                    pageSize: tableConfig.pageSize,
                }
                let result = await request.post(data);
                tableConfig.loading = false;
                if (result.data.state == 100) {
                    let info = result.data.info;
                    for (let i = 0; i < info.list.length; i++) {
                        let item = info.list[i];
                        item.visiable = false;
                        item.noteLoading = false;
                        item.notevisiable = false;
                    }
                    tableConfig.list = info.list;
                    tableConfig.pageInfo = info.pageInfo;
                    for (let i = 0; i < info.pageInfo.typeCount.slice(0,4).length; i++) {
                        let item = info.pageInfo.typeCount[i];
                        tabConfig.list[i] = { ...tabConfig.list[i], ...item };
                    }
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
             * @property {dialogConfig}
             * @function [dialogFn] 二次弹窗提示
             * @function [transferFn] 转店租/门店
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
                } else {
                    // 默认选中跟进人
                    for (let i = 0; i < brokerConfig.list.length; i++) {
                        let item = brokerConfig.list[i];
                        if (item.uid == assignConfig.item.follow_uid) {
                            brokerConfig.id = item.id;
                            return false
                        }
                    }
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
                    brokerConfig.id = '';
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
                    // 默认选中跟进人
                    for (let i = 0; i < info.list.length; i++) {
                        let item = info.list[i];
                        if (item.uid == assignConfig.item.follow_uid) {
                            brokerConfig.id = item.id;
                            return false
                        }
                    }
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
                    route: 'distributor/customerManage',
                    type: tabConfig.list[tabConfig.active].value, //客户类型
                    keyword: filterConfig.keywords || '', //搜索
                    concat: filterConfig.follow || '', //跟进
                    source: filterConfig.type || '', //房源类型
                    order: filterConfig.subscribe || '', //预约时间
                    invalid: filterConfig.invalid ? 1 : 0,
                    export: 1,
                    identity: Number(!identity),
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
            /** 预约时间编辑
             *  @property {subscribeValue} 预约时间
             *  @function [subscribeFn] 修改预约时间
             *  @function [subscribeDate] 日期选择限制
             *  @function [subscribeHours] 小时选择限制
             *  @function [subscribeMinutes] 分钟选择限制
             */
            let subscribeValue = ref('');
            let subscribeDate = value => { //日期选择限制
                let time = new Date(value);
                let nowDate = +new Date();
                return !(nowDate - 86400000 < time && time < (nowDate + 29 * 86400000));
            }
            let subscribeHours = () => {
                const now = new Date();
                // 禁用今天之前的日期的所有时间
                const hours = []
                for (let i = 0; i < now.getHours(); i++) {
                    hours.push(i)
                }
                return hours
            }
            let subscribeMinutes = () => {
                // 只允许选择 0, 5, 10, ..., 55 分钟
                const stepDisabled = []
                for (let i = 0; i < 60; i++) {
                    if (i % 5 !== 0) {
                        stepDisabled.push(i)
                    }
                }
                return stepDisabled
            }
            let subscribeFn = async (value, id) => {
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/editMarkTime',
                    id: id,
                    markdate: subscribeValue.value
                }
                let result = await request.post(data);
                if (result.data.state == 100) {
                    ElMessage.success(result.data.info);
                    getTableData();
                } else {
                    ElMessage.error(result.data.info);
                }
            }
            /** 获取详情
             * @property {detailsConfig}
             * @function [getDeails] 获取详情
             * @function [editConfirm] 编辑确定
             * @function [deleteNote] 备注删除
             */
            let detailsConfig = reactive({
                data: [], //备注列表
                note: '',
                item: {}, //编辑项
                editMode: false,
                editLoading: false, //编辑loading
            });
            let getDetails = async targetItem => {
                if (targetItem.noteLoading) return false;
                targetItem.noteLoading = true;
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/customerDetail',
                    id: targetItem.id
                }
                let result = await request.post(data);
                targetItem.noteLoading = false;
                if (result.data.state == 100) {
                    let info = result.data.info;
                    for (let i = 0; i < info.marks.length; i++) {
                        let item = info.marks[i];
                        item['visible'] = false;
                    }
                    detailsConfig.data = result.data.info.marks;
                }
            }
            let editConfirm = async () => {
                detailsConfig.editLoading = true;
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/markCustomer',
                    id: detailsConfig.item.id,
                    mark: detailsConfig.note
                }
                let result = await request.post(data);
                detailsConfig.editLoading = false;
                if (result.data.state == 100) {
                    detailsConfig.editMode = false;
                    detailsConfig.note = '';
                    getTableData();
                    ElMessage.success(result.data.info);
                } else {
                    ElMessage.error(result.data.info);
                }
            }
            let deleteNote = async (id, targetItem) => {
                ElMessageBox({
                    title: '提示',
                    message: '是否删除该条评论',
                    showCancelButton: true,
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }).then(async () => {
                    let data = {
                        service: 'house',
                        action: 'route',
                        route: 'distributor/delCustomerMark',
                        id: id
                    }
                    let result = await request.post(data);
                    if (result.data.state == 100) {
                        getDetails(targetItem);
                        ElMessage.success(result.data.info);
                    } else {
                        ElMessage.error(result.data.info);
                    }
                }).catch(() => { });
            }
            /** 生命周期 */
            let companyInfo = ref({});
            let userInfo = ref({});
            onMounted(res => {
                utils.getUserInfo(userInfo);
                utils.getCompanyInfo(companyInfo);
                getTableData();
            })
            return {
                ...utils,
                clueTip,
                pageType: params.get('type'),
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
                exportFn,
                markConfig,
                addMarkFn,
                deleteFn,
                subscribeValue,
                subscribeDate,
                subscribeHours,
                subscribeMinutes,
                subscribeFn,
                detailsConfig,
                getDetails,
                editConfirm,
                deleteNote
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
    app.mount('#clientManage');
})();