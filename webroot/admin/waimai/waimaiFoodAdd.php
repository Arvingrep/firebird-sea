<?php
/**
 * 店铺管理 新建商品列表
 *
 * @version        $Id: list_new.php 2017-4-25 上午10:16:21 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "../" );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "waimaiFoodAdd.html";

checkPurview("waimaiList");

$dbname = "waimai_list";


//表单提交
if($_POST){

    //获取表单数据
    $id               = (int)$id;
    $sort             = (int)$sort;
    $typeid           = (int)$typeid;
    $price            = (float)$price;
    $is_dabao         = (int)$is_dabao;
    $dabao_money      = (float)$dabao_money;
    $status           = (int)$status;
    $stockvalid       = (int)$stockvalid;
    $stock            = (int)$stock;
    $formerprice      = (float)$formerprice;
    $is_day_limitfood = (int)$is_day_limitfood;
    $day_foodnum      = (int)$day_foodnum;
    $is_nature        = (int)$is_nature;
    $is_limitfood     = (int)$is_limitfood;
    $foodnum          = (int)$foodnum;
    $is_discount      = (int)$is_discount;
    $discount_value   = (float)$discount_value;
    $start_time       = $start_time ? GetMkTime($start_time) : 0;
    $stop_time        = $stop_time ? GetMkTime($stop_time) : 0;
    $saleRec          = (int)$saleRec;

    //开启优惠推荐，必须启用库存
    if($saleRec){
        $stockvalid = 1;
    }

    if($fx_reward){
        $tmp = $fx_reward;
        if(strstr($fx_reward, '%')){
            if(substr($fx_reward, -1) != '%'){
                echo '{"state": 200, "info": "分销佣金设置错误"}';
                exit();
            }
            $fx_reward = (float)$fx_reward.'%';
        }else{
            $fx_reward = (float)$fx_reward;
        }
        if(strlen($tmp) != strlen($fx_reward)){
            echo '{"state": 200, "info": "分销佣金设置错误"}';
            exit();
        }
    }

    //商品属性
    $natureArr = array();
    if($nature){
        foreach ($nature as $key => $value) {
            if($value['value']){
                $arr = array();
                foreach ($value['value'] as $k => $v) {
                    array_push($arr, array(
                        "pic" => $value['pic'][$k],
                        "value" => trim($v),
                        "price" => $value['price'][$k],
                        "is_open" => $value['is_open'][$k]
                    ));
                }
                array_push($natureArr, array(
                    "name" => trim($value['name']),
                    "maxchoose" => $value['maxchoose'],
                    "data" => $arr
                ));
            }
        }
    }
    $nature = serialize($natureArr);


    //限制时间段
    $limit_timeArr = array();
    if($limit_time){
        foreach ($limit_time as $key => $value) {
            array_push($limit_timeArr, array(
                $value['start'], $value['stop']
            ));
        }
    }
    $limit_time = serialize($limit_timeArr);


    //商品名称
    if(trim($title) == ""){
		echo '{"state": 200, "info": "请输入商品名称"}';
		exit();
	}


    //商品价格
    if(trim($price) == ""){
		echo '{"state": 200, "info": "请输入商品价格"}';
		exit();
	}


    if($id){

        //验证商品是否存在
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__$dbname` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "totalCount");
        if($ret <= 0){
            echo '{"state": 200, "info": "商品不存在或已经删除！"}';
			exit();
        }

    }


    //修改
    if($id){

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET
            `sort` = '$sort',
            `title` = '$title',
            `price` = '$price',
            `typeid` = '$typeid',
            `unit` = '$unit',
            `label` = '$label',
            `is_dabao` = '$is_dabao',
            `dabao_money` = '$dabao_money',
            `status` = '$status',
            `stockvalid` = '$stockvalid',
            `stock` = '$stock',
            `formerprice` = '$formerprice',
            `descript` = '$descript',
            `body` = '$body',
            `is_nature` = '$is_nature',
            `nature` = '$nature',
            `is_day_limitfood` = '$is_day_limitfood',
            `day_foodnum` = '$day_foodnum',
            `is_limitfood` = '$is_limitfood',
            `foodnum` = '$foodnum',
            `start_time` = '$start_time',
            `stop_time` = '$stop_time',
            `limit_time` = '$limit_time',
            `pics` = '$pics',
            `fx_reward` = '$fx_reward',
            `is_discount` = '$is_discount',
            `saleRec` = '$saleRec',
            `discount_value` = '$discount_value'
          WHERE `id` = $id
        ");
        $ret = $dsql->dsqlOper($sql, "update");


        //初始化日志
        require_once HUONIAOROOT."/api/payment/log.php";
        $_updateWaimaiFood = new CLogFileHandler(HUONIAOROOT . '/log/waimaiFoodEdit/'.date('Y-m-d').'.log', true);
        $_updateWaimaiFood->DEBUG($sql);


        if($ret == "ok"){
            dataAsync("waimai",$id,"product");  // 修改外卖商品
            adminLog("修改外卖商品 - $id", $sql, 1);
			echo '{"state": 100, "info": '.json_encode("保存成功！").'}';
		}else{
			echo '{"state": 200, "info": "数据更新失败，请检查填写的信息是否合法！"}';
		}
        die;


    //新增
    }else{

        //保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__$dbname` (
            `sid`,
            `sort`,
            `title`,
            `price`,
            `typeid`,
            `unit`,
            `label`,
            `is_dabao`,
            `dabao_money`,
            `status`,
            `stockvalid`,
            `stock`,
            `formerprice`,
            `descript`,
            `body`,
            `is_nature`,
            `nature`,
            `is_day_limitfood`,
            `day_foodnum`,
            `is_limitfood`,
            `foodnum`,
            `start_time`,
            `stop_time`,
            `limit_time`,
            `pics`,
            `fx_reward`,
            `is_discount`,
            `saleRec`,
            `discount_value`
        ) VALUES (
            '$sid',
            '$sort',
            '$title',
            '$price',
            '$typeid',
            '$unit',
            '$label',
            '$is_dabao',
            '$dabao_money',
            '$status',
            '$stockvalid',
            '$stock',
            '$formerprice',
            '$descript',
            '$body',
            '$is_nature',
            '$nature',
            '$is_day_limitfood',
            '$day_foodnum',
            '$is_limitfood',
            '$foodnum',
            '$start_time',
            '$stop_time',
            '$limit_time',
            '$pics',
            '$fx_reward',
            '$is_discount',
            '$saleRec',
            '$discount_value'
        )");
		$aid = $dsql->dsqlOper($archives, "lastid");

		if($aid){
		    dataAsync("waimai",$aid,"product"); // 新增外卖商品
			echo '{"state": 100, "id": '.$aid.', "info": '.json_encode("添加成功！").'}';
		}else{
			echo '{"state": 200, "info": "数据插入失败，请检查填写的信息是否合法！"}';
		}
		die;

    }

}



if(empty($sid)){
    header("location:waimaiList.php");
    die;
}

$sql = $dsql->SetQuery("SELECT `shopname` FROM `#@__waimai_shop` WHERE `id` = $sid");
$ret = $dsql->dsqlOper($sql, "results");
if(!$ret){
    header("location:list.php");
    die;
}
$shop = $ret[0];

$shopname = $shop['shopname'];



//验证模板文件
if(file_exists($tpl."/".$templates)){


    //css
	$cssFile = array(
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
		'ui/jquery-ui-i18n.min.js',
		'ui/jquery-ui-timepicker-addon.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'admin/waimai/waimaiFoodAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));





    $huoniaoTag->assign('id', (int)$id);
    $huoniaoTag->assign('sid', (int)$sid);
    $huoniaoTag->assign('shopname', $shopname);

    $typelist = array();
    $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_list_type` WHERE `sid` = $sid AND `del` = 0 ORDER BY `sort` DESC, `id` DESC");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $typelist = $ret;
    }
    $huoniaoTag->assign('typelist', $typelist);


    $huoniaoTag->assign('pics', '[]');

    //分站管理员
    $userType = $userLogin->getUserType();
    $huoniaoTag->assign('mtype', $userType);

    //获取信息内容
    if($id){
        $sql = $dsql->SetQuery("SELECT * FROM `#@__$dbname` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach ($ret[0] as $key => $value) {

                //商品属性
                if($key == "nature"){
                    $value = unserialize($value);
                }

                //限制时间段
                if($key == "limit_time"){
                    $value = unserialize($value);
                }

                //限制开始、结束日期
                if($key == "start_time" || $key == "stop_time"){
                    $value = $value ? date("Y-m-d", $value) : "";
                }

                //图片
                if($key == "pics"){
                    $value = !empty($value) ? json_encode(explode(",", $value)) : "[]";
                }

                $huoniaoTag->assign($key, $value);
            }

        }else{
            showMsg("没有找到相关信息！", "-1");
            die;
        }
    }



    $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
