<?php
/**
 * 店铺管理 新建店铺分类
 *
 * @version        $Id: create.php 2017-4-25 上午10:16:21 $
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
$templates = "waimaiTypeAdd.html";

checkPurview("waimaiType");

$dbname = "waimai_shop_type";

//表单提交
if($_POST){

    //获取表单数据
    $id       = (int)$id;
    $sort     = (int)$sort;
    $icon     = $icon;
    $paotui   = (int)$paotui;
    $index_show   = (int)$index_show;

    if($id){

        //验证分类是否存在
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__$dbname` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "totalCount");
        if($ret <= 0){
            echo '{"state": 200, "info": "分类不存在或已经删除！"}';
			exit();
        }

    }

    //先重置所有index_show
    $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `index_show` = 0");
    $dsql->dsqlOper($sql, "update");


    //修改
    if($id){

		if(!testPurview("waimaiTypeEdit")){
		  die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
		}

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET
            `sort` = '$sort',
            `title` = '$title',
            `paotui` = '$paotui',
            `index_show` = '$index_show',
            `icon` = '$icon'
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

		if(!testPurview("waimaiTypeAdd")){
		  die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
		}

        //保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__$dbname` (
            `sort`,
            `title`,
            `paotui`,
            `index_show`,
            `icon`
        ) VALUES (
            '$sort',
            '$title',
            '$paotui',
            '$index_show',
            '$icon'
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

    $huoniaoTag->assign('id', (int)$id);


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
        'ui/jquery.dragsort-0.5.1.min.js',
        'publicUpload.js',
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));



    //获取信息内容
    if($id){
        $sql = $dsql->SetQuery("SELECT * FROM `#@__$dbname` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){

            foreach ($ret[0] as $key => $value) {
                if($key == "icon" && $value){
                    $iconturl = getFilePath($value);
                    $huoniaoTag->assign('iconturl', $iconturl);
                }
                $huoniaoTag->assign($key, $value);
            }

        }else{
            showMsg("没有找到相关信息！", "-1");
            die;
        }
    }


	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
