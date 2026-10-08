$(function(){
	    const img_original = document.getElementById('img_original');
	    const img_output = document.getElementById('img_output');
	    let blob;
	
	    function preview(file) {
	        let reader = new FileReader();
	        reader.onload = function () {
	            img_original.src = this.result;
	            img_original.onload = () => {
	                console.log('图片原始宽高:', img_original.naturalWidth, img_original.naturalHeight);
	                console.log('图片原始大小:', file.size)
	            }
	        };
	        reader.readAsDataURL(file);
	    }
		
		$("#get_img").change(function(){
			var fileObj = document.getElementById('get_img').files[0];
			console.log(fileObj)
			console.log('文件大小：' + fileObj.size);
			var maxWidth  = 500 ; 
			var reader = new FileReader();
			reader.readAsDataURL(fileObj);
			reader.onload = function() {
				
				var img = new Image();
				img.src = this.result;
				img.onload = function() {
					
					// 按比例缩放
					var w = this.width < maxWidth ? this.width : maxWidth;
					var h = this.width < maxWidth ? this.height : this.height / (this.width / maxWidth);
					
					var wNode = document.createAttribute('width');
					var hNode = document.createAttribute('height');
					
					wNode.nodeValue = w;
					hNode.nodeValue = h;
					
					var canvas = document.createElement('canvas');
					
					canvas.setAttributeNode(wNode);
					canvas.setAttributeNode(hNode);
					
					var ctx = canvas.getContext('2d');
					ctx.drawImage(this, 0, 0, w, h);
					
					var base64Data = canvas.toDataURL('image/jpeg', .6);
					
					document.getElementById('showImg').src = base64Data;
					console.log(base64Data)
				}
			}
			
		

		});
		
		
		function compress() {
		        // 压缩到图片原始宽高的一半
		        let w = img_original.naturalWidth / 2;
		        let h = img_original.naturalHeight / 2;
		
		        let canvas = document.createElement('canvas');
		        let ctx = canvas.getContext('2d');
		        let anw = document.createAttribute("width");
		        anw.nodeValue = w;
		        let anh = document.createAttribute("height");
		        anh.nodeValue = h;
		        canvas.setAttributeNode(anw);
		        canvas.setAttributeNode(anh);
		
		        ctx.fillRect(0, 0, w, h);
		        ctx.drawImage(img_original, 0, 0, w, h);
		
		        const base64 = canvas.toDataURL('image/jpeg', 0.75);// 压缩后质量
		        const bytes = window.atob(base64.split(',')[1]);
		        const ab = new ArrayBuffer(bytes.length);
		        const ia = new Uint8Array(ab);
		        for (let i = 0; i < bytes.length; i++) {
		            ia[i] = bytes.charCodeAt(i);
		        }
		        blob = new Blob([ab], {type: 'image/jpeg'});
		
		        console.log('压缩后的图片大小', blob.size);
		        // 预览压缩后的图片
		        img_output.src = base64;
				
		    }
			
			function save() {
				if (blob) {
					let a = document.createElement('a');
					let event = new MouseEvent('click');
					a.download = Math.round(new Date() / 1000) + '.jpg';
					a.href = URL.createObjectURL(blob);
					a.dispatchEvent(event)
				}
			}


	// function showHeQiniu(uptoken_url){
	// 	$.ajax({'url':uptoken_url,'success':function(data){
	// 		if(data.islogin==='1'){
	// 			showHeUploader(data.MSG.Api_Upload_Uploadurl,data.MSG.Api_Upload_Token);
	// 		}
	// 	}});
	// }
	console.log(i_domain,i_token)
	showHeUploader(i_domain,i_token);
	function showHeUploader(i_domain,i_token) {
		window['uploader'] = Qiniu.uploader({
	        runtimes: 'html5,flash,html4',
	        browse_button: 'pickfiles',
	        container: 'container',
	        drop_element: 'container',
	        max_file_size: '1000mb',
	        flash_swf_url: window['Default_tplPath']+'js/qiniu/Moxie.swf',
	        dragdrop: false,
	        chunk_size: '4mb',
	       multi_selection: true,
			//multi_selection: false,
			filters: {mime_types:[{title:"Video files",extensions:"mov,mp4,flv,hlv,avi,rmvb,wmv,mp3"}]},
	        uptoken:i_token,
			/*uptoken_url: $('#uptoken_url').val(),
	        uptoken_func: function(){
	             var ajax = new XMLHttpRequest();
	             ajax.open('GET', $('#uptoken_url').val(), false);
	             ajax.setRequestHeader("If-Modified-Since", "0");
	             ajax.send();
	             if (ajax.status === 200) {
	                 var res = JSON.parse(ajax.responseText);
					 
					 //console.log('custom uptoken_func:' + res.MSG.Api_Upload_Token);
	                 return res.MSG.Api_Upload_Token;
	             } else {
	                 console.log('custom uptoken_func err');
	                 return '';
	             }
	         },*/
	        domain:i_domain,
			max_retries:0,
	        get_new_uptoken: false,
	        // downtoken_url: '/downtoken',
	        // unique_names: true,
	        // save_key: true,
	        // x_vars: {
	        //     'id': '1234',
	        //     'time': function(up, file) {
	        //         var time = (new Date()).getTime();
	        //         // do something with 'time'
	        //         return time;
	        //     },
	        // },
	        auto_start: true,
	        log_level: 0,
	        init: {
	            'FilesAdded': function(up, files) {
	                $('#fsUploadProgress').show();
	              
	                plupload.each(files, function(file) {
	                    var progress = new FileProgress(file, 'fsUploadProgress');
	                    progress.setStatus("等待中...");
	                    progress.bindUploadCancel(up);
						
	                });
	            },
	            'BeforeUpload': function(up, file) {
	               /* var progress = new FileProgress(file, 'fsUploadProgress');
	                var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
	                if (up.runtime === 'html5' && chunk_size) {
	                    progress.setChunkProgess(chunk_size);
	                }*/
					if(typeof window['qiniu_uploaded_onlyone'] !== 'undefined'){
						$('#container').hide();
					}
	            },
	            'UploadProgress': function(up, file) {
	                var progress = new FileProgress(file, 'fsUploadProgress');
	                var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
	                progress.setProgress(file.percent + "%", file.speed, chunk_size);
	            },
	            'UploadComplete': function(up, file) {
	                //$('#success').show();
	            },
	            'FileUploaded': function(up, file, info) {
	                var progress = new FileProgress(file, 'fsUploadProgress');
	                progress.setComplete(up, info);
	            },
	            'Error': function(up, err, errTip) {
	                $('#fsUploadProgress').show();
	                var progress = new FileProgress(err.file, 'fsUploadProgress');
	                progress.setError();
	                progress.setStatus(errTip);
	            }
	                // ,
	                // 'Key': function(up, file) {
	                //     var key = "";
	                //     // do something with key
	                //     return key
	                // }
	        }
	    });
	
	   //  uploader.bind('FileUploaded', function() {
	   //      //console.log('hello man,a file is uploaded');
	   //  });
	   
	    var getRotate = function(url) {
	        if (!url) {
	            return 0;
	        }
	        var arr = url.split('/');
	        for (var i = 0, len = arr.length; i < len; i++) {
	            if (arr[i] === 'rotate') {
	                return parseInt(arr[i + 1], 10);
	            }
	        }
	        return 0;
	    };
	
	    $('#myModal-img .modal-body-footer').find('a').on('click', function() {
	        var img = $('#myModal-img').find('.modal-body img');
	        var key = img.data('key');
	        var oldUrl = img.attr('src');
	        var originHeight = parseInt(img.data('h'), 10);
	        var fopArr = [];
	        var rotate = getRotate(oldUrl);
	        if (!$(this).hasClass('no-disable-click')) {
	            $(this).addClass('disabled').siblings().removeClass('disabled');
	            if ($(this).data('imagemogr') !== 'no-rotate') {
	                fopArr.push({
	                    'fop': 'imageMogr2',
	                    'auto-orient': true,
	                    'strip': true,
	                    'rotate': rotate,
	                    'format': 'png'
	                });
	            }
	        } else {
	            $(this).siblings().removeClass('disabled');
	            var imageMogr = $(this).data('imagemogr');
	            if (imageMogr === 'left') {
	                rotate = rotate - 90 < 0 ? rotate + 270 : rotate - 90;
	            } else if (imageMogr === 'right') {
	                rotate = rotate + 90 > 360 ? rotate - 270 : rotate + 90;
	            }
	            fopArr.push({
	                'fop': 'imageMogr2',
	                'auto-orient': true,
	                'strip': true,
	                'rotate': rotate,
	                'format': 'png'
	            });
	        }
	
	        $('#myModal-img .modal-body-footer').find('a.disabled').each(function() {
	
	            var watermark = $(this).data('watermark');
	            var imageView = $(this).data('imageview');
	            var imageMogr = $(this).data('imagemogr');
	
	            if (watermark) {
	                fopArr.push({
	                    fop: 'watermark',
	                    mode: 1,
	                    image: 'http://www.b1.qiniudn.com/images/logo-2.png',
	                    dissolve: 100,
	                    gravity: watermark,
	                    dx: 100,
	                    dy: 100
	                });
	            }
	
	            if (imageView) {
	                var height;
	                switch (imageView) {
	                    case 'large':
	                        height = originHeight;
	                        break;
	                    case 'middle':
	                        height = originHeight * 0.5;
	                        break;
	                    case 'small':
	                        height = originHeight * 0.1;
	                        break;
	                    default:
	                        height = originHeight;
	                        break;
	                }
	                fopArr.push({
	                    fop: 'imageView2',
	                    mode: 3,
	                    h: parseInt(height, 10),
	                    q: 100,
	                    format: 'png'
	                });
	            }
	
	            if (imageMogr === 'no-rotate') {
	                fopArr.push({
	                    'fop': 'imageMogr2',
	                    'auto-orient': true,
	                    'strip': true,
	                    'rotate': 0,
	                    'format': 'png'
	                });
	            }
	        });
	
	        var newUrl = Qiniu.pipeline(fopArr, key);
	
	        var newImg = new Image();
	        img.attr('src', 'images/loading.gif');
	        newImg.onload = function() {
	            img.attr('src', newUrl);
	            img.parent('a').attr('href', newUrl);
	        };
	        newImg.src = newUrl;
	        return false;
	    });
	}

	function progressDel(o,fileid,cid){
		var url ='/upload/uploadfile.ashx?action=delfile&table_id='+$('#table_id').val()+'&id='+cid+'&remoteid='+fileid;
		$.ajax({'url':url,'success':function(data){
			if(data.islogin === '1'){
				$(o).parent().remove();
				if(typeof window['qiniu_uploaded_onlyone'] !== 'undefined'){
					var progressContainer=$('#fsUploadProgress').find('.progressContainer');
					if(!progressContainer[0]){$('#container').show();}
				}
			}else{
				MSGwindowShow('progressDel','0',data.error,'','');
			}
		}});
		return false;
	}
	function insertEditor(o,fileid,cid){
		var htmla="<iframe height=450 width=600 src='"+window['siteUrl']+"customer/remotefile?id="+fileid+"' frameborder=0 'allowfullscreen'></iframe>";
		
		mypage.editor.focus();
		mypage.editor.execCommand('inserthtml',htmla);
		
		var url='/api/RemoteFile/AdminUpdateRemoteFileTableId?id='+fileid+'&tableId=0';
		$.ajax({'url':url,type:"POST",'success':function(res){
			if(typeof res.iserror !== 'undefined' && res.iserror === 1){
				MSGwindowShow('house','0','操作失败了！','','');
				return;
			}
			$(o).parent().remove();
			
		}});
		return false;
	}
	
	
	
  // var uploader = Qiniu.uploader({
  //     runtimes: 'html5,flash,html4',      // 上传模式，依次退化
  //     browse_button: 'video_up',         // 上传选择的点选按钮，必需
  //     // 在初始化时，uptoken，uptoken_url，uptoken_func三个参数中必须有一个被设置
  //     // 切如果提供了多个，其优先级为uptoken > uptoken_url > uptoken_func
  //     // 其中uptoken是直接提供上传凭证，uptoken_url是提供了获取上传凭证的地址，如果需要定制获取uptoken的过程则可以设置uptoken_func
  //     // uptoken : '<Your upload token>', // uptoken是上传凭证，由其他程序生成
  //     // uptoken_url: '/uptoken',         // Ajax请求uptoken的Url，强烈建议设置（服务端提供）
  //     // uptoken_func: function(){    // 在需要获取uptoken时，该方法会被调用
  //     //    // do something
  //     //    return uptoken;
  //     // },
  //     get_new_uptoken: false,             // 设置上传文件的时候是否每次都重新获取新的uptoken
  //     // downtoken_url: '/downtoken',
  //     // Ajax请求downToken的Url，私有空间时使用，JS-SDK将向该地址POST文件的key和domain，服务端返回的JSON必须包含url字段，url值为该文件的下载地址
  //     // unique_names: true,              // 默认false，key为文件名。若开启该选项，JS-SDK会为每个文件自动生成key（文件名）
  //     // save_key: true,                  // 默认false。若在服务端生成uptoken的上传策略中指定了sava_key，则开启，SDK在前端将不对key进行任何处理
  //     domain: '<Your bucket domain>',     // bucket域名，下载资源时用到，必需
  //     container: 'container',             // 上传区域DOM ID，默认是browser_button的父元素
  //     max_file_size: '100mb',             // 最大文件体积限制
  //     flash_swf_url: 'path/of/plupload/Moxie.swf',  //引入flash，相对路径
  //     max_retries: 3,                     // 上传失败最大重试次数
  //     dragdrop: true,                     // 开启可拖曳上传
  //     drop_element: 'container',          // 拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
  //     chunk_size: '4mb',                  // 分块上传时，每块的体积
  //     auto_start: true,                   // 选择文件后自动上传，若关闭需要自己绑定事件触发上传
  //     //x_vars : {
  //     //    查看自定义变量
  //     //    'time' : function(up,file) {
  //     //        var time = (new Date()).getTime();
  //               // do something with 'time'
  //     //        return time;
  //     //    },
  //     //    'size' : function(up,file) {
  //     //        var size = file.size;
  //               // do something with 'size'
  //     //        return size;
  //     //    }
  //     //},
  //     init: {
  //         'FilesAdded': function(up, files) {
  //             plupload.each(files, function(file) {
  //                 // 文件添加进队列后，处理相关的事情
  //             });
  //         },
  //         'BeforeUpload': function(up, file) {
  //                // 每个文件上传前，处理相关的事情
  //         },
  //         'UploadProgress': function(up, file) {
  //                // 每个文件上传时，处理相关的事情
  //         },
  //         'FileUploaded': function(up, file, info) {
  //                // 每个文件上传成功后，处理相关的事情
  //                // 其中info.response是文件上传成功后，服务端返回的json，形式如：
  //                // {
  //                //    "hash": "Fh8xVqod2MQ1mocfI4S4KpRL6D98",
  //                //    "key": "gogopher.jpg"
  //                //  }
  //                // 查看简单反馈
  //                // var domain = up.getOption('domain');
  //                // var res = parseJSON(info.response);
  //                // var sourceLink = domain +"/"+ res.key; 获取上传成功后的文件的Url
  //         },
  //         'Error': function(up, err, errTip) {
  //                //上传出错时，处理相关的事情
  //         },
  //         'UploadComplete': function() {
  //                //队列文件处理完毕后，处理相关的事情
  //         },
  //         'Key': function(up, file) {
  //             // 若想在前端对每个文件的key进行个性化处理，可以配置该函数
  //             // 该配置必须要在unique_names: false，save_key: false时才生效

  //             var key = "";
  //             // do something with key here
  //             return key
  //         }
  //     }
  // });

  // domain为七牛空间对应的域名，选择某个空间后，可通过 空间设置->基本设置->域名设置 查看获取

  // uploader为一个plupload对象，继承了所有plupload的方法



})