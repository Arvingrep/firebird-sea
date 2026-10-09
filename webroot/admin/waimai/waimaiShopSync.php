<?php
/**
 * 店铺管理 同步店铺
 *
 * @version        $Id: add.php 2017-4-25 上午11:19:16 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', ".." );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

checkPurview("waimaiShopEdit");

$dbname = "waimai_shop";
$templates = "waimaiShopSync.html";

//表单提交
if($_POST){

    //获取表单数据
    $from = (int)$courier_id;               // 源店铺
    $config = $SetShop;                      // 需要同步的设置
    $objIds = $SetShop_ids;             // 需要同步的店铺列表 array
    $shoptype = (int)$shop_type;            // 需要同步的店铺分类

    if(empty($from)) die('{"state": 200, "info": "请选择源店铺！"}');

    $syncType = $config['syn_type'];        // 同步方式
    if(empty($syncType)) die('{"state": 200, "info": "请选择同步方式！"}');

    if(count($config) == 1) die('{"state": 200, "info": "请选择需要同步的设置！"}');

    $where = " 1 = 1";
    $where .= getCityFilter('`cityid`');
    
    // 全部店铺
    if($syncType == 1){
        $where .= " AND `id` != $from";
    }elseif($syncType == 2){
        if(in_array($from, $objIds)) die('{"state": 200, "info": "需要同步到的店铺不能包含源店铺"}');

        $where .= " AND `id` in (".join(",", $objIds).")";
    }elseif($syncType == 3){
        if(empty($syncType)) die('{"state": 200, "info": "需要同步的店铺分类！"}');
        $where .= " AND `typeid` = $shoptype";
    }else{
        die('{"state": 200, "info": "参数错误！"}');
    }

    $archives = $dsql->SetQuery("SELECT * FROM `#@__$dbname` WHERE `id` = $from");
    $results  = $dsql->dsqlOper($archives, "results");
    if($results){

        $fromData = $results[0];

        $fields = array();

        // 支付方式
        if(isset($config['paytype'])){
            array_push($fields, "paytype");
            array_push($fields, "offline_limit");
            array_push($fields, "pay_offline_limit");
        }

        // 店铺活动 - 店铺打折
        if(isset($config['discount'])){
            array_push($fields, "is_vipdiscount");
            array_push($fields, "vipdiscount_value");
        }
        // 店铺活动 - 满减活动
        if(isset($config['promotion'])){
            array_push($fields, "open_promotion");
            array_push($fields, "promotions");
        }
        // 店铺活动 - 首单减免
        if(isset($config['first_order'])){
            array_push($fields, "is_first_discount");
            array_push($fields, "first_discount");
        }
        // 店铺活动 - 满送优惠券
        if(isset($config['quan'])){
            array_push($fields, "open_fullcoupon");
            array_push($fields, "fullcoupon");
        }

        // 预设选项
        if(isset($config['options'])){
            array_push($fields, "preset");
        }

        // 增值服务
        if(isset($config['addservice'])){
            array_push($fields, "open_addservice");
            array_push($fields, "addservice");
        }

        // 营业星期
        if(isset($config['weeks'])){
            array_push($fields, "weeks");
            array_push($fields, "addservice");
        }

        // 营业时间段
        if(isset($config['shop_active_time'])){
            array_push($fields, "start_time1");
            array_push($fields, "end_time1");
            array_push($fields, "start_time2");
            array_push($fields, "end_time2");
            array_push($fields, "start_time3");
            array_push($fields, "end_time3");
            array_push($fields, "delivery_radius");
            array_push($fields, "delivery_area");
        }

        // 配送时间
        /*if(isset($config['deliver'])){
            array_push($fields, "weeks");
            array_push($fields, "addservice");
        }*/

        // 起送价、配送费模式
        if(isset($config['delivery_mode'])){
            array_push($fields, "delivery_fee_mode");
        }

        // 固定配送费
        if(isset($config['delivery_fee'])){
            array_push($fields, "delivery_fee");
        }

        // 固定起送价
        if(isset($config['basicprice'])){
            array_push($fields, "basicprice");
        }

        // 固定满免配送费金额
        if(isset($config['no_delivery_fee_value'])){
            array_push($fields, "delivery_fee_type");
            array_push($fields, "delivery_fee_value");
        }

        // 按距离计算外送费规则
        if(isset($config['juli_data'])){
            array_push($fields, "range_delivery_fee_value");
        }

        // 按区域计算外送费规则
        if(isset($config['area_data'])){
            array_push($fields, "service_area_data");
        }

        // 订单语音提醒
        if(isset($config['order_voice_remind'])){
            array_push($fields, "smsvalid");
            array_push($fields, "sms_phone");
            array_push($fields, "emailvalid");
            array_push($fields, "email_address");
            array_push($fields, "weixinvalid");
            array_push($fields, "customerid");
            array_push($fields, "auto_printer");
            array_push($fields, "showordernum");
        }

        // 分成设置 - 商品原价
        if(isset($config['fencheng_foodprice'])){
            array_push($fields, "fencheng_foodprice");
        }
        // 分成设置 - 配送费
        if(isset($config['fencheng_delivery'])){
            array_push($fields, "fencheng_delivery");
        }
        // 分成设置 - 打包费
        if(isset($config['fencheng_dabao'])){
            array_push($fields, "fencheng_dabao");
        }
        // 分成设置 - 增值服务费
        if(isset($config['fencheng_addservice'])){
            array_push($fields, "fencheng_addservice");
        }
        // 分成设置 - 折扣
        if(isset($config['fencheng_discount'])){
            array_push($fields, "fencheng_discount");
        }
        // 分成设置 - 满减
        if(isset($config['fencheng_promotion'])){
            array_push($fields, "fencheng_promotion");
        }
        // 分成设置 - 首单减免
        if(isset($config['fencheng_firstdiscount'])){
            array_push($fields, "fencheng_firstdiscount");
        }
        // 分成设置 - 优惠券
        if(isset($config['fencheng_quan'])){
            array_push($fields, "fencheng_quan");
        }
        /*出餐时长*/
        if(isset($config['chucan_time'])){
            array_push($fields, "chucan_time");
        }
        /*配送时长*/
        if(isset($config['delivery_time'])){
            array_push($fields, "delivery_time");
        }

        $fieldList = array();
        foreach ($fields as $key => $value) {
            array_push($fieldList, "`$value` = '".$fromData[$value]."'");
        }

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET " . join(",", $fieldList) . " WHERE " . $where);
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){
            $doList = array();
            foreach ($config as $key => $value) {
                array_push($doList, $key);
            }
            adminLog("外卖店铺同步操作", join(",", $doList), 1);

            echo '{"state": 100, "info": "同步成功！"}';
        }else{
            echo '{"state": 200, "info": "同步失败！"}';
        }


    }else{
        echo '{"state": 200, "info": "源店铺不存在！"}';
    }

    exit();

}

$list = array();
global $userLogin;
$userid = $userLogin->getUserID();
$cityid = $userLogin->getAdminCityIds($userid);

$where = '';
if(empty($cityid)){
    echo '{"state": 200, "info": "暂无操作权限！"}';
    exit();
}else{
    $where .=" AND  s.`cityid` IN (".$cityid.")";
}
$sql = $dsql->SetQuery("SELECT s.`id`, s.`shopname` FROM `#@__$dbname` s WHERE 1 = 1 AND s.`del` = 0".$where);
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    $list = $ret;
}
$huoniaoTag->assign('list', $list);

$type = array();
$sql = $dsql->SetQuery("SELECT t.`id`, t.`title` FROM `#@__waimai_shop_type` t WHERE 1 = 1");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    $type = $ret;
}
$huoniaoTag->assign('type', $type);

//验证模板文件
if(file_exists($tpl."/".$templates)){

    //css
	$cssFile = array(
        'ui/jquery.chosen.css',
		'admin/bootstrap1.css',
		'admin/jquery-ui.css',
		'admin/styles.css',
		'admin/chosen.min.css',
		'admin/ace-fonts.min.css',
		'admin/select.css',
		'admin/ace.min.css',
		'admin/animate.css',
		'admin/font-awesome.min.css',
		'admin/simple-line-icons.css',
		'admin/font.css',
		// 'admin/app.css'
	);
	$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

    //js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui.min.js',
		'ui/jquery.form.js',
		'ui/jquery-ui-timepicker-addon.js',
		'ui/jquery.dragsort-0.5.1.min.js',
        'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'admin/waimai/waimaiShopSync.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
