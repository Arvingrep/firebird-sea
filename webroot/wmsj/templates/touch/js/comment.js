
// 评论列表组件
Vue.component('comt-ul',{
	// props:['list'],
	data:function(){
		return {
			dlists:'',
			prarms:{"time":"","score":""},
			page:1,
			load:0,
			loadingText:langData['waimai'][10][23],  //加载更多
			
		}
		
	},
	template:`
	<ul class="cmt_ul">
		<li v-for="dlist in dlists" class="cmt_li fn-clear">
			<div class="cmtuser">
				<div class="cmt_detai">
					<div class="l_himg"><img v-bind:src="dlist.photo"></div>
					<div class="r_info">
						<h4>{{(dlist.username!='' && dlist.isanony=='0')?dlist.username:'`+langData['waimai'][11][222]+`'}}</h4>
						<p>{{dlist.pubdatef}}</p>
					</div>
				</div>
				<div class="rating-wrapper">
					<div class="rating-gray"><svg><use xmlns:xlink="http://www.w3.org/1999/xlink"xlink:href="#star-gray.cc081b9"></use></svg></div>
				    <div class="rating-actived" :style="'width:'+dlist.star*20+'%'"><svg><use xmlns:xlink="http://www.w3.org/1999/xlink"xlink:href="#star-actived.d4c54d1"></use></svg></div>
				</div>
			</div>
			<div v-if="dlist.pspag" class="cmt_tag">
				<span v-for="tag in dlist.pspag.split(',')">{{tag}}</span>
			</div>
			<div class="cmt_con">
				<!-- 暂无评论 -->
				<h3>{{dlist.content==''?'`+langData['waimai'][2][100]+`':dlist.content}}</h3>
				<div v-if="dlist.picsf && dlist.picsf.length>0" class="imgList fn-clear">
					<div v-for="img in dlist.picsf" class="img"><img v-bind:src="img"></div>
				</div>
			</div>
			<!-- 回复顾客 -->
			<a v-if="(dlist.reply=='' || dlist.reply==null) && dlist.replydate=='0'" href="javascript:;" class="btn_reply" @click="$root.reply_order = !$root.reply_order, $root.replyId = dlist.id ">`+langData['waimai'][11][217]+`</a>
			<!-- 商家回复 -->
			<dl v-else class="reply_con">
				<dt>`+langData['waimai'][11][221]+`</dt>
				<dd>{{dlist.reply}}</dd>
			</dl>
		</li>
		<div class="loading_text">{{loadingText}}</div>
	</ul>
	`,
	
	
	mounted() {
		
		var tt = this;
		tt.getlists();
		window.onscroll = function(){
			//变量scrollTop是滚动条滚动时，距离顶部的距离
			var scrollTop = document.documentElement.scrollTop||document.body.scrollTop;
			//变量windowHeight是可视区的高度
			var windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
			//变量scrollHeight是滚动条的总高度
			var scrollHeight = document.documentElement.scrollHeight||document.body.scrollHeight;
		    //滚动条到底部的条件
				  
			if((scrollTop+windowHeight==scrollHeight) && !tt.$parent.load){
				//写后台加载数据的函数
				tt.getlists();
			 }   
			 
			 if($('.tabbox').offset().top-20<=scrollTop){
				 tt.$root.scrollTop = true;
			 }else{
				  tt.$root.scrollTop = false;
			 }
		}
	},
	methods:{
		
		getlists:function(){
			var tt = this;
			var pagenow = tt.page;
			isload = tt.load;
			if(isload) return false;
			tt.load  = false;
			this.$root.LOADING = true;
			var time = tt.$root.datetime;
			var  starpstype = $(".tabbox .score_tab .score_li.on_score").attr('data-starpstype');

			axios({
				method: 'post',
				url: '?action=getList&sid='+shopid+'&pageSize=10&p='+pagenow,
				data:'starpstype='+starpstype+'&datetime='+time
			})
			.then((response)=>{
				var data = response.data;
				var lists 		= data.info.list;
				var pageInfo 	= data.info.pageInfo;
				var html = [];
				if(data.state==100){
					tt.$root.totalCount=pageInfo.totalCount;
					tt.$root.totalCount0=pageInfo.totalCount0;
					tt.$root.totalCount1=pageInfo.totalCount1;
					tt.$root.totalCount2=pageInfo.totalCount2;
					tt.$root.totalCount3=pageInfo.totalCount3;
					tt.$root.totalCount4=pageInfo.totalCount4;
					tt.$root.totalCount5=pageInfo.totalCount5;

					
					if(pagenow==1){
						tt.dlists = lists
					}else{
						tt.dlists = tt.dlists.concat(lists);
					}
					
					pagenow++;
					isload = 0;
					tt.loadingText =   langData['waimai'][10][23] //'下拉加载更多~';
					if(pagenow>data.info.pageInfo.totalPage){
						isload = 1;
						tt.loadingText = langData['waimai'][10][24]   ;//'没有更多了~'
					}
					tt.page = pagenow
					tt.load = isload
					
					tt.$root.LOADING = false;
				}else{
					tt.dlists = [];
					isload = 0;
					tt.load = isload;
					tt.loadingText = data.info;
					tt.$root.LOADING = false;
					if(!tt.$root.timeChange){
						tt.$root.totalCount  = 0;
						tt.$root.totalCount0 = 0;
						tt.$root.totalCount1 = 0;
						tt.$root.totalCount2 = 0;
						tt.$root.totalCount3 = 0;
						tt.$root.totalCount4 = 0;
						tt.$root.totalCount5 = 0;
						
					}
					
				}
				
				tt.$root.timeChange = 1;
			});
		},
		
	}
})







// 创建实例
new Vue({
	el:'#page',
	data:{
	    page:1,
		change:1,
		LOADING:false,
		datetime:new Date().getFullYear()+'/'+(new Date().getMonth()+1),
		starpstype:'1',
		changeShop:false, //更换店铺
		slists:[], //店铺数据,
		shopScore:shopScore,  //店铺分数
		scrollTop:false,  //是否显示头部筛选
		showOption:false,
		reply_order:false,
		replyId:0,
		totalCount:0,
		totalCount0:0,
		totalCount1:0,
		totalCount2:0,
		totalCount3:0,
		totalCount4:0,
		totalCount5:0,
		time: (new Date().getFullYear()+'/'+(new Date().getMonth()+1)),
		bottomtab:bottom_tab,
		currbTab:'comment',
		timeChange:1,
	},
	
	
	
	mounted(){
		var format = 'yy/mm';
		var tt = this;
		if(moduleList.indexOf('shop')==-1){
			$(".tab_top .tab li[data-action=shop]").remove()
		}
		if(moduleList.indexOf('waimai')==-1){
			$(".tab_top .tab li[data-action=waimai],.tab_top .tab li[data-type=paotui]").remove();
		}
		mobiscroll.settings = {
		    theme: 'ios',
		    themeVariant: 'light',
			lang:'zh',
			height:40,
			min:new Date('2010/09/09'),
			max:new Date(),
			dateFormat: 'yy/mm',
			headText:false,
			buttons:[
				'cancel',
				 {
					text:  langData['waimai'][10][38],   //'按月选择',
					icon: 'checkmark',
					cssClass: 'my-btn', 
					handler: function (event, inst) {
						
						if(format=='yy/mm'){
							format = 'yy';
							$(this).text(langData['waimai'][10][39]);//'按nian选择',
							$(".mbsc-sc-whl-w.mbsc-dt-whl-m").hide();
							$(".mbsc-sc-whl-w").css('width','100%')
						}else{
							format = 'yy/mm'
							$(this).text(langData['waimai'][10][38]);
							$(".mbsc-sc-whl-w.mbsc-dt-whl-m").show();
							$(".mbsc-sc-whl-w").css('width','50%')
						}
					}
				},
				
				{
					text: langData['waimai'][10][40],  //完成
					handler:'set'
				},
			]
		};
		
		mobiscroll.date('.inp_text', {
		    display: 'bottom',
			touchUi: false,
			onBeforeShow: function (event, inst) {
			   format = 'yy/mm';	
			},
			onSet: function (event, inst) {
				var val = event.valueText;
				if(format=='yy/mm'){
					$(".inp_text,.select_date").text(val);
					$("#time").val(val);
					tt.datetime = val;  //修改时间
				}else{
					val = val.split('/')[0]
					$(".inp_text,.select_date").text(val);
					$("#time").val(val);
					tt.datetime = val;  //修改时间
				}

				tt.change = !tt.change;
				tt.timeChange = 0;
			}
		});
		
	},
	methods:{
		changetype:function(){
			 var el = event.currentTarget;
			 this.curTab = $(el).attr('data-action');
			 if(!$(el).hasClass("on_chose")){
				 $(el).addClass('on_chose').siblings('li').removeClass('on_chose');
				 var index = $(el).index();
				 var left = $(el).position().left
				 $(".tag").css("left",left)
			 }
		},
		changeTime:function(){
			var el = event.currentTarget;
			this.time = $(el).val();
		},
		shaixuan:function(){
			var el = event.currentTarget;
			this.change = !this.change;
			$(".score_tab li").removeClass('on_score');
			$(".OptionBox .score_tab li").eq($(el).index()).addClass('on_score');
			$(".tabbox .score_tab li").eq($(el).index()).addClass('on_score');
			$(".select_option").text($(el).text().split('(')[0]);
			// $(el).toggleClass("on_score").siblings('li').removeClass('on_score');
			var score =[]
			$('.score_tab li.on_score').each(function(){
				var li = $(this);
				score.push(li.attr('data-score'));
			});
			this.starpstype = score.join(',')
		},
		callShop:function(){
			if($(".shop_list li").length==0){
				this.getshopList()
			}else{
				this.changeShop = !this.changeShop;
			}
		},
		getshopList:function(){
			var tt = this;
			if(tt.slist_load) return false;
			tt.LOADING = true;
			tt.slist_load = 1;
			axios({
				method: 'post',
				url: '../index.php?action=shopList&u=1&page=1&pageSize=1000',
			})
			.then((response)=>{
				var data = response.data;
				if(data.state==100){
					if(data.info.pageInfo.totalCount==2){
						var lists = data.info.list;
						lists.forEach(function(val){
							if(shopid != val.id){
								window.location = 'waimaiCommon.php?sid='+val.id+'&currentPageOpen=1';
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
					tt.slists = [];
					showErr(data.info)
				}
				tt.LOADING = false;
			})
		},
		trggle_date:function(){
			$(".chose_time .inp_text").click();
		},
		oporder:function(){
			var tt = this;
			var el = event.currentTarget;
			if($(el).hasClass('disabled')) return false;
			tt.LOADING = true;
			$(el).addClass('disabled');
			var val = $("#note").val();
			if(val == ''){
				showErr(langData['waimai'][11][216]);  //请输入回复内容
				$(el).removeClass('disabled');
				return false;
			}
			var data = [];
			data.push('id='+this.replyId);
			data.push('content='+val);
			axios({
				method: 'post',
				url: 'waimaiCommonReply.php?action=reply',
				data:data.join('&')
			})
			.then((response)=>{
				var data = response.data;
				if(data.state == 100){
					tt.reply_order = !tt.reply_order;
					tt.$refs.databox.page = 1;
					tt.$refs.databox.load = 0
					tt.$refs.databox.getlists();
				}
				tt.LOADING = false;
				$(el).removeClass('disabled');
				showErr(data.info);
			})
		},
		
	},
	watch:{
		change:function(){
			this.$refs.databox.page = 1;
			this.$refs.databox.load = 0
			this.$refs.databox.getlists();
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