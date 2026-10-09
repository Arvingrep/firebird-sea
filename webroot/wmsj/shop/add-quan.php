<?php

/**
 * 店铺管理 外卖券管理
 *
 * @version        $Id: list_list.php 2017-4-25 上午10:16:21 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

define('HUONIAOADMIN', "../" );

require_once(dirname(__FILE__)."/../inc/config.inc.php");

$dsql = new dsql($dbo);

$userLogin = new userLogin($dbo);

$tpl = dirname(__FILE__)."/../templates/touch/shop";

$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$templates = "waimaiQuanAdd.html";

$dbname = "waimai_quan";

//表单提交

if($_POST){

    $id               = (int)$id;

    if($id && !checkWaimaiShopManager($id, "quan")){

        echo '{"state": 200, "info": "操作失败，请刷新页面！"}';

        exit();

    }



    $deadline       = strtotime($deadline);

    $money          = (float)$money;

    $basic_price    = (float)$basic_price;

    $limit          = (int)$limit;

    $number         = (int)$number;

    $shopids        = (int)$shopid;

    $managerarr = explode(',',$managerIds);

    $pubdate       = GetMkTime(time());

    if(!in_array($shopids,$managerarr)){

        echo '{"state": 200, "info": "未找到该店铺！"}';

        exit();
    }
    if(empty($shopids)){

        echo '{"state": 200, "info": "请选择店铺！"}';

        exit();
    }

    if($id){



        //验证商品是否存在

        $sql = $dsql->SetQuery("SELECT `id`,`number`,`received` FROM `#@__$dbname` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "totalCount");
        $res = $dsql->dsqlOper($sql, "results");
        if($ret <= 0){

            echo '{"state": 200, "info": "优惠券不存在或已经删除！"}';

            exit();

        }

        if($basic_price > 0){
          $name = '满'.$basic_price.'减'.$money;
        }else{
          $name = $money . echoCurrency(array("type" => "short")) . '无门槛券';
        }

        $sent = (int)$res[0]['number'] - (int)$res[0]['received'];

        $updatesql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `name` = '$name',`deadline` = '$deadline',`money` = '$money',`basic_price` = '$basic_price',`limit`  = '$limit',`number`  ='$number',`sent`= '$sent',`pubdate`='$pubdate' WHERE `id` = '$id'");

        $updateres = $dsql->dsqlOper($updatesql,"update");

        if($updateres == "ok"){

            //记录用户行为日志
            memberLog($userid, 'waimai', 'quan', $id, 'update', '修改优惠券('.$name.')', '', $updatesql);

            echo '{"state": 100, "info": '.json_encode("保存成功！").'}';
        }else{
            echo '{"state": 200, "info": "数据更新失败，请检查填写的信息是否合法！"}';
        }

        require_once HUONIAOROOT."/api/payment/log.php";
        //初始化日志
        $_waimaiFoodEditLog = new CLogFileHandler(HUONIAOROOT . '/log/waimaiQuanEdit/'.date('Y-m-d').'.log', true);
        $data = "会员（id:".$userLogin->getMemberID()."）修改优惠券 ".($ret == "ok" ? "ok" : "err")." ：".$id." - ".$updatesql;
        $_waimaiFoodEditLog->DEBUG($data . "\r\n");

        die;



    }else{
      if($basic_price > 0){
        $name = '满'.$basic_price.'减'.$money;
      }else{
        $name = $money . echoCurrency(array("type" => "short")) . '无门槛券';
      }

        $insersql = $dsql->SetQuery("INSERT INTO `#@__$dbname` (`deadline`,`name`,`money`,`basic_price`,`limit`,`number`,`sent`,`shoptype`,`shopids`,`announcer`,`deadline_type`,`pubdate`) VALUES ('$deadline','$name','$money','$basic_price','$limit','$number','$number','1','$shopids','1','1','$pubdate')");

        $aid = $dsql->dsqlOper($insersql, "lastid");



        if(is_numeric($aid)){

            //记录用户行为日志
            memberLog($userid, 'waimai', 'quan', $aid, 'insert', '添加优惠券('.$name.')', '', $insersql);

            echo '{"state": 100, "id": '.$aid.', "info": '.json_encode("添加成功！").'}';

        }else{

            echo '{"state": 200, "info": "数据插入失败，请检查填写的信息是否合法！"}';

        }

        die;


    }




}



$sql = $dsql->SetQuery("SELECT `shopname`,`id` FROM `#@__waimai_shop` WHERE `id` IN ($managerIds)");
//
$ret = $dsql->dsqlOper($sql, "results");

if(!$ret){

    header("location:manage-quan.php");

    die;

}

$huoniaoTag->assign('shoparr', $ret);

//$shop = $ret[0];
//
//
//
//$shopname = $shop['shopname'];


//验证模板文件

if(file_exists($tpl."/".$templates)){


    if($cfg_remoteStatic){
        $staticPath_ = $cfg_remoteStatic . '/static/';
    }else{
        $staticPath_ = $cfg_staticPath;
    }

    // $jsFile = array(
    //     '/static/js/ui/bootstrap.min.js',
    //     '/static/js/ui/bootstrap-datetimepicker.min.js',
    //     'shop/waimaiQuanAdd.js',
    // );
    // $huoniaoTag->assign('jsFile', $jsFile);
    //
    // $cssFile = array(
    //     '/static/css/core/base.css',
    //     '/static/css/admin/datetimepicker.css'
    // );
    //
    //
    // $huoniaoTag->assign('cssFile', $cssFile);

    $huoniaoTag->assign('templets_skin', $cfg_secureAccess.$cfg_basehost."/wmsj/templates/touch/");  //模块路径


    $huoniaoTag->assign('id', (int)$id);

//    $huoniaoTag->assign('sid', (int)$sid);
//
//    $huoniaoTag->assign('shopname', $shopname);


    //获取信息内容

    if($id){

        $sql = $dsql->SetQuery("SELECT * FROM `#@__$dbname` WHERE `id` = $id  AND `announcer` = 1");

        $ret = $dsql->dsqlOper($sql, "results");

        if($ret){



            foreach ($ret[0] as $key => $value) {


                //限制开始、结束日期

                if($key == "deadline"){

                    $value = $value ? date("Y-m-d H:i:s", $value) : "";

                }



                $huoniaoTag->assign($key, $value);

            }



        }else{

            showMsg("没有找到相关信息！", "-1");

            die;

        }

    }




    $huoniaoTag->assign('sid', $sid);
    $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);

    $huoniaoTag->display($templates);

}else{

    echo $templates."模板文件未找到！";

}
