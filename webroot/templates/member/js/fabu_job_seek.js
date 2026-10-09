if (!userid) {
    location.href = `${masterDomain}/login.html`
}
var workYears = [],
    validArr = [],
    ages = [];
workYears.push({
    value: 0,
    text: '经验不限'
});
validArr.unshift({
    value: 0,
    text: '永久有效'
}, {
    value: 7,
    text: '7天'
}, {
    value: 15,
    text: '15天'
});
for (let i = 1; i <= 60; i++) {
    if (i <= 10) {
        workYears.push({
            value: i,
            text: i < 10 ? (i + '年') : (i + '年以上')
        })
    } else if (i >= 18) {
        ages.push({
            value: i,
            text: i
        })
    }

    if (i <= 12) {
        validArr.push({
            value: i * 31,
            text: i == 12 ? '1年' : i + '月'
        })
    }
}
var showAlertErrTimer = null;
var changeAge = false; //是否需要清空年龄
var pageVue = new Vue({
    el: '#page',
    data: {
        noData: false, //是否从管理页面直接跳转 ==> 没有数据
        currTab: currTab === '1' ? 1 : 0, //当前状态
        showTab: currTab === '' ? true : false,
        validArr: validArr, //有效期选项
        workYears: workYears, //工作经验
        ages: ages, //年龄
        welfare: welfare, //福利
        eduction: eduction, //学历
        postTypeList: [], //职位分类
        currChoseType: '', //当前选中的分类
        shoPopover: false, //显示弹窗
        hasChoseType: [],
        showAreaCodePop: false, //手机区号选择 显示
        areaCodeArr: [], //区号
        areaCode: '86', //当前选择的区号
        agePopver: false, //年龄弹窗
        min_age: '',
        max_age: '',
        changePhone: false, //是否修改过手机号
        loading: false, //加载中。。。
        initialphone: userphone, //用户电话号码
        phonecheck: phonecheck,//是否验证手机号
        formData: {
            job: [], //职位分类
            min_salary: '', //最低薪资
            max_salary: '', //最高薪资
            addrid: '', //区域、
            title: '', //标题
            id: '',
            job_name: [],
            nature: 1, //职位类型  1--> 全职  2-->兼职
            salary_type: 1, //薪资类型 1是月薪  2是时薪
            number: '', //招聘人数
            valid: 0, //有效期
            valid_end: '', //有效期显示
            company:'', //公司名称
            addrid_list: [],
            address: '', //详细地址
            nickname: '',  //联系人
            phone: userphone,  //手机号
            area_code: '86', //区号
            vercode: '', //验证码
            min_age: '',
            max_age: '',  //年龄要求
            education: '', //学历
            experience: '', //经验
            description: '', //描述
            welfare: [], //福利
        },
        qzFormData: {
            title: '',  //标题
            addrid: '', //区域、
            experience: '', //经验
            age: '',    //年龄
            nickname: '',  //联系人
            phone: userphone,  //手机号
            vercode: '', //验证码
            id: '',
            education: '', //学历
            description: '', //描述
            sex: 1,   //性别
            job: [], //职位分类
            job_name: [],
            addrid_list: [],
            area_code: '86', //区号
        },
        originData: '', //原始数据
        initNote: '', //输入的内容
        textCount: 0, //计数
        dataGeetest: '', //极验数据
        options: [],
        showSug: false, //显示反馈弹窗
        sugJob: '',
        successPop_sug: false, //成功
        close_time: 5, //默认5s
        interval: null,
        props: {
            lazy: true,
            value: 'id',
            label: 'typename',
            lazyLoad(node, resolve) {
                // const { level } = node;
                var url = "/include/ajax.php?service=siteConfig&action=area&type=" + (node && node.data ? node.data.id : '');


                $.ajax({
                    url: url,
                    type: "POST",
                    dataType: "json",
                    success: function (data) {
                        if (data.state == 100) {
                            var array = data.info.map(function (item) {
                                var leaf = item.lower ? '' : 'leaf:true';
                                return {
                                    id: Number(item.id),
                                    typename: item.typename,
                                    lower: item.lower,
                                    leaf,
                                }
                            });
                            if (node.data) {
                                array.unshift({
                                    id: -1,
                                    typename: '不限',
                                    lower: 0,
                                    leaf: true,
                                });
                            }
                            resolve(array)
                        }
                    }
                });
            },
        },
        leafPage: true,

    },
    mounted() {
        if (!cityid) {
            location.href = `${masterDomain}/changecity.html`
        };
        const that = this;
        that.getTypeList();
        that.getPhoneCodeArr(); //获取区号
        if (that.getUrlParam('noData')) {  //是否没有数据 ，从管理页面直接进入
            that.noData = true;
        }

        if (that.getUrlParam('id')) {
            that.getInfoDetail(that.getUrlParam('id'));
        }

        // 极验相关
        if (geetest) {
            that.$nextTick(() => {
                captchaVerifyFun.initCaptcha('web','#codeButton',that.sendVerCode)
            })
        }
        window.onbeforeunload = res => {
            console.log(this.leafPage);
            if (this.leafPage) {
                return '如直接离开页面，将放弃修改内容'
            }
        };
    },

    methods: {
        // 薪资输入监听
        salaryi(state) {
            let val = event.target.value;
            let num = /^[1-9]*$/; //正整数验证
            let rule = /(^[1-9]*[.][0-9]{1}$)|(^[1-9]*$)|(^[1-9]{1,}[.]$)/ //小数和整数正则
            if (this.formData.salary_type == 1) { //月薪
                if (!num.test(val)) { //不是整数
                    if (state == 0) { //最小薪资
                        this.formData.min_salary = this.formData.min_salary.replace(/[^\d]/g, '');
                    } else { //最大薪资
                        this.formData.max_salary = this.formData.max_salary.replace(/[^\d]/g, '');
                    };
                };
            } else { //时薪
                if (!rule.test(val)) { //不是整数或者小数
                    if (state == 0) { //最小薪资
                        this.formData.min_salary = this.formData.min_salary.replace(/^\D*(\d*(?:\.\d{0,1})?).*$/g, '$1')
                    } else { //最大薪资
                        this.formData.max_salary = this.formData.max_salary.replace(/^\D*(\d*(?:\.\d{0,1})?).*$/g, '$1')
                    };
                };
            };
            if (this.formData.min_salary && this.formData.max_salary) {
                $('.deletion').eq(1).hide();
            }
        },
        // 选择职位滚动监听
        postScroll() {
            let tt = this;
            if (tt.scroll) {
                return;
            };
            let index = $('.currChosecategory').index();
            if ($('.allLowerList dl').eq(index + 1).position().top <= 10) {
                $('.jobTypePop .popCon .parList li').eq(index + 1).addClass('currChosecategory').siblings().removeClass();
            } else if (index != 0 && $('.allLowerList dl').eq(index - 1).position().top >= 0) {
                $('.jobTypePop .popCon .parList li').eq(index - 1).addClass('currChosecategory').siblings().removeClass();
            } else {
                $('.jobTypePop .popCon .parList li').eq(index).addClass('currChosecategory').siblings().removeClass();
            }
        },
        // 选择区域
        changeArea(res) {
            var tt = this;
            tt.addr = res;
            setTimeout(res => {
                let val;
                val = $(".addrChose input").val();
                if (val.indexOf('不限') != -1) {
                    let arr = val.split('/');
                    arr.pop();
                    arr = arr.join('/');
                    $(".addrChose input").val(arr)
                };
            }, 0)
            if (this.currTab == 1) {
                $('.deletion').eq(1).hide();
            } else {
                $('.deletion').eq(2).hide();
            }
        },

        // 主要是为了回显默认值
        changeMapAreaText(res) {
            var tt = this;
            if (tt.mapChose && tt.mapChose.mapAreaText) {
                $(".addridBox input").val(tt.mapChose.mapAreaText.join('/'));
            }
        },

        // 使用模板
        useModel() {
            var tt = this;
            if ($(".textArea").find('.model').length) return false;
            var arr = ['薪资待遇', '工作内容', '工作环境', '招聘要求', '应聘须知'];
            var htmlArr = [];
            htmlArr.push('<div class="model">')
            for (var i = 0; i < arr.length; i++) {
                htmlArr.push('<div style="word-break:break-all;">' + arr[i] + '：</div>')
            }
            htmlArr.push('</div>');
            $(".textArea").append(htmlArr.join(''));
        },

        // 获取职位分类列表
        getTypeList() {
            var tt = this;
            $.ajax({
                url: '/include/ajax.php?service=job&action=type&tb=pg&son=1',
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    if (data.state == 100) {
                        tt.postTypeList = data.info;
                        tt.currChoseType = data.info[0];
                    }
                },
                error: function () {

                }
            });
        },

        // 选中分类
        chosePostType(item, child) {
            const that = this;
            let chosed = false;
            $('.jbp-warn').css('display', 'none');
            for (var i = 0; i < that.hasChoseType.length; i++) {
                const childHasChose = that.hasChoseType[i][1];
                if (child.id == childHasChose.id) {
                    chosed = true;
                    that.hasChoseType.splice(i, 1)
                    return
                }
            }
            if (!chosed && that.hasChoseType.length < 5) {
                that.hasChoseType.push([item, child])
            } else {
                that.showErrAlert('最多只能选择5个')
            }
        },

        // 验证是否选中
        checkSelect(child) {
            const that = this;
            let chosed = false;
            for (var i = 0; i < that.hasChoseType.length; i++) {
                const childHasChose = that.hasChoseType[i][1];
                if (child.id == childHasChose.id) {
                    chosed = true;
                    break;
                }
            }
            return chosed;
        },

        // 删除tag
        removeTag(ind, type) {
            const tt = this;
            tt.hasChoseType.splice(ind, 1)
        },

        // 选择分类
        checkCurrChoseType(item) {
            const that = this;
            that.currChoseType = item;
            const id = item.id;
            let offSet = $('.allLowerList dl[data-id="' + id + '"]').attr('data-top');
            if (offSet == undefined) {
                $(".allLowerList dl").each(function () {
                    $(this).attr('data-top', $(this).position().top - 60)
                })
                offSet = $('.allLowerList dl[data-id="' + id + '"]').attr('data-top')
            }


            $(".allLowerList").scrollTop(offSet)

        },

        // 确认选择
        postTypeSure() {
            const that = this;
            if (that.hasChoseType == 0) {
                $('.jbp-warn').css('display', 'flex');
                return
            } else {
                $('.jbp-warn').css('display', 'none');
                $('.deletion').eq(0).hide();
            };
            const key = that.currTab ? 'qzFormData' : 'formData';
            that[key].job = that.hasChoseType.map(item => {
                return item[1].id
            });
            that[key].job_name = that.hasChoseType.map(item => {
                return item[1].typename
            });
            if (!that[key].title) {
                const str = that[key].job_name.join('/');
                this.$set(that[key], "title", str);
            };
            that.shoPopover = false;

        },
        change(val) {
            if (val) {
                $('.deletion').eq(3).hide();
            }
            this.$forceUpdate();  //强制刷新
        },

        // 获取国际区号
        getPhoneCodeArr() {
            const tt = this;
            $.ajax({
                url: '/include/ajax.php?service=siteConfig&action=internationalPhoneSection',
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        tt.areaCodeArr = data.info
                    }
                },
                error: function () { }
            });
        },

        // 选择区号弹窗显示
        showAreaCodeChosePop() {
            const that = this;
            that.showAreaCodePop = true;
            $(document).one('click', function () {
                that.showAreaCodePop = false;
                event.stopPropagation()
            })
            event.stopPropagation()
        },

        // // 极验
        // handlerPopupReg: function (captchaObjReg) {
        //     // 成功的回调
        //     var t = this;
        //     captchaObjReg.onSuccess(function () {
        //         var validate = captchaObjReg.getValidate();
        //         t.dataGeetest = "&geetest_challenge=" + validate.geetest_challenge + "&geetest_validate=" + validate.geetest_validate + "&geetest_seccode=" + validate.geetest_seccode;
        //         t.sendVerCode($('.getPhoneCode'));

        //     });
        //     captchaObjReg.onClose(function () { })

        //     window.captchaObjReg = captchaObjReg;
        // },

        // 获取短信验证码
        getPhoneMsg: function () {
            var tt = this;
            var btn = event.currentTarget;
            const key = tt.currTab ? 'qzFormData' : 'formData'
            var phone = tt[key].phone, areacode = tt[key].area_code;

            if (phone == '') {
                $('.deletion').eq(5).css('display', 'inline-block');
                return false;
            } else if (areacode == "86") {
                var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
                if (!phoneReg.test(phone)) {
                    $('.deletion').eq(6).text('请输入正确的手机号码')
                    $('.deletion').eq(6).css('display', 'inline-block');
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
            let btn = $(".getPhoneCode")
            btn.addClass('noclick');
            const key = tt.currTab ? 'qzFormData' : 'formData'
            var phone = tt[key].phone;
            var areacode = tt[key].area_code;

            var param = "&phone=" + phone + "&areaCode=" + areacode + tt.dataGeetest;
            var codeType = 'verify';
            if(captchaVerifyParam && geetest == 2){
                param = param + '&geetest_challenge=' + captchaVerifyParam
            }else if(geetest == 1 && captchaVerifyParam){
                param = param +  captchaVerifyParam
            }
            $.ajax({
                url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify&terminal=mobile&type=" + codeType + param,
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
                        tt.showErrAlert(data.info);
                    }
                },
                error: function () {
                    btn.removeClass("noclick").text(langData['siteConfig'][4][1]);  //获取验证码
                    tt.showErrAlert(langData['siteConfig'][20][173]);  //网络错误，发送失败！
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

        // 显示黑框提示
        showErrAlert(data) {
            showAlertErrTimer && clearTimeout(showAlertErrTimer);
            $(".popErrAlert").remove();
            $("body").append('<div class="popErrAlert"><p>' + data + '</p></div>');

            $(".popErrAlert").css({
                "visibility": "visible"
            });
            showAlertErrTimer = setTimeout(function () {
                $(".popErrAlert").fadeOut(300, function () {
                    $(this).remove();
                });
            }, 1500);
        },

        // 描述
        changeTextCount(action) {
            var tt = this;
            var el = event.currentTarget;
            const key = tt.currTab ? 'qzFormData' : 'formData'

            if (event.keyCode != 8 && event.keyCode != 13 && !tt.textCount && !action) {
                tt.textCount = 1
            } else {
                var conText = $(el).text()
                tt.textCount = conText.length;
            }

            tt[key].description = $(el).html();
        },


        // 修改年龄
        changeAge(age, type) {
            const that = this;
            var noptName = type ? 'max_age' : 'min_age';
            var optName = type ? 'min_age' : 'max_age';
            if (changeAge) {
                that.min_age = '';
                that.max_age = '';
                changeAge = false;
            }
            that[optName] = age;
            console.log(age)
            if (that[noptName] !== undefined && that[noptName] !== '') {
                that.agePopver = false;
            }
        },

        showAge() {
            const that = this;
            let ageText = '';
            console.log(that.formData.min_age);
            if (that.formData.min_age > 0 && that.formData.max_age > 0) {
                ageText = that.formData.min_age + '-' + that.formData.max_age + '岁'
            } else if (that.formData.min_age === ' ' && that.formData.max_age === ' ') {
                ageText = '年龄不限'
            };
            // return that.originData&&ageText.indexOf('不限')==-1?ageText+'岁':that.originData?ageText:'';
            return ageText;
        },

        showPopEnd() {
            changeAge = true;
        },

        hidePopEnd() {
            const that = this;
            that.formData.min_age = that.min_age
            that.formData.max_age = that.max_age
        },

        initData() {
            var tt = this;
            // 工作内容初始化
            const key = tt.currTab ? 'qzFormData' : 'formData'
            if (tt[key].description) {
                var regex = /(<([^>]+)>)/ig;
                var conText = tt[key].description;
                conText = conText.replace(regex, 1);
                tt.textCount = conText.length;
                tt.initNote = tt[key].description;
            } else {
                tt.initNote = ''
            }
        },

        // 发布招聘/求职信息
        fabuInfo() {
            const that = this;
            const stop = that.checkFormData();
            that.leafPage = false;
            if (stop || that.loading) return false;
            that.loading = true;
            const key = that.currTab ? 'qzFormData' : 'formData';
            $.ajax({
                url: "/include/ajax.php?service=job&action=" + (that.currTab ? 'aeQz' : 'aePg') + "&cityid=" + cityid,
                type: "POST",
                dataType: "json",
                data: that[key],
                success: function (data) {
                    that.loading = false;
                    if (data.state == 100) {
                        $('.fabuSuccess').show();
                        setTimeout(() => {
                            window.location.href = memberDomain + '/manage_worker.html'
                        }, 1600);
                    } else {
                        if (data.info.indexOf('验证码输入错误') != -1) {
                            $('.deletion').eq(6).text(data.info)
                            $('.deletion').eq(6).css('display', 'inline-block');
                            $('html').animate({ scrollTop: $('.formpart').eq(2).find('dt').offset().top }, 0);//滚动到指定位置
                        } else {
                            that.showErrAlert(data.info)
                        }
                    }
                },
                error: function () {
                    that.loading = false;
                    that.showErrAlert(langData['siteConfig'][20][173]);  //网络错误，发送失败！
                }
            });
        },

        // 验证表单
        checkFormData() {
            const that = this;
            let stop = false;
            const key = that.currTab ? 'qzFormData' : 'formData';
            for (var item in that[key]) {
                let value = that[key][item];
                if (item == 'vercode' && value == undefined) {
                    value = ''
                };
                if (value.length == 0 || value === '') {
                    if (key == 'formData') { //普工招聘
                        switch (item) {
                            case 'job': { //招聘职位
                                stop = true;
                                $('.deletion').eq(0).css('display', 'inline-block');
                                $('html').animate({ scrollTop: $('#page').offset().top }, 0);//滚动到指定位置
                                return stop; //找到未填项，直接结束循环
                            }
                            case 'min_salary': { //最小薪资
                                if(that[key]['max_salary']){
                                    break;
                                };
                                stop = true;
                                $('.deletion').eq(1).css('display', 'inline-block');
                                $('html').animate({ scrollTop: $('#page').offset().top }, 0);//滚动到指定位置
                                return stop; //找到未填项，直接结束循环
                            }
                            case 'max_salary': { //最大薪资
                                if(that[key]['min_salary']){
                                    break;
                                };
                                stop = true;
                                $('.deletion').eq(1).css('display', 'inline-block');
                                $('html').animate({ scrollTop: $('#page').offset().top }, 0);//滚动到指定位置
                                return stop; //找到未填项，直接结束循环
                            }
                            case 'company': { //最大薪资
                                if(that[key]['company']){
                                    break;
                                };
                                stop = true;
                                $('.deletion').eq(2).css('display', 'inline-block');
                                $('html').animate({ scrollTop: $('#page').offset().top }, 0);//滚动到指定位置
                                return stop; //找到未填项，直接结束循环
                            }
                            case 'addrid': { //地址选择
                                stop = true;
                                $('.deletion').eq(3).css('display', 'inline-block');
                                $('html').animate({ scrollTop: $('#page').offset().top }, 0);//滚动到指定位置
                                return stop; //找到未填项，直接结束循环
                            }
                            case 'title': { //标题
                                stop = true;
                                $('.deletion').eq(4).css('display', 'inline-block');
                                $('html').animate({ scrollTop: $('#page').offset().top }, 0);//滚动到指定位置
                                return stop; //找到未填项，直接结束循环
                            }
                            case 'nickname': { //联系人昵称
                                stop = true;
                                $('.deletion').eq(5).css('display', 'inline-block');
                                $('html').animate({ scrollTop: $('.formpart').eq(2).find('dt').offset().top }, 0);//滚动到指定位置
                                return stop; //找到未填项，直接结束循环
                            }
                            case 'phone': { //联系人电话
                                stop = true;
                                $('.deletion').eq(6).css('display', 'inline-block');
                                $('html').animate({ scrollTop: $('.formpart').eq(2).find('dt').offset().top }, 0);//滚动到指定位置
                                return stop; //找到未填项，直接结束循环
                            }
                            case 'vercode': { //验证码
                                if (that.changePhone) {
                                    $('.deletion').eq(7).text('请填写验证码')
                                    $('.deletion').eq(7).css('display', 'inline-block');
                                    $('html').animate({ scrollTop: $('.formpart').eq(2).find('dt').offset().top }, 0);//滚动到指定位置
                                    return stop; //找到未填项，直接结束循环
                                };
                            }
                        };
                    } else { //普工求职
                        switch (item) {
                            case 'title': { //标题
                                stop = true;
                                $('.deletion').eq(0).css('display', 'inline-block');
                                $('html').animate({ scrollTop: $('#page').offset().top }, 0);//滚动到指定位置
                                return stop; //找到未填项，直接结束循环
                            }
                            case 'addrid': { //地址选择
                                stop = true;
                                $('.deletion').eq(1).css('display', 'inline-block');
                                $('html').animate({ scrollTop: $('#page').offset().top }, 0);//滚动到指定位置
                                return stop; //找到未填项，直接结束循环
                            }
                            case 'experience': { //工作经验
                                stop = true;
                                $('.deletion').eq(2).css('display', 'inline-block');
                                $('html').animate({ scrollTop: $('#page').offset().top }, 0);//滚动到指定位置
                                return stop; //找到未填项，直接结束循环
                            }
                            case 'age': { //年龄
                                stop = true;
                                $('.deletion').eq(3).css('display', 'inline-block');
                                $('html').animate({ scrollTop: $('#page').offset().top }, 0);//滚动到指定位置
                                return stop; //找到未填项，直接结束循环
                            }
                            case 'nickname': { //联系人昵称
                                stop = true;
                                $('.deletion').eq(4).css('display', 'inline-block');
                                $('html').animate({ scrollTop: $('.formpart').eq(2).find('dt').offset().top }, 0);//滚动到指定位置
                                return stop; //找到未填项，直接结束循环
                            }
                            case 'phone': { //联系人电话
                                stop = true;
                                $('.deletion').eq(5).css('display', 'inline-block');
                                $('html').animate({ scrollTop: $('.formpart').eq(2).find('dt').offset().top }, 0);//滚动到指定位置
                                return stop; //找到未填项，直接结束循环
                            }
                            case 'vercode': { //验证码
                                if (that.changePhone) {
                                    stop = true;
                                    $('.deletion').eq(6).text('请填写验证码')
                                    $('.deletion').eq(6).css('display', 'inline-block');
                                    $('html').animate({ scrollTop: $('.formpart').eq(2).find('dt').offset().top }, 0);//滚动到指定位置
                                    return stop; //找到未填项，直接结束循环
                                };
                            }
                        };
                    }
                };
                if (item == 'addrid' && that[key][item] == -1) { //判断是否有不限地址的
                    let index = that[key]['addrid_list'].length - 2;
                    that[key][item] = that[key]['addrid_list'][index];
                };
            }
        },

        // 验证是否修改过手机号
        checkPhoneChange(val) {
            const that = this;
            console.log(val, that.formData.phone)
            if (val != that.initialphone) {
                that.changePhone = true;
            } else {
                that.changePhone = false;
            }
            if (val) {
                $('.deletion').eq(5).hide();
            }
        },

        // 福利
        pushWelfare(item) {
            var tt = this;
            console.log(tt.formData.id, item.id);
            if (tt.formData.welfare.indexOf(item.id) > -1) {
                tt.formData.welfare.splice(tt.formData.welfare.indexOf(item.id), 1)
            } else {
                tt.formData.welfare.push(item.id)
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

        // 获取详情
        getInfoDetail(id) {
            const that = this;
            const key = that.currTab ? 'qzFormData' : 'formData';
            const action = that.currTab ? 'qzDetail' : 'pgDetail';
            that[key].id = id;
            $.ajax({
                url: '/include/ajax.php?service=job&action=' + action + '&id=' + id + '&u=1',
                type: "POST",
                dataType: "json",
                data: that[key],
                success: function (data) {
                    if (data.state == 100) {
                        for (var item in that[key]) {
                            if (!that.currTab && item == 'number') {
                                console.log(item);
                                that.$set(that[key], item, (Number(data.info[item]) ? data.info[item] : ''));
                            } else {
                                that.$set(that[key], item, data.info[item]);
                            }
                        }
                        that.initData()
                        that.originData = data.info;
                        if (that.originData.min_age == 0 && that.originData.max_age == 0) {
                            that.min_age = ' ';
                            that.max_age = ' ';
                            that.formData.max_age = ' ';
                            that.formData.min_age = ' ';
                        } else {
                            that.formData.min_age = that.originData.min_age;
                            that.formData.max_age = that.originData.max_age;
                        }

                        that.$nextTick(function () {
                            that.setValue()

                        })

                    }

                },
                error: function () {
                    that.loading = false;
                    that.showErrAlert(langData['siteConfig'][20][173]);  //网络错误，发送失败！
                }
            });
        },

        setValue(area) {
            var tt = this;
            let cs = tt.$refs.cascaderRefArea;
            const key = tt.currTab ? 'qzFormData' : 'formData';
            tt[key]['addrid_list'].push(-1);
            $(".addrChose  input").val(tt.originData.addrName.join('/'))
            if (cs && cs.panel) {
                cs.panel.activePath = [];
                cs.panel.loadCount = 0;
                cs.panel.lazyLoad();
            }

        },

        suggessJob() {
            const that = this;
            console.log(that.sugJob, that.loading)
            if (!that.sugJob || that.loading) return false;
            that.loading = true;
            $.ajax({
                url: '/include/ajax.php?service=job&action=recommendAddPgJobType&title=' + that.sugJob,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        that.loading = false
                        that.showSug = false;
                        that.successPop_sug = true;
                        that.sugJob = '';
                        that.interval = setInterval(function () {
                            that.close_time--;
                            if (!that.close_time) {
                                that.successPop_sug = false;
                                clearInterval(that.interval)
                            }
                        }, 1000)
                    } else {

                        that.showErrAlert(data.info)
                    }

                },
                error: function () {
                    that.loading = false;
                    that.showErrAlert(langData['siteConfig'][20][173]);  //网络错误，发送失败！
                }
            });
        }
    },

    watch: {
        'formData.valid': function (val) {
            const currStr = parseInt(new Date().valueOf() / 1000);
            if (val) {
                this.formData.valid_end = val * 86400 + currStr; //截止日期
            }
        },

        'formData.addrid_list': function (val) {
            const that = this;
            if (val[val.length - 1] != -1) {
                this.formData['addrid'] = val[val.length - 1];
            } else {
                this.formData['addrid'] = val[val.length - 2];
            };
        },

        'qzFormData.addrid_list': function (val) {
            const that = this;
            if (val) {
                if (val[val.length - 1] != -1) {
                    this.qzFormData['addrid'] = val[val.length - 1];
                } else {
                    this.qzFormData['addrid'] = val[val.length - 2];
                }
            }
        },

        // 职位选择弹窗显示  赋值
        shoPopover: function (val) {
            const that = this;
            console.log(val)
            if (val) {
                const key = that.currTab ? 'qzFormData' : 'formData';
                const job = that[key].job;
                let chosedArr = [];
                if (job && job.length) {
                    for (var i = 0; i < that.postTypeList.length; i++) {
                        const parList = that.postTypeList[i];
                        for (var m = 0; m < parList.lower.length; m++) {
                            const child = parList.lower[m];
                            // console.log(job.indexOf(child.id),job,child.id)
                            if (job.indexOf(child.id) > -1) {
                                chosedArr.push([parList, child])
                            }
                        }
                    }
                }
                that.hasChoseType = chosedArr
            }
        },

        currTab(val) {
            if (!val) {
                $(".zhaopin").removeClass('fn-hide')
                $(".qiuzhi").addClass('fn-hide')
            } else {
                $(".qiuzhi").removeClass('fn-hide')
                $(".zhaopin").addClass('fn-hide')
            }
        }
    }
})