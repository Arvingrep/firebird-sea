<?php
/**
 * 店铺管理 商品列表
 *
 * @version        $Id: list_list.php 2017-4-25 上午10:16:21 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "../" );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "waimaiFoodList.html";
$dbname = "waimai_list";

$id = (int)$id;
$sid = (int)$sid;

if(!empty($action) && !empty($id)){
  if(!checkWaimaiShopManager($id, "list")){
    echo '{"state": 200, "info": "操作失败，请刷新页面！"}';
    exit();
  }
}

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


//商品状态
if($action == "updateStatus"){
    if(!empty($id)){

        $val = (int)$val;

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `status` = $val WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){

            //记录用户行为日志
            memberLog($userid, 'waimai', 'detail', $id, 'update', '变更商品状态('.$id.' => '.$val.')', '', $sql);

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


//批量删除商品
if($action == "delete"){
    if(!empty($id)){

        $sql = $dsql->SetQuery("DELETE FROM `#@__$dbname` WHERE `id` in ($id)");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){

            //记录用户行为日志
            memberLog($userid, 'waimai', 'detail', $id, 'delete', '删除商品('.$id.')', '', $sql);

            dataAsync("waimai",$id,"product");  // 删除外卖商品
            echo '{"state": 100, "info": "删除成功！"}';
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


//导入商品
if($action == "import"){

    $file = $_POST['file'];
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

                    //商品分类
                    if($index == "E"){
                        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_list_type` WHERE `sid` = $sid AND `title` = '$data'");
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
                        $data = $data == "正常" ? 1 : 0;
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
                            /* 上传配置 */
                            $config = array(
                                "savePath" => "../../uploads/waimai/atlas/large/".date( "Y" )."/".date( "m" )."/".date( "d" )."/",
                                "maxSize" => $cfg_atlasSize,
                                "allowFiles" => explode("|", $cfg_atlasType)
                            );

                            global $editor_uploadDir;
                            $editor_uploadDir = "/uploads";

                            $pics = "http://img.lewaimai.com".str_replace(";", ";http://img.lewaimai.com", $data);
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

        delPicFile($file, "delFile", "waimai");
        unlinkFile(HUONIAOROOT.'/uploads'.$path);


        $sql = $dsql->SetQuery("INSERT INTO `#@__waimai_list` (`sid`, `sort`, `title`, `price`, `typeid`, `unit`, `label`, `is_dabao`, `dabao_money`, `status`, `stockvalid`, `stock`, `formerprice`, `body`, `is_nature`, `nature`, `pics`, `descript`, `pubdate`,`is_discount`,`discount_value`,`saleRec`) VALUES ".join(", ", $insertQuery));
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == 'ok'){

            //记录用户行为日志
            memberLog($userid, 'waimai', 'detail', 0, 'insert', '导入商品', '', $sql);

            $sql = $dsql->SetQuery("select `id` from `#@__waimai_list` where `sid`=$sid");
            $res = $dsql->dsqlOper($sql,"results");
            $ids = array_column($res,'id');
            dataAsync("waimai",$ids,"product"); // 批量导入
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



if(empty($sid)){
    header("location:waimaiShop.php");
    die;
}

$sql = $dsql->SetQuery("SELECT `shopname` FROM `#@__waimai_shop` WHERE `id` = $sid AND `id` in($managerIds)");
$ret = $dsql->dsqlOper($sql, "results");
if(!$ret){
    header("location:waimaiShop.php");
    die;
}
$shop = $ret[0];

$shopname = $shop['shopname'];

//验证模板文件
if(file_exists($tpl."/".$templates)){

    $sid = (int)$sid;
    $title = convertStrToPageShow($title);
    $sort = (int)$sort;
    $unit = convertStrToPageShow($unit);
    $price = (float)$price;
    $typeid = (int)$typeid;
    $typename = convertStrToPageShow($typename);
    $label = convertStrToPageShow($label);
    $saleCount = (int)$saleCount;
    $stock = (int)$stock;

    $huoniaoTag->assign('sid', (int)$sid);
    $huoniaoTag->assign('shopname', $shopname, 0, 1);
    $huoniaoTag->assign("title", $title, 0, 1);
    $huoniaoTag->assign("sort", $sort);
    $huoniaoTag->assign("unit", $unit, 0, 1);
    $huoniaoTag->assign("price", $price);
    $huoniaoTag->assign("typeid", $typeid);
    $huoniaoTag->assign("typename", $typename, 0, 1);
    $huoniaoTag->assign("label", $label, 0, 1);
    $huoniaoTag->assign("saleCount", $saleCount);
    $huoniaoTag->assign("stock", $stock);

    $typelist = array();
    $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_list_type` WHERE `sid` = $sid ORDER BY `sort` DESC, `id` DESC");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $typelist = $ret;
    }
    $huoniaoTag->assign('typelist', $typelist);



    $where = " AND s.`sid` = $sid AND s.`del` = 0";

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

    $pageSize = 15;

    $sql = $dsql->SetQuery("SELECT s.`id`, s.`sort`, s.`title`, s.`price`, s.`typeid`, s.`unit`, s.`label`, s.`status`, s.`stockvalid`, s.`stock`, s.`is_day_limitfood`, s.`is_nature`, t.`title` typename FROM `#@__$dbname` s LEFT JOIN `#@__waimai_list_type` t ON t.`id` = s.`typeid` WHERE 1 = 1".$where." ORDER BY s.`sort` DESC, `id` DESC");

    //总条数
    $totalCount = $dsql->dsqlOper($sql, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount/$pageSize);

    $p = (int)$p == 0 ? 1 : (int)$p;
    $atpage = $pageSize * ($p - 1);
    $results = $dsql->dsqlOper($sql." LIMIT $atpage, $pageSize", "results");

    $list = array();
    foreach ($results as $key => $value) {
      $list[$key]['id']               = $value['id'];
      $list[$key]['sort']             = $value['sort'];
      $list[$key]['title']            = $value['title'];
      $list[$key]['price']            = $value['price'];
      $list[$key]['typeid']           = $value['typeid'];
      $list[$key]['typename']         = $value['typename'];
      $list[$key]['unit']             = $value['unit'];
      $list[$key]['label']            = $value['label'];
      $list[$key]['status']           = $value['status'];
      $list[$key]['stockvalid']       = $value['stockvalid'];
      $list[$key]['stock']            = $value['stock'];
      $list[$key]['is_day_limitfood'] = $value['is_day_limitfood'];
      $list[$key]['is_nature']        = $value['is_nature'];
    }
    $huoniaoTag->assign("list", $list);

    $pagelist = new pagelist(array(
      "list_rows"   => $pageSize,
      "total_pages" => $totalPage,
      "total_rows"  => $totalCount,
      "now_page"    => $p
    ));
    $huoniaoTag->assign("pagelist", $pagelist->show());

    $jsFile = array(
        'shop/waimaiFoodList.js'
    );
    $huoniaoTag->assign('jsFile', $jsFile);

    $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
