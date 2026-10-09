<?php
/**
 * 店铺管理 店铺列表
 *
 * @version        $Id: list.php 2017-4-25 上午10:16:21 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', ".." );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

checkPurview("waimaiFencheng");

$dbname = "waimai_shop";
$templates = "waimaiFencheng.html";


// 快速编辑
if($action == "fastedit"){
  if(empty($type) || $type == "id" || empty($id) || $val == "") echo '{"state": 200, "info": "参数错误！"}';

  if($type != "shopname" && $type != "sort") echo '{"state": 200, "info": "操作错误！"}';

  if($type == "shopname"){
    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__$dbname` WHERE `shopname` = '$val' AND `id` != '$id'");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
      die('{"state": 200, "info": "店铺名称已经存在！"}');
    }
  }

  $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `$type` = '$val' WHERE `id` = $id");
  // echo $sql;die;
  $ret = $dsql->dsqlOper($sql, "update");
  if($ret == "ok"){
    die('{"state": 100, "info": "修改成功！"}');
  }else{
    die('{"state": 200, "info": "修改失败！"}');
  }
}

$where = getCityFilter('`cityid`');

if ($cityid) {
    $where .= getWrongCityFilter('`cityid`', $cityid);
    $huoniaoTag->assign('cityid', $cityid);
}

//店铺名称
if(!empty($shopname)){
  $where .= " AND s.`shopname` like ('%$shopname%')";
}

//店铺分类
if(!empty($typeid)){
  $reg = "(^$typeid$|^$typeid,|,$typeid,|,$typeid)";
  $where .= " AND s.`typeid` REGEXP '".$reg."' ";
}

//店铺分类
if(!empty($typename)){
  if(is_numeric($typename) && empty($typeid)){
    $reg = "(^$typename$|^$typename,|,$typename,|,$typename)";
    $where .= " AND s.`typeid` REGEXP '".$reg."' ";
  }else{
    $where .= " AND t.`title` like '%$typename%'";
  }
}

//配送费最低
if(!empty($min_deliver)){
    if(is_numeric($min_deliver)){
        $s_min_deliver = 100-$min_deliver;
        $where .= " and s.`fencheng_delivery`<=$s_min_deliver";
    }
}
$huoniaoTag->assign("min_deliver",$min_deliver);
//配送费最高
if(!empty($max_deliver)){
    if(is_numeric($max_deliver)){
        $_max_deliver = 100-$max_deliver;
        $where .= " and s.`fencheng_delivery`>=$_max_deliver";
    }
}
$huoniaoTag->assign("max_deliver",$max_deliver);
//打包费最低
if(!empty($min_dabao)){
    if(is_numeric($min_dabao)){
        $s_min_dabao = 100-$min_dabao;
        $where .= " and s.`fencheng_dabao`<=$s_min_dabao";
    }
}
$huoniaoTag->assign("min_dabao",$min_dabao);
//打包费最高
if(!empty($max_dabao)){
    if(is_numeric($max_dabao)){
        $s_max_dabao = 100-$max_dabao;
        $where .= " and s.`fencheng_dabao`>=$s_max_dabao";
    }
}
$huoniaoTag->assign("max_dabao",$max_dabao);
//增值费最低
if(!empty($min_addservice)){
    if(is_numeric($min_addservice)){
        $s_min_addservice = 100-$min_addservice;
        $where .= " and s.`fencheng_addservice`<=$s_min_addservice";
    }
}
$huoniaoTag->assign("min_addservice",$min_addservice);
//增值费最高
if(!empty($max_addservice)){
    if(is_numeric($max_addservice)){
        $s_max_addservice = 100-$max_addservice;
        $where .= " and s.`fencheng_addservice`>=$s_max_addservice";
    }
}
$huoniaoTag->assign("max_addservice",$max_addservice);
//商品原价最低
if(!empty($min_foodprice)){
    if(is_numeric($min_foodprice)){
        $s_min_foodprice = 100-$min_foodprice;
        $where .= " and s.`fencheng_foodprice`<=$s_min_foodprice";
    }
}
$huoniaoTag->assign("min_foodprice",$min_foodprice);
//商品原价最高
if(!empty($max_foodprice)){
    if(is_numeric($max_foodprice)){
        $s_max_foodprice = 100-$max_foodprice;
        $where .= " and s.`fencheng_foodprice`>=$s_max_foodprice";
    }
}
$huoniaoTag->assign("max_foodprice",$max_foodprice);
$pageSize = 30;

$sql = $dsql->SetQuery("SELECT s.`cityid`, s.`id`, s.`shopname`, s.`fencheng_foodprice`, s.`fencheng_delivery`, s.`fencheng_dabao`, s.`fencheng_addservice`, s.`fencheng_discount`, s.`fencheng_promotion`, s.`fencheng_firstdiscount`, s.`fencheng_zsb`,s.`fencheng_offline`, s.`fencheng_quan` FROM `#@__$dbname` s LEFT JOIN `#@__waimai_shop_type` t ON t.`id` in (s.`typeid`) WHERE s.`del` = 0".$where." ORDER BY s.`sort` DESC, `id` DESC");

//echo $sql;die;
//总条数
$totalCount = $dsql->dsqlOper($sql, "totalCount");
//总分页数
$totalPage = ceil($totalCount/$pageSize);

$p = (int)$p == 0 ? 1 : (int)$p;
$atpage = $pageSize * ($p - 1);
if ($do != "export") {
  $sql = $sql." LIMIT $atpage, $pageSize";
}
$results = $dsql->dsqlOper($sql, "results");

$list = array();
foreach ($results as $key => $value) {
  $list[$key]['id']                   = $value['id'];
  $list[$key]['shopname']             = $value['shopname'];
  $list[$key]['fencheng_foodprice']   = $value['fencheng_foodprice'];
  $list[$key]['fencheng_delivery']    = $value['fencheng_delivery'];
  $list[$key]['fencheng_dabao']       = $value['fencheng_dabao'];
  $list[$key]['fencheng_addservice']  = $value['fencheng_addservice'];
  $list[$key]['fencheng_discount']    = $value['fencheng_discount'];
  $list[$key]['fencheng_promotion']   = $value['fencheng_promotion'];
  $list[$key]['fencheng_firstdiscount']   = $value['fencheng_firstdiscount'];
  $list[$key]['fencheng_offline']     = $value['fencheng_offline'];
  $list[$key]['fencheng_quan']        = $value['fencheng_quan'];
  $list[$key]['fencheng_zsb']         = $value['fencheng_zsb'];
  $cityname                           = getSiteCityName($value['cityid']);
  $list[$key]['cityname'] = $cityname;

  // 分类名
  $typeArr = array();
  $typeids = explode(",", $value['typeid']);
  foreach ($typeids as $k => $val) {
    if($val){
      $typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__waimai_shop_type` WHERE `id` = ". $val);
      $type = $dsql->getTypeName($typeSql);
      array_push($typeArr, $type[0]['title']);
    }
  }
  $list[$key]['typename'] = join(" > ", $typeArr);

  $param = array(
      "service"  => "waimai",
      "template" => "shop",
      "id"       => $value['id']
  );
  $list[$key]['url'] = getUrlPath($param);
}

$huoniaoTag->assign("shopname", $shopname);
$huoniaoTag->assign("typename", $typename);

$huoniaoTag->assign("list", $list);

$pagelist = new pagelist(array(
  "list_rows"   => $pageSize,
  "total_pages" => $totalPage,
  "total_rows"  => $totalCount,
  "now_page"    => $p
));
$huoniaoTag->assign("pagelist", $pagelist->show());

$huoniaoTag->assign('city', $adminCityArr);


if($do == "export"){

    $tablename = (empty($cityname) ? "全部店铺" : $cityname) . "店铺分成";
    $tablename = (empty($shopname) ? "全部店铺" : $shopname) . "店铺分成";
    $tablename = iconv("UTF-8", "GB2312//IGNORE", $tablename);

    include HUONIAOROOT.'/include/class/PHPExcel/PHPExcel.php';
    include HUONIAOROOT.'/include/class/PHPExcel/PHPExcel/Writer/Excel2007.php';
    //或者include 'PHPExcel/Writer/Excel5.php'; 用于输出.xls 的
    // 创建一个excel
    $objPHPExcel = new PHPExcel();

    // Set document properties
    $objPHPExcel->getProperties()->setCreator("Phpmarker")->setLastModifiedBy("Phpmarker")->setTitle("Phpmarker")->setSubject("Phpmarker")->setDescription("Phpmarker")->setKeywords("Phpmarker")->setCategory("Phpmarker");

    $objPHPExcel->setActiveSheetIndex(0)
    ->setCellValue('A1', '城市')
    ->setCellValue('B1', '店铺名称')
    ->setCellValue('C1', '配送费')
    ->setCellValue('D1', '打包(餐盒)费')
    ->setCellValue('E1', '增值服务费')
    ->setCellValue('F1', '商品原价')
    ->setCellValue('G1', '折扣')
    ->setCellValue('H1', '满减')
    ->setCellValue('I1', '优惠卷')
    ->setCellValue('J1', '首单减免');


    // 表名
    $tabname = "外卖营业额统计";
    $objPHPExcel->getActiveSheet()->setTitle($tabname);

    // 将活动表索引设置为第一个表，因此Excel将作为第一个表打开此表
    $objPHPExcel->setActiveSheetIndex(0);
    // 所有单元格默认高度
    $objPHPExcel->getActiveSheet()->getDefaultRowDimension()->setRowHeight(15);
    // 冻结窗口
    $objPHPExcel->getActiveSheet()->freezePane('A2');

    // 从第二行开始
    $row = 2;

    $total = $delivery = $money = $online = $dabao = $peisong = $fuwu = $shoudan = $youhuiquan = 0;
    foreach($list as $data){
      $objPHPExcel->getActiveSheet()->setCellValue("A".$row, $data['cityname']);
      $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $data['shopname']);
      $objPHPExcel->getActiveSheet()->setCellValue("C".$row, "商家:".(100-(int)$data['fencheng_delivery'])."%,平台:".(int)$data['fencheng_delivery']."%");
      $objPHPExcel->getActiveSheet()->setCellValue("D".$row, "商家:".(100-(int)$data['fencheng_dabao'])."%,平台:".(int)$data['fencheng_dabao']."%");
      $objPHPExcel->getActiveSheet()->setCellValue("E".$row, "商家:".(100-(int)$data['fencheng_addservice'])."%,平台:".(int)$data['fencheng_addservice']."%");
      $objPHPExcel->getActiveSheet()->setCellValue("F".$row, "商家:".(100-(int)$data['fencheng_foodprice'])."%,平台:".(int)$data['fencheng_foodprice']."%");
      $objPHPExcel->getActiveSheet()->setCellValue("G".$row, "商家:".(100-(int)$data['fencheng_discount'])."%,平台:".(int)$data['fencheng_discount']."%");
      $objPHPExcel->getActiveSheet()->setCellValue("H".$row, "商家:".(100-(int)$data['fencheng_promotion'])."%,平台:".(int)$data['fencheng_promotion']."%");
      $objPHPExcel->getActiveSheet()->setCellValue("I".$row, "商家:".(100-(int)$data['fencheng_quan'])."%,平台:".(int)$data['fencheng_quan']."%");
      $objPHPExcel->getActiveSheet()->setCellValue("J".$row, "商家:".(100-(int)$data['fencheng_firstdiscount'])."%,平台:".(int)$data['fencheng_firstdiscount']."%");
      $row++;

      // $total += $data['total'];
      // $delivery += $data['delivery'];
      // $money += $data['money'];
      // $online += $data['online'];
      // $dabao += $data['dabao'];
      // $peisong += $data['peisong'];
      // $fuwu += $data['fuwu'];
      // $shoudan += $data['shoudan'];
      // $youhuiquan += $data['youhuiquan'];
    }

    // $objPHPExcel->getActiveSheet()->setCellValue("A".$row, "总计");
    // $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $total);
    // $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $delivery);
    // $objPHPExcel->getActiveSheet()->setCellValue("D".$row, $money);
    // $objPHPExcel->getActiveSheet()->setCellValue("E".$row, $online);
    // $objPHPExcel->getActiveSheet()->setCellValue("F".$row, $dabao);
    // $objPHPExcel->getActiveSheet()->setCellValue("G".$row, $peisong);
    // $objPHPExcel->getActiveSheet()->setCellValue("H".$row, $fuwu);
    // $objPHPExcel->getActiveSheet()->setCellValue("I".$row, $shoudan);
    // $objPHPExcel->getActiveSheet()->setCellValue("J".$row, $youhuiquan);

    $objActSheet = $objPHPExcel->getActiveSheet();

    // 列宽
    $objPHPExcel->getActiveSheet()->getColumnDimension()->setAutoSize(true);

    $filename = $tablename."__".$lastMonthDate."__".$nowDate.".csv";
    ob_end_clean();//清除缓冲区,避免乱码
    header('Content-Type: application/vnd.ms-excel');
    header('Content-Disposition: attachment;filename="'.$filename.'"');
    $objWriter = new PHPExcel_Writer_Excel5($objPHPExcel);
    $objWriter->save('php://output');
    die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

    //css
	$cssFile = array(
		'admin/jquery-ui.css',
		'admin/styles.css',
        'ui/jquery.chosen.css',
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
        'ui/chosen.jquery.min.js',
		'admin/waimai/waimaiFencheng.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign( 'defaultWaiMaiFenCheng', testPurview("defaultWaiMaiFenCheng"));

    $huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
