
var pageVue = new Vue({
	el:'#page',
	data:{
		navList:navList,
		currid:currid,
		hoverid:'',
		salestatenames:salestatenames,  //销售状态数据
		existingnames:existingnames,  //楼盘状态数据
		protypelist:protypelist,  //物业类型数据
		salestate:salestate,   //销售状态
		existing:existing,   //楼盘状态
		protype:protype,   //物业类型
		routeArr:subwayarr,
		loading:false,
		formScheme:{
			// address:'',
			// openStart:'', //开始时间
			// openEnd:'', //结束时间
			// tel:'', //电话
			// copywriting:'', //致电文案
			// verify_capital:'', //验资情况

			// zhuangxiuval:'', //装修情况
			// decoration_price:'', //装修单价
			// planarea:'', //占地面积
			// buildarea:'',//建筑面积
			// planhouse:'', //规划户数
			// parknum:'', //车位数
			// above_parking:'', //地上车位数
			// parking_ratio:'', //车位比例
			// rongji:'', //容积率
			// green:'', //绿化率
			// green_area:'', //绿化面积
			// property:'', //物业公司
			// proprice:'', //物业费
			// heating:1, //供暖
			// water:1, //水
			// power:1, //电
			
			// feature:'', //特色
			// note:'', //楼盘简介
			// peitao:[],
			...formScheme
		},
		formbox3:{
			license_data:license_data.length > 0 ? license_data :[{
				no:'',  //许可证号
				file:'', //图片
				source:'', //图片预览
			}]
		},
		feature:[],
		peitaoList:peitaoList && peitaoList.length > 0 ?JSON.parse(JSON.stringify(peitaoList)):[], //配套信息

		license_data:license_data.length > 0 ? license_data : [{
			no:'',  //许可证号
			file:'', //图片
			source:'', //图片预览
		}],
		tabsArr:[
			{
				name:'重点资料',
			},
			{
				name:'详细信息',
			},
			{
				name:'预售许可证',
			},
		],
		tabOn:tabOn,
		rules:{
			address: [
				{ required: true, message: '请填写售楼处地址'}
			],
			openStart: [
				{ required: true, message: '请选择开始时间'}
			],
			openEnd: [
				{ required: true, message: '请选择结束时间'}
			],
			zhuangxiu: [
				{ required: true, message: '请选择装修标准'}
			],
			planarea: [
				{ required: true, message: '请填写占地面积'}
			], //占地面积
			buildarea: [
				{ required: true, message: '请填写建筑面积'}
			],//建筑面积
			planhouse: [
				{ required: true, message: '请填写规划户数'}
			], //规划户数
			above_parking: [
				{ required: true, message: '请填写地面车位'}
			],
			parknum: [
				{ required: true, message: '请填写地下车位'}
			],
			planarea: [
				{ required: true, message: '请填写占地面积'}
			],
			parking_ratio:[{ required: false, message: '请填写车位比'}], //车位比
			rongji:[{ required: false, message: '请填写容积率'}], //容积率
			green:[{ required: false, message: '请填写绿化率'}], //绿化率
			
		},
		
	},
	created() {
		var tt = this;
		if(typeof(protype) == 'string'){
			protype = protype.split(',')
			tt.protype = [];
			tt.protypelist.forEach(function(val){
				if(protype.indexOf(val.typename)>-1){
					tt.protype.push(val.id)
				}
			})
			console.log(tt.protype)
		}
	},
	mounted() {
		var tt = this;
		//开盘、交房时间
		$("#deliverdate, #opendate").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});

		
		
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

		// checkBox
		checkIn:function(id){
			const tt = this
			const el = event.currentTarget;
			if($(el).hasClass('check')){
				tt.protype.splice(tt.protype.indexOf(id),1);
			}else{
				tt.protype.push(id)
			}

		},

		 //显示选择地址页
		showChooseAddr: function(){
			var gzAddrSeladdrCurr = $(event.currentTarget)
		    var postop  = gzAddrSeladdrCurr.offset().top + gzAddrSeladdrCurr.outerHeight() - 1,
		    posleft = gzAddrSeladdrCurr.offset().left;
		     gzAddress.css({'top':postop+'px','left':posleft+'px'}).show();
		 },

		// 地图定位
		mapTo:function(){
			var tt = this;
			$.dialog({
				id: "markDitu",
				title: "标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）</small>",
				content: 'url:/api/map/mark.php?mod=house&lnglat='+$("#lnglat").val()+"&city="+mapCity+"&addr="+$("#addr").val(),
				width: 800,
				height: 500,
				max: true,
				ok: function(){
					var doc = $(window.parent.frames["markDitu"].document),
						lng = doc.find("#lng").val(),
						lat = doc.find("#lat").val(),
						addr = doc.find("#addr").val();
					$("#lnglat").val(lng+","+lat);
					// if($("#addr").val() == ""){
						$("#addr").val(addr);
					// }
					tt.regex($("#addr"));
				},
				cancel: true
			});
		},

		// 校验
		regex: function (obj) {
			var regex = obj.attr("data-regex"), tip = obj.siblings(".input-tips");
			if (regex != undefined && tip.html() != undefined) {
				var exp = new RegExp("^" + regex + "$", "img");
				if (!exp.test($.trim(obj.val()))) {
					tip.removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
					return false;
				} else {
					tip.removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
					return true;
				}
			}
		},

		// 交通
		choseRoute:function(){
			var addrids = $('.addrBtn').attr('data-ids').split(' ');
			var cityid = addrids[0];
			if(cityid == 0 || cityid == "" || cityid == undefined){
				$.dialog.alert("请先选择区域板块！");
				return false;
			}
			var el = event.currentTarget, tt = this;
			var type = $(el).prev("input").attr("id"), input = $(el).prev("input"), valArr = input.val().split(",");
			// tt.showTip("loading", "数据读取中，请稍候...");
			axios({
				method: 'post',
				url: masterDomain + '/include/ajax.php?service=siteConfig&action=subway&addrids='+addrids.join(","),
			})
			.then((response)=>{
				var data = response.data;
				if(data && data.state==100){


					var data = data.info;

					var content = [], selected = [];
					content.push('<div class="selectedTags">已选：</div>');
					content.push('<ul class="nav nav-tabs" style="margin-bottom:5px;">');
					for(var i = 0; i < data.length; i++){
						content.push('<li'+ (i == 0 ? ' class="active"' : "") +'><a href="#tab'+i+'">'+data[i].title+'</a></li>');
					}
					content.push('</ul><div class="tagsList">');
					for(var i = 0; i < data.length; i++){
						content.push('<div class="tag-list'+(i == 0 ? "" : " hide")+'" id="tab'+i+'">')
						for(var l = 0; l < data[i].lower.length; l++){
							var id = data[i].lower[l].id, name = data[i].lower[l].title;
							if($.inArray(id, valArr) > -1){
								selected.push('<span data-id="'+id+'">'+name+'<a href="javascript:;">&times;</a></span>');
							}
							content.push('<span'+($.inArray(id, valArr) > -1 ? " class='checked'" : "")+' data-id="'+id+'">'+name+'<a href="javascript:;">+</a></span>');
						}
						content.push('</div>');
					}
					content.push('</div>');

					$.dialog({
						id: "subwayInfo",
						fixed: false,
						title: "选择附近地铁站",
						content: '<div class="selectTags">'+content.join("")+'</div>',
						width: 1000,
						okVal: "确定",
						ok: function(){

							//确定选择结果
							var html = [], ids = [];
							tt.routeArr = [];
							parent.$(".selectedTags").find("span").each(function(){
								var id = $(this).attr("data-id");
								var txt = $(this).text().replace('×','');
								if(id){
									ids.push(id);
								}
								tt.routeArr.push({
									id:id,
									txt:txt
								})
							});
							input.val(ids.join(","));
							// input.before(html.replace('span','li'));

						},
						cancelVal: "关闭",
						cancel: true
					});

					var selectedObj = parent.$(".selectedTags");
					//填充已选
					selectedObj.append(selected.join(""));

					//TAB切换
					parent.$('.nav-tabs a').click(function (e) {
						e.preventDefault();
						var obj = $(this).attr("href").replace("#", "");
						if(!$(this).parent().hasClass("active")){
							$(this).parent().siblings("li").removeClass("active");
							$(this).parent().addClass("active");

							$(this).parent().parent().next(".tagsList").find("div").hide();
							parent.$("#"+obj).show();
						}
					});

					//选择标签
					parent.$(".tag-list span").click(function(){
						if(!$(this).hasClass("checked")){
							var length = selectedObj.find("span").length;
							if(type == "tags" && length >= tagsLength){
								alert("交友标签最多可选择 "+tagsLength+" 个，可在模块设置中配置！");
								return false;
							}
							if(type == "grasp" && length >= graspLength){
								alert("会的技能最多可选择 "+graspLength+" 个，可在模块设置中配置！");
								return false;
							}
							if(type == "learn" && length >= learnLength){
								alert("想学技能最多可选择 "+learnLength+" 个，可在模块设置中配置！");
								return false;
							}

							var id = $(this).attr("data-id"), name = $(this).text().replace("+", "");
							$(this).addClass("checked");
							selectedObj.append('<span data-id="'+id+'">'+name+'<a href="javascript:;">&times;</a></span>');
						}
					});

					//取消已选
					selectedObj.delegate("a", "click", function(){
						var pp = $(this).parent(), id = pp.attr("data-id");

						parent.$(".tagsList").find("span").each(function(index, element) {
							if($(this).attr("data-id") == id){
								$(this).removeClass("checked");
							}
						});

						pp.remove();
					});


				}
			})
		},

		// 删除地铁
		delRoute:function(id){
			var val = $("#subway").val().split(',');
			var el = event.currentTarget,tt = this;
			tt.routeArr.forEach(function(val,index){
				if(id==val.id){
					tt.routeArr.splice(index,1);
				}
			})
			if(val.indexOf(id)>-1){
				val.splice(val.indexOf(id),1);
				$("#subway").val(val.join(','))
			}

		},

		// 提交
		submit:function(){
			var tt = this,el = event.currentTarget;
			var form = $("#form");
			$('#addrid').val($('.addrBtn').attr('data-id'));
			var addrids = $('.addrBtn').attr('data-ids').split(' ');
			$('#cityid').val(addrids[0]);

			var go_submit = false;
			$("#form .inpbox.required").each(function(){
				var t = $(this);
				if(t.find('input').length>0 && t.find('input').val()==''){
					var tip = t.find('input').attr('placeholder');
					go_submit = true;
					alert(tip)
					return false;
				}
			});
			if(tt.loading || go_submit) return false;
			tt.loading = true;
			let url =  '/include/ajax.php?service=house&action=supplierLoupanEdit&loupanid='+loupanid;
			if($("#price").val()){
				url += '&ptype=1'
			}
			axios({
				method: 'post',
				data:form.serialize(),
				url: url,
			})
			.then((response)=>{
				tt.loading = false;
				var data = response.data;
				if(data.info ==100){
					alert('提交成功');
				}else{
					alert(data.info);
				}
			});
		},


	/**************************新版新增*****************************/	
		submitData:function(formName){ 
			const tt = this;
			this.$refs[formName].validate((valid) => {
				if (valid) {
					
					if(formName == 'formScheme'){
						tt.formScheme['worktime'] = tt.formScheme.openStart + '-' + tt.formScheme.openEnd;
						for(let i = 0; i < tt.peitaoList.length; i++){
							if(tt.peitaoList[i][0] || tt.peitaoList[i][1]){
								tt.formScheme[`peitao[${i}][0]`] = tt.peitaoList[i][0]
								tt.formScheme[`peitao[${i}][1]`] = tt.peitaoList[i][1]
							}
						}
					}



					tt.toSubmit(formName)
				} else {
					return false;
				}
			});
		},	

		toSubmit(formName){
			const tt = this;
			tt.loading = true;
			$.ajax({
				url: '/include/ajax.php?service=house&action=supplierLoupanEdit&loupanid='+loupanid,
				data: tt[formName],
				type: "POST",
				dataType: "json",
				success: function (data) {
					tt.loading = false;
					if(data.info ==100){
						alert('提交成功');
						location.reload();
					}else{
						alert(data.info);
					}
				},
				error: function () { }
			});
		},
		loadConfig:function(){
			const tt = this;
			axios({
				method: 'post',
				url:'/include/ajax.php?service=house&action=route&route=property/config',
			})
			.then((response)=>{
				var data = response.data;
				if(data && data.state==100){
					tt.config = data.info.config;
				}
			})
		},
		// 新增预售许可证
		addPermission(){
			var tt = this;
			let stop = false;
			for(let i = 0; i < tt.formbox3.license_data.length; i++){
				let no = tt.formbox3.license_data[i].no;
				let file = tt.formbox3.license_data[i].file;
				if(no == ''){
					this.$message({
						message: '请填写预售许可证号',
						type: 'error'
					  });
					stop = true;
					return false;
				}
				if( file == ''){
					this.$message({
						message: '请上传预售许可证',
						type: 'error'
					  });
					stop = true;
					return false;
				}
			}
			if(stop) return false;
			tt.formbox3.license_data.push({
				no:'',
				file:'',
				source:'',
			})
			
		},

		// 删除预售许可证
		delPermission(index){
			var tt = this;
			tt.formbox3.license_data.splice(index,1);
		},

		// 新增配套
		addPeitao(){
			const that = this;
			let list = that.peitaoList;
			let stop = false;
			for(let i = 0; i < list.length; i++){
				if(list[i][0] == '' || list[i][1] == '' ){
					this.$message({
						message: '请先完善配套信息',
						type: 'warning'
					  });
					stop = true
					break;
				}
			}

			if(stop) return false;
			that.peitaoList.push(['',''])
		},

		// 删除配套
		delPeitao(index){
			const that = this;
			that.peitaoList.splice(index,1);
		},

		// 上传图片
		  // 上传图片
		  fileChange(e,item){
            const that = this;
            let file = e.target['files'][0];
            if (window.FileReader) {
                var reader = new FileReader();
                reader.readAsDataURL(file); 
                reader.onload = function(e) {
                    var formData = new FormData();
                    let tempPath = this.result;
					that.$set(item,'source',tempPath)
                    formData.append("Filedata", file);
                    formData.append("name", file.name);
                    formData.append("lastModifiedDate", file.lastModifiedDate);
                    formData.append("size", file.size);
                    that.uploadImg(formData,item)
                    
                }
            } 
        },
		uploadImg(data,obj){
            const that = this;
            $.ajax({
                accepts:{},
                url: '/include/upload.inc.php?mod=siteConfig&type=atlas&filetype=image',
                data: data,
                type: "POST",
                processData: false, // 使数据不做处理
                contentType: false,
                dataType: "json",
                success: function (data) {
                    if(data.state == 'SUCCESS'){
                        let imgPath = data.turl
						that.$set(obj,'file',data.url)
						that.$set(obj,'source',imgPath)
                        
                    }else{
                        alert('图片上传失败，请稍后重试');
                        that.$set(obj,'source','')
                    }
                },
                error: function () { }
            });
        },


		choseFeature(key){
			const that = this;
			let arr = that.formScheme.feature.split(',');
			if(arr.indexOf(key) > -1){
				arr.splice(arr.indexOf(key),1)
			}else{
				arr.push(key)
			}
			that.formScheme.feature = arr.join(',')
		}
	}

});
