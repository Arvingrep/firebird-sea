var page0 = 1,totalCount0 = 0 ,pageSize0 = 30; //职位
var page1 = 1,totalCount1 = 0 ,pageSize1 = 18; //企业

var atpage = 1,totalCount = 0,pageSize = 30;
var    scrollTab = 0;
$(function () {
    let index = 0;
    // 获取会场的fid
    let url = location.search;
    let params = new URLSearchParams(url.slice(1));
    let fid = params.get('id');

     // // 首次进入加载数据 -- 职位
    getList(function(res){
        if (res.info.list.length == 0) {
            $('.js-noneresults').css({ display: 'flex' })
        } else {
            $('.js-noneresults').css({ display: 'none' })
        }
    })
       scrollTab = $(".js-header").offset().top; //获取tab距离顶部的高度

    // 根据地址筛选
    $('.js-addr ul').delegate('li', 'click', function () {
        // 改变li样式
        $(this).addClass('active').siblings().removeClass();
        // 底部提示的显示和隐藏
        if (!$(this).attr('data-id') && !$('.js-jobs ul').find('.active').attr('data-id')) {
            $('.js-warning').css({ display: 'block' })
        } else {
            $('.js-warning').css({ display: 'none' })
        }
         page0 = 1
        // ajax请求
        getList(function(res){
            if (res.info.list.length == 0) {
                $('.js-noneresults').css({ display: 'flex' })
            } else {
                $('.js-noneresults').css({ display: 'none' })
            }
        });
        
    })
    // 根据职位筛选
    $('.js-jobs ul').delegate('li', 'click', function () {
        // 改变li样式
        $(this).addClass('active').siblings().removeClass()
        // 底部提示的显示和隐藏
        if (!$(this).attr('data-id') && !$('.js-addr ul').find('.active').attr('data-id')) {
            $('.js-warning').css({ display: 'block' })
        } else {
            $('.js-warning').css({ display: 'none' })
        }
        page0 = 1
        // ajax请求
        getList(function(res){
            if (res.info.list.length == 0) {
                $('.js-noneresults').css({ display: 'flex' })
            } else {
                $('.js-noneresults').css({ display: 'none' })
            }
        });
    })
    // 点击回车搜索
    $('.js-header form').submit(function () {
        let formData = new FormData($(this)[0]);
        index = $(this).attr('data-index', index).attr('data-index');
        if (index == 0) { //职位搜索
           page0 = 1
            // ajax请求
            getList(function(res){
                if (res.info.list.length == 0) {
                    $('.js-noneresults').css({ display: 'flex' })
                } else {
                    $('.js-noneresults').css({ display: 'none' })
                }
            });
        } else { //企业搜索
            getList()
        }
        return false;//禁跳
    })
    // 点击图片搜索
    $('.js-header .search').click(function () {
        $('.js-header form').submit()
    });
    $('.js-header .clear').click(function(){
        $('.js-header input').val('').focus();
        $('.js-header .clear').hide();
    });
    // 详情隐藏/显示控制
    function showFn() {
        $('.pop-background').css({ display: 'block' });
        $('.pop-detail').css({ display: 'block' });
        $('.pop-close').css({ display: 'block' });
        $('html,body').css({ 'overflow': 'hidden' });
    }
    function noneFn() {
        $('.pop-detail').css({ 'animation': 'bottomFadeOut .3s' });
        setTimeout(() => {
            $('.pop-background').hide();
            $('.pop-detail').hide();
            $('.pop-close').hide();
            $('html,body').css({ 'overflow': 'overlay' });
            $('.pop-detail').css({ 'animation': 'topFadeIn .3s' });
        }, 280);
    }
    $('.cb-detail .detail').click(function () {
        showFn();
    });
    $('.pop-background').click(function (e) {
        var el = e.target;
        if ($(el).closest('.pop-detail').length == 0) {
            noneFn();
        }
    })
    $('.pop-close').click(function () {
        noneFn();
    })
    // 打开报名窗口
    let company = '';
    $('.bottom-signup .company,.ad-banner-bottom .content .text div,.jch-right span').click(function () {
        if (!userid) { //未登录
            location.href = `${masterDomain}/login.html`
        } else if (!cid) { //无公司信息
            $('.cregister').show();
        } else { //获取公司信息
            if (company != '') {
                if (company.post_count == 0) { //没有发布任何职位
                    $('.b-failed').show();
                } else if (company.post_count < limit) { //小于招聘会限制，去发布
                    $('.b-failed').show();
                    let title = `至少上架${limit}条招聘职位信息才可报名`;
                    let text = `请先添加招聘职位`;
                    $('.bf-con .title').text(title);
                    $('.bf-con .text').html(text);
                } else if (company.post_count < limit) { //去管理
                    $('.b-failed').show();
                    let title = `至少上架${limit}条招聘职位信息才可报名`;
                    let text = `请先添加招聘职位`;
                    $('.bf-con .title').text(title);
                    $('.bf-con .text').html(text);
                    $('.bf-con .btn .pub').hide();
                    $('.bf-con .btn .manage').show();
                } else if (is_join == 1) { //已报名
                    $('.b-failed').show();
                    let title = `您已报名招聘会`;
                    let text = `企业名：${joinData.company}
                    <br>报名时间：${timeChange(joinData.date)}`;
                    let btnText = '好的';
                    $('.bf-con .title').text(title);
                    $('.bf-con .text').html(text);
                    $('.bf-con .callback').text(btnText);
                    $('.bf-con .btn .pub,.bf-con .btn .manage').hide();
                } else {
                    $('.jfb-plate .content .concat .name').text(' ' + company.people);
                    $('.jfb-plate .content .concat .phone').text(company.contact);
                    $('.jfb-plate .content .jobs span').eq(2).text(`(当前 ${company.post_count} 个)`)
                    $('.jfb-plate').show();
                }
                $(".joinfairs").show();
                return
            };
            let data = {
                service: 'job',
                action: 'companyDetail'
            };
            ajax(data).then(res => {
                if (res.state == 100) {
                    company = res.info;
                    if (!company.people && !company.contact) {
                        $('.popwarn').show();
                        return
                    };
                    if (company.post_count == 0) { //没有发布任何职位
                        $('.b-failed').show();
                    } else if (company.post_count < limit) { //小于招聘会限制，去发布
                        $('.b-failed').show();
                        let title = `至少上架${limit}条招聘职位信息才可报名`;
                        let text = `请先添加招聘职位`;
                        $('.bf-con .title').text(title);
                        $('.bf-con .text').html(text);
                    } else if (company.post_count < limit) { //去管理
                        $('.b-failed').show();
                        let title = `至少上架${limit}条招聘职位信息才可报名`;
                        let text = `请先添加招聘职位`;
                        $('.bf-con .title').text(title);
                        $('.bf-con .text').html(text);
                        $('.bf-con .btn .pub').hide();
                        $('.bf-con .btn .manage').show();
                    } else if (is_join == 1) { //已报名
                        $('.b-failed').show();
                        let title = `您已报名招聘会`;
                        let text = `企业名：${joinData.company}
                        <br>报名时间：${timeChange(joinData.date)}`;
                        let btnText = '好的';
                        $('.bf-con .title').text(title);
                        $('.bf-con .text').html(text);
                        $('.bf-con .callback').text(btnText);
                        $('.bf-con .btn .pub,.bf-con .btn .manage').hide();
                    } else {
                        $('.jfb-plate .content .concat .name').text(' ' + company.people);
                        $('.jfb-plate .content .concat .phone').text(company.contact);
                        $('.jfb-plate .content .jobs span').eq(2).text(`(当前 ${company.post_count} 个)`)
                        $('.jfb-plate').show();
                    };
                    $(".joinfairs").show();
                }
            });
        }
    });
    // 关闭报名窗口
    $('.jfb-plate .header img').click(function () {
        $('.jfb-plate').css({ 'animation': 'bottomFadeOut .3s' });
        setTimeout(() => {
            $('.joinfairs').hide();
            $('.jfb-plate').css({ 'animation': 'topFadeIn .3s' });
        }, 280);
    });
    $('.pw-con img,.popwarn .confirm').click(function () { //关闭弹窗
        $('.pw-con').css({ 'animation': 'bottomFadeOut .3s' });
        setTimeout(() => {
            $('.popwarn').hide();
            $('.pw-con').css({ 'animation': 'topFadeIn .3s' });
        }, 280);
    });
    // 提交报名
    $('.jfb-plate .content .submit').click(function () {
        if (company.post_count == 0) { //没有发布任何职位
            $('.b-failed').show();
            return
        } else if (company.post_count < limit) { //小于招聘会限制，去发布
            $('.b-failed').show();
            let title = `至少发布${limit}条招聘职位信息才可报名`;
            let text = `请先添加招聘职位`;
            $('.bf-con .title').text(title);
            $('.bf-con .text').html(text);
            return
        } else if (company.post_count < limit) { //去管理
            $('.b-failed').show();
            let title = `至少上架${limit}条招聘职位信息才可报名`;
            let text = `请先添加招聘职位`;
            $('.bf-con .title').text(title);
            $('.bf-con .text').html(text);
            $('.bf-con .btn .pub').hide();
            $('.bf-con .btn .manage').show();
            return
        } else if (is_join == 1) { ///已报名
            $('.b-failed').show();
            let title = `您已报名招聘会`;
            let text = `企业名：${joinData.company}
                        <br>报名时间：${timeChange(joinData.date)}`;
            let btnText = '好的';
            $('.bf-con .title').text(title);
            $('.bf-con .text').html(text);
            $('.bf-con .callback').text(btnText);
            $('.bf-con .btn .pub,.bf-con .btn .manage').hide();
            return
        };
        let id = $(this).attr('data-id');
        let data = {
            service: 'job',
            action: 'joinFairs',
            fid: id
        };
        ajax(data).then(res => {
            if (res.state == 100) {
                $('.b-success').show();
            }else{
                alert(res.info);
            }
        });
    });
    // 关闭报名失败的弹窗
    $('.bf-con .btn .callback,.bf-con .close').click(function () {
        $('.bf-con').css({ 'animation': 'bottomFadeOut .3s' });
        setTimeout(() => {
            let btnText = '取消';
            $('.bf-con .callback').text(btnText);
            $(".joinfairs").hide();
            $('.b-failed').hide();
            $('.bf-con').css({ 'animation': 'topFadeIn .3s' });
        }, 280);
    });
    // 关闭报名成功之后的弹窗
    $('.bs-con .close,.bs-con .btn').click(function () {
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
    // 立即沟通按钮
    $('.jc-company li .content .job-number').delegate('span', 'click', function () {
        event.preventDefault();
        let item = JSON.parse($(this).attr('data-item'));
        imconfig.chatid = item.userid;
    });

    //全部多少家企业点击
    $('.jch-right div').click(function(){
        $('.js-header li:eq(1)').click();
    })

    // 名单滑块
    new Swiper('.swiper-name', {
        direction: "vertical",
        slidesPerView: 1,  //视觉窗口里面显示几个滑块
        loop: true, //无缝轮播
        autoplay: { //移入暂停自动轮播
            pauseOnMouseEnter: true,
            disableOnInteraction: false,
        }, //自动切换
        delay: 5000, //自动切换间隔
    });
    // tab滚动
    $('.js-header li').click(function () {
        index = $(this).index();
        $(this).addClass('active').siblings().removeClass();
        let inHeight = $(document).scrollTop(); //卷上去内容的高度
        if (inHeight <= Math.floor($('.jobs-search').offset().top)) { //tab切换到顶部的距离小于卷进去的高度，页面滚下去
            $('html, body').animate({ scrollTop: $('.jobs-search').offset().top }, 200);
        } else { //页面直接上去，没有过程
            $('html, body').animate({ scrollTop: $('.jobs-search').offset().top }, 0);
        };
        if (index == 0) { //招聘职位
            $('.js-position').show();
            $('.js-company').hide();
        } else { //参会企业
            $('.js-position').hide();
            $('.js-company').show();
        };
    })




      function getList(callback){
        let currInd = $(".js-header .active").index()
        var param = {
                fid: fid,
                type: $('.js-jobs ul').find('.active').attr('data-id'),
                addrid: $('.js-addr li.active').attr('data-id'),
                cityid:cityid,
                page:page0,
                pageSize:pageSize0,
                keyword: $('.js-header input[name="keyword"]').val(),
            };
        if(currInd > 0){
            param = {
                fid: fid,
                 keyword: $('.js-header input[name="keyword"]').val(),
                 page:page1,
                 pageSize:pageSize1,
            }
        }
        $.ajax({
            url: '/include/ajax.php?action=fairsJoinCJ_'+(currInd ? 'company'  : 'job')+'&service=job',
            data: param,
            dataType: 'jsonp',
            timeout: 5000,
            success: (res) => {
                totalCount = res.info.pageInfo.totalCount

                if(currInd > 0){
                    $('.js-warning').css({ display: 'none' })
                    totalCount = res.info.pageInfo.totalCount;
                    totalCount1 = res.info.pageInfo.totalCount;
                    page1 = res.info.pageInfo.page;
                    if (res.info.list.length == 0) {
                        $('.js-noneresults').css({ display: 'flex' });
                        $('.js-company .jc-company').hide();
                        return
                    } else {
                        $('.js-noneresults').css({ display: 'none' });
                        $('.js-company .jc-company').show();
                    };
                    let str = '';
                    let strc = '';
                    let item = res.info.list;
                    for (let i = 0; i < item.length; i++) {
                        for (let j = 0; j < item[i].plist.length; j++) {
                            strc += `
                            <a href="${item[i].plist[j].url}" class="job-name">
                                <span class="job">${item[i].plist[j].title}</span>
                                <span class="salary">${item[i].plist[j].show_salary}${item[i].plist[j].dy_salary > 12 ? item[i].plist[j].dy_salary + '·薪' : ''}</span>
                            </a>`;
                        };
                        let job_str = item[i].pcount > 0 ? ('共' + item[i].pcount + '个职位') : '暂无在招职位'
                        str +=
                            `<li>
                            <div class="content">
                                <!-- logo -->
                                <a href="${item[i].url}" class="com-name">
                                    <img src="${item[i].logo}" onerror="this.src='/static/images/404.jpg'">
                                    <div>
                                        <p>${item[i].title}</p>
                                        <p><span class="species">${item[i].industry}</span><span>${item[i].scale}人</span>
                                        </p>
                                    </div>
                                </a>
                                <!-- 职位 -->
                                ${strc}
                                <!-- 职位个数 -->
                                <div class="job-number">
                                    <div>
                                        <a href="${item[i].url}" class="homepage">招聘主页</a>
                                        <span class="nowtalk chat_to-Link" data-item='${encodeURI(item[i])}' data-type="detail"><img
                                                src="${templets_skin}images/talking.png">立即沟通</span>
                                    </div>
                                    <a href="${item[i].url}?scroll=1" class="total">${job_str} &gt;</a>
                                </div>
                            </div>
                        </li>`;
                        strc = ``;
                    };
                    $('.js-company .jc-company').html(str);
                    showPageInfo('.js-company');
                }else{
                    totalCount0 = res.info.pageInfo.totalCount
                    page0 = res.info.pageInfo.page
                    if(callback){
                        callback(res)
                    }
                    if (res.info.list.length == 0) {
                        $('.js-noneresults').css({ display: 'flex' })
                    } else {
                        $('.js-noneresults').css({ display: 'none' })
                    }
                    let str = ''
                    let text = ''
                    res.info.list.map(function (item) {
                        // 先拼str内的text文本
                        item.addr_list_Name.map(function (item) {
                            text += `${item} `
                        })
                        let salary = '';
                        if(item.dy_salary > 12){
                            salary = '·' + item.dy_salary + '薪';
                        }
                        str += `
                        <li class="jsa-li">
                            <a href="${channelDomain}/job-${item.id}.html" target="_blank">
                                <!-- 职位名称和工资 -->
                                <div class="title">
                                    <span class="jobsname">${item.title}</span>
                                    <span class="salary">${item.show_salary}${salary}</span>
                                </div>
                                <!-- 要求和地址 -->
                                <div class="detail">
                                    <ul>
                                        <li>${item.experience}</li>
                                        <li>${item.educational}</li>
                                        <li>${item.nature}</li>
                                    </ul>
                                    <div>
                                    ${text}
                                    </div>
                                </div>
                                <!-- 公司名字 -->
                                <div class="company">${item.ctitle}</div>
                            </a>
                        </li>
                        `
                        // 每次循环结束要清除一下text
                        text = ''
                    })
                    $('.js-alljobs').html(str)
                    showPageInfo('.js-position');  
                }
                
            },
            error: (error) => {
                console.log(error);
            }
        })
}

//打印分页
function showPageInfo(element) {
    var info = $(element).find( ".pagination");
    
    var nowPageNum = atpage;
    var allPageNum = Math.ceil(totalCount/pageSize);
    var pageArr = [];
    info.html("").hide();

    // 隐藏已显示全部
    if(allPageNum == 1 && totalCount > 1 ){
        $(element).find('.js-warning').show()
        $(element).find('.js-warning').text('已显示全部'+ totalCount +'个职位')
    }else{
        $(element).find('.js-warning').hide()
    }
    var pages = document.createElement("div");
    pages.className = "pagination-pages";
    info.append(pages);

    //拼接所有分页
    if (allPageNum > 1) {

        //上一页
        if (nowPageNum > 1) {
            var prev = document.createElement("a");
            prev.setAttribute('href','javascript:;')
            prev.className = "prev";
            prev.innerHTML = langData['siteConfig'][6][33];//上一页
            prev.onclick = function () {
                atpage = nowPageNum - 1;
                if(element != '.js-position'){
                    page1 = atpage
                }else{
                    page0 = atpage
                }
                $(window).scrollTop(scrollTab)
                getList();
            }
            info.find(".pagination-pages").append(prev);
        }

        //分页列表
        if (allPageNum - 2 < 1) {
            for (var i = 1; i <= allPageNum; i++) {
                if (nowPageNum == i) {
                    var page = document.createElement("span");
                    page.className = "curr";
                    page.innerHTML = i;
                } else {
                    var page = document.createElement("a");
                    page.setAttribute('href','javascript:;')
                    page.innerHTML = i;
                    page.onclick = function () {
                        atpage = Number($(this).text());
                        if(element != '.js-position'){
                            page1 = atpage
                        }else{
                            page0 = atpage
                        }
                        $(window).scrollTop(scrollTab)
                        getList();
                    }
                }
                info.find(".pagination-pages").append(page);
            }
        } else {
            for (var i = 1; i <= 2; i++) {
                if (nowPageNum == i) {
                    var page = document.createElement("span");
                    page.className = "curr";
                    page.innerHTML = i;
                }
                else {
                    var page = document.createElement("a");
                    page.setAttribute('href','javascript:;')
                    page.innerHTML = i;
                    page.onclick = function () {
                        atpage = Number($(this).text());
                        if(element != '.js-position'){
                            page1 = atpage
                        }else{
                            page0 = atpage
                        }
                        $(window).scrollTop(scrollTab)
                        getList();
                    }
                }
                info.find(".pagination-pages").append(page);
            }
            var addNum = nowPageNum - 4;
            if (addNum > 0) {
                var em = document.createElement("span");
                em.className = "interim";
                em.innerHTML = "...";
                info.find(".pagination-pages").append(em);
            }
            for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
                if (i > allPageNum) {
                    break;
                }
                else {
                    if (i <= 2) {
                        continue;
                    }
                    else {
                        if (nowPageNum == i) {
                            var page = document.createElement("span");
                            page.className = "curr";
                            page.innerHTML = i;
                        }
                        else {
                            var page = document.createElement("a");
                            page.setAttribute('href','javascript:;')
                            page.innerHTML = i;
                            page.onclick = function () {
                                atpage = Number($(this).text());
                                if(element != '.js-position'){
                                    page1 = atpage
                                }else{
                                    page0 = atpage
                                }
                                $(window).scrollTop(scrollTab)
                                getList();
                            }
                        }
                        info.find(".pagination-pages").append(page);
                    }
                }
            }
            var addNum = nowPageNum + 2;
            if (addNum < allPageNum - 1) {
                var em = document.createElement("span");
                em.className = "interim";
                em.innerHTML = "...";
                info.find(".pagination-pages").append(em);
            }
            for (var i = allPageNum - 1; i <= allPageNum; i++) {
                if (i <= nowPageNum + 1) {
                    continue;
                }
                else {
                    var page = document.createElement("a");
                    page.setAttribute('href','javascript:;')
                    page.innerHTML = i;
                    page.onclick = function () {
                        atpage = Number($(this).text());
                        if(element != '.js-position'){
                            page1 = atpage
                        }else{
                            page0 = atpage
                        }
                        $(window).scrollTop(scrollTab)
                        getList();
                    }
                    info.find(".pagination-pages").append(page);
                }
            }
        }

        //下一页
        if (nowPageNum < allPageNum) {
            var next = document.createElement("a");
            next.setAttribute('href','javascript:;')
            next.className = "next";
            next.innerHTML = langData['siteConfig'][6][34];//下一页
            next.onclick = function () {
                atpage = nowPageNum + 1;
                if(element != '.js-position'){
                    page1 = atpage
                }else{
                    page0 = atpage
                }
                $(window).scrollTop(scrollTab)
                getList();
            }
            info.find(".pagination-pages").append(next);
        }

        info.show();

    }else{
        info.hide();
    }


   
}

















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
function timeChange(target) {
    let targetDate = new Date(target * 1000);
    let y = targetDate.getFullYear();
    let m = (targetDate.getMonth() + 1) < 10 ? '0' + (targetDate.getMonth() + 1) : (targetDate.getMonth() + 1);
    let day = targetDate.getDate() < 10 ? '0' + targetDate.getDate() : targetDate.getDate();
    return y + '/' + m + '/' + day
};
// 搜索职位/企业
function searchFn(value){
    if(value.length>0){
        $('.js-header .clear').show();
    }else{
        $('.js-header .clear').hide();
    };
};