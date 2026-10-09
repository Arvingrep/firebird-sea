$(function(){
    let initialb=true;
    // url信息
    let url=location.search;
    let params = new URLSearchParams(url.slice(1));
    // 滚动隐藏/显示吸顶
    let tHeight=$('.fixTop').height()-$('.fs-address').innerHeight();
    let fHeight=[];
    $('.fs-shell').css({
        'transform':`translateY(-${$('.fs-address').innerHeight()}px)`
    })
    $('.fixTop').css({
        'height':'0px'
    });
    $(window).scroll(function(){
        if($(window).scrollTop()<$('.d-filter').offset().top){ //隐藏
            $('.fixTop').css({
                'height':'0px',
            })
            $('.fixTop').css({
                'overflow':'hidden',
            })
        }else{ //显示
            $('.fixTop').css({
                'height':tHeight+'px',
            })
            
        }
    })
    // 吸顶筛选项显示/隐藏
    $('.fs-filter li').hover(function(){
        let index=$(this).index();
        $(this).find('.fsf-items').show();
        setTimeout(() => {
            $(this).find('.fsf-items').css({
                'box-shadow':'1px 8px 40px 0px rgba(0,15,77,0.08)',
                'height':fHeight[index],
                'padding':'6px 0px',
                'border':'1px solid #EBEEF2'
            });
            $('.fixTop').css({
                'overflow':'visible',
            });
        }, 10);
        if(fHeight[index]>=300){
            $(this).find('.fsf-items').css('overflow-y','auto')
        };
    },function(){
        $(this).find('.fsf-items').css({
            'box-shadow':'none',
            'height':'0px',
            'padding':'0px',
            'border':'0px solid #EBEEF2'
        });
    });
    // 吸顶地址显/隐
    let addrb=false;
    $('.t-addr').click(function(){
        if (!addrb) {
            addrb=true;
            let aHeight = $('.fs-address').innerHeight();
            if ($('.fs-shell').css('transform').indexOf(-aHeight) != -1) {
                $('.fs-shell').css({
                    'transform': 'translateY(0)'
                });
                $('.fixTop').css({
                    'height': tHeight + aHeight + 'px',
                });
                tHeight += aHeight;
            } else {
                $('.fs-shell').css({
                    'transform': `translateY(-${aHeight}px)`
                });
                $('.fixTop').css({
                    'height': tHeight - aHeight + 'px',
                })
                tHeight -= aHeight;
            };
            setTimeout(()=>{ //修复速点bug,勿删。时间等于transition的时间
                addrb=false;
            },200)
        }
    });
    // 吸顶选择地址文本
    $('.t-addr span').text($('.fs-address .active').text());
    // 搜索框聚焦
    $('.t-login input,.t-input input').focus(function(){
        $(this).closest('.t-login').css({
            'border-color':'#2278FF'
        });
        $(this).find('.btn').css({
            'height':'50px'
        });
        $(this).closest('.t-input').css({
            'border-color':'#2278FF'
        });
    });
    $('.t-login input,.t-input input').blur(function(){
        $('.t-login').css({
            'border-color':'#F7F9FC'
        });
        $(this).find('.btn').css({
            'height':'48px'
        });
        $('.t-input').css({
            'border-color':'#F7F9FC'
        })
    });
    // 分页内容修改
    $('.pagination li:eq(0) span, .pagination li:eq(0) a').html('<');
    $('.pagination li:last-child span, .pagination li:last-child a').html('>');
    // 点击搜索
    $('.t-input input,.t-login input').keydown(function(e){
        if(e.keyCode==13){
            $(this).closest('form').submit();
        }
    });
    $('.t-input').find('.image').click(function(){
        $(this).closest('form').submit();
    });
    $('.t-login .btn').click(function(){
        $(this).closest('form').submit();
    });
    // 工作区域筛选
    $('.df-area ul').delegate('li','click',function(){
        let id=$(this).attr('data-addrid')
        replaceFn(['addrid','scroll'],[id,''])
    })
    $('.fs-address').delegate('li','click',function(){
        let id=$(this).attr('data-addrid')
        replaceFn(['addrid','scroll'],[id,1])
    })
    $('.df-welfare').eq(0).find('ul').delegate('li','click',function(){
        let id=$(this).attr('data-id')
        replaceFn(['educational','scroll'],[id?id:'','']);
    });
    // 薪资筛选
    $('.dfs-left ul').delegate('li','click',function(){
        let min=$(this).attr('data-min');
        let max=$(this).attr('data-max');
        let data=['min_salary','max_salary','scroll'];
        let value=[min?min:'',max?max:'',''];
        replaceFn(data,value);
    })
    $('.fsf-items').delegate('.item','click',function(){
        let name=$(this).closest('li')[0].className;
        switch(name){
            case 'salary':{ //薪资
                let min=$(this).attr('data-min');
                let max=$(this).attr('data-max');
                replaceFn(['min_salary','max_salary','scroll'],[min,max,1]);
                break;
            };
            case 'education':{ //学历
                let id=$(this).attr('data-id');
                replaceFn(['educational','scroll'],[id,1]);
                break;
            };
            case 'industry':{ //行业
                let id=$(this).attr('data-id');
                replaceFn(['industry','scroll'],[id,1]);
                break;
            };
            case 'nature':{ //性质
                let id=$(this).attr('data-id');
                replaceFn(['gnature','scroll'],[id,1]);
                break;
            };
            case 'scale':{ //规模
                let id=$(this).attr('data-id');
                replaceFn(['scale','scroll'],[id,1]);
                break;
            };
            default:break;
        }
    })
    $('.fs-filter li .close').on({
        'click':function(){//删除单个筛选条件
            let className=$(this).parent()[0].className;
            switch(className){
                case 'salary':{ //薪资
                    replaceFn(['min_salary','max_salary'],[])
                    break;
                };
                case 'education':{ //学历
                    replaceFn(['educational'],[])
                    break;
                };
                case 'experience':{ //工作经验
                    replaceFn(['experience'],[])
                    break;
                };
                case 'industry':{ //公司行业
                    replaceFn(['industry'],[])
                    break;
                };
                case 'nature':{ //公司性质
                    replaceFn(['gnature'],[])
                    break;
                };
                case 'scale':{ //公司规模
                    replaceFn(['scale'],[])
                    break;
                };
                default:break;
            }
        },
        'mouseenter':function(){ //鼠标移入删除图标
            $(this).attr('src',`${staticPaths}images/closeBlu.png`);
        },
        'mouseleave':function(){ //鼠标移出删除图标
            $(this).attr('src',`${staticPaths}images/closeGra.png`);
        }
    });
    $('.fs-clear span').text(`(${$('.fs-filter li span.active').length+$('.t-login .filter .active,.t-input .active').length+($('.df-area ul .active').index()!=0?1:'')})`);
    $('.dfm-right span').text(`(${$('.fs-filter li span.active').length+$('.t-login .filter .active,.t-input .active').length+($('.df-area ul .active').index()!=0?1:'')})`);
    { //期望薪资文本
        let target = $('.fs-filter .salary .fsf-items .active');
        if(target.text()=='不限'&&target.length!=0){
            target.closest('.salary').find('span').text(target.siblings().eq(0).text())
        }else if(target.length!=0){
            target.closest('.salary').find('span').text(target.text());
        }else{ //自定义搜素的文本
            let min;
            let max;
            if($('.dfs-right .maxSalary').val()>$('.dfs-right .minSalary').val()){
                max=$('.dfs-right .maxSalary').val();
                min=$('.dfs-right .minSalary').val();
            }else{
                max=$('.dfs-right .minSalary').val();
                min=$('.dfs-right .maxSalary').val();
            }
            let text=`${min}-${max}`;
            $('.fs-filter .salary .active').text(text);
        };
    }
    { //公司行业文本
        let target = $('.fs-filter .industry .fsf-items  .active');
        if(target.text()=='不限'){
            target.closest('.industry').find('span').text(target.siblings().eq(0).text())
        }else{
            target.closest('.industry').find('span').text(target.text());
        }
    }
    { //学历要求文本
        let target = $('.fs-filter .education .fsf-items  .active');
        if(target.text()=='不限'){
            target.closest('.education').find('span').text(target.siblings().eq(0).text())
        }else{
            target.closest('.education').find('span').text(target.text());
        }
    }
    // 自定义薪资筛选
    $('.dfs-right').find('.btn').click(function(){
        let min=$('.dfs-right').find('.minSalary').val();
        let max=$('.dfs-right').find('.maxSalary').val();
        let data=['min_salary','max_salary','scroll'];
        let value=[min?min:'',max?max:'',''];
        replaceFn(data,value);
    })
    $('.dfs-right').find('.inputs').keyup(function(){
        if(event.keyCode==13){
            $('.dfs-right').find('.btn').click()[0]
        }
    })
    $('.minSalary,.maxSalary').on({
        'focus':function(){
            $(this).closest('.inputs').css({'border-color':'#409EFF'});
        },
        'blur':function(){
            $(this).closest('.inputs').css('border-color','');
        }
    })
    // 更多筛选
    $('.dfm-left .fItem').delegate('div','click',function(){
        let id=$(this).attr('data-id');
        let className=$(this).parents('.item').attr('class');
        if(className.indexOf('edu')!=-1){ //行业筛选
            replaceFn(['industry','scroll'],[id,'']);
        }else if(className.indexOf('exp')!=-1){ //公司性质
            replaceFn(['gnature','scroll'],[id,'']);
        }else{ //公司规模
            replaceFn(['scale','scroll'],[id,'']);
        }
    })
    // 公司性质筛选
    data={
        service:'job',
        action:'getItem',
        name:'nature'
    };
    ajax(data).then(res=>{
        let id=params.get('gnature');
        let str=`<div>不限性质</div>`;
        let str1=`
            <div style="display: none;">公司性质</div>
            <div class="item ${id?'':'active'}">不限</div>
        `; //吸顶筛序
        let item=res.info.nature;
        for(let i=0;i<item.length;i++){
            str+=`
                <div data-id=${item[i].id} ${id==item[i].id?'style="color:#2278FF"':''}>${item[i].typename}</div>
            `;
            str1+=`
            <div data-id=${item[i].id} class="item ${id==item[i].id?'active':''}">${item[i].typename}</div>
            `;
            if(id==item[i].id){
                $('.dfm-left .exp').find('span').text(item[i].typename);
            };
        }
        $('.dfm-left').find('.exp .fItem').html(str);
        $('.fs-filter li').eq(3).find('.fsf-items').html(str1);
        // 吸顶选中文本
        let target=$('.fs-filter .nature .fsf-items .active');
        if(target.text()=='不限'){
            target.closest('.nature').find('span').text(target.siblings().eq(0).text())
        }else{
            target.closest('.nature').find('span').text(target.text());
        };
        for(let i=0;i<$('.fsf-items').length;i++){
            fHeight[i]=$('.fsf-items').eq(i).height();
        };
    });
    // 公司规模筛选
    data={
        service:'job',
        action:'getItem',
        name:'scale'
    };
    ajax(data).then(res=>{
        let id=params.get('scale');
        let str=`<div>不限规模</div>`;
        let str1=`
            <div style="display: none;">公司规模</div>
            <div class="item ${id?'':'active'}">不限</div>
        `; //吸顶筛序
        let item=res.info.scale;
        for(let i=0;i<item.length;i++){
            str+=`
                <div data-id=${item[i].id} ${id==item[i].id?'style="color:#2278FF"':''}>${item[i].typename}</div>
            `;
            str1+=`
            <div data-id=${item[i].id} class="item ${id==item[i].id?'active':''}">${item[i].typename}</div>
            `
            if(id==item[i].id){
                $('.dfm-left .time').find('span').text(item[i].typename);
            }
        }
        $('.dfm-left').find('.time .fItem').html(str);
        $('.fs-filter li').eq(4).find('.fsf-items').html(str1);
        // 吸顶选中文本
        let target=$('.fs-filter .scale .fsf-items .active');
        if(target.text()=='不限'){
            target.closest('.scale').find('span').text(target.siblings().eq(0).text())
        }else{
            target.closest('.scale').find('span').text(target.text());
        };
        for(let i=0;i<$('.fsf-items').length;i++){
            fHeight[i]=$('.fsf-items').eq(i).height();
        };
    });
    if(params.get('scroll')!=null){//顶部筛选滚动
        $('html,body').animate({
            scrollTop: $('.conList').offset().top-tHeight-14
        }, 0);
    }

    // 分页跳转
    $('.dll-page .btn').click(function(){ //手动点击按钮跳转
        let value=$('.dll-page').find('input').val();
        replaceFn(['page'],[value]);
    });
    $('.dll-page').find('input').keyup(function(){ //输入框回车跳转
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
    // 列表项hover
    let timer;
    $('.cl-items').delegate('li','mouseenter',function(){
        timer=setTimeout(()=>{
            $(this).find('.cli-detail').css({
                'transform':'scaleY(1)'
            })
        },4000)
    });
    $('.cl-items').delegate('li','mouseleave',function(){
        clearTimeout(timer);
        $(this).find('.cli-detail').css({
            'transform':'scaleY(0)'
        })
    });
    // 批量投递样式修改
    $('.cl-tab span').click(function(){
        if(initialb&&cid!=0){
            initialb=false;
            $('.sendpop').show();
            $('.s-company').show();
            return
        };
        if(!userid){ //未登录
            location.href=`${masterDomain}/login.html`;
            return
        }else if(!rid){ //简历id为空，跳走 
            location.href=`${member_userDomain}/job-resume.html`;
            return
        };
        if($(this).text()=='批量投递'){
            $('.cl-tab span').text('取消批量投递');
            $('.clt-fixed').show();
            $('.cl-items .show').show();
            $('.cl-items .active').siblings('.left').find('.title').addClass('gray');
            $('.cl-items').find('.none').hide();
            $('.cl-items').find('.mypost').hide();
            // 分页样式
            $('.topage').hide();
            $('.dll-page').addClass('right');
            $('.cl-items .talk').fadeOut(200);//立即沟通隐藏
            $('.cli-detail').hide();
            $('.cl-items .care .btn').hide();
            $('.cl-items li').addClass('pub');
            $('.footer').hide();
            $('.shell').css({'padding-bottom':'100px'});
            $('.cl-items li a .right .care').css({'height':'16px'});
            $('.inner ul li').addClass('disabled');
            $('.pagination .inner ul').addClass('drop');
        }else{
            $('.cl-tab span').text('批量投递');
            $('.clt-fixed').hide();
            $('.cl-items .show').hide();
            $('.cl-items .active').siblings('.left').find('.title').removeClass('gray');
            $('.cl-items').find('.none').show();
            $('.cl-items').find('.mypost').show();
            // 分页样式
            $('.topage').show();
            $('.dll-page').removeClass('right');
            $('.cl-items .talk').fadeIn(200);//立即沟通显示
            $('.cli-detail').show();
            $('.cl-items .care .btn').show();
            $('.cl-items li').removeClass('pub');
            $('.footer').show();
            $('.shell').css({'padding-bottom':'0px'});
            $('.cl-items li a .right .care').css({'height':'16px'});
            $('.inner ul li').removeClass('disabled');
            $('.pagination .inner ul').removeClass('drop');
        }
    });
    // 全选/取消全选样式
    $('.clt-all .select').click(function(){
        if ($('.clt-all .select div').attr('class')) { //取消全选
            $('.cl-items li a').find('.selected').removeClass('selected').addClass('select');
            $('.clt-all .select div').removeClass();
        } else { //全选
            $('.cl-items li a').find('.select').removeClass('select').addClass('selected');
            $('.clt-all .select div').addClass('selected');
        };
        let number=$('.cl-items li a .selected').length;//选中个数
        $('.clt-all .btn em').text(`(${number})`)
    });
    // 单选
    let timer2;
    let length=$('.cl-items li a').find('.select').length;
    $('.cl-items').delegate('li','click',function(){
        if($('.cl-tab span').eq(1).text()=='取消批量投递'){
            event.preventDefault(); 
            if($(this).find('.select')[0]){ //选中
                $(this).find('.select').removeClass('select').addClass('selected');
            }else if($(this).find('.selected')[0]){ //取消选中
                $(this).find('.selected').removeClass('selected').addClass('select');
            }else{
                $('.reminding').text('已投过该公司，近期不可再投递').show();
                clearTimeout(timer2);
                timer2=setTimeout(()=>{
                    $('.reminding').hide();
                },3000)
            };
            if($('.cl-items li a').find('.selected').length==length){
                $('.clt-all .select div').addClass('selected');
            }else{
                $('.clt-all .select div').removeClass('selected');
            };
            let number=$('.cl-items li a .selected').length;//选中个数
            $('.clt-all .btn em').text(`(${number})`)
        }
    });
    // 批量投递，分页禁跳
    $('.inner ul').mouseenter(function(){
        if($('.cl-tab span').eq(1).text()=='取消批量投递'){
            event.preventDefault(); 
            $('.reminding').text('退出批量操作后可查看').show();
            clearTimeout(timer2);
            timer2=setTimeout(() => {
                $('.reminding').hide();
            }, 3000);
        }
    });
    let rid;//简历id
    let rdetail;//我的简历信息
    let pid;//职位id
    let rstate;//简历投递状态（是否投递）
    let resumeList;//用户所有的简历
    //获取简历
    {
        if (userid) {
            let resume = {
                service: 'job',
                action: 'resumeDetail',
                default: 1
            };
            ajax(resume).then(res => {
                rid = res.info.id;
                rdetail = res.info;
                $('.ss-title p span,.mr-title p span').text(rdetail.alias);//修改投递简历弹窗的标题文本
            });
            let data = {
                service: 'job',
                action: 'resumeList',
                u: 1
            }
            ajax(data).then(res => {
                resumeList = res.info.list;
                let flag=0;
                let str = ``;
                for (let i = 0; i < res.info.list.length; i++) { //添加选项
                    str += `<li ${res.info.list[i].state != 1 || res.info.list[i].need_complete != 1 ? 'class=noSend' : ''} data-id="${res.info.list[i].id}" data-alias="${res.info.list[i].alias}">${res.info.list[i].alias}<span>${res.info.list[i].need_complete != 1? '（未完善，不可使用）' : res.info.list[i].state != 1 ? '（审核中，不可使用）' : ''}</span></li>`
                    if(res.info.list[i].state==1){
                        flag=1;
                    }
                };
                if(flag==0){ //没有可用的简历
                    resumeList=[resumeList[0]];
                }
                $('.mrs-input ul').html(str);
            });
        }
    };
    // 待审核投递
    $('.mr-btn .change').click(function () { //更换简历
        $('.mr-content').hide();
        $('.mr-select').show();
        let height = $('.mrs-input ul').height();//ul的高度
        let show = false;//显隐判断
        $('.mrs-input ul').css({ //高度重置
            'display': 'block',
            'height': '0'
        });
        $('.mrs-input').delegate('input', 'click', function () { //显示/隐藏
            show = !show;
            $('.mrs-input ul').css('height', show ? 0 : height)
        });
    });
    $('.mrs-input ul').delegate('li', 'click', function () { //选择简历
        $('.mrs-input input').click()[0];
        $('.mrs-btn .confirm').addClass('has')
        $(this).addClass('active').siblings().removeClass('active');
        let alias = $(this).attr('data-alias');
        $('.mrs-input input').val(alias);
    });
    $('.mrs-btn').delegate('.confirm.has', 'click', function () {//确认投递
        rid = $('.mrs-input ul .active').attr('data-id');
        let data = {
            service: 'job',
            action: 'delivery',
            pid: pid,
            rid: rid
        };
        ajax(data).then(res => {
            $('.sendpop').show();
            $('.moreResume').hide();
            if (res.state == 100) {
                if (res.info[0].type == 'fail') { //投递失败
                    if (res.info[0].msg.indexOf('已投递过') != -1) {
                        $('.s-had div p').text('已投过该公司，近期不可再投送');
                    } else {
                        $('.s-had div p').text(res.info[0].msg);
                    };
                    $('.s-had').show()
                    clearTimeout(timer2);
                    timer2 = setTimeout(() => {
                        $('.ss-close').click()[0];
                    }, 3000);
                } else {
                    $('.s-same').hide();
                    $(document).one('click', function () {
                        $('.ss-close').click()[0];
                    });
                    if ($('.s-succeed')[0]) { //无app
                        $('.s-succeed').show();
                        setTimeout(function () {
                            $('.ss-close').click()[0];
                        }, 3000)
                    } else {//有app
                        $('.s-appsucceed').show();
                    }
                }
            } else {
                if (res.info.indexOf('待审核') != -1) {
                    $('.s-had div p').text('您的简历正在审核中，请稍后再试');
                } else {
                    $('.s-had div p').text(res.info);
                };
                $('.s-had').show()
                clearTimeout(timer2);
                timer2 = setTimeout(() => {
                    $('.ss-close').click()[0];
                }, 3000);
            };
        });
    });
    $('.mr-close,.mr-btn .close,.mrs-btn .cancel').click(function () { //关闭弹窗
        $('.mr-content').css({ 'animation': 'bottomFadeOut .3s' });
        $('.mr-select').css({ 'animation': 'bottomFadeOut .3s' });
        setTimeout(() => {
            $('.moreResume').hide();
            $('.mr-content').css({ 'animation': 'topFadeIn .3s' });
            $('.mr-select').css({ 'animation': 'topFadeIn .3s' });
        }, 280);
    });
    // 批量投递按钮
    $('.clt-all .btn').click(function(){
        let item=$('.cl-items li a').find('.selected');
        let postCertificate=false;
        for(let i=0;i<item.length;i++){ //职位中是否有需要实名认证的
            if(item.eq(i).attr('data-certificate')==1){
                postCertificate=true;
                break
            }
        };
        if(!userid){ //未登录
            location.href=`${masterDomain}/login.html`
        }else if(rdetail.certifyState==0&&postCertificate==1){ //已登录，没有认证
            $('.sendpop').show();
            $('.s-certificate').show();
        }else if(!rid) { //已登录，认证，但是没有简历
            location.href=`${member_userDomain}/job-resume.html`
        }else if(rdetail.state==0){ //已登录，认证，有简历，但是没审核没过
            if(resumeList.length>1){ //多个简历
                $('.moreResume').show();
            }else{
                $('.sendpop').show();
                $('.s-had div p').text('您的简历正在审核中，请稍后再试');
                $('.s-had').show();
                clearTimeout(timer2);
                timer2=setTimeout(() => {
                    $('.ss-close').click()[0];
                }, 3000);
            };
        }else{ //允许投递
            let arr=[];
            for(let i=0;i<item.length;i++){
                arr.push(item.eq(i).attr('data-id'));
            };
            let id=arr.join(',');
            let data={
                service:'job',
                action:'delivery',
                pid:id,
                rid:rid
            };
            ajax(data).then(res => {
                if (res.state == 100) {
                    $('.sendpop').show();
                    if(res.info[0].type=='fail'){ //投递失败
                        $('.s-same').hide();
                        $('.s-had div p').text(res.info[0].msg);
                        $('.s-had').show()
                        clearTimeout(timer2);
                        timer2=setTimeout(() => {
                            $('.ss-close').click()[0];
                        }, 3000);
                    }else{
                        $('.cl-tab span').eq(0).click()[0];
                        if ($('.s-succeed')[0]) { //无app
                            $('.s-succeed').show();
                            setTimeout(function () {
                                $('.sa-close').click()[0];
                            }, 3000)
                        } else {//有app
                            $('.s-appsucceed').show();
                        }
                    }
                }else{
                    if(res.info.indexOf('待审核')!=-1){
                        $('.s-had div p').text('您的简历正在审核中，请稍后再试');
                    }else{
                        $('.s-had div p').text(res.info);
                    };
                    $('.s-had').show()
                    clearTimeout(timer2);
                    timer2=setTimeout(() => {
                        $('.ss-close').click()[0];
                    }, 3000);
                };
            });
        };
    });
    // 无数据隐藏批量投递
    if($('.cl-none')[0]){
        $('.cl-tab span').hide();
    }
    // 智能排序和最新发布
    $('.clt-sort div').click(function(){
        let orderby=$(this).attr('data-sort');
        replaceFn(['orderby'],[orderby])
    })
    // 收藏按钮
    $('.cl-items .care .star').click(function(){
        event.preventDefault();
        event.stopPropagation();
        let data={
            service:'member',
            action:'collect',
            module:'job',
            temp:'job',
            id:$(this).attr('data-id'),
        };
        if (userid) { //已登录
            if ($(this).attr('class').indexOf('has') == -1) { //收藏
                data.type = 'add';
                ajax(data).then(res => {
                    $(this).addClass('has');
                    $(this).text('已收藏');
                });
            } else { //取消收藏
                data.type = 'del';
                ajax(data).then(res => {
                    $(this).removeClass('has');
                    $(this).text('收藏')
                });
            };
        } else { //未登录
            location.href=`${masterDomain}/login.html`
        }
    })
    // 投递简历按钮
    $('.cl-items .care .btn').click(function(){
        event.preventDefault();//禁跳
        let joid;
        if(rdetail){
            joid=rdetail.job;//我简历中期望的职位类型
        };
        let companyId=$(this).attr('data-cid');
        let seljobid=Number($(this).attr('data-type'));//要投递职位的类型id
        let typename=$(this).attr('data-name');
        rstate=$(this).attr('data-state');//投递状态（是否投递）
        pid=$(this).attr('data-id');
        let postCertificate=$(this).attr('data-certificate');
        if(!userid){ //未登录
            location.href=`${masterDomain}/login.html`
            return
        } else if (initialb && cid!=0) {
            initialb = false;
            $('.sendpop').show();
            $('.s-company').show();
            return
        }else if(rdetail.certifyState==0&&postCertificate==1){ //已登录，没有认证
            $('.sendpop').show();
            $('.s-certificate').show();
            return
        } else if (!rid) { //已登录，认证，但是没有简历
            location.href = `${member_userDomain}/job-resume.html`
            return
        } else if (rdetail.state == 0) { //已登录，认证，有简历，但是没审核没过
            if (resumeList.length > 1) { //多个简历
                $('.moreResume').show();
            } else {
                $('.sendpop').show();
                $('.s-had div p').text('您的简历正在审核中，请稍后再试');
                $('.s-had').show();
                clearTimeout(timer2);
                timer2 = setTimeout(() => {
                    $('.ss-close').click()[0];
                }, 3000);
            };
            return
        } else if (companyId == cid) { //职位是自己公司发布的
            $('.s-had div p').text('不可投递自己发布的职位');
            $('.sendpop').show();
            $('.s-had').show();
            setTimeout(() => {
                $('.ss-close').click()[0];
            }, 3000);
            return
        };
        if ($(this).attr('data-hdc') == 1) { //允许投递
            $('.sendpop').show();
            $('.s-had div p').text('已投递过该公司，近期不可再投递');
            $('.s-had').show();
            clearTimeout(timer2);
            timer2 = setTimeout(() => {
                $('.ss-close').click()[0];
            }, 3000);
        } else { //允许投递
            $('.sendpop').show();
            $('.s-same').show();
            $('.ss-text').find('span').text(typename);
            if (joid.indexOf(seljobid) != -1) { //投递的职位是我期望的
                $('.s-same').addClass('no');
            } else {
                $('.s-same').removeClass('no');
            };
        };
    });
    // 关闭投递弹窗
    $('.ss-close,.sa-close').click(function(){
        $('.sendpop').children().css({'animation':'bottomFadeOut .3s'});      
        setTimeout(() => {
            $('.sendpop').hide();
            $('.sendpop').children().hide();
            $('.sendpop').children().css({'animation':'topFadeIn .3s'});  
        }, 280);
    });
    // 投递弹窗的取消和确认按钮
    $('.ss-btn div').click(function(){
        let state=$(this).attr('data-state');
        let data={
            service:'job',
            action:'delivery',
            pid:pid,
            rid:rid
        };
        if (state == 0) { //取消
            $('.ss-close').click()[0];
        } else { //确认
            if (rstate == 0) { //未投递
                ajax(data).then(res => {
                    if (res.state == 100) {
                        if(res.info[0].type=='fail'){ //投递失败
                            $('.s-same').hide();
                            $('.s-had div p').text(res.info[0].msg);
                            $('.s-had').show()
                            clearTimeout(timer2);
                            timer2=setTimeout(() => {
                                $('.ss-close').click()[0];
                            }, 3000);
                        }else{
                            $('.s-same').hide();
                            $(document).one('click',function(){
                                $('.ss-close').click()[0];
                            });
                            if ($('.s-succeed')[0]) { //无app
                                $('.s-succeed').show();
                                setTimeout(function () {
                                    $('.ss-close').click()[0];
                                }, 3000)
                            } else {//有app
                                $('.s-appsucceed').show();
                            }
                        }
                    }else{
                        $('.s-same').hide();
                        if(res.info.indexOf('待审核')!=-1){
                            $('.s-had div p').text('您的简历正在审核中，请稍后再试');
                        }else{
                            $('.s-had div p').text(res.info);
                        };
                        $('.s-had').show()
                        clearTimeout(timer2);
                        timer2=setTimeout(() => {
                            $('.ss-close').click()[0];
                        }, 3000);
                    };
                });
            } else { //已投递
                $('.s-had').show();
                clearTimeout(timer2);
                timer2=setTimeout(() => {
                    $('.ss-close').click()[0];
                }, 3000);
            }
        }
    });
    // 浏览历史列表为空，隐藏
    if(!$('.dlr-history .item')[0]){
        $('.dlr-history').hide();
    };
    // 职位类型弹窗筛选-------
    if($('.jps-con .item div .activeitem')[0]){ //渲染时已经选择了职位类型
        popinitial();
    }
    $('.jp-select ul').delegate('li','click',function(){
        $(this).addClass('active').siblings().removeClass();
    });
    $('.t-login .filter,.t-input div').click(function(){ //弹出
        $('.jobtype').css({'display':'flex'});
        $('html,body').css({'overflow':'hidden'});
    });
    $('.jp-top img,.jobtype').click(function(){ //关闭弹窗
        $('.j-pop').css({ 'animation': 'bottomFadeOut .3s' });
        setTimeout(() => {
            $('.jobtype').hide();
            $('.j-pop').css({ 'animation': 'topFadeIn .3s' });
            $('html,body').css({ 'overflow': 'overlay' });
            if (params.get('type')) {
                // 重置
                $('.jp-select ul .active a').removeClass('activeitem');
                popinitial();
            } else {
                $('.jps-con .item div a').removeClass();
                $('.jpb-btn .text').hide();
                $('.jpb-btn .confirm').removeClass('had');
                $('.jpb-btn').css('justify-content', 'flex-end');
            }
        }, 280);
    });
    $('.jps-con .item div').delegate('a','click',function(){ //内容选择
        event.stopPropagation();
        $('.jp-select ul li').removeClass('actives'); //清除其他职位类别选中样式
        $('.jps-con a').removeClass('activeitem');//清除其他选中样式
        $(this).addClass('activeitem');
        $('.jpb-btn .confirm').addClass('had');
        $('.jbp-warn').hide();//隐藏提示
        $('.jpb-btn .text').css({'display':'flex'});
        let text=$(this).text();
        $('.jpb-btn .text div').text(text);
        $('.jpb-btn').css({'justify-content':'space-between'});
    });
    $('.jpb-btn .confirm').click(function(){ //确定
        event.stopPropagation();
        if(!$('.jps-con .activeitem')[0]){ //没有选择
            $('.jbp-warn').css({'display':'flex'});
        }else{ //选择了
            let id=$('.jps-con .item div .activeitem').attr('data-id');
            $('.jobtype').hide();
            $('html,body').css({'overflow':'overlay'});
            replaceFn(['type'],[id]);
        }
    });
    $('.jpb-btn .cancel').click(function(){ //重置
        event.stopPropagation();
        if(params.get('type')){
            replaceFn(['type'],[]);
        }else{
            $('.jp-top img,.jobtype').click()[0]
        }
    });
    // 立即沟通按钮
    $('.cl-items li a .left .title').delegate('.talk', 'click', function () {
        event.preventDefault();
        let item = JSON.parse($(this).attr('data-item'));
        imconfig = {
            'mod': 'job',
            'chatid': `${item.companyDetail.userid}`, //职位发布者id
            'title': `${item.title}`, //职位标题
            'description': '',
            "salary": `${item.show_salary}${item.dy_salary > 12 ? `·${item.dy_salary}薪` : ''}`,
            "imgUrl": `${item.companyDetail.logo}`,
            "link": `${channelDomain}/job-${item.id}.html`, //详情id
        };
    });
})
// href的data参数替换并跳转(支持多个参数替换跳转,多用于筛选)
// datas是要替换的参数名,val是要替换的值（均为数组且参数要与值对应）
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
}
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
}
function popinitial(){
    if($('.initial')[0]){
        $('.jps-con .item div .initial').addClass('activeitem').siblings().removeClass();
    }else{
        $('.jps-con .item div .activeitem').addClass('initial');
    };
    $('.jpb-btn .confirm').addClass('had');
    $('.jpb-btn .text').css({'display':'flex'});
    let text=$('.jps-con .item div .activeitem').text();
    $('.jpb-btn .text div').text(text);
    $('.jpb-btn').css({'justify-content':'space-between'});
    $('.t-login .filter span').text(text);
    $('.t-login .filter span').addClass('active');
    $('.t-input div em').text(text);
    text=$('.jps-con .item div .activeitem').closest('li').find('span').text();
    $('.jps-con .item div .activeitem').closest('li').addClass('actives');
}