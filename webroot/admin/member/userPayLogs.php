<?php
/**
 * 用户账单记录
 *
 * @version        $Id: moneyLogs.php 2022-03-29 下午 13:29:12 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2022, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("userPayLogs");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "userPayLogs.html";

$leimuallarr = array(
    '0'       =>   '支出',
    '1'       =>   '收入'
);


$typeallarr = array('money'=>'余额支付');
$archives = $dsql->SetQuery("SELECT `id`, `pay_code`, `pay_name`, `pay_desc` FROM `#@__site_payment` WHERE `state` = 1 ORDER BY `weight`, `id` DESC");
$results = $dsql->dsqlOper($archives, "results");
if($results){
    foreach ($results as $key=>$val){
        $typeallarr[$val['pay_code']] = $val['pay_name'];
    }
}


if($dopost == "getList"){

    // 页面大小 $pageSize
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    // 当前页数 $page
    $page     = $page == "" ? 1 : $page;

    // 通用支付（排除余额、消费金）
    $log_sql = "select 'log' sq,l.`id`, l.`uid` uid,l.`ordertype` ordertype, l.`ordernum` ordernum, l.`paytype` paytype, l.`pubdate` pubdate, l.`amount` amount, l.`param_data` param, l.`body`, '0' type, m.`username` username,m.`nickname` nickname, a.`id` cityid, a.`typename` cityname from `#@__pay_log` l LEFT JOIN `#@__member` m ON l.`uid`=m.`id` LEFT JOIN `#@__site_area` a ON m.`cityid`=a.`id`  where l.`state`=1 AND l.`paytype`!='huoniao_bonus' AND l.`paytype`!='money' AND l.`paytype`!='point,money' AND l.`paytype`!='balance' AND l.`paytype`!='integral' AND l.`paytype`!='' AND l.`body` not like '%deposit%'";

// 余额
    $money_sql = "select 'money' sq,l.`id`,l.`userid` uid, l.`ordertype` ordertype, l.`ordernum` ordernum, 'money' paytype, l.`date` pubdate,l.`amount` amount, l.`info` param, 'body', l.`type` type, m.`username` username,m.`nickname` nickname, a.`id` cityid, a.`typename` cityname from `#@__member_money` l LEFT JOIN `#@__member` m ON l.`userid`=m.`id` LEFT JOIN `#@__site_area` a ON m.`cityid`=a.`id` where l.`showtype`=0";

// 消费金
    $bonus_sql = "select 'bonus' sq,l.`id`, l.`userid` uid, l.`ordertype` ordertype, l.`ordernum` ordernum, 'huoniao_bonus' paytype, l.`date` pubdate, l.`amount` amount, l.`info` param, 'body', l.`type` type, m.`username` username,m.`nickname` nickname, a.`id` cityid, a.`typename` cityname from `#@__member_bonus` l LEFT JOIN `#@__member` m ON l.`userid`=m.`id` LEFT JOIN `#@__site_area` a ON m.`cityid`=a.`id` ";

    // 全部sql
    $allSql = $dsql->SetQuery("SELECT * FROM (".$log_sql." UNION ALL ".$money_sql." UNION ALL ".$bonus_sql.") as alls ");
    // 支付方式
    $orther_flag = false;
    if($type=="money"){  // 余额
        $allSql = $dsql->SetQuery("SELECT * FROM (".$money_sql.") as alls ");
    }
    elseif($type=="huoniao_bonus"){  // 消费金
        $allSql = $dsql->SetQuery("SELECT * FROM (".$bonus_sql.") as alls ");
    }
    elseif($type!=""){  // 其他支付
        $orther_flag = true;
        $allSql = $dsql->SetQuery("SELECT * FROM (".$log_sql.") as alls ");
    }

    // 增加条件
    $twehre = " WHERE `amount`!=0";

    if($orther_flag){
        $twehre .= " AND `paytype`= '$type'";
    }
    // 收支类型
    if($source!=""){
        $twehre .= " AND `type`= $source";
    }
    //指定城市
    if($userType == 3){
        $twehre .= " AND `cityid` in ('$adminCityIds')";
    }
    if($cityid!=""){
        $cityid = (int)$cityid;
        $twehre .= " AND `cityid` = $cityid";
    }
    //指定开始时间和结束时间
    if($start != ""){
        $twehre .= " AND `pubdate` >= ". GetMkTime($start." 00:00:00");
    }
    if($end != ""){
        $twehre .= " AND `pubdate` <= ". GetMkTime($end." 23:59:59");
    }
    //搜索关键字
    $sKeyword = trim($sKeyword);
    if($sKeyword!=""){
        $length = strlen($sKeyword);
        // 查询订单号
        if($length==16){
            $twehre .= " AND (`ordernum`= '$sKeyword' OR `param` like '%$sKeyword%')";
        }elseif(is_numeric($sKeyword)){
            $twehre .= " AND `uid` = $sKeyword";
        }else{
            $twehre .= " AND `param` like '%$sKeyword%'";
        }
    }

    $allSql .= $twehre;
//    die($allSql);

    //总条数
    $totalCount = $dsql->dsqlOper($allSql, "totalCount", '', '', 0);
    //总页数
    $totalPage = ceil($totalCount/$pagestep);

    //总收入总支出
    $totalAdd = $totalLess = 0;
    //总收入金额
    if($source!="0"){  // 只计算支出时不执行
        $allsqlam     = $dsql->SetQuery("SELECT SUM(`amount`) allamount FROM (".$allSql.") as alls WHERE type=1");
        $totalAdd   = $dsql->dsqlOper($allsqlam, "results", "ASSOC", "", 0);
        $totalAdd = sprintf('%.2f', $totalAdd[0]['allamount']);
    }

    //总支出
    if($source!="1"){ // 只计算收入时不执行
        $allsqlsm     = $dsql->SetQuery("SELECT SUM(`amount`) allamount FROM (".$allSql.") as alls WHERE type=0");
        $totalLess   = $dsql->dsqlOper($allsqlsm, "results", "ASSOC", "", 0);
        $totalLess = sprintf('%.2f', $totalLess[0]['allamount']);
    }

    // 计算分页 limit，并查询数据
    $atpage = $pagestep*($page-1);
    $allSql .= " order by pubdate desc,id desc limit $atpage, $pagestep";

    $listSql = $dsql->SetQuery($allSql);
    $results = $dsql->dsqlOper($listSql, "results", "ASSOC", "", 0);
    $list = array();


    if($results){
        foreach ($results as $key => $val){
            // 调试
            $list[$key]['sq'] = $val['sq'];
            // 1.处理城市
            $list[$key]['addrname'] = $val['cityname'] ? $val['cityname'] :"未知";

            // 2.订单号
            $list[$key]['ordernum'] = $val['ordernum']?$val['ordernum']:"无";

            // 3.处理用户
            $list[$key]['userid']  = $val['uid'] ? $val['uid'] :"-1";

            $list[$key]['user'] = $val['nickname'] ? $val['nickname'] : ($val['username'] ? $val['username'] : "未知");

            $list[$key]['userid'] = $list[$key]['user']=="未知"? -1 : $list[$key]['userid']; // 没有名字的也返回未知

            // 4.处理title标题
            // 通用支付
            if($val['sq']=="log"){
                $param = $val['param'];
                $arr = unserialize($param);
                $subject = strip_tags($arr['subject']);

                    //如果取消到数据，用模块信息代替
                    if(!$subject){

                        //从body中提取
                        $body = $val['body'] ? unserialize($val['body']) : $val['body'];
                        if(is_array($body)){
                            $subject = $body['title'];
                        }else{

                            $moduleName = getModuleTitle(array('name' => $val['ordertype']));
                            if($moduleName){
                                $subject = $moduleName . '消费';
                            }else{
                                $subject = $val['ordernum'] ? $val['ordernum'] : $val['ordertype'];
                            }
                        }

                    }

                $list[$key]['title'] = $subject;
            }
            // 余额支付，消费金
            else{
                $list[$key]['title'] = $val['param'];
            }

            // 5.金额变化
            $list[$key]['type'] = $val['type'];
            $list[$key]['amount'] = $val['amount'];

            // 6.处理时间
            $list[$key]['date'] = date("Y-m-d H:i:s",$val['pubdate']);

            // 7.支付方式
            $list[$key]['paytype'] = $typeallarr[($val['paytype'] == 'balance' ? 'money' : $val['paytype'])];
            // 8.订单号
            $list[$key]['ordernum'] = $val['ordernum'];

        }
        if(count($list) > 0){
            if($do != "export"){
                echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'},"totalAdd": '.$totalAdd.',"totalLess":'.$totalLess.',"list": '.json_encode($list).'}';
            }
        }else{
            if($do != "export"){
                echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "totalAdd": '.$totalAdd.',"totalLess":'.$totalLess.'}';
            }
        }
    }else{
        if($do != "export"){
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "totalAdd": '.$totalAdd.',"totalLess":'.$totalLess.'}';
        }
    }
    //导出数据
    $fileName = "用户账单数据记录.csv";
    if($do == "export"){

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '城市'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '收支类型'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '支付方式'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '会员ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '会员信息'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '来源/用途'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '金额变化'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '时间'));


        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";
        $filePath = $folder.$fileName;
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach($list as $data){
            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['addrname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['type']==0?"支出":"收入"));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['paytype']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['ordernum']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['userid']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['user']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['title']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['type']==0?-   $data['amount']:$data['amount']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['pubdate']));
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

$huoniaoTag->assign('leimuallarr',$leimuallarr);
$huoniaoTag->assign("typeallarr", $typeallarr);

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
        'admin/member/userPayLogs.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}