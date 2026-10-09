var page = new Vue({
	el:'#page',
	data:{
		navList:navList,
		currid:3,
		hoverid:'',
		loading:false,
        keywords:'', //搜索关键字
        totalCount:0,
        page:1,
        isload:false,
        tabsArr:[{
            id:0,
            text:'招聘中',
            count:0,
            value:'1',
        },{
            id:1,
            text:'待审核',
            count:0,
            value:'0',
        },{
            id:2,
            text:'未通过',
            count:0,
            value:'2',
        },{
            id:3,
            text:'已下架',
            count:0,
            value:'3',
        },],
        currTab:tab,
        state:1, //职位状态
        isload:false,
        tableData:[],
        page:1,//页码

        optbultArr:[], //批量操作的数据
        businessInfo:'', //商户信息
        // 海报
        posterData:'',
        posterId:[],
        loadurl:'',
        bool:false,
        posterb:false,
        jobtype:[],//渲染职位
	},
	mounted() {
        var tt = this;
        if(tab){
            tt.state = tt.tabsArr[tt.currTab].value
        }


        // 初始化加载数据
        tt.getPostList();

        // 获取商户信息
        setTimeout(() => {
            tt.getBusinessInfo()
        }, 500);
		// 拖拽
		this.dragFn('.pp-drag', '.p-produce');
    },
    computed:{
        numCom(){
            return function(salary){
                var salary_num = salary
                return salary_num;
            }
        },

        timeTrans(){
            return function(timestr,n){
                var date = mapPop.transTimes(timestr,n);
                return date;
            }
        },
        checkTime(){
            return function(timestr,n){
                var date = mapPop.transTimes(timestr,n);
                var date = mapPop.transTimes(timestr,n);
                date = date.replace(/-/g,'/')
                return date;
            }
        }
    },
    watch:{
        currTab:function(val){
            var tt = this;
            this.$forceUpdate()
            tt.checkLeft(val);
            // 重新加载数据
            tt.page = 1;
            tt.getPostList();
            tt.optbultArr = []; //清空所选
        }
    },
    methods:{
        		// 点左边侧边栏
		checkConfig(item,ind){

			var el = event.currentTarget;
			var url = item ? item.link 
						: $(el).attr('data-url')  ? $(el).attr('data-url') 
						: $(el).attr('href')   ?   $(el).attr('href') : ''
			if(((job_cid && busi_state == 1) || ind <= 3 || 8<=ind) && url){
				window.location.href = ind == 0 ? item.link + '?direct=1' : url
			}else{

				var popTit  =   !job_cid ? '企业资料未完善' 
								:busi_state == 0 ? '企业资料审核中' 
								: '企业资料审核拒绝'

				var popTip_1 = !job_cid ? '完善公司基本信息后，即可' 
								:busi_state == 0 ? '企业资料审核通过后，即可' 
								: '请修改企业资料，审核通过后，即可，'
				var popTip_2 = item ? (item.txt=='招聘会'?'参加':item.txt=='增值包'?'购买':'进行') + item.txt 
								:ind == 3 ? '发布职位'
								:ind == 9 ? '开通套餐' 
								: '';

				mapPop.confirmPop = true;
				mapPop.confirmPopInfo = {
					icon:'error',
					title:popTit,
					tip:popTip_1 + popTip_2,
					btngroups:[
						{
							tit:'好的，知道了',
							cls:'btn_big',
							fn:function(){
								// window.location.href = masterDomain + '/supplier/job/company_info.html'
								mapPop.confirmPop = false;
							},
							type:'primary'
						},
						
					]
				}

			}
		},
        posterFn(state,id,name,salary) { //海报弹窗
            if (state == 0) { //弹出获取职位和海报类型
                $('.pp-postname').text(name);//职位昵称
                $('.pp-postsalary').text(salary);//职位昵称
                this.posterId[0]=id;
                $('.poster').css({'display':'flex'});
                $('html').css({
                    'overflow': 'hidden'
                })
                if (!this.posterb) { //获取职位和海报类型
                    // 海报类型
                    $.ajax({
                        url: '/include/ajax.php?',
                        data: {
                            service: 'job',
                            action: 'getPosterTemplate',
                            type:'post'
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
                                this.posterb=true
                            } else {
                                alert(res.info);
                            }
                        }
                    });
                }
            } else if (state == 1) { //关闭
                $('.p-produce').css({'animation':'bottomFadeOut .3s'});      
                setTimeout(() => {
                    $('.poster').hide();
                    $('.p-produce').css({'animation':'topFadeIn .3s'});  
                    $('html').css({
                        'overflow': 'overlay'
                    });
                }, 280);
            } else { //关闭生成的海报弹窗
                $('.p-save').hide()
            };
        },
        produceFn(id){ //生成海报
            $('.pp-poster a').hide();
            $('.p-save').show(); //生成弹窗  
            $('.pp-poster div').show(); //loading加载
            $('.pp-show').hide();//加载完成展示图
            let data={
              service:'job',
              action:'makePoster',
              id:this.posterId.join(','), //职位id
              mid:id,
              type:'post'
            }; 
            $.ajax({
                url: '/include/ajax.php?',
                data: data,
                dataType: 'jsonp',
                timeout: 5000,
                success: (res) => {
                    if (res.info.url) {
                        $('.ppp-showimg').attr('src', res.info.url);
                        this.loadurl=res.info.url;
                        this.bool=false;
                    } else {
                        alert('加载失败，请重新操作');
                    }
                }
            });
        },
        psaveFn(){ //保存海报   
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
        loadFn(){ //生成的海报图片加载出来后执行
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

        checkLeft(val){
            var tt = this;
            var currTab = val ? val : tt.currTab;
            var el = $(".tabBox li[data-id='"+currTab+"']");
            var left = el.position().left + el.innerWidth()/2  - $(".tabBox s").width()/2;
            $(".tabBox s").css({
                'transform':'translateX('+left+'px)'
            })
        },
        // 表格全选
        selectAll(){
            var tt = this;
            tt.$refs.table.toggleAllSelection()
        },

        // 对所选数据进行操作
        // optSelection(){
        //     var tt = this;
        //     // console.log(tt.$refs.table.selection)
        // },

        // 刷新选中数据


        // 确认下架弹窗
        confirmOffPost(){
            var tt = this;
            if(!tt.optbultArr.length){
                mapPop.showErrTip = true
                mapPop.showErrTipTit = '至少选择一个职位进行操作';
                return false;
            }
            if(mapPop){
                mapPop.confirmPop = true;
                var extendLen = 0; //推广的职位
                tt.optbultArr.forEach(item => {
                    if(item.is_refreshing || item.is_topping){
                        extendLen ++ ;
                    }
                })
                const tip = extendLen > 0 ? '确认下架后，有<em style="color:#666;">'+extendLen+'</em>条职位的<span style="color:#FC4C60;">推广进程(置顶、刷新)将终止 </span><br/>此操作不可恢复' : '温馨提示：已接收的简历处理不受影响'
                mapPop.confirmPopInfo = {
                    icon:'error',
                    popClass:'confirmOffPost',
                    title:'确认下架这'+tt.optbultArr.length+'条职位？',
                    tip:tip, //提示
                    btngroups:[
                        {
                            tit:'取消',
                            cls:'btn_cancel',
                            fn:function(){
                                mapPop.confirmPop = false;
                            },
                            type:'primary'
                        },
                        {
                            tit:'确认下架',
                            cls:'btn_sure',
                            fn:function(){
                                tt.offPost('',1);
                                mapPop.confirmPop = false;
                            },
                            type:'primary',
                        },
                    ]
                }
            }
        },
        //下架单个职位
        offPostOnly(item,daishen=false){ 
            let tt=this;
            mapPop.confirmPop = true;
            let tip;
            if(daishen){//待审核取消上架
                tip='取消上架后此职位不再占上架职位的数量'
            }else if(item.is_refreshing || item.is_topping){
                tip=`确认下架后，该职位的<span style="color:#FC4C60;">推广进程(置顶、刷新)将终止 </span><br/>此操作不可恢复`;
            }else{
                tip='温馨提示：已接收的简历处理不受影响';
            }
            mapPop.confirmPopInfo = {
                icon:'error',
                popClass:'confirmOffPost',
                title:daishen?'确认取消上架该职位':'确认下架该职位？',
                tip:tip,
                btngroups:[
                    {
                        tit:'取消',
                        cls:'btn_cancel',
                        fn:function(){
                            mapPop.confirmPop = false;
                        },
                        type:'primary'
                    },
                    {
                        tit:daishen?'取消上架':'确认下架',
                        cls:'btn_sure',
                        fn:function(){
                            mapPop.confirmPop = false;
                            tt.offPost(item)
                        },
                        type:'primary',
                    },
                ]
            }
        },
        // 确认删除弹窗
        confirmDelPost(item){
            var tt = this;
            if($(event.currentTarget).hasClass('disables_btn')) return false;
            let title='';
            if(item){ //单个删除
                title='确认删除该职位'
            }else if(!tt.optbultArr.length){ //多个删除且未选择
                mapPop.showErrTip = true
                mapPop.showErrTipTit = '至少选择一个职位进行操作';
                return false;
            }else{ //多个删除
                title='确认删除这'+tt.optbultArr.length+'条职位？';
            };
            if(mapPop){
                mapPop.confirmPop = true;
                mapPop.confirmPopInfo = {
                    icon:'error',
                    popClass:'confirmDelPost pop_error',
                    title:title,
                    tip:'删除后不可恢复，请谨慎操作',
                    btngroups:[
                        {
                            tit:'取消',
                            cls:'btn_cancel',
                            fn:function(){
                                mapPop.confirmPop = false;
                            },
                            type:''
                        },
                        {
                            tit:'确认删除',
                            cls:'btn_sure',
                            fn:function(){
                                mapPop.confirmPop = false;
                                if(item){
                                    tt.delPost(item)
                                }else{
                                    tt.delPost('',1)
                                }
                            },
                            type:'primary',
                        },
                    ]
                }
            }

        },


        // 下架
        offPost(rowInfo,type,opt){  //rowInfo是当前行的数据,type=1表示批量操作
            var tt = this;
            var idArr = []
            if(type == 1){ 
                tt.optbultArr.forEach(function(val){
                    idArr.push(val.id)
                })
            }else{
                idArr.push(rowInfo.id)
            }
            opt = opt === 0  ? 0 : 1;
            $.ajax({
				url: '/include/ajax.php?service=job&action=updateOffPost&off='+opt+'&id=' + idArr.join(','),
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){
                        mapPop.successTip = true;
                        mapPop.successTipText = data.info;
                        tt.getPostList()
                        tt.getBusinessInfo()
                    }
				},
				error: function () { 
					tt.isload = false;
				}
			});



        },


        // 删除职位
        delPost(rowInfo,type){
            var tt = this;
            var idArr = []
            if(type == 1){ 
                tt.optbultArr.forEach(function(val){
                    idArr.push(val.id)
                })
            }else{
                idArr.push(rowInfo.id)
            }
            $.ajax({
				url: '/include/ajax.php?service=job&action=delPost&id=' + idArr.join(','),
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){
                        mapPop.successTip = true;
                        mapPop.successTipText = data.info;
                        tt.getPostList()
                    }
				},
				error: function () { 
					tt.isload = false;
				}
			}); 
        },

        
        selectionChange(selection){
            var tt = this;
            tt.optbultArr = selection;
            
        },

        // 搜索关键字
        searchPost(){
            var tt = this;
            tt.page = 1;
            tt.getPostList()
        },

        // 获取职位
        getPostList(){
            var tt = this;
            tt.isload = true;
            var paramStr = '';
            if(tt.state != '3'){
                paramStr = '&state='+tt.state
            }else{
                paramStr = '&state=3'
            }
			$.ajax({
				url: '/include/ajax.php?service=job&action=postList'+paramStr+'&page='+tt.page+'&pageSize=10&com=1&keyword='+tt.keywords+'',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					tt.isload = false;
					if(data.state == 100){
                        tt.totalCount = data.info.pageInfo.totalCount
                        tt.tableData = data.info.list;
                        for(var i = 0; i < tt.tabsArr.length; i++){
                            tt.tabsArr[i].count = data.info['state' + tt.tabsArr[i].value]
                        }
					}else{
                        tt.tableData = []
                    }
                    tt.$nextTick(function(){
                        tt.checkLeft()
                    })
				},
				error: function () { 
					tt.isload = false;
				}
			});
        },

        // 页码改变
        changePage(page){
            var tt = this;
            tt.page = page;
            tt.getPostList()
        },

        // 跳转简历管理匹配职位/编辑
        toUrl(scope,type){ 
            var url = '';
            if(type === 1){
                url = `${masterDomain}/supplier/job/personList.html?postid=${scope.row.typeid}&nature=${scope.row.natureid}&min_salary=${scope.row.min_salary}&max_salary=${scope.row.max_salary}&mianyi=${scope.row.mianyi}&education=${scope.row.educationalid}&experience=${scope.row.experienceid}`
            }else if(type === 2){
                url = masterDomain + '/supplier/job/add_post.html?id=' + scope.row.id

            }
            window.open(url)
        },

        // 跳转链接
        goLink(row){
            // window.open(url)
            // console.log(row)
            window.open(row.url)
        },

        // 去编辑页
        toEditLink(item,type){
            var tt = this;
            
            var currDate = parseInt(new Date().valueOf() / 1000);
            // 不能发布任何职位 未购买套餐
            if (tt.businessInfo.canJobs == 0 && !tt.businessInfo.combo_id) {
                mapPop.buyMeadlPop = true;
                return false;
            }else if(tt.businessInfo.canJobs == 0){
                mapPop.confirmPop = true;
                mapPop.confirmPopInfo = {
                    icon:'error',
                    title:`当前套餐可上架职位数已满`,
                    tip:'<p style="color:#999;">您可以付费升级职位数，或先下架一些<span style="color:#666">招聘中、待审核</span>的职位</p>',
                    btngroups:[
                        {
                            tit:'取消',
                            cls:'btn_mid_140',
                            fn:function(){
                                mapPop.confirmPop = false;
                            },
                            type:''
                        },
                        {
                            tit:'升级职位数',
                            cls:'btn_big',
                            fn:function(){
                                mapPop.confirmPop = false;
                                tt.showPopularPop(item);
                            },
                            type:'primary',
                        },
                        
                    ]
                };
                return
            }


            var url = masterDomain + '/supplier/job/add_post.html'
            if(item){
                url = url + '?id=' + item.id
            }
            if(type){
                url = url + (url.indexOf('?') > -1 ? ('&param=' + type) : ('?param=' + type))
            }
            window.open(url)
        },

        // 重新发布/上架职位
        upPost(item,type){
            var tt = this;
            var currDate = parseInt(new Date().valueOf() / 1000);
           
            
            
            mapPop.confirmPop = true;
            // 购买过套餐，且在有效期内
            if(tt.businessInfo.canJobs  == 0 ){  //可以上架
            	 // 套餐过期  没购买套餐
	            if(!tt.businessInfo.combo_id || (currDate > tt.businessInfo.combo_enddate && tt.businessInfo.combo_enddate != -1)){
	                mapPop.buyMeadlPop = true;
	                return false;
	            }
                // mapPop.confirmPopInfo = {
                //     icon:'error',
                //     title:'当前套餐可上架职位数已满',
                //     tip:'<p style="color:#999;">您可以付费升级职位数，或先下架一些<span style="color:#666">招聘中、待审核</span>的职位</p>',
                //     btngroups:[
                //         {
                //             tit:'取消',
                //             cls:'btn_mid_140',
                //             fn:function(){
                //                 mapPop.confirmPop = false;
                //             },
                //             type:''
                //         },
                //         {
                //             tit:'升级职位数',
                //             cls:'btn_big',
                //             fn:function(){
                //                 // if(item.long_valid == 1){
                //                 //     tt.showPopularPop(item);
                //                 // }else{
                //                 //     tt.toEditLink(item,type); //跳转编辑页
                //                 // }
                //                  tt.toEditLink(item,type); //跳转编辑页

                //             },
                //             type:'primary',
                //         },
                        
                //     ]
                // };
                mapPop.singleForm.offPost = 1;
                tt.toEditLink(item,type); //跳转编辑页
            }else{
                mapPop.confirmPop=false;
                tt.plUpPost(item);
                // mapPop.confirmPopInfo = {
                //     icon:'error',
                //     title:'确认上架该职位？',
                //     tip:'<p style="color:#666;">您当前套餐可上架职位数为' + (tt.businessInfo.canJobs == -1 ? '不限':tt.businessInfo.canJobs) +'</p>',
                //     btngroups:[
                //         {
                //             tit:'取消',
                //             cls:'btn_mid_140',
                //             fn:function(){
                //                 mapPop.confirmPop = false;
                //             },
                //             type:'取消删除'
                //         },
                //         {
                //             tit:'确认上架',
                //             cls:'btn_mid_140',
                //             fn:function(){
                //                 mapPop.confirmPop=false;
                //                 if(item.long_valid == 1 || tt.businessInfo.canJobs>0){
                //                     tt.offPost(item,'', 0); //直接上架
                //                 }else{
                //                     // tt.toEditLink(item,'valid'); //跳转编辑页
                //                     tt.plUpPost(item)
                //                 }
                //             },
                //             type:'primary',
                //         },
                        
                //     ]
                // };
            }
        },

        // 批量上架职位
        plUpPost(item){ //item表示直接点击重新发布
            var tt = this;
            if(!item){

                if(tt.optbultArr.length == 0) {
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '请至少选择一个职位操作！';
                    return false;
                }
            }
            var currDate = parseInt(new Date().valueOf() / 1000);
            console.log(tt.businessInfo.canJobs);

            
            if(tt.businessInfo.canJobs < tt.optbultArr.length ){ //上架数目不够了
                mapPop.confirmPop = true;
                mapPop.confirmPopInfo = {
                    icon:'error',
                    title:`当前套餐还可上架${tt.businessInfo.canJobs}个职位`,
                    tip:'<p style="color:#999;">您可以付费升级职位数，或先下架一些<span style="color:#666">招聘中、待审核</span>的职位</p>',
                    btngroups:[
                        {
                            tit:'取消',
                            cls:'btn_mid_140',
                            fn:function(){
                                mapPop.confirmPop = false;
                            },
                            type:''
                        },
                        {
                            tit:'升级职位数',
                            cls:'btn_big',
                            fn:function(){
                                mapPop.confirmPop = false;
                                mapPop.singleForm.offPost = tt.optbultArr.length -  tt.businessInfo.canJobs 
                                tt.showPopularPop(item);

                            },
                            type:'primary',
                        },
                        
                    ]
                };
            }else{
                 // 套餐过期  没购买套餐  -1表示永久有效
                if(tt.businessInfo.canJobs < 1 &&  (currDate > tt.businessInfo.combo_enddate && tt.businessInfo.combo_enddate != -1)){
                    mapPop.buyMeadlPop = true;
                    return false;
                }

                if(!item){  //批量操作

                    var showpop = false;
                    for(var i = 0; i < tt.optbultArr.length; i++){
                        if(tt.optbultArr[i].long_valid != 1){
                            showpop = true;
                            break;
                        }
                    }
                    if(showpop){ //有非长期的
                        mapPop.plupPostPop = true;
                        mapPop.upPostItemArr = tt.optbultArr;
                    }else{
                        tt.offPost('',1,0)
                    }
                }else{
                    mapPop.plupPostPop = true;
                    mapPop.upPostItemArr = [item];
                }
            }
        },

        // 显示支付弹窗,发布职位
        showPopularPop(item){
            var tt = this;
            var paramArr = []
            paramArr.push('type=6'); //上架职位
            paramArr.push('num=' + mapPop.singleForm.offPost); //上架职位
            $.ajax({
				url: '/include/ajax.php?service=job&action=pay'  ,
				type: "POST",
                data:paramArr.join('&'),
				dataType: "jsonp",
				success: function (data) {
                    if(data.state == 100){
                        mapPop.popularAddPop = true;
                        mapPop.singleType = 6;
                        // mapPop.singleForm.offPost = 2;
                        var datainfo = [];

                        for (var k in data.info) {
                            datainfo.push(k + '=' + data.info[k]);
                        };
                        var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
                        mapPop.singleForm.payCount = data.info.order_amount;
                        mapPop.singleForm.paySrc = masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src);
                        var ordernum = data.info.ordernum;
                        mapPop.payObj = data.info;
                        if (payResultInterval == null) {
                            mapPop.checkPayResult(ordernum,function(){
                                if(item.long_valid == 1){
                                    tt.offPost(item,'', 0); //直接上架
                                }else{
                                    tt.toEditLink(item,'valid'); //跳转编辑页
                                }
                            })
                        }
                        callBack_fun_success = function(){
                            if(item.long_valid == 1){
                                tt.offPost(item,'', 0); //直接上架
                            }else{
                                tt.toEditLink(item,'valid'); //跳转编辑页
                            }
                        }
                    }
                },
            })
        },




        // 显示刷新置顶弹窗
        showpopularPop(item,type){ //type 1 是置顶  2是刷新
            var tt = this;
            var onSwitch = (type === 1 && item.is_topping) || (type === 2 && item.is_refreshing); //正在置顶/刷新
            if(onSwitch) return false;
            // 判断是否是会员、套餐还有余量&& (!tt.businessInfo.combo_id || (tt.businessInfo.combo_enddate <= currDate && tt.businessInfo.combo_enddate != -1)
            // ((tt.businessInfo.package_top==0 && type==1)||(tt.businessInfo.package_refresh==0 && type==2)) && 
            if(!tt.businessInfo.combo_id && ((tt.businessInfo.package_top==0 && type==1)||(tt.businessInfo.package_refresh==0 && type==2))){ //会员到期或者未购买会员
                mapPop.buyMeadlPop = true;
            }else{ 
                // 重置相关数据
                mapPop.toTopForm = {
                    toTop:false, //置顶Or刷新,
                    /*********置顶相关*********/ 
                    topDays:'', //置顶天数，
                    topDayChose:'1', //选择的置顶天数
                    topTime:true, //置顶周一到周五
                    noTopArr:[],
        
                    /***********刷新相关************/ 
                    timeRefresh:'',     //刷新时间 填
                    timeRefreshChose:'.5', //刷新时间 选择
                    refreshTimes:0, //刷新次数
                    startTime:'',
                    endTime:'',
                    refreshDate:'', //刷新的日期
                    idArr:[], //批量刷新置顶的id
                    // 接口返回的数据
                    amount:0, //随时变
                    count:0,
                }
                mapPop.popularPop = true;
                mapPop.toTopForm.toTop = type === 1;  //1是置顶，2是刷新
                mapPop.toTopForm.idArr = [item.id];
                if(type === 1 && typeof(topDays_fee) != 'undefined'){
                    mapPop.toTopForm.amount = (mapPop.businessInfo.combo_top || mapPop.businessInfo.package_top) ? 0 :  parseFloat((topDays_fee * mapPop.toTopForm.topDayChose).toFixed(2))
                }

            
            }
        },


         // 获取当前商户的 信息
        getBusinessInfo(){
            var tt = this;
            $.ajax({
				url: '/include/ajax.php?service=job&action=companyDetail&other_param=addr',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
                    if(data.state == 100){
                        tt.businessInfo = data.info;
                        if(typeof(mapPop) != 'undefined'){
                            mapPop.businessInfo = data.info;
                        }
                    }
				},
				error: function (data) { 
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});
        },


        // 立即刷新职位
        refreshPost(item){
            var tt = this;
            var paramArr = [];
            var idArr = [];
            console.log(item);
            if(item){
                idArr.push(item.id)
            }else{
                if(!tt.optbultArr.length){
                    mapPop.showErrTip = true
                    mapPop.showErrTipTit = '至少选择一个职位进行操作';
                    return false;
                }else{
                    tt.optbultArr.forEach(function(val){
                        idArr.push(val.id)
                    })
                } 
            }
            paramArr.push('type=5'); 
            paramArr.push('pid=' + idArr.join(',')); 
            paramArr.push('refresh_type=1');
            var len = item ? 1 : tt.optbultArr.length; //操作的数据条数
            if(mapPop){
                if(len==1){
                    let offDate = tt.businessInfo.combo_enddate > parseInt(new Date().valueOf() / 1000) || tt.businessInfo.combo_enddate == -1; //判断会员是否到期
                    if((!tt.businessInfo.combo_id && tt.businessInfo.can_job_refresh == 0 && tt.businessInfo.package_refresh == 0) || !offDate){ //未开通会员或者会员已到期
                        mapPop.buyMeadlPop = true;
                        mapPop.buyMealTip = '你的刷新次数已用完'

                    }else if(tt.businessInfo.can_job_refresh == 0 && tt.businessInfo.package_refresh == 0 && tt.businessInfo.combo_id && offDate){
                        mapPop.confirmPop = false;
                        var tt = this;
                        mapPop.noSingle = 1;
                        mapPop.popularAddPop = true;
                        mapPop.popularType = 5;   //购买刷新的增值包
                        mapPop.popularTip = '请选择想要购买的增值包'; 
                    }else{
                        tt.showPayPop(paramArr);
                    }
                }else{
                    mapPop.confirmPop = true;
                    mapPop.confirmPopInfo = {
                        icon:'error',
                        popClass:'confirmOffPost',
                        title:'确认刷新这' + len + '条职位？',
                        btngroups:[
                            {
                                tit:'取消',
                                cls:'btn_cancel',
                                fn:function(){
                                    mapPop.confirmPop = false;
                                },
                                type:'primary'
                            },
                            {
                                tit:'确认刷新',
                                cls:'btn_sure',
                                fn:function(){
                                    mapPop.confirmPop = false;
                                    tt.showPayPop(paramArr)
                                },
                                type:'primary',
                            },
                        ]
                    }
                }
            }


        },

        // 调起支付弹窗
        showPayPop(paramArr){
            var tt = this;
            $.ajax({
				url: '/include/ajax.php?service=job&action=pay'  ,
				type: "POST",
                data:paramArr.join('&'),
				dataType: "jsonp",
				success: function (data) {
                    if(data.state == 100){
                        var info= data.info;
                        orderurl = info.orderurl;
                        if(typeof (info) != 'object' || (info.msg && info.msg == '无需支付，且请求成功')){
                            mapPop.successTip = true;
                            tt.confirmPop = false;
                            mapPop.successTipText = '刷新成功！';
                            tt.getPostList();
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

        // 刷新全部职位
		refreshAllPost(){
			var tt = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=jobRefresh&all=1',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){ //刷新成功
						if(typeof(data.info) == 'object'){  //部分刷新成功
							var successTip = {
								icon:'success',
								title: data.info.success + '条职位刷新成功！',
								tip:'<div class="failRefresh_tip"><em>刷新次数不足，</em>已为您自动刷新最近发布的'+data.info.success+'条职位</div><p>*您可以明日再刷新，或购买增值包</p>',
								popClass:'successTipPop',
								btngroups:[
									{
										tit:'购买增值包',
										fn:function(){
											mapPop.confirmPop = false;
											var tt = this;
											mapPop.noSingle = 1;
											mapPop.popularAddPop = true;
											mapPop.popularType = 5;   //购买刷新的增值包
											mapPop.popularTip = '请选择想要购买的增值包';  
										},
										type:'selfDefine',
										html:'<span class="btn_tip">立即生效，刷新无限制！</span><button class="el-button">购买增值包</button>'
									},
									{
										tit:'暂不购买',
										fn:function(){
											// 此方法是刷新所有职位， 如果刷新次数不够，则按发布时间靠前的刷新
											mapPop.confirmPop = false;
										},
										type:'',
									},
									
								]
							}
							mapPop.confirmPopInfo = successTip;
							mapPop.confirmPop = true;
                            tt.getPostList();
						}else{
                            // 全部刷新成功
                            mapPop.successTip = true;
                            mapPop.successTipText = '刷新成功';
                            tt.getPostList()
                        }


					}else{
                        mapPop.confirmPop = false;
                        var tt = this;
                        mapPop.noSingle = 1;
                        mapPop.popularAddPop = true;
                        mapPop.popularType = 5;   //购买刷新的增值包
                        mapPop.popularTip = '请选择想要购买的增值包'; 
                        return
						var successTip = {
                            icon:'error',
							title:'职位刷新失败！',
							tip:'<div class="failRefresh_tip"><em>刷新次数不足</div><p>*您可以明日再刷新，或购买增值包</p>',
							popClass:'successTipPop',
							btngroups:[
								{
									tit:'购买增值包',
									fn:function(){
										mapPop.confirmPop = false;
										var tt = this;
										mapPop.noSingle = 1;
										mapPop.popularAddPop = true;
										mapPop.popularType = 5;   //购买刷新的增值包
										mapPop.popularTip = '请选择想要购买的增值包';  
									},
									type:'selfDefine',
									html:'<span class="btn_tip">立即生效，刷新无限制！</span><button class="el-button">购买增值包</button>'
								},
								{
									tit:'暂不购买',
									fn:function(){
										// 此方法是刷新所有职位， 如果刷新次数不够，则按发布时间靠前的刷新
										mapPop.confirmPop = false;
									},
									type:'',
								},
								
							]
						}

						mapPop.confirmPopInfo = successTip;
						mapPop.confirmPop = true;
					}
				},
				error: function () { 
					
				}
			});


		},
    }
})