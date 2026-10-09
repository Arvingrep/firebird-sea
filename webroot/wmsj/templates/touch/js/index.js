new Vue({
	el:'#page',
	data:{
		changeShop:0, //切换店铺，店铺列表显示
		status:status*1,  //店铺状态
		ordervalid:ordervalid*1,
		manageitem:mangeItem,  //管理数组
		serviceItem:serviceItem, //服务数组
		LOADING:false,
		slist_page:1,  //店铺加载页数
		slist_load:0,  //店铺加载页数
		slists:[],
		shopid:shopid,
		bottomtab:bottom_tab,
		custom_otherpeisong:custom_otherpeisong,
		currbTab:'shop'
	},
	mounted(){
		// swiper
		 var swiper = new Swiper('.swiper-container', {
		      slidesPerView:'auto',
		      pagination: {
				  el: '.pagination',
				  type:"progressbar",
				},
		});
	},
	methods:{
		getshopList:function(){
			var tt = this;
			if(tt.slist_load) return false;
			tt.LOADING = true;
			tt.slist_load = 1;
			axios({
				method: 'post',
				url: '../index.php?action=shopList&u=1&page='+tt.slist_page+'&pageSize=1000',
			})
			.then((response)=>{
				var data = response.data;
				if(data.state==100){
					if(data.info.pageInfo.totalCount==2){
						var lists = data.info.list;
						lists.forEach(function(val){
							if(shopid != val.id){
								window.location = 'store-detail.php?id='+val.id+"&currentPageOpen=1";
							}
						})
					}else{
						this.changeShop = !this.changeShop;
						tt.slists = tt.slists.concat(data.info.list);
						tt.slist_load = 0;
						tt.slist_page++;
						if(tt.slist_page>data.info.pageInfo.totalPage){
							tt.slist_load = 1;
						}
					}
				}else{
					console.log('没有数据')
				}
				tt.LOADING = false;
			})
		},
		callShop:function(){
			
			if($(".shop_list li").length==0){
				this.getshopList()
			}else{
				this.changeShop = !this.changeShop;
			}
		},
		changeStatus:function(){
			var tt = this;
			tt.LOADING = true;
			var el = event.currentTarget;
			$(el).attr('disabled')
			var val = $(el).hasClass('active')?0:1;
			var action = $(el).attr('data-type')=='status'?"updateStatus":"updateValid";
			let param = new URLSearchParams();
			param.append('action', action);
			param.append('id', shopid);
			param.append('val', val);
			
			axios({
				method: 'post',
				url: 'waimaiShop.php',
				data:param,
			})
			.then((response)=>{
				var data = response.data;
				if(data.state==100){
					tt.LOADING = false;
					
					if($(el).attr('data-type')=='status'){
						console.log(tt.status)
						tt.status = !tt.status;
						console.log(tt.status)
						// status = !status
					}else{
						//ordervalid = !ordervalid;
						 tt.ordervalid = !tt.ordervalid;
					}
					$(el).removeAttr('disabled')
				}
			})
		},
		toUrl:function(){
			var el = event.currentTarget;
			var type = $(el).attr('data-type');
			var url = $(el).attr('data-url');
			if(type=='pjgl'){
				window.location = url;
			}else{
				window.location = url+shopid;
			}
		}
	}
})