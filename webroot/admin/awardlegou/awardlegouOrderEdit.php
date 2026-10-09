<?php
/**
 * 查看修改团购订单信息
 *
 * @version        $Id: tuanOrderEdit.php 2013-12-11 上午10:53:46 $
 * @package        HuoNiao.Tuan
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
checkPurview("awardlegouOrderList");
$dsql                     = new dsql($dbo);
$tpl                      = dirname(__FILE__) . "/../templates/awardlegou";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates                = "awardlegouOrderEdit.html";

$action    = "awardlegou_order";
$pagetitle = "查看修改团购订单";
$dopost    = $dopost ? $dopost : "edit";

if ($dopost != "") {
    //对字符进行处理
    $useraddr = cn_substrR($useraddr, 50);
    $username = cn_substrR($username, 10);
}

if ($dopost == "edit") {

    $pagetitle = "修改团购订单信息";

    if ($submit == "提交") {

        //表单二次验证
        if (trim($useraddr) == '') {
            echo '{"state": 200, "info": "请输入街道地址"}';
            exit();
        }
        if (trim($username) == '') {
            echo '{"state": 200, "info": "请输入收货人姓名"}';
            exit();
        }
        if (trim($usercontact) == '') {
            echo '{"state": 200, "info": "请输入联系电话"}';
            exit();
        }

        //保存
        $archives = $dsql->SetQuery("UPDATE `#@__" . $action . "` SET `useraddr` = '" . $useraddr . "', `username` = '" . $username . "', `usercontact` = '" . $usercontact . "', `usernote` = '" . $usernote . "', `deliveryType` = " . $deliveryType . " WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "update");

        if ($results != "ok") {
            echo '{"state": 200, "info": "保存失败！"}';
            exit();
        }

        adminLog("修改团购订单配送信息", $id);

        echo '{"state": 100, "info": "修改成功！"}';
        exit();

    } else {
        if (!empty($id)) {
            global $juhe_express_company;
            //主表信息
            $archives = $dsql->SetQuery("SELECT * FROM `#@__" . $action . "` WHERE `id` = " . $id);
            $results  = $dsql->dsqlOper($archives, "results");

            if (!empty($results)) {

                $ordernum = $results[0]["ordernum"];
                if( $results[0]['pintype'] ==0){
                    $pnumbersql = $dsql->SetQuery("SELECT `oid` FROM `#@__awardlegou_pin` WHERE  `id` = '".$results[0]['pinid']."'");
                    $pnumberres = $dsql->dsqlOper($pnumbersql,"results");
                    if($pnumberres){
                        $ordernum   = $pnumberres[0]['oid'];
                    }
                }
                $people   = $results[0]["username"];
                $userid   = $results[0]["userid"];
                $reward   = $results[0]["reward"];
                $is_paytuikuanlogtic   = $results[0]["is_paytuikuanlogtic"];

                //用户名
                $userSql  = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = " . $results[0]["userid"]);
                $username = $dsql->dsqlOper($userSql, "results");
                if (count($username) > 0) {
                    $username = $username[0]['nickname'];
                } else {
                    $username = "未知";
                }

                $proid = $results[0]["proid"];

                //团购商品
                $proSql    = $dsql->SetQuery("SELECT `title`, `prizetype`,`prize`,`hongbao`,`hongbaotype`,`numbe` FROM `#@__awardlegou_list` WHERE `id` = " . $results[0]["proid"]);
                $proResult = $dsql->dsqlOper($proSql, "results");
                if (count($proResult) > 0) {
                    $proname        = $proResult[0]['title'];
                    $numbe          = $proResult[0]['numbe'];
                    $prizetype      = $proResult[0]['prizetype'];
                    $prizetypename  = $proResult[0]['prizetype'] == '0' ? '实物奖励' : '红包奖励';
                    $prize          = $proResult[0]['prize'];
                    $hongbao        = strpos($proResult[0]['hongbao'],'%') ? str_replace('%','',$proResult[0]['hongbao']) * $results[0]['amount'] /100: $proResult[0]['hongbao'];
                    $hongbaotype    = $proResult[0]['hongbaotype'] == '0' ? '随机分配' : '平均分配';

                } else {
                    $proname = "未知";
                }

                $param  = array(
                    "service"  => "awardlegou",
                    "template" => "detail",
                    "id"       => $proid
                );
                $prourl = getUrlPath($param);

                $procount = $results[0]["procount"];

                //计算运费
                // $price = $results[0]["orderprice"];
                // if($proResult[0]['tuantype'] == 2){
                // 	if($procount < $proResult[0]["freeshi"] && $results[0]['emstype'] == 0){
                // 		$price = $price + $proResult[0]['freight'];
                // 	}
                // }
                // $list[$key]["orderprice"] = sprintf("%.2f", $price);
                // $orderprice = sprintf("%.2f", $price);


                $orderprice = $results[0]['amount'];
                $point      = $results[0]['point'];
                $balance    = $results[0]['balance'];
                $payprice   = $results[0]['payprice'];
                $retExpnumber    = $results[0]['ret-expnumber'];
                $retExpcompany   = $results[0]['ret-expcompany'];

                $retExpcompanyname = $juhe_express_company[$retExpcompany];
                //总价
                $totalAmount  += $orderprice * $procount;
                $freeshiMoney = 0;

                if (!empty($propolic) && !empty($policy)) {
                    $freight = $policy['freight'];
                    $freeshi = $policy['freeshi'];

                    //如果达不到免物流费的数量，则总价再加上运费
                    if ($procount <= $freeshi) {
                        $totalAmount  += $freight;
                        $freeshiMoney = $freight;
                    }
                }


                $expCompany = $results[0]['exp-company'];
                $expNumber  = $results[0]['exp-number'];
                $expDate    = $results[0]['exp-date'];

                $orderstate = $results[0]["orderstate"];

                $expDate  = $results[0]['exp-date'];
                $retState = $results[0]['ret-state'];

                $retOkdate = $results[0]['ret-ok-date'];


                $retType = $results[0]['ret-type'];
                $retNote = $results[0]['ret-note'];

                $imglist = array();
                $pics    = $results[0]['ret-pics'];
                if (!empty($pics)) {
                    $pics = explode(",", $pics);
                    foreach ($pics as $key => $value) {
                        $imglist[$key]['val']  = $value;
                        $imglist[$key]['path'] = getFilePath($value);
                    }
                }
                $retPics = $imglist;

                $retDate  = $results[0]['ret-date'];
                $retSnote = $results[0]['ret-s-note'];

                $imglist = array();
                $pics    = $results[0]['ret-s-pics'];
                if (!empty($pics)) {
                    $pics = explode(",", $pics);
                    foreach ($pics as $key => $value) {
                        $imglist[$key]['val']  = $value;
                        $imglist[$key]['path'] = getFilePath($value);
                    }
                }

                $retSpics     = $imglist;
                $retSdate     = $results[0]['ret-s-date'];
                $orderdate    = date('Y-m-d H:i:s', $results[0]["orderdate"]);
                $paytype      = $results[0]["paytype"];
                $paydate      = date('Y-m-d H:i:s', $results[0]["paydate"]);
                $deliveryType = $results[0]["deliveryType"];
                $useraddr     = $results[0]["useraddr"];
                $usercontact  = $results[0]["usercontact"];
                $usernote     = $results[0]["usernote"];

                /*中奖会员信息*/

                $zjusersql = $dsql->SetQuery("SELECT m.`username`,m.`nickname` FROM `#@__awardlegou_order` o LEFT  JOIN `#@__member` m ON o.`userid` = m.`id` WHERE o.`pinid` = '".$results[0]['pinid']."' AND `is_wining` = 1");

                $zjuserres = $dsql->dsqlOper($zjusersql,"results");

                $zjusername = '';
                if($zjuserres ){
                    $zjusername = $zjuserres[0]['nickname'] ? $zjuserres[0]['nickname'] : $zjuserres[0]['nickname'] ;
                }

                /*乐购有奖发起人*/
                $archives   = $dsql->SetQuery("SELECT `userid`,`user`,`people` FROM `#@__awardlegou_pin` WHERE `id` = '".$results[0]["pinid"]."'");
                $memberres  = $dsql->dsqlOper($archives,"results");
                if($memberres){
                    $fqnamesql = $dsql->SetQuery("SELECT `username`,`nickname` FROM `#@__member` WHERE 1=1");
                    $fqnameres = $dsql->dsqlOper($fqnamesql." AND `id` = '".$memberres[0]['userid']."'","results");
                    $fqname    = $fqnameres[0]['nickname'] ? $fqnameres[0]['nickname'] : $fqnameres[0]['username'];
                    $fquid     = $memberres[0]['userid'];
                    $userarr     = explode(',',$memberres[0]['user']);
                    $cyusernamearr = array();
                    if($userarr){
                        foreach ($userarr as $v){
                            $cynameres = $dsql->dsqlOper($fqnamesql." AND `id` = '$v'","results");
                            if($cynameres){
                                $cyarr['name'] = $cynameres[0]['nickname'] ? $cynameres[0]['nickname'] : $cynameres[0]['username'];
                                $cyarr['uid'] = $v;
                                array_push($cyusernamearr,$cyarr);
                            }
                        }
                    }
//                    $canyuname = $usernamearr ? join(',',$userarr) : '' ;

                    $people    = $memberres[0]['people'];
                }


            } else {
                ShowMsg('要修改的信息不存在或已删除！', "-1");
                die;
            }

        } else {
            ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
            die;
        }
    }
}

if($dopost == "updatestate"){

    if($id =='') return;
    //主表信息
    $archives = $dsql->SetQuery("SELECT * FROM `#@__" . $action . "` WHERE `orderstate` = 9 AND  `id` = " . $id);
    $results  = $dsql->dsqlOper($archives, "results");

    if($results){

        $time = time();
        $updatesql = $dsql->SetQuery("UPDATE `#@__" . $action . "` SET `ret-expnumber` = '$expNumber', `ret-expcompany` = '$expCompany',`ret-expdate` = '$time' WHERE `id` = '$id'");

        $results   = $dsql->dsqlOper($updatesql,"update");

        if($results == 'ok'){
            echo '{"state": 100, "info": "发货成功"}';
            exit();
        }else{

            echo '{"state": 200, "info": "更新失败"}';
            exit();
        }
    }


}

//验证模板文件
if (file_exists($tpl . "/" . $templates)) {

    //js
    $jsFile = array(
        'ui/jquery.dragsort-0.5.1.min.js',
        'admin/awardlegou/awardlegouOrderEdit.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('action', $action);
    $huoniaoTag->assign('pagetitle', $pagetitle);
    $huoniaoTag->assign('dopost', $dopost);
    $huoniaoTag->assign('id', $id);
    $huoniaoTag->assign('ordernum', $ordernum);
    $huoniaoTag->assign('userid', $userid);
    $huoniaoTag->assign('username', $username);
    $huoniaoTag->assign('people', $people);
    $huoniaoTag->assign('proid', $proid);
    $huoniaoTag->assign('proname', $proname);
    $huoniaoTag->assign('prourl', $prourl);
    $huoniaoTag->assign('procount', $procount);
    $huoniaoTag->assign('point', $point);
    $huoniaoTag->assign('balance', $balance);
    $huoniaoTag->assign('payprice', $payprice);
    $huoniaoTag->assign('orderprice', $orderprice);
    $huoniaoTag->assign('totalAmount', $totalAmount);
    $huoniaoTag->assign('freeshiMoney', $freeshiMoney);
    $huoniaoTag->assign('expCompany', $expCompany);
    $huoniaoTag->assign('retExpcompanyname', $retExpcompanyname);
    $huoniaoTag->assign('expNumber', $expNumber);
    $huoniaoTag->assign('expDate', $expDate == 0 ? 0 : date("Y-m-d H:i:s", $expDate));
    $huoniaoTag->assign('orderstate', $orderstate);
    $huoniaoTag->assign('retState', $retState);
    $huoniaoTag->assign('orderdate', $orderdate);
    $huoniaoTag->assign('retOkdate', $retOkdate == 0 ? 0 : date("Y-m-d H:i:s", $retOkdate));

    $huoniaoTag->assign('retType', $retType);
    $huoniaoTag->assign('retNote', $retNote);
    $huoniaoTag->assign('retPics', $retPics);
    $huoniaoTag->assign('retDate', $retDate == 0 ? 0 : date("Y-m-d H:i:s", $retDate));
    $huoniaoTag->assign('retSnote', $retSnote);
    $huoniaoTag->assign('retSpics', $retSpics);
    $huoniaoTag->assign('retSdate', $retSdate == 0 ? 0 : date("Y-m-d H:i:s", $retSdate));

    /*奖励*/
    $huoniaoTag->assign('proname', $proname);
    $huoniaoTag->assign('prizetype', $prizetype);
    $huoniaoTag->assign('prizetypename', $prizetypename);
    $huoniaoTag->assign('prize', $prize!='' ? json_decode($prize,true) : array());
    $huoniaoTag->assign('hongbao', $hongbao);
    $huoniaoTag->assign('hongbaotype', $hongbaotype);

    $huoniaoTag->assign('fqname', $fqname);
    $huoniaoTag->assign('zjusername', $zjusername);
    $huoniaoTag->assign('fquid', $fquid);
    $huoniaoTag->assign('cyusernamearr', $cyusernamearr);
    $huoniaoTag->assign('people', $people);//已参与人数
    $huoniaoTag->assign('numbe', $numbe);//人员限制
    $huoniaoTag->assign('reward', $reward);//人员限制


    $huoniaoTag->assign('retExpnumber', $retExpnumber);//人员限制
    $huoniaoTag->assign('retExpcompany', $retExpcompany);//人员限制
    $huoniaoTag->assign('is_paytuikuanlogtic', $is_paytuikuanlogtic);// 是否支付运费


    //主表信息
    $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '" . $paytype . "'");
    $ret = $dsql->dsqlOper($sql, "results");
    if (!empty($ret)) {
        $huoniaoTag->assign('paytype', $ret[0]['pay_name']);
    } else {

        global $cfg_pointName;
        $payname = "";
        if ($paytype == "point,money") {
            $payname = $cfg_pointName . "+余额";
        } elseif ($paytype == "point") {
            $payname = $cfg_pointName;
        } elseif ($paytype == "money") {
            $payname = "余额";
        } else {
            $payname = $paytype;
        }
        $huoniaoTag->assign('paytype', $payname);
    }

    $huoniaoTag->assign('paydate', $paydate);
    $huoniaoTag->assign('useraddr', $useraddr);
    $huoniaoTag->assign('username', $username);
    $huoniaoTag->assign('usercontact', $usercontact);

    $huoniaoTag->assign('deliveryTypeList', array(1 => '只工作日送货', 2 => '只双休日、假日送货', 3 => '学校地址/地址白天没人', 4 => '工作日、双休日与假日均可送货'));
    $huoniaoTag->assign('deliveryType', $deliveryType);

    $huoniaoTag->assign('usernote', $usernote);
    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/awardlegou";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}
