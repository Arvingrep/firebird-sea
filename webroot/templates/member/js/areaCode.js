

$(function(){

    // 区域代码
    function pushAreaCode(){


        if($('.areaCodeBox').length && $('.areaCodeBox').is(":visible")){

            var html = [];
            html.push('<div class="areaCodeContainer">');
            html.push('<ul>');
            //国际手机号获取

            $.ajax({
                url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
                type: 'get',
                dataType: 'jsonp',
                success: function(data){
                    if(data && data.state == 100){
                       var phoneList = [], list = data.info;
                       var listLen = list.length;
                       var codeArea = list[0].code;
                       if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                            $('.areaCodeBox a.active').hide();
                            return false;
                       }
                       for(var i=0; i<list.length; i++){
                            phoneList.push('<li data-code="'+list[i].code+'"><span class="code">'+list[i].code+'</span><span class="name">'+list[i].name+'</span></li>');
                       }
                       $('.areaCodeContainer ul').append(phoneList.join(''));
                    }else{
                       $('.areaCodeContainer ul').html('<div class="loading">暂无数据！</div>');
                      }
                },
                error: function(){
                        $('.areaCodeContainer ul').html('<div class="loading">加载失败！</div>');
                    }

            })


            html.push('</ul>');
            html.push('</div>');

            var active = $('.areaCodeBox .active'), width = active.width();

            var style = [];
            style.push('<style>')
            style.push('.areaCodeContainer {display:none;position:absolute;width:'+(width)+'px;max-height:300px;min-width:150px;padding:5px '+(active.outerWidth()-width)/2+'px;background:#fff;border:1px solid #ccc;overflow-y:auto;z-index:10000;}');
            style.push('.areaCodeContainer li {line-height: 25px; padding: 0 5px;}')
            style.push('.areaCodeContainer li:hover {background: #f5f5f5;}')
            style.push('.areaCodeContainer li, .areaCodeBox .active {white-space:nowrap;text-overflow:ellipsis;overflow:hidden;}')
            style.push('.areaCodeContainer .code {float:right;margin-left:10px;}')
            style.push('</style>')

            $('head').append(style.join(""));
            $('body').append(html.join(""));

            var continer = $('.areaCodeContainer');


            $('body').delegate(".areaCodeBox .active", "click", function(e){
                e.stopPropagation();
                if(continer.is(":visible")){
                    continer.hide();
                }else{
                    var t = $(this), left = t.offset().left-1, top = t.offset().top+t.outerHeight();
                    continer.css({'left':left+'px','top':top+'px'}).show();
                }
            })

            // 选择区域
            $('body').delegate(".areaCodeContainer li", "click", function(e){
                e.stopPropagation();
                var t = $(this), code = t.attr('data-code'), txt = t.children('.name').text();;
                active.html('<span class="code">'+code+'</span>');
                $('#areaCode').val(code);
                continer.hide();
            })

            $('body').click(function(e){
                continer.hide();
            })

        }else{
            setTimeout(function(){
                pushAreaCode();
            },1000)
        }

    }

    pushAreaCode();

})
