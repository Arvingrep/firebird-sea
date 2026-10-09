var siwper;
var device = navigator.userAgent;

// 未完成订单
var list_li = {
	data:function(){
		return {
			loadingText:langData['waimai'][10][7], //'加载更多'
			dlists:this.$root.currList,
			count:0,
			device:(device.indexOf('huoniao_Android')>-1 ||device.indexOf('huoniao_iOS')>-1),
			interval:null,
			now:parseInt(new Date().getTime() / 1000)
		}
	},
	created(){
		$('body').off('touchmove');
	},

	filters:{
		/* 手机尾号 */
		subStr:function(tel){
			subStr = tel.substr(7);
			return subStr;
		},

		/* 订单号 */
		subStrOrder:function(ordernum){
			if(ordernum.indexOf('-')>-1){
				ordernum = ordernum.split('-')[1];
			}else{
				ordernum = ordernum.substr(ordernum.length-3);
			}
			ordernum = ordernum>=100?ordernum:('0'+(ordernum>=10?ordernum:('0'+ordernum)))
			return ordernum;
		},

		getTime:function(time){
			var dateTime = huoniao.transTimes(time,1);
			var transTime = dateTime.split(' ')[1].split(':');
			return (transTime[0]+':'+transTime[1]);
		},
		fixTo:function(num){
			var num = Number(num);
			num = num.toFixed(2);
			return num
		}
	},
	methods:{
		//获取数据
		getdata:function(reload,loadState){
			clearTimeout(this.interval)
			var li = $(".tab_box li.on_chose");
			var page =  li.attr('data-page'); // 页数
			var load =  li.attr('data-load'); // 是否加载
			if(load=='1') return false;
			li.attr('data-load','1');
			if(!reload){

				this.$root.LOADING = true;  //loading显示
				this.loadingText = '';
			}
			var nstate = this.$root.currState;
			if(loadState && loadState != nstate) {
				clearTimeout(this.interval)
				return false
			};
			// 首次打开不是新订单状态
			if(nstate!=state){
				li.attr('data-load','0');
				setTimeout(function(){
					$(".tab_box li[data-state='"+state+"']").off('click').click();
				},100)
				return false;
			}
			axios({
				method: 'post',
				url: '?action=getList&state='+nstate+'&p='+page,
			})
			.then((response)=>{
				var data = response.data;
				if(data.state==100){
					$(".swiper-slide-active .listbox").removeClass('noData');
					var arr = this.$root.tabs[this.$root.currOn-1]['dlists']
					this.$root.tabs[this.$root.currOn-1]['dlists'] = arr.concat(data.info.list)
					this.dlists = this.$root.tabs[this.$root.currOn-1]['dlists'];
					this.$root.merchant_deliver = data.info.list[0].merchant_deliver;
					page = page*1 + 1;
					li.attr('data-load','0');
					li.attr('data-page',page);
					this.loadingText = langData['waimai'][10][7]; //'加载更多'
					if(page > data.info.pageInfo.totalPage){
						li.attr('data-load','1');
						this.loadingText = langData['waimai'][10][24];'没有更多了~';
					}
					this.$root.LOADING = false;  //loading显示
					this.count = data.info.pageInfo.nomealtime;
					this.$root.tabs[3].dpageInfo = data.info.pageInfo.totalCount1.toString();
					this.$root.tabs[4].dpageInfo = data.info.pageInfo.totalCount3.toString();
					this.$root.tabs[5].dpageInfo = data.info.pageInfo.totalCount2.toString();
				}else{
					this.loadingText = data.info;
					this.$root.LOADING = false;  //loading显示
					if(nstate==8){
						this.$root.tabs[3].dpageInfo = 0
					}else if(nstate==10){
						this.$root.tabs[4].dpageInfo = 0
					}
					else if(nstate==9){
						this.$root.tabs[5].dpageInfo = 0
					}
					this.$root.tabs[3].dpageInfo = data.pageInfo.totalCount1.toString();
					this.$root.tabs[4].dpageInfo = data.pageInfo.totalCount3.toString();
					this.$root.tabs[5].dpageInfo = data.pageInfo.totalCount2.toString();
					$(".swiper-slide-active .listbox").addClass('noData');
					if(this.dlists.length == 0){
						this.interval = setTimeout(() => {
							li.attr('data-load','0');
							this.getdata(1)
						}, 1000);
					}
				}

			});
		},
		//跳转url
		toUrl:function(){
			var el = event.currentTarget;
			var etarget = event.target;
			if(etarget != $(el).find('button.cancel_order')[0] && etarget!= $(el).find('button.sure_order')[0] && etarget != $(el).find('a.tel')[0] && etarget != $(el).find('a.rider_tel')[0]){
				var url = $(el).attr('data-url');
				window.location = url;
			}
		},

		//跳转导航
		daohang:function(lng,lat,person,address){
		  if (device.indexOf('huoniao_Android') > -1 || device.indexOf('huoniao_iOS') > -1) {
			setupWebViewJavascriptBridge(function(bridge) {
				 bridge.callHandler("skipAppDaohang", {
					"lat": lat,
					"lng": lng,
					"addrTitle": person,
					"addrDetail": address
				}, function(responseData) {});
			})
		  }
		  
		},
		tomap:function(data){
			  var datainof = {};
			  datainof.lnglat = data.lng+','+data.lat;  //顾客位置
			  datainof.qslnglat = data.peisonglng+','+data.peisonglat;  //骑手位置
			  datainof.slnglat = data.coordY+','+data.coordX;  //骑手位置
			  datainof.address = data.address; //地址
			  datainof.juliuser = data.juliuser; //距离
			  datainof.tel = data.tel; //电话
			  datainof.username = data.username;  //顾客姓名
			  datainof.merchant_deliver = data.merchant_deliver; //商家配送			 
			  location.href = 'waimaiOrderMap.php?datainfo='+JSON.stringify(datainof);
		},


		checkOffTime(obj){
			let isOff = false;
			if(obj.reservesongdate){
				let getTime = obj.reservesongdate + obj.delivery_time * 60
				let now = parseInt(new Date().getTime() / 1000)
				isOff = getTime < now
			}else{
				isOff = obj.paydiff > obj.delivery_time
			}
			return isOff
		},


		getOffTime(obj){
			let offTime = 0;
			if(obj.reservesongdate){
				let getTime = obj.reservesongdate + obj.delivery_time * 60
				let now = parseInt(new Date().getTime() / 1000)
				offTime = parseInt((now - getTime) / 60)
			}else{
				offTime = Math.abs(parseInt( obj.paydiff - obj.delivery_time))
			}

			return offTime
		},

		reciveTime(obj){
			let offTime = 0;
			if(obj.reservesongdate){
				let getTime = obj.reservesongdate + obj.delivery_time * 60
				let now = parseInt(new Date().getTime() / 1000)
				offTime = parseInt(Math.abs(now - getTime) / 60)
				if(offTime > 60){
					let hour = parseInt(offTime / 60),min = parseInt(offTime % 60)
					if (new Date(getTime * 1000).toDateString() === new Date().toDateString()) {
						offTime = hour + '小时' + min + '分钟'
					}else{
						offTime = this.transTimes(getTime,3)
					}
				}else{
					offTime = offTime + '分钟内'
				}
			}else{
				offTime = Math.abs(parseInt( obj.paydiff - obj.delivery_time)) + '分钟内'
			}

			return offTime
		},

		transTimes: function(timestamp, n){

			const dateFormatter = huoniao.dateFormatter(timestamp);
			const year = dateFormatter.year;
			const month = dateFormatter.month;
			const day = dateFormatter.day;
			const hour = dateFormatter.hour;
			const minute = dateFormatter.minute;
			const second = dateFormatter.second;
	
			if(n == 1){
				return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
			}else if(n == 2){
				return (year+'-'+month+'-'+day);
			}else if(n == 3){
				let curr_year = new Date().getFullYear();
				if(curr_year == year){
					return (month+'-'+day+' '+hour+':'+minute);
				}else{
					return (year+'-'+month+'-'+day+' '+hour+':'+minute);
				}
			}else if(n == 4){
				return dateFormatter;
			}else if(n == 5){
				return year+'年'+month+'月'+day + '日' + ' ' +hour+'点'+minute + '分' ;
			}else{
				return 0;
			}
		},

	},

	activated:function(){
		this.dlists = this.$root.tabs[this.$root.currOn-1]['dlists'];
		// console.log(this.dlists)
		var tt = this;
		if(this.dlists.length==0 && !dragTimer){
			this.getdata();
		}
		window.onscroll = function(){
			//变量scrollTop是滚动条滚动时，距离顶部的距离
			var scrollTop = document.documentElement.scrollTop||document.body.scrollTop;
			//变量windowHeight是可视区的高度
			var windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
			//变量scrollHeight是滚动条的总高度
			var scrollHeight = document.documentElement.scrollHeight||document.body.scrollHeight;
			//滚动条到底部的条件
			if(((scrollTop+windowHeight+80)>=scrollHeight) ){
				tt.getdata();
			 }
		}
		var dragTimer = null;
		$('body').off('touchmove');
		new DragLoading($('.rloading'), {
			onReload: function () {
				var self = this;
				clearTimeout(dragTimer);
				dragTimer = setTimeout(function () {
					var li = $(".tab_box li.on_chose");
					var page =  li.attr('data-page',1); // 页数
					var load =  li.attr('data-load',0); // 是否加载
					tt.$root.tabs[tt.$root.currOn-1]['dlists'] = [];//清空数组
					tt.dlists= [];
					tt.getdata();
					self.origin();
				}, 500 * Math.random());
			}
		});

	},

	template:`
	<div class="listbox" :data-s="$root.currState">
		<ul class="fn-clear"  >
			<li  v-for="(list,k,index) in dlists" :data-key="k" v-if="(list.mealtime=='0' && $root.currState=='3,4') || $root.currState!='3,4'" :class="['order_li',{'ziti_order':list.selftime!='0'},{'shopin_order':list.desk!='0'},{'chaoshi_order':checkOffTime(list) && list.ordertype!=1}]" :data-id="list.id" @click="toUrl" :data-url="'waimaiOrderDetail.php?id='+list.id">
			 <!-- 超时订单 chaoshi_order      自提订单 --ziti_order ,{'chaoshi_order':list.paydiff>0}       -->
			 	<div v-if="list.reservesongdate && now < list.reservesongdate" class="preOrder_lab">预订</div>
				<div class="orderhd" :data-state="list.state">
					<div class="ohleft">
						<div class="order_num" v-if="list.ordertype=='0'"># <span class="onum">{{list.ordernumstore|subStrOrder}}</span></div>
						<div class="order_num" v-else>桌号<span class="onum">{{list.desk}}</span></div>
						<p v-if="checkOffTime(list) && list.ordertype!=1 && list.selftime=='0'">`+langData['waimai'][11][5]+` <span>{{getOffTime(list)}}`+langData['waimai'][2][11]+`</span></p>
						<p v-else-if="list.ordertype!='0'"><span>{{list.paydate|getTime}}</span> `+langData['waimai'][11][6]+`</p>
						<p v-else-if="list.selftime!='0'"><span>{{list.selftime|getTime}}</span> `+langData['waimai'][11][7]+`</p>
						<p v-else="list.selftime!='0'"><span> {{reciveTime(list)}} </span>`+langData['waimai'][10][13]+`</p><!-- 分钟内 送达 -->
					</div>
					<div class="ohright" v-if="list.state=='2'">`+langData['waimai'][7][111]+`</div> <!-- 待商家接单 -->

					<div class="ohright" v-else-if="list.state=='3' && list.peisongid=='0'  && list.merchant_deliver!='1' && list.selftime=='0'">`+langData['waimai'][11][8]+`</div>  <!-- 派单中 -->
					<div class="ohright" v-else-if="list.state=='3' &&  list.selftime!='0'">`+langData['waimai'][11][9]+`</div> <!-- 待出餐 -->
					<div class="ohright" v-else-if="list.state=='4' && list.peisongid!='0' && ($root.currState!='8' && $root.currState!='10') ">`+langData['waimai'][11][10]+`</div><!-- 骑手已接单-待取餐 -->
					<div class="ohright" v-else-if="list.state=='3' && list.peisongid=='0' && list.merchant_deliver=='1'">`+langData['waimai'][11][11]+`</div><!-- 等待送达 -->
					<div class="ohright" v-if="list.state=='5'  && list.merchant_deliver=='0'">`+langData['waimai'][11][12]+`</div><!-- 骑手派送中 -->
				</div>
				<div  class="customer_info ww" v-if="list.ordertype=='0'" >
					<div class="customer_detail">
						<div class="customer_left">
							<h3>{{list.person}}<span>`+langData['waimai'][11][13]+`{{list.tel|subStr}}</span></h3><!-- 尾号 -->
							<p v-if="list.address!=' '" class="address">{{list.address}}</p>
							<p class="juli" v-if="device && list.juliuser!='' && list.merchant_deliver=='1' && list.lng && list.lng!='null' && list.lat && list.lat!='null' " :data-lng="list.lng" :data-lat="list.lat" @click.stop="tomap(list)">{{list.juliuser}}</p>
						</div>
						<div class="customer_right">
							<!--商家自配才有顾客定位 -->
							<a v-if="list.merchant_deliver=='1'  && list.lng && list.lng!='null' && list.lat && list.lat!='null'" href="javascript:;" class="customer_posi" :data-lng="list.lng" :data-lat="list.lat" @click.stop="tomap(list)"></a>
							<a class=" tel" :href="'tel:'+list.tel" ></a >
						</div>
					</div>
					<div class="customer_tab"><span v-if="list.first ==1">`+langData['waimai'][11][14]+`</span><span v-if="list.level">{{list.level}}</span></div>
				</div>
				<div class="rider_info" v-if="list.peisongid && list.peisongid!='0' && list.merchant_deliver!='1'">
					<div class="rider_detail">
						<div class="rider_left">
							<h3>骑手 - {{list.peisongname}}</h3><span style="display: none;">火鸟专送</span>
						</div>
						<div class="rider_right">
							<a href="javascript:;"  class="rider_posi" @click.stop="tomap(list)"></a>
							<a :href="'tel:'+list.peisongtel" class="rider_tel"></a>
						</div>
					</div>
					<p>{{list.songdate}} `+langData['waimai'][7][114]+`</p>  <!-- 骑手已接单 -->
				</div>
				<div class="pro_info">
					<dl class="prolist">
						<dt>{{list.foodcount}}`+langData['waimai'][11][16]+`</dt>  <!--  件商品  -->
						<dd v-for="food in list.food" class="pro_dd">
							<div class="pro_name">{{food.title}}{{food.ntitle}}</div>
							<div class="pro_num"><em :class="[{more:food.count>1}]">x{{food.count}}</em></div>
							<div class="pro_amount">`+echoCurrency('symbol')+`{{food.price|fixTo}}</div>
						</dd>

					</dl>
					<div class="prolist_count">
						<span class="label">`+langData['waimai'][11][17]+`</span><!-- 收入预估  -->
						<span class="all_count">`+echoCurrency('symbol')+`<b>{{list.business|fixTo}}</b></span>
					</div>
					<!-- 未接单 2  s -->
					
					<div class="btns_group" v-if="list.state=='2'" :style="list.reservesongdate && now < list.reservesongdate ? 'margin-top:.2rem;' : ''">
						<span  v-if="list.state=='2' && list.receivingdate && list.reservesongdate && now < list.reservesongdate" class="preOrder_tip" id="preOrder_tip"> {{transTimes(list.receivingdate,5)}}可接单</span>
						<button type="button" class="cancel_order"  @click="$root.cancel_order = !$root.cancel_order, $root.cancelId = list.id ">`+langData['waimai'][11][18]+`</button>  <!-- 取消单  -->
						<button type="button" class="sure_order" @click.stop="$root.oporder" data-type="jiedan">
							`+langData['waimai'][10][90]+`
						</button>	<!-- 接单  -->
					</div>
					<!-- 未接单e -->

					<!-- 待出餐  3   s -->
					<div class="btns_group" v-if="(list.state=='3' || list.state=='4') && list.mealtime=='0' && list.merchant_deliver!='1' &&  list.selftime=='0' && list.ordertype =='0'">
						<button type="button" class="chucan" data-type="mealtime" @click.stop="$root.oporder">`+langData['waimai'][11][19]+`</button><!-- 确认已出餐  -->
					</div>
					<!-- 待出餐e -->
					<!-- 待出餐 商家自配s -->
					<div class="btns_group" v-if="(list.state=='3' && list.merchant_deliver =='1' && list.peisongid=='0' &&  list.selftime=='0' && list.ordertype =='0') ">
						<button type="button" class="peisong" data-type="songda" @click.stop="$root.oporder">`+langData['waimai'][10][22]+`</button><!-- 确认送达 -->
					</div>
					<!-- 待出餐 商家自配e -->
					<!---->
					<div class="btns_group" v-if="list.state=='3'  && (list.selftime!='0'|| list.ordertype !='0')">
						<button type="button" class="peisong" data-type="songda" @click.stop="$root.oporder">`+langData['waimai'][11][19]+`</button>
					</div>
					
				</div>

			</li>
		</ul>

		<!-- 以下为已经出餐的 -->
		<div v-if="$root.currState=='3,4' && dlists.length>0  " class="chucan_list" >
			<div class="chucan_tip" v-if="count!=0" >以下订单已自检出餐完毕</div>
			<ul>
			<li v-for="list in dlists" v-if="(list.mealtime!='0' && $root.currState=='3,4' && list.selftime == '0' && list.desk == '0') "  :class="['order_li',{'ziti_order':list.selftime!='0'},{'shopin_order':list.desk!='0'},{'chaoshi_order':checkOffTime(list) && list.ordertype!=1}]" :data-id="list.id" @click="toUrl" :data-url="'waimaiOrderDetail.php?id='+list.id">
				 <!-- 超时订单 chaoshi_order      自提订单 --ziti_order-->
					<div class="orderhd">
						<div class="ohleft">
							<div class="order_num" v-if="list.ordertype=='0'"># <span class="onum">{{list.ordernumstore|subStrOrder}}</span></div>
							<div class="order_num" v-else>桌号<span class="onum">{{list.desk}}</span></div>
							<p v-if="checkOffTime(list) && list.ordertype!=1 && list.selftime=='0'">`+langData['waimai'][11][5]+` <span>{{getOffTime(list)}}`+langData['waimai'][2][11]+`</span></p>
							<p v-else-if="list.ordertype!='0'"><span>{{list.paydate|getTime}}</span> `+langData['waimai'][11][6]+`</p>
							<p v-else-if="list.selftime!='0'"><span>{{list.selftime|getTime}}</span> `+langData['waimai'][11][7]+`</p>
							<p v-else="list.selftime!='0'"><span> {{reciveTime(list)}} </span>`+langData['waimai'][10][13]+`</p><!-- 分钟内 送达 -->
							<!--  <p v-if="list.ordertype!='0'"><span>{{list.paydate|getTime}}</span> 店内点餐</p>
							<p v-else-if="list.selftime!='0'"><span>{{list.selftime|getTime}}</span> 顾客自取</p>
							<p v-else-if=" list.paydiff<list.delivery_time"><span> {{reciveTime(list)}} </span>送达</p>
							<p v-else-if="list.paydiff>list.delivery_time && list.selftime=='0'">已超时 <span>{{getOffTime(list)}}分钟</span></p>-->
						</div>
						<div class="ohright" v-if="list.state=='2'">待商家接单</div>
						<div class="ohright" v-else-if="list.state=='3'">派单中</div>
					</div>
					<div  class="customer_info">
						<div class="customer_detail">
							<div class="customer_left">
								<h3>{{list.person}}<span>尾号{{list.tel|subStr}}</span></h3>
								<p v-if="list.address!=' '" class="address">{{list.address}}</p>
								<p class="juli" v-if="device && list.juliuser!='' && list.merchant_deliver=='1' && list.lng && list.lng!='null' && list.lat && list.lat!='null' " :data-lng="list.lng" :data-lat="list.lat" @click.stop="tomap(list)">{{list.juliuser}}</p>
							</div>
							<div class="customer_right">
								<a v-if="list.merchant_deliver=='1' && list.lng && list.lng!='null' && list.lat && list.lat!='null' " href="javascript:;" class="customer_posi" :data-lng="list.lng" :data-lat="list.lat" @click.stop="tomap(list)"></a>
								<a class=" tel" :href="'tel:'+list.tel"></a >
							</div>
						</div>
						<div class="customer_tab"><span v-if="list.collect">收藏门店</span><span v-if="list.first == 1">门店新客</span><span v-if="list.level">{{list.level}}</span></div>
					</div>
					<div class="rider_info" v-if="list.peisongid && list.peisongid!='0' ">
						<div class="rider_detail">
							<div class="rider_left">
								<h3>骑手 - {{list.peisongname}}</h3><span style="display: none;">火鸟专送</span>
							</div>
							<div class="rider_right">
								<a href="javascript:;"    class="rider_posi" @click.stop="tomap(list)"></a>
								<a :href="'tel:'+list.peisongtel" class="rider_tel"></a>
							</div>
						</div>
						<p>{{list.songdate}} `+langData['waimai'][7][114]+`</p>  <!-- 骑手已接单 -->
					</div>
					<div class="pro_info">
						<dl class="prolist">
							<dt>{{list.foodcount}}`+langData['waimai'][11][16]+`</dt>
							<dd v-for="food in list.food" class="pro_dd">
								<div class="pro_name">{{food.title}}{{food.ntitle}}</div>
								<div class="pro_num"><em :class="[{more:food.count>1}]">x{{food.count}}</em></div>
								<div class="pro_amount">`+echoCurrency('symbol')+`{{food.price|fixTo}}</div>
							</dd>

						</dl>
						<div class="prolist_count">
							<span class="label">收入预估</span>
							<span class="all_count">`+echoCurrency('symbol')+`<b>{{list.business|fixTo}}</b></span>
						</div>

					</div>

				</li>
			</ul>
		</div>
		<div class="loading_tip" :data-state="$root.currState">{{loadingText}}</div>
	</div>
	`,
};


// 历史订单

var history_li = {
	data:function(){
		return {
			loading_tip:'加载中~',
			page:1,
			load:0,
			hlists:[],
			count:[]
		}
	},
	mounted(){
		this.gethistory();
		var tt = this;
		window.onscroll = function(){
			//变量scrollTop是滚动条滚动时，距离顶部的距离
			var scrollTop = document.documentElement.scrollTop||document.body.scrollTop;
			//变量windowHeight是可视区的高度
			var windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
			//变量scrollHeight是滚动条的总高度
			var scrollHeight = document.documentElement.scrollHeight||document.body.scrollHeight;
			//滚动条到底部的条件
			
			if(((scrollTop+windowHeight+80)>=scrollHeight) && !tt.load ){
				tt.gethistory();
			 }
		}

		var dragTimer = null;
		new DragLoading($('.rloading'), {
			onReload: function () {
				var self = this;
				clearTimeout(dragTimer);
				tt.$root.order_num = ''
				dragTimer = setTimeout(function () {
					tt.page = 1;
					tt.load = 0;
					tt.hlists = [];
					loading_tip = ''
					tt.gethistory();
					self.origin();
				}, 500 * Math.random());
			}
		});
	},
	computed:{
		allCount:function(){
			console.log(this.count)
			var sum = 0;
			for(var i=0; i<this.count.length; i++){
				sum += this.count[i]
			}
			this.count = [];

			return sum;
		}
	},
	methods:{
		gethistory(){
			if(this.load) return false;
			this.load = true;
			this.$root.LOADING = true;  //loading显示
			var dataSearch = '';
			if(this.$root.order_num!=''){
				dataSearch = "ordernum="+this.$root.order_num
			}
			axios({
				method: 'post',
				url: '?action=getList&state=1,7&p='+this.page,
				data:dataSearch,
			})
			.then((response)=>{
				var data = response.data
				if(data.state == 100){
					this.hlists = this.hlists.concat(data.info.list);
					this.page++;
					var tt = this
					setTimeout(function(){
						console.log(tt.load);
						tt.load = false;
					},500)

					this.loading_tip = '加载更多~'
					if(this.page > data.info.pageInfo.totalPage){
						this.load = 1;
						this.loading_tip = '没有更多了~'
					}
					this.$root.LOADING = false;  //loading显示
				}else{
					this.loading_tip = data.info;
					this.load = 0;
					this.$root.LOADING = false;  //loading显示
				}

			})
		},
		toUrl:function(){
			var el = event.currentTarget;
			var target = event.target;
			if(target != $(el).find(".qishou_tel")[0] && target != $(el).find(".custom_tel")[0]){
				var url = $(el).attr('data-url');
				window.location = url;
			}
		}
	},
	template:`
	<div class="historyList">
		<div class="rloading">`+langData['waimai'][11][0]+`</div>  <!-- 下拉刷新 -->
		<div class="historyLi" v-for="h in hlists" @click="toUrl" :data-url="'waimaiOrderDetail.php?id='+h.id">
			<div class="hli_head">
				<div class="lh">`+langData['waimai'][11][26]+` <em>{{h.ordernumstore}}</em></div><!-- 订单号 -->
				<!-- rhcolor 是异常的订单-->
				<div class="rh rhcolor" v-if="h.refrundstate=='1'">`+langData['waimai'][11][27]+`</div><!-- 已退款 -->
				<div class="rh rhcolor" v-else-if="h.state=='7'">`+langData['waimai'][1][219]+`</div><!-- 已取消 -->
				<div class="rh" v-else>`+langData['waimai'][11][29]+`</div>	<!-- 已完成 -->
			</div>
			<ul :class="['flist',{'one_li':h.food.length==1}]" >
				<li class="fli" v-for="(f,index) in h.food" :data-id="f.id">
					<div v-show="false">{{count[index] = f.count}}</div>
					<div class="fimg"><img :src="h.foodpiclist[index].picpath" onerror="javascript:this.src=\''+templets+'images/food.png\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>
					<h5>{{f.title}}</h5>
				</li>
			</ul>

			<div :class="['fcount',{'one_food':h.food.length==1}]">
				<h3 class="amount">`+echoCurrency('symbol')+`<em>{{h.amount}}</em></h3>
				<p>共{{h.foodcount}}件</p>
			</div>
			<div class="telgroups">
				<a v-if="h.peisongtel" :href="'tel:'+h.peisongtel" class="qishou_tel">`+langData['waimai'][11][30]+`</a><!-- 联系骑手 -->
				<a v-if="h.tel" :href="'tel:'+h.tel" class="custom_tel">`+langData['waimai'][11][31]+`</a><!-- 联系买家 -->
			</div>
		</div>
		<div class="loading_tip">{{loading_tip}}</div>
	</div>
	`
}



 new Vue({
	 el:'#page',
	 data:{
		 currOn:1,
		 currState:2,
		 cancelId:'',
		 tabs:[
			 {'typeid':1,'name':'新订单','page':1,'isload':0,'state':'2','dlists':[],'dpageInfo':''},   //新订单
			 {'typeid':2,'name':'待出餐','page':1,'isload':0,'state':'3,4','dlists':[],'dpageInfo':''},   //待出餐
			 {'typeid':6,'name':'配送中','page':1,'isload':0,'state':'4,5','dlists':[],'dpageInfo':''},   //配送中
			 {'typeid':3,'name':'自取','page':1,'isload':0,'state':'8','dlists':[],'dpageInfo':'0'},   //自取餐
			 {'typeid':4,'name':'店内','page':1,'isload':0,'state':'10','dlists':[],'dpageInfo':'0'},   //店内单
			 {'typeid':5,'name':'异常','page':1,'isload':0,'state':'9','dlists':[],'dpageInfo':'0'},   //配送异常

		 ],
		 merchant_deliver:'0',
		 currList:[],
		 LOADING:false,
		 bottomtab:bottom_tab,  //底部tab
		 currbTab:'order',  //当前底部
		 cancel_order:0,      //确认取消订单
		 history:orderState,  //是否为历史订单
		 order_num:''
	 },
	 mounted() {
	 	// 头部的on_chose
		if(orderState != 1){
			this.changeBottom();
		}

		// swiper
		siwper = new Swiper('.swiper-container', {
			on: {
			    slideChangeTransitionStart: function(){
			      //你的事件
				  $(".tab_box li").eq(this.activeIndex).off('click').click();
				  state =  $(".tab_box li").eq(this.activeIndex).attr("data-state");
				  $.cookie(cookiePre + 'wmsj_orderstate', this.activeIndex);
				  var gurl = pageUrl+state+'&currentPageOpen=1';
				  window.history.pushState({}, 0, gurl);
			    },
			  },
		});

		
	 },
	 components:{
		 'list-li':list_li,
		 'history-li':history_li,
	 },
	 methods:{
		 // 点击tab
		 changeTab:function(){
			 var tt = this;
			 clearTimeout(this.interval)
			 var el = event.currentTarget;
			 tt.currOn = $(el).attr('data-typeid');
			 tt.currState = $(el).attr('data-state');
			 siwper.slideTo($(el).index())
		 },
		 changeBottom:function(){
			 var left = $(".tab_box li[data-typeid='"+this.currOn+"']").offset().left+($(".tab_box li[data-typeid='"+this.currOn+"']").width()-$(".tab_box li[data-typeid='"+this.currOn+"']").find('span:not(.red)').width())/2;
			  $(".tab_box em").css('left',left)
		 },
		 oporder:function(){
			var tt = this;
		 	var el = event.currentTarget;
		 	var type = $(el).attr('data-type')
		 	let param = new URLSearchParams();
			var id = $(el).closest('li.order_li').attr('data-id');
			if(tt.LOADING) return false;
			tt.LOADING = true;

			if(type=="jiedan"){
				param.append('action', 'confirm');
			}else if(type=="cancel"){
				var note = $("#note").val();
				if(note==''){
					showErr(langData['waimai'][11][20]);   //'请输入失败原因'
					return false;
				}
				id = $(el).attr('data-id')
				param.append('action', 'failed');
				param.append('note', note);
			}else if(type=='songda'){
				param.append('action', 'ok');
			}else if(type == "mealtime"){
				param.append('action', 'mealtime');
			}
		 	param.append('id', id);


		 	axios({
		 		method: 'post',
		 		url: 'waimaiOrder.php',
		 		data: param,
		 	})
		 	.then((response)=>{
		 		var data = response.data;
				if(data.state==100){
					tt.LOADING = false;
					showErr(data.info);//操作成功
					if(type=='cancel'){
						this.cancel_order = 0;
					}
					var li = $(".tab_box li.on_chose");
					var page =  li.attr('data-page',1); // 页数
					var load =  li.attr('data-load',0); // 是否加载
					tt.tabs[tt.currOn-1]['dlists'] = [];//清空数组
					tt.$refs.orderlist[0].dlists= [];
					tt.$refs.orderlist[0].getdata()
				}else{
					tt.LOADING = false;
					showErr(data.info)
				}
		 	})

		 },
		 searchOrder:function(){
			 var el = event.currentTarget;
			 var code = event.keyCode;
			 if(code==13){
				 this.order_num = $(el).val();
				 this.$refs.history.loading_tip = langData['waimai'][10][23];  //加载更多
				 this.$refs.history.page = 1;
				 this.$refs.history.load = 0;
				 this.$refs.history.hlists = [];
				 this.$refs.history.count = [];
				 this.$refs.history.gethistory();
			 }
		 },
	 },
	 watch:{
		 currOn:function(){
			 this.changeBottom()
		 }
	 }
 });


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
