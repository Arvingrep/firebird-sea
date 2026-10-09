<?php
/**
 * 提现记录
 *
 * @version        $Id: commissioncount.php 2015-11-11 上午09:37:12 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
// checkPurview("adminList");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "fzwithdraw.html";

$action = "member_withdraw";

if($dopost == "getList"){
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    $where = "";

    //关键词
    if(!empty($sKeyword)){

        $where1 = array();
        $where1[] = "`bank` like '%$sKeyword%' OR `cardnum` like '%$sKeyword%' OR `cardname` like '%$sKeyword%'";

        $userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `username` like '%$sKeyword%'");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if($userResult){
            $userid = array();
            foreach($userResult as $key => $user){
                array_push($userid, $user['id']);
            }
            if(!empty($userid)){
                $where1[] = "`uid` in (".join(",", $userid).")";
            }
        }

        $where .= " AND (".join(" OR ", $where1).")";

    }

    //类型
    if($type != ""){

        //银行卡
        if($type == 1){
            $where .= " AND `bank` != 'alipay'";

        //支付宝
        }elseif($type == 2){
            $where .= " AND `bank` = 'alipay'";

        }
    }

    if($start != ""){
        $where .= " AND `tdate` >= ". GetMkTime($start." 00:00:00");
    }

    if($end != ""){
        $where .= " AND `tdate` <= ". GetMkTime($end." 23:59:59");
    }
    $cityuser = $userLogin->getAdminIds();
    if(!$cityuser){
        $cityuser = $userLogin->getUserID();
    }
    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."` WHERE uid in ($cityuser)".$where);
    //总条数
    $totalCount = $dsql->dsqlOper($archives, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount/$pagestep);
    //审核中
    $state0 = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");
    //成功
    $state1 = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");
    //失败
    $state2 = $dsql->dsqlOper($archives." AND `state` = 2", "totalCount");

    if($state != ""){
        $where .= " AND `state` = " . $state;

        if($state == 0){
            $totalPage = ceil($state0/$pagestep);
        }elseif($state == 1){
            $totalPage = ceil($state1/$pagestep);
        }elseif($state == 2){
            $totalPage = ceil($state2/$pagestep);
        }
    }

    $where .= " order by `id` desc";
    $totalPrice = 0;

    //计算总价
    $sql = $dsql->SetQuery("SELECT SUM(`amount`) as price FROM `#@__".$action."` WHERE uid in ($cityuser)".$where);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $totalPrice = (float)$ret[0]['price'];
    }

    $totalPrice = sprintf("%.2f", $totalPrice);


    $atpage = $pagestep*($page-1);
    $where .= " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT `id`, `uid`, `bank`, `cardnum`, `cardname`, `amount`, `tdate`, `state` ,`note` FROM `#@__".$action."` WHERE uid in ($cityuser)".$where);
    $results = $dsql->dsqlOper($archives, "results");

    $list = array();

    if(count($results) > 0){
        foreach ($results as $key=>$value) {
            $list[$key]["id"] = $value["id"];
            $list[$key]["uid"] = $value["uid"];
            $list[$key]["bank"] = $value["bank"];

            //用户名
            $userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $value["uid"]);
            $username = $dsql->dsqlOper($userSql, "results");
            if(count($username) > 0){
                $list[$key]["username"] = $username[0]['username'];
            }else{
                $list[$key]["username"] = "未知";
            }

            $list[$key]["bank"] = $value["bank"];
            $list[$key]["cardnum"] = $value["cardnum"];
            $list[$key]["cardname"] = $value["cardname"];
            $list[$key]["amount"] = $value["amount"];
            $list[$key]["tdate"] = date('Y-m-d H:i:s', $value["tdate"]);
            $list[$key]["state"] = $value["state"];
            $list[$key]["note"] = $value["note"];

        }
        if(count($list) > 0){
            echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.'}, "totalPrice": '.$totalPrice.', "list": '.json_encode($list).'}';
        }else{
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.'}, "totalPrice": '.$totalPrice.'}';
        }

    }else{
        echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.'}, "totalPrice": '.$totalPrice.'}';
    }
    die;

//删除
}elseif($dopost == "del"){
    if($id == "") die;
    $each = explode(",", $id);
    $error = array();
    foreach($each as $val){

        $sql = $dsql->SetQuery("SELECT `state` FROM `#@__".$action."` WHERE `id` = ".$val);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){

            if($ret[0]['state'] == 0){
                $error[] = $val;
            }else{
                $archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$val);
                $results = $dsql->dsqlOper($archives, "update");
                if($results != "ok"){
                    $error[] = $val;
                }
            }
        }else{
            $error[] = $val;
        }
    }
    if(!empty($error)){
        echo '{"state": 200, "info": '.json_encode($error).'}';
    }else{
        adminLog("删除提现记录", $id);
        echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
    }
    die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/bootstrap-datetimepicker.min.js',
        'admin/member/catrecord.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('notice', $notice);
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}

