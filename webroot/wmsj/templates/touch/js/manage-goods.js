new Vue({
	el:'#page',
	data:{
		LOADING:false,
		menuList:[],
		menuIdList:[],
		foodList:[],  //渲染列表数据
		xiajiaList:[],
		page:1,
		load_on:false,
		loadTxt:langData['waimai'][10][7]+'~',  //加载更多~
		isClick:false,
		curr:'all',
		changeSort:false,
		totalCount:0,
		totalCount0:0,
		totalCount1:0,
		totalCount2:0,
		typeid : 0,
		dCount:0, //数据条数
		scrollH:0, //滚动高度
		scrollTop:0, //页面滚动高度
		allFoodList:[], //所有列表数据
		interval:null,
	},
	created() {
		this.getMenuList();
		this.getFoodList();
	},
	computed:{
		menu_list:function(){
			const that = this;
			return function(typeid){
				let list = that.foodList.filter(item =>{
					return item.typeid == typeid
				})
				list = list || []
				return list;
			}
		},

		noTypeList:function(){
			const that = this;
			return function(){
				let list = that.foodList.filter(item => {
					return !that.menuIdList.includes(item.typeid)
				})
				list = list || []
				return list;
			}
		}
	},
	mounted(){
		var left = $(".tab_box li.on_chose").offset().left+$(".tab_box li.on_chose").width()/2;
		$(".tab_box b").css('left',left);
		
		var tt = this;
		// 滚动加载
		window.onscroll = function(){
			//变量scrollTop是滚动条滚动时，距离顶部的距离
			var scrollTop = document.documentElement.scrollTop||document.body.scrollTop;
			//变量windowHeight是可视区的高度
			var windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
			//变量scrollHeight是滚动条的总高度
			var scrollHeight = document.documentElement.scrollHeight||document.body.scrollHeight;
			
   			
			// tt.scrollTop = scrollTop;
			// //滚动条到底部的条件
			// if(((scrollTop+windowHeight+10)>=scrollHeight) && !tt.load_on && !tt.isClick){
			// 	//写后台加载数据的函数
			// 	tt.getFoodList(tt.typeid)
			// } ;
			var topH = $(".top_box").height();
		    if(!tt.isClick){
		        
    			$(".list_box dl").each(function(){
    				var t = $(this);
    				var typeid = t.attr('data-id');
    				var dh = t.find('dt').height();
    				if((t.offset().top-2*dh - 10) <= scrollTop && (t.offset().top-dh+t.height())>scrollTop && !tt.isClick ){
    					$(".menu_box li").removeClass('fenlei_now')
    					$(".menu_box li[data-id='"+typeid+"']").addClass('fenlei_now')
    				};
    
    			})
		    }
		};




		
	},
	methods:{
		changetab:function(){
			var el = event.currentTarget;
			var currnow = $(el).attr('data-curr')
			this.curr = currnow;
			this.typeid = 0;
			$('.menu_box li').removeClass('fenlei_now')	
			if(!$(el).hasClass('on_chose')){
				$(".tab_box li").removeClass('on_chose')
				$(el).addClass('on_chose')
				var left = $(".tab_box li.on_chose").offset().left+$(".tab_box li.on_chose").width()/2;
				$(".tab_box b").css('left',left);
				this.page = 1;
				this.load_on = false;
				this.foodList = [],this.allFoodList = []
				this.getFoodList(this.typeid)
			}
			
		},
		getMenuList:function(){
			axios({
				method: 'post',
				url: 'goods-type.php?sid='+sid+'&gettype=ajax',
				
			})
			.then((response)=>{
				var data = response.data;
				if(data.state==100){
					this.menuList = data.info.list;
					this.menuIdList = data.info.list.map(item => {
						return item.id
					})
				}
			})
		},
		getFoodList:function(typeid,npage){
			var tt = this;
			if(tt.load_on) return false;
			tt.load_on = true;
			tt.loadTxt = 'loading ~';
			tt.LOADING = true;
			var foodtype = '';
			// $('.menu_box li').removeClass('fenlei_now')
			// $('.menu_box li:first-child').addClass('fenlei_now')
			if(this.curr == 'all'){
				foodtype = 1;
			}else if(this.curr == 'stock'){
				foodtype = 2;
			}else{
				foodtype = 3;
			}
			axios({
				method: 'post',
				url: '?action=getList&title=&sid='+sid+'&foodtype='+foodtype,
				
			})
			.then((response)=>{
				var data = response.data;
				var tt = this;
				tt.allFoodList = [];
				tt.foodList = []
				if(data.state == 100){
					if(tt.curr=='all'){
						tt.totalCount  = data.info.pageInfo.totalCount
						tt.totalCount0 = data.info.pageInfo.totalCount0
						tt.totalCount1 = data.info.pageInfo.totalCount1
						tt.totalCount2 = data.info.pageInfo.totalCount2
					}
					tt.LOADING = false;
					tt.load_on = false;
						
					let list = data.info.list;
					list.sort((a,b) => (tt.menuIdList.indexOf(a.typeid) <= -1 ? tt.menuIdList.length : tt.menuIdList.indexOf(a.typeid)) - (tt.menuIdList.indexOf(b.typeid) <= -1 ? tt.menuIdList.length : tt.menuIdList.indexOf(b.typeid)))
					tt.allFoodList = list;
					tt.renderList()
					tt.loadTxt = '没有更多了~';
				}else{
					tt.LOADING = false;
					tt.load_on = false;
					tt.loadTxt = data.info;
				}
				
			})
		},

		// 更新渲染礼拜
		renderList(){
			const that = this;
			let list = that.allFoodList;
			let total = list.length;
			let currLen = that.foodList.length;
			requestAnimationFrame(()=>{
				// 每次只渲染50条数据
				for(let i = 0; i < 50; i++){
					$('.list_box dl').show()
					$('.menu_box li').show()
					// 当DOM渲染完就退出
					if(that.foodList.length >= total) {
						that.$nextTick(() =>{
							$(".list_box dl").each(function(){
								var dl = $(this),id = dl.attr('data-id')
								if(dl.find('dd').length==0){
									dl.hide();
									$('.menu_box li[data-id="'+ id +'"]').hide()
								}else{
									dl.show();
									$('.menu_box li[data-id="'+ id +'"]').show()
									$(this).find('dd').each(function () {
										var td = $(this),ii = (td.index()-1);
										td.attr('data-index',(dl.find('dd').length-ii))
									})	
								}
							})
						})
						return;
					}
					if(that.foodList.length == 0){
						let id = list[0].typeid
						$('.menu_box li').removeClass('fenlei_now')
						$('.menu_box li[data-id="'+ id +'"]').addClass('fenlei_now')
					}
					that.foodList.push(list[currLen + i])
				}
				that.renderList();
			})
		},


		 scrollTo: function(){
			var el = event.currentTarget;
			$(el).addClass('fenlei_now').siblings('li').removeClass('fenlei_now');
			var typeid  = $(el).attr('data-id');
			this.typeid = typeid;
		
			var dl = $('.fenlei_dl[data-id="'+typeid+'"]');
			dl.show()
			var dh = dl.find('dt').height(); 
			this.isClick = true;
			var tt = this;
			clearInterval(tt.interval)
			tt.dCount = 0; //重置
			tt.scrollH = 0; //重置
// 			dl.find('dd').remove();
			tt.load_on = false;
			tt.LOADING = false;
			var dl_index = dl.index();
			$(".fenlei_dl").each(function(){
			    var t = $(this),index = t.index();
			    if(dl_index < index){
			     //   t.find('dd').remove();
			    }
			})
			if(dl.find('dd').length==0){
			    tt.LOADING = true;
			   	tt.interval = setInterval(() => {
			   		let len = dl.find('dd').length;
			   		if(!tt.LOADING){
			   			tt.LOADING = true;
			   		}
			   		if(len){
			   			clearInterval(tt.interval)
			   			tt.LOADING = false;
			   			window.scroll({
							left:0,
							top:$('.fenlei_dl[data-id="'+typeid+'"]').offset().top- 2*dh - 7,
							behavior:'instant'
						})
			   		}
			   	},100)

			}else{
				window.scroll({
					left:0,
					top:$('.fenlei_dl[data-id="'+typeid+'"]').offset().top- 2*dh - 7,
					behavior:'instant'
				})
			}
		
			setTimeout(function() {
				tt.isClick  = false;
			}, 1000)
			
		},
		/**
		 * @param {number} [nextNone=0]  表示最后一个分类 没有下一级
		 *  */ 
		async getNextData(nextNone = 0){  
		    const that = this;
		    if(that.dCount < 5 && !nextNone ){
		        await that.getFoodList(that.typeid)
		    }else{
		        setTimeout(() => {
		            console.log(that.scrollH)
		            // $(window).scrollTop(that.scrollH);
		            window.scroll(0,that.scrollH,'none')
		        },500)
		    }
		},
		xiajia:function(id){
			el = event.currentTarget;
			$(el).addClass("disabled")
			var val = $(el).attr('data-status');
			let param = new URLSearchParams();
			param.append('action', 'updateStatus');
			param.append('id', id);
			param.append('val', val=='1'?0:1);
			axios({
				method: 'post',
				url: 'waimaiFoodList.php',
			    data: param,
			})
			.then((response)=>{
				var data = response.data;
				if(data.state==100){
					showErr(data.info);
					$(el).attr('data-status',(val=='1'?0:1));
					$(el).html(val=='1'?langData['waimai'][11][131]:langData['waimai'][11][130]);  //上架   下架
					var tt = this;
					this.totalCount2 = val=='1'?(this.totalCount2+1):(this.totalCount2-1);
					this.totalCount0 = val=='1'?(this.totalCount0-1):(this.totalCount0+1);
					// location.reload();

					// 重新加载数据
					tt.load_on = 0;
					tt.page = 1;
					tt.foodList = [];
					tt.allFoodList = [];
					tt.getFoodList()
				}else{
					showErr(data.info);
				}
				
				$(el).removeClass("disabled")
			})
		},
		
		// 增加库存 - 显示输入框
		change_kucun:function(){
			var el = event.currentTarget;
			$(el).addClass('ckucun')
		},
		
		// 增加库存 - 确定
		add_kucun:function(id){
			var el = event.currentTarget;
			var stock_num = $(el).prev('input').val();
			var tt = this;
			axios({
				method: 'post',
				url: '?action=updatkucun&sid='+sid+'&id='+id+'&stock_num='+stock_num,
			})
				.then((response)=>{
					var data = response.data;
					if(data.state==100){
						// location.reload();
						// 重新加载数据
						tt.load_on = 0;
						tt.page = 1;
						tt.getFoodList()
					}else{
						alert(data.info);
					}
					tt.LOADING = false;
				})
		},
		
		// 保存排序
		saveSort:function(){

			var pxArr = []
			$(".list_box dl").each(function () {
				var dl = $(this);
				dl.find('dd').each(function () {
					var td = $(this),id = td.attr('data-id');
					var ii = td.index()-1;
					pxArr.push({'id':id,'sort':(dl.find('dd').length-ii)});
				})
			});
			let param = new URLSearchParams();
			param.append('upsort', JSON.stringify(pxArr));
			this.changeSort = !this.changeSort;
			axios({
				method: 'post',
				url: '?action=updatesort&sid='+sid,
				data:param,
			})
			.then((response)=>{
				var data = response.data;
				if(data.state==100){
					location.reload();
				}else{
					alert(data.info);
				}
				tt.LOADING = false;
			})
		},
		
		// 排序
		sortChange:function(){
			var el = event.currentTarget;
			var type = $(el).attr('data-type');
			var par = $(el).closest('.ddlist');
			$(".btns_group .btns").addClass('disabled')
			if(type=='up'){
				par.addClass('slide-top');
				par.prev().addClass('slide-bottom');
				setTimeout(function(){
					par.removeClass('slide-top');
					par.prev().removeClass('slide-bottom');
					par.prev().before(par);
					$(".btns_group .btns").removeClass('disabled')
				},500)
				
			}else{
				
				par.addClass('slide-bottom');
				par.next().addClass('slide-top');
				setTimeout(function(){
					par.removeClass('slide-bottom');
					par.next().removeClass('slide-top');
					par.next().after(par);
					$(".btns_group .btns").removeClass('disabled')
				},500)
			}
		}
	}
})


var showErrTimer;
function showErr(data) {
	showErrTimer && clearTimeout(showErrTimer);
	$(".popErr").remove();
	$("body").append('<div class="popErr"><p>' + data + '</p></div>');
	$(".popErr p").css({
		"margin-left": -$(".popErr p").width() / 2,
		"left": "50%"
	});
	$(".popErr").css({
		"visibility": "visible"
	});
	showErrTimer = setTimeout(function() {
		$(".popErr").fadeOut(300, function() {
			$(this).remove();
		});
	}, 1500);
 }