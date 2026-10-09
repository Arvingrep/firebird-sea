<?php
/**
 * 店铺管理 商品列表
 *
 * @version        $Id: list_list.php 2017-4-25 上午10:16:21 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
ini_set('max_execution_time','0');
define('HUONIAOADMIN', "../" );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "waimaiFoodList.html";
$dbname = "waimai_list";

checkPurview("waimaiList");

//库存状态
if($action == "updateStockStatus"){
    if(!empty($id)){

        $val = (int)$val;

        if($val == 1){
            $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `stockvalid` = $val, `stock` = 0 WHERE `id` = $id");
        }else{
            $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `stockvalid` = $val WHERE `id` = $id");
        }
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){
            dataAsync("waimai",$id,"product");  // 外卖商品、更新库存
            echo '{"state": 100, "info": "更新成功！"}';
    		exit();
        }else{
            echo '{"state": 200, "info": "更新失败！"}';
    		exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
		exit();
    }
}


//审核价格
if($action == "reviewPrice"){
    if(!empty($id)){

        $state = (int)$state;

        //审核通过
        if($state){
            $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `price` = `review_price`, `review_price` = 0 WHERE `id` = $id");
        }
        //拒绝
        else{
            $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `review_price` = 0 WHERE `id` = $id");
        }
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){
            dataAsync("waimai",$id,"product");  // 外卖商品、更新状态
            echo '{"state": 100, "info": "更新成功！"}';
    		exit();
        }else{
            echo '{"state": 200, "info": "更新失败！"}';
    		exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
		exit();
    }
}


//商品状态
if($action == "updateStatus"){
    if(!empty($id)){

        $val = (int)$val;

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `status` = $val WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){
            dataAsync("waimai",$id,"product");  // 外卖商品、更新状态
            echo '{"state": 100, "info": "更新成功！"}';
    		exit();
        }else{
            echo '{"state": 200, "info": "更新失败！"}';
    		exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
		exit();
    }
}


//自定义属性状态
if($action == "updateNatureStatus"){
    if(!empty($id)){

        $val = (int)$val;

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `is_nature` = $val WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){
            dataAsync("waimai",$id,"product");  // 外卖商品、自定义属性
            echo '{"state": 100, "info": "更新成功！"}';
    		exit();
        }else{
            echo '{"state": 200, "info": "更新失败！"}';
    		exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
		exit();
    }
}


//优惠推荐
if($action == "updateSaleState"){
    if(!empty($id)){

        $val = (int)$val;

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `saleRec` = $val WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){
            dataAsync("waimai",$id,"product");  // 外卖商品、优惠推荐
            echo '{"state": 100, "info": "更新成功！"}';
    		exit();
        }else{
            echo '{"state": 200, "info": "更新失败！"}';
    		exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
		exit();
    }
}





//导入商品
if($action == "import"){

  $sid = $_POST['sid'];
  $file = $_POST['file'];




  /* 引入系统参数 */
  require_once(HUONIAOINC . "/config/waimai.inc.php");

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



    if(empty($sid) || empty($file)){
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

    //附件路径存储方式为性能优先模式时，传过来的$file是带http的
    if(!$results && !is_numeric($fid) && strstr($file, 'http')){
        $fileArr = parse_url($file);
        $file = $fileArr['path'];
        $archives = $dsql->SetQuery("SELECT `path` FROM `#@__attachment` WHERE `path` = '$file'");
        $results = $dsql->dsqlOper($archives, "results");
    }

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

                    // $data = explode("|", $data)[0];
                    //商品分类
                    if($index == "E"){
                        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_list_type` WHERE `sid` = $sid AND `title` = '$data' AND `del` = 0");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if($ret){
                            $data = $ret[0]['id'];
                        }else{
                            $data = 0;
                        }
                    }

                    //库存状态
                    if($index == "H"){
                        $data = $data == "关闭" ? 0 : 1;
                    }

                    //商品状态
                    if($index == "J"){
                        $data = $data !== "停售" ? 1 : 0;
                    }

                    //是否开启商品属性
                    if($index == "K"){
                        $data = $data == "关闭" ? 0 : 1;
                    }

                    //商品属性
                    if($index == "L"){

                        $nature = array();

                        if(!empty($data)){
                            $dataArr_ = explode("|", $data);
                            foreach ($dataArr_ as $key => $value) {

                                $dataInfo = explode(":", $value);
                                $title = explode("-", $dataInfo[0]);
                                $info = explode(",", $dataInfo[1]);

                                $infoArr = array();
                                foreach ($info as $k => $v) {
                                    $d = explode("&", $v);
                                    array_push($infoArr, array(
                                        "value" => $d[0],
                                        "price" => $d[1]
                                    ));
                                }

                                array_push($nature, array(
                                    "name" => $title[0],
                                    "data" => $infoArr
                                ));
                            }
                        }
                        $data = serialize($nature);



                    }


                    //商品图片
                    if($index == "M"){

                        global $cfg_atlasSize;
                        global $cfg_atlasType;
                        $picArr = array();

                        if(!empty($data)){

							//远程图片
							if(strstr($data, 'http')){
	                            /* 上传配置 */
	            				$config = array(
	            				    "savePath" => "../../uploads/waimai/atlas/large/".date( "Y" )."/".date( "m" )."/".date( "d" )."/",
	            				    "maxSize" => $cfg_atlasSize,
	            				    "allowFiles" => explode("|", $cfg_atlasType)
	            				);

	                            global $editor_uploadDir;
	                            $editor_uploadDir = "/uploads";

	                            $pics = $data;
	                            $photoArr = getRemoteImage(explode(";", $pics), $config, "waimai", "../..", false);

	            				if($photoArr){
	            					$photoArr = json_decode($photoArr, true);
	            					if(is_array($photoArr) && $photoArr['state'] == "SUCCESS"){
	            						foreach($photoArr['list'] as $key => $val){
	                                        if($val['state'] == "SUCCESS" && $val['fid']){
	                                            array_push($picArr, $val['fid']);
	                                        }
	                                    }
	            					}
	            				}
							}else{
								$picArr = explode(";", $data);
							}
                        }

                        $data = join(",", $picArr);

                    }

                    //是否开启打包费
                    if($index == "O"){
                        $data = $data == "关闭" ? 0 : 1;
                    }

                    //是否开启折扣
                    if($index == "R"){
                        $data = $data == "关闭" ? 0 : 1;
                    }

                    //是否开启优惠推荐
                    if($index == "T"){
                        $data = $data == "关闭" ? 0 : 1;
                    }


                    array_push($dataArr, $data);
                }

                array_push($dataQuery, $dataArr);
            }

        }

        $insertQuery = array();
		$_time = time();
        foreach ($dataQuery as $key => $value) {
            $sort = (int)$value[0];
            $title = $value[1];
            $unit = $value[2];
            $price = $value[3];
            $typeid = $value[4];
            $label = $value[5];
            $body = addslashes($value[6]);
            $stockvalid = $value[7];
            $stock = (int)$value[8];
            $status = $value[9];
            $is_nature = $value[10];
            $nature = $value[11];
            $pics = $value[12];
            $formerprice = (float)$value[13];
            $is_dabao = $value[14];
            $dabao_money = (float)$value[15];
            $descript = $value[16];
            $is_discount = $value[17];
            $discount_value = $value[18];
            $saleRec = $value[19];

            array_push($insertQuery, "('$sid', '$sort', '$title', '$price', '$typeid', '$unit', '$label', '$is_dabao', '$dabao_money', '$status', '$stockvalid', '$stock', '$formerprice', '$body', '$is_nature', '$nature', '$pics', '$descript', '$_time','$is_discount','$discount_value','$saleRec')");
        }

        delPicFile($file, "delFile", "waimai", true);
        unlinkFile(HUONIAOROOT.'/uploads'.$path);


        $sql = $dsql->SetQuery("INSERT INTO `#@__waimai_list` (`sid`, `sort`, `title`, `price`, `typeid`, `unit`, `label`, `is_dabao`, `dabao_money`, `status`, `stockvalid`, `stock`, `formerprice`, `body`, `is_nature`, `nature`, `pics`, `descript`, `pubdate`,`is_discount`,`discount_value`,`saleRec`) VALUES ".join(", ", $insertQuery));
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == 'ok'){
            $sql2 = $dsql->SetQuery("select `id` from `#@__waimai_list` where `sid`=$sid");
            $res2 = $dsql->dsqlOper($sql2,"results");
            $ids2 = array_column($res2,'id');
            dataAsync("waimai",$ids2,"product"); // 批量导入商品
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

// 快速编辑
if($action == "fastedit"){
    if(empty($type) || $type == "id" || empty($id) || $val == ""){
        echo '{"state": 200, "info": "参数错误！"}';
        die;
    }
    // if($type != "sort"){
    //     echo '{"state": 200, "info": "操作错误！"}';
    //     die;
    // }


  if($type == "title"){
    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__$dbname` WHERE `title` = '$val' AND `id` != '$id'");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
      die('{"state": 200, "info": "商品名称已经存在！"}');
    }
  }

  $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `$type` = '$val' WHERE `id` = $id");
  $ret = $dsql->dsqlOper($sql, "update");
  if($ret == "ok"){
    dataAsync("waimai",$id,"product");  // 外卖商品、快速编辑
    die('{"state": 100, "info": "修改成功！"}');
  }else{
    die('{"state": 200, "info": "修改失败！"}');
  }
}

//删除商品-移入回收站
if($action == "delete"){
    if(!empty($id)){


        if(strstr($id, ",")){
            $id_ = explode(",", $id)[0];
            $logtitle = '批量删除商品-移入回收站';
        }else{
            $id_ = $id;
            $logtitle = '删除商品-移入回收站';
        }
        $sql = $dsql->SetQuery("SELECT t.`title`, p.`title` typename, s.`shopname` FROM `#@__$dbname` t LEFT JOIN `#@__waimai_list_type` p ON p.`id` = t.`typeid` LEFT JOIN `#@__waimai_shop` s ON s.`id` = t.`sid` WHERE t.`id` = $id_");
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
          echo '{"state": 100, "info": "商品不存在！"}';
          exit();
        }
        $foodname = $ret[0]['title'];
        $typename = $ret[0]['typename'];
        $shopname = $ret[0]['shopname'];

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `del` = 1 WHERE `id` in ($id)");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){
            echo '{"state": 100, "info": "删除成功！"}';
            dataAsync("waimai",$id,"product");  // 外卖商品删除
            adminLog($logtitle, $shopname.">".$typename.">".$id."-".$foodname);
            exit();
        }else{
            echo '{"state": 200, "info": "删除失败！"}';
            exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}

if($action == "destory"){

    if(!empty($id)){

        if(strstr($id, ",")){
            $id_ = explode(",", $id)[0];
            $logtitle = '批量删除商品-彻底删除';
        }else{
            $id_ = $id;
            $logtitle = '删除商品-彻底删除';
        }
        $sql = $dsql->SetQuery("SELECT t.`title`, p.`title` typename, s.`shopname` FROM `#@__$dbname` t LEFT JOIN `#@__waimai_list_type` p ON p.`id` = t.`typeid` LEFT JOIN `#@__waimai_shop` s ON s.`id` = t.`sid` WHERE t.`id` = $id_");
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            echo '{"state": 100, "info": "商品不存在！"}';
            exit();
        }
        $foodname = $ret[0]['title'];
        $typename = $ret[0]['typename'];
        $shopname = $ret[0]['shopname'];

        $sql = $dsql->SetQuery("DELETE FROM `#@__$dbname` WHERE `id` in ($id)");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){
            echo '{"state": 100, "info": "删除成功！"}';

            adminLog($logtitle, $shopname.">".$typename.">".$id."-".$foodname);
            exit();
        }else{
            echo '{"state": 200, "info": "删除失败！"}';
            exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }

}

//从回收站恢复分类
if($action == "recycleback"){
    if(!empty($id)){

        $sql = $dsql->SetQuery("SELECT t.`title`, p.`title` typename, s.`shopname` FROM `#@__$dbname` t LEFT JOIN `#@__waimai_list_type` p ON p.`id` = t.`typeid` LEFT JOIN `#@__waimai_shop` s ON s.`id` = t.`sid` WHERE t.`id` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
          echo '{"state": 100, "info": "商品不存在！"}';
          exit();
        }
        $foodname = $ret[0]['title'];
        $typename = $ret[0]['typename'];
        $shopname = $ret[0]['shopname'];

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `del` = 0 WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){
            echo '{"state": 100, "info": "恢复成功！"}';
            dataAsync("waimai",$id,"product");   // 外卖商品从回收站恢复
            adminLog("从回收站恢复商品", $shopname.">".$typename.">".$id."-".$foodname);
            exit();
        }else{
            echo '{"state": 200, "info": "恢复失败！"}';
            exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}


/*商品一键提价*/

if($action == "priceincrease"){

    if(!empty($sid)){
        if(substr($amount, 0, 1) == '-'){
            $amount = substr($amount, 1);

            $amountv = (float)$amount/100;

            if(!empty($amount)){

                $updatepricesql = $dsql->SetQuery("UPDATE `#@__waimai_list` SET `price` = `price` - (`price` * $amountv) WHERE `sid` = '$sid'");
            }
        }else{

            $amountv = (float)$amount/100;

            $updatepricesql = $dsql->SetQuery("UPDATE `#@__waimai_list` SET `price` = `price` + `price` * $amountv WHERE `sid` = '$sid'");

        }
        $ret = $dsql->dsqlOper($updatepricesql, "update");
        if($ret == "ok"){
            $sql = $dsql->SetQuery("select `id` from `#@__waimai_list` where `sid`=$sid");
            $res = $dsql->dsqlOper($sql,"results");
            $ids = array_column($res,'id');
            dataAsync("waimai",$ids,"product"); // 批量提价、降价
            echo '{"state": 100, "info": "更新成功！"}';
            exit();

        }else{
            echo '{"state": 200, "info": "更新失败！"}';
            exit();
        }
    }
}

if(empty($sid)){
    header("location:list.php?v=1");
    die;
}

$sql = $dsql->SetQuery("SELECT `shopname` FROM `#@__waimai_shop` WHERE `id` = $sid");
$ret = $dsql->dsqlOper($sql, "results");
if(!$ret){
    header("location:/404.php");
    die;
}
$shop = $ret[0];

$shopname = $shop['shopname'];



//验证模板文件
if(file_exists($tpl."/".$templates)){


    //css
	$cssFile = array(
		'admin/jquery-ui.css',
		'admin/styles.css',
		'admin/chosen.min.css',
		'admin/ace-fonts.min.css',
		'admin/select.css',
		'admin/ace.min.css',
		'admin/animate.css',
		'admin/font-awesome.min.css',
		'admin/simple-line-icons.css',
		'admin/font.css',
		// 'admin/app.css'
	);
	$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

    //js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.ajaxFileUpload.js',
		'admin/waimai/waimaiFoodList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));



    $huoniaoTag->assign('sid', (int)$sid);
    $huoniaoTag->assign('shopname', $shopname);
    $huoniaoTag->assign("title", $title);
    $huoniaoTag->assign("sort", (int)$sort);
    $huoniaoTag->assign("unit", $unit);
    $huoniaoTag->assign("price", $price);
    $huoniaoTag->assign("typeid", $typeid);
    $huoniaoTag->assign("typename", $typename);
    $huoniaoTag->assign("label", $label);
    $huoniaoTag->assign("saleCount", (int)$saleCount);
    $huoniaoTag->assign("stock", (int)$stock);

    $typelist = array();
    $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_list_type` WHERE `del` = 0 AND `sid` = $sid ORDER BY `sort` DESC, `id` DESC");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $typelist = $ret;
    }
    $huoniaoTag->assign('typelist', $typelist);


    $del = empty($del) ? 0 : 1;
    $huoniaoTag->assign('isdel', $del);

    $where = " AND s.`del` = $del AND s.`sid` = $sid AND (t.`del` = 0 OR ISNULL(t.`id`))";

    //商品名称
    if(!empty($title)){
      $where .= " AND s.`title` like ('%$title%')";
    }

    //编号
    if(!empty($sort)){
      $where .= " AND s.`sort` = '$sort'";
    }

    //单位
    if(!empty($unit)){
      $where .= " AND s.`unit` like ('%$unit%')";
    }

    //价格
    if(!empty($price)){
      $where .= " AND s.`price` = $price";
    }

    //分类id
    if(!empty($typeid)){
      $where .= " AND s.`typeid` = $typeid";
    }

    //分类
    if(!empty($typename)){
      $where .= " AND t.`title` like ('%$typename%')";
    }

    //标签
    if(!empty($label)){
      $where .= " AND s.`label` like ('%$label%')";
    }

    //库存
    if(!empty($stock)){
      $where .= " AND s.`stock` = $stock";
    }

    //审核中的价格
    if($reviewPrice){
        $where .= " AND s.`review_price` != 0";
    }

    $pageSize = 15;

    $sql = $dsql->SetQuery("SELECT s.`id`, s.`sort`, s.`title`, s.`price`, s.`review_price`, s.`typeid`, s.`unit`, s.`label`, s.`status`, s.`stockvalid`, s.`stock`, s.`is_day_limitfood`, s.`is_nature`, s.`saleRec`, t.`title` typename FROM `#@__$dbname` s LEFT JOIN `#@__waimai_list_type` t ON t.`id` = s.`typeid` WHERE 1 = 1".$where." ORDER BY s.`sort` DESC, `id` DESC");


    //总条数
    $totalCount = $dsql->dsqlOper($sql, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount/$pageSize);

    $p = (int)$p == 0 ? 1 : (int)$p;
    $atpage = $pageSize * ($p - 1);
    $results = $dsql->dsqlOper($sql." LIMIT $atpage, $pageSize", "results");

    // 统计销量
    $foodSale = array();
    $sql = $dsql->SetQuery("SELECT `food` FROM `#@__waimai_order_all` WHERE `sid` = $sid AND `state` = 1");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach ($ret as $a => $val) {
            $food = $val['food'];
            $food = unserialize($food);
            if(!empty($food) && is_array($food)){
              foreach ($food as $k => $v) {
                  $foodSale[$v['id']] = isset($foodSale[$v['id']]) ? ($foodSale[$v['id']] + $v['count']) : $v['count'];
              }
            }
        }
    }

    $list = array();
    foreach ($results as $key => $value) {
      $list[$key]['id']               = $value['id'];
      $list[$key]['sort']             = $value['sort'];
      $list[$key]['title']            = $value['title'];
      $list[$key]['price']            = (float)$value['price'];
      $list[$key]['review_price']     = (float)$value['review_price'];
      $list[$key]['typeid']           = $value['typeid'];
      $list[$key]['typename']         = $value['typename'];
      $list[$key]['unit']             = $value['unit'];
      $list[$key]['label']            = $value['label'];
      $list[$key]['status']           = $value['status'];
      $list[$key]['stockvalid']       = $value['stockvalid'];
      $list[$key]['stock']            = $value['stock'];
      $list[$key]['is_day_limitfood'] = $value['is_day_limitfood'];
      $list[$key]['is_nature']        = $value['is_nature'];
      $list[$key]['saleRec']        = $value['saleRec'];

      $list[$key]['sale'] = isset($foodSale[$value['id']]) ? $foodSale[$value['id']] : 0;


    }
    $huoniaoTag->assign("list", $list);

    $pagelist = new pagelist(array(
      "list_rows"   => $pageSize,
      "total_pages" => $totalPage,
      "total_rows"  => $totalCount,
      "now_page"    => $p
    ));
    $huoniaoTag->assign("pagelist", $pagelist->show());

    $huoniaoTag->assign('reviewPrice', (int)$reviewPrice);


    $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
