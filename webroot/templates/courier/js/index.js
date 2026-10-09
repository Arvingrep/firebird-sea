
const vm = new Vue;
var alertmodel = {
	props:['msg','tit','btn'],
	template:`
	<div class="alertbox">
		<div :class="['alert_con',{'more_h':$root.ifinp}]">
			<h3 v-html="tit" v-if="tit"></h3>
			<p :class="$root.alerttip">{{msg}}</p>
			<div class="inpbox" v-if="$root.ifinp"><input id="code" placeholder="输入收货码" type="text"></div>
		</div>
		<div class="btns"><button v-for="b in btn" type="button" :data-type="b.type" :data-id="$root.optionId" :class="b.type" @click="btn_click" :data-state="b.state">{{b.cn}}</button></div>
	</div>
	`,
	created(){
	},

	methods:{
		btn_click:function(){
			var el = event.currentTarget;
			var type = $(el).attr('data-type');
			if(type=="sure"){
				if($("#code").val()==''){
					showErr('请输入收货码');
					return false;
				}
				vm.$emit('test',$("#code").val())

			}else if(type="reset" || type=='cancel'){
				this.$root.mash_show = !this.$root.mash_show ;
			}
		}
	}
}


Vue.component('qiangdan-box',{
	data:function(){
		return{
			dlists:'',
			page:1,
			loadfinished:false,
			load_on:false,
			loadingText:langData['waimai'][10][7],  //加载更多
			interval:null,
		}
	},

	template:`<ul class="fn-clear qiangdan" >
		<li v-for="dlist in dlists" v-bind:data-id="dlist.id" @click="toUrl" v-bind:data-ordertype="dlist.cattype" class="add_li">
			<!-- 此处bsong是跑腿类型 帮送 bsong和帮买 bbuy 商城是bshop-->
			<div :class="['order_head',{bsong: dlist.cattype== 'paotui' && dlist.type!=1},{bbuy: dlist.cattype== 'paotui' && dlist.type==1},{bshop: dlist.cattype == 'shop'}]">
				<div class="order_info">
				  <!-- 新的 -->
				  <div class="inComeBox" v-if="$root.curTab == 3">
						<div class="base_income">	`+echoCurrency('symbol')+`<b>{{parseFloat(dlist.courier_get)}}</b></div>
						<div class="addition" v-if="dlist.additionprice != 0">+`+echoCurrency('symbol')+`<b>{{parseFloat(dlist.additionprice)}}</b></div>
					</div>

					<span class="order_num" v-if="$root.curTab != 3 && dlist.cattype!='waimai'">#<em>{{dlist.ordernum}}</em></span>
					 <span class="order_num" v-if="$root.curTab != 3 && dlist.cattype=='waimai'">#<em>{{dlist.ordernumstore|getsubStr}}</em></span>
					<!-- 帮送、帮买、商城才有 -->
					<span class="order_tip" v-if='dlist.cattype == "paotui" && dlist.type==2'><i>`+langData['waimai'][10][8]+`</i> <p v-if="dlist.tip!=0" style="display:inline-block;">`+langData['waimai'][10][11]+echoCurrency('symbol')+`{{dlist.tip}}</p></span>
					<span class="order_tip" v-if='dlist.cattype == "paotui" && dlist.type==1'><i>`+langData['waimai'][10][9]+`</i><em class="btip"  v-if='dlist.price != ""'>`+langData['waimai'][10][10]+`<b>{{dlist.price}}</b>`+echoCurrency('short')+`</em><p v-if="dlist.tip!=0" style="display:inline-block;">`+langData['waimai'][10][11]+echoCurrency('symbol')+`{{dlist.tip}}</p></span>
					<span class="order_tip" v-if='dlist.cattype == "shop" '><i>商城</i></span>
				</div>

				<div class="orderPs">
					<div class="order_time" v-if="dlist.cattype =='waimai' && dlist.delivery_time">
					<em>{{dlist.delivery_time}}`+langData['waimai'][10][12]+`</em> `+langData['waimai'][10][13]+`
					</div>
                    <div class="order_time" v-if="dlist.cattype =='paotui' && dlist.totime">
					<em v-if="dlist.totime.indexOf('-') > -1" style="color: #ff0000;">{{dlist.totime}}</em><em v-else>{{dlist.totime}}</em> <span v-if='dlist.type == "1" || dlist.state == "5"'>`+langData['waimai'][10][13]+`</span><span v-if='dlist.type == "2" && dlist.state != "5"'>`+langData['waimai'][10][19]+`</span>
					</div>
					<div class="order_time" v-if="dlist.cattype =='shop' && dlist.totime">
					<em>{{dlist.totime}}`+langData['waimai'][10][12]+`</em> `+langData['waimai'][10][13]+`
					</div>
					<div class="base_income" v-if="$root.curTab != 3">`+echoCurrency('symbol')+`<b>{{dlist.courier_get}}</b></div>
				</div>
			</div>
			<div class="addTip" v-if="dlist.additionprice != 0 && dlist.needfenzhong">
				<span>加成奖励</span>
				<div class="addDetail"><span><b>{{dlist.needfenzhong}}分钟内</b>送达 额外奖励</span> <span class="count">`+echoCurrency('symbol')+`<b>{{dlist.additionprice}}</b><span>	</div>
			</div>
			<div class="order_detail">
				<div class="order_start info_box fn-clear" v-bind:data-lng="dlist.coordY" v-bind:data-lat="dlist.coordX">
					<div class="left_info" >
						<!-- 此处需判断订单类型 -->
						<h4>`+langData['waimai'][10][14]+`</h4>
						<p v-if="dlist.juliShop">{{dlist.juliShop|juli}}</p>
					</div>
					<div class="right_detail">
						<p class="shop_name">{{dlist.shopname}}</p>
						<h3 class="shop_detail">{{dlist.address1}}</h3>
					</div>
				</div>
				<div class="order_end info_box  fn-clear" v-bind:data-lng="dlist.lng" v-bind:data-lat="dlist.lat">
					<div class="left_info">
						<h4>`+langData['waimai'][10][15]+`</h4>
						<p v-if="dlist.juliPerson">{{dlist.juliPerson|juli}}</p>
					</div>
					<div class="right_detail">
						<p class="shop_name">{{dlist.person}}  {{dlist.tel}}</p>
						<h3 class="shop_detail">{{dlist.address}}</h3>
					</div>

				</div>
				<!-- 有备注的情况下 -->
				<p class="order_remarks" v-if="dlist.cattype!= 'shop' && (dlist.note)">`+langData['waimai'][10][16]+`：{{dlist.note}}</p>
				<p class="order_remarks" v-if="dlist.cattype== 'shop' && dlist.weight">`+langData['waimai'][10][17]+`{{dlist.weight}}kg{{dlist.note}}</p>
			</div>
			<div class="btn_box" v-if="dlist.state==3">
				<button class="qiang_btn" @click.stop="qiandan" v-bind:data-id="dlist.id" v-bind:data-ordertype="dlist.cattype">抢单</button>
			</div>
			<div class="btn_box" v-else-if="dlist.state==4">
				<a v-if="dlist.phone" v-bind:href="'tel:'+dlist.phone" class="tel_btn" >`+langData['waimai'][10][19]+`</a>

				<button :class="['qu_btn',{'big_btn':dlist.phone==''}]" v-bind:data-id="dlist.id" @click.stop="changestate">`+langData['waimai'][10][20]+`<div class="qucan_tip" v-if="dlist.mealtime !=''&&dlist.mealtime !=0">已出餐，请尽快取餐</div></button>
			</div>
			<div class="btn_box" v-else-if="dlist.state==5">
				<a v-bind:href="'tel:'+dlist.tel" class="tel_btn">`+langData['waimai'][10][21]+`</a><button class="qu_btn" :data-state="dlist.state" :data-type="dlist.cattype" :data-pt="dlist.type" v-bind:data-id="dlist.id" @click.stop="changestate">`+langData['waimai'][10][22]+`<div class="chaoshi_tip" v-if="dlist.overtime&&dlist.overtime !=''">即将超时，请尽快配送</div></button>
			</div>
		</li>
		<div class="loading_text">{{loadingText}}</div>
	</ul>

	`,
	beforeDestroy() {
     vm.$off('test')
    },
	filters:{
		getsubStr(str){  //截取订单号
			var substr = str.split('-')[1];
			return substr
		},
		juli:function(juli){
			juli = juli>1000?((juli/1000).toFixed(1)+'km'):(parseInt(juli)+'m');
			return juli
		}
	},

	methods:{
		getdata:function(reload,loadState){
			clearTimeout(this.interval)
			if(this.load_on) return false;
			this.load_on = true;  //防止多次加载
			if(!reload){
				this.$root.LOADING = true;  //loading显示
				this.loadingText = '';
			}
			
			if(cstate == 0){
				this.loadingText = langData['waimai'][4][1]; //'您已经停工，好好休息一下吧';
				this.dlists = [];
				this.$root.LOADING = false;  //loading显示
				return false;
			}
			let currState = this.$root.curTab
			if(loadState && loadState != currState) return false; //重新加载数据时 已变更tab 则不需要加载
			axios({
				method: 'post',
				url: '/include/ajax.php?service=waimai&action=courierOrderList&page='+this.page+'&pageSize=20&state='+this.$root.curTab,
			})
			.then((response)=>{
				var data = response.data;
				var npage = this.page;
				if(data.state==100 && data.info.list.length>0){
					if(npage==1){
						this.dlists = data.info.list;
					}else{
						this.dlists = this.dlists.concat(data.info.list);
					}
					npage = npage + 1;
					this.page = npage;
					this.load_on = false;
					this.loadingText = langData['waimai'][10][23];  //'下拉加载更多~'
					if(this.page > data.info.pageInfo.totalPage){
						this.load_on = true;
						this.loadingText =   langData['waimai'][10][24]; //'没有更多了~'
					}
					this.$root.LOADING = false;//loading隐藏
				}else{
					this.$root.LOADING = false;
					this.loadingText = data.info || '暂无数据';
					if(this.$root.curTab == 3 && customIsopenqd=='0' && this.$root.firstShow){
						this.$root.curTab = 4;
						this.$root.firstShow = 0;
					}else{
						if(this.dlists.length == 0){
							this.interval = setTimeout(() => {
								this.load_on = false; 
								console.log('重新加载数据')
								this.getdata(1,currState)
							},1000)
						}
					}
				}

				$(".reload").removeClass("rotate")
			});
		},
		qiandan:function(e){
			var tt = this
			var el =  event.currentTarget;
			$(el).attr('disabled',true);
			var id = $(el).attr('data-id');
			var ordertype =  $(el).attr('data-ordertype');
			tt.$root.LOADING = true;  //loading显示
			axios({
				method: 'get',
				url: '/include/ajax.php?service=waimai&action=qiangdan&id='+id+'&ordertype='+ordertype,
			})
			.then((response)=>{
				var data = response.data;
				if(data.state==100){
					showErr(data.info);
					tt.$root.LOADING = false;  //loading显示
					setTimeout(function(){
						$(".reload").click()
					},1500);
				}else{
					showErr(data.info);
					tt.$root.LOADING = false;  //loading显示
				}
				$(el).removeAttr('disabled');
			});
		},
		
		changestate:function(code){
			var tt = this;
			// tt.$root.getLoaction();
			var el =  event.currentTarget;
			var id = $(el).attr('data-id');
			var li = $(el).closest('li');
			var ordertype = li.attr('data-ordertype');
			if(typeof(code)!='undefined' && typeof(code)!='object'){

			}
			var state = 1;
			if(this.$root.curTab==4){
				state = 5
			}else if(this.$root.curTab==5){
				state = 1;
			}
			var tt = this;
			this.$root.optionId = id
			if(ordertype=='paotui' && this.$root.curTab==5){
				var ttype  = $(el).attr('data-pt');
				this.$root.mash_show = true;
				if(ttype == '1' || (customIsopencode!='1' &&  ttype == '2' )){
					tt.$root.alertit = '请先确保买家已将货款结清</br>再确认送达';
					tt.$root.alertmsg = '';
					tt.$root.ifinp = false;
					tt.$root.alerttip = ''
					tt.$root.btns=[{'type':'reset','state':0,'cn':langData['waimai'][2][43]},{'type':'sure','state':'1','cn':'确认送达'}];
				}else{
					tt.$root.alertit='';
					tt.$root.alertmsg = '请向收货人索要收货码以确认送达';
					tt.$root.ifinp = true;
					tt.$root.alerttip = 'showtip'
					tt.$root.btns=[{'type':'reset','state':0,'cn':langData['waimai'][2][43]},{'type':'sure','state':'1','cn':'确认送达'}];
				}
				return false;
			}
			ordertype = ordertype?ordertype:'paotui';
			$(el).attr('disabled',true);
			tt.$root.LOADING = true;  //loading显示
			// alert(JSON.stringify(tt.$root.ps_lnglat));
			axios({
				method: 'post',
				url: '/include/ajax.php?service=waimai&action=peisong&id='+id+'&courier='+JSON.stringify(tt.$root.ps_lnglat)+'&ordertype='+ordertype+'&state='+state+'&paotuicode='+(typeof(code)=='string'?code:''),
				// data:param
			})
			.then((response)=>{
				var data = response.data;
				tt.$root.LOADING = false;  //loading显示
				if(data.state==100){
					showErr(data.info)
					setTimeout(function(){
						$(".reload").click();
						tt.$root.mash_show = false;
					},1500);
				}else{
					var popOptions = {
						btnCancel:'我知道了',
				      	title:data.info,
				      	btnCancelColor:'#FFAE00',
				      	noSure:true,
				      	isShow:true
				    }
					confirmPop(popOptions);
				}
				$(el).removeAttr('disabled');
			});
		},
		toUrl:function(){
			var el =  event.currentTarget;
			 $(el).attr('disabled',true);
			var id = $(el).attr('data-id');
			var li = $(el).closest('li');
			var ordertype = li.attr('data-ordertype');
			var tt = this;
			if(this.$root.curTab!='3'){
				window.location = '/index.php?service=waimai&do=courier&template=detail&id='+id+'&ordertype='+ordertype;
			}

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

			if(((scrollTop+windowHeight+150)>=scrollHeight) && !tt.load_on){
				//写后台加载数据的函数
				tt.getdata();
			 }
		};
		vm.$on('test',function(data){
			tt.changestate(data)
		})

	},


});

// 底部
// var bottombox = {
// 	data:function(){
// 		return {
// 			tabs:[
// 				{'name':'map','cn':'地图'},
// 				{'name':'reload','cn':'刷新'},
// 				{'name':'tongji','cn':'统计'},

// 			],
// 		}
// 	},
// 	template:`
// 		<div class="bottom_box">
// 			<ul class="btm_ul">
// 				<li v-for="tab in tabs" v-bind:class="tab.name" @click="reload(tab.name)">
// 					<div class="icon"><img v-bind:src="'`+templets_skin+`images/'+tab.name+'.png'" ></div>
// 					<p>{{tab.cn}}</p>
// 				</li>
// 			</ul>
// 		</div>
// 	`,
// 	methods:{
// 		reload:function(tab){
// 			var el = event.currentTarget;
// 			if($(el).hasClass("rotate")) return false;
// 			$(el).addClass("rotate");
// 			this.$emit("myFun",'哈哈哈')
// 		}
// 	}
// };




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
			this.$refs.qdan.$data.loadingText = langData['waimai'][10][23];     //'加载更多';
			this.$refs.qdan.getdata();
		}
	}
 });
Vue.component("tab-4", {
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
			this.$refs.qdan.$data.loadingText='加载更多';
			this.$refs.qdan.getdata();
		}
	}
});
Vue.component("tab-5", {
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
			this.$refs.qdan.$data.loadingText= langData['waimai'][10][23];   //'加载更多';
			this.$refs.qdan.getdata();
		}
	}
});











clickable = false;  //防止多次点击点击
var pageVue = new Vue({
	el: "#page",
	data:{
		courier_state:courier_state,
		ucenter:false,  //是否打开个人中心
		curTab:'3',
		LOADING:false,
		tabs:[
			{'action':'1','state':'3','cn':langData['waimai'][10][18],'en':'qd'},          //   抢单
			{'action':'1','state':'4','cn':langData['waimai'][10][25],'en':'qh'},  //   待取货
			{'action':'1','state':'5','cn':langData['waimai'][10][26],'en':'ps'},  // 配送中
		],
		btabs:[
			{'name':'map','cn':langData['waimai'][10][27]},   //地图
			{'name':'reload','cn':langData['waimai'][10][28]},   //刷新
			{'name':'tongji','cn':langData['waimai'][10][29]},   //统计
		],
		firstShow:1,
		mash_show:false,
		alertit:'',
		alertmsg:'',
		alerttip:'',
		btns:'',
		optionId:'',
		ifinp:'',
		ps_lnglat:{'lng':'','lat':''},
		is_leave:is_leave, //是否离职
	},

	computed: {
	    currentTabComponent: function() {
	      return "tab-" + this.curTab;
	    },
	},
	components:{
		'alert-model':alertmodel,
	},
	mounted(){
		var tt = this;
		tt.getLoaction();
		setInterval(function(){
			tt.getLoaction()
		},5000)

		 //原生APP后退回来刷新页面
	    pageBack = function(data) {
	        setupWebViewJavascriptBridge(function(bridge) {
	        	$('.reload').click();
	        });
	    }

	    var index = tt.curTab - 3;
		var left = $(".tab_li li").eq(index).offset().left;
		var width = $(".tab_li li").eq(index).width();
		$(".tab_li s").css("left",(left+width/2)+'px');
 
     $(".tab_li li").click(function(){
        var t = $(this)
        $(this).addClass("on_chose").siblings('li').removeClass('on_chose')
        var left = t.offset().left;
        var width = t.width();
        $(".tab_li s").css("left",(left+width/2)+'px');
     })


		$(".urlbox li").click(function(){
			setTimeout(function(){
				tt.ucenter = false;
			},50)
		})

		
	},
	watch:{
		curTab(val){
			var index = val - 3;
			var left = $(".tab_li li").eq(index).offset().left;
      setTimeout(function(){
			 var width = $(".tab_li li").eq(index).width();

			 $(".tab_li s").css("left",(left+width/2)+'px');
       console.log(left,width,index)
      },310)
		}
	},
	methods:{
		// 获取定位
		getLoaction:function(){
			var tt = this;
			setupWebViewJavascriptBridge(function(bridge) {
			    bridge.callHandler("getGeocoder", {}, function(responseData){
					var data = JSON.parse(responseData)
					tt.ps_lnglat = {'lng':data.lng,'lat':data.lat};
					// alert(JSON.stringify(tt.ps_lnglat))

			    });
			});
		},
		kaigong:function(){
			if(clickable) return false;
			clickable = true;
			let param = new URLSearchParams();
			param.append('state', !courier_state?1:0)

            //调用APP方法，用于获取经纬度权限
            setupWebViewJavascriptBridge(function(bridge) {
			    bridge.callHandler("startWork", {}, function(responseData){
					
			    });
			});

			axios({
				method: 'post',
				url: '/include/ajax.php?service=waimai&action=updateCourierState',
				data: param,
			})
			.then((response)=>{
				var data = response.data;
				if(data.state!=100){
					showErr(data.info)
				}else{
					this.courier_state = !courier_state;
					courier_state = !courier_state
					// console.log(response)
					// setupWebViewJavascriptBridge(function(bridge) {
					// 	var deviceUserAgent = navigator.userAgent;
					// 	if(deviceUserAgent.indexOf('huoniao') > -1) {
					// 		bridge.callHandler("pageReload", {}, function(responseData){});
					// 	}
					// })
					window.location.href = "/?service=waimai&do=courier&template=index&currentPageOpen=1"

				}
				setTimeout(function(){
					clickable = false;
				},500)
			});
		},
		reloadpage:function(name){

			if(name=='reload'){
				var el = event.currentTarget;
				if($(el).hasClass("rotate")) return false;
				$(el).addClass("rotate");
        $(window).scrollTop(0);
        this.$refs.databox.reloadDate();
			}else{
				if(name=='map' && cstate ==0) {
					showErr(langData['waimai'][4][1]);//您已经停工
					return false
				};
				var url = name=='tongji'?"statistics":"map";
				window.location = '?service=waimai&do=courier&template='+url+'&currentPageOpen=1';
			}

		},
		tiaozhuan:function(){
			window.location='/?service=waimai&do=courier&template=setting';
		},
		logout:function(){
			var tt = this;
			tt.LOADING = true;
			event.preventDefault();

			var channelDomainClean = typeof masterDomain != 'undefined' ? masterDomain.replace("http://", "").replace("https://", "") : window.location.host;
    		var channelDomain_1 = channelDomainClean.split('.');
    		var channelDomain_1_ = channelDomainClean.replace(channelDomain_1[0]+".", "");

    		channelDomain_ = channelDomainClean.split("/")[0];
    		channelDomain_1_ = channelDomain_1_.split("/")[0];

    		$.cookie('HN_login_user', null, {expires: 7, domain: channelDomainClean, path: '/'});
    		$.cookie('HN_login_user', null, {expires: 7, domain: channelDomain_, path: '/'});
    		$.cookie('HN_login_user', null, {expires: 7, domain: channelDomain_1_, path: '/'});

    		var device = navigator.userAgent.toLowerCase();
    		if(device.indexOf('huoniao') > -1){
              	if(device.indexOf('android') > -1){
                	$('body').append('<iframe src="'+masterDomain+'/logout.html?from=app" style="display: none;"></iframe>');
                }
                setTimeout(function(){
                    setupWebViewJavascriptBridge(function(bridge) {
                      tt.LOADING = false;
                      bridge.callHandler('appLogout', {}, function(){});
                      bridge.callHandler("goToIndex", {}, function(responseData){});

    				});
                }, 1000);
    		}
    		setTimeout(function(){
				location.href = '/?service=waimai&do=courier&template=logout';
			}, 2000);

// 			$('body').append('<iframe src="'+masterDomain+'/logout.html?from=app" style="display: none;"></iframe>');
// 			setTimeout(function(){
// 				setupWebViewJavascriptBridge(function(bridge) {
// 				  bridge.callHandler('appLogout', {}, function(){});
// 				});
// 			}, 1500);
// 			setTimeout(function(){
// 				location.href = '/?service=waimai&do=courier&template=logout';
// 			}, 2000);
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
