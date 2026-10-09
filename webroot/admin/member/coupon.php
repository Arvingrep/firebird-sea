<?php
/**
 * 充值卡记录
 *
 * @version        $Id: coupon.php 2015-11-11 上午09:37:12 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("coupon");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$templates = "coupon.html";

$action = "moneycoupon";

if($dopost == "getList" || $do == "export"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	

	$where = "";

	//关键词
	if(!empty($sKeyword)){
		// $where1 = array();

		// $userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `username` like '%$sKeyword%'");
		// $userResult = $dsql->dsqlOper($userSql, "results");
		// if($userResult){
		// 	$userid = array();
		// 	foreach($userResult as $key => $user){
		// 		array_push($userid, $user['id']);
		// 	}
		// 	if(!empty($userid)){
		// 		$where1[] = "a.`userid` in (".join(",", $userid).")";
		// 	}
		// }

		// $where .= " AND (".join(" OR ", $where1).")";
		$where .= " AND `code` LIKE '%$sKeyword%'";

	}

	if($start != ""){
		$where .= " AND a.`time` >= ". GetMkTime($start." 00:00:00");
	}

	if($end != ""){
		$where .= " AND a.`time` <= ". GetMkTime($end." 23:59:59");
	}

	$archives = $dsql->SetQuery("SELECT a.`id` FROM `#@__".$action."` a WHERE 1 = 1".$where);

	//未使用
	$state0 = $dsql->dsqlOper($archives.$where." AND a.`state` = 0", "totalCount");
	//已使用
	$state1 = $dsql->dsqlOper($archives.$where." AND a.`state` > 0", "totalCount");

    //未使用
    $add = $dsql->SetQuery("SELECT SUM(a.`amount`) AS amount FROM `#@__".$action."` a  WHERE a.`state` = 0".$where);
    $totalAdd = $dsql->dsqlOper($add, "results");
    $totalAdd = (float)$totalAdd[0]['amount'];

    //已使用
    $less = $dsql->SetQuery("SELECT SUM(a.`amount`) AS amount FROM `#@__".$action."` a  WHERE a.`state` = 1".$where);
    $totalLess = $dsql->dsqlOper($less, "results");
    $totalLess = (float)$totalLess[0]['amount'];
//	if($do == "export"){
//		$pagestep = $state0;
//	}

	//类型
	if($type == '0'){
		$where .= " AND a.`date` = 0";
	}elseif($type == '1'){
		$where .= " AND a.`date` > 0";
	}

	$where .= " order by a.`id` desc";

    $pagestep = $pagestep == 0 ? 1 : $pagestep;
	//总条数
	$totalCount = $dsql->dsqlOper($archives, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	if($type != ""){

		if($type == '0'){
			$totalPage = ceil($state0/$pagestep);
		}elseif($type == '1'){
			$totalPage = ceil($state1/$pagestep);
		}

	}

	

	$atpage = $pagestep*($page-1);
	if($do != "export"){

        $where .= " LIMIT $atpage, $pagestep";
    }
	$archives = $dsql->SetQuery("SELECT a.`id`, a.`code`, a.`amount`, a.`expire`, a.`state`, a.`time`, a.`uid`, a.`note`, a.`date`, m.`username` FROM `#@__".$action."` a LEFT JOIN `#@__member` m ON m.`id` = a.`uid` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	$list = array();

	if(count($results) > 0){
		foreach ($results as $key=>$value) {
			$list[$key]['id'] = $value['id'];
		    $list[$key]['code'] = $value['code'];
		    $list[$key]['amount'] = $value['amount'];
		    $list[$key]['expire'] = date("Y-m-d", $value['expire']);
		    $list[$key]['state'] = $value['state'];
		    $list[$key]['stateVal'] = $value['state'] == 0 ? "未使用" : ($value['state'] == 1 ? "已使用" : "已过期");
		    $list[$key]['time'] = date("Y-m-d H:i:s", $value['time']);
		    $list[$key]['uid'] = $value['uid'];
		    $list[$key]['note'] = $value['note'];
		    $list[$key]['date'] = $value['date'] ? date("Y-m-d H:i:s", $value['date']) : "";

		    $list[$key]['username'] = $value['username'] ? $value['username'] : "";

		}

		

		if(count($list) > 0){
			if($do != "export"){
				echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "totalAdd": '.$totalAdd.', "totalLess": '.$totalLess.'}, "list": '.json_encode($list).'}';
			}
		}else{
			if($do != "export"){
				echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "totalAdd": '.$totalAdd.', "totalLess": '.$totalLess.'}}';
			}		
		}

	}else{
		if($do != "export"){
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "totalAdd": '.$totalAdd.', "totalLess": '.$totalLess.'}}';
		}
	}

	if($do == "export"){

		$tablename = $bonusName;
		$tablename = iconv("UTF-8", "GB2312//IGNORE", $tablename);

		/* include HUONIAOROOT.'/include/class/PHPExcel/PHPExcel.php';
		include HUONIAOROOT.'/include/class/PHPExcel/PHPExcel/Writer/Excel2007.php';
		//或者include 'PHPExcel/Writer/Excel5.php'; 用于输出.xls 的
		// 创建一个excel
		$objPHPExcel = new PHPExcel();

		// Set document properties
		$objPHPExcel->getProperties()->setCreator("Phpmarker")->setLastModifiedBy("Phpmarker")->setTitle("Phpmarker")->setSubject("Phpmarker")->setDescription("Phpmarker")->setKeywords("Phpmarker")->setCategory("Phpmarker");

		$objPHPExcel->setActiveSheetIndex(0)
		->setCellValue('A1', '充值卡号')
		->setCellValue('B1', '金额')
		->setCellValue('C1', '过期时间')
		->setCellValue('D1', '状态')
		->setCellValue('E1', '生成时间')
		->setCellValue('F1', '使用会员')
		->setCellValue('G1', '使用时间');


		// 表名
		$tabname = "充值卡统计";
		$objPHPExcel->getActiveSheet()->setTitle($tabname);

		// 将活动表索引设置为第一个表，因此Excel将作为第一个表打开此表
		$objPHPExcel->setActiveSheetIndex(0);
		// 所有单元格默认高度
		$objPHPExcel->getActiveSheet()->getDefaultRowDimension()->setRowHeight(15);
		// 冻结窗口
		$objPHPExcel->getActiveSheet()->freezePane('A2');

		// 从第二行开始
		$row = 2;

		$total = 0;
		$use = 0; */
		set_time_limit(30);
		//ini_set('memory_limit', '128M');
		$fileName = date('Y-m-d H:i:s', time()).'--'.$bonusName;
		$fileName = iconv("UTF-8", "GB2312//IGNORE", $fileName);
	    header('Content-Type: application/vnd.ms-execl');
		header('Content-Disposition: attachment;filename="' . $fileName . '.csv"');
		
		$fp = fopen('php://output', 'a');
		$title = array('密码', '金额', '过期时间', '状态', '生成时间', '使用时间', '使用会员');
		foreach($title as $key => $item) {
				$title[$key] = iconv('UTF-8', 'GBK', $item);
		}
		//将标题写到标准输出中
		fputcsv($fp, $title);
		
		
		foreach($list as $key=>$data){
			unset($data['id']);
			unset($data['uid']);
			unset($data['stateVal']);
			unset($data['note']);

			$username = iconv('UTF-8', 'GBK//IGNORE', $data['username']);
			$data['username'] = iconv('UTF-8', 'GBK//IGNORE', $username);

			$stateVal = $data['state'] == 0 ? '未使用': '已使用';
			$data['state'] = iconv('UTF-8', 'GBK//IGNORE', $stateVal);

			fputcsv($fp, $data);
		  /* $objPHPExcel->getActiveSheet()->setCellValue("A".$row, $data['code']);
		  $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $data['amount']);
		  $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $data['expire']);
		  $objPHPExcel->getActiveSheet()->setCellValue("D".$row, $data['state'] == 0 ? '未使用': '已使用');
		  $objPHPExcel->getActiveSheet()->setCellValue("E".$row, $data['time']);
		  $objPHPExcel->getActiveSheet()->setCellValue("F".$row, $data['username']);
		  $objPHPExcel->getActiveSheet()->setCellValue("G".$row, $data['date']);
		  $row++;

		  $total += $data['amount'];
		  if($data['state'] == 1){
		  	$use++;
		  } */
		}
		fclose($fp);

        adminLog("导出".$bonusName, "");
		die;

		/* $objPHPExcel->getActiveSheet()->setCellValue("A".$row, "总计");
		$objPHPExcel->getActiveSheet()->setCellValue("B".$row, $total);
		$objPHPExcel->getActiveSheet()->setCellValue("C".$row, "");
		$objPHPExcel->getActiveSheet()->setCellValue("D".$row, "");
		$objPHPExcel->getActiveSheet()->setCellValue("E".$row, "");
		$objPHPExcel->getActiveSheet()->setCellValue("F".$row, $use);
		$objPHPExcel->getActiveSheet()->setCellValue("G".$row, "");

		$objActSheet = $objPHPExcel->getActiveSheet(); */

		// 列宽
		/* $objPHPExcel->getActiveSheet()->getColumnDimension()->setAutoSize(true);

		$filename = $tablename."__".$start."__".$end.".csv";
		ob_end_clean();//清除缓冲区,避免乱码
		header('Content-Type: application/vnd.ms-excel');
		header('Content-Disposition: attachment;filename="'.$filename.'"');
		$objWriter = new PHPExcel_Writer_Excel5($objPHPExcel);
		$objWriter->save('php://output'); 
		die;*/
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
		adminLog("删除".$bonusName, $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

}

//导入商品
if($dopost == "import"){

    $file = $_POST['file'];



    /* 引入系统参数 */
    global $cfg_ftpUrl;
    global $cfg_fileUrl;
    global $cfg_uploadDir;
    global $cfg_ftpType;
    global $cfg_ftpState;
    global $cfg_ftpDir;
    global $cfg_quality;
    global $cfg_softSize;
    global $cfg_softType;
    global $cfg_editorSize;
    global $cfg_editorType;
    global $cfg_videoSize;
    global $cfg_videoType;
    global $cfg_meditorPicWidth;
    global $editorMarkState;

    $cfg_softType = explode("|", $cfg_softType);
    $cfg_editorType = explode("|", $cfg_editorType);
    $cfg_videoType = explode("|", $cfg_videoType);

    $editor_fileUrl = $cfg_ftpUrl;
    $editor_uploadDir = $cfg_uploadDir;
    $cfg_uploadDir = "/../.." . $cfg_uploadDir;
    $editor_ftpState = $cfg_ftpState;
    $editor_ftpDir = $cfg_ftpDir;
    $cfg_photoCutType = "scale_width";
    $editor_ftpType = $cfg_ftpType;

    global $customUpload;
    global $custom_uploadDir;
    global $customFtp;
    global $custom_ftpType;
    global $custom_ftpState;
    global $custom_ftpDir;
    global $custom_ftpServer;
    global $custom_ftpPort;
    global $custom_ftpUser;
    global $custom_ftpPwd;
    global $custom_ftpDir;
    global $custom_ftpUrl;
    global $custom_ftpTimeout;
    global $custom_ftpSSL;
    global $custom_ftpPasv;
    global $custom_OSSUrl;
    global $custom_OSSBucket;
    global $custom_EndPoint;
    global $custom_OSSKeyID;
    global $custom_OSSKeySecret;
    global $custom_QINIUAccessKey;
    global $custom_QINIUSecretKey;
    global $custom_QINIUbucket;
    global $custom_QINIUdomain;

    //默认FTP帐号
    if ($customFtp == 0) {
        $custom_ftpState = $cfg_ftpState;
        $custom_ftpType = $cfg_ftpType;
        $custom_ftpSSL = $cfg_ftpSSL;
        $custom_ftpPasv = $cfg_ftpPasv;
        $custom_ftpUrl = $cfg_ftpUrl;
        $custom_ftpServer = $cfg_ftpServer;
        $custom_ftpPort = $cfg_ftpPort;
        $custom_ftpDir = $cfg_ftpDir;
        $custom_ftpUser = $cfg_ftpUser;
        $custom_ftpPwd = $cfg_ftpPwd;
        $custom_ftpTimeout = $cfg_ftpTimeout;
        $custom_OSSUrl = $cfg_OSSUrl;
        $custom_OSSBucket = $cfg_OSSBucket;
        $custom_EndPoint = $cfg_EndPoint;
        $custom_OSSKeyID = $cfg_OSSKeyID;
        $custom_OSSKeySecret = $cfg_OSSKeySecret;
        $custom_QINIUAccessKey = $cfg_QINIUAccessKey;
        $custom_QINIUSecretKey = $cfg_QINIUSecretKey;
        $custom_QINIUbucket = $cfg_QINIUbucket;
        $custom_QINIUdomain = $cfg_QINIUdomain;
    }

    global $thumbMarkState;
    global $atlasMarkState;
    global $editorMarkState;
    global $waterMarkWidth;
    global $waterMarkHeight;
    global $waterMarkPostion;
    global $waterMarkType;
    global $waterMarkText;
    global $markFontfamily;
    global $markFontsize;
    global $markFontColor;
    global $markFile;
    global $markPadding;
    global $markTransparent;
    global $markQuality;

    $markConfig = array(
        "thumbMarkState" => $thumbMarkState,
        "atlasMarkState" => $atlasMarkState,
        "editorMarkState" => $editorMarkState,
        "waterMarkWidth" => $waterMarkWidth,
        "waterMarkHeight" => $waterMarkHeight,
        "waterMarkPostion" => $waterMarkPostion,
        "waterMarkType" => $waterMarkType,
        "waterMarkText" => $waterMarkText,
        "markFontfamily" => $markFontfamily,
        "markFontsize" => $markFontsize,
        "markFontColor" => $markFontColor,
        "markFile" => $markFile,
        "markPadding" => $markPadding,
        "markTransparent" => $markTransparent,
        "markQuality" => $markQuality
    );

    if ($modelType != "siteConfig") {
        global $customMark;
        global $custom_thumbMarkState;
        global $custom_atlasMarkState;
        global $custom_editorMarkState;
        global $custom_waterMarkWidth;
        global $custom_waterMarkHeight;
        global $custom_waterMarkPostion;
        global $custom_waterMarkType;
        global $custom_waterMarkText;
        global $custom_markFontfamily;
        global $custom_markFontsize;
        global $custom_markFontColor;
        global $custom_markFile;
        global $custom_markPadding;
        global $custom_markTransparent;
        global $custom_markQuality;

        if ($customMark == 1) {
            $markConfig = array(
                "thumbMarkState" => $custom_thumbMarkState,
                "atlasMarkState" => $custom_atlasMarkState,
                "editorMarkState" => $custom_editorMarkState,
                "waterMarkWidth" => $custom_waterMarkWidth,
                "waterMarkHeight" => $custom_waterMarkHeight,
                "waterMarkPostion" => $custom_waterMarkPostion,
                "waterMarkType" => $custom_waterMarkType,
                "waterMarkText" => $custom_waterMarkText,
                "markFontfamily" => $custom_markFontfamily,
                "markFontsize" => $custom_markFontsize,
                "markFontColor" => $custom_markFontColor,
                "markFile" => $custom_markFile,
                "markPadding" => $custom_markPadding,
                "markTransparent" => $custom_markTransparent,
                "markQuality" => $custom_markQuality
            );
        }
    }

    if ($customUpload == 1 && $custom_ftpState == 1) {
        $editor_fileUrl = $custom_ftpUrl;
        $editor_uploadDir = $custom_uploadDir;
        $editor_ftpDir = $custom_ftpDir;
    }
    //普通FTP模式
    if ($customFtp == 1 && $custom_ftpType == 0 && $custom_ftpState == 1) {
        $editor_ftpType = 0;
        $editor_ftpState = 1;

        //阿里云OSS
    } elseif ($customFtp == 1 && $custom_ftpType == 1) {
        $editor_ftpType = 1;
        $editor_ftpState = 0;

        //七牛云
    } elseif ($customFtp == 1 && $custom_ftpType == 2) {
        $editor_ftpType = 2;
        $editor_ftpState = 0;

        //本地
    } elseif ($customFtp == 1 && $custom_ftpType == 0 && $custom_ftpState == 0) {
        $editor_ftpType = 3;
        $editor_ftpState = 0;

    }



    if(empty($file)){
        echo '{"state": 200, "info": "参数传递失败，请刷新页面重试！"}';
        exit();
    }

    $RenrenCrypt = new RenrenCrypt();
    $fid = $RenrenCrypt->php_decrypt(base64_decode($file));

    if(is_numeric($fid)){
        $archives = $dsql->SetQuery("SELECT `path` FROM `#@__attachment` WHERE `id` = " . $fid);
    }else{
        $archives = $dsql->SetQuery("SELECT `path` FROM `#@__attachment` WHERE `path` = '$file'");
    }
    $results = $dsql->dsqlOper($archives, "results");
    if($results){

        set_time_limit(600);

        $path = $results[0]['path'];

        //验证文件
        if(!file_exists(HUONIAOROOT . '/uploads' . $path)){
            /* 下载文件 */
            $httpdown = new httpdown();
            $httpdown->OpenUrl(getFilePath($file)); # 远程文件地址
            $httpdown->SaveToBin(HUONIAOROOT . '/uploads' . $path); # 保存路径及文件名
            $httpdown->Close(); # 释放资源
        }

        //利用php读取excel数据
        require HUONIAOINC.'/class/PHPExcel/PHPExcel/IOFactory.php';
        $objPHPExcelReader = PHPExcel_IOFactory::load(HUONIAOROOT.'/uploads'.$path);  //加载excel文件

        //循环读取sheet
        $dataQuery = array();
        foreach($objPHPExcelReader->getWorksheetIterator() as $sheet){
            //逐行处理
            foreach($sheet->getRowIterator() as $row){
                //确定从哪一行开始读取
                if($row->getRowIndex()<2){
                    continue;
                }

                //逐列读取
                $dataArr = array();
                foreach($row->getCellIterator() as $index => $cell){
                    $data = $cell->getValue(); //获取cell中数据

                    $data = explode("|", $data)[0];

                    //过期时间
                    if($index == "C"){
                        $data = $data != "" ? strtotime($data) :  '';
                    }


                    array_push($dataArr, $data);
                }

                array_push($dataQuery, $dataArr);
            }

        }
        $insertQuery = array();
        $_time = time();
        foreach ($dataQuery as $key => $value) {

            $code   = $value[0];
            $amount = $value[1];
            $expire = $value[2];

            if($code!=''&&$amount!=''){
                array_push($insertQuery, "('$code', '$amount', '$expire', '0', '".GetMkTime(time())."')");
            }
        }
        delPicFile($file, "delFile", "siteConfig", true);
        unlinkFile(HUONIAOROOT.'/uploads'.$path);


        $sql = $dsql->SetQuery("INSERT INTO `#@__moneycoupon` (`code`, `amount`, `expire`, `state`, `time`) VALUES ".join(", ", $insertQuery));
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == 'ok'){
            adminLog("导入".$bonusName, "");
            echo '{"state": 100, "info": "导入成功！"}';
        }else{
            echo '{"state": 200, "info": "数据插入失败，请重试！"}';
        }

    }else{
        echo '{"state": 200, "info": "文件读取失败，请重试上传！"}';
        exit();
    }
    die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//css
	$cssFile = array(
	  'ui/jquery.chosen.css',
	  'admin/chosen.min.css',
	);
	$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/chosen.jquery.min.js',
        'ui/jquery.ajaxFileUpload.js',
		'admin/member/coupon.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
