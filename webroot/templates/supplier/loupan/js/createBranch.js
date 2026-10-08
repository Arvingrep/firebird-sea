var pageVue = new Vue({
    el: '#page',
    data(){
        

        return{
            showPop:false,
            navList:navList,
            currid:currid,
            hoverid:'',


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
                commission:'', //平台分佣
                tax:'', //平台扣税
                grant:grant, //授权
            },
            rules_form:{

            }
        }

    },
    mounted(){
        
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

        // 验证当前手机号 是否已注册
        checkPhone(key){
            const that = this;
            console.log(1111111)
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

         
            let url = `/include/ajax.php?service=member&action=registAccountCheck`;
            $.ajax({
                url: url,
                type: "POST",
                data:{areaCode:86,account:that.rsaEncrypt(key),rtype:3,rsaEncrypt:1},
                dataType: "json",
                success: function(data){
                    if(data.state == 101 && data.info.indexOf('此手机号已被注册') > -1){
                        that.error.tip = '该账号已注册，可直接授权分销'
                        that.error.onError = true;
                        that.error.button = true;
                        that.error.name = 'phone';
                    }
                }
            })
        },

        rsaEncrypt(data){

            if(typeof JSEncrypt == 'function'){
        
                var returnData = [];
        
                //验证公钥
                if(typeof encryptPubkey == 'undefined' || encryptPubkey == ''){
                    return data;
                }
        
                data = encodeURIComponent(data.toString());
                
                var pubkey = encryptPubkey;
                pubkey = pubkey.replace("-----BEGIN PUBLIC KEY-----\n","");
                pubkey = pubkey.replace("\n-----END PUBLIC KEY-----","");
        
                var encrypt = new JSEncrypt();
                encrypt.setPublicKey(pubkey);
        
                //内容长度大于100，自动分组
                if(data.length > 100){
                    var lt = data.match(/.{1,2}/g);
                    lt.forEach(function (entry) {
                        returnData.push(encrypt.encrypt(entry));
                    });
                }else{
                    returnData.push(encrypt.encrypt(data));
                }
        
                return returnData.join('||rsa||');  //多个分组数据用||rsa||分隔，后台接收时需要先进行分组解密再组合
        
            }else{
                return data;
            }
        
        },

        // 上传图片
        fileChange(e){
            const that = this;
            console.log(e.target['files'][0])
            let file = e.target['files'][0];
            if (window.FileReader) {
                var reader = new FileReader();
                reader.readAsDataURL(file); 
                reader.onload = function(e) {
                    var formData = new FormData();
                    let tempPath = this.result;
                    that.formData.logoUrl = tempPath
                    formData.append("Filedata", file);
                    formData.append("name", file.name);
                    formData.append("lastModifiedDate", file.lastModifiedDate);
                    formData.append("size", file.size);
                    that.uploadImg(formData)
                    
                }
            } 
        },

        uploadImg(data){
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
                        that.formData.logo = data.url
                        that.formData.logoUrl = imgPath
                    }else{
                        alert('图片上传失败，请稍后重试');
                        that.formData.logo = ''
                        that.formData.logoUrl = ''
                    }
                },
                error: function () { }
            });
        },

        copyToClipboard() {
            const range = document.createRange();
            range.selectNode(document.getElementById("copyInner"));
            const selection = window.getSelection();
            if (selection.rangeCount > 0) selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand("copy");
            showErrAlert('已复制分销邀请链接','success')
        },

        // 数据提交
        submit:function(){
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
            let url = `/include/ajax.php?service=house&action=route&route=marketing/createDistributor&lpid=${loupanid}`;
            $.ajax({
                url: url,
                data: that.formData,
                type: "POST",
                dataType: "json",
                success: function(data){
                    if(data.state == 100 ){
                        that.$message({
                            message: '创建成功',
                            type: 'success'
                        })
                        setTimeout(function(){
                            location.reload()
                        },1000)
                    }
                }
            })
        }
    }
})