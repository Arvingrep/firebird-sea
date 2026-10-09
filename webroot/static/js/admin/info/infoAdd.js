//实例化编辑器
var ue = UE.getEditor('body',{
	toolbars: [[
		'undo', //撤销
		'redo', //重做
		'bold', //加粗
		'indent', //首行缩进
		'edittip ', //编辑提示
		'touppercase', //字母大写
		'tolowercase', //字母小写
	]],
	retainOnlyLabelPasted: true
});
// var mue = UE.getEditor('mbody');
var houseTop = 6;
$(function () {

	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		//树形递归分类
		treeTypeList: function(type){
			var typeList = [], cl = "";
			if(type == "addr"){
				var l=addrListArr;
				typeList.push('<option value="">选择地区</option>');
			}else{
				var l=typeListArr;
				typeList.push('<option value="">选择分类</option>');
			}
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if((type == "type" && typeid == jsonArray["id"]) || (type == "addr" && addr == jsonArray["id"])){
						$('.addrBtn').attr('data-id', addr);
					}
					var selected = "";
					if((type == "type" && typeid == jsonArray["id"]) || (type == "addr" && addr == jsonArray["id"])){
						selected = " selected";
					}
					if(jsonArray['lower'] != "" && type == "type"){
						typeList.push('<optgroup label="'+cl+"|--"+jsonArray["typename"]+'"></optgroup>');
					}else{
						typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["typename"]+'</option>');
					}
					for(var k = 0; k < jArray.length; k++){
						cl += '    ';
						var selected = "";
						if((type == "type" && typeid == jArray[k]["id"]) || (type == "addr" && addr == jArray[k]["id"])){
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

		//异步字段html
		,ajaxItemHtml: function(data){
			$.ajax({
				type: "POST",
				url: "infoAdd.php?dopost=getInfoItem",
				data: data,
				dataType: "json",
				success: function(data){
					if(data){
						// console.log(data)
						init.itemHtml(data);
					}else{
						$("#itemList").html("").hide();
					}
				}
			});
		}

		//字段html
		,itemHtml: function(data){
			var itemList = data.itemList, html = [];
			for(var i = 0; i < itemList.length; i++){
				html.push('<dl class="clearfix">');
				html.push('  <dt><label for="'+itemList[i].field+'">'+itemList[i].title+'：</label></dt>');
				html.push('  <dd>');

				var val = "", required = "";
				if(itemList[i].value != ""){
					val = itemList[i].value;
				}else{
					val = itemList[i].default;
				}
				if(itemList[i].required == 1){
					required = ' data-required="true"'
				}
				if(itemList[i].type == "text"){
					html.push('    <input class="input-xlarge" type="text" name="'+itemList[i].field+'" id="'+itemList[i].field+'"'+required+' value="'+val+'" />');
					if(itemList[i].required == 1){
						html.push('    <span class="input-tips"><s></s>请输入'+itemList[i].title+'</span>');
					}
				}else if(itemList[i].type == "radio" || itemList[i].type == "checkbox"){
					var list = itemList[i].options.split(",");
					for(var a = 0; a < list.length; a++){
						var checked = "";
						if(itemList[i].type == "radio"){
							if(itemList[i].value != ""){
								if(list[a] == itemList[i].value){
									checked = " checked='true'";
								}
							}else if(itemList[i].default != ""){
								if(list[a] == itemList[i].default){
									checked = " checked='true'";
								}
							}else{
								if(a == 0){
									//checked = " checked='true'";
								}
							}
						}else{
							var dVal = itemList[i].default.split("|"), vVal = itemList[i].value.split(",");
							if(itemList[i].value != "") {
								for(var c = 0; c < vVal.length; c++){
									if(list[a] == vVal[c]){
										checked = " checked='true'"
									}
								}
							}else{
								if(itemList[i].default != ""){
									for(var c = 0; c < dVal.length; c++){
										if(list[a] == dVal[c]){
											checked = " checked='true'"
										}
									}
								}
							}
						}
						var name = itemList[i].field;
						if(itemList[i].type == "checkbox"){
							name = itemList[i].field+'[]';
						}
						html.push('    <label for="'+itemList[i].field+"_"+a+'"><input type="'+itemList[i].type+'" name="'+name+'" id="'+itemList[i].field+"_"+a+'"'+required+' value="'+list[a]+'"'+checked+' />'+list[a]+'</label>&nbsp;&nbsp;');
					}
					if(itemList[i].required == 1){
						html.push('    <span class="input-tips"><s></s>请选择'+itemList[i].title+'</span>');
					}

					//多选增加全选功能
					if(itemList[i].type == "checkbox"){
						html.push('<br /><span class="label label-info checkAll" style="margin-top:5px;">全选</span>');
					}
				}else if(itemList[i].type == "select"){
					var list = itemList[i].options.split(",");
					html.push('    <span id="'+itemList[i].field+'List"><select name="'+itemList[i].field+'" id="'+itemList[i].field+'"'+required+'>');
					html.push('      <option value="">请选择</option>');
					for(var a = 0; a < list.length; a++){
						var checked = "";
						if(itemList[i].value != ""){
							if(list[a] == itemList[i].value){
								checked = " selected";
							}
						}else if(itemList[i].default != ""){
							if(list[a] == itemList[i].default){
								checked = " selected";
							}
						}
						html.push('      <option value="'+list[a]+'"'+checked+'>'+list[a]+'</option>');
					}
					html.push('    </select></span>');
					if(itemList[i].required == 1){
						html.push('    <span class="input-tips"><s></s>请选择'+itemList[i].title+'</span>');
					}
				}

				html.push('  </dd>');
				html.push('</dl>');
			}
			$("#itemList").html(html.join("")).show();
		}
	};

	$('body').delegate('.radioBox li','click', function(){
		var t = $(this);
		t.addClass('on_chose').siblings('li').removeClass('on_chose');
		t.find('input[type="radio"]').prop('checked', true);
	})


	// 获取分类
	var typeHtmlArr = []
	for(var i = 0; i < typeListArr.length; i++){
		var type = typeListArr[i];
		typeHtmlArr.push('<dl data-pid="'+type.id+'"><dt><s></s>'+type.typename+'</dt>');
		typeHtmlArr.push('<dd class="fn-clear">');
		for(var m = 0; m < type.lower.length; m++){
			var subtype = type.lower[m];
			var onChose = typeid == subtype.id ? "on_chose" : "";
			typeHtmlArr.push('<a href="javascript:;"  class="typechose '+onChose+'" data-typeid="'+subtype.id+'" data-typename="'+subtype.typename+'">'+subtype.typename+'</a>')
			if(typeid == subtype.id){
				$(".typeParBox").removeClass('fn-hide')
				$("#typeparid").val(type.id);
				$("#typePar").val(type.typename)

				$("#typename").val(subtype.typename);
			}
		}
		typeHtmlArr.push('</dd></dl>');
	}

	$('.typePop .catagoryBox').html(typeHtmlArr.join(''))
	// 初始化页面自定义内容和特色标签
  getCustom(typeid,1);




//显示分类
$("#typeList .selectType").click(function(){
	$(".typeMask,.typePop").show()
});

	var itemArr = JSON.parse(item);
	console.log(itemArr)
// 选择分类
	$(".catagoryBox").delegate('dd a.typechose','click',function(){
		var t = $(this);
		$(".catagoryBox dd a.typechose").removeClass('on_chose')
		t.addClass('on_chose');
		typeid = t.attr('data-typeid');
		typename = t.attr('data-typename');
		var dl = t.closest('dl');
		typeparid = dl.attr('data-pid');
		typepar = dl.find('dt').text();
		$("#typename").val(typename);
		$("#typeid").val(typeid);
		$("#typePar").val(typepar);
		$("#typeparid").val(typeparid);
		$(".typeParBox").removeClass('fn-hide')
		$(".typePop .popTit a.close_pop").click();
		getCustom(typeid);

	});

	// 获取当前分类下的自定义内容
	 function getCustom(typeid,type){
		$.ajax({
      url: '/include/ajax.php?service=info&action=typeDetail&id='+typeid,
      type: "POST",
      dataType: "json",
      success: function (data) {
        if(data.state == 100){
					var currType = data.info[0];

					// 自定义内容
					if(currType.item && currType.item.length > 0){
						var currCst = currType.item;  //当前分类下的自定义内容
						var cusHtml = []
						for(var i = 0; i < currCst.length ; i++){
							var typeRequired = currCst[i].required=='1' ? '<span style="color:red;">*</span>':''; //dl的类名
							var itemNow = '';
							if(itemArr && itemArr.length > 0){
								for(var m=0; m < itemArr.length; m++){
									if(itemArr[m].id == currCst[i].id){
										itemNow = itemArr[m];
									}
								}

							}
							var ival = currCst[i].default;
							var ivalArr = [];
							if(itemNow){
								ival = itemNow.value;
								ivalArr = itemNow.valueArr;
							}
							if(currCst[i].formtype == 'radio'){
								cusHtml.push('<dl class="radioBox" data-id="'+currCst[i].id+'" data-required="'+currCst[i].required+'">');
								cusHtml.push('<dt>'+typeRequired+currCst[i].title+'</dt>');
								cusHtml.push('<dd> <ul>');
								 for(var n = 0; n <currCst[i].options.length; n++){
									 var choseOn = '',checked='';
									 if(ival.indexOf(currCst[i].options[n]) > -1){
										 choseOn = 'on_chose';
 	 									checked="checked";
									 }else if(currCst[i].default.indexOf(currCst[i].options[n]) > -1 && !itemArr){
										 choseOn = 'on_chose';
										 checked="checked";
									 }
									 cusHtml.push('	<li class="'+choseOn+'"><input type="radio" name="user_'+currCst[i].field+'" value="'+currCst[i].options[n]+'" '+checked+'><s><i></i></s><span>'+currCst[i].options[n]+'</span></li>');
								 }
								cusHtml.push('</ul> </dd> </dl>');
							}else if(currCst[i].formtype == 'checkbox'){

								cusHtml.push('<dl class="AllcheckBox fn-clear" data-id="'+currCst[i].id+'" data-required="'+currCst[i].required+'">');
								cusHtml.push('<dt>'+typeRequired+currCst[i].title+'</dt>');
								cusHtml.push('<dd> <div class="checkbox">');
								 for(var n = 0; n <currCst[i].options.length; n++){
									 var choseOn = '',checked='';
									 if(ivalArr && ivalArr.length > 0 && ivalArr.indexOf(currCst[i].options[n]) > -1){
										 choseOn = 'on_chose';
 	 									checked="checked";
									 }else if(currCst[i].default.indexOf(currCst[i].options[n]) > -1 && !itemArr){
	 									choseOn = 'on_chose';
	 									checked="checked";
	 								}
									 cusHtml.push('	<label><input type="checkbox" name="user_'+currCst[i].field+'[]" value="'+currCst[i].options[n]+'" '+checked+'>'+currCst[i].options[n]+'</label>');
								 }
								cusHtml.push('</div> </dd> </dl>');
							}else{
								cusHtml.push('<dl  data-id="'+currCst[i].id+'" data-required="'+currCst[i].required+'"><dt>'+typeRequired+currCst[i].title+'</dt><dd>');
								cusHtml.push('<div class="inpBox"><input type="text" placeholder="请填写'+currCst[i].title+'" name="user_'+currCst[i].field+'" value="'+ival+'">');
								cusHtml.push('</div> </dd> </dl>');
							}
						}
						$('.customizeBox').show()
						$(".customizeBox .cContent").html(cusHtml.join(''))
					}else{
						$('.customizeBox').hide()
						$(".customizeBox .cContent").html('');
					}

					// 标签

					$('.tabArrs span').remove();
					$("#feature").val('');

					if(type){
						fArr = JSON.parse(fArr);
						$("#feature").val(fArr.join(','))
					}

					if(currType.label && currType.label.length > 0){
						var dl = $("#feature").closest('dl');
						var dd = dl.find('dd');
						for(var m=0; m<currType.label.length; m++){
							var feObj = currType.label[m];
							var onChose = fArr.indexOf(feObj.id) > -1 ? 'on_chose' : '';
							dd.append('<span data-id="'+feObj.id+'" class="'+onChose+'">'+feObj.name+'</span>')
						}
					}
				}
      },
      error: function(){}
    });
	}

// 隐藏分类
$(".typePop .close_pop,.typeMask").click(function(){
	$(".typeMask,.typePop").hide()
})

$('body').delegate('.tabArrs span','click',function(){
	var t = $(this);
	t.toggleClass('on_chose');
	var idArr = [];
	$("input[name='characteristicservice[]']").remove();
	$('.tabArrs span').each(function(){
		var id= $(this).attr('data-id');
		if($(this).hasClass('on_chose')){
			idArr.push(id);
			$(".tabArrs").after('<input type="hidden" name="characteristicservice[]" value="'+id+'">')
		}
	});
	$("#feature").val(idArr.join(','))
});

// 上传图片‘’
// var count = atlasMax;
// var fileCount = 0,$list = $("#listSection2"),picker = $("#filePicker2");
console.log(imglist)

if(imglist.list1.length > 0){

	var imgHtml = [];
	for(var i=0; i<imglist.list1.length; i++){
		var img = imglist.list1[i]
		imgHtml.push('<div id="WU_UP_FILE_'+i+'" class="pubitem"><a href="'+img.path+'" target="_blank" title="" class="enlarge"><img src="'+img.path+'" data-val="'+img.pathSource+'" data-url="'+img.path+'"></a><a class="li-rm" href="javascript:;"></a><span class="setMain">设为主图</span><span class="mainImg">主图</span></div>')
	}
	$("#listSection1").prepend(imgHtml.join(''))
}


var count = atlasMax;
$('.filePickerBox').each(function(i){
	var ind = i+1;
	var fileCount = 0,$list = $("#listSection"+ind),picker = $("#filePicker"+ind);

	// 初始化Web Uploader
		uploader_iv = WebUploader.create({
			auto: true,
			swf: pubStaticPath + 'js/webuploader/Uploader.swf',
			server: ind == 1 ? server_image_url : server_video_url,
			pick: '#filePicker'+ind,
			fileVal: 'Filedata',
			accept: {
				title: ind == 1 ?'Images':'Video',
				extensions: ind == 1 ?'gif,jpg,jpeg,bmp,png':'mp4,wmv,mov,3gp,rmvb,mkv,flv,asf',
				mimeTypes: ind == 1 ?'image/*':'video/*'
				// title: 'Images',
				// extensions: 'gif,jpg,jpeg,bmp,png',
				// mimeTypes: 'image/*'
			},
			chunked: true,//开启分片上传
						// threads: 1,//上传并发数
			fileNumLimit:  ind == 1?count:1,
			// fileSingleSizeLimit: atlasSize
		});


		uploader_iv.on('beforeFileQueued', function(file) {
			if(file.type.indexOf('image') > -1){  //上传文件为图片
				uploader_iv.options.server = server_image_url;
			}else{

				uploader_iv.options.server = server_video_url;
			}
		});

		uploader_iv.on('fileQueued', function(file) {
			console.log('fileQueued')
			var pick = $(this.options.pick);
			//先判断是否超出限制
			if(fileCount == atlasMax){
				alert(langData['siteConfig'][38][24]);//文件数量已达上限
				uploader_iv.cancelFile( file );
				return false;
			}

			fileCount++;
			addFile(file);
			updateStatus(pick);
		});



		// 文件上传过程中创建进度条实时显示。
		uploader_iv.on('uploadProgress', function(file, percentage){
			var $li = $('#'+file.id),
			$percent = $li.find('.progress span');

			// 避免重复创建
			if (!$percent.length) {
				$percent = $('<p class="progress"><span></span></p>')
					.appendTo($li)
					.find('span');
			}
			$percent.css('width', percentage * 100 + '%');

			//音频文件浏览器右下角增加上传进度
			if(file.type == 'video'){
				var progressFixed = $('#progressFixed_' + file.id);
				if(!progressFixed.length){
					var $i = $("<b id='progressFixed_"+file.id+"'>");
							$i.css({bottom: 0, left: 0, position: "fixed", "z-index": "10000", background: "#a5a5a5", padding: "0 5px", color: "#fff", "font-weight": "500", "font-size": "12px"});
					$("body").append($i);
					progressFixed = $('#progressFixed_' + file.id);
				}
				progressFixed.text(""+langData['siteConfig'][38][25]+"："+parseInt(percentage * 100) + '%');//上传进度
				if(percentage == 1){
					progressFixed.remove();
				}
			}

		});
		uploader_iv.on('uploadSuccess',function(file,response){
				// console.log(response)
				window.webUploadSuccess && window.webUploadSuccess(file, response, picker);
				var $li = $('#'+file.id), listSection = $li.closest('.listSection');
				listSection.show();
				if(response.state == "SUCCESS"){
					var img = $li.find("img");
					if (img.length > 0) {
						img.attr("data-val", response.url).attr("data-url", response.turl).attr("src", response.turl);
						$li.find(".enlarge").attr("href", response.turl);
						// $li.closest('.listImgBox').find('.deleteAllAtlas').show();
						// 此处应该赋值
						if(fileCount == atlasMax && atlasMax == 1){
							$(this.options.pick).closest('.wxUploadObj').hide();
							return false;
						}
				}

				var video = $li.find("video");
				if(video.length > 0){
					video.attr("data-val", response.url).attr("data-url", response.turl).attr("src", response.turl).attr("poster", "/include/attachment.php?f="+response.poster);
					$li.find(".enlarge").attr("href", response.turl);
                    $('#videoPoster').val(response.poster);
					// if(fileCount == atlasMax && atlasMax == 1){
						$(this.options.pick).closest('.btn-section').hide();
						return false;
					// }
				}


			}
		})
		uploader_iv.on('uploadComplete',function(file,response){
				$('#'+file.id).find('.progress').remove();
		})

		$('body').delegate('.li-rm', 'click', function(event) {
			var $btn = $(this),$li = $btn.closest('.pubitem'),list = $btn.closest('.filePickerBox')
			if($li.find('video').length >= 1){
				var path = $li.find('video').attr('data-val')
				delFile(path, false, 'video', function(){
					$li.remove();
				});
				list.find('.btn-section').show()
			}else{
				var path = $li.find('img').attr('data-val');
				delFile(path, false, 'image',function(){
					$li.remove();
				});
			}
			fileCount--;
			if(fileCount == 0){
				$('#listpic').val('')
			}
		});
		//删除已上传的文件
		function delFile(b, d, d, c) {
			var type = "delVideo"
			if(d == 'image'){
				type = 'delImage'
			}
			var g = {
				mod: "info",
				type: type,
				picpath: b,
				randoms: Math.random()
			};
			$.ajax({
				type: "POST",
				cache: false,
				async: d,
				url: "/include/upload.inc.php",
				dataType: "json",
				data: $.param(g),
				success: function(a) {
					try {
						c(a)
					} catch(b) {}
				}
			})
		}

		// 新增
		function addFile(file){
			// console.log(file)
			if(file.type.indexOf('image') > -1){
				var $li = $('<div id="' + file.id + '" class="pubitem"><a href="" target="_blank" title="" class="enlarge"><img></a><a class="li-rm" href="javascript:;"></a><span class="setMain">设为主图</span><span class="mainImg">主图</span></div>');//删除图片
				var $img = $li.find('img');
				// 创建缩略图
				uploader_iv.makeThumb(file, function(error, src) {
					$img.closest('.listSection').show();
					if(error){
						$list.show();
						$img.replaceWith('<span class="thumb-error">'+langData['siteConfig'][6][177]+'...</span>');//上传中
						return;
					}
					$img.attr('src', src);
				});
			}else{
				var $li = $('<div id="' + file.id + '" class="pubitem videoItem"><a href="javascript:;" target="_blank" title="" class="enlarge"><video></video></a><a class="li-rm" href="javascript:;"></a></div>');//删除图片
				var $video = $li.find('video');
				// $video.attr('src', src);
			}

			var $btns = $li.find('.li-rm');


			$btns.on('click', function(){
				uploader_iv.cancelFile( file );
				uploader_iv.removeFile(file, true);
			});
			// $list.prepend($li);
			picker.closest('.btn-section').before($li);
		}


		function updateStatus(obj){
			var len = $(".listSection .pubitem").length;
			if(length == 0){
				$(".wxUploadObj").show()
			}else{
				if(atlasMax == fileCount){
					$(".wxUploadObj").hide()
				}
			}
		}

})






	// 设为主图
	$("body").delegate('.setMain', 'click', function(event) {
		var t = $(this);
		var li = t.closest('.pubitem');
		$("#listSection1").prepend(li)

	});





// 地图显示
//标注地图
	$("#mark").bind("click", function(){
		$.dialog({
			id: "markDitu",
			title: langData['siteConfig'][6][92]+"<small>（"+langData['siteConfig'][23][102]+"）</small>",   //标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）
			content: 'url:/api/map/mark.php?mod='+modelType+'&lnglat='+$("#lnglat").val()+"&addr="+$("#address").val(),
			width: 800,
			height: 500,
			max: true,
			ok: function(){
				var doc = $(window.parent.frames["markDitu"].document),
					lng = doc.find("#lng").val(),
					lat = doc.find("#lat").val(),
					addr = doc.find("#addr").val();
					city = doc.find("#city").val();
				$("#lnglat").val(lng+","+lat);
				if($("#addr").val() == ""){
					$("#addr").val(addr);
				}
				$("#addr").val(addr);

					$("#addrPosi").val(addr);
					$(".detaiAddr").removeClass('fn-hide');
					$("#mark").addClass('pFixed').find('span').text('查看定位')
				// $('.city-title.addrBtn').html(city)
			},
			cancel: true
		});
	});


	//平台切换
	$('.nav-tabs a').click(function (e) {
		e.preventDefault();
		var obj = $(this).attr("href").replace("#", "");
		if(!$(this).parent().hasClass("active")){
			$(".nav-tabs li").removeClass("active");
			$(this).parent().addClass("active");

			$(".nav-tabs").parent().find(">div").hide();
			cfg_term = obj;
			$("#"+obj).show();
		}
	})




	//填充栏目分类
	$("#typeid").html(init.treeTypeList("type"));

	//首次加载
	if($("#dopost").val() == "edit" || typeid != ""){
		init.ajaxItemHtml("typeid="+typeid+"&id="+$("#id").val());
	}

	//分类切换
	$("#typeid").change(function(){
		if($("#typeid").val() != ""){
			if($("#dopost").val() == "edit"){
				init.ajaxItemHtml("typeid="+$("#typeid").val()+"&id="+$("#id").val());
			}else{
				init.ajaxItemHtml("typeid="+$("#typeid").val());
			}
		}else{
			$("#itemList").html("").hide();
		}
	});

	//发布时间
	$("#valid").datetimepicker({
		format: 'yyyy-mm-dd',
		autoclose: true,
		language: 'ch',
		todayBtn: true,
		minView: 2
	});
	//置顶开始时间
	$("#bid_start").datetimepicker({
		format: 'yyyy-mm-dd',
		autoclose: true,
		language: 'ch',
		todayBtn: true,
		minView: 2
	});
	//置顶结束时间
	$("#bid_end").datetimepicker({
		format: 'yyyy-mm-dd',
		autoclose: true,
		language: 'ch',
		todayBtn: true,
		minView: 2
	});
	//刷新开始时间
	$("#refreshBegan").datetimepicker({
		format: 'yyyy-mm-dd',
		autoclose: true,
		language: 'ch',
		todayBtn: true,
		minView: 2
	});

	//刷新结束时间
	$("#refreshNext").datetimepicker({
		format: 'yyyy-mm-dd',
		autoclose: true,
		language: 'ch',
		todayBtn: true,
		minView: 2
	});

	//表单验证
	$("#editform").delegate("input,textarea", "focus", function(){
		var tip = $(this).siblings(".input-tips");
		if(tip.html() != undefined){
			tip.removeClass().addClass("input-tips input-focus").attr("style", "display:inline-block");
		}
	});

	$("#editform").delegate("input[type='radio'], input[type='checkbox']", "click", function(){
		if($(this).attr("data-required") == "true"){
			var name = $(this).attr("name"), val = $("input[name='"+name+"']:checked").val();
			if(val == undefined){
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}
	});

	$("#editform").delegate("input,textarea", "blur", function(){
		var obj = $(this), tip = obj.siblings(".input-tips");
		if(obj.attr("data-required") == "true"){
			if($(this).val() == ""){
				tip.removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				tip.removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}else{
			huoniao.regex(obj);
		}
	});

	$("#editform").delegate("select", "change", function(){
		if($(this).parent().siblings(".input-tips").html() != undefined){
			if($(this).val() == 0){
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}
	});

	$(".color_pick").colorPicker({
		callback: function(color) {
			var color = color.length === 7 ? color : '';
			$("#color").val(color);
			$(this).find("em").css({"background": color});
		}
	});

	//跳转表单交互
	$("input[name='flags[]']").bind("click", function(){
		if($(this).val() == "t"){
			if(!$(this).is(":checked")){
				$("#rDiv").hide();
			}else{
				$("#rDiv").show();
			}
		}
	});

	//价格开关
	$("input[name=price_switch]").bind("click", function(){
		if($(this).val() == 1){
			$(".priceinfo").hide();
		}else{
			$(".priceinfo").show();
		}
	});

	//模糊匹配会员
	$("#user").bind("input", function(){
		$("#userid").val("0");
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkUser", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#userList").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'" data-phone="'+data[i].phone+'">'+data[i].username+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#userList")
						.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#userList").html("").hide();
				}
			});

		}else{
			$("#userList").html("").hide();
		}
    });

    $("#userList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id"), phone = $(this).attr("data-phone");
		$("#user").val(name);
		$("#userid").val(id);
		$("#userList").html("").hide();
		checkGw($("#user"), name, $("#id").val());
		return false;
	});

    $(document).click(function (e) {
        var s = e.target;
        if (!jQuery.contains($("#userList").get(0), s)) {
            if (jQuery.inArray(s.id, "user") < 0) {
                $("#userList").hide();
            }
        }
    });

    $("#user").bind("blur", function(){
		var t = $(this), val = t.val(), id = $("#id").val();
		if(val != ""){
			checkGw(t, val, id);
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择会员');
		}
	});

    function checkGw(t, val, id){
		var flag = false;
		t.addClass("input-loading");
		huoniao.operaJson("../inc/json.php?action=checkUser", "key="+val, function(data){
			t.removeClass("input-loading");
			if(data) {
				for(var i = 0; i < data.length; i++){
					if(data[i].username == val){
						flag = true;
						$("#userid").val(data[i].id);
					}
				}
			}
			if(flag){
				t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>请输入网站对应会员名');
			}else{
				t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择会员');
			}
		});
	}

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		$('#addr').val($('.addrBtn').attr('data-id'));
		var addrids = $('.addrBtn').attr('data-ids').split(' ');
		$('#cityid').val(addrids[0]);
		var t            = $(this),
			id           = $("#id").val(),
			typeid       = $("#typeid").val(),
			addr         = $("#addr").val(),
			title        = $("#title"),
			volid        = $("#volid").val(),
			weight       = $("#weight"),
			video        = $('.videoItem video').length?$('.videoItem video').attr('data-val'):'',
			tj           = true;

		//分类
		if(typeid == "" || typeid == "0"){
			$("#typeList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			tj = false;
			huoniao.goTop();
			return false;
		}else{
			$("#typeList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		//标题
		// if(!huoniao.regex(title)){
		// 	tj = false;
		// 	huoniao.goTop();
		// 	return false;
		// };

		//排序
		if(!huoniao.regex(weight)){
			tj = false;
			huoniao.goTop();
			return false;
		}

		//地区
		if(addr == "" || addr == "0"){
			$("#addrList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			tj = false;
			huoniao.goTop();
			return false;
		}else{
			$("#addrList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		$("#itemList").find("input, select").each(function() {
            var objid = $(this).attr("id"), type = $(this).attr("type"), name = $(this).attr("name"), tip = $(this).parent().siblings(".input-tips");
			if(type == "text"){
				tip = $(this).siblings(".input-tips");
			}
			if($(this).attr("data-required") == "true"){
				if(type == "radio" || type == "checkbox"){
					if($("input[name='"+name+"']:checked").val() == "" || $("input[name='"+name+"']:checked").val() == undefined){
						tip.removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
						tj = false;
						$.dialog.alert(tip.text());
						return false;
					}else{
						tip.removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
					}
				}else{
					if($(this).val() == ""){
						tip.removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
						tj = false;
						$.dialog.alert(tip.text());
						return false;
					}else{
						tip.removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
					}
				}
			}
        });

		ue.sync();
		if(ue.getContent() == ""){
			$.dialog.alert("请输入信息内容！");
			return false;
		}

		if($("#person").val() == ""){
			$.dialog.alert("请输入联系人！");
			return false;
		}

		if($("#tel").val() == ""){
			$.dialog.alert("请输入联系电话！");
			return false;
		}

		var picArr = [];
		$("#listSection1 .pubitem").each(function(){
			var img = $(this).find('img');
			picArr.push(img.attr('data-val'))
		})
		$(".imglist-hidden").val(picArr.join('||'))
		$("#video").val(video)
		if(volid == "" || volid == 0){
			$.dialog.alert("请选择有效期！");
			return false;
		}


		if(tj){
			t.attr("disabled", true).html("提交中...");
			$.ajax({
				type: "POST",
				url: "infoAdd.php?action="+action,
				data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
				dataType: "json",
				success: function(data){
					if(data.state == 100){
						if($("#dopost").val() == "save"){

							huoniao.parentTip("success", "信息发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
							huoniao.goTop();
							location.href = "infoAdd.php?typeid="+$("#typeid").val();

						}else{

							huoniao.parentTip("success", "信息修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
							t.attr("disabled", false).html("确认提交");

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
		}
	});

	//视频预览
	$("#videoPreview").delegate("a", "click", function(event){
		event.preventDefault();
		var href = $(this).attr("href"),
			id   = $(this).attr("data-id");

		window.open(href+id, "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	});

	//删除文件
	$(".spic .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
		delFile(input.val(), false, function(){
			input.val("");
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});


    //拒审
    $('#arcrank').change(arcrandChange);

    function arcrandChange(){
        var arcrank = parseInt($('#arcrank').val());
        if(arcrank == 2){
            $('#reviewObj').show();
        }else{
            $('#reviewObj').hide();
        }
    }

    arcrandChange();

});
//上传成功接收
function uploadSuccess(obj, file, filetype, fileurl){
	$("#"+obj).val(file);
	$("#"+obj).siblings(".spic").find(".sholder").html('<a href="/include/videoPreview.php?f=" data-id="'+file+'">预览视频</a>');
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}
//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "info",
		type: "delVideo",
		picpath: b,
		randoms: Math.random()
	};
	$.ajax({
		type: "POST",
		cache: false,
		async: d,
		url: "/include/upload.inc.php",
		dataType: "json",
		data: $.param(g),
		success: function(a) {
			try {
				c(a)
			} catch(b) {}
		}
	})
}
