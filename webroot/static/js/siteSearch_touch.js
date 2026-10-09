



var ajaxArr = {};
wx.config({
    debug: false,  //页面调试
    appId: wxconfig.appId,
    timestamp: wxconfig.timestamp,
    nonceStr: wxconfig.nonceStr,
    signature: wxconfig.signature,
    jsApiList: ['openLocation']
});

new Vue({
    el:'#siteSearch',
    data:{
        is_app:false,
        goDirect:false, //直接跳转商家
        focusIn:false,
        hasKeywords:false,
        esState:esState, //全站搜索的开关
        backbtn:false, //是否有返回按钮
        keywords_search:toSearch, //搜索关键字
        keywords:'', //搜索关键字
        searchHistory:[], //搜索的历史记录
        searchHot:[], //搜索的历史记录
        toSearchResult:false, //显示搜索结果
        imgError:'/static/images/404.jpg',
        // 内容tab
        searchEnd:false, //是否搜索结束
        loading:false, //正在加载中,上半部分
        loadupEnd:false, //正在加载中，下半部分
        search_num:0, //总数
        tabs:[{id:0,text:'全部',list:[],isload:false,page:1},{id:1,text:'最新',list:[],isload:false,page:1},{id:2,text:'带图',list:[],isload:false,page:1},{id:3,text:'视频',list:[],isload:false,page:1},{id:4,text:'直播',list:[],isload:false,page:1}],
        onTab:0, //结果页当前选择的tab
        searchList:{
            business:[],
            youhui:[],  //优惠
            shop:[],   //商城
            article:[],  //资讯
            job:[],   //招聘
            member:[], //用户
            huodong:[],  //活动
            house:[], // 房产
            house_community:[], // 房产
            house_loupan:[], // 房产
            car:[],  //汽车
        },
        noData:true, //没有搜索到相关数据 

        userPosi:'', //用户当前定位

        fixTop:false, //更多内容tab置顶
        currType:'', //当前筛选的分类
        currTypename:esState?'':'商家', //筛选分类名，关闭全站搜索时，则是当前选择搜索的模块名
        currTitle:'', //标题
        types:[{
            id:1,
            typename:'团购/优惠',
            title:'更多优惠',
            page:1,
            isload:false,
            list:[],
        },{
            id:2,
            typename:'用户',
            title:'相关用户',
            page:1,
            isload:false,
            list:[],
        },{
            id:3,
            typename:'商家',
            title:'相关商家',
            page:1,
            isload:false,
            list:[],
        },{
            id:4,
            typename:'内容',
            title:'相关内容',
            page:1,
            isload:false,
            list:[],
        }],

        // 此处是商家更多页相关数据
        orderby:'', //排序
        areaList:[],
        chosedAddr:'', //当前选择的城镇
        chosedAddrId:'', //选择的城镇id
        mediaList:[], //媒体号
        mediahasOpen:false,

        // 以下是分模块搜索
        moduleArrAll:[{
            mod:'business',
            modname:'商家',
        },{
            mod:'info',
            modname:'分类信息',
        },{
            mod:'shop',
            modname:'团购优惠',
        },{
        //     mod:'circle',
        //     modname:'圈子',
        // },{
            mod:'house',
            modname:'房产',
        },{
            mod:'job',
            modname:'招聘',
        },{
            mod:'waimai',
            modname:'美食外卖',
        },{
            mod:'huodong',
            modname:'本地活动',
        },{
            mod:'sfcar',
            modname:'顺风车',
        },{
            mod:'car',
            modname:'汽车市场',
        },{
            mod:'tieba',
            modname:'贴吧社区',
        },{
            mod:'homemaking',
            modname:'家政',
        },{
            mod:'travel',
            modname:'旅游',
        },{
            mod:'renovation',
            modname:'装修',
        },{
            mod:'article',
            modname:'新闻资讯',
        },{
            mod:'live',
            modname:'视频直播',
        },{
            mod:'pension',
            modname:'养老机构',
        }],
        moduleArr:[],
        currPage:1, //当前页码
        currIsload:false, //当前加载开关
        currDataList:[], //当前模块数据，未开启es搜索
        topHeight:'.88rem',
        currModule:'business',

        tjBusinessList:[], //没数据推荐
        tjPage:1,
        tjIsload:false,
    },
    mounted(){
        var tt = this;
        var kks = tt.getUrlParam('keywords');
        var modName = tt.getUrlParam('action');
        if(!esState){
            tt.getModule()
        }
        

        
        if(kks){
            tt.hasKeywords = true;
            tt.keywords_search = kks;
            tt.toSearchResult = true;
            tt.getuserLocation(); //获取定位
        }else{
            tt.getuserLocation(); //获取定位
            tt.get_history();
            tt.getHotSearch();
        }

        if($('html').hasClass('huoniao_Fullscreen') && $('html').hasClass('huoniao_Android') ){
            tt.topHeight = '1.58rem'
        }

        var device = navigator.userAgent;
        if (device.indexOf('huoniao_iOS') > -1) {
            tt.is_app = true;
        }

        $(window).scroll(function(){
            var scroll = $(window).scrollTop();
            if(tt.toSearchResult){
                if($(".tabsBox").length > 0){ //查看更多页面
                    console.log(1)
                    if($(".tabsBox").offset().top - $(".searchForm").height() <= scroll){
                        tt.fixTop = true
                    }else{
                        tt.fixTop = false
                    } 

                    if(($('body').height() - 100) < ($(window).height() + scroll)){
                        if(!tt.tabs[tt.onTab].isload){
                            tt.getAllList()
                        }
                    }
    
                }else{ //搜索结果页
                    if(($('body').height() - 100) < ($(window).height() + scroll) && !tt.loading){
                        if(tt.esState){
                            if(!tt.currType){
                                tt.getAllList()
                            }else{
                                if(tt.currType == 1){
                                    tt.getyouhuiList();
                                }else if(tt.currType == 2){
                                    tt.getUserList();
                                }else if(tt.currType == 3){
                                    tt.getBusiList();
                                }else if(tt.currType == 4){
                                    tt.getArticleList();
                                    if(tt.mediaList.length == 0){
                                        tt.getUserList()
                                    }
                                }
                            }
                        }else{//未开启全站搜索
                            tt.getListByMod()
                        }
                    }
                }

                if(tt.noData && tt.tjPage > 1 && !tt.tjIsload){ //推荐数据
                    tt.recDataList()
                }
            }





        })

        

    },

    computed:{
        // 图片尺寸
        imgSize(){
            return function(file,w,h){
                return huoniao.changeFileSize(file,w,h)
            }
        },
        // 价格样式
        priceChange(){
            return function(price){
                price = parseFloat(price).toString()
                var priceArr = price.split('.');
                var priceHtml = priceHtml = priceArr[0] ;
                if(priceArr.length > 1){
                    priceHtml = priceHtml + '<em>.'+priceArr[1]+'</em>'
                }

                return priceHtml;
            }
        },

        //标题关键字标红
        redTitleKeywords(){
            return function(title){
                var tt = this;
                var titHtml = title;
                if(title.indexOf(tt.keywords_search) > -1){
                    var key = tt.keywords_search;
                    var keyHtml = '<b>'+key+'</b>'
                    titHtml = title.split(key).join(keyHtml)
                }
                return titHtml;
            }
        },

        //时间戳修改
        changeTimeStr(){
            return function(time,type){
                var timeStr = '';
                timeStr =  returnHumanTime(time,2)
                if(type){
                    timeStr = type == 1 ? new Date(time * 1000).getFullYear() : huoniao.transTimes(start,2)
                }
                return timeStr;
            }
        },
        
        NumFixed(){
            return function(num,count){
                var str = Number(num).toFixed(count);
                return str
            }
        },
        // 距离转换
        getDistance(){
            return function(distance){

                var str = ''
                if(typeof(distance) == 'number'){
                    if(distance < 1000){
                        str = '<1km'
                    }else{
                        str = parseFloat((distance/1000).toFixed(1)) + 'km'
                    }
                }
                if(distance <= -1){
                    str = '';
                }
                return str
            }
        },

        addrName(){
            return function(addrArr,index,len,str){
                if(addrArr){
                    var addr = '';
                    var addrArray = []
                    addr = addrArr[addrArr.length - 1];
                    if(index){
                        addr =  addrArr[addrArr.length - index];
                    }

                    if(len){
                        // addrArray.push(addr);
                        for(var i = 0; i < len; i++){
                            if(i <= index){
                                addrArray.push(addrArr[addrArr.length - (index - i)])
                            }
                        }
                        addr = addrArray.join(str ? str : ' ')
                    }
                    return addr;
                }
            }
        },

        // 活动时间
        checkTimeStr(){
            return function(item){
                var start = item.columns.began;
                var end = item.columns.end;
                var timeStr = '';
                if(huoniao.transTimes(start,2) == huoniao.transTimes(end,2)){
                    if(new Date(start * 1000).getFullYear() == new Date().getFullYear()){
                        timeStr = huoniao.transTimes(start,3)
                    }else{
                        timeStr = huoniao.transTimes(start,2)
                    } 
                }else{
                    var startTime = (new Date(start * 1000).getFullYear() == new Date().getFullYear()) ? huoniao.transTimes(start,2).replace(new Date(start * 1000).getFullYear(),'') : huoniao.transTimes(start,1)
                    var endTime = (new Date(end * 1000).getFullYear()  == new Date().getFullYear()) ? huoniao.transTimes(end,2).replace(new Date(end * 1000).getFullYear(),'') : huoniao.transTimes(end,1)
                    timeStr = startTime +' ~ '+ endTime
                }

                return timeStr
            }
        },

        changeAddress(){
            return function(address){
                var addrArr = address.split('  ');
                var addrStr = ''
                if(addrArr.length > 2){
                    addrStr = addrArr[0] +' · '+  addrArr[1]
                }else{
                    addrStr = addrArr[0] 
                }

                return addrStr;
            }
        },

        // 字符串转换
        strToArray(){
            return function(str,str1){
                var arr = str.split(str1)
                return arr
            }
        },

        // 经纬度获取距离

        computeDistance(){

            return function(lng,lat){ //店铺的坐标
                var tt = this;
                var lng1 = tt.userPosi.lng
                var lat1 = tt.userPosi.lat
                var distance = tt.GetDistance(lat1,lng1,lat,lng);
                if(distance < 1000){
                    str = '<1km'
                }else{
                    str = parseFloat((distance/1000).toFixed(1)) + 'km'
                }
                return str
            }
        }




    },
    methods:{
        // 获取模块
        getModule(){
            var tt = this;
            $.ajax({
                url: '/include/ajax.php?service=siteConfig&action=module',
                type: "GET",
                dataType: "json",
                success: function(data){
                    if(data.state == 100){
                        var modArr = []
                        for(var i = 0; i < data.info.length; i++){
                            var item = data.info[i]
                            if(item.name == 'business' || item.name == 'info' || item.name == 'pension' || item.name == 'shop' || item.name == 'live' || item.name == 'article' || item.name == 'renovation' || item.name == 'travel' || item.name == 'homemaking' || item.name == 'tieba' || item.name == 'car' || item.name == 'sfcar' || item.name == 'huodong' || item.name == 'waimai' || item.name == 'job' || item.name == 'house' ){
                                modArr.push({
                                    modname:item.title,
                                    mod:item.name
                                })
                            }
                        }
                        modArr.unshift({
                            mod:'business',
                            modname:'商家'
                        })
                        tt.moduleArr = modArr;

                        
                    }
                },
                error:function(data){
                    console.log('数据加载失败')
                }

            })
        },

        // 获取历史搜索记录
        get_history(){
            var tt = this;
            var history = utils.getStorage('index_history_search');
            if (history) {
                // history.reverse();
                tt.searchHistory = history;
            }
        },

        // 获取热门搜索
        getHotSearch(){
            var tt = this;
            $.ajax({
                url: '/include/ajax.php?service=siteConfig&action=hotkeywords&module=index',
                type: "GET",
                dataType: "json",
                success: function(data){
                    if(data.state == 100){
                        tt.searchHot = data.info;
                    }
                },
                error:function(data){
                    console.log('数据加载失败')
                }

            })
        },

        // 清除历史
        del_history(){
            var tt = this;
            utils.removeStorage('index_history_search');
            showErrAlert('清除成功');
            tt.searchHistory = []
        },

        changeFocus(){
            var tt = this;
            if(tt.esState && !tt.toSearchResult){
                tt.focusIn = true;
            }
        },
        checkInp(){
            var tt = this;
            if(tt.keywords_search == '' || tt.toSearchResult){
                tt.focusIn = false;
            }else if(tt.esState){
                tt.focusIn = true;
                
            }
        },

        // 搜索店铺
        toStore(){
            var tt = this;
            tt.currType = 3;
            tt.toSearchResult = true;
            tt.backbtn = false;
            tt.focusIn = false;
            tt.goDirect = true;
            var history = tt.searchHistory;
                history.reverse();
            if(tt.searchHistory.indexOf(tt.keywords_search) > -1){
                history.splice(tt.searchHistory.indexOf(item), 1);
            }
            history.push(tt.keywords_search);  
            tt.searchHistory = history;
            tt.searchHistory.reverse();
            history = history.slice(0,21)
            utils.setStorage('index_history_search',JSON.stringify(history))
            setTimeout(() => {
                tt.getBusiList();
            }, 500);
        },

        backAppSearch(){
            var tt = this;
            tt.toSearchResult = false; 
            tt.hidePop()
            history.go(-1);
        },

       // 跳转
        toSearch(item,type){
            var tt = this;
            var el = event && event.currentTarget || '.searchBox .inpbox';
            if(item){ //点击搜索关键字
                tt.toSearchResult = true;
                tt.focusIn = false;
                tt.keywords_search = item;
                var history = tt.searchHistory;
                    history.reverse();
                if(tt.searchHistory.indexOf(tt.keywords_search) > -1){
                    history.splice(tt.searchHistory.indexOf(item), 1);
                }
                history.push(tt.keywords_search);  
                tt.searchHistory = history;
                tt.searchHistory.reverse();
                history = history.slice(0,21)
                utils.setStorage('index_history_search',JSON.stringify(history))
                // 初始化数据
                tt.initData();
                tt.hidePop();
                if(tt.esState){
                    if(!tt.currType){
                        tt.getListSummary('business')
                    }else{
                        if(tt.currType == 1){
                            tt.getyouhuiList();
                        }else if(tt.currType == 2){
                            tt.getUserList();
                        }else if(tt.currType == 3){
                            tt.getBusiList();
                        }else if(tt.currType == 4){
                            tt.getMediaList();
                            tt.getArticleList();
                        }
                    }
                }else{
                    // 未开启分站搜索
                    tt.getListByMod()
                }
            }else{  //input搜索
                if(event && event.keyCode == 13 || type){  //输入enter键
                    if(tt.keywords_search == ''){
                        showErrAlert('请输入搜索关键字')
                        return false;
                    }
                    $(el).blur()
                    tt.focusIn = false;
                    tt.toSearchResult = true;
                    var history = tt.searchHistory;
                    history.reverse();
                    if(tt.searchHistory.indexOf(tt.keywords_search) > -1){
                        history.splice(tt.searchHistory.indexOf(tt.keywords_search), 1);
                    }
                    history.push(tt.keywords_search);  
                    tt.searchHistory = history;
                    tt.searchHistory.reverse();
                    history = history.slice(0,21)
                    utils.setStorage('index_history_search',JSON.stringify(history))
                    // 判断当前所在页面 来进行搜索

                    // 初始化数据
                    tt.initData()
                    if(tt.esState){
                        if(!tt.currType){
                            tt.getListSummary('business')
                        }else{
                            if(tt.currType == 1){
                                tt.getyouhuiList();
                            }else if(tt.currType == 2){
                                tt.getUserList()
                            }else if(tt.currType == 3){
                                tt.getBusiList();
                            }else if(tt.currType == 4){
                                tt.getMediaList()
                                tt.getArticleList();
                            }
                        }
                    }else{
                        // 未开启分站搜索
                        tt.getListByMod()
                    }
                }
            }
            
            
        },

        // 初始化相关数据
        initData(){
            var tt = this;
            tt.loadupEnd = false;
            tt.tabs.forEach(function(val,index){
                tt.tabs[index].list = [];
                tt.tabs[index].page = 1;
                tt.tabs[index].isload = false;
            });

            for(var item in tt.searchList){
                tt.searchList[item] = [];
            };

            for(var i = 0; i<tt.types.length; i++){
                tt.types[i].isload = false;
                tt.types[i].list = [];
                tt.types[i].page = 1;
            }

            tt.noData = true;
            tt.tjPage=1;
            // 没有开启es搜索
            tt.currPage = 1; //当前页码
            tt.currIsload = false; //当前加载开关
            tt.currDataList = []; //当前模块数据，未开启es搜索

        },

        // 获取商家列表
        getListSummary(typename){
            var tt = this;
            var url = '/include/ajax.php?service=siteConfig&action=siteSearch';
            var dataArr = [];
            tt.searchEnd = false;
            dataArr.push('cityid='+cityid);
            dataArr.push('keyword='+tt.keywords_search);
            dataArr.push('scope=index');
            dataArr.push('lng='+tt.userPosi.lng);
            dataArr.push('lat='+tt.userPosi.lat);
            tt.keywords = tt.keywords_search
            url += '&'+dataArr.join('&')
            if(tt.loading ) return false;
            tt.loading = true;
            ajaxArr.xh1 = $.ajax({
                url: url,
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    tt.loading = false;
                    tt.loadupEnd = true
                    tt.search_num = data.info.pageInfo.totalCount
                    if(data.state == 100){
                        for(var item in data.info.list){
                            tt.searchList[item] = data.info.list[item];
                            if(data.info.list[item].length > 0){
                                tt.noData = false; //搜索到数据了
                            }
                        }

                        // 搜素结束
                        tt.searchEnd = true;
                        
                        if(tt.noData){
                            tt.searchEnd = false;
                        }
                        tt.getAllList(); //没有收到数据，搜索下面的内容
                    }else{
                        showErrAlert(data.info)
                    }



                },
                error: function(){
                    tt.loadupEnd = true
                    tt.loading = false;
                }
            });
        },

        // 看是否在可是窗口范围内
        checkInWindow(type){ // type =1 表示直接加载下一个数据
            var tt = this;
            var offTop = 0;
            var typename = '';
            for(var list in tt.searchList) {
                var obj = $(".resultBox[data-type='"+list+"']");
                obj = obj.prev('.resultBox')
                if(!tt.searchList[list].isload){
                    typename = list;
                    offTop = obj.offset().top + obj.height()
                    break;
                }
                // if(!tt.searchList[list].isload && $(".resultBox[data-type='"+list+"']"))
            }
            if(((offTop - $(window).scrollTop()) <= $(window).height() && typename != '') || type == 1){
                if(typename){
                    tt.getListSummary(typename)
                }else{
                    tt.loadupEnd = true;//上半部分加载完成
                }
            }
        },

        // 点击关注
        guanzhu(item){
            var  tt = this;
            event.preventDefault()
            var userid = $.cookie(cookiePre+"login_user");
            if(userid == null || userid == ""){
                location.href = masterDomain + '/login.html';
                return false;
            }

            var el = event.currentTarget;
            var uid = item.columns.uid;
            var follow = $(el).hasClass('is_follow')
            if($(el).hasClass('disables')) return false;
            $(el).addClass('disabled');
            if(!follow){
                tt.follow(uid,el,follow)
            }else{
                var options = {
                    isShow:true,
                    title:'确认取消关注？',
                }
                confirmPop(options,function(){
                    tt.follow(uid,el,follow)
                })
            }
        },


        follow(uid,el,follow){
            $.post("/include/ajax.php?service=member&action=followMember&id="+uid, function(){
                $(el).removeClass("disabled");
                if(follow){
                    $(el).removeClass('is_follow');
                    $(el).text('关注Ta')
                }else{
                    showErrAlert('关注成功');
                    $(el).addClass('is_follow');
                    $(el).text('已关注')
                }

            });
        },

        // huodongBaoming(item){
        //     event.preventDefault();
            
        // },

        // 加载搜索结果页的更多内容
        getAllList(){
            var tt = this;
            if(tt.loading || tt.tabs[tt.onTab].isload) return false;
            tt.loading = true;
            tt.tabs[tt.onTab].isload = true
            tt.searchEnd = false
            var dataArr = [];
            dataArr.push('cityid=' + cityid);
            dataArr.push('lng=' + tt.userPosi.lng);
            dataArr.push('lat=' + tt.userPosi.lat);
            if(tt.onTab == 1){
                dataArr.push('module=video,live,info,circle,tieba,travel_strategy,travel_video,renovation_case');
                dataArr.push('parent=1');
                dataArr.push('ordertype=2');
                dataArr.push('stime=0');
                dataArr.push('etime=9999999999');
            }else if(tt.onTab == 2){
                dataArr.push('pic=1');
            }else if(tt.onTab == 3){
                dataArr.push('video=1');
            }else if(tt.onTab == 4){
                dataArr.push('module=live');
            }else{
                dataArr.push('module=video,live,info,circle,tieba,travel_strategy,travel_video,renovation_case');
                dataArr.push('parent=1');
            }
            ajaxArr.xh2 = $.ajax({
                url: '/include/ajax.php?service=siteConfig&action=siteSearch&keyword='+tt.keywords_search+'&page='+tt.tabs[tt.onTab].page+'&'+dataArr.join('&'),
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    tt.loading = false;
                    tt.tabs[tt.onTab].isload = false
                    tt.searchEnd = true; //搜索结束
                    if(data.state == 100){
                        if(data.info.list.length > 0){
                            if(tt.noData){
                                tt.noData = false;
                            }
                            for(var i = 0; i < data.info.list.length; i++){
                                tt.tabs[tt.onTab].list.push(data.info.list[i]);
                            }
                            tt.tabs[tt.onTab].page = tt.tabs[tt.onTab].page + 1
                            if(tt.tabs[tt.onTab].page > data.info.pageInfo.totalPage){
                                tt.tabs[tt.onTab].isload = true;
                            }

                        }else{
                            tt.tabs[tt.onTab].isload = true;
                        }

                    }else{
                        showErrAlert(data.info);
                    }

                },
                error: function(){
                    tt.loading = false;
                }
            });
        },

        // 显示区域选择
        showPop(el){
            var tt = this;
            $('.popMask').show();
            $(el + ".popup").css({
                'transform':'translateY(0)',
                'opacity':'1',
            })
        },
        // 获取区域
        getArea(){
            var tt = this;
            $.ajax({
                url: '/include/ajax.php?service=siteConfig&action=addr&son=1&type=' + cityid,
                type: "GET",
                dataType: "json",
                success: function(data){
                    if(data.state == 100){
                        tt.areaList = data.info;
                    }else{
                        console.log('暂无分站')
                    }
                },
                error:function(data){
                    console.log('暂无分站')
                }

            })
        },

        // 选择区域
        choseAddr(addr){
            var tt = this;
            var el = event.currentTarget;
            $(el).addClass('curr').siblings('li').removeClass('curr');
            if(addr.lower && addr.lower.length > 0){
                tt.chosedAddr = addr.lower
            }else{
                tt.chosedAddrId = addr.id;
                $('.areaBox .area').text(addr.typename)
            }
        },

        noAddrId(type){
            var tt = this;
            var el = event.currentTarget;
            $(el).addClass('curr').siblings('li').removeClass('curr');
            tt.chosedAddrId = '';
            tt.chosedAddr = [];
            tt.hidePop();
            if(!type){ //全苏州
                $('.areaBox .area').text('区域')
            }else{
                tt.chosedAddrId = 'nearby';
                $('.areaBox .area').text('附近');
                tt.orderby = 3;
            }
        },

        // 隐藏区域选择
        hidePop(){
            var tt = this;
            $('.popMask').hide();
            $(".popup").css({
                'transform':'translateY(-100%)',
                'opacity':'0',
            })
        },

        // 获取更多商家列表
        getBusiList(){
            var tt = this;
            var dataArr = [];
            dataArr.push('keyword=' + tt.keywords_search);
            dataArr.push('lat=' + tt.userPosi.lat);
            dataArr.push('lng=' + tt.userPosi.lng);
            dataArr.push('cityid=' + cityid);
            dataArr.push('page=' + tt.types[2].page);
            dataArr.push('addrid=' + tt.chosedAddrId);  //区域id
            dataArr.push('ordertype=' + tt.orderby);  //排序
            var url = '/include/ajax.php?service=siteConfig&action=siteSearch&pageSize=20&module=waimai_store,tuan_store,shop_store,travel_store,renovation_store,education_store,homemaking_store,car_store,pension_store,travel_hotel,dating_store,marry_hstore,marry_nhstore,house_zjCom&parent=1&'+dataArr.join('&')
            
            if(tt.types[2].isload) return false;
            tt.types[2].list = []
            tt.loading = true;
            tt.types[2].isload = true;
            ajaxArr.xh3 = $.ajax({
                url: url,
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    tt.loading = false;
                    tt.types[2].isload = false;
                    if(data.state == 100){
                        if(tt.types[2].page == 1){
                            tt.types[2].list = [];
                        }
                        if(data.info.list.length > 0){
                            for(var i = 0; i < data.info.list.length; i++){
                                tt.types[2].list.push(data.info.list[i])
                            }
                            tt.types[2].page = tt.types[2].page + 1;
                            if(tt.types[2].page > data.info.pageInfo.totalPage){
                                tt.types[2].isload = true;
                            }
                            
                        }
                    }else{
                        showErrAlert(data.info)
                    }

                },
                error: function(){
                    tt.loading = false;
                    tt.types[2].isload = true;
                }
            });
        },

        // 获取更多优惠
        getyouhuiList(){
            var tt = this;
            if(tt.loading || tt.types[0].isload) return false;
            tt.loading = true;
            tt.types[0].isload = true;
            var url= '/include/ajax.php?service=siteConfig&action=siteSearch&pageSize=20&scope=youhui&keyword='+tt.keywords_search+'&cityid='+cityid+'&page='+tt.types[0].page;
            ajaxArr.xh4 = $.ajax({
                url: url,
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    tt.loading = false;
                    tt.types[0].isload = false;
                    if(data.state == 100){
                        if(data.info.list.length > 0){
                            for(var i = 0; i < data.info.list.length; i++){
                                tt.types[0].list.push(data.info.list[i])
                            }
                            tt.types[0].page = tt.types[0].page + 1;
                            if(tt.types[0].page > data.info.pageInfo.totalPage){
                                tt.types[0].isload = true;
                            }
                            
                        }
                    }else{
                        showErrAlert(data.info)
                        tt.types[0].isload = true;
                    }

                },
                error: function(){

                    tt.loading = false;
                    tt.types[0].isload = true;
                }
            });

        },

        // 获取更多用户
        getUserList(){
            var tt = this;
            if(tt.types[1].isload) return false;
            tt.loading = true;
            tt.types[1].isload = true;
            var dataArr = [];
            dataArr.push('cityid='+cityid);
            dataArr.push('keyword='+tt.keywords_search);
            dataArr.push('module=member,article_selfmedia,house_zjUser,dating_hn');
            var url= '/include/ajax.php?service=siteConfig&action=siteSearch&pageSize=10&'+dataArr.join('&')+'&page='+tt.types[1].page;

            $.ajax({
                url: url,
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    tt.loading = false;
                    tt.types[1].isload = false;
                    if(data.state == 100){
                        if(data.info.list.length > 0){
                            for(var i = 0; i < data.info.list.length; i++){
                                tt.types[1].list.push(data.info.list[i])
                            }

                            tt.types[1].page = tt.types[1].page + 1;
                            if(tt.types[1].page > data.info.pageInfo.totalPage){
                                tt.types[1].isload = true;
                            }
                        }else{
                            tt.types[1].isload = true;
                        }
                    }else{
                        showErrAlert(data.info)
                    }

                },
                error: function(){
                    tt.loading = false;
                    tt.types[1].isload = true;
                }
            });
        },

        // 获取更多资讯
        getArticleList(){
            var tt = this;
            if(tt.types[3].isload) return false;
            tt.loading = true;
            tt.types[3].isload = true;
            var dataArr = []
            dataArr.push('cityid='+cityid);
            dataArr.push('keyword='+tt.keywords_search);
            dataArr.push('module=article_list,paper');
            var url= '/include/ajax.php?service=siteConfig&action=siteSearch&pageSize=10&'+dataArr.join('&')+'&page='+tt.types[3].page;
            ajaxArr.xh5 = $.ajax({
                url: url,
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    tt.loading = false;
                    tt.types[3].isload = false;
                    if(data.state == 100){
                        if(data.info.list.length > 0){
                            for(var i = 0; i < data.info.list.length; i++){
                                tt.types[3].list.push(data.info.list[i])
                            }

                            tt.types[1].page = tt.types[1].page + 1;
                            if(tt.types[3].page > data.info.pageInfo.totalPage){
                                tt.types[3].isload = true;
                            }

                            
                        }else{
                            tt.types[3].isload = true;
                        }
                    }else{
                        showErrAlert(data.info)
                    }

                },
                error: function(){
                    tt.loading = false;
                    tt.types[3].isload = true;
                }
            });

        },

        // 资讯更多媒体号
        openMediaList(){
            var tt = this;
            tt.mediahasOpen = !tt.mediahasOpen
        },

        changeBack(){
            var tt = this;
            tt.backbtn = true;
            tt.currType = '';
            
            if(tt.goDirect){
                tt.goDirect = false;
                tt.focusIn = false;
                tt.backbtn = false;
                tt.currType = '';
                tt.toSearchResult = false;
            }
        
        },

        // 展开选择模块,只有在全站搜索关闭的情况下才会调用
        openChoseType(){
            var tt = this;
            var el = event.currentTarget;
            if(!tt.esState){
                // 以下展开模块选择
                tt.showPop('.moduleChose')
            }
            
        },

        choseModule(mod){
            var tt = this;
            tt.currModule=mod.mod;
            tt.currTypename = mod.modname;
            tt.hidePop();
            tt.initData(); //初始化数据
            // 根据模块搜索数据
            tt.getListByMod()
        },

        // 获取模块搜索数据
        getListByMod(){
            var tt = this;
            if(tt.currIsload) return false;
            tt.loading = true;
            tt.currIsload = true
            tt.searchEnd = false;
            var mod = tt.currModule;
            mod = mod ? mod : 'business';
            var url = '';
            var dataArr = [];
            if(mod == 'business'){
                url = '/include/ajax.php?service=business&action=blist&store=2'
                dataArr.push('title=' + tt.keywords_search)
            }else if(mod == 'info'){
                dataArr.push('title=' + tt.keywords_search)
                url = '/include/ajax.php?service=info&action=ilist_v2'
            }else if(mod == 'circle'){
                dataArr.push('title=' + tt.keywords_search)
                url = '/include/ajax.php?service=circle&action=tlist'
            }else if(mod == 'job'){
                dataArr.push('title=' + tt.keywords_search)
                url = '/include/ajax.php?service=job&action=postList'
            }else if(mod == 'waimai'){
                dataArr.push('keywords=' + tt.keywords_search);
                url = '/include/ajax.php?service=waimai&action=shopList'
            }else if(mod == 'huodong'){
                dataArr.push('keywords=' + tt.keywords_search);
                url = '/include/ajax.php?service=huodong&action=hlist'
            }else if(mod == 'sfcar'){
                dataArr.push('cityid=' + cityid);
                dataArr.push('keywords=' + tt.keywords_search);
                url = '/include/ajax.php?service=sfcar&action=getsfcarlist'
            }else if(mod == 'pension'){
                dataArr.push('search=' + tt.keywords_search);
                url = '/include/ajax.php?service=pension&action=storeList'
            }else if(mod == 'car'){
                dataArr.push('keywords=' + tt.keywords_search);
                url = '/include/ajax.php?service=car&action=car'
            }else if(mod == 'shop'){
                dataArr.push('title=' + tt.keywords_search);
                dataArr.push('moduletype=3,4');
                url = '/include/ajax.php?service=shop&action=slist'
            }else if(mod == 'tieba'){
                dataArr.push('keywords=' + tt.keywords_search);
                url = '/include/ajax.php?service=tieba&action=tlist';
            }else if(mod == 'homemaking'){
                dataArr.push('keywords=' + tt.keywords_search);
                url = '/include/ajax.php?service=homemaking&action=hList';
            }else if(mod == 'travel'){
                dataArr.push('keywords=' + tt.keywords_search);
                url = '/include/ajax.php?service=travel&action=searchTravel';
            }else if(mod == 'renovation'){
                dataArr.push('title=' + tt.keywords_search);
                url = '/include/ajax.php?service=renovation&action=diary'; //装修案例
            }else if(mod == 'article'){
                dataArr.push('title=' + tt.keywords_search);
                url = '/include/ajax.php?service=article&action=alist&mold=0,1,2,3,4'; 
            }else if(mod == 'live'){
                dataArr.push('title=' + tt.keywords_search);
                url = '/include/ajax.php?service=live&action=alive'; 
            }else if(mod == 'house'){
                dataArr.push('title=' + tt.keywords_search);
                url = '/include/ajax.php?service=house&action=loupanList'; 
            }

            dataArr.push('pageSize=20')
            dataArr.push('page=' + tt.currPage)
            dataArr.push('lng=' + tt.userPosi.lng)
            dataArr.push('lat=' + tt.userPosi.lat)
        
            ajaxArr.xh6 = $.ajax({
                url: url,
                type: "POST",
                dataType: "json",
                data:dataArr.join('&'),
                success: function (data) {
                    tt.loading = false;
                    tt.currIsload = false;
                    tt.searchEnd = true; //是否搜索结束
                    if(data.state == 100){
                        if(tt.currPage == 1){
                            tt.currDataList = []
                        }
                        if(data.info.list.length > 0){
                            tt.noData = false;
                            for(var i = 0; i < data.info.list.length; i++){
                                tt.currDataList.push(data.info.list[i])
                            }

                            tt.currPage = tt.currPage + 1;
                            if(tt.currPage > data.info.pageInfo.totalPage){
                                tt.currIsload = true;
                            }

                            
                        }else{
                            tt.currIsload = true;
                        }
                    }else{
                        showErrAlert(data.info)
                        tt.currIsload = true; //暂无数据
                    }

                },
                error: function(){
                    tt.loading = false;
                    tt.currIsload = true;
                    tt.searchEnd = true; //是否搜索结束
                }
            });
        },

        // 获取用户当前定位
        getuserLocation(){
            var tt = this;
            HN_Location.init(function(data){
                if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
                    showErrAlert(langData['siteConfig'][27][136]);
                    if(tt.hasKeywords){
                        tt.toSearch(tt.keywords_search,'1');
                    }
                    
                }else{
                    userLng = data.lng;
                    userLat = data.lat;
                    tt.userPosi = data;
                    if(tt.hasKeywords){
                        tt.toSearch(tt.keywords_search,'1');
                    }
                }
            })
        },

        clearAllAjax(){
            // 停止正在进行的ajax
            for(var item in ajaxArr){
                ajaxArr[item].abort();
            }
        },

        // 获取自媒体用户
        getMediaList(){
            var tt = this;
            var dataArr = []
            dataArr.push('cityid='+cityid);
            dataArr.push('keyword='+tt.keywords_search);
            dataArr.push('module=article_selfmedia');
            var url= '/include/ajax.php?service=siteConfig&action=siteSearch&pageSize=100&'+dataArr.join('&')+'&page=1';
            ajaxArr.xh7 = $.ajax({
                url: url,
                type: "POST",
                dataType: "jsonp",
                success: function (data) {                
                    if(data.state == 100){
                        if(data.info.list.length > 0){
                            tt.mediaList = data.info.list
                        }
                    }else{
                        showErrAlert(data.info)
                    }

                },
                error: function(){
                    tt.loading = false;
                    tt.types[3].isload = true;
                }
            });
        },

        // 获取url参数
        getUrlParam(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if ( r != null ){
                return decodeURI(r[2]);
            }else{
                return null;
            }
        },

        // 推荐商家
        recDataList(){
        //     tjBusinessList:[], //没数据推荐
        // tjPage:1,
        // tjIsload:false,
        var tt = this;
        var dataArr = [];
            dataArr.push('cityid='+cityid);
            dataArr.push('page='+tt.tjPage);
            if(tt.tjIsload) return false;
            tt.tjIsload = true;
            var url= '/include/ajax.php?service=business&action=blist&'+dataArr.join('&');
            ajaxArr.xh8 = $.ajax({
                url: url,
                type: "POST",
                dataType: "jsonp",
                success: function (data) {  
                    tt.tjIsload = false;              
                    if(data.state == 100){
                        if(data.info.list.length > 0){
                            if(tt.tjPage == 1){
                                tt.tjBusinessList = data.info.list
                            }else{
                                tt.tjBusinessList = [...tt.tjBusinessList,...data.info.list]
                            }
                            tt.tjPage = tt.tjPage + 1;
                            if(tt.tjPage > data.info.pageInfo.totalPage){
                                tt.tjIsload = true;
                            }
                        }
                    }else{
                        showErrAlert(data.info)
                    }

                },
                error: function(){
                    tt.loading = false;
                    tt.types[3].isload = true;
                }
            });
        },

        // 计算距离
        Rad(d) {
            return d * Math.PI / 180.0;//经纬度转换成三角函数中度分表形式。
        },
        GetDistance(lat1, lng1, lat2, lng2) {
            var radLat1 = this.Rad(lat1);
            var radLat2 = this.Rad(lat2);
            var a = radLat1 - radLat2;
            var b = this.Rad(lng1) - this.Rad(lng2);
            var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
                Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
            s = s * 6378.137;// 地球半径;
            s = Math.round(s * 10000) / 10; //输出为米
            return s;
        }
    },

    watch:{
        onTab:function(val){
            var tt = this;
            var left = 0;
            for(var i = 0; i<tt.tabs.length; i++ ){
                if(tt.tabs[i].id == val){
                    left = $('.tabsBox .tabul li[data-id="'+val+'"]').position().left;
                    $(".tab_bg").css('left',left);
                    break;
                }
            }
            if(tt.tabs[val].list.length == 0 && !tt.tabs[val].isload){ //第一次加载
                tt.getAllList();
            }
        },

        // 当前搜索的分类
        currType:function(val){
            var tt = this;
            for(var i=0; i<tt.types.length; i++){
                if(tt.types[i].id == val){
                    tt.currTypename = tt.types[i].typename;
                    tt.currTitle = tt.types[i].title;
                }
            }
            if(val != ''){
                tt.clearAllAjax()
            }
            
            if(val && tt.types[val-1].page == 1){
                tt.types[val-1].list = []; //清空数据
                document.body.scrollIntoView();
                this.backbtn = false;
                if(tt.currType == 1){
                    tt.getyouhuiList();
                }else if(tt.currType == 2){
                    tt.getUserList();
                }else if(tt.currType == 3){
                    tt.getBusiList();
                }else if(tt.currType == 4){
                    tt.getMediaList()
                    tt.getArticleList();
                }
            }

            if(val == 3){
                tt.getArea()
            }

            setTimeout(() => {
                 // 获取searchform的高度
                var topHeight = $(".topFixed").height()
                tt.topHeight = topHeight + 'px'
            }, 10);
        },


        // 返回最初的搜索页
        toSearchResult:function(val){
            var tt = this;
            if(!val){
                this.currType == '';
                this.backbtn = false;
                tt.initData()
                tt.clearAllAjax()
            }else{
                this.backbtn = true;
            }
            
            // 获取searchform的高度
            var topHeight = $(".topFixed").height()
            tt.topHeight = topHeight + 'px';

        },
    

        // 商家排序时
        orderby:function(val){
            var tt = this;
            var left = $('.shaiBox .orderby a[data-id="'+val+'"]').offset().left;
            oleft = left + $('.shaiBox .orderby a[data-id="'+val+'"]').width()/2 - $('.curr_line').width()/2;
            $(".curr_line").css('transform','translateX('+oleft+'px)');

            // 排序---商家
            
            tt.types[2].page = 1;
            tt.types[2].isload = false;
            if(tt.chosedAddrId == 'nearby' && val != 3){
                tt.chosedAddrId  = '';
                $(".areaBox .area").text('区域')
            }
            tt.getBusiList()
        },

        // 区域id改变
        chosedAddrId:function(val){
            var tt =this;
            tt.types[2].page = 1;
            tt.types[2].isload = false;
            tt.hidePop();
            tt.getBusiList()
        },

        searchEnd(){
            var tt = this;
            if(tt.searchEnd && tt.noData &&tt.tjPage==1){
                tt.recDataList()
            }
        },
        moduleArr(val){
            var tt = this;
            var modName = tt.getUrlParam('action');
            if(modName){
                for(var i = 0; i < tt.moduleArr.length; i++){
                    if(tt.moduleArr[i].mod == modName){
                        tt.currModule = modName;
                        tt.currTypename = esState ? '' : tt.moduleArr[i].modname;
                        break;
                    }
                }
            }
        }
    }
})