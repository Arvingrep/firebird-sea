var pageVue = new Vue({
    el: '#page',
    data() {
        
        var checkReportDay =  (rule, value, callback) => {
            let tip = '';
            if(rule.field == 'reportIntervalDay'){
                tip = '报备有效期'
            }else if(rule.field == 'dealIntervalDay'){
                tip = '带看保护时间'
            }
            if (this.formScheme.reportStartType == '') {
                callback(new Error('请选择'+ tip +'开始阶段'));
            }else if (value === '') {
                callback(new Error('请输入' + tip));
            } else if(isNaN(value)){
                callback(new Error(tip + '必须为数字'));
            }else{
                callback();
            }
        }
        return {
            showPop: false,
            navList: navList,
            currid: currid,
            hoverid: "",
    
    
            formScheme:{
                peopleDistributor:1, //是否开启全民分销 1 => 开启 0 => 关闭
                commissionFee:'',
                commissionType:1, //佣金类型 1 => 佣金比例 2 => 固定金额
                title:'', //标题
                commissionNote:'', //佣金说明
                endTime:'', //分销活动截止时间
                reportWaitTime:'', //报备等待时间
                reportStartType:'', //报备有效期开始阶段 1-从报备提交开始计算 2-从客户到访后开始计算 3-从报备审核通过开始计算
                reportIntervalDay:'', //到超出有效期未带看，报备无效，中间天数
                dealStartType:'', //成交有效期开始阶段 1-从报备提交开始计算 2-从客户到访后开始计算 3-从报备审核通过开始计算
                dealIntervalDay:'', //到超出有效期未成交或认购，报备无效，中间天数
                reportPhoneType:1, //报备号码类型 1-前3后4 2-全号
                uploadCert:0, //成交更新权限   分销公司上传成交认购资料的权限：0-无 1-有
                reportVisitNote:'', //带看说明
                reportTips:'', //注意说明
                reportUid:'', //报备联系人id，多个id使用英文逗号分隔 取值使用楼盘营销团队用户表的id
            },
            pickerOptions: {
                disabledDate(time) {
                  return time.getTime() < Date.now();
                },
            },
            rules: {
                commissionFee: [
                    { required: true, message: '请设置佣金'},
                ],
                commissionNote: [
                    { required: true, message: '请输入佣金说明'},
                ],
                endTime: [
                    { required:true,type: '', message: '请选择分销截止时间', trigger: 'change' }
                ],
                reportWaitTime: [
                    { required: true, message: '请填写报备等待时间',trigger:'blur'},
                    { type: 'number', message: '报备等待时间必须为数字',trigger:'blur'}
                ],
                reportIntervalDay: [
                    { validator: checkReportDay, trigger: 'blur' },
                    // { required: true, message: '请填写报备等待时间',trigger: 'blur' },
                    // { type: 'number', message: '报备等待时间必须为数字',trigger: 'blur'}
                ],
                dealIntervalDay: [
                    { validator: checkReportDay, trigger: 'blur' },
                ],
            },
            reportOptions:  [
                {value: 1, label: '从报备提交开始计算'},
                {value: 3, label: '从报备审核通过开始计算'},
            ],
            dealOptions:  [
                {value: 2, label: '从客户到访后开始计算'},
                {value: 3, label: '从报备审核通过开始计算'},
            ],
    
            filterForm:{
                page:1,
                gid:'',
                name:'',
                totalCount:0,
                pageSize:99999,
            },
            showUserArr:[],
            reportUserArr:[], //对象数组
            reportUidArr:[], //id数组
            groupList:[],
            contactList:[],
            showTeamPop:false,
        }
    },
    mounted(){
        const that = this;
        that.getSchemeInfo()
    },
    methods:{
        // 显示切换账户
        show_change: function () {
            $(".change_account").show();
        },
    
        // 隐藏切换账户
        hide_change: function () {
            $(".change_account").hide();
        },

        addMember: function(){
            location.href = './teamManage';
        },

         // 显示弹窗
        showReportUserPop(){
            const that = this;
            that.getGroupList(); //获取职务列表 实际需要弹窗显示时 才调用
            that.getUserList()
            that.showPop = true;
        },
        // 选择报备联系人
        chooseReport(obj,val){
            const that = this;
            if(obj == 'all'){
                if(val){
                    that.reportUserArr = JSON.parse(JSON.stringify(that.contactList));
                    that.reportUidArr = that.contactList.map(item => item.id)
                }else{
                    that.reportUserArr = [];
                    that.reportUidArr = []
                }

            }else{
                if(val){
                    that.reportUserArr.push(obj)
                    that.reportUidArr.push(obj.id)
                }else{
                    that.reportUserArr = that.reportUserArr.filter(data =>{
                        return data.id != obj.id
                    })
                    that.reportUidArr.splice(that.reportUidArr.indexOf(obj.id),1)
                }
            }
        },
        // 清空候选宝贝联系人
        clearReportUser(){
            const that = this;
            that.reportUserArr = []
            that.reportUidArr = []
        },
        // 删除候选报备联系人
        removeUser(obj,ind){
            const that = this
            that.reportUserArr.splice(ind,1)
            that.reportUidArr.splice(that.reportUidArr.indexOf(obj.id),1)
        },

        // 确定报备候选人
        confirmChoose(){
            const that = this
            that.showPop =false;
            that.formScheme.reportUid = that.reportUidArr.join(',')
            that.showUserArr = JSON.parse(JSON.stringify(that.reportUserArr))
        },

        /**
         * 获取职务列表
         */ 
        getGroupList(reload){
            const that = this;
            if(that.groupList && that.groupList.length && !reload) return false; //表示已经加载过
            let url = `/include/ajax.php?service=house&action=route&route=marketing/groupList&lpid=${loupanid}`
            $.ajax({
                url:url,
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        let list = res.info.list
                        if(list.length > 0){
                            list.unshift({id:'',name:'全部职务'})
                            that.groupList = list
                           
                        }
                    }
                }
            })
        },

         // 重新获取联系人列表
         reGetUserList(e){
            const that = this;
            that.getUserList(1)
        },

         // 获取成员列表
         getUserList(){
            const that = this;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/userList&lpid=${loupanid}`
            $.ajax({
                url:url,
                data:that.filterForm,
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        let list = res.info.list
                        if(list.length > 0){
                            that.contactList = list
                        }

                        if(!that.filterForm.gid && that.formScheme.reportUid){
                            let arr_n = []
                            let arr = that.formScheme.reportUid.split(',');
                            for(let i = 0; i < arr.length; i++){
                                let obj = list.find(item => item.id == arr[i])
                                if(obj){
                                    arr_n.push(obj)

                                }
                            }
                            that.showUserArr =  JSON.parse(JSON.stringify(arr_n))
                            that.reportUserArr = arr_n
                        }
                    }else{
                        that.contactList = []
                    }
                }
            })
        },

        // 自动填充 佣金说明
        autoFixNote(val){
            const that = this;
            if(!isNaN(val)){
                that.formScheme.commissionNote = (!that.formScheme.commissionNote ? `分销${val}${that.formScheme.commissionType != 2 ? '%' : echoCurrency('short') + '/套'}` : that.formScheme.commissionNote)
            }
        },

        // 时间选中
        endTimeChange(val){
            console.log(this.formScheme.endTime)
            console.log(val)
        },

         // 保存分销公司配置信息
         saveSchemeInfo(){
            const that = this;
            this.$refs['formScheme'].validate((valid) => {
                if (valid) {
                    let url = `/include/ajax.php?service=house&action=route&route=marketing/saveDistributorScheme&lpid=${loupanid}&type=2`
                    $.ajax({
                        url:url,
                        data:that.formScheme,
                        dataType:'json',
                        success:(res)=>{
                            if(res.state == 100){
                                showErrAlert(res.info,'success');
                            }
                        }
                    })
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
            console.log(that.formScheme)
        },


        // 获取分销配置
        getSchemeInfo(){
            const that = this;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/getDistributorSchemeInfo&lpid=${loupanid}&type=2`
            $.ajax({
                url:url,
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        let list = res.info.list;
                        if(list.length){
                            // that.formScheme = list[0];
                            for(let item in list[0]){
                                that.formScheme[item] = list[0][item]
                            }
                            that.getUserList()
                        }
                    }
                }
            })
        },

        
    }

})