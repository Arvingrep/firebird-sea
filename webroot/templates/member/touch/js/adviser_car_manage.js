$(function(){
    var ua = navigator.userAgent.toLowerCase();//获取判断用的对象
    if (ua.match(/MicroMessenger/i) == "micromessenger") {
        var atlasMax = 1;
        var modelType = 'article';

        // var fileCount = 0;

        wx.config({
            debug: false,
            appId: wxconfig.appId,
            timestamp: wxconfig.timestamp,
            nonceStr: wxconfig.nonceStr,
            signature: wxconfig.signature,
            jsApiList: ['chooseImage', 'previewImage', 'uploadImage', 'downloadImage','startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'onVoicePlayEnd', 'uploadVoice', 'downloadVoice']
        });

        //微信上传图片
        wx.ready(function() {
            $('.up').each(function(i){
                var t = $(this), dt = t.find('dt');
                var btnwrap = dt.children('.btnwrap');
                var id = 'up_' + i;
                if(!btnwrap.length){
                    dt.append('<div class="btnwrap" style="width:'+dt.css('width')+';height:'+dt.css('height')+'" id="'+id+'"></div>');
                }
            })
            $('.up .btnwrap, .up .bindbtn').unbind().bind('click', function(){
                var o = $(this), t = o.closest('.up');

                var dt = t.children('dt'), dd = dt.siblings('dd'), type = t.data('type'), count = t.data('count') ? t.data('count') : 1;
                var thiscount = count - t.siblings('.pic').length;
                var localIds = [];
                wx.chooseImage({
                    count: thiscount,
                    success: function (res) {
                        localIds = res.localIds;
                        syncUpload(dd);
                    },
                    fail: function(err){
                    },
                    complete: function(){
                    }
                });

                function syncUpload(dd) {
                    var par = dd.parent();
                    var dt = dd.siblings('dt');
                    if (!localIds.length) {
                        // alert('上传成功!');
                    } else {
                        for(var i = 0; i < localIds.length; i++){
                            var localId = localIds[i];
                            wx.uploadImage({
                                localId: localId,
                                success: function(res) {
                                    var serverId = res.serverId;

                                    $.ajax({
                                        url: '/api/weixinImageUpload.php',
                                        type: 'POST',
                                        data: {"service": "siteConfig", "action": "uploadWeixinImage", "module": modelType, "media_id": serverId},
                                        dataType: "json",
                                        async: false,
                                        success: function (data) {
                                            if (data.state == 100) {
                                                var fid = data.fid, url = data.url, turl = data.turl, time = new Date().getTime(), id = "wx_upload" + time;

                                                if(count == 1){
                                                    dt.find('.remove').addClass('force').click();
                                                    dd.children("input").val(fid)
                                                    dt.append('<div class="pic" style="width:'+dt.css('width')+';height:'+dt.css('height')+'"><img src="'+turl+'" data-val="'+fid+'"><a href="javascript:;" class="remove"></a></div>')
                                                    bindbtn.length && bindbtn.addClass('edit').html('<span></span>'+bindbtn.data('edit-title'));
                                                }else{
                                                    par.before('<div class="pic" style="width:'+dt.css('width')+';height:'+dt.css('height')+'"><img src="'+turl+'" data-val="'+fid+'"><a href="javascript:;" class="remove"></a></div>');
                                                    var len = par.siblings('.pic').length;
                                                    par.find('.tit').text(len+'/'+count)
                                                    if(count == len){
                                                        par.append('<div class="stopup" style="width:'+dt.css('width')+';height:'+dt.css('height')+'" id="'+id+'"></div>');
                                                    }
                                                    var pics = [];
                                                    par.siblings('.pic').each(function(){
                                                        var img = $(this).children('img');
                                                        var src = img.attr('data-val');
                                                        var des = img.data('des') ? img.data('des') : ''
                                                        pics.push(src+'|'+des);
                                                    })
                                                    dd.children("input").val(pics.join(','));
                                                }

                                            }else {
                                                showErr(data.info);
                                            }
                                        },
                                        error: function(XMLHttpRequest, textStatus, errorThrown){
                                            showErr(XMLHttpRequest.status);
                                            showErr(XMLHttpRequest.readyState);
                                            showErr(textStatus);
                                        }
                                    });

                                    // fileCount++;
                                    // updateStatus();

                                    // syncUpload();
                                },
                            });
                        }
                    }
                }
            });



            function delFile(t){
                var type = 0;
                var par = t.parent().parent();
                if(par.hasClass('up-group')){
                    type = 1;
                    var p = par.find('.up');
                }else{
                    var p = t.closest('.up'), bindbtn = p.find('.bindbtn');
                }
                var path = t.siblings('img').attr('data-val')
                var index = p.attr('data-index');
                var count = p.data('count') ? p.data('count') : 1;
                var bindbtn = p.find('.bindbtn');
                delAtlasPic(path);
                t.parent().remove();
                if(count == 1){
                    p.find('dd input').val('');
                }else{
                    var pics = [];
                    var len = 0;
                    par.children('.pic').each(function(){
                        len++;
                        var img = $(this).children('img');
                        var src = img.attr('src');
                        var des = img.data('des') ? img.data('des') : ''
                        pics.push(src+'|'+des);
                    })
                    p.find('dd input').val(pics.join(","));
                    if(type == 1){
                        p.find('.stopup').remove();
                        var tit = p.find('.tit'), s = tit.data('title') ? tit.data('title') : langData['siteConfig'][6][78];//上传照片
                        tit.text(len == 0 ? s : len+'/'+count);
                    }
                }
                bindbtn.length && bindbtn.removeClass('edit').html('<span></span>'+bindbtn.data('up-title'));
            }

            //删除已上传图片
            var delAtlasPic = function(b){
                var g = {
                    mod: "article",
                    type: "delAtlas",
                    picpath: b,
                    randoms: Math.random()
                };
                $.ajax({
                    type: "POST",
                    url: "/include/upload.inc.php",
                    data: $.param(g)
                })
            };

        });
    }else{

        var upObj = [];
        $('.up').each(function(i){
            var t = $(this), dt = t.find('dt'), dd = t.children('dd'), type = t.data('type'), bindbtn = t.find('.bindbtn'), bindcss = '', count = t.data('count') ? t.data('count') : 1;
            var btnwrap = dt.children('.btnwrap');
            var id = 'up_' + i;
            if(!btnwrap.length){
                dt.append('<div class="btnwrap" style="width:'+dt.css('width')+';height:'+dt.css('height')+'" id="'+id+'"></div>');
            }
            if(bindbtn.length){
                bindcss = 'bindbtn-up-'+i;
                bindbtn.addClass(bindcss);
                bindcss = '.'+bindcss;
            }
            t.attr('data-index', i);
            var replace = count == 1 ? true : false;

            upObj[i] = new Upload({
                btn: '#'+id,
                bindBtn: bindcss,
                title: 'Images',
                mod: 'article',
                params: 'type='+type,
                atlasMax: count,
                deltype: 'del'+type,
                replace: replace,
                fileQueued: function(file){

                },
                uploadSuccess: function(file, response){
                    if(response.state == "SUCCESS"){


                        // var con = dd.children('.pic');
                        // if(con.length == 0) dd.append('<div class="pic"></div>');
                        // dd.children('.pic').show().html('<img src="'+response.turl+'" data-val="'+response.url+'"><a href="javascript:;" class="remove"></a>').siblings('div').hide();
                        if(count == 1){
                            dt.find('.remove').addClass('force').click();
                            dd.children("input").val(response.url)
                            dt.append('<div class="pic" style="width:'+dt.css('width')+';height:'+dt.css('height')+'"><img src="'+response.turl+'" data-val="'+response.url+'"><a href="javascript:;" class="remove"></a></div>')
                            bindbtn.length && bindbtn.addClass('edit').html('<span></span>'+bindbtn.data('edit-title'));
                        }else{
                            t.before('<div class="pic" style="width:'+dt.css('width')+';height:'+dt.css('height')+'"><img src="'+response.turl+'" data-val="'+response.url+'"><a href="javascript:;" class="remove"></a></div>');
                            var len = t.siblings('.pic').length;
                            t.find('.tit').text(len+'/'+count)
                            if(count == len){
                                t.append('<div class="stopup" style="width:'+dt.css('width')+';height:'+dt.css('height')+'" id="'+id+'"></div>');
                            }
                            var pics = [];
                            t.siblings('.pic').each(function(){
                                var img = $(this).children('img');
                                var src = img.attr('data-val');
                                var des = img.data('des') ? img.data('des') : ''
                                pics.push(src+'|'+des);
                            })
                            dd.children("input").val(pics.join(','));
                        }
                    }
                },
                showErr: function(info){
                    showMsg(info);
                }
            });
        })


    }



    // 信息提示框
    $('.maskbg .msg-box .btn-close').click(function () {
        $('.maskbg').hide();
    });
    //删除
    // $('.del-btn').on('click',function () {
    //     console.log(0);
    //     window.location.replace("adviser_car.html");
    // });

    $('.del-btn').on('click',function () {
        $('.tel-box-bg').show();
    });

    $('.tel-box-bg>div .btns span.cancel').click(function () {
        $('.tel-box-bg').hide();
    });
    $('.tel-box-bg>div .btns span.sure').click(function () {
        $('.tel-box-bg').hide();
        window.location.replace("adviser_car.html");
    });

    // 金牌顾问
    $('.info-b li.stages').click(function () {
        $(this).toggleClass('chose_btn');
        if(!$(this).hasClass('chose_btn')){
            $('.uploadImg .state_icon').hide();
        }else{
            $('.uploadImg .state_icon').show();
        }
    });

    function isPhoneNo(p) {
        var areaCode = parseInt($("#areaCode").val());
        if(areaCode == 86){
            var pattern = /^1[23456789]\d{9}$/;
            return pattern.test(p);
        }
        return true;
    }
    $('.add-btn span').on('click',function () {
        var phone = $('#phone').val();
        if(!phone){
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(langData['siteConfig'][21][185]);//请填写手机号
        }else if (isPhoneNo($.trim($('#phone').val())) == false) {
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(langData['siteConfig'][44][17]);//请输入正确的手机号!
        }
    });

})