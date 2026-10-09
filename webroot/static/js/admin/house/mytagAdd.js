$(function () {

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		//树形递归分类
		treeTypeList: function(type){
			var typeList = [], cl = "";
			if(type == "addr"){
				var t = "不限地区", d = addr, l = addrListArr;
			}else{
				var t = "不限分类", d = newstypeid, l = newsListArr;
			}
			typeList.push('<option value="">'+t+'</option>');
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if(d == jsonArray["id"]){
						selected = " selected";
					}
					typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["typename"]+'</option>');
					for(var k = 0; k < jArray.length; k++){
						cl += '    ';
						var selected = "";
						if(d == jArray[k]["id"]){
							selected = " selected";
						}
						if(jArray[k]['lower'] != ""){
							arguments.callee(jArray[k]);
						}else{
							typeList.push('<option value="'+jArray[k]["id"]+'"'+selected+'>'+cl+"|--"+jArray[k]["typename"]+'</option>');
						}
						if(jsonArray["lower"] == null){
							cl = "";
						}else{
							cl = cl.replace("    ", "");
						}
					}
				})(l[i]);
			}
			return typeList.join("");
		}

	};

	//填充地区
	$("#addr").html(init.treeTypeList("addr"));

	//填充资讯分类
	$("#newstype").html(init.treeTypeList("newstype"));

	//分类切换
	$("#type").change(function(){
		var val = $(this).val();
		$(".listitem").hide();
		$("#"+val+"List").show();
		if(val == "houseNews"){
			$("#addrList").hide();
		}else{
			$("#addrList").show();
		}
	});

	//开始、结束时间
	$("#start, #end").datetimepicker({format: 'yyyy-mm-dd', minView: 2, autoclose: true, language: 'ch'});

	//预览
	$("#preview").bind("click", function(){
		var data = [], type = $("#type").val();
		data.push("t="+type);
		//楼盘
		if(type == "loupan"){
			data.push("addrid="+$("#addr").val());
			data.push("price="+$("#loupanprice1").val()+","+$("#loupanprice2").val());
			data.push("typeid="+$("#loupanprotype").val());
			data.push("orderby="+$("#loupanorderby").val());
		//楼盘房源
		}else if(type == "listing"){
			data.push("addrid="+$("#addr").val());
			data.push("price="+$("#listingprice1").val()+","+$("#listingprice2").val());
			data.push("room="+$("#listingroom").val());
			data.push("orderby="+$("#listingorderby").val());
		//小区
		}else if(type == "community"){
			data.push("addrid="+$("#addr").val());
			data.push("price="+$("#communityprice1").val()+","+$("#communityprice2").val());
			data.push("typeid="+$("#communityprotype").val());
			data.push("orderby="+$("#communityorderby").val());
		//二手房
		}else if(type == "sale"){
			data.push("addrid="+$("#addr").val());
			data.push("price="+$("#saleprice1").val()+","+$("#saleprice2").val());
			data.push("room="+$("#saleroom").val());
			data.push("area="+$("#salearea1").val()+","+$("#salearea2").val());
			data.push("buildage="+$("#salebuildage1").val()+","+$("#salebuildage2").val());
			data.push("protype="+$("#saleprotype").val());
			data.push("floor="+$("#salefloor1").val()+","+$("#salefloor2").val());
			data.push("type="+$("input[name='salenature']:checked").val());
			data.push("orderby="+$("#saleorderby").val());
		//出租房
		}else if(type == "zu"){
			data.push("addrid="+$("#addr").val());
			data.push("price="+$("#zuprice1").val()+","+$("#zuprice2").val());
			data.push("room="+$("#zuroom").val());
			data.push("protype="+$("#zuprotype").val());
			data.push("zhuangxiu="+$("#zuzhuangxiu").val());
			data.push("rentype="+$("input[name='zurentype']:checked").val());
			data.push("type="+$("input[name='zunature']:checked").val());
			data.push("orderby="+$("#zuorderby").val());
		//写字楼
		}else if(type == "xzl"){
			data.push("addrid="+$("#addr").val());
			data.push("type="+$("input[name='xzldemandopt']:checked").val());
			data.push("price="+$("#xzlprice1").val()+","+$("#xzlprice2").val());
			data.push("area="+$("#xzlarea1").val()+","+$("#xzlarea2").val());
			data.push("orderby="+$("#xzlorderby").val());
		//商铺
		}else if(type == "sp"){
			data.push("addrid="+$("#addr").val());
			data.push("type="+$("input[name='spdemandopt']:checked").val());
			data.push("price="+$("#spprice1").val()+","+$("#spprice2").val());
			data.push("area="+$("#sparea1").val()+","+$("#sparea2").val());
			data.push("orderby="+$("#sporderby").val());
		//厂房/仓库
		}else if(type == "cf"){
			data.push("addrid="+$("#addr").val());
			data.push("type="+$("input[name='cfdemandopt']:checked").val());
			data.push("price="+$("#cfprice1").val()+","+$("#cfprice2").val());
			data.push("area="+$("#cfarea1").val()+","+$("#sparea2").val());
			data.push("orderby="+$("#cforderby").val());
		//资讯
		}else if(type == "houseNews"){
			data.push("typeid="+$("#newstype").val());
		}

		data.push("submit="+encodeURI("预览"));

		$.ajax({
			type: "POST",
			url: "mytag.php?action="+module,
			data: data.join("&"),
			dataType: "json",
			success: function(data){
				var content = "";
				if(data.state == 100){
					var dataList = [], list = data.info.list;
					for(var i = 0; i < list.length; i++){
						var data_ = [];
						for(var key in list[i]){
							data_.push('<font color="red">'+key+"：</font>"+list[i][key]);
						}
						dataList.push(data_.join("<br />"));
				 　　}
					content = dataList.join("<hr />");
				}else{
					content = data.info;
				};

				$.dialog({
					title: "预览结果",
					content: '<div style="height:300px; overflow-y:auto;">'+content+'</div>',
					width: 450,
					height: 300,
					ok: true
				});


			},
			error: function(msg){
				$.dialog.alert("网络错误，预览失败 ！");
			}
		});
	});

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t = $(this);
		t.attr("disabled", true);

		var data = [], it = [], type = $("#type").val();
		data.push("dopost="+$("#dopost").val());
		data.push("id="+$("#id").val());
		data.push("token="+$("#token").val());
		data.push("name="+$("#name").val());
		data.push("type="+$("#type").val());

		//楼盘
		if(type == "loupan"){
			var addrid = $("#addr").val(),
				price1 = $("#loupanprice1").val(),
				price2 = $("#loupanprice2").val(),
				typeid = $("#loupanprotype").val(),
				orderby = $("#loupanorderby").val();

			addrid != "" ? it.push('"addrid":'+addrid) : "";
			price1 != "" && price2 != "" ? it.push('"price":"'+price1+","+price2+'"') : "";
			typeid != "" ? it.push('"typeid":'+typeid) : "";
			orderby != "" ? it.push('"orderby":'+orderby) : "";
		//楼盘房源
		}else if(type == "listing"){
			var addrid = $("#addr").val(),
				price1 = $("#listingprice1").val(),
				price2 = $("#listingprice2").val(),
				room = $("#listingroom").val(),
				orderby = $("#listingorderby").val();

			addrid != "" ? it.push('"addrid":'+addrid) : "";
			price1 != "" && price2 != "" ? it.push('"price":"'+price1+","+price2+'"') : "";
			room != "" ? it.push('"room":'+room) : "";
			orderby != "" ? it.push('"orderby":'+orderby) : "";
		//小区
		}else if(type == "community"){
			var addrid = $("#addr").val(),
				price1 = $("#communityprice1").val(),
				price2 = $("#communityprice2").val(),
				typeid = $("#communityprotype").val(),
				orderby = $("#communityorderby").val();

			addrid != "" ? it.push('"addrid":'+addrid) : "";
			price1 != "" && price2 != "" ? it.push('"price":"'+price1+","+price2+'"') : "";
			typeid != "" ? it.push('"typeid":'+typeid) : "";
			orderby != "" ? it.push('"orderby":'+orderby) : "";
		//二手房
		}else if(type == "sale"){
			var addrid = $("#addr").val(),
				price1 = $("#saleprice1").val(),
				price2 = $("#saleprice2").val(),
				room = $("#saleroom").val(),
				area1 = $("#salearea1").val(),
				area2 = $("#salearea2").val(),
				buildage1 = $("#salebuildage1").val(),
				buildage2 = $("#salebuildage2").val(),
				protype = $("#saleprotype").val(),
				floor1 = $("#salefloor1").val(),
				floor2 = $("#salefloor2").val(),
				type = $("input[name='salenature']:checked").val(),
				orderby = $("#saleorderby").val();

			addrid != "" ? it.push('"addrid":'+addrid) : "";
			price1 != "" && price2 != "" ? it.push('"price":"'+price1+","+price2+'"') : "";
			room != "" ? it.push('"room":'+room) : "";
			area1 != "" && area2 != "" ? it.push('"area":"'+area1+","+area2+'"') : "";
			buildage1 != "" && buildage2 != "" ? it.push('"buildage":"'+buildage1+","+buildage2+'"') : "";
			protype != "" ? it.push('"protype":'+protype) : "";
			floor1 != "" && floor2 != "" ? it.push('"floor":"'+floor1+","+floor2+'"') : "";
			type != "" ? it.push('"type":'+type) : "";
			orderby != "" ? it.push('"orderby":'+orderby) : "";
		//出租房
		}else if(type == "zu"){
			var addrid = $("#addr").val(),
				price1 = $("#zuprice1").val(),
				price2 = $("#zuprice2").val(),
				room = $("#zuroom").val(),
				protype = $("#zuprotype").val(),
				zhuangxiu = $("#zuzhuangxiu").val(),
				rentype = $("input[name='zurentype']:checked").val(),
				type = $("input[name='zunature']:checked").val(),
				orderby = $("#zuorderby").val();

			addrid != "" ? it.push('"addrid":'+addrid) : "";
			price1 != "" && price2 != "" ? it.push('"price":"'+price1+","+price2+'"') : "";
			room != "" ? it.push('"room":'+room) : "";
			protype != "" ? it.push('"protype":'+protype) : "";
			zhuangxiu != "" ? it.push('"zhuangxiu":"'+zhuangxiu+'"') : "";
			rentype != "" ? it.push('"rentype":"'+rentype+'"') : "";
			type != "" ? it.push('"type":'+type) : "";
			orderby != "" ? it.push('"orderby":'+orderby) : "";
		//写字楼
		}else if(type == "xzl"){
			var addrid = $("#addr").val(),
				type = $("input[name='xzldemandopt']:checked").val(),
				price1 = $("#xzlprice1").val(),
				price2 = $("#xzlprice2").val(),
				area1 = $("#xzlarea1").val(),
				area2 = $("#xzlarea2").val(),
				orderby = $("#xzlorderby").val();

			addrid != "" ? it.push('"addrid":'+addrid) : "";
			type != "" ? it.push('"type":'+type) : "";
			price1 != "" && price2 != "" ? it.push('"price":"'+price1+","+price2+'"') : "";
			area1 != "" && area2 != "" ? it.push('"area":"'+area1+","+area2+'"') : "";
			orderby != "" ? it.push('"orderby":'+orderby) : "";
		//商铺
		}else if(type == "sp"){
			var addrid = $("#addr").val(),
				type = $("input[name='spdemandopt']:checked").val(),
				price1 = $("#spprice1").val(),
				price2 = $("#spprice2").val(),
				area1 = $("#sparea1").val(),
				area2 = $("#sparea2").val(),
				orderby = $("#sporderby").val();

			addrid != "" ? it.push('"addrid":'+addrid) : "";
			type != "" ? it.push('"type":'+type) : "";
			price1 != "" && price2 != "" ? it.push('"price":"'+price1+","+price2+'"') : "";
			area1 != "" && area2 != "" ? it.push('"area":"'+area1+","+area2+'"') : "";
			orderby != "" ? it.push('"orderby":'+orderby) : "";
		//厂房/仓库
		}else if(type == "cf"){
			var addrid = $("#addr").val(),
				type = $("input[name='cfdemandopt']:checked").val(),
				price1 = $("#cfprice1").val(),
				price2 = $("#cfprice2").val(),
				area1 = $("#cfarea1").val(),
				area2 = $("#cfarea2").val(),
				orderby = $("#cforderby").val();

			addrid != "" ? it.push('"addrid":'+addrid) : "";
			type != "" ? it.push('"type":'+type) : "";
			price1 != "" && price2 != "" ? it.push('"price":"'+price1+","+price2+'"') : "";
			area1 != "" && area2 != "" ? it.push('"area":"'+area1+","+area2+'"') : "";
			orderby != "" ? it.push('"orderby":'+orderby) : "";
		//资讯
		}else if(type == "houseNews"){
			var newstype = $("#newstype").val();

			typeid != "" ? it.push('"typeid":'+newstype) : "";
		}
		data.push("item="+"{"+it.join(", ")+"}");

		data.push("start="+$("#start").val());
		data.push("end="+$("#end").val());
		data.push("expbody="+$("#expbody").val());
		data.push("state="+$("input[name='state']:checked").val());
		data.push("submit="+encodeURI("提交"));

		$.ajax({
			type: "POST",
			url: "mytag.php?action="+module,
			data: data.join("&"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					if($("#dopost").val() == "save"){
						$.dialog({
							fixed: true,
							title: "生成成功",
							icon: 'success.png',
							content: "生成成功！",
							ok: function(){
								huoniao.goTop();
								window.location.reload();
							},
							cancel: false
						});

					}else{
						$.dialog({
							fixed: true,
							title: "修改成功",
							icon: 'success.png',
							content: "修改成功！",
							ok: function(){
								try{
									$("body",parent.document).find("#nav-mytagphpaction"+module).click();
									parent.reloadPage($("body",parent.document).find("#body-mytagphpaction"+module));
									$("body",parent.document).find("#nav-edit"+module+"Mytag"+$("#id").val()+" s").click();
								}catch(e){
									location.href = thisPath + "mytag.php?action="+module;
								}
							},
							cancel: false
						});
					}
				}else{
					$.dialog.alert(data.info);
					t.attr("disabled", false);
				};
			},
			error: function(msg){
				$.dialog.alert("网络错误，请刷新页面重试！");
				t.attr("disabled", false);
			}
		});
	});

});
