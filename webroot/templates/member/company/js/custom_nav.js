$(function(){

    //新增
    var i = 0;
    $('.add').bind('click', function(){
        $('.container tbody').append('<tr>\n' +
            '                    <td class="fir"></td>\n' +
            '                    <td>\n' +
            '                        <img class="img" style="height: 40px;">\n' +
            '                        <a href="javascript:;" class="upfile" title="'+langData['siteConfig'][6][8]+'">'+langData['siteConfig'][41][99]+'</a>\n' +//删除--上传图标
            '                        <input type="file" name="Filedata" class="imglist-hidden Filedata fn-hide" id="Filedata_cus_add_'+i+'">\n' +
            '                        <input type="hidden" class="icon" value="">\n' +
            '                    </td>\n' +
            '                    <td><input type="text" class="tit" value="" placeholder="'+langData['siteConfig'][41][100]+'"></td>\n' +//请输入导航名
            '                    <td><input type="text" class="link" value="" placeholder="'+langData['siteConfig'][16][176]+'"></td>\n' +//请输入网址，以http:// 或 https://开头
            '                    <td><a href="javascript:;" class="link del">'+langData['siteConfig'][6][8]+'</a></td>\n' +//删除
            '                </tr>');
        i++;
    });

    //删除
    $('.container').delegate('.del', 'click', function(){
        var t = $(this);
        $.dialog.confirm(langData['siteConfig'][45][60], function(){//确定要删除吗？
            t.closest('tr').remove();
        })
    });

    //保存
    $('#submit').bind('click', function(){
        var t = $(this);

        var data = [];
        var tj  = true;
        $('.container tbody tr').each(function(){
            var t = $(this), icon = t.find('img').attr('data-url'), title = t.find('.tit').val(), url = t.find('.link').val();

            if(icon == ''){
                $.dialog.alert(langData['siteConfig'][21][145]);//请上传图片
                tj = false;
                return false;
            }else if(title == ''){
                $.dialog.alert(langData['siteConfig'][39][0]);//请填写标题
                tj = false;
                return false;
            }else if(url == ''){
                $.dialog.alert(langData['siteConfig'][44][32]);//请填写url
                tj = false;
                return false;
            }else{
                var reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
                var objExp = new RegExp(reg);
                if (objExp.test(url) != true) {
                    $.dialog.alert(langData['siteConfig'][44][29]);//请填写正确的url
                    tj = false;
                    return false;
                }
            }

            data.push(icon+','+title+','+url);
        });
        if(!tj) return false;

        $.ajax({
            url: masterDomain + '/include/ajax.php?service=business&action=updateStoreConfig&custom_nav='+data.join('|'),
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100) {
                    $.dialog({
                        title: langData['siteConfig'][6][39],//保存成功
                        icon: 'success.png',
                        content: langData['siteConfig'][6][39],//保存成功
                        ok: function(){
                            location.reload();
                        }
                    });
                }else{
                    $.dialog.alert(data.info);
                    t.removeAttr('disabled').html(langData['siteConfig'][45][72]);//重新保存
                }
            },
            error: function(){
                $.dialog.alert(langData['siteConfig'][44][23]);//网络错误，请重试
                t.removeAttr('disabled').html(langData['siteConfig'][45][72]);//重新保存
            }
        })

    });

    //上传单张图片
    function mysub(id){
        var t = $("#"+id), p = t.parent(), img = t.parent().children(".img"), uploadHolder = t.siblings('.upfile');

        var data = [];
        data['mod'] = 'siteConfig';
        data['filetype'] = 'image';
        data['type'] = 'logo';

        $.ajaxFileUpload({
            url: "/include/upload.inc.php",
            fileElementId: id,
            dataType: "json",
            data: data,
            success: function(m, l) {
                if (m.state == "SUCCESS") {
                    if(img.length > 0){
                        img.attr('src', m.turl);
                        img.attr('data-url', m.url);

                        delAtlasPic(p.find(".icon").val());
                    }else{
                        p.prepend('<img src="'+m.turl+'" data-url="'+m.url+'" alt="" class="img" style="height:40px;">');
                    }
                    p.find(".icon").val(m.url);

                    uploadHolder.removeClass('disabled').text(langData['siteConfig'][6][59]);//重新上传
                    // saveOpera(1);

                } else {
                    uploadError(m.state, id, uploadHolder);
                }
            },
            error: function() {
                uploadError(langData['siteConfig'][6][203], id, uploadHolder);//网络错误，请重试！
            }
        });

    }

    function uploadError(info, id, uploadHolder){
        $.dialog.alert(info);
        uploadHolder.removeClass('disabled').text(langData['siteConfig'][6][59]);//重新上传
    }

    //删除已上传图片
    var delAtlasPic = function(picpath){
        var g = {
            mod: "siteConfig",
            type: "delLogo",
            picpath: picpath,
            randoms: Math.random()
        };
        $.ajax({
            type: "POST",
            url: "/include/upload.inc.php",
            data: $.param(g)
        })
    };

    $(".container").delegate(".upfile", "click", function(){
        var t = $(this), inp = t.siblings("input");
        if(t.hasClass("disabled")) return;
        inp.click();
    })

    $(".container").delegate(".Filedata", "change", function(){
        if ($(this).val() == '') return;
        $(this).siblings('.upfile').addClass('disabled').text(langData['siteConfig'][45][73]);//正在上传···
        mysub($(this).attr("id"));
    })

})