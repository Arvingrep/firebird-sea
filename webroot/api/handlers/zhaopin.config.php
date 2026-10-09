<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 招聘模块公共配置文件
 *
 * @version        $Id: zhaopin.config.php 2024-12-16 下午16:46:23 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2050, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

//公司类型
$zhaopin_propertyList = array(
    1 => '民营',
    2 => '外商独资',
    3 => '国企',
    4 => '合资',
    5 => '股份制企业',
    6 => '上市公司',
    7 => '国家机关',
    8 => '事业单位',
    9 => '其他'
);

//公司规模
$zhaopin_scaleList = array(
    1 => '0-49人',
    2 => '50-99人',
    3 => '100-500人',
    4 => '500人以上'
);

//客户价值
$zhaopin_customerValueList = array(
    1 => '低价值客户',
    2 => '中价值客户',
    3 => '高价值客户'
);

//客户状态
$zhaopin_customerStatusList = array(
    1 => '新客户',
    2 => '初步接触',
    3 => '意向客户',
    4 => '准成交客户',
    5 => '无意向客户',
    6 => '会员成交客户',
    7 => '会员到期未续费',
    8 => '成交非会员',
    9 => '无效客户'
);

//订单类型 1:名企会员 2:认证会员 3:职位推荐 4:超级推荐 5:简历点 6:推广金 7:职位刷新 8:职位发布 9:简历推荐 10:补单 11:面试短信 12:招聘会报名
$zhaopin_orderTypeList = array(
    1 => '名企会员',
    2 => '认证会员',
    3 => '职位推荐',
    4 => '超级推荐',
    5 => '简历点',
    6 => '推广金',
    7 => '职位刷新',
    8 => '职位发布',
    9 => '简历推荐',
    10 => '补单',
    11 => '面试短信',
    12=> '招聘会报名'
);

//学历要求 1:初中 2:高中及中专 3:大专 4:本科 5:硕士以上
$zhaopin_educationList = array(
    1 => '初中',
    2 => '高中及中专',
    3 => '大专',
    4 => '本科',
    5 => '硕士以上'
);

//经验要求 1:应届毕业生 2:一年 3:1-3年 4:3-5年 5:5-8年 6:8年以上
$zhaopin_experienceList = array(
    1 => '应届毕业生',
    2 => '一年',
    3 => '1-3年',
    4 => '3-5年',
    5 => '5-8年',
    6 => '8年以上'
);

//薪资范围
$zhaopin_salaryList = array(
    1 => '1000元以下',
    2 => '1000-1999元',
    3 => '2000-2999元',
    4 => '3000-4999元',
    5 => '5000-7999元',
    6 => '8000-11999元',
    7 => '12000-19999元',
    8 => '20000以上',
);

//职位福利
$zhaopin_welfareList = array(
    1 => '社保',
    2 => '公积金',
    3 => '周末双休',
    4 => '包吃',
    5 => '包住',
    6 => '餐补',
    7 => '房补',
    8 => '交通补助',
    9 => '电话补助',
    10 => '加班补助',
    11 => '年终奖',
    12 => '带薪年假',
    13 => '全勤奖',
    14 => '团建',
    15 => '带薪培训',
    16 => '节日福利',
    17 => '8小时工作',
    18 => '环境好',
    19 => '不加班',
    20 => '弹性工作',
    21 => '晋升空间',
    22 => '员工旅游',
    23 => '生日福利',
    24 => '包午餐',
    25 => '包晚餐',
    26 => '低价员工餐',
    27 => '员工宿舍'
);

//个人亮点
$zhaopin_advantageList = array(
    1 => '沟通能力强',
    2 => '执行力强',
    3 => '学习力强',
    4 => '有亲和力',
    5 => '诚信正直',
    6 => '责任心强',
    7 => '雷厉风行',
    8 => '沉稳内敛',
    9 => '阳光开朗',
    10 => '人脉广',
    11 => '善于创新',
    12 => '有创业经历'
);

//兼职薪资单位
$zhaopin_partPost_salaryTypeList = array(
    1 => '元/天',
    2 => '元/时',
    3 => '元/次'
);

//兼职结算方式
$zhaopin_partPost_settlementList = array(
    1 => '日结',
    2 => '周结',
    3 => '月结',
    4 => '完工结算'
);

//简历中求职状态
$zhaopin_resume_workSateList = array(
    1 => '离职，快速到岗',
    2 => '在职，月内到岗',
    3 => '在职，考虑机会',
    4 => '暂时不找工作'
);

//根据最小薪资和最大薪资匹配薪资范围
if (!function_exists('getSalaryRange')){
    function getSalaryRange($min_salary, $max_salary) {
        global $zhaopin_salaryList;
        $matchingRanges = [];

        foreach ($zhaopin_salaryList as $key => $range) {
            // 如果薪资范围是类似"1000-1999元"的格式
            if (preg_match('/(\d+)-(\d+)/', $range, $matches)) {
                $range_min = (int) $matches[1];  // 最小值
                $range_max = (int) $matches[2];  // 最大值

                // 判断给定的薪资范围是否与当前薪资区间有交集
                if (($min_salary >= $range_min && $min_salary <= $range_max) || 
                    ($max_salary >= $range_min && $max_salary <= $range_max) ||
                    ($min_salary <= $range_min && $max_salary >= $range_max)) {
                    $matchingRanges[] = $key;
                }
            }
            // 如果薪资范围是类似"1000元以下"的格式
            elseif (preg_match('/(\d+)元以下/', $range, $matches)) {
                $range_max = (int) $matches[1];  // 最大值

                // 判断最小薪资是否小于等于当前范围的最大值
                if ($min_salary <= $range_max) {
                    $matchingRanges[] = $key;
                }
            }
            // 如果薪资范围是类似"20000以上"的格式
            elseif (preg_match('/以上/', $range)) {
                $range_min = (int) explode('以上', $range)[0];  // 最小值

                // 判断最大薪资是否大于等于当前范围的最小值
                if ($max_salary >= $range_min) {
                    $matchingRanges[] = $key;
                }
            }
        }

        return join(',', $matchingRanges);
    }
}

//根据年月计算工作年限的key
if (!function_exists('calculateWorkExperienceKey')){
    function calculateWorkExperienceKey($date) {

        $dateArr = explode('-', $date);
        $startYear = (int)$dateArr[0];
        $startMonth = (int)$dateArr[1];

        $currentYear = date("Y");
        $currentMonth = date("m");
        
        // 计算年数差
        $yearsOfExperience = $currentYear - $startYear;
        
        // 如果当前月份小于开始工作月份，减去一年
        if ($currentMonth < $startMonth) {
            $yearsOfExperience--;
        }
        
        // 根据年数返回相应的 key
        if ($yearsOfExperience < 1) {
            return 1; // 应届毕业生，表示不到1年
        } elseif ($yearsOfExperience == 1) {
            return 2; // 一年
        } elseif ($yearsOfExperience <= 3) {
            return 3; // 1-3年
        } elseif ($yearsOfExperience <= 5) {
            return 4; // 3-5年
        } elseif ($yearsOfExperience <= 8) {
            return 5; // 5-8年
        } else {
            return 6; // 8年以上
        }
    }
}

/**
 * 根据目标值和数字列表，找到最接近目标值的组合，用于线上订单业绩设置
 * $numbers = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];
 * 对应的业务：名企会员、认证会员、简历套餐、招聘推广金、职位推荐、超级推荐、职位刷新、职位发布、面试短信、招聘会报名
 * $target = 488;
 * return array(8,32,64,128,256)
*/
if (!function_exists('findCombination')){
    function findCombination($target, $numbers) {
        rsort($numbers); // 从大到小排序
        $result = [];

        foreach ($numbers as $number) {
            if ($target >= $number) {
                $result[] = $number;
                $target -= $number;
            }

            if ($target == 0) {
                break;
            }
        }

        // 如果最后目标值未能减到0，说明无法找到合适的组合
        if ($target != 0) {
            return "No combination found";
        }
        
        sort($result);  //从小到大排序

        return $result;
    }
}

//更新企业信息（职位数量、福利）
if (!function_exists('updateZhaopinCompanyInfo')){
    function updateZhaopinCompanyInfo($cid = 0){
        global $dsql;

        if(!$cid) return;

        //查询公司的所有职位数量
        $sql = $dsql->SetQuery("SELECT COUNT(*) totalCount FROM `#@__zhaopin_post` WHERE `status` = 2 AND `del` = 0 AND `waitPay` = 0 AND `close` = 1 AND `cid` = $cid");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret && is_array($ret)){
            $totalCount = (int)$ret[0]['totalCount'];

            //更新公司职位数量
            $sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `postCount` = $totalCount WHERE `id` = $cid");
            $dsql->dsqlOper($sql, "update");

        }

        //查询公司所有职位的福利
        $welfare = array();
        $sql = $dsql->SetQuery("SELECT `welfare` FROM `#@__zhaopin_post` WHERE `status` = 2 AND `del` = 0 AND `waitPay` = 0 AND `close` = 1 AND `cid` = $cid");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret && is_array($ret)){
            foreach($ret as $key => $value){
                $welfare = array_merge($welfare, explode(',', $value['welfare']));
            }
        }

        //去重
        $welfare = array_values(array_unique($welfare));
        $welfare = join(',', $welfare);

        //更新公司福利内容
        $sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `welfare` = '$welfare' WHERE `id` = $cid");
        $dsql->dsqlOper($sql, "update");
    }
}

//更新职位浏览量
if (!function_exists('updatePostClick')){
    function updatePostClick($id){
        global $dsql;

        $platform = 'pc';
        if(isApp()){
            $platform = 'app';
        }
        elseif(isWxMiniprogram()){
            $platform = 'wxmini';
        }
        elseif(isByteMiniprogram()){
            $platform = 'bytemini';
        }
        elseif(isMobile()){
            $platform = 'h5';
        }
        $platform = 'click_' . $platform;

        $sql = $dsql->SetQuery("UPDATE `#@__zhaopin_post` SET `click_total` = `click_total` + 1, `".$platform."` = `".$platform."` + 1 WHERE `id` = $id");
        $dsql->dsqlOper($sql, "update");
    }
}

//更新职位拉新简历数量
if (!function_exists('updatePostRegResume')){
    function updatePostRegResume($id){
        global $dsql;

        $platform = 'pc';
        if(isApp()){
            $platform = 'app';
        }
        elseif(isWxMiniprogram()){
            $platform = 'wxmini';
        }
        elseif(isByteMiniprogram()){
            $platform = 'bytemini';
        }
        elseif(isMobile()){
            $platform = 'h5';
        }
        $platform = 'regResume_' . $platform;

        $sql = $dsql->SetQuery("UPDATE `#@__zhaopin_post` SET `regResume_total` = `regResume_total` + 1, `".$platform."` = `".$platform."` + 1 WHERE `id` = $id");
        $dsql->dsqlOper($sql, "update");
    }
}

//更新简历完整度
if (!function_exists('updateResumeCompletion')){
    function updateResumeCompletion($id){
        global $dsql;

        //查询简历信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__zhaopin_resume` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $data = $ret[0];

            //初始值为0分
            $completion = 0;

            //姓名 10分
            if($data['name']) $completion += 10;

            //头像 10分
            if($data['pics']) $completion += 10;

            //出生年份 5分
            if($data['birthYear']) $completion += 5;

            //开始工作时间 6分
            if($data['startWork']) $completion += 6;

            //联系电话 10分
            if($data['phone']) $completion += 10;

            //学历 10分
            if($data['education']) $completion += 10;

            //居住地 2分
            if($data['addrname']) $completion += 2;

            //自我描述 2分
            if($data['info']) $completion += 2;

            //期望职位 10分
            if($data['jobType']) $completion += 10;

            //掌握语种 2分
            if($data['exp_language']) $completion += 2;

            //工作经历 10分
            if($data['exp_work']) $completion += 10;

            //项目经历 5分
            if($data['exp_project']) $completion += 5;

            //教育经历 10分
            if($data['exp_education']) $completion += 10;

            //获得证书 3分
            if($data['exp_certificate']) $completion += 3;

            //个人亮点 5分
            if($data['advantage']) $completion += 5;

            $sql = $dsql->SetQuery("UPDATE `#@__zhaopin_resume` SET `completion` = $completion WHERE `id` = $id");
            $dsql->dsqlOper($sql, "update");

        }
    }
}

//更新职位专区的职位数量
//可以指定专区ID或职位ID或公司ID
if (!function_exists('updatePostZoneCount')){
    function updatePostZoneCount($zid = 0, $pid = 0, $cid = 0){
        global $dsql;

        //指定专区ID
        if($zid){
            $sql = $dsql->SetQuery("SELECT COUNT(`id`) FROM `#@__zhaopin_post` WHERE FIND_IN_SET('$zid', `zone`) > 0 AND `category` = 1 AND `del` = 0 AND `status` = 2 AND `waitPay` = 0 AND `close` = 1");
            $totalCount = (int)$dsql->getOne($sql);

            $sql = $dsql->SetQuery("UPDATE `#@__zhaopin_post_zone` SET `postCount` = $totalCount WHERE `id` = $zid");
            $dsql->dsqlOper($sql, "update");
        }

        //指定职位ID
        if($pid){
            updatePostZoneCountByPid($pid);
        }

        //指定公司ID
        if($cid){
            updatePostZoneCountByCid($cid);
        }
    }
}

//更新职位专区的职位数量
if (!function_exists('updatePostZoneCountByPid')){
    function updatePostZoneCountByPid($pid = 0){
        global $dsql;

        if(!$pid) return;

        $sql = $dsql->SetQuery("SELECT `zone` FROM `#@__zhaopin_post` WHERE `id` = $pid");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret && is_array($ret)){
            $zone = $ret[0]['zone'];
            if($zone){
                $zoneArr = explode(',', $zone);
                foreach($zoneArr as $key => $value){
                    updatePostZoneCount($value);
                }
            }
        }
    }
}

//更新职位专区的职位数量
if (!function_exists('updatePostZoneCountByCid')){
    function updatePostZoneCountByCid($cid = 0){
        global $dsql;

        if(!$cid) return;

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__zhaopin_post` WHERE `cid` = $cid");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret && is_array($ret)){
            foreach($ret as $key => $value){
                updatePostZoneCountByPid($value['id']);
            }
        }

    }
}

//添加求职期望数据到订阅表
if (!function_exists('addSubscribeToDB')){
    function addSubscribeToDB($cityid, $userid, $jobType, $salary, $addr){
        global $dsql;
        if($jobType && $userid && $salary){
            $sql = $dsql->SetQuery("SELECT count(`id`) totalCount FROM `#@__zhaopin_subscribe` WHERE `cityid`={$cityid} AND `userid`={$userid}");
            $totalCount = (int)$dsql->getOne($sql);
            $jobTypeArr =  $jobType ? explode(",", $jobType) : array();
            if($jobTypeArr){
                $num = $totalCount + 1;
                foreach($jobTypeArr as $value){
                    if($num > 5){ //限制最多5条数据
                        break;
                    }
                    $data = array(
                        'cityid'=>(int)$cityid,
                        'userid'=>(int)$userid,
                        'typeid'=>(int)$value,
                        'salary'=>(int)$salary,
                        'addr'=>$addr ? (int)$addr : 0
                    );
                    $sql = $dsql->SetQuery("INSERT INTO `#@__zhaopin_subscribe` (".join(', ', array_keys($data)).") VALUES (".join(', ', array_values($data)).")");
    
                    $dsql->dsqlOper($sql, "lastid");
                    $num++;
                }
            }
        }  
    }
}

//获取分站数据，如果没有就获取默认数据，并将默认数据保存到分站
if (!function_exists('getCityData')){
    function getCityData($cityid, $field, $tab, $where = '', $order = '', $issave = 0){
        //判断基本参数是否为空
        if($field == null || $tab == null) {
            return false;
        }

        //后台暂时不提供获取不同分站配置功能，目前只有客服设置有该功能，待其他设置都开通后，再开放
        if(HUONIAOADMIN != '' && !$issave) $cityid = 0;

        $issave = 0;  //目前没有分站功能，暂时不保存，后边做了之后再恢复

        global $dsql;

        //获取分站数据
        $sql = $dsql->SetQuery("SELECT ".$field." FROM `#@__".$tab."` WHERE `cityid` = ".$cityid.$where.$order);
        $result = $dsql->dsqlOper($sql, "results");
        //数据为空，而且cityid不为0，就去取默认数据
        if (($result == null || !is_array($result)) && $cityid != 0) {
            //如果需要保存数据，就把field改为*
            if ($issave == 1) {
                $field = "*";
            }

            $sql = $dsql->SetQuery("SELECT ".$field." FROM `#@__".$tab."` WHERE `cityid` = 0".$where.$order);
            $result = $dsql->dsqlOper($sql, "results");

            //如果默认有数据，而且需要保存数据，就保存数据到分站
            if ($result != null && is_array($result) && $issave == 1) {
                $insertData = $result[0];
                //去掉默认数据的id
                if (isset($insertData['id'])) {
                    unset($insertData['id']);
                }

                //将默认数据的cityid改为当前
                $insertData['cityid'] = $cityid;
                
                //拼接sql语句
                $sql = "INSERT INTO `#@__".$tab."` (";

                //拼接要插入的字段
                foreach ($insertData as $key => $value) {
                    $sql .= " `".$key."`,";
                }

                //去掉最后的,
                $sql = trim($sql,',');
                $sql .= ") VALUES (";

                //拼接要插入的字段的值
                foreach ($insertData as $key => $value) {
                    $sql .= " '".$value."',";
                }
                
                //去掉最后的,
                $sql = trim($sql,',');
                $sql .= ")";

                $sql = $dsql->SetQuery($sql);
                $newid = $dsql->dsqlOper($sql, "lastid");
            }
        }
        
        return $result;
    }
}