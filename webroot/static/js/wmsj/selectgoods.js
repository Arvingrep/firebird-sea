/**
 *	@auther denghuawu
 *	@date 2016-5-4
 */


/**
 * 取出店铺的所有商品
 */
function getGoodsList(url,tag)
{
    $('#muti-select').find('input[type="checkbox"]:checked').attr('checked', false);

    if(url && tag){
        $(tag).html('正在为您展现数据，请稍等...');
        var pages = "";
        $.ajax({
            type:'post',
            url:url,
            data:'',
            dataType:'json',
            cache:false,
            success:function(result){
                var tr = '';
                if(result && result['success'] == 1){
                    //
                    if(result['type'] == 'tuangou')
                    {
                        // 如果是团购商品
                        $('.th-unit').text('商品简介');
                        $('.th-type').text('团购价');
                        $('.th-label').text('库存');
                    }
                    if(result['data']){
                        var len = result['data'].length;
                        for(var i=0;i<len;i++){
                            var cls = i%2 == 0 ? 'even' : 'odd';
                            var name = result['data'][i]['name'];
                            var id = result['data'][i]['id'];
                            var img = result['data'][i]['img'];
                            var price = result['data'][i]['price'];
                            var unit = result['data'][i]['unit'];
                            var type_name = result['data'][i]['type_name'];
                            var label = result['data'][i]['label'];
                            if(result['type'] == 'tuangou')
                            {
                                unit = result['data'][i]['des'];
                                type_name = result['data'][i]['tuangouprice'];
                                label = result['data'][i]['store'];
                            }
                            tr += '<tr role="row" class="'+cls+'">\
									<td class="center">\
										<label class="pos-rel">\
											<input type="checkbox"  name="fid" food_id="'+id+'" food_name="'+name+'" food_img="'+ img +'" food_price="'+ price +'" class="ace">\
											<span class="lbl"></span>\
										</label>\
									</td>\
									<td>'+name+'</td>\
									<td>'+unit+'</td>\
									<td>'+result['data'][i]['price']+'</td>\
									<td>'+type_name+'</td>\
									<td class="hidden-480">\
										<span class="label label-sm label-warning">'+label+'</span>\
									</td>\
								</tr>';
                        }
                        pages = get_pages(url,result['page'],result['totalPage'],tag);
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
function get_pages(url,cur_page, total_page,tag) {
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
                result += '<li class="paginate_button active"><a href=javascript:getGoodsList("'+url+'&page='+i+'","'+tag+'")>'+i+'</a></li>';
                var has_prev =  i==1 ? ' disabled ' : '';
                var has_next =  i==total_page ? ' disabled ' : '';
                var pl_i = i+1;
                var re_i = i-1;
                //prev_page = '<li class="paginate_button next '+has_prev+'"><a href=javascript:getGoodsList("'+url+'&page='+re_i+'","'+tag+'")><<</a></li>'
                //next_page = '<li class="paginate_button next '+has_next+'"><a href=javascript:getGoodsList("'+url+'&page='+pl_i+'","'+tag+'")>>></a></li>'
            }else{
                result += '<li class="paginate_button"><a href=javascript:getGoodsList("'+url+'&page='+i+'","'+tag+'")>'+i+'</a></li>';
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
    $.post(get_shop_url, '', function(result){

        if(result && result['success'] == 1){

            var opt = '';

            for(var i=0; i<result['data'].length; i++){

                opt += '<option value="'+ result['data'][i]['id'] +'">'+ result['data'][i]['shopname'] +'</option>';
            }

            $('select[name="select_shop_id"]').html(opt);

            var url = get_food_url+result['data'][0]['id'] ;
            getGoodsList(url,'#food-list');
        }

    },'JSON')

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
        if(is_simgle){
            food =  new Array();
            $('#food-list').find('input[type="checkbox"]:checked').attr('checked',false);
            $(this).attr('checked',true);
        }
        food[food_id] = food_name;
    }
}

/**
 * 显示选择商品列表
 * @param getfoodurl	获取商品列表url
 * @param getshopurl	获取商店列表url
 * @param issimgle		是否单选， issimgle=true为单选
 */
function showSelectGoods(getfoodurl, getshopurl,conSelHandleFuntion,issimgle){

    get_food_url = getfoodurl;
    get_shop_url = getshopurl;
    is_simgle = issimgle;
    food =  new Array();

    showWindow('#modal-wizard');
    getShopList();

    var shop_id = $('select[name="select_shop_id"]').val();

    $('thead').find('input[type="checkbox"]:checked').attr('checked',false);
    $('input[name="fid"]:checked').attr('checked',false);

    if(shop_id > 0){
        var url = get_food_url+shop_id;
        getGoodsList(url,'#food-list');
    }
    // 如果是单选
    if(is_simgle){
        $('#muti-select').hide();
    }

    // 给确定按钮绑定处理函数

    $('#conselected').die().live('click', conSelHandleFuntion);
}


$(function(){

    // 关闭
    $('#icon-remove').click(function(){
        closeWindow('#modal-wizard');
    })
    // 改变店铺
    $('select[name="select_shop_id"]').change(function(){
        var shop_id = $('select[name="select_shop_id"]').val();
        if(shop_id > 0){
            var url = get_food_url;

            url = url+shop_id;
            getGoodsList(url,'#food-list');
        }
    })


    // 搜索
    $('#searchfood').click(function(){
        var keyword = $('input[name="keyword"]').val();
        var shop_id = $('select[name="select_shop_id"]').val();
        if(shop_id > 0){
            var url = get_food_url;
            url = url+shop_id+'&keyword='+keyword;
            getGoodsList(url,'#food-list');
        }
    })
    // 全选
    $('#muti-select').click(function(){

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


})

var selgoodsdiv = "";
selgoodsdiv += "<!-- #选择商品 -->";
selgoodsdiv += "		<div id=\"modal-wizard\" class=\"modal\" style='display:hidden;height: 600px;position:absolute;'>";
selgoodsdiv += "			<div class=\"modal-dialog\">";
selgoodsdiv += "				<div class=\"modal-content\">";
selgoodsdiv += "					<div class=\"table-header\">商品列表<\/div>";
selgoodsdiv += "						<button class=\"btn btn-danger btn-sm pull-left\" data-dismiss=\"modal\" id='icon-remove' style='position:absolute;right:5px;top:2px'>";
selgoodsdiv += "							<i class=\"icon-remove\"><\/i>";
selgoodsdiv += "							关闭";
selgoodsdiv += "						<\/button>";
selgoodsdiv += "					<div class=\"col-xs-12\">";
selgoodsdiv += "			";
selgoodsdiv += "					<!-- div.dataTables_borderWrap -->";
selgoodsdiv += "					<div>";
selgoodsdiv += "						<div id=\"dynamic-table_wrapper\" style='overflow-y: auto;max-height: 541px'";
selgoodsdiv += "							class=\"dataTables_wrapper form-inline no-footer\">";
selgoodsdiv += "							<div class=\"row\">";
selgoodsdiv += "								<div class=\"col-xs-6\">";
selgoodsdiv += "									<div class=\"dataTables_length\" id=\"dynamic-table_length\">";
selgoodsdiv += "										<label>";
selgoodsdiv += "											选择店铺";
selgoodsdiv += "											<select name=\"select_shop_id\" aria-controls=\"dynamic-table\" class=\"form-control input-sm\">";
selgoodsdiv += "											<\/select>";
selgoodsdiv += "										<\/label>";
selgoodsdiv += "									<\/div>";
selgoodsdiv += "								<\/div>";
selgoodsdiv += "								<div class=\"col-xs-6\">";
selgoodsdiv += "									<div id=\"dynamic-table_filter\" class=\"dataTables_filter\">";
selgoodsdiv += "										<label>";
selgoodsdiv += "											<input type=\"input\" class=\"form-control input-sm\" name='keyword' placeholder=\"输入商品名称快速检索\">";
selgoodsdiv += "											<button class=\"btn btn-minier btn-primary\" id='searchfood'>搜索<\/button>										";
selgoodsdiv += "										<\/label>";
selgoodsdiv += "									<\/div>";
selgoodsdiv += "								<\/div>";
selgoodsdiv += "							<\/div>";
selgoodsdiv += "							<table id=\"dynamic-table\"";
selgoodsdiv += "								class=\"table table-striped table-bordered table-hover dataTable no-footer\"";
selgoodsdiv += "								role=\"grid\" aria-describedby=\"dynamic-table_info\">";
selgoodsdiv += "								<thead>";
selgoodsdiv += "									<tr role=\"row\">";
selgoodsdiv += "										<th class=\"center sorting_disabled\" rowspan=\"1\" colspan=\"1\" aria-label=\"\">";
selgoodsdiv += "											<label class=\"pos-rel\" id='muti-select'> ";
selgoodsdiv += "												<input type=\"checkbox\" class=\"ace\"> <span class=\"lbl\"><\/span>";
selgoodsdiv += "											<\/label>";
selgoodsdiv += "										<\/th>";
selgoodsdiv += "										<th class=\"\">商品名称<\/th>";
selgoodsdiv += "										<th class=\"th-unit\">单位<\/th>";
selgoodsdiv += "										<th class=\"\">价格<\/th>";
selgoodsdiv += "										<th class=\"th-type\">分类<\/th>";
selgoodsdiv += "										<th class=\"th-label\">标签<\/th>";
selgoodsdiv += "									";
selgoodsdiv += "									<\/tr>";
selgoodsdiv += "								<\/thead>";
selgoodsdiv += "			";
selgoodsdiv += "								<tbody id='food-list'> <\/tbody>";
selgoodsdiv += "							<\/table>";
selgoodsdiv += "							<div class=\"row\">";
selgoodsdiv += "								<div class=\"col-xs-6\">";
selgoodsdiv += "									<div class=\"dataTables_info\" id=\"dynamic-table_info\" role=\"status\"";
selgoodsdiv += "										aria-live=\"polite\"><\/div>";
selgoodsdiv += "								<\/div>";
selgoodsdiv += "								<div class=\"col-xs-10\">";
selgoodsdiv += "						<button class=\"btn btn-success btn-sm btn-next\" data-last=\"Finish \" id='conselected'style='position: absolute;left: 10px;'>";
selgoodsdiv += "							确定选中";
selgoodsdiv += "							<i class=\"icon-arrow-right icon-on-right\"><\/i>";
selgoodsdiv += "						<\/button>";
selgoodsdiv += "									<div class=\"dataTables_paginate paging_simple_numbers\"";
selgoodsdiv += "										id=\"dynamic-table_paginate\">";
selgoodsdiv += "										<ul class=\"pagination\">";
selgoodsdiv += "											<!-- <li class=\"paginate_button previous disabled\"";
selgoodsdiv += "												aria-controls=\"dynamic-table\" tabindex=\"0\"";
selgoodsdiv += "												id=\"dynamic-table_previous\"><a href=\"#\"><<<\/a><\/li> ";
selgoodsdiv += "												<li class=\"paginate_button active\" aria-controls=\"dynamic-table\"";
selgoodsdiv += "												tabindex=\"0\"><a href=\"#\">1<\/a><\/li>";
selgoodsdiv += "												-->";
selgoodsdiv += "											<li class=\"paginate_button previous disabled\" ><a href=\"javascript:;\"><<<\/a><\/li>";
selgoodsdiv += "											<li class=\"paginate_button next\"><a href=\"javascript:;\">>><\/a><\/li>";
selgoodsdiv += "										<\/ul>";
selgoodsdiv += "									<\/div>";
selgoodsdiv += "								<\/div>";
selgoodsdiv += "							<\/div>";
selgoodsdiv += "						<\/div>";
selgoodsdiv += "					<\/div>";
selgoodsdiv += "				<\/div>";
selgoodsdiv += "";
selgoodsdiv += "					<div class=\"modal-footer wizard-actions\">";
selgoodsdiv += "";
selgoodsdiv += "";
selgoodsdiv += "					<\/div>";
selgoodsdiv += "				<\/div>";
selgoodsdiv += "			<\/div>";
selgoodsdiv += "		<\/div><!-- PAGE CONTENT ENDS -->";
selgoodsdiv += "<!-- #选择商品 end -->";

$('body').append(selgoodsdiv);