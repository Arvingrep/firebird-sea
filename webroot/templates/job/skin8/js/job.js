$(function(){
    let initialb=true;
    // 吸顶头部显示/隐藏
    let tHeight=$('.fixTop').height();
    $('.fixTop').css({
        'height':'0px'
    })
    $(window).scroll(function(){
        if($(window).scrollTop()<$('.conDetail').offset().top){//隐藏
            $('.fixTop').css({
                'height':'0px'
            })
        }else{//显示
            $('.fixTop').css({
                'height':tHeight
            })
        }
    })
    // 收藏
    $('.jrb-care').click(function(){
        let bool=$(this).attr('class').indexOf('have');
        let data={
            service:'member',
            action:'collect',
            module:'job',
            temp:'job',
            id:$(this).attr('data-id'),
        };
        if (userid) { //已登录
            if (bool != -1) { //未收藏
                data.type = 'add';
                ajax(data).then(res => {
                    $(this).removeClass('have').addClass('had');
                    $(this).text('已收藏');
                });
            } else {//已收藏
                data.type = 'del';
                ajax(data).then(res => {
                    $(this).removeClass('had').addClass('have');
                    $(this).text('收藏');
                });
            }
        } else { //未登录
            location.href=`${masterDomain}/login.html`
        }
    })

    $('.wxQr img').attr('src', shareQr);

    let rid;//简历id
    let rdetail;//我的简历信息
    let pid;//职位id
    let rstate;//简历投递状态（是否投递）
    let timer2;
    let rlength;
    //获取简历id
    {
        let resume={
            service:'job',
            action:'resumeDetail',
            default:1
        };
        let resumelist={
            service:'job',
            action:'resumeList',
            u:1
        };
        ajax(resumelist).then(res=>{
            rlength;
            if(res.state==100){
                rlength=res.info.list.length;
                let flag=0;
                let str=``;
                for(let i=0;i<res.info.list.length;i++){ //添加选项
                    str+=`<li ${res.info.list[i].state!=1||res.info.list[i].need_complete != 1?'class=noSend':''} data-id="${res.info.list[i].id}" data-alias="${res.info.list[i].alias}">${res.info.list[i].alias}<span>${res.info.list[i].need_complete != 1?'（未完善，不可使用）':res.info.list[i].state!=1?'（审核中，不可使用）':''}</span></li>`
                    if(res.info.list[i].state==1){
                        flag=1;
                    }
                };
                if(flag==0){ //没有可用的简历
                    rlength=1;
                }
                $('.mrs-input ul').html(str);
            };
            ajax(resume).then(res=>{
                rid=res.info.id;
                rdetail=res.info;
                $('.ss-title p span,.mr-title p span').text(rlength==1?'简历':rdetail.alias);//修改投递简历弹窗的标题文本
            });
        })
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
    // 投递简历按钮
    $('.jrb-apply,.fs-btn').click(function () {
        event.preventDefault();//禁跳
        if(ucid==pcid){ //职位是自己发布的
            return
        };
        let joid=rdetail.job;//我简历中期望的职位类型
        let seljobid=Number($(this).attr('data-type'));//要投递职位的类型id
        let typename=$(this).attr('data-name');
        rstate=$(this).attr('data-state');//投递状态（是否投递）
        pid=$(this).attr('data-id');
        if(!userid){ //未登录
            location.href=`${masterDomain}/login.html`
        } else if (initialb && ucid!=0) { //企业身份投递
            initialb = false;
            $('.sendpop').show();
            $('.s-company').show();
            return
        }else if(rdetail.certifyState==0&&postCertificate==1){ //已登录，没有认证
            $('.sendpop').show();
            $('.s-certificate').show();
        }else if(!rid) { //已登录，认证，但是没有简历
            location.href=`${member_userDomain}/job-resume.html`
        }else if(rdetail.state==0){ //已登录，认证，有简历，但是没审核没过
            if(rlength>1){ //多个简历
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
            $('.sendpop').show();
            $('.s-same').show();
            $('.ss-text').find('span').text(typename);
            if(joid.indexOf(seljobid)!=-1){ //投递的职位是我期望的
                $('.s-same').addClass('no');
            }else{
                $('.s-same').removeClass('no');
            };
        };
    });
    // 关闭投递弹窗
    $('.ss-close,.sa-close').click(function () {
        let className=$(this).attr('class')
        $('.sendpop').children().css({'animation':'bottomFadeOut .3s'});      
        setTimeout(() => {
            $('.sendpop').hide();
            $('.sendpop').children().hide();
            $('.sendpop').children().css({'animation':'topFadeIn .3s'});  
        }, 280);
        if(className=='sa-close'){
            location.reload();
        }
    });
    // 投递弹窗的取消和确认按钮
    $('.ss-btn div').click(function () {
        let state = $(this).attr('data-state');
        let data = {
            service: 'job',
            action: 'delivery',
            pid: pid,
            rid: rid
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
                timer2 = setTimeout(() => {
                    $('.s-had').hide();
                }, 3000);
            }
        }
    });
    // 举报
    $(".jr-top .report,.cld-complain span a").bind("click", function () {
        $.dialog({
            fixed: true,
            title: "信息举报",
            content: 'url:' + masterDomain + '/complain-job-detail-' + id + '.html',
            width: 460,
            height: 300
        });
    });
    // 公司行业小字
    $('.crc-label li span').attr('title',$('.crc-label li span').text());
    // 感兴趣空（隐藏）
    if(!$('.i-list li')[0]){
        $('.interest').hide();
    };
    // 地图
    let maptimer;
    let mapurl=OpenMap_URL;
    $('.cld-address .text').attr('href',mapurl);
    


    drawMap();

    function drawMap(){
        if(site_map == 'baidu'){
            drawMap_baidu()
        }else if(site_map == 'amap'){
            drawMap_amap()
        }else if(site_map == 'tmap'){
            drawMap_tmap()
        }else if(site_map == 'google'){
            drawMap_google()
        }
    }

    function drawMap_baidu(){
        let map = new BMap.Map('map'); // 创建Map实例
        map.enableScrollWheelZoom(true);//开启鼠标滚轮缩放
        let point = new BMap.Point(Number(pageData.lng), Number(pageData.lat));  // 创建点坐标 
        map.centerAndZoom(point, 15); // 初始化地图，设置中心点坐标和地图级别
        let bLabel = new BMap.Label(`<div class="markerBox"><a class="address" href="${mapurl}" target="_blank"><span>${pageData.address}</span></a><div class="marker_customn"></div></div>`, {
            position: point,
            offset: new BMap.Size(-10, -10)
        });
        map.addEventListener('dragstart',function(){
            clearTimeout(maptimer);
            $('.markerBox .address').css({'transform':'scale(0)'});
        });
        map.addEventListener('dragend',function(){
            $('.markerBox .address').css('transform','');
            maptimer=setTimeout(() => { //归位
                $('.markerBox .address').css({'transform':'scale(0)'});
                setTimeout(res=>{ //地址动画
                    map.centerAndZoom(point, 15); // 初始化地图，设置中心点坐标和地图级别
                    $('.markerBox .address').css('transform','');
                },50)
            }, 5000);
        });
        var firstb=true;
        map.addEventListener('zoomend',function(){
            $('.markerBox .address').css({'transform':'scale(0)'});
            setTimeout(() => {
                $('.markerBox .address').css('transform','');
            }, 200);
            //归位
            clearTimeout(maptimer);
            maptimer = setTimeout(() => {
                if (firstb) {
                    firstb=false;
                    $('.markerBox .address').css({ 'transform': 'scale(0)' });
                    setTimeout(res => { //地址动画
                        map.centerAndZoom(point, 15); // 初始化地图，设置中心点坐标和地图级别
                        $('.markerBox .address').css('transform', '');
                    }, 50);
                }
            }, 5000);
        });
        map.addOverlay(bLabel);
    }

    function drawMap_amap(){
        let map = new AMap.Map("map", {
            viewMode: '2D', //默认使用 2D 模式
            zoom: 14, //地图级别
            center: [Number(pageData.lng), Number(pageData.lat)], //地图中心点
        });

         // 构造点标记
        let marker = new AMap.Marker({
            content: `<div class="markerBox"><a class="address" href="${mapurl}" target="_blank"><span>${pageData.address}</span></a><div class="marker_customn"></div></div>`,
            offset: [-10,-10],
            position: [+Number(pageData.lng), +Number(pageData.lat)],
            map:map,
            draggable:false, //是否可拖拽
        });
        map.setFitView(marker);
        // map.on("zoomchange", function (e) {
        //     map.add(marker)
        // });
    }

    // 天地图
    function drawMap_tmap(){
        let map = new T.Map('map',{ projection: 'EPSG:4326'});
        let center = new T.LngLat(+Number(pageData.lng), +Number(pageData.lat))
            map.centerAndZoom(center, 14);

            var label = new T.Label({
                text: `<div class="markerBox"><a class="address" href="${mapurl}" target="_blank"><span>${pageData.address}</span></a><div class="marker_customn"></div></div>`,
                position: center,
                offset: new T.Point(-10, -10)
            });
            //创建地图文本对象
            map.addOverLay(label);
    }

    // 谷歌地图
    async function drawMap_google(){
        const { Map } = await google.maps.importLibrary("maps");
        map = new Map(document.getElementById("map"), {
            center: { lat: +Number(pageData.lat), lng: +Number(pageData.lng) },
            zoom: 14,
            disableDefaultUI:true
        });
        var marker_posi = new google.maps.LatLng(Number(Number(pageData.lat)),Number(Number(pageData.lng)));
        var marker  = new MarkerWithLabel({
            position: marker_posi,
            draggable: false,
            map: map,
            labelAnchor: new google.maps.Point(120, 30),
            labelContent: `<div class="markerBox googleMarker"><a class="address" href="${mapurl}" target="_blank"><span>${pageData.address}</span></a><div class="marker_customn"></div></div>`,
            icon:'/static/images/blank.gif',
            
        });
    }

})
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