new Vue({
    el:'#page',
    data:{
        pageType:pageType ? pageType : 'smartySet', //显示类型 smartySet=>智能设置  email=>邮箱设置
        isload:false, //正在保存
        email:userEmail, //用户绑定的邮箱
        form:{
            sms_delivery:sms_delivery == '1' ? 1 : 0, //短信投递
            sms_fair:sms_fair== '1' ? 1 : 0,  //招聘会
            sms_interviewRefuse:sms_interviewRefuse== '1' ? 1 : 0,  //面试取消
            sms_onlineNotice:sms_onlineNotice== '1' ? 1 : 0,
            email:email,
            email_delivery:email_delivery== '1' ? 1 : 0,  //投递简历邮件通知
            email_fair:email_fair== '1' ? 1 : 0,
            emailnotice:emailnotice== '1' ? 1 : 0,
            email_buyResume:email_buyResume== '1' ? 1 : 0, //自动发送邮件
        },

        smartyForm:{
            time:time, //投递间隔
            account:account.split(','), //账号限制
            min_age:'',
            max_age:'', //最大年龄
            experience:'',//经验
            // experience_off:'', //相差
            salary:'',//薪资
            // salary_off:'', //相差
        
            // min_age:'',//薪资
            // min_age_off:'', //相差
            // max_age:'',//薪资
            // max_age_off:'', //相差

            education:'', //教育
            complete:'', //完成度

        },

        optionArr:[{
            id:-1,
            text:'不限',
        },{
            id:-2,
            text:'不高于发布',
            type:''
        },
        {
            id:0,
            text:'与要求相差',
            type:''
        }],
        xlArr:[{
            value:-1,
            text:'不限',
        },{
            value:-2,
            text:'按发布学历要求',
        }],
        complete:'',
        education:'',
        salary:'',
        experience:'',//选择器中显示
        showPop:false,
        time:'',
        showType:'time', //salary =>薪资 education=>学历  experience=>经验 complete => 完成度
        completionList:[60,85,90],
        timeArr:[{
            value:0,
            text:'不限'
        },{
            value:1,
            text:'1个月'
        },{
            value:2,
            text:'2个月'
        },{
            value:3,
            text:'3个月'
        },{
            value:6,
            text:'6个月'
        },{
            value:12,
            text:'1年'
        },], //再投时间选择 单位月
    },
    mounted(){
        const that = this;
        that.initData()
    },
    methods:{
        initData(){
            const that = this;
            var  delivery_refuse_data = delivery_refuse ? JSON.parse(delivery_refuse) : {};
            for(var item in delivery_refuse_data){
                var item_value = delivery_refuse_data[item] ? Number(delivery_refuse_data[item])  : ''
                that.smartyForm[item] = item_value;
                
            }
            that.salary = that.smartyForm['salary'];
            that.experience = that.smartyForm['experience'];
            that.education = that.smartyForm['education'];
            that.complete = that.smartyForm['complete'];
            that.time = that.smartyForm['time'];
            // console.log( that.smartyForm)

        },
    
        saveData(){
            const that = this;
            if(!that.form.email){
                showErrAlert('请先填写邮箱')
                return false
            }

            if(that.isload) return false;
            that.isload = true;
            
            $.ajax({
				url: '/include/ajax.php?service=job&action=updateCompanyNotice',
                data:that.form,
				type: "POST",
				dataType: "json",
				success: function (data) {
                    that.isload = false;
                    if(data.state == 100){
                        showErrAlert('保存成功');
                        location.reload()
                    }else{
                        showErrAlert(data.info)
                    }
				},
				error: function () { 
                    that.isload = false;
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！';
				}
			});
        },

        checkValue(name){
            const that = this;
            let showText = ''
            switch(name){
                case 'time':
                    showText = that.smartyForm[name] == 12 ? '1年':  (that.smartyForm[name] > 0 ? that.smartyForm[name] + '个月' : '不限')
                    console.log(that.smartyForm[name] == 12)
                    break;
                case 'min_age':
                    if(that.smartyForm[name] > 0){
                        showText = that.smartyForm[name]
                    }
                    break;
                case 'max_age':
                    if(that.smartyForm[name] > 0){
                        showText = that.smartyForm[name]
                    }
                    break;
                case 'education':
                    if(that.smartyForm[name] == -1){
                        showText = '不限'
                    }else if(that.smartyForm[name] == -2){
                        showText = '按发布学历要求'
                    }
                    break;
                case 'experience':
                    if(that.smartyForm[name] == -1){
                        showText = '不限'
                    }else if(that.smartyForm[name] == -2){
                        showText = '按发布经验要求'
                    }else{
                        showText = '与要求相差' + that.smartyForm[name];
                    }
                break;

                case 'salary':
                    if(that.smartyForm[name] == -1){
                        showText = '不限'
                    }else if(that.smartyForm[name] == -2){
                        showText = '不高于发布薪资'
                    }else{
                        showText = '与发布薪资偏差' + that.smartyForm[name];
                    }
                    break;
                case 'complete':
                    showText = that.smartyForm[name] ? (that.smartyForm[name] + '%') : '不限'
                    break;
            }
            return showText;
        },

        setEmail(){
            const that = this;
            let options = {
                title: '确定将<b style="color:#4B91FA;">'+emailEncrypt+'</b></br>设为招聘邮箱？',    // 提示标题
                isShow:true,
                btnSure: '确定',
                btnColor:'#256CFA',
                btnCancelColor:'#000',
                popClass:'myConfirmPop'
            }

            
            confirmPop(options,function(){
                that.form.email = userEmail;
            })
        },

        // 选中实名认
        accountIn(val){
            const that = this;
            if(that.smartyForm.account.indexOf(val) > -1){
                that.smartyForm.account.splice(that.smartyForm.account.indexOf(val),1)
            }else{
                that.smartyForm.account.push(val)
            }
        },

        changeForm(name,item){
            const that = this;
            if(item.id){
                that[name] = item.id
            }else{
                that[name] = that.smartyForm[name] < 0 ? 0 : that.smartyForm[name] 
            }
            
        },

        // 修改输入框
        changeInput(name,type){
            const that = this;
            that[name] = $(event.currentTarget).val()
            if(type){
                that.smartyForm[name] =  $(event.currentTarget).val()
            }
            console.log(name,that[name])
        },


        // 点击确定
        confirmValue(name){
            const that = this;
            if(name == 'education'){
                that.smartyForm.education = that.education
            }else if(name == 'time'){
                
                that.smartyForm.time = that.time
            }
            that.showPop = false
        },

        // 滚轮滑动
        valHasChange(obj,val){
            this.education = val.value
        },
        // 滚轮滑动
        valHasChange_time(obj,val){
            this.time = val.value
            console.log(time)
        },

        // 保存智能

        saveData_smarty(){
            const that = this;
            var tt = this;
            if(tt.isload ) return false;
            tt.isload = true;

            var delivery_limit = {
                time:tt.smartyForm.time,
                account:tt.smartyForm.account
            };

            var delivery_refuse = {}
            for(item in tt.smartyForm){
                if(item != 'time' && item !='account'){
                    delivery_refuse[item] = tt.smartyForm[item]
                }
            }

            let data = {
                delivery_refuse,
                delivery_limit
            }
			$.ajax({
				url: '/include/ajax.php?service=job&action=updateDeliveryLimit',
                data:data,
				type: "POST",
				dataType: "json",
				success: function (data) {
                    tt.isload = false;
                    if(data.state == 100){

                        showErrAlert('保存成功');
                        // setTimeout(() => {
                        //     location.reload()
                        // }, 1500);
                    }else{
                        showErrAlert(data.indo);
                    }
				},
				error: function () { 
                    tt.isload = false;
                    showErrAlert('网络错误，请稍后重试！');
				}
			});
        }


    },
    watch:{
        
    }
})