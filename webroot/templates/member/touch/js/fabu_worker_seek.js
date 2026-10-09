toggleDragRefresh('off');

// 是否有存储的数据
var citys = []; //分站列表
var workYears = [],
    validArr = [],
    ages = [];
    workYears.push({
        value:0,
        text:'不限'
    });
    validArr.unshift({
        value:0,
        text:'永久有效'
    },{
        value:7,
        text:'7天'
    },{
        value:15,
        text:'15天'
    });
    ages.push({      
        value:'',
        text:'不限'
    });
for (let i = 1; i <= 60; i++) {
    if (i <= 10 ) {
        workYears.push({
            value: i,
            text: i < 10 ? (i + '年') : (i + '年以上')
        })
    } else if (i >= 18) {
        ages.push({
            value: i,
            text: i < 60 ? (i ) : (i + '以上')
        })
    }

    if(i<=12){
        validArr.push({
            value:i * 31,
            text: i == 12 ? '1年' : i + '月'
        })
    }
}

var pid,cid,did,tid;
var addridsArr = []; //区域地址
var addrNameArr = []
var addrArr = []
var cityHasChange = false
var page = new Vue({
    el: '#page',
    data: {
        pageFromPost:0,
        loading:false, //正在提交
        showChosePage:true, //显示选择分类页
        postTypeList:[], //分类页
        currChoseType: '', // 当前选择的一级分类
        currChoseStype: '', //二级分类
        showLeftPop: false, //二级分类页面左滑
        showRightPop: false, //三级分类页面左滑
        choseTypeArr: [], //选择的id
        choseTypeObj: [], //选中的内容
        changePhone:false, // 手机号是否修改
        choseTypeArrCountObj:'', //选择的
        formData: {
            id:0,
            job:[], //职位
            job_name:[], //职位名称
            job_list:[], //职位id
            title:'' ,//标题
            nature:1, //职位性质
            salary_type:1, //月薪/时薪
            min_salary:'', //最低薪资
            max_salary:'', //最高薪资
            valid:0, //有效期
            valid_end:'', //有效期显示
            addrid: '', //区域id
            addrid_list: [], //区域id 全部
            addrName: [], //区域名
            address:'', //详细地址
            lnglat:'', //坐标
            description: '', //描述
            education:'', //学历
            education_name:'', //学历名
            experience: '', //经验
            experience_name: '', // 经验显示
            min_age: '', //年龄
            max_age:'', //最大年龄
            area_code: '86', //手机号区域代码
            vercode:'',  //手机验证码
            welfare:[], //福利
            nickname:'', //联系人
            phone:userPhone, //手机号
            cityid:cityid, //城市id
            number:'', //招聘人数
            company:'',
        },
        initNote: '', //文字存放
        textCount: 0, //数字统计
        showScrollPop: false, //弹窗显示
        columns: [{
            values: workYears,
            defaultIndex: 0,
        }], //选择器数据
        ages:[{
            values:ages,
            defaultIndex:0
        },{
            values:ages,
            defaultIndex:0
        }], //年龄

        ageChose:false, //是否选择过年龄
        validArr:validArr, //选择器数据 -- 有效期
        areaCodePop: false, //号码区域代码弹窗
        areaCodeList: [], //号码区域代码列表
        dataGeetest:'',

        fabuSuccessPop:false, //成功提示
        checkInfo:checkInfo === 1 ? 0 : 1, //信息是否需要审核 0不需要  1需要审核
        welfare:[], //标签
        showScrollType: 'eduWorkYear' //弹窗选择器类型
    },
    mounted() {

        var tt = this;

        if(!tt.postTypeList.length){
            tt.getTypeList()
        }
        tt.getAreaCodeList(); //获取区号列表
        tt.getBasicConfig();

        // 看看是否能从本地存储中获取数据
        var infoData = localStorage.getItem('infoData');
        if(infoData){
            infoData = JSON.parse(infoData)
        }
        if(infoData && infoData.length){
            console.log(infoData)
            for(var i = 0; i < infoData.length; i++){
                if(infoData[i].name == 'formData'){
                    tt.formData = JSON.parse(infoData[i].value);
                    if(tt.formData.job_list && tt.formData.job_list.length){
                        tt.choseTypeArr = tt.formData.job_list;
                        tt.showChosePage = false;
                    }

                    if(tt.formData.job){
                        for(var i = 0; i < tt.formData.job.length; i++){
                            tt.choseTypeObj.push({
                                id:tt.formData.job[i],
                                title:tt.formData.job_name[i]
                            })
                        }
                    }
                    // tt.$forceUpdate(); //强制更新
                }else if(infoData[i].name == 'address'){    
                    tt.formData[infoData[i].name] = infoData[i].value;
                }else if(infoData[i].name == 'district'){
                    var district = JSON.parse(infoData[i].value);
                    if(!cityHasChange){
                    	tt.checkByLnglat(point,district);
                    	cityHasChange = true
                    }

                }else if(infoData[i].name == 'changePhone'){
                    tt.changePhone = infoData[i].value;
                }else if(infoData[i].name == 'lnglat' ){
                    tt.formData[infoData[i].name] = infoData[i].value;
                    let lat = infoData[i].value.split(',')[1]
                    let lng = infoData[i].value.split(',')[0]
                    let point = {
                        lng:lng,
                        lat:lat
                    }
                    if(!cityHasChange){
                    	tt.checkByLnglat(point);
                    	cityHasChange = true
                    }
                }

                if(infoData[i].name == 'address'){
                    tt.formData[infoData[i].name] = infoData[i].value;
                }
            }
            localStorage.removeItem("infoData");
            tt.initData()
            
        }else if(tt.getUrlParam('id')){ //表示编辑
            tt.showChosePage = false;
            tt.getQzDetail(tt.getUrlParam('id'))   
        }     
        tt.getAreaCodeList();
         // 极验相关
        if (geetest) {

            tt.$nextTick(() => {
                captchaVerifyFun.initCaptcha('h5','#codeButton',tt.sendVerCode)	
            })
        }
    },
    computed:{
        checkTime(){
            return function(timeStr){
                var tt = this;
                var curr = parseInt(new Date().valueOf() / 1000);
                var timeText = ''
                // console.log(tt.formData.valid_end , tt.formData.valid )
                if(!timeStr && !tt.formData.valid){ //永久有效
                    timeText = '永久有效'
                }else if(timeStr > curr){
                    timeText = huoniao.transTimes(timeStr,2)
                }else{
                    tt.formData.valid = 0
                }
                return timeText;
            }
        },
        checkAge(){
            
            return function(min,max){
                var tt = this;
                var ageText = ''
                if(min && !max){
                    ageText = min + '以上'
                }else if(max && !min){
                    ageText = 18 + '-' + max;
                }else if(min && max){
                    ageText = min + '-' + max;
                }else if(!min && !max && tt.ageChose){
                    ageText = '不限'
                }
                return ageText;
            }
        }
    },
    methods: {
        // 返回上一页
        pageBack(){
            var tt = this;
            if((tt.pageFromPost === 1 && tt.showChosePage)|| (tt.pageFromPost === 2 && !tt.showChosePage)){
                tt.pageFromPost = 0;
                tt.showChosePage = !tt.showChosePage;
            }else{
                window.history.go(-1)
            }
        },

        // 初始化描述
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
    
        // 获取相关配置
        getBasicConfig(){
            var tt = this;
            $.ajax({
                url: "/include/ajax.php?service=job&action=getItem&name=pgeducation,pgwelfare" ,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    //获取成功
                    if (data && data.state == 100) {
                        tt.welfare =  data.info['pgwelfare'];
                        var education = data.info['pgeducation'].map(item => {
                            return {
                                value:item.id,
                                text:item.typename
                            }
                        })
                        education.unshift({
                            value:0,
                            text:'不限'
                        })
                        tt.columns.splice(0,0,{
                            values:education,
                            defaultIndex:0
                        });
                        // tt.refs.picker.setColumnValue
                    } 
                },
                error: function () {
                
                }
            });
        },

        async checkCityid_v2(strArr){
            const that = this;
            if(citys.length == 0){
                await that.getCitys();
            }
            $('.loadIcon').removeClass('fn-hide')
            that.matchCity(citys,0,strArr)
            
        },

        // 获取所有城市分站
        getCitys(id = 0,strArr){
            $.ajax({
                url: "/include/ajax.php?service=siteConfig&action=area&type=" + id ,
                type: "POST",
                dataType: "json",
                async:false,
                success: function(data){
                    if(data && data.state == 100){
                        citys = data.info;
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
                if(cityname == str){ //匹配上之后就匹配下一级
                    cityChecked = true; //找到了
                    addridsArr.push(currCity.id);
                    addrArr.push(currCity.typename)
                    that.formData.addrid = addridsArr[addridsArr.length - 1]
                    that.formData.addrid_list = addridsArr
                    that.formData.addrName = addrArr
                    // $(".chose_area").attr('data-ids',addridsArr.join(' '))
                    // $(".chose_area").attr('data-id',addridsArr[addridsArr.length - 1])
                    // $("#addrid").val(addridsArr[addridsArr.length - 1])
                    if(currCity.longitude && currCity.latitude){
                        lnglat = currCity.longitude + ',' + currCity.latitude
                    }
                    // $(".chose_area").removeClass('gz-no-sel').attr('data-addrname',addrArr.join(' '));
                    // $(".chose_area .city").text(addrArr.join(' '))
                    if(!that.formData.lnglat){
                        that.formData.lnglat = lnglat
                    }
                                    
                    if(currCity.lower){ //查找到之后 应该查找下一级
                        await that.getCitys(currCity.id);
                        type++
                        if(type < strArr.length){
                            that.matchCity(citys,type,strArr)
                        }else{
                            $('.loadIcon').addClass('fn-hide')
                        }
                    }
                    break;
                }
            }
    
            if(!cityChecked){
                if(type < strArr.length){ //没查找到  继续匹配地图返回数据的洗衣机
                    ++type
                    that.matchCity(citys,type,strArr)
                }else if(addridsArr.length == 0){ //查找结束 
                    showErrAlert('城市定位失败，请手动选择城市')
                    // $(".chose_area .city").text('省市区县，点击"定位”选择地区');
                    // $('.chose_area').addClass('gz-no-sel')
                    // $('.loadIcon').addClass('fn-hide')
                }
            }
    
            if(type >= (strArr.length - 1)){
                $('.loadIcon').addClass('fn-hide')
            }
            
        },

        // 福利
        pushWelfare(item){
            var tt = this;
            if( tt.formData.welfare.indexOf(item.id) > -1){
                tt.formData.welfare.splice(tt.formData.welfare.indexOf(item.id),1)
            }else{
                tt.formData.welfare.push(item.id)
            }
        },

        // 更换薪资类型
        checkSalary(){
            var tt = this;
            tt.formData.salary_type = tt.formData.salary_type === 1 ? 2 : 1;
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
            if(tt.showScrollType == 'age'){
                tt.ageChose = true;
                var data = tt.$refs.picker_age.getValues();
                tt.formData.min_age = data[0].value
                tt.formData.max_age = data[1].value
            }else if(tt.showScrollType == 'valid'){
                var data = tt.$refs.picker.getValues();
                tt.formData.valid = data[0].value;
                if(tt.formData.valid){
                    tt.formData.valid_end = data[0].value * 86400 + parseInt(new Date().valueOf()/1000);
                }else{
                    tt.formData.valid_end = 0
                    tt.formData.valid = 0
                }
            }else{
                var data = tt.$refs.picker.getValues();
                tt.formData.experience = data[1].value
                tt.formData.experience_name = data[1].text
                tt.formData.education = data[0].value
                tt.formData.education_name = data[0].text
            }
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
        handlerPopupReg: function (captchaObjReg) {
            // 成功的回调
            var t = this;
            captchaObjReg.onSuccess(function () {
                var validate = captchaObjReg.getValidate();
                t.dataGeetest = "&geetest_challenge=" + validate.geetest_challenge + "&geetest_validate=" + validate.geetest_validate + "&geetest_seccode=" + validate.geetest_seccode;
                t.sendVerCode();

            });
            captchaObjReg.onClose(function () {})

            window.captchaObjReg = captchaObjReg;
        },

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
            if (geetest) {
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
            console.log(btn);
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
                var arr = [{name:'title',tip:'请输入标题'},{name:'min_salary',tip:'请填写最低薪资'},{name:'max_salary',tip:'请填写最高薪资'},{name:'valid',tip:'请选择信息有效期'},{name:'company',tip:'请填写工作单位/公司/店铺名'},{name:'addrid',tip:'请选择工作地点'},{name:'description',tip:'请填写职位描述'},{name:'nickname',tip:'请填写联系人'},{name:'phone',tip:'请输入手机号'}];
                if(tt.changePhone){
                    arr.push({name:'vercode',tip:'请输入验证码'})
                }
                for(var i = 0 ; i< arr.length; i++){
                    if(!tt.formData[arr[i].name] && tt.formData[arr[i].name] != 0 || tt.formData[arr[i].name].length == 0){
                        keepGo = false;
                        showErrAlert(arr[i].tip)
                        break;
                    }
                    if(arr[i].name == 'phone'){
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
            // return false;
            $.ajax({
                url: "/include/ajax.php?service=job&action=aePg",
                type: "POST",
                dataType: "json",
                data:tt.formData,
                success: function (data) {
                    tt.loading = false;
                    if(data.state == 100){
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
                    // btn.removeClass("noclick").text(langData['siteConfig'][4][1]);  //获取验证码
                    showErrAlert(langData['siteConfig'][20][173]);  //网络错误，发送失败！
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

            var hasFull = tt.choseTypeArr && tt.choseTypeArr.length >= 5 ? true : false;

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
                            showErrAlert('职位最多只能选5个 ')
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
                        showErrAlert('职位最多只能选5个 ')
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

        // 统计数目
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
            if(!tt.formData.title){
                tt.formData.title =  tt.formData.job_name.join('/'); //默认标题
            }
        },

        // 获取详情
        getQzDetail(id){
            var tt = this;
            $.ajax({
                url: "/include/ajax.php?service=job&action=pgDetail&id=" + id,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    //获取成功
                    if (data && data.state == 100) {
                        for(var key in tt.formData){
                            tt.formData[key] = data.info[key] ;
                        }
                        tt.choseTypeArr = data.info['job_list']
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
         changeAddr() {
            var tt = this;
            cityChosePage.showPop = true;
            cityChosePage.endChoseCity = tt.formData.addrid_list;
            cityChosePage.currTabShow = tt.formData.addrid_list.length - 1;
            cityChosePage.successCallBack = function (data) {
                console.log(data)
                // 地址选择点击完成之后
                tt.formData.addrid_list = data.map(item => {
                    return item.id
                })
                tt.formData.addrName = data.map(item => {
                    return item.typename
                })
                tt.formData.lnglat = data[data.length - 1].lng + ',' + data[data.length - 1].lat
                tt.formData.addrid = tt.formData.addrid_list[tt.formData.addrid_list.length - 1];
            };
        },
        // 根据坐标获取城市区域
        checkByLnglat(point,districtInfo){
            var tt = this;
            HN_Location.lnglatGetTown(point, function (data) {
                var province = '',
                    city = '',
                    district = '',
                    town = '';
                if (data.province) {
                    province = data.province.replace('省', '').replace('市', ''); // 省,直辖市
                }

                if (data.city) {
                    city = data.city.replace('市', ''); // 市
                }

                if (data.district) {
                    district = data.district.replace('区', '').replace(city, '');
                }

                if (data.town) {
                    town = data.town.replace('镇', '').replace('街道', '');
                }

                if (province || city || district || town) {
                    tt.calcAddrid(province,city, district, town)
                }else{
                    if(!districtInfo) return false;
                    var addrArr = districtInfo.address.split(" ");
                    tt.checkCityid_v2(addrArr)
                   	cityHasChange = false	
                }

            })
        },

        // 获取当前定位的区域id
        calcAddrid(myprovince,mycity,mydistrict,town){
            var tt = this;
            var cityArr = [myprovince,mycity,mydistrict,town]
            if(myprovince == mycity){
                cityArr = [myprovince,mydistrict,town]
            }
            addridsArr = [];
            // addrNameArr = [];
            addrArr = []
            tt.checkCityid_v2(cityArr)
    
        },


        // 获取区域id
        checkCityid(strArr,type){
            var tt = this;
            var id = 0;
            switch(type){
                case 0 : 
                    id = 0;
                    break;
                case 1 : 
                    id = pid;
                    break;
                case 2 : 
                    id = cid;
                    break;
                case 3 : 
                    id = did;
                    break;
            }
            var typeStr = '&type='+id;
            $.ajax({
                url: "/include/ajax.php?service=siteConfig&action=area" + typeStr,
                type: "POST",
                dataType: "jsonp",
                success: function(data){
                    if(data && data.state == 100){
                        var city = data.info;
                        let hasChose = false; //是否匹配上
                        for(var i=0; i<city.length; i++){
                            if(strArr[type] && (city[i].typename.indexOf(strArr[type]) > -1 || strArr[type].indexOf(city[i].typename) >-1) ){

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
                                addridsArr.push(city[i].id)
                                addrNameArr.push(city[i].typename)
                                console.log(city[i].id,city[i].typename)
                                if(type < strArr.length){
                                    tt.checkCityid_v2(strArr,type)
                                }
                                hasChose = true;
                                break;
                            }else if(!strArr[type]){
                                hasChose = true;
                            }
                        }

                        if(!hasChose){
                            type++;
                             tt.checkCityid_v2(strArr,type)
                        }
                        if(type == strArr.length - 1){
                            tt.formData.addrid = addridsArr[addridsArr.length - 1]
                            tt.formData.addrid_list = addridsArr
                            tt.formData.addrName = addrNameArr
                        }
                        
                    }else{
                        $('.loadIcon').addClass('fn-hide')
                        if(addridsArr.length){
                            tt.formData.addrid = addridsArr[addridsArr.length - 1]
                            tt.formData.addrid_list = addridsArr
                            tt.formData.addrName = addrNameArr
                        }
                    }
                }
            })
            
        },

        checkInArray(strArr,city,type){
            const that = this;
            let hasChose = false;
            for(let i = 0; i < city.length; i++){
            	console.log(city[i].typename,strArr[type])
                if(city[i].typename.indexOf(strArr[type]) > -1 ){
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
                        that.checkCityid_v2(strArr)
                        that.newAddr['addrid'] = that.addridArr[that.addridArr.length - 1];
                        that.newAddr['addridArr'] = that.addridArr;
                    }else{
                        that.newAddr['addrid'] = that.addridArr[that.addridArr.length - 1];
                        that.newAddr['addridArr'] = that.addridArr;
                        // if(newAddr){
                        //     that.getAllAddrList('add')
                        // }
                    }
                }else if(!strArr[type]){
                    hasChose = true;
                }
            }
            if(!hasChose){
                if(type < (strArr.length - 1)){
                    type = type + 1;
                    that.checInArray(city,type)
                }else{
                    hasChose = true;
                }
            }
        },


        // 跳转定位页面
        goPosiPage(){
            var tt = this;
            var infoData = [];
            tt.formData.job_list = tt.choseTypeArr;
            infoData.push({
                name:'formData',
                value:JSON.stringify(tt.formData)
            })
            infoData.push({
                name:'addrArr',
                value:tt.formData.addrid_list
            })
            infoData.push({
                name:'addrName',
                value:tt.formData.addrName
            })
            infoData.push({
                name:'address',
                value:tt.formData.address
            })
            infoData.push({
                name:'lnglat',
                value:tt.formData.lnglat
            })
            infoData.push({
                name:'cityid',
                value:tt.formData.cityid
            })
            infoData.push({
                name:'changePhone',
                value:tt.changePhone
            })
            infoData.push({
                name:'returnUrl',
                value:window.location.href
            })

            localStorage.setItem('infoData', JSON.stringify(infoData));
            window.location.href = memberDomain + '/mapPosi.html?noPosi=1&currentPageOpen=1';
        },

        // 使用模板
        useModel(){
            var tt = this;
            if($(".textarea").find('.model').length) return false;
            var arr = ['薪资待遇','工作内容','工作环境','招聘要求','应聘须知'];
            var htmlArr = [];
            htmlArr.push('<div class="model">')
            for(var i = 0; i < arr.length; i++){
                htmlArr.push('<div><span contenteditable="false">' + arr[i] + ':</span> </div>')
            }
            htmlArr.push('</div>');
            $(".textarea").append(htmlArr.join(''));
            tt.textCount = 1
        },

        // 年龄改变
        changePicker(picker,values,ind){
            var min = values[0].value,max = values[1].value;
            if(min > max && min && max){
                if(ind){
                    picker.setColumnIndex(0,max - 17)
                }else{
                    picker.setColumnIndex(1,min - 17)
                }
            }
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
                    var picker_age  = tt.$refs.picker_age;
                    // var datas = [tt.formData.experience, tt.formData.sex, tt.formData.age]
                    var index_3 = workYears.findIndex(item => {
                        return item.value == tt.formData.experience
                    })
                    var index_2 = tt.columns[1].values.findIndex(item =>{
                        return item.value == tt.formData.education
                    });
                    var index_age1 = ages.findIndex(item => {
                        return item.value == tt.formData.min_age
                    })
                    var index_age2 = ages.findIndex(item => {
                        return item.value == tt.formData.max_age
                    })
                    var index_4 = tt.validArr.findIndex(item => {
                        return item.value == tt.formData.valid
                    })
                    if(tt.showScrollType == 'age'){
                        picker_age.setIndexes([index_age1,index_age2]);
                    }else if(tt.showScrollType == 'eduWorkYear'){
                        picker.setIndexes([index_2, index_3]);                 
                    }else{
                        picker.setIndexes([index_4]);                 
                    }

                }, 500);
            }
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