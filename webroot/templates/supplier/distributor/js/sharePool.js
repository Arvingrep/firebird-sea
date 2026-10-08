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
                        id: 1, value: 0, name: '店组共享池', num: computed(res => {
                            return tableConfig.pageInfo.typeCount ? tableConfig.pageInfo.typeCount[0].num : 0
                        }), red: computed(res => {
                            return tableConfig.pageInfo.typeCount ? tableConfig.pageInfo.typeCount[0].red : 0
                        })
                    },
                    {
                        id: 2, value: 1, name: '门店共享池', num: computed(res => {
                            return tableConfig.pageInfo.typeCount ? tableConfig.pageInfo.typeCount[1].num : 0
                        }), red: computed(res => {
                            return tableConfig.pageInfo.typeCount ? tableConfig.pageInfo.typeCount[1].red : 0
                        })
                    },
                    // { id: 3, value: '', name: '区域共享池', num: 0, red: 0 },
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
                oldme: 0, //原由我维护
                order: '', //最近更新
                orderOption: [ //房源类型选项
                    {
                        label: '最近更新',
                        value: '1'
                    },
                    {
                        label: '最早更新',
                        value: '2',
                    },
                ],
                concat: '', //跟进情况
                concatOption: [ //跟进选项
                    {
                        label: '未联系',
                        value: '1'
                    },
                    {
                        label: '联系过',
                        value: '2'
                    },
                    {
                        label: '带看过',
                        value: '3'
                    }
                ],
                source: '', //房源类型
                sourceOption: [ //房源类型选项
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
                keywords: '' //关键字
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
                    group: [ //店组共享池
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
                        { //初始来源
                            id: 3,
                            label: '初始来源',
                            prop: 'origin',
                            align: 'left',
                            width: '100px'
                        },
                        { //掉客原因
                            id: 4,
                            label: '掉客原因',
                            prop: 'reason',
                            align: 'left',
                            width: '100px'
                        },
                        { //预算/意向
                            id: 5,
                            label: '预算/意向',
                            prop: 'history',
                            align: 'left',
                            width: '250px'
                        },
                        { //备注
                            id: 6,
                            label: '备注',
                            prop: 'note',
                            align: 'left',
                            width: '350px'
                        },
                        { //状态
                            id: 7,
                            label: '状态',
                            prop: 'state',
                            align: 'left',
                            width: '100px'
                        },
                        { //操作
                            id: 8,
                            label: '操作',
                            prop: 'operate',
                            align: 'left',
                            width: '200px',
                        }
                    ],
                    store: [ //门店共享池
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
                        { //初始来源
                            id: 3,
                            label: '初始来源',
                            prop: 'origin',
                            align: 'left',
                            width: '100px'
                        },
                        { //掉客原因
                            id: 4,
                            label: '掉客原因',
                            prop: 'reason',
                            align: 'left',
                            width: '100px'
                        },
                        { //预算/意向
                            id: 5,
                            label: '预算/意向',
                            prop: 'history',
                            align: 'left',
                            width: '250px'
                        },
                        { //备注
                            id: 6,
                            label: '备注',
                            prop: 'note',
                            align: 'left',
                            width: '350px'
                        },
                        { //状态
                            id: 7,
                            label: '状态',
                            prop: 'state',
                            align: 'left',
                            width: '100px'
                        },
                        { //操作
                            id: 8,
                            label: '操作',
                            prop: 'operate',
                            align: 'left',
                            width: '200px',
                        }
                    ],
                    area: [ //区域共享池
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
                            prop: '',
                            align: 'left',
                            width: '300px'
                        }
                    ],
                },
                loading: false,
            });
            let currTableColum = computed(res => {
                let returnList = [];
                switch (tabConfig.active) {
                    case 0: {
                        returnList = tableConfig.column.group;
                        break;
                    }
                    case 1: {
                        returnList = tableConfig.column.store;
                        break;
                    }
                    case 2: {
                        returnList = tableConfig.column.area;
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
                    route: 'distributor/customerSharePool',
                    share: tabConfig.list[tabConfig.active].value || '',
                    oldme: filterConfig.oldme || '',
                    keyword: filterConfig.keywords || '', //搜索
                    source: filterConfig.source || '', //房源类型
                    order: filterConfig.order || '', //最近更新
                    status: filterConfig.concat || '',
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
                        item.noteLoading = false;
                        item.notevisiable = false;
                    }
                    tableConfig.list = info.list;
                    tableConfig.pageInfo = info.pageInfo;
                    // for (let i = 0; i < info.pageInfo?.typeCount3?.length; i++) {
                    //     let item = info.pageInfo.typeCount3[i];
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
            /** 标记客户
            * @property {markConfig} 标记配置
            */
            let markConfig = reactive({
                id: '', //目标id
                type: 2, //标记类型 已联系 带看
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
            /** 导出名单
             * @function [exportFn]
             */
            let exportFn = async res => {
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/customerSharePool',
                    share: tabConfig.list[tabConfig.active].value || '',
                    oldme: filterConfig.oldme || '',
                    keyword: filterConfig.keywords || '', //搜索
                    source: filterConfig.source || '', //房源类型
                    order: filterConfig.order || '', //最近更新
                    status: filterConfig.concat || '',
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
            /** 认领
             * @function [claimFn]
             */
            let claimFn = async res => {
                markConfig.loading = true;
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/followCustomer',
                    ids: res.id
                }
                let result = await request.post(data);
                markConfig.loading = false;
                if (result.data.state == 100) {
                    res.visiable = false;
                    getTableData();
                    ElMessage.success(result.data.info);
                } else {
                    ElMessage.error(result.data.info);
                }
            }
            /** 导入
             * @property {importConfig}
             */
            let importConfig = reactive({
                temporarily: {}, //临时选择文件
                ref: {}, //上传实例
                percentage: 0, //上传进度条
                timer: null, //进度条计时器
                result: {},
                loading: false,
                readFileFn: async (file, files) => { //上传文件
                    importConfig.temporarily = file;
                    //计时器+loading 开始
                    importConfig.percentage = 0; //初始化
                    clearInterval(importConfig.timer);
                    importConfig.timer = setInterval(() => {
                        importConfig.percentage += 10;
                    }, 1000);
                    importConfig.loading = true;
                    //发起请求
                    let result = await request.uploadFileFn({ Filedata: file.raw, mod: 'siteConfig', type: 'file', filetype: 'file' });
                    //计时器+loading 结束
                    clearInterval(importConfig.timer);
                    importConfig.percentage = 100;
                    //上传结果处理
                    setTimeout(() => {
                        importConfig.loading = false;
                        if (result.data.state == "SUCCESS") {
                            importConfig.result = result.data;
                            ElMessage.success("上传成功！"); //提示
                        } else {
                            ElMessage.error(result.data.state);
                        }
                    }, 1000);
                },
                imloading: false, //导入loading
                importFn: async res => {
                    importConfig.imloading = true;
                    let data = {
                        service: 'house',
                        action: 'route',
                        route: 'distributor/importCustomer',
                        file: importConfig.result.url,
                        share: tabConfig.list[tabConfig.active].value || '0',
                    }
                    let result = await request.post(data);
                    importConfig.imloading = false;
                    if (result.data.state == 100) {
                        ElMessage.success(result.data.info); //提示
                    } else {
                        ElMessage.error(result.data.info);
                    }
                }
            })
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
                markConfig,
                addMarkFn,
                deleteFn,
                detailsConfig,
                getDetails,
                editConfirm,
                deleteNote,
                brokerConfig,
                borkerFn,
                wanderConfig,
                wanderFn,
                assignConfig,
                assignPop,
                assignConfirm,
                exportFn,
                claimFn,
                importConfig
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
    app.mount('#sharePool');
})();