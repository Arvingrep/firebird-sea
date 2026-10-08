(async function () {
    const { createApp, reactive, watch, onMounted, ref } = Vue; //1.vue引入
    const { ElMessage, genFileId } = ElementPlus;
    const app = createApp({ //2.创建
        setup() {
            let companyInfo = ref({});
            let userInfo = ref({});
            /** @description tab切换
             *  @property {tabConfig} 总参数
             *  @param {active} 当前激活的tab项
             *  @property {tabFunction} 总功能
             *  @param {change} 切换
             * 
             */
            let tabConfig = reactive({
                active: 0
            });
            let tabFunction = reactive({
                change: index => {
                    if (tabConfig.active != index) tabConfig.active = index;
                    listConfig.page = 1;
                    listConfig.pageSize = 10;
                    listConfig.pageInfo = {};
                    listConfig.list = [];
                    tabConfig.active == 0 ? getBroker() : getEnter();
                }
            });
            /** @description 筛选
             *  @property {filterConfig} 总参数
             */
            let filterConfig = reactive({
                keywords: '',
                duty: '',
                dutyOption: [
                    {
                        id: 1,
                        value: '1',
                        label: '组长'
                    },
                    {
                        id: 2,
                        value: '2',
                        label: '主管'
                    },
                    {
                        id: 3,
                        value: '3',
                        label: '驻场'
                    },
                    {
                        id: 4,
                        value: '4',
                        label: '店长'
                    }
                ],
                status: '',
                statusOption: [
                    {
                        id: 1,
                        value: '1',
                        label: '待处理'
                    },
                    {
                        id: 2,
                        value: '2',
                        label: '通过'
                    },
                    {
                        id: 3,
                        value: '3',
                        label: '驳回'
                    }
                ]
            });
            let searchFn = res => {
                tabConfig.active == 0 ? getBroker() : getEnter();
            }
            /** @description 列表
             *  @property {tableConfig} 表格配置
             *  @param {broker} 经纪人
             *  @param {enter} 入驻申请
             *  @property {listConfig} 总参数
             *  @param {page} 页码
             *  @param {pageSize} 每页数量
             *  @param {list} 列表数据
             *  @param {pageInfo} 分页信息
             *  @param {applyCount} 入驻申请数量
             *  @function [getBroker] 获取经纪人数据
             *  @function [getEnter] 获取入驻申请数据
             *  @function [pagingFn] 分页切换
             */
            let tableConfig = reactive({
                loading: true,
                broker: [
                    {
                        id: 1,
                        label: '经纪人姓名',
                        prop: 'name',
                        align: 'left',
                        width: '200px',
                        show: true,
                    },
                    {
                        id: 2,
                        label: '联系电话',
                        prop: 'phone',
                        align: 'left',
                        width: '200px',
                        show: true,
                    },
                    {
                        id: 3,
                        label: '职务',
                        prop: 'duty',
                        align: 'left',
                        width: '100px',
                        show: true,
                    },
                    {
                        id: 4,
                        label: '客户数量',
                        prop: 'customer',
                        align: 'center',
                        width: '100px',
                        show: false,
                    },
                    {
                        id: 5,
                        label: '当前跟进',
                        prop: 'customerFollowing',
                        align: 'center',
                        width: '100px',
                        show: false
                    },
                    {
                        id: 6,
                        label: '未跟进/异常',
                        prop: 'customerUnfollow',
                        align: 'center',
                        width: '100px',
                        show: false
                    },
                    {
                        id: 7,
                        label: '报备',
                        prop: 'report',
                        align: 'center',
                        width: '100px',
                        show: false
                    },
                    {
                        id: 8,
                        label: '带看',
                        prop: 'showIt',
                        align: 'center',
                        width: '100px',
                        show: false
                    },
                    {
                        id: 9,
                        label: '成交',
                        prop: 'deal',
                        align: 'center',
                        width: '100px',
                        show: false
                    },
                    {
                        id: 10,
                        label: '佣金/元',
                        prop: 'brokerage',
                        align: 'center',
                        width: '100px',
                        show: false
                    },
                    {
                        id: 11,
                        label: '状态',
                        prop: 'status',
                        align: 'center',
                        width: '100px',
                        show: true
                    },
                    {
                        id: 12,
                        label: '操作',
                        prop: 'btns',
                        align: 'left',
                        width: '300px',
                        show: true
                    },
                ],
                enter: [
                    {
                        id: 1,
                        label: '姓名',
                        prop: 'name',
                        align: 'left'
                    },
                    {
                        id: 2,
                        label: '联系电话',
                        prop: 'phone',
                        align: 'left'
                    },
                    {
                        id: 3,
                        label: '身份证',
                        prop: 'id_card',
                        align: 'left'
                    },
                    {
                        id: 4,
                        label: '执业资格认证',
                        prop: 'cert',
                        align: 'left'
                    },
                    {
                        id: 5,
                        label: '申请时间',
                        prop: 'join_time',
                        align: 'left'
                    },
                    {
                        id: 6,
                        label: '状态',
                        prop: 'join_status',
                        align: 'center'
                    },
                    {
                        id: 7,
                        label: '操作',
                        prop: 'btns',
                        align: 'left'
                    },
                ]
            })
            let listConfig = reactive({
                page: 1,
                pageSize: 10,
                list: [],
                pageInfo: {},
                applyCount: 0
            });
            let getBroker = async () => {
                tableConfig.loading = true;
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/companyUserList',
                    duty: filterConfig.duty || -1,
                    keyword: filterConfig.keywords,
                    page: listConfig.page,
                    pageSize: listConfig.pageSize
                }
                listConfig.list = [];
                let result = await request.post(data);
                tableConfig.loading = false;
                if (result.data.state == 100) {
                    let info = result.data.info;
                    listConfig.list = info.list;
                    listConfig.pageInfo = info.pageInfo;
                }
            };
            let getEnter = async initial => {
                tableConfig.loading = true;
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/companyJoinList',
                    status: filterConfig.status || 0,
                    page: listConfig.page,
                    pageSize: listConfig.pageSize
                }
                listConfig.list = [];
                let result = await request.post(data);
                tableConfig.loading = false;
                if (result.data.state == 100) {
                    let info = result.data.info;
                    if (initial) {
                        listConfig.applyCount = info.pageInfo.totalTodo || 0;
                    } else {
                        for (let i = 0; i < info.list.length; i++) {
                            let item = info.list[i];
                            item['identityArr'] = []; //身份证正反面整理图片
                            if (item.id_card.length) {
                                for (let j = 0; j < item.id_card.length; j++) {
                                    let itemc = item.id_card[j];
                                    item['identityArr'].push(itemc.url);
                                }
                            }
                            item['certArr'] = [];
                            if (item.cert.length) {
                                for (let j = 0; j < item.cert.length; j++) {
                                    let itemc = item.cert[j];
                                    item['certArr'].push(itemc.url);
                                }
                            }
                        }
                        listConfig.list = info.list;
                        listConfig.pageInfo = info.pageInfo;
                    }
                }
            }
            let pagingFn = res => {
                listConfig.page = res;
                tabConfig.active == 0 ? getBroker() : getEnter();
            }
            /** @description 添加成员 / 编辑成员
             *  @property {addMemberConfig} 总配置
             *  @param {pop} 创建/复制按钮
             *  @param {copyText} 复制内容
             *  @param {copyFn} 复制功能
             *  @property {addMemberForm} 添加成员表单
             *  @param {data} 表单内容
             *  @param {phoneVerify} 手机号验证
             *  @param {phoneCode} 手机区号
             *  @param {hasRegister} 是否已注册
             *  @param {loading} 表单提交网络请求loading状态
             *  @param {inviteLink} 邀请链接
             *  @function [phoneNumberRule] 手机号验证规则
             *  @function [phoneCodeFn] 获取手机区号配置
             *  @function [addMemberFn] 添加确认
             *  @function [getInviteFn] 获取邀请链接
             *  @function [resetAddFn] 数据重置
             *  @property {memberEditConfig} 编辑成员配置
             *  @param {edit} 是否是编辑状态
             *  @param {editItem} 编辑项信息
             *  @function [getMember] 获取经纪人信息
             *  @function [editMemberFn] 编辑确认
             */
            let addMemberConfig = reactive({
                pop: false,
                copyFn: async res => {
                    let copySuccess = true;
                    let copyText = addMemberForm.inviteLink;
                    if (window.navigator.clipboard) {
                        try {
                            await window.navigator.clipboard.writeText(copyText);
                            copySuccess = true; // 成功时手动设置为 true
                        } catch (err) {
                            copySuccess = false;
                        }
                    } else {
                        let oInput = document.createElement("input");
                        oInput.value = copyText;
                        document.body.appendChild(oInput);
                        oInput.select();
                        copySuccess = document.execCommand("Copy");
                        oInput.remove();
                    }
                    if (copySuccess) {
                        ElMessage({
                            type: 'success',
                            message: '成员邀请链接复制成功，有效期15天',
                        })
                    } else {
                        ElMessage({
                            type: 'error',
                            message: '复制失败！',
                        })
                    }
                },
            });
            let phoneNumberRule = async (rule, value, callback) => {
                if (!value) {
                    addMemberForm.phoneVerify = '请先填写手机号';
                    callback(new Error());
                    return false;
                } else if (memberEditConfig.edit) {
                    addMemberForm.phoneVerify = '';
                    callback();
                    return false;
                }
                let data = {
                    service: 'member',
                    action: 'registAccountCheck',
                    rtype: 3,
                    areaCode: addMemberForm.data.areaCode,
                    account: value
                }
                let result = await request.post(data);
                if (result.data.state != 100) {
                    if (result.data.info.includes('手机号已被注册')) {
                        addMemberForm.hasRegister = true;
                        addMemberForm.phoneVerify = '该手机号已注册，直接邀请ta加入';
                    } else {
                        addMemberForm.phoneVerify = result.data.info;
                    }
                    callback(new Error());
                } else {
                    addMemberForm.phoneVerify = '';
                    addMemberForm.hasRegister = false;
                    callback();
                }
            };
            let addMemberForm = reactive({
                data: {
                    name: '', //姓名
                    password: '', //登录密码
                    wechat: '', //微信号
                    areaCode: '', //手机区域代码
                    phone: '', //手机号
                    photo: '', //头像
                    qr: '',//微信二维码
                },
                ref: {},
                pop: false,
                rules: {
                    name: [
                        { required: true, message: '请填写姓名', trigger: 'blur' }
                    ],
                    phone: [
                        { validator: phoneNumberRule, trigger: 'blur' }
                    ]
                },
                phoneVerify: '',
                phoneCode: [],
                hasRegister: false,
                loading: false,
                inviteLink: ''
            });
            let phoneCodeFn = async res => {
                let data = {
                    service: 'siteConfig',
                    action: 'internationalPhoneSection'
                }
                let result = await request.post(data);
                if (result.data.state == 100) {
                    let info = result.data.info;
                    for (let i = 0; i < info.length; i++) {
                        let item = info[i];
                        item['label'] = `+${item.code}`;
                    }
                    addMemberForm.phoneCode = info;
                    addMemberForm.data.areaCode = info[0].code; //默认选择第一个
                }
            }
            let addMemberFn = async res => {
                let verify = await addMemberForm.ref.validate(res => { }); //表单验证
                if (addMemberForm.loading || !verify) return;
                addMemberConfig.loading = true;
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/addCompanyUser',
                    ...addMemberForm.data
                }
                let result = await request.post(data);
                addMemberForm.loading = false; //请求完成
                if (result.data.state == 100) {
                    addMemberForm.pop = false; //弹窗关闭
                    ElMessage({
                        type: 'success',
                        message: result.data.info,
                    })
                } else {
                    ElMessage({
                        type: 'error',
                        message: result.data.info,
                    })
                }
            }
            let getInviteFn = async res => {
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/createInviteLink',
                }
                let result = await request.post(data);
                if (result.data.state == 100) {
                    addMemberForm.inviteLink = result.data.info;
                    resetAddFn();
                } else {
                    ElMessage({
                        type: 'error',
                        message: result.data.info,
                    })
                }
            }
            let resetAddFn = res => {
                addMemberForm.data = {};
                memberEditConfig.edit = false;
                uploadConfig.photo.file = {};
                uploadConfig.wxCode.file = {};
            }
            let memberEditConfig = reactive({
                edit: false,
                item: {},
                popFn: res => {
                    memberEditConfig.edit = true;
                    memberEditConfig.item = res;
                    addMemberForm.pop = true;
                    getMember(res.id);
                }
            });
            let getMember = async id => {
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/getCompanyUser',
                    id: id
                }
                let result = await request.post(data);
                if (result.data.state == 100) {
                    let info = result.data.info;
                    addMemberForm.data.name = info.name;
                    addMemberForm.data.areaCode = info.areaCode;
                    addMemberForm.data.phone = info.phone;
                    addMemberForm.data.photo = info.photo;
                    uploadConfig.photo.file.turl = info.photoUrl;
                    addMemberForm.data.wechat = info.wechat;
                    addMemberForm.data.qr = info.qr;
                    uploadConfig.wxCode.file.turl = info.qrUrl;
                    memberEditConfig.item = info;
                } else {
                    ElMessage({
                        type: 'error',
                        message: result.data.info,
                    })
                }
            }
            let editMemberFn = async res => {
                let verify = await addMemberForm.ref.validate(res => { }); //表单验证
                if (addMemberForm.loading || !verify) return;
                addMemberConfig.loading = true;
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/editCompanyUser',
                    id: memberEditConfig.item.id,
                    ...JSON.parse(JSON.stringify(addMemberForm.data))
                }
                delete data.areaCode;
                let result = await request.post(data);
                addMemberForm.loading = false; //请求完成
                if (result.data.state == 100) {
                    addMemberForm.pop = false; //弹窗关闭
                    ElMessage({
                        type: 'success',
                        message: '添加成功',
                    })
                } else {
                    ElMessage({
                        type: 'error',
                        message: result.data.info,
                    })
                }
            }
            /** @description 图片上传配置
             *  @property {uploadConfig} 总配置
             *  @param {photo} 头像
             *  @param {wxCode} 微信二维码
             *  @param {file} 选择文件信息
             *  @param {loading} 上传状态
             */
            let uploadConfig = reactive({
                photo: {
                    file: {},
                    loading: false,
                    ref: {},
                    fn: async (file, files) => {
                        uploadConfig.photo.loading = true;
                        let result = await request.uploadFileFn({ Filedata: file.raw });
                        uploadConfig.photo.loading = false;
                        if (result.data.state == "SUCCESS") {
                            uploadConfig.photo.file = result.data;
                            addMemberForm.data.photo = result.data.url;
                            ElMessage.success("上传成功！"); //提示
                        } else {
                            ElMessage.error(result.data.state);
                        }
                    },
                    coverFn: files => {
                        uploadConfig.photo.ref.clearFiles(); //清除之前已选择文件
                        const file = files[0];
                        file.uid = genFileId(); //获取当前选择的文件信息
                        uploadConfig.photo.ref.handleStart(file);
                    }
                },
                wxCode: {
                    file: {},
                    loading: false,
                    ref: {},
                    fn: async (file, files) => {
                        uploadConfig.wxCode.loading = true;
                        let result = await request.uploadFileFn({ Filedata: file.raw });
                        uploadConfig.wxCode.loading = false;
                        if (result.data.state == "SUCCESS") {
                            uploadConfig.wxCode.file = result.data;
                            addMemberForm.data.qr = result.data.url;
                            ElMessage.success("上传成功！"); //提示
                        } else {
                            ElMessage.error(result.data.state);
                        }
                    },
                    coverFn: files => {
                        uploadConfig.wxCode.ref.clearFiles(); //清除之前已选择文件
                        const file = files[0];
                        file.uid = genFileId(); //获取当前选择的文件信息
                        uploadConfig.wxCode.ref.handleStart(file);
                    }
                },
            });
            /** @description 操作区
             *  @property {operateConfig} 总配置
             *  @function [switchFn] 启用/停用
            */
            let operateConfig = reactive({
                pop: false, //弹窗控制
                loading: false, //确认提交
                type: 1, // 1：停用 2：删除 3：驳回
                item: {},
                reason: '', //驳回原因
                popFn: (type, item) => {
                    operateConfig.item = item;
                    operateConfig.type = type;
                    operateConfig.pop = true;
                }, //弹窗
                switchFn: async status => {
                    if (operateConfig.loading) return;
                    operateConfig.loading = true;
                    let data = {
                        service: 'house',
                        action: 'route',
                        route: 'distributor/changeUserStatus',
                        id: operateConfig.item.id,
                        status: status
                    }
                    let result = await request.post(data);
                    operateConfig.loading = false;
                    if (result.data.state == 100) {
                        operateConfig.item.status = status; //直接修改状态
                        operateConfig.pop = false; //关闭弹窗
                        ElMessage.success(result.data.info); //文本提示
                    } else {
                        ElMessage.error(result.data.info);
                    }
                }, //停用/启用
                deleteFn: async res => {
                    if (operateConfig.loading) return;
                    operateConfig.loading = true;
                    let data = {
                        service: 'house',
                        action: 'route',
                        route: 'distributor/delCompanyUser',
                        id: operateConfig.item.id
                    }
                    let result = await request.post(data);
                    operateConfig.loading = false;
                    if (result.data.state == 100) {
                        tabConfig.active == 0 ? getBroker() : getEnter(); //刷新列表
                        operateConfig.pop = false; //关闭弹窗
                        ElMessage.success(result.data.info); //文本提示
                    } else {
                        ElMessage.error(result.data.info);
                    }
                }, //删除
                aduitFn: async status => {
                    if (operateConfig.loading) return;
                    operateConfig.loading = true;
                    let data = {
                        service: 'house',
                        action: 'route',
                        route: 'distributor/dealCompanyJoin',
                        id: operateConfig.item.id,
                        type: status,
                        reason: operateConfig.reason
                    }
                    let result = await request.post(data);
                    operateConfig.loading = false;
                    if (result.data.state == 100) {
                        operateConfig.item.join_status = status + 1; //直接修改状态
                        operateConfig.pop = false; //关闭弹窗
                        operateConfig.reason = ''; //清空原因
                        ElMessage.success(result.data.info); //文本提示
                    } else {
                        ElMessage.error(result.data.info);
                    }
                }, //通过/驳回
            });
            /** @description 驻场设置
             *  @function [setSiteFn]
            */
            let setSiteFn = async (state, id) => {
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/changeUserOnsite',
                    id: id,
                    on_site: state
                }
                let result = await request.post(data);
                if (result.data.state == 100) {
                    tabConfig.active == getBroker();
                    ElMessage.success(result.data.info);
                } else {
                    ElMessage.error(result.data.info);
                }
            };
            /** @desctiption 生命周期
            *  @function [onMounted] mounted
            */
            onMounted(res => {
                utils.getCompanyInfo(companyInfo);
                utils.getUserInfo(userInfo);
                getEnter(true);
                getBroker();
                getInviteFn();
            });
            /** @description 监听
             * @param {addMemberForm.pop} 弹窗状态
            */
            watch(() => addMemberForm.pop, async res => {
                if (!res) {
                    resetAddFn();
                } else if (addMemberForm.phoneCode.length == 0) {
                    phoneCodeFn();
                }
            });
            return {
                ...utils,
                companyInfo,
                userInfo,
                tabConfig,
                tabFunction,
                filterConfig,
                searchFn,
                tableConfig,
                listConfig,
                getBroker,
                getEnter,
                pagingFn,
                addMemberConfig,
                addMemberForm,
                addMemberFn,
                memberEditConfig,
                editMemberFn,
                uploadConfig,
                operateConfig,
                setSiteFn,
                errorPhoto,
                errorImage,
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
    app.mount('#brokerManage');
})();