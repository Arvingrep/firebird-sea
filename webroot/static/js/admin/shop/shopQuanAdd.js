$(function(){

    jQuery('#Coupon_deadline,#Coupon_etime').datepicker(jQuery.extend({showMonthAfterYear:false},jQuery.datepicker.regional['zh-cn'],{'dateFormat':'yy-mm-dd'}));
    
    $("#productname").bind("input", function(){
    	var t = $(this), val = t.val();
    	if(val != ""){
    		huoniao.operaJson("shopQuan.php?action=checkshop", "keywords="+val, function(data){
    			if(!data) {
					$("#userList").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'" data-title="'+data[i].title+'">'+data[i].title+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#userList").css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12}).html('<ul>'+list.join("")+'</ul>').show();
				}else{
					$("#userList").html("").hide();
				}
    		});
    	}else{
			$("#userList").html("").hide();
		}
    });
    
    $("#userList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id"), title = $(this).attr("data-title");
		$("#productname").val(name);
		$("#product").val(id);
		$("#userList").html("").hide();
		return false;
	});
    
    $(document).click(function (e) {
        var s = e.target;
        if (!jQuery.contains($("#userList").get(0), s)) {
            if (jQuery.inArray(s.id, "user") < 0) {
                $("#userList").hide();
            }
        }
    });
    
    // 切换适用店铺
    var value = $('#shoptype').val();
    if(value == '1'){
        $('#shopidlist').show();
    }else if(value == '0'){
        $('#shopidlist').hide();
    }
    $('#shoptype').on('change',function(){
        var value = $(this).val();
        if(value == '1'){
            $('#shopidlist').show();
        }else if(value == '0'){
            $('#shopidlist').hide();
        }
    });

    // 是否关联商品
    $('#Coupon_is_relation_food').change(function(){
        if(this.value == 1){
            $("#relation_goods").show();
        }else{
            $("#relation_goods").hide();
        }
    })

    // 显示商品列表弹出层
    $("#showSelectGoods").click(function(){
        showSelectGoods();
    })

    // 关闭商品列表
    $('#icon-remove').click(function(){
        closeWindow('#modal-wizard');
    })

    // 改变店铺
    $('select[name="select_shop_id"]').change(function(){
        var shop_id = $('select[name="select_shop_id"]').val();
        if(shop_id > 0){
            getGoodsList(shop_id, 1);
        }
    })

    // 搜索
    $('#searchfood').click(function(){
        var keyword = $('input[name="keyword"]').val();
        var shop_id = $('select[name="select_shop_id"]').val();
        if(shop_id > 0){
            getGoodsList(shop_id, 1, keyword);
        }
    })
    // 全选
    $('body').delegate('#muti-select', 'click', function(){

        if($('#muti-select').find('input[type="checkbox"]').is(':checked')){
            $('#muti-select').find('input[type="checkbox"]').attr('checked', false);
            $('#food-list').find('input[type="checkbox"]:checked').attr('checked', false);
            food = new Array();

        }else{

            $('#muti-select').find('input[type="checkbox"]').attr('checked', true);
            var chs = $('#food-list').find('input[type="checkbox"]');
            $(chs).attr('checked', true);
            food =  new Array();
            for(var i=0; i<chs.length; i++){
                var id = $(chs[i]).attr('food_id');
                var name = $(chs[i]).attr('food_name');
                food[id] = name;
            }
        }
    })

    // 单选
    $('input[name="fid"]').live('click', selectGoods);



    $("#food-form").submit(function(e){
        e.preventDefault();
        var form = $(this), 
            btn = $("#submit"),
            name = $("#Coupon_name"),
            money = $("#Coupon_money"),
            basic_price = $("#Coupon_basic_price"),
            deadline_type = $("#Coupon_deadline_type"),
            validity = $("#Coupon_validity"),
            validity = $("#Coupon_validity"),
            deadline = $("#Coupon_deadline");

        if(name.val() == ''){
            $.dialog.alert("请填写优惠券名称");
            return false;
        }
        if(money.val() == ''){
            $.dialog.alert("请填写优惠券面值");
            return false;
        }
        if(basic_price.val() == ''){
            $.dialog.alert("请填写消费满多少元可用");
            return false;
        }

        btn.attr("disabled",true).text("正在保存");
        $.ajax({
            url: '?dopost=submit',
            type: 'post',
            data: form.serialize(),
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    location.reload();
                }else{
                    $.dialog.alert(data.info);
                    btn.attr("disabled",false).text("保存");
                }
            },
            error: function(){
                $.dialog.alert("网络错误");
                btn.attr("disabled",false).text("保存");
            }
        })
    })

});

var food = [];
var is_relation_food = $('#Coupon_is_relation_food').val();
if(is_relation_food == 1){
    $("#relation_goods").show();
}

function removeFood(obj,id)
{
    $(obj).parent().remove();
}

function conSelHandleFunction(){
    if(food[food.length-1]){
        var tags = $('.tags').html();
        for(i in food){
            if(!isNaN(i)){
                tags += '<span class="tag">'+food[i]+'<button type="button" onClick="removeFood(this,i)" class="close">×</button><input type="hidden" name="fid[]" value="'+i+'"></span>';
            }
        }
        $('.tags').html(tags);
    }

    closeWindow('#modal-wizard');
}

/**
 *  @auther denghuawu
 *  @date 2016-5-4
 */


/**
 * 取出店铺的所有商品
 */
function getGoodsList(sid, page, keywords)
{
    var page = page == undefined ? 1 : page;
    var keywords = keywords == undefined ? "" : keywords;
    $('#muti-select').find('input[type="checkbox"]:checked').attr('checked', false);

    var tag = '#food-list';

    if(sid){
        $(tag).html('<tr><td colspan="6">正在为您展现数据，请稍等...</td></tr>');
        var data = [];
        data.push('sid='+sid)
        data.push('page='+page)
        data.push('keywords='+keywords)
        var pages = "";
        $.ajax({
            type:'post',
            url:'?action=getFoodList',
            data:data.join('&'),
            dataType:'json',
            cache:false,
            success:function(data){
                var tr = '';
                if(data && data.state == 100){

                    var list = data.info.list, len = list.length, html = [];
                    var pageInfo = data.info.pageInfo;

                    if(len > 0){
                        for(var i=0;i<len;i++){
                            var obj = list[i];
                            var cls = i%2 == 0 ? 'even' : 'odd';

                            var name = obj.title;
                            var id = obj.id;
                            var price = obj.price;
                            var unit = obj.unit;
                            var typename = obj.typename ? obj.typename : '';
                            var label = obj.label;

                            tr += '<tr role="row" class="'+cls+'">\
                                    <td class="center">\
                                        <label class="pos-rel">\
                                            <input type="checkbox"  name="fid" food_id="'+id+'" food_name="'+name+'" food_price="'+ price +'" class="ace">\
                                            <span class="lbl"></span>\
                                        </label>\
                                    </td>\
                                    <td>'+name+'</td>\
                                    <td>'+unit+'</td>\
                                    <td>'+price+'</td>\
                                    <td>'+typename+'</td>\
                                    <td class="hidden-480">\
                                        <span class="label label-sm label-warning">'+label+'</span>\
                                    </td>\
                                </tr>';
                        }
                        pages = get_pages(sid, pageInfo.page, pageInfo.totalPage, keywords);
                    }else{
                        tr += '<tr role="row" class="'+cls+'">\
                                    <td class="center" colspan="6">暂无数据</td>\
                            </tr>';
                    }

                }
                $(tag).html(tr);
                $('.pagination').html(pages);
            }
        })
    }
}

/**
 * 分页页码计算
 * @param cur_page
 * @param total_page
 * @returns {String}
 */
function get_pages(sid, cur_page, total_page,tag) {
    var result = "";
    var str = "";
    var prev_page = "";
    var next_page = "";
    var most_pags = 5;
    for(var i = 1; i <= total_page; i++) {
        if(i == 2 && cur_page - most_pags > 1) {
            i = cur_page - most_pags;
        }else if(i == cur_page + most_pags && cur_page + most_pags < total_page) {
            i = total_page - 1;
        }else{
            if(i == cur_page){
                result += '<li class="paginate_button active"><a href=javascript:getGoodsList('+sid+','+i+',"'+tag+'")>'+i+'</a></li>';
                var has_prev =  i==1 ? ' disabled ' : '';
                var has_next =  i==total_page ? ' disabled ' : '';
                var pl_i = i+1;
                var re_i = i-1;
                //prev_page = '<li class="paginate_button next '+has_prev+'"><a href=javascript:getGoodsList("'+url+'&page='+re_i+'","'+tag+'")><<</a></li>'
                //next_page = '<li class="paginate_button next '+has_next+'"><a href=javascript:getGoodsList("'+url+'&page='+pl_i+'","'+tag+'")>>></a></li>'
            }else{
                result += '<li class="paginate_button"><a href=javascript:getGoodsList('+sid+','+i+',"'+tag+'")>'+i+'</a></li>';
            }

        }
    }
    str = prev_page;
    str += result;
    str += next_page;
    return str;
}

/**
 * 获取商铺列表
 */
function getShopList(){
    
    // <!-- <option value=\"0\">全部店铺<\/option> -->";

    $.ajax({
        url: '?action=getShopList&pageSize=999',
        type: 'get',
        dataType: 'json',
        success: function(data){
            if(data && data.state == 100){
                var list = data.info.list, len = list.length;
                if(len > 0){
                    var html = [];
                    for(var i = 0; i < len; i++){
                        var obj = list[i];
                        html.push('<option value="'+ obj.id +'">'+ obj.shopname +'</option>');
                    }
                    $('select[name=select_shop_id]').html(html.join(""));

                    getGoodsList(list[0].id);
                }
            }
        },
        error: function(){
        }
    })

}

/**
 *
 */
function selectGoods()
{
    var food_id = $(this).attr('food_id');
    var food_name = $(this).attr('food_name');

    if(food[food_id]){
        // 反选，如果存在，删除
        food.splice(food_id, 1);
    }else{
        /*if(is_simgle){
            food =  new Array();
            $('#food-list').find('input[type="checkbox"]:checked').attr('checked',false);
            $(this).attr('checked',true);
        }*/
        food[food_id] = food_name;
    }
}

/**
 * 显示选择商品列表
 * @param getfoodurl    获取商品列表url
 * @param getshopurl    获取商店列表url
 * @param issimgle      是否单选， issimgle=true为单选
 */
function showSelectGoods(){

    food =  new Array();

    showWindow("#modal-wizard");

    getShopList();

    // 给确定按钮绑定处理函数
    $('#conselected').die().live('click', conSelHandleFunction);
}


var selgoodsdiv = "";
    selgoodsdiv += "<!-- #选择商品 -->";
    selgoodsdiv += "        <div id=\"modal-wizard\" class=\"modal\" style='display:hidden;height: 600px;position:fixed;'>";
    selgoodsdiv += "            <div class=\"modal-dialog\">";
    selgoodsdiv += "                <div class=\"modal-content\">";
    selgoodsdiv += "                    <div class=\"table-header\">商品列表<\/div>";
    selgoodsdiv += "                        <button class=\"btn btn-danger btn-sm pull-left\" data-dismiss=\"modal\" id='icon-remove' style='position:absolute;right:5px;top:2px'>";
    selgoodsdiv += "                            <i class=\"icon-remove\"><\/i>";
    selgoodsdiv += "                            关闭";
    selgoodsdiv += "                        <\/button>";
    selgoodsdiv += "                    <div class=\"continer\">";
    selgoodsdiv += "            ";
    selgoodsdiv += "                    <!-- div.dataTables_borderWrap -->";
    selgoodsdiv += "                    <div>";
    selgoodsdiv += "                        <div id=\"dynamic-table_wrapper\" style='overflow-y: auto;max-height: 560px'";
    selgoodsdiv += "                            class=\"dataTables_wrapper form-inline no-footer\">";
    selgoodsdiv += "                            <div class=\"row\">";
    selgoodsdiv += "                                <div class=\"col-xs-6\">";
    selgoodsdiv += "                                    <div class=\"dataTables_length\" id=\"dynamic-table_length\">";
    selgoodsdiv += "                                        <label>";
    selgoodsdiv += "                                            选择店铺";
    selgoodsdiv += "                                            <select name=\"select_shop_id\" aria-controls=\"dynamic-table\" class=\"form-control input-sm\">";
    selgoodsdiv += "                                            <\/select>";
    selgoodsdiv += "                                        <\/label>";
    selgoodsdiv += "                                    <\/div>";
    selgoodsdiv += "                                <\/div>";
    selgoodsdiv += "                                <div class=\"col-xs-6\">";
    selgoodsdiv += "                                    <div id=\"dynamic-table_filter\" class=\"dataTables_filter\">";
    selgoodsdiv += "                                        <label>";
    selgoodsdiv += "                                            <input type=\"input\" class=\"form-control input-sm\" name='keyword' placeholder=\"输入商品名称快速检索\" style=\"height:14px;\">";
    selgoodsdiv += "                                            <button class=\"btn btn-minier btn-primary\" id='searchfood'>搜索<\/button>                                       ";
    selgoodsdiv += "                                        <\/label>";
    selgoodsdiv += "                                    <\/div>";
    selgoodsdiv += "                                <\/div>";
    selgoodsdiv += "                            <\/div>";
    selgoodsdiv += "                            <table id=\"dynamic-table\"";
    selgoodsdiv += "                                class=\"table table-striped table-bordered table-hover dataTable no-footer\"";
    selgoodsdiv += "                                role=\"grid\" aria-describedby=\"dynamic-table_info\">";
    selgoodsdiv += "                                <thead>";
    selgoodsdiv += "                                    <tr role=\"row\">";
    selgoodsdiv += "                                        <th class=\"center sorting_disabled\" rowspan=\"1\" colspan=\"1\" aria-label=\"\">";
    selgoodsdiv += "                                            <label class=\"pos-rel\" id='muti-select'> ";
    selgoodsdiv += "                                                <input type=\"checkbox\" class=\"ace\"> <span class=\"lbl\"><\/span>";
    selgoodsdiv += "                                            <\/label>";
    selgoodsdiv += "                                        <\/th>";
    selgoodsdiv += "                                        <th class=\"\">商品名称<\/th>";
    selgoodsdiv += "                                        <th class=\"th-unit\">单位<\/th>";
    selgoodsdiv += "                                        <th class=\"\">价格<\/th>";
    selgoodsdiv += "                                        <th class=\"th-type\">分类<\/th>";
    selgoodsdiv += "                                        <th class=\"th-label\">标签<\/th>";
    selgoodsdiv += "                                    ";
    selgoodsdiv += "                                    <\/tr>";
    selgoodsdiv += "                                <\/thead>";
    selgoodsdiv += "            ";
    selgoodsdiv += "                                <tbody id='food-list'> <\/tbody>";
    selgoodsdiv += "                            <\/table>";
    selgoodsdiv += "                            <div class=\"row\">";
    selgoodsdiv += "                                <div class=\"col-xs-6\">";
    selgoodsdiv += "                                    <div class=\"dataTables_info\" id=\"dynamic-table_info\" role=\"status\"";
    selgoodsdiv += "                                        aria-live=\"polite\"><\/div>";
    selgoodsdiv += "                                <\/div>";
    selgoodsdiv += "                                <div class=\"col-xs-10\">";
    selgoodsdiv += "                        <button class=\"btn btn-success btn-sm btn-next\" data-last=\"Finish \" id='conselected'style='position: absolute;left: 10px;'>";
    selgoodsdiv += "                            确定选中";
    // selgoodsdiv += "                            <i class=\"icon-arrow-right icon-on-right\"><\/i>";
    selgoodsdiv += "                        <\/button>";
    selgoodsdiv += "                                    <div class=\"dataTables_paginate paging_simple_numbers\"";
    selgoodsdiv += "                                        id=\"dynamic-table_paginate\">";
    selgoodsdiv += "                                        <ul class=\"pagination\">";
    selgoodsdiv += "                                            <!-- <li class=\"paginate_button previous disabled\"";
    selgoodsdiv += "                                                aria-controls=\"dynamic-table\" tabindex=\"0\"";
    selgoodsdiv += "                                                id=\"dynamic-table_previous\"><a href=\"#\"><<<\/a><\/li> ";
    selgoodsdiv += "                                                <li class=\"paginate_button active\" aria-controls=\"dynamic-table\"";
    selgoodsdiv += "                                                tabindex=\"0\"><a href=\"#\">1<\/a><\/li>";
    selgoodsdiv += "                                                -->";
    selgoodsdiv += "                                            <li class=\"paginate_button previous disabled\" ><a href=\"javascript:;\"><<<\/a><\/li>";
    selgoodsdiv += "                                            <li class=\"paginate_button next\"><a href=\"javascript:;\">>><\/a><\/li>";
    selgoodsdiv += "                                        <\/ul>";
    selgoodsdiv += "                                    <\/div>";
    selgoodsdiv += "                                <\/div>";
    selgoodsdiv += "                            <\/div>";
    selgoodsdiv += "                        <\/div>";
    selgoodsdiv += "                    <\/div>";
    selgoodsdiv += "                <\/div>";
    selgoodsdiv += "";
    selgoodsdiv += "                    <div class=\"modal-footer wizard-actions\">";
    selgoodsdiv += "";
    selgoodsdiv += "";
    selgoodsdiv += "                    <\/div>";
    selgoodsdiv += "                <\/div>";
    selgoodsdiv += "            <\/div>";
    selgoodsdiv += "        <\/div><!-- PAGE CONTENT ENDS -->";
    selgoodsdiv += "<!-- #选择商品 end -->";
$('body').append(selgoodsdiv);



/* function */
function showWindow(tag)
{
    $(tag).show();
    // 遮罩
    var div = "<div class='modal-backdrop in' id='zhezhao' style='z-index:100;'></div>";
    $('body').append(div);
}

function closeWindow(tag)
{
    $(tag).hide();
    // 遮罩
    $('#zhezhao').remove();
}