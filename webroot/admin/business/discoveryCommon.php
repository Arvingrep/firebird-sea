<?php
/**
 * 管理文章评论
 *
 * @version        $Id: discoveryCommon.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Buisness
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/business";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "discoveryCommon.html";

$dopost = "business_discovery";



//获取评论详细信息
if ($action == "getArticleCommonDetail") {
    if ($id != "") {
        $archives = $dsql->SetQuery("SELECT `aid`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck` FROM `#@__" . $dopost . "common` WHERE `id` = " . $id);
        $results = $dsql->dsqlOper($archives, "results");

        if (count($results) > 0) {
            $sub = new SubTable('articlelist', '#@__articlelist');
            $break_table = $sub->getSubTableById($id);
            $archives = $dsql->SetQuery("SELECT `title` FROM `" . $break_table . "` WHERE `id` = " . $results[0]["aid"]);
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
    die;

//更新评论信息
} else if ($action == "updateCommonDetail") {

    if (!testPurview("editdiscoveryCommon")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

    $dtime = GetMkTime($commonTime);
    $ipAddr = getIpAddr($ip);

    if ($id == "") die('要修改的信息ID传递失败！');

    //会员通知
    $sql = $dsql->SetQuery("SELECT l.`title`, l.`uid` admin, l.`pubdate`, c.`aid`, c.`userid`, c.`ischeck`, c.`dtime`,c.`rid`,c.`pid` FROM `#@__" . $dopost . "common` c LEFT JOIN `#@__" . $dopost . "list` l ON l.`id` = c.`aid` WHERE c.`id` = $id");
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
                "service" => "business",
                "template" => "discovery-detail",
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

                // updateMemberNotice($userid, "会员-评论审核通过", $param, array("username" => $username, "title" => $title, "date" => date("Y-m-d H:i:s", $dtime)));

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
                $sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $admin");
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
    die;

//更新评论状态
} else if ($action == "updateCommonState") {

    if (!testPurview("editdiscoveryCommon")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

    $each = explode(",", $id);
    $error = array();
    if ($id != "") {
        foreach ($each as $val) {

            //会员通知
            $sql = $dsql->SetQuery("SELECT l.`title`, l.`uid` admin, l.`pubdate`, c.`aid`, c.`userid`, c.`ischeck`, c.`dtime`,c.`rid`,c.`pid` FROM `#@__" . $dopost . "common` c LEFT JOIN `#@__" . $dopost . "list` l ON l.`id` = c.`aid` WHERE c.`id` = $val");
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
    die;

//删除评论
} else if ($action == "delArticleCommon") {

    if (!testPurview("deldiscoveryCommon")) {
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

    if (!testPurview("discoveryCommon")) {
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

    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__" . $dopost . "list` WHERE 1=1".$where2);
    $results = $dsql->dsqlOper($archives, "results");
    if (count($results) > 0) {
        $list = array();
        foreach ($results as $key => $value) {
            $list[] = $value["id"];
        }
        $idList = join(",", $list);
        $where .= " AND `aid` in ($idList)";
    } else {
        echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';
        die;
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
        foreach ($results as $key => $value) {
            $list[$key]["id"] = $value["id"];
            $list[$key]["articleId"] = $value["aid"];

            $typeSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__" . $dopost . "list` WHERE `id` = " . $value["aid"]);
            $typename = $dsql->getTypeName($typeSql);
            $list[$key]["articleTitle"] = $typename[0]['title'];

            $param = array(
                "service" => "business",
                "template" => "discovery-detail",
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
    die;
}

checkPurview("discoveryCommon");

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/business/discoveryCommon.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    //css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

    $huoniaoTag->assign('action', 'business');

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/business";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
