var nextFreshIntferval = null;
var intention_pop = new Vue({
    el: '#popContainer',
    data: {
        // 意向职位相关
        showPostPop: false, // 弹窗显示隐藏
        postList: '', //职位分类列表
        currChoseType: '', // 当前选择的一级分类
        currChoseStype: '', //二级分类
        showLeftPop: false, //二级分类页面左滑
        showRightPop: false, //三级分类页面左滑
        choseTypeArr: [], //选择的id
        choseTypeObj: [], //选中的内容
        callback: '', // 点击的回调
        // choseIndustryObj:[],
        // 查看简历
        previewPop: false,
        reseumeDetail: {}, //简历详情

        // baseConfig: '', //配置

        // 入职状态修改
        joinStatePop: false, //状态弹窗
        joinPopConfig: '', //
        workStateConfig: {
            title: '求职状态',
            stateGroup: [
                [{
                    id: 1,
                    title: '离职，正在找工作'
                }],
                [{
                    id: 2,
                    title: '在职，正在找工作'
                }, {
                    id: 3,
                    title: '在职，看看新机会'
                }, {
                    id: 4,
                    title: '在职，暂不找工作'
                }, ],
                [{
                    id: 5,
                    title: '应届毕业生'
                }, {
                    id: 6,
                    title: '在校生'
                }],
            ],
            name: 'workState',
            btnCancel: false,
        },
        workTimeConfig: {
            title: '到岗时间',
            stateGroup: [],
            name: 'startWork',
            btnCancel: true
        },

        // 简历是否可见
        resumeShowPop: false, //弹窗显示或者隐藏
        resumeShow: 0,
        noClick: false, // 是否可点击 防止多次触发

        refresh_tc:[], //刷新
        ref_chose:0, //当前选择的刷新套餐
        top_chose:0, //当前选择的置顶套餐
        normalRefreshPice:'',//刷新一次的价格
        top_tc:[], //置顶
        refreshPopShow:false,  //刷新弹窗
        toTopPopShow:false, //制定弹窗
        successPop:{
            tit:'',
            tip:'',
            show:false,
        },
        refreshNow:false, //立即刷新的提示 => 只有在设置过智能刷新的情况下显示
        refreshNext:0, //下次刷新时间
    },
    mounted() {
        var tt = this;
        $("#tourl").val(window.location.href)

        // 获取默认简历
        if(userid_){
            tt.getDefaultResume();
        }

        tt.getBaseConfig(); //获取相关配置

        if(identify == '2'){
            var temp = tt.workStateConfig['stateGroup'][2]
            tt.workStateConfig['stateGroup'][2] = tt.workStateConfig['stateGroup'][0]
            tt.workStateConfig['stateGroup'][0] = temp;
        }

        

    },

    computed:{
        // 验证是否被选中
        checkHasChosed(){
            return function(id,ind){
                var tt = this;
                var index = tt.choseTypeArr.findIndex(function(val){
                    return val && val.length && val.indexOf(id) == ind
                })
                return index;
            }
        },
    },

    methods: {
        // 获取相关配置
        getBaseConfig(typename) {
            var tt = this;
            $.ajax({
                url: '/include/ajax.php?service=job&action=getItem&name=jobTag,jobNature,education,experience,workState,startWork,advantage,identify&type=auto',
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        tt.baseConfig = data.info;
                        var stateGroup = data.info.startWork.map(item => {
                            return {
                                id: item.id,
                                title: item.typename
                            }
                        })
                        tt.workTimeConfig['stateGroup'] = [stateGroup]
                        // tt.$forceUpdate(); //强制更新
                    }
                },
                error: function () {

                }
            });
        },

        // 初始化职位数据
        initPostPop() {
            var tt = this;
            tt.showPostPop = false;
            tt.showSecondPop = false;
            tt.showChildPop = false;
            tt.choseType = [];
            tt.choseTypeObj = [];
        },


        // 获取默认简历详情
        getDefaultResume() {
            var tt = this;
            $.ajax({
                url: '/include/ajax.php?service=job&action=resumeDetail&default=1',
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        tt.reseumeDetail = data.info;
                        tt.resumeShow = data.info.private;
                        $(".resume_pub,.intention").attr('data-set',1)
                        $(".resume_pub span").html(tt.resumeShow == 1 ? '简历已隐藏，仅主动投递可查看':'已公开，全部招聘方可见');
                        if(data.info.workState_name){
                            $(".intention span").html(data.info.workState_name)
                        }
                        tt.getJobPostType(data.info);//获取职位分类
                        tt.refreshTopFunc(); //获取刷新置顶的相关配置

                        tt.$nextTick(() => {
                            tt.checkRunTime(tt.reseumeDetail.refreshNext)
                            tt.refreshNext = tt.reseumeDetail.refreshNext; //下次刷新时间
                            tt.checktop(tt.reseumeDetail.bid_end);
                            refreshFreeCount = tt.reseumeDetail.refreshCount//设置的免费刷新次数
                            refreshFree = tt.reseumeDetail.refreshCount -  tt.reseumeDetail.refreshTimes; //剩余的刷新次数
                        })
                    }else{
                        tt.getJobPostType();//获取职位分类
                        if(noDeirectShow){
                            tt.showPostPop = true;
                        }
                    }
                    
                },
                error: function () {

                }
            });
        },

        timeStrToDate(timeStr){
			var now = new Date();
			var date = new Date(timeStr * 1000)
			var year = date.getFullYear();  //取得4位数的年份
			var month = date.getMonth()+1;  //取得日期中的月份，其中0表示1月，11表示12月
            month = month > 9 ? month : '0' + month
			var dates = date.getDate();      //返回日期月份中的天数（1到31）
            dates = dates > 9 ? dates : '0' + dates
			var day = date.getDay();
			var hour = date.getHours();     //返回日期中的小时数（0到23）
            hour = hour > 9 ? hour : '0' + hour;
			var minute = date.getMinutes(); //返回日期中的分钟数（0到59）
            minute = minute > 9 ? minute : '0' + minute;
			// var second = date.getSeconds(); //返回日期中的秒数（0到59）
			// var weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
			var datestr = month + '/' + dates + ' ' ;
			if(now.toDateString() === date.toDateString() ){
				datestr = '今天'
			}
			datestr = datestr  + hour +  ':' + minute;

			return datestr;
		},

        // 验证当前时间
        checkTime(time){
            let inTime = false;
            const now = parseInt(+new Date() / 1000);
            if(time > now){  //在时间内
                inTime = true;
            }
            return inTime;

        },


        // 下一次刷新
        checkRunTime(time){
            const that =  this;
            if(time > 0){
                time = Number(time);
                let curr = parseInt(new Date().valueOf()/1000);
                if(curr > time){
                    clearInterval(nextFreshIntferval);
                    $('.onfreshPop .refreshBox,.bgbox .refreshBox').remove(); //没有刷新
                }else{
                    let day = parseInt((refreshEnd * 1 - parseInt((new Date().valueOf()/ 1000)) )/86400) 
                    if(day > 0){
                        $('.onfreshPop .refreshBox em').text(day + '天后结束')
                    }
                    nextFreshIntferval = setInterval(function(){
                        const timeOff = time - parseInt(new Date().valueOf()/1000) ;
                        let hh = parseInt(timeOff / (60 * 60 ))
                            hh = hh > 9 ? hh : '0' + hh
                        let mm = parseInt(timeOff % (60 * 60 ) / 60)
                            mm = mm > 9 ? mm : '0' + mm
                        let ss = timeOff % (60 * 60 ) % 60;
                            ss = ss > 9 ? ss : '0' + ss
                        $('.bgbox .refreshBox em').text(hh + ':' + mm + ':' + ss)
                        if(timeOff <= 0){
                            clearInterval(nextFreshIntferval);
                        }
                    },1000)
                }
            }
        },

        //置顶
        checktop(bid_end){
            // 置顶时间
            const now = parseInt((new Date()).valueOf() / 1000)
            let day = Math.ceil((bid_end - now)/86400)
            $(".totop_pop .refreshBox em").text(day + '天')
        },


        // 更新简历
        updateResume(name, state) {
            var tt = this;
            tt.joinStatePop = false;
            var param = [];
            param.push('columns=' + name);
            param.push('id=' + tt.reseumeDetail.id);
            param.push(name + '=' + state.id);
            tt.updateResumeConfirm(param); //提交数据

        },

        // 更新简历是否可见
        updateResumePrivate() {
            var tt = this;
            var param = [];
            param.push('private=' + tt.resumeShow);
            tt.updateResumeConfirm(param, 1, function () {
                tt.reseumeDetail.private = tt.resumeShow;
                tt.resumeShowPop = false;
            })
        },

        // 确认更新，提交数据
        updateResumeConfirm(param, type, callback) {
            var tt = this;
            var url = '/include/ajax.php?service=job&action=aeResume&cityid='+cityid;
            if (type) {
                url = '/include/ajax.php?service=job&action=setResumePrivate'
            }
            if (tt.noClick) return false;
            tt.noClick = true;
            $.ajax({
                url: url,
                data: param.join('&'),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        tt.noClick = false;
                        showErrAlert('修改成功');
                        tt.getDefaultResume(); //更新成功之后 更新一下数据
                        if (callback) {
                            callback();
                        }
                    } else {
                        tt.noClick = false;
                        showErrAlert(data.info)
                    }

                },
                error: function () {
                    showErrAlert('网络错误，请稍后重试')
                    tt.noClick = false;

                }
            });
        },



     
        // 获取选中的id,只有多级可用
        checkChoseItem() {
            var tt = this;
            var choseArr = [];
            for (var item in tt.choseIndustry) {
                for (var i = 0; i < tt.choseIndustry[item].length; i++) {
                    choseArr.push(tt.choseIndustry[item][i])
                }
            }
            tt.reseumeDetail.type = choseArr;
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

        // 清除所有选中的
        clearAll(type) {
            var tt = this;
            if (type === 'industry') {
                // tt.currResume.type = '';
                tt.choseIndustryObj = [];
                tt.choseIndustry = [];
            } else {
                //  tt.currChoseType = '',// 当前选择的一级分类
                //  tt.currChoseStype = '',//二级分类
                // tt.showLeftPop = false, //二级分类页面左滑
                // tt.showRightPop = false, //三级分类页面左滑
                tt.choseTypeArr = [], //选择的id
                    tt.choseTypeObj = []; //选中的内容
            }
        },

        // 获取职位类别
        getJobPostType(resumeDetail) {
            var tt = this;
            $.ajax({
                url: '/include/ajax.php?service=job&action=type&son=1',
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    if (data.state == 100) {
                        tt.postList = data.info;
                        if (resumeDetail && resumeDetail.job_list) {
                            tt.choseTypeObj = [];
                            for (var m = 0; m < resumeDetail.job_list.length; m++) {
                                tt.checkJobType(data.info, 0, resumeDetail.job_list[m])
                            }
                            tt.checkIntentionPostTypeChosed()
                        }

                    }
                },
                error: function () {

                }
            });
        },

        checkJobType(item, ind, obj) {
            var tt = this;
            for (var i = 0; i < item.length; i++) {
                if (item[i].id == obj[ind]) {
                    ind++;
                    if (ind != obj.length) {
                        tt.checkJobType(item[i].lower, ind, obj)
                    } else {
                        tt.choseTypeObj.push({
                            id: item[i].id,
                            title: item[i].typename
                        })
                    }
                    break;
                }
            }
        },


        // 选择当前分类
        chosePostType(item, type) {
            var tt = this;
            type = type ? type : 0;

            var hasFull = tt.choseTypeArr && tt.choseTypeArr.length >= 3 ? true : false;

            if (tt.pageShow !== 4) {
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

            } else {

                tt.choseMyJob(item, type);
            }



        },

        // 确定选择
        sureChose(type) {
            var tt = this;
            if (type == 'post') {
                tt.reseumeDetail.job = tt.choseTypeObj.map(function (val) {
                    return val.id
                })
                tt.jobText = tt.choseTypeObj.map(function (val) {
                    return val.title
                })
                tt.reseumeDetail.job_list = tt.choseTypeArr;
                tt.reseumeDetail.job_name = tt.jobText;
                tt.showPostPop = false;
            } else {
                tt.typeText = tt.choseIndustryObj.map(function (val) {
                    return val.title
                })
                tt.reseumeDetail.type_name = tt.typeText;
                tt.reseumeDetail.type = tt.choseIndustryObj.map(function (val) {
                    return val.id
                })
                tt.showIndustryPop = false;
            }
            tt.$forceUpdate(); //强制更新
            var param = [];
            param.push('columns=job' )
            param.push('id=' + tt.reseumeDetail.id )
            param.push('job=' +  tt.reseumeDetail.job)
            tt.updateResumeConfirm(param)
        },

        // 将意向职位选中的值赋值一下
        checkIntentionPostTypeChosed() {
            var tt = this;
            if (tt.reseumeDetail.job_list && tt.reseumeDetail.job_list.length) {
                tt.choseTypeArr = tt.reseumeDetail.job_list
            }
        },

    


        // 曾经的职位选择
        showPostPopSingle() {
            var tt = this;
            tt.showPostPop = true;
            if (tt.workjl.jobid && tt.workjl.jobid.length) {
                tt.checkPostTypeChosed()
            }

        },

        showPostChose:function(ind){
            var tt = this;
            tt.showPostPop = true;
            if(!isNaN(ind)){
                tt.currChoseType = tt.postList.find(item => {
                    return item.id == tt.reseumeDetail.job_list[ind][0]
                })
                tt.currChoseStype = tt.currChoseType.lower.find(item => {
                    return item.id == tt.reseumeDetail.job_list[ind][1]
                })
                tt.showLeftPop =  true; //二级分类页面左滑
                tt.showRightPop = true; //三级分类页面左滑

                tt.$nextTick(() => {
                    $(".rootBox,.childrenBox,.parentBoxS").scrollTop(0);
                    setTimeout(() => {
                        $(".root_ul li").each(function(){
                            $(this).attr('data-top',$(this).position().top);
                        })
                        $(".children_ul li").each(function(){
                            $(this).attr('data-top',$(this).position().top);
                        })
                        $(".parent_ul li").each(function(){
                            $(this).attr('data-top',$(this).position().top);
                        })
                        
                    }, 100);

                    setTimeout(() => {
                        let top1 = $(".root_ul li[data-id='"+ tt.reseumeDetail.job_list[ind][0] +"']").attr('data-top')
                        let top2 = $(".parent_ul li[data-id='"+ tt.reseumeDetail.job_list[ind][1] +"']").attr('data-top')
                        let top3 = $(".children_ul li[data-id='"+ tt.reseumeDetail.job_list[ind][2] +"']").attr('data-top')
                        $(".rootBox").scrollTop(top1)
                        $(".parentBoxS").scrollTop(top2)
                        $(".childrenBox").scrollTop(top3)
                    }, 500);



                })
            }
        },

        // 显示刷新弹窗
        showRefreshPop(){
            var tt = this;
            tt.refreshPopShow = true;
            // if(tt.reseumeDetail.completion > 50){
            // }
        },

        // 刷新置顶配置
        refreshTopFunc() {
            var tt = this;
            //初始加载配置信息，包括会员相关信息
            $.ajax({
                type: "POST",
                url: "/include/ajax.php",
                dataType: "json",
                data: {
                    'service': 'siteConfig',
                    'action': 'refreshTopConfig',
                    'module': 'job',
                    'act': 'detail',
                    'userid': userid_, //用户id
                },
                success: function (data) {
                    if (data && data.state == 100) {

                        var refreshSmart = data.info.config.refreshSmart;
                        tt.refresh_tc = [];
                        tt.normalRefreshPice = data.info.config.refreshNormalPrice
                        refreshSmart.forEach(function (val) {
                            tt.refresh_tc.push({
                                days: val.day, //刷新天数
                                unit: val.unit, //单价
                                countPrice: val.price, //计价
                                fresh: val.times, //每日刷新次数
                                offer: val.offer, //优惠价格
                            })
                        })
                        var topNormal = data.info.config.topNormal;
                        tt.top_tc = [];
                        topNormal.forEach(function (val) {
                            tt.top_tc.push({
                                days: val.day, //置顶天数
                                unit: val.price, //单价
                                countPrice: val.price, //计价
                                offer: val.offer, //优惠价格
                            })
                        })

                        refreshFree = data.info.config.refreshFreeTimes - data.info.memberFreeCount;
                        refreshFreeCount = data.info.config.refreshFreeTimes;

                        // console.log(refreshFree,refreshFreeCount,data.info.memberFreeCount);

                    } else {
                        alert(data.info);
                    }
                },
                error: function () {
                    alert(langData['siteConfig'][20][227]); //网络错误，加载失败！
                }
            });
        },

        // 刷新购买
        smartFresh() {
            var tt = this;
            if(tt.ref_chose == tt.refresh_tc.length){
                tt.refreshResume(1,tt.reseumeDetail.id);
                return false

            }
            if (tt.freshDates == '') {
                tt.oneFresh(tt.reseumeDetail)
                return false;
            }
            var aid = tt.reseumeDetail.id;
            $("#refreshTopForm input[name='type']").val('smartRefresh');
            $("#refreshTopForm input[name='act']").val('resume');
            $("#refreshTopForm input[name='aid']").val(aid);
            $("#refreshTopForm input[name='config']").val(tt.ref_chose)

            var type = $("#refreshTopForm input[name='type']").val();
            var module = $("#refreshTopForm input[name='module']").val();
            var act = $("#refreshTopForm input[name='act']").val();
            var aid = $("#refreshTopForm input[name='aid']").val();
            var amount = $("#refreshTopForm input[name='amount']").val();
            var config = $("#refreshTopForm input[name='config']").val();
            var tourl = $("#refreshTopForm input[name='tourl']").val();

            $.ajax({
                type: 'POST',
                url: '/include/ajax.php?service=siteConfig&action=refreshTop&type=' + type + '&module=' + module + '&act=' + act + '&aid=' + aid + '&amount=' + amount + '&config=' + tt.ref_chose + '&tourl=' + tourl,
                dataType: 'json',
                success: function (str) {

                    info = str.info;
                    if (str.state == 100 && str.info != "") {

                        $("#amout").text(info.order_amount);
                        $('.payMask').show();
                        $('.payPop').css('transform', 'translateY(0)');

                        // if(usermoney*1 < info.order_amount *1){
                        //
                        //   $("#moneyinfo").text('余额不足，');
                        // }
                        if (usermoney * 1 < info.order_amount * 1) {

                            $("#moneyinfo").text('余额不足，');
                            $("#moneyinfo").closest('.check-item').addClass('disabled_pay')

                            $('#balance').hide();
                        }

                        if (monBonus * 1 < info.order_amount * 1 && bonus * 1 >= info.order_amount * 1) {
                            $("#bonusinfo").text('额度不足，');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        } else if (bonus * 1 < info.order_amount * 1) {
                            $("#bonusinfo").text('余额不足，');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        } else {
                            $("#bonusinfo").text('');
                            $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
                        }
                        ordernum = info.ordernum;
                        order_amount = info.order_amount;
                        payVue.paySuccessCall = function(){
                            if(tt.reseumeDetail.refreshNext > parseInt(new Date().valueOf() / 1000)){
                                showErrAlert( '续费成功', 'success');

                            }else{
                                tt.successPop.show = true;
                                tt.successPop.tit = '智能刷新设置成功！';
                                tt.successPop.tip = '好工作即将赶来！'
                            }
                            setTimeout(() => {
                                location.reload()
                            }, 1500);
                        }

                        payCutDown('', info.timeout, info);
                    }
                }
            });
        },

        //立即置顶
        mustTop() {
            var tt = this;
            var aid = tt.reseumeDetail.id;
            $("#refreshTopForm input[name='type']").val('topping');
            $("#refreshTopForm input[name='act']").val('resume');
            $("#refreshTopForm input[name='aid']").val(aid);

            var type = $("#refreshTopForm input[name='type']").val();
            var module = $("#refreshTopForm input[name='module']").val();
            var act = $("#refreshTopForm input[name='act']").val();
            var aid = $("#refreshTopForm input[name='aid']").val();
            var amount = $("#refreshTopForm input[name='amount']").val();
            var tourl = $("#refreshTopForm input[name='tourl']").val();

            $.ajax({
                type: 'POST',
                url: '/include/ajax.php?service=siteConfig&action=refreshTop&type=' + type + '&module=' + module + '&act=' + act + '&aid=' + aid + '&amount=' + amount + '&config=' + tt.top_chose + '&tourl=' + tourl,
                // url: '/include/ajax.php?service=siteConfig&action=refreshTop&type=topping&module=info&act=detail&aid=971&amount=8&config=0&tourl='+'',
                dataType: 'json',
                success: function (str) {

                    info = str.info;
                    if (str.state == 100 && str.info != "") {
                        $("#amout").text(info.order_amount);
                        $('.payMask').show();
                        $('.payPop').css('transform', 'translateY(0)');

                        // if(usermoney*1 < info.order_amount *1){
                        //
                        //   $("#moneyinfo").text('余额不足，');
                        // }
                        if (usermoney * 1 < info.order_amount * 1) {

                            $("#moneyinfo").text('余额不足，');
                            $("#moneyinfo").closest('.check-item').addClass('disabled_pay')

                            $('#balance').hide();
                        }

                        if (monBonus * 1 < info.order_amount * 1 && bonus * 1 >= info.order_amount * 1) {
                            $("#bonusinfo").text('额度不足，');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        } else if (bonus * 1 < info.order_amount * 1) {
                            $("#bonusinfo").text('余额不足，');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        } else {
                            $("#bonusinfo").text('');
                            $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
                        }

                        ordernum = info.ordernum;
                        order_amount = info.order_amount;

                        payVue.paySuccessCall = function(){
                            if(tt.reseumeDetail.bid_end && tt.checkTime(tt.reseumeDetail.bid_end)){
                                showErrAlert( '续费成功', 'success')
                            }else{
                                tt.successPop.show = true;
                                tt.successPop.tit = '置顶成功';
                                tt.successPop.tip = '正在推荐给更多HR，注意查收好消息！'
                            }
                            setTimeout(() => {
                                tt.successPop.show = false;
                                location.reload();
                            }, 1500);
                            
                        }

                        payCutDown('', info.timeout, info);
                    }
                }
            });

        },

        
        // 立即刷新
         refreshResume(noTip = false,resumeid){
            if(!resumeid){
                if(refreshFree > 0){  //有免费刷新次数
                    $.ajax({
                        type: "POST",
                        url: "/include/ajax.php",
                        dataType: "json",
                        data: {
                            'service': 'siteConfig',
                            'action': 'freeRefresh',
                            'module': 'job',
                            'act': 'resume',
                            // 'temp':'resume',
                            'aid': resume_aid
                        },
                        success: function (data) {
                            if (data.state == 100) {
                                showErrAlert('刷新成功');
                                refreshFree = refreshFree - 1;
                            } else {
                                that.showErrAlert(data.info)
                            }
                        },
                        error: function () {
                            that.showErrAlert('网络错误，请稍后再试')
                        }
                    })
        
                    return false;
                }else if(refreshFree == 0 && refreshFreeCount !== 0 && !noTip){ //设置了免费次数，但是已用完
                    showErrAlert('免费次数已用完')
                }
                resumeid = resume_aid
            }
           
            $("#refreshTopForm input[name='type']").val('refresh');
            $("#refreshTopForm input[name='act']").val('resume');
            $("#refreshTopForm input[name='aid']").val(resumeid);
           
    
            var type = $("#refreshTopForm input[name='type']").val();
            var module = $("#refreshTopForm input[name='module']").val();
            var act = $("#refreshTopForm input[name='act']").val();
            var aid = $("#refreshTopForm input[name='aid']").val();
            var amount = $("#refreshTopForm input[name='amount']").val();
            var config = $("#refreshTopForm input[name='config']").val();
            var tourl = $("#refreshTopForm input[name='tourl']").val();
            $.ajax({
                type: 'POST',
                url: '/include/ajax.php?service=siteConfig&action=refreshTop&type=' + type + '&module=' + module + '&act=' + act + '&aid=' + aid + '&amount=' + amount + '&tourl=' + tourl,
                dataType: 'json',
                success: function (str) {
    
                    info = str.info;
                    if (str.state == 100 && str.info != "") {
    
                        $("#amout").text(info.order_amount);
                        $('.payMask').show();
                        $('.payPop').css('transform', 'translateY(0)');
    
                        // if(usermoney*1 < info.order_amount *1){
                        //
                        //   $("#moneyinfo").text('余额不足，');
                        // }
                        if (usermoney * 1 < info.order_amount * 1) {
    
                            $("#moneyinfo").text('余额不足，');
                            $("#moneyinfo").closest('.check-item').addClass('disabled_pay')
    
                            $('#balance').hide();
                        }
    
                        if (monBonus * 1 < info.order_amount * 1 && bonus * 1 >= info.order_amount * 1) {
                            $("#bonusinfo").text('额度不足，');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        } else if (bonus * 1 < info.order_amount * 1) {
                            $("#bonusinfo").text('余额不足，');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        } else {
                            $("#bonusinfo").text('');
                            $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
                        }
                        ordernum = info.ordernum;
                        order_amount = info.order_amount;
    
                        payCutDown('', info.timeout, info);
                        payVue.paySuccessCall = function(){  //支付成功之后需要执行的方法
                            location.reload();
                            console.log('支付成功')
                        }
                    }
                }
            });
        }

    },
    watch: {

        // 弹窗显示 禁止滚动
        previewPop: function (val) {
            if (val) {
                $('html').addClass('noscroll')
                toggleDragRefresh('off');
            } else {
                toggleDragRefresh('on');
                $('html').removeClass('noscroll')
            }
        },
        refreshPopShow: function (val) {
            if (val) {
                $('html').addClass('noscroll')
                toggleDragRefresh('off');
            } else {
                toggleDragRefresh('on');
                $('html').removeClass('noscroll')
            }
        },
        toTopPopShow: function (val) {
            const tt = this;
            if (val) {
                $('html').addClass('noscroll')
                toggleDragRefresh('off');
            } else {
                toggleDragRefresh('on');
                $('html').removeClass('noscroll')
            }
        },

        'successPop.show':function(val){
            const that = this;
            if(val){
                setTimeout(() => {
                    that.successPop.show = false
                }, 1500);
            }
        },

        resumeShowPop(val){
            if(!val){
                this.resumeShow = this.reseumeDetail.private
            }
        }

    

    },
})