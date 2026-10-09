<?php
/**
 * 打赏礼物记录
 *
 * @version        $Id: moneyLogs.php 2022-03-29 下午 13:29:12 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2022, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("rewardLogs");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "rewardLogs.html";

$action = "member_reward";

$leimuallarr = array(
    'article'           =>'信息资讯',
    'live'              =>'视频直播',
    'circle'            =>'圈子动态',
    'tieba'             =>'贴吧社区'
//    'chat'              =>'在线聊天',
//    'dating'            =>'互动交友'
);

$typeallarr = array(
    '1'       =>   '礼物',
    '2'       =>   '打赏'
);


if($dopost == "getList"){
    // 页面大小 $pageSize
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    // 当前页数 $page
    $page     = $page == "" ? 1 : $page;

    // 条件判断
    $wherekey = $wherecity = $wheretype = $wheretime = $whrersoure =  '';

    // 收入类型
    if($type == 1){
        $wheretype = " AND r.`gift_id` > 0 ";
    }
    elseif($type == 2){
        $wheretype = " AND r.`gift_id` = 0 ";
    }
    // 错误
    if( $source !='live' ){
        if($source != "" && $type==1){
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.'0'.', "totalCount": '.'0'.', "totalMoney": '.'0'.'}}'; die;
        }
    }
    // 条件指定模块
    if($source!="" and $source!='live'){
        $wheresoure  = " AND `module` = '".$source."'";
    }
    // 排除模块
    $wheresoure .= " AND `module`!='chat' AND `module`!='dating'";

    //查询资讯、圈子等打赏（非直播）
    $membersql = "(SELECT '' hid,r.`uid` reward_userid,`amount`,'' settle ,`date`,''num,''gift_id, `module`,r.`aid`,'member' rewardtype, `touid` touid, r.`cityid` cityid,a.`typename` cityname, rm.`username` rname, tm.`username` tname,rm.`nickname` rnick,tm.`nickname` tnick FROM `#@__member_reward` r LEFT JOIN `#@__site_area` a ON r.`cityid`=a.`id` LEFT JOIN `#@__member` rm ON r.`uid`=rm.`id` LEFT JOIN `#@__member` tm ON `touid`= tm.`id` WHERE r.`state` = 1 ".$wheresoure.")";

    global $installModuleArr;
    $livesql = $hongbaosql = '';
    if(in_array('live', $installModuleArr)){
        //查询直播打赏
        $livesql   = "UNION ALL  (SELECT r.`id` hid, r.`reward_userid`, p.`amount`, p.`settle`, r.`date`, r.`num`, r.`gift_id`,''module, r.`live_id` aid, 'live' rewardtype, l.`user` touid, tm.`cityid`,a.`typename` cityname,  rm.`username` rname, tm.`username` tname,rm.`nickname` rnick,tm.`nickname` tnick FROM `#@__livelist` l LEFT JOIN `#@__live_reward` r  ON l.`id` = r.`live_id` LEFT JOIN `#@__live_payorder` p
        ON p.`live_id` = r.`live_id` LEFT JOIN `#@__member` tm ON tm.`id` = l.`user` LEFT JOIN `#@__site_area` a ON tm.`cityid`=a.`id` LEFT JOIN `#@__member` rm ON r.`reward_userid`=rm.`id` WHERE p.`status` = 1 AND r.`payid` = p.`order_id` ".$wheretype.")";
        //查询直播红包（礼物）
        $hongbaosql= " UNION ALL (SELECT '' hid,hb.`user_id` reward_userid,`recv_money` amount,'' settle ,l.`date`, ''num,''gift_id, '' module,hb.`live_id` aid ,'hongbao' rewardtype, `recv_user` touid, tm.`cityid`, a.`typename` cityname,  rm.`username` rname, tm.`username` tname,rm.`nickname` rnick,tm.`nickname` tnick FROM `#@__live_hrecv_list` l LEFT JOIN `#@__live_hongbao` hb ON l.`hid` =  hb.`id` LEFT JOIN `#@__member` tm ON tm.`id` = l.`recv_user` LEFT JOIN `#@__site_area` a ON tm.`cityid`=a.`id` LEFT JOIN `#@__member` rm ON hb.`user_id`= rm.`id`)";
    }

    //全部sql
    $allsql = $dsql->SetQuery("SELECT * FROM (".$membersql.$livesql.$hongbaosql.") as alls");

    // 直播仅查询后2个sql，礼物仅查询最后一个sql
    if($source == 'live' or $type==1){
        if($type==1){ // 仅查询礼物
            $allsql = $dsql->SetQuery("SELECT * FROM ".$livesql." as alls");
        }
        else{
            // 查询直播全部
            $allsql = $dsql->SetQuery("SELECT * FROM (".$livesql." UNION ALL ".$hongbaosql.")as alls");
        }
        // 非直播打赏，仅查询第一个sql
    }else if($source!="" and $source!='live'){
        $allsql = $dsql->SetQuery("select * from(".$membersql.") as alls");
    }
    $allsql .= " WHERE 1 = 1";

    //城市管理员，只能管理管辖城市的会员
    if($userType == 3){
        $wherecity = " AND `cityid` in ('$adminCityIds')";
    }
    //指定城市分站
    if($cityid!=""){
        $cityid = (int)$cityid;
        $wherecity = " AND `cityid` = $cityid";
    }
    $allsql .= $wherecity;

    // 搜索关键字
    if($sKeyword!=""){
        // 搜索aid
        if(is_numeric($sKeyword)){
            $sKeyword = (int)$sKeyword;
            $wherekey = " AND aid = $sKeyword";
        }else{
            // 查询username
            $sKeyword = trim($sKeyword);
            $like_name = "%".$sKeyword."%";
            $wherekey = " AND (rname like '$like_name' or tname like '$like_name' or rnick like '$like_name' or tnick like '$like_name')";
        }
    }
    $allsql .= $wherekey;

    // 指定时间条件
    if($start != ""){
        $wheretime .= " AND `date` >= ". GetMkTime($start." 00:00:00");
    }
    if($end != ""){
        $wheretime .= " AND `date` <= ". GetMkTime($end." 23:59:59");
    }
    $allsql .= $wheretime;

    //总条数
    $totalCount = $dsql->dsqlOper($allsql, "totalCount");
    //总页数
    $totalPage = ceil($totalCount/$pagestep);

    // 计算分页 limit，并查询数据
    $atpage = $pagestep*($page-1);
    $listSql = $allsql." ORDER BY `date` DESC LIMIT $atpage, $pagestep";
    $results = $dsql->dsqlOper($listSql, "results");

    //总金额
    $allsqlmm     = $dsql->SetQuery("SELECT SUM(`amount`) allamount FROM (".$allsql.") as alls");
    $totalMoney   = $dsql->dsqlOper($allsqlmm, "results");
    $totalMoney = sprintf('%.2f', $totalMoney[0]['allamount']);

    // 数据封装处理
    if($results){
        include HUONIAOROOT . '/include/config/settlement.inc.php';
        global $cfg_liveFee;
        foreach($results as $key => $val){

            // 1.封装城市名
            $cityname = $val["cityname"]=="" ? '未知' : $val["cityname"];
            $list[$key]["addrname"] = $cityname;

            // 2.收入来源
            if($val['rewardtype'] == 'member'){
                $modulename = '';
                switch ($val['module']) {
                    case 'article':
                        $modulename = getModuleTitle(array('name' => 'article'));  //信息资讯
                        break;
                    case 'circle':
                        $modulename = getModuleTitle(array('name' => 'circle'));  //圈子动态
                        break;
                    case 'tieba':
                        $modulename = getModuleTitle(array('name' => 'tieba'));  //贴吧社区
                        break;
                    case 'chat':
                        $modulename = '在线聊天';
                        break;
                    case 'dating':
                        $modulename = getModuleTitle(array('name' => 'dating'));  //互动交友
                        break;
                    default:
                        $modulename = '';
                        break;
                }
                $list[$key]['module']   =  $modulename;
            }
            else{
                $list[$key]['module']   = getModuleTitle(array('name' => 'live'));
            }

            // 3.1收入类型( 0打赏、 1礼物）
            if($val['rewardtype'] == 'member'){
                $list[$key]['type'] = 0;
            }
            elseif($val['rewardtype'] == 'live'){
                if($val['gift_id'] > 0){
                    $list[$key]['type'] = 1;
                }else{
                    $list[$key]['type'] = 0;
                }
            }else{
                $list[$key]['type'] = 0;
            }

            // 4.打赏人信息
            $list[$key]['reward_userid'] = (int)$val['reward_userid']; // 4.1打赏人id

            $nickname = $langData['siteConfig'][21][65];
            if(empty($list[$key]['reward_userid'])){ // 找不到打赏人
                $list[$key]['userinfo'] = array();
                $list[$key]['user'] = "未知";
            }
            elseif($val['reward_userid']!=-1){

                // 优先取昵称，否则取用户名，若均为空显示未知
                $nickname = $val['rnick']!=""?$val['rnick']:($val['rname']!=""?$val['rname']:"未知");
                $list[$key]['user'] = $nickname;
                if($nickname=="未知"){
                    $list[$key]['reward_userid'] = -1; // 返回-1
                }
            }else{// 匿名打赏或礼物
                $list[$key]['userinfo'] = array();
                $list[$key]['user'] = $langData['siteConfig'][21][65];
            }

            // 5.打赏渠道（title, url)
            $liveurl = $livetitle = '';

            if($val['rewardtype'] == 'member'){
                $title = $url = "";
                $dbtab = $val['module']."list";
                if($val['module'] == 'tieba'){
                    $dbtab = 'tieba_list';
                }elseif($val['module'] == 'circle'){
                    $dbtab = 'circle_dynamic_all';
                }

                if($val['module'] == 'circle'){
                    $sql = $dsql->SetQuery("SELECT `content` title FROM `#@__".$dbtab."` WHERE `id` = ".$val['aid']);
                }else{
                    $sql = $dsql->SetQuery("SELECT `title` FROM `#@__".$dbtab."` WHERE `id` = ".$val['aid']);
                }
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret && is_array($ret)){
                    $title = $ret[0]['title'];

                    $param = array(
                        "service"     => $val['module'],
                        "template"    => "detail",
                        "id"      => $val['aid']
                    );
                    $url = getUrlPath($param);
                }
                $list[$key]['title'] = "信息ID:" . $val['aid'] . " " . $title;
                $url = $val['module'] == 'circle' ? '' : $url;
                $list[$key]['url'] = $url;
            }
            else{
                $sql = $dsql->SetQuery("SELECT `title` FROM `#@__livelist` WHERE `id` = ".$val['aid']);
                $ret = $dsql->dsqlOper($sql, "results");

                if($ret && is_array($ret)){
                    $livetitle = $ret[0]['title'];
                    $param = array(
                        "service"     => 'live',
                        "template"    => "h_detail",
                        "id"      => $val['aid']
                    );
                    $liveurl = getUrlPath($param);
                }
                $list[$key]['url']     = $liveurl;
                // 生成直播类title
                if($val['rewardtype'] == 'live'){
                    //礼物信息
                    $sql_ = $dsql->SetQuery("SELECT `gift_name`, `gift_litpic` FROM `#@__live_gift` WHERE `id` = {$val['gift_id']}");
                    $ret_ = $dsql->dsqlOper($sql_, "results");
                    if($val['gift_id'] > 0){
                        $title = "直播:".$nickname ."在".$livetitle."中送了".$val['num']."个".$ret_[0]['gift_name'];
                        $list[$key]['title'] = $title;
                    }else{
                        $title = "直播:".$nickname ."在".$livetitle."打赏了".sprintf('%.2f',$val['amount'])."元";
                        $list[$key]['title'] = $title;
                    }
                }else{
                    if($livetitle==""){
                        $livetitle = "ID为".$val['aid'];
                    }
                    $title = "直播:".$livetitle.'中获得红包';
                    $list[$key]['title'] = $title;
                }
            }
            if($list[$key]['title']==""){
                $list[$key]['title'] = $val['aid'];
            }

            // 6.打赏或礼物金额

            if($val['rewardtype'] != 'member'){
                $list[$key]['amount']   = sprintf('%.2f',$val['amount']);
            }
            elseif($val['rewardtype'] == 'live'){
                if($val['settle'] > 0){
                    $list[$key]['amount'] = sprintf('%.2f', $val['settle']);
                    $list[$key]['fee'] = sprintf('%.2f', ($val['settle'] / $val['amount'] * 100)) . '%';
                }else{
                    $liveFee = 100 - $cfg_liveFee;
                    $list[$key]['amount'] = sprintf('%.2f', $val['amount'] * $liveFee / 100);
                    $list[$key]['fee'] = $liveFee . '%';
                }
            }else{
                $list[$key]['amount'] = sprintf('%.2f',$val['amount']);
            }

            // 7.受赏人
            $list[$key]['touid'] = $val['touid']; // 7.1受赏人id

            if(empty($val['touid'])){ // 受赏人id查询不到的情况
                $list[$key]['touinfo'] = -1;
                $list[$key]['touser'] = "未知";
            }else{
                // 优先取昵称，否则取用户名，若均为空显示未知
                $nickname = $val['tnick']!=""?$val['tnick']:($val['tname']!=""?$val['tname']:"未知");
                $list[$key]['touser'] = $nickname;
                if($nickname=="未知"){
                    $list[$key]['touid'] = -1; // 返回-1
                }
            }

            // 8.打赏或送礼时间
            $list[$key]['date'] = date("Y-m-d H:i:s", $val['date']);

            // 9.其他
            $list[$key]['aid'] = $val['aid'];
        }

        if(count($list) > 0){
            if($do != "export"){
                echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalMoney": '.$totalMoney.'},"list": '.json_encode($list).'}';
            }
        }else{
            if($do != "export"){
                echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalMoney": '.$totalMoney.'}}';
            }
        }
    }else{
        if($do != "export"){
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalMoney": '.$totalMoney.'}}';
        }
    }
    //导出数据
    $fileName = "打赏礼物记录数据.csv";
    if($do == "export"){

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '城市'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '收入来源'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '收入类型'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '打赏人'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '打赏人ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '打赏信息'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '打赏信息ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '打赏信息链接'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '受赏人'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '受赏人ID'));
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
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['module']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['type']==0?"打赏":"礼物"));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['user']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['reward_userid']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['title']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['aid']));
            //写入文件
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['url']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['amount']));

            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['touser']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['touid']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['date']));
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
        'ui/bootstrap-datetimepicker.min.js',
        'ui/chosen.jquery.min.js',
        'admin/member/rewardLogs.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
    $huoniaoTag->assign('source', $source);
    $huoniaoTag->assign('sKeyword', $sKeyword);
    $huoniaoTag->assign('type', $type);
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
