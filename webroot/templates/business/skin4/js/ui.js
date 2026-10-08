/*global plupload */
/*global qiniu */
function FileProgress(file, targetID) {
    this.fileProgressID = file.id;
    this.file = file;

    this.opacity = 100;
    this.height = 0;
    this.fileProgressWrapper = $('#' + this.fileProgressID);
    if (!this.fileProgressWrapper.length) {
        

        this.fileProgressWrapper = $('<div></div>');
        var Wrappeer = this.fileProgressWrapper;
        Wrappeer.attr('id', this.fileProgressID).addClass('progressContainer');

        var progressText = $("<div/>");
        progressText.addClass('img');

		
		var imgWrapper = $('<div class="picHolder"/>');
		var showImg = $('<span class="immg" style="background:url('+window['Default_tplPath']+'images/default.png) no-repeat 0 0/cover;"></span>');
		progressText.append(imgWrapper);
		progressText.append(showImg);
		
		var progressName = $("<div/>");
		progressName.addClass("progressName").text(file.name);
		
		
        var fileSize = plupload.formatSize(file.size).toUpperCase();
        var progressSize = $("<div/>");
        progressSize.addClass("progressFileSize").text('文件大小：'+fileSize);

        var progressBarTd = $("<div/>");
		progressBarTd.addClass('text');
        var progressBarBox = $("<div/>");
        progressBarBox.addClass('info');
        var progressBarWrapper = $("<div/>");
        progressBarWrapper.addClass("progress progress-striped");

        var progressBar = $("<div/>");
        progressBar.addClass("progress-bar progress-bar-info")
            .attr('role', 'progressbar')
            .attr('aria-valuemax', 100)
            .attr('aria-valuenow', 0)
            .attr('aria-valuein', 0)
            .width('0%');

        var progressBarPercent = $('<span class=sr-only />');
        var progressCancel = $('<a href=javascript:; />');
        progressCancel.show().addClass('progressCancel').text('取消');
		
		var progressDels = $('<a href="#" />');
        progressDels.addClass('progressDels').text('删除');

        progressBar.append(progressBarPercent);
        progressBarWrapper.append(progressBar);
        progressBarBox.append(progressBarWrapper);
       

        var progressBarStatus = $('<div class="status"/>');
        progressBarBox.append(progressBarStatus);
		
		var insertEditor = $("<div/>");
		insertEditor.addClass('insertEditor').text('插入正文');
		
		progressBarTd.append(progressName);
		progressBarTd.append(progressSize);
        progressBarTd.append(progressBarBox);
		
        Wrappeer.append(progressText);
        Wrappeer.append(progressBarTd);
		Wrappeer.append(progressDels);
		Wrappeer.append(progressCancel);
		Wrappeer.append(insertEditor);

        $('#' + targetID).prepend(Wrappeer);
    } else {
        this.reset();
    }

    this.height = this.fileProgressWrapper.offset().top;
    this.setTimer(null);
}

FileProgress.prototype.setTimer = function(timer) {
    this.fileProgressWrapper.FP_TIMER = timer;
};

FileProgress.prototype.getTimer = function(timer) {
    return this.fileProgressWrapper.FP_TIMER || null;
};

FileProgress.prototype.reset = function() {
    this.fileProgressWrapper.attr('class', "progressContainer");
    this.fileProgressWrapper.find('.progress .progress-bar-info').attr('aria-valuenow', 0).width('0%').find('span').text('');
    this.appear();
};



FileProgress.prototype.setProgress = function(percentage, speed, chunk_size) {
    var file = this.file;
    var uploaded = file.loaded;
    var size = plupload.formatSize(uploaded).toUpperCase();
    var formatSpeed = plupload.formatSize(speed).toUpperCase();
    var progressbar = this.fileProgressWrapper.find('.progress').find('.progress-bar-info');
    if (this.fileProgressWrapper.find('.status').text() === '取消上传'){
        return;
    }
	this.fileProgressWrapper.attr('class', "progressContainer green_font");
    percentage = parseInt(percentage, 10);
    if (file.status !== plupload.DONE && percentage === 100) {
        percentage = 99;
    }
	this.fileProgressWrapper.find('.status').hide();
    progressbar.attr('aria-valuenow', percentage).css('width', percentage + '%');
    this.appear();
};

FileProgress.prototype.setComplete = function(up, info) {
    var td = this.fileProgressWrapper.find('.text'),
        tdProgress = td.find('.progress');
    var res = $.parseJSON(info);
    var url;
	console.log(res)
    if (res.filepath) {
        url = res.filepath;
        str = "<div><a href=" + url + " target='_blank' > " + url + "</a></div>";
		this.fileProgressWrapper.attr({'data-smallfilepath':res.smallfilepath,'data-vid':res.remoteid}).find('.img').attr('data-url',url);
    }
	if(typeof res.duration !== 'undefined'){
		var progressDuration = $('<span class="duration"/>');
		progressDuration.text(res.duration);
		this.fileProgressWrapper.find('.img').append(progressDuration);
	}
	this.fileProgressWrapper.find('.immg').css({'background':'url('+res.smallfilepath+') no-repeat 50% 50%/cover'});
	//this.fileProgressWrapper.find('.status').text("上传成功").css('color', '#4cb720').show();
	
	
	tdProgress.hide();
	this.fileProgressWrapper.find('.progressCancel').hide();
	this.fileProgressWrapper.find('.progressDels').show().on('click', function(e){
		e.preventDefault();
		progressDel(this,res.remoteid,res.cid);
    });
	this.fileProgressWrapper.find('.insertEditor').on('click', function(e){
		e.preventDefault();
		insertEditor(this,res.remoteid,res.cid);
    });
	
	if(typeof window['qiniu_uploaded_onlyone'] !== 'undefined'){
		$('#remoteid').val(res.remoteid);
		this.fileProgressWrapper.attr({'data-fileid':res.remoteid})
	}
    
};
FileProgress.prototype.setError = function() {
	this.fileProgressWrapper.find('.text').addClass('text-warning');
    this.fileProgressWrapper.find('.text .progress').css('width', 0).hide();
	this.fileProgressWrapper.find('.text .progressCancel').hide();
};

FileProgress.prototype.setCancelled = function(manual) {
    var progressContainer = 'progressContainer';
    if (!manual) {
        progressContainer += ' red';
    }
    this.fileProgressWrapper.attr('class', progressContainer);
    this.fileProgressWrapper.find('.progress').remove();
    this.fileProgressWrapper.find('.text .btn-default').hide();
    this.fileProgressWrapper.find('.text .progressCancel').hide();
};

FileProgress.prototype.setStatus = function(status, isUploading) {
    if (!isUploading) {
        this.fileProgressWrapper.find('.status').text(status);
    }
};

// 绑定取消上传事件
FileProgress.prototype.bindUploadCancel = function(up) {
    var self = this;
    if (up) {
        self.fileProgressWrapper.find('.progressCancel').on('click', function(){
		    self.setCancelled(false);
            self.setStatus("取消上传");
            self.fileProgressWrapper.find('.status').css('color', '#f00').show();
            up.removeFile(self.file);
			self.fileProgressWrapper.remove();
			if(typeof window['qiniu_uploaded_onlyone'] !== 'undefined'){
				$('#container').show();
				$('#remoteid').val('');
			}
        });
    }

};

FileProgress.prototype.appear = function() {
    if (this.getTimer() !== null) {
        clearTimeout(this.getTimer());
        this.setTimer(null);
    }

    if (this.fileProgressWrapper[0].filters) {
        try {
            this.fileProgressWrapper[0].filters.item("DXImageTransform.Microsoft.Alpha").opacity = 100;
        } catch (e) {
            // If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
            this.fileProgressWrapper.css('filter', "progid:DXImageTransform.Microsoft.Alpha(opacity=100)");
        }
    } else {
        this.fileProgressWrapper.css('opacity', 1);
    }

    this.fileProgressWrapper.css('height', '');

    this.height = this.fileProgressWrapper.offset().top;
    this.opacity = 100;
    this.fileProgressWrapper.show();

};
