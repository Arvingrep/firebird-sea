<?php
/**
 * 店铺管理 新建店铺
 *
 * @version        $Id: waimaiCourierAdd.php 2017-5-26 上午11:19:16 $
 * @package        HuoNiao.Courier
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__) . "/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

checkPurview("waimaiCourier");

if ($id) {
    checkPurview("waimaiCourierEdit");
} else {
    checkPurview("waimaiCourierAdd");
}

$dbname = "waimai_courier";
$templates = "waimaiCourierAdd.html";

//表单提交
if ($submit == "保存") {

    //获取表单数据
    $id = (int)$id;
    $sex = (int)$sex;
    $quit = (int)$quit;
    $getproportion = (float)$getproportion;
    $paotuiportion = (float)$paotuiportion;
    $shopportion = (float)$shopportion;
    $name = $_POST['name'];

    if (empty($cityid)) {
        echo '{"state": 200, "info": "请选择城市"}';
        exit();
    }

    $adminCityIdsArr = explode(',', $adminCityIds);
    if (!in_array($cityid, $adminCityIdsArr)) {
        echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
        exit();
    }

    //店铺名称
    if (trim($name) == "") {
        echo '{"state": 200, "info": "请输入姓名"}';
        exit();
    }

    if (trim($age) == "") {
        echo '{"state": 200, "info": "请输入年龄"}';
        exit();
    }
    if (trim($turnnum) == "") {
        echo '{"state": 200, "info": "请输入转单次数"}';
        exit();
    }

    //用户名
    if (trim($username) == "") {
        echo '{"state": 200, "info": "请输入用户名"}';
        exit();
    }

    //密码
    if (trim($password) == "") {
        echo '{"state": 200, "info": "请输入密码"}';
        exit();
    }
    
    $validatePassword = validatePassword($password);
    if($validatePassword != 'ok'){
        echo '{"state": 200, "info": "'.$validatePassword.'"}';
        exit();
    }

    //手机号
    if (trim($phone) == "") {
        echo '{"state": 200, "info": "请输入手机号码"}';
        exit();
    }

    //验证是否存在
    if ($id) {

        if (!testPurview("waimaiCourierEdit")) {
            die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
        }

        //先验证配送员是否存在
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__$dbname` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "totalCount");
        if ($ret <= 0) {
            echo '{"state": 200, "info": "配送员不存在或已经删除！"}';
            exit();
        }

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__$dbname` WHERE (`username` = '$username' OR `phone` = '$phone') AND `id` != '$id'");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            echo '{"state": 200, "info": "配送员已经存在！"}';
            exit();
        }

    } else {

        if (!testPurview("waimaiCourierAdd")) {
            die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
        }

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__$dbname` WHERE `username` = '$username' OR `phone` = '$phone'");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            echo '{"state": 200, "info": "配送员已经存在！"}';
            exit();
        }
    }


    //修改
    if ($id) {
        $regtime = GetMkTime($regtime);
        $offtime = GetMkTime($offtime);
        if (!testPurview("waimaiSensitiveEdit")) {
            $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET
            `password`  = '$password',
            `photo`     = '$photo',
            `turnnum`   = '$turnnum'
          WHERE `id` = $id
        ");
        } else {
            $append = "";
            // 查询原来是否为离职状态，如果原本已离职
            $time = $offtime;
            $sql = $dsql->SetQuery("SELECT `quit`,`offtime` FROM `#@__waimai_courier` WHERE `id` = $id");
            $ret = $dsql->dsqlOper($sql, "results");
            $append = ",`offtime`='$time'";

            $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET
            `name`      = '$name',
            `username`  = '$username',
            `password`  = '$password',
            `phone`     = '$phone',
            `age`       = '$age',
            `sex`       = '$sex',
            `quit`      = '$quit',
            `photo`     = '$photo',
            `cityid`    = '$cityid',
            `turnnum`   = '$turnnum',
            `getproportion` = '$getproportion',
            `paotuiportion` = '$paotuiportion',
            `shopportion` = '$shopportion',
            `openid`    = '$openid',
            `IDnumber`  = '$IDnumber',
            `idCardback`    = '$idCardback',
            `idCardfront`   = '$idCardfront',
            `regtime` = '$regtime'
            $append
          WHERE `id` = $id
        ");

        }

        $ret = $dsql->dsqlOper($sql, "update");
        if ($ret == "ok") {
            echo '{"state": 100, "info": ' . json_encode("保存成功！") . '}';
        } else {
            echo '{"state": 200, "info": "数据更新失败，请检查填写的信息是否合法！"}';
        }
        die;


        //新增
    } else {

        $time = time();
        if (!testPurview("waimaiSensitiveEdit")) {
            $getproportion = 0;
            $paotuiportion = 0;
            $shopportion = 0;
        }
        //保存到主表
        $archives = $dsql->SetQuery("INSERT INTO `#@__$dbname` (
            `name`,
            `username`,
            `password`,
            `phone`,
            `age`,
            `sex`,
            `photo`,
            `cityid`,
            `turnnum`,
            `getproportion`,
            `paotuiportion`,
            `shopportion`,
            `openid`,
            `IDnumber`,
            `idCardback`,
            `idCardfront`,
            `regtime`
        ) VALUES (
            '$name',
            '$username',
            '$password',
            '$phone',
            '$age',
            '$sex',
            '$photo',
            '$cityid',
            '$turnnum',
            '$getproportion',
            '$paotuiportion',
            '$shopportion',
            '$openid',
            '$IDnumber',
            '$idCardback',
            '$idCardfront',
            '$time'
        )");
        $aid = $dsql->dsqlOper($archives, "lastid");

        if ($aid) {
            echo '{"state": 100, "id": ' . $aid . ', "info": ' . json_encode("添加成功！") . '}';
        } else {
            echo '{"state": 200, "info": "数据插入失败，请检查填写的信息是否合法！"}';
        }
        die;

    }

}
if ($dopost == 'amountList') {
    global $userLogin;
    if (!testPurview("waimaiCourierMoney")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page = $page == "" ? 1 : $page;
    $whereb = '';

    if (empty($userid) || empty($type)) {
        echo '{"state": 101, "info": ' . json_encode("格式错误！") . '}';
        die;
    }
    if ($search) {
        $whereS = " AND  `info` like  '%$search%'";
    }

    //总条数
    $archives = $dsql->SetQuery('SELECT count(*) FROM `#@__member_courier_money` WHERE 1 = 1 AND `userid` = ' . $id . $whereS);
    $totalCount = (int)$dsql->getOne($archives);
    //收入
    $sum = $dsql->SetQuery("SELECT SUM(`amount`) amount,count(`id`)id FROM `#@__member_courier_money` WHERE `type` = 1 AND `userid` = '$id'" . $whereS);
    $resultscount = $dsql->dsqlOper($sum, "results");
    $totalPrice = !empty($resultscount[0]['amount']) ? sprintf("%.2f", $resultscount[0]['amount']) : 0;
    $countPrice = !empty($resultscount[0]['id']) ? $resultscount[0]['id'] : 0;
    //支出
    $paysql = $dsql->SetQuery("SELECT SUM(`amount`)amount,count(`id`)id FROM `#@__member_courier_money` WHERE 1 = 1 AND `type` = 0  AND `cattype` = 0 AND `userid` = '$id' " . $whereS);
    $reducecount = $dsql->dsqlOper($paysql, "results");
    $totalPayPrice = !empty($reducecount[0]['amount']) ? sprintf("%.2f", $reducecount[0]['amount']) : 0;
    $countPayPrice = !empty($reducecount[0]['id']) ? $reducecount[0]['id'] : 0;
    //提现
    $archivestixian = $dsql->SetQuery("SELECT SUM(`amount`)amount,count(`id`)id FROM `#@__member_courier_money`  WHERE 1 = 1 AND  `type` = 0 AND `cattype` = 1 AND `userid` = '$id' " . $whereS);
    $counttixian = $dsql->dsqlOper($archivestixian, "results");
    $totalTiPrice = !empty($counttixian[0]['amount']) ? sprintf("%.2f", $counttixian[0]['amount']) : 0;
    $countTiPrice = !empty($counttixian[0]['id']) ? $counttixian[0]['id'] : 0;

    //总分页数【1.收入、2.支出、3.提现】
    $where = "";
    $totalPage = ceil($totalCount / $pagestep);
    if ($pay == 1) {
        $totalPage = ceil($countPrice / $pagestep);
        $where .= " and `type` = 1";
    } elseif ($pay == 2) {
        $totalPage = ceil($countPayPrice / $pagestep);
        $where .= " and `type` = 0  AND `cattype` = 0";
    } elseif ($pay == 3) {
        $totalPage = ceil($countTiPrice / $pagestep);
        $where .= " and `type` = 0 AND `cattype` = 1";
    }

    $archives = $dsql->SetQuery('SELECT * from `#@__member_courier_money` WHERE 1=1 and `userid`= '.$id . $whereS.$where . ' ORDER BY `date` DESC, `id` DESC ');

    $sql = $dsql->SetQuery("SELECT `name`,`money` FROM `#@__waimai_courier` WHERE `id` = " . $id);
    $_userinfo = $dsql->dsqlOper($sql, "results");
    $money = $_userinfo[0]['money'];
    $username = $_userinfo[0]['name'];
    $atpage = $pagestep * ($page - 1);
    $where = " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery($archives . $whereb . $where);
    $results = $dsql->dsqlOper($archives, "results");
    if (count($results) > 0) {
        $list = array();
        foreach ($results as $key => $v) {
            $list[$key]["id"] = $v["id"];
            $list[$key]["type"] = $v["type"];
            $list[$key]["date"] = date("Y-m-d H:i:s", $v["date"]);
            $list[$key]['info'] = $v['info'];
            $list[$key]['amount'] = sprintf("%.2f", $v['amount']);
            $list[$key]['balance'] = sprintf("%.2f", $v['balance']);
            $list[$key]['cattype'] = $v['cattype'];
        }

        if (count($list) > 0) {
            if ($do != "export") {
                echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ',"totalPrice": ' . $totalPrice . ',"countPrice": ' . $countPrice . ',"totalPayPrice": ' . $totalPayPrice . ',"countPayPrice": ' . $countPayPrice . ',"countTiPrice": ' . $countTiPrice . ',"totalTiPrice": ' . $totalTiPrice . ',"money": ' . $money . '}, "memberList": ' . json_encode($list) . '}';
                die;
            }
        } else {

            if ($do != "export") {
                echo '{"state": 101, "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ',"totalPrice": ' . $totalPrice . ',"countPrice": ' . $countPrice . ',"totalPayPrice": ' . $totalPayPrice . ',"countPayPrice": ' . $countPayPrice . ',"countTiPrice": ' . $countTiPrice . ',"totalTiPrice": ' . $totalTiPrice . ',"money": ' . $money . '}, "info": ' . json_encode("暂无相关信息") . '}';
                die;
            }
        }
    } else {
        if ($do != "export") {
            echo '{"state": 101, "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ',"totalPrice": ' . $totalPrice . ',"countPrice": ' . $countPrice . ',"totalPayPrice": ' . $totalPayPrice . ',"countPayPrice": ' . $countPayPrice . ',"countTiPrice": ' . $countTiPrice . ',"totalTiPrice": ' . $totalTiPrice . ',"money": ' . $money . '}, "info": ' . json_encode("暂无相关信息") . '}';
            die;
        }
    }
    if ($do == "export") {
        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '收支'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '原因'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '时间'));

        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";

        $filePath = $folder . $username . "的记录明细.csv";

        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach ($list as $data) {
            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['type'] == 1 ? "收入" : "支出"));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['amount']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['info']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['date']));
            //写入文件
            fputcsv($file, $arr);
        }

        $filename = '骑手' . $username . '的记录明细';

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = $filename.csv");
        header("Accept-ranges:bytes");
        header("Accept-length:" . filesize($filePath));
        readfile($filePath);

    }
    die;
} elseif ($dopost == 'operaAmount') {
    if (!testPurview("waimaiCourierEditMoney")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    }
    if (empty($action) || empty($userid) || $type === "" || empty($amount) || empty($info)) {
        die('{"state": 200, "info": ' . json_encode("请输入完整！") . '}');
    }
    $date = GetMkTime(time());

//    //验证权限
//    if ($userType == 3) {
//        if ($adminAreaIDs) {
//            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `cityid` in ($adminAreaIDs) AND `id` = $userid");
//            $ret = $dsql->dsqlOper($sql, "results");
//            if (!$ret) {
//                die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
//            }
//        } else {
//            die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
//        }
//    }


    //更新帐户
    $oper = "+";
    $montype = 1;
    if ($type == 0) {
        $oper = "-";
        $montype = 2;
    }

    //保存到主表
    $str = $strv = '';
    if ($action == "money") {
        $str = ', `ordertype`,`ctype`,`balance`';
        $strv = ",'member','chongzhi','0'";
    } elseif ($action == "point") {
        $str = ', `ctype`,`balance`';
        $strv = ", 'zengsong','0'";
    } else {
        $str = ',`balance`';
        $strv = ",'0'";
    }
    $archives = $dsql->SetQuery("UPDATE `#@__waimai_courier`  SET `money` = `money` " . $oper . " " . $amount . " WHERE `id` = " . $id);
    $dsql->dsqlOper($archives, "update");

    $selectmoney = $dsql->SetQuery("SELECT `money` FROM `#@__waimai_courier` WHERE `id` = '$id' ");         //查询骑手当前余额
    $courierMoney = $dsql->dsqlOper($selectmoney, "results");
    $courierMoney = $courierMoney[0]['money'];

    $archives = $dsql->SetQuery("INSERT INTO `#@__member_courier_money` (`userid`, `type`, `amount`, `info`, `date`,`balance`) VALUES ('$id', '$type', '$amount', '$info', '$date','$courierMoney')");
    $aid = $dsql->dsqlOper($archives, "lastid");

//    if ($action == "money") {
//        $archives = $dsql->SetQuery("UPDATE `#@__" . $db . "` SET `money` = `money` " . $oper . " " . $amount . " WHERE `id` = " . $userid);
//    } elseif ($action == "point") {
//        $archives = $dsql->SetQuery("UPDATE `#@__" . $db . "` SET `point` = `point` " . $oper . " " . $amount . " WHERE `id` = " . $userid);
//    } else {
//        $archives = $dsql->SetQuery("UPDATE `#@__" . $db . "`  SET `bonus` = `bonus` " . $oper . " " . $amount . " WHERE `id` = " . $userid);
//    }
//
    $title = "配送员";

    if ($aid) {

        //查询帐户信息
        $archives = $dsql->SetQuery("SELECT `username`, `money` FROM `#@__waimai_courier` WHERE `id` = " . $id);
        $results = $dsql->dsqlOper($archives, "results");

        //用户名
        $username = $results[0]['username'];
        $money = $results[0]['money'];
        $archive = $dsql->SetQuery("UPDATE `#@__waimai_courier` SET `money` = $money WHERE `id` = " . $aid);
        $dsql->dsqlOper($archive, "update");
//        if ($action == "money") {
//            $archive = $dsql->SetQuery("UPDATE `#@__" . $db . "_" . $action . "`  SET `balance` = $money  WHERE `id` = " . $aid);
//        } elseif ($action == "point") {
//            $archive = $dsql->SetQuery("UPDATE `#@__member_point` SET `balance` = $point WHERE `id` = " . $aid);
//        } else {
//            $archive = $dsql->SetQuery("UPDATE `#@__member_bonus` SET `balance` = $bonus WHERE `id` = " . $aid);
//        }
//

        //会员中心交易记录页面链接
        if ($action == "money") {
            if ($mtype == 2) {
                $param = array(
                    "service" => "member",
                    "type" => "user",
                    "template" => "record"
                );
            } else {
                $param = array(
                    "service" => "member",
                    "type" => "user",
                    "template" => "record"
                );
            }

            //会员中心积分记录页面链接
        } else {
            if ($mtype == 2) {
                $param = array(
                    "service" => "member",
                    "type" => "user",
                    "template" => "point"
                );
            } else {
                $param = array(
                    "service" => "member",
                    "type" => "user",
                    "template" => "point"
                );
            }
        }

        //余额
        if ($action == "money") {

            //自定义配置
            $config = array(
                "username" => $username,
                "amount" => $oper . $amount,
                "money" => $money,
                "date" => date("Y-m-d H:i:s", $date),
                "info" => $info,
                "fields" => array(
                    'keyword1' => '变动类型',
                    'keyword2' => '变动金额',
                    'keyword3' => '变动时间',
                    'keyword4' => '帐户余额'
                )
            );

//            updateMemberNotice($userid, "会员-帐户资金变动提醒", $param, $config);
        }
        adminLog("新增会员帐户" . $title . "操作记录", $type . "=>" . $amount . "=>" . $info);

        echo '{"state": 100, "info": ' . json_encode("操作成功！") . ', "money": ' . $results[0]['money'] . '}';
    } else {
        die('{"state": 200, "info": ' . json_encode("操作失败！") . '}');
    }
    die;
//删除操作记录
} elseif ($dopost == "delAmount") {

    if (!testPurview("waimaiCourierDelMoney")) {
        die('{"state": 101, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    }

    $title = "配送员";

    //验证权限
//	if($userType == 3){
//        if($adminAreaIDs){
//            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `cityid` in ($adminAreaIDs) AND `id` = $userid");
//            $ret = $dsql->dsqlOper($sql, "results");
//            if(!$ret){
//                die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
//            }
//        }else{
//            die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
//        }
//    }

    if ($action != "") {
//        $archives = $dsql->SetQuery("DELETE FROM `#@__member_courier_money` WHERE `id` = ".$id);

        // $archives = $dsql->SetQuery("DELETE FROM `#@__waimai_order_all`  WHERE 1=1 AND `state` = 1 AND `peisongid` = '$peisongid'  UNION ALL  DELETE  FROM `#@__paotui_order`  WHERE 1=1 AND `state` = 1 AND `peisongid` = '$peisongid' UNION ALL DELETE  FROM `#@__member_withdraw`  WHERE 1=1 AND `uid` = '$peisongid' AND `usertype` = 1 UNION ALL DELETE FROM `#@__member_courier_money`  WHERE 1=1 AND `userid` = '$peisongid'");

        $archives = $dsql->SetQuery(" DELETE FROM `#@__member_courier_money`  WHERE 1=1 AND `userid` = '$peisongid'");
        $results = $dsql->dsqlOper($archives, "update");
        if (!$results) {
            echo '{"state": 200, "info": "删除失败"}';
            die;
        } else {
            adminLog("清空" . $title . "操作记录", $id);
            echo '{"state": 100, "info": ' . json_encode("删除成功！") . '}';
            die;
        }
    } else {
        $each = explode(",", $id);
        $error = array();
        if ($id != "") {
            foreach ($each as $val) {
                $archives = $dsql->SetQuery(" DELETE FROM `#@__member_courier_money`  WHERE 1=1 AND `userid` = '$peisongid' AND `id` = '$val'");
                $results = $dsql->dsqlOper($archives, "update");
                if ($results != "ok") {
                    $error[] = $val;
                }
            }
            if (!empty($error)) {
                echo '{"state": 200, "info": ' . json_encode($error) . '}';
            } else {
                adminLog("删除" . $title . "余额记录", $val);
                echo '{"state": 100, "info": ' . json_encode("删除成功！") . '}';
                die;
            }
        }
    }
    die;

}


//验证模板文件
if (file_exists($tpl . "/" . $templates)) {

    //css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/bootstrap1.css',
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

//         'admin/app.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/jquery-ui.min.js',
        'ui/jquery.form.js',
        'ui/jquery.dragsort-0.5.1.min.js',
        'ui/chosen.jquery.min.js',
        'ui/jquery-ui-i18n.min.js',
        'ui/jquery-ui-timepicker-addon.js',
        'ui/chosen.jquery.min.js',
        'publicUpload.js',
        'admin/waimai/waimaiCourierAdd.js',
//		'ui/jquery-ui-selectable.js',
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));

    //获取信息内容
    if ($id) {
        $sql = $dsql->SetQuery("SELECT * FROM `#@__$dbname` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {

            foreach ($ret[0] as $key => $value) {
                if ($key == 'cityid') {
                    $cityname = getSiteCityName($value);
                    $huoniaoTag->assign('cityname', $cityname);
                }

                $huoniaoTag->assign($key, $value);
            }

        } else {
            showMsg("没有找到相关信息！", "-1");
            die;
        }
    } else {
        $huoniaoTag->assign('cityid', (int)$cityid);
    }


    $inc = HUONIAOINC . "/config/waimai.inc.php";
    include $inc;
    $huoniaoTag->assign('waimaiCourierP', (float)$customwaimaiCourierP);
    $huoniaoTag->assign('paotuiCourierP', (float)$custompaotuiCourierP);
    $shopinc = HUONIAOINC . "/config/shop.inc.php";
    include $shopinc;
    $huoniaoTag->assign('shopCourierP', (float)$custom_shopCourierP);

    $huoniaoTag->assign('waimaiSensitiveEdit', testPurview("waimaiSensitiveEdit"));
    $huoniaoTag->assign('waimaiCourierMoney', testPurview("waimaiCourierMoney"));

    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}
