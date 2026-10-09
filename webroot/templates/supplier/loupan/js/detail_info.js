var ue;
function getEditor(id){
    ue = UE.getEditor(id, {toolbars: [['fullscreen', 'undo', 'redo', '|', 'fontfamily', 'fontsize', '|', 'removeformat', 'formatmatch', 'autotypeset', '|', 'forecolor', 'bold', 'italic', 'underline', '|', 'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'simpleupload', '|', 'insertimage', '|', 'insertorderedlist', 'insertunorderedlist', '|', 'link', 'unlink']], initialStyle:'p{line-height:1.5em; font-size:13px; font-family:microsoft yahei;}'});
    ue.on("focus", function() {ue.container.style.borderColor = "#999"});
    ue.on("blur", function() {ue.container.style.borderColor = ""})
}

getEditor("note");

var page = new Vue({
	el:'#page',
	data:{
		navList:navList,
		currid:2,
		hoverid:'',
		buildtypelist:buildtypenames,  //建筑类型
		buildtype:[],
		peitaoList:peitaoList.length>0?peitaoList:[[],[]], //配套信息
		buildtypeTxt:buildtypeTxt,
		loading:false,
	},
	mounted:function() {
		var tt = this;
		console.log(tt.buildtype,buildtype)
		$('.data_inp input').focus(function(){
			var id = $(this).attr('data-id')
			tt.selectDate(id);
		})

	},
	methods:{
		// 显示切换账户
		show_change:function(){
			$(".change_account").show()
		},

		// 隐藏切换账户
		hide_change:function(){
			$(".change_account").hide()
		},

		// 选择时间
		selectDate:function(el){
			console.log(el)
			WdatePicker({
				el: el,
				isShowClear: false,
				isShowOK: false,
				isShowToday: false,
				qsEnabled: false,
				dateFmt: 'HH:mm',
			});
		},
		// checkBox
		checkIn:function(item){
			const tt = this
			const el = event.currentTarget;

			if($(el).hasClass('check')){
				tt.buildtype.splice(tt.buildtype.indexOf(item),1)
			}else{
				tt.buildtype.push(item)
			}
			console.log(tt.buildtypeTxt,tt.buildtype)
			tt.buildtypeTxt = tt.buildtype.join(' ')
		},

		// 新增配套
		add_peitao:function(){
			var tt = this;
			var stop = false;
			tt.peitaoList.forEach(function(val,i){
				if(val[0]==''){
					alert('请完善已有配套的名称');
					stop = true;
					return false
				}else if(val[1]==''){
					alert('请完善已有配套的内容');
					stop = true;
					return false
				}
			});
			if(stop) return false;
			tt.peitaoList.push([[],[]])
		},

		// 删除配套
		del_dl:function(i){
			var tt = this;
			tt.peitaoList.splice(i,1)
		},

		// 提交
		submit:function(){
			var form = $("form");
			var stop = false;
			var tt = this;
			// var addrid = $('.addrBtn').attr('data-id')
			// $('#addrid').val(addrid);
			// var addrids = addrid.split(' ');
			// $('#cityid').val(addrids[0]);

			if($("#openStart").val()=='' || $("#openEnd").val()==''){
				alert('请选择服务时间');
				return false;
			}

			// if(tt.buildtype.length==0){
			// 	alert('请选择建筑类型');
			// 	return false;
			// }

			if($("#zhuangxiu").val()==0){
				alert('请选择装修情况');
				return false;
			}

			$(".inpbox.required").each(function(){
				var t = $(this);
				if(t.find('input').length>0 && t.find('input').val()==''){
					var tip = t.find('input').attr('placeholder');
					stop = true;
					alert(tip);
					return false;
				}
			});
			if(stop){
				return false;
			}
			if(tt.loading) return false;
			tt.loading = false;
			var time = $("#openStart").val()+'-'+$("#openEnd").val()
			axios({
				method: 'post',
				data:form.serialize() +'&worktime='+time,
				url: masterDomain + '/include/ajax.php?service=house&action=supplierLoupanEdit&loupanid='+loupanid,
			})
			.then((response)=>{
				tt.loading = true;
				var data = response.data;
				if(data.info ==100){
					alert('提交成功');
				}else{
					alert(data.info);
				}
			});

		}
	}
})
