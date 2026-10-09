<?php

class house_zu{
    // 执行方法
    public function read($tid){
        global $dsql;
        // 遍历所有，把click内容随机增加数字
        $sql = $dsql->SetQuery("select * from `#@__site_plugins_18_read` where `id`=$tid");
        $res = $dsql->dsqlOper($sql,"results");
        $limit   = $res[0]['limit'];  // 限制天数
        $limit_time = time()-86400*$limit;
        $minRand = $res[0]['minRand'];
        $maxRand = $res[0]['maxRand'];
        $cur = $maxRand-$minRand;
        $sql = $dsql->SetQuery("update `#@__house_zu` set click=click+ceil($minRand+rand()*$cur) where `state`=1 and `pubdate`>$limit_time");
//        die($sql);
        $res = $dsql->dsqlOper($sql,"update");
        // 执行成功
        if($res=="ok"){
            $result = 1;
        }
        // 执行失败
        else{
            $result = 0;
        }
        return $result;
    }
}