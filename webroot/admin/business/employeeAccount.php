<?php
/**
 * 员工账户
 *
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("employeeAccount");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/business";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "employeeAccount.html";

$action = "staff";

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
            $where .= " or s.`uid` like '%$sKeyword%'";  // 用户ID
        }
        $where .= " or s.`staffname` like  '%$sKeyword%'"; // 员工姓名
        $where .= " or m.`nickname` like  '%$sKeyword%'"; // 昵称
        $where .= " or business.`title` like  '%$sKeyword%'"; // 昵称
        $where .= ")";
    }
    // 城市ID
    if($userType == 3){
        $where .= " AND m.`cityid` in ('$adminCityIds')";
    }
    if($cityid!=""){
        $cityid = (int)$cityid;
        $where .= " AND business.`cityid` = $cityid";
    }
    // 开始时间和结束时间
    if($start != ""){
        $where .= " AND s.`pubdate` >= ". GetMkTime($start." 00:00:00");
    }
    if($end != ""){
        $where .= " AND s.`pubdate` <= ". GetMkTime($end." 23:59:59");
    }

    // 统计sql
    $baseSql = $dsql->SetQuery("SELECT s.`id`,s.`sid`,a.`typename`,s.`uid`,s.`auth`,s.`state`,s.`staffname`,s.`jobname`,m.`nickname`,m.`username`,m.`photo`,m.`phone`,business.`title`,s.`pubdate`  FROM `#@__staff` s LEFT JOIN `#@__member` m ON s.`uid` = m.`id` LEFT JOIN `#@__business_list` business ON s.`sid` = business.`id` LEFT JOIN `#@__site_area` a ON business.`cityid`=a.`id`  WHERE 1=1 ".$where);
    //正常
    $info1 = $dsql->count($baseSql." and s.`state` = 0");
    //禁用
    $info2 = $dsql->count($baseSql." and s.`state` = 1");
    // 类型
    if ($type!=""){
        //缴纳、提现
        if ($type == 1){
            $baseSql .= " AND s.`state` =1";
        }else{
            $baseSql .= " AND s.`state` =0";
        }
    }
    // 默认排序
    $baseSql .= " order by s.`pubdate` desc";


    $pageObj =  $dsql->getPage($page,$pagestep,$baseSql);

    $results = & $pageObj['list'];
    $pageInfo = json_encode($pageObj['pageInfo']);

    $list = array();

	if(count($results) > 0){
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			// 城市信息
            $list[$key]["addrname"] = $value["typename"] ?: "未知";

			// 用户信息
			$list[$key]["userid"] = $value["uid"];
            $list[$key]["username"] = $value['nickname'] ?: "未知";

            // 员工信息
            $list[$key]["staffname"] = $value['staffname'] ?: "未知";
            $list[$key]["store"] = $value['title'] ?: "未知";
            $list[$key]['store_url'] = getUrlPath(array(
                "service" => "business",
                "template" => "detail",
                "id" => $value['sid']
            ));

			$list[$key]["type"] = $value["state"];
			$list[$key]["date"] = date('Y-m-d H:i:s', $value["pubdate"]);
			// 取得权限列表
            if($value['auth'] !='') {
                $autharr = unserialize($value['auth']);
                $infoArr = array();
                foreach ($autharr as $k => $v){
                    $infoArr[] = getModuleTitle(array('name'=>$k));
                }
                $list[$key]["info"] = join("、",$infoArr);
            }else{
                $list[$key]["info"] = "无";
            }

		}

		if(count($list) > 0){
            if($do != "export") {
                echo '{"state": 100, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": ' . $pageInfo . ', "info1": ' . json_encode($info1) . ',"info2":' . json_encode($info2) . ',"list":' . json_encode($list) . '}';
            }
		}else{
            if($do != "export"){
                echo '{"state": 200, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": ' . $pageInfo . ', "info1": ' . json_encode($info1) . ',"info2":' . json_encode($info2) . ',"list":' . json_encode($list) . '}';
            }
		}

	}else{
        if($do != "export"){
            echo '{"state": 200, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": ' . $pageInfo . ', "info1": ' . json_encode($info1) . ',"info2":' . json_encode($info2) . ',"list":' . json_encode($list) . '}';
        }
	}
    //导出数据
    $fileName = "员工账户数据记录.csv";
    if($do == "export"){

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '城市'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '会员ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '会员'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '员工姓名'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '商家店铺'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '权限管理'));
//        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '员工状态'));
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
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['userid']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['username']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['staffname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['store']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['info']));
//            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['type']==1?"正常":"停用"));
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
		adminLog("删除商店员工", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

}
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
		'admin/business/employeeAccount.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
