
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
		<li v-for="dlist in dlists" class="cmt_li ">
			<div class="cmtuser">
				<div class="cmt_detai">
					<div class="l_himg"><img v-bind:src="dlist.photo"></div>
					<div class="r_info">
						<h4>{{dlist.user}}</h4>
						<p>{{dlist.pubdatef}}</p>
					</div>
				</div>
				<div class="rating-wrapper">
					<div class="rating-gray"><svg><use xmlns:xlink="http://www.w3.org/1999/xlink"xlink:href="#star-gray.cc081b9"></use></svg></div>
				    <div class="rating-actived" :style="'width:'+dlist.starps*20+'%'"><svg><use xmlns:xlink="http://www.w3.org/1999/xlink"xlink:href="#star-actived.d4c54d1"></use></svg></div>
				</div>
			</div>
			<div v-if="dlist.pspag" class="cmt_tag">
				<span v-for="tag in dlist.pspag.split(',')">{{tag}}</span>
			</div>
			<div class="cmt_con">
				<h3>{{dlist.contentps}}</h3>
				<div v-if="dlist.pics && dlist.pics.length>0" class="imgList fn-clear">
					<div v-for="img in dlist.pics" class="img"><img v-bind:src="img"></div>
				</div>
			</div>
		</li>
		<div class="loading_text">{{loadingText}}</div>
	</ul>
	`,
	
	
	mounted() {
		
		var tt = this;
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
			axios({
				method: 'post',
				url: '/include/ajax.php?service=waimai&action=common&page='+pagenow+'&pageSize=5&datetime='+tt.$root.datetime+'&starpstype='+tt.$root.starpstype+'&commtype='+tt.$root.curTab,
			})
			.then((response)=>{
				var data = response.data;
				var lists 		= data.info.list;
				var pageInfo 	= data.info.pageInfo;
				var html = [];
				if(data.state==100){

					tt.$root.score1 =  pageInfo.totalCount1;
					tt.$root.score2 =  pageInfo.totalCount2;
					tt.$root.score3 =  pageInfo.totalCount3;
					tt.$root.score4 =  pageInfo.totalCount4;
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
					// $(".tab .on_chose").attr('data-page',pagenow)
					// $(".tab .on_chose").attr('data-load',isload)
					tt.$root.LOADING = false;
				}else{
					isload = 0;
					tt.$root.score1 = 0;
					tt.$root.score2 = 0;
					tt.$root.score3 = 0;
					tt.$root.score4 = 0;
					// $(".tab .on_chose").attr('data-load',isload)
					tt.load = isload;
					tt.loadingText = '暂无评论哦';
					tt.$root.LOADING = false;
					tt.$root.Nodata = true;
				}
				
				
			});
		},
		
	}
})

// 外卖组件
Vue.component("tab-waimai", {
	data:function(){
		return{
			page:1,
			load:0,
			dlist:'',
		}
	},
	template:`<comt-ul ref="cmtlist" :list="dlist"></comt-ul>`,
	mounted(){
		this.$refs.cmtlist.getlists();
	}
	
});

// 跑腿组件
Vue.component("tab-paotui", {
	data:function(){
		return{
			page:1,
			load:0,
			dlist:'',
		}
	},
	template:`<comt-ul ref="cmtlist" :list="dlist"></comt-ul>`,
	mounted(){
		this.$refs.cmtlist.getlists();
	}
});

// 商城评论组件
Vue.component("tab-shop", {
	data:function(){
		return{
			page:1,
			load:0,
			dlist:'',
		}
	},
	template:`<comt-ul ref="cmtlist" :list="dlist"></comt-ul>`,
	mounted(){
		this.$refs.cmtlist.getlists();
	},
	
})



// 创建实例
new Vue({
	el:'#page',
	data:{
	    page:1,
		change:1,
		curTab:'waimai',
		LOADING:false,
		tabs:[{'cn':langData['waimai'][1][262],'en':'waimai'},{'cn':langData['waimai'][2][53],'en':'paotui'},{'cn':langData['waimai'][10][37],'en':'shop'}],  //外卖 跑腿 商城
		datetime:new Date().getFullYear()+'/'+(new Date().getMonth()+1),
		starpstype:'',
		score1:0,
		score2:0,
		score3:0,
		score4:0,
		Nodata:false,
	},
	
	computed: {
	    currentTabComponent: function() {
	      return "tab-" + this.curTab;
	    }
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
			// width:150,
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
					$(".inp_text").text(val);
					$("#time").val(val);
					tt.datetime = val;  //修改时间
				}else{
					val = val.split('/')[0]
					$(".inp_text").text(val);
					$("#time").val(val);
					tt.datetime = val;  //修改时间
				}

				tt.change = !tt.change;
			}
		});
		
		// this.getComment();
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
		shaixuan:function(){
			var el = event.currentTarget;
			this.change = !this.change;
			$(el).toggleClass("on_score").siblings('li').removeClass('on_score');
			var score =[]
			$('.score_tab li.on_score').each(function(){
				var li = $(this);
				score.push(li.attr('data-score'));
			});
			this.starpstype = score.join(',')
		}
		
	},
	watch:{
		change:function(){
			// 重置
			var score = []
			$('.score_tab .on_score').each(function(){
				score.push($(this).attr('data-score')) 
			})
			this.$refs.databox.$refs.cmtlist.prarms.time = $("#time").val();
			this.$refs.databox.$refs.cmtlist.prarms.score = score.join(',');
			this.$refs.databox.$refs.cmtlist.page = 1;
			this.$refs.databox.$refs.cmtlist.load = 0;
			this.$refs.databox.$refs.cmtlist.getlists();
		}
	}
	
 });