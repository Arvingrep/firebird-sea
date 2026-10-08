
	
	
	 
	 
	 new Vue({
	 	el:'#page',
	 	data:{
	 		btabs:[
	 			{'name':'map','cn':langData['waimai'][10][27],'url':'/?service=waimai&do=courier&template=map&currentPageOpen=1'},   //'地图'
	 			{'name':'order','cn':langData['waimai'][2][54],'url':'/?service=waimai&do=courier&template=index&currentPageOpen=1'},    //'订单'
	 			{'name':'tongji_1','cn':langData['waimai'][10][29],'url':'/?service=waimai&do=courier&template=statistics&currentPageOpen=1'},  //'统计'
	 		],  //底部
			waimaiarr:'',
			paotuiarr:'',
			shoparr:'',
			LOADING:false,
	 	},
	 	created(){
	 		
	 	},
	 	mounted(){
	 		
	 		mobiscroll.settings = {
	 		    theme: 'ios',
	 		    themeVariant: 'light',
				height:40
	 		};
	 		
	 		mobiscroll.range('#stime', {
	 		    controls: ['date'],
	 		    min: new Date('2000/09/09'),
				max: new Date(),
				headerText:true,
				calendarText:langData['waimai'][10][71],  //时间区间选择
				lang:'zh',
	 		    endInput: '#etime',
	 		    dateFormat: 'yy-mm-dd',
				 onSet: function (event, inst) {
					$(".timebox").each(function(){
						var tt = $(this),inp= tt.find('input');
						tt.find('b').text(inp.val())
					})
				 }
	 		});
	 		this.research();
	 		
	 	},
	 	methods:{
	 		urlTo:function(){
	 			var el  = event.currentTarget;
	 			var url = $(el).attr('data-url');
				var name = $(el).attr('data-name');
				if(kaigong == '0' && name=='map') {
					showErr(langData['waimai'][4][1]);//您已经停工
					return false
				};
	 			location.href = url;
	 		},
			research:function(){
				var tt  = this;
				tt.LOADING = true;
				var stime = $("#stime").val()
				var etime = $("#etime").val()
				axios({
					method: 'post',
					url: '/include/ajax.php?service=waimai&action=statisticsHistory&stime='+stime+'&etime='+etime,
				})
				.then((response)=>{
					var data = response.data;
					tt.LOADING = false;
					if(data.state==100){
						tt.waimaiarr = data.info.waimaiarr;
						tt.paotuiarr = data.info.paotuiarr;
						tt.shoparr 	 = data.info.shoparr;
					}else{
						tt.alertit=data.info;
						tt.mash_show = true;
					}
				});
			},
			tipshow:function(){
				var el = event.currentTarget;
				$('span.tip').hide();
				$(el).next('span.tip').show();
				$('body').one('click',function(){
					$('span.tip').hide();
				})
				event.stopPropagation()
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