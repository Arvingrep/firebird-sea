var goodcard = {
    props: ['tab'],
    data: function () {
        return {
            totalPage: 1,
            page: 1,
            isload: false,
        }
    },
    computed: {

    },
    template: `<div id="GoodCard" class="goodCard" >
            <a :href="tab.url" class="goodInfo">
            <div class="inner">
                <span v-if="tab.pai_count > 0">{{tab.pai_count}}人出价</span>
                <img :src="tab.litpic" />
            </div>
            <div class="textCon">
                <span class="tit">{{tab.title}}</span>
                <div class="priceCon" >
                <div class="priceText" >当前价</div>
                <div class="symbol">`+ echoCurrency("symbol") + `</div>
                <div class="price">{{tab.cur_mon_start}}</div>
                </div>
                <div class="enddate"><span>结束时间：</span>{{tab.enddate}}</div>
            </div>
            </a>
        </div>`,
    methods: {

    },
}




new Vue({
    el: '#MobileHome',
    data: {
        search_value: '',
        tabsArr: [],
        activeTab: 2,
    },

    components: {
        'goodcard': goodcard,
    },

    mounted() {
        var tt = this;
        tt.getTypeList();

        $(window).scroll(function () {
            var scrollTop = $(window).scrollTop();
            var scrollHeight = $(document).height();
            var windowHeight = $(window).height();
            if ((scrollTop + windowHeight >= scrollHeight) && !tt.tabsArr[tt.activeTab].isload) {
                tt.getDataList(tt.activeTab)
            }
        })


        // 滑动导航
        var t = $('.tcInfo .swiper-wrapper');
        var swiperNav = [], mainNavLi = t.find('li');
        for (var i = 0; i < mainNavLi.length; i++) {
            swiperNav.push('<li>' + t.find('li:eq(' + i + ')').html() + '</li>');
        }

        var liArr = [];
        for (var i = 0; i < swiperNav.length; i++) {
            liArr.push(swiperNav.slice(i, i + 10).join(""));
            i += 9;
        }

        t.html('<div class="swiper-slide"><ul class="fn-clear">' + liArr.join('</ul></div><div class="swiper-slide"><ul class="fn-clear">') + '</ul></div>');
        new Swiper('.tcInfo .swiper-container', { pagination: { el: '.tcInfo .pagination', }, loop: false, grabCursor: true, paginationClickable: true });
        // banner轮播图
        new Swiper('.react-view .swiper-container', {
            pagination: { el: '.react-view .pagination' },
            slideClass: 'slideshow-item',
            autoplay: true,
            loop: true,
            on: {
                init: function () {
                    // $('.banner').removeClass('initBanner')
                }
            }
        });
        let wxBoolean = Boolean(navigator.userAgent.toLowerCase().match(/micromessenger/))
        if (wxBoolean) {
            wx.config({
                debug: false,
                appId: wxconfig.appId,
                timestamp: wxconfig.timestamp,
                nonceStr: wxconfig.nonceStr,
                signature: wxconfig.signature,
                jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ',
                    'onMenuShareWeibo', 'updateAppMessageShareData', 'updateTimelineShareData',
                    'onMenuShareQZone', 'openLocation', 'scanQRCode', 'chooseImage', 'previewImage',
                    'uploadImage', 'downloadImage', 'getLocation'
                ],
                openTagList: ['wx-open-launch-app',
                    'wx-open-launch-weapp'
                ] // 可选，需要使用的开放标签列表，例如['wx-open-launch-app']
            });
            wx.miniProgram.postMessage({//
                data: {
                    title: wxconfig.title,
                    link: wxconfig.link,
                    imgUrl: wxconfig.imgUrl,
                    desc: wxconfig.description
                }
            })
            wx.ready(function () {
                wx.onMenuShareAppMessage({
                    title: wxconfig.title,
                    desc: wxconfig.description,
                    link: wxconfig.link,
                    imgUrl: wxconfig.imgUrl,
                });
                wx.onMenuShareTimeline({
                    title: wxconfig.title,
                    link: wxconfig.link,
                    imgUrl: wxconfig.imgUrl,
                });

                // 新增 分享至朋友圈
                wx.updateAppMessageShareData({
                    title: wxconfig.title,
                    desc: wxconfig.description,
                    link: wxconfig.link,
                    imgUrl: wxconfig.imgUrl,
                }) //自定义微信分享给朋友
                wx.updateTimelineShareData({ //自定义分享朋友圈
                    title: wxconfig.title,
                    link: wxconfig.link,
                    imgUrl: wxconfig.imgUrl,
                    success: (res => { })
                }); //自定义微信分享给朋友


                wx.onMenuShareQQ({
                    title: wxconfig.title,
                    desc: wxconfig.description,
                    link: wxconfig.link,
                    imgUrl: wxconfig.imgUrl,
                });
                wx.onMenuShareWeibo({
                    title: wxconfig.title,
                    desc: wxconfig.description,
                    link: wxconfig.link,
                    imgUrl: wxconfig.imgUrl,
                });
                wx.onMenuShareQZone({
                    title: wxconfig.title,
                    desc: wxconfig.description,
                    link: wxconfig.link,
                    imgUrl: wxconfig.imgUrl,
                });
            });
            wx.error(function (error) { //错误信息
                console.log(`分享设置失效原因：${error.errMsg}`);
            });
        };
    },
    methods: {
        onSearch: function (val) {
            window.location.href = listUrl + '?keywords=' + val
        },
        getTypeList: function () {
            var tt = this;
            tt.tabsArr = [{ 'id': '', typename: '全部', dataArr: [] }]
            $.ajax({
                url: '/include/ajax.php?service=paimai&action=type&son=1',
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    if (data.state == 100) {
                        // tt.tabsArr = tt.tabsArr.concat(data.info);
                        for (var i = 0; i < data.info.length; i++) {
                            var tab = data.info[i];
                            tab['dataArr'] = [];
                            tt.tabsArr.push(tab)
                        }
                    }
                },
                error: function () { }
            });
        },
        onClick(id) {
            var tt = this;
        },

        getDataList(ind) {
            var tt = this;
            var tab = tt.tabsArr[ind];
            var page = tab.page ? tab.page : 1;
            var isload = tab.isload

            if (isload) return false;
            var isload = true;
            tt.tabsArr[ind]['isload'] = isload;
            var data = {
                page: page,
                pageSize: 10,
                typeid: tab.id,
            }
            tt.tabsArr[ind]['loadingText'] = '加载中...';
            $.ajax({
                url: '/include/ajax.php?service=paimai&action=getlist&arcrank=1',
                type: "POST",
                data: data,
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        var list = data.info.list;
                        page++;
                        isload = false;
                        tt.tabsArr[ind]['loadingText'] = '下拉加载更多';
                        if (page > data.info.pageInfo.totalPage) {
                            isload = true;
                            tt.tabsArr[ind]['loadingText'] = '没有更多了~';
                        }
                        tt.tabsArr[ind]['page'] = page;
                        tt.tabsArr[ind]['isload'] = isload;
                        tt.tabsArr[ind]['dataArr'] = tt.tabsArr[ind]['dataArr'].concat(list);
                    }

                },
                error: function () {
                    tt.tabsArr[ind]['loadingText'] = '下拉加载更多';
                }
            });

        }
    },

    watch: {
        activeTab: function (val) {
            var tt = this;
            if (tt.tabsArr[val]['dataArr'] && tt.tabsArr[val]['dataArr'].length > 0) {

            } else {
                tt.getDataList(val);
            }
        }
    }
})