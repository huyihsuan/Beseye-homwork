<?php
/*
Plugin Name: read data from homework
Description: 抓homeworkDB資料
Version: 0.1
Author: huyihsuan
License: GPL2
*/

function prefix_get_endpoint_phrase( $request_data ){

    global $wpdb;
    $parameters = $request_data->get_params();
    $page =  (int) $parameters['page'];
    $orderBy =  $parameters['orderBy'];
    $direction =  $parameters['direction'];
    $filter =  $parameters['filter'];
    $whereString = "WHERE 1 = 1";

    if (!empty($filter )){
      $whereString = "
      WHERE max_time.user_tracker_id   LIKE '%" . $filter . "%'" . "
      OR min_time.area_id LIKE '%" . $filter . "%'" . "
      OR max_time.area_id LIKE '%" . $filter . "%'" . "
      OR min_time.date LIKE '%" . $filter . "%'" . "
      OR min_time.time LIKE '%" . $filter . "%'" . "
      OR max_time.time LIKE '%" . $filter . "%'";
    };

    $skipCount =  ($page - 1) * 30 ;
    $sql = "
    SELECT 
      max_time.user_tracker_id                  user_id,
      min_time.area_id                          first_area_of_the_day,
      CONCAT(min_time.date, ' ', min_time.time) first_area_timestamp,
      max_time.area_id                          last_area_of_the_day,
      CONCAT(max_time.date, ' ', max_time.time) last_area_timestamp,
      min_time.snapshot
    FROM (
      SELECT
        user_tracker_id,
        cam_id,
        area_id,
        SUBSTRING(timestamp, 1, 10) AS date,
        MAX(SUBSTRING(timestamp, 12, 8)) AS time
      FROM home_work
      GROUP BY user_tracker_id,date
    ) AS max_time
    LEFT JOIN (
      SELECT
        user_tracker_id,
        cam_id,
        area_id,
        SUBSTRING(timestamp, 1, 10) AS date,
        MIN(SUBSTRING(timestamp, 12, 8)) AS time,
        snapshot
      FROM home_work
      GROUP BY user_tracker_id,date
      ) AS min_time
      ON max_time.user_tracker_id = min_time.user_tracker_id AND max_time.date = min_time.date " .  $whereString . "
    ORDER BY " . $orderBy . " "  . $direction . "
    LIMIT " . $skipCount . ",30";
    
    $data = $wpdb->get_results($sql);
    echo json_encode($data);
}

function prefix_register_example_routes() {
    register_rest_route( 'homework', 'query', array(
        'methods'  => 'POST',
        'callback' => 'prefix_get_endpoint_phrase',
    ) );
}
 
add_action( 'rest_api_init', 'prefix_register_example_routes' );

?>