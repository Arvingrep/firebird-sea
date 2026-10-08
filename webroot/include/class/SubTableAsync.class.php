<?php

// 分表同步类，只需要 include ，然后直接 run

class SubTableAsync{

    public static function run($base){
        global $dsql;
        $sql = $dsql->SetQuery("SELECT * FROM `#@__site_sub_tablelist` WHERE `service` = '$base'");
        $tabArr = $dsql->dsqlOper($sql, "results");  // 表结构： id | service | table_name | begin_id
        $un = array();
        $un[] = '`#@__'.$base.'`';
        foreach ($tabArr as $v) {
            $un[] = "`".$v['table_name']."`";
        }
        $sql = $dsql->SetQuery("DROP TABLE IF EXISTS `#@__{$base}_all`");
        $res = $dsql->dsqlOper($sql, "update");

        $sql = $dsql->SetQuery("show create table #@__".$base);
        $res = $dsql->dsqlOper($sql, "results");
        $defSql = $res[0]['Create Table'];
        $defSql = str_replace("\r","",$defSql);
        $defSql = str_replace("\n","",$defSql);

        $sql = preg_replace("#AUTO_INCREMENT=([0-9]{1,})[ \r\n\t]{1,}#i", "", $defSql);
        $sql = str_replace($base, $base."_all", $sql);
        $sql = str_replace('ENGINE=MyISAM', 'ENGINE=MRG_MyISAM', $sql);
        $sql .= " INSERT_METHOD=LAST UNION=(".join(",", $un).")";
        $sql = $dsql->SetQuery($sql);
        $res = $dsql->dsqlOper($sql, "update");
        if($res != "ok"){
            return false;
        }else{
            return true;
        }
    }
}
