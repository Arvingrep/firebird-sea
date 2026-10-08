<?php
/**
 * 打印机小票模板自定义
 *
 * @version        $Id: printTemplate.php 2020-08-26 下午17:51:36 $
 * @package        HuoNiao
 * @copyright      Copyright (c) 2013 - 2020, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
require_once('./common.inc.php');
header("Content-Type: text/html; charset=utf-8");
global $dsql;

if($module == 'waimai'){

    $template = array();
    if ($printid && $sid){
        $printsql = $dsql->SetQuery("SELECT `printtemplate` FROM `#@__business_shop_print` WHERE `sid` = '$sid'  AND `id` = '$printid' AND `service` = 'waimai' ");
        $printret = $dsql->dsqlOper($printsql,"results");
        $template =  $printret[0]['printtemplate'] ? unserialize($printret[0]['printtemplate']) : array();
    }else{
        //打印机模板

        $template = $_GET['template'];
        if(!empty($template)){

            $template = json_decode($template, true);

            //系统默认
        }else{
            include(HUONIAOINC . '/config/waimai.inc.php');
            $template = $customPrintTemplate ? unserialize($customPrintTemplate) : array();
        }
    }


	//默认模板
	if(empty($template) || !is_array($template)){
		$template = array(
			'title' => array(
				'shopname' => array(
					'state' => 1,
					'style' => 'center h2w2 line'
				),
				'titlecustom' => array(
					'state' => 0,
					'style' => 'center line',
					'value' => '自定义文字'
				)
			),
			'info' => array(
				'ordernum' => array(
					'state' => 1,
					'style' => ''
				),
				'ordertime' => array(
					'state' => 1,
					'style' => ''
				),
				'orderaddress' => array(
					'state' => 1,
					'style' => ''
				),
				'orderpeople' => array(
					'state' => 1,
					'style' => ''
				),
				'ordertel' => array(
					'state' => 1,
					'style' => 'line'
				),
				'note' => array(
					'state' => 1,
					'style' => 'h2w2 line'
				)
			),
			'menu' => array(
				'menutitle' => array(
					'state' => 1,
					'style' => ''
				),
				'menulist' => array(
					'state' => 1,
					'style' => 'line h2w1'
				)
			),
			'price' => array(
				'pricelist' => array(
					'state' => 1,
					'style' => 'line'
				),
				'amount' => array(
					'state' => 1,
					'style' => 'h2w2 center'
				)
			),
			'footer' => array(
				'qr' => array(
					'state' => 0,
					'style' => ''
				),
				'footercustom' => array(
					'state' => 0,
					'style' => 'center',
					'value' => '自定义文字'
				)
			)
		);
	}

}
?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=EDGE">
<title>小票样式DIY自定义</title>
<link rel="stylesheet" href="/static/css/core/base.css?v=<?php echo $cfg_staticVersion;?>" />
<script type="text/javascript" src="/static/js/core/jquery-1.8.3.min.js?v=<?php echo $cfg_staticVersion;?>" ></script>
<style>
body {padding: 10px; background-color: #f1f1f1;}
.left {display: inline-block; width: 300px; margin-right: 10px; vertical-align: top;}
.left .item {margin-bottom: 15px; background-color: #f9fafb;}
.left .item h3 {padding: 6px 0; height: 22px; font-size: 16px; font-weight: normal; background-color: #fff; line-height: 20px;}
.left .item h3 span {padding-left: 10px; border-left: 2px solid #0073FF;}
.left .item .list {border: none; margin: 1em; padding: 5px 5px 5px 5px; font-size: 12px;}
.left .item .list .li {display: inline-block; position: relative; width: 29%; margin-right: 6px; padding: 1px; background-color: #fff; cursor: pointer; margin-bottom: 10px;}
.left .item .list .li:hover, .left .item .list .li.hover {outline: 1px solid #0073ff;}
.left .item .list .li span {display: block; text-align: center; padding: 10px 0; line-height: 1.5em; position: relative; margin: 0; border: 1px solid #d5d5d5; background-color: #f5f5f5; border-radius: 5px;}
.left .item .list .li.active span {background-color: #0073ff; color: #fff; position: relative;}
.left .item .list .li.active:after {content: "√"; position: absolute; top: 2px; right: 2px; font-size: 18px; font-weight: 700; line-height: 12px; color: #fff; font-family: 'PingFang SC', 'Myriad Pro', 'Hiragino Sans GB', SimHei;}

.preview {display: inline-block; width: 360px; vertical-align: top; background-color: #fff;}
.preview h3 {height: 32px; line-height: 32px; background-color: #666; font-size: 14px; font-weight: normal; color: #fff; padding-left: 20px;}
.preview .detail {padding: 15px;}
.list3 span {display: inline-block;}
.list3 .l1 {width: 210px;}
.list3 .l2, .list3 .l3 {width: 55px; text-align: right; transform-origin: right center;}
.list2 .l1 {width: 250px; display: inline-block;}
.list2 .l2 {width: 75px; display: inline-block; text-align: right;}
.list2 .l2 span {transform-origin: right center;}

.pitem {line-height: 20px; display: none;}
.pitem:hover, .pitem.hover {outline: 1px solid #888!important;}
.pitem.active {background-color: #ffe14b; outline: 1px solid #fec97a;}
.pitem span {display: inline-block;}
.center {text-align: center;}
.right {text-align: right;}
.h2w2, .h2w1 {line-height: 40px;}
.h2w2 span {transform: scale(2, 2); line-height: 1; transform-origin: left center;}
.h2w2.center span {transform-origin: center center;}
.h2w2.right span {transform-origin: right center;}
.h2w1 span {transform: scale(1, 2); line-height: 1;}
.h1w2 span {transform: scale(2, 1); transform-origin: left center;}
.h1w2.center span {transform: scale(2, 1); transform-origin: center;}
.h1w2.right span {transform-origin: right center;}
.line {border-bottom: 1px dashed #333; padding-bottom: 5px; margin-bottom: 5px;}
.custom {min-height: 20px;}
.custom span {min-width: 100px;}
.pitem img {width: 40%; display: block; margin: 0 auto;}

.edit {position: fixed; top: 10px; right: 10px; width: 180px;}
.edit h3 {height: 32px; margin-bottom: 0; line-height: 32px; position: relative; background-color: #666; font-size: 14px; font-weight: normal; color: #fff; padding-left: 20px;}
.edit .detail {color: #fff; line-height: 30px; padding: 5px 10px 10px; background: rgba(0,0,0,0.3);}
.edit .detail .item {padding-bottom: 10px; border-bottom: 1px solid #999; margin-top: 5px;}
.edit .detail .item li {padding-left: 5px; cursor: pointer; position: relative;}
.edit .detail .item li:hover {text-decoration: underline;}
.edit .detail .font-edit li, .edit .detail .align-edit li {padding-left: 25px;}
.edit .detail .font-edit li.active {font-weight: 700;}
.edit .detail .font-edit li s, .edit .detail .align-edit li s {position: absolute; top: 7px; left: 0; width: 15px; height: 15px; background: #fff; border-radius: 500rem; border: 1px solid #d4d4d5; line-height: 15px; text-align: center; font-size: 0; text-decoration: none;}
.edit .detail .font-edit li.active s, .edit .detail .align-edit li.active s {border-color: #2e7bfd; font-size: 14px; color: #2e7bfd; font-weight: 700;}
</style>
</head>

<body>
<div class="left">
	<div class="item">
		<h3><span>标题</span></h3>
		<div class="list" data-type="title">
			<div class="li" data-type="shopname"><span>店铺名称</span></div>
			<div class="li" data-type="titlecustom"><span>自定义文字</span></div>
		</div>
	</div>
	<div class="item">
		<h3><span>基础信息</span></h3>
		<div class="list" data-type="info">
			<div class="li" data-type="ordernum"><span>订单号</span></div>
			<div class="li" data-type="ordertime"><span>时间</span></div>
			<div class="li" data-type="orderaddress"><span>地址</span></div>
			<div class="li" data-type="orderpeople"><span>姓名</span></div>
			<div class="li" data-type="ordertel"><span>电话</span></div>
			<div class="li" data-type="note"><span>备注</span></div>
		</div>
	</div>
	<div class="item">
		<h3><span>菜品信息</span></h3>
		<div class="list" data-type="menu">
			<div class="li" data-type="menutitle"><span>表头</span></div>
			<div class="li" data-type="menulist"><span>菜单</span></div>
		</div>
	</div>
	<div class="item">
		<h3><span>结算信息</span></h3>
		<div class="list" data-type="price">
			<div class="li" data-type="pricelist"><span>费用明细</span></div>
			<div class="li" data-type="amount"><span>实收合计</span></div>
		</div>
	</div>
	<div class="item">
		<h3><span>底栏</span></h3>
		<div class="list" data-type="footer">
			<div class="li" data-type="qr"><span>二维码</span></div>
			<div class="li" data-type="footercustom"><span>自定义文字</span></div>
		</div>
	</div>
</div>
<div class="preview">
	<h3>样式预览</h3>
	<div class="detail">
		<div class="p-title" data-type="title">
			<div class="pitem" data-type="shopname"><span>店铺名称 #1</span></div>
			<div class="pitem custom" data-type="titlecustom"><span contenteditable="true">自定义文字</span></div>
		</div>
		<div class="p-info" data-type="info">
			<div class="pitem" data-type="ordernum"><span>订单号：20200727-1</span></div>
			<div class="pitem" data-type="ordertime"><span>时间：2020-07-27 13:30:28</span></div>
			<div class="pitem" data-type="orderaddress"><span>地址：领汇广场1幢1207室</span></div>
			<div class="pitem" data-type="orderpeople"><span>姓名：郭先生</span></div>
			<div class="pitem" data-type="ordertel"><span>电话：15006210000</span></div>
			<div class="pitem" data-type="note">
				<span>不要葱！不要香菜！谢谢！！！</span>
			</div>
		</div>
		<div class="p-menu" data-type="menu">
			<div class="pitem" data-type="menutitle">
				<div class="list3">
					<span class="l1">商品名称</span>
					<span class="l2">数量</span>
					<span class="l3">小计</span>
				</div>
			</div>
			<div class="pitem" data-type="menulist">
				<div class="list3">
					<span class="l1">番茄鸡蛋面</span>
					<span class="l2">×1</span>
					<span class="l3">16</span>
				</div>
				<div class="list3">
					<span class="l1">韭菜鲜肉水饺</span>
					<span class="l2">×1</span>
					<span class="l3">30</span>
				</div>
			</div>
		</div>
		<div class="p-price" data-type="price">
			<div class="pitem" data-type="pricelist">
				<div class="list2">
					<div class="l1"><span>打包费</span></div>
					<div class="l2"><span>2</span></div>
				</div>
				<div class="list2">
					<div class="l1"><span>配送费</span></div>
					<div class="l2"><span>4</span></div>
				</div>
				<div class="list2">
					<div class="l1"><span>满30减10元</span></div>
					<div class="l2"><span>-10</span></div>
				</div>
			</div>
			<div class="pitem" data-type="amount">
				<span>在线支付：42元</span>
			</div>
		</div>
		<div class="p-footer" data-type="footer">
			<div class="pitem" data-type="qr"><img src="/include/qrcode.php?data=<?php echo $cfg_secureAccess.$cfg_basehost;?>" /></div>
			<div class="pitem custom" data-type="footercustom"><span contenteditable="true">自定义文字</span></div>
		</div>
	</div>
</div>
<div class="edit fn-hide">
	<h3>样式编辑</h3>
	<div class="detail">
		<ul class="item font-edit">
			<li data-type="h1w1"><s>√</s>高度×1 宽度×1</li>
			<li data-type="h2w1"><s>√</s>高度×2 宽度×1</li>
			<li data-type="h1w2"><s>√</s>高度×1 宽度×2</li>
			<li data-type="h2w2" class="active"><s>√</s>高度×2 宽度×2</li>
		</ul>
		<ul class="item align-edit">
			<li data-type="left"><s>√</s>左对齐</li>
			<li data-type="center"><s>√</s>居中对齐</li>
			<li data-type="right"><s>√</s>右对齐</li>
		</ul>
		<ul class="item line-edit" style="border-bottom: 0;">
			<li data-type="line">下方插入分隔线</li>
			<li data-type="mtop">上方插入空行</li>
			<li data-type="removemtop">移除上方空行</li>
		</ul>
	</div>
</div>

<input id="templateVal" type="hidden" />

<script>
$(function(){

	var template = <?php echo json_encode($template); ?>;

	//初始化
	if(template){
		var title = template.title;
		var info = template.info;
		var menu = template.menu;
		var price = template.price;
		var footer = template.footer;

		//标题
		var shopname = title.shopname;
		if(shopname.state){
			$('.left .li[data-type=shopname]').addClass('active');
			$('.preview .pitem[data-type=shopname]').attr('data-style', shopname.style).addClass(shopname.style).show();
		}
		var titlecustom = title.titlecustom;
		if(titlecustom.state){
			$('.left .li[data-type=titlecustom]').addClass('active');
			$('.preview .pitem[data-type=titlecustom]').attr('data-style', titlecustom.style).addClass(titlecustom.style).show().find('span').html(titlecustom.value);
		}

		//基础信息
		var ordernum = info.ordernum;
		if(ordernum.state){
			$('.left .li[data-type=ordernum]').addClass('active');
			$('.preview .pitem[data-type=ordernum]').attr('data-style', ordernum.style).addClass(ordernum.style).show();
		}
		var ordertime = info.ordertime;
		if(ordertime.state){
			$('.left .li[data-type=ordertime]').addClass('active');
			$('.preview .pitem[data-type=ordertime]').attr('data-style', ordertime.style).addClass(ordertime.style).show();
		}
		var orderaddress = info.orderaddress;
		if(orderaddress.state){
			$('.left .li[data-type=orderaddress]').addClass('active');
			$('.preview .pitem[data-type=orderaddress]').attr('data-style', orderaddress.style).addClass(orderaddress.style).show();
		}
		var orderpeople = info.orderpeople;
		if(orderpeople.state){
			$('.left .li[data-type=orderpeople]').addClass('active');
			$('.preview .pitem[data-type=orderpeople]').attr('data-style', orderpeople.style).addClass(orderpeople.style).show();
		}
		var ordertel = info.ordertel;
		if(ordertel.state){
			$('.left .li[data-type=ordertel]').addClass('active');
			$('.preview .pitem[data-type=ordertel]').attr('data-style', ordertel.style).addClass(ordertel.style).show();
		}
		var note = info.note;
		if(note.state){
			$('.left .li[data-type=note]').addClass('active');
			$('.preview .pitem[data-type=note]').attr('data-style', note.style).addClass(note.style).show();
		}

		//菜品信息
		var menutitle = menu.menutitle;
		if(menutitle.state){
			$('.left .li[data-type=menutitle]').addClass('active');
			$('.preview .pitem[data-type=menutitle]').attr('data-style', menutitle.style).addClass(menutitle.style).show();
		}
		var menulist = menu.menulist;
		if(menulist.state){
			$('.left .li[data-type=menulist]').addClass('active');
			$('.preview .pitem[data-type=menulist]').attr('data-style', menulist.style).addClass(menulist.style).show();
		}

		//结算
		var pricelist = price.pricelist;
		if(pricelist.state){
			$('.left .li[data-type=pricelist]').addClass('active');
			$('.preview .pitem[data-type=pricelist]').attr('data-style', pricelist.style).addClass(pricelist.style).show();
		}
		var amount = price.amount;
		if(amount.state){
			$('.left .li[data-type=amount]').addClass('active');
			$('.preview .pitem[data-type=amount]').attr('data-style', amount.style).addClass(amount.style).show();
		}

		//底栏
		var qr = footer.qr;
		if(qr.state){
			$('.left .li[data-type=qr]').addClass('active');
			$('.preview .pitem[data-type=qr]').attr('data-style', qr.style).addClass(qr.style).show();
		}
		var footercustom = footer.footercustom;
		if(footercustom.state){
			$('.left .li[data-type=footercustom]').addClass('active');
			$('.preview .pitem[data-type=footercustom]').attr('data-style', footercustom.style).addClass(footercustom.style).show().find('span').html(titlecustom.value);
		}
	}


	//鼠标经过左侧效果
	$('.left .li').hover(function(){
		var t = $(this), type = t.attr('data-type');
		$('.preview .hover').removeClass('hover');
		$('.preview .pitem[data-type='+type+']').addClass('hover');
	}, function(){
		$('.preview .hover').removeClass('hover');
	});

	//鼠标点击左侧效果
	$('.left .li').click(function(){
		var t = $(this), type = t.attr('data-type');

		if(t.hasClass('active')){
			$('.preview .pitem[data-type='+type+']').hide();
			t.removeClass('active');
		}else{
			$('.preview .pitem[data-type='+type+']').show();
			t.addClass('active');
		}
		createData();
	});

	//鼠标经过预览效果
	$('.preview .pitem').hover(function(){
		var t = $(this), type = t.attr('data-type');
		$('.left .li').removeClass('hover');
		$('.left .li[data-type='+type+']').addClass('hover');
	}, function(){
		$('.left .li').removeClass('hover');
	});

	//鼠标点击预览效果
	$('.preview .pitem').click(function(){
		var t = $(this), type = t.attr('data-type'), style_ = t.attr('data-style'), ptype = t.parent().attr('data-type');

		$('.preview .active').removeClass('active');
		t.addClass('active');

		//样式编辑
		$('.edit .active').removeClass('active');
		$('.line-edit li:eq(0)').html('下方插入分隔线');
		var styleArr = style_ ? style_.split(' ') : [];
		if(styleArr.length > 0){
			styleArr.forEach(function(s){
				if(s == 'h1w1'){
					$('.font-edit li:eq(0)').addClass('active');
				}else if(s == 'h2w1'){
					$('.font-edit li:eq(1)').addClass('active');
				}else if(s == 'h1w2'){
					$('.font-edit li:eq(2)').addClass('active');
				}else if(s == 'h2w2'){
					$('.font-edit li:eq(3)').addClass('active');
				}else if(s == 'center'){
					$('.align-edit li:eq(1)').addClass('active');
				}else if(s == 'right'){
					$('.align-edit li:eq(2)').addClass('active');
				}
			});

			if(styleArr.indexOf('h2w1') < 0 && styleArr.indexOf('h1w2') < 0 && styleArr.indexOf('h2w2') < 0){
				$('.font-edit li:eq(0)').addClass('active');
			}

			if(styleArr.indexOf('center') < 0 && styleArr.indexOf('right') < 0){
				$('.align-edit li:eq(0)').addClass('active');
			}

			if(styleArr.indexOf('line') > -1){
				$('.line-edit li:eq(0)').html('下方移除分隔线');
			}
		}else{
			$('.font-edit li:eq(0)').addClass('active');
			$('.align-edit li:eq(0)').addClass('active');
		}

		if(ptype == 'menu' || (ptype == 'price' && type != 'amount')){
			$('.align-edit').hide();
		}else{
			$('.align-edit').show();
		}

		$('.edit').show();
		createData();
	});

	//样式编辑
	//文字大小
	$('.font-edit li').click(function(){
		var t = $(this), type = t.attr('data-type'), obj = $('.preview .active'), style = obj.attr('data-style'), styleArr = style ? style.split(' ') : [];
		if(obj){
			obj.removeClass('h1w2 h2w1 h2w2');
			if(style && style.indexOf($('.font-edit .active').attr('data-type')) > -1){
				styleArr.splice($.inArray($('.font-edit .active').attr('data-type'),styleArr),1);
			}
			if(type != 'h1w1'){
				obj.addClass(type);
				styleArr.push(type);
			}

			obj.attr('data-style', styleArr.join(' '));

			t.addClass('active').siblings('li').removeClass('active');
		}
		createData();
	});

	//对齐方式
	$('.align-edit li').click(function(){
		var t = $(this), type = t.attr('data-type'), obj = $('.preview .active'), style = obj.attr('data-style'), styleArr = style ? style.split(' ') : [];
		style = style ? style : '';
		if(obj){
			if(style && style.indexOf($('.align-edit .active').attr('data-type')) > -1){
				styleArr.splice($.inArray($('.align-edit .active').attr('data-type'),styleArr),1);
			}

			obj.removeClass('center right');

			if(type != 'left'){
				styleArr.push(type);
				obj.addClass(type);
			}
			obj.attr('data-style', styleArr.join(' '));

			t.addClass('active').siblings('li').removeClass('active');
		}
		createData();
	});

	//分隔线
	$('.line-edit li:eq(0)').click(function(){
		var t = $(this), obj = $('.preview .active'), style = obj.attr('data-style'), styleArr = style ? style.split(' ') : [];
		style = style ? style : '';
		if(style.indexOf('line') > -1){
			obj.removeClass('line');
			t.html('下方插入分隔线');

			styleArr.splice($.inArray('line',styleArr),1);
		}else{
			obj.addClass('line');
			t.html('下方移除分隔线');

			styleArr.push('line');
		}

		obj.attr('data-style', styleArr.join(' '));
		createData();
	});

	//插入空行
	$('.line-edit li:eq(1)').click(function(){
		var t = $(this), obj = $('.preview .active'), style = obj.attr('data-style'), styleArr = style ? style.split(' ') : [];
		style = style ? style : '';

		var mtop = parseInt(obj.css('marginTop'));
		var _mtop = mtop + 10;
		obj.css('marginTop', _mtop);

		if(styleArr.length > 0){
			styleArr.forEach(function(s, index){
				if(s.indexOf('mtop') > -1){
					styleArr.splice(index,1);
				}
			});
		}

		styleArr.push('mtop' + _mtop);
		obj.attr('data-style', styleArr.join(' '));
		createData();
	});

	//移除空行
	$('.line-edit li:eq(2)').click(function(){
		var t = $(this), obj = $('.preview .active'), style = obj.attr('data-style'), styleArr = style ? style.split(' ') : [];
		style = style ? style : '';

		var mtop = parseInt(obj.css('marginTop'));
		var _mtop = mtop > 0 ? mtop - 10 : 0;
		obj.css('marginTop', _mtop);

		if(styleArr.length > 0){
			styleArr.forEach(function(s, index){
				if(s.indexOf('mtop') > -1){
					styleArr.splice(index,1);
				}
			});
		}

		if(_mtop > 0){
			styleArr.push('mtop' + _mtop);
		}
		obj.attr('data-style', styleArr.join(' '));
		createData();
	});

	$('.custom span').bind('input', function(){
		createData();
	});

	//数据组合
	function createData(){

		var tpl = {};

		$('.left .list').each(function(){
			var t = $(this), type = t.attr('data-type');

			tpl[type] = {};

			t.find('.li').each(function(){
				var li = $(this), li_type = li.attr('data-type');
				var pre = $('.preview .pitem[data-type='+li_type+']');
				tpl[type][li_type] = {
					'state': li.hasClass('active') ? 1 : 0,
					'style': pre.attr('data-style') ? pre.attr('data-style') : ''
				};

				if(li_type.indexOf('custom') > -1){
					tpl[type][li_type]['value'] = pre.find('span').text();
				}
			});
		});

		$('#templateVal').val(JSON.stringify(tpl));
	}
	createData();

});
</script>
</body>
</html>
