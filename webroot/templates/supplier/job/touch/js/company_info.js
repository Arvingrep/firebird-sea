toggleDragRefresh('off');
var pageVue = new Vue({
    el:'#page',
    data:{
		changeCheck:Number(changeCheck), //敏感信息是否需要审核
		direct:direct, //1直接通过url进入， 0是点击其他页面跳转而来
        currTab:currtab, //0 => 基础信息  1=> 工商信息  2=>联系方式   3=> 公司简介/相册
        tabArr:['基础信息','工商信息','联系方式','公司简介','公司相册'],
        hasConfig:hasConfig, //是否是第一次配置
        changeBusiness:false, //是否修改工商信息
        editPics:false, //管理图片
		editPicsArr:[], //所选数组
        isload:false, //是否正在加载信息
		addridsArr:[],
		addrNameArr:[],
		gsInfo:'', //自动同步的工商信息
        formData:{
            title:'', //标题
            nature:'', //公司性质
			nature_name:'', //公司性质标题
			scale:'', //规模
			scale_name:'',
			industry:'',  //行业
			industry_name:'', 
            body:'', //公司简介
			logo:'', 
			logo_url:'',
			full_name:'', //企业全称
			business_license:'', //营业执照
			business_license_url:'',
			enterprise_type:'',  //企业类型
			enterprise_establish:'', //成立日期
			enterprise_money:'',  //成立资金
			enterprise_people:'', //法人

			people:'', //联系人
			people_job:'', //联系人职位
			people_pic:'', //联系人头像
			people_pic_url:'', //联系人头像
			contact:'', //联系方式
			email:'', //联系人的邮箱
			site:'', //公司网址
			addrid_list:[],      //公司所属区域
			addrid:'',      //公司所属区域
			addr:'',      //公司所属区域
			address:'', //公司详细地址
			cityid:cityid, //城市id
			lng:'',  //坐标
			lat:'',  //坐标

			welfare:[],
			pics:[], //图片相册

			work_time_s:'',  //工作开始时间
			work_time_e:'',  //工作结束时间
			rest_flag:'', //2是单休，1是双休
			work_over:'', //2是不加班，1是加班
		},
		textCount:0, //公司简介字数统计
		textContent:'', //公司简介内容

		businessInfo:{
			industryid_list:industryid_list,
		},
		industry:[], //行业分类
        baseConfig:{},
        showPop:false, //弹窗控制
		showType:'',
		fileList:[], //相册
		logoObj:[], //
		licenceObj:[], //营业资质
		photoObj:[], //头像
		successPop:false,
		maxDate:new Date(),
		minDate:new Date(new Date().setFullYear(1960)),

		sensitiveInfo:{},  //敏感信息修改
		never_showCompanyTip : false,
    },

    mounted(){
		const that = this;
        if(this.currTab >= 3){
            this.checkLeft();
        }
        
		// this.never_showCompanyTip = localStorage.getItem('never_showCompanyTip') != null && localStorage.getItem('never_showCompanyTip') == this.currTab ?  true : false; //是否隐藏未通过的提示

		if(localStorage.getItem('never_showCompanyTip')  && localStorage.getItem('never_showCompanyTip') == that.currTab){
			that.never_showCompanyTip = true
		}

		this.resolveReturnData();
		this.getBaseConfig()
		this.getIndustry()
		if(this.hasConfig){
			this.getCompanyDetail()
		}


		$('.formItem').each(function(){
			$(this).attr('data-top',$(this).offset().top)
		})

    },

    methods:{

		// 删除logo
		changeLogo(){
			const that = this;
			console.log(that.logoObj);
		},	


        // 公司简介和相册切换 蓝线
        checkLeft(){
			left = 0
			if($(".header-address.tabBox .on_chose").length ){

				left = $(".header-address.tabBox .on_chose").position().left + $(".header-address.tabBox .on_chose").width() / 2  - $(".header-address.tabBox s").width() / 2;
			}
            
            $(".header-address.tabBox s").css({
                left:left
            })
        },

        // 获取配置
		getBaseConfig(){
			var that = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=getItem&name=welfare,nature,scale',
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data.state == 100){
						that.baseConfig = data.info;

						that.$nextTick(() => {
							const arr = ['scale','nature']
							arr.forEach(function(val){
								const ind = that.baseConfig[val].findIndex(item => {
									return item.id == that.formData[val]
								})
								that.$refs[val].setIndexes([ind])
							})
						
						})
					}
				},
				error: function () { 

				}
			});
		},

		

        // 如果配置过信息 ，需要获取信息
        // 获取公司配置的详情
		getCompanyDetail(){
			var that = this;
            if(that.isload) return false;
			that.isload = true
			$.ajax({
				url: '/include/ajax.php?service=job&action=companyDetail&other_param=addr',
				type: "POST",
				dataType: "json",
				success: function (data) {
					that.isload = false;
					if(data.state == 100){
						that.getBaseConfig()
						that.getIndustry()
						that.businessInfo = data.info;
						
						let infoData = localStorage.getItem('infoData');
						if(infoData) {
							localStorage.removeItem('infoData')
							return false;

						}

						

						that.formData.title = data.info.title;
						that.formData.cityid = data.info.cityid;
						that.formData.full_name = data.info.full_name;
						that.formData.logo = data.info.logo;
						that.formData.logo_url = data.info.logo_url;
						that.logoObj = [{
							url:data.info.logo_url,
							value:data.info.logo
						}]
						that.licenceObj = [{
							url:data.info.business_license_url,
							value:data.info.business_license
						}]
						that.photoObj = [{
							url:data.info.people_pic_url,
							value:data.info.people_pic
						}]

						console.log(that.logoObj,that.licenceObj,that.photoObj);
						that.formData.industry_pid = data.info.industryid_list[0] + '' //行业分类
						that.formData.industry = data.info.industryid + '';
						that.formData.industry_name = data.info.industry;
						// that.$refs.industry.setColumnValues()
						

						that.formData.people = data.info.people; //联系人
						that.formData.people_job = data.info.people_job; //联系人职位
						//avatarPath:'', //联系人头像
						that.formData.people_pic = data.info.people_pic; //联系人头像
						that.formData.random_people_pic = data.info.random_people_pic; //联系人头像id
						that.formData.people_pic_url = data.info.people_pic_url; //联系人头像
						that.formData.business_license = data.info.business_license; //营业执照
						that.formData.business_license_url = data.info.business_license_url; //营业执照
						that.formData.contact = data.info.contact;//联系方式
						that.formData.email = data.info.email, //联系人的邮箱
						that.formData.site = data.info.site; //公司网址

						var addrlist = data.info.addrid_list;
						addrlist = addrlist.map(function(val){
							return val.toString();
						});    
						that.formData.addrid_list = addrlist;  //公司所属区域
						
						that.formData.addrid = data.info.addrid;     //公司所属区域
						that.formData.addr = data.info.addr;     //公司所属区域
						that.formData.address = data.info.address;     //公司详细地址
						that.formData.lng = data.info.lng;     //公司坐标
						that.formData.lat = data.info.lat;     //公司坐标

						
						that.textContent = data.info.body
						that.formData.body = data.info.body;      //公司所属区域
						console.log(that.formData['body'])
						// 工商信息
						that.formData.enterprise_type = data.info.enterprise_type ? data.info.enterprise_type : data.info.nature;
						that.formData.enterprise_establish = data.info.enterprise_establish ?  data.info.enterprise_establish : 0;
						// console.log(that.formData.enterprise_establish,data.info.enterprise_establish);
						that.formData.enterprise_money = data.info.enterprise_money.replace(/[^\d]/g,'');
						that.formData.enterprise_people = data.info.enterprise_people;
						that.formData.work_time_s = data.info.work_time_s;
						that.formData.work_time_e = data.info.work_time_e;
						that.formData.rest_flag = data.info.rest_flag; //2是单休，1是双休
						that.formData.work_over = data.info.work_over; //2是不加班，1是加班
						that.timePicker = [data.info.work_time_s ? data.info.work_time_s : '',data.info.work_time_e ? data.info.work_time_e : '']
						that.formData.welfare =  data.info.welfare; //公司福利
						that.formData.scale =  data.info.scaleid; //公司规模
						that.formData.scale_name =  data.info.scale; //公司规模
						that.formData.nature =  data.info.natureid; //公司性质
						that.formData.nature_name =  data.info.nature; //公司性质
						that.formData.pics = data.info.pics;

						that.$nextTick(() => {

							for(let item in that.businessInfo){
								if((item.indexOf('enterprise') > -1 || item == 'full_name' || item == 'title') && that.businessInfo[item] === '' && item != 'enterprise_code'){
									that.changeBusiness = true;
									console.log(item);
									break;
								}
							}
						})

						if(data.info.pics && data.info.pics.length){
							for(var i = 0; i < data.info.pics.length; i++){
								that.fileList.push({
									value: data.info.pics[i].picSource,
									url: data.info.pics[i].pic,
								})
								
							}
						}

						that.jobAddrList = data.info.all_addr;	
						
						that.$nextTick(() => {
							for(let item in data.info['changeContent']){
								// 空数组表示没有修改， 对象则是修改过
								if(!Array.isArray(data.info['changeContent'][item])){
									that.sensitiveInfo[item] = data.info['changeContent'][item]
								}
							}
							
							console.log(JSON.stringify(that.sensitiveInfo));
						})

					
						
					}else{
						// 没有配置过
						that.hasConfig = false;
					}
				},
				error: function () { 
					var that = this;
					that.isload = false;
				}
			});
		},

		// 获取行业类别industry
		getIndustry(){
			var that = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=industry&son=1',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){
						// that.industry = data.info;
						const industry = data.info;
						that.industry = industry.map(item => {
							const lower = item.lower;

							const children = lower.map(litem => {
								return {
									value:litem.id,
									text:litem.typename
								}
							})
							return {
								value:item.id,
								text:item.typename,
								children:children
							}
						})

						that.$nextTick(() =>{
							// 行业回显
							let ind_arr = []
							for (var i = 0; i < that.industry.length; i++) {
								if (that.businessInfo && that.industry[i].value == that.businessInfo.industryid_list[0]) {
									ind_arr.push(i);
									for (var m = 0; m < that.industry[i].children; m++) {
										if (that.industry[i].children[m].value == that.businessInfo.industryid_list[1]) {
											ind_arr.push(m);
										}
										break;
									}
									break;
								}
							}

							that.$refs['industry'].setIndexes(ind_arr)

						})
					}
				},
				error: function () { 

				}
			});
		},


        // 确认选择
        sureChose(val,ind){
			const that = this;
			if (this.showType == 'enterprise_establish') {
				this.formData.enterprise_establish = parseInt(val.valueOf() / 1000)
				console.log(this.formData.enterprise_establish);
			}else if(this.showType != 'industry'){

				this.formData[this.showType] = val.id
				this.formData[this.showType + '_name'] = val.typename
				if(that.showType == 'nature' && that.changeBusiness){
					that.formData.enterprise_type = val.typename
				}
			}else{
				
				this.formData[this.showType + '_name'] = val[val.length - 1]
				this.formData[this.showType] = this.industry[ind[0]]['children'][ind[1]].value;

			}
			this.showPop = false; 
        },

		// 上传图片 ===> logo
		afterRead(file,obj){
			const that = this;
			if(obj.name == 'logo'){
				that.logoObj = [{
					url:file.content,
					isImage:true,
					file:file.file
				}]
			}
			else if(obj.name == 'licence'){
				that.licenceObj = [{
					url:file.content,
					isImage:true,
					file:file.file
				}]
			}
			else if(obj.name == 'photo'){
				that.photoObj = [{
					url:file.content,
					isImage:true,
					file:file.file
				}]
			}
			
            if(file && file.length && file.length > 0){
				
                for(var i = 0; i < file.length; i++){
					if(obj.name == 'pic'){
						that.fileList.push({
							url:file[i].content,
							isImage:true,
							file:file[i].file,
							percent:10
						})
					}
                    that.uploadImg(file[i].file,obj.name);
                }
            }else{
				if(obj.name == 'pic'){
					that.fileList.push({
						url:file.content,
						isImage:true,
						file:file.file,
						percent:10
					})
				}
                that.uploadImg(file.file,obj.name);
            }  
		},

		uploadImg(file,type){  
			var that = this;
            // 创建form对象
            let formdata1 = new FormData();
            // 通过append向form对象添加数据,可以通过append继续添加数据
            
            formdata1.append('Filedata', file);
            formdata1.append('name',  file.name);
            formdata1.append('lastModifiedDate',   file.lastModifiedDate);
            formdata1.append('id',  'WU_FILE_' + type);
			$.ajax({
				url: '/include/upload.inc.php?mod=job&type=atlas',
				data: formdata1,
				type: "POST",
				dataType:'json',
				processData: false,
				contentType: false,
				xhr: function() {
					let newxhr = new XMLHttpRequest()
					// 添加文件上传的监听
					// onprogress:进度监听事件，只要上传文件的进度发生了变化，就会自动的触发这个事件
					newxhr.upload.onprogress = function(e) {
					  let percent = (e.loaded / e.total) * 100 + '%'
					//   $('div').css('width', percent)
					}
					return newxhr
				  },
				success: function (data) {
					if(type === 'logo'){  //上传logo
						that.logoObj = [{
							url:data.turl,
							value:data.url,
							id:'WU_FILE_' + type,
							file:file,
						}]
						that.formData.logo = that.logoObj[0].value;
					}else if(type == 'licence'){
						that.licenceObj = [{
							url:data.turl,
							value:data.url,
							id:'WU_FILE_' + type,
							file:file,
						}]
						that.formData.business_license = that.licenceObj[0].value;
					}
					else if(type == 'photo'){
						that.photoObj = [{
							url:data.turl,
							value:data.url,
							id:'WU_FILE_' + type,
							file:file,
						}]
						that.formData.people_pic = that.photoObj[0].value;

					}else{
						// 相册上传
						picObj = {
							url:data.turl,
							value:data.url,
							id:'WU_FILE_' + type,
							file:file,
							percent:99
						}
						let hasUploadAll = true; //是否全部上传
						for(let i = 0; i< that.fileList.length; i++){
							if(that.fileList[i].file && !that.fileList[i].id && that.fileList[i].file.lastModified == file.lastModified ){
								that.fileList.splice(i,1,picObj)
								setTimeout(() => {
									that.fileList[i]['percent'] = 100
								},300)
								break;
							}
						}
						
						for(let i =0; i < that.fileList.length; i++){
							if(!that.fileList[i].value){
								hasUploadAll = false;
								break;

							}
						}

						// if(hasUploadAll){
						// 	that.submitData();
						// }


					}
				},
				error: function (res) {

                    if(type === 'logo'){  //上传logo
						that.logoObj = []
					}else if(type == 'licence'){
						that.licenceObj = []
					}
					else if(type == 'photo'){
						that.photoObj = []
					}

					showErrAlert('网络错误，上传失败！')
				 }
			});


			
		},

		// 全选
		editPicAll(){ //要编辑了
			const that = this;
			that.editPics = true;
			for(let i = 0; i < that.fileList.length; i++){
				that.editPicsArr.push(i)
			}
		},

		// 选择要编辑的图片
		choseEditPics(ind){
			const that = this;
			if(that.editPicsArr.indexOf(ind) == -1){
				that.editPicsArr.push(ind);
			}else{
				that.editPicsArr.splice(that.editPicsArr.indexOf(ind),1);
			}
		},
		
		// // 全选
		// choseAllPics(){
		// 	const that = this;
		// 	if(that.editPicsArr.length < that.fileList.length){
		// 		that.editPicsArr = []
		// 		for(let i = 0; i < that.fileList.length; i++){
		// 			that.editPicsArr.push(i)
		// 		}
		// 	}else{
		// 		that.editPicsArr = []
		// 	}
		// },

		// 删除
		delPics(){
			const that = this
			if(that.editPicsArr.lenght == 0) {
				showErrAlert('请选择图片')
				return false;

			}
			let arr = [];
			for(let i = 0; i < that.fileList.length; i++){
				if(that.editPicsArr.indexOf(i) <= -1){
					arr.push(that.fileList[i])
				}
			}
			that.fileList = arr;
			that.editPicsArr = []
		},

		// 删除相册图片
		removePic(ind){
			const that = this;
			if(!that.editPics){
				that.fileList.splice(ind,1)
			}
		},


		//员工福利
		editWelfare(item){
			const that = this;
			if(that.formData.welfare.includes(item.id)){
				that.formData.welfare.splice(that.formData.welfare.indexOf(item.id),1)
			}else{
				that.formData.welfare.push(item.id)
			}
		},

		// 提交数据
		submitData(){
			const that = this;
			if(that.logoObj.length){

				that.formData.logo = that.logoObj[0].value;
			}
			if(that.licenceObj.length){
				that.formData.business_license = that.licenceObj[0].value;
			}
			// if(that.licenseObj.length){
			// 	that.formData.business_license = that.licenseObj[0].value;
			// }

			if(that.photoObj.length){
				that.formData.people_pic = that.photoObj[0].value;	
			}
			if(that.fileList.length){
				that.formData.pics = that.fileList.map(item => {
					return {
						pic:item.url,
						picSource:item.value
					}
				});	
			}
			if(that.checkFormData() || that.isload) return false;

			that.toSubmit(); //提交数据至后台
		},

		// 后台交互
		toSubmit(){
			const that = this;
			if(that.isload) return false;
			that.isload = true;
			let formData = JSON.parse(JSON.stringify(that.formData))

			var confirmOptions = {
				popClass:'successPop',
				btnSure:'继续完善',
				btnCancel:'直接发布职位',
				title:'企业资料保存成功',
				confirmTip:'继续完善信息可优化企业形象、提升招聘效果！',
				btnColor: '#256CFA',  //确认文字按钮颜色
        		btnColorbtnCancelColor: '#000',  //确认文字按钮颜色
				isShow:true,
			}
			$.ajax({
				url: '/include/ajax.php?service=job&action=storeConfig',
				type: "POST",
				data:formData,
				dataType: "json",
				success: function (data) {
					if(data.state == 100){
						localStorage.removeItem('never_showCompanyTip'); //清除
						if(!that.hasConfig && that.currTab == 0){
							that.isload = false;
							confirmPop(confirmOptions,function(){
								that.currTab = that.currTab + 1;
								if(!data.info.gsInfo || data.info.gsInfo == '工商信息查询失败，请确认企业全称'){ //未查询到工商信息
									that.changeBusiness = true
								}else{
									that.gsInfo = data.info.gsInfo; 
								}
							},function(){
								window.location.href = masterDomain + '/supplier/job/add_post.html?appFullScreen'
							})
						}else{
							if(data.complete && (!that.businessInfo || that.businessInfo.pcount == 0)){
								// 企业信息已完善，可以发布职位
								that.successPop = true
								that.isload = false;
							}else{

								const tipArr = ['公司信息','工商信息','企业联系信息','公司简介','']
								showErrAlert(tipArr[that.currTab] + '已保存','success')
								setTimeout(() => {
									if(hasConfig){
										// window.history.go(-1)
										location.href = masterDomain + '/supplier/job?appFullScreen'
									}else{
										that.currTab = that.currTab + 1;
										if(that.currTab > 4){
											location.href = masterDomain + '/supplier/job?appFullScreen'
										}
									}
									that.isload = false;
								}, 1500);
							}
						}
					}else{
						showErrAlert(data.info)
						setTimeout(() => {
							that.isload = false;
						}, 1500);
					}
				},
				error: function () { 
					tt.isload = false; 
					showErrAlert('网络错误，请稍后重试');
				}
			});
		},

		// 验证输入
		checkFormData(noTip){
			const that = this;
			const curr = that.currTab;
			let stop = false;
			let stop_item = '';
			let regTip = {
				title:'请输入公司名称',
				nature:'请选择公司性质',
				scale:'请选择公司规模',
				industry:'请选择行业分类',
				logo:'请上传公司LOGO',
			}

			if(!that.businessInfo.id){
				regTip = {
					title:'请输入公司名称',
					nature:'请选择公司性质',
					scale:'请选择公司规模',
					industry:'请选择行业分类',
					logo:'请上传公司LOGO',
					business_license:'请上传企业营业执照',
					full_name:'请输入企业全称',
				}
			}
			if(curr === 1){ //工商信息
				regTip = {
					full_name:'请输入企业全称',
					enterprise_type:'请选择企业类型',
					enterprise_establish:'请选择成立日期',
					enterprise_money:'请输入注册资本',
					enterprise_people:'请输入法人代表',
					business_license:'请上传企业营业执照',
				}
			}else if(curr === 2){ //联系人
				regTip = {
					people:'请输入联系人',
					people_job:'请输入联系人职位',
					people_pic:'请上传联系人头像',
					contact:'请输入招聘人联系方式',
					addrid:'请选择公司地点',
					address:'请输入公司详细地址',
				}
			}else if(curr === 3){ //联系人
				regTip = {
					work_time_s:'请选择工作时间',
					work_time_e:'请选择工作时间',
				
				}
			}else if(curr === 4){
				regTip = {
					pics:'请至少上传两张图像'
				}
				
			} 
			for(var item in regTip){
				if(item == 'pics' ){
					if(!noTip && that.formData[item].length < 2){
						showErrAlert(regTip[item]);
						stop = true
						break;
					}
				}else if(item == 'logo'){
					if(!that.logoObj ||!that.logoObj.length|| !that.logoObj[0].value){
						if(!noTip){
							showErrAlert(regTip[item]);
							stop_item = item;
						}
						stop = true
					}

				}else if(item == 'business_license'){
					if(!that.licenceObj ||!that.licenceObj.length|| !that.licenceObj[0].value){
						if(!noTip){
							showErrAlert(regTip[item]);
						}
						stop = true
					}

				}else if(that.formData[item] === '' || (Array.isArray(that.formData[item]) && that.formData[item].length)){
					if(!noTip){
						showErrAlert(regTip[item]);
						stop_item = item;
					}
					
					stop = true
					break;
				}else if(item == 'contact'){
					let reg = /^1[3-9]\d{9}$/
					if(!(reg.test(that.formData[item])) && !noTip){
						showErrAlert('请输入正确的手机号');
						stop = true
						break;
					}
				}
			}

			if(stop_item){ 
				let top = $('.formItem[data-param="'+stop_item+'"]').attr('data-top')
				let hh = $(".header ").height()
				window.scrollTo(0,(top - hh))
				$('.formItem[data-param="'+stop_item+'"]').addClass('focus_item');
				setTimeout(() => {
					$('.formItem[data-param="'+stop_item+'"]').removeClass('focus_item')
				}, 1500);

			}

			return stop;




		},

		// 显示地址弹窗
		showCityChose(){
			const that = this;
			cityChosePage.showPop = true;
			cityChosePage.endChoseCity = that.formData.addrid_list;
			cityChosePage.cityLevel = 3;
			cityChosePage.currTabShow = that.formData.addrid_list.length - 1;
			cityChosePage.successCallBack = function (data) {
				that.formData.addrid_list = data.map(item =>{
					return item.id
				})
				that.formData.addr = data.map(item =>{
					return item.typename
				})
				console.log(data)
				that.formData.addrid = data[data.length - 1].id
			};
			
		},

		goPosi(){
			const that = this;
			localStorage.setItem('infoData',JSON.stringify(that.formData))
			let infoData = []
			for(var item in that.formData){
				infoData.push({
					name:item,
					value:that.formData[item]
				})
			}
			infoData.push({  //返回页面url
				name:'returnUrl',
				value:window.location.href,
			})
			infoData.push({  //此处为例返回之后打开
				name:'currTab',
				value:2,
			})
			localStorage.setItem('infoData',JSON.stringify(infoData))
			
			window.location.href = memberDomain + '/mapPosi.html?noPosi=1&currentPageOpen=1'; //跳转定位
		},


		// 当从定位页面返回时
		resolveReturnData(){
			const that = this;
			let infoData = localStorage.getItem('infoData');
			
			if(!infoData || infoData == 'undefined'){
				localStorage.removeItem('infoData');
				return false;
			};
			infoData = JSON.parse(infoData);
			let infoDataJSON = {};
			for(var i = 0;i<infoData.length;i++){
				infoDataJSON[infoData[i].name] = infoData[i].value;
			}
			
			for(var item in that.formData){
				that.formData[item] = infoDataJSON[item];
			}

			that.$nextTick(() => {  //处理相关数据
				that.logoObj = [{
					url:that.formData.logo_url,
					value:that.formData.logo
				}]
				that.licenceObj = [{
					url:that.formData.business_license_url,
					value:that.formData.business_license
				}]
				that.photoObj = [{
					url:that.formData.people_pic_url,
					value:that.formData.people_pic
				}]

				if(that.formData.pics && that.formData.pics.length){
					for(var i = 0; i < that.formData.pics.length; i++){
						that.fileList.push({
							url: that.formData.pics[i].picSource,
							turl: that.formData.pics[i].pic,
						})
						
					}
				}

				that.timePicker = [that.formData.work_time_s ? that.formData.work_time_s : '',that.formData.work_time_e ? that.formData.work_time_e : '']
				that.jobAddrList = that.formData.all_addr;	
				if(!hasConfig){
					localStorage.removeItem('infoData')
				}

				that.currtab = 2; //联系人页面
			})

			


			if(infoDataJSON['district']){
				that.checkPosi(JSON.parse(infoDataJSON['district']))
			}
		},

		// 处理定位数据
		checkPosi(posiInfo){
			const that = this
			that.formData.lng = posiInfo.point.lng
			that.formData.at = posiInfo.point.lat;

			// 根据坐标获取详细地址
			HN_Location.lnglatGetTown(posiInfo.point,function(data){
				// console.log(data)
				// data = {
				// 	address: "江苏省苏州市姑苏区平江街道人民路1755-2号楼姑苏新天地",
				// 	city: "苏州市",
				// 	district: "姑苏区",
				// 	lat: "31.318233",
				// 	lng: "120.619861",
				// 	name: "平江街道办事处",
				// 	province: "江苏省",
				// 	town: "平江街道",
				// }

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
				}
			})
		},

		calcAddrid(myprovince,mycity,mydistrict,town){
			const that = this;
			var cityArr = [myprovince,mycity,mydistrict,town]
			if(myprovince == mycity){
				cityArr = [myprovince,mydistrict,town]
			}
			that.addridsArr = [];
			that.addrNameArr = [];
			that.checkCityid(cityArr,0)
	
		},

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
				dataType: "json",
				success: function(data){
					if(data && data.state == 100){
						var city = data.info;
						for(var i=0; i < city.length; i++){
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
								that.addridsArr.push(city[i].id)
								that.addrNameArr.push(city[i].typename)
								if(type < strArr.length){
									that.checkCityid(strArr,type)
								}
							}
						}

						if(that.addridsArr.length > 0 ){
							that.formData.addr = that.addrNameArr;
							that.formData.addrid_list = that.addridsArr;
							that.formData.addrid= that.addridsArr[that.addridsArr.length - 1];

						}
						
					}
				}
			})
		},

		// 验证长度是否超出2000
		checkLength(){
			var tt = this;
			var el =   event.currentTarget;
			tt.textCount = $(el).text().length;
			if(tt.textCount >= 20){
				window.event.returnValue = false
				console.log(11)
			}else{
				window.event.returnValue = true
				console.log(22)
			}
		},


		// 确定选择时间
		confirmWorkTime(){
			const that = this;
			that.formData.work_time_s = that.$refs.workStart.getPicker().getValues().join(':')
			that.formData.work_time_e = that.$refs.workEnd.getPicker().getValues().join(':')
			that.showType = '';
			that.showPop = false;
		},

		// 取消选择
		cancelWorkTime(){
			const that = this;
			that.showType = '';
			that.showPop = false;
		},


		// 工商信息企业类型修改
		changeNature(){
			const that = this;
			if(that.changeBusiness){
				that.showPop = true;
				that.showType = 'nature'
			}
		},

		// 成立日期修改
		changeEstablish(){
			const that = this;
			
			if(that.changeBusiness){
				that.showPop = true; 
				that.showType = 'enterprise_establish';
			}
		},

		showRefuse(){
			const that = this;
			that.showPop = true;
			that.showType = 'refuse';
		},

		neverShowPop(){
			const that = this;
			localStorage.setItem('never_showCompanyTip',that.currTab);
			that.showPop = false;
		},

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
                return (year + '/' + month + '/' + day + ' ' + hour + ':' + minute );
            }else {
                return 0;
            }
        },

    },

    watch:{
        currTab(val){
            if(val >= 3){
                this.$nextTick(()=>{
                    this.checkLeft()
                })
            }
        },
		

		'formData.nature':function(val){
			if((!this.businessInfo || !this.businessInfo.id) &&!this.businessInfo.enterprise_type){
				this.formData.enterprise_type = this.formData.nature_name;
			}
		},
		showPop:function(val){
			if(val){
				toggleDragRefresh('off');
				$('html').addClass('noscroll')
			}else{
				// toggleDragRefresh('on');
				$('html').removeClass('noscroll')
			}
		},

		// 敏感信息修改 => 公司名称
		'formData.title':function(val){
			const that = this;
			if(that.businessInfo && that.businessInfo.id){

				if(that.businessInfo.title != val){
					that.sensitiveInfo['title'] ={
						new:val,
						change:1,
					}
				}else{
					if(that.businessInfo.changeContent['title'] && !Array.isArray(that.businessInfo.changeContent['title'])){
						that.sensitiveInfo['title'] ={
							new:that.businessInfo.changeContent['title'].new,
						}
						console.log(2);
	
					}else{
						console.log(1);
	
						delete that.sensitiveInfo['title']
					}
					
				}
			}
		},
		// 敏感信息修改 => 公司全称
		'formData.full_name':function(val){
			const that = this;
			if(that.businessInfo && that.businessInfo.id){

				if(that.businessInfo.full_name != val){
					that.sensitiveInfo['full_name'] ={
						new:val,
						change:1,
					}
					// that.licenceObj = {}
					if(that.licenceObj && that.licenceObj[0] && that.licenceObj[0].value == that.businessInfo.business_license){
						that.licenceObj = []
					}
				}else{
					if(that.businessInfo.changeContent['full_name'] && !Array.isArray(that.businessInfo.changeContent['full_name'])){
						that.sensitiveInfo['full_name'] ={
							new:that.businessInfo.changeContent['full_name'].new,
						}
					}else{
						delete that.sensitiveInfo['full_name']
					}
	
					if(that.licenceObj && that.licenceObj.length == 0){
						that.licenceObj = [{
							url:that.businessInfo.business_license_url,
							value:that.businessInfo.business_license
						}]
					}
				}
			}
		},

		// 敏感信息修改 => logo
		logoObj:{
			handler:function(val){
				const that = this;
				if(that.businessInfo && that.businessInfo.id){
					if(!val.length){  //删掉
						that.sensitiveInfo['logo'] ={
							new:'',
							path:'',
							change:1
						}
					}else if(that.businessInfo.logo != val[0].value){
						that.sensitiveInfo['logo'] ={
							new:val[0].value,
							path:val[0].url,
							change:1
						}
					}else{
						if(that.businessInfo.changeContent['logo'] && !Array.isArray(that.businessInfo.changeContent['logo'])){
							that.sensitiveInfo['logo'] ={
								new:that.businessInfo.changeContent['logo'].new,
								path:that.businessInfo.changeContent['logo'].path,
							}
						}else{
							delete that.sensitiveInfo['logo']
						}
					}
				}
			},
			deep:true,
		},
		// 敏感信息修改 => logo
		licenceObj:{
			handler:function(val){
				const that = this;
				if(that.businessInfo && that.businessInfo.id){

					if(!val.length){  //删掉
						that.sensitiveInfo['business_license'] ={
							new:'',
							path:'',
							change:1
						}
					}else if(val.length && that.businessInfo.business_license != val[0].value){
						that.sensitiveInfo['business_license'] ={
							new:val[0].value,
							path:val[0].url,
							change:1
						}
					}else{
						if(that.businessInfo.changeContent['business_license'] && !Array.isArray(that.businessInfo.changeContent['business_license'])){
							that.sensitiveInfo['business_license'] ={
								new:that.businessInfo.changeContent['business_license'].new,
								path:that.businessInfo.changeContent['business_license'].path,
							}
						}else{
							
							delete that.sensitiveInfo['business_license']
						}
						
					}
				}
			},
			deep:true,
		}
    }
})