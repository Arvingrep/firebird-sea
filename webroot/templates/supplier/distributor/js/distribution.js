(async function () {
    const { createApp, reactive, ref, onMounted } = Vue; //1.vue引入
    const { ElMessage, genFileId } = ElementPlus;
    const app = createApp({ //2.创建
        setup() {
            /** @description tab切换
             *  @property {tabConfig} 总参数
            */
            let tabConfig = reactive({
                list: [ //列表
                    { //全部报备
                        id: 1,
                        value: 0,
                        title: '全部报备',
                        num: 0,
                        red: 0
                    },
                    { //待审核
                        id: 2,
                        value: 1,
                        title: '待审核',
                        num: 0,
                        red: 0
                    },
                    { //未带看
                        id: 3,
                        value: 2,
                        title: '未带看',
                        num: 0,
                        red: 0
                    },
                    { //带看核实
                        id: 4,
                        value: 3,
                        title: '带看核实',
                        num: 0,
                        red: 0
                    },
                    { //待成交
                        id: 5,
                        value: 4,
                        title: '待成交',
                        num: 0,
                        red: 0
                    },
                    { //成交待审核
                        id: 6,
                        value: 5,
                        title: '成交待审核',
                        num: 0,
                        red: 0
                    },
                    { //已成交
                        id: 7,
                        value: 6,
                        title: '已成交',
                        num: 0,
                        red: 0
                    },
                    { //已失效
                        id: 8,
                        value: 7,
                        title: '已失效',
                        num: 0,
                        red: 0
                    },
                ],
                active: 0, //选中项
            });
            let tabFn = async index => {
                tabConfig.page = 1;
                tabConfig.active = index;
                await getTableData();
            }
            /** @description 列表筛选
             *  @property {filterConfig} 总配置
             */
            let filterConfig = reactive({
                report: { //报备排序
                    options: [
                        { //最新报备
                            id: 1,
                            value: 0,
                            name: '最新报备',
                            show: [0, 1, 2, 3, 4, 5]
                        },
                        { //最早报备
                            id: 2,
                            value: 1,
                            name: '最早报备',
                            show: [0, 1, 2, 3, 4, 5]
                        },
                        { //即将失效
                            id: 3,
                            value: 2,
                            name: '即将失效',
                            show: [0, 2]
                        },
                        { //按带看时间
                            id: 4,
                            value: 3,
                            name: '按带看时间',
                            show: [2]
                        },
                        { //按报备时间
                            id: 5,
                            value: 0,
                            name: '按报备时间',
                            show: [6, 7]
                        },
                        { //按失效时间
                            id: 6,
                            value: 6,
                            name: '按失效时间',
                            show: [7]
                        },
                        { //最近提交
                            id: 7,
                            value: 7,
                            name: '最近提交',
                            show: [3, 5]
                        },
                        { //按截止时间
                            id: 8,
                            value: 4,
                            name: '按截止时间',
                            show: [4]
                        },
                        { //按成交时间
                            id: 9,
                            value: 5,
                            name: '按成交时间',
                            show: [6]
                        }
                    ],
                    value: 0
                },
                keywords: '', //搜索关键字
            });
            /** @description 表格
             *  @property {tableConfig} 表格配置
             */
            let tableConfig = reactive({
                column: [
                    { //客户
                        id: 1,
                        label: '客户',
                        prop: 'cname',
                        align: 'left',
                        show: [0, 1, 2, 3, 4, 5, 6, 7] //哪些需要显示
                    },
                    { //联系方式
                        id: 2,
                        label: '联系方式',
                        prop: 'phone',
                        align: 'left',
                        show: [0, 1, 2, 3, 4, 5, 6, 7] //哪些需要显示
                    },
                    { //预计带看
                        id: 3,
                        label: '预计带看',
                        icon: `${templets_skin}/images/question.png`,
                        content: '报备等待期结束后才可带看，提前到访、超时未带看均视为报备无效',
                        prop: 'expect_visit_time',
                        align: 'left',
                        show: [2] //哪些需要显示
                    },
                    { //最迟带看
                        id: 4,
                        label: '最迟带看',
                        prop: 'invalid_time',
                        align: 'left',
                        show: [2] //哪些需要显示
                    },
                    { //楼盘
                        id: 5,
                        label: '楼盘',
                        prop: 'build_name',
                        align: 'left',
                        show: [0, 1, 2, 3, 4, 5, 6, 7] //哪些需要显示
                    },
                    { //备注
                        id: 6,
                        label: '备注',
                        prop: 'mark',
                        align: 'left',
                        show: [0, 1, 2, 3, 4, 5, 6] //哪些需要显示
                    },
                    { //带看凭证
                        id: 7,
                        label: '带看凭证',
                        prop: 'visitCert',
                        align: 'left',
                        show: [0, 3, 4, 6] //哪些需要显示
                    },
                    { //成交凭证
                        id: 8,
                        label: '成交凭证',
                        prop: 'dealCert',
                        align: 'left',
                        show: [5] //哪些需要显示
                    },
                    { //报备人
                        id: 9,
                        label: '报备人',
                        prop: 'name',
                        align: 'left',
                        show: [0, 1, 2, 3, 4, 5, 6, 7] //哪些需要显示
                    },
                    { //报备时间
                        id: 10,
                        label: '报备时间',
                        prop: 'report_time',
                        align: 'left',
                        show: [0, 1, 2, 3, 5, 6, 7] //哪些需要显示
                    },
                    { //有效成交截止(带看保护)
                        id: 11,
                        label: '有效成交截止(带看保护)',
                        icon: `${templets_skin}/images/question.png`,
                        content: '有效期内为客户保护期，在此期间成交，记为分销成功，超期将解除报备关系，不可再分佣',
                        prop: 'deal_end_time',
                        align: 'left',
                        show: [4] //哪些需要显示
                    },
                    { //失效原因
                        id: 12,
                        label: '失效原因',
                        prop: 'invalid_type',
                        align: 'left',
                        show: [7] //哪些需要显示
                    },
                    { //状态
                        id: 13,
                        label: '状态',
                        prop: 'status',
                        align: 'left',
                        show: [0, 1, 3, 5, 6, 7] //哪些需要显示
                    },
                    { //操作
                        id: 14,
                        label: '操作',
                        prop: 'operate',
                        align: 'left',
                        show: [4] //哪些需要显示
                    },
                ], //表格列
                list: [], //列表
                page: 1, //当前页
                pageSize: 10, //每页条数
                pageInfo: {}, //分页信息
                loading: false //加载状态
            });
            let getTableData = async res => {
                tableConfig.loading = true;
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/reportList',
                    type: tabConfig.list[tabConfig.active].value,
                    sort: filterConfig.report.value,
                    keyword: filterConfig.keywords,
                    page: tableConfig.page,
                    pageSize: tableConfig.pageSize
                }
                let result = await request.post(data);
                tableConfig.loading = false;
                if (result.data.state == 100) {
                    let info = result.data.info;
                    for (let i = 0; i < info.pageInfo.typeCount.length; i++) {
                        let item = info.pageInfo.typeCount[i];
                        tabConfig.list[i].num = item.num;
                        tabConfig.list[i].red = item.red;
                    }
                    //成交凭证/带看凭证
                    for (let i = 0; i < info.list.length; i++) {
                        let item = info.list[i];
                        item['visitCertStr'] = item.visitCert.imageUrl || [];
                        item['dealCertStr'] = item.dealCert.receipt_url || [];
                    }
                    tableConfig.list = info.list;
                    tableConfig.pageInfo = info.pageInfo;
                } else {
                    tableConfig.list = [];
                }
            }
            let pagingFn = async res => {
                tableConfig.page = res;
                getTableData();
            }
            /** 更新成交信息
             * @property {updateConfig} 更新成交信息
             */
            let updateConfig = reactive({
                pop: false,
                item: {},
                form: {
                    build: '', //x栋
                    cell: '', //x单元
                    number: '', //x号
                    purchase: '', //购房成交金额
                    contract: '', //合同或者购房协议
                    receipt: '', //收据
                },
                rules: {
                    purchase: [
                        { required: true, message: '请填写成交金额', trigger: 'blur' }
                    ],
                    contract: [{ required: true, message: '请上传协议书/合同' }],
                    receipt: [{ required: true, message: '请上传收款收据' }],
                },
                radio: 1,
            });
            let updateFn = async res => {
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/updateDealInfo',
                    id: '',
                    house: `${updateConfig.item.build_name}${updateConfig.item.cell}${updateConfig.item.number}}`,
                    purchase: updateConfig.form.purchase,
                    contract: `${uploadConfig.file.url}$$${uploadConfig.file.url}`,
                    receipt: updateConfig.form.receipt
                }
                let result = await request.post(data);
                if (result.data.state == 100) {
                    ElMessage.success("更新成功！"); //提示
                    updateConfig.pop = false;
                    getTableData();
                } else {
                    ElMessage.error(result.data.info);
                }
            }
            /** 上传图片
             * @property {uploadConfig} 上传配置
             */
            let uploadConfig = reactive({
                subscribe: { //认购证明 
                    file: {},
                    loading: false,
                    ref: {},
                    fn: async (file, files) => {
                        uploadConfig.subscribe.loading = true;
                        let result = await request.uploadFileFn({ Filedata: file.raw });
                        uploadConfig.subscribe.loading = false;
                        if (result.data.state == "SUCCESS") {
                            uploadConfig.subscribe.file = result.data;
                            ElMessage.success("上传成功！"); //提示
                        } else {
                            ElMessage.error(result.data.state);
                        }
                    },
                    coverFn: files => {
                        uploadConfig.subscribe.ref.clearFiles(); //清除之前已选择文件
                        const file = files[0];
                        file.uid = genFileId(); //获取当前选择的文件信息
                        uploadConfig.subscribe.ref.handleStart(file);
                    }
                },
                receive: { //收款收据
                    file: {},
                    loading: false,
                    ref: {},
                    fn: async (file, files) => {
                        uploadConfig.receive.loading = true;
                        let result = await request.uploadFileFn({ Filedata: file.raw });
                        uploadConfig.receive.loading = false;
                        if (result.data.state == "SUCCESS") {
                            uploadConfig.receive.file = result.data;
                            ElMessage.success("上传成功！"); //提示
                        } else {
                            ElMessage.error(result.data.state);
                        }
                    },
                    coverFn: files => {
                        uploadConfig.receive.ref.clearFiles(); //清除之前已选择文件
                        const file = files[0];
                        file.uid = genFileId(); //获取当前选择的文件信息
                        uploadConfig.receive.ref.handleStart(file);
                    }
                },
            });
            /** 详情信息
             * @property {detailConfig} 总配置
             */
            let detailConfig = reactive({
                type: 1, //1 成交 2 失效 3 驳回 4 其他
                pop: false,
                loading: false,
                data: {}
            });
            let detailPop = (show, datas) => {
                detailConfig.type = datas.invalid_type > 0 ? 2 : datas.status == 6 || datas.status == 7 ? 1 : (datas.status == 5 || datas.status == 3) && datas.verify_status == 3 ? 3 : 4;
                detailConfig.pop = show;
                detailLog(datas.id);
            }
            let detailLog = async id => {
                if (detailConfig.loading) return false;
                detailConfig.loading = true;
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/reportDetail',
                    id: id,
                }
                let result = await request.post(data);
                detailConfig.loading = false;
                if (result.data.state == 100) {
                    detailConfig.data = result.data.info;
                } else {
                    ElMessage.error(result.data.info);
                }
            }
            /** @description 生命周期 */
            let companyInfo = ref({});
            let userInfo = ref({});
            onMounted(res => {
                utils.getCompanyInfo(companyInfo);
                utils.getUserInfo(userInfo);
                getTableData();
            })
            return {
                errorPhoto,
                ...utils,
                companyInfo,
                userInfo,
                tabConfig,
                tabFn,
                filterConfig,
                tableConfig,
                getTableData,
                pagingFn,
                updateConfig,
                updateFn,
                uploadConfig,
                detailConfig,
                detailPop
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
    app.mount('#distribution');
})();