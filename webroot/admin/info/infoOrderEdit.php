<?php
/**
 * 查看修改二手订单信息
 *
 * @version        $Id: infoOrderEdit.php 2013-12-11 上午10:53:46 $
 * @package        HuoNiao.Tuan
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("infoOrderEdit");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/info";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "infoOrderEdit.html";

$action     = "info_order";
$pagetitle  = "查看修改二手订单";
$dopost     = $dopost ? $dopost : "edit";

if($dopost != ""){
    //对字符进行处理
    $useraddr   = cn_substrR($useraddr,50);
    $username   = cn_substrR($username,10);
}

if($dopost == "edit"){

    $pagetitle = "修改二手订单信息";

    if($submit == "提交"){

        //表单二次验证
        if(trim($useraddr) == ''){
            echo '{"state": 200, "info": "请输入街道地址"}';
            exit();
        }
        if(trim($username) == ''){
            echo '{"state": 200, "info": "请输入收货人姓名"}';
            exit();
        }
        if(trim($usercontact) == ''){
            echo '{"state": 200, "info": "请输入联系电话"}';
            exit();
        }

        //保存
        $archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `useraddr` = '".$useraddr."', `username` = '".$username."', `usercontact` = '".$usercontact."', `usernote` = '".$usernote."', `deliveryType` = ".$deliveryType." WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "update");

        if($results != "ok"){
            echo '{"state": 200, "info": "保存失败！"}';
            exit();
        }

        adminLog("修改团购订单配送信息", $id);

        echo '{"state": 100, "info": "修改成功！"}';
        exit();

    }else{
        if(!empty($id)){

            //主表信息
            $archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "results");

            if(!empty($results)){

                $ordernum = $results[0]["ordernum"];
                $people   = $results[0]["people"];
                $userid   = $results[0]["userid"];

                //用户名
                $userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $results[0]["userid"]);
                $username = $dsql->dsqlOper($userSql, "results");
                if(count($username) > 0){
                    $username = $username[0]['username'];
                }else{
                    $username = "未知";
                }

                $proid = $results[0]["prod"];

                //二手商品
                $proSql = $dsql->SetQuery("SELECT * FROM `#@__infolist` WHERE `id` = ". $results[0]["prod"]);
                $proResult = $dsql->dsqlOper($proSql, "results");
                if(count($proResult) > 0){
                    $proname = $proResult[0]['title'];
                }else{
                    $proname = "未知";
                }

                $param = array(
                    "service"     => "info",
                    "template"    => "detail",
                    "id"          => $proid
                );
                $prourl = getUrlPath($param);

                $price = $results[0]['price'];

                $payprice   = $results[0]['payprice'];
                $point = $results[0]['point'];
                $balance = $results[0]['balance'];
                //总价
                $totalAmount = $price;
                $procount = 1;
                $orderprice = $price;

                $tuantype = $results[0]['orderstate'];
                $expCompany = $results[0]['exp-company'];
                $expNumber  = $results[0]['exp-number'];
                $expDate    = $results[0]['exp-date'];

                $orderstate = $results[0]["orderstate"];

                $expDate    = $results[0]['exp-date'];
                $retState   = $results[0]['ret-state'];

                $retOkdate  = $results[0]['ret-ok-date'];


                $retType   = $results[0]['ret-type'];
                $retNote   = $results[0]['ret-note'];

                $imglist = array();
                $pics = $results[0]['ret-pics'];
                if(!empty($pics)){
                    $pics = explode(",", $pics);
                    foreach ($pics as $key => $value) {
                        $imglist[$key]['val'] = $value;
                        $imglist[$key]['path'] = getFilePath($value);
                    }
                }
                $retPics   = $imglist;

                $retDate   = $results[0]['ret-ok-date'];
                $retSnote  = $results[0]['ret-s-note'];

                $imglist = array();
                $pics = $results[0]['ret-s-pics'];
                if(!empty($pics)){
                    $pics = explode(",", $pics);
                    foreach ($pics as $key => $value) {
                        $imglist[$key]['val'] = $value;
                        $imglist[$key]['path'] = getFilePath($value);
                    }
                }
                $retSpics  = $imglist;

                $retSdate  = $results[0]['ret-s-date'];


                $ordermobile = $results[0]["ordermobile"];

                $orderdate = date('Y-m-d H:i:s', $results[0]["orderdate"]);
                $paytype = $results[0]["paytype"];
                $paydate = date('Y-m-d H:i:s', $results[0]["paydate"]);
                $deliveryType = $results[0]["deliveryType"];
                $useraddr = $results[0]["address"];
                $usercontact = $results[0]["contact"];
                $usernote = $results[0]["note"];


            }else{
                ShowMsg('要修改的信息不存在或已删除！', "-1");
                die;
            }

        }else{
            ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
            die;
        }
    }
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

    //js
    $jsFile = array(
        'ui/jquery.dragsort-0.5.1.min.js',
        'admin/info/infoOrderEdit.js'
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
    $huoniaoTag->assign('point', $point);
    $huoniaoTag->assign('balance', $balance);
    $huoniaoTag->assign('tuantype', $tuantype);
    $huoniaoTag->assign('procount', $procount);
    $huoniaoTag->assign('payprice', $payprice);
    $huoniaoTag->assign('totalAmount', $totalAmount);
    $huoniaoTag->assign('expCompany', $expCompany);
    $huoniaoTag->assign('expNumber', $expNumber);
    $huoniaoTag->assign('expDate', $expDate == 0 ? 0 : date("Y-m-d H:i:s", $expDate));
    $huoniaoTag->assign('orderstate', $orderstate);
    $huoniaoTag->assign('retState', $retState);
    $huoniaoTag->assign('ordermobile', $ordermobile);
    $huoniaoTag->assign('cardnum', $cardnum);
    $huoniaoTag->assign('orderprice', $orderprice);
    $huoniaoTag->assign('procount', $procount);
    $huoniaoTag->assign('orderdate', $orderdate);
    $huoniaoTag->assign('retOkdate', $retOkdate == 0 ? 0 : date("Y-m-d H:i:s", $retOkdate));

    $huoniaoTag->assign('retType', $retType);
    $huoniaoTag->assign('retNote', $retNote);
    $huoniaoTag->assign('retPics', $retPics);
    $huoniaoTag->assign('retDate', $retDate == 0 ? 0 : date("Y-m-d H:i:s", $retDate));
    $huoniaoTag->assign('retSnote', $retSnote);
    $huoniaoTag->assign('retSpics', $retSpics);
    $huoniaoTag->assign('retSdate', $retSdate == 0 ? 0 : date("Y-m-d H:i:s", $retSdate));


    //主表信息
    $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '".$paytype."'");
    $ret = $dsql->dsqlOper($sql, "results");
    if(!empty($ret)){
        $huoniaoTag->assign('paytype', $ret[0]['pay_name']);
    }else{

        global $cfg_pointName;
        $payname = "";
        if($paytype == "point,money"){
            $payname = $cfg_pointName."+余额";
        }elseif($paytype == "point"){
            $payname = $cfg_pointName;
        }elseif($paytype == "money"){
            $payname = "余额";
        }else{
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
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/info";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
