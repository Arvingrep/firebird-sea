<?php
/**
 * 管理投票记录
 *
 * @version        $Id: voteRecord.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Vote
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */


$action = "vote";
$actioncap = "Vote";
$about = "Record";
$actiontxt = "投票记录";

define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview($actioncap_);
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/".$action;
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = $action.$about.".html";

if($dopost == "getList"){

    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    $where = "";

    $where2 = getCityFilter('`cityid`');

    if ($adminCity){
        $where2 .= getWrongCityFilter('`cityid`', $adminCity);
    }

    if(!empty($sKeyword)){
        // 选手
        if($sType == 1) {
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."_user` WHERE `name` LIKE '%".$sKeyword."%'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $ids = array();
                foreach ($ret as $key => $value) {
                    array_push($ids, $value['id']);
                }
                $where .= " AND `uid` IN(".join(",",$ids).")";
            }else{
                $where .= " AND 1 = 2";
            }
        }
        // 活动
        elseif($sType == 2) {
            $where2 .= " AND `title` like '%$sKeyword%'";
        }
        // IP
        elseif($sType == 3) {
            $where .= " AND `ip` LIKE '%$sKeyword%'";
        }
        // 联系人
        elseif($sType == 4) {
            $where .= " AND `mname` LIKE '%$sKeyword%'";
        }
        // 联系电话
        elseif($sType == 5) {
            $where .= " AND `mtel` LIKE '%$sKeyword%'";
        }

    }

    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."_list` WHERE 1=1".$where2);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $ids = array();
        foreach ($ret as $key => $value) {
            array_push($ids, $value['id']);
        }
        $where .= " AND `tid` IN(".join(",",$ids).")";
    }else{
        echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';
        die;
    }

    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."_record` WHERE 1 = 1");

    //总条数
    $totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount/$pagestep);

    $where .= " order by `id` desc";

    $atpage = $pagestep*($page-1);
    $where .= " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT `id`, `tid`, `uid`, `mid`, `mname`, `mtel`, `ip`, `ipaddr`, `pubdate` FROM `#@__".$action."_record` WHERE 1 = 1".$where);
    // echo $archives;die;
    $results = $dsql->dsqlOper($archives, "results");
    if(count($results) > 0){
        $list = array();
        foreach ($results as $key=>$value) {
            $list[$key]["id"]       = $value["id"];
            $list[$key]["tid"]      = $value["tid"];
            $list[$key]["uid"]      = $value["uid"];
            $list[$key]["mid"]      = $value["mid"];
            $list[$key]["mname"]    = $value["mname"];
            $list[$key]["mtel"]     = $value["mtel"];
            $list[$key]["ip"]       = $value["ip"];
            $list[$key]["ipaddr"]   = $value["ipaddr"];
            $list[$key]["pubdate"]  = $value["pubdate"];
            $list[$key]["pubdatef"] = date("Y-m-d H:i:s",$value["pubdate"]);

            // 查询对应会员信息
            /*$member = "";
            if($value['mid'] > 0){
                $sql = $dsql->SetQuery("SELECT `mtype`,`username` FROM `#@__member` WHERE `id` = ".$value['mid']);
                $ret = $dsql->dsqlOper($archives, "results");
                if($ret[0]['mtype']){
                    $member = $ret[0]['username'];
                }
            }
            $list[$key]["member"] = $member;*/


            // 查询对应选手信息
            $user = "";
            $sql = $dsql->SetQuery("SELECT `name` FROM `#@__".$action."_user` WHERE `id` = ".$value['uid']);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $user = $ret[0]['name'];
            }
            $list[$key]["user"] = $user;

            // 选手链接
            $param = array(
                "service"     => $action,
                "template"    => "user",
                "id"          => $value['uid']
            );
            $list[$key]['uUrl'] = getUrlPath($param);

            // 查询对应活动信息
            $title = "";
            if($value['tid']){
                $sql = $dsql->SetQuery("SELECT `id`,`title` FROM `#@__".$action."_list` WHERE `id` = ".$value['tid']);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $title = $ret[0]['title'];
                }
            }
            $list[$key]['title'] = $title;

        }

        if(count($list) > 0){
            echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "infoList": '.json_encode($list).'}';
        }else{
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalNoshow": '.$totalNoshow.'}}';
        }

    }else{
        echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
    }
    die;

//删除
}elseif($dopost == "del"){
    if(!testPurview("del".$actioncap_)){
        die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    };
    if($id != ""){
        $each = explode(",", $id);
        $error = array();
        $title = array();
        foreach($each as $val){

            //删除主表
            $archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_record` WHERE `id` = ".$val);
            $results = $dsql->dsqlOper($archives, "update");
            if($results != "ok"){
                $error[] = $val;
            }
        }
        if(!empty($error)){
            echo '{"state": 200, "info": '.json_encode($error).'}';
        }else{
            adminLog("删除".$actiontxt."信息", join(", ", $title));
            echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
        }
        die;
    }
    die;

}
//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
//验证模板文件
if(file_exists($tpl."/".$templates)){

    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
        'admin/'.$action.'/'.$action.'Record.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('action', $action);
    $huoniaoTag->assign('actiontxt', $actiontxt);

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/".$action;  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
