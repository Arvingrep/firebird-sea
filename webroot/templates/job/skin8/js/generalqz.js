$(function(){
    // 分页内容修改
    $('.pagination li:eq(0) span, .pagination li:eq(0) a').html('<');
    $('.pagination li:last-child span, .pagination li:last-child a').html('>');
    // 点击搜索
    $('.tcr-search img').click(function(){
        $('.tcr-search form').submit();
    });
    if(!$('.dll-page')[0]&&!$('.cl-none')[0]){
        $('.dl-left').css({'background-color':'white'});
        $('.dll-text').css({'display':'block'})
    };
    // tab排序切换
    $('.dll-tab a').click(function(){
        let order=$(this).attr('data-order');
        replaceFn(['orderby'],[order]);
    });
    // 学历筛选信息
    let data={
        service:'job',
        action:'getItem',
        name:'pgeducation'
    }
    ajax(data).then(res=>{
        let url=location.search;
        let params = new URLSearchParams(url.slice(1));
        id=params.get('education');
        let str=`<div>学历不限</div>`;
        for(let i=0;i<res.pgeducation.length;i++){
            str+=`<div data-id=${res.pgeducation[i].id} ${id==res.pgeducation[i].id?'style="color:#2278FF"':''}>${res.pgeducation[i].typename}</div>`;
            if(res.pgeducation[i].id==id){
                $('.dfm-left .edu').find('span').text(res.pgeducation[i].typename);
            }
        }
        $('.dfm-left .edu').find('.fItem').html(str);
    });
    $('.df-area ul').delegate('li','click',function(){ // 地区筛选
        let id=$(this).attr('data-id');
        replaceFn(['addrid'],[id]);
    });
    $('.dfm-left .edu .fItem').delegate('div','click',function(){ //学历筛选
        let id=$(this).attr('data-id');
        replaceFn(['education'],[id]);
    })
    $('.dfm-left .exp').find('.fItem div').click(function(){ // 经验筛选
        let min=$(this).attr('data-min');
        let max=$(this).attr('data-max');
        replaceFn(['min_experience','max_experience'],[min,max]);
    })
    // 性别筛选
    $('.dfm-left .sex').find('.fItem div').click(function(){
        let sex=$(this).attr('data-sex');
        replaceFn(['sex'],[sex]);
    })
    // 年龄筛选确认
    $('.dfm-left .btn').click(function(){
        let minAge=$('.dfm-left .age').find('.min').val();
        let maxAge=$('.dfm-left .age').find('.max').val();
        replaceFn(['min_age','max_age'],[minAge,maxAge]);
    })
    $('.dfm-left .item input').on({
        'focus':function(){
            $(this).closest('.age').css({'border-color':'#409EFF'});
        },
        'blur':function(){
            $(this).closest('.age').css('border-color','');
        }
    })
    // 分页跳转
    $('.dll-page .btn').click(function(){
        event.preventDefault();
        let value=$('.dll-page').find('input').val();
        replaceFn(['page'],[value]);
    });
    $('.dll-page').find('input').keyup(function(){
        if(event.keyCode==13){
            $('.dll-page .btn').click()[0]
        }
    });
    $('.dll-page ul').delegate('li a','click',function(){
        event.preventDefault();
        let index=$(this).attr('href').indexOf('=');
        let page=$(this).attr('href').slice(index+1)
        replaceFn(['page'],[page]);
    })
    // 最近浏览
    if (!$('.dlr-history .item')[0]) {
        $('.dlr-history').hide();
    };
    let sendSmsData = [];
    if (geetest) {
        captchaVerifyFun.initCaptcha('web','#codeButton',sendSmsFunc)
        $('.getCodes').bind("click", function () {
            if($(".getCodes")[0].className.indexOf('resend')!=-1){
                return
            };
            let tel = $("#phone").val();
            if (tel == '') {
                $('.dlr-manage .phone .warn').text('请输入手机号').show();
                $("#phone").focus();
                return false;
            }
            let phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
            if (!phoneReg.test(tel)) {
                $('.dlr-manage .phone .warn').text('手机号格式不正确').show();
                $("#phone").focus();
                return false;
            }
            //弹出验证码
            if(geetest == 1){
                captchaVerifyFun.config.captchaObjReg.verify();
            }else{
                $('#codeButton').click()
            }
        })
    } else {
        $(".getCodes").bind("click", function () {
            if($(".getCodes")[0].className.indexOf('resend')!=-1){
                return
            };
            let tel = $("#phone").val();
            if (tel == '') {
                $('.dlr-manage .phone .warn').text('请输入手机号').show();
                $("#phone").focus();
                return false;
            }
            let phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
            if (!phoneReg.test(tel)) {
                $('.dlr-manage .phone .warn').text('手机号格式不正确').show();
                $("#phone").focus();
                return false;
            }
            $("#code").focus();
            sendSmsFunc();
        })
    };
    // 验证码登录的确认按钮
    $('.dlr-manage .confirm').click(function () {
        let value = $('#code').val();
        if (value) {
            let phone = $("#phone").val();
            let loginUrl = "/include/ajax.php?service=member&action=smsLogin&rsaEncrypt=1&phone=" + rsaEncrypt(phone) + "&code=" + value + "&areaCode=86";
            $.ajax({
                url: loginUrl,
                dataType: 'json',
                success: function (res) {
                    if (res.state != 100) {
                        $('.dlr-manage .code em').text(res.info).show();
                    } else {
                        location.reload();
                    }
                },
                error: function (res) {
                    $('.dlr-manage .code em').text('网络错误，登录失败').show();
                }
            })
        } else {
            $('.dlr-manage .code em').text('请输入验证码').show();
        }
    });
})
// 筛选
function replaceFn(datas, value) {

    // 获取当前页面的完整 URL（包括查询字符串）
    const url = new URL(window.location);
        
    // 创建 URLSearchParams 对象并将其初始化为当前 URL 的查询字符串部分
    const params = new URLSearchParams(url.search);
    
    // 删除page参数
    const paramToRemove = 'page';
    
    // 判断该参数是否存在于查询字符串中
    if (params.has(paramToRemove)) {
        // 移除指定的参数
        params.delete(paramToRemove);
    }
    
    // 更新 URL 的查询字符串部分
    url.search = params;

    let arr = url.href.split('?');
    let href = arr[0];
    if (location.search) {
        let data = arr[1].split('&');
        a: for (let i = 0; i < datas.length; i++) {
            for (let j = 0; j < data.length; j++) {
                if (data[j].indexOf(`${datas[i]}=`) != -1) {
                    if (value[i]) {
                        data[j] = `${datas[i]}=${value[i]}`;
                    } else {
                        data[j] = '';
                    }
                    value.splice(i, 1);
                    datas.splice(i, 1);
                    --i; //删除一个元素指标减一
                    continue a;
                }
            }
            if (value[i]) {
                data.push(`${datas[i]}=${value[i]}`);
            }
        }
        location.href = `${href}?${data.filter(item => item).join('&')}`;
    } else {
        let str = ''
        for (let i = 0; i < datas.length; i++) {
            if (value[i]) {
                str += `&${datas[i]}=${value[i]}`
            }
        }
        location.href = `${href}?${str.slice(1)}`;
    }
};
//发送验证码
function sendSmsFunc(captchaVerifyParam, callback) {
    let tel = $("#phone").val();
    let areaCode = 86;
    let sendSmsUrl = "/include/ajax.php?service=siteConfig&action=getPhoneVerify";
    sendSmsData = [];
    sendSmsData.push('rsaEncrypt=1');
    sendSmsData.push('type=sms_login');
    sendSmsData.push('areaCode=' + areaCode);
    sendSmsData.push('phone=' + rsaEncrypt(tel));
    sendSmsData.push('terminal=mobile');
    let param = sendSmsData.join('&');
    if (captchaVerifyParam && geetest == 2) {
        param = param + '&geetest_challenge=' + captchaVerifyParam
    } else if (geetest == 1 && captchaVerifyParam) {
        param = param + captchaVerifyParam
    }
    $.ajax({
        url: sendSmsUrl,
        data: param,
        type: 'POST',
        dataType: 'json',
        success: function (res) {
            if (callback) {
                callback(res)
            }
            if (res.state == 101) {
            } else {
                countDown(60,$('.getCodes'));
            }
        }
    })
};
function countDown(seconds,ele){
    let s=seconds;
    $(ele).addClass('resend');
    let timer=setInterval(res=>{
        $(ele).text(`已发送${s--}s`);
    },1000);
    setTimeout(res=>{ //60秒之后清除定时器
        $(ele).text(`重新发送`);
        clearInterval(timer);
        $(ele).removeClass('resend');
    },s*1000);
};