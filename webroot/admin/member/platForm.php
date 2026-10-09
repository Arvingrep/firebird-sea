<?php
/**
 * 现金消费记录
 *
 * @version        $Id: platForm.php 2015-11-11 上午09:37:12 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("platForm");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "platForm.html";

$action = "member_money";

$leimuallarr = array(
    'chongzhi'          =>'充值',
    'huiyuanshengji'    =>'会员升级',
    'shangjiaruzhu'     =>'商家入驻',
    'jingjirentaocan'   =>'经纪人套餐',
    'shuaxin'           =>'刷新',
    'zhiding'           =>'置顶',
    'dashang'           =>'打赏',
    'liwu'              =>'礼物',
    // 'baozhangjin'       =>'保障金',
    'hehuorenruzhu'     =>'合伙人入驻',
    'jiacu'             =>'加粗',
    'jiahong'           =>'加红',
    'fabuxinxi'         =>'发布信息',
    // 'maidan'            =>'买单',
    'xiaofei'           =>'消费',
    'yongjin'           =>'佣金',
    'fufeiyuedu'        =>'付费阅读',
    'jifenduihuan'      =>'积分兑换',
    'peifu'             =>'赔付',
    'tuikuan'           =>'退款',
    'shangpinxiaoshou'  =>'商品销售',
    'yonghujili'        =>'用户激励',
    'payPhone'          =>'付费查看电话',
    'tixian'            =>'提现手续费'
);

if($dopost == "getList" || $do == "export"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = $wheretype = "";

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
	if($cityid){
//		global $data;
//		$data = '';
//		$cityAreaData = $dsql->getTypeList($cityid, 'site_area');
//		$cityAreaIDArr = parent_foreach($cityAreaData, 'id');
//		$cityAreaIDs = join(',', $cityAreaIDArr);
//		if($cityAreaIDs){
			$where .= getWrongCityFilter('m.`cityid`', $cityid);
//		}else{
//			$where .= " 3 = 4";
//		}
	}

	//关键词
	if(!empty($sKeyword)){
		$where1 = array();
		$where1[] = "a.`info` like '%$sKeyword%'";

		$userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `username` like '%$sKeyword%' OR `nickname` like '%$sKeyword%' OR `company` like '%$sKeyword%'");
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

    if ($module != '' && $module != 'all') {

        if ($module == 'member') {
            $wheretype = " AND (a.`ordertype` = '' OR a.`ordertype` = 'member')";
        }else{
            $wheretype = " AND a.`ordertype` = '" . $module . "'";
        }
    }

    if($leimutype!=''){
        $where .= " AND a.`ctype` = '".$leimutype."'";
    }

	if(GetMkTime($start) > GetMkTime($end)){
        echo '{"state": 101, "info": '.json_encode("开始时间不得小于结束时间").',"pageInfo": {"totalPage":0, "totalCount": 0, "state0": 0, "state1":0}, "totalAdd": 0, "totalLess": 0, "totalCharge": 0 }';die;
    }
	$archives = $dsql->SetQuery("SELECT a.`id` FROM `#@__".$action."` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE 1 = 1");
	//充值数量
	$state0 = $dsql->dsqlOper($archives.$where . $wheretype." AND a.`montype` = 1 AND a.`info` != '分销商每月返现'", "totalCount");
	//佣金数量
	$state1 = $dsql->dsqlOper($archives." AND `showtype` = 1 ".$where . $wheretype." AND a.`ordertype` != '' AND `platform` != 0", "totalCount");

	//总充值
	$add = $dsql->SetQuery("SELECT SUM(a.`amount`) AS amount FROM `#@__".$action."` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE a.`montype` = 1 AND a.`ctype` = 'chongzhi' AND a.`info` != '分销商每月返现'".$where . $wheretype);
	$totalAdd = $dsql->dsqlOper($add, "results");
	$totalAdd = (float)$totalAdd[0]['amount'];

	//佣金总和
	$sumless = $dsql->SetQuery("SELECT SUM(a.`platform`) AS platform FROM `#@__".$action."` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE 1 = 1 AND ((a.`platform` !=0 AND a.`showtype` = 1 AND a.`ordertype` != '') or (a.`montype` = 1 AND a.`info` != '分销商每月返现')) AND a.`type` = 1 ".$where . $wheretype);
	$sumtotalLess = $dsql->dsqlOper($sumless, "results");
    $totalLess = (float)$sumtotalLess[0]['platform'];

    //总手续费

    $_p_where = "";
	if($start != ""){
		$_p_where .= " AND `pubdate` >= ". GetMkTime($start." 00:00:00");
	}

	if($end != ""){
		$_p_where .= " AND `pubdate` <= ". GetMkTime($end." 23:59:59");
	}

    $totalCharge = $dsql->getOne($dsql::SetQuery("select sum(`pt_charge`) from `#@__pay_log` where `pt_charge`>0" . $_p_where)) ?: 0;


    //扣除的佣金总和
    // $jianless = $dsql->SetQuery("SELECT SUM(a.`platform`) AS platform FROM `#@__".$action."` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE 1 = 1 AND `showtype` = 1 AND `type` = 0 ".$where);
    // $jiantotalLess = $dsql->dsqlOper($jianless, "results");
    // $totalLess = (float)$sumtotalLess[0]['platform'] -  (float)$jiantotalLess[0]['platform'];

	//类型
	if($type == "2"){
		$wheretype = " WHERE a.`ordertype` != '' AND `platform` !=0 AND `showtype` = 1" . $wheretype;
	}else if($type == "1"){
		$wheretype = " WHERE  a.`montype` = 1 AND a.`info` != '分销商每月返现'" . $wheretype;
	}else{
		$wheretype = " WHERE   ((a.`ordertype` != '' AND `platform` !=0 AND `showtype` = 1) or (a.`montype` = 1 AND a.`info` != '分销商每月返现')) " . $wheretype;
	}
	$where .= " order by a.`id` desc";

	//总条数
	// $totalCount = $dsql->dsqlOper($archives, "totalCount");
	$totalCount = $state0+$state1;
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	if($type != ""){

		if($type == 1){
			$totalPage = ceil($state0/$pagestep);
		}elseif($type == 2){
			$totalPage = ceil($state1/$pagestep);
		}

	}

	$atpage = $pagestep*($page-1);
    $where1 = "";
    if($do != "export") {
        $where1 .= " LIMIT $atpage, $pagestep";
    }
	$archives = $dsql->SetQuery("SELECT a.`id`, a.`userid`, a.`type`, a.`amount`,a.`info`, a.`date`, a.`ordertype`, a.`montype`,a.`platform` ,m.`cityid`,a.`cityid` acityid,a.`ctype`,m.`addr` FROM `#@__".$action."` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` ".$wheretype.$where.$where1);    
	$results = $dsql->dsqlOper($archives, "results");

	$list = array();
//	$ct = array_column($userLogin->getAdminCity(), 'name','id');

	//模块
	$mosql = $dsql->SetQuery("SELECT  `name` , `subject`  FROM `#@__site_module`");
	$mores = $dsql->dsqlOper($mosql, "results");
	$modulearr = array_column($mores,'subject','name');
	$modulearr['business'] = '商家';
	$modulearr['siteConfig'] = '平台';

    $wherecityid = '';

    if (!empty($cityid)) {
        $wherecityid .= getWrongCityFilter('`cityid`', $cityid);
    }

    $module = '';
    $modulemoneyarr = array();
    foreach ($mores as $k => $v) {

        if (strstr($v['subject'], '商家')) {
            $module = 'business';
        } else {
            $module = $v['name'];
        }

        $sql1 = $dsql->SetQuery("SELECT  count(`id`) as allcount FROM `#@__member_money` a WHERE ((a.`ordertype` != '' AND `platform` !=0 AND `showtype` = 1) or (a.`montype` = 1 AND a.`info` != '分销商每月返现')) AND `ordertype` = '" . $module . "' $wherecityid AND `showtype`  = 1" . $where);
        $res1 = $dsql->dsqlOper($sql1, "results");

        $modulemoneyarr[$k]['subject'] = $v['subject'];
        $modulemoneyarr[$k]['name'] = $v['name'];
        $modulemoneyarr[$k]['allcount'] = $res1[0]['allcount'];

        $sql1 = $dsql->SetQuery("SELECT  SUM(`platform`) as allcommission FROM `#@__member_money` a WHERE ((a.`ordertype` != '' AND `platform` !=0 AND `showtype` = 1) or (a.`montype` = 1 AND a.`info` != '分销商每月返现')) AND `ordertype` = '" . $module . "' $wherecityid AND `showtype`  = 1 AND `type` = 1" . $where);
        $res1 = $dsql->dsqlOper($sql1, "results");
        $modulemoneyarr[$k]['allcommission'] = (float)$res1[0]['allcommission'];
    }
    
    /*会员升级以及置顶等相关*/
    $msql = $dsql->SetQuery("SELECT  count(`id`) as allcount FROM `#@__member_money` a WHERE ((`platform` !=0 AND `showtype` = 1 AND `ordertype` != '') or (a.`montype` = 1 AND a.`info` != '分销商每月返现')) AND (`ordertype` = '' OR `ordertype` = 'member') $wherecityid" . $where);
    $mres = $dsql->dsqlOper($msql, "results");
    $mamber = array();
    $mamber['subject'] = '会员相关';
    $mamber['name'] = 'member';
    $mamber['allcount'] = $mres[0]['allcount'];

    $msql = $dsql->SetQuery("SELECT  SUM(`platform`) as allcommission  FROM `#@__member_money` a WHERE ((`platform` !=0 AND `showtype` = 1 AND `ordertype` != '') or (a.`montype` = 1 AND a.`info` != '分销商每月返现')) AND (`ordertype` = '' OR `ordertype` = 'member') $wherecityid AND `type` = 1" . $where);
    $mres = $dsql->dsqlOper($msql, "results");
    $mamber['allcommission'] = (float)$mres[0]['allcommission'];
    array_push($modulemoneyarr, $mamber);

    /*系统*/
    $ssql = $dsql->SetQuery("SELECT count(`id`) as allcount FROM `#@__member_money` a WHERE ((a.`ordertype` != '' AND `platform` !=0 AND `showtype` = 1) or (a.`montype` = 1 AND a.`info` != '分销商每月返现')) AND `ordertype` = 'siteConfig' $wherecityid AND `showtype`  = 1" . $where);
    $sres = $dsql->dsqlOper($ssql, "results");
    $site = array();
    $site['subject'] = '系统相关';
    $site['name'] = 'siteConfig';
    $site['allcount'] = $sres[0]['allcount'];

    $ssql = $dsql->SetQuery("SELECT  SUM(`platform`) as allcommission FROM `#@__member_money` a WHERE ((a.`ordertype` != '' AND `platform` !=0 AND `showtype` = 1) or (a.`montype` = 1 AND a.`info` != '分销商每月返现')) AND `ordertype` = 'siteConfig' $wherecityid AND `showtype`  = 1 AND `type` = 1" . $where);
    $sres = $dsql->dsqlOper($ssql, "results");
    $site['allcommission'] = (float)$sres[0]['allcommission'];
    array_push($modulemoneyarr, $site);

	if(count($results) > 0){
        
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["userid"] = $value["userid"];

			//用户名
			$userSql = $dsql->SetQuery("SELECT `nickname` FROM `#@__member` WHERE `id` = ". $value["userid"]);
			$username = $dsql->dsqlOper($userSql, "results");
			if(count($username) > 0){
				$list[$key]["username"] = $username[0]['nickname'];
			}else{
				$list[$key]["username"] = "未知";
			}
			if($value['montype']==1 && $value['ctype'] != 'yongjin'){
				$list[$key]["amount"] = $value["amount"];
				$list[$key]["ordertype"] = '充值';
			}else{
				$list[$key]["amount"] = $value["platform"];
				$list[$key]["ordertype"] = $modulearr[$value["ordertype"]];;
			}
			$list[$key]["type"] = $value["type"];
			$list[$key]["date"] = date('Y-m-d H:i:s', $value["date"]);
			$info =  str_replace('(分站佣金)','',$value["info"]);
			$list[$key]["info"] = str_replace('(分站获得佣金)',' ',$info);



            $list[$key]["ctype"]        = $value["ctype"];
            $list[$key]["ctypename"]    = $value["ctype"]!='' ? $leimuallarr[$value["ctype"]] :'';
			// if($addrname){
			// 	$addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrname, 'type' => 'typename', 'split' => ' '));
			// }
            $list[$key]["addrname"] = getSiteCityName(!empty($value['acityid'])?$value['acityid']:$value['cityid']);

		}
		// echo"<pre>";
		// var_dump($list);die;
		if(count($list) > 0){
            if($do != "export") {
                echo '{"state": 100, "inf": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "state0": ' . $state0 . ', "state1": ' . $state1 . '}, "totalAdd": ' . $totalAdd . ', "totalLess": ' . $totalLess .', "totalCharge": ' . $totalCharge . ', "list": ' . json_encode($list) . ',"modulemoneyarr":' . json_encode($modulemoneyarr) . '}';
            }
		}else{
            if($do != "export") {
                echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "state0": ' . $state0 . ', "state1": ' . $state1 . '}, "totalAdd": ' . $totalAdd . ', "totalLess": ' . $totalLess .', "totalCharge": ' . $totalCharge . ',"modulemoneyarr":' . json_encode($modulemoneyarr) . '}';
            }
		}

	}else{
        if($do != "export") {
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "state0": ' . $state0 . ', "state1": ' . $state1 . '}, "totalAdd": ' . $totalAdd . ', "totalLess": ' . $totalLess .', "totalCharge": ' . $totalCharge . ',"modulemoneyarr":' . json_encode($modulemoneyarr) . '}';
        }
	}
    if($do == "export"){

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '分站'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '会员'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '信息'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '分类'));

        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";

        $filePath = $folder.iconv("utf-8","gbk//IGNORE","平台总收入.csv");
//        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach($list as $data){


            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['addrname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['username']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['info']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['amount']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['date']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['ordertype']));

            //写入文件
            fputcsv($file, $arr);
        }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = 平台总收入.csv");
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
		'admin/member/platForm.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
