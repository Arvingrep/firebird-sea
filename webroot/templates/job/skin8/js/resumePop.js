

var map ,  point,myIcon,marker,myGeo;
var map_default_lng = $("#lng").val() ? $("#lng").val() : 0;  //定位
var map_default_lat = $("#lat").val()? $("#lat").val() : 0;
var city = $("#city").val();
var addr = $("#addr").val();
var pid,cid,did,tid;
var autocomplete;
mapPop = new Vue({
    el:'#public_mapContainer',
    data:{
        mapAreaText:[] , //城市区域
        mapArea:[], //区域id
        mapAreaObj:'',
        areaEnd:false,
        currMarker:'', //当前标记所在的点
        keyInp:false, //正在输入中文
        addrDeatil:'',
        mapChose:'',
        showPop:false, //显示弹出层
        showAddress:false, //编辑地址时的显示
        count_use:0, //地址关联的职位
        hasLoad:false,
        autoChangeAddress:false,
        currPosiInfo:'', //当前定位
        btn_disabled:true, //地图确认按钮是否禁用
        editAddrObj:'', //当前编辑的地址
        chineseInp:false, //中文输入
        // 地址选择的属性配置
		options:[],
		props:{
			lazy:true,
			value:'id',
			label:'typename',
			lazyLoad(node, resolve){
                const { level } = node;
                // console.log(node)
                var url = "/include/ajax.php?service=siteConfig&action=area&type=" + (node && node.data ? node.data.id : '');
                    var tt =this;
                    axios({
                        method: 'post',
                        url: url,
                    })
                    .then((response)=>{
                        var data = response.data;
                        var array = data.info.map(function(item){
                            var leaf = item.lower ?   '' : 'leaf:true'
                            return {
                                id: item.id,
                                typename: item.typename,
                                lower: item.lower,
                                leaf,
                            }
                        })
                        resolve(array)
                    })
                    .finally(() => {
                        // mapPop.$refs.cascaderAddr.computePresentText()
                    });
				
			},
		},

        // 弹窗
        confirmPop:false, //显示or隐藏
        confirmPopInfo:{
            icon:'error',
            title:'企业资料保存成功',
            tip:'继续完善信息可优化企业形象、提升招聘效果！',
            btngroups:[
                {
                    
                    tit:'继续完善资料',
                    fn:'',
                    type:'primary'
                },
                {
                    tit:'直接发布职位',
                    fn:'',
                    type:'primary',
                },
                {
                    tit:'预览主页',
                    fn:'',
                }
            ]
        },

        // 黑框提示
        showErrTip:false,
        showErrTipText:'',
        showErrTipTit:'',
        showErrTipdefine:'',

        // 白框提示
        successTip:false,
        successTipText:'',
        successTipConfig:{
            icon:'',
            type:'', //提示类型
        },

        // 面试弹窗，
        formPop:false, //显示邀请面试弹窗
        changeResumeAddr:false, //是否正在修改地址
        inviteDate:'', //邀请面试的时日期
        inviteTime:'', //邀请面试的时间
        invitHour:[
            {
                hourText:'上午6点',
                value:6
            },
            {
                hourText:'上午7点',
                value:7
            },
            {
                hourText:'上午8点',
                value:8
            },
            {
                hourText:'上午9点',
                value:9
            },
            {
                hourText:'上午10点',
                value:10
            },
            {
                hourText:'上午11点',
                value:11
            },
            {
                hourText:'上午12点',
                value:12
            },
            {
                hourText:'上午13点',
                value:13
            },
            {
                hourText:'上午14点',
                value:14
            },
            {
                hourText:'上午15点',
                value:15
            },
            {
                hourText:'上午16点',
                value:16
            },
            {
                hourText:'上午17点',
                value:17
            },
            {
                hourText:'上午18点',
                value:18
            },
            {
                hourText:'上午19点',
                value:19
            },
            {
                hourText:'上午20点',
                value:20
            },
        ], //面试时间刻度
        invitMinutes:[
            {
                minuteText:'00分',
                value:0
            },
            {
                minuteText:'10分',
                value:10
            },
            {
                minuteText:'20分',
                value:20
            },
            {
                minuteText:'30分',
                value:30
            },
            {
                minuteText:'40分',
                value:40
            },
            {
                minuteText:'50分',
                value:50
            },
        ],
        inviselHour:'',
        inviselMinute:'',
        inviselHourText:'',
        resumeForm:{
            keywords:'', //职位搜索关键字
            dateTime:'',    //邀请面试的时间
            postInfo:'',  //当前职位信息
            remark:'', //标注
            job_addr_id:'', //地址选择
            name:contactName, //面试人
            phone:contactPhone, //面试人

        },
        job_addr_id_pre:'',
        jobAddrList:[], //工作地址列表
        currResume:'', //当前邀请的简历相关信息
        postArr:[], // 职位列表
        searchPost:[],

        pickerOptions: {
            disabledDate: (time) => {
                let nowData = new Date()
                let maxTime= +new Date() + 2592000000*2
                nowData = new Date(nowData.setDate(nowData.getDate() - 1));
                return nowData >= time||time >= maxTime
            },
            selectableRange:'6:00:00-20:00:00'
        },


        // 刷新置顶弹窗
        popularPop:false, //是否显示
        weekdays:[{ id:6, 'name':'周六' },{ id:7, 'name':'周日' },{ id:1, 'name':'周一' },{ id:2, 'name':'周二' },{ id:3, 'name':'周三' },{ id:4, 'name':'周四' },{ id:5, 'name':'周五' }],  //不置顶日期
        timesArr:[{ value:'.5', unit:'30分钟'},{ value:'1', unit:'1小时'},{ value:'2', unit:'2小时'},{ value:'3', unit:'3小时' }],  //刷新时间
        minTime:'', //最小时间
        placeholderTime:'', //最小时间显示
        showOther:false, //显示其他选项
        allLeftRefresh:10, //剩余刷新次数
        toTopForm:{
            toTop:false, //置顶Or刷新,
            /*********置顶相关*********/ 
            topDays:'', //置顶天数，
            topDayChose:'1', //选择的置顶天数
            topTime:true, //置顶周一到周五
            noTopArr:[],

            /***********刷新相关************/ 
            timeRefresh:'',     //刷新时间 填
            timeRefreshChose:'.5', //刷新时间 选择
            startTime:'',
            endTime:'',
            refreshDate:'', //刷新的日期
            idArr:[], //批量刷新置顶的id
            couting:false, //正在获取数据

            // 接口返回的数据
            amount:0, //随时变
            refreshTimes:0, //刷新次数
        },


        // 刷新置顶增值包购买
        popularAddPop:false,
        popularTab:[],
        popularType:0, //1.组合包，2.职位包，3.简历包，4.置顶包，5.刷新包, 默认显示的
        singleType:4, //置顶4或者上架职位2
        currPopularTab:0, //0是单项 1是增值  2是好友助力
        noSingle:0, //1--没有单项购买 
        popularTip:'请购买或选择增值包' , //购买提示
        packageList:[],
        addPackage:[
            {
                id:1,
                tit:'超值优享包',
                desc:'全面组合 精准补充',
                conArr:[]
            },
            {
                id:2,
                tit:'上架职位',
                desc:'企业招聘职位',
                conArr:[]
            },
            {
                id:3,
                tit:'简历下载',
                desc:'捕获更多人才',
                conArr:[]
            },
            {
                id:4,
                tit:'职位置顶',
                desc:'置顶位流量飞升',
                conArr:[]
            },
            {
                id:5,
                tit:'职位刷新',
                desc:'持续稳定爆光',
                conArr:[]
            },
        ],
        chosePopularItem:'', //当前选择的增值包
        singleForm:{
            toTop:true, //置顶or刷新
            topDays:'', //自定义置顶天数
            topDaysChose:'', //选择的天数
            offPost:0, //上架职位数
            payCount:0, //支付金额
            paySrc:'', //支付url
        },
        businessInfo:'', //商家信息
        allTopDay:0,
        allRefreshDay:0,

        // 开通套餐提示
        buyMeadlPop:false, //开通套餐弹窗


        // 下载简历弹窗
        downResumePop:false, //显示弹窗
        downResumeDetail:'', //要下载的简历信息

        // 邮箱绑定
        addEmailPop:false,
        emailCheckSuccess:false,


    
        refreshData:'',  // 智能刷新的数据
        
        topData:'',   //计划置顶的相关数据
        currDate: parseInt(new Date().valueOf() / 1000),

        payObj:'', //单项购买时的付款信息


        // 批量上架弹窗
        plupPostPop:false,
        long_valid:0, //是否长期有效
        validDate:'',//有效期
        upPostItemArr:[], //批量操作的项目

        // 温馨提示
        warnTipPop:false,//温馨提示弹窗
        warnTipCallBack:'', //回调方法
        // 通过本地保存弹出的弹窗
        locationb:false,
        // 增值包/招聘套餐弹窗
        mealState:0,
        // 招聘套餐列表
        comboList:[],
        pageAll:-1,
        currentPage:1,
        currentValue:0,
        purLoading:false //购买简历按钮的loading
    },
    mounted(){
        var tt = this;
        // if(showMap == '1' || showMap == '3'){
        //     if(site_map == 'baidu'){

        //         autocomplete = new BMap.Autocomplete({
        //             input: "address_detail",
        //             location: $("#city").val()
        //         });
        //         autocomplete.addEventListener('onconfirm',function(e){
        //             let value = e.item.value;
        //             autocomplete.setInputValue(value.business);
        //         })
        //     }
        // }
        
        
        // 增值包购买切换
        $('.popularAddConBox .tabBox li').click(function(){
            var t = $(this),ind = t.index();
            t.addClass('on_chose').siblings('li').removeClass('on_chose');
            $('.popularAddConBox .tabConBox .tabCon').eq(ind).removeClass('fn-hide').siblings().addClass('fn-hide');
        });

        // 获取一下商家信息
        tt.getBusinessInfo();
        // 获取职位列表
        tt.getStorePost();
        
        // 获取招聘套餐列表
        $.ajax({
            url: '/include/ajax.php?',
            data: {
                service:'job',
                action:'comboList'
            },
            dataType: 'jsonp',
            timeout: 5000,
            success:(res)=>{
                this.comboList=res.info.list;
                this.pageAll=res.info.list.length-3;
            }
        });
    },

    methods:{
        invisel(state,item){ //面试时间选择数据保存
            if(state){ //时
                if(this.inviselHourText&&this.inviselMinuteText){
                    this.inviselMinute='';
                    this.inviselMinuteText='';
                    $('.detailTime input').val('');
                };
                this.inviselHour=item.value;
                this.inviselHourText=item.hourText;
                this.inviteTime=(new Date()).setHours(this.inviselHour,this.inviselMinute);
                if(this.inviselHourText&&this.inviselMinuteText){
                    let value=this.inviselHourText?this.inviselHourText.replace('点',':')+this.inviselMinuteText.replace('分',''):'';
                    $('.detailTime input').val(value);
                    $('.form_datePiceker .detailTime div').css({'transform':'scaleY(0)'});
                };
            }else{ //分
                if(this.inviselHourText&&this.inviselMinuteText){
                    this.inviselHour='';
                    this.inviselHourText='';
                    $('.detailTime input').val('');
                };
                this.inviselMinute=item.value;
                this.inviselMinuteText=item.minuteText;
                this.inviteTime=(new Date()).setHours(this.inviselHour,this.inviselMinute);
                if(this.inviselHourText&&this.inviselMinuteText){
                    let value=this.inviselHourText?this.inviselHourText.replace('点',':')+this.inviselMinuteText.replace('分',''):'';
                    $('.detailTime input').val(value);
                    $('.form_datePiceker .detailTime div').css({'transform':'scaleY(0)'});
                };
            }
        },
        invitimePick(){
            $('.form_datePiceker .detailTime div').css({'transform':'scale(1)'});
            $(document).one('click',function(){
                $('.form_datePiceker .detailTime div').css({'transform':'scaleY(0)'});
            });
        },
        // 招聘套餐滑动切换
        swiper(e){
            if(e==0){ //左滑
                if(this.currentPage!=1){
                    --this.currentPage;
                    $('.popularAddPop .tabCon_add .setMeal ul').css({
                        'transform':`translateX(${-301*this.currentPage+301}px)`
                    });
                    this.currentValue=301*this.currentPage;
                }
            }else{ //右滑
                if(this.currentPage<=this.pageAll){
                    $('.popularAddPop .tabCon_add .setMeal ul').css({
                        'transform':`translateX(${-301*this.currentPage}px)`
                    });
                    this.currentPage++;
                }
            }
        },
        // 购买招聘套餐
        selMeal(index){
            $('.popularAddPop .tabCon_add .setMeal ul li').eq(index).addClass('active').siblings().removeClass();
        },
        purchaseFn(id){
            let data={
                type:1,
                comboid:id
            };
            $.ajax({
				url: '/include/ajax.php?service=job&action=pay'  ,
				type: "POST",
                data:data,
				dataType: "jsonp",
				success: function (data) {

                    if(data.state == 100){
                        var info= data.info;      
                        cutDown = setInterval(function () {
                            $(".payCutDown").html(payCutDown(info.timeout));
                        }, 1000)
                        
                        var datainfo = [];
                        for (var k in info) {
                            datainfo.push(k + '=' + info[k]);
                        }
                        $("#amout").text(info.order_amount);
                        $('.payMask').show();
                        $('.payPop').show();
                        if (usermoney * 1 < info.order_amount * 1) {
                            $("#moneyinfo").text('余额不足，');
                        }else{
                            $("#moneyinfo").text('剩余');

                        }

                        if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
                            $("#bonusinfo").text('额度不足，可用');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        }else if( bonus * 1 < info.order_amount * 1){
                            $("#bonusinfo").text('余额不足，');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        }else{
                            $("#bonusinfo").text('');
                            $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
                        }
                        ordernum  = info.ordernum;
                        order_amount = info.order_amount;
                        $("#ordertype").val('');
                        $("#service").val('job');
                        service = 'job';
                        var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
                        $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
                        callBack_fun_success=function(){
                            mapPop.showErrTip = true;
                            mapPop.showErrTipTit = '购买成功！';
                            setTimeout(() => {
                                location.reload();
                            }, 1000);
                        }
                    }
				},
				error: function (data) { 
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
            });
        },
        //切换套餐/增值包
        changeMealFn(state){
            const that =this;
            that.mealState = state
            if(state==0){ //招聘套餐    

            }else{ //增值包
                that.showAddPop(1);
            }
        },

        setValue(area){
			var tt = this;
			let cs = tt.$refs.cascaderAddr;  
            if(cs && cs.panel){

                cs.panel.activePath=[];  
                cs.panel.loadCount = 0;  
                cs.panel.lazyLoad();
            }
		},

        // // 编辑/删除地址确认
        // editAddressConfirmPop(){
        //     var tt = this;
        //     if(tt.count_use){
        //         tt.confirmPop = true;
        //         tt.confirmPopInfo = {
        //             icon:'error',
        //             title:'该地址有'+tt.count_use+'条职位信息正在使用，请谨慎修改',
        //             tip:'<p style="color:#666;">修改后将同步到全部相关职位</p>',
                
        //             btngroups:[
        //                 {
        //                     tit:'取消',
        //                     cls:'btn_mid_140',
        //                     fn:function(){
        //                         tt.confirmPop = true;
        //                     },
        //                     type:''
        //                 },
        //                 {
        //                     tit: '继续修改',
        //                     cls:'btn_mid_140',
        //                     fn:function(){
        //                         tt.showAddress = false;
        //                     },
        //                     type:'primary',
        //                 },
                        
        //             ]
        //         }
        //     }else{
        //         tt.showAddress = false;
        //     }
        // },


        // // 删除地址
		// showConfirmDel(item){
		// 	var tt = this;
		// 	var confirmTit = item.count_use ? '该地址有'+item.count_use+'条职位信息正在使用，请谨慎删除' : '确认删除该地址';
		// 	var confirmTip = item.count_use ? '删除地址后请及时修改相关职位的工作地址' : '地址删除后，可重新添加'
		// 	mapPop.confirmPop = true;
		// 	mapPop.confirmPopInfo = {
		// 		icon:'error',
		// 		title:confirmTit,
		// 		tip:confirmTip,
		// 		btngroups:[
		// 			{
		// 				tit:'取消',
        //                 cls:'btn_mid_140',
		// 				fn:function(){
		// 					mapPop.confirmPop = false;
		// 				},
		// 				type:'取消删除'
		// 			},
		// 			{
		// 				tit:'确定删除',
        //                 cls:'btn_mid_140',
		// 				fn:function(){
        //                     // if(item && page){
        //                     //     page.addJobAddress(item,'del')
        //                     // }
		// 				},
		// 				type:'primary',
		// 			},
					
		// 		]
		// 	};
		// },

        // addJobAddress(item,type){
		// 	var tt = this;
		// 	var paramArr = [];
		// 	if(type == 'add' || type == 'update'){
		// 		paramArr.push('addrid=' + item.addrid)
		// 		paramArr.push('address=' + item.address)
		// 		paramArr.push('lng=' + item.lng)
		// 		paramArr.push('lat=' + item.lat)
		// 	}
		// 	if(type != 'add' && type != 'all'){
		// 		paramArr.push('id=' + item.id)
		// 	}
		// 	$.ajax({
		// 		url: '/include/ajax.php?service=job&action=op_address&'+ paramArr.join('&')+'&method='+type ,
		// 		type: "POST",
		// 		dataType: "jsonp",
		// 		success: function (data) {
		// 			if(data.state == 100){
		// 				if(type == 'all'){
		// 					tt.jobAddrList = data.info;
		// 				}else if(type == 'del'){
		// 					mapPop.successTip = true;
		// 					mapPop.successTipText = data.info;
		// 					tt.addJobAddress('','all')
		// 				}else{

		// 					tt.addJobAddress('','all')
		// 				}
		// 			}else{
		// 				if(type == 'all'){
		// 					tt.jobAddrList = []
		// 				}
		// 			}
		// 		},
		// 		error: function () { 

		// 		}
		// 	});
		// },



        getArea(id,check,ind){
			var url = "/include/ajax.php?service=siteConfig&action=area&type=" + id;
			var tt =this;
            if(check){
                tt.areaEnd = false;
            }
			axios({
				method: 'post',
				url: url,
			})
			.then((response)=>{
				var data = response.data;
                if(!check){
                    var array = data.info.map(function(item){
                        return {
                            id: item.id,
                            typename: item.typename,
                            lower: item.lower,
                        }
                    })
                    tt.options = array;
                    if(tt.mapArea && tt.mapArea.length){
                        tt.areaEnd = true;
                        tt.setValue();
                    }
                }else{
                    for(var i = 0; i <data.info.length; i++){
                        var typename = data.info[i].typename.replace('省','').replace('市','').replace('区','')                        
                        if(typename == tt.mapAreaText[ind].typename){
                            tt.mapAreaText[ind].id = data.info[i].id;
                            ind ++ ;
                            if(ind < tt.mapAreaText.length){
                                tt.getArea(data.info[i].id,1,ind);
                            }
                            if( !tt.mapArea){
                                tt.mapArea = []
                            }
                            tt.mapArea.push(data.info[i].id);
                            if(ind == tt.mapAreaText.length -1){
                                tt.areaEnd = true;
                            }
                            if(tt.mapArea.length == tt.mapAreaText.length){
                                tt.setValue();
                            }
                            break;
                        }
                    }
                }
			});
	
		},
        // 画地图
        drawMap(){
            var tt = this
            if(site_map == 'baidu'){
                tt.drawMap_baidu();
            }else if(site_map == 'amap'){
                tt.drawMap_amap();
            }else if(site_map == 'google'){
                tt.drawMap_google();
            }else if(site_map == 'tmap'){
                tt.$nextTick(() => {
                    tt.drawMap_tmap();
                })
            }

            tt.$nextTick(() => {
                if(!autocomplete){ //首次初始化
                    tt.initAutoCompelete()
                }
            })
        },
        // 重新定位
        rePosi(){
            var tt = this;
            if(site_map == 'baidu'){
                tt.getSuggestion()
            }
        },

        // 百度地图
		drawMap_baidu(){
            var tt = this;
            map = new BMap.Map("map", {enableMapClick: false});
            point = new BMap.Point(map_default_lng, map_default_lat);
            setTimeout(function(){
                map.centerAndZoom(point, 13);
            }, 500);
            myIcon = new BMap.Icon("/static/images/supplier/mark_ditu.png?v=1", new BMap.Size(48, 48), {anchor: new BMap.Size(24,48)});
            marker = new BMap.Marker(point, {icon: myIcon});  //自定义标注
            tt.currMarker = point;
            myGeo  = new BMap.Geocoder();
            //如果经、纬度都为0则设置城市名为中心点
            if(map_default_lng == 0 && map_default_lat == 0){
                //根据地址解析
                if(city && city != ""){
                    var address = city;
                    if(addr != "") address = addr;
                    myGeo.getPoint(address, function(address){
                        //如果解析成功
                        if(address){
                            tt.setMark(address, 0);

                            $("#lng").val(address.lng);
                            $("#lat").val(address.lat);

                            myGeo.getLocation(address, function(rs){
                                var addComp = rs.addressComponents;
                                var surroundingPois = rs.surroundingPois;
                                var addr = addComp.street + addComp.streetNumber;
                                var tit = "";
                                if(surroundingPois.length > 0){
                                    if(addComp.street == "" || addComp.streetNumber == ""){
                                        addr = surroundingPois[0]['address'];
                                    }
                                    tit = surroundingPois[0]['title'];
                                }
                                $("#addr").val(addr + tit);
                                // tt.mapAreaObj = addComp;
                            }, {
                                poiRadius: 1000,  //半径一公里
                                numPois: 1
                            });

                        //不成功则以城市为中心点
                        }else{
                            myGeo.getPoint(city, function(address){
                                //如果解析成功
                                if(address){
                                    tt.setMark(address, 0);

                                    $("#lng").val(address.lng);
                                    $("#lat").val(address.lat);

                                    myGeo.getLocation(address, function(rs){
                                        var addComp = rs.addressComponents;
                                        var surroundingPois = rs.surroundingPois;
                                        var addr = addComp.street + addComp.streetNumber;
                                        var tit = "";
                                        if(surroundingPois.length > 0){
                                            if(addComp.street == "" || addComp.streetNumber == ""){
                                                addr = surroundingPois[0]['address'];
                                            }
                                            tit = surroundingPois[0]['title'];
                                        }
                                        // tt.mapAreaObj = addComp;
                                        $("#addr").val(addr + tit);
                                    }, {
                                        poiRadius: 1000,  //半径一公里
                                        numPois: 1
                                    });

                                    //不成功则以城市为中心点
                                }else{
                                    tt.setMark(city, 1);
                                }
                            }, city);
                        }
                    }, city);

                //如果城市为空，则浏览器定位当前位置
                }else{
                    var geolocation = new BMap.Geolocation();
                    geolocation.getCurrentPosition(function(r){
                        if(this.getStatus() == BMAP_STATUS_SUCCESS){
                            tt.setMark(r.point, 0);

                            $("#lng").val(r.point.lng);
                            $("#lat").val(r.point.lat);

                            myGeo.getLocation(r.point, function(rs){
                                var addComp = rs.addressComponents;
                                var surroundingPois = rs.surroundingPois;
                                var addr = addComp.street + addComp.streetNumber;
                                var tit = "";
                                if(surroundingPois.length > 0){
                                    if(addComp.street == "" || addComp.streetNumber == ""){
                                        addr = surroundingPois[0]['address'];
                                    }
                                    tit = surroundingPois[0]['title'];
                                }
                                
                                $("#addr").val(addr + tit);
                                // tt.mapAreaObj = addComp;
                                
                            }, {
                                poiRadius: 1000,  //半径一公里
                                numPois: 1
                            });

                        }
                        else {
                            alert('failed'+this.getStatus());
                        }
                    },{enableHighAccuracy: true})
                }

            }else{
                marker = new BMap.Marker(point, {icon: myIcon});  //自定义标注
                tt.currMarker = point
                map.addOverlay(marker);
                marker.enableDragging();
                tt.listener(map,marker);

                myGeo.getLocation(point, function(rs){
                    var addComp = rs.addressComponents;
                    var surroundingPois = rs.surroundingPois;
                    var addr = addComp.street + addComp.streetNumber;
                    var tit = "";
                    if(surroundingPois.length > 0){
                        if(addComp.street == "" || addComp.streetNumber == ""){
                            addr = surroundingPois[0]['address'];
                        }
                        tit = surroundingPois[0]['title'];
                    }
                    tt.mapAreaObj = addComp;
                    $("#addr").val(addr + tit);
                }, {
                    poiRadius: 1000,  //半径一公里
                    numPois: 1
                });
            }
            
            map.enableScrollWheelZoom();
            map.enableKeyboard();
            map.addControl(new BMap.NavigationControl({anchor: BMAP_ANCHOR_BOTTOM_RIGHT, type: BMAP_NAVIGATION_CONTROL_ZOOM}));
    
		},

         // 高德地图
        drawMap_amap(){
            const that = this;
            if(map_default_lng == 0 && map_default_lat == 0){
                map_default_lng = city_lng;
                map_default_lat = city_lat;
            }
            map = new AMap.Map("map", {
                viewMode: '2D', //默认使用 2D 模式
                zoom: 16, //地图级别
                center: [map_default_lng, map_default_lat], //地图中心点
            });
        
            // 构造点标记
            marker = new AMap.Marker({
                content: "<div class=\"self_icon amap_icon\"><img src=\"/static/images/supplier/mark_ditu.png?v=1\" /></div>",
                position: [Number(map_default_lng), Number(map_default_lat)],
                map:map,
                draggable:true, //是否可拖拽
            });
            map.setFitView(marker);
            that.currMarker = {lng:Number(map_default_lng),lat:Number(map_default_lat)}
            
            that.listener()
        },

        // 谷歌地图
        async drawMap_google(){
            const that = this;
            if(map_default_lng == 0 && map_default_lat == 0){
                map_default_lng = city_lng;
                map_default_lat = city_lat;
            }
            let lng = +map_default_lng;
            let lat = +map_default_lat;
            const { Map } = await google.maps.importLibrary("maps");
            map = new Map(document.getElementById("map"), {
                center: { lat: lat, lng: lng },
                zoom: 14,
                disableDefaultUI:true
            });

            that.google_drawMarker(lng,lat)

            
            that.listener()
            
        },
        google_drawMarker(lng,lat){
            const that = this;
            var image = {
                url: masterDomain + '/static/images/supplier/mark_ditu.png?v=1',
                size: new google.maps.Size(48, 48),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(24, 48),
                scaledSize: new google.maps.Size(48, 48)
            };
            marker = new google.maps.Marker({
                position: { lat: lat, lng: lng },
                map,
                draggable:true,
                // animation:google.maps.Animation.BOUNCE,
                icon: image,
            });
            marker.setMap(map);
        },

        // 天地图
        drawMap_tmap(){
            const that = this;
            map = new T.Map('map',{ projection: 'EPSG:4326'});
            if(map_default_lng == 0 && map_default_lat == 0){
                map_default_lng = city_lng;
                map_default_lat = city_lat;
            }
            let lng = + map_default_lng;
            let lat = + map_default_lat;
            let center = new T.LngLat(lng, lat)
            map.centerAndZoom(center, 14);


            var icon = new T.Icon({
                iconUrl: "/static/images/supplier/mark_ditu.png?v=1",
                iconSize: new T.Point(48, 48),
                iconAnchor: new T.Point(24, 48)
            });
            marker = new T.Marker(center, {icon: icon,draggable:true});
            map.addOverLay(marker);
            that.currMarker = {lng:Number(map_default_lng),lat:Number(map_default_lat)}
            map.enableDrag()
            that.listener()

            var config = {
                pageCapacity: 10,	//每页显示的数量
                onSearchComplete: that.tmap_search	//接收数据的回调函数
            };
            //创建搜索对象
            localsearch = new T.LocalSearch(map, config);
        },

        //设置中心点并添加标注
		setMark(address, type){
            var tt = this;

            if(site_map == 'baidu'){
                map.clearOverlays();
                map.setCenter(address);
                if(type == 0){
                    point = new BMap.Point(address.lng, address.lat);
                    marker = new BMap.Marker(point, {icon: myIcon});  //自定义标注
                }
                tt.currMarker = point;
                map.addOverlay(marker);
                marker.enableDragging();
                tt.listener();

			}else if(site_map == 'amap'){
                if(marker){
                    map.remove(marker);
                }
                map.setCenter(address);
                // 构造点标记
                marker = new AMap.Marker({
                    content: "<div class=\"self_icon amap_icon\"><img src=\"/static/images/supplier/mark_ditu.png?v=1\" /></div>",
                    position: [Number(address.lng), Number(address.lat)],
                    map:map,
                    draggable:true, //是否可拖拽
                });
                map.setFitView(marker);
                tt.currMarker = {lng:Number(address.lng),lat:Number(address.lat)}
                tt.listener()
            }else if(site_map == 'tmap'){
                if(marker){
                    map.removeOverLay(marker);
                }
                let center = new T.LngLat(address.lng, address.lat)
                map.centerAndZoom(center)
                var icon = new T.Icon({
                    iconUrl: "/static/images/supplier/mark_ditu.png?v=1",
                    iconSize: new T.Point(48, 48),
                    iconAnchor: new T.Point(24, 48)
                });
                marker = new T.Marker(center, {icon: icon,draggable:true});
                tt.currMarker = {lng:Number(address.lng),lat:Number(address.lat)}
                tt.listener()
            }

		},

		//监听事件
		listener(){
            var tt = this;
			// //点击
            // if(!map) return false;
			// map.addEventListener("click", function(e){
			// 	marker.setPosition(e.point);
            //     tt.currMarker = e.point;
			// 	$("#lng").val(e.point.lng);
			// 	$("#lat").val(e.point.lat);
			// 	myGeo.getLocation(e.point, function(rs){
			// 		var addComp = rs.addressComponents;
			// 		var surroundingPois = rs.surroundingPois;
			// 		var addr = addComp.street + addComp.streetNumber;
			// 		var tit = "";
			// 		if(surroundingPois.length > 0){
			// 			if(addComp.street == "" || addComp.streetNumber == ""){
			// 				addr = surroundingPois[0]['address'];
			// 			}
			// 			tit = surroundingPois[0]['title'];
			// 		}
			// 		tt.mapAreaObj = addComp;
			// 		$("#addr").val(addr + tit);
            //         tt.addrDeatil = addr + tit
            //         tt.btn_disabled = false;
				
			// 	}, {
			// 		poiRadius: 1000,  //半径一公里
			// 		numPois: 1
			// 	});
			// });

			// //拖动
			// marker.addEventListener("dragend", function(e){
			// 	$("#lng").val(e.point.lng);
			// 	$("#lat").val(e.point.lat);
            //     tt.currMarker = e.point
            //     marker.setPosition(e.point);
			// 	myGeo.getLocation(e.point, function(rs){
			// 		var addComp = rs.addressComponents;
			// 		var surroundingPois = rs.surroundingPois;
			// 		var addr = addComp.street + addComp.streetNumber;
			// 		var tit = "";
			// 		if(surroundingPois.length > 0){
			// 			if(addComp.street == "" || addComp.streetNumber == ""){
			// 				addr = surroundingPois[0]['address'];
			// 			}
			// 			tit = surroundingPois[0]['title'];
			// 		}
			// 		//parWinAddrs.text(addComp.city+'/'+addComp.district)
			// 		//addrArr.val(addComp.city+' '+addComp.district)
            //         tt.mapAreaObj = addComp;
            //         tt.addrDeatil = addr + tit;

            //         tt.btn_disabled = false;


			// 	}, {
			// 		poiRadius: 1000,  //半径一公里
			// 		numPois: 1
			// 	});
			// });

            if(site_map == 'baidu'){
                map.addEventListener("click", function(e){
                    marker.setPosition(e.point);
                    tt.currMarker = e.point;
                    $("#lng").val(e.point.lng);
                    $("#lat").val(e.point.lat);
                    tt.baidu_geocode(e.point);
                });
    
                //拖动
                marker.addEventListener("dragend", function(e){
                    $("#lng").val(e.point.lng);
                    $("#lat").val(e.point.lat);
                    tt.currMarker = e.point
                    marker.setPosition(e.point);
                    tt.baidu_geocode(e.point);
                });

            }else if(site_map == 'amap'){
                // 监听点击
                map.on("click", function(e){
                    marker.setPosition(e.lnglat)
                    tt.currMarker = e.lnglat;
                    $("#lng").val(e.lnglat.lng);
                    $("#lat").val(e.lnglat.lat);
                    tt.amap_geocode(e.lnglat)
                    
                })

                // 监听拖拽
                marker.on("dragend", function(e){
                    marker.setPosition(e.lnglat)
                    tt.currMarker = e.lnglat;
                    $("#lng").val(e.lnglat.lng);
                    $("#lat").val(e.lnglat.lat);

                    tt.amap_geocode(e.lnglat)
                })
            }else if(site_map == 'tmap'){
                map.addEventListener("click",function(e){
                    marker.setLngLat(e.lnglat);
                    $("#lng").val(e.lnglat.lng);
                    $("#lat").val(e.lnglat.lat);
                    tt.tmap_geocoder(e.lnglat)
                });

                marker.addEventListener("dragend",function(e){
                    let point = e.target.getLngLat();
                    $("#lng").val(point.lng);
                    $("#lat").val(point.lat);
                    marker.setLngLat(point);
                    tt.tmap_geocoder(point)

                });
            }else if(site_map == 'google'){
                map.addListener("click",function(e){
                    marker.setMap(null);
                    tt.google_drawMarker(e.latLng.lng(),e.latLng.lat())
                    $("#lng").val(e.latLng.lng());
                    $("#lat").val(e.latLng.lat());
                    tt.google_geocoder(e.latLng)
                })
                marker.addListener("dragend",function(e){
                    let point = marker.position;
                    $("#lng").val(point.lng);
                    $("#lat").val(point.lat);
                    tt.google_geocoder(point)
                });
            }
		},

        // 百度地图逆向解析
        baidu_geocode(lnglat){
            const tt = this;
            myGeo.getLocation(lnglat, function(rs){
                var addComp = rs.addressComponents;
                var surroundingPois = rs.surroundingPois;
                var addr = addComp.street + addComp.streetNumber;
                var tit = "";
                if(surroundingPois.length > 0){
                    if(addComp.street == "" || addComp.streetNumber == ""){
                        addr = surroundingPois[0]['address'];
                    }
                    tit = surroundingPois[0]['title'];
                }
                tt.mapAreaObj = addComp;
                $("#addr").val(addr + tit);
                tt.addrDeatil = addr + tit
                tt.btn_disabled = false;
            
            }, {
                poiRadius: 1000,  //半径一公里
                numPois: 1
            });
        },

        // 高德地图逆向解析坐标
        amap_geocode(lnglat){
            const tt = this;
            console.log(lnglat)
            AMap.plugin(["AMap.Geocoder"], function () {
                geocoder = new AMap.Geocoder({
                    radius: 1000, //以已知坐标为中心点，radius为半径，返回范围内兴趣点和道路信息
                    extensions: "all" //返回地址描述以及附近兴趣点和道路信息，默认“base”
                });
                //返回地理编码结果
                geocoder.on("complete", function(res){
                    if(res.info == 'OK'){
                        let rs =  res.regeocode
                        var addComp = rs.addressComponent;
                        var surroundingPois = rs.pois;
                        var addr = addComp.street + addComp.streetNumber;
                        var tit = "";
                        if(surroundingPois.length > 0){
                            if(addComp.street == "" || addComp.streetNumber == ""){
                                addr = surroundingPois[0]['address'];
                            }
                            tit = surroundingPois[0]['name'];
                        }

                        tt.mapAreaObj = addComp;
                        $("#addr").val(addr + tit);
                        tt.addrDeatil = addr + tit
                        tt.btn_disabled = false;
                    }
                });
                //逆地理编码
                geocoder.getAddress(lnglat);
            })
        },

        // 天地图逆向解析坐标
        tmap_geocoder(lnglat){
            const that = this;
            //创建对象
            let geocode = new T.Geocoder();
            geocode.getLocation(lnglat,that.tmap_searchResult);
        },
        // 天地图搜索结果出来
        tmap_searchResult(result){
            const that = this;
            that.currMarker = {lng:result.location.lon,lat:result.location.lat};
            if(result.getStatus() == 0){
                let rs =  result
                var addComp = rs.addressComponent;
                var addr = addComp.address;

                that.mapAreaObj = {
                    ...addComp,
                    district:addComp.county,
                };
                $("#addr").val(addr);
                that.addrDeatil = addr
                that.btn_disabled = false;
            }
        },


        // 谷歌地图逆向解析坐标
        google_geocoder(latlng,noAddr = false){
            const that = this;
            geocoder = new google.maps.Geocoder();
            geocoder.geocode({"latLng": latlng}, function(results, status) {   
                console.log(results)        
                if (status == google.maps.GeocoderStatus.OK) {
                    
                    let arr = results[0].address_components.filter(item => {
                        return !item.types.includes('postal_code') && !item.types.includes('country') && item.types.includes('political')
                    });
                    let addr_arr = results[0].address_components.filter(item => {
                        return !item.types.includes('postal_code') && !item.types.includes('political')
                    });
                    addr_arr.reverse()
                    let address = '';
                    for(let i = 0; i < addr_arr.length; i++){
                        address = address + addr_arr[i].long_name
                    }
                    arr.reverse()
                    let parr = ['province', 'city', 'district', 'county']
                    let newObj = {}
                    for(let i = 0; i < arr.length; i++){
                        if(parr[i]){
                            newObj[parr[i]] = arr[i].long_name
                        }
                    }

                    newObj['address'] = address;
                    newObj['long_addr'] = results[0].formatted_address;
                
                    that.mapAreaObj = newObj
                    if(address && !noAddr){
                        $("#addr").val(address);
                        that.addrDeatil = address;
                    }
                    that.btn_disabled = false;
                    that.currMarker = {lng:latlng.lng(),lat:latlng.lat()}
                }
            })
        },

        // 回归中心
        moveMap(){
            var tt = this;
            if(site_map == 'baidu'){
                map.setCenter(tt.currMarker);
            }else if(site_map == 'amap'){
                let center = new AMap.LngLat(Number(tt.currMarker.lng), (tt.currMarker.lat))
                map.setCenter(center)
            }else if(site_map == 'tmap'){
                let center = new T.LngLat(Number(tt.currMarker.lng), (tt.currMarker.lat))
                map.centerAndZoom(center,14)
            }else if(site_map == 'google'){
                map.setCenter(tt.currMarker);
            }
        },

        searchAddr(type){
            var tt = this;
            if(type === 1){
                tt.keyInp = true;
            }else if(type === 2){
                tt.keyInp = false;
            }
            if(!tt.keyInp){
                tt.getSuggestion(event.data)
            }
        },
        submitKeywords(type){ //此处的type 未选择推荐搜索
            var tt = this;
            if(event.keyCode == 13 || type == 1){
                tt.getSuggestion($('#address_detail').val())
            }

            if($('#address_detail').val() == ''){
                tt.btn_disabled = true;
            }else{
                tt.btn_disabled = false;
            }
        },


        // 更改值
        changeValue(){
            // 点击地图图标不走这边
            var tt = this;
            tt.addrDeatil = $(event.currentTarget).val();
            tt.getSuggestion()
        },



        // 搜索
        getSuggestion(keyword){
            var tt = this;
            var keyword = $('#address_detail').val();

            tt.addrDeatil = keyword;
            if(site_map == 'baidu'){
                var ls = new BMap.LocalSearch(map);
                ls.setSearchCompleteCallback(function(rs) {
    
                    if (ls.getStatus() == BMAP_STATUS_SUCCESS) {
    
                        var poi = rs.getPoi(0);
                        if (poi) {
                            $("#lng").val(poi.point.lng);
                            $("#lat").val(poi.point.lat);
                            tt.setMark(poi.point, 0);
                            myGeo.getLocation(poi.point, function(rs){
                                var addComp = rs.addressComponents;
                                var surroundingPois = rs.surroundingPois;
                                var addr = addComp.street + addComp.streetNumber;
                                var tit = "";
                                if(surroundingPois.length > 0){
                                    if(addComp.street == "" || addComp.streetNumber == ""){
                                        addr = surroundingPois[0]['address'];
                                    }
                                    tit = surroundingPois[0]['title'];
                                    tt.mapAreaObj = addComp;
                                }
                            }, {
                                    poiRadius: 1000,  //半径一公里
                                    numPois: 1
                            });
    
                        }
                    }
                });
                ls.search(keyword);
            }else if(site_map == 'amap'){
                AMap.service(["AMap.PlaceSearch"], function() {
                    //构造地点查询类
                    var placeSearch = new AMap.PlaceSearch({city:$("#city").val() });
                    //关键字查询
                    placeSearch.search(keyword,function(status, result){
                        if(status == 'complete' && result.info == 'OK'){
                            let addrObj = result.poiList.pois[0];
                            map.setCenter(addrObj.location);
                            marker.setPosition(addrObj.location)
                            tt.currMarker = {
                                lng:addrObj.location.lng,
                                lat:addrObj.location.lat,
                            }
                            tt.amap_geocode(addrObj.location)
                        }
                    });
                });
            }else if(site_map == 'google'){
                if(keyword){
                    tt.searchPlaces(keyword)
                }
                
            }else if(site_map == 'tmap'){
                if(keyword && localsearch){
                    tt.$nextTick(() => {
                        localsearch.search(keyword)
                    })
                }else if(map){
                    tt.moveMap()
                }
            }
        },

        searchPlaces(keyword){
            const that = this;
            var request = {
                query: keyword,
                fields: ['name', 'geometry'],
            };
            
            var service = new google.maps.places.PlacesService(map);
            
            service.findPlaceFromQuery(request, function(results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    let lng = results[0].geometry.location.lng();
                    let lat = results[0].geometry.location.lat();
                    marker.setMap(null);
                    that.google_drawMarker(lng,lat)
                    map.setCenter(results[0].geometry.location);
                    that.google_geocoder(results[0].geometry.location,true)
                }
            });
        },

        // 天地图输入关键字搜索
        tmap_search(result){
           
            const that = this;
            let type = result.getResultType();
            if(type != 10){
                let addrObj = result.pois[0];
                let lnglat = addrObj.lonlat.split(',')
                let center = new T.LngLat(lnglat[0], lnglat[1])
                marker.setLngLat(center);
                map.centerAndZoom(center,14)
                that.tmap_geocoder(center)
            }else{
                // 模糊搜搜
            }

        },

        // 确认选择该地址
        sureAddr(){
            var tt = this;
            tt.addrDeatil = $("#address_detail").val();
            if(!tt.addrDeatil || !tt.currMarker) {
                tt.showErrTip = true;
                tt.showErrTipTit = '请先选择地址！';
                
                return false;
            }
            tt.showPop = false;
            if(tt.mapChose != ''){
                var areaArr = tt.mapAreaText.map(function(val){
                    return val.typename
                })
            }
            tt.mapChose = {
                addrDeatil:tt.addrDeatil,
                currMarker:tt.currMarker,
                mapArea:tt.mapArea,
                mapAreaText:areaArr,
            }
            // 邀请面试在弹窗增加地址时
            if(tt.formPop){

                var obj = {
                    id:0,
                    add:true,
                    lng:tt.currMarker.lng,
                    lat:tt.currMarker.lat,
                    address:tt.addrDeatil,
                    addrid:tt.mapArea ? tt.mapArea[tt.mapArea.length - 1] : 0
                }
                for(var i = 0; i < tt.jobAddrList.length; i++){
                    if(tt.jobAddrList[i].id == 0){
                        tt.jobAddrList.splice(i,1)
                        break;
                    }
                }
                tt.jobAddrList.unshift(obj);
                tt.resumeForm.job_addr_id = 0;
            }

            

        },

        closeMap(){
            let tt=this;
            tt.showPop = false;
            if(!tt.resumeForm.job_addr_id){
                tt.resumeForm.job_addr_id=tt.job_addr_id_pre;
            }
        },
        checkAddr(){
            var tt = this;
            var areaArr = [];
            if(tt.mapArea.length == 0){
                areaArr.push({
                    typename: tt.mapAreaObj.province.replace('省','').replace('市')
                })
                areaArr.push({typename:tt.mapAreaObj.city.replace('市','')})
                areaArr.push({typename:tt.mapAreaObj.district.replace('区','').replace('市','').replace('县','')})
            }
            tt.mapAreaText = areaArr
            tt.getArea(0,1,0)
        },

        // 选择区域
		changeArea(res){
			var tt = this;
			tt.areaArr = res
		},


        // 地图相关
		changeMapArea(res){
			var tt = this;
			var arr= this.$refs.cascaderAddr.getCheckedNodes()[0] ;
            // var areaText = []
            // for(var i = 0; i<arr.length; i++){
            //     areaText.push(arr[i].typename)
            // }
            
            // tt.mapAreaText = areaText.join('/');
            // console.log(arr)
		},
        // 主要是为了回显默认值
        changeMapAreaText(res){
            var tt = this;
            var textArea = tt.mapAreaText.map(function(val){
                return val.typename;
            })
            $(".addridBox input").val(textArea.join('/'));	
		},

        // 确认弹窗点击事件
        btnClick(fn,state){
            var tt = this;
            if(fn){
                fn();
            };
            if(state){return}
            tt.confirmPop = false;
        },


         // 选择不置顶日
        changenoTop(id){
            var tt = this;
            if(tt.toTopForm.noTopArr.indexOf(id) > -1){
                tt.toTopForm.noTopArr.splice(tt.toTopForm.noTopArr.indexOf(id),1)
            }else{
                tt.toTopForm.noTopArr.push(id)
            }
        },


        //  刷新时间选择之后，显示刷新日期
        checkChange(){
            var tt = this;
            var timeRefresh = this.toTopForm.timeRefresh ?  this.toTopForm.timeRefresh : this.toTopForm.timeRefreshChose;
            // 清空结束时间
            tt.toTopForm.endTime = '';
            if(tt.toTopForm.startTime && timeRefresh < 24){
                var hour = tt.toTopForm.startTime.split(':')[0],
                    min = tt.toTopForm.startTime.split(':')[1],
                    add_hour = timeRefresh.split('.')[0]?timeRefresh.split('.')[0] : 0,
                    add_min = timeRefresh.split('.')[1] > 0 ? '0.'+timeRefresh.split('.')[1] : 0;
                    hour = hour * 1 +  add_hour * 1;
                    var min_s = (min == '30' ? .5 : 0) + add_min * 1
                    var hour_s = hour + (min_s == 1 ? 1 : 0);
                    tt.placeholderTime = (hour_s > 9 ? hour_s : '0' + hour_s) + ':' + (min_s == 0.5 ? '30' : '00');
                    min = min_s == 0.5 ? '29' : '59';
                    hour_s = min == '29' ?  hour_s : (hour_s - 1)
                    tt.minTime = (hour_s > 9 ? hour_s : '0' + hour_s) +':'+ min;

            }
        },




        // 验证输入框
        checkInp(type){
            var tt = this;
            var el = event.currentTarget;
            var val = $(el).val();
            var name = $(el).attr('name')
            if(type){
                if(!Number.isInteger(val)){
                    tt.toTopForm[name] = tt.toTopForm[name].replace(/[^0-9]/g, '')
                }
            }else{
                if(isNaN(val)){
                    tt.toTopForm[name] = tt.toTopForm[name].replace(/\.{2,}/g,".")
                }
            }
        },

        inputChange(){
            var tt = this;
            var el = event.currentTarget;
            tt.toTopForm.timeRefreshChose='';
            if($(el).val() == ''){
                tt.toTopForm.timeRefreshChose=.5;
            }
        },

        /*邀请面试 s*/ 
        changeKeywords(){
            var tt = this;
            var keywords = tt.resumeForm.keywords;
            var searchArr = [], arr = [];
            for(var i = 0; i < tt.postArr.length; i++){
                var post = tt.postArr[i]
                if(post['title'].toUpperCase().indexOf(keywords.toUpperCase()) > -1){
                    searchArr.push(post);
                }else{
                    arr.push(post)
                }
            }

            if(searchArr.length){
                tt.searchPost = searchArr.concat(arr)
            }else{
                tt.searchPost = [];
            }

        },
        
        // 选择要邀请的职位
        chosePost(item){
            var tt = this;
            tt.resumeForm.postInfo = item;
            tt.resumeForm.job_addr_id = tt.resumeForm.postInfo.job_addr_detail ? tt.resumeForm.postInfo.job_addr_detail.id : '';
            this.$refs['resumeForm'].doClose();
        },
        getStorePost(){
            var tt = this;
            $.ajax({
				url: '/include/ajax.php?service=job&action=postList&page=1&state=1,3&pageSize=10000&com=1',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					tt.isload = false;
					if(data.state == 100){
                        tt.postArr = data.info.list;
					}
				},
				error: function () { 
					tt.isload = false;
				}
			});
        },

        // 获取工作列表
        getAllAddrList(type){
			var tt = this;
			var paramStr = ''
			if(type == 'all'){
				paramStr = '&method=all&company_addr=1'
			}else if(type == 'add'){
				var obj = {
					id:0,
					add:true,
					lng:tt.mapChose.currMarker.lng,
					lat:tt.mapChose.currMarker.lat,
					address:tt.mapChose.addrDeatil,
					addrid:tt.mapChose.mapArea ? tt.mapChose.mapArea[tt.mapChose.mapArea.length - 1] : 0
				}
				var paramArr = []
				for(var item in obj){
					paramArr.push(item + '=' + obj[item])
				}
				paramStr = '&method=add&' + paramArr.join('&')
			}
			$.ajax({
				url: '/include/ajax.php?service=job&action=op_address' + paramStr ,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){
						if(type == 'all'){
							tt.jobAddrList = data.info;

						}else{
							// 新增地址
							tt.resumeForm.job_addr_id = data.info;
							for(var i = 0; i < tt.jobAddrList.length; i++){
								if(tt.jobAddrList[i].id == 0){
									tt.jobAddrList[i].id = data.info;
									break;
								}
							}
							tt.sendInvitation();

						}

					}else{

					}
				},
				error: function () { 

				}
			});
		},


        // 新增地址
		addNewAddr(){
			var tt = this;
			tt.showPop = true;
		},
        

        // 确认发送邀请
        sendInvitation(){
            var tt = this;
            var paramArr = [];
            if(!tt.resumeForm.dateTime){
                tt.showErrTip = true;
                tt.showErrTipTit = '请选择面试时间';
                return false;
            };
            if(!tt.resumeForm.postInfo){
                tt.showErrTip = true;
                tt.showErrTipTit = '请选择面试的职位';
                return false;
            };
            if(tt.resumeForm.job_addr_id === ''){
                tt.showErrTip = true;
                tt.showErrTipTit = '请选择面试地点';
                return false;
            };
            if(tt.resumeForm.job_addr_id === 0){ //选择的新添加的地址
                tt.getAllAddrList('add'); //新增地址
                return false;
            };
            paramArr.push('pid=' + tt.resumeForm.postInfo.id); //职位id
            paramArr.push('rid=' + tt.currResume.id); //简历id
            paramArr.push('interview_time=' + parseInt(tt.resumeForm.dateTime /1000)); //面试时间
            paramArr.push('name=' + tt.resumeForm.name); //面试人
            paramArr.push('phone=' + tt.resumeForm.phone); //面试人
            paramArr.push('notice=' + tt.resumeForm.remark); //备注
            paramArr.push('place=' + tt.resumeForm.job_addr_id); //地址
            $.ajax({
				url: '/include/ajax.php?service=job&action=invitation'  ,
				type: "POST",
				dataType: "jsonp",
                data:paramArr.join('&'),
				success: function (data) {
					if(data.state == 100){
                        tt.successTip = true;
                        tt.successTipText = '已发送邀请'
                        tt.formPop = false; //关闭弹窗
                        setTimeout(() => {
                            location.reload();
                            
                        }, 220);
                    }else{
                        tt.showErrTip = true;
                        tt.showErrTipTit = data.info;
                    }
				},
				error: function () { 
                    tt.showErrTip = true;
                    tt.showErrTipTit = '网络错误，请稍后重试';
				}
			});
        },
        
        /*邀请面试 e*/ 

        // 获取时间差->
        getTimeOff(type){
            var tt = this;
            var idArr = tt.toTopForm.idArr;
            if(!tt.toTopForm.refreshDate) return false;
            var startTime = tt.toTopForm.startTime, endTime = tt.toTopForm.endTime
            startTime = startTime ? startTime : '00:00';
            endTime = endTime ? endTime : '24:00';

            var jiange = tt.toTopForm.timeRefresh ? tt.toTopForm.timeRefresh : tt.toTopForm.timeRefreshChose;
            if(!jiange) {
                tt.toTopForm.timeRefresh = .5;
                jiange = .5;
            }
            jiange = jiange * 60 //小时转换成分钟
            var dataStrArr = [];
            dataStrArr.push('pid=' + idArr.join(','));
            dataStrArr.push('limit_start=' + startTime);
            dataStrArr.push('limit_end=' + endTime);
            dataStrArr.push('interval=' + jiange);
            
            dataStrArr.push('start_date=' + tt.toTopForm.refreshDate[0]);
            dataStrArr.push('end_date=' + tt.toTopForm.refreshDate[1]);
            tt.toTopForm.couting = true;
            $.ajax({
				url: '/include/ajax.php?service=job&action=countRefreshAmount&refresh_type=2',
				type: "POST",
				dataType: "jsonp",
                data:dataStrArr.join('&'),
				success: function (data) {
                    tt.toTopForm.couting = false;
                    if(data.state == 100){
                        tt.toTopForm.amount = data.info.amount;
                        tt.toTopForm.refreshTimes = data.info.count;
                    }

				},
				error: function (data) { 
                    tt.toTopForm.couting = false;

                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});
        },

        // 获取置顶相关信息
        changeTopDay(){
            var tt = this;
            var allTopDay = Number(tt.businessInfo.combo_top) + Number(tt.businessInfo.package_top); //一共可置顶的
            var topDay = tt.toTopForm.topDays ? tt.toTopForm.topDays : tt.toTopForm.topDayChose ;
            tt.toTopForm.amount = allTopDay > topDay ? 0 : parseFloat(((topDay - allTopDay) * topDays_fee).toFixed(2))
        },

        // 立即刷新/立即置顶
        payRefreshPop(){
            var tt = this;
            var dataStrArr = []; //需要传的参数
            var idArr = tt.toTopForm.idArr;
            dataStrArr.push('pid=' + idArr.join(','));
            var optType = 0;  //操作类型  1是置顶  2是智能刷新
            if(!tt.toTopForm.toTop){ //刷新
                optType = 5
                if(!tt.toTopForm.refreshDate) return false;
                var startTime = tt.toTopForm.startTime, endTime = tt.toTopForm.endTime
                startTime = startTime ? startTime : '00:00';
                endTime = endTime ? endTime : '24:00';
    
                var jiange = tt.toTopForm.timeRefresh ? tt.toTopForm.timeRefresh : tt.toTopForm.timeRefreshChose; //刷新间隔
                if(!jiange) {
                    tt.toTopForm.timeRefresh = .5;
                    jiange = .5;
                }
                jiange = jiange * 60 //小时转换成分钟
                dataStrArr.push('limit_start=' + startTime);
                dataStrArr.push('limit_end=' + endTime);
                dataStrArr.push('interval=' + jiange);
                dataStrArr.push('refresh_type=2');
                
                dataStrArr.push('start_date=' + tt.toTopForm.refreshDate[0]);
                dataStrArr.push('end_date=' + tt.toTopForm.refreshDate[1]);
                dataStrArr.push('type=5');  //职位刷新
            }else{
                // dataStrArr.push('refresh_type=1');
                optType = 4;
                var days = tt.toTopForm.topDays ? tt.toTopForm.topDays : tt.toTopForm.topDayChose; //置顶天数
                dataStrArr.push('top_date=' + days); 
                dataStrArr.push('noTopDay=' + tt.toTopForm.noTopArr.join(',')); 
                dataStrArr.push('type=4');  //职位置顶
            }

            tt.showPayPop(dataStrArr,optType); //optType 

        },

        // 调起支付弹窗
        showPayPop(paramArr,type){
            var tt = this;
            $.ajax({
				url: '/include/ajax.php?service=job&action=pay'  ,
				type: "POST",
                data:paramArr.join('&'),
				dataType: "jsonp",
				success: function (data) {
                    if(data.state == 100){
                        var info= data.info;
                        // orderurl = info.orderurl;
                        // if(typeof (info) != 'object' && Number(tt.toTopForm.amount) != 0){
                        //     location.href = info;
                        //     return false;
                        // }
                        if((Number(tt.toTopForm.amount) === 0 && type!=3)||Number(info.order_amount)===0){ //支付金额为0时 刷新页面

                            if(type >= 4){ //刷新或置顶
                                tt.paySuccessCall(data.info)
                            }

                            if(type == 3){ //下载简历
                                tt.downResumeSuccessTip();
                            

                            }


                            return false;

                        }  
                        cutDown = setInterval(function () {
                            $(".payCutDown").html(payCutDown(info.timeout));
                        }, 1000)
                        
                        var datainfo = [];
                        for (var k in info) {
                            datainfo.push(k + '=' + info[k]);
                        }
                        $("#amout").text(info.order_amount);
                        $('.payMask').show();
                        $('.payPop').show();
                        if (usermoney * 1 < info.order_amount * 1) {
                            $("#moneyinfo").text('余额不足，');
                        }else{
                            $("#moneyinfo").text('剩余');

                        }

                        if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
                            $("#bonusinfo").text('额度不足，可用');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        }else if( bonus * 1 < info.order_amount * 1){
                            $("#bonusinfo").text('余额不足，');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        }else{
                            $("#bonusinfo").text('');
                            $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
                        }
                        ordernum  = info.ordernum;
                        order_amount = info.order_amount;
                        $("#ordertype").val('');
                        $("#service").val('job');
                        service = 'job';
                        var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
                        $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
                        callBack_fun_success=function(){
                            mapPop.downResumePop=false;
                            mapPop.confirmPop = true;
                            mapPop.confirmPopInfo = {
                                icon:'success',
                                title:'简历购买成功',
                                // tip:'<p>该职位将在：'+ topDate +'开始置顶</p>',
                                btngroups:[
                                    {
                                        tit:'好的，我知道了',
                                        fn:function(){
                                            mapPop.confirmPop = false;
                                            location.reload()
                                        },
                                        type:''
                                    },
                                    
                                ]
                            };
                        }
                    }
				},
				error: function (data) { 
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});



        },

        // 支付成功之后
        paySuccessCall(data){
            if(data.type == 'top'){
                var topDate = data.top_start; //预计的置顶时间
                var currDate = parseInt(new Date().valueOf()/1000); //当前时间
                if(topDate <= currDate){ //已经开始置顶
                    mapPop.successTip = true;
                    mapPop.successTipText = '置顶成功';
                }else{ //置顶还没开始
                    var topDate = mapPop.timeStrToDate(data.top_start);
                    mapPop.confirmPop = true;
                    mapPop.confirmPopInfo = {
                        icon:'success',
                        title:'设置成功',
                        tip:'<p>该职位将在：'+ topDate +'开始置顶</p>',
                        btngroups:[
                            {
                                tit:'好的，我知道了',
                                fn:function(){
                                    mapPop.confirmPop = false;
                                    window.location.reload()
                                },
                                type:''
                            },
                            
                        ]
                    };

                }
            }else if(data.type == 'refresh'){
                if(data.next2){ //智能刷新
                    var refreshDate = data.next; //预计第一次刷新时间
                    var refreshDate2 = data.next2; //预计第二次刷新时间
                    var currDate = parseInt(new Date().valueOf()/1000); //当前时间
                    var date = refreshDate > currDate ? refreshDate : refreshDate2;
                    var dateText = mapPop.transTimes(date,4);
                    var str = refreshDate > currDate ? '该职位将在：'+dateText+' 第一次刷新' : '已刷新第一次，下次刷新时间：' + dateText;
                    mapPop.confirmPop = true;
                    mapPop.confirmPopInfo = {
                        icon:'success',
                        title:'设置成功',
                        tip:'<p>'+str+'</p>',
                        btngroups:[
                            {
                                tit:'好的，我知道了',
                                fn:function(){
                                    mapPop.confirmPop = false;
                                    window.location.reload()
                                },
                                type:''
                            },
                            
                        ]
                    };
                }else{
                    mapPop.successTip = true;
                    mapPop.successTipText = '刷新成功';
                }
            }

        },


        // 点击显示增值包
        showAddPop(type){
            var tt = this;
            if(type==0){
                open(`${masterDomain}/supplier/job/jobmeal.html?tab=1`)
            }else{
                tt.noSingle = 1;
                tt.popularAddPop = true;
                tt.popularType = type;  
                tt.popularTip = '请选择想要购买的增值包';  
                tt.mealState=1;
            }
        },

        toUrl(type){
            if(type == 1){
                window.open(masterDomain + '/supplier/job/company_info.html?tab=2') //跳转联系方式
            }

        },

        /**-------------购买增值包弹窗s-----------------**/ 
        // 获取当前增值包
        getPackageList(type){
            var tt = this;
            $.ajax({
				url: '/include/ajax.php?service=job&action=packageList&type='+type+'&page=1&pageSize=100',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
                    if(data.state == 100){
                        tt.addPackage[type - 1]['conArr'] = data.info.list
                    }
				},
				error: function (data) { 
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});
        },

        // 购买
        buyPackage(item,type){
            var tt = this;
            var typeid = type.id;
            tt.renewFee(item.id,2);

            if(!callBack_fun_success){

                callBack_fun_success = function(){
                    mapPop.successTip = true;
                    mapPop.successTipText = '增值包购买成功！'
    
                    setTimeout(() => {
                        // 刷新页面
                        window.location.reload()
                    }, 2500);
                }

            }
            callBack_fun_fail = function(){
                console.log('关闭弹窗')
                return false;
            }
        },

        renewFee(id,type){  //type  商品类型{1.套餐，2.增值包，3.简历}
            var paramArr = [];
            if(type){  //提交订单
                paramArr.push('type=' + type);
                if(type === 1){
                    paramArr.push('comboid=' + id)
                }else if(type === 2){
                    paramArr.push('packageid=' + id)
                }else if(type === 3){
                    paramArr.push('rid=' + id)
                }
            }
            $.ajax({
				url: '/include/ajax.php?service=job&action=pay'  ,
				type: "POST",
                data:paramArr.join('&'),
				dataType: "jsonp",
				success: function (data) {
                    if(data.state == 100){
                        var info= data.info;
                        orderurl = info.orderurl;
                        if(typeof (info) != 'object'){
                            location.href = info;
                            return false;
                        }
                        
                        cutDown = setInterval(function () {
                            $(".payCutDown").html(payCutDown(info.timeout));
                        }, 1000)
                        
                        var datainfo = [];
                        for (var k in info) {
                            datainfo.push(k + '=' + info[k]);
                        }
                        $("#amout").text(info.order_amount);
                        $('.payMask').show();
                        $('.payPop').show();
                        if (usermoney * 1 < info.order_amount * 1) {
                            $("#moneyinfo").text('余额不足，');
                        }else{
                            $("#moneyinfo").text('剩余');

                        }

                        if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
                            $("#bonusinfo").text('额度不足，可用');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        }else if( bonus * 1 < info.order_amount * 1){
                            $("#bonusinfo").text('余额不足，');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        }else{
                            $("#bonusinfo").text('');
                            $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
                        }
                        ordernum  = info.ordernum;
                        order_amount = info.order_amount;
                        $("#ordertype").val('');
                        $("#service").val('job');
                        service = 'job';
                        var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
                        $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
                    }
				},
				error: function (data) { 
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});

        },

        /**-------------购买增值包弹窗e-----------------**/ 

         // 获取商家详情
        getBusinessInfo(callback){
            var tt = this;
            $.ajax({
				url: '/include/ajax.php?service=job&action=companyDetail&other_param=addr',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
                    if(data.state == 100){
                        tt.businessInfo = data.info;
                        if(callback){
                            callback(data.info)
                        }
                    }
				},
				error: function (data) { 
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});
        },

        // 确定下载简历
        downResumeConfirm(){
            var tt = this;
            var id = tt.downResumeDetail.id;
            tt.purLoading=true;
            const postEmail = tt.businessInfo.email ? '&postEmail=1' : '&onlyBuy=1';
            $.ajax({
				url: '/include/ajax.php?service=job&action=downloadResume&id='+id+postEmail,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
                    tt.purLoading=false;
                    if(data.state == 100){
                        tt.downResumeDetail.name=data.info.name;
                        tt.downResumeDetail.phone=data.info.phone;
                        tt.downResumeSuccessTip();
                        tt.purLoading = false;
                    }else{
                        mapPop.showErrTip = true;
                        mapPop.showErrTipTit = data.info;
                    }
				},
				error: function (data) { 
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});

        },


        // 下载简历成功之后的提示
        downResumeSuccessTip(){
            var tt = this;
            tt.businessInfo.can_resume_down = tt.businessInfo.can_resume_down - 1;
            if(typeof(page) != 'undefined' && page.getResumeList){  //重新加载该页数据
                page.getResumeList()
            }
            tt.downResumePop = false; //隐藏下载弹窗
            var resume_name = tt.downResumeDetail.name;
            var resume_phone = tt.downResumeDetail.phone;
            var resume_sex = tt.downResumeDetail.sex == 0 ? '(先生)':'(女士)';
            // 显示成功提示
            tt.confirmPop = true;
            var tit = tt.businessInfo.email ? '购买成功！简历附件已发送邮箱，立即联系求职者吧':'简历购买成功！立即联系求职者吧'; //提示
            var btnText = !tt.businessInfo.email ? '发送简历至邮箱' : !tt.locationb?'保存简历至本地':'邀请面试';
            let ltit=tt.locationb?'在线聊一聊':'邀请面试';
            var dom = '<div class="rInfo"><h3>'+resume_phone+'</h3><p>'+resume_name + resume_sex+'：联系我时请说是在'+cfg_shortname+'上看到的</p></div>';
            var cls = 'downloadSuccess success2'
            var module='info';
            function invite(){
                // 弹出邀请面试弹窗

                tt.formPop = true;
                tt.currResume = tt.downResumeDetail;
                tt.changeResumeAddr = false;
                // 匹配符合的职位
                var td_index = tt.postArr.findIndex((item) => item.id == tt.currResume.pid);
                if(tt.currResume.delivery && td_index > -1){
                    tt.resumeForm.postInfo = tt.postArr[td_index];
                    tt.resumeForm.job_addr_id = tt.postArr[td_index].job_addr;
                    return false;
                }

                for(var i = 0; i < tt.postArr.length; i++){
                    var jobArr = tt.currResume.job; 
                    if(jobArr && jobArr.length){
                        var index = jobArr.findIndex((it)=> it == tt.postArr[i].id);
                        if(index > -1){
                            tt.resumeForm.postInfo = tt.postArr[i]
                            tt.resumeForm.job_addr_id = tt.postArr[i].job_addr;

                            break;
                        }
                    }
                }

                // 地址没有需加载
                if(tt.jobAddrList && !tt.jobAddrList.length){
                    tt.getAllAddrList('all'); //获取地址列表
                }
            };//邀请面试
            function talk(){
                $('.talk.chat_to-Link').click()[0];
            };//在线聊一聊
            tt.confirmPopInfo={
                icon:'success',
                title:tit,
                tip:dom,
                popClass:cls ,
                btngroups:[
                    {
                        tit:ltit,
                        fn:tt.locationb?talk:invite,
                        type:'primary'
                    },
                    {
                        tit:btnText,
                        cls:'btn_symple',
                        fn:function(){
                            if(!tt.businessInfo.email){ //执行保存简历
                                tt.addEmailPop = true;
                            } else if (!tt.locationb) { //弹出邮箱输入
                                let url = `/include/ajax.php?service=job&action=downloadResume&id=${tt.downResumeDetail.id}&local=1`;  //下载的url
                                let iframe = document.createElement("IFRAME");
                                iframe.style.display = "none";
                                iframe.setAttribute("src", url);
                                document.body.appendChild(iframe);
                                setTimeout(() => { //清除iframe标签
                                    iframe.parentNode.removeChild(iframe);
                                    iframe = null;
                                }, 10000);
                            }else{
                                invite()
                            }
                        },
                        type:'',
                    },                  
                ]
            }
            
        },
        sendToEmail(){
            const that = this;
            if(!that.downResumeDetail.email){
                that.showErrTip = true
                that.showErrTipTit = '请输入邮箱账号'
                return false;

            }
            $.ajax({
                url: '/include/ajax.php?service=job&action=downloadResume&id='+that.downResumeDetail.id+'&postEmail=1&email=' + that.downResumeDetail.email,
                type: "post",
                dataType: "json",
                success: function (data) {
                    that.addEmailPop = false; //隐藏弹窗
                    that.emailCheckSuccess = true;
                },
                error: function(){
                    // alert("登录失败！");
                    that.addEmailPop = false; //隐藏弹窗
                    return false;
                }
            });
        },

        // // 选择其他支付方式
        // changePayWay(){
        //     var tt = this;
        //     if(!tt.payObj) return false; //没有支付信息  不能调起支付弹窗
        //     var info = tt.payObj;
        //     // clearInterval(checkPayResult)
        //     $('.pay_balance').click(); //默认使用余额支付
        //     orderurl = info.orderurl;
        //     if(typeof (info) != 'object'){
        //         // location.href = info;
        //         return false;
        //     }
            
        //     cutDown = setInterval(function () {
        //         $(".payCutDown").html(payCutDown(info.timeout));
        //     }, 1000)
            
        //     var datainfo = [];
        //     for (var k in info) {
        //         datainfo.push(k + '=' + info[k]);
        //     }
        //     $("#amout").text(info.order_amount);
        //     $('.payMask').show();
        //     $('.payPop').show();
        //     if (usermoney * 1 < info.order_amount * 1) {
        //         $("#moneyinfo").text('余额不足，');
        //     }else{
        //         $("#moneyinfo").text('剩余');

        //     }

        //     if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
        //         $("#bonusinfo").text('额度不足，可用');
        //         $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
        //     }else if( bonus * 1 < info.order_amount * 1){
        //         $("#bonusinfo").text('余额不足，');
        //         $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
        //     }else{
        //         $("#bonusinfo").text('');
        //         $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
        //     }
        //     ordernum  = info.ordernum;
        //     order_amount = info.order_amount;
        //     $("#ordertype").val('');
        //     $("#service").val('job');
        //     service = 'job';
        //     var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
        //     $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
        // },

        // // 验证是否支付成功
        // checkPayResult:function(ordernum,callback){
        //     payResultInterval = setInterval(function () {

        //         $.ajax({
        //             type: 'POST',
        //             async: false,
        //             url: '/include/ajax.php?service=member&action=tradePayResult&order=' + ordernum,
        //             dataType: 'json',
        //             success: function (str) {
        //                 if (str.state == 100 && str.info != "") {
        //                     //如果已经支付成功，则跳转到会员中心页面
        //                     clearInterval(payResultInterval);
                            
        //                 }
        //             }
        //         });

        //     }, 2000);
        // },


        // 工具类方法
        transTimes(timeStr,n){
            update = new Date(timeStr * 1000);//时间戳要乘1000
            year = update.getFullYear();
            month = (update.getMonth() + 1 < 10) ? ('0' + (update.getMonth() + 1)) : (update.getMonth() + 1);
            day = (update.getDate() < 10) ? ('0' + update.getDate()) : (update.getDate());
            hour = (update.getHours() < 10) ? ('0' + update.getHours()) : (update.getHours());
            minute = (update.getMinutes() < 10) ? ('0' + update.getMinutes()) : (update.getMinutes());
            second = (update.getSeconds() < 10) ? ('0' + update.getSeconds()) : (update.getSeconds());
            if (n == 1) {
                return (year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second);
            } else if (n == 2) {
                return (year + '-' + month + '-' + day);
            } else if (n == 3) {
                return (month + '-' + day);
            } else if (n == 4) {
                return (month + '-' + day + ' ' + hour + ':' + minute);
            } else if(n == 5){
                return (year + '-' + month + '-' + day + ' ' + hour + ':' + minute);
            } else if(n == 6){
                return (year + '-' + month + '-' + day + ' ' + hour + ':' + minute );
            }else {
                return 0;
            }
        },

        timeStrToDate(timeStr,type){
			var now = new Date();
			var date = new Date(timeStr * 1000)
			var year = date.getFullYear();  //取得4位数的年份
			var month = date.getMonth()+1;  //取得日期中的月份，其中0表示1月，11表示12月
			var dates = date.getDate();      //返回日期月份中的天数（1到31）
			var day = date.getDay();
			var hour = date.getHours();     //返回日期中的小时数（0到23）
			var minute = date.getMinutes(); //返回日期中的分钟数（0到59）
			var second = date.getSeconds(); //返回日期中的秒数（0到59）
			var weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
			var datestr = month + '/' + dates + '（'+weekDay[day]+'）';
			// if(now.toDateString() === date.toDateString() ){
			// 	datestr = '今天'
			// }
			// datestr = datestr + (hour > 12 ? '下午' + (hour - 12) : '上午' + hour) +  ':' + minute;

			// if(type == 1){
			// 	datestr = month + '月' + dates + '日'
			// }
			return datestr;
		},

        // 与用户聊天
        chatWithUser(b_id){


            var html = [],linkHtml = [];

            //获取聊天对象的id、token
            $.ajax({
                url: '/include/ajax.php?service=siteConfig&action=getImToken&userid='+b_id,
                type: 'post',
                dataType: 'json',
                success: function(data){
                    if(data.state == 100){
                        toUserinfo  = {
                            'uid':data.info.uid,
                            'name':data.info.name,
                            'photo':data.info.photo,
                        }
                        toChatToken = data.info.token;
                        $('.im-msg_tip').click(); //打开聊天列表窗口
                        if_f = data.info.isfriend;
                        add_f = if_f=='1'?'':'im-show';
                        $('.im-panel_box').find('.im-big_panel').remove();
                        //创建聊天窗口
                        html.push('<div class="im-big_panel im-chat_panel im-show">');
                        html.push('<h2 data-id="'+toUserinfo['uid']+'"><span class="im-to_fdetail">'+toUserinfo['name']+'</span><div class="im-btn_group '+add_f+'"><p class="im-to_f"><a href="javascript:;" class="im-btn_add">'+langData['siteConfig'][46][28]+'</a></p></div><i title="'+langData['siteConfig'][47][27]+'" class="im-close_btn"></i></h2>');//加为好友--关闭聊天窗口
                        html.push('<div class="im-record_box"></div>');
                        html.push('<div class="im-msgto_box im-chat_box"><div class="im-btn_group fn-clear"><div class="im-left_icon"><a href="javascript:;" class="im-emoj_btn"></a><a href="javascript:;" class="im-img_btn"></a></div><a href="javascript:;" class="im-record_btn">'+langData['siteConfig'][47][31]+'</a></div><div class="im-textarea" contenteditable></div><div class="im-msg_sendbox"><a href="javascript:;" class="im-msg_send">'+langData['siteConfig'][6][139]+'</a><span ><i title="'+langData['siteConfig'][47][28]+'"></i></span><ul class="im-send_way"><li class="im-active" data-value="enter">'+langData['siteConfig'][47][29]+'</li><li data-value="center">'+langData['siteConfig'][47][30]+'</li></ul></div></div>'); //消息记录--发送--按Enter键发送或者按Ctrl+Enter键发送--按Enter键发送--按Ctrl+Enter键发送
                        html.push('</div>');
                        $('.im-panel_box').append(html.join(''));
                        setTimeout(function(){
                            time = Math.round(new Date().getTime()/1000).toString() ; //重置获取聊天记录的时间
                            getnum();
                            getrecord();
                        },500)


                    }
                },
                error: function(){
                    console.log(langData['siteConfig'][46][63]);//网络错误，初始化失败！
                    return false;
                }
            });
        },


        // 直接购买简历
        buyResumeDirect(id){
            var tt = this;
            var paramArr=[];
            paramArr.push('rid='+id);
            paramArr.push('type=3');
            tt.showPayPop(paramArr,3); //直接购买简历
        },
        
        // 招聘套餐
        goLink(){
            var tt = this;
            tt.popularAddPop = true;
            tt.mealState=0;
        },

        // 批量上架确认
        // confirmUp(){
        //     var tt = this;
        //     if(!tt.long_valid && !tt.validDate ){
        //         tt.showErrTip = true;
        //         tt.showErrTipTit = '请选择有效期';
        //         return false;
        //     }
        // },

        // 上架
        // offPost(){  //rowInfo是当前行的数据,type=1表示批量操作
        //     var tt = this;
        //     var idArr = []
        //     tt.upPostItemArr.forEach(function(val){
        //         idArr.push(val.id)
        //     })
        //     opt = opt === 0  ? 0 : 1;
        //     var valid = tt.validDate ? parseInt(tt.validDate.valueOf()/1000) : ''
        //     $.ajax({
		// 		url: '/include/ajax.php?service=job&action=updateOffPost&off=0&long_valid='+ tt.long_valid+'&valid='+valid+'&id=' + idArr.join(','),
		// 		type: "POST",
		// 		dataType: "jsonp",
		// 		success: function (data) {
		// 			if(data.state == 100){
        //                 tt.successTip = true;
        //                 tt.successTipText = data.info;
        //                 tt.plupPostPop = false; //隐藏弹窗
        //                 page.getPostList()
                        
        //             }
		// 		},
		// 		error: function () { 
		// 			page.isload = false;
		// 		}
		// 	});



        // },


        // 下载简历验证是否能下载
        checkDownloadResume(item){
            var tt = this;
            let flag = true;
            if(!tt.businessInfo){
                tt.warnTipPop = true;
                tt.warnTipCallBack = item;
                flag = false
                
            }
            return flag;
        },

        checkAgain(){
            var tt = this;
            page.downloadResume(tt.warnTipCallBack)
        },
        // 邀请面试弹窗关闭
        formPopFn(){
            $('.formPop.showPop').css({'animation':'bottomFadeOut .3s'});      
            setTimeout(() => {
                    this.formPop=false;
                    $('.formPop.showPop').css({'animation':'topFadeIn .3s'});  
            }, 280);
        },
        downResumePopFn(){
            $('.resumeContainer .resumePop.showPop').css({'animation':'bottomFadeOut .3s'});      
            setTimeout(() => {
                    this.downResumePop=false;
                    $('.resumeContainer .resumePop.showPop').css({'animation':'topFadeIn .3s'});  
            }, 280);
        },
        initAutoCompelete(){
            const tt = this;
            if(showMap == '1' || showMap == '3'){
                if(site_map == 'baidu'){
                    autocomplete = new BMap.Autocomplete({
                        input: "address_detail",
                        location: $("#city").val()
                    });
                    autocomplete.addEventListener('onconfirm',function(e){
                        let value = e.item.value;
                        autocomplete.setInputValue(value.business);
                    })
                }else if(site_map == 'amap'){ //待测试
                    //加载输入提示插件
                    map.plugin(['AMap.Autocomplete'], function() {
                        let autoOptions = {
                            input:'address_detail',
                            city: $("#city").val() //城市，默认全国
                        };
                        autocomplete = new AMap.Autocomplete(autoOptions);
                    });
                }else if(site_map == 'google'){
                    autocomplete = new google.maps.places.Autocomplete(document.getElementById("address_detail"));
                    autocomplete.addListener('place_changed',function(){
                        // console.log(autocomplete.getPlace())
                        let res = autocomplete.getPlace();
                        if(res && res.geometry){

                            map.setCenter(res.geometry.location)
                            marker.setMap(null);
                            tt.google_drawMarker(res.geometry.location.lng(),res.geometry.location.lat())
                            $("#lng").val(res.geometry.location.lng());
                            $("#lat").val(res.geometry.location.lat());
                        }
                    })
                }else if(site_map == 'tmap'){

                }
            }
        }
    },

    computed:{
         // 薪资转换
        salaryChange(){
            return function(item){
                if(!item ) return false;
                let text;
                if(item.mianyi==1){
                    text = '面议'
                }else{
                    var minS = item.min_salary, 
                        maxS = item.max_salary;
                    text = minS + '-' + maxS
                }
                return text;
            }
        },
    },
    watch:{
        currMarker(val){
            var tt = this;
            // console.log(val)
        },

        showPop(val){
            var tt = this;
            if(!tt.addrDeatil){
                tt.btn_disabled = true;
            }else{
                tt.btn_disabled = false
            }
            if(val && !tt.hasLoad){
                tt.hasLoad = true;
                if(tt.mapArea.length){
                    var mapArr = tt.mapArea.map(function(val){
                        return val.toString()
                    })
                    tt.mapArea = mapArr;
                    tt.getArea();
                }
                tt.drawMap();
            }
        },

        mapAreaObj(val){
            var tt = this;
            if((!tt.mapArea || (tt.mapArea && tt.mapArea.length == 0))){

                tt.checkAddr()
            }
        },

        addrDeatil(val){
            var tt = this;
            if($("#address_detail").val() == ''){
                // $("#address_detail").val(val)
                // console.log(autocomplete)
                if(site_map == 'baidu'){
                    autocomplete.setInputValue(val)
                }
            }
        },

        // 错误提示2秒之后隐藏
        showErrTip(val){
            if(val){
                var tt = this;
                setTimeout(() => {
                    tt.showErrTip = false;
                    tt.showErrTipdefine = '';
                }, 2000);
            }
        },
        // 成功提示2秒之后隐藏
        successTip(val){
            if(val){
                var tt = this;
                setTimeout(() => {
                    tt.successTip = false;
                }, 2000);
            }
        },

        confirmPop(val){
            var tt = this;
            // tt.confirmPop = val;
        },

        'toTopForm.startTime':function(val){
            var tt = this;
            tt.checkChange(); 
        },


        // 匹配职位
        'resumeForm.keywords':function(val){
        
        },

        'resumeForm.job_addr_id':function(val){
            var tt = this;
            if(val == 'a'){
                tt.resumeForm.job_addr_id = '';
                tt.addNewAddr()
            }else if(tt.resumeForm.job_addr_id){
                tt.job_addr_id_pre=tt.resumeForm.job_addr_id;
            }
        },
        'inviteDate':function(val){ //面试日期
            this.resumeForm.dateTime=val;
            if(this.inviteTime){
                let date=new Date(this.inviteTime);
                let hour=date.getHours();
                let minutes=date.getMinutes();
                this.resumeForm.dateTime=new Date(this.resumeForm.dateTime).setHours(hour);
                this.resumeForm.dateTime=new Date(this.resumeForm.dateTime).setMinutes(minutes);
            };
        },
        'inviteTime':function(val){ //面试时刻
            let date=new Date(val);
            let hour=date.getHours();
            let minutes=date.getMinutes();
            this.resumeForm.dateTime=new Date(this.resumeForm.dateTime).setHours(hour);
            this.resumeForm.dateTime=new Date(this.resumeForm.dateTime).setMinutes(minutes);
        },

        /*--------------购买刷新置顶相关-----------------*/ 

        // 没有单项购买
        noSingle:function(val){
            var tt = this;
            if(val){
                tt.currPopularTab = 1;
            }
        },

        // 增值包类型变换
        popularType:function(val){
            var tt = this;
            if(!tt.addPackage[val - 1]['conArr'] || tt.addPackage[val - 1]['conArr'].length == 0 ){ //加载过 就不再加载数据
                tt.getPackageList(val)
            }

        },
        'changeResumeAddr':function(val){
            if(val){ //自动展开面试地点选择
                setTimeout(() => {
                    this.$refs.selectRef.toggleMenu();
                }, 0);
            }
        },
        // 置顶总天数
        businessInfo:function(val){
            var tt = this;
            tt.resumeForm.name = val.people; //招聘联系人
            tt.resumeForm.phone = val.contact;   //招聘电话
            tt.allTopDay = Number(val.combo_top) + Number(val.package_top);
            tt.allRefreshDay = Number(val.can_job_refresh) + Number(val.package_refresh);

            // 更换头像
            $('.topBox .user_icon img').attr('src',val.logo_url)
        },

        
    }
})