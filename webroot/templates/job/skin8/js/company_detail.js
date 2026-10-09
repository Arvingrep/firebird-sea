new Vue({
    el: '#page',
    data: {
        fixedtop: false,
        currOn: 0, //当前所在tab
        stop: false,
        totalPage: Number(page),
        posterData: '',
        posterId: [],
        posterType: 'post', //post表示职位类型，company表示公司类型
        loadurl: '',
        bool: false,
        posterb: false,
        warnb: false,
        jobtype: [],//渲染职位
        alljobtype: [],//全部展开职位
        partjobtype: [],//部分职位
        jobtypeIndex: []
    },
    mounted() {
        var initialb = true;
        var timer;//延时定时器
        // 图片滚动
        var tt = this;
        var swiper = new Swiper(".thumb-swiper", {
            spaceBetween: 5,
            slidesPerView: 4,
            freeMode: true,
            watchSlidesProgress: true,
            direction: 'vertical',
            navigation: {
                nextEl: '.button-next',
                prevEl: '.button-prev',
            },
        });
        var swiper2 = new Swiper(".left_swiper .img-swiper ", {
            loop: true,
            navigation: {
                nextEl: '.button-next',
                prevEl: '.button-prev',
            },
            thumbs: {
                swiper: swiper,
            },
        });

        $(window).scroll(function () {
            if ($('.companyInfoBox.fn-clear').offset().top <= $(this).scrollTop() && !tt.fixedtop) {
                tt.fixedtop = true
            } else if (tt.fixedtop && $('.companyInfoBox.fn-clear').offset().top > $(this).scrollTop()) {
                tt.fixedtop = false
            }

            if (!tt.stop) {

                if ($(".company_post").offset().top < ($(this).scrollTop() + 250) && tt.currOn != 1) {
                    tt.currOn = 1
                } else if ($(".company_post").offset().top >= ($(this).scrollTop() + 250) && tt.currOn == 1) {
                    tt.currOn = 0
                }
            }
        });
        $('.appMapImg').attr('src', typeof MapImg_URL != "undefined" ? MapImg_URL : "");
        if (OpenMap_URL) {
            $('.mapbox a.to_map').attr('href', OpenMap_URL)
        }
        // 展开更多
        $('.btn_open').click(function () {
            $('.text_con').css({
                'max-height': 'none'
            });
            $('.btn_open').hide()
        })
        if ($('.text_con').height() < 320) {
            $('.btn_open').hide()
        }
        // 关注/取关
        $('.info_right.fn-right').find('.btn_care').click(function () {
            let className = $('.btn_care').attr('class');
            let data = {
                service: 'member',
                action: 'collect',
                module: 'job',
                temp: 'company',
                id: $(this).attr('data-id'),
            };
            if (userid) { //已登录
                if (className.indexOf('has_care') == -1) { //未关注
                    data.type = 'add';
                    tt.ajax(data).then(res => {
                        $('.btn_care').addClass('has_care');
                        $('.btn_care').find('span').text('已关注');
                    })
                } else { //取关
                    data.type = 'del';
                    tt.ajax(data).then(res => {
                        $('.btn_care').removeClass('has_care');
                        $('.btn_care').find('span').text('关注');
                    })
                }
            } else { //未登录
                location.href = `${masterDomain}/login.html`
            }
        });
        // 职位筛选
        $('.inline_div span').click(function () {
            $(this).addClass('on').siblings().removeClass();
            tt.filterFn(1);
        })
        // 翻页
        $('.el-pager').delegate('li', 'click', function () {
            let page = $('.el-pager .active').text();
            tt.filterFn(page);
        })
        $('.btn-prev,.btn-next').click(function () {
            let page = $('.el-pager .active').text();
            tt.filterFn(page);
        })
        let rid;//简历id
        let rdetail;//我的简历信息
        let pid;//职位id
        let rstate;//简历投递状态（是否投递）
        let timer2;
        let rlength;
        //获取简历id
        {
            let resume = {
                service: 'job',
                action: 'resumeDetail',
                default: 1
            };
            let resumelist = {
                service: 'job',
                action: 'resumeList',
                u: 1
            };
            tt.ajax(resumelist).then(res => {
                rlength;
                if (res.state == 100) {
                    rlength = res.info.list.length;
                    let flag = 0;
                    let str = ``;
                    for (let i = 0; i < res.info.list.length; i++) { //添加选项
                        str += `<li ${res.info.list[i].state != 1 || res.info.list[i].need_complete != 1 ? 'class=noSend' : ''} data-id="${res.info.list[i].id}" data-alias="${res.info.list[i].alias}">${res.info.list[i].alias}<span>${res.info.list[i].need_complete != 1 ? '（未完善，不可使用）' : res.info.list[i].state != 1 ? '（审核中，不可使用）' : ''}</span></li>`
                        if (res.info.list[i].state == 1) {
                            flag = 1;
                        }
                    };
                    if (flag == 0) { //没有可用的简历
                        rlength = 1;
                    }
                    $('.mrs-input ul').html(str);
                };
                tt.ajax(resume).then(res => {
                    rid = res.info.id;
                    rdetail = res.info;
                    $('.ss-title p span,.mr-title p span').text(rlength == 1 ? '简历' : rdetail.alias);//修改投递简历弹窗的标题文本
                });
            })
        }
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
            tt.ajax(data).then(res => {
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
        $('.clh-items li .right .btn .pub').click(function () {
            event.preventDefault();//禁跳
            console.log(333);
            let joid = rdetail.job;//我简历中期望的职位类型
            let seljobid = Number($(this).attr('data-type'));//要投递职位的类型id
            let typename = $(this).attr('data-name');
            rstate = $(this).attr('data-state');//投递状态（是否投递）
            pid = $(this).attr('data-id');
            if (!userid) { //未登录
                location.href = `${masterDomain}/login.html`
            } else if (initialb && ucid!=0) { //企业身份投递
                initialb = false;
                $('.sendpop').show();
                $('.s-company').show();
                return
            } else if (!rid) { //已登录，没有简历
                location.href = `${member_userDomain}/job-resume.html`
            } else if (rdetail.certifyState == 0 && postCertificate == 1) { //已登录，有简历，没有认证
                $('.sendpop').show();
                $('.s-certificate').show();
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
            } else{//已登录，认证，有简历，但是审核已过
                $('.sendpop').show();
                $('.s-same').show();
                $('.ss-text').find('span').text(typename);
                if (joid.indexOf(seljobid) != -1) { //投递的职位是我期望的
                    $('.s-same').addClass('no');
                } else {
                    $('.s-same').removeClass('no');
                };
            }
        });
        // 关闭投递弹窗
        $('.ss-close,.sa-close').click(function () {
            $('.sendpop').children().css({ 'animation': 'bottomFadeOut .3s' });
            setTimeout(() => {
                $('.sendpop').hide();
                $('.sendpop').children().hide();
                $('.sendpop').children().css({ 'animation': 'topFadeIn .3s' });
            }, 280);
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
                    tt.ajax(data).then(res => {
                        if (res.state == 100) {
                            if (res.info[0].type == 'fail') { //投递失败
                                $('.s-same').hide();
                                $('.s-had div p').text(res.info[0].msg);
                                $('.s-had').show()
                                clearTimeout(timer2);
                                timer2 = setTimeout(() => {
                                    $('.ss-close').click()[0];
                                }, 3000);
                            } else {
                                $('.s-same').hide();
                                if ($('.s-succeed')[0]) { //无app
                                    $('.s-succeed').show();
                                    setTimeout(function () {
                                        $('.ss-close').click()[0];
                                    }, 3000)
                                } else {//有app
                                    $('.s-appsucceed').show();
                                }
                            }
                        };
                    });
                } else { //已投递
                    $('.s-had').show();
                    clearTimeout(timer2);
                    timer2 = setTimeout(() => {
                        $('.ss-close').click()[0];
                    }, 3000);
                }
            }
        });
        // 立即沟通
        $('.clh-items li .left .title').delegate('div', 'click', function () {
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

        // 海报职位选择
        $('.pp-steps .step1 ul').delegate('li', 'click', function () {
            event.stopPropagation();
            let className = $(this).attr('class');
            let id = Number($(this).attr('data-id'));
            let indexs = $(this).attr('data-index');
            let length = tt.partjobtype.length; //折叠起来之后渲染的职位类型的长度
            if (tt.posterId.length == 8 && !tt.warnb) {//8职位弹窗提示
                $('.p-warning').fadeIn(200);
                clearTimeout(timer);
                timer = setTimeout(function () {
                    $('.p-warning').fadeOut(200);
                }, 3000);
                tt.warnb = true;
                return;
            }
            // 样式切换
            if (!className) {
                tt.posterId.push(id);
                if (indexs > length - 1) { //保存折叠起来职位的下标
                    tt.jobtypeIndex.push(indexs);
                }
            } else if (className != 'unfold' && className != 'fold') {
                let index = tt.posterId.indexOf(id);
                tt.posterId.splice(index, 1);
                if (indexs > length - 1) {
                    index = tt.jobtypeIndex.indexOf(indexs); //从下标数组删除下标
                    tt.jobtypeIndex.splice(index, 1);
                }
            };
            if (tt.jobtypeIndex.length == 0 && tt.jobtype.length > length) { //折叠职位下标数组为空且在展开状态下，隐藏‘收起职位’按钮，反之显示
                $('.fold').fadeIn(200);
            } else {
                $('.fold').fadeOut(200);
            }
            // 海报类型
            if (tt.posterId.length == 0) { //没选择职位
                $('.pp-steps .step2').fadeOut(200);
            } else if (tt.posterId.length == 1) { //单职位
                $('.pp-steps .step2').fadeIn(200);
                tt.posterType = 'post';
            } else { //多职位
                tt.posterType = 'company';
            };
        });
        // 拖拽
        this.dragFn('.pp-drag', '.p-produce');
        // 收藏按钮
        $('.clh-items li .right .btn .collect').click(function () {
            event.preventDefault();
            event.stopPropagation();
            let data = {
                service: 'member',
                action: 'collect',
                module: 'job',
                temp: 'job',
                id: $(this).attr('data-id'),
            };
            if (userid) { //已登录
                if ($(this).attr('class').indexOf('has') == -1) { //收藏
                    data.type = 'add';
                    tt.ajax(data).then(res => {
                        $(this).addClass('has');
                        $(this).text('已收藏');
                    });
                } else { //取消收藏
                    data.type = 'del';
                    tt.ajax(data).then(res => {
                        $(this).removeClass('has');
                        $(this).text('收藏');
                    });
                };
            } else { //未登录
                location.href = `${masterDomain}/login.html`
            }
        });
        // 从别的页面跳转过来且需要滚动时
        if (location.search.indexOf('scroll') != -1) {
            this.tabChange(1);
        };
        // 地图
        // let test = 'http://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/article/thumb/large/2023/02/16/16765424666262.png';
        init_URL = MapImg_URL.indexOf('markerStyles') > -1 ? MapImg_URL.slice(0, MapImg_URL.indexOf('&markerStyles')) : MapImg_URL;
        init_URL = init_URL.replace('width=300&height=130&zoom=13', 'width=248&height=170&zoom=17');
        var map_scale = init_URL.indexOf('baidu') > 0 ? 2 : 1;
        MapImg_URL = init_URL.indexOf('tianditu') == -1 ? `${init_URL}&markerStyles=-1,${templets_skin}images/position_blue_circle.png&scale=${map_scale}` : init_URL;
        $('.appMapImg').attr('src', typeof MapImg_URL != "undefined" ? MapImg_URL : "");
        $('.appMapBtn').attr('href', OpenMap_URL);
    },
    methods: {
        tabChange(tab) {
            const tt = this;
            tt.currOn = tab;
            tt.stop = true;
            if (tab == 1) {
                $('html, body').animate({
                    scrollTop: $('.conDl.company_post').offset().top - $('.fixedTop').height()
                }, 500);
            } else {
                $('html, body').animate({
                    scrollTop: 0
                }, 500);
            }
            setTimeout(() => {
                tt.stop = false;

            }, 1000);

        },
        ajax(data) {
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
        },
        filterFn(page) {
            let data = {
                service: "job",
                action: "postList",
                page: page,
                pageSize: 15,
                company: $('.nobg').attr('data-id'),
                addrid: $('.shaixuanBox .area .on').attr('data-addr'),
                type: $('.shaixuanBox .jobs .on').attr('data-job')
            };
            let str = ''
            this.ajax(data).then(res => {
                let data = res.info.list;
                if (data.length == 0) { //分页
                    $('.el-pagination').hide();
                } else {

                    $('.el-pagination').show();
                    this.totalPage = Number(res.info.pageInfo.totalCount);
                };
                for (let i = 0; i < data.length; i++) {
                    let str1 = '';
                    //地址
                    if (data[i].job_addr_detail) {
                        for (let j = 0; j < data[i].job_addr_detail.addrName.length; j++) {
                            str1 += `${data[i].job_addr_detail.addrName[j]} `
                        }
                    }
                    let str2 = '';
                    //标签项
                    if (data[i].tag) {
                        for (let j = 0; j < data[i].tag.length; j++) {
                            str2 += `<div>${data[i].tag[j]}</div>`
                        }
                    };
                    let salary;
                    if (data[i].mianyi) {
                        salary = `面议`
                    } else {
                        salary = `${data[i].show_salary} ${data[i].dy_salary > 12 ? '· ' + data[i].dy_salary + '<span>薪</span>' : ''}`;
                    }
                    str += `
                    <li>
                        <a href="${channelDomain}/job.html?id=${data[i].id}" target="_blank">
                            <div class="left">
                                <div class="title"><span>${data[i].title}</span><div>立即沟通</div></div>
                                <div class="salary">${salary}</div>
                                <div class="require">${str1 != '' ? str1 + '<span>|</span>' : ''}${data[i].experience}<span>|</span>${data[i].educational}<span>|</span>${data[i].nature}</div>
                                ${str2 != '' ? '<div class="label">' + str2 + '</div>' : ''}
                            </div>
                            <div class="right">
                                <div class="name"><span>${data[i].companyDetail.title} </span></div>
                                <div class="time">${data[i].postTime}</div>
                                <div class="btn">
                                    <div class="collect ${data[i].collect == 1 ? 'has' : ''}" data-id="{#$data.id#}">
                                        <span>${data[i].collect == 1 ? '已收藏' : '收藏'}</span>
                                    </div>
                                    ${data[i].has_delivery == 1 ? '<div class="hadpub">已投递</div>' : data[i].has_delivery_company == 0 ? '<div class="pub" data-id=' + data[i].id + ' data-type=' + data[i].typeid + ' data-name=' + data[i].type + ' data-state=' + data[i].has_delivery + '><span>投递简历</span></div>' : ''}
                                </div>
                            </div>
                        </a>
                    </li>
                    `;
                };
                $('.clh-items').html(str);
                this.tabChange(1);
            });
        },

        posterFn(state) { //海报弹窗
            if (state == 0) { //弹出获取职位和海报类型
                $('.poster').css({ 'display': 'flex' });
                $('html').css({
                    'overflow': 'hidden'
                })
                if (!this.posterb) { //获取职位和海报类型
                    // 海报类型
                    $.ajax({
                        url: '/include/ajax.php?',
                        data: {
                            service: 'job',
                            action: 'getPosterTemplate'
                        },
                        dataType: 'jsonp',
                        timeout: 5000,
                        success: (res) => {
                            if (res.state == 100 && res.info.length > 0) {
                                let data = [];
                                for (let i = 0; i < res.info.length; i++) {
                                    res.info[i].litpic = huoniao.changeFileSize(res.info[i].litpic, 320, 700);
                                    data.push(res.info[i]);
                                }
                                this.posterData = res.info;
                                this.posterb = true
                            } else {
                                alert(res.info);
                            }
                        }
                    })
                    // 职位类型
                    $.ajax({
                        url: '/include/ajax.php?',
                        data: {
                            service: 'job',
                            action: 'postList',
                            company: companyid,
                            pageSize: 200
                        },
                        dataType: 'jsonp',
                        timeout: 5000,
                        success: res => {
                            if (res.state == 100) {
                                let length = res.info.list.length;
                                if (length > 0) {
                                    if (length < 15) {
                                        this.jobtype = res.info.list;
                                    } else {
                                        this.alljobtype = JSON.parse(JSON.stringify(res.info.list));//全部展开职位
                                        this.partjobtype = res.info.list.splice(0, 10);//删除多余的;
                                        this.jobtype = this.partjobtype;
                                        $('.unfold').css({ 'display': 'flex' });//显示展开按钮
                                    }
                                } else {
                                    $('.pp-steps').hide();
                                    $('.pp-nopost').css('display', 'flex');
                                }
                            } else {
                                alert('加载失败，请刷新页面');
                            }
                        }
                    })
                }
            } else if (state == 1) { //关闭
                $('.p-produce').css({ 'animation': 'bottomFadeOut .3s' });
                setTimeout(() => {
                    $('.poster').hide();
                    $('.p-produce').css({ 'animation': 'topFadeIn .3s' });
                    $('html').css({
                        'overflow': 'overlay'
                    });
                }, 280);
            } else { //关闭生成的海报弹窗
                $('.p-save').hide()
            };
        },
        produceFn(id) { //生成海报
            $('.pp-poster a').hide();
            $('.p-save').show(); //生成弹窗  
            $('.pp-poster div').show(); //loading加载
            $('.pp-show').hide();//加载完成展示图
            let data = {
                service: 'job',
                action: 'makePoster',
                id: this.posterId.join(','),
                mid: id,
                type: this.posterType
            };
            $.ajax({
                url: '/include/ajax.php?',
                data: data,
                dataType: 'jsonp',
                timeout: 5000,
                success: (res) => {
                    if (res.info.url) {
                        $('.ppp-showimg').attr('src', res.info.url);
                        this.loadurl = res.info.url;
                        this.bool = false;
                    } else {
                        alert('加载失败，请重新操作');
                    }
                }
            });
        },
        psaveFn() { //保存海报   
            this.downloadImg(this.loadurl); //保存图片
        },
        async downloadImg(imgUrl) { // 保存图片的方法
            // 临时dom，用完需要清除
            const a = document.createElement('a');
            // 这里是将url转成blob地址
            let res = await fetch(imgUrl);// 跨域时会报错
            let blob = await res.blob();// 将链接地址字符内容转变成blob地址
            a.href = URL.createObjectURL(blob);
            a.download = '招聘海报'; // 下载文件的名字
            document.body.appendChild(a);
            a.click();
            //在资源下载完成后 清除 占用的缓存资源
            window.URL.revokeObjectURL(a.href);
            document.body.removeChild(a);
        },
        loadFn() { //生成的海报图片加载出来后执行
            if (!this.bool) {
                $('.pp-poster div').hide();
                $('.pp-show').show();
                let height = $('.ppp-showimg').height();
                let url = huoniao.changeFileSize($('.ppp-showimg').attr('src'), 680, 2 * height);
                $('.ppp-showimg').attr('src', url);
                this.bool = true;
                $('.pp-poster a').show();
            }
        },
        dragFn(target, ele) { //target表示点击哪个元素触发拖拽(一般是ele的父级),ele表示哪个窗口移动
            let _move = false;//移动标记
            let _x, _y;//鼠标离控件左上角的相对位置
            $(target).mousedown(function (e) {
                _move = true;
                _x = e.pageX - parseInt($(ele).css("left"));
                _y = e.pageY - parseInt($(ele).css("top"));
                // $('html,body').css({'user-select':'none'});
            });
            $(document).mousemove(function (e) {
                if (_move) {
                    let x = e.pageX - _x;//移动时鼠标位置计算控件左上角的绝对位置
                    let y = e.pageY - _y;
                    $(ele).css({ top: y, left: x });//控件新位置
                }
            }).mouseup(function () {
                _move = false;
                // $('html,body').css('user-select','none');
            });
        },
        foldFn(state) { //折叠/展开职位
            if (state == 0) {//展开
                this.jobtype = this.alljobtype;
                $('.fold').css({ 'display': 'flex' });
                $('.unfold').hide();
            } else { //折叠
                this.jobtype = this.partjobtype;
                $('.unfold').css({ 'display': 'flex' });
                $('.fold').hide();
                $('.pp-steps').animate({ scrollTop: 0 }, 0);//收起回到顶部
            };

        },
    },
    watch: {
        currOn: function (val) {
            // var leftObj =  $('.companyInfoBox .tabBox a[data-id="'+val+'"]')
            // var left = leftObj.position().left + leftObj.width()/2 - $('.tabBox .line').width()/2;
            let left = val * ($('.tabBox').eq(1).find('a').eq(0).outerWidth(true) + 3);
            $('.tabBox .line').css('transform', 'translateX(' + left + 'px)');
        }
    },
})
