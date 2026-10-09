
var ajaxIng = null; //是否正在请求
var pid,cid,did;
var newAddr = false
var map;
var citys = [],addridsArr = [],addrArr = [];
toggleDragRefresh('off');
var pageVue = new Vue({
    el:'#page',
    data:{
        steps:[
            '基本信息','职位要求','发布成功！'
        ],
        changeForm:false,//是否修改过页面
        currStep:0,
        optStep:0,
        baseConfig:'', //基础配置
        id:id, //是否处于编辑
        detailInfo:'', //详情
        postList:[], //职位
        showPostPop:false, //显示职位类别弹窗
        currChoseStype:'', //二级
        currChoseType:'', //一级
        showLeftPop:false, //显示二级
        showRightPop:false, //显示三级
        choseTypeObj:[], //职位选择的类名
        // 有效期选项
        validShow:'', //当前选择的有效期
        minDate: new Date(), //最低当前时间
        shortCutOptions:[{value:7,title:'7天'},{value:15,title:'15天'},{value:30,title:'1个月'},{value:60,title:'2个月'},{value:90,title:'3个月'}],
        jobNature:[{id:1,typename:'全职'},{id:2,typename:'兼职'},{id:3,typename:'实习/校招'}],
        formData:{
            typeid_list:[],
            type:'', //职位分类
            title:'',
            valid:'', //有效期
            long_valid:'', //长期招聘
            tag:[], //职位标签
            number:'', //招聘人数
            nature:1, //职位性质
            
            min_salary:'',
            max_salary:'',
            job_addr_id:'', //工作地点
            experience:'', //工作经验
            educational:'', //学历
            note:'', //职位描述
            claim:'', //任职要求
            salary_type:1, //2时薪 /1月薪
            dy_salary:'', //是否年底N薪
            mianyi:0, //是否面议
        },
        
        validDays:'', //选择的天数
        showPop:false, //弹窗
        popType:'',  //valid => 有效期  choseWorkPosi => 选择工作地  label => 标签  jobNature => 工作性质  salary => 薪资   //addWorkPosi => 新增工作地
        editTag:{
            selfTag:[],  //自定义的tag
            defaultTag:[] , //配置选中的tag
            onEdit:false,
            editInd:0, //编辑的
            tag:'', //职位标签，填写的
            nature:'',
        },
        jobAddrList:[], //所有职位列表
        lng:'', //坐标
        lat:'', 
        surroundingPois:[], //周边数据
        addWorkPosi:false,
        isload:false, //是否正在加载
        loadEnd:false, //加载结束
        cityid:cityid, //城市分站
        city:city,
        showSearch:false, //显示搜索页
        searchList:[], //搜索列表数据
        newAddr:{
            id:0,
            address:'',
            addrid:'',
            lng:'',
            lat:'',
            addridArr:[],
        },
        addridArr:[], //区域地址id
        addrname:[],
        currInd:'', //index
        max_salary:'',//记录的薪资 最高 
        min_salary:'',//记录的薪资 最低
        max_salary_hour:'',//记录的薪资 时薪最高 
        min_salary_hour:'',//记录的薪资 时薪最低
        salaryArr:[4000,6000,8000,10000,15000,20000,25000],  //薪资配置
        salarObjArr_min:[{text:4000,disabled:false},{text:8000,disabled:false},{text:10000,disabled:false},{text:12000,disabled:false},{text:15000,disabled:false},{text:20000,disabled:false},{text:25000,disabled:false},],
        salarObjArr_max:[{text:4000,disabled:false},{text:8000,disabled:false},{text:10000,disabled:false},{text:12000,disabled:false},{text:15000,disabled:false},{text:20000,disabled:false},{text:25000,disabled:false},],
        dySalaryArr:[],
        addrKeywords:'', //地址搜索
        district:'',//地址
        focusIn:false,
        focusIn_1:false, //聚焦

        showFeedBack:false, //反馈弹窗
        postTypename:'', //需要反馈的名字
        postUploading:false,
        site_map:site_map, //地图
        citys:[], //城市分站,
    },
    created(){
        const that = this;

        if(that.id){
            that.getDetail();  //获取编辑的职位信息
        }else{
            that.checkDefine()
            that.getBaseConfig(); //获取公司配置
        }

        for(let i = 12; i <= 20; i++ ){
            that.dySalaryArr.push({
                value:i,
                text:i > 12 ?  (i + '薪') : '无'
            })
        }

        wx.config({
			debug: false,
			appId: wxconfig.appId,
			timestamp: wxconfig.timestamp,
			nonceStr: wxconfig.nonceStr,
			signature: wxconfig.signature,
			jsApiList: ['chooseImage', 'previewImage', 'uploadImage', 'downloadImage','getLocation']
		});
    },
    mounted(){
        const that = this;
        that.getAllAddrList('all'); //获取所有职位
        window.onbeforeunload = function () {
            if(that.changeForm){
                if(!that.id){
                    that.saveData()
                }
                return '如直接离开页面，将放弃修改内容'
            }
		};
        if(that.id){

            that.checkLeft()
        }else{
            that.checkPackage()
        }

        
    },
    computed:{
        removeNull:function(){
            const that = this;
            let arr = that.formData.tag.filter(item => item);
            
            return (arr ? arr : '');
        }
    },
    methods:{

        // 查看是否能上架职位
		checkPackage(){
			var tt = this;
			var ifCanJobs = (combo_id == '0' || combo_enddate < parseInt(new Date().valueOf() / 1000) || combo_enddate == -1); //是否是会员/已过期 combo_enddate -1表示永久有效
			// 未开通套餐
			if(ifCanJobs && canJobs == '0'){ //已过期 或者未开通
				jobPop.showPackagePop = true;
                jobPop.showType = 'buymeal';
			}else if(canJobs == '0'){
				let delOptions = {
                    btnSure:'升级职位数',
                    isShow:true,
                    title:'上架职位数已满',
                    btnColor:'#3377FF',
                    btnCancelColor:'#000',
                    confirmTip:'当前套餐可上架职位数为'+ (combo_job_real == -1 ? '不限' : Number(combo_job_real) + Number(package_job)) +'，请升级职位数 或先下架一些职位',
                    popClass:'delConfirmPop'
                }
                confirmPop(delOptions,function(){
                    // 显示职位上架弹窗
                    var currDate = parseInt(new Date().valueOf() / 1000);
                     // 套餐过期  没购买套餐
                    if(!combo_id || (currDate > combo_enddate && combo_enddate != -1)){
                        location.href = masterDomain + '/supplier/job/jobmeal.html?appFullScreen'
                        return false;
                        
                    }else{
                        jobPop.showPackagePop = true;
                        jobPop.showType = 'package';
                        jobPop.packagePopType = 5;
                    }
                    
                    

                })
			}
		},

        // 职位反馈
        feedBackPost(){
            const that = this;
            if(that.postUploading) return false;
            that.postUploading = true;
            $.ajax({
				url: '/include/ajax.php?service=job&action=recommendAddJobType&title=' + that.postTypename,
				type: "POST",
				dataType: "json",
				success: function (data) {
                    that.postUploading = false;
                    if(data.state == 100){
                        showErrAlert('提交成功，感谢您的反馈')
                        setTimeout(() => {
                            that.showFeedBack = false;
                            that.postTypename = ''
                        })                        
                    }else{
                        showErrAlert(data.info)
                    }
                }
            })
        },

        // 是否从自定义地址过来
        checkDefine(){
            const that = this;
            let addrData = localStorage.getItem('infoData');
            if(addrData && addrData != 'undefined'){

                that.initJobData()        
                addrData = JSON.parse(addrData);
                localStorage.removeItem('infoData')
                that.resolveInfoData(addrData)

            }else{
                that.checkDraft()
            }
        },
        // 处理数据
        resolveInfoData(d){
            const that = this;
            let district ='';
            for(var i = 0; i < d.length; i++){
                if(d[i].name == 'district' && d[i].value){
                    district = JSON.parse(d[i].value)
                    if(district && district != ""){
                        that.newAddr['lng'] = district.point.lng
                        that.newAddr['lat'] = district.point.lat
                    }
                }else if(d[i].name == 'address' || d[i].name == 'lng' || d[i].name == 'lat' || d[i].name == 'lnglat'){
                    that.newAddr[d[i].name] = d[i].value
                }
            }
            newAddr = true
            that.formData.job_addr_id = 0
            HN_Location.lnglatGetTown(that.newAddr,function(data){
                var province = '',city = '',district = '',town  = '';
                if( data.province){
                    province = data.province.replace('省','').replace('市',''); // 省,直辖市
                }
                
                if(data.city){
                    city = data.city.replace('市',''); // 市
                }
                
                if(data.district){
                    district = data.district.replace('区','').replace(city,'');
                }
                
                if(data.town){
                    town= data.town.replace('镇','').replace('街道','');
                }

                if(province || city || district || town){
                    that.calcAddrid(province,city,district,town)
                }else{
                    that.calcAddrid(province,city,district,town)

                }
                
            })
        },

        // 初始化职位数据
        initJobData(){
            const that = this;
            let formData = localStorage.getItem('newJob'); //获取一下之前的职位信息
            if(formData && formData != 'undefined'){
                formData = JSON.parse(formData)
                that.formData = formData;
            }
            localStorage.removeItem('newJob')
            that.getJobPostType(formData); //获取职位
            that.changeForm = true;
        },

        // 验证是否有草稿
        checkDraft(){
            const that = this;
            let formData = localStorage.getItem('newJob');
            if(formData && formData != 'undefined'){
                formData = JSON.parse(formData)
                const options = {
                    title:'是否继续编辑<span style="color:#3C7CFF;">'+formData.title+'</span>',
                    confirmTip:'发现有未完成草稿，可继续编辑',
                    btnSure:'打开草稿',
                    btnCancel:'新建职位',
                    isShow:true,
                    btnCancelColor:'#000',
                    btnColor:'#3C7CFF',
                    popClass:'myConfirm'
                }
                confirmPop(options,function(){
                    // that.formData = formData;
                    // that.changeForm = true;
                    // localStorage.removeItem('newJob')
                    // that.getJobPostType(formData); //获取职位
                    that.initJobData()
                },function(){
                    // 不需要执行操作
                    that.getJobPostType()
                    localStorage.removeItem('newJob')
                })

                
            }else{
                that.getJobPostType()
            }
        },



        // 获取相关配置
		getBaseConfig(){
			var that = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=getItem&name=jobTag,jobNature,education,experience,welfare',
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data.state == 100){
						that.baseConfig = data.info;
                        for(let item in that.baseConfig){
                            if(item == 'education' || item == 'experience'){
                                that.baseConfig[item].unshift({
                                    id:0,
                                    typename:'不限'
                                })
                            }
                        }

                    // 标签回显
                        if(that.formData && that.formData.tag && that.formData.tag.length){
                            let jobTag = that.baseConfig['jobTag'].map(item => {
                                return item.typename;
                            })
                            for(let i = 0; i < that.formData.tag.length; i++){
                                if(jobTag.includes(that.formData.tag[i])){
                                    that.editTag['defaultTag'].push(that.formData.tag[i])
                                }else{
                                    that.editTag['selfTag'].push(that.formData.tag[i])

                                }
                            }
                            that.$nextTick(() => {
                                that.changeForm = false;
                            })
                        }
					}
				},
				error: function () { 

				}
			});
		},

        // 获取详情
        getDetail(){
			var that = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=postDetail&id='+that.id+'&store=1',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){
                        let detailInfo = data.info;
                        that.detailInfo = detailInfo;
                        for(var item in that.formData){
							var key = item;
							var paramArr = ['type','nature','educational','experience',]
							if(paramArr.indexOf(key) > -1){
								key = key + 'id'
							}else if(key == 'job_addr_id'){
								key = 'job_addr';
							}else if(key == 'experience_id'){
								key = 'job_addr';
							}
                            // else if(key == 'type_list'){
							// 	key = 'typeid_list'
							// }
                            if((key == 'min_salary' || key == 'max_salary') && detailInfo[key] == 0){
                                detailInfo[key] = '';
                            }
							that.formData[item] = detailInfo[key]
                            if(item === 'type'){
                                console.log(detailInfo['typeid_list'])
                            }
							if(key == 'long_valid'){
								that.formData[item] = detailInfo[key];
							}
						}
                        that.checkDefine()

                        that.getJobPostType(detailInfo)
                        that.getBaseConfig();
                        that.$nextTick(() => {
                            that.changeForm = false;
                        })

                    }
                },
            })
        },

        // 跳转下一步
        nextToStep(){
            const that = this;
            if(that.id){
                if(that.checkFormData(that.currStep)) return false;
                that.submitData();
                return false
            }
            if(that.currStep < 1){
                // if(that.checkFormData(that.currStep)) return false;
                that.saveData()
                that.currStep ++;
                that.optStep = that.currStep;
            }else{
                let stop = false;
                for(let i = 0; i <= that.currStep; i++){
                    if(that.checkFormData(i)) {
                        stop = true;
                        break;
                    };
                }
                if(stop) return false;

                that.submitData();
            }
        },

        // 保存草稿
        saveData(){
            const that  = this;
            let formData = that.formData;
            localStorage.setItem('newJob',JSON.stringify(formData))
        },
        
        // 提交数据
        submitData(){
            const that = this;
            if(that.formData['job_addr_id'] === 0){
                if( that.newAddr && that.newAddr.lng && that.newAddr.lat){
                    that.getAllAddrList('add');

                }
                return false;
            }

            var paramStr = ''
            if(that.id){
				paramStr = '&id=' + that.id
			}
            paramStr = paramStr + '&cityid=' + cityid
            if(that.isload) return false;
            that.isload = true;
            $.ajax({
				url: '/include/ajax.php?service=job&action=aePost' + paramStr,
				type: "POST",
				data:that.formData,
				dataType: "json",
				success: function (data) {
                    that.isload = false;
                    if(data.state === 100){
                        that.changeForm = false;
                        // if(that.id){
                        //     localStorage.removeItem('newJob')
                        // }
                        localStorage.removeItem('newJob')

                        if(customAgentCheck){
                            showErrAlert((that.id ? '更新成功':'发布成功'),'success');
                            setTimeout(() => {
                                $('.goBack').click()
                            }, 1500);
                        }else{
                            if(!that.id){

                                let tip = busi_state == 0 ? '企业资料审核中，与职位一并审核通过后<br/>职位即可上架展示' : '审核通过后即可展示职位信息'
                                const options = {
                                    title:'<s></s>职位发布成功！请等待审核',
                                    confirmTip:tip,
                                    btnSure:'好的',
                                    btnCancel:'再发一条',
                                    isShow:true,
                                    btnCancelColor:'#666',
                                    btnColor:'#3C7CFF',
                                    popClass:'myConfirm'
                                }
                                confirmPop(options,function(){
                                    location.href = masterDomain + '/supplier/job/postManage.html?appFullScreen&tab=1'
                                },function(){
                                    // 不需要执行操作
                                    location.href = masterDomain + '/supplier/job/add_post.html?appFullScreen'
                                    
                                })
                            }else{
                                showErrAlert('职位修改成功','success');
                                setTimeout(() => {
                                    location.href = masterDomain + '/supplier/job/postManage.html?appFullScreen&tab=1'
                                }, 1500);
                            }



                        }
                    }else{
                        showErrAlert(data.info)
                    }

                },
            })
        },

        // 选择职位类别
        chosePostType(item,type){
            const that = this;
            type = type ? type : 0;
            if (!type) { //一级分类
                that.currChoseType = item;
                that.currChoseStype = []; //清空二级
                that.showRightPop = false;
                setTimeout(() => {
                    that.showLeftPop = true;
                }, 50);

                return false;
            }else if(type === 1){
                that.currChoseStype = item;
                if(item.lower){
                    setTimeout(() => {
                        that.showRightPop = true;
                    }, 50);
                }else{
                    that.formData.type = item.id
                    that.formData.typeid_list = [that.currChoseType.id,item.id];
                    that.showPostPop = false;
                    that.choseTypeObj =  [that.currChoseType,item];
                }
               
            }else{
                // 选择第三
                that.formData.type = item.id
                that.formData.typeid_list = [that.currChoseType.id,that.currChoseStype.id,item.id];
                that.showPostPop = false;
                that.choseTypeObj =  [that.currChoseType,that.currChoseStype,item];
            }

            // console.log(that.formData.type_list);

        },

        // 获取职位分类
        getJobPostType(infoDetail) {
            var that = this;
            $.ajax({
                url: '/include/ajax.php?service=job&action=type&son=1',
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        that.postList = data.info;
                        if (infoDetail && infoDetail.typeid_list && infoDetail.typeid_list.length > 0) {
                            that.choseTypeObj = [];
                            for (var m = 0; m < infoDetail.typeid_list.length; m++) {
                                if(that.choseTypeObj.length == 0){
                                    that.checkJobType(data.info, 0, infoDetail.typeid_list[m])
                                }else{
                                    that.checkJobType(that.choseTypeObj[that.choseTypeObj.length - 1].lower, m, infoDetail.typeid_list[m])

                                }
                            }
                            that.$nextTick(() => {
                                that.changeForm = false;
                            })
                        }

                    }
                },
                error: function () {

                }
            });
        },

        checkJobType(item, ind, obj) {
            var that = this;
            for (var i = 0; i < item.length; i++){
                if(item[i].id == obj){
                    if(ind === 0){
                        that.currChoseType = item[i];
                        that.showLeftPop = true
                    }else if(ind === 1){
                        that.showRightPop = true
                        that.currChoseStype = item[i];
                    }
                    that.choseTypeObj.push(item[i]);
                    // console.log(that.choseTypeObj);
                    break;
                }
            }
            
        },
        // 选择有效期天数
        choseDays(item){
            const that = this;
            const time = item.value * 86400;
            that.formData.valid = parseInt(new Date().valueOf() /1000) + time;
            that.formData.long_valid = '';
            that.validDays = item.value;
            // console.log(that.formData.valid);
            that.validShow = new Date(that.formData.valid * 1000)
            that.hidePop(); //隐藏弹窗
        },

        // 隐藏弹窗
        hidePop(){
            const that = this;
            that.showPop = false;
            that.popType = '';
        },

        popConfirm(type){
            const that = this;
            if(type == 'valid'){
                // that.validShow = that.validShow ? that.validShow : new Date();
                let now = new Date();
                let tomorrow = parseInt(new Date(now.toDateString()).getTime().valueOf() / 1000) + 86400 - 1; //今天24点的
                that.formData.valid = that.validShow  ? parseInt(that.validShow.valueOf() / 1000) :  tomorrow
                that.formData.long_valid = 0;
                that.validDays = ''; //清空
            }else if(type == 'salary'){
                // console.log(that.min_salary,that.max_salary)
                // that.min_salary = that.$refs.min_salary.getValues()[0].text;
                // that.max_salary = that.$refs.max_salary.getValues()[0].text;
                // if(that.min_salary > that.max_salary){
                //     showErrAlert('最高薪资不能大于最低薪资');
                //     return false;
                // }
                // that.formData.min_salary = that.min_salary;
                // that.formData.max_salary = that.max_salary;
            }
            that.hidePop(); //隐藏弹窗
        },

        // 工具类方法
        transTimes(timeStr,n){
            update = new Date(timeStr * 1000);//时间戳要乘1000
            year = update.getFullYear();
            month = (update.getMonth() + 1 < 10) ? ('0' + (update.getMonth() + 1)) : (update.getMonth() + 1);
            day = (update.getDate() < 10) ? ('0' + update.getDate()) : (update.getDate());
            hour = (update.getHours() < 10) ? ('0' + update.getHours()) : (update.getHours());
            minute = (update.getMinutes() < 10) ? ('0' + update.getMinutes()) : (update.getMinutes());
            second = (update.getSeconds() < 10) ? ('0' + update.getSeconds()) : (update.getSeconds());
            if (n == 1) {
                return (year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second);
            } else if (n == 2) {
                return (year + '-' + month + '-' + day);
            } else if (n == 3) {
                return (month + '-' + day);
            } else if (n == 4) {
                return (month + '-' + day + ' ' + hour + ':' + minute);
            } else if(n == 5){
                return (year + '-' + month + '-' + day + ' ' + hour + ':' + minute);
            }else {
                return 0;
            }
        },

        // 自定义职位标签
        AddPostTag(){
            const that = this;
            if(that.editTag.selfTag.length + that.editTag.defaultTag.length >= 3){
                showErrAlert('最多只能 添加3个标签');
                return false;
            }
        
            const selftag = that.editTag.selfTag;
            let go = true;
            for(let i = 0; i < selftag.length; i++){
                if(!selftag[i]){
                    showErrAlert('请先完善已有标签内容');
                    go = false;
                    break;
                }
            }
            if(!go) return false;
            that.editTag.onEdit = true;
            that.editTag.selfTag.push('');
            that.editTag.editInd = that.editTag.selfTag.length - 1;
            setTimeout(() => {
                $(".on_edit input").focus()
            }, 300);

        },

        // 确定填写
        sureEdit(){
            const that = this;
            if(!that.editTag.tag){  //没有填信息
                // that.editTag.selfTag.splice(that.editTag.editInd,1);
                return false;
            }else if(that.editTag.selfTag.indexOf(that.editTag.tag)  > -1|| that.editTag.defaultTag.indexOf(that.editTag.tag)  > -1){
                showErrAlert('请不要填写重复的标签');
                setTimeout(() => {
                    that.editTag.tag = ''
                    $(".on_edit input").focus()
                }, 300);
                return false;
            }
            that.editTag.selfTag[that.editTag.editInd] = that.editTag.tag;
            that.editTag.onEdit = false;
            that.editTag.tag = '';
            that.changeFormData()
        },

        delSelfTag(ind){
            this.editTag.selfTag.splice(ind,1);
            this.changeFormData()
        },

        // 选中tag
        choseDefaultTag(item){
            const that = this;
            if(that.editTag.defaultTag.indexOf(item.typename) > -1){
                that.editTag.defaultTag.splice(that.editTag.defaultTag.indexOf(item.typename),1)
            }else{
                that.editTag.selfTag = that.editTag.selfTag.filter(item=> item)
                if(that.editTag.selfTag.length + that.editTag.defaultTag.length >= 3){
                    showErrAlert('最多只能添加3个标签');
                    return false;
                }
                that.editTag.defaultTag.push(item.typename)
            }
            that.changeFormData(); 
        },

        // 按键 ==> tag
        enterEdit(){
            const that = this;
            if(event.keyCode == 13){
                $(event.currentTarget).blur();
            }
        },


        // 确定改变formData的值 tag
        changeFormData(){
            const that = this;
            this.formData.tag = [...that.editTag.defaultTag,...that.editTag.selfTag]
        },

        // 选中工作底单
        showAddrList(){
            const that = this;
            console.log(that.jobAddrList);
            if(that.jobAddrList && that.jobAddrList.length >= 1 ){
                that.showPop = true; 
                that.popType = 'choseWorkPosi'
            }else{
                that.addWorkPosi = true
            }
        },

        // 选择新地址
        choseNewAddr(){
            const that = this
            if(that.formData.job_addr_id !== 0){
                that.formData.job_addr_id = 0
                that.hidePop()
            }
        },

        // 显示地图
         //显示当前选中的地址
         showMapCurr(){
            const that = this;
            that.addWorkPosi = true; //展示地图

            if(!map){
                let data = {
                    lng:that.lng,
                    lat:that.lat
                }
                that.drawMap(data)
            }else {
                if(site_map == 'baidu'){
                    var mPoint = new BMap.Point(+that.newAddr.lng, +that.newAddr.lat);
                    map.centerAndZoom(mPoint, 18);
                    that.getLocation(mPoint);
                }else if(site_map == 'amap'){
                    var lnglat = new AMap.LngLat(+that.newAddr.lng, +that.newAddr.lat);
                    map.setCenter(lnglat)
                    that.getLocation(lnglat)
                }else if(site_map == 'tmap'){

                }else if(site_map == 'google'){
                    let lat = that.newAddr.lat();
                    let lng = that.newAddr.lng();
                    let lnglat = new google.maps.LatLng(+lat, +lng)
					map.setCenter(lnglat)
				    that.getLocation(lnglat)
                }
                that.hideSearchPage()

            }
            
        },


        // 工作地点相关操作

        // 获取地址/	// 提交新增地址的请求
		getAllAddrList(type){
			var that = this;
			var paramStr = ''
			if(type == 'all'){
				paramStr = '&method=all&company_addr=1'
			}else if(type == 'add'){
				var obj = {
					id:0,
					add:true,
					lng:that.newAddr.lng,
					lat:that.newAddr.lat,
					address:that.newAddr.address,
					addrid:that.newAddr.addrid ? that.newAddr.addrid : 0
				}
				var paramArr = []
				for(var item in obj){
					paramArr.push(item + '=' + obj[item])
				}
				paramStr = '&method=add&' + paramArr.join('&');
			}
			$.ajax({
				url: '/include/ajax.php?service=job&action=op_address' + paramStr ,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){
						if(type == 'all'){
                            let addrList = data.info.filter(item => {
                                return item.id && item.addrid && item.address
                            })
							that.jobAddrList = addrList;
							if(!that.formData.id && that.formData.job_addr_id !== 0 && that.jobAddrList.length){
								that.formData.job_addr_id = that.jobAddrList[that.jobAddrList.length - 1].id; //此处属于初始化
                                that.$nextTick(() => {
                                    that.changeForm = false;
                                })
							}else if(that.formData.job_addr_id === 0){
                                that.confirmAddr()
                            }

                           
                            
						}else{
							// 新增地址
							that.formData.job_addr_id = data.info;
							for(var i = 0; i < that.jobAddrList.length; i++){
								if(that.jobAddrList[i].id == 0){
									that.jobAddrList[i].id = data.info;
									break;
								}
							}

                            that.submitData();

                            if(newAddr){  //自定义地址
                                var obj = {
                                    id:data.info,
                                    add:true,
                                    lng:that.newAddr.lng,
                                    lat:that.newAddr.lat,
                                    address:that.newAddr.address,
                                    addrid:that.addrid ? that.addrid[that.addrid.length - 1] : 0
                                }
                                newAddr = false;
                                that.jobAddrList.push(obj)
                            }


						}

					}else{
                        showErrAlert(data.info)
					}
				},
				error: function () { 

				}
			});
		},

        // 地图汇总
        drawMap(data) {
            var tt = this;
            var lnglat = '';
            if (data) {
                lnglat = [data.lng, data.lat]
            }

            if (site_map == 'baidu') {
                tt.draw_baidu(lnglat)
            } else if (site_map == 'google') {
                tt.draw_google(lnglat)
            } else if (site_map == 'amap') {
                tt.draw_Amap(lnglat)
            }else if(site_map == 'tmap'){
                tt. draw_tmap(lnglat)
            }

        },

        // 百度地图
        draw_baidu(lnglat) {
            var that = this;
            map = new BMap.Map("mapdiv");
            if (that.city != city && !lnglat) {
                map.centerAndZoom(that.city, 18);
                setTimeout(function () {
                    lnglat = map.getCenter();
                    that.lng = lnglat.lng;
                    that.lat = lnglat.lat;
                    var mPoint = new BMap.Point(lnglat.lng, lnglat.lat);

                    console.log(mPoint)
                    that.getLocation(mPoint);
                }, 500)
            } else {
                var mPoint = new BMap.Point(lnglat[0], lnglat[1]);
                map.centerAndZoom(mPoint, 18);
                that.getLocation(mPoint);
            }
            $('.mapCenter').addClass('animateOn');
            setTimeout(function () {
                $('.mapCenter').removeClass('animateOn');
            }, 600)
            map.addEventListener("dragend", function (e) {
                $('.mapCenter').addClass('animateOn');
                setTimeout(function () {
                    $('.mapCenter').removeClass('animateOn');
                }, 600)
                that.lng = e.point.lng
                that.lat = e.point.lat
                that.getLocation(e.point);
                
                that.currInd = ''; //清空选择

            });
            $(".loadImg").hide()
        },

        // 百度获取周边
        getLocation(point) {
            var that = this;
            that.loadEnd = false;
            if (site_map == 'baidu') { //百度地图
                var myGeo = new BMap.Geocoder();
                myGeo.getLocation(point, function mCallback(rs) {
                    var allPois = rs.surroundingPois;
                    var district = {
                        point:rs.point,
                        title: rs.addressComponents.district,
                        address:rs.addressComponents.city +' '+ rs.addressComponents.district,
                        noDistance:true,
                      }
                    that.district = district;
                    that.surroundingPois = [...rs.surroundingPois];
                    that.loadEnd = true;
                    var reg1 = rs.addressComponents.city;
                    var reg2 = rs.addressComponents.district;
                    var reg3 = rs.addressComponents.province;

                    // that.chosePosi(that.surroundingPois[0],1,0)
                }, {
                    poiRadius: 5000, //半径一公里
                    numPois: 50
                });

            }

            else if(site_map == 'amap'){//高度地图
                AMap.plugin(["AMap.PlaceSearch"], function () {
                    const placeSearch = new AMap.PlaceSearch({
                        pageSize: 20, //单页显示结果条数
                        // pageIndex: 1, //页码
                        // city: "010", //兴趣点城市
                        // citylimit: true, //是否强制限制在设置的城市内搜索
                        // map: map, //展现结果的地图实例
                        // panel: "my-panel", //结果列表将在此容器中进行展示。
                        // autoFitView: true, //是否自动调整地图视野使绘制的 Marker 点都处于视口的可见范围
                    });
                    placeSearch.searchNearBy("",point,1000,function(status, result){
                        if(status == 'complete' && result.info == 'OK'){
                            let  allPois =  result.poiList.pois;
                            that.surroundingPois = allPois.map((val) => {
                                return {
                                    address: val.address, //详细地址
                                    title: val.name, //标题
                                    point: {
                                        lng: val.location.lng,
                                        lat: val.location.lat
                                    }
                                }
                            })
                            
                        }
                    }); //使用插件搜索关键字并查看结果
                });
            }
            
            else if(site_map == 'google'){
                const service = new google.maps.places.PlacesService(map);
					service.nearbySearch(
						{ location: point, radius: 500, },
						(results, status, pagination) => {
						if (status !== "OK" || !results) return;
							that.surroundingPois = results.map((val) => {
								return {
									address: val.vicinity, //详细地址
									title: val.name, //标题
									point: {
										lng: val.geometry.location.lng,
										lat: val.geometry.location.lat
									}
								}
							})
						},
					);
            }

        },


        //高德地图
        draw_Amap(lnglat){
            const  that = this;
            let lng = +(lnglat[0] ? lnglat[0] : 120.738572);
            let lat = +(lnglat[1] ? lnglat[1] : 31.331029);
            if(that.city != city && !lnglat){
                map = new AMap.Map("mapdiv", {
                    viewMode: '2D', //默认使用 2D 模式
                    zoom: 16, //地图级别
                    center: [city_lng, city_lat], //地图中心点
                });
            }else{

                map = new AMap.Map("mapdiv", {
                    viewMode: '2D', //默认使用 2D 模式
                    zoom: 16, //地图级别
                    center: [lng, lat], //地图中心点
                });
            }


            $('.mapCenter').addClass('animateOn');
            setTimeout(function () {
                $('.mapCenter').removeClass('animateOn');
            }, 600)
            that.getLocation([lng,lat])

            map.on('dragend',function(ev){
                let newCenter = map.getCenter()
                that.getLocation(newCenter)
            })
        },

        // 谷歌地图
        // 绘制谷歌地图
        async draw_google(lnglat){
            const that = this;
            let lng = +(lnglat[0] ? lnglat[0] : 120.738572);
            let lat = +(lnglat[1] ? lnglat[1] : 31.331029);
            const { Map } = await google.maps.importLibrary("maps");
            map = new Map(document.getElementById("mapdiv"), {
                center: { lat: lat, lng: lng },
                zoom: 8,
            });
            let point = {lat,lng}
            that.getLocation(point)

            map.addListener("dragend", (e) => {
                let newCenter = map.getCenter();
                that.getLocation(newCenter)
            });
        },

        // 天地图
        draw_tmap(lnglat){
            // const tt = this;
            // map = new T.Map("mapdiv");
            // var mPoint = new T.LngLat(lnglat[0], lnglat[1]);
            // map.centerAndZoom(mPoint, 16);
            // tt.getLocation(mPoint);
    
            //   map.addEventListener("dragend", function(e){
            // $('.mapcenter').addClass('animateOn');
            // setTimeout(function(){
            //   $('.mapcenter').removeClass('animateOn');
            // },600)
            //  tt.getLocation(e.target.getCenter());
            //  tt.lng = e.target.getCenter().lng;
            //  tt.lat = e.target.getCenter().lat;
            //   });
        },

        searchKey(){
            const that = this;
            const el = event.currentTarget;
            const directory = $(el).val();
            that.getList(directory)
        },

        showSearchPage(){
            const that = this;
            that.showSearch = true;
            if(site_map == 'tmap'){
                that.$nextTick(() => {
                    $("#searchInp").click()
                })
            }
        },

        hideSearchPage(){
            const that = this;
            var el = event.currentTarget;
            if(!$(el).val() && site_map != 'tmap'){
                that.showSearch = false; 
            }

        },

        // 搜索列表
        getList(directory) {
            var tt = this;
            if (ajaxIng) {
                ajaxIng.abort();
            }
            directory = directory.replace(/\s*/g, "");
            if (tt.isload) return false;
            tt.isload = true;
            tt.loading = true;

            console.log(directory)
            ajaxIng = $.ajax({
                // url: '/include/ajax.php?service=siteConfig&action=get114ConveniencePoiList&pageSize=20&page='+page+'&lng='+tt.lng+'&lat='+tt.lat+'&directory='+directory+'&radius='+radius+"&pagetoken="+pagetoken,
                url: '/include/ajax.php?action=getMapSuggestion&cityid=' + tt.cityid + '&lat=' + tt.lat + '&lng=' + tt.lng + '&query=' + directory + '&region=' + tt.city + '&service=siteConfig',
                dataType: 'json',
                success: function (data) {
                    tt.isload = false;
                    tt.loading = false;
                    if (data.state == 100) {
                        tt.loadEnd = true;
                        totalPage = 1;
                        // totalCount = data.info.totalCount;
                        // pagetoken = data.info.pagetoken == '' || data.info.pagetoken == null ? '' : data.info.pagetoken;
                        var list = data.info;
                        if (list.length > 0) {
                            tt.chosePosi(list[0],'',0)
                            if (page == 1) {
                                tt.searchList = list;
                            } else {
                                tt.searchList = [...tt.searchList, ...list];
                            }
                            page++;
                            if (page > totalPage) {
                                isload = true;
                            }
                        } else if (page == 1) {
                            tt.searchList = [];
                        } else {
                            page++;
                            tt.loading = false;
                            tt.loadEnd = true;
                        }

                    } else {
                        tt.loading = false;
                        tt.loadEnd = true;
                        tt.isload = false;
                        tt.searchList = [];
                    }
                },
                error: function () {
                    tt.isload = false;
                    tt.loading = false;
                    //showErr(langData['circle'][2][32]);  /* 网络错误，加载失败！*/
                }
            });
        },


        // 选择定位
        chosePosi(item,type,ind){
            const that =  this;
            that.currInd = ind;
            let point = {};
            if(!type){
                that.newAddr['id'] = 0;
                that.newAddr['address'] = item.address;
                that.newAddr['lng'] = item['lng'];
                that.newAddr['lat'] = item['lat'];
                point['lng'] = item['lng'];
                point['lat'] = item['lat'];

            }else{
                that.newAddr['id'] = 0;
                that.newAddr['address'] = item.address;
                that.newAddr['lng'] = item.point['lng'];
                that.newAddr['lat'] = item.point['lat'];
                point['lng'] = item.point['lng'];
                point['lat'] = item.point['lat'];
            }
            HN_Location.lnglatGetTown(point,function(data){
                var province = '',city = '',district = '',town  = '';
                if( data.province){
                    province = data.province.replace('省','').replace('市',''); // 省,直辖市
                }
                
                if(data.city){
                    city = data.city.replace('市',''); // 市
                }
                
                if(data.district){
                    district = data.district.replace('区','').replace(city,'');
                }
                
                if(data.town){
                    town= data.town.replace('镇','').replace('街道','');
                }

                if(province || city || district || town){
                    that.calcAddrid(province,city,district,town)
                }else{
                    that.calcAddrid(province,city,district,town)

                }
            })
            // that.calcAddrid(province , city, district , town)
        },

        calcAddrid(myprovince,mycity,mydistrict,town){
            const that = this;
            var cityArr = [myprovince,mycity,mydistrict,town]
            if(myprovince == mycity){
                cityArr = [myprovince,mydistrict,town]
            }
            that.addridArr = [];
            that.addrname = [];
            console.log(cityArr)
            that.checkCityid(cityArr,0);
        },

        // 获取城市id
        async checkCityid(strArr,type){
            const that = this;
            // var id = 0;
            // switch(type){
            //     case 0 : 
            //         id = 0;
            //         break;
            //     case 1 : 
            //         id = pid;
            //         break;
            //     case 2 : 
            //         id = cid;
            //         break;
            //     case 3 : 
            //         id = did;
            //         break;
            // }
            // var typeStr = '&type='+id;

            // $.ajax({
            //     url: "/include/ajax.php?service=siteConfig&action=area" + typeStr,
            //     type: "POST",
            //     dataType: "jsonp",
            //     success: function(data){
            //         if(data && data.state == 100){
            //             var city = data.info;
            //             that.checkInArray(strArr,city,type)
            //         }else{
            //             that.newAddr['addrid'] = that.addridArr[that.addridArr.length - 1];
            //             that.newAddr['addridArr'] = that.addridArr;
            //             // if(newAddr){
            //             //     that.getAllAddrList('add')
            //             // }
            //         }
            //     }

            // })

            if(citys.length == 0){
                await that.getCitys();
            }
            // $('.loadIcon').removeClass('fn-hide')
            that.matchCity(citys,0,strArr)

        },

        getCitys(id = 0,strArr){
            $.ajax({
                url: "/include/ajax.php?service=siteConfig&action=area&type=" + id ,
                type: "POST",
                dataType: "json",
                async:false,
                success: function(data){
                    if(data && data.state == 100){
                        citys = data.info
                    }
                }
            })
        },

        async matchCity(city,type,strArr){
            const that = this;
            let str = strArr[type];
            let cityChecked = false
            for(let i = 0; i < city.length; i++){
                let currCity = city[i];
                let cityname = currCity.typename.replace('省','').replace('市','').replace('区','').replace('镇','')
                if(cityname.includes(str) || (str && str.includes(cityname))){ //匹配上之后就匹配下一级
                    cityChecked = true; //找到了
                    addridsArr.push(currCity.id);
                    addrArr.push(currCity.typename)   
                    if(currCity.lower){ //查找到之后 应该查找下一级
                        await that.getCitys(currCity.id);
                        type++
                        if(type < strArr.length){
                            that.matchCity(citys,type,strArr)
                        }
                    }
                    break;
                }
            }
            that.newAddr['addrid'] = cityChecked && addridsArr[addridsArr.length - 1] || '';
            if(!cityChecked){
                if(type < strArr.length){ //没查找到  继续匹配地图返回数据的洗衣机
                    ++type
                    that.matchCity(citys,type,strArr)
                }else if(addridsArr.length == 0){ //查找结束 
                    showErrAlert('当前城市未开通招聘功能')
                }
            }

            if(type >= (strArr.length - 1)){
                $('.loadIcon').addClass('fn-hide')
            }
            
        },


        checkInArray(strArr,city,type){
            const that = this;
            let hasChose = false;
            for(let i = 0; i < city.length; i++){
                if(city[i].typename.indexOf(strArr[type]) > -1 || (strArr[type] && strArr[type].indexOf(city[i].typename) >-1)){
                    switch(type){
                        case 0 : 
                            pid = city[i].id;
                            break;
                        case 1 : 
                            cid = city[i].id;
                            break;
                        case 2 : 
                            did = city[i].id;
                            break;
                        case 3 : 
                            tid = city[i].id;
                            break;
                    }
                    type++;
                    that.addridArr.push(city[i].id)
                    that.addrname.push(city[i].typename)
                    if(type < strArr.length){
                        that.checkCityid(strArr,type)
                        that.newAddr['addrid'] = that.addridArr[that.addridArr.length - 1];
                        that.newAddr['addridArr'] = that.addridArr;
                        console.log('测试1',that.newAddr['addridArr'])
                    }else{
                        that.newAddr['addrid'] = that.addridArr[that.addridArr.length - 1];
                        that.newAddr['addridArr'] = that.addridArr;
                        // if(newAddr){
                        //     that.getAllAddrList('add')
                        // }
                         console.log('测试12',that.newAddr['addridArr'])


                    }
                }else if(!strArr[type]){
                    hasChose = true;
                }
            }
            if(!hasChose){
                if(type < (strArr.length - 1)){
                    type = type + 1;
                    that.checkInArray(city,type)
                }else{
                    hasChose = true;
                }
            }
            
        },

        confirmAddr(){
            const that = this;
            var obj = {
                id:0,
                add:true,
                lng:that.newAddr.lng,
                lat:that.newAddr.lat,
                address:that.newAddr.address,
                addrid:that.addrid ? that.addridArr[that.addridArr.length - 1] : 0
            }
            for(var i = 0; i < that.jobAddrList.length; i++){
                if(that.jobAddrList[i].id == 0){
                    that.jobAddrList.splice(i,1)
                    break;
                }
            }
            that.jobAddrList.unshift(obj)
            that.formData.job_addr_id = 0;
            that.hideAddPosiPop();
            that.hidePop()
        },

        // 隐藏弹窗
        hideAddPosiPop(){
            const that = this;
            that.addWorkPosi = false;
        },


        checkAddress(){
            const that = this;
            const ind = that.jobAddrList.findIndex(item => {
                return item.id == that.formData.job_addr_id;
            });
            return ind > -1 ? that.jobAddrList[ind].address : '';
        },

        // picker回显
        checkValue(val,key){
            const that = this;
            let valText = ''
            if(!val && val!==0) return valText;

            let keyName = '';
            if(key == 'nature'){
                keyName = 'jobNature'
            }else if(key == 'education' || key == 'experience'){
                keyName = key
            }
            const arr = that.baseConfig[keyName] ? that.baseConfig[keyName] : []
            
            for(let i = 0; i < arr.length; i++ ){
                if(val == arr[i].id){
                    valText = arr[i].typename;
                    break;
                }
            }
            
            if(key == 'dy_salary'){
                for(let i = 0; i < that.dySalaryArr.length; i++ ){
                    if(val == that.dySalaryArr[i].value){
                        valText = that.dySalaryArr[i].text;
                        break;
                    }
                }
            }

            if(!valText){
                valText = '不限'
            }
            return valText
        },

        checkIndex(val,key){
            const that = this;
            let valIndex = 0;
            if(!val) return valIndex;

            let keyName = '';
            if(key == 'nature'){
                keyName = 'jobNature'
            }else if(key == 'education' || key == 'experience'){
                keyName = key
            }
            const arr = that.baseConfig[keyName] ? that.baseConfig[keyName] : []
            for(let i = 0; i < arr.length; i++ ){
                if(val == arr[i].id){
                    valIndex = i;
                    break;
                }
            }

            return valIndex
        },

        checkSalaryIndex(type){
            const that = this;
            const ind = that.salaryArr.findIndex(item => {
                return item == that[type]
            })
        },

        confirmChose(value, index){
            const that = this;
            if(that.popType == 'jobNature'){
                that.formData.nature = value.id
            }else if(that.popType == 'education' || that.popType == 'experience'){
                that.formData[that.popType] = value.id
                if(that.popType == 'education'){
                    that.formData['educational'] = value.id
                }
            }else if(that.popType == 'dy_salary'){
                that.formData[that.popType] = value.value;
            }
            that.hidePop()
        },

    

        salaryChange(type){
            const that = this;
            if(type === 2){  //最高薪资
                that.max_salary = this.$refs.max_salary.getValues()[0].text; 
                for(let i = 0; i < that.salarObjArr_min.length; i++){
                    if(that.salarObjArr_min[i].text > that.max_salary && that.max_salary){
                        that.salarObjArr_min[i].disabled = true
                    }else{
                        that.salarObjArr_min[i].disabled = false
                    }
                }
            }else{  //最低薪资
                that.min_salary = this.$refs.min_salary.getValues()[0].text;
                for(let i = 0; i < that.salarObjArr_max.length; i++){
                    if(that.salarObjArr_max[i].text < that.min_salary && that.min_salary ){
                        that.salarObjArr_max[i].disabled = true
                    }else{
                        that.salarObjArr_max[i].disabled = false
                    }
                }
            }
        
        },


        // 验证数据完整性
        checkFormData(step,noTip){
            const that = this;
            let stop = false;
            let tip = '';
            // if(!that.formData.number && !noTip){
            //     that.formData.number = 1
            // }
            const checkArr = ['type','title','nature','job_addr_id','min_salary','max_salary','number','valid','education','experience','note']
            const checkArrTip = ['请选择职位','请填写职位标题','请选择职位性质','请选择工作地点','请填写薪资待遇','请填写薪资待遇','请填写招聘人数','请选择有效期','请选择学历要求','请选择经验要求','请填写工作内容','请填写岗位职责']
            for(let i = 0; i < checkArr.length; i++){
                if(that.formData[checkArr[i]] === ''){
                    if(checkArr[i] == 'number' ){
                        if(!noTip){
                            that.formData[checkArr[i]] = 1; //招聘人数至少1人
                        }
                    }else 
                    if(checkArr[i] == 'job_addr_id' ){
                        if(!noTip){
                            tip = ('请选择工作地点');
                            stop = true;
                            break;
                        }
                        
                    }
                    else if(checkArr[i] == 'valid' ){
                        if( !that.formData.long_valid){

                            tip = ('请选择职位有效期');
                            stop = true;
                            break;
                        }
                    }else if((checkArr[i] == 'min_salary' || checkArr[i] == 'max_salary')  ){
                        if( !that.formData.mianyi){
                            tip = (checkArrTip[i]);
                            stop = true;
                            break;
                        }
                    }else if(checkArr[i] !== 'valid'){
                        tip = (checkArrTip[i]);
                        stop = true;
                        break;
                    }else{
                        tip = (checkArrTip[i]);
                        stop = true;
                        break;
                    }

                }
            }



            if(!noTip && tip){
                showErrAlert(tip)
            }

            return stop;
        },

        // 面议切换
        changeMy(){
            const that = this;
            that.formData.mianyi = (that.formData.mianyi ? 0 : 1)
        },


        // 薪资验证
        checkNumber(type){
            const that = this;
            let salary = that.formData[type + '_salary'];
            salary = Number(salary)
            if(that.formData.salary_type === 1){
                if(isNaN(salary)){
                    salary = '';
                    showErrAlert('请输入数字')
                }else if(salary < 10000 && salary > 1000){
                    salary = parseInt(salary / 100) * 100
                }else if(salary >= 10000 ){
                    salary = parseInt(salary / 1000) * 1000
                }else{
                    salary = salary < 1000 ? 1000 : salary; //最低薪资是1000
                }
            }else{
                if(isNaN(salary) || !salary){
                    salary = '';
                    if(isNaN(salary)){
                        showErrAlert('请输入数字')
                    }
                }else if(salary < 10000 && salary > 1000){
                    salary = parseInt(salary / 100) * 100
                }else if(salary >= 10000 ){
                    salary = parseInt(salary / 1000) * 1000
                }else{
                    salary = parseFloat(salary.toFixed(1))
                }
            }

            that.formData[type + '_salary'] = salary;
            if(type == 'min' && that.formData[type + '_salary'] >= that.formData.max_salary && that.formData.max_salary){
                // let check_type = type == 'min' ? 'max' : 'min'
                // that.formData[type + '_salary'] = (that.formData.max_salary - 1000)  >= 1000 ? (that.formData.max_salary - 1000) : 1000;
                // that.formData.max_salary = that.formData.max_salary - 1000 >= 1000 ? that.formData.max_salary : 2000;
                that.formData.max_salary  = ''
            }
            if(type == 'max' && that.formData[type + '_salary'] < that.formData.min_salary  && that.formData.min_salary){
                that.formData[type + '_salary'] = that.formData.min_salary + 1000;
            }
            
            
        },

        // 页面发生改变时 判断是否返回上一页
        confirmBackPop(){
            const that = this;
            if(that.changeForm){
                const options = {
                    title:'确定离开职位编辑页面？',
                    confirmTip:'可以为您保存已填写内容至下架职位',
                    btnSure:'保存并离开',
                    isShow:true,
                    btnCancelColor:'#000',
                    btnColor:'#3C7CFF',
                    popClass:'myConfirm'
                }
                confirmPop(options,function(){
                    that.changeForm = false;
                    if(that.id){
                        that.submitData()
                    }else{
                        that.saveData()
                        history.go(-1);
                    }
                },function(){
                    // 不需要执行操作
                    
                })

            }else{
                history.go(-1);
            }
        },


         // 信息切换
         checkLeft(){
            const left = $(".header-address.tabBox .on_chose").position().left + $(".header-address.tabBox .on_chose").width() / 2  - $(".header-address.tabBox s").width() / 2;
            
            $(".header-address.tabBox s").css({
                left:left
            })
        },


        // 新增地址相关
        toMapDefine(){
            const that = this;
            let dataArr = []
            that.newAddr['lng'] = that.lng
            that.newAddr['lat'] = that.lat
            for(let item in that.newAddr){
                dataArr.push({
                    'name':item,
                    'value':that.newAddr[item]
                })
            }
            
            if(that.district){
                dataArr.push({
                    'name':'district',
                    'value': JSON.stringify(that.district)
                })
            }
            
            dataArr.push({
                'name':'returnUrl',
                'value': window.location.href
            })
            that.saveData(); //保存之前输入的数据
            that.changeForm = false;
          
            localStorage.setItem('infoData', JSON.stringify(dataArr));
        },

        // ai获取关键字
        getAiKey(){
            const that = this;
            let typename = that.choseTypeObj && that.choseTypeObj.length && that.choseTypeObj[that.choseTypeObj.length - 1].typename || '';
            let options = [],keyArr = [];
            let salaryName = ''
            if(!typename){
                showErrAlert('请先选择职位分类');
                return false;
            }
            if(!that.formData.title){
                showErrAlert('请先输入职位名称');
                return false;
			}
            keyArr.push(that.formData.title)
            if(that.formData.mianyi){
				options.push(`薪资:面议`)
			}else{
				let salary = that.formData.min_salary
                
				if(!salary){
					salary =  that.formData.max_salary
				}else{
					salary = salary + (that.formData.max_salary ? '-' : '' ) + that.formData.max_salary
				}
				if(salary){
					options.push(`薪资:${salary}`)
				}

                salaryName = salary
			}

            keyArr.push(options.join(','))
            let typeName_all_arr = that.choseTypeObj.map(item => item.typename)
            let typeName_all = typeName_all_arr.join('-')
            return {
				typename:typeName_all, //分类
				note:that.formData.note.trim(),  //输入的内容
				options:keyArr,  //其他选项
			}
        },
    },

    watch:{
        addWorkPosi:function(val){
            const that = this;
            if(!map && (!that.lng || !that.lat) && val){
                HN_Location.init(function (data) {
                    if (data == undefined || (data.address == "" && data.name == "") || data.lat == "" || data.lng == "") {
                        console.log('定位失败，请刷新页面');
                        that.drawMap()
                    } else {
                        var name = data.name == '' ? data.address : data.name;
                        that.lng = data.lng;
                        that.lat = data.lat;
                        // that.city = data.city;
                        posiCity = data.city;
                        if (that.city == '') {
                            that.city = posiCity;
                        }
                        that.addrArr = data.city + ' ' + data.district

                        // 生成地图
                        that.drawMap(data)
                    }
                },device.indexOf('huoniao') <= -1 );
            }else if(val && !map){
                that.drawMap(that.newAddr)
            }
            
        },
        formData:{
            handler:function(val){
                this.changeForm = true;
                // console.log(1)
            },
            deep:true,
        },

        choseTypeObj:{
            handler:function(val){
                const that = this;
                if(!that.id){

                    that.formData.title = val[val.length - 1].title
                }
            },
            deep:true
        },

        'formData.salary_type':function(val){
            const that = this;
            if(val == 2){
                that.min_salary = that.formData.min_salary
                that.max_salary = that.formData.max_salary
                that.formData.min_salary = that.min_salary_hour
                that.formData.max_salary = that.max_salary_hour
            }else{
                that.min_salary_hour = that.formData.min_salary
                that.max_salary_hour = that.formData.max_salary
                that.formData.min_salary = that.min_salary
                that.formData.max_salary = that.max_salary
            }
        },
        'formData.mianyi':function(){
            console.log(this.formData.mianyi);
        },

        currStep(val){
            const that = this;
            if(this.id){
                this.$nextTick(()=>{
                    this.checkLeft()
                })
            }

            if(val == 1){
                that.$nextTick(() => {
                    if(typeof(ai2ContentVue) != 'undefined'){
                        ai2ContentVue.initAi2Con($('.aiBtnBox'),'job',that,function(d){
                            if(d){
                                that.formData.note = d
                            }
                        },that.getAiKey)
                    }
                })
            }
        },
    }
})