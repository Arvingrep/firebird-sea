var ajaxIng = null;
var init = 0;
toggleDragRefresh('off');
var pageVue = new Vue({
    el:'#page',
    data:{
        jobAddrList:[], //地址列表
        delArr:[], //要删除的地址
        onManage:false,
        com:com, //是否设置为公司地址
        form:{
            addrid:'', //区域ID
            address:'', //详细地址
            id:id,
            lng:'',
            lat:'',
            setCompany:com ? com : 0,
            addrName:[], //区域中文
        },
        canSet:false, //是否可以设置
        contentText:'', //粘贴的内容
        textCount:0, //计数
        detailInfo:{},

        // 地图相关
        lng:'', //坐标
        lat:'', 
        surroundingPois:[], //周边数据
        addWorkPosi:false,
        isload:false, //是否正在加载
        loadEnd:false, //加载结束
        cityid:cityid, //城市分站
        city:city,
        showSearch:false, //显示搜索页
        searchList:[], //搜索列表数据
        newAddr:{
            addrid:'', //区域ID
            address:'', //详细地址
            lng:'',
            lat:'',
            addrName:[], //区域中文
            addrid_list:[], 
        },
        addridArr:[], //区域地址id
        addrname:[],
        currInd:'', //默认选中
        addrArr:[],
        district:'',
    },
    mounted:function(){
        const that = this;
        let infoData = localStorage.getItem('infoData')
        if(infoData){
            infoData = JSON.parse(infoData)
            for(let i = 0; i < infoData.length; i++){
                if(that.form[infoData[i].name] != undefined){
                    that.form[infoData[i].name] = infoData[i].value
                }
            }
            localStorage.removeItem('infoData')
        }else if(id){
            that.getAddrList('query',id)
        }else{
            that.initAddr()
        }
        
    },
    methods:{
        // 初始化加载地点
        initAddr(){
            const that = this;
            HN_Location.init(function (data) {
                if (data == undefined || (data.address == "" && data.name == "") || data.lat == "" || data.lng == "") {
                    console.log('定位失败，请刷新页面');
                    // that.drawMap()
                } else {
                    var name = data.name == '' ? data.address : data.name;
                    that.lng = data.lng;
                    that.lat = data.lat;
                    // that.city = data.city;
                    posiCity = data.city;
                    if (that.city == '') {
                        that.city = posiCity;
                    }
                    that.addrArr = data.city + ' ' + data.district

                    var province = '',city = '',district = '',town  = '';
                    if( data.province){
                        province = data.province.replace('省','').replace('市',''); // 省,直辖市
                    }
                    
                    if(data.city){
                        city = data.city.replace('市',''); // 市
                    }
                    
                    if(data.district){
                        district = data.district.replace('区','').replace(city,'');
                    }
                    
                    if(data.town){
                        town= data.town.replace('镇','').replace('街道','');
                    }

                    if(province || city || district || town){
                        that.calcAddrid(province,city,district,town)
                    }else{

                        that.calcAddrid(province , city, district , town)
                    }

                }
            });
        },



        // 跳转自定义
        toMapDefine(){
            const that = this;
            let dataArr = []
            for(let item in that.form){
                dataArr.push({
                    'name':item,
                    'value':that.form[item]
                })
            }
            dataArr.push({
                'name':'district',
                'value': JSON.stringify(that.district)
            })
            dataArr.push({
                'name':'returnUrl',
                'value': window.location.href
            })
            
            localStorage.setItem('infoData', JSON.stringify(dataArr));
        },
        getAddrList(type,id,ind){
            const that = this;
            let paramStr = ''
            if(type == 'all'){
                paramStr = '&method=all&company_addr=1'
            }else if(type == 'del'){
                paramStr='&method=del&id=' +  id
            }else if(type == 'query'){
                paramStr='&method=query&id=' +  id

            }else if(type = 'save'){
                let action = id == 0 ? 'add':'update'
                paramStr='&method='+action+'&id=' +  id
                console.log()
            }
            $.ajax({
				url: '/include/ajax.php?service=job&action=op_address' + paramStr ,
				type: "POST",
                data:(type == 'save' ? that.form : ''),
				dataType: "json",
				success: function (data) {
					if(data.state == 100){
						if(type == 'all'){
							that.jobAddrList = data.info;
						}else if(type == 'del'){
                            that.jobAddrList.splice(ind,1)
                        }else if(type == 'query'){
                            that.detailInfo = data.info[0];
                            for(let item in that.form){
                                if(item == 'setCompany'){
                                    that.form[item] = data.info[0]['type'] === 1 ? 1 : ''
                                    that.canSet = data.info[0]['type'] === 1 ? false : true;
                                }else{
                                    that.form[item] = data.info[0][item]
                                }
                            }
                        }else if(type == 'save'){
                            showErrAlert('保存成功');
                            setTimeout(() => {
                                location.href = masterDomain + '/supplier/job/jobaddrmange.html'
                            }, 1500);
                        }

					}else{
                        showErrAlert(data.info)
					}
				},
				error: function () { 

				}
			});
        },

        delAddr(item,ind){
            const that = this;

            let options = {
                title: '确认删除该地址?',    // 提示标题
                isShow:true,
                btnSure: item.count_use ? '确认删除': '删除',
                btnColor:'#F21818',
                btnCancelColor:'#000',
                popClass:'myConfirmPop'
            }

            if(item.count_use > 0){
                options['title'] = '该地址有'+item.count_use+'条职位信息正在使用<br/>请谨慎删除';
                options['confirmTip'] = '删除地址后请及时修改相关职位工作地址'
            }
            confirmPop(options,function(){
                that.getAddrList('del',item.id,ind)
            })
        },

        inputAddr(){
            const that = this
            const el = event.currentTarget;
            let text = $(el).text();
            that.textCount = text.length;
        },

        // 清空
        clearText(){
            const that = this;
            const el = event.currentTarget;
            $('#spot').html('');
            let text = $('#spot').text();
            that.textCount = 0;
            console.log(that.textCount)
        },


        // 识别
        spotSure(){
            const that = this;

            var t = $(event.currentTarget);
            if (t.hasClass("disabled")) return false;
            var tht = $('#spot').html();
            t.addClass("disabled").html("识别中"); //提交中
            $.ajax({
                url: "/include/ajax.php?service=siteConfig&action=getAddress&address=" + tht,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if (data && data.state == 100) {
                        that.form.addrid = data.info.addrid;
                        that.form.address = data.info.detail;
                        that.form.lng = data.info.lng;
                        that.form.lat = data.info.lat;
                        that.form.addrName = data.info.addrname.split(' ');
                    } else {
                        var popOptions = {
                            btnCancel: '确定',
                            title: data.info,
                            btnColor: '#222',
                            noSure: true,
                            isShow: true
                        }
                        confirmPop(popOptions);

                    }
                    t.removeClass("disabled").html('识别');
                },
                error: function () {
                    var popOptions = {
                        btnCancel: '确定',
                        title: langData['siteConfig'][20][183],
                        btnColor: '#222',
                        noSure: true,
                        isShow: true
                    }
                    confirmPop(popOptions);
                    t.removeClass("disabled").html('识别');
                }
            });
        },

        // 隐藏弹窗
        hideAddPosiPop(){
            const that = this;
            that.addWorkPosi = false;
        },


        checkAddress(){
            const that = this;
            const ind = that.jobAddrList.findIndex(item => {
                return item.id == that.formData.job_addr_id;
            });
            return ind > -1 ? that.jobAddrList[ind].address : '';
        },

        // 确定选择
        confirmAddr(){
            const that = this;
            for(let item in that.newAddr){
                that.form[item] = that.newAddr[item]
            }
            that.hideAddPosiPop();
        },

        // 搜索关键字
        searchKey(){
            const that = this;
            const el = event.currentTarget;
            const directory = $(el).val();
            that.getList(directory)
        },

        // 显示搜索页
        showSearchPage(){
            const that = this;
            that.showSearch = true;
        },

        // 隐藏搜索页
        hideSearchPage(){
            const that = this;
            var el = event.currentTarget;
            if(!$(el).val()){
                that.showSearch = false; 
            }

        },

        // 搜索列表
        getList(directory) {
            var tt = this;
            if (ajaxIng) {
                ajaxIng.abort();
            }
            directory = directory.replace(/\s*/g, "");
            if (tt.isload) return false;
            tt.isload = true;
            tt.loading = true;

            console.log(directory)
            ajaxIng = $.ajax({
                // url: '/include/ajax.php?service=siteConfig&action=get114ConveniencePoiList&pageSize=20&page='+page+'&lng='+tt.lng+'&lat='+tt.lat+'&directory='+directory+'&radius='+radius+"&pagetoken="+pagetoken,
                url: '/include/ajax.php?action=getMapSuggestion&cityid=' + tt.cityid + '&lat=' + tt.lat + '&lng=' + tt.lng + '&query=' + directory + '&region=' + tt.city + '&service=siteConfig',
                dataType: 'json',
                success: function (data) {
                    tt.isload = false;
                    tt.loading = false;
                    if (data.state == 100) {
                        tt.loadEnd = true;
                        totalPage = 1;
                        // totalCount = data.info.totalCount;
                        // pagetoken = data.info.pagetoken == '' || data.info.pagetoken == null ? '' : data.info.pagetoken;
                        var list = data.info;

                        if (list.length > 0) {
                            if (page == 1) {
                                tt.searchList = list;
                            } else {
                                tt.searchList = [...tt.searchList, ...list];
                            }
                            page++;
                            if (page > totalPage) {
                                isload = true;
                            }
                        } else if (page == 1) {
                            tt.searchList = [];
                        } else {
                            page++;
                            tt.loading = false;
                            tt.loadEnd = true;
                        }

                    } else {
                        tt.loading = false;
                        tt.loadEnd = true;
                        tt.isload = false;
                        tt.searchList = [];
                    }
                },
                error: function () {
                    tt.isload = false;
                    tt.loading = false;
                    //showErr(langData['circle'][2][32]);  /* 网络错误，加载失败！*/
                }
            });
        },


        // 选择定位
        chosePosi(item,type,ind){
            const that =  this;
            that.currInd = ind;
            let point = {};
            if(!type){
                
                that.newAddr['address'] = item.address;
                that.newAddr['lng'] = item['lng'];
                that.newAddr['lat'] = item['lat'];
                point['lng'] = item['lng'];
                point['lat'] = item['lat'];

            }else{
                
                that.newAddr['address'] = item.address;
                that.newAddr['lng'] = item.point['lng'];
                that.newAddr['lat'] = item.point['lat'];
                point['lng'] = item.point['lng'];
                point['lat'] = item.point['lat'];
            }
            HN_Location.lnglatGetTown(point,function(data){
                var province = '',city = '',district = '',town  = '';
                if( data.province){
                    province = data.province.replace('省','').replace('市',''); // 省,直辖市
                }
                
                if(data.city){
                    city = data.city.replace('市',''); // 市
                }
                
                if(data.district){
                    district = data.district.replace('区','').replace(city,'');
                }
                
                if(data.town){
                    town= data.town.replace('镇','').replace('街道','');
                }

                if(province || city || district || town){
                    that.calcAddrid(province,city,district,town)
                }else{

                    that.calcAddrid(province , city, district , town)
                }
            })
        },

        calcAddrid(myprovince,mycity,mydistrict,town){
            const that = this;
            var cityArr = [myprovince,mycity,mydistrict,town]
            if(myprovince == mycity){
                cityArr = [myprovince,mydistrict,town]
            }
            that.addridArr = [];
            that.addrname = [];
            that.checkCityid(cityArr,0);
        },

        // 获取城市id
        checkCityid(strArr,type){
            const that = this;
            var id = 0;
            switch(type){
                case 0 : 
                    id = 0;
                    break;
                case 1 : 
                    id = pid;
                    break;
                case 2 : 
                    id = cid;
                    break;
                case 3 : 
                    id = did;
                    break;
            }
            var typeStr = '&type='+id;

            $.ajax({
                url: "/include/ajax.php?service=siteConfig&action=area" + typeStr,
                type: "POST",
                dataType: "jsonp",
                success: function(data){
                    if(data && data.state == 100){
                        var city = data.info;
                        for(var i=0; i<city.length; i++){
                            if(city[i].typename == strArr[type] || (city[i].typename == strArr[type] + '区') ||  (city[i].typename == strArr[type] + '省') ||  (city[i].typename == strArr[type] + '市') ||  (city[i].typename == strArr[type] + '镇') ){
                                switch(type){
                                    case 0 : 
                                        pid = city[i].id;
                                        break;
                                    case 1 : 
                                        cid = city[i].id;
                                        break;
                                    case 2 : 
                                        did = city[i].id;
                                        break;
                                    case 3 : 
                                        tid = city[i].id;
                                        break;
                                }
                                type++;
                                that.addridArr.push(city[i].id)
                                that.addrname.push(city[i].typename)
                                if(type < strArr.length - 1){
                                    that.checkCityid(strArr,type)
                                }else{
                                    that.newAddr['addrid_list'] = that.addridArr;
                                    that.newAddr['addrid'] = that.addridArr[that.addridArr.length - 1];
                                    that.newAddr['addrName'] = that.addrname;
                                    if(!that.addWorkPosi){
                                        that.form.addrid = that.addridArr[that.addridArr.length - 1];
                                        that.form.addrName = that.addrname;
                                    }
                                }
                            }
                        }
                    }
                }

            })

        },


        // 地图汇总
        drawMap(data) {
            var tt = this;
            var lnglat = '';
            if (data) {
                lnglat = [data.lng, data.lat]
            }
            if (site_map == 'baidu') {
                tt.draw_baidu(lnglat)
            } else if (site_map == 'google') {
                tt.draw_google(lnglat)
            } else if (site_map == 'amap') {
                tt.draw_Amap(lnglat)
            }else if(site_map == 'tmap'){

            }

        },

        // 百度地图
        draw_baidu(lnglat) {
            var that = this;
            map = new BMap.Map("mapdiv");
            if (that.city != city && !lnglat) {
                map.centerAndZoom(that.city, 18);
                setTimeout(function () {
                    lnglat = map.getCenter();
                    that.lng = lnglat.lng;
                    that.lat = lnglat.lat;
                    var mPoint = new BMap.Point(lnglat.lng, lnglat.lat);

                    console.log(mPoint)
                    that.getLocation(mPoint);
                }, 500)
            } else {
                var mPoint = new BMap.Point(lnglat[0], lnglat[1]);
                map.centerAndZoom(mPoint, 18);
                that.getLocation(mPoint);
            }
            $('.mapCenter').addClass('animateOn');
            setTimeout(function () {
                $('.mapCenter').removeClass('animateOn');
            }, 600)
            map.addEventListener("dragend", function (e) {
                $('.mapCenter').addClass('animateOn');
                setTimeout(function () {
                    $('.mapCenter').removeClass('animateOn');
                }, 600)
                that.lng = e.point.lng
                that.lat = e.point.lat
                that.getLocation(e.point);
            });
            $(".loadImg").hide()
        },

        // 百度获取周边
        getLocation(point) {
            var that = this;
            that.loadEnd = false;
            if (site_map == 'baidu') {
                var myGeo = new BMap.Geocoder();
                myGeo.getLocation(point, function mCallback(rs) {
                    var allPois = rs.surroundingPois;
                    var district = {
                        point:rs.point,
                        title: rs.addressComponents.district,
                        address:rs.addressComponents.city +' '+ rs.addressComponents.district,
                        noDistance:true,
                      }
                    that.district = district
                    that.surroundingPois = [...rs.surroundingPois];
                    that.loadEnd = true;
                    var reg1 = rs.addressComponents.city;
                    var reg2 = rs.addressComponents.district;
                    var reg3 = rs.addressComponents.province;
                    that.$nextTick(() => {
                        that.chosePosi(that.surroundingPois[0],1,0); //默认选中第一个
                    })
                }, {
                    poiRadius: 5000, //半径一公里
                    numPois: 50
                });

            } //百度地图


        },

        // 改变工作地址
        changeAddr() {
            var tt = this;
            cityChosePage.showPop = true;
            cityChosePage.endChoseCity = tt.newAddr['addrid_list'];
            // cityChosePage.cityLevel = 2; 城市层级
            cityChosePage.currTabShow = tt.newAddr.addrid_list.length - 1;
            cityChosePage.successCallBack = function (data) {
                // 地址选择点击完成之后
                tt.newAddr.addrid_list = data.map(item => {
                    return item.id
                })
                tt.newAddr.addrName = data.map(item => {
                    return item.typename
                })
                tt.newAddr.addrid = tt.newAddr.addrid_list[tt.newAddr.addrid_list.length - 1];
                tt.form.addrid = tt.newAddr.addrid
                tt.form.addrName = tt.newAddr.addrName
            };
        },
    },

    watch:{
        addWorkPosi:function(val){
            const that = this;
            if((!that.lng || !that.lat) && val){
                HN_Location.init(function (data) {
                    if (data == undefined || (data.address == "" && data.name == "") || data.lat == "" || data.lng == "") {
                        console.log('定位失败，请刷新页面');
                        that.drawMap()
                    } else {
                        var name = data.name == '' ? data.address : data.name;
                        that.lng = data.lng;
                        that.lat = data.lat;
                        // that.city = data.city;
                        posiCity = data.city;
                        if (that.city == '') {
                            that.city = posiCity;
                        }
                        that.addrArr = data.city + ' ' + data.district

                        // 生成地图
                        that.drawMap(data)

                    }
                });
            }else{
                let lnglat = {
                    lng:that.lng,
                    lat:that.lat
                }
                that.drawMap(lnglat)
            }
            
        },

        'addrName':function(val){
            console.log(val)
        }
    }
})