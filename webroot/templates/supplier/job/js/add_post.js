var timeInterVal = [];
let init = false; //初始化数据
var page = new Vue({
	el:'#page',
	data:{
		navList:navList,
		currid:3,
		hoverid:'',
		loading:false,
		changeBusiness:false,//是否修改工商信息
		uploadAction: '/include/upload.inc.php?mod=job&filetype=image&type=atlas',
		typeNameArr:[], //级联选择器
		form:{
			typeArr:'',
			type:'', //职位分类
			title:'',//职位名称
			number:'', //招聘人数
			mianyi:0, //是否面议
			valid:'', //有效期
			long_valid:'', //是否面议
			nature:'', //职位性质
			educational:'', //学历
			experience:'', //经验
			// selfLab:[],
			min_salary:'', //最低薪资
			max_salary:'',//最高薪资
			job_addr_id:'', //工作地址
			dy_salary:'', //是否双薪
			note:'', //描述
			claim:'',//任职要求
			tag:[], //职位标签
			min_age:'',
			max_age:'',
			salary_type:1, //2时薪 /1月薪
			cityid:cityid, //城市id
		},
		companyForm:{ //公司信息表单
			contact:'',//联系电话(必填)
			addrid_list:'', //地址（必填）
			address:'',//地址（必填）
			lng:'', //经纬度
			lat:'',
			people:'',  //联系人昵称（必填）
			people_job:'',
			people_pic_url:'', //联系人图片（必填）
			people_pic:'',//联系人图片（必填）
			title:'',//公司名称
			nature:'',//公司性质
			scale:'',//公司规模
			industry:'',//公司行业
			logo:'',//企业logo
			full_name:'',//企业全称
			business_license:'',//营业执照

		},
		posttypeb:false,//后台是否修改职位类别
		selfAddLab:false,
		currLab:'',
		workAddress:'', //工作地点
		jobAddrList:[],

		categoryList:[], //职位列表
		category_prop:{
			'label':'title',
			'value':'id',
			'children':'lower'
		}, //职位列表配置

		salaryArr:[1000,2000,3000,4000,5000,6000,7000,8000,9000,10000,15000,20000,25000],  //薪资配置
		salaryArr_add:[{ value:12, label:'无'},{ value:13, label:'13薪' },{ value:14, label:'14薪' },{ value:15, label:'15薪' },{ value:16, label:'16薪' },{ value:17, label:'17薪' },{ value:18, label:'18薪' },{ value:19, label:'19薪' },{ value:20, label:'20薪' }],
		
		baseConfig:'',  //'相关配置'	
		mapChose:'', //地址弹窗的相关信息
		error:{
			name:'',
			onError:false, //显示错误提示框
			tip:'', //错误提示
		},
		selfTag:[], //自定义标签
		validDate:'', //过期时间
		id:'',  //职位id,

		paramUrl:'',
		shan:false, //闪烁

		pickerOptions: {
            disabledDate: (time) => {
                let nowData = new Date()
                nowData = new Date(nowData.setDate(nowData.getDate() - 1))
                return time < nowData
            },
			shortcuts: [
				{
					text: '7天',
					onClick(picker) {
						let date= (+new Date() + 7*86400000);
						picker.$emit('pick', date);
					}
				},
				{
					text: '15天',
					onClick(picker) {
						let date= (+new Date()) + 15*86400000;
						picker.$emit('pick', date);
					}
				},
				{
					text: '1个月',
					onClick(picker) {
						let date= (+new Date()) + 30*86400000;
						picker.$emit('pick', date);
					}
				},
				{
					text: '2个月',
					onClick(picker) {
						let date= (+new Date()) + 60*86400000;
						picker.$emit('pick', date);
					}
				},
				{
					text: '3个月',
					onClick(picker) {
						let date= (+new Date()) + 90*86400000;
						picker.$emit('pick', date);
					}
				}
			]
        },

		detailInfo:'', //招聘信息的详情

		loadEnd:false, //信息是否全部加载
		changeData:false, //是否修改过值
		selfLabFocus:false, //是否聚焦自定义标签
		businessInfo:'',
		dy_salary:'',
		// 地址选择的属性配置
		options:[],
		props:{
			lazy:true,
			value:'id',
			label:'typename',
			lazyLoad(node, resolve){
				// const { level } = node;
				var url = "/include/ajax.php?service=siteConfig&action=area&type=" + (node && node.data ? node.data.id : '');
					var tt =this;
					axios({
						method: 'post',
						url: url,
					})
					.then((response)=>{
						var data = response.data;
						var array = data.info.map(function(item){
							var leaf = item.lower ?   '' : 'leaf:true';
							return {
								id: (item.id),
								typename: item.typename,
								lower: item.lower,
								leaf,
							}
						})
						resolve(array)
					});
			},
		},
		companyAddrb:false,
		needpeople:true, //招聘人数占位符
	},
	mounted() {
		var tt = this;
		if(typeof(aiConJs) !== 'undefined'){
			aiConJs.initAi('job',tt.getSearchKey,tt.returnData)
		}
		if(tt.getUrlPrarm('id')){
			tt.id = tt.getUrlPrarm('id');
			tt.form['id'] = tt.id
			tt.getDetail()
		}else{
			init = true;
			setTimeout(() => {
				tt.loadEnd = true;
			}, 300);
		}

		

		// 获取职位类别
		tt.getCategoryList();
		// 获取相关配置
		tt.getBaseConfig();

		tt.getAllAddrList('all');
		


		// 查看是否能跟上架职位
		tt.checkPackage();

		tt.getBusinessInfo()
	

		window.onbeforeunload = function () {
			if(tt.changeData){
				return '如直接离开页面，将放弃修改内容'
			}
		};


		$('body .topBox').delegate('a','click',function(){
			var t = $(this);
			if(tt.changeData && t.attr('data-href')){
				tt.currid = 3;
				tt.saveDataConfirm(function(){
					var url = t.attr('data-href');
					tt.changeData=false;
					tt.$nextTick(res=>{
						window.open(url)
					})
				},function(){
					tt.checkFormRules()
				});
				return false;
			}
		})		
	},
	methods:{
		setValue(area){
			var tt = this;
			let cs = tt.$refs.cascaderAddr;  
            if(cs && cs.panel){
                cs.panel.activePath=[];  
                cs.panel.loadCount = 0;  
                cs.panel.lazyLoad();
            }
		},
		// 清空聚焦
		salaryfocus(state){
			const el = event.currentTarget;
			if(state==0){
				this.form.min_salary='';
			}else{
				this.form.max_salary='';
			}
			$(el).closest('.el-input').find('input').focus();
		},
		// 薪资矫正
		adjustSalary(state){
			if(state==0){ //最小薪资
				if(this.form.min_salary<1000){
					this.form.min_salary=1000;
					$('.warntext span').show();
				}else if(this.form.min_salary<10000){
					this.form.min_salary=Math.floor(this.form.min_salary/100)*100;
					$('.warntext span').hide();
				}else{
					this.form.min_salary=Math.floor(this.form.min_salary/1000)*1000;
					$('.warntext span').hide();
				}
			}else{ //最大薪资
				if(this.form.max_salary<1000){
					this.form.max_salary=1000;
					$('.warntext span').show();
				}else if(this.form.max_salary<10000&&this.form.max_salary){
					this.form.max_salary=Math.ceil(this.form.max_salary/100)*100;
					$('.warntext span').hide();
				}else{
					this.form.max_salary=Math.ceil(this.form.max_salary/1000)*1000;
					$('.warntext span').hide();
				}
			}
			if(this.form.max_salary>0&&(this.form.min_salary>this.form.max_salary)){ //最小值超过最大值
				if(this.form.min_salary<10000){
					this.form.max_salary=Number(this.form.min_salary)+100;
				}else{
					this.form.max_salary=Number(this.form.min_salary)+1000;
				}
			}
		},
		// 薪资配置
		salaryConfig() {
			const tt = this;
			let salaryArr = [];

		},
		// 图片开始上传
		handleChange: function (file, fileList) {

			var tt = this;
			let el = event.currentTarget;
			var prop_name = $(el).closest('.uploadBtn').attr('data-name')
			let fileName = file.name;
			let regex = /(.png|.jpg|.jpeg|.bmp|.gif)$/;
			tt.currName = prop_name;
			if (regex.test(fileName)) {
				var ImgPreview = URL.createObjectURL(file.raw);
				if (prop_name == 'avatar') {
					tt.companyForm['people_pic_url'] = ImgPreview;
					tt.companyForm.random_people_pic = ''
				}

			}
		},
		// 图片上传过程中
		handlePogress: function (event, file, fileList) {
			var tt = this;
			const htmlDom = '<div class="progress"><span></span></div>';
			const prviewImg = $('.uploadBtn[data-name="' + tt.currName + '"] .prviewImg')
			prviewImg.find('.resetImg').hide();
			$percent = prviewImg.find('.progress span');
			if (!$percent.length) {
				$percent = $('<p class="progress"><span></span></p>')
					.appendTo(prviewImg)
					.find('span');
			}
			setTimeout(() => {
				$percent.css('width', event.percent + '%');
			}, 200);
		},
		// 图片上传成功
		handleSuccess(response, file, fileList){
			var tt = this;
			if(tt.currName == 'avatar'){
				tt.companyForm['people_pic'] = response.url;
				tt.companyForm['people_pic_url'] = response.turl;
			}
			for(let i = 0; i < fileList.length; i++){
				const prviewImg = $('.uploadBtn[data-name="'+tt.currName+'"] .prviewImg').eq(i)
				prviewImg.find('.resetImg').show();
				prviewImg.find('.progress').remove();
			}
		},
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
						mapPop.businessInfo = data.info;
						tt.companyForm.title=data.info.title;//公司名称
						tt.companyForm.nature=data.info.natureid;//公司性质
						tt.companyForm.scale=data.info.scaleid;//公司规模
						tt.companyForm.industry=data.info.industryid;//公司行业
						tt.companyForm.logo=data.info.logo;//企业logo
						tt.companyForm.full_name=data.info.full_name;//企业全称
						tt.companyForm.business_license=data.info.business_license;//营业执照
                    }
				},
				error: function (data) { 
                    mapPop.showErrTip = true;
                    mapPop.showErrTipTit = '网络错误，请稍后重试！'
				}
			});
        },
		// 左侧跳转链接
		goLink(url,ind){
			var tt = this;
			if(tt.changeData){
				tt.saveDataConfirm(function(){
					tt.currid = ind;
					tt.changeData=false;
					window.location.href = url;
				},function(){
					tt.checkFormRules()
				});
			}else{
				tt.currid = ind;
				window.location.href = url;
			}
		},

		// 离开页面 是否保存数据
		saveDataConfirm(callback1,callback2){
			mapPop.confirmPop = true;
			mapPop.callback=true;
			mapPop.confirmPopInfo = {
				icon:'error',
				title:'是否保存当前职位内容',
				tip:'如直接离开页面，将放弃修改内容',
				btngroups:[
					{
						tit:'不保存',
						cls:'btn_mid_140',
						fn:function(){
							if(callback1){
								callback1()
							}else{
								mapPop.confirmPop = false;
							}
						},
						type:''
					},
					{
						tit:'保存并离开',
						cls:'btn_mid_140',
						fn:function(){
							mapPop.confirmPop = false;
							if(callback2){
								callback2()
							}
						},
						type:'primary',
					},
					
				],
				closeFn:function(){
					mapPop.confirmPop = false;
					callback1()
				}
			};
		},

		addTag:function(item){  //自定义和选择的一共最多只能3个
			var tt = this;
			if(tt.form.tag.indexOf(item.typename) > -1){
				tt.form.tag.splice(tt.form.tag.indexOf(item.typename),1)
			}else{
				if((tt.form.tag.length + tt.selfTag.length) < 3){
					tt.form.tag.push(item.typename)
				}else{
					tt.showTips();
				}
			}
		},


		// 新增自定义职位标签
		addLab:function(){
			var tt = this;
			if(!tt.currLab){
				return
			};
			if((tt.form.tag.length + tt.selfTag.length) < 3){
				tt.selfTag.push(tt.currLab);
				tt.currLab = ''
			}else{
				tt.showTips();
			}
		},

		// 显示自定义
		showSelfInp(){
			const tt = this;
			if(tt.selfAddLab) return false;
			if(tt.form.tag.length < 3){
				tt.selfAddLab = true
			}else{
				tt.showTips()
			}
		},

		// 显示提示
		showTips(){
			let tt = this;
			$('.el-form-item.post_lab').find('.err_tip').addClass('blink-1');
			tt.currLab = '';
			setTimeout(() => {
				$('.el-form-item.post_lab').find('.err_tip').removeClass('blink-1')	
			}, 1000);
		},


		// 删除职位标签
		removeLab(item,ind){
			var tt = this;
			tt.selfTag.splice(ind,1)
		},

		// 查看是否能上架职位
		checkPackage(){
			var tt = this;
			var ifCanJobs = (combo_id == '0' || combo_enddate < parseInt(new Date().valueOf() / 1000) || combo_enddate == -1); //是否是会员/已过期 combo_enddate -1表示永久有效
			// 未开通套餐
			if(ifCanJobs && canJobs == '0'){ //已过期 或者未开通
				mapPop.buyMeadlPop = true;
			}else if(canJobs == '0'){
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
                                tt.showPopularPop();
                            },
                            type:'primary',
                        },
                        
                    ]
                };
			}
		},

		// 获取职位分类
        getCategoryList(){
            var tt = this;
            $.ajax({
				url: '/include/ajax.php?service=job&action=type&son=1',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
                    var categoryList =  data.info;
                    tt.categoryList = categoryList;
					//判断后台是否修改职位类别
					let lengths=0;
					function cycle(ele,id){ //循环遍历
						for(let i=0;i<ele.length;i++){
							if(ele[i].id==id){
								++lengths //在本级下面找到的话就+1
								return ele[i] //返回找到的类别
							}
						};
					};
					let result;
					for(let i=0;i<tt.form.typeArr.length;i++){
						result=cycle(i==0?data.info:result.lower,tt.form.typeArr[i]);
						if(lengths==i){ //在本级没找到,提前结束循环
							break;
						};
					};
					tt.posttypeb=(lengths==tt.form.typeArr.length?false:true); //级数相等表示后台没改	
				},
				error: function (data) { 
                    console.log('网络错误，请稍后重试！')
				}
			});
        },

		// 获取相关配置
		getBaseConfig(){
			var tt = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=getItem&name=jobTag,jobNature,education,experience,welfare',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){
						tt.baseConfig = data.info;
						tt.form.nature = tt.baseConfig['jobNature'][0].id
					}
				},
				error: function () { 

				}
			});
		},

		// 获取地址/	// 提交新增地址的请求
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
							if(tt.jobAddrList.length == 1){
								tt.form.job_addr_id = tt.jobAddrList[0].id;
							}
						}else{
							// 新增地址
							tt.form.job_addr_id = data.info;
							for(var i = 0; i < tt.jobAddrList.length; i++){
								if(tt.jobAddrList[i].id == 0){
									tt.jobAddrList[i].id = data.info;
									break;
								}
							}
							if(tt.paramUrl && tt.paramUrl == 'valid'){  //点击重新发布进入页面
								// 显示支付弹窗,发布职位
								tt.showPopularPop(tt.detailInfo);
								return false;
							}else{  
								tt.submitPost();
							}

						}

					}else{
						// 新增地址失败
						tt.loading = false;
                        mapPop.showErrTip = true;
                        mapPop.showErrTipTit = data.info;
					}
				},
				error: function () { 

				}
			});
		},

		// 新增地址
		addNewAddr(state){
			var tt = this;
			mapPop.showPop = true;
			mapPop.hasLoad=false;
			if(state){ //公司地址
				mapPop.addrDeatil=tt.companyForm.address;
				tt.companyAddrb=true;
			}else{
				mapPop.getSuggestion();
				// mapPop.addrDeatil='';
				tt.companyAddrb=false;
			}
		},

		//公司地址文本
		changeMapAreaText(res){
            var tt = this;
			if(tt.mapChose && tt.mapChose.mapAreaText){
				$(".addridBox input").val(tt.mapChose.mapAreaText.join('/'));	
			}
		},
		// 选择区域
		changeArea(res) {
			var tt = this;
			tt.companyForm.addrid_list = res;
			tt.form.job_addr_id=res;
			mapPop.mapArea=res;
			mapPop.areaEnd=res?true:false;
		},
		// 显示支付弹窗,发布职位
        showPopularPop(){
            var tt = this;
            var paramArr = []
            paramArr.push('type=6'); //上架职位
            paramArr.push('num=2'); //上架职位
			
            $.ajax({
				url: '/include/ajax.php?service=job&action=pay'  ,
				type: "POST",
                data:paramArr.join('&'),
				dataType: "jsonp",
				success: function (data) {
					tt.loading = false;
                    if(data.state == 100){
                        mapPop.popularAddPop = true;
                        mapPop.singleType = 6;
                        mapPop.singleForm.offPost = 2;
                        var datainfo = [];
                        for (var k in data.info) {
                            datainfo.push(k + '=' + data.info[k]);
                        }
                        var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
                        mapPop.singleForm.payCount = data.info.order_amount
                        mapPop.singleForm.paySrc = masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src)
                        var ordernum = data.info.ordernum;
                        mapPop.payObj = data.info;
                        if (payResultInterval == null) {
                            mapPop.checkTradeResult(ordernum,function(){  //支付成功支付提交数据
								tt.submitPost()
							})
                        }

						callBack_fun_success = function(){
							tt.submitPost()
						}
                    }
                },
            })
        },
		// 验证数据
		checkFormRules(){
			var tt = this;
			tt.loading = true;
			tt.error.name = '';
			tt.error.onError = false;
			if(!tt.form.number){ //人数默认为1
				tt.form.number=1;
			};
			var requireArr = ['type','title','number','nature','educational','note','job_addr_id'];
			if(tt.form.nature!=3){ //实习校招不需要验证经验
				requireArr.push('experience');
			}
			for(var item in tt.form){
				tt.error.tip = '';
				if((item == 'valid' || item == 'long_valid')){
					var currDate = parseInt(new Date().valueOf() / 1000)
					if(!tt.form['valid'] && !tt.form['long_valid']){
						tt.error.name = 'valid';
						tt.error.onError = true;
						tt.error.tip = '请选择有效期';
						break;
					}else if(!tt.form['long_valid'] && tt.form['valid'] && tt.form['valid'] < currDate){
						tt.error.name = 'valid';
						tt.error.onError = true;
						tt.error.tip = '请修改有效期,有效期不能小于当前日期';
						break;
					}
				}else if((item == 'min_salary' || item == 'max_salary')&&!tt.form.mianyi){
					if(!tt.form[item]){
						tt.error.name = 'salary';
						tt.error.onError = true;
						tt.error.tip = '请填写'+(item == 'min_salary' ? '最低' : '最高')+'薪资';
						break;
					}
					
				}else if(requireArr.indexOf(item) > -1 && tt.form[item] === ''){
					if(item == 'title'){
						tt.error.tip = '请填写标题'
					}

					tt.error.name = item;
					tt.error.onError = true;
					break;

				}
			}

			if (!tt.businessInfo.contact || !tt.businessInfo.people||!tt.businessInfo.address) {//公司表单验证
				let requireArrs=['contact','address','people','people_job','addrid_list','people_pic'];
				for (let item in tt.companyForm) { 
					if(requireArrs.indexOf(item) > -1 && !tt.companyForm[item]){ //
						tt.error.name = item;
						tt.error.onError = true;
						break;
					};
				}
			}

			if(tt.error.onError || !tt.checkNumber('number')){
				tt.loading = false;
				if(tt.error.name=='people_job'||tt.error.name=='people_pic'){
					tt.error.name='people';
				}else if(tt.error.name=='addrid_list'){
					tt.error.name='address';
				};
				var editObj = $(".el-form-item[data-name='"+tt.error.name+"']");
				$(window).scrollTop(editObj.position().top -80)
				return false;
			}
			tt.error.name = '';
			tt.error.onError = false;
			tt.error.tip = '';
			if(tt.form.job_addr_id == 0){ //新增职位
				tt.getAllAddrList('add'); //新增地址
			}else{
				var currDate = parseInt(new Date().valueOf() / 1000);
				if(tt.paramUrl && tt.paramUrl == 'valid' && !tt.businessInfo.canJobs &&( tt.businessInfo.combo_enddate > currDate ||tt.businessInfo.combo_enddate == -1 ) && tt.businessInfo.combo_id){  //点击重新发布进入页面,是会员 在有效期内 不能再发布职位了
					// 显示支付弹窗,发布职位
					tt.showPopularPop(tt.detailInfo)
					return false;
				}else{  
					tt.submitPost();
				}
			}
		},
		// 提交请求
		submitPost(){
			var tt = this;
			tt.loading = true;
			if(tt.selfTag && tt.selfTag.length){
				tt.form.tag = tt.form.tag.concat(tt.selfTag)
			}
			var paramStr = ''
			if(tt.id){
				paramStr = '&id=' + tt.id
			}

			if(tt.paramUrl && tt.paramUrl == 'valid'){
				paramStr = '&shangjia=1'
			}

			if(tt.form.long_valid){
				tt.form.long_valid = 1
			}else{
				tt.form.long_valid = 0
			}
			if(tt.form.mianyi){
				tt.form.mianyi = 1
			}else{
				tt.form.mianyi = 0
			}
			async function submit(){ 
				let subdata=JSON.parse(JSON.stringify(tt.companyForm));
				subdata.addrid=subdata.addrid_list[subdata.addrid_list.length-1];
				delete subdata['addrid_list'];
				let access='';
				if(!tt.form.number){
					tt.form.number=1;
				}
				if(!tt.businessInfo.address){
					access=await $.ajax({
						url: '/include/ajax.php?service=job&action=storeConfig',
						type: "POST",
						data:subdata,	
						dataType: "jsonp",
						success: function (data) {
							if(data.state != 100){
								mapPop.showErrTip = true;
								mapPop.showErrTipTit = data.info;
								tt.loading = false; 
							}
						},
						error: function () { 
							tt.loading = false; 
							mapPop.showErrTip = true;
							mapPop.showErrTipTit = '网络错误，请稍后重试';
						}
					});
				};
				if(access){
					tt.form.job_addr_id=access.info.job_addrid;
					console.log(tt.form,access,access.info.job_addrid);
				};
				console.log(tt.form,access);
				if(tt.businessInfo.address||(access&&access.state==100)){
					await $.ajax({
						url: '/include/ajax.php?service=job&action=aePost' + paramStr,
						type: "POST",
						data:tt.form,
						dataType: "jsonp",
						success: function (data) {
							tt.loading = false;
							if(data.state == 100){
								tt.id=data.info;
								tt.form.long_valid = tt.form.long_valid ? true : false;  //长期招聘
								tt.form.mianyi = tt.form.mianyi ? true : false; //面议
								tt.changeData = false;
								if(customAgentCheck){ //不需要审核
									mapPop.successTip = true;
									mapPop.successTipText = tt.id ? '更新成功':'职位发布成功';
									setTimeout(() => {
										tt.changeData = false;
										window.location.href = masterDomain + '/supplier/job/postManage.html'
									}, 2000);
								}else{
									tt.changeData=false;
									var btns = [];
									var tip = '审核通过后即可展示职位信息，现在您可进行以下操作'
									if(changeCheck){
										btns = [{
											tit:'再发一条',
											cls:'btn_repeat',
											fn:function(){
												tt.changeData=false;
												window.location.href =  masterDomain + '/supplier/job/add_post.html'
											},
										},
										{
											tit:'管理职位',
											cls:'btn_blue',
											fn:function(){
												tt.changeData=false;
												window.location.href = masterDomain + '/supplier/job/postManage.html?tab=1'
											},
										},
										{
											tit:'预览职位',
											cls:'btn_blue',
											fn:function(res){
												event.stopPropagation();
												tt.changeData=false;
												open(jobChannel + '/job?id='+data.aid)
												confirmPop.confirmPop=true;
											},
										}]
									}else{
										tip = '企业资料审核中，与职位一并审核成功后，职位即可显示'
										btns = [{
											tit:'再发一条',
											fn:function(){
												window.location.href =  masterDomain + '/supplier/job/add_post.html'
											},
											type:'primary'
										},
										{
											tit:'预览职位',
											fn:function(res){
												open(jobChannel + '/job?id='+tt.id)
											},
										}]
									};
									mapPop.confirmPop = true;
									mapPop.confirmPopInfo = {
										icon:'success',
										title: typeof(tt.id)=='number' ? '职位发布成功！请等待审核':'更新成功',
										tip:tip,
										btngroups:btns,
										closeFun:function(){
											tt.$nextTick(() => {
												tt.changeData=false;
												window.location.href = masterDomain + '/supplier/job/postManage.html'
											})
										}
									}
								}
							}else{
								tt.loading = false;
								mapPop.showErrTip = true;
								mapPop.showErrTipTit = data.info;
		
							}
						},
						error: res=>{ 
							this.loading=false;
							mapPop.showErrTip = true;
							mapPop.showErrTipTit = '网络错误，请稍后重试';
						}
					});
				}
			};
			submit();

		},

		// 获取参数
        getUrlPrarm(name){
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return null;
        },

		// 获取详情
		getDetail(){
			var tt = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=postDetail&id='+tt.id+'&store=1',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){
						var detailInfo = data.info;
						// tt.form.typeArr = detailInfo.typeid_list 
						tt.detailInfo = detailInfo;
                        tt.typeNameArr = detailInfo['typename_list'];
						for(var item in tt.form){
							var key = item;
							var paramArr = ['type','nature','educational','experience',]
							if(paramArr.indexOf(key) > -1){
								key = key + 'id'
							}else if(key == 'job_addr_id'){
								key = 'job_addr';
							}else if(key == 'experience_id'){
								key = 'job_addr';
							}else if(key == 'typeArr'){
								key = 'typeid_list'
							}
                            if((key == 'min_salary' || key == 'max_salary') && detailInfo[key] == 0){
                                detailInfo[key] = '';
                            }
							tt.form[item] = detailInfo[key]
							if(key == 'long_valid'){
								tt.form[item] = detailInfo[key] ? true : false;
							}
							if(key == 'mianyi'){
								tt.form[item] = detailInfo[key] ? true : false;
							}
						}

						// 带参数
						if(tt.getUrlPrarm('param')){
							tt.paramUrl = tt.getUrlPrarm('param');
							tt.shan = true;
							setTimeout(() => {
								tt.shan = false;
							}, 3000);
						}
						setTimeout(() => {
							tt.loadEnd = true;
						}, 300);
					}else{
						tt.loadEnd = true;
					}
				},
				error: function () { 

				}
			});
		},

		// 向后台提交数据


		checkNumber(param){
			var tt = this;
			var val= tt.form[param];
			var reg = /^[0-9]*$/g;
			var result = true;
			// tt.form[param] = tt.form[param].replace(/[^\d]/g,'')
			if(val && !reg.test(val)){
				result = false;
				tt.error.name = param;
				tt.error.onError = true;
				tt.error.tip = '请填入数字';
			}else if(!val){
				tt.form.number='';
			}else{
				tt.error.name = '';
				tt.error.onError = false;
				tt.error.tip = '';
			}
			;
			return result
		},

		changeType(){
			this.typeNameArr = JSON.parse(JSON.stringify(this.$refs.cascaderType.getCheckedNodes()[0].pathLabels))
		},

		// ai数据处理
		getSearchKey:function(){
			const that = this
			let typename = that.typeNameArr.join('-');
			let options = [],keyArr = [];
			let salaryName = ''
			if(!that.form.type || !typename ){
				that.$message({
					message: '请先选择职位分类',
					type: 'error',
				});
				return false;
			}
			keyArr.push(typename)
			if(!that.form.title){
				that.$message({
					message: '请先输入职位名称',
					type: 'error'
				});
				return false;
			}
			options.push(that.form.title)
			
			if(that.form.mianyi){
				options.push(`薪资:面议`)
			}else{
				let salary = that.form.min_salary
				if(!salary){
					salary =  that.form.max_salary
				}else{
					salary = salary + (that.form.max_salary ? '-' : '' ) + that.form.max_salary
				}
				if(salary){

					options.push(`薪资:${salary}`)
				}

				salaryName = salary
			}
			keyArr.push(options.join(','))
			return {
				typename:typename,
				note:that.form.note.trim(),
				options:options,
			}
		},
		returnData:function(data){
			const that = this
			that.form.note = data.content
		}
    },
	watch:{
		mapChose:function(val){
			var tt = this;
			var obj = {
				id:0,
				add:true,
				lng:val.currMarker.lng,
				lat:val.currMarker.lat,
				address:val.addrDeatil,
				addrid:val.mapArea ? val.mapArea[val.mapArea.length - 1] : 0
			}
			if(tt.companyAddrb){ //公司地址
				tt.companyForm.lat=obj.lat;
				tt.companyForm.lng=obj.lng;
				tt.companyForm.address=obj.address;
				tt.companyForm.addrid_list=val.mapArea;
				tt.setValue();
			}else{ //职位地址
				for(var i = 0; i < tt.jobAddrList.length; i++){
					if(tt.jobAddrList[i].id == 0){
						tt.jobAddrList.splice(i,1)
						break;
					}
				}
				tt.jobAddrList.unshift(obj)
				tt.form.job_addr_id = 0;
			}

		},
		'form.typeArr':function(val){
			// 同步职位名称
			var tt = this;
			if(!tt.form.title){
				setTimeout(() => {
					tt.form.title=$('.bigInp .el-input__inner').val();
				}, 0);
			};
			if(val && val.length > 0){
				tt.form.type = val[val.length - 1]
			};
		},

		'form.nature':function(val){
			console.log(val);
			var tt = this;
			if(val == 2 || val == 4){
				tt.form.salary_type = 2;
			}
		},

		// validDate:function(val){
		// 	var tt = this;
		// 	if(val){
		// 		tt.form.valid = (val.valueOf()/1000 + 86400 - 1);
		// 	}
		// },
		
		'form.valid':function(val){
			var tt = this;
			if(val && !init){
				init = true;
				tt.validDate = new Date(val * 1000)
			}
		},
		'baseConfig.jobTag':function(val){
			var tt = this;
			var tagArr = JSON.parse(JSON.stringify(tt.form.tag));
			var tag = [];
			if(tt.id && tt.form.tag && tt.form.tag.length && !tt.selfAddLab){
				for(var i = 0; i < val.length; i++){
					if(tagArr.indexOf(val[i].typename) > -1){
						tag.push(val[i].typename)
						tagArr.splice(tagArr.indexOf(val[i].typename),1)
					}
				}
				if(tagArr.length){
					tt.selfTag = tagArr;
					tt.selfAddLab = true
				}
				tt.form.tag = tag;
			}

		},
		
		form:{
			handler(val, oldVal){
				var tt = this;
				if(tt.loadEnd){
					tt.changeData = true;
				}
            },
            deep:true
		},

		'form.long_valid':function(val){
			const tt = this;
			if(val){
				tt.validDate = ''
				tt["form.valid"] = ''
			}
		},

		'validDate':function(val){
			const tt = this;
			if(val){
				tt.form.long_valid = false;
				tt.form.valid = (val.valueOf()/1000 + 86400 - 1);
			}
		},

		dy_salary:function(val){
			if(val==12){
				this.dy_salary='';
			}
			if(val == ''){
				this.form.dy_salary = 12
			}else{
				this.form.dy_salary = val
			}
		}
	}
})