<?php 
    header('content-type: application/json; charset=utf-8');

    echo isset($_GET['callback'])
        ? "{$_GET['callback']}(null)"
        : null;
?>