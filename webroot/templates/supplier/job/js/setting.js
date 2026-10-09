var pageReload = true;
var nowBtn = null;
var nowCode = '';
var page = new Vue({
    el:'#page',
    data:{
        currid:10,
        hoverid:'',
        navList:navList,
        currNavOn:0, //当前所在的 导航
        
        bindInfoForm:{
            sms_delivery:false, //投递短信
            sms_onlineNotice:false, //在线消息通知
            sms_interviewRefuse:false, //面试消息
            sms_fair:false, //招聘会消息
        
            email_delivery:false, //投递邮件
            email_buyResume:false, //自动发送简历到邮箱
            email:'',
        },
        smartyForm:{
            time:'', //投递间隔
            account:[], //账号限制
            min_age:'',
            max_age:'', //最大年龄
            experience:'',//经验
            experience_off:'', //相差
            salary:'',//薪资
            salary_off:'', //相差
        
            min_age:'',//薪资
            min_age_off:'', //相差
            max_age:'',//薪资
            max_age_off:'', //相差

            edu:'', //教育
            finish:'', //完成度
        },
        presmartForm:'',
        tiemSpaceList:[{ value:0, time:'不限' },{ value:1, time:'1个月' },{ value:3, time:'3个月' },{ value:6, time:'6个月' },{ value:12, time:'一年' },], //间隔选择
        completionList:[0,60,85,90],
        setNavList:[{
                id:0,
                title:'账号绑定'
            },
            // {
            //     id:1,
            //     title:'团队账号'
            // },
            // {
            //     id:2,
            //     title:'个性化主页'
            // },
            {
                id:3,
                title:'消息通知'
            },
            {
                id:4,
                title:'智能处理'
            },
            {
                id:5,
                title:'密码修改',
                url:memberDomain + '/security-chpassword.html'
            },
            {
                id:6,
                title:'账号注销',
                url:memberDomain  + '/logoff.html'
            },

        ],
        optionArr:[{
            id:'',
            text:'不限',
        },{
            id:1,
            text:'按发布1要求',
            type:''
        },
        {
            id:2,
            text:'与要求相差',
            type:''
        }],
        experienceText:'', //经验文字
        popover_experience:false, //是否显示弹窗

        popover_salary:false, //薪资弹窗
        salaryText:'', //薪资文字

        popover_edu:false, //教育弹窗
        eduText:'', //薪资文字

        popover_min_age:false,
        min_ageText:'',
        popover_max_age:false,
        max_ageText:'',
        focusIn:false, //是否聚焦
        businessInfo:'',
        isload:false,
        initData:false, //初始化
    },
    mounted(){
        this.presmartForm=this.smartyForm;
        var tt = this;
        // tt.getBaseConfig()
        // var checkInfo = setInterval(function(){
        //     if(mapPop && mapPop.businessInfo){
        //         tt.businessInfo = mapPop.businessInfo;
        //         console.log(tt.businessInfo)
        //         clearInterval(checkInfo)
        //     }
        // },1000)

        mapPop.getBusinessInfo(function(data){
            tt.businessInfo = data;
            if(data.delivery_limit) {

                tt.smartyForm.time = data.delivery_limit && data.delivery_limit.time ?  Number(data.delivery_limit.time) : '' ;
                if(data.delivery_limit.account.indexOf('1') > -1){
                    tt.smartyForm.account.push(1)
                }
                if(data.delivery_limit.account.indexOf('2') > -1){
                    tt.smartyForm.account.push(2)
                }
            }


            for(let item in tt.bindInfoForm){
                tt.bindInfoForm[item] = data[item] === '1' ? true : false
            }
            setTimeout(() => {
                tt.initData = true; //初始化成功
            }, 1500);
            var  delivery_refuse = data.delivery_refuse;
            for(var item in delivery_refuse){
                var item_value = delivery_refuse[item] ? Number(delivery_refuse[item])  : ''

                if(item != 'complete' && item != 'education'){
                    if(item_value >= 2){
                        tt.smartyForm[item + '_off'] = item_value
                    }else{
                        tt.smartyForm[item] = (item_value === -2 ? 1 : '')
                    }
                    
                    var item_name = item;
                    var valueShow = item_value != -2 && item_value != -1 ? 2 : tt.smartyForm[item_name]
                    tt.checkItem(valueShow,item_name)
                }

                if(item == 'education'){
                    tt.smartyForm['edu'] = (item_value === -2 ? 1 : '');
                    tt.checkItem(tt.smartyForm['edu'],'edu')
                }
                if(item == 'complete'){
                    tt.smartyForm['finish'] = item_value;
                }
                if(item.indexOf('age')!=-1){
                    tt.smartyForm[item]=item_value;
                }
                
            }
        })
    },
    methods:{
        // 获取相关筛选条件
        submit(data){
			var tt = this;
            tt.isload = true;
			$.ajax({
				url: '/include/ajax.php?service=job&action=updateDeliveryLimit',
                data:data,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
                    tt.isload = false;
                    if(data.state == 100){

                        mapPop.successTip = true;
                        mapPop.successTipText = '保存成功';
                        tt.presmartForm=JSON.parse(JSON.stringify(tt.smartyForm));
                    }else{
                        mapPop.showErrTip = true;
                        mapPop.showErrTipTit = data.info;
                    }
				},
				error: function () { 
                    tt.isload = false;
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！';
				}
			});
		},
        
        // 设置邮箱
        setEmail(){
            const that = this;
            mapPop.addEmailPop = true;
            mapPop.downResumeDetail = ''; //此处应该直接设置邮箱
        },

        // 点击
        checkItem(item,type,btn){
            var tt = this;
            tt.smartyForm[type] = typeof(item) == 'object' ? item.id : item;
            var id = typeof(item) == 'object' ? item.id : item;
            var unit ='';
            if(type == 'salary'){
                unit = echoCurrency("short")
            }else{
                var text_type = ''; 
                switch(type) {
                    case 'experience':
                        text_type = '经验';
                        unit = '年';
                        break;
                    case 'min_age':
                        text_type = ''
                        unit = '岁';
                        break;
                    case 'max_age':
                        text_type = ''
                        unit = '岁';
                        break;
                    case 'edu':
                        text_type = '学历'
                        break;
                    default:
                        text_type = ''
                    
                }
                
            }

            if(tt.smartyForm[type + '_off'] && id == 2){
                tt[type + 'Text'] = '与要求相差'+ tt.smartyForm[type + '_off'] + unit +'内';
                if(type == 'salary'){
                    tt[type + 'Text'] = '高于薪资范围'+ tt.smartyForm[type + '_off'] + unit +'内';
                }
            }else if(id === 1){
                tt[type + 'Text'] = '按发布'+ text_type +'要求';
                if(type == 'salary'){
                    tt[type + 'Text'] = '不高于薪资范围';
                }
            }else if(!id&&type.indexOf('age')==-1){
                tt[type + 'Text'] = '不限'
            }

            if((btn || id !== 2) && tt[type + 'Text']){
                tt['popover_' + type] = false;
            } 
        },


        // 跳转页面
        toUrl(type){    
            var  el = event.currentTarget;
            var url = $(el).attr('data-url');
            if(type){
                nowBtn = $(el);
                nowCode = url.split("type=")[1];
                loginWindow = window.open(url, 'oauthLogin', 'height=565, width=720, left=100, top=100, toolbar=no, menubar=no, scrollbars=no, status=no, location=yes, resizable=yes');

                $(this).addClass("disabled").html("<img src='"+staticPath+"images/loading_16.gif' /> "+langData['siteConfig'][6][134]+"...");  //绑定中

                //判断窗口是否关闭
                mtimer = setInterval(function(){
                    if(loginWindow.closed){
                        clearInterval(mtimer);

                        pageReload && location.reload();
                    }
                }, 1000);

                return false;
            }
            open(url);

        },

        // 提交数据
        submitConfig(type){
            var tt = this
            var delivery_limit = {
                time:tt.smartyForm.time,
                account:tt.smartyForm.account
            };

            var delivery_refuse = {
                "experience": tt.smartyForm.experience === 2 ? tt.smartyForm.experience_off : (tt.smartyForm.experience === 1 ? -2 : -1),
                "salary": tt.smartyForm.salary === 2 ? tt.smartyForm.salary_off : (tt.smartyForm.experience === 1 ? -2 : -1),
                "education":tt.smartyForm.edu === 1 ? -2 : -1,
                "min_age":tt.smartyForm.min_age,
                "max_age":tt.smartyForm.max_age,
                "complete":tt.smartyForm.finish
            }

            var data = {
                delivery_limit,
                delivery_refuse
            }
            tt.submit(data)

        },

        // 消息通知
        msgSetting(){
            const that = this;

            const obj = {};
            for(let item in that.bindInfoForm){
                if(item!='email'){
                    obj[item] = that.bindInfoForm[item] ? 1 : 0
                }else{
                    obj[item] = that.bindInfoForm[item]
                }
            };
            $.ajax({
				url: '/include/ajax.php?service=job&action=updateCompanyNotice',
                data:obj,
				type: "POST",
				dataType: "json",
				success: function (data) {
                    that.isload = false;
                    if(data.state == 100){

                        mapPop.successTip = true;
                        mapPop.successTipText = '保存成功';
                    }else{
                        mapPop.showErrTip = true;
                        mapPop.showErrTipTit = data.info;
                    }
				},
				error: function () { 
                    that.isload = false;
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！';
				}
			});
        },

        setDefaultEmail(email,email1){
            const that = this;
            // 弹窗
            mapPop.confirmPop = true, //显示or隐藏
            mapPop.confirmPopInfo = {
                icon:'',
                title:'确定将<b style="color:#1975FF;">'+email1+'</b>设置为招聘邮箱？',
                tip:'招聘邮箱可用于接收求职者简历、投递信息',
                // reload:true, //刷新页面传true，默认false
                btngroups:[
                    {
                        
                        tit:'取消',
                        cls:'btn_mid_140 cancel_btn',
                        fn:function(){
                            mapPop.confirmPop = false
                        },
                    },
                    {
                        tit:'确定',
                        cls:'btn_big',
                        fn:function(){
                            mapPop.addEmailPop = false;
                            that.initData = true;
                            that.bindInfoForm.email = email;
                            mapPop.confirmPop = false; //显示or隐藏
                            setTimeout(() => {
                                location.reload();
                            }, 1500);
                        },
                        type:'primary',
                    }
                ]
                
            }
        },
        toSetEmail(){
            const that = this;
            $(".setCon.setNav li").eq(0).click()
        }
    },
    watch:{
        // 弹窗显示/隐藏
        popover_exper:function(val){
            var tt = this;
        },

        focusIn:function(val){
        },
        bindInfoForm:{
            handler:function(val){
                const that = this;
                if(that.initData){
                    that.msgSetting()
                }
            },
            deep:true
        },
        currNavOn: function (val) {
            if(val==4){
                this.presmartForm=JSON.parse(JSON.stringify(this.smartyForm));
            }else{
                this.smartyForm=this.presmartForm;
            }
        },
        'smartyForm.min_age':function(val){
            this.smartyForm.min_age=String(val).replace(/[^\d]/g,'');
        },
        'smartyForm.max_age':function(val){
            this.smartyForm.max_age=String(val).replace(/[^\d]/g,'');
        }
    }
})