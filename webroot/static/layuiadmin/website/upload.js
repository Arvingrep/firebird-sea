/**    webuploader二次上传初始化，如需访问uploader 如 var abc = new xUploader({});使用abc.uploader
 * * opt参数 * *
 * btn                  上传按钮区域（id,class,tagname）
 * btnLabel             上传按钮说明
 * imgWrap              多图上传并upType==2时使用为li外层ul
 * imgElement           为单图上传时 upType==1时需改src图片
 * valueElement         存放上传图片地址的隐藏域
 * maxLen               图片最大张数
 * imgLenth             判断图片张数选择器(如 'imgbox .loading')
 * srcSplit             多图上传时使用分隔符，默认为',' 1为'|'
 * successDo            当上传成功方法不满足需求时，可页面扩展
 * errorDo              当上传失败方法不满足需求时，可页面扩展
 * upErrorDo            当上传服务器端返回失败时调用
 * progressElement      上传进度展示元素（可选填）
 * progressElement1     动态改度内容百分比(可选填)
 * progressElement2     动态改度元素宽度百分比(可选填)
 * upType               上传类型 1时为单图上传并调用默认单图成功函数 为2时为多图上传并调用默认多图成功函数，如不使用默认成功函数可不填
 * singleSizeLimit      单张文件大小限制(默认单位为KB，支持MB,不支持小数)
 * suportType           支持的文件类型(默认为gif,jpg,jpeg,bmp,png)
 * mimeTypes            文件类型(默认为image/*)
 * suportTitle          文字描述(默认为files)
 * disableGlobalDnd     是否禁掉整个页面的拖拽功能(默认为true,)
 * chunked              是否要分片处理大文件上传(默认为false)
 * compress             配置压缩的图片的选项(默认为false)
 * dnd                  指定Drag And Drop拖拽的容器(默认为undefined)
 * paste                指定监听paste事件的容器(默认为undefined)
 * duplicate            去重(默认为true)
 * thumb                配置生成缩略图的选项(默认为false)
 * threads              上传并发数(默认为1)
 * tipMethod            错误提醒函数(默认为alert)
 * server               上传路径(单页面上传路径不一致时，使用)
 * imgInputName         多图上传时img并列的input隐藏域的name值
 * imgTxtName           多图上传时img并列的input文本框的name值
 * formData             文件上传请求的参数表选填
 * loadProgress         上传中执行
 **/

var uploadParam = {
    addr:'/include/upload.inc.php'
}
var xUploader = function(opt){
	var _this = this;
    var default_set = {
        suportType:'jpg,jpeg,gif,png',
        mimeTypes:'.jpg,.jpeg,.gif,.png',
        suportTitle: 'files',
        disableGlobalDnd:true,
        chunked:false,
        dnd:undefined,
        paste:undefined,
        duplicate:true,
        thumb:false,
        threads:1,
        numFinish:false,
        singleSizeLimit:'5MB',
        fileSizeLimit:undefined,
        formData:{},
        tipMethod:function(value){alert(value)}
    }
    if(opt.imgLenth)
        opt.imgLenth = $(opt.imgLenth).length;
    _this.argments = $.extend({},default_set,opt)
    xUploader.prototype.beforeFile=function(){
        if(_this.argments.upType == 'type1'){
            this.reset();
            return true;
        }
        var flag = true;
        var count = _this.argments.imgLenth;
        var max = _this.argments.maxLen;
        if ( count >= max && flag ) {
            flag = false;
            if(_this.argments.numFinish == false){
               _this.argments.numFinish = true;
               _this.argments.tipMethod('上传数量已达上限')
            }
            setTimeout(function() {
                flag = true;
            }, 1 );
        }
        if(count < max){
            _this.argments.imgLenth++
            if(_this.argments.numFinish == true){
                _this.argments.numFinish = false;
            }
            if(count == max - 1){
                $(_this.argments.btn).hide();
            }
        }
        return count >= max ? false : true;
    }
    _this.loadProgress = function(file,percentage){
        if(opt.loadProgress){
            opt.loadProgress();
            return;
        }
        if(_this.argments.progressElement){
            $(_this.argments.progressElement).show();
        }
        if(_this.argments.progressElement1){
            $(_this.argments.progressElement1).text(Math.ceil(percentage*100)+'%')
        }
        if(_this.argments.progressElement2){
            $(_this.argments.progressElement2).css('width',Math.ceil(percentage*100)+'%')
        }
        if(percentage == 1){
            if(_this.argments.progressElement){
                $(_this.argments.progressElement).hide();
            }
            if(_this.argments.progressElement1){
                $(_this.argments.progressElement1).text('')
            }
            if(_this.argments.progressElement2){
                $(_this.argments.progressElement2).css('width','0%')
            }
        }
    }
    _this.successDo = function(url,name){
        if(opt.successDo){
            opt.successDo(url,name);
            return;
        }
        var type = _this.argments.upType;
        var srcSplit = ',';
        if(_this.argments.srcSplit == 1){
            srcSplit = '|';
        }
        //单图上传时
        if(type == 'type1'){
            $(_this.argments.imgElement).attr('src',url);
            $(_this.argments.valueElement).val(url);
        }
        //多图上传时
        if(type == 'type2'){      
            let data=JSON.parse(url);   
            var html = '<li class="loading">\
                        <span class="del-pics"></span>\
                        <img class="pic" src="'+data.turl+'">\
                      </li>';
            $(_this.argments.imgWrap).append(html);
            if($(_this.argments.valueElement).val()){
               $(_this.argments.valueElement).val($(_this.argments.valueElement).val() + srcSplit + data.turl); 
            }else{
                $(_this.argments.valueElement).val(data.turl)
            }
            _this.argments.imgLength++;
        }
        //多图上传时img有并列的input隐藏域
        if(type == 'type3'){     
			var html = '<li class="loading">\
					<span class="del-pics"></span>\
					<input type="hidden" value="'+url+'"  name="'+opt.imgInputName+'"/>\
					<img class="pic" src="'+url+'">\
				  </li>';
			
            $(_this.argments.imgWrap).append(html);
            if($(_this.argments.valueElement).val()){
               $(_this.argments.valueElement).val($(_this.argments.valueElement).val() + srcSplit + url); 
            }else{
                $(_this.argments.valueElement).val(url)
            }
            _this.argments.imgLength++;
        }
        //上传video视频
        if(type == 'type4'){     
            var html = '<li class="loading">\
                        <span class="del-pics"></span>\
                        <video src="'+url+'">您的浏览器不支持 video 标签。</video>\
                        <div class="mask">\
                            <i class="xicon-bofang"></i>\
                        </div>\
                    </li>';
            
            $(_this.argments.imgWrap).append(html);
            if($(_this.argments.valueElement).val()){
               $(_this.argments.valueElement).val($(_this.argments.valueElement).val() + srcSplit + url); 
            }else{
                $(_this.argments.valueElement).val(url)
            }
            _this.argments.imgLength++;
        }
        //多图上传时img有并列的input文本框
        if(type == 'type5'){     
            var html = '<li class="loading" style="height:auto;">\
                    <span class="del-pics"></span>\
                    <img class="pic" src="'+url+'" style="height:110px;">\
                    <input type="text" value=""  name="'+opt.imgTxtName+'" style="width:110px;box-sizing:border-box;"/>\
                  </li>';
            
            $(_this.argments.imgWrap).append(html);
            if($(_this.argments.valueElement).val()){
               $(_this.argments.valueElement).val($(_this.argments.valueElement).val() + srcSplit + url); 
            }else{
                $(_this.argments.valueElement).val(url)
            }
            _this.argments.imgLength++;
        }
        //上传video视频,带封面
        if(type == 'type6'){  
            var json = JSON.parse(url);
            var html = '<li class="loading">\
                        <span class="del-pics"></span>\
                        <video src="'+json.turl+'" data-poster="'+json.poster+'">您的浏览器不支持 video 标签。</video>\
                        <div class="mask">\
                            <i class="xicon-bofang"></i>\
                        </div>\
                    </li>';
            
            $(_this.argments.imgWrap).append(html);
            var posterHid = $(_this.argments.valueElement).siblings('input[type="hidden"]');
            if($(_this.argments.valueElement).val()){
               $(_this.argments.valueElement).val($(_this.argments.valueElement).val() + srcSplit + json.turl);
               posterHid.val(posterHid.val() + srcSplit + json.poster);
            }else{
                $(_this.argments.valueElement).val(json.turl)
               posterHid.val(json.poster);
            }
            _this.argments.imgLength++;
        }
    }
    _this.delFile = function(ele,url){
        var srcSplit =  _this.argments.srcSplit == 1 ? '$$' : ',',
            e = $(_this.argments.valueElement),
            u = e.val().split(srcSplit),
            arr=[];
            for(var i=0;i<u.length;i++){
                if(u[i] == url){
                    continue;
                }
                arr.push(u[i])
            }
        e.val(arr.join(srcSplit));
        $(ele).closest('.loading').remove();
        _this.argments.imgLenth--;
        $(_this.argments.btn).show();
    }
    _this.errorDo = function(type){
        if(opt.errorDo){
            opt.errorDo(type);
            return;
        }
        if(type == 'F_EXCEED_SIZE'){
            _this.argments.tipMethod("所选文件大小不可超过" + _this.argments.singleSizeLimit + "哦！换个小点的文件吧！");
        }
        if(type == 'Q_TYPE_DENIED'){
            _this.argments.tipMethod('所选文件类型不支持,请选择 "' + _this.argments.suportType + '" 类型的文件！')
        }
        if(type == 'Q_EXCEED_SIZE_LIMIT'){
            _this.argments.tipMethod("所选文件大小不可超过" + _this.argments.singleSizeLimit + "哦！换个小点的文件吧！")
            
        }
    }
    _this.upErrorDo = function(res){
        if(opt.upErrorDo){
            opt.upErrorDo(res);
            return;
        }
        _this.argments.tipMethod(res.name+'上传至服务器失败,请联系管理员处理！')
    }
    xUploader.prototype.init = function(){
        _this.uploader = WebUploader.create({
            // swf文件路径
            swf: '/static/js/webuploader/Uploader.swf',
            accept: {
                title: _this.argments.suportTitle,
                extensions: _this.argments.suportType,
                mimeTypes: _this.argments.mimeTypes
            },
            fileVal: 'Filedata',
            compress:false,
            disableGlobalDnd: _this.argments.disableGlobalDnd,
            chunked: _this.argments.chunked,
            formData:_this.argments.formData,
            server: function(){
                var server = _this.argments.server || uploadParam.addr;
                return server;
            }(),
            fileNumLimit: 300,
            fileSizeLimit:_this.argments.fileSizeLimit,
            fileSingleSizeLimit:function(){
                if(_this.argments.singleSizeLimit){
                    var setSize = $.trim(_this.argments.singleSizeLimit);
                }else{
                    return;
                }
                var reg_num = /^\d+$/,
                    reg_kb = /^\d+kb$/i,
                    reg_mb = /^\d+mb$/i;
                if(reg_num.test(setSize)){
                    _this.argments.singleSizeLimit = setSize + 'KB'
                    return (+setSize)*1024
                }
                if(reg_kb.test(setSize)){
                    var num = setSize.match(/^\d+/)[0]
                    return num*1024
                }
                if(reg_mb.test(setSize)){
                    var num = setSize.match(/^\d+/)[0]
                    return num*1024*1024
                }
                _this.argments.tipMethod('文件大小限制参数有误')
            }(),
            pick: {
                id: _this.argments.btn,
                label: _this.argments.btnLabel
            },
            compress:false,
            resize:false,
            dnd: _this.argments.dnd,
            paste: _this.argments.paste,
            duplicate:_this.argments.duplicate,
            thumb:_this.argments.thumb,
            threads:_this.argments.threads,
            onBeforeFileQueued:_this.beforeFile,
            onFileQueued:function( file ) {
                _this.uploader.upload();
            },
            onUploadSuccess:function(file, response){
                var url = response._raw;
                if(url){
                    _this.successDo(url,file.name)
                }else{
                    _this.argments.tipMethod('上传无返回，请重试')                
                }
            },
            onUploadError:_this.upErrorDo,
            onUploadProgress:function(file,percentage){
                _this.loadProgress(file,percentage);
            },
            onError:_this.errorDo
        });
    }
    _this.init();
}