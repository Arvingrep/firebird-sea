


Vue.component('qiangdan-box',{
	data:function(){
		return{
			dlists:'',
			page:1,
			loadfinished:false,
			load_on:false,
			loadingText:langData['waimai'][10][7], //'加载更多'
			
		}
	},
	template:`<ul class="fn-clear qiangdan hlist" >
		<li v-for="dlist in dlists" v-bind:data-id="dlist.id" @click="toUrl" :class="dlist.cattype">
			
			<div class="order_head bsong">
				<div class="order_info">
					<span class="order_num" v-if="dlist.cattype!='waimai'"><i>{{dlist.cattypename}}</i>#{{dlist.ordernum}}</span>
					<span class="order_num" v-if="dlist.cattype=='waimai'"><i>{{dlist.cattypename}}</i>#{{dlist.ordernumstore|getsubStr}}</span>
				</div>
				<div class="order_atime chaoshi" v-if="dlist.overtime ==1 && dlist.state != 7 && dlist.cattype =='waimai'">
					`+langData['waimai'][10][73]+`
				</div>
				<div class="order_atime" v-if="dlist.overtime !=1 && dlist.state != 7 && dlist.cattype =='waimai'">
					`+langData['waimai'][10][74]+`
				</div>
				<div class="order_atime chaoshi" v-if="dlist.state == 7 && dlist.cattype =='waimai'">
					`+langData['waimai'][1][228]+`
				</div>
			</div>
			<div class="order_detail">
				<div class="order_start info_box fn-clear" v-bind:data-lng="dlist.coordY" v-bind:data-lat="dlist.coordX">
					<div class="right_detail">
						<p class="shop_name">{{dlist.shopname}}</p>
						<h3 class="shop_detail">{{dlist.address1}}</h3>
					</div>
				</div>
				<div class="order_end info_box  fn-clear" v-bind:data-lng="dlist.lng" v-bind:data-lat="dlist.lat">
					<div class="right_detail">
						<p class="shop_name">{{dlist.person}}</p>
						<h3 class="shop_detail">{{dlist.address}}</h3>
					</div>
				</div>
			</div>
			
		</li>
		<div class="loading_text">{{loadingText}}</div>
	</ul>
	
	`,
	filters:{
		getsubStr(str){  //截取订单号
			var substr = str.split('-')[1];
			return substr
		},
		juli:function(juli){
			juli = juli>1000?((juli/1000).toFixed(2)+'km'):(juli+'m');
			return juli 
		}
	},
	
	methods:{
		getdata:function(){
			if(this.load_on) return false;  
			this.$root.LOADING = true;  //loading显示
			this.load_on = true;  //防止多次加载
			this.loadingText = '';
			var state = this.$root.curTab;
			if(this.$root.curTab == 3){
				state = '1,7';
			}
			axios({
				method: 'post',
				url: '/include/ajax.php?service=waimai&action=courierOrderList&statetype=1&ordertype='+this.$root.ordertype+'&page='+this.page+'&pageSize=20&state='+state,
			})
			.then((response)=>{
				var data = response.data;
				var npage = this.page;
				if(data.state==100 && data.info.list.length>0){
					this.$root.tabs[0].num = data.info.pageInfo.totalCount0;
					this.$root.tabs[1].num = data.info.pageInfo.totalCount1;
					this.$root.tabs[2].num = data.info.pageInfo.totalCount2;
					if(npage==1){
						this.dlists = data.info.list;
					}else{
						this.dlists = this.dlists.concat(data.info.list);
					}
					npage = npage + 1;
					this.page = npage;
					this.load_on = false;
					this.loadingText = langData['waimai'][10][7] ;   //'下拉加载更多~'
					if(this.page > data.info.pageInfo.totalPage){
						this.load_on = true;
						this.loadingText = langData['waimai'][10][24];     //'没有更多了~'
					}
					this.$root.LOADING = false;//loading隐藏
				}else{
					this.$root.LOADING = false;
					this.loadingText = data.info;
					// this.$root.tabs[0].num = 0;
					// this.$root.tabs[1].num = 0;
					// this.$root.tabs[2].num = 0;
					var tt = this;
					tt.$root.tabs.forEach(function(val){
						if(val.state == tt.$root.curTab){
							val.num = 0;
						}
					})
				}
				
				$(".reload").removeClass("rotate")
			});
		},
		toUrl:function(){
			var el =  event.currentTarget;
			 $(el).attr('disabled',true);
			var id = $(el).attr('data-id');
			var ordertype = $(el).attr('class')
			window.location = '/index.php?service=waimai&do=courier&template=detail&ordertype='+ordertype+'&id='+id;
		}
	},
	
	mounted(){
		var tt = this;
		window.onscroll = function(){
			//变量scrollTop是滚动条滚动时，距离顶部的距离
			var scrollTop = document.documentElement.scrollTop||document.body.scrollTop;
			//变量windowHeight是可视区的高度
			var windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
			//变量scrollHeight是滚动条的总高度
			var scrollHeight = document.documentElement.scrollHeight||document.body.scrollHeight;
		    //滚动条到底部的条件
		    
		   
			if(((scrollTop+windowHeight+10)>=scrollHeight) && !tt.load_on){
				
				//写后台加载数据的函数
				tt.getdata();
			 }   
		}
		
	},
	
	
});






Vue.component("tab-3", {
    template: '<qiangdan-box  ref="qdan"></qiangdan-box>',
	mounted:function(){
		this.$refs.qdan.getdata();
		
	},
	methods:{
		reloadDate:function(){
			this.$refs.qdan.$data.dlists='';
			this.$refs.qdan.$data.page=1;
			this.$refs.qdan.$data.loadfinished=false;
			this.$refs.qdan.$data.load_on=false;
			this.$refs.qdan.$data.loadingText = langData['waimai'][10][7];   //'加载更多'
			this.$refs.qdan.getdata();
		}
	}
 });
Vue.component("tab-1", {
    template: '<qiangdan-box  ref="qdan"></qiangdan-box>',
	mounted:function(){
		this.$refs.qdan.getdata();
		
	},
	methods:{
		reloadDate:function(){
			this.$refs.qdan.$data.dlists='';
			this.$refs.qdan.$data.page=1;
			this.$refs.qdan.$data.loadfinished=false;
			this.$refs.qdan.$data.load_on=false;
			this.$refs.qdan.$data.loadingText = langData['waimai'][10][7];   //'加载更多'
			this.$refs.qdan.getdata();
		}
	}
});
Vue.component("tab-7", {
    template: '<qiangdan-box ref="qdan"></qiangdan-box>',
	mounted:function(){
		this.$refs.qdan.getdata();
	},
	methods:{
		reloadDate:function(){
			this.$refs.qdan.$data.dlists='';
			this.$refs.qdan.$data.page=1;
			this.$refs.qdan.$data.loadfinished=false;
			this.$refs.qdan.$data.load_on=false;
			this.$refs.qdan.$data.loadingText = langData['waimai'][10][7];   //'加载更多'
			this.$refs.qdan.getdata();
		}
	}
});











clickable = false;  //防止多次点击点击
var pageVue = new Vue({
	el: "#page",
	data:{
		typeshow:0,
		curTab:'3',
		LOADING:false,
		ordertype:'',
		tabs:[
			{'action':'robbed','state':'3','cn':langData['waimai'][7][78],'en':'qd','num':0,},    //全部
			{'action':'distribution','state':'1','cn':langData['waimai'][10][75],'en':'qh','num':0},    //成功
			{'action':'distribution','state':'7','cn':langData['waimai'][10][76],'en':'ps','num':0},    //失败
		],
	},
	
	computed: {
	    currentTabComponent: function() {
	      return "tab-" + this.curTab;
	    }
	},
	
	methods:{
		typechange:function(){
			var el = event.currentTarget;
			$(el).toggleClass('type_chose').siblings('li').removeClass('type_chose');
			this.typeshow = !this.typeshow;
			this.ordertype = $(el).attr('data-ordertype');
			$(".tab_li li").eq(0).find('.tabname').html($(el).text())
			this.$refs.databox.reloadDate();
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