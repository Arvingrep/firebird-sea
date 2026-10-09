if((!jobcid || jobcid == '0') && !direct){  //没有完善信息， 
	window.location.href = masterDomain + '/supplier/job/company_info.html';;
}
var page = new Vue({
	el:'#page',
	data:{
		navList:navList,
		currid:0,
		hoverid:'',
		loading:false,
		circleUrl:'',

		manageLoad:false, //是否加载成功
		manageCount:'', //招聘管理数据统计
		// 招聘进展
		jobProgressLoading:false,
		jobProgress:'',

		// 推荐人才
		recLoad:false,
		recommendTalents:[],

		interviewScheduleObj:{
			recommendTalents:[],
			pageInfo:'',
			isload:false,
		},
		

		// 面试日程
		interviewScheduleObj:{
			interviewSchedule:[],
			pageInfo:'',
		},

		selectState:'',
		// 待入职
		pendingBoardingObj:{
			pendingBoarding:[],
			pageInfo:'',
		},
		enddate:endDate, //套餐到期时间
		currDate: parseInt(new Date().valueOf() / 1000),
		lodingSelf:false,//大页面加载中...
		posterData:'',
        posterId:[],
        posterType:'post', //post表示职位类型，company表示公司类型
        loadurl:'',
        bool:false,
        posterb:false,
        warnb:false,
        jobtype:[],//渲染职位
        alljobtype:[],//全部展开职位
        partjobtype:[],//部分职位
        jobtypeIndex:[],
	},
	computed:{
		// 日期转换
		dateToStr(){
			return function(timeStr){
				return mapPop.transTimes(timeStr,2)
			}
		},
	},
	mounted() {
		var tt = this;
		// 获取招聘管理统计数据
		// tt.getManageCount();
		if(jobCount && jobCount > 0){

			tt.checkRefresh();
		}

		// 面试日程
		tt.getinterviewSchedule();

		// 等待入职
		tt.getpendingBoarding()

		// 招聘进展
		tt.jobProcess();

		// 推荐人才
		tt.getRecList()

		$('.finishInfoTipBox').click(function(){
			// $(this).find('.goLink').click()
			// const url  = $(this).find('.goLink').attr('href');
			// window.open(url)

		});
		// 海报职位选择
		$('.pp-steps .step1 ul').delegate('li', 'click', function () {
			event.stopPropagation();
			let className = $(this).attr('class');
			let id = Number($(this).attr('data-id'));
			let indexs = $(this).attr('data-index');
			let length = tt.partjobtype.length; //折叠起来之后渲染的职位类型的长度
			if (tt.posterId.length == 8 && !tt.warnb) {//8职位弹窗提示
				$('.p-warning').fadeIn(200);
				clearTimeout(timer);
				timer = setTimeout(function () {
					$('.p-warning').fadeOut(200);
				}, 3000);
				tt.warnb = true;
				return;
			}
			// 样式切换
			if (!className) {
				tt.posterId.push(id);
				if (indexs > length - 1) { //保存折叠起来职位的下标
					tt.jobtypeIndex.push(indexs);
				}
			} else if (className != 'unfold' && className != 'fold') {
				let index = tt.posterId.indexOf(id);
				tt.posterId.splice(index, 1);
				if (indexs > length - 1) {
					index = tt.jobtypeIndex.indexOf(indexs); //从下标数组删除下标
					tt.jobtypeIndex.splice(index, 1);
				}
			};
			if (tt.jobtypeIndex.length == 0 && tt.jobtype.length > length) { //折叠职位下标数组为空且在展开状态下，隐藏‘收起职位’按钮，反之显示
				$('.fold').fadeIn(200);
			} else {
				$('.fold').fadeOut(200);
			}
			// 海报类型
			if (tt.posterId.length == 0) { //没选择职位
				$('.pp-steps .step2').fadeOut(200);
			} else if (tt.posterId.length == 1) { //单职位
				$('.pp-steps .step2').fadeIn(200);
				tt.posterType = 'post';
			} else { //多职位
				tt.posterType = 'company';
			};
		});
		// 拖拽
		this.dragFn('.pp-drag', '.p-produce');
	},

	methods:{
		// 验证刷新提示
		checkRefresh(){
			const tt = this;
			var refreshTip = $.cookie("HN_refresh_tip");
			if(mapPop && !refreshTip && mapPop.businessInfo.state==1){
				var date_now = new Date();
					date_now.setDate(date_now.getDate()+1);
					date_now.setHours(0);
					date_now.setMinutes(0);
					date_now.setSeconds(0); 
					$.cookie("HN_refresh_tip",1,{ expires:date_now});  //第二天0点失效
				
				mapPop.confirmPopInfo = {
					icon:'error',
					title:'刷新职位，提升排名',
					tip:'刷新后可提升职位显示排名，提升曝光引起求职者关注</br>提高投递率！',
					popClass:'refreshTipPop',
					btngroups:[
						{
							tit:'暂不刷新',
							fn:function(){
								mapPop.confirmPop = false;
							},
							type:''
						},
						{
							tit:'刷新全部职位',
							fn:function(){
								// 此方法是刷新所有职位， 如果刷新次数不够，则按发布时间靠前的刷新
								mapPop.confirmPop = false;
								tt.refreshAllPost(); //刷新全部
							

							},
							type:'primary',
						},
						
					]
				}
				mapPop.confirmPop = true; //显示弹窗
			}
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
				var popTip_2 = item ? (item.txt=='招聘会'?'参加':item.txt=='增值包'?'购买':'进行')+ item.txt 
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
						}else{
                            // 全部刷新成功
                            tt.successTip = true;
                            tt.successTipText = '刷新成功'
						}


					}else{
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


		// 获取招聘管理统计数据
		getManageCount(){
			var tt = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=managerCount',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					tt.manageLoad = true;
					if(data.state == 100){
						tt.manageCount = data.info;

						// 每天一遍刷新提示
						if(tt.manageCount.job){

							tt.checkRefresh();
						}
					}
				},
				error: function () { 
					tt.manageLoad = true;
				}
			});
		},

		// 招聘进展
		jobProcess(){
			var tt = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=jobProcess',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					tt.jobProgressLoading = true;
					if(data.state == 100){
						tt.jobProgress = data.info;
					};
					// if(tt.top>$('.partRight').height()){return}
					// if($(window).height()-$('.partRight').offset().top<$('.partRight').height()){
					// 	tt.top=$(window).height()-$('.partRight').offset().top-$('.partRight').height();
					// }else{
					// 	tt.top=0;
					// }
					// $('.partRight').css('top',tt.top);
				},
				error: function () { 
					tt.jobProgressLoading = true;
				}
			});
		},


		// 刷新单个职位
		refreshItem(item){
			var tt = this;
			var id = item.id;
			// 刷新该职位，弹窗

			var paramArr = [];
			paramArr.push('type=5')
			paramArr.push('refresh_type=1')
			paramArr.push('pid=' + id)

			tt.showPayPop(paramArr)


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
                            mapPop.successTipText = '刷新成功！';
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


		// 面试日程
		getinterviewSchedule(){
			var tt = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=interviewSchedule',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					tt.interviewScheduleObj.isload = true;
					if(data.state == 100){
						tt.interviewScheduleObj.interviewSchedule = data.info.list;
						tt.interviewScheduleObj.pageInfo = data.info.pageInfo;
					}
					// if(tt.top>$('.partRight').height()){return}
					// if($(window).height()-$('.partRight').offset().top<$('.partRight').height()){
					// 	tt.top=$(window).height()-$('.partRight').offset().top-$('.partRight').height();
					// }else{
					// 	tt.top=0;
					// }
					// $('.partRight').css('top',tt.top);
				},
				error: function () { 
					tt.interviewScheduleObj.isload = true;
				}
			});
		},


		// 等待入职
		getpendingBoarding(){
			var tt = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=pendingBoarding',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					// tt.recLoad = true;
					if(data.state == 100){
						tt.pendingBoardingObj.pendingBoarding = data.info.list;
						tt.pendingBoardingObj.pageInfo = data.info.pageInfo;
					}
					// if(tt.top>$('.partRight').height()){return}
					// if($(window).height()-$('.partRight').offset().top<$('.partRight').height()){
					// 	tt.top=$(window).height()-$('.partRight').offset().top-$('.partRight').height();
					// }else{
					// 	tt.top=0;
					// }
					// $('.partRight').css('top',tt.top);
				},
				error: function () { 
					// tt.recLoad = true;
				}
			});
		},


		// 更改状态
		changeState(item,ind){
			var tt = this;
			var el = event.currentTarget;
			var id = item.id
			$.ajax({
				url: '/include/ajax.php?service=job&action=updateBoarding&rz_state='+tt.selectState+'&id='+id,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100){
						tt.pendingBoardingObj.pendingBoarding[ind].state = tt.selectState;
						tt.selectState = ''
					}
				},
				error: function () { 
					// tt.recLoad = true;
				}
			});
		},


		// 推荐人才
		getRecList(){
			var tt = this;
			$.ajax({
				url: '/include/ajax.php?service=job&action=recommendTalents',
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					tt.recLoad = true;
					if(data.state == 100){
						tt.recommendTalents =  data.info;
					};
					// if(tt.top>$('.partRight').height()){return}
					// if($(window).height()-$('.partRight').offset().top<$('.partRight').height()){
					// 	tt.top=$(window).height()-$('.partRight').offset().top-$('.partRight').height();
					// }else{
					// 	tt.top=0;
					// }
					// $('.partRight').css('top',tt.top);
				},
				error: function () { 
					tt.recLoad = true;
				}
			});
		},


		// 续费套餐
		renew_tc(){
			var tt = this;
			var interval = null;
			tt.lodingSelf = true;
			interval = setInterval(function(){
				if(mapPop && mapPop.businessInfo){
					tt.lodingSelf = false;
					mapPop.renewFee(mapPop.businessInfo.combo_id,1);
					clearInterval(interval)
				}
			},1000)
		},


        posterFn(state) { //海报弹窗
            if (state == 0) { //弹出获取职位和海报类型
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
                            action: 'getPosterTemplate'
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
                    // 职位类型
                    $.ajax({
                        url: '/include/ajax.php?',
                        data: {
                            service: 'job',
                            action: 'postList',
                            company:jobcid,
                            pageSize:200
                        },
                        dataType: 'jsonp',
                        timeout: 5000,
                        success:res=>{
                            let length=res.info.list.length;
							if(res.state==100){
								if(length>0){
									if(length<15){
										this.jobtype=res.info.list;
									}else{
										this.alljobtype=JSON.parse(JSON.stringify(res.info.list));//全部展开职位
										this.partjobtype=res.info.list.splice(0,10);//删除多余的;
										this.jobtype=this.partjobtype;
										$('.unfold').css({'display':'flex'});//显示展开按钮
	
									}
								}else{
									$('.pp-steps').hide();
									$('.pp-nopost').css('display','flex');
								}
							}else{
								alert('加载失败，请刷新页面');
							}
                        }
                    })
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
              id:this.posterId.join(','),
              mid:id,
              type:this.posterType
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
				$('html,body').css({'user-select':'none'})
            });
            $(document).mousemove(function (e) {
                if (_move) {
                    let x = e.pageX - _x;//移动时鼠标位置计算控件左上角的绝对位置
                    let y = e.pageY - _y;
                    $(ele).css({ top: y, left: x });//控件新位置
                }
            }).mouseup(function () {
                _move = false;
				$('html,body').css('user-select','')
            });
        },
        foldFn(state){ //折叠/展开职位
            if(state==0){//展开
                this.jobtype=this.alljobtype;
                $('.fold').css({'display':'flex'});
                $('.unfold').hide();
            }else{ //折叠
                this.jobtype=this.partjobtype;
                $('.unfold').css({'display':'flex'});
                $('.fold').hide();
                $('.pp-steps').animate({scrollTop:0},0);//收起回到顶部
            };

        },



		/*工具型方法*/ 
		// 时间转换
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
			var datestr = month + '月' + dates + '日（'+weekDay[day]+'）';
			if(now.toDateString() === date.toDateString() ){
				datestr = '今天'
			}
			datestr = datestr + (hour > 12 ? '下午' + (hour - 12) : '上午' + hour) +  ':' + minute;

			if(type == 1){
				datestr = month + '月' + dates + '日'
			}
			return datestr;
		},

	},

	watch:{
		lodingSelf:function(){},
	}
})