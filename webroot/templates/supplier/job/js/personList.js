// console.log(baseInfo)
var page = new Vue({
    el:'#page',
    data:{
        currid:2,
        hoverid:'',

        shaiResult:[],  //{ name:'2', value:'本科' },{ name:'3', value:'8000-9000' }
        
        percentArr:[{
            id:60,
            tip:'(基本信息包含工作经验、教育、求职意向)'
        },{
            id:85,
            tip:'(添加了个人技能/优势)'
        },{
            id:90,
            tip:'(全部完善，描述详尽)'
        }],
        // keywords:'',
        brief:1, //是否为简约版
        agePopover:false, // 是否显示年龄选择弹窗
        ageArr:[ { title:'18-20岁', value:'18-20' }, { title:'20-25岁', value:'20-25' }, { title:'25-30岁', value:'25-30' }, { title:'30-35岁', value:'30-35' }, { title:'35-40岁', value:'35-40' }, { title:'45-50岁', value:'45-50' }, { title:'50岁以上', value:'50-' }, ],

        salaryPopover:false, // 是否显示月薪选择弹窗
        salaryArr:[{ title:'4000以下', value:'-4000' },{ title:'4000-6000', value:'4000-6000' },{ title:'6000-8000', value:'6000-8000' },{ title:'8000-10000', value:'8000-10000' },{ title:'10000-15000', value:'10000-15000' },{ title:'15000-25000', value:'15000-25000' },{ title:'25000以上', value:'25000-' }],
        openSlide:false, //置顶

        baseConfig:baseInfo ? JSON.parse(baseInfo) : '' , //筛选条件的相关数据
        postArr:[], //职位列表

        form:{
            sex:'', //性别
            startWork:'',  //工作时间
            nature:'', //职位性质
            education:'', //学历
            experience:'', //工作经验
            postid:'',  //简历id
            pass_unSuit:true, //简历是否合适，筛选条件，
            pass_buy:true, //是否已购买,
            pass_completion:'60',
            min_age:'', //年龄
            max_age:'',
            min_salary:'', //薪资
            max_salary:'',
            finshed:false, //简历完成程度
            key:'',
        },
        // 简历完成度选中
        ifShaixuan:true, //是否筛选数据

        age:'', 
        ageText:'', 
        min_age:'',
        max_age:'',
        salary:'',
        salaryText:'', 
        min_salary:'',
        max_salary:'',

        page:1,
        isload:false,
        loadEnd:false, //已加载完毕
        personList:[], //人才列表
        paramArr:["pass_unSuit=1","pass_buy=1"],  //筛选条件

        postCategoryPop:false, //职位列表弹窗
        categoryList:[],
        currCategory:'', //当前所在分类，如果为空则显示当前商家发布的职位,
        categoryShow:0, //0全显示，1单类显示
        orderby:'', //默认排序
        currChosePostText:'', //当前选择的职位
        currChosePost:'', //当前选择的职位

        salaryPopper:false, //显示弹窗
        agePopper:false, //显示弹窗
        total:0, //数据总数
    },
    mounted(){
        var tt = this;
        
        // tt.getPosts();
        let url=location.search;
        let params = new URLSearchParams(url.slice(1));
        let postid=params.get('postid');
        // tt.getBaseConfig(); //获取相关配置
        tt.getStorePost(); //获取发布的职位
        if(!postid){
            tt.getPersonList();
        }
        
        $('.el-select').click(function(){
            tt.salaryPopper = false;
            tt.agePopper = false;
        })
        
    },
    computed:{
        // 薪资转换
        salaryChange(){
            return function(item){
                if(!item ) return false;
                var minS = item.min_salary, 
                    maxS = item.max_salary;
                var text = minS + '-' + maxS
                return text;
            }
        },
    },
    methods:{
        // 关闭职位选择弹窗
        closepop(){
            $('.industryPop').css({'animation':'bottomFadeOut .3s'});      
            setTimeout(() => {
                this.postCategoryPop = false; 
                $('.industryPop').css({'animation':'topFadeIn .3s'});  
            }, 280);
        },
        //清空筛选条件
        clearAll:function(){
            var tt = this;
            tt.shaiResult.forEach(function(val){
                if(val.name == 'age' || val.name == 'salary'){
                    tt.form['min_' + val.name] = '';
                    tt.form['max_' + val.name] = '';
                    tt['min_' + val.name] = '';
                    tt['max_' + val.name] = '';
                    tt[val.name + 'Text'] = '';
                    tt[val.name] = '';
                }else{
                    tt.form[val.name] = ''
                    if(val.name == 'postid'){
                        tt.currChosePost = ''
                    }
                }
            })
        },
        // 清除筛选
        removeShai(ind){
            var tt = this;
            var itemName = tt.shaiResult[ind].name;
            if(itemName == 'age' || itemName == 'salary'){
                
                tt.form['min_' + itemName] = '';
                tt.form['max_' + itemName] = '';
                tt['min_' + itemName] = '';
                tt['max_' + itemName] = '';
                tt[itemName] = '';
                tt[itemName] = '';
            }else{
                tt.form[itemName] = ''; 
                if(itemName == 'postid'){
                    tt.currChosePost = ''
                }
            }
        },


        handleCommand(command){
            var tt = this;
            tt.form.pass_completion = command.id ;
            if(tt.form.finshed){
                tt.checkShaiResult();
            }
        },


        scrollTO(){
            var tt = this;
            var el = event.currentTarget;
            if($(".listConBox").position().top < 10 && !tt.openSlide){
                tt.openSlide = true
            }else if($(".listConBox").position().top >= 10){
                tt.openSlide = false
            }


            // 下拉加载更多
            var h1 = $('.scrollBox').height();
            var h2 = $(".listConBox").height();
            var h3 = $(".shaiCon:not(.fixedTop)").height();
            var scrtop = $('.scrollCon').scrollTop();
            // console.log((scrtop + h1 - h3) >= h2 , tt.loadEnd)
            // if((scrtop + h1 - h3) >= h2 && !tt.loadEnd){
            //     tt.getPersonList()
            // }
        },

        // 获取相关筛选条件
        getBaseConfig(){
			var tt = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=getItem&name=education,experience,startWork,nature',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){
						tt.baseConfig = data.info;
					}
				},
				error: function () { 

				}
			});
		},

        // 获取自己发布的职位
        getStorePost:function(){
            var tt = this;
            $.ajax({
				url: '/include/ajax.php?service=job&action=postType',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){
                        tt.postArr = data.info;
                        mapPop.postArr = data.info.list;
                        if(tt.getUrlPrarm('postid')){
                            tt.form.postid = tt.getUrlPrarm('postid'); //匹配
                            // tt.checkShaiResult()
                            tt.form.nature=tt.getUrlPrarm('nature'); //职位性质
                            if(tt.getUrlPrarm('mianyi')!=1){
                                tt.form.min_salary=tt.min_salary=tt.getUrlPrarm('min_salary'); //薪资
                                tt.form.max_salary=tt.max_salary=tt.getUrlPrarm('max_salary');
                            };
                            tt.form.education=tt.getUrlPrarm('education'); //学历
                            tt.form.experience=tt.getUrlPrarm('experience'); //工作经验
                            let ind = tt.postArr.findIndex((item) => {
                                return item.id == tt.form.postid;
                            })
                            tt.postShow(tt.postArr[ind],1)
                        }else if(tt.postArr.length == 1){
                            tt.postShow(tt.postArr[0],1)
                        }
					}
				},
				error: function () { 

				}
			});
        },

        // 要显示人才的职位
        postShow(item,type){
            var tt = this;
            var postidArr = [];
            tt.currChosePost = item
            tt.currChosePostText = item.typename
            if(type){
                tt.form.postid = item.id
                // tt.checkShaiResult()
            }
            
           
        },
        sureChose(){
            const tt = this;
            if(tt.currChosePost){
                tt.form.postid = [tt.currChosePost.id]
                tt.postCategoryPop = false;
            }else{
                $('.hasChosed').css('opacity',1)
            }
        },
        
        changeItem(item,label){
            var tt = this;
            var min = '',max = '';

            if(item == ''){
                tt[label] = '';
            }else if(item == 'self'){ //自定义的值
                min = tt['min_' + label];
                max = tt['max_' + label];
            }else{
                tt[label] = item.value;
                var itemVal = item.value;
                var itemValArr = itemVal.split('-');  //年龄和月薪
                if(itemValArr.length > 0){
                    min = itemValArr[0];
                    max = itemValArr[1];
                }else{
                    min = itemValArr[0];
                }
            }
            tt.form['min_' + label] = min; 
            tt.form['max_' + label] = max; 

            // if(label.indexOf('age') >-1){
            //     tt.ageText =  min
            // }


            // 隐藏所有弹窗
            this.$refs.agePopper.doClose();
            this.$refs.salaryPopper.doClose();

        },

        // 组合筛选条件
        checkShaiResult(){
            var tt = this;
            var paramArr = [];
            var shaiArr = []; 
            for(var item in tt.form){
                // console.log(typeof(tt.form[item]),item,tt.form[item])
                if(typeof(tt.form[item]) == 'boolean' && item != 'finshed' ){
                    paramArr.push(item+'=' + (tt.form[item] ? 1 : ''))
                }else{
                    if(item != 'pass_completion' && item != 'finshed' && item != 'postid'){
                        paramArr.push(item+'=' + tt.form[item]);
                    }else if(tt.form.finshed && item == 'pass_completion' ){
                        paramArr.push(item+'=' + tt.form[item]);
                    }else if(item == 'postid' && tt.form[item]){
                        var val = tt.form[item]
                        paramArr.push('type=' + val);
                    }   
                }

                if(item != 'pass_unSuit' && item != 'pass_completion' && item != 'pass_buy' && item != 'finshed' && item != 'key'){
                    if((item.indexOf('min') <= -1 && item.indexOf('max') <= -1) && tt.form[item] !== ''){
                        var nameText = item, valText = '';
                        if(tt.baseConfig[item]){  //baseConfig中有的，取出对应的typename
                            for(var i = 0; i < tt.baseConfig[item].length; i++){
                                if(tt.form[item] == tt.baseConfig[item][i].id){
                                    valText = tt.baseConfig[item][i].typename;
                                    break;
                                }
                            }
                            if(!valText){
                                valText = '不限'
                            }
                            shaiArr.push({
                                'name':nameText,
                                'value':valText
                            })
                        }
                        if(item == 'sex'){
                            valText = tt.form[item] ? '女' : '男' ;
                            shaiArr.push({
                                'name':'sex',
                                'value':valText,
                            })
                        }else if(item == 'nature'){
                            if(jobNature && typeof(jobNature) == 'string'){

                                jobNature = JSON.parse(jobNature)
                            }
                            for(let i = 0; i < jobNature.length; i++){
                                if(jobNature[i].id == tt.form[item]){
                                    valText = jobNature[i].typename
                                    break;
                                }
                            }
                            shaiArr.push({
                                'name':'nature',
                                'value':valText,
                            })
                        }

                        if(item == 'postid' && tt.form[item]){  //职位选择的值
                            shaiArr.push({
                                'name':'postid',
                                'value':tt.currChosePostText
                            })
                        }

                    }
                } 
            }

        
                if(tt.form.min_age){
                    shaiArr.push({
                    'name':'age',
                    'value':tt.form.min_age + (tt.form.max_age ? ('-' + tt.form.max_age) + '岁': '岁以上')
                    })
                }else if(tt.form.max_age){
                    tt.form.min_age = 18
                    shaiArr.push({
                        'name':'age',
                        'value':tt.form.min_age + (tt.form.max_age ? ('-' + tt.form.max_age) + '岁': '岁以下')
                    })
                }
                if(tt.form.min_age ||tt.form.max_age ){
                    tt.ageText  = tt.form.min_age + (tt.form.max_age ? ('-' + tt.form.max_age) + '岁': '岁以下');  //input显示的值
                }


                if(tt.form.min_salary || tt.form.max_salary){
                    var salary = tt.form.min_salary + '-' + tt.form.max_salary
                    if(!tt.form.min_salary){
                        salary = tt.form.max_salary + '以下'
                    }
                    if(!tt.form.max_salary){
                        salary = tt.form.min_salary + '以上'
                    }
                    tt.salaryText  = salary;
                    shaiArr.push({
                        'name':'salary',
                        'value':salary
                    })
                }
                // if(tt.currChosePost){
                //     tt.shaiResult = shaiArr;
                // }
                tt.shaiResult = shaiArr;



            tt.paramArr = paramArr;
            tt.page = 1;
            tt.loadEnd = false;
            tt.getPersonList()
        },


        // 下载简历
        downloadResume(item,ind){
            var tt = this;
            if(item.private ){  //设置了隐私
                mapPop.confirmPop = true;
                mapPop.confirmPopInfo = {
                    icon:'',
                    title:'该简历不在公开人才库内，是否需要查阅？',
                    tip:'可询问求职者为您开放查阅权限',
                    popClass:'readResumePop',
                    btngroups:[
                        {
                            tit:'取消',
                            fn:function(){
                                mapPop.confirmPop = false;
                            },
                            type:''
                        },
                        {
                            tit:'询问查阅',
                            fn:function(){
                                mapPop.chatWithUser(item.userid);
                                mapPop.confirmPop = false;
                            },
                            type:'primary',
                        },
                        
                    ]
                }

                return false;
            }


            // 判断是否已开通套餐,或者已过期
            var currDate = parseInt(new Date().valueOf() / 1000)
            if((!mapPop.businessInfo.combo_id || (currDate > mapPop.businessInfo.combo_enddate && mapPop.businessInfo.combo_enddate != -1) ) && !mapPop.businessInfo.package_resume && !mapPop.businessInfo.can_resume_down){ //没有开通过套餐 并且没有下载次数
                mapPop.buyMeadlPop = true;
                return false;
            }




            // 显示下载简历弹窗
            mapPop.downResumePop = true;
            mapPop.downResumeDetail = {resume:item,type:'talent'};
            if(mapPop.businessInfo.combo_resume == -1){  //不限制下载次数
                mapPop.businessInfo.combo_resume = '不限'
                mapPop.businessInfo.can_resume_down = '不限'
            }
            if(mapPop.businessInfo.can_resume_down == 0 && mapPop.businessInfo.package_resume == 0){
                var  can_resume_down = mapPop.businessInfo.can_resume_down;
                var  combo_resume = mapPop.businessInfo.combo_resume ;
                mapPop.showErrTip = true;
                mapPop.showErrTipTit = '今日下载次数已用完('+can_resume_down+'/'+combo_resume+')';
            }

        },


        // 获取列表数据
        getPersonList(){
            var tt = this;
            tt.isload = true;
            if(tt.loadEnd) return false;
            tt.loadEnd = true;
            $.ajax({
				url: '/include/ajax.php?service=job&action=resumeList&page='+tt.page+'&pageSize=20&order='+tt.orderby,
				type: "POST",
				dataType: "jsonp",
                data:tt.paramArr.join('&'),
				success: function (data) {
                    tt.isload = false;
                    tt.loadEnd = false;
					if(data.state == 100){
                        tt.total = data.info.pageInfo.totalCount;
                        tt.personList = data.info.list;
                        // if(tt.page == 1){
                        // }else{
                        //     var list = data.info.list
                        //     for(var i = 0; i < list.length; i++){
                        //         tt.personList.push(list[i])
                        //     }
                        // }
                        // tt.page = tt.page + 1;
                        // if(tt.page > data.info.pageInfo.totalPage){
                        //     tt.loadEnd = true;
                        // }
					}else{
                        if(tt.page == 1){
                            tt.personList = [];
                        }
                        tt.total=0; 
                    }
				},
				error: function () { 
                    tt.isload = false;
                    tt.loadEnd = false;
				}
			});
        },

        changePage(val){
            const tt = this;
            tt.page = val;
            tt.getPersonList()
        },

        // 点击收藏简历
        collectResume(item,ind){
            var tt = this;
            var opt = item.collect ? 'del' : 'add'; //取消收藏/收藏

            $.ajax({
				url: '/include/ajax.php?service=member&action=collect&type='+opt+'&module=job&temp=resume&id='+item.id,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
                    if(data.state == 100){ //操作成功
                        // mapPop.successTip = true;
                        mapPop.successTipText = (opt == 'add' ? '成功收藏' : '已取消收藏');
                        tt.personList[ind].collect = (opt == 'add' ? 1 : 0)
                        mapPop.showErrTip = true;
                        mapPop.showErrTipdefine =  opt == 'add'  ? '<s class="success_icon"></s>收藏成功' :  '已取消收藏';
                        
                    }else{
                        mapPop.showErrTip = true;
                        mapPop.showErrTipTit = data.info
                    }
				},
				error: function (data) { 
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});
        },


        // 获取职位分类
        getCategoryList(){
            var tt = this;
            $.ajax({
				url: '/include/ajax.php?service=job&action=type&son=1',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
                    var categoryList =  data.info
                    if(tt.postArr.length == 0){
                        tt.currCategory = categoryList[0]
                    }
                    for(var i = 0; i < categoryList.length; i++){
                        var item = categoryList[i].lower;
                        var noLowerArr = [];
                        for(var m = 0; m < item.length; m++){
                            if(item[m].lower && item[m].lower.length){
                                tt.categoryShow = 1;
                                // break;
                            }else{
                                noLowerArr.push(item[m])
                            }
                        }
                        categoryList[i]['noLower'] = noLowerArr;
                    }

                    tt.categoryList = categoryList;

				},
				error: function (data) { 
                    console.log('网络错误，请稍后重试！')
				}
			});
        },

        // 类型滚动
        cateScroll(e){
            var tt = this;
            var el = event.currentTarget;
            var scrollTop = $(el).scrollTop();
            var currid = '';
            if(tt.categoryShow) return false;
            if(scrollTop <= 50){
                currid =  $(el).find('dl').eq(0).attr('data-id')
            }else{

                $(el).find('dl').each(function(){
                    var dl = $(this);
                    var top = dl.attr('data-top');
                    var topHeight = dl.attr('data-top') * 1 + dl.height();
                    
                    if(top <= scrollTop && topHeight >= scrollTop && !$(el).hasClass('onScroll') ){
                        currid = Number(dl.attr('data-id'));
                        return false;
                    }
                })
            }
            for(var i = 0; i < tt.categoryList.length; i++){
                if(tt.categoryList[i].id == currid){
                    tt.currCategory = tt.categoryList[i];
                    break;
                }
            }
        },


        // 增值包弹窗
        showpopularPop(){
            var tt = this;
            mapPop.popularAddPop = true;
            mapPop.noSingle = true;
            if(mapPop.popularType === 1){
                mapPop.getPackageList(1)
            }
        },


        // 调整链接
        goLink(url){
            var tt = this;
            var el = event.currentTarget;
            url = url ? url : $(el).attr('data-url');
            window.open(url)
        },

        // 点左边侧边栏
		checkConfig(item,ind){
			var el = event.currentTarget;
			var url = item ? item.link 
						: $(el).attr('data-url')  ? $(el).attr('data-url') 
						: $(el).attr('href')   ?   $(el).attr('href') : ''
			if(((job_cid && busi_state == 1) || ind <= 3 || 8<=ind) && url){
				window.location.href = (url)
			}else{

				var popTit  =   !job_cid ? '企业资料未完善' 
								:busi_state == 0 ? '企业资料审核中' 
								:busi_state == 2 ? '企业资料审核拒绝' : ''

				var popTip_1 = !job_cid ? '完善公司基本信息后，即可' 
								:busi_state == 0 ? '企业资料审核通过后，即可' 
								:busi_state == 2 ? '请修改企业资料，审核通过后，即可' : ''
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

        // 获取参数
        getUrlPrarm(name){
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return null;
        },
        // 获取应聘的职位
        getPosts: function () {
            var tt = this;
            $.ajax({
                url: '/include/ajax.php?service=job&action=postList&page=1&state=1,3,0&pageSize=10000&com=1',
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    if (data.state == 100) {
                        tt.postArr = data.info.list;
                        mapPop.postArr = data.info.list;
                    }
                },
                error: function () {

                }
            });
        },
    },

    watch:{
        // 监听要筛选的条件变动
        'form':{
            handler(newValue, oldValue) { // oldValue是activeArticle变化之前的值，newValue是activeArticle变化之后的值
                var tt = this;
                setTimeout(() => {
                    if(tt.ifShaixuan){
                        tt.checkShaiResult();
                    }else{
                        tt.ifShaixuan = true;
                    }
                }, 100);
            },
            deep: true
        },

        'form.pass_completion':function(){
            if(!this.finshed){
                this.ifShaixuan = false
            }
        },

        // 职位弹窗
        postCategoryPop:function(val){
            var tt = this;
            if(val && tt.categoryList && tt.categoryList.length == 0){ //第一次打开弹窗时
                tt.getCategoryList() 
            }
        },

        // 排序
        orderby:function(val){
            var tt = this;
            tt.page = 1;
            tt.loadEnd = false;
            tt.getPersonList();
        },


        // 跳转指定分类
        currCategory(val){
            var tt = this;
            if(!tt.categoryShow && val){

                setTimeout(() => {
                    var dl = $(".postArrList dl[data-id='"+val.id+"']");
                    if(!dl.length || !dl.attr('data-top')){
                        $(".postArrList dl").each(function(){
                            $(this).attr('data-top',$(this).position().top - 50)
                        })
                    }
                    setTimeout(() => {
                        $(".postArrList").scrollTop(dl.attr('data-top'))
                        $(".postArrList").addClass('onScroll');
                        setTimeout(function(){
                            $(".postArrList").removeClass('onScroll');
                        },600)
                    }, 100);
                }, 100);
            }
        }
    }
})