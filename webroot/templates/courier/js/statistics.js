new Vue({
	el: "#page",
	data:{
		curBtab:"tongji_1",
		btabs:[  
			{'name':'map','cn':langData['waimai'][10][27],'url':'/?service=waimai&do=courier&template=map&currentPageOpen=1'},   //'地图'
			{'name':'order','cn':langData['waimai'][2][54],'url':'/?service=waimai&do=courier&template=index&currentPageOpen=1'},    //'订单'
			{'name':'tongji_1','cn':langData['waimai'][10][29],'url':'/?service=waimai&do=courier&template=statistics&currentPageOpen=1'},  //'统计'
		],  //底部
		
	},
	methods:{
		goHistory:function(){
			var el = event.currentTarget;
			//var type = $(el).attr('data-type');  // 类型
			var now = new Date();
			var stime = now.getFullYear() + "-" + (now.getMonth() + 1)  + "-" + now.getDate() ;
			var etime = now.getFullYear() + "-" + (now.getMonth() + 1)  + "-" + now.getDate() ;
			location.href = "/?service=waimai&do=courier&template=statisticsHistory&stime="+stime+"&etime="+etime;
		},
		urlTo:function(){
			var el = event.currentTarget;
			var url = $(el).attr('data-url');
			var name = $(el).attr('data-name');
			if(kaigong == '0' && name=='map') {
				showErr(langData['waimai'][4][1]);//您已经停工
				return false
			};
			if(name==this.curBtab) return false;
			location.href = url;
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