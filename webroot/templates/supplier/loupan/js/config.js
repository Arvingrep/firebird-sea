var pageVue = new Vue({
    el: '#page',
    data: {
        showPop:false,
        navList:navList,
        currid:currid,
        hoverid:'',

        tabOn:0,
        tabList:[
            { id:1, name:'分销配置'},
            { id:2, name:'分销文案'},
        ],

        checkOptions:[
            { label:'导入客户', value:'1'},
            { label:'线上客源', value:'2'},
            { label:'新房分销客源', value:'3'},
        ],

        formData:{
            status:1,  //分销功能 1-开启 0-关闭
            channelStatus:1,  //是否开启对外显示分销渠道方案 1-开启 0-关闭
            restrictCustomer:[], // 禁止报备客户名单 1-导入客户 2-线上客源 3-新房分销客源 可多选 英文逗号分隔
            restrictAccount:[],  //报备人账号限制 1-手机绑定 2-实名认证 可多选
            printStatus:1,  // 到访打印机 1-开启 0-关闭
            printConfig:{

            },

            protectDay:'', //客源私有保护期
            visitType:1, //带看资料核实操作类型 1-指定审核人数 2-全部审核人员
            visitValue:'', //指定带看审核人数的数值
            dealType:1, //成交资料核实操作类型 1-全部审核人员通过
            wechatNotice:1, //微信审核通知 1-开启 0-关闭
            appNotice:1 , //app审核通知 1-开启 0-关闭
            smsNotice:1, //短信审核通知 1-开启 0-关闭
            adText:'', //推广语
            callText:[''], //call说辞 多条英文逗号','分隔

        },
        callTextList:[''],
        isLoading:false,    //是否正在提交数据
    },
    mounted(){
        const that = this;
        that.getConfig()
    },
    methods:{
        // 显示切换账户
        show_change: function () {
            $(".change_account").show()
        },

        // 隐藏切换账户
        hide_change: function () {
            $(".change_account").hide()
        },


        changeTab(ind){
            const that = this;
            that.tabOn = ind
        },

        // 添加说辞
        addCallText(){
            const that  = this;
            that.callTextList.push('')
        },

        // 删除说辞
        delCallText(ind){ 
            const that  = this;
            that.callTextList.splice(0,ind)
        },

        // 获取配置信息
        getConfig(){
            const that = this;
             let url = `/include/ajax.php?service=house&action=route&route=marketing/getDistributorSystemConfig&lpid=${loupanid}`;
             $.ajax({
                 url: url,
                 dataType: "json",
                 success: function (data) {
                    if(data.state == 100){
                        // console.log(data.info)
                        for(let item in data.info.list){
                            if(item == 'callText' && data.info.list[item] &&  data.info.list[item].length > 0){
                                that.callTextList = data.info.list[item]
                            }else if(item == 'restrictCustomer' || item == 'restrictAccount'){
                                that.formData[item] = data.info.list[item].split(',')
                            }else{
                                that.formData[item] = data.info.list[item]
                            }
                        }
                    }
                 }
             });
        },


        // 保存配置信息
        saveConfig:function(){
            const  that = this
            if(that.isLoading) return false;
            that.isLoading = true
            let url = `/include/ajax.php?service=house&action=route&route=marketing/saveDistributorSystemConfig&lpid=${loupanid}`;
            let form = JSON.parse(JSON.stringify(that.formData));
            for(let key in form){
                if(Array.isArray(form[key])){
                    form[key] = form[key].join(',')
                }else if(key == 'callText'){
                    form[key] = JSON.stringify(that.callTextList.filter(item=>item))
                }
            }
            $.ajax({
                url: url,
                data: form,
                dataType: "json",
                success: function (data) {
                    that.isLoading = false
                    showErrAlert(data.info,data.state == 100 ? 'success' : '');
                    
                },
                error: function () { 
                    that.isLoading = false
                    showErrAlert('网络错误，请稍后重试！');
                }
            });
        }

    },

})