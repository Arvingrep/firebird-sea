<?php
// 只能手动新窗口执行
if(defined('HUONIAOINC')){
  return;
}
//系统核心配置文件
require_once(dirname(__FILE__).'/../common.inc.php');
$user = $userLogin->getUserID();
?>

<html>
<head>
<title>圈子动态点赞分表同步</title>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8">
</head>
<body>
<h1 style="padding:50px 0;text-align:center;">圈子动态点赞分表同步</h1>

<?php

set_time_limit(0);

class checkArticleTable{
    public static $write = false;
    public function run($page = 1){
        global $dsql;
        global $DB_PREFIX;
        $base = 'circle_fabulous';

        $pageSize = 1;
        $atpage = ($page-1)*$pageSize;



        $sql = $dsql->SetQuery("SELECT * FROM `#@__site_sub_tablelist` WHERE `service` = 'circle_fabulous'");
        $tabArr = $dsql->dsqlOper($sql, "results");
        $totalCount = count($tabArr);
        $totalPage = ceil($totalCount / $pageSize);


        // 更新主表总表关联表
        $sql = $dsql->SetQuery("SELECT * FROM `#@__site_sub_tablelist` WHERE `service` = 'article' ORDER BY `begin_id` LIMIT $atpage, $pageSize");
        $tabs = $dsql->dsqlOper($sql, "results");

        $un = array();

        /* 获取所需sql s */
        // $totalPage = 1;
        // $tabs = [
        //   0 => [
        //     'table_name' => 'huoniao_articlelist'//更新本地主表，分表在注释本段后执行更新
        //   ]
        // ];
        // $base = 'articlelist_new';//新表
        // self::$write = true;
        /* 获取所需sql e */

        foreach ($tabs as $key => $value) {
            $un[] = "`".$value['table_name']."`";

            echo '<center style="padding-top:100px;color:red;" id="progress">正在同步圈子动态点赞分表 '.$value['table_name'].'，请耐心等待 ······</center>';

            // $sql = 'ALTER TABLE `'.$value['table_name'].'` ADD INDEX `click` (`click`, `weight`, `id`) USING BTREE ';
            // $dsql->dsqlOper($sql, "update");
            // continue;
        }
        // return;

        // 先移除默认表的关联，分表较多时耗时较长
        // if(count($tabs) > 10){
        //     $sql = $dsql->SetQuery("DROP TABLE IF EXISTS `#@__articlelist_all`");
        //     $res = $dsql->dsqlOper($sql, "update");

        //     $sql = $dsql->SetQuery("show create table ".$tabs[0]['table_name']);
        //     $res = $dsql->dsqlOper($sql, "results");
        //     $defSql = $res[0]['Create Table'];
        //     $defSql = str_replace("\r","",$defSql);
        //     $defSql = str_replace("\n","",$defSql);

        //     $sql = preg_replace("#AUTO_INCREMENT=([0-9]{1,})[ \r\n\t]{1,}#i", "", $defSql);
        //     $sql = str_replace($tabs[0]['table_name'], $GLOBALS['DB_PREFIX']."articlelist_all", $sql);
        //     $sql = str_replace('ENGINE=MyISAM', 'ENGINE=MRG_MyISAM', $sql);
        //     $sql .= " UNION=(".join(",", $un).")";
        //     $sql = $dsql->SetQuery($sql);
        //     $res = $dsql->dsqlOper($sql, "update");
        // }

        //获取客户网站表结构
        $obj = new siteConfig();
        $websiteData = $obj->getDatabaseStructure();

        $websitePrefix = $websiteData['prefix'];

        $official = array(
            'table' => array('#@__'.$base => $websiteData['table']['#@__'.$base]),
            'field' => array('#@__'.$base => $websiteData['field']['#@__'.$base]),
            'index' => array('#@__'.$base => $websiteData['index']['#@__'.$base]),
        );

        unset($websiteData['table']['#@__'.$base]);

        // print_r($websiteData);die;

        $firstSql = true;
        foreach ($tabs as $k => $v) {

            $thistab = $v['table_name'];

            $fg = "\n\n\n#------------------ {$thistab} start -----------------\n\n\n";
            $this->writeFile($fg);

            $tb = str_replace($GLOBALS['DB_PREFIX'], '#@__', $v['table_name']);

            if(strstr($websiteData['field'][$tb]['flag_h']['Type'], 'tinyint') == false){
              $sql = "update `".$v['table_name']."` set flag_h = 0 where flag_h = ''";
              $dsql->dsqlOper($sql, "update");
              $sql = "update `".$v['table_name']."` set flag_h = 1 where flag_h = 'h'";
              $dsql->dsqlOper($sql, "update");
              $sql = "update `".$v['table_name']."` set flag_r = 0 where flag_r = ''";
              $dsql->dsqlOper($sql, "update");
              $sql = "update `".$v['table_name']."` set flag_r = 1 where flag_r = 'r'";
              $dsql->dsqlOper($sql, "update");
              $sql = "update `".$v['table_name']."` set flag_t = 0 where flag_t = ''";
              $dsql->dsqlOper($sql, "update");
              $sql = "update `".$v['table_name']."` set flag_t = 1 where flag_t = 't'";
              $dsql->dsqlOper($sql, "update");
              $sql = "update `".$v['table_name']."` set flag_b = 0 where flag_b = ''";
              $dsql->dsqlOper($sql, "update");
              $sql = "update `".$v['table_name']."` set flag_b = 1 where flag_b = 'b'";
              $dsql->dsqlOper($sql, "update");
              $sql = "update `".$v['table_name']."` set flag_p = 0 where flag_p = ''";
              $dsql->dsqlOper($sql, "update");
              $sql = "update `".$v['table_name']."` set flag_p = 1 where flag_p = 'p'";
              $dsql->dsqlOper($sql, "update");
            }

            foreach ($websiteData['table'] as $key => $value) {

                if(str_replace('#@__', $DB_PREFIX, $key) == $v['table_name']){

                    $old = array(
                        'table' => array($key => $websiteData['table'][$key]),
                        'field' => array($key => $websiteData['field'][$key]),
                        'index' => array($key => $websiteData['index'][$key]),
                    );
                    // print_r($official);die;
                    $diff = $this->compare_database($official, $old, '#@__'.$base, $key);
                    // print_r($diff);die;
                    if(empty($diff['table']) && empty($diff['field']) && empty($diff['index'])){

                    }else{
                        $sqls = $this->build_query($diff, $websitePrefix);
                        // print_r($sqls);die;
                        foreach ($sqls as $k => $v) {
                            $sql = $dsql->SetQuery($v);

                            $str = $sql.";\n";
                            $this->writeFile($str);
                            $firstSql = false;
                            // echo "<p>{$sql}</p>";

                            
                            $res = $dsql->dsqlOper($sql, 'update');
                            if($res != "ok"){
                                echo "<p style='color:red;'>sql执行失败: {$sql}</p>";
                                die;
                                // die("error");
                            }
                        }
                    }
                    $official_field = array_values($official['field']['#@__'.$base]);
                    $old_field = array_values($old['field'][$key]);
                    $sqls = array();
                    foreach ($official_field as $k => $value) {
                        if($old_field[$k]['Field'] != $value['Field']){

                            $istop = $k == 0 ? ' FIRST' : ' AFTER `'.$official_field[$k - 1]['Field'].'`';
                            $sqls[] = "ALTER TABLE `".$key."` MODIFY COLUMN `".$value['Field']."` " . strtoupper($value['Type']) . $this->sqlcol($value['Collation']) . $this->sqlnull($value['Null']) . $this->sqldefault($value['Default']) . $this->sqlextra($value['Extra']) . $this->sqlcomment($value['Comment']) . $istop;
                        }
                    }
                    if($sqls){
                        foreach ($sqls as $k => $v) {
                          $sql = $dsql->SetQuery($v);

                          $str = $sql.";\n";
                          $this->writeFile($str);
                          $firstSql = false;
                          
                          // echo "<p>{$sql}</p>";
                          $res = $dsql->dsqlOper($sql, 'update');
                          if($res != "ok"){
                              echo "<p style='color:red;'>sql执行失败: {$sql}</p>";
                              die;
                              // die("error");
                          }
                        }
                    }
                    break;
                }

            }

            $fg = "\n\n\n#------------------ {$thistab} end -----------------\n\n\n";
            $this->writeFile($fg);
        }


        if($page == $totalPage || $totalPage == 0){
            $un = array();
            $un[] = '`#@__'.$base.'`';
            foreach ($tabArr as $k => $v) {
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
            $sql .= " UNION=(".join(",", $un).")";
            $sql = $dsql->SetQuery($sql);
            $res = $dsql->dsqlOper($sql, "update");
            if($res != "ok"){
              echo "<p>创建圈子动态总表失败: {$sql}</p>";
              die;
            }
        }

        if($page < $totalPage){
            echo '<script>location.href="?page='.++$page.'"</script>';
        }else{
            DropCookie('confirm_sync');
            echo '<center style="padding-top:100px;color:red;">同步已完成&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:;" onclick="window.close();">关闭页面</a></center>';
            echo '<script>document.getElementById("progress").style="display:none;"</script>';
        }
    }
    public function compare_database($new, $old, $orig_table, $fb_table){
        $diff = array('table' => array(), 'field' => array(), 'index' => array());

        foreach ($new['table'] as $table_name => $table_detail) {
            // if(strstr($table_name, 'site_plugins_')) continue;
            // if(!checkInArray($table_name)) continue;

            // if (!isset($old['table'][$table_name])) {
            //   //新建表
            //   $diff['table']['create'][$table_name] = $table_detail;
            //   $diff['field']['create'][$table_name] = $new['field'][$table_name];
            //   $diff['index']['create'][$table_name] = $new['index'][$table_name];
            // } else {

            // }
            //对比表
            $old_detail = $old['table'][$fb_table];
            $change = array();
            if ($table_detail['Engine'] !== $old_detail['Engine'])
            $change['Engine'] = $table_detail['Engine'];
            if ($table_detail['Row_format'] !== $old_detail['Row_format'])
            $change['Row_format'] = $table_detail['Row_format'];
            if ($table_detail['Collation'] !== $old_detail['Collation'])
            $change['Collation'] = $table_detail['Collation'];
            //if($table_detail['Create_options']!=$old_detail['Create_options'])
            //    $change['Create_options']=$table_detail['Create_options'];
            if ($table_detail['Comment'] !== $old_detail['Comment'])
            $change['Comment'] = $table_detail['Comment'];
            if (!empty($change))
            $diff['table']['change'][$fb_table] = $change;

        }

        //fields
        foreach ($old['field'] as $table => $fields) {
            // if(strstr($table, 'site_plugins_')) continue;
            // if(!checkInArray($table)) continue;
            if (isset($new['field'][$orig_table])) {
              $new_fields = $new['field'][$orig_table];
              foreach ($fields as $field_name => $field_detail) {
                if (!isset($new_fields[$field_name])) {
                  //字段不存在，删除字段
                  $diff['field']['drop'][$table][$field_name] = $field_detail;
                }
              }
            } else {
              //旧数据库中的表在新数据库中不存在，需要删除
            }
        }
        foreach ($new['field'] as $table => $fields) {
            // if(strstr($table, 'site_plugins_')) continue;
            // if(!checkInArray($table)) continue;
            if (isset($old['field'][$fb_table])) {
              $old_fields = $old['field'][$fb_table];
              $last_field = '';
              foreach ($fields as $field_name => $field_detail) {
                if (isset($old_fields[$field_name])) {
                  //字段存在，对比内容
                  if ($field_detail['Type'] !== $old_fields[$field_name]['Type'] || $field_detail['Collation'] !== $old_fields[$field_name]['Collation'] || $field_detail['Null'] !== $old_fields[$field_name]['Null'] || $field_detail['Default'] !== $old_fields[$field_name]['Default'] || $field_detail['Extra'] !== $old_fields[$field_name]['Extra'] || $field_detail['Comment'] !== $old_fields[$field_name]['Comment']) {
                      $diff['field']['change'][$fb_table][$field_name] = $field_detail;
                  }
                } else {
                  //字段不存在，添加字段
                  $field_detail['After'] = $last_field;
                  $diff['field']['add'][$fb_table][$field_name] = $field_detail;
                }
                $last_field = $field_name;
              }
            } else {
                //新数据库中的表在旧数据库中不存在，需要新建
            }
          }

          $change = false;
          foreach ($new['index'] as $table => $indexs) {
              if (isset($old['index'][$fb_table])) {
                $old_indexs = $old['index'][$fb_table];

                // 遍历主表索引
                $k = 0;
                foreach ($indexs as $index_name => $index_detail) {

                  $n = 0;
                  // print_r($indexs);
                  // print_r($old_indexs);
                  // echo "<br>";
                  // echo count($indexs)."<br>".count($old_indexs);die;
                  foreach ($old_indexs as $old_index_name => $old_index_detail) {
                      // 保证顺序一致
                      if($k == $n){
                          // 名称不一致删除
                          if($old_index_name != $index_name){
                              $change = true;
                              break;
                          }
                          //存在，对比内容
                          if ($index_detail['Non_unique'] !== $old_index_detail['Non_unique'] || $index_detail['Column_name'] !== $old_index_detail['Column_name'] || $index_detail['Collation'] !== $old_index_detail['Collation'] || $index_detail['Index_type'] !== $old_index_detail['Index_type']) {
                              $change = true;
                              break;
                          }
                      }

                      $n++;
                  }
                  if($change) break;
                  // 不存在，新建索引
                  if($k+1 > count($old_indexs)){
                    $diff['index']['add'][$fb_table][$index_name] = $index_detail;
                  }
                  $k++;
                }
              }
          }
          // 重建索引
          if($change){
              // 第一步：删除
              foreach ($old['index'] as $table => $indexs) {
                  foreach ($indexs as $index_name => $index_detail) {
                      if($index_name != 'PRIMARY'){
                          $diff['index']['drop'][$table][$index_name] = $index_name;
                      }
                  }
              }
              // 第二部：重建
              foreach ($new['index'] as $table => $indexs) {
                  foreach ($indexs as $index_name => $index_detail) {
                      if($index_name != 'PRIMARY'){
                          $diff['index']['add'][$fb_table][$index_name] = $index_detail;
                      }
                  }
              }
          }

          return $diff;
        }


        public function build_query($diff, $prefix){
            $sqls = array();
            if ($diff) {
                if (isset($diff['table']['drop'])) {
                    foreach ($diff['table']['drop'] as $table_name => $table_detail) {
                        $table_name = str_replace('#@__', $prefix, $table_name);
                        $sqls[] = "DROP TABLE `{$table_name}`";
                    }
                }
                if (isset($diff['table']['create'])) {
                    foreach ($diff['table']['create'] as $table_name => $table_detail) {
                        $fields = $diff['field']['create'][$table_name];
                        $table_name_ = str_replace('#@__', $prefix, $table_name);
                        $sql = "CREATE TABLE `$table_name_` (";
                        $t = array();
                        $k = array();
                        foreach ($fields as $field) {
                            $t[] = "`{$field['Field']}` " . strtoupper($field['Type']) . $this->sqlnull($field['Null']) . $this->sqldefault($field['Default']) . $this->sqlextra($field['Extra']) . $this->sqlcomment($field['Comment']);
                        }
                        if (isset($diff['index']['create'][$table_name]) && !empty($diff['index']['create'][$table_name])) {
                            $indexs = $diff['index']['create'][$table_name];
                            foreach ($indexs as $index_name => $index_detail) {
                                if ($index_name == 'PRIMARY')
                                    $k[] = "PRIMARY KEY (`" . implode('`,`', $index_detail['Column_name']) . "`)";
                                else
                                    $k[] = ($index_detail['Non_unique'] == 0 ? "KEY" : "INDEX") . " `$index_name`" . " (`" . implode('`,`', $index_detail['Column_name']) . "`)";
                            }
                        }
                        list($charset) = explode('_', $table_detail['Collation']);
                        $sql .= implode(', ', $t) . (!empty($k) ? ',' . implode(', ', $k) : '') . ') ENGINE = ' . $table_detail['Engine'] . ' DEFAULT CHARSET = ' . $charset . ' COMMENT = \'' . $table_detail['Comment'] . '\'';
                        $sqls[] = $sql;
                    }
                }
                if (isset($diff['table']['change'])) {
                    foreach ($diff['table']['change'] as $table_name => $table_changes) {
                        $table_name = str_replace('#@__', $prefix, $table_name);
                        if (!empty($table_changes)) {
                            $sql = "ALTER TABLE `$table_name`";
                            foreach ($table_changes as $option => $value) {
                                if ($option == 'Collation') {
                                    list($charset) = explode('_', $value);
                                    $sql .= " DEFAULT CHARACTER SET $charset COLLATE $value";
                                } else{
                                    if(strtoupper($option) == 'COMMENT'){
                                      $sql .= " " . strtoupper($option) . " = '$value' ";
                                    }else{
                                      $sql .= " " . strtoupper($option) . " = $value ";
                                    }
                                }
                            }
                            $sqls[] = $sql;
                        }
                    }
                }
                if (isset($diff['index']['drop'])) {
                    foreach ($diff['index']['drop'] as $table_name => $indexs) {
                        $table_name = str_replace('#@__', $prefix, $table_name);
                        foreach ($indexs as $index_name => $index_detail) {
                            if ($index_name == 'PRIMARY')
                                $sqls[] = "ALTER TABLE `$table_name` DROP PRIMARY KEY";
                            else
                                $sqls[] = "ALTER TABLE `$table_name` DROP INDEX `$index_name`";
                        }
                    }
                }
                if (isset($diff['field']['drop'])) {
                    foreach ($diff['field']['drop'] as $table_name => $fields) {
                        $table_name = str_replace('#@__', $prefix, $table_name);
                        foreach ($fields as $field_name => $field_detail) {
                            $sqls[] = "ALTER TABLE `$table_name` DROP `$field_name`";
                        }
                    }
                }
                if (isset($diff['field']['add'])) {
                    foreach ($diff['field']['add'] as $table_name => $fields) {
                        $table_name = str_replace('#@__', $prefix, $table_name);
                        foreach ($fields as $field_name => $field_detail) {
                            $sqls[] = "ALTER TABLE `$table_name` ADD `{$field_name}` " . strtoupper($field_detail['Type']) . $this->sqlcol($field_detail['Collation']) . $this->sqlnull($field_detail['Null']) . $this->sqldefault($field_detail['Default']) . $this->sqlextra($field_detail['Extra']) . $this->sqlcomment($field_detail['Comment']) . " AFTER `{$field_detail['After']}`";
                        }
                    }
                }
                if (isset($diff['index']['add'])) {
                    foreach ($diff['index']['add'] as $table_name => $indexs) {
                        $table_name = str_replace('#@__', $prefix, $table_name);
                        foreach ($indexs as $index_name => $index_detail) {
                            if ($index_name == 'PRIMARY')
                                $sqls[] = "ALTER TABLE `$table_name` ADD PRIMARY KEY (`" . implode('`,`', $index_detail['Column_name']) . "`)";
                            else
                                $sqls[] = "ALTER TABLE `$table_name` ADD" . ($index_detail['Non_unique'] == 0 ? " INDEX " : " INDEX ") . "`$index_name`" . " (`" . implode('`,`', $index_detail['Column_name']) . "`)";
                        }
                    }
                }
                if (isset($diff['field']['change'])) {
                    foreach ($diff['field']['change'] as $table_name => $fields) {
                        $table_name = str_replace('#@__', $prefix, $table_name);
                        foreach ($fields as $field_name => $field_detail) {
                            $sqls[] = "ALTER TABLE `$table_name` CHANGE `{$field_name}` `{$field_name}` " . $field_detail['Type'] . $this->sqlcol($field_detail['Collation']) . $this->sqlnull($field_detail['Null']) . $this->sqldefault($field_detail['Default']) . $this->sqlextra($field_detail['Extra']) . $this->sqlcomment($field_detail['Comment']);
                        }
                    }
                }
            }

            return $sqls;
        }

        public function sqlkey($val){
          switch ($val) {
              case 'PRI':
                  return ' PRIMARY';
              case 'UNI':
                  return ' UNIQUE';
              case 'MUL':
                  return ' INDEX';
              default:
                  return '';
          }
        }

        public function sqlcol($val){
            switch ($val) {
                case null:
                    return '';
                default:
                    list($charset) = explode('_', $val);
                    return ' CHARACTER SET ' . $charset . ' COLLATE ' . $val;
            }
        }

        public function sqldefault($val){
            if($val===null){
                return '';
            }else{
                return " DEFAULT '" . stripslashes($val) . "'";
            }
        }

        public function sqlnull($val){
            switch ($val) {
                case 'NO':
                    return ' NOT NULL';
                case 'YES':
                    return ' NULL';
                default:
                    return '';
            }
        }

        public function sqlextra($val){
            switch ($val) {
                case '':
                    return '';
                default:
                    return ' ' . strtoupper($val);
            }
        }

        public function sqlcomment($val){
            switch ($val) {
                case '':
                    return '';
                default:
                    return " COMMENT '" . stripslashes($val) . "'";
            }
        }

        public function writeFile($str = ""){
          if(self::$write){
            $file = HUONIAOROOT.'/article_sync_table_sql.txt';
            file_put_contents($file, $str, FILE_APPEND);
          }
        }

}


if($user > 0){
  $check = GetCookie('confirm_sync');
  if($check || isset($_GET['confirm'])){
      PutCookie('confirm_sync', 1, 600);
  }
  if(!$check && !isset($_GET['confirm'])){
    $sql = $dsql->SetQuery("SELECT COUNT(*) total FROM `#@__site_sub_tablelist` WHERE `service` = 'article'");
    $res = $dsql->dsqlOper($sql, "results");
    $count = $res[0]['total'];
    // if(!$count){
    //   echo '<center style="padding-top:100px;color:red;">当前没有分表，无需此操作</center>';
    //   echo '<script>setTimeout(function(){window.close();}, 3000)</script>';
    //   die;
    // }

    echo '<center style="padding-top:30px;color:red;">当前分表数为'.$count.'个'.($count == 0 ? '，如果您第一次进行进入此页面，即使没有分表也应该进行此操作！' : '').'<br><br><a href="?confirm=1">开始</a></center>';

  }else{

    $page = $_GET['page'] ? $_GET['page'] : 1;
    $obj = new checkArticleTable();
    $obj->run($page);
  }
}else{
  echo '<script>location.href = "/";</script>';
}
?>

</body>
</html>