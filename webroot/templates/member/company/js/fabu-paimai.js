$(function(){
    $("#startdate").datetimepicker({		
		format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        language: 'ch',
        todayBtn: true,
        minuteStep: 15,
        startDate:new Date(),
        linkField: "startdate",
		onSelect: gotohdDate
	}).on('changeDate',gotohdDate);
    $("#enddate").datetimepicker({		
		format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        language: 'ch',
        todayBtn: true,
        minuteStep: 15,
        startDate:new Date(),
        linkField: "enddate",
		onSelect: gotohdDate
	}).on('changeDate',gotohdDate);



    getEditor("body");


    var mycount = 20;
	$('.filePickerBox').each(function(i){

		var ind = 3;
		var fileCount = 0,$list = $("#listSection"+ind),picker = $("#filePicker"+ind);

		// 初始化Web Uploader
			uploader_iv = WebUploader.create({
				auto: true,
				swf: pubStaticPath + 'js/webuploader/Uploader.swf',
				server: server_image_url,
				pick: '#filePicker'+ind,
				fileVal: 'Filedata',
				accept: {
					title: ind == 3 ?'Images':'Video',
					extensions: ind == 3 ?'gif,jpg,jpeg,bmp,png':'mp4,wmv,mov,3gp,rmvb,mkv,flv,asf',
					mimeTypes: ind == 3 ?'.gif,.jpg,.jpeg,.png':'.mp4,.mov'
					// title: 'Images',
					// extensions: 'gif,jpg,jpeg,bmp,png',
					// mimeTypes: 'image/*'
				},
	      chunked: true,//开启分片上传
	            // threads: 1,//上传并发数
				fileNumLimit:  mycount,
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
				if(fileCount == mycount){
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
				      if(fileCount == mycount && mycount == 1){
				        $(this.options.pick).closest('.wxUploadObj').hide();
				  			return false;
				  		}
					}

					var video = $li.find("video");
					if(video.length > 0){
						video.attr("data-val", response.url).attr("data-url", response.turl).attr("src", response.turl);
						$li.find(".enlarge").attr("href", response.turl);
						// if(fileCount == count && count == 1){
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
					mod: "shop",
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
					var $li = $('<div id="' + file.id + '" class="pubitem"><a href="" target="_blank" title="" class="enlarge"><img></a><a class="li-rm" href="javascript:;"><span>删除</span></a><span class="setMain">设为主图</span><span class="mainImg">主图</span></div>');//删除图片
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
					var $li = $('<div id="' + file.id + '" class="pubitem videoItem"><a href="javascript:;" target="_blank" title="" class="enlarge"><video></video></a><a class="li-rm" href="javascript:;"><span>删除</span></a></div>');//删除图片
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
					if(mycount == fileCount){
						$(".wxUploadObj").hide()
					}
				}
			}

	})


	// 设为主图
	$("body").delegate('.setMain', 'click', function(event) {
		var t = $(this);
		var li = t.closest('.pubitem');
  		$("#listSection3").prepend(li)

	});


    // 提交
    $("#fabuForm").submit(function(event) {
        event.preventDefault();
        // 标题
        var title = $("#title").val();
        if(title == ""){
            alert(langData['siteConfig'][20][253]);
            return false;
        }

        // 主图/图集
        var litpic   = '', imglist  = [];
		$("#listSection3 .pubitem").each(function(i){
	      var val = $(this).find('img').attr('data-val');
	      if(i == 0){
	        litpic = val;
	      }else{
	        imglist.push(val);
	      }
	    })
	    $('#litpic').val(litpic);//主图
	    $('#imglist').val(imglist.join("||"));//商品图集

        if(litpic == ''){
            alert('请上传商品图片');
            return false;
        }
        if(imglist.length == 0){
            alert('请至少上传1张图集');
            return false;
        }

        var flag = 0;
        $("dl[data-required='1']").each(function(){
            var t = $(this);
            var tit = t.find('input').attr('data-title');
            var val = t.find('input').val();
            var name =  t.find('input').attr('name')
            
            if(val == ''){
                t.find('.tip-inline').addClass('error').html('<s></s>'+tit);
                flag = 1;
            }else{
            	if(name == 'add_interval' &&  val< 5){
		        	flag == 1;
		        	t.find('.tip-inline').addClass('error').html('<s></s>'+tit);
		        }else{

                	t.find('.tip-inline').addClass('success').removeClass('error').html('<s></s>');
		        }
            }

           
        })




        if(flag == 1){
            return false;
        }
        var form = $("#fabuForm");
        var url = form.attr('action');
        var manageURl = form.attr('data-url');
        $.ajax({
            url:url,
            type:'post',
            data:form.serializeArray(),
            dataType:'json',
            success:function(data){
                if(data.state == 100){
                    $.dialog.alert('发布成功')
                    window.location.href = manageURl;
                }else{
                    $.dialog.alert(data.info)
                    
                }
            },
            error:function(err){}
        })
    
    })
   

	$(".main").scroll(function(){
		$(".datetimepicker").css('display','none')
	})


	//下拉菜单赋值
	$(".w-form").delegate(".sel-menu a", "click", function(){
		var t = $(this), id = t.attr("data-id"), val = t.text(), par = t.closest(".sel-group"), input = par.next("input"), hline = par.parent().find(".tip-inline");
		t.closest(".sel-group").find(".sel").html(val+'<span class="caret"></span>');
		input.val(id);
		hline.removeClass().addClass("tip-inline success").html("<s></s>");
	});

	//选择分类
	$("#selType").delegate("a", "click", function(){
		if($(this).text() != langData['siteConfig'][22][96] && $(this).attr("data-id") != $("#typeid").val()){
			$(this).closest(".sel-group").nextAll(".sel-group").remove();
			var id = $(this).attr("data-id");
			getChildType(id);
		}
	});

	//获取子级分类
	function getChildType(id){
		if(!id) return;
		$.ajax({
			url: "/include/ajax.php?service=paimai&action=type&type="+id,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					var list = data.info, html = [];

					html.push('<div class="sel-group" data-title="'+langData['siteConfig'][20][41]+'">');   //请选择所属分类
					html.push('<button class="sel">'+langData['siteConfig'][22][96]+'<span class="caret"></span></button>');  //不限
					html.push('<ul class="sel-menu">');
					html.push('<li><a href="javascript:;" data-id="'+id+'">'+langData['siteConfig'][22][96]+'</a></li>'); //不限
					for(var i = 0; i < list.length; i++){
						html.push('<li><a href="javascript:;" data-id="'+list[i].id+'">'+list[i].typename+'</a></li>');
					}
					html.push('</ul>');
					html.push('</div>');

					$("#typeid").before(html.join(""));

				}
			}
		});
	}

})

function gotohdDate(ev){
   
    var timeStr = parseInt(new Date($(ev.target).val()).getTime()/1000)

    $(ev.target).siblings('input').val(timeStr)
    $(ev.target).siblings('.tip-inline').removeClass().addClass("tip-inline success");
}