<?php
/**
 * 管理运费模板
 *
 * @version        $Id: logisticTemplate.php 2015-11-13 下午14:06:21 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("logisticTemplate");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$tab = "shop_logistictemplate";

$sid = (int)$sid;   //sid为0表示官方直营运费模板

//列表
if($dopost == ""){

    //css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css'
    );

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
        'ui/chosen.jquery.min.js',
		'admin/shop/logisticTemplate.js'
	);

	$templates = "logisticTemplate.html";
	if ($logistype != ''){
        $where = " AND `logistype` = $logistype";
    }

    //获取运费模板列表，并且是团购商品时，只获取按计件计费的模板
    if($do == 'ajax' && $modAdrr == 1){
        $where .= " AND `valuation` = 0";
    }

	$list = array();
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `sid` = $sid".$where." ORDER BY `id` DESC");
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		foreach ($results as $key=>$value) {
            $list[$key]["id"]                       = $value["id"];
            $list[$key]["title"]                    = $value["title"];
            $list[$key]["note"]                     = $value["note"];
            $list[$key]["logistype"]                = $value["logistype"];
            $list[$key]["delivery_fee_mode"]        = $value["delivery_fee_mode"];
            $list[$key]["basicprice"]               = $value["basicprice"];
            $list[$key]["logistype"]                = $value["logistype"];
            $list[$key]["range_delivery_fee_value"] = $value["range_delivery_fee_value"];

            $detail = '';
            if ($value["logistype"] == 0) {
                $detail = getPriceDetail($value["bearFreight"], $value['valuation'], $value['express_start'], $value['express_postage'], $value['express_plus'], $value['express_postageplus'], $value['preferentialStandard'], $value['preferentialMoney'], $value["id"]);
            }
            $list[$key]['detail'] = $detail;
		}

	}

	$huoniaoTag->assign('list', $list);

	if($do == "ajax"){
		echo '{"state": 100, "info": '.json_encode("获取成功").', "list": '.json_encode($list).'}';
		die;
	}


//获取运费详细
}elseif($dopost == "detail"){

	if(!empty($id)){

		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = $id");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			$value = $results[0];
//			echo getPriceDetail($value["bearFreight"], $value['valuation'], $value['express_start'], $value['express_postage'], $value['express_plus'], $value['express_postageplus'], $value['preferentialStandard'], $value['preferentialMoney']);

            echo $results[0]['note'];
		}

	}

	die;


//新增
}elseif($dopost == "add" || $dopost == "edit"){


	if($submit == "提交"){

		if(empty($title)) die('{"state": 200, "info": "请输入模板名称！"}');

        $bearFreight          = (int)$bearFreight;
        $valuation            = (int)$valuation;
        $openspecify          = (int)$freeArea;
        $opennospecify        = (int)$noFreeArea;

        $content              = $content;
        $logisticArea         = $logisticArea!='' ? json_decode(stripslashes($logisticArea),true): array();
        $noFreeAreaArr        = $noFreeAreaArr!='' ? json_decode(stripslashes($noFreeAreaArr),true): array();
        $freeArr              = $freeArr!='' ? json_decode(stripslashes($freeArr),true): array();

        $logistype                = (int)$logistype; /*模板类型 0-快递,1-商家配送*/
        $delivery_fee_mode        = (int)$delivery_fee_mode; /*起送价/配送模式 0-快递,1-商家配送*/
        $range_delivery_fee_value = $range_delivery_fee_value!='' ? json_decode(stripslashes($range_delivery_fee_value), true) : array (); /*按距离配送模板规格*/
        $basicprice               = (float)$basicprice; /*起送价*/
        $express_postage          = (float)$express_postage; /*默认运费*/
        $preferentialMoney        = (float)$preferentialMoney; /*满多少包邮*/
        $openFree                 = (int)$openFree;/*开启满多少包邮*/
        $express_juli                 = (int)$express_juli;/*配送距离*/


        $devspecification = array();
        $devspecification['bearFreight']    = $bearFreight;
        $devspecification['valuation']      = $valuation;
        $devspecification['openspecify']    = $openspecify;
        $devspecification['opennospecify']  = $opennospecify;


//		if($bearFreight == 1){
//
//			$purchase = 0;
//			$express_start = 0;
//			$express_postage = 0;
//			$express_plus = 0;
//			$express_postageplus = 0;
//			$preferentialStandard = 0;
//			$preferentialMoney = 0;
//
//		}

        $deliveryarea = $specify = $nospecify = array();

        if($logisticArea && is_array($logisticArea)){
            foreach ($logisticArea as $k => $v){

                $firstcityid = 0;
                $cityidarr = array();
                if($v['area'] !=0){
                    foreach ($v['area'] as $a => $b){

                        array_push($cityidarr,$b[1]);
                    }

                    $firstcityid = $v['area'][0][0];

                }

                $express_start = (int)$v['express_start'];
                $express_plus = (int)$v['express_plus'];

                $deliveryarea[$k]['cityid']              = $cityidarr ? join(',', $cityidarr) : '';
                $deliveryarea[$k]['express_start']       = $express_start ? $express_start : 1;
                $deliveryarea[$k]['express_postage']     = (float)$v['express_postage'];
                $deliveryarea[$k]['express_plus']        = $express_plus ? $express_plus : 1;
                $deliveryarea[$k]['express_postageplus'] = (float)$v['express_postageplus'];
                $deliveryarea[$k]['area']                = $v['area'];
            }

        }
        $devspecification['deliveryarea'] = $deliveryarea;

        if($noFreeAreaArr&& is_array($noFreeAreaArr)){

            $firstcityid = $noFreeAreaArr[0][0];

            $cityidarr = array();

            foreach ($noFreeAreaArr as $k => $v){

                array_push($cityidarr,$v[1]);
            }

            $nospecify[0]['area']        = $noFreeAreaArr;

            $nospecify[0]['cityid']      = $cityidarr ? join(',',$cityidarr) : '' ;

        }
        $devspecification['nospecify'] = $nospecify;

        if($freeArr&& is_array($freeArr)){

            foreach ($freeArr as $k => $v){

                $firstcityid = 0;
                $cityidarr = array();
                if($v['area'] !=0){
                    foreach ($v['area'] as $a => $b){

                        array_push($cityidarr,$b[1]);
                    }

                }

                $specify[$k]['cityid']               = $cityidarr ? join(',', $cityidarr) : '';
                $specify[$k]['preferentialStandard'] = $v['preferentialStandard'];
                $specify[$k]['preferentialMoney']    = $v['preferentialMoney'];
                $specify[$k]['area']                 = $v['area'];

            }
        }
        $devspecification['specify'] = $specify;

//        $devspecification  = serialize($devspecification);
        $devspecification           = $logistype == 0 ? serialize($devspecification) : '';
        $range_delivery_fee_value   = $logistype == 1 && $delivery_fee_mode == 1 ? serialize($range_delivery_fee_value) : '';
        $cityid = (int)$cityid;
        if($dopost == "add"){
			//保存到主表
//			$archives = $dsql->SetQuery("INSERT INTO `#@__shop_logistictemplate` (`cityid`, `sid`, `title`,`devspecification`,`note`) VALUES ('$cityid', '$sid', '$title','$devspecification','$content')");
            $archives = $dsql->SetQuery("INSERT INTO `#@__shop_logistictemplate` (`cityid`, `sid`, `title`, `valuation`,`devspecification`,`note`,`logistype`,`delivery_fee_mode`,`basicprice`,`range_delivery_fee_value`,`express_postage`,`preferentialMoney`,`openFree`,`express_juli`) VALUES ('$cityid', '$sid', '$title', '$valuation','$devspecification','$content','$logistype','$delivery_fee_mode','$basicprice','$range_delivery_fee_value','$express_postage','$preferentialMoney','$openFree','$express_juli')");
			$results = $dsql->dsqlOper($archives, "update");
			if($results == "ok"){
				adminLog("新增运费模板", $title);
				echo '{"state": 100, "info": "添加成功！"}';die;
			}else{
				echo '{"state": 200, "info": "添加失败！"}';die;
			}

		}else{
			//保存到主表
            $archives = $dsql->SetQuery("UPDATE `#@__shop_logistictemplate` SET `cityid` = '$cityid', `title` = '$title', `valuation` = '$valuation',`devspecification` = '$devspecification',`note` = '$content',`logistype` = '$logistype',`delivery_fee_mode` = '$delivery_fee_mode',`basicprice` = '$basicprice',`range_delivery_fee_value` = '$range_delivery_fee_value',`express_postage` = '$express_postage',`preferentialMoney` = '$preferentialMoney',`openFree` = '$openFree',`express_juli` = '$express_juli' WHERE `id` = " .$_POST['id']);
			$results = $dsql->dsqlOper($archives, "update");
			if($results == "ok"){
				adminLog("修改运费模板", $title);
				echo '{"state": 100, "info": "修改成功！"}';die;
			}else{
				echo '{"state": 200, "info": "修改失败！"}';die;
			}

		}

		die;
	}

	$valuationTxt = "件";

	if($dopost == 'edit'){

		$archives = $dsql->SetQuery("SELECT * FROM `#@__shop_logistictemplate` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			$res = $results[0];

			$sid                      = $res['sid'];
			$title                    = $res['title'];
			$content                  = $res['note'];
            $express_postage          = (float)$res['express_postage'];
            $preferentialMoney        = (float)$res['preferentialMoney'];
            $express_juli                = (int)$res['express_juli'];
            $logistype                = (int)$res['logistype'];
            $delivery_fee_mode        = (int)$res['delivery_fee_mode'];
            $basicprice               = (float)$res['basicprice'];
            $range_delivery_fee_value = $res['range_delivery_fee_value'];

            $openFree                 = (int)$res['openFree'];
            $devspecification     = unserialize($res['devspecification']);

            $bearFreight          = $devspecification ? $devspecification['bearFreight'] : 0;
            $valuation            = $devspecification ? $devspecification['valuation'] : 0;
            $freeArea             = $devspecification ? $devspecification['openspecify'] : 0;
            $opennospecify        = $devspecification ? $devspecification['opennospecify'] : 0;


            $deliveryarea           = $devspecification ? $devspecification['deliveryarea'] : array();

            if($devspecification == ''){

                $express_start = (int)$res['express_start'];
                $express_plus = (int)$res['express_plus'];

                $deliveryarea[0]['cityid']              = '';
                $deliveryarea[0]['express_start']       = $express_start ? $express_start : 1;
                $deliveryarea[0]['express_postage']     = (float)$res['express_postage'];
                $deliveryarea[0]['express_plus']        = $express_plus ? $express_plus : 1;
                $deliveryarea[0]['express_postageplus'] = (float)$res['express_postageplus'];
                $deliveryarea[0]['area']                = '默认全国';

                $valuation                              = $res['valuation'];

            }

            $nospecify              = $devspecification ? $devspecification['nospecify'] : array();

            $specify                = $devspecification ? $devspecification['specify'] : array();


            if($nospecify){

                $nospecify = $nospecify[0]['area'];

            }

			$huoniaoTag->assign('title', $title);
			$huoniaoTag->assign('content', $content);

            $huoniaoTag->assign('title', $title);
            $huoniaoTag->assign('bearFreight', $bearFreight);
            $huoniaoTag->assign('valuation', $valuation);
            $huoniaoTag->assign('freeArea', $freeArea);
            $huoniaoTag->assign('opennospecify', $opennospecify);

            $huoniaoTag->assign('deliveryarea', json_encode($deliveryarea));
            $huoniaoTag->assign('nospecify', json_encode($nospecify));
            $huoniaoTag->assign('specify', json_encode($specify));

            $huoniaoTag->assign('express_postage', $express_postage);
            $huoniaoTag->assign('express_juli', $express_juli);
            $huoniaoTag->assign('preferentialMoney', $preferentialMoney);
            $huoniaoTag->assign('logistype', $logistype);
            $huoniaoTag->assign('delivery_fee_mode', $delivery_fee_mode);
            $huoniaoTag->assign('basicprice', $basicprice);
            $huoniaoTag->assign('openFree', $openFree);
            $huoniaoTag->assign('range_delivery_fee_value', $range_delivery_fee_value);
            $huoniaoTag->assign('range_delivery_fee_valuearr', $range_delivery_fee_value !='' ? unserialize($range_delivery_fee_value) : array ());


			switch ($valuation) {
				case 0:
					$valuationTxt = "件";
					break;
				case 1:
					$valuationTxt = "kg";
					break;
				case 2:
					$valuationTxt = "m³";
					break;
			}

		}

	}

//    $decspe = array(
//        'title'         => '测试模板',
//        'bearFreight'   => '0', /*是否包邮*/
//        'valuation'     => '1', /*计价方式*/
//        'deliveryarea'  => array( /*配送区域及运费*/
//                                  array(
//                                      'cityid'              => '0',
//                                      'express_start'       => '1', /*首件*/
//                                      'express_postage'     => '1.00',/*运费件*/
//                                      'express_plus'        => '2',/*续件*/
//                                      'express_postageplus' => '2.00'/*续费*/
//                                  ),
//                                  array(
//                                      'cityid'              => '166,11,51',
//                                      'express_start'       => '1', /*首件*/
//                                      'express_postage'     => '1.00',/*运费件*/
//                                      'express_plus'        => '2',/*续件*/
//                                      'express_postageplus' => '2.00'/*续费*/
//                                  )
//        ),
//        'openspecify'   => '1',/*指定包邮*/
//        'specify'       => array(
//            array(
//                'cityid'               => '166',
//                'preferentialStandard' => '3',/*最低购买件数*/
//                'preferentialMoney'    => '600'/*最低购买金额*/
//            )
//        ),
//        'opennospecify' => '0',/*指定区域不配送*/
//        'nospecify'     => array(
//            'cityid' => '222'
//        )
//    );

//	var_dump(serialize($decspe));die;
	$huoniaoTag->assign('valuationTxt', $valuationTxt);

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));

    //css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css'
    );

	//js
	$jsFile = array(
        'ui/chosen.jquery.min.js',
		'admin/shop/logisticTemplateAdd.js'
	);

	$templates = "logisticTemplateAdd.html";

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));

//	//是否包邮
//	$huoniaoTag->assign('bearFreightopt', array('0', '1'));
//	$huoniaoTag->assign('bearFreightnames',array('自定义邮费','免邮费'));
//	$huoniaoTag->assign('bearFreight', $bearFreight == "" ? 0 : $bearFreight);
//
//	//计价方式
//	$huoniaoTag->assign('valuationopt', array('0', '1', '2'));
//	$huoniaoTag->assign('valuationnames',array('按件数','按重量', '按体积'));
//	$huoniaoTag->assign('valuation', $valuation == "" ? 0 : $valuation);


//删除
}elseif($dopost == "del"){
	if(!testPurview("productDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}

		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除商城商品", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

}


//验证模板文件
if(file_exists($tpl."/".$templates)){

    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('sid', $sid);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/shop";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
