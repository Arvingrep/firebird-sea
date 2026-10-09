
	
	
	 
	 
	 new Vue({
	 	el:'#page',
	 	data:{
	 		datemax:new Date().getFullYear()+'/'+(new Date().getMonth()+1)+'/'+new Date().getDate(),
			LOADING:false,
			bottomtab:bottom_tab,  //底部tab
			currbTab:'member',  //当前底部
	 	},
	 	created(){
	 		
	 	},
		
	 	mounted(){
	 		mobiscroll.settings = {
	 		    theme: 'ios',
	 		    themeVariant: 'light',
				height:40
	 		};
	 		var  today = new Date(new Date().setDate(new Date().getDate()));
	 		var range = mobiscroll.range('#stime', {
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
					});
					$(".shai_box").submit();
				},
				
	 		});
	 		
	 	},
	 	methods:{
	 		urlTo:function(){
	 			var el  = event.currentTarget;
	 			var url = $(el).attr('data-url');
				var name = $(el).attr('data-name');
				if(kaigong == '0' && name=='map') return false;
	 			location.href = url;
	 		},
			
	 	}
	 	
	 });
	 
	