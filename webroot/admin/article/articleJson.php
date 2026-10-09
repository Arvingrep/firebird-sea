<?php
/**
 * 文章模块JSON
 *
 * @version        $Id: articleJson.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Article
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
$dsql = new dsql($dbo);

$dopost = $dopost ? $dopost : 'article';
$dotitle = $dopost == "article" ? "新闻" : "图片";

$table_all = '#@__articlelist_all';


//列表
if ($action == "") {

    if (!testPurview("articleList")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page = $page == "" ? 1 : $page;

    $del = 0;
    if ($aType != "") {
        $del = 1;
    }

    $where = getCityFilter('`cityid`') . " AND `waitpay` = 0";
    
    if ($adminCity) {
        $where .= getWrongCityFilter('`cityid`', $adminCity);
    }
    
    $where .= " AND `media_state` = 1";
    if ($sKeyword != "") {
        if(substr($sKeyword, 0, 1) == '#'){
			$_id = substr($sKeyword, 1);
			if(is_numeric($_id)){
				$where .= " AND `admin` = $_id";
			}else{
                $where .= " AND 1 = 2";
            }
		}else{
            $where .= " AND `title` like '%$sKeyword%'";
        }
    }
    if ($mType != "") {
        $where .= " AND `mold` = $mType";
    }
    if ($sType != "") {
        if ($dsql->getTypeList($sType, $dopost . "type")) {
            $lower = arr_foreach($dsql->getTypeList($sType, $dopost . "type"));
            $lower = $sType . "," . join(',', $lower);
        } else {
            $lower = $sType;
        }
        $where .= " AND `typeid` in ($lower)";
    }
    if ($zType != "") {
        $arr = $dsql->getTypeList($zType, $dopost . "_zhuanti");
        if ($arr) {
            $lower = arr_foreach($arr);
            $lower = $zType . "," . join(',', $lower);
        } else {
            $lower = $zType;
        }
        $where .= " AND `zhuanti` in ($lower)";
    }
    if ($property != "") {

        $flag = explode(",", $property);
        $flags_ = $flag;
        $flag_h = in_array('h', $flags_) ? 1 : 0;
        $flag_r = in_array('r', $flags_) ? 1 : 0;
        $flag_b = in_array('b', $flags_) ? 1 : 0;
        $flag_t = in_array('t', $flags_) ? 1 : 0;
        $flag_p = in_array('p', $flags_) ? 1 : 0;
        $flag_where = '';
        if($flag_h){
            $flag_where .= "`flag_h` = '$flag_h' AND";
        }
        if($flag_r){
            $flag_where .= "`flag_r` = '$flag_r' AND";
        }
        if($flag_b){
            $flag_where .= "`flag_b` = '$flag_b' AND";
        }
        if($flag_t){
            $flag_where .= "`flag_t` = '$flag_t' AND";
        }
        if($flag_p){
            $flag_where .= "`flag_p` = '$flag_p' AND";
        }
        $flag_where = substr($flag_where, 0, -3);
        $where .= " AND " . $flag_where;

    }

	if($start != ""){
		$where .= " AND `pubdate` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND `pubdate` <= ". GetMkTime($end . " 23:59:59");
	}




    //获取分表信息
    // $where .= " AND `waitpay` = 0";

    //获取分表信息
    $sub = new SubTable('articlelist', '#@__articlelist');

    //总条数
    $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__articlelist_all` l WHERE 1 = 1 AND `del` = $del");
    $totalCount = $sub->getReqTotalCount_v2($sql.$where, 1800);

    //总分页数
    $totalPage = ceil($totalCount / $pagestep);

    //待审核
    $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__articlelist_all` l WHERE 1 = 1 AND `del` = $del");
    $totalGray = $sub->getReqTotalCount_v2($sql . " AND `arcrank` = 0" . $where, 1800);

    //已审核
    $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__articlelist_all` l WHERE 1 = 1 AND `del` = $del");
    $totalAudit = $sub->getReqTotalCount_v2($sql . " AND `arcrank` = 1" . $where, 1800);

    //拒绝审核
    $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__articlelist_all` l WHERE 1 = 1 AND `del` = $del");
    $totalRefuse = $sub->getReqTotalCount_v2($sql . " AND `arcrank` = 2" . $where, 1800);

    if ($state != "") {
        $where .= " AND `arcrank` = $state";
        if ($state == 0) {
            $totalPage = ceil($totalGray / $pagestep);
        } elseif ($state == 1) {
            $totalPage = ceil($totalAudit / $pagestep);
        } elseif ($state == 2) {
            $totalPage = ceil($totalRefuse / $pagestep);
        }
        // $adminid = $userLogin->getUserID();
        // $reg = "(^$adminid:0|,$adminid:0|,$adminid:0)";
        // $where .= " AND `audit_state` REGEXP '".$reg."' ";
    }

    //$where .= " order by `id` desc";


    $atpage = $pagestep * ($page - 1);
    //$where .= " LIMIT $atpage, $pagestep";

    //获取结果

    // $unionSql = $dsql->SetQuery("SELECT `id`, `cityid`, `title`, `color`, `flag`, `flag_h`, `flag_r`, `flag_b`, `flag_t`, `flag_p`, `redirecturl`, `typeid`, `weight`, `admin`, `arcrank`, `pubdate`, `mold` FROM `" . $table_all . "` WHERE `del` = $del" . $where);
    // $unionSql .= " order by `id` desc" . " LIMIT $atpage, $pagestep";

    $article = $dsql->SetQuery("SELECT b.`id`, b.`cityid`, b.`title`, b.`color`, b.`flag`, b.`flag_h`, b.`flag_r`, b.`flag_b`, b.`flag_t`, b.`flag_p`, b.`redirecturl`, b.`typeid`, b.`weight`, b.`admin`, b.`arcrank`, b.`pubdate`, b.`mold` FROM `" . $table_all . "` AS b INNER JOIN ( SELECT `id` FROM `" . $table_all . "` WHERE `del` = $del ".$where." order by `pubdate` DESC, `id` DESC LIMIT $atpage, $pagestep) AS tmp ON tmp.id = b.id;");
    // echo $article;die;
    //结果列表
    $results = $dsql->dsqlOper($article, "results");
    // print_r($results);die;

    if (count($results) > 0) {
        $list = array();
        $need_audit = checkAdminArcrank("article");

        foreach ($results as $key => $value) {
            $list[$key]["id"] = $value["id"];
            $cityname = getSiteCityName($value['cityid']);
            $list[$key]['cityname'] = $cityname;
            $list[$key]["title"] = htmlentities($value["title"], ENT_QUOTES, "utf-8");
            if ($dopost == "pic") {
                $list[$key]["litpic"] = $value["litpic"];
            }
            $list[$key]["color"] = $value["color"];

            $flagArr = [];
            if($value['flag_h']){
                $flagArr[] = 'h';
            }
            if($value['flag_b']){
                $flagArr[] = 'b';
            }
            if($value['flag_r']){
                $flagArr[] = 'r';
            }
            if($value['flag_t']){
                $flagArr[] = 't';
            }
            if($value['flag_p']){
                $flagArr[] = 'p';
            }
            $append = join(",", $flagArr);


            $append = str_replace("h", "头", $append);
            $append = str_replace("r", "推", $append);
            $append = str_replace("b", "粗", $append);
            $append = str_replace("t", "跳", $append);
            $append = str_replace("p", "图", $append);




            $list[$key]["append"] = $append;
            $list[$key]["typeid"] = $value["typeid"];
            $list[$key]["moldid"] = $value["mold"];

            $typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__" . $dopost . "type` WHERE `id` = " . $value["typeid"]);
            $typename = $dsql->getTypeName($typeSql);

            $list[$key]["type"] = $typename[0]['typename'];
            $list[$key]["sort"] = $value["weight"];

            $state = "";
            switch ($value["arcrank"]) {
                case "0":
                    $state = "等待审核";
                    break;
                case "1":
                    $state = "审核通过";
                    break;
                case "2":
                    $state = "审核拒绝";
                    break;
            }

            $list[$key]["state"] = $state;
            $list[$key]["date"] = date('y-m-d H:i:s', $value["pubdate"]);

            $admin = $value['admin'];
            $adminame = "";
            $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $admin");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $adminame = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
            }
            $list[$key]['admin'] = $admin;
            $list[$key]['adminame'] = $adminame;

            $selfmedia_id = 0;
            $selfmedia_name = "";
            $sql = $dsql->SetQuery("SELECT `id`, `ac_name` FROM `#@__article_selfmedia` WHERE `userid` = $admin");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $selfmedia_id = $ret[0]['id'];
                $selfmedia_name = $ret[0]['ac_name'];
            }
            $list[$key]['selfmedia_id'] = $selfmedia_id;
            $list[$key]['selfmedia_name'] = $selfmedia_name;


            $param = array(
                "service" => $dopost,
                "template" => "detail",
                "id" => $value['id'],
                "flag" => $value['flag'],
                "redirecturl" => $value['redirecturl']
            );
            $list[$key]['url'] = getUrlPath($param);

            // 打赏
            $archives = $dsql->SetQuery("SELECT COUNT(*) total FROM `#@__member_reward` WHERE `aid` = " . $value["id"] . " AND `state` = 1");
            //总条数
            $res = $dsql->dsqlOper($archives, "results");
            $totalCount_ = $res[0]['total'];
            if ($totalCount_) {
                $archives = $dsql->SetQuery("SELECT SUM(`amount`) totalAmount FROM `#@__member_reward` WHERE `module` = 'article' AND `aid` = " . $value["id"] . " AND `state` = 1");
                $ret = $dsql->dsqlOper($archives, "results");
                $totalAmount = $ret[0]['totalAmount'];
            } else {
                $totalAmount = 0;
            }
            $list[$key]['reward'] = array("count" => $totalCount_, "amount" => $totalAmount);


            // 审核流程 获取审核状态
            // $auditResult = array();
            // if($need_audit){
            //     $auditResult = getInfoAudit("article", $value['id'], $value["arcrank"]);
            // }
            // $list[$key]['orgAudit'] = $auditResult;
        }

        if (count($list) > 0) {
            echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "totalGray": ' . $totalGray . ', "totalAudit": ' . $totalAudit . ', "totalRefuse": ' . $totalRefuse . '}, "articleList": ' . json_encode($list) . '}';
            die;
        } else {
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "totalGray": ' . $totalGray . ', "totalAudit": ' . $totalAudit . ', "totalRefuse": ' . $totalRefuse . '}}';
        }

    } else {
        echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "totalGray": ' . $totalGray . ', "totalAudit": ' . $totalAudit . ', "totalRefuse": ' . $totalRefuse . '}}';
    }
    die;

//删除
} else if ($action == "del") {

    if (!testPurview("delarticle")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

    $each = explode(",", $id);
    $async = array();
    $error = array();
    if ($id != "") {

        $adminid = $userLogin->getUserID();
        $purview = $userLogin->getPurview();
        if(preg_match('/founder/i', $purview)){
            $auditSwitch = false;
        }else{
            $delArcrank = true;
            $auditConfig = getAuditConfig("article");
            $auditSwitch = $auditConfig['switch'];
            $levelID = getAdminOrganId($adminid);
            if($levelID){
                if($auditSwitch && $auditConfig['auth'] <= 1){
                    $delArcrank = false;
                }
            }else{
                $delArcrank = false;
            }
        }

        foreach ($each as $val) {
            if($auditSwitch){
                if($delArcrank){
                    $sql = $dsql->SetQuery("SELECT `audit_log` FROM `#@__articlelist_all` WHERE `id` = $val");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $audit_log = $ret[0]['audit_log'];
                        if($audit_log){
                            $audit_log = unserialize($audit_log);
                            if($audit_log){
                                // 只有审核人员可删除
                                $ok = false;
                                foreach ($audit_log as $k => $v) {
                                    if($adminid == $v['admin']){
                                        if(isset($v['or']) || isset($v['special'])){
                                            if($v['state'] != 0){
                                                $ok = true;
                                            }
                                        }
                                    }
                                }
                                if(!$ok){
                                    $error[] = $val;
                                    continue;
                                }
                            }
                        }
                    }
                }else{
                    $error[] = $val;
                    continue;
                }
            }

            // $sub = new SubTable('article', '#@__articlelist');
            // $break_table = $sub->getSubTableById($id);
            $archives = $dsql->SetQuery("UPDATE `#@__articlelist_all` SET `del` = 1 WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "update");
            if ($results != "ok") {
                $error[] = $val;
            }else{
                $async[] = $val;
            }
        }
        dataAsync("article",$async,"list");  // 删除新闻
        if (!empty($error)) {
            echo '{"state": 200, "info": ' . json_encode($error) . '}';
        } else {

            checkArticleCache($id);
            adminLog("转移" . $dowtitle . "信息至回收站", $id);
            echo '{"state": 100, "info": ' . json_encode("所选信息已转移至回收站！") . '}';
        }
    }

//彻底删除
} else if ($action == "fullyDel") {
    if (!testPurview("delarticle")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    if ($id != "") {

        $each = explode(",", $id);
        $error = array();
        $async = array();
        $title = array();
        foreach ($each as $val) {

            //删除评论
            // $archives = $dsql->SetQuery("DELETE FROM `#@__" . $dopost . "common` WHERE `aid` = " . $val);
            // $dsql->dsqlOper($archives, "update");
            // $sub = new SubTable('article', '#@__articlelist');
            // $break_table = $sub->getSubTableById($id);
            $archives = $dsql->SetQuery("SELECT * FROM `#@__articlelist_all` WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "results");

            array_push($title, $results[0]['title']);

            //删除缩略图
            delPicFile($results[0]['litpic'], "delThumb", $dopost);

            //删除视频
            if($results[0]['videourl']){
                delPicFile($results[0]['videourl'], "delVideo", $dopost);
            }

            //删除内容图片
            $archives = $dsql->SetQuery("SELECT * FROM `#@__" . $dopost . "` WHERE `aid` = " . $val);
            $results = $dsql->dsqlOper($archives, "results");

            $body = $results[0]['body'];
            if (!empty($body)) {
                delEditorPic($body, $dopost);
            }

            $archives = $dsql->SetQuery("DELETE FROM `#@__" . $dopost . "` WHERE `aid` = " . $val);
            $dsql->dsqlOper($archives, "update");

            //删除图集
            $archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__" . $dopost . "pic` WHERE `aid` = " . $val);
            $results = $dsql->dsqlOper($archives, "results");

            //删除图片文件
            if (!empty($results)) {
                $atlasPic = "";
                foreach ($results as $key => $value) {
                    $atlasPic .= $value['picPath'] . ",";
                }
                delPicFile(substr($atlasPic, 0, strlen($atlasPic) - 1), "delAtlas", $dopost);
            }

            $archives = $dsql->SetQuery("DELETE FROM `#@__" . $dopost . "pic` WHERE `aid` = " . $val);
            $dsql->dsqlOper($archives, "update");

            //删除表
            $archives = $dsql->SetQuery("DELETE FROM `#@__articlelist_all` WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "update");
            if ($results != "ok") {
                $error[] = $val;
            }else{
                $async[] = $val;
            }
        }
        dataAsync("article",$async,"list");  // 新闻资讯、彻底删除
        if (!empty($error)) {
            echo '{"state": 200, "info": ' . json_encode($error) . '}';
        } else {
            adminLog("删除" . $dotitle . "信息", join(", ", $title));
            echo '{"state": 100, "info": ' . json_encode("删除成功！") . '}';
        }
        die;
    }
    die;

//还原
} else if ($action == "revert") {
    if (!testPurview("delarticle")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    $each = explode(",", $id);
    $error = array();
    $async = array();
    if ($id != "") {
        foreach ($each as $val) {
            // $sub = new SubTable('article', '#@__articlelist');
            // $break_table = $sub->getSubTableById($id);
            $archives = $dsql->SetQuery("UPDATE `#@__articlelist_all` SET `del` = 0 WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "update");
            if ($results != "ok") {
                $error[] = $val;
            }else{
                $async[] = $val;
            }
        }
        dataAsync("article",$async,"list");  // 信息、还原
        if (!empty($error)) {
            echo '{"state": 200, "info": ' . json_encode($error) . '}';
        } else {
            adminLog("还原" . $dowtitle . "信息", $id);
            echo '{"state": 100, "info": ' . json_encode("所选信息还原成功！") . '}';
        }
    }

//添加属性
} else if ($action == "addProperty") {
    if (!testPurview("editarticle")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    $each = explode(",", $id);
    $error = array();
    if ($id != "") {
        foreach ($each as $val) {
            // $sub = new SubTable('article', '#@__articlelist');
            // $break_table = $sub->getSubTableById($id);
            $archives = $dsql->SetQuery("SELECT `flag`, `litpic` FROM `#@__articlelist_all` WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "results");

            $flag = $results[0]["flag"] == "" ? $attr : $results[0]["flag"] . "," . $attr;

            if ($results[0]["litpic"]) {
                $flag .= ",p";
            }
            $flags_ = explode(',', $flag);
            $flag_h = in_array('h', $flags_) ? 1 : 0;
            $flag_r = in_array('r', $flags_) ? 1 : 0;
            $flag_b = in_array('b', $flags_) ? 1 : 0;
            $flag_t = in_array('t', $flags_) ? 1 : 0;
            $flag_p = $results[0]["litpic"] ? 1 : 0;

            $flag_sql_val = ", `flag_h` = '$flag_h', `flag_r` =  '$flag_r', `flag_b` = '$flag_b', `flag_t` = '$flag_t', `flag_p` = '$flag_p'";

            $archives = $dsql->SetQuery("UPDATE `#@__articlelist_all` SET `flag` = '$flag' ".$flag_sql_val." WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "update");

            if ($results != "ok") {
                $error[] = $val;
            }
        }
        if (!empty($error)) {
            echo '{"state": 200, "info": ' . json_encode($error) . '}';
        } else {
            checkArticleCache($id);
            adminLog("添加" . $dowtitle . "信息属性", $attr);
            echo '{"state": 100, "info": ' . json_encode("属性添加成功！") . '}';
        }
    }

//删除属性
} else if ($action == "delProperty") {
    if (!testPurview("editarticle")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    $each = explode(",", $id);
    $error = array();
    if ($id != "") {
        foreach ($each as $val) {
            // $sub = new SubTable('article', '#@__articlelist');
            // $break_table = $sub->getSubTableById($id);
            $archives = $dsql->SetQuery("SELECT `flag`, `litpic` FROM `#@__articlelist_all` WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "results");

            $flag = $results[0]["flag"];

            if (trim($flag) != '') {
                $flags = explode(',', $flag);
                $okflags = array();
                foreach ($flags as $f) {
                    if (!strstr($attr, $f)) $okflags[] = $f;
                }

                $flag = trim(join(',', $okflags));

                $flags_ = explode(',', $flag);
                $flag_h = in_array('h', $flags_) ? 1 : 0;
                $flag_r = in_array('r', $flags_) ? 1 : 0;
                $flag_b = in_array('b', $flags_) ? 1 : 0;
                $flag_t = in_array('t', $flags_) ? 1 : 0;
                $flag_p = $results[0]['litpic'] ? 1 : 0;
                $flag_sql_val = ", `flag_h` = '$flag_h', `flag_r` =  '$flag_r', `flag_b` = '$flag_b', `flag_t` = '$flag_t', `flag_p` = '$flag_p'";

                $archives = $dsql->SetQuery("UPDATE `#@__articlelist_all` SET `flag` = '$flag' ".$flag_sql_val." WHERE `id` = " . $val);
                $results = $dsql->dsqlOper($archives, "update");

                if ($results != "ok") {
                    $error[] = $val;
                }
            }
        }
        if (!empty($error)) {
            echo '{"state": 200, "info": ' . json_encode($error) . '}';
        } else {
            // 检查缓存
            checkArticleCache($id);

            adminLog("删除" . $dowtitle . "信息属性", $attr);
            echo '{"state": 100, "info": ' . json_encode("属性删除成功！") . '}';
        }
    }

//移动分类
} else if ($action == "move") {
    if (!testPurview("editarticle")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    $each = explode(",", $id);
    $error = array();
    $async = array();
    if ($id != "") {
        foreach ($each as $val) {
            // $sub = new SubTable('article', '#@__articlelist');
            // $break_table = $sub->getSubTableById($id);
            $archives = $dsql->SetQuery("UPDATE `#@__articlelist_all` SET `typeid` = $typeid WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "update");
            if ($results != "ok") {
                $error[] = $val;
            }else{
                $async[] = $val;
            }
        }
        dataAsync("article",$async,"list");  // 新闻资讯、移动分类
        if (!empty($error)) {
            echo '{"state": 200, "info": ' . json_encode($error) . '}';
        } else {

            checkArticleCache($id);

            adminLog("转移" . $dowtitle . "信息", $id . "=>" . $typeid);
            echo '{"state": 100, "info": ' . json_encode("修改成功！") . '}';
        }
    }

//更新状态
} else if ($action == "updateState") {
    if (!testPurview("editarticle")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    $each = explode(",", $id);
    $error = array();
    $async = array();

    global $handler;
    $handler = true;

    if ($id != "") {

        $auditConfig = getAuditConfig();
        if($auditConfig['switch']){
            $purview = $userLogin->getPurview();
            // 只有超级管理员可以快捷修改状态
            // 或者信息分类没有绑定管理员
            if(!preg_match('/founder/i', $purview)){

                // 判断信息中是否有审核数据
                $sql = $dsql->SetQuery("SELECT `audit_log` FROM `#@__articlelist_all` WHERE `id` = $id");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    if($ret[0]['audit_log']){
                        die('{"state": 200, "info": ' . json_encode("对不起，操作权限错误！") . '}');
                    }
                }
            }
        }

        foreach ($each as $val) {

            //查询信息之前的状态
            $sql = $dsql->SetQuery("SELECT `audit_state`,`admin` FROM `#@__articlelist_all` WHERE `id` = $val");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $arcrank_ = $ret[0]['audit_state'];
                $uid   = $ret[0]['admin'];
                //获取会员名
                $username = "";
                $point   = "";
                $point = "";
                $sql = $dsql->SetQuery("SELECT `username`,`point` FROM `#@__member` WHERE `id` = $uid");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $username = $ret[0]['username'];
                    $point = $ret[0]['point'];

                }
                //会员消息通知
                if($arcrank != $arcrank_) {
                    //已审核
                    if ($arcrank == 1) {
                        $countIntegral = countIntegral($uid);    //统计积分上限
                        global $cfg_returnInteraction_article;    //咨询积分
                        global $cfg_returnInteraction_commentDay;
                        if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_article > 0) {
                            $infoname = getModuleTitle(array('name' => 'article'));
                            //咨询发布得积分
                            $date = GetMkTime(time());
                            global  $userLogin;
                            //增加积分
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_article' WHERE `id` = '$uid'");
                            $dsql->dsqlOper($archives, "update");
                            $user  = $userLogin->getMemberInfo($uid);
                            $userpoint = $user['point'];
//                            $pointuser   = (int)($userpoint+$cfg_returnInteraction_article);
                            //保存操作日志
                            global $langData;
                            $info = '发布'.$infoname;
                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$uid', '1', '$cfg_returnInteraction_article', '$info', '$date','zengsong','1','$userpoint')");//发布咨询得积分
                            $dsql->dsqlOper($archives, "update");
                            $param = array(
                                "service" => "member",
                                "type" => "user",
                                "template" => "point"
                            );

                            //自定义配置
                            $config = array(
                                "username" => $username,
                                "amount" => $cfg_returnInteraction_article,
                                "point" => $point,
                                "date" => date("Y-m-d H:i:s", $date),
                                "info" => $info,
                                "fields" => array(
                                    'keyword1' => '变动类型',
                                    'keyword2' => '变动积分',
                                    'keyword3' => '变动时间',
                                    'keyword4' => '积分余额'
                                )
                            );
                            updateMemberNotice($uid, "会员-积分变动通知", $param, $config);
                        }
                    }
                }
            }

            //  会员消息通知
            // memberNotice($val, $arcrank);
            // $sub = new SubTable('article', '#@__articlelist');
            // $break_table = $sub->getSubTableById($id);
            //更新记录状态
            $archives = $dsql->SetQuery("UPDATE `#@__articlelist_all` SET `arcrank` = $arcrank WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "update");
            if ($results != "ok") {
                $error[] = $val;
            }else{
                $async[] = $val;
            }

        }
        dataAsync("article",$async,"list");  // 修改资讯状态
        if (!empty($error)) {
            echo '{"state": 200, "info": ' . json_encode($error) . '}';
        } else {
            checkArticleCache($id);

            adminLog("更新" . $dowtitle . "信息状态", $id . "=>" . $arcrank);
            echo '{"state": 100, "info": ' . json_encode("修改成功！") . '}';
        }
    }

//获取指定ID信息详情
} else if ($action == "getArticleDetail") {
    if ($id != "") {
        $archives = $dsql->SetQuery("SELECT `typeid`, `title`, `subtitle`, `flag`, `arcrank` FROM `#@__articlelist_all` WHERE `id` = " . $id);
        $results = $dsql->dsqlOper($archives, "results");
        echo json_encode($results);
    }

//更新快速编辑信息
} else if ($action == "updateDetail") {
    if (!testPurview("editarticle")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    $flags = isset($flags) ? join(',', $flags) : '';

    $flags_ = explode(',', $flags);
    $flag_h = in_array('h', $flags_) ? 1 : 0;
    $flag_r = in_array('r', $flags_) ? 1 : 0;
    $flag_b = in_array('b', $flags_) ? 1 : 0;
    $flag_t = in_array('t', $flags_) ? 1 : 0;
    $flag_p = in_array('p', $flags_) ? 1 : 0;
    $flag_sql_val = ", `flag_h` = '$flag_h', `flag_r` =  '$flag_r', `flag_b` = '$flag_b', `flag_t` = '$flag_t', `flag_p` = '$flag_p'";





    if ($id == "") die('要修改的信息ID传递失败！');
    //对字符进行处理
    $title = cn_substrR($title, 60);
    $subtitle = cn_substrR($subtitle, 36);

    //表单二次验证
    if (trim($title) == '') {
        echo '{"state": 101, "info": ' . json_encode("标题不能为空！") . '}';
        exit();
    }

    if ($typeid == '') {
        echo '{"state": 101, "info": ' . json_encode("请选择文章分类！") . '}';
        exit();
    }

    //会员消息通知
    memberNotice($id, $arcrank);


    $archives = $dsql->SetQuery("UPDATE `#@__articlelist_all` SET `typeid` = $typeid, `title` = '$title', `subtitle` = '$subtitle', `flag` = '$flags', `arcrank` = $arcrank  ".$flag_sql_val."WHERE `id` = " . $id);
    $results = $dsql->dsqlOper($archives, "update");
    if ($results != "ok") {
        echo $results;
    } else {
        checkArticleCache($id);
        dataAsync("article",$id,"list");  // 快速编辑文章
        adminLog("快速编辑" . $dowtitle . "信息", $id);
        echo '{"state": 100, "info": ' . json_encode("修改成功！") . '}';
    }

//更新文章分类
} else if ($action == "typeAjax") {
    if (!testPurview("articleType")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    $mold = $_POST['mold'];
    $data = str_replace("\\", '', $_POST['data']);
    if ($data != "") {
        $json = json_decode($data);

        $json = objtoarr($json);
        $json = typeAjax($json, 0, $dopost . "type", array('`mold`', $mold));

        clearArticleTypeCache();

        echo $json;
    }

//更新自媒体领域
} else if ($action == "mediafieldAjax") {
    if (!testPurview("selfmediaField")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    $type = $_POST['type'];
    $data = str_replace("\\", '', $_POST['data']);
    if ($data != "") {
        $json = json_decode($data);

        $json = objtoarr($json);
        $json = typeAjax($json, 0, "article_selfmedia_field");

        echo $json;
    }

//获取评论详细信息
} else if ($action == "getArticleCommonDetail") {
    if ($id != "") {
        $archives = $dsql->SetQuery("SELECT `aid`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck` FROM `#@__" . $dopost . "common` WHERE `id` = " . $id);
        $results = $dsql->dsqlOper($archives, "results");

        if (count($results) > 0) {
            // $sub = new SubTable('article', '#@__articlelist');
            // $break_table = $sub->getSubTableById($id);
            $archives = $dsql->SetQuery("SELECT `title` FROM `#@__articlelist_all` WHERE `id` = " . $results[0]["aid"]);
            $dsqlInfo = $dsql->dsqlOper($archives, "results");

            $title = $dsqlInfo[0]["title"];
            $results[0]["title"] = $title;

            if ($results[0]["userid"] == 0 || $results[0]["userid"] == -1) {
                $username = "游客";
            } else {
                $archives = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = " . $results[0]["userid"]);
                $member = $dsql->dsqlOper($archives, "results");

                $username = $member[0]["username"];
            }
            $results[0]["username"] = $username;

            echo json_encode($results);

        } else {
            echo '{"state": 200, "info": ' . json_encode("评论信息获取失败！") . '}';
        }
    }

//更新评论信息
} else if ($action == "updateCommonDetail") {

    if (!testPurview("editarticleCommon")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

    $dtime = GetMkTime($commonTime);
    $ipAddr = getIpAddr($ip);

    if ($id == "") die('要修改的信息ID传递失败！');

    //会员通知
    $sql = $dsql->SetQuery("SELECT l.`title`, l.`admin`, l.`pubdate`, c.`aid`, c.`userid`, c.`ischeck`, c.`dtime`,c.`rid`,c.`pid` FROM `#@__" . $dopost . "common` c LEFT JOIN `#@__articlelist_all` l ON l.`id` = c.`aid` WHERE c.`id` = $id");
    $ret = $dsql->dsqlOper($sql, "results");
    if ($ret) {
        $title = $ret[0]['title'];
        $admin = $ret[0]['admin'];
        $pubdate = $ret[0]['pubdate'];
        $aid = $ret[0]['aid'];
        $userid = $ret[0]['userid'];
        $ischeck = $ret[0]['ischeck'];
        $dtime = $ret[0]['dtime'];
        $pid     = $ret[0]['pid'];
        $rid     = $ret[0]['rid'];

        //验证评论状态
        if ($ischeck != $commonIsCheck) {

            $param = array(
                "service" => $dopost,
                "template" => "detail",
                "id" => $aid
            );

            //只有审核通过的信息才发通知
            if ($commonIsCheck == 1) {

                //获取会员名
                $username = "";
                $sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $userid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $username = $ret[0]['username'];
                }

                //自定义配置
        		$config = array(
        			"username" => $username,
        			"title" => $title,
        			"date" => date("Y-m-d H:i:s", $dtime),
        			"fields" => array(
        				'keyword1' => '信息标题',
        				'keyword2' => '发布时间',
        				'keyword3' => '进展状态'
        			)
        		);

                updateMemberNotice($userid, "会员-评论审核通过", $param, $config);

                /*评论id*/
                $pcid = $pid;
                $pltype = "评论了您";
                if($rid!=0){
                    $pcid = $rid;
                    $pltype = "回复了您";
                    $archives = $dsql->SetQuery("SELECT `userid` FROM `#@__public_comment_all` WHERE `id` = " . $pcid);
                    $results  = $dsql->dsqlOper($archives, "results");
                    if($results){
                        $admin        = $results[0]['userid'];
                        // $userid       = $admin;
                    }
                }

                //获取会员名
                $username = "";
                $sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $userid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $username = $ret[0]['username'];
                }

                //自定义配置
        		$config = array(
                    "username"    => $username,
                    "noticetitle" => $username.$pltype,
                    "title" => $title,
                    "date" => date("Y-m-d H:i:s", $pubdate),
                    "fields" => array(
                        'keyword1' => '信息标题',
                        'keyword2' => '评论时间',
                        'keyword3' => '进展状态'
                    )
                );

                updateMemberNotice($admin, "会员-新评论通知", $param, $config);
            }

        }
    }

    $archives = $dsql->SetQuery("UPDATE `#@__" . $dopost . "common` SET `content` = '$commonContent', `dtime` = '" . GetMkTime($commonTime) . "', `ip` = '$commonIp', `good` = '$commonGood', `bad` = '$commonBad', `ischeck` = '$commonIsCheck' WHERE `id` = " . $id);
    $results = $dsql->dsqlOper($archives, "update");
    if ($results != "ok") {
        echo $results;
    } else {
        adminLog("更新" . $dowtitle . "评论信息", $id);
        echo '{"state": 100, "info": ' . json_encode("修改成功！") . '}';
    }

//更新评论状态
} else if ($action == "updateCommonState") {

    if (!testPurview("editarticleCommon")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

    $each = explode(",", $id);
    $error = array();
    if ($id != "") {
        foreach ($each as $val) {

            //会员通知
            $sql = $dsql->SetQuery("SELECT l.`title`, l.`admin`, l.`pubdate`, c.`aid`, c.`userid`, c.`ischeck`, c.`dtime`,c.`rid`,c.`pid` FROM `#@__" . $dopost . "common` c LEFT JOIN `#@__articlelist_all` l ON l.`id` = c.`aid` WHERE c.`id` = $val");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $title   = $ret[0]['title'];
                $admin   = $ret[0]['admin'];
                $pubdate = $ret[0]['pubdate'];
                $aid     = $ret[0]['aid'];
                $userid  = $ret[0]['userid'];
                $ischeck = $ret[0]['ischeck'];
                $dtime   = $ret[0]['dtime'];
                $pid     = $ret[0]['pid'];
                $rid     = $ret[0]['rid'];

                //验证评论状态
                if ($ischeck != $arcrank) {

                    $param = array(
                        "service" => $dopost,
                        "template" => "detail",
                        "id" => $aid
                    );

                    //只有审核通过的信息才发通知
                    if ($arcrank == 1) {

                        //获取会员名
                        $username = "";
                        $sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $userid");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            $username = $ret[0]['username'];
                        }

                        //自定义配置
                		$config = array(
                			"username" => $username,
                			"title" => $title,
                			"date" => date("Y-m-d H:i:s", $dtime),
                			"fields" => array(
                				'keyword1' => '信息标题',
                				'keyword2' => '发布时间',
                				'keyword3' => '进展状态'
                			)
                		);

                        updateMemberNotice($userid, "会员-评论审核通过", $param, $config);
                        $pcid = $pid;
                        $pltype = "评论了您";
                        if($rid!=0){
                            $pcid = $rid;
                            $pltype = "回复了您";
                            $archives = $dsql->SetQuery("SELECT `userid` FROM `#@__public_comment_all` WHERE `id` = " . $pcid);
                            $results  = $dsql->dsqlOper($archives, "results");
                            if($results){
                                $admin        = $results[0]['userid'];
                                // $userid       = $admin;
                            }
                        }
                        //获取会员名
                        $username = "";
                        $sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $userid");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            $username = $ret[0]['username'];
                        }

                        //自定义配置
                        $config = array(
                            "username"    => $username,
                            "noticetitle" => $username.$pltype,
                            "title" => $title,
                            "date" => date("Y-m-d H:i:s", $pubdate),
                            "fields" => array(
                                'keyword1' => '信息标题',
                                'keyword2' => '评论时间',
                                'keyword3' => '进展状态'
                            )
                        );
                        updateMemberNotice($admin, "会员-新评论通知", $param, $config);

                    }

                }
            }

            $archives = $dsql->SetQuery("UPDATE `#@__" . $dopost . "common` SET `ischeck` = $arcrank WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "update");
            if ($results != "ok") {
                $error[] = $val;
            }
        }
        if (!empty($error)) {
            echo '{"state": 200, "info": ' . json_encode($error) . '}';
        } else {
            adminLog("更新" . $dowtitle . "评论信息状态", $id . "=>" . $arcrank);
            echo '{"state": 100, "info": ' . json_encode("修改成功！") . '}';
        }
    }

//删除评论
} else if ($action == "delArticleCommon") {

    if (!testPurview("delarticleCommon")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

    $each = explode(",", $id);
    $error = array();
    if ($id != "") {
        foreach ($each as $val) {
            $archives = $dsql->SetQuery("DELETE FROM `#@__" . $dopost . "common` WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "update");
            if ($results != "ok") {
                $error[] = $val;
            }
        }
        if (!empty($error)) {
            echo '{"state": 200, "info": ' . json_encode($error) . '}';
        } else {
            adminLog("删除" . $dowtitle . "评论", $id);
            echo '{"state": 100, "info": ' . json_encode("删除成功！") . '}';
        }
    }

//获取评论列表
} else if ($action == "getCommonList") {

    if (!testPurview("articleCommon")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page = $page == "" ? 1 : $page;

    $where = "";

    $where2 = getCityFilter('`cityid`');

    if ($adminCity){
        $where2 .= getWrongCityFilter('`cityid`', $adminCity);
    }

    if ($sKeyword != "") {
        //按评论内容搜索
        if ($sType == 0) {
            $where .= " AND `content` like '%$sKeyword%'";

            //按文章标题搜索
        }elseif ($sType == "1") {
            $where2 .= " AND `title` like '%$sKeyword%'";

            //按评论人搜索
        } elseif ($sType == "2") {
            if ($sKeyword == "游客") {
                $where .= " AND (`userid` = 0 OR `userid` = -1)";
            } else {
                $archives = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` like '%$sKeyword%'");
                $results = $dsql->dsqlOper($archives, "results");

                if (count($results) > 0) {
                    $list = array();
                    foreach ($results as $key => $value) {
                        $list[] = $value["id"];
                    }
                    $idList = join(",", $list);

                    $where .= " AND `userid` in ($idList)";

                } else {
                    echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';
                    die;
                }
            }

            //按IP搜索
        } elseif ($sType == "3") {
            $where .= " AND `ip` like '%$sKeyword%'";
        }
    }

    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__" . $dopost . "common`");

    //总条数
    $totalCount = $dsql->dsqlOper($archives . " WHERE 1 = 1" . $where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount / $pagestep);
    //待审核
    $totalGray = $dsql->dsqlOper($archives . " WHERE `ischeck` = 0" . $where, "totalCount");
    //已审核
    $totalAudit = $dsql->dsqlOper($archives . " WHERE `ischeck` = 1" . $where, "totalCount");
    //拒绝审核
    $totalRefuse = $dsql->dsqlOper($archives . " WHERE `ischeck` = 2" . $where, "totalCount");

    if ($state != "") {
        $where .= " AND `ischeck` = $state";

        if ($state == 0) {
            $totalPage = ceil($totalGray / $pagestep);
        } elseif ($state == 1) {
            $totalPage = ceil($totalAudit / $pagestep);
        } elseif ($state == 2) {
            $totalPage = ceil($totalRefuse / $pagestep);
        }
    }
    $where .= " order by `id` desc";

    $atpage = $pagestep * ($page - 1);
    $where .= " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT `id`, `aid`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `ischeck` FROM `#@__" . $dopost . "common` WHERE 1 = 1" . $where);
    $results = $dsql->dsqlOper($archives, "results");

    if (count($results) > 0) {
        $list = array();
        // $sub = new SubTable('article', '#@__articlelist');

        foreach ($results as $key => $value) {
            $list[$key]["id"] = $value["id"];
            $list[$key]["articleId"] = $value["aid"];

            // $tab = $sub->getSubTableById($value['aid']);
            $typeSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__articlelist_all` WHERE `id` = " . $value["aid"]);
            $typename = $dsql->getTypeName($typeSql);
            $list[$key]["articleTitle"] = $typename[0]['title'];

            $param = array(
                "service" => "article",
                "template" => "detail",
                "id" => $typename[0]['id']
            );
            $list[$key]["articleUrl"] = getUrlPath($param);

            $list[$key]["commonUserId"] = $value["userid"];
            $list[$key]["commonUser"] = $value["userid"];

            $member = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = " . $value["userid"]);
            $username = $dsql->dsqlOper($member, "results");
            $list[$key]["commonUserName"] = $username[0]["username"] == null ? "游客" : $username[0]["username"];

            $list[$key]["commonContent"] = $value["content"];
            $list[$key]["commonTime"] = date('Y-m-d H:i:s', $value["dtime"]);
            $list[$key]["commonIp"] = $value["ip"];
            $list[$key]["commonIpAddr"] = $value["ipaddr"];

            $state = "";
            switch ($value["ischeck"]) {
                case "0":
                    $state = "等待审核";
                    break;
                case "1":
                    $state = "审核通过";
                    break;
                case "2":
                    $state = "审核拒绝";
                    break;
            }

            $list[$key]["commonIsCheck"] = $state;
        }
        if (count($list) > 0) {
            echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "totalGray": ' . $totalGray . ', "totalAudit": ' . $totalAudit . ', "totalRefuse": ' . $totalRefuse . '}, "commonList": ' . json_encode($list) . '}';
        } else {
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "totalGray": ' . $totalGray . ', "totalAudit": ' . $totalAudit . ', "totalRefuse": ' . $totalRefuse . '}}';
        }
    } else {
        echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "totalGray": ' . $totalGray . ', "totalAudit": ' . $totalAudit . ', "totalRefuse": ' . $totalRefuse . '}}';
    }

//选择来源、作者
} elseif ($action == "chooseData") {
    if ($type != "") {
        $m_file = HUONIAODATA . "/admin/" . $type . ".txt";
        $list = array();
        if (filesize($m_file) > 0) {
            $fp = fopen($m_file, 'r');
            $str = fread($fp, filesize($m_file));
            fclose($fp);
            $strs = explode(',', $str);
            foreach ($strs as $str) {
                $str = trim($str);
                if ($str != "") {
                    array_push($list, $str);
                }
            }
        }
        echo json_encode($list);
    }

//保存来源、作者
} elseif ($action == "saveChooseData") {
    if ($type != "") {
        $m_file = HUONIAODATA . "/admin/" . $type . ".txt";
        adminLog("更新" . $type . "信息", $type . ".txt");

        $fp = fopen($m_file, "w") or die("写入文件 $m_file 失败，请检查权限！");
        fwrite($fp, $val);
        fclose($fp);
    }

//配置站内链接
} elseif ($action == "allowurl") {
    $m_file = HUONIAODATA . "/admin/allowurl.txt";
    $list = array();
    if (filesize($m_file) > 0) {
        $fp = fopen($m_file, 'r');
        $str = fread($fp, filesize($m_file));
        fclose($fp);
    }
    echo $str;

//保存站内链接
} elseif ($action == "saveAllowurl") {
    $m_file = HUONIAODATA . "/admin/allowurl.txt";
    adminLog("更新站内允许链接", "allowurl.txt");

    $fp = fopen($m_file, "w") or die("写入文件 $m_file 失败，请检查权限！");
    fwrite($fp, $val);
    fclose($fp);

//操作审核流程
} elseif ($action == "audit") {
    $sql = $dsql->SetQuery("SELECT `audit_log`, `arcrank` FROM `#@__articlelist_all` WHERE `id` = '$id'");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $audit_log = $ret[0]['audit_log'];

        if($audit_log){
            $audit_log = unserialize($audit_log);
            // print_r($audit_log);die;

            if($audit_log){

                $auditConfig = getAuditConfig();
                $adminid = $userLogin->getUserID();


                // 前台会员或后台独立编辑投稿，有分类管理员审核，任何一个人审核操作后其他人无法操作
                if(isset(current($audit_log)['or']) && current($audit_log)['or']){

                    $has_succadmin = 0;

                    // 检查是否已被处理
                    foreach ($audit_log as $k => $v) {
                        if($v['state'] != 0){
                            $has_succadmin = $v['id'];
                        }
                        if($v['admin'] == $adminid){

                        }
                    }

                    if($has_succadmin && $has_succadmin != $adminid){
                        echo '{"state": 200, "info": ' . json_encode("该信息已被其他审核人员处理！") . '}';
                        exit();
                    }

                    $pubdate = GetMktime(time());

                    $state_ = $audit_log[$adminid]['state'];
                    if($state_ == $state){
                        echo '{"state": 200, "info": ' . json_encode("审核状态未改变！") . '}';
                        exit();
                    }

                    // $levelID = getAdminOrganId($adminid);

                    $audit_log[$adminid]['id']      = $adminid;
                    $audit_log[$adminid]['state']   = $state;
                    $audit_log[$adminid]['note']    = $note;
                    $audit_log[$adminid]['pubdate'] = $pubdate;
                    $audit_log[$adminid]['log'][] = array(
                        "admin" => $adminid,
                        "pubdate" => $pubdate,
                        "oldstate" => $state_,
                        "newstate" => $state,
                        "note" => $note
                    );

                    $audit_state = array();
                    foreach ($audit_log as $k => $v) {
                        $audit_state[] = $v['id'].":".$v['state'];
                    }
                    $audit_state = join("|", $audit_state);


                    $arcrank = $state;
                    // print_R($audit_log);die;
                    $audit_log = serialize($audit_log);

                }else{

                    $checkLevelID = $audit_log[0]['id'];
                    $levelID = getAdminOrganId($adminid, $checkLevelID);

                    // 验证是否可修改审核状态
                    $no = 0;
                    $has_higher = false;
                    $audit_reverse = array_reverse($audit_log);
                    foreach ($audit_reverse as $k => $v) {
                        // 存在更高级的审核人员
                        if($v['id'] < $levelID){
                            if($v['state']){
                                $no = 1;
                                break;
                            }
                            $has_higher = true;
                        }elseif($v['id'] > $levelID){
                            if($v['state'] != 1){
                                $no = 1;
                                break;
                            }
                        }
                    }
                    if($no){
                        echo '{"state": 200, "info": ' . json_encode("权限错误！") . '}';
                        exit();
                    }
                    // 存在更高级审核人员，并且审核状态已更改过则不允许操作
                    if($has_higher && $ret[0]['arcrank'] != 0){
                        echo '{"state": 200, "info": ' . json_encode("信息已经进行过审核操作！") . '}';
                        exit();
                    }

                    $pubdate = GetMktime(time());

                    $state_ = $audit_log[$levelID]['state'];
                    if($state_ == $state){
                        echo '{"state": 200, "info": ' . json_encode("审核状态未改变！") . '}';
                        exit();
                    }

                    $audit_log[$levelID]['log'][] = array(
                        "admin" => $adminid,
                        "pubdate" => $pubdate,
                        "oldstate" => $state_,
                        "newstate" => $state,
                        "note" => $note
                    );

                    $audit_state = array();
                    $audit_state[] = $auditConfig['type'] ? "GRADED" : "PARENT";

                    $arcrank = 0;
                    // 审核拒绝，清空审核结果
                    if($state == 2){
                        foreach ($audit_log as $k => $v) {
                            $audit_log[$k]['admin'] = 0;
                            $audit_log[$k]['state'] = 0;
                            $audit_log[$k]['pubdate'] = '';
                            $audit_log[$k]['note'] = '';
                            $audit_state[] = $v['id'].":0";
                        }

                    }elseif($state == 1){
                        // 最后一级
                        if(!$has_higher){
                            $arcrank = 1;
                        }

                        $audit_log[$levelID]['admin']   = $adminid;
                        $audit_log[$levelID]['state']   = $state;
                        $audit_log[$levelID]['note']    = $note;
                        $audit_log[$levelID]['pubdate'] = $pubdate;

                        foreach ($audit_log as $k => $v) {
                            $audit_state[] = $v['id'].":".$v['state'];
                        }

                    }

                    // print_r($audit_log);die;
                    $audit_log = serialize($audit_log);
                    $audit_state = join("|", $audit_state);

                }

            // 没有设置审核人员--分类没有绑定管理员
            }else{
                $adminid = $userLogin->getUserID();
                $levelID = getAdminOrganId($adminid);
                if($levelID){
                    if($state == 0){
                        echo '{"state": 200, "info": ' . json_encode("审核状态未改变！") . '}';
                        exit();
                    }
                    $pubdate = GetMktime(time());
                    $audit_log = $audit_state = array();

                    $audit_log[$levelID]['id'] = $levelID;
                    $audit_log[$levelID]['admin']   = $adminid;
                    $audit_log[$levelID]['special']   = 1;
                    $audit_log[$levelID]['state']   = $state;
                    $audit_log[$levelID]['note']    = $note;
                    $audit_log[$levelID]['pubdate'] = $pubdate;
                    $audit_log[$levelID]['log'][] = array(
                        "admin" => $adminid,
                        "pubdate" => $pubdate,
                        "oldstate" => 0,
                        "newstate" => $state,
                        "note" => $note,
                    );
                    $arcrank = $state;

                    $audit_state[] = $levelID.":".$state;

                    $arcrank = $state;
                    $audit_log = serialize($audit_log);
                    $audit_state = join("|", $audit_state);

                }else{
                    echo '{"state": 200, "info": ' . json_encode("权限错误！") . '}';
                    exit();
                }
            }

            // 更新审核记录和状态
            $sql = $dsql->SetQuery("UPDATE `#@__articlelist_all` SET `audit_state` = '$audit_state', `audit_log` = '$audit_log', `arcrank` = '$arcrank' WHERE `id` = $id");
            $ret = $dsql->dsqlOper($sql, "update");
            dataAsync("article",$id,"list");//更新审核状态
            if($ret == "ok"){
                adminLog("修改信息审核状态", $id . "=>" . $state);
                echo '{"state": 100, "info": ' . json_encode("操作成功！") . ', "pubdate" : "' . date("Y-m-d H:i:s", $pubdate) . '"}';
            }else{
                echo '{"state": 200, "info": ' . json_encode("操作失败！") . '}';
            }

        }else{
            echo '{"state": 200, "info": ' . json_encode("操作失败！") . '}';
        }
    }

//获取自媒体
} else if ($action == "selfmediaList") {

    include_once HUONIAOROOT."/api/handlers/article.class.php";
    $article = new article();
    $typeAll = $article->selfmedia_type();
    $typeList = array();
    foreach ($typeAll as $key => $value) {
        $typeList[$value['id']] = $value['typename'];
    }

    if ($adminCity){
        $where .= getWrongCityFilter('a.`cityid`', $adminCity);
    }
    if($sKeyword != ""){
        $where .= " AND (a.`ac_name` LIKE '%{$sKeyword}%' OR a.`op_phone` = '{$sKeyword}' OR m.`nickname` LIKE '%{$sKeyword}%' OR m.`phone` = '{$sKeyword}')";
    }
    if($sType){
        $where .= " AND a.`type` = $sType";
    }

    // 总数
    $sql = $dsql->SetQuery("SELECT count(a.`id`) as c FROM `#@__article_selfmedia` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE 1 = 1" . getCityFilter('a.`cityid`') . $where);
    $res = $dsql->dsqlOper($sql, "results");
    $totalCount = $res[0]['c'];

    // 入驻待审核
    $sql = $dsql->SetQuery("SELECT count(a.`id`) as c FROM `#@__article_selfmedia` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE (a.`state` = 0)" . getCityFilter('a.`cityid`') . $where);
    $res = $dsql->dsqlOper($sql, "results");
    $totalGray_join = $res[0]['c'];

    // 资料更新待审核
    $sql = $dsql->SetQuery("SELECT count(a.`id`) as c FROM `#@__article_selfmedia` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE (a.`state` = 1 AND a.`editstate` = 0)" . getCityFilter('a.`cityid`') . $where);
    $res = $dsql->dsqlOper($sql, "results");
    $totalGray_update = $res[0]['c'];

    // 所有待审核
    $totalGray = $totalGray_join + $totalGray_update;

    // 入驻已审核
    $sql = $dsql->SetQuery("SELECT count(a.`id`) as c FROM `#@__article_selfmedia` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE (a.`state` = 1)" . getCityFilter('a.`cityid`') . $where);
    $res = $dsql->dsqlOper($sql, "results");
    $totalAudit_join = $res[0]['c'];

    // 入驻拒绝审核
    $sql = $dsql->SetQuery("SELECT count(a.`id`) as c FROM `#@__article_selfmedia` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE (a.`state` = 2)" . getCityFilter('a.`cityid`') . $where);
    $res = $dsql->dsqlOper($sql, "results");
    $totalRefuse_join = $res[0]['c'];

    // 资料更新拒绝审核
    $sql = $dsql->SetQuery("SELECT count(a.`id`) as c FROM `#@__article_selfmedia` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE (a.`state` = 1 && a.`editstate` = 2)" . getCityFilter('a.`cityid`') . $where);
    $res = $dsql->dsqlOper($sql, "results");
    $totalRefuse_update = $res[0]['c'];


    if($state == "0"){
        $where .= " AND (a.`state` = 0 || a.`editstate` = 0)";
        $totalCount = $totalGray;
    // 入驻待审核
    }elseif($state == "1"){
        $where .= " AND (a.`state` = 0)";
        $totalCount = $totalGray_join;
    // 入驻已审核
    }elseif($state == "2"){
        $where .= " AND (a.`state` = 1)";
        $totalCount = $totalAudit_join;
    // 入驻拒绝审核
    }elseif($state == "3"){
        $where .= " AND (a.`state` = 2)";
        $totalCount = $totalRefuse_join;
    // 资料更新待审核
    }elseif($state == "4"){
        $where .= " AND (a.`state` = 1 && a.`editstate` = 0)";
        $totalCount = $totalGray_update;
    // 资料更新审核拒绝
    }elseif($state == "5"){
        $where .= " AND (a.`state` = 1 && a.`editstate` = 2)";
        $totalCount = $totalRefuse_update;
    }

    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page = $page == "" ? 1 : $page;

    $totalPage = ceil($totalCount / $pagestep);

    $atpage = $pagestep * ($page - 1);
    $where .= " ORDER BY a.`id` DESC LIMIT $atpage, $pagestep";

    $archives = $dsql->SetQuery("SELECT a.`id`, a.`cityid`, a.`type`, a.`userid`, a.`ac_name`, a.`ac_photo`, a.`state`, a.`editstate`, a.`pubdate` FROM `#@__article_selfmedia` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE 1 = 1" . getCityFilter('a.`cityid`') . $where);
    $results = $dsql->dsqlOper($archives, "results");
    // echo $archives;die;
    if($results){
        $list = array();

        foreach ($results as $key => $value) {
            $list[$key]['id']       = $value['id'];
            $list[$key]['cityid']   = $value['cityid'];
            $cityname = getSiteCityName($value['cityid']);
            $list[$key]['cityname'] = $cityname;
            $list[$key]['type']     = isset($typeList[$value['type']]) ? $typeList[$value['type']] : "未知";
            $list[$key]['typeid']   = $value['type'];
            $list[$key]['userid']   = $value['userid'];
            $list[$key]['ac_name']  = $value['ac_name'];
            $list[$key]['ac_photo'] = $value['ac_photo'] ? getFilePath($value['ac_photo']) : "";
            $list[$key]['state']    = $value['state'];
            $list[$key]['editstate'] = $value['editstate'];
            $list[$key]['pubdate']  = date("Y-m-d:H:i:s", $value['pubdate']);

            $param = array(
                "service" => "article",
                "template" => "mddetail",
                "id" => $value['id'],
            );
            $list[$key]['url']      = getUrlPath($param);

            $admin = $value['userid'];
            $adminame = "";
            if($admin > 0){
                $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname` FROM `#@__member` WHERE `id` = ". $admin);
				$username = $dsql->getTypeName($userSql);
				$adminame = $username[0]["nickname"] ? $username[0]["nickname"] : $username[0]["username"];
            }else{
                $adminame = "未指定";
            }
            $list[$key]['admin'] = $admin;
            $list[$key]['adminame'] = $adminame;
        }
        echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {
            "totalPage": ' . $totalPage
            . ', "totalCount": ' . $totalCount
            . ', "totalGray": ' . $totalGray
            . ', "totalGray_join": ' . $totalGray_join
            . ', "totalAudit_join": ' . $totalAudit_join
            . ', "totalRefuse_join": ' . $totalRefuse_join
            . ', "totalGray_update": ' . $totalGray_update
            . ', "totalRefuse_update": ' . $totalRefuse_update
            . '}, "selfmediaList": ' . json_encode($list) . '}';

    } else {
        echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {
            "totalPage": ' . $totalPage
            . ', "totalCount": ' . $totalCount
            . ', "totalGray": ' . $totalGray
            . ', "totalGray_join": ' . $totalGray_join
            . ', "totalAudit_join": ' . $totalAudit_join
            . ', "totalRefuse_join": ' . $totalRefuse_join
            . ', "totalGray_update": ' . $totalGray_update
            . ', "totalRefuse_update": ' . $totalRefuse_update
            . '}}';
    }

    die;


//更新自媒体状态
} else if ($action == "updateSelfmediaState") {
    if (!testPurview("editselfmedia")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    $state = $arcrank;
    $each = explode(",", $id);
    $error = array();

    $where = getCityFilter('`cityid`');

    if ($adminCity) {
        $where .= getWrongCityFilter('`cityid`', $adminCity);
    }

    $type = $_POST['type'];

    foreach ($each as $val) {

        $field = "";
        $userid = 0;
        $sql = $dsql->SetQuery("SELECT `id`, `state`, `editstate`, `editlog`, `userid` FROM `#@__article_selfmedia` WHERE `id` = $val".$where);
        $res = $dsql->dsqlOper($sql, "results");
        if($res){
            $state_  = $res[0]['state'];
            $editstate_  = $res[0]['editstate'];
            $userid  = $res[0]['userid'];
            $editlog = $res[0]['editlog'];
            $editlog = $editlog ? unserialize($editlog) : array();
            if($type == "join"){
                $field = "`state` = $state";
            }else{
                // 只有用户修改了资料才可以更新资料状态
                if($res[0]['editstate'] != 1){
                    // 申请未处理时
                    if($editlog && $editlog['state'] == 0){
                        $field = "`editstate` = $state";
                        // 审核通过
                        if($state == 1){
                            $e_time  = $editlog['time'];
                            $e_data  = $editlog['data'];
                            foreach ($e_data as $k => $v) {
                                $field .= ", `{$k}` = '{$v}'";
                            }
                            $editlog['data'] = array();
                            $editlog_ = serialize($editlog);

                        // 拒绝
                        }else{
                            $editlog['state'] = $state;
                            $editlog['update'] = time();
                            $editlog_ = serialize($editlog);
                        }
                        $field .= ", `editlog` = '{$editlog_}'";
                    }
                }
            }
        }
        if($field == ""){
            $err[] = $val;
        }else{
            $sql = $dsql->SetQuery("UPDATE `#@__article_selfmedia` SET {$field} WHERE `id` = $val");
            $res = $dsql->dsqlOper($sql, "update");
            if($res == "ok"){
                $param = array("service" => "member", "type" => "user", "template" => "config-selfmedia");

                //自定义配置
        		$config = array(
        			"username" => $username,
        			"title" => $title,
        			"date" => date("Y-m-d H:i:s", $pubdate),
        			"fields" => array(
        				'keyword1' => '信息标题',
        				'keyword2' => '发布时间',
        				'keyword3' => '进展状态'
        			)
        		);

                if($type == "join"){
                    // 状态改变
                    if($state_ != $state){
                        updateMemberNotice($userid, "新闻-入驻自媒体审核结果", $param, array("res" => ($state == 0 ? '进入待审核状态' : ($state == 1 ? '审核通过' : '审核失败'))));
                        checkMediaCache($id, $type, $userid, $state);
                    }
                    $sql = $dsql->SetQuery("UPDATE `#@__articlelist_all` SET `media_state` = $state WHERE `admin` = $userid AND `media_state` != $state");
                    $dsql->dsqlOper($sql, "update");
                }else{
                    if($editstate_ != $state){
                        updateMemberNotice($userid, "新闻-入驻自媒体审核结果", $param, array("res" => ($state == 0 ? '进入待审核状态' : ($state == 1 ? '审核通过' : '审核失败'))));
                        // checkMediaCache($id, $type, $userid, $state);
                    }
                }


            }else{
                $err[] = $val;
            }
        }
    }

    if (!empty($error)) {
        echo '{"state": 200, "info": ' . json_encode($error) . '}';
    } else {
        adminLog("更新" . $dowtitle . "信息状态", $id . "=>" . $state);
        echo '{"state": 100, "info": ' . json_encode("修改成功！") . '}';
    }


//删除自媒体
} else if ($action == "delSelfmedia") {
    if (!testPurview("delselfmedia")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    if ($id != "") {

        $each = explode(",", $id);
        $error = array();
        $success = array();
        $title = array();
        foreach ($each as $val) {

            $archives = $dsql->SetQuery("SELECT * FROM `#@__article_selfmedia` WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "results");
            $detail = $results[0];

            array_push($title, $results[0]['ac_name']);

            //删除缩略图
            delPicFile($results[0]['ac_photo'], "delThumb", "article");
            delPicFile($results[0]['mb_license'], "delThumb", "article");
            delPicFile($results[0]['op_idcardfront'], "delThumb", "article");
            delPicFile($results[0]['org_major_license'], "delThumb", "article");
            if($results[0]['op_authorize']){
                $prove = explode(",", $results[0]['prove']);
                foreach ($prove as $key => $value) {
                    $info = explode("|", $value);
                    delPicFile($info[0], "delAtlas", "article");
                }
            }
            if($results[0]['prove']){
                $prove = explode(",", $results[0]['prove']);
                foreach ($prove as $key => $value) {
                    $info = explode("|", $value);
                    delPicFile($info[0], "delAtlas", "article");
                }
            }

            //删除表
            $archives = $dsql->SetQuery("DELETE FROM `#@__article_selfmedia` WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "update");
            if ($results != "ok") {
                $error[] = $val;

                checkMediaCache($val, "del", $detail['userid']);
            }else{
                $success[] = $val;
            }
        }
        if (!empty($error)) {
            echo '{"state": 200, "info": ' . json_encode($error) . ', "success": ' . join(",", $success) .'}';
        } else {

            adminLog("删除自媒体", join(", ", $title));
            echo '{"state": 100, "info": ' . json_encode("删除成功！") . '}';
        }
        die;
    }
    die;

} else if ($action == "getArticleType"){
    $mold = (int)$mold;
    echo json_encode($dsql->getTypeList(0, "articletype", true, 1, 100, " AND `mold`=".$mold));
    die;

// 获取没有视频时长和封面的信息
} else if ($action == "checkVideotime_face"){
    $pageSize = (int)$pageSize ? (int)$pageSize: 1;
    $sql = $dsql->SetQuery(
        "SELECT `id`, `videotype`, `videourl`, `videotime`,  `litpic` FROM `#@__articlelist_all`
        WHERE
        (`mold` = 2 || `mold` = 3)
        AND (`videotime` = 0 || `litpic` = '')
        AND ( `videotype` = 0 && `videourl` != '')
        AND (`del` = 0)
        ORDER BY `id` DESC
        LIMIT $pageSize"
    );
    $res = $dsql->dsqlOper($sql, "results");
    echo json_encode($res);
    die;

    return $res;

// 更新视频时长
} else if ($action == "updateVideotime_face"){
    $id = (int)$id;
    $type = $_POST['type'];
    $videotime = (int)$videotime;
    $litpic = $litpic;
    if($id && $type){
        if($type == 'time'){
            if(empty($videotime)) return;
            $sql = $dsql->SetQuery("UPDATE `#@__articlelist_all` SET `videotime` = '$videotime' WHERE `id` = $id AND `videotime` = ''");
        }
        if($type == 'face'){
            if(empty($litpic)) return;
            $sql = $dsql->SetQuery("SELECT `litpic` FROM `#@__articlelist_all` WHERE `id` = $id");
            $res = $dsql->dsqlOper($sql, "results");
            if($res && $res[0]['litpic']){
                delPicFile($res[0]['litpic'], "delThumb", "article");
            }
            $sql = $dsql->SetQuery("UPDATE `#@__articlelist_all` SET `litpic` = '$litpic' WHERE `id` = $id");
        }
        $res = $dsql->dsqlOper($sql, "update");
        if ($res == "ok") {
            echo '{"state": 100, "info": ' . json_encode("更新成功") . '}';
        } else {
            echo '{"state": 200, "info": ' . json_encode("更新失败") . '}';
        }
    }
    die;

//模糊匹配会员
}else if($action == "checkUser"){

  $key = $_POST['key'];
  if(!empty($key)){

    $where .= " AND (m.`mtype` = 1 || m.`mtype` = 2)";
    $userSql = $dsql->SetQuery("SELECT m.`id`, m.`username`, m.`company`, m.`nickname`, s.`ac_name` FROM `#@__member` m LEFT JOIN `#@__article_selfmedia` s ON s.`userid` = m.`id` WHERE (m.`username` like '%$key%' OR m.`company` like '%$key%' OR m.`nickname` like '%$key%' OR s.`ac_name` LIKE '%$key%')".$where." LIMIT 0, 10");
    // echo $userSql;die;
    $userResult = $dsql->dsqlOper($userSql, "results");
    if($userResult){
      echo json_encode($userResult);
    }
  }
  die;
}else if($action == "checkTitle"){
    $title = $_POST['title'];
    $id = (int)$_POST['id'];
    if($title){
        $where = $id ? " AND `id` <> $id" : "";
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__articlelist_all` WHERE `title` = '$title' AND `del` = 0".$where);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            echo $ret[0]['id'];
        }else{
            echo 0;
        }
    }
    die;
}else if($action == 'getMediaField'){
    $type = (int)$_POST['type'];
    echo json_encode($dsql->getTypeList(0, "article_selfmedia_field", true, 1, 100));
    die;
// 获取专题分类
}else if($action == 'getZhuantiType'){
    $type = (int)$_POST['type'];
    echo json_encode($dsql->getTypeList($type, "article_zhuanti", true, 1, 100));
    die;

//更新专题分类
} else if ($action == "typeAjaxZhuanti") {
    if (!testPurview("zhuanti")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    $data = str_replace("\\", '', $_POST['data']);
    if ($data != "") {
        $json = json_decode($data);

        $json = objtoarr($json);
        $json = typeAjax($json, 0, $dopost);

        echo $json;
    }
}else if($action == "checkUeditorVideo_face"){
    $where = "";

    $c = new FileCache();
    $lattime = (int)$c->get('checkUeVideo_lasttime');
    if($lattime){
        $where = " AND `pubdate` > $lattime";
    }
    $where .= " AND `path` regexp '/article/editor/video/(.*).mp4' ORDER BY `id` LIMIT 10";
    $sql = $dsql->SetQuery("SELECT `id`, `filename`, `path`, `pubdate` FROM `#@__attachment` WHERE 1 = 1".$where);
    $res = $dsql->dsqlOper($sql, "results");
    $list = array();
    if($res){
        $k = 0;
        foreach ($res as $key => $value) {
            if(strstr($value['filename'], "is_createface_")) continue;
            $list[$k]['src'] = getFilePath($value['path']);
            $list[$k]['path'] = $value['path'];
            $name = 'is_createface_'.$value['filename'];
            $sql = $dsql->SetQuery("UPDATE `#@__attachment` SET `filename` = '$name' WHERE `id` = ".$value['id']);
            $dsql->dsqlOper($sql, "update");
            $k++;
        }
        $c->set('checkUeVideo_lasttime', $res[count($res)-1]['pubdate']);
    }else{
        $c->set('checkUeVideo_lasttime', time());
    }
    echo json_encode($list);
    die;

} else {
    echo '{"state": 200, "info": ' . json_encode("操作失败，参数错误！") . '}';
}


//会员消息通知
function memberNotice($id, $arcrank)
{
    global $dsql;
    global $userLogin;
    global $handler;
    global $dopost;
    $handler = true;

    //查询信息之前的状态
    $sql = $dsql->SetQuery("SELECT `title`, `arcrank`, `admin`, `pubdate` FROM `#@__articlelist_all` WHERE `id` = $id");
    $ret = $dsql->dsqlOper($sql, "results");
    if ($ret) {

        $title = $ret[0]['title'];
        $arcrank_ = $ret[0]['arcrank'];
        $admin = $ret[0]['admin'];
        $pubdate = $ret[0]['pubdate'];

        //会员消息通知
        if ($arcrank != $arcrank_) {

            $state = "";
            $status = "";

            //等待审核
            if ($arcrank == 0) {
                $state = 0;
                $status = "进入等待审核状态。";

                //已审核
            } elseif ($arcrank == 1) {
                $state = 1;
                $status = "已经通过审核。";

                //审核失败
            } elseif ($arcrank == 2) {
                $state = 2;
                $status = "审核失败。";
            }

            $param = array(
                "service" => "member",
                "type" => "user",
                "template" => "manage",
                "action" => "article"
            );

            //会员信息
            if ($admin) {
                $uinfo = $userLogin->getMemberInfo($admin);
                if ($uinfo && is_array($uinfo) && $uinfo['userType'] == 2) {
                    $param = array(
                        "service" => "member",
                        "template" => "manage",
                        "action" => "article"
                    );
                } else {
                    return;
                }
            }

            $param['param'] = "state=" . $state;

            //获取会员名
            $username = "";
            $sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $admin");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $username = $ret[0]['username'];
            }

            //自定义配置
			$config = array(
				"username" => $username,
				"title" => $title,
				"status" => $status,
				"date" => date("Y-m-d H:i:s", $pubdate),
				"fields" => array(
					'keyword1' => '信息标题',
					'keyword2' => '发布时间',
					'keyword3' => '进展状态'
				)
			);

            updateMemberNotice($admin, "会员-发布信息审核通知", $param, $config);

        }

    }
}

// 检查缓存
function checkArticleCache($id){
    checkCache("article_list", $id);
    clearCache("article_detail", $id);
    updateCache("article_list", 300);
}
function checkMediaCache($id, $type = "", $userid = 0, $state = 0){
    checkCache("article_media_list", $id);
    clearCache("article_media_detail", $id);
    // 删除或者取消审核时
    if($type == "del" || ($type == "join" && $state != 1) ){
        global $dsql;
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__articlelist_all` WHERE `admin` = $userid");
        $ids = $dsql->dsqlOper($sql, "results");
        if($ids){
            checkArticleCache(array_column($ids, "id"));
        }
    }
}
function clearArticleTypeCache(){
    for($i = 1; $i < 200; $i++){
        clearCache("articletype_par", $i);
    }
}
