<?php

	try {
		var $x = 1;
	} catch (Exception $e) {
		print 'Caught exception: ',  $e->getMessage(), "\n";
	}

?>