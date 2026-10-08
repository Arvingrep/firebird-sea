/**
 * 会员中心商家点评
 * by guozi at: 20170328
 */

var objId = $("#list");
$(function(){

	// 分类管理
	$("#foodType").click(function(){
		//管理属性
		$.ajax({
			url: "/include/ajax.php?service=business&action=diancanGetFoodType&u=1",
			type: "POST",
			dataType: "JSON",
			success: function(data){

				var content = [];

				if(data.state == 100){
					var content = [];
					var list = data.info, len = list.length;
					for(var i = 0; i < len; i++){
					content.push('<li data-id="'+list[i].id+'"><i data-toggle="tooltip" data-placement="top" data-original-title="'+langData['siteConfig'][26][150]+'" class="icon-move"></i><input type="text" name="title[]" placeholder="'+langData['waimai'][5][78]+'" value="'+list[i].title+'" /><a data-toggle="tooltip" data-placement="top" data-original-title="'+langData['siteConfig'][6][8]+'" href="javascript:;" class="icon-trash"></a></li>');
					}
					content = '<ul class="menu-itemlist">'+content.join("")+'</ul>';
					content += '<a href="javascript:;" id="addNew"><i class="icon-plus"></i>'+langData['siteConfig'][6][82]+'</a>';

				}else{
					content = '<ul class="menu-itemlist"></ul>';
					content += '<a href="javascript:;" id="addNew"><i class="icon-plus"></i>'+langData['siteConfig'][6][82]+'</a>';
				}

				$.dialog({
					id: "productFlags",
					title: langData['siteConfig'][26][151],
					content: content,
					width: 290,
					ok: function(){
					  var data = [], itemList = self.parent.$(".menu-itemlist li");
					  for(var i = 0; i < itemList.length; i++){
					    var obj = itemList.eq(i), id = obj.attr("data-id"), sort = obj.index(), val = obj.find("input").val();
					    data.push('{"id": "'+id+'", "sort": "'+sort+'", "val": "'+val+'"}');
					  }

					  $.ajax({
					    url: "/include/ajax.php?service=business&action=diancanSaveFoodType",
					    data: "data=["+data.join(",")+"]",
					    type: "POST",
					    dataType: "json",
					    success: function(data){
					    	if(data && data.state == 100){
						      location.reload();
						    }else{
						    	$.dialog.alert(data.info);
						    }
					    }
					  });
					},
					cancel: function(){
					  // location.reload();
					}
				});

				//拖动排序
				parent.$(".menu-itemlist").dragsort({ dragSelector: "li>i", placeHolderTemplate: '<li class="holder"></li>' });

				//删除
				parent.$('.menu-itemlist').delegate("a", "click", function(){
				var parent = $(this).parent(), id = parent.attr("data-id");
				if(id != ""){
					if(confirm(langData['siteConfig'][20][211])){
						parent.remove();
						$.post("/include/ajax.php?service=business&action=diancanDelFoodType", "id="+id, function(){});
					}
				}else{
				  parent.remove();
				}
				});

				//新增
				parent.$("#addNew").bind("click", function(){
				var html = '<li data-id=""><i data-toggle="tooltip" data-placement="top" data-original-title="'+langData['siteConfig'][26][150]+'" class="icon-move"></i><input type="text" name="name[]" value="" placeholder="'+langData['waimai'][5][78]+'" /><a data-toggle="tooltip" data-placement="top" data-original-title="'+langData['siteConfig'][6][8]+'" href="javascript:;" class="icon-trash"></a></li>';
				parent.$(".menu-itemlist").append(html);
				parent.$(".menu-itemlist").scrollTop($(".menu-itemlist").find("li").length*34);
				});
			}
		});

	});

	$("#addFood").click(function(){
		$("#listContent").hide();
	})

	var tagenum = 101;
	$('body').delegate('.deletefield', 'click',function(){
		$(this).parents('.fatherblock').remove();
	});
	$('body').delegate('.sondeletefield', 'click',function(){
		$(this).parent('.fatherblock').remove();
	});
	$('#addpricenature').on('click',function(){
		var lenght = $('.natureblock').length;
		if(lenght>9){
			$.dialog.alert(langData['siteConfig'][27][81]);
		}
		var string = '<div class="natureblock fatherblock"><div class="fieldblock">';
		string += '<label>'+langData['siteConfig'][19][496]+': <input type="text" name="nature['+tagenum+'][name]" value="" style="width:80px;padding:5px;"/></label>';
		string += ' &nbsp;&nbsp;<label>'+langData['siteConfig'][19][497]+'：<select name="nature['+tagenum+'][maxchoose]" style="width:80px;" class="maxchoose"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option></select></label>';
		// string += '<label>是否开启:<select name="nature['+tagenum+'][is_open][]"><option value="0">开启</option><option value="1">关闭</option></select></label>';
		string += '<div class="deletefield" style="" title="'+langData['siteConfig'][26][5]+'"> '+langData['siteConfig'][6][8]+' </div>';
		string += '<div class="addsonfield" title="'+langData['siteConfig'][19][498]+'" onclick="addsonnaturepriceblock(this,'+tagenum+');"> '+langData['siteConfig'][19][498]+' </div>';
		string += '</div></div>';
		$('#natureblocklist').append(string);
		tagenum++;
	});

	$("#natureblocklist").delegate(".maxchoose", "change", function(){
		var s = $(this), val = s.val(), p = s.closest('.fatherblock');
		if(val > 1){
			p.find(".price").attr("readonly", true).val(0);
		}else{
			p.find(".price").attr("readonly", false);
		}
	})


	// tab切换
	$(".tab-head li").click(function(){
		var t = $(this), index = t.index();
		t.addClass("active").siblings().removeClass("active");
		$(".tab-body .tab-item").eq(index).show().siblings(".tab-item").hide();
		$('.tab-body .fg').remove();
	})

	// 保存商品
	$("#foodForm").submit(function(e){
		e.preventDefault();
		var form = $(this), t = $("#submit");

		var title = $("#title"),
			price = $("#price"),
			typeid = $("#typeid");

		if($.trim(title.val()) == ''){
			$.dialog.alert(langData['siteConfig'][21][149]);
			return;
		}
		if($.trim(price.val()) == ''){
			$.dialog.alert(langData['siteConfig'][21][150]);
			return;
		}
		if(typeid.val() == '' || typeid.val() == 0){
			$.dialog.alert(langData['siteConfig'][21][151]);
			return;
		}

		var url = form.attr("action"), data = form.serialize();
		$.ajax({
			url: url,
			data: data,
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					$.dialog({
						title: langData['siteConfig'][22][72],
					    icon: 'success.png',
					    content: data.info,
					    close: true,
					    ok: function(){
					        location.reload();
					    },
					    cancel: function(){
					    	location.reload();
					    }
					})
				}else{
					$.dialog.alert(data.info);
				}
			},
			error: function(){

			}
		})
	})

	// 勾选
	$(".checkid").click(function(){
		var t = $(this);
		setTimeout(function(){
			var checked = t.prop("checked");
			if(t.attr("id") == "checkAll"){
				$(".checkid").prop("checked", checked);
			}
			if($("#listContent tbody :checked").length > 0){
				$("#checkAll").prop("checked", true);
				$("#delAll").show();
			}else{
				$("#checkAll").prop("checked", false);
				$("#delAll").hide();
			}
		},200)
	})

	$("#listContent .del").click(function(){
		delFood($(this));
	})

	// 删除
	function delFood(btn){
		var ids = [];
		var tr = null;
		if(btn.attr("id") == "delAll"){
			$("#listContent tbody :checked").each(function(){
				ids.push($(this).val());
				$(this).closest('tr').addClass('deling');
			})
		}else{
			ids.push(btn.attr('data-id'));
			btn.closest('tr').addClass('deling');
		}
		if(ids.length == 0){
			$.dialog.alert(langData['siteConfig'][27][82]);
			return false;
		}

		$.dialog.confirm(langData['siteConfig'][27][83], function(){
			$.ajax({
				url: '/include/ajax.php?service=business&action=diancanDelFood&id='+ids.join(","),
				type: 'post',
				dataType: 'json',
				success: function(data){
					if(data && data.state == 100){
						$('.deling').remove();
						$.dialog({
							title: langData['siteConfig'][22][72],
						    icon: 'success.png',
						    content: data.info,
						    close: true,
						    ok: function(){
						        location.reload();
						    }
						})
					}else{
						$('.deling').removeClass('deling');
						$.dialog.alert(data.info);
					}
				},
				error: function(){
					$('deling').removeClass('deling');
					$.dialog.alert(langData['siteConfig'][20][183]);
				}
			})
		}, function(){
			$("#listContent .deling").removeClass("deling");
		})
	}

});

function addsonnaturepriceblock(obj,key){
    var string = '<div class="sonfieldblock fatherblock">\n';
    string += '<label>'+langData['siteConfig'][26][6]+'：<input type="text" value="" name="nature['+key+'][value][]"/></label>\n';
    string += '<label>'+langData['siteConfig'][19][428]+'：<input type="text" value="0" name="nature['+key+'][price][]" class="price" /></label>\n';
    string += '<label>'+langData['siteConfig'][6][100]+'：\n<select name="nature['+key+'][is_open][]" style="width:60px;"><option value="0">'+langData['siteConfig'][6][24]+'</option><option value="1">'+langData['siteConfig'][6][23]+'</option></select></label>\n';
    string += '<div class="sondeletefield">'+langData['siteConfig'][6][8]+'</div>\n';
    string += '</div>';
    $(obj).parents('.natureblock').append(string);
}
