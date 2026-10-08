<?php
// 只能手动新窗口执行
if(defined('HUONIAOINC')){
  return;
}
//系统核心配置文件
require_once(dirname(__FILE__).'/../common.inc.php');
$user = $userLogin->getUserID();
?>

<html>
<head>
<title>评论同步</title>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8">
</head>
<body>
<h1 style="padding:50px 0;text-align:center;">评论同步</h1>

<?php

set_time_limit(0);

global $installModuleArr;
global $dsql;
$smartRefresh_tab = array();

if(in_array('article', $installModuleArr)){
    array_push($smartRefresh_tab, 'articlecommon');
}

if(in_array('info', $installModuleArr)){
    array_push($smartRefresh_tab, 'infocommon');
    array_push($smartRefresh_tab, 'info_shopcommon');
}

if(in_array('tuan', $installModuleArr)){
    array_push($smartRefresh_tab, 'tuancommon');
    array_push($smartRefresh_tab, 'tuan_storecommon');
}

if(in_array('travel', $installModuleArr)){
    array_push($smartRefresh_tab, 'travelcommon0');
    array_push($smartRefresh_tab, 'travelcommon1');
    array_push($smartRefresh_tab, 'travelcommon2');
    array_push($smartRefresh_tab, 'travelcommon3');
    array_push($smartRefresh_tab, 'travelcommon4');
}

if(in_array('marry', $installModuleArr)){
    array_push($smartRefresh_tab, 'marrycommon0');
    array_push($smartRefresh_tab, 'marrycommon1');
}

if(in_array('shop', $installModuleArr)){
    array_push($smartRefresh_tab, 'shop_common');
}

if(in_array('video', $installModuleArr)){
    array_push($smartRefresh_tab, 'videocommon');
}

if(in_array('quanjing', $installModuleArr)){
    array_push($smartRefresh_tab, 'quanjingcommon');
}

if(in_array('tieba', $installModuleArr)){
    array_push($smartRefresh_tab, 'tieba_reply');
}

if(in_array('huodong', $installModuleArr)){
    array_push($smartRefresh_tab, 'huodong_reply');
}

if(in_array('waimai', $installModuleArr)){
    array_push($smartRefresh_tab, 'waimai_common0');
    array_push($smartRefresh_tab, 'waimai_common1');
}

if($smartRefresh_tab){
    $type = '';
    foreach ($smartRefresh_tab as $key => $value) {
        if(strpos($value, 'article') !== false){
            $type = 'article-detail';
        }elseif($value == 'infocommon'){
            $type = 'info-detail';
        }elseif($value == 'info_shopcommon'){
            $type = 'info-business';
        }elseif($value == 'tuan_storecommon'){
            $type = 'tuan-store';
        }elseif($value == 'tuancommon'){
            $type = 'tuan-order';
        }elseif($value == 'travelcommon0'){
            $type  = 'travel-video';
            $value = 'travelcommon';
            $types = 0;
        }elseif($value == 'travelcommon1'){
            $type  = 'travel-strategy';
            $value = 'travelcommon';
            $types = 1;
        }elseif($value == 'travelcommon2'){
            $type  = 'travel-ticket';
            $value = 'travelcommon';
            $types = 2;
        }elseif($value == 'travelcommon3'){
            $type  = 'travel-agency';
            $value = 'travelcommon';
            $types = 3;
        }elseif($value == 'travelcommon4'){
            $type  = 'travel-visa';
            $value = 'travelcommon';
            $types = 4;
        }elseif($value == 'marrycommon0'){
            $type  = 'marry-store';
            $value = 'marrycommon';
            $types = 0;
        }elseif($value == 'marrycommon1'){
            $type  = 'marry-rental';
            $value = 'marrycommon';
            $types = 1;
        }elseif($value == 'shop_common'){
            $type  = 'shop-order';
        }elseif($value == 'videocommon'){
            $type  = 'video-detail';
        }elseif($value == 'quanjingcommon'){
            $type  = 'quanjing-detail';
        }elseif($value == 'tieba_reply'){
            $type  = 'tieba-detail';
        }elseif($value == 'huodong_reply'){
            $type  = 'huodong-detail';
        }elseif($value == 'waimai_common0'){
            $type  = 'waimai-order';
            $value = 'waimai_common';
            $types = 0;
        }elseif($value == 'waimai_common1'){
            $type  = 'paotui-order';
            $value = 'waimai_common';
            $types = 1;
        }

        if($value == 'info_shopcommon'){
            $sql = $dsql->SetQuery("SELECT `id`, `pid` as aid, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser` FROM `#@__".$value."` where `floor` = 0");

        }elseif($value == 'tuan_storecommon' || $value == 'tuancommon'){
            $sql = $dsql->SetQuery("SELECT `id`, `aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `rating`, `score1`, `score2`, `score3`, `pics` FROM `#@__".$value."` where `floor` = 0");

        }elseif($value == 'travelcommon' || $value == 'marrycommon'){
            $sql = $dsql->SetQuery("SELECT `id`, `aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser`, `type` FROM `#@__".$value."` where `floor` = 0 AND `type` = " . $types);

        }elseif($value == 'shop_common'){
            $sql = $dsql->SetQuery("SELECT `id`, `aid`, `pid`, `speid`, `specation`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `rating`, `score1`, `score2`, `score3`, `pics` FROM `#@__".$value."` where `floor` = 0");

        }elseif($value == 'tieba_reply'){
            $sql = $dsql->SetQuery("SELECT `id`, `tid` as aid, `rid` as floor, `uid` as userid, `content`, `pubdate` as dtime, `ip`, `state` as ischeck FROM `#@__".$value."` where `rid` = 0");

        }elseif($value == 'huodong_reply'){
            $sql = $dsql->SetQuery("SELECT `id`, `hid` as aid, `rid` as floor, `uid` as userid, `content`, `pubdate` as dtime, `ip`, `state` as ischeck FROM `#@__".$value."` where `rid` = 0");

        }elseif($value == 'waimai_common'){
            $sql = $dsql->SetQuery("SELECT `id`, `sid` as aid, `oid`, `peisongid`, `star`, `isanony`, `starps`, `contentps`, `pics`, `reply`, `replydate`, `time`, `uid` as userid, `content`, `pubdate` as dtime FROM `#@__".$value."` where `type` = '$types'");

        }else{
            $sql = $dsql->SetQuery("SELECT `id`, `aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser` FROM `#@__".$value."` where `floor` = 0");

        }

        $ret = $dsql->dsqlOper($sql, "results");
        if(is_array($ret)){
            foreach ($ret as $k => $v) {
                $id      = $v['id'];
                $aid     = $v['aid'];
                $floor   = $v['floor'];
                $userid  = $v['userid'];
                $content = $v['content'];
                $dtime   = $v['dtime'];
                $ip      = $v['ip'];
                $ipaddr  = $v['ipaddr'];
                $good    = $v['good'];
                $bad     = $v['bad'];
                $ischeck = $v['ischeck'];
                $duser   = $v['duser']  ? $v['duser'] : '';
                $rating  = $v['rating'] ? $v['rating'] : '';
                $score1  = $v['score1'] ? $v['score1'] : '';
                $score2  = $v['score2'] ? $v['score2'] : '';
                $score3  = $v['score3'] ? $v['score3'] : '';
                $pics    = $v['pics']   ? $v['pics'] : '';
                $speid   = $v['speid']  ? $v['speid'] : '';
                $specation  = $v['specation'] ? $v['specation'] : '';
                $peisongid  = $v['peisongid'] ? $v['peisongid'] : '';
                $star       = $v['star']      ? $v['star'] : '';
                $isanony    = $v['isanony']   ? $v['isanony'] : '';
                $starps     = $v['specation'] ? $v['starps'] : '';
                $contentps  = $v['contentps'] ? $v['contentps'] : '';
                $reply      = $v['reply']     ? $v['reply'] : '';
                $replydate  = $v['replydate'] ? $v['replydate'] : '';
                $time       = $v['time']      ? $v['time'] : '';

                if($type=='article-detail'){
                    $archives = $dsql->SetQuery("SELECT `admin` uid FROM `#@__articlelist_all` WHERE `id` = '$aid'");
                }elseif($type == 'info-detail'){
                    $archives = $dsql->SetQuery("SELECT `userid` uid FROM `#@__infolist` WHERE `id` = '$aid'");
                }elseif($type == 'info-business'){
                    $archives = $dsql->SetQuery("SELECT `uid` FROM `#@__infoshop` WHERE `id` = '$aid'");
                }elseif($type == 'tuan-store'){
                    $archives = $dsql->SetQuery("SELECT `uid` FROM `#@__tuan_store` WHERE `id` = '$aid'");
                }elseif($type == 'tuan-order'){
                    $sql = $dsql->SetQuery("SELECT `proid`, `id` FROM `#@__tuan_order` WHERE `id` = '$aid'");
                    $order = $dsql->dsqlOper($sql, "results");
                    if($order){
                        $orderid = $order[0]['id'];
                        $aid     = $order[0]['proid'];

                        $sql = $dsql->SetQuery("SELECT `sid` FROM `#@__tuanlist` WHERE `id` = '$aid'");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if($ret && is_array($ret)){
                            $sid = $ret[0]['sid'];
                            $archives = $dsql->SetQuery("SELECT `uid` FROM `#@__tuan_store` WHERE `id` = '$sid'");
                        }
                    }
                }elseif($type == 'travel-ticket'){
                    $sql = $dsql->SetQuery("SELECT `company` FROM `#@__travel_ticket` WHERE `id` = '$aid'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret && is_array($ret)){
                        $company  = $ret[0]['company'];
                        $archives = $dsql->SetQuery("SELECT `userid` uid FROM `#@__travel_store` WHERE `id` = '$company'");
                    }
                }elseif($type == 'travel-video'){
                    $sql = $dsql->SetQuery("SELECT `usertype`, `userid` FROM `#@__travel_video` WHERE `id` = '$aid'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret && is_array($ret)){
                        if($ret[0]['usertype'] == 1){
                            $company  = $ret[0]['userid'];
                            $archives = $dsql->SetQuery("SELECT `userid` uid FROM `#@__travel_store` WHERE `id` = '$company'");
                        }else{
                            $memid    = $ret[0]['userid'];
                            $archives = $dsql->SetQuery("SELECT `id` uid FROM `#@__member` WHERE `id` = '$memid'");
                        }
                    }
                }elseif($type == 'travel-strategy'){
                    $sql = $dsql->SetQuery("SELECT `usertype`, `userid` FROM `#@__travel_strategy` WHERE `id` = '$aid'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret && is_array($ret)){
                        if($ret[0]['usertype'] == 1){
                            $company = $ret[0]['userid'];
                            $archives = $dsql->SetQuery("SELECT `userid` uid FROM `#@__travel_store` WHERE `id` = '$company'");
                        }else{
                            $memid    = $ret[0]['userid'];
                            $archives = $dsql->SetQuery("SELECT `id` uid FROM `#@__member` WHERE `id` = '$memid'");
                        }
                    }
                }elseif($type == 'travel-visa'){
                    $sql = $dsql->SetQuery("SELECT `company` FROM `#@__travel_visa` WHERE `id` = '$aid'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret && is_array($ret)){
                        $company  = $ret[0]['company'];
                        $archives = $dsql->SetQuery("SELECT `userid` uid FROM `#@__travel_store` WHERE `id` = '$company'");
                    }
                }elseif($type == 'travel-agency'){
                    $sql = $dsql->SetQuery("SELECT `company` FROM `#@__travel_agency` WHERE `id` = '$aid'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret && is_array($ret)){
                        $company = $ret[0]['company'];
                        $archives = $dsql->SetQuery("SELECT `userid` uid FROM `#@__travel_store` WHERE `id` = '$company'");
                    }
                }elseif($type == 'marry-store'){
                    $archives = $dsql->SetQuery("SELECT `userid` uid FROM `#@__marry_store` WHERE `id` = '$aid'");
                }elseif($type == 'marry-rental'){
                    $sql = $dsql->SetQuery("SELECT `company` FROM `#@__marry_weddingcar` WHERE `id` = '$aid'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret && is_array($ret)){
                        $company = $ret[0]['company'];
                        $archives = $dsql->SetQuery("SELECT `userid` uid FROM `#@__marry_store` WHERE `id` = '$company'");
                    }
                }elseif($type == 'shop-order'){
                    $aid         = $v['pid'];
                    $orderid     = $v['aid'];

                    $sql = $dsql->SetQuery("SELECT `store` FROM `#@__shop_product` WHERE `id` = '$aid'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret && is_array($ret)){
                        $sid = $ret[0]['store'];
                        $archives = $dsql->SetQuery("SELECT `userid` uid FROM `#@__shop_store` WHERE `id` = '$sid'");
                    }
                }elseif($type == 'video-detail'){
                    $archives = $dsql->SetQuery("SELECT `admin` uid FROM `#@__videolist` WHERE `id` = '$aid'");
                }elseif($type == 'quanjing-detail'){
                    $archives = $dsql->SetQuery("SELECT `admin` uid FROM `#@__quanjinglist` WHERE `id` = '$aid'");
                }elseif($type == 'tieba-detail'){
                    $archives = $dsql->SetQuery("SELECT `uid` FROM `#@__tieba_list` WHERE `id` = '$aid'");
                }elseif($type == 'huodong-detail'){
                    $archives = $dsql->SetQuery("SELECT `uid` FROM `#@__huodong_list` WHERE `id` = '$aid'");
                }elseif($type == 'waimai-order'){
                    $orderid = $v['oid'];
                    $ischeck = 1;
                     //外卖分表
                    $sub = new SubTable('waimai_order', '#@__waimai_order');
                    $break_table = $sub->getSubTableById($orderid);
                    $archives = $dsql->SetQuery("SELECT `id` FROM `".$break_table."` WHERE `id` = '$orderid'");
                }elseif($type == 'paotui-order'){
                    $orderid = $v['oid'];
                    $ischeck = 1;
                    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__paotui_order` WHERE `id` = '$orderid'");
                }
                $results = $dsql->dsqlOper($archives, "results");
                if($results && is_array($results)){
                    if($type != 'waimai-order' && $type != 'paotui-order'){
                        $masterid = $results[0]['uid'];
                    }else{
                        $masterid = 0;
                    }
                    $sql = $dsql->SetQuery("INSERT INTO `#@__public_comment` (`pid`, `rid`, `type`, `aid`, `oid`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `ischeck`, `zan_user`, `sid`, `masterid`, `rating`, `sco1`, `sco2`, `sco3`, `pics`, `speid`, `specation`, `peisongid`, `star`, `starps`, `contentps`, `reply`, `replydate`, `time`) VALUES ('0', '0', '$type', '$aid', '$orderid', '$userid', '$content', '$dtime', '$ip', '$ipaddr', '$ischeck', '$duser', '0', '$masterid', '$rating', '$score1', '$score2', '$score3', '$pics', '$speid', '$specation', '$peisongid', '$star', '$starps', '$contentps', '$reply', '$replydate', '$time')");
                    $newaid = $dsql->dsqlOper($sql, "lastid");
                    //没有回复就不进行下面操作
                    if($type != 'tuan-order' && $type != 'tuan-store' && $type != 'shop-order' && $type != 'waimai-order' && $type != 'paotui-order'){
                        getchildren($id, $value, $newaid, $type, $newaid);
                    }


                }

            }
        }
    }


}

function getchildren($id, $tab, $newaid, $type, $oid, $n=0, $orid = 0)
{
    $oid = $oid;
    $orid = $orid;
    $isture = false;

    global $dsql;
    if($type=='info-business'){
        $archives = $dsql->SetQuery("SELECT `id`, `pid` as aid, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser` FROM `#@__".$tab."` WHERE `floor` = '$id' ORDER BY `id` ASC ");

    }elseif($type=='tuan-store'){
        $archives = $dsql->SetQuery("SELECT `id`, `aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `rating`, `score1`, `score2`, `score3`, `pics` FROM `#@__".$tab."` WHERE `floor` = '$id' ORDER BY `id` ASC ");

    }elseif(strpos($type, 'travel') !== false){
        if($type == 'travel-video'){
            $types = 0;
        }elseif($type == 'travel-strategy'){
            $types = 1;
        }elseif($type == 'travel-ticket'){
            $types = 2;
        }elseif($type == 'travel-agency'){
            $types = 3;
        }elseif($type == 'travel-visa'){
            $types = 4;
        }
        $archives = $dsql->SetQuery("SELECT `id`, `aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser` FROM `#@__".$tab."` WHERE `floor` = '$id' AND `type` = '$types' ORDER BY `id` ASC ");

    }elseif(strpos($type, 'marry') !== false){
        if($type == 'marry-store'){
            $types = 0;
        }elseif($type == 'marry-rental'){
            $types = 1;
        }
        $archives = $dsql->SetQuery("SELECT `id`, `aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser` FROM `#@__".$tab."` WHERE `floor` = '$id' AND `type` = '$types' ORDER BY `id` ASC ");

    }elseif($type=='tieba-detail'){
        $archives = $dsql->SetQuery("SELECT `id`, `tid` as aid, `rid` as floor, `uid` as userid, `content`, `pubdate` as dtime, `ip`, `state` as ischeck FROM `#@__".$tab."` WHERE `rid` = '$id' ORDER BY `id` ASC ");

    }elseif($type=='huodong-detail'){
        $archives = $dsql->SetQuery("SELECT `id`, `hid` as aid, `rid` as floor, `uid` as userid, `content`, `pubdate` as dtime, `ip`, `state` as ischeck FROM `#@__".$tab."` WHERE `rid` = '$id' ORDER BY `id` ASC ");

    }else{
        $archives = $dsql->SetQuery("SELECT `id`, `aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser` FROM `#@__".$tab."` WHERE `floor` = '$id' ORDER BY `id` ASC ");

    }

    $results  = $dsql->dsqlOper($archives, "results");
    $list = array();
    if($results){
        $lower = array();
        foreach ($results as $key => $value) {

            if($type=='article-detail'){
                $sql = $dsql->SetQuery("SELECT `admin` uid FROM `#@__articlelist_all` WHERE `id` = " . $value['aid']);
            }elseif($type=='info-detail'){
                $sql = $dsql->SetQuery("SELECT `userid` uid FROM `#@__infolist` WHERE `id` = " . $value['aid']);
            }elseif($type=='info-business'){
                $sql = $dsql->SetQuery("SELECT `uid` FROM `#@__infoshop` WHERE `id` = " . $value['aid']);
            }elseif($type=='tuan-store'){
                $sql = $dsql->SetQuery("SELECT `uid` FROM `#@__tuan_store` WHERE `id` = " . $value['aid']);
            }elseif($type == 'travel-ticket'){
                $sql = $dsql->SetQuery("SELECT `company` FROM `#@__travel_ticket` WHERE `id` = " . $value['aid']);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret && is_array($ret)){
                    $company  = $ret[0]['company'];
                    $sql = $dsql->SetQuery("SELECT `userid` uid FROM `#@__travel_store` WHERE `id` = '$company'");
                }
            }elseif($type == 'travel-video'){
                $sql = $dsql->SetQuery("SELECT `usertype`, `userid` FROM `#@__travel_video` WHERE `id` = " . $value['aid']);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret && is_array($ret)){
                    if($ret[0]['usertype'] == 1){
                        $company  = $ret[0]['userid'];
                        $sql = $dsql->SetQuery("SELECT `userid` uid FROM `#@__travel_store` WHERE `id` = '$company'");
                    }else{
                        $memid    = $ret[0]['userid'];
                        $sql = $dsql->SetQuery("SELECT `id` uid FROM `#@__member` WHERE `id` = '$memid'");
                    }
                }
            }elseif($type == 'travel-strategy'){
                $sql = $dsql->SetQuery("SELECT `usertype`, `userid` FROM `#@__travel_strategy` WHERE `id` = " . $value['aid']);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret && is_array($ret)){
                    if($ret[0]['usertype'] == 1){
                        $company = $ret[0]['userid'];
                        $sql = $dsql->SetQuery("SELECT `userid` uid FROM `#@__travel_store` WHERE `id` = '$company'");
                    }else{
                        $memid    = $ret[0]['userid'];
                        $sql = $dsql->SetQuery("SELECT `id` uid FROM `#@__member` WHERE `id` = '$memid'");
                    }
                }
            }elseif($type == 'travel-visa'){
                $sql = $dsql->SetQuery("SELECT `company` FROM `#@__travel_visa` WHERE `id` = " . $value['aid']);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret && is_array($ret)){
                    $company  = $ret[0]['company'];
                    $sql = $dsql->SetQuery("SELECT `userid` uid FROM `#@__travel_store` WHERE `id` = '$company'");
                }
            }elseif($type == 'travel-agency'){
                $sql = $dsql->SetQuery("SELECT `company` FROM `#@__travel_agency` WHERE `id` = " . $value['aid']);
                $ret = $dsql->dsqlOper($archives, "results");
                if($ret && is_array($ret)){
                    $company = $ret[0]['company'];
                    $sql = $dsql->SetQuery("SELECT `userid` uid FROM `#@__travel_store` WHERE `id` = '$company'");
                }
            }elseif($type=='marry-store'){
                $sql = $dsql->SetQuery("SELECT `userid` uid FROM `#@__marry_store` WHERE `id` = " . $value['aid']);
            }elseif($type == 'marry-rental'){
                $sql = $dsql->SetQuery("SELECT `company` FROM `#@__marry_weddingcar` WHERE `id` = " . $value['aid']);
                $ret = $dsql->dsqlOper($archives, "results");
                if($ret && is_array($ret)){
                    $company = $ret[0]['company'];
                    $sql = $dsql->SetQuery("SELECT `userid` uid FROM `#@__marry_store` WHERE `id` = '$company'");
                }
            }elseif($type=='video-detail'){
                $sql = $dsql->SetQuery("SELECT `admin` uid FROM `#@__videolist` WHERE `id` = " . $value['aid']);
            }elseif($type=='quanjing-detail'){
                $sql = $dsql->SetQuery("SELECT `admin` uid FROM `#@__quanjinglist` WHERE `id` = " . $value['aid']);
            }elseif($type=='tieba-detail'){
                $sql = $dsql->SetQuery("SELECT `uid` FROM `#@__tieba_list` WHERE `id` = " . $value['aid']);
            }elseif($type=='huodong-detail'){
                $sql = $dsql->SetQuery("SELECT `uid` FROM `#@__huodong_list` WHERE `id` = " . $value['aid']);
            }
            $res = $dsql->dsqlOper($sql, "results");
            if($res && is_array($res)){
                $masterid = $res[0]['uid'];
            }

            $rid = $orid;
            if($n==1 && !$isture){
                $rid = $newaid;
            }
            $sql = $dsql->SetQuery("INSERT INTO `#@__public_comment` (`pid`, `rid`, `type`, `aid`, `oid`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `ischeck`, `zan_user`, `sid`, `masterid`, `rating`, `sco1`, `sco2`, `sco3`, `pics`) VALUES ('$oid', '$rid', '$type', '$value[aid]', '$value[oid]', '$value[userid]', '$value[content]', '$value[dtime]', '$value[ip]', '$value[ipaddr]', '$value[ischeck]', '$value[duser]', '$newaid', '$masterid', '$value[rating]', '$value[sco1]', '$value[sco2]', '$value[sco3]', '$value[pics]')");
            $newaid = $dsql->dsqlOper($sql, "lastid");
            if($n==1 && !$isture){
                $orid   = $rid;
                $isture = true;
            }

            getchildren($value['id'], $tab, $newaid, $type, $oid, $n+1, $orid);

        }
    }
}



if($user > 0){
    echo '<center style="padding-top:100px;color:red;">同步已完成，请不要在本页面刷新或再次运行此任务，否则数据会重复。&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:;" onclick="window.close();">关闭页面</a></center>';
}


?>

</body>
</html>
