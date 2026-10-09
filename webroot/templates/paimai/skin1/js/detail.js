

// 图片放大组件
var imgzoom = {
    props:[],
    data:function(){
        return{
            state:{
                zoomImgWidth: 0,
                zoomImgHeight: 0,
                isShow: false,
                boxX: 0,
                boxY: 0,
                maskX: 0,
                maskY: 0,
                bImgX: 0,
                bImgY: 0,
                imgSrc: ''
            },
            imgbox:{},
            elementX: 0,
            elementY: 0,
            isOutside: false,
        }
    },
   
    methods:{
        // 图片放大
        zommIn(){
            var tt = this;
            const img = event.currentTarget.getElementsByTagName('img')[0]
            const offsetWidth = $(".imgBox").width();
            const offsetHeight = $(".imgBox").height();
            const offsetTop = $(".imgBox").offset.top;
            tt.state.zoomImgWidth = offsetWidth * 3
            tt.state.zoomImgHeight = offsetHeight * 3
            tt.state.imgSrc = img.src
            tt.state.boxX = offsetWidth
            tt.state.boxY = offsetTop
            tt.state.isShow = true;
        }
        
        // 图片移动
        ,zoomMove(ev){
            var tt = this;
            const maskWidth = 117, maskHeight = 117
            const offsetWidth = $(".imgBox").width();
            const offsetHeight = $(".imgBox").height();
            //mask到图片左边界和上边界的距离
            let mx = tt.elementX - maskWidth / 2
            let my = tt.elementY - maskHeight / 2
            tt.elementX = event.clientX - $(".imgBox").offset().left;
            tt.elementY = event.clientY - $(".imgBox").offset().top + $(window).scrollTop();
            if (tt.elementX - maskWidth / 2 <= 0) {
                mx = 0
            }
            if (tt.elementX >= offsetWidth - maskWidth / 2) {
                mx = offsetWidth - maskWidth
            }
            if (tt.elementY - maskHeight / 2 <= 0) {
                my = 0
            }
            if (tt.elementY >= offsetHeight - maskWidth / 2) {
                my = offsetHeight - maskHeight
            }
            tt.state.maskX = mx
            tt.state.maskY = my
            tt.state.bImgX = mx * (tt.state.zoomImgWidth - offsetWidth) / (offsetWidth - maskWidth)
            tt.state.bImgY = my * (tt.state.zoomImgWidth - offsetWidth) / (offsetWidth - maskWidth)
        }

        // 图片放大结束
        ,zoomOut(){
            var tt = this;
            tt.state.isShow = false;
        },
    },
    template: `
        <div class="img-zoom-box">
        
            <div class="imgBox" ref="imgbox" @mouseover="zommIn" @mousemove="zoomMove" @mouseout="zoomOut">
                <slot></slot>
                <div class="mask"
                    v-show="state.isShow"
                    :style="{left:state.maskX+'px',top :state.maskY+'px'}">
                </div>
            </div>
            <transition name="fade">
                <div class="zoomBox"
                    v-show="state.isShow"
                    :style="{left:state.boxX +'px',top: state.boxY +'px',}">
                    <img :src="state.imgSrc"
                        :style="{
                            width:state.zoomImgWidth + 'px',
                            height: state.zoomImgHeight + 'px',
                            marginLeft :-state.bImgX + 'px',
                            marginTop : -state.bImgY + 'px'
                        }">
                </div>
            </transition>
        </div>
  `
}













pics.unshift(litpic)

new Vue({
    el:'#GoodInfo',
    data:{
        id:id, //商品id
        userid:userid, //用户id
        activeTab:'first', //默认选中第一个tab
        goodInfo:{
            start_money:0,
            add_money:0,
            count:0,
            enddate:0,
            reg_count:0,
            cur_mon_start:0,
            store:{
                onsale:0,
                sale:0,
            }
        }, //商品信息
        imgList:pics, //商品图片列表,
        activeImgIndex:0, //当前展示的图片索引
        preImgList:[], //上一个图片列表
        imgListPosition:[], //图片列表的位置
        nextImgList:[], //下一个图片列表
        currentState:0, //当前状态
        expandRecord:false, //展开记录
        tabsOn:0, //当前选中的tab
        priceList:[], //出价列表
        totalPage:1 , //总页数
        totalCount:0 , //总数
        currPage:1, //当前页
        isLoadMore:false, //是否加载更多
        storeId:0, //店铺id
        listPage:1, //列表页
        goodList:[], //商品列表
        transLeft:0, //左边距离
        price_keep:0, //出
        currPrice:0, // 当前出价的单价
        num_buy:1, //   购买数量
        currentTime: ((new Date().getTime())/1000), //当前时间戳
        tiemText:'', //倒计时文本
    },
    mounted(){
        var tt = this;
        if(tt.id){
            tt.getGoodInfo(tt.id);
            tt.getGoodPriceList(tt.id)
        }


        $('.is-link').click(function(){
            var t = $(this);
            url = t.closest('.el-breadcrumb__item').attr('data-link')
            window.open(url)
        })
        
    },
    computed:{
        // 转换时间
        transTime(){
            return function(time,type){
                // return new Date(time * 1000).toLocaleString();
                var timeStr = '';
                if(!type){

                    update = new Date(time*1000);//时间戳要乘1000
                    year   = update.getFullYear();
                    month  = (update.getMonth()+1<10)?('0'+(update.getMonth()+1)):(update.getMonth()+1);
                    day    = (update.getDate()<10)?('0'+update.getDate()):(update.getDate());
                    hour   = (update.getHours()<10)?('0'+update.getHours()):(update.getHours());
                    minute = (update.getMinutes()<10)?('0'+update.getMinutes()):(update.getMinutes());
                    second = (update.getSeconds()<10)?('0'+update.getSeconds()):(update.getSeconds());
                    timeStr = year+'年'+month+'月'+day+'日 '+hour+':'+minute+':'+second
                }else{
                    timeStr = huoniao.transTimes(time, 2);
                }
                
                return timeStr;
            }
        },

        // 计算当前价格
        countCurrPrice(){
            return function(start,add,count){
                var tt = this;
                var currPrice = parseFloat((start + add * count).toFixed(2));
                return currPrice;
            }
        },

        returnHumanTime() {
            return function(t, type){
                var n = new Date().getTime() / 1000;
                var c = n - t;
                var str = '';
                if (c < 60) {
                    str = '刚刚';
                } else if (c < 3600) {
                    str = parseInt(c / 60) + '分钟前';
                } else if (c < 86400) {
                    str = parseInt(c / 3600) + '小时前';
                } else if (c < 604800) {
                    str = parseInt(c / 86400) + '天前';
                } else {
                    str = huoniao.transTimes(t, type);
                }
                return str;
            }
        },

        // 倒计时
        showDownTime(){
            // return function(time,type){
            //     var tt = this;
            //     return tt.countDown(time,type);
            // }
        }
    },
    components:{
        'imgzoom':imgzoom,
    },
    methods:{
       
        // 获取商品详情
        getGoodInfo(id){
            var tt = this;
            $.ajax({
                url:'/include/ajax.php?service=paimai&action=detail',
                data:{'id':id},
                type:'post',
                dataType:'jsonp',
                success:function(data){
                    if(data.state == 100){
                        tt.goodInfo = data.info;
                        // tt.imgList = data.info.picsUrl.unshift(data.info.litpicUrl);
                        tt.storeId = tt.goodInfo.store.id
                        tt.price_keep = tt.goodInfo.cur_mon_start * tt.goodInfo.u_reg;
                        tt.currPrice = tt.goodInfo.cur_mon_start ;
                        tt.num_buy = tt.goodInfo.u_reg;
                        tt.getDataList(tt.storeId);
                        if(data.info.u_reg > 0 && data.info.startdate < tt.currentTime){
                            tt.currentState = 1;    //已报名
                        }else{
                            tt.currentState = 0;   //未报名
                        }

                        if(data.info.arcrank == 3 || data.info.enddate < new Date().getTime() / 1000){
                            tt.currentState = 3;   //已结束
                        }
                        var currentTime = new Date().getTime() / 1000;
                        if(data.info.u_pai > 0){
                            tt.currentState = 2;   //可竞价
                            
                            if((data.info.enddate * 1 + data.info.pay_limit * 3600) < currentTime){
                                tt.currentState = 4;   //违约
                            } 
                        }

                        
                        // if(data.info.arcrank == 4 && data.info.u_pai > 0){
                        //     tt.currentState = -1;   //支付成功
                        // }


                        if(tt.goodInfo.u_success_num > 0 && tt.goodInfo.u_reg_state == 5){
                            tt.currentState = -1;   //支付成功
                        }
                        if(tt.goodInfo.u_success_num > 0 && tt.goodInfo.u_reg_state != 5){
                            if((data.info.enddate * 1 + data.info.pay_limit * 3600) < currentTime){
                                tt.currentState = 4;   //违约
                            } 
                        }
                        // tt.currentState = data.info.arcrank;
                        // console.log(tt.goodInfo)
                        console.log(tt.goodInfo.startdate<tt.currentTime)

                    }
                }
            })
        },


        // 刷新商品 价格
        getNewPrice(){
            var tt = this;
            tt.getGoodInfo(tt.id)
        },

        //获取url参数
        getUrlParam(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
            var r = window.location.search.substr(1).match(reg);  //匹配目标参数
            if (r != null) return unescape(r[2]); return null; //返回参数值
        },

        // 获取图片索引
        handleActiveImg(index){
            var tt = this;
            tt.activeImgIndex = index;
        },


        // 商品出价列表
        getGoodPriceList(id){
            var tt = this;
            if(tt.isLoadMore) return false;
            isLoadMore = true;
            $.ajax({
                url:'/include/ajax.php?service=paimai&action=prList&pageSize=10&page='+tt.currPage,
                data:{'id':id},
                type:'post',
                dataType:'jsonp',
                success:function(data){
                    if(data.state == 100){
                        isLoadMore = false;
                        tt.priceList = data.info.list.map(function(item){
                            item.date = huoniao.transTimes(item.date,1);
                            return item;
                        });
                        
                        tt.totalPage = data.info.pageInfo.totalPage;
                        tt.totalCount = data.info.pageInfo.totalCount;
                        if(tt.currPage >= tt.totalPage){
                            tt.isLoadMore = true;
                        }
                    }else{
                        tt.isLoadMore = false;
                    }
                }
            })
        },

        // 获取数据
        getDataList:function(storeid){
            var tt = this;
            var page =  tt.listPage;
            $.ajax({
                url: '/include/ajax.php?service=paimai&action=getList&orderby=4&page='+page+'&pageSize=20&storeid='+storeid,
                data:tt.searchForm,
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    if(data.state == 100){
                        tt.goodList = tt.goodList.concat(data.info.list);
                        page ++ ;
                        if(page > data.info.pageInfo.totalPage ){
                            tt.isload = true;
                        }
                        tt.listPage = page;
                    }
                },
                error: function () { }
            });
        },

        // 跳转url
        targetTo(url){
            var userid = $.cookie(cookiePre + "login_user");
            if (userid != null && userid != "") {
                window.location.href = (url);
            }else{
                window.location.href = masterDomain + '/login.html';
                return false;
            }
            
        },

      


        // 竞拍
        pai(){
            var tt = this;
            var userid = $.cookie(cookiePre + "login_user");
            if (userid == null && userid == "") {
                window.location.href = masterDomain + '/login.html';
                return false;
            }

            $.ajax({
                url:'/include/ajax.php?service=paimai&action=pai',
                data:{'id':tt.id,'money':tt.price_keep},
                type:'post',
                dataType:'jsonp',
                success:function(data){
                    if(data.state == 100){
                        alert(data.info);
                        tt.goodInfo.cur_mon_start = tt.price_keep / tt.goodInfo.u_reg;
                        location.reload()
                    }else{
                        alert(data.info)
                    }
                },
                error:function(){
                }
            })
        },

        // 倒计时
        countDown(endtime){
            var tt = this;
            var currTime = new Date().getTime() / 1000;
            var time = 0;
            time = endtime - currTime;
            if(time > 0){
                var day = Math.floor(time / (60 * 60 * 24));
                var hour = Math.floor((time - day * 60 * 60 * 24) / (60 * 60));
                var minute = Math.floor((time - day * 60 * 60 * 24 - hour * 60 * 60) / 60);
                var second = Math.floor(time - day * 60 * 60 * 24 - hour * 60 * 60 - minute * 60);
                // time = day + '天' + hour + '时' + minute + '分' + second + '秒';
                dayText = day < 10 ? '0' + day : day;
                hourText = hour < 10 ? '0' + hour : hour;
                minuteText = minute < 10 ? '0' + minute : minute;
                secondText = second < 10 ? '0' + second : second;
                if(day > 0) {
                    dayText = '<b>'+dayText+'</b>天';
                }else{
                    dayText = '';
                }
                if(hour <= 0 && day <= 0) {
                    hourText = '';
                }else{
                    hourText = '<b>'+hourText+'</b>时';
                }
               
                minuteText = '<b>'+minuteText+'</b>分';
                secondText = '<b>'+secondText+'</b>秒';
                time = dayText + hourText + minuteText + secondText;
               
            }else{
                time = '已结束';
            }
            tt.tiemText = time;
        },

        handleChange(e){
            console.log(111)
        },
        handleCurrentChange(val) {
            var tt = this;
            tt.currPage = val;
            tt.getGoodPriceList(tt.id);
        },

        
    },

    watch:{
        tabsOn:function(val){
            var tt = this;
            var left = 0;
            if(val == 0){
                left = 0
            }else{
                left = 108;
            }
            tt.transLeft = left;
        },
        goodInfo:function(val){
            var interval = null;
            var tt = this;
            if(val.startdate >= this.currentTime){
                interval = setInterval(function(){
                    tt.countDown(val.startdate)
                },1000)
            }else if(val.enddate > this.currentTime){
                interval = setInterval(function(){
                    tt.countDown(val.enddate)
                },1000)
            }else{
                clearInterval(interval);
            }

    
        },

        currPrice:function(val){
            var tt = this;
            tt.price_keep = val * tt.goodInfo.u_reg;
            console.log(tt.price_keep)
        }
    }
})