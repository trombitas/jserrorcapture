<?php
	error_reporting(E_ERROR | E_WARNING);
    header('content-type: application/json; charset=utf-8');
	include_once 'util/Mysql.php';
	
	$mysql = new Mysql();
	$mysql->dbConnect();
	
	$nr = mysql_num_rows(mysql_query("select id from errors where displayed='0'"));
	if($nr or $_POST['firstcall'] == 'true') {
		$query = mysql_query("select E.ID as id, E.MESSAGE as message, E.FILE_NAME as file_name, E.LINE_NUMBER as line_number, E.COL_NUMBER as col_number, E.TIME as time, E.LANG as lang, E.formatJson as formatJson, E.formatXml as formatXml,
									 B_L.BROWSER_NAME as browser_name, B_L.BROWSER_VERSION as browser_version, 
									 os.OS_NAME as os_name, os.OS_VERSION as os_version, 
									 R.WIDTH as width, R.HEIGHT as height,
									 E_T.ERROR_TYPE_NAME as error_type_name,
									 B_O.ORIENTATION_TYPE as orientation_type
							 from errors as E
							 left join browsers as B_L on B_L.ID = E.BROWSER_ID
							 left join os on os.ID = E.OS_ID
							 left join resolutions as R on R.ID = E.RESOLUTION_ID
							 left join error_types as E_T on E_T.ID = E.ERROR_TYPE_ID
							 left join browser_orientations as B_O on B_O.ID = E.BROWSER_ID
							 order by id desc") or die (mysql_error());
		
		$json = array();
		
		while($data = mysql_fetch_assoc($query)) {
			array_push($json, $data);
		}
		
		$mysql->query("update errors set displayed='1'");
		
		echo json_encode($json);
	}
?>