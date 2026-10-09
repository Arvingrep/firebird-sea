toggleDragRefresh('off');
var workYears = [],
    ages = [];
    workYears.push({
        value:0,
        text:'暂无'
    })
for (let i = 1; i <= 60; i++) {
    if (i <= 10) {
        workYears.push({
            value: i,
            text: i < 10 ? (i + '年') : (i + '年以上')
        })
    } else if (i >= 18) {
        ages.push({
            value: i,
            text: i < 60 ? (i + '岁') : (i + '岁以上')
        })
    }
}

var pageVue = new Vue({
    el: '#page',
    data: {
        pageFromPost:0,
        loading:false, //正在提交
        // showChosePage:true, //显示选择分类页
        postTypeList:[], //分类页
        currChoseType: '', // 当前选择的一级分类
        currChoseStype: '', //二级分类
        showLeftPop: false, //二级分类页面左滑
        showRightPop: false, //三级分类页面左滑
        choseTypeArr: [], //选择的id
        choseTypeObj: [], //选中的内容
        changePhone:false, // 手机号是否修改
        formData: {
            id:0, //信息id,0表示创建
            job:[], //职位
            job_name:[], //职位名称
            addrid: '', //区域id
            addrid_list: [], //区域id 全部
            addrName: [], //区域名
            title:'',
            description: '',
            experience: 1, //经验
            experience_name: '', // 经验显示
            sex: 1, //性别
            age: 18, //年龄
            area_code: '86', //手机号区域代码
            vercode:'',  //手机验证码
            nickname:'',
            phone:userPhone,
            education:'',
            education_name:'',
            cityid:cityid, //城市分站
        },
        initNote: '', //文字存放
        textCount: 0, //数字统计
        showScrollPop: false, //弹窗显示
        columns: [{
            values: workYears,
            defaultIndex: 0,
        }, {
            values: [{
                value: 1,
                text: '男'
            }, {
                value: 2,
                text: '女'
            }],
            defaultIndex: 0,
        }, {
            values: ages,
            defaultIndex: 0,
        }],
        areaCodePop: false, //号码区域代码弹窗
        areaCodeList: [], //号码区域代码列表
        dataGeetest:'',

        fabuSuccessPop:false, //成功提示
        checkInfo:checkInfo === 1 ? 0 : 1, //信息是否需要审核 0不需要  1需要审核
        choseTypeArrCountObj:'', //选择的
    },
    mounted() {
        var tt = this;
        if(!tt.postTypeList.length){
            tt.getTypeList()
        }
        tt.getAreaCodeList();
        if(tt.getUrlParam('id')){ //表示编辑
            tt.showChosePage = false;
            tt.getQzDetail(tt.getUrlParam('id'))   
        }       
    

         // 极验相关
        if (geetest) {
            tt.$nextTick(() => {
                captchaVerifyFun.initCaptcha('h5','#codeButton',tt.sendVerCode)	
            })
        }
    },
    methods: {
        pageBack(){
            var tt = this;
            if((tt.pageFromPost === 1 && tt.showChosePage)|| (tt.pageFromPost === 2 && !tt.showChosePage)){
                tt.pageFromPost = 0;
                tt.showChosePage = !tt.showChosePage;
            }else{
                window.history.go(-1)
            }
        },
        initData(){
            var tt = this;
            // 工作内容初始化
            if (tt.formData.description) {
                var regex = /(<([^>]+)>)/ig;
                var conText = tt.formData.description;
                conText = conText.replace(regex, 1);
                tt.textCount = conText.length;
                tt.initNote = tt.formData.description;
            } else {
                tt.initNote = ''
            }
        },

        changeAddr() {
            var tt = this;
            cityChosePage.showPop = true;
            cityChosePage.endChoseCity = tt.formData.addrid_list;
            cityChosePage.currTabShow = tt.formData.addrid_list.length - 1;
            cityChosePage.successCallBack = function (data) {
                // 地址选择点击完成之后
                tt.formData.addrid_list = data.map(item => {
                    return item.id
                })
                tt.formData.addrName = data.map(item => {
                    return item.typename
                })
                tt.formData.addrid = tt.formData.addrid_list[tt.formData.addrid_list.length - 1];
            };
        },
        // 计算输入框输入的字数
        changeTextCount(action) {
            var tt = this;
            var el = event.currentTarget;
            if (event.keyCode != 8 && event.keyCode != 13 && !tt.textCount && !action) {
                tt.textCount = 1
            } else {
                var conText = $(el).text()
                tt.textCount = conText.length;
            }
            if (tt.textCount >= 500 && event.keyCode != 8) {
                event.returnValue = false;
            } else {
                event.returnValue = true;
            }

            tt.formData.description = $(el).html();
        },

        // 选择框确选择
        addWorkDate() {
            var tt = this;
            tt.showScrollPop = false;
            var data = tt.$refs.picker.getValues();
            tt.formData.experience = data[0].value
            tt.formData.experience_name = data[0].text
            tt.formData.sex = data[1].value
            tt.formData.age = data[2].value
        },

        // 获取手机号code
        getAreaCodeList() {
            var tt = this;
            $.ajax({
                url: '/include/ajax.php?service=siteConfig&action=internationalPhoneSection',
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        tt.areaCodeList = data.info;
                    }
                },
                error: function () {}
            });
        },


        // 极验
        // handlerPopupReg: function (captchaObjReg) {
        //     // 成功的回调
        //     var t = this;
        //     captchaObjReg.onSuccess(function () {
        //         var validate = captchaObjReg.getValidate();
        //         t.dataGeetest = "&geetest_challenge=" + validate.geetest_challenge + "&geetest_validate=" + validate.geetest_validate + "&geetest_seccode=" + validate.geetest_seccode;
        //         t.sendVerCode($('.getCode'));

        //     });
        //     captchaObjReg.onClose(function () {})

        //     window.captchaObjReg = captchaObjReg;
        // },

        // 获取短信验证码
        getPhoneMsg: function () {
            var tt = this;
            var btn = event.currentTarget;
            var phone = tt.formData.phone, areacode = tt.formData.area_code;

            if (phone == '') {
                showErrAlert(langData['siteConfig'][20][463]);//请输入手机号码
                return false;
            } else if (areacode == "86") {
                var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
                if (!phoneReg.test(phone)) {
                    showErrAlert('请输入正确的手机号码');   //手机号码格式不正确
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

        // 发送验证码
        sendVerCode: function (captchaVerifyParam,callback) {
            var tt = this;
            let btn = $('.getCode');
            btn.addClass('noclick');

            var phone = tt.formData.phone;
            var areacode = tt.formData.area_code;
    
            var  param = "&phone=" + phone + "&areaCode=" + areacode ;
            if(captchaVerifyParam && geetest == 2){
                param = param + '&geetest_challenge=' + captchaVerifyParam
              }else if(geetest == 1 && captchaVerifyParam){
                param = param +  captchaVerifyParam
              }
            var codeType = 'verify';
            $.ajax({
                url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify&terminal=mobile&type=" + codeType  +param,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(callback){
                        callback(data)
                      }
                    //获取成功
                    if (data && data.state == 100) {
                        tt.countDown(60, btn);
                        //获取失败
                    } else {
                        btn.removeClass("noclick").text(langData['siteConfig'][4][1]);  //获取验证码
                        showErrAlert(data.info);
                    }
                },
                error: function () {
                    btn.removeClass("noclick").text(langData['siteConfig'][4][1]);  //获取验证码
                    showErrAlert(langData['siteConfig'][20][173]);  //网络错误，发送失败！
                }
            });
        },

        // 倒计时
        countDown: function (time, obj, func) {
            times = obj;
            obj.addClass("noclick").text(langData['siteConfig'][20][5].replace('1', time));  //1s后重新发送
            mtimer = setInterval(function () {
                obj.text(langData['siteConfig'][20][5].replace('1', (--time)));  //1s后重新发送
                if (time <= 0) {
                    clearInterval(mtimer);
                    obj.removeClass('noclick').text(langData['siteConfig'][4][2]);
                }
            }, 1000);
        },


        // 验证
        checkReg(name,tip){
            var tt = this;
            var keepGo = true;
            var myreg=/^[1][3,4,5,6,7,8,9][0-9]{9}$/;
            if(name && name == 'phone'){
                if(!tt.formData.phone){
                    keepGo = false;
                    if(tip){
                        showErrAlert('请输入手机号')
                    }
                }else if(tip && tt.formData.area_code == '86' && !myreg.test(tt.formData.phone)){
                    showErrAlert('请输入正确的手机号');
                    keepGo = false;
                }
            }else{
                var arr = [{name:'title',tip:'请输入标题'},{name:'addrid',tip:'请选择工作地点'},{name:'experience',tip:'请选择工作经验'},{name:'sex',tip:'请选择性别'},{name:'age',tip:'请选择年龄'},{name:'description',tip:'请填写职位描述'},{name:'nickname',tip:'请填写联系人'},{name:'phone',tip:'请输入手机号'}];
                if(tt.changePhone){
                    arr.push({name:'vercode',tip:'请输入验证码'})
                }
                for(var item in tt.formData){
                    var ind = arr.findIndex(data =>{
                        return data.name == item && (!tt.formData[item] && tt.formData[item] != 0 || tt.formData[item].length == 0)
                    });
                    if(ind > -1){
                        keepGo = false;
                        showErrAlert(arr[ind].tip)
                        break;
                    }
                    if(item == 'phone'){
                        if(tt.formData.area_code == '86' && !myreg.test(tt.formData.phone)){
                            if(tip){
                                showErrAlert('请输入正确的手机号')
                            }
                            keepGo = false;
                            break;
                        }
                    }
                }
                
            }

            return keepGo;
        },

        // 提交数据
        submitData(){
            var tt = this;
            if(tt.loading) return false;
            
            if(!tt.checkReg('',1)) return false;
            tt.loading = true;

            var dataParam = JSON.parse(JSON.stringify(tt.formData));
            dataParam.job = dataParam.job.join(',');
            $.ajax({
                url: "/include/ajax.php?service=job&action=aeQz",
                data:dataParam,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    //获取成功
                    tt.loading = false;
                    if (data && data.state == 100) {
                        // showErrAlert(tt.formData.id ? '修改成功' : '发布成功')
                        tt.fabuSuccessPop = true;
                        if(!tt.checkInfo){
                            setTimeout(function(){
                                tt.fabuSuccessPop = false;
                                location.href = memberDomain + '/manage_worker.html';
                            },1800)
                        }
                    }else{
                        showErrAlert(data.info)
                    }
                },
                error: function () {
                    tt.loading = false;
                    showErrAlert('网络错误，请稍后重试！')
                }
            });
        },

        // 获取职位分类列表
        getTypeList(){
            var tt = this;
            $.ajax({
                url: '/include/ajax.php?service=job&action=type&tb=pg&son=1',
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    if (data.state == 100) {
                        tt.postTypeList = data.info;
                    }
                },
                error: function () {

                }
            });
        },

        // 选择当前分类
        chosePostType(item, type) {
            var tt = this;
            type = type ? type : 0;

            var hasFull = tt.choseTypeArr && tt.choseTypeArr.length >= 3 ? true : false;

            if (!type) { //一级分类
                tt.currChoseType = item;
                tt.currChoseStype = []; //清空二级
                tt.showRightPop = false;
                setTimeout(() => {
                    tt.showLeftPop = true;
                }, 50);

                return false;
            }
            if (type === 1) { //二级分类
                tt.currChoseStype = item;
                setTimeout(() => {
                    tt.showRightPop = true;
                }, 50);

                if (!item.lower || item.lower.length == 0) {
                    var choseArr = [tt.currChoseType.id, item.id]
                    var index = tt.choseTypeArr.findIndex(function (val) {
                        return tt.currChoseType.id == val[0] && item.id == val[1]
                    });
                    if (index > -1) {
                        tt.choseTypeArr.splice(index, 1)
                        tt.choseTypeObj.splice(index, 1)
                        hasFull = false;
                    } else {
                        if (hasFull) {
                            showErrAlert('职位最多只能选3个 ')
                            return false;
                        }
                        tt.choseTypeArr.push(choseArr);
                        tt.choseTypeObj.push({
                            id: item.id,
                            title: item.typename
                        })
                    }
                }


            }

            if (type === 2) {
                var choseArr = [tt.currChoseType.id, tt.currChoseStype.id, item.id];
                var index = tt.choseTypeArr.findIndex(function (val) {
                    return tt.currChoseType.id == val[0] && tt.currChoseStype.id == val[1] && item.id == val[2]
                });
                if (index > -1) {
                    hasFull = false;
                    tt.choseTypeArr.splice(index, 1)
                    tt.choseTypeObj.splice(index, 1)
                } else {
                    if (hasFull) {
                        showErrAlert('职位最多只能选3个 ')
                        return false;
                    }
                    tt.choseTypeArr.push(choseArr)
                    tt.choseTypeObj.push({
                        id: item.id,
                        title: item.typename
                    })
                }
            }



        },

        // 清除选中的 
        removeChose(item, ind, type) {
            var tt = this;
            
            var index = tt.choseTypeArr.findIndex(function (val) {
                return val.indexOf(item.id) > -1;
            })

            if (index > -1) {
                tt.choseTypeArr.splice(index, 1)

            }
            tt.choseTypeObj.splice(ind, 1)
        },

        // 验证是否被选中
        checkHasChosed(id, ind) {
            var tt = this;
            var index = tt.choseTypeArr.findIndex(function (val) {
                return val && val.length && val.indexOf(id) == ind
            })
            return index;
        },

        // 确定选择
        sureChose(){
            var tt = this;
            tt.formData.job = tt.choseTypeObj.map(item => {
                return item.id
            })
            tt.formData.job_name = tt.choseTypeObj.map(item => {
                return item.title
            });
            tt.showChosePage = false;
            tt.pageFromPost = 2;
            tt.formData.title =  tt.formData.job_name.join('/'); //默认标题
        },


        // 获取详情
        getQzDetail(id){
            var tt = this;
            $.ajax({
                url: "/include/ajax.php?service=job&action=qzDetail&id=" + id,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    //获取成功
                    if (data && data.state == 100) {
                        for(var key in tt.formData){
                            tt.formData[key] = data.info[key] ? data.info[key] : '';
                        }
                        if(data.info['job_list'].length){
                            tt.choseTypeArr = data.info['job_list']
                        }
                        for(var i = 0; i < data.info['job'].length; i++){
                            tt.choseTypeObj.push({
                                id:data.info.job[i],
                                title:data.info.job_name[i]
                            })
                        }
                        tt.initData()
                    } 
                },
                error: function () {
                
                }
            });
        },

        checkTypeNum(choseArr){
            var tt = this;
            var arrObj = {};
            for(var i = 0; i < choseArr.length; i++){
                if(arrObj[choseArr[i][0]] && arrObj[choseArr[i][0]].length > 0){
                    arrObj[choseArr[i][0]].push(choseArr[i][1])
                }else{
                    arrObj[choseArr[i][0]] = [choseArr[i][1]]
                }
            }
            tt.choseTypeArrCountObj = arrObj
        },

        // 获取url参数
        getUrlParam(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var reg_rewrite = new RegExp("(^|/)" + name + "/([^/]*)(/|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            var q = window.location.pathname.substr(1).match(reg_rewrite);
            if (r != null) {
            return unescape(r[2]);
            } else if (q != null) {
            return unescape(q[2]);
            } else {
            return null;
            }
        },

    },

    watch: {
        showScrollPop(val) {
            var tt = this;
            if (val) {
                setTimeout(() => {
                    var picker = tt.$refs.picker;
                    // var datas = [tt.formData.experience, tt.formData.sex, tt.formData.age]
                    var index_1 = workYears.findIndex(item => {
                        return item.value == tt.formData.experience
                    })
                    var index_2 = tt.formData.sex;
                    var index_3 = ages.findIndex(item => {
                        return item.value == tt.formData.age
                    })
                    console.log(index_1, index_3)
                    picker.setIndexes([index_1, index_2, index_3]);

                }, 500);
            }
        },
        'formData.description':function(val){
            var tt = this;
        },

        choseTypeArr(val){
            var tt = this;
            tt.checkTypeNum(val); //计算数目
        },

        postTypeList(val){
            var tt = this;
            if(!tt.currChoseType && tt.formData.job_list){
                for(var i = 0; i < tt.postTypeList.length; i++){
                    if(tt.formData.job_list.length && tt.formData.job_list[0][0] == tt.postTypeList[i].id ){
                        tt.currChoseType = tt.postTypeList[i];
                        tt.showRightPop = true
                    }
                }
            }
        },

        'formData.job_list':function(val){
            var tt = this;
            if(!tt.currChoseType && tt.postTypeList){
                for(var i = 0; i < tt.postTypeList.length; i++){
                    if(val.length && val[0][0] == tt.postTypeList[i].id ){
                        tt.currChoseType = tt.postTypeList[i];
                        tt.showRightPop = true
                    }
                }
            }
        },
    }
})