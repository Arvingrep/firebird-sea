<?php
/**
 * 店铺管理 新建商品分类
 *
 * @version        $Id: list_type_new.php 2017-4-25 上午10:16:21 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "../" );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$dbname = "waimai_list_type";
$templates = "waimaiFoodTypeAdd.html";

if(empty($sid)){
    if($_POST){
        echo '{"state": 200, "info": "操作失败，请刷新页面！"}';
        die;
    }else{
        showMsg("没有找到相关信息！", "-1");
        die;
    }

}

$where = " AND `id` in ($managerIds)";
$sql = $dsql->SetQuery("SELECT `shopname` FROM `#@__waimai_shop` WHERE `id` = $sid".$where);
$ret = $dsql->dsqlOper($sql, "results");
if(!$ret){
    if($_POST){
        echo '{"state": 200, "info": "操作失败，请刷新页面！"}';
        die;
    }else{
        showMsg("没有找到相关信息！", "-1");
        die;
    }
}
$shop = $ret[0];

$shopname = $shop['shopname'];




//表单提交
if($_POST){

    //获取表单数据
    $id       = (int)$id;
    $upsort   = (int)$upsort;
    $sort     = (int)$sort;
    $status   = (int)$status;
    $weekshow = (int)$weekshow;
    $week     = $week && isset($week) ? join(',',$week) : '';
    $week     = str_replace(',all', '', $week);

    if($id){

        //验证分类是否存在
        $where = " AND `sid` in ($managerIds)";
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__$dbname` WHERE `id` = $id".$where);
        $ret = $dsql->dsqlOper($sql, "totalCount");
        if($ret <= 0){
            echo '{"state": 200, "info": "分类不存在或已经删除！"}';
			exit();
        }

    }
    if($upsort){
        if(!empty($sortarr)){
            $error  = array();
            foreach ($sortarr as $a => $b){
                $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET
                    `sort` = '".$b['sort']."'
                  WHERE `id` = '".$b['id']."'
                ");
                $ret = $dsql->dsqlOper($sql, "update");
                if($ret != "ok"){
                   array_push($error,$b['id']);
                }
            }
        }
        if(count($error) > 0){
            echo '{"state": 200, "info": '.json_encode($error).'}';
            exit();
        }else{
            echo '{"state": 100, "info": '.json_encode("保存成功！").'}';
        }
    }


    //修改
    if($id){

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET
            `sort` = '$sort',
            `title` = '$title',
            `status` = '$status',
            `start_time` = '$start_time',
            `end_time` = '$end_time',
            `weekshow` = '$weekshow',
            `week` = '$week'
          WHERE `id` = $id
        ");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){

            //记录用户行为日志
            memberLog($userid, 'waimai', 'foodtype', $id, 'update', '更新商品分类('.$title.')', '', $sql);

			echo '{"state": 100, "info": '.json_encode("保存成功！").'}';
		}else{
			echo '{"state": 200, "info": "数据更新失败，请检查填写的信息是否合法！"}';
		}
        die;


    //新增
    }else{

        $sql      = $dsql->SetQuery("SELECT `id` FROM `#@__$dbname` WHERE `sid` = $sid");
        $ret      = $dsql->dsqlOper($sql, "totalCount");
        $sort     = 0;
        if($ret !=0){
            $sort = (int)$ret+1;
        }
        //保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__$dbname` (
            `sid`,
            `title`,
            `sort`,
            `status`,
            `start_time`,
            `end_time`,
            `weekshow`,
            `week`
        ) VALUES (
            '$sid',
            '$title',
            '$sort',
            '$status',
            '$start_time',
            '$end_time',
            '$weekshow',
            '$week'
        )");
		$aid = $dsql->dsqlOper($archives, "lastid");

		if($aid){

            //记录用户行为日志
            memberLog($userid, 'waimai', 'foodtype', $aid, 'insert', '添加商品分类('.$title.')', '', $archives);

			echo '{"state": 100, "id": '.$aid.', "info": '.json_encode("添加成功！").'}';
		}else{
			echo '{"state": 200, "info": "数据插入失败，请检查填写的信息是否合法！"}';
		}
		die;

    }

}

$huoniaoTag->assign('id', (int)$id);
$huoniaoTag->assign('sid', (int)$sid);
$huoniaoTag->assign('shopname', $shopname);


//获取信息内容
if($id){
    $where = " AND `sid` in ($managerIds)";
    $sql = $dsql->SetQuery("SELECT * FROM `#@__$dbname` WHERE `id` = $id".$where);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){

        foreach ($ret[0] as $key => $value) {
            $huoniaoTag->assign($key, $value);
        }

    }else{
        showMsg("没有找到相关信息！", "-1");
        die;
    }
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

    $jsFile = array(
        'shop/waimaiFoodTypeAdd.js'
    );
    $huoniaoTag->assign('jsFile', $jsFile);

    $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
