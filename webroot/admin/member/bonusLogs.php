<?php
/**
 * 消费金消费记录
 *
 * @version        $Id: moneyLogs.php 2015-11-11 上午09:37:12 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("bonusLogs");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "bonusLogs.html";

$configPay = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = 'huoniao_bonus'");
$Payconfig= $dsql->dsqlOper($configPay, "results");
$payname = $Payconfig[0]['pay_name'] ? $Payconfig[0]['pay_name'] : '消费金';
$huoniaoTag->assign('payname', $payname);

$action = "member_bonus";

$leimuallarr = array(
    'chongzhi'          =>'充值',
    'tixian'            =>'提现',
    'huiyuanshengji'    =>'会员升级',
    'shangjiaruzhu'     =>'商家入驻',
    'jingjirentaocan'   =>'经纪人套餐',
    'shuaxin'           =>'刷新',
    'zhiding'           =>'置顶',
    'dashang'           =>'打赏',
    'liwu'              =>'礼物',
    'baozhangjin'       =>'保障金',
    'hehuorenruzhu'     =>'合伙人入驻',
    'jiacu'             =>'加粗',
    'jiahong'           =>'加红',
    'fabuxinxi'         =>'发布信息',
    'maidan'            =>'买单',
    'xiaofei'           =>'消费',
    'yongjin'           =>'佣金',
    'fufeiyuedu'        =>'付费阅读',
    'jifenduihuan'      =>'积分兑换',
    'peifu'             =>'赔付',
    'tuikuan'           =>'退款',
    'shangpinxiaoshou'  =>'商品销售',
    'yonghujili'        =>'用户激励',
    'payPhone'          =>'付费查看电话'

);

if($dopost == "getList"){
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    $where = "";

    //城市管理员，只能管理管辖城市的会员
    if($userType == 3){
        $sql = $dsql->SetQuery("SELECT `mgroupid` FROM `#@__member` WHERE `id` = " . $userLogin->getUserID());
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $adminCityID = $ret[0]['mgroupid'];

            global $data;
            $data = '';
            $adminAreaData = $dsql->getTypeList($adminCityID, 'site_area');
            $adminAreaIDArr = parent_foreach($adminAreaData, 'id');
            $adminAreaIDs = join(',', $adminAreaIDArr);
            if($adminAreaIDs){
                $where .= " AND m.`addr` in ($adminAreaIDs)";
            }else{
                $where .= " AND 1 = 2";
            }
        }
    }

    //城市
//    if($cityid){
//        global $data;
//        $data = '';
//        $cityAreaData = $dsql->getTypeList($cityid, 'site_area');
//        $cityAreaIDArr = parent_foreach($cityAreaData, 'id');
//        $cityAreaIDs = join(',', $cityAreaIDArr);
//        if($cityAreaIDs){
//            $where .= " AND a.`cityid` in ($cityAreaIDs)";
//        }else{
//            $where .= " 3 = 4";
//        }
//    }

    if($cityid){
      $where .= getWrongCityFilter('a.`cityid`', $cityid);

    }

    //关键词
    if(!empty($sKeyword)){
        $where1 = array();
        $where1[] = "a.`info` like '%$sKeyword%'";

        $userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `username` like '%$sKeyword%'");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if($userResult){
            $userid = array();
            foreach($userResult as $key => $user){
                array_push($userid, $user['id']);
            }
            if(!empty($userid)){
                $where1[] = "a.`userid` in (".join(",", $userid).")";
            }
        }

        $where .= " AND (".join(" OR ", $where1).")";

    }

    if($start != ""){
        $where .= " AND a.`date` >= ". GetMkTime($start." 00:00:00");
    }

    if($end != ""){
        $where .= " AND a.`date` <= ". GetMkTime($end." 23:59:59");
    }

    $archives = $dsql->SetQuery("SELECT a.`id` FROM `#@__".$action."` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE 1 = 1".$where);

    //总支出
    $state0 = $dsql->dsqlOper($archives.$where." AND a.`type` = 0", "totalCount");
    //总收入
    $state1 = $dsql->dsqlOper($archives.$where." AND a.`type` = 1", "totalCount");

    //总收入
    $add = $dsql->SetQuery("SELECT SUM(a.`amount`) AS amount FROM `#@__".$action."` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE a.`type` = 1".$where);
    $totalAdd = $dsql->dsqlOper($add, "results");
    $totalAdd = (float)$totalAdd[0]['amount'];

    //总支出
    $less = $dsql->SetQuery("SELECT SUM(a.`amount`) AS amount FROM `#@__".$action."` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE a.`type` = 0".$where);
    $totalLess = $dsql->dsqlOper($less, "results");
    $totalLess = (float)$totalLess[0]['amount'];

    //类型
    if($type != ""){
        $where .= " AND a.`type` = '$type'";
    }
    $where .= " order by a.`id` desc";

    //总条数
    $totalCount = $dsql->dsqlOper($archives, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount/$pagestep);

    if($type != ""){

        if($type == 0){
            $totalPage = ceil($state0/$pagestep);
        }elseif($type == 1){
            $totalPage = ceil($state1/$pagestep);
        }

    }

    $atpage = $pagestep*($page-1);
    $where .= " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT a.`id`, a.`userid`, a.`type`, a.`amount`, a.`info`, a.`date`,a.`ctype`,a.`cityid` FROM `#@__".$action."` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE 1 = 1".$where);
    $results = $dsql->dsqlOper($archives, "results");

    $list = array();

    if(count($results) > 0){
        foreach ($results as $key=>$value) {
            $list[$key]["id"] = $value["id"];
            $list[$key]["userid"] = $value["userid"];

            //用户名
//            $_userinfo = $userLogin->getMemberInfo($value['userid']);
            $sql = $dsql->SetQuery("SELECT `nickname`,`cityid` FROM `#@__member` WHERE `id` = ".$value['userid']);
            $_userinfo = $dsql->dsqlOper($sql, "results");
            if(is_array($_userinfo)){
                $list[$key]["username"] = $_userinfo[0]['nickname'] ?   $_userinfo[0]['nickname'] : "未知";
            }else{
                $list[$key]["username"] = "未知";
            }

            $list[$key]["type"] = $value["type"];
            $list[$key]["amount"] = $value["amount"];
            $list[$key]["date"] = date('Y-m-d H:i:s', $value["date"]);
            $list[$key]["info"] = $value["info"];
            $list[$key]["ctype"] = $value["ctype"];
            $list[$key]["ctypename"] = $value["ctype"]!='' ? $leimuallarr[$value["ctype"]] :'';
           if ($value['cityid'] == 0){
               $listcityid = $_userinfo[0]['cityid'];
           }else{
               $listcityid = $value['cityid'];
           }

            $cityname = '未知';
            $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__site_area` WHERE `id` = " . (int)$listcityid);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $cityname = $ret[0]['typename'];
            }
            $list[$key]["addrname"] = $cityname;

        }

        if(count($list) > 0){
            if($do != "export"){
                echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.'}, "totalAdd": '.$totalAdd.', "totalLess": '.$totalLess.', "list": '.json_encode($list).'}';
            }
        }else{
            if($do != "export"){
                echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.'}, "totalAdd": '.$totalAdd.', "totalLess": '.$totalLess.'}';
            }
        }

    }else{
        if($do != "export"){
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.'}, "totalAdd": '.$totalAdd.', "totalLess": '.$totalLess.'}';
        }
    }
    //导出数据
    $fileName = $payname . "消费记录数据.csv";
    if($do == "export"){

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '城市'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '会员'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '会员ID'));
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
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['username']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['userid']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['info']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['type']==0?"-".$data['amount']:"+".$data['amount']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['date']));

            //写入文件
            fputcsv($file, $arr);
        }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = $fileName");
        header("Accept-ranges:bytes");
        header("Accept-length:".filesize($filePath));
        readfile($filePath);
    }
    die;

//删除
}elseif($dopost == "del"){
    if($id == "") die;
    $each = explode(",", $id);
    $error = array();
    foreach($each as $val){
        $archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$val);
        $results = $dsql->dsqlOper($archives, "update");
        if($results != "ok"){
            $error[] = $val;
        }
    }
    if(!empty($error)){
        echo '{"state": 200, "info": '.json_encode($error).'}';
    }else{
        adminLog("删除现金消费记录", $id);
        echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
    }
    die;

}
$huoniaoTag->assign('leimuallarr',$leimuallarr);
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
        'admin/member/bonusLogs.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
