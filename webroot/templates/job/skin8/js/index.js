$(function(){
    let userid=$.cookie('HN_userid');
    if (userid) { //已登录
        // 获取用户信息（头部已经请求过，为了避免浪费请求资源，此处用定时器）
        let userTimes = 0; //循环次数
        let userTimer = setInterval(res => {
            ++userTimes;
            //获取到用户信息
            if(userDetail){ 
                $('.dr-user').hide();//隐藏未登录
                let str1=`
                    <img src="${userDetail.photo}" onerror="this.src='/static/images/noPhoto_100.jpg'">
                    <p>Hi，${userDetail.phoneEncrypt}</p>
                    <span>下午好，欢迎回来</span>
                `;
                $('.dr-user.noResume .dru-photo').html(str1);
                $('.dr-user.noResume').show(); //显示无简历状态
                // 获取用户简历信息
                let data={
                    service:'job',
                    action:'resumeDetail',
                    default:1
                }
                ajax(data).then(res=>{
                    if(res.state==100){ //有简历
                        let str2=`
                            <img src="${userDetail.photo}" class="left" onerror="this.src='/static/images/noPhoto_100.jpg'">
                            <div class="right">
                                <p>Hi，${userDetail.nickname}</p>
                                <span>下午好，欢迎回来</span>
                            </div>
                        `;
                        $('.dru-base').html(str2);
                        $('.dr-usered').show();
                        $('.dr-user.noResume').hide();
                    }
                }).catch(error=>{
                    alert(error);
                });
                // 其他元素样式
                $('.drn-item p').css({'-webkit-line-clamp':'1'});
                let href=`${masterDomain}/supplier/job${job_cid?'/company_info.html':''}`;
                $('.ns-label').attr('href',href);
                clearInterval(userTimer);
            }else if(userTimes>10){ //5秒请求超时
                clearInterval(userTimer);
            }
        }, 500);
        // 我要找工作/找人
        $('.dru-btn').delegate('div', 'click', function () {
            event.preventDefault();//阻止a标签跳转
            let state = $(this).attr('data-state');
            if (state == 0) { //我要找工作(创建简历)
                location.href = `${member_userDomain}/job-resume.html`
            } else {//我要招人
                location.href = `${channelDomain}/talent.html`
            }
        });
    }
    // 最新资讯swiper
    new Swiper('.ndl-swiper', {
        pagination: {
            el: ".swiper-pagination",
            clickable:true
        },
        slidesPerView: 1,
        loop: true
    });
    new Swiper('.d-center',{
        pagination: {
            el: ".dc-pagination",
            clickable:true
        },
        navigation: {
            nextEl: ".dc-next",
            prevEl: ".dc-prev",
        },
        slidesPerView: 1,
        loop: true,
        autoplay:true
    });
    // 精选职位空tab隐藏
    {
        for(let i=0;i<$('.r-details').length;i++){
            if(!$('.r-details').eq(i).find('.rd-item')[0]){
                $('.r-details').eq(i).hide();
                $('.r-tabs li').eq(i).hide();
            }
        }
    }
    // 精选职位tab切换
    $('.r-tabs').delegate('li','click',function(){
        $(this).addClass('active').siblings().removeClass();
        let index=$(this).index();
        $('.r-details').eq(index).addClass('active').siblings('.r-details').removeClass('active');
    });
    $().delegate('li','mouseenter',function(){
        $(this).addClass('active').siblings().removeClass();
    });
    // 搜索框聚焦
    $('.t-search input').focus(function () {
        $('.t-search').css({
            'border-color': '#2278FF'
        });
    });
    $('.t-search input').blur(function () {
        $('.t-search').css({
            'border-color': '#E3F0FF'
        });
    });
    $('.t-search img').click(function(){
        $('.t-search').submit();
    });
});