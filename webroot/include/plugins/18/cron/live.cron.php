<?php

class live{
    public function dianzan($tid){

        global $dsql;
        $result = 1;
        // 1. 查询任务详情
        $sql = $dsql->SetQuery("select * from `#@__site_plugins_18_dianzan` where `id`=$tid");
        $res = $dsql->dsqlOper($sql, "results");
        if(!is_array($res)){
            $res = array();
        }
        $limit = $res[0]['limit'];  // 限制天数
        $minRand = $res[0]['minRand'];
        $maxRand = $res[0]['maxRand'];

        // 2.取出所有符合条件的信息记录（发布时间、审核状态）
        $limit_time = time() - ($limit * 86400);
        $sql_a = $dsql->SetQuery("select id,user 'admin' from `#@__livelist` where `arcrank`=1 and `pubdate`>$limit_time");
        $res_a = $dsql->dsqlOper($sql_a, "results");
        if(!is_array($res_a)){
            $res_a = array();
        }
        // 3.取出所有的机器人id
        $sql_robot = $dsql->SetQuery("select id from `#@__member` where `robot`=1");
        $res_robot = $dsql->dsqlOper($sql_robot, "results");
        if(!is_array($res_robot)){
            $res_robot = array();
        }
        $all_robots = count($res_robot);
        if($all_robots<1){  // 可用机器人为0个，直接返回
            return $result;
        }
        // 4.遍历信息处理，对每一条信息增加点赞
        foreach ($res_a as $k => $v) {
            // 4.1 随机取出n个机器人，也就是尝试插入n条记录（实际插入的记录<=随机值）
            $randNum = rand($minRand, $maxRand);
            $robots = array();
            $robot_rand_max = count($res_robot)-1;
            for ($i = 0; $i < $randNum; $i++) {
                $rand_robot_index = rand(0, $robot_rand_max);  // 随机取得一个下标
                $robots[$i] = $res_robot[$rand_robot_index]['id'];  // 取得一个随机ID
                // 交换，保证取得的随机机器人不重复
                $t = $res_robot[$rand_robot_index];
                $res_robot[$rand_robot_index] = $res_robot[$robot_rand_max];
                $res_robot[$robot_rand_max] = $t;
                $robot_rand_max--;
                if($robot_rand_max<0){  // 可用机器人比用户预设点赞值要高，强制退出
                    $randNum = $all_robots;  // 缩减rand值为实际机器人数量
                    break;
                }
            }
            // 4.2 查询sql取出当前已对该记录点赞的机器人们
            $checkRobot_sql = $dsql->SetQuery("select ruid from `#@__public_up_all` where `tid`=" . $v['id'] . " and ruid in(");
            for ($i = 0; $i < $randNum; $i++) {
                $checkRobot_sql .= $robots[$i];
                if ($i < $randNum - 1) {
                    $checkRobot_sql .= ",";
                }
            }
            $checkRobot_sql .= ")";
            $al_in_res = $dsql->dsqlOper($checkRobot_sql, "results");
            if(!is_array($al_in_res)){
                $al_in_res = array();
            }
            $robots_in = array();
            for ($i = 0; $i < count($al_in_res); $i++) {
                $robots_in[] = $al_in_res[$i]['ruid'];
            }
            // 4.3 对随机机器人筛选，排除已经点过赞的
            $robots_nin = array();
            for ($i = 0; $i < count($robots); $i++) {
                if (!in_array($robots[$i], $robots_in)) {
                    $robots_nin[] = $robots[$i];
                }
            }
            // 4.4 机器人开始点赞
            $robots_nin_length = count($robots_nin);
            if($robots_nin_length>0){  // 机器人数据必须大于0才执行
                $where_public_sql = $dsql->SetQuery("INSERT INTO `#@__public_up_all` (`uid`, `tid`, `ruid`, `module`, `action`, `puctime`, `type`) VALUES ");
                $uid = $v['admin'];
                $tid = $v['id'];
                $time = time();
                for ($i = 0; $i < $robots_nin_length; $i++) {
                    // 处理public sql
                    $ruid = $robots_nin[$i];
                    $where_public_sql .= "(";
                    $where_public_sql .= $uid . ",";
                    $where_public_sql .= $tid . ",";
                    $where_public_sql .= $ruid . ",";
                    $where_public_sql .= "'live',";
                    $where_public_sql .= "'detail',";
                    $where_public_sql .= $time . ",";
                    $where_public_sql .= "0";
                    $where_public_sql .= ")";
                    if ($i < $robots_nin_length - 1) {
                        $where_public_sql .= ",";
                    }
                }
                $res_up = $dsql->dsqlOper($where_public_sql, "lastid",null,"public_up");
                if (!is_numeric($res_up)) {  // 插入public_up失败
                    $result = 0;
                }
            }
        }
        return $result;
    }
}