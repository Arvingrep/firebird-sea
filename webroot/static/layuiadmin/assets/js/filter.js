/*综合搜索js模拟select*/
        //点击其余区域关闭选择框
        $(document).click(function(event) {
            //console.log(event)
            if($(event.target).parents('.analog-dropdown').length != 0){
                $(event.target).parents('.analog-dropdown').siblings('.analog-dropdown').find('.sel-box').hide();
                $(event.target).siblings('.sel-box').toggle();
            }else{
                $('.analog-dropdown .sel-box').hide();
            }
        });
        
        //单选
        $(document).on('click', '.analog-dropdown .js-sincheck', function(event) {
            event.preventDefault();
            var selId = $(this).data('id');
            var selTxt = $(this).text();
            if($(this).parents('.secsel-box').length == 0){
                //选一级
                $(this).parents('.analog-dropdown').find('.fri-selid').val(selId)
                $(this).parents('.analog-dropdown').find('.sec-selid').val('')
            }else{
                //选二级
                var selParentId = $(this).parents('.secsel-box').siblings('span').data('id');
                selParentId = selParentId?selParentId:''
                $(this).parents('.analog-dropdown').find('.fri-selid').val(selParentId)
                $(this).parents('.analog-dropdown').find('.sec-selid').val(selId)
            }

            //如果搜索匹配同时存在，单选的同时清空搜索匹配的值
            $(this).parents('.analog-dropdown').find('.search-input').val('')
            $(this).parents('.analog-dropdown').find('.n_inphid').val('')

            //显示删除
            $(this).parents('.analog-dropdown').find('.txt-box').hide();
            if($(this).parents('.analog-dropdown').find('.txt-box1').length == 0){
                $(this).parents('.analog-dropdown').prepend('<span class="txt-box1">'+selTxt+'<i class="shanchu"></i></span>')
            }else{
                $(this).parents('.analog-dropdown').find('.txt-box1').html(selTxt+'<i class="shanchu"></i>')
            }
            //选择框隐藏
            $(this).parents('.analog-dropdown').find('.sel-box').hide();

            //请求数据
            jlTableAjax(1,'')
        });

        //多选确定
        $(document).on('click', '.analog-dropdown .js-certain', function(event) {
            event.preventDefault();

            var checkVals = '',checkTxts = '';
            $(this).parents('.analog-dropdown').find('.js-mulcheck').each(function () {
                //获取当前元素的勾选状态
                if ($(this).prop("checked")) {
                    checkVals = checkVals + $(this).val() + ",";
                    checkTxts = checkTxts + $(this).siblings('span').text() + ",";
                }
            });

            //去最后的逗号
            checkVals = checkVals.substring(0, checkVals.length - 1);
            checkTxts = checkTxts.substring(0, checkTxts.length - 1);

            //赋值
            $(this).parents('.analog-dropdown').find('.js-mulHidden').val(checkVals)

            //显示删除
            if(checkVals != ''){
                $(this).parents('.analog-dropdown').find('.txt-box').hide();
                if($(this).parents('.analog-dropdown').find('.txt-box1').length == 0){
                    $(this).parents('.analog-dropdown').prepend('<span class="txt-box1">'+checkTxts+'<i class="shanchu"></i></span>')
                }else{
                    $(this).parents('.analog-dropdown').find('.txt-box1').html(checkTxts+'<i class="shanchu"></i>')
                }
            }else{
                $(this).parents('.analog-dropdown').find('.txt-box').show();
                $(this).parents('.analog-dropdown').find('.txt-box1').remove();
            }

            //选择框隐藏
            $(this).parents('.analog-dropdown').find('.sel-box').hide();

            //请求数据
            jlTableAjax(1,'')
        });

        //数据范围输入框确定
        $(document).on('click', '.analog-dropdown .js-inp-certain', function(event) {
            event.preventDefault();
            var _this = $(this);
            var flag = true;
            //范围段最小值小于最大值判断
            $(this).parents('.analog-dropdown').find('.inp-li').each(function(index, el) {
                var lowTxt = $.trim($(this).find('.js-lowtxt').val());
                var heiTxt = $.trim($(this).find('.js-heitxt').val());
                if(lowTxt != '' && heiTxt != '' && $(this).find('.js-lowtxt').hasClass('js-datetime')){
                    //时间插件
                    console.log('js-datetime')
                    if(lowTxt > heiTxt){
                        layer.msg('最小值应小于最大值');
                        $(this).find('.js-lowtxt').focus();
                        flag = false;
                        return false;
                    }
                }else if(lowTxt != '' && heiTxt != ''){
                    if(Number(lowTxt) > Number(heiTxt)){
                        layer.msg('最小值应小于最大值');
                        $(this).find('.js-lowtxt').focus();
                        flag = false;
                        return false;
                    }
                }
            });
            if(flag == false){
                return false;
            }
            if(flag){
                //拼显示内容
                var rangeTxt = '';
                $(this).parents('.analog-dropdown').find('.inp-li').each(function(index, el) {
                    if($(this).find('.js-lowtxt').length != 0 && $(this).find('.js-heitxt').length != 0){
                        //范围段
                        var lefTxt = $(this).find('.lef-txt').text();
                        var lowTxt = $(this).find('.js-lowtxt').val();
                        var heiTxt = $(this).find('.js-heitxt').val();
                        var unitTxt = $(this).find('.unit').text();
                        if(heiTxt == '' && lowTxt != ''){
                            //只有最小值
                            rangeTxt = rangeTxt + lefTxt  + lowTxt + unitTxt + '以上' + ',';
                        }else if(lowTxt == '' && heiTxt != ''){
                            //只有最大值
                            rangeTxt = rangeTxt + lefTxt  + heiTxt + unitTxt + '以下' + ',';
                        }else if(lowTxt == '' && heiTxt == ''){
                            //都为空
                            rangeTxt = rangeTxt + '';
                        }else{
                            //都有值
                            rangeTxt = rangeTxt + lefTxt + lowTxt + '-' + heiTxt + unitTxt + ',';
                        }
                    }else{
                        //整段
                        var lefTxt = $(this).find('.lef-txt').text();
                        var wholeTxt = $(this).find('.js-wholetxt').val();
                        var unitTxt = $(this).find('.unit').text()?$(this).find('.unit').text():'';
                        console.log(wholeTxt)
                        if(wholeTxt == ''){
                            //为空
                            rangeTxt = rangeTxt + '';
                        }else{
                            //不为空
                            rangeTxt = rangeTxt + lefTxt + wholeTxt + unitTxt + ',';
                        }
                    }
                })
                rangeTxt = rangeTxt.substring(0, rangeTxt.length - 1);
                //显示删除
                //console.log(rangeTxt)
                if(rangeTxt != ''){
                    $(this).parents('.analog-dropdown').find('.txt-box').hide();
                    if($(this).parents('.analog-dropdown').find('.txt-box1').length == 0){
                        $(this).parents('.analog-dropdown').prepend('<span class="txt-box1">'+rangeTxt+'<i class="shanchu"></i></span>')
                    }else{
                        $(this).parents('.analog-dropdown').find('.txt-box1').html(rangeTxt+'<i class="shanchu"></i>')
                    }
                }else{
                    $(this).parents('.analog-dropdown').find('.txt-box').show();
                    $(this).parents('.analog-dropdown').find('.txt-box1').remove();
                }

                //选择框隐藏
                $(this).parents('.analog-dropdown').find('.sel-box').hide();
                //请求数据
                jlTableAjax(1,'')
            }
        });

        //不限
        $(document).on('click', '.analog-dropdown .js-unlimit', function(event) {
            event.preventDefault();
            //清空值
            $(this).parents('.analog-dropdown').find('.js-mulHidden').val('')
            $(this).parents('.analog-dropdown').find('.js-mulcheck').prop("checked",false);
            $(this).parents('.analog-dropdown').find('.inp-txt').val('')

            //回复原状态
            $(this).parents('.analog-dropdown').find('.txt-box').show();
            $(this).parents('.analog-dropdown').find('.txt-box1').remove();

            //选择框隐藏
            $(this).parents('.analog-dropdown').find('.sel-box').hide();

            //请求数据
            jlTableAjax(1,'')
        });

        //删除
        $(document).on('click', '.analog-dropdown .shanchu', function(event) {
            //清空值
            var defVal = $(this).parents('.analog-dropdown').find('.firsel-box').data('default');
            defVal = defVal?defVal:'';
            console.log(defVal)
            $(this).parents('.analog-dropdown').find('input[type=hidden]').val('')
            $(this).parents('.analog-dropdown').find('.fri-selid').val(defVal)
            $(this).parents('.analog-dropdown').find('.search-input').val('')
            $(this).parents('.analog-dropdown').find('.inp-txt').val('')
            $(this).parents('.analog-dropdown').find('.js-signdate').val('')
            $(this).parents('.analog-dropdown').find('.js-mulcheck').prop("checked",false);
            //回复原状态
            $(this).parents('.analog-dropdown').find('.txt-box').show();
            $(this).parents('.analog-dropdown').find('.txt-box1').remove();

            //请求数据
            jlTableAjax(1,'')
        });

        //重置
        $(document).on('click', '.js-clearall', function(event) {
            resetValue()
        });

        //select优化为搜索框
        $(document).on("focus", '.n_li_search .search-input',function(event,title) {
            //显示
            $(this).parents('.n_li_search').find('ol').show()
        }).on("keyup", '.n_li_search .search-input',function(event,title) {
            if($(this).parents('.analog-dropdown').hasClass('js-ajax')){
                //li内多个文本，匹配tit的值
                return false;
            }else{
                //匹配
                var _this = $(this)
                var val = $.trim($(this).val())
                $(this).parents('.n_li_search').find('li').hide()
                $(this).parents('.n_li_search').find("li").each(function() {
                    if ($(this).text().indexOf(val) >= 0 && val != "") {
                        $(this).show()
                    } else if (val === "") {
                        _this.parents('.n_li_search').find("li").show()
                    }
                })
            }
        });
        //赋值
        $(document).on('click', '.n_li_search li', function(event) {
            if($(this).hasClass('js-titbox')){
                return false;
            }
            //li内单个文本
            $(this).parents('.n_li_search').find(".search-input").val($.trim($(this).text()))
            $(this).parents('.n_li_search').find(".n_inphid").val($(this).attr("data-id"))
            $(this).parents('.n_li_search').find("ol").hide()

            if($(this).parents('.analog-dropdown').hasClass('js-normal')){
                //普通下拉匹配
                return false;
            }
            //如果单选同时存在，搜索匹配的同时清空单选一二级的值
            $(this).parents('.analog-dropdown').find('.fri-selid').val('')
            $(this).parents('.analog-dropdown').find('.sec-selid').val('')

            //显示删除
            $(this).parents('.analog-dropdown').find('.txt-box').hide();
            if($(this).parents('.analog-dropdown').find('.txt-box1').length == 0){
                $(this).parents('.analog-dropdown').prepend('<span class="txt-box1">'+$.trim($(this).text())+'<i class="shanchu"></i></span>')
            }else{
                $(this).parents('.analog-dropdown').find('.txt-box1').html($.trim($(this).text())+'<i class="shanchu"></i>')
            }

            //选择框隐藏
            $(this).parents('.analog-dropdown').find('.sel-box').hide();

            //请求数据
            jlTableAjax(1,'')
        })
        //点击其余位置隐藏
        $(document).click(function(event) {
            if($(event.target).parents('.n_li_search').length == 0){
                $('.n_li_search').find('ol').hide();
            }
        })
        //回填
        $(".n_inphid").each(function(index, el) {
            var _this = $(this);
            if($(this).val()!=''){
                $(this).parents(".n_li_search").find("li").each(function() {
                    if($(this).attr("data-id")==_this.val()){
                        _this.parents(".n_li_search").find(".search-input").val($(this).text())
                    }
                })
            }    
        });
        //一级、二级、多选、时间插件回填
        !(function(){
            var bool = false;
            $('.analog-dropdown').each(function(index, el) {
                var _this = $(this);
                //type 1一级 2二级 3多选 4时间
                var type = 0,text = '',_style ='';
                if(_this.find('.fri-selid').length){
                    type=1;
                }
                if(_this.find('.sec-selid').length){
                    type=2;
                }
                if(_this.find('.js-mulHidden').length){
                    type =3;
                }
                if(_this.find('.js-signdate').length){
                    type=4;
                }
                if(type==1 && _this.find('.fri-selid').val()!='' && _this.find('.fri-selid').val() != _this.find('.firsel-box').data('default')){
                    var id = _this.find('.fri-selid').val();
                    bool = true;
                    text = _this.find('.js-sincheck[data-id='+id+']').text();
                }
                if(type==2 && _this.find('.fri-selid').val()!='' && _this.find('.fri-selid').val() != _this.find('.firsel-box').data('default')){
                    var id = _this.find('.fri-selid').val();
                    var id2 = _this.find('.sec-selid').val();
                    bool = true;
                    if(id2){
                        text = _this.find('span[data-id='+id+']').siblings('ol').find('.js-sincheck[data-id='+id2+']').text()
                    }else{
                        text = _this.find('.js-sincheck[data-id='+id+']').text();
                    }
                }
                if(type==3 && _this.find('.js-mulHidden').val()){
                    var arr = _this.find('.js-mulHidden').val().split(',');
                    bool = true;
                    for(var i=0;i<arr.length;i++){
                        for(j=0;j<_this.find('.li1').length;j++){
                            var item =_this.find('.li1').eq(j);
                            if(arr[i]==item.find('.js-mulcheck').val()){
                                if(text!='') text+=',';
                                text+=item.find('span').text();
                            }
                        }
                    }
                }
                if(type==4 && _this.find('.js-signdate').val()){
                    _style = ' style="width:220px;"'
                    bool = true;
                    var text = _this.find('.js-signdate').val();
                }
                if(text){
                    var str ='<span class="txt-box1"+'+_style+'>'+text+'<i class="shanchu"></i></span>';
                    _this.find('.txt-box').hide().before(str);
                }
                /*if(index == $('.analog-dropdown').length-1 && bool){
                    setTimeout(function(){
                        if(jlTableAjax){jlTableAjax();}
                    },200)
                }*/
            });
        }())
        //重置
        function resetValue(){
            var bool = false;
            location.reload();
            $('.js-search-match-box').each(function(){
                var _this = $(this);
                if(_this.find('.search-input').val()){
                    bool = true;
                    _this.find('.search-input').val('');
                    _this.find('.search-type').val('');
                }
                if($('.analog-dropdown').length==0){
                    setTimeout(function(){
                        jlTableAjax();
                    },200)
                }
            })
            $('.analog-dropdown').each(function(index, el) {
                var _this = $(this);
                //type 1一级 2二级 3多选 4时间
                var type = 0,text = '',_style ='';
                if(_this.find('.fri-selid').length){
                    type =1;
                }
                if(_this.find('.sec-selid').length){
                    type =2;
                }
                if(_this.find('.js-mulHidden').length){
                    type =3;
                }
                if(_this.find('.js-signdate').length){
                    type=4;
                }
                if(type==1 && _this.find('.fri-selid').val()!='' && _this.find('.fri-selid').val() != _this.find('.firsel-box').data('default')){
                    var val = _this.find('.firsel-box').data('default');
                    bool = true;
                    _this.find('.fri-selid').val(val)
                }
                if(type==2 && _this.find('.fri-selid').val()!='' && _this.find('.fri-selid').val() != _this.find('.firsel-box').data('default')){
                    var val = _this.find('.firsel-box').data('default');
                    bool = true;
                    _this.find('.fri-selid').val(val)
                    _this.find('.sec-selid').val('')
                }
                if(type==3 && _this.find('.js-mulHidden').val()){
                    bool = true;
                    _this.find('.js-mulHidden').val('')
                }
                if(type==4 && _this.find('.js-signdate').val()){
                    bool = true;
                    _this.find('.js-signdate').val('')
                }
                _this.find('.txt-box1').remove();
                _this.find('.txt-box').show();
                if(index == $('.analog-dropdown').length-1 && bool){
                    setTimeout(function(){
                        jlTableAjax();
                    },200)
                }
            });
        }
        //范围段select优化为搜索框
        $(".range_li_search .inp-txt").focus(function(event) {
            //显示
            $('.range_li_search').find('ol').hide();
            $(this).parents('.range_li_search').find('ol').show()
        }).keyup(function() {
            //匹配
            var _this = $(this)
            var val = $.trim($(this).val())
            $(this).parents('.range_li_search').find('li').hide()
            $(this).parents('.range_li_search').find("li").each(function() {
                if ($(this).text().indexOf(val) >= 0 && val != "") {
                    $(this).show()
                } else if (val === "") {
                    _this.parents('.range_li_search').find("li").show()
                }
            })
        })
        //赋值
        $(".range_li_search li").click(function() {
            $(this).parents('.inp-li').find(".js-lowtxt").val($.trim($(this).data("min")))
            $(this).parents('.inp-li').find(".js-heitxt").val($.trim($(this).data("max")))
            $(this).parents('.range_li_search').find("ol").hide()
        })
        //隐藏
        $(document).click(function(event) {
            if($(event.target).parents('.range_li_search').length == 0){
                $('.range_li_search').find('ol').hide();
            }
        })
        $('.secsel-box').each(function(index, el) {
            $(this).parents('.firsel-box').css('overflow', 'unset');
        });

        //搜索框匹配
        $('.js-search-match-box .search-input').focus(function(event) {
            //显示
            $(this).siblings('.js-search-match').show();
        }).on('input',function() {
            //获取输入值
            var _this = $(this)
            var val = $.trim($(this).val())
            $(this).siblings('.js-search-match').find('.js-txt').text(val)
            if(val == ''){
                //如果值为空，匹配框隐藏
                $(this).siblings('.js-search-match').hide();
            }else{
                //如果值不为空，匹配框显示，插入值
                $(this).siblings('.js-search-match').show();
                $(this).siblings('.js-search-match').find('.js-txt').text(val)

            }
        });
        //隐藏
        $(document).click(function(event) {
            if($(event.target).parents('.js-search-match-box').length == 0){
                $('.js-search-match').hide();
            }
        })
        //点击匹配行搜索请求
        $(document).on('click', '.js-search-match a', function(event) {
            event.preventDefault();
            var typeId = $(this).data('id')
            var batchVal = $.trim($(this).find('.js-txt').text())
            $(this).parents('.js-search-match').siblings('.search-type').val(typeId)
            if($(this).attr('class') == 'js-cancel'){
                //取消
                $(this).parents('.js-search-match').find('.js-txt').text('')
                $(this).parents('.js-search-match').siblings('.search-input').val('')
                $(this).parents('.js-search-match').siblings('.search-type').val('')
                $(this).parents('.js-search-match').hide();
            }else{
                //点击搜索
                if(batchVal == ''){
                    layer.msg('搜索内容不能为空')
                    return false;
                }
            }
            var searchJson = {
                typeId:typeId,
                batchVal:batchVal
            }
            $(this).parents('.js-search-match').hide();
            jlTableAjax(3,searchJson);
            
        });
        $('.js-signdate-certain').on('click', function () {
            var divsection = $(this).parents('.analog-dropdown');
            var txtname = $(divsection).find('.lef-txt').html();
            if ($(divsection).find('.txt-box1').length > 0) {
                $(divsection).find('.txt-box1').remove();
            }
            var seldate = $(divsection).find('input.js-signdate').val();
            if (seldate.length > 0) {
                var showspan = '<span class="txt-box1" style="width:220px;">' + seldate + '<i class="shanchu"></i></span>';
                $(divsection).find('.txt-box').hide();
                $(divsection).find('.sel-box').hide();
                $(divsection).prepend(showspan);
                jlTableAjax();
            } else {
                layer.msg('请选择日期范围', { icon: 0 });
            }
        });
        $('.js-signdate-clear').on('click', function () {
            var divsection = $(this).parents('.analog-dropdown');
            $(divsection).find('input.js-signdate').val('');
            $(divsection).find('.txt-box1').remove();
            $(divsection).find('.txt-box').show();
            $(divsection).find('.sel-box').hide();
            jlTableAjax();
        });