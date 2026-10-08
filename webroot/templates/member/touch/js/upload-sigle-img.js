$(function(){
    service = service ? service : 'article';
    // 上传图片
    var upObj = [];
    upimg();
    function upimg() {

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
                mod: service,
                params: 'type='+type,
                atlasMax: count,
                deltype: 'del'+type,
                replace: replace,
                fileQueued: function(file){

                },
                uploadSuccess: function(file, response){
                    if(response.state == "SUCCESS"){
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
                            });
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
    // 删除图片
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
        upObj[index].del(path);
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
    $('.up-box').delegate('.remove', 'click', function(e){
        e.stopPropagation();
        var t = $(this);
        delFile(t);
    })

});