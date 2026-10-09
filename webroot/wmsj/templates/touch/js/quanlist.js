var swiper;
new Vue({
	el:'#page',
	data:{
		tabs:[
			{'typeid':0,'name':'全部','page':1,'isload':0,'state':'','dlists':[],'dpageInfo':'',loadingTip:''},   //新订单
			{'typeid':1,'name':'领取中','page':1,'isload':0,'state':'1','dlists':[],'dpageInfo':'',loadingTip:''},   //待出餐
			{'typeid':2,'name':'已领完','page':1,'isload':0,'state':'2','dlists':[],'dpageInfo':'',loadingTip:''},   //配送中
			{'typeid':3,'name':'已结束','page':1,'isload':0,'state':'3','dlists':[],'dpageInfo':'',loadingTip:''},   //自取餐
		],
		currOn: 0,
		LOADING:false,
	},
	mounted(){
		this.changeBottom();
		this.getQuanList();
		siwper = new Swiper('.swiper-container', {
			on: {
			    slideChangeTransitionStart: function(){
			      //你的事件
				    $(".tab_box li").eq(this.activeIndex).off('click').click();
				  	state =  $(".tab_box li").eq(this.activeIndex).attr("data-state");
			    },
			  },
		});
	},
	methods:{
		changeTab:function(){
			 var tt = this;
			 var el = event.currentTarget;
			 tt.currOn = $(el).attr('data-typeid');
			 tt.currState = $(el).attr('data-state');
			 if(tt.tabs[tt.currOn].dlists && tt.tabs[tt.currOn].dlists.length == 0){
				 tt.getQuanList();
			 }
			 siwper.slideTo($(el).index())
			 tt.changeBottom()
		 },
		 changeBottom:function(){
			 var left = $(".tab_box li[data-typeid='"+this.currOn+"']").offset().left+($(".tab_box li[data-typeid='"+this.currOn+"']").width()-$(".tab_box li[data-typeid='"+this.currOn+"']").find('span:not(.red)').width())/2;
			  $(".tab_box em").css('left',left)
		 },

		getQuanList(){
			var tt = this;
			if(tt.tabs[tt.currOn].isload) return false;
			tt.LOADING = true;
			tt.tabs[tt.currOn].loadingTip = '加载中'
			tt.tabs[tt.currOn].isload = 1;
			var atpage = tt.tabs[tt.currOn].page
			var state = tt.tabs[tt.currOn].state;
			axios({
				method: 'post',
				url: '?action=quanList&page='+atpage+'&state='+state+'&shopid='+sid,
			})
			.then((response)=>{
				var data = response.data;
				if(data.state==100){
					tt.tabs[tt.currOn].dpageInfo = data.info.totalCount;
					tt.tabs[tt.currOn].dlists = data.info.list;
					tt.tabs[tt.currOn].isload = 0;
					tt.tabs[tt.currOn].page = tt.tabs[tt.currOn].page + 1;
					tt.tabs[tt.currOn].loadingTip = '下拉加载更多'
					if(tt.tabs[tt.currOn].page > data.info.pageInfo.totalPage ){
						tt.tabs[tt.currOn].loadingTip = '没有更多了'
						tt.tabs[tt.currOn].isload = 1;
					}
				}else{
					tt.tabs[tt.currOn].loadingTip = '暂无数据'
					console.log('暂无数据')
				}
				tt.LOADING = false;
			})
		},

		// 结束
		endSure(id){
			var tt = this;
			var options = {
		    // btnTrggle:'.cared',  //必须   点击显示弹窗的按钮，在页面配置
		    btnSure:'确认',   //按钮文字
		    isShow:true,
		    btnCancel:'取消',  //取消按钮的文字
		    title:'温馨提示',    // 提示标题
		    btnColor:'#FFAE00',  //确认文字按钮颜色
		    btnCancelColor:'#000',  //确认文字按钮颜色
		    confirmTip:'结束后不可继续领券，确定结束吗？',  //副标题
		    trggleType:'1',  //不填表示只有一个按钮可以触发， 1表示有多个按钮触发
		    popClass:'quanConfirm',  //弹窗类名--需特别修改时候
		  };
			confirmPop(options,function(){
				$.ajax({
		      url:'?action=end&id='+id,
		      type:"POST",
		      dataType: "json",
		      success:function (data) {
		          if(data.state ==100){
		            showErrAlert("更新成功")
								tt.tabs[tt.currOn].dlists = [];
               	tt.tabs[tt.currOn].page = 1;
               	tt.tabs[tt.currOn].isload = 0;
                tt.getQuanList();
		          }else{
		            showErrAlert("更新失败")
		          }

		      },
		      error:function () {

		      }
		    })
			})
		},

		// 删除
		delSure(id){
			console.log('111')
			var tt = this;
			var options = {
		    // btnTrggle:'.cared',  //必须   点击显示弹窗的按钮，在页面配置
		    btnSure:'确认',   //按钮文字
		    isShow:true,
		    btnCancel:'取消',  //取消按钮的文字
		    title:'温馨提示',    // 提示标题
		    btnColor:'#FFAE00',  //确认文字按钮颜色
		    btnCancelColor:'#000',  //确认文字按钮颜色
		    confirmTip:'删除后不可恢复，确定删除优惠券么？',  //副标题
		    trggleType:'1',  //不填表示只有一个按钮可以触发， 1表示有多个按钮触发
		    popClass:'',  //弹窗类名--需特别修改时候
		  };
			confirmPop(options,function(){
		    $.ajax({
		      url:'?action=del&id='+id,
		      type:"POST",
		      dataType: "json",
		      success:function (data) {
		          if(data.state ==100){
		            showErrAlert("删除成功")
								tt.tabs[tt.currOn].dlists = [];
 							  tt.tabs[tt.currOn].page = 1;
 							  tt.tabs[tt.currOn].isload = 0;
 							  tt.getQuanList();
		          }else{
		            showErrAlert("更新失败")
		          }

		      },
		      error:function () {

		      }
		    })
			})
		},
	}
  });
