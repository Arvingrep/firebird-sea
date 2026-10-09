/**
 * 会员中心招聘收藏职位列表
 * by guozi at: 20230208
 */

var showAlertErrTimer = null;
var hasShowBusinessTip = false; //提示已经是商家账户，不建议使用个人
let resumeList;
var pageVue = new Vue({
	el:'#collectPage',
	data:{
		jobcid:Number(job_cid),
		companyCollections:[], //公司收藏
		showTab:type ? type : 'post',
		isload_company:false, //加载
		page_company:1, //页码
		totalCount_company:0, //总数
		postCollections:[], // 职位收藏
		isload_post:false, //加载
		page_post:1, //页码
		totalCount_post:0, //总数
		collectTime:2, //3个月内收藏
		delPop:false,
		hasChosedItem:[], //当前选择
		invalidArr:[], //失效职位
		userResume:'', //用户默认简历

		popConfirm:{
            show:false, //显示
            title:'', //标题
            tip:'',
            width:0,
            height:0,
            cls:'',
            btns:[
                
            ]
        },

		noDataAll_post:false,  //没有任何数据
		noData_post:false,  //筛选没有数据

		noDataAll_company:false,  //没有任何数据
		noData_company:false,  //筛选没有数据
		selectAllb:false,//全选状态
		post_id:'',//投递职位的职位id
	},
	mounted:function(){
		tt=this;
		this.getCollects();
		this.checkLeft();

		this.getDefaultResume(); //获取简历
		$('.jobSideBar ul').delegate('li','click',function(){
			if($(this).index()>=4){
                if(!tt.userResume){
                    event.preventDefault();
                    $('.sendpop').show();
                }else if(tt.userResume.education.length == 0 || tt.userResume.work_jl.length == 0 && tt.userResume.work_jy != 0){
					event.preventDefault();
                    $('.ss-title p').text('您有一份简历待完善');
                    $('.ss-text p').text('完善简历后，才可投递心仪职位！请认真填写哦');
                    $('.ss-btn .cancel').text('暂不完善');
                    $('.ss-btn .certificate').text('继续填写简历');
                    $('.sendpop').show();
                }
            }
        });
		let data={
			service:'job',
			action:'resumeList',
			u:1
		}
		ajax(data).then(res=>{
			resumeList=res.info.list;
			let str=``;
			for(let i=0;i<res.info.list.length;i++){ //添加选项
				str+=`<li ${res.info.list[i].state!=1||res.info.list[i].education.length==0||(res.info.list[i].work_jy!=0&&data.info.list[0].work_jl.length == 0)?'class=noSend':''} data-id="${res.info.list[i].id}" data-alias="${res.info.list[i].alias}">${res.info.list[i].alias}<span>${res.info.list[i].state!=1?'（审核中，不可使用）':res.info.list[i].education.length==0||(res.info.list[i].work_jy!=0&&data.info.list[0].work_jl.length == 0)?'（未完善，不可使用）':''}</span></li>`
			};
			$('.mrs-input ul').html(str);
		});
		// 待审核投递
		$('.mr-btn .change').click(function () { //更换简历
			$('.mr-content').hide();
			$('.mr-select').show();
			let height = $('.mrs-input ul').height();//ul的高度
			let show = false;//显隐判断
			$('.mrs-input ul').css({ //高度重置
				'display': 'block',
				'height': '0'
			});
			$('.mrs-input').delegate('input', 'click', function () { //显示/隐藏
				show = !show;
				$('.mrs-input ul').css('height', show ? 0 : height)
			});
		});
		$('.mrs-input ul').delegate('li', 'click', function () { //选择简历
			$('.mrs-input input').click()[0];
			$('.mrs-btn .confirm').addClass('has')
			$(this).addClass('active').siblings().removeClass('active');
			let alias = $(this).attr('data-alias');
			$('.mrs-input input').val(alias);
		});
		$('.mrs-btn').delegate('.confirm.has', 'click', function () {//确认投递
			rid = $('.mrs-input ul .active').attr('data-id');
			let data = {
				service: 'job',
				action: 'delivery',
				pid: tt.post_id,
				rid: rid
			};
			ajax(data).then(res => {
				$('.moreResume').hide();
				tt.showErrAlert(res.info);
			});
		});
		$('.mr-close,.mr-btn .close,.mrs-btn .cancel').click(function () { //关闭弹窗
			$('.mr-content').css({ 'animation': 'bottomFadeOut .3s' });
			$('.mr-select').css({ 'animation': 'bottomFadeOut .3s' });
			setTimeout(() => {
				$('.moreResume').hide();
				$('.mr-content').css({ 'animation': 'topFadeIn .3s' });
				$('.mr-select').css({ 'animation': 'topFadeIn .3s' });
			}, 280);
		});
	},
	methods:{
		// 获取职位收藏
		getCollects(type){
			const that = this;
			type =  type ? type : that.showTab;
			if(that['isload_' + type]) return false;
			that['isload_' + type] = true;
			that['noData_' + type] = false;
			$.ajax({
                url: '/include/ajax.php?service=job&action='+that.showTab+'List&collect=1&module=job&collectTime='+ that.collectTime +'&page=' + that['page_' + type],
                type: "GET",
                dataType: "json",
                success: function (data) {
					that['isload_' + type] = false;
                    if (data.state == 100) {
						for(let i=0;i<data.info.list.length;i++){
							if(data.info.list[i].off==1||data.info.list[i].del==1){ //失效职位
								that.invalidArr.push(data.info.list[i]);
							}
						};
						that['totalCount_' + type] = data.info.pageInfo.totalCount;
						that[type + 'Collections'] = data.info.list
						if(that['page_' + type] > data.info.pageInfo.totalPage){

						}
						if(data.info.pageInfo.totalCount == 0){
							that['noData_' + type] = true;
						}
						if(!data.info.pageInfo.totalCountAll){
							that['noDataAll_' + type] = true;
						}else{
							that['noDataAll_' + type] = false;
						}
                    }else{
						if(data.info.list.length == 0){
							that['noData_' + type] = true;
						}
					}
                    
                },
                error: function () {
					that['noData_' + type] = true;
                }
            });
		},

		// 跳转职位详情
		gotoLink(row, column, event){
			if(row.off||row.del){ //已下架或者删除
				$('.invalidPop .ss-title p').text('该职位已失效');
				$('.invalidPop .ss-text p').text('该职位已被招聘方下架或删除');
				$('.invalidPop').show();
				return
			}else if(row.state==0||row.state==2){ //审核中
				$('.invalidPop .ss-title p').text('该职位审核中');
				$('.invalidPop .ss-text p').text('该职位内容可能有变动，平台正在审核中');
				$('.invalidPop').show();
				return
			}
			const that = this;
			const temp = that.showTab == 'company' ? '/company-' : '/job-';
			open(jobChannel + temp  + row.id +'.html');

		},
		// 投递简历
		td_resume(scope){
			event.preventDefault();
			const that = this;
			const postDetail = scope.row;
			that.post_id=postDetail.id;
			if(that.userResume.state==0&&resumeList.length>1){//简历审核中
				$('.moreResume').show();
				return
			};
			if(job_cid != '0' && !hasShowBusinessTip){
				that.popConfirm['title'] = '当前账号为招聘企业，不建议使用求职功能投递简历'
				that.popConfirm['tip'] = '建议切换使用个人账号求职'
				that.popConfirm['btns'] = [{
					type:'sure',
					text:'好的',
					fn:function(){
						that.popConfirm['show'] = false;
						hasShowBusinessTip = true; //不需要再显示
						that.td_resume()
					}
				}]	
			}
			if(postDetail.has_delivery_company){  //近期已投递过
				that.showErrAlert('已投过该公司，近期不可再投递');
				that.$refs.table.toggleRowSelection(row);
				return false;
			}else if(job_cid == postDetail.companyDetail.id){ //该职位是本人发布
				that.showErrAlert('禁止投递自己发布的职位');
				that.$refs.table.toggleRowSelection(row);
				return false;
			}

			that.deliveryResume(postDetail.id); //投递
		},

		

		disabledRow(row,rowInd){
			this.selectAbleFn(row.row);
			return row.row.off==1||row.row.state!=1 ? 'disabeldRow' : ''
		},

		 // 表格全选
		selectAll(){
            var tt = this;
            tt.$refs.table.toggleAllSelection();
        },
		selectAbleFn(row){ //行禁选
			if(row.off==1||row.state!=1){
				return false
			}else{
				return true
			}
		},
		// 可选
		selected(row,index){
			if(row.del ||row.has_delivery){
				return false;
			}else{
				return true
			}

		},

		// 获取已选的项目
		choseAll(selection){
			const that = this;
			// if(that.hasChosedItem.length < selection.length && job_cid != '0'){
			// 	that.popConfirm['title'] = '当前账号为招聘企业，不建议使用求职功能投递简历'
			// 	that.popConfirm['tip'] = '建议切换使用个人账号求职'
			// 	that.popConfirm['btns'] = [{
			// 		type:'sure',
			// 		text:'好的',
			// 		fn:function(){
			// 			that.popConfirm['show'] = false;
			// 			that.hasChosedItem = selection;

			// 		}
			// 	}]
			// 	that.popConfirm['show'] = true;
			// }else{
			// 	that.hasChosedItem = selection;
			// }
			that.hasChosedItem = selection;
			if(that.hasChosedItem.length==(that.postCollections.length-that.invalidArr.length)){
				that.selectAllb=true;
			}else{
				that.selectAllb=false;
			};
			let canDelivery = false;
			for(var i = 0; i < selection.length; i++){
				const pdetail = selection[i];
				if(!pdetail.has_delivery && !pdetail.has_delivery_company && !pdetail.del && that.jobcid != pdetail.companyDetail.id){  //没有投递过给公司 并且没删除职位
					canDelivery = true;
					break;
				}
			}

			if(!canDelivery  ){
				$(".pltd_btn").addClass('disabled')
			}else{
				$(".pltd_btn").removeClass('disabled')
			}
		},

		// 批量投递简历
		plDelivery(){
			const that  = this;
			if($(event.currentTarget).hasClass('disabled')) return false; //不能删除
			if(that.hasChosedItem.length > 0){
				for(var i = 0; i < that.hasChosedItem.length; i++){
					const item = that.hasChosedItem[i];
					if(item.has_delivery || item.has_delivery_company || item.del || that.jobcid == item.companyDetail.id){ //不能投递
						that.$refs.table.toggleRowSelection(item);
					}
				}
				that.deliveryResume(); //投递简历
			}
		},
		// 清除失效
		clearInvalid(){
			let ids = [];
			if(this.invalidArr.length==0){
				let text='暂无失效职位';
				this.showErrAlert(text);
				return
			};
			ids = this.invalidArr.map(item => {
				return item.id
			});
			this.cancelCollect(ids,'job'); //执行删除操作
		},
		// 批量删除职位 ---> 取消收藏
		plDelPost(){
			const that = this;
			let ids = [];
			if(that.hasChosedItem.length > 0){  //勾选
				ids = that.hasChosedItem.map(item => {
					return item.id
				})
			}else{  //未勾选则删除已经失效的职位
				let delArr = [];
				delArr = that.postCollections.filter(item =>{
					return item.detail.del;
				})
				ids = delArr.map(item => {
					return item.id
				})
			}
			that.cancelCollect(ids,'job'); //执行删除操作
		},

		// 跳转页码
		changePage(page){
			var tt = this;
            tt['page_' + tt.showTab] = page;
            tt.getCollects()
		},

		// 选择某一项
		selectRow(selection,row){
			// console.log(222)
			// const that = this;
			// if(row.has_delivery_company){  //近期已投递过
			// 	that.showErrAlert('已投过该公司，近期不可再投递');
			// 	that.$refs.table.toggleRowSelection(row);
			// 	return false;
			// }else if(job_cid == row.companyDetail.id){ //该职位是本人发布
			// 	that.showErrAlert('禁止投递自己发布的职位');
			// 	that.$refs.table.toggleRowSelection(row);
			// 	return false;
			// }
			// that.hasChosedItem = selection;
		},


		checkLeft(val){
            var tt = this;
            // var currTab = val ? val : tt.currTab;
            var el = $(".onTab");
            if(el.length){

                var left = el.position().left + el.innerWidth()/2  - $(".wrap_title  s").width()/2;
				console.log(left)
                $(".wrap_title  s").css({
                    'transform':'translateX('+left+'px)'
                })
            }
        },

		 // 显示黑框提示
		showErrAlert(data){
            showAlertErrTimer && clearTimeout(showAlertErrTimer);
            $(".popErrAlert").remove();
            $("body").append('<div class="popErrAlert"><p>' + data + '</p></div>');
        
            $(".popErrAlert").css({
                "visibility": "visible"
            });
            showAlertErrTimer = setTimeout(function () {
                $(".popErrAlert").fadeOut(300, function () {
                    $(this).remove();
                });
            }, 1500);
        },

		// 取消收藏
		cancelCollect(item,idArr){
			const that = this;
			let ids = item;
			// ids = idArr ? idArr : ids;
			console.log(ids)
			$.ajax({
				url: `/include/ajax.php?service=member&action=collect&module=job&temp=${idArr}&type=del&id=` + ids.join(','),
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						that.showErrAlert(data.info);
						that.getCollects();
					}else{
						that.showErrAlert(data.info);
					}
				},
				error: function(){
					that.showErrAlert(langData['siteConfig'][20][183]);
				}
			});
		},

		// 获取当前登录用户默认简历
		getDefaultResume(){
			const that = this;
			$.ajax({
				url: "/include/ajax.php?service=job&action=resumeDetail&default=1",
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						that.userResume  = data.info;
						$('.mr-title p span').text(data.info.alias);//修改投递简历弹窗的标题文本
						if(data.info.education.length == 0 || data.info.work_jl.length == 0 && data.info.work_jy != 0){
							event.preventDefault();
							$('.ss-title p').text('您有一份简历待完善');
							$('.ss-text p').text('完善简历后，才可投递心仪职位！请认真填写哦');
							$('.ss-btn .cancel').text('暂不完善');
							$('.ss-btn .certificate').text('继续填写简历');
							$('.sendpop').show();
						}
					}else{
						if(data.info.indexOf('创建一个简历')!=-1){
							$('.sendpop').show();
						}else{
							that.showErrAlert(data.info);
						}
					}
				},
				error: function(){
					that.showErrAlert(langData['siteConfig'][20][183]);
				}
			});

		},

		// 投递简历
		deliveryResume(id){
			const that = this;
			let ids = id  ? [id] :[];
			if(!id){
				if(that.hasChosedItem.length == 0){
					that.showErrAlert('请至少选择1个职位投递');
					return false;
				}
				ids = that.hasChosedItem.map(item => {
					return item.id
				})
			}
			$.ajax({
				url: "/include/ajax.php?service=job&action=delivery&rid=" + that.userResume.id + '&pid=' + ids.join(','),
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
						let fail = false;
						for(var i = 0; i < data.info.length; i++){
							if(data.info[i].type == 'fail'){
								fail = true
								that.showErrAlert(data.info[i].msg);
								break;
							}
						}
						if(!fail){
							that.showErrAlert('投递成功');
						}
					}else{
						that.showErrAlert(data.info);
					}
				},
				error: function(){
					that.showErrAlert(langData['siteConfig'][20][183]);
				}
			});

		},

		// 关闭投递弹窗
		closePopFn () {
			$('.sendpop,.invalidPop').children().css({ 'animation': 'bottomFadeOut .3s' });
			setTimeout(() => {
				$('.sendpop,.invalidPop').hide();
				$('.s-certificate').css({ 'animation': 'topFadeIn .3s' });
			}, 280);
		}

	},
	watch:{
		showTab(val){
			const that = this;
			this.$nextTick(function(){
				this.checkLeft()
				if(that[val + 'Collections'].length  == 0){
					this.getCollects(val)
				}
			})
		},

		collectTime(val){
			const that = this;
			const tab = that.showTab
			this.$nextTick(function(){
				that['isload_' + tab] = false, //加载
				that['page_' + tab] = 1, //页码
				this.getCollects(tab)
			})
		}
	}
})
function ajax(data){
    return new Promise(resolve=>{
        $.ajax({
            url: '/include/ajax.php?',
            data: data,
            dataType: 'jsonp',
            timeout: 5000,
            success:(res)=>{
                resolve(res);
            }
        })
    })
}