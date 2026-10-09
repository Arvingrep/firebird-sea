var cityChosePage = new Vue({
    el:'#cityChosePage',
    data:{
         /* **************城市选择******************** */ 
        cityList:[], //所有城市
        cityChoseArr:[], //选择城市的id,名称  {id:'',typename:'',pid:''}
        cityChoseObjArr:[], //选择城市的id,名称
        showCityPage:false, //显示一级城市
        currTabShow:0, //当前选择显示的tab
        cityLevel:'',//城市显示的层级
        showPop:false,
        endChoseCity:[], //id存放
        successCallBack:'', //成功之后执行
        noLimit:noLimit === '1' ? true : false, 
        allcityList:[], //没有处理过的城市
        hasChecked:false, //是否处理过endChoseCity
    },
    mounted(){
        var tt = this;
         // 获取城市
        tt.getCityList()
    },
    methods:{
        
        // 获取城市
        getCityList(id,callback){
            var url = '/include/ajax.php?service=siteConfig&action=area' ; //城市分站
            var tt = this;
            var idStr = id ? '&type=' + id : ''
            $.ajax({
                url: url + idStr,
                type: "POST",
                dataType: "json",
                async:false,
                success: function (data) {
                    if(data.state == 100){
                        if (data.info.length > 0 && !id) {  //加载一级城市
                            var szmArr = []; //首字母
                            var hotArr = []; //热门城市
                            var cityArr = [];
                            tt.allcityList = data.info;
                            data.info.forEach(function (city) {
                                if (szmArr.indexOf(city.pinyin.substr(0, 1).toUpperCase()) <= -1) {
                                    szmArr.push(city.pinyin.substr(0, 1).toUpperCase());
                                    cityArr.push({
                                        key: city.pinyin.substr(0, 1).toUpperCase(),
                                        arr: [city]
                                    })
                                } else {
                                    cityArr[szmArr.indexOf(city.pinyin.substr(0, 1).toUpperCase())]['arr'].push(city)
                                }

                                if (city.hot == '1') {
                                    hotArr.push(city)
                                }
                            });

                            szmArr.sort();
                            var sortArr = cityArr.sort(function(a,b){
                                return szmArr.indexOf(a.key) - szmArr.indexOf(b.key);
                            })
                            if(hotArr.length > 0){
                                sortArr.unshift({
                                    key:'hot',
                                    arr:hotArr
                                })
                            }
                            tt.cityList = sortArr;
                        }
                        if(callback){ //回调方法
                            callback(data.info);
                        }
                    }
                },
                error: function () { 

                }
            });
    
    
        },
  
        // 点击右侧字母
        go_szm(ind) {
            var el = event.currentTarget
            var sct = $('.cityListPage dl').eq(ind).position().top;
            var wh = $('.cityListPage').height();
            var wt = $('.cityListPage').scrollTop();
            var bh = $('.cityListPage .cityList').height();
            console.log(sct + wt)
            $('.cityListPage .cityList').scrollTop(sct + wt);
            $('.cityListPage .jump_szm').html($(el).html()).show();
            var tot = null;
            if (tot) {
                clearTimeout(tot)
            }
            tot = setTimeout(function () {
                $('.cityListPage .jump_szm').hide()
            }, 3000)
        },
  

        choseCity(city,rechose){ //ind表示操作cityChoseArr的索引
            var tt = this;
            if(rechose){
                tt.cityChoseArr = []
                tt.cityChoseObjArr = []
            }
            if( tt.cityChoseArr &&  tt.cityChoseArr.length){  //已经选择过
            var ind = tt.cityChoseArr.findIndex(item => {
                return item.pid == city.parentid
            });
            if(ind > -1){
                tt.cityChoseArr.splice(ind,tt.cityChoseArr.length - ind,{
                id:city.id,
                pid:city.parentid ? city.parentid : 0,
                typename:city.typename
                })
                if(!tt.cityLevel || tt.cityChoseArr.length < tt.cityLevel){
                if(city.lower){
                    tt.cityChoseObjArr.splice(ind,tt.cityChoseObjArr.length - ind,city)
                }
                tt.currTabShow = ind == tt.cityChoseObjArr.length ? ind : ind + 1; //当前正选择的项目
                }
                setTimeout(() => {
                    tt.checkCityTabLine(); //调整红色横线位置
                }, 100);
            }else {
                tt.cityChoseArr.push({
                id:city.id,
                pid:city.parentid ? city.parentid : 0,
                typename:city.typename,
                lng:city.longitude || city.lng,
                lat:city.latitude || city.lat
                });
    
                if(!tt.cityLevel || tt.cityChoseArr.length < tt.cityLevel){
                if(city.lower){
                    tt.cityChoseObjArr.push(city)
                }
                tt.currTabShow = tt.cityChoseObjArr.length ;
                }else{  //层级够了 不需要继续往下层选
                setTimeout(() => {
                    tt.checkCityTabLine(); //调整红色横线位置
                }, 100);
                }
            }
            }else{ //没有选择过城市
            tt.cityChoseArr.push({
                id:city.id,
                pid:city.parentid ? city.parentid : 0,
                typename:city.typename,
                lng:city.longitude || city.lng,
                lat:city.latitude || city.lat
            });
            if(city.lower){
                tt.cityChoseObjArr.push(city)
            }
            tt.currTabShow = tt.cityChoseObjArr.length ;
            }
            if(city.lower && !city.children && (!tt.cityLevel || tt.cityLevel > tt.cityChoseArr.length)){
            tt.getCityList(city.id,function(list){ //获取下一级
                if(list ){
                city['children'] = list;
                var index = tt.cityChoseObjArr.findIndex(item => {
                    return city.id == item.id;
                })
                if(index > -1){
                    tt.cityChoseObjArr[index] = city;
                    tt.$forceUpdate(); //强制更新
                }else{
                    console.log('验证是否有问题')
                }
                }
            })
            }
        },

       // 城市选择tab下的横线位置
        checkCityTabLine(){
            var tt = this;
            var el = $(".cityScroll .tabBox .on_chose");
            if(el.length){
                var left = el.offset().left + el.width()/2 - $(".cityScroll .tabBox s").width()/2;
                $(".cityScroll .tabBox s").css('transform','translateX('+left+'px)');
            }
        },

      // 确定选择当前选中的城市,并且获取城市id
        sureCityChose(){
            var tt = this;
            tt.endChoseCity = tt.cityChoseArr.map(item => {
                return item.id
            })
            tt.showPop = false;
            if(tt.successCallBack){
                tt.successCallBack(tt.cityChoseArr); //成功之后执行的方法
            }
        },

        // 编辑区域地址
        async checkChoseId(id){
            var tt = this;
            for(let i = 0; i < tt.endChoseCity.length; i++){
                if(i == 0){
                    tt.cityChoseArr = [];
                    tt.cityChoseObjArr = [];
                    var firstObj = '';
                    firstObj = tt.allcityList.find(item => {
                        return tt.endChoseCity[i] == item.id
                    })
                    // for(let m = 0; m < tt.cityList.length; m++){
                    //     var item = tt.cityList[m]
                    //     for(let n = 0; n < item.arr.length; n++){
                    //         if(item.arr[n].id == tt.endChoseCity[i]){
                    //             firstObj =  item.arr[n];
                    //             break;
                    //         }
                    //     }
                    //     if(firstObj){
                    //         break;
                    //     }
                    // }
                    if(firstObj){
                        tt.cityChoseArr.push({id:firstObj.id,typename:firstObj.typename,pid:0,lng:firstObj.longitude,lat:firstObj.latitude})
                        tt.cityChoseObjArr.push(firstObj)
                    }
                }
                
                if((i + 1) < tt.endChoseCity.length){
                    await tt.getCityList(tt.endChoseCity[i],function(list){
                        tt.cityChoseObjArr[i]['children'] = list;
                        tt.$forceUpdate(); //强制更新
                        for(let n = 0; n < list.length; n++){
                            if(list[n].id == tt.endChoseCity[i + 1] ){
                                tt.cityChoseArr[i + 1] ={id:list[n].id,typename:list[n].typename,pid:list[n].parentid,lng:list[i].longitude,lat:list[i].latitude};
                                if((i + 1) <  (tt.endChoseCity.length - 1)){
                                    tt.cityChoseObjArr[i + 1] = list[n];
                                }
                                // tt.cityLevel = tt.cityChoseArr.length;
                                setTimeout(() => {
                                    tt.checkCityTabLine()
                                }, 100);
                                break;
                            }
                        }
                    });
                }

                // if(i == (tt.endChoseCity.length - 1)){
                //     var list  = tt.cityChoseObjArr[tt.cityChoseObjArr.length - 1]
                //     if(list.lower && list.lower > 0 && !list.children){
                //         tt.getCityList(list.id,function(dlist){
                //             tt.cityChoseObjArr[tt.cityChoseObjArr.length - 1]['children'] = dlist;
                //         })
                //     }
                // }
                
            }
        },


        // 选上一级（不限）
        choseLastType(clist,ind){
            var tt = this;
            if(tt.cityChoseArr[ind + 1]){
                tt.cityChoseArr.splice(ind+1,1);
            }
            if((ind == tt.cityChoseObjArr.length - 2 ) && clist.children){
                tt.cityChoseObjArr.splice(tt.cityChoseObjArr.length -1,1);
                tt.currTabShow = ind + 1;
            }else{
                setTimeout(() => {
                    tt.checkCityTabLine()
                }, 100);
            }
        },
        
    },

    watch:{
         // 城市tab显示
        currTabShow(val){
            var tt = this;
            if(val === 0){
                tt.showCityPage = true;
            }else{
                tt.showCityPage = false;
            }
            setTimeout(() => {
                tt.checkCityTabLine()
            }, 100);
        },
        endChoseCity:function(val){
            var tt = this;
            if(val && tt.showPop && !tt.hasChecked){
                tt.hasChecked = true;
                var arrInd = val.findIndex(item => {
                    var ind = tt.allcityList.findIndex(city =>{
                        return item == city.id;
                    })

                    return ind > -1
                })
                if(arrInd >= 1){
                    tt.endChoseCity.splice(arrInd - 1,1);
                }
                tt.currTabShow = tt.endChoseCity.length - 1;
                tt.checkChoseId()
            }
        },

        showPop(val){
            var tt = this;
            if(!val){
                tt.hasChecked = false;
            }
        },

    
        
    }
})