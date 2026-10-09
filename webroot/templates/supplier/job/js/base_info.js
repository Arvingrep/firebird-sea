var timeInterVal = [];

var setval = false;
var page = new Vue({
	el: '#page',
	data: {
		navList: navList,
		hasConfig: hasConfig,
		isload: false, // 正在加载
		currid: 1,
		hoverid: '',
		loading: false,
		uploadAction: '/include/upload.inc.php?mod=job&filetype=image&type=atlas',
		tabArr: ['公司信息', (hasConfig ? '工商/资质' : '工商信息'), '联系方式', '公司介绍', '企业相册'],
		changeBusiness: false,//是否修改工商信息
		currTab: 0,
		baseConfig: '', //基础配置
		photoArr: [
			{
				id: '0',
				path: '',
				url: templets + 'images/icon_1.png'
			},
			{
				id: '1',
				path: '',
				url: templets + 'images/icon_2.png'
			},
			{
				id: '2',
				path: '',
				url: templets + 'images/icon_3.png'
			},
			{
				id: '3',
				path: '',
				url: templets + 'images/icon_4.png'
			},

		],
		testDay: new Date().setMonth(1, 1),
		form: {
			title: '', //公司名称端
			full_name: '', //全称
			nature: '', //公司性质
			scale: '', //公司规模
			logo_url: '',  //logo地址
			logo: '',   //logo地址值
			business_license: '', //营业执照地址
			business_license_url: '', //营业执照地址
			industry_pid: '', //行业分类
			industry: '',

			people: '', //联系人
			people_job: '', //联系人职位
			people_pic: '', //联系人头像
			people_pic_url: '', //联系人头像
			random_people_pic: '', //随机头像
			contact: '', //联系方式
			email: '', //联系人的邮箱
			site: '', //公司网址
			addrid_list: [],      //公司所属区域
			addrid: '',      //公司所属区域
			// areaArr:'',      //公司所属区域
			addr: '',      //公司所属区域
			address: '', //公司详细地址
			cityid: cityid, //城市id
			lng: '',  //坐标
			lat: '',  //坐标
			body: '', //公司简介
			enterprise_people: '', //法人
			enterprise_money: '', //注册资金
			enterprise_type: '', //类型
			enterprise_establish: '', //成立日期
			welfare: [],
			pics: [], //图片相册
			work_time_s: '',  //工作开始时间
			work_time_e: '',  //工作结束时间
			rest_flag: '', //2是单休，1是双休
			work_over: '', //2是不加班，1是加班
		},
		business_license_url:'',//修改之后的营业执照
		pickerOptions: {
			disabledDate: (time) => {
				let nowData = new Date();
				nowData = new Date(nowData.setDate(nowData.getDate() - 1))
				return time > nowData
			}
		},

		jobAddrList: [],
		industry: [], //行业类别列表
		industry_lower: [],
		fileList: [],
		fileListShow: [], //展示的图片
		currName: '',  //当前上传图片所属的名称
		// 地址选择的属性配置
		options: [],
		props: {
			lazy: true,
			value: 'id',
			label: 'typename',
			lazyLoad(node, resolve) {
				// const { level } = node;
				var url = "/include/ajax.php?service=siteConfig&action=area&type=" + (node && node.data ? node.data.id : '');
				var tt = this;
				axios({
					method: 'post',
					url: url,
				})
					.then((response) => {
						var data = response.data;
						var array = data.info.map(function (item) {
							var leaf = item.lower ? '' : 'leaf:true';
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
		// compnayStuffConfig:[

		// ],
		//地图弹窗层的相关信息
		mapArea: '',
		mapAreaText: '',
		rest_flag: false, //是否双休
		work_over: false, //是否加班
		rest_flag_single: false, //是否单休
		maxlength: 0, //介绍的长度
		timePicker: '', //工作 时间
		mapChose: '',  //地图弹窗返回的数据
		editObj: '', //当前编辑的工作地址
		mapInfoType: '', //触发地图弹窗的类型，company是指公司地址，jobAddress是指工作地址
		error: {
			name: '',
			onError: false,
			tip: '',
		}, //错误提示
		warnb: false,//公司信息未填写的提示
		complete: complete_business, //工商信息是否完善
		businessInfo: {}, //公司信息
		businessNoWarn:true,//工商资质拒绝不再提醒
		infoNoWarn:true,//公司信息拒绝不再提醒
	},
	mounted() {
		var tt = this;

		tt.checkLeft();

		// 获取行业类别
		tt.getIndustry()

		// 获取基础配置
		tt.getBaseConfig()

		// 获取公司配置的详情
		tt.getCompanyDetail();
	},
	methods: {

		setValue(area) {
			var tt = this;
			let cs = tt.$refs.cascaderRefArea;
			if (cs && cs.panel) {
				cs.panel.activePath = [];
				cs.panel.loadCount = 0;
				cs.panel.lazyLoad();
			}

		},

		beforeAvatarUpload: function () {

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
				if (prop_name == 'logo') {
					tt.form['logo_url'] = ImgPreview;
				}
				if (prop_name == 'licence') {
					tt.form['business_license_url'] = ImgPreview;
				}

				if (prop_name == 'avatar') {
					tt.form['people_pic_url'] = ImgPreview;
					tt.form.random_people_pic = ''
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

		// 图片列表上传
		handleListProgress(file, fileList) {
			const tt = this;
			var ImgPreview = URL.createObjectURL(file.raw);
			tt.fileListShow.push({ turl: ImgPreview, preview: 1, uid: file.uid })
			tt.$nextTick(() => {  //dom更新之后执行
				setTimeout(() => {
					$(".progress[data-uid='" + file.uid + "']").find('span').css({
						width: '100%'
					})
				}, 100);
			})
		},

		// checkWidth(call){
		// 	let width = 0;
		// 	setTimeout(() => {
		// 		width = 100;
		// 		call(width)
		// 	}, 200);
		// },

		// getWidth(width){
		// 	width = width ? width : 0;
		// 	return width;
		// },


		// 图片上传成功
		handleSuccess(response, file, fileList) {
			var tt = this;
			if (tt.currName == 'logo') { //logo
				tt.form['logo'] = response.url
				tt.form['logo_url'] = response.turl

			} else if (tt.currName == 'licence') {  //营业执照
				tt.form['business_license'] = response.url
				tt.form['business_license_url'] = response.turl
			} else if (tt.currName == 'avatar') {
				tt.form['people_pic'] = response.url;
				tt.form['people_pic_url'] = response.turl;
			}
			// const prviewImg = $('.uploadBtn[data-name="'+tt.currName+'"] .prviewImg')
			// prviewImg.find('.resetImg').show();
			// prviewImg.find('.progress').remove();

			for (let i = 0; i < fileList.length; i++) {
				const prviewImg = $('.uploadBtn[data-name="' + tt.currName + '"] .prviewImg').eq(i)
				prviewImg.find('.resetImg').show();
				prviewImg.find('.progress').remove();
			}
		},

		// 相册/图片列表开始上传
		handleChangeFileList: function (file, fileList) {
			// let fileName = file.name;
			// let regex = /(.png|.jpg|.jpeg|.bmp|.gif)$/;
			// var ImgPreview = URL.createObjectURL(file.raw);
			// console.log(file)
		},
		// 相册/图片上传成功
		handleSuccessFileList: function (file, fileList) {
			var tt = this;
			tt.fileList.push(file)
			tt.fileListShow = tt.fileList;
		},

		// 删除图片
		removeItem: function (ind, pic) {
			var tt = this;
			tt.fileList.splice(ind, 1)
			tt.fileListShow.splice(ind, 1)
		},

		upFileList: function (data) {
			// return false;
			var tt = this;
			let fileObj = data.file;
			let formData = new FormData();
			formData.append('Filedata', fileObj);
			formData.append('size', fileObj.size);
			formData.append('lastModifiedDate', fileObj.lastModifiedDate);
			formData.append('name', fileObj.name);
			var url = data.action;
			axios({
				method: 'post',
				url: url,
				data: formData
			})
				.then((response) => {
					tt.fileList.push(response.data);
					const ind = tt.fileListShow.findIndex(item => {
						return item.uid && item.uid == fileObj.uid
					})
					tt.fileListShow.splice(ind, 1, response.data);
				});
		},

		// 超出提示
		exceedTip(files, fileList) {
			this.$message({
				message: '最多只能上传20张图',
				type: 'warning'
			});
		},

		beforeUpload(file, fileList) {
			// console.log(fileList)
		},


		// 删除之前执行的事件
		beforeRemove(file) {
			// console.log(file)
		},

		// 删除操作
		handleRemove(file) {
			// console.log(file)
		},

		// 清除文件
		handleRemove(file) {
			// console.log(file)
		},

		getArea(id) {
			var tt = this;
			var dataStr = '';
			// if(tt.form.addrid_list && tt.form.addrid_list.length > 0 ){
			// 	dataStr = dataStr + '&son=once'
			// }
			if (id) {
				dataStr = dataStr + '&type=' + id
			}
			var url = "/include/ajax.php?service=siteConfig&action=area" + dataStr;
			axios({
				method: 'post',
				url: url,
			})
				.then((response) => {
					var data = response.data;
					var array = data.info.map(function (item) {
						return {
							id: item.id,
							typename: item.typename,
							lower: item.lower ? item.lower.length : 0,
							children: item.lower,
							leaf: item.lower && item.lower.length > 0 ? false : true
						}
					})
					tt.options = array;
				});

		},

		// 选择区域
		changeArea(res) {
			var tt = this;
			tt.addr = res;
			mapPop.mapArea = res;
		},


		// 地图相关
		changeMapArea(res) {
			var tt = this;
			var arr = this.$refs.cascaderAddr.getCheckedNodes()[0];
			tt.mapAreaText = arr.join('/')
		},


		// 主要是为了回显默认值
		changeMapAreaText(res) {
			var tt = this;
			if (tt.mapChose && tt.mapChose.mapAreaText) {
				$(".addridBox input").val(tt.mapChose.mapAreaText.join('/'));
			}
		},



		showMapPop(type, obj, edit) {  //type用来区分操作地图的按钮
			var tt = this;
			mapPop.showPop = true;
			tt.mapInfoType = type; //触发地图弹窗的类型
			if (type == 'company') {  //公司地址
				mapPop.addrDeatil = tt.form.address;
				$('#lng').val(tt.form.lng)
				$('#lat').val(tt.form.lat)
				mapPop.hasLoad = false;
				map_default_lng = tt.form.lng
				map_default_lat = tt.form.lat
				mapPop.addrDeatil = tt.form.address;
				mapPop.showAddress = false; //展示地图详细地址
				if (tt.form.addrid_list) {
					mapPop.mapArea = tt.form.addrid_list
				}
				setTimeout(() => {
					mapPop.rePosi(); //重新定位
				}, 1000);
			} else if (type == 'jobAddress') { //公司地址
				mapPop.hasLoad = false;
				mapPop.mapArea = '';
				mapPop.addrDeatil = '';
				map_default_lng = 0;
				map_default_lat = 0;
				$("#address_detail").val('')
				$('#lng').val('')
				$('#lat').val('')
				tt.editObj = '';
				if (obj) {  //编辑某一个地址
					tt.editObj = obj;
					mapPop.showAddress = true; //展示地图
					mapPop.mapArea = obj.addrid_list;
					mapPop.addrDeatil = obj.address;
					mapPop.count_use = obj.count_use;
					mapPop.editAddrObj = tt.editObj;
					map_default_lng = obj.lng;
					map_default_lat = obj.lat;
					if (typeof (autocomplete) != 'undefined' && autocomplete) {
						autocomplete.setInputValue(obj.address)
					} else {
						$("#address_detail").val(obj.address)
					}
					$('#lng').val(obj.lng)
					$('#lat').val(obj.lat)
				} else {
					tt.editObj = '';
					mapPop.showAddress = false; //展示地图
					mapPop.mapArea = '';
					mapPop.addrDeatil = '';
					mapPop.count_use = '';
					mapPop.editAddrObj = '';
				}

				if (edit) {
					mapPop.editAddressConfirmPop(1)
				}
			}
		},


		// 删除地址
		showConfirmDel(item) {
			var tt = this;
			var confirmTit = item.count_use ? '该地址有' + item.count_use + '条职位信息正在使用，请谨慎删除' : '确认删除该地址';
			var confirmTip = item.count_use ? '删除地址后请及时修改相关职位的工作地址' : ''
			mapPop.confirmPop = true;
			mapPop.confirmPopInfo = {
				icon: 'error',
				title: confirmTit,
				tip: confirmTip,
				popClass: item.count_use ? '' : 'sm_comfirmPop',
				btngroups: [
					{
						tit: '取消',
						fn: function () {
							mapPop.confirmPop = false;
						},
						type: 'cancel'
					},
					{
						tit: '确定删除',
						fn: function () {
							tt.addJobAddress(item, 'del')
							mapPop.confirmPop = false;
						},
						type: 'primary',
					},

				]
			};
		},


		// 新增/编辑/删除地址
		addJobAddress(item, type) {
			var tt = this;
			var paramArr = [];
			if (type == 'add' || type == 'update') {
				paramArr.push('addrid=' + item.addrid)
				paramArr.push('address=' + item.address)
				paramArr.push('lng=' + item.lng)
				paramArr.push('lat=' + item.lat)
			}
			if (type != 'add' && type != 'all') {
				paramArr.push('id=' + item.id)
			}
			$.ajax({
				url: '/include/ajax.php?service=job&action=op_address&' + paramArr.join('&') + '&method=' + type,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if (data.state == 100) {
						if (type == 'all') {
							tt.jobAddrList = data.info;
						} else if (type == 'del') {
							mapPop.successTip = true;
							mapPop.successTipText = data.info;
							tt.addJobAddress('', 'all')
						} else {

							tt.addJobAddress('', 'all')
						}
					} else {
						if (type == 'all') {
							tt.jobAddrList = []
						}
                        mapPop.showErrTip = true;
						mapPop.showErrTipTit = data.info;
					}
				},
				error: function () {

				}
			});
		},

		// tab下端的线
		checkLeft(val) {
			var tt = this;
			var currTab = val ? val : tt.currTab;
			var el = $(".tabBox span[data-id='" + currTab + "']");
			var left = 0;
			if (el.length) {
				left = el.position().left + el.innerWidth() / 2 - $(".tabBox s").width() / 2;
			}
			$(".tabBox s").css({
				'transform': 'translateX(' + left + 'px)'
			})
		},

		// 获取公司配置的详情
		getCompanyDetail() {
			var tt = this;
			tt.isload = true
			$.ajax({
				url: '/include/ajax.php?service=job&action=companyDetail&other_param=addr',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					tt.isload = false;
					if (data.state == 100) {
						mapPop.businessInfo = data.info; //商家信息
						tt.businessInfo = data.info
						tt.form.title = data.info.title;
						tt.form.cityid = data.info.cityid;
						tt.form.full_name = (data.info.changeContent.full_name.new&&!data.info.changeContent.full_name.refuse)?data.info.changeContent.full_name.new:data.info.full_name;
						tt.form.logo = data.info.logo;
						tt.form.logo_url = data.info.logo_url;
						tt.form.industry_pid = data.info.industryid_list[0]  //行业分类
						tt.form.industry = data.info.industryid;


						tt.form.people = data.info.people; //联系人
						tt.form.people_job = data.info.people_job; //联系人职位
						//avatarPath:'', //联系人头像
						tt.form.people_pic = data.info.people_pic; //联系人头像
						tt.form.random_people_pic = data.info.random_people_pic; //联系人头像id
						tt.form.people_pic_url = data.info.people_pic_url; //联系人头像
						tt.form.business_license = data.info.business_license; //营业执照
						tt.form.business_license_url = (data.info.changeContent.business_license.path&&!data.info.changeContent.business_license.refuse)?data.info.changeContent.business_license.path:data.info.business_license_url; //营业执照
						tt.form.contact = data.info.contact;//联系方式
						tt.form.email = data.info.email, //联系人的邮箱
							tt.form.site = data.info.site; //公司网址

						var addrlist = data.info.addrid_list;
						tt.form.addrid_list = addrlist;  //公司所属区域
						mapPop.mapArea = addrlist;

						tt.form.addrid = data.info.addrid;     //公司所属区域
						tt.form.addr = data.info.addr;     //公司所属区域
						tt.form.address = data.info.address;     //公司详细地址
						tt.form.lng = data.info.lng;     //公司坐标
						tt.form.lat = data.info.lat;     //公司坐标



						tt.form.body = data.info.body;      //公司所属区域
						// 工商信息||data.info.nature;
						tt.form.enterprise_type = data.info.enterprise_type || data.info.nature;
						tt.form.enterprise_establish = data.info.enterprise_establish * 1000;
						tt.form.enterprise_establish = tt.form.enterprise_establish ? tt.form.enterprise_establish : '';
						tt.form.enterprise_money = data.info.enterprise_money.replace('万元', '');
						tt.form.enterprise_people = data.info.enterprise_people;
						tt.form.rest_flag = data.info.rest_flag; //2是单休，1是双休
						tt.form.work_over = data.info.work_over; //2是不加班，1是加班
						tt.work_over=data.info.work_over==2?true:false
						tt.timePicker = [data.info.work_time_s, data.info.work_time_e]
						tt.form.work_time_s = data.info.work_time_s;
						tt.form.work_time_e = data.info.work_time_e;
						tt.form.welfare = data.info.welfare; //公司福利
						tt.form.scale = data.info.scaleid; //公司规模
						tt.form.nature = data.info.natureid; //公司性质
						tt.form.pics = data.info.pics;
						if (data.info.pics && data.info.pics.length) {
							for (var i = 0; i < data.info.pics.length; i++) {
								tt.fileList.push({
									url: data.info.pics[i].picSource,
									turl: data.info.pics[i].pic,
								})
								tt.fileListShow.push({
									url: data.info.pics[i].picSource,
									turl: data.info.pics[i].pic,
								})
							}
						}

						tt.jobAddrList = data.info.all_addr;

						if (directTo) {
							tt.currTab = directTo;
						}

					} else {
						// 没有配置过
						tt.hasConfig = false;
					}
				},
				error: function () {
					var tt = this;
					tt.isload = false;
				}
			});
		},

		// 获取行业类别industry
		getIndustry() {
			var tt = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=industry&son=1',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if (data.state == 100) {
						tt.industry = data.info;
					}
				},
				error: function () {

				}
			});
		},

		// 选择公司福利
		choseTab(id) {
			var tt = this;
			if (tt.form.welfare.indexOf(id) > -1) {
				tt.form.welfare.splice(tt.form.welfare.indexOf(id), 1)
			} else {
				tt.form.welfare.push(id)
			}
		},

		// 获取分类
		getBaseConfig() {
			var tt = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=getItem&name=welfare,nature,scale',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if (data.state == 100) {
						tt.baseConfig = data.info;
					}
				},
				error: function () {

				}
			});
		},

		// 提交数据
		submitConfig() {
			var tt = this;
			var errTip = '';
			var type = '';
			if (!tt.hasConfig) {
				if (!tt.form.title) {
					errTip = '请输入公司名称';
					type = 'title';
				} else if (!tt.form.nature) {
					errTip = '请选择公司性质';
					type = 'nature';
				} else if (!tt.form.scale) {
					errTip = '请选择公司规模';
					type = 'scale';
				} else if (!tt.form.industry) {
					type = 'industry';
					errTip = '请选择公司经营行业';
				} else if (!tt.form.logo_url) {
					type = 'logo';
					errTip = '请上传公司logo';
				} else if (!tt.form.full_name) {
					type = 'full_name';
					errTip = '请输入公司全称';
				} else if (!tt.form.business_license_url) {
					type = 'business_license';
					errTip = '请上传公司营业执照';
				}
			} else {
				// 已经配置过
				if (tt.currTab === 2) { //联系方式
					if (!tt.form.people) {
						errTip = '请输入招聘联系人';
						type = 'people';
					} else if (!tt.form.people_job) {
						type = 'people';
						errTip = '请输入招聘联系人职位';
					} else if (!tt.form.random_people_pic && !tt.form.people_pic) {
						type = 'people';
						errTip = '请选择/上传联系人头像';
					} else if (!tt.form.contact) {
						type = 'contact';
						errTip = '请输入招聘联系方式';
					} else if (!tt.form.addrid_list || !tt.form.addrid_list.length) {
						errTip = '请选择区域';
						type = 'address';
					} else if (!tt.form.address) {
						type = 'address';
						errTip = '请输入公司地址';
					}
				} else if (tt.currTab === 1) {
					if (!tt.form.enterprise_type) {
						type = 'enterprise_type';
						errTip = '请输入企业类型';
					} else if (!tt.form.enterprise_establish) {
						type = 'enterprise_establish';
						errTip = '请选择公司成立日期';
					} else if (!tt.form.enterprise_money) {
						type = 'enterprise_money';
						errTip = '请输入公司注册资金';
					} else if (!tt.form.enterprise_people) {
						type = 'enterprise_money';
						errTip = '请输入公司法定代表人';
					}

				} else if (tt.currTab === 4 && (!tt.fileList || tt.fileList.length <= 1)) { //公司相册
					type = 'pics';
					errTip = '请至少上传2张图片';
				}
			}
			tt.error.name = ''
			if (errTip) {
				tt.error.name = type
				tt.error.onError = true;
				tt.error.tip = errTip;
				return false;
			}

			tt.loading = true; //正在提交数据
			tt.form.addrid = tt.form.addrid_list[tt.form.addrid_list.length - 1];
			// tt.form.body = $('.text_inp').html();

			// 企业相册处理
			tt.form.pics = [];
			tt.fileListShow.forEach(function (val) {
				tt.form.pics.push({
					pic: val.turl,
					picSource: val.url,
					title: ''
				})
			});
			if(tt.businessInfo.state==1&&tt.businessInfo.full_name==tt.form.full_name){
				tt.form.business_license_url=tt.businessInfo.business_license_url;
			};
			let formData = JSON.parse(JSON.stringify(tt.form));
			formData.enterprise_establish = parseInt(formData.enterprise_establish / 1000)
			$.ajax({
				url: '/include/ajax.php?service=job&action=storeConfig',
				type: "POST",
				data: formData,
				dataType: "jsonp",
				success: function (data) {
					tt.loading = false;
					if (data.state == 100) {
						if (!tt.hasConfig) {
							tt.hasConfig = true;
							cid = data.info.aid;
						};
						tt.showSuccessConfirmPop(data.info);

					} else {
						mapPop.showErrTip = true;
						mapPop.showErrTipTit = data.info;
					}
				},
				error: function () {
					tt.loading = false;
					mapPop.showErrTip = true;
					mapPop.showErrTipTit = '网络错误，请稍后重试';
				}
			});

		},


		// 配置成功之后的弹出框
		showSuccessConfirmPop(d) {
			var tt = this;

			if (d.complete && mapPop.businessInfo.pcound == 0) {
				mapPop.confirmPop = true;
				mapPop.confirmPopInfo = {
					icon: 'success',
					title: '企业资料已完善！立即发布招聘职位吧！',
					tip: '先发布职位才可快速筛选人才哦',
					reload: true,
					btngroups: [
						{
							cls: 'btn_default',
							tit: '预览主页',
							fn: function () {
								open(job_channel + '/company.html?id=' + d.id)
							},

						},

						{
							cls: 'big_btn',
							tit: '发布职位',
							fn: function () {
								window.location.href = masterDomain + '/supplier/job/add_post.html'
							},
							type: 'primary',
						},

					]
				}
			} else if ((!hasConfig || certificateBoolean) && tt.currTab != 4) {
				let title;
				let tip;
				if (!hasConfig) {
					title = '企业资料保存成功';
					tip = '继续完善信息可优化企业形象、提升招聘效果！'
				} else if (certificateBoolean == 1) {
					title = '提交成功';
					tip = '您现在是否想继续进行以下操作：'
				} else {
					tip = '您现在是否想继续进行以下操作：'
					title = '保存成功';
				}
				mapPop.confirmPop = true;
				mapPop.confirmPopInfo = {
					icon: 'success',
					title: title,
					tip: tip,
					reload: true,
					btngroups: [
						{
							tit: '继续完善资料',
							fn: function () {
								mapPop.confirmPop = false;
								location.href = `${masterDomain}/supplier/job/company_info.html?to=1`
							},
							type: 'primary'
						},
						{
							tit: '直接发布职位',
							fn: function () {
								window.location.href = masterDomain + '/supplier/job/add_post.html'
							},
							type: 'primary',
						},
						{
							tit: '预览主页',
							fn: function () {
								open(job_channel + '/company.html?id=' + cid)
							},
						}
					]
				}
			} else {
				mapPop.successTip = true;
				mapPop.successTipText = d.info;
				location.reload();
			}

		},

		//不再提醒
		refuseNoWarn(type) {
			let tt = this;
			if(type=='business'){
				tt.businessNoWarn=false;
			}else{
				tt.infoNoWarn=false;
			}
			$.ajax({
				url: `/include/ajax.php?service=job&action=clearStoreChangeTips&type=${type}`,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if (data.state != 100) {
						mapPop.showErrTip = true;
						mapPop.showErrTipTit = data.info;
					}
				},
			});
		},

		// 改变工作时间
		changeWorkTime(val) {
			var tt = this;
			tt.form.work_time_s = val[0];
			tt.form.work_time_e = val[1];

		},
		changetext() {
			$('.el-time-range-picker__header').eq(0).text('上班时间');
			$('.el-time-range-picker__header').eq(1).text('下班时间');

		},



		// 验证长度是否超出2000
		checkLength() {
			var tt = this;
			var el = event.currentTarget;
			tt.maxlength = $(el).text().length;

		},

		// 随机更换头像
		changePhoto() {
			var tt = this;
			// 获取随机数
			var num = Math.floor(Math.random() * 9);
			num = num + 1;
			if (tt.form.random_people_pic == num) {
				tt.changePhoto();
				return false;
			}
			tt.form.random_people_pic = num;
			tt.form.people_pic = '';
			tt.form.people_pic_url = '';

		},


		// 点击切换tab
		goTab(ind) {
			var tt = this;
			if (tt.hasConfig) {
				tt.currTab = ind
			}

		},


		// 点左边侧边栏
		checkConfig(item, ind) {

			var el = event.currentTarget;
			var url = item ? item.link
				: $(el).attr('data-url') ? $(el).attr('data-url')
					: $(el).attr('href') ? $(el).attr('href') : ''
			if (((job_cid && busi_state == 1) || ind <= 3 || 8<=ind) && url) {
				window.location.href = ind == 0 ? item.link + '?direct=1' : url
			} else {

				var popTit = !job_cid ? '企业资料未完善'
					: busi_state == 0 ? '企业资料审核中'
						: '企业资料审核拒绝'

				var popTip_1 = !job_cid ? '完善公司基本信息后，即可'
					: busi_state == 0 ? '企业资料审核通过后，即可'
						: '请修改企业资料，审核通过后，即可，'
				var popTip_2 = item ? (item.txt == '招聘会' ? '参加' : item.txt == '增值包' ? '购买' : '进行') + item.txt
					: ind == 3 ? '发布职位'
						: ind == 9 ? '开通套餐'
							: '';

				mapPop.confirmPop = true;
				mapPop.confirmPopInfo = {
					icon: 'error',
					title: popTit,
					tip: popTip_1 + popTip_2,
					btngroups: [
						{
							tit: '好的，知道了',
							cls: 'btn_big',
							fn: function () {
								// window.location.href = masterDomain + '/supplier/job/company_info.html'
								mapPop.confirmPop = false;
							},
							type: 'primary'
						},

					]
				}

			}
		},


		// 获取工商信息
		getGS_info() {
			const tt = this;
			tt.loading = true;

			$.ajax({
				url: '/include/ajax.php?service=job&action=gongShangXinxi&full_name=' + tt.form.full_name,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					tt.loading = false;
					if (data.state == 100) {
						for (let item in data.info) {
							const d = data.info[item];
							tt.form[item] = d;
							tt.changeBusiness = false;
						}
					} else {
						mapPop.showErrTip = true;
						mapPop.showErrTipTit = data.info;
					}
				},
			});
		},
	},
	watch: {
		currTab: function (val) {
			var tt = this;
			tt.checkLeft();


			if (val === 1 && (!tt.form.enterprise_type || !tt.form.enterprise_establish || !tt.form.enterprise_money || !tt.form.enterprise_people)) {
				tt.changeBusiness = true;
			}

			if (val === 2 && tt.form.addrid_list && tt.form.addrid_list.length && !setval) {
				setval = true;
				tt.setValue();

			}

		},

		// 查找行业分类
		'form.industry_pid': function (val) {
			var tt = this;
			for (var i = 0; i < tt.industry.length; i++) {
				if (tt.industry[i].id == val) {
					tt.industry_lower = tt.industry[i].lower;
				}
			}
		},

		// 是否单休
		'form.rest_flag': {
			handler:function (val) {
				var tt = this;
				if (val === 1) {
					tt.rest_flag = true
				} else {
					tt.rest_flag = false
				}
				if (val === 2) {
					tt.rest_flag_single = true
				} else {
					tt.rest_flag_single = false
				}
			},
			immediate:true
		},


		rest_flag: function (val) {
			var tt = this;
			if (val) {
				tt.form.rest_flag = 1
			}else if(tt.rest_flag_single){
				tt.form.rest_flag = 2
			}else{
				tt.form.rest_flag = 0
			}
		},
		rest_flag_single: function (val) {
			var tt = this;
			if (val) {
				tt.form.rest_flag = 2
			}else if(tt.rest_flag){
				tt.form.rest_flag = 1
			}else{
				tt.form.rest_flag = 0
			}
		},

		// 是否加班
		work_over: function (val) {
			var tt = this;
			if (val) {
				tt.form.work_over = 2
			}else{
				tt.form.work_over = 1
			};
		},

		mapChose: function (val) {
			var tt = this;
			if (tt.mapInfoType == 'company') {
				tt.form.address = val.addrDeatil;
				tt.form.lng = val.currMarker.lng
				tt.form.lat = val.currMarker.lat
				tt.form.addrid_list = val.mapArea;
				tt.setValue();
			} else if (tt.mapInfoType == 'jobAddress') {
				var obj = {};
				if (tt.editObj) { //编辑状态
					tt.editObj.lng = val.currMarker.lng,
						tt.editObj.lat = val.currMarker.lat,
						tt.editObj.address = val.addrDeatil,
						tt.editObj.addrid = val.mapArea ? val.mapArea[val.mapArea.length - 1] : 0;
					obj = tt.editObj
					tt.addJobAddress(obj, 'update')
				} else {
					obj = {
						lng: val.currMarker.lng,
						lat: val.currMarker.lat,
						address: val.addrDeatil,
						addrid: val.mapArea ? val.mapArea[val.mapArea.length - 1] : 0
					}
					tt.addJobAddress(obj, 'add')
				}
			}
		},


	}
})