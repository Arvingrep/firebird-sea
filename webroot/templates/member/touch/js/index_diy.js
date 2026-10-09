var pageVue = new Vue({
    el:'#page',
    data:{
        enterUrl:memberDomain + '/enter.html',
        usertype:usertype,
        cfg_ios_review:cfg_ios_review, //
        loginUrl:masterDomain + '/login.html',
        profileUrl:profileUrl, //资料页
        wxGz:false,
        scrollTop:false,
        userid:userid,
        memberComp:config.memberComp, //会员信息头部配置
        compArrs:config.compArrs,
        pageSet:config.pageSet,
        orderInfo:'', //订单信息
        // 会员头部模板二昵称下的数据
        circleData:[{
            num:'0',
            text:'关注',
            id:1,
            code:'follow'
        },{
            num:'0',
            text:'粉丝',
            id:2,
            code:'fans'
        },{
            num:'0',
            text:'获赞',
            id:3,
            code:'zan'
        }],
        numberOption:[
            {id:1,text:cfg_pointName,num:'0',code:'point',link:memberDomain + '/pocket.html?dtype=1'},
            {id:2,text:'余额',num:'0',code:'money',link:memberDomain + '/pocket.html?dtype=0'},
            {id:3,text:'优惠券',num:'0',code:'quan',link:memberDomain + '/myquan.html'},
            {id:4,text:'收藏',num:'0',code:'collect',link:memberDomain + '/collection.html'},
            {id:5,text:'足迹',num:'0',code:'footPrint',link:memberDomain + '/history.html'},
            {id:6,text:'粉丝',num:'0',code:'fans',link:masterDomain + 'user/29/fans.html'},
            {id:7,text:'发布',num:'0',code:'fabu',link:memberDomain + '/manage.html'},
            {id:8,text:'关注',num:'0',code:'follow',link:masterDomain + '/user/29/follow.html'},
        ], //数字选项
        financeOption:[
            {id:1,text:cfg_pointName,num:'0',code:'point',link:memberDomain + '/pocket.html?dtype=1'},
            {id:2,text:'余额',num:'0',code:'money',link:memberDomain + '/pocket.html?dtype=0'},
            {id:3,text:'优惠券',num:'0',code:'quan',link:memberDomain + '/myquan.html'},
            {id:4,text:cfg_bonusName,num:'0',code:'bonus',link:memberDomain + '/consume.html'},
        ], //财务选项

        userinfo:'', //用户信息
        setBtnLink:setBtnLink, //设置按钮的链接 
        qiandaoBtnLink:qiandaoBtnLink,
        msgBtnLink:msgBtnLink,
        expireVip:false,
        defaultIcon1:masterDomain + '/static/images/admin/siteMemberPage/default_icon1.png',
        defaultIcon2:masterDomain + '/static/images/admin/siteMemberPage/default_icon2.png',
        upgradeUrl:memberDomain + '/upgrade.html',
        preview:preview,
		previewBtn:true,
        cfg_business_state:cfg_business_state,
        appBoolean:appBoolean,
        isBusiness:false,
        fromMod:fromMod || '', //从哪个模块进来
    },
    mounted(){
        const that = this;
        let numberOptions = that.numberOption.map(item => {
            let newItem = JSON.parse(JSON.stringify(item))
            newItem['link'].replace('29',userid)
            return newItem
        })
        that.numberOption = JSON.parse(JSON.stringify(numberOptions));

        if(userid){
            that.userid = userid
            that.getUserInfo(userid);
            that.getStoreDetail()
        }else{
            let showArr = [];
            let count = 0
            for(let i = 0; i < config.compArrs.length; i++){
                if(config.compArrs[i].id != 6 && config.compArrs[i].id != 7){
                    showArr.push(config.compArrs[i]);
                    if(config.compArrs[i].id !== 8){
                        count = count + 1;
                    }
                    if(count == 3){
                        break;
                    }
                }
            }
            that.compArrs = showArr;
        }

        let offSetTop = $('.headerTop').length ? $('.headerTop').offset().top : 0
        $(window).scroll(function(){
            let scrollTop = $(this).scrollTop();
            let offTop = $('.headerTop').height() + offSetTop;
            if(scrollTop >= 10 ){
                that.scrollTop = true;
                if(!$('.fixedTop').hasClass('show')){
                    $('.fixedTop').addClass('show').removeClass('fadeOut')
                }
            }else{
                that.scrollTop = false;
                if($('.fixedTop').hasClass('show')){
                    $('.fixedTop').addClass('fadeOut').removeClass('show')
                    setTimeout(() => {
                        $('.fixedTop').removeClass('fadeOut');
                    }, 200);
                }
                
            }
        })
        console.log(that.fromMod,fromMod)
        if(that.fromMod == 'marry'){
            console.log('测试')
            that.$set(that.memberComp.business,'link',businessUrl + '/marry.html')
        }
    },
    methods:{
        toREM(num){
            return (num  / 100) + 'rem'
        },

        // 获取样式
        getStyle(box,type,content){
            const that = this;
            let styleStrArr = []
            if(box == 'memberBg'){
                // 背景色
                if(that.memberComp.bgType != 'image'){
                    styleStrArr.push('background:' +that.memberComp.style.bg_color)
                }else{
                    styleStrArr.push('background-image:url(' +that.memberComp.style.bg_image+')')
                }
            }else if(box == 'numberCountBox'){
                 // 边距
                styleStrArr.push('margin:' + that.toREM(that.memberComp.cardStyle.marginTop) + ' 0  0') 

                // 背景色
                styleStrArr.push('background:' + (that.memberComp.numberCount.style.background ? that.checkBgColor(that.memberComp.numberCount.style.background,that.memberComp.numberCount.style.opacity) : 'transparent')) 

                // 边框
                styleStrArr.push('border-style:solid')
                styleStrArr.push('border-color:' + (that.memberComp.numberCount.style.borderColor ? that.memberComp.numberCount.style.borderColor : 'transparent'))
                styleStrArr.push('border-width:' + that.toREM(that.memberComp.numberCount.style.borderSize))
                // 圆角
                styleStrArr.push('border-radius:' + that.toREM(that.memberComp.cardStyle.borderRadius))
            }else if(box == 'vipCardBox'){
                if(that.memberComp.vipCard.theme === 3){
                    if(type == 'inner'){
                        // 背景色
                        if(that.memberComp.vipCard.style.bgType != 'image'){
                            styleStrArr.push('background:' + (that.memberComp.vipCard.style.background ? that.memberComp.vipCard.style.background : that.memberComp.vipCard.style.initBackground))
                        }else{
                            styleStrArr.push('background-image:url(' +that.memberComp.vipCard.style.backimg+')')
                        }
                        // 圆角
                        styleStrArr.push('border-radius:' + that.toREM(that.memberComp.cardStyle.borderRadius) )
                    }else{
                        
                        styleStrArr.push('border-radius:' + that.toREM(that.memberComp.cardStyle.borderRadius))
                        styleStrArr.push('background:' + that.memberComp.financeCount.style.background)
                    }
                }else{

                    // 边距
                    if(that.memberComp.vipCard.style.bgType != 'image'){
                        styleStrArr.push('background:' + (that.memberComp.vipCard.style.background ? that.memberComp.vipCard.style.background : that.memberComp.vipCard.style.initBackground))
                    }else{
                        styleStrArr.push('background-image:url(' +that.memberComp.vipCard.style.backimg+')')
                    }
                    // 圆角
                    styleStrArr.push('border-radius:' + that.toREM(that.memberComp.cardStyle.borderRadius) )
                }

                if(type == 'margin'){
                    styleStrArr = ['margin-top:' + that.toREM(that.memberComp.cardStyle.marginTop) ]
                }
                if(type == 'radius'){
                    styleStrArr = ['border-radius:' + that.toREM(that.memberComp.cardStyle.borderRadius) ]
                }

            }else if(box == 'vipCardBtn'){
                if(that.memberComp.vipCard.btnStyle.styleType == 'radius'){
                    // 背景色
                    styleStrArr.push('background:' +that.memberComp.vipCard.btnStyle.style.background)
                    styleStrArr.push('color:' +that.memberComp.vipCard.btnStyle.style.color)
                    // 圆角
                    styleStrArr.push('border-radius:' + that.toREM(that.memberComp.vipCard.btnStyle.style.borderRadius));
                }else{
                    styleStrArr.push('color:' +that.memberComp.vipCard.btnStyle.style.background)
                }
            }else if(box === 'vipCardBtnArr'){ //箭头样式
                if(that.memberComp.vipCard.btnStyle.styleType == 'radius'){

                    styleStrArr.push('filter: drop-shadow(.36rem 0 0 '+that.memberComp.vipCard.btnStyle.style.color+') ')
                }else{
                    styleStrArr.push('filter: drop-shadow(.36rem 0 0 '+that.memberComp.vipCard.btnStyle.style.background+') ')

                }
            }else if(box == 'orderInfoBox' || box == 'financeInfoBox' || box == 'iconsInfoBox' || box == 'listInfoBox' || box == 'wechatInfo' ){
                styleStrArr.push('margin: '+ that.toREM(content.style.marginTop) +' '+ that.toREM(content.style.marginLeft) +'  0'); //边距
                styleStrArr.push('border-radius:'+  that.toREM(content.style.borderRadius) )
                if(box == 'financeInfoBox'){
                    if(content.bgType == 'color'){
                        styleStrArr.push('background-color:'+  content.style.bg_color)    
                    }else{
                        styleStrArr.push('background:url('+  content.style.bg_image +') no-repeat center/cover')
                    }
                }else if((box == 'wechatInfo' && content.custom) ){
                    styleStrArr.push('height:'+  that.toREM(content.style.height) );
                }
            }else if(box == 'titleInfo'){
                styleStrArr.push('margin: 0 '+ that.toREM(content.style.marginLeft)); //边距
                styleStrArr.push('height:'+  that.toREM(content.style.height) );
            
            }else if(box == 'finance_number'){
                styleStrArr.push('margin: 0 '+ that.toREM(content.style.marginLeft)); //边距
                styleStrArr.push('height:'+  that.toREM(content.style.height) );
            }else if(box == 'financeInfo'){
                styleStrArr.push('color:' +that.memberComp.financeCount.titleStyle.color)
                if(!type){

                    styleStrArr.push('width:'+(100 / (that.memberComp.financeCount.showItems.length > 1 ? that.memberComp.financeCount.showItems.length : 2) )+'%;')
                }
            }else if(box == 'pageTop'){
                styleStrArr.push('margin:0 '+ that.toREM(that.pageSet.style.marginLeft)); //边距
            }else if(box == 'pageBtn'){
                if(content.btns.style.color && that.pageSet.btns.style.color != 'transparent' && that.pageSet.btns.showType === 0){
                    styleStrArr.push('transform: translateX(-100%); filter: drop-shadow(.44rem 0 0 '+ that.pageSet.btns.style.color +')');
                }else{
                    styleStrArr.push('transform: translateX(0)');
                }
            }
            return styleStrArr.join(';');
        },

         // 背景色和透明度转换
        checkBgColor(bgColor,opc){
            const that = this;
            opc = opc || opc === '0' ? opc : 100;
            let opacity = (opc / 100).toFixed(2);
            const alphaHexMap = { '1.00':'FF', '0.99':'FC', '0.98':'FA', '0.97':'F7', '0.96':'F5', '0.95':'F2', '0.94':'F0', '0.93':'ED', '0.92':'EB', '0.91':'E8', '0.90':'E6', '0.89':'E3', '0.88':'E0', '0.87':'DE', '0.86':'DB', '0.85':'D9', '0.84':'D6', '0.83':'D4', '0.82':'D1', '0.81':'CF', '0.80':'CC', '0.79':'C9', '0.78':'C7', '0.77':'C4', '0.76':'C2', '0.75':'BF', '0.74':'BD', '0.73':'BA', '0.72':'B8', '0.71':'B5', '0.70':'B3', '0.69':'B0', '0.68':'AD', '0.67':'AB', '0.66':'A8', '0.65':'A6', '0.64':'A3', '0.63':'A1', '0.62':'9E', '0.61':'9C', '0.60':'99', '0.59':'96', '0.58':'94', '0.57':'91', '0.56':'8F', '0.55':'8C', '0.54':'8A', '0.53':'87', '0.52':'85', '0.51':'82', '0.50':'80', '0.49':'7D', '0.48':'7A', '0.47':'78', '0.46':'75', '0.45':'73', '0.44':'70', '0.43':'6E', '0.42':'6B', '0.41':'69', '0.40':'66', '0.39':'63', '0.38':'61', '0.37':'5E', '0.36':'5C', '0.35':'59', '0.34':'57', '0.33':'54', '0.32':'52', '0.31':'4F', '0.30':'4D', '0.29':'4A', '0.28':'47', '0.27':'45', '0.26':'42', '0.25':'40', '0.24':'3D', '0.23':'3B', '0.22':'38', '0.21':'36', '0.20':'33', '0.19':'30', '0.18':'2E', '0.17':'2B', '0.16':'29', '0.15':'26', '0.14':'24', '0.13':'21', '0.12':'1F', '0.11':'1C', '0.10':'1A', '0.09':'17', '0.08':'14', '0.07':'12', '0.06':'0F', '0.05':'0D', '0.04':'0A', '0.03':'08', '0.02':'05', '0.01':'03', '0.00':'00', }
            
            let color =  bgColor + alphaHexMap[opacity]; //转换之后的色值
            return color
        },

        // 获取对应的key和文字
        checkArr(arr,type,ind){ //arr => 当前选中的选项  type => 分类  ind 当前所在的索引
            const that = this;
            let objArr = [];
            switch(type){
                case 'numberCount':
                    objArr = that.numberOption;
                    break;
                case 'financeCount':
                    objArr = that.financeOption;
                    break;
                case 'order':
                    objArr = that.compArrs[ind].content.orderOption;
                    if(!that.orderInfo){
                        that.orderInfo = {};
                        that.getOrderInfo()
                    }
                    break;

            }
            let realChose = [];


            if(type == 'order'){
                for(let i = 0; i < arr.length; i++ ){
                    let obj = objArr.find(item => {
                        return item.id == arr[i]
                    });
                    realChose.push(obj)
                }
            }else{
                if(ind && ind === 1){ //正在上架中
                    var newArr = arr.filter(function(item){
                        return [1,2,3].indexOf(item) <= -1;
                    })
                    arr = JSON.parse(JSON.stringify(newArr))
                } 
                realChose = objArr.filter(item => {
                    return arr.indexOf(item.id) > -1;
                })
            
            }

            return JSON.parse(JSON.stringify(realChose))
        },

        // 获取用户信息
        getUserInfo(id){
            const that = this;
            let infoData = that.pageSet.infoData;
            $.ajax({
                url: '/include/ajax.php?service=member&action=detail&id='+id+'&need_data=' + that.pageSet.infoData.join(','),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        that.userinfo = data.info
                        for(let i = 0; i < that.circleData.length; i++){
                            that.circleData[i].num = data.info[that.circleData[i].code]
                        }
                    }
                },
                error: function () { }
            });
        },


        // 获取商家信息
        getStoreDetail(){
            const that = this
            $.ajax({
                url: '/include/ajax.php?service=business&action=storeDetail',
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        that.isBusiness = true
                    }
                },
                error: function () { }
            });
        },

        // 验证会员相关信息
        checkVipLevel(userinfo){
            const that = this;
            let showText = ''
            if( userinfo.level == '0'){ //非会员
                showText = ''
            }else{
                let now = parseInt(new Date().valueOf() / 1000);
                if(now > userinfo.expired){ //已过期
                    let day = parseInt((now - userinfo.expired) / 86400);
                    showText = userinfo.levelName + '已过期' + (day < 1 ? '' :  day + '天')
                    that.expireVip = true;
                }else{
                    showText = '权益到期：' + huoniao.transTimes(userinfo.expired,2).replace(/-/g,'/')
                }
            }
            return showText;
        },


        // 获取订单信息
        getOrderInfo(){
            const that = this;
            let orderData = that.pageSet.orderData;
            // console.log(orderData);
            if(orderData.indexOf('all') > -1){
                orderData.splice(orderData.indexOf('all'),1)
            }
            $.ajax({
                url: '/include/ajax.php?service=member&action=getModuleOrderCount&need_data=' + orderData.join(','),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        that.orderInfo = data.info;
                    }
                },
                error: function () { }
            });
        },

        toUrl(url){
            location.href = url;
        },

        touchStartMove(){
            const that = this;
            if(that.previewBtn && that.preview){
                that.previewBtn = false;
            }
        },

        touchEndMove(){
            const that = this;
            setTimeout(() => {
                if(!that.previewBtn && that.preview){
                    that.previewBtn = true
                }
            }, 2000);
        },

        backToIndex(){
            const that = this;
            if(navigator.userAgent.indexOf('huoniao_iOS') > -1 && navigator.userAgent.indexOf('huoniao_Android') <= -1){
                setupWebViewJavascriptBridge(function (bridge) {
                    bridge.callHandler("goBack", {}, function (responseData) { });
                })
            }else{
                location.href = masterDomain
            }
        },

        removeEmpty(list,type){
            const that = this;
            let listCon = list.filter(item => {
                return (item.link || item.icon)
            });
            
            return listCon;
        },

        checkEmpty(list,column){
            const that = this;
            let empty = [];
            let listCon = list.filter(item => {
                return item.image
            })
            if(column == 1){
                empty = listCon && listCon.length ? listCon : []
            }else{
                empty = list
            }
            return empty
        },

        toLink(url){
            const that = this
            // let url = $(this).attr('data-url');
            var deviceUserAgent = navigator.userAgent;
            if(deviceUserAgent.indexOf('huoniao') > -1){
                event.preventDefault()
                setupWebViewJavascriptBridge(function(bridge) {

                    bridge.callHandler("redirect", {link:url}, function (responseData) { });
                })  
            }
        }
    }
})