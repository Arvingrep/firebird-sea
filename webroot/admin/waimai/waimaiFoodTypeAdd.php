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
$tpl = dirname(__FILE__)."/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "waimaiFoodTypeAdd.html";

checkPurview("waimaiListType");

$dbname = "waimai_list_type";

if(empty($sid)){
    header("location:waimaiList.php");
    die;
}

$sql = $dsql->SetQuery("SELECT `shopname` FROM `#@__waimai_shop` WHERE `id` = $sid");
$ret = $dsql->dsqlOper($sql, "results");
if(!$ret){
    header("location:waimaiList.php");
    die;
}
$shop = $ret[0];

$shopname = $shop['shopname'];




//表单提交
if($_POST){

    //获取表单数据
    $id       = (int)$id;
    $sort     = (int)$sort;
    $status   = (int)$status;
    $weekshow = (int)$weekshow;
    $week     = isset($week) ? join(',',$week) : '';

    if($id){

        //验证店铺是否存在
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__$dbname` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "totalCount");
        if($ret <= 0){
            echo '{"state": 200, "info": "分类不存在或已经删除！"}';
			exit();
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
			echo '{"state": 100, "id": '.$aid.', "info": '.json_encode("添加成功！").'}';
		}else{
			echo '{"state": 200, "info": "数据插入失败，请检查填写的信息是否合法！"}';
		}
		die;

    }

}


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
		'ui/jquery-ui-timepicker-addon.js',
		'admin/waimai/waimaiFoodTypeAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('id', (int)$id);
    $huoniaoTag->assign('sid', (int)$sid);
    $huoniaoTag->assign('shopname', $shopname);


    //获取信息内容
    if($id){
        $sql = $dsql->SetQuery("SELECT * FROM `#@__$dbname` WHERE `id` = $id");
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



    $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
