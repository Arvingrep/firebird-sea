<?php
/**
 * 管理商城分类
 *
 * @version        $Id: productAdd.php 2014-2-12 下午23:10:15 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("productAdd");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$adminAreaIDs = '';
if($userType == 3){
    $sql = $dsql->SetQuery("SELECT `mgroupid` FROM `#@__member` WHERE `id` = " . $userLogin->getUserID());
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $adminCityID = $ret[0]['mgroupid'];

        global $data;
        $data = '';
        $adminAreaData = $dsql->getTypeList($adminCityID, 'site_area');
        $adminAreaIDArr = parent_foreach($adminAreaData, 'id');
        $adminAreaIDs = $adminAreaIDArr ? $adminCityID . ',' . join(',', $adminAreaIDArr) : $adminCityID;
    }
}

if($action == ""){
	$templates = "selectCategory.html";

	if($typeid != ""){
		//遍历所选分类名称，输出格式：分类名 > 分类名
		global $data;
		$data = "";
		$proTypeName = getParentArr("shop_type", $typeid);
		$proTypeName = array_reverse(parent_foreach($proTypeName, "typename"));
		$huoniaoTag->assign('proType', join(" > ", $proTypeName));
	}else{
		$huoniaoTag->assign('proType', "无");
	}

	$huoniaoTag->assign('typeid', $typeid);
	$huoniaoTag->assign('id', $id);

	//js
	$jsFile = array(
		'admin/shop/selectCategory.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}else{

	if($dopost == "edit"){
		if(!empty($id)){
			if($submit != "提交"){
				//主表信息
				$archives = $dsql->SetQuery("SELECT * FROM `#@__shop_product` WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "results");

				if(!empty($results)){

					if($_GET['typeid'] == ""){
						$typeid      = $results[0]['type'];
					}
					$tuantitle       = $results[0]['title'];
					$subtitle    = $results[0]['subtitle'];
					$brand       = $results[0]['brand'];
					$property    = $results[0]['property'];
					$store       = $results[0]['store'];
					$category    = $results[0]['category'];
					$mprice      = $results[0]['mprice'];
					$price       = $results[0]['price'];
					$logistic    = $results[0]['logistic'];
					$volume      = $results[0]['volume'];
					$weight      = $results[0]['weight'];
					$inventory   = $results[0]['inventory'];
					$inventoryCount   = $results[0]['inventoryCount'];
					$limit       = $results[0]['limitcount'];
					$btime       = $results[0]['btime'];
					$etime       = $results[0]['etime'];
					$litpic      = $results[0]['litpic'];
                    $itpicSource = $results[0]["litpic"];
                    $litpic      = getFilePath($results[0]["litpic"]);
					$sort        = $results[0]['sort'];
					$click       = $results[0]['click'];
					$state       = $results[0]['state'];
                    $is_tuikuan  = $results[0]['is_tuikuan'];
					$flag        = $results[0]['flag'];
					$storeFlag   = $results[0]['storeFlag'];
					$kstime      = $results[0]['kstime'];
					$ketime      = $results[0]['ketime'];
					$pics        = $results[0]['pics'];
					$body        = $results[0]['body'];
					$guigetype       = $results[0]['guigetype'];
					$mbody       = $results[0]['mbody'];
					$videoScoure       = $results[0]['video'];
                    $video       = getFilePath($results[0]['video']);

                    /*其他须知*/
                    $notice    = $results[0]['notice'] !='' ? explode('|||',$results[0]['notice']) : array() ;
                    $noticearr = array();

                    if ($notice) {
                        foreach ($notice as $a => $b){
                            $barr = $b!= '' ? explode("$$$",$b) : array();
                            $noticearr[$a]['title'] = $barr[0];
                            $noticearr[$a]['note']  = $barr[1];
                        }
                    }
                    $fx_reward   = $results[0]['fx_reward'];
					$barcode     = $results[0]['barcode'];
					$spePics     = $results[0]['spePics'];
					$speFiled    = $results[0]['speFiled'];
					$speCustom   = $results[0]['speCustom'];
					$sysSpe     = $results[0]['sysspe'];
					$protype     = $results[0]['protype'];
					$quantime    = $results[0]['quantime'];
					$qtimetype   = $results[0]['qtimetype'];
                    $packingCount= $results[0]['packingCount'];
                    $shopunit    = $results[0]['shopunit'];
                    $logistic   = $results[0]['logistic'];
                    $blogistic    = $results[0]['blogistic'];
                    $smallCount  = $results[0]['smallCount'];
                    $packingCount= $results[0]['packingCount'];
                    $shopunit    = $results[0]['shopunit'];
                    $promotype    = $results[0]['promotype'];

                    $archives = $dsql->SetQuery("SELECT `toshop`,`express`,`merchant_deliver`,`distribution` FROM `#@__shop_store` WHERE `id` = '$store'");
                    $res = $dsql->dsqlOper($archives,"results");
                    $toshop      = $res[0]['toshop'];
                    $express     = $res[0]['express'];
                    $merchant_deliver    = $res[0]['merchant_deliver'];
                    $distribution    = $res[0]['distribution'];

                    /*营业日*/
                    $day = array('1'=>'周一','2'=>'周二','3'=>'周三','4'=>'周四','5'=>'周五','6'=>'周六','7'=>'周日',);

                    $daystr = '';
                    $availableweek = $results[0]['availableweek'] != '' ? explode(',',$results[0]['availableweek']) : array();
                    if ($availableweek) {
                        for ($i = 1; $i <=7; $i++) {
                            if(in_array($i,$availableweek)){
                                $daystr .= $day[$i].' ';
                            }
                        }
                    }
                    $daystr    = $daystr;
                    $daystrarr  = $availableweek;

                    /*时间段*/
                    $availabletime    =  $results[0]['availabletime'] !='' ? unserialize($results[0]['availabletime']) : array() ;
                    $availabletimearr = array();
                    if ($availabletime) {
                        foreach ($availabletime as $item) {
                            array_push($availabletimearr,$item['start'].'-'.$item['stop']);
                        }

                    }
                    $availabletimearr     = $availabletimearr;

                    /*套餐*/
                    $package    = $results[0]['package'] !='' ? explode('|||',$results[0]['package']) : array() ;
                    $packagearr = array();
                    if ($package) {
                        foreach ($package as $key => $value) {

                            $title = $value != '' ? explode('@@@',$value) : array ();
                            if ($title) {
                                $packagearr[$key]['title'] = $title[0];

                                $pro = $title[1] != '' ? explode("~~~",$title[1]) : array ();

                                $proarray = array ();

                                if ($pro) {
                                    foreach ($pro as $a => $b) {

                                        $proparam = $b !='' ? explode("$$$",$b) : array() ;

                                        array_push($proarray,$proparam);
                                    }
                                }

                                $packagearr[$key]['param'] = $proarray;

                            }
                        }

                    }
                    //图集
                    $imgList = array();
                    $pics    = $results[0]["pics"];
                    if (!empty($pics)) {
//                        $pics = explode("||", $pics);
                        $pics = strstr($pics, '||') ? explode("||", $pics) : explode(',', $pics);
                        foreach ($pics as $key => $val) {
                            $imgList[$key]['pathSource'] = $val;
                            $imgList[$key]['path']       = getFilePath($val);
                        }
                    }
                    $pics  = $imgList;

                    $typesalesarr = $results[0]['typesales']!='' ? explode(',',$results[0]['typesales']) : array() ;

					$nowtime = GetMkTime(time());
					$prohuodongsql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_huodongsign` WHERE `proid` = '$id' AND  ((`ktime`<= '$nowtime' AND  `etime` >= '$nowtime') OR(`ktime` > '$nowtime')) ");

					$prohuodongres = $dsql->dsqlOper($prohuodongsql,"results");

					$huodong = 0;

					if(!empty($prohuodongres) && is_array($prohuodongres)){
                        $huodong = 1;
                    }

				}else{
					ShowMsg('要修改的信息不存在或已删除！', "-1");
					die;
				}
			}
		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}

	if($typeid == ""){
		header("location:productAdd.php");
	}

	$huoniaoTag->assign('typeid', $typeid);

	//表单验证
	if($submit == "提交") {


        if ($fx_reward) {
            $tmp = $fx_reward;
            if (strstr($fx_reward, '%')) {
                if (substr($fx_reward, -1) != '%') {
                    echo '{"state": 200, "info": "分销佣金设置错误"}';
                    exit();
                }
                $fx_reward = (float)$fx_reward . '%';
            } else {
                $fx_reward = (float)$fx_reward;
            }
            if (strlen($tmp) != strlen($fx_reward)) {
                echo '{"state": 200, "info": "分销佣金设置错误"}';
                exit();
            }
        }
        $typeid         = $typeid;
        $store          = $store;
        $brand          = (int)$brand;
        $itemid         = $itemid;
        $tuantitle          = filterSensitiveWords(addslashes($tuantitle));
        $subtitle       = filterSensitiveWords(addslashes($subtitle));
        $category       = $category;
        $mprice         = (float)$mprice;
        $price          = (float)$price;
        $volume         = (float)$volume;
        $weight         = (float)$weight;
        $inventory      = $inventory;
        $inventoryCount = (int)$inventoryCount;
        $limit          = (int)$limit;
        $litpic         = $litpic;
        $imglist        = $imglist;
        $video          = $video;
        $smallCount     = (int)$smallCount;
        $packingCount   = (int)$packingCount;
        $shopunit       = $shopunit;
        $barcode        = $barcode;
        $storeFlag      = $storeFlag;
        // $body           = filterSensitiveWords(addslashes($body));
        // $mbody          = filterSensitiveWords(addslashes($mbody));
        $pubdate        = GetMkTime(time());
        $editdate        = GetMkTime(time());
        $flag           = $flag;
        $protype        = (int)$protype;
        $qtimetype      = (int)$qtimetype;
        $saletype       = $saletype;
        $modAdrr        = (int)$modAdrr;
        $notice         = $notice;
        $package        = $package;
        $availableweek  = $useweek;
        $guigetype      = (int)$guigetype;
        $fabutype       = $fabutype;
        $availabletime  = $limit_time!= '' ? serialize($limit_time) : '';
        $logistic       = $express;

        $saletypearr    = $saletype !='' ? explode(',',$saletype) : array() ; // 1-到店消费，3-平台配送，2-商家配送，4-快递
        if (!empty($blogistic) && in_array('2',$saletypearr)) {
            $blogistic = $blogistic;   /*商家类型*/
        }else{
            $blogistic = 0;
        }
        if (!empty($logistic) && in_array('4',$saletypearr)) {
            $logistic = $logistic;   /*快递类型模板*/
        }else{
            $logistic = 0;
        }

        $quantime       = $qtimetype == 1 ? (int)$tuanvalidity : (int)strtotime($tuandeadline);

        $storeFlag = isset($storeFlag) ? join(',', $storeFlag) : '';
        $flag = isset($flag) ? join(',', $flag) : '';

        // include HUONIAOINC . "/config/shop.inc.php";
        $state = 1;  //后台发布直接审核通过

        /*保存到货架*/
        if ($fabutype == 1 ) {
            $state = 2;
        }
        if ($smallCount < 1 && $modAdrr != 1){
            echo '{"state": 200, "info": "最小起订量不能小于1"}';
            exit();
        }
        if ($typeid == "") {
            echo '{"state": 200, "info": "分类获取失败,请重新选择分类!"}';
            exit();

        }

        //遍历所选分类ID
        global $data;
        $data    = "";
        $proType = getParentArr("shop_type", $typeid);
        $proId   = array_reverse(parent_foreach(getParentArr("shop_type", $typeid), "id"));
        // $proId = array_slice($proId, 0, count($proType));

        //根据分类ID，获取分类属性值
        if (count($proId) > 0) {
            foreach ($proId as $key => $val) {
                $archives = $dsql->SetQuery("SELECT * FROM `#@__shop_item` WHERE `type` = " . $val);
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $itemid = $val;
                }
            }
        }
        if(empty($quantime) && $saletype === 1){
            echo '{"state": 200, "info": "请填写电子券过期时间"}';
            exit();
        }

        if (!$store) {
            echo '{"state": 200, "info": "请选择所属店铺!"}';
            exit();
        }

        if ($title == "") {
            echo '{"state": 200, "info": "请输入商品标题!"}';
            exit();
        }

        $category = isset($category) ? join(',', $category) : '';

        if (!preg_match("/^0|\d*\.?\d+$/i", $mprice, $matches)) {
            echo '{"state": 200, "info": "市场价不得为空，类型为数字！"}';
            exit();
        }

        if (!preg_match("/^0|\d*\.?\d+$/i", $price, $matches)) {
            echo '{"state": 200, "info": "一口价不得为空，类型为数字！"}';
            exit();
        }


//        if ((empty($blogistic) && in_array('2',$saletypearr)) || (empty($logistic) && in_array('4',$saletypearr))) {
//            echo '{"state": 200, "info": "请选择物流运费模板！"}';
//            exit();
//        }

        //根据分类ID，获取分类属性值
        $itemid1 = 0;
        if (count($proId) > 0) {
            foreach ($proId as $key => $val) {
                $archives = $dsql->SetQuery("SELECT * FROM `#@__shop_type` WHERE `spe` != '' AND `id` = " . $val);
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $itemid1 = $val;
                }
            }
        }

        //获取分类下相应规格
        $speFiled    = array();
        $spePics     = array();  //颜色自定义图片
        $specifival  = array();
        $spearray    = array();
        $sysSpeArr = array();
        $spearmPrice   = array();               //  原价
        $spearPrice   = array();               //现价
        $invent      = 0;
        $typeitem    = $dsql->SetQuery("SELECT `spe` FROM `#@__shop_type` WHERE `id` = " . $itemid1 . "");
        $typeResults = $dsql->dsqlOper($typeitem, "results");
        if ($typeResults) {
            $spe = $typeResults[0]['spe'];
            if ($spe != "") {
                $spe = explode(",", $spe);
                foreach ($spe as $key => $val) {

                    //已有规格自定义字段
                    $customArr = array();
                    $custom    = $_POST["speCustom" . $val];
                    $customPic = $_POST["speCustomPic" . $val];
                    if ($custom) {
                        $speFiled[$val] = $custom;
                        foreach ($custom as $k => $v) {
                            array_push($customArr, $v);
                        }
                    }

                    $spePic = $_POST["spePic" . $val];
                    if ($customPic) {
                        $spePics = $spePic ? array_merge($customPic, $spePic) : $customPic;
                    } elseif ($spePic) {
                        $spePics = $spePic;
                    }

                    $speitem    = array();
                    $speSql     = $dsql->SetQuery("SELECT `id` FROM `#@__shop_specification` WHERE `id` = " . $val . " ORDER BY `weight` ASC");
                    $speResults = $dsql->dsqlOper($speSql, "results");
                    if ($speResults) {
                        $speval = array();
                        if ($customArr) {
                            $speval = $customArr;
                        }
                        $postVal = $_POST["spe" . $speResults[0]['id']];
                        $sysSpeArr[$speResults[0]['id']] = $postVal;
                        $speval  = $speval ? ($postVal ? array_merge($speval, $postVal) : $speval) : $postVal;
                        if (!empty($speval) != "") {
                            array_push($spearray, $speval);
                        }
                    } else {
                        if ($customArr) {
                            array_push($spearray, $customArr);
                        }
                    }
                }
            }
        }
        //规格自定义图片
        $spePics = serialize($spePics);
        //系统规格选中
        $sysSpeArr = $sysSpeArr ? json_encode($sysSpeArr) : "";
        //已有规格自定义字段
        if(!empty($speFiled)){ //截取Filed长度
            $cutSpeCustom = array();
            foreach($speFiled as $speCustomK => $speCustomV){
                $speCustomVI = array();
                foreach($speCustomV as $speCustomVIt){
                    $spes_jjj = substr($speCustomVIt,strlen("custom_"));  //截取后一半
                    $cus_spe_ii = explode("_",$spes_jjj);
                    $spe_parent_id = $cus_spe_ii[0];  //id
                    $spe_parent_name = substr($spes_jjj,strlen("".$spe_parent_id)+1); //name
                    $spe_parent_name = cn_substrR($spe_parent_name,30);
                    $speCustomVI[] = "custom_".$spe_parent_id."_".$spe_parent_name;
                }
                $cutSpeCustom[$speCustomK] = $speCustomVI;
            }
            $speFiled = $cutSpeCustom;
        }
        $speFiled = serialize($speFiled);
        //全新规格自定义
        $speCustom = array();
        $speNew = $_POST['speNew'];
        if ($speNew) {
            foreach ($speNew as $key => $value) {
                array_push($spearray, $value);
            }
            $speCustom = $speNew;
        }
        if(!empty($speCustom)){ //截取spe长度
            $cutSpeCustom = array();
            foreach($speCustom as $speCustomK => $speCustomV){
                $speCustomK = cn_substrR($speCustomK,30);
                $speCustomVI = array();
                foreach($speCustomV as $speCustomVIt){
                    $speCustomVI[] = cn_substrR($speCustomVIt,30);
                }
                $cutSpeCustom[$speCustomK] = $speCustomVI;
            }
            $speCustom = $cutSpeCustom;
        }
        $speCustom = serialize($speCustom);

        if (!empty($spearray)) {
            if (count($spearray) > 1) {
                $spearray = descartes($spearray);
                if ($modAdrr == 1) {
                    $spearray = $spearray[0];
                }
            } else {
                $spearray = $spearray[0];
            }
            $skuInfo = json_decode($_POST['skuInfoArr'],true);
            foreach ($spearray as $key => $val) {
                $speid = $val;
                if (is_array($val)) {
                    $speid = join("-", $val);
                }
                $spemprice    = $skuInfo["f_mprice_" . $speid];
                $speprice     = $skuInfo["f_price_" . $speid];
                $speinventory = $skuInfo["f_inventory_" . $speid];
                if (!preg_match("/^0|\d*\.?\d+$/i", $spemprice, $matches)) {
                    echo '{"state": 200, "info": "规格表中价格不得为空，类型为数字！"}';
                    exit();
                } elseif (!preg_match("/^0|\d*\.?\d+$/i", $speprice, $matches)) {
                    echo '{"state": 200, "info": "规格表中库存不得为空，类型为数字！"}';
                    exit();
                } elseif (!preg_match("/^0|\d*\.?\d+$/i", $speinventory, $matches)) {
                    echo '{"state": 200, "info": "规格表中库存不得为空，类型为数字！"}';
                    exit();
                } else {
                    $invent += $speinventory;
                    array_push($spearmPrice,$spemprice);
                    array_push($spearPrice,$speprice);
                    array_push($specifival, array('speids'=>$val,'mprice'=>$spemprice,'price'=>$speprice,'stock'=>$speinventory));
                }
            }
        }
        if (!empty($specifival)) {
            $specifival = json_encode($specifival,256);
            $inventory  = $invent;
        } else {
            $specifival = "";
            if (!preg_match("/^0|\d*\.?\d+$/i", $inventory, $matches)) {
                echo '{"state": 200, "info": "库存不得为空，类型为数字！"}';
                exit();
            }
        }
        if (!empty($spearmPrice) && !empty($spearPrice)){
            $mprice = min($spearmPrice);
            $price = min($spearPrice);
        }

        if (empty($litpic)) {
            echo '{"state": 200, "info": "请上传商品缩略图！"}';
            exit();
        }

        if (empty($imglist)) {
            echo '{"state": 200, "info": "请上传商品图集！"}';
            exit();
        }
        if ($modAdrr != 1) {
            //获取分类下相应属性
            $property     = array ();
            $propertyName = "item";
            $shopitem     = $dsql->SetQuery("SELECT `id`, `typename`, `flag` FROM `#@__shop_item` WHERE `type` = " . $itemid . " AND `parentid` = 0 ORDER BY `weight`");
            $shopResults  = $dsql->dsqlOper($shopitem, "results");
            if($shopResults){
                foreach ($shopResults as $key => $val) {

                    $pid      = $val['id'];
                    $typeName = $val['typename'];
                    $r        = strstr($val['flag'], 'r');
                    $proval   = $_POST[$propertyName . $pid];

                    if (is_array($proval)) {
                        if ($r && empty($proval) && $fabutype != 1 ) {
                            echo json_encode(array ("state" => 200, "info" => $langData['siteConfig'][7][2] . $typeName . '！'));die;
                        }
                        if (!empty($proval) && $fabutype != 1) {
                            array_push($property, $pid . "#" . join(",", $proval));
                        }
                    } else {
                        if ($r && $fabutype != 1 && $proval == "") {
                            echo json_encode(array ("state" => 200, "info" => $langData['siteConfig'][7][2] . $typeName . '！'));die;
                        }
                        if (!empty($proval)) {
                            array_push($property, $pid . "#" . $proval);
                        }
                    }
                }
            }

            //自定义产品参数
            if($cusItemKey){

                foreach($cusItemKey as $_k => $_v){
                    $_key = str_replace('|', '｜', str_replace('#', '﹟', trim($_v)));
                    $_val = str_replace('|', '｜', str_replace('#', '﹟', trim($cusItemVal[$_k])));
                    if($_key && $_val){
                        array_push($property, $_key . "#" . $_val);
                    }
                }

            }

            $property = join("|", $property);
        }

        if (trim($body) == '') {
            echo '{"state": 200, "info": "请输入商品描述"}';
            exit();
        }
        // $barcode = genSecret(12, 1);
        $mbody = empty($mbody) ? $body : $mbody;

    }
	$templates = "productAdd.html";

    //css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
        'ui/chosen.jquery.min.js',
		'admin/shop/productAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	require_once(HUONIAOINC."/config/shop.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}
	$huoniaoTag->assign('id', $id);

	//遍历所选分类名称，输出格式：分类名 > 分类名
	global $data;
	$data = "";
	$proType = getParentArr("shop_type", $typeid);
	$proType = array_reverse(parent_foreach($proType, "typename"));
	$huoniaoTag->assign('proType', join(" > ", $proType));

	//遍历所选分类ID
	global $data;
	$data = "";
	$proId = array_reverse(parent_foreach(getParentArr("shop_type", $typeid), "id"));
	// $proId = array_slice($proId, 0, count($proType));

	//根据分类ID，获取分类属性值
	$itemid = 0;
	if(count($proId) > 0){
		foreach($proId as $key => $val){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__shop_item` WHERE `type` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				$itemid = $val;
			}
		}
	}

	//品牌Array
	$brandOption = array();
	array_push($brandOption, '<option value="">请选择</option>');
	$archives = $dsql->SetQuery("SELECT * FROM `#@__shop_brandtype` ORDER BY `weight`");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach($results as $key => $val){
			$archives_ = $dsql->SetQuery("SELECT * FROM `#@__shop_brand` WHERE `type` = ".$val['id']." ORDER BY `weight`");
			$results_ = $dsql->dsqlOper($archives_, "results");
			$branditem = array();
			if($results_){
				foreach($results_ as $key_ => $val_){
					$selected = "";
					if($val_['id'] == $brand){
						$selected = " selected";
					}
					array_push($branditem, '<option value="'.$val_['id'].'"'.$selected.'>'.$val_['title'].'</option>');
				}
				if(!empty($branditem)){
					array_push($brandOption, '<optgroup label="'.$val["typename"].'">');
					array_push($brandOption, join("", $branditem));
                    array_push($brandOption, '</optgroup>');
				}
			}
		}
	}
	$huoniaoTag->assign('brandOption', join("", $brandOption));


	//运费模板Array
	$logisticOption = array();
	$store = (int)$store;
	array_push($logisticOption, '<option value="0">请选择运费模板</option>');
	$archives = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__shop_logistictemplate` WHERE `sid` = ".$store." ORDER BY `id` DESC");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach($results as $key => $val){
			$selected = "";
			if($val["id"] == $logistic){
				$selected = " selected";
			}
			array_push($logisticOption, '<option value="'.$val["id"].'"'.$selected.'>'.$val["title"].'</option>');
		}
	}
	$huoniaoTag->assign('logisticOption', join("", $logisticOption));


	$huoniaoTag->assign('proItemList', join("", getItemList($property, $itemid)));

	//店铺Array
	$storeOption = array();
	array_push($storeOption, '<option value="0">请选择</option>');

    $where = getCityFilter('`cityid`');

    //城市管理员
    if($userType == 3){
        if($adminAreaIDs){
                $where .= " AND `addrid` in ($adminAreaIDs)";
        }else{
            $where .= " AND 1 = 2";
        }
    }
	$archives = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__shop_store` WHERE 1=1".$where." ORDER BY `weight`");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach($results as $key => $val){
			$selected = "";
			if($val["id"] == $store){
				$selected = " selected";
			}
			array_push($storeOption, '<option value="'.$val["id"].'"'.$selected.'>'.$val["title"].'</option>');
		}
	}
	$huoniaoTag->assign('storeOption', join("", $storeOption));

	//根据分类ID，获取分类属性值
	$itemid1 = 0;
	if(count($proId) > 0){
		foreach($proId as $key => $val){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__shop_type` WHERE `spe` != '' AND `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				$itemid1 = $val;
			}
		}
	}

	$custom = array(
		'pic' => '',
		'filed' => '',
        'custom' => array(),
        'sysSpe' => array()
	);

	//自定义规格
	if($spePics || $speFiled){
		$custom = array(
			'pic' => $spePics ? unserialize($spePics) : '',
			'filed' => $speFiled ? unserialize($speFiled) : '',
            'custom' => $speCustom ? unserialize($speCustom) : array(),
            'sysSpe'=> $sysSpe ? json_decode($sysSpe,true) : array()
		);
	}

    include_once(HUONIAOROOT."/api/handlers/shop.class.php");
    $shop = new shop();
	$speArr = $shop->getSpeList($id, $itemid1, $custom);
	$huoniaoTag->assign('specification', join("", $speArr['specification']));
	$huoniaoTag->assign('specifiVal', json_encode($speArr['specifiVal']));
    $parseSpeCustom = $speCustom ? unserialize($speCustom) : array();
	$huoniaoTag->assign('specifiCustom', $parseSpeCustom);
	//库存计数
	$huoniaoTag->assign('inventoryCountopt', array('0', '1', '2'));
	$huoniaoTag->assign('inventoryCountnames',array('拍下减库存','付款减库存','永不减库存'));
	$huoniaoTag->assign('inventoryCount', $inventoryCount == "" ? 0 : $inventoryCount);

	//状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已上架','已下架'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	//其它属性
	$huoniaoTag->assign('flagopt', array('0', '1', '2'));
	$huoniaoTag->assign('flagnames',array('推荐','特价','热卖'));
	$huoniaoTag->assign('flag', $flag === '' ? "" : explode(",",$flag));

	//商家标签
	$huoniaoTag->assign('storeFlagopt', array('0', '1', '2'));
	$huoniaoTag->assign('storeFlagnames',array('限量特价','店铺爆款','店长推荐'));
	$huoniaoTag->assign('storeFlag', $storeFlag === '' ? "" : explode(",", $storeFlag));

    $huoniaoTag->assign('huodong', $huodong);

    $huoniaoTag->assign('is_tuikuan', array('0',  '1'));
    $huoniaoTag->assign('is_tuikuannames',array('支持',  '不支持'));
    $huoniaoTag->assign('is_tuikuan', $is_tuikuan == "" ? 0 : $is_tuikuan);
}

//获取商品分类
if($dopost == "getTypeList"){
	$list = array();
	if($tid == 0){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__shop_type` WHERE `parentid` = 0 ORDER BY `weight`");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key => $val){
				$list[$key] = array();
				$list_1 = array();
				$archives_1 = $dsql->SetQuery("SELECT * FROM `#@__shop_type` WHERE `parentid` = ".$val['id']." ORDER BY `weight`");
				$results_1 = $dsql->dsqlOper($archives_1, "results");
				if($results_1){
					foreach($results_1 as $key_1 => $val_1){
						$list_1[$key_1]["id"] = $val_1['id'];
						$list_1[$key_1]["typename"] = $val_1['typename'];

						$list_1[$key_1]["type"] = 0;
						$archives_2 = $dsql->SetQuery("SELECT * FROM `#@__shop_type` WHERE `parentid` = ".$val_1['id']." ORDER BY `weight`");
						$results_2 = $dsql->dsqlOper($archives_2, "results");
						if($results_2){
							$list_1[$key_1]["type"] = 1;
						}
					}
				}
				$list[$key]["typeid"] = $val['id'];
				$list[$key]["typename"] = $val['typename'];
				$list[$key]["subnav"] = $list_1;
			}
		}
	}else{
		$list = array();
		$archives = $dsql->SetQuery("SELECT * FROM `#@__shop_type` WHERE `parentid` = ".$tid." ORDER BY `weight`");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key => $val){
				$list[$key]["id"] = $val['id'];
				$list[$key]["typename"] = $val['typename'];

				$list[$key]["type"] = 0;
				$archives_1 = $dsql->SetQuery("SELECT * FROM `#@__shop_type` WHERE `parentid` = ".$val['id']." ORDER BY `weight`");
				$results_1 = $dsql->dsqlOper($archives_1, "results");
				if($results_1){
					$list[$key]["type"] = 1;
				}
			}
		}
	}
	if(!empty($list)){
		echo '{"state": 100, "info": "获取成功！", "list": '.json_encode($list).'}';
	}else{
		echo '{"state": 200, "info": "获取失败！"}';
	}
	die;

//获取分类的所有父级
}elseif($dopost == "typeParent"){
	//遍历所选分类ID
	global $data;
	$data = "";
	$proId = array_reverse(parent_foreach(getParentArr("shop_type", $typeid), "id"));
	$proId = array_slice($proId, 0, count($proTypeName));
	if(!empty($proId)){
		echo json_encode($proId);
	}
	die;

//获取店铺分类
}elseif($dopost == "getStoreType"){
	if($sid){
		$ids = array();
		if($id != ""){
			$archives = $dsql->SetQuery("SELECT `category` FROM `#@__shop_product` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				$ids = explode(",", $results[0]['category']);
			}
		}
		$archives = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__shop_category` WHERE `type` = ".$sid." AND `parentid` = 0 ORDER BY `weight`");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			$cList = array();
			foreach($results as $key => $val){
				$selected = "";
				if(in_array($val['id'], $ids)){
					$selected = " selected";
				}
				array_push($cList, '<option value="'.$val['id'].'"'.$selected.'>|--'.$val['typename'].'</option>');
				$archives_ = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__shop_category` WHERE `parentid` = ".$val['id']." ORDER BY `weight`");
				$results_ = $dsql->dsqlOper($archives_, "results");
				if($results_){
					foreach($results_ as $key_ => $val_){
						$selected = "";
						if(in_array($val_['id'], $ids)){
							$selected = " selected";
						}
						array_push($cList, '<option value="'.$val_['id'].'"'.$selected.'>&nbsp;&nbsp;&nbsp;&nbsp;|--'.$val_['typename'].'</option>');
					}
				}
			}
			if(!empty($cList)){
				echo '{"state": 100, "info": "获取成功！", "list": '.json_encode('<option value="">请选择,支持多选</option>'.join("", $cList)).'}';
			}else{
				echo '{"state": 200, "info": "获取失败！"}';
			}
		}
	}
	die;

//上架新商品
}elseif($dopost == "save"){



    //保存到主表
//	$archives = $dsql->SetQuery("INSERT INTO `#@__shop_product` (`type`, `title`, `subtitle`, `brand`, `property`, `store`, `category`, `mprice`, `price`, `logistic`, `volume`, `weight`, `specification`, `inventory`, `inventoryCount`, `limitcount`, `litpic`, `sort`, `click`, `state`, `flag`, `btime`, `etime`, `pics`, `body`, `mbody`, `pubdate`, `video`, `kstime`, `ketime`, `fx_reward`, `barcode`, `spePics`, `speFiled`, `speCustom`, `storeFlag`,`is_tuikuan`,`protype`,`quantime`,`qtimetype`, `upshelftime`,`smallCount`,`packingCount`,`shopunit`) VALUES ('$typeid', '$title', '$subtitle', '$brand', '$property', '$store', '$category', '$mprice', '$price', '$logistic', '$volume', '$weight', '$specifival', '$inventory', '$inventoryCount', '$limit', '$litpic', '$sort', '$click', '$state', '$flag', '$btime', '$etime', '$imglist', '$body', '$mbody', ".GetMkTime(time()).", '$video', '$kstime', '$ketime', '$fx_reward', '$barcode', '$spePics', '$speFiled', '$speCustom', '$storeFlag','$is_tuikuan','$protype','$quantime','$qtimetype', ".GetMkTime(time()).",'$smallCount','$packingCount','$shopunit')");


    $archives = $dsql->SetQuery("INSERT INTO `#@__shop_product` (`type`, `title`, `subtitle`, `brand`, `property`, `store`, `category`, `mprice`, `price`, `logistic`, `volume`, `weight`, `inventory`, `inventoryCount`, `limitcount`, `sales`, `litpic`, `sort`, `click`, `state`, `pics`, `body`, `mbody`, `pubdate`, `video`, `barcode`, `spePics`, `speFiled`, `speCustom`,`flag`,`storeFlag`,`protype`,`quantime`,`qtimetype`, `upshelftime`,`smallCount`,`packingCount`,`shopunit`,`promotype`,`typesales`,`package`,`notice`,`availableweek`,`availabletime`,`guigetype`,`blogistic`,`is_tuikuan`,`fx_reward`,`sysspe`) VALUES ('$typeid', '$title', '$subtitle', '$brand', '$property', '$store', '$category', '$mprice', '$price', '$logistic', '$volume', '$weight','$inventory', '$inventoryCount', '$limit', '0', '$litpic', '$sort', '$click', '$state', '$imglist', '$body', '$mbody', '$pubdate', '$video', '$barcode', '".addslashes($spePics)."', '".addslashes($speFiled)."', '".addslashes($speCustom)."','$flag','$storeFlag','$protype','$quantime','$qtimetype','$pubdate','$smallCount','$packingCount','$shopunit','$modAdrr','$saletype','$package','$notice','$availableweek','$availabletime','$guigetype','$blogistic','$tuikuantype','$fx_reward','$sysSpeArr')");
	$aid = $dsql->dsqlOper($archives, "lastid");
	if($aid){

        include_once(HUONIAOROOT."/api/handlers/shop.class.php");
	    $shop = new shop();
	    $shop->saveSku($aid,$speFiled,$speCustom,$specifival,$_POST['speNew']);

        //更新店铺商品数量
        $handlers = new handlers("shop", "updateStorePcount");
        $handlers->getHandle(array("store" => $store));

		adminLog("上架新商品", $title);

        //以图搜图-入库
        require_once(HUONIAOINC."/baidu.aip.func.php");
        $client = new baiduAipImageSearchClient();
        $ret = $client->productAddUrl(str_replace('small', 'large', getFilePath($litpic)), $aid);
        dataAsync("shop",$aid,"product");  // 在线商城、商品、上架
        echo '{"state":100, "info":"添加成功"}';
        die;
	}else{
		echo '{"state": 200, "info": "添加失败！"}';die;
	}

//修改商品
}elseif($dopost == "edit"){
	//表单验证
	if($submit == "提交"){

	    $spestr = '';
//	    if($huodong ==0){
//
//	        $spestr = " , `spePics` = '$spePics', `speFiled` = '$speFiled', `speCustom` = '$speCustom'";
//        }
        $duospe = '';

        if ($huodong != 1) {
            $duospe = " , `spePics` = '".addslashes($spePics)."', `speFiled` = '".addslashes($speFiled)."', `speCustom` = '".addslashes($speCustom)."'";
        }


		//保存到主表
//		$archives = $dsql->SetQuery("UPDATE `#@__shop_product` SET `type` = '$typeid', `title` = '$title', `subtitle` = '$subtitle', `brand` = '$brand', `property` = '$property', `store` = '$store', `category` = '$category', `mprice` = '$mprice', `price` = '$price', `logistic` = '$logistic', `volume` = '$volume', `weight` = '$weight', `specification` = '$specifival', `inventory` = '$inventory', `inventoryCount` = '$inventoryCount', `limitcount` = '$limit', `litpic` = '$litpic', `sort` = '$sort', `click` = '$click', `state` = '$state', `flag` = '$flag', `btime` = '$btime', `etime` = '$etime', `pics` = '$imglist', `body` = '$body', `mbody` = '$mbody', `video` = '$video', `kstime` = '$kstime', `ketime` = '$ketime', `fx_reward` = '$fx_reward', `barcode` = '$barcode', `storeFlag` = '$storeFlag',`protype` = '$protype',`smallCount` = '$smallCount',`packingCount` = '$packingCount',`quantime`='$quantime',`qtimetype` = '$qtimetype',`shopunit` = '$shopunit',`is_tuikuan` = '$is_tuikuan' $spestr WHERE `id` = ".$_POST['id']);


        $archives = $dsql->SetQuery("UPDATE `#@__shop_product` SET `fx_reward` = '$fx_reward',`store` = '$store',`type` = '$typeid', `title` = '$title', `subtitle` = '$subtitle', `brand` = '$brand', `property` = '$property', `category` = '$category', `mprice` = '$mprice', `price` = '$price', `logistic` = '$logistic', `volume` = '$volume', `weight` = '$weight', `inventory` = '$inventory', `inventoryCount` = '$inventoryCount', `limitcount` = '$limit', `litpic` = '$litpic', `pics` = '$imglist', `body` = '$body',`smallCount` = '$smallCount',`packingCount` = '$packingCount',`shopunit` = '$shopunit',`editdate` = '$editdate',`mbody` = '$mbody', `video` = '$video', `barcode` = '$barcode',`flag` = '$flag',`storeFlag` = '$storeFlag',`protype` = '$protype',`quantime`='$quantime',`qtimetype` = '$qtimetype' $duospe ,`typesales` = '$saletype',`package` = '$package',`notice` = '$notice',`availableweek` = '$availableweek',`availabletime` = '$availabletime',`guigetype` = '$guigetype',`blogistic` = '$blogistic',`is_tuikuan` = '$tuikuantype',`click` = '$click',`sort` = '$sort',`sysspe`='$sysSpeArr' WHERE `id` = " .$_POST['id']);
        $results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){

            $shop = new shop();
            $shop->saveSku($id,$speFiled,$speCustom,$specifival,$_POST['speNew']);

            //更新店铺商品数量
            $handlers = new handlers("shop", "updateStorePcount");
            $handlers->getHandle(array("store" => $store));

			adminLog("修改商城商品", $title);

            //以图搜图-入库
            require_once(HUONIAOINC."/baidu.aip.func.php");
            $client = new baiduAipImageSearchClient();
            $ret = $client->productAddUrl(str_replace('small', 'large', getFilePath($litpic)), $_POST['id']);

			$param = array(
				"service"  => "shop",
				"template" => "detail",
				"id"       => $_POST['id']
			);
			$url = getUrlPath($param);
            dataAsync("shop",$_POST['id'],"product");  // 在线商城、商品、修改信息
            echo '{"state":100, "info":"修改成功!"}';
            die;
		}else{
			echo '{"state": 200, "info": "修改失败！"}';die;
		}

		die;
	}else{
		$huoniaoTag->assign('title', $tuantitle);
		$huoniaoTag->assign('notice', $noticearr);
		$huoniaoTag->assign('subtitle', $subtitle);
		$huoniaoTag->assign('brand', $brand);
		$huoniaoTag->assign('store', $store);
		$huoniaoTag->assign('category', $category);
		$huoniaoTag->assign('mprice', $mprice);
		$huoniaoTag->assign('price', $price);
		$huoniaoTag->assign('logistic', $logistic);
		$huoniaoTag->assign('volume', $volume);
		$huoniaoTag->assign('weight', $weight);
		$huoniaoTag->assign('inventory', $inventory < 0 ? 0 : $inventory);
		$huoniaoTag->assign('limitcount', $limit);
		$huoniaoTag->assign('btime', !empty($btime) ? date("Y-m-d H:i:s", $btime) : "");
		$huoniaoTag->assign('etime', !empty($etime) ? date("Y-m-d H:i:s", $etime) : "");
		$huoniaoTag->assign('kstime', !empty($kstime) ? date("Y-m-d H:i:s", $kstime) : "");
		$huoniaoTag->assign('ketime', !empty($ketime) ? date("Y-m-d H:i:s", $ketime) : "");
		$huoniaoTag->assign('litpic', $litpic);
        $huoniaoTag->assign('smallCount', $smallCount);
        $huoniaoTag->assign('packingCount', $packingCount);
        $huoniaoTag->assign('shopunit', $shopunit);
        $huoniaoTag->assign('sort', $sort);
		$huoniaoTag->assign('click', $click);
		$huoniaoTag->assign('protype', $protype);
		$huoniaoTag->assign('quantime', $quantime);
		$huoniaoTag->assign('qtimetype', $qtimetype);
        $huoniaoTag->assign('typesalesarr', $typesalesarr);
        $huoniaoTag->assign('toshop', $toshop);
        $huoniaoTag->assign('express', $express);
        $huoniaoTag->assign('merchant_deliver', $merchant_deliver);
        $huoniaoTag->assign('distribution', $distribution);
        $huoniaoTag->assign('logistic', $logistic);
        $huoniaoTag->assign('blogistic', $blogistic);
        $huoniaoTag->assign('promotype', $promotype);
        $huoniaoTag->assign('daystrarr', $daystrarr);
        $huoniaoTag->assign('daystr', $daystr);
        $huoniaoTag->assign('packagearr', $packagearr);
        $huoniaoTag->assign('availabletimearr', $availabletimearr);
//        $huoniaoTag->assign('istuikuan', $is_tuikuan);
        $huoniaoTag->assign('guigetype', $guigetype);





        $imglist = array();
//		if(!empty($pics)){
//			$imglist = explode(",", $pics);
//		}
        $huoniaoTag->assign('pics', $pics);
        $huoniaoTag->assign('body', stripslashes($body));
		$huoniaoTag->assign('mbody', stripslashes($mbody));
		$huoniaoTag->assign('video', $video);
        $huoniaoTag->assign('videoScoure', $videoScoure);

        $huoniaoTag->assign('fx_reward', $fx_reward);
		$huoniaoTag->assign('barcode', $barcode);
	}
}elseif($dopost =='getStoreConfig'){
    $archives = $dsql->SetQuery("SELECT `toshop`,`express`,`merchant_deliver`,`distribution` FROM `#@__shop_store` WHERE `id` = '$id'");
    $res = $dsql->dsqlOper($archives,"results");
    if ($res) {
        echo '{"state": 100, "info": '.json_encode("获取成功").', "shopconfig": '.json_encode($res).'}';
        die;
    }else{
        echo '{"state": 200, "info": '.json_encode("获取失败").', "shopconfig": '.json_encode($res).'}';
        die;
    }
}

//获取属性
function getItemList($property, $itemid){
	global $dsql;
	//获取分类属性
	$proItemList = array();
	$propertyArr = array();
	$propertyIds = array();
	$propertyVal = array();
    $propertyCustome = array();
	if(!empty($property)){
		$propertyArr = explode("|", $property);
		foreach($propertyArr as $key => $val){
			$value = explode("#", $val);
            $_item_id = $value[0];
            //系统属性
            if(is_numeric($_item_id)){
                
                //确认属性是否存在
                $archives = $dsql->SetQuery("SELECT * FROM `#@__shop_item` WHERE `id` = ".$_item_id);
                $results = $dsql->dsqlOper($archives, "results");
                if($results){
                    array_push($propertyIds, $value[0]);
                    array_push($propertyVal, $value[1]);
                }
                else{
                    array_push($propertyCustome, $value);
                }

            }
            //自定义属性
            else{
                array_push($propertyCustome, $value);
            }
		}
	}
    
	if($itemid != 0){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__shop_item` WHERE `type` = ".$itemid." AND `parentid` = 0 ORDER BY `weight`");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key => $val){

				$id = $val['id'];
				$typeName = $val['typename'];
				$r = strstr($val['flag'], 'r');
				$w = strstr($val['flag'], 'w');
				$c = strstr($val['flag'], 'c');

				$archives_ = $dsql->SetQuery("SELECT * FROM `#@__shop_item` WHERE `parentid` = ".$val['id']." ORDER BY `weight`");
				$results_ = $dsql->dsqlOper($archives_, "results");

				if($results_){
					$listItem = array();
					$requri = $requri_ = "";
					if($r){
						$requri = ' data-required="true"';
						$requri_ = '<font color="#f00">*</font>';
					}
					$properVal = array();
					if(!empty($propertyIds) && $_GET['typeid'] == ""){
						$found = array_search($id, $propertyIds);
                        if(is_numeric($found)){
    						$properVal = $propertyVal[$found];
                        }else{
    						$properVal = "";
                        }
					}else{
						$properVal = "";
					}

					//可输入
					if($w){
						array_push($listItem, '<input type="text" name="item'.$id.'" id="item'.$id.'"'.$requri.' placeholder="点击选择或直接输入内容" data-regex="\S+" value="'.$properVal.'" />');
						if($r){
							array_push($listItem, '<span class="input-tips"><s></s>请选择或直接输入'.$typeName.'属性</span>');
						}
						array_push($listItem, '<div class="popup_key"><ul>');
						foreach($results_ as $key_ => $val_){
							array_push($listItem, '<li data-id="'.$val_['id'].'" title="'.$val_['typename'].'">'.$val_['typename'].'</li>');
						}
						array_push($listItem, '</ul></div>');

					//多选
					}elseif($c){

						$properVal = array();
						if(!empty($propertyIds) && $_GET['typeid'] == ""){
							$found = array_search($id, $propertyIds);
							if(is_numeric($found)){
								$properVal = explode(",", $propertyVal[$found]);
							}
						}

						foreach($results_ as $key_ => $val_){

							$checked = "";
							if(in_array($val_['id'], $properVal)){
								$checked = " checked";
							}

							array_push($listItem, '<label><input type="checkbox" name="item'.$id.'[]" value="'.$val_['id'].'"'.$requri.$checked.' />'.$val_['typename'].'</label>');
						}
						if($r){
							array_push($listItem, '<span class="input-tips"><s></s>请选择'.$typeName.'属性</span>');
						}

						array_push($listItem, '<br /><span class="label label-info checkAll" style="margin-top:5px;">全选</span>');

					//下拉菜单
					}else{
						array_push($listItem, '<span><select name="item'.$id.'" id="item'.$id.'" class="input-large"'.$requri.'>');
						array_push($listItem, '<option value="">请选择</option>');
						foreach($results_ as $key_ => $val_){
							$selected = "";
							if($val_['id'] == $properVal){
								$selected = " selected";
							}

							array_push($listItem, '<option value="'.$val_['id'].'"'.$selected.'>'.$val_['typename'].'</option>');
						}
						array_push($listItem, '</select></span>');
						if($r){
							array_push($listItem, '<span class="input-tips"><s></s>请选择'.$typeName.'属性</span>');
						}
					}

					if(!empty($listItem)){
						array_push($proItemList, '<dl class="clearfix"><dt><label for="item'.$id.'">'.$typeName.'：'.$requri_.'</label></dt>');
						$cla = $c ? ' class="radio"' : "";
						$pos = $w ? ' style="position:static;"' : "";
						array_push($proItemList, '<dd'.$cla.$pos.'>'.join("", $listItem).'</dd>');
						array_push($proItemList, '</dl>');
					}

				}
			}
		}
	}

    //自定义属性
    if($propertyCustome){
        foreach($propertyCustome as $_k => $_v){
            array_push($proItemList, '<dl class="clearfix cusItem"><dt><input type="text" name="cusItemKey[]" placeholder="请输入参数名" data-regex="\S+" value="'.$_v[0].'" /></dt>');
            array_push($proItemList, '<dd style="position:static;"><input type="text" name="cusItemVal[]" placeholder="请输入参数值" data-regex="\S+" value="'.$_v[1].'" /><a style="vertical-align: middle; margin-left: 5px;" data-toggle="tooltip" data-placement="right" data-original-title="删除自定义产品参数" href="javascript:;" class="icon-trash"></a></dd>');
            array_push($proItemList, '</dl>');
        }
    }

	return $proItemList;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
    
    require(HUONIAOINC . "/config/shop.inc.php");
	$huoniaoTag->assign('dopost', $dopost ? $dopost : "save");
	$huoniaoTag->assign('imglist', json_encode(!empty($imglist) ? $imglist : array()));
	$huoniaoTag->assign('itemid', $itemid);
	$huoniaoTag->assign('click', $click == "" ? "1" : $click);
	$huoniaoTag->assign('sort', $sort == "" ? "1" : $sort);

    //0混合  1到店优惠  2送到家
    $huodongshoptypeopen = (int)$custom_huodongshoptypeopen;
    $huoniaoTag->assign('custom_huodongshoptypeopen', $huodongshoptypeopen);

    if($huodongshoptypeopen){
        $promotype = $huodongshoptypeopen;
    }

    $huoniaoTag->assign('modAdrr', $promotype ? (int)$promotype : (int)$modAdrr);
    $huoniaoTag->assign('atlasMax', $customAtlasMax);
    $huoniaoTag->assign('atlasSize', $custom_atlasSize);

    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/shop";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
