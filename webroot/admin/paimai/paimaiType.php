<?php
/**
 * 管理拍卖分类
 */

define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("paimaiType");

$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/paimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "paimaiType.html";

$action = "paimai";

//获取指定ID信息详情
if($dopost == "getTypeDetail"){
    if($id == "") die;
    $archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."type` WHERE `id` = ".$id);
    $results = $dsql->dsqlOper($archives, "results");
    echo json_encode($results);die;

//修改分类
}else if($dopost == "updateType"){
    if(!testPurview("editpaimaiType")){
        die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
    }
    if($id == "") die;
    $archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."type` WHERE `id` = ".$id);
    $results = $dsql->dsqlOper($archives, "results");

    if(!empty($results)){

        if($typename == "") die('{"state": 101, "info": '.json_encode('请输入分类名').'}');
        if($type == "single"){

            if($results[0]['typename'] != $typename){

                //保存到主表
                $archives = $dsql->SetQuery("UPDATE `#@__".$action."type` SET `typename` = '$typename' WHERE `id` = ".$id);
                $results = $dsql->dsqlOper($archives, "update");

            }else{
                //分类没有变化
                echo '{"state": 101, "info": '.json_encode('无变化！').'}';
                die;
            }

        }else{

            //对字符进行处理
            $typename    = cn_substrR($typename,30);
            $seotitle    = cn_substrR($seotitle,80);
            $keywords    = cn_substrR($keywords,60);
            $description = cn_substrR($description,150);
            $hot         = (int)$hot;
            $color       = cn_substrR($color,7);

            //保存到主表
            $archives = $dsql->SetQuery("UPDATE `#@__".$action."type` SET `parentid` = '$parentid', `typename` = '$typename', `seotitle` = '$seotitle', `keywords` = '$keywords', `description` = '$description', `hot` = '$hot', `color` = '$color' WHERE `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "update");

        }

        if($results != "ok"){
            echo '{"state": 101, "info": '.json_encode('分类修改失败，请重试！').'}';
            exit();
        }else{
            adminLog("修改团购分类", $typename);
            echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
            exit();
        }

    }else{
        echo '{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}';
        die;
    }

//删除分类
}else if($dopost == "del"){
    if(!testPurview("editpaimaiType")){
        die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
    }
    if($id == "") die;

    $idsArr = array();
    $idexp = explode(",", $id);

    //获取所有子级
    foreach ($idexp as $k => $id) {
        $childArr = $dsql->getTypeList($id, $action."type", 1);
        if(is_array($childArr)){
            global $data;
            $data = "";
            $idsArr = array_merge($idsArr, array_reverse(parent_foreach($childArr, "id")));
        }
        $idsArr[] = $id;
    }

    // 删除分类图片
    foreach ($idsArr as $kk => $id) {
        //删除分类图标
        $sql = $dsql->SetQuery("SELECT `icon` FROM `#@__paimaitype` WHERE `id` = ".$id." AND `icon` != ''");
        $res = $dsql->dsqlOper($sql, "results");
        if($res){
            delPicFile($res[0]['icon'], "delAdv", "paimai");
        }
    }

    //删除分类下的信息
    // foreach ($idsArr as $kk => $id) {
    //
    // 	//查询此分类下所有信息ID
    // 	$archives = $dsql->SetQuery("SELECT `id`, `litpic`, `pics`, `body` FROM `#@__".$action."list` WHERE `typeid` = ".$id);
    // 	$results = $dsql->dsqlOper($archives, "results");
    //
    // 	if(count($results) > 0){
    // 		foreach($results as $key => $val){
    // 			//删除评论
    // 			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."common` WHERE `aid` = ".$val['id']);
    // 			$dsql->dsqlOper($archives, "update");
    //
    // 			$orderid = array();
    // 			//删除相应的订单、团购券、充值卡数据
    // 			$orderSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."_order` WHERE `proid` = ".$val['id']);
    // 			$orderResult = $dsql->dsqlOper($orderSql, "results");
    //
    // 			if($orderResult){
    // 				foreach($orderResult as $key => $order){
    // 					array_push($orderid, $order['id']);
    // 				}
    //
    // 				if(!empty($orderid)){
    // 					$orderid = join(",", $orderid);
    //
    // 					$quanSql = $dsql->SetQuery("DELETE FROM `#@__".$action."quan` WHERE `orderid` in (".$orderid.")");
    // 					$dsql->dsqlOper($quanSql, "update");
    //
    // 					$quanSql = $dsql->SetQuery("DELETE FROM `#@__paycard` WHERE `orderid` in (".$orderid.")");
    // 					$dsql->dsqlOper($quanSql, "update");
    // 				}
    //
    // 			}
    //
    // 			$quanSql = $dsql->SetQuery("DELETE FROM `#@__".$action."_order` WHERE `proid` = ".$val['id']);
    // 			$dsql->dsqlOper($quanSql, "update");
    //
    //
    // 			//删除缩略图
    // 			delPicFile($val['litpic'], "delThumb", $action);
    //
    // 			//删除图集
    // 			delPicFile($val['pics'], "delAtlas", $action);
    //
    // 			$body = $val['body'];
    // 			if(!empty($body)){
    // 				delEditorPic($body, $action);
    // 			}
    //
    // 		}
    // 	}
    //
    // }
    //
    // //删除信息表
    // $archives = $dsql->SetQuery("DELETE FROM `#@__".$action."list` WHERE `typeid` in (".join(",", $idsArr).")");
    // $results = $dsql->dsqlOper($archives, "update");

    $archives = $dsql->SetQuery("DELETE FROM `#@__".$action."type` WHERE `id` in (".join(",", $idsArr).")");
    $dsql->dsqlOper($archives, "update");

    adminLog("删除团购分类", join(",", $idsArr));
    echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
    die;


//更新信息分类
}else if($dopost == "typeAjax"){
    if(!testPurview("addpaimaiType")){
        die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
    }
    $data = str_replace("\\", '', $_POST['data']);
    if($data == "") die;
    $json = json_decode($data);

    $json = objtoarr($json);
    $json = typeAjax($json, 0, $action."type");
    echo $json;
    die;
}
//默认数据
else if($dopost == "importDefaultData"){
    $importRes = array("state"=>100,"info"=>"操作成功");

    $sqls =  getDefaultSql();
    $sqls = explode(";",$sqls);
    foreach ($sqls as $sqlItem){
        $sqlItem = $dsql::SetQuery($sqlItem);
        $dsql->update($sqlItem);
    }

    adminLog("导入默认数据", "拍卖分类_paimaitype");
    echo json_encode($importRes);
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

    //js
    $jsFile = array(
        'ui/jquery.dragsort-0.5.1.min.js',
        'ui/jquery.colorPicker.js',
        'ui/jquery-ui-sortable.js',
        'ui/jquery.ajaxFileUpload.js',
        'admin/paimai/paimaiType.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('action', $action);
    $huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."type"), JSON_UNESCAPED_UNICODE));
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/paimai";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}





/**
 * 获取默认数据
*/
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__paimaitype`;
ALTER TABLE `#@__paimaitype` AUTO_INCREMENT = 1;
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('1', '0', '奢侈品', '0', '0', '', '', '', '1651139756', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559505608432.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('2', '1', '腕表', '0', '0', '', '', '', '1651139775', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559527268325.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('5', '0', '玉翠珠宝', '0', '1', '', '', '', '1655792899', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559505675482.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('6', '0', '艺术品', '0', '2', '', '', '', '1655792936', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559505704704.gif', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('7', '0', '紫砂陶瓷', '0', '3', '', '', '', '1655792976', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559505721247.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('8', '0', '茗茶好酒', '0', '4', '', '', '', '1655793074', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559505741362.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('9', '0', '邮票钱币', '0', '5', '', '', '', '1655793074', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559505765099.gif', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('10', '0', '名家工艺', '0', '6', '', '', '', '1655793074', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559505784686.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('11', '0', '手机电脑', '0', '7', '', '', '', '1655793074', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559505801990.gif', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('13', '0', '奢侈品', '0', '8', '', '', '', '1655793074', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/1655961524457.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('14', '1', '包袋', '0', '1', '', '', '', '1655952782', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559528295728.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('15', '1', '配件', '0', '2', '', '', '', '1655952782', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559528457800.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('16', '1', '饰品', '0', '3', '', '', '', '1655952782', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559528602518.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('17', '1', '男装', '0', '4', '', '', '', '1655952782', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559528703682.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('18', '1', '女装', '0', '5', '', '', '', '1655952782', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559528794567.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('19', '1', '男鞋', '0', '6', '', '', '', '1655952782', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559528868228.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('20', '1', '女鞋', '0', '7', '', '', '', '1655952782', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559528963180.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('21', '1', '笔', '0', '8', '', '', '', '1655952782', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559529057068.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('22', '1', '眼镜', '0', '9', '', '', '', '1655952782', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559529151753.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('23', '5', '翡翠', '0', '0', '', '', '', '1655954840', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559548605127.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('24', '5', '和田玉', '0', '1', '', '', '', '1655954840', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559548631277.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('25', '5', '琥珀', '0', '2', '', '', '', '1655954840', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559548654901.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('26', '5', '蜜蜡', '0', '3', '', '', '', '1655954840', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559548679289.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('27', '5', '钻石', '0', '4', '', '', '', '1655954840', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559548692908.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('28', '5', '红蓝宝石', '0', '5', '', '', '', '1655954840', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559548729485.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('29', '5', '碧玺', '0', '6', '', '', '', '1655954840', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559548752700.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('30', '5', '水晶', '0', '7', '', '', '', '1655954840', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559548806024.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('31', '5', '祖母绿', '0', '8', '', '', '', '1655954840', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559548836683.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('32', '5', '玛瑙', '0', '9', '', '', '', '1655954840', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559548863824.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('33', '5', '珍珠', '0', '10', '', '', '', '1655954840', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559548885915.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('34', '5', '其他玉石', '0', '11', '', '', '', '1655954840', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559548919484.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('35', '6', '水墨', '0', '0', '', '', '', '1655955079', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559550876817.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('36', '6', '书法', '0', '1', '', '', '', '1655955079', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559550898710.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('37', '6', '油画', '0', '2', '', '', '', '1655955079', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/1655955091803.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('38', '6', '版画', '0', '3', '', '', '', '1655955079', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559550941270.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('39', '6', '篆刻', '0', '4', '', '', '', '1655955079', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/1655955096721.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('40', '6', '雕塑', '0', '5', '', '', '', '1655955079', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559550996704.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('41', '7', '紫砂', '0', '0', '', '', '', '1655955298', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559553122040.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('42', '7', '景德镇瓷', '0', '1', '', '', '', '1655955298', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/1655955324820.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('43', '7', '醴陵瓷', '0', '2', '', '', '', '1655955298', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559553272395.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('44', '7', '白瓷', '0', '3', '', '', '', '1655955298', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559553318834.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('45', '7', '钧瓷', '0', '4', '', '', '', '1655955298', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559553344144.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('46', '7', '汝瓷', '0', '5', '', '', '', '1655955298', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559553372301.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('47', '7', '建盏', '0', '6', '', '', '', '1655955298', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559553414814.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('48', '7', '陶器', '0', '7', '', '', '', '1655955298', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559553443864.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('49', '7', '特色定制', '0', '8', '', '', '', '1655955298', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559553468176.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('50', '8', '白酒', '0', '0', '', '', '', '1655955480', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559554968237.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('51', '8', '葡萄酒', '0', '1', '', '', '', '1655955480', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559554992512.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('52', '8', '洋酒', '0', '2', '', '', '', '1655955480', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559555017626.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('53', '8', '普洱茶', '0', '3', '', '', '', '1655955480', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559555033738.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('54', '8', '白茶', '0', '4', '', '', '', '1655955480', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559555053402.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('55', '8', '滋补品', '0', '5', '', '', '', '1655955480', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559555089626.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('56', '9', '邮票', '0', '0', '', '', '', '1655955658', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559556669841.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('57', '9', '钱币', '0', '1', '', '', '', '1655955658', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559556695705.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('58', '9', '六艺文房', '0', '2', '', '', '', '1655955658', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559556714157.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('59', '9', '文玩手串', '0', '3', '', '', '', '1655955658', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559556736518.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('60', '9', '核雕', '0', '4', '', '', '', '1655955658', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559556753500.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('61', '9', '趣味收藏', '0', '5', '', '', '', '1655955658', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559556772246.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('62', '9', '鼻烟壶', '0', '6', '', '', '', '1655955658', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559556801504.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('63', '10', '木雕', '0', '0', '', '', '', '1655960656', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559606637051.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('64', '10', '金银器', '0', '1', '', '', '', '1655960656', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559606647854.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('65', '10', '印石', '0', '2', '', '', '', '1655960656', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559606666402.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('66', '10', '铜铁/锡器', '0', '3', '', '', '', '1655960656', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559606689056.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('67', '10', '刺绣', '0', '4', '', '', '', '1655960656', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559606705709.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('68', '10', '漆器雕漆', '0', '5', '', '', '', '1655960656', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559606732108.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('69', '10', '珐琅花丝', '0', '6', '', '', '', '1655960656', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559606746716.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('70', '10', '丝绸云锦', '0', '7', '', '', '', '1655960656', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559606777253.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('71', '0', '汽车', '0', '9', '', '', '', '1655961200', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559613337768.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('72', '71', '二手车', '0', '0', '', '', '', '1655961238', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/1655961248371.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('73', '71', '新车', '0', '1', '', '', '', '1655961238', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559612507708.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('74', '13', '男表', '0', '0', '', '', '', '1655961506', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559616097303.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('75', '13', '女表', '0', '1', '', '', '', '1655961506', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559616101362.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('76', '13', '饰品', '0', '2', '', '', '', '1655961506', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559616158879.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('77', '13', '腰带', '0', '3', '', '', '', '1655961506', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559616186504.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('78', '13', '男包', '0', '4', '', '', '', '1655961506', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559616209912.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('79', '13', '女包', '0', '5', '', '', '', '1655961506', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/1655961622431.jpg', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('80', '11', '手机', '0', '0', '', '', '', '1655961668', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559617651313.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('81', '11', '电脑', '0', '1', '', '', '', '1655961668', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559617677865.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('82', '11', 'ipad', '0', '2', '', '', '', '1655961668', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559617733776.png', '0', '');
INSERT INTO `#@__paimaitype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('83', '11', '手机配件', '0', '3', '', '', '', '1655961668', 'https://upload.ihuoniao.cn//paimai/adv/large/2022/06/23/16559617754819.png', '0', '');
DEFAULTSQL;
}
