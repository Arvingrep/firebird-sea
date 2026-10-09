<?php
/**
 * 管理商城商品
 *
 * @version        $Id: productList.php 2014-2-11 下午17:26:10 $
 * @package        HuoNiao.awardlegou
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
checkPurview("awardlegouProList");
$dsql                     = new dsql($dbo);
$tpl                      = dirname(__FILE__) . "/../templates/awardlegou";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates                = "awardlegouProList.html";

$tab = "awardlegou_list";

if ($dopost == "getList") {
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    $where = "";

    $where2 = getCityFilter('`cityid`');

    if ($adminCity) {
        $where2 .= getWrongCityFilter('`cityid`', $adminCity);
    }
    $storeid     = array();
    $storeSql    = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__business_list` WHERE 1=1" . $where2);
    $storeResult = $dsql->dsqlOper($storeSql, "results");
    if ($storeResult) {
        foreach ($storeResult as $key => $loupan) {
            array_push($storeid, $loupan['id']);
        }
        $where .= " AND `sid` in (" . join(",", $storeid) . ")";
    } else {
        echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';
        die;
    }

    if ($sKeyword != "") {
//        $storeSql    = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__awardlegou_store` WHERE `title` like '%$sKeyword%'" . $where2);
//        $storeResult = $dsql->dsqlOper($storeSql, "results");
//        if ($storeResult) {
//            $storeid = array();
//            foreach ($storeResult as $key => $store) {
//                array_push($storeid, $store['id']);
//            }
//            $where .= " AND (`title` like '%$sKeyword%' OR `barcode` like '%$sKeyword%' OR `store` in (" . join(",", $storeid) . "))";
//        } else {
//            $storeSql    = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__awardlegou_store` WHERE 1=1" . $where2);
//            $storeResult = $dsql->dsqlOper($storeSql, "results");
//            if ($storeResult) {
//                $storeid = array();
//                foreach ($storeResult as $key => $store) {
//                    array_push($storeid, $store['id']);
//                }
//                $where .= " AND (`title` like '%$sKeyword%' OR `barcode` like '%$sKeyword%') AND `store` in (" . join(",", $storeid) . ")";
//            }
//        }
        $where .= " AND `title` like '%$sKeyword%'";
    }

    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__" . $tab . "` WHERE 1 = 1");

    //总条数
    $totalCount = $dsql->dsqlOper($archives . $where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount / $pagestep);
    //待审核
    $totalGray = $dsql->dsqlOper($archives . " AND `state` = 0" . $where, "totalCount");
//    //已上架
    $totalAudit = $dsql->dsqlOper($archives . " AND `state` = 1" . $where, "totalCount");
//    //已下架
    $totalRefuse = $dsql->dsqlOper($archives . " AND `state` = 2" . $where, "totalCount");

    if ($state != "") {
        $where .= " AND `state` = $state";

        if ($state == 0) {
            $totalPage = ceil($totalGray / $pagestep);
        } elseif ($state == 1) {
            $totalPage = ceil($totalAudit / $pagestep);
        } elseif ($state == 2) {
            $totalPage = ceil($totalRefuse / $pagestep);
        }
    }

    $where .= " order by `id` desc, `pubdate` desc";

    $atpage   = $pagestep * ($page - 1);
    $where    .= " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT `id`, `sid`, `title`, `litpic`, `onenumber`, `price`,`usepoint`,`yprice`, `prizetype`,`numbe`,`state`,`tuikuanlogtic`,`pubdate` FROM `#@__" . $tab . "` WHERE 1 = 1" . $where);
    $results  = $dsql->dsqlOper($archives, "results");

    if (count($results) > 0) {
        $list = array();
        foreach ($results as $key => $value) {
            $list[$key]["id"]            = $value["id"];
            $list[$key]["title"]         = $value["title"];
            $list[$key]["onenumber"]     = $value["onenumber"];
            $list[$key]["numbe"]         = $value["numbe"];
            $list[$key]["tuikuanlogtic"] = $value["tuikuanlogtic"];
            $list[$key]["litpic"]        = $value["litpic"];
            $prizetypename               = $value["prizetype"] == 0 ? '实物奖励：' . $value["numbe"] . '个' : '红包奖励：' . ($value["hongbaotype"] == 0 ? '随机分配' : '平均分配');
            $list[$key]["prizetypename"] = $prizetypename;

            //店铺
            $list[$key]["sid"] = $value["sid"];
            if ($value["sid"] != 0) {
                $storenamesql = $dsql->SetQuery("SELECT  `title` ,`addrid` FROM `#@__business_list` WHERE  `id` = '$value[sid]'");
                $storename    = $dsql->dsqlOper($storenamesql, "results");
                if ($storename) {
                    $list[$key]["store"] = $storename[0]['title'];

                    $param                  = array(
                        "service"  => "business",
                        "template" => "detail",
                        "id"       => $value['sid']
                    );
                    $list[$key]["storeUrl"] = getUrlPath($param);

                    //区域
                    if ($storename[0]['addrid'] == 0) {
                        $list[$key]["addrname"] = "未知";
                    } else {
                        $addrname               = getPublicParentInfo(array('tab' => 'site_area', 'id' => $storename[0]['addrid'], 'type' => 'typename', 'split' => ' '));
                        $list[$key]["addrname"] = $addrname;
                    }
                }

            } else {
                $list[$key]["store"]    = "官方直营";
                $list[$key]["addrname"] = "未知";
            }

            $param                   = array(
                "service"  => "awardlegou",
                "template" => "detail",
                "id"       => $value['id']
            );
            $linkurl               = getUrlPath($param);
            $list[$key]["linkurl"] = $linkurl;
            $list[$key]["price"]   = $value['price'];
            $list[$key]["usepoint"]= $value['usepoint'];
            $list[$key]["state"]   = $value["state"];
            $list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

        }

        if (count($list) > 0) {
            echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "totalGray": ' . $totalGray . ', "totalAudit": ' . $totalAudit . ', "totalRefuse": ' . $totalRefuse . '}, "productList": ' . json_encode($list) . '}';
        } else {
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "totalGray": ' . $totalGray . ', "totalAudit": ' . $totalAudit . ', "totalRefuse": ' . $totalRefuse . '}}';
        }

    } else {
        echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "totalGray": ' . $totalGray . ', "totalAudit": ' . $totalAudit . ', "totalRefuse": ' . $totalRefuse . '}}';
    }
    die;

//删除
} elseif ($dopost == "del") {
    if (!testPurview("awardlegouProListDel")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    if ($id != "") {

        $each  = explode(",", $id);
        $error = array();
        $title = array();
        foreach ($each as $val) {
            //删除评论
//			$archives = $dsql->SetQuery("DELETE FROM `#@__awardlegou_common` WHERE `aid` = ".$val);
//			$dsql->dsqlOper($archives, "update");

            $archives = $dsql->SetQuery("SELECT * FROM `#@__awardlegou_pin` WHERE `state`= 1 AND `state`= 3 AND `tid` = " . $val);
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $error[] = $val;
                continue;
            }
            $archives = $dsql->SetQuery("SELECT * FROM `#@__" . $tab . "` WHERE `id` = " . $val);
            $results  = $dsql->dsqlOper($archives, "results");

            $orderSql    = $dsql->SetQuery("SELECT `id` FROM `#@__awardlegou_order` WHERE `proid` = " . $val);
            $orderResult = $dsql->dsqlOper($orderSql, "results");

            if ($orderResult) {
                $quanSql = $dsql->SetQuery("DELETE FROM `#@__awardlegou_order` WHERE `proid` = " . $val);
                $dsql->dsqlOper($quanSql, "update");
            }

            //删除缩略图
            array_push($title, $results[0]['title']);
            delPicFile($results[0]['litpic'], "delThumb", "awardlegou");

            //以图搜图-删除
            require_once(HUONIAOINC . "/baidu.aip.func.php");
            $client = new baiduAipImageSearchClient();
            $ret    = $client->productDeleteByUrl(str_replace('small', 'large', getFilePath($results[0]['litpic'])));

            //删除图集
            $pics = explode(",", $results[0]['pics']);
            foreach ($pics as $k => $v) {
                delPicFile($v, "delAtlas", "awardlegou");

            }

            //删除内容图片
            $body = $results[0]['body'];
            if (!empty($body)) {
                delEditorPic($body, "awardlegou");
            }

            //删除表
            $archives = $dsql->SetQuery("DELETE FROM `#@__" . $tab . "` WHERE `id` = " . $val);
            $results  = $dsql->dsqlOper($archives, "update");
            if ($results != "ok") {
                $error[] = $val;
            }
        }
        if (!empty($error)) {
            echo '{"state": 200, "info": ' . json_encode($error) . '}';
        } else {
            adminLog("删除有奖乐购商品", join(", ", $title));
            echo '{"state": 100, "info": ' . json_encode("删除成功！") . '}';
        }
        die;

    }
    die;

//更新状态
} elseif ($dopost == "updateState") {
    if (!testPurview("awardlegouProListEdit")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    $each  = explode(",", $id);
    $error = array();
    if ($id != "") {
        foreach ($each as $val) {
            $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `state` = " . $state . " WHERE `id` = '" . $val."'");
            $results  = $dsql->dsqlOper($archives, "update");
            if ($results != "ok") {
                $error[] = $val;
            }
        }
        if (!empty($error)) {
            echo '{"state": 200, "info": ' . json_encode($error) . '}';
        } else {
            adminLog("更新有奖乐购商品状态", $id . "=>" . $state);
            echo '{"state": 100, "info": ' . json_encode("修改成功！") . '}';
        }
    }
    die;

}elseif($dopost == "updateLogtic"){
    if (!testPurview("awardlegouProListEdit")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

    $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `tuikuanlogtic` = " . $tuikuanlogtic . " WHERE `id` = '" . $id."'");
    $results  = $dsql->dsqlOper($archives, "update");

    if($results == "ok"){
        echo '{"state": 100, "info": ' . json_encode("修改成功！") . '}';die;

    }else{

        echo '{"state": 200, "info": ' . json_encode("修改失败！") . '}';die;
    }


}

//验证模板文件
if (file_exists($tpl . "/" . $templates)) {
    //css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
        'admin/awardlegou/awardlegouProList.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('notice', $notice);

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
    $huoniaoTag->assign('industryListArr', json_encode($dsql->getTypeList(0, "awardlegou_type")));
    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/awardlegou";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}

