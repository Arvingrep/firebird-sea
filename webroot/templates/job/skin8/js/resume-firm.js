date = new Vue({
    el: '#calendar',
    data: {
        value: '',
    },
    mounted() { },
    methods: {},
    watch: {
        value: function (val) {
            if (val) {
                $('.addpop.invite .confirm').removeClass('none');
            } else {
                $('.addpop.invite .confirm').addClass('none');
            }
        }
    }
});
$(function () {
    var result;
    // 获取沟通记录
    let data = {
        service: 'job',
        action: 'processRecord',
        rid: details.id
    };
    ajax(data).then(res => {
        if (res.state == 100) {
            let text = res.info.post ? `沟通职位：${res.info.post.title}` : '招聘意向'
            $('.cro-talk p').text(text);
            result = res.info;
            let arr = Object.values(result).filter(item => item.time)//对象转换成数组并去除掉空的数组
            arr = arr.sort(compare('time', false));//按对象中时间排序
            let str = ``;
            for (i = 0; i < arr.length; i++) {
                arr[i].time = huoniao.transTimes(arr[i].time,1);
                switch (arr[i].type) {
                    case 'u_read': {
                        str += `
                        <li>
                            <p>求职者</p>
                            <div>查看了职位：${result.post.title}</div>
                            <span>${arr[i].time}</span>
                        </li>
                        `;
                        break;
                    };
                    case 'read': {
                        str += `
                        <li>
                            <p>${result.post.company.people}/${result.post.company.people_job}</p>
                            <div>查阅了简历</div>
                            <span>${arr[i].time}</span>
                        </li>
                        `;
                        break;
                    };
                    case 'delivery': {
                        str += `
                        <li>
                            <p>求职者</p>
                            <div>投递了职位：${result.post.title}</div>
                            <span>${arr[i].time}</span>
                        </li>
                        `;
                        break;
                    };
                    case 'invitation': {
                        str += `
                        <li>
                            <p>${result.post.company.people}/${result.post.company.people_job}</p>
                            <div>发起了面试邀请</div>
                            <span>${arr[i].time}</span>
                        </li>
                        `;
                        break;
                    };
                    case 'remark': {
                        str += `
                        <li>
                            <p>${result.post.company.people}/${result.post.company.people_job}</p>
                            <div>${arr[i].state == "1" ? "标记简历不合适" : ("标记：" + (arr[i].remark_type == '1' ? '邀请面试' : arr[i].remark_type == '2' ? '未接通' : arr[i].remark_type == '3' ? '待回复' : arr[i].remark_type == '4' ? '待拨打' : arr[i].remark_type == '5' ? '不合同' : '') + (arr[i].msg ? '，' + arr[i].msg : ''))}</div>
                            <span>${(arr[i].time,1)}</span>
                        </li>
                        `;
                        break;
                    };
                    default: break;
                };
            };
            $('.cro-history ul').html(str);
            $('.cro-history').show();
            if (result.invitation.state == 6) { //面试取消
                if (details.unSuit == 1) {
                    return
                }
                $('.cro-btn .btn1').hide();
                $('.cro-btn .btn2,.cro-btn .btn3').show();
                if (result.invitation.refuse_author == 'member') { //求职者取消
                    $('.cro-btn .btn3 .text').text('求职者面试已取消');
                    $('.cro-btn .btn3 .talk').css('flex', '1');
                    $('.cro-btn .btn3 .invite,.cro-btn .btn3 .shield').hide();
                }
            }
        }
    });
    var timer;
    // 邀请面试按钮
    if (details.invitation != 0) { //已邀请面试
        $('.cro-btn .btn1 .invite').addClass('had');
        $('.cro-btn .btn1 .invite').find('span').text('已邀请面试');
    };
    $('.cro-btn .btn1 .invite,.cro-btn .btn3 .invite').click(function () {
        let className = $(this).attr('class');
        if (!userid) { //未登录
            location.href = `${masterDomain}/login.html`;
            return
        } else if (cid == 0) { //未开通招聘公司跳转
            $('.cregister').show();
            return
        };
        if (className.indexOf('had') == -1 && !details.download) {//未邀请面试、未下载(买简历去)
            if (mapPop.businessInfo.combo_id == 0 && mapPop.businessInfo.package_resume == 0) {
                mapPop.popularAddPop = true;
                return
            };
            mapPop.downResumePop = true;
        } else if (className.indexOf('had') == -1) {//未邀请面试
            if (mapPop.businessInfo.people == "" || mapPop.businessInfo.contact == "") {
                $('.pw-con p').text('请先完善招聘联系人信息');
                $('.pw-con span').text('您还没有填写招聘联系人信息，完善后可邀请面试');
                $('.pw-con .btn .confirm').text('再看看');
                $('.pw-con .btn .purchase').text('立即前往');
                $('.popwarn').show();
                setTimeout(() => {
                    $('.pw-con').css({ 'transform': 'scale(1)' });
                }, 0);
                return
            };
            mapPop.getAllAddrList('all'); //获取地址列表
            // 匹配投递的职位
            let td_index = mapPop.postArr.findIndex((item) => item.id == mapPop.downResumeDetail.delivery_pid);
            if (td_index > -1) {
                mapPop.resumeForm.postInfo = mapPop.postArr[td_index];
                if (mapPop.resumeForm.postInfo.job_addr_detail) {
                    mapPop.resumeForm.job_addr_id = mapPop.postArr[td_index].job_addr;
                }
            };
            mapPop.currResume = details;
            mapPop.formPop = true;
        };
    });
    // 不合适按钮
    $('.cro-btn .btn1 .shield,.cro-btn .btn3 .shield').click(function () {
        let data;
        if (!userid) { //未登录
            location.href = `${masterDomain}/login.html`;
            return
        } else if (cid == 0) { //未开通招聘公司跳转
            $('.cregister').show();
            return
        };
        if (details.delivery == 0) { //可取消不合适
            data = {
                service: 'job',
                action: 'customRemark',
                unsuit: 1,
                rid: details.id
            };
            ajax(data).then(res => {
                $('.cro-btn .btn1,.btn2,.btn3').hide();
                $('.cro-btn .cancel').show();
                // 提示
                $('.warning').removeClass().addClass('warning filter');
                $('.warning p').text('已标记不合适，将为你过滤此简历');
                $('.warning').css({ 'display': 'flex' });
                clearTimeout(timer);
                timer = setTimeout(function () {
                    $('.warning').hide();
                }, 2000);
            })
        } else { //不可取消(求职者已投递)
            $(this).find('.btnPop').show();
        }
    });
    // 不合适取消(未投递)
    $('.cro-btn .cancel').click(function () {
        if(!cid){
            $('.cregister').show();
            return
        };
        let data;
        if (details.delivery == 0) { //取消不合适
            data = {
                service: 'job',
                action: 'customRemark',
                unsuit: 0,
                rid: details.id
            };
            ajax(data).then(res => {
                if (result && result.invitation.state == 6) {
                    $('.cro-btn .btn3,.btn2').show();
                } else {
                    $('.cro-btn .btn1,.btn2').show();
                }
                $('.cro-btn .cancel').hide();
                // 提示
                $('.warning').removeClass().addClass('warning cancel');
                $('.warning p').text('已取消不合适，可继续操作此简历');
                $('.warning').css({ 'display': 'flex' });
                clearTimeout(timer);
                timer = setTimeout(function () {
                    $('.warning').hide();
                }, 2000);
            });

        }
    });
    // 不合适原因选择弹出(已投递)
    $('.cro-btn .btn1 .shield .btnPop input,.cro-label .title .add .addpop .refuse input,.cro-btn .btn3 .shield .btnPop input').click(function () {
        if(!cid){
            $('.cregister').show();
            return
        };
        event.stopPropagation();
        let state = $(this).siblings('ul').css('transform');
        $(this).siblings('ul').css({ 'transform': `${state == 'matrix(1, 0, 0, 0, 0, 0)' ? 'scaleY(1)' : 'scaleY(0)'}` });
        $(document).one('click', function () {
            $('.cro-btn .btn1 .shield .btnPop .reason ul').css({ 'transform': 'scaleY(0)' });
        });
    });
    $('.cro-btn .btn1 .shield .btnPop .reason li,.cro-btn .btn3 .shield .btnPop .reason li').click(function () {
        if(!cid){
            $('.cregister').show();
            return
        };
        event.stopPropagation();
        let text = $(this).text();
        $('.cro-btn .btn1 .shield .btnPop input,.cro-btn .btn3 .shield .btnPop input').val(text);
        $(this).closest('ul').css({ 'transform': 'scaleY(0)' })
    });
    // 不合适确定（已投递）
    $('.cro-btn .btn1 .shield .btnPop .btn .confirm,.cro-btn .btn3 .shield .btnPop .btn .confirm').click(function () {
        if(!cid){
            $('.cregister').show();
            return
        };
        let text = $(this).closest('.btn').siblings('.reason').find('input').val();
        let data = {
            service: 'job',
            action: 'updateDelivery',
            state: 2,
            rid: details.id,
            refuse_msg: text
        };
        ajax(data).then(res => {
            if (res.state == 100) {
                location.reload();
            }
        })
    });
    // 不合适取消（已投递）
    $('.cro-btn .btn1 .shield .btnPop .btn .callback,.cro-btn .btn3 .shield .btnPop .btn .callback').click(function () {
        if(!cid){
            $('.cregister').show();
            return
        };
        event.stopPropagation();
        $(this).closest('.btnPop').hide();
    });
    // 取消面试
    $('.cro-btn .btn1 .cancelIn').click(function () { //弹出弹窗
        if(!cid){
            $('.cregister').show();
            return
        };
        $(this).find('.btnPop').show();
    });
    $('.cro-btn .btn1 .cancelIn .btnPop .btn .callback').click(function () { //取消 取消面试
        event.stopPropagation();
        $(this).closest('.btnPop').hide();
    });
    $('.cro-btn .btn1 .cancelIn .btnPop .btn .confirm').click(function () { //确定 取消面试
        event.stopPropagation();
        if(result && result.invitation){

            let data = {
                service: 'job',
                action: 'updateInterView',
                id: result.invitation.id,
                state: 6,
                refuse_msg: '招聘方已取消面试',
                refuse_author: details.userid == userid ? 'member' : 'company'
            };
            ajax(data).then(res => {
                if (res.state == 100) {
                    location.reload();
                }
            })
        }else{
            alert('数据出错，请联系求职者取消面试')
        }
    });
    // 收藏按钮
    $('.cro-btn .btn2 .item').eq(1).click(function () {
        if(!cid){
            $('.cregister').show();
            return
        };
        let data = {
            service: 'member',
            action: 'collect',
            module: 'job',
            temp: 'resume',
            id: $(this).attr('data-id'),
        };
        if (userid) { //已登录
            if ($(this).attr('class').indexOf('collected') == -1) { //收藏
                data.type = 'add';
                ajax(data).then(res => {
                    $(this).addClass('collected');
                    // 提示
                    $('.warning').removeClass().addClass('warning collect');
                    $('.warning p').text('收藏成功');
                    $('.warning').show();
                    clearTimeout(timer);
                    timer = setTimeout(function () {
                        $('.warning').hide();
                    }, 2000);
                    $(this).find('p').text('已收藏');
                });
            } else { //取消收藏
                data.type = 'del';
                ajax(data).then(res => {
                    $(this).removeClass('collected');
                    $(this).find('p').text('收藏')
                });
            };
        } else { //未登录
            location.href = `${masterDomain}/login.html`
        }
    });
    // 举报
    $(".cr-complain span a").bind("click", function () {
        $.dialog({
            fixed: true,
            title: "信息举报",
            content: 'url:' + masterDomain + '/complain-job-resume-' + id + '.html',
        });
    });
    // 查看电话
    $('.cro-btn .btn1 .phone').click(function () {
        if (!userid) { //未登录
            location.href = `${masterDomain}/login.html`;
            return
        } else if (cid == 0) { //未开通招聘公司跳转
            $('.cregister').show();
            return
        };
        if (!details.download) {
            mapPop.downResumePop = true;
        }
    });
    // 保存简历至本地
    $('.cro-btn .btn2 .item').eq(2).click(function () {
        if (!userid) { //未登录
            location.href = `${masterDomain}/login.html`;
            return
        } else if (cid == 0) { //未开通招聘公司跳转
            $('.cregister').show();
            return
        };
        if (details.download == 0) { //未购买弹出提示
            $('.popwarn').show();
            setTimeout(() => {
                $('.pw-con').css({ 'transform': 'scale(1)' });
            }, 0);
        };
    });
    $('.pw-con img').click(function () { //关闭弹窗
        $('.popwarn').hide();;
        $('.pw-con').css({ 'transform': 'scale(0)' })
    });
    // 保存至本地弹窗确认
    $('.popwarn .confirm').click(function () {
        if (!mapPop.resumeForm.name || !mapPop.resumeForm.phone) {
            $('.pw-con img').click()[0]
            return
        };
        top.location.href = `/include/ajax.php?service=job&action=downloadResume&id=${mapPop.downResumeDetail.id}&local=1`;
    });
    // 保存至本地购买按钮
    $('.popwarn .purchase').click(function () {
        if (!mapPop.resumeForm.name || !mapPop.resumeForm.phone) {
            top.location.href = `${masterDomain}/supplier/job/company_info.html?to=2`;
            return
        };
        mapPop.locationb = true;
        mapPop.downResumePop = true;
        $('.pw-con img').click()[0];
    });
    // 添加标记状态
    $('.cro-label .title .add').click(function () {
        event.stopPropagation();
        $(this).find('.addpop').show();
        $(document).one('click', function () {
            $('.cro-label .title .add .addpop').hide();
        });
    });
    $('.cro-label .title .add .addpop.remark .label li').click(function () {
        $(this).addClass('active').siblings().removeClass('active');
    });
    $('.cro-label .title .add .addpop.remark textarea').on('input', function (e) {
        let length = e.currentTarget.value.length;
        $(this).siblings('.number').find('span').text(length);
    });
    $('.cro-label .title .add .addpop .btn .callback').click(function () {
        event.stopPropagation();
        $(this).closest('.addpop').hide();
    });
    $('.cro-label .title .add .addpop.remark .btn .confirm').click(function () {
        event.stopPropagation();
        let type = $('.cro-label .title .add .addpop .label .active').attr('data-type');
        let reason = $('.cro-label .title .add .addpop textarea').val();
        let data = {
            service: 'job',
            action: 'customRemark',
            rid: details.id,
            remark: reason,
            type: type
        };
        ajax(data).then(res => {
            location.reload();
        })
    });
    // 面试状态添加标记
    $('.cro-label .title .add .addpop.invite .label li').click(function () {
        event.stopPropagation();
        let index = $(this).index();
        switch (index) {
            case 0: {
                $(this).addClass('active').siblings().removeClass();
                $(this).closest('.invite').removeClass().addClass('addpop invite access');
                if (!date.value) {
                    $('.addpop.invite .confirm').addClass('none')
                } else {
                    $('.addpop.invite .confirm').removeClass('none')
                }
                break;
            };
            case 1: {
                $(this).closest('.invite').removeClass().addClass('addpop invite talk');
                $(this).addClass('active').siblings().removeClass();
                if (!$('.addpop.invite textarea').val()) {
                    $('.addpop.invite .confirm').addClass('none')
                } else {
                    $('.addpop.invite .confirm').removeClass('none')
                }
                break;
            };
            case 2: {
                $(this).closest('.invite').removeClass().addClass('addpop invite talk');
                $(this).addClass('active ban').siblings().removeClass();
                if (!$('.addpop.invite textarea').val()) {
                    $('.addpop.invite .confirm').addClass('none')
                } else {
                    $('.addpop.invite .confirm').removeClass('none')
                }
                break;
            };
            default: break;
        };
        return
    });
    $('.cro-label .title .add .addpop.invite .btn .confirm').click(function () { //确认按钮
        event.stopPropagation();
        let type = $('.cro-label .title .add .addpop .label .active').attr('data-type');
        let reason = $('.cro-label .title .add .addpop textarea').val();
        let time = new Date(date.value).getTime() / 1000;
        if (!reason && (type == 3 || type == 5)) { //沟通offer
            $('.cro-label .title .add .addpop textarea').addClass('flash');
            setTimeout(() => {
                $('.cro-label .title .add .addpop textarea').removeClass('flash');
            }, 1000);
            return
        }
        if (!time && type == 4) { //入职时间
            $('.el-input--prefix .el-input__inner').addClass('flash');
            setTimeout(() => {
                $('.el-input--prefix .el-input__inner').removeClass('flash');
            }, 1000);
            return
        }
        let data = {
            service: 'job',
            action: 'updateInterView',
            id: result.invitation.id,
            remark: reason,
            state: type,
            rz_date: time ? time : ''
        };
        ajax(data).then(res => {
            // return
            location.reload();
        })
    });
    // $('.cro-label .title .add .addpop .refuse ul li').click(function(){ //已面试不合适理由选择
    //     event.stopPropagation();
    //     let text=$(this).text();
    //     $('.cro-label .title .add .addpop .refuse input').val(text);
    //     $(this).closest('ul').css({'transform':'scaleY(0)'});
    //     $('.addpop.invite .confirm').removeClass('none')
    // });
    $('.el-icon-plus').click(function () {
        $(this).hide();
        $('.cro-label .title .add .addpop .explain').show();
    });
    $('.cro-label .title .add .addpop.invite textarea').on('input', function (e) {
        let length = e.currentTarget.value.length;
        let val = e.currentTarget.value;
        $(this).siblings('.number').find('span').text(length);
        if (val || val != 0) {
            $('.addpop.invite .confirm').removeClass('none');
        } else {
            $('.addpop.invite .confirm').addClass('none');
        }
    });
    // 打印
    $('.cro-btn .btn2 .item.print').click(function () {
        if(!cid){
            $('.cregister').show();
            return
        };
        window.print();
    });
    // 企业注册弹窗关闭
    $('.cgc-close,.cgc-btn').click(function () {
        $('.cg-con').css({ 'animation': 'bottomFadeOut .3s' });
        setTimeout(() => {
            $('.cregister').hide();
            $('.cg-con').css({ 'animation': 'topFadeIn .3s' });
        }, 280);
    });
});
function ajax(data) {
    return new Promise(resolve => {
        $.ajax({
            url: '/include/ajax.php?',
            data: data,
            dataType: 'jsonp',
            timeout: 5000,
            success: (res) => {
                resolve(res);
            }
        })
    })
};
//按照对象属性排序
function compare(property, asc) {
    return function (value1, value2) {
        let a = value1[property];
        let b = value2[property];
        // 默认升序
        if (asc == undefined) {
            return a - b
        } else {
            return asc ? a - b : b - a
        }
    }
};
// 时间戳转换日期
function timestampToTime(timestamp) {

    const dateFormatter = huoniao.dateFormatter(timestamp);
    const Y = dateFormatter.year;
    const M = dateFormatter.month;
    const D = dateFormatter.day;
    const h = dateFormatter.hour;
    const m = dateFormatter.minute;
    
    return Y + M + D + h + m;
};