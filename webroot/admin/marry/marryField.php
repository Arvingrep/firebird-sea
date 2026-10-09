<?php

/**
 *  婚嫁字段管理
 *
 * @version        $Id: houseItem.php 2014-1-7 下午23:03:15 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__) . "/../templates/marry";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "marryItem.html";

$tab = "marryitem";
checkPurview("marryField");

//获取指定ID信息详情
if ($dopost == "getTypeDetail") {
    if ($id != "") {
        $archives = $dsql->SetQuery("SELECT * FROM `#@__" . $tab . "` WHERE `id` = " . $id);
        $results = $dsql->dsqlOper($archives, "results");
        echo json_encode($results);
    }
    die;

//修改分类
} else if ($dopost == "updateType") {
    if ($id != "") {
        $archives = $dsql->SetQuery("SELECT * FROM `#@__" . $tab . "` WHERE `id` = " . $id);
        $results = $dsql->dsqlOper($archives, "results");

        if (!empty($results)) {

            if ($results[0]['parentid'] == 0) die('{"state": 200, "info": ' . json_encode('顶级信息不可以修改！') . '}');

            if ($typename == "") die('{"state": 101, "info": ' . json_encode('请输入分类名') . '}');
            if ($type == "single") {

                if ($results[0]['typename'] != $typename) {
                    //保存到主表
                    $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `typename` = '$typename' WHERE `id` = " . $id);
                    $results = $dsql->dsqlOper($archives, "update");

                } else {
                    //分类没有变化
                    echo '{"state": 101, "info": ' . json_encode('无变化！') . '}';
                    die;
                }

            } else {
                //对字符进行处理
                $typename = cn_substrR($typename, 30);

                //保存到主表
                $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `typename` = '$typename' WHERE `id` = " . $id);
                $results = $dsql->dsqlOper($archives, "update");
            }

            if ($results != "ok") {
                echo '{"state": 101, "info": ' . json_encode('分类修改失败，请重试！') . '}';
                exit();
            } else {
                // 更新缓存
                clearCache("house_item", $id);
                clearCache("house_item_all", $id);

                adminLog("修改婚嫁字段", $typename);
                echo '{"state": 100, "info": ' . json_encode('修改成功！') . '}';
                exit();
            }

        } else {
            echo '{"state": 101, "info": ' . json_encode('要修改的信息不存在或已删除！') . '}';
            die;
        }
    }
    die;

//删除分类
} else if ($dopost == "del") {
    if ($id != "") {
        $archives = $dsql->SetQuery("SELECT * FROM `#@__" . $tab . "` WHERE `id` = " . $id);
        $results = $dsql->dsqlOper($archives, "results");

        if (!empty($results)) {

            $title = $results[0]['typename'];
            $oper = "删除";

            //清空子级
            if ($results[0]['parentid'] == 0) {
                $oper = "清空";

                $archives = $dsql->SetQuery("DELETE FROM `#@__" . $tab . "` WHERE `parentid` = " . $id);
                $dsql->dsqlOper($archives, "update");

            } else {

                $archives = $dsql->SetQuery("DELETE FROM `#@__" . $tab . "` WHERE `id` = " . $id);
                $dsql->dsqlOper($archives, "update");

            }

            // 清除缓存
            clearCache("house_item", $id);
            clearCache("house_item_all", $id);

            adminLog($oper . "婚嫁字段", $title);
            echo '{"state": 100, "info": ' . json_encode('删除成功！') . '}';
            die;

        } else {
            echo '{"state": 200, "info": ' . json_encode('要删除的信息不存在或已删除！') . '}';
            die;
        }
    }
    die;

//更新信息分类
} else if ($dopost == "typeAjax") {
    $data = str_replace("\\", '', $_POST['data']);
    if ($data != "") {
        $json = json_decode($data);

        $json = objtoarr($json);
        $json = itemTypeAjax($json, 0, $tab);

        // 清除缓存
        clearTypeCache();

        echo $json;
    }
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

    adminLog("导入默认数据", "婚嫁字段_" . $tab);
    echo json_encode($importRes);
    die;
}

//验证模板文件
if (file_exists($tpl . "/" . $templates)) {

    //js
    $jsFile = array(
        'ui/jquery.dragsort-0.5.1.min.js',
        'ui/jquery-ui-sortable.js',
        'admin/marry/marryItem.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('typeListArr', json_encode(getItemTypeList(0, $tab)));
    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/marry";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}

//更新分类
function itemTypeAjax($json, $pid = 0, $tab)
{
    global $dsql;
    for ($i = 0; $i < count($json); $i++) {
        $id = $json[$i]["id"];
        $name = $json[$i]["name"];

        //如果ID为空则向数据库插入下级分类
        if ($id == "" || $id == 0) {
            $archives = $dsql->SetQuery("INSERT INTO `#@__" . $tab . "` (`parentid`, `typename`, `weight`, `pubdate`) VALUES ('$pid', '$name', '$i', '" . GetMkTime(time()) . "')");
            $id = $dsql->dsqlOper($archives, "lastid");
            adminLog("添加婚嫁字段", $model . "=>" . $name);
        } //其它为数据库已存在的分类需要验证分类名是否有改动，如果有改动则UPDATE
        else {
            $archives = $dsql->SetQuery("SELECT `typename`, `weight`, `parentid` FROM `#@__" . $tab . "` WHERE `id` = " . $id);
            $results = $dsql->dsqlOper($archives, "results");
            if (!empty($results)) {
                if ($results[0]["parentid"] != 0) {
                    //验证分类名
                    if ($results[0]["typename"] != $name) {
                        $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `typename` = '$name' WHERE `id` = " . $id);
                        $results = $dsql->dsqlOper($archives, "update");
                    }

                    //验证排序
                    if ($results[0]["weight"] != $i) {
                        $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `weight` = '$i' WHERE `id` = " . $id);
                        $results = $dsql->dsqlOper($archives, "update");
                    }
                    adminLog("修改婚嫁字段", $model . "=>" . $id);
                }
            }
        }
        if (is_array($json[$i]["lower"])) {
            itemTypeAjax($json[$i]["lower"], $id, $tab);
        }
    }
    return '{"state": 100, "info": "保存成功！"}';
}

//获取分类列表
function getItemTypeList($id, $tab)
{
    global $dsql;
    $sql = $dsql->SetQuery("SELECT `id`, `parentid`, `typename` FROM `#@__" . $tab . "` WHERE `parentid` = $id ORDER BY `weight`");
    $results = $dsql->dsqlOper($sql, "results");
    if ($results) {//如果有子类
        foreach ($results as $key => $value) {
            $results[$key]["lower"] = getItemTypeList($value['id'], $tab);
        }
        return $results;
    } else {
        return "";
    }
}

function clearTypeCache()
{
    for ($i = 1; $i < 400; $i++) {
        clearCache("house_item", $i);
        clearCache("house_item_all", $i);
    }
}


/**
 * 获取默认数据
*/
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__marryitem`;
ALTER TABLE `#@__marryitem` AUTO_INCREMENT = 1;
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('1', '0', '婚嫁类型', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('2', '1', '到店有礼', '1', '1615259000');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('3', '1', '主题婚礼', '0', '1615274887');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('4', '0', '主持人套餐分类', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('5', '4', '婚礼主持', '0', '1615532434');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('6', '0', '主持人风格', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('7', '6', '幽默', '0', '1615532503');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('8', '0', '主持人', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('9', '8', '资深', '0', '1615532542');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('10', '0', '婚车套餐分类', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('11', '10', '租婚车', '0', '1615773981');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('12', '0', '婚车类型', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('14', '12', '顶级豪车', '0', '1615774271');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('15', '12', '高端轿车', '1', '1615774271');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('16', '0', '婚嫁特色服务', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('17', '16', '到店有礼', '0', '1615774979');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('18', '16', '支持分期', '1', '1615774979');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('19', '16', '下单有礼', '2', '1615774979');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('20', '0', '婚纱套餐', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('21', '20', '婚纱摄影', '0', '1615793945');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('22', '0', '婚纱风格', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('23', '22', '欧式', '0', '1615793994');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('24', '22', '美式', '1', '1615794009');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('25', '0', '婚纱场景', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('26', '25', '草坪', '0', '1615794049');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('27', '25', '海边', '1', '1615794049');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('28', '0', '婚纱新娘服装', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('29', '28', '白色婚纱', '0', '1615794126');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('30', '28', '晚宴服', '1', '1615794126');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('31', '0', '婚纱新郎服装', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('32', '31', '燕尾服', '0', '1615794219');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('33', '31', '长尾礼服', '1', '1615794219');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('34', '31', '衬衫', '2', '1615794219');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('35', '0', '婚纱拍摄场景', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('36', '35', '窗边', '0', '1615794318');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('37', '35', '空教室', '1', '1615794318');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('38', '35', '森林', '2', '1615794318');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('39', '0', '婚纱内景数量', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('40', '39', '10套', '0', '1615794363');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('42', '39', '20套', '1', '1615794364');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('44', '0', '婚纱外景数量', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('45', '44', '5套', '0', '1615794486');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('46', '44', '10套', '1', '1615794486');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('47', '0', '婚纱拍摄天数', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('48', '47', '10天', '0', '1615794573');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('49', '47', '20天', '1', '1615794573');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('50', '0', '婚纱拍摄相册数量', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('51', '50', '10套', '0', '1615794645');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('52', '50', '20套', '1', '1615794645');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('53', '0', '婚纱拍摄相框数量', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('54', '53', '10个', '0', '1615794719');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('55', '53', '20个', '1', '1615794719');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('56', '0', '摄像跟拍', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('57', '56', '摄像跟拍', '0', '1615801034');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('58', '0', '摄像类别', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('59', '58', '婚礼摄像', '0', '1615801076');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('60', '58', '领证跟拍', '1', '1615801076');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('61', '0', '摄像风格', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('62', '61', '电影风格', '0', '1615801118');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('63', '61', '真情纪实', '1', '1615801118');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('64', '0', '拍摄团队', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('65', '64', '资深', '0', '1615801198');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('66', '64', '中级', '1', '1615801198');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('67', '0', '珠宝首饰套餐分类', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('68', '67', '珠宝首饰', '0', '1615862771');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('70', '0', '珠宝选择材质', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('71', '70', '钻石', '0', '1615863275');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('72', '70', '金子', '1', '1615863275');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('73', '0', '珠宝选择类型', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('74', '73', '戒指', '0', '1615863342');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('76', '73', '手镯', '1', '1615863342');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('77', '0', '拍套餐分类', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('78', '77', '摄影跟拍', '0', '1615872660');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('79', '0', '摄影跟拍类别', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('80', '79', '领证跟拍', '0', '1615872698');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('81', '0', '摄影选择风格', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('82', '81', '个性创意', '0', '1615872748');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('83', '81', '真情纪实', '1', '1615872748');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('84', '0', '新娘跟妆套餐分类', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('85', '84', '新娘跟妆', '0', '1615876135');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('86', '0', '婚纱礼服套餐分类', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('87', '86', '婚纱礼服', '0', '1615879295');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('88', '0', '婚纱礼服款式', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('89', '88', '齐地', '0', '1615879334');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('90', '0', '婚纱礼服出售方式', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('91', '90', '租赁', '0', '1615879365');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('92', '0', '策划管理', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('93', '92', '婚礼策划', '0', '1615966584');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('94', '0', '选择婚礼类别', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('95', '94', '主题婚礼', '0', '1615968003');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('96', '94', '简单婚礼', '1', '1615968003');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('97', '0', '选择颜色', '50', '0');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('98', '97', '黑色', '0', '1615968038');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('99', '6', '大气', '1', '1616062567');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('100', '6', '稳重', '2', '1616062567');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('101', '6', '亲切', '3', '1616062567');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('102', '6', '细腻', '4', '1616062729');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('103', '6', '温暖阳光', '5', '1616062729');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('104', '6', '搞怪', '6', '1616062729');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('105', '6', '煽情', '7', '1616062729');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('106', '22', '中式', '2', '1616063040');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('107', '22', '小清新', '3', '1616063040');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('108', '22', '清新韩式', '4', '1616063040');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('109', '22', '森系', '5', '1616063040');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('110', '22', '复古风', '6', '1616063040');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('111', '22', '奢华', '7', '1616063040');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('112', '22', '梦幻', '8', '1616063040');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('113', '22', '简约', '9', '1616063040');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('114', '22', '创意', '10', '1616063040');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('115', '22', '卡通', '11', '1616063040');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('116', '22', '唯美', '12', '1616063040');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('118', '22', '时尚', '13', '1616063040');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('119', '22', '纪实', '14', '1616063040');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('120', '22', '日系', '15', '1616063186');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('121', '22', '自然', '16', '1616063186');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('122', '22', '温婉', '17', '1616063186');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('123', '22', '宫廷', '18', '1616063186');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('124', '22', '男士礼服', '19', '1616063186');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('125', '22', '甜美', '20', '1616063186');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('126', '22', '简约', '21', '1616063186');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('128', '97', '粉色', '1', '1616115838');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('129', '97', '红色', '2', '1616115838');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('130', '97', '香槟色', '3', '1616115838');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('131', '97', '金色', '4', '1616115838');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('132', '97', '蒂芙尼蓝', '5', '1616115838');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('133', '97', '绿色', '6', '1616115838');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('134', '97', '蓝色', '7', '1616115838');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('135', '97', '紫色', '8', '1616115838');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('136', '97', '白色', '9', '1616115838');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('137', '97', '黄色', '10', '1616115838');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('138', '97', '灰色', '11', '1616115838');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('139', '97', '撞色', '12', '1616115838');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('140', '58', '微电影', '2', '1616116106');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('141', '12', '跑车', '2', '1616116220');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('142', '12', '加长', '3', '1616116220');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('143', '12', '敞篷', '4', '1616116220');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('144', '12', 'SUV/商务', '5', '1616116220');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('145', '12', '商务客车', '6', '1616116220');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('146', '22', '优雅', '22', '1616116460');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('147', '25', '梦幻鲜花', '2', '1616116460');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('148', '25', '景点', '3', '1616116460');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('149', '25', '城堡', '4', '1616116460');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('150', '25', '花海', '5', '1616116460');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('151', '25', '森林', '6', '1616116460');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('152', '25', '街景', '7', '1616116460');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('153', '25', '游艇', '8', '1616116460');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('154', '25', '公路', '9', '1616116460');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('155', '25', '夜景', '10', '1616116460');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('156', '25', '马场', '11', '1616116460');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('157', '25', '水下', '12', '1616116460');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('158', '25', '教堂', '13', '1616116460');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('159', '25', '校园', '14', '1616116460');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('160', '25', '天台', '15', '1616116460');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('161', '25', '泳池', '16', '1616116460');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('162', '25', '乡间小路', '17', '1616116460');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('163', '25', '植物花墙', '18', '1616116460');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('164', '79', '婚礼摄影', '1', '1616116631');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('165', '79', '结婚登记照', '2', '1616116631');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('166', '79', '写真', '3', '1616116631');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('167', '70', '三金五金', '2', '1616116754');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('168', '70', '玫瑰金', '3', '1616116754');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('169', '70', '彩宝', '4', '1616116754');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('170', '70', '珍珠', '5', '1616116754');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('171', '70', '铂金', '6', '1616116754');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('172', '70', '银饰', '7', '1616116754');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('173', '73', '手链', '2', '1616116830');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('174', '73', '耳环', '3', '1616116830');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('175', '73', '耳钉', '4', '1618800785');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('177', '88', '齐腰', '1', '1617000764');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('178', '67', '高端定制', '1', '1618800785');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('179', '79', '艺术跟拍', '4', '1617866278');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('180', '79', '海马体摄影', '5', '1617866278');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('181', '79', '港风艺术照', '6', '1617866906');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('182', '88', 'Lolita', '2', '1617870410');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('183', '8', '中级', '1', '1618191494');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('184', '8', '低级', '2', '1618214129');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('185', '0', '酒店特色', '50', '1618800650');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('186', '185', '地铁沿线', '0', '1618800784');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('187', '185', '草坪婚礼', '1', '1618800784');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('188', '185', '教堂婚礼', '2', '1618800785');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('189', '185', '楼台婚礼', '3', '1618800785');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('190', '185', '独立会场', '4', '1618800785');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('191', '185', '可包场', '5', '1618800785');
INSERT INTO `#@__marryitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('192', '185', '可自带酒水', '6', '1618800785');
DEFAULTSQL;
}
