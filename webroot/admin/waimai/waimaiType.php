<?php
/**
 * 店铺管理 店铺分类
 *
 * @version        $Id: type.php 2017-4-25 上午10:16:21 $
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
$templates = "waimaiType.html";

checkPurview("waimaiType");

$dbname = "waimai_shop_type";

//删除店铺分类
if($action == "delete"){

	if(!testPurview("waimaiTypeDel")){
	  die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}

    if(!empty($id)){
        $sql = $dsql->SetQuery("SELECT `icon` FROM `#@__$dbname` WHERE `id` = $id");
        $res = $dsql->dsqlOper($sql, "results");
        if(!$res){
            echo '{"state": 200, "info": "分类不存在！"}';
            exit();
        }
        if($res[0]['icon']){
            delPicFile($res[0]['icon'], "deladvthumb", "waimai");
        }

        $sql = $dsql->SetQuery("DELETE FROM `#@__$dbname` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){
            echo '{"state": 100, "info": "删除成功！"}';
    		exit();
        }else{
            echo '{"state": 200, "info": "删除失败！"}';
    		exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
		exit();
    }
}

//默认数据
if($dopost == "importDefaultData"){
    $importRes = array("state"=>100,"info"=>"操作成功");

    $sqls =  getDefaultSql();
    $sqls = explode(";",$sqls);
    foreach ($sqls as $sqlItem){
        $sqlItem = $dsql::SetQuery($sqlItem);
        $dsql->update($sqlItem);
    }

    adminLog("导入默认数据", "外卖分类");
    echo json_encode($importRes);
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
		'admin/waimai/waimaiType.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));


    $list = array();
    $sql = $dsql->SetQuery("SELECT * FROM `#@__$dbname` ORDER BY `sort` DESC, `id` DESC");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach ($ret as $key => $value) {
            $list[$key]['id'] = $value['id'];
            $list[$key]['title'] = $value['title'];
            $list[$key]['sort'] = $value['sort'];
            $list[$key]['index_show'] = (int)$value['index_show'];
        }
    }

    $huoniaoTag->assign('sid', $sid);
    $huoniaoTag->assign('shopname', $shopname);
    $huoniaoTag->assign('list', $list);

	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}




/**
 * 获取默认数据
*/
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__waimai_shop_type`;
ALTER TABLE `#@__waimai_shop_type` AUTO_INCREMENT = 1;
INSERT INTO `#@__waimai_shop_type` (`id`, `title`, `sort`, `icon`, `paotui`) VALUES ('1', '美食', '0', 'https://upload.ihuoniao.cn//waimai/advthumb/large/2019/02/15/15502207585564.png', '0');
INSERT INTO `#@__waimai_shop_type` (`id`, `title`, `sort`, `icon`, `paotui`) VALUES ('2', '快餐', '0', 'https://upload.ihuoniao.cn//waimai/advthumb/large/2019/02/15/15502206581757.png', '0');
INSERT INTO `#@__waimai_shop_type` (`id`, `title`, `sort`, `icon`, `paotui`) VALUES ('3', '便当', '0', 'https://upload.ihuoniao.cn//waimai/advthumb/large/2019/02/15/15502205001176.png', '0');
INSERT INTO `#@__waimai_shop_type` (`id`, `title`, `sort`, `icon`, `paotui`) VALUES ('4', '特色菜系', '0', 'https://upload.ihuoniao.cn//waimai/advthumb/large/2018/09/27/15380467688801.png', '0');
INSERT INTO `#@__waimai_shop_type` (`id`, `title`, `sort`, `icon`, `paotui`) VALUES ('5', '异国料理', '0', 'https://upload.ihuoniao.cn//waimai/advthumb/large/2018/09/27/15380467626770.png', '0');
INSERT INTO `#@__waimai_shop_type` (`id`, `title`, `sort`, `icon`, `paotui`) VALUES ('6', '小吃夜宵', '0', 'https://upload.ihuoniao.cn//waimai/advthumb/large/2018/09/27/15380467466101.png', '0');
INSERT INTO `#@__waimai_shop_type` (`id`, `title`, `sort`, `icon`, `paotui`) VALUES ('7', '甜品饮品', '0', 'https://upload.ihuoniao.cn//waimai/advthumb/large/2018/09/27/15380467395057.png', '0');
INSERT INTO `#@__waimai_shop_type` (`id`, `title`, `sort`, `icon`, `paotui`) VALUES ('8', '果蔬生鲜', '0', 'https://upload.ihuoniao.cn//waimai/advthumb/large/2018/09/27/15380467302837.png', '0');
INSERT INTO `#@__waimai_shop_type` (`id`, `title`, `sort`, `icon`, `paotui`) VALUES ('9', '商店超市', '0', 'https://upload.ihuoniao.cn//waimai/advthumb/large/2018/09/27/15380467237419.png', '0');
INSERT INTO `#@__waimai_shop_type` (`id`, `title`, `sort`, `icon`, `paotui`) VALUES ('10', '鲜花绿植', '0', 'https://upload.ihuoniao.cn//waimai/advthumb/large/2018/09/27/15380467169561.png', '0');
INSERT INTO `#@__waimai_shop_type` (`id`, `title`, `sort`, `icon`, `paotui`) VALUES ('11', '医药健康', '0', 'https://upload.ihuoniao.cn//waimai/advthumb/large/2018/09/27/15380467111410.png', '0');
INSERT INTO `#@__waimai_shop_type` (`id`, `title`, `sort`, `icon`, `paotui`) VALUES ('12', '早餐', '0', 'https://upload.ihuoniao.cn//waimai/advthumb/large/2018/09/27/15380466971271.png', '0');
INSERT INTO `#@__waimai_shop_type` (`id`, `title`, `sort`, `icon`, `paotui`) VALUES ('13', '午餐', '0', 'https://upload.ihuoniao.cn//waimai/advthumb/large/2018/09/27/15380466901093.png', '0');
INSERT INTO `#@__waimai_shop_type` (`id`, `title`, `sort`, `icon`, `paotui`) VALUES ('14', '下午茶', '0', 'https://upload.ihuoniao.cn//waimai/advthumb/large/2018/09/27/15380466826279.png', '0');
INSERT INTO `#@__waimai_shop_type` (`id`, `title`, `sort`, `icon`, `paotui`) VALUES ('15', '晚餐', '0', 'https://upload.ihuoniao.cn//waimai/advthumb/large/2018/09/27/15380466769525.png', '0');
INSERT INTO `#@__waimai_shop_type` (`id`, `title`, `sort`, `icon`, `paotui`) VALUES ('16', '夜宵', '0', 'https://upload.ihuoniao.cn//waimai/advthumb/large/2018/09/27/15380466697588.png', '0');
INSERT INTO `#@__waimai_shop_type` (`id`, `title`, `sort`, `icon`, `paotui`) VALUES ('21', '跑腿', '0', 'https://upload.ihuoniao.cn//waimai/advthumb/large/2021/01/23/16113899341353.png', '1');
DEFAULTSQL;
}
