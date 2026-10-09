<?php
/**
 * 管理房产浏览信息
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("houseAppoint");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "history.html";

$action = "house_historyclick";

//删除浏览
if ($dopost == "delAppoint") {
    if ($id == "") die;
    $each = explode(",", $id);
    $error = array();
    foreach ($each as $val) {
        $archives = $dsql->SetQuery("DELETE FROM `#@__" . $action . "` WHERE `id` = " . $val);
        $results = $dsql->dsqlOper($archives, "update");
        if ($results != "ok") {
            $error[] = $val;
        }
    }
    if (!empty($error)) {
        echo '{"state": 200, "info": ' . json_encode($error) . '}';
    } else {
        adminLog("删除浏览记录信息", $id);
        echo '{"state": 100, "info": ' . json_encode("删除成功！") . '}';
    }
    die;

//获取浏览列表
} else if ($dopost == "getList") {
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page = $page == "" ? 1 : $page;
    $where = " ";


    if ($state != "") {
        $where .= " AND k.`status` = $state";

        if ($state == 0) {
            $totalPage = ceil($totalCount / $pagestep);
        } elseif ($state == 1) {
            $totalPage = ceil($totalCount / $pagestep);
        } elseif ($state == 2) {
            $totalPage = ceil($totalCount / $pagestep);
        }
    }

    if ($sKeyword != "") {
        $where .= " AND (m.`nickname` like '%$sKeyword%' OR m.`phone` like '%$sKeyword%' OR s.`title` like '%$sKeyword%' OR z.`title` like '%$sKeyword%' OR f.`title` like '%$sKeyword%' OR w.`title` like '%$sKeyword%' OR l.`title` like '%$sKeyword%' OR p.`title` like '%$sKeyword%' ) ";
    }

    if ($cityid) {
        $where .= " AND (s.`cityid` = $cityid OR z.`cityid` = $cityid OR f.`cityid` = $cityid OR w.`cityid` = $cityid OR l.`cityid` = $cityid OR p.`cityid` = $cityid)";
    }

    if($userType == 3){
        $where .= " AND (s.`cityid` IN ($adminCityIds) OR z.`cityid` IN ($adminCityIds) OR f.`cityid` IN ($adminCityIds) OR w.`cityid` IN ($adminCityIds) OR l.`cityid` IN ($adminCityIds) OR p.`cityid` IN ($adminCityIds) )";
    }

    $archives = $dsql->SetQuery("SELECT k.`id`, k.`uid`, k.`module2`,k.`aid`,k.`status`,k.`date`,m.`nickname`,m.`phone`,s.`title`,z.`title` ,f.`title`,w.`title`,l.`title`,p.`title`FROM  `#@__house_historyclick` k 
        LEFT JOIN  `#@__member` m ON k.`uid` = m.`id`
        LEFT JOIN  `#@__house_sale` s ON s.`id` = k.`aid`  AND k.`module2` = 'saleDetail'         
        LEFT JOIN  `#@__house_zu` z ON z.`id` = k.`aid`  AND k.`module2` = 'zuDetail'
        LEFT JOIN  `#@__house_cf` f ON f.`id` = k.`aid`  AND k.`module2` = 'cfDetail'
        LEFT JOIN  `#@__house_cw` w ON w.`id` = k.`aid`  AND k.`module2` = 'cwDetail'        
        LEFT JOIN  `#@__house_xzl` l ON l.`id` = k.`aid`  AND k.`module2` = 'xzlDetail'
        LEFT JOIN  `#@__house_sp` p ON p.`id` = k.`aid`  AND k.`module2` = 'spDetail'
        WHERE 1 = 1" . $where);
    
    // if ($sKeyword == "") {
    //     $archives = $dsql->SetQuery("SELECT k.`id`, k.`uid`, k.`module2`,k.`aid`,k.`status`,k.`date`,m.`nickname`,m.`phone` FROM  `#@__house_historyclick` k 
    //      LEFT JOIN  `#@__member` m ON k.`uid` = m.`id`
    //      WHERE 1 = 1" . $where);
    // }

    //总条数
    $totalCount = $dsql->dsqlOper($archives . $where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount / $pagestep);
    $where .= " order by k.`id` desc";
    $atpage = $pagestep * ($page - 1);
    $where .= " LIMIT $atpage, $pagestep";

    $results = $dsql->dsqlOper($archives . $where, "results");

    if (count($results) > 0) {
        $list = array();
        foreach ($results as $key => $value) {
            $result = substr($value['module2'], 0, strripos($value['module2'], "D"));
            $arc = $dsql->SetQuery("SELECT `id`,`title` FROM `#@__house_$result` WHERE `id` = " . $value['aid']);
            $jil = $dsql->dsqlOper($arc, "results");
            if ($jil) {
                $list[$key]["id"] = $value["id"];
                $list[$key]['title'] = $jil[0]['title'];
                $list[$key]['mobile'] = $value['phone'];
                $list[$key]['username'] = $value['nickname'];
                $list[$key]["date"] = date('Y-m-d H:i', $value["date"]);
                $state = "";
                switch ($value["status"]) {
                    case "1":
                        $state = "已联系";
                        break;
                    case "2":
                        $state = "号码无效";
                        break;
                    case "0":
                        $state = "<font color='#ff0000'>未联系</font>";
                        break;
                }
                $list[$key]["status"] = $state;
                $qianzhui = $result;
                $temp = $qianzhui . '-' . 'detail';
                $param = array(
                    "service" => "house",
                    "template" => $temp,
                    "id" => $value['aid']
                );
                $list[$key]["url"] = getUrlPath($param);

                $list[$key]["uid"] = $value["uid"];
            }
        }
        if (count($list) > 0) {
            echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . '}, "bookingList": ' . json_encode($list) . '}';
        } else {
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . '}}';
        }
    } else {
        echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . '}}';
    }
    die;
}


//验证模板文件
if(file_exists($tpl."/".$templates)){
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
        'admin/house/history.js'
    );
    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
