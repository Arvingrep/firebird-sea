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

        return{
            showPop:false,
            navList:navList,
            currid:currid,
            hoverid:'',
            distributorInfo:{}, //分销公司信息
            // 统计数据
            staticsList:{
                total1:{
                    title:'待我审批(条)',
                    icon:'sp_icon.png',
                    isNew:true,
                    count:0
                },
                total2:{
                    title:'本月报备(条)',
                    icon:'bb_icon.png',
                    isNew:false,
                    count:0
                },
                total3:{
                    title:'总报备(条)',
                    icon:'bb_icon.png',
                    isNew:false,
                    count:0
                },
                total4:{
                    title:'本月成交(套)',
                    icon:'cj_icon.png',
                    isNew:false,
                    count:0
                },
                total5:{
                    title:'累计成交(套)',
                    icon:'allcj_icon.png',
                    isNew:false,
                    count:0
                },
                total6:{
                    title:'发放佣金(元)',
                    icon:'yj_icon.png',
                    isNew:false,
                    count:0
                },

            },
            config:{},
    
    
            // tab切换
            currTab:0,
            tabArr: [
                '分销方案',
                '公司设置',
                '报备联系人',
                '报备记录',
                '分销明细',
            ],
    
            formScheme:{
                commissionType:1, // 1 => 按百分比，2 => 固定金额
                commissionFee:'', //佣金类型值 百分比时 不超过100，固定金额时 
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
                isTemplate:0, //是否是模板
            },
            showUserArr:[],
            reportUserArr:[], //对象数组
            reportUidArr:[], //id数组
            rules: {
                commissionFee: [
                    { required: true, message: '请设置佣金'},
                    // { type: 'number', message: '佣金必须为数字'}
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
            pickerOptions: {
                disabledDate(time) {
                  return time.getTime() < Date.now();
                },
            },
            error:{
                name:'',
                onError:false, //显示错误提示框
                tip:'', //错误提示
                button:false, //显示按钮
            },
            formData:{
                logo:'', //logo
                logoUrl:'',
                name:'', //分销公司名称
                shortName:'',//公司简称
                people:'', //负责人
                phone:'', //绑定手机号
                password:'', //密码
                mark:'', //备注
                commission:'', //分销比例
                tax:'', //扣税比例
                grant:grant, //授权
            },
            modelData:null, //模板数据
            rules_form:{
                logo:[
                    { required: true, message: '请上传logo', trigger: 'change' }
                ],
                name:[
                    { required: true, message: '请输入分销公司名称', trigger: 'blur' }
                ],
                people:[
                    { required: true, message: '请填写负责人', trigger: 'blur' }
                ], //负责人
                phone:[
                    { required: true, message: '请填写联系方式', trigger: 'blur' }
                ], //绑定手机号
            },
            contactList:[
               
            ],
            filterForm:{
                page:1,
                gid:'',
                keyword:'',
                totalCount:0,
                pageSize:99999,
            },
    
            groupList:[], //职务列表
            schemeInfo:[], //方案配置信息
            showPop:false, //显示报备联系人弹窗

            showTeamPop:false, //显示新增团队成员弹窗
            error_param:'',
            teamFormData:{
                id:'', //id
                realName:'', //姓名
                phone:'', //手机号
                password:'', //密码
                avatar:'', //头像
                wechat:'', //微信号
                qr:'', //二维码
                sale:0, //是否置业顾问
                view:'', //带看次数
                deal:'',//成交次数
                gid:'', //添加/编辑成员的职务id
            },
            chosedPermission:[],
            qxList:[{ id:1, name:'客户管理' },{ id:2, name:'打印到访单' }],
            fxqxList:[{ id:1, name:'报备审核' },{ id:2, name:'带看审核' },{ id:3, name:'更新成交信息' },{ id:4, name:'成交审核' },{ id:5, name:'提现审核' }],
            distributorData:'', //分销公司
        }

    },
    mounted(){
        const that = this;
        that.checkLeft();
        that.getDistributorCount(); //获取统计数据
        that.getDistributorInfo(); //获取分销公司配置信息
        that.getSchemeInfo(); //获取方案配置信息
        that.getUserList()
        // showErrAlert('已保存！下次可直接使用','success')
        that.getModelData(); //获取模板数据
        $("body").delegate(".linkbtn ", "click", function () {
            that.copyToClipboard();
          });
        that.getDistributionInfo();
    },
    methods:{
          // 显示切换账户
		show_change:function(){
			$(".change_account").show()
		},

		// 隐藏切换账户
		hide_change:function(){
			$(".change_account").hide()
		},

        	// tab下端的线
		checkLeft(val) {
			var that = this;
			var currTab = val ? val : that.currTab;
			var el = $(".tabBox span[data-id='" + currTab + "']");
			var left = 0;
			if (el.length) {
				left = el.position().left + el.innerWidth() / 2 - $(".tabBox s").width() / 2;
			}
			$(".tabBox s").css({
				'transform': 'translateX(' + left + 'px)'
			})
		},

        // 上传图片
        fileChange(e,param){
            const that = this;
            let file = e.target['files'][0];
            if (window.FileReader) {
                var reader = new FileReader();
                reader.readAsDataURL(file); 
                reader.onload = function(e) {
                    var formData = new FormData();
                    let tempPath = this.result;
                    if(param){
                        that.$set(that.teamFormData,`${param}_url`,tempPath)
                    }else{
                        that.formData.logoUrl = tempPath
                    }
                    formData.append("Filedata", file);
                    formData.append("name", file.name);
                    formData.append("lastModifiedDate", file.lastModifiedDate);
                    formData.append("size", file.size);
                    that.uploadImg(formData,param)
                    
                }
            } 
        },

        // 验证当前手机号 是否已注册
        checkPhone(key){
            const that = this;
            if(key == ''){
                that.error.tip = '请填写正确的手机号'
                that.error.onError = true;
                that.error.name = 'phone';
                return false;
            }else { //正则判断手机号是否正确
                var myreg = /^(((13[0-9]{1})|(14[0-9]{1})|(16[0-9]{1})|(19[0-9]{1})|(17[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
                if(!myreg.test(key)){
                    that.error.tip = '请填写正确的手机号'
                    that.error.onError = true;
                    that.error.name = 'phone';
                    return  false
                }else{
                    that.error.tip = ''
                    that.error.onError = false;
                    that.error.name = '';
                }
                
            }
            let url = `/include/ajax.php?service=house&action=route&route=marketing/searchDistributor&keyword=${key}`;
            $.ajax({
                url: url,
                type: "POST",
                dataType: "json",
                success: function(data){
                    if(data.state == 100 && data.info.list && data.info.list.length){
                        that.error.tip = '该账号已注册，请直接邀请绑定'
                        that.error.onError = true;
                        that.error.button = true;
                        that.error.name = 'phone';
                    }
                }
            })
        },

        uploadImg(data,param){
            const that = this;
            $.ajax({
                accepts:{},
                url: '/include/upload.inc.php?mod=siteConfig&type=atlas&filetype=image',
                data: data,
                type: "POST",
                processData: false, // 使数据不做处理
                contentType: false,
                dataType: "json",
                success: function (data) {
                    if(data.state == 'SUCCESS'){
                        let imgPath = data.turl
                        if(param){
                            that.$set(that.teamFormData,param,data.url)
                            that.$set(that.teamFormData,`${param}_url`,data.turl)
                        }else{
                            that.formData.logo = data.url
                            that.formData.logoUrl = imgPath
                        }
                        
                    }else{
                        alert('图片上传失败，请稍后重试');
                        that.formData.logo = ''
                        that.formData.logoUrl = ''
                    }
                },
                error: function () { }
            });
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


        // 获取分销公司统计信息
        getDistributorCount(){
            const that = this;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/distributorCountInfo&lpid=${loupanid}&dcoid=${branchid}`
            $.ajax({
                url:url,
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        for(let item in res.info){
                            that.$set(that.staticsList[item],'count',res.info[item])

                        }
                    }
                }
            })
        },
        // 获取分销公司配置信息
        getDistributorInfo(){
            const that = this;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/getDistributorInfo&lpid=${loupanid}&dcoid=${branchid}`
            $.ajax({
                url:url,
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        that.distributorInfo = res.info.data
                        for(let item in res.info.data){
                            that.$set(that.formData,item,res.info.data[item])
                            
                                
                        }
                    }
                }
            })
        },


        // 确认删除分销公司提示
        confirmDelBranch(){
            const that = this;
            that.$confirm(
                "确定删除 "+ that.distributorInfo.name +" ？<br><span style='color:#FF3419;'>删除后公司信息、对应分销分案不可恢复；历史报备客户记录仍留存</span>",
                "确认删除分销公司",
                {
                    customClass:"confirm-dialog",
                    dangerouslyUseHTMLString: true,
                    confirmButtonText: "确认删除",
                    cancelButtonText: "取消",
                    confirmButtonClass:'confirm_del_btn'
                })
                .then(() => {
                    that.delBranch()
                })
                .catch(() => {
                    console.log("取消了");
                });
        },

        // 删除分销公司
        delBranch(){
            const that = this;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/delDistributor&lpid=${loupanid}&dcoid=${branchid}`
            $.ajax({
                url:url,
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        that.$message({
                            type: "success",
                            message: "删除成功!",
                        });
                    }else{
                        that.$message({
                            type: "info",
                            message: res.info,
                        });
                    }
                }
            })
        },

        /**
         * 更新合作状态
         * @param {number} direct 是否直接更新 
         * */ 
        updateCooperation(direct){
            const that = this;
            if(!direct && (!that.schemeInfo || !that.schemeInfo.length)){
                that.$confirm(
                    "确定暂停 "+ that.distributorInfo.name +" 的分销合作？<br><span style='color:#FF3419;'>此操作将截停对方的所有报备进程</span>",
                    "确认暂停合作？",
                    {
                        customClass:"confirm-dialog",
                        dangerouslyUseHTMLString: true,
                        confirmButtonText: "确认暂停",
                        cancelButtonText: "取消",
                        confirmButtonClass:'confirm_del_btn'
                    })
                    .then(() => {
                        that.updateCooperation(1)
                    })
                    .catch(() => {
                        console.log("取消了");
                    });

                return false

            }

            const loading = this.$loading({
                lock: true,
                text: '状态更新中...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.5)'
              });

            let url = `/include/ajax.php?service=house&action=route&route=marketing/updateCooperation&lpid=${loupanid}&dcoid=${branchid}&status=${that.distributorInfo.status == 1 ? 2 : 1}`
            $.ajax({
                url:url,
                dataType:'json',
                success:(res)=>{
                    loading.close();
                    if(res.state == 100){
                        that.$message({
                            type: "success",
                            message: "更新成功!",
                        });
                        location.reload()
                    }else{
                        that.$message({
                            type: "info",
                            message: res.info,
                        });
                    }
                },
                error:() => {
                    loading.close();
                }
            })
        },

        // 获取分销公司配置信息
        getSchemeInfo(){
            const that = this;
            let url = `/include/ajax.php?service=house&action=route&route=marketing/getDistributorSchemeInfo&lpid=${loupanid}&dcoid=${branchid}&type=1`
            $.ajax({
                url:url,
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        that.schemeInfo = res.info.list
                        for(let item in that.schemeInfo[0]){
                            that.formScheme[item] = that.schemeInfo[0][item]  
                        }
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

        // 保存分销公司配置信息
        saveSchemeInfo(){
            const that = this;
            if(this.$refs['formScheme']){

                this.$refs['formScheme'].validate((valid) => {
                    if (valid) {
                        let url = `/include/ajax.php?service=house&action=route&route=marketing/saveDistributorScheme&lpid=${loupanid}&dcoid=${branchid}&type=1`
                        $.ajax({
                            url:url,
                            data:that.formScheme,
                            dataType:'json',
                            success:(res)=>{
                                if(res.state == 100){
                                    showErrAlert(res.info,'success');
                                }else{
                                    showErrAlert(res.info,'error');
                                }
                            }
                        })
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            }else{
                let url = `/include/ajax.php?service=house&action=route&route=marketing/saveDistributorScheme&lpid=${loupanid}&dcoid=${branchid}&type=1`
                $.ajax({
                    url:url,
                    data:that.formScheme,
                    dataType:'json',
                    success:(res)=>{
                        if(res.state == 100){
                            showErrAlert(res.info,'success');
                        }else{
                            showErrAlert(res.info,'error');
                        }
                    }
                })
            }
            console.log(that.formScheme)
        },

        // 保存分销渠道信息
        submit(){
            const that = this;
            let formData = that.formData;
            if(formData.name == ''){
                that.$message.error('请填写分销组织名称');
                return false;
            }
            if(formData.people == ''){
                that.$message.error('请填写负责人');
                return false;
            }
            if(formData.phone == ''){
                that.$message.error('请填写手机号');
                return false;
            }else if(!(/^1[3456789]\d{9}$/.test(formData.phone))){
                that.$message.error('手机号格式不正确');
                return false;
            }
            let url = `/include/ajax.php?service=house&action=route&route=marketing/saveDistributor&lpid=${loupanid}&dcoid=${branchid}`;
            $.ajax({
                url: url,
                data: that.formData,
                type: "POST",
                dataType: "json",
                success: function(data){
                    that.$refs.formData.clearValidate();
                    if(data.state == 100 ){
                        that.$message({
                            message: '保存成功',
                            type: 'success'
                        })
                        
                    }else{
                        that.$message({
                            message: data.info,
                            type: 'error'
                        })
                        
                    }

                }
            })
        },

        // 显示弹窗
        showReportUserPop(){
            const that = this;
            that.getGroupList(); //获取职务列表 实际需要弹窗显示时 才调用
            // that.getUserList()
            that.showPop = true;
            that.reportUserArr = JSON.parse(JSON.stringify(that.showUserArr))
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

        /****************新增******************/ 
        // 查看权限
        checkPermission(val){
            const that = this;  
            if(!val) return false;
            that.chosedPermission = []
            let obj = that.groupList.find(item => {
                return Number(item.id) == Number(val)
            })
            if(obj.lock * 1){
                that.teamFormData.sale = 1
            }else{
                that.teamFormData.sale = 0
            }
            let permission = obj.permission.split(',') || []
            for(let i=0;i<permission.length;i++){
                let curP = Number(permission[i])
                let ind = that.qxList.findIndex(item => {
                    return item.id == curP
                })
                if(ind != -1){
                    that.chosedPermission.push(that.qxList[ind])
                }
            }
            let mpermission = obj.mpermission.split(',') || []
            for(let i=0;i<mpermission.length;i++){
                let curP = Number(mpermission[i])
                let ind = that.fxqxList.findIndex(item => {
                    return item.id == curP
                })
                if(ind != -1){
                    that.chosedPermission.push(that.fxqxList[ind])
                }
            }
        },

        // 获取权限名称
        checkPermissionName(obj){
            const that = this;
            let permissionArr = []
            let permission = obj.permission.split(',') || []
            for(let i=0;i<permission.length;i++){
                let curP = Number(permission[i])
                let ind = that.qxList.findIndex(item => {
                    return item.id == curP
                })
                if(ind != -1){
                    permissionArr.push(that.qxList[ind].name)
                }
            }
            let mpermission = obj.mpermission.split(',') || []
            for(let i=0;i<mpermission.length;i++){
                let curP = Number(mpermission[i])
                let ind = that.fxqxList.findIndex(item => {
                    return item.id == curP
                })
                if(ind != -1){
                    permissionArr.push(that.fxqxList[ind].name)
                }
            }

            return permissionArr.join('、')
        },
        isPhoneNo(){
            const that = this;
            return (/(^1[3|4|5|6|7|8|9][0-9]{9}$)/.test($.trim(that.formData.phone)))
        },
         // 添加/编辑成员  打开弹窗
         submitData(){
            const that = this;
            let bool = false;
            let tip = ''
            for(let key in that.teamFormData){
                if(that.teamFormData[key] == '' && ['realName','phone'].includes(key)){
                    that.$message({
                        message: key == 'realName' ? '请填写姓名' : '请填写手机号',
                        type: 'warning'
                    });
                    that.error_param = key;
                    bool = true;
                    return false;
                }
                if(key =='phone'){
                    if(!that.isPhoneNo($.trim(that.teamFormData[key]))){
                        that.$message({
                            message: '请输入正确的手机号',
                            type: 'warning'
                        });
                        that.error_param = key;
                        bool = true;
                        return false;
                    }
                }

                if(key == 'password' && that.teamFormData[key] == '' && that.teamFormData.id){
                    that.$message({
                        message: '请输入登录密码',
                        type: 'warning'
                    });
                    that.error_param = key;
                    bool = true;
                    return false;
                }
                if(key == 'gid' && that.teamFormData[key] == ''){
                    that.$message({
                        message: '请选择职务',
                        type: 'warning'
                    });
                    that.error_param = key;
                    bool = true;
                    return false;
                }

            }
            let teamFormData = JSON.parse(JSON.stringify(that.teamFormData))
            if(!teamFormData.password){
                teamFormData.password = '123456'
            }
            if(bool) return false;
            $.ajax({
                url:`/include/ajax.php?service=house&action=route&route=marketing/${that.teamFormData.id ? 'editUser' : 'addUser'}&lpid=${loupanid}`,
                type:'post',
                data:teamFormData,
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        // that.$message({
                        //     message: res.info,
                        //     type: 'success'
                        // });
                        showErrAlert(res.info,'success')
                        that.showPop = false;
                        that.getGroupList(1)
                    }else{
                        showErrAlert(res.info)
                    }
                }
            })
            
        },

        endTimeChange(val){
            console.log(this.formScheme.endTime)
            console.log(val)
        },

        tabChange(ind){
            const that = this;
            if(ind <= 2){

                that.currTab = ind;
                that.checkLeft()
            }else{
                let url = ind == 3 ? 'reportList?id=' + branchid :  'commissionList?id=' + branchid
                window.open(url)
            }
        },

        // 获取相关分销配置
        getConfig(){
            const that = this;
            $.ajax({
                url:`/include/ajax.php?service=house&action=route&route=marketing/getDistributorSystemConfig&lpid=${loupanid}`,
                type:'post',
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        that.config = res.info.list
                    }
                }
            })
        },

           // 修改密码链接
        changePsd() {
            this.$confirm(
            `<div class="con">
                        <h6>分销公司如遇密码问题无法登录，可使用账号手机号等找回密码<br> 请复制链接给其负责人：</h6>
                        <div class="disflex a-c">
                            <div class="linkbox">重置密码：<span id="copyInner">${memberDomain}/security-chpassword.html</span></div>
                            <div class="linkbtn disflex a-c j-c">复制链接</div>
                        </div>
                    </div>`,
            "确认删除分销公司",
            {
                customClass: "confirmInp-dialog",
                dangerouslyUseHTMLString: true,
                showCancelButton: false,
                showConfirmButton: false,
            }
            )
            .then(() => {
                this.$message({
                type: "success",
                message: "删除成功!",
                });
            })
            .catch(() => {
                console.log("取消了");
            });
        },

        
        // 复制内容
        copyToClipboard() {
            const range = document.createRange();
            range.selectNode(document.getElementById("copyInner"));
            const selection = window.getSelection();
            if (selection.rangeCount > 0) selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand("copy");
            showErrAlert("复制成功",'success')
        },

        // 获取模板
        getModelData(){
            const that = this;
            $.ajax({
                url:`/include/ajax.php?service=house&action=route&route=marketing/getDistributorSchemeTemplate&lpid=${loupanid}`,
                type:'post',
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        that.modelData = res.info.data ?  res.info.data : null
                    }
                }
            })
        },

        /**
         * 存储模版
         * @param {string} key 作为验证模板数据
         * */ 
        saveModel(key){
            const that = this;
            let modelData = that.modelData ? that.modelData : {}
            let bool = false; // 表示可以向下执行
            switch(key){
                case 'commissionNote': //佣金说明
                    if(that.formScheme.commissionNote == ''){
                        showErrAlert('请填写佣金说明')
                        bool = true;
                    }else{
                        modelData[key] = that.formScheme.commissionNote
                    }
                    break;
                case 'rules': //代理规则
                    let formKeys = ['reportWaitTime', 'reportStartType', 'reportIntervalDay', 'dealStartType', 'dealIntervalDay', 'reportPhoneType', 'uploadCert', 'reportVisitNote', 'reportTips']   
                    for(let  i = 0; i < formKeys.length; i++){
                        modelData[formKeys[i]] = that.formScheme[formKeys[i]]
                    }
                    break;
                case 'reportUid': //代理规则
                    if(that.showUserArr.length == 0){
                        showErrAlert('请选择报表联系人')
                        bool = true;
                        break;

                    }
                    that.reportUidArr = that.showUserArr.map(item=>item.id)
                    modelData['reportUid'] = that.reportUidArr.join(',')
                    modelData['reportUserList'] = JSON.parse(JSON.stringify(that.showUserArr))
                    break;
                    
            }   

            if(bool) return false;
            $.ajax({
                url:`/include/ajax.php?service=house&action=route&route=marketing/saveDistributorSchemeTemplate&lpid=${loupanid}`,
                type:'post',
                data:{
                    data:JSON.stringify(modelData)
                },
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        showErrAlert('已保存！下次可直接使用', 'success')
                        that.modelData = JSON.parse(JSON.stringify(modelData))
                    }else{
                        showErrAlert(res.info)
                    }
                }
            })
        },

        // 使用模板数据
        useModel(key){
            const that = this;
            switch(key){
                case 'commissionNote': //佣金说明
                    that.formScheme.commissionNote = that.modelData.commissionNote;

                case 'rules': //代理规则
                    let formKeys = ['reportWaitTime', 'reportStartType', 'reportIntervalDay', 'dealStartType', 'dealIntervalDay', 'reportPhoneType', 'uploadCert', 'reportVisitNote', 'reportTips']   
                    for(let  i = 0; i < formKeys.length; i++){
                        that.formScheme[formKeys[i]] =  that.modelData[formKeys[i]] 
                    }
                    break;
                case 'reportUid': //代理规则
                    that.formScheme['reportUid'] = that.modelData['reportUid'] || ''
                    let arr_n = []
                    let arr = that.formScheme.reportUid.split(',');
                    for(let i = 0; i < arr.length; i++){
                        let obj = that.contactList.find(item => item.id == arr[i])
                        if(obj){
                            arr_n.push(obj)

                        }
                    }
                    that.showUserArr =  JSON.parse(JSON.stringify(arr_n))
                    that.reportUserArr = arr_n
                    break;
                    
            }   
        },

        // 删除报表联系人
        delReportUser(index){
            const that = this;
            that.showUserArr.splice(index,1)
        },


        // 复制分销方案
        copyScheme(){ 
            const that = this;
            let formData = JSON.parse(JSON.stringify(that.formScheme))
            localStorage.setItem('house_distributorScheme',JSON.stringify(formData))
            showErrAlert('分销方案已复制', 'success')
        },

        // 粘贴分销方案
        pasteScheme(){
            const that = this;
            let formData = localStorage.getItem('house_distributorScheme')
            if(formData){
                formData  = JSON.parse(formData)
                that.formScheme = formData

                that.formScheme['reportUid'] = that.modelData['reportUid'] || ''
                let arr_n = []
                let arr = that.formScheme.reportUid.split(',');
                for(let i = 0; i < arr.length; i++){
                    let obj = that.contactList.find(item => item.id == arr[i])
                    if(obj){
                        arr_n.push(obj)

                    }
                }
                that.showUserArr =  JSON.parse(JSON.stringify(arr_n))
                that.reportUserArr = arr_n
                showErrAlert('分销方案已粘贴', 'success')
            }else{
                showErrAlert('没有可粘贴的分销方案', 'error')
            }
        },

        // 获取分销公司信息
        getDistributionInfo(){ 
            const that = this;
            $.ajax({
                url:`/include/ajax.php?service=house&action=route&route=marketing/getDistributorInfo&lpid=${loupanid}&dcoid=${branchid}`,
                type:'post',
                dataType:'json',
                success:(res)=>{
                    if(res.state == 100){
                        that.distributorData = res.info.data;
                    }
                }
            })
        },
    }
 })

 function echoCurrency(type){
	var pre = (typeof cookiePre != "undefined" && cookiePre != "") ? cookiePre : "HN_";
	var currencyArr = $.cookie(pre+"currency");
	if(currencyArr){
		var currency = JSON.parse(decodeURIComponent(atob(currencyArr)));
		if(type){
			return currency[type]
		}else{
			return currencyArr['short'];
		}
	}else if(typeof cfg_currency != "undefined"){
		if(type){
			return cfg_currency[type]
		}else{
			return cfg_currency['short'];
		}
	}
}