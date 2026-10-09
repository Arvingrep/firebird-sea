var thisPageAllImages = [];
var totalUnExists = 0;

$(function () {

    var defaultBtn = $("#delBtn"),
        init = {

            //选中样式切换
            funTrStyle: function () {
                var trLength = $("#list .item").length, checkLength = $("#list .selected").length;
                if (trLength == checkLength) {
                    $("#selectBtn .check").removeClass("checked").addClass("checked");
                } else {
                    $("#selectBtn .check").removeClass("checked");
                }

                if (checkLength > 0) {
                    defaultBtn.show();
                } else {
                    defaultBtn.hide();
                }
            }

            //删除
            , del: function () {
                var checked = $("#list .selected");
                if (checked.length < 1) {
                    huoniao.showTip("warning", "未选中任何信息！", "auto");
                } else {
                    huoniao.showTip("loading", "正在操作，请稍候...");
                    var id = [];
                    for (var i = 0; i < checked.length; i++) {
                        id.push($("#list .selected:eq(" + i + ")").attr("data-id"));
                    }

                    huoniao.operaJson("?dopost=del", "id=" + id, function (data) {
                        if (data.state == 100) {
                            huoniao.showTip('success', data.info, "auto");
                            $("#selectBtn a:eq(1)").click();
                            setTimeout(function () {
                                getList();
                            }, 500);
                        } else {
                            var info = [];
                            for (var i = 0; i < $("#list .item").length; i++) {
                                var tr = $("#list .item:eq(" + i + ")");
                                for (var k = 0; k < data.info.length; k++) {
                                    if (data.info[k] == tr.attr("data-id")) {
                                        info.push("▪ " + tr.find("input").text());
                                    }
                                }
                            }
                            $.dialog.alert("<div class='errInfo'><strong>以下信息删除失败：</strong><br />" + info.join("<br />") + '</div>', function () {
                                getList();
                            });
                        }
                    });
                    $("#selectBtn a:eq(1)").click();
                }
            }

            //快速编辑
            ,quickEdit: function(id, rank){
                    
                $.dialog({
                    fixed: true,
                    title: '请设置要批量删除的条件',
                    content: $("#editForm").html(),
                    width: 600,
                    ok: function(){

                        var serializeArr = self.parent.$(".quick-editForm").serializeArray();

                        var isSet = false;
                        $.each(serializeArr, function(i, field){
                            if(field.value){
                                isSet = true;
                            }
                        });

                        if(!isSet){
                            alert('至少设置一种条件！');
                            return false;
                        }

                        if(confirm("确认要对符合设置条件的文件进行删除吗？\r\n此操作将同时删除数据库记录和本地以及远程附件中的真实文件。\r\n\r\n确认后无法恢复，请谨慎操作！")){

                            var serialize = self.parent.$(".quick-editForm").serialize();
                            window.open('?dopost=batchDel&' + serialize);
                            
                        }else{
                            return false;
                        }                        

                    },
                    cancel: true
                });
    
            }

        };

    $('.nav-tabs li').bind('click', function () {
        var t = $(this);

        if (t.hasClass('active')) return;

        t.addClass('active').siblings('li').removeClass('active');

        $("#selectBtn .check").removeClass("checked");
        defaultBtn.hide();

        $("#keyword, #start, #end").val('');

        $("#sKeyword").html('');
        $("#start").html('');
        $("#end").html('');
        $("#list").attr("data-atpage", 1);
        getList();

    });

    //开始、结束时间
    $("#stime, #etime").datetimepicker({ format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch' });

    //搜索
    $("#searchBtn").bind("click", function () {
        $("#mmodule").html($("#cmodule").attr("data-id"));
        $("#sKeyword").html($("#keyword").val());
        $("#start").html($("#stime").val());
        $("#end").html($("#etime").val());
        $("#list").attr("data-atpage", 1);
        getList();
    });

    //搜索回车提交
    $("#keyword").keyup(function (e) {
        if (!e) {
            var e = window.event;
        }
        if (e.keyCode) {
            code = e.keyCode;
        }
        else if (e.which) {
            code = e.which;
        }
        if (code === 13) {
            $("#searchBtn").click();
        }
    });

    //二级菜单点击事件
    $("#cmodule").delegate("a", "click", function () {
        var id = $(this).attr("data-id"), title = $(this).text();
        $("#cmodule").attr("data-id", id);
        $("#cmodule button").html(title + '<span class="caret"></span>');
    });

    $("#pageBtn, #paginationBtn").delegate("a", "click", function () {
        var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();
        obj.attr("data-id", id);
        if (obj.attr("id") == "paginationBtn") {
            var totalPage = $("#list").attr("data-totalpage");
            $("#list").attr("data-atpage", id);
            obj.find("button").html(id + "/" + totalPage + '页<span class="caret"></span>');
            $("#list").attr("data-atpage", id);
        } else {
            obj.find("button").html(title + '<span class="caret"></span>');
            $("#list").attr("data-atpage", 1);
        }
        getList();
    });

    //下拉菜单过长设置滚动条
    $(".dropdown-toggle").bind("click", function () {
        if ($(this).parent().attr("id") != "typeBtn") {
            var height = document.documentElement.clientHeight - $(this).offset().top - $(this).height() - 30;
            $(this).next(".dropdown-menu").css({ "max-height": height, "overflow-y": "auto" });
        }
    });

    //全选、不选
    $("#selectBtn a").bind("click", function () {
        var id = $(this).attr("data-id");
        if (id == 1) {
            $("#selectBtn .check").addClass("checked");
            $("#list .item").removeClass("selected").addClass("selected");

            defaultBtn.show();

        } else if (id == 2) {
            if (totalUnExists > 0) {
                $("#selectBtn .check").addClass("checked");
                $("#list .item").removeClass("selected");
                $('#list .unExists').addClass("selected");

                defaultBtn.show();
            } else {
                huoniao.showTip("warning", "没有不存在的文件", "auto");
            }

        } else {
            $("#selectBtn .check").removeClass("checked");
            $("#list .item").removeClass("selected");

            defaultBtn.hide();
        }
    });

    $('#list').delegate('.check', 'click', function () {
        var t = $(this), item = t.closest('.item');
        item.hasClass('selected') ? item.removeClass('selected') : item.addClass('selected');
        init.funTrStyle();
    });

    //删除
    $("#delBtn").bind("click", function () {
        $.dialog.confirm('此操作将删除掉数据库记录和实际文件，如果使用了远程附件功能，此文件也会同步删除，且不可以恢复！<br />确定要删除吗？', function () {
            init.del();
        });
    });

    //单条删除
    $("#list").delegate(".del", "click", function () {
        var t = $(this).closest('.item');
        $.dialog.confirm('此操作将删除掉数据库记录和实际文件，如果使用了远程附件功能，此文件也会同步删除，且不可以恢复！<br />确定要删除吗？', function () {
            t.addClass('selected').siblings('.item').removeClass('selected');
            init.del();
        });
    });

    //排序
    $('.orderby').bind('click', function () {
        var t = $(this), _id = t.attr('data-id');
        if (t.hasClass('curr')) {
            if (_id == 'size') {
                t.attr('data-id', 'size1');
                t.html('文件大小↑');
            } else if (_id == 'size1') {
                t.attr('data-id', 'size');
                t.html('文件大小↓');
            } else if (_id == 'click') {
                t.attr('data-id', 'click1');
                t.html('使用次数↑');
            } else if (_id == 'click1') {
                t.attr('data-id', 'click');
                t.html('使用次数↓');
            } else if(_id == 'date'){
                t.attr('data-id', '');
                t.html('上传时间↓');
            } else if(_id == ''){
                t.attr('data-id', 'date');
                t.html('上传时间↑');
            }
        }
        $('.orderby').removeClass('curr');
        t.addClass('curr');
        $("#list").attr("data-atpage", 1);
        getList();
    });

    // $('#list').delegate('.item', 'mouseover', function(){
    //    $(this).siblings('.item').addClass('blur');
    // });
    // $('#list').delegate('.item', 'mouseout', function(){
    //     $(this).siblings('.item').removeClass('blur');
    // });

    //列表数据
    getList();

    //点击放大
    $('#list').delegate('.file_image .img', 'click', function () {
        var t = $(this);
        var data = {
            'filename': t.attr('data-filename'),
            'path': t.attr('data-path'),
            'images_id': t.attr('data-images_id')
        }
        parent.file_images_list = thisPageAllImages;
        parent.open_images_preview(data);
    });

    //视频预览
    $('#list').delegate('.file_video .img', 'click', function (event) {
        event.preventDefault();
        var filename = $(this).attr("data-filename"),
            path = $(this).attr("data-path");

        $.dialog({
            id: "videoPreview",
            title: '视频预览：' + filename,
            content: 'url:/include/videoPreview.php?f=' + path,
            width: 950,
            height: 700,
            ok: false,
        });
    });

    //音频播放
    var amr = new BenzAMRRecorder();
    var isplaying = '';
    $('#list').delegate('.file_audio .img', 'click', function (event) {
        var t = $(this);
        var aUrl = t.attr('data-path');
        if (amr.isInit()) {
            $('#list .file_audio .img').removeClass('playing');
            amr.stop();

            if (aUrl == isplaying) {
                isplaying = '';
                return false;
            }
        }
        amr = new BenzAMRRecorder();
        if (amr.isPlaying()) {   //是否正在播放
            t.removeClass('playing');
            amr.stop();
        } else {
            t.addClass('playing');
            isplaying = aUrl;
            amr.initWithUrl(aUrl).then(function () {  //重新初始化
                amr.play();
            });
        }
        amr.onEnded(function () {
            t.removeClass('playing');  //是否播放完成
        })
        return false;
    })

	//批量删除
	$("#batchDelBtn").bind("click", function(event){
		init.quickEdit(0);
	});


    //自定义配置
    $('#customConfigBtn').bind('click', function(){
        $.dialog({
            fixed: true,
            title: '自定义配置',
            content: $("#editForm1").html(),
            width: 460,
            ok: function(){

                huoniao.showTip("loading", "保存中...");

                var record_attachment_count = self.parent.$('input[name=record_attachment_count]:checked').val();
                 
                huoniao.operaJson("siteConfig.php?action=fileManage", "&record_attachment_count="+record_attachment_count+"&token="+token, function(data){
                    $.get("siteClearCache.php?action=do");
                    huoniao.showTip("success", "保存成功", "auto");
                    location.reload();
                });

            },
            cancel: true
        });
        self.parent.$('.statusTips').tooltip();
    });

});


function getList() {
    huoniao.showTip("loading", "正在操作，请稍候...");
    $('html').scrollTop(0);
    var keyword = encodeURIComponent($("#sKeyword").html()),
        mmodule = $("#mmodule").html(),
        start = $("#start").html(),
        end = $("#end").html(),
        pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "20",
        orderby = $(".orderby.curr").attr('data-id'),
        page = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

    var type = $('.nav-tabs .active').attr('data-type');

    var data = [];
    data.push("type=" + type);
    data.push("module=" + mmodule);
    data.push("keyword=" + keyword);
    data.push("start=" + start);
    data.push("end=" + end);
    data.push("orderby=" + orderby);
    data.push("pagestep=" + pagestep);
    data.push("page=" + page);

    thisPageAllImages = [];

    huoniao.operaJson("?dopost=getList", data.join("&"), function (val) {
        var obj = $("#list"), list = [], i = 0, listArr = val.list;
        if (val.state == "100") {
            huoniao.hideTip();

            obj.attr("data-totalpage", val.pageInfo.totalPage);
            $('.totalCount').html('&nbsp;' + val.pageInfo.totalCount + ' 个&nbsp;');
            $('.totalSize').html('&nbsp;' + val.pageInfo.totalSize + '&nbsp;');

            for (i; i < listArr.length; i++) {

                var click = !cfg_record_attachment_count ? '<span class="click" title="使用次数">' + (listArr[i].click == -1 ? '未知' : listArr[i].click + '次') + '</span>' : '';

                //图片
                if (type == 'image') {
                    list.push('<div class="item" data-id="' + listArr[i].id + '" data-path="' + listArr[i].filepath + '">');
                    list.push('<div class="oper"><span class="check"></span><span class="del"></span></div>');
                    list.push('<div class="img" title="点击放大" data-path="' + listArr[i].filepath + '" data-filename="' + listArr[i].filename + '" data-images_id="' + i + '"><img src="' + listArr[i].filepath + '" onerror="this.src=\'/static/images/404.jpg\'" /></div>');
                    var nickname = listArr[i].nickname;
                    if (listArr[i].userid > 0) {
                        nickname = '<a href="javascript:;" class="userinfo" title="上传人：' + listArr[i].nickname + '" data-id="' + listArr[i].userid + '">' + listArr[i].nickname + '</a>';
                    }
                    list.push('<div class="clear"><p class="filename" title="' + listArr[i].filename + '">' + listArr[i].filename + '&nbsp;</p><p class="nickname clearfix">' + nickname + click + '</p></p></div>');
                    list.push('<div class="clear">');
                    list.push('<span title="上传时间">' + huoniao.transTimes(listArr[i].pubdate, 1) + '</span>');
                    list.push('<em title="文件大小">' + listArr[i].filesize + '</em>');
                    list.push('</div></div>');

                    thisPageAllImages.push(listArr[i].filepath);

                    //视频
                } else if (type == 'video') {
                    list.push('<div class="item" data-id="' + listArr[i].id + '" data-path="' + listArr[i].filepath + '">');
                    list.push('<div class="oper"><span class="check"></span><span class="del"></span></div>');
                    list.push('<div class="img" title="点击播放" data-path="' + listArr[i].filepath + '" data-filename="' + listArr[i].filename + '" data-images_id="' + i + '"><img src="' + listArr[i].poster + '" onerror="this.src=\'/static/images/404.jpg\'" /><span class="duration" title="视频时长">' + listArr[i].duration + '</span></div>');
                    var nickname = listArr[i].nickname;
                    if (listArr[i].userid > 0) {
                        nickname = '<a href="javascript:;" class="userinfo" title="上传人：' + listArr[i].nickname + '" data-id="' + listArr[i].userid + '">' + listArr[i].nickname + '</a>';
                    }
                    list.push('<div class="clear"><p class="filename" title="' + listArr[i].filename + '">' + listArr[i].filename + '&nbsp;</p><p class="nickname clearfix">' + nickname + click + '</p></p></div>');
                    list.push('<div class="clear">');
                    list.push('<span title="上传时间">' + huoniao.transTimes(listArr[i].pubdate, 1) + '</span>');
                    list.push('<em title="文件大小">' + listArr[i].filesize + '</em>');
                    list.push('</div></div>');

                    //音频
                } else if (type == 'audio') {
                    list.push('<div class="item" data-id="' + listArr[i].id + '" data-path="' + listArr[i].filepath + '">');
                    list.push('<div class="oper"><span class="check"></span><span class="del"></span></div>');
                    list.push('<div class="img" title="点击播放" data-path="' + listArr[i].filepath + '" data-filename="' + listArr[i].filename + '" data-images_id="' + i + '"><span class="duration" title="音频时长">' + listArr[i].duration + '</span></div>');
                    var nickname = listArr[i].nickname;
                    if (listArr[i].userid > 0) {
                        nickname = '<a href="javascript:;" class="userinfo" title="上传人：' + listArr[i].nickname + '" data-id="' + listArr[i].userid + '">' + listArr[i].nickname + '</a>';
                    }
                    list.push('<div class="clear"><p class="filename" title="' + listArr[i].filename + '"><a href="' + listArr[i].filepath + '" title="点击下载" target="_blank" download><span class="glyphicon glyphicon-download-alt"></span></a>' + listArr[i].filename + '&nbsp;</p><p class="nickname clearfix">' + nickname + click + '</p></p></div>');
                    list.push('<div class="clear">');
                    list.push('<span title="上传时间">' + huoniao.transTimes(listArr[i].pubdate, 1) + '</span>');
                    list.push('<em title="文件大小">' + listArr[i].filesize + '</em>');
                    list.push('</div></div>');

                    //文件
                } else if (type == 'file') {
                    list.push('<div class="item" data-id="' + listArr[i].id + '" data-path="' + listArr[i].filepath + '">');
                    list.push('<div class="oper"><span class="check"></span><span class="del"></span></div>');
                    var nickname = listArr[i].nickname;
                    if (listArr[i].userid > 0) {
                        nickname = '<a href="javascript:;" class="userinfo" title="上传人：' + listArr[i].nickname + '" data-id="' + listArr[i].userid + '">' + listArr[i].nickname + '</a>';
                    }
                    list.push('<div class="clear"><p class="filename" title="' + listArr[i].filename + '"><a href="' + listArr[i].filepath + '" title="点击下载" target="_blank" download><span class="glyphicon glyphicon-download-alt"></span></a>' + listArr[i].filename + '&nbsp;</p><p class="nickname clearfix">' + nickname + click + '</p></p></div>');
                    list.push('<div class="clear">');
                    list.push('<span title="上传时间">' + huoniao.transTimes(listArr[i].pubdate, 1) + '</span>');
                    list.push('<em title="文件大小">' + listArr[i].filesize + '</em>');
                    list.push('</div></div>');

                    //其他
                } else if (type == '') {
                    list.push('<div class="item" data-id="' + listArr[i].id + '" data-path="' + listArr[i].filepath + '">');
                    list.push('<div class="oper"><span class="check"></span><span class="del"></span></div>');
                    var nickname = listArr[i].nickname;
                    if (listArr[i].userid > 0) {
                        nickname = '<a href="javascript:;" class="userinfo" title="上传人：' + listArr[i].nickname + '" data-id="' + listArr[i].userid + '">' + listArr[i].nickname + '</a>';
                    }
                    list.push('<div class="clear"><p class="filename" title="' + listArr[i].filename + '"><a href="' + listArr[i].filepath + '" title="点击下载" target="_blank" download><span class="glyphicon glyphicon-download-alt"></span></a>' + listArr[i].filename + '&nbsp;</p><p class="nickname clearfix">' + nickname + click + '</p></p></div>');
                    list.push('<div class="clear">');
                    list.push('<span title="上传时间">' + huoniao.transTimes(listArr[i].pubdate, 1) + '</span>');
                    list.push('<em title="文件大小">' + listArr[i].filesize + '</em>');
                    list.push('</div></div>');
                }


            }

            obj.html('<div class="clearfix file_' + type + '">' + list.join("") + '</div>');
            huoniao.showPageInfo();

            checkFileStatus();  //检测文件是否存在
        } else {
            obj.attr("data-totalpage", "1");
            huoniao.showPageInfo();
            obj.html('<div class="loading">' + val.info + '</div>');
            huoniao.showTip("warning", val.info, "auto");
        }
    });
}


// 遍历所有文件
function checkFileStatus() {
    totalUnExists = 0;
    $('#totalUnExists').html(totalUnExists + '个');
    $('#list').find('.item').each(function () {
        var t = $(this), path = t.attr('data-path');
        fileExists(t, path);
    })
}

// 通过ajax方式判断文件是否存在
function fileExists(t, url) {
    var isExists;
    $.ajax({
        url: url,
        type: 'HEAD',
        timeout: 2000,
        error: function (e, a) {
            isExists = 0;
            checkedUnExists(t);
        },
        success: function () {
            isExists = 1;
        }
    });

    setTimeout(function () {
        if (isExists == 1) {

        } else {
            checkedUnExists(t);
        }
    }, 2000);
}

// 给不存在的文件增加标识
function checkedUnExists(t) {
    if (!t.hasClass('unExists')) {
        t.addClass('unExists');
        t.find('.check').after('<span class="unexists">文件不存在</span>');
        totalUnExists++;
        $('#totalUnExists').html(totalUnExists + '个');
    }
}