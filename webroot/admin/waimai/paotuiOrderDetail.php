<?php
/**
 * 跑腿订单详细
 *
 * @version        $Id: orderDetail.php 2017-5-25 上午10:16:21 $
 * @package        HuoNiao.Order
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', ".." );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$dbname = "paotui_order";
$templates = "paotuiOrderDetail.html";
global $cfg_pointRatio;
checkPurview("paotuiOrder");

if(empty($id)){
    die;
}


$sql = $dsql->SetQuery("SELECT * FROM `#@__$dbname` WHERE `id` = $id");

$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    $point=  $ret[0]['point']  / $cfg_pointRatio;    //积分抵扣金钱
    $ret[0]['point'] =  $ret[0]['point']  / $cfg_pointRatio;    //积分抵扣金钱
    $ret[0]['amount'] =   $ret[0]['amount'] + $ret[0]['point'];
    $othercourierparam = $ret[0]['othercourierparam'];
    $balance  = $ret[0]['balance'];
    $amount   = $ret[0]['amount'];
    $payprice = $ret[0]['payprice'];
    $huoniaoTag->assign("priceamount", $ret[0]['amount']);
    foreach ($ret[0] as $key => $value) {

        //用户
        if($key == "uid"){
            $userSql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = ". $value);
            $username = $dsql->dsqlOper($userSql, "results");
            if(count($username) > 0){
                $huoniaoTag->assign("username", $username[0]['nickname'] ?: $username[0]['username']);
            }
        }

        if($key == "cityid"){
            $cityName = getSiteCityName($value);
            $huoniaoTag->assign("cityName", $cityName);
        }

        //支付方式
        if($key == "paytype"){
            $_paytype = '';
            $_paytypearr = array();
            $paytypearr = $value!='' ? explode(',',$value) : array();

            if($paytypearr) {
                foreach ($paytypearr as $k => $v) {
                    if ($v != '') {
                        array_push($_paytypearr, getDetailPaymentName($v, $balance, $point, $payprice));
                    }

                }
                $sql = $dsql->SetQuery("SELECT `balance`, `point` FROM `#@__$dbname` WHERE `id` =" . $id);
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret[0]['balance'] > 0) {
                    array_push($_paytypearr, getDetailPaymentName('money', $balance, 0, 0));
                }
                if ($ret[0]['point'] > 0) {
                    array_push($_paytypearr, getDetailPaymentName('integral', 0, $point, 0));
                }
                if ($_paytypearr) {
                    $_paytype = join(',', array_unique($_paytypearr));

                }
            }

            if($ret[0]['peerpay'] > 0){
                $userinfo = $userLogin->getMemberInfo($ret[0]['peerpay']);
                if(is_array($userinfo)){
                    $_paytype = '[<a href="javascript:;" class="userinfo" data-id="'.$ret[0]['peerpay'].'">'.$userinfo['nickname'].'</a>]'.$_paytype.'代付';
                }else{
                    $_paytype = '[<a href="javascript:;" class="userinfo" data-id="'.$ret[0]['peerpay'].'">'.$ret[0]['peerpay'].'</a>]'.$_paytype.'代付';
                }
            }

            $value = $_paytype;
        }

        //配送员
        if($key == "peisongid"){
            $sql = $dsql->SetQuery("SELECT `name` FROM `#@__waimai_courier` WHERE `id` = $value");
            $_ret = $dsql->dsqlOper($sql, "results");
            if($_ret){
                $huoniaoTag->assign("peisong", $_ret[0]['name']);
            }
        }

        $huoniaoTag->assign($key, $value);
    }

}else{
    die;
}



//验证模板文件
if(file_exists($tpl."/".$templates)){

    //css
	$cssFile = array(
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
		'admin/waimai/paotuiOrderDetail.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
