new Vue({
	el: "#page",
	data:{
		datetime:new Date().getFullYear()+'/'+(new Date().getMonth()+1),
		bottomtab:bottom_tab,
		currbTab:'member',
		LOADING:false,
	},
	mounted(){
		var format = 'yy/mm';
		var tt = this;
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

		mobiscroll.date('.chose_time', {
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

				tt.updateData(val)

			},
		});
	},
	methods:{

		urlTo:function(){
			var el = event.currentTarget;
			var url = $(el).attr('data-url');
			var name = $(el).attr('data-name');
			if(kaigong == '0' && name=='map') return false;
			if(name==this.curBtab) return false;
			location.href = url;
		},
		updateData:function(val){
			var url = $(".link_to").attr('href');
			var beginDate = this.formDate(new Date(val));
			var endDate = this.formDate(new Date(val.split('/')[0],val.split('/')[1],0),1);
			var that = this;
			$("#endDate").val(endDate);
			$("#beginDate").val(beginDate)
			that.LOADING = true;
			axios({
				method: 'post',
				url: '',
				data:"datatime="+val+"&gettype=ajax",
			})
			.then((response)=>{
				var data = response.data;
				// 此处需处理数据
				$(".historyBox .success h5").text(data.info.list.totalSuccessall);
				$(".historyBox .allamount h5").text(data.info.list.totalAmountall);
				$(".historyBox .fcamount h5").text(data.info.list.businessall);
				$(".historyBox .online h5").text(data.info.list.onlineall);
				$(".historyBox .daohuo h5").text(data.info.list.totaldeliveryall);
				$(".historyBox .ziqu h5").text(data.info.list.totalselfall);
				$(".historyBox .fail h5").text(data.info.list.totalFailedall);
				that.LOADING = false;



			})
		},
		formDate:function(val,end){
			var date =new Date()
			var yy = val.getFullYear();
			var mm = val.getMonth()+1;
			var dd = val.getDate();

			if(date.getFullYear()==yy && date.getMonth()==(mm-1) && end){
				dd = date.getDate();
			}
			mm = mm>9?mm:'0'+mm;
			dd = dd>9?dd:'0'+dd;

			return (yy+'-'+mm+'-'+dd)
		}

	}



})
