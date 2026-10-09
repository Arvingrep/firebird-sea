<?php
/**
 * 图片模块JSON
 *
 * @version        $Id: imageJson.php 2017-1-18 下午16:48:10 $
 * @package        HuoNiao.Image
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
include_once(HUONIAOROOT."/api/handlers/live.class.php");
include_once(HUONIAOROOT."/api/live/alilive/alilive.class.php");
$live=new live();
$aliLive=new Alilive();
$dsql  = new dsql($dbo);

$dotitle = "直播";

//列表
if($action == "live"){

    $state = $_POST['state'];

    if(!testPurview("liveList")){
        die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    };

    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    $totalPage=0;
    $totalCount=0;
    $where=' AND `waitpay` = 0';

    if($sKeyword != ""){
        $where .= " AND `title` like '%$sKeyword%'";
    }
    if(!empty($sType)){
        $where .= " AND `typeid`='$sType'";
    }
    if($start != ""){
        $where .= " AND `ftime` >= ". GetMkTime($start);
    }

    if($end != ""){
        $where .= " AND `ftime` <= ". GetMkTime($end . " 23:59:59");
    }


    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__livelist` WHERE `waitpay` = 0".$where);
    //总条数
    $totalCount = $dsql->dsqlOper($archives, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount/$pagestep);

    //待审核
    $totalGray = $dsql->dsqlOper($dsql->SetQuery('SELECT `id` FROM `#@__livelist` WHERE `arcrank` = 0'.$where), "totalCount");
    //已审核
    $totalAudit = $dsql->dsqlOper($dsql->SetQuery('SELECT `id` FROM `#@__livelist` WHERE `arcrank` = 1'.$where), "totalCount");
    //拒绝审核
    $totalRefuse = $dsql->dsqlOper($dsql->SetQuery('SELECT `id` FROM `#@__livelist` WHERE `arcrank` = 2'.$where), "totalCount");

    //未推流
    $initCount = $dsql->dsqlOper($dsql->SetQuery('SELECT `id` FROM `#@__livelist` WHERE `state` = 0'.$where), "totalCount");
    //正在推流
    $nowCount = $dsql->dsqlOper($dsql->SetQuery('SELECT `id` FROM `#@__livelist` WHERE `state` = 1'.$where), "totalCount");
    //历史推流
    $hisCount = $dsql->dsqlOper($dsql->SetQuery('SELECT `id` FROM `#@__livelist` WHERE `state` = 2'.$where), "totalCount");
    //黑名单
    // $blackCount = $dsql->dsqlOper($dsql->SetQuery('SELECT `id` FROM `#@__livelist` WHERE `state` = 3'), "totalCount");

	if(!empty($state) && substr($state, 0, 1) != 'a'){
        $where .= " AND `state`='$state'";
		if($state == 0){
			$totalPage = ceil($initCount/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($nowCount/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($hisCount/$pagestep);
		}
    }elseif($state=='0'){
        $where .= " AND `state`='0'";
		$totalPage = ceil($initCount/$pagestep);
    }

	if(substr($state, 0, 1) == 'a'){
        $arcrank = substr($state, 1);
        $state = '';
    }
    if($arcrank == '0'){
        $where .= " AND `arcrank` = 0";
		$totalPage = ceil($totalGray/$pagestep);
    }elseif($arcrank == '1'){
        $where .= " AND `arcrank` = 1";
		$totalPage = ceil($totalAudit/$pagestep);
    }elseif($arcrank == '2'){
        $where .= " AND `arcrank` = 2";
		$totalPage = ceil($totalRefuse/$pagestep);
    }

    $where .= " order by `id` desc";

    $atpage = $pagestep*($page-1);
    $where .= " LIMIT $atpage, $pagestep";

    $archives = $dsql->SetQuery("SELECT `id`,`title`,`pushurl`,`state`,`streamname`,`ftime`,`arcrank`, `user` FROM `#@__livelist` WHERE 1=1".$where);
    $results = $dsql->dsqlOper($archives, "results");

    if(count($results) > 0){
        $list=array();
        foreach($results as $key=>$value){
            $param = array(
                "service"     => "live",
                "template"    => "detail",
                "id"          => $value['id']
            );
            if($value['state']==0){
                if($value['ftime']){
                    $value['PublishTime']=date('y-m-d H:i:s',$value['ftime']);
                }else{
                    $value['PublishTime']='未推流';

                }

                $value['url']='无';
            }else{
                $value['PublishTime']=date('y-m-d H:i:s',$value['ftime']);
                $value['url']        = getUrlPath($param);
            }

            $arcrank = "";
            switch ($value["arcrank"]) {
                case "0":
                    $arcrank = "等待审核";
                    break;
                case "1":
                    $arcrank = "审核通过";
                    break;
                case "2":
                    $arcrank = "审核拒绝";
                    break;
            }
            $value['arcrank'] = $arcrank;

			//会员信息
			$username = "";
			$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$value['user']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$username = $ret[0]['username'];
			}
			$value['username'] = $username;

            $list[$key]=$value;
        }
        if(count($list) > 0){
            echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "nowCount": '.$nowCount.', "initCount": '.$initCount.', "hisCount": '.$hisCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "articleList": '.json_encode($list).'}';
        }else{
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "nowCount": '.$nowCount.', "initCount": '.$initCount.', "hisCount": '.$hisCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
        }
    }else{
        echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "nowCount": '.$nowCount.', "initCount": '.$initCount.', "hisCount": '.$hisCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
    }

//加入黑名单
}else if($action == "addblack"){
    $archives = $dsql->SetQuery("SELECT * FROM `#@__liveaccount` where `state` = 1");
    $results  = $dsql->dsqlOper($archives, "results");
    $pulltype=$results[0]['pulltype'];
    $vhost=$results[0]['vhost'];
    $appName=$results[0]['appname'];

    //第三方
    if($pulltype){

        $archives = $dsql->SetQuery("UPDATE `#@__".$dopost."list` SET `state` ='3' WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "update");
        die('{"state": 100, "info": ' . json_encode( '成功加入黑名单') . '}');

    //系统
    }else{
        $apiParams = array(
            'Action'=>'ForbidLiveStream',
            'DomainName'=>$vhost,
            'AppName'=>$appName,
            'StreamName'=>$stream,
            'LiveStreamType'=>'publisher'
        );

        $dataresult=$aliLive->aliApi($apiParams,$credential="GET", $domain="live.aliyuncs.com");
        // if(isset( $dataresult['Message'])){
        //     die('{"state": 200, "info": ' . json_encode( $dataresult['Message']) . '}');
        // }else{
            $archives = $dsql->SetQuery("UPDATE `#@__".$dopost."list` SET `state` ='3' WHERE `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "update");
            die('{"state": 100, "info": ' . json_encode( '成功加入黑名单') . '}');
        // }
    }
}else if($action == "delblack"){
    $archives = $dsql->SetQuery("SELECT * FROM `#@__liveaccount` where `state` = 1");
    $results  = $dsql->dsqlOper($archives, "results");
    $vhost=$results[0]['vhost'];
    $appName=$results[0]['appname'];

    $apiParams = array(
        'Action'=>'ResumeLiveStream',
        'DomainName'=>$vhost,
        'AppName'=>$appName,
        'StreamName'=>$stream,
        'LiveStreamType'=>'publisher'
    );

    $dataresult=$aliLive->aliApi($apiParams,$credential="GET", $domain="live.aliyuncs.com");
    if(isset( $dataresult['Message'])){
        die('{"state": 200, "info": ' . json_encode( $dataresult['Message']) . '}');
    }else{
        $archives = $dsql->SetQuery("UPDATE `#@__".$dopost."list` SET `state` ='0' WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "update");
        die('{"state": 100, "info": ' . json_encode( '成功移除黑名单') . '}');
    }
}else if($action == "dellive"){
    $livesql = $dsql->SetQuery("SELECT * FROM `#@__livelist` where `id` = ".$id);
    $results = $dsql->dsqlOper($livesql, "results");
    if($results){
        if($results[0]['state']==0 || $results[0]['state']==3){
            $archives = $dsql->SetQuery("DELETE FROM `#@__livelist` WHERE `id`='$id'");
            $dsql->dsqlOper($archives, "update");
            dataAsync("live",$id);  // 删除直播
            die('{"state": 100, "info": ' . json_encode( '成功删除') . '}');
        }elseif($results[0]['state']==1){
            die( '{"state": 100, "info": '.json_encode('正在直播无法删除').'}');
        }elseif($results[0]['state']==2){
            $archives = $dsql->SetQuery("SELECT * FROM `#@__liveaccount` where `state` = 1");
            $liveresults  = $dsql->dsqlOper($archives, "results");
            $vhost=$liveresults[0]['vhost'];
            $appName=$liveresults[0]['appname'];

            $StreamName = $results[0]['streamname'];
            $apiParams = array(
                'Action'=>'DescribeLiveStreamRecordIndexFiles',
                'DomainName'=>$vhost,
                'AppName'=>$appName,
                'StreamName'=>$StreamName,
                'StartTime'=>gmdate("Y-m-d\T00:00:00\Z",strtotime("-1 day")),
                'EndTime'=>gmdate("Y-m-d\T00:00:00\Z",strtotime("+1 day")),
                'PageNum'=>1,
                'PageSize'=>10,
                'Order'=>'asc'
            );
            $dataresult=$aliLive->aliApi($apiParams,$credential="GET", $domain="live.aliyuncs.com");
            $file=$dataresult['RecordIndexInfoList']['RecordIndexInfo'][0]['OssObject'];
            if(isset( $dataresult['Message'])){
                // die('{"state": 200, "info": ' . json_encode( $dataresult['Message']) . '}');
            }else{
                include_once(HUONIAOINC . "/config/live.inc.php");
                $OSSConfig = array(
                    "bucketName" => "$custom_OSSBucket",
                    "endpoint" => "$custom_OSSUrl",
                    "accessKey" => "$custom_OSSKeyID",
                    "accessSecret" => "$custom_OSSKeySecret"
                 );
                 global $autoload;
                 $autoload=true;
                 include_once HUONIAOINC . '/class/aliyunOSS.class.php';
                 $aliyunOSS = new aliyunOSS($OSSConfig);
                 if($file){
                     $aliyunOSS->delete($file);
                     $ossError = $aliyunOSS->error();
                     if(empty($ossError)){
                        // $archives = $dsql->SetQuery("DELETE FROM `#@__livelist` WHERE `id`='$id'");
                        // $dsql->dsqlOper($archives, "update");
                        // die('{"state": 100, "info": ' . json_encode( '成功删除') . '}');
                     }else{
                        // echo '{"state": 200, "info": '.json_encode('删除失败').'}';
                     }
                 }else{
                    // $archives = $dsql->SetQuery("DELETE FROM `#@__livelist` WHERE `id`='$id'");
                    // $dsql->dsqlOper($archives, "update");
                    // die('{"state": 100, "info": ' . json_encode( '成功删除') . '}');
                 }

				 $archives = $dsql->SetQuery("DELETE FROM `#@__livelist` WHERE `id`='$id'");
				 $dsql->dsqlOper($archives, "update");
                dataAsync("live",$id);  // 删除直播
                die('{"state": 100, "info": ' . json_encode( '成功删除') . '}');
            }

        }
        $archives = $dsql->SetQuery("DELETE FROM `#@__livelist` WHERE `id`='$id'");
		$dsql->dsqlOper($archives, "update");
        dataAsync("live",$id);  // 删除直播
		die('{"state": 100, "info": ' . json_encode( '成功删除') . '}');

    }else{
        echo '{"state": 200, "info": '.json_encode('删除失败').'}';
    }
}else if($action == "revert"){

}else if($action == "move"){
    if(!testPurview("liveList")){
        die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    };
    $each = explode(",", $id);
    $error = array();
    if($id != ""){
        foreach($each as $val){
            $archives = $dsql->SetQuery("UPDATE `#@__".$dopost."list` SET `typeid` = $typeid WHERE `id` = ".$val);
            $results = $dsql->dsqlOper($archives, "update");
            if($results != "ok"){
                $error[] = $val;
            }
        }
        if(!empty($error)){
            echo '{"state": 200, "info": '.json_encode($error).'}';
        }else{
            adminLog("转移".$dowtitle."信息", $id."=>".$typeid);
            echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
        }
    }

//更新状态
}else if($action == "updateState"){
    if(!testPurview("liveList")){
        die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    };
    $each = explode(",", $id);
    $error = array();

    if($id != ""){
        foreach($each as $val){
            $res = $dsql->SetQuery("SELECT `user`,`arcrank` FROM `#@__livelist` WHERE `id` =".$val);
            $req = $dsql->dsqlOper($res, "results");
            if($req) {
                $arcrank_ = $req[0]['arcrank'];
                $uid = $req[0]['user'];
                //获取会员名
                $username = "";
                $point = "";
                $point = "";
                $sql = $dsql->SetQuery("SELECT `username`,`point` FROM `#@__member` WHERE `id` = $uid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $username = $ret[0]['username'];
                    $point = $ret[0]['point'];

                }
                //会员消息通知
                if ($arcrank != $arcrank_) {
                    //已审核
                    if ($arcrank == 1) {
                        $countIntegral = countIntegral($uid);    //统计积分上限
                        global $cfg_returnInteraction_live;    //直播积分
                        global $cfg_returnInteraction_commentDay;
                        if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_live > 0) {
                            $infoname = getModuleTitle(array('name' => 'live'));
                            //直播发布得积分
                            $date = GetMkTime(time());
                            global $langData;
                            global $userLogin;
                            //增加积分
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_live' WHERE `id` = '$uid'");
                            $dsql->dsqlOper($archives, "update");
                            $user  = $userLogin->getMemberInfo($uid);
                            $userpoint = $user['point'];
//                            $pointuser  = (int)($userpoint+$cfg_returnInteraction_live);
                            //保存操作日志
                            $info = '发布'.$infoname;
                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$uid', '1', '$cfg_returnInteraction_live', '$info', '$date','zengsong','1','$userpoint')");//发布直播得积分
                            $dsql->dsqlOper($archives, "update");

                            $param = array(
                                "service" => "member",
                                "type" => "user",
                                "template" => "point"
                            );

                            //自定义配置
                            $config = array(
                                "username" => $username,
                                "amount" => $cfg_returnInteraction_live,
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



            //更新记录状态
            $archives = $dsql->SetQuery("UPDATE `#@__livelist` SET `arcrank` = $arcrank WHERE `id` = ".$val);
            $results = $dsql->dsqlOper($archives, "update");
            if($results != "ok"){
                $error[] = $val;
            }

            //如果是通过审核并且还没有生成推流地址，这里需要生成推流地址
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__livelist` WHERE `arcrank` = 1 AND `pushurl` = ''");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $obj = new live(array('id' => $val));
        	    $obj->createLiveDetail();
            }

        }
        if(!empty($error)){
            echo '{"state": 200, "info": '.json_encode($error).'}';
        }else{
            adminLog("更新直播信息状态", $id."=>".$arcrank);
            dataAsync("live",$id);  // 视频直播-更新状态
            echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
        }
    }

//获取指定ID信息详情
}else if($action == "getArticleDetail"){
    if($id != ""){
        $archives = $dsql->SetQuery("SELECT `typeid`, `title`, `subtitle`, `flag`, `arcrank` FROM `#@__".$dopost."list` WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "results");
        echo json_encode($results);
    }

//更新快速编辑信息
}else if($action == "updateDetail"){
    if(!testPurview("liveList")){
        die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    };
    $flags    = isset($flags) ? join(',',$flags) : '';

    if($id == "") die('要修改的信息ID传递失败！');
    //对字符进行处理
    $title       = cn_substrR($title,60);
    $subtitle    = cn_substrR($subtitle,36);

    //表单二次验证
    if(trim($title) == ''){
        echo '{"state": 101, "info": '.json_encode("标题不能为空！").'}';
        exit();
    }

    if($typeid == ''){
        echo '{"state": 101, "info": '.json_encode("请选择文章分类！").'}';
        exit();
    }

    $archives = $dsql->SetQuery("UPDATE `#@__".$dopost."list` SET `typeid` = $typeid, `title` = '$title', `subtitle` = '$subtitle', `flag` = '$flags', `arcrank` = $arcrank WHERE `id` = ".$id);
    $results = $dsql->dsqlOper($archives, "update");
    if($results != "ok"){
        echo $results;
    }else{
        adminLog("快速编辑".$dowtitle."信息", $id);
        echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
    }

//更新文章分类
}else if($action == "typeAjax"){
    if(!testPurview("liveType")){
        die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    };
    $data = str_replace("\\", '', $_POST['data']);
    if($data != ""){
        $json = json_decode($data);

        $json = objtoarr($json);
        $json = proTypeAjax($json, 0, $dopost."type");
        echo $json;
    }
//更新直播状态
}else if($action == "updateLiveState"){
    $id = (int)$id;
    $state = (int)$state;
    if($id && $state){
        $ftime_f = '';
        $livetime_f = '';
        $sql = $dsql->SetQuery("SELECT `state`, `ftime`, `livetime` FROM `#@__livelist` WHERE `id` = $id");
        $res = $dsql->dsqlOper($sql, "results");
        if(!$res){
            die('{"state": 200, "info": '.json_encode("信息不存在").'}');
        }
        if($res[0]['state'] == '2'){
            die('{"state": 200, "info": '.json_encode("直播已结束").'}');
            if($res[0]['livetime'] == 0){
                $livetime = (time() - $res[0]['ftime']) * 1000;
                $livetime_f = ", `livetime` = $livetime";
            }
        }
        if($state == $res[0]['state']){
            die('{"state": 200, "info": '.json_encode("状态未改变").'}');
        }
        // if($state == '1'){
        //     $ftime_f = ", `ftime` = ".time();
        // }
        $sql = $dsql->SetQuery("UPDATE `#@__livelist` SET `state` = $state $ftime_f $livetime_f WHERE `id` = $id");
        $res = $dsql->dsqlOper($sql, "update");
        if($res == "ok"){
            die('{"state": 100, "info": '.json_encode("操作成功").'}');
        }else{
            die('{"state": 200, "info": '.json_encode("操作失败！").'}');
        }
    }else{
        die('{"state": 200, "info": '.json_encode("参数错误").'}');
    }
// 主播列表
}else if($action == "liveAnchor"){
    if(!testPurview("liveAnchor")){
        die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    };

    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    $totalPage=0;
    $totalCount=0;
    $where='';
    $inner = "";
    if($sKeyword != ""){
        // $inner = "INNER JOIN (SELECT u.id FROM huoniao_member u WHERE (u.mtype = 1 || u.mtype = 2) AND (u.username LIKE '%{$sKeyword}%' || u.nickname LIKE '%{$sKeyword}%' || u.company LIKE '%{$sKeyword}%' || u.phone LIKE '%{$sKeyword}%' || u.email LIKE '%{$sKeyword}%') ) AS m ON a.uid = m.id";
        $where .= " AND (m.username LIKE '%{$sKeyword}%' || m.nickname LIKE '%{$sKeyword}%' || m.company LIKE '%{$sKeyword}%' || m.phone LIKE '%{$sKeyword}%' || m.email LIKE '%{$sKeyword}%')";
    }

    $archives = $dsql->SetQuery("SELECT a.`id` FROM `#@__live_anchor` a LEFT JOIN `#@__member` m ON m.`id` = a.`uid` WHERE 1 = 1 AND m.`id` > 0");
    //总条数
    $totalCount = $dsql->dsqlOper($archives, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount/$pagestep);

    $where .= " order by a.`id` desc";

    $atpage = $pagestep*($page-1);
    $where .= " LIMIT $atpage, $pagestep";

    $archives = $dsql->SetQuery("SELECT a.*, m.`username`, m.`mtype`, m.`nickname`, m.`phone`, m.`photo` FROM `#@__live_anchor` a LEFT JOIN `#@__member` m ON m.`id` = a.`uid` WHERE 1=1 AND m.`id` > 0".$where);
    $results = $dsql->dsqlOper($archives, "results");

    if(count($results) > 0){
        $list=array();
        foreach($results as $key=>$value){
            $param = array(
                "service"     => "live",
                "template"    => "anchor_detail",
                "id"          => $value['id']
            );
            $value['url']     = getUrlPath($param);
            $value['pubdate'] = date("Y-m-d", $value['pubdate']);

            $sql = $dsql->SetQuery("SELECT COUNT(*) total FROM `#@__livelist` WHERE `user` = ".$value['uid']);
            $res = $dsql->dsqlOper($sql, "results");
            $value['total'] = $res[0]['total'];

            // 统计关注数
            $sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__member_follow` WHERE `fid` = " . $value['uid'] . " AND `fortype` = 'live'");
            $fansret = $dsql->dsqlOper($sql, "results");
            $value['totalFans'] = $fansret[0]['t'];

            $list[$key]=$value;
        }
        if(count($list) > 0){
            echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "anchorList": '.json_encode($list).'}';
        }else{
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
        }
    }else{
        echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
    }
    die;
// 修改主播推荐状态
}else if($action == "liveAnchorRec"){
    $id = (int)$_POST['id'];
    $rec = (int)$_POST['rec'];
    if($id){
        $sql = $dsql->SetQuery("UPDATE `#@__live_anchor` SET `rec` = $rec WHERE `id` = $id");
        $res = $dsql->dsqlOper($sql, "update");
        if($res == "ok"){
            echo '{"state": 100, "info": '.json_encode("操作成功").'}';
        }else{
            echo '{"state": 200, "info": '.json_encode("操作失败").'}';
        }
    }
}else{
    echo '{"state": 200, "info": '.json_encode("操作失败，参数错误！").'}';
}


//更新分类
function proTypeAjax($json, $pid = 0, $tab){
	global $dsql;
	for($i = 0; $i < count($json); $i++){
		$id = $json[$i]["id"];
		$name = $json[$i]["name"];
		$icon = $json[$i]["icon"];
		$flag = (int)$json[$i]["flag"];

		//如果ID为空则向数据库插入下级分类
		if($id == "" || $id == 0){
			$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`parentid`, `typename`, `weight`, `flag`, `pubdate`, `icon`) VALUES ('$pid', '$name', '$i', '$flag', '".GetMkTime(time())."', '$icon')");
			$id = $dsql->dsqlOper($archives, "lastid");
			adminLog("添加直播分类", $model."=>".$name);
		}
		//其它为数据库已存在的分类需要验证分类名是否有改动，如果有改动则UPDATE
		else{
			$archives = $dsql->SetQuery("SELECT `typename`, `weight`, `parentid`, `flag`, `icon` FROM `#@__".$tab."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				//if($results[0]["parentid"] != 0){
					//验证分类名
					if($results[0]["typename"] != $name){
						$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `typename` = '$name' WHERE `id` = ".$id);
						$dsql->dsqlOper($archives, "update");
					}

					if($results[0]["icon"] != $icon){
						$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `icon` = '$icon' WHERE `id` = ".$id);
						$dsql->dsqlOper($archives, "update");
					}

					if($results[0]["flag"] != $flag){
						$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `flag` = '$flag' WHERE `id` = ".$id);
						$dsql->dsqlOper($archives, "update");
					}

					//验证排序
					if($results[0]["weight"] != $i){
						$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `weight` = '$i' WHERE `id` = ".$id);
						$dsql->dsqlOper($archives, "update");
					}
					adminLog("修改直播分类", $model."=>".$id);
				//}
			}
		}
		if(is_array($json[$i]["lower"])){
			proTypeAjax($json[$i]["lower"], $id, $tab);
		}
	}
	return '{"state": 100, "info": "保存成功！"}';
}
