<?php
/**
 * 资金沉淀记录
 *
 * @version        $Id: moneyLogs.php 2022-03-29 下午 13:29:12 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2022, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("courierMoneyLogs");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "courierMoneyLogs.html";

if($dopost == "getList"){

    global $installModuleArr;
    if(!in_array('waimai', $installModuleArr)){
        echo '{"state": 101, "pageInfo": {"totalPage": 0, "totalCount": 0,"totalPrice": 0,"countPrice": 0,"totalPayPrice": 0,"countPayPrice": 0,"countTiPrice": 0,"totalTiPrice": 0,"money": 0}, "info": ' . json_encode("暂无相关信息") . '}';die;
    }

    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    if ($search!="") {
        $search = trim($search);
        $whereS = " AND  (m.`info` like  '%$search%' or c.`name` like '%$search%')";
    }

    //城市
    if($cityid!=""){
        $whereS = " and c.`cityid` = $cityid";
    }

    //城市管理员，只能管理管辖城市的会员
    if($userType == 3){
        $whereS = " AND c.`cityid` in ('$adminCityIds')";
    }

    //开始时间、结束时间
    if($start!=""){
        $whereS .= " and m.`date`>=".strtotime($start);
    }
    if($end!=""){
        $whereS .= " and m.`date`<=".strtotime($end);
    }

    //总条数
    $archives   = $dsql->SetQuery('SELECT count(m.`id`) FROM `#@__waimai_courier` c left join `#@__member_courier_money` m on c.`id`=m.`userid` WHERE 1 = 1 '.$whereS);
    $totalCount = (int)$dsql->getOne($archives);

    //总收入
    $sum = $dsql->SetQuery("SELECT SUM(m.`amount`) amount,count(m.`id`)id FROM `#@__waimai_courier` c left join `#@__member_courier_money` m on c.`id`=m.`userid` WHERE m.`type` = 1 ".$whereS);
    $resultscount = $dsql->dsqlOper($sum, "results");

    $totalPrice = !empty($resultscount[0]['amount']) ? sprintf("%.2f",$resultscount[0]['amount']) : 0;                       //收入总额
    $countPrice = !empty($resultscount[0]['id'])? $resultscount[0]['id'] : 0;                         //收入数量

    //支出总额
    $paysql = $dsql->SetQuery("SELECT SUM(m.`amount`) amount,count(m.`id`)id FROM `#@__waimai_courier` c left join `#@__member_courier_money` m on c.`id`=m.`userid` WHERE 1 = 1 AND m.`type` = 0  AND m.`cattype` = 0 ".$whereS);
    $reducecount = $dsql->dsqlOper($paysql, "results");

    $totalPayPrice = !empty($reducecount[0]['amount'])? sprintf("%.2f",$reducecount[0]['amount']) : 0;
    $countPayPrice = !empty($reducecount[0]['id']) ? $reducecount[0]['id'] : 0;                                  //支出数量

    //提现总额
    $archivestixian = $dsql->SetQuery("SELECT SUM(m.`amount`) amount,count(m.`id`)id FROM `#@__waimai_courier` c left join `#@__member_courier_money` m on c.`id`=m.`userid` WHERE 1 = 1 AND  m.`type` = 0 AND m.`cattype` = 1 ".$whereS);
    $counttixian = $dsql->dsqlOper($archivestixian, "results");

    $totalTiPrice =  !empty($counttixian[0]['amount']) ? sprintf("%.2f",$counttixian[0]['amount']) : 0;                       //提现总额
    $countTiPrice = !empty($counttixian[0]['id']) ? $counttixian[0]['id']: 0;             //提现数量

    //总分页数
    $atpage = $pagestep * ($page - 1);

    //pay【1.支出、2.收入、3.提现】
    $totalPage = ceil($totalCount / $pagestep);
    $where = "";
    if($pay!=""){
        if($pay==1){
            $totalPage = ceil($countPayPrice / $pagestep);
            $where .= " and m.`type`=0 and m.`cattype`=0";
        }
        elseif($pay==2){
            $totalPage = ceil($countPrice / $pagestep);
            $where .= " and m.`type`=1";
        }
        elseif($pay==3){
            $totalPage = ceil($countTiPrice / $pagestep);
            $where .= " and m.`type`=0 and m.`cattype`=1";
        }
    }
    $where .= " order by `date` desc LIMIT $atpage, $pagestep";

    $money = 0;

    //列表
    $archives   = $dsql->SetQuery("SELECT m.*,c.`name` 'username',c.`cityid` FROM `#@__member_courier_money` m left join `#@__waimai_courier` c on c.`id`=m.`userid` WHERE 1 = 1 and c.`id`>0".$whereS.$where);

    $results = $dsql->dsqlOper($archives, "results");
    if (count($results) > 0) {
        $list = array();
        foreach ($results as $key => $v) {
            $list[$key]["id"] = $v["id"];
            $list[$key]["type"] = $v["type"];
            $list[$key]["cattype"] = $v["cattype"];
            $list[$key]["date"] = date("Y-m-d H:i:s", $v["date"]);
            $list[$key]['info']        = $v['info'];
            $list[$key]['amount']      = sprintf("%.2f",$v['amount']);
            $list[$key]['balance']      = sprintf("%.2f",$v['balance']);

            //查询cityid和cityname
            $list[$key]['cityid'] = $v['cityid'];
            //查询城市名称
            $sql = $dsql::SetQuery("select `typename` from `#@__site_area` where `id`={$v['cityid']}");
            $cityName = $dsql->getOne($sql) ?: "未知";
            $list[$key]['cityname'] = $cityName;

            //查询外卖员的姓名
            $list[$key]['username'] = $v['username'];
        }

        if (count($list) > 0) {
            if ($do != "export") {
                echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ',"totalPrice": ' . $totalPrice . ',"countPrice": ' . $countPrice . ',"totalPayPrice": ' . $totalPayPrice . ',"countPayPrice": ' . $countPayPrice . ',"countTiPrice": ' . $countTiPrice . ',"totalTiPrice": ' . $totalTiPrice . ',"money": ' . $money . '}, "memberList": ' . json_encode($list) . '}';die;
            }
        } else {

            if ($do != "export") {
                echo '{"state": 101, "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ',"totalPrice": ' . $totalPrice . ',"countPrice": ' . $countPrice . ',"totalPayPrice": ' . $totalPayPrice . ',"countPayPrice": ' . $countPayPrice . ',"countTiPrice": ' . $countTiPrice . ',"totalTiPrice": ' . $totalTiPrice . ',"money": ' . $money . '}, "info": ' . json_encode("暂无相关信息") . '}';die;
            }
        }
    } else {
        if ($do != "export") {
            echo '{"state": 101, "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ',"totalPrice": ' . $totalPrice . ',"countPrice": ' . $countPrice . ',"totalPayPrice": ' . $totalPayPrice . ',"countPayPrice": ' . $countPayPrice . ',"countTiPrice": ' . $countTiPrice . ',"totalTiPrice": ' . $totalTiPrice . ',"money": ' . $money . '}, "info": ' . json_encode("暂无相关信息") . '}';die;
        }
    }
    if ($do == "export") {
        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '分站'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '姓名'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '收支'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '原因'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '时间'));

        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";

        $filePath = $folder . "配送员收入记录数据.csv";

        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach ($list as $data) {
            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['cityname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['username']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['type'] == 1 ? "收入" : ( $data['cattype'] ==1 ? '提现' : '支出' )));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['amount']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['info']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['date']));
            //写入文件
            fputcsv($file, $arr);
        }

        $filename = '配送员收入记录数据';

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = $filename.csv");
        header("Accept-ranges:bytes");
        header("Accept-length:" . filesize($filePath));
        readfile($filePath);

    }
    die;
}elseif($dopost == "delAmount"){
    if (!testPurview("waimaiCourierDelMoney")) {
        die('{"state": 101, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    }

    $each = explode(",",$id);
    $error = array();
    if($id != ""){
        foreach($each as $val){
            $archives = $dsql->SetQuery(" DELETE FROM `#@__member_courier_money`  WHERE 1=1 AND `id` = '$val'");
            $results = $dsql->dsqlOper($archives, "update");
            if($results != "ok" ){
                $error[] = $val;
            }
        }
        if(!empty($error)){
            echo '{"state": 200, "info": '.json_encode($error).'}';
        }else{
            adminLog("删除配送员余额记录", $val);
            echo '{"state": 100, "info": '.json_encode("删除成功！").'}';die;
        }
    }
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
        'admin/member/courierMoneyLogs.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
    $huoniaoTag->assign('source', $source);
    $huoniaoTag->assign('sKeyword', $sKeyword);
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
