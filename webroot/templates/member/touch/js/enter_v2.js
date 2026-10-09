new Vue({
    el:'#page',
    data:{
        currStep:0, //当前状态 0 => 填写资料   1 => 等待审核  2=> 审核成功  3 => 审核失败
        steps:['基本资料','平台审核','入驻成功'],
        busiConfig:'',
        formData:{
            title:'',
            people:people,
            tel:'',
            addrid:'',
            address:'',
            idcard_front:'', //身份证前面
            idcard_back:'', //身份证后面
            license:'', //营业执照
            cityid:'',
        },
        // 显示的数据
        prevFormData:{
            addrids:[], 
            addrname:[], 
            idcard_frontUrl:'',
            idcard_backUrl:'',
            licenseUrl:'',
        },
        uploadType:0, // 0 => 营业执照  1 => 身份证
        agree:false,
        showPop:false, // 显示弹窗
        statePop:false,//状态弹窗S
        agreePop:false,
        reason:'营业执照照片太模糊，无法核实', //拒绝原因
        loading:false, //正在提交
        storeDetail:"",

        isUpload:false, //是否正在上传
        uploadId:'', //上传的id
    },
    mounted(){
        const that = this;
        that.getBusiConfig()
       
        
    },
    methods:{

        // 获取商家入驻配置
        getBusiConfig(){
            const that = this;
            $.ajax({
                accepts:{},
                url: '/include/ajax.php?service=business&action=config',
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        that.busiConfig = data.info;
                        console.log(data.info)
                        if(data.info.joinState == 0){
                            that.getBusiStoreDetail(); //商家信息
                            if(data.info.joinCheckMaterial.length == 1){
                                that.uploadType = data.info.joinCheckMaterial[0] == 'id' ? 1 : 0
                            }
                        }else{
                            showErrAlert('已关闭入驻功能，请联系网站管理员')
                            window.history.go(-1)
                        }
                    }
                },
                error: function () { }
            });
        },

        // 获取商家详情
        getBusiStoreDetail(){
            const that = this;
            $.ajax({
                accepts:{},
                url: '/include/ajax.php?service=business&action=storeDetail',
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        that.storeDetail = data.info;
                        that.checkStoreSate(data.info)
                    }else{
                        // 当前用户是个人
                        that.formData.tel = phone
                        that.formData.people = people
                        that.formData.idcard_back = idcardBack
                        that.formData.idcard_front = idcardFront
                        that.prevFormData.idcard_backUrl = idcardBackUrl
                        that.prevFormData.idcard_frontUrl = idcardFrontUrl
                        if(idcardBack && idcardFront){
                            that.uploadType = that.busiConfig.joinCheckMaterial.length > 1 || that.busiConfig.joinCheckMaterial.includes('id') ? 1 : 0
                        }
                    }
                },
                error: function () { }
            });
        },

        // 根据店铺信息 修改页面状态
        checkStoreSate(data){
            const that = this;
            if(data.state == '0'){ // 表示审核中
                that.currStep = 1;
            }else if(data.state == '2'){ //表示审核拒绝
                that.currStep = 3;
                that.reason = data.refuse; //拒绝原因
            }else{
            	if(data.member &&data.member.userType != 2){
                	console.log('用户信息出错')
            	}else{
					location.href = busiDomain + '?join=1&appFullSreen=1'
            	}
            }

            for(let item in that.formData){
                if(data.hasOwnProperty(item) && !item.includes('idcard') && item != 'license' ){
                    that.formData[item] = data[item]
                    if(item == 'tel' &&  Array.isArray(data[item])){
                        that.formData[item] = data[item][0]
                    }
                }else if(item == 'idcard_front'  && data['member']['idcardFront']){
                    that.formData[item] = data['member']['idcardFront']
                }else if(item == 'idcard_back' && data['member']['idcardBack']){
                    that.formData[item] = data['member']['idcardBack']
                }else if( item == 'license' &&  data['member'][item] ){
                    that.formData[item] = data['member'][item]
                }

            }
            // 没有上传过营业执照但是上传过身份证  优先显示身份证
            if(data['member']['idcardBack'] && data['member']['idcardFront'] && !data['member']['license']){
                that.uploadType = 1
            }
            for(let item in that.prevFormData){
                if(data.hasOwnProperty(item) && !item.includes('idcard') && item != 'licenseUrl' ){
                    that.prevFormData[item] = data[item]
                }else if(item == 'idcard_frontUrl' && data['member']['idcardFrontSource']){
                    that.prevFormData[item] = data['member']['idcardFrontSource']
                }else if(item == 'idcard_backUrl' && data['member']['idcardBackSource']){
                    that.prevFormData[item] = data['member']['idcardBackSource']
                }else if(item == 'licenseUrl'  && data['member']['licenseSource']){
                    that.prevFormData[item] = data['member']['licenseSource']
                }
            }
        },

        // 改变工作地址
        changeAddr() {
            var that = this;
            cityChosePage.showPop = true;
            cityChosePage.endChoseCity = that.prevFormData['addrids'];
            // cityChosePage.cityLevel = 2; 城市层级
            cityChosePage.currTabShow = that.prevFormData['addrids'].length - 1;
            cityChosePage.successCallBack = function (data) {
                // 地址选择点击完成之后
                that.prevFormData.addrname = []
                that.prevFormData['addrids'] = data.map(item => {
                    that.prevFormData.addrname.push(item.typename)
                    return item.id
                })
                that.formData.cityid = that.prevFormData['addrids'][0]
                that.formData.addrid = that.prevFormData['addrids'][that.prevFormData['addrids'].length - 1]
            };
        },

        fileInpChange(e){
            const that = this;
            let el = $(e.target);
            let file = e.target['files'][0]
            let id = $(el).attr('id');
            that['prevFormData'][id + 'Url'] = URL.createObjectURL(file)
            if (window.FileReader) {
                var reader = new FileReader();
                reader.readAsBinaryString(file)
                reader.onload = function(e) {
                    var formData = new FormData();
                    formData.append("Filedata", file);
                    formData.append("id", id);
                    formData.append("name", file.name);
                    formData.append("lastModifiedDate", file.lastModifiedDate);
                    formData.append("size", file.size);
                    that.uploadImg(formData,id)
                    
                }
            
                
            }
            
            
           
        },

        // 上传图片
        uploadImg(data,id){
            const that = this;
            that.isUpload = true;
            that.uploadId = id
            $.ajax({
                accepts:{},
                url: '/include/upload.inc.php?mod=siteConfig&type=atlas&filetype=image',
                data: data,
                type: "POST",
                processData: false, // 使数据不做处理
                contentType: false,
                dataType: "json",
                xhr:function(){
                    let newxhr = new XMLHttpRequest()
                    // 添加文件上传的监听
                    // onprogress:进度监听事件，只要上传文件的进度发生了变化，就会自动的触发这个事件
                    newxhr.upload.onprogress = function(e) {
                        let percent = (e.loaded / e.total) * 100 + '%'
                    }
                    return newxhr
                },
                success: function (data) {
                    that.isUpload = false;
                    that.uploadId = ''
                    if(data.state == 'SUCCESS'){
                        URL.revokeObjectURL(that['prevFormData'][id + 'Url'])
                        that['prevFormData'][id + 'Url'] = data.turl
                        that['formData'][id ] = data.url;
                    }
                },
                error: function () { 
                    that.isUpload = false;
                    that.uploadId = ''
                }
            });
        },

        // 提交数据
        submitData(){
            const that = this;
            let goOn = that.checkFormData()
            if(!goOn) return false;
            if(!that.agree){
                that.agreePop = true;
                return false;
            }
            if(that.loading) return false; //正在提交中...
            that.loading = true;
            let formData = {}
            for(let item in that.formData){
                if(that.uploadType == 0 && item.includes('idcard') || (that.uploadType == 1 &&  item == 'license')){
                    continue;
                }
                formData[item] = that.formData[item]
            }

            $.ajax({
                url: '/include/ajax.php?service=business&action=businessJoin',
                type: "POST",
                data:formData,
                dataType: "json",
                success: function (data) {
                    that.loading = false;
                    console.log(data)
                    if(data.state == 100){
                        if(that.busiConfig.joinCheck  != 0 && !that.storeDetail || (!that.busiConfig.editJoinCheck && that.storeDetail.state == '1')){  //表示不需要审核
                            location.href = busiDomain
                        }else {
                            that.currStep = 1; //处于审核状态
                        }
                    }else{
                        showErrAlert(data.info)
                    }
                },
                error: function () { }
            });
        },


        // 验证数据
        checkFormData(){
            const that = this;
            let param = '';
            let noCheck = [];
            if(!that.busiConfig.joinCheckMaterial.includes('id')){
                noCheck.push('idcard_front')
                noCheck.push('idcard_back')
            }
            if(!that.busiConfig.joinCheckMaterial.includes('business')){
                noCheck.push('license')
            }

            for(let item in that.formData){
                if(!that.formData[item] && !noCheck.includes(item)){
                    param = item
                    break;
                }
            }

            let tip = ''
            switch(param){
                case 'title':
                    tip = '请输入店铺名称'
                    break;
                case 'people':
                    tip = '请输入联系人姓名'
                    break;
                case 'tel':
                    tip = '请输入联系电话'
                    break;
                case 'address':
                    tip = '请输入详细地址'
                    break;
                case 'addrid':
                    tip = '请选择所在地区'
                    break;
                case 'idcard_front':
                    tip = '请上传身份证正面'
                    if(that.busiConfig.joinCheckMaterial.length == 2){
                        tip = '请上传身份证或者营业执照'
                    }
                    if(!that.busiConfig.joinCheckMaterial.includes('id') || (that.busiConfig.joinCheckMaterial.length == 2 && that.formData['license']) ){
                        tip = ''
                    }
                    
                    break;
                case 'idcard_back':
                    tip = '请上传身份证背面'
                    if(that.busiConfig.joinCheckMaterial.length == 2){
                        tip = '请上传身份证或者营业执照'
                    }
                    if(!that.busiConfig.joinCheckMaterial.includes('id') || (that.busiConfig.joinCheckMaterial.length == 2 && that.formData['license']) ){
                        tip = ''
                    }
                    
                    break;
                case 'license':
                    tip = '请上传营业执照';
                    if(that.busiConfig.joinCheckMaterial.length == 2){
                        tip = '请上传身份证或者营业执照'
                    }
                    if(!that.busiConfig.joinCheckMaterial.includes('business') || (that.busiConfig.joinCheckMaterial.length == 2 && that.formData['idcard_front'] && that.formData['idcard_back']) ){
                        tip = ''
                    }
                    break;
                
            }

            if(tip){
                showErrAlert(tip);
            }

            return !Boolean(tip)
        },
    }
})