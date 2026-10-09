var showAlertErrTimer;
var checkPayResultDirect = null;
var swiper;
var resumePage = new Vue({
    el: '#resumePage',
    data: {
        pageShow: 1, //当前显示的页面  1表示列表  2表示创建
        createResumeStep: 1, //创建简历的步骤
        currStep: 0, //当前所在的步骤， 跳转之后作用
        stepArr: ['基本信息', '工作经历', '教育信息', '生成简历'],
        editInfoObj: {
            edit: false, //是否处于编辑状态
            editType: 1, //编辑的哪个模块, 1是基本信息  2是意向职位  3是工作经历  4是教育背景  5是语言技能  6是个人优势
            editInd: 0, //数组编辑的ind
            editArr: [], //数组编辑的数组
            editKey: '', //数组编辑的， 只在技能/语言中用
            editTip: false,//切换编辑提示
        },
        bindchange: false,
        exitWarnb: false,// 离开页面的确认提示
        // 剩余免费刷新次数
        refreshFree: 0,
        // 创建简历的提交的信息
        userphone: phone, //用户的手机号
        form: {
            id: 0,
            alias: '', //简历名称
            photo: '',   //头像/照片路径的值
            name: '', //姓名
            birth: '', //出生年月
            phone: phone ? phone : '', //手机号
            identify: '', //身份
            work_jy: '', //工作经验
            job: '', //职位id
            job_name: '',  //职位分类名称
            type: '', //行业
            type_name: '',
            workState: '', //求职状态
            min_salary: '', //最低薪资
            max_salary: '', //最高薪资
            startWork: '', //到岗时间
            addr: '', //工作地点
            addr_list: [],
            addr_list_Name: [],
            sex: 1, //性别
            photo_url: '', //头像/照片路径
            advantage: '', //个人优势
            email: '', //邮箱
            wechat: '', //微信号
            nature: 1, //工作性质
        },

        // 工作经历  提交的信息
        textCount: 0, //工作内容的计数
        workjl: {
            company: '', //公司名称
            work_start: '', //入职时间
            work_end: '', //离职时间
            content: '', //工作内容
            job: '', //担任职位
            jobid: [], //担任职位id
            department: '', //部门
        },

        // 教育经历  提交的信息
        educationJl: {
            // xl: '', //学历
            xl_id: '', //学历
            start: '', //入学时间
            end: '', //毕业时间
            zy: '', //专业
            school: '', //学校
        },
        educationJlArr: [{
            // xl: '', //学历
            xl_id: '', //学历id
            start: '', //入学时间
            end: '', //毕业时间
            zy: '', //专业
            school: '', //学校
        }], //学历数组
        identifyArr: [
            { id: 1, title: '职场人士' },
            { id: 2, title: '学生' },
        ], //身份

        languageArr: ['英语', '汉语', '日语', '韩语', '法语', '德语', '俄语', '西班牙语', '阿拉伯语', '意大利语', '瑞典语', '泰国语', '波兰语', '荷兰语', '捷克语', '拉丁语', '挪威语', '世界语'],
        levelArr: ['一般', '良好', '熟练', '优秀'],
        skillObj: {
            type: 0, //类型 0 => 语言  1 => 技能
            lang: '', //语种
            level_speak: '', //听说
            level_read: '', //读写
            time: '', //证书获取时间
            certificate: '', //证书类型
            cer_fullName: '', //证书
        },
        certificateArr: ['计算机证书', '注册会计师(CPA)', '注册消防工程师', 'CAD证书', '注册金融分析师(CFA)', '注册安全工程师', '中小学教师资格证', '特许公认会计师(ACCA)', '造价工程师', '国际双语教师资格证', '人力资源管理师', '注册建造师', '秘书资格证', 'PMP项目资源管理证', '注册建筑师', '律师资格证',],
        levelPop: false, //显示听说读写弹窗
        options: [], //地点列表选项
        // 区域选择配置
        props: {
            lazy: true,
            value: 'id',
            label: 'typename',
            lazyLoad(node, resolve) {
                // const { level } = node;
                var url = "/include/ajax.php?service=siteConfig&action=area&type=" + (node && node.data ? node.data.id : '');
                var tt = this;
                $.ajax({
                    url: url,
                    type: "POST",
                    dataType: "json",
                    success: function (data) {
                        if (data.state == 100) {
                            var array = data.info.map(function (item) {
                                var leaf = item.lower ? '' : 'leaf:true';
                                return {
                                    id: Number(item.id),
                                    typename: item.typename,
                                    lower: item.lower,
                                    leaf,
                                }
                            });
                            if (node.data) {
                                array.unshift({
                                    id: -1,
                                    typename: '不限',
                                    lower: 0,
                                    leaf: true,
                                });
                            }
                            resolve(array);
                        }
                    }
                });
            },
        },

        // 日期选择配置项
        pickerOptions: {
            disabledDate: (time) => {
                let nowyear = +new Date(new Date().setMonth(0, 1)) //今年年份
                let gaptime = 2592000000 * 11 + nowyear - (+new Date); //今年年份+1减去现在的时间再减去一个月，就是今年还剩下几个月
                let maxtime = (+new Date() - 31536000000 * 16 + gaptime); //16岁
                let mintime = (+new Date() - 31536000000 * 70) //65岁
                return maxtime < time || time < mintime
            }
        },
        pickerOptionswork: {
            disabledDate: (time) => {
                let nowDate = (+new Date);
                return nowDate < time;
            }
        },
        // 工作求职状态
        workStateGroup: [[{ id: 1, title: '离职，正在找工作' }], [{ id: 2, title: '在职，正在找工作' }, { id: 3, title: '在职，看看新机会' }, { id: 4, title: '在职，暂不找工作' },], [{ id: 5, title: '应届毕业生' }, { id: 6, title: '在校生' }],],

        baseConfig: '', //后台配置项

        uploadAction: '/include/upload.inc.php?mod=job&filetype=image&type=photo', //图片上传地址

        currResume: '', // 当前的简历
        defaultResume: '', //默认简历
        resumeList: [], //简历列表
        dataGeetest: '', //极验
        areaCodeArr: [], //国际区号
        showAreaCodePop: false,// 显示选择框
        phoneChange: false, //显示修改手机号弹窗
        vercode: '', //验证码
        areaCode: 86, //手机区号
        phone: '',//手机号

        selfLabShow: false, //自定义标签 ====> 其他选项
        selfLab: '', //自定义的标签

        // 职位相关
        singleChose: false, //是否单选
        postCategoryPop: false, //职位弹窗控制
        categoryList: [],
        currCategory: '', //当前所在分类,
        categoryShow: 0, //0全显示，1单类显示
        currChosePost: [], //当前选择的职位 ---> id
        currChosePostText: [], //当前选择的职位 ---> 文字

        // 行业相关
        industryCategoryPop: false, //行业弹窗控制
        categoryList_industry: [],
        currIndustry: '', //当前所在分类
        categoryShow_industry: 0, //0全显示，1单类显示
        currChoseIndustry: [], //当前选择的行业 ---> id
        currChoseIndustryText: [], //当前选择的行业 ---> 文字


        suggestionPop: false, //证书推荐弹出层
        // createResumeForm: [], //创建简历的数据

        resumeSetPop: false, //简历设置弹窗
        resumeSetType: 'createResume', //alias 简历名称修改     private 公开简历     createResume 创建简历
        setForm: {
            alias: '',
            private: 0, //公开
        },
        popConfirm: {
            show: false, //显示
            title: '', //标题
            tip: '',
            width: 0,
            height: 0,
            cls: '',
            btns: [

            ],
            closeFn: function () { }
        },

        copyOptions: [{ tit: '基本信息', id: 'info' }, { tit: '求职意向', id: 'job' }, { tit: '工作经历', id: 'work' }, { tit: '教育背景', id: 'education' }, { tit: '技能/语言', id: 'skill' }, { tit: '个人优势', id: 'advance' },],
        copyInfoArr: ['info'],

        // 简历升级 -- 刷新/置顶
        resumeUpDatePop: false, //升级简历的弹窗
        resumeTabOn: 1,
        refresh_tc: [], //刷新套餐
        top_tc: [], //置顶套餐
        delivery_tc: [], //投递套餐
        currTcIndex: 0, //当前选择的套餐
        payload: false,
        payForm: {
            paySrc: '', //支付二维码
            payCount: 10, //支付金额
        }, //支付相关信息

        payObj: '', //调起支付窗口
        payCodeSupport: (alipay === '1' || wxpay === '1'), //是否支持二维码

        successPop: {
            show: false,
            title: '',
            tip: '',
        },
        salaryArr: [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 21000, 22000, 23000, 24000, 25000, 26000, 27000, 28000, 29000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000], //薪资配置
        ajaxb: false, //请求限制
        nextb: false,
        countText: 0,
        emptyIndex: 0,//未填项下标
    },
    created() {
        const tt = this;
        tt.getPhoneCodeArr();
        tt.getPackageList()

    },
    mounted() {
        const tt = this;
        tt.getResumeList(); // 获取简历列表
        tt.getBaseConfig(); //获取后台相关配置
        tt.getCategoryList(); //获取职位分类
        tt.getIndustryList(); //获取行业分类
        // 极验相关
        if (geetest) {
            tt.$nextTick(() => {
                captchaVerifyFun.initCaptcha('web','#codeButton',tt.sendVerCode)
            })
        }
        window.onbeforeunload = function () {
            if (tt.exitWarnb || editInfoObj.edit) {
                return '如直接离开页面，将放弃修改内容'
            }
        };
        // tt.popConfirm.title = '确定将简历2设置成默认投递简历'
        // tt.popConfirm.tip = '投递职位时将自动使用默认简历，不再向您确认'
        // tt.popConfirm.btns = [{
        //     text:'取消',
        //     bgColor:'#F2F2F2',
        //     type:'cancel',
        //     fn:function(){
        //         console.log(1111)
        //     }
        // },{
        //     text:'确定',
        //     type:'sure',
        //     bgColor:'#3377FF',
        //     fn:function(){
        //         console.log(1111)
        //     }
        // }]
        $('.jobSideBar ul').delegate('li', 'click', function () {
            if (((tt.resumeList[0].education.length == 0 || tt.resumeList[0].work_jl.length == 0 && tt.resumeList[0].work_jy != 0) || !tt.resumeList.length) && $(this).index() >= 4) {
                event.preventDefault();
                $('.sendpop').show();
            }
        });
    },

    methods: {
        //关闭期望职位、期望行业选择弹窗
        hopePopFn(type){
            let tt=this;
            if(type==1){ //职位
                $('.industryPop').css({ 'animation': 'bottomFadeOut .3s' });
                setTimeout(() => {
                    tt.postCategoryPop = false;
                    $('.industryPop').css({ 'animation': 'topFadeIn .3s' });
                }, 280);
            }else{
                $('.industryPop').css({ 'animation': 'bottomFadeOut .3s' });
                setTimeout(() => {
                    tt.industryCategoryPop = false;
                    $('.industryPop').css({ 'animation': 'topFadeIn .3s' });
                }, 280);
            }
        },
        // 简历切换
        tabFn(item){
            let tt=this;
            if(item.min_salary==0){
                item.min_salary='';
            };
            if(item.max_salary==0){
                item.max_salary='';
            };
            if(item.startWork==0){
                item.startWork='';
            };
            if(item.min_salary==0&&item.max_salary==0){
                item.show_salary='';
            };
            tt.editInfoObj.edit=false; 
            tt.exitWarnb=false; 
            tt.currResume = item;
        },
        //创建简历达到上限
        createMax() {
            let tt = this;
            tt.popConfirm.width = 360;
            tt.popConfirm.height = 180;
            tt.popConfirm.cls = 'maxWarn';
            tt.popConfirm.title = '<s></s>最多可创建6个简历'
            tt.popConfirm.tip = '如需修改/编辑内容，可使用你不常使用的简历';
            tt.popConfirm.closeFn = function () {
                tt.popConfirm.width = 0;
                tt.popConfirm.height = 0;
                tt.popConfirm.cls = '';
            };
            tt.popConfirm.btns = [{
                text: '好的,知道了',
                type: 'sure',
                bgColor: '#3377FF',
                fn: function () {
                    tt.popConfirm.cls = '';
                    tt.popConfirm.width = 0;
                    tt.popConfirm.height = 0;
                    tt.popConfirm.show = false;
                }
            }];
            tt.popConfirm.show = true;
        },
        //预览简历
        previewResume() {
            let tt = this;
            if (tt.currResume.state == 2) {
                tt.popConfirm.show = true;
                tt.popConfirm.width = 360;
                tt.popConfirm.height = 210;
                tt.popConfirm.cls = 'failCreate';
                tt.popConfirm.title = '<s></s>简历审核未通过，请先提交修改'
                tt.popConfirm.tip = '请按要求修改提交后，再进行预览'
                tt.popConfirm.btns = [{
                    text: '好的',
                    type: 'sure',
                    bgColor: '#3377FF',
                    fn: function () {
                        tt.popConfirm.show = false;
                    }
                }];
            } else {
                open(jobhref + '/resume-' + tt.currResume.id + '.html?preview=1');
            }
        },
        // 关闭投递弹窗
        closePopFn() {
            $('.sendpop').children().css({ 'animation': 'bottomFadeOut .3s' });
            setTimeout(() => {
                $('.sendpop').hide();
                $('.s-certificate').css({ 'animation': 'topFadeIn .3s' });
            }, 280);
        },
        /**********************************创建简历相关 s*****************************/
        // 选择区域
        changeArea(res) {
            var tt = this;
            tt.addr = res;
            setTimeout(res => {
                let val;
                val = $(".addrBox input").val();
                if (val.indexOf('不限') != -1) {
                    let arr = val.split('/');
                    arr.pop();
                    arr = arr.join('/');
                    $(".addrBox input").val(arr)
                };
            }, 0)
        },

        // 主要是为了回显默认值
        changeMapAreaText(res) {
            console.log(res)
        },

        // 获取后台配置
        getBaseConfig() {
            var tt = this;
            $.ajax({
                url: '/include/ajax.php?service=job&action=getItem&name=jobTag,jobNature,education,workState,startWork,advantage,identify&type=auto',
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        tt.baseConfig = data.info;
                        // console.log(data.info['advantage'])
                    }
                },
                error: function () {

                }
            });
        },

        handleSuccess(response, file, fileList) {
            var tt = this;
            tt.$refs.uploadBtn.clearFiles(); //清除列表
            tt.form['photo'] = response.url
            tt.form['photo_url'] = response.turl;
        },

        // 图片开始上传
        handleChange: function (file) {
            var tt = this;
            var imgPreview = URL.createObjectURL(file.raw);
            tt.form['photo_url'] = imgPreview;

        },

        /**********************************创建简历相关 e*****************************/

        /*********************************简历列表相关 s****************************/
        // 获取简历列表
        getResumeList(id) {
            var tt = this;
            if (tt.loading) return false;
            if (!tt.pageLoad) {
                tt.loading = true;
                tt.pageLoad = true;
            }
            $.ajax({
                url: '/include/ajax.php?service=job&action=resumeList&page=1&pageSize=50&u=1',
                type: "POST",
                dataType: "json",
                success: function (data) {
                    tt.loading = false;
                    if (data.state == 100) {
                        tt.resumeList = data.info.list;
                        if ((data.info.list[0].education.length == 0 || (data.info.list[0].work_jy != 0 && data.info.list[0].work_jl.length == 0)) && data.info.list.length == 1) { //简历未创建完成
                            for (item in tt.form) {
                                tt.form[item] = data.info.list[0][item];
                            };
                            tt.form.addr_list.push(-1);
                            if (data.info.list[0].work_jl[0]) { //第二步已完成
                                tt.workjl = JSON.parse(JSON.stringify(data.info.list[0].work_jl[0]));
                                tt.createResumeStep = 2;
                            };
                            setTimeout(() => {
                                $(".addrBox input").val(tt.form.addr_list_Name.join(' / '));
                            }, 0);
                            tt.form.birth = data.info.list[0].birth * 1000;
                            tt.pageShow = 2;
                            return
                        };
                        if (!id) {
                            tt.currResume = data.info.list[0];
                            tt.defaultResume = data.info.list[0];
                            tt.form.birth = data.info.list[0].birth * 1000;
                        } else {
                            tt.currResume = data.info.list.find(item => {
                                return id == item.id;
                            });
                            tt.tabFn(tt.currResume);
                            tt.pageShow = 1;
                        }
                    } else {
                        // 没有简历
                        tt.pageShow = 2;
                    }
                },
                error: function () {
                    tt.loading = false;
                }
            });
        },

        // 编辑相关信息
        editInfo(type) {
            const tt = this;
            if (tt.editInfoObj.edit) {
                switch (tt.editInfoObj.editType) {
                    case 1: {
                        for (item in tt.form) {
                            if (item == 'birth') {
                                tt.currResume[item] = tt.currResume[item] * 1000
                            };
                            if (tt.form[item] != tt.currResume[item]) {
                                tt.editInfoObj.editTip = true;
                                return
                            };
                        };
                        break;
                    }
                    case 2: {
                        for (item in tt.form) {
                            if (item == 'birth') {
                                tt.currResume[item] = tt.currResume[item] * 1000
                            };
                            if (tt.form[item] != tt.currResume[item]) {
                                tt.editInfoObj.editTip = true;
                                return
                            };
                        };
                        break;
                    }
                    case 3: {
                        if (tt.editInfoObj.editInd == tt.currResume.work_jl.length) { //添加信息
                            for (item in tt.workjl) {
                                if (Boolean(tt.workjl[item])) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                        } else { //编辑信息
                            for (item in tt.workjl) {
                                if (tt.workjl[item] != tt.currResume.work_jl[tt.editInfoObj.editInd][item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                        }
                        break;
                    }
                    case 4: {
                        if (tt.editInfoObj.editInd == tt.currResume.education.length) { //添加信息
                            for (item in tt.educationJl) {
                                if (Boolean(tt.educationJl[item])) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                        } else { //编辑信息
                            for (item in tt.educationJl) {
                                if (tt.educationJl[item] != tt.currResume.education[tt.editInfoObj.editInd][item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                        }
                        break;
                    }
                    case 5: {
                        let operateKey;
                        if (tt.editInfoObj.editKey == 'lng') {//语言
                            operateKey = 'lng';
                        } else { //技能
                            operateKey = 'ski';
                        };
                        if ((!tt.currResume.skill.ski && !tt.currResume.skill.lng) || (tt.editInfoObj.editInd == tt.currResume.skill[operateKey].length)) { //添加信息
                            for (item in tt.skillObj) {
                                if (Boolean(tt.skillObj[item])) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                        } else { //编辑信息
                            for (item in tt.skillObj) {
                                if (tt.skillObj[item] != tt.currResume.skill[operateKey][tt.editInfoObj.editInd][item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                        }
                        break;
                    }
                    case 6: {
                        for (item in tt.editInfoObj['editArr']) {
                            if (item == 'ad_tag') {
                                for (let i = 0; i < tt.editInfoObj['editArr'][item].length; i++) {
                                    if (tt.editInfoObj['editArr'][item][i] != tt.currResume[item][i]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    }
                                }
                            } else {
                                if (tt.editInfoObj['editArr'][item] != tt.currResume[item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            }
                        };
                        break;
                    }
                }
            } else {
                tt.editInfoObj.editTip = false;
            };
            tt.exitWarnb = true;
            tt.editInfoObj['edit'] = true;
            tt.editInfoObj['editType'] = type;
            if (type === 1 || type === 2) { //编辑基本信息
                for (item in tt.form) {
                    if (item == 'birth') {
                        tt.form[item] = tt.currResume[item] * 1000
                    } else {
                        tt.form[item] = tt.currResume[item]
                    }

                }
            }
            if (type == 2) {
                tt.$nextTick(function () {
                    tt.setValue()

                })
            }
        },

        // 验证是否需要提示
        checkResumeState(callBack, param1, param2) {
            const tt = this;
            let curr = parseInt(new Date().valueOf() / 1000);
            if (tt.editInfoObj.edit) {
                switch (tt.editInfoObj.editType) {
                    case 1: {
                        for (item in tt.form) {
                            if (item == 'birth') {
                                tt.currResume[item] = tt.currResume[item] * 1000
                            };
                            if (tt.form[item] != tt.currResume[item]) {
                                tt.editInfoObj.editTip = true;
                                return
                            };
                        };
                        break;
                    }
                    case 2: {
                        for (item in tt.form) {
                            if (item == 'birth') {
                                tt.currResume[item] = tt.currResume[item] * 1000
                            };
                            if (tt.form[item] != tt.currResume[item]) {
                                tt.editInfoObj.editTip = true;
                                return
                            };
                        };
                        break;
                    }
                    case 3: {
                        if (tt.editInfoObj.editInd == tt.currResume.work_jl.length) { //添加信息
                            for (item in tt.workjl) {
                                if (Boolean(tt.workjl[item])) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                        } else { //编辑信息
                            for (item in tt.workjl) {
                                if (tt.workjl[item] != tt.currResume.work_jl[tt.editInfoObj.editInd][item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                        }
                        break;
                    }
                    case 4: {
                        if (tt.editInfoObj.editInd == tt.currResume.education.length) { //添加信息
                            for (item in tt.educationJl) {
                                if (Boolean(tt.educationJl[item])) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                        } else { //编辑信息
                            for (item in tt.educationJl) {
                                if (tt.educationJl[item] != tt.currResume.education[tt.editInfoObj.editInd][item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                        }
                        break;
                    }
                    case 5: {
                        let operateKey;
                        if (tt.editInfoObj.editKey == 'lng') {//语言
                            operateKey = 'lng';
                        } else { //技能
                            operateKey = 'ski';
                        };
                        if ((!tt.currResume.skill.ski && !tt.currResume.skill.lng) || (tt.editInfoObj.editInd == tt.currResume.skill[operateKey].length)) { //添加信息
                            for (item in tt.skillObj) {
                                if (Boolean(tt.skillObj[item])) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                        } else { //编辑信息
                            for (item in tt.skillObj) {
                                if (tt.skillObj[item] != tt.currResume.skill[operateKey][tt.editInfoObj.editInd][item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                        }
                        break;
                    }
                    case 6: {
                        for (item in tt.editInfoObj['editArr']) {
                            if (item == 'ad_tag') {
                                for (let i = 0; i < tt.editInfoObj['editArr'][item].length; i++) {
                                    if (tt.editInfoObj['editArr'][item][i] != tt.currResume[item][i]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    }
                                }
                            } else {
                                if (tt.editInfoObj['editArr'][item] != tt.currResume[item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            }
                        };
                        break;
                    }
                }
            } else {
                tt.editInfoObj.editTip = false;
            };
            if (tt.currResume.state == 1 || tt.currResume.refreshNext > curr || tt.currResume.bid_end > curr) {
                tt.popConfirm.width = 360;
                tt.popConfirm.height = 180;
                tt.popConfirm.cls = 'maxWarn';
                tt.popConfirm.title = '<s></s>修改此内容将重新审核简历'
                tt.popConfirm.tip = (tt.currResume.refreshNext > curr || tt.currResume.bid_end > curr) ? '<span style="color:#3377FF">审核中简历推广进程将暂停</span>' : '审核中简历暂不可用于投递',
                    tt.popConfirm.closeFn = function () {
                        tt.popConfirm.width = 0;
                        tt.popConfirm.height = 0;
                        tt.popConfirm.cls = '';
                    };
                tt.popConfirm.btns = [{
                    text: '取消',
                    type: 'cancel',
                    bgColor: '#F2F2F2',
                    fn: function () {
                        tt.popConfirm.cls = '';
                        tt.popConfirm.width = 0;
                        tt.popConfirm.height = 0;
                        tt.popConfirm.show = false;
                    }
                }, {
                    text: '继续修改',
                    type: 'sure',
                    bgColor: '#3377FF',
                    fn: function () {
                        tt.popConfirm.cls = '';
                        tt.popConfirm.width = 0;
                        tt.popConfirm.height = 0;
                        tt.popConfirm.show = false;
                        callBack(param1, param2)
                    }
                }];
                tt.popConfirm.show = true;
            } else {
                if (callBack) {
                    callBack(param1, param2)
                }
            }
        },

        // 显示黑框提示
        showErrAlert(data) {
            showAlertErrTimer && clearTimeout(showAlertErrTimer);
            $(".popErrAlert").remove();
            $("body").append('<div class="popErrAlert"><p>' + data + '</p></div>');

            $(".popErrAlert").css({
                "visibility": "visible"
            });
            showAlertErrTimer = setTimeout(function () {
                $(".popErrAlert").fadeOut(300, function () {
                    $(this).remove();
                });
            }, 1500);
        },

        // 获取短信验证码
        getPhoneMsg: function () {
            var tt = this;
            // var btn = event.currentTarget;
            var phone = tt.phone,
                areacode = tt.areaCode;

            if (phone == '') {
                tt.showErrAlert(langData['siteConfig'][20][463]); //请输入手机号码
                return false;
            } else if (areacode == "86") {
                var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
                if (!phoneReg.test(phone)) {
                    tt.showErrAlert('请输入正确的手机号码'); //手机号码格式不正确
                    return false;
                }
            }

            // 需要极验
            if (geetest ) {
                //弹出验证码
                if (geetest == 1) {
                    captchaVerifyFun.config.captchaObjReg.verify();
                } else {
                    $('#codeButton').click()
                }
            }

            // 不需要极验
            if (!geetest) {
                tt.sendVerCode();
            }

        },

        // 极验
        handlerPopupReg: function (captchaObjReg) {
            // 成功的回调
            var t = this;
            captchaObjReg.onSuccess(function () {
                var validate = captchaObjReg.getValidate();
                t.dataGeetest = "&geetest_challenge=" + validate.geetest_challenge + "&geetest_validate=" + validate.geetest_validate + "&geetest_seccode=" + validate.geetest_seccode;
                t.sendVerCode();

            });
            captchaObjReg.onClose(function () { })

            window.captchaObjReg = captchaObjReg;
        },

        // 发送验证码
        sendVerCode: function (captchaVerifyParam,callback) {
            var tt = this;
            let btn = $(".pp_getCode")
            // btn = btn.currentTarget ? $(event.currentTarget) : btn;

            btn.addClass('noclick');
            var phone = tt.phone;
            var areacode = tt.areaCode;

            var param = "&phone=" + phone + "&areaCode=" + areacode ;
            if(captchaVerifyParam && geetest == 2){
                param = param + '&geetest_challenge=' + captchaVerifyParam
            }else if(geetest == 1 && captchaVerifyParam){
                param = param +  captchaVerifyParam
            }
            var codeType = 'verify';
            $.ajax({
                url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify&terminal=mobile&type=" + codeType + param,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(callback){
                        callback(data)
                      }
                    //获取成功
                    if (data && data.state == 100) {
                        tt.showKeyBoard2 = true
                        tt.showKeyBoard = false;
                        tt.countDown(60, btn);
                        //获取失败
                    } else {
                        btn.removeClass("noclick").text(langData['siteConfig'][4][1]); //获取验证码
                        tt.showErrAlert(data.info);
                    }
                },
                error: function () {
                    btn.removeClass("noclick").text(langData['siteConfig'][4][1]); //获取验证码
                    tt.showErrAlert(langData['siteConfig'][20][173]); //网络错误，发送失败！
                }
            });
        },

        // 倒计时
        countDown: function (time, obj, func) {
            times = obj;
            obj.addClass("noclick").text(langData['siteConfig'][20][5].replace('1', time)); //1s后重新发送
            mtimer = setInterval(function () {
                obj.text(langData['siteConfig'][20][5].replace('1', (--time))); //1s后重新发送
                if (time <= 0) {
                    clearInterval(mtimer);
                    obj.removeClass('noclick').text(langData['siteConfig'][4][2]);
                }
            }, 1000);
        },

        // 获取国际区号
        getPhoneCodeArr() {
            const tt = this;
            $.ajax({
                url: '/include/ajax.php?service=siteConfig&action=internationalPhoneSection',
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        tt.areaCodeArr = data.info
                    }
                },
                error: function () { }
            });
        },

        // 确定修改绑定手机号
        changePhone() {
            var tt = this;
            $.ajax({
                url: '/include/ajax.php?service=job&action=verResumePhone&areacode=' + tt.areaCode + '&phone=' + tt.phone + '&vercode=' + tt.vercode,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        tt.form.phone = tt.phone;
                        tt.phoneChange = false; //隐藏弹窗
                        tt.showErrAlert(data.info);
                    }
                },
                error: function () { }
            });

        },

        // 追加工作经历
        addWorkJl() {
            const tt = this;
            if (tt.editInfoObj.edit) {
                    switch (tt.editInfoObj.editType) {
                        case 1: {
                            for (item in tt.form) {
                                if (item == 'birth') {
                                    tt.currResume[item] = tt.currResume[item] * 1000
                                };
                                if (tt.form[item] != tt.currResume[item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                            break;
                        }
                        case 2: {
                            for (item in tt.form) {
                                if (item == 'birth') {
                                    tt.currResume[item] = tt.currResume[item] * 1000
                                };
                                if (tt.form[item] != tt.currResume[item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                            break;
                        }
                        case 3: {
                            if (tt.editInfoObj.editInd == tt.currResume.work_jl.length) { //添加信息
                                for (item in tt.workjl) {
                                    if (Boolean(tt.workjl[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.workjl) {
                                    if (tt.workjl[item] != tt.currResume.work_jl[tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 4: {
                            if (tt.editInfoObj.editInd == tt.currResume.education.length) { //添加信息
                                for (item in tt.educationJl) {
                                    if (Boolean(tt.educationJl[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.educationJl) {
                                    if (tt.educationJl[item] != tt.currResume.education[tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 5: {
                            let operateKey;
                            if (tt.editInfoObj.editKey == 'lng') {//语言
                                operateKey = 'lng';
                            } else { //技能
                                operateKey = 'ski';
                            };
                            if ((!tt.currResume.skill.ski && !tt.currResume.skill.lng) || (tt.editInfoObj.editInd == tt.currResume.skill[operateKey].length)) { //添加信息
                                for (item in tt.skillObj) {
                                    if (Boolean(tt.skillObj[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.skillObj) {
                                    if (tt.skillObj[item] != tt.currResume.skill[operateKey][tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 6: {
                            for (item in tt.editInfoObj['editArr']) {
                                if (item == 'ad_tag') {
                                    for (let i = 0; i < tt.editInfoObj['editArr'][item].length; i++) {
                                        if (tt.editInfoObj['editArr'][item][i] != tt.currResume[item][i]) {
                                            tt.editInfoObj.editTip = true;
                                            return
                                        }
                                    }
                                } else {
                                    if (tt.editInfoObj['editArr'][item] != tt.currResume[item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                }
                            };
                            break;
                        }
                    }
            } else {
                tt.editInfoObj.editTip = false;
            };
            tt.exitWarnb = true;
            for (let item in tt.workjl) {
                tt.workjl[item] = '';
            };
            let editArr = tt.currResume.work_jl ? JSON.parse(JSON.stringify(tt.currResume.work_jl)) : [];
            editArr.push({})
            tt.editInfoObj = {
                editType: 3,
                edit: true,
                editInd: editArr.length - 1,
                editArr,
                editTip: false,
            }
            tt.textCount = 0;
        },

        editWorkJl(items, ind) {
            const tt = this;
            if (tt.editInfoObj.edit) {
                    switch (tt.editInfoObj.editType) {
                        case 1: {
                            for (item in tt.form) {
                                if (item == 'birth') {
                                    tt.currResume[item] = tt.currResume[item] * 1000
                                };
                                if (tt.form[item] != tt.currResume[item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                            break;
                        }
                        case 2: {
                            for (item in tt.form) {
                                if (item == 'birth') {
                                    tt.currResume[item] = tt.currResume[item] * 1000
                                };
                                if (tt.form[item] != tt.currResume[item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                            break;
                        }
                        case 3: {
                            if (tt.editInfoObj.editInd == tt.currResume.work_jl.length) { //添加信息
                                for (item in tt.workjl) {
                                    if (Boolean(tt.workjl[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.workjl) {
                                    if (tt.workjl[item] != tt.currResume.work_jl[tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            };

                            break;
                        }
                        case 4: {
                            if (tt.editInfoObj.editInd == tt.currResume.education.length) { //添加信息
                                for (item in tt.educationJl) {
                                    if (Boolean(tt.educationJl[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.educationJl) {
                                    if (tt.educationJl[item] != tt.currResume.education[tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 5: {
                            let operateKey;
                            if (tt.editInfoObj.editKey == 'lng') {//语言
                                operateKey = 'lng';
                            } else { //技能
                                operateKey = 'ski';
                            };
                            if ((!tt.currResume.skill.ski && !tt.currResume.skill.lng) || (tt.editInfoObj.editInd == tt.currResume.skill[operateKey].length)) { //添加信息
                                for (item in tt.skillObj) {
                                    if (Boolean(tt.skillObj[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.skillObj) {
                                    if (tt.skillObj[item] != tt.currResume.skill[operateKey][tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 6: {
                            for (item in tt.editInfoObj['editArr']) {
                                if (item == 'ad_tag') {
                                    for (let i = 0; i < tt.editInfoObj['editArr'][item].length; i++) {
                                        if (tt.editInfoObj['editArr'][item][i] != tt.currResume[item][i]) {
                                            tt.editInfoObj.editTip = true;
                                            return
                                        }
                                    }
                                } else {
                                    if (tt.editInfoObj['editArr'][item] != tt.currResume[item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                }
                            };
                            break;
                        }
                    }
            } else {
                tt.editInfoObj.editTip = false;
            };
            tt.editInfoObj.edit = true;
            tt.exitWarnb = true;
            tt.workjl = JSON.parse(JSON.stringify(items));
            let editArr = tt.currResume.work_jl ? JSON.parse(JSON.stringify(tt.currResume.work_jl)) : [];
            tt.editInfoObj = {
                editType: 3,
                edit: true,
                editInd: ind,
                editArr,
                editTip: false
            }
            tt.workjl.content = tt.workjl.content.replace(/<br>/g,'\r\n');
            var regex = /(<([^>]+)>)/ig;
            var conText = tt.workjl.content;
            conText = conText.replace(regex, 1);
            tt.textCount = conText.length;
        },

        // 计算输入框输入的字数
        changeTextCount(action) {
            var tt = this;
            var el = event.currentTarget;
            if (event.keyCode != 8 && event.keyCode != 13 && !tt.textCount && !action) {
                tt.textCount = 1
            } else {
                var conText = $(el).text();
                tt.textCount = conText.length;
            }
            if (tt.textCount >= 500 && event.keyCode != 8) {
                event.returnValue = false;
            } else {
                event.returnValue = true;
            }

            tt.workjl.content = $(el).html();
        },


        // 追加教育经历
        addEducationJl() {
            const tt = this;
            if (tt.editInfoObj.edit) {
                    switch (tt.editInfoObj.editType) {
                        case 1: {
                            for (item in tt.form) {
                                if (item == 'birth') {
                                    tt.currResume[item] = tt.currResume[item] * 1000
                                };
                                if (tt.form[item] != tt.currResume[item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                            break;
                        }
                        case 2: {
                            for (item in tt.form) {
                                if (item == 'birth') {
                                    tt.currResume[item] = tt.currResume[item] * 1000
                                };
                                if (tt.form[item] != tt.currResume[item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                            break;
                        }
                        case 3: {
                            if (tt.editInfoObj.editInd == tt.currResume.work_jl.length) { //添加信息
                                for (item in tt.workjl) {
                                    if (Boolean(tt.workjl[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.workjl) {
                                    if (tt.workjl[item] != tt.currResume.work_jl[tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 4: {
                            if (tt.editInfoObj.editInd == tt.currResume.education.length) { //添加信息
                                for (item in tt.educationJl) {
                                    if (Boolean(tt.educationJl[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.educationJl) {
                                    if (tt.educationJl[item] != tt.currResume.education[tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 5: {
                            let operateKey;
                            if (tt.editInfoObj.editKey == 'lng') {//语言
                                operateKey = 'lng';
                            } else { //技能
                                operateKey = 'ski';
                            };
                            if ((!tt.currResume.skill.ski && !tt.currResume.skill.lng) || (tt.editInfoObj.editInd == tt.currResume.skill[operateKey].length)) { //添加信息
                                for (item in tt.skillObj) {
                                    if (Boolean(tt.skillObj[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.skillObj) {
                                    if (tt.skillObj[item] != tt.currResume.skill[operateKey][tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 6: {
                            for (item in tt.editInfoObj['editArr']) {
                                if (item == 'ad_tag') {
                                    for (let i = 0; i < tt.editInfoObj['editArr'][item].length; i++) {
                                        if (tt.editInfoObj['editArr'][item][i] != tt.currResume[item][i]) {
                                            tt.editInfoObj.editTip = true;
                                            return
                                        }
                                    }
                                } else {
                                    if (tt.editInfoObj['editArr'][item] != tt.currResume[item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                }
                            };
                            break;
                        }
                    }
            } else {
                tt.editInfoObj.editTip = false;
            };
            tt.exitWarnb = true;
            for (let item in tt.educationJl) {
                tt.educationJl[item] = '';
            }
            let editArr = tt.currResume.education ? JSON.parse(JSON.stringify(tt.currResume.education)) : [];
            editArr.push({})
            tt.editInfoObj = {
                editType: 4,
                edit: true,
                editInd: editArr.length - 1,
                editArr,
                editTip: false,
            }

        },
        editEducationJl(items, ind) {
            const tt = this;
            if (tt.editInfoObj.edit) {
                    switch (tt.editInfoObj.editType) {
                        case 1: {
                            for (item in tt.form) {
                                if (item == 'birth') {
                                    tt.currResume[item] = tt.currResume[item] * 1000
                                };
                                if (tt.form[item] != tt.currResume[item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                            break;
                        }
                        case 2: {
                            for (item in tt.form) {
                                if (item == 'birth') {
                                    tt.currResume[item] = tt.currResume[item] * 1000
                                };
                                if (tt.form[item] != tt.currResume[item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                            break;
                        }
                        case 3: {
                            if (tt.editInfoObj.editInd == tt.currResume.work_jl.length) { //添加信息
                                for (item in tt.workjl) {
                                    if (Boolean(tt.workjl[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.workjl) {
                                    if (tt.workjl[item] != tt.currResume.work_jl[tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 4: {
                            if (tt.editInfoObj.editInd == tt.currResume.education.length) { //添加信息
                                for (item in tt.educationJl) {
                                    if (Boolean(tt.educationJl[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.educationJl) {
                                    if (tt.educationJl[item] != tt.currResume.education[tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 5: {
                            let operateKey;
                            if (tt.editInfoObj.editKey == 'lng') {//语言
                                operateKey = 'lng';
                            } else { //技能
                                operateKey = 'ski';
                            };
                            if ((!tt.currResume.skill.ski && !tt.currResume.skill.lng) || (tt.editInfoObj.editInd == tt.currResume.skill[operateKey].length)) { //添加信息
                                for (item in tt.skillObj) {
                                    if (Boolean(tt.skillObj[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.skillObj) {
                                    if (tt.skillObj[item] != tt.currResume.skill[operateKey][tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 6: {
                            for (item in tt.editInfoObj['editArr']) {
                                if (item == 'ad_tag') {
                                    for (let i = 0; i < tt.editInfoObj['editArr'][item].length; i++) {
                                        if (tt.editInfoObj['editArr'][item][i] != tt.currResume[item][i]) {
                                            tt.editInfoObj.editTip = true;
                                            return
                                        }
                                    }
                                } else {
                                    if (tt.editInfoObj['editArr'][item] != tt.currResume[item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                }
                            };
                            break;
                        }
                    }
            } else {
                tt.editInfoObj.editTip = false;
            };
            tt.exitWarnb = true;
            tt.educationJl = JSON.parse(JSON.stringify(items));
            let editArr = tt.currResume.education ? JSON.parse(JSON.stringify(tt.currResume.education)) : [];
            tt.editInfoObj = {
                editType: 4,
                edit: true,
                editInd: ind,
                editArr,
                editTip: false
            }

        },

        // 编辑
        editAdvantage() {
            const tt = this;
            if (tt.editInfoObj.edit) {
                    switch (tt.editInfoObj.editType) {
                        case 1: {
                            for (item in tt.form) {
                                if (item == 'birth') {
                                    tt.currResume[item] = tt.currResume[item] * 1000
                                };
                                if (tt.form[item] != tt.currResume[item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                            break;
                        }
                        case 2: {
                            for (item in tt.form) {
                                if (item == 'birth') {
                                    tt.currResume[item] = tt.currResume[item] * 1000
                                };
                                if (tt.form[item] != tt.currResume[item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                            break;
                        }
                        case 3: {
                            if (tt.editInfoObj.editInd == tt.currResume.work_jl.length) { //添加信息
                                for (item in tt.workjl) {
                                    if (Boolean(tt.workjl[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.workjl) {
                                    if (tt.workjl[item] != tt.currResume.work_jl[tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 4: {
                            if (tt.editInfoObj.editInd == tt.currResume.education.length) { //添加信息
                                for (item in tt.educationJl) {
                                    if (Boolean(tt.educationJl[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.educationJl) {
                                    if (tt.educationJl[item] != tt.currResume.education[tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 5: {
                            let operateKey;
                            if (tt.editInfoObj.editKey == 'lng') {//语言
                                operateKey = 'lng';
                            } else { //技能
                                operateKey = 'ski';
                            };
                            if ((!tt.currResume.skill.ski && !tt.currResume.skill.lng) || (tt.editInfoObj.editInd == tt.currResume.skill[operateKey].length)) { //添加信息
                                for (item in tt.skillObj) {
                                    if (Boolean(tt.skillObj[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.skillObj) {
                                    if (tt.skillObj[item] != tt.currResume.skill[operateKey][tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 6: {
                            for (item in tt.editInfoObj['editArr']) {
                                if (item == 'ad_tag') {
                                    for (let i = 0; i < tt.editInfoObj['editArr'][item].length; i++) {
                                        if (tt.editInfoObj['editArr'][item][i] != tt.currResume[item][i]) {
                                            tt.editInfoObj.editTip = true;
                                            return
                                        }
                                    }
                                } else {
                                    if (tt.editInfoObj['editArr'][item] != tt.currResume[item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                }
                            };
                            break;
                        }
                    }
            } else {
                tt.editInfoObj.editTip = false;
            };
            tt.exitWarnb = true;
            tt.editInfoObj.edit = true;
            tt.editInfoObj.editType = 6;
            tt.editInfoObj['editArr'] = {};
            let arrHas = tt.currResume.ad_tag.filter(item => {
                const indexObj = tt.baseConfig['advantage'].find(obj => {
                    return obj.typename == item
                })
                return indexObj;
            })

            let selfArr = tt.currResume.ad_tag.filter(item => {
                return !arrHas.includes(item);
            });

            tt.editInfoObj['editArr']['ad_tag'] = JSON.parse(JSON.stringify(tt.currResume.ad_tag))
            tt.editInfoObj['editArr']['advantage'] = tt.currResume.advantage;
            tt.selfLab = selfArr[0];

            tt.$nextTick(() => {
                tt.$refs.autofocus.focus()
            })
        },

        // 保存数据
        changeForm(type) {
            const tt = this;
            tt.editInfoObj.editTip = false;
            let needFinish = []
            if (type === 1) {
                needFinish = ['photo', 'name', 'sex', 'birth', 'identify', 'workState', 'work_jy', 'phone']
            } else if (type === 2) {
                needFinish = ['job', 'nature', 'type', 'min_salary', 'max_salary', 'startWork', 'addr']
            }
            let stop = false;
            for (var item in tt.form) {
                if (needFinish.indexOf(item) > -1 && (!tt.form[item] || (Array.isArray(tt.form[item]) && tt.form[item].length == 0))) {
                    tt.showErrAlert('请先完善必填信息')
                    stop = true;
                    return false;
                }
            }
            if (stop) return false;
            tt.submitData(type)
        },

        // 提交相关数据
        submitData(type, pdata, func) {
            const tt = this;
            let param = [];
            if (tt.ajaxb) {
                return
            };
            tt.ajaxb = true;
            if (type == 1) {
                param.push('columns=basicInfo')
                for (let item in tt.form) {
                    if (item != 'birth') {
                        param.push(item + '=' + tt.form[item])
                    } else {
                        param.push(item + '=' + parseInt(tt.form[item] / 1000))
                    }
                }
            } else if (type === 2) {
                param.push('columns=intentionPc')
                for (let item in tt.form) {
                    if (item == 'addr' && tt.form[item] == -1) { //判断是否有不限地址的
                        let index = tt.form['addr_list'].length - 2;
                        tt.form.addr = tt.form['addr_list'][index]
                    };
                    if (item != 'birth') {
                        param.push(item + '=' + tt.form[item])
                    } else {
                        param.push(item + '=' + parseInt(tt.form[item] / 1000))
                    }
                }
            }
            if (pdata) {
                param = param.concat(pdata)
            }
            if (tt.editInfoObj.edit) {
                param.push('id=' + tt.currResume.id)
            }
            $.ajax({
                url: '/include/ajax.php?service=job&action=aeResume&cityid=' + cityid,
                data: param.join('&'),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        if ((tt.pageShow == 2 && tt.createResumeStep == 3) || tt.pageShow != 2) {
                            $('.popWarn').css({ 'display': 'flex' });
                            setTimeout(() => {
                                $('.popWarn').css({ 'animation': 'bottomFadeOut .3s' });
                                setTimeout(() => {
                                    $('.popWarn').css({ 'animation': 'topFadeIn .3s' });
                                    $('.popWarn').hide();
                                }, 280);
                            }, 2000);
                        };
                        if (tt.pageShow == 2) {
                            tt.form.id = data.aid;
                        };
                        if (tt.editInfoObj.edit) {
                            if (type === 1 || type === 2) {
                                for (let item in tt.form) {
                                    tt.currResume[item] = tt.form[item]
                                    const idObj = tt.identifyArr.find(item => tt.form.identify == item.id)
                                    tt.currResume.identify_name = idObj.title
                                    if (item == 'birth') {
                                        tt.currResume[item] = parseInt(tt.form[item] / 1000)
                                    }
                                }
                            } else if (type === 3) {
                                tt.currResume['work_jl'] = tt.editInfoObj['editArr']
                            } else if (type === 4) {
                                tt.currResume['education'] = tt.editInfoObj['editArr']
                            }
                            if (tt.currResume.id) {

                                tt.getResumeList(tt.currResume.id)
                            }
                            tt.editInfoObj.edit = false;

                        }
                        if (func) {
                            func(data);
                        }
                    } else {
                        alert(data.info)
                    }
                    tt.nextb = false;
                    tt.ajaxb = false;
                }
            })

        },

        // 取消编辑
        cancelEdit() {
            const tt = this;
            tt.exitWarnb = false;
            tt.editInfoObj['edit'] = false;
            tt.editInfoObj['editType']=0;
            tt.editInfoObj['editInd'] = 0
            tt.editInfoObj['editArr'] = [];
            tt.editInfoObj['editKey'] = '';
            tt.editInfoObj['editTip'] = false;
            tt.selfLabShow = false;
            for (let item in tt.form) {
                if (item != 'birth') {
                    tt.form[item] = ''
                }
            };
        },


        // 获取职位分类
        getCategoryList() {
            var tt = this;
            $.ajax({
                url: '/include/ajax.php?service=job&action=type&son=1',
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    var categoryList = data.info
                    // console.log(categoryList)
                    for (var i = 0; i < categoryList.length; i++) {
                        var item = categoryList[i].lower;
                        var noLowerArr = [];
                        for (var m = 0; m < item.length; m++) {
                            if (item[m].lower && item[m].lower.length) {
                                tt.categoryShow = 1;
                                // break;
                            } else {
                                noLowerArr.push(item[m])
                            }
                        }
                        categoryList[i]['noLower'] = noLowerArr;
                    }

                    tt.categoryList = categoryList;
                    tt.currCategory = tt.categoryList[0]

                },
                error: function (data) {
                    console.log('网络错误，请稍后重试！')
                }
            });
        },


        // 获取行业分类
        getIndustryList() {
            var tt = this;
            $.ajax({
                url: '/include/ajax.php?service=job&action=industry&son=1',
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    var categoryList = data.info
                    for (var i = 0; i < categoryList.length; i++) {
                        var item = categoryList[i].lower;
                        var noLowerArr = [];
                        for (var m = 0; m < item.length; m++) {
                            if (item[m].lower && item[m].lower.length) {
                                tt.categoryShow_industry = 1;
                                // break;
                            } else {
                                noLowerArr.push(item[m])
                            }
                        }
                        categoryList[i]['noLower'] = noLowerArr;
                    }

                    tt.categoryList_industry = categoryList;
                    tt.currIndustry = tt.categoryList_industry[0]

                },
                error: function (data) {
                    console.log('网络错误，请稍后重试！')
                }
            });
        },

        // 行业滚动
        industryScroll: function (item) {
            const that = this;
            that.currIndustry = item;
            const id = item.id;
            var top = $('.postArrList dl[data-id="' + id + '"]').attr('data-top');
            if (!top) {
                $('.postArrList dl').each(function () {
                    $(this).attr('data-top', $(this).position().top - 50)
                    if ($(this).attr('data-id') == item.id) {
                        top = $(this).position().top - 50
                    }
                })
            }
            $(".postArrList").scrollTop(top)
        },

        // 类型滚动
        cateScroll(e) {
            var tt = this;
            var el = event.currentTarget;
            var scrollTop = $(el).scrollTop();
            var currid = '';
            if (tt.categoryShow) return false;
            if (scrollTop <= 50) {
                currid = $(el).find('dl').eq(0).attr('data-id')
            } else {

                $(el).find('dl').each(function () {
                    var dl = $(this);
                    var top = dl.attr('data-top');
                    var topHeight = dl.attr('data-top') * 1 + dl.height();

                    if (top <= scrollTop && topHeight >= scrollTop && !$(el).hasClass('onScroll')) {
                        currid = Number(dl.attr('data-id'));
                        return false;
                    }
                })
            }
            for (var i = 0; i < tt.categoryList.length; i++) {
                if (tt.categoryList[i].id == currid) {
                    tt.currCategory = tt.categoryList[i];
                    break;
                }
            }
        },


        // 选择的职位分类
        postShow(item) {
            var tt = this;
            $('.industryPop .industry_bottom .hasChosed .warning').hide();
            if (tt.singleChose) {
                tt.currChosePost = [item.parentid, item.id];
                tt.currChosePostText = [item.typename]
                return false;
            }
            // 多选
            var postidArr = [];
            if (tt.currChosePost) {
                postidArr = JSON.parse(JSON.stringify(tt.currChosePost));
                if (postidArr && postidArr.length && postidArr.indexOf(item.id) > -1) {
                    postidArr.splice(postidArr.indexOf(item.id), 1)
                    tt.currChosePostText.splice(tt.currChosePostText.indexOf(item.typename), 1)
                } else {
                    if (tt.currChosePost && tt.currChosePost.length >= 3) {
                        tt.showErrAlert('最多选择3个职位')
                        return false;
                    }
                    postidArr.push(item.id)
                    tt.currChosePostText.push(item.typename)
                }
            } else {
                tt.currChosePostText = tt.currChosePostText ? tt.currChosePostText : []
                postidArr.push(item.id);
                tt.currChosePostText.push(item.typename)
            }

            tt.currChosePost = postidArr;

        },
        // 选择的行业分类
        industryShow(item) {
            $('.industryPop .industry_bottom .hasChosed .warning').hide();
            var tt = this;
            var postidArr = [];
            // 多选
            if (tt.currChoseIndustry && tt.currChoseIndustry.length > 0) {
                postidArr = JSON.parse(JSON.stringify(tt.currChoseIndustry));
                if (postidArr && postidArr.length && postidArr.indexOf(item.id) > -1) {
                    postidArr.splice(postidArr.indexOf(item.id), 1)
                    tt.currChoseIndustryText.splice(tt.currChoseIndustryText.indexOf(item.typename), 1)
                } else {
                    if (tt.currChoseIndustry && tt.currChoseIndustry.length >= 3) {
                        tt.showErrAlert('最多选择3个行业')
                        return false;
                    }
                    postidArr.push(item.id)
                    tt.currChoseIndustryText.push(item.typename)
                }
            } else {
                tt.currChoseIndustryText = tt.currChoseIndustryText ? tt.currChoseIndustryText : []
                postidArr.push(item.id);
                tt.currChoseIndustryText.push(item.typename)
            }

            tt.currChoseIndustry = postidArr;

        },

        // 确定选择
        choseJobType(type) {
            const tt = this;
            if (!type) {
                if (tt.currChosePostText.length == 0) {
                    $('.industryPop .industry_bottom .hasChosed .warning').css({ 'display': 'flex' });
                    return
                } else {
                    $('.industryPop .industry_bottom .hasChosed .warning').hide();
                }
                if (tt.singleChose) {
                    tt.workjl.job = tt.currChosePostText[0];
                    tt.workjl.jobid = tt.currCategory.id == tt.currChosePost[0] ? tt.currChosePost : [tt.currCategory.id].concat(tt.currChosePost)
                    tt.postCategoryPop = false;
                } else {

                    tt.form.job = tt.currChosePost;
                    tt.form.job_name = tt.currChosePostText;
                    tt.postCategoryPop = false;
                }
            } else if (type == 1) {
                if (tt.currChoseIndustryText.length == 0) {
                    $('.industryPop .industry_bottom .hasChosed .warning').css({ 'display': 'flex' });
                    return
                } else {
                    $('.industryPop .industry_bottom .hasChosed .warning').hide();
                }
                tt.form.type = tt.currChoseIndustry;
                tt.form.type_name = tt.currChoseIndustryText;
                tt.industryCategoryPop = false;
            }
        },

        // 删除tag
        removeTag(ind, type) {
            const tt = this;
            if (type === 1) { //行业删除
                tt.currChoseIndustry.splice(ind, 1)
                tt.currChoseIndustryText.splice(ind, 1)
            } else {
                tt.currChosePost.splice(ind, 1)
                tt.currChosePostText.splice(ind, 1)
            }
        },

        // 确定添加/修改工作经历
        sureAddWorkJl() {
            const tt = this;
            for (let item in tt.workjl) {
                if (['company', 'work_start', 'work_end', 'job'].includes(item) && !tt.workjl[item]) { //未填
                    const ind = ['company', 'work_start', 'work_end', 'job'].indexOf(item);
                    switch (ind) { //公司名称
                        case 0:
                            $('.companyName').addClass('flash');
                            setTimeout(() => {
                                $('.companyName').removeClass('flash');
                            }, 1000);
                            break;
                        case 1: //入职时间
                            $('.workStart .el-input__inner').addClass('flash');
                            setTimeout(() => {
                                $('.workStart .el-input__inner').removeClass('flash');
                            }, 1000);
                            break;
                        case 2: //离职时间
                            $('.workEnd .el-input__inner').addClass('flash');
                            setTimeout(() => {
                                $('.workEnd .el-input__inner').removeClass('flash');
                            }, 1000);
                            break;
                        case 3: //担任职位
                            $('.servePost').addClass('flash');
                            setTimeout(() => {
                                $('.servePost').removeClass('flash');
                            }, 1000);
                            break;
                    }
                    return false;
                }
            }

            tt.editInfoObj.editArr[tt.editInfoObj.editInd] = tt.workjl;

            if (tt.workjl.content) {
                tt.workjl.content = tt.workjl.content.replaceAll('<div><br></div>', '');
            }
            let param = [];
            param.push('columns=work_jl')
            param.push('work_jl=' + JSON.stringify(tt.editInfoObj.editArr))
            tt.submitData(3, param)
        },
        // 确定添加/修改教育
        sureAddEdu() {
            const tt = this;
            for (let item in tt.educationJl) {
                if (['xl_id', 'start', 'end', 'school'].includes(item) && !tt.educationJl[item]) { //未填
                    const ind = ['xl_id', 'start', 'end', 'school'].indexOf(item);
                    switch (ind) {
                        case 0:  //学历
                            $('.educationSelect .el-input__inner').addClass('flash');
                            setTimeout(() => {
                                $('.educationSelect .el-input__inner').removeClass('flash');
                            }, 1000);
                            break;
                        case 1: //入学时间
                            $('.startSchool .el-input__inner').addClass('flash');
                            setTimeout(() => {
                                $('.startSchool .el-input__inner').removeClass('flash');
                            }, 1000);
                            break;
                        case 2: //毕业时间
                            $('.endSchool .el-input__inner').addClass('flash');
                            setTimeout(() => {
                                $('.endSchool .el-input__inner').removeClass('flash');
                            }, 1000);
                            break;
                        case 3: //学校名称
                            $('.schoolName').addClass('flash');
                            setTimeout(() => {
                                $('.schoolName').removeClass('flash');
                            }, 1000);
                            break;
                        case 4: //专业
                            $('.majorName').addClass('flash');
                            setTimeout(() => {
                                $('.majorName').removeClass('flash');
                            }, 1000);
                            break;
                    }
                    return false;
                }
            }
            const xlObj = tt.baseConfig['education'].find(item => {
                return item.id == tt.educationJl['xl_id']
            })
            tt.educationJl['xl'] = xlObj['typename']
            tt.editInfoObj.editArr[tt.editInfoObj.editInd] = tt.educationJl;

            let param = [];
            param.push('columns=education')
            param.push('education=' + JSON.stringify(tt.editInfoObj.editArr))
            tt.submitData(4, param)
        },

        // 选择标签
        choseTag(item) {
            const tt = this;
            if (tt.editInfoObj['editArr']['ad_tag'].indexOf(item.typename) > -1) {
                let index = tt.editInfoObj['editArr']['ad_tag'].indexOf(item.typename);
                tt.editInfoObj['editArr']['ad_tag'].splice(index, 1)
                this.$forceUpdate()
            } else if (tt.editInfoObj['editArr']['ad_tag'].length + (tt.selfLabShow && !tt.editInfoObj['editArr']['sel_tag'] ? 1 : 0) < 3) {
                tt.editInfoObj['editArr']['ad_tag'].push(item.typename);
                this.$forceUpdate()

            } else {
                tt.showErrAlert('最多选择3个标签')
            }
        },

        // 确定自定义标签
        sureSelfText() {
            const tt = this;
            // 获取后台配置的tag
            let arrHas = tt.editInfoObj['editArr']['ad_tag'].filter(item => {
                const indexObj = tt.baseConfig['advantage'].find(obj => {
                    return obj.typename == item
                })
                return indexObj;
            })
            if (tt.selfLab) {

                arrHas.push(tt.selfLab)
            }
            tt.editInfoObj['editArr']['ad_tag'] = arrHas;
            tt.editInfoObj['editArr']['sel_tag'] = true;
            tt.selfLabShow = false; //关闭自定义
        },


        // 确定保存个人加分项
        sureAdvantage() {
            const tt = this;
            tt.editInfoObj.editTip = false;
            let param = [];
            param.push('columns=advantagePc')
            param.push('advantage=' + tt.editInfoObj.editArr['advantage'])
            param.push('ad_tag=' + tt.editInfoObj.editArr['ad_tag'].join('||'))
            tt.submitData(6, param)
        },

        setValue(area) {
            var tt = this;
            let cs = tt.$refs.cascaderRefArea;
            tt.form.addr_list.push(-1);
            $(".addrBox input").val(tt.form.addr_list_Name.join(' / '))
            if (cs && cs.panel) {
                cs.panel.activePath = [];
                cs.panel.loadCount = 0;
                cs.panel.lazyLoad();
            }

        },


        // 新增技巧
        addSkill(type) {
            const tt = this;
            if (tt.editInfoObj.edit) {
                    switch (tt.editInfoObj.editType) {
                        case 1: {
                            for (item in tt.form) {
                                if (item == 'birth') {
                                    tt.currResume[item] = tt.currResume[item] * 1000
                                };
                                if (tt.form[item] != tt.currResume[item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                            break;
                        }
                        case 2: {
                            for (item in tt.form) {
                                if (item == 'birth') {
                                    tt.currResume[item] = tt.currResume[item] * 1000
                                };
                                if (tt.form[item] != tt.currResume[item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                            break;
                        }
                        case 3: {
                            if (tt.editInfoObj.editInd == tt.currResume.work_jl.length) { //添加信息
                                for (item in tt.workjl) {
                                    if (Boolean(tt.workjl[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.workjl) {
                                    if (tt.workjl[item] != tt.currResume.work_jl[tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 4: {
                            if (tt.editInfoObj.editInd == tt.currResume.education.length) { //添加信息
                                for (item in tt.educationJl) {
                                    if (Boolean(tt.educationJl[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.educationJl) {
                                    if (tt.educationJl[item] != tt.currResume.education[tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 5: {
                            let operateKey;
                            if (tt.editInfoObj.editKey == 'lng') {//语言
                                operateKey = 'lng';
                            } else { //技能
                                operateKey = 'ski';
                            };
                            if ((!tt.currResume.skill.ski && !tt.currResume.skill.lng) || (tt.editInfoObj.editInd == tt.currResume.skill[operateKey].length)) { //添加信息
                                for (item in tt.skillObj) {
                                    if (Boolean(tt.skillObj[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.skillObj) {
                                    if (tt.skillObj[item] != tt.currResume.skill[operateKey][tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 6: {
                            for (item in tt.editInfoObj['editArr']) {
                                if (item == 'ad_tag') {
                                    for (let i = 0; i < tt.editInfoObj['editArr'][item].length; i++) {
                                        if (tt.editInfoObj['editArr'][item][i] != tt.currResume[item][i]) {
                                            tt.editInfoObj.editTip = true;
                                            return
                                        }
                                    }
                                } else {
                                    if (tt.editInfoObj['editArr'][item] != tt.currResume[item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                }
                            };
                            break;
                        }
                    }
            } else {
                tt.editInfoObj.editTip = false;
            };
            tt.exitWarnb = true;
            tt.editInfoObj.editType = 5;
            tt.editInfoObj.edit = true
            tt.editInfoObj.editKey = '';
            tt.editInfoObj.editArr = tt.currResume.skill;
            tt.skillObj = {
                type: type||0, //类型 0 => 语言  1 => 技能
                lang: '', //语种
                level_speak: '', //听说
                level_read: '', //读写
                time: '', //证书获取时间
                certificate: '', //证书类型
                cer_fullName: '', //证书
            };
        },

        // 编辑技巧
        editSkill(ind, editKey) {
            const tt = this;
            if (tt.editInfoObj.edit) {
                    switch (tt.editInfoObj.editType) {
                        case 1: {
                            for (item in tt.form) {
                                if (item == 'birth') {
                                    tt.currResume[item] = tt.currResume[item] * 1000
                                };
                                if (tt.form[item] != tt.currResume[item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                            break;
                        }
                        case 2: {
                            for (item in tt.form) {
                                if (item == 'birth') {
                                    tt.currResume[item] = tt.currResume[item] * 1000
                                };
                                if (tt.form[item] != tt.currResume[item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                            break;
                        }
                        case 3: {
                            if (tt.editInfoObj.editInd == tt.currResume.work_jl.length) { //添加信息
                                for (item in tt.workjl) {
                                    if (Boolean(tt.workjl[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.workjl) {
                                    if (tt.workjl[item] != tt.currResume.work_jl[tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 4: {
                            if (tt.editInfoObj.editInd == tt.currResume.education.length) { //添加信息
                                for (item in tt.educationJl) {
                                    if (Boolean(tt.educationJl[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.educationJl) {
                                    if (tt.educationJl[item] != tt.currResume.education[tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 5: {
                            let operateKey;
                            if (tt.editInfoObj.editKey == 'lng') {//语言
                                operateKey = 'lng';
                            } else { //技能
                                operateKey = 'ski';
                            };
                            if ((!tt.currResume.skill.ski && !tt.currResume.skill.lng) || (tt.editInfoObj.editInd == tt.currResume.skill[operateKey].length)) { //添加信息
                                for (item in tt.skillObj) {
                                    if (Boolean(tt.skillObj[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.skillObj) {
                                    if (tt.skillObj[item] != tt.currResume.skill[operateKey][tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 6: {
                            for (item in tt.editInfoObj['editArr']) {
                                if (item == 'ad_tag') {
                                    for (let i = 0; i < tt.editInfoObj['editArr'][item].length; i++) {
                                        if (tt.editInfoObj['editArr'][item][i] != tt.currResume[item][i]) {
                                            tt.editInfoObj.editTip = true;
                                            return
                                        }
                                    }
                                } else {
                                    if (tt.editInfoObj['editArr'][item] != tt.currResume[item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                }
                            };
                            break;
                        }
                    }
            } else {
                tt.editInfoObj.editTip = false;
            };
            tt.exitWarnb = true;
            tt.editInfoObj.editType = 5
            tt.editInfoObj.edit = true
            tt.editInfoObj.editKey = editKey;
            tt.editInfoObj.editArr = tt.currResume.skill;
            tt.editInfoObj.editInd = ind;
            tt.skillObj = JSON.parse(JSON.stringify(tt.editInfoObj.editArr[editKey][ind]))
        },


        // 选择掌握程度
        choseLevel(type, item) {
            const tt = this;
            if (tt.skillObj.level_read && tt.skillObj.level_speak) {
                tt.skillObj.level_read = '';
                tt.skillObj.level_speak = '';
            }
            tt.skillObj[type] = item;
            if (tt.skillObj.level_read && tt.skillObj.level_speak) {
                tt.levelPop = false;
            }
        },


        editSkillSure(edit) { //edit表示编辑
            const tt = this;
            tt.editInfoObj.editTip = false;
            let arr;
            const obj = {
                name: tt.skillObj.type ? '专业技能' : '语言能力',
                type: tt.skillObj.type,
            }
            if (!tt.skillObj.type) {
                obj['level_read'] = tt.skillObj.level_read;
                obj['level_speak'] = tt.skillObj.level_speak;
                obj['lang'] = tt.skillObj.lang;
                obj['certificate'] = tt.skillObj.certificate;
                arr = ['level_read', 'level_speak', 'lang'];
            } else {
                obj['time'] = tt.skillObj.time;
                obj['cer_fullName'] = tt.skillObj.cer_fullName;
                obj['certificateType'] = tt.skillObj.certificateType;
                arr = ['', '', '', 'time', 'certificateType'];

            }
            // 验证是否必填
            for (var item in obj) {
                if (arr.indexOf(item) > -1 && !obj[item]) {
                    const ind = arr.indexOf(item);
                    switch (ind) {
                        case 0: //掌握程度(读)
                            $('.masterDegree').addClass('flash');
                            setTimeout(() => {
                                $('.masterDegree').removeClass('flash');
                            }, 1000);
                            break;
                        case 1://掌握程度(写)
                            $('.masterDegree').addClass('flash');
                            setTimeout(() => {
                                $('.masterDegree').removeClass('flash');
                            }, 1000);
                            break;
                        case 2: //语言
                            $('.languageSel .el-input__inner').addClass('flash');
                            setTimeout(() => {
                                $('.languageSel .el-input__inner').removeClass('flash');
                            }, 1000);
                            break;
                        case 3: //证书时间
                            $('.getTime .el-input__inner').addClass('flash');
                            setTimeout(() => {
                                $('.getTime .el-input__inner').removeClass('flash');
                            }, 1000);
                            break;
                        case 4: //证书类型
                            $('.certificateType').addClass('flash');
                            setTimeout(() => {
                                $('.certificateType').removeClass('flash');
                            }, 1000);
                            break;
                    }
                    return false;
                }
            }



            if (!edit) {
                if (tt.editInfoObj['editArr'][tt.skillObj.type ? 'ski' : 'lng']) {

                    tt.editInfoObj['editArr'][tt.skillObj.type ? 'ski' : 'lng'].push(obj);
                } else {
                    tt.editInfoObj['editArr'][tt.skillObj.type ? 'ski' : 'lng'] = [obj]
                }
            } else {
                tt.editInfoObj['editArr'][tt.skillObj.type ? 'ski' : 'lng'][tt.editInfoObj.editInd] = JSON.parse(JSON.stringify(obj))
            }

            let param = [];
            param.push('columns=skill')
            param.push('skill=' + JSON.stringify(tt.editInfoObj.editArr))
            tt.submitData(5, param)

        },

        // 教育 添加
        addEduJl() {
            const tt = this;
            if (tt.editInfoObj.edit) {
                    switch (tt.editInfoObj.editType) {
                        case 1: {
                            for (item in tt.form) {
                                if (item == 'birth') {
                                    tt.currResume[item] = tt.currResume[item] * 1000
                                };
                                if (tt.form[item] != tt.currResume[item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                            break;
                        }
                        case 2: {
                            for (item in tt.form) {
                                if (item == 'birth') {
                                    tt.currResume[item] = tt.currResume[item] * 1000
                                };
                                if (tt.form[item] != tt.currResume[item]) {
                                    tt.editInfoObj.editTip = true;
                                    return
                                };
                            };
                            break;
                        }
                        case 3: {
                            if (tt.editInfoObj.editInd == tt.currResume.work_jl.length) { //添加信息
                                for (item in tt.workjl) {
                                    if (Boolean(tt.workjl[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.workjl) {
                                    if (tt.workjl[item] != tt.currResume.work_jl[tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 4: {
                            if (tt.editInfoObj.editInd == tt.currResume.education.length) { //添加信息
                                for (item in tt.educationJl) {
                                    if (Boolean(tt.educationJl[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.educationJl) {
                                    if (tt.educationJl[item] != tt.currResume.education[tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 5: {
                            let operateKey;
                            if (tt.editInfoObj.editKey == 'lng') {//语言
                                operateKey = 'lng';
                            } else { //技能
                                operateKey = 'ski';
                            };
                            if ((!tt.currResume.skill.ski && !tt.currResume.skill.lng) || (tt.editInfoObj.editInd == tt.currResume.skill[operateKey].length)) { //添加信息
                                for (item in tt.skillObj) {
                                    if (Boolean(tt.skillObj[item])) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            } else { //编辑信息
                                for (item in tt.skillObj) {
                                    if (tt.skillObj[item] != tt.currResume.skill[operateKey][tt.editInfoObj.editInd][item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                };
                            }
                            break;
                        }
                        case 6: {
                            for (item in tt.editInfoObj['editArr']) {
                                if (item == 'ad_tag') {
                                    for (let i = 0; i < tt.editInfoObj['editArr'][item].length; i++) {
                                        if (tt.editInfoObj['editArr'][item][i] != tt.currResume[item][i]) {
                                            tt.editInfoObj.editTip = true;
                                            return
                                        }
                                    }
                                } else {
                                    if (tt.editInfoObj['editArr'][item] != tt.currResume[item]) {
                                        tt.editInfoObj.editTip = true;
                                        return
                                    };
                                }
                            };
                            break;
                        }
                    }
            } else {
                tt.editInfoObj.editTip = false;
            };
            tt.exitWarnb = true;
            let stop = false;
            for (let i = 0; i < tt.educationJlArr.length; i++) {
                const obj_edu = tt.educationJlArr[i];
                for (let item in obj_edu) {
                    if (!obj_edu[item] && item != 'xl') {
                        stop = true;
                        switch (item) {
                            case 'xl_id':
                                $('.highestEdu .el-input__inner').addClass('flash');
                                setTimeout(() => {
                                    $('.highestEdu .el-input__inner').removeClass('flash');
                                }, 1000);
                                break;

                            case 'start':
                                $('.goSchoolTime .el-input__inner').addClass('flash');
                                setTimeout(() => {
                                    $('.goSchoolTime .el-input__inner').removeClass('flash');
                                }, 1000);
                                break;

                            case 'end':
                                $('.leaveSchoolTime .el-input__inner').addClass('flash');
                                setTimeout(() => {
                                    $('.leaveSchoolTime .el-input__inner').removeClass('flash');
                                }, 1000);
                                break;

                            case 'school':
                                $('.schoolName').addClass('flash');
                                setTimeout(() => {
                                    $('.schoolName').removeClass('flash');
                                }, 1000);
                                break;
                            // case 'zy':
                            //     $('.learnMajor').addClass('flash');
                            //     setTimeout(() => {
                            //         $('.learnMajor').removeClass('flash');
                            //     }, 1000);
                            //     break;
                        }
                        break;
                    }
                }

                if (stop) return false;
            }


            tt.educationJlArr.push({
                xl: '', //学历
                xl_id: '', //学历id
                start: '', //入学时间
                end: '', //毕业时间
                zy: '', //专业
                school: '', //学校
            })
        },

        // 教育删除
        removeEduJl(ind) {
            const tt = this;
            // tt.popConfirm.show = true;
            // tt.popConfirm.title ='确认删除改学习经历'

            // tt.popConfirm.tip = '<span class="error">此操作不可恢复，请谨慎操作！</span>'
            // tt.popConfirm.btns = [{
            //     text:'取消',
            //     bgColor:'#F2F2F2',
            //     type:'cancel',
            //     fn:function(){
            //         tt.popConfirm.show = false;
            //     }
            // },{
            //     text:'确定删除',
            //     type:'sure',
            //     bgColor:'#FD687A',
            //     fn:function(){
            //         tt.educationJlArr.splice(ind,1);
            //         tt.popConfirm.show = false;
            //     }
            // }]
            tt.educationJlArr.splice(ind, 1);
        },

        // 跳只下一步
        skipToNext(step, skip) {
            const tt = this;
            if (skip) {
                tt.createResumeStep = step;
                tt.workjl = {
                    company: '', //公司名称
                    work_start: '', //入职时间
                    work_end: '', //离职时间
                    content: '', //工作内容
                    job: '', //担任职位
                    jobid: [], //担任职位id
                    department: '', //部门
                };
                return
            }
            let param = [];
            if (step === 2) { //基本信息，意向职位
                param.push('columns=basicPc');
                const checkArr = ['photo', 'name', 'sex', 'birth', 'phone', 'identify', 'work_jy', 'job', 'nature', 'type', 'workState', 'min_salary', 'max_salary', 'startWork', 'addr']
                for (var item in tt.form) {
                    if (checkArr.includes(item) && (tt.form[item] === '' || (Array.isArray(tt.form[item]) && tt.form[item].length == 0))) {
                        const ind = checkArr.indexOf(item);
                        switch (ind) {
                            case 0://头像上传
                                $('.uploadBtn.photo').addClass('flashphoto');
                                setTimeout(() => {
                                    $('.uploadBtn.photo').removeClass('flashphoto');
                                }, 1000);
                                break;
                            case 1://姓名
                                $('.chineseName').addClass('flash warnPlace');
                                setTimeout(() => {
                                    $('.chineseName').removeClass('flash warnPlace');
                                }, 1000);
                                break;
                            case 2:
                                tip = '请先选择性别'
                                break;
                            case 3://出生年月
                                $('.birthDay .el-input__inner').addClass('flash warnPlace');
                                setTimeout(() => {
                                    $('.birthDay .el-input__inner').removeClass('flash warnPlace');
                                }, 1000);
                                break;
                            case 4://电话号码
                                $('.phoneNumber').addClass('flash warnPlace');
                                setTimeout(() => {
                                    $('.phoneNumber').removeClass('flash warnPlace');
                                }, 1000);
                                break;
                            case 5://身份类别
                                $('.identifyType .el-input__inner').addClass('flash warnPlace');
                                setTimeout(() => {
                                    $('.identifyType .el-input__inner').removeClass('flash warnPlace');
                                }, 1000);
                                break;
                            case 6://工作经验
                                $('.workExperience .el-input__inner').addClass('flash warnPlace');
                                setTimeout(() => {
                                    $('.workExperience .el-input__inner').removeClass('flash warnPlace');
                                }, 1000);
                                break;
                            case 7://期望职位
                                $('.expectJob').addClass('flash warnPlace');
                                setTimeout(() => {
                                    $('.expectJob').removeClass('flash warnPlace');
                                }, 1000);
                                break;
                            case 8:
                                tip = '请先选择工作性质'
                                break;
                            case 9:///期望行业
                                $('.expectIndustry').addClass('flash warnPlace');
                                setTimeout(() => {
                                    $('.expectIndustry').removeClass('flash warnPlace');
                                }, 1000);
                                break;
                            case 10://求职状态
                                $('.jobState .el-input__inner').addClass('flash warnPlace');
                                setTimeout(() => {
                                    $('.jobState .el-input__inner').removeClass('flash warnPlace');
                                }, 1000);
                                break;
                            case 11://最低薪资
                                $('.minSalary .el-input__inner').addClass('flash warnPlace');
                                setTimeout(() => {
                                    $('.minSalary .el-input__inner').removeClass('flash warnPlace');
                                }, 1000);
                                break;
                            case 12://最高薪资
                                $('.maxSalary .el-input__inner').addClass('flash warnPlace');
                                setTimeout(() => {
                                    $('.maxSalary .el-input__inner').removeClass('flash warnPlace');
                                }, 1000);
                                break;
                            case 13://到岗时间
                                $('.workTimeStart .el-input__inner').addClass('flash warnPlace');
                                setTimeout(() => {
                                    $('.workTimeStart .el-input__inner').removeClass('flash warnPlace');
                                }, 1000);
                                break;
                            case 14://期望地点
                                $('.addrBox .el-input__inner').addClass('flash warnPlace');
                                setTimeout(() => {
                                    $('.addrBox .el-input__inner').removeClass('flash warnPlace');
                                }, 1000);
                                break;
                        };
                        this.emptyIndex = ind;
                        return false;
                    }
                    if (item != 'birth') {
                        param.push(item + '=' + tt.form[item]);
                    } else {
                        param.push(item + '=' + parseInt(tt.form[item] / 1000));
                    }
                }
                param.push('work_jl_none=1'); //无工作经历
                // tt.createResumeStep = tt.form.work_jy ? step : 3; //如果没有经验 则跳转学历
            } else if (step == 3) { //工作经历
                param.push('columns=work_jl');
                param.push(`id=${tt.form.id}`);
                let stop = false;
                for (let item in tt.workjl) {
                    if (['department', 'content'].indexOf(item) <= -1 && !tt.workjl[item]) {
                        switch (item) {
                            case 'company': //公司名称
                                $('.comName').addClass('flash warnPlace');
                                setTimeout(() => {
                                    $('.comName').removeClass('flash warnPlace');
                                }, 1000);
                                break;
                            case 'work_start': //工作开始时间
                                $('.workTimeS .el-input__inner').addClass('flash warnPlace');
                                setTimeout(() => {
                                    $('.workTimeS .el-input__inner').removeClass('flash warnPlace');
                                }, 1000);
                                break;
                            case 'work_end': //工作结束时间
                                $('.workTimeE .el-input__inner').addClass('flash warnPlace');
                                setTimeout(() => {
                                    $('.workTimeE .el-input__inner').removeClass('flash warnPlace');
                                }, 1000);
                                break;
                            case 'job': //担任职位
                                $('.undertakeJob').addClass('flash warnPlace');
                                setTimeout(() => {
                                    $('.undertakeJob').removeClass('flash warnPlace');
                                }, 1000);
                                break;
                        }
                        this.emptyIndex = item;
                        stop = true;
                        break;
                    }
                };
                if (stop) return false;
                param.push('work_jl=' + JSON.stringify([tt.workjl]));
            } else if (step == 4) { //教育背景
                param.push('columns=education');
                param.push(`id=${tt.form.id}`);
                let stop = false;
                for (var i = 0; i < tt.educationJlArr.length; i++) {
                    const educationJl = tt.educationJlArr[i];

                    let empty = 0;
                    for (item in educationJl) {
                        if (!Boolean(educationJl[item]) && educationJl[item] !== 0) {
                            empty++;
                        }
                    };
                    if (empty == 6 && tt.educationJlArr.length != 1) { //新增学历的，但是未填内容，直接跳过验证
                        tt.educationJlArr.splice(i, 1)
                        break;
                    };

                    for (item in educationJl) {
                        if (item == 'xl_id') {
                            for (let m = 0; m < tt.baseConfig['education'].length; m++) {
                                if (tt.baseConfig['education'][m].id == educationJl[item]) {
                                    tt.educationJlArr[i]['xl'] = tt.baseConfig['education'][m].typename
                                    break;
                                }
                            }
                        }
                        if (!educationJl[item] && item != 'zy') {
                            switch (item) {
                                case 'xl_id':
                                    $('.highestEdu .el-input__inner').addClass('flash warnPlace');
                                    setTimeout(() => {
                                        $('.highestEdu .el-input__inner').removeClass('flash warnPlace');
                                    }, 1000);
                                    break;

                                case 'start':
                                    $('.goSchoolTime .el-input__inner').addClass('flash warnPlace');
                                    setTimeout(() => {
                                        $('.goSchoolTime .el-input__inner').removeClass('flash warnPlace');
                                    }, 1000);
                                    break;

                                case 'end':
                                    $('.leaveSchoolTime .el-input__inner').addClass('flash warnPlace');
                                    setTimeout(() => {
                                        $('.leaveSchoolTime .el-input__inner').removeClass('flash warnPlace');
                                    }, 1000);
                                    break;

                                case 'school':
                                    $('.schoolName').addClass('flash warnPlace');
                                    setTimeout(() => {
                                        $('.schoolName').removeClass('flash warnPlace');
                                    }, 1000);
                                    break;
                            }
                            this.emptyIndex = item;
                            stop = true;
                            return false;
                        };

                    }
                    if (stop) return false;

                }
                param.push('education=' + JSON.stringify(tt.educationJlArr));
            };
            // tt.createResumeForm = tt.createResumeForm.concat(JSON.parse(JSON.stringify(param)));
            tt.nextb = true;
            tt.submitData('', param, function (data) {
                // 关闭投递弹窗
                if (data.state == 100) {
                    if (step == 4) {
                        setTimeout(() => {
                            location.reload();
                        }, 1500);
                    }
                } else {
                    tt.showErrAlert(data.info)
                };
                tt.nextb = false;
                if (step != 4) {
                    tt.createResumeStep = step; //如果没有经验 则跳转学历
                }
            })


        },


        /*********************************简历列表相关 e****************************/

        // 创建简历时是否删除
        copyInfo(item) {
            if (item.id == 2) return false;
            var tt = this;
            if (tt.copyInfoArr.includes(item.id)) {
                tt.copyInfoArr.splice(tt.copyInfoArr.indexOf(item.id), 1)
            } else {
                tt.copyInfoArr.push(item.id)
            }
        },

        // 创建新简历
        createResume() {
            var tt = this;
            if (tt.setForm.alias == '') {
                tt.setForm.alias = '简历' + (tt.resumeList.length + 1);
            }

            if (tt.resumeSetType === 'alias') { //修改简历名称
                var or_name = tt.currResume.alias;
                tt.currResume.alias = tt.setForm.alias;
                let param = ['columns=alias'];
                param.push('id=' + tt.currResume.id)
                param.push('alias=' + tt.setForm.alias)
                tt.submitData('', param, function (data) {
                    if (data.state == 100) {
                        tt.resumeSetPop = false;
                    }
                });
                return false;
            }

            tt.popConfirm.width = 360;
            tt.popConfirm.height = 210;
            tt.popConfirm.cls = 'sucessCreate';
            tt.popConfirm.title = '<s></s>简历创建成功'
            tt.popConfirm.tip = '继续完善简历信息可提升求职效果！';
            tt.popConfirm.closeFn = function () {
                tt.popConfirm.width = 0;
                tt.popConfirm.height = 0;
                tt.popConfirm.cls = '';
            };
            tt.popConfirm.btns = [{
                text: '好的,知道了',
                type: 'sure',
                bgColor: '#3377FF',
                fn: function () {
                    tt.popConfirm.cls = '';
                    tt.popConfirm.width = 0;
                    tt.popConfirm.height = 0;
                    tt.popConfirm.show = false;
                }
            }];
            if (tt.ajaxb) { return }
            tt.ajaxb = true;
            $.ajax({
                url: '/include/ajax.php?service=job&action=copyNewResume&name=' + tt.setForm.alias + '&columns=' + tt.copyInfoArr.join(',') + '&cityid=' + cityid,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        tt.popConfirm.show = true;
                        tt.resumeSetPop = false;
                        tt.getResumeList(data.aid);
                        tt.setForm.alias = '';
                    }
                    tt.ajaxb = false;
                },
                error: function () {
                    tt.ajaxb = false;
                }
            });

        },

        // 设置简历公开
        setPrivate() {
            const tt = this;

            $.ajax({
                url: '/include/ajax.php?service=job&action=setResumePrivate&private=' + tt.setForm.private,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        tt.resumeSetPop = false;
                        for (var i = 0; i < tt.resumeList.length; i++) {
                            tt.resumeList[i].private = tt.setForm.private
                        }
                        tt.showErrAlert('设置成功')
                    }
                },
                error: function () {

                }
            });
        },


        // 删除当前简历
        delResume() {
            const tt = this;
            tt.popConfirm.show = true;
            tt.popConfirm.title = '确认删除该份简历'
            tt.popConfirm.tip = tt.currResume.currentDelivery ? '<span class="error">你近期投递过这份简历，删除后招聘方将无法查阅</span>' : '<span class="error">此操作不可恢复，请谨慎操作！</span>'
            tt.popConfirm.btns = [{
                text: '取消',
                bgColor: '#F2F2F2',
                type: 'cancel',
                fn: function () {
                    tt.popConfirm.show = false;
                }
            }, {
                text: '确定删除',
                type: 'sure',
                bgColor: '#FD687A',
                fn: function () {
                    $.ajax({
                        url: '/include/ajax.php?service=job&action=delResume&id=' + tt.currResume.id,
                        type: "POST",
                        dataType: "json",
                        success: function (data) {
                            if (data.state == 100) {
                                tt.resumeSetPop = false;
                                tt.popConfirm.show = false;
                                for (var i = 0; i < tt.resumeList.length; i++) {
                                    if (tt.resumeList[i].id == tt.currResume.id) {
                                        tt.resumeList.splice(i, 1)
                                        tt.currResume = tt.resumeList[i - 1]
                                        break;
                                    }
                                }
                                tt.showErrAlert('删除成功')
                            }
                        },
                        error: function () {

                        }
                    });
                }
            }]

        },

        // 删除工作经历,教育背景，技术
        removeItem(ind, type) {
            const that = this;
            if(that.defaultResume.work_jl.length==0){
                that.cancelEdit();
                return
            }
            let param = [];
            const arr = {
                skill: '技能',
                education: '教育经历',
                work_jl: '工作经历'
            }
            const tt = this;
            tt.popConfirm.show = true;
            tt.popConfirm.title = type == 'lng' || type == 'ski' ? '确认删除该技能' : '确认删除' + arr[type]

            tt.popConfirm.tip = '<span class="error">删除的内容不可恢复，请谨慎操作！</span>'
            tt.popConfirm.btns = [{
                text: '取消',
                bgColor: '#F2F2F2',
                type: 'cancel',
                fn: function () {
                    tt.popConfirm.show = false;
                }
            }, {
                text: '确定删除',
                type: 'sure',
                bgColor: '#FD687A',
                fn: function () {
                    tt.editInfoObj.editTip = false;
                    if (type == 'lng' || type == 'ski') {
                        param.push('columns=skill')
                        that.editInfoObj.editArr[type].splice(ind, 1)
                        param.push('skill=' + JSON.stringify(that.editInfoObj.editArr))
                    } else {
                        param.push('columns=' + type)
                        that.editInfoObj.editArr.splice(ind, 1)
                        param.push(type + '=' + JSON.stringify(that.editInfoObj.editArr))
                    }
                    tt.popConfirm.show = false;
                    that.submitData('', param)
                }
            }]





        },
        addSlefDefine(state) {
            const that = this;
            if (that.editInfoObj['editArr']['ad_tag'] && that.editInfoObj['editArr']['ad_tag'].length >= 3) {
                that.showErrAlert('最多选择3个标签')
                return false;
            }
            that.selfLabShow = true;
        },

        // 设置默认简历
        setResumeDefault(resume) {
            var tt = this;
            $.ajax({
                url: '/include/ajax.php?service=job&action=setDefaultResume&id=' + resume.id,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        tt.showErrAlert('设置成功！')
                        tt.getResumeList(resume.id);
                    }
                },
                error: function () {

                }
            });
        },



        // 升级简历相关

        // 刷新简历
        refreshResume() {
            const that = this;

            if (that.refreshFree > 0) {
                $.ajax({
                    type: "POST",
                    url: "/include/ajax.php",
                    dataType: "json",
                    data: {
                        'service': 'siteConfig',
                        'action': 'freeRefresh',
                        'module': 'job',
                        'act': 'resume',
                        // 'temp':'resume',
                        'aid': that.currResume.id
                    },
                    success: function (data) {
                        if (data.state == 100) {
                            that.showErrAlert('刷新成功');
                            that.refreshFree = that.refreshFree - 1;
                        } else {
                            that.showErrAlert(data.info)
                        }
                    },
                    error: function () {
                        that.showErrAlert('网络错误，请稍后再试')
                    }
                })
            } else {
                that.showResumeUpdatePop(0)
            }
        },


        // 转换时间
        timeTransTime(timeStr, type) {
            const dateTime = new Date(timeStr * 1000)
            const hour = dateTime.getHours();
            const minutes = dateTime.getMinutes();
            let str = (hour > 9 ? hour : '0' + hour) + ':' + (minutes > 9 ? minutes : '0' + minutes)
            if (type == 1) {
                const curr = parseInt(new Date().valueOf() / 1000);
                const offTime = timeStr - curr;
                if (offTime <= 0) {
                    str = 0
                } else {
                    str = Math.ceil(offTime / 86400)
                }
            }
            return str
        },

        // 获取增值包
        getPackageList() {
            const that = this;
            if (that.refresh_tc.length || that.top_tc.length || that.delivery_tc.length) return false;
            $.ajax({
                type: "POST",
                url: "/include/ajax.php",
                dataType: "json",
                data: {
                    'service': 'siteConfig',
                    'action': 'refreshTopConfig',
                    'module': 'job',
                    'act': 'detail',
                    'userid': userid_, //用户id
                },
                success: function (data) {
                    if (data && data.state == 100) {
                        that.refreshFree = data.info.config.refreshFreeTimes - data.info.memberFreeCount;
                        var refreshSmart = data.info.config.refreshSmart;
                        // 投递套餐
                        that.refresh_tc = [];
                        that.normalRefreshPice = data.info.config.refreshNormalPrice
                        refreshSmart.forEach(function (val) {
                            that.refresh_tc.push({
                                days: val.day, //刷新天数
                                unit: val.unit, //单价
                                countPrice: val.price, //计价
                                fresh: val.times, //每日刷新次数
                                offer: val.offer, //优惠价格
                                rec: val.rec
                            })
                        })


                        // 置顶透彻
                        var topNormal = data.info.config.topNormal;
                        that.top_tc = [];
                        topNormal.forEach(function (val) {
                            that.top_tc.push({
                                days: val.day, //置顶天数
                                unit: val.price, //单价
                                countPrice: val.price, //计价
                                offer: val.offer, //优惠价格
                                rec: val.rec
                            })
                        })

                        var deliveryTop = data.info.config.deliveryTop;
                        // deliveryTop.forEach(val => {
                        //     that.delivery_tc.push({

                        //     })
                        // })
                        that.delivery_tc = deliveryTop

                    }
                }
            })
        },


        // 显示简历升级弹窗
        showResumeUpdatePop(type) {
            const that = this;
            if (type == undefined || type == that.resumeTabOn) {
                that.resumeUpDatePop = true;
            } else {
                that.resumeTabOn = type; // 续费
            }
            that.getPayInfo(); //获取请求数据
        },


        // 请求支付数据
        getPayInfo(payPop) {
            const that = this;
            that.payload = true;
            const optArr = ['smartRefresh', 'topping', 'deliveryTop']
            $.ajax({
                url: '/include/ajax.php?service=siteConfig&action=refreshTop&type=' + optArr[that.resumeTabOn] + '&module=job&act=resume&aid=' + that.currResume.id + '&amount=&config=' + that.currTcIndex,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        that.payload = false;
                        var datainfo = [];
                        for (var k in data.info) {
                            datainfo.push(k + '=' + data.info[k]);
                        }
                        var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
                        that.payForm.paySrc = masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src)
                        that.payForm.payCount = data.info.order_amount; //价格

                        that.payObj = data.info;
                        if (payPop) {
                            that.changePayWay(payPop)
                        }

                        // 验证是否支付成功
                        clearInterval(checkPayResultDirect);
                        that.checkPaySuccess(data.info.ordernum);
                        $('#refreshTopForm input[name="act"]').val('deliveryTop')
                        $('#refreshTopForm input[name="config"]').val(that.currTcIndex)
                        $('#refreshTopForm input[name="amount"]').val(data.info.amount)
                        $('#refreshTopForm input[name="aid"]').val(that.currResume.id)
                        $('#refreshTopForm input[name="type"]').val(optArr[that.resumeTabOn])
                        // 支付成功之后的回调函数
                        callBack_fun_success = function () {
                            var success_tit = '';
                            var success_tip = '';
                            if (optArr[that.resumeTabOn] == 'smartRefresh') {  //智能刷新
                                success_tit = '智能刷新设置成功！'
                                const currTime = new Date()
                                const hour = currTime.getHours();
                                if (hour >= 8 && hour < 20) {
                                    success_tip = '已刷新第一次，好工作即将赶来！'
                                } else {
                                    success_tip = '明日8:00刷新第一次，好工作即将赶来！'

                                }
                                if (that.currResume.refreshBegan != '0') {
                                    success_tip = '';
                                    success_tit = '续费成功！'
                                }
                            } else if (optArr[that.resumeTabOn] == 'topping') { //简历置顶
                                success_tit = '简历置顶成功！'
                                success_tip = '正在推荐简历给更多HR，注意查收好消息！'

                                if (that.currResume.bid_end != '0') {
                                    success_tip = '';
                                    success_tit = '续费成功！'
                                }

                            } else if (optArr[that.resumeTabOn] == 'deliveryTop') {  //投递置顶
                                success_tit = '购买成功！'
                                success_tip = '快去投递简历使用吧'
                            }
                            that.successPop.title = success_tit;
                            that.successPop.tip = success_tip;
                            that.resumeUpDatePop = false;
                            that.successPop.show = true;
                            if (!that.successPop.tip) {
                                setTimeout(() => {
                                    that.successPop.show = false;
                                }, 2000);
                            }
                            that.getResumeList();
                        }
                    }
                },
                error: function () { }
            });
        },

        // 修改支付方式 ===> 弹出支付层
        changePayWay(payPop) {
            var tt = this;
            if (!tt.payObj) return false; //没有支付信息  不能调起支付弹窗
            var info = tt.payObj;
            // clearInterval(checkPayResult)
            if (!payPop) {

                $('.pay_balance').click(); //默认使用余额支付
            }
            orderurl = info.orderurl;
            if (typeof (info) != 'object') {
                location.href = info;
                return false;
            }

            cutDown = setInterval(function () {
                $(".payCutDown").html(payCutDown(info.timeout));
            }, 1000)

            var datainfo = [];
            for (var k in info) {
                datainfo.push(k + '=' + info[k]);
            }
            $("#amout").text(info.order_amount);
            $('.payMask').show();
            $('.payPop').show();
            if (usermoney * 1 < info.order_amount * 1) {
                $("#moneyinfo").text('余额不足，');
            } else {
                $("#moneyinfo").text('剩余');

            }

            if (monBonus * 1 < info.order_amount * 1 && bonus * 1 >= info.order_amount * 1) {
                $("#bonusinfo").text('额度不足，可用');
                $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
            } else if (bonus * 1 < info.order_amount * 1) {
                $("#bonusinfo").text('余额不足，');
                $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
            } else {
                $("#bonusinfo").text('');
                $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
            }
            ordernum = info.ordernum;
            order_amount = info.order_amount;
            $("#ordertype").val('refreshTop');
            $("#service").val('siteConfig');
            service = 'job';
            var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
            $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));



            // 验证是否支付成功
            clearInterval(checkPayResult);
            checkTradeResult(tt.payObj.ordernum)
        },


        // 验证是否支付成功
        checkPaySuccess(ordernum) {

            checkPayResultDirect = setInterval(function () {

                $.ajax({
                    type: 'POST',
                    async: false,
                    url: '/include/ajax.php?service=member&action=tradePayResult&order=' + ordernum,
                    dataType: 'json',
                    success: function (str) {
                        if (str.state == 100 && str.info != "") {
                            //如果已经支付成功，则跳转到会员中心页面
                            clearInterval(checkPayResultDirect)
                            $('.payMask,.payPop').hide();
                            if (callBack_fun_success) {
                                callBack_fun_success()
                            }
                        }
                    }
                });

            }, 2000);
        },

        // 查看之前的步骤
        skipStep(ind) {
            const that = this;
            if (that.createResumeStep >= ind + 1) {
                that.currStep = that.createResumeStep;
                that.createResumeStep = ind + 1
            } else if (that.currStep >= ind + 1) {
                that.createResumeStep = that.currStep
            }
        },
        // 输入验证
        checkInput(state) {
            if (state == 1) { //中文验证

            }
        },

        checkCount(e) {
            this.countText = $(event.currentTarget).val().length
        }
    },

    watch: {
        'form.addr_list': function (val) {
            if (val) {
                if (val[val.length - 1] != -1) {
                    this.form.addr = val[val.length - 1];
                } else {
                    this.form.addr = val[val.length - 2];
                }
            }
        },
        // 身份监听
        'form.identify':function(val){
            let tt=this;
            if(val==1){ //职场人士
                tt.form.workState=1;
            }else{
                tt.form.workState=5;
            }
        },
        // 手机区号选择
        showAreaCodePop(val) {
            const tt = this;
            if (val) {
                $(document).one('click', function (e) {
                    tt.showAreaCodePop = false;
                })
            }
        },

        // 职位弹窗
        postCategoryPop: function (val) {
            var tt = this;
            if (val) {
                if (tt.singleChose) {  //工作经历 --- > 
                    tt.currChosePost = tt.workjl.jobid && tt.workjl.jobid.length ? [tt.workjl.jobid[tt.workjl.jobid.length - 1]] : [];
                    tt.currChosePostText = [tt.workjl.job]
                } else {

                    tt.currChosePost = JSON.parse(JSON.stringify(tt.form.job));
                    tt.currChosePostText = JSON.parse(JSON.stringify(tt.form.job_name)); //当前选择的职位 ---> 文字
                }
            }

        },

        industryCategoryPop: function (val) {
            var tt = this;
            if (val) {
                tt.currChoseIndustry = JSON.parse(JSON.stringify(tt.form.type));
                tt.currChoseIndustryText = JSON.parse(JSON.stringify(tt.form.type_name)); //当前选择的职位 ---> 文字
            }
        },

        editInfoObj: {
            deep: true,
            handler: function (nval, oval) {
                const tt = this;
                if (nval['edit'] && nval['editType'] == 2) { //意向职位开始编辑
                    if (!tt.categoryList || tt.categoryList.length == 0) {

                        tt.getCategoryList(); //获取职位分类
                    }
                    if (!tt.categoryList_industry || tt.categoryList_industry.length == 0) {

                        tt.getIndustryList(); //获取职位分类
                    }
                }
            }
        },

        // 当前展示简历变化时，隐藏编辑框
        'currResume.id': function (val) {
            const that = this;
            that.editInfoObj.edit = false;
        },

        resumeSetPop(val) {
            if (val) {
                $('html').addClass('noscroll')
            } else {
                $('html').removeClass('noscroll')
            }
        },

        // 刷新置顶
        refresh_tc: function (val) {
            const that = this;
            if (val.length) {
                that.$nextTick(() => {
                    if (swiper) {
                        swiper.update(1)
                    } else {
                        swiper = new Swiper(".refreshTC .swiper-container", {
                            slidesPerView: 'auto',
                            // spaceBetween: 30,
                            navigation: {
                                nextEl: ".refreshTC .next",
                                prevEl: ".refreshTC .prev",
                            },
                        });
                    }
                })
            }
        },

        // 选择的套餐发生改变
        currTcIndex(val) {
            const that = this;
            if (that.payCodeSupport) {
                that.getPayInfo();
            }
        },


        // 选择的类型发生改变
        resumeTabOn(val) {
            const that = this;
            const arr = ['refresh_tc', 'top_tc', 'delivery_tc'];
            that.resumeUpDatePop = true;
            if (that[arr[val]].length) {
                that.payForm.payCount = val !== 2 ? that[arr[val]][0].countPrice : that[arr[val]][0].price;
                if (that.payCodeSupport) {
                    that.getPayInfo();
                }
            }

        },

        // 显示弹窗
        resumeUpDatePop(val) {
            const that = this;
            if (val) {
                that.getPackageList();
                that.$nextTick(() => {
                    setTimeout(() => {
                        swiper = new Swiper(".refreshTC .swiper-container", {
                            slidesPerView: 'auto',
                            navigation: {
                                nextEl: ".refreshTC .next",
                                prevEl: ".refreshTC .prev",
                            },
                        });

                    }, 500);
                })
            } else {
                swiper.destroy(false);
                clearInterval(checkPayResultDirect);  //清除验证支付是否成功的定时器
            }
        },

        'educationJl.end': function (val) {
            const that = this;
            if (val) {
                let start = new Date(that.educationJl.start).valueOf();
                let end = new Date(val).valueOf()
                if (start >= end) {
                    that.educationJl.start = ''
                }
            }
        },
        'educationJl.start': function (val) {
            const that = this;
            if (val) {
                let start = new Date(val).valueOf();
                let end = new Date(that.educationJl.end).valueOf()
                if (start >= end) {
                    that.educationJl.end = ''
                }
            }
        },

        'educationJlArr': {
            handler: function (eduArr) {
                const that = this;
                for (let i = 0; i < eduArr.length; i++) {
                    if (eduArr[i].start && eduArr[i].end) {
                        let start = new Date(eduArr[i].start).valueOf();
                        let end = new Date(eduArr[i].end).valueOf();
                        if (start > end) {
                            that['educationJlArr'][i].end = ''
                            break;
                        }
                    }
                }
            },
            deep: true,

        },
        'educationJlArr.start': function (val) {
            const that = this;
            if (val) {
                let start = new Date(val).valueOf();
                let end = new Date(that.educationJlArr.end).valueOf()
                if (start >= end) {
                    that.educationJlArr.end = ''
                }
            }
        },
        'educationJlArr.end': function (val) {
            const that = this;
            if (val) {
                let start = new Date(that.educationJlArr.start).valueOf();
                let end = new Date(val).valueOf()
                if (start >= end) {
                    that.educationJlArr.start = ''
                }
            }
        },
        'workjl.work_start': function (val) {
            const that = this;
            if (val) {
                let start = new Date(val).valueOf();
                let end = new Date(that.workjl.work_end).valueOf()
                if (start >= end) {
                    that.workjl.work_end = ''
                }
            }
        },
        'workjl.work_end': function (val) {
            const that = this;
            if (val) {
                let start = new Date(that.workjl.work_start).valueOf();
                let end = new Date(val).valueOf()
                if (start >= end) {
                    that.workjl.work_start = ''
                }
            }
        },
        'form.workState': function (val) {
            if (val == 5 || val == 6) { //学生
                this.form.identify = 2;
            } else { //职场人士
                this.form.identify = 1;
            }
        },
        'selfLabShow': function (val) {
            if (val) {
                this.$nextTick(() => {
                    this.$refs.autofocusLabel.focus();
                })
            }
        }
    }
})