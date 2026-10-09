var endLoad = false; //表示是否已加载结束
var originalAjax = []; // 用于存放所有接口数据
var jobIsAdd = false
var loadData = [];
var jobCompany = '';
$(function(){
	sidObj = {}; //各模块的店铺id
	// 需要加载数据的接口 根据用户开通的模块获取
	getSid(); //获取对应模块的店铺id

	// 招聘相关接口 只有发布过职位 才会有数据
	let jobAjax = [
		// 面试日程
	{
		ajax:'/include/ajax.php?service=job&action=interviewSchedule',
		callback:function(data){
			if(data.state == 100){
				let item = data.info.list[0]
				$('.companyDetail p').addClass('interviewItem').html('<a href="'+ masterDomain +'/supplier/job/interviewManage.html" target="_blank"><span>有新面试日程</span>' + timeStrToDate(item.date)+'</a>')
			}else{
				$('.companyDetail p').removeClass('interviewItem').html('<a href="'+ masterDomain +'/supplier/job/interviewManage.html" target="_blank">海量人才简历，线上沟通邀请面试</a>')

			}
			
		}
	},
	// 待处理简历
	{
		ajax:'/include/ajax.php?service=job&store=1&state=0&action=deliveryList&unSuit=1&unValid=1&page=1&pageSize=1',
		callback:function(data){
			if(data.state == 100){
				$(".toResume .resume b").text(data.info.pageInfo.totalCount)
			}
		}
	},
	
	// 招聘会
	{	
		
		ajax:'/include/ajax.php?service=job&action=fairs&pageSize=1&page=1&u=1&current=1',
		callback:function(data){
			if(data.state == 100 &&  data.info.list &&  data.info.list.length){
				let list = data.info.list[0]
				$(".jobMan .fair").html('<a  href="'+ list.url +'" target="_blank"><span>【近期招聘会】</span> '+ list.title +' </a>')
			}
		}
	},]
	// 所有模块所需的接口
	var allAjax = {
		// 商城
		shop:[
			// 店铺详情
			{	preFun:function(){  //只开通商城时需要调用此接口
					let moduleList = memberPackage.moduleList.length;
					let keepGo = false;
					if(moduleList.length && moduleList.length == 1 && moduleList.includes('shop')){
						keepGo = true;
					}
					return keepGo;
				},
				ajax:'/include/ajax.php?service=shop&action=storeDetail',
				callback:function(data){
					if(data.state == 100){
						$('.companyScore span').html('<em class="'+ parseFloat(data.info.score1) ? 'hasScore' : '' +'">商品<b>'+ parseFloat(data.info.score1) ? parseFloat(data.info.score1) : '暂无' +'</b></em><em class="'+ parseFloat(data.info.score3) ? 'hasScore' : '' +'">服务<b>'+ parseFloat(data.info.score3) ? parseFloat(data.info.score3) : '暂无' +'</b></em><em class="'+ parseFloat(data.info.score2) ? 'hasScore' : '' +'">物流<b>'+ parseFloat(data.info.score2) ? parseFloat(data.info.score2) : '暂无' +'</b></em>')
					}
				}
			},
			// 订单
			{
				ajax:'/include/ajax.php?service=shop&action=orderList&store=1&page=1&pageSize=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#shopObj .unpaid .numShow").text(info.unpaid)
						$("#shopObj .ongoing .numShow").text(info.ongoing)
						$("#shopObj .recei2 .numShow").text(info.recei2)
						$("#shopObj .refunded .numShow").text(info.refunded)
					}
				}
			},

			// 商品管理
			{
				ajax:'/include/ajax.php?service=shop&action=slist&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#shopObj .gray .numShow").text(info.gray)
						$("#shopObj .audit .numShow").text(info.audit)
						$("#shopObj .refuse .numShow").text(info.refuse)
					}
				}
			},
			// 活动商品
			{
				ajax:'/include/ajax.php?service=shop&action=proHuodongList&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#shopObj .proHuodongList .numShow").text(info.totalCount);
					}
				}
			},
		],

		// 资讯
		article:[
			{
				ajax:'/include/ajax.php?service=article&action=alist&u=1&orderby=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#articleObj .gray .numShow").text(info.gray)
						$("#articleObj .audit .numShow").text(info.audit)
						$("#articleObj .refuse .numShow").text(info.refuse)
					}
				}
			}
		],

		// 招聘
		job:[
			// 企业详情
			{
				ajax:'/include/ajax.php?service=job&action=companyDetail',
				callback:function(data){
					if(data.state == 100){
						$(".companyDetail").removeClass('fn-hide')
						$(".jobInfo").addClass('fn-hide')
						$(".companyDetail h5").text(data.info.title)
						$('.jobMan').addClass('hasJoin')
						$('.jobMan .logo').html('<img src="'+ data.info.logo_url +'" onerror="this.src=\'/static/images/404.jpg\'" />')
						jobCompany = data.info;
						if(jobCompany && jobCompany.combo_id){ //已购买招聘套餐
							$(".jobMan .fair").html('<a class="underLine" href="'+ masterDomain +'/supplier/job/personList.html" target="_blank"><span>前往人才库></span> </a>')
						}else{ 
							$(".jobMan .fair").html('<a class="underLine" href="'+ masterDomain +'/supplier/job/jobmeal.html" target="_blank"><span>查看更多招聘套餐></span> </a>')
						}
						let obj = // 在招职位
						{
			
							ajax:'/include/ajax.php?service=job&action=postList&state=1&page=1&pageSize=1',
							callback:function(data){
								if(data.state == 100){
									if(data.info.pageInfo.totalCount > 0){
										if(!jobIsAdd){
											loadData = jobAjax.concat(loadData)
											if(endLoad == true){ //请求已经结束  此处需要继续请求
												endLoad = false;
												let obj = loadData.splice(0,1)
												getData(obj)
											}

											jobIsAdd = true
										}
			
										$(".noPost").addClass('fn-hide')
										$(".toResume").removeClass('fn-hide')
										$(".toResume .post b").text(data.info.pageInfo.totalCount)
									}
			
			
								}
							}
						}
						loadData.unshift(obj)
						originalAjax.unshift(obj)
						if(endLoad == true){ //请求已经结束  此处需要继续请求
							endLoad = false;
							let obj = loadData.splice(0,1)
							getData(obj)
						}

						
					}
				}
			},
			
		],

		// 房产
		house:[
			// 房源委托
			{
				ajax:'/include/ajax.php?service=house&action=myEntrust&iszjcom=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#houseObj .entrust .numShow").text(info.totalCount)
					}
				}
			},
			// 经纪人管理
			{
				ajax:'/include/ajax.php?service=house&action=zjUserList&type=getnormal&u=1&pageSize=1&page=1&comid=' + sidObj['house'],
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#houseObj .broker .numShow").text(info.totalCount)
					}
				}
			},
			// 入驻申请
			{
				ajax:'/include/ajax.php?service=house&action=zjUserList&iszjcom=1&u=1&pageSize=1&page=1&comid=' + sidObj['house'],
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#houseObj .receive_broker .numShow").text(info.totalCount)
					}
				}
			},
			
		],

		// 外卖
		waimai:[
			// 订单
			{
				ajax:'/wmsj/order/waimaiOrder.php?action=getList&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#waimaiObj .totalCount_2 .numShow").text(info.totalCount_2)
						$("#waimaiObj .totalCount_3 .numShow").text(info.totalCount_3)
						$("#waimaiObj .totalCount_4 .numShow").text(info.totalCount_4)
						$("#waimaiObj .totalCount_5 .numShow").text(info.totalCount_5)
						$("#waimaiObj .totalCount2 .numShow").text(info.totalCount2)
					}
				}
			},
		],

		// 家政
		homemaking:[
			// 订单
			{
				ajax:'/include/ajax.php?service=homemaking&action=orderList&store=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#homemakingObj .state1 .numShow").text(info.state1)
						$("#homemakingObj .state20 .numShow").text(info.state20)
						$("#homemakingObj .state5 .numShow").text(info.state5)
						$("#homemakingObj .state9 .numShow").text(info.state9)
					}
				}
			},
			// 保姆/月嫂
			{
				ajax:'/include/ajax.php?service=homemaking&action=nannyList&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#homemakingObj .nannyList .numShow").text(info.totalCount)
					}
				}
			},
			// 保姆/月嫂
			{
				ajax:'/include/ajax.php?service=homemaking&action=hList&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#homemakingObj .personal .numShow").text(info.totalCount)
					}
				}
			},
		],


		// 养老
		pension:[
			// 参观预约
			{
				ajax:'/include/ajax.php?service=pension&action=bookingList&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#pensionObj .booking .numShow").text(info.totalCount)
					}
				}
			},
			// 入驻申请
			{
				ajax:'/include/ajax.php?service=pension&action=awardList&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#pensionObj .award .numShow").text(info.totalCount)
					}
				}
			},
			// 我的邀请
			{
				ajax:'/include/ajax.php?service=pension&action=invitationList&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#pensionObj .invitation .numShow").text(info.totalCount)
					}
				}
			},
		],


		// 装修
		renovation:[
			// 团队管理
			{
				ajax:'/include/ajax.php?service=renovation&u=1&company='+ sidObj['renovation'] +'&action=team&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#renovationObj .team .numShow").text(info.totalCount)
					}
				}
			},
			// 装修案例
			{
				ajax:'/include/ajax.php?service=renovation&action=diary&u=1&company='+ sidObj['renovation'] +'&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#renovationObj .case .numShow").text(info.totalCount)
					}
				}
			},
			// 效果图
			{
				ajax:'/include/ajax.php?service=renovation&action=rcase&u=1&orderby=1&company='+ sidObj['renovation'] +'&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#renovationObj .albums .numShow").text(info.totalCount)
					}
				}
			},
			// 工地
			{
				ajax:'/include/ajax.php?service=renovation&action=constructionList&u=1&sid='+ sidObj['renovation'] +'&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#renovationObj .site .numShow").text(info.totalCount)
					}
				}
			},
			// 招标客户
			{
				ajax:'/include/ajax.php?service=renovation&action=zhaobiao&u=1&b=1&company='+ sidObj['renovation'] +'&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#renovationObj .zb .numShow").text(info.totalCount)
					}
				}
			},
			// 客户管理
			{
				ajax:'/include/ajax.php?service=renovation&action=entrust&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#renovationObj .customer .numShow").text(info.totalCount)
					}
				}
			},
			
		],


		// 旅游
		travel:[
			// 订单
			{
				ajax:'/include/ajax.php?service=travel&action=orderList&store=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#travelbj .state0 .numShow").text(info.state0)
						$("#travelbj .state1 .numShow").text(info.state1)
						$("#travelbj .state8 .numShow").text(info.state8)
					}
				}
			},

			// 酒店
			{
				ajax:'/include/ajax.php?service=travel&action=hotelList&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#travelObj .hotelList .numShow").text(info.totalCount)
					}
				}
			},
			// 景点门票
			{
				ajax:'/include/ajax.php?service=travel&action=ticketList&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#travelObj .ticketList .numShow").text(info.totalCount)
					}
				}
			},

			// 周边游
			{
				ajax:'/include/ajax.php?service=travel&action=agencyList&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#travelbj .agencyList .numShow").text(info.totalCount)
					}
				}
			},
			// 租车
			{
				ajax:'/include/ajax.php?service=travel&action=rentcarList&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#travelbj .rentcarList .numShow").text(info.totalCount)
					}
				}
			},
			// 签证
			{
				ajax:'/include/ajax.php?service=travel&action=visaList&u=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#travelbj .visaList .numShow").text(info.totalCount)
					}
				}
			},
		],

		// 汽车
		car:[
			// 车源管理
			{
				ajax:'/include/ajax.php?service=car&action=car&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#carObj .customer .numShow").text(info.totalCount)
					}
				}
			},

			// 售车顾问
			{
				ajax:'/include/ajax.php?service=car&action=adviserList&type=getnormal&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#carObj .broker .numShow").text(info.totalCount)
					}
				}
			},

			// 客户预约
			{
				ajax:'/include/ajax.php?service=car&action=storeAppointList&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#carObj .appoint .numShow").text(info.totalCount)
					}
				}
			},
		],

		// 拍卖
		paimai:[
			// 拍卖订单
			{
				ajax:'/include/ajax.php?service=paimai&action=orderList&store=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#paimaiObj .state1 .numShow").text(info.state1)
						$("#paimaiObj .state3 .numShow").text(info.state3)
						$("#paimaiObj .state5 .numShow").text(info.state5)
						$("#paimaiObj .state6 .numShow").text(info.state6)
						$("#paimaiObj .state7 .numShow").text(info.state7)
					}
				}
			},

			// 拍卖管理
			{
				ajax:'/include/ajax.php?service=paimai&action=getList&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#paimaiObj .arcrank0 .numShow").text(info.totalGray)
						$("#paimaiObj .arcrank1 .numShow").text(info.totalAudit)
						$("#paimaiObj .arcrank2 .numShow").text(info.totalRefuse)
					}
				}
			},
		],

		// 教育
		education:[
			// 课程管理
			{
				ajax:'/include/ajax.php?service=education&action=coursesList&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#educationObj .audit .numShow").text(info.audit)
						$("#educationObj .gray .numShow").text(info.gray)
						$("#educationObj .refresh .numShow").text(info.refresh)
					}
				}
			},
			
			// 报名管理
			{
				ajax:'/include/ajax.php?service=education&action=orderList&store=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#educationObj .orderList .numShow").text(info.totalCount)
						
					}
				}
			},
			
			// 教师管理
			{
				ajax:'/include/ajax.php?service=education&action=teacherList&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#educationObj .teacherList .numShow").text(info.totalCount)
						
					}
				}
			},
		],

		// 乐购
		awardlegou:[
			// 订单管理
			{
				ajax:'/include/ajax.php?service=awardlegou&action=orderList&store=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#awardlegouObj .daifahuo .numShow").text(info.daifahuo)
						$("#awardlegouObj .shouhou .numShow").text(info.shouhou)
						$("#awardlegouObj .tuikuan .numShow").text(info.tuikuan)
					}
				}
			},
			
			// 商品管理
			{
				ajax:'/include/ajax.php?service=awardlegou&action=goodList&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#awardlegouObj .audit .numShow").text(info.audit)
						$("#awardlegouObj .gray .numShow").text(info.gray)
						$("#awardlegouObj .refuse .numShow").text(info.refuse)
						
					}
				}
			},
		],

		// 团购
		tuan:[
			// 订单管理
			{
				ajax:'/include/ajax.php?service=tuan&action=orderList&store=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#tuanObj .ongoing .numShow").text(info.ongoing)
						$("#tuanObj .recei .numShow").text(info.recei)
						$("#tuanObj .refunded .numShow").text(info.refunded)
					}
				}
			},
			
			// 商品管理
			{
				ajax:'/include/ajax.php?service=tuan&action=tlist&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#tuanObj .audit .numShow").text(info.audit)
						$("#tuanObj .gray .numShow").text(info.gray)
						$("#tuanObj .offshelf .numShow").text(info.offshelf)
						$("#tuanObj .refuse .numShow").text(info.refuse)
						
					}
				}
			},
		],
		
		// 婚嫁
		marry:[
			// 婚宴场地
			{
				ajax:'/include/ajax.php?service=marry&action=hotelfieldList&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#marryObj .hotelfield .numShow").text(info.totalCount)
					}
				}
			},
			
			// 婚宴菜单
			{
				ajax:'/include/ajax.php?service=marry&action=hotelmenuList&u=1&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#marryObj .hotelmenu .numShow").text(info.audit)
						
					}
				}
			},

			// 客户管理
			{
				ajax:'/include/ajax.php?service=marry&action=getrese&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
						$("#marryObj .customer .numShow").text(info.audit)
						
					}
				}
			},
		],
		
	}

	var marryAjax = []; //婚嫁需要获取接口之后


	


	$('.showMore').click(function(){
		$('.allModuleList').toggleClass('slideShow')
		let fullH = $('.allModuleList .scrollBox ul').height()
		if($('.allModuleList').hasClass('slideShow')){
			// 展开
			$('.allModuleList .scrollBox').css('max-height',fullH + 'px')
			$(this).text('收起')
		}else{
			// 收起
			$('.allModuleList .scrollBox').css('max-height', '360px')
			$(this).text('更多商家套餐')
		}
	})

	// 显示弹窗
	$(".btn_xu").click(function(){
		li = $(this).closest('li')
		var name = li.attr('data-title');
		var code = li.attr('data-code')
		let is_privilege = $(this).closest('.privilege').length > 0 ? true : false;
		let show_tit = is_privilege ? '开通商家服务' : '开通' + name
		$(".popBox .pop_header p").css({
			'display':(is_privilege ? 'block' : 'none')
		})
		$(".popBox .pop_header h4").text(show_tit)
		$(".popBox").addClass('show');
		let url =  mealUrl + '?mod=' + code
		$('.qrBox img').attr('src','/include/qrcode.php?data=' + encodeURIComponent(url))
	})

	// 关闭弹窗
	$(".close_pop").click(function(){
		$(".popBox,.succPopBox").removeClass('show');
	})

/**
 * 20240903新增
*/

// 获取商家店铺信息
getStoreDetail();

$('.storeMan .store_li').click(function(){
	if(!$(this).hasClass('haBuy')){
		let code =$(this).attr('data-code');
		let show_tit = '开通商家服务'
		$(".popBox .pop_header p").css({
			'display':'block'
		})
		$(".popBox .pop_header h4").text(show_tit)
		$(".popBox").addClass('show');
		let url =  mealUrl + '?mod=' + code
		$('.qrBox img').attr('src','/include/qrcode.php?data=' + encodeURIComponent(url))
	}
})

if(memberPackage){
	if(memberPackage.moduleList && memberPackage.moduleList.length > 0){
		let moduleList = memberPackage.moduleList
		let modules = memberPackage.modules && memberPackage.modules.store || []
		
		let jobMod = modules.find(item => {
			return item.name == 'job'
		}) 
		if(hasJobIn == '1'){ //表示安装了招聘
			$('.jobManBox').removeClass('fn-hide');
		}else{
			$('.jobManBox').addClass('fn-hide');
		}
	
		for(let i = 0; i < moduleList.length; i++){
			if(['maidan','dingzuo','paidui','diancan'].includes(moduleList[i])){
				let obj = {
					ajax:'/include/ajax.php?service=business&action='+ moduleList[i] +'Order&u=1&pageSize=1',
					callback:function(data){
						if(data.state == 100){
							let info = data.info.pageInfo
							let numShow = 0
							if(moduleList[i] == 'maidan'){
								numShow = info.totalAudit
							}else{
								numShow = info.totalGray
							}
							$(".storeUl .store_li." + moduleList[i]  + " .r_info b").text(numShow)
							if(numShow > 0){

								$(".storeUl .store_li." + moduleList[i]).addClass('hasNum')
							}
						}
					}
				}
				loadData.push(obj)

				originalAjax.push(obj)
			}else{
				loadData = loadData.concat(allAjax[moduleList[i]])
				if(moduleList[i] != 'marry'){
					originalAjax = originalAjax.concat(allAjax[moduleList[i]])
				}

				if(moduleList[i] == 'marry'){
					let obj = {
						ajax:'/include/ajax.php?service=marry&action=storeDetail',
						callback:function(data){
							getMarryStore(data)
						}
					};
					loadData.splice(0,0,obj)
				}
			}
		}

		loadData = loadData.concat(allAjax['job'])
	}
}

let startObj = loadData.splice(0,5)
for(let i = 0; i < startObj.length; i ++){
	getData(startObj[i])
}


$('.jobMan ').click(function(e){
	let t = $(this)
	if(e.target == $(".fair a")[0]) return false;
	window.open(masterDomain + '/supplier/job')
})

// 统计需要请求的数据接口
function getSid(){
	let sid = ''
	memberPackage = memberPackage &&  JSON.parse(memberPackage) || {}
	let orderBusi = ['shop','waimai','homemaking','travel','tuan','education','awardlegou','paimai']
	let hasOrder = false;
	if(memberPackage.modules && memberPackage.modules.store && memberPackage.modules.store.length){
		let modList = memberPackage.modules.store
		for(let i = 0; i < modList.length; i++){
			let code = modList[i].name
			sidObj[code] =  modList[i].sid
			if(orderBusi.includes(code)){
				hasOrder = true;
			}
		}
	}

	let ajaxArr = [7,8,5]
	if(hasOrder){
		$(".tradeBox .tdOrder").removeClass('fn-hide')
		$(".tradeBox .tdVisitor").addClass('fn-hide')
	}else{
		ajaxArr = [6,8,5]
		$(".tradeBox .tdVisitor").removeClass('fn-hide')
		$(".tradeBox .tdOrder").addClass('fn-hide')
	}
	let obj = {
		ajax:'include/ajax.php?service=member&action=getBusinessStatistics&ids=' + ajaxArr.join(','),
		callback:function(data){
			if(data.state == 100){
				if(hasOrder){
					$(".tdOrder").find('.numShow').text(formatNumber(data.info[7]));
				}else{
					$(".tdVisitor").find('.numShow').text(formatNumber(data.info[6]));
				}
				$(".tdAmount").find('.numShow').text(formatNumber(data.info[8]));
				$(".allInCome").find('.numShow').text(formatNumber(data.info[17]));
			}
			
		}
	}
	loadData.push(obj)

	originalAjax.push(obj)
}


function formatNumber(str){
	if(!isNaN(str)){
		str = Number(str);
	}
	
	let str2 = str
	if(str2){
		str.toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
	}

	return str2
}
// 获取店铺最新状态
function getStoreDetail(){
	$.ajax({
		accepts:{},
		url: '/include/ajax.php?service=business&action=storeDetail',
		type: "POST",
		dataType: "json",
		success: function (data) {
			if(data.state == 100){
				let typename = data.info.typenameArr[data.info.typenameArr.length -1]; //营业范围
				$(".bstate").text(typename); //
				$(".companyScore span").text(parseFloat(data.info.sco1) ? parseFloat(data.info.sco1) : '暂无评分')
				if(parseFloat(data.info.sco1)){
					$(".companyScore span").addClass('hasScore')
				}
			}else{
				// 还未入驻
				location.href = enterUrl
			}
		},
		error: function () { }
	});
}
// 获取婚嫁店铺信息
function getMarryStore(data){
	if(data.state == 100 ){
		let modArr = data.info.bind_moduleArr;
		let html = []
		for(let i = 0; i < modArr.length; i++){
			let urlParam = ''
			switch(modArr[i].id){
				case '1':
					urlParam = '/marry-casemeal.html?typeid=1'
					break;
				case '2':
					urlParam = '/marry-casemeal.html?typeid=2'
					break;
				case '3':
					urlParam = '/marry-casemeal.html?typeid=3'
					break;
				case '4':
					urlParam = '/marry-casemeal.html?typeid=4'
					break;
				case '5':
					urlParam = '/marry-casemeal.html?typeid=5'
					break;
				case '6':
					urlParam = '/marry-casemeal.html?typeid=6'
					break;
				case '7':
					urlParam = '/marry-casemeal.html?typeid=7'
					break;
				case '8':
					urlParam = ''
					break;
				case '9':
					urlParam = '/marry-casemeal.html?typeid=9'
					break;
				case '10':
					urlParam = '/marry-casemeal.html?typeid=10'
					break;
			}
			if(urlParam){
				html.push('<li> <a href="'+ busiUrl + urlParam + '" target="_blank" class="flexitem type'+ modArr[i].id +' "> <div class="numShow">0</div> <p>'+ modArr[i].val +'</p> </a> </li>')
			}

			marryAjax.push({
				ajax:'/include/ajax.php?service=marry&action=planmealList&u=1&type='+ modArr[i].id +'&pageSize=1&page=1',
				callback:function(data){
					if(data.state == 100){
						let info = data.info.pageInfo
					$("#marryObj .type"+ modArr[i].id +" .numShow").text(info.totalCount)
					}
				}
			})
		}
		if(html.length){
			html.unshift('<li class="split_line"></li>');
			$(".marryMod").append(html.join(''));
			loadData = loadData.concat(marryAjax)
			originalAjax = originalAjax.concat(marryAjax)
			if(endLoad == true){ //请求已经结束  此处需要继续请求
				endLoad = false;
				let obj = loadData.splice(0,1)
				getData(obj)
			}
		}

		
	}
	
}

// 获取相关数据
 function getData(loadObj){
	if(!loadObj) {
		if(loadData.length){
			let obj = loadData.splice(0,1)
			getData(obj[0])
		}else{
			endLoad = true; //表示所有接口已全部加载
		}
		return false;
	};
	if(loadObj.hasOwnProperty('preFun') && !loadObj.preFun() ){
		return false
	}; //如果设置了前置条件 并且不满足
	$.ajax({
		url: loadObj.ajax,
		type: "POST",
		dataType: "json",
		success: function (data) {
			if(loadObj.callback){
				loadObj.callback(data)
			}

			if(loadData.length){
				let obj = loadData.splice(0,1)
				getData(obj[0])
			}else{
				endLoad = true; //表示所有接口已全部加载
			}
		},
		error: function () { }
	});
 }

 checkData()

function checkData(){
	let interVal = setInterval(() => {
		if(endLoad && loadData.length == 0){
			endLoad = false
			loadData = JSON.parse(JSON.stringify(originalAjax))
			let startObj = loadData.splice(0,5)
			for(let i = 0; i < startObj.length; i ++){
				getData(startObj[i])
			}
		}
	},10000)
}

});


function timeStrToDate(timeStr,type){
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
	var datestr = month + '月' + dates + '日（'+weekDay[day]+'）';
	if(now.toDateString() === date.toDateString() ){
		datestr = '今天'
	}
	datestr = datestr + (hour > 12 ? '下午' + (hour - 12) : '上午' + hour) +  ':' + minute;

	if(type == 1){
		datestr = month + '月' + dates + '日'
	}
	return datestr;
}
