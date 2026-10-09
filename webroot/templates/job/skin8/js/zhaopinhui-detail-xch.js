$(function(){
    if($(window).height()<=$('.cd-right').height){ //右侧粘性定位的条件
        $('.cd-right').css({'position':'relative'});
    };
    let first;
    // 小窗口轮播
    new Swiper('.swiper.smallwindow', {
        slidesPerView: 1,  //视觉窗口里面显示几个滑块
        loop: true, //无缝轮播
        navigation: { //翻页
            nextEl: ".leftarrow.smw",
            prevEl: ".rightarrow.smw",
        },
    });
    // tab跳转
    $('.cdl-header li').click(function () {
        let state=$(this).attr("data-state");
        $(this).addClass('active').siblings().removeClass();
        if(state==1){ //参会企业
            $('html, body').animate({
                scrollTop: $('.cdl-company').offset().top-59
            }, 200);
        }else{
            $('html, body').animate({
                scrollTop: $('.cd-left').offset().top
            }, 200);
        }
    });
    // 查看更多
    $('.cdr-company .header .more').click(function(){
        $('.browsing-more-background').show();
        $('.browsing-more.detail').show();
    });
    // 展示图(弹窗轮播在这里)
    $('.cdr-company .content .swiper').click(function(){
        $('.browsing-more-background').show();
        $('.browsing-more.img').show();
        // $('.browsing-more.img .bm-title').find('span').eq(1).css({width:'auto'})
        if (!first) {
            first = new Swiper('.swiper.popwindow', {
                slidesPerView: 1,  //视觉窗口里面显示几个滑块
                loop: true, //无缝轮播
                navigation: { //翻页
                    nextEl: ".leftarrow.popw",
                    prevEl: ".rightarrow.popw",
                },
                pagination: {
                    el: ".bm-img p",
                    type: "fraction",
                },
            });
        };
    });
    $('.chc-right p span').click(function(){
        $('.cdr-company .swiper ul').click()[0];
    });
    $('.chc-right p em,.cdr-address .content .address em').click(function(){
        $('.cdr-address .content .map .openmap').click()[0];
    });
    // 关闭查看更多/主办方/展位图
    $('.bm-close,.browsing-more-background').click(function(){
        $('.browsing-more').css({'animation':'bottomFadeOut .3s'});      
        setTimeout(() => {
            $('.browsing-more-background').hide();
            $('.browsing-more').hide();
            $('.browsing-more').css({'animation':'topFadeIn .3s'});  
        }, 280);
    });
    // 查看全部
    $('.cdl-body .checkall').click(function(){
        $(this).css({display:'none'});
        $('.cdl-body .extend').css({display:'none'});
        $('.cdl-body .content').css({maxHeight:'none'});
    })
    // 查看全部隐藏判断
    if($('.cdl-body .content').height()<500){
        $('.cdl-body .extend').css({display:'none'});
        $('.cdl-body .checkall').css({display:'none'})
    }
    // 搜索
    let url=location.search;
    let params = new URLSearchParams(url.slice(1));
    let id=params.get('id');
    // 参会企业
    $.ajax({
            url:'/include/ajax.php?action=fairsJoinCJ_xc&service=job',
            data:{
                fid:id
            },
            dataType:'jsonp',
            timeout:5000,
            success:(res)=>{
                if (res.info.list.length != 0) { //有参会企业
                    let str = '';
                    let strr = '';
                    let arr = res.info.list;
                    arr.map(function (item) {
                        str += `
                    <div class="company">
                        <div class="title">
                            <div class="ltext">${item.company}</div>
                            <div class="rtext">展位号<span>${item.seat}</span></div>
                        </div>
                        <ul>
                        </ul>
                    </div>`
                    });
                    str += `<div class="noneResults">当前招聘会没有相关职位，或换个关键词试试</div>`;
                    $('.cdl-company .searchResult').html(str);
                    arr.map(function (item, indexs) {
                        for (item of item.jobs) {
                            strr += `
                        <li>
                            <span style="width: 183px;padding-right: 20px;">${item.name}</span>
                            <span class="number">${item.number}名</span>
                            <span class="detail">${item.description}</span>
                        </li>
                        `
                        }
                        $('.cdl-company .company').eq(indexs).find('ul').html(strr);
                        strr = ''
                    });
                } else {
                    $('.searchResult').hide();
                    $('.cdl-company .initial').css({'display':'flex'});
                }
                $('.cdl-company .loading').hide();
            },
            error:(error)=>{
                console.log(error);
            }
    })
    // 提交搜索
    $('.cdl-company .header .search').submit(function(){
        let formData = new FormData($(this)[0]);
        $.ajax({
            url:'/include/ajax.php?action=fairsJoinCJ_xc&service=job',
            data:{
                keyword:formData.get('keyword'),
                fid:id
            },
            dataType:'jsonp',
            timeout:5000,
            success:(res)=>{
                $('.cdl-company .loading').css({display:'block'})
                let str=''
                let strr=''
                let arr=res.info.list
                if(arr.length==0){
                    $('.cdl-company .company').css({display:'none'});
                    $('.cdl-company .searchResult .noneResults').css({display:'block'})
                }else{
                    arr.map(function(item){
                        str+=`
                        <div class="company">
                            <div class="title">
                                <div class="ltext">${item.company}</div>
                                <div class="rtext">展位号<span>${item.seat}</span></div>
                            </div>
                            <ul>
                            </ul>
                        </div>`
                    })
                    str+=`<div class="noneResults">当前招聘会没有相关职位，或换个关键词试试</div>`   
                    $('.cdl-company .searchResult').html(str) 
                    arr.map(function(item,indexs){
                        for(item of item.jobs){
                            strr+=`
                            <li>
                                <span style="width: 183px;padding-right: 20px;">${item.name}</span>
                                <span class="number">${item.number}名</span>
                                <span class="detail">${item.description}</span>
                            </li>
                            `  
                        }
                        $('.cdl-company .company').eq(indexs).find('ul').html(strr);
                        strr=''
                    })
                    $('.cdl-company .company').css({display:'block'});
                    $('.cdl-company .searchResult .noneResults').css({display:'none'})
                }
                $('.cdl-company .loading').css({display:'none'})
            },
            error:(error)=>{
                console.log(error);
            }
        })
        return false
    })
    // 点击图片提交
    $('.cdl-company .header img').click(function(){
        $('.cdl-company .header .search').submit()
    })
    // 打开报名窗口
    $('.ad-banner-bottom .content .text div,.chc-join').click(function(){
        if(!userid){ //未登录
            $(".background").show();
        }else if(!cid){ //无公司信息
            $('.cregister').show();
        }else{ //获取公司信息
            let data={
                service:'job',
                action:'companyDetail'
            };
            ajax(data).then(res=>{
                if(res.state==100){
                    let item=res.info;
                    if(!item.people&&!item.contact){
                        $('.popwarn').show();
                        return
                    };
                    $('.bj-zhaopin input').val(item.title);
                    $('.bj-concat .name').text(' '+item.people);
                    $('.bj-concat .phone').text(item.contact);
                    $(".background").show();
                }
            });
        }
    });
    // 关闭报名窗口
    $('.bj-title img').click(function(){
        $('.b-jobsjoin').css({'animation':'bottomFadeOut .3s'});      
        setTimeout(() => {
            $('.background').hide();
            $('.b-jobsjoin').css({'animation':'topFadeIn .3s'});  
        }, 280);
    });
    $('.pw-con img,.popwarn .confirm').click(function(){ //关闭弹窗
        $('.pw-con').css({'animation':'bottomFadeOut .3s'});      
        setTimeout(() => {
            $('.popwarn').hide();
            $('.pw-con').css({'animation':'topFadeIn .3s'});  
        }, 280);
     });
    // 提交报名
    $(".bj-submit").click(function(){  
        let id=$(this).attr('data-id');
        let data= {
            service: 'job',
            action: 'joinFairs',
            fid:id
        };
        if(userid){
            ajax(data).then(res=>{
                if(res.state==100){
                    $('.b-success').show(); 
                }else{
                    alert(res.info);
                }
            });
        } else{
            let company=$('.bj-zhaopin input').val();
            let phone=$('.bj-tel .tel').val();
            let code=$('.bj-tel .code').val();
            data.company=company;
            data.phone=phone;
            data.vercode=code;
            ajax(data).then(res=>{
                if(res.state==100){
                    $('.b-success').show(); 
                }else{
                    alert(res.info);
                }
            })
        }
    });
    // 关闭报名成功之后的弹窗
    $('.bs-con .close,.bs-con .btn').click(function(){
        location.reload();
    });
    // 企业注册弹窗关闭
    $('.cgc-close,.cgc-btn').click(function () {
        $('.cg-con').css({ 'animation': 'bottomFadeOut .3s' });
        setTimeout(() => {
            $('.cregister').hide();
            $('.cg-con').css({ 'animation': 'topFadeIn .3s' });
        }, 280);
    });
    let sendSmsData = [];
    if (geetest) {
        captchaVerifyFun.initCaptcha('web','#codeButton',sendSmsFunc)
        $('.getcode').bind("click", function () {
            if ($('.getcode')[0].className.indexOf('resend')!=-1) {
                return
            }
            let tel = $("#phone").val();
            if (tel == '') {
                $("#phone").focus();
                return false;
            }
            let phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
            if (!phoneReg.test(tel)) {
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
        $(".getcode").bind("click", function () {
            if ($('.getcode')[0].className.indexOf('resend')!=-1) {
                return
            }
            let tel = $("#phone").val();
            if (tel == '') {
                $("#phone").focus();
                return false;
            }
            let phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
            if (!phoneReg.test(tel)) {
                $("#phone").focus();
                return false;
            }
            $("#code").focus();
            sendSmsFunc();
        })
    };
    // 地图
    // let test='http://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/article/thumb/large/2023/02/16/16765424666262.png';
    init_URL=MapImg_URL.slice(0,MapImg_URL.indexOf('&markerStyles')).replace('width=300&height=130&zoom=13','width=248&height=170&zoom=17');
    MapImg_URL=`${init_URL}&markerStyles=-1,${templets_skin}images/position_blue_circle.png&scale=2`
	$('.appMapImg').attr('src', typeof MapImg_URL != "undefined" ? MapImg_URL : "");
    $('.appMapBtn').attr('href', OpenMap_URL);
});
function ajax(data){
    return new Promise(resolve=>{
        $.ajax({
            url: '/include/ajax.php?',
            data: data,
            dataType: 'jsonp',
            timeout: 5000,
            success:(res)=>{
                resolve(res);
            }
        })
    })
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
                countDown(60, $('.getcode'));
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