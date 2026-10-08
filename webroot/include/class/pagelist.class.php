<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 分页类
 *
 * @version        $Id: pagelist.class.php 2014-11-12 下午15:21:18 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class pagelist{
    public     $first_row;        //起始行数
    public     $list_rows;        //列表每页显示行数
    protected  $total_pages;      //总页数
    protected  $total_rows;       //总行数
    protected  $now_page;         //当前页数
    protected  $method  = 'defalut'; //处理情况 Ajax分页 Html分页(静态化时) 普通get方式
    protected  $parameter = '';
    protected  $page_name;        //分页参数的名称
    protected  $ajax_func_name;
    public     $plus = 2;         //分页偏移量
    protected  $url;


    /**
     * 构造函数
     * @param unknown_type $data
     */
    public function __construct($data = array()){
        $this->total_rows = $data['total_rows'];

        $this->parameter         = !empty($data['parameter']) ? $data['parameter'] : '';
        $this->list_rows         = !empty($data['list_rows']) ? $data['list_rows'] : 10;
        $this->total_pages       = ceil($this->total_rows / $this->list_rows);
        $this->page_name         = !empty($data['page_name']) ? $data['page_name'] : 'p';
        $this->ajax_func_name    = !empty($data['ajax_func_name']) ? $data['ajax_func_name'] : '';

        $this->method            = !empty($data['method']) ? $data['method'] : '';


        /* 当前页面 */
        if(!empty($data['now_page'])){
            $this->now_page = intval($data['now_page']);
        }else{
            $this->now_page   = !empty($_GET[$this->page_name]) ? intval($_GET[$this->page_name]):1;
        }
        $this->now_page   = $this->now_page <= 0 ? 1 : $this->now_page;

        if(!empty($this->total_pages) && $this->now_page > $this->total_pages){
            $this->now_page = $this->total_pages;
        }
        $this->first_row = $this->list_rows * ($this->now_page - 1);
    }

    /**
     * 得到当前连接
     * @param $page
     * @param $text
     * @return string
     */
    protected function _get_link($page,$text){
        switch ($this->method) {
            case 'ajax':
                $parameter = '';
                if($this->parameter){
                    $parameter = ','.$this->parameter;
                }
                return '<li><a onclick="' . $this->ajax_func_name . '(\'' . $page . '\''.$parameter.')" href="javascript:void(0)">' . $text . '</a></li>' . "\n";
            break;

            case 'html':
                $url = str_replace('#page#', $page, $this->parameter);
                return '<li><a href="' .$url . '">' . $text . '</a></li>' . "\n";
            break;

            default:
                return '<li><a href="' . $this->_get_url($page) . '">' . $text . '</a></li>' . "\n";
            break;
        }
    }


    /**
     * 设置当前页面链接
     */
    protected function _set_url(){
        $url  =  $_SERVER['REQUEST_URI'].(strpos($_SERVER['REQUEST_URI'],'?')?'':"?").$this->parameter;
        $parse = parse_url($url);
        if(isset($parse['query'])){
            parse_str($parse['query'],$params);
            unset($params[$this->page_name]);
            $url   =  $parse['path'].'?'.http_build_query($params);
        }
        if(!empty($params)){
            $url .= '&';
        }
        $this->url = $url;
    }

    /**
     * 得到$page的url
     * @param $page 页面
     * @return string
     */
    protected function _get_url($page){
        if($this->url === NULL){
            $this->_set_url();
        }
        return $this->url . $this->page_name . '=' . $page;
    }


    /**
     * 得到第一页
     * @return string
     */
    public function first_page($name = '第一页'){
        if($this->now_page > 1){
            return $this->_get_link('1', $name);
        }else{
            return '<li class="page_disabled"><span>'.$name.'</span></li>' . "\n";
        }
        return '';
    }

    /**
     * 最后一页
     * @param $name
     * @return string
     */
    public function last_page($name = '最后一页'){
        if($this->now_page < $this->total_pages){
            return $this->_get_link($this->total_pages, $name);
        }else{
            return '<li class="page_disabled"><span>'.$name.'</span></li>' . "\n";
        }
        return '';
    }

    /**
     * 上一页
     * @return string
     */
    public function up_page($name = '上一页'){
        if($this->now_page != 1){
            return $this->_get_link($this->now_page - 1, $name);
        }else{
            return '<li class="page_disabled"><span>'.$name.'</span></li>' . "\n";
        }
        return '';
    }

    /**
     * 下一页
     * @return string
     */
    public function down_page($name = '下一页'){
        if($this->now_page < $this->total_pages){
            return $this->_get_link($this->now_page + 1, $name);
        }else{
            return '<li class="page_disabled"><span>'.$name.'</span></li>' . "\n";
        }
        return '';
    }

    /**
     * 分页样式输出
     * @param $param
     * @return string
     */
    public function show($param = 1){
        if($this->total_rows < 1){
            return '';
        }

        if($this->total_pages != 1){
            $return = '';

            $return .= '<div class="pagination"><div class="inner">';
            $return .= '<ul>';
            //$return .= $this->first_page();
            $return .= $this->up_page();
            for($i = 1;$i<=$this->total_pages;$i++){
                if($i == $this->now_page){
                    $return .= "<li class='page_current'><span>$i</span></li>\n";
                }else{
                    if($this->now_page-$i>=3 && $i != 1){
                        $return .="<li class='page_more'><span>...</span></li>\n";
                        $i = $this->now_page-2;
                    }else{
                        if($i >= $this->now_page+3 && $i != $this->total_pages){
                            $return .="<li class='page_more'><span>...</span></li>\n";
                            $i = $this->total_pages;
                        }
                        $return .= $this->_get_link($i, $i) . "\n";
                    }
                }
            }
            $return .= $this->down_page();
            //$return .= $this->last_page();
            $return .= '</ul>';

            $return .= '<div class="page_info">共' .$this->total_rows. '条</div>';
            $return .= '</div></div>';
            return $return;
        }
    }

}
