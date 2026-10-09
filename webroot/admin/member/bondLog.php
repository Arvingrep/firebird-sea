<?php
/**
 * 保障金记录
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("bondLog");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "bondLog.html";

$leimuallarr = array(
    '1'       =>   '缴纳',
    '2'       =>   '提取'
);

if($dopost == "getList"){

    // 页面大小 $pageSize
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    // 当前页数 $page
    $page     = $page == "" ? 1 : $page;

    //搜索关键字
    $sKeyword = trim($sKeyword);
    if($sKeyword!=""){
        $where .= " and (1=2";
        if(is_numeric($sKeyword)){
            $where .= " or p.`uid` like '%$sKeyword%'";  // 用户ID
        }
        $where .= " or p.`ordernum` like  '%$sKeyword%'"; // 订单号
        $where .= " or m.`username` like  '%$sKeyword%'"; // 用户名
        $where .= " or m.`nickname` like  '%$sKeyword%'"; // 昵称
        $where .= ")";
    }
    // 城市ID
    if($userType == 3){
        $where .= " AND m.`cityid` in ('$adminCityIds')";
    }
    if($cityid!=""){
        $cityid = (int)$cityid;
        $where .= " AND m.`cityid` = $cityid";
    }
    // 开始时间和结束时间
    if($start != ""){
        $where .= " AND p.`date` >= ". GetMkTime($start." 00:00:00");
    }
    if($end != ""){
        $where .= " AND p.`date` <= ". GetMkTime($end." 23:59:59");
    }

    // 统计sql
    $countSql = $dsql->SetQuery("SELECT SUM(p.`amount`) amount, count(p.`id`) id FROM `#@__member_promotion` p LEFT JOIN `#@__member` m ON m.`id` = p.`uid` LEFT JOIN `#@__site_area` a ON m.`cityid`=a.`id` WHERE 1=1 ".$where);
    //缴纳
    $info1 = $dsql->getArr($countSql." and p.`type` = 1");
    // 提取
    $info2 = $dsql->getArr($countSql." and p.`type` = 0 AND p.`state` = 1");
    // 待审核
    $state0 = $dsql->getArr($countSql." and p.`state` = 0");
    // 已审核
    $state1 = $dsql->getArr($countSql." and p.`state` = 1");
    // 审核失败
    $state2 = $dsql->getArr($countSql." and p.`state` = 2");
    // 可提取
    global $cfg_promotion_limitVal;
    global $cfg_promotion_limitType;

    $limitType = '';
    if($cfg_promotion_limitType == 1){
        $limitType = 'day';
    }elseif($cfg_promotion_limitType == 2){
        $limitType = 'month';
    }elseif($cfg_promotion_limitType == 3){
        $limitType = 'year';
    }

    $year=strtotime("-".$cfg_promotion_limitVal." ".$limitType);

    //如果设置了提取限制，则计算时间段内的金额
    if($cfg_promotion_limitVal){
        $info3 = $dsql->getArr($countSql." and p.`type` = 1 and p.date<$year");   // info3的金额需要再处理一下，即info3 - info2的金额，为可提取金额
    }
    //否则直接使用已经缴纳的金额
    else{
        $info3 = $info1;
    }

    // 类型
    if ($type){
        //缴纳、提现
        if ($type == 1){
            $where .= " AND p.`type` =1";
        }elseif($type == 2){
            $where .= " AND p.`type` =0";
        }
    }

    // 状态
    if ($state != ''){
        if ($state == 0){
            $where .= " AND p.`state` = 0";
        }elseif($state == 1){
            $where .= " AND p.`state` = 1";
        }elseif($state == 2){
            $where .= " AND p.`state` = 2";
        }
    }

    // 默认排序
    $where .= " order by p.`date` desc";

    $archives = $dsql->SetQuery("SELECT m.`cityid`, a.`typename` 'addrname', p.`id`, p.`uid`, m.`nickname`, p.`amount`,p.`ordernum`,p.`date`,p.`title`,p.`note`,p.`type`,p.`state`,p.`reason` FROM `#@__member_promotion` p LEFT JOIN `#@__member` m ON p.`uid` = m.`id` LEFT JOIN `#@__site_area` a ON m.`cityid`=a.`id` where 1=1");
    $archives.= $where;

    //获取分页数据，并处理
    $res = $dsql->getPage($page,$pagestep,$archives);
    $list = & $res['list'];
    foreach ($list as $k=> & $v){
        $v['date'] = date("Y-m-d H:i:s",$v['date']);
    }

    $res['pageInfo']['state0'] = $state0['id'];
    $res['pageInfo']['state1'] = $state1['id'];
    $res['pageInfo']['state2'] = $state2['id'];

    // 存在数据
    if(count($list) > 0){
        if($do != "export"){
            $pageInfo = json_encode($res['pageInfo']);
            echo '{"state": 100, "info": '.json_encode("暂无相关信息").', "pageInfo": '.$pageInfo.', "info1": '.json_encode($info1).',"info2":'.json_encode($info2).',"info3":'.json_encode($info3).',"list":'.json_encode($list).'}';
        }
    }
    // 没有数据
    else{
        if($do != "export"){
            $pageInfo = json_encode($res['pageInfo']);
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": '.$pageInfo.', "info1": '.json_encode($info1).',"info2":'.json_encode($info2).',"info3":'.json_encode($info3).'}';
        }
    }

    //导出数据
    $fileName = "保障金记录.csv";
    if($do == "export"){

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '城市'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '类型'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '会员ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '会员'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '金额变化'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '原因'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '说明'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '状态'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '拒绝原因'));


        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";
        $filePath = $folder.$fileName;
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach($list as $data){
            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['addrname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['type']==1?"缴纳":"提取"));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['ordernum']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['uid']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['nickname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['type']==0?-   $data['amount']:$data['amount']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['date']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['title']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['note']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', ($data['type'] == 1 ? '审核通过' : ($data['state'] == 0 ? '待审核' : ($data['state'] == 1 ? '审核通过' : '拒绝审核')))));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['reason']));
            fputcsv($file, $arr);
        }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = $fileName");
        header("Accept-ranges:bytes");
        header("Accept-length:".filesize($filePath));
        readfile($filePath);
    }

    die;

}
//更新状态
elseif($dopost == 'updateState'){

    $type = (int)$type;
    $id   = (int)$id;
    $note = $note;

    //查询记录信息
    $sql = $dsql->SetQuery("SELECT * FROM `#@__member_promotion` WHERE `type` = 0 AND `id` = $id");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){

        $uid    = $ret[0]['uid'];
        $state  = $ret[0]['state'];
        $amount = $ret[0]['amount'];
        $ordernum = $ret[0]['ordernum'];

        if($state == 1 || $state == 2){
            die('{"state": 200, "info": "记录状态不可以操作！"}');
        }

        $time = GetMkTime(time());

        //审核通过
        if($type == 1){

            //增加会员余额
            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$amount', `promotion` = `promotion` - '$amount' WHERE `id` = '$uid'");
            $dsql->dsqlOper($archives, "update");

            //获取用户信息
            $user = $userLogin->getMemberInfo($userid);
            $usermoney = $user['money'];

            //保存操作日志
            $info = $langData['siteConfig'][21][110];  //提取保障金
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`title`,`ordernum`,`balance`) VALUES ('$uid', '1', '$amount', '$info', '$time','member','baozhangjin','$info','$ordernum','$usermoney')");
            $dsql->dsqlOper($archives, "update");

            //更新提取记录状态
            $sql = $dsql->SetQuery("UPDATE `#@__member_promotion` SET `state` = 1 WHERE `id` = $id");
            $dsql->dsqlOper($sql, "update");

            //跳转链接
            $param = array(
                "service"  => "member",
                "type"  => "user",
                "template" => "record"
            );
    
                //自定义配置
            $config = array(
                "username" => $user['nickname'],
                "amount" => $amount,
                "date" => date("Y-m-d H:i:s", $time),
                "fields" => array(
                    'keyword1' => '提取金额',
                    'keyword2' => '提取时间',
                    'keyword3' => '提取状态'
                )
            );

            updateMemberNotice($uid, "会员-提取保障金审核通过", $param, $config);


        }
        //审核失败
        else{

            //更新提取记录状态
            $sql = $dsql->SetQuery("UPDATE `#@__member_promotion` SET `state` = 2, `reason` = '$note' WHERE `id` = $id");
            $dsql->dsqlOper($sql, "update");

            //跳转链接
            $param = array(
                "service"  => "member",
                "template" => "promotion"
            );
    
                //自定义配置
            $config = array(
                "username" => $user['nickname'],
                "amount" => $amount,
                "date" => date("Y-m-d H:i:s", $time),
                "info" => $note,
                "fields" => array(
                    'keyword1' => '提取金额',
                    'keyword2' => '提取时间',
                    'keyword3' => '提取状态'
                )
            );

            updateMemberNotice($uid, "会员-提取保障金审核失败", $param, $config);

        }

        adminLog("更新提取保障金状态", $ordernum . '=>' . $state . '=>' . $note);

        die('{"state": 100, "info": "操作成功！"}');

    }else{
        die('{"state": 200, "info": "记录不存在！"}');
    }

}






// 加载模板
$huoniaoTag->assign('leimuallarr',$leimuallarr);

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
        'ui/bootstrap-datetimepicker.min.js',
        'ui/chosen.jquery.min.js',
        'admin/member/bondLog.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('cfg_promotion_note', $cfg_promotion_note);
    $huoniaoTag->assign('cfg_promotion_least', ($cfg_promotion_least ? (float)$cfg_promotion_least : ''));
    $huoniaoTag->assign('cfg_promotion_limitVal', ($cfg_promotion_limitVal ? (int)$cfg_promotion_limitVal : ''));
    $huoniaoTag->assign('cfg_promotion_limitType', (int)($cfg_promotion_limitType ? $cfg_promotion_limitType : 1));
    $huoniaoTag->assign('cfg_promotion_reason', $cfg_promotion_reason);

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());

	$huoniaoTag->assign('notice', $notice);
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}