
var page = new Vue({
	el:'#page',
	data:{
		navList:navList,
		currid:1,
		hoverid:'',
		salestatenames:salestatenames,  //销售状态数据
		existingnames:existingnames,  //楼盘状态数据
		protypelist:protypelist,  //物业类型数据
		salestate:salestate,   //销售状态
		existing:existing,   //楼盘状态
		protype:protype,   //物业类型
		routeArr:subwayarr,
		loading:false,
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
			$(".inpbox.required").each(function(){
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
			axios({
				method: 'post',
				data:form.serialize(),
				url: masterDomain + '/include/ajax.php?service=house&action=supplierLoupanEdit&loupanid='+loupanid,
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
	}

});
