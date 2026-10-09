<?php
/**
 * 店铺管理 外卖券列表
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
$touchtpl = dirname(__FILE__)."/../templates/touch/shop";
$huoniaoTag->template_dir = $touchtpl; //设置移动端后台模板目录
$templates = "waimaiQuan.html";
$dbname = "waimai_quan";
if(!empty($action) && !empty($id)){
    if(!checkWaimaiShopManager($id, "quan")){
        echo '{"state": 200, "info": "操作失败，请刷新页面！"}';
        exit();
    }
}

if($action =='end'){

    $upstatesql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `state` = 1 WHERE `id` = $id");

    $upstateres = $dsql->dsqlOper($upstatesql,"update");

    if($upstateres == 'ok'){
        echo '{"state": 100, "info": "更新成功！"}';
        exit();
    }else{
        echo '{"state": 200, "info": "更新失败！"}';
        exit();
    }
}

if($action =='del'){

    $upstatesql = $dsql->SetQuery("DELETE FROM `#@__$dbname`  WHERE `id` = $id");

    $upstateres = $dsql->dsqlOper($upstatesql,"update");

    if($upstateres == 'ok'){
        /*删除已经领取券的用户*/

        $delsql = $dsql->SetQuery("DELETE FROM `#@__waimai_quanlist` WHERE `qid` = $id");
        $dsql->dsqlOper($delsql, "update");

        echo '{"state": 100, "info": "删除成功！"}';
        exit();
    }else{
        echo '{"state": 200, "info": "删除失败！"}';
        exit();
    }
}


//if(empty($sid)){
//    header("location:waimaiShop.php");
//    die;
//}

$sql = $dsql->SetQuery("SELECT `shopname`,`id` FROM `#@__waimai_shop` WHERE `id` in($managerIds)");
$ret = $dsql->dsqlOper($sql, "results");
if(!$ret){
    header("location:waimaiShop.php");
    die;
}

if($action == 'quanList'){
//商品名称
    if(!empty($keywords)){
        $where .= " AND `name` like ('%$keywords%')";
    }

    //编号
    if(!empty($state)){
        if($state == 2){

            $where .= " AND `sent` = 0";

        }elseif($state == 1){

            $where .= " AND `state` = 0 AND `sent` !=0";

        }elseif($state == 3){

            $where .= " AND `state` = 1";
        }
    }



    $pageSize = 15;

    $page = (int)$page == 0 ? 1 : (int)$page;

    $list = $pageinfo =  array();

    // $sql = $dsql->SetQuery("SELECT `id`,`name`,`state`,`deadline`,`limit`,`number`,`sent`,`received` FROM `#@__waimai_quan` WHERE FIND_IN_SET(`shopids`,'$managerIds') AND `announcer` = 1".$where);
      $sql = $dsql->SetQuery("SELECT `id`,`name`,`state`,`deadline`,`limit`,`number`,`sent`,`received`,`pubdate` FROM `#@__waimai_quan` WHERE  `shopids` = '$shopid' AND `announcer` = 1".$where);
    //总条数
    $totalCount = $dsql->dsqlOper($sql, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount/$pageSize);
    if ($totalCount == 0) {echo json_encode(array("state" => 200, "info" => '暂无数据！'));die;}

    $pageinfo = array(
        "page" => $page,
        "pageSize" => $pageSize,
        "totalPage" => $totalPage,
        "totalCount" => $totalCount
    );

    $atpage = $pageSize * ($page - 1);
    $results = $dsql->dsqlOper($sql." ORDER BY `id` DESC LIMIT $atpage, $pageSize", "results");

    foreach ($results as $key => $value) {
        $list[$key]['id']       = $value['id'];
        $list[$key]['name']     = $value['name'];
        $list[$key]['state']    = $value['state'];
        $list[$key]['deadline'] = date('Y-m-d',$value['deadline']);
        $list[$key]['limit']    = $value['limit'];
        $list[$key]['number']   = $value['number'];
        $list[$key]['sent']     = $value['sent'];
        $list[$key]['received']     = $value['received'];
        $list[$key]['pubdate'] = date('Y-m-d',$value['pubdate']);

        $used = 0;
        $sql = $dsql->SetQuery("SELECT count(`id`) totalUsed FROM `#@__waimai_quanlist` WHERE `qid` = " . $value['id'] . " AND `state` = 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
          $used = $ret[0]['totalUsed'];
        }
        $list[$key]['used']     = $used;

    }

    echo json_encode(array('state' =>100 ,'info' =>array("pageInfo" => $pageinfo, "list" => $list)));die;
}

if($action == 'quandetail'){
    $templates = 'waimaiQuanDetail.html';

    $sql = $dsql->SetQuery("SELECT `deadline`,`money`,`basic_price`,`number`,`limit` FROM `#@__waimai_quan` WHERE `id` = '$id' AND `announcer` = 1");

    $res = $dsql->dsqlOper($sql,"results");

    if($res){
        $deadline = date('Y-m-d',$res[0]['deadline']);

        $huoniaoTag->assign('deadline', $deadline);
        $huoniaoTag->assign('money', $res[0]['money']);
        $huoniaoTag->assign('basic_price', $res[0]['basic_price']);
        $huoniaoTag->assign('number', $res[0]['number']);
        $huoniaoTag->assign('limit', $res[0]['limit']);

    }else{
        echo '{"state": 200, "info": "操作失败！"}';
        exit();
    }

}

//验证模板文件
if(file_exists($touchtpl."/".$templates)){


    $jsFile = array(
        'touch/shop/waimaiQuan.js'
    );
    $huoniaoTag->assign('jsFile', $jsFile);
    $huoniaoTag->assign('sid', $sid);
    $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);
    $huoniaoTag->assign('templets_skin', $cfg_secureAccess.$cfg_basehost."/wmsj/templates/touch/");  //模块路径
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
